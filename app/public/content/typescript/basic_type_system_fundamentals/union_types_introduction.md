# TypeScript Union Types: Combining Multiple Types with `|`

## The JavaScript Foundation: Dynamic Typing Reality

Let's start with the fundamental JavaScript behavior that necessitates union types. In JavaScript, variables can hold values of different types throughout their lifecycle:

```javascript
// Pure JavaScript - variables can change types freely
function processUserInput(input) {
    // input could be a string from a text field
    if (typeof input === 'string') {
        return input.toUpperCase();
    }
  
    // input could be a number from a numeric input
    if (typeof input === 'number') {
        return input * 2;
    }
  
    // input could be null if no input provided
    if (input === null) {
        return 'No input provided';
    }
  
    return 'Unknown input type';
}

// All of these are valid JavaScript calls
processUserInput("hello");    // Works: returns "HELLO"
processUserInput(42);         // Works: returns 84
processUserInput(null);       // Works: returns "No input provided"
processUserInput([1, 2, 3]);  // Runs but returns "Unknown input type"
```

> **The Core Problem** : JavaScript's dynamic nature means we can't know at development time what types our variables will actually contain. This leads to runtime errors and unpredictable behavior.

## The TypeScript Solution: Static Type Analysis

TypeScript addresses this by allowing us to declare that a value can be one of several specific types. This is where **union types** come in:

```typescript
// TypeScript - explicitly declaring possible types
function processUserInput(input: string | number | null): string | number {
    // TypeScript now knows input can only be string, number, or null
    if (typeof input === 'string') {
        return input.toUpperCase(); // ✅ TypeScript knows this is safe
    }
  
    if (typeof input === 'number') {
        return input * 2; // ✅ TypeScript knows this is safe
    }
  
    if (input === null) {
        return 'No input provided';
    }
  
    // This line is unreachable due to our type definition
    return 'Unknown input type';
}

// TypeScript will catch invalid calls at compile time
processUserInput("hello");    // ✅ Valid
processUserInput(42);         // ✅ Valid
processUserInput(null);       // ✅ Valid
processUserInput([1, 2, 3]);  // ❌ Compile error!
//               ^^^^^^^^^ 
// Error: Argument of type 'number[]' is not assignable to parameter 
// of type 'string | number | null'
```

## Union Types Fundamentals

> **Union Type Definition** : A union type describes a value that can be one of several types. We use the vertical bar (`|`) to separate each type.

### Basic Syntax and Mental Model

```typescript
// Basic union type syntax
let value: string | number;

// Think of it as: "value can be string OR number"
value = "hello";     // ✅ Valid - string is allowed
value = 42;          // ✅ Valid - number is allowed
value = true;        // ❌ Error - boolean not in union
value = null;        // ❌ Error - null not in union

// Multiple types in union
let status: 'loading' | 'success' | 'error' | null;
status = 'loading';  // ✅ Valid
status = 'pending';  // ❌ Error - 'pending' not in union
```

> **Mental Model** : Think of union types as a "menu of options" - the value must match exactly one of the types in the menu.

### ASCII Diagram: Union Type Structure

```
Union Type: string | number | boolean
     │
     ├── string ────────── "hello", "world", ""
     ├── number ────────── 42, 3.14, -1
     └── boolean ───────── true, false

Value Assignment:
     ↓
[Check if value matches ANY type in union]
     ↓
✅ Match found → Assignment succeeds
❌ No match → Compiler error
```

## Progressive Complexity: From Simple to Advanced

### Level 1: Basic Type Unions

```typescript
// Simple primitive unions
function formatId(id: string | number): string {
    // Before type narrowing, we can only use properties/methods
    // that exist on ALL types in the union
    return id.toString(); // ✅ Both string and number have toString()
  
    // return id.toUpperCase(); // ❌ Error! number doesn't have toUpperCase()
    // return id * 2;           // ❌ Error! string doesn't support multiplication
}

formatId("USER123");  // ✅ Returns "USER123"
formatId(456);        // ✅ Returns "456"
```

### Level 2: Object Type Unions

```typescript
// Union of object types
type Dog = {
    species: 'dog';
    breed: string;
    bark(): void;
};

type Cat = {
    species: 'cat';
    color: string;
    meow(): void;
};

function petSound(pet: Dog | Cat): void {
    // Can only access properties that exist on ALL types
    console.log(`This is a ${pet.species}`); // ✅ Both have 'species'
  
    // pet.bark(); // ❌ Error! Cat doesn't have bark()
    // pet.meow(); // ❌ Error! Dog doesn't have meow()
}
```

### Level 3: Type Narrowing with Guards

```typescript
// Type narrowing - TypeScript gets smarter inside conditionals
function handlePet(pet: Dog | Cat): void {
    // Type narrowing using discriminated property
    if (pet.species === 'dog') {
        // Inside this block, TypeScript knows pet is definitely Dog
        console.log(`Breed: ${pet.breed}`); // ✅ Only Dog has breed
        pet.bark(); // ✅ Only Dog has bark()
    } else {
        // Inside this block, TypeScript knows pet is definitely Cat
        console.log(`Color: ${pet.color}`); // ✅ Only Cat has color
        pet.meow(); // ✅ Only Cat has meow()
    }
}

// Using typeof for primitive narrowing
function processValue(value: string | number): string {
    if (typeof value === 'string') {
        // TypeScript knows value is string here
        return value.toUpperCase(); // ✅ Safe to use string methods
    } else {
        // TypeScript knows value is number here
        return (value * 2).toString(); // ✅ Safe to use number operations
    }
}
```

