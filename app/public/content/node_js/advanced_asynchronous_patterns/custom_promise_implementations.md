# Custom Promise Implementations in Node.js: From First Principles

I'll explain how to build custom Promise implementations in Node.js, starting from the absolute fundamentals and working our way up to more complex implementations. Let's dive deep into the world of asynchronous programming from first principles.

## The Problem: Asynchrony in JavaScript

> "In the beginning, there was synchronous code. And developers saw that waiting for operations to complete was blocking the entire program, and they said: 'This is not good.'"

JavaScript was originally designed to run in a single-threaded environment. This created a fundamental challenge: how do we handle operations that take time (like network requests, file system operations, or timers) without blocking the entire program?

### Understanding Asynchrony

Let's start by understanding what happens when JavaScript executes code:

```javascript
console.log("First");
console.log("Second");
console.log("Third");
```

The output is predictable:

```
First
Second
Third
```

But what if the second operation takes time?

```javascript
console.log("First");
// Imagine this takes 2 seconds
setTimeout(() => {
  console.log("Second (after delay)");
}, 2000);
console.log("Third");
```

The output becomes:

```
First
Third
Second (after delay)
```

This is the essence of asynchronous programming: operations that take time don't block the execution of subsequent code.

## Callback Pattern: The Original Solution

Before Promises, JavaScript used callbacks to handle asynchronous operations:

```javascript
function fetchData(callback) {
  // Simulate a network request with setTimeout
  setTimeout(() => {
    const data = { name: "John", age: 30 };
    callback(null, data); // First argument is error (null means no error)
  }, 1000);
}

fetchData((error, data) => {
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data:", data);
  }
});
```

The problem with callbacks becomes evident when we need to perform sequential asynchronous operations:

```javascript
fetchUserData((error, user) => {
  if (error) {
    console.error("Error fetching user:", error);
  } else {
    fetchUserPosts(user.id, (error, posts) => {
      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        fetchPostComments(posts[0].id, (error, comments) => {
          if (error) {
            console.error("Error fetching comments:", error);
          } else {
            // Finally, we have our data
            console.log(user, posts, comments);
          }
        });
      }
    });
  }
});
```

This led to what's often called "callback hell" or the "pyramid of doom."

## Promises: A Better Solution

> "A Promise is an object representing the eventual completion (or failure) of an asynchronous operation."

Promises provide a more elegant way to handle asynchronous operations. At their core, Promises have three states:

1. **Pending** : Initial state, neither fulfilled nor rejected
2. **Fulfilled** : The operation completed successfully
3. **Rejected** : The operation failed

Let's understand the basic usage of Promises:

```javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    // Simulate a network request
    setTimeout(() => {
      const data = { name: "John", age: 30 };
      resolve(data); // Success case
      // If there was an error: reject(new Error('Something went wrong'));
    }, 1000);
  });
}

fetchData()
  .then(data => console.log("Data:", data))
  .catch(error => console.error("Error:", error));
```

## Building a Custom Promise Implementation

Now let's implement our own Promise class from scratch. We'll start with a very basic implementation and gradually enhance it.

### Step 1: Basic Promise Structure

```javascript
class MyPromise {
  constructor(executor) {
    // Initialize state and value
    this.state = 'pending';
    this.value = null;
    this.reason = null;
  
    // Arrays to store callbacks
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
  
    // Define resolve and reject functions
    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        // Execute all success callbacks
        this.onFulfilledCallbacks.forEach(callback => callback(this.value));
      }
    };
  
    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        // Execute all error callbacks
        this.onRejectedCallbacks.forEach(callback => callback(this.reason));
      }
    };
  
    // Execute the executor function
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
}
```

This implementation defines:

* The initial state and storage for the result value or error reason
* Arrays to store callbacks that will be executed when the Promise resolves or rejects
* Implementation of `resolve` and `reject` functions that change the state and trigger callbacks
* Error handling for the executor function

### Step 2: Implementing the `then` Method

```javascript
class MyPromise {
  // ... previous code ...
  
  then(onFulfilled, onRejected) {
    // Create a new promise (for chaining)
    return new MyPromise((resolve, reject) => {
    
      // Define handler for fulfilled state
      const fulfilledHandler = (value) => {
        // If no onFulfilled handler, pass the value to the next promise
        if (typeof onFulfilled !== 'function') {
          resolve(value);
          return;
        }
      
        try {
          // Execute the onFulfilled callback
          const result = onFulfilled(value);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
    
      // Define handler for rejected state
      const rejectedHandler = (reason) => {
        // If no onRejected handler, pass the reason to the next promise
        if (typeof onRejected !== 'function') {
          reject(reason);
          return;
        }
      
        try {
          // Execute the onRejected callback
          const result = onRejected(reason);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
    
      // Handle already resolved/rejected promises
      if (this.state === 'fulfilled') {
        setTimeout(() => fulfilledHandler(this.value), 0);
      } else if (this.state === 'rejected') {
        setTimeout(() => rejectedHandler(this.reason), 0);
      } else {
        // For pending promises, store the callbacks
        this.onFulfilledCallbacks.push(fulfilledHandler);
        this.onRejectedCallbacks.push(rejectedHandler);
      }
    });
  }
}
```

