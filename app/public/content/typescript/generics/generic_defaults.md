# Generic Defaults in TypeScript: A Comprehensive Guide

Generic defaults in TypeScript are a powerful but often overlooked feature that can significantly improve your code's flexibility and usability. Let's explore this concept in depth, starting from the fundamentals and gradually moving to more advanced applications.

## The Basic Concept of Generic Defaults

When you define a generic type parameter, you can provide a default type that will be used if no explicit type argument is provided. This works similarly to default function parameters in JavaScript.

Here's the basic syntax:

```typescript
function createContainer<T = string>(value: T) {
  return { value };
}
```

In this example, `T = string` means that if no type is explicitly provided when calling the function, TypeScript will use `string` as the default type for `T`.

## Why Generic Defaults Matter

Generic defaults solve several key problems:

1. **Reducing Verbosity**: They eliminate the need to specify common types repeatedly.
2. **Backward Compatibility**: They allow you to add new type parameters without breaking existing code.
3. **Improved Developer Experience**: They provide sensible defaults for common use cases while preserving flexibility.
4. **Progressive Type Complexity**: They let you start simple and add type complexity as needed.

Let's see how these benefits play out in practice.

## Basic Usage Examples

### Example 1: Simple Container Function

```typescript
function makeBox<T = string>(value: T) {
  return { value };
}

// Using default type (string)
const box1 = makeBox("hello");
// box1.value is inferred as string

// Explicitly overriding the default
const box2 = makeBox<number>(42);
// box2.value is inferred as number

// Type inference without default specification
const box3 = makeBox(true);
// box3.value is inferred as boolean
```

Notice how in `box1`, we didn't have to explicitly write `makeBox<string>("hello")`. The default handled it for us.

### Example 2: Generic Class with Default

```typescript
class Repository<T = Record<string, any>> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  getAll(): T[] {
    return [...this.items];
  }
}

// Using the default type
const generalRepo = new Repository();
generalRepo.add({ id: 1, name: "Item 1" });
generalRepo.add({ id: 2, description: "Something else" });

// Explicitly specifying a type
interface User {
  id: number;
  name: string;
  email: string;
}

const userRepo = new Repository<User>();
userRepo.add({ id: 1, name: "John", email: "john@example.com" });
// This would cause a type error:
// userRepo.add({ id: 2, name: "Jane" });
```

In this example, the `Repository` class defaults to storing records with string keys and any values if no specific type is provided.

## Multiple Generic Parameters with Defaults

You can have multiple generic parameters, and any of them can have defaults:

```typescript
function createPair<First = string, Second = number>(first: First, second: Second) {
  return [first, second] as const;
}

// Using all defaults
const pair1 = createPair("hello", 42);
// pair1 is inferred as readonly [string, number]

// Overriding only the first type parameter
const pair2 = createPair<boolean>(true, 42);
// pair2 is inferred as readonly [boolean, number]

// Overriding only the second type parameter
const pair3 = createPair<string, string>("hello", "world");
// pair3 is inferred as readonly [string, string]

// Letting type inference work without defaults
const pair4 = createPair(true, "hello");
// pair4 is inferred as readonly [boolean, string]
```

There's an important subtlety here: If you want to use the default for the first type parameter but specify the second, you need to explicitly include the first parameter:

```typescript
// Correct way to specify only the second parameter
const pair5 = createPair<string, boolean>("hello", true);

// This doesn't work as expected - TypeScript treats boolean as the First type
// const pair6 = createPair<boolean>("hello", true); // Error
```

## Default Generic Constraints

You can combine generic defaults with constraints:

```typescript
interface Identifiable {
  id: string | number;
}

function findById<T extends Identifiable = { id: string }>(
  items: T[],
  id: string | number
): T | undefined {
  return items.find(item => item.id === id);
}

// Using the default type (object with id: string)
const items = [{ id: "1", name: "Item 1" }, { id: "2", name: "Item 2" }];
const item = findById(items, "1");

// Using a custom type that satisfies the constraint
interface User extends Identifiable {
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: "John", email: "john@example.com" },
  { id: 2, name: "Jane", email: "jane@example.com" }
];

const user = findById<User>(users, 1);
```

In this example, `T` must extend `Identifiable`, and if no type is specified, it defaults to `{ id: string }`.

## Advanced Examples and Patterns

### Generic Factory with Default Configuration

```typescript
interface ConfigOptions {
  timeout?: number;
  retries?: number;
  baseUrl?: string;
}

function createApi<Options extends ConfigOptions = { timeout: 3000, retries: 3 }>(
  options?: Partial<Options>
) {
  // Merge defaults with provided options
  const config = {
    timeout: 3000,
    retries: 3,
    baseUrl: 'https://api.example.com',
    ...options
  };
  
  return {
    get: (endpoint: string) => {
      console.log(`GET ${config.baseUrl}/${endpoint} (timeout: ${config.timeout}ms, retries: ${config.retries})`);
      // Implementation details...
      return Promise.resolve({});
    },
    // Other methods...
  };
}

// Using default options
const defaultApi = createApi();
defaultApi.get('users');

// Custom options
const customApi = createApi({
  timeout: 5000,
  baseUrl: 'https://api.custom.com'
});
customApi.get('products');

// With custom type extending the base options
interface AdvancedOptions extends ConfigOptions {
  authentication: 'basic' | 'oauth';
  version: string;
}

const advancedApi = createApi<AdvancedOptions>({
  authentication: 'oauth',
  version: 'v2',
  timeout: 10000
});
```

