# Advanced Timeout Configuration in Axios with React

I'll explain how to handle advanced timeout configurations in Axios when working with React applications, starting from the absolute fundamentals and building up to sophisticated patterns.

> "Time is the most valuable thing a man can spend." - Theophrastus

## Understanding HTTP Requests and Timeouts from First Principles

Before diving into Axios timeout configurations, let's understand what's actually happening when your React application makes an HTTP request.

### What is an HTTP Request?

When your React application needs data from a server, it sends an HTTP request across the network. This request travels through various network infrastructure before reaching the destination server, which then processes the request and sends back a response.

During this journey, many things can go wrong:

* The network might be congested
* The server might be overloaded
* The server might have crashed
* The connection might be lost entirely

### What is a Request Timeout?

A timeout is essentially a safety mechanism that says: "If I don't get a response within X milliseconds, stop waiting and report a failure." Without timeouts, your application might wait indefinitely for responses that will never arrive, leading to:

1. Poor user experience (users staring at loading indicators forever)
2. Resource wastage (connections being held open unnecessarily)
3. Potential memory leaks and performance degradation

## Axios Basics

Axios is a promise-based HTTP client for JavaScript that can be used in both browser and Node.js environments. At its most basic:

```javascript
import axios from 'axios';

// Simple GET request
axios.get('https://api.example.com/data')
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));
```

This creates a request but has no explicit timeout handling. By default, Axios uses a timeout of 0 (which means no timeout).

## Basic Timeout Configuration

Let's start with the simplest timeout configuration:

```javascript
// Setting a global default timeout of 5 seconds
axios.defaults.timeout = 5000;

// Or for a specific request
axios.get('https://api.example.com/data', {
  timeout: 3000 // 3 seconds
})
  .then(response => console.log(response.data))
  .catch(error => {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    } else {
      console.error('Error:', error);
    }
  });
```

In this example:

* The timeout is specified in milliseconds
* When a timeout occurs, Axios throws an error with code 'ECONNABORTED'
* We use `axios.isAxiosError()` to verify that the error came from Axios

## Creating an Axios Instance with Default Timeout

In React applications, it's common to create a configured Axios instance that can be reused throughout your app:

```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000, // 5 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
```

Now you can import and use this instance in your React components:

```javascript
// UserComponent.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';

function UserComponent() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    api.get('/users/123')
      .then(response => {
        setUserData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          setError('Request timed out. Please try again.');
        } else {
          setError('An error occurred. Please try again.');
        }
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div>
      <h1>{userData.name}</h1>
      <p>{userData.email}</p>
    </div>
  );
}
```

This provides a clean way to handle timeouts across your application.

## Advanced Timeout Concepts

Now let's explore more sophisticated timeout handling techniques.

### Different Timeouts for Different Request Types

Your application might need different timeout values for different types of requests:

```javascript
// api.js
import axios from 'axios';

// Short timeout for quick operations
const quickApi = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 2000, // 2 seconds
});

// Medium timeout for typical operations
const standardApi = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000, // 5 seconds
});

// Long timeout for operations known to take time
const longRunningApi = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 30000, // 30 seconds
});

export { quickApi, standardApi, longRunningApi };
```

This approach lets you be strategic about timeout values based on the expected response time of different endpoints.

### Dynamic Timeout Configuration

Sometimes you might want to adjust timeouts dynamically based on network conditions or user preferences:

```javascript
// dynamicTimeoutApi.js
import axios from 'axios';

// Function to create an API instance with dynamic timeout
export function createApiWithTimeout(timeoutMs) {
  return axios.create({
    baseURL: 'https://api.example.com',
    timeout: timeoutMs,
  });
}

// Usage in a component
const slowConnectionTimeout = 10000; // 10 seconds for slow connections
const api = createApiWithTimeout(navigator.connection.effectiveType.includes('2g') 
  ? slowConnectionTimeout 
  : 5000);
```

This example checks the user's connection type and adjusts the timeout accordingly.

### Timeout Configuration with React Context

For a more React-friendly approach, you can use React Context to provide configured Axios instances throughout your application:

