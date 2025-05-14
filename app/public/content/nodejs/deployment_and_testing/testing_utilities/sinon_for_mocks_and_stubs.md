
## Starting from First Principles: What is Testing?

Before we dive into Sinon, let's understand why we need testing at all. Imagine you're building a house - you wouldn't just build it and assume everything works perfectly. You'd test the electrical system, check if the plumbing works, verify the structure is sound.

Software is similar. We write code that does things, but we need to verify it works correctly. This is where testing comes in.

```javascript
// A simple function that adds two numbers
function add(a, b) {
    return a + b;
}

// We can manually test it like this:
console.log(add(2, 3)); // Should be 5
```

But manual testing becomes impossible as our code grows. We need automated tests.

## What are Mocks and Stubs?

Let's say you're writing a function that saves user data to a database. Testing this becomes tricky because:

1. You need a database running
2. You might accidentally modify real data
3. Database operations are slow
4. Network calls might fail

> **Key Insight** : Mocks and stubs let us "fake" dependencies so we can test our code in isolation.

Think of it like testing a car's steering wheel. You don't need the entire car running - you can simulate the connection to the wheels and test just the steering mechanism.

### Stubs vs Mocks: The Fundamental Difference

Let me explain with a real-world analogy:

 **Stub** : Like a mannequin in a store. It's there to hold the clothes, but it doesn't react or do anything. You can put different clothes on it, but it just stands there.

 **Mock** : Like an actor in a play. Not only does it play the role, but it also expects certain things to happen and can verify if the scene played out correctly.

## Introducing Sinon

Sinon is a JavaScript library that provides:

* **Spies** : Watch and record how functions are called
* **Stubs** : Replace functions with controlled behavior
* **Mocks** : Create objects with expectations that can verify behavior

Let's start with the basics.

## Spies: Watching Function Calls

Spies are like security cameras - they watch what happens without interfering.

```javascript
const sinon = require('sinon');

// Let's create a simple object with a method
const userService = {
    logActivity: function(action, user) {
        console.log(`User ${user} performed ${action}`);
    }
};

// Create a spy on the logActivity method
const logSpy = sinon.spy(userService, 'logActivity');

// Now use the method normally
userService.logActivity('login', 'john@example.com');
userService.logActivity('logout', 'john@example.com');

// The spy has been watching! Let's see what it recorded
console.log(logSpy.callCount); // 2
console.log(logSpy.firstCall.args); // ['login', 'john@example.com']
console.log(logSpy.secondCall.args); // ['logout', 'john@example.com']

// Don't forget to restore the original function
logSpy.restore();
```

### Why Spies Matter

Spies let us answer questions like:

* Was this function called?
* How many times?
* With what arguments?
* In what order?

These are crucial for testing code that has side effects or interacts with other components.

## Stubs: Controlling Function Behavior

Stubs go beyond watching - they replace the function entirely with controlled behavior.

```javascript
const sinon = require('sinon');

// Let's simulate a database module
const database = {
    save: function(data) {
        // This would normally make a database call
        throw new Error('Not implemented');
    }
};

// Create a function that uses the database
function saveUser(userData) {
    try {
        const result = database.save(userData);
        return { success: true, id: result.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Now let's test this without touching a real database
describe('saveUser function', () => {
    let saveStub;
  
    beforeEach(() => {
        // Replace database.save with a stub
        saveStub = sinon.stub(database, 'save');
    });
  
    afterEach(() => {
        // Always restore the original function
        saveStub.restore();
    });
  
    it('returns success when database save succeeds', () => {
        // Configure the stub to return a specific value
        saveStub.returns({ id: 123 });
      
        const result = saveUser({ name: 'John', email: 'john@example.com' });
      
        // Verify the behavior
        assert.equal(result.success, true);
        assert.equal(result.id, 123);
      
        // Verify the stub was called correctly
        assert(saveStub.calledOnce);
        assert(saveStub.calledWith({ name: 'John', email: 'john@example.com' }));
    });
  
    it('handles database errors gracefully', () => {
        // Configure the stub to throw an error
        saveStub.throws(new Error('Database connection failed'));
      
        const result = saveUser({ name: 'John', email: 'john@example.com' });
      
        // Verify error handling
        assert.equal(result.success, false);
        assert.equal(result.error, 'Database connection failed');
    });
});
```

