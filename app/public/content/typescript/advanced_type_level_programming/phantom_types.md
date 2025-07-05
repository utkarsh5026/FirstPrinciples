# Phantom Types: Compile-Time Safety Without Runtime Cost

Let me walk you through phantom types from the very foundation, starting with the JavaScript problems they solve.

## JavaScript Foundation: The Hidden Dangers

In JavaScript, values can carry implicit meaning that the language can't enforce:

```javascript
// JavaScript - These look the same but mean different things
function transferMoney(fromAccount, toAccount, amount) {
  // What if amount is in cents? Or dollars? Or a different currency?
  // What if someone passes arguments in wrong order?
  console.log(`Transferring ${amount} from ${fromAccount} to ${toAccount}`);
}

// All of these compile and run, but some are wrong:
transferMoney("123", "456", 100);        // $100 or 100 cents?
transferMoney("123", "456", "100");      // String instead of number!
transferMoney(100, "123", "456");        // Wrong argument order!
```

 **The core problem** : JavaScript treats all strings as equivalent, all numbers as equivalent. It can't distinguish between `"user-id"` and `"account-number"` or between `100` (dollars) and `100` (cents).

## TypeScript's Basic Solution: Nominal Typing Attempt

TypeScript's basic types help, but they're still too broad:

```typescript
// TypeScript basic types - better but still problematic
function transferMoney(
  fromAccount: string, 
  toAccount: string, 
  amount: number
): void {
  console.log(`Transferring ${amount} from ${fromAccount} to ${toAccount}`);
}

// These still compile but could be logically wrong:
transferMoney("user-name", "account-123", 100);  // Wrong ID type
transferMoney("acc-123", "acc-456", 0.5);        // Dollars or cents?
```

> **The Type System Gap** : Basic TypeScript types describe the *shape* of data, but not its *meaning* or  *context* .

## Enter Phantom Types: Encoding Meaning in the Type System

Phantom types solve this by creating types that carry extra information without changing runtime behavior.

### What Makes a Type "Phantom"?

```typescript
// This is a phantom type - it exists only at compile time
type UserId = string & { readonly _brand: 'UserId' };
type AccountId = string & { readonly _brand: 'AccountId' };

// At runtime, these are just strings
// At compile time, they're treated as different types
```

> **Phantom Type Definition** : A type that adds compile-time distinctions without runtime overhead. The "phantom" part (like `_brand`) never actually exists in the compiled JavaScript.

### The Branding Technique

Let's see how this works step by step:

```typescript
// Step 1: Create branded types
type UserId = string & { readonly _brand: 'UserId' };
type AccountId = string & { readonly _brand: 'AccountId' };
type Dollars = number & { readonly _currency: 'USD', readonly _unit: 'dollars' };
type Cents = number & { readonly _currency: 'USD', readonly _unit: 'cents' };

// Step 2: Create constructor functions
function createUserId(id: string): UserId {
  // At runtime: just returns the string
  // At compile time: "brands" it as UserId
  return id as UserId;
}

function createAccountId(id: string): AccountId {
  return id as AccountId;
}

function createDollars(amount: number): Dollars {
  return amount as Dollars;
}

function createCents(amount: number): Cents {
  return amount as Cents;
}

// Step 3: Use the branded types
function transferMoney(
  fromAccount: AccountId,
  toAccount: AccountId,
  amount: Dollars
): void {
  console.log(`Transferring $${amount} from ${fromAccount} to ${toAccount}`);
}
```

Now let's see the safety in action:

```typescript
// Create properly typed values
const user1 = createUserId("user-123");
const account1 = createAccountId("acc-456");
const account2 = createAccountId("acc-789");
const dollarAmount = createDollars(100);
const centAmount = createCents(10000);

// ✅ This works - correct types
transferMoney(account1, account2, dollarAmount);

// ❌ TypeScript errors prevent mistakes:
transferMoney(user1, account2, dollarAmount);
// Error: Argument of type 'UserId' is not assignable to parameter of type 'AccountId'

transferMoney(account1, account2, centAmount);
// Error: Argument of type 'Cents' is not assignable to parameter of type 'Dollars'

transferMoney(account2, account1, dollarAmount);  // ✅ Swap order is fine
```

## The Runtime Reality

Here's the crucial understanding about phantom types:

```typescript
// Compile time - TypeScript sees these as different
const userId: UserId = createUserId("123");
const accountId: AccountId = createAccountId("123");

// Runtime - JavaScript sees these as identical
console.log(typeof userId);     // "string"
console.log(typeof accountId);  // "string"
console.log(userId === "123");  // true
console.log(accountId === "123"); // true

// The compiled JavaScript has NO trace of our phantom types:
function createUserId(id) {
  return id;  // Just returns the string!
}
```

> **Key Mental Model** : Phantom types are like invisible labels that TypeScript uses to track meaning, but they disappear completely when your code runs.

## Advanced Phantom Type Patterns

### 1. Validation State Tracking

```typescript
// Track whether data has been validated
type Validated<T> = T & { readonly _validated: true };
type Unvalidated<T> = T & { readonly _validated: false };

type EmailAddress = string;

function validateEmail(email: Unvalidated<EmailAddress>): Validated<EmailAddress> | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(email)) {
    return email as Validated<EmailAddress>;
  }
  return null;
}

function sendEmail(to: Validated<EmailAddress>, message: string): void {
  console.log(`Sending "${message}" to ${to}`);
}

// Usage
const userInput = "user@example.com" as Unvalidated<EmailAddress>;
const validatedEmail = validateEmail(userInput);

if (validatedEmail) {
  sendEmail(validatedEmail, "Hello!");  // ✅ Safe to send
}

// ❌ This prevents sending to unvalidated emails:
// sendEmail(userInput, "Hello!");  // Error!
```

