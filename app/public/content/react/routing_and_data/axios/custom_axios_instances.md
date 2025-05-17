# Custom Axios Instances and Defaults in React from First Principles

I'll explain custom Axios instances and defaults in React by starting from absolute first principles. Let's build this knowledge step-by-step with clear examples throughout.

## Understanding HTTP and Client-Server Communication

> The foundation of web applications is communication between clients and servers. Before we can understand Axios, we need to understand this fundamental interaction.

In web applications, your React application (the client) needs to communicate with servers to fetch or send data. This communication happens through HTTP (Hypertext Transfer Protocol) requests.

HTTP requests have several components:

* URL (the address of the resource)
* Method (GET, POST, PUT, DELETE, etc.)
* Headers (metadata about the request)
* Body (data sent with the request, for methods like POST)

For example, when you visit a website, your browser sends a GET request to the server, which responds with HTML, CSS, and JavaScript.

## What is Axios?

> Axios is a promise-based HTTP client for JavaScript. Think of it as a specialized messenger that knows exactly how to communicate with servers using HTTP protocols.

Axios simplifies the process of making HTTP requests from your JavaScript/React applications. It provides an elegant API that abstracts away many complexities of the XMLHttpRequest object or the Fetch API.

Let's see a basic Axios request:

```javascript
import axios from 'axios';

// Making a GET request
axios.get('https://api.example.com/data')
  .then(response => {
    console.log('Data received:', response.data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
```

In this simple example, we're:

1. Importing the axios library
2. Making a GET request to 'https://api.example.com/data'
3. Handling the response with a promise chain
4. Catching any errors that might occur

## Understanding Axios Instances

> An Axios instance is like creating your own customized messenger with specific default settings. Instead of configuring each message individually, you configure your messenger once.

By default, when you import Axios, you're using the global Axios instance. However, in complex applications, you often need to communicate with different APIs that might require different default settings. This is where custom Axios instances come in.

Let's create a simple custom instance:

```javascript
import axios from 'axios';

// Create a custom instance
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000, // 5 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Now use this custom instance
apiClient.get('/users')
  .then(response => {
    console.log('Users:', response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

In this example:

1. We create a custom instance with `axios.create()`
2. We configure it with default settings (baseURL, timeout, headers)
3. We use this instance to make requests, which will automatically apply our defaults

The key benefit here is that `apiClient.get('/users')` automatically prepends the baseURL, making the full URL 'https://api.example.com/users'. It also applies the timeout and headers to every request.

## Common Configuration Options for Axios Instances

Axios instances can be configured with numerous options. Let's look at some of the most common ones:

1. **baseURL** : The base URL that will be prepended to all request URLs
2. **timeout** : Maximum time a request can take before automatically being terminated
3. **headers** : Default headers to be sent with every request
4. **auth** : Basic authentication credentials
5. **responseType** : Type of data the server will respond with
6. **transformRequest/transformResponse** : Functions to modify data before sending or after receiving

Example with more options:

```javascript
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Custom-Header': 'CustomValue'
  },
  auth: {
    username: 'apiuser',
    password: 'apipassword'
  },
  responseType: 'json',
  // Transform the response data
  transformResponse: [function (data) {
    // Do something with the response data
    return data;
  }]
});
```

Each of these settings helps customize how your application communicates with the server.

## Practical Example: Multiple API Services in React

Let's say your React application needs to communicate with both a main API and an authentication service. Each requires different base URLs and default headers.

```javascript
// apiService.js
import axios from 'axios';

