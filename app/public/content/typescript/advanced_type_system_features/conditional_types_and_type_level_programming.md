# TypeScript Template Literal Types: String Manipulation at Type Level

## Part 1: JavaScript Foundation - Template Literals

Before understanding TypeScript's template literal types, let's examine how template literals work in JavaScript at runtime:

```javascript
// JavaScript: Runtime string interpolation
const greeting = "Hello";
const name = "World";
const message = `${greeting}, ${name}!`;  // "Hello, World!"

// Dynamic string construction
function createURL(protocol, domain, path) {
  return `${protocol}://${domain}/${path}`;
}

console.log(createURL("https", "api.example.com", "users/123"));
// "https://api.example.com/users/123"

// Pattern matching with strings (runtime)
function parseURL(url) {
  const match = url.match(/^(https?):\/\/([^\/]+)\/(.+)$/);
  if (match) {
    return {
      protocol: match[1],
      domain: match[2], 
      path: match[3]
    };
  }
  return null;
}
```

 **Key Points** :

* JavaScript template literals use `${}` for interpolation
* String manipulation happens at *runtime* with actual string values
* Pattern matching requires runtime parsing and regular expressions

## Part 2: TypeScript's Basic Template Literal Types

TypeScript extends template literals to work at the *type level* - manipulating and matching string types during compilation:

```typescript
// Basic template literal type syntax
type Greeting = `Hello, ${string}!`;

// Usage examples
type Message1 = `Hello, ${"World"}!`;     // "Hello, World!"
type Message2 = `Hello, ${"TypeScript"}!`; // "Hello, TypeScript!"

// The type accepts any string in the template position
function greet(message: Greeting) {
  console.log(message);
}

greet("Hello, Alice!");     // ✅ Valid
greet("Hello, Bob!");       // ✅ Valid  
greet("Hi there!");         // ❌ Error: doesn't match pattern
```

### Template Literal vs String Literal Types

```typescript
// String literal type (exact match)
type ExactMessage = "Hello, World!";

// Template literal type (pattern match)
type TemplateMessage = `Hello, ${string}!`;

// Comparison
type Test1 = "Hello, World!" extends ExactMessage ? true : false;    // true
type Test2 = "Hello, Alice!" extends ExactMessage ? true : false;    // false
type Test3 = "Hello, Alice!" extends TemplateMessage ? true : false; // true
```

> **Mental Model** : Template literal types define *patterns* that strings must match, while string literal types define *exact* strings. Think of template literals as "string validators" at the type level.

## Part 3: Understanding Template Literal Type Mechanics

### Basic Interpolation Rules

```typescript
// Different types in template positions
type WithString = `prefix-${string}-suffix`;           // Accepts any string
type WithNumber = `id-${number}`;                       // Accepts any number
type WithBoolean = `flag-${boolean}`;                   // Accepts true | false
type WithLiteral = `status-${"active" | "inactive"}`;   // Only specific literals

// Examples of what each accepts
type StringExample = "prefix-anything-suffix";         // ✅ Matches WithString
type NumberExample = "id-123";                         // ✅ Matches WithNumber  
type BooleanExample1 = "flag-true";                    // ✅ Matches WithBoolean
type BooleanExample2 = "flag-false";                   // ✅ Matches WithBoolean
type LiteralExample = "status-active";                 // ✅ Matches WithLiteral
```

### Multiple Interpolations

```typescript
// Multiple template positions
type APIEndpoint = `/${string}/${number}`;
type ValidEndpoint1 = "/users/123";        // ✅ Valid
type ValidEndpoint2 = "/posts/456";        // ✅ Valid
type InvalidEndpoint = "/users/abc";       // ❌ Invalid (abc is not a number)

// Complex patterns
type DatabaseQuery = `SELECT ${string} FROM ${string} WHERE ${string}`;
type Query = "SELECT name FROM users WHERE active = true";  // ✅ Matches pattern
```

## Part 4: Template Literal Types with Union Types

When you use union types in template positions, TypeScript generates all possible combinations:

```typescript
// Union types in templates create combinations
type Color = "red" | "green" | "blue";
type Size = "small" | "large";
type ClassName = `${Color}-${Size}`;

// TypeScript generates all combinations:
// "red-small" | "red-large" | "green-small" | "green-large" | "blue-small" | "blue-large"

