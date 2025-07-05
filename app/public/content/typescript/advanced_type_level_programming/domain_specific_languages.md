# TypeScript from First Principles: Building a Complete Mental Model

Let's build your understanding of TypeScript from the ground up, starting with the fundamental concepts and progressing to advanced type system features like domain-specific languages.

## Part 1: The JavaScript Foundation

### Understanding JavaScript's Dynamic Nature

Before we dive into TypeScript, we need to understand what JavaScript *is* and why TypeScript exists.

```javascript
// JavaScript is dynamically typed - variables can hold any value
let data = 42;           // number
data = "hello";          // now a string
data = { name: "John" }; // now an object
data = [1, 2, 3];       // now an array

// Functions can return different types based on input
function process(input) {
    if (typeof input === "number") {
        return input * 2;        // returns number
    }
    if (typeof input === "string") {
        return input.toUpperCase(); // returns string
    }
    return null;                 // returns null
}
```

> **Key Mental Model** : JavaScript determines types at runtime. The same variable can hold different types of values throughout program execution. This flexibility is powerful but can lead to unexpected behavior.

### The Problems JavaScript's Flexibility Creates

```javascript
// Runtime errors that could be caught earlier
function calculateTotal(price, quantity) {
    return price * quantity;
}

calculateTotal("50", "2");     // "5050" - string concatenation, not math!
calculateTotal(50, undefined); // NaN - undefined coerced to NaN
calculateTotal();              // NaN - missing parameters

// Property access errors
const user = { name: "John" };
console.log(user.nam);         // undefined - typo in property name
console.log(user.age.toString()); // TypeError - age is undefined
```

> **Why TypeScript Exists** : These runtime errors could be caught at development time if we had a way to describe what types our variables and functions expect.

## Part 2: TypeScript's Core Concept

### Static Type Checking

TypeScript adds a **static type system** on top of JavaScript. Let's break this down:

```
JavaScript Execution Timeline:
Write Code → Run Code → Discover Errors

TypeScript Timeline:
Write Code → Type Check → Compile to JS → Run Code
                ↑
            Catch errors here!
```

```typescript
// TypeScript version of our problematic JavaScript
function calculateTotal(price: number, quantity: number): number {
    return price * quantity;
}

calculateTotal("50", "2");     // ❌ Error: Argument of type 'string' is not assignable to parameter of type 'number'
calculateTotal(50, undefined); // ❌ Error: Argument of type 'undefined' is not assignable to parameter of type 'number'
calculateTotal();              // ❌ Error: Expected 2 arguments, but got 0
```

> **Static vs Dynamic Typing** : Static typing means types are checked before the code runs. Dynamic typing means types are checked while the code runs.

## Part 3: Basic Types - Building Blocks

### Primitive Types

TypeScript maps directly to JavaScript's primitive types:

```typescript
// JavaScript primitives with TypeScript annotations
let age: number = 25;
let name: string = "John";
let isActive: boolean = true;
let data: null = null;
let value: undefined = undefined;

// TypeScript can often infer types
let inferredAge = 25;        // TypeScript knows this is number
let inferredName = "John";   // TypeScript knows this is string
```

### Arrays and Objects

```typescript
// JavaScript array
const numbers = [1, 2, 3];

// TypeScript typed arrays
const typedNumbers: number[] = [1, 2, 3];
const strings: string[] = ["a", "b", "c"];
const mixed: (number | string)[] = [1, "a", 2, "b"]; // Union type

// JavaScript object
const user = { name: "John", age: 30 };

// TypeScript object type
const typedUser: { name: string; age: number } = {
    name: "John",
    age: 30
};
```

## Part 4: Interfaces - Describing Object Shapes

### From Inline Types to Interfaces

```typescript
// Inline object type (hard to reuse)
function greetUser(user: { name: string; age: number }) {
    return `Hello ${user.name}, you are ${user.age} years old`;
}

// Interface (reusable type definition)
interface User {
    name: string;
    age: number;
}

function greetUserBetter(user: User) {
    return `Hello ${user.name}, you are ${user.age} years old`;
}

// Optional properties
interface UserWithOptionals {
    name: string;
    age: number;
    email?: string; // Optional - may or may not exist
}
```

> **Interface Mental Model** : Interfaces describe the "shape" of objects. They're like contracts that say "any object with these properties of these types will work here."

### Interface Composition

```typescript
interface Person {
    name: string;
    age: number;
}

interface Employee extends Person {
    employeeId: string;
    department: string;
}

// Now Employee has: name, age, employeeId, department
const worker: Employee = {
    name: "John",
    age: 30,
    employeeId: "EMP001",
    department: "Engineering"
};
```

## Part 5: Functions - Types for Behavior

