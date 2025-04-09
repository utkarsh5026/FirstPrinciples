# TypeScript Generic Functions: From First Principles

Generic functions are one of the most powerful features in TypeScript, allowing you to write flexible, reusable code while maintaining type safety. Let's explore this concept from the ground up, building our understanding step by step.

## The Problem: Type-Safe Reusability

To understand why we need generics, let's start with a simple problem. Imagine you want to write a function that returns whatever value is passed to it:

```typescript
function identity(arg: number): number {
  return arg;
}
```

This function works fine for numbers, but what if you want to pass a string? You'd need another function:

```typescript
function identityString(arg: string): string {
  return arg;
}
```

This quickly becomes impractical. You'd need separate functions for each type. You might try using `any`:

```typescript
function identity(arg: any): any {
  return arg;
}
```

But this loses type information. If you pass a string, TypeScript no longer knows the return value is a string. This defeats the purpose of using a typed language like TypeScript.

## The Solution: Generic Functions

Generics solve this problem by allowing you to create a "type variable" that captures the type provided by the user:

```typescript
function identity<T>(arg: T): T {
  return arg;
}
```

Here, `T` is a type variable that preserves the type information of whatever is passed in. Let's break down what's happening:

1. `<T>` declares a type parameter (or type variable)
2. `(arg: T)` says the argument should be of type T
3. `: T` says the function returns a value of type T

Now you can use this function with any type, and TypeScript preserves type information:

```typescript
let output1 = identity<string>("hello"); // output1 is type string
let output2 = identity<number>(42);      // output2 is type number
```

TypeScript can also infer the type argument, so you can simply write:

```typescript
let output1 = identity("hello"); // TypeScript infers type string
let output2 = identity(42);      // TypeScript infers type number
```

## Multiple Type Parameters

Generic functions can have multiple type parameters. Let's create a function that pairs two values:

```typescript
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// Usage
const result = pair("hello", 42); // TypeScript infers [string, number]
```

This gives us immense flexibility while maintaining type safety.

## Constraints on Type Parameters

Sometimes, you want to restrict what types can be used with your generic function. TypeScript allows this using the `extends` keyword:

```typescript
interface HasLength {
  length: number;
}

function logAndReturnLength<T extends HasLength>(arg: T): number {
  console.log(arg.length);
  return arg.length;
}

// These work
logAndReturnLength("hello");       // string has .length
logAndReturnLength([1, 2, 3]);     // arrays have .length
logAndReturnLength({length: 10});  // object explicitly has .length

// This would cause a type error
// logAndReturnLength(42);  // Error: number doesn't have .length
```

Here, `T extends HasLength` means the type parameter must be a type that has a `length` property of type `number`.

## Default Type Parameters

You can provide default types for your type parameters:

```typescript
function createContainer<T = string>(value: T): { value: T } {
  return { value };
}

// Type is { value: string }
const stringContainer = createContainer("hello");

// Type is { value: number }
const numberContainer = createContainer<number>(42);
```

Here, if no type is explicitly provided and cannot be inferred, `T` defaults to `string`.

## Generic Arrow Functions

Generic functions can also be written as arrow functions:

```typescript
const identity = <T>(arg: T): T => {
  return arg;
};
```

In JSX contexts, you might need to add a comma after the type parameter to help TypeScript distinguish from JSX tags:

```typescript
const identity = <T,>(arg: T): T => {
  return arg;
};
```

## Practical Example: A Filter Function

Let's create a more practical example - a type-safe filter function:

```typescript
function filter<T>(array: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return result;
}

// Usage with numbers
const numbers = [1, 2, 3, 4, 5];
const evenNumbers = filter(numbers, num => num % 2 === 0);
// evenNumbers: number[] = [2, 4]

// Usage with objects
interface Person {
  name: string;
  age: number;
}

const people: Person[] = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 42 },
  { name: "Charlie", age: 31 }
];

const over30 = filter(people, person => person.age > 30);
// over30: Person[] = [{ name: "Bob", age: 42 }, { name: "Charlie", age: 31 }]
```

This function works with arrays of any type and preserves that type information in its return value.

## Generic Function as Methods

Generic functions can be methods in classes or interfaces:

```typescript
class Collection<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  // Generic method in a generic class
  map<U>(mapper: (item: T) => U): U[] {
    return this.items.map(mapper);
  }
}

const numbers = new Collection<number>();
numbers.add(1);
numbers.add(2);
numbers.add(3);

// Transform numbers to strings
const numberStrings = numbers.map(n => n.toString());
// numberStrings: string[] = ["1", "2", "3"]
```

Notice how the `map` method introduces its own type parameter `U`, which can be different from the class's type parameter `T`.

## Generic Function Overloads

You can create function overloads with generics for more specific type checking:

```typescript
function processValue<T extends string>(value: T): string[];
function processValue<T extends number>(value: T): number;
function processValue<T extends string | number>(value: T): string[] | number {
  if (typeof value === "string") {
    return value.split("");
  } else {
    return value * 2;
  }
}

const result1 = processValue("hello"); // string[]
const result2 = processValue(42);      // number
```

## Working with the Element Type of Arrays

A common pattern is to extract the element type from an array:

```typescript
function first<T>(array: T[]): T | undefined {
  return array[0];
}

const numbers = [1, 2, 3];
const firstNumber = first(numbers); // Type is number | undefined
```

## Conditional Types with Generics

TypeScript allows you to create conditional types, which are especially powerful with generics:

```typescript
type ArrayElementType<T> = T extends (infer U)[] ? U : never;

// Usage
type NumberArrayElement = ArrayElementType<number[]>; // number
type StringArrayElement = ArrayElementType<string[]>; // string
type NotAnArray = ArrayElementType<number>;          // never
```

Here, `infer U` is asking TypeScript to determine what type `U` would be if `T` extends `U[]`.

## Generic Function Type Signatures

You can define generic function types:

```typescript
// Define a generic function type
type Mapper<T, U> = (item: T) => U;

// Use it
const toNumber: Mapper<string, number> = str => parseInt(str, 10);
const toString: Mapper<number, string> = num => num.toString();
```

## Common Mistakes with Generic Functions

### Not Constraining Types Appropriately

```typescript
// Problematic: Not constraining the type
function getProperty<T, K>(obj: T, key: K) {
  return obj[key]; // Error: K is not constrained to be a key of T
}

// Better: Constrain K to be keyof T
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // Works fine
}
```

### Overuse of Generics

Generics add complexity, so only use them when needed:

```typescript
// Unnecessarily complex
function logMessage<T>(message: T): void {
  console.log(message);
}

// Simpler
function logMessage(message: unknown): void {
  console.log(message);
}
```

## Real-World Example: A Data Manager

Let's combine several concepts in a practical example:

```typescript
class DataManager<T> {
  private data: T[] = [];

  add(item: T): void {
    this.data.push(item);
  }

  find<K extends keyof T>(property: K, value: T[K]): T | undefined {
    return this.data.find(item => item[property] === value);
  }

  filter<K extends keyof T>(property: K, value: T[K]): T[] {
    return this.data.filter(item => item[property] === value);
  }

  map<U>(transformer: (item: T) => U): U[] {
    return this.data.map(transformer);
  }
}

// Usage with a specific type
interface Product {
  id: number;
  name: string;
  price: number;
}

const productManager = new DataManager<Product>();

productManager.add({ id: 1, name: "Laptop", price: 1200 });
productManager.add({ id: 2, name: "Phone", price: 800 });
productManager.add({ id: 3, name: "Tablet", price: 400 });

// Find a product by id
const laptop = productManager.find("id", 1);
// laptop: Product | undefined

// Filter products by price
const cheapProducts = productManager.filter("price", 400);
// cheapProducts: Product[]

// Transform products to another format
const productNames = productManager.map(product => product.name);
// productNames: string[]
```

This example demonstrates how generics enable us to build flexible, type-safe abstractions.

## Conclusion

Generic functions in TypeScript provide a powerful way to write reusable, flexible code without sacrificing type safety. They allow you to:

1. Create functions that work with multiple types
2. Preserve type information throughout your code
3. Apply constraints to type parameters for additional safety
4. Build complex, reusable abstractions

By mastering generic functions, you unlock one of TypeScript's most powerful features, enabling you to write more elegant, maintainable, and type-safe code.