# Working with Generic Parameters in TypeScript

Generic parameters are one of TypeScript's most powerful features, allowing you to create flexible, reusable code that maintains type safety. Let's explore this concept from first principles, building our understanding step by step.

## The Fundamental Concept

At its core, a generic parameter is a placeholder for a type that will be specified later. It allows you to write code that can work with many different types while still maintaining type safety.

Think of generic parameters like variables, but instead of holding values, they hold types. Just as you might write a function with a parameter `x` that can take different values when called, you can write a function with a type parameter `T` that can take different types when used.

## Declaring Generic Parameters

Generic parameters are typically declared inside angle brackets `<>`. You can use any valid identifier, but by convention, single uppercase letters starting with `T` are common:

```typescript
// T is a generic parameter
function identity<T>(value: T): T {
  return value;
}
```

This simple function takes a value of type `T` and returns a value of the same type. The actual type of `T` is determined when the function is called.

## Using Generic Functions

When you use a generic function, TypeScript often infers the type parameter:

```typescript
// TypeScript infers T as string
const result1 = identity("hello");  

// TypeScript infers T as number
const result2 = identity(42);      
```

You can also explicitly specify the type parameter:

```typescript
const result3 = identity<boolean>(true);
```

Let's break down what happens when you call a generic function:

1. You call the function with an argument
2. TypeScript either infers the type parameter from the argument or uses your explicitly provided type
3. TypeScript replaces all occurrences of the type parameter with the actual type
4. The function executes with these specific types

## Multiple Generic Parameters

You can declare multiple generic parameters when you need to track multiple types:

```typescript
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

// Types: [string, number]
const result = pair("age", 30);
```

Let's look at a more practical example of a function that merges two objects:

```typescript
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

const person = merge(
  { name: "Alice" },  // T is inferred as { name: string }
  { age: 30 }         // U is inferred as { age: number }
);

// person has type { name: string; age: number; }
console.log(person.name); // "Alice"
console.log(person.age);  // 30
```

## Constraining Generic Parameters

Often, you'll want to restrict what types can be used with your generic parameters. You can do this with the `extends` keyword:

```typescript
// T must have a length property
function getLength<T extends { length: number }>(value: T): number {
  return value.length;
}

// Works with strings
getLength("hello");      // Returns: 5

// Works with arrays
getLength([1, 2, 3]);    // Returns: 3

// Works with any object that has a length property
getLength({ length: 10, value: "test" });  // Returns: 10

// Error: number doesn't have a length property
// getLength(42);
```

This constraint ensures that whatever type `T` is, it must have a `length` property of type `number`. This is more precise than just using `any` or `unknown`.

Let's see a more practical example with constraints:

```typescript
interface Entity {
  id: number | string;
}

function findById<T extends Entity>(
  entities: T[], 
  id: T["id"]
): T | undefined {
  return entities.find(entity => entity.id === id);
}

interface User extends Entity {
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" }
];

// TypeScript knows this returns User | undefined
const user = findById(users, 1);

// Safe to access user properties if we check it exists
if (user) {
  console.log(user.name);  // "Alice"
}
```

## Default Type Parameters

You can provide default types for generic parameters:

```typescript
// T defaults to string if not specified
function createState<T = string>(): { value: T | null; setValue: (value: T) => void } {
  let state: T | null = null;
  
  return {
    value: state,
    setValue(value: T) {
      state = value;
    }
  };
}

// Uses the default type (string)
const stringState = createState();
stringState.setValue("hello");
// stringState.setValue(42);  // Error: number is not assignable to string

// Explicitly provides number as the type
const numberState = createState<number>();
numberState.setValue(42);
// numberState.setValue("hello");  // Error: string is not assignable to number
```

## Generic Classes

Generic parameters work with classes as well:

```typescript
class Box<T> {
  private value: T;

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  getValue(): T {
    return this.value;
  }

  setValue(newValue: T): void {
    this.value = newValue;
  }
}

// Create a Box that holds numbers
const numberBox = new Box<number>(42);
console.log(numberBox.getValue());  // 42
numberBox.setValue(100);
// numberBox.setValue("hello");  // Error: string is not assignable to number

// Create a Box that holds strings
const stringBox = new Box<string>("hello");
console.log(stringBox.getValue());  // "hello"
// stringBox.setValue(42);  // Error: number is not assignable to string
```

This class can store and retrieve values of any type while maintaining type safety.

Let's implement a more practical example: a generic cache class:

```typescript
class Cache<T> {
  private cache: Map<string, T> = new Map();

  set(key: string, value: T): void {
    this.cache.set(key, value);
  }

  get(key: string): T | undefined {
    return this.cache.get(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Cache for storing user objects
interface User {
  id: number;
  name: string;
}

const userCache = new Cache<User>();
userCache.set("user-1", { id: 1, name: "Alice" });

const user = userCache.get("user-1");
if (user) {
  console.log(user.name);  // "Alice"
}

// Cache for storing number values
const numberCache = new Cache<number>();
numberCache.set("pi", 3.14159);
console.log(numberCache.get("pi"));  // 3.14159
```

## Generic Interfaces

Generic parameters are frequently used with interfaces:

```typescript
interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  save(item: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// Implementing the generic interface with a specific type
class UserRepository implements Repository<User> {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return user || null;
  }

  async save(user: User): Promise<User> {
    const index = this.users.findIndex(u => u.id === user.id);
    
    if (index >= 0) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    
    if (index >= 0) {
      this.users.splice(index, 1);
      return true;
    }
    
    return false;
  }
}

// Now we can use it
const userRepo = new UserRepository();
userRepo.save({ id: "1", name: "Alice", email: "alice@example.com" });
```

## Generic Type Aliases

Type aliases can also take generic parameters:

```typescript
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return {
      success: false,
      error: "Division by zero"
    };
  }
  
  return {
    success: true,
    data: a / b
  };
}

const result = divide(10, 2);

if (result.success) {
  console.log("Result:", result.data);  // Result: 5
} else {
  console.log("Error:", result.error);
}

const errorResult = divide(10, 0);

if (errorResult.success) {
  console.log("Result:", errorResult.data);
} else {
  console.log("Error:", errorResult.error);  // Error: Division by zero
}
```

## Advanced Usage Patterns

### 1. Generic Parameter Inference from Method Parameters

TypeScript can infer generic parameters from function arguments:

```typescript
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

interface Person {
  name: string;
  age: number;
}

const people: Person[] = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 }
];

// TypeScript infers T as Person and K as "name"
const names = pluck(people, "name");  // string[]

// TypeScript infers T as Person and K as "age"
const ages = pluck(people, "age");    // number[]
```

This function extracts a specific property from each object in an array. The type of the resulting array depends on the property being extracted.

### 2. Generic Parameter Defaults with Constraints

You can combine constraints with default types:

```typescript
interface WithId {
  id: string | number;
}

// T must extend WithId, and defaults to { id: string, name: string }
function createEntity<T extends WithId = { id: string, name: string }>(data: T): T {
  console.log(`Creating entity with ID: ${data.id}`);
  return data;
}

// Uses the default type
const entity1 = createEntity({ id: "1", name: "Default Entity" });

// Provides a custom type
interface Product extends WithId {
  id: string;
  title: string;
  price: number;
}

const entity2 = createEntity<Product>({ 
  id: "2", 
  title: "Custom Product", 
  price: 29.99 
});
```

### 3. Using Generic Parameters with Function Overloads

Function overloads with generic parameters allow for different behavior based on input types:

```typescript
function process<T>(value: T[]): T[];
function process<T>(value: T): T;
function process<T>(value: T | T[]): T | T[] {
  if (Array.isArray(value)) {
    return [...value].reverse();
  }
  
  return value;
}

const result1 = process([1, 2, 3]);          // [3, 2, 1]
const result2 = process("hello");            // "hello"
```

## Practical Examples

### Example 1: Type-Safe Event Emitter

```typescript
type Listener<T> = (event: T) => void;

class EventEmitter<EventMap> {
  private listeners: Map<keyof EventMap, Listener<any>[]> = new Map();

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(listener);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    if (!this.listeners.has(event)) {
      return;
    }
    
    for (const listener of this.listeners.get(event)!) {
      listener(data);
    }
  }
}

// Usage example
interface AppEvents {
  userLoggedIn: { userId: string; timestamp: number };
  userLoggedOut: { userId: string; timestamp: number };
  error: { message: string; code: number };
}

const eventBus = new EventEmitter<AppEvents>();

// Type-safe event listeners
eventBus.on("userLoggedIn", (data) => {
  // TypeScript knows data has userId and timestamp
  console.log(`User ${data.userId} logged in at ${new Date(data.timestamp).toISOString()}`);
});

eventBus.on("error", (data) => {
  // TypeScript knows data has message and code
  console.log(`Error ${data.code}: ${data.message}`);
});

// Type-safe event emission
eventBus.emit("userLoggedIn", { 
  userId: "user123", 
  timestamp: Date.now() 
});

eventBus.emit("error", { 
  message: "Something went wrong", 
  code: 500 
});

// Type error - missing required properties
// eventBus.emit("userLoggedIn", { userId: "user123" });

// Type error - wrong event type
// eventBus.emit("userLoggedOut", { message: "test", code: 123 });
```

