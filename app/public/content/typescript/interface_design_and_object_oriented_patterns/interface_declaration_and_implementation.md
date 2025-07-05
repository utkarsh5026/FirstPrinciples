# TypeScript Interfaces: From JavaScript Contracts to Type Safety

## The JavaScript Foundation: Object Shapes and Implicit Contracts

In JavaScript, we constantly work with objects that have expected "shapes" - sets of properties and methods that code assumes will exist:

```javascript
// JavaScript - implicit contract
function processUser(user) {
  // We expect 'user' to have name, email, and age properties
  console.log(`Processing ${user.name} (${user.email}), age ${user.age}`);
  
  // What if user doesn't have these properties? 
  // Runtime error or undefined behavior!
}

// These work fine
processUser({ name: "Alice", email: "alice@example.com", age: 30 });

// But this causes problems at runtime
processUser({ username: "Bob" }); // TypeError or unexpected behavior
```

**The core problem:** JavaScript has no way to enforce or document what properties an object should have. We rely on documentation, conventions, and hope.

> **Key Insight:** Interfaces solve the fundamental problem of defining and enforcing object contracts in a type-safe way, catching mismatches at compile time rather than runtime.

## What TypeScript Interfaces Are (And Aren't)

```
Compile Time           Runtime
┌─────────────┐       ┌─────────────┐
│ Interface   │ ────→ │ Nothing!    │
│ Definition  │       │ (erased)    │
└─────────────┘       └─────────────┘
     │
     ▼
┌─────────────┐
│ Type        │
│ Checking    │
└─────────────┘
```

**Interfaces are purely a TypeScript construct** - they exist only during compilation to provide type checking, then disappear completely from the JavaScript output.

## Basic Interface Declaration

Let's transform our JavaScript example into TypeScript with an interface:

```typescript
// TypeScript - explicit contract
interface User {
  name: string;    // Property with type annotation
  email: string;   // Each property must specify its type
  age: number;     // Semicolon or comma separation (both work)
}

// Now our function has a type-safe contract
function processUser(user: User) {
  // TypeScript guarantees these properties exist with correct types
  console.log(`Processing ${user.name} (${user.email}), age ${user.age}`);
}

// ✅ This works - object matches interface shape
processUser({ 
  name: "Alice", 
  email: "alice@example.com", 
  age: 30 
});

// ❌ Compile-time error - missing properties
processUser({ 
  username: "Bob" 
}); 
// Error: Argument of type '{ username: string; }' is not assignable to parameter of type 'User'.
//        Property 'name' is missing in type '{ username: string; }' but required in type 'User'.
```

> **Interface Rule #1:** An object must have **all** required properties with **matching types** to satisfy an interface.

## Object Implementation of Interfaces

Interfaces define contracts that objects can implement. Here's how the type checking works:

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
}

// ✅ Valid implementation - has all required properties
const laptop: Product = {
  id: 1,
  name: "MacBook Pro",
  price: 2499
};

// ✅ Extra properties are allowed (excess property checking has nuances)
const book: Product = {
  id: 2,
  name: "TypeScript Handbook",
  price: 29.99,
  author: "Microsoft" // Extra property is fine here
};

// ❌ Missing required property
const invalidProduct: Product = {
  id: 3,
  name: "Incomplete Product"
  // Missing 'price' property
};
// Error: Property 'price' is missing in type '{ id: number; name: string; }' but required in type 'Product'.

// ❌ Wrong type
const wrongType: Product = {
  id: "4",        // Should be number, not string
  name: "Wrong",
  price: 99
};
// Error: Type 'string' is not assignable to type 'number'.
```

### Excess Property Checking Gotcha

```typescript
interface Config {
  host: string;
  port: number;
}

// ❌ Direct assignment with excess properties fails
const config1: Config = {
  host: "localhost",
  port: 3000,
  debug: true  // Error: Object literal may only specify known properties
};

// ✅ But this works (assigned to variable first)
const tempConfig = {
  host: "localhost",
  port: 3000,
  debug: true
};
const config2: Config = tempConfig; // No error!
```

> **Excess Property Rule:** TypeScript is stricter with object literals assigned directly to interface types, but more permissive with variables that happen to have extra properties.

## Class Implementation of Interfaces

Classes can implement interfaces using the `implements` keyword, creating a formal contract:

```typescript
interface Drawable {
  x: number;
  y: number;
  draw(): void;        // Method signature
  getArea(): number;   // Must return a number
}

// ✅ Class implementing interface
class Circle implements Drawable {
  constructor(
    public x: number,      // Must have x coordinate
    public y: number,      // Must have y coordinate  
    private radius: number // Private properties are fine
  ) {}