The `then` method:

* Creates a new Promise for chaining
* Manages the cases where the Promise is already resolved/rejected
* Handles the case where the Promise is still pending
* Ensures asynchronous execution with `setTimeout`
* Properly propagates values and errors through the chain

### Step 3: Implementing the `catch` Method

```javascript
class MyPromise {
  // ... previous code ...
  
  catch(onRejected) {
    // catch is just a shorthand for then(undefined, onRejected)
    return this.then(undefined, onRejected);
  }
}
```

### Step 4: Handling Promise Resolution

The Promise/A+ specification requires that a Promise implementation handle the case where the result of a `then` callback is another Promise:

```javascript
class MyPromise {
  // ... previous code ...
  
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
    
      const fulfilledHandler = (value) => {
        if (typeof onFulfilled !== 'function') {
          resolve(value);
          return;
        }
      
        try {
          const result = onFulfilled(value);
          // Handle the case where result is a Promise
          this._resolvePromise(result, resolve, reject);
        } catch (error) {
          reject(error);
        }
      };
    
      // ... similar change for rejectedHandler ...
    
      // ... rest of the then method ...
    });
  }
  
  _resolvePromise(x, resolve, reject) {
    // Cannot resolve to itself
    if (x === this) {
      reject(new TypeError('Promise cannot resolve to itself'));
      return;
    }
  
    // Handle the case where x is a Promise
    if (x instanceof MyPromise) {
      x.then(resolve, reject);
      return;
    }
  
    // Handle the case where x is a thenable (object with a then method)
    if (x && typeof x === 'object' && typeof x.then === 'function') {
      try {
        const then = x.then;
        let called = false;
      
        try {
          then.call(
            x,
            (y) => {
              if (called) return;
              called = true;
              this._resolvePromise(y, resolve, reject);
            },
            (r) => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } catch (error) {
          if (!called) {
            reject(error);
          }
        }
      } catch (error) {
        reject(error);
      }
      return;
    }
  
    // For non-Promise values, just resolve
    resolve(x);
  }
}
```

This addition ensures proper handling of Promise chaining according to the Promise/A+ specification.

### Step 5: Adding Static Methods

Let's add some common static methods like `resolve`, `reject`, `all`, and `race`:

```javascript
class MyPromise {
  // ... previous code ...
  
  // Immediately returns a resolved promise
  static resolve(value) {
    return new MyPromise(resolve => resolve(value));
  }
  
  // Immediately returns a rejected promise
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
  
  // Waits for all promises to resolve or any to reject
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError('Promise.all accepts an array'));
        return;
      }
    
      const results = new Array(promises.length);
      let resolvedCount = 0;
    
      // Empty array case
      if (promises.length === 0) {
        resolve(results);
        return;
      }
    
      promises.forEach((promise, index) => {
        // Handle non-promise values
        MyPromise.resolve(promise).then(
          (value) => {
            results[index] = value;
            resolvedCount++;
          
            if (resolvedCount === promises.length) {
              resolve(results);
            }
          },
          (reason) => {
            // If any promise rejects, the whole Promise.all rejects
            reject(reason);
          }
        );
      });
    });
  }
  
  // Resolves or rejects as soon as any of the promises resolves or rejects
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      if (!Array.isArray(promises)) {
        reject(new TypeError('Promise.race accepts an array'));
        return;
      }
    
      // Empty array case - this promise never resolves
      if (promises.length === 0) {
        return;
      }
    
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}
```

## Using Our Custom Promise Implementation

Now let's see our custom Promise implementation in action:

```javascript
// Create a new promise
const promise = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("Hello, world!");
  }, 1000);
});

// Use the promise
promise
  .then(value => {
    console.log("Value:", value); // "Value: Hello, world!"
    return value + " And more!";
  })
  .then(newValue => {
    console.log("New value:", newValue); // "New value: Hello, world! And more!"
    throw new Error("Something went wrong");
  })
  .catch(error => {
    console.error("Caught error:", error.message); // "Caught error: Something went wrong"
    return "Recovered";
  })
  .then(value => {
    console.log("After catch:", value); // "After catch: Recovered"
  });
```

## Advanced Promise Patterns

Let's explore some advanced patterns using our Promise implementation:

### Sequential Execution

