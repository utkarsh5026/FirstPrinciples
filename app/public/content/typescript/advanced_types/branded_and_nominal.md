# TypeScript Branded/Nominal Types: A First Principles Explanation

Let me explain TypeScript's branded (or nominal) types by building your understanding from the absolute fundamentals. I'll use concrete examples throughout to illustrate the concepts.

## The Type System Problem: Structural vs. Nominal Typing

To understand branded types in TypeScript, we need to first understand the fundamental distinction between two different approaches to type systems:

### Structural Typing (TypeScript's Default)

In structural typing, compatibility between types is determined by their structure - the shape of their properties and methods. If two types have the same structure, TypeScript considers them compatible, regardless of their names.

Let's start with a simple example:

```typescript
// Two separate type definitions with identical structure
type UserId = number;
type ProductId = number;

function getUser(id: UserId) {
  // Fetch user with this ID
  return { id, name: "User " + id };
}

// These are different concepts in our domain model
const userId: UserId = 123;
const productId: ProductId = 456;

// But TypeScript allows this!
const user = getUser(productId); // No error
```

Here, even though `UserId` and `ProductId` represent different concepts in our application (a user identifier versus a product identifier), TypeScript treats them as interchangeable because they're both just numbers structurally.

This is fine for many use cases, but can lead to logical errors in your application. You might accidentally pass a product ID to a function expecting a user ID, and TypeScript won't warn you.

### Nominal Typing (What We Sometimes Want)

