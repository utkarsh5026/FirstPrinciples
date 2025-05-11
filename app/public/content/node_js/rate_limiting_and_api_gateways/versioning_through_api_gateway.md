# Understanding Versioning Through API Gateway in Node.js: A Complete Journey from First Principles

Let's embark on a comprehensive exploration of API versioning through gateways in Node.js, starting from the very foundation and building up to real-world implementations.

## What Is an API? The Foundation

Before we dive into versioning and gateways, let's understand what we're working with at the most basic level.

> **An API (Application Programming Interface) is like a waiter in a restaurant. You (the client) tell the waiter what you want, the waiter goes to the kitchen (the server), and brings back your food (the data).**

In technical terms, an API is a set of rules and definitions that allows different software applications to communicate with each other. It defines the requests you can make, how to make them, the data formats you should use, and the conventions to follow.

### Simple API Example

```javascript
// A basic API endpoint in Node.js
const express = require('express');
const app = express();

// This is a simple API endpoint that responds with user data
app.get('/user/:id', (req, res) => {
    // Extract the user ID from the request
    const userId = req.params.id;
  
    // Simulate fetching user data (in real apps, this would query a database)
    const userData = {
        id: userId,
        name: "John Doe",
        email: "john@example.com"
    };
  
    // Send the data back as JSON
    res.json(userData);
});
```

**Code Explanation:**

* `express` is a popular Node.js framework for building web servers
* `app.get()` creates an endpoint that responds to GET requests
* `:id` is a parameter that captures whatever comes after `/user/`
* `req.params.id` extracts that parameter from the request
* `res.json()` sends the data back in JSON format

## Why Do We Need API Versions?

Now that we understand APIs, let's explore why we need different versions of them.

> **Imagine you're running a pizza restaurant. Over time, you add new toppings, change prices, or reorganize your menu. But some loyal customers still want the old menu. You need to serve both the new menu and the old one. This is exactly why we need API versions.**

### Real-World Scenario

Let's say you have a user service API:

```javascript
// Version 1 of our user API - Simple response
app.get('/api/user/:id', (req, res) => {
    const user = {
        id: req.params.id,
        name: "John Doe"
    };
    res.json(user);
});
```

Later, your business requirements change, and you need to add more information:

```javascript
// Version 2 of our user API - Enhanced response
app.get('/api/user/:id', (req, res) => {
    const user = {
        id: req.params.id,
        name: "John Doe",
        email: "john@example.com",
        subscription: "premium",
        lastLogin: "2025-05-10T10:30:00Z"
    };
    res.json(user);
});
```

**The Problem:** If you just replace Version 1 with Version 2, existing applications expecting the old format might break!

**The Solution:** Keep both versions running simultaneously, allowing clients to choose which version they want to use.

## What Is an API Gateway?

> **Think of an API Gateway as a hotel concierge. When you want to go somewhere, you don't call each service (taxi, restaurant, tour guide) directly. You tell the concierge what you need, and they route your request to the appropriate service.**

An API Gateway is a server that acts as a single entry point for multiple backend services. It handles:

* Request routing
* Authentication
* Rate limiting
* Load balancing
* Versioning
* And more...

### Simple API Gateway Concept

```
Client → API Gateway → Backend Service 1
                  → Backend Service 2
                  → Backend Service 3
```

## Implementing Versioning Through API Gateway

Now let's build our own versioning system using an API Gateway pattern in Node.js.

### Basic Version Routing

Here's how we can implement version routing from scratch:

```javascript
const express = require('express');
const app = express();

// This object holds our different API versions
const apiVersions = {
    'v1': require('./versions/v1'),
    'v2': require('./versions/v2'),
    'v3': require('./versions/v3')
};

// Middleware to detect version from URL path
app.use('/api/:version/*', (req, res, next) => {
    // Extract version from URL (e.g., /api/v1/users)
    const version = req.params.version;
  
    // Check if this version exists
    if (!apiVersions[version]) {
        return res.status(404).json({
            error: 'API version not found',
            message: `Version ${version} is not supported`
        });
    }
  
    // Store the version in the request object for later use
    req.apiVersion = version;
    next();
});

// Route all versioned requests through the gateway
app.use('/api/:version', (req, res, next) => {
    const version = req.params.version;
    // Forward the request to the appropriate version handler
    apiVersions[version](req, res, next);
});
```

