# TypeScript Function Type Signatures: From First Principles

## JavaScript Function Fundamentals

Before diving into TypeScript's function typing, let's understand what we're building upon. In JavaScript, functions are first-class citizens - they can be assigned to variables, passed as arguments, and returned from other functions:

```javascript
// JavaScript - Functions are values
function greet(name) {
    return "Hello, " + name;
}

// Functions can be assigned to variables
const sayHello = greet;

// Functions can be passed as arguments
function callTwice(fn, arg) {
    fn(arg);
    fn(arg);
}

// Functions can return other functions
function createMultiplier(factor) {
    return function(number) {
        return number * factor;
    };
}
```

 **The Problem** : JavaScript's flexibility comes at a cost - there's no way to know what types of arguments a function expects or what it returns without reading the implementation or documentation.

## Why Function Type Signatures Matter

TypeScript solves this by adding **static type annotations** that describe:

* What types of parameters a function accepts
* What type of value it returns
* The "shape" or "contract" of the function

> **Key Mental Model** : Think of a function type signature as a contract that defines the interface between the caller and the function implementation.

Let's see the same JavaScript code with TypeScript annotations:

```typescript
// TypeScript - Clear contracts
function greet(name: string): string {
    return "Hello, " + name;
}

// Now the compiler knows what this function expects and returns
const sayHello: (name: string) => string = greet;

// Type-safe function parameters
function callTwice(fn: (arg: string) => void, arg: string): void {
    fn(arg);
    fn(arg);
}

// Return type is inferred, but we can be explicit
function createMultiplier(factor: number): (number: number) => number {
    return function(number: number): number {
        return number * factor;
    };
}
```

## Basic Function Declaration Signatures

### Function Declaration Syntax

```typescript
// Basic pattern: function name(param: Type): ReturnType
function add(a: number, b: number): number {
    return a + b;
}

// Without return type annotation (inferred)
function subtract(a: number, b: number) {
    return a - b; // TypeScript infers return type as 'number'
}

// Explicit void return type
function logMessage(message: string): void {
    console.log(message);
    // No return statement, or return; (implicit void)
}
```

### Compilation Flow

```
TypeScript Source     →     Type Checking     →     JavaScript Output
function add(a: number, b: number): number    →    function add(a, b) {
{                                                      return a + b;
    return a + b;                                  }
}
```

> **Important** : Type annotations exist only at compile time. They are completely removed from the final JavaScript output.

## Parameter Types Deep Dive

### Required Parameters

```typescript
function createUser(name: string, age: number, email: string): object {
    return { name, age, email };
}

// All parameters are required
createUser("Alice", 30, "alice@example.com"); // ✅ Valid
createUser("Alice", 30); // ❌ Error: Expected 3 arguments, but got 2
```

### Optional Parameters

```typescript
function createUser(name: string, age: number, email?: string): object {
    return { 
        name, 
        age, 
        email: email || "not provided" 
    };
}

createUser("Alice", 30); // ✅ Valid - email is optional
createUser("Alice", 30, "alice@example.com"); // ✅ Valid
```

> **Rule** : Optional parameters must come after required parameters. You cannot have a required parameter after an optional one.

### Default Parameters

```typescript
function createUser(name: string, age: number = 18, email: string = "unknown"): object {
    return { name, age, email };
}

// Default parameters are automatically optional
createUser("Alice"); // ✅ Valid
createUser("Alice", 25); // ✅ Valid  
createUser("Alice", 25, "alice@example.com"); // ✅ Valid
```

### Rest Parameters

```typescript
function sum(first: number, ...numbers: number[]): number {
    return first + numbers.reduce((acc, num) => acc + num, 0);
}

sum(1, 2, 3, 4, 5); // ✅ Valid
sum(1); // ✅ Valid - rest parameters create an empty array
```

## Return Types Deep Dive

### Explicit Return Types

```typescript
// Explicit return type ensures consistency
function getRandomNumber(): number {
    if (Math.random() > 0.5) {
        return 42;
    }
    return "random"; // ❌ Error: Type 'string' is not assignable to type 'number'
}
```

### Type Inference vs Explicit Annotation

```typescript
// TypeScript can infer simple return types
function multiply(a: number, b: number) {
    return a * b; // Inferred as number
}

// But explicit types are better for complex functions
function processData(data: unknown[]): { valid: any[], invalid: any[] } {
    // Complex logic here...
    // Explicit return type makes the contract clear
    return {
        valid: [],
        invalid: []
    };
}
```

### Void Return Type

```typescript
function logError(message: string): void {
    console.error(message);
    // Functions that don't return a value have 'void' return type
}

// Void functions can still have return statements
function processItem(item: string): void {
    if (!item) {
        return; // Early return is allowed
    }
    console.log(`Processing: ${item}`);
}
```

### Never Return Type

```typescript
// Functions that never return (throw or infinite loop)
function throwError(message: string): never {
    throw new Error(message);
    // This line is never reached
}

function infiniteLoop(): never {
    while (true) {
        // This function never returns
    }
}
```

## Function Expression Typing

### Arrow Function Signatures

