# Generic Constraints and Bounds: Using `extends` to Limit Generic Type Parameters

Let's start by understanding why we need to constrain our generic types and build up to advanced constraint patterns.

## The JavaScript Foundation: Why Constraints Matter

In JavaScript, we often write functions that work with many types, but need certain guarantees about what those types can do:

```javascript
// JavaScript: Works with anything that has a length property
function logLength(item) {
    console.log(`Length: ${item.length}`);
    return item;
}

logLength([1, 2, 3]);        // Works - arrays have length
logLength("hello");          // Works - strings have length
logLength({length: 5});      // Works - object has length property
logLength(42);               // Runtime error - numbers don't have length!
```

The problem: **We want type flexibility, but we also need guarantees about what operations are available.**

## The TypeScript Problem: Unconstrained Generics

When we make a function generic without constraints, TypeScript can't assume anything about the type parameter:

```typescript
// ❌ TypeScript doesn't know what T can do
function processItem<T>(item: T): T {
    console.log(item.length);    // ❌ Error: Property 'length' does not exist on type 'T'
    item.sort();                 // ❌ Error: Property 'sort' does not exist on type 'T'
    item.toUpperCase();          // ❌ Error: Property 'toUpperCase' does not exist on type 'T'
  
    return item;
}
```

> **The Core Problem** : Unconstrained generics (`<T>`) can be ANY type, so TypeScript only allows operations that work on ALL types. This severely limits what we can do inside generic functions.

## Enter Generic Constraints: The `extends` Keyword

Generic constraints use the `extends` keyword to say "T must be assignable to this type":

```typescript
// Basic constraint syntax
function processItem<T extends SomeConstraint>(item: T): T {
    // Now we can use properties/methods from SomeConstraint
}
```

### Visual Representation:

```
Constraint Relationship:
┌─────────────────┐
│  All Types      │
│  ┌───────────┐  │
│  │ T extends │  │  ← T is a subset of
│  │   Base    │  │    types that satisfy
│  └───────────┘  │    the constraint
└─────────────────┘
```

## Basic Constraints: Interface and Object Types

Let's solve our length problem with a constraint:

```typescript
// Define what we need
interface HasLength {
    length: number;
}

// Constrain T to types that have a length property
function logLength<T extends HasLength>(item: T): T {
    console.log(`Length: ${item.length}`); // ✅ Now TypeScript knows T has length
    return item; // Return with full type information preserved
}

// Usage examples - TypeScript checks the constraint
logLength([1, 2, 3]);              // ✅ T = number[], has length
logLength("hello world");          // ✅ T = string, has length  
logLength({length: 10, data: []});  // ✅ T = {length: number, data: any[]}, has length

// ❌ TypeScript prevents invalid usage at compile time
logLength(42);                     // ❌ Error: number is not assignable to HasLength
logLength({count: 5});             // ❌ Error: {count: number} is missing length property
```

 **Key Insight** : The constrained type parameter `T extends HasLength` means:

* T must have at least the properties required by HasLength
* T can have additional properties beyond HasLength
* The return type is still the full T, not just HasLength

## Multiple Property Constraints

You can constrain to types that have multiple required properties:

```typescript
// Constraint requiring multiple properties
interface Identifiable {
    id: string | number;
}

interface Timestamped {
    createdAt: Date;
    updatedAt: Date;
}

// T must have both id and timestamp properties
function auditEntity<T extends Identifiable & Timestamped>(entity: T): T {
    console.log(`Entity ${entity.id} was created at ${entity.createdAt}`);
  
    // Update the timestamp
    entity.updatedAt = new Date();
  
    return entity; // Full type T is preserved
}

// Usage examples
const user = {
    id: "123",
    name: "Alice",
    email: "alice@example.com",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
};

const auditedUser = auditEntity(user);
// auditedUser has full type: {id: string, name: string, email: string, createdAt: Date, updatedAt: Date}

console.log(auditedUser.name);  // ✅ TypeScript knows about the name property
console.log(auditedUser.email); // ✅ TypeScript knows about the email property
```

## Primitive Type Constraints

You can constrain to primitive types or unions of primitives:

```typescript
// Constraint to string types only
function processString<T extends string>(input: T): T {
    return input.toUpperCase() as T; // ✅ strings have toUpperCase()
}

// Constraint to numeric types
function processNumber<T extends number>(input: T): T {
    return (input * 2) as T; // ✅ numbers support arithmetic
}

// Constraint to union of primitives
function processStringOrNumber<T extends string | number>(input: T): string {
    return input.toString(); // ✅ Both strings and numbers have toString()
}

// Usage
const result1 = processString("hello");    // T = "hello" (literal type)
const result2 = processNumber(42);         // T = 42 (literal type)
const result3 = processStringOrNumber(10); // T = number
```

