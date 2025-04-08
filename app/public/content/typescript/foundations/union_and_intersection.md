# Understanding Union and Intersection Types from First Principles

At their core, TypeScript's union and intersection types are directly based on set theory concepts. Let's build our understanding from the ground up, starting with the mathematical foundations before exploring their practical applications in TypeScript.

## Foundations in Set Theory

In mathematics, sets are collections of distinct objects. Two fundamental operations with sets are:

1. **Union (∪)**: Combines elements from both sets.
2. **Intersection (∩)**: Includes only elements common to both sets.

For example, if we have:
- Set A = {1, 2, 3}
- Set B = {3, 4, 5}

Then:
- A ∪ B = {1, 2, 3, 4, 5} (all elements from both sets)
- A ∩ B = {3} (only elements present in both sets)

TypeScript's type system implements these concepts directly.

## Union Types in TypeScript

A union type represents a value that can be one of several types. We create it using the pipe symbol (`|`).

### Basic Union Type Example

```typescript
// A variable that can be either a string or a number
let id: string | number;

// Both of these assignments are valid
id = "abc123";
id = 456;

// This would cause a type error
// id = true; // Error: Type 'boolean' is not assignable to type 'string | number'
```

In this example, `id` can hold either a string or a number, but nothing else. The type `string | number` is a union type.

### Why Union Types are Useful

Union types solve a common problem in programming: representing values that could be of different types. For example:

```typescript
// A function that accepts either a string or an array of strings
function formatText(text: string | string[]): string {
  if (Array.isArray(text)) {
    // If it's an array, join the elements
    return text.join(", ");
  } else {
    // If it's a string, return it directly
    return text;
  }
}

// Both calls are valid
console.log(formatText("Hello")); // Output: "Hello"
console.log(formatText(["Hello", "World"])); // Output: "Hello, World"
```

This function can handle two different types of input. Without union types, we'd need two separate functions or some form of runtime type checking without compile-time safety.

### Type Narrowing with Union Types

When working with union types, TypeScript often needs help to determine which specific type is being used at a particular point in the code. This is called "type narrowing":

```typescript
function getLength(value: string | string[]): number {
  // Type narrowing using typeof
  if (typeof value === "string") {
    return value.length; // TypeScript knows value is a string here
  }
  
  // Type narrowing using Array.isArray
  if (Array.isArray(value)) {
    return value.reduce((acc, item) => acc + item.length, 0); // TypeScript knows value is string[] here
  }
  
  // TypeScript knows we've handled all possible types
  return 0;
}
```

