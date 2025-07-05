# Generic Interfaces: Creating Flexible, Reusable Interface Definitions

## JavaScript Foundation: Object Contracts and Patterns

Before diving into TypeScript's generic interfaces, let's understand the JavaScript foundation they're built upon.

In JavaScript, we often work with objects that follow similar patterns but contain different types of data:

```javascript
// JavaScript: Similar object structures with different data types
const userProfile = {
  id: "user123",
  data: { name: "Alice", email: "alice@example.com" },
  timestamp: new Date()
};

const productInfo = {
  id: "prod456", 
  data: { title: "Laptop", price: 999 },
  timestamp: new Date()
};

const orderRecord = {
  id: "order789",
  data: { items: ["laptop", "mouse"], total: 1050 },
  timestamp: new Date()
};
```

Notice the pattern: each object has an `id`, some `data`, and a `timestamp`, but the `data` property contains completely different information. In JavaScript, we have no way to enforce this pattern or get helpful tooling support.

## The Problem: Rigid vs Flexible Type Definitions

Let's see what happens when we try to solve this with basic TypeScript interfaces:

```typescript
// TypeScript: Rigid approach - separate interfaces for each case
interface UserProfile {
  id: string;
  data: { name: string; email: string };
  timestamp: Date;
}

interface ProductInfo {
  id: string;
  data: { title: string; price: number };
  timestamp: Date;
}

interface OrderRecord {
  id: string;
  data: { items: string[]; total: number };
  timestamp: Date;
}
```

This works, but creates several problems:

1. **Code duplication** : We're repeating the same structure (`id`, `timestamp`) multiple times
2. **Maintenance burden** : If we want to add a new property like `version`, we need to update every interface
3. **Scalability** : For every new data type, we need a completely new interface

> **Key Problem** : We need a way to define the common structure once while allowing the `data` property to be flexible.

## Enter Generic Interfaces: The Solution

Generic interfaces solve this by allowing us to create a template that can be specialized with different types:

```typescript
// Generic interface: One template, many specializations
interface Container<T> {
  id: string;
  data: T;  // T is a placeholder for any type
  timestamp: Date;
}

// Now we can specialize the generic interface
type UserProfile = Container<{ name: string; email: string }>;
type ProductInfo = Container<{ title: string; price: number }>;
type OrderRecord = Container<{ items: string[]; total: number }>;
```

## Understanding Generic Syntax: The Angle Brackets

Let's break down the generic syntax from first principles:

```typescript
interface Container<T> {
  //          ^^^
  //          This is a type parameter
  //          Think of it like a function parameter, but for types
}
```

Here's the mental model:

```
Regular Function:    function process(value) { return value; }
                                    ^^^^^
                                    runtime parameter

Generic Interface:   interface Container<T> { data: T }
                                        ^^^
                                        compile-time type parameter
```

> **Mental Model** : Generic interfaces are like functions that take types as parameters and return specialized interfaces.

## Step-by-Step Generic Interface Creation

Let's build a generic interface progressively:

### Step 1: Identify the Pattern

```javascript
// JavaScript: Notice the repeating pattern
const response1 = { success: true, data: "Hello World", error: null };
const response2 = { success: false, data: null, error: "Not found" };
const response3 = { success: true, data: 42, error: null };
```

### Step 2: Create Basic Interface

```typescript
// First attempt: Too specific
interface StringResponse {
  success: boolean;
  data: string | null;  // Only works for strings!
  error: string | null;
}
```

### Step 3: Make It Generic

```typescript
// Generic solution: Works for any data type
interface ApiResponse<TData> {
  success: boolean;
  data: TData | null;      // TData can be any type
  error: string | null;
}

// Usage examples
const stringResponse: ApiResponse<string> = {
  success: true,
  data: "Hello",
  error: null
};

const numberResponse: ApiResponse<number> = {
  success: true,
  data: 42,
  error: null
};

const userResponse: ApiResponse<{ id: number; name: string }> = {
  success: true,
  data: { id: 1, name: "Alice" },
  error: null
};
```

## Multiple Type Parameters

Generic interfaces can accept multiple type parameters:

```typescript
// Multiple generics for maximum flexibility
interface Repository<TEntity, TKey> {
  findById(id: TKey): Promise<TEntity | null>;
  save(entity: TEntity): Promise<TKey>;
  delete(id: TKey): Promise<boolean>;
}

// Specializations
interface UserRepository extends Repository<User, number> {
  // User entities with numeric IDs
  findByEmail(email: string): Promise<User | null>;
}

interface ProductRepository extends Repository<Product, string> {
  // Product entities with string IDs  
  findByCategory(category: string): Promise<Product[]>;
}
```

## ASCII Diagram: Generic Interface Specialization

```
Generic Interface Template
    ┌─────────────────────┐
    │ Container<T>        │
    │ ┌─────────────────┐ │
    │ │ id: string      │ │
    │ │ data: T         │ │ ← T is placeholder
    │ │ timestamp: Date │ │
    │ └─────────────────┘ │
    └─────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ User    │ │ Product │ │ Order   │
│ Profile │ │ Info    │ │ Record  │
│         │ │         │ │         │
│ T = {   │ │ T = {   │ │ T = {   │
│ name,   │ │ title,  │ │ items,  │
│ email   │ │ price   │ │ total   │
│ }       │ │ }       │ │ }       │
└─────────┘ └─────────┘ └─────────┘
```

