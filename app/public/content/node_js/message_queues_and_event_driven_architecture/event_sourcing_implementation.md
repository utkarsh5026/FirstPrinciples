# Event Sourcing in Node.js: A Deep Dive from First Principles

Let me take you on a journey through Event Sourcing, starting from the very basics and building up to a complete Node.js implementation. Think of this as learning to build a ship - we'll start with understanding wood and nails before building the hull.

## What is Event Sourcing? (Starting at the Beginning)

> **At its core, Event Sourcing is a way of storing data that focuses on recording what happened, rather than what is.**

Let's start with a simple analogy. Imagine tracking your bank account:

**Traditional Approach:**

```
Current Balance: $1,000
```

**Event Sourcing Approach:**

```
1. Started with $0
2. Deposited $500 
3. Withdrew $100
4. Deposited $600
Result: $1,000
```

The traditional approach gives you the final state, but Event Sourcing gives you the complete history of how you got there.

## Why Event Sourcing? (The Fundamental Problems It Solves)

Let's understand why we'd want to track history instead of just current state:

### Problem 1: Lost Information

When you update a database record, you lose the previous value:

```javascript
// Traditional approach - we lose the old price
const updateProduct = async (productId, newPrice) => {
  await db.query('UPDATE products SET price = ? WHERE id = ?', [newPrice, productId]);
  // The old price is gone forever!
};
```

### Problem 2: Complex Business Logic

Business rules often depend on what happened before:

```javascript
// How do we know if a user has exceeded their withdrawal limit this month?
// With traditional state, we'd need separate tracking tables
const checkWithdrawalLimit = async (userId, amount) => {
  // We need to maintain separate withdrawal tracking
  const monthlyWithdrawals = await db.query(
    'SELECT SUM(amount) FROM withdrawals WHERE user_id = ? AND month = ?',
    [userId, currentMonth]
  );
  // This gets complex fast!
};
```

## Core Concepts: Building Blocks of Event Sourcing

Let's establish the fundamental concepts:

### 1. Events (The Building Blocks)

> **An event is an immutable fact about something that happened in the past.**

```javascript
// Event structure - these are our basic building blocks
const event = {
  eventId: '123e4567-e89b-12d3-a456-426614174000',
  aggregateId: 'account-001',    // What thing did this happen to?
  timestamp: '2025-05-11T10:30:00Z',
  eventType: 'MoneyDeposited',   // What happened?
  payload: {                     // Details about what happened
    amount: 500,
    currency: 'USD',
    source: 'wire_transfer'
  }
};
```

### 2. Event Stream (The History)

Events are stored in a sequence for each aggregate:

```
Account-001 Event Stream:
│
├── Event 1: AccountOpened { initialBalance: 0 }
├── Event 2: MoneyDeposited { amount: 500 }
├── Event 3: MoneyWithdrawn { amount: 100 }
└── Event 4: MoneyDeposited { amount: 600 }
```

### 3. Aggregate (The Thing That Changes)

An aggregate is an entity that generates events and maintains consistency:

```javascript
class BankAccount {
  constructor() {
    this.id = null;
    this.balance = 0;
    this.status = 'inactive';
    this.version = 0; // For optimistic concurrency
  }
  
  // Apply events to rebuild state
  apply(event) {
    switch(event.eventType) {
      case 'AccountOpened':
        this.id = event.aggregateId;
        this.status = 'active';
        break;
      case 'MoneyDeposited':
        this.balance += event.payload.amount;
        break;
      case 'MoneyWithdrawn':
        this.balance -= event.payload.amount;
        break;
    }
    this.version = event.version;
  }
}
```

## Implementation in Node.js: Step by Step

Let's build a complete Event Sourcing system from scratch. We'll create a simple bank account system that can handle deposits and withdrawals.

### Step 1: Event Store (The Foundation)

First, we need a place to store events. This is the foundation of our system:

```javascript
// eventStore.js
class EventStore {
  constructor() {
    this.streams = new Map(); // In-memory for simplicity
  }
  
  async append(aggregateId, event) {
    // Get or create the stream for this aggregate
    if (!this.streams.has(aggregateId)) {
      this.streams.set(aggregateId, []);
    }
  
    const stream = this.streams.get(aggregateId);
    const version = stream.length;
  
    // Create the event with sequential version
    const eventWithVersion = {
      ...event,
      aggregateId,
      version,
      timestamp: new Date().toISOString()
    };
  
    // Append to stream
    stream.push(eventWithVersion);
  
    return eventWithVersion;
  }
  
  async getStream(aggregateId, fromVersion = 0) {
    const stream = this.streams.get(aggregateId) || [];
    return stream.slice(fromVersion);
  }
}

// Create our global event store
const eventStore = new EventStore();
```

