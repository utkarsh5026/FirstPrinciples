# Custom Error Handling Strategies in Axios

Error handling is one of the most critical aspects of working with HTTP requests, especially in production applications. Let's explore how to implement custom error handling in Axios—starting from the absolute fundamentals and building up to sophisticated strategies.

> "To handle errors well is to understand the underlying system completely."

## First Principles: What Are Errors in HTTP Requests?

Before diving into Axios error handling, we need to understand what constitutes an error in HTTP communication.

### HTTP Communication Basics

HTTP requests involve a client (like your browser or application) sending a request to a server and receiving a response. Each response contains:

1. A status code (e.g., 200, 404, 500)
2. Headers with metadata
3. A response body with the actual content

### Types of Errors in HTTP Requests

From first principles, HTTP request errors fall into two fundamental categories:

1. **Network errors** : The request never reached the server or the response never made it back (e.g., no internet connection, server down)
2. **HTTP errors** : The server received the request but returned an error status code (4xx or 5xx)

In Axios, both of these error types are captured in the error object that's passed to your catch handler.

## Understanding the Axios Error Object

When an error occurs with an Axios request, it provides a rich error object containing detailed information. This is the foundation of effective error handling.

### Anatomy of an Axios Error Object

An Axios error object typically contains:

```javascript
// Structure of an Axios error object
{
  message: "Request failed with status code 404",
  name: "AxiosError",
  code: "ERR_BAD_REQUEST",
  config: {
    // The original request configuration
    url: "/api/users",
    method: "get",
    headers: { ... },
    // ...other config properties
  },
  request: { /* The XMLHttpRequest instance or request info */ },
  response: {
    data: { /* The response body as parsed by Axios */ },
    status: 404,
    statusText: "Not Found",
    headers: { /* Response headers */ },
    config: { /* Original request config */ },
    request: { /* The request that generated this response */ }
  }
}
```

Let's break down the key properties:

* `message`: Human-readable error description
* `response`: Contains the server's response (only exists for HTTP errors, not network errors)
* `request`: Contains the request that was made
* `config`: Contains the original configuration used for the request
* `code`: An error code string (e.g., "ERR_BAD_REQUEST", "ECONNABORTED")

## Basic Error Handling in Axios

Let's start with the simplest form of error handling in Axios:

```javascript
import axios from 'axios';

// Basic error handling with try/catch
async function fetchUserData(userId) {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error.message);
    throw error; // Re-throw the error for higher-level handling
  }
}
```

In this example, we:

1. Make a request to fetch user data
2. Use a try/catch block to catch any errors
3. Log a simple error message
4. Re-throw the error for potential handling at a higher level

While this works, it doesn't take advantage of the rich error information Axios provides.

## Differentiating Between Error Types

A more sophisticated approach is to differentiate between different types of errors:

```javascript
import axios from 'axios';

async function fetchUserData(userId) {
  try {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      console.error(`Server error: ${error.response.status} - ${error.response.statusText}`);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error: No response received');
    } else {
      // Something happened in setting up the request
      console.error('Request configuration error:', error.message);
    }
    throw error;
  }
}
```

This pattern allows you to:

1. Handle HTTP errors (where `error.response` exists)
2. Handle network errors (where `error.request` exists but not `error.response`)
3. Handle request setup errors (like malformed URLs)

## Building Custom Error Handling Strategies

Now that we understand the basics, let's look at several custom error handling strategies.

### Strategy 1: HTTP Status Code Handling

Different HTTP status codes often require different responses from your application:

```javascript
import axios from 'axios';

async function fetchWithStatusHandling(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (!error.response) {
      // Network error
      console.error('Network error - please check your connection');
      throw new Error('Network unavailable');
    }
  
    // Handle based on status code
    switch (error.response.status) {
      case 400:
        console.error('Bad request - check your input data');
        throw new Error('Invalid request data');
    
      case 401:
        console.error('Unauthorized - you need to log in');
        // You might trigger a login flow here
        throw new Error('Authentication required');
    
      case 403:
        console.error('Forbidden - you don\'t have access');
        throw new Error('Access denied');
    
      case 404:
        console.error(`Resource not found at ${url}`);
        throw new Error('Resource not found');
    
      case 500:
      case 502:
      case 503:
      case 504:
        console.error('Server error - please try again later');
        throw new Error('Server temporarily unavailable');
    
      default:
        console.error(`Unexpected error: ${error.response.status}`);
        throw new Error('An unexpected error occurred');
    }
  }
}
```

