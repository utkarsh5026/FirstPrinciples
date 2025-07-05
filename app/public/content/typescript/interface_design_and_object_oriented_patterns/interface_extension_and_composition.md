# Interface Extension and Composition: Building Complex Types from Simple Ones

## JavaScript Foundation: Object Composition Patterns

Before TypeScript, JavaScript developers already used object composition to build complex structures from simpler ones:

```javascript
// JavaScript: Manual object composition
const baseUser = {
  id: 1,
  name: "Alice"
};

const adminUser = {
  ...baseUser,        // Spread the base properties
  role: "admin",      // Add new properties
  permissions: ["read", "write", "delete"]
};

const customerUser = {
  ...baseUser,
  role: "customer",
  purchaseHistory: []
};
```

 **The Problem** : JavaScript has no way to enforce that `adminUser` actually contains all the properties from `baseUser`, or that new objects follow the same pattern. These compositions are fragile and error-prone.

## TypeScript's Solution: Interface Extension

TypeScript provides **interface extension** to formalize these composition patterns with compile-time safety:

```typescript
// TypeScript: Interface extension with 'extends'
interface BaseUser {
  id: number;
  name: string;
}

interface AdminUser extends BaseUser {
  role: "admin";
  permissions: string[];
}

interface CustomerUser extends BaseUser {
  role: "customer";
  purchaseHistory: Purchase[];
}

// Now TypeScript enforces the composition
const admin: AdminUser = {
  id: 1,
  name: "Alice",     // ✅ Required from BaseUser
  role: "admin",     // ✅ Required from AdminUser
  permissions: ["read", "write"]
};

const customer: CustomerUser = {
  id: 2,
  // name: "Bob",    // ❌ Error: Property 'name' is missing
  role: "customer",
  purchaseHistory: []
};
```

> **Key Mental Model** : Interface extension creates a "type contract" that says "this new type must have everything from the base type, plus these additional requirements."

## The Compilation Process

Here's what happens when TypeScript processes interface extension:

```
TypeScript Compiler Flow:
┌─────────────────┐
│   Source Code   │
│   interface A   │
│   interface B   │
│   extends A     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Type Checking  │
│  • Merge types  │
│  • Check compatibility │
│  • Validate usage │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  JavaScript     │
│  (types erased) │
│  const obj = {} │
└─────────────────┘
```

> **Important** : Interface extensions only exist at compile time. The generated JavaScript contains no trace of the type information.

## Single Interface Extension

Let's build up complexity gradually, starting with simple extension:

```typescript
// Base interface - the foundation
interface Vehicle {
  brand: string;
  year: number;
  start(): void;
}

// Extended interface - adds car-specific properties
interface Car extends Vehicle {
  doors: number;
  fuelType: "gasoline" | "diesel" | "electric";
  drive(): void;
}

// Implementation must satisfy BOTH interfaces
const myCar: Car = {
  // From Vehicle interface
  brand: "Toyota",
  year: 2023,
  start() {
    console.log("Engine starting...");
  },
  
  // From Car interface
  doors: 4,
  fuelType: "gasoline",
  drive() {
    console.log("Driving...");
  }
};

// TypeScript knows about ALL properties from both interfaces
myCar.start();    // ✅ Available from Vehicle
myCar.drive();    // ✅ Available from Car
myCar.year;       // ✅ Available from Vehicle
myCar.doors;      // ✅ Available from Car
```

## Multiple Interface Extension

TypeScript allows extending multiple interfaces simultaneously:

```typescript
interface Flyable {
  altitude: number;
  fly(): void;
}

interface Swimmable {
  depth: number;
  swim(): void;
}

interface Walkable {
  speed: number;
  walk(): void;
}

// A duck can do all three!
interface Duck extends Flyable, Swimmable, Walkable {
  quack(): void;
}

const duck: Duck = {
  // From Flyable
  altitude: 100,
  fly() { console.log("Flying at", this.altitude, "feet"); },
  
  // From Swimmable  
  depth: 5,
  swim() { console.log("Swimming at", this.depth, "feet deep"); },
  
  // From Walkable
  speed: 2,
  walk() { console.log("Walking at", this.speed, "mph"); },
  
  // From Duck
  quack() { console.log("Quack!"); }
};
```

## Interface Composition vs Extension

There are different ways to combine interfaces. Let's explore the patterns:

### Pattern 1: Extension (IS-A Relationship)

```typescript
interface Animal {
  name: string;
  age: number;
}

// A Dog IS-A Animal (inheritance)
interface Dog extends Animal {
  breed: string;
  bark(): void;
}
```

### Pattern 2: Composition (HAS-A Relationship)

```typescript
interface Engine {
  horsepower: number;
  start(): void;
}

interface Transmission {
  type: "manual" | "automatic";
  shift(gear: number): void;
}

// A Car HAS-A Engine and HAS-A Transmission (composition)
interface Car {
  engine: Engine;
  transmission: Transmission;
  doors: number;
}

const car: Car = {
  engine: {
    horsepower: 300,
    start() { console.log("Engine started"); }
  },
  transmission: {
    type: "automatic",
    shift(gear) { console.log(`Shifted to gear ${gear}`); }
  },
  doors: 4
};
```

### Pattern 3: Intersection Types (AND Relationship)

