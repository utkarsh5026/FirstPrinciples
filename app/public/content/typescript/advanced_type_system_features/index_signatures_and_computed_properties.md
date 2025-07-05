# TypeScript: Index Signatures and Computed Properties

Let me explain these concepts by building from JavaScript's dynamic nature up to TypeScript's sophisticated type system.

## JavaScript Foundation: Dynamic Property Access

In JavaScript, objects are incredibly flexible. You can add, access, and modify properties dynamically:

```javascript
// JavaScript - completely dynamic
const user = {};

// Add properties on the fly
user.name = "Alice";
user["age"] = 30;
user[`is${"Admin"}`] = true;

// Access with variables
const propName = "name";
console.log(user[propName]); // "Alice"

// Dynamic key creation
const prefix = "user";
const id = 123;
const key = `${prefix}_${id}`;
user[key] = "some value"; // user.user_123 = "some value"
```

This flexibility is powerful but comes with risks:

```javascript
// JavaScript - no safety nets
function getUserInfo(user, field) {
    return user[field]; // Could be anything or undefined
}

// These all "work" but might not do what we expect
getUserInfo(user, "nam");     // undefined (typo!)
getUserInfo(user, "length");  // undefined 
getUserInfo(user, 42);        // undefined
```

> **The Problem** : JavaScript gives us complete freedom, but no guarantees about what properties exist or what types they hold.

## TypeScript's Solution: Static Shape Description

TypeScript needs to understand object shapes at compile time, but JavaScript's dynamic nature creates a challenge:

```
JavaScript Runtime          TypeScript Compile Time
┌─────────────────┐         ┌─────────────────┐
│ obj["any key"]  │  ←───── │ Need to know    │
│ returns any     │         │ what's valid    │
│ value           │         │ ahead of time   │
└─────────────────┘         └─────────────────┘
```

## Basic Index Signatures: Known Pattern, Unknown Keys

An index signature tells TypeScript: "This object will have properties, but I don't know their exact names, just their pattern."

```typescript
// TypeScript - describing the pattern
interface UserData {
    [key: string]: string; // Any string key → string value
}

// Now TypeScript understands the pattern
const userData: UserData = {
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com"
    // Any string property is allowed, must be string value
};

// Type-safe dynamic access
function getField(data: UserData, fieldName: string): string {
    return data[fieldName]; // TypeScript knows this returns string
}

// This works
const name = getField(userData, "firstName"); // string

// This would cause an error
const userData2: UserData = {
    firstName: "Alice",
    age: 30 // ❌ Error: Type 'number' is not assignable to type 'string'
};
```

> **Index Signature Rule** : `[keyType: KeyConstraint]: ValueType` means "any key matching KeyConstraint will have a value of ValueType"

## Mixing Known and Unknown Properties

You can combine specific properties with index signatures:

```typescript
interface ApiResponse {
    // Known, required properties
    status: number;
    message: string;
  
    // Unknown additional properties
    [key: string]: any;
}

const response: ApiResponse = {
    status: 200,
    message: "Success",
    // These are allowed due to index signature
    data: { users: [] },
    timestamp: "2024-01-01",
    version: "1.0"
};

// TypeScript knows about specific properties
console.log(response.status);  // number
console.log(response.message); // string

// And allows dynamic access
const extraData = response["data"]; // any
```

> **Important** : Known properties must be compatible with the index signature type. If your index signature is `[key: string]: string`, then `status: number` would cause an error.

## Different Key Types

TypeScript supports different index signature key types:

```typescript
// String keys (most common)
interface StringIndexed {
    [key: string]: number;
}

// Number keys (for array-like objects)
interface NumberIndexed {
    [index: number]: string;
}

// Symbol keys (for advanced use cases)
interface SymbolIndexed {
    [key: symbol]: boolean;
}

// Example: Array-like structure
interface CustomArray {
    [index: number]: string;  // Numeric indices
    length: number;           // Required length property
}

const myArray: CustomArray = {
    0: "first",
    1: "second",
    2: "third",
    length: 3
};
```

## Computed Properties: Dynamic Keys with Type Safety

Computed properties let you create object keys dynamically while maintaining type safety:

```typescript
// JavaScript foundation - computed property names
const prefix = "config";
const suffix = "Value";

const obj = {
    [`${prefix}_${suffix}`]: "hello",    // config_Value
    [prefix + "2"]: "world",             // config2
    [`${prefix.toUpperCase()}`]: "caps"  // CONFIG
};
```

In TypeScript, we can make this type-safe:

```typescript
// TypeScript - typed computed properties
type ConfigKey = "database" | "api" | "cache";

function createConfig<K extends ConfigKey>(
    key: K, 
    value: string
): Record<`${K}_url`, string> {
    return {
        [`${key}_url`]: value
    } as Record<`${K}_url`, string>;
}

// Usage
const dbConfig = createConfig("database", "localhost:5432");
// Type: { database_url: string }

const apiConfig = createConfig("api", "api.example.com");
// Type: { api_url: string }

// TypeScript knows the exact property names
console.log(dbConfig.database_url); // ✅ Valid
console.log(dbConfig.api_url);      // ❌ Error: Property doesn't exist
```

