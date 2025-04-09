# Generic Classes and Methods in TypeScript: From First Principles

I'll explain generics in TypeScript from the ground up, starting with the most fundamental concepts and gradually building toward more complex applications.

## Understanding the Need for Generics

Let's begin by understanding why generics exist in the first place.

Imagine you're writing a function that returns the first element of an array:

```typescript
function getFirstElement(arr: any[]): any {
  return arr[0];
}

const numbers = [1, 2, 3];
const firstNumber = getFirstElement(numbers);
```

Notice the problem here? Even though we know `firstNumber` should be a number, TypeScript only knows it as `any`. We've lost type information. When we later try to use `firstNumber`, we won't get proper type checking or autocompletion.

To understand why this matters, consider what might happen next:

```typescript
// TypeScript won't complain about this because firstNumber is 'any'
const result = firstNumber.toUppercase(); // Runtime error!
```

This will fail at runtime because numbers don't have a `toUppercase` method. But TypeScript won't catch this error during development because it doesn't know `firstNumber` is a number.

## Enter Generics: A First Definition

Generics allow us to create reusable components that work with a variety of types while preserving type information. They act as type variables that can be filled in later.

Let's rewrite our function using generics:

```typescript
function getFirstElement<T>(arr: T[]): T {
  return arr[0];
}

const numbers = [1, 2, 3];
const firstNumber = getFirstElement(numbers); // TypeScript infers firstNumber as number

// Now TypeScript will catch this error
// const result = firstNumber.toUppercase(); // Error: Property 'toUppercase' does not exist on type 'number'
```

Here `T` is a type parameter. When we call `getFirstElement` with an array of numbers, TypeScript substitutes `T` with `number`.

## The Mechanics of Generic Type Parameters

Let's break down what's happening:

1. We declare a type parameter `T` using angle brackets `<T>`.
2. We use `T` in the function signature to indicate the relationship between the input and output types.
3. When the function is called, TypeScript infers what `T` should be based on the arguments.

You can think of `T` as a placeholder that gets replaced with an actual type when the function is used.

## Generic Classes: The Fundamentals

Now let's explore generic classes. A generic class follows the same principle: it has a type parameter that preserves type information across its methods and properties.

Here's a simple example of a Box class that can hold any type of value:

```typescript
class Box<T> {
  private content: T;

  constructor(value: T) {
    this.content = value;
  }

  getContent(): T {
    return this.content;
  }
}

// Create a box that holds a string
const stringBox = new Box("Hello TypeScript");
const greeting = stringBox.getContent(); // Type is string

// Create a box that holds a number
const numberBox = new Box(42);
const answer = numberBox.getContent(); // Type is number
```

The beauty of this approach is that `stringBox.getContent()` returns a value of type `string`, while `numberBox.getContent()` returns a value of type `number`. The type information is preserved.

## Multiple Type Parameters

Both generic functions and classes can have multiple type parameters:

```typescript
// A function with two type parameters
function createPair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const pair = createPair("age", 30); // Type is [string, number]

// A class with two type parameters
class Dictionary<K, V> {
  private items: Record<string, V> = {};

  add(key: K, value: V): void {
    const stringKey = String(key);
    this.items[stringKey] = value;
  }

  get(key: K): V | undefined {
    const stringKey = String(key);
    return this.items[stringKey];
  }
}

const nameToAge = new Dictionary<string, number>();
nameToAge.add("Alice", 28);
const aliceAge = nameToAge.get("Alice"); // Type is number | undefined
```

## Generic Constraints: Limiting Type Parameters

Sometimes you want to restrict what types can be used with your generic components. For example, you might want to ensure a type parameter has certain properties:

```typescript
// T must have a 'length' property
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

// Works with strings
const stringLength = getLength("Hello"); // 5

// Works with arrays
const arrayLength = getLength([1, 2, 3]); // 3

// Works with any object that has a length property
const customLength = getLength({ length: 10, name: "Custom" }); // 10

// Error: Number doesn't have a length property
// const numberLength = getLength(42);
```

The `extends` keyword is used to define constraints. Here, `T extends { length: number }` means "`T` must be a type that has a `length` property of type `number`."