### Function Type Annotations

```typescript
// JavaScript function
function add(a, b) {
    return a + b;
}

// TypeScript function with full annotations
function addTyped(a: number, b: number): number {
    return a + b;
}

// Function type annotation for variables
const multiply: (a: number, b: number) => number = (a, b) => a * b;

// Optional parameters
function greet(name: string, greeting?: string): string {
    return `${greeting || "Hello"} ${name}`;
}

// Default parameters
function greetWithDefault(name: string, greeting: string = "Hello"): string {
    return `${greeting} ${name}`;
}
```

### Function Overloads

```typescript
// Multiple function signatures for the same function
function process(input: string): string;
function process(input: number): number;
function process(input: string | number): string | number {
    if (typeof input === "string") {
        return input.toUpperCase();
    }
    return input * 2;
}

const result1 = process("hello"); // TypeScript knows this returns string
const result2 = process(42);      // TypeScript knows this returns number
```

## Part 6: Generics - Reusable Type Logic

### The Problem Generics Solve

```typescript
// Without generics - need separate functions for each type
function getFirstString(items: string[]): string | undefined {
    return items[0];
}

function getFirstNumber(items: number[]): number | undefined {
    return items[0];
}

// With generics - one function works for any type
function getFirst<T>(items: T[]): T | undefined {
    return items[0];
}

const firstString = getFirst(["a", "b", "c"]); // string | undefined
const firstNumber = getFirst([1, 2, 3]);       // number | undefined
```

> **Generic Mental Model** : Generics are like variables for types. Instead of hardcoding a specific type, you use a placeholder that gets filled in when the function is called.

### Generic Constraints

```typescript
// Constrain generic types to have certain properties
interface HasLength {
    length: number;
}

function logLength<T extends HasLength>(item: T): T {
    console.log(`Length: ${item.length}`);
    return item;
}

logLength("hello");        // ✅ strings have length
logLength([1, 2, 3]);      // ✅ arrays have length
logLength({ length: 5 });  // ✅ object with length property
// logLength(42);          // ❌ numbers don't have length
```

## Part 7: Advanced Type System Features

### Union and Intersection Types

```typescript
// Union types (OR)
type Status = "loading" | "success" | "error";
type ID = string | number;

function handleStatus(status: Status) {
    switch (status) {
        case "loading":
            return "Please wait...";
        case "success":
            return "Operation completed";
        case "error":
            return "Something went wrong";
        // TypeScript ensures all cases are handled
    }
}

// Intersection types (AND)
interface HasName {
    name: string;
}

interface HasAge {
    age: number;
}

type Person = HasName & HasAge; // Must have both name AND age

const person: Person = {
    name: "John",
    age: 30
    // Must have both properties
};
```

### Conditional Types

```typescript
// Types that change based on conditions
type IsArray<T> = T extends any[] ? true : false;

type Test1 = IsArray<string[]>; // true
type Test2 = IsArray<string>;   // false

// Practical example - extract return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getString(): string { return "hello"; }
function getNumber(): number { return 42; }

type StringReturn = ReturnType<typeof getString>; // string
type NumberReturn = ReturnType<typeof getNumber>; // number
```

### Mapped Types

```typescript
// Transform existing types
interface User {
    name: string;
    age: number;
    email: string;
}

// Make all properties optional
type PartialUser = {
    [K in keyof User]?: User[K];
};
// Result: { name?: string; age?: number; email?: string; }

// Make all properties readonly
type ReadonlyUser = {
    readonly [K in keyof User]: User[K];
};
// Result: { readonly name: string; readonly age: number; readonly email: string; }
```

## Part 8: Domain-Specific Languages (DSLs) with Strong Typing

Now let's explore how to create embedded domain-specific languages using TypeScript's advanced type system. This is where TypeScript truly shines - creating APIs that feel like specialized languages while maintaining type safety.

### Understanding DSLs

A Domain-Specific Language is a specialized language designed for a particular problem domain. In TypeScript, we can create "embedded DSLs" - APIs that feel like specialized languages but are actually TypeScript code.

```typescript
// Example: A query builder DSL
// Instead of writing SQL strings:
const badQuery = "SELECT name, age FROM users WHERE age > 18 ORDER BY name";

// We want to write:
const goodQuery = query()
    .select("name", "age")
    .from("users")
    .where("age", ">", 18)
    .orderBy("name");
```

### Building a Type-Safe Query Builder DSL

Let's build this step by step:

```typescript
// Step 1: Define our table schema types
interface UserTable {
    id: number;
    name: string;
    age: number;
    email: string;
}

interface PostTable {
    id: number;
    title: string;
    content: string;
    authorId: number;
}

// Step 2: Create a registry of all tables
interface TableRegistry {
    users: UserTable;
    posts: PostTable;
}

// Step 3: Build the query builder with method chaining
class QueryBuilder
    TTable extends keyof TableRegistry = never,
    TSelected extends keyof TableRegistry[TTable] = never
> {
    private tableName?: TTable;
    private selectedColumns: TSelected[] = [];
    private conditions: string[] = [];
    private ordering: string[] = [];

    // Select table - returns new type with table context
    from<T extends keyof TableRegistry>(table: T): QueryBuilder<T, never> {
        const newBuilder = new QueryBuilder<T, never>();
        newBuilder.tableName = table;
        return newBuilder;
    }

    // Select columns - only columns from the current table are allowed
    select<K extends keyof TableRegistry[TTable]>(
        ...columns: K[]
    ): QueryBuilder<TTable, K> {
        const newBuilder = new QueryBuilder<TTable, K>();
        newBuilder.tableName = this.tableName;
        newBuilder.selectedColumns = columns as any;
        newBuilder.conditions = [...this.conditions];
        newBuilder.ordering = [...this.ordering];
        return newBuilder;
    }

    // Where clause - only allows valid columns and types
    where<K extends keyof TableRegistry[TTable]>(
        column: K,
        operator: "=" | ">" | "<" | ">=" | "<=",
        value: TableRegistry[TTable][K]
    ): QueryBuilder<TTable, TSelected> {
        this.conditions.push(`${String(column)} ${operator} ${value}`);
        return this;
    }

    // Order by - only selected columns can be used for ordering
    orderBy(column: TSelected): QueryBuilder<TTable, TSelected> {
        this.ordering.push(String(column));
        return this;
    }

    // Execute and return properly typed results
    execute(): Pick<TableRegistry[TTable], TSelected>[] {
        // In a real implementation, this would execute the query
        console.log(`Executing query on ${this.tableName}`);
        return [] as Pick<TableRegistry[TTable], TSelected>[];
    }
}

// Step 4: Create the entry point function
function query(): QueryBuilder {
    return new QueryBuilder();
}
```

### Using Our Type-Safe DSL

```typescript
// Usage examples showing the type safety in action
const userQuery = query()
    .from("users")              // ✅ Valid table
    .select("name", "age")      // ✅ Valid columns from users table
    .where("age", ">", 18)      // ✅ Valid column and matching type
    .orderBy("name");           // ✅ Can only order by selected columns

const results = userQuery.execute(); // Type: { name: string; age: number }[]

// TypeScript catches errors at compile time:
const badQuery1 = query()
    .from("users")
    .select("invalidColumn");   // ❌ Error: 'invalidColumn' doesn't exist on UserTable

const badQuery2 = query()
    .from("users")
    .select("name")
    .where("age", ">", "18");   // ❌ Error: string not assignable to number

const badQuery3 = query()
    .from("users")
    .select("name")
    .orderBy("age");            // ❌ Error: 'age' not in selected columns
```

### Advanced DSL: State Machine Builder

Let's create a more complex DSL for building type-safe state machines:

```typescript
// Define state machine types
interface StateRegistry {
    idle: {};
    loading: { progress: number };
    success: { data: any };
    error: { message: string };
}

type StateName = keyof StateRegistry;
type StateData<T extends StateName> = StateRegistry[T];

// Transition definition
interface Transition<From extends StateName, To extends StateName> {
    from: From;
    to: To;
    event: string;
    guard?: (data: StateData<From>) => boolean;
    action?: (fromData: StateData<From>) => StateData<To>;
}

// State machine builder
class StateMachineBuilder<TStates extends StateName = never> {
    private states = new Set<StateName>();
    private transitions: Transition<any, any>[] = [];
    private initialState?: StateName;

    // Add states to the machine
    addState<S extends StateName>(state: S): StateMachineBuilder<TStates | S> {
        this.states.add(state);
        return this as any;
    }

    // Set initial state (must be an added state)
    initial<S extends TStates>(state: S): StateMachineBuilder<TStates> {
        this.initialState = state;
        return this;
    }

    // Add transition between added states
    addTransition<From extends TStates, To extends TStates>(
        transition: Transition<From, To>
    ): StateMachineBuilder<TStates> {
        this.transitions.push(transition);
        return this;
    }

    // Build the final state machine
    build(): StateMachine<TStates> {
        if (!this.initialState) {
            throw new Error("Initial state must be set");
        }
        return new StateMachine(this.states, this.transitions, this.initialState);
    }
}

class StateMachine<TStates extends StateName> {
    constructor(
        private states: Set<StateName>,
        private transitions: Transition<any, any>[],
        private currentState: StateName
    ) {}

    // Send event and transition if valid
    send(event: string): boolean {
        const validTransition = this.transitions.find(
            t => t.from === this.currentState && t.event === event
        );

        if (validTransition) {
            this.currentState = validTransition.to;
            return true;
        }
        return false;
    }

    getCurrentState(): StateName {
        return this.currentState;
    }
}

// Factory function
function createStateMachine(): StateMachineBuilder {
    return new StateMachineBuilder();
}
```

