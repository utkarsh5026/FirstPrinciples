# Custom Adapter Implementation in Axios for React

## Introduction to Axios and Adapters

Let's begin by understanding what Axios is and why adapters are important.

> Axios is a promise-based HTTP client for JavaScript that can be used in both browser and Node.js environments. It's designed to make HTTP requests simple and elegant, with features like request and response interception, automatic JSON transformation, and client-side protection against XSRF.

### What is an Adapter?

To understand adapters, we need to first understand how Axios works at a fundamental level:

> An adapter in Axios is the component responsible for making the actual HTTP request. It's the bridge between Axios's standardized interface and the underlying mechanism that performs the network communication.

The default adapter in Axios uses XMLHttpRequest in browsers and the http module in Node.js. However, Axios allows you to customize this behavior by creating and using custom adapters.

## First Principles: Understanding the Request-Response Cycle

Before diving into custom adapters, let's understand the HTTP request-response cycle:

1. A client (your React application) initiates a request to a server
2. The request contains a method (GET, POST, etc.), URL, headers, and possibly a body
3. The server processes the request and sends back a response
4. The response contains a status code, headers, and possibly a body
5. The client processes the response

Axios abstracts this cycle into a clean, promise-based API. The adapter is responsible for step 2 and part of step 5.

## The Basic Structure of an Axios Adapter

An Axios adapter is a function that receives a config object and returns a promise that resolves with a response object or rejects with an error.

```javascript
function myCustomAdapter(config) {
  // Initialize the request
  
  return new Promise((resolve, reject) => {
    // Make the request
  
    // When the request is complete:
    // If successful, resolve with the response
    resolve({
      data: responseData,
      status: responseStatus,
      statusText: responseStatusText,
      headers: responseHeaders,
      config: config,
      request: requestObject
    });
  
    // If failed, reject with an error
    reject(error);
  });
}
```

This function forms the foundation of any custom adapter. Now, let's see how to implement and use it.

## Step-by-Step Implementation of a Custom Adapter

### Step 1: Create a Basic Adapter

Let's create a simple custom adapter that uses the Fetch API instead of XMLHttpRequest:

```javascript
function fetchAdapter(config) {
  // Extract relevant properties from config
  const { url, method = 'get', data, headers = {}, timeout } = config;
  
  // Configure the fetch options
  const options = {
    method: method.toUpperCase(),
    headers: new Headers(headers),
    // Add more options as needed
  };
  
  // Add request body if appropriate
  if (data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    options.body = JSON.stringify(data);
  }
  
  // Return the promise
  return fetch(url, options)
    .then(response => {
      // Transform the fetch response to an Axios response
      return response.text().then(text => {
        const responseData = text ? JSON.parse(text) : '';
      
        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: parseHeaders(response.headers),
          config,
          request: null // fetch doesn't provide access to the request object
        };
      });
    });
}

// Helper function to parse headers
function parseHeaders(headers) {
  const result = {};
  headers.forEach((value, name) => {
    result[name] = value;
  });
  return result;
}
```

This adapter takes an Axios config object, transforms it into parameters suitable for the Fetch API, makes the request, and transforms the response back into an Axios-compatible format.

### Step 2: Using the Custom Adapter

To use a custom adapter in Axios, you can provide it in the config object:

```javascript
import axios from 'axios';

// Create an instance with the custom adapter
const axiosInstance = axios.create({
  adapter: fetchAdapter
});

// Then use it like regular axios
axiosInstance.get('/api/data')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```

## Example: Creating a Logging Adapter

Let's create a more practical adapter that adds logging capabilities. This adapter will wrap around the default adapter and log information about requests and responses:

```javascript
import axios from 'axios';

function loggingAdapter(config) {
  console.log(`Request to ${config.url} started at ${new Date().toISOString()}`);
  console.log('Request config:', config);
  
  // Get the default adapter
  const defaultAdapter = axios.defaults.adapter;
  
  // Call the default adapter
  return defaultAdapter(config)
    .then(response => {
      console.log(`Response from ${config.url} received at ${new Date().toISOString()}`);
      console.log('Response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      return response;
    })
    .catch(error => {
      console.error(`Error in request to ${config.url}:`, error);
      throw error;
    });
}
```

This adapter enhances the default adapter by adding logging before the request, after a successful response, and after an error.

### Using the Logging Adapter in a React Component

Now let's see how to use this custom adapter in a React component:

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import our custom adapter
import { loggingAdapter } from './adapters';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Create an axios instance with our custom adapter
    const axiosWithLogging = axios.create({
      adapter: loggingAdapter
    });
  
    setLoading(true);
  
    axiosWithLogging.get(`/api/users/${userId}`)
      .then(response => {
        setUser(response.data);
        setError(null);
      })
      .catch(err => {
        setError('Failed to load user data');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return null;
  
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      {/* More user details */}
    </div>
  );
}

export default UserProfile;
```

In this example, the custom logging adapter is used to track API calls made from the UserProfile component.

## Example: Creating a Caching Adapter

Let's implement a caching adapter that stores responses and serves them from cache when appropriate:

```javascript
function cachingAdapter(config) {
  // Simple in-memory cache
  const cache = {};
  
  // Get the default adapter
  const defaultAdapter = axios.defaults.adapter;
  
  // Only cache GET requests
  if (config.method.toLowerCase() !== 'get') {
    return defaultAdapter(config);
  }
  
  // Create a cache key based on the URL and params
  const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
  
  // Check if we have a cached response and it's not expired
  if (cache[cacheKey] && new Date() < cache[cacheKey].expiry) {
    console.log(`Using cached response for ${config.url}`);
    return Promise.resolve(cache[cacheKey].response);
  }
  
  // Make the actual request
  return defaultAdapter(config).then(response => {
    // Cache the response with a 5-minute expiry (adjust as needed)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);
  
    cache[cacheKey] = {
      response: response,
      expiry: expiry
    };
  
    console.log(`Cached response for ${config.url} until ${expiry.toISOString()}`);
  
    return response;
  });
}
```

This adapter will:

1. Check if a cached response exists for the request
2. Return the cached response if it's not expired
3. Otherwise, make the actual request and cache the response

## Example: Creating a Retry Adapter

Another useful custom adapter is one that automatically retries failed requests:

```javascript
function retryAdapter(config) {
  // Get the default adapter
  const defaultAdapter = axios.defaults.adapter;
  
  // Set default retry count
  const retryCount = config.retryCount || 3;
  const retryDelay = config.retryDelay || 1000; // ms
  
  // Create a function to attempt the request
  function attemptRequest(attemptNumber) {
    return defaultAdapter(config).catch(error => {
      // Only retry on network errors or 5xx server errors
      const shouldRetry = (
        !error.response || 
        (error.response.status >= 500 && error.response.status < 600)
      );
    
      if (shouldRetry && attemptNumber < retryCount) {
        console.log(`Attempt ${attemptNumber} failed, retrying in ${retryDelay}ms...`);
      
        // Wait for the specified delay
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(attemptRequest(attemptNumber + 1));
          }, retryDelay);
        });
      }
    
      // If we shouldn't retry or we've reached max retries, throw the error
      throw error;
    });
  }
  
  // Start with attempt 1
  return attemptRequest(1);
}
```

This adapter will retry failed requests up to a specified number of times, with a delay between retries.

## Combining Multiple Adapters

We can create a utility function to combine multiple adapters:

```javascript
function combineAdapters(...adapters) {
  return function combinedAdapter(config) {
    // Start with the default adapter
    let promise = axios.defaults.adapter(config);
  
    // Apply each adapter in sequence
    adapters.forEach(adapter => {
      promise = promise.then(response => adapter({...config, _prevResponse: response}));
    });
  
    return promise;
  };
}

