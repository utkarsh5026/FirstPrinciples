# Canary Releases in NodeJS: A First Principles Deep Dive

## Understanding Canary Releases from First Principles

> A canary release is a deployment strategy where you gradually roll out changes to a small subset of users before making them available to everyone. The name comes from the historical practice of coal miners bringing canaries into mines to detect toxic gases - if the canary died, miners knew to evacuate.

### The Core Principle: Incremental Exposure

At its most fundamental level, a canary release is about  **risk management** . Rather than exposing your entire user base to a new version of your software simultaneously, you start by exposing only a small percentage of traffic to the new version.

Let's break down the core concepts that make canary releases work:

1. **Traffic routing** - The ability to direct different users to different versions of your application
2. **Progressive rollout** - The gradual increase in the percentage of users exposed to the new version
3. **Observability** - The ability to monitor the performance and behavior of both versions
4. **Automated decision-making** - The logic that decides whether to proceed with the rollout or roll back

## Implementation Approaches in NodeJS

In NodeJS applications, we can implement canary releases through several approaches:

1. **Infrastructure-level** implementation using load balancers or service meshes
2. **Application-level** implementation where the routing logic lives in your code
3. **Feature flag-based** implementation where features are toggled on/off for specific users

Let's explore each of these approaches in detail.

### 1. Infrastructure-Level Canary Releases

At the infrastructure level, canary releases are typically implemented using load balancers, Kubernetes, or service meshes.

> The key advantage of infrastructure-level implementation is that your application code doesn't need to be aware of the canary release process. The routing decisions happen before requests even reach your NodeJS application.

#### Example: Using Kubernetes for Canary Releases

In a Kubernetes environment, you might have two deployments: one for your stable version and one for your canary version. Here's a simplified example of how this might look:

```yaml
# stable-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-stable
spec:
  replicas: 9  # 90% of pods
  selector:
    matchLabels:
      app: my-app
      version: stable
  template:
    metadata:
      labels:
        app: my-app
        version: stable
    spec:
      containers:
      - name: my-app
        image: my-app:v1
        ports:
        - containerPort: 3000
```

```yaml
# canary-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-canary
spec:
  replicas: 1  # 10% of pods
  selector:
    matchLabels:
      app: my-app
      version: canary
  template:
    metadata:
      labels:
        app: my-app
        version: canary
    spec:
      containers:
      - name: my-app
        image: my-app:v2
        ports:
        - containerPort: 3000
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app  # This matches both stable and canary pods
  ports:
  - port: 80
    targetPort: 3000
```

In this setup, Kubernetes will distribute traffic across all pods that match the `app: my-app` label. Since we have 9 stable pods and 1 canary pod, approximately 10% of traffic will go to the canary version.

### 2. Application-Level Canary Releases

In application-level implementations, your NodeJS application itself contains the logic to route users to different versions.

> Application-level canary implementations give you more fine-grained control over the routing logic, allowing you to make decisions based on user attributes, session information, or other application-specific criteria.

#### Example: Canary Routing in Express.js

Here's a simple example using Express.js to implement canary routing based on a random percentage:

```javascript
const express = require('express');
const app = express();

// Configuration for canary release
const CANARY_PERCENTAGE = 10; // 10% of users get the canary version

// Middleware to determine if a request should go to the canary version
app.use((req, res, next) => {
  // Generate a random number between 0 and 100
  const randomValue = Math.floor(Math.random() * 100);
  
  // If the random value is less than our canary percentage
  // mark this request for the canary version
  if (randomValue < CANARY_PERCENTAGE) {
    req.isCanary = true;
  } else {
    req.isCanary = false;
  }
  
  next();
});

// Example route with different behavior for canary vs stable
app.get('/api/feature', (req, res) => {
  if (req.isCanary) {
    // New implementation (canary)
    return res.json({
      version: 'canary',
      result: 'This is the new feature implementation!'
    });
  } else {
    // Existing implementation (stable)
    return res.json({
      version: 'stable',
      result: 'This is the current feature implementation.'
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

This is a very basic implementation. In a real-world scenario, you'd want more consistent user routing (so the same user gets the same version across multiple requests) and more sophisticated decision-making.

#### More Realistic Express.js Implementation

Let's enhance our example to make it more production-ready:

```javascript
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');

