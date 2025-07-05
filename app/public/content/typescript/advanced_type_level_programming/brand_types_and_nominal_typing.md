# Brand Types and Nominal Typing in TypeScript

Let me walk you through this advanced TypeScript concept by building up from JavaScript fundamentals to show you exactly why brand types exist and how they solve real problems.

## JavaScript Foundation: Dynamic Typing

First, let's understand what we're working with in JavaScript:

```javascript
// JavaScript is dynamically typed - variables can hold any value
let userId = 42;           // number
userId = "user-123";       // now string
userId = { id: 42 };       // now object

// No way to distinguish between different "kinds" of numbers
let userId = 42;
let productId = 42;
let orderId = 42;

// This is perfectly valid but logically wrong:
function deleteUser(userId) {
    // What if someone passes productId by mistake?
    database.delete('users', userId);
}

deleteUser(productId); // Oops! This compiles and runs, but deletes wrong thing
```

> **Key Problem** : JavaScript has no way to distinguish between values that have the same runtime type but different semantic meanings.

## TypeScript's Default Approach: Structural Typing

TypeScript introduces static typing, but by default uses **structural typing** (also called "duck typing"):

```typescript
// TypeScript structural typing
type User = { id: number; name: string };
type Product = { id: number; name: string };

const user: User = { id: 1, name: "Alice" };
const product: Product = { id: 1, name: "iPhone" };

// This is ALLOWED in TypeScript - they have the same structure!
function processUser(user: User) {
    console.log(`Processing user ${user.name}`);
}

processUser(product); // ✅ Compiles fine! But semantically wrong
```

> **Structural Typing Rule** : If two types have the same structure (same properties with same types), TypeScript considers them compatible and interchangeable.

### Visual Representation of Structural Typing

```
JavaScript Values:
┌─────────────┐
│   { id: 1,  │
│   name: "Alice" }
└─────────────┘

TypeScript Structural Check:
┌─────────────┐    ┌─────────────┐
│    User     │    │  Product    │
│ id: number  │────│ id: number  │  Same structure =
│ name:string │    │ name:string │  Compatible types!
└─────────────┘    └─────────────┘
```

## The Problem: When Structure Isn't Enough

Here's a real-world scenario where structural typing causes issues:

```typescript
// All these are just numbers at runtime, but mean different things
type UserId = number;
type ProductId = number;
type OrderId = number;
type Price = number;

function chargeCustomer(userId: UserId, amount: Price) {
    // Charge the user
    paymentService.charge(userId, amount);
}

function calculateDiscount(price: Price, userId: UserId) {
    return price * getUserDiscountRate(userId);
}

// This is problematic but TypeScript allows it:
const userId: UserId = 123;
const price: Price = 99;

chargeCustomer(price, userId); // ❌ Arguments swapped! But compiles fine
//           ^^^^^ ^^^^^^
//           amount should be price, userId should be userId
```

> **The Core Issue** : When multiple types have the same underlying structure, TypeScript can't distinguish between them, leading to logical errors that pass type checking.

## Enter Brand Types: Creating Nominal-like Typing

Brand types solve this by creating **distinct types** even when the underlying structure is identical. Here's how:

```typescript
// The brand technique - adding a unique property that only exists at compile time
type UserId = number & { readonly __brand: 'UserId' };
type ProductId = number & { readonly __brand: 'ProductId' };
type Price = number & { readonly __brand: 'Price' };

// Helper functions to create branded values
function createUserId(id: number): UserId {
    return id as UserId;
}

function createProductId(id: number): ProductId {
    return id as ProductId;
}

function createPrice(amount: number): Price {
    return amount as Price;
}
```

### How the Brand Property Works

```typescript
// The __brand property creates type distinction
type UserId = number & { readonly __brand: 'UserId' };
//            ^^^^^^     ^^^^^^^^^^^^^^^^^^^^^^^^^^^
//            Base type  Brand marker (compile-time only)

// At runtime: just a number
// At compile time: distinct type that can't be confused with other brands
```

> **Brand Property Rules** :
>
> * The `__brand` property exists only at compile time
> * It never appears in the actual JavaScript output
> * `readonly` prevents accidental modification
> * The string literal creates a unique type signature

## Brand Types in Action

Now watch how brand types prevent the earlier mistakes:

```typescript
// Define branded types
type UserId = number & { readonly __brand: 'UserId' };
type Price = number & { readonly __brand: 'Price' };

// Create branded values
const userId = createUserId(123);
const price = createPrice(99);

function chargeCustomer(userId: UserId, amount: Price) {
    // Implementation stays the same
    paymentService.charge(userId, amount);
}

// Now this catches the error at compile time!
chargeCustomer(price, userId); 
// ^^^^^^^^^^^^^ ^^^^^
// Type 'Price' is not assignable to parameter of type 'UserId'
// Type 'UserId' is not assignable to parameter of type 'Price'
```

### Compilation Flow Diagram

```
Source Code:
chargeCustomer(price, userId)
     │
     ▼
TypeScript Compiler:
┌─────────────────────────────┐
│ Check parameter 1:          │
│ Expected: UserId            │
│ Received: Price             │
│ Compatible? NO ❌           │
│                             │
│ Check parameter 2:          │
│ Expected: Price             │
│ Received: UserId            │
│ Compatible? NO ❌           │
└─────────────────────────────┘
     │
     ▼
Compile Error Generated
```