This pattern is particularly useful for creating configurable services or components where you want to provide sensible defaults but allow for customization.

### State Management with Generic Defaults

Here's a more complex example showing how generic defaults can be used in a state management system:

```typescript
type ActionMap<Payload extends Record<string, any>> = {
  [Key in keyof Payload]: {
    type: Key;
    payload: Payload[Key];
  }
};

// Default state and actions if none provided
interface DefaultState {
  loading: boolean;
  error: string | null;
}

type DefaultPayload = {
  'SET_LOADING': boolean;
  'SET_ERROR': string | null;
  'RESET': undefined;
};

function createReducer
  State = DefaultState,
  Payload extends Record<string, any> = DefaultPayload
>(
  initialState: State,
  handlers: {
    [Key in keyof Payload]?: (state: State, payload: Payload[Key]) => State;
  }
) {
  return (state: State = initialState, action: ActionMap<Payload>[keyof Payload]) => {
    const handler = handlers[action.type as keyof Payload];
    if (handler) {
      return handler(state, action.payload);
    }
    return state;
  };
}

// Using the default state and payload types
const defaultInitialState: DefaultState = {
  loading: false,
  error: null
};

const defaultReducer = createReducer(defaultInitialState, {
  'SET_LOADING': (state, payload) => ({ ...state, loading: payload }),
  'SET_ERROR': (state, payload) => ({ ...state, error: payload }),
  'RESET': (state) => defaultInitialState
});

// Using custom state and payload types
interface UserState {
  user: { id: string; name: string } | null;
  isAuthenticated: boolean;
}

type UserPayload = {
  'LOGIN_SUCCESS': { id: string; name: string };
  'LOGOUT': undefined;
};

const userInitialState: UserState = {
  user: null,
  isAuthenticated: false
};

const userReducer = createReducer<UserState, UserPayload>(userInitialState, {
  'LOGIN_SUCCESS': (state, payload) => ({
    user: payload,
    isAuthenticated: true
  }),
  'LOGOUT': () => userInitialState
});
```

This example demonstrates how generic defaults make a reducer factory flexible enough to work with both default and custom state and action types.

## Generic Interfaces with Defaults

Interfaces can also have default type parameters:

```typescript
interface ResponseData<T = any> {
  data: T;
  status: number;
  message: string;
}

// Using the default
function processResponse(response: ResponseData) {
  console.log(response.status, response.message);
  return response.data;
}

// Using a specific type
interface User {
  id: string;
  name: string;
}

function processUserResponse(response: ResponseData<User>) {
  const user = response.data;
  console.log(`User: ${user.name} (${user.id})`);
  return user;
}
```

## Type Aliases with Default Generics

Type aliases can also use default generic parameters:

```typescript
type Result<T = void, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Using defaults
function doSomething(): Result {
  try {
    // Operation that doesn't return data
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: e as Error };
  }
}

// With specific types
function fetchUser(id: string): Result<User, ApiError> {
  try {
    // Fetch user...
    const user: User = { id, name: 'John' };
    return { success: true, data: user };
  } catch (e) {
    return { success: false, error: new ApiError('Failed to fetch user') };
  }
}

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}
```

## Conditional Types with Default Generics

You can also use default generics with conditional types to create powerful type utilities:

```typescript
type ArrayOrSingle<T, IsArray extends boolean = false> = 
  IsArray extends true ? T[] : T;

function createItem<T, IsArray extends boolean = false>(
  data: T,
  isArray?: IsArray
): ArrayOrSingle<T, IsArray> {
  if (isArray) {
    return [data] as ArrayOrSingle<T, IsArray>;
  }
  return data as ArrayOrSingle<T, IsArray>;
}

// Using default (not an array)
const single = createItem(42);
// Type is number

// Explicitly specifying array
const array = createItem<number, true>(42);
// Type is number[]

// Type inference with boolean literal
const inferred = createItem(42, true);
// Type is number[]
```

## Choosing Good Defaults: Best Practices

When selecting default types for your generics, consider these principles:

1. **Choose the most common use case**: The default should cover the most frequent usage patterns.

2. **Prefer stricter types over `any`**: While `any` is sometimes necessary, more specific types like `unknown`, empty objects (`{}`), or `Record<string, unknown>` are often better defaults.

3. **Be consistent**: Use similar defaults for similar generic parameters across your codebase.

4. **Document your defaults**: Make sure users of your code understand what defaults are being applied.

5. **Consider backward compatibility**: When adding a new generic parameter to existing code, use a default that preserves existing behavior.