**Code Explanation:**

* We create a `apiVersions` object that maps version identifiers to their respective handlers
* The first middleware extracts the version from the URL path
* It validates whether the requested version exists
* If valid, it stores the version in the request object
* The second middleware forwards the request to the appropriate version handler

### Creating Version-Specific Handlers

Let's create separate files for each API version:

**versions/v1.js:**

```javascript
const express = require('express');
const router = express.Router();

// Version 1 user endpoint - simple response
router.get('/users/:id', (req, res) => {
    // Simulate database query
    const user = {
        id: req.params.id,
        name: "John Doe",
        // V1 only returns basic info
        created: "2023-01-01"
    };
  
    // Add version info to response headers
    res.header('API-Version', 'v1');
    res.json(user);
});

module.exports = router;
```

**versions/v2.js:**

```javascript
const express = require('express');
const router = express.Router();

// Version 2 user endpoint - enhanced response
router.get('/users/:id', (req, res) => {
    // V2 provides more detailed information
    const user = {
        id: req.params.id,
        name: "John Doe",
        email: "john@example.com",
        // V2 added fields
        subscription: "premium",
        lastLogin: "2025-05-10T10:30:00Z",
        preferences: {
            theme: "dark",
            notifications: true
        }
    };
  
    res.header('API-Version', 'v2');
    res.json(user);
});

module.exports = router;
```

**Code Explanation:**

* Each version file exports an Express router
* The routes handle the same endpoints but with different response formats
* We add the `API-Version` header to help clients identify which version they're using
* V2 provides more data than V1, showing evolution of the API

## Advanced Versioning Strategies

### 1. Header-Based Versioning

Instead of putting the version in the URL, we can use headers:

```javascript
// Middleware to detect version from headers
app.use((req, res, next) => {
    // Check for version in header (e.g., "Accept: application/vnd.api+json;version=2")
    const acceptHeader = req.get('Accept');
    let version = 'v1'; // Default version
  
    if (acceptHeader) {
        // Extract version from Accept header using regex
        const versionMatch = acceptHeader.match(/version=(\d+)/);
        if (versionMatch) {
            version = `v${versionMatch[1]}`;
        }
    }
  
    // Store version for routing
    req.apiVersion = version;
    next();
});

// Route based on detected version
app.use('/api/*', (req, res, next) => {
    const version = req.apiVersion;
    if (apiVersions[version]) {
        apiVersions[version](req, res, next);
    } else {
        res.status(404).json({
            error: 'Unsupported version',
            supported: Object.keys(apiVersions)
        });
    }
});
```

**Code Explanation:**

* We parse the `Accept` header to find version information
* The regex `version=(\d+)` captures the version number
* If no version is specified, we default to v1
* This approach keeps URLs cleaner but requires clients to set headers properly

### 2. Version Deprecation and Migration

Let's implement a system that helps migrate clients from old versions:

```javascript
const DEPRECATED_VERSIONS = {
    'v1': {
        deprecated: true,
        sunset: '2025-12-31',
        migrateTo: 'v2',
        message: 'Version 1 will be sunset on December 31, 2025. Please migrate to v2.'
    }
};

// Middleware to handle deprecated versions
app.use((req, res, next) => {
    const version = req.apiVersion;
  
    if (DEPRECATED_VERSIONS[version]?.deprecated) {
        const info = DEPRECATED_VERSIONS[version];
      
        // Add deprecation warnings to response headers
        res.header('Deprecated', 'true');
        res.header('Sunset', info.sunset);
        res.header('Migrate-To', info.migrateTo);
        res.header('Warning', `299 - "${info.message}"`);
    }
  
    next();
});
```

**Code Explanation:**

* We maintain a deprecation registry with sunset dates
* The middleware adds standard HTTP headers warning about deprecation
* The `Sunset` header tells clients when the version will be removed
* The `Warning` header provides human-readable information
* This gives clients time to migrate while keeping the old version functional

### 3. Feature Toggles with Versioning

Sometimes you need to roll out features gradually:

```javascript
// Feature flags for different versions
const FEATURE_FLAGS = {
    'v2': {
        enableNewDashboard: true,
        enableBetaFeatures: false,
        enableAdvancedAnalytics: true
    },
    'v3': {
        enableNewDashboard: true,
        enableBetaFeatures: true,
        enableAdvancedAnalytics: true,
        enableAIFeatures: true
    }
};

// Middleware to add feature context
app.use((req, res, next) => {
    const version = req.apiVersion;
  
    // Add feature flags to request context
    req.features = FEATURE_FLAGS[version] || FEATURE_FLAGS['v2'];
  
    next();
});

// Example route that uses feature flags
app.get('/api/:version/dashboard', (req, res) => {
    const response = {
        basicDashboard: {
            // Always available data
            stats: {
                users: 1000,
                revenue: 50000
            }
        }
    };
  
    // Conditionally add features based on version
    if (req.features.enableAdvancedAnalytics) {
        response.advancedAnalytics = {
            conversionRate: 0.15,
            churnRate: 0.05,
            lifeTimeValue: 850
        };
    }
  
    if (req.features.enableAIFeatures) {
        response.aiInsights = {
            recommendations: [
                "Focus on retaining high-value customers",
                "Expand marketing in geographic region A"
            ]
        };
    }
  
    res.json(response);
});
```

**Code Explanation:**

* We define feature flags for each API version
* The middleware attaches available features to the request object
* Routes can check feature flags to conditionally include functionality
* This allows gradual feature rollout and A/B testing

## Complete API Gateway with Versioning

Let's put it all together into a production-ready API Gateway:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

class APIGateway {
    constructor() {
        this.app = express();
        this.versions = new Map();
        this.setupMiddleware();
        this.setupVersioning();
    }
  
    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        this.app.use(cors());
      
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // Limit each IP to 100 requests per windowMs
        });
        this.app.use('/api/', limiter);
      
        // Body parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
      
        // Request logging (simple version)
        this.app.use((req, res, next) => {
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
            next();
        });
    }
  
    // Method to register a new API version
    registerVersion(version, handler) {
        this.versions.set(version, handler);
        console.log(`Registered API version: ${version}`);
    }
  
    setupVersioning() {
        // Version detection and routing
        this.app.use('/api/:version/*', (req, res, next) => {
            const version = req.params.version;
          
            if (!this.versions.has(version)) {
                return res.status(404).json({
                    error: 'Version not found',
                    message: `API version ${version} is not supported`,
                    availableVersions: Array.from(this.versions.keys())
                });
            }
          
            req.apiVersion = version;
            // Track API version usage (could be sent to analytics)
            this.trackVersionUsage(version, req);
          
            next();
        });
      
        // Route to version handlers
        this.app.use('/api/:version', (req, res, next) => {
            const version = req.params.version;
            const handler = this.versions.get(version);
          
            if (handler) {
                // Add API Gateway context to request
                req.gateway = {
                    version: version,
                    timestamp: new Date().toISOString(),
                    requestId: this.generateRequestId()
                };
              
                handler(req, res, next);
            } else {
                next();
            }
        });
      
        // API documentation endpoint
        this.app.get('/api', (req, res) => {
            res.json({
                title: 'API Gateway',
                description: 'Multi-version API gateway',
                versions: Array.from(this.versions.keys()).map(v => ({
                    version: v,
                    endpoints: `/api/${v}/`
                }))
            });
        });
    }
  
    // Helper method to generate unique request IDs
    generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
  
    // Method to track version usage (extend as needed)
    trackVersionUsage(version, req) {
        // In production, this might send to analytics service
        console.log(`Version ${version} accessed from ${req.ip}`);
    }
  
    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`API Gateway running on port ${port}`);
            console.log(`Available versions: ${Array.from(this.versions.keys()).join(', ')}`);
        });
    }
}

// Usage example
const gateway = new APIGateway();

// Register different versions
gateway.registerVersion('v1', require('./versions/v1'));
gateway.registerVersion('v2', require('./versions/v2'));
gateway.registerVersion('v3', require('./versions/v3-beta'));

// Start the gateway
gateway.start(3000);
```

**Code Explanation:**

* We create a `APIGateway` class to encapsulate all functionality
* The constructor sets up middleware and versioning logic
* `registerVersion()` allows dynamic registration of new API versions
* We include security middleware (helmet), CORS, and rate limiting
* Each request gets a unique ID for tracing
* We track version usage for analytics
* The gateway exposes an endpoint showing available versions

## Visual Representation

Here's how the API Gateway version routing flow works:

```
┌─────────────┐
│   Client    │
│  Request    │
└──────┬──────┘
       │
       │ GET /api/v2/users/123
       │
