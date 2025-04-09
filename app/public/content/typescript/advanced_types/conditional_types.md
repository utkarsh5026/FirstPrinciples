# TypeScript Conditional Types: From First Principles

Let's explore TypeScript's conditional types by starting with the absolute fundamentals and building our understanding layer by layer.

## 1. What Are Types in TypeScript?

At the most fundamental level, types in TypeScript define the shape and behavior of values. They provide compile-time checking to help catch errors before code execution.

A simple type might look like:

```typescript
type Person = {
  name: string;
  age: number;
};

// Using the type
const alice: Person = {
  name: "Alice",
  age: 30
};
```

Types can be straightforward like the example above, but as applications grow more complex, we often need types that change based on certain conditions. This is where conditional types come in.

## 2. The Concept of Conditions

Before we dive into TypeScript's conditional types, let's understand what conditions are in programming.

In everyday programming, we use conditions to make decisions:

```typescript
// Simple conditional expression
const canDrive = person.age >= 16 ? true : false;

// Conditional statement
if (person.age >= 16) {
  console.log("Can drive");
} else {
  console.log("Cannot drive");
}
```

These conditions determine what code executes at runtime. But what if we want to make decisions about types at compile time? That's what conditional types allow us to do.

## 3. Conditional Types: The Basics

A conditional type in TypeScript uses a syntax similar to the ternary operator (`condition ? trueResult : falseResult`) but operates on types rather than values:

```typescript
type CheckType<T> = T extends string ? "Is a string" : "Not a string";

// Using our conditional type
type Result1 = CheckType<"hello">; // "Is a string"
type Result2 = CheckType<42>;      // "Not a string"
```

Let's break this down:

* `T extends string ?`: This is the condition. It checks if the type `T` is assignable to the type `string`.
* `"Is a string" :`: This is the result if the condition is true.
* `"Not a string"`: This is the result if the condition is false.

The powerful `extends` keyword is central to conditional types. It's a constraint that checks if a type is assignable to another type.

### Example: Type-Safe Function Based on Input

```typescript
type StringOrNumber<T> = T extends string 
  ? "Got a string" 
  : T extends number 
    ? "Got a number" 
    : "Got something else";

type Test1 = StringOrNumber<"hello">;  // "Got a string"
type Test2 = StringOrNumber<42>;       // "Got a number"
type Test3 = StringOrNumber<boolean>;  // "Got something else"
```

Here, we're using nested conditional types to check multiple conditions, similar to an if-else chain.

## 4. The `extends` Keyword: A Deeper Look

The `extends` keyword in TypeScript has multiple uses:

1. Class inheritance: `class Dog extends Animal`
2. Generic constraints: `function logLength<T extends { length: number }>(item: T)`
3. Conditional types: `T extends U ? X : Y`

In conditional types, `extends` tests if a type is assignable to another type. This doesn't mean they're exactly equal, just that one can be used where the other is expected.

Consider these examples:

```typescript
// Example 1: Literal type extends its base type
type Check1 = "hello" extends string ? true : false;  // true
// A literal string "hello" is assignable to the string type

// Example 2: More specific interface extends less specific
interface Animal { name: string }
interface Dog extends Animal { breed: string }

type Check2 = Dog extends Animal ? true : false;  // true
// Dog has all properties of Animal (and more)

// Example 3: Arrays
type Check3 = string[] extends any[] ? true : false;  // true
// An array of strings is assignable to an array of any

// Example 4: Union types and the distributive property (we'll explore this later)
type Check4 = (string | number) extends string ? true : false;  // false
// A union of string and number is not assignable to string
```

## 5. Practical Use Cases for Conditional Types

Let's see some real-world examples where conditional types are incredibly useful.

### Example: Creating a Type for Function Return Values

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// Testing with different functions
function greet(name: string): string {
  return `Hello, ${name}!`;
}

function count(n: number): number {
  return n;
}

