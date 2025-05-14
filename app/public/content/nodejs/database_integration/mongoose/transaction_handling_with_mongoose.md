# Transaction Handling with Mongoose in Node.js: A Complete Guide

Transaction handling is one of the most crucial aspects of database programming. Let me explain transactions from the ground up and show you how to implement them properly with Mongoose and MongoDB.

## What is a Transaction? Understanding the Fundamentals

At its core, a transaction is a  **sequence of database operations that must either ALL succeed or ALL fail** . Think of it like a bank transfer - when you send money from Account A to Account B, two things must happen:

1. Money is deducted from Account A
2. Money is added to Account B

If either step fails, the entire operation should be rolled back. You can't have money disappearing from one account without appearing in the other!

> **Key Principle** : Transactions ensure ACID properties - Atomicity (all-or-nothing), Consistency (database rules are maintained), Isolation (concurrent transactions don't interfere), and Durability (committed changes persist).

## Why Do We Need Transactions?

Consider this scenario without transactions:

```javascript
// WITHOUT TRANSACTIONS - DANGEROUS!
async function transferMoney(fromAccountId, toAccountId, amount) {
  // Step 1: Deduct from sender
  await Account.findByIdAndUpdate(fromAccountId, {
    $inc: { balance: -amount }
  });
  
  // What if server crashes here? Money is lost!
  
  // Step 2: Add to receiver
  await Account.findByIdAndUpdate(toAccountId, {
    $inc: { balance: amount }
  });
}
```

If the server crashes between these operations, the money disappears! Transactions solve this problem.

## MongoDB and Transactions: The Foundation

MongoDB supports transactions through **replica sets** or  **sharded clusters** . Here's what you need to know:

1. **Replica Set** : A group of MongoDB servers that maintain the same data
2. **Session** : A client-side abstraction for grouping operations
3. **Write Concern** : Determines acknowledgment behavior for write operations

> **Important** : Transactions are NOT supported on standalone MongoDB instances, only on replica sets or sharded clusters.

## Setting Up Mongoose for Transactions

Let's start with a proper connection setup:

```javascript
// db.js - Database connection setup
const mongoose = require('mongoose');

async function connectDB() {
  try {
    // Enable transaction support with replica set
    await mongoose.connect('mongodb://localhost:27017/myapp', {
      // Important: This ensures we're using the proper read/write concerns
      w: 'majority',
      retryWrites: true,
      authSource: 'admin'
    });
  
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
```

## Basic Transaction Pattern in Mongoose

Here's the fundamental pattern for using transactions with Mongoose:

```javascript
const mongoose = require('mongoose');

async function performTransaction() {
  // Start a session
  const session = await mongoose.startSession();
  
  try {
    // Begin transaction
    await session.startTransaction();
  
    // Perform your operations here
    // All operations must use the same session
  
    // Commit the transaction
    await session.commitTransaction();
    console.log('Transaction committed successfully');
  } catch (error) {
    // If any error occurs, rollback
    await session.abortTransaction();
    console.error('Transaction aborted:', error);
    throw error;
  } finally {
    // Always end the session
    await session.endSession();
  }
}
```

> **Critical Pattern** : Always use try-catch-finally with transactions. The session must be ended regardless of success or failure.

## Practical Example: Bank Transfer with Transactions

Let's implement a complete bank transfer using transactions:

```javascript
// models/Account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    min: 0
  },
  accountHolder: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
```

```javascript
// services/bankTransfer.js
const Account = require('../models/Account');
const mongoose = require('mongoose');

async function transferMoney(fromAccount, toAccount, amount) {
  // Validate inputs
  if (amount <= 0) {
    throw new Error('Transfer amount must be positive');
  }
  
  // Start a session
  const session = await mongoose.startSession();
  
  try {
    // Begin transaction with proper options
    await session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' }
    });
  
    // Step 1: Find the sender account and check balance
    const sender = await Account.findOne({
      accountNumber: fromAccount
    }).session(session);
  
    if (!sender) {
      throw new Error('Sender account not found');
    }
  
    if (sender.balance < amount) {
      throw new Error('Insufficient funds');
    }
  
    // Step 2: Find the receiver account
    const receiver = await Account.findOne({
      accountNumber: toAccount
    }).session(session);
  
    if (!receiver) {
      throw new Error('Receiver account not found');
    }
  
    // Step 3: Perform the transfer
    // Deduct from sender
    sender.balance -= amount;
    await sender.save({ session });
  
    // Add to receiver
    receiver.balance += amount;
    await receiver.save({ session });
  
    // Commit the transaction
    await session.commitTransaction();
  
    return {
      success: true,
      message: `Successfully transferred $${amount} from ${fromAccount} to ${toAccount}`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    };
  
  } catch (error) {
    // Rollback on any error
    await session.abortTransaction();
    throw new Error(`Transfer failed: ${error.message}`);
  } finally {
    await session.endSession();
  }
}

// Usage example
async function executeTransfer() {
  try {
    const result = await transferMoney('ACC001', 'ACC002', 1000);
    console.log(result);
  } catch (error) {
    console.error('Transfer error:', error.message);
  }
}
```

## Understanding Transaction Options

Let's explore the important options you can set for transactions:

```javascript
async function advancedTransaction() {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction({
      // Read Concern - What data is visible
      readConcern: { 
        level: 'snapshot'     // Most common for transactions
        // Other options: 'local', 'majority', 'linearizable'
      },
    
      // Write Concern - Acknowledgment requirements
      writeConcern: { 
        w: 'majority',        // Wait for majority acknowledgment
        j: true,              // Wait for journal flush
        wtimeout: 5000        // Timeout in milliseconds
      },
    
      // Transaction Options
      maxCommitTimeMS: 10000  // Maximum time for commit
    });
  
    // Your operations here...
  
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
```

> **Understanding Read Concerns** :
>
> * `local`: Returns the most recent data available to the query
> * `majority`: Returns data acknowledged by a majority of replica set members
> * `snapshot`: Provides a consistent view of all data in the transaction

## Advanced Pattern: Transaction with Retry Logic

Real-world applications need to handle transient failures:

```javascript
async function executeWithRetry(operation, maxRetries = 3) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    const session = await mongoose.startSession();
  
    try {
      await session.startTransaction();
    
      // Execute the operation with session
      const result = await operation(session);
    
      await session.commitTransaction();
      return result;
    
    } catch (error) {
      await session.abortTransaction();
    
      // Check if error is retryable
      if (error.errorLabels && error.errorLabels.includes('TransientTransactionError')) {
        attempt++;
        if (attempt < maxRetries) {
          console.log(`Transient error, retrying... (attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
          continue;
        }
      }
    
      // Non-retryable error or max retries reached
      throw error;
    } finally {
      await session.endSession();
    }
  }
}