In nominal typing (used in languages like Java and C#), compatibility is determined by the explicit type name or type identity, not just its structure. Two types with identical structures but different names are considered different types.

Unfortunately, TypeScript doesn't have built-in nominal typing. This is where branded types come in - they're a pattern to simulate nominal typing in TypeScript's structural type system.

## Understanding Branded Types: Adding a "Brand" to Distinguish Types

The core idea behind branded types is to add a unique property to a type that serves as a "brand" or "tag" to make it structurally distinct from other similar types.

Let's see how this works:

```typescript
// Define a type with a unique brand property
type UserId = number & { readonly __brand: unique symbol };
type ProductId = number & { readonly __brand: unique symbol };

// Create branded values with type assertions
const userId = 123 as UserId;
const productId = 456 as ProductId;

function getUser(id: UserId) {
  return { id, name: "User " + id };
}

// Now TypeScript catches our error!
getUser(productId); // Error: Argument of type 'ProductId' is not assignable to parameter of type 'UserId'
```

The magic here is that we've added a non-existent property called `__brand` with a unique symbol type to both `UserId` and `ProductId`. This property doesn't exist at runtime (it's just a type annotation), but it makes the types structurally different at compile time.

Now, let's break down what's happening:

1. We define `UserId` and `ProductId` as the intersection of `number` and an object type with a unique brand property
2. The `readonly __brand: unique symbol` ensures each branded type has a unique structural signature
3. When we try to use a `ProductId` where a `UserId` is expected, TypeScript catches the error because the brands are different

## Creating and Using Branded Types in Practice

There are several patterns for implementing branded types in TypeScript. Let's explore the most common approaches:

### Pattern 1: Using Type Intersection with Unique Symbols

This is a refinement of our initial example, using TypeScript's `unique symbol` feature:

```typescript
// Declare symbol keys for our brands
declare const userIdBrand: unique symbol;
declare const productIdBrand: unique symbol;

// Define branded types
type UserId = number & { readonly [userIdBrand]: void };
type ProductId = number & { readonly [productIdBrand]: void };

// Create factory functions to safely create branded types
function createUserId(id: number): UserId {
  return id as UserId;
}

function createProductId(id: number): ProductId {
  return id as ProductId;
}

// Usage
const userId = createUserId(123);
const productId = createProductId(456);

function getUserById(id: UserId) {
  return { id, name: "User " + id };
}

getUserById(userId); // Works fine
getUserById(productId); // Error: Argument of type 'ProductId' is not assignable to parameter of type 'UserId'
getUserById(123); // Error: Argument of type 'number' is not assignable to parameter of type 'UserId'
```

This pattern has several advantages:
- The brand is truly unique thanks to `unique symbol`
- We encapsulate type creation in factory functions
- TypeScript prevents both mixing branded types and using raw primitive values

### Pattern 2: Using Interface with Brand Property

A simpler approach that's still effective:

```typescript
// Define interfaces with brand properties
interface UserId extends Number {
  readonly __brand: 'userId';
}

interface ProductId extends Number {
  readonly __brand: 'productId';
}

// Create branded values with type assertions
const userId = 123 as unknown as UserId;
const productId = 456 as unknown as ProductId;

// Usage
function processUser(id: UserId) {
  console.log(`Processing user: ${id}`);
}

processUser(userId); // Works fine
processUser(productId); // Error: Argument of type 'ProductId' is not assignable to parameter of type 'UserId'
```

The string literal type for `__brand` makes this approach simple but still effective. The `unknown` cast is needed because a number doesn't satisfy the interface.

### Pattern 3: Using a Generic Brand Type

We can also create a reusable generic for branding any type:

```typescript
// Define a generic brand type
type Brand<T, K extends string> = T & { readonly __brand: K };

// Create various branded types
type UserId = Brand<number, 'userId'>;
type ProductId = Brand<number, 'productId'>;
type Email = Brand<string, 'email'>;
type Password = Brand<string, 'password'>;

// Helper functions to create branded types
function createUserId(id: number): UserId {
  return id as UserId;
}

function createEmail(email: string): Email {
  // We could add validation here
  if (!email.includes('@')) {
    throw new Error('Invalid email format');
  }
  return email as Email;
}

// Usage
const userId = createUserId(123);
const userEmail = createEmail('user@example.com');

function sendPasswordReset(email: Email) {
  console.log(`Sending password reset to ${email}`);
}

sendPasswordReset(userEmail); // Works fine
sendPasswordReset('hacker@evil.com'); // Error: Argument of type 'string' is not assignable to parameter of type 'Email'
```

This pattern is particularly powerful because:
- We have a reusable pattern for branding any type
- We can add validation in our factory functions
- We can brand different primitive types (numbers, strings, etc.)

## Real-World Applications of Branded Types

Now that we understand the basics, let's look at some practical applications:

### 1. Ensuring Correct Units of Measurement

One common use case is to ensure that functions receive values with the correct units:

```typescript
// Define branded types for different units
type Meters = Brand<number, 'meters'>;
type Seconds = Brand<number, 'seconds'>;
type MetersPerSecond = Brand<number, 'metersPerSecond'>;

// Create factory functions
function meters(value: number): Meters {
  return value as Meters;
}

function seconds(value: number): Seconds {
  return value as Seconds;
}

// Calculate speed with correct units
function calculateSpeed(distance: Meters, time: Seconds): MetersPerSecond {
  return (distance / time) as MetersPerSecond;
}

// Usage
const distance = meters(100);
const time = seconds(10);
const speed = calculateSpeed(distance, time);

// These would cause type errors
// calculateSpeed(10, 2); // Error: Raw numbers not allowed
// calculateSpeed(time, distance); // Error: Units swapped
```

This ensures that you can't accidentally mix up units in your calculations, preventing bugs like NASA's Mars Climate Orbiter disaster (which crashed due to confusion between metric and imperial units).

### 2. Validated Input Types

Another powerful use case is ensuring that inputs have been properly validated:

```typescript
// Define branded types for raw and validated data
type RawEmail = string;
type ValidatedEmail = Brand<string, 'validatedEmail'>;

// Validation function that returns a branded type
function validateEmail(email: RawEmail): ValidatedEmail | Error {
  if (!email.includes('@')) {
    return new Error('Invalid email format');
  }
  return email as ValidatedEmail;
}

// Function that requires validated input
function createUser(email: ValidatedEmail, name: string) {
  return { email, name, createdAt: new Date() };
}

// Usage
const emailResult = validateEmail('user@example.com');
if (emailResult instanceof Error) {
  console.error(emailResult.message);
} else {
  const user = createUser(emailResult, 'John Doe');
  console.log(user);
}

// This would cause a type error
// createUser('invalid-email', 'Jane Doe'); // Error: Argument of type 'string' is not assignable to parameter of type 'ValidatedEmail'
```

This pattern ensures that validation happens before data is used, making validation errors impossible to ignore.

### 3. Preventing SQL Injection

Branded types can help prevent security vulnerabilities:

```typescript
type SqlQuery = string;
type SafeSqlString = Brand<string, 'safeSql'>;

function escapeSql(input: string): SafeSqlString {
  // Replace single quotes, etc.
  const escaped = input.replace(/'/g, "''");
  return escaped as SafeSqlString;
}

function createQuery(tableName: string, field: string, value: SafeSqlString): SqlQuery {
  return `SELECT * FROM ${tableName} WHERE ${field} = '${value}'`;
}

// Usage
const userInput = "Robert'; DROP TABLE Students;--";
const safeInput = escapeSql(userInput);
const query = createQuery('users', 'name', safeInput);

// This would cause a type error
// createQuery('users', 'name', userInput); // Error: Argument of type 'string' is not assignable to parameter of type 'SafeSqlString'
```

With this approach, TypeScript ensures you can't accidentally use unescaped user input in your SQL queries.

## Advanced Techniques with Branded Types

Let's explore some more sophisticated use cases:

### 1. State Machines with Branded States

Branded types are excellent for modeling state machines:

```typescript
// Define branded types for different states
type DraftState = Brand<{}, 'draft'>;
type ReviewState = Brand<{ reviewedBy: string }, 'review'>;
type PublishedState = Brand<{ publishedAt: Date }, 'published'>;

// Union type representing all possible states
type DocumentState = DraftState | ReviewState | PublishedState;

// Base document properties
interface DocumentBase {
  id: string;
  title: string;
  content: string;
}

// Document with state information
type Document<T extends DocumentState> = DocumentBase & T;

// State-specific functions
function submitForReview(doc: Document<DraftState>, reviewer: string): Document<ReviewState> {
  return {
    ...doc,
    reviewedBy: reviewer
  } as Document<ReviewState>;
}

function publish(doc: Document<ReviewState>): Document<PublishedState> {
  return {
    ...doc,
    publishedAt: new Date()
  } as Document<PublishedState>;
}

// Usage
const draft: Document<DraftState> = {
  id: '123',
  title: 'My Document',
  content: 'Hello world'
} as Document<DraftState>;

const inReview = submitForReview(draft, 'Alice');
const published = publish(inReview);

// This would cause errors
// publish(draft); // Error: Argument of type 'Document<DraftState>' is not assignable to parameter of type 'Document<ReviewState>'
```

This pattern ensures that operations are only performed on documents in the correct state, making illegal state transitions impossible at compile time.

### 2. Opaque Type Aliases with Nominal Features

Here's a pattern for creating truly opaque type aliases:

```typescript
// Define a module for opaque types
declare namespace Opaque {
  type Type<T, Tag extends symbol> = T & { readonly __tag: Tag };
}

// Create unique symbols for our types
declare const userIdTag: unique symbol;
declare const productIdTag: unique symbol;

// Define opaque types
export type UserId = Opaque.Type<number, typeof userIdTag>;
export type ProductId = Opaque.Type<number, typeof productIdTag>;

// Factory functions (in the same module)
export function createUserId(id: number): UserId {
  return id as UserId;
}

export function createProductId(id: number): ProductId {
  return id as ProductId;
}

// Usage
import { UserId, ProductId, createUserId, createProductId } from './opaqueTypes';

const userId = createUserId(123);
const productId = createProductId(456);

// We can't create these directly
// const badUserId: UserId = 789; // Error: Type 'number' is not assignable to type 'UserId'
```

This pattern makes branded types truly opaque - they can only be created through your factory functions, not directly assigned.

### 3. Combining Branded Types with Type Predicates

Type predicates work well with branded types for runtime type checking:

```typescript
type ValidatedData<T> = T & { readonly __brand: 'validated' };

function validateAge(age: unknown): age is ValidatedData<number> {
  return typeof age === 'number' && age > 0 && age < 120;
}

function validateEmail(email: unknown): email is ValidatedData<string> {
  return typeof email === 'string' && email.includes('@');
}

function createUser(age: ValidatedData<number>, email: ValidatedData<string>) {
  return { age, email };
}

function processUserData(age: unknown, email: unknown) {
  if (validateAge(age) && validateEmail(email)) {
    // Inside this block, TypeScript knows age and email are validated
    const user = createUser(age, email);
    return user;
  }
  throw new Error('Invalid user data');
}
```

This combines runtime type checking with compile-time type safety using branded types.

## Limitations and Considerations

While branded types are powerful, they do have some limitations:

### 1. Runtime Implications

Branded types are primarily a compile-time concept. The brands don't exist at runtime, which can lead to some surprising behaviors:

```typescript
type UserId = Brand<number, 'userId'>;
type ProductId = Brand<number, 'productId'>;

const userId = 123 as UserId;
const productId = 456 as ProductId;

// At runtime, these are just numbers
console.log(typeof userId); // "number"
console.log(userId + productId); // 579 (no type error at runtime)

// You can even explicitly cast between branded types
const alsoProductId = userId as unknown as ProductId; // No runtime check
```

This means you must be careful not to rely on branded types for runtime type checking.

### 2. Type Assertions and Unsafe Casts

While branded types provide compile-time safety, they rely on type assertions (`as` casts) which can be misused:

```typescript
type ValidatedEmail = Brand<string, 'validatedEmail'>;

// Bypassing validation with a type assertion
const invalidEmail = 'not-an-email' as ValidatedEmail; // Compiles fine
```

To mitigate this, you should:
- Keep your factory functions in a separate module
- Never use type assertions outside your factory functions
- Add runtime validation in your factory functions when possible

### 3. Generic Constraints and Branded Types

When using generics with branded types, you may need to be explicit about constraints:

```typescript
// This works as expected
type Validated<T> = T & { readonly __validated: true };

// Factory function
function validate<T>(value: T, validator: (v: T) => boolean): Validated<T> | null {
  if (validator(value)) {
    return value as Validated<T>;
  }
  return null;
}

// Using with generics
function processValidated<T>(value: Validated<T>) {
  console.log('Processing validated value:', value);
}

const validatedAge = validate(25, age => age > 0 && age < 120);
if (validatedAge) {
  processValidated(validatedAge); // Works
}
```

## Best Practices for Branded Types

To use branded types effectively:

1. **Use factory functions** - Create helper functions to construct branded types, adding runtime validation when possible
2. **Hide implementation details** - Keep your branded type definitions and factory functions in separate modules
3. **Be consistent** - Use the same branding pattern throughout your codebase
4. **Document your branded types** - Make it clear what each branded type represents and how to create values of that type
5. **Consider runtime validation** - Whenever possible, add runtime validation to your factory functions
6. **Use meaningful brand names** - The brand should clearly indicate what makes this type special

## Practical Implementation Pattern

Here's a complete pattern for implementing branded types that combines the best aspects of the approaches we've seen:

```typescript
// File: types.ts
// Define a generic brand type
export type Brand<T, K extends string> = T & { readonly __brand: K };

// File: userId.ts
import { Brand } from './types';

// Define the branded type
export type UserId = Brand<number, 'userId'>;

// Private implementation
function isValidUserId(id: number): boolean {
  return id > 0 && Number.isInteger(id);
}

// Public factory function with validation
export function createUserId(id: number): UserId {
  if (!isValidUserId(id)) {
    throw new Error(`Invalid user ID: ${id}`);
  }
  return id as UserId;
}

// Optional helper functions
export function isUserId(value: unknown): value is UserId {
  return typeof value === 'number' && isValidUserId(value);
}

// File: userService.ts
import { UserId, createUserId } from './userId';

export function getUser(id: UserId) {
  // Implementation...
  return { id, name: `User ${id}` };
}

// Example usage
import { createUserId } from './userId';
import { getUser } from './userService';

try {
  const userId = createUserId(123);
  const user = getUser(userId);
  console.log(user);
} catch (error) {
  console.error(error);
}
```

This pattern provides:
- Type safety through branded types
- Runtime validation in factory functions
- Clear module boundaries for type creation
- Helper functions for type checking

## Conclusion

TypeScript's branded types are a powerful pattern for adding nominal typing to a structurally typed system. By adding a unique brand property to your types, you can:

1. Create distinct types that are structurally identical but treated as different by TypeScript
2. Prevent logical errors by ensuring values are used in the correct context
3. Enforce validation and other constraints at compile time
4. Model complex domains more accurately

While not a built-in feature of TypeScript, branded types have become a standard pattern in many codebases, especially in areas where type safety is critical, such as financial calculations, security-sensitive operations, and complex state management.

By understanding and applying branded types, you can make your TypeScript code more robust, expressive, and maintainable, catching a whole class of logical errors at compile time rather than runtime.