```javascript
// ApiContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const [networkType, setNetworkType] = useState('4g');
  
  // Update network type when it changes
  useEffect(() => {
    if ('connection' in navigator) {
      const updateNetworkType = () => setNetworkType(navigator.connection.effectiveType);
      navigator.connection.addEventListener('change', updateNetworkType);
      updateNetworkType();
      return () => navigator.connection.removeEventListener('change', updateNetworkType);
    }
  }, []);
  
  // Create timeout based on network type
  const getTimeout = () => {
    switch (networkType) {
      case '4g': return 5000;
      case '3g': return 10000;
      case '2g': return 15000;
      case 'slow-2g': return 20000;
      default: return 5000;
    }
  };
  
  // Create and memoize the API client
  const apiClient = axios.create({
    baseURL: 'https://api.example.com',
    timeout: getTimeout(),
  });
  
  return (
    <ApiContext.Provider value={{ apiClient, networkType }}>
      {children}
    </ApiContext.Provider>
  );
}

// Custom hook to use the API client
export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}
```

Then use it in your components:

```javascript
// App.jsx
import React from 'react';
import { ApiProvider } from './ApiContext';
import UserProfile from './UserProfile';

function App() {
  return (
    <ApiProvider>
      <div className="app">
        <UserProfile userId="123" />
      </div>
    </ApiProvider>
  );
}

// UserProfile.jsx
import React, { useEffect, useState } from 'react';
import { useApi } from './ApiContext';

function UserProfile({ userId }) {
  const { apiClient, networkType } = useApi();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get(`/users/${userId}`);
        setUserData(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          setError(`Request timed out on ${networkType} connection. Please try again.`);
        } else {
          setError('An error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, [apiClient, userId, networkType]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  
  return (
    <div>
      <h1>{userData.name}</h1>
      <p>{userData.email}</p>
    </div>
  );
}
```

This approach provides dynamic timeout configuration that automatically adjusts based on the user's network conditions.

## Separate Request and Response Timeouts

Axios provides a single timeout value that applies to the entire request lifecycle. However, sometimes you might want different timeouts for:

1. The time it takes to establish the connection
2. The time it takes to receive the complete response

For this advanced use case, you'll need to use Axios's adapter feature with a custom implementation:

```javascript
// customTimeoutAdapter.js
import axios from 'axios';
import settle from 'axios/lib/core/settle';
import createError from 'axios/lib/core/createError';

export function createCustomTimeoutAdapter(config) {
  const defaultAdapter = axios.defaults.adapter;
  
  return function customAdapter(config) {
    const { 
      connectionTimeout = 3000,  // Time to establish connection
      responseTimeout = 5000     // Time to receive complete response
    } = config;
  
    // Create connection timeout
    const connectionTimeoutId = setTimeout(() => {
      throw createError(
        'Connection timeout of ' + connectionTimeout + 'ms exceeded',
        config,
        'ECONNABORTED'
      );
    }, connectionTimeout);
  
    // Override config with combined timeout for default adapter
    const modifiedConfig = {
      ...config,
      timeout: responseTimeout
    };
  
    return defaultAdapter(modifiedConfig)
      .finally(() => clearTimeout(connectionTimeoutId));
  };
}

// Usage
const api = axios.create({
  baseURL: 'https://api.example.com',
  adapter: createCustomTimeoutAdapter(),
  connectionTimeout: 3000,  // 3 seconds to establish connection
  responseTimeout: 10000    // 10 seconds to receive complete response
});
```

This is a more complex solution but provides fine-grained control over different aspects of the request lifecycle.

## Implementing Retry Logic with Exponential Backoff

For an even more robust solution, you can implement retry logic with exponential backoff when timeouts occur:

```javascript
// retryAxios.js
import axios from 'axios';

export function createRetryingAxiosInstance({
  baseURL,
  initialTimeout = 3000,
  maxRetries = 3,
  retryBackoffFactor = 2
}) {
  const axiosInstance = axios.create({
    baseURL,
    timeout: initialTimeout
  });
  
  // Add a request interceptor
  axiosInstance.interceptors.request.use(
    config => {
      // Set retry count if not already set
      config.retryCount = config.retryCount || 0;
      return config;
    },
    error => Promise.reject(error)
  );
  
  // Add a response interceptor to handle retries
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      const config = error.config;
    
      // Only retry on timeout or network errors, and if we haven't hit max retries
      if (
        (axios.isAxiosError(error) && error.code === 'ECONNABORTED' || !error.response) &&
        config.retryCount < maxRetries
      ) {
        // Increment retry count
        config.retryCount += 1;
      
        // Calculate new timeout with exponential backoff
        const newTimeout = initialTimeout * Math.pow(retryBackoffFactor, config.retryCount);
        config.timeout = newTimeout;
      
        // Create new promise for retry
        return new Promise(resolve => {
          console.log(`Retrying request (${config.retryCount}/${maxRetries}) with timeout ${newTimeout}ms`);
          setTimeout(() => resolve(axiosInstance(config)), 1000); // Wait 1s before retry
        });
      }
    
      // If we've hit max retries or it's not a timeout, reject with the error
      return Promise.reject(error);
    }
  );
  
  return axiosInstance;
}

// Usage
const api = createRetryingAxiosInstance({
  baseURL: 'https://api.example.com',
  initialTimeout: 3000,    // Start with 3 second timeout
  maxRetries: 3,           // Try up to 3 times
  retryBackoffFactor: 2    // Double timeout on each retry
});

// First try: 3s timeout
// Second try: 6s timeout
// Third try: 12s timeout
```

