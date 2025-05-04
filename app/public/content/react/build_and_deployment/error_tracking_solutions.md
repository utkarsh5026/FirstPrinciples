# Error Tracking Solutions for React in Production: A First Principles Approach

I'll explain error tracking solutions for React production applications from first principles, building up the concepts step by step with practical examples.

## Understanding the Need for Error Tracking

> "An ounce of prevention is worth a pound of cure, but even the best prevention cannot eliminate all errors."

At its core, error tracking serves a fundamental need: software systems are complex, and despite our best efforts at testing and quality assurance, errors will occur in production environments. This is especially true for React applications that run on various browsers, devices, and network conditions that we cannot fully simulate during development.

### First Principles of Error Tracking

1. **Error Detection** : You must first be able to detect when an error occurs
2. **Error Capture** : You need mechanisms to capture error details
3. **Error Context** : You need additional information beyond the error itself
4. **Error Reporting** : You need to transmit this information to a place where it can be analyzed
5. **Error Analysis** : You need tools to understand patterns and prioritize fixes

Let's build our understanding from these fundamentals.

## 1. Native Error Handling in React

React provides built-in error handling mechanisms that form the foundation of any error tracking strategy.

### Error Boundaries

Error boundaries are React components that catch JavaScript errors in their child component tree, log those errors, and display a fallback UI.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error here
    console.error("Error caught by boundary:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // You can render any fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

Error boundaries have some important limitations:

* They only catch errors during rendering, in lifecycle methods, and in constructors
* They do not catch errors inside event handlers
* They do not catch errors in asynchronous code (e.g., `setTimeout` or `requestAnimationFrame`)
* They do not catch errors in the error boundary itself

Let's use this error boundary:

```jsx
// Wrap components that might error
const App = () => {
  return (
    <div>
      <ErrorBoundary>
        <ComponentThatMightError />
      </ErrorBoundary>
    </div>
  );
};

// A component with an error
const ComponentThatMightError = () => {
  // This will trigger an error
  const user = undefined;
  return <div>{user.name}</div>; // TypeError: Cannot read property 'name' of undefined
};
```

When the error occurs, the error boundary's `componentDidCatch` method executes, giving you a place to log the error, and the fallback UI displays.

### Global Error Handler

For errors that occur outside React's rendering lifecycle, you can use the global `window.onerror` handler:

```javascript
// Set up global error handler
window.onerror = function(message, source, lineno, colno, error) {
  // Log the error
  console.error("Global error caught:", error);
  
  // Report to your error tracking service
  // errorTrackingService.report(error, {
  //   message,
  //   source,
  //   lineno,
  //   colno
  // });
  
  // Return true to prevent the default browser error handler
  return true;
};
```

For promise rejections:

```javascript
window.addEventListener('unhandledrejection', function(event) {
  // Log the error
  console.error("Unhandled promise rejection:", event.reason);
  
  // Report to your error tracking service
  // errorTrackingService.report(event.reason);
  
  // Prevent default handling
  event.preventDefault();
});
```

## 2. Building Context Around Errors

Raw error messages often aren't enough to diagnose and fix issues. You need context.

### User Context

```javascript
function collectUserContext() {
  return {
    userId: currentUser?.id || 'anonymous',
    userRole: currentUser?.role,
    userPreferences: currentUser?.preferences,
    // Add other relevant user data
  };
}
```

### Application Context

```javascript
function collectAppContext() {
  return {
    url: window.location.href,
    referrer: document.referrer,
    lastAction: store.getState().lastAction,
    currentView: router.getCurrentRoute().name,
    // Add other app state information
  };
}
```

### Technical Context

```javascript
function collectTechnicalContext() {
  return {
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    timestamp: new Date().toISOString(),
    reactVersion: React.version,
    // Add other technical details
  };
}
```

## 3. Creating a Basic Error Tracking Service

Let's build a simple error tracking service to understand the core principles:

```javascript
// A basic error tracking service
class ErrorTracker {
  constructor(options = {}) {
    this.apiKey = options.apiKey || '';
    this.endpoint = options.endpoint || '/api/errors';
    this.appVersion = options.appVersion || '1.0.0';
    this.sampleRate = options.sampleRate || 1.0; // 1.0 = 100% of errors
    this.enabled = options.enabled !== false;
    this.maxErrors = options.maxErrors || 100;
    this.errorCount = 0;

    // Set up global handlers if enabled
    if (this.enabled) {
      this.setupGlobalHandlers();
    }
  }

  setupGlobalHandlers() {
    // Store original reference to avoid infinite loops
    const self = this;

    // Set up window.onerror
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      self.captureException(error || new Error(message), {
        source,
        lineno,
        colno,
        category: 'window.onerror'
      });
    
      // Call original handler if it exists
      if (typeof originalOnError === 'function') {
        return originalOnError.apply(this, arguments);
      }
    
      return false;
    };

    // Set up unhandled rejection listener
    window.addEventListener('unhandledrejection', function(event) {
      self.captureException(event.reason || new Error('Unhandled Promise rejection'), {
        category: 'unhandledrejection'
      });
    
      // Don't prevent default to allow other handlers to process
    });
  }

  shouldSendError() {
    // Apply sampling
    if (Math.random() > this.sampleRate) {
      return false;
    }
  
    // Check max errors
    if (this.errorCount >= this.maxErrors) {
      return false;
    }
  
    this.errorCount++;
    return true;
  }

  captureException(error, additionalData = {}) {
    if (!this.enabled || !this.shouldSendError()) {
      return;
    }

    try {
      // Gather all context
      const errorData = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        appVersion: this.appVersion,
        // Add additional context
        ...additionalData,
        // Add user and app context
        user: collectUserContext(),
        app: collectAppContext(),
        technical: collectTechnicalContext()
      };

      // Send to server
      this.sendErrorToServer(errorData);
    } catch (e) {
      // Avoid infinite loops if our error reporting throws
      console.error("Error in error reporting:", e);
    }
  }

  sendErrorToServer(errorData) {
    // Use Beacon API if available (works even during page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(errorData)], { type: 'application/json' });
      navigator.sendBeacon(this.endpoint, blob);
      return;
    }

    // Fallback to fetch
    fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify(errorData),
      // Keep-alive to allow sending errors during page transitions
      keepalive: true
    }).catch(e => {
      console.error("Failed to send error:", e);
    });
  }

  // Manual error reporting
  captureMessage(message, level = 'info', additionalData = {}) {
    this.captureException(new Error(message), {
      level,
      ...additionalData
    });
  }

  // Wrap a function to catch errors
  wrap(fn, additionalData = {}) {
    const self = this;
    return function wrappedFunction() {
      try {
        return fn.apply(this, arguments);
      } catch (error) {
        self.captureException(error, {
          category: 'wrapped',
          ...additionalData
        });
        throw error; // Re-throw to preserve original behavior
      }
    };
  }
}
```

Using this service:

```javascript
// Initialize
const errorTracker = new ErrorTracker({
  apiKey: 'your-api-key',
  endpoint: 'https://errors.yourapp.com/collect',
  appVersion: '2.1.0',
  sampleRate: 0.5 // Only send 50% of errors
});

// Manually report an error
try {
  riskyOperation();
} catch (error) {
  errorTracker.captureException(error, {
    context: 'User was attempting to save their profile'
  });
}

// Report a message
errorTracker.captureMessage('User attempted to access premium feature', 'warning', {
  featureId: 'premium-export'
});

// Wrap an event handler
const handleClick = errorTracker.wrap(function() {
  // This function is now error-monitored
  this.setState({ clicked: true });
}, { category: 'event-handler' });
```

## 4. Integrating with React Components

Now, let's integrate error tracking more deeply into our React application:

### Enhanced Error Boundary

```jsx
class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Add component name and props to context
    const componentName = errorInfo.componentStack
      .split('\n')[1]
      .trim()
      .replace(/^in /, '')
      .replace(/ \(.*\)$/, '');
  
    errorTracker.captureException(error, {
      componentStack: errorInfo.componentStack,
      componentName,
      componentProps: JSON.stringify(this.props.children.props),
      category: 'react-error-boundary'
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

### Functional Component Error Boundary with Hooks

With React hooks, we can create a more modern version:

```jsx
import React, { useState, useEffect } from 'react';

function ErrorBoundary({ children, fallback, onError }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  // Reset error state when children change
  useEffect(() => {
    setHasError(false);
    setError(null);
  }, [children]);

  // Create error handler
  const errorHandler = (event) => {
    event.preventDefault();
  
    // Get the error
    const error = event.error || new Error(event.message);
  
    // Update state
    setError(error);
    setHasError(true);
  
    // Call onError prop if provided
    if (onError) {
      onError(error, {
        componentStack: getComponentStack(),
        category: 'error-boundary-hook'
      });
    }
  };

  // Function to get component stack (simplified)
  const getComponentStack = () => {
    try {
      throw new Error('Get stack trace');
    } catch (e) {
      return e.stack;
    }
  };

  // Set up error listeners
  useEffect(() => {
    window.addEventListener('error', errorHandler);
  
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    return fallback || <div>Something went wrong</div>;
  }

  return children;
}
```

### Higher-Order Component for Error Tracking

```jsx
function withErrorTracking(Component, options = {}) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  class WithErrorTracking extends React.Component {
    constructor(props) {
      super(props);
      this.originalMethods = {};
    
      // Wrap event handlers that start with 'on'
      for (const key in props) {
        if (typeof props[key] === 'function' && key.startsWith('on')) {
          this.originalMethods[key] = props[key];
        
          this.props[key] = errorTracker.wrap(props[key], {
            handlerName: key,
            componentName: displayName,
            category: 'event-handler'
          });
        }
      }
    }
  
    render() {
      return <Component {...this.props} />;
    }
  }
  
  WithErrorTracking.displayName = `WithErrorTracking(${displayName})`;
  return WithErrorTracking;
}

// Usage
const SafeButton = withErrorTracking(Button);
```

## 5. Common Third-Party Error Tracking Solutions

While building your own error tracking system provides deep understanding, most production React applications use established third-party services. Let's explore some popular options:

### 1. Sentry

Sentry is one of the most widely used error tracking solutions. It integrates well with React and provides rich error context.

```javascript
// Install with: npm install @sentry/react @sentry/tracing

import React from 'react';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Initialize Sentry at the entry point of your app
Sentry.init({
  dsn: "your-sentry-dsn",
  integrations: [new BrowserTracing()],
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  tracesSampleRate: 0.5,
  
  // Enrich events with metadata
  beforeSend(event) {
    // Add custom context
    if (currentUser) {
      event.user = {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role
      };
    }
    return event;
  }
});

// Use Sentry's ErrorBoundary component
function App() {
  return (
    <Sentry.ErrorBoundary fallback={<FallbackComponent />}>
      <Router>
        <Routes />
      </Router>
    </Sentry.ErrorBoundary>
  );
}

// For specific components
function RiskyComponent() {
  return (
    <Sentry.ErrorBoundary fallback={<p>Error in this specific component</p>}>
      <ComponentThatMightError />
    </Sentry.ErrorBoundary>
  );
}

// Manual error capturing
try {
  riskyFunction();
} catch (error) {
  Sentry.captureException(error);
}

// Capturing messages
Sentry.captureMessage("User clicked checkout button", "info");

// Tracking user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  subscription: user.subscriptionTier
});