## Advanced Brand Type Patterns

### 1. Generic Brand Creator

```typescript
// Reusable brand type creator
type Brand<T, BrandName extends string> = T & { 
    readonly __brand: BrandName 
};

// Create multiple branded types easily
type UserId = Brand<number, 'UserId'>;
type ProductId = Brand<number, 'ProductId'>;
type EmailAddress = Brand<string, 'EmailAddress'>;
type ValidatedInput = Brand<string, 'ValidatedInput'>;

// Generic creator function
function brand<T, B extends string>(value: T): Brand<T, B> {
    return value as Brand<T, B>;
}
```

### 2. Validation with Brands

```typescript
type EmailAddress = Brand<string, 'EmailAddress'>;

function createEmailAddress(input: string): EmailAddress | null {
    // Validation logic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (emailRegex.test(input)) {
        return input as EmailAddress; // Brand it only after validation
    }
  
    return null; // Invalid email
}

function sendEmail(to: EmailAddress, subject: string) {
    // We KNOW this is a valid email because of the brand
    emailService.send(to, subject);
}

// Usage
const userInput = "not-an-email";
const email = createEmailAddress(userInput);

if (email) {
    sendEmail(email, "Welcome!"); // ✅ Safe - validated email
} else {
    console.log("Invalid email address");
}

// This won't compile:
sendEmail("random-string", "Test"); // ❌ Error: string not assignable to EmailAddress
```

### 3. Arithmetic Safety with Brands

```typescript
type Meters = Brand<number, 'Meters'>;
type Seconds = Brand<number, 'Seconds'>;
type MetersPerSecond = Brand<number, 'MetersPerSecond'>;

function meters(value: number): Meters {
    return value as Meters;
}

function seconds(value: number): Seconds {
    return value as Seconds;
}

function calculateSpeed(distance: Meters, time: Seconds): MetersPerSecond {
    // The math is just normal number operations
    const speed = (distance as number) / (time as number);
    return speed as MetersPerSecond;
}

// Usage
const distance = meters(100);
const time = seconds(10);
const speed = calculateSpeed(distance, time);

// This prevents unit confusion:
calculateSpeed(time, distance); // ❌ Error: wrong parameter types
```

## Runtime vs Compile Time Behavior

Here's what actually happens in the JavaScript output:

```typescript
// TypeScript source:
type UserId = Brand<number, 'UserId'>;
const userId: UserId = brand<number, 'UserId'>(123);

// Compiled JavaScript output:
const userId = 123; // That's it! No brand information exists at runtime
```

> **Critical Understanding** : Brand types exist only during compilation. At runtime, branded values are just their underlying primitive types.

### Memory and Performance Impact

```
Compile Time:        Runtime:
┌─────────────┐     ┌─────────┐
│ UserId {    │ ──▶ │   123   │
│   value: 123│     └─────────┘
│   __brand   │
│ }           │     Zero overhead!
└─────────────┘     Same as plain number
```

## Common Gotchas and Solutions

### 1. JSON Serialization/Deserialization

```typescript
type UserId = Brand<number, 'UserId'>;

// Problem: JSON.parse doesn't restore brands
const data = JSON.stringify({ userId: createUserId(123) });
const parsed = JSON.parse(data); // { userId: 123 } - brand is lost!

// Solution: Re-brand after parsing
interface UserData {
    userId: UserId;
    name: string;
}

function parseUserData(json: string): UserData {
    const raw = JSON.parse(json);
  
    return {
        userId: raw.userId as UserId, // Re-apply brand
        name: raw.name
    };
}
```

### 2. Working with External Libraries

```typescript
// External library expects plain numbers
interface DatabaseQuery {
    findUser(id: number): User;
}

type UserId = Brand<number, 'UserId'>;

function getUser(userId: UserId): User {
    // Cast back to number for external API
    return database.findUser(userId as number);
}
```

### 3. Brand Preservation in Arrays

```typescript
type UserId = Brand<number, 'UserId'>;

// Array operations preserve brands
const userIds: UserId[] = [
    createUserId(1),
    createUserId(2),
    createUserId(3)
];

// But be careful with array methods that transform:
const doubled = userIds.map(id => (id as number) * 2); // number[], not UserId[]

// To preserve brands in transformations:
const validUserIds = userIds.filter(id => (id as number) > 0); // Still UserId[]
```

## Best Practices for Brand Types

> **When to Use Brand Types** :
>
> * IDs that shouldn't be confused (UserId vs ProductId)
> * Values requiring validation (EmailAddress, ValidatedInput)
> * Units of measurement (Meters, Seconds, Currency)
> * Security-sensitive values (HashedPassword, SanitizedHTML)

> **Implementation Guidelines** :
>
> * Always provide creator functions for validation
> * Use descriptive brand names
> * Consider the runtime performance implications
> * Document the validation rules
> * Be consistent across your codebase

Brand types transform TypeScript from a structural type system into something that behaves more like a nominal type system, giving you the safety of distinct types while maintaining TypeScript's flexibility and JavaScript's runtime performance.