  // Must implement all interface methods
  draw(): void {
    console.log(`Drawing circle at (${this.x}, ${this.y})`);
  }

  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }

  // Additional methods/properties are allowed
  getRadius(): number {
    return this.radius;
  }
}

// ❌ Incomplete implementation
class Rectangle implements Drawable {
  constructor(public x: number, public y: number) {}
  
  draw(): void {
    console.log(`Drawing rectangle at (${this.x}, ${this.y})`);
  }
  
  // Missing getArea() method!
}
// Error: Class 'Rectangle' incorrectly implements interface 'Drawable'.
//        Property 'getArea' is missing in type 'Rectangle' but required in type 'Drawable'.
```

### Multiple Interface Implementation

```typescript
interface Movable {
  move(dx: number, dy: number): void;
}

interface Resizable {
  resize(factor: number): void;
}

// Class can implement multiple interfaces
class InteractiveShape implements Drawable, Movable, Resizable {
  constructor(public x: number, public y: number, private size: number) {}

  // From Drawable
  draw(): void { console.log("Drawing shape"); }
  getArea(): number { return this.size * this.size; }

  // From Movable  
  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  // From Resizable
  resize(factor: number): void {
    this.size *= factor;
  }
}
```

## Advanced Interface Features

### Optional Properties

```typescript
interface UserProfile {
  id: number;           // Required
  username: string;     // Required
  email?: string;       // Optional (notice the ?)
  avatar?: string;      // Optional
}

// ✅ Valid - optional properties can be omitted
const user1: UserProfile = {
  id: 1,
  username: "alice"
  // email and avatar are optional
};

// ✅ Valid - optional properties can be provided
const user2: UserProfile = {
  id: 2,
  username: "bob",
  email: "bob@example.com"
  // avatar still omitted
};

function updateProfile(profile: UserProfile) {
  // Must check optional properties before use
  if (profile.email) {
    console.log(`Email: ${profile.email}`);
  }
  
  // Or use optional chaining
  console.log(`Avatar: ${profile.avatar ?? "default.png"}`);
}
```

### Readonly Properties

```typescript
interface Configuration {
  readonly apiKey: string;     // Cannot be modified after creation
  readonly version: number;    // Read-only
  timeout: number;             // Mutable
}

const config: Configuration = {
  apiKey: "secret-key",
  version: 1,
  timeout: 5000
};

// ✅ Allowed - modifying mutable property
config.timeout = 10000;

// ❌ Error - cannot modify readonly property
config.apiKey = "new-key";
// Error: Cannot assign to 'apiKey' because it is a read-only property.

config.version = 2;
// Error: Cannot assign to 'version' because it is a read-only property.
```

### Method Signatures

```typescript
interface Calculator {
  // Method with parameters and return type
  add(a: number, b: number): number;
  
  // Method with optional parameter
  multiply(a: number, b?: number): number;
  
  // Method with rest parameters
  sum(...numbers: number[]): number;
  
  // Property that holds a function
  divide: (a: number, b: number) => number;
}

class BasicCalculator implements Calculator {
  add(a: number, b: number): number {
    return a + b;
  }

  multiply(a: number, b: number = 1): number {
    return a * b;
  }

  sum(...numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
  }

  // Property assigned a function
  divide = (a: number, b: number): number => {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  };
}
```

## Interface Inheritance and Composition

### Interface Extending Interface

```typescript
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;        // Inherits name and age from Animal
  bark(): void;         // Adds new method
}

interface WorkingDog extends Dog {
  job: string;          // Inherits everything from Dog (and Animal)
  work(): void;         // Adds another method
}

// Must satisfy all inherited properties and methods
const policeDog: WorkingDog = {
  name: "Rex",           // From Animal
  age: 5,                // From Animal  
  breed: "German Shepherd", // From Dog
  job: "Police K9",      // From WorkingDog
  bark() { console.log("Woof!"); },      // From Dog
  work() { console.log("Patrolling..."); } // From WorkingDog
};
```

### Multiple Interface Inheritance

```typescript
interface Flyable {
  fly(): void;
  altitude: number;
}

interface Swimmable {
  swim(): void;
  depth: number;
}

// Interface can extend multiple interfaces
interface Duck extends Animal, Flyable, Swimmable {
  quack(): void;
}

class MallardDuck implements Duck {
  constructor(
    public name: string,
    public age: number,
    public altitude: number = 0,
    public depth: number = 0
  ) {}

  // From Animal (via Duck)
  // name and age provided by constructor

  // From Flyable (via Duck)
  fly(): void {
    this.altitude = 100;
    console.log(`${this.name} is flying at ${this.altitude}ft`);
  }

