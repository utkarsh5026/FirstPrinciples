# TypeScript Mapped Types and Transformations: From First Principles

Let's explore TypeScript's mapped types and transformations by starting with the absolute fundamentals and building our understanding layer by layer.

## 1. What Are Types in TypeScript?

At the most basic level, types in TypeScript are ways to describe the shape and behavior of values in your code. They help catch errors during development rather than at runtime.

A simple type might look like:

```typescript
type Person = {
  name: string;
  age: number;
};

// Now we can use this type
const alice: Person = {
  name: "Alice",
  age: 30
};
```

This basic example shows how we define what a `Person` object should look like. But what if we need to create many similar but slightly different types? This is where mapped types come in.

## 2. The Concept of Mapping

Before diving into TypeScript's mapped types, let's understand the concept of mapping in general.

Mapping is a function that takes each element from one set and produces a corresponding element in another set. In programming, we often map arrays:

```typescript
// Regular array mapping
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2); // [2, 4, 6]
```

TypeScript's mapped types apply this same concept, but at the type level. Instead of transforming values, we transform types.

## 3. Mapped Types: The Basics

A mapped type in TypeScript allows you to create a new type by transforming each property in an existing type.

The syntax uses indexed access types with the `in` keyword:

```typescript
type MappedType<T> = {
  [K in keyof T]: T[K]
};
```

Let's break this down:

* `[K in keyof T]`: Iterates over each property key (`K`) in type `T`
* `T[K]`: Represents the type of the property at key `K`

### Example: Creating a Read-Only Version

One common use case is to make all properties in a type read-only:

```typescript
type Person = {
  name: string;
  age: number;
};

type ReadonlyPerson = {
  readonly [K in keyof Person]: Person[K]
};

// This works fine
const john: Person = { name: "John", age: 25 };
john.age = 26; // OK

// But with ReadonlyPerson...
const mary: ReadonlyPerson = { name: "Mary", age: 28 };
mary.age = 29; // Error: Cannot assign to 'age' because it is a read-only property
```

In this example, we mapped over each property in `Person` and added the `readonly` modifier to each one.

## 4. Built-in Mapped Types

TypeScript provides several built-in mapped types that are incredibly useful:

### `Readonly<T>`

Makes all properties in `T` read-only:

```typescript
type Person = {
  name: string;
  age: number;
};

// Instead of defining ReadonlyPerson manually, we can use:
type ReadonlyPerson = Readonly<Person>;

// This is equivalent to:
// type ReadonlyPerson = {
//   readonly name: string;
//   readonly age: number;
// };

const jane: ReadonlyPerson = { name: "Jane", age: 32 };
jane.age = 33; // Error: Cannot assign to 'age' because it is a read-only property
```

### `Partial<T>`

Makes all properties in `T` optional:

```typescript
type Person = {
  name: string;
  age: number;
  address: string;
};

type PartialPerson = Partial<Person>;

// This is equivalent to:
// type PartialPerson = {
//   name?: string;
//   age?: number;
//   address?: string;
// };

// Now we can create a person with only some fields
const bob: PartialPerson = {
  name: "Bob"
  // No age or address required!
};
```

This is especially useful for update operations, where you might only want to change some properties.

### `Required<T>`

Makes all optional properties in `T` required:

```typescript
type ContactInfo = {
  email?: string;
  phone?: string;
  address?: string;
};

type RequiredContactInfo = Required<ContactInfo>;

// This is equivalent to:
// type RequiredContactInfo = {
//   email: string;
//   phone: string;
//   address: string;
// };

// This would error - all fields are now required
const partialContact: RequiredContactInfo = {
  email: "example@example.com"
  // Error: missing phone and address
};
```

### `Pick<T, K>`

Creates a type with only the specified properties from `T`:

```typescript
type Person = {
  name: string;
  age: number;
  address: string;
  email: string;
};

type NameAndAge = Pick<Person, "name" | "age">;

// This is equivalent to:
// type NameAndAge = {
//   name: string;
//   age: number;
// };

const nameAndAgeOnly: NameAndAge = {
  name: "Alice",
  age: 30
  // address and email are not allowed here
};
```

### `Omit<T, K>`

Creates a type by omitting the specified properties from `T`:

```typescript
type Person = {
  name: string;
  age: number;
  ssn: string; // Social Security Number - sensitive!
};

type SafePerson = Omit<Person, "ssn">;

// This is equivalent to:
// type SafePerson = {
//   name: string;
//   age: number;
// };

const publicProfile: SafePerson = {
  name: "Dave",
  age: 45
  // No ssn field
};
```

## 5. Creating Custom Mapped Types

Now that we understand the built-in mapped types, let's explore how to create our own.

### Example: Making All Properties Nullable

Let's create a type that makes all properties nullable (can be their original type or `null`):