// Usage with retry logic
async function createOrderWithRetry(orderData) {
  return executeWithRetry(async (session) => {
    // Create order
    const order = new Order(orderData);
    await order.save({ session });
  
    // Update inventory
    await Inventory.findOneAndUpdate(
      { productId: orderData.productId },
      { $inc: { quantity: -orderData.quantity } },
      { session }
    );
  
    // Create payment record
    const payment = new Payment({
      orderId: order._id,
      amount: orderData.amount
    });
    await payment.save({ session });
  
    return order;
  });
}
```

## Handling Complex Business Logic

Let's implement a multi-step e-commerce order process:

```javascript
// models/Order.js
const orderSchema = new mongoose.Schema({
  orderNumber: String,
  customerId: mongoose.Schema.Types.ObjectId,
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
});

// services/orderService.js
async function processCompleteOrder(orderData) {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
  
    // Step 1: Validate inventory
    for (const item of orderData.items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
    }
  
    // Step 2: Create order
    const order = new Order({
      ...orderData,
      orderNumber: generateOrderNumber(),
      status: 'pending'
    });
    await order.save({ session });
  
    // Step 3: Update inventory
    for (const item of orderData.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }
  
    // Step 4: Update customer data
    await Customer.findByIdAndUpdate(
      orderData.customerId,
      { 
        $addToSet: { orderHistory: order._id },
        lastOrderDate: new Date()
      },
      { session }
    );
  
    // Step 5: Process payment
    const payment = await processPayment({
      orderId: order._id,
      amount: order.total,
      customerId: orderData.customerId
    }, session);
  
    // Step 6: Update order status
    order.status = 'confirmed';
    order.paymentId = payment._id;
    await order.save({ session });
  
    // Commit the entire transaction
    await session.commitTransaction();
  
    // Send confirmation email (outside transaction)
    await sendOrderConfirmation(order);
  
    return order;
  
  } catch (error) {
    await session.abortTransaction();
    console.error('Order processing failed:', error);
    throw new Error(`Failed to process order: ${error.message}`);
  } finally {
    await session.endSession();
  }
}
```

## Performance Considerations

Transactions have performance implications. Here are key points:

1. **Keep Transactions Short** : Long-running transactions can block other operations
2. **Minimize Cross-Collection Operations** : Each collection access adds overhead
3. **Use Appropriate Write Concerns** : Balance between performance and durability

```javascript
// Good practice: Prepare data outside transaction
async function optimizedTransaction(orderData) {
  // Prepare and validate data first
  const validatedData = await validateOrderData(orderData);
  const preparedItems = await prepareOrderItems(validatedData.items);
  
  // Only start transaction when ready
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
  
    // Quick operations inside transaction
    const order = await saveOrder(validatedData, session);
    await updateInventory(preparedItems, session);
    await recordPayment(order, session);
  
    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}
```

## Error Handling Best Practices

Proper error handling is crucial for transactions:

```javascript
async function robustTransaction() {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
  
    // Your operations...
  
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
  
    // Log the error for debugging
    console.error('Transaction error:', {
      message: error.message,
      code: error.code,
      errorLabels: error.errorLabels,
      stack: error.stack
    });
  
    // Provide user-friendly error messages
    if (error.code === 11000) {
      throw new Error('Duplicate record found. Please try again.');
    } else if (error.errorLabels?.includes('TransientTransactionError')) {
      throw new Error('Transaction temporarily failed. Please retry.');
    } else {
      throw new Error('Operation failed. Please contact support.');
    }
  } finally {
    await session.endSession();
  }
}
```

## Testing Transactions

Here's how to properly test transaction logic:

```javascript
// test/transaction.test.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

