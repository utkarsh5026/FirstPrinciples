# Implementing Cancellable Operations in Node.js

I'll explain how to implement cancellable operations in Node.js from first principles, focusing on the conceptual foundations before moving to practical implementations.

## Understanding Asynchronous Operations

To understand cancellable operations, we first need to understand how asynchronous operations work in Node.js.

> In synchronous programming, operations happen one after another. Each operation must wait for the previous one to complete. In asynchronous programming, operations can run independently, allowing the program to continue execution without waiting for the operation to finish.

Node.js is built around an event-driven, non-blocking I/O model. This means that when Node.js performs operations like reading files, making network requests, or querying databases, it doesn't wait for these operations to complete before moving on. Instead, it registers callbacks that will be executed when the operations finish.

Let's start with a simple example of an asynchronous operation:

```javascript
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    // Simulating a network request
    setTimeout(() => {
      const userData = { id: userId, name: 'John Doe' };
      resolve(userData);
    }, 2000); // 2 seconds delay
  });
}

// Using the function
fetchUserData(123)
  .then(data => console.log('User data:', data))
  .catch(error => console.error('Error:', error));

console.log('Fetching user data...');
```

In this example, `fetchUserData` returns a Promise that resolves after 2 seconds. The function doesn't block the execution of the code, so "Fetching user data..." will be logged immediately, followed by "User data: {id: 123, name: 'John Doe'}" after 2 seconds.

## The Need for Cancellation

But what if we want to cancel this operation? Maybe the user navigated away from the page, or we received newer data that made this request obsolete.

> Cancellation is the ability to stop an ongoing asynchronous operation before it completes, freeing up resources and preventing unnecessary work.

In many scenarios, cancelling operations is crucial:

* Avoiding unnecessary network requests
* Stopping long-running computations
* Preventing race conditions
* Managing resources efficiently
* Improving user experience

## Cancellation Approaches in Node.js

Now, let's explore different approaches to implementing cancellable operations in Node.js.

### 1. Cancellation with Promises

JavaScript Promises, by themselves, don't directly support cancellation. Once a Promise is created, it will eventually settle (either resolve or reject). However, we can implement cancellation patterns around Promises.

#### Using a Cancellation Token

A simple approach is to use a cancellation token:

```javascript
function fetchUserDataWithCancellation(userId, cancellationToken) {
  return new Promise((resolve, reject) => {
    // Check if already cancelled
    if (cancellationToken.cancelled) {
      return reject(new Error('Operation cancelled'));
    }
  
    const timeoutId = setTimeout(() => {
      const userData = { id: userId, name: 'John Doe' };
      resolve(userData);
    }, 2000);
  
    // Register a cancel handler
    cancellationToken.onCancel(() => {
      clearTimeout(timeoutId);
      reject(new Error('Operation cancelled'));
    });
  });
}

// Creating a cancellation token
const createCancellationToken = () => {
  const token = {
    cancelled: false,
    cancelHandlers: [],
    onCancel(handler) {
      this.cancelHandlers.push(handler);
    },
    cancel() {
      this.cancelled = true;
      this.cancelHandlers.forEach(handler => handler());
    }
  };
  return token;
};

// Using it
const token = createCancellationToken();

fetchUserDataWithCancellation(123, token)
  .then(data => console.log('User data:', data))
  .catch(error => console.error('Error:', error));

// Cancelling after 1 second
setTimeout(() => {
  token.cancel();
  console.log('Cancelled the operation');
}, 1000);
```

In this example:

* We create a simple cancellation token object with a `cancel` method and an event system
* The async function accepts this token and checks if it's already cancelled
* The function registers a cleanup handler to be called if the token is cancelled
* When `token.cancel()` is called, it rejects the promise and performs cleanup

### 2. AbortController API

Modern JavaScript introduced the AbortController API, which is specifically designed for cancelling operations. It's now supported in Node.js and is a more standardized approach:

```javascript
function fetchUserDataWithAbort(userId) {
  // The function now returns both the promise and an AbortController
  const controller = new AbortController();
  const { signal } = controller;
  
  const promise = new Promise((resolve, reject) => {
    // Check if already aborted
    if (signal.aborted) {
      return reject(new Error('Operation aborted'));
    }
  
    const timeoutId = setTimeout(() => {
      const userData = { id: userId, name: 'John Doe' };
      resolve(userData);
    }, 2000);
  
    // Listen for abort signal
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new Error('Operation aborted'));
    });
  });
  
  return { promise, controller };
}

// Using it
const { promise, controller } = fetchUserDataWithAbort(123);

promise
  .then(data => console.log('User data:', data))
  .catch(error => console.error('Error:', error));

// Abort after 1 second
setTimeout(() => {
  controller.abort();
  console.log('Aborted the operation');
}, 1000);
```