```typescript
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type Person = {
  name: string;
  age: number;
};

type NullablePerson = Nullable<Person>;

// This is equivalent to:
// type NullablePerson = {
//   name: string | null;
//   age: number | null;
// };

const personWithNulls: NullablePerson = {
  name: "Charlie",
  age: null // Now this is valid
};
```

### Example: Prefixing Property Names

We can also transform the property names themselves:

```typescript
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${string & K}`]: T[K];
};

type Person = {
  name: string;
  age: number;
};

type PrefixedPerson = Prefixed<Person, "user">;

// This is equivalent to:
// type PrefixedPerson = {
//   userName: string;
//   userAge: number;
// };

const prefixedUser: PrefixedPerson = {
  userName: "Emily",
  userAge: 29
};
```

Notice the `as` keyword - this allows us to transform the property keys as we map over them.

## 6. Property Modifiers

TypeScript's mapped types can add or remove property modifiers like `readonly` and `?` (optional).

### Adding Modifiers

```typescript
type Person = {
  name: string;
  age: number;
};

type ReadonlyOptionalPerson = {
  readonly [K in keyof Person]?: Person[K];
};

// This is equivalent to:
// type ReadonlyOptionalPerson = {
//   readonly name?: string;
//   readonly age?: number;
// };

const optionalReadonlyPerson: ReadonlyOptionalPerson = {
  name: "Frank"
  // age is optional
};

// Cannot modify properties
optionalReadonlyPerson.name = "Francis"; // Error: Cannot assign to 'name' because it is a read-only property
```

### Removing Modifiers

You can remove modifiers by prefixing them with `-`:

```typescript
type OptionalPerson = {
  name?: string;
  age?: number;
};

type RequiredPerson = {
  [K in keyof OptionalPerson]-?: OptionalPerson[K];
};

// This is equivalent to:
// type RequiredPerson = {
//   name: string;
//   age: number;
// };

// Error: missing 'age' property
const missingAgePerson: RequiredPerson = {
  name: "Grace"
};
```

## 7. Key Remapping with `as`

TypeScript 4.1 introduced the ability to remap keys in mapped types using the `as` clause:

```typescript
type GettersAndSetters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type Person = {
  name: string;
  age: number;
};

type PersonAccessors = GettersAndSetters<Person>;

// This is equivalent to:
// type PersonAccessors = {
//   getName: () => string;
//   getAge: () => number;
//   setName: (value: string) => void;
//   setAge: (value: number) => void;
// };
```

In this example, for each property `K` in `T`, we create two new properties:

1. A getter property named `get${Capitalize<K>}`
2. A setter property named `set${Capitalize<K>}`

Let's create a simple class that implements this type:

```typescript
class PersonClass implements PersonAccessors {
  private _name: string;
  private _age: number;

  constructor(name: string, age: number) {
    this._name = name;
    this._age = age;
  }

  getName() {
    return this._name;
  }

  getAge() {
    return this._age;
  }

  setName(value: string) {
    this._name = value;
  }

  setAge(value: number) {
    this._age = value;
  }
}

const person = new PersonClass("Hannah", 35);
console.log(person.getName()); // "Hannah"
person.setAge(36);
console.log(person.getAge()); // 36
```

### Filtering Properties with `as`

We can use the `as` clause to filter out properties that don't meet certain conditions:

```typescript
type OnlyStringProperties<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type Mixed = {
  name: string;
  age: number;
  address: string;
};

type OnlyStrings = OnlyStringProperties<Mixed>;

// This is equivalent to:
// type OnlyStrings = {
//   name: string;
//   address: string;
// };
```

In this example, we use a conditional type with the `as` clause. If the property type `T[K]` extends `string`, we keep the key; otherwise, we use `never`, which filters out the property.

## 8. Advanced Transformations

Let's see some more advanced examples that combine these techniques.

### Example: Creating a Type for Form Validation Errors

```typescript
type FormFields = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ValidationErrors<T> = {
  [K in keyof T as `${string & K}Error`]?: string;
};

type FormErrors = ValidationErrors<FormFields>;

// This is equivalent to:
// type FormErrors = {
//   usernameError?: string;
//   emailError?: string;
//   passwordError?: string;
//   confirmPasswordError?: string;
// };

// Usage example:
const formWithErrors: FormFields & FormErrors = {
  username: "user123",
  email: "invalid-email",
  password: "pass",
  confirmPassword: "password",
  emailError: "Please enter a valid email address",
  passwordError: "Password must be at least 8 characters",
  confirmPasswordError: "Passwords do not match"
};
```

This gives us a type where each field in our form can have a corresponding error message.

### Example: Computed Property Types

We can compute property types based on the key:

```typescript
type ApiResponse<T> = {
  [K in keyof T as `${string & K}Response`]: {
    data: T[K];
    loading: boolean;
    error?: string;
  };
};

