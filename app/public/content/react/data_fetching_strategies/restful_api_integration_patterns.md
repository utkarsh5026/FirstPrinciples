# RESTful API Integration Patterns in React: A First Principles Guide

## Understanding REST from First Principles

> REST (Representational State Transfer) is an architectural style for designing networked applications that emphasizes a stateless client-server relationship where the server provides access to resources and the client accesses and presents those resources.

To truly understand RESTful API integration in React, we need to start with the fundamentals of what REST actually is and why it matters.

### What is REST?

REST was defined by Roy Fielding in his 2000 doctoral dissertation. At its core, REST is about resources - things like users, products, or articles. These resources are identified by URLs, and we interact with them using standard HTTP methods.

The key principles of REST include:

1. **Statelessness** : Each request from client to server must contain all information needed to understand and process the request.
2. **Resource-Based** : Everything is a resource that can be accessed using a unique identifier (URI).
3. **Standard HTTP Methods** : Resources are manipulated using standard HTTP methods:

* GET: Retrieve a resource
* POST: Create a new resource
* PUT/PATCH: Update a resource
* DELETE: Remove a resource

1. **Representation** : Resources are represented in a format (typically JSON) that can be transferred between client and server.

Let's see a simple example of what a RESTful resource might look like:

```
GET /api/users/123

Response:
{
  "id": 123,
  "name": "Alice Smith",
  "email": "alice@example.com"
}
```

Here, `/api/users/123` is a resource identifier, and the JSON response is a representation of that resource.

## RESTful API Integration in React: The Foundation

Before diving into specific patterns, let's understand how React applications typically interact with APIs.

React is primarily concerned with the view layer - rendering UI components based on application state. When integrating with RESTful APIs, we need to:

1. Fetch data from the server
2. Update component state with that data
3. Render components based on the state
4. Send data back to the server in response to user actions
5. Handle loading, success, and error states

### Basic API Integration Pattern

The most fundamental pattern for API integration in React involves:

```jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch user data
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
      
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
      
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

In this example:

* We use `useState` to manage the user data, loading state, and error state
* `useEffect` triggers the API call when the component mounts or when `userId` changes
* We handle all possible states: loading, error, and success
* The component renders different UI based on these states

This is the foundation of all RESTful API integration in React, but there are many patterns to improve upon this basic approach.

## Common RESTful API Integration Patterns in React

### 1. Fetch API (Native Browser API)

The Fetch API is built into modern browsers and provides a powerful way to make HTTP requests.

> The Fetch API represents a significant improvement over the older XMLHttpRequest, offering a more flexible, promise-based approach to making network requests.

Let's examine a complete example of using the Fetch API for CRUD operations:

```jsx
// GET request (Read)
const getUser = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
};

// POST request (Create)
const createUser = async (userData) => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
};

// PUT request (Update)
const updateUser = async (userId, userData) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
};

// DELETE request (Delete)
const deleteUser = async (userId) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  return await response.json();
};
```

Each function:

* Makes the appropriate HTTP request using the Fetch API
* Checks if the response was successful
* Throws an error if the request failed
* Returns the parsed JSON data if successful

### 2. Axios Library

Axios is a popular alternative to the Fetch API that offers additional features.

> Axios provides an easy-to-use API that works in both browsers and Node.js environments, with features like request/response interception, automatic JSON parsing, and built-in CSRF protection.

Here's how we might implement the same CRUD operations using Axios:

```jsx
import axios from 'axios';

// Create an axios instance with default settings
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// GET request (Read)
const getUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

// POST request (Create)
const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

// PUT request (Update)
const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

// DELETE request (Delete)
const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

// Helper function to handle Axios errors
const handleAxiosError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response error:', error.response.status, error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Request error:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error:', error.message);
  }
};
```

Key advantages of Axios over Fetch:

* Automatic JSON parsing
* Better error handling
* Request and response interceptors
* Request cancellation
* Automatic transformation of request and response data
* Works consistently across browsers

### 3. Custom Hooks Pattern

One of the most powerful patterns for API integration in React is to create custom hooks that encapsulate API logic.

> Custom hooks allow you to extract component logic into reusable functions, making your components cleaner and more focused on presentation rather than data fetching.

Here's an example of a custom hook for fetching a user:

```jsx
import { useState, useEffect } from 'react';

