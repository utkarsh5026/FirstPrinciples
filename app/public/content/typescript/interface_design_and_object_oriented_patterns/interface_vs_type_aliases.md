# Interface vs Type Aliases: From First Principles

## JavaScript Foundation: Object Shapes and Contracts

Before TypeScript, JavaScript developers had to rely on conventions and documentation to describe what properties an object should have:

```javascript
// JavaScript: We can only hope objects have the right shape
function greetUser(user) {
  // We assume 'user' has name and email, but JavaScript won't check
  return `Hello ${user.name}, email sent to ${user.email}`;
}

// These both work at runtime, but one will cause issues
greetUser({ name: "Alice", email: "alice@example.com" }); // ✓ Works
greetUser({ firstName: "Bob" }); // ✗ Runtime error: undefined email
```

 **The core problem** : JavaScript has no built-in way to enforce that objects match a specific "shape" or structure.

## TypeScript's Solution: Describing Object Shapes

TypeScript solves this by allowing us to describe the expected shape of objects at compile time:

```typescript
// TypeScript: We can describe what shape we expect
function greetUser(user: { name: string; email: string }) {
  return `Hello ${user.name}, email sent to ${user.email}`;
}

// Now TypeScript catches mismatches before runtime
greetUser({ name: "Alice", email: "alice@example.com" }); // ✓ Works
greetUser({ firstName: "Bob" }); 
// ✗ TypeScript Error: Object literal may only specify known properties
```

But writing `{ name: string; email: string }` everywhere gets repetitive. TypeScript gives us two main ways to name and reuse these object shape descriptions: **interfaces** and  **type aliases** .

## Interfaces: The "Contract" Approach

An interface defines a contract - a description of what properties and methods an object must have:

```typescript
// Interface: Defining a contract for user objects
interface User {
  name: string;
  email: string;
  age?: number; // Optional property
}

// Now we can reuse this contract
function greetUser(user: User) {
  return `Hello ${user.name}`;
}

function sendEmail(user: User) {
  // TypeScript knows user.email exists
  console.log(`Sending to ${user.email}`);
}
```

> **Key Mental Model** : Interfaces describe the *shape* an object must have to fulfill a contract. They're like a blueprint that says "any object that has these properties can be used here."

## Type Aliases: The "Name" Approach

A type alias creates a new name for an existing type:

```typescript
// Type alias: Creating a name for a type
type User = {
  name: string;
  email: string;
  age?: number;
};

// Usage looks identical to interfaces
function greetUser(user: User) {
  return `Hello ${user.name}`;
}
```

> **Key Mental Model** : Type aliases are like variables for types. They let you create a shorthand name for any type expression, not just object shapes.

## The Compilation Process: What Happens to These Definitions

```
TypeScript Compile Time:
┌─────────────────┐
│ interface User  │ ──┐
│ {               │   │ Used for type checking
│   name: string  │   │ and IntelliSense
│ }               │   │
└─────────────────┘   │
                      ▼
┌─────────────────┐   ┌─────────────────┐
│ type User = {   │──▶│ Type Checker    │
│   name: string  │   │ validates code  │
│ }               │   └─────────────────┘
└─────────────────┘           │
                              ▼
JavaScript Runtime:           ┌─────────────────┐
┌─────────────────┐          │ Pure JavaScript │
│ // No interfaces │◀─────────│ (types erased)  │
│ // No type alias │          └─────────────────┘
│ function greet() │
│ { ... }         │
└─────────────────┘
```

> **Critical Understanding** : Both interfaces and type aliases exist only at compile time. They're completely erased from the final JavaScript code.

## Surface-Level Similarities

For basic object typing, interfaces and type aliases appear nearly identical:

```typescript
// These are functionally equivalent for basic use
interface UserInterface {
  name: string;
  email: string;
}

type UserType = {
  name: string;
  email: string;
};

// Both work the same way in function parameters
function processInterface(user: UserInterface) { /* ... */ }
function processType(user: UserType) { /* ... */ }
```

## Deep Dive: The Fundamental Differences

### 1. Declaration Merging vs Immutability

**Interfaces support declaration merging** - you can declare the same interface multiple times and TypeScript merges them:

```typescript
// Interface: Can be extended across multiple declarations
interface User {
  name: string;
}

interface User {
  email: string; // Merged with the previous declaration
}

// Now User has both name and email
const user: User = {
  name: "Alice",
  email: "alice@example.com" // Both required
};
```

**Type aliases are immutable** - once declared, they cannot be redeclared:

```typescript
type User = {
  name: string;
};

type User = {  // ✗ Error: Duplicate identifier 'User'
  email: string;
};
```

> **Why this matters** : Declaration merging is useful for extending third-party library types or creating modular type definitions that can be augmented.

### 2. Extends vs Intersection Types

 **Interfaces use `extends` for inheritance** :

```typescript
interface BaseUser {
  name: string;
}

interface AdminUser extends BaseUser {
  permissions: string[];
  // AdminUser now has: name (from BaseUser) + permissions
}
```

 **Type aliases use intersection types (`&`)** :