┌──────▼──────┐
│  API Gateway│
│  Middleware │
├─────────────┤
│ • CORS      │
│ • Rate Limit│
│ • Parse Body│
│ • Logging   │
└──────┬──────┘
       │
       │ Extract "v2"
       │
┌──────▼──────┐
│  Version    │
│  Detection  │
└──────┬──────┘
       │
       │ Forward to v2 handler
       │
┌──────▼──────┐
│  Version v2 │
│   Handler   │
├─────────────┤
│ router.get  │
│ ('/users/:id'│
└──────┬──────┘
       │
       │ Process request
       │
┌──────▼──────┐
│   Response  │
│  to Client  │
└─────────────┘
```

## Best Practices for API Versioning

> **Remember: Versioning is like renovating a house while people are still living in it. You need to be careful, plan ahead, and make sure everyone knows what's happening.**

### 1. Version Naming Convention

```javascript
// Good: Semantic versioning
const versions = ['v1', 'v2', 'v3'];

// Also good: Date-based
const versions = ['2024-01-15', '2024-06-20', '2025-01-10'];

// Avoid: Non-descriptive names
const versions = ['old', 'new', 'latest']; // Don't do this!
```

### 2. Backward Compatibility

```javascript
// Version adapter pattern
const v1ToV2Adapter = (v1Response) => {
    // Convert v1 format to v2 format
    return {
        ...v1Response,
        // Add new v2 fields with default values
        email: v1Response.email || null,
        subscription: 'free',
        lastLogin: null
    };
};

// In v2 handler
router.get('/users/:id', async (req, res) => {
    // Get data in v1 format (from existing service)
    const v1Data = await getUserDataV1(req.params.id);
  
    // Adapt to v2 format
    const v2Data = v1ToV2Adapter(v1Data);
  
    res.json(v2Data);
});
```

### 3. Version Documentation

```javascript
// Self-documenting versions
const versionInfo = {
    'v1': {
        status: 'deprecated',
        sunset: '2025-12-31',
        features: ['basic user management'],
        changelog: 'Initial release'
    },
    'v2': {
        status: 'stable',
        sunset: null,
        features: ['user management', 'subscription handling', 'email verification'],
        changelog: 'Added subscription and email features'
    },
    'v3': {
        status: 'beta',
        sunset: null,
        features: ['all v2 features', 'AI recommendations', 'advanced analytics'],
        changelog: 'Added AI and analytics capabilities'
    }
};

// Endpoint to get version information
app.get('/api/versions', (req, res) => {
    res.json(versionInfo);
});
```

## Testing Versioned APIs

Testing is crucial when maintaining multiple API versions:

```javascript
// Example test suite for versioned API
const request = require('supertest');
const app = require('./api-gateway');

describe('API Versioning', () => {
    describe('Version 1', () => {
        it('should return basic user data', async () => {
            const response = await request(app)
                .get('/api/v1/users/123')
                .expect(200);
          
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).not.toHaveProperty('email'); // v1 doesn't have email
        });
    });
  
    describe('Version 2', () => {
        it('should return enhanced user data', async () => {
            const response = await request(app)
                .get('/api/v2/users/123')
                .expect(200);
          
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('email'); // v2 includes email
            expect(response.body).toHaveProperty('subscription');
        });
    });
  
    describe('Version Detection', () => {
        it('should reject unknown versions', async () => {
            await request(app)
                .get('/api/v99/users/123')
                .expect(404);
        });
      
        it('should include deprecation headers for v1', async () => {
            const response = await request(app)
                .get('/api/v1/users/123');
          
            expect(response.headers).toHaveProperty('deprecated');
            expect(response.headers).toHaveProperty('sunset');
        });
    });
});
```

## Monitoring and Metrics

Track how your versions are being used:

```javascript
// Simple metrics collector
class VersionMetrics {
    constructor() {
        this.metrics = new Map();
    }
  
    recordRequest(version, endpoint, responseTime) {
        const key = `${version}:${endpoint}`;
      
        if (!this.metrics.has(key)) {
            this.metrics.set(key, {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                lastUsed: null
            });
        }
      
        const metric = this.metrics.get(key);
        metric.count++;
        metric.totalTime += responseTime;
        metric.avgTime = metric.totalTime / metric.count;
        metric.lastUsed = new Date();
    }
  
    getMetrics() {
        const result = {};
        this.metrics.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }
}

