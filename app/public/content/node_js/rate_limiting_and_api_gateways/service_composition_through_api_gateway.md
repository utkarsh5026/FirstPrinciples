
## What is a Service?

> A service is a self-contained unit of functionality that performs a specific business task and can communicate with other services.

Imagine you're running a pizza restaurant. A service would be like having different stations:

* Order-taking station (Order Service)
* Pizza-making station (Kitchen Service)
* Delivery coordination station (Delivery Service)
* Payment processing station (Payment Service)

Each station operates independently but must communicate with others to complete the entire pizza delivery process.

```javascript
// Example: A simple User Service
class UserService {
  constructor() {
    this.users = [];
  }
  
  // Single responsibility: Handle user operations
  createUser(userData) {
    const user = {
      id: Date.now(),
      ...userData,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }
  
  findUser(userId) {
    return this.users.find(user => user.id === userId);
  }
}
```

> This service has a single, clear purpose: managing users. It doesn't handle orders, payments, or any other business logic.

## What is an API?

> An API (Application Programming Interface) is a set of rules and protocols that allows different software applications to communicate with each other.

Think of an API as a waiter in a restaurant:

* You (the client) tell the waiter what you want
* The waiter goes to the kitchen (the service)
* The kitchen prepares your order
* The waiter brings back your food (the response)

```javascript
// Example: A simple REST API for our User Service
const express = require('express');
const app = express();
const userService = new UserService();

// API endpoint - the "menu" for clients
app.post('/users', (req, res) => {
  try {
    const user = userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/users/:id', (req, res) => {
  const user = userService.findUser(parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});
```

> This code creates HTTP endpoints that external applications can call to interact with our User Service.

## What is an API Gateway?

> An API Gateway is a single entry point that sits between clients and multiple backend services, routing requests and handling cross-cutting concerns.

Picture an API Gateway as a hotel reception desk:

* All guests (clients) enter through the main lobby
* The receptionist directs you to the right service (room service, concierge, spa)
* The receptionist handles common tasks (check-in, security, billing)
* You don't need to know which floor each service is on

```javascript
// Example: A basic API Gateway concept
class SimpleApiGateway {
  constructor() {
    this.services = new Map();
  }
  
  // Register services with the gateway
  registerService(path, service) {
    this.services.set(path, service);
  }
  
  // Route requests to appropriate services
  async handleRequest(path, method, data) {
    // Find the matching service
    for (let [servicePath, service] of this.services) {
      if (path.startsWith(servicePath)) {
        const remainingPath = path.replace(servicePath, '');
        return await service.handleRequest(remainingPath, method, data);
      }
    }
    throw new Error('Service not found');
  }
}
```

## Service Composition

> Service Composition is the process of combining multiple services to create a complete business workflow.

Imagine ordering a pizza online:

 **Step 1** : Order Service receives your order

```
+------------------+
|   Order Created  |
|  Pizza Details   |
|  Customer Info   |
+------------------+
```

 **Step 2** : Payment Service processes payment

```
+------------------+
| Payment Service  |
|   Charge Card    |
+------------------+
```

 **Step 3** : Kitchen Service prepares pizza

```
+------------------+
| Kitchen Service  |
|   Make Pizza     |
+------------------+
```

 **Step 4** : Delivery Service assigns driver

```
+------------------+
| Delivery Service |
|  Assign Driver   |
+------------------+
```

 **Step 5** : Notification Service updates customer

```
+------------------+
|Notification Svc  |
|  Send Updates    |
+------------------+
```

Each step depends on the previous one, and all services work together to complete the order.

```javascript
// Example: Service Composition in an Order Service
class OrderCompositionService {
  constructor(paymentService, kitchenService, deliveryService, notificationService) {
    this.paymentService = paymentService;
    this.kitchenService = kitchenService;
    this.deliveryService = deliveryService;
    this.notificationService = notificationService;
  }
  
  async processOrder(orderData) {
    try {
      // Step 1: Create the order
      const order = this.createOrder(orderData);
    
      // Step 2: Process payment
      const payment = await this.paymentService.processPayment(order.total);
    
      // Step 3: Start kitchen preparation
      const kitchenOrder = await this.kitchenService.startPreparation(order);
    
      // Step 4: Assign delivery
      const delivery = await this.deliveryService.assignDriver(order);
    
      // Step 5: Notify customer
      await this.notificationService.sendOrderConfirmation(order, delivery);
    
      return {
        order,
        payment,
        kitchenOrder,
        delivery
      };
    } catch (error) {
      // If any step fails, we might need to rollback
      await this.handleFailure(error, order);
      throw error;
    }
  }
}
```