// Performance monitoring
const transaction = Sentry.startTransaction({ name: "Checkout Process" });
Sentry.configureScope(scope => scope.setSpan(transaction));

// Later
transaction.finish();
```

### 2. LogRocket

LogRocket provides session replay in addition to error tracking, allowing you to see exactly what users were doing when errors occurred.

```javascript
// Install with: npm install logrocket

import LogRocket from 'logrocket';

// Initialize LogRocket
LogRocket.init('your-app-id');

// Identify users
LogRocket.identify('user-id', {
  name: 'John Doe',
  email: 'john@example.com',
  subscriptionPlan: 'premium'
});

// For Redux integration (optional)
import createMiddleware from 'logrocket-redux-middleware';
const logRocketMiddleware = createMiddleware(LogRocket);

// Add to your Redux store
const store = createStore(
  rootReducer,
  applyMiddleware(logRocketMiddleware)
);

// Add to your error boundary
componentDidCatch(error, errorInfo) {
  LogRocket.captureException(error, {
    extra: {
      componentStack: errorInfo.componentStack
    }
  });
}
```

### 3. Bugsnag

Bugsnag offers automatic error grouping and prioritization features:

```javascript
// Install with: npm install @bugsnag/js @bugsnag/plugin-react

import React from 'react';
import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';

