# TypeScript Conditional Types: Deep Dive from First Principles

## JavaScript Foundation: The Problem We're Solving

Let's start with pure JavaScript to understand why conditional types exist:

```javascript
// JavaScript: We often need different behavior based on input types
function processValue(value) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // Returns string
  } else if (typeof value === 'number') {
    return value.toString(); // Returns string  
  } else if (Array.isArray(value)) {
    return value.length; // Returns number
  }
  return null; // Returns null
}

// The problem: We can't express the relationship between 
// input type and return type at compile time
const result1 = processValue("hello"); // We know this is string, but JS doesn't
const result2 = processValue(42); // We know this is string, but JS doesn't
const result3 = processValue([1,2,3]); // We know this is number, but JS doesn't
```

In JavaScript, we can check types at runtime, but we have no way to express "if the input is type A, then the output is type B" at the type level.

## Basic TypeScript Without Conditional Types: The Limitation

Here's how we might try to solve this with basic TypeScript:

```typescript
// Attempt 1: Function overloads (verbose and limited)
function processValue(value: string): string;
function processValue(value: number): string;
function processValue(value: any[]): number;
function processValue(value: any): string | number | null {
  if (typeof value === 'string') {
    return value.toUpperCase();
  } else if (typeof value === 'number') {
    return value.toString();
  } else if (Array.isArray(value)) {
    return value.length;
  }
  return null;
}

// This works but doesn't scale well and can't be reused as a type
```

## Enter Conditional Types: Type-Level If Statements

Conditional types allow us to express "if-then-else" logic at the type level:

```typescript
// Basic syntax: T extends U ? X : Y
// Read as: "If T extends (is assignable to) U, then X, else Y"

type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>;    // true
type Test2 = IsString<number>;    // false
type Test3 = IsString<"hello">;   // true (string literal extends string)
```

> **Key Mental Model** : Conditional types are like ternary operators (`condition ? a : b`) but they operate on types instead of values, and they're evaluated by the TypeScript compiler, not at runtime.

## Understanding the `extends` Keyword in Conditional Types

```typescript
// "extends" in conditional types means "is assignable to" or "is a subtype of"

type CanAssign<T, U> = T extends U ? "YES" : "NO";

type Example1 = CanAssign<string, any>;        // "YES" - string extends any
type Example2 = CanAssign<any, string>;        // "YES" - any extends everything  
type Example3 = CanAssign<"hello", string>;    // "YES" - literal extends string
type Example4 = CanAssign<string, "hello">;    // "NO" - string doesn't extend literal
type Example5 = CanAssign<number, string>;     // "NO" - number doesn't extend string

// With object types
type Example6 = CanAssign<{a: number}, {a: number, b: string}>;  // "NO"
type Example7 = CanAssign<{a: number, b: string}, {a: number}>;  // "YES"
```

> **Critical Rule** : In conditional types, `A extends B` means "A is assignable to B", which is the opposite direction from what you might expect. A more specific type extends a more general type.

## Building Complexity: Inferring Return Types

Now let's solve our original problem with conditional types:

```typescript
// Step 1: Create a conditional type that maps input types to output types
type ProcessReturnType<T> = 
  T extends string ? string :
  T extends number ? string :
  T extends any[] ? number :
  null;

// Step 2: Use it in our function
function processValue<T>(value: T): ProcessReturnType<T> {
  if (typeof value === 'string') {
    return (value as any).toUpperCase(); // Type assertion needed due to TS limitations
  } else if (typeof value === 'number') {
    return (value as any).toString();
  } else if (Array.isArray(value)) {
    return (value as any).length;
  }
  return null as any;
}

// Now TypeScript knows the exact return type!
const result1 = processValue("hello");   // Type: string
const result2 = processValue(42);        // Type: string  
const result3 = processValue([1,2,3]);   // Type: number
const result4 = processValue({});        // Type: null
```

## The `infer` Keyword: Extracting Types from Other Types

The `infer` keyword lets us extract and capture types from within conditional type checks:

```typescript
// Basic example: Extract the return type of a function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Example1 = ReturnType<() => string>;           // string
type Example2 = ReturnType<(x: number) => boolean>; // boolean
type Example3 = ReturnType<string>;                 // never (not a function)

// How it works:
// 1. Check if T extends a function type (...args: any[]) => infer R
// 2. If yes, capture whatever the return type is into R and return R
// 3. If no, return never
```

Let's break down the `infer` process step by step:

```typescript
// Step-by-step breakdown of how infer works
type ExtractReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// When we do: ExtractReturnType<(x: number) => string>
// 1. TypeScript checks: Does (x: number) => string extend (...args: any[]) => infer R?
// 2. TypeScript tries to match the pattern:
//    - (...args: any[]) matches (x: number) ✓
//    - infer R matches string, so R = string ✓
// 3. Since the pattern matches, return R (which is string)

// More complex example: Extract array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type Test1 = ArrayElement<string[]>;     // string
type Test2 = ArrayElement<number[]>;     // number  
type Test3 = ArrayElement<boolean[][]>;  // boolean[]
type Test4 = ArrayElement<string>;       // never
```