// Verification
type Test1 = "red-small" extends ClassName ? true : false;   // true
type Test2 = "purple-medium" extends ClassName ? true : false; // false
```

### Combinatorial Explosion Warning

```typescript
// Be careful with large unions!
type Numbers = "1" | "2" | "3" | "4" | "5";
type Letters = "a" | "b" | "c" | "d" | "e";
type Symbols = "!" | "@" | "#" | "$" | "%";

// This creates 5 × 5 × 5 = 125 combinations!
type Combinations = `${Numbers}${Letters}${Symbols}`;

// TypeScript has limits on union size to prevent performance issues
```

> **Performance Consideration** : Template literal types with large unions can significantly slow compilation. Keep unions reasonable in size.

## Part 5: Pattern Matching with `infer` in Template Literals

The real power comes from combining template literals with conditional types and `infer`:

```typescript
// Extract parts of strings using pattern matching
type ExtractProtocol<T> = T extends `${infer Protocol}://${string}` ? Protocol : never;

// Examples
type HttpProtocol = ExtractProtocol<"https://example.com">;     // "https"
type FtpProtocol = ExtractProtocol<"ftp://files.example.com">;  // "ftp"
type NotURL = ExtractProtocol<"not-a-url">;                    // never

// Multiple extractions
type ParseURL<T> = T extends `${infer Protocol}://${infer Domain}/${infer Path}`
  ? { protocol: Protocol; domain: Domain; path: Path }
  : never;

type URLParts = ParseURL<"https://api.example.com/users/123">;
// { protocol: "https"; domain: "api.example.com"; path: "users/123" }
```

### Step-by-Step Pattern Matching

```typescript
// Understanding how pattern matching works
type StepByStep<T> = T extends `prefix-${infer Middle}-suffix`
  ? Middle
  : "no match";

// Let's trace through: StepByStep<"prefix-hello-suffix">
// 1. Does "prefix-hello-suffix" extend `prefix-${infer Middle}-suffix`?
// 2. TypeScript tries to match the pattern:
//    - "prefix-" matches literally
//    - ${infer Middle} captures "hello"  
//    - "-suffix" matches literally
// 3. Match succeeds, Middle = "hello"
// 4. Return "hello"

type Result = StepByStep<"prefix-hello-suffix">;  // "hello"
```

## Part 6: String Manipulation at Type Level

### Case Conversion

```typescript
// TypeScript provides built-in string manipulation utilities
type UppercaseExample = Uppercase<"hello world">;        // "HELLO WORLD"
type LowercaseExample = Lowercase<"HELLO WORLD">;        // "hello world"
type CapitalizeExample = Capitalize<"hello world">;      // "Hello world"
type UncapitalizeExample = Uncapitalize<"Hello World">;  // "hello World"

// Custom case conversions using template literals
type ToPascalCase<T> = T extends `${infer First}_${infer Rest}`
  ? `${Capitalize<First>}${ToPascalCase<Rest>}`
  : Capitalize<T>;

type PascalResult = ToPascalCase<"hello_world_example">;  // "HelloWorldExample"
```

### String Transformation Patterns

```typescript
// Transform kebab-case to camelCase
type KebabToCamel<T> = T extends `${infer First}-${infer Rest}`
  ? `${First}${KebabToCamel<Capitalize<Rest>>}`
  : T;

type CamelCase1 = KebabToCamel<"hello-world">;           // "helloWorld"
type CamelCase2 = KebabToCamel<"get-user-by-id">;       // "getUserById"

// Add prefixes/suffixes
type AddPrefix<T, P extends string> = `${P}${T}`;
type AddSuffix<T, S extends string> = `${T}${S}`;

type WithAPI = AddPrefix<"endpoint", "api_">;            // "api_endpoint"
type WithType = AddSuffix<"User", "Type">;               // "UserType"
```

### String Length and Validation

```typescript
// Type-level string length calculation (for short strings)
type StringLength<T extends string, Counter extends any[] = []> = 
  T extends `${string}${infer Rest}`
    ? StringLength<Rest, [...Counter, any]>
    : Counter['length'];

type Length1 = StringLength<"hello">;  // 5
type Length2 = StringLength<"hi">;     // 2