type UserData = {
  profile: { name: string; bio: string };
  posts: Array<{ title: string; content: string }>;
};

type UserApiState = ApiResponse<UserData>;

// This is equivalent to:
// type UserApiState = {
//   profileResponse: {
//     data: { name: string; bio: string };
//     loading: boolean;
//     error?: string;
//   };
//   postsResponse: {
//     data: Array<{ title: string; content: string }>;
//     loading: boolean;
//     error?: string;
//   };
// };

// Usage in a React-like context:
const apiState: UserApiState = {
  profileResponse: {
    data: { name: "Ian", bio: "Software developer" },
    loading: false
  },
  postsResponse: {
    data: [{ title: "TypeScript Tips", content: "..." }],
    loading: true
  }
};
```

This pattern is particularly useful for organizing API state in front-end applications.

## 9. Practical Use Cases

Let's explore some real-world practical examples where mapped types shine.

### Example: Type-Safe Event Handlers

```typescript
type Events = {
  click: { x: number; y: number };
  focus: undefined;
  input: { value: string };
};

type EventHandlers = {
  [E in keyof Events as `on${Capitalize<string & E>}`]: (event: Events[E]) => void;
};

// This results in:
// type EventHandlers = {
//   onClick: (event: { x: number; y: number }) => void;
//   onFocus: (event: undefined) => void;
//   onInput: (event: { value: string }) => void;
// };

// Usage example in a component:
function MyComponent(props: EventHandlers) {
  return (
    <div
      onClick={(e) => props.onClick({ x: e.clientX, y: e.clientY })}
      onFocus={() => props.onFocus(undefined)}
      onInput={(e) => props.onInput({ value: e.target.value })}
    />
  );
}
```

### Example: Creating a Proxy Type

```typescript
type ProxyMethods<T> = {
  [K in keyof T as T[K] extends Function ? K : never]: T[K];
};

class Database {
  connect() { /* ... */ }
  query(sql: string) { /* ... */ }
  private authenticate() { /* ... */ }
  close() { /* ... */ }
}

type DatabaseProxy = ProxyMethods<Database>;

// This is roughly equivalent to:
// type DatabaseProxy = {
//   connect: () => void;
//   query: (sql: string) => void;
//   close: () => void;
// };
// Note: The 'authenticate' method is private, so it's not included
// in the type via 'keyof Database'

function createDatabaseProxy(db: Database): DatabaseProxy {
  return {
    connect: () => {
      console.log("Proxying connect method");
      return db.connect();
    },
    query: (sql: string) => {
      console.log(`Proxying query method with SQL: ${sql}`);
      return db.query(sql);
    },
    close: () => {
      console.log("Proxying close method");
      return db.close();
    }
  };
}
```

This creates a type-safe proxy that only includes the public methods from the original class.

## 10. TypeScript Template Literal Types

TypeScript 4.1 introduced template literal types, which work beautifully with mapped types to create powerful type transformations.

```typescript
type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Lowercase<T>
    ? `${T}${CamelToSnake<U>}`
    : `_${Lowercase<T>}${CamelToSnake<U>}`
  : "";

type SnakeCaseKeys<T> = {
  [K in keyof T as CamelToSnake<string & K>]: T[K];
};

type User = {
  userId: number;
  userName: string;
  userEmail: string;
};

type SnakeUser = SnakeCaseKeys<User>;

// This is equivalent to:
// type SnakeUser = {
//   user_id: number;
//   user_name: string;
//   user_email: string;
// };
```

This transforms camelCase property names to snake_case, which is useful when working with APIs that use different naming conventions.

## 11. Understanding the Implementation of Built-in Mapped Types

To deepen our understanding, let's look at how TypeScript implements its built-in mapped types:

```typescript
// How Partial<T> is implemented
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// How Required<T> is implemented
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};

// How Readonly<T> is implemented
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// How Pick<T, K> is implemented
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// How Record<K, T> is implemented
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

// How Exclude<T, U> is implemented (not a mapped type, but often used with them)
type MyExclude<T, U> = T extends U ? never : T;

// How Extract<T, U> is implemented (not a mapped type, but often used with them)
type MyExtract<T, U> = T extends U ? T : never;

// How Omit<T, K> is implemented (uses Exclude)
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

By understanding these implementations, you can see how TypeScript's type system combines these basic building blocks to create powerful type transformations.

## 12. Performance Considerations

When using mapped types, keep in mind that complex type transformations can impact TypeScript's performance, especially in large projects:

1. Deeply nested mapped types can slow down the type checker
2. Recursive type transformations might hit TypeScript's recursion limits
3. Using multiple transformations in sequence can be less performant than a single transformation

For large projects, consider splitting complex types into simpler, reusable parts, and possibly using interface merging instead of deep mapped types.

