# Function Declarations vs Expressions in JavaScript

JavaScript functions are fundamental building blocks that encapsulate reusable code. When we approach functions from first principles, we need to understand two key ways to create them: **declarations** and **expressions**. Let's explore both in depth.

## Function Declarations: The Foundation

> A function declaration defines a named function without requiring variable assignment. It's hoisted completely, meaning both the function name and body are available throughout its scope.

### The Anatomy of a Function Declaration

```javascript
function calculateArea(width, height) {
  return width * height;
}
```

In this declaration:
- The `function` keyword begins the statement
- `calculateArea` is the function name
- Parameters `width` and `height` are enclosed in parentheses
- The function body is contained within curly braces
- The `return` statement specifies the output value

### Hoisting Behavior

Function declarations are fully hoisted to the top of their scope. This means you can call the function before you've declared it in your code:

```javascript
// This works!
console.log(greet("Alice")); // Outputs: "Hello, Alice!"

// Function declaration
function greet(name) {
  return "Hello, " + name + "!";
}
```

Let's examine what happens under the hood. During the creation phase of execution, JavaScript scans the code and registers all function declarations before executing any code. It's as if your function declaration was physically moved to the top of its scope.

## Function Expressions: Functions as Values

> A function expression defines a function as part of an expression, typically by assigning it to a variable. Unlike declarations, only the variable name is hoisted, not the function body.

### The Anatomy of a Function Expression

```javascript
const calculateArea = function(width, height) {
  return width * height;
};
```