// Validate string patterns
type IsValidEmail<T> = T extends `${string}@${string}.${string}` ? true : false;
type EmailTest1 = IsValidEmail<"user@example.com">;    // true
type EmailTest2 = IsValidEmail<"invalid-email">;       // false
```

## Part 7: Advanced Template Literal Patterns

### Recursive String Processing

```typescript
// Split strings into arrays
type Split<T, Delimiter extends string> = T extends `${infer First}${Delimiter}${infer Rest}`
  ? [First, ...Split<Rest, Delimiter>]
  : [T];

type SplitPath = Split<"home/user/documents", "/">;  // ["home", "user", "documents"]
type SplitCSV = Split<"a,b,c,d", ",">;               // ["a", "b", "c", "d"]

// Join array of strings
type Join<T extends readonly string[], Delimiter extends string> = T extends readonly [
  infer First,
  ...infer Rest
]
  ? First extends string
    ? Rest extends readonly string[]
      ? Rest['length'] extends 0
        ? First
        : `${First}${Delimiter}${Join<Rest, Delimiter>}`
      : never
    : never
  : '';

type JoinedPath = Join<["home", "user", "documents"], "/">;  // "home/user/documents"
```

### Template Literal Based Routing

```typescript
// Type-safe route parameter extraction
type ExtractRouteParams<T> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<Rest>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};

type UserRoute = "/users/:id/posts/:postId";
type RouteParams = ExtractRouteParams<UserRoute>;
// { id: string; postId: string }

// Usage in function types
declare function handleRoute<T extends string>(
  route: T,
  handler: (params: ExtractRouteParams<T>) => void
): void;

handleRoute("/users/:id/posts/:postId", (params) => {
  // params.id and params.postId are properly typed as strings
  console.log(params.id, params.postId);
});
```

### Database Query Builder Types

```typescript
// Type-safe SQL-like query building
type SQLSelect<Table extends string, Columns extends string> = 
  `SELECT ${Columns} FROM ${Table}`;

type SQLWhere<Query extends string, Condition extends string> =
  `${Query} WHERE ${Condition}`;

type SQLOrderBy<Query extends string, Column extends string> =
  `${Query} ORDER BY ${Column}`;

// Compose complex queries
type BaseQuery = SQLSelect<"users", "id, name, email">;
type FilteredQuery = SQLWhere<BaseQuery, "active = true">;
type FinalQuery = SQLOrderBy<FilteredQuery, "name ASC">;
// "SELECT id, name, email FROM users WHERE active = true ORDER BY name ASC"

// Extract table names from queries
type ExtractTable<T> = T extends `SELECT ${string} FROM ${infer Table}${string}`
  ? Table extends `${infer TableName} ${string}`
    ? TableName
    : Table
  : never;

type TableName = ExtractTable<FinalQuery>;  // "users"
```

## Part 8: Real-World Applications

### CSS-in-JS Type Safety

```typescript
// Type-safe CSS property generation
type CSSLength = `${number}px` | `${number}rem` | `${number}%` | `${number}vh` | `${number}vw`;
type CSSColor = `#${string}` | `rgb(${number}, ${number}, ${number})` | `hsl(${number}, ${number}%, ${number}%)`;

interface CSSProperties {
  width?: CSSLength;
  height?: CSSLength;
  color?: CSSColor;
  backgroundColor?: CSSColor;
  margin?: CSSLength;
  padding?: CSSLength;
}

// Valid CSS values
const styles: CSSProperties = {
  width: "100px",           // ✅ Valid
  height: "50%",            // ✅ Valid
  color: "#ff0000",         // ✅ Valid
  backgroundColor: "rgb(255, 0, 0)",  // ✅ Valid
  // width: "100",          // ❌ Error: missing unit
  // color: "red",          // ❌ Error: not a valid format
};
```

### API Endpoint Type Generation

```typescript
// Generate API client types from endpoint patterns
type APIEndpoint = 
  | `GET /users`
  | `GET /users/${number}`
  | `POST /users`
  | `PUT /users/${number}`
  | `DELETE /users/${number}`;

type ExtractMethod<T> = T extends `${infer Method} ${string}` ? Method : never;
type ExtractPath<T> = T extends `${string} ${infer Path}` ? Path : never;

