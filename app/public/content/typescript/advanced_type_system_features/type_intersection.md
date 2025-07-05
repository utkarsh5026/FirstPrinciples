# TypeScript Type Intersection (`&`): Combining Types from First Principles

## JavaScript Foundation: Object Composition

Before understanding TypeScript intersections, let's explore how JavaScript naturally combines objects:

```javascript
// JavaScript: Combining objects manually
const person = { name: "Alice", age: 30 };
const employee = { id: 123, department: "Engineering" };

// Method 1: Object spread (creates new object)
const personEmployee = { ...person, ...employee };
console.log(personEmployee);
// Output: { name: "Alice", age: 30, id: 123, department: "Engineering" }

// Method 2: Object.assign (modifies target)
const combined = Object.assign({}, person, employee);
```

JavaScript gives us *runtime* object composition, but no *compile-time* guarantees about what properties exist.

## What TypeScript Intersection Means

TypeScript's intersection operator (`&`) creates a **compile-time contract** that says "this value must have ALL properties from ALL combined types."

```
Intersection: Type A & Type B
├── Must have ALL properties from Type A
└── Must have ALL properties from Type B
```

> **Key Mental Model** : Intersection = "AND" logic
> A value of type `A & B` must satisfy BOTH type A AND type B completely.

## Basic Intersection Syntax

```typescript
// Define individual types
type Person = {
  name: string;
  age: number;
};

type Employee = {
  id: number;
  department: string;
};

// Create intersection type
type PersonEmployee = Person & Employee;

// This type now REQUIRES all properties from both:
// - name: string (from Person)
// - age: number (from Person) 
// - id: number (from Employee)
// - department: string (from Employee)

// ✅ Valid: Has all required properties
const worker: PersonEmployee = {
  name: "Alice",
  age: 30,
  id: 123,
  department: "Engineering"
};

// ❌ TypeScript Error: Missing 'department' property
const incomplete: PersonEmployee = {
  name: "Bob",
  age: 25,
  id: 456
  // Error: Property 'department' is missing
};
```

## Intersection vs Union: Critical Difference

Many developers confuse intersection (`&`) with union (`|`). Let's clarify:

```typescript
type A = { x: number };
type B = { y: string };

// INTERSECTION (&): Must have BOTH x AND y
type Intersection = A & B;
// Equivalent to: { x: number; y: string }

// UNION (|): Must have EITHER x OR y (or both)
type Union = A | B;
// Can be: { x: number } OR { y: string } OR { x: number; y: string }

// Examples:
const intersectionValue: Intersection = { x: 1, y: "hello" }; // ✅ Must have both
const unionValue1: Union = { x: 1 };                         // ✅ Just x is fine
const unionValue2: Union = { y: "hello" };                   // ✅ Just y is fine  
const unionValue3: Union = { x: 1, y: "hello" };            // ✅ Both also fine
```

> **Remember** :
>
> * Intersection (`&`) = "AND" - stricter, requires more properties
> * Union (`|`) = "OR" - more flexible, allows fewer properties

## Progressive Complexity: Function Type Intersections

Intersection isn't just for objects - it works with any types:

```typescript
// Function type intersection
type Logger = (message: string) => void;
type Formatter = (data: any) => string;

// This intersection is impossible to implement!
type LoggerFormatter = Logger & Formatter;
// A function can't simultaneously return void AND string

// More practical: Intersecting function with object
type FunctionWithMetadata = {
  (input: string): number;  // Call signature
  version: string;          // Property
  author: string;          // Property
};

// Implementation
const parseWithMeta: FunctionWithMetadata = ((input: string): number => {
  return parseInt(input);
}) as FunctionWithMetadata;

parseWithMeta.version = "1.0.0";
parseWithMeta.author = "Alice";

// Usage
const result = parseWithMeta("123");  // Call as function: returns 123
console.log(parseWithMeta.version);   // Access property: "1.0.0"
```

## Complex Intersection Patterns

### 1. Multiple Type Intersection

```typescript
type User = { name: string; email: string };
type Admin = { permissions: string[] };
type Timestamped = { createdAt: Date; updatedAt: Date };

// Combine all three types
type AdminUser = User & Admin & Timestamped;

const admin: AdminUser = {
  name: "Super Admin",
  email: "admin@company.com", 
  permissions: ["read", "write", "delete"],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-15")
};
```

### 2. Intersection with Index Signatures