// Integrate with gateway
const metrics = new VersionMetrics();

app.use((req, res, next) => {
    const start = Date.now();
  
    // Override res.send to capture response time
    const originalSend = res.send;
    res.send = function(...args) {
        const duration = Date.now() - start;
      
        if (req.apiVersion) {
            metrics.recordRequest(req.apiVersion, req.path, duration);
        }
      
        return originalSend.apply(this, args);
    };
  
    next();
});

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
    res.json(metrics.getMetrics());
});
```

## Performance Considerations

> **An API Gateway is like a traffic intersection. If it's not optimized, it becomes a bottleneck for all traffic passing through.**

### 1. Caching Strategies

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minute TTL

// Cache middleware for GET requests
const cacheMiddleware = (req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }
  
    const key = `${req.apiVersion}:${req.path}:${JSON.stringify(req.query)}`;
    const cached = cache.get(key);
  
    if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
    }
  
    // Store original res.json
    const originalJson = res.json;
  
    // Override res.json to cache response
    res.json = function(data) {
        cache.set(key, data);
        res.set('X-Cache', 'MISS');
        return originalJson.call(this, data);
    };
  
    next();
};

// Apply caching to versioned routes
app.use('/api/:version', cacheMiddleware);
```

### 2. Connection Pooling for Backend Services

```javascript
const http = require('http');

// Create a connection pool for backend services
const agent = new http.Agent({
    keepAlive: true,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000
});

// Use the pool when making requests to backend services
const makeBackendRequest = async (url, options = {}) => {
    return new Promise((resolve, reject) => {
        const req = http.request(url, {
            ...options,
            agent: agent // Use our connection pool
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
      
        req.on('error', reject);
        req.end();
    });
};
```

## Security Considerations

### 1. Version-Specific Authentication

```javascript
// Different auth requirements for different versions
const authMiddleware = {
    'v1': (req, res, next) => {
        // V1 uses API keys
        const apiKey = req.header('X-API-Key');
        if (!validateApiKey(apiKey)) {
            return res.status(401).json({ error: 'Invalid API key' });
        }
        next();
    },
  
    'v2': (req, res, next) => {
        // V2 uses OAuth
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!validateOAuthToken(token)) {
            return res.status(401).json({ error: 'Invalid OAuth token' });
        }
        next();
    },
  
    'v3': async (req, res, next) => {
        // V3 uses JWT
        const token = req.header('Authorization')?.replace('Bearer ', '');
        try {
            const decoded = await verifyJWT(token);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid JWT token' });
        }
    }
};

// Apply version-specific auth
app.use('/api/:version/*', (req, res, next) => {
    const version = req.params.version;
    const auth = authMiddleware[version];
  
    if (!auth) {
        return res.status(401).json({ error: 'Version not supported' });
    }
  
    auth(req, res, next);
});
```

### 2. Input Validation by Version

```javascript
const ajv = require('ajv');
const validator = new ajv();

// Different validation schemas for different versions
const userSchemas = {
    'v1': {
        type: 'object',
        required: ['name'],
        properties: {
            name: { type: 'string', minLength: 1 }
        }
    },
  
    'v2': {
        type: 'object',
        required: ['name', 'email'],
        properties: {
            name: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' }
        }
    }
};

// Version-specific validation middleware
const validateUser = (req, res, next) => {
    const schema = userSchemas[req.apiVersion];
  
    if (!schema) {
        return res.status(400).json({ error: 'Version not supported' });
    }
  
    const validate = validator.compile(schema);
    const valid = validate(req.body);
  
    if (!valid) {
        return res.status(400).json({
            error: 'Validation failed',
            details: validate.errors
        });
    }
  
    next();
};

// Apply to routes
app.post('/api/:version/users', validateUser, (req, res) => {
    // Handle validated request
});
```

## Advanced Patterns

### 1. GraphQL Gateway for Multiple Versions