type Methods = ExtractMethod<APIEndpoint>;  // "GET" | "POST" | "PUT" | "DELETE"
type Paths = ExtractPath<APIEndpoint>;      // "/users" | `/users/${number}` | ...

// Generate client interface
type APIClient = {
  [K in APIEndpoint as ExtractMethod<K>]: (path: ExtractPath<K>) => Promise<any>
};

// Usage
declare const client: APIClient;
client.GET("/users");        // ✅ Valid
client.POST("/users");       // ✅ Valid
client.DELETE("/users/123"); // ✅ Valid (number converted to string)
```

### Event System Type Safety

```typescript
// Type-safe event system with template literals
type EventMap = {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string };
  "order:created": { orderId: string; amount: number };
  "order:shipped": { orderId: string; trackingNumber: string };
};

type EventName = keyof EventMap;
type EventPayload<T extends EventName> = EventMap[T];

// Extract namespace from event names
type ExtractNamespace<T> = T extends `${infer Namespace}:${string}` ? Namespace : never;
type Namespaces = ExtractNamespace<EventName>;  // "user" | "order"

// Filter events by namespace
type EventsInNamespace<N extends string> = {
  [K in EventName as K extends `${N}:${string}` ? K : never]: EventMap[K]
};

type UserEvents = EventsInNamespace<"user">;
// { "user:login": { userId: string; timestamp: number }; "user:logout": { userId: string } }

// Type-safe event emitter
class TypedEventEmitter {
  emit<T extends EventName>(event: T, payload: EventPayload<T>) {
    // Implementation
  }
  
  on<T extends EventName>(event: T, handler: (payload: EventPayload<T>) => void) {
    // Implementation
  }
}

const emitter = new TypedEventEmitter();
emitter.emit("user:login", { userId: "123", timestamp: Date.now() });  // ✅ Correct payload
emitter.emit("user:login", { userId: "123" });  // ❌ Error: missing timestamp
```

## Part 9: Performance and Limitations

### TypeScript Compiler Limits

```typescript
// Template literal types have performance implications
type VeryLongString = "a".repeat(1000);  // This can cause issues

// Recursive depth limits
type DeepSplit<T, D extends any[] = []> = D['length'] extends 50
  ? any  // Prevent stack overflow
  : T extends `${infer First}/${infer Rest}`
  ? [First, ...DeepSplit<Rest, [...D, any]>]
  : [T];
```

### Union Size Limitations

```typescript
// TypeScript has limits on union type size
type SmallUnion = "a" | "b" | "c";                    // ✅ Fine
type LargeUnion = SmallUnion | SmallUnion | SmallUnion; // Still manageable

// This might hit compiler limits:
type Alphabet = "a"|"b"|"c"|"d"|"e"|"f"|"g"|"h"|"i"|"j"|"k"|"l"|"m"|
               "n"|"o"|"p"|"q"|"r"|"s"|"t"|"u"|"v"|"w"|"x"|"y"|"z";
type TwoLetterCombos = `${Alphabet}${Alphabet}`;  // 26 × 26 = 676 combinations!
```

> **Best Practice** : Keep template literal unions manageable. If you need large combinations, consider using runtime validation instead.

### Common Gotchas

```typescript
// Gotcha 1: Empty string behavior
type EmptyTest = `` extends string ? true : false;  // true
type WithEmpty = `prefix${""}suffix`;               // "prefixsuffix"

// Gotcha 2: Number to string conversion
type NumberToString = `${123}`;  // "123" (converted to string)
type BooleanToString = `${true}`; // "true" (converted to string)

// Gotcha 3: Nested template literals
type Nested = `outer-${`inner-${string}`}`;  // Works, but complex
type Flattened = `outer-inner-${string}`;    // Prefer this for clarity
```

## Part 10: Best Practices and Patterns

### Progressive Enhancement Pattern

```typescript
// Start with basic string types, enhance with templates
// Level 1: Basic string validation
type EventName = string;

// Level 2: Pattern validation  
type EventNamePattern = `${string}:${string}`;

// Level 3: Specific patterns
type ValidEventName = `${"user" | "order" | "system"}:${string}`;

// Level 4: Full type safety
type TypedEventName = keyof EventMap;
```

### Composition Over Complexity

```typescript
// Instead of one complex type:
type ComplexURL = `${"http" | "https"}://${string}.${string}/${string}?${string}=${string}`;