// Main API service
export const mainApi = axios.create({
  baseURL: 'https://api.myapp.com/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth service
export const authApi = axios.create({
  baseURL: 'https://auth.myapp.com',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

Now in your React components, you can import and use these services:

```javascript
// UserProfile.js
import React, { useEffect, useState } from 'react';
import { mainApi } from './apiService';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Using our custom instance
    mainApi.get(`/users/${userId}`)
      .then(response => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

This component uses our `mainApi` instance to fetch user data. The benefits include:

* Cleaner code (no need to repeat the base URL)
* Consistent settings across requests
* Easier maintenance (change the base URL in one place)

## Axios Defaults: Global vs. Instance Configuration

> Axios allows you to set defaults at both the global level (affecting all requests) and the instance level (affecting only requests made with that instance).

### Global Defaults

Global defaults affect all Axios requests in your application:

```javascript
// Set global defaults
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.headers.common['Authorization'] = 'Bearer YOUR_TOKEN';
axios.defaults.timeout = 5000;

// These settings will apply to all axios requests
axios.get('/users'); // Uses all the defaults above
```

### Instance Defaults

Instance defaults only affect requests made with that specific instance:

```javascript
const instance = axios.create();
instance.defaults.baseURL = 'https://api.differentservice.com';
instance.defaults.headers.common['X-Custom-Header'] = 'CustomValue';

// These settings only apply to this instance
instance.get('/data'); // Uses the instance defaults
```

### Changing Defaults After Creation

You can change defaults even after creating an instance:

```javascript
const api = axios.create({
  baseURL: 'https://api.example.com'
});

// Later in your code
api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
```

This is particularly useful for setting authentication tokens after a user logs in.

## Real-world Example: Authentication in React

Let's create a more complete example of handling authentication with Axios instances in a React application:

```javascript
// api.js
import axios from 'axios';

// Create an API instance
const api = axios.create({
  baseURL: 'https://api.myapp.com/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  config => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
  
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

Now let's see how we might use this in a React component:

```javascript
// LoginForm.js
import React, { useState } from 'react';
import api from './api';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      // Store the token
      localStorage.setItem('authToken', response.data.token);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <div>
        <label>Email:</label>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
      </div>
      <div>
        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
```

In this example:

1. We create a custom Axios instance with default settings
2. We add request interceptors that automatically add authentication tokens to requests
3. We add response interceptors that handle authentication errors
4. We use this instance in our login form component

## Axios Interceptors: Extending Instance Functionality

> Interceptors are like security checkpoints that all requests or responses must pass through. They allow you to examine or modify requests before they're sent or responses before they're handled.

Axios interceptors are powerful tools that let you:

* Add authentication tokens to outgoing requests
* Log requests and responses
* Transform data
* Handle errors consistently
* Implement caching

We saw interceptors in the previous example, but let's break them down:

### Request Interceptors

Request interceptors run before a request is sent:

```javascript
// Add a request interceptor
api.interceptors.request.use(
  config => {
    console.log('Request sent:', config);
    // Modify config here
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);
```

### Response Interceptors

Response interceptors run after a response is received:

```javascript
// Add a response interceptor
api.interceptors.response.use(
  response => {
    console.log('Response received:', response);
    // Modify response here
    return response;
  },
  error => {
    console.error('Response error:', error);
    // Handle error here
    return Promise.reject(error);
  }
);
```

### Removing Interceptors

You can remove interceptors if needed:

```javascript
// Add an interceptor
const myInterceptor = api.interceptors.request.use(function () {/*...*/});

// Remove the interceptor
api.interceptors.request.eject(myInterceptor);
```

## Creating a Complete API Service for React

Let's put everything together to create a robust API service for a React application:

```javascript
// apiService.js
import axios from 'axios';

// Environment variables
const API_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';
const API_TIMEOUT = process.env.REACT_APP_API_TIMEOUT || 10000;

// Create the API instance
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for API calls
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  
    // Add a timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
  
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  response => {
    // You can modify the response here
    return response;
  },
  async error => {
    const originalRequest = error.config;
  
    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
    
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });
      
        // Store the new token
        const newToken = response.data.token;
        localStorage.setItem('authToken', newToken);
      
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
  
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // User related API calls
  user: {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data) => api.put('/user/profile', data),
    getSettings: () => api.get('/user/settings'),
    updateSettings: (data) => api.put('/user/settings', data)
  },
  
  // Authentication related API calls
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    logout: () => api.post('/auth/logout')
  },
  
  // Generic methods
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
  patch: api.patch
};

export default api;
```

Using this service in a component:

```javascript
// UserDashboard.js
import React, { useEffect, useState } from 'react';
import { apiService } from './apiService';

function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Using our organized API service
    apiService.user.getProfile()
      .then(response => {
        setProfile(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Component rendering code...
}
```

This approach offers several advantages:

1. Organized API calls by domain (user, auth, etc.)
2. Consistent error handling and authentication
3. Environment-based configuration
4. Token refresh handling
5. Clean component code with descriptive method names

## Using Custom Hooks with Axios Instances

We can further improve our React integration by creating custom hooks:

```javascript
// useApi.js
import { useState, useEffect } from 'react';
import api from './apiService';

export function useGet(url, initialData = null) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  // Function to trigger a refetch
  const refetch = () => setRefetchIndex(prev => prev + 1);

  useEffect(() => {
    let isMounted = true;
  
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.get(url);
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
          setData(initialData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, refetchIndex, initialData]);

  return { data, loading, error, refetch };
}

export function usePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const postData = async (url, data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(url, data);
      setResponse(res.data);
      return res.data;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error, response };
}
```

Now we can use these hooks in our components:

```javascript
// UserList.js
import React from 'react';
import { useGet } from './useApi';

function UserList() {
  const { data: users, loading, error, refetch } = useGet('/users');

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Users</h1>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {users && users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// CreateUser.js
import React, { useState } from 'react';
import { usePost } from './useApi';

function CreateUser() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { postData, loading, error } = usePost();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postData('/users', { name, email });
      setName('');
      setEmail('');
      alert('User created!');
    } catch (err) {
      // Error is already handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

These custom hooks provide:

1. Cleaner component code
2. Reusable data fetching logic
3. Consistent loading and error handling
4. Refetch capabilities

## Best Practices for Axios Instances in React

To summarize, here are some best practices for using custom Axios instances in React applications:

1. **Create specialized instances for different APIs** :

```javascript
   const mainApi = axios.create({ baseURL: 'https://api.main.com' });
   const authApi = axios.create({ baseURL: 'https://api.auth.com' });
```

1. **Use environment variables for configuration** :

```javascript
   const api = axios.create({
     baseURL: process.env.REACT_APP_API_URL,
     timeout: parseInt(process.env.REACT_APP_TIMEOUT || '5000')
   });
```

1. **Implement request/response interceptors for cross-cutting concerns** :

```javascript
   api.interceptors.request.use(config => {
     // Add authentication, logging, etc.
     return config;
   });
```

1. **Create domain-specific API services** :

```javascript
   export const userService = {
     getProfile: () => api.get('/user'),
     updateProfile: (data) => api.put('/user', data)
   };
```

1. **Create custom hooks for data fetching** :

```javascript
   function useUser(userId) {
     // Use axios instance inside custom hooks
   }
```

1. **Handle authentication and token refresh consistently** :

```javascript
   // Use interceptors to handle 401 errors and token refresh
```

1. **Add proper error handling** :

```javascript
   try {
     const response = await api.get('/data');
   } catch (error) {
     if (error.response) {
       // Server responded with non-2xx status
     } else if (error.request) {
       // Request was made but no response received
     } else {
       // Error setting up the request
     }
   }
```

1. **Cancel requests when components unmount** :

```javascript
   useEffect(() => {
     const source = axios.CancelToken.source();
   
     api.get('/data', { cancelToken: source.token })
       .then(response => { /* ... */ })
       .catch(error => { /* ... */ });
   
     return () => {
       source.cancel('Component unmounted');
     };
   }, []);
```

## Conclusion

Custom Axios instances and defaults provide powerful tools for organizing and optimizing HTTP requests in React applications. By creating specialized instances, configuring defaults, implementing interceptors, and wrapping everything in custom hooks, you can create clean, maintainable, and robust code.

Starting from the basic concepts of HTTP and client-server communication, we've built up to advanced patterns for API integration in React. These techniques help manage the complexity of modern web applications and promote code reuse and organization.

Remember that the key benefits of custom Axios instances are:

* Consistent configuration across related requests
* Cleaner component code
* Centralized error handling
* Improved maintainability

By applying these principles, you'll be able to create React applications that efficiently and reliably communicate with backend services.
