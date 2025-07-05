# Template Literal Type Manipulation: String Parsing and Transformation at the Type Level

## JavaScript Foundation: Template Literals

Before we explore TypeScript's type-level string manipulation, let's understand the JavaScript foundation that makes this possible.

In JavaScript, template literals allow dynamic string construction:

```javascript
// JavaScript: Runtime string manipulation
const name = "Alice";
const greeting = `Hello, ${name}!`; // "Hello, Alice!"

// More complex example
const buildUrl = (base, path, query) => {
  return `${base}/${path}?${query}`;
};

console.log(buildUrl("api", "users", "page=1")); // "api/users?page=1"
```

> **Key Mental Model** : JavaScript template literals work at runtime - they take actual string values and combine them into new strings when the code executes.

## TypeScript's Revolutionary Enhancement

TypeScript takes template literals to the type level, allowing us to manipulate and parse strings during compilation, not runtime:

```typescript
// TypeScript: Type-level string manipulation
type Greeting<T extends string> = `Hello, ${T}!`;

type AliceGreeting = Greeting<"Alice">; // "Hello, Alice!"
type BobGreeting = Greeting<"Bob">;     // "Hello, Bob!"

// The magic: This happens at compile time, not runtime!
```

> **Fundamental Difference** : JavaScript template literals work with actual string values at runtime. TypeScript template literal types work with string types at compile time, creating new types based on string patterns.

Let's visualize the compilation process:

```
Compile Time (Type Level)          Runtime (Value Level)
┌─────────────────────────┐       ┌─────────────────────────┐
│ type Name = "Alice"     │  -->  │ const name = "Alice"    │
│ type Msg = `Hi ${Name}` │  -->  │ const msg = "Hi Alice"  │
│                         │       │                         │
│ Result: "Hi Alice"      │       │ Result: "Hi Alice"      │
│ (as a type)             │       │ (as a value)            │
└─────────────────────────┘       └─────────────────────────┘
```

## Basic Template Literal Types

### Simple String Interpolation

```typescript
// Basic template literal types
type World = "World";
type HelloWorld = `Hello ${World}`; // "Hello World"

// Union types create multiple possibilities
type Color = "red" | "blue" | "green";
type ColoredItem = `${Color} shirt`;
// Result: "red shirt" | "blue shirt" | "green shirt"

// Multiple interpolations
type Size = "small" | "large";
type Product = `${Size} ${Color} shirt`;
// Result: "small red shirt" | "small blue shirt" | "large red shirt" | etc.
```

### Working with Literal Values

```typescript
// TypeScript can infer string literal types
const prefix = "user" as const; // Type: "user" (not string)
type UserPath = `/${typeof prefix}/${string}`;

// This creates a pattern that matches "/user/anything"
const validPath: UserPath = "/user/123";     // ✅ Valid
const invalidPath: UserPath = "/admin/123";  // ❌ Error
```

> **Important** : Use `as const` to prevent TypeScript from widening string literals to the general `string` type.

## String Manipulation at the Type Level

### Uppercase and Lowercase Transformations

TypeScript provides built-in utility types for case manipulation:

```typescript
type LowercaseGreeting = Lowercase<"HELLO WORLD">; // "hello world"
type UppercaseGreeting = Uppercase<"hello world">; // "HELLO WORLD"
type CapitalizedGreeting = Capitalize<"hello world">; // "Hello world"
type UncapitalizedGreeting = Uncapitalize<"Hello World">; // "hello World"

// Combining with template literals
type MakeConstant<T extends string> = Uppercase<`${T}_CONSTANT`>;
type API_KEY = MakeConstant<"api_key">; // "API_KEY_CONSTANT"
```

### Building Dynamic API Types

```typescript
// Creating REST API endpoint types
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiVersion = "v1" | "v2";
type Resource = "users" | "posts" | "comments";

type ApiEndpoint
  Method extends HttpMethod,
  Version extends ApiVersion,
  Res extends Resource
> = `${Method} /api/${Version}/${Res}`;

type GetUsers = ApiEndpoint<"GET", "v1", "users">;     // "GET /api/v1/users"
type PostComment = ApiEndpoint<"POST", "v2", "comments">; // "POST /api/v2/comments"
```

## Advanced String Parsing with Conditional Types

### Extracting Parts from Strings

Here's where TypeScript's type system becomes incredibly powerful - we can parse and extract information from string types:

```typescript
// Extract the first word from a string
type GetFirstWord<T extends string> = T extends `${infer First} ${string}`
  ? First
  : T;

type FirstWord1 = GetFirstWord<"Hello World">; // "Hello"
type FirstWord2 = GetFirstWord<"TypeScript">; // "TypeScript" (no space, returns whole string)

// Extract file extension
type GetExtension<T extends string> = T extends `${string}.${infer Ext}`
  ? Ext
  : never;

type JSExtension = GetExtension<"app.js">;        // "js"
type TSExtension = GetExtension<"component.tsx">; // "tsx"
type NoExtension = GetExtension<"README">;        // never
```

> **Pattern Matching Mental Model** : `infer` in template literal types works like regex capture groups, but at the type level. `${infer X}` captures whatever matches that position into type variable `X`.

### Path Parameter Extraction

```typescript
// Extract route parameters from URL patterns
type ExtractRouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};

type UserRouteParams = ExtractRouteParams<"/users/:id/posts/:postId">;
// Result: { id: string; postId: string }

// Usage in a function
function handleRoute<T extends string>(
  path: T,
  params: ExtractRouteParams<T>
) {
  // TypeScript knows exactly which parameters are required!
}

handleRoute("/users/:id", { id: "123" }); // ✅ Valid
handleRoute("/users/:id", { userId: "123" }); // ❌ Error: expects 'id', not 'userId'
```

