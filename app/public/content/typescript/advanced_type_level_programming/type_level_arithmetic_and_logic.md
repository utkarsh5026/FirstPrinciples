# Type-Level Arithmetic and Logic in TypeScript

Type-level arithmetic and logic represents one of TypeScript's most powerful and mind-bending capabilities: performing computations purely within the type system, with zero runtime cost. Let's build this understanding from the ground up.

## JavaScript Foundation: Runtime Computation

First, let's understand what we're trying to achieve. In JavaScript, we perform arithmetic and logic at runtime:

```javascript
// Runtime arithmetic
function add(a, b) {
    return a + b;
}

// Runtime logic
function isEven(n) {
    return n % 2 === 0;
}

// Runtime string manipulation
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

console.log(add(5, 3)); // 8 (computed at runtime)
console.log(isEven(4)); // true (computed at runtime)
console.log(capitalize("hello")); // "Hello" (computed at runtime)
```

These operations happen when your code executes. But what if we could perform similar computations at compile time, in the type system itself?

## Why Type-Level Computation?

Type-level arithmetic and logic serves several purposes:

> **Key Mental Model** : Type-level computation happens during compilation, not execution. It's like having a separate computer that runs only during TypeScript compilation, performing calculations to determine types.

**Benefits:**

* **Zero runtime cost** - computations happen during compilation
* **Compile-time validation** - catch errors before code runs
* **API design** - create more expressive and type-safe interfaces
* **Code generation** - types that adapt based on input types

## Building Block 1: Literal Types

JavaScript values can become TypeScript types:

```typescript
// JavaScript runtime values
const num = 42;
const str = "hello";
const bool = true;

// TypeScript literal types (compile-time only)
type FortyTwo = 42;        // This type represents exactly the number 42
type Hello = "hello";      // This type represents exactly the string "hello"  
type True = true;          // This type represents exactly the boolean true

// Usage
let x: FortyTwo = 42;      // ✅ Valid
let y: FortyTwo = 43;      // ❌ Error: Type '43' is not assignable to type '42'
```

> **Type System Rule** : Literal types represent exact values, not ranges of values. The type `42` only accepts the value `42`, nothing else.

## Building Block 2: Template Literal Types

TypeScript can manipulate strings at the type level:

```typescript
// JavaScript string concatenation (runtime)
function greet(name) {
    return `Hello, ${name}!`;
}

// TypeScript template literal types (compile-time)
type Greet<Name extends string> = `Hello, ${Name}!`;

type Greeting1 = Greet<"Alice">;  // Type: "Hello, Alice!"
type Greeting2 = Greet<"Bob">;    // Type: "Hello, Bob!"

// The type system "computed" these strings at compile time!
```

Let's see string manipulation in action:

```typescript
// Capitalize first letter at type level
type Capitalize<S extends string> = S extends `${infer First}${infer Rest}`
    ? `${Uppercase<First>}${Rest}`
    : S;

type Result1 = Capitalize<"hello">;     // "Hello"
type Result2 = Capitalize<"world">;     // "World"
type Result3 = Capitalize<"">;          // ""

// This is string processing happening in the type system!
```

## Building Block 3: Conditional Types

These provide branching logic at the type level:

```typescript
// JavaScript conditional (runtime)
function isString(value) {
    return typeof value === 'string' ? true : false;
}

// TypeScript conditional type (compile-time)
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<"hello">;   // true
type Test2 = IsString<42>;        // false
type Test3 = IsString<boolean>;   // false
```

More complex conditional logic:

```typescript
// Type-level "if-else" chains
type TypeName<T> = 
    T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    T extends undefined ? "undefined" :
    T extends Function ? "function" :
    "object";

type A = TypeName<"hello">;      // "string"
type B = TypeName<42>;           // "number"
type C = TypeName<() => void>;   // "function"
```

## Building Block 4: Recursive Types

For iteration and complex computation:

```typescript
// JavaScript recursive function (runtime)
function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// TypeScript recursive type (compile-time)
type Factorial<N extends number> = 
    N extends 0 ? 1 :
    N extends 1 ? 1 :
    // We'll implement multiplication later!
    never; // Placeholder for now
```

## Type-Level Arithmetic: Addition

Now we can build actual arithmetic! We'll use tuples to represent numbers:

```typescript
// Helper: Create tuple of length N
type Tuple<N extends number, Result extends readonly unknown[] = []> = 
    Result['length'] extends N ? Result : Tuple<N, readonly [...Result, unknown]>;

type Five = Tuple<5>;  // [unknown, unknown, unknown, unknown, unknown]

// Addition by concatenating tuples
type Add<A extends number, B extends number> = 
    [...Tuple<A>, ...Tuple<B>]['length'];

type Sum1 = Add<3, 5>;    // 8
type Sum2 = Add<10, 7>;   // 17
type Sum3 = Add<0, 5>;    // 5

// This is addition happening purely in the type system!
```

Here's what's happening step by step:

```
Add<3, 5>
1. Tuple<3> creates [unknown, unknown, unknown]
2. Tuple<5> creates [unknown, unknown, unknown, unknown, unknown]  
3. [...Tuple<3>, ...Tuple<5>] creates [..., ..., ..., ..., ..., ..., ..., ...]
4. ['length'] gets 8
5. Result: 8
```