// Initialize Bugsnag
Bugsnag.start({
  apiKey: 'your-api-key',
  plugins: [new BugsnagPluginReact()]
});

// Create error boundary component
const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React);

// Wrap your app
function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <YourApp />
    </ErrorBoundary>
  );
}

// Manual error reporting
try {
  riskyFunction();
} catch (error) {
  Bugsnag.notify(error, function(event) {
    event.addMetadata('custom', {
      userAction: 'checkout',
      cartValue: 125.0
    });
  });
}

// Set user
Bugsnag.setUser('user-id', 'user@example.com', 'Pro User');
```

## 6. Advanced Error Tracking Strategies

Now that we've covered the basics and seen common tools, let's look at more advanced strategies:

### Source Maps for Production Debugging

When you build your React app for production, the code is minified, making error stack traces nearly impossible to decipher. Source maps solve this problem:

```javascript
// In webpack.config.js
module.exports = {
  // ...
  devtool: 'hidden-source-map', // Creates source maps but doesn't reference them in the bundle
  
  output: {
    // ...
    sourceMapFilename: '[name].[contenthash].js.map',
  },
  
  plugins: [
    // Upload source maps to your error tracking service
    new SentryWebpackPlugin({
      include: './build',
      ignoreFile: '.sentrycliignore',
      ignore: ['node_modules', 'webpack.config.js'],
      configFile: 'sentry.properties',
    }),
  ],
};
```

### Breadcrumbs for Debugging Context

Breadcrumbs create a trail of events leading up to an error:

```javascript
// Manual breadcrumb tracking
function trackUserAction(action, data = {}) {
  errorTracker.addBreadcrumb({
    category: 'user-action',
    message: action,
    data,
    level: 'info'
  });
}

