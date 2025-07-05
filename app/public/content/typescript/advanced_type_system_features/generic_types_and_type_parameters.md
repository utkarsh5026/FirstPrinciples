# Generic Types and Type Parameters: Creating Reusable Type Definitions

Let's build up to TypeScript generics by first understanding the JavaScript foundation and the problems they solve.

## The JavaScript Foundation: Functions That Work With Any Type

In JavaScript, we often write functions that work with different types of data:

```javascript
// JavaScript: A function that works with any type
function getFirstItem(array) {
    return array[0];
}

// Works with numbers
const firstNumber = getFirstItem([1, 2, 3]); // Returns 1
// Works with strings  
const firstString = getFirstItem(['a', 'b', 'c']); // Returns 'a'
// Works with objects
const firstUser = getFirstItem([{name: 'Alice'}, {name: 'Bob'}]); // Returns {name: 'Alice'}
```

This flexibility is powerful, but it comes with a cost:  **we lose type information** . The function works, but we don't know what type it returns.

## The Type Safety Problem

When we try to add basic TypeScript types to this pattern, we hit a wall:

```typescript
// TypeScript: Overly specific - only works with numbers
function getFirstNumber(array: number[]): number {
    return array[0];
}

// TypeScript: Too general - loses all type information
function getFirstItem(array: any[]): any {
    return array[0];
}

const result = getFirstItem([1, 2, 3]); 
// ❌ result is type 'any' - no type safety!
// TypeScript can't help us catch errors like:
result.toUpperCase(); // Runtime error - numbers don't have toUpperCase()
```

> **The Core Problem** : We want functions that are flexible enough to work with different types, but specific enough to maintain type safety. We need a way to say "this function works with some type T, and when you give me T, I'll give you back T."

## Enter Generics: Type Parameters

Generics allow us to create **type parameters** - placeholders for types that get filled in when the function is used:

```typescript
// Generic function with type parameter T
function getFirstItem<T>(array: T[]): T {
    return array[0];
}

// T gets "filled in" based on usage:
const firstNumber = getFirstItem([1, 2, 3]);        // T becomes number
const firstString = getFirstItem(['a', 'b', 'c']);  // T becomes string
const firstUser = getFirstItem([{name: 'Alice'}]);  // T becomes {name: string}

// ✅ TypeScript now knows the exact return types!
console.log(firstNumber.toFixed(2));     // ✅ Works - number has toFixed()
console.log(firstString.toUpperCase());  // ✅ Works - string has toUpperCase()
console.log(firstUser.name);             // ✅ Works - object has name property
```

## Understanding the Syntax: `<T>`

Let's break down the generic syntax piece by piece:

```typescript
function getFirstItem<T>(array: T[]): T {
//                   ^^^         ^^^  ^^^
//                   |           |    |
//         Type parameter    Parameter  Return type
//         declaration       uses T     uses T
}
```

### Visual Representation:

```
Function Declaration Flow:
┌─────────────────┐
│ 1. Declare <T>  │ ──┐
└─────────────────┘   │
                      │
┌─────────────────┐   │
│ 2. Use T in     │ ←─┤
│    parameters   │   │
└─────────────────┘   │
                      │
┌─────────────────┐   │
│ 3. Use T in     │ ←─┘
│    return type  │
└─────────────────┘
```

> **Key Mental Model** : Think of `<T>` as declaring a variable for types. Just like function parameters let you pass values, type parameters let you pass types.

## Type Inference: TypeScript's Smart Deduction

TypeScript can often figure out the type parameter automatically:

```typescript
function identity<T>(value: T): T {
    return value;
}

// Explicit type parameter (manual specification)
const result1 = identity<string>("hello");

// Type inference (TypeScript figures it out)
const result2 = identity("hello");  // T automatically becomes string

// Both result1 and result2 have type string
```

**When does TypeScript infer vs when must you specify?**

```typescript
function createArray<T>(length: number, value: T): T[] {
    return Array(length).fill(value);
}

// ✅ Inference works - T inferred as number from value
const numbers = createArray(3, 42);

// ❌ Can't infer T - no value to infer from
function createEmptyArray<T>(length: number): T[] {
    return [];
}

// Must specify explicitly:
const emptyStrings = createEmptyArray<string>(5);
```

