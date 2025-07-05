# TypeScript Object Type Definitions: From JavaScript Objects to Type Safety

## JavaScript Foundation: How Objects Really Work

Before TypeScript adds its type system, let's understand what JavaScript objects fundamentally are:

```javascript
// JavaScript: Objects are dynamic property containers
const user = {
  name: "Alice",
  age: 30
};

// You can add properties at any time
user.email = "alice@example.com";

// You can change property types
user.age = "thirty"; // Now age is a string!

// You can access non-existent properties (returns undefined)
console.log(user.salary); // undefined - no error!
```

JavaScript objects are  **completely flexible** . Properties can be added, removed, or changed to any type at runtime. This flexibility is powerful but can lead to bugs.

## TypeScript's Solution: Object Type Definitions

TypeScript adds a **static type layer** that describes what properties an object should have and what types those properties should be. Crucially, this happens at **compile time** - the JavaScript runtime behavior doesn't change.

```typescript
// TypeScript: Define the shape of an object
type User = {
  name: string;
  age: number;
};

const user: User = {
  name: "Alice",
  age: 30
};

// TypeScript catches errors before runtime
user.age = "thirty"; // ❌ Error: Type 'string' is not assignable to type 'number'
console.log(user.salary); // ❌ Error: Property 'salary' does not exist on type 'User'
```

> **Key Mental Model** : TypeScript object types are like **contracts** that describe what properties an object must have. The TypeScript compiler checks that your code honors these contracts, but the contracts disappear when compiled to JavaScript.

## 1. Property Types: Defining What Each Property Should Be

### Basic Property Types

```typescript
type Product = {
  id: number;           // Must be a number
  name: string;         // Must be a string
  inStock: boolean;     // Must be a boolean
  tags: string[];       // Must be an array of strings
  metadata: object;     // Must be an object (any object)
};

const laptop: Product = {
  id: 123,
  name: "MacBook Pro",
  inStock: true,
  tags: ["electronics", "computers"],
  metadata: { weight: "2kg", color: "silver" }
};
```

### Property Types with Specific Values (Literal Types)

```typescript
type Status = {
  level: "info" | "warning" | "error";  // Only these exact strings
  code: 200 | 404 | 500;               // Only these exact numbers
  active: true;                         // Must be exactly true
};

const apiResponse: Status = {
  level: "error",
  code: 404,
  active: true
};

// This would error:
// level: "debug" // ❌ Error: Type '"debug"' is not assignable to type '"info" | "warning" | "error"'
```

### Nested Object Types

```typescript
type Address = {
  street: string;
  city: string;
  zipCode: string;
};

type Customer = {
  name: string;
  address: Address;  // Nested object type
  orders: {          // Inline object type
    id: number;
    total: number;
  }[];
};

const customer: Customer = {
  name: "Bob",
  address: {
    street: "123 Main St",
    city: "Boston",
    zipCode: "02101"
  },
  orders: [
    { id: 1, total: 99.99 },
    { id: 2, total: 149.50 }
  ]
};
```

## 2. Optional Properties: When Properties Might Not Exist

### The Problem Optional Properties Solve

In JavaScript, object properties are always optional by default:

```javascript
// JavaScript: This is perfectly valid
const user1 = { name: "Alice" };
const user2 = { name: "Bob", age: 25 };
const user3 = { name: "Charlie", age: 30, email: "charlie@example.com" };
```

TypeScript needs a way to express this optionality in the type system.

### Basic Optional Properties

```typescript
type User = {
  name: string;      // Required property
  age?: number;      // Optional property (note the ?)
  email?: string;    // Optional property
};

// All of these are valid:
const user1: User = { name: "Alice" };
const user2: User = { name: "Bob", age: 25 };
const user3: User = { name: "Charlie", age: 30, email: "charlie@example.com" };

// This would error:
// const user4: User = { age: 25 }; // ❌ Error: Property 'name' is missing
```

### Optional Properties vs Undefined Values

```typescript
type Config = {
  theme?: string;
  debug?: boolean;
};

// These are equivalent:
const config1: Config = {};
const config2: Config = { theme: undefined, debug: undefined };

// When accessing optional properties, you get string | undefined
function useConfig(config: Config) {
  // config.theme has type: string | undefined
  if (config.theme) {
    // Inside this block, TypeScript knows config.theme is string
    console.log(config.theme.toUpperCase());
  }
  
  // Or use optional chaining (modern JavaScript feature)
  console.log(config.theme?.toUpperCase());
}
```

> **Important** : Optional properties (`property?`) and properties that can be undefined (`property: string | undefined`) are slightly different. Optional properties can be completely absent from the object, while undefined properties must be present but can have the value `undefined`.

### Common Pattern: Partial Configuration Objects

```typescript
type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  ssl?: boolean;        // Optional - defaults to false
  timeout?: number;     // Optional - has a default value
  retries?: number;     // Optional - has a default value
};

function connectToDatabase(config: DatabaseConfig) {
  const finalConfig = {
    ssl: false,
    timeout: 5000,
    retries: 3,
    ...config  // Override defaults with provided values
  };
  
  // Use finalConfig to connect...
}

// You only need to provide the required fields
connectToDatabase({
  host: "localhost",
  port: 5432,
  username: "admin",
  password: "secret"
  // ssl, timeout, retries will use defaults
});
```

## 3. Index Signatures: When Property Names Are Dynamic

### The Problem Index Signatures Solve

Sometimes you don't know all the property names ahead of time:

```javascript
// JavaScript: Dynamic property names
const translations = {
  "en": "Hello",
  "es": "Hola", 
  "fr": "Bonjour",
  "de": "Hallo"
  // Could have any language code as a key
};

const userPreferences = {
  "user123": { theme: "dark", language: "en" },
  "user456": { theme: "light", language: "es" },
  // Could have any user ID as a key
};
```

How do you type objects where the property names are dynamic but follow a pattern?

### Basic Index Signatures

```typescript
// Index signature: [key: keyType]: valueType
type Translations = {
  [languageCode: string]: string;
};

const translations: Translations = {
  "en": "Hello",
  "es": "Hola",
  "fr": "Bonjour",
  "de": "Hallo"
};

// You can add any string key with a string value
translations["it"] = "Ciao";
translations["ja"] = "こんにちは";

// TypeScript knows that accessing any string key gives string | undefined
const greeting: string | undefined = translations["zh"];
```

### Index Signatures with Specific Key Types

```typescript
// Numeric index signature
type ScoreBoard = {
  [playerId: number]: number;  // Player ID -> Score
};

const scores: ScoreBoard = {
  101: 1500,
  102: 2300,
  103: 1800
};

// Union type index signature  
type UserRole = "admin" | "user" | "guest";
type Permissions = {
  [role in UserRole]: string[];  // This is actually a mapped type (advanced topic)
};

// Or using string index with validation
type RolePermissions = {
  [role: string]: string[];
};
```

### Combining Known Properties with Index Signatures

```typescript
type ApiResponse = {
  // Known properties
  status: number;
  message: string;
  
  // Index signature for additional dynamic data
  [key: string]: any;
};

const response: ApiResponse = {
  status: 200,
  message: "Success",
  data: { users: [...] },      // Extra property
  timestamp: "2024-01-01",     // Extra property
  requestId: "abc123"          // Extra property
};

// You can access known properties with their specific types
const status: number = response.status;

// Dynamic properties have type 'any'
const extraData: any = response.someUnknownProperty;
```

### Practical Example: Form Data

```typescript
type FormData = {
  // Required fields we know about
  email: string;
  password: string;
  
  // Optional fields we know about  
  rememberMe?: boolean;
  
  // Any additional form fields (like hidden inputs, CSRF tokens, etc.)
  [fieldName: string]: string | boolean | undefined;
};

function handleFormSubmission(data: FormData) {
  // Known fields have specific types
  console.log(`Email: ${data.email}`);        // string
  console.log(`Password: ${data.password}`);  // string
  
  if (data.rememberMe) {                      // boolean | undefined
    // Save login state
  }
  
  // Dynamic fields need type checking
  if (typeof data.csrfToken === 'string') {
    // Include CSRF token in request
  }
}
```

## Visual Reference: Object Type Structure

```
Object Type Definition
│
├── Required Properties
│   ├── propertyName: Type
│   ├── anotherProp: Type
│   └── nestedObject: {
│       ├── nestedProp: Type
│       └── ...
│       }
│
├── Optional Properties  
│   ├── optionalProp?: Type
│   ├── maybeProp?: Type
│   └── ...
│
└── Index Signature
    └── [key: KeyType]: ValueType
```

## Advanced Patterns and Common Gotchas

### Gotcha #1: Index Signatures Override Everything

```typescript
type ProblematicType = {
  name: string;
  [key: string]: number;  // ❌ Error! 'name' property conflicts
};
// Error: Property 'name' of type 'string' is not assignable to string index type 'number'
```

The index signature says "any string key maps to a number", but we're trying to have a string key (`name`) that maps to a string. TypeScript prevents this inconsistency.

 **Solution** : Make the index signature more permissive:

```typescript
type FixedType = {
  name: string;
  [key: string]: string | number;  // ✅ Now 'name' fits the pattern
};
```

### Gotcha #2: Optional vs Undefined in Index Signatures

```typescript
type Config = {
  [setting: string]: string | undefined;
};

const config: Config = {
  theme: "dark",
  language: undefined  // This is required to be present!
};

// vs

type FlexibleConfig = {
  [setting: string]: string;
} & {
  [setting: string]?: string;  // This creates optional properties
};
```

> **Best Practice** : For dynamic objects where properties might not exist, consider using `Record<string, Type>` or `Partial<Record<string, Type>>` utility types (covered in advanced topics).

### Gotcha #3: Object Property Access Returns Union Types

```typescript
type UserData = {
  [userId: string]: { name: string; age: number };
};

const users: UserData = {
  "123": { name: "Alice", age: 30 }
};

// TypeScript knows this could be undefined!
const user = users["456"];  // Type: { name: string; age: number } | undefined

// You need to check before using
if (user) {
  console.log(user.name);  // Safe access
}

// Or use optional chaining
console.log(users["456"]?.name);
```

## Key Takeaways

> **Type Safety** : Object types prevent you from accessing non-existent properties or assigning wrong types to properties.

> **Compile Time** : All object type checking happens during compilation. The generated JavaScript is the same as if you wrote plain JavaScript.

> **Flexibility** : Optional properties and index signatures let you type both rigid and flexible object structures.

> **Progressive Enhancement** : You can start with loose types (like `[key: string]: any`) and gradually make them more specific as your code evolves.

Understanding object types is fundamental to TypeScript because almost everything in JavaScript is an object. These patterns form the foundation for more advanced TypeScript features like interfaces, classes, and generic constraints.