```typescript
type BaseUser = {
  name: string;
};

type AdminUser = BaseUser & {
  permissions: string[];
  // AdminUser now has: name (from BaseUser) + permissions
};
```

### 3. Type Alias Flexibility vs Interface Constraints

 **Type aliases can represent ANY type** :

```typescript
// Type aliases can be primitives
type ID = string | number;

// They can be unions
type Status = "pending" | "approved" | "rejected";

// They can be function types
type EventHandler = (event: Event) => void;

// They can be complex mapped types
type ReadOnly<T> = {
  readonly [K in keyof T]: T[K];
};
```

 **Interfaces can ONLY describe object shapes** :

```typescript
// Interfaces are limited to object-like structures
interface UserConfig {
  theme: string;
  language: string;
}

// This won't work:
interface ID extends string {}  // ✗ Error: cannot extend primitive
interface Status {              // ✗ Error: cannot define union with interface
  "pending" | "approved"
}
```

### 4. Error Messages and Developer Experience

The type checker treats these differently in error messages:

```typescript
interface UserInterface {
  name: string;
  age: number;
}

type UserType = {
  name: string;
  age: number;
};

// When there's an error, interfaces often give cleaner messages
const badInterface: UserInterface = { name: "Alice" }; 
// Error: Property 'age' is missing in type '{ name: string; }' 
//        but required in type 'UserInterface'.

const badType: UserType = { name: "Alice" };
// Error: Property 'age' is missing in type '{ name: string; }' 
//        but required in type '{ name: string; age: number; }'.
```

> **Developer Experience** : Interfaces typically provide more readable error messages because they reference the interface name rather than expanding the entire type structure.

## Advanced Differences: Mapped Types and Conditional Logic

 **Type aliases excel at complex type transformations** :

```typescript
// Type aliases can use advanced TypeScript features
type PartialUser<T> = {
  [K in keyof T]?: T[K];  // Makes all properties optional
};

type UserKeys = keyof User;  // "name" | "email" | "age"

// Conditional types (only work with type aliases)
type NonNullable<T> = T extends null | undefined ? never : T;
```

 **Interfaces are more limited but clearer for object contracts** :

```typescript
// Interfaces are straightforward - what you see is what you get
interface DatabaseUser extends User {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces can describe function signatures clearly
interface EventHandler {
  (event: MouseEvent): void;
  (event: KeyboardEvent): void;  // Function overloads
}
```

## When to Use Each: Decision Framework

```
Object Shape Description Needed?
│
├── YES: Describing the structure of objects/classes
│   │
│   ├── Might need extension by others? ──YES──▶ Use Interface
│   │   (libraries, APIs, shared contracts)
│   │
│   └── Internal/private use only? ──YES──▶ Either works
│       (lean toward Interface for consistency)
│
└── NO: Unions, primitives, complex transformations
    │
    └── Use Type Alias
```

### Use Interfaces When:

```typescript
// 1. Defining public APIs or contracts
interface ApiResponse {
  data: any;
  status: number;
  message: string;
}

// 2. Object-oriented patterns with classes
interface Drawable {
  draw(): void;
}

class Circle implements Drawable {
  draw() { /* ... */ }
}

// 3. When you might need declaration merging
interface Window {
  myCustomProperty: string;  // Extending built-in types
}
```

### Use Type Aliases When:

```typescript
// 1. Union types
type Theme = "light" | "dark" | "auto";

// 2. Primitive aliases
type UserId = string;
type Timestamp = number;

// 3. Complex type transformations
type ApiKeys<T> = {
  [K in keyof T as `api_${string & K}`]: T[K];
};

// 4. Function type definitions
type AsyncHandler<T> = (data: T) => Promise<void>;
```

## Common Gotchas and Mental Traps

> **Gotcha 1** : Interface merging can be surprising

```typescript
// This might merge unexpectedly if 'User' is declared elsewhere
interface User {
  newProperty: string;
}
// Solution: Use type alias if you want to prevent merging
```

> **Gotcha 2** : Type aliases can create circular references

```typescript
type BadRecursive = {
  self: BadRecursive;  // ✗ Can cause infinite loops in some cases
};
// Solution: Use interfaces for recursive types when possible
```

> **Gotcha 3** : Extending with conflicting properties

```typescript
interface A { prop: string; }
interface B { prop: number; }
interface C extends A, B {}  // ✗ Error: conflicting types for 'prop'

// Type aliases handle this differently:
type C = A & B;  // prop becomes 'never' (impossible type)
```

## Best Practices Summary

> **The Interface-First Rule** : Start with interfaces for object shapes. Only switch to type aliases when you need features that interfaces can't provide (unions, mapped types, etc.).

> **Consistency Principle** : Within a single codebase, prefer one approach for similar use cases. Don't mix interfaces and type aliases arbitrarily for the same kinds of type definitions.

> **Public API Guideline** : Always use interfaces for public APIs, library exports, and contracts that other developers will implement or extend.

The choice between interfaces and type aliases often comes down to intent: interfaces are for contracts and shapes, type aliases are for creating names for any type expression. Understanding this fundamental difference will guide you to make the right choice in any situation.