type GreetReturn = ReturnType<typeof greet>;  // string
type CountReturn = ReturnType<typeof count>;  // number
type NotAFunction = ReturnType<number>;       // never
```

In this example, we created our own version of TypeScript's built-in `ReturnType` utility. It extracts the return type of a function. If the provided type isn't a function, it returns `never` (a special TypeScript type representing values that never occur).

### Example: Type-Safe Event Handlers

```typescript
type EventMap = {
  click: { x: number; y: number };
  hover: { element: string };
  submit: { data: Record<string, unknown> };
};

type EventHandler<E extends keyof EventMap> = (event: EventMap[E]) => void;

function addListener<E extends keyof EventMap>(
  event: E, 
  handler: EventHandler<E>
) {
  // Implementation...
}

// Usage
addListener("click", (event) => {
  // TypeScript knows that event has x and y properties
  console.log(`Clicked at ${event.x}, ${event.y}`);
});

addListener("hover", (event) => {
  // TypeScript knows that event has element property
  console.log(`Hovering over ${event.element}`);
});

// This would cause a type error - wrong event shape
addListener("click", (event) => {
  console.log(event.element); // Error: Property 'element' does not exist on type '{ x: number; y: number; }'
});
```

This creates a type-safe event system where the handler function's parameter type depends on the event name.

## 6. The `infer` Keyword

One of the most powerful features of conditional types is the `infer` keyword, which allows us to extract and reference parts of types.

The `infer` keyword can only be used within the `extends` clause of a conditional type. It declares a type variable that can be referenced in the true branch of the conditional type.

### Example: Extracting Types from Functions

```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function buildUser(name: string, age: number, isAdmin: boolean) {
  return { name, age, isAdmin };
}

type BuildUserParams = Parameters<typeof buildUser>; // [string, number, boolean]
```

This creates our own version of TypeScript's built-in `Parameters` utility, which extracts the parameter types of a function as a tuple.

### Example: Extracting Types from Arrays

```typescript
type ArrayElement<T> = T extends Array<infer E> ? E : never;

type Numbers = ArrayElement<number[]>; // number
type Strings = ArrayElement<string[]>; // string
type Mixed = ArrayElement<(string | number)[]>; // string | number
```

This utility extracts the element type from an array type.

### Example: Extracting Types from Promises

```typescript
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type ResolvedString = UnwrapPromise<Promise<string>>; // string
type AlreadyString = UnwrapPromise<string>; // string (unchanged)
```

This utility extracts the type inside a Promise, or returns the type unchanged if it's not a Promise.

## 7. Distributive Conditional Types

One of the most powerful aspects of conditional types is their distributive nature when used with union types. When a conditional type acts on a union, it distributes over each member of the union.

```typescript
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>; // string[] | number[]
```

Let's break down what happens:

1. `ToArray<string | number>`
2. The conditional type distributes over the union: `ToArray<string> | ToArray<number>`
3. Which evaluates to: `string[] | number[]`

This is extremely powerful because it allows us to apply transformations to each member of a union type.

### Example: Filtering Union Types

```typescript
type FilterString<T> = T extends string ? T : never;

type Mixed = string | number | boolean;
type OnlyStrings = FilterString<Mixed>; // string
```

This filters out all non-string types from the union. The `never` type in a union disappears, so we end up with just `string`.

### Preventing Distribution with Square Brackets

There are cases where we want to treat the union as a whole rather than distributing the operation. We can use square brackets to prevent distribution:

```typescript
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;

type Result1 = ToArrayNonDistributive<string | number>; // (string | number)[]
```

By wrapping the types in square brackets, we prevent distribution and get a single array type that can contain either strings or numbers.

## 8. Recursive Conditional Types

Conditional types can be recursive, which is useful for working with complex nested types:

```typescript
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

interface User {
  name: string;
  address: {
    street: string;
    city: string;
  };
  hobbies: string[];
}