### Example 2: Generic React Component

If you're using TypeScript with React, generics are extremely useful for typing components:

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string;
}

// A generic List component that can work with any type of items
function List<T>({ 
  items, 
  renderItem, 
  keyExtractor = (_, index) => String(index) 
}: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item, index)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}

// Usage with different types
interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

// Later in your component:
// TypeScript infers T as User
<List 
  items={users}
  renderItem={(user) => <span>{user.name}</span>}
  keyExtractor={(user) => String(user.id)}
/>

const numbers = [1, 2, 3, 4, 5];

// TypeScript infers T as number
<List 
  items={numbers}
  renderItem={(num) => <span>{num * 2}</span>}
/>
```

## Common Pitfalls and Tips

### 1. Excessive Use of Generics

While generics are powerful, using them excessively can make your code harder to understand:

```typescript
// Too many generic parameters can be confusing
function complexOperation<T, U, V, W, X>(
  input1: T,
  input2: U,
  callback: (a: T, b: U) => V,
  transformer: (c: V) => W,
  options: X
): W {
  const intermediateResult = callback(input1, input2);
  return transformer(intermediateResult);
}
```

Instead, consider breaking down complex functions or using more descriptive type aliases:

```typescript
type CallbackFn<T, U, V> = (a: T, b: U) => V;
type TransformerFn<V, W> = (c: V) => W;

function improvedOperation<T, U, V, W>(
  input1: T,
  input2: U,
  callback: CallbackFn<T, U, V>,
  transformer: TransformerFn<V, W>
): W {
  const intermediateResult = callback(input1, input2);
  return transformer(intermediateResult);
}
```

### 2. Forgetting Generic Constraints

Without constraints, you can't safely access properties on generic types:

```typescript
// This will cause a type error
function badGetName<T>(obj: T): string {
  return obj.name; // Error: Property 'name' does not exist on type 'T'
}

// Fixed version with constraint
function getName<T extends { name: string }>(obj: T): string {
  return obj.name; // Works now!
}
```

### 3. Not Using Specific Enough Types

Sometimes developers use overly general generic parameters when more specific ones would provide better type safety:

```typescript
// Too general
function processItems<T>(items: T[]): T[] {
  return items.filter(item => Boolean(item));
}

// More specific with constraints
function processItems<T extends object>(items: T[]): T[] {
  return items.filter(item => Object.keys(item).length > 0);
}
```

## Best Practices

### 1. Use Meaningful Names for Complex Generics

For simple cases, `T`, `U`, etc. are fine, but for complex generics, more descriptive names improve readability:

```typescript
// Instead of this
function fetch<T, U>(url: string, options: T): Promise<U> {
  // ...
}

// Use this
function fetch<Options, ResponseData>(
  url: string, 
  options: Options
): Promise<ResponseData> {
  // ...
}
```

### 2. Limit the Number of Generic Parameters

Try to keep the number of generic parameters to a minimum. If you need many, consider whether your function is trying to do too much.

### 3. Use Type Inference When Possible

Let TypeScript infer type parameters when possible to make your code cleaner:

```typescript
// Instead of this
const result = identity<string>("hello");

// Just do this
const result = identity("hello");
```

### 4. Combine Generics with Union Types for Flexibility

```typescript
type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

interface Success<T> {
  success: true;
  data: T;
}

interface Failure<E extends Error> {
  success: false;
  error: E;
}

function tryCatch<T, E extends Error = Error>(
  fn: () => T
): Result<T, E> {
  try {
    return {
      success: true,
      data: fn()
    };
  } catch (error) {
    return {
      success: false,
      error: error as E
    };
  }
}
```

## Conclusion

Generic parameters are a fundamental building block of TypeScript's type system, allowing you to create flexible, reusable, and type-safe code. By understanding how to declare, constrain, and use generic parameters effectively, you can build abstractions that work with a variety of types while maintaining strong type safety.

Remember that the goal of generics is to capture the relationship between input and output types, enabling you to write code once that works with many types. Used properly, generic parameters lead to more maintainable, robust, and self-documenting code.

As you continue working with TypeScript, you'll discover more advanced patterns and techniques for using generic parameters. The key is to start with simple use cases and gradually incorporate more complex patterns as you become comfortable with the basics.