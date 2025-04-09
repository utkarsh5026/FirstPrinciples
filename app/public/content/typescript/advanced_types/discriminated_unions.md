# Discriminated Unions in TypeScript: A First Principles Explanation

Discriminated unions are one of TypeScript's most powerful features for modeling complex data and ensuring type safety. Let me build this concept from first principles, using clear examples along the way.

## What Are Discriminated Unions?

At the most fundamental level, a discriminated union (also called tagged unions or algebraic data types) is a way to combine several object types that share a common property with different literal values. This common property - the "discriminant" - allows TypeScript to narrow down which specific type is being used at any given moment.

### The Building Blocks

To understand discriminated unions, we need to first understand a few foundational concepts:

#### 1. Union Types

A union type allows a value to be one of several types. We express this with the `|` operator:

```typescript
// A variable that can be either a string or a number
let id: string | number;
id = "abc123"; // Valid
id = 42;       // Also valid
```

When we have a union type, we can only access properties that exist on ALL members of the union. This is a fundamental constraint that keeps our code type-safe.

#### 2. Type Narrowing

Type narrowing is the process of refining a broader type to a more specific one based on runtime checks:

```typescript
function printId(id: string | number) {
  // At this point, TypeScript only knows id could be either type
  
  if (typeof id === "string") {
    // Now TypeScript knows id is definitely a string
    console.log(id.toUpperCase());
  } else {
    // Now TypeScript knows id must be a number
    console.log(id.toFixed(2));
  }
}
```

## Constructing a Discriminated Union

Now, let's see how these concepts come together to form discriminated unions. We start by defining multiple types that share a common property with different literal values:

```typescript
// Shape types with a common 'kind' property (the discriminant)
type Circle = {
  kind: "circle";  // Literal type as discriminant
  radius: number;
};

type Square = {
  kind: "square";  // Different literal value
  sideLength: number;
};

// The discriminated union
type Shape = Circle | Square;
```

Here, the `kind` property is our discriminant. It allows TypeScript to know which specific shape we're dealing with at any point.

## Using Discriminated Unions

Let's see how we can use our `Shape` discriminated union:

```typescript
function calculateArea(shape: Shape): number {
  // Using the discriminant to determine the specific type
  if (shape.kind === "circle") {
    // TypeScript knows this is a Circle, so we can access `radius`
    return Math.PI * shape.radius * shape.radius;
  } else {
    // TypeScript knows this is a Square, so we can access `sideLength`
    return shape.sideLength * shape.sideLength;
  }
}

// Example usage
const myCircle: Shape = { kind: "circle", radius: 5 };
console.log(calculateArea(myCircle)); // 78.54...

const mySquare: Shape = { kind: "square", sideLength: 4 };
console.log(calculateArea(mySquare)); // 16
```

In this example, when we check `shape.kind`, TypeScript automatically narrows the type to either `Circle` or `Square` based on the discriminant value. This is why we can safely access `radius` or `sideLength` without type errors.

## Why Use Discriminated Unions?

Let's explore the benefits through some practical examples:

### Example 1: Modeling API Responses

Consider an API that returns different response structures based on success or failure:

```typescript
type SuccessResponse = {
  status: "success";
  data: {
    userId: number;
    username: string;
  };
};

type ErrorResponse = {
  status: "error";
  error: {
    code: number;
    message: string;
  };
};

type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse) {
  if (response.status === "success") {
    // TypeScript knows we have a SuccessResponse
    console.log(`User ${response.data.username} found!`);
  } else {
    // TypeScript knows we have an ErrorResponse
    console.log(`Error ${response.error.code}: ${response.error.message}`);
  }
}

// Example usage
const successResponse: ApiResponse = {
  status: "success",
  data: { userId: 123, username: "alice" }
};

handleResponse(successResponse); // "User alice found!"
```

### Example 2: State Management in Applications