// Use composition:
type Protocol = "http" | "https";
type Domain = `${string}.${string}`;
type Path = string;
type QueryParam = `${string}=${string}`;
type URL = `${Protocol}://${Domain}/${Path}?${QueryParam}`;
```

### Testing Template Literal Types

```typescript
// Create test suites for your template literal types
namespace TemplateTests {
  // Positive tests
  type ShouldWork1 = "user:login" extends EventNamePattern ? true : false;    // true
  type ShouldWork2 = "order:created" extends EventNamePattern ? true : false; // true
  
  // Negative tests  
  type ShouldFail1 = "invalid" extends EventNamePattern ? true : false;       // false
  type ShouldFail2 = "user-login" extends EventNamePattern ? true : false;    // false
  
  // Edge cases
  type EdgeCase1 = ":" extends EventNamePattern ? true : false;               // false
  type EdgeCase2 = "a:b:c" extends EventNamePattern ? true : false;           // true (still matches)
}
```

### Documentation and Maintainability

```typescript
/**
 * Extracts route parameters from a path pattern.
 * 
 * @example
 * ```typescript
 * type Params = ExtractRouteParams<"/users/:id/posts/:postId">;
 * // { id: string; postId: string }
 * ```
 */
type ExtractRouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<Rest>
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};

// Use descriptive names for intermediate types
type _RouteSegment<T> = T extends `${string}:${infer Param}` ? Param : never;
type _RemainingPath<T> = T extends `${string}:${string}/${infer Rest}` ? Rest : never;
```

## Part 11: Integration with Other TypeScript Features

### With Conditional Types

```typescript
// Combine template literals with conditional types for powerful patterns
type SmartJoin<T extends readonly string[]> = T extends readonly [infer First]
  ? First
  : T extends readonly [infer First, ...infer Rest]
  ? First extends string
    ? Rest extends readonly string[]
      ? `${First}/${SmartJoin<Rest>}`
      : never
    : never
  : never;

type Path = SmartJoin<["api", "v1", "users"]>;  // "api/v1/users"
```

### With Mapped Types

```typescript
// Generate object types from template literal patterns
type RouteHandlers<T extends string> = {
  [K in T as `handle${Capitalize<K>}`]: (req: Request) => Response
};

type Routes = "users" | "orders" | "products";
type Handlers = RouteHandlers<Routes>;
// {
//   handleUsers: (req: Request) => Response;
//   handleOrders: (req: Request) => Response;
//   handleProducts: (req: Request) => Response;
// }
```

### With Utility Types

```typescript
// Combine with utility types for sophisticated transformations
type APIEndpoints = {
  "GET /users": User[];
  "POST /users": User;
  "PUT /users/:id": User;
  "DELETE /users/:id": void;
};

// Extract all GET endpoints
type GETEndpoints = {
  [K in keyof APIEndpoints as K extends `GET ${string}` ? K : never]: APIEndpoints[K]
};

// Extract path from endpoint
type ExtractHTTPPath<T> = T extends `${string} ${infer Path}` ? Path : never;

// Generate path-only type
type APIPaths = {
  [K in keyof APIEndpoints]: ExtractHTTPPath<K>
}[keyof APIEndpoints];
// "/users" | "/users/:id"
```

## Conclusion: The Power of Type-Level String Manipulation

Template literal types transform TypeScript's type system into a powerful string processing engine that operates at compile time. This enables:

* **Pattern Validation** : Ensure strings match specific formats before runtime
* **Type-Safe APIs** : Generate client types from endpoint patterns automatically
* **String Transformation** : Convert between naming conventions at the type level
* **Metadata Extraction** : Parse and extract information from string patterns
* **Code Generation** : Create types based on string-based configuration

> **Key Insight** : Template literal types bring the expressiveness of runtime string manipulation to compile-time type checking, enabling you to catch string-related errors and enforce patterns before your code ever runs.

The progression from simple string interpolation to complex pattern matching and transformation shows how template literal types enable sophisticated type-level programming that makes your TypeScript code more robust and self-documenting.

 **Mental Model** : Think of template literal types as "string validators with superpowers" - they don't just check if strings match patterns, they can extract information, transform formats, and generate new types based on string structure, all at compile time.