// Usage
function handleSubmit() {
  trackUserAction('form-submit', { formId: 'checkout', items: cart.length });
  
  // Then if an error happens later, you'll see this breadcrumb
  processOrder();
}
```

### Circuit Breaker Pattern

To prevent cascading failures when a component consistently errors:

```jsx
function CircuitBreaker({ children, maxFailures = 3, resetAfter = 60000 }) {
  const [failures, setFailures] = useState(0);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleError = (error) => {
    const newFailures = failures + 1;
    setFailures(newFailures);
  
    if (newFailures >= maxFailures) {
      setOpen(true);
    
      // Reset after specified time
      timerRef.current = setTimeout(() => {
        setFailures(0);
        setOpen(false);
      }, resetAfter);
    }
  
    // Still report the error
    errorTracker.captureException(error);
  };

  if (open) {
    return <div>Service temporarily unavailable. Please try again later.</div>;
  }

  return (
    <ErrorBoundary onError={handleError} key={failures}>
      {children}
    </ErrorBoundary>
  );
}
```

### Custom React Hooks for Error Tracking

```jsx
function useErrorTracking(options = {}) {
  const [error, setError] = useState(null);
  const [hasError, setHasError] = useState(false);
  
  const trackError = useCallback((error, additionalData = {}) => {
    setError(error);
    setHasError(true);
  
    errorTracker.captureException(error, {
      ...options,
      ...additionalData
    });
  }, [options]);
  
  const resetError = useCallback(() => {
    setError(null);
    setHasError(false);
  }, []);
  
  const wrapFunction = useCallback((fn) => {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        trackError(error);
        throw error;
      }
    };
  }, [trackError]);
  
  const trackPromise = useCallback((promise) => {
    return promise.catch(error => {
      trackError(error);
      throw error;
    });
  }, [trackError]);
  
  return {
    error,
    hasError,
    trackError,
    resetError,
    wrapFunction,
    trackPromise
  };
}

