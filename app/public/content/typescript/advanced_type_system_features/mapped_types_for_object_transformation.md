# Mapped Types for Object Transformation: From JavaScript Objects to Advanced Type Transformations

Let me walk you through mapped types by starting with the JavaScript foundation and building up to this powerful TypeScript feature.

## JavaScript Foundation: Object Manipulation Patterns

First, let's understand how we typically work with objects in JavaScript:

```javascript
// JavaScript: Creating new objects based on existing ones
const user = {
  name: "Alice",
  age: 30,
  email: "alice@example.com"
};

// Pattern 1: Making all properties optional for updates
const userUpdate = {
  name: user.name,  // might be undefined
  age: user.age,    // might be undefined  
  email: user.email // might be undefined
};

// Pattern 2: Making all properties readonly for immutable views
const readonlyUser = Object.freeze({
  name: user.name,
  age: user.age,
  email: user.email
});

// Pattern 3: Converting all values to strings for serialization
const stringifiedUser = {
  name: String(user.name),
  age: String(user.age),
  email: String(user.email)
};
```

The problem? We're repeating the same transformation pattern manually for every property. JavaScript can't help us ensure we didn't miss a property or apply the transformation consistently.

## TypeScript Basic Object Typing

In TypeScript, we start by defining the shape of our objects:

```typescript
// TypeScript: Define the structure
interface User {
  name: string;
  age: number;
  email: string;
}

const user: User = {
  name: "Alice",
  age: 30,
  email: "alice@example.com"
};
```

But what if we want variations of this type? The naive approach:

```typescript
// ❌ Repetitive and error-prone approach
interface UserUpdate {
  name?: string;    // Manual optional marking
  age?: number;     // Manual optional marking  
  email?: string;   // Manual optional marking
}

interface ReadonlyUser {
  readonly name: string;    // Manual readonly marking
  readonly age: number;     // Manual readonly marking
  readonly email: string;   // Manual readonly marking
}

interface StringifiedUser {
  name: string;    // Manual type conversion
  age: string;     // Manual type conversion
  email: string;   // Manual type conversion
}
```

> **Key Problem** : We're duplicating the structure and manually applying transformations. If we add a new property to `User`, we must remember to update all related interfaces.

## The Mapped Type Solution

Mapped types solve this by letting us **programmatically transform** one type into another:

```typescript
// ✅ Mapped types: Transform existing types automatically
type UserUpdate = {
  [K in keyof User]?: User[K]
  //    ^^^^^^^^^^^^^ Iterate over each property key
  //                 ^ Make each property optional
  //                   ^^^^^^^ Keep the original type
};

type ReadonlyUser = {
  readonly [K in keyof User]: User[K]
  //       ^^^^^^^^^^^^^ Iterate over each property key  
  //                       ^^^^^^^ Keep the original type
};

type StringifiedUser = {
  [K in keyof User]: string
  //    ^^^^^^^^^^^^^ Iterate over each property key
  //                 ^^^^^^ Transform all types to string
};
```

Let's break down the syntax step by step:

## Understanding Mapped Type Syntax

```
[K in keyof SourceType]: TargetType
 │  │  │                 │
 │  │  │                 └── What type each property becomes
 │  │  └── The source type to iterate over  
 │  └── The iteration operator (like for...in)
 └── Variable representing each property key
```

Here's a vertical diagram showing how the transformation works:

```
Original Type: User
┌─────────────────┐
│ name: string    │
│ age: number     │  
│ email: string   │
└─────────────────┘
         │
         ▼ [K in keyof User]?: User[K]
         │
┌─────────────────┐
│ name?: string   │ ← Each property becomes optional
│ age?: number    │ ← Original types preserved  
│ email?: string  │ ← Structure maintained
└─────────────────┘
Result: UserUpdate
```

## Step-by-Step: How the Type System Processes Mapped Types

Let me show you exactly what happens during compilation:

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// Step 1: TypeScript identifies all keys
// keyof User = "name" | "age" | "email"

// Step 2: The mapped type iterates over each key
type UserUpdate = {
  [K in keyof User]?: User[K]
};

// Step 3: TypeScript expands this to:
// K = "name":   name?: User["name"]   →  name?: string
// K = "age":    age?: User["age"]     →  age?: number  
// K = "email":  email?: User["email"] →  email?: string

// Step 4: Final result (conceptually):
type UserUpdate = {
  name?: string;
  age?: number;
  email?: string;
};
```

> **Critical Understanding** : Mapped types are  **compile-time transformations** . The JavaScript runtime never sees the mapping logic—only the final transformed type structure.

## Modifying Property Names and Types

Mapped types can transform both the keys and the values:

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

// Transform property names by adding prefixes
type UserWithPrefix = {
  [K in keyof User as `user_${K}`]: User[K]
  //               ^^ Key remapping using template literals
};
// Result: { user_name: string, user_age: number, user_email: string }

// Transform values while keeping keys
type UserAsStrings = {
  [K in keyof User]: string
};
// Result: { name: string, age: string, email: string }

// Transform both keys and values
type UserMetadata = {
  [K in keyof User as `${K}_meta`]: {
    value: User[K];
    lastUpdated: Date;
  }
};
// Result: { 
//   name_meta: { value: string, lastUpdated: Date },
//   age_meta: { value: number, lastUpdated: Date },
//   email_meta: { value: string, lastUpdated: Date }
// }
```

## Filtering Properties with Conditional Logic

You can conditionally include or exclude properties:

```typescript
interface User {
  name: string;
  age: number;
  email: string;
  isActive: boolean;
}

// Only include string properties
type StringProperties = {
  [K in keyof User as User[K] extends string ? K : never]: User[K]
  //                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Conditional inclusion
};
// Result: { name: string, email: string }

// Exclude boolean properties  
type NonBooleanProperties = {
  [K in keyof User as User[K] extends boolean ? never : K]: User[K]
};
// Result: { name: string, age: number, email: string }

// Make only certain properties optional
type PartiallyOptional = {
  [K in keyof User as K extends 'email' | 'isActive' ? K : never]?: User[K]
} & {
  [K in keyof User as K extends 'email' | 'isActive' ? never : K]: User[K]  
};
// Result: { name: string, age: number, email?: string, isActive?: boolean }
```

## Built-in Utility Types: Mapped Types in Action

TypeScript provides several built-in mapped types. Let's see how they work:

```typescript
// Partial<T> - Makes all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Required<T> - Makes all properties required
type Required<T> = {
  [P in keyof T]-?: T[P];  // -? removes optionality
};

// Readonly<T> - Makes all properties readonly
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Pick<T, K> - Selects specific properties
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit<T, K> - Excludes specific properties  
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
```

Let's see these in practice:

```typescript
interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
}

// Using built-in utility types
type PartialUser = Partial<User>;
// { id?: number, name?: string, email?: string, isActive?: boolean }

type RequiredUser = Required<User>;  
// { id: number, name: string, email: string, isActive: boolean }

type PublicUser = Pick<User, 'name' | 'email'>;
// { name: string, email?: string }

type UserWithoutId = Omit<User, 'id'>;
// { name: string, email?: string, isActive: boolean }
```

## Advanced Pattern: Nested Object Transformation

For deep transformations, you need recursive mapped types:

```typescript
interface NestedUser {
  profile: {
    name: string;
    settings: {
      theme: string;
      notifications: boolean;
    };
  };
  permissions: {
    read: boolean;
    write: boolean;
  };
}

// Deep readonly transformation
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object 
    ? DeepReadonly<T[P]>  // Recursively apply to nested objects
    : T[P];               // Keep primitive types as-is
};

type ReadonlyNestedUser = DeepReadonly<NestedUser>;
// All nested properties become readonly

// Deep partial transformation
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>   // Recursively apply to nested objects
    : T[P];               // Keep primitive types as-is
};

type PartialNestedUser = DeepPartial<NestedUser>;
// All nested properties become optional
```

## Real-World Example: API Response Transformation

Here's how mapped types solve real problems:

```typescript
// API returns this shape
interface APIUser {
  user_id: number;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
}

// We want this shape in our app
interface AppUser {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mapped type to transform API keys to app keys
type APIToApp<T> = {
  [K in keyof T as 
    K extends 'user_id' ? 'id' :
    K extends 'user_name' ? 'name' :
    K extends 'user_email' ? 'email' :
    K extends 'created_at' ? 'createdAt' :
    K extends 'updated_at' ? 'updatedAt' :
    never
  ]: K extends 'created_at' | 'updated_at' 
    ? Date    // Transform string dates to Date objects
    : T[K];   // Keep other types unchanged
};

type TransformedUser = APIToApp<APIUser>;
// Result: { id: number, name: string, email: string, createdAt: Date, updatedAt: Date }

// Runtime transformation function with type safety
function transformUser(apiUser: APIUser): TransformedUser {
  return {
    id: apiUser.user_id,
    name: apiUser.user_name,
    email: apiUser.user_email,
    createdAt: new Date(apiUser.created_at),
    updatedAt: new Date(apiUser.updated_at)
  };
}
```

## Common Gotchas and Best Practices

> **Gotcha 1** : Mapped types only work with object types, not primitive types or functions.

```typescript
// ❌ This won't work
type StringToNumber = {
  [K in keyof string]: number;  // Error: string is not an object type
};

// ✅ This works
type ObjectToNumber<T> = {
  [K in keyof T]: number;
};
```

> **Gotcha 2** : Mapped types create new types; they don't modify existing ones.

```typescript
interface User {
  name: string;
  age: number;
}

type PartialUser = Partial<User>;  // Creates a new type

// User is still { name: string, age: number }
// PartialUser is { name?: string, age?: number }
```

> **Best Practice** : Use descriptive names for mapped type variables.

```typescript
// ❌ Unclear
type Transform<T> = {
  [K in keyof T]: string;
};

// ✅ Clear intent
type ConvertToStrings<T> = {
  [PropertyKey in keyof T]: string;
};
```

> **Best Practice** : Combine mapped types with conditional types for powerful transformations.

```typescript
// Extract only function properties
type FunctionProperties<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K]
};

// Extract only non-function properties
type DataProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
};
```

## Performance Considerations

> **Important** : Complex mapped types can slow compilation. For deeply nested or recursive types, consider:

```typescript
// ❌ Can be slow for large objects
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ✅ Add depth limits for performance
type DeepReadonly<T, Depth extends ReadonlyArray<number> = []> = {
  readonly [P in keyof T]: Depth['length'] extends 10 
    ? T[P]  // Stop recursion at depth 10
    : T[P] extends object 
      ? DeepReadonly<T[P], [...Depth, 1]>
      : T[P];
};
```

Mapped types are one of TypeScript's most powerful features for creating reusable, type-safe transformations. They let you encode common object manipulation patterns directly in the type system, ensuring consistency and catching errors at compile time rather than runtime.