This approach allows you to:

1. Provide user-friendly error messages based on the specific error
2. Take specific actions based on error types (like redirecting to login for 401 errors)
3. Centralize your error handling logic

### Strategy 2: Creating a Custom Error Service

For larger applications, it's often beneficial to create a dedicated error handling service:

```javascript
// errorService.js
class ErrorService {
  constructor() {
    this.handlers = {
      networkError: () => console.error('Network error occurred'),
      badRequest: (err) => console.error('Bad request:', err.response?.data),
      unauthorized: () => console.error('Authentication required'),
      forbidden: () => console.error('Access denied'),
      notFound: (err) => console.error(`Resource not found: ${err.config.url}`),
      serverError: () => console.error('Server error - please try again later'),
      default: (err) => console.error('Unknown error occurred', err.message)
    };
  }
  
  // Allow custom handlers to be registered
  registerHandler(type, handler) {
    this.handlers[type] = handler;
  }
  
  // Process an error based on its type
  handleError(error) {
    if (!error.response) {
      return this.handlers.networkError(error);
    }
  
    const status = error.response.status;
  
    if (status === 400) {
      return this.handlers.badRequest(error);
    } else if (status === 401) {
      return this.handlers.unauthorized(error);
    } else if (status === 403) {
      return this.handlers.forbidden(error);
    } else if (status === 404) {
      return this.handlers.notFound(error);
    } else if (status >= 500) {
      return this.handlers.serverError(error);
    } else {
      return this.handlers.default(error);
    }
  }
}

export default new ErrorService();
```

Then you can use it in your API calls:

```javascript
import axios from 'axios';
import errorService from './errorService';

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    errorService.handleError(error);
    throw error;
  }
}
```

This pattern:

1. Centralizes all error handling logic
2. Makes error handling behaviors customizable
3. Provides a single place to update error handling across the application

### Strategy 3: Axios Interceptors for Global Error Handling

Axios provides interceptors that can handle errors globally for all requests:

```javascript
import axios from 'axios';

// Create an axios instance with custom config
const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {'Content-Type': 'application/json'}
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
  response => response,  // Simply return successful responses
  error => {
    // Global error handling logic
    if (!error.response) {
      console.error('Network error - please check your connection');
    } else {
      const status = error.response.status;
    
      if (status === 401) {
        // Handle authentication errors
        console.error('Authentication required - redirecting to login');
        // You could redirect to login here or refresh tokens
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Access denied to this resource');
      } else if (status === 404) {
        console.error(`Resource not found: ${error.config.url}`);
      } else if (status >= 500) {
        console.error('Server error - our team has been notified');
        // You could send error details to your monitoring service here
      }
    }
  
    // Always reject the promise so local catch blocks can still execute
    return Promise.reject(error);
  }
);

// Now you can use the api instance for requests
async function fetchUsers() {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    // This catch will still run after the interceptor
    // Handle specific errors for this request if needed
    console.error('Error in fetchUsers:', error.message);
    return [];
  }
}
```

Interceptors provide a powerful way to:

1. Handle common errors in a single place
2. Execute global logic for certain error types (like redirecting on authentication errors)
3. Preprocess error objects before they reach your components

## Advanced Error Handling Strategies

Let's explore more sophisticated error handling approaches.

### Strategy 4: Automatic Retry for Transient Errors

Some errors (like network timeouts) are transient and can be automatically retried:

```javascript
import axios from 'axios';

async function fetchWithRetry(url, options = {}) {
  // Set defaults
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;
  const retryableStatuses = options.retryableStatuses || [408, 500, 502, 503, 504];
  
  let retries = 0;
  
  const executeRequest = async () => {
    try {
      return await axios.get(url);
    } catch (error) {
      // Determine if we should retry
      const isRetryable = 
        // Network error
        !error.response ||
        // Server error with retryable status
        (error.response && retryableStatuses.includes(error.response.status));
    
      // Check if we've hit max retries
      if (!isRetryable || retries >= maxRetries) {
        throw error;
      }
    
      // Increment retry counter
      retries++;
    
      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(2, retries - 1);
    
      console.log(`Request failed, retrying (${retries}/${maxRetries}) in ${delay}ms...`);
    
      // Wait for the delay period
      await new Promise(resolve => setTimeout(resolve, delay));
    
      // Try the request again
      return executeRequest();
    }
  };
  
  return executeRequest();
}

// Usage
async function fetchData() {
  try {
    const response = await fetchWithRetry('/api/data', {
      maxRetries: 3,
      retryDelay: 1000,
      retryableStatuses: [500, 503]
    });
  
    return response.data;
  } catch (error) {
    console.error('All retries failed:', error.message);
    throw error;
  }
}
```

This strategy:

1. Automatically retries failed requests that might succeed on a retry
2. Uses exponential backoff to prevent overwhelming the server
3. Allows customization of which errors should trigger retries

### Strategy 5: Error Response Transformations

Sometimes you want to transform error responses into standardized formats:

```javascript
import axios from 'axios';

// Create an axios instance with transforms
const api = axios.create({
  baseURL: 'https://api.example.com'
});

// Add a response interceptor that transforms errors
api.interceptors.response.use(
  response => response,
  error => {
    // Create a standardized error object
    const standardError = {
      status: error.response?.status || 0,
      message: '',
      originalError: error,
      timestamp: new Date().toISOString()
    };
  
    // Fill in message based on error type
    if (!error.response) {
      standardError.message = 'Network error - unable to reach server';
      standardError.code = 'NETWORK_ERROR';
    } else {
      const status = error.response.status;
      standardError.data = error.response.data;
    
      // Try to extract a message from the response
      if (typeof error.response.data === 'object' && error.response.data.message) {
        standardError.message = error.response.data.message;
      } else if (typeof error.response.data === 'string') {
        standardError.message = error.response.data;
      } else {
        standardError.message = `Error ${status}: ${error.response.statusText}`;
      }
    
      if (status === 400) standardError.code = 'BAD_REQUEST';
      else if (status === 401) standardError.code = 'UNAUTHORIZED';
      else if (status === 403) standardError.code = 'FORBIDDEN';
      else if (status === 404) standardError.code = 'NOT_FOUND';
      else if (status >= 500) standardError.code = 'SERVER_ERROR';
      else standardError.code = 'UNKNOWN_ERROR';
    }
  
    // Create a new error with the standardized format
    const enhancedError = new Error(standardError.message);
    enhancedError.standardError = standardError;
  
    return Promise.reject(enhancedError);
  }
);

// Using the transformed errors
async function fetchUserProfile(userId) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    // Now you can use the standardized error format
    const { code, message, status } = error.standardError;
  
    console.error(`Error (${code}): ${message}`);
  
    // You could also take different actions based on the standardized code
    if (code === 'UNAUTHORIZED') {
      // Redirect to login
    }
  
    throw error;
  }
}
```

This approach:

1. Creates a consistent error format across your application
2. Makes it easier to handle errors in a uniform way
3. Preserves the original error data while adding structure

### Strategy 6: Contextual Error Handling

In complex applications, you might want to provide context-specific error handling:

```javascript
import axios from 'axios';

// Create a function that returns a configured axios instance for a specific context
function createContextClient(context) {
  const client = axios.create({
    baseURL: 'https://api.example.com'
  });
  
  // Add context-specific error handling
  client.interceptors.response.use(
    response => response,
    error => {
      // Add context to the error
      error.context = context;
    
      // Apply context-specific handling
      if (context === 'auth') {
        if (error.response?.status === 401) {
          console.error('Authentication failed - please check your credentials');
        } else if (!error.response) {
          console.error('Cannot reach authentication server - please try again later');
        }
      } else if (context === 'payment') {
        if (error.response?.status === 402) {
          console.error('Payment required - please update your payment information');
        } else if (error.response?.status >= 500) {
          console.error('Payment system temporarily unavailable - your card has not been charged');
        }
      } else if (context === 'data') {
        if (error.response?.status === 404) {
          console.error('The requested data could not be found');
        }
      }
    
      return Promise.reject(error);
    }
  );
  
  return client;
}

// Usage
const authClient = createContextClient('auth');
const paymentClient = createContextClient('payment');
const dataClient = createContextClient('data');

async function login(username, password) {
  try {
    const response = await authClient.post('/login', { username, password });
    return response.data;
  } catch (error) {
    // Context-specific error handling already applied
    throw error;
  }
}

async function makePayment(paymentDetails) {
  try {
    const response = await paymentClient.post('/payments', paymentDetails);
    return response.data;
  } catch (error) {
    // Context-specific error handling already applied
    throw error;
  }
}
```

This pattern allows you to:

1. Create specialized API clients for different parts of your application
2. Apply domain-specific error handling logic
3. Keep error handling close to the business logic it supports

## Error Logging and Monitoring

A crucial part of error handling is ensuring errors are properly logged and monitored.

### Strategy 7: Detailed Error Logging

```javascript
import axios from 'axios';

// Create a logging service
const logger = {
  error(message, error) {
    // Basic implementation - you would replace this with your logging service
    console.error(message, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      timestamp: new Date().toISOString(),
      errorMessage: error.message,
      // Don't include request/response body to avoid sensitive data
    });
  
    // In a real implementation, you might send this to your logging service:
    // logService.sendError(message, errorData);
  }
};

// Create an axios instance with logging
const api = axios.create({
  baseURL: 'https://api.example.com'
});

// Add logging interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Create a descriptive message
    let message = 'API request failed';
  
    if (!error.response) {
      message = `Network error for ${error.config.method} ${error.config.url}`;
    } else {
      message = `HTTP ${error.response.status} on ${error.config.method} ${error.config.url}`;
    }
  
    // Log the error with details
    logger.error(message, error);
  
    return Promise.reject(error);
  }
);
```

This approach:

1. Creates detailed error logs for debugging
2. Centralizes the logging format for consistency
3. Avoids logging sensitive information

## Practical Implementation Example

Let's bring everything together in a practical example of a complete error handling strategy for an application:

```javascript
import axios from 'axios';

// Configure the base axios instance
const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Error codes that we may want to retry
const RETRYABLE_ERROR_CODES = [
  'ECONNRESET', 
  'ETIMEDOUT', 
  'ECONNABORTED'
];

// HTTP status codes that we may want to retry
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Create error categories
const ERROR_CATEGORIES = {
  NETWORK: 'network_error',
  AUTH: 'authentication_error',  
  VALIDATION: 'validation_error',
  NOT_FOUND: 'not_found',
  SERVER: 'server_error',
  UNKNOWN: 'unknown_error'
};

// Create a standardized error handler
const errorHandler = {
  // Categorize the error
  categorizeError(error) {
    if (!error.response) {
      return ERROR_CATEGORIES.NETWORK;
    }
  
    const status = error.response.status;
  
    if (status === 401 || status === 403) {
      return ERROR_CATEGORIES.AUTH;
    } else if (status === 400 || status === 422) {
      return ERROR_CATEGORIES.VALIDATION;
    } else if (status === 404) {
      return ERROR_CATEGORIES.NOT_FOUND;
    } else if (status >= 500) {
      return ERROR_CATEGORIES.SERVER;
    } else {
      return ERROR_CATEGORIES.UNKNOWN;
    }
  },
  
  // Determine if the error should be retried
  isRetryable(error, retryCount, maxRetries) {
    // Don't retry if we've hit the max
    if (retryCount >= maxRetries) {
      return false;
    }
  
    // Network errors can be retried
    if (!error.response) {
      return RETRYABLE_ERROR_CODES.includes(error.code);
    }
  
    // Certain HTTP status codes can be retried
    return RETRYABLE_STATUS_CODES.includes(error.response.status);
  },
  
  // Format the error for display
  formatErrorForUser(error) {
    const category = this.categorizeError(error);
  
    switch(category) {
      case ERROR_CATEGORIES.NETWORK:
        return 'Network error - please check your connection and try again';
    
      case ERROR_CATEGORIES.AUTH:
        return 'Authentication error - please log in again';
    
      case ERROR_CATEGORIES.VALIDATION:
        // Try to extract validation errors from the response
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          if (Array.isArray(errors)) {
            return `Validation error: ${errors.join(', ')}`;
          } else if (typeof errors === 'object') {
            // Convert object of errors to string
            const errorMessages = Object.entries(errors)
              .map(([field, msg]) => `${field}: ${msg}`)
              .join(', ');
            return `Validation error: ${errorMessages}`;
          }
        }
        return 'Validation error - please check your input and try again';
    
      case ERROR_CATEGORIES.NOT_FOUND:
        return 'The requested resource could not be found';
    
      case ERROR_CATEGORIES.SERVER:
        return 'Server error - our team has been notified';
    
      default:
        return 'An unexpected error occurred';
    }
  },
  
  // Log the error
  logError(error) {
    const category = this.categorizeError(error);
    const details = {
      category,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    };
  
    console.error(`API Error [${category}]:`, details);
    // In a real app, you'd send this to your error tracking service
  },
  
  // Take action based on error category
  handleError(error) {
    const category = this.categorizeError(error);
  
    // Log all errors
    this.logError(error);
  
    // Take category-specific actions
    switch(category) {
      case ERROR_CATEGORIES.AUTH:
        // For auth errors, we might want to redirect to login
        console.log('Redirecting to login due to authentication error');
        // window.location.href = '/login';
        break;
    
      case ERROR_CATEGORIES.SERVER:
        // For server errors, we might want to notify our monitoring service
        console.log('Notifying monitoring service of server error');
        // monitoringService.notify(error);
        break;
    
      // Add other category-specific handling as needed
    }
  
    // Return user-friendly message
    return this.formatErrorForUser(error);
  }
};

// Create a request function with retry capability
async function makeRequest(config, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;
  let retryCount = 0;
  
  while (true) {
    try {
      return await api(config);
    } catch (error) {
      // Check if we should retry
      if (errorHandler.isRetryable(error, retryCount, maxRetries)) {
        retryCount++;
      
        // Calculate delay with exponential backoff
        const delay = retryDelay * Math.pow(2, retryCount - 1);
        console.log(`Retrying request (${retryCount}/${maxRetries}) in ${delay}ms...`);
      
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    
      // If we shouldn't retry or have exhausted retries, handle the error
      const userMessage = errorHandler.handleError(error);
    
      // Create an enhanced error with the user message
      const enhancedError = new Error(userMessage);
      enhancedError.originalError = error;
      enhancedError.userMessage = userMessage;
    
      throw enhancedError;
    }
  }
}

// Usage example
async function fetchUserProfile(userId) {
  try {
    const response = await makeRequest({
      url: `/users/${userId}`,
      method: 'get'
    }, {
      maxRetries: 2
    });
  
    return response.data;
  } catch (error) {
    // At this point, error has been enhanced with a user-friendly message
    console.error(error.userMessage);
  
    // We can still access the original error if needed
    // console.error(error.originalError);
  
    // Rethrow or handle as needed
    throw error;
  }
}
```

This comprehensive example:

1. Creates a reusable error handling system
2. Implements automatic retries with exponential backoff
3. Categorizes errors for consistent handling
4. Formats user-friendly error messages
5. Provides logging and monitoring hooks
6. Enhances errors with additional context

## Conclusion

Building effective error handling in Axios requires a thoughtful approach that starts with understanding the error structures provided by Axios and builds up to comprehensive strategies that can handle all types of failures gracefully.

> "The true measure of a system's robustness is not in how it performs when everything goes right, but in how it responds when things go wrong."

As you implement these patterns, remember that good error handling:

1. Is proactive, not reactive
2. Provides meaningful information to users
3. Gives developers the details they need to diagnose issues
4. Handles failures gracefully with retries when appropriate
5. Centralizes common error handling logic
6. Is customized to your application's specific needs

By applying these principles and strategies, you can create a robust error handling system that enhances both the user experience and the maintainability of your application.