// Usage example
function UserProfile() {
  const { error, hasError, trackPromise, resetError } = useErrorTracking({
    component: 'UserProfile'
  });
  
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    trackPromise(
      fetch('/api/user')
        .then(res => res.json())
        .then(data => setUser(data))
    );
  }, [trackPromise]);
  
  if (hasError) {
    return (
      <div>
        <p>Failed to load profile</p>
        <button onClick={resetError}>Try Again</button>
      </div>
    );
  }
  
  if (!user) return <div>Loading...</div>;
  
  return <div>{user.name}</div>;
}
```

## 7. Best Practices for Error Tracking in Production

### 1. Error Aggregation and Deduplication

Your error tracking system should group similar errors together to prevent alert fatigue:

```javascript
// Example of error fingerprinting logic
function getErrorFingerprint(error, context) {
  // Strip out variable parts like line numbers and timestamps
  const stackFrames = error.stack
    .split('\n')
    .map(line => line.replace(/:\d+:\d+/g, '')) // Remove line:col
    .join('\n');
  
  // Create a hash from the error type, message, and stack
  return hashString(`${error.name}:${error.message}:${stackFrames}`);
}
```

### 2. User Impact Assessment

Prioritize errors based on their impact:

```javascript
function assessErrorImpact(error, context) {
  const severity = {
    // Critical: Affects entire app functionality
    critical: 
      error.name === 'SyntaxError' || 
      context.componentName === 'App' ||
      error.message.includes('Failed to load chunk'),
  
    // High: Affects a major feature
    high: 
      context.category === 'checkout' || 
      context.componentName === 'PaymentForm',
  
    // Medium: Affects secondary features
    medium: 
      context.category === 'user-profile' || 
      context.componentName.includes('Settings'),
  
    // Low: Minor UI issues, non-critical functions
    low: true // Default
  };
  
  // Return the highest applicable severity
  for (const level of ['critical', 'high', 'medium', 'low']) {
    if (severity[level]) return level;
  }
  
  return 'low';
}
```

### 3. Rate Limiting and Sampling

To prevent overwhelming your error tracking system:

```javascript
class ErrorBudget {
  constructor(options = {}) {
    this.maxErrors = options.maxErrors || 100;
    this.resetInterval = options.resetInterval || 60000; // ms
    this.errorCount = 0;
    this.lastReset = Date.now();
  }
  
  canSendError() {
    const now = Date.now();
  
    // Reset counter if interval passed
    if (now - this.lastReset > this.resetInterval) {
      this.errorCount = 0;
      this.lastReset = now;
    }
  
    // Check if budget exceeded
    if (this.errorCount >= this.maxErrors) {
      return false;
    }
  
    this.errorCount++;
    return true;
  }
}

// Usage
const errorBudget = new ErrorBudget({
  maxErrors: 50,
  resetInterval: 30000 // 30 seconds
});