```typescript
type StringRecord = { [key: string]: string };
type SpecificProps = { id: number; name: string };

type MixedType = StringRecord & SpecificProps;

const example: MixedType = {
  id: 123,           // From SpecificProps (must be number)
  name: "Test",      // From SpecificProps (must be string)  
  custom1: "value1", // From StringRecord (must be string)
  custom2: "value2"  // From StringRecord (must be string)
};

// ❌ Error: 'id' must be number (from SpecificProps)
// even though StringRecord allows string values
const invalid: MixedType = {
  id: "123",  // Error: Type 'string' is not assignable to type 'number'
  name: "Test"
};
```

## Real-World Use Cases

### 1. Mixin Pattern

```typescript
// Base functionality
type CanWalk = {
  walk(): void;
};

type CanFly = {
  fly(): void;
};

type CanSwim = {
  swim(): void;
};

// Create specific animal types
type Duck = CanWalk & CanFly & CanSwim;
type Fish = CanSwim;
type Bird = CanWalk & CanFly;

// Implementation
const duck: Duck = {
  walk() { console.log("Duck walking"); },
  fly() { console.log("Duck flying"); },
  swim() { console.log("Duck swimming"); }
};
```

### 2. Configuration Merging

```typescript
type BaseConfig = {
  apiUrl: string;
  timeout: number;
};

type DatabaseConfig = {
  dbHost: string;
  dbPort: number;
};

type LoggingConfig = {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logFile: string;
};

// Application needs all configurations
type AppConfig = BaseConfig & DatabaseConfig & LoggingConfig;

const config: AppConfig = {
  // Base
  apiUrl: "https://api.example.com",
  timeout: 5000,
  // Database  
  dbHost: "localhost",
  dbPort: 5432,
  // Logging
  logLevel: "info",
  logFile: "/var/log/app.log"
};
```

## Type Intersection Visualization

```
Original Types:
┌─────────────┐    ┌─────────────┐
│   Person    │    │  Employee   │
├─────────────┤    ├─────────────┤
│ name: string│    │ id: number  │
│ age: number │    │ dept: string│
└─────────────┘    └─────────────┘

Intersection (Person & Employee):
┌─────────────────────────────────┐
│        PersonEmployee           │
├─────────────────────────────────┤
│ name: string    (from Person)   │
│ age: number     (from Person)   │
│ id: number      (from Employee) │
│ dept: string    (from Employee) │
└─────────────────────────────────┘
```

## Common Gotchas and Limitations

### 1. Impossible Intersections

```typescript
// ❌ Impossible: A property can't be both string AND number
type Impossible = { id: string } & { id: number };
// Results in: { id: never }

const test: Impossible = {
  id: ??? // No value can satisfy both string AND number
};
```

### 2. Intersection with Primitives

```typescript
// ❌ Meaningless: string & number = never
type StringAndNumber = string & number; // never

// ✅ More useful: Branded types
type UserId = string & { readonly brand: unique symbol };
type ProductId = string & { readonly brand: unique symbol };

// These are both strings at runtime, but different types at compile time
declare const userId: UserId;
declare const productId: ProductId;

// ❌ Error: Can't assign one to the other
// const id: UserId = productId; // Error!
```

### 3. Method Signature Conflicts

```typescript
type A = { 
  process(input: string): number; 
};

type B = { 
  process(input: number): string; 
};

// The intersection creates an overloaded method
type AB = A & B;

const handler: AB = {
  // Must implement ALL signatures
  process(input: string | number): number | string {
    if (typeof input === 'string') {
      return parseInt(input);  // string -> number
    } else {
      return input.toString(); // number -> string  
    }
  }
};
```

## Best Practices

> **✅ DO** : Use intersection for composing related functionality
>
> ```typescript
> type UserActions = CanCreate & CanRead & CanUpdate;
> ```

> **✅ DO** : Use intersection for configuration merging
>
> ```typescript
> type Config = BaseConfig & FeatureConfig & EnvConfig;
> ```

> **❌ DON'T** : Create impossible intersections
>
> ```typescript
> type Bad = { id: string } & { id: number }; // Results in never
> ```

> **❌ DON'T** : Overuse intersection when simple interfaces work
>
> ```typescript
> // Instead of this:
> type User = Name & Email & Age;
>
> // Consider this:
> interface User { name: string; email: string; age: number; }
> ```

## Compilation Process

```
TypeScript Intersection Checking:
┌─────────────────┐
│   Source Code   │
│   A & B & C     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Type Checker    │
│ Validates ALL   │
│ properties      │
│ exist on value  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ JavaScript      │
│ (types erased)  │
│ Regular object  │
└─────────────────┘
```

> **Runtime Reality** : At runtime, intersections are just regular JavaScript objects. The type checking happens only at compile time.

Type intersection with `&` is TypeScript's way of saying "I need ALL of these characteristics together." It's perfect for composition patterns, configuration merging, and creating rich type definitions that combine multiple concerns into a single, strongly-typed contract.