## Advanced Pattern: Multiple Inferences

```typescript
// Extract multiple types at once
type FunctionInfo<T> = T extends (first: infer A, second: infer B) => infer R 
  ? {
      firstParam: A;
      secondParam: B; 
      returnType: R;
    }
  : never;

type ExampleFunction = (name: string, age: number) => boolean;
type Info = FunctionInfo<ExampleFunction>;
// Type: { firstParam: string; secondParam: number; returnType: boolean; }

// Extract promise value type
type PromiseValue<T> = T extends Promise<infer U> ? U : T;

type Test1 = PromiseValue<Promise<string>>;  // string
type Test2 = PromiseValue<Promise<number>>;  // number
type Test3 = PromiseValue<string>;           // string (not a promise)
```

## Distributive Conditional Types: Working with Union Types

When conditional types meet union types, something special happens:

```typescript
// Basic distributive behavior
type ToArray<T> = T extends any ? T[] : never;

type Result1 = ToArray<string>;           // string[]
type Result2 = ToArray<string | number>;  // string[] | number[]

// How distribution works:
// ToArray<string | number> becomes:
// ToArray<string> | ToArray<number> becomes:
// string[] | number[]
```

Let's see this in action with a practical example:

```typescript
// Filter out certain types from a union
type NonNullable<T> = T extends null | undefined ? never : T;

type Example1 = NonNullable<string | null | undefined>;  // string
type Example2 = NonNullable<number | null>;              // number
type Example3 = NonNullable<boolean | undefined>;        // boolean

// Step by step for Example1:
// NonNullable<string | null | undefined>
// = NonNullable<string> | NonNullable<null> | NonNullable<undefined>
// = string | never | never  
// = string (never disappears from unions)
```

## Preventing Distribution with Tuples

Sometimes you don't want distributive behavior:

```typescript
// Distributive (default behavior)
type Distributive<T> = T extends any ? T[] : never;
type Result1 = Distributive<string | number>; // string[] | number[]

// Non-distributive (wrap in tuple to prevent distribution)
type NonDistributive<T> = [T] extends [any] ? T[] : never;
type Result2 = NonDistributive<string | number>; // (string | number)[]

// Real-world example: Convert union to intersection
type UnionToIntersection<U> = 
  (U extends any ? (x: U) => void : never) extends (x: infer I) => void 
    ? I 
    : never;

type Union = { a: string } | { b: number };
type Intersection = UnionToIntersection<Union>; // { a: string } & { b: number }
```

## Type-Level Computation: Building Complex Logic

Now let's explore how conditional types enable computation at the type level:

```typescript
// Type-level arithmetic (length calculation)
type Length<T extends readonly any[]> = T['length'];

type Len1 = Length<[1, 2, 3]>;      // 3
type Len2 = Length<[]>;             // 0
type Len3 = Length<[string, number]>; // 2

// Type-level string manipulation
type Head<T extends string> = T extends `${infer H}${string}` ? H : never;
type Tail<T extends string> = T extends `${string}${infer T}` ? T : never;

type FirstChar = Head<"hello">;  // "h"
type LastChar = Tail<"hello">;   // "o"

// More complex: Check if string starts with prefix
type StartsWith<T extends string, Prefix extends string> = 
  T extends `${Prefix}${string}` ? true : false;

type Test1 = StartsWith<"hello world", "hello">; // true
type Test2 = StartsWith<"hello world", "world">; // false
```

## Advanced Example: Object Key Manipulation

```typescript
// Remove keys that start with underscore
type RemovePrivateKeys<T> = {
  [K in keyof T as K extends `_${string}` ? never : K]: T[K]
};

type Original = {
  name: string;
  _id: number;
  age: number;
  _secret: boolean;
};

type Public = RemovePrivateKeys<Original>; 
// Type: { name: string; age: number; }

// Make properties optional if they extend certain types
type OptionalIfString<T> = {
  [K in keyof T as T[K] extends string ? K : never]?: T[K]
} & {
  [K in keyof T as T[K] extends string ? never : K]: T[K]
};

type Example = OptionalIfString<{
  name: string;
  age: number;
  email: string;
}>;
// Type: { name?: string; email?: string; age: number; }
```

## Recursive Conditional Types: Deep Type Operations

TypeScript allows recursive conditional types (with depth limits):

```typescript
// Deep readonly: Make all nested properties readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? DeepReadonly<T[P]> 
    : T[P];
};

type NestedObject = {
  user: {
    profile: {
      name: string;
      settings: {
        theme: string;
      };
    };
  };
};

type ReadonlyNested = DeepReadonly<NestedObject>;
// All properties at all levels are now readonly

// Flatten nested arrays
type Flatten<T> = T extends (infer U)[] 
  ? U extends any[] 
    ? Flatten<U>
    : U
  : T;

type Test1 = Flatten<number[]>;        // number
type Test2 = Flatten<number[][]>;      // number  
type Test3 = Flatten<number[][][]>;    // number
type Test4 = Flatten<string>;          // string
```

## Pattern Matching with Conditional Types

```typescript
// Advanced pattern: Parse URL parameters
type ParseRoute<T extends string> = 
  T extends `${string}/:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ParseRoute<`/${Rest}`>
    : T extends `${string}/:${infer Param}`
      ? { [K in Param]: string }
      : {};

type Route1 = ParseRoute<"/users/:id/posts/:postId">;
// Type: { id: string; postId: string; }

type Route2 = ParseRoute<"/users/:userId">;  
// Type: { userId: string; }

// JSON type parsing
type ParseJSON<T extends string> = 
  T extends "true" ? true :
  T extends "false" ? false :
  T extends "null" ? null :
  T extends `${infer N extends number}` ? N :
  T extends `"${infer S}"` ? S :
  never;

type JSON1 = ParseJSON<"true">;    // true
type JSON2 = ParseJSON<"42">;      // 42
type JSON3 = ParseJSON<'"hello"'>; // "hello"
```

## Real-World Application: API Response Types

```typescript
// Conditional types for API responses based on status
type APIResponse<TData, TError = unknown> = {
  status: 'success';
  data: TData;
  error?: never;
} | {
  status: 'error';
  data?: never;
  error: TError;
} | {
  status: 'loading';
  data?: never;
  error?: never;
};

// Extract data type based on status
type ExtractData<T> = T extends { status: 'success'; data: infer D } ? D : never;
type ExtractError<T> = T extends { status: 'error'; error: infer E } ? E : never;

type UserResponse = APIResponse<{ id: number; name: string }, string>;
type UserData = ExtractData<UserResponse>; // { id: number; name: string }
type UserError = ExtractError<UserResponse>; // string

// Function that handles responses with proper typing
function handleResponse<T extends APIResponse<any, any>>(
  response: T
): T extends { status: 'success' } 
  ? ExtractData<T> 
  : T extends { status: 'error' } 
    ? never 
    : undefined {
  
  if (response.status === 'success') {
    return response.data as any; // TypeScript knows this is the data type
  } else if (response.status === 'error') {
    throw new Error(response.error as any);
  }
  return undefined as any;
}
```

## Performance Considerations and Limitations

```typescript
// TypeScript has depth limits for recursive types
type DeepArray<T, Depth extends any[] = []> = 
  Depth['length'] extends 10 
    ? T
    : Array<DeepArray<T, [...Depth, any]>>;

// This will eventually hit TypeScript's recursion limit

// Use iteration instead of deep recursion when possible
type SafeDeepReadonly<T, Depth extends readonly any[] = []> = 
  Depth['length'] extends 50 
    ? T 
    : {
        readonly [P in keyof T]: T[P] extends object 
          ? SafeDeepReadonly<T[P], readonly [...Depth, any]>
          : T[P];
      };
```

> **Best Practice** : Keep conditional type depth reasonable. TypeScript has limits (around 50 levels) to prevent infinite recursion. Use iteration patterns or helper types to manage complexity.

## Debugging Conditional Types

```typescript
// Use helper types to debug complex conditional logic
type DebugConditional<T> = T extends string 
  ? `String: ${T}` 
  : T extends number 
    ? `Number: ${T}`
    : T extends boolean
      ? `Boolean: ${T}`
      : `Other: ${T & string}`;

type Debug1 = DebugConditional<"hello">; // "String: hello"
type Debug2 = DebugConditional<42>;      // "Number: 42"
type Debug3 = DebugConditional<true>;    // "Boolean: true"

// Use intermediate types to break down complex logic
type ComplexConditional<T> = 
  IsArray<T> extends true 
    ? ArrayElementType<T>
    : IsFunction<T> extends true
      ? FunctionReturnType<T>
      : T;

type IsArray<T> = T extends any[] ? true : false;
type ArrayElementType<T> = T extends (infer U)[] ? U : never;
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
type FunctionReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
```

## ASCII Diagram: Conditional Type Evaluation Flow

```
Input Type T
     |
     v
Does T extend U?
     |
  +--+--+
  |     |
 Yes    No
  |     |
  v     v
Type X Type Y
  |     |
  +--+--+
     |
     v
 Result Type
```

## Common Gotchas and Mental Models

> **Gotcha 1** : Conditional types are evaluated lazily. They're only resolved when actually used, not when defined.

> **Gotcha 2** : The `extends` relationship in conditional types can be counterintuitive. Remember: more specific types extend more general types.

> **Gotcha 3** : Distributive behavior happens automatically with naked type parameters but can be prevented by wrapping in tuples.

> **Mental Model** : Think of conditional types as pattern matching on types, similar to how you might pattern match on values in functional programming languages.

Conditional types are one of TypeScript's most powerful features, enabling type-level computation that can express complex relationships between input and output types. They bridge the gap between runtime logic and compile-time type safety, allowing you to encode sophisticated business rules directly into your type system.

The key is to start simple and build complexity gradually, always keeping in mind that these computations happen at compile time and result in precise type information that helps catch errors before runtime.
