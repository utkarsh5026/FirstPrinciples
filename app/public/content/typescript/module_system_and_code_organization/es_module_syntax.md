# ES Module Syntax in TypeScript: From First Principles

## The JavaScript Foundation: What Are ES Modules?

Before understanding TypeScript's ES Module syntax, we need to understand what ES Modules solve in JavaScript.

**JavaScript without modules:**

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

// No way to explicitly export these functions
// They become global variables (problematic!)
```

```javascript
// app.js
// Must include math.js via <script> tag first
// Functions are available globally (namespace pollution!)
const result = add(5, 3); // Works, but fragile
```

**Problems this creates:**

* **Global namespace pollution** : All functions become global
* **Dependency management** : Hard to track what depends on what
* **Load order issues** : Scripts must be loaded in the right order
* **No encapsulation** : Everything is public

## ES Modules: JavaScript's Solution

ES Modules (ES6 Modules) solve these problems by providing explicit import/export syntax:

```javascript
// math.js - ES Module version
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}
// Functions are NOT global - they're module-scoped
```

```javascript
// app.js - ES Module version
import { add, multiply } from './math.js';

const result = add(5, 3); // Clear dependency relationship
```

> **Key Mental Model** : ES Modules create explicit boundaries between code files. Nothing is shared unless explicitly exported and imported.

## TypeScript's Enhancement: Adding Type Information

TypeScript takes ES Modules and adds **static type checking** while preserving the same runtime behavior.

### Basic Export Patterns with Types

**1. Named Exports with Type Annotations**

```typescript
// math.ts - TypeScript version
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

// Export a constant with type inference
export const PI = 3.14159; // TypeScript infers: const PI: 3.14159

// Export a variable with explicit type
export let counter: number = 0;
```

**2. Export Types and Interfaces**

```typescript
// types.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export type Status = 'active' | 'inactive' | 'pending';

// Export a type alias
export type UserWithStatus = User & { status: Status };
```

> **Important Distinction** : Types and interfaces are TypeScript-only constructs. They exist at compile time but are completely removed at runtime.

**3. Export Classes with Type Information**

```typescript
// user.ts
export class UserManager {
  private users: User[] = [];

  // Method with typed parameters and return type
  addUser(user: User): void {
    this.users.push(user);
  }

  // Method with generic type parameter
  findById<T extends User>(id: number): T | undefined {
    return this.users.find(user => user.id === id) as T | undefined;
  }
}
```

### Import Patterns with Type Information

**1. Named Imports**

```typescript
// app.ts
import { add, multiply, PI } from './math.js';
//       ^    ^         ^
//   These are value imports (exist at runtime)

import { User, Status, UserWithStatus } from './types.js';
//       ^     ^       ^
//   These are type imports (compile-time only)

// TypeScript knows the types automatically
const result: number = add(5, 3); // ✅ TypeScript knows add returns number
const user: User = { id: 1, name: 'John', email: 'john@example.com' };
```

**2. Type-Only Imports (TypeScript 3.8+)**

```typescript
// Explicitly import only types (no runtime code)
import type { User, Status } from './types.js';
import type { UserManager } from './user.js';

// This creates a reference that exists only during compilation
let userInstance: UserManager; // ✅ Can use as type
// let manager = new UserManager(); // ❌ Error! Not imported as value
```

> **Key Concept** : `import type` tells TypeScript "I only need this for type checking, don't include it in the compiled JavaScript."

**3. Mixed Value and Type Imports**

```typescript
// Import both values and types from the same module
import { UserManager, type User, type Status } from './user.js';
//       ^            ^          ^
//    value import  type import  type import

const manager = new UserManager(); // ✅ Can instantiate (value import)
let user: User; // ✅ Can use as type (type import)
```

### Default Exports with TypeScript

**JavaScript default export:**

```javascript
// calculator.js
export default function calculate(operation, a, b) {
  // implementation
}
```

**TypeScript enhanced default export:**

```typescript
// calculator.ts
type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

export default function calculate(
  operation: Operation, 
  a: number, 
  b: number
): number {
  switch (operation) {
    case 'add': return a + b;
    case 'subtract': return a - b;
    case 'multiply': return a * b;
    case 'divide': return a / b;
    default:
      // TypeScript ensures all cases are handled
      const exhaustive: never = operation;
      throw new Error(`Unknown operation: ${exhaustive}`);
  }
}

// Also export the type for use by consumers
export type { Operation };
```

**Importing default exports:**

```typescript
// app.ts
import calculate, { type Operation } from './calculator.js';
//     ^                ^
//  default import    named type import

const result: number = calculate('add', 5, 3);
const op: Operation = 'multiply'; // Type is available
```

### Advanced Export Patterns

**1. Re-exports (Module Aggregation)**

```typescript
// index.ts - Barrel export pattern
export { add, multiply, PI } from './math.js';
export { UserManager, type User, type Status } from './user.js';
export { default as calculate, type Operation } from './calculator.js';

