# TypeScript Primitive Types: Deep Dive from First Principles

## JavaScript Foundation: Understanding Values and Types

Before we dive into TypeScript, let's understand how JavaScript handles values and types at runtime.

### JavaScript's Dynamic Type System

In JavaScript, variables don't have types - **values** have types. The language determines what type a value is while your program is running:

```javascript
// JavaScript - types are determined at runtime
let data = "hello";        // string value
console.log(typeof data);  // "string"

data = 42;                 // now a number value
console.log(typeof data);  // "number"

data = true;               // now a boolean value
console.log(typeof data);  // "boolean"
```

> **Key Mental Model** : JavaScript is *dynamically typed* - it figures out types as your program runs, and variables can hold any type of value at any time.

## Enter TypeScript: Static Type Checking

TypeScript adds a **static type system** on top of JavaScript. This means:

```
Compile Time          Runtime
─────────────────    ─────────────────
TypeScript Code  →   JavaScript Code
Type Checking        Dynamic Execution
```

> **Static Typing** : TypeScript analyzes your code *before* it runs and catches type-related errors during development, not when users are using your app.

Now let's explore each primitive type in depth.

---

## String Type Deep Dive

### JavaScript String Behavior

```javascript
// JavaScript strings - any text wrapped in quotes
let message = "Hello World";
let template = `Welcome ${message}`;
let char = 'A';

// All string operations work at runtime
console.log(message.length);        // 11
console.log(message.toUpperCase()); // "HELLO WORLD"
console.log(template);              // "Welcome Hello World"
```

### TypeScript String Enhancement

```typescript
// TypeScript - explicit type annotation
let message: string = "Hello World";

// TypeScript prevents type errors at compile time
message = 42;  // ❌ Error: Type 'number' is not assignable to type 'string'

// But allows all valid string operations
let length: number = message.length;        // ✅ TypeScript knows this returns number
let upper: string = message.toUpperCase();  // ✅ TypeScript knows this returns string
```

### String Type Inference

```typescript
// TypeScript can infer types without explicit annotations
let inferredString = "Hello";  // TypeScript infers: string
let template = `Count: ${42}`; // TypeScript infers: string

// Inference works with function returns too
function getName(): string {
    return "John";
}

let name = getName();  // TypeScript infers: string
```

> **Type Inference Rule** : If you initialize a variable with a value, TypeScript automatically determines the type from that value.

---

## Number Type Deep Dive

### JavaScript Number Behavior

```javascript
// JavaScript has one number type for all numeric values
let integer = 42;
let decimal = 3.14;
let scientific = 1e5;     // 100000
let hex = 0xFF;           // 255
let binary = 0b1010;      // 10
let infinity = Infinity;
let notANumber = NaN;

// All are typeof "number"
console.log(typeof integer);   // "number"
console.log(typeof decimal);   // "number" 
console.log(typeof infinity);  // "number"
console.log(typeof notANumber); // "number" (confusing!)
```

### TypeScript Number Enhancement

```typescript
// TypeScript uses the same number type as JavaScript
let count: number = 42;
let price: number = 19.99;
let scientific: number = 1e10;

// TypeScript catches obvious errors
count = "hello";  // ❌ Error: Type 'string' is not assignable to type 'number'

// But includes JavaScript's quirks
let result: number = NaN;      // ✅ Valid - NaN is a number in JavaScript
let infinite: number = Infinity; // ✅ Valid - Infinity is a number
```

### Number Operations and Safety

```typescript
// TypeScript ensures type safety in operations
function calculateTotal(price: number, tax: number): number {
    return price + tax;  // ✅ TypeScript knows both are numbers
}

// Prevents mixing types accidentally
let price = "19.99";  // string
let tax = 0.08;       // number
// calculateTotal(price, tax);  // ❌ Error: string not assignable to number

// Correct usage
let numericPrice = parseFloat(price);
calculateTotal(numericPrice, tax);  // ✅ Both numbers now
```

> **JavaScript Quirk Alert** : `NaN` and `Infinity` are technically numbers in JavaScript, so TypeScript accepts them as valid `number` values.

---

## Boolean Type Deep Dive

### JavaScript Boolean Behavior

```javascript
// JavaScript booleans - true or false
let isActive = true;
let isComplete = false;

// JavaScript's truthy/falsy conversion
let truthyValue = Boolean("hello");    // true
let falsyValue = Boolean("");          // false
let autoConvert = !!42;                // true (double negation)

// Falsy values in JavaScript:
// false, 0, -0, 0n, "", null, undefined, NaN
```

### TypeScript Boolean Enhancement

```typescript
// TypeScript boolean type - only true or false
let isVisible: boolean = true;
let isEnabled: boolean = false;

// TypeScript is strict about boolean assignment
isVisible = 1;        // ❌ Error: Type 'number' is not assignable to type 'boolean'
isVisible = "true";   // ❌ Error: Type 'string' is not assignable to type 'boolean'
isVisible = !!1;      // ✅ Valid: !! converts to actual boolean
```