  // From Swimmable (via Duck)  
  swim(): void {
    this.depth = 5;
    console.log(`${this.name} is swimming at ${this.depth}ft deep`);
  }

  // From Duck
  quack(): void {
    console.log(`${this.name} says quack!`);
  }
}
```

## Interface vs Type Aliases vs Classes

```typescript
// Interface - best for object contracts
interface UserInterface {
  name: string;
  email: string;
}

// Type alias - more flexible, can represent any type
type UserType = {
  name: string;
  email: string;
};

// Class - creates both type and runtime value
class UserClass {
  constructor(
    public name: string, 
    public email: string
  ) {}
}

// All three can be used similarly for object typing
function processUser1(user: UserInterface) { /* ... */ }
function processUser2(user: UserType) { /* ... */ }  
function processUser3(user: UserClass) { /* ... */ }

// But key differences:
// 1. Interfaces can be extended and implemented
interface ExtendedUser extends UserInterface {
  age: number;
}

// 2. Type aliases can represent unions, primitives, etc.
type Status = "pending" | "approved" | "rejected";
type ID = string | number;

// 3. Classes create actual JavaScript constructors
const userInstance = new UserClass("Alice", "alice@example.com");
// const interfaceInstance = new UserInterface(); // ❌ Error!
```

> **When to use interfaces:** For defining object contracts that classes will implement or when you need inheritance. Prefer interfaces for object types in most cases.

## Common Patterns and Best Practices

### Generic Interfaces

```typescript
// Interface that works with different types
interface Repository<T> {
  findById(id: string): T | null;
  save(item: T): void;
  delete(id: string): boolean;
}

// Specific implementations
class UserRepository implements Repository<UserInterface> {
  private users: UserInterface[] = [];

  findById(id: string): UserInterface | null {
    return this.users.find(user => user.email === id) || null;
  }

  save(user: UserInterface): void {
    this.users.push(user);
  }

  delete(id: string): boolean {
    const index = this.users.findIndex(user => user.email === id);
    if (index > -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}
```

### Index Signatures

```typescript
interface StringDictionary {
  [key: string]: string;  // Any string key maps to string value
}

interface MixedDictionary {
  name: string;            // Specific required property
  age: number;             // Another specific property  
  [key: string]: any;      // Additional properties of any type
}

const dict1: StringDictionary = {
  hello: "world",
  foo: "bar"
  // All values must be strings
};

const dict2: MixedDictionary = {
  name: "Alice",           // Required
  age: 30,                 // Required
  city: "New York",        // Additional string property
  active: true,            // Additional boolean property
  metadata: { id: 123 }    // Additional object property
};
```

## Common Gotchas and Debugging

### Interface vs Implementation Mismatch

```typescript
interface EventHandler {
  handleClick(event: MouseEvent): void;
}

// ❌ Wrong parameter type
class ButtonHandler implements EventHandler {
  handleClick(event: Event): void {  // Should be MouseEvent, not Event
    console.log("Clicked");
  }
}
// Error: Class 'ButtonHandler' incorrectly implements interface 'EventHandler'.
//        Types of parameters 'event' differ between these signatures.

// ✅ Correct implementation
class CorrectButtonHandler implements EventHandler {
  handleClick(event: MouseEvent): void {
    console.log(`Clicked at ${event.clientX}, ${event.clientY}`);
  }
}
```

### Interface Merging (Declaration Merging)

```typescript
// First declaration
interface Window {
  myCustomProperty: string;
}

// Second declaration - automatically merged!
interface Window {
  anotherProperty: number;
}

// Now Window has both properties
declare const window: Window;
window.myCustomProperty = "hello";  // ✅ Valid
window.anotherProperty = 42;        // ✅ Valid
```

> **Interface Merging:** Multiple interface declarations with the same name automatically merge their properties. This is powerful for extending built-in types but can be surprising.

## The Mental Model: Contracts and Guarantees

```
┌─────────────────┐    implements    ┌─────────────────┐
│    Interface    │◄─────────────────│     Class       │
│   (Contract)    │                  │ (Implementation)│  
└─────────────────┘                  └─────────────────┘
         │                                     │
         │ guarantees                          │ provides
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  Type Safety    │                  │ Runtime Behavior│
│  at Compile     │                  │                 │
│     Time        │                  │                 │
└─────────────────┘                  └─────────────────┘
```

**Think of interfaces as contracts:** They specify what must be present, but not how it's implemented. The TypeScript compiler enforces these contracts at compile time, ensuring that any code using the interface can safely assume the promised properties and methods exist.

This foundation of interfaces enables TypeScript's more advanced features like generics, conditional types, and complex type manipulations - all built on the core concept of defining and enforcing object contracts.