type ReadonlyUser = DeepReadonly<User>;
/* 
This is equivalent to:
{
  readonly name: string;
  readonly address: {
    readonly street: string;
    readonly city: string;
  };
  readonly hobbies: readonly string[];
}
*/
```

In this example, `DeepReadonly` applies the `readonly` modifier recursively to all properties at all levels of the object.

### Example: JSON Type

A classic example of recursive conditional types is defining a JSON type:

```typescript
type JSONPrimitive = string | number | boolean | null;
type JSONArray = JSONValue[];
type JSONObject = { [key: string]: JSONValue };
type JSONValue = JSONPrimitive | JSONArray | JSONObject;

// Now we can type JSON data properly
const validJSON: JSONValue = {
  name: "Alice",
  age: 30,
  isAdmin: false,
  hobbies: ["reading", "swimming"],
  address: {
    street: "123 Main St",
    city: "Anytown"
  }
};
```

## 9. Conditional Types with Mapped Types

Conditional types and mapped types are often used together to create powerful type transformations:

```typescript
type OptionalProps<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | undefined : T[P]
};

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

type UserWithOptionalContact = OptionalProps<User, "email" | "phone">;
/* 
This is equivalent to:
{
  id: number;
  name: string;
  email: string | undefined;
  phone: string | undefined;
}
*/
```

This makes specific properties optional by adding `undefined` to their allowed types.

### Example: Modifying Properties by Type

```typescript
type MakeStringPropsUppercase<T> = {
  [P in keyof T]: T[P] extends string ? Uppercase<T[P]> : T[P]
};

type User = {
  id: number;
  name: string; // Will become uppercase
  email: string; // Will become uppercase
  isActive: boolean;
};

type UppercaseStringProps = MakeStringPropsUppercase<User>;
// In this case, the literal string types would be transformed to uppercase
// But for regular 'string' type, it remains as 'string'
```

This example combines conditional types with mapped types to modify only the string properties of an interface.

## 10. Built-in Conditional Types in TypeScript

TypeScript provides several built-in utility types that use conditional types:

### `Extract<T, U>`

Extracts types from a union that are assignable to another type:

```typescript
type Extract<T, U> = T extends U ? T : never;

type Numbers = 1 | 2 | 3 | 4 | 5;
type EvenNumbers = Extract<Numbers, 2 | 4 | 6>; // 2 | 4
```

### `Exclude<T, U>`

Removes types from a union that are assignable to another type:

```typescript
type Exclude<T, U> = T extends U ? never : T;

type Numbers = 1 | 2 | 3 | 4 | 5;
type OddNumbers = Exclude<Numbers, 2 | 4>; // 1 | 3 | 5
```

### `NonNullable<T>`

Removes `null` and `undefined` from a type:

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;

type MaybeString = string | null | undefined;
type DefinitelyString = NonNullable<MaybeString>; // string
```

### `ReturnType<T>`

Extracts the return type of a function type:

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function createUser(name: string, age: number) {
  return { name, age, createdAt: new Date() };
}

type User = ReturnType<typeof createUser>; 
// { name: string; age: number; createdAt: Date; }
```

### `Parameters<T>`

Extracts the parameter types of a function type as a tuple:

```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

function createUser(name: string, age: number, isAdmin: boolean) {
  return { name, age, isAdmin };
}

type CreateUserParams = Parameters<typeof createUser>; // [string, number, boolean]
```

## 11. Advanced Conditional Types

Let's explore some more advanced uses of conditional types:

### Example: Template Literal Types with Conditional Types

TypeScript 4.1 introduced template literal types, which work beautifully with conditional types:

```typescript
type PropEvent<T extends string, TObj> = `${T}:${Extract<keyof TObj, string>}`;

interface User {
  name: string;
  email: string;
  age: number;
}

type UserEvent = PropEvent<"change", User>; 
// "change:name" | "change:email" | "change:age"
```

This creates event types based on an object's properties.

### Example: Type Narrowing with Conditional Types

```typescript
type IsArray<T> = T extends any[] ? true : false;
type IsFunction<T> = T extends Function ? true : false;

