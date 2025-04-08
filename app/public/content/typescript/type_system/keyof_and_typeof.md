# Understanding TypeScript's `keyof` and `typeof` Operators from First Principles

TypeScript enhances JavaScript with a powerful type system that helps catch errors during development. Two essential operators in TypeScript are `keyof` and `typeof`. Let's explore these from fundamental principles, building our understanding step by step.

## The `typeof` Operator

The `typeof` operator in TypeScript serves two distinct purposes, which is important to understand from the start.

### 1. JavaScript's Runtime `typeof`

Before diving into TypeScript's version, let's understand the original JavaScript `typeof` operator:

```typescript
// JavaScript's typeof (also available in TypeScript)
console.log(typeof "hello"); // "string"
console.log(typeof 42);      // "number"
console.log(typeof true);    // "boolean"
console.log(typeof {});      // "object"
console.log(typeof []);      // "object" (arrays are objects in JavaScript)
console.log(typeof null);    // "object" (this is actually a known JavaScript bug)
console.log(typeof undefined); // "undefined"
console.log(typeof function(){}); // "function"
```

This operator returns a string indicating the runtime type of a value. It's a JavaScript feature that's been around for decades.

### 2. TypeScript's Type-Level `typeof`

TypeScript introduces its own version of `typeof` for use in type contexts. This is fundamentally different - it operates at the type level, not the value level.

```typescript
// Let's declare a concrete object
const user = {
  id: 123,
  name: "Alice",
  isAdmin: false
};

// TypeScript's typeof creates a TYPE from the structure of a VALUE
type User = typeof user;

// This is equivalent to manually writing:
type UserManual = {
  id: number;
  name: string;
  isAdmin: boolean;
};

// Now we can use this type for other variables
const anotherUser: User = {
  id: 456,
  name: "Bob", 
  isAdmin: true
  // If we added another property, TypeScript would error
};
```

In this example, `typeof user` doesn't return a string like "object" - instead, it creates a type that matches the structure of the `user` object. This is incredibly powerful as it allows us to extract types from values.

### Real-World Example of `typeof`

Let's see a more practical example:

```typescript
// Configuration object with various settings
const config = {
  apiEndpoint: "https://api.example.com",
  timeout: 5000,
  retryCount: 3,
  debugMode: true,
  logLevels: ["error", "warning", "info"] as const
};

// Create a type from our config object
type Config = typeof config;

// Now we can use this for functions that need configuration
function updateConfig(newConfig: Partial<Config>) {
  // Implementation...
  console.log("Updating config with", newConfig);
}

// TypeScript knows exactly what properties and types are allowed
updateConfig({ timeout: 10000 }); // ✓ Valid
updateConfig({ apiEndpoint: "https://new-api.example.com" }); // ✓ Valid
updateConfig({ unknownSetting: true }); // ❌ Error: 'unknownSetting' doesn't exist in type 'Partial<Config>'
```

Here, we've used `typeof` to derive a type from our configuration object, and then used that type to ensure that any updates to the configuration contain only valid properties with the correct types.

## The `keyof` Operator

The `keyof` operator extracts the keys from a type as a union type. It's fundamentally about accessing the property names of a type.

```typescript
// Define a type explicitly
type Person = {
  name: string;
  age: number;
  address: string;
};

// keyof extracts the property names as a union type
type PersonKeys = keyof Person; // "name" | "age" | "address"

// We can use this union type
function getProperty(person: Person, key: PersonKeys) {
  return person[key]; // TypeScript knows this is safe!
}

const john: Person = {
  name: "John",
  age: 30,
  address: "123 Main St"
};

const johnsName = getProperty(john, "name"); // Returns "John"
const johnsAge = getProperty(john, "age");   // Returns 30

// This would be a compile-time error:
// getProperty(john, "email"); // ❌ Error: Argument of type '"email"' is not assignable to parameter of type 'keyof Person'
```

In this example, `keyof Person` creates a union type of all property names in the `Person` type. We then use this to ensure that we only access properties that actually exist.

### Combining `keyof` and `typeof`

These operators become especially powerful when used together:

```typescript
// Start with a concrete object
const product = {
  id: "prod-123",
  name: "Ergonomic Chair",
  price: 299.99,
  inStock: true
};

// Get the type of the object, then get its keys
type ProductKeys = keyof typeof product; // "id" | "name" | "price" | "inStock"

// Now we can create a function to safely get any property from a product-like object
function getProductProperty(product: typeof product, key: ProductKeys) {
  return product[key];
}

// Usage
const chairName = getProductProperty(product, "name"); // Returns "Ergonomic Chair"
```

Here, we first use `typeof product` to get the type structure from our concrete product object. Then we apply `keyof` to get all its property names as a union type. This creates a robust type-safe way to access object properties.

## Practical Applications

### Example 1: Type-Safe Object Property Access

```typescript
// Generic function to safely access any property of any object
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Let's use it with different objects
const user = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

const company = {
  name: "Acme Inc",
  foundedYear: 1985,
  employees: 500
};

// These are all type-safe
const userName = getProperty(user, "name");     // TypeScript knows this is a string
const companyYear = getProperty(company, "foundedYear"); // TypeScript knows this is a number

// This would be a compile error
// const notFound = getProperty(user, "address"); // ❌ Error: 'address' doesn't exist in type
```