In state management (like Redux or React's useState with complex states), discriminated unions help model different states elegantly:

```typescript
type LoadingState = {
  status: "loading";
};

type SuccessState = {
  status: "success";
  data: string[];
};

type ErrorState = {
  status: "error";
  error: string;
};

type State = LoadingState | SuccessState | ErrorState;

function renderUI(state: State) {
  switch (state.status) {
    case "loading":
      return "Loading...";
    case "success":
      // TypeScript knows we can access state.data
      return `Data: ${state.data.join(", ")}`;
    case "error":
      // TypeScript knows we can access state.error
      return `Error: ${state.error}`;
  }
}
```

## Exhaustiveness Checking

One of the most powerful features of discriminated unions is exhaustiveness checking. This ensures you've handled all possible types in the union:

```typescript
type Animal = 
  | { kind: "dog"; bark(): void }
  | { kind: "cat"; meow(): void }
  | { kind: "bird"; chirp(): void };

function makeSound(animal: Animal): void {
  switch (animal.kind) {
    case "dog":
      animal.bark();
      break;
    case "cat":
      animal.meow();
      break;
    // If we forget to handle "bird", TypeScript won't complain by default
  }
}
```

To add exhaustiveness checking, we can add a default case with a function that takes a value that should never occur:

```typescript
function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function makeSoundSafe(animal: Animal): void {
  switch (animal.kind) {
    case "dog":
      animal.bark();
      break;
    case "cat":
      animal.meow();
      break;
    default:
      // This will cause a compile-time error if we forget to handle any case
      return assertNever(animal);
  }
}
```

Now if we add a new animal type to our union but forget to update our switch statement, TypeScript will give us a compile-time error.

## Advanced Patterns with Discriminated Unions

### Nested Discriminated Unions

We can create hierarchical data structures by nesting discriminated unions:

```typescript
// Base notification type
type Notification = {
  id: string;
  read: boolean;
};

// Message notifications with subtypes
type TextMessageNotification = Notification & {
  type: "message";
  messageType: "text";
  content: string;
};

type ImageMessageNotification = Notification & {
  type: "message";
  messageType: "image";
  imageUrl: string;
  caption?: string;
};

// Friend request notification
type FriendRequestNotification = Notification & {
  type: "friendRequest";
  fromUser: {
    id: string;
    name: string;
  };
};

// Combined notification type
type AppNotification = 
  | TextMessageNotification 
  | ImageMessageNotification 
  | FriendRequestNotification;

function renderNotification(notification: AppNotification) {
  // First level of narrowing
  if (notification.type === "message") {
    // Second level of narrowing for message subtypes
    if (notification.messageType === "text") {
      return `New message: ${notification.content}`;
    } else {
      return `New image: ${notification.caption || "No caption"}`;
    }
  } else {
    return `Friend request from ${notification.fromUser.name}`;
  }
}
```

### Generic Discriminated Unions

We can combine generics with discriminated unions for even more flexibility:

```typescript
type Success<T> = {
  result: "success";
  data: T;
};

type Failure = {
  result: "failure";
  error: string;
};

type Result<T> = Success<T> | Failure;

function processUserData(result: Result<{ name: string; email: string }>) {
  if (result.result === "success") {
    // TypeScript knows we have the user data
    console.log(`User: ${result.data.name}, Email: ${result.data.email}`);
  } else {
    console.log(`Failed: ${result.error}`);
  }
}
```

## Common Pitfalls and Best Practices

### 1. Choose Simple Discriminants

Use simple string literals as discriminants rather than complex expressions:

```typescript
// Good: Simple discriminant
type Good = 
  | { kind: "a"; value: string }
  | { kind: "b"; value: number };

// Bad: Complex discriminant that's hard to check
type Bad = 
  | { data: { type: "a" }; value: string }
  | { data: { type: "b" }; value: number };
```

### 2. Make Discriminants Required

Ensure your discriminant property cannot be undefined:

```typescript
// Problematic: optional discriminant
type Problematic = 
  | { kind?: "a"; value: string }
  | { kind?: "b"; value: number };

// Better: required discriminant
type Better = 
  | { kind: "a"; value: string }
  | { kind: "b"; value: number };
```

### 3. Use Consistent Discriminant Names

Choose a consistent naming convention for discriminants:

```typescript
// Inconsistent (harder to work with)
type Inconsistent = 
  | { kind: "user"; name: string }
  | { type: "post"; content: string };

// Consistent (easier to work with)
type Consistent = 
  | { kind: "user"; name: string }
  | { kind: "post"; content: string };
```

## Real-World Application: Form Validation

Let's look at a practical example where discriminated unions shine - form validation:

```typescript
// Different field types with type-specific validation
type TextField = {
  type: "text";
  value: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
};

type NumberField = {
  type: "number";
  value: number;
  required: boolean;
  min?: number;
  max?: number;
};

type EmailField = {
  type: "email";
  value: string;
  required: boolean;
};

// The discriminated union
type FormField = TextField | NumberField | EmailField;

// Validation function
function validateField(field: FormField): string[] {
  const errors: string[] = [];
  
  // Common validation
  if (field.required) {
    if (
      (typeof field.value === "string" && field.value.trim() === "") ||
      field.value === undefined
    ) {
      errors.push("This field is required");
    }
  }
  
  // Type-specific validation
  switch (field.type) {
    case "text":
      if (field.minLength && field.value.length < field.minLength) {
        errors.push(`Must be at least ${field.minLength} characters`);
      }
      if (field.maxLength && field.value.length > field.maxLength) {
        errors.push(`Must be at most ${field.maxLength} characters`);
      }
      break;
      
    case "number":
      if (field.min !== undefined && field.value < field.min) {
        errors.push(`Must be at least ${field.min}`);
      }
      if (field.max !== undefined && field.value > field.max) {
        errors.push(`Must be at most ${field.max}`);
      }
      break;
      
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        errors.push("Must be a valid email address");
      }
      break;
  }
  
  return errors;
}

// Example usage
const usernameField: FormField = {
  type: "text",
  value: "a",
  required: true,
  minLength: 3,
  maxLength: 20
};

console.log(validateField(usernameField)); 
// ["Must be at least 3 characters"]
```

## Conclusion

Discriminated unions in TypeScript provide a powerful way to model complex data structures with type safety. They enable:

1. Precise type narrowing based on a discriminant property
2. Compile-time exhaustiveness checking
3. Clear and maintainable code with explicit state handling
4. Modeling hierarchical and nested type relationships

By leveraging discriminated unions, you can write more robust TypeScript code that captures the full range of possible states and variations in your data models. This leads to fewer runtime errors and more self-documenting code, especially when dealing with complex state management, API responses, or any scenario where data can take multiple distinct forms.

I hope this explanation from first principles has helped you understand discriminated unions in TypeScript. They're a fundamental tool in the TypeScript developer's toolkit for creating safe, expressive, and maintainable code.