## The `keyof` Constraint: Type-Safe Property Access

One of the most powerful constraint patterns uses `keyof` to ensure type-safe property access:

```typescript
// Get a property value with complete type safety
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const person = {
    name: "Alice",
    age: 30,
    email: "alice@example.com",
    isActive: true
};

// ✅ Type-safe property access
const name = getProperty(person, "name");       // Type: string
const age = getProperty(person, "age");         // Type: number  
const email = getProperty(person, "email");     // Type: string
const isActive = getProperty(person, "isActive"); // Type: boolean

// ❌ TypeScript prevents accessing non-existent properties
const height = getProperty(person, "height");   // ❌ Error: "height" is not a key of person
const invalid = getProperty(person, "xyz");     // ❌ Error: "xyz" is not a key of person
```

### Breaking Down `keyof` Constraints:

```typescript
// Let's understand what keyof T represents
type PersonKeys = keyof typeof person; 
// PersonKeys = "name" | "age" | "email" | "isActive"

// So K extends keyof T means:
// K must be one of the valid property names of T

// And T[K] represents:
// The type of the property K in object T
```

### Visual Flow:

```
keyof Constraint Flow:
Object T     →     keyof T      →     K extends keyof T     →     T[K]
{                  "name" |            K must be one            Type of the
 name: string,     "age" |             of these keys           specific property
 age: number       "email" |                                   K accesses
}                  "isActive"
```

## Advanced `keyof` Patterns: Safe Property Updates

```typescript
// Type-safe property setter
function setProperty<T, K extends keyof T>(
    obj: T, 
    key: K, 
    value: T[K]  // Value must match the property's type
): T {
    obj[key] = value;
    return obj;
}

const user = {name: "Alice", age: 30, isAdmin: false};

// ✅ Type-safe updates
setProperty(user, "name", "Bob");        // ✅ string value for string property
setProperty(user, "age", 31);            // ✅ number value for number property
setProperty(user, "isAdmin", true);      // ✅ boolean value for boolean property

// ❌ TypeScript prevents type mismatches
setProperty(user, "age", "thirty");      // ❌ Error: string not assignable to number
setProperty(user, "name", 25);           // ❌ Error: number not assignable to string
setProperty(user, "isAdmin", "yes");     // ❌ Error: string not assignable to boolean
```

## Array Element Constraints

Constrain generics to work with specific array element types:

```typescript
// T must be an array, and we can access its element type
function getFirstItem<T extends readonly unknown[]>(array: T): T[0] {
    return array[0];
}

// Usage with different array types
const numbers = [1, 2, 3] as const;
const strings = ["a", "b", "c"];
const mixed = [true, "hello", 42];

const firstNumber = getFirstItem(numbers); // Type: 1 (literal type from const assertion)
const firstString = getFirstItem(strings); // Type: string
const firstMixed = getFirstItem(mixed);    // Type: boolean | string | number

// More specific array constraints
function sumNumbers<T extends number[]>(numbers: T): number {
    return numbers.reduce((sum, num) => sum + num, 0);
}

const sum = sumNumbers([1, 2, 3, 4]); // ✅ Works with number arrays
// sumNumbers(["a", "b"]);            // ❌ Error: string[] not assignable to number[]
```

## Function Type Constraints

Constrain generics to function types:

```typescript
// T must be a function that takes a string and returns something
function createLogger<T extends (message: string) => any>(
    loggerFn: T
): T {
    // Wrap the logger with additional functionality
    return ((...args: any[]) => {
        console.log("Logging called at:", new Date());
        return loggerFn(...args);
    }) as T;
}

// Usage with different function signatures
const simpleLogger = (msg: string) => console.log(msg);
const fileLogger = (msg: string) => { /* write to file */ return true; };
const asyncLogger = (msg: string) => Promise.resolve(msg.toUpperCase());

const wrappedSimple = createLogger(simpleLogger);   // Type preserved: (message: string) => void
const wrappedFile = createLogger(fileLogger);       // Type preserved: (message: string) => boolean  
const wrappedAsync = createLogger(asyncLogger);     // Type preserved: (message: string) => Promise<string>
```

## Conditional Constraints: `extends` in Conditional Types