This generic function provides type-safe property access for any object. The magic happens with `K extends keyof T`, which means K must be one of the keys of type T. TypeScript then knows that the return type is whatever type the property has in the original object.

### Example 2: Creating Mapped Types

```typescript
// Original type
interface Form {
  username: string;
  password: string;
  rememberMe: boolean;
}

// Create a type where all properties are optional
type PartialForm = Partial<Form>;

// Create a type where all properties are readonly
type ReadonlyForm = Readonly<Form>;

// Create our own mapped type: make all properties nullable
type NullableForm = {
  [K in keyof Form]: Form[K] | null;
};

// Usage examples
const completeForm: Form = {
  username: "alice",
  password: "secret",
  rememberMe: true
};

const partialForm: PartialForm = {
  username: "bob"
  // Other fields are optional
};

const nullableForm: NullableForm = {
  username: "charlie",
  password: null, // This is allowed now
  rememberMe: true
};
```

In this example, we've used `keyof` within a mapped type to transform all properties of our `Form` type. The syntax `[K in keyof Form]` iterates over all property keys, allowing us to modify the types of the properties.

### Example 3: Creating Enum-like Objects with Type Safety

```typescript
// Define a const object (similar to an enum)
const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
} as const; // The "as const" is important!

// Get the type of the values
type HttpStatusCode = typeof HttpStatus[keyof typeof HttpStatus]; // 200 | 201 | 400 | 401 | 404 | 500

// Function that only accepts valid HTTP status codes
function handleResponse(status: HttpStatusCode) {
  // Implementation...
  if (status >= 400) {
    console.log("Error response received:", status);
  } else {
    console.log("Success response:", status);
  }
}

// Valid usages
handleResponse(HttpStatus.OK); // ✓ Valid
handleResponse(200); // ✓ Valid (200 is in the union type)

// Invalid usages
// handleResponse(418); // ❌ Error: Argument of type '418' is not assignable to parameter of type 'HttpStatusCode'
```

This example shows how to create an "enum-like" object and extract its values as a union type. The `as const` assertion is crucial as it tells TypeScript to treat the values as literal types rather than more general types like `number`.

## Understanding at a Deeper Level

### The Type System vs. Runtime

A critical distinction to understand is that `typeof` and `keyof` (when used in TypeScript type contexts) operate entirely within the type system. They have no runtime presence.

```typescript
// This works at compile time only
type UserKeys = keyof typeof user;

// This would be a runtime error - UserKeys doesn't exist at runtime
// console.log(UserKeys); // ❌ Error
```

TypeScript's type system is erased during compilation to JavaScript, so these type operators have no equivalent in the final JavaScript code.

### Type Queries vs. Type Operations

- `typeof` in TypeScript is a "type query" - it queries the type system for the type of a value.
- `keyof` is a "type operation" - it performs an operation on a type to produce a new type.

Understanding this conceptual difference helps clarify their usage.

## Advanced Patterns

### Conditional Types with `keyof` and `typeof`

```typescript
// A more complex example using conditional types
type PickValueType<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? K : never]: T[K]
};

// Define an object with various property types
const mixed = {
  name: "Product",
  id: 123,
  inStock: true,
  price: 99.99,
  tags: ["electronics", "gadget"]
};

// Extract only the string properties
type StringProperties = PickValueType<typeof mixed, string>;
// Result: { name: string }

// Extract only the number properties
type NumberProperties = PickValueType<typeof mixed, number>;
// Result: { id: number, price: number }
```

This advanced example combines `keyof`, `typeof`, mapped types, and conditional types to create a utility that picks only properties of a specific type from an object.

### Recursive Types

```typescript
// Define a deep readonly type with keyof
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object 
    ? DeepReadonly<T[K]> 
    : T[K]
};

// An example nested object
const settings = {
  theme: {
    dark: {
      background: "#222",
      text: "#eee"
    },
    light: {
      background: "#fff",
      text: "#222"
    }
  },
  fontSize: 16
};

// Make it deeply readonly
const readonlySettings: DeepReadonly<typeof settings> = settings;

// These would be compile errors:
// readonlySettings.fontSize = 18; // ❌ Error: Cannot assign to 'fontSize' because it is a read-only property
// readonlySettings.theme.dark.background = "#000"; // ❌ Error: Cannot assign to 'background' because it is a read-only property
```

This example recursively applies the `readonly` modifier to all properties at all levels of an object, demonstrating how `keyof` can be used in recursive type definitions.

## Conclusion

TypeScript's `keyof` and `typeof` operators are fundamental building blocks for creating advanced type-safe code. They bridge the gap between values and types, allowing us to:

1. Extract types from existing values using `typeof`
2. Access the property keys of a type using `keyof`
3. Combine them for powerful type manipulations

By understanding these operators from first principles, you gain the ability to create more robust, type-safe code that leverages TypeScript's type system to prevent errors before they happen. These operators form the foundation for many advanced TypeScript patterns and utilities, including those in the standard library like `Partial<T>`, `Pick<T, K>`, and many others.

When you encounter a TypeScript challenge involving object properties, keys, or values, remember these powerful tools - they're often the key to creating elegant type-safe solutions.