### 2. State Machine Types

```typescript
// Model a file upload state machine
type FileState = 'pending' | 'uploading' | 'uploaded' | 'failed';

type FileUpload<State extends FileState> = {
  id: string;
  filename: string;
  _state: State;
} & (
  State extends 'pending' ? { progress?: never } :
  State extends 'uploading' ? { progress: number } :
  State extends 'uploaded' ? { url: string; progress?: never } :
  State extends 'failed' ? { error: string; progress?: never } :
  never
);

// These functions can only be called with files in correct states
function startUpload(file: FileUpload<'pending'>): FileUpload<'uploading'> {
  return { ...file, _state: 'uploading', progress: 0 };
}

function completeUpload(
  file: FileUpload<'uploading'>, 
  url: string
): FileUpload<'uploaded'> {
  return { ...file, _state: 'uploaded', url };
}

function getDownloadUrl(file: FileUpload<'uploaded'>): string {
  return file.url;  // TypeScript knows this exists!
}
```

### 3. Units of Measurement

```typescript
// Phantom types for different units
type Meters = number & { readonly _unit: 'meters' };
type Feet = number & { readonly _unit: 'feet' };
type Seconds = number & { readonly _unit: 'seconds' };
type MetersPerSecond = number & { readonly _unit: 'meters/second' };

function meters(value: number): Meters {
  return value as Meters;
}

function feet(value: number): Feet {
  return value as Feet;
}

function seconds(value: number): Seconds {
  return value as Seconds;
}

// Convert between units safely
function feetToMeters(ft: Feet): Meters {
  return meters(ft * 0.3048);
}

function calculateSpeed(distance: Meters, time: Seconds): MetersPerSecond {
  return (distance / time) as MetersPerSecond;
}

// Usage with safety
const height = feet(6);
const heightInMeters = feetToMeters(height);
const time = seconds(10);
const speed = calculateSpeed(heightInMeters, time);

// ❌ These prevent unit confusion:
// calculateSpeed(height, time);  // Error: can't use Feet where Meters expected
// calculateSpeed(time, heightInMeters);  // Error: wrong parameter order
```

## Compile Time vs Runtime: The Full Picture

Let's trace what happens to phantom types through the compilation process:

```
TypeScript Source Code:
┌─────────────────────────┐
│ type UserId = string &  │
│   { _brand: 'UserId' }  │
│                         │
│ const id: UserId =      │
│   "user-123" as UserId  │
└─────────────────────────┘
            │
            ▼ TypeScript Compiler
┌─────────────────────────┐
│ Type Checking:          │
│ ✓ "user-123" is valid   │
│ ✓ UserId brand matches  │
│ ✓ All function calls    │
│   use correct types     │
└─────────────────────────┘
            │
            ▼ Remove Types
┌─────────────────────────┐
│ JavaScript Output:      │
│                         │
│ const id = "user-123";  │
│                         │
│ // No trace of UserId!  │
└─────────────────────────┘
```

> **Critical Understanding** : Phantom types provide compile-time safety with zero runtime cost. They're erased completely during compilation.

## Common Gotchas and Best Practices

### Gotcha 1: Runtime Type Checks Won't Work

```typescript
type UserId = string & { _brand: 'UserId' };

function processId(id: UserId | string) {
  // ❌ This won't work as expected
  if (typeof id === 'UserId') {  // 'UserId' doesn't exist at runtime!
    // ...
  }
  
  // ✅ Instead, use type guards or discriminated unions
  // You need other ways to distinguish at runtime
}
```

### Gotcha 2: Structural Typing Still Applies

```typescript
type UserId = string & { _brand: 'UserId' };
type AccountId = string & { _brand: 'AccountId' };

// ❌ This breaks the phantom type safety
const userId: UserId = "123" as UserId;
const accountId: AccountId = userId as AccountId;  // Force cast works!

// ✅ Better: use helper functions and avoid `as` casts
```

> **Best Practice** : Always use constructor functions instead of direct type assertions to create phantom types.

### Gotcha 3: JSON Serialization Loses Types

```typescript
type UserId = string & { _brand: 'UserId' };

const userId: UserId = createUserId("123");
const serialized = JSON.stringify({ userId });
const parsed = JSON.parse(serialized);

// parsed.userId is now just a string, not UserId!
// You'll need to re-validate after deserialization
```

## Why Phantom Types Matter: The Big Picture

Phantom types solve a fundamental problem in programming:  **how to encode human understanding into machine-checkable rules** .

Consider this evolution:

```typescript
// 1. Raw JavaScript - no safety
function charge(customerId, amount) { /* ... */ }

// 2. Basic TypeScript - shape safety
function charge(customerId: string, amount: number) { /* ... */ }

// 3. Phantom types - semantic safety  
function charge(customerId: CustomerId, amount: Dollars) { /* ... */ }
```

Each step adds more human meaning that the computer can verify, without changing what the code actually does at runtime.

> **The Phantom Type Philosophy** : Use the type system to encode not just what your data looks like, but what it means and how it should be used.

Phantom types are powerful because they let you create domain-specific type systems that perfectly match your problem domain, giving you compile-time verification of business logic without any runtime overhead.