Common ways to narrow union types:
1. `typeof` checks
2. `instanceof` checks
3. Array methods like `Array.isArray()`
4. Custom type guards (we'll see these later)

### Discriminated Unions

A particularly powerful pattern in TypeScript is the "discriminated union" (also called "tagged union"):

```typescript
// Define types with a common "kind" property that acts as a discriminator
type Circle = {
  kind: "circle";
  radius: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

// Create a union of these types
type Shape = Circle | Rectangle;

// Function that uses the discriminator to handle each shape type
function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      // TypeScript knows shape is Circle here
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      // TypeScript knows shape is Rectangle here
      return shape.width * shape.height;
  }
}

// Usage examples
const myCircle: Circle = { kind: "circle", radius: 5 };
const myRectangle: Rectangle = { kind: "rectangle", width: 4, height: 6 };

console.log(calculateArea(myCircle)); // 78.54...
console.log(calculateArea(myRectangle)); // 24
```

The `kind` property serves as a "discriminator" that TypeScript can use to determine which specific type is being used at runtime. This pattern is extremely useful for modeling different variants of a concept.

## Intersection Types in TypeScript

While union types represent "this OR that", intersection types represent "this AND that". We create them using the ampersand symbol (`&`).

### Basic Intersection Type Example

```typescript
// Define two separate types
type HasName = {
  name: string;
};

type HasAge = {
  age: number;
};

// Create an intersection type
type Person = HasName & HasAge;

// A Person must have both name and age properties
const alice: Person = {
  name: "Alice",
  age: 30
};

// This would cause a type error - missing the age property
// const bob: Person = {
//   name: "Bob"
// }; // Error: Property 'age' is missing
```

The type `Person` is an intersection type that requires all properties from both `HasName` and `HasAge`.

### Why Intersection Types are Useful

Intersection types allow you to combine multiple types to create a single type with all their features. This is particularly useful for:

1. Combining interfaces or types
2. Implementing mixins
3. Adding additional properties to existing types

### Practical Example: Feature Mixins

```typescript
// Base configuration type
type BaseConfig = {
  host: string;
  port: number;
};

// Optional logging configuration
type LoggingConfig = {
  logLevel: "info" | "warning" | "error";
  logFile: string;
};

// Optional authentication configuration
type AuthConfig = {
  authProvider: "oauth" | "jwt" | "basic";
  authServer: string;
};

// Create different configuration types by combining the pieces we need
type ServerWithLogging = BaseConfig & LoggingConfig;
type ServerWithAuth = BaseConfig & AuthConfig;
type FullFeaturedServer = BaseConfig & LoggingConfig & AuthConfig;

// Create a server with logging
const devServer: ServerWithLogging = {
  host: "localhost",
  port: 8080,
  logLevel: "info",
  logFile: "dev.log"
};

// Create a fully featured server
const productionServer: FullFeaturedServer = {
  host: "api.example.com",
  port: 443,
  logLevel: "error",
  logFile: "/var/log/prod.log",
  authProvider: "oauth",
  authServer: "auth.example.com"
};
```

This pattern allows us to compose types by combining various "features" as needed.

### Working with Functions in Intersection Types

Intersection types are also useful when working with functions that have multiple capabilities:

```typescript
// Define types for different function capabilities
type Logger = {
  log: (message: string) => void;
};

type Fetcher = {
  fetch: (url: string) => Promise<string>;
};

// Create a utility that can both log and fetch
type LoggingFetcher = Logger & Fetcher;

// Implement the combined functionality
const apiClient: LoggingFetcher = {
  log(message) {
    console.log(`[LOG]: ${message}`);
  },
  async fetch(url) {
    this.log(`Fetching ${url}...`);
    // Implementation details...
    return "Response data";
  }
};

// Use both capabilities
apiClient.log("Starting application");
apiClient.fetch("https://api.example.com/data")
  .then(data => apiClient.log(`Received: ${data}`));
```

In this example, our `apiClient` must implement both the logging and fetching capabilities.

## Advanced Patterns and Use Cases

### Union Types with Literal Types

Union types become even more powerful when combined with literal types:

```typescript
// Define a union of specific string literals
type Direction = "north" | "south" | "east" | "west";

function move(direction: Direction, steps: number): void {
  console.log(`Moving ${steps} steps ${direction}`);
  // Implementation...
}

// Valid calls
move("north", 3);
move("west", 2);

// Type error - "up" is not a valid direction
// move("up", 1); // Error: Argument of type '"up"' is not assignable to parameter of type 'Direction'
```

This creates a type-safe "enum-like" set of allowed values, with full IntelliSense support in most editors.

### Custom Type Guards

For more complex type narrowing, we can create custom type guards:

```typescript
// Define types for different message formats
type TextMessage = {
  type: "text";
  content: string;
};

type ImageMessage = {
  type: "image";
  url: string;
  dimensions: { width: number; height: number };
};

type VideoMessage = {
  type: "video";
  url: string;
  duration: number;
};

// Create a union type for all message types
type Message = TextMessage | ImageMessage | VideoMessage;

// Custom type guards for narrowing
function isTextMessage(message: Message): message is TextMessage {
  return message.type === "text";
}

function isImageMessage(message: Message): message is ImageMessage {
  return message.type === "image";
}

function isVideoMessage(message: Message): message is VideoMessage {
  return message.type === "video";
}

// Function that handles different message types
function processMessage(message: Message): void {
  if (isTextMessage(message)) {
    // TypeScript knows message is TextMessage here
    console.log(`Text message: ${message.content}`);
  } else if (isImageMessage(message)) {
    // TypeScript knows message is ImageMessage here
    console.log(`Image message: ${message.url} (${message.dimensions.width}x${message.dimensions.height})`);
  } else if (isVideoMessage(message)) {
    // TypeScript knows message is VideoMessage here
    console.log(`Video message: ${message.url} (${message.duration} seconds)`);
  } else {
    // This would be a type never - we've handled all cases
    const exhaustiveCheck: never = message;
  }
}
```

The special syntax `message is TextMessage` creates a type predicate that tells TypeScript when the type has been narrowed.

### Intersection with Type Extension

We can use intersection types to extend existing types without modifying them:

```typescript
// Original type from a library
interface LibraryOptions {
  timeout: number;
  retries: number;
}

// Our application-specific extensions
type AppOptions = LibraryOptions & {
  logErrors: boolean;
  customHeader: string;
};

// Function using the extended options
function setupLibrary(options: AppOptions): void {
  // Use both library options and our extensions
  if (options.logErrors) {
    console.log(`Setting up with timeout ${options.timeout}ms and ${options.retries} retries`);
  }
  // Implementation...
}

// All properties (both from LibraryOptions and our extensions) are required
const options: AppOptions = {
  timeout: 5000,
  retries: 3,
  logErrors: true,
  customHeader: "X-App-Version: 1.0"
};

setupLibrary(options);
```

This pattern is useful when you want to extend types from external libraries without modifying them directly.

### Combining Unions and Intersections

Union and intersection types can be combined to create complex type relationships:

```typescript
// Base types
type Entity = {
  id: string;
  createdAt: Date;
};

type Person = Entity & {
  name: string;
  email: string;
};

type Product = Entity & {
  title: string;
  price: number;
};

type Order = Entity & {
  items: Product[];
  customer: Person;
  total: number;
};

// A union type for database records
type DatabaseRecord = Person | Product | Order;

// A function that handles database records
function updateRecord(record: DatabaseRecord): void {
  // Common fields from Entity
  console.log(`Updating record ${record.id} created at ${record.createdAt}`);
  
  // Type-specific handling
  if ("name" in record) {
    // It's a Person
    console.log(`Person: ${record.name}`);
  } else if ("price" in record) {
    // It's a Product
    console.log(`Product: ${record.title} - $${record.price}`);
  } else {
    // It's an Order
    console.log(`Order: ${record.items.length} items, total $${record.total}`);
  }
}
```

This example shows how to model a database with different types of records that all share certain common properties.

## Common Pitfalls and Gotchas

### Excess Property Checks

TypeScript performs "excess property checks" when directly assigning object literals to variables with specific types:

```typescript
type Point = {
  x: number;
  y: number;
};

// This works fine - Point has exactly x and y
const point1: Point = { x: 10, y: 20 };

// This fails - z is an excess property
// const point2: Point = { x: 10, y: 20, z: 30 }; // Error: Object literal may only specify known properties

// But this works - excess property check is bypassed with intermediate variable
const coords = { x: 10, y: 20, z: 30 };
const point3: Point = coords; // No error!
```

This behavior can be confusing with intersection types, where you might expect to be able to add properties.

### Empty Intersections

When you intersect incompatible types, you get the `never` type:

```typescript
// These types have incompatible requirements
type StringType = { value: string };
type NumberType = { value: number };

// This creates an impossible type
type Impossible = StringType & NumberType;

// The property 'value' would need to be both string and number simultaneously
// This is not possible, so no value can satisfy this type
// function makeImpossible(): Impossible {
//   // There's no way to implement this
// }
```

In this example, no value can satisfy the requirement that `value` is both a string and a number simultaneously.

### Overlapping Properties in Unions

When working with union types that have common properties, you must be careful:

```typescript
type Square = {
  kind: "square";
  size: number;
};

type Rectangle = {
  kind: "rectangle";
  width: number;
  height: number;
};

type Shape = Square | Rectangle;

function getArea(shape: Shape): number {
  // This is safe because 'kind' exists on all variants
  console.log(`Computing area of a ${shape.kind}`);
  
  // This is a type error because 'size' doesn't exist on Rectangle
  // return shape.size * shape.size; // Error
  
  // We need to narrow the type first
  if (shape.kind === "square") {
    // Now TypeScript knows it's a Square
    return shape.size * shape.size;
  } else {
    // And here it knows it's a Rectangle
    return shape.width * shape.height;
  }
}
```

You can only access properties that are common to all types in the union without type narrowing.

## Real-World Examples and Patterns

### API Response Handling

Union types are perfect for modeling API responses with different structures:

```typescript
// Define possible API response types
type SuccessResponse<T> = {
  status: "success";
  data: T;
};

type ErrorResponse = {
  status: "error";
  error: {
    code: string;
    message: string;
  };
};

// Combine them into a union type
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// A function that handles API responses
function handleApiResponse<T>(response: ApiResponse<T>): T | null {
  if (response.status === "success") {
    // TypeScript knows it's a SuccessResponse<T> here
    return response.data;
  } else {
    // TypeScript knows it's an ErrorResponse here
    console.error(`API error: ${response.error.code} - ${response.error.message}`);
    return null;
  }
}

// Example usage with user data
type User = {
  id: string;
  name: string;
  email: string;
};

// Simulate a successful response
const successResponse: ApiResponse<User> = {
  status: "success",
  data: {
    id: "123",
    name: "Alice",
    email: "alice@example.com"
  }
};

// Simulate an error response
const errorResponse: ApiResponse<User> = {
  status: "error",
  error: {
    code: "AUTH_FAILED",
    message: "Authentication failed"
  }
};

// Handle both types of responses
const user1 = handleApiResponse(successResponse); // Returns the user object
const user2 = handleApiResponse(errorResponse); // Returns null
```

This pattern provides type-safe handling of different API response structures.

### Component Props in React

Intersection types are commonly used in React to compose component props:

```typescript
// Base props for all form fields
type FieldBaseProps = {
  name: string;
  label: string;
  required?: boolean;
};

// Props specific to text inputs
type TextInputProps = FieldBaseProps & {
  type: "text" | "email" | "password";
  placeholder?: string;
  maxLength?: number;
};

// Props specific to number inputs
type NumberInputProps = FieldBaseProps & {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
};

// Props specific to select dropdowns
type SelectInputProps = FieldBaseProps & {
  type: "select";
  options: Array<{ value: string; label: string }>;
  multiple?: boolean;
};

// Union of all possible field types
type FieldProps = TextInputProps | NumberInputProps | SelectInputProps;

// A component that renders the appropriate field based on type
function FormField(props: FieldProps) {
  // Common rendering for all field types
  const fieldLabel = (
    <label>
      {props.label} {props.required && <span className="required">*</span>}
    </label>
  );

  // Render different input types based on the type property
  switch (props.type) {
    case "text":
    case "email":
    case "password":
      return (
        <div>
          {fieldLabel}
          <input
            type={props.type}
            name={props.name}
            placeholder={props.placeholder}
            maxLength={props.maxLength}
            required={props.required}
          />
        </div>
      );
    case "number":
      return (
        <div>
          {fieldLabel}
          <input
            type="number"
            name={props.name}
            min={props.min}
            max={props.max}
            step={props.step}
            required={props.required}
          />
        </div>
      );
    case "select":
      return (
        <div>
          {fieldLabel}
          <select
            name={props.name}
            multiple={props.multiple}
            required={props.required}
          >
            {props.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
  }
}

// Usage examples
function MyForm() {
  return (
    <form>
      <FormField
        name="username"
        label="Username"
        type="text"
        required={true}
        maxLength={50}
      />
      
      <FormField
        name="age"
        label="Age"
        type="number"
        min={18}
        max={120}
      />
      
      <FormField
        name="country"
        label="Country"
        type="select"
        options={[
          { value: "us", label: "United States" },
          { value: "ca", label: "Canada" },
          { value: "mx", label: "Mexico" }
        ]}
      />
    </form>
  );
}
```

This example demonstrates how union and intersection types can model complex component props systems in React.

## Conclusion

Union and intersection types are fundamental building blocks in TypeScript's type system that allow you to model complex relationships between types:

1. **Union types** (`A | B`) represent values that can be one of several types - "A OR B"
2. **Intersection types** (`A & B`) represent values that have all properties from multiple types - "A AND B"

Key takeaways:

- Union types excel at handling values that could be one of several different types
- Discriminated unions provide a type-safe way to handle different variants with type narrowing
- Intersection types are perfect for composing types by combining multiple smaller types
- Together, these concepts enable modeling complex type relationships that closely match real-world domain problems

By mastering union and intersection types, you gain powerful tools for creating precise, flexible, and type-safe models in your TypeScript code. These patterns promote code that is both more robust and more maintainable by catching type errors at compile time rather than at runtime.