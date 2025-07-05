# Advanced Function Types in TypeScript

## JavaScript Function Foundations

Before diving into TypeScript's advanced function types, let's understand what JavaScript gives us and why we need more.

### JavaScript Functions: The Foundation

```javascript
// JavaScript functions are extremely flexible
function greet(name) {
    return "Hello, " + name;
}

// JavaScript allows any number of arguments
greet("Alice");           // "Hello, Alice"
greet("Bob", "Smith");    // "Hello, Bob" (extra arg ignored)
greet();                  // "Hello, undefined"

// Functions can behave completely differently based on arguments
function process(data) {
    if (typeof data === 'string') {
        return data.toUpperCase();
    }
    if (Array.isArray(data)) {
        return data.join(',');
    }
    if (typeof data === 'number') {
        return data * 2;
    }
}
```

> **The Problem** : JavaScript's flexibility means no compile-time guarantees about what arguments a function expects or what it returns. Bugs happen when we pass wrong types or wrong number of arguments.

## TypeScript's Solution: Precise Function Typing

TypeScript solves this by allowing us to describe exactly what our functions expect and return:

```typescript
// Basic TypeScript function type
function greet(name: string): string {
    return "Hello, " + name;
}

// Now TypeScript catches errors at compile time
greet("Alice");     // ✅ Valid
greet(42);          // ❌ Error: Argument of type 'number' is not assignable to parameter of type 'string'
greet();            // ❌ Error: Expected 1 arguments, but got 0
```

## 1. Function Overloads: Multiple Signatures for One Function

### The JavaScript Problem Overloads Solve

```javascript
// JavaScript: One function, multiple behaviors
function createElement(tag) {
    // Could create different elements based on tag type
    if (typeof tag === 'string') {
        return document.createElement(tag);
    }
    if (typeof tag === 'object') {
        // Create from config object
        const element = document.createElement(tag.type);
        element.className = tag.className || '';
        return element;
    }
}

// Usage is unclear - what can we pass?
createElement('div');
createElement({ type: 'span', className: 'highlight' });
```

### TypeScript Overloads: Explicit Multiple Signatures

```typescript
// Function overload signatures
function createElement(tag: string): HTMLElement;
function createElement(config: { type: string; className?: string }): HTMLElement;

// Implementation signature (must be compatible with all overloads)
function createElement(tagOrConfig: string | { type: string; className?: string }): HTMLElement {
    if (typeof tagOrConfig === 'string') {
        return document.createElement(tagOrConfig);
    } else {
        const element = document.createElement(tagOrConfig.type);
        if (tagOrConfig.className) {
            element.className = tagOrConfig.className;
        }
        return element;
    }
}

// Now TypeScript knows exactly what each call expects
const div = createElement('div');                    // ✅ Returns HTMLElement
const span = createElement({ 
    type: 'span', 
    className: 'highlight' 
});                                                  // ✅ Returns HTMLElement

createElement(42);                                   // ❌ Error: No overload matches
```

> **Key Mental Model** : Function overloads let you define multiple "contracts" for the same function. Each overload signature is like a different API that the function supports.

### Overload Resolution Process

```
Function Call: createElement('div')
       ↓
Check Overload 1: createElement(tag: string): HTMLElement
       ↓
Match Found? YES
       ↓
Use This Signature's Types
       ↓
Return Type: HTMLElement
```

### Complex Overload Example: Array Methods

```typescript
// Modeling JavaScript's complex array methods
interface MyArray<T> {
    // Different signatures for different use cases
    slice(): MyArray<T>;
    slice(start: number): MyArray<T>;
    slice(start: number, end: number): MyArray<T>;
}

// Implementation would handle all cases
class MyArrayImpl<T> implements MyArray<T> {
    private items: T[] = [];

    slice(start?: number, end?: number): MyArray<T> {
        // Implementation must handle all overload cases
        if (start === undefined) {
            return new MyArrayImpl<T>(); // Copy all
        }
        if (end === undefined) {
            return new MyArrayImpl<T>(); // From start to end
        }
        return new MyArrayImpl<T>(); // From start to end
    }
}
```

> **Overload Rules** :
>
> * Overload signatures define the public API
> * Implementation signature must be compatible with ALL overloads
> * TypeScript picks the FIRST matching overload signature

## 2. Rest Parameters: Handling Variable Arguments

### JavaScript Rest Parameters Refresher

```javascript
// JavaScript rest parameters collect remaining arguments
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

sum(1, 2, 3);           // 6
sum(1, 2, 3, 4, 5);     // 15
sum();                  // 0
```

### TypeScript Rest Parameter Types