## Recursive Type Parsing

### String Splitting

```typescript
// Split a string into an array of types
type Split<T extends string, Delimiter extends string> = 
  T extends `${infer Before}${Delimiter}${infer After}`
    ? [Before, ...Split<After, Delimiter>]
    : [T];

type PathSegments = Split<"users/123/posts", "/">; // ["users", "123", "posts"]
type CSVColumns = Split<"name,age,email", ",">; // ["name", "age", "email"]
```

### String Length Calculation

```typescript
// Calculate string length at type level
type StringLength<T extends string, Counter extends unknown[] = []> =
  T extends `${string}${infer Rest}`
    ? StringLength<Rest, [...Counter, unknown]>
    : Counter['length'];

type Length1 = StringLength<"Hello">; // 5
type Length2 = StringLength<"TypeScript">; // 10
```

> **Recursion in Types** : TypeScript allows recursive type definitions. Each recursive call processes one character and builds up a counter array, whose length gives us the final count.

### Advanced Parsing: JSON-like Structure

```typescript
// Parse a simple query string format
type ParseQuery<T extends string> = T extends `${infer Key}=${infer Value}&${infer Rest}`
  ? { [K in Key]: Value } & ParseQuery<Rest>
  : T extends `${infer Key}=${infer Value}`
  ? { [K in Key]: Value }
  : {};

type QueryParams = ParseQuery<"name=John&age=30&city=NYC">;
// Result: { name: "John"; age: "30"; city: "NYC" }
```

## Real-World Applications

### Type-Safe CSS-in-JS

```typescript
// Create type-safe CSS property builders
type CSSUnit = "px" | "em" | "rem" | "%";
type CSSValue<T extends number, U extends CSSUnit> = `${T}${U}`;

type Margin = CSSValue<8, "px"> | CSSValue<1, "rem"> | CSSValue<100, "%">;

const margin1: Margin = "8px";   // ✅ Valid
const margin2: Margin = "1rem";  // ✅ Valid
const margin3: Margin = "8em";   // ❌ Error: "8em" not in valid combinations
```

### Database Query Builder Types

```typescript
// Type-safe SQL-like query builder
type SelectQuery<Table extends string, Columns extends string> = 
  `SELECT ${Columns} FROM ${Table}`;

type UserQuery = SelectQuery<"users", "id, name, email">;
// Result: "SELECT id, name, email FROM users"

// With WHERE clause parsing
type WhereClause<T extends string> = T extends `${infer Column} = ${infer Value}`
  ? { [K in Column]: Value }
  : never;

type UserFilter = WhereClause<"status = active">; // { status: "active" }
```

### Environment Variable Validation

```typescript
// Ensure all required environment variables are present
type RequiredEnvVars = "DATABASE_URL" | "API_KEY" | "JWT_SECRET";

type EnvVarKey<T extends string> = T extends `${string}_${string}` 
  ? Uppercase<T>
  : Uppercase<`APP_${T}`>;

type DatabaseEnv = EnvVarKey<"database_url">; // "DATABASE_URL"
type ApiEnv = EnvVarKey<"key">; // "APP_KEY"
```

## Common Gotchas and Best Practices

### Performance Considerations

> **Warning** : Complex recursive types can slow down TypeScript compilation. Limit recursion depth and complexity for better performance.

```typescript
// Good: Simple pattern matching
type IsEmail<T extends string> = T extends `${string}@${string}.${string}`
  ? true
  : false;

// Potentially problematic: Deep recursion
type ReverseString<T extends string> = T extends `${infer First}${infer Rest}`
  ? `${ReverseString<Rest>}${First}`
  : T;
```

### Type Inference Limitations

```typescript
// TypeScript has limits on string literal inference
function createPath<T extends string>(segments: T[]) {
  return segments.join("/");
}

const path = createPath(["users", "123"]); // Type: string (not "users/123")

// Better: Use tuple types
function createTypedPath<T extends readonly string[]>(...segments: T) {
  return segments.join("/") as Join<T, "/">;
}

// Helper type for joining
type Join<T extends readonly string[], Delimiter extends string> = 
  T extends readonly [infer First, ...infer Rest]
    ? First extends string
      ? Rest extends readonly string[]
        ? Rest['length'] extends 0
          ? First
          : `${First}${Delimiter}${Join<Rest, Delimiter>}`
        : never
      : never
    : "";
```

## Mental Model Summary

```
Template Literal Types Mental Model:
┌─────────────────────────────────────┐
│ 1. Pattern Matching (like Regex)   │
│    `${infer X}` captures parts     │
│                                     │
│ 2. Conditional Logic               │
│    T extends Pattern ? A : B       │
│                                     │
│ 3. Recursion                       │
│    Type calls itself with          │
│    modified input                   │
│                                     │
│ 4. Compile-time Processing         │
│    All happens during TypeScript   │
│    compilation, not runtime         │
└─────────────────────────────────────┘
```

> **Key Insight** : Template literal type manipulation allows you to create types that understand and enforce string patterns, making your code more robust and providing better developer experience through precise autocompletion and error checking.

This powerful feature transforms TypeScript from a simple type checker into a sophisticated string processing system that works entirely at compile time, giving you runtime-like flexibility with compile-time safety.