The AbortController is particularly useful because many built-in APIs in Node.js and browsers already support it, such as fetch:

```javascript
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Set a timeout to abort if it takes too long
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Usage
fetchWithTimeout('https://api.example.com/data', 5000)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### 3. Cancellation with Async Iterators

For operations that produce multiple values over time, async iterators provide a natural cancellation mechanism:

```javascript
async function* generateNumbersWithCancellation(max, signal) {
  for (let i = 0; i < max; i++) {
    // Check for cancellation before each yield
    if (signal.aborted) {
      console.log('Number generation cancelled');
      return;
    }
  
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
  }
}

async function main() {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Set a timeout to abort after 3.5 seconds
  setTimeout(() => {
    controller.abort();
    console.log('Abort signal triggered');
  }, 3500);
  
  // Process the numbers as they are generated
  const generator = generateNumbersWithCancellation(10, signal);
  try {
    for await (const num of generator) {
      console.log(`Generated number: ${num}`);
    }
    console.log('All numbers generated');
  } catch (error) {
    console.error('Error in number generation:', error);
  }
}

main();
```

This will log numbers 0, 1, 2, and then abort before generating 3, providing a clean way to cancel a sequence of operations.

## Cancellation with Different Node.js APIs

Let's now look at how to implement cancellation with different common Node.js APIs.

### HTTP Requests with Node.js http/https Modules

The native http/https modules in Node.js don't directly support the AbortController API, but we can still implement cancellation:

```javascript
const https = require('https');

function makeRequestWithCancellation(url) {
  let req = null;
  
  const promise = new Promise((resolve, reject) => {
    req = https.get(url, (res) => {
      let data = '';
    
      res.on('data', (chunk) => {
        data += chunk;
      });
    
      res.on('end', () => {
        resolve(data);
      });
    });
  
    req.on('error', (error) => {
      reject(error);
    });
  });
  
  // Return both the promise and a cancel function
  return {
    promise,
    cancel: () => {
      if (req) {
        req.abort(); // Abort the request
      }
    }
  };
}

// Usage
const { promise, cancel } = makeRequestWithCancellation('https://api.example.com/data');

promise
  .then(data => console.log('Data received:', data))
  .catch(error => console.error('Error:', error));

// Cancel after 1 second
setTimeout(() => {
  cancel();
  console.log('Request cancelled');
}, 1000);
```

### File Operations with fs Promises API

The fs/promises API in Node.js supports AbortSignal for many operations:

```javascript
const fs = require('fs/promises');

async function readFileWithTimeout(filePath, timeoutMs) {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Set a timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  try {
    // Pass the signal to the fs operation
    const content = await fs.readFile(filePath, { signal, encoding: 'utf8' });
    clearTimeout(timeoutId);
    return content;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Reading file timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Usage
readFileWithTimeout('./large-file.txt', 5000)
  .then(content => console.log('File content length:', content.length))
  .catch(error => console.error('Error reading file:', error));
```

### Database Operations

For database operations, we can implement cancellation depending on the database client we're using. For example, with Node.js MySQL:

```javascript
const mysql = require('mysql2/promise');

async function queryWithTimeout(sql, params, timeoutMs) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'user',
    password: 'password',
    database: 'mydb'
  });
  
  try {
    // Set a shorter timeout for the query
    await connection.execute('SET SESSION MAX_EXECUTION_TIME = ?', [timeoutMs]);
  
    // Execute the query
    const [rows] = await connection.execute(sql, params);
  
    return rows;
  } finally {
    // Always close the connection
    await connection.end();
  }
}

// Usage
queryWithTimeout('SELECT * FROM large_table WHERE complex_condition = ?', ['value'], 5000)
  .then(rows => console.log('Rows found:', rows.length))
  .catch(error => console.error('Query error:', error));
```

## Advanced Patterns for Cancellation

Let's explore some more advanced patterns for managing cancellable operations.

### 1. Cancellation Cascading

Often, we need to cancel multiple related operations at once. We can create a hierarchical cancellation system:

```javascript
class CancellationToken {
  constructor(parent = null) {
    this.cancelled = false;
    this.handlers = [];
    this.children = new Set();
  
    // If a parent is provided, register with it
    if (parent) {
      parent.children.add(this);
      // If parent is already cancelled, cancel this token too
      if (parent.cancelled) {
        this.cancel();
      }
    }
  }
  
  onCancel(handler) {
    if (this.cancelled) {
      // Execute immediately if already cancelled
      handler();
    } else {
      this.handlers.push(handler);
    }
  
    // Return a function to remove this handler
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }
  
