# Method Signatures in Interfaces: Defining Function Contracts

Let me walk you through how TypeScript allows us to define precise contracts for functions within object types, starting from the JavaScript foundation.

## JavaScript Foundation: Objects Containing Functions

In JavaScript, objects commonly contain functions as properties. These functions can be defined in several ways:

```javascript
// JavaScript - Objects with function properties
const calculator = {
  // Method 1: Function property
  add: function(a, b) {
    return a + b;
  },
  
  // Method 2: ES6 method shorthand
  subtract(a, b) {
    return a - b;
  },
  
  // Method 3: Arrow function property
  multiply: (a, b) => a * b
};

// All of these work the same way
console.log(calculator.add(2, 3));      // 5
console.log(calculator.subtract(5, 2)); // 3
console.log(calculator.multiply(4, 3)); // 12
```

The problem with JavaScript is that we have no way to enforce what these functions should look like. Any object claiming to be a "calculator" could have completely different function signatures or missing methods entirely.

## What is a "Contract" in Programming?

> **Mental Model** : A contract in programming is like a legal contract - it specifies exactly what both parties (the code that provides the object and the code that uses it) can expect from each other.

A method signature contract specifies:

* The method name
* The number and types of parameters
* The return type
* Whether the method is required or optional

## TypeScript Interface Method Signatures

TypeScript interfaces allow us to define these contracts explicitly. Here's how the type system works:

```typescript
// TypeScript - Interface defining method contracts
interface Calculator {
  // Method signature syntax: methodName(param: type): returnType
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
}

// This object MUST conform to the Calculator contract
const myCalculator: Calculator = {
  add(a, b) {    // TypeScript infers the types from interface
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
  multiply(a, b) {
    return a * b;
  }
};

// This would cause a compiler error - missing method
const brokenCalculator: Calculator = {
  add(a, b) { return a + b; }
  // Error: Property 'subtract' is missing in type
  // Error: Property 'multiply' is missing in type
};
```

## Method Signature Syntax Variations

TypeScript provides multiple ways to define method signatures, each with specific use cases:

```typescript
interface ApiClient {
  // 1. Method syntax (most common)
  getData(id: string): Promise<Data>;
  
  // 2. Function property syntax
  processData: (data: Data) => ProcessedData;
  
  // 3. Call signature (for callable objects)
  (url: string): Promise<Response>;
}

// The compilation process:
//   TypeScript Code → Type Checking → JavaScript Code
//        ↓                ↓              ↓
//   Interface defs    Verify contracts   Pure functions
//   Method sigs       Check parameters   No type info
//   Type annotations  Validate returns   Runtime behavior
```

## Progressive Complexity: From Simple to Advanced

### Basic Method Signatures

```typescript
interface UserService {
  // Simple method - clear parameter and return types
  getUser(id: number): User;
  
  // Method with multiple parameters
  createUser(name: string, email: string, age: number): User;
  
  // Method returning void (no return value)
  deleteUser(id: number): void;
}
```

### Optional Methods

```typescript
interface MediaPlayer {
  // Required methods
  play(): void;
  pause(): void;
  stop(): void;
  
  // Optional method - may or may not be implemented
  fastForward?(): void;  // The ? makes it optional
  rewind?(): void;
}

// Valid implementation - optional methods can be omitted
const basicPlayer: MediaPlayer = {
  play() { console.log("Playing..."); },
  pause() { console.log("Paused"); },
  stop() { console.log("Stopped"); }
  // fastForward and rewind are optional, so this is valid
};

// Also valid - optional methods can be included
const advancedPlayer: MediaPlayer = {
  play() { console.log("Playing..."); },
  pause() { console.log("Paused"); },
  stop() { console.log("Stopped"); },
  fastForward() { console.log("Fast forwarding..."); },
  rewind() { console.log("Rewinding..."); }
};
```

> **Key Rule** : Optional methods use the `?` syntax and can be omitted from implementing objects, but if present, they must match the signature exactly.

### Methods with Complex Parameter Types

```typescript
interface DataProcessor {
  // Method accepting object parameters
  processUser(user: { id: number; name: string; email: string }): void;
  
  // Method accepting array parameters
  processBatch(users: User[]): ProcessingResult[];
  
  // Method with optional parameters
  search(query: string, limit?: number, offset?: number): SearchResult[];
  
  // Method with rest parameters
  logMessages(...messages: string[]): void;
}

// Implementation showing parameter handling
const processor: DataProcessor = {
  processUser(user) {
    // user is guaranteed to have id, name, and email
    console.log(`Processing ${user.name} (${user.id})`);
  },
  
  processBatch(users) {
    // users is guaranteed to be an array of User objects
    return users.map(user => ({ processed: true, userId: user.id }));
  },
  
  search(query, limit = 10, offset = 0) {
    // limit and offset are optional, so we can provide defaults
    return []; // Implementation would search with these parameters
  },
  
  logMessages(...messages) {
    // messages is an array of strings
    messages.forEach(msg => console.log(msg));
  }
};
```

## Method Overloading in Interfaces

TypeScript supports method overloading - the same method name with different signatures:

```typescript
interface Formatter {
  // Overloaded method signatures
  format(value: number): string;           // Format number
  format(value: Date): string;             // Format date  
  format(value: boolean): string;          // Format boolean
  format(value: number | Date | boolean): string; // Implementation signature
}

const formatter: Formatter = {
  format(value: number | Date | boolean): string {
    // Implementation must handle all overload cases
    if (typeof value === 'number') {
      return value.toFixed(2);
    } else if (value instanceof Date) {
      return value.toISOString();
    } else {
      return value.toString();
    }
  }
};

// Usage - TypeScript knows which overload applies
const numStr = formatter.format(42);      // TypeScript knows this returns string
const dateStr = formatter.format(new Date()); // TypeScript knows this returns string
const boolStr = formatter.format(true);   // TypeScript knows this returns string
```

> **Important Distinction** : The implementation signature (the one with union types) is not visible to consumers of the interface - they only see the specific overloads.

## Generic Method Signatures

Methods in interfaces can use generics for flexible, reusable contracts:

```typescript
interface Repository<T> {
  // Generic method - works with any type T
  findById<T>(id: string): Promise<T | null>;
  
  // Method using the interface's generic type
  save(entity: T): Promise<T>;
  
  // Method with its own generic parameter
  findByField<K extends keyof T>(field: K, value: T[K]): Promise<T[]>;
}

// Usage with specific type
interface User {
  id: string;
  name: string;
  email: string;
}

const userRepo: Repository<User> = {
  async findById<User>(id: string): Promise<User | null> {
    // Implementation would fetch user by ID
    return null; // Placeholder
  },
  
  async save(user: User): Promise<User> {
    // Implementation would save the user
    return user; // Placeholder
  },
  
  async findByField<K extends keyof User>(
    field: K, 
    value: User[K]
  ): Promise<User[]> {
    // Implementation would search by the specified field
    return []; // Placeholder
  }
};
```

## Compile-Time vs Runtime Behavior

This is a crucial concept that often confuses developers:

```typescript
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

// Compile time: TypeScript checks this contract
const logger: Logger = {
  log(message) {
    console.log(`[LOG] ${message}`);
  },
  error(message) {
    console.error(`[ERROR] ${message}`);
  }
};

// After compilation, the interface disappears:
// const logger = {
//   log(message) {
//     console.log(`[LOG] ${message}`);
//   },
//   error(message) {
//     console.error(`[ERROR] ${message}`);
//   }
// };
```

> **Critical Understanding** : Interface method signatures exist only at compile time for type checking. At runtime, you're working with plain JavaScript objects and functions.

## Interface Inheritance and Method Signatures

Interfaces can extend other interfaces, inheriting and potentially overriding method signatures:

```typescript
interface BaseService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

interface DatabaseService extends BaseService {
  // Inherits connect() and disconnect() from BaseService
  
  // Adds new method signatures
  query(sql: string): Promise<any[]>;
  transaction<T>(callback: () => Promise<T>): Promise<T>;
}

interface CachedDatabaseService extends DatabaseService {
  // Inherits all methods from DatabaseService and BaseService
  
  // Adds caching-specific methods
  clearCache(): void;
  getCacheStats(): CacheStats;
  
  // Can override inherited method signatures (must be compatible)
  query(sql: string, useCache?: boolean): Promise<any[]>;
}
```

The inheritance hierarchy looks like this:

```
BaseService
    ↓
DatabaseService  
    ↓
CachedDatabaseService

Methods flow down:
- connect(): Promise<void>
- disconnect(): Promise<void>  
- query(): Promise<any[]>
- transaction(): Promise<T>
- clearCache(): void
- getCacheStats(): CacheStats
```

## Common Gotchas and Best Practices

### Gotcha 1: Method vs Function Property Syntax

```typescript
interface EventHandler {
  // Method syntax - 'this' binding works normally
  handleClick(event: MouseEvent): void;
  
  // Function property syntax - 'this' binding may be different
  handleScroll: (event: ScrollEvent) => void;
}

class Component implements EventHandler {
  handleClick(event: MouseEvent) {
    console.log(this); // 'this' refers to Component instance
  }
  
  // Arrow function property - 'this' is lexically bound
  handleScroll = (event: ScrollEvent) => {
    console.log(this); // 'this' refers to Component instance
  };
}
```

> **Best Practice** : Use method syntax for most cases unless you specifically need arrow function behavior for `this` binding.

### Gotcha 2: Parameter Bivariance

```typescript
interface EventCallback {
  onEvent(event: MouseEvent): void;
}

// This is surprisingly valid due to method bivariance
const callback: EventCallback = {
  onEvent(event: Event) {  // Event is more general than MouseEvent
    // This works because methods are bivariant in parameters
    console.log(event.type);
  }
};
```

> **Understanding** : TypeScript allows method parameters to be contravariant (more general types accepted) for practical JavaScript compatibility.

### Best Practice: Precise Return Types

```typescript
// Less precise - returns any array
interface DataService {
  getUsers(): any[];
}

// More precise - returns specific type array
interface DataService {
  getUsers(): User[];
}

// Most precise - includes error handling
interface DataService {
  getUsers(): Promise<User[] | Error>;
}
```

Method signatures in interfaces are TypeScript's way of creating contracts that ensure objects behave consistently and predictably. They provide compile-time safety while producing clean JavaScript code, making your applications more robust and maintainable.