## Default Type Parameters

Like function parameters, type parameters can have defaults:

```typescript
// ID defaults to number if not specified
class Entity<ID = number> {
  id: ID;
  
  constructor(id: ID) {
    this.id = id;
  }
}

// Uses the default type (number)
const numberEntity = new Entity(1);
const id1 = numberEntity.id; // Type is number

// Overrides the default with string
const stringEntity = new Entity<string>("abc");
const id2 = stringEntity.id; // Type is string
```

## Generic Methods Within Classes

Classes can have generic methods, even if the class itself isn't generic:

```typescript
class Utilities {
  // A generic method in a non-generic class
  map<T, U>(items: T[], fn: (item: T) => U): U[] {
    return items.map(fn);
  }
}

const utils = new Utilities();
const numbers = [1, 2, 3];
const strings = utils.map(numbers, n => n.toString()); // Type is string[]
```

A generic class can also have methods with their own type parameters:

```typescript
class Container<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  // Method with its own type parameter U
  transform<U>(fn: (value: T) => U): Container<U> {
    return new Container(fn(this.value));
  }
}

const numberContainer = new Container(42);
// Transform to string container
const stringContainer = numberContainer.transform(n => n.toString());
// stringContainer is of type Container<string>
```

## Practical Examples: Building a Collection Class

Let's build a more complex example to see how generics can be used in practice. We'll create a generic Collection class that manages a set of items:

```typescript
class Collection<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  remove(item: T): void {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  // Generic method with constraint
  find<S extends T>(predicate: (item: T) => item is S): S[] {
    return this.items.filter(predicate) as S[];
  }

  // Another generic method
  map<U>(mapper: (item: T) => U): Collection<U> {
    const result = new Collection<U>();
    this.items.forEach(item => {
      result.add(mapper(item));
    });
    return result;
  }

  getAll(): T[] {
    return [...this.items];
  }
}

// Create a collection of numbers
const numbers = new Collection<number>();
numbers.add(1);
numbers.add(2);
numbers.add(3);

// Use the map method to transform numbers to strings
const strings = numbers.map(n => n.toString());
// strings is of type Collection<string>

// Type guard for even numbers
function isEven(n: number): n is number {
  return n % 2 === 0;
}

// Find all even numbers
const evenNumbers = numbers.find(isEven);
// evenNumbers is of type number[]
```

This example demonstrates several key concepts:
- A generic class (`Collection<T>`)
- Generic methods within a generic class (`map<U>` and `find<S>`)
- Generic constraints (`S extends T`)
- Type predicates with generics (`predicate: (item: T) => item is S`)

## Generic Interfaces: Defining Contracts

Interfaces can also be generic, which is useful for defining contracts that work with different types:

```typescript
interface Repository<T> {
  findById(id: string): T | undefined;
  save(item: T): void;
  delete(id: string): boolean;
  findAll(): T[];
}

// Implement the interface for a specific type
class UserRepository implements Repository<User> {
  private users: User[] = [];
  
  findById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }
  
  save(user: User): void {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
  }
  
  delete(id: string): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
  
  findAll(): User[] {
    return [...this.users];
  }
}

interface User {
  id: string;
  name: string;
}
```

## Conditional Types: Advanced Type Relationships

TypeScript also supports conditional types, which select a type based on a condition:

```typescript
// A type that is either T or an array of T, depending on a boolean
type ArrayOrSingle<T, IsArray extends boolean> = 
  IsArray extends true ? T[] : T;

// Usage
const single: ArrayOrSingle<number, false> = 42; // Type is number
const array: ArrayOrSingle<number, true> = [1, 2, 3]; // Type is number[]
```

This gets more powerful when combined with the `infer` keyword, which can extract types from other types:

```typescript
// Extract the return type of a function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function createUser(): User {
  return { id: "1", name: "Alice" };
}

// UserType is inferred as User
type UserType = ReturnType<typeof createUser>;
```

## Practical Applications and Best Practices

Now that we've covered the fundamentals, let's look at some best practices and common patterns:

### 1. Use Descriptive Type Parameter Names

For simple cases, `T`, `U`, `V`, etc., are fine. But for more complex code, descriptive names improve readability:

```typescript
// Less clear
function process<T, U>(input: T, handler: (data: T) => U): U {
  return handler(input);
}

// More clear
function process<InputType, OutputType>(
  input: InputType, 
  handler: (data: InputType) => OutputType
): OutputType {
  return handler(input);
}
```

### 2. Combining Generics with Union Types

Generics and union types can be combined for powerful type definitions:

```typescript
// A result that can be either success or error
interface Result<T, E extends Error> {
  status: 'success' | 'error';
  data?: T;
  error?: E;
}

function fetchData(): Result<User, ApiError> {
  try {
    // Fetch logic here
    return { 
      status: 'success', 
      data: { id: '1', name: 'Alice' } 
    };
  } catch (e) {
    return { 
      status: 'error', 
      error: new ApiError('Failed to fetch user') 
    };
  }
}

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### 3. Generic Factory Functions

Factory functions that create objects can benefit from generics:

```typescript
function createState<T>(initialValue: T) {
  let value = initialValue;
  
  return {
    get: () => value,
    set: (newValue: T) => { value = newValue },
    reset: () => { value = initialValue }
  };
}

const numberState = createState(0);
const count = numberState.get(); // Type is number
numberState.set(10); // Only accepts numbers

const stringState = createState("hello");
const message = stringState.get(); // Type is string
stringState.set("world"); // Only accepts strings
```

## Real-World Example: A Data Service

Let's bring many of these concepts together in a practical example. Here's a simple data service that might be used in a web application:

```typescript
// Define entity types
interface Entity {
  id: string;
}

interface User extends Entity {
  name: string;
  email: string;
}

interface Product extends Entity {
  title: string;
  price: number;
}

// Generic data service that works with any entity type
class DataService<T extends Entity> {
  private items: Map<string, T> = new Map();

  async findById(id: string): Promise<T | undefined> {
    // Simulate async operation
    return Promise.resolve(this.items.get(id));
  }

  async findAll(): Promise<T[]> {
    return Promise.resolve(Array.from(this.items.values()));
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const id = this.generateId();
    const newItem = { ...item as any, id } as T;
    this.items.set(id, newItem);
    return Promise.resolve(newItem);
  }

  async update(id: string, updates: Partial<Omit<T, 'id'>>): Promise<T | undefined> {
    const existing = this.items.get(id);
    if (!existing) {
      return Promise.resolve(undefined);
    }
    
    const updated = { ...existing, ...updates };
    this.items.set(id, updated);
    return Promise.resolve(updated);
  }

  async delete(id: string): Promise<boolean> {
    return Promise.resolve(this.items.delete(id));
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}

// Create specialized services
const userService = new DataService<User>();
const productService = new DataService<Product>();

// Usage examples
async function example() {
  // Create a user
  const user = await userService.create({
    name: "John Doe",
    email: "john@example.com"
  });
  
  // Update the user
  await userService.update(user.id, { name: "John Smith" });
  
  // Create a product
  const product = await productService.create({
    title: "Laptop",
    price: 999
  });
  
  // TypeScript ensures type safety
  // This would cause a compilation error:
  // await productService.update(product.id, { email: "invalid@example.com" });
}
```

This example showcases:
- Generic constraints (`T extends Entity`)
- Advanced type manipulation (`Omit<T, 'id'>`, `Partial<Omit<T, 'id'>>`)
- Practical application of generics in a real-world scenario

## Conclusion

Generics in TypeScript provide a powerful way to create reusable components while maintaining type safety. They allow you to write code that works with a variety of types without sacrificing the benefits of static typing.

Key takeaways:
1. Generics preserve type information across functions, classes, and interfaces
2. Type parameters can be constrained using the `extends` keyword
3. Multiple type parameters can be used for more complex relationships
4. Generic classes can have generic methods with their own type parameters
5. Generics can be combined with other TypeScript features for powerful type definitions

By understanding and applying these principles, you can write more flexible, reusable, and type-safe code in TypeScript.