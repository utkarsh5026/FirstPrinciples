# Type Guards and Predicate Functions: From JavaScript Runtime to TypeScript Compile-Time Safety

Let's build understanding from the ground up, starting with how JavaScript handles types at runtime and how TypeScript enhances this with compile-time safety.

## JavaScript Foundation: Runtime Type Checking

In JavaScript, you often need to check what type a value actually is before using it safely:

```javascript
// JavaScript - checking types at runtime
function processValue(input) {
  // We don't know what 'input' is until runtime
  if (typeof input === 'string') {
    return input.toUpperCase(); // Safe to call string methods
  }
  
  if (typeof input === 'number') {
    return input * 2; // Safe to do math operations
  }
  
  throw new Error('Unsupported type');
}

// These all work, but we find out problems at runtime
processValue("hello");    // "HELLO"
processValue(42);         // 84
processValue(true);       // Error thrown at runtime!
```

The problem: JavaScript tells us about type mismatches only when the code runs, not when we write it.

## TypeScript's Compile-Time Challenge

TypeScript adds static typing, but it faces a fundamental challenge:

```typescript
// TypeScript wants to know types at compile time
function processValue(input: string | number) {
  // TypeScript error: Property 'toUpperCase' doesn't exist on type 'string | number'
  // return input.toUpperCase(); // ❌ Won't compile!
  
  // TypeScript error: The left-hand side of an arithmetic operation must be a number
  // return input * 2; // ❌ Won't compile!
}
```

> **Key Problem** : When TypeScript sees a union type like `string | number`, it only allows operations that work on ALL possible types. Since `toUpperCase()` doesn't exist on numbers and multiplication doesn't work on strings, TypeScript rejects both operations.

## Type Guards: Bridging Runtime and Compile-Time

Type guards solve this by letting TypeScript understand runtime type checks:

```typescript
// TypeScript with type guards
function processValue(input: string | number) {
  // Type guard: typeof check that TypeScript understands
  if (typeof input === 'string') {
    // TypeScript now knows: input is definitely a string here
    return input.toUpperCase(); // ✅ Compiles and works!
  }
  
  if (typeof input === 'number') {
    // TypeScript now knows: input is definitely a number here
    return input * 2; // ✅ Compiles and works!
  }
  
  // TypeScript knows this code is unreachable given our function signature
  throw new Error('Unsupported type');
}
```

> **Type Narrowing** : Type guards "narrow" the type from a broad union (`string | number`) to a specific type (`string` or `number`) within their code blocks.

## The Mental Model: Runtime Checks That TypeScript Understands

```
┌─────────────────────┐
│   Union Type        │
│  string | number    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    Type Guard       │
│  typeof x === 'str' │
└─────────┬───────────┘
          │
    ┌─────▼─────┐
    │   True    │    │   False   │
    │  string   │    │  number   │
    └───────────┘    └───────────┘
```

## Built-in Type Guards

TypeScript recognizes several JavaScript operators as type guards:

### 1. `typeof` Type Guard

```typescript
function handleValue(value: string | number | boolean) {
  if (typeof value === 'string') {
    console.log(value.length); // TypeScript knows: value is string
  } else if (typeof value === 'number') {
    console.log(value.toFixed(2)); // TypeScript knows: value is number
  } else {
    console.log(value ? 'true' : 'false'); // TypeScript knows: value is boolean
  }
}
```

### 2. `instanceof` Type Guard

```typescript
class Dog {
  bark() { return "Woof!"; }
}

class Cat {
  meow() { return "Meow!"; }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    return animal.bark(); // TypeScript knows: animal is Dog
  } else {
    return animal.meow(); // TypeScript knows: animal is Cat
  }
}
```

### 3. `in` Operator Type Guard

```typescript
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function move(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly(); // TypeScript knows: animal is Bird
  } else {
    animal.swim(); // TypeScript knows: animal is Fish
  }
}
```

## Custom Type Guards: User-Defined Predicate Functions

Sometimes built-in type guards aren't enough. Custom type guards use predicate functions:

### Basic Predicate Function Syntax

```typescript
// Predicate function signature: parameter is Type
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function processUnknown(input: unknown) {
  if (isString(input)) {
    // TypeScript now knows: input is definitely string
    console.log(input.toUpperCase()); // ✅ Works!
  }
}
```

> **Predicate Function** : A function that returns a type predicate (`parameter is Type`) instead of just `boolean`. This tells TypeScript: "If this function returns true, then the parameter is definitely of the specified type."

### The "is" Keyword Explained

```typescript
// Regular boolean function - TypeScript learns nothing
function checkIfString(value: unknown): boolean {
  return typeof value === 'string';
}

// Predicate function - TypeScript learns the type
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function demo(input: unknown) {
  // Using regular boolean function
  if (checkIfString(input)) {
    // TypeScript error: input is still 'unknown'
    // console.log(input.toUpperCase()); // ❌
  }
  
  // Using predicate function
  if (isString(input)) {
    // TypeScript knows: input is string
    console.log(input.toUpperCase()); // ✅
  }
}
```