In this expression:
- A function is created and assigned to the variable `calculateArea`
- The function itself has no name (it's anonymous)
- Everything else (parameters, body, return) is syntactically identical to a declaration

### Named Function Expressions

Function expressions can also have names:

```javascript
const factorial = function calculateFactorial(n) {
  if (n <= 1) return 1;
  return n * calculateFactorial(n - 1);
};

console.log(factorial(5)); // 120
// console.log(calculateFactorial(5)); // Error! Name only exists inside the function
```

The name `calculateFactorial` is only accessible within the function's scope, allowing for recursion without exposing the name globally.

### Hoisting Behavior of Function Expressions

Let's see what happens when we try to call a function expression before its definition:

```javascript
// This will fail!
console.log(greet("Bob")); // Error: greet is not a function

// Function expression
const greet = function(name) {
  return "Hello, " + name + "!";
};
```

Why does this fail? During hoisting:
1. The variable `greet` is hoisted and initialized with `undefined`
2. When we try to call `greet()`, JavaScript tries to execute `undefined()`, causing an error
3. Only after the assignment line does `greet` hold a function reference

## Arrow Function Expressions: Modern JavaScript

ES6 introduced a more concise syntax for function expressions called arrow functions:

```javascript
const calculateArea = (width, height) => {
  return width * height;
};

// Even shorter for single expressions:
const calculateArea = (width, height) => width * height;
```

Arrow functions are always expressions (never declarations) with some special properties:
- They don't have their own `this` binding
- They don't have an `arguments` object
- They cannot be used as constructors (no `new` keyword)

## Practical Differences: When to Use Each

### 1. Hoisting Requirements

```javascript
// Using declaration when hoisting is needed
function initialize() {
  setupEventListeners();
  loadData();
  
  function setupEventListeners() {
    // Implementation...
  }
  
  function loadData() {
    // Implementation...
  }
}
```

The code above is clean and readable since the helper functions can appear after they're used.

### 2. Conditional Function Creation

```javascript
// Function expressions work well for conditional creation
let getDiscount;

if (user.isPremium) {
  getDiscount = function(price) {
    return price * 0.2; // 20% discount
  };
} else {
  getDiscount = function(price) {
    return price * 0.1; // 10% discount
  };
}
```

Function declarations cannot be conditionally created in strict mode (they're only allowed at the program or function body level).

### 3. Immediate Invocation (IIFE)

IIFEs (Immediately Invoked Function Expressions) create private scopes:

```javascript
// Using a function expression for an IIFE
(function() {
  const secretCode = "1234";
  console.log("Secret code initialized");
})();

// console.log(secretCode); // Error: secretCode is not defined
```

This pattern creates a private scope where variables don't leak to the outer scope.

### 4. Higher-Order Functions

Function expressions shine when passing functions as arguments:

```javascript
const numbers = [1, 2, 3, 4, 5];

// Using a function expression as an argument
const doubled = numbers.map(function(num) {
  return num * 2;
});

// Or more concisely with an arrow function
const tripled = numbers.map(num => num * 3);

console.log(doubled); // [2, 4, 6, 8, 10]
console.log(tripled); // [3, 6, 9, 12, 15]
```

## Memory Model and Execution Context

Let's understand what happens in memory:

1. **Function Declaration**:
   - During compilation, JavaScript creates a function object and assigns it to a name in the current scope
   - The function object contains the code, scope chain, and other properties
   - The function name becomes a reference to this object

2. **Function Expression**:
   - The variable is created and hoisted with `undefined` value
   - During execution, a function object is created
   - The variable is assigned a reference to this function object

This visualization might help:

```javascript
// How they look in memory after parsing but before execution
// Declaration:
greet: <reference to function object>

// Expression:
sayHello: undefined

// After execution of the assignment line, the expression becomes:
sayHello: <reference to function object>
```

## Performance Considerations

In modern JavaScript engines, there's negligible performance difference between declarations and expressions in most cases. The choice should be based on code organization and logical structure rather than performance.

## Function Context and `this` Binding

Function declarations and traditional function expressions behave identically with respect to `this`. The value of `this` depends on how the function is called:

```javascript
const user = {
  name: "Alice",
  greetDeclaration: function() {
    console.log("Hello, " + this.name);
  },
  greetExpression: function() {
    console.log("Hello, " + this.name);
  }
};

user.greetDeclaration(); // Hello, Alice
user.greetExpression(); // Hello, Alice

const standalone = user.greetDeclaration;
standalone(); // Hello, undefined (this is now the global object)
```

Arrow functions, however, are different:

```javascript
const user = {
  name: "Alice",
  greetArrow: () => {
    console.log("Hello, " + this.name);
  }
};

user.greetArrow(); // Hello, undefined (arrow functions do not have their own this)
```

## Best Practices and Style Guides

Different style guides have different preferences, but here's a reasonable approach:

> Use function declarations for main functions that define the structure of your program.
> Use function expressions (especially arrow functions) for callbacks and functional programming patterns.

The Airbnb style guide, for example, recommends function expressions for most cases to maintain consistent variable declaration patterns.

## Debugging Considerations

Named function expressions provide better stack traces during debugging:

```javascript
// Anonymous function expression
const calculateAnonymous = function(a, b) { return a + b; };

// Named function expression
const calculateNamed = function calculate(a, b) { return a + b; };
```

If an error occurs inside these functions, the stack trace for the named function will show "calculate", while the anonymous one might show "(anonymous)" or the variable name.

## Temporal Dead Zone (TDZ) with `let` and `const`

When using `let` and `const` with function expressions, the TDZ comes into play:

```javascript
console.log(funcVar); // undefined - hoisted but not initialized
var funcVar = function() {};

console.log(funcLet); // Error: Cannot access 'funcLet' before initialization
let funcLet = function() {};
```

Variables declared with `let` and `const` exist in a "temporal dead zone" from the start of the block until the declaration is processed.

## Function Declarations in Blocks

Function declarations in blocks (if statements, loops) have inconsistent behavior across browsers:

```javascript
if (true) {
  function blockFunc() { return "A"; }
} else {
  function blockFunc() { return "B"; }
}

console.log(blockFunc()); // Behavior varies across browsers!
```

For consistent behavior, use function expressions in blocks:

```javascript
let blockFunc;

if (true) {
  blockFunc = function() { return "A"; };
} else {
  blockFunc = function() { return "B"; };
}

console.log(blockFunc()); // Consistently returns "A"
```

## Conclusion

Understanding function declarations and expressions from first principles reveals their distinct behaviors:

- **Function declarations** are hoisted completely, making them accessible throughout their scope, providing clear structure but less flexibility.
- **Function expressions** treat functions as values that can be assigned, passed around, and created conditionally, offering greater flexibility but requiring careful attention to hoisting behavior.

The choice between them isn't about which is "better" but which is more appropriate for your specific use case. Modern JavaScript often uses a mix of both, with declarations for primary functions and expressions (particularly arrow functions) for callbacks and functional programming patterns.

By understanding the underlying principles, you can make informed decisions about which form to use in different contexts.