// Custom hook for fetching a user
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
  
    const fetchUser = async () => {
      try {
        setLoading(true);
      
        const response = await fetch(`/api/users/${userId}`);
      
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      
        const userData = await response.json();
      
        // Only update state if component is still mounted
        if (isMounted) {
          setUser(userData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchUser();
    }

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { user, loading, error };
}

// Using the custom hook in a component
function UserProfile({ userId }) {
  const { user, loading, error } = useUser(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

Key benefits of this pattern:

* Separation of concerns: API logic is separated from component rendering
* Reusability: The same hook can be used in multiple components
* Testability: Hooks can be tested independently from components
* Readability: Components become more focused on their presentation logic

We can extend this pattern to create a more generic data fetching hook:

```jsx
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;
  
    const fetchData = async () => {
      try {
        setLoading(true);
      
        const response = await fetch(url, {
          ...options,
          signal,
        });
      
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      
        const result = await response.json();
      
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && isMounted) {
          setError(err.message);
          setData(null);
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
      controller.abort();
    };
  }, [url, JSON.stringify(options)]);

  return { data, loading, error };
}
```

This hook adds request cancellation using the AbortController API, which is important for preventing memory leaks and race conditions.

### 4. React Query

React Query is a powerful library for managing server state in React applications.

> React Query provides a declarative, easy-to-use API for fetching, caching, synchronizing, and updating server state in your React applications.

Here's how we might use React Query to fetch and manage user data:

```jsx
import { useQuery, useMutation, useQueryClient } from 'react-query';

// API functions
const fetchUser = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const updateUser = async ({ userId, userData }) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  return response.json();
};

// Component using React Query
function UserProfile({ userId }) {
  const queryClient = useQueryClient();
  
  // Query for fetching user data
  const { data: user, isLoading, error } = useQuery(
    ['user', userId],
    () => fetchUser(userId),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
    }
  );
  
  // Mutation for updating user data
  const updateUserMutation = useMutation(updateUser, {
    onSuccess: (data) => {
      // Invalidate and refetch the user query
      queryClient.invalidateQueries(['user', userId]);
    
      // Alternatively, directly update the cached data
      queryClient.setQueryData(['user', userId], data);
    },
  });
  
  const handleSubmit = (newUserData) => {
    updateUserMutation.mutate({ userId, userData: newUserData });
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    
      {updateUserMutation.isLoading && <div>Updating...</div>}
      {updateUserMutation.isError && <div>Error: {updateUserMutation.error.message}</div>}
    
      {/* Form for updating user data */}
      <UserForm user={user} onSubmit={handleSubmit} />
    </div>
  );
}
```

Key features of React Query:

* Automatic caching and background refreshing
* Deduplication of requests
* Prefetching data
* Pagination and infinite scrolling helpers
* Optimistic updates
* Window focus refetching
* Automatic garbage collection
* Devtools for debugging

### 5. SWR (Stale-While-Revalidate)

SWR is another popular data fetching library created by the team at Vercel.

> SWR implements the stale-while-revalidate caching strategy that first returns cached (stale) data, then sends a fetch request, and finally returns up-to-date data.

Here's an example of using SWR for fetching and updating user data:

```jsx
import useSWR, { mutate } from 'swr';

// Fetcher function for SWR
const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Component using SWR
function UserProfile({ userId }) {
  const { data: user, error, isValidating } = useSWR(
    `/api/users/${userId}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );
  
  const updateUser = async (userData) => {
    try {
      // Optimistically update the local data
      mutate(
        `/api/users/${userId}`,
        { ...user, ...userData },
        false // Don't revalidate yet
      );
    
      // Send the request to update the server
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
    
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
    
      const updatedUser = await response.json();
    
      // Update the cache with the actual data from the server
      mutate(`/api/users/${userId}`, updatedUser);
    
      return updatedUser;
    } catch (error) {
      // If the update failed, revalidate to get the original data
      mutate(`/api/users/${userId}`);
      throw error;
    }
  };
  
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      {isValidating && <div>Refreshing...</div>}
    
      {/* Form for updating user data */}
      <UserForm user={user} onSubmit={updateUser} />
    </div>
  );
}
```

Key features of SWR:

* Focus revalidation (refresh when tab is focused)
* Revalidation on reconnect (refresh when the user is back online)
* Interval polling
* Deduplication of requests
* Request cancellation
* Pagination support
* TypeScript support

### 6. Redux with Middleware (Redux Toolkit and RTK Query)

For applications that already use Redux for state management, integrating API calls through Redux middleware is a common pattern.

> Redux Toolkit with RTK Query provides a powerful solution for managing API requests alongside your application state, offering caching, deduplication, and other advanced features.

Here's an example using Redux Toolkit and RTK Query:

```jsx
// api.js - Define the API slice
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    updateUser: builder.mutation({
      query: ({ userId, userData }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
  }),
});