type CheckArray = IsArray<string[]>; // true
type CheckArray2 = IsArray<string>; // false
type CheckFunction = IsFunction<() => void>; // true
```

This allows us to check if a type falls into a specific category, which can be useful for debugging or for making other type decisions.

### Example: Type-Safe Pick based on Value Type

```typescript
type PickByValueType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K]
};

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  joinDate: Date;
}

type StringProps = PickByValueType<User, string>; // { name: string; email: string; }
type BooleanProps = PickByValueType<User, boolean>; // { isActive: boolean; }
```

This utility picks properties from an object based on their value types.

## 12. Conditional Types for Error Handling

Conditional types can help create type-safe error handling patterns:

```typescript
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

// A function that returns a Result type
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: "Cannot divide by zero" };
  }
  return { success: true, data: a / b };
}

// Using the function with type safety
const result = divide(10, 2);

if (result.success) {
  // TypeScript knows data exists here
  console.log(`Result: ${result.data}`);
} else {
  // TypeScript knows error exists here
  console.log(`Error: ${result.error}`);
}
```

This pattern, similar to Rust's `Result` type, provides a type-safe way to handle operations that might fail.

## 13. `infer` with Multiple Variables

You can use `infer` to extract multiple type variables at once:

```typescript
type FirstAndLastItem<T extends any[]> = 
  T extends [infer First, ...any[], infer Last] 
    ? [First, Last] 
    : T extends [infer Single] 
      ? [Single, Single]
      : never;

type Test1 = FirstAndLastItem<[1, 2, 3, 4, 5]>; // [1, 5]
type Test2 = FirstAndLastItem<[string]>; // [string, string]
type Test3 = FirstAndLastItem<[]>; // never
```

This extracts both the first and last items from a tuple type.

### Example: Extracting Components from a Path

```typescript
type ExtractPathParams<Path extends string> = 
  Path extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<`/${Rest}`>
    : Path extends `${string}/:${infer Param}`
      ? Param
      : never;

type Params1 = ExtractPathParams<"/users/:userId/posts/:postId">; // "userId" | "postId"
type Params2 = ExtractPathParams<"/products/:productId">; // "productId"
```

This recursively extracts parameter names from a URL path pattern.

## 14. Working with `any` and `unknown` in Conditional Types

It's important to understand how conditional types interact with `any` and `unknown`:

```typescript
type CheckAny<T> = T extends any ? true : false;
type CheckUnknown<T> = unknown extends T ? true : false;

type AnyCheck = CheckAny<any>; // true (any extends anything)
type UnknownCheck1 = CheckUnknown<any>; // true (unknown extends any)
type UnknownCheck2 = CheckUnknown<string>; // false (unknown doesn't extend string)
type UnknownCheck3 = CheckUnknown<unknown>; // true (unknown extends unknown)
```

The `any` type is special because it extends everything and everything extends it. The `unknown` type is the "top type" — everything extends unknown, but unknown only extends itself and any.

## 15. Conditional Types with Generic Classes

Conditional types can be used with generic classes to create flexible and type-safe APIs:

```typescript
class APIResource<T> {
  constructor(private baseUrl: string) {}

  async fetchAll(): Promise<T[]> {
    // Implementation...
    return [] as T[];
  }

  async fetchOne<ID extends keyof T>(id: T[ID]): Promise<T> {
    // Implementation...
    return {} as T;
  }

  async create(data: T extends { id: any } ? Omit<T, 'id'> : T): Promise<T> {
    // Implementation...
    return data as T;
  }
}

interface User {
  id: number;
  name: string;
  email: string;
}

const users = new APIResource<User>('/api/users');

// TypeScript knows the return type is Promise<User[]>
const allUsers = await users.fetchAll();

// TypeScript knows we need to pass a number for the id
const user = await users.fetchOne('id', 123);

