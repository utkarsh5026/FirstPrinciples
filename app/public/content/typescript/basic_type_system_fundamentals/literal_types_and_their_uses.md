# Literal Types: From JavaScript Values to TypeScript's Precise Type System

## JavaScript Foundation: Understanding Literals

In JavaScript, **literals** are the actual values you write directly in your code:

```javascript
// JavaScript literals - actual values
const message = "hello";        // string literal
const count = 42;              // numeric literal  
const isActive = true;         // boolean literal
const colors = ["red", "blue"]; // array literal
const user = { name: "Alice" }; // object literal
```

JavaScript treats these as **values** - things that exist at runtime and can change:

```javascript
// JavaScript: values can change
let status = "pending";
status = "approved";  // ✅ Works fine
status = "rejected";  // ✅ Works fine  
status = "invalid";   // ✅ Works fine (but maybe not what we want!)
```

## TypeScript's Revolutionary Approach: Literals as Types

TypeScript takes this further by treating **the literal values themselves** as types. Instead of just saying "this is a string," TypeScript can say "this is specifically the string 'pending'."

```typescript
// TypeScript: the literal value becomes the type
let status: "pending" = "pending";  // Type is literally "pending"
status = "approved";  // ❌ Error! Type '"approved"' is not assignable to type '"pending"'
```

> **Key Mental Model** : In TypeScript, every literal value can be treated as its own unique type. The string `"hello"` isn't just a string - it's the type that only accepts exactly `"hello"`.

## String Literal Types: Precision Over Flexibility

### Basic String Literals

```typescript
// Single string literal type
type Direction = "north";
let heading: Direction = "north";  // ✅ Only "north" allowed
// heading = "south";              // ❌ Error!

// Multiple string literal types (union)
type Status = "pending" | "approved" | "rejected";
let userStatus: Status = "pending";    // ✅ 
userStatus = "approved";               // ✅
userStatus = "completed";              // ❌ Error!
```

### Why String Literals Matter

Compare the safety difference:

```typescript
// JavaScript approach - too flexible
function setTheme(theme) {
    document.body.className = theme;
    // What if someone passes "drak" instead of "dark"? 
    // Runtime error or silent failure!
}

// TypeScript with string literals - precise control
type Theme = "light" | "dark" | "auto";
function setTheme(theme: Theme) {
    document.body.className = theme;  // Type-safe!
}

setTheme("light");  // ✅ 
setTheme("drak");   // ❌ Compile error catches typo!
```

### Advanced String Literal Patterns

```typescript
// Template literal types (TypeScript 4.1+)
type EventName = `user-${"login" | "logout" | "signup"}`;
// Expands to: "user-login" | "user-logout" | "user-signup"

let event: EventName = "user-login";   // ✅
let invalid: EventName = "user-delete"; // ❌ Error!

// Real-world API endpoint example
type APIEndpoint = `/api/${"users" | "posts" | "comments"}`;
const endpoint: APIEndpoint = "/api/users";  // ✅ Type-safe URLs!
```

## Numeric Literal Types: Beyond Just Numbers

### Basic Numeric Literals

```typescript
// Single numeric literal
type Zero = 0;
let count: Zero = 0;  // ✅ Only 0 allowed
// count = 1;         // ❌ Error!

// Multiple numeric literals
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 4;    // ✅
// roll = 7;               // ❌ Error! Invalid dice roll
```

### Practical Applications

```typescript
// HTTP status codes
type SuccessStatus = 200 | 201 | 204;
type ErrorStatus = 400 | 401 | 403 | 404 | 500;
type HttpStatus = SuccessStatus | ErrorStatus;

function handleResponse(status: HttpStatus) {
    if (status === 200) {
        // TypeScript knows this is exactly 200
        console.log("Success!");
    }
}

// Configuration with specific values
type LogLevel = 0 | 1 | 2 | 3;  // 0=silent, 1=error, 2=warn, 3=debug
let currentLogLevel: LogLevel = 2;
```

### Numeric Literals vs Regular Numbers

```typescript
// Compare the precision:
function processStatusCode(code: number) {
    // code could be ANY number - 999, -5, 3.14, etc.
    // No protection against invalid status codes
}

function processStatusCode(code: HttpStatus) {
    // code can ONLY be valid HTTP status codes
    // TypeScript prevents invalid values at compile time
}
```

## Boolean Literal Types: True/False as Distinct Types

### Understanding Boolean Literals

```typescript
// JavaScript: just true or false
let isEnabled = true;
let isDisabled = false;

// TypeScript: true and false as separate types
type IsEnabled = true;
type IsDisabled = false;

let flag1: IsEnabled = true;   // ✅ Only true allowed
// flag1 = false;              // ❌ Error!

let flag2: IsDisabled = false; // ✅ Only false allowed  
// flag2 = true;               // ❌ Error!
```