// Configuration
const CANARY_PERCENTAGE = 10;
const COOKIE_NAME = 'version_assignment';
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// Middleware
app.use(cookieParser());

// Version assignment middleware
app.use((req, res, next) => {
  // If user already has a version assignment, use it
  if (req.cookies[COOKIE_NAME]) {
    req.isCanary = req.cookies[COOKIE_NAME] === 'canary';
    return next();
  }
  
  // Otherwise, assign a version based on our canary percentage
  const randomValue = Math.floor(Math.random() * 100);
  req.isCanary = randomValue < CANARY_PERCENTAGE;
  
  // Set a cookie so the user gets a consistent experience
  res.cookie(COOKIE_NAME, req.isCanary ? 'canary' : 'stable', {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });
  
  next();
});

// Example routes
app.get('/api/feature', (req, res) => {
  if (req.isCanary) {
    // Log metrics for the canary version
    logMetrics('canary', req.path, Date.now());
    return res.json({
      version: 'canary',
      result: 'New implementation'
    });
  } else {
    // Log metrics for the stable version
    logMetrics('stable', req.path, Date.now());
    return res.json({
      version: 'stable',
      result: 'Current implementation'
    });
  }
});

// Helper function to log metrics
function logMetrics(version, path, timestamp) {
  // In a real app, you would send these to a monitoring system
  console.log(`[${timestamp}] ${version} version served for ${path}`);
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

This improved version:

1. Uses cookies to ensure consistent user experience
2. Includes basic metrics logging
3. Has proper error handling
4. Sets secure cookie options for production

### 3. Feature Flag-Based Canary Releases

Feature flags (also known as feature toggles) provide a powerful way to implement canary releases in NodeJS applications.

> Feature flags allow you to decouple deployment from feature release, giving you fine-grained control over who sees what features. This approach is extremely powerful for canary releases because it allows you to target specific user segments.

#### Example: Using a Feature Flag Library

Let's look at an example using the popular `unleash` feature flag library:

```javascript
const express = require('express');
const { initialize } = require('unleash-client');

const app = express();

// Initialize Unleash client
const unleash = initialize({
  url: 'https://unleash.mycompany.com/api',
  appName: 'my-node-app',
  instanceId: 'my-instance-1',
  refreshInterval: 15000,
  metricsInterval: 60000
});

// Middleware to add user context for feature flag decisions
app.use((req, res, next) => {
  // Extract user ID from request (e.g., from JWT token, session, etc.)
  const userId = req.headers['user-id'] || 'anonymous';
  
  // Create a context object that Unleash will use to evaluate flags
  req.unleashContext = {
    userId,
    sessionId: req.cookies.sessionId,
    remoteAddress: req.ip,
    properties: {
      // Additional properties for targeting
      userAgent: req.headers['user-agent']
    }
  };
  
  next();
});

// Example route using feature flag for canary release
app.get('/api/recommendations', (req, res) => {
  // Check if this user should see the canary version
  const useNewAlgorithm = unleash.isEnabled('new-recommendations-algorithm', req.unleashContext);
  
  if (useNewAlgorithm) {
    // New implementation (canary)
    return res.json({
      version: 'canary',
      recommendations: getRecommendationsNewAlgorithm(req.user)
    });
  } else {
    // Existing implementation (stable)
    return res.json({
      version: 'stable',
      recommendations: getRecommendationsCurrentAlgorithm(req.user)
    });
  }
});

// Implementation functions
function getRecommendationsNewAlgorithm(user) {
  // The new algorithm implementation
  return ['product1', 'product2', 'product3'];
}

function getRecommendationsCurrentAlgorithm(user) {
  // The current algorithm implementation
  return ['productA', 'productB', 'productC'];
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

With this approach, you configure the canary rollout in your feature flag management system rather than in your code. This provides several advantages:

* You can change the rollout percentage without deploying code
* You can target specific user segments
* You can instantly roll back by disabling the feature flag

## Monitoring and Metrics for Canary Releases

A critical aspect of canary releases is monitoring the health and performance of both versions.

> Without robust monitoring, canary releases lose much of their value. The ability to quickly detect problems is what makes the incremental rollout approach effective.

### Example: Monitoring with Prometheus and Express.js

```javascript
const express = require('express');
const promClient = require('prom-client');
const app = express();

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (GC, memory usage, etc.)
promClient.collectDefaultMetrics({ register });

// Create custom metrics for our canary release
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['route', 'method', 'version'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
});

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['route', 'method', 'status', 'version']
});