### Advanced Stub Techniques

Stubs can simulate complex behaviors:

```javascript
// Return different values on different calls
const stub = sinon.stub();
stub.onFirstCall().returns('first');
stub.onSecondCall().returns('second');
stub.returns('default');

// Conditional responses based on arguments
const userStub = sinon.stub();
userStub.withArgs('admin').returns({ role: 'admin' });
userStub.withArgs('user').returns({ role: 'user' });
userStub.throws(new Error('User not found'));

// Asynchronous operations
const asyncStub = sinon.stub();
asyncStub.resolves({ data: 'success' }); // For promises
asyncStub.rejects(new Error('Failed')); // For promise rejections

// Use it in async code
async function fetchData() {
    try {
        const result = await someService.getData();
        return result;
    } catch (error) {
        return null;
    }
}
```

## Mocks: Expectations and Verification

Mocks combine the power of stubs with built-in assertions. They're like directors on a movie set - they expect specific things to happen and verify that the scene played out correctly.

```javascript
// Let's create a notification service
const notificationService = {
    sendEmail: function(to, subject, body) {
        // This would normally send an actual email
    },
    logNotification: function(type, recipient) {
        // This would log the notification
    }
};

// Now let's create a function that uses this service
function processOrder(order) {
    // Send confirmation email
    notificationService.sendEmail(
        order.customerEmail,
        'Order Confirmation',
        `Your order #${order.id} has been confirmed`
    );
  
    // Log the notification
    notificationService.logNotification('email', order.customerEmail);
}

// Test using mocks
describe('processOrder function', () => {
    let notificationMock;
  
    beforeEach(() => {
        // Create a mock of the notification service
        notificationMock = sinon.mock(notificationService);
    });
  
    afterEach(() => {
        // Verify expectations and restore
        notificationMock.verify();
        notificationMock.restore();
    });
  
    it('sends confirmation email and logs notification', () => {
        const order = {
            id: 'ORD-123',
            customerEmail: 'customer@example.com'
        };
      
        // Set expectations
        notificationMock.expects('sendEmail')
            .once()
            .withArgs(
                'customer@example.com',
                'Order Confirmation',
                'Your order #ORD-123 has been confirmed'
            );
          
        notificationMock.expects('logNotification')
            .once()
            .withArgs('email', 'customer@example.com');
      
        // Execute the function
        processOrder(order);
      
        // The verify() in afterEach will check if expectations were met
    });
});
```

### Complex Mock Scenarios

```javascript
// Testing a payment processing system
const paymentGateway = {
    processPayment: function(amount, card) {},
    logTransaction: function(transactionId, status) {},
    sendReceipt: function(email, details) {}
};