### When Boolean Literals Are Useful

```typescript
// Feature flags with specific states
type FeatureFlag = {
    name: string;
    enabled: true;  // This feature MUST be enabled
};

type DisabledFeature = {
    name: string;
    enabled: false;  // This feature MUST be disabled
    reason: string;
};

// Discriminated unions with boolean literals
type User = 
    | { isLoggedIn: true; username: string; sessionId: string }
    | { isLoggedIn: false; guestId: string };

function handleUser(user: User) {
    if (user.isLoggedIn) {
        // TypeScript knows: user has username and sessionId
        console.log(`Welcome back, ${user.username}!`);
    } else {
        // TypeScript knows: user has guestId
        console.log(`Guest user: ${user.guestId}`);
    }
}
```

## Compilation Process: When Literals Exist

```
TypeScript Development Time:
┌──────────────────────────┐
│ type Status = "pending"  │ ← Literal types exist here
│ let x: Status = "pending"│
│                          │
│ Compile-time checking    │
│ and IntelliSense         │
└──────────────────────────┘
            │
            ▼ tsc (TypeScript Compiler)
┌─────────────────────────┐
│ let x = "pending";      │ ← Types erased, only values remain
│                         │
│ Runtime JavaScript      │
│ (no type information)   │
└─────────────────────────┘
```

> **Critical Understanding** : Literal types are a compile-time feature. At runtime, `"pending"` is just a regular string. The type safety exists only during development and compilation.

## Practical Patterns and Use Cases

### Configuration Objects

```typescript
// Instead of magic strings throughout your app
type Environment = "development" | "staging" | "production";
type LogLevel = "debug" | "info" | "warn" | "error";

interface Config {
    env: Environment;
    logLevel: LogLevel;
    port: 3000 | 8080 | 8443;  // Only allowed ports
}

const config: Config = {
    env: "development",  // ✅ Autocomplete and validation
    logLevel: "debug",   // ✅ 
    port: 3000          // ✅
};
```

### Event Systems

```typescript
// Type-safe event handling
type MouseEventType = "click" | "mousedown" | "mouseup" | "mousemove";
type KeyboardEventType = "keydown" | "keyup" | "keypress";

function addEventListener(
    element: HTMLElement,
    eventType: MouseEventType | KeyboardEventType,
    handler: (event: Event) => void
) {
    element.addEventListener(eventType, handler);
}

// Usage with autocomplete and type safety
addEventListener(button, "click", handleClick);    // ✅
addEventListener(input, "keydown", handleKey);     // ✅
addEventListener(div, "invalid-event", handler);   // ❌ Compile error!
```

## Common Gotchas and Mental Models

### Gotcha 1: Widening Behavior

```typescript
// This might not work as expected:
let status = "pending";  // TypeScript infers type: string (not "pending")
let specificStatus: "pending" | "approved" = status;  // ❌ Error!

// Solutions:
const status = "pending";  // Type: "pending" (const doesn't widen)
// OR
let status: "pending" = "pending";  // Explicit literal type
// OR  
let status = "pending" as const;  // Const assertion
```

### Gotcha 2: Runtime vs Compile Time

```typescript
type UserRole = "admin" | "user" | "guest";

function checkRole(role: UserRole) {
    // This works at compile time
    if (role === "admin") {
        console.log("Admin access");
    }
}

// But be careful with runtime data:
const dataFromAPI = '{"role": "superuser"}';  // Invalid role from server
const parsed = JSON.parse(dataFromAPI);
checkRole(parsed.role);  // ❌ Runtime error potential!

// Solution: Runtime validation
function isValidRole(role: string): role is UserRole {
    return ["admin", "user", "guest"].includes(role);
}
```

> **Best Practice** : Literal types provide compile-time safety, but always validate data from external sources (APIs, user input, etc.) at runtime.

### Mental Model: The Narrowing Principle

```
Type System Hierarchy:
┌─────────────────────┐
│       string        │ ← Widest (any string value)
│  ┌───────────────┐  │
│  │ "hello" | "hi"│  │ ← Narrower (union of literals)  
│  │  ┌─────────┐  │  │
│  │  │ "hello" │  │  │ ← Narrowest (single literal)
│  │  └─────────┘  │  │
│  └───────────────┘  │
└─────────────────────┘
```

Literal types let you work at the most precise level of the type system, giving you maximum safety and the best developer experience through autocomplete and compile-time error checking.

The power of literal types lies in their ability to turn runtime errors into compile-time errors, making your code more reliable and your development experience more pleasant.