```javascript
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');

// Version-specific GraphQL schemas
const schemas = {
    'v1': makeExecutableSchema({
        typeDefs: `
            type User {
                id: ID!
                name: String!
            }
          
            type Query {
                user(id: ID!): User
            }
        `,
        resolvers: {
            Query: {
                user: (_, { id }) => fetchUserV1(id)
            }
        }
    }),
  
    'v2': makeExecutableSchema({
        typeDefs: `
            type User {
                id: ID!
                name: String!
                email: String!
                subscription: String!
            }
          
            type Query {
                user(id: ID!): User
                users(limit: Int): [User]
            }
        `,
        resolvers: {
            Query: {
                user: (_, { id }) => fetchUserV2(id),
                users: (_, { limit = 10 }) => fetchUsersV2(limit)
            }
        }
    })
};

// Create versioned GraphQL servers
Object.entries(schemas).forEach(([version, schema]) => {
    const server = new ApolloServer({
        schema,
        context: ({ req }) => ({
            version,
            user: req.user
        })
    });
  
    server.applyMiddleware({
        app,
        path: `/graphql/${version}`
    });
});
```

### 2. Automated Version Migration

```javascript
// Migration rules for automatic version translation
const migrationRules = {
    'v1-to-v2': {
        rules: [
            {
                path: '$.user.lastActive',
                transform: (value) => value ? new Date(value).toISOString() : null,
                default: null
            },
            {
                path: '$.user.subscription',
                transform: () => 'free', // Default all v1 users to free
                default: 'free'
            }
        ]
    },
    'v2-to-v3': {
        rules: [
            {
                path: '$.user.preferences',
                transform: (user) => ({
                    theme: user.theme || 'light',
                    notifications: user.emailNotifications ?? true
                }),
                default: { theme: 'light', notifications: true }
            }
        ]
    }
};

// Function to migrate data between versions
const migrateData = (data, fromVersion, toVersion) => {
    const migrationKey = `${fromVersion}-to-${toVersion}`;
    const migration = migrationRules[migrationKey];
  
    if (!migration) {
        throw new Error(`No migration path from ${fromVersion} to ${toVersion}`);
    }
  
    let result = JSON.parse(JSON.stringify(data)); // Deep clone
  
    migration.rules.forEach(rule => {
        const pathParts = rule.path.split('.');
        let current = result;
      
        // Navigate to the target path
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (!current[pathParts[i]]) {
                current[pathParts[i]] = {};
            }
            current = current[pathParts[i]];
        }
      
        // Apply transformation
        const key = pathParts[pathParts.length - 1];
        current[key] = rule.transform(data, current);
    });
  
    return result;
};

// Middleware for automatic version translation
app.use('/api/:version', (req, res, next) => {
    const targetVersion = req.params.version;
    const sourceVersion = req.query.source_version;
  
    if (sourceVersion && sourceVersion !== targetVersion) {
        const originalJson = res.json;
      
        res.json = function(data) {
            try {
                const migrated = migrateData(data, sourceVersion, targetVersion);
                res.header('X-Migrated-From', sourceVersion);
                return originalJson.call(this, migrated);
            } catch (error) {
                res.status(400).json({
                    error: 'Migration failed',
                    message: error.message
                });
            }
        };
    }
  
    next();
});
```

## Error Handling and Debugging

### 1. Version-Aware Error Handling

```javascript
// Error handler with version context
const errorHandler = (err, req, res, next) => {
    const error = {
        status: err.status || 500,
        message: err.message || 'Internal server error',
        version: req.apiVersion,
        requestId: req.gateway?.requestId
    };
  
    // Add stack trace for internal errors in development
    if (process.env.NODE_ENV === 'development' && error.status === 500) {
        error.stack = err.stack;
    }
  
    // Version-specific error formatting
    switch (req.apiVersion) {
        case 'v1':
            // V1 has simple error format
            res.status(error.status).json({
                error: error.message
            });
            break;
          
        case 'v2':
        case 'v3':
            // V2+ has detailed error format
            res.status(error.status).json({
                error: {
                    code: err.code || 'UNKNOWN_ERROR',
                    message: error.message,
                    details: err.details || null,
                    requestId: error.requestId
                }
            });
            break;
          
        default:
            res.status(error.status).json(error);
    }
  
    // Log error with context
    console.error({
        ...error,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent')
    });
};

app.use(errorHandler);
```

### 2. Debugging Tools

```javascript
// Debug middleware for API versioning
const debugMiddleware = (req, res, next) => {
    if (req.query.debug === 'true' && process.env.NODE_ENV === 'development') {
        const debugInfo = {
            version: req.apiVersion,
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method,
            headers: req.headers,
            query: req.query,
            params: req.params,
            body: req.body
        };
      
        // Add debug info to response
        const originalJson = res.json;
        res.json = function(data) {
            return originalJson.call(this, {
                debug: debugInfo,
                data: data
            });
        };
    }
  
    next();
};

app.use('/api/:version', debugMiddleware);
```

