# Advanced Utility Type Creation: From JavaScript Foundations to Domain-Specific Type Transformations

## The JavaScript Foundation: Understanding Transformations

Before diving into TypeScript's type system, let's understand what we're actually trying to achieve. In JavaScript, we constantly transform data structures:

```javascript
// JavaScript: Transforming objects
const user = { id: 1, name: "Alice", email: "alice@example.com" };

// Making all properties optional for updates
const userUpdate = { name: "Alice Smith" }; // Only some fields

// Creating read-only versions
const frozenUser = Object.freeze({ ...user });

// Extracting specific properties
const userSummary = { id: user.id, name: user.name };
```

 **The core problem** : In JavaScript, these transformations happen at runtime with no guarantees about structure or correctness. TypeScript's utility types let us describe and enforce these transformations at the type level.

## Building Blocks: From Basic Types to Generics

### Basic Type Annotations

```typescript
// JavaScript
function updateUser(user, changes) {
  return { ...user, ...changes };
}

// TypeScript - Basic approach
interface User {
  id: number;
  name: string;
  email: string;
}

function updateUserBasic(user: User, changes: User): User {
  return { ...user, ...changes };
}
```

 **Problem with basic approach** : We're forced to provide ALL properties in `changes`, even if we only want to update one field.

### Enter Generics: The Foundation of Utility Types

```typescript
// Generic function - works with any type T
function identity<T>(value: T): T {
  return value;
}

// TypeScript infers the type
const numberResult = identity(42);        // T = number
const stringResult = identity("hello");   // T = string
```

> **Key Mental Model** : Generics are like functions for types. Just as functions take values and return values, generics take types and return types.

## Built-in Utility Types: Learning the Patterns

Before creating custom utilities, let's understand how TypeScript's built-in ones work:

### Partial`<T>` - Making Properties Optional

```typescript
// How Partial works internally
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// Usage comparison
interface User {
  id: number;
  name: string;
  email: string;
}

// Without Partial - compile error!
const update1: User = { name: "Alice" }; 
// ❌ Error: Property 'id' is missing

// With Partial - works!
const update2: Partial<User> = { name: "Alice" }; 
// ✅ All properties become optional
```

### The Mapped Type Pattern

```typescript
// The fundamental pattern behind utility types
type MappedType<T> = {
  [K in keyof T]: SomeTransformation<T[K]>
};
```

> **Mapped Types Rule** : The `[K in keyof T]` syntax iterates over each property key K in type T, allowing us to transform both the key and its associated type.

## Creating Custom Utility Types

### Level 1: Simple Transformations

```typescript
// Make all properties strings (for form inputs)
type Stringify<T> = {
  [K in keyof T]: string;
};

interface User {
  id: number;
  name: string;
  age: number;
}

type UserForm = Stringify<User>;
// Result: { id: string; name: string; age: string; }

// Usage in React forms
const handleFormData = (data: UserForm) => {
  // All values are guaranteed to be strings
  console.log(data.id.length); // ✅ Safe - id is string
};
```

### Level 2: Conditional Transformations

```typescript
// Only make certain types optional
type OptionalOf<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface User {
  id: number;      // Required
  name: string;    // Required  
  email?: string;  // Already optional
  avatar?: string; // Already optional
}

// Make only 'email' and 'avatar' optional for creation
type CreateUser = OptionalOf<User, 'email' | 'avatar'>;
// Result: { id: number; name: string; email?: string; avatar?: string; }
```

### ASCII Diagram: Type Transformation Flow

```
Original Type T
      ↓
[K in keyof T] (iteration)
      ↓
Transform Key K → K' 
Transform Type T[K] → T'[K']
      ↓
New Type { [K']: T'[K'] }
```

## Advanced Patterns: Domain-Specific Utilities

### Pattern 1: API Response Transformations

```typescript
// Transform API responses to include loading states
type WithLoading<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// Transform nested objects recursively
type DeepWithLoading<T> = {
  [K in keyof T]: T[K] extends object 
    ? WithLoading<DeepWithLoading<T[K]>>
    : WithLoading<T[K]>;
};

interface UserProfile {
  user: User;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

type UserProfileState = DeepWithLoading<UserProfile>;
// Creates nested loading states for each object level
```

### Pattern 2: Database Model Transformations

```typescript
// Transform models for different contexts
type DatabaseModel<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

type CreateModel<T> = Omit<DatabaseModel<T>, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateModel<T> = Partial<CreateModel<T>> & { id: string };

// Usage
interface BlogPost {
  title: string;
  content: string;
  authorId: string;
}

type BlogPostDB = DatabaseModel<BlogPost>;
// { title: string; content: string; authorId: string; id: string; createdAt: Date; updatedAt: Date; }

type CreateBlogPost = CreateModel<BlogPost>;
// { title: string; content: string; authorId: string; }

type UpdateBlogPost = UpdateModel<BlogPost>;
// { title?: string; content?: string; authorId?: string; id: string; }
```