## Generic Interfaces: Reusable Type Structures

Generics aren't limited to functions. They're incredibly powerful with interfaces:

```typescript
// JavaScript: A container that holds any type
const numberContainer = {
    value: 42,
    getValue() { return this.value; }
};

const stringContainer = {
    value: "hello",
    getValue() { return this.value; }
};
```

```typescript
// TypeScript: Generic interface for type-safe containers
interface Container<T> {
    value: T;
    getValue(): T;
    setValue(newValue: T): void;
}

// Create specific container types
const numberContainer: Container<number> = {
    value: 42,
    getValue() { return this.value; },
    setValue(newValue) { this.value = newValue; } // newValue must be number
};

const stringContainer: Container<string> = {
    value: "hello",
    getValue() { return this.value; },
    setValue(newValue) { this.value = newValue; } // newValue must be string
};

// ✅ Type safe operations
numberContainer.setValue(100);        // ✅ Works
stringContainer.setValue("world");    // ✅ Works

// ❌ Type errors caught at compile time
numberContainer.setValue("oops");     // ❌ Error: string not assignable to number
```

## Generic Classes: Stateful Generic Behavior

Classes can also be generic, creating reusable, type-safe data structures:

```typescript
class Stack<T> {
    private items: T[] = [];
  
    push(item: T): void {
        this.items.push(item);
    }
  
    pop(): T | undefined {
        return this.items.pop();
    }
  
    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }
  
    get length(): number {
        return this.items.length;
    }
}

// Create type-specific stacks
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
const num = numberStack.pop(); // Type: number | undefined

const stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");
const str = stringStack.pop(); // Type: string | undefined

// ❌ Type safety prevents mixing types
numberStack.push("invalid"); // ❌ Error: string not assignable to number
```

## Multiple Type Parameters: More Complex Relationships

You can have multiple type parameters to express more complex relationships:

```typescript
// A key-value pair structure
interface KeyValuePair<K, V> {
    key: K;
    value: V;
}

// A function that transforms one type to another
function map<T, U>(array: T[], transform: (item: T) => U): U[] {
    return array.map(transform);
}

// Usage examples:
const stringNumbers = ["1", "2", "3"];
const actualNumbers = map(stringNumbers, (str) => parseInt(str));
//    T = string, U = number
//    actualNumbers has type number[]

const users = [{name: "Alice", age: 30}];
const names = map(users, (user) => user.name);
//    T = {name: string, age: number}, U = string
//    names has type string[]
```

### Visual Type Flow:

```
map<T, U> Function:
Input: T[]     Transform: T => U     Output: U[]
   ↓               ↓                    ↓
string[]    (str) => parseInt(str)   number[]
   ↓               ↓                    ↓
  ["1"]           1 → 1                [1]
```

## Generic Constraints: Restricting Type Parameters

Sometimes you need type parameters to have certain properties:

```typescript
// Problem: T might not have a length property
function logLength<T>(item: T): void {
    console.log(item.length); // ❌ Error: Property 'length' does not exist on type 'T'
}
```

**Solution: Generic constraints with `extends`**

```typescript
// Constraint: T must have a length property
interface HasLength {
    length: number;
}

function logLength<T extends HasLength>(item: T): T {
    console.log(`Length: ${item.length}`);
    return item; // Return the original item with full type information
}

// ✅ Works with arrays
logLength([1, 2, 3]);        // T = number[], has length property

// ✅ Works with strings  
logLength("hello");          // T = string, has length property

// ✅ Works with custom objects that have length
logLength({length: 5, data: "something"}); // T = {length: number, data: string}

// ❌ Doesn't work with types that lack length
logLength(42);               // ❌ Error: number doesn't have length property
```

> **Generic Constraints Rule** : `T extends SomeType` means "T must be assignable to SomeType" - T can be SomeType or any subtype of SomeType.

## Advanced Constraint Patterns

### Keyof Constraints