## Type-Level Arithmetic: Subtraction

```typescript
// Subtraction by removing elements
type Subtract<A extends number, B extends number> = 
    Tuple<A> extends readonly [...infer U, ...Tuple<B>] 
        ? U['length'] 
        : never;

type Diff1 = Subtract<8, 3>;   // 5
type Diff2 = Subtract<10, 4>;  // 6
type Diff3 = Subtract<3, 8>;   // never (can't subtract larger from smaller)
```

## Type-Level Arithmetic: Comparison

```typescript
// Greater than comparison
type GreaterThan<A extends number, B extends number> = 
    Subtract<A, B> extends never ? false : true;

type GT1 = GreaterThan<5, 3>;  // true
type GT2 = GreaterThan<3, 5>;  // false
type GT3 = GreaterThan<5, 5>;  // false

// Equal comparison  
type Equal<A extends number, B extends number> = 
    A extends B ? (B extends A ? true : false) : false;

type EQ1 = Equal<5, 5>;   // true
type EQ2 = Equal<5, 3>;   // false
```

## Type-Level Logic: Boolean Operations

```typescript
// AND operation
type And<A extends boolean, B extends boolean> = 
    A extends true ? (B extends true ? true : false) : false;

// OR operation  
type Or<A extends boolean, B extends boolean> = 
    A extends true ? true : (B extends true ? true : false);

// NOT operation
type Not<A extends boolean> = A extends true ? false : true;

type AndResult = And<true, false>;   // false
type OrResult = Or<true, false>;     // true
type NotResult = Not<true>;          // false
```

## Complex Example: FizzBuzz at Type Level

Let's implement the classic FizzBuzz logic in the type system:

```typescript
// Check if number is divisible by another
type Mod<A extends number, B extends number> = 
    A extends 0 ? 0 :
    GreaterThan<A, B> extends true 
        ? Mod<Subtract<A, B>, B>
        : A;

type IsDivisibleBy<A extends number, B extends number> = 
    Equal<Mod<A, B>, 0>;

// FizzBuzz logic
type FizzBuzz<N extends number> = 
    And<IsDivisibleBy<N, 3>, IsDivisibleBy<N, 5>> extends true ? "FizzBuzz" :
    IsDivisibleBy<N, 3> extends true ? "Fizz" :
    IsDivisibleBy<N, 5> extends true ? "Buzz" :
    N;

type FB1 = FizzBuzz<3>;   // "Fizz"
type FB2 = FizzBuzz<5>;   // "Buzz"  
type FB3 = FizzBuzz<15>;  // "FizzBuzz"
type FB4 = FizzBuzz<7>;   // 7
```

## Advanced: List Processing

Type-level operations on arrays/tuples:

```typescript
// Length of tuple
type Length<T extends readonly unknown[]> = T['length'];

// Head of tuple (first element)
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;

// Tail of tuple (all but first)
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : [];

// Reverse a tuple
type Reverse<T extends readonly unknown[]> = T extends readonly [...infer Rest, infer Last]
    ? [Last, ...Reverse<Rest>]
    : [];

type Numbers = [1, 2, 3, 4];
type Len = Length<Numbers>;        // 4
type First = Head<Numbers>;        // 1
type Rest = Tail<Numbers>;         // [2, 3, 4]
type Rev = Reverse<Numbers>;       // [4, 3, 2, 1]
```

## Real-World Application: API Route Validation

Here's how type-level computation creates better APIs:

```typescript
// Extract parameters from route string
type ExtractParams<Route extends string> = 
    Route extends `${string}:${infer Param}/${infer Rest}`
        ? Param | ExtractParams<Rest>
        : Route extends `${string}:${infer Param}`
        ? Param
        : never;

// Type-safe route handler
type RouteHandler<Route extends string> = (
    params: Record<ExtractParams<Route>, string>
) => Response;

// Usage
const userHandler: RouteHandler<"/users/:id/posts/:postId"> = (params) => {
    // params is typed as { id: string, postId: string }
    return new Response(`User ${params.id}, Post ${params.postId}`);
};

// The type system computed the parameter names from the route string!
```

## Performance and Limitations

> **Important Limitation** : TypeScript has recursion limits (usually around 50 levels) to prevent infinite loops in the type system. Complex type-level computation can hit these limits.

```typescript
// This will eventually hit recursion limits
type DeepRecursion<N extends number> = 
    N extends 0 ? 'done' : DeepRecursion<Subtract<N, 1>>;

// Use with caution for large numbers!
```

## Compilation Flow Diagram

```
Source Code
     ↓
Type Checker
     ↓
Type-Level Computation
├── Literal Types
├── Template Literals  
├── Conditional Types
├── Recursive Types
└── Tuple Manipulation
     ↓
Final Types
     ↓
JavaScript Output (types erased)
```

> **Key Insight** : All this computation happens during compilation. The final JavaScript has no trace of these type-level operations - they exist purely to help you write safer code.

Type-level arithmetic and logic transforms TypeScript from a simple type annotation system into a full computational environment that runs during compilation, enabling incredibly sophisticated type safety with zero runtime cost.