  cancel() {
    if (this.cancelled) return;
  
    this.cancelled = true;
  
    // Execute all handlers
    this.handlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in cancel handler:', error);
      }
    });
  
    // Cancel all children
    this.children.forEach(child => child.cancel());
  }
}

// Usage:
const rootToken = new CancellationToken();
const childToken1 = new CancellationToken(rootToken);
const childToken2 = new CancellationToken(rootToken);

// Set up operations
childToken1.onCancel(() => console.log('Operation 1 cancelled'));
childToken2.onCancel(() => console.log('Operation 2 cancelled'));

// Cancel everything by cancelling the root
setTimeout(() => {
  rootToken.cancel();
  // This will log:
  // "Operation 1 cancelled"
  // "Operation 2 cancelled"
}, 1000);
```

### 2. Timeouts and Cancellation

Combining timeouts with cancellation is a common pattern:

```javascript
function withTimeout(promise, timeoutMs, message = 'Operation timed out') {
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  
    // If the original promise resolves/rejects, clear the timeout
    promise.finally(() => clearTimeout(timeoutId));
  });
  
  // Return a race between the original promise and the timeout
  return Promise.race([promise, timeoutPromise]);
}

// Usage with our previous fetchUserData function
const userDataPromise = fetchUserData(123);
withTimeout(userDataPromise, 1500, 'User data fetch timed out')
  .then(data => console.log('User data:', data))
  .catch(error => console.error('Error:', error));
