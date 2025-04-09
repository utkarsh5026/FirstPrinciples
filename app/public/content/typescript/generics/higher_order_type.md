# Higher-Order Type Patterns in TypeScript: From First Principles

Higher-order type patterns in TypeScript are advanced typing techniques that manipulate and transform types themselves. Just as higher-order functions take functions as arguments or return functions, higher-order types operate on other types, creating a more powerful and expressive type system. Let's explore these patterns from first principles, with plenty of examples to illustrate the concepts.

## Understanding First Principles

To understand higher-order type patterns, we need to recognize that TypeScript's type system is itself a kind of programming language - one that operates at the type level rather than at the value level. This "type-level programming" allows us to express complex relationships between types and build abstractions that make our code safer and more expressive.

## 1. Mapped Types: The Foundation

Mapped types are one of the fundamental higher-order type patterns. They allow you to create new types by transforming properties of existing types.

### Basic Mapped Type

```typescript
type Optional<T> = {
  [K in keyof T]?: T[K];
};

interface User {
  id: number;
  name: string;
  email: string;
}

// All properties become optional
type OptionalUser = Optional<User>;
// Equivalent to: { id?: number; name?: string; email?: string; }

const partialUser: OptionalUser = {
  name: "Alice" 
  // id and email can be omitted
};
```

In this example, `Optional<T>` takes a type `T` and creates a new type where all properties are optional. The `[K in keyof T]` syntax iterates over all property keys of `T`, and the `?` makes each property optional.

### Property Modifiers in Mapped Types

Mapped types can also add or remove modifiers like `readonly` or `?` (optional):

```typescript
// Make all properties readonly
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Remove optionality from all properties
type Required<T> = {
  [K in keyof T]-?: T[K];
};

// Remove readonly from all properties
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

interface Config {
  readonly endpoint: string;
  timeout?: number;
}

type MutableConfig = Mutable<Config>;
// { endpoint: string; timeout?: number; }

type RequiredConfig = Required<Config>;
// { readonly endpoint: string; timeout: number; }
```

The `-?` syntax removes the optional modifier, while `-readonly` removes the readonly modifier. Conversely, adding `readonly` or `?` without the minus sign adds these modifiers.

### Transforming Property Values

Mapped types can also transform property values:

```typescript
// Wrap each property in a Promise
type Promisify<T> = {
  [K in keyof T]: Promise<T[K]>;
};

interface User {
  id: number;
  name: string;
  getPosts(): string[];
}

type AsyncUser = Promisify<User>;
// {
//   id: Promise<number>;
//   name: Promise<string>;
//   getPosts: Promise<() => string[]>;
// }
```

Here, `Promisify<T>` wraps each property of `T` in a `Promise`. This demonstrates how mapped types can transform not just the shape of a type but also its property types.

## 2. Conditional Types: Making Decisions at the Type Level

Conditional types allow us to select different types based on conditions. They use an expression that looks like the ternary operator in JavaScript:

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null>;  // string
type B = NonNullable<undefined>;      // never
```

In this example, `NonNullable<T>` returns `never` if `T` extends `null | undefined`, otherwise it returns `T`. This effectively filters out null and undefined from union types.

### The `infer` Keyword

The `infer` keyword allows you to extract types from other types in conditional types:

```typescript
// Extract the return type of a function
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function greet(name: string): string {
  return `Hello, ${name}!`;
}

type GreetReturnType = ReturnType<typeof greet>;  // string

// Extract the first argument type
type FirstArgument<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

function createUser(name: string, age: number): User {
  // implementation
  return { id: 1, name, age };
}

type NameType = FirstArgument<typeof createUser>;  // string
```

The `infer` keyword introduces a type variable within a conditional type. In `ReturnType`, the `infer R` extracts the return type of a function.

### Union Distribution in Conditional Types

Conditional types distribute over unions, which enables powerful type transformations:

```typescript
type NonFunction<T> = T extends Function ? never : T;