This implementation will:

1. Start with an initial timeout
2. Automatically retry failed requests up to a specified maximum
3. Increase the timeout exponentially with each retry
4. Add a small delay between retries to avoid overwhelming the server

## React Hook for Axios with Advanced Timeout Features

Let's combine all these concepts into a custom React hook:

```javascript
// useAxiosWithTimeout.js
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export function useAxiosWithTimeout({
  url,
  method = 'GET',
  data = null,
  baseURL = 'https://api.example.com',
  initialTimeout = 5000,
  maxRetries = 2,
  retryBackoffFactor = 2,
  autoFetch = true
}) {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentTimeout, setCurrentTimeout] = useState(initialTimeout);
  const controllerRef = useRef(null);
  
  const fetchData = async () => {
    // Abort previous request if it exists
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  
    // Create new AbortController
    controllerRef.current = new AbortController();
  
    setLoading(true);
    setError(null);
  
    try {
      const result = await axios({
        method,
        url,
        data,
        baseURL,
        timeout: currentTimeout,
        signal: controllerRef.current.signal
      });
    
      setResponse(result.data);
      setLoading(false);
      setRetryCount(0);
      setCurrentTimeout(initialTimeout);
    } catch (err) {
      // Don't handle aborted requests as errors
      if (axios.isCancel(err)) {
        return;
      }
    
      // Check if it's a timeout error
      if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
        // Check if we should retry
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          const newTimeout = initialTimeout * Math.pow(retryBackoffFactor, retryCount + 1);
          setCurrentTimeout(newTimeout);
        
          // Schedule retry
          setTimeout(fetchData, 1000);
        
          // Don't set error state during retries
          return;
        }
      
        setError({
          type: 'timeout',
          message: `Request timed out after ${retryCount + 1} attempts`
        });
      } else {
        // Handle other errors
        setError({
          type: 'error',
          message: err.message,
          details: err.response?.data || null
        });
      }
    
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  
    // Cleanup: abort request if component unmounts
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [url, autoFetch]); // Re-fetch if URL or autoFetch changes
  
  // Return everything needed to work with this request
  return {
    data: response,
    error,
    loading,
    retry: fetchData,
    retryCount,
    currentTimeout,
    cancel: () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        setLoading(false);
      }
    }
  };
}
```

Usage in a component:

```javascript
// UserProfileWithAdvancedTimeout.jsx
import React from 'react';
import { useAxiosWithTimeout } from './useAxiosWithTimeout';

function UserProfileWithAdvancedTimeout({ userId }) {
  const {
    data: userData,
    error,
    loading,
    retry,
    retryCount,
    currentTimeout,
    cancel
  } = useAxiosWithTimeout({
    url: `/users/${userId}`,
    initialTimeout: 3000,
    maxRetries: 3,
    retryBackoffFactor: 2
  });
  
  // Show loading state
  if (loading) {
    return (
      <div>
        <p>Loading user data... (Timeout: {currentTimeout}ms)</p>
        <button onClick={cancel}>Cancel</button>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }
  
  // Show data
  if (userData) {
    return (
      <div>
        <h1>{userData.name}</h1>
        <p>{userData.email}</p>
        {retryCount > 0 && (
          <p>This data was loaded after {retryCount} retries</p>
        )}
      </div>
    );
  }
  
  return null;
}
```

This custom hook provides:

* Automatic timeout handling with exponential backoff
* Retry capability with configurable limits
* Request cancellation to prevent state updates on unmounted components
* Detailed information about the current state of the request

## Monitoring and Reporting Timeout Incidents

For production applications, it's important to monitor and track timeout incidents:

```javascript
// monitoredAxios.js
import axios from 'axios';

const monitoredAxios = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000
});

// Record timeout metrics
let timeoutCounter = 0;
const timeoutHistory = [];

monitoredAxios.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      timeoutCounter++;
    
      const timeoutRecord = {
        url: error.config.url,
        method: error.config.method,
        timestamp: new Date(),
        timeout: error.config.timeout
      };
    
      timeoutHistory.push(timeoutRecord);
    
      // Could send to analytics service
      console.log(`TIMEOUT #${timeoutCounter}: ${error.config.method} ${error.config.url}`);
    
      // If timeouts exceed threshold, adjust global timeout
      if (timeoutCounter > 5) {
        monitoredAxios.defaults.timeout = 10000; // Increase to 10s
        console.log('Increased global timeout to 10s due to multiple timeouts');
      }
    }
  
    return Promise.reject(error);
  }
);

// Export instance and monitoring data
export default monitoredAxios;
export const getTimeoutStats = () => ({
  count: timeoutCounter,
  history: timeoutHistory
});
```

This approach lets you track timeout incidents, automatically adjust settings based on observed behavior, and potentially report issues to monitoring systems.

## Building a Complete Timeout Management System

Let's combine all these concepts into a complete system for a React application:

```javascript
// timeoutManager.js
import axios from 'axios';

class TimeoutManager {
  constructor({
    baseURL,
    defaultTimeout = 5000,
    lowNetworkMultiplier = 2,
    connectionMonitoringInterval = 30000
  }) {
    this.baseURL = baseURL;
    this.defaultTimeout = defaultTimeout;
    this.lowNetworkMultiplier = lowNetworkMultiplier;
    this.connectionMonitoringInterval = connectionMonitoringInterval;
  
    this.timeoutHistory = [];
    this.networkQuality = 'good'; // 'good', 'medium', 'poor'
    this.lastResponseTimes = [];
  
    // Create the main Axios instance
    this.axios = axios.create({
      baseURL,
      timeout: this.getCurrentTimeout()
    });
  
    // Set up interceptors
    this._setupInterceptors();
  
    // Start network monitoring
    this._startNetworkMonitoring();
  }
  
  // Get current timeout based on network quality
  getCurrentTimeout() {
    switch(this.networkQuality) {
      case 'poor': return this.defaultTimeout * this.lowNetworkMultiplier;
      case 'medium': return this.defaultTimeout * 1.5;
      default: return this.defaultTimeout;
    }
  }
  
  // Set up request and response interceptors
  _setupInterceptors() {
    // Add request timestamps
    this.axios.interceptors.request.use(config => {
      config.metadata = { startTime: new Date().getTime() };
      config.timeout = this.getCurrentTimeout();
      return config;
    });
  
    // Track response times and timeouts
    this.axios.interceptors.response.use(
      response => {
        const endTime = new Date().getTime();
        const startTime = response.config.metadata.startTime;
        const duration = endTime - startTime;
      
        // Record response time
        this.lastResponseTimes.push(duration);
        if (this.lastResponseTimes.length > 10) {
          this.lastResponseTimes.shift();
        }
      
        return response;
      },
      error => {
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          // Record timeout
          this.timeoutHistory.push({
            url: error.config.url,
            method: error.config.method,
            timestamp: new Date(),
            timeout: error.config.timeout
          });
        
          // Update network quality based on timeouts
          this._updateNetworkQualityBasedOnTimeouts();
        }
      
        return Promise.reject(error);
      }
    );
  }
  
  // Monitor network and adjust timeouts accordingly
  _startNetworkMonitoring() {
    // Check navigator.connection if available
    if ('connection' in navigator) {
      const updateNetworkQuality = () => {
        const connection = navigator.connection;
      
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          this.networkQuality = 'poor';
        } else if (connection.effectiveType === '3g') {
          this.networkQuality = 'medium';
        } else {
          this.networkQuality = 'good';
        }
      
        // Update timeout on the axios instance
        this.axios.defaults.timeout = this.getCurrentTimeout();
      };
    
      // Update immediately and listen for changes
      updateNetworkQuality();
      navigator.connection.addEventListener('change', updateNetworkQuality);
    }
  
    // Periodically test connection by making a small request
    setInterval(() => this._testConnection(), this.connectionMonitoringInterval);
  }
  
  // Test connection by making a small request to the API
  async _testConnection() {
    try {
      const startTime = new Date().getTime();
      await fetch(`${this.baseURL}/health`, { 
        method: 'HEAD',
        cache: 'no-store'
      });
      const endTime = new Date().getTime();
      const duration = endTime - startTime;
    
      // Update network quality based on response time
      if (duration > 1000) {
        this.networkQuality = 'poor';
      } else if (duration > 500) {
        this.networkQuality = 'medium';
      } else {
        this.networkQuality = 'good';
      }
    
      // Update timeout on the axios instance
      this.axios.defaults.timeout = this.getCurrentTimeout();
    } catch (error) {
      // Error making request - assume poor connection
      this.networkQuality = 'poor';
      this.axios.defaults.timeout = this.getCurrentTimeout();
    }
  }
  
  // Update network quality based on recent timeouts
  _updateNetworkQualityBasedOnTimeouts() {
    // Count timeouts in the last minute
    const oneMinuteAgo = new Date().getTime() - 60000;
    const recentTimeouts = this.timeoutHistory.filter(
      t => t.timestamp.getTime() > oneMinuteAgo
    ).length;
  
    if (recentTimeouts >= 3) {
      this.networkQuality = 'poor';
    } else if (recentTimeouts >= 1) {
      this.networkQuality = 'medium';
    }
  
    // Update timeout on the axios instance
    this.axios.defaults.timeout = this.getCurrentTimeout();
  }
  
  // Calculate average response time
  getAverageResponseTime() {
    if (this.lastResponseTimes.length === 0) return 0;
    const sum = this.lastResponseTimes.reduce((a, b) => a + b, 0);
    return sum / this.lastResponseTimes.length;
  }
  
  // Get timeout statistics
  getTimeoutStats() {
    return {
      count: this.timeoutHistory.length,
      recent: this.timeoutHistory.slice(-5),
      networkQuality: this.networkQuality,
      currentTimeout: this.getCurrentTimeout(),
      averageResponseTime: this.getAverageResponseTime()
    };
  }
  
  // Get the axios instance
  getInstance() {
    return this.axios;
  }
}