### Pattern 3: Event System Types

```typescript
// Create type-safe event systems
type EventMap = {
  'user:login': { userId: string; timestamp: Date };
  'user:logout': { userId: string };
  'post:created': { postId: string; authorId: string };
};

// Extract event names
type EventNames = keyof EventMap;

// Create listener type
type EventListener<T extends EventNames> = (data: EventMap[T]) => void;

// Create emit function type
type EventEmitter = {
  [K in EventNames as `on${Capitalize<K>}`]: (listener: EventListener<K>) => void;
} & {
  [K in EventNames as `emit${Capitalize<K>}`]: (data: EventMap[K]) => void;
};

// Results in:
// {
//   onUserLogin: (listener: (data: { userId: string; timestamp: Date }) => void) => void;
//   onUserLogout: (listener: (data: { userId: string }) => void) => void;
//   onPostCreated: (listener: (data: { postId: string; authorId: string }) => void) => void;
//   emitUserLogin: (data: { userId: string; timestamp: Date }) => void;
//   emitUserLogout: (data: { userId: string }) => void;
//   emitPostCreated: (data: { postId: string; authorId: string }) => void;
// }
```

## Advanced Conditional Types

### Template Literal Types for Domain Logic

```typescript
// Create route parameter extraction
type ExtractRouteParams<T extends string> = 
  T extends `${infer Start}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
    : T extends `${infer Start}:${infer Param}`
    ? { [K in Param]: string }
    : {};

type UserRoute = ExtractRouteParams<'/users/:userId/posts/:postId'>;
// Result: { userId: string; postId: string; }

// Usage in route handlers
const handleUserPost = (params: UserRoute) => {
  console.log(params.userId);  // ✅ Type-safe
  console.log(params.postId);  // ✅ Type-safe
  console.log(params.invalid); // ❌ Compile error
};
```

### Recursive Type Processing

```typescript
// Deep transformation with type checking
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

interface NestedData {
  user: {
    profile: {
      name: string;
      settings: {
        theme: string;
      };
    };
  };
  posts: Array<{
    title: string;
    tags: string[];
  }>;
}

type ImmutableData = DeepReadonly<NestedData>;
// Every property at every level becomes readonly
```

## Real-World Example: Form Validation System

```typescript
// Define validation rules
type ValidationRule<T> = {
  required?: boolean;
  min?: T extends string ? number : T extends number ? number : never;
  max?: T extends string ? number : T extends number ? number : never;
  pattern?: T extends string ? RegExp : never;
};

// Create validation schema type
type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

// Create form state with validation
type FormState<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
};

// Usage
interface UserRegistration {
  email: string;
  password: string;
  age: number;
}

const userValidation: ValidationSchema<UserRegistration> = {
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, min: 8 },
  age: { required: true, min: 18, max: 120 }
};

type UserFormState = FormState<UserRegistration>;
```

> **Best Practice** : When creating domain-specific utilities, start with the end-user API you want, then work backwards to implement the types that enable that API.

## Key Principles for Utility Type Creation

> **Composability** : Build small, focused utilities that can be combined rather than monolithic types.

> **Type Safety** : Use conditional types and `extends` constraints to ensure your utilities only work with appropriate input types.

> **Inference-Friendly** : Design your utilities to work well with TypeScript's type inference so users don't need to provide explicit type arguments.

> **Documentation** : Complex utility types should be well-documented with examples, as their purpose isn't always obvious from the implementation.

## Common Gotchas and Solutions

 **Gotcha 1** : Infinite recursion in recursive types

```typescript
// ❌ This can cause infinite recursion
type DeepOptional<T> = {
  [K in keyof T]?: DeepOptional<T[K]>;
};

// ✅ Add depth limit or base case
type DeepOptional<T, Depth extends number = 3> = 
  Depth extends 0 
    ? T
    : {
        [K in keyof T]?: T[K] extends object 
          ? DeepOptional<T[K], Prev<Depth>>
          : T[K];
      };
```

 **Gotcha 2** : Losing type information with `any`

```typescript
// ❌ Loses all type safety
type Transform<T> = { [K in keyof T]: any };

// ✅ Preserve relationships
type Transform<T> = { [K in keyof T]: Transformed<T[K]> };
```

This foundation in utility type creation enables you to build powerful, reusable type transformations that make your TypeScript code more expressive, safer, and more maintainable. The key is understanding that types are data that can be manipulated, transformed, and computed just like runtime values.