## Deployment Strategies

### 1. Blue-Green Deployment for Versions

```javascript
// Configuration for blue-green deployments
const deploymentConfig = {
    production: {
        versions: {
            'v1': { weight: 0, environment: 'deprecated' },
            'v2': { weight: 80, environment: 'blue' },
            'v3': { weight: 20, environment: 'green' }
        }
    },
    staging: {
        versions: {
            'v2': { weight: 50, environment: 'blue' },
            'v3': { weight: 50, environment: 'green' }
        }
    }
};

// Middleware for weighted routing
const weightedRouting = (req, res, next) => {
    const config = deploymentConfig[process.env.NODE_ENV || 'production'];
    const versions = config.versions;
  
    // Calculate random number for weighted selection
    const random = Math.random() * 100;
    let accumulated = 0;
  
    for (const [version, settings] of Object.entries(versions)) {
        accumulated += settings.weight;
        if (random <= accumulated) {
            req.selectedVersion = version;
            req.environment = settings.environment;
            break;
        }
    }
  
    next();
};

// Apply weighted routing for A/B testing
app.use('/api/auto', weightedRouting, (req, res, next) => {
    // Forward to selected version
    req.url = `/api/${req.selectedVersion}${req.path}`;
    next();
});
```

### 2. Canary Releases

```javascript
// Canary release configuration
class CanaryDeployment {
    constructor() {
        this.canaryConfig = {
            'v3': {
                enabled: true,
                percentage: 5, // Start with 5% traffic
                criteria: {
                    userType: 'premium', // Only premium users see v3
                    region: ['us-east-1'], // Only specific regions
                    feature: 'beta_tester' // Users with beta feature flag
                }
            }
        };
    }
  
    shouldUseCanary(req, version) {
        const config = this.canaryConfig[version];
      
        if (!config?.enabled) {
            return false;
        }
      
        // Check user criteria
        if (config.criteria.userType && req.user?.type !== config.criteria.userType) {
            return false;
        }
      
        if (config.criteria.region && !config.criteria.region.includes(req.user?.region)) {
            return false;
        }
      
        if (config.criteria.feature && !req.user?.features?.includes(config.criteria.feature)) {
            return false;
        }
      
        // Apply percentage-based routing
        return Math.random() * 100 < config.percentage;
    }
  
    routeRequest(req, res, next) {
        const requestedVersion = req.params.version;
        const canaryVersion = this.findCanaryVersion(requestedVersion);
      
        if (canaryVersion && this.shouldUseCanary(req, canaryVersion)) {
            req.actualVersion = canaryVersion;
            res.header('X-Canary-Version', canaryVersion);
        } else {
            req.actualVersion = requestedVersion;
        }
      
        next();
    }
  
    findCanaryVersion(baseVersion) {
        // Logic to determine if there's a canary version
        for (const [version, config] of Object.entries(this.canaryConfig)) {
            if (version > baseVersion && config.enabled) {
                return version;
            }
        }
        return null;
    }
}

const canary = new CanaryDeployment();
app.use('/api/:version', (req, res, next) => canary.routeRequest(req, res, next));
```

## Conclusion

> **API versioning through a gateway is like conducting an orchestra. Each version plays its part, the gateway coordinates them all, and together they create a harmonious experience for your users.**

We've covered the complete journey from understanding basic APIs to implementing sophisticated versioning strategies with an API Gateway in Node.js. Remember these key principles:

1. **Start Simple** : Begin with basic URL-based versioning
2. **Plan for Change** : Design your gateway to easily accommodate new versions
3. **Maintain Backward Compatibility** : Keep old versions running while encouraging migration
4. **Monitor Usage** : Track which versions are used and plan deprecation accordingly
5. **Document Everything** : Clear documentation helps developers understand and use your API effectively
6. **Test Thoroughly** : Automated tests ensure all versions work correctly
7. **Deploy Safely** : Use techniques like canary releases to minimize risk

By following these patterns and examples, you can build a robust API versioning system that serves your users well while giving you the flexibility to evolve your API over time.

Remember, the best versioning strategy is one that balances the needs of your users with the realities of your development process. Start with what works for your current needs, and evolve your approach as your API grows.
