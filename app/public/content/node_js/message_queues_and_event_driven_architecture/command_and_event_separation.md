
## What are Commands and Events?

Let's start with the most basic understanding:

> **A Command** is like giving an instruction to someone. It's a request to perform an action.
>
> **An Event** is like telling others that something has already happened.

Think of it this way:

* **Command** : "Please make me a coffee" (You're asking someone to do something)
* **Event** : "The coffee has been made" (You're announcing that something is complete)

### The Fundamental Difference

Let me illustrate with a simple code example:

```javascript
// This is a COMMAND - it tells someone what to do
const createUserCommand = {
  type: 'CREATE_USER',
  data: {
    name: 'John',
    email: 'john@example.com'
  }
};

// This is an EVENT - it announces what happened
const userCreatedEvent = {
  type: 'USER_CREATED',
  timestamp: '2025-05-11T10:30:00Z',
  data: {
    userId: 123,
    name: 'John',
    email: 'john@example.com'
  }
};
```

Notice how the command uses present tense ("CREATE") while the event uses past tense ("CREATED"). Commands are intentions; events are facts.

## What is a Message Queue?

Before we dive deeper, let's understand what a message queue is:

> **A Message Queue** is like a post office system where messages (letters) are stored and delivered between different parts of a system.

Here's a simple visualization:

```
Application A    Message Queue    Application B
    |               |                |
    |--- Message -->|                |
    |               |--- Message --->|
    |               |                |
```

The queue acts as an intermediary, storing messages temporarily until the recipient is ready to process them.

## What is Event-Driven Architecture?

Event-Driven Architecture is like a news broadcasting system:

> **Event-Driven Architecture** is a design pattern where different parts of a system communicate by publishing and subscribing to events, rather than directly calling each other.

Think of it like a radio station:

* The radio station broadcasts news (publishes events)
* Anyone with a radio can tune in (subscribe to events)
* The station doesn't know who's listening
* Listeners don't need to notify the station they're listening

```javascript
// Simple event publishing
function publishEvent(eventType, data) {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    data: data
  };
  
  // Send to message queue
  messageQueue.publish(event);
}

// Publishing an event
publishEvent('ORDER_PLACED', {
  orderId: 456,
  customerId: 789,
  items: ['laptop', 'mouse']
});
```

## Why Separate Commands from Events?

This is where things get interesting. Let me explain why we separate these concepts:

### 1. Different Intent, Different Handling

> **Commands** express intent and can be rejected. **Events** express facts and cannot be undone.

```javascript
// Command handler - can fail
async function handleCreateUserCommand(command) {
  // Validation - can reject
  if (!command.data.email || !command.data.name) {
    throw new Error('Invalid user data');
  }
  
  // Check if user already exists - can reject
  if (await userExists(command.data.email)) {
    throw new Error('User already exists');
  }
  
  // If all validations pass, create user
  const user = await createUser(command.data);
  
  // Publish event after successful operation
  publishEvent('USER_CREATED', user);
}
```

### 2. Single Responsibility

> Commands typically have **one** handler, while events can have **multiple** subscribers.

Here's how this looks in practice:

```javascript
// Command - one handler
messageQueue.subscribe('CREATE_ORDER', orderService.handleCreateOrder);

// Event - multiple handlers
messageQueue.subscribe('ORDER_CREATED', [
  inventoryService.updateStock,
  paymentService.processPayment,
  emailService.sendConfirmation,
  analyticsService.trackOrder
]);
```

### 3. Temporal Separation

Commands happen "now" while events describe what happened "then":

```javascript
// Command processing (synchronous in nature)
async function processCommand(command) {
  try {
    // Execute the command
    const result = await executeCommand(command);
  
    // Publish event about what happened
    publishEvent(command.type + '_COMPLETED', result);
  } catch (error) {
    // Publish event about failure
    publishEvent(command.type + '_FAILED', { 
      commandId: command.id, 
      error: error.message 
    });
  }
}
```

## How Command and Event Separation Works

Let's build a complete example step by step:

### Step 1: Define the Command

```javascript
// Order creation command
class CreateOrderCommand {
  constructor(customerId, items) {
    this.id = generateUniqueId();
    this.type = 'CREATE_ORDER';
    this.timestamp = new Date().toISOString();
    this.data = {
      customerId,
      items
    };
  }
}
```

### Step 2: Create Command Handler

```javascript
// Command handler - the only place that processes this command
class OrderCommandHandler {
  async handleCreateOrder(command) {
    try {
      // Validate command
      this.validateCommand(command);
    
      // Business logic
      const order = await this.orderRepository.create({
        id: generateOrderId(),
        customerId: command.data.customerId,
        items: command.data.items,
        status: 'pending',
        total: this.calculateTotal(command.data.items)
      });
    
      // Command successful - publish event
      this.publishEvent('ORDER_CREATED', {
        orderId: order.id,
        customerId: order.customerId,
        items: order.items,
        total: order.total,
        createdAt: order.createdAt
      });
    
      return order;
    } catch (error) {
      // Command failed - publish failure event
      this.publishEvent('ORDER_CREATION_FAILED', {
        commandId: command.id,
        error: error.message,
        customerId: command.data.customerId
      });
      throw error;
    }
  }
  
  publishEvent(eventType, data) {
    const event = {
      id: generateUniqueId(),
      type: eventType,
      timestamp: new Date().toISOString(),
      data: data
    };
  
    messageQueue.publish('events', event);
  }
}
```

### Step 3: Create Event Handlers

```javascript
// Multiple event handlers can react to the same event
class InventoryEventHandler {
  async handleOrderCreated(event) {
    const { items } = event.data;
  
    // Reserve inventory for each item
    for (const item of items) {
      await this.inventoryService.reserve(item.productId, item.quantity);
    }
  
    // Publish another event
    this.publishEvent('INVENTORY_RESERVED', {
      orderId: event.data.orderId,
      items: items
    });
  }
}

class PaymentEventHandler {
  async handleOrderCreated(event) {
    const { orderId, customerId, total } = event.data;
  
    try {
      // Initiate payment
      const payment = await this.paymentService.createPayment({
        orderId,
        customerId,
        amount: total
      });
    
      this.publishEvent('PAYMENT_INITIATED', {
        orderId,
        paymentId: payment.id,
        amount: total
      });
    } catch (error) {
      this.publishEvent('PAYMENT_FAILED', {
        orderId,
        error: error.message
      });
    }
  }
}
```

### Step 4: Wire Everything Together

```javascript
// Command subscription
messageQueue.subscribe('commands', async (message) => {
  const commandHandler = new OrderCommandHandler();
  
  switch (message.type) {
    case 'CREATE_ORDER':
      await commandHandler.handleCreateOrder(message);
      break;
    // Other commands...
  }
});

// Event subscriptions
messageQueue.subscribe('events', async (event) => {
  const inventoryHandler = new InventoryEventHandler();
  const paymentHandler = new PaymentEventHandler();
  
  switch (event.type) {
    case 'ORDER_CREATED':
      // Multiple handlers can process the same event
      await Promise.all([
        inventoryHandler.handleOrderCreated(event),
        paymentHandler.handleOrderCreated(event)
      ]);
      break;
    // Other events...
  }
});
```

## Real-World Example: E-commerce System

Let's trace through a complete flow:

```javascript
// 1. Client sends a command
const command = new CreateOrderCommand('customer-123', [
  { productId: 'p1', quantity: 2, price: 100 },
  { productId: 'p2', quantity: 1, price: 50 }
]);

// 2. Command handler processes it
const orderHandler = new OrderCommandHandler();
const order = await orderHandler.handleCreateOrder(command);

// 3. Event published: 'ORDER_CREATED'
// 4. Multiple services react to the event:
//    - Inventory service reserves products
//    - Payment service initiates payment
//    - Email service sends confirmation
//    - Analytics service tracks the order

// 5. Each service may publish more events:
//    - 'INVENTORY_RESERVED'
//    - 'PAYMENT_INITIATED'
//    - 'EMAIL_SENT'
//    - 'ORDER_TRACKED'
```

### Visual Flow (Mobile-Optimized)

```
Client
  |
  v
[CREATE_ORDER]
Command
  |
  v
Order Service
  |
  |-- Validates
  |-- Creates Order
  |-- Publishes [ORDER_CREATED]
  |
  v
Event Bus
  |
  |-- Inventory Service
  |    |-- Reserves stock
  |    |-- Publishes [INVENTORY_RESERVED]
  |
  |-- Payment Service
  |    |-- Initiates payment
  |    |-- Publishes [PAYMENT_INITIATED]
  |
  |-- Email Service
       |-- Sends confirmation
       |-- Publishes [EMAIL_SENT]
```

## Best Practices

Here are the essential guidelines for implementing Command and Event Separation:

> **1. Commands are imperative, Events are declarative**
>
> * Commands: "CreateUser", "PlaceOrder", "UpdateProfile"
> * Events: "UserCreated", "OrderPlaced", "ProfileUpdated"

> **2. Commands can fail, Events cannot**
>
> Always validate commands before processing. Once an event is published, it represents something that has already happened.

> **3. One Command Handler, Many Event Handlers**
>
> Each command should have exactly one handler. Events can have zero or more handlers.

> **4. Events should be immutable**
>
> Once published, an event should never change. If you need to correct something, publish a new event.

```javascript
// Good: Command that can be rejected
async function handleChangeEmail(command) {
  if (!isValidEmail(command.newEmail)) {
    throw new Error('Invalid email format');
  }
  
  // Process command...
  publishEvent('EMAIL_CHANGED', { 
    userId: command.userId, 
    oldEmail: user.email, 
    newEmail: command.newEmail 
  });
}

// Good: Event that just announces what happened
function handleEmailChanged(event) {
  // React to the fact that email changed
  // Cannot reject this - it already happened
  updateUserDatabase(event.data);
  sendWelcomeEmail(event.data.newEmail);
}
```

## Common Pitfalls to Avoid

> **1. Don't make Events behave like Commands**
>
> Events should not trigger direct responses or expect acknowledgments.

```javascript
// Bad: Event expecting a response
publishEvent('PLEASE_CALCULATE_PRICE', { orderId: 123 });

// Good: Command requesting calculation
publishCommand('CALCULATE_PRICE', { orderId: 123 });
```

> **2. Don't put business logic in Event Handlers**
>
> Events are for reacting, Commands are for business decisions.

```javascript
// Bad: Business logic in event handler
function handleOrderCreated(event) {
  if (event.data.total > 1000) {
    // This is business logic - should be in command handler
    applyDiscount(event.data.orderId, 0.1);
  }
}

// Good: Business logic in command handler
async function handleCreateOrder(command) {
  const total = calculateTotal(command.data.items);
  if (total > 1000) {
    total = total * 0.9; // Apply discount
  }
  
  // Create order with discounted total
  const order = await createOrder({ ...command.data, total });
  
  // Publish event with final details
  publishEvent('ORDER_CREATED', order);
}
```

## Testing Command and Event Separation

Here's how to test this pattern effectively:

```javascript
describe('Order Command Handler', () => {
  it('should create order and publish event', async () => {
    // Arrange
    const command = new CreateOrderCommand('customer-1', [/* items */]);
    const mockEventPublisher = jest.fn();
    const handler = new OrderCommandHandler(mockEventPublisher);
  
    // Act
    const result = await handler.handleCreateOrder(command);
  
    // Assert
    expect(result.id).toBeDefined();
    expect(mockEventPublisher).toHaveBeenCalledWith('ORDER_CREATED', 
      expect.objectContaining({
        orderId: result.id,
        customerId: 'customer-1'
      })
    );
  });
  
  it('should reject invalid command', async () => {
    // Arrange
    const invalidCommand = new CreateOrderCommand(null, []); // Invalid data
    const handler = new OrderCommandHandler();
  
    // Act & Assert
    await expect(handler.handleCreateOrder(invalidCommand))
      .rejects.toThrow('Invalid command');
  });
});
```

## Summary

Command and Event Separation is a powerful pattern that:

1. **Separates Intent from Outcome** : Commands express what you want to happen; events announce what did happen
2. **Enables Loose Coupling** : Services can react to events without knowing who published them
3. **Provides Flexibility** : You can add new event handlers without modifying existing code
4. **Improves Reliability** : Commands can be retried; events create an audit trail
5. **Supports Scalability** : Different parts of the system can process commands and events independently

By understanding and implementing this separation correctly, you create systems that are more maintainable, scalable, and easier to understand. The key is to always remember the fundamental difference: commands are requests that can be rejected, while events are announcements of things that have already happened.