function makePayment(amount, card, customerEmail) {
    try {
        const result = paymentGateway.processPayment(amount, card);
      
        if (result.success) {
            paymentGateway.logTransaction(result.transactionId, 'completed');
            paymentGateway.sendReceipt(customerEmail, result);
            return { success: true, transactionId: result.transactionId };
        } else {
            paymentGateway.logTransaction(result.transactionId, 'failed');
            return { success: false, error: result.error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Test with complex expectations
describe('makePayment function', () => {
    let gatewayMock;
  
    beforeEach(() => {
        gatewayMock = sinon.mock(paymentGateway);
    });
  
    afterEach(() => {
        gatewayMock.verify();
        gatewayMock.restore();
    });
  
    it('handles successful payment flow', () => {
        const mockResult = {
            success: true,
            transactionId: 'TXN-789',
            amount: 100
        };
      
        // Expect payment processing
        gatewayMock.expects('processPayment')
            .once()
            .withArgs(100, { number: '1234' })
            .returns(mockResult);
      
        // Expect successful logging
        gatewayMock.expects('logTransaction')
            .once()
            .withArgs('TXN-789', 'completed');
      
        // Expect receipt sending
        gatewayMock.expects('sendReceipt')
            .once()
            .withArgs('customer@example.com', mockResult);
      
        // Execute
        const result = makePayment(100, { number: '1234' }, 'customer@example.com');
      
        // Additional assertions
        assert.equal(result.success, true);
        assert.equal(result.transactionId, 'TXN-789');
    });
});
```

## Practical Patterns and Best Practices

### 1. Testing HTTP Requests

```javascript
const axios = require('axios');
const sinon = require('sinon');

// Function that fetches user data
async function getUserProfile(userId) {
    try {
        const response = await axios.get(`/api/users/${userId}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
}

// Test without making actual HTTP calls
describe('getUserProfile', () => {
    let axiosStub;
  
    beforeEach(() => {
        axiosStub = sinon.stub(axios, 'get');
    });
  
    afterEach(() => {
        axiosStub.restore();
    });
  
    it('returns user data when user exists', async () => {
        const mockUserData = { id: 1, name: 'John', email: 'john@example.com' };
        axiosStub.resolves({ data: mockUserData });
      
        const result = await getUserProfile(1);
      
        assert.deepEqual(result, mockUserData);
        assert(axiosStub.calledWith('/api/users/1'));
    });
  
    it('returns null when user not found', async () => {
        axiosStub.rejects({ response: { status: 404 } });
      
        const result = await getUserProfile(999);
      
        assert.equal(result, null);
    });
});
```

### 2. Testing Timers and Timing

```javascript
// Function that implements retry logic
function retryOperation(operation, maxAttempts = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
      
        function attempt() {
            attempts++;
          
            operation()
                .then(resolve)
                .catch(error => {
                    if (attempts >= maxAttempts) {
                        reject(error);
                    } else {
                        setTimeout(attempt, delay);
                    }
                });
        }
      
        attempt();
    });
}

// Test with fake timers
describe('retryOperation', () => {
    let clock;
  
    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });
  
    afterEach(() => {
        clock.restore();
    });
  
    it('retries on failure and eventually succeeds', async () => {
        let callCount = 0;
        const operation = sinon.stub();
      
        operation.callsFake(() => {
            callCount++;
            if (callCount < 3) {
                return Promise.reject(new Error('Temporary failure'));
            }
            return Promise.resolve('Success');
        });
      
        const retryPromise = retryOperation(operation, 3, 1000);
      
        // Fast-forward through the retries
        await clock.tickAsync(2000);
      
        const result = await retryPromise;
      
        assert.equal(result, 'Success');
        assert.equal(operation.callCount, 3);
    });
});
```

### 3. Testing Event Emitters

```javascript
const EventEmitter = require('events');

class OrderProcessor extends EventEmitter {
    processOrder(order) {
        this.emit('orderStarted', order);
      
        // Simulate processing
        setTimeout(() => {
            if (order.amount > 0) {
                this.emit('orderCompleted', { ...order, status: 'completed' });
            } else {
                this.emit('orderFailed', { ...order, error: 'Invalid amount' });
            }
        }, 100);
    }
}

// Test event emissions
describe('OrderProcessor', () => {
    let processor;
    let clock;
  
    beforeEach(() => {
        processor = new OrderProcessor();
        clock = sinon.useFakeTimers();
    });
  
    afterEach(() => {
        clock.restore();
    });
  
    it('emits events in correct order for valid order', async () => {
        const startedSpy = sinon.spy();
        const completedSpy = sinon.spy();
      
        processor.on('orderStarted', startedSpy);
        processor.on('orderCompleted', completedSpy);
      
        const order = { id: 1, amount: 100 };
        processor.processOrder(order);
      
        // Check immediate event
        assert(startedSpy.calledOnce);
        assert(startedSpy.calledWith(order));
      
        // Fast-forward to complete processing
        await clock.runAllAsync();
      
        // Check delayed event
        assert(completedSpy.calledOnce);
        assert(completedSpy.firstCall.args[0].status === 'completed');
    });
});
```

## Common Pitfalls and How to Avoid Them

### 1. Forgetting to Restore

> **Critical Pattern** : Always restore your stubs, spies, and mocks!

```javascript
// Bad - no restoration
describe('myTest', () => {
    it('does something', () => {
        const stub = sinon.stub(someObject, 'method');
        // ... test logic
        // stub.restore() is missing!
    });
});

// Good - using beforeEach/afterEach pattern
describe('myTest', () => {
    let stubs = [];
  
    afterEach(() => {
        // Restore all stubs
        stubs.forEach(stub => stub.restore());
        stubs = [];
    });
  
    it('does something', () => {
        const stub = sinon.stub(someObject, 'method');
        stubs.push(stub);
        // ... test logic
    });
});

// Even better - using sinon.sandbox
describe('myTest', () => {
    let sandbox;
  
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
  
    afterEach(() => {
        sandbox.restore();
    });
  
    it('does something', () => {
        const stub = sandbox.stub(someObject, 'method');
        // ... test logic
    });
});
```

### 2. Over-mocking

Don't mock everything. Mock only what you need to control or verify.

```javascript
// Bad - mocking too much
describe('calculateTotal', () => {
    it('calculates order total', () => {
        const orderMock = sinon.mock(order);
        const itemMock = sinon.mock(item);
        const discountMock = sinon.mock(discount);
        const taxMock = sinon.mock(tax);
      
        // ... too many mocks!
    });
});

// Good - mock only external dependencies
describe('calculateTotal', () => {
    it('calculates order total', () => {
        // Only mock the external pricing service
        const pricingStub = sinon.stub(pricingService, 'getPrice');
        pricingStub.returns(100);
      
        const total = calculateTotal(order);
        // ... simple test
    });
});
```

### 3. Testing Implementation Instead of Behavior

Focus on what the function does, not how it does it.

```javascript
// Bad - testing internal implementation
it('processes order', () => {
    const mock = sinon.mock(orderService);
    // These expectations are too detailed about implementation
    mock.expects('validateOrder').once();
    mock.expects('checkInventory').once();
    mock.expects('calculatePrice').once();
    mock.expects('saveOrder').once();
  
    processOrder(order);
    mock.verify();
});

// Good - testing behavior and outcomes
it('processes order successfully', () => {
    const saveStub = sinon.stub(orderService, 'saveOrder');
    saveStub.resolves({ id: 'ORDER-123' });
  
    const result = await processOrder(order);
  
    // Test the outcome
    assert.equal(result.success, true);
    assert.equal(result.orderId, 'ORDER-123');
  
    // Only verify the critical external interaction
    assert(saveStub.calledOnce);
});
```

## Advanced Sinon Techniques

### 1. Custom Matchers

```javascript
// Create custom argument matchers
const customMatcher = {
    isValidEmail: sinon.match((value) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }),
  
    hasProperty: (prop, value) => sinon.match((obj) => {
        return obj && obj[prop] === value;
    })
};

// Use in tests
const stub = sinon.stub(emailService, 'send');
stub.withArgs(customMatcher.isValidEmail, sinon.match.string)
    .returns(true);

// Test
emailService.send('user@example.com', 'Hello'); // Returns true
emailService.send('invalid-email', 'Hello'); // Returns undefined
```

### 2. Sandboxes for Better Test Isolation

```javascript
// Using sandboxes prevents test interference
describe('Order Processing', () => {
    let sandbox;
  
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
  
    afterEach(() => {
        sandbox.restore();
    });
  
    it('processes order with payment', () => {
        const paymentStub = sandbox.stub(paymentService, 'process');
        const emailStub = sandbox.stub(emailService, 'send');
      
        // ... test logic
      
        // All stubs are automatically restored
    });
});
```

### 3. Partial Mocks

```javascript
// Mock only specific methods of an object
const userService = {
    find: (id) => { /* real implementation */ },
    save: (user) => { /* real implementation */ },
    validate: (user) => { /* real implementation */ }
};

// Create partial mock
const partialMock = sinon.mock(userService);
partialMock.expects('save').once().returns(true);

// validate and find methods still work normally
userService.validate(user); // Calls real method
const found = userService.find(1); // Calls real method
userService.save(user); // Calls mocked method
```

## Real-World Example: Testing an API Client

Let's bring everything together with a complete example of testing an API client that uses various Sinon features.

```javascript
// API Client implementation
class UserApiClient {
    constructor(httpClient, cache, logger) {
        this.httpClient = httpClient;
        this.cache = cache;
        this.logger = logger;
    }
  
    async getUser(userId) {
        // Check cache first
        const cached = await this.cache.get(`user:${userId}`);
        if (cached) {
            this.logger.info(`Cache hit for user ${userId}`);
            return cached;
        }
      
        try {
            // Make API call
            this.logger.info(`Fetching user ${userId} from API`);
            const response = await this.httpClient.get(`/users/${userId}`);
          
            // Cache the result
            await this.cache.set(`user:${userId}`, response.data, { ttl: 3600 });
          
            this.logger.info(`Successfully fetched user ${userId}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Failed to fetch user ${userId}:`, error.message);
            throw error;
        }
    }
}

// Complete test suite
describe('UserApiClient', () => {
    let sandbox;
    let httpClientStub;
    let cacheStub;
    let loggerStub;
    let apiClient;
  
    beforeEach(() => {
        sandbox = sinon.createSandbox();
      
        // Create stubs for dependencies
        httpClientStub = {
            get: sandbox.stub()
        };
      
        cacheStub = {
            get: sandbox.stub(),
            set: sandbox.stub()
        };
      
        loggerStub = {
            info: sandbox.stub(),
            error: sandbox.stub()
        };
      
        // Create instance with mocked dependencies
        apiClient = new UserApiClient(httpClientStub, cacheStub, loggerStub);
    });
  
    afterEach(() => {
        sandbox.restore();
    });
  
    describe('getUser', () => {
        it('returns cached user when available', async () => {
            const userId = '123';
            const cachedUser = { id: userId, name: 'John' };
          
            // Configure cache to return user
            cacheStub.get.resolves(cachedUser);
          
            const result = await apiClient.getUser(userId);
          
            // Verify result
            assert.deepEqual(result, cachedUser);
          
            // Verify cache was checked
            assert(cacheStub.get.calledWith('user:123'));
          
            // Verify API was not called
            assert.isFalse(httpClientStub.get.called);
          
            // Verify logging
            assert(loggerStub.info.calledWith('Cache hit for user 123'));
        });
      
        it('fetches from API when not cached', async () => {
            const userId = '456';
            const apiUser = { id: userId, name: 'Jane' };
          
            // Configure cache to return null (not found)
            cacheStub.get.resolves(null);
          
            // Configure API to return user
            httpClientStub.get.resolves({ data: apiUser });
          
            const result = await apiClient.getUser(userId);
          
            // Verify result
            assert.deepEqual(result, apiUser);
          
            // Verify API was called correctly
            assert(httpClientStub.get.calledWith('/users/456'));
          
            // Verify cache was updated
            assert(cacheStub.set.calledWith('user:456', apiUser, { ttl: 3600 }));
          
            // Verify all logging calls
            assert(loggerStub.info.calledWith('Fetching user 456 from API'));
            assert(loggerStub.info.calledWith('Successfully fetched user 456'));
        });
      
        it('handles API errors gracefully', async () => {
            const userId = '789';
            const error = new Error('API Error');
          
            // Configure cache to return null
            cacheStub.get.resolves(null);
          
            // Configure API to throw error
            httpClientStub.get.rejects(error);
          
            // Verify error is thrown
            await assert.rejects(
                apiClient.getUser(userId),
                /API Error/
            );
          
            // Verify error was logged
            assert(loggerStub.error.calledWith(
                'Failed to fetch user 789:',
                'API Error'
            ));
          
            // Verify cache was not updated
            assert.isFalse(cacheStub.set.called);
        });
    });
});
```

## Conclusion

Sinon is a powerful tool for testing JavaScript applications. By providing spies, stubs, and mocks, it allows us to:

1. **Test in isolation** : Remove dependencies on external systems
2. **Control behavior** : Simulate different scenarios and edge cases
3. **Verify interactions** : Ensure our code communicates correctly with dependencies
4. **Speed up tests** : Avoid slow operations like network calls and database queries

> **Remember** : Good testing is about finding the right balance. Use mocks and stubs to isolate the code you're testing, but don't over-mock. Focus on testing behavior and outcomes, not implementation details.

The key patterns to remember:

* Always restore your stubs and mocks
* Use sandboxes for better test isolation
* Test behavior, not implementation
* Keep your tests focused and readable
* Use descriptive names and clear assertions

With these principles and Sinon's powerful features, you can create robust, reliable tests that give you confidence in your code.