export const {
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = api;

// store.js - Configure the Redux store
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// UserProfile.jsx - Component using RTK Query hooks
import React from 'react';
import { useGetUserQuery, useUpdateUserMutation } from './api';

function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useGetUserQuery(userId);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  
  const handleSubmit = async (userData) => {
    try {
      await updateUser({ userId, userData }).unwrap();
      // Success! The query will be automatically re-fetched
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      {isUpdating && <div>Updating...</div>}
    
      {/* Form for updating user data */}
      <UserForm user={user} onSubmit={handleSubmit} />
    </div>
  );
}
```

Key benefits of this approach:

* Centralized API definition
* Automatic caching and request deduplication
* Integration with Redux DevTools
* Cache invalidation through "tags"
* TypeScript support with generated hooks
* Optimistic updates and error handling
* Automatic re-fetching when needed

## Advanced Patterns and Best Practices

### Authentication Patterns

Authentication is a crucial aspect of RESTful API integration. Here's a pattern for handling authenticated API requests:

```jsx
// authService.js
const TOKEN_KEY = 'auth_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const login = async (credentials) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
  
    if (!response.ok) {
      throw new Error('Login failed');
    }
  
    const data = await response.json();
    setToken(data.token);
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  removeToken();
  // Optionally call a logout endpoint
};

// apiClient.js
import { getToken } from './authService';

export const createApiClient = () => {
  const client = async (endpoint, { body, ...customConfig } = {}) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
  
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    const config = {
      method: body ? 'POST' : 'GET',
      ...customConfig,
      headers: {
        ...headers,
        ...customConfig.headers,
      },
    };
  
    if (body) {
      config.body = JSON.stringify(body);
    }
  
    try {
      const response = await fetch(`/api/${endpoint}`, config);
    
      if (response.status === 401) {
        // Handle unauthorized access
        logout();
        window.location.href = '/login';
        return;
      }
    
      if (!response.ok) {
        throw new Error('API request failed');
      }
    
      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  };
  
  return {
    get: (endpoint, customConfig = {}) => 
      client(endpoint, { ...customConfig, method: 'GET' }),
    post: (endpoint, body, customConfig = {}) => 
      client(endpoint, { ...customConfig, body, method: 'POST' }),
    put: (endpoint, body, customConfig = {}) => 
      client(endpoint, { ...customConfig, body, method: 'PUT' }),
    delete: (endpoint, customConfig = {}) => 
      client(endpoint, { ...customConfig, method: 'DELETE' }),
  };
};