// Usage
const enhancedAdapter = combineAdapters(
  loggingAdapter,
  cachingAdapter,
  retryAdapter
);

const axiosInstance = axios.create({
  adapter: enhancedAdapter
});
```

However, this approach is simplified and might not work correctly in all cases. A more robust implementation would require careful handling of the adapter chain.

## Real-World Example: Testing with Mock Adapter

When testing React components that use Axios, we often want to mock the API responses. Let's create a mock adapter:

```javascript
function mockAdapter(config) {
  // Mock responses based on URL patterns
  const mockResponses = {
    '/api/users': {
      status: 200,
      data: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ]
    },
    '/api/users/1': {
      status: 200,
      data: { id: 1, name: 'John Doe', email: 'john@example.com' }
    },
    // Add more mock responses as needed
  };
  
  return new Promise((resolve, reject) => {
    // Simulate network delay
    setTimeout(() => {
      // Find a matching mock response
      const mockResponse = mockResponses[config.url];
    
      if (mockResponse) {
        resolve({
          data: mockResponse.data,
          status: mockResponse.status,
          statusText: mockResponse.status === 200 ? 'OK' : 'Error',
          headers: { 'content-type': 'application/json' },
          config,
          request: {}
        });
      } else {
        reject({
          response: {
            status: 404,
            statusText: 'Not Found',
            data: { message: 'Resource not found' },
            headers: { 'content-type': 'application/json' },
            config,
            request: {}
          }
        });
      }
    }, 100); // Simulate 100ms delay
  });
}
```

Now we can use this adapter in tests:

```jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import UserProfile from './UserProfile';
import { mockAdapter } from './adapters';

// Save the original adapter
const originalAdapter = axios.defaults.adapter;

describe('UserProfile component', () => {
  beforeAll(() => {
    // Replace the default adapter with our mock adapter
    axios.defaults.adapter = mockAdapter;
  });
  
  afterAll(() => {
    // Restore the original adapter
    axios.defaults.adapter = originalAdapter;
  });
  
  test('renders user data when API call succeeds', async () => {
    render(<UserProfile userId={1} />);
  
    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  
    // Wait for the API call to complete
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    });
  });
});
```

## Best Practices for Custom Adapters

When implementing custom adapters for Axios in React applications, consider these best practices:

> **Keep adapters focused** : Each adapter should have a single responsibility. This makes them easier to test, maintain, and combine.

> **Handle errors properly** : Make sure your adapters catch and propagate errors correctly, preserving the original error context.

> **Be mindful of performance** : Some adapters (like logging or caching) can impact performance. Use them judiciously and consider the performance implications.

> **Test adapters thoroughly** : Write unit tests for your adapters to ensure they behave as expected in various scenarios.

> **Document your adapters** : Provide clear documentation of what each adapter does, its configuration options, and how to use it.

## Common Pitfalls to Avoid

1. **Forgetting to handle errors** : Always include error handling in your adapters.
2. **Not preserving the Axios response format** : Make sure your adapter returns responses in the format Axios expects.
3. **Creating overly complex adapters** : Keep adapters simple and focused on a single concern.
4. **Mutating the config object** : Avoid modifying the original config object; instead, create a copy or use immutable patterns.
5. **Not considering timeouts** : Always implement proper timeout handling in your adapters.

## Summary

Custom adapters in Axios provide a powerful way to extend its functionality and tailor it to your specific needs in React applications. By understanding the adapter pattern and following the examples provided, you can create adapters for logging, caching, retrying, testing, and more.

The key points to remember are:

> An adapter is a function that takes a config object and returns a promise that resolves with a response or rejects with an error.

> Custom adapters can be used to intercept, modify, or replace the actual HTTP request process.

> You can combine multiple adapters to create complex functionality while keeping each adapter focused on a single concern.

By mastering custom adapters, you can enhance your React applications with more robust, testable, and maintainable API communication.