```

### 3. Resource Cleanup with Cancellation

Proper resource cleanup is critical when implementing cancellation:

```javascript
async function processFileWithCleanup(filePath, signal) {
  // Resource acquisition
  const fileHandle = await fs.open(filePath, 'r');
  
  // Set up cleanup on cancellation
  let cancelled = false;
  const cleanup = async () => {
    cancelled = true;
    await fileHandle.close();
    console.log('File handle closed due to cancellation');
  };
  
  if (signal) {
    // Clean up if already aborted
    if (signal.aborted) {
      await cleanup();
      throw new Error('Operation aborted');
    }
  
    // Set up the abort handler
    signal.addEventListener('abort', cleanup);
  }
  
  try {
    const stats = await fileHandle.stat();
    const bufferSize = Math.min(stats.size, 4096);
    const buffer = Buffer.alloc(bufferSize);
    let bytesRead = 0;
    let position = 0;
  
    // Process the file in chunks
    while (position < stats.size) {
      // Check for cancellation
      if (cancelled) {
        throw new Error('Operation aborted');
      }
    
      const result = await fileHandle.read(buffer, 0, bufferSize, position);
      bytesRead += result.bytesRead;
      position += result.bytesRead;
    
      // Process the data...
      console.log(`Read ${result.bytesRead} bytes`);
    
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  
    return bytesRead;
  } finally {
    // Remove the abort listener
    if (signal) {
      signal.removeEventListener('abort', cleanup);
    }
  
    // Clean up if not already cleaned up
    if (!cancelled) {
      await fileHandle.close();
      console.log('File handle closed normally');
    }
  }
}

// Usage
async function main() {
  const controller = new AbortController();
  
  // Cancel after 500ms
  setTimeout(() => controller.abort(), 500);
  
  try {
    const bytesRead = await processFileWithCleanup('./large-file.txt', controller.signal);
    console.log(`Processed ${bytesRead} bytes`);
  } catch (error) {
    console.error('Processing error:', error.message);
  }
}

main();
```

## Creating a Reusable Cancellation System

Now, let's build a more complete and reusable cancellation system:

```javascript
// CancellationError class for distinguishing cancellation from other errors
class CancellationError extends Error {
  constructor(message = 'Operation cancelled') {
    super(message);
    this.name = 'CancellationError';
  }
}

// CancellationToken implementation
class CancellationToken {
  constructor(parent = null) {
    this.cancelled = false;
    this.handlers = [];
    this.children = new Set();
    this.reason = null;
  
    if (parent) {
      parent.children.add(this);
      if (parent.cancelled) {
        this.cancel(parent.reason);
      }
    }
  }
  
  onCancel(handler) {
    if (this.cancelled) {
      handler(this.reason);
    } else {
      this.handlers.push(handler);
    }
  
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }
  
  cancel(reason = null) {
    if (this.cancelled) return;
  
    this.cancelled = true;
    this.reason = reason || new CancellationError();
  
    this.handlers.forEach(handler => {
      try {
        handler(this.reason);
      } catch (error) {
        console.error('Error in cancel handler:', error);
      }
    });
  
    this.children.forEach(child => child.cancel(this.reason));
  }
  
  // Create a token that cancels after a timeout
  static timeout(ms, message = 'Operation timed out') {
    const token = new CancellationToken();
    const timeoutId = setTimeout(() => {
      token.cancel(new CancellationError(message));
    }, ms);
  
    // Cleanup the timeout if the token is cancelled for another reason
    token.onCancel(() => clearTimeout(timeoutId));
  
    return token;
  }
  
  // Wrap a promise to be cancellable with this token
  wrap(promise) {
    return new Promise((resolve, reject) => {
      // Check if already cancelled
      if (this.cancelled) {
        reject(this.reason);
        return;
      }
    
      // Set up cancellation handler
      const removeHandler = this.onCancel(reason => {
        reject(reason);
      });
    
      // Handle promise resolution
      promise
        .then(result => {
          removeHandler(); // Clean up the cancellation handler
          resolve(result);
        })
        .catch(error => {
          removeHandler(); // Clean up the cancellation handler
          reject(error);
        });
    });
  }
  
  // Utility to run a function with this token
  run(fn) {
    try {
      const result = fn(this);
      // If the result is a promise, wrap it
      if (result instanceof Promise) {
        return this.wrap(result);
      }
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

// Example usage
async function demo() {
  // Create a token that will time out after 5 seconds
  const token = CancellationToken.timeout(5000, 'Demo timed out');
  
  // Create a child token for a specific operation
  const childToken = new CancellationToken(token);
  
  // Run a cancellable operation
  try {
    const result = await childToken.run(async (token) => {
      let count = 0;
    
      // Simulate a long-running operation
      while (count < 10) {
        // Check for cancellation
        if (token.cancelled) throw token.reason;
      
        console.log(`Iteration ${count}`);
        count++;
      
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    
      return count;
    });
  
    console.log(`Operation completed with result: ${result}`);
  } catch (error) {
    if (error instanceof CancellationError) {
      console.log(`Operation was cancelled: ${error.message}`);
    } else {
      console.error(`Operation failed with error: ${error.message}`);
    }
  }
}

demo();
```

This system provides:

* A dedicated `CancellationError` class for distinguishing cancellation from other errors
* Hierarchical cancellation tokens with parent-child relationships
* Timeout functionality
* Promise wrapping
* A convenient `run` method for executing cancellable functions

## Real-World Example: Cancellable REST API Calls

Let's create a simple API client with cancellation support:

```javascript
const https = require('https');
const { URL } = require('url');

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  request(path, options = {}, signal = null) {
    const url = new URL(path, this.baseUrl);
  
    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      ...options
    };
  
    return new Promise((resolve, reject) => {
      // Check if already aborted
      if (signal && signal.aborted) {
        reject(new Error('Request aborted'));
        return;
      }
    
      const req = https.request(url, requestOptions, (res) => {
        let data = '';
      
        res.on('data', (chunk) => {
          data += chunk;
        });
      
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              resolve(data); // Not JSON, return as is
            }
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode} ${res.statusMessage}`));
          }
        });
      });
    
      req.on('error', (error) => {
        reject(error);
      });
    
      // Handle cancellation
      if (signal) {
        const abortHandler = () => {
          req.abort();
          reject(new Error('Request aborted'));
        };
      
        signal.addEventListener('abort', abortHandler, { once: true });
      
        // Clean up the event listener when the request completes
        req.on('close', () => {
          signal.removeEventListener('abort', abortHandler);
        });
      }
    
      // Send the request body if provided
      if (options.body) {
        const body = typeof options.body === 'string' 
          ? options.body 
          : JSON.stringify(options.body);
      
        req.write(body);
      }
    
      req.end();
    });
  }
  
  // Convenience methods
  get(path, options = {}, signal = null) {
    return this.request(path, { ...options, method: 'GET' }, signal);
  }
  
  post(path, body, options = {}, signal = null) {
    return this.request(path, { 
      ...options, 
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, signal);
  }
}

// Usage
async function main() {
  const client = new ApiClient('https://api.example.com');
  const controller = new AbortController();
  
  // Cancel after 2 seconds
  setTimeout(() => {
    controller.abort();
    console.log('Request aborted by user');
  }, 2000);
  
  try {
    // This request would normally take 5 seconds
    const data = await client.get('/slow-endpoint', {}, controller.signal);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Conclusion

Implementing cancellable operations in Node.js requires understanding several key principles:

1. **Cancellation Patterns** : Using cancellation tokens, AbortController, or return values from async functions
2. **Resource Management** : Ensuring resources are properly cleaned up when operations are cancelled
3. **Error Handling** : Using specialized error types to distinguish cancellation from other errors
4. **API Design** : Creating intuitive APIs that support cancellation throughout the application

By applying these principles, you can build robust, efficient Node.js applications that handle cancellation gracefully, providing a better user experience and more efficient resource usage.

Remember that cancellation is not just about stopping an operation—it's about doing so in a clean way that releases resources, provides appropriate feedback, and maintains the overall stability of your application.