> Notice how this service orchestrates multiple other services. It doesn't know the internal details of each service but coordinates their interactions.

## API Gateway with Service Composition

Now let's combine these concepts. An API Gateway can handle service composition by:

1. Receiving client requests
2. Determining which services are needed
3. Calling multiple services in the right order
4. Combining responses
5. Returning a single response to the client

```javascript
// Example: API Gateway with Service Composition
const express = require('express');
const axios = require('axios');

class ComposingApiGateway {
  constructor() {
    this.app = express();
    this.services = {
      users: 'http://user-service:3001',
      orders: 'http://order-service:3002',
      payments: 'http://payment-service:3003',
      inventory: 'http://inventory-service:3004'
    };
  }
  
  // Endpoint that composes multiple services
  async createOrderWithInventoryCheck(req, res) {
    try {
      const { userId, items } = req.body;
    
      // Step 1: Get user information
      const userResponse = await axios.get(`${this.services.users}/users/${userId}`);
      const user = userResponse.data;
    
      // Step 2: Check inventory for all items
      const inventoryPromises = items.map(item => 
        axios.get(`${this.services.inventory}/check/${item.productId}`)
      );
      const inventoryResults = await Promise.all(inventoryPromises);
    
      // Step 3: Validate inventory
      const allItemsAvailable = inventoryResults.every(result => 
        result.data.available >= result.data.requested
      );
    
      if (!allItemsAvailable) {
        return res.status(400).json({ error: 'Some items are out of stock' });
      }
    
      // Step 4: Create the order
      const orderResponse = await axios.post(`${this.services.orders}/orders`, {
        userId,
        items,
        userEmail: user.email
      });
    
      // Step 5: Process payment
      const paymentResponse = await axios.post(`${this.services.payments}/process`, {
        orderId: orderResponse.data.id,
        amount: orderResponse.data.total,
        paymentMethod: user.defaultPaymentMethod
      });
    
      // Step 6: Update inventory
      await Promise.all(items.map(item =>
        axios.post(`${this.services.inventory}/reserve`, {
          productId: item.productId,
          quantity: item.quantity,
          orderId: orderResponse.data.id
        })
      ));
    
      // Return composed response
      res.json({
        order: orderResponse.data,
        payment: paymentResponse.data,
        message: 'Order created successfully'
      });
    } catch (error) {
      console.error('Composition error:', error);
      res.status(500).json({ error: 'Failed to process order' });
    }
  }
}
```

> This gateway method demonstrates sophisticated service composition, combining user data, inventory checks, order creation, and payment processing into a single endpoint.

## Implementing a Production-Ready API Gateway

Let's build a more robust API Gateway that handles various aspects of service composition:

```javascript
// Example: Production-ready API Gateway with middleware
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

class ProductionApiGateway {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.services = {
      auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
      users: process.env.USER_SERVICE_URL || 'http://user-service:3002',
      products: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3003',
      orders: process.env.ORDER_SERVICE_URL || 'http://order-service:3004',
      payments: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005'
    };
  }
  
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
  
    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    });
    this.app.use(limiter);
  
    // JSON parsing
    this.app.use(express.json());
  
    // Authentication middleware
    this.app.use(async (req, res, next) => {
      try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
          const authResponse = await axios.post(`${this.services.auth}/verify`, { token });
          req.user = authResponse.data.user;
        }
        next();
      } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
      }
    });
  }
  
  setupRoutes() {
    // Simple proxy routes
    this.app.use('/api/users', this.createProxy('users'));
    this.app.use('/api/products', this.createProxy('products'));
  
    // Composed routes
    this.app.post('/api/checkout', this.handleCheckout.bind(this));
    this.app.get('/api/dashboard', this.handleDashboard.bind(this));
  }
  
  createProxy(serviceName) {
    return async (req, res) => {
      try {
        const response = await axios({
          method: req.method,
          url: `${this.services[serviceName]}${req.path}`,
          data: req.body,
          headers: {
            'Authorization': req.headers.authorization,
            'Content-Type': 'application/json'
          }
        });
        res.status(response.status).json(response.data);
      } catch (error) {
        res.status(error.response?.status || 500).json({
          error: error.response?.data || 'Service error'
        });
      }
    };
  }
  
  async handleCheckout(req, res) {
    try {
      // This is a complex composition involving multiple services
      const { cart, shippingAddress, paymentInfo } = req.body;
      const userId = req.user.id;
    
      // Step 1: Validate cart items and get current prices
      const validatedCart = await this.validateCart(cart);
    
      // Step 2: Calculate total with taxes and shipping
      const orderSummary = await this.calculateOrderTotal(validatedCart, shippingAddress);
    
      // Step 3: Create order in pending state
      const order = await this.createPendingOrder(userId, validatedCart, orderSummary);
    
      // Step 4: Process payment
      const payment = await this.processPayment(order.id, orderSummary.total, paymentInfo);
    
      // Step 5: Confirm order
      await this.confirmOrder(order.id, payment.id);
    
      // Step 6: Reduce inventory
      await this.updateInventory(validatedCart);
    
      // Step 7: Prepare shipping
      const shipping = await this.prepareShipping(order.id, shippingAddress);
    
      // Return complete checkout result
      res.json({
        orderId: order.id,
        payment: payment,
        shipping: shipping,
        total: orderSummary.total,
        estimatedDelivery: shipping.estimatedDelivery
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ error: 'Checkout failed' });
    }
  }
  
  async validateCart(cart) {
    // Call product service to validate each item
    const validationPromises = cart.map(async item => {
      const response = await axios.get(`${this.services.products}/${item.productId}`);
      if (!response.data.available) {
        throw new Error(`Product ${item.productId} is not available`);
      }
      return {
        ...item,
        currentPrice: response.data.price,
        inStock: response.data.quantity >= item.quantity
      };
    });
  
    return await Promise.all(validationPromises);
  }
  
  async calculateOrderTotal(cart, shippingAddress) {
    // This might call a pricing service to calculate taxes, shipping, etc.
    const subtotal = cart.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = shippingAddress.express ? 15.99 : 5.99;
  
    return {
      subtotal,
      tax,
      shipping,
      total: subtotal + tax + shipping
    };
  }
  
  async createPendingOrder(userId, cart, orderSummary) {
    const response = await axios.post(`${this.services.orders}/orders`, {
      userId,
      items: cart,
      summary: orderSummary,
      status: 'pending'
    });
    return response.data;
  }
  
  async processPayment(orderId, amount, paymentInfo) {
    const response = await axios.post(`${this.services.payments}/process`, {
      orderId,
      amount,
      paymentMethod: paymentInfo
    });
    return response.data;
  }
  
  async confirmOrder(orderId, paymentId) {
    await axios.patch(`${this.services.orders}/orders/${orderId}`, {
      status: 'confirmed',
      paymentId
    });
  }
  
  async updateInventory(cart) {
    // Reduce inventory for each item
    await Promise.all(cart.map(item =>
      axios.post(`${this.services.products}/inventory/reduce`, {
        productId: item.productId,
        quantity: item.quantity
      })
    ));
  }
  
  async prepareShipping(orderId, shippingAddress) {
    // This might integrate with a shipping service
    return {
      trackingNumber: `TRACK${orderId}${Date.now()}`,
      carrier: 'FastShip',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }
}

// Start the gateway
const gateway = new ProductionApiGateway();
const PORT = process.env.PORT || 3000;
gateway.app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
```

> This production-ready example shows how an API Gateway can handle complex service compositions while managing cross-cutting concerns like authentication, rate limiting, and error handling.

## Error Handling and Resilience Patterns

Real-world service composition requires robust error handling:

```javascript
// Example: Circuit Breaker pattern for resilient service composition
class CircuitBreaker {
  constructor(failureThreshold = 5, resetTimeout = 60000) {
    this.failureCount = 0;
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async call(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is open');
      }
      this.state = 'HALF_OPEN';
    }
  
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}

// Example: Using Circuit Breaker in service composition
class ResilientServiceComposer {
  constructor() {
    this.circuitBreakers = new Map();
  }
  
  getCircuitBreaker(serviceName) {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker());
    }
    return this.circuitBreakers.get(serviceName);
  }
  
  async callService(serviceName, serviceCall) {
    const circuitBreaker = this.getCircuitBreaker(serviceName);
  
    try {
      return await circuitBreaker.call(serviceCall);
    } catch (error) {
      // Implement fallback logic here
      console.error(`Service ${serviceName} failed:`, error);
      throw error;
    }
  }
  
  async composeWithResilience() {
    const results = {};
  
    try {
      // Call services with circuit breakers
      results.user = await this.callService('users', () => 
        axios.get('/api/users/current')
      );
    
      results.orders = await this.callService('orders', () => 
        axios.get('/api/orders/recent')
      );
    
      // If one service fails, we can provide partial results
      try {
        results.recommendations = await this.callService('recommendations', () => 
          axios.get('/api/recommendations')
        );
      } catch (error) {
        // Fallback to default recommendations
        results.recommendations = { items: [] };
      }
    
      return results;
    } catch (error) {
      // Handle critical service failures
      throw new Error('Failed to compose essential services');
    }
  }
}
```

> Circuit breakers prevent cascading failures by temporarily blocking calls to failing services, giving them time to recover.

## Monitoring and Observability

> Effective service composition requires good monitoring to understand service interactions and identify bottlenecks.

```javascript
// Example: Adding monitoring to our API Gateway
const prometheus = require('prom-client');

class MonitoredApiGateway {
  constructor() {
    this.app = express();
    this.setupMetrics();
    this.setupMiddleware();
  }
  
  setupMetrics() {
    // Counter for total requests
    this.requestCounter = new prometheus.Counter({
      name: 'api_gateway_requests_total',
      help: 'Total number of requests',
      labelNames: ['method', 'path', 'status']
    });
  
    // Histogram for request durations
    this.requestDuration = new prometheus.Histogram({
      name: 'api_gateway_request_duration_seconds',
      help: 'Request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });
  
    // Gauge for active requests
    this.activeRequests = new prometheus.Gauge({
      name: 'api_gateway_active_requests',
      help: 'Number of active requests'
    });
  }
  
  setupMiddleware() {
    // Monitoring middleware
    this.app.use((req, res, next) => {
      const start = Date.now();
      this.activeRequests.inc();
    
      const originalSend = res.send;
      res.send = function(...args) {
        const duration = (Date.now() - start) / 1000;
      
        this.requestCounter.inc({
          method: req.method,
          path: req.path,
          status: res.statusCode
        });
      
        this.requestDuration.observe(
          { method: req.method, path: req.path },
          duration
        );
      
        this.activeRequests.dec();
      
        return originalSend.apply(res, args);
      }.bind(this);
    
      next();
    });
  
    // Expose metrics endpoint
    this.app.get('/metrics', async (req, res) => {
      res.set('Content-Type', prometheus.register.contentType);
      res.end(await prometheus.register.metrics());
    });
  }
}
```

## Summary

> Service composition through API Gateway in Node.js enables building complex distributed systems by orchestrating multiple independent services through a single entry point.

The key concepts we've covered:

1. **Services** : Independent units of business logic
2. **APIs** : Interfaces for service communication
3. **API Gateway** : Central entry point for client requests
4. **Service Composition** : Combining multiple services to fulfill complex business requirements
5. **Resilience** : Handling failures gracefully
6. **Monitoring** : Observing system behavior

The architecture looks like this:

```
+------------------+
|     Clients      |
|  (Web, Mobile)   |
+------------------+
          |
          v
+------------------+
|   API Gateway    |
|  - Routing       |
|  - Auth          |
|  - Composition   |
|  - Monitoring    |
+------------------+
          |
    +-----+-----+
    |     |     |
    v     v     v
+-------+-------+-------+
| User  |Order  |Payment|
|Service|Service|Service|
+-------+-------+-------+
```

By implementing service composition through an API Gateway, you create a flexible, scalable architecture that simplifies client interactions while maintaining the benefits of microservices architecture. The gateway handles the complexity of service coordination, allowing each service to focus on its specific business domain.