```typescript
// Basic rest parameter typing
function sum(...numbers: number[]): number {
    return numbers.reduce((total, num) => total + num, 0);
}

sum(1, 2, 3);           // ✅ Valid
sum(1, 2, 3, 4, 5);     // ✅ Valid  
sum();                  // ✅ Valid (empty array)
sum(1, "2", 3);         // ❌ Error: Argument of type 'string' not assignable to 'number'
```

### Advanced Rest Parameters: Mixed Types

```typescript
// Rest parameters with preceding required parameters
function log(level: 'info' | 'warn' | 'error', message: string, ...details: any[]): void {
    console.log(`[${level}] ${message}`, ...details);
}

log('info', 'User logged in');                    // ✅ Valid
log('error', 'Database failed', { code: 500 });   // ✅ Valid
log('warn', 'Slow query', 'SELECT *', 1200);      // ✅ Valid
log('info');                                       // ❌ Error: Expected at least 2 arguments
```

### Rest Parameters with Tuple Types

```typescript
// Using tuples to type exact rest parameter patterns
function coordinate(x: number, y: number, ...rest: [number] | [number, number] | []): void {
    // x, y always required
    // rest can be: [], [z], or [z, w]
}

coordinate(1, 2);           // ✅ Valid (2D)
coordinate(1, 2, 3);        // ✅ Valid (3D)  
coordinate(1, 2, 3, 4);     // ✅ Valid (4D)
coordinate(1, 2, 3, 4, 5);  // ❌ Error: too many arguments
```

### Rest Parameters in Function Types

```typescript
// Function type with rest parameters
type EventHandler<T extends any[]> = (event: Event, ...args: T) => void;

// Usage
const clickHandler: EventHandler<[number, number]> = (event, x, y) => {
    console.log(`Clicked at ${x}, ${y}`);
};

const keyHandler: EventHandler<[string]> = (event, key) => {
    console.log(`Key pressed: ${key}`);
};

const simpleHandler: EventHandler<[]> = (event) => {
    console.log('Simple event');
};
```

> **Rest Parameter Rules** :
>
> * Must be the last parameter
> * Type is always an array type
> * Can be empty array if no arguments passed
> * Works with tuple types for exact patterns

## 3. Complex Function Signatures

### Function Types as First-Class Citizens

```typescript
// JavaScript: Functions are values
const add = function(a, b) { return a + b; };
const multiply = (a, b) => a * b;

// TypeScript: Precise typing for function values
const add: (a: number, b: number) => number = function(a, b) { return a + b; };
const multiply: (a: number, b: number) => number = (a, b) => a * b;
```

### Function Type Anatomy

```
Function Type: (param1: Type1, param2: Type2) => ReturnType
                    ↓              ↓               ↓
               Parameter List   Parameter Types   Return Type
```

### Generic Function Signatures

```typescript
// Generic functions handle multiple types safely
function identity<T>(value: T): T {
    return value;
}

// TypeScript infers the type
const stringResult = identity('hello');    // Type: string
const numberResult = identity(42);         // Type: number
const arrayResult = identity([1, 2, 3]);   // Type: number[]

// Explicit type parameter
const explicitResult = identity<boolean>(true);  // Type: boolean
```

### Constrained Generics in Functions

```typescript
// Constraining generic types
interface Lengthable {
    length: number;
}

function logLength<T extends Lengthable>(item: T): T {
    console.log(`Length: ${item.length}`);
    return item;
}

logLength('hello');        // ✅ string has length
logLength([1, 2, 3]);      // ✅ array has length
logLength({ length: 5 });  // ✅ object with length property
logLength(42);             // ❌ Error: number doesn't have length
```

### Function Signatures with Multiple Generics

```typescript
// Multiple generic parameters with relationships
function map<T, U>(array: T[], transform: (item: T) => U): U[] {
    return array.map(transform);
}

// Usage examples
const numbers = [1, 2, 3];
const strings = map(numbers, n => n.toString());     // T=number, U=string
const doubled = map(numbers, n => n * 2);            // T=number, U=number
const objects = map(strings, s => ({ value: s }));   // T=string, U={value: string}
```

### Conditional Return Types

```typescript
// Return type depends on input type
function processValue<T>(value: T): T extends string ? string : T extends number ? string : never {
    if (typeof value === 'string') {
        return value.toUpperCase() as any;
    }
    if (typeof value === 'number') {
        return value.toString() as any;
    }
    throw new Error('Unsupported type');
}

const stringResult = processValue('hello');  // Type: string
const numberResult = processValue(42);       // Type: string  
const boolResult = processValue(true);       // Type: never (compile error)
```

## Advanced Patterns: Combining All Features

