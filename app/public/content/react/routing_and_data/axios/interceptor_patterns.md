
# Understanding Axios Interceptors from First Principles

When we build web applications, communication with servers is a fundamental requirement. Let's start by understanding the core concepts that lead us to interceptors.

## HTTP Communication Fundamentals

At its core, web applications communicate with servers using HTTP requests. These requests follow a standard pattern:

> A client initiates a request to a server, the server processes this request, and returns a response. This simple pattern is the foundation of the web as we know it.

When building React applications, we need to manage these HTTP communications effectively, which includes handling cross-cutting concerns like authentication and logging.

## The Problem Space: Cross-Cutting Concerns

Before diving into interceptors, let's understand the problem they solve.

When making API calls in a React application, certain operations need to be performed consistently across many or all requests:

1. Adding authentication tokens to outgoing requests
2. Logging request/response details
3. Handling errors uniformly
4. Refreshing expired tokens
5. Transforming request/response data

Without a centralized approach, these concerns would need to be implemented repeatedly in each component making API calls, violating the DRY (Don't Repeat Yourself) principle and making maintenance difficult.

## Enter Axios

Axios is a popular HTTP client library for JavaScript. It provides a simple API for making HTTP requests from browsers and Node.js.

```javascript
// Basic Axios usage
import axios from 'axios';

// Making a GET request
axios.get('https://api.example.com/users')
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

In this simple example, we're making a GET request to fetch users. But what if we need to attach an authorization token to this request? Or log the request details? We could add this logic directly to each request:

```javascript
// Without interceptors - repetitive code
axios.get('https://api.example.com/users', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})
  .then(response => {
    console.log('Request successful:', {
      url: 'https://api.example.com/users',
      method: 'GET',
      status: response.status
    });
    return response.data;
  })
  .catch(error => {
    console.error('Request failed:', error);
    throw error;
  });
```

This approach would require repeating the same code for every request, which is not maintainable.

## The Interceptor Pattern

The interceptor pattern is a behavioral design pattern that allows you to define code that is executed before or after certain operations. In the context of HTTP requests, interceptors let you:

> Define logic that runs either before a request is sent or after a response is received, creating a pipeline through which all HTTP communication flows.

Axios implements this pattern through its interceptor API.

## Axios Interceptors: The Core Concept

Axios provides two types of interceptors:

1. **Request Interceptors** : Execute before a request is sent
2. **Response Interceptors** : Execute after a response is received

The flow looks like this:

```
Your App → Request Interceptors → Server → Response Interceptors → Your App
```

Let's see how to implement them:

```javascript
// Adding interceptors
import axios from 'axios';

// Create an instance (recommended practice)
const api = axios.create({
  baseURL: 'https://api.example.com'
});