### Using the State Machine DSL

```typescript
// Build a loading state machine
const loadingMachine = createStateMachine()
    .addState("idle")
    .addState("loading")
    .addState("success")
    .addState("error")
    .initial("idle")
    .addTransition({
        from: "idle",
        to: "loading",
        event: "START_LOADING"
    })
    .addTransition({
        from: "loading",
        to: "success",
        event: "LOAD_SUCCESS"
    })
    .addTransition({
        from: "loading",
        to: "error",
        event: "LOAD_ERROR"
    })
    .build();

// Type-safe usage
loadingMachine.send("START_LOADING"); // ✅ Valid transition
console.log(loadingMachine.getCurrentState()); // "loading"

// TypeScript prevents invalid configurations:
const invalidMachine = createStateMachine()
    .addState("idle")
    .initial("loading"); // ❌ Error: 'loading' not in added states
```

### Advanced DSL Pattern: Template Literal Types

TypeScript 4.1+ introduced template literal types, enabling even more sophisticated DSLs:

```typescript
// CSS-in-JS DSL with template literal types
type CSSProperty = 
    | "color" 
    | "background-color" 
    | "font-size" 
    | "margin" 
    | "padding";

type CSSValue<T extends CSSProperty> = 
    T extends "color" | "background-color" ? string :
    T extends "font-size" ? `${number}px` | `${number}rem` :
    T extends "margin" | "padding" ? `${number}px` | `${number}px ${number}px` :
    string;

// Template literal for CSS selectors
type CSSSelector = `.${string}` | `#${string}` | string;

interface StyleRule<T extends CSSProperty> {
    property: T;
    value: CSSValue<T>;
}

class StyleBuilder {
    private rules: StyleRule<any>[] = [];

    // Type-safe property setting
    set<T extends CSSProperty>(
        property: T, 
        value: CSSValue<T>
    ): StyleBuilder {
        this.rules.push({ property, value });
        return this;
    }

    // Generate CSS
    css(): string {
        return this.rules
            .map(rule => `${rule.property}: ${rule.value};`)
            .join('\n');
    }
}

function style(): StyleBuilder {
    return new StyleBuilder();
}

// Usage with compile-time validation
const buttonStyles = style()
    .set("color", "#ff0000")           // ✅ Valid color
    .set("font-size", "16px")          // ✅ Valid font-size
    .set("margin", "10px 20px")        // ✅ Valid margin format
    // .set("font-size", "large")      // ❌ Error: invalid font-size format
    // .set("color", 123)              // ❌ Error: number not assignable to color
    .css();
```

### Key Principles for DSL Design

> **Progressive Disclosure** : Start with simple operations and gradually expose more complex features as needed.

> **Type Safety First** : Every operation should be validated at compile time. If something can be wrong, TypeScript should catch it.

> **Fluent Interface** : Method chaining creates readable, declarative code that resembles natural language.

> **Immutability** : Each operation should return a new builder instance to avoid shared mutable state.

```
DSL Design Pattern:
┌─────────────────┐
│   Entry Point   │ → Simple function to start the DSL
│   query()       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Builder       │ → Chainable methods that accumulate state
│   .from()       │   and return new builder instances
│   .select()     │
│   .where()      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Executor      │ → Final method that produces the result
│   .execute()    │   with proper typing
└─────────────────┘
```

### Real-World DSL Applications

DSLs in TypeScript are particularly powerful for:

1. **API Builders** : Creating fluent interfaces for complex APIs
2. **Configuration Systems** : Type-safe configuration with validation
3. **Test Frameworks** : Readable test definitions with strong typing
4. **Data Transformation** : Pipelines with compile-time type checking
5. **Template Engines** : Type-safe template compilation
6. **State Management** : Strongly-typed state machines and reducers

The key insight is that TypeScript's type system is powerful enough to encode domain logic and constraints, turning runtime errors into compile-time errors while creating more expressive and maintainable code.

> **DSL Mental Model** : Think of DSLs as creating a specialized vocabulary for your problem domain. TypeScript ensures that this vocabulary is used correctly, preventing misuse while maintaining the expressiveness of a dedicated language.

This combination of JavaScript's runtime flexibility with TypeScript's compile-time safety creates a uniquely powerful platform for building sophisticated, type-safe domain-specific languages that feel natural to use while preventing entire classes of errors.