const errorCounter = new promClient.Counter({
  name: 'app_errors_total',
  help: 'Total number of application errors',
  labelNames: ['route', 'version']
});

// Register metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestCounter);
register.registerMetric(errorCounter);

// Canary assignment middleware (simplified for clarity)
app.use((req, res, next) => {
  const randomValue = Math.floor(Math.random() * 100);
  req.isCanary = randomValue < 10; // 10% to canary
  next();
});

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  const version = req.isCanary ? 'canary' : 'stable';
  
  // Record end time and update metrics on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
  
    httpRequestDurationMicroseconds
      .labels(route, req.method, version)
      .observe(duration);
  
    httpRequestCounter
      .labels(route, req.method, res.statusCode, version)
      .inc();
  });
  
  next();
});

// Expose metrics endpoint for Prometheus to scrape
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Example API endpoint 
app.get('/api/products', (req, res) => {
  try {
    const version = req.isCanary ? 'canary' : 'stable';
    const products = version === 'canary' 
      ? getProductsNewImplementation()
      : getProductsCurrentImplementation();
  
    res.json({ version, products });
  } catch (error) {
    // Log error and increment error counter
    const version = req.isCanary ? 'canary' : 'stable';
    errorCounter.labels(req.path, version).inc();
  
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getProductsNewImplementation() {
  // New implementation logic
  return ['New Product 1', 'New Product 2'];
}

function getProductsCurrentImplementation() {
  // Current implementation logic
  return ['Current Product 1', 'Current Product 2'];
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

This example uses Prometheus metrics to:

1. Track request durations for both versions
2. Count requests by route, method, status code, and version
3. Monitor errors by route and version

These metrics allow you to compare the performance and error rates of your canary version against your stable version.

## Automated Rollbacks

An important part of any canary release system is the ability to automatically roll back when problems are detected.

> Automated rollbacks are your safety net. When metrics indicate that the canary version is behaving abnormally compared to the stable version, the system should automatically revert traffic routing to avoid impacting more users.

### Example: Simple Automated Rollback Logic

```javascript
const express = require('express');
const app = express();

// Configuration
let CANARY_PERCENTAGE = 10; 
const ERROR_THRESHOLD = 5; // Maximum allowed error percentage difference
let canaryErrorRate = 0;
let stableErrorRate = 0;
let canaryRequestCount = 0;
let stableRequestCount = 0;

// Function to check health and potentially roll back
function checkHealth() {
  // Calculate error rates
  const canaryErrorPercentage = canaryRequestCount > 0 
    ? (canaryErrorRate / canaryRequestCount) * 100 
    : 0;
  
  const stableErrorPercentage = stableRequestCount > 0 
    ? (stableErrorRate / stableRequestCount) * 100 
    : 0;
  
  console.log(`Canary error rate: ${canaryErrorPercentage.toFixed(2)}%`);
  console.log(`Stable error rate: ${stableErrorPercentage.toFixed(2)}%`);
  
  // If canary error rate exceeds stable rate by more than the threshold
  if (canaryErrorPercentage - stableErrorPercentage > ERROR_THRESHOLD) {
    console.log('Rolling back canary release due to high error rate!');
    CANARY_PERCENTAGE = 0; // Roll back by setting canary percentage to 0
  
    // In a real system, you might also:
    // 1. Send alerts to operations team
    // 2. Update your feature flag system
    // 3. Log the rollback event
  }
  
  // Reset counters for the next period
  canaryErrorRate = 0;
  stableErrorRate = 0;
  canaryRequestCount = 0;
  stableRequestCount = 0;
}

// Check health every minute
setInterval(checkHealth, 60000);

// Canary routing middleware
app.use((req, res, next) => {
  const randomValue = Math.floor(Math.random() * 100);
  req.isCanary = randomValue < CANARY_PERCENTAGE;
  next();
});

// Example route
app.get('/api/data', (req, res) => {
  if (req.isCanary) {
    canaryRequestCount++;
    try {
      // New implementation that might have errors
      const result = getDataNewImplementation();
      res.json({ version: 'canary', data: result });
    } catch (error) {
      canaryErrorRate++;
      res.status(500).json({ error: 'Something went wrong' });
    }
  } else {
    stableRequestCount++;
    try {
      // Stable implementation
      const result = getDataStableImplementation();
      res.json({ version: 'stable', data: result });
    } catch (error) {
      stableErrorRate++;
      res.status(500).json({ error: 'Something went wrong' });
    }
  }
});

function getDataNewImplementation() {
  // Simulate occasional errors in the new implementation
  if (Math.random() < 0.1) { // 10% chance of error
    throw new Error('New implementation error');
  }
  return { message: 'Data from new implementation' };
}

function getDataStableImplementation() {
  // Stable implementation with fewer errors
  if (Math.random() < 0.01) { // 1% chance of error
    throw new Error('Stable implementation error');
  }
  return { message: 'Data from stable implementation' };
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

This simplified example demonstrates:

1. Tracking error rates for both canary and stable versions
2. Periodically comparing the error rates
3. Automatically rolling back (by setting canary percentage to 0) if the canary version's error rate exceeds the stable version's by more than a threshold

## Deployment Architecture for Canary Releases

For more complex NodeJS applications, you'll likely want a more sophisticated deployment architecture to support canary releases.

> The ideal architecture for canary releases separates routing concerns from application logic, allows for independent scaling of different versions, and provides robust monitoring.

Here's a diagram of what a typical canary release architecture might look like in a NodeJS environment:

```
┌─────────────────┐
│                 │
│  Load Balancer  │
│                 │
└────────┬────────┘
         │
         │ Request routing based on canary rules
         │
┌────────┼────────┐
│        │        │
│   ┌────▼───┐    │
│   │        │    │
│   │ Router │    │
│   │        │    │
│   └────┬───┘    │
│        │        │
│        │        │
│   ┌────▼───┐    │       ┌────────────┐
│   │        │    │       │            │
│   │Version │    │       │  Metrics   │
│   │Selector│────┼───────►  System    │
│   │        │    │       │            │
│   └────┬───┘    │       └────────────┘
│        │        │
│        ├─────┐  │
│        │     │  │
│   ┌────▼───┐ │  │       ┌────────────┐
│   │        │ │  │       │            │
│   │ Stable │ │  │       │  Feature   │
│   │ v1.0   │ │  │       │   Flag     │
│   │        │ │  │       │  System    │
│   └────────┘ │  │       │            │
│              │  │       └─────┬──────┘
│   ┌──────────▼┐ │             │
│   │           │ │             │
│   │  Canary   │ │             │
│   │  v1.1     │◄─┘             │
│   │           │               │
│   └───────────┘               │
│                               │
└───────────────────────────────┘
```

This architecture includes:

1. A load balancer for initial traffic distribution
2. A router component that determines whether a request goes to canary or stable
3. Version selection logic that might consult a feature flag system
4. Separate instances for stable and canary versions
5. A metrics system for monitoring both versions

## Progressive Deployment with Canary Releases

A key aspect of canary releases is the gradual increase in traffic to the new version.

> The gradual progression from a small percentage to 100% is what makes canary releases effective. You start with minimal risk and increase exposure as confidence grows.

### Example: Progressive Deployment Script

Here's a simple NodeJS script that could be part of your deployment pipeline to progressively increase canary traffic:

```javascript
const axios = require('axios');

// Configuration
const FEATURE_FLAG_API = 'https://featureflags.mycompany.com/api';
const API_KEY = process.env.FEATURE_FLAG_API_KEY;
const FLAG_NAME = 'enable-new-feature';
const INITIAL_PERCENTAGE = 5;
const MAX_PERCENTAGE = 100;
const STEP_SIZE = 10;
const STEP_INTERVAL_MINUTES = 15;
const ERROR_THRESHOLD = 3; // Max percentage points difference in error rates

// Function to update the canary percentage
async function updateCanaryPercentage(percentage) {
  try {
    await axios.patch(
      `${FEATURE_FLAG_API}/flags/${FLAG_NAME}`,
      {
        percentage
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    console.log(`Updated canary percentage to ${percentage}%`);
    return true;
  } catch (error) {
    console.error('Failed to update canary percentage:', error.message);
    return false;
  }
}

// Function to check metrics for stable and canary versions
async function checkMetrics() {
  try {
    const response = await axios.get(
      'https://metrics.mycompany.com/api/compare',
      {
        params: {
          app: 'my-nodejs-app',
          metrics: ['error_rate', 'latency_p95', 'cpu_usage'],
          versions: ['stable', 'canary'],
          timeframe: '15m'
        },
        headers: {
          'Authorization': `Bearer ${process.env.METRICS_API_KEY}`
        }
      }
    );
  
    const metrics = response.data;
  
    // Check if any metrics exceed thresholds
    if (
      metrics.error_rate.canary - metrics.error_rate.stable > ERROR_THRESHOLD ||
      metrics.latency_p95.canary > metrics.latency_p95.stable * 1.2 || // 20% higher latency
      metrics.cpu_usage.canary > metrics.cpu_usage.stable * 1.5 // 50% higher CPU usage
    ) {
      console.log('Canary metrics exceed thresholds. Rolling back.');
      return false;
    }
  
    return true;
  } catch (error) {
    console.error('Failed to check metrics:', error.message);
    return false;
  }
}

// Main function to run the progressive deployment
async function runProgressiveDeployment() {
  console.log('Starting progressive canary deployment');
  
  // Start with initial percentage
  let currentPercentage = INITIAL_PERCENTAGE;
  let success = await updateCanaryPercentage(currentPercentage);
  
  if (!success) {
    console.error('Failed to set initial canary percentage. Aborting.');
    process.exit(1);
  }
  
  // Set up interval to gradually increase percentage
  const interval = setInterval(async () => {
    // Check metrics before increasing percentage
    const metricsOk = await checkMetrics();
  
    if (!metricsOk) {
      // Roll back if metrics are not ok
      await updateCanaryPercentage(0);
      console.error('Metrics check failed. Rolled back to 0%.');
      clearInterval(interval);
      process.exit(1);
    }
  
    // Increase percentage if all checks pass
    currentPercentage += STEP_SIZE;
  
    if (currentPercentage > MAX_PERCENTAGE) {
      currentPercentage = MAX_PERCENTAGE;
      console.log('Reached 100% canary traffic. Deployment complete!');
      clearInterval(interval);
      process.exit(0);
    }
  
    // Update the percentage
    success = await updateCanaryPercentage(currentPercentage);
  
    if (!success) {
      console.error(`Failed to update canary percentage to ${currentPercentage}%. Stopping progression.`);
      clearInterval(interval);
      process.exit(1);
    }
  }, STEP_INTERVAL_MINUTES * 60 * 1000);
}

// Run the deployment
runProgressiveDeployment();
```

This script:

1. Starts with a small percentage of traffic (5%)
2. Checks metrics every 15 minutes
3. If metrics look good, increases traffic by 10%
4. Continues until it reaches 100%
5. If any issues are detected, rolls back to 0%

## Best Practices for Canary Releases in NodeJS

> Successful canary releases require careful planning, robust implementation, and thorough monitoring. These best practices will help you avoid common pitfalls.

### 1. Ensure Session Affinity

Users should consistently get routed to the same version of your application to avoid confusing experiences.

```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cookieParser());

// Version assignment with session affinity
app.use((req, res, next) => {
  // Check for existing version cookie
  if (req.cookies.appVersion) {
    req.appVersion = req.cookies.appVersion;
    return next();
  }
  
  // Assign version based on canary percentage
  const CANARY_PERCENTAGE = 10;
  const randomValue = Math.floor(Math.random() * 100);
  req.appVersion = randomValue < CANARY_PERCENTAGE ? 'canary' : 'stable';
  
  // Set cookie for future requests
  res.cookie('appVersion', req.appVersion, {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  });
  
  next();
});
```

### 2. Use Fine-Grained Feature Flags

Rather than having a single "canary" flag, use specific flags for each feature to enable more targeted rollouts.

```javascript
const unleash = require('unleash-client');

// Initialize with multiple feature flags
unleash.initialize({
  url: 'https://unleash.mycompany.com/api',
  appName: 'my-node-app',
  instanceId: 'instance-1',
  features: [
    {
      name: 'new-payment-processor',
      enabled: true,
      strategies: [{
        name: 'gradualRolloutRandom',
        parameters: {
          percentage: '5'
        }
      }]
    },
    {
      name: 'redesigned-checkout',
      enabled: true,
      strategies: [{
        name: 'gradualRolloutUserId',
        parameters: {
          percentage: '10',
          groupId: 'checkout-redesign'
        }
      }]
    }
  ]
});

// Usage in routes
app.post('/api/checkout', (req, res) => {
  const useNewCheckout = unleash.isEnabled('redesigned-checkout', {
    userId: req.user.id
  });
  
  const useNewPaymentProcessor = unleash.isEnabled('new-payment-processor');
  
  // Route to appropriate implementation based on enabled features
  if (useNewCheckout && useNewPaymentProcessor) {
    return handleCheckoutNewEverything(req, res);
  } else if (useNewCheckout) {
    return handleCheckoutNewUILegacyPayment(req, res);
  } else if (useNewPaymentProcessor) {
    return handleCheckoutLegacyUINewPayment(req, res);
  } else {
    return handleCheckoutLegacy(req, res);
  }
});
```

### 3. Implement Detailed Monitoring

Collect comprehensive metrics to detect issues early.

```javascript
const express = require('express');
const app = express();
const { createLogger, format, transports } = require('winston');
const { Histogram, Counter, register } = require('prom-client');
const responseTime = require('response-time');

// Create a Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  defaultMeta: { service: 'my-app' },
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' })
  ]
});

// Create Prometheus metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code', 'version'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'code', 'version']
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);

// Middleware to assign version (simplified)
app.use((req, res, next) => {
  req.version = Math.random() < 0.1 ? 'canary' : 'stable';
  next();
});

// Response time middleware with metrics
app.use(responseTime((req, res, time) => {
  const route = req.route ? req.route.path : req.path;
  const version = req.version;
  const statusCode = res.statusCode.toString();
  const labels = { method: req.method, route, code: statusCode, version };
  
  // Record metrics
  httpRequestDuration.observe(labels, time / 1000); // Convert to seconds
  httpRequestTotal.inc(labels);
  
  // Log request details
  logger.info('Request processed', {
    method: req.method,
    path: req.path,
    statusCode,
    responseTime: time,
    version,
    userId: req.user ? req.user.id : 'anonymous'
  });
}));

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Example route
app.get('/api/products', (req, res) => {
  // Implementation based on version
  if (req.version === 'canary') {
    // Log business metrics specific to this endpoint
    logger.info('Products retrieved', {
      version: 'canary',
      count: 10,
      cacheHit: false,
      queryTime: 45
    });
  
    res.json({ products: getProductsNewImplementation() });
  } else {
    logger.info('Products retrieved', {
      version: 'stable',
      count: 8,
      cacheHit: true,
      queryTime: 15
    });
  
    res.json({ products: getProductsStableImplementation() });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 4. Implement Safe Rollbacks

Ensure your application can safely roll back if issues are detected.

```javascript
const express = require('express');
const app = express();
const { EventEmitter } = require('events');

// Global canary configuration
const config = {
  enableCanary: true,
  canaryPercentage: 10
};

// Event emitter for signaling rollbacks
const rollbackEmitter = new EventEmitter();

// Listen for rollback events
rollbackEmitter.on('rollback', (reason) => {
  console.log(`Rolling back canary due to: ${reason}`);
  config.enableCanary = false;
  config.canaryPercentage = 0;
  
  // Notify monitoring systems
  notifyRollback(reason);
});

// Middleware to route requests based on canary config
app.use((req, res, next) => {
  if (!config.enableCanary) {
    req.version = 'stable';
    return next();
  }
  
  const randomValue = Math.floor(Math.random() * 100);
  req.version = randomValue < config.canaryPercentage ? 'canary' : 'stable';
  next();
});

// Error tracking middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const version = req.version;
  
  // Count of errors by version
  const errorCounts = { stable: 0, canary: 0 };
  const requestCounts = { stable: 0, canary: 0 };
  
  // Increment request count
  requestCounts[version]++;
  
  // Capture unhandled errors
  const originalSend = res.send;
  res.send = function() {
    // Check for error responses
    if (res.statusCode >= 500) {
      errorCounts[version]++;
    
      // Calculate error rates
      const stableErrorRate = errorCounts.stable / Math.max(requestCounts.stable, 1);
      const canaryErrorRate = errorCounts.canary / Math.max(requestCounts.canary, 1);
    
      // Trigger rollback if canary error rate exceeds stable by more than 5%
      if (canaryErrorRate > stableErrorRate + 0.05 && requestCounts.canary > 100) {
        rollbackEmitter.emit('rollback', `High error rate in canary: ${canaryErrorRate.toFixed(2)} vs ${stableErrorRate.toFixed(2)}`);
      }
    }
  
    return originalSend.apply(this, arguments);
  };
  
  next();
});

// Health check endpoint that includes canary status
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    canary: {
      enabled: config.enableCanary,
      percentage: config.canaryPercentage
    }
  });
});

// Admin endpoint to manually trigger rollback
app.post('/admin/rollback', authenticateAdmin, (req, res) => {
  rollbackEmitter.emit('rollback', req.body.reason || 'Manual rollback');
  res.json({ success: true, message: 'Rollback initiated' });
});

function authenticateAdmin(req, res, next) {
  // Authentication logic for admin endpoints
  if (req.headers['admin-key'] === process.env.ADMIN_KEY) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

function notifyRollback(reason) {
  // Implementation to notify team (e.g., send Slack message, trigger PagerDuty)
  console.log(`[ALERT] Canary rollback: ${reason}`);
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Conclusion

> Canary releases are a powerful risk management strategy that allow you to safely deploy new versions of your NodeJS applications. By starting with a small percentage of traffic and gradually increasing it while monitoring for issues, you can catch problems early and minimize their impact.

We've explored several implementation approaches:

1. **Infrastructure-level** canary releases using Kubernetes or load balancers
2. **Application-level** canary releases with routing logic in your NodeJS code
3. **Feature flag-based** canary releases for fine-grained control

Each approach has its strengths, and you might even combine them depending on your application's needs.

Remember these key principles:

1. **Start small** - Begin with a small percentage of traffic (5-10%)
2. **Monitor closely** - Collect detailed metrics for both versions
3. **Ensure consistency** - Use session affinity to provide a consistent user experience
4. **Prepare for rollbacks** - Have a robust rollback strategy in place
5. **Automate where possible** - Automating progressive rollouts and rollbacks reduces risk

By implementing canary releases in your NodeJS applications, you can deliver new features and improvements with confidence, knowing that you're minimizing the risk of widespread outages or issues.