### Step 2: Aggregate Base Class (The Pattern)

> **Aggregates are the core entities that maintain consistency and generate events.**

```javascript
// aggregate.js
class Aggregate {
  constructor() {
    this.id = null;
    this.version = -1;
    this.pendingEvents = [];
  }
  
  // Load the aggregate's current state from events
  static async load(id, eventStore) {
    const instance = new this();
    const events = await eventStore.getStream(id);
  
    for (const event of events) {
      instance.apply(event);
      instance.version = event.version;
    }
  
    instance.id = id;
    return instance;
  }
  
  // Save the aggregate's pending events
  async save(eventStore) {
    for (const event of this.pendingEvents) {
      // Optimistic concurrency check
      const currentVersion = await this.getCurrentVersion(eventStore);
      if (currentVersion !== this.version) {
        throw new Error('Concurrent modification detected');
      }
    
      await eventStore.append(this.id, event);
      this.version++;
    }
  
    this.pendingEvents = [];
  }
  
  // Helper method to check current version
  async getCurrentVersion(eventStore) {
    const events = await eventStore.getStream(this.id);
    return events.length > 0 ? events[events.length - 1].version : -1;
  }
  
  // Record an event (to be saved later)
  raise(eventType, payload) {
    this.pendingEvents.push({
      eventType,
      payload
    });
  }
  
  // Override this in subclasses
  apply(event) {
    throw new Error('apply() must be implemented by subclass');
  }
}
```

### Step 3: Bank Account Aggregate (The Business Logic)

Now let's implement our specific business logic:

```javascript
// bankAccount.js
class BankAccount extends Aggregate {
  constructor() {
    super();
    this.balance = 0;
    this.status = 'inactive';
    this.owner = null;
  }
  
  // Command: Open a new account
  static async open(id, owner, initialDeposit) {
    if (initialDeposit < 0) {
      throw new Error('Initial deposit must be positive');
    }
  
    const account = new BankAccount();
    account.id = id;
  
    // Record the events
    account.raise('AccountOpened', { owner });
  
    if (initialDeposit > 0) {
      account.raise('MoneyDeposited', { 
        amount: initialDeposit,
        description: 'Initial deposit'
      });
    }
  
    // Apply events to update state
    for (const event of account.pendingEvents) {
      account.apply({ 
        ...event, 
        aggregateId: id,
        version: account.version + 1
      });
    }
  
    return account;
  }
  
  // Command: Deposit money
  deposit(amount, description = '') {
    if (this.status !== 'active') {
      throw new Error('Account is not active');
    }
  
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
  
    this.raise('MoneyDeposited', { amount, description });
    this.apply({ 
      eventType: 'MoneyDeposited',
      payload: { amount, description },
      version: this.version + 1
    });
  }
  
  // Command: Withdraw money
  withdraw(amount, description = '') {
    if (this.status !== 'active') {
      throw new Error('Account is not active');
    }
  
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
  
    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }
  
    this.raise('MoneyWithdrawn', { amount, description });
    this.apply({ 
      eventType: 'MoneyWithdrawn',
      payload: { amount, description },
      version: this.version + 1
    });
  }
  
  // Apply events to rebuild state
  apply(event) {
    switch(event.eventType) {
      case 'AccountOpened':
        this.status = 'active';
        this.owner = event.payload.owner;
        break;
      
      case 'MoneyDeposited':
        this.balance += event.payload.amount;
        break;
      
      case 'MoneyWithdrawn':
        this.balance -= event.payload.amount;
        break;
    }
  
    this.version = event.version;
  }
}
```

### Step 4: Event Handlers (The Side Effects)

> **Event handlers allow us to react to events and perform side effects like sending notifications or updating read models.**

