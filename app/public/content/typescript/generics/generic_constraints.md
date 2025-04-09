# TypeScript Generic Constraints and Defaults: From First Principles

When we craft type-safe code in TypeScript, generics are one of our most powerful tools. They allow us to create reusable components that work with a variety of types while maintaining type safety. But sometimes we need to be more specific about what types can be used, or provide sensible defaults when no type is specified. This is where generic constraints and defaults come into play.

## Understanding Generic Types: The Foundation

Before diving into constraints and defaults, let's establish what generics are from first principles.

At its core, a generic is a type parameter—a placeholder for a type that will be provided later. They allow us to write functions and classes that can work with many different types while still providing type safety.

Consider this simple generic function:

```typescript
function identity<T>(value: T): T {
  return value;
}
```

Here `T` is a type parameter. When someone calls this function, TypeScript will infer or be explicitly told what type `T` should be:

```typescript
// TypeScript infers T as number
const num = identity(42);

// We explicitly tell TypeScript that T is string
const str = identity<string>("hello");
```

This works well when we want complete flexibility, but sometimes we need to restrict what types can be used.

## Generic Constraints: Setting Boundaries

Generic constraints allow us to specify requirements that a type must meet to be used as a generic parameter. They effectively establish a "minimum capability" for the types that can be used.

### The `extends` Keyword

Constraints use the `extends` keyword to define what properties or capabilities a type must have:

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(value: T): T {
  console.log(value.length);
  return value;
}
```

In this example, we're saying "T can be any type, but it must have a `length` property that is a number." This means we can call `logLength` with strings, arrays, or any object with a length property, but not with numbers or booleans:

```typescript
logLength("hello");        // Works: string has length
logLength([1, 2, 3]);      // Works: array has length
logLength({ length: 10 }); // Works: object has length property

logLength(42);             // Error: number doesn't have length
logLength(true);           // Error: boolean doesn't have length
```

### Real-World Example: Type-Safe Property Access

Let's see how constraints enable safer property access:

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = {
  name: "Alice",
  age: 30
};

const name = getProperty(person, "name"); // Returns "Alice", type is string
const age = getProperty(person, "age");   // Returns 30, type is number
const job = getProperty(person, "job");   // Error: "job" is not a key of person
```

Here, `K extends keyof T` constrains `K` to only be keys that exist on the object `T`. This prevents runtime errors by catching invalid property access at compile time.

### Multiple Constraints

TypeScript allows combining multiple constraints using the intersection operator (`&`):

```typescript
interface Serializable {
  serialize(): string;
}

interface Identifiable {
  id: number;
}

// T must have both an id property and a serialize method
function saveEntity<T extends Serializable & Identifiable>(entity: T): void {
  const serialized = entity.serialize();
  console.log(`Saving entity ${entity.id}: ${serialized}`);
}

// This works
saveEntity({
  id: 123,
  serialize: () => "serialized data"
});

// This fails because it's missing the serialize method
saveEntity({
  id: 456
});
```

By using the intersection `Serializable & Identifiable`, we require that any type used for `T` must have all the properties and methods from both interfaces.

## Generic Defaults: Providing Fallback Types

Generic defaults provide a fallback type when no type argument is explicitly provided. They were introduced in TypeScript 2.3 and can make your code more concise and easier to use.

### Basic Default Type Parameters

Default type parameters are specified using the `=` operator followed by a type:

```typescript
function createState<T = string>(): { value: T | undefined; set: (value: T) => void } {
  let state: T | undefined;
  
  return {
    value: state,
    set: (value: T) => { state = value; }
  };
}

// Uses the default type parameter (string)
const stringState = createState();
stringState.set("hello"); // OK
stringState.set(42);      // Error: number is not assignable to string

// Explicitly provides a different type
const numberState = createState<number>();
numberState.set(42);      // OK
numberState.set("hello"); // Error: string is not assignable to number
```

In this example, if no type argument is provided when calling `createState`, TypeScript defaults to using `string` as the type parameter.

### Real-World Example: Simplified API Configuration

Defaults can significantly improve API usability:

```typescript
interface ApiClientConfig<T = Record<string, unknown>> {
  baseUrl: string;
  timeout?: number;
  defaultData?: T;
}

function createApiClient<T = Record<string, unknown>>(config: ApiClientConfig<T>) {
  // Implementation...
  return {
    fetch: (id: string) => {
      // Returns data of type T
      return {} as T;
    }
  };
}

// Using default type:
const basicClient = createApiClient({
  baseUrl: "https://api.example.com"
});
const basicData = basicClient.fetch("123"); // Type is Record<string, unknown>

// Specifying a custom type:
interface UserData {
  id: string;
  name: string;
  email: string;
}

const userClient = createApiClient<UserData>({
  baseUrl: "https://api.example.com/users",
  defaultData: { id: "", name: "", email: "" }
});
const userData = userClient.fetch("123"); // Type is UserData
```

The default `Record<string, unknown>` type provides a sensible generic object type, but users can provide a more specific type when needed.

## Combining Constraints and Defaults

You can use both constraints and defaults together to create flexible, yet controlled generic types:

```typescript
interface DatabaseRecord {
  id: string | number;
  createdAt: Date;
}

// T must extend DatabaseRecord, defaults to UserRecord
function fetchRecord<T extends DatabaseRecord = UserRecord>(id: string): Promise<T> {
  // Implementation...
  return Promise.resolve({} as T);
}

// Define UserRecord that satisfies the constraint
interface UserRecord extends DatabaseRecord {
  name: string;
  email: string;
}

// Using the default type (UserRecord)
const user = await fetchRecord("user-123");
console.log(user.name);  // OK, UserRecord has a name property

// Specifying a custom type
interface ProductRecord extends DatabaseRecord {
  name: string;
  price: number;
  stock: number;
}

const product = await fetchRecord<ProductRecord>("product-456");
console.log(product.price);  // OK, ProductRecord has a price property
```

Here, the generic parameter `T` has both a constraint (`extends DatabaseRecord`) and a default type (`UserRecord`). This means:
1. Any type used for `T` must include all the properties from `DatabaseRecord`
2. If no type argument is provided, `UserRecord` will be used automatically

This gives us both safety (ensuring necessary properties exist) and convenience (not requiring explicit type arguments for common cases).

## Advanced Patterns and Practical Applications

### Conditional Type Constraints

TypeScript allows for conditional type constraints, which can make your generic types even more flexible:

```typescript
// T can be any type, but U must be an array type where
// the array element type is assignable to T
function addToArray<T, U extends T[] = T[]>(item: T, arr: U): U {
  arr.push(item);
  return arr;
}

const numbers = [1, 2, 3];
const moreNumbers = addToArray(4, numbers);

const strings = ["a", "b"];
const moreStrings = addToArray("c", strings);

// Error: string is not assignable to number
addToArray("d", numbers);
```

Here `U extends T[] = T[]` does two things:
1. Constrains `U` to be an array type whose elements are assignable to `T`
2. If `U` is not explicitly provided, it defaults to `T[]`

### Factory Function Pattern

Generic constraints and defaults are particularly useful in factory functions:

```typescript
interface Widget<T = unknown> {
  id: string;
  type: string;
  data: T;
  render(): void;
}

// Base constraint for all widget data
interface BaseWidgetData {
  title: string;
}

// Create a factory function with constraints and defaults
function createWidget<T extends BaseWidgetData = BaseWidgetData>(
  type: string,
  data: T
): Widget<T> {
  return {
    id: Math.random().toString(36).substring(2),
    type,
    data,
    render() {
      console.log(`Rendering ${type} widget: ${this.data.title}`);
    }
  };
}

// Using with just the required base data
const basicWidget = createWidget("basic", { title: "Basic Widget" });

// Using with extended data
interface ChartData extends BaseWidgetData {
  datasets: number[][];
  labels: string[];
}

const chartWidget = createWidget<ChartData>(
  "chart",
  {
    title: "Sales Chart",
    datasets: [[10, 20, 30], [5, 15, 25]],
    labels: ["Jan", "Feb", "Mar"]
  }
);

// When rendering, the type information is preserved
chartWidget.data.datasets; // Type is number[][]
```

This pattern ensures that all widgets have a minimum set of required data (from `BaseWidgetData`), while allowing specific widget types to extend that data with type safety.

### React Component Example

Generic constraints and defaults are very useful in React components:

```typescript
interface TableProps<T extends Record<string, any> = Record<string, any>> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], item: T) => React.ReactNode;
  }>;
  onRowClick?: (item: T) => void;
}

function Table<T extends Record<string, any> = Record<string, any>>(
  props: TableProps<T>
) {
  const { data, columns, onRowClick } = props;
  
  return (
    <table>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.key as string}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i} onClick={() => onRowClick?.(item)}>
            {columns.map(column => {
              const value = item[column.key];
              return (
                <td key={column.key as string}>
                  {column.render ? column.render(value, item) : String(value)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Usage example with a specific type
interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
}

// The columns keys are type-checked against User
<Table<User>
  data={[
    { id: 1, name: "Alice", email: "alice@example.com", role: "admin" },
    { id: 2, name: "Bob", email: "bob@example.com", role: "user" }
  ]}
  columns={[
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { 
      key: "role", 
      header: "Role",
      render: (value) => (
        <span style={{ color: value === "admin" ? "red" : "blue" }}>
          {value}
        </span>
      )
    },
    { key: "age", header: "Age" }  // Error: 'age' does not exist on type 'User'
  ]}
  onRowClick={(user) => console.log(user.name)}
/>
```

This component is both flexible (it can work with any data structure) and type-safe (the columns must match the data structure).

## Common Pitfalls and Best Practices

### Pitfall 1: Overconstraining

Sometimes developers constrain generics too tightly, reducing their reusability:

```typescript
// Too constrained - only works with Person objects
function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

// Better - works with any object that has a name property
function sortByProperty<T, K extends keyof T>(
  items: T[],
  property: K
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[property];
    const bValue = b[property];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue);
    }
    
    return String(aValue).localeCompare(String(bValue));
  });
}
```

### Pitfall 2: Forgetting Constraints for Related Types

When using multiple type parameters that are related, don't forget to establish that relationship through constraints:

```typescript
// Problematic - K might not be a key of T
function extractProperty<T, K>(obj: T, key: K): any {
  return obj[key]; // Error: K is not constrained to keyof T
}

// Correct - K is constrained to be a key of T
function extractProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // OK
}
```

### Best Practice 1: Use Constraints to Enable Method Access

Use constraints when you need to call methods or access properties on a generic parameter:

```typescript
// No constraint needed - we're not accessing any properties of T
function createArray<T>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

// Constraint needed - we need to call the clone method
function cloneAll<T extends { clone(): T }>(items: T[]): T[] {
  return items.map(item => item.clone());
}
```

### Best Practice 2: Default to the Most General Type That Makes Sense

When choosing default types, pick the most general type that still makes sense for your use case:

```typescript
// Good - uses a general object type as default
function createStore<T = Record<string, unknown>>() {
  const data: T = {} as T;
  return {
    getData: () => data,
    setData: (newData: T) => { /* implementation */ }
  };
}

// Better - makes the generic parameter optional with a sensible default
function createStore<T = Record<string, unknown>>(initialData?: Partial<T>) {
  const data: T = { ...initialData } as T;
  return {
    getData: () => data,
    setData: (newData: T) => { /* implementation */ }
  };
}
```

### Best Practice 3: Use Self-Documenting Generic Names

Use descriptive names for generic parameters:

```typescript
// Too vague
function process<T, U, V>(input: T, config: U): V {
  // ...
}

// More descriptive
function process<InputType, ConfigType, OutputType>(
  input: InputType,
  config: ConfigType
): OutputType {
  // ...
}
```

## Summary

TypeScript's generic constraints and defaults provide powerful tools for creating flexible, reusable, and type-safe code:

1. **Generic constraints** (`extends`) ensure that a type parameter meets certain requirements, allowing you to safely access properties or call methods on generic types.

2. **Generic defaults** (`=`) provide fallback types when no explicit type arguments are provided, making your code more convenient to use while maintaining type safety.

3. When combined, constraints and defaults give you the perfect balance of flexibility, safety, and convenience.

By mastering these concepts, you can create TypeScript code that is both powerfully abstract and rigorously type-safe. Remember that the goal is to create APIs that are flexible enough to handle a variety of use cases, but constrained enough to catch errors at compile time rather than runtime.