```typescript
// Get a property value safely with type preservation
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user = {name: "Alice", age: 30, email: "alice@example.com"};

const name = getProperty(user, "name");   // Type: string
const age = getProperty(user, "age");     // Type: number
const email = getProperty(user, "email"); // Type: string

// ❌ Prevents accessing non-existent properties
const invalid = getProperty(user, "height"); // ❌ Error: "height" not in keyof user
```

### Conditional Constraints

```typescript
// Only allow arrays or objects that can be safely cloned
type Cloneable = string | number | boolean | object;

function deepClone<T extends Cloneable>(item: T): T {
    if (typeof item === 'object') {
        return JSON.parse(JSON.stringify(item));
    }
    return item;
}

const clonedUser = deepClone({name: "Alice"}); // ✅ Works
const clonedNumber = deepClone(42);            // ✅ Works
const clonedFunction = deepClone(() => {});    // ❌ Error: function not cloneable
```

## Real-World Example: Building a Generic Repository

Let's combine everything into a practical example:

```typescript
// Generic repository for CRUD operations
interface Entity {
    id: string | number;
}

class Repository<T extends Entity> {
    private items: T[] = [];
  
    // Create: Add new item
    create(item: Omit<T, 'id'>): T {
        const newItem = {
            ...item,
            id: Math.random().toString(36)
        } as T;
      
        this.items.push(newItem);
        return newItem;
    }
  
    // Read: Find by ID
    findById(id: T['id']): T | undefined {
        return this.items.find(item => item.id === id);
    }
  
    // Update: Modify existing item
    update(id: T['id'], updates: Partial<T>): T | undefined {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return undefined;
      
        this.items[index] = {...this.items[index], ...updates};
        return this.items[index];
    }
  
    // Delete: Remove item
    delete(id: T['id']): boolean {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) return false;
      
        this.items.splice(index, 1);
        return true;
    }
  
    // List: Get all items
    findAll(): T[] {
        return [...this.items];
    }
}

// Usage with specific entity types
interface User extends Entity {
    name: string;
    email: string;
}

interface Product extends Entity {
    name: string;
    price: number;
}

const userRepository = new Repository<User>();
const productRepository = new Repository<Product>();

// Type-safe operations
const user = userRepository.create({name: "Alice", email: "alice@example.com"});
// user has type User with generated id

const product = productRepository.create({name: "Laptop", price: 999});
// product has type Product with generated id

// ❌ Type safety prevents errors
userRepository.create({name: "Bob", price: 50}); // ❌ Error: price not valid for User
```

## Common Gotchas and Best Practices

> **Gotcha #1: Generic type erasure**
>
> ```typescript
> function getType<T>(value: T): string {
>     return typeof T; // ❌ Error: T doesn't exist at runtime
>     // Generics are compile-time only!
> }
> ```

> **Gotcha #2: Overly complex constraints**
>
> ```typescript
> // ❌ Too complex - hard to understand and use
> function complexFunction<T extends U & V, U extends W, V extends X, W, X>...
>
> // ✅ Better - simpler, more focused constraints
> function simpleFunction<T extends HasId>(item: T): T...
> ```

> **Best Practice: Meaningful type parameter names**
>
> ```typescript
> // ❌ Generic but unclear
> function transform<T, U, V>(data: T, fn: U): V...
>
> // ✅ Descriptive names
> function transform<TInput, TTransformer, TOutput>(
>     data: TInput, 
>     transformer: TTransformer
> ): TOutput...
> ```

> **Best Practice: Start simple, add constraints as needed**
>
> ```typescript
> // Start with:
> function process<T>(item: T): T { ... }
>
> // Add constraints when you need specific behavior:
> function process<T extends Serializable>(item: T): T { ... }
> ```

## Mental Model Summary

Think of generics as:

1. **Type Variables** : Like function parameters, but for types
2. **Compile-time Placeholders** : Filled in when the generic is used
3. **Type Safety Preservers** : Maintain specific type information through transformations
4. **Reusability Enablers** : Write once, use with many types

```
Generic Flow:
Declaration → Usage → Type Inference/Specification → Type Safety
     ↓           ↓              ↓                        ↓
  <T>      fn([1,2,3])    T becomes number[]    Return type: number
```

Generics are TypeScript's way of saying: "I can work with any type you give me, but I'll remember exactly what type that was and keep you safe throughout the entire operation."