```javascript
// eventHandlers.js
class EventHandlers {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.handlers = new Map();
    this.lastProcessedVersion = new Map();
  }
  
  // Register a handler for a specific event type
  on(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }
  
  // Process all unprocessed events for an aggregate
  async processEvents(aggregateId) {
    const lastVersion = this.lastProcessedVersion.get(aggregateId) || -1;
    const events = await this.eventStore.getStream(aggregateId, lastVersion + 1);
  
    for (const event of events) {
      // Find handlers for this event type
      const handlers = this.handlers.get(event.eventType) || [];
    
      // Execute each handler
      for (const handler of handlers) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Handler failed for ${event.eventType}:`, error);
        }
      }
    
      // Update last processed version
      this.lastProcessedVersion.set(aggregateId, event.version);
    }
  }
}

// Example handlers
const handlers = new EventHandlers(eventStore);

// Send email notification when money is deposited
handlers.on('MoneyDeposited', async (event) => {
  console.log(`Email: $${event.payload.amount} deposited to account ${event.aggregateId}`);
  // await emailService.send('deposit_notification', { event });
});

// Update analytics when money is withdrawn
handlers.on('MoneyWithdrawn', async (event) => {
  console.log(`Analytics: Withdrawal of $${event.payload.amount} from ${event.aggregateId}`);
  // await analyticsService.recordWithdrawal(event);
});
```

### Step 5: Putting It All Together (The Application)

Let's create a simple application that uses our event sourcing system:

```javascript
// app.js
async function runBankingApp() {
  try {
    // Create a new account
    console.log('Creating new account...');
    const accountId = 'account-' + Date.now();
    const account = await BankAccount.open(accountId, 'John Doe', 1000);
  
    // Save the account (stores the events)
    await account.save(eventStore);
    console.log(`Account ${accountId} created with balance: $${account.balance}`);
  
    // Process events (side effects)
    await handlers.processEvents(accountId);
  
    // Make some transactions
    console.log('\nMaking transactions...');
    account.deposit(500, 'Salary');
    account.withdraw(200, 'Groceries');
    account.deposit(300, 'Birthday gift');
  
    // Save the new events
    await account.save(eventStore);
    console.log(`Final balance: $${account.balance}`);
  
    // Process new events
    await handlers.processEvents(accountId);
  
    // Load the account from scratch to verify
    console.log('\nLoading account from event store...');
    const loadedAccount = await BankAccount.load(accountId, eventStore);
    console.log(`Loaded account balance: $${loadedAccount.balance}`);
    console.log(`Account owner: ${loadedAccount.owner}`);
  
    // Show the event stream
    console.log('\nEvent stream:');
    const events = await eventStore.getStream(accountId);
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.eventType}: ${JSON.stringify(event.payload)}`);
    });
  
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the application
runBankingApp();
```

## Advanced Concepts: Scaling and Optimizing

### Snapshots (Optimization Technique)

> **As event streams grow long, replaying all events becomes expensive. Snapshots are periodic saves of aggregate state.**

```javascript
// snapshot.js
class SnapshotStore {
  constructor() {
    this.snapshots = new Map();
  }
  
  async save(aggregateId, state, version) {
    const snapshot = {
      aggregateId,
      state: JSON.parse(JSON.stringify(state)), // Deep copy
      version,
      timestamp: new Date().toISOString()
    };
  
    this.snapshots.set(aggregateId, snapshot);
  }
  
  async load(aggregateId) {
    return this.snapshots.get(aggregateId);
  }
}

// Enhanced Aggregate with snapshot support
class SnapshotableAggregate extends Aggregate {
  static async load(id, eventStore, snapshotStore) {
    const instance = new this();
    instance.id = id;
  
    // Try to load from snapshot first
    const snapshot = await snapshotStore.load(id);
  
    let startVersion = 0;
    if (snapshot) {
      // Restore from snapshot
      Object.assign(instance, snapshot.state);
      instance.version = snapshot.version;
      startVersion = snapshot.version + 1;
    }
  
    // Load events since snapshot (or all events if no snapshot)
    const events = await eventStore.getStream(id, startVersion);
  
    for (const event of events) {
      instance.apply(event);
      instance.version = event.version;
    }
  
    return instance;
  }
  
  async save(eventStore, snapshotStore, snapshotInterval = 10) {
    await super.save(eventStore);
  
    // Save snapshot every N versions
    if (this.version % snapshotInterval === 0) {
      await snapshotStore.save(this.id, this, this.version);
    }
  }
}
```

### Projections (Read Models)

> **Projections are optimized views of data built from events, designed for fast querying.**

```javascript
// projection.js
class AccountSummaryProjection {
  constructor() {
    this.accounts = new Map();
  }
  
  // Handle events to update the projection
  handleEvent(event) {
    switch(event.eventType) {
      case 'AccountOpened':
        this.accounts.set(event.aggregateId, {
          id: event.aggregateId,
          owner: event.payload.owner,
          balance: 0,
          status: 'active',
          totalDeposits: 0,
          totalWithdrawals: 0,
          transactionCount: 0
        });
        break;
      
      case 'MoneyDeposited':
        const account = this.accounts.get(event.aggregateId);
        if (account) {
          account.balance += event.payload.amount;
          account.totalDeposits += event.payload.amount;
          account.transactionCount++;
        }
        break;
      
      case 'MoneyWithdrawn':
        const withdrawAccount = this.accounts.get(event.aggregateId);
        if (withdrawAccount) {
          withdrawAccount.balance -= event.payload.amount;
          withdrawAccount.totalWithdrawals += event.payload.amount;
          withdrawAccount.transactionCount++;
        }
        break;
    }
  }
  
  // Fast querying methods
  getAccountSummary(accountId) {
    return this.accounts.get(accountId);
  }
  
  getAccountsWithBalanceAbove(threshold) {
    return Array.from(this.accounts.values())
      .filter(account => account.balance > threshold);
  }
  
  getTotalBalanceAcrossAllAccounts() {
    return Array.from(this.accounts.values())
      .reduce((sum, account) => sum + account.balance, 0);
  }
}

// Projection manager to keep projections updated
class ProjectionManager {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.projections = new Map();
    this.lastProcessedPosition = {};
  }
  
  registerProjection(name, projection) {
    this.projections.set(name, projection);
  }
  
  async updateProjections() {
    // In a real system, you'd track global event position
    // Here we'll just process all events for all aggregates
  
    for (const [aggregateId, stream] of this.eventStore.streams) {
      const lastProcessed = this.lastProcessedPosition[aggregateId] || -1;
      const newEvents = stream.slice(lastProcessed + 1);
    
      for (const event of newEvents) {
        // Apply event to all projections
        for (const projection of this.projections.values()) {
          projection.handleEvent(event);
        }
      }
    
      this.lastProcessedPosition[aggregateId] = stream.length - 1;
    }
  }
}
```

## Production Considerations

### Data Flow Diagram

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   Client    │    │  Application │    │ Event Store  │
│  Requests   │───▶│   Commands   │───▶│   (Events)   │
└─────────────┘    └──────────────┘    └──────────────┘
                                              │
                         ┌────────────────────┴─────────────────────┐
                         │                                          │
                         ▼                                          ▼
                ┌──────────────┐                           ┌──────────────┐
                │   Event      │                           │   Read       │
                │   Handlers   │                           │   Models     │
                │ (Side Effects)│                          │(Projections) │
                └──────────────┘                           └──────────────┘
                         │                                          │
                         ▼                                          ▼
                ┌──────────────┐                           ┌──────────────┐
                │ Notifications│                           │   Query      │
                │   Services   │                           │   Responses  │
                └──────────────┘                           └──────────────┘
```

### Important Considerations

> **When implementing Event Sourcing in production, consider these critical aspects:**

1. **Event Versioning** : Events need schema evolution

```javascript
const eventMigrations = {
  'MoneyDeposited': {
    '1.0': event => event, // Original
    '2.0': event => ({      // Added currency field
      ...event,
      payload: {
        ...event.payload,
        currency: event.payload.currency || 'USD'
      }
    })
  }
};
```

2. **Idempotency** : Ensure events can be replayed safely
3. **Eventual Consistency** : Projections may lag behind events
4. **Storage** : Events grow indefinitely (consider archiving strategies)
5. **Performance** : Snapshot and index appropriately

## Best Practices Summary

1. **Events should be immutable and describe what happened**
2. **Aggregate boundaries should enforce consistency**
3. **Use event handlers for side effects**
4. **Build projections for query optimization**
5. **Plan for event schema evolution**
6. **Implement proper error handling and recovery**

Event Sourcing provides powerful benefits in terms of auditability, debugging, and complex business rule implementation, but it requires careful design and implementation. Start simple with a clear understanding of your domain, then add complexity as needed.