## Type Constraints: Limiting Generic Flexibility

Sometimes we want generics to be flexible but not *too* flexible:

```typescript
// Without constraints: Too permissive
interface Processor<T> {
  process(item: T): void;
}

// This would be allowed but doesn't make sense:
// const processor: Processor<number> = ...
// processor.process(42); // How do you process a number?

// With constraints: More meaningful
interface Processor<T extends { id: string }> {
  //                    ^^^^^^^^^^^^^^^^^
  //                    T must have an 'id' property
  process(item: T): void;
}

// Now this works:
interface User {
  id: string;
  name: string;
}

const userProcessor: Processor<User> = {
  process(user) {
    console.log(`Processing user ${user.id}`); // ✓ We know 'id' exists
  }
};

// But this won't compile:
// const numberProcessor: Processor<number> = ...; // ✗ number doesn't have 'id'
```

> **Type Constraints Rule** : Use `extends` to require that generic types meet certain conditions, making your interfaces both flexible and safe.

## Real-World Example: Building a Generic Event System

Let's build a practical example that demonstrates the power of generic interfaces:

```typescript
// Step 1: Define the basic event structure
interface BaseEvent {
  timestamp: Date;
  source: string;
}

// Step 2: Create a generic event interface
interface Event<TType extends string, TPayload> extends BaseEvent {
  type: TType;        // Specific event type
  payload: TPayload;  // Event-specific data
}

// Step 3: Define specific event types
type UserLoginEvent = Event<'user:login', {
  userId: string;
  ipAddress: string;
}>;

type OrderCreatedEvent = Event<'order:created', {
  orderId: string;
  amount: number;
  customerId: string;
}>;

type SystemErrorEvent = Event<'system:error', {
  errorCode: string;
  message: string;
  stackTrace?: string;
}>;

// Step 4: Create a generic event handler interface
interface EventHandler<TEvent extends Event<string, any>> {
  canHandle(event: Event<string, any>): event is TEvent;
  handle(event: TEvent): Promise<void>;
}

// Step 5: Implement specific handlers
class UserLoginHandler implements EventHandler<UserLoginEvent> {
  canHandle(event: Event<string, any>): event is UserLoginEvent {
    return event.type === 'user:login';
  }
  
  async handle(event: UserLoginEvent): Promise<void> {
    // TypeScript knows this is a UserLoginEvent!
    console.log(`User ${event.payload.userId} logged in from ${event.payload.ipAddress}`);
    // Full type safety and autocomplete available here
  }
}
```

## Common Gotchas and Solutions

### Gotcha 1: Generic Type Inference

```typescript
// Problem: TypeScript can't infer the generic type
interface Container<T> {
  value: T;
}

function createContainer<T>(value: T): Container<T> {
  return { value };
}

// TypeScript infers T as 'string'
const container1 = createContainer("hello"); // ✓ Works

// But this doesn't work as expected:
const container2: Container = { value: "hello" }; // ✗ Error: Generic type requires argument
```

 **Solution** : Always provide the generic type argument when using the interface directly:

```typescript
const container2: Container<string> = { value: "hello" }; // ✓ Correct
```

### Gotcha 2: Generic Constraints vs. Union Types

```typescript
// Confusing: This looks like it should work
interface Processor<T extends string | number> {
  process(value: T): T;
}

// But T is still generic inside the interface!
const processor: Processor<string> = {
  process(value) {
    // value is 'string', not 'string | number'
    return value.toUpperCase(); // ✓ This works because T is specifically 'string'
  }
};
```

> **Important** : Constraints limit what types can be used as T, but inside the interface, T is still the specific type that was provided.

## Advanced Pattern: Conditional Generic Interfaces

For complex scenarios, you can make interface properties depend on the generic type:

```typescript
// Advanced: Interface behavior changes based on generic type
interface Repository<T, TId = T extends { id: infer U } ? U : string> {
  findById(id: TId): Promise<T | null>;
  save(entity: T): Promise<TId>;
}

// If T has an id property, TId becomes the type of that id
interface User {
  id: number;  // TId becomes 'number'
  name: string;
}

interface Product {
  id: string;  // TId becomes 'string'  
  title: string;
}

// TypeScript automatically infers the correct ID types:
const userRepo: Repository<User> = {
  async findById(id: number) { /* ... */ },  // id is number
  async save(user: User) { return 123; }     // returns number
};

const productRepo: Repository<Product> = {
  async findById(id: string) { /* ... */ },   // id is string
  async save(product: Product) { return "abc"; } // returns string
};
```

## When to Use Generic Interfaces

**Use generic interfaces when:**

* You have a consistent structure with varying data types
* You want to maintain type safety while being flexible
* You're building reusable libraries or utilities
* You need to enforce patterns across multiple similar interfaces

**Don't use generic interfaces when:**

* The structure varies significantly between use cases
* You only have one or two specific use cases
* The added complexity doesn't provide clear benefits

> **Best Practice** : Start with specific interfaces. When you notice repetitive patterns, refactor to generic interfaces. Don't over-engineer from the beginning.

Generic interfaces are one of TypeScript's most powerful features for creating flexible, reusable, and type-safe code. They allow you to capture common patterns while maintaining the specific type information that makes TypeScript so valuable for catching errors and providing great developer experience.