### Level 4: Complex Union Patterns

```typescript
// Union with null/undefined (nullable types)
function findUser(id: string): User | null {
    // Simulating database lookup
    const users = getUserDatabase();
    return users.find(user => user.id === id) || null;
}

// Handling nullable unions
function displayUser(id: string): void {
    const user = findUser(id); // user is User | null
  
    if (user === null) {
        console.log('User not found');
        return;
    }
  
    // TypeScript knows user is definitely User here
    console.log(`User: ${user.name}`); // ✅ Safe access
}

// Array element access returns union with undefined
const numbers = [1, 2, 3];
const maybeNumber = numbers[10]; // Type: number | undefined

if (maybeNumber !== undefined) {
    console.log(maybeNumber * 2); // ✅ Safe after narrowing
}
```

## Key Type System Rules

> **Union Assignment Rule** : A value is assignable to a union type if it's assignable to at least one member of the union.

> **Union Access Rule** : You can only access properties and methods that exist on ALL types in the union, unless you narrow the type first.

> **Type Narrowing Rule** : TypeScript automatically narrows union types inside conditional blocks based on type guards.

## Common Patterns and Best Practices

### Discriminated Unions (Tagged Unions)

```typescript
// Best practice: Use discriminated unions for better type safety
type LoadingState = {
    status: 'loading';
    progress: number;
};

type SuccessState = {
    status: 'success';
    data: any[];
};

type ErrorState = {
    status: 'error';
    error: string;
};

type AppState = LoadingState | SuccessState | ErrorState;

function renderState(state: AppState): string {
    // TypeScript can exhaustively check all cases
    switch (state.status) {
        case 'loading':
            return `Loading... ${state.progress}%`; // ✅ progress available
        case 'success':
            return `Loaded ${state.data.length} items`; // ✅ data available
        case 'error':
            return `Error: ${state.error}`; // ✅ error available
        default:
            // TypeScript ensures this is unreachable
            const exhaustiveCheck: never = state;
            throw new Error(`Unhandled state: ${exhaustiveCheck}`);
    }
}
```

### Function Overloads vs Union Parameters

```typescript
// Instead of complex union logic, consider function overloads
function createElement(tag: 'div'): HTMLDivElement;
function createElement(tag: 'span'): HTMLSpanElement;
function createElement(tag: 'button'): HTMLButtonElement;
function createElement(tag: string): HTMLElement {
    return document.createElement(tag);
}

// TypeScript knows the exact return type based on input
const div = createElement('div');    // Type: HTMLDivElement
const span = createElement('span');  // Type: HTMLSpanElement
```

## Common Gotchas and Confusion Points

> **Compile Time vs Runtime** : Union types only exist during TypeScript compilation. At runtime, JavaScript just sees regular values.

```typescript
// This TypeScript code...
let value: string | number = "hello";

// ...compiles to this JavaScript:
let value = "hello"; // No type information remains
```

> **Array Method Behavior** : When working with arrays containing union types, method returns become unions too.

```typescript
const mixedArray: (string | number)[] = ['hello', 42, 'world'];

// map returns array of union types
const processed = mixedArray.map(item => {
    if (typeof item === 'string') {
        return item.length;    // Returns number
    } else {
        return item.toString(); // Returns string
    }
}); // Type: (string | number)[]
```

> **Union vs Intersection** : Don't confuse `|` (union - OR) with `&` (intersection - AND).

```typescript
// Union: value can be A OR B
type Union = { a: string } | { b: number };
let union: Union = { a: "hello" }; // ✅ Valid
union = { b: 42 };                 // ✅ Valid
// union = { a: "hi", b: 42 };     // ❌ Error - object must match one type exactly

// Intersection: value must have properties from A AND B
type Intersection = { a: string } & { b: number };
let intersection: Intersection = { a: "hello", b: 42 }; // ✅ Must have both
```

## Advanced Union Type Patterns

### Conditional Type Narrowing

```typescript
// Using 'in' operator for object property checking
type Bird = { fly(): void; feathers: true };
type Fish = { swim(): void; scales: true };

function move(animal: Bird | Fish): void {
    if ('fly' in animal) {
        animal.fly(); // ✅ TypeScript knows it's Bird
    } else {
        animal.swim(); // ✅ TypeScript knows it's Fish
    }
}

// Custom type guards
function isBird(animal: Bird | Fish): animal is Bird {
    return 'fly' in animal;
}

function handleAnimal(animal: Bird | Fish): void {
    if (isBird(animal)) {
        animal.fly(); // ✅ Type narrowed to Bird
    } else {
        animal.swim(); // ✅ Type narrowed to Fish
    }
}
```

Union types are fundamental to TypeScript's power - they let us precisely describe the real-world scenario where values can be one of several types, while maintaining type safety and getting helpful compiler assistance. They bridge the gap between JavaScript's dynamic nature and TypeScript's static analysis, giving us the best of both worlds.