## 13. Putting It All Together: A Complete Example

Let's create a small library for handling API requests that uses many of the concepts we've covered:

```typescript
// Define our API endpoints and their request/response types
type ApiEndpoints = {
  getUser: {
    request: { userId: number };
    response: { name: string; email: string };
  };
  updateProfile: {
    request: { userId: number; bio?: string; avatar?: string };
    response: { success: boolean };
  };
  listPosts: {
    request: { page: number; limit: number };
    response: Array<{ id: number; title: string }>;
  };
};

// Create types for API request functions
type ApiRequestFunctions = {
  [E in keyof ApiEndpoints as `${string & E}Request`]: (
    params: ApiEndpoints[E]["request"]
  ) => Promise<ApiEndpoints[E]["response"]>;
};

// Create types for loading states
type ApiLoadingStates = {
  [E in keyof ApiEndpoints as `${string & E}Loading`]: boolean;
};

// Create types for error states
type ApiErrorStates = {
  [E in keyof ApiEndpoints as `${string & E}Error`]: string | null;
};

// Create a complete API state type
type ApiState = {
  [E in keyof ApiEndpoints as `${string & E}Data`]?: ApiEndpoints[E]["response"];
} & ApiLoadingStates & ApiErrorStates;

// Create a class that implements this API
class ApiClient implements ApiRequestFunctions {
  // Initial state
  state: ApiState = {
    getUserLoading: false,
    updateProfileLoading: false,
    listPostsLoading: false,
    getUserError: null,
    updateProfileError: null,
    listPostsError: null
  };

  // Implement request functions
  getUserRequest(params: ApiEndpoints["getUser"]["request"]) {
    this.state.getUserLoading = true;
  
    return fetch(`/api/users/${params.userId}`)
      .then(response => response.json())
      .then(data => {
        this.state.getUserData = data;
        return data;
      })
      .catch(error => {
        this.state.getUserError = error.message;
        throw error;
      })
      .finally(() => {
        this.state.getUserLoading = false;
      });
  }

  updateProfileRequest(params: ApiEndpoints["updateProfile"]["request"]) {
    this.state.updateProfileLoading = true;
  
    return fetch(`/api/users/${params.userId}`, {
      method: 'PUT',
      body: JSON.stringify(params)
    })
      .then(response => response.json())
      .then(data => {
        this.state.updateProfileData = data;
        return data;
      })
      .catch(error => {
        this.state.updateProfileError = error.message;
        throw error;
      })
      .finally(() => {
        this.state.updateProfileLoading = false;
      });
  }

  listPostsRequest(params: ApiEndpoints["listPosts"]["request"]) {
    this.state.listPostsLoading = true;
  
    return fetch(`/api/posts?page=${params.page}&limit=${params.limit}`)
      .then(response => response.json())
      .then(data => {
        this.state.listPostsData = data;
        return data;
      })
      .catch(error => {
        this.state.listPostsError = error.message;
        throw error;
      })
      .finally(() => {
        this.state.listPostsLoading = false;
      });
  }
}

// Usage example
const api = new ApiClient();

async function loadUserData() {
  try {
    const user = await api.getUserRequest({ userId: 123 });
    console.log(`Loaded user ${user.name}`);
  
    // Type safety ensures we access properties correctly
    console.log(user.email); // OK
    console.log(user.avatar); // Error: Property 'avatar' does not exist
  
    // We can check loading state 
    if (api.state.updateProfileLoading) {
      console.log("Profile update in progress...");
    }
  
    // We can check for errors
    if (api.state.listPostsError) {
      console.log(`Error loading posts: ${api.state.listPostsError}`);
    }
  } catch (error) {
    console.error("Failed to load user data");
  }
}
```

This example demonstrates how mapped types enable you to maintain type safety throughout your application while avoiding repetitive type declarations.

## Summary

We've covered TypeScript's mapped types and transformations from first principles:

1. We started by understanding types and the concept of mapping
2. We explored how mapped types transform each property in an existing type
3. We looked at built-in mapped types like `Readonly<T>`, `Partial<T>`, `Required<T>`, `Pick<T, K>`, and `Omit<T, K>`
4. We created custom mapped types for various scenarios
5. We learned about property modifiers like `readonly` and `?` and how to add or remove them
6. We explored key remapping with the `as` clause
7. We saw how to filter properties using conditional types
8. We looked at advanced transformations with template literal types
9. We examined real-world use cases for mapped types
10. We explored the implementation of built-in mapped types
11. We considered performance implications
12. We built a complete example showing mapped types in action

Mapped types are one of TypeScript's most powerful features, allowing you to express complex type relationships while keeping your code DRY (Don't Repeat Yourself). By understanding these principles, you'll be able to write more maintainable, type-safe code.