## Complex Object Type Guards

Real-world type guards often check object shapes:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
}

// Complex type guard checking object structure
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as any).id === 'number' &&
    typeof (obj as any).name === 'string' &&
    typeof (obj as any).email === 'string'
  );
}

function processApiResponse(data: unknown) {
  if (isUser(data)) {
    // TypeScript knows: data is User
    console.log(`Welcome ${data.name}!`); // ✅
    console.log(`Email: ${data.email}`);   // ✅
  } else {
    console.log('Not a valid user object');
  }
}

// Example usage
const apiResponse = { id: 1, name: "John", email: "john@example.com" };
processApiResponse(apiResponse); // Works safely
```

## Array Type Guards with `Array.isArray()`

```typescript
function processStringOrArray(input: string | string[]) {
  if (Array.isArray(input)) {
    // TypeScript knows: input is string[]
    return input.join(', '); // ✅ Array methods available
  } else {
    // TypeScript knows: input is string
    return input.toUpperCase(); // ✅ String methods available
  }
}
```

## Advanced Pattern: Discriminated Unions with Type Guards

```typescript
interface LoadingState {
  status: 'loading';
}

interface SuccessState {
  status: 'success';
  data: string[];
}

interface ErrorState {
  status: 'error';
  message: string;
}

type AppState = LoadingState | SuccessState | ErrorState;

// Type guard using discriminant property
function isSuccessState(state: AppState): state is SuccessState {
  return state.status === 'success';
}

function isErrorState(state: AppState): state is ErrorState {
  return state.status === 'error';
}

function renderApp(state: AppState) {
  if (isSuccessState(state)) {
    // TypeScript knows: state is SuccessState
    return state.data.map(item => `<li>${item}</li>`); // ✅
  }
  
  if (isErrorState(state)) {
    // TypeScript knows: state is ErrorState
    return `<div class="error">${state.message}</div>`; // ✅
  }
  
  // TypeScript knows: state is LoadingState
  return '<div>Loading...</div>';
}
```

## Type Guards vs Assertions: When to Use Which

```typescript
// Type assertion - tells TypeScript "trust me"
function withAssertion(input: unknown) {
  const str = input as string; // ⚠️ Dangerous - no runtime check
  return str.toUpperCase(); // Will crash if input isn't string
}

// Type guard - proves the type at runtime
function withTypeGuard(input: unknown) {
  if (isString(input)) {
    return input.toUpperCase(); // ✅ Safe - checked at runtime
  }
  throw new Error('Expected string');
}
```

> **Best Practice** : Use type guards instead of type assertions when the type isn't guaranteed. Type guards provide both compile-time safety AND runtime safety.

## Compilation and Runtime Behavior

Understanding what happens at different stages:

```typescript
// Source TypeScript
function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function double(input: unknown) {
  if (isNumber(input)) {
    return input * 2; // TypeScript allows this
  }
  throw new Error('Not a number');
}
```

```javascript
// Compiled JavaScript (types removed, logic remains)
function isNumber(value) {
  return typeof value === 'number';
}

function double(input) {
  if (isNumber(input)) {
    return input * 2; // Still works at runtime
  }
  throw new Error('Not a number');
}
```

> **Key Insight** : Type guards work because they're real JavaScript code that performs actual runtime checks. TypeScript just understands their meaning for compile-time type checking.

## Common Gotchas and Best Practices

### Gotcha 1: Predicate Function Must Actually Check the Type

```typescript
// ❌ BAD: Predicate doesn't match the check
function isBadString(value: unknown): value is string {
  return typeof value === 'number'; // Logic bug!
}

// ✅ GOOD: Predicate matches the actual check
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

### Gotcha 2: Null and Undefined Handling

```typescript
// ❌ RISKY: Doesn't handle null
function isStringBad(value: unknown): value is string {
  return typeof value === 'string';
}

// ✅ BETTER: Explicit about null/undefined
function isStringGood(value: unknown): value is string {
  return typeof value === 'string' && value !== null;
}

// ✅ ALTERNATIVE: Use non-null assertion in type
function isNonNullString(value: unknown): value is NonNullable<string> {
  return typeof value === 'string' && value !== null;
}
```

### Best Practice: Compose Type Guards

```typescript
// Build complex checks from simple ones
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasProperty<K extends string>(
  obj: Record<string, unknown>,
  key: K
): obj is Record<K, unknown> {
  return key in obj;
}

function isUser(value: unknown): value is User {
  return (
    isObject(value) &&
    hasProperty(value, 'id') &&
    hasProperty(value, 'name') &&
    hasProperty(value, 'email') &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.email === 'string'
  );
}
```

Type guards are essential for safely working with dynamic data in TypeScript, providing the bridge between JavaScript's runtime flexibility and TypeScript's compile-time safety. They let you write code that's both type-safe and robust at runtime.