// Now consumers can import everything from one place:
// import { add, UserManager, calculate } from './index.js';
```

**2. Namespace Exports**

```typescript
// utils.ts
export namespace StringUtils {
  export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  export function reverse(str: string): string {
    return str.split('').reverse().join('');
  }
}

export namespace NumberUtils {
  export function isEven(num: number): boolean {
    return num % 2 === 0;
  }
}
```

```typescript
// app.ts
import { StringUtils, NumberUtils } from './utils.js';

const capitalized = StringUtils.capitalize('hello'); // ✅
const even = NumberUtils.isEven(4); // ✅
```

### The Compilation Process: Types vs Values

Here's what happens when TypeScript compiles your modules:

```
TypeScript Source          Compilation          JavaScript Output
┌─────────────────────┐         │         ┌─────────────────────┐
│ // math.ts          │         │         │ // math.js          │
│ export function add │         │         │ export function add │
│ (a: number, b: num  │   ────▶ │   ────▶ │ (a, b) {            │
│ ber): number {      │         │         │   return a + b;     │
│   return a + b;     │         │         │ }                   │
│ }                   │         │         │                     │
│                     │         │         │ // Types removed!   │
│ export type MathOp  │         │         │                     │
│ = 'add' | 'sub';    │         │         │                     │
└─────────────────────┘         │         └─────────────────────┘
```

> **Critical Understanding** : Type information exists only during compilation. The final JavaScript contains no TypeScript-specific syntax.

### Import Resolution and File Extensions

**TypeScript's module resolution:**

```typescript
// These imports work in TypeScript:
import { add } from './math';        // ✅ Resolves to math.ts
import { add } from './math.ts';     // ✅ Explicit extension
import { add } from './math.js';     // ✅ Points to math.ts in TS context
```

**But the compiled JavaScript needs proper extensions:**

```typescript
// TypeScript source
import { add } from './math.js'; // Use .js extension even for .ts files

// Compiles to JavaScript
import { add } from './math.js'; // Now correctly points to math.js
```

> **Best Practice** : In TypeScript projects using ES Modules, import from `.js` files even when the source is `.ts`. TypeScript understands this mapping.

### Common Gotchas and Solutions

**1. Circular Dependencies**

```typescript
// user.ts
import { validateEmail } from './validation.js';

export class User {
  constructor(public email: string) {
    if (!validateEmail(email)) {
      throw new Error('Invalid email');
    }
  }
}
```

```typescript
// validation.ts
import { User } from './user.js'; // ❌ Circular dependency!

export function validateEmail(email: string): boolean {
  // Should not depend on User class
  return email.includes('@');
}
```

**Solution: Extract shared types**

```typescript
// types.ts
export interface UserData {
  email: string;
}
```

```typescript
// validation.ts
import type { UserData } from './types.js';

export function validateEmail(email: string): boolean {
  return email.includes('@');
}

export function validateUser(userData: UserData): boolean {
  return validateEmail(userData.email);
}
```

**2. Type-Only vs Value Imports Confusion**

```typescript
// Wrong: Importing class as type-only
import type { UserManager } from './user.js';

const manager = new UserManager(); // ❌ Error: Cannot use type-only import
```

```typescript
// Correct: Import class as value
import { UserManager } from './user.js';

const manager = new UserManager(); // ✅ Works
```

**3. Mixed Default and Named Exports**

```typescript
// module.ts
export default class Calculator {
  add(a: number, b: number) { return a + b; }
}

export const PI = 3.14159;
export type Operation = 'add' | 'subtract';
```

```typescript
// app.ts
import Calculator, { PI, type Operation } from './module.js';
//     ^           ^    ^
//  default      named  type-only named

const calc = new Calculator();
const result = calc.add(1, 2);
const operation: Operation = 'add';
```

### Real-World Example: Building a User Management System

Let's put it all together with a complete example:

```typescript
// types/user.ts
export interface User {
  readonly id: number;
  name: string;
  email: string;
  createdAt: Date;
}

export type UserCreateData = Omit<User, 'id' | 'createdAt'>;
export type UserUpdateData = Partial<Pick<User, 'name' | 'email'>>;
```

```typescript
// services/user-service.ts
import type { User, UserCreateData, UserUpdateData } from '../types/user.js';

export class UserService {
  private users: User[] = [];
  private nextId = 1;

  createUser(data: UserCreateData): User {
    const user: User = {
      id: this.nextId++,
      ...data,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  updateUser(id: number, updates: UserUpdateData): User | null {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
  
    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  findById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }
}
```

```typescript
// index.ts - Barrel export
export { UserService } from './services/user-service.js';
export type { User, UserCreateData, UserUpdateData } from './types/user.js';
```

```typescript
// app.ts
import { UserService, type User, type UserCreateData } from './index.js';

const userService = new UserService();

const newUser: UserCreateData = {
  name: 'John Doe',
  email: 'john@example.com'
};

const createdUser: User = userService.createUser(newUser);
console.log('Created user:', createdUser);
```

This demonstrates the power of TypeScript's ES Module system:  **static type safety with clean module boundaries** , all while compiling to standard JavaScript that runs anywhere ES Modules are supported.