describe('Transaction Tests', () => {
  let mongoServer;
  
  beforeAll(async () => {
    // Start in-memory MongoDB replica set
    mongoServer = await MongoMemoryServer.create({
      replSet: { count: 1 }
    });
  
    await mongoose.connect(mongoServer.getUri(), {
      replicaSet: 'testset'
    });
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  
  test('should successfully transfer money between accounts', async () => {
    // Setup test data
    const account1 = await Account.create({
      accountNumber: 'TEST001',
      balance: 1000,
      accountHolder: 'John Doe'
    });
  
    const account2 = await Account.create({
      accountNumber: 'TEST002',
      balance: 500,
      accountHolder: 'Jane Doe'
    });
  
    // Execute transfer
    const result = await transferMoney('TEST001', 'TEST002', 300);
  
    // Verify results
    expect(result.success).toBe(true);
    expect(result.senderBalance).toBe(700);
    expect(result.receiverBalance).toBe(800);
  
    // Verify database state
    const updatedAccount1 = await Account.findOne({ accountNumber: 'TEST001' });
    const updatedAccount2 = await Account.findOne({ accountNumber: 'TEST002' });
  
    expect(updatedAccount1.balance).toBe(700);
    expect(updatedAccount2.balance).toBe(800);
  });
  
  test('should rollback on insufficient funds', async () => {
    // Test rollback scenario
    await expect(transferMoney('TEST001', 'TEST002', 10000))
      .rejects.toThrow('Insufficient funds');
  
    // Verify no changes occurred
    const account1 = await Account.findOne({ accountNumber: 'TEST001' });
    expect(account1.balance).toBe(700); // Previous balance
  });
});
```

## Common Pitfalls and Solutions

### 1. Forgetting to Pass Session to Operations

```javascript
// Wrong - operation not part of transaction
await User.create(userData);

// Correct - operation included in transaction
await User.create(userData, { session });

// For queries
await User.findOne({ email }).session(session);

// For updates
await User.findByIdAndUpdate(id, update, { session });
```

### 2. Mixing Transactional and Non-Transactional Operations

```javascript
// Wrong - mixing operations
async function badTransaction() {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
  
    await Order.create(orderData, { session }); // In transaction
    await sendEmail(user.email); // Outside transaction - WRONG!
  
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

// Correct - separate concerns
async function goodTransaction() {
  const session = await mongoose.startSession();
  let order;
  
  try {
    await session.startTransaction();
  
    order = await Order.create(orderData, { session });
    await updateInventory(orderData, { session });
  
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
  
  // Non-transactional operations after commit
  if (order) {
    await sendEmail(order.customerEmail);
    await updateAnalytics(order);
  }
}
```

### 3. Long-Running Transactions

```javascript
// Bad - long-running transaction
async function badLongTransaction() {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
  
    for (let i = 0; i < 10000; i++) {
      await processItem(i, session); // This will take too long!
    }
  
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

// Good - batch processing
async function goodBatchTransaction() {
  const batchSize = 100;
  const totalItems = 10000;
  
  for (let i = 0; i < totalItems; i += batchSize) {
    const session = await mongoose.startSession();
  
    try {
      await session.startTransaction();
    
      const batch = items.slice(i, i + batchSize);
      await processBatch(batch, session);
    
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
```

## Monitoring and Debugging Transactions

Add comprehensive logging for production systems:

```javascript
async function monitoredTransaction(operationName, operation) {
  const session = await mongoose.startSession();
  const startTime = Date.now();
  
  try {
    console.log(`[TRANSACTION START] ${operationName}`);
  
    await session.startTransaction();
  
    const result = await operation(session);
  
    await session.commitTransaction();
  
    const duration = Date.now() - startTime;
    console.log(`[TRANSACTION SUCCESS] ${operationName} - ${duration}ms`);
  
    // Log to monitoring system
    logTransactionMetrics({
      operation: operationName,
      status: 'success',
      duration
    });
  
    return result;
  
  } catch (error) {
    await session.abortTransaction();
  
    const duration = Date.now() - startTime;
    console.error(`[TRANSACTION FAILED] ${operationName} - ${duration}ms`, error);
  
    // Log to monitoring system
    logTransactionMetrics({
      operation: operationName,
      status: 'failed',
      duration,
      error: error.message
    });
  
    throw error;
  } finally {
    await session.endSession();
  }
}
```

## Conclusion

Transaction handling with Mongoose requires understanding several key concepts:

1. **Sessions** - The client-side abstraction for grouping operations
2. **Atomicity** - All operations succeed or all fail
3. **Error Handling** - Proper rollback and cleanup
4. **Performance** - Keeping transactions short and efficient

> **Remember** : Transactions are powerful but come with overhead. Use them when you need guaranteed consistency across multiple operations, but design your application to minimize their use where possible.

By following these patterns and best practices, you can implement robust transaction handling that ensures data consistency in your Node.js applications with Mongoose.