The `extends` keyword also enables conditional type logic:

```typescript
// Basic conditional type
type IsArray<T> = T extends any[] ? true : false;

type Test1 = IsArray<string[]>;    // true
type Test2 = IsArray<number>;      // false
type Test3 = IsArray<boolean[]>;   // true

// Conditional constraints for function behavior
function processValue<T>(
    value: T
): T extends string ? string : T extends number ? number : never {
    if (typeof value === 'string') {
        return value.toUpperCase() as any;
    }
    if (typeof value === 'number') {
        return (value * 2) as any;
    }
    throw new Error('Unsupported type');
}

const stringResult = processValue("hello");  // Type: string
const numberResult = processValue(42);       // Type: number
// const invalidResult = processValue(true); // ❌ Error: boolean not supported
```

## Real-World Example: Building a Type-Safe Event System

Let's combine multiple constraint patterns in a practical example:

```typescript
// Base event interface that all events must extend
interface BaseEvent {
    type: string;
    timestamp: Date;
}

// Specific event types
interface UserLoggedIn extends BaseEvent {
    type: 'user_logged_in';
    userId: string;
    sessionId: string;
}

interface OrderPlaced extends BaseEvent {
    type: 'order_placed';
    orderId: string;
    userId: string;
    amount: number;
}

interface ProductViewed extends BaseEvent {
    type: 'product_viewed';
    productId: string;
    userId?: string; // Optional for anonymous users
}

// Event map for type safety
interface EventMap {
    'user_logged_in': UserLoggedIn;
    'order_placed': OrderPlaced;
    'product_viewed': ProductViewed;
}

// Generic event handler with multiple constraints
class EventBus {
    private handlers: Map<string, Function[]> = new Map();
  
    // T must extend BaseEvent AND be a valid event type
    subscribe<T extends BaseEvent, K extends keyof EventMap>(
        eventType: K,
        handler: (event: EventMap[K]) => void
    ): void {
        const handlers = this.handlers.get(eventType) || [];
        handlers.push(handler);
        this.handlers.set(eventType, handlers);
    }
  
    // Emit with type safety
    emit<K extends keyof EventMap>(
        eventType: K,
        event: Omit<EventMap[K], 'timestamp'> // timestamp added automatically
    ): void {
        const fullEvent = {
            ...event,
            timestamp: new Date()
        } as EventMap[K];
      
        const handlers = this.handlers.get(eventType) || [];
        handlers.forEach(handler => handler(fullEvent));
    }
  
    // Generic event processor with constraints
    processEvent<T extends BaseEvent & { userId: string }>(
        event: T
    ): void {
        // T is constrained to events that have a userId
        console.log(`Processing event for user ${event.userId}`);
        console.log(`Event type: ${event.type}`);
        console.log(`Timestamp: ${event.timestamp}`);
    }
}

// Usage with full type safety
const eventBus = new EventBus();

// ✅ Type-safe event subscription
eventBus.subscribe('user_logged_in', (event) => {
    // event is automatically typed as UserLoggedIn
    console.log(`User ${event.userId} logged in with session ${event.sessionId}`);
});

eventBus.subscribe('order_placed', (event) => {
    // event is automatically typed as OrderPlaced
    console.log(`Order ${event.orderId} placed for $${event.amount}`);
});

// ✅ Type-safe event emission
eventBus.emit('user_logged_in', {
    type: 'user_logged_in',
    userId: 'user123',
    sessionId: 'session456'
});

eventBus.emit('order_placed', {
    type: 'order_placed',
    orderId: 'order789',
    userId: 'user123',
    amount: 99.99
});

// ❌ TypeScript prevents errors
// eventBus.emit('user_logged_in', {
//     type: 'user_logged_in',
//     userId: 'user123'
//     // Missing sessionId - TypeScript error!
// });

// eventBus.emit('invalid_event', {...}); // ❌ Error: not a valid event type
```

## Constraint Inheritance and Composition

You can build up complex constraints by combining simpler ones:

```typescript
// Base constraints
interface Identifiable {
    id: string;
}

interface Timestamped {
    createdAt: Date;
    updatedAt: Date;
}

interface Versioned {
    version: number;
}

// Composed constraints
type Entity = Identifiable & Timestamped;
type VersionedEntity = Entity & Versioned;

// Function with layered constraints
function updateEntity<T extends VersionedEntity>(
    entity: T,
    updates: Partial<Omit<T, 'id' | 'createdAt' | 'version'>>
): T {
    return {
        ...entity,
        ...updates,
        updatedAt: new Date(),
        version: entity.version + 1  // Increment version
    };
}

// Usage
const document = {
    id: "doc123",
    title: "My Document", 
    content: "Document content",
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
    version: 1
};

const updatedDoc = updateEntity(document, {
    title: "Updated Document",
    content: "Updated content"
});

// updatedDoc has type: {id: string, title: string, content: string, createdAt: Date, updatedAt: Date, version: number}
```