// Request interceptor
api.interceptors.request.use(
  config => {
    // Code executed before request is sent
    return config;
  },
  error => {
    // Code executed if request error
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    // Code executed with successful response
    return response;
  },
  error => {
    // Code executed if response error
    return Promise.reject(error);
  }
);
```

This structure gives us control points where we can inject our cross-cutting concerns.

## Authentication Interceptor

Now let's implement an authentication interceptor that adds a JWT token to every request:

```javascript
// Authentication interceptor
api.interceptors.request.use(config => {
  // Get token from localStorage
  const token = localStorage.getItem('authToken');
  
  // If token exists, add it to request headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

This simple interceptor checks if an authentication token exists in localStorage, and if so, adds it to the request headers.

Let's understand this in detail:

1. We're using the `request.use()` method, which accepts two functions - one for successful interception and one for errors.
2. The first function receives the request `config` object, which contains all request configurations.
3. We modify the `config` object by adding our Authorization header.
4. Finally, we return the modified `config` to continue the request pipeline.

## Logging Interceptor

Next, let's implement a logging interceptor to track our API calls:

```javascript
// Request logging
api.interceptors.request.use(config => {
  // Log outgoing request
  console.log(`REQUEST: [${config.method.toUpperCase()}] ${config.url}`, {
    headers: config.headers,
    data: config.data
  });
  
  // Add timestamp to track request duration
  config.metadata = { startTime: new Date() };
  
  return config;
});

// Response logging
api.interceptors.response.use(
  response => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
  
    // Log response details
    console.log(`RESPONSE: [${response.status}] ${response.config.url}`, {
      duration: `${duration}ms`, 
      data: response.data
    });
  
    return response;
  },
  error => {
    // Check if error has response
    if (error.response) {
      const duration = new Date() - error.response.config.metadata.startTime;
    
      // Log error response
      console.error(`ERROR: [${error.response.status}] ${error.response.config.url}`, {
        duration: `${duration}ms`,
        data: error.response.data
      });
    } else {
      console.error('REQUEST ERROR:', error.message);
    }
  
    return Promise.reject(error);
  }
);
```

This logging interceptor:

1. Logs details about outgoing requests
2. Adds a timestamp to measure request duration
3. Logs successful responses with timing information
4. Logs error responses with appropriate details

## Putting It All Together: Creating an Axios Instance with Interceptors

Now, let's create a complete Axios setup with both authentication and logging interceptors in a reusable format:

```javascript
// api.js - A reusable Axios instance with interceptors
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.example.com',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Authentication interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  
    // Add timestamp for measuring duration
    config.metadata = { startTime: new Date() };
  
    // Log request
    if (process.env.NODE_ENV !== 'production') {
      console.log(`REQUEST: [${config.method?.toUpperCase()}] ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }
  
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response/error handling interceptor
api.interceptors.response.use(
  response => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
  
    // Log successful response in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`RESPONSE: [${response.status}] ${response.config.url}`, {
        duration: `${duration}ms`,
        data: response.data
      });
    }
  
    return response;
  },
  async error => {
    if (error.response) {
      const { status, config } = error.response;
    
      // Calculate request duration
      const duration = config.metadata ? new Date() - config.metadata.startTime : 'unknown';
    
      // Log error response in development
      if (process.env.NODE_ENV !== 'production') {
        console.error(`ERROR: [${status}] ${config.url}`, {
          duration: `${duration}ms`,
          data: error.response.data
        });
      }
    
      // Handle unauthorized errors (401)
      if (status === 401) {
        // Clear invalid token
        localStorage.removeItem('authToken');
      
        // Redirect to login (if using React Router)
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
  
    return Promise.reject(error);
  }
);

export default api;
```

## Using Our Enhanced Axios Instance in React Components

Now that we've created a robust Axios instance with authentication and logging interceptors, let's see how to use it in React components:

```javascript
// UserProfile.js - A React component using our enhanced API
import React, { useState, useEffect } from 'react';
import api from '../utils/api'; // Our custom axios instance with interceptors

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        // Notice we don't need to handle auth token here - the interceptor does it
        const response = await api.get('/user/profile');
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        // Error handling is simplified - 401s already redirected by interceptor
        setError('Failed to load profile');
        setLoading(false);
      }
    };
  
    fetchUserProfile();
  }, []);
  
  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      {/* Other profile details */}
    </div>
  );
}

export default UserProfile;
```

Notice how clean this component is. We don't need to:

* Add auth tokens to requests
* Manually log requests and responses
* Handle 401 unauthorized responses
* Deal with complex error states

All of that is handled by our interceptors.

## Advanced Use Case: Token Refresh

Let's look at a more advanced use case. JWT tokens typically expire after a certain period. We can use interceptors to automatically refresh tokens:

```javascript
// Token refresh interceptor
let isRefreshing = false;
let failedQueue = [];

// Process queued requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
  
    // If error is 401 Unauthorized and we haven't tried refreshing
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
    
      // Mark as retried to prevent infinite loop
      originalRequest._retry = true;
      isRefreshing = true;
    
      try {
        // Get refresh token
        const refreshToken = localStorage.getItem('refreshToken');
      
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
      
        // Call refresh token endpoint
        const response = await axios.post('/auth/refresh', {
          refresh_token: refreshToken
        });
      
        // Get new tokens
        const { token, refreshToken: newRefreshToken } = response.data;
      
        // Store new tokens
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', newRefreshToken);
      
        // Update authorization header
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;
      
        // Process queued requests
        processQueue(null, token);
      
        // Return original request with new token
        return api(originalRequest);
      } catch (err) {
        // If refresh fails, logout user
        processQueue(err, null);
      
        // Clear tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      
        // Redirect to login
        window.location.href = '/login';
      
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
  
    return Promise.reject(error);
  }
);
```

This interceptor:

1. Detects 401 Unauthorized responses
2. Attempts to refresh the token
3. Queues any concurrent requests that failed with 401
4. Retries all failed requests with the new token
5. Redirects to login if refresh fails

## Organizing Interceptors in a Real Application

In a real application, it's better to organize interceptors into separate modules:

```javascript
// interceptors/auth.js
export const setupAuthInterceptors = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );
  
  // Return function to remove interceptors if needed
  return {
    eject: () => {
      // Store interceptor IDs and eject them here
    }
  };
};

// interceptors/logging.js
export const setupLoggingInterceptors = (axiosInstance) => {
  const requestInterceptor = axiosInstance.interceptors.request.use(
    config => {
      config.metadata = { startTime: new Date() };
      console.log(`REQUEST: [${config.method?.toUpperCase()}] ${config.url}`);
      return config;
    },
    error => Promise.reject(error)
  );
  
  const responseInterceptor = axiosInstance.interceptors.response.use(
    response => {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`RESPONSE: [${response.status}] ${response.config.url} (${duration}ms)`);
      return response;
    },
    error => {
      if (error.response) {
        const duration = new Date() - error.response.config.metadata.startTime;
        console.error(`ERROR: [${error.response.status}] ${error.response.config.url} (${duration}ms)`);
      }
      return Promise.reject(error);
    }
  );
  
  return {
    eject: () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    }
  };
};

