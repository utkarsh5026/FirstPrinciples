# Function Currying and Partial Application in JavaScript

I'll explain function currying and partial application from first principles, exploring how these functional programming techniques work in JavaScript and why they're valuable.

> "The essence of functional programming is thinking about our program as a composition of functions rather than a sequence of assignments."
> — Rúnar Bjarnason

## First Principles of Functions in JavaScript

To understand currying and partial application, we need to start with what functions truly are in JavaScript.

A function in JavaScript is a first-class object that can:
1. Be stored in variables
2. Be passed as arguments to other functions
3. Be returned from other functions
4. Have properties and methods

```javascript
// A simple function
function add(a, b) {
  return a + b;
}

// Functions can be assigned to variables
const addition = add;
console.log(addition(2, 3)); // 5

// Functions can be passed as arguments
function callTwice(fn, value) {
  return fn(fn(value));
}
console.log(callTwice(x => x * 2, 3)); // 12

// Functions can return functions
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}
```

## Understanding Function Arity

Arity refers to the number of arguments a function expects to receive.

```javascript
// This function has an arity of 2
function add(a, b) {
  return a + b;
}

// This function has an arity of 3
function calculateVolume(length, width, height) {
  return length * width * height;
}
```

## What is Currying?

Currying is the process of transforming a function that takes multiple arguments into a sequence of functions that each take a single argument.

> "Currying is the technique of translating a function that takes multiple arguments into a sequence of functions, each with a single argument."

### Currying From First Principles

Let's understand what happens when we curry a function:

```javascript
// Regular function (arity of 3)
function add(a, b, c) {
  return a + b + c;
}

// Curried version
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

// Usage
console.log(add(1, 2, 3)); // 6
console.log(curriedAdd(1)(2)(3)); // 6
```

In the curried version, instead of taking all arguments at once, the function takes the first argument and returns a new function that takes the second argument, which returns another function that takes the third argument, which finally returns the result.

### ES6 Arrow Function Syntax for Currying

We can write the same curried function more concisely with arrow functions:

```javascript
// Curried add using arrow functions
const curriedAdd = a => b => c => a + b + c;

console.log(curriedAdd(1)(2)(3)); // 6
```

### Why Curry?

1. **Function Composition**: Currying makes it easier to compose functions.
2. **Partial Application**: You can create specialized functions from general ones.
3. **Point-Free Style**: Allows for cleaner, more declarative code.
4. **Reusability**: Creates smaller, more focused functions.

### Implementing a Curry Helper Function

Let's implement a generic curry function that transforms any multi-argument function into a curried version:

```javascript
function curry(fn) {
  return function curried(...args) {
    // If enough args, call original function
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // Otherwise, return a function that collects more args
    return function(...moreArgs) {
      return curried.apply(this, [...args, ...moreArgs]);
    };
  };
}

// Example usage
function add(a, b, c) {
  return a + b + c;
}

const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
console.log(curriedAdd(1, 2, 3)); // 6
```

This curry implementation allows you to provide any number of arguments at each call, as long as the total matches the original function's arity.

## What is Partial Application?

Partial application is closely related to currying but not identical. It's the process of fixing a number of arguments to a function, producing another function of smaller arity.

> "Partial application is the act of taking a function with multiple parameters and creating a new function by pre-filling some of the parameters."

### Partial Application From First Principles

```javascript
// Original function
function add(a, b, c) {
  return a + b + c;
}

// Partial application manually
function addPartial(a, b) {
  return function(c) {
    return add(a, b, c);
  };
}

// Usage
const add5And10 = addPartial(5, 10);
console.log(add5And10(15)); // 30
```

### Implementing a Partial Application Helper

Let's create a `partial` function that allows us to partially apply any function:

```javascript
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

// Example usage
function add(a, b, c) {
  return a + b + c;
}

const add5And10 = partial(add, 5, 10);
console.log(add5And10(15)); // 30

// Another example
function greet(greeting, name) {
  return `${greeting}, ${name}!`;
}

const sayHello = partial(greet, "Hello");
console.log(sayHello("World")); // "Hello, World!"
```

## Currying vs. Partial Application

Let's clarify the key differences:

> "Currying transforms a function with multiple parameters into a chain of functions each accepting a single parameter. Partial application fixes some parameters of a function, producing a function with fewer parameters."