```typescript
// Arrow function with explicit parameter and return types
const add = (a: number, b: number): number => {
    return a + b;
};

// Concise arrow function
const multiply = (a: number, b: number): number => a * b;

// Type annotation on the variable
const divide: (a: number, b: number) => number = (a, b) => a / b;
```

### Function Type Aliases

```typescript
// Create reusable function type signatures
type MathOperation = (a: number, b: number) => number;

// Use the type alias
const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;
const multiply: MathOperation = (a, b) => a * b;

// Functions that accept other functions
function calculate(operation: MathOperation, x: number, y: number): number {
    return operation(x, y);
}

calculate(add, 5, 3); // ✅ Valid
calculate((a, b) => a * b, 5, 3); // ✅ Valid inline function
```

### Function Interface Declarations

```typescript
// Interface for function shape
interface StringProcessor {
    (input: string): string;
}

// Implement the interface
const upperCase: StringProcessor = (input) => input.toUpperCase();
const reverse: StringProcessor = (input) => input.split('').reverse().join('');

// Function with multiple call signatures
interface Formatter {
    (value: string): string;
    (value: number): string;
    (value: boolean): string;
}

const format: Formatter = (value: string | number | boolean): string => {
    return String(value);
};
```

## Advanced Function Typing Patterns

### Callback Function Types

```typescript
// Typing callback functions
function fetchData(
    url: string, 
    onSuccess: (data: any) => void,
    onError: (error: Error) => void
): void {
    // Simulated async operation
    setTimeout(() => {
        if (Math.random() > 0.5) {
            onSuccess({ message: "Data loaded" });
        } else {
            onError(new Error("Failed to load"));
        }
    }, 1000);
}

// Usage with proper types
fetchData(
    "/api/users",
    (data) => console.log("Success:", data), // TypeScript knows data is 'any'
    (error) => console.error("Error:", error.message) // TypeScript knows error is 'Error'
);
```

### Higher-Order Function Types

```typescript
// Function that returns a function
type EventHandler<T> = (event: T) => void;
type EventUnsubscriber = () => void;

function addEventListener<T>(
    eventType: string, 
    handler: EventHandler<T>
): EventUnsubscriber {
    // Implementation would add the listener
    console.log(`Added listener for ${eventType}`);
  
    // Return unsubscriber function
    return () => {
        console.log(`Removed listener for ${eventType}`);
    };
}

// Usage
const unsubscribe = addEventListener<MouseEvent>('click', (event) => {
    console.log('Clicked at:', event.clientX, event.clientY);
});

unsubscribe(); // Clean up
```

## Function Signature Hierarchies

```
Function Type System
│
├── Function Declaration
│   ├── Required Parameters
│   ├── Optional Parameters (?)
│   ├── Default Parameters (=)
│   └── Rest Parameters (...)
│
├── Return Types
│   ├── Primitive Types (number, string, boolean)
│   ├── Object Types
│   ├── void (no return value)
│   └── never (never returns)
│
└── Function Expression Types
    ├── Arrow Functions
    ├── Function Variables
    ├── Type Aliases
    └── Interface Signatures
```

## Common Gotchas and Best Practices

> **Gotcha #1** : Function parameter types are checked by position, not by name.

```typescript
type Handler = (event: MouseEvent) => void;

// Parameter name doesn't matter, type position does
const clickHandler: Handler = (e) => {
    // 'e' is automatically typed as MouseEvent
    console.log(e.clientX);
};

const anotherHandler: Handler = (mouseEvent) => {
    // 'mouseEvent' is also typed as MouseEvent
    console.log(mouseEvent.clientY);
};
```

> **Gotcha #2** : TypeScript is structural, not nominal - function compatibility is based on shape.

```typescript
type NumberProcessor = (n: number) => number;
type MathFunction = (x: number) => number;

const double: NumberProcessor = (n) => n * 2;
const square: MathFunction = (x) => x * x;

// These are compatible because they have the same structure
const process: NumberProcessor = square; // ✅ Valid
```

> **Best Practice** : Always type function parameters, but return types can often be inferred.

```typescript
// Good: Explicit parameter types, inferred return type
function processUser(name: string, age: number) {
    return { name: name.toUpperCase(), age };
}

// Also good: Explicit return type for complex functions
function complexCalculation(data: number[]): { result: number; metadata: object } {
    // Complex logic...
    return {
        result: 42,
        metadata: { processed: data.length }
    };
}
```

> **Best Practice** : Use function type aliases for reusable function signatures.

```typescript
// Instead of repeating the same signature
function map(arr: number[], fn: (n: number) => number): number[] { /* */ }
function filter(arr: number[], fn: (n: number) => boolean): number[] { /* */ }

// Define once, reuse everywhere
type NumberPredicate = (n: number) => boolean;
type NumberTransform = (n: number) => number;

function map(arr: number[], fn: NumberTransform): number[] { /* */ }
function filter(arr: number[], fn: NumberPredicate): number[] { /* */ }
```

Function type signatures are the foundation of TypeScript's type safety. They create clear contracts between function callers and implementations, catching errors at compile time rather than runtime. By understanding these patterns, you can write more robust and maintainable code.