## Recursive Constraints: Advanced Type Gymnastics

For advanced scenarios, you can create recursive constraints:

```typescript
// Deeply nested object constraint
type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

function freezeDeep<T extends object>(obj: T): DeepReadonly<T> {
    // Implementation would recursively freeze all nested objects
    return Object.freeze(obj) as DeepReadonly<T>;
}

// Tree-like structure constraint
interface TreeNode<T> {
    value: T;
    children?: TreeNode<T>[];
}

function traverseTree<T, U>(
    node: TreeNode<T>,
    transform: (value: T) => U
): TreeNode<U> {
    return {
        value: transform(node.value),
        children: node.children?.map(child => traverseTree(child, transform))
    };
}
```

## Common Gotchas and Anti-Patterns

> **Gotcha #1: Over-constraining**
>
> ```typescript
> // ❌ Too restrictive - only works with exact interface match
> interface ExactUser {
>     name: string;
>     age: number;
> }
>
> function processUser<T extends ExactUser>(user: T): T {
>     return user;
> }
>
> // Won't work with users that have additional properties
> const userWithEmail = {name: "Alice", age: 30, email: "alice@example.com"};
> processUser(userWithEmail); // Works, but feels restrictive
>
> // ✅ Better - more flexible constraint
> interface MinimalUser {
>     name: string;
>     age: number;
> }
>
> function processUserBetter<T extends MinimalUser>(user: T): T {
>     return user; // Works with any object that has at least name and age
> }
> ```

> **Gotcha #2: Constraint vs Implementation**
>
> ```typescript
> // ❌ Wrong: trying to use constraint type in implementation
> function process<T extends string>(value: T): string {
>     return value.toUpperCase(); // Returns string, not T
> }
>
> // ✅ Correct: preserve the specific type
> function process<T extends string>(value: T): T {
>     return value.toUpperCase() as T;
> }
> ```

> **Gotcha #3: Circular constraints**
>
> ```typescript
> // ❌ Circular - doesn't work
> interface A<T extends B<T>> {
>     value: T;
> }
>
> interface B<T extends A<T>> {
>     data: T;
> }
> ```

## Best Practices for Generic Constraints

> **Start with minimal constraints**
>
> Begin with the loosest constraint that enables your functionality, then tighten as needed.

> **Use meaningful constraint names**
>
> ```typescript
> // ❌ Unclear
> function fn<T extends X>(item: T): T { ... }
>
> // ✅ Clear intent
> function processSerializable<T extends Serializable>(item: T): T { ... }
> ```

> **Prefer composition over inheritance in constraints**
>
> ```typescript
> // ✅ Composable constraints
> type Entity = Identifiable & Timestamped & Versioned;
>
> // Rather than deep inheritance hierarchies
> ```

> **Document complex constraints**
>
> ```typescript
> /**
>  * T must be an object with string keys and values that can be compared
>  */
> function sortByProperty
>     T extends Record<string, string | number>,
>     K extends keyof T
>>(items: T[], key: K): T[] { ... }
> ```

## Mental Model: Constraints as Contracts

Think of generic constraints as **contracts** between your generic function and its callers:

```
Contract Flow:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Caller says:  │    │ Constraint says: │    │ Function gets:  │
│ "Here's a type  │───▶│ "Type must have │───▶│ "Safe to use    │
│  T"             │    │  these features" │    │  those features"│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Constraint Categories:

```
Constraint Types:
├── Structure Constraints (interfaces, object shapes)
├── Primitive Constraints (string, number, boolean)
├── Property Constraints (keyof, property access)
├── Function Constraints (callable types)
├── Array Constraints (element types)
└── Conditional Constraints (conditional logic)
```

> **Key Insight** : Constraints enable **controlled flexibility** - you get the reusability of generics while maintaining the safety of specific type guarantees. They're the bridge between "works with anything" and "works safely with things that have what I need."

Generic constraints are TypeScript's way of saying: "I'll work with many types, but only those that promise to have the capabilities I require." This gives you the best of both worlds: flexibility and safety.