// Create and export a singleton instance
const timeoutManager = new TimeoutManager({
  baseURL: 'https://api.example.com',
  defaultTimeout: 5000
});

export default timeoutManager;
```

Now you can use this in your React application:

```javascript
// App.jsx
import React from 'react';
import timeoutManager from './timeoutManager';
import NetworkStatusBar from './NetworkStatusBar';
import UserProfilePage from './UserProfilePage';

function App() {
  // Get the configured axios instance
  const api = timeoutManager.getInstance();
  
  return (
    <div className="app">
      <NetworkStatusBar 
        networkQuality={timeoutManager.networkQuality}
        currentTimeout={timeoutManager.getCurrentTimeout()} 
      />
    
      <UserProfilePage api={api} />
    </div>
  );
}

// NetworkStatusBar.jsx
function NetworkStatusBar({ networkQuality, currentTimeout }) {
  let statusColor;
  switch(networkQuality) {
    case 'poor': statusColor = 'red'; break;
    case 'medium': statusColor = 'orange'; break;
    default: statusColor = 'green';
  }
  
  return (
    <div style={{ 
      backgroundColor: statusColor,
      color: 'white',
      padding: '8px',
      textAlign: 'center'
    }}>
      Network: {networkQuality} | Request timeout: {currentTimeout}ms
    </div>
  );
}
```

This comprehensive system:

1. Dynamically adjusts timeouts based on network conditions
2. Monitors API response times
3. Tracks timeout incidents
4. Provides network status information to the UI
5. Adaptively improves over time based on observed behavior

## Conclusion

Advanced timeout configuration in Axios for React applications is much more than just setting a simple millisecond value. As we've seen, a robust approach involves:

> "In the realm of network requests, Murphy's Law reigns supreme: anything that can go wrong, will go wrong. Proper timeout configuration is your first line of defense."

1. **Understanding the fundamentals** : HTTP requests, network behavior, and the purpose of timeouts
2. **Simple configurations** : Setting basic timeout values globally or per request
3. **Dynamic adjustments** : Changing timeouts based on network conditions, device capabilities, or user preferences
4. **Retries and backoff strategies** : Intelligently retrying failed requests with increasing timeouts
5. **Monitoring and adaptation** : Tracking timeout incidents and adjusting system behavior in response
6. **User experience considerations** : Providing appropriate feedback when timeouts occur

By implementing these patterns, you create React applications that are resilient to network issues, provide better user experiences under varying conditions, and make efficient use of system resources.

Remember that timeouts should be tailored to your specific application needs - there's no universal "correct" timeout value. Consider factors like the nature of your API endpoints, expected response times, user expectations, and the criticality of the data being requested.