export const api = createApiClient();
```

This pattern:

* Manages authentication tokens in localStorage
* Automatically adds the token to API requests
* Handles unauthorized responses (e.g., expired tokens)
* Provides a consistent API for making authenticated requests

### Request Cancellation

Properly handling request cancellation is important for preventing memory leaks and race conditions:

```jsx
function useApi(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
  
    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true }));
    
      try {
        const response = await fetch(url, { signal });
      
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      
        const data = await response.json();
        setState({ data, loading: false, error: null });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setState({ data: null, loading: false, error: error.message });
        }
      }
    };
  
    fetchData();
  
    return () => {
      controller.abort();
    };
  }, [url]);
  
  return state;
}
```

This pattern uses the AbortController API to cancel in-flight requests when the component unmounts or when the URL changes.

### Pagination Pattern

Handling paginated API responses is a common requirement:

```jsx
function usePaginatedApi(baseUrl, pageSize = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = async () => {
    if (loading || !hasMore) return;
  
    setLoading(true);
  
    try {
      const response = await fetch(`${baseUrl}?page=${page}&pageSize=${pageSize}`);
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      const newData = await response.json();
    
      if (newData.length < pageSize) {
        setHasMore(false);
      }
    
      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const refresh = async () => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  
    try {
      const response = await fetch(`${baseUrl}?page=1&pageSize=${pageSize}`);
    
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    
      const newData = await response.json();
    
      if (newData.length < pageSize) {
        setHasMore(false);
      }
    
      setData(newData);
      setPage(2);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    refresh();
  }, [baseUrl, pageSize]);
  
  return { data, loading, error, hasMore, loadMore, refresh };
}

// Usage in a component
function UserList() {
  const { data: users, loading, error, hasMore, loadMore } = usePaginatedApi('/api/users');
  
  return (
    <div>
      <h1>Users</h1>
    
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    
      {loading && <div>Loading more users...</div>}
      {error && <div>Error: {error}</div>}
    
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          Load More
        </button>
      )}
    </div>
  );
}
```

This pattern manages:

* Current page number
* Whether there are more items to load
* Loading and error states
* Appending new data to existing data
* Refreshing the entire list

### Caching and Revalidation

Implementing a basic caching mechanism for API responses:

```jsx
// Simple in-memory cache
const cache = {
  data: new Map(),
  expirations: new Map(),
  
  get(key) {
    if (!this.data.has(key)) return null;
  
    const expiration = this.expirations.get(key);
    if (expiration && expiration < Date.now()) {
      this.data.delete(key);
      this.expirations.delete(key);
      return null;
    }
  
    return this.data.get(key);
  },
  
  set(key, value, ttl = 60000) {
    this.data.set(key, value);
    this.expirations.set(key, Date.now() + ttl);
  },
  
  invalidate(key) {
    this.data.delete(key);
    this.expirations.delete(key);
  },
  
  clear() {
    this.data.clear();
    this.expirations.clear();
  },
};

// Custom hook for cached API requests
function useCachedApi(url, options = {}) {
  const { ttl = 60000, revalidate = true } = options;
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });
  
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;
  
    const fetchData = async () => {
      // Check cache first
      const cachedData = cache.get(url);
      if (cachedData) {
        setState({
          data: cachedData,
          loading: revalidate,
          error: null,
        });
      
        // If we don't want to revalidate, we're done
        if (!revalidate) return;
      } else {
        setState(prev => ({ ...prev, loading: true }));
      }
    
      try {
        const response = await fetch(url, { signal });
      
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      
        const data = await response.json();
      
        // Update cache
        cache.set(url, data, ttl);
      
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          setState(prev => ({ ...prev, loading: false, error: error.message }));
        }
      }
    };
  
    fetchData();
  
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url, ttl, revalidate]);
  
  return state;
}
```

This pattern:

* Implements a simple in-memory cache with TTL (Time To Live)
* Returns cached data immediately while revalidating in the background
* Supports manual invalidation of cached data
* Handles cancellation and component unmounting

### Error Boundary Pattern

Using React's error boundaries to handle API errors at the component level:

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  
    // Optionally log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback ? (
        this.props.fallback(this.state.error)
      ) : (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'An unknown error occurred'}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="api-error">
          <h2>API Error</h2>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      )}
    >
      <UserProfile userId="123" />
    </ErrorBoundary>
  );
}
```

This pattern:

* Catches unexpected errors in child components
* Prevents the entire application from crashing
* Provides a fallback UI for error states
* Supports custom error handling logic

## Conclusion

RESTful API integration in React involves a wide range of patterns and techniques, from basic fetch calls to sophisticated libraries like React Query and RTK Query. The best approach depends on your specific requirements:

* For simple applications, custom hooks with the Fetch API or Axios may be sufficient
* For more complex applications with advanced caching needs, libraries like React Query or SWR offer powerful features
* For applications already using Redux, RTK Query provides a seamless integration
* For enterprise applications, combining multiple patterns with thoughtful error handling, authentication, and caching strategies is often necessary

> The key to successful API integration is understanding the underlying principles of REST, the React component lifecycle, and the specific requirements of your application.

By applying these patterns and best practices, you can create React applications that efficiently and reliably communicate with RESTful APIs, providing users with a responsive and robust experience.