type Primitives = string | number | boolean | Function | null;
type NonFunctionPrimitives = NonFunction<Primitives>;  // string | number | boolean | null
```

Here, `NonFunction<T>` is applied to each member of the union type `Primitives`. This is as if we wrote:
```typescript
type NonFunctionPrimitives = 
  | NonFunction<string>
  | NonFunction<number>
  | NonFunction<boolean>
  | NonFunction<Function>
  | NonFunction<null>;
```

This distribution property makes conditional types especially powerful for filtering and transforming union types.

### Creating Type Guards with Conditional Types

Conditional types can be used to create more precise type guards:

```typescript
// Define a type guard function type
type TypeGuard<T, U extends T> = (value: T) => value is U;

// Use it to create specific guards
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

type Animal = Bird | Fish;

const isBird: TypeGuard<Animal, Bird> = (animal: Animal): animal is Bird => {
  return (animal as Bird).fly !== undefined;
};

// Usage
function getAnimal(): Animal {
  // implementation
  return { fly() {}, layEggs() {} };
}

const animal = getAnimal();
if (isBird(animal)) {
  // TypeScript knows animal is Bird here
  animal.fly();
}
```

In this example, `TypeGuard<T, U>` is a type that represents a function that checks if a value of type `T` is actually of the more specific type `U`.

## 3. Recursive Types: Building Complex Structures

Recursive types are types that refer to themselves, allowing for complex nested structures:

```typescript
// A recursive type for JSON values
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONArray
  | JSONObject;

interface JSONObject {
  [key: string]: JSONValue;
}

interface JSONArray extends Array<JSONValue> {}

// Example usage
const data: JSONValue = {
  name: "Alice",
  age: 30,
  isActive: true,
  address: {
    street: "123 Main St",
    city: "Wonderland",
    postalCode: null
  },
  tags: ["developer", "typescript", 42]
};
```

This recursive definition creates a type that can represent any valid JSON structure. `JSONValue` can be a primitive, or it can contain other `JSONValue`s through arrays or objects.

### Recursive Type for Tree Structures

```typescript
// A recursive type for tree nodes
interface TreeNode<T> {
  value: T;
  children: TreeNode<T>[];
}

// Example usage
const tree: TreeNode<string> = {
  value: "root",
  children: [
    {
      value: "child1",
      children: [
        { value: "grandchild1", children: [] },
        { value: "grandchild2", children: [] }
      ]
    },
    {
      value: "child2",
      children: []
    }
  ]
};
```

This example defines a `TreeNode` type that can contain other `TreeNode`s, creating a tree structure of arbitrary depth.

## 4. Template Literal Types: String Manipulation at the Type Level

Template literal types combine with other type operations to create advanced string manipulation at the type level:

```typescript
// Create a type for CSS properties
type CSSProperty = "color" | "background-color" | "font-size" | "margin";

// Create a type for CSS values
type CSSValue = string | number;

// Create a type for CSS declarations
type CSSDeclaration = `${CSSProperty}: ${CSSValue}`;

// Valid CSS declarations
const valid1: CSSDeclaration = "color: red";
const valid2: CSSDeclaration = "font-size: 16px";
const valid3: CSSDeclaration = "margin: 10";

// This would be a type error:
// const invalid: CSSDeclaration = "width: 100%";
```

This example uses a template literal type to create a type that only allows valid CSS property-value combinations.

### Advanced Template Literal Types

Template literal types can be combined with conditional types and mapped types for more advanced transformations:

```typescript
// Convert camelCase to kebab-case
type KebabCase<S extends string> = S extends `${infer First}${infer Rest}`
  ? First extends Lowercase<First>
    ? `${First}${KebabCase<Rest>}`
    : `-${Lowercase<First>}${KebabCase<Rest>}`
  : S;

type Test1 = KebabCase<"backgroundColor">;  // "background-color"
type Test2 = KebabCase<"fontSize">;         // "font-size"

// Create a type that converts an object's keys from camelCase to kebab-case
type KebabCaseKeys<T> = {
  [K in keyof T as KebabCase<string & K>]: T[K];
};

interface Styles {
  backgroundColor: string;
  fontSize: number;
  marginTop: string;
}