// TypeScript knows we don't need to provide an id when creating
const newUser = await users.create({
  name: 'John Doe',
  email: 'john@example.com'
});
```

In this example, the `create` method's parameter type changes based on whether the generic type `T` has an `id` property.

## 16. Putting It All Together: A Complete Example

Let's build a complete example that uses many of the concepts we've covered:

```typescript
// Define a type for different data sources
type DataSource = 'api' | 'database' | 'localStorage';

// Define different result types based on the data source
interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: number;
  };
}

interface DatabaseResult<T> {
  records: T[];
  count: number;
  page: number;
  totalPages: number;
}

interface LocalStorageData<T> {
  value: T;
  expires: number;
}

// Conditional type to get the appropriate result type based on data source
type ResultType<T, Source extends DataSource> = 
  Source extends 'api' ? ApiResponse<T> :
  Source extends 'database' ? DatabaseResult<T> :
  Source extends 'localStorage' ? LocalStorageData<T> :
  never;

// Generic function to fetch data from any source
async function fetchData<T, Source extends DataSource>(
  source: Source,
  query: Source extends 'api' ? string : 
         Source extends 'database' ? { table: string; where?: Record<string, any> } :
         Source extends 'localStorage' ? string :
         never
): Promise<ResultType<T, Source>> {
  // Implementation depends on the source
  switch(source) {
    case 'api':
      const apiResult = await fetch(query as string).then(r => r.json());
      return {
        data: apiResult,
        meta: {
          requestId: Math.random().toString(36).substring(2, 15),
          timestamp: Date.now()
        }
      } as ResultType<T, Source>;
    
    case 'database':
      const dbQuery = query as { table: string; where?: Record<string, any> };
      // Mock database query
      return {
        records: [] as T[],
        count: 0,
        page: 1,
        totalPages: 1
      } as ResultType<T, Source>;
    
    case 'localStorage':
      const key = query as string;
      const storedData = localStorage.getItem(key);
      return {
        value: storedData ? JSON.parse(storedData) : null,
        expires: Date.now() + 3600000 // 1 hour
      } as ResultType<T, Source>;
    
    default:
      throw new Error(`Unsupported data source: ${source}`);
  }
}

// Usage examples
interface User {
  id: number;
  name: string;
  email: string;
}

// API example
const apiUsers = await fetchData<User, 'api'>(
  'api',
  'https://api.example.com/users'
);
console.log(apiUsers.data); // User
console.log(apiUsers.meta.requestId); // String

// Database example
const dbUsers = await fetchData<User, 'database'>(
  'database',
  { table: 'users', where: { active: true } }
);
console.log(dbUsers.records); // User[]
console.log(dbUsers.totalPages); // Number

// LocalStorage example
const cachedUser = await fetchData<User, 'localStorage'>(
  'localStorage',
  'current-user'
);
console.log(cachedUser.value); // User
console.log(cachedUser.expires); // Number

// This would be a type error - wrong query type for database
// const invalidQuery = await fetchData<User, 'database'>(
//   'database',
//   'users' // Error: string is not assignable to { table: string; where?: Record<string, any> }
// );
```

This example demonstrates how conditional types can create a flexible, type-safe API that changes its behavior based on input parameters.

## 17. Type Inference in Conditional Types

Let's look at how TypeScript infers types in conditional types:

```typescript
type InferFromTuple<T> = T extends [infer U, ...infer Rest]
  ? { first: U; rest: Rest }
  : never;

type FromStringNumber = InferFromTuple<[string, number, boolean]>;
// { first: string; rest: [number, boolean] }

// We can go further and make it recursive
type FlattenTuple<T> = T extends [infer U, ...infer Rest]
  ? [U, ...FlattenTuple<Rest>]
  : [];

type Flattened = FlattenTuple<[1, [2, 3], [4, [5, 6]]]>;
// This doesn't actually flatten nested arrays in tuples
// You'd need more complex types for that
```

We can also use inference to extract types from complex structures:

```typescript
type GetComponentProps<T> = T extends React.ComponentType<infer Props> ? Props : never;

// For a React component
interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};