Let's see these principles in action:

```typescript
// Good: Specific default for a common use case
function createCollection<T = string>() {
  return new Set<T>();
}

// Better than using 'any'
function parseData<T = unknown>(data: string): T {
  return JSON.parse(data) as T;
}

// Consistent defaults across related functions
function createQueue<T = unknown>() { /* ... */ }
function createStack<T = unknown>() { /* ... */ }
```

## Inferring Generic Parameters with Defaults

TypeScript's inference system works well with generic defaults, but there are some nuances:

```typescript
// A function that returns a typed wrapper around a value
function wrap<T = string>(value: T) {
  return {
    value,
    type: typeof value,
    isDefault: false
  };
}

// Without specifying the type parameter, the default isn't used if the argument's type can be inferred
const wrapped1 = wrap(42);
// wrapped1.value is number, not string

// If we want the default type, but with a different value, we need to explicitly specify it
const wrapped2 = wrap<string>(42 as unknown as string);
// wrapped2.value is string
```

A more practical scenario is when you have optional parameters:

```typescript
function createEmptyArray<T = string>(): T[] {
  return [];
}

// Here the default is used because there's no value to infer from
const arr1 = createEmptyArray();
// arr1 is string[]

// Explicitly override the default
const arr2 = createEmptyArray<number>();
// arr2 is number[]
```

## Limitations and Edge Cases

While generic defaults are powerful, there are some limitations to be aware of:

### 1. No Inference from Default Type Parameters

TypeScript won't infer a type parameter from its default:

```typescript
function getValue<T = string>(): T {
  // Error: Type 'string' is not assignable to type 'T'.
  // 'T' could be instantiated with a different type.
  // return "default value";
  
  // Need to use type assertion
  return "default value" as unknown as T;
}
```

### 2. Ordering Constraints

If you have multiple type parameters, those with defaults must come after those without defaults:

```typescript
// Error: Required type parameters may not follow optional type parameters
// function incorrect<T = string, U>() {}

// Correct ordering
function correct<U, T = string>() {}
```

### 3. Interplay with Explicit Type Arguments

When explicitly providing type arguments, you need to provide them in order:

```typescript
function process<A, B = number, C = string>(a: A, b?: B, c?: C) {
  // Implementation
}

// If you want to specify C but use the default for B:
// This doesn't work:
// process<string, string>("a", undefined, "c");

// You must do this:
process<string, number, string>("a", undefined, "c");
```

## Real-World Application: Generic Component System

Let's look at a more comprehensive example to tie everything together—a generic component system for a UI library:

```typescript
// Base props that all components share
interface BaseProps {
  id?: string;
  className?: string;
  style?: Record<string, string | number>;
}

// Default component state
interface DefaultState {
  isVisible: boolean;
  isDisabled: boolean;
}

// Component class with default props and state
class Component
  Props extends BaseProps = BaseProps,
  State = DefaultState
> {
  props: Props;
  state: State;
  
  constructor(props: Props, initialState: State) {
    this.props = props;
    this.state = initialState;
  }
  
  setState(newState: Partial<State>): void {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  
  render(): void {
    // Simplified rendering logic
    console.log('Rendering component', {
      id: this.props.id,
      className: this.props.className,
      state: this.state
    });
  }
}

// Button component with specific props
interface ButtonProps extends BaseProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

// Button-specific state
interface ButtonState extends DefaultState {
  isPressed: boolean;
}

// Button component implementation
class Button extends Component<ButtonProps, ButtonState> {
  constructor(props: ButtonProps) {
    super(props, {
      isVisible: true,
      isDisabled: false,
      isPressed: false
    });
  }
  
  handleClick(): void {
    if (this.props.onClick && !this.state.isDisabled) {
      this.setState({ isPressed: true });
      this.props.onClick();
      setTimeout(() => this.setState({ isPressed: false }), 200);
    }
  }
}

// Using the generic component directly (with defaults)
const genericComponent = new Component(
  { id: 'generic', className: 'container' },
  { isVisible: true, isDisabled: false }
);

// Using the button component
const button = new Button({
  id: 'submit-button',
  label: 'Submit',
  variant: 'primary',
  onClick: () => console.log('Button clicked')
});

button.handleClick();
```

This example demonstrates how generic defaults can provide a solid foundation for a component system while allowing for specialized implementations.

## Conclusion

Generic defaults in TypeScript are a powerful feature that allows you to create more flexible, usable APIs while maintaining type safety. They reduce verbosity, support backward compatibility, and enhance the developer experience.

Key takeaways:

1. Generic defaults provide fallback types when explicit type arguments aren't provided.
2. They work with functions, classes, interfaces, and type aliases.
3. You can combine them with constraints for even more power.
4. Multiple generic parameters can have defaults, but they must come after non-defaulted parameters.
5. They help balance type safety with developer convenience.

By mastering generic defaults, you can create more elegant and user-friendly TypeScript code that works well in a variety of contexts while still providing strong type guarantees.