type CSSStyles = KebabCaseKeys<Styles>;
// {
//   "background-color": string;
//   "font-size": number;
//   "margin-top": string;
// }
```

This example shows a recursive conditional type `KebabCase` that converts a camelCase string to kebab-case, and then uses it in a mapped type `KebabCaseKeys` to transform an object's property names.

## 5. Higher-Order Type Functions: Combining Patterns

Just like higher-order functions, we can create higher-order type functions by combining the patterns we've seen so far:

```typescript
// Pick properties of a specific type
type PickByType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K];
};

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  isActive: boolean;
}

type StringProperties = PickByType<User, string>;
// { name: string; email: string; }

type NumberProperties = PickByType<User, number>;
// { id: number; age: number; }
```

In this example, `PickByType` combines mapped types with conditional types to create a type that picks properties based on their value type.

### Deep Partial: Recursive Optional Properties

A common higher-order type pattern is to create a "deep" version of another utility type:

```typescript
// Make all properties optional, recursively
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

interface Person {
  name: string;
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      country: string;
    };
  };
  interests: string[];
}

type PartialPerson = DeepPartial<Person>;
// Can have structure like:
const partial: PartialPerson = {
  name: "Alice",
  contact: {
    email: "alice@example.com",
    // phone is optional
    address: {
      // Only specify city, the rest is optional
      city: "Wonderland"
    }
  }
  // interests is optional
};
```

This `DeepPartial` type recursively makes all properties optional, even in nested objects.

### Flatten Type: Combining Properties from Nested Objects

```typescript
// Flatten an object type by combining nested properties with dot notation
type Flatten<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? Flatten<T[K], `${Prefix}${string & K}.`>
    : { [P in `${Prefix}${string & K}`]: T[K] }
}[keyof T];

interface NestedObject {
  a: {
    b: {
      c: string;
      d: number;
    };
    e: boolean;
  };
  f: string;
}

type FlattenedObject = Flatten<NestedObject>;
// {
//   "a.b.c": string;
//   "a.b.d": number;
//   "a.e": boolean;
//   "f": string;
// }
```

This `Flatten` type recursively traverses an object type and creates a new flat object type with dot-notation property paths.

## 6. Advanced Real-World Examples

Let's explore some practical applications of these higher-order type patterns.

### Type-Safe Event Emitter

```typescript
// Event map
interface EventMap {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string; timestamp: number };
  'message:received': { from: string; content: string; timestamp: number };
}