## Template Literal Types for Dynamic Patterns

TypeScript 4.1+ supports template literal types for sophisticated key patterns:

```typescript
// Define patterns for property names
type EventName = "click" | "hover" | "focus";
type HandlerName = `on${Capitalize<EventName>}`;
// Result: "onClick" | "onHover" | "onFocus"

interface EventHandlers {
    [K in HandlerName]: (event: Event) => void;
}
// Equivalent to:
// {
//   onClick: (event: Event) => void;
//   onHover: (event: Event) => void;
//   onFocus: (event: Event) => void;
// }

// Type-safe handler registration
function setupHandlers(handlers: Partial<EventHandlers>) {
    // Implementation here...
}

setupHandlers({
    onClick: (e) => console.log("clicked"),
    onHover: (e) => console.log("hovered"),
    onWrongName: (e) => {} // ❌ Error: Object literal may only specify known properties
});
```

## Real-World Pattern: Environment Variables

A common use case combines index signatures with template literals:

```typescript
// Environment variable pattern
interface Environment {
    NODE_ENV: "development" | "production" | "test";
    PORT: string;
  
    // Any variable starting with APP_ should be a string
    [key: `APP_${string}`]: string;
  
    // Any other environment variable could exist
    [key: string]: string | undefined;
}

// This enforces our rules
const env: Environment = {
    NODE_ENV: "development",
    PORT: "3000",
    APP_NAME: "MyApp",        // ✅ Matches APP_ pattern
    APP_VERSION: "1.0.0",     // ✅ Matches APP_ pattern
    DATABASE_URL: "...",      // ✅ Matches general string pattern
    // NODE_ENV: "invalid"    // ❌ Error: not in allowed union
};

// Type-safe access
function getAppConfig(key: `APP_${string}`): string {
    return env[key]; // TypeScript knows this is string, not string | undefined
}

const appName = getAppConfig("APP_NAME");     // string
const port = getAppConfig("PORT");            // ❌ Error: doesn't match pattern
```

## Advanced Pattern: Conditional Index Signatures

You can create sophisticated patterns using conditional types:

```typescript
// Different value types based on key patterns
type SmartConfig = {
    [K in string]: K extends `${string}_COUNT` 
        ? number 
        : K extends `${string}_ENABLED` 
        ? boolean 
        : string;
};

const config: SmartConfig = {
    USER_COUNT: 42,           // number (ends with _COUNT)
    CACHE_ENABLED: true,      // boolean (ends with _ENABLED)  
    API_URL: "localhost",     // string (default)
    RETRY_COUNT: 5,           // number (ends with _COUNT)
    DEBUG_ENABLED: false,     // boolean (ends with _ENABLED)
    // USER_COUNT: "invalid"  // ❌ Error: string not assignable to number
};
```

## The Hierarchy: From Loose to Strict

Here's how TypeScript's object typing progresses from loose to strict:

```
Most Flexible                           Most Strict
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ any         │    │ Index       │    │ Exact       │
│ { [k]: any }│ →  │ Signatures  │ →  │ Interfaces  │
│             │    │ { [k]: T }  │    │ { a: T }    │
└─────────────┘    └─────────────┘    └─────────────┘
```

```typescript
// 1. Most flexible - any property, any value
interface AnyObject {
    [key: string]: any;
}

// 2. Controlled flexibility - any property, controlled value type
interface StringValues {
    [key: string]: string;
}

// 3. Mixed - some known, some unknown
interface MixedObject {
    id: number;              // Must exist, must be number
    name: string;            // Must exist, must be string
    [key: string]: any;      // Other properties allowed
}

// 4. Most strict - exact shape
interface ExactObject {
    id: number;
    name: string;
    // No other properties allowed
}
```

## Common Gotchas and Mental Models

> **Gotcha 1** : Index signatures don't guarantee properties exist

```typescript
interface Config {
    [key: string]: string;
}

const config: Config = {};
const value = config.missing; // Type: string, Runtime: undefined!
```

> **Gotcha 2** : String index signatures affect all properties

```typescript
interface Mixed {
    count: number;           // ❌ Error!
    [key: string]: string;   // All properties must be string
}

// Fix: Make index signature more general
interface Fixed {
    count: number;
    [key: string]: string | number;
}
```

> **Mental Model** : Index signatures describe patterns, not guarantees. They tell TypeScript "if this property exists, it will have this type" not "this property definitely exists."

## When to Use Each Pattern

**Use basic index signatures when:**

* Working with dynamic data (APIs, configs)
* You know the value type but not the keys
* Building flexible, extensible interfaces

**Use computed properties when:**

* Generating property names programmatically
* You need type safety for dynamic key creation
* Building factory functions or builders

**Use template literal types when:**

* You have predictable key patterns
* You want to enforce naming conventions
* Building type-safe DSLs or configuration systems

This foundation gives you the tools to handle JavaScript's dynamic nature while maintaining TypeScript's safety guarantees. The key is matching the right pattern to your use case's flexibility needs.