```typescript
interface Driveable {
  drive(): void;
}

interface Flyable {
  fly(): void;
}

// This vehicle can BOTH drive AND fly
type FlyingCar = Driveable & Flyable & {
  mode: "ground" | "air";
};

const flyingCar: FlyingCar = {
  drive() { console.log("Driving on ground"); },
  fly() { console.log("Flying in air"); },
  mode: "ground"
};
```

## Advanced Composition Patterns

### Mixin Pattern with Interfaces

```typescript
// Base functionality
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Identifiable {
  id: string;
}

interface Auditable {
  createdBy: string;
  lastModifiedBy: string;
}

// Compose multiple concerns
interface BlogPost extends Timestamped, Identifiable, Auditable {
  title: string;
  content: string;
  tags: string[];
}

interface User extends Timestamped, Identifiable {
  username: string;
  email: string;
}

// Helper function to create timestamped objects
function withTimestamps<T>(obj: T): T & Timestamped {
  const now = new Date();
  return {
    ...obj,
    createdAt: now,
    updatedAt: now
  };
}

const user = withTimestamps({
  id: "user-123",
  username: "alice",
  email: "alice@example.com"
});
// user now has all User properties plus Timestamped properties
```

### Conditional Extension

```typescript
interface BaseConfig {
  environment: "development" | "production";
}

// Extend based on environment
interface DevelopmentConfig extends BaseConfig {
  environment: "development";
  debugMode: true;
  logLevel: "verbose";
}

interface ProductionConfig extends BaseConfig {
  environment: "production";
  debugMode: false;
  logLevel: "error";
  cacheEnabled: true;
}

type Config = DevelopmentConfig | ProductionConfig;

// Type-safe configuration handling
function createConfig(env: "development" | "production"): Config {
  if (env === "development") {
    return {
      environment: "development",
      debugMode: true,
      logLevel: "verbose"
    };
  } else {
    return {
      environment: "production",
      debugMode: false,
      logLevel: "error",
      cacheEnabled: true
    };
  }
}
```

## Interface Merging (Declaration Merging)

TypeScript has a unique feature where multiple interface declarations with the same name automatically merge:

```typescript
// First declaration
interface User {
  name: string;
}

// Second declaration - they merge!
interface User {
  age: number;
}

// Third declaration
interface User {
  email: string;
}

// The final User interface has ALL properties
const user: User = {
  name: "Alice",    // From first declaration
  age: 30,          // From second declaration  
  email: "alice@example.com"  // From third declaration
};
```

> **Use Case** : This is particularly useful when extending third-party library types or creating modular type definitions.

## Common Gotchas and Best Practices

### Gotcha 1: Property Conflicts

```typescript
interface A {
  value: string;
}

interface B {
  value: number;  // ❌ Conflict with A.value
}

// This will cause an error
interface C extends A, B {
  // Error: Interface 'C' cannot simultaneously extend types 'A' and 'B'
  // Named property 'value' of types 'A' and 'B' are not identical
}

// Solution: Use intersection types with careful handling
type AB = A & B;  // Results in { value: never }
```

### Gotcha 2: Method vs Property Extension

```typescript
interface Base {
  getValue(): string;
}

interface Extended extends Base {
  getValue(): string;  // ✅ Same signature, works
  // getValue: string; // ❌ Can't change method to property
}
```

### Best Practice: Interface Hierarchy Design

```typescript
// ✅ Good: Clear hierarchy with single responsibility
interface Readable {
  read(): string;
}

interface Writable {
  write(data: string): void;
}

interface ReadWritable extends Readable, Writable {
  // Combines both capabilities clearly
}

// ✅ Good: Progressive enhancement
interface BasicUser {
  id: string;
  name: string;
}

interface AuthenticatedUser extends BasicUser {
  token: string;
  lastLogin: Date;
}

interface AdminUser extends AuthenticatedUser {
  permissions: string[];
  canManageUsers: boolean;
}
```

## Real-World Example: API Response Types

```typescript
// Base response structure
interface ApiResponse {
  success: boolean;
  timestamp: Date;
  requestId: string;
}

// Success response with data
interface SuccessResponse<T> extends ApiResponse {
  success: true;
  data: T;
}

// Error response with error details
interface ErrorResponse extends ApiResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Specific API responses
interface UserData {
  id: string;
  name: string;
  email: string;
}

type GetUserResponse = SuccessResponse<UserData> | ErrorResponse;

// Usage with type narrowing
async function getUser(id: string): Promise<GetUserResponse> {
  // API call implementation
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  if (response.ok) {
    return {
      success: true,
      timestamp: new Date(),
      requestId: generateId(),
      data: data as UserData
    };
  } else {
    return {
      success: false,
      timestamp: new Date(),
      requestId: generateId(),
      error: {
        code: data.code,
        message: data.message
      }
    };
  }
}

// Type-safe handling
const result = await getUser("123");
if (result.success) {
  // TypeScript knows this is SuccessResponse<UserData>
  console.log(result.data.name);  // ✅ Safe access
} else {
  // TypeScript knows this is ErrorResponse
  console.error(result.error.message);  // ✅ Safe access
}
```

> **Key Takeaway** : Interface extension and composition in TypeScript provide compile-time safety for JavaScript's object composition patterns, enabling you to build complex, maintainable type systems that scale with your application's complexity.

The power lies not just in the type safety, but in the clear documentation of your code's intent and the excellent developer experience with autocompletion and refactoring support.