type ExtractedButtonProps = GetComponentProps<typeof Button>; // ButtonProps
```

This is incredibly useful for working with libraries like React where component props are a fundamental concept.

## 18. Leveraging TypeScript's Inference Algorithm

TypeScript's type inference is quite powerful, and we can leverage it with conditional types:

```typescript
// Extract the element type from an array type
type ElementOf<T> = T extends (infer E)[] ? E : never;

// Extract the return type from a function
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

// Extract the promise value type
type PromiseValueOf<T> = T extends Promise<infer V> ? V : never;

// Combine these to extract the type from an async function returning an array
type AsyncArrayElementOf<T> = T extends (...args: any[]) => Promise<(infer E)[]> ? E : never;

// Usage
async function fetchUsers(): Promise<User[]> {
  // Implementation...
  return [];
}

type FetchedUserType = AsyncArrayElementOf<typeof fetchUsers>; // User
```

This example chains multiple type inferences to extract nested types.

## 19. Performance Considerations

When using conditional types, there are a few performance considerations to keep in mind:

1. **Complexity** : Deeply nested or recursive conditional types can slow down the TypeScript compiler.
2. **Distribution** : Distributive conditional types on large unions can generate a lot of work for the compiler.
3. **Inference** : Multiple `infer` keywords can increase the complexity of the inference algorithm.

For large projects, consider:

* Splitting complex conditional types into simpler, reusable parts
* Using type assertions in places where TypeScript struggles with inference
* Relying on built-in utility types when possible

## 20. Advanced Pattern Matching with Conditional Types

Conditional types can be used for sophisticated pattern matching:

```typescript
// Match array patterns
type IsEmptyArray<T> = T extends [] ? true : false;
type HasExactlyOneItem<T> = T extends [infer _] ? true : false;
type HasAtLeastOneItem<T> = T extends [infer _, ...infer _] ? true : false;

// Match string patterns
type StartsWithHello<T extends string> = T extends `Hello ${infer _}` ? true : false;
type EndsWithWorld<T extends string> = T extends `${infer _} World` ? true : false;
type ContainsAt<T extends string> = T extends `${infer _}@${infer _}` ? true : false;

// Usage
type Check1 = IsEmptyArray<[]>; // true
type Check2 = IsEmptyArray<[1, 2, 3]>; // false
type Check3 = HasExactlyOneItem<[1]>; // true
type Check4 = HasExactlyOneItem<[1, 2]>; // false
type Check5 = HasAtLeastOneItem<[1, 2, 3]>; // true
type Check6 = HasAtLeastOneItem<[]>; // false

type Check7 = StartsWithHello<"Hello World">; // true
type Check8 = StartsWithHello<"Hi there">; // false
type Check9 = EndsWithWorld<"Hello World">; // true
type Check10 = EndsWithWorld<"Hello there">; // false
type Check11 = ContainsAt<"test@example.com">; // true
type Check12 = ContainsAt<"testexample.com">; // false
```

This pattern matching approach can be used to create sophisticated type validation.

## Summary

We've covered TypeScript's conditional types from first principles:

1. We started by understanding the basics of TypeScript types and conditions
2. We explored how conditional types use the `extends` keyword to check type compatibility
3. We looked at practical use cases for conditional types in everyday TypeScript code
4. We explored the powerful `infer` keyword for extracting types from complex structures
5. We looked at distributive conditional types and how they apply transformations to union types
6. We learned how to prevent distribution using square brackets when needed
7. We saw how recursive conditional types can handle deeply nested structures
8. We combined conditional types with mapped types for powerful transformations
9. We explored TypeScript's built-in conditional types like `Extract`, `Exclude`, and `ReturnType`
10. We discovered how template literal types can be combined with conditional types
11. We built a complete example showing the power of conditional types in a real application
12. We looked at advanced pattern matching techniques

Conditional types are one of TypeScript's most powerful features, enabling us to build flexible, type-safe APIs that adapt to different situations. By understanding these principles, you'll be able to build complex type systems that catch errors at compile time rather than runtime, making your code more robust and easier to maintain.