// api.js
import axios from 'axios';
import { setupAuthInterceptors } from './interceptors/auth';
import { setupLoggingInterceptors } from './interceptors/logging';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000
});

// Setup interceptors
setupAuthInterceptors(api);
setupLoggingInterceptors(api);

export default api;
```

This modular approach makes testing and maintenance easier.

## Creating a Custom Hook for API Calls

Let's create a custom React hook that uses our enhanced Axios instance:

```javascript
// useApi.js - A custom hook for API calls
import { useState, useEffect } from 'react';
import api from '../utils/api';

// A generic hook for API calls
export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { method = 'GET', body = null, dependencies = [] } = options;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
      
        let response;
        switch (method.toUpperCase()) {
          case 'GET':
            response = await api.get(endpoint);
            break;
          case 'POST':
            response = await api.post(endpoint, body);
            break;
          case 'PUT':
            response = await api.put(endpoint, body);
            break;
          case 'DELETE':
            response = await api.delete(endpoint);
            break;
          default:
            response = await api.get(endpoint);
        }
      
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data || err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [endpoint, method, ...dependencies]);
  
  return { data, loading, error };
};

// Example usage:
// const { data: users, loading, error } = useApi('/users');
```

With this hook, making authenticated API calls becomes even simpler in our components.

## Testing Interceptors

Testing is crucial for robust applications. Here's how to test our interceptors using Jest:

```javascript
// auth.interceptor.test.js
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { setupAuthInterceptors } from './interceptors/auth';

describe('Auth Interceptor', () => {
  let mock;
  let api;
  
  beforeEach(() => {
    // Create fresh axios instance for each test
    api = axios.create();
    mock = new MockAdapter(api);
  
    // Setup interceptors on test instance
    setupAuthInterceptors(api);
  
    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
  });
  
  afterEach(() => {
    mock.restore();
    jest.clearAllMocks();
  });
  
  test('adds auth token to request when available', async () => {
    // Mock localStorage to return a token
    localStorage.getItem.mockReturnValue('test-token');
  
    // Setup mock response
    mock.onGet('/test').reply(config => {
      // Check that token was added to Authorization header
      expect(config.headers.Authorization).toBe('Bearer test-token');
      return [200, { success: true }];
    });
  
    // Make the request
    await api.get('/test');
  
    // Verify localStorage was called
    expect(localStorage.getItem).toHaveBeenCalledWith('authToken');
  });
  
  test('does not add auth token when not available', async () => {
    // Mock localStorage to return null
    localStorage.getItem.mockReturnValue(null);
  
    // Setup mock response
    mock.onGet('/test').reply(config => {
      // Check that Authorization header is not present
      expect(config.headers.Authorization).toBeUndefined();
      return [200, { success: true }];
    });
  
    // Make the request
    await api.get('/test');
  });
});
```

## Common Pitfalls and How to Avoid Them

When working with Axios interceptors, be aware of these common issues:

1. **Circular dependencies** :

* Don't import the same module that exports the interceptor in your interceptor code

1. **Infinite loops in error handling** :

* Use flags like `_retry` to prevent retrying the same request infinitely

1. **Overusing interceptors** :

* Don't put business logic in interceptors; keep them focused on cross-cutting concerns

1. **Not handling all error cases** :

* Remember that errors can occur at different points (request setup, no response, bad response)

1. **Forgetting to clean up** :

* Store interceptor IDs and eject them when components unmount in React

## Performance Considerations

Interceptors add overhead to every request. To optimize performance:

1. Keep interceptor logic lightweight
2. Only log in development mode
3. Use conditional logic to skip unnecessary processing
4. Consider using request debouncing for frequent API calls

## Conclusion

Axios interceptors are a powerful pattern for managing cross-cutting concerns like authentication and logging in React applications. By centralizing these concerns, you create more maintainable, DRY code.

The key takeaways are:

> Interceptors let you define logic that executes before requests and after responses, creating a pipeline for HTTP communications.

> Authentication interceptors automatically add tokens to requests, while logging interceptors provide visibility into API interactions.

> Advanced patterns like token refresh can be implemented using interceptors, making your React applications more robust.

By organizing your interceptors into modular, testable code and integrating them with custom hooks, you can build React applications that are both powerful and maintainable.

Remember that interceptors should focus on cross-cutting concerns, not business logic, and be careful about potential pitfalls like infinite loops and circular dependencies.