// In your error tracking service
function captureException(error, context) {
  if (!errorBudget.canSendError()) {
    // Log locally but don't send
    console.error("Error rate limit exceeded", error);
    return;
  }
  
  // Send to server...
}
```

### 4. Privacy and Data Compliance

To ensure you're not collecting sensitive data:

```javascript
function sanitizeErrorData(errorData) {
  // List of patterns to redact
  const sensitivePatterns = [
    /\b(?:\d[ -]*?){13,16}\b/, // Credit card numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email addresses
    /\bpassword\s*[=:]\s*["']?[^"'&\s]+["']?/i, // Passwords
    /\bsocial\s*security\b.{0,20}\d{3}[-\s]?\d{2}[-\s]?\d{4}/i, // SSNs
  ];
  
  // Deep clone to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(errorData));
  
  // Function to redact matches
  function redact(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of sensitivePatterns) {
          obj[key] = obj[key].replace(pattern, '[REDACTED]');
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redact(obj[key]);
      }
    }
  }
  
  redact(sanitized);
  return sanitized;
}

// Usage
function captureException(error, context) {
  const errorData = {
    // ...build error data
  };
  
  const sanitizedData = sanitizeErrorData(errorData);
  sendErrorToServer(sanitizedData);
}
```

## 8. Implementing a Complete Error Tracking System

Now that we've covered all the components, let's put it all together into a complete error tracking system.

### Client-Side Integration

```jsx
// In src/errorTracking.js
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initErrorTracking = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Error tracking disabled in development');
    return;
  }

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.2,
  
    // Only send errors in production
    enabled: process.env.NODE_ENV === 'production',
  
    // Custom logic to determine if an event should be sent
    beforeSend(event, hint) {
      const error = hint.originalException;
    
      // Don't track certain errors
      if (error && error.message && (
        error.message.includes('ResizeObserver loop') || // Chrome specific error
        error.message.includes('Network request failed') // Usually just offline users
      )) {
        return null;
      }
    
      // Sanitize data
      if (event.request && event.request.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }
    
      return event;
    },
  
    // Add app version
    release: process.env.REACT_APP_VERSION,
  });
};

// Custom error boundary with retry functionality
export const ErrorBoundary = ({ children, fallback }) => {
  const [key, setKey] = useState(0);
  
  const handleReset = () => {
    setKey(prevKey => prevKey + 1);
  };
  
  return (
    <Sentry.ErrorBoundary 
      fallback={({ error, resetError }) => (
        fallback ? 
          fallback({ error, reset: () => { resetError(); handleReset(); } }) : 
          <DefaultErrorFallback error={error} reset={() => { resetError(); handleReset(); }} />
      )}
    >
      <React.Fragment key={key}>
        {children}
      </React.Fragment>
    </Sentry.ErrorBoundary>
  );
};

// Default error UI
const DefaultErrorFallback = ({ error, reset }) => (
  <div className="error-boundary-fallback">
    <h2>Something went wrong</h2>
    <p>We've logged this error and will look into it.</p>
    <button onClick={reset}>Try again</button>
  </div>
);

// Custom hook for error tracking
export const useErrorHandler = (context = {}) => {
  const captureError = useCallback((error, extraContext = {}) => {
    Sentry.captureException(error, {
      extra: {
        ...context,
        ...extraContext
      }
    });
  }, [context]);
  
  return captureError;
};
```

### App Integration

```jsx
// In src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { initErrorTracking } from './errorTracking';

// Initialize error tracking
initErrorTracking();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// In src/App.js
import React from 'react';
import { ErrorBoundary, useErrorHandler } from './errorTracking';
import Routes from './Routes';

function App() {
  const handleError = useErrorHandler({ component: 'App' });
  
  // Set up global error handlers for async errors
  React.useEffect(() => {
    const handleUnhandledRejection = (event) => {
      handleError(event.reason || new Error('Unhandled Promise Rejection'));
      // Prevent default to avoid double reporting
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);
  
  return (
    <ErrorBoundary>
      <Routes />
    </ErrorBoundary>
  );
}

export default App;
```

### Feature Component Example

```jsx
// In src/features/Dashboard/index.js
import React, { useState, useEffect } from 'react';
import { ErrorBoundary, useErrorHandler } from '../../errorTracking';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const handleError = useErrorHandler({ feature: 'Dashboard' });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        handleError(error, { action: 'fetchDashboardData' });
        // Show user-friendly message instead of crashing
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [handleError]);
  
  if (loading) return <div>Loading...</div>;
  
  if (!data) return <div>Failed to load dashboard. Please try again later.</div>;
  
  return (
    <div>
      {/* Dashboard content */}
      <h1>Dashboard</h1>
      {/* Wrap risky sections in their own boundaries */}
      <ErrorBoundary fallback={({ reset }) => (
        <div>
          <p>Chart failed to load</p>
          <button onClick={reset}>Retry</button>
        </div>
      )}>
        <DashboardChart data={data.chart} />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <UserStatistics data={data.stats} />
      </ErrorBoundary>
    </div>
  );
}