### Builder Pattern with Overloads and Generics

```typescript
class QueryBuilder<T = {}> {
    private conditions: T = {} as T;

    // Overloaded where method
    where<K extends string>(key: K, value: string): QueryBuilder<T & Record<K, string>>;
    where<K extends string>(key: K, operator: '>', value: number): QueryBuilder<T & Record<K, number>>;
    where<K extends string>(key: K, operator: 'in', values: string[]): QueryBuilder<T & Record<K, string[]>>;
  
    where<K extends string>(
        key: K, 
        operatorOrValue: string | '>' | 'in', 
        value?: number | string[]
    ): QueryBuilder<T & Record<K, any>> {
        // Implementation handles all overload cases
        return new QueryBuilder<T & Record<K, any>>();
    }

    // Rest parameters for multiple conditions
    andWhere<K extends string>(...conditions: Array<[K, string]>): QueryBuilder<T & Record<K, string>> {
        return new QueryBuilder<T & Record<K, string>>();
    }

    build(): T {
        return this.conditions;
    }
}

// Usage builds up type information
const query = new QueryBuilder()
    .where('name', 'John')           // T becomes {name: string}
    .where('age', '>', 25)           // T becomes {name: string, age: number}
    .where('status', 'in', ['active', 'pending']);  // T becomes {name: string, age: number, status: string[]}

const result = query.build();  // Type: {name: string, age: number, status: string[]}
```

### Event System with Complex Signatures

```typescript
// Event map defines available events and their signatures
interface EventMap {
    'user:login': (user: { id: string; name: string }) => void;
    'user:logout': () => void;
    'data:update': (data: any[], timestamp: number) => void;
    'error': (error: Error, context?: string) => void;
}

class EventEmitter {
    private listeners: Map<string, Function[]> = new Map();

    // Overloaded on method - type-safe event registration
    on<K extends keyof EventMap>(event: K, listener: EventMap[K]): void;
    on(event: string, listener: Function): void;
    on(event: string, listener: Function): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(listener);
    }

    // Overloaded emit method with rest parameters
    emit<K extends keyof EventMap>(
        event: K, 
        ...args: Parameters<EventMap[K]>
    ): void;
    emit(event: string, ...args: any[]): void;
    emit(event: string, ...args: any[]): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(listener => listener(...args));
        }
    }
}

// Usage is completely type-safe
const emitter = new EventEmitter();

emitter.on('user:login', (user) => {
    // user is typed as {id: string; name: string}
    console.log(`User ${user.name} logged in`);
});

emitter.on('user:logout', () => {
    // No parameters expected
    console.log('User logged out');
});

emitter.emit('user:login', { id: '123', name: 'Alice' });  // ✅ Valid
emitter.emit('user:logout');                                // ✅ Valid
emitter.emit('user:login');                                 // ❌ Error: Expected 1 argument
emitter.emit('user:login', 'invalid');                      // ❌ Error: Wrong argument type
```

> **Advanced Function Type Strategy** :
>
> 1. Start with the JavaScript behavior you want
> 2. Use overloads to define multiple valid call patterns
> 3. Use generics to maintain type relationships
> 4. Use rest parameters for variable arguments
> 5. Combine techniques for powerful, type-safe APIs

### Function Signature Hierarchy

```
Simple Function Types
        ↓
Function Types with Generics
        ↓  
Function Overloads
        ↓
Overloads with Generics
        ↓
Overloads + Generics + Rest Parameters
        ↓
Conditional Types in Signatures
        ↓
Advanced Patterns (Builders, Event Systems)
```

## Common Gotchas and Best Practices

> **Overload Order Matters** : TypeScript checks overloads from top to bottom and uses the first match. Put more specific overloads before general ones.

```typescript
// ❌ Wrong order - general case comes first
function process(value: any): any;
function process(value: string): string;  // Never reached!

// ✅ Correct order - specific cases first
function process(value: string): string;
function process(value: any): any;
```

> **Implementation Signature Compatibility** : The implementation signature must be assignable to ALL overload signatures.

```typescript
// ❌ Implementation doesn't match overloads
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;
function combine(a: boolean, b: boolean): boolean {  // ❌ Implementation only handles boolean
    return a && b;
}

// ✅ Implementation handles all cases
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;
function combine(a: string | number, b: string | number): string | number {
    return (a as any) + (b as any);
}
```

> **Runtime vs Compile Time** : Function overloads exist only at compile time. At runtime, there's only one implementation function.

This deep understanding of TypeScript's advanced function types enables you to build APIs that are both flexible and type-safe, catching errors at compile time while providing excellent developer experience through precise IntelliSense and documentation.
