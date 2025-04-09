# TypeScript Template Literal Types: From First Principles

Template literal types are one of TypeScript's most powerful type system features, allowing you to create complex string-based types. Let's build our understanding from the absolute ground up.

## 1. The Foundation: String Literals in TypeScript

Before we can understand template literal types, we need to understand string literal types. In JavaScript, strings are primitive values:

```typescript
let message = "hello";
```

In TypeScript, we can define a type that's exactly one specific string:

```typescript
// A variable that can ONLY hold the string "error"
let status: "error" = "error";

// This would cause a type error
status = "success"; // Error: Type '"success"' is not assignable to type '"error"'
```

This is a string literal type - a type that represents exactly one string value. We can also create union types of string literals:

```typescript
// A variable that can be either "error", "warning", or "success"
let status: "error" | "warning" | "success" = "error";

// Now this works
status = "success"; // OK

// But this still fails
status = "unknown"; // Error: Type '"unknown"' is not assignable to type...
```

This is incredibly useful for modeling specific, restricted string values in your programs.

## 2. Understanding Template Literals in JavaScript

Before diving into template literal types, let's recall how template literals work in JavaScript:

```typescript
const name = "John";
const greeting = `Hello, ${name}!`;
console.log(greeting); // "Hello, John!"
```

Template literals in JavaScript allow us to embed expressions within backtick (`` ` ``) strings using `${expression}` syntax. They evaluate those expressions and include the results in the final string.

## 3. Introducing Template Literal Types

TypeScript's template literal types build on this concept, but at the type level. They let you construct new string literal types by concatenating existing string literal types.

Here's the basic syntax:

```typescript
type Greeting = `Hello, ${string}!`;
```

This defines a type that matches any string that starts with "Hello, " and ends with "!".

Let's see a simple example:

```typescript
type Greeting = `Hello, ${string}!`;

// These all match the type
const greeting1: Greeting = "Hello, World!";
const greeting2: Greeting = "Hello, TypeScript!";

// This doesn't match
const greeting3: Greeting = "Hi there!"; // Error: Type '"Hi there!"' is not assignable to type '`Hello, ${string}!`'
```

The `${string}` part means "any string can go here". We aren't limited to `string` - we can use other string literal types:

```typescript
type Direction = "top" | "right" | "bottom" | "left";
type Position = `${Direction}-${number}`;

// Valid
const pos1: Position = "top-10";
const pos2: Position = "left-5";

// Invalid
const pos3: Position = "center-10"; // Error: Type '"center-10"' is not assignable to type 'Position'
const pos4: Position = "top-"; // Error: Type '"top-"' is not assignable to type 'Position'
```

## 4. Practical Example: CSS Properties

Let's say we want to type CSS properties. We could create types for margin and padding properties:

```typescript
type Direction = "top" | "right" | "bottom" | "left";
type CSSProperty = "margin" | "padding";
type CSSValue = number | string;

// Creates types like "margin-top", "padding-left", etc.
type CSSPropertyWithDirection = `${CSSProperty}-${Direction}`;

// A function that sets CSS properties
function setStyle(property: CSSPropertyWithDirection, value: CSSValue): void {
  // Implementation here
  console.log(`Setting ${property} to ${value}`);
}

// Valid calls
setStyle("margin-top", 10);
setStyle("padding-left", "20px");

// Type error - "border" is not a valid CSSProperty
setStyle("border-top", 1); // Error!
```

This ensures we only call our `setStyle` function with valid CSS property names.

## 5. Advanced: Manipulating String Literal Types

TypeScript provides utility types specifically for working with template literal types:

### Uppercase, Lowercase, Capitalize, Uncapitalize

These utilities transform string literal types:

```typescript
type Greeting = "hello";

type UppercaseGreeting = Uppercase<Greeting>; // "HELLO"
type LowercaseGreeting = Lowercase<Greeting>; // "hello"
type CapitalizedGreeting = Capitalize<Greeting>; // "Hello"
type UncapitalizedGreeting = Uncapitalize<Greeting>; // "hello"
```

Let's see them with template literals:

```typescript
type Direction = "top" | "right" | "bottom" | "left";

// Creates "Top" | "Right" | "Bottom" | "Left"
type CapitalizedDirection = Capitalize<Direction>;

// Creates "TOP_MARGIN" | "RIGHT_MARGIN" | "BOTTOM_MARGIN" | "LEFT_MARGIN"
type DirectionConstant = `${Uppercase<Direction>}_MARGIN`;

// We can use these in functions
function getDirectionConstant(dir: Direction): DirectionConstant {
  return `${dir.toUpperCase()}_MARGIN` as DirectionConstant;
}

const constant = getDirectionConstant("top"); // "TOP_MARGIN"
```

## 6. Inferring from Template Literal Types

One of the most powerful aspects of template literal types is the ability to extract parts of string patterns using the `infer` keyword:

```typescript
// Defining a type to extract components from a route
type RouteParams<Route extends string> = 
  Route extends `${string}/:${infer Param}/${string}`
    ? Param
    : Route extends `${string}/:${infer Param}`
      ? Param
      : never;

// Example usage
type UserRouteParams = RouteParams<"/users/:userId">;  // "userId"
type PostRouteParams = RouteParams<"/users/:userId/posts/:postId">; // "userId"
```

This example tries to extract the first route parameter from a route string. The `infer` keyword creates a temporary type variable that captures the matched part of the string pattern.

Let's try a more complete example that extracts all parameters:

```typescript
// More sophisticated version that extracts all parameters
type ExtractRouteParams<Route extends string> = 
  Route extends `${string}/:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<`/${Rest}`>
    : Route extends `${string}/:${infer Param}`
      ? Param
      : never;

// Usage
type AllUserPostParams = ExtractRouteParams<"/users/:userId/posts/:postId">;
// Result: "userId" | "postId"
```

This recursive type definition extracts all route parameters by repeatedly matching patterns and then recursively processing the remainder.

## 7. Real-World Example: Event Handling

Let's look at a practical example for handling DOM events with type safety:

```typescript
// Define available events
type EventMap = {
  click: MouseEvent;
  keydown: KeyboardEvent;
  submit: SubmitEvent;
}

// Define our element types
type ElementMap = {
  button: HTMLButtonElement;
  input: HTMLInputElement;
  form: HTMLFormElement;
}

// Create a template literal type for all possible combinations
type ElementEventType = `${keyof ElementMap}:${keyof EventMap}`;

// Function to add event listeners with correct types
function addTypedEventListener
  E extends keyof ElementMap,
  K extends keyof EventMap
>(
  elementType: E,
  eventType: K,
  selector: string,
  handler: (element: ElementMap[E], event: EventMap[K]) => void
) {
  // Implementation would find elements and add listeners
  document.querySelectorAll(selector).forEach(element => {
    if (element instanceof Object.getPrototypeOf(window)[`HTML${capitalizeFirstLetter(elementType)}Element`]) {
      element.addEventListener(eventType, e => handler(element as ElementMap[E], e as EventMap[K]));
    }
  });
}

// Helper function
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Usage
addTypedEventListener("button", "click", ".submit-button", (button, event) => {
  // button is typed as HTMLButtonElement
  // event is typed as MouseEvent
  console.log(`Button ${button.textContent} was clicked at position ${event.clientX}, ${event.clientY}`);
});

addTypedEventListener("form", "submit", "#contact-form", (form, event) => {
  // form is typed as HTMLFormElement
  // event is typed as SubmitEvent
  event.preventDefault();
  console.log("Form submitted:", new FormData(form));
});
```

This example demonstrates how template literal types can help build type-safe APIs for event handling.

## 8. Pattern Matching with Template Literals

Let's build a simple router type that uses template literals for pattern matching:

```typescript
// Define a simple router type
type Route<Path extends string> =
  // If path has parameters like /users/:id
  Path extends `${infer Start}/:${infer Param}/${infer Rest}`
    ? {
        pattern: Path;
        params: { [K in Param | keyof RouteParams<`/${Rest}`>]: string };
      }
    : Path extends `${infer Start}/:${infer Param}`
    ? {
        pattern: Path;
        params: { [K in Param]: string };
      }
    : {
        pattern: Path;
        params: {};
      };

// Helper type for extracting params recursively
type RouteParams<Path extends string> =
  Path extends `${infer Start}/:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & RouteParams<`/${Rest}`>
    : Path extends `${infer Start}/:${infer Param}`
    ? { [K in Param]: string }
    : {};

// Example usage
type UserRoute = Route<"/users/:userId">;
/*
Result:
{
  pattern: "/users/:userId";
  params: {
    userId: string;
  }
}
*/

type PostRoute = Route<"/users/:userId/posts/:postId">;
/*
Result:
{
  pattern: "/users/:userId/posts/:postId";
  params: {
    userId: string;
    postId: string;
  }
}
*/
```

This router type extracts parameters from URL patterns and creates appropriate type definitions for them.

## 9. Creating Custom Type-Safe Functions

Let's develop a type-safe version of a string interpolation function:

```typescript
// Type-safe string interpolation
type Interpolation<T extends string> = {
  [K in T extends `${string}{${infer Param}}${infer Rest}`
    ? Param | keyof Interpolation<Rest>
    : never]: string;
};

// Function to safely interpolate strings
function interpolate<T extends string>(
  template: T,
  values: Interpolation<T>
): string {
  // Do the actual interpolation
  let result = template;
  for (const key in values) {
    result = result.replace(`{${key}}`, values[key]);
  }
  return result;
}

// Usage
const message = interpolate(
  "Hello, {name}! Your order {orderId} will arrive on {date}.",
  {
    name: "Alice",
    orderId: "ABC123",
    date: "Tuesday"
  }
);

// This would cause a type error - missing required values
// interpolate("Hello, {name}!", {}); // Error

// This would cause a type error - extra unused values
// interpolate("Hello, {name}!", { name: "Alice", age: "30" }); // Error
```

This function ensures that all template parameters are provided and no extra values are passed.

## 10. Limitations and Best Practices

Template literal types are powerful, but they have limitations:

1. **Performance**: Complex template literal types can slow down TypeScript compilation.

2. **Depth**: Deep recursive template literal types can exceed TypeScript's recursion limit.

3. **Expressiveness**: They can't express all possible string patterns (they're not full regular expressions).

Best practices:

- Use template literal types for finite, well-defined string patterns
- Break complex types into smaller, reusable parts
- Combine with type predicates and other TypeScript features for runtime validation
- Use meaningful type names that clearly indicate their purpose

## Conclusion

Template literal types are a powerful feature in TypeScript that allows you to create complex, string-based type systems. They enable you to:

1. Create precise string literal types using patterns
2. Extract information from string literals at the type level
3. Transform string types using built-in utility types
4. Combine with other TypeScript features for comprehensive type safety

By mastering template literal types, you can create incredibly expressive and type-safe APIs, especially for string-heavy domains like routing, CSS styling, and event handling.

Would you like me to elaborate on any particular aspect of template literal types or provide more examples?