export default Dashboard;
```

## 9. Server-Side Error Processing

For a complete error tracking solution, you need to process errors on the server:

```javascript
// Simplified backend error processing (Node.js/Express example)
const express = require('express');
const app = express();

// Middleware to parse error data
app.use(express.json());

app.post('/api/errors', async (req, res) => {
  try {
    const errorData = req.body;
    
    // Validate API key or other auth
    const apiKey = req.headers['x-api-key'];
    if (!validateApiKey(apiKey)) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Store in database
    await storeError({
      message: errorData.message,
      stack: errorData.stack,
      browser: errorData.technical.userAgent,
      url: errorData.url,
      timestamp: new Date(errorData.timestamp),
      userId: errorData.user.userId,
      // Add other fields
    });
    
    // Generate notifications if needed
    if (isCriticalError(errorData)) {
      await sendAlertToTeam(errorData);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing error report:', error);
    res.status(500).json({ error: 'Failed to process error' });
  }
});

// Functions for error processing
function validateApiKey(apiKey) {
  // Implementation
}

function isCriticalError(errorData) {
  // Check if this error should trigger alerts
  return (
    errorData.message.includes('payment') ||
    errorData.level === 'critical' ||
    (errorData.user && errorData.user.role === 'admin')
  );
}

async function storeError(errorData) {
  // Implementation to store in database
}

async function sendAlertToTeam(errorData) {
  // Implementation to notify the team (e.g., Slack, email)
}
```

## 10. Real-World Considerations

### Performance Overhead

Error tracking adds some performance overhead to your application. Minimize this by:

1. Using sampling to only track a percentage of errors
2. Batching error reports 
3. Using the Beacon API for error reporting during page unload
4. Loading error tracking libraries asynchronously

### Error Handling in SSR (Server-Side Rendering)

For Next.js or other SSR frameworks:

```jsx
// _app.js in Next.js
import * as Sentry from '@sentry/nextjs';

// Custom error reporting at the root level
if (process.browser) {
  // Client-side only initialization
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    // Other client config
  });
} else {
  // Server-side initialization
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // Server config
  });
}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
```

### Error Recovery Strategies

Beyond just tracking errors, implement recovery strategies:

1. **Retry Mechanisms** for network errors with exponential backoff
2. **Local Fallbacks** for data that fails to load
3. **Progressive Enhancement** to ensure core functionality works even if advanced features fail
4. **Offline Support** using service workers

## Conclusion

A robust error tracking system in a production React application involves multiple layers:

1. **Detection**: Error boundaries, global handlers, and custom hooks to catch errors
2. **Context**: Enriching errors with user, application, and technical context
3. **Tracking**: Sending error data to a service that can aggregate and analyze it
4. **Analysis**: Identifying patterns and prioritizing fixes
5. **Recovery**: Implementing strategies to help the app recover from errors

By building or adopting a solution that addresses these needs, you can ensure your React application remains reliable even when unexpected errors occur. Most production applications will use established services like Sentry, LogRocket, or Bugsnag, but understanding the underlying principles helps you get the most value from these tools.

Remember that the goal of error tracking isn't just to know when things break, but to:

1. Minimize user impact when errors occur
2. Prioritize fixes based on real-world impact
3. Prevent similar errors in the future

With the strategies outlined above, you'll be well-equipped to handle errors in your production React applications.