| Currying | Partial Application |
|---------|-------------------|
| Transforms a function of arity n into n functions of arity 1 | Creates a function with fewer arguments by fixing some arguments |
| Returns a nested chain of functions | Returns a single function with fewer parameters |
| All arguments must eventually be provided | Only some arguments need to be specified initially |
| `add(1)(2)(3)` | `partial(add, 1, 2)(3)` |

## Real-World Examples

### Example 1: Creating a Logging Function

```javascript
// A general logging function
const log = (level, message, timestamp) => {
  console.log(`[${timestamp}] ${level}: ${message}`);
};

// Using currying to create specialized loggers
const curriedLog = curry(log);
const errorLogger = curriedLog("ERROR");
const warningLogger = curriedLog("WARNING");

// Add timestamp later
const errorLoggerNow = errorLogger("Database connection failed");
errorLoggerNow(new Date().toISOString());
// [2025-05-02T12:34:56.789Z] ERROR: Database connection failed
```

### Example 2: Event Handling with Partial Application

```javascript
// General event handler
function handleEvent(eventType, element, event) {
  console.log(`Handling ${eventType} event on ${element.id}`);
  // Process event
}

// Using partial application to create specialized handlers
const handleClick = partial(handleEvent, "click");
const handleMouseOver = partial(handleEvent, "mouseover");

// Attach handlers
document.getElementById("button").addEventListener(
  "click", 
  event => handleClick(document.getElementById("button"), event)
);
```

### Example 3: Data Processing Pipeline

```javascript
// Data transformation functions
const multiply = curry((factor, number) => number * factor);
const add = curry((amount, number) => number + amount);
const divide = curry((divisor, number) => number / divisor);

// Create specialized functions
const double = multiply(2);
const addTen = add(10);
const halve = divide(2);

// Create a processing pipeline
const processNumber = num => halve(addTen(double(num)));

console.log(processNumber(5)); // (5 * 2 + 10) / 2 = 10

// Or using function composition (not built into JS)
const compose = (...fns) => x => fns.reduceRight((val, fn) => fn(val), x);
const processNumber2 = compose(halve, addTen, double);

console.log(processNumber2(5)); // 10
```

## Benefits in Practice

1. **Code Reusability**: Create specialized versions of general functions
2. **Functional Composition**: Build complex logic from simple pieces
3. **Cleaner APIs**: Create more readable, intentional interfaces
4. **Separation of Concerns**: Separate parameter collection from logic execution
5. **Deferred Execution**: Wait for all arguments before executing

## Common Pitfalls and Solutions

### Problem: Functions with Variable Arguments

Currying and partial application work best with functions that have a fixed number of parameters. For functions with variable arguments:

```javascript
// Solution: Use arrays for variable arguments
const sum = curry((numbers, factor) => {
  return numbers.reduce((total, n) => total + n, 0) * factor;
});

const doubleSums = sum([1, 2, 3, 4]);
console.log(doubleSums(2)); // (1+2+3+4) * 2 = 20
```

### Problem: Context (this) Binding

Curried and partially applied functions might lose their context:

```javascript
// Solution: Use bind or arrow functions
function Counter() {
  this.count = 0;
  
  this.increment = curry(function(amount) {
    this.count += amount;
    return this.count;
  }).bind(this);
}

const counter = new Counter();
const addFive = counter.increment(5);
console.log(addFive()); // 5
console.log(addFive()); // 10
```

## Modern JavaScript Alternatives

### Using the Bind Method

JavaScript's `Function.prototype.bind()` provides built-in partial application:

```javascript
function add(a, b, c) {
  return a + b + c;
}

// Using bind for partial application
const add5 = add.bind(null, 5);
const add5And10 = add5.bind(null, 10);

console.log(add5And10(15)); // 30
```

### Using Default Parameters and Rest/Spread

```javascript
// Using default parameters and arrow functions
const adder = (a = 0) => (b = 0) => (c = 0) => a + b + c;

console.log(adder(5)(10)(15)); // 30
console.log(adder(5)(10)()); // 15
```

## Conclusion

Function currying and partial application are powerful techniques that let you build flexible, reusable functions. While they come from functional programming, they fit naturally in JavaScript's design and can make your code more modular and maintainable.

> "Programming is not about typing, it's about thinking."
> — Rich Hickey

Experiment with these patterns gradually to see how they might improve your code. Start with simple functions and build up to more complex compositions as you become comfortable with the concepts.