// Event emitter with type-safe events
class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners: Partial<{
    [E in keyof Events]: ((data: Events[E]) => void)[];
  }> = {};

  // Add a type-safe event listener
  on<E extends keyof Events>(event: E, listener: (data: Events[E]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  // Emit a type-safe event
  emit<E extends keyof Events>(event: E, data: Events[E]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
}

// Usage
const emitter = new TypedEventEmitter<EventMap>();

// Type-safe event listeners
emitter.on('user:login', data => {
  console.log(`User ${data.userId} logged in at ${new Date(data.timestamp)}`);
});

emitter.on('message:received', data => {
  console.log(`Message from ${data.from}: ${data.content}`);
});

// Type-safe event emissions
emitter.emit('user:login', {
  userId: "user123",
  timestamp: Date.now()
});

// TypeScript would catch this error:
// emitter.emit('user:login', { userId: "user123" }); // Missing 'timestamp'
// emitter.emit('unknown-event', {}); // Unknown event
```

This example uses generics and higher-order type patterns to create a type-safe event emitter system.

### Type-Safe API Client

```typescript
// Define API endpoints with their request and response types
interface ApiEndpoints {
  '/users': {
    get: {
      request: { limit?: number };
      response: { users: { id: string; name: string }[] };
    };
    post: {
      request: { name: string; email: string };
      response: { id: string; name: string; email: string };
    };
  };
  '/users/:id': {
    get: {
      request: { id: string };
      response: { id: string; name: string; email: string };
    };
    put: {
      request: { id: string; name?: string; email?: string };
      response: { id: string; name: string; email: string };
    };
  };
}

// Extract request and response types for HTTP methods
type HttpMethod = 'get' | 'post' | 'put' | 'delete';

type Request<E extends keyof ApiEndpoints, M extends HttpMethod> = 
  M extends keyof ApiEndpoints[E] 
    ? ApiEndpoints[E][M] extends { request: infer R } 
      ? R 
      : never 
    : never;

type Response<E extends keyof ApiEndpoints, M extends HttpMethod> = 
  M extends keyof ApiEndpoints[E] 
    ? ApiEndpoints[E][M] extends { response: infer R } 
      ? R 
      : never 
    : never;

// Type-safe API client
class ApiClient {
  // Type-safe HTTP methods
  get<E extends keyof ApiEndpoints>(
    endpoint: E,
    params: Request<E, 'get'>
  ): Promise<Response<E, 'get'>> {
    // Implementation
    return fetch(`https://api.example.com${String(endpoint)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    }).then(res => res.json());
  }

  post<E extends keyof ApiEndpoints>(
    endpoint: E,
    data: Request<E, 'post'>
  ): Promise<Response<E, 'post'>> {
    // Implementation
    return fetch(`https://api.example.com${String(endpoint)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json());
  }

  // Similar methods for put, delete, etc.
}

// Usage
const apiClient = new ApiClient();

// Type-safe API calls
async function example() {
  // Get users
  const { users } = await apiClient.get('/users', { limit: 10 });
  
  // Create a user
  const newUser = await apiClient.post('/users', {
    name: "Alice",
    email: "alice@example.com"
  });
  
  // TypeScript would catch these errors:
  // await apiClient.get('/users', { unknown: true }); // Unknown parameter
  // await apiClient.post('/users/:id', { name: "Bob" }); // Missing 'id' parameter
}
```

This example uses conditional types with `infer` to extract request and response types from an API definition, creating a fully type-safe API client.

### State Management with Type Safety

```typescript
// Define a state shape
interface AppState {
  user: {
    id: string | null;
    name: string | null;
    isAuthenticated: boolean;
  };
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    modal: {
      isOpen: boolean;
      content: string | null;
    };
  };
  data: {
    posts: Array<{ id: string; title: string; content: string }>;
    loading: boolean;
    error: string | null;
  };
}

// Create a type for action types based on nested paths in the state
type PathsToLeaves<T, K extends string = ""> = T extends object
  ? {
      [P in keyof T]: PathsToLeaves
        T[P],
        K extends "" ? string & P : `${K}.${string & P}`
      >;
    }[keyof T]
  : K;

type StatePaths = PathsToLeaves<AppState>;
// 'user.id' | 'user.name' | 'user.isAuthenticated' | 'ui.theme' | ...

// Get the type at a specific path
type TypeAtPath<T, P extends string> = P extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? TypeAtPath<T[Head], Tail>
    : never
  : P extends keyof T
  ? T[P]
  : never;

// Define actions for updating the state
type Action
  T extends StatePaths,
  V extends TypeAtPath<AppState, T>
> = {
  type: 'SET_STATE';
  path: T;
  value: V;
};

// Create a type-safe action creator
function createAction
  T extends StatePaths,
  V extends TypeAtPath<AppState, T>
>(path: T, value: V): Action<T, V> {
  return { type: 'SET_STATE', path, value };
}

// Type-safe reducer
function reducer(state: AppState, action: Action<StatePaths, any>): AppState {
  if (action.type === 'SET_STATE') {
    // This is a simplified implementation; in practice, you would use a library like immer
    const newState = JSON.parse(JSON.stringify(state));
    const pathParts = action.path.split('.');
    let current = newState;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    
    current[pathParts[pathParts.length - 1]] = action.value;
    return newState;
  }
  
  return state;
}

// Usage
const initialState: AppState = {
  user: { id: null, name: null, isAuthenticated: false },
  ui: { theme: 'light', sidebarOpen: false, modal: { isOpen: false, content: null } },
  data: { posts: [], loading: false, error: null }
};

// Type-safe actions
const loginAction = createAction('user.isAuthenticated', true);
const setThemeAction = createAction('ui.theme', 'dark');
const openModalAction = createAction('ui.modal.isOpen', true);

// These would be type errors:
// const invalidAction1 = createAction('user.id', true); // 'id' should be string | null
// const invalidAction2 = createAction('unknown.path', 'value'); // Unknown path
```

This example uses template literal types and conditional types to create a type-safe state management system with path-based updates.

## 7. Beyond the Basics: Type-Level Programming Techniques

### Type-Level Arithmetic

```typescript
// Type-level representation of natural numbers
type Zero = { isZero: true };
type Succ<N> = { prev: N; isZero: false };

// Type-level numbers
type _1 = Succ<Zero>;
type _2 = Succ<_1>;
type _3 = Succ<_2>;

// Addition of type-level numbers
type Add<A, B> = A extends Zero
  ? B
  : A extends Succ<infer APrev>
  ? Succ<Add<APrev, B>>
  : never;

// Test addition
type _2Plus3 = Add<_2, _3>; // Equivalent to _5

// Convert from type-level number to regular number
type ToNumber<N> = N extends Zero
  ? 0
  : N extends Succ<infer NPrev>
  ? ToNumber<NPrev> extends infer R
    ? [R] extends [number]
      ? R extends number
        ? R extends any
          ? 1 + R
          : never
        : never
      : never
    : never
  : never;

type Result = ToNumber<_2Plus3>; // 5
```

This example demonstrates how to represent natural numbers at the type level and perform arithmetic operations on them.

### Type-Level State Machines

```typescript
// Define states for a traffic light
type TrafficLightState = 'green' | 'yellow' | 'red';

// Define valid transitions
type Transitions = {
  green: 'yellow';
  yellow: 'red';
  red: 'green';
};

// Type-safe state machine
type StateMachine
  S extends string,
  T extends Record<string, string>
> = {
  state: S;
  transition(): StateMachine<T[S], T>;
};

// Create a traffic light state machine
function createTrafficLight(): StateMachine<TrafficLightState, Transitions> {
  const machine = {
    state: 'green' as TrafficLightState,
    transition() {
      // Update state based on the transitions
      this.state = {
        green: 'yellow',
        yellow: 'red',
        red: 'green'
      }[this.state] as Transitions[typeof this.state];
      
      return this;
    }
  };
  
  return machine;
}

// Usage
const trafficLight = createTrafficLight();
console.log(trafficLight.state);  // 'green'

trafficLight.transition();
console.log(trafficLight.state);  // 'yellow'

trafficLight.transition();
console.log(trafficLight.state);  // 'red'

trafficLight.transition();
console.log(trafficLight.state);  // 'green'
```

This example creates a type-safe state machine for a traffic light, ensuring that transitions only occur between valid states.

## Conclusion: The Power and Limits of Higher-Order Types

Higher-order type patterns in TypeScript provide a powerful toolset for creating safer, more expressive, and more flexible code. By treating types as first-class citizens that can be manipulated, transformed, and composed, we can build robust type abstractions that prevent entire categories of bugs.

The key patterns we've explored are:

1. **Mapped Types**: Transform the structure of object types
2. **Conditional Types**: Make decisions at the type level
3. **Recursive Types**: Create types that refer to themselves
4. **Template Literal Types**: Manipulate string types
5. **Higher-Order Type Functions**: Combine these patterns for more complex transformations

While these patterns are powerful, they come with some limitations:

- **Complexity**: Advanced type patterns can be difficult to understand and maintain
- **Performance**: Complex type operations can slow down the TypeScript compiler
- **Learning Curve**: These patterns require a deeper understanding of TypeScript's type system

To effectively use higher-order type patterns:

1. Start simple and build up complexity gradually
2. Document complex type operations thoroughly
3. Create reusable type utilities for common patterns
4. Use meaningful names for type parameters and utilities
5. Consider the balance between type safety and maintainability

When used judiciously, higher-order type patterns can dramatically improve the safety and expressiveness of your TypeScript code, creating a better development experience and preventing bugs before they happen.