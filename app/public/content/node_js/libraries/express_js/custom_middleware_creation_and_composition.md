# Custom Middleware Creation and Composition in Express.js

Before we dive into the intricacies of Express middleware, let's start from the ground up and build our understanding step by step.

## What is Middleware at Its Core?

> Middleware is like a filter or checkpoint system between the incoming request and the outgoing response in your web application.

Think of it this way: when a request comes to your Express server, it's like a person entering a building. They might need to:

1. Sign in at the reception desk
2. Pass through security screening
3. Get a visitor's badge
4. Be escorted by a staff member

Each of these steps is like a middleware function - they happen in sequence, and each one can:

* Examine or modify the request
* Decide whether to pass the request to the next step
* Add information to the response
* Or completely stop the process

## The Anatomy of Middleware Functions

A middleware function in Express has a very specific signature. Let's break it down:

```javascript
const myMiddleware = (req, res, next) => {
  // req: The incoming request object
  // res: The outgoing response object  
  // next: A function to pass control to the next middleware
  
  // Do something with req or res
  console.log('Processing request...');
  
  // Must call next() to pass control to the next middleware
  next();
};
```

> The `next()` function is crucial - forgetting to call it will cause your application to hang, waiting forever for a response.

Let's see a simple example in action:

```javascript
const express = require('express');
const app = express();

// A simple logging middleware
const logRequests = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // Don't forget this!
};

// Use the middleware
app.use(logRequests);

// A route handler
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000);
```

## Building Your First Custom Middleware

Let's create a more practical middleware that adds request timing information:

```javascript
const addRequestTime = (req, res, next) => {
  // Start timing the request
  req.startTime = Date.now();
  
  // Store the original res.send function
  const originalSend = res.send;
  
  // Override res.send to add timing information
  res.send = function(...args) {
    const duration = Date.now() - req.startTime;
    console.log(`Request completed in ${duration}ms`);
  
    // Call the original send with the original context
    originalSend.apply(this, args);
  };
  
  next();
};

app.use(addRequestTime);
```

Here's what's happening:

1. We capture the start time when the request begins
2. We override `res.send` to calculate and log the duration
3. We call `next()` to continue processing
4. When the response is finally sent, our overridden function runs

## Understanding Middleware Flow and Order

> Middleware executes in the exact order you define it. Think of it as a waterfall - each piece flows into the next.

```javascript
// Middleware executes in this order:
// 1. First middleware
app.use((req, res, next) => {
  console.log('1. First middleware');
  next();
});

// 2. Auth middleware (only for protected routes)
app.use('/admin', (req, res, next) => {
  console.log('2. Auth check');
  next();
});

// 3. Route-specific middleware
app.get('/admin/dashboard', 
  (req, res, next) => {
    console.log('3. Dashboard-specific middleware');
    next();
  },
  (req, res) => {
    res.send('Admin Dashboard');
  }
);
```

## Creating Configurable Middleware

Sometimes you need middleware that can be customized. Here's how to create a middleware factory:

```javascript
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000,    // 1 minute
    maxRequests = 100,   // max requests per window
    message = 'Rate limit exceeded'
  } = options;
  
  const requests = new Map();
  
  return (req, res, next) => {
    const clientIP = req.ip;
    const now = Date.now();
  
    // Clean up old entries
    for (const [ip, data] of requests.entries()) {
      if (now - data.windowStart > windowMs) {
        requests.delete(ip);
      }
    }
  
    // Get or create request data for this IP
    let requestData = requests.get(clientIP);
  
    if (!requestData) {
      requestData = { count: 0, windowStart: now };
      requests.set(clientIP, requestData);
    }
  
    // Reset count if window has expired
    if (now - requestData.windowStart > windowMs) {
      requestData.count = 0;
      requestData.windowStart = now;
    }
  
    // Increment and check limit
    requestData.count++;
  
    if (requestData.count > maxRequests) {
      return res.status(429).json({ error: message });
    }
  
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - requestData.count);
  
    next();
  };
};

// Usage
app.use(createRateLimiter({
  windowMs: 60000,
  maxRequests: 100
}));
```

## Middleware Composition Patterns

### Sequential Composition

```javascript
// Multiple middleware for a single route
app.post('/api/users',
  validateInput,        // Check if input is valid
  checkAuthentication,  // Ensure user is logged in
  checkAuthorization,   // Ensure user has permissions
  processRequest,       // Main business logic
  auditLog,            // Log the action
  sendResponse         // Send the response
);
```

### Conditional Middleware

```javascript
const conditionalMiddleware = (condition, middleware) => {
  return (req, res, next) => {
    if (condition(req)) {
      middleware(req, res, next);
    } else {
      next();
    }
  };
};

// Usage
app.use(conditionalMiddleware(
  (req) => req.path.startsWith('/api'),
  authenticationMiddleware
));
```

### Middleware Chain with Error Handling

```javascript
const asyncMiddleware = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
app.get('/users/:id', 
  asyncMiddleware(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error('User not found');
    }
    req.user = user;
    next();
  }),
  (req, res) => {
    res.json(req.user);
  }
);
```

## Advanced Middleware Patterns

### Middleware with Shared State

```javascript
const createSessionMiddleware = () => {
  const sessions = new Map();
  
  return {
    middleware: (req, res, next) => {
      const sessionId = req.cookies?.sessionId;
    
      if (sessionId && sessions.has(sessionId)) {
        req.session = sessions.get(sessionId);
      } else {
        const newSessionId = generateUniqueId();
        req.session = { id: newSessionId, data: {} };
        sessions.set(newSessionId, req.session);
        res.cookie('sessionId', newSessionId);
      }
    
      // Save session on response
      const originalSend = res.send;
      res.send = function(...args) {
        sessions.set(req.session.id, req.session);
        originalSend.apply(this, args);
      };
    
      next();
    },
  
    // Utility method to clear a session
    clearSession: (sessionId) => {
      sessions.delete(sessionId);
    }
  };
};

const sessionManager = createSessionMiddleware();
app.use(sessionManager.middleware);
```

### Middleware Pipeline Builder

```javascript
class MiddlewarePipeline {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this; // Allow chaining
  }
  
  build() {
    return (req, res, next) => {
      let index = 0;
    
      const runNext = (error) => {
        if (error) return next(error);
      
        if (index >= this.middlewares.length) {
          return next();
        }
      
        const middleware = this.middlewares[index++];
      
        try {
          middleware(req, res, runNext);
        } catch (error) {
          next(error);
        }
      };
    
      runNext();
    };
  }
}

// Usage
const apiPipeline = new MiddlewarePipeline()
  .use(cors())
  .use(bodyParser.json())
  .use(authenticate)
  .use(validateRequest)
  .build();

app.use('/api', apiPipeline);
```

## Error Handling Middleware

> Error handling middleware is special - it takes four parameters instead of three, with the first being the error.

```javascript
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Different error types need different responses
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication'
    });
  }
  
  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
};

// Must be last middleware
app.use(errorHandler);
```

## Best Practices for Middleware

1. **Keep middleware focused** : Each middleware should do one thing well
2. **Always call next()** : Unless you're ending the request-response cycle
3. **Handle errors gracefully** : Use error handling middleware
4. **Order matters** : Place middleware in logical sequence
5. **Use factory functions** : For configurable middleware
6. **Avoid memory leaks** : Clean up resources and listeners

## Complete Example: Authentication System

Let's put it all together with a complete authentication middleware system:

```javascript
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorization middleware factory
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage
app.get('/admin/users', 
  authenticate,
  authorize('admin', 'moderator'),
  async (req, res) => {
    const users = await User.find();
    res.json(users);
  }
);
```

Through this journey, we've built middleware understanding from the ground up - starting with the basic concept of request processing, moving through custom middleware creation, exploring various composition patterns, and ending with real-world examples. Each piece builds upon the previous, creating a complete picture of how middleware works in Express.js.

Remember: middleware is the backbone of Express applications. Master these patterns, and you'll have the tools to build sophisticated, maintainable web applications.