### Boolean Context and Type Guards

```typescript
// TypeScript understands boolean context
function processIfActive(isActive: boolean) {
    if (isActive) {
        // TypeScript knows isActive is true here
        console.log("Processing...");
    }
}

// Type guards with boolean returns
function isString(value: unknown): value is string {
    return typeof value === "string";  // Returns boolean
}

let someValue: unknown = "hello";
if (isString(someValue)) {
    // TypeScript now knows someValue is string here
    console.log(someValue.toUpperCase());  // ✅ Safe string operation
}
```

---

## Null and Undefined: The "Nothing" Values

### JavaScript Null vs Undefined

```javascript
// Two different "nothing" values in JavaScript
let explicitNothing = null;        // Intentional absence
let uninitialized;                 // undefined by default
let missing = undefined;           // Explicit undefined

// Different typeof results
console.log(typeof null);          // "object" (JavaScript quirk!)
console.log(typeof undefined);     // "undefined"

// Equality quirks
console.log(null == undefined);    // true (loose equality)
console.log(null === undefined);   // false (strict equality)
```

### TypeScript Null and Undefined Types

```typescript
// TypeScript treats null and undefined as distinct types
let explicitNull: null = null;
let explicitUndefined: undefined = undefined;

// Cannot assign to other types (with strict null checks)
let message: string = null;        // ❌ Error (with strictNullChecks)
let count: number = undefined;     // ❌ Error (with strictNullChecks)
```

### Strict Null Checks Configuration

```typescript
// Without strict null checks (not recommended)
let name: string = null;           // ✅ Allowed but dangerous

// With strict null checks (recommended - default in modern TS)
let name: string = null;           // ❌ Error: Type 'null' is not assignable to type 'string'

// Proper handling with union types
let name: string | null = null;    // ✅ Explicitly allows null
let age: number | undefined = undefined;  // ✅ Explicitly allows undefined
```

### Working with Nullable Values

```typescript
// Checking before use
function greetUser(name: string | null) {
    if (name !== null) {
        // TypeScript knows name is string here
        console.log(`Hello, ${name.toUpperCase()}`);
    } else {
        console.log("Hello, stranger!");
    }
}

// Optional chaining (modern JavaScript/TypeScript)
interface User {
    profile?: {
        name?: string;
    };
}

function getUserName(user: User): string | undefined {
    return user.profile?.name;  // Safely access nested optional properties
}
```

---

## Type System Rules and Mental Models

> **Compile Time vs Runtime Separation**
>
> ```
> TypeScript (Compile Time)     JavaScript (Runtime)
> ─────────────────────────    ─────────────────────
> type string = "hello"    →   let x = "hello"
> Type checking happens    →   No type checking
> Catches errors early     →   Errors happen when code runs
> Types are erased         →   Only values exist
> ```

> **The Any Escape Hatch**
>
> TypeScript provides `any` to disable type checking:
>
> ```typescript
> let dangerous: any = "string";
> dangerous = 42;           // ✅ No error, but defeats purpose
> dangerous.foo.bar.baz;    // ✅ No error, but will crash at runtime
> ```
>
> Use sparingly when migrating JavaScript or interfacing with dynamic content.

### Primitive Type Hierarchy

```
TypeScript Type System
├── Primitive Types
│   ├── string
│   ├── number  
│   ├── boolean
│   ├── null
│   ├── undefined
│   ├── symbol (ES6+)
│   └── bigint (ES2020+)
├── Object Types
└── Special Types (any, unknown, never, void)
```

## Common Gotchas and Best Practices

> **Gotcha #1: JavaScript typeof quirks carry over**
>
> ```typescript
> typeof null === "object"  // true in both JS and TS!
> ```

> **Gotcha #2: NaN is a number**
>
> ```typescript
> let result: number = NaN;  // ✅ Valid but often not intended
> ```

> **Best Practice: Always enable strict null checks**
>
> ```json
> // tsconfig.json
> {
>   "compilerOptions": {
>     "strict": true,           // Enables all strict checks
>     "strictNullChecks": true  // Or enable just this one
>   }
> }
> ```

## Why Static Typing Matters

TypeScript's primitive types solve real JavaScript problems:

```typescript
// JavaScript runtime error
function addTax(price, rate) {
    return price * rate;  // What if price is "19.99" (string)?
}

// TypeScript compile-time prevention
function addTax(price: number, rate: number): number {
    return price * rate;  // ✅ Guaranteed to be numeric multiplication
}
```

The type system catches these errors during development, not when users encounter them in production. This is the fundamental value proposition of TypeScript's approach to JavaScript enhancement.