```javascript
function sequence(tasks) {
  return tasks.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults => {
      return currentTask().then(currentResult => {
        return [...chainResults, currentResult];
      });
    });
  }, MyPromise.resolve([]));
}

// Usage
const task1 = () => new MyPromise(resolve => 
  setTimeout(() => resolve("Task 1 completed"), 100)
);
const task2 = () => new MyPromise(resolve => 
  setTimeout(() => resolve("Task 2 completed"), 200)
);
const task3 = () => new MyPromise(resolve => 
  setTimeout(() => resolve("Task 3 completed"), 300)
);

sequence([task1, task2, task3])
  .then(results => console.log(results));
// After ~600ms: ["Task 1 completed", "Task 2 completed", "Task 3 completed"]
```

### Parallel Execution with Limit

```javascript
function parallelLimit(tasks, limit) {
  return new MyPromise((resolve, reject) => {
    if (!Array.isArray(tasks)) {
      reject(new TypeError('First argument must be an array'));
      return;
    }
  
    // Edge cases
    if (tasks.length === 0) {
      resolve([]);
      return;
    }
  
    if (limit <= 0) {
      reject(new Error('Limit must be greater than 0'));
      return;
    }
  
    const results = new Array(tasks.length);
    let completedCount = 0;
    let index = 0;
    let runningCount = 0;
    let hasError = false;
  
    // Function to start next task
    function startNext() {
      if (hasError) return;
    
      // Check if all tasks are completed
      if (completedCount >= tasks.length) {
        resolve(results);
        return;
      }
    
      // Check if we've reached the end of tasks or hit the limit
      while (index < tasks.length && runningCount < limit) {
        const currentIndex = index++;
        runningCount++;
      
        // Execute the task
        MyPromise.resolve(tasks[currentIndex]())
          .then(result => {
            if (hasError) return;
          
            results[currentIndex] = result;
            completedCount++;
            runningCount--;
          
            // Try to start next task
            startNext();
          })
          .catch(err => {
            if (hasError) return;
          
            hasError = true;
            reject(err);
          });
      }
    }
  
    // Start initial batch of tasks
    startNext();
  });
}

// Usage
const tasks = [
  () => new MyPromise(r => setTimeout(() => r("Task 1"), 300)),
  () => new MyPromise(r => setTimeout(() => r("Task 2"), 200)),
  () => new MyPromise(r => setTimeout(() => r("Task 3"), 100)),
  () => new MyPromise(r => setTimeout(() => r("Task 4"), 400)),
  () => new MyPromise(r => setTimeout(() => r("Task 5"), 500))
];

parallelLimit(tasks, 2)
  .then(results => console.log(results));
// ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"] (but with better performance)
```

## Promise Extensions: Adding Useful Methods

We can enhance our Promise implementation with useful methods:

### Adding `finally` Method

```javascript
class MyPromise {
  // ... previous code ...
  
  finally(onFinally) {
    return this.then(
      value => MyPromise.resolve(
        typeof onFinally === 'function' ? onFinally() : onFinally
      ).then(() => value),
      reason => MyPromise.resolve(
        typeof onFinally === 'function' ? onFinally() : onFinally
      ).then(() => { throw reason; })
    );
  }
}
```

### Adding Timeout Functionality

```javascript
class MyPromise {
  // ... previous code ...
  
  timeout(ms) {
    return new MyPromise((resolve, reject) => {
      // Set up the timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Promise timed out after ${ms}ms`));
      }, ms);
    
      // Handle the original promise
      this.then(
        value => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        reason => {
          clearTimeout(timeoutId);
          reject(reason);
        }
      );
    });
  }
  
  static timeout(promise, ms) {
    if (promise instanceof MyPromise) {
      return promise.timeout(ms);
    }
  
    return MyPromise.resolve(promise).timeout(ms);
  }
}

// Usage
const slowOperation = new MyPromise(resolve => 
  setTimeout(() => resolve("Done!"), 2000)
);

slowOperation.timeout(1000)
  .then(result => console.log(result))
  .catch(error => console.error(error.message));
// Error: Promise timed out after 1000ms
```

## Real-World Example: Implementing a Retry Mechanism

Let's implement a retry mechanism that makes multiple attempts to perform an operation:

```javascript
class MyPromise {
  // ... previous code ...
  
  static retry(fn, options = {}) {
    const { attempts = 3, delay = 1000, backoff = 1 } = options;
  
    return new MyPromise((resolve, reject) => {
      let attemptCount = 0;
      let currentDelay = delay;
    
      function attempt() {
        attemptCount++;
      
        MyPromise.resolve(fn())
          .then(resolve)
          .catch(error => {
            if (attemptCount >= attempts) {
              reject(error);
              return;
            }
          
            console.log(`Attempt ${attemptCount} failed. Retrying in ${currentDelay}ms...`);
          
            // Set up the next attempt
            setTimeout(() => {
              currentDelay *= backoff;
              attempt();
            }, currentDelay);
          });
      }
    
      // Start the first attempt
      attempt();
    });
  }
}

// Usage
function unreliableOperation() {
  return new MyPromise((resolve, reject) => {
    const random = Math.random();
  
    if (random < 0.7) {
      reject(new Error(`Failed with value ${random}`));
    } else {
      resolve(`Success with value ${random}`);
    }
  });
}

MyPromise.retry(unreliableOperation, { 
  attempts: 5, 
  delay: 500, 
  backoff: 2 
})
  .then(result => console.log("Final result:", result))
  .catch(error => console.error("All attempts failed:", error.message));
```

## Performance Considerations

When implementing custom Promises, consider these performance factors:

1. **Memory Usage** : Each Promise instance creates closure functions and potentially stores callback arrays. For high-throughput applications, this can lead to significant memory usage.
2. **Microtasks vs. Macrotasks** : Native Promises use the microtask queue, while our implementation with `setTimeout` uses the macrotask queue. This can change execution order in complex scenarios.

To improve our implementation:

```javascript
// Use process.nextTick in Node.js for microtask-like behavior
const nextTick = (callback) => {
  if (typeof process !== 'undefined' && process.nextTick) {
    process.nextTick(callback);
  } else {
    setTimeout(callback, 0);
  }
};

class MyPromise {
  // ... replace setTimeout calls with nextTick ...
  
  then(onFulfilled, onRejected) {
    // ...
  
    if (this.state === 'fulfilled') {
      nextTick(() => fulfilledHandler(this.value));
    } else if (this.state === 'rejected') {
      nextTick(() => rejectedHandler(this.reason));
    } else {
      // ...
    }
  
    // ...
  }
}
```

## Debugging Promises

Debugging asynchronous code can be challenging. Let's add some debugging capabilities:

```javascript
class MyPromise {
  // ... previous code ...
  
  static debugMode = false;
  
  static enableDebug() {
    MyPromise.debugMode = true;
  }
  
  static disableDebug() {
    MyPromise.debugMode = false;
  }
  
  constructor(executor) {
    // ... existing constructor code ...
  
    // Add unique ID for debugging
    this.id = Math.random().toString(36).substring(2, 8);
  
    if (MyPromise.debugMode) {
      console.log(`Promise ${this.id} created`);
    }
  
    const resolve = (value) => {
      if (this.state === 'pending') {
        if (MyPromise.debugMode) {
          console.log(`Promise ${this.id} resolved with:`, value);
        }
        // ... existing resolve logic ...
      }
    };
  
    const reject = (reason) => {
      if (this.state === 'pending') {
        if (MyPromise.debugMode) {
          console.log(`Promise ${this.id} rejected with:`, reason);
        }
        // ... existing reject logic ...
      }
    };
  
    // ... rest of constructor ...
  }
  
  then(onFulfilled, onRejected) {
    const newPromise = new MyPromise((resolve, reject) => {
      // ... existing then logic ...
    });
  
    if (MyPromise.debugMode) {
      console.log(`Promise ${this.id} chained to Promise ${newPromise.id}`);
    }
  
    return newPromise;
  }
}

// Usage
MyPromise.enableDebug();
const p = new MyPromise((resolve) => setTimeout(() => resolve("data"), 1000));
p.then(data => console.log(data));
```

## Compatibility with Native Promises

For practical applications, we might want our custom Promises to work seamlessly with native Promises:

```javascript
class MyPromise {
  // ... previous code ...
  
  // Handle interoperability with native Promise
  _resolvePromise(x, resolve, reject) {
    // ... existing logic ...
  
    // Handle native Promise
    if (x instanceof Promise) {
      x.then(resolve, reject);
      return;
    }
  
    // ... rest of _resolvePromise ...
  }
  
  // Convert to native Promise
  toNativePromise() {
    return new Promise((resolve, reject) => {
      this.then(resolve, reject);
    });
  }
  
  // Create from native Promise
  static fromNativePromise(nativePromise) {
    return new MyPromise((resolve, reject) => {
      nativePromise.then(resolve, reject);
    });
  }
}
```

## Conclusion

Understanding how Promises work from first principles gives us deep insights into JavaScript's asynchronous nature. We've built a comprehensive Promise implementation that:

1. Meets the core requirements of the Promise/A+ specification
2. Provides useful extensions like `finally`, `timeout`, and `retry`
3. Offers debugging capabilities
4. Can interoperate with native Promises

This knowledge is valuable for:

* Understanding how asynchronous JavaScript works under the hood
* Troubleshooting complex Promise-based code
* Creating specialized Promise extensions for specific use cases
* Building custom async utilities

By mastering custom Promise implementations, you gain a profound understanding of one of JavaScript's most important abstractions for handling asynchronous operations.

Would you like me to elaborate on any specific aspect of Promise implementations, or would you like to see a different example of custom Promise extensions?
