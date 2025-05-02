I'll explain explicit binding with `call`, `apply`, and `bind` in JavaScript from first principles, providing detailed explanations with examples.

# Understanding Explicit Binding in JavaScript

> "When you understand how JavaScript's `this` keyword works, you've unlocked one of the language's most powerful yet initially confusing features." 

## First Principles: The Problem of `this`

To understand explicit binding, we first need to grasp what the `this` keyword is and why it can be problematic.

In JavaScript, `this` is a special keyword that refers to the context in which a function is executed. However, unlike many other programming languages, the value of `this` isn't determined when the function is defined, but rather when the function is called. This dynamic nature of `this` is what makes it both powerful and confusing.

Let's start with a simple example:

```javascript
function showThis() {
  console.log(this);
}

showThis(); // In a browser, this will log the window object
```

When you call `showThis()` directly like this, `this` refers to the global object (in browsers, that's the `window` object). But what if we want `this` to refer to a specific object? That's where explicit binding comes in.

## The Three Methods of Explicit Binding

JavaScript provides three primary methods for explicitly binding the `this` value:

1. `call()`
2. `apply()`
3. `bind()`

Let's explore each of these methods in detail.

### 1. The `call()` Method

> "The `call()` method gives you precise control over what `this` will be during function execution, letting you borrow methods from other objects."

The `call()` method allows you to call a function with a specified `this` value and arguments provided individually.

#### Syntax of `call()`

```javascript
function.call(thisArg, arg1, arg2, ...)
```

Where:
- `thisArg`: The value to be passed as `this` to the function
- `arg1, arg2, ...`: Arguments for the function

#### A Simple Example

Let's see how `call()` works:

```javascript
function greet(greeting) {
  console.log(`${greeting}, I am ${this.name}`);
}

const person = {
  name: 'Alice'
};

// Using call to set 'this' to the person object
greet.call(person, 'Hello'); // Output: Hello, I am Alice
```

In this example:
1. We define a `greet` function that uses `this.name`
2. We create a `person` object with a `name` property
3. We use `call()` to invoke `greet` with `this` set to `person`

The first argument to `call()` becomes the `this` value inside the function, and the remaining arguments are passed to the function as parameters.

#### Method Borrowing with `call()`

One powerful use of `call()` is method borrowing, where you can use methods from one object on another:

```javascript
const car = {
  brand: 'Toyota',
  getBrand: function() {
    return this.brand;
  }
};

const motorcycle = {
  brand: 'Honda'
};

// Borrow the getBrand method from car
console.log(car.getBrand.call(motorcycle)); // Output: Honda
```

Here, we're using the `getBrand` method from the `car` object, but we're executing it in the context of the `motorcycle` object.

### 2. The `apply()` Method

> "The `apply()` method is like `call()`'s twin, with the key difference being how it handles function arguments."

The `apply()` method is very similar to `call()`. It also lets you call a function with a specified `this` value, but it takes arguments as an array.

#### Syntax of `apply()`

```javascript
function.apply(thisArg, [argsArray])
```

Where:
- `thisArg`: The value to be passed as `this` to the function
- `argsArray`: An array of arguments for the function

#### A Simple Example

Let's see `apply()` in action:

```javascript
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I am ${this.name}${punctuation}`);
}

const person = {
  name: 'Bob'
};

// Using apply with an array of arguments
introduce.apply(person, ['Hello', '!']); // Output: Hello, I am Bob!
```

The key difference between `call()` and `apply()` is that with `apply()`, you pass the function arguments as an array.

#### Practical Use Case for `apply()`

A common use case for `apply()` is when you want to use a math function on an array of numbers:

```javascript
const numbers = [5, 8, 2, 1, 9];

// Find the max value in the array
const max = Math.max.apply(null, numbers);
console.log(max); // Output: 9

// Find the min value in the array
const min = Math.min.apply(null, numbers);
console.log(min); // Output: 1
```

In this example, we use `apply()` to pass an array of numbers to `Math.max()` and `Math.min()`. Since these methods don't use `this`, we can pass `null` as the first argument.

### 3. The `bind()` Method

> "Unlike `call()` and `apply()` which immediately invoke a function, `bind()` creates a new function with a permanently fixed `this` value."

The `bind()` method is different from `call()` and `apply()` in a crucial way: it doesn't immediately invoke the function. Instead, it returns a new function with the `this` value permanently bound.

#### Syntax of `bind()`

```javascript
function.bind(thisArg, arg1, arg2, ...)
```

Where:
- `thisArg`: The value to be passed as `this` to the function
- `arg1, arg2, ...`: Arguments to be prepended to the arguments when the bound function is called

#### A Simple Example

Let's see how `bind()` works:

```javascript
function greet(greeting) {
  console.log(`${greeting}, I am ${this.name}`);
}

const person = {
  name: 'Charlie'
};

// Create a new function with 'this' bound to person
const greetCharlie = greet.bind(person);

// Call the bound function
greetCharlie('Hello'); // Output: Hello, I am Charlie

// We can also bind arguments
const sayHelloToCharlie = greet.bind(person, 'Hello');
sayHelloToCharlie(); // Output: Hello, I am Charlie
```

In this example:
1. We create a new function `greetCharlie` with `this` permanently bound to `person`
2. When we call `greetCharlie('Hello')`, `this` inside the function refers to `person`
3. We can also pre-bind arguments with `bind()`

#### Practical Use Case for `bind()`

A common use case for `bind()` is in event handlers and callbacks, where the context can be lost:

```javascript
class Counter {
  constructor() {
    this.count = 0;
    this.button = document.createElement('button');
    this.button.textContent = 'Click me';
    
    // Without bind, 'this' inside handleClick would not refer to the Counter instance
    // this.button.addEventListener('click', this.handleClick); // This would NOT work
    
    // With bind, we ensure 'this' refers to the Counter instance
    this.button.addEventListener('click', this.handleClick.bind(this));
    
    document.body.appendChild(this.button);
  }
  
  handleClick() {
    this.count++;
    console.log(`Button clicked ${this.count} times`);
  }
}

const counter = new Counter();
```

In this example, without `bind()`, `this` inside `handleClick` would refer to the button element, not the `Counter` instance. By using `bind()`, we ensure that `this` always refers to the `Counter` instance, even when the function is called as an event handler.

## Comparing `call()`, `apply()`, and `bind()`

Let's summarize the key differences between these three methods:

| Method | Calls Function | Accepts Arguments | Returns |
|--------|---------------|-------------------|---------|
| `call()` | Immediately | Individually | Function result |
| `apply()` | Immediately | As an array | Function result |
| `bind()` | No (returns a function) | Individually | New bound function |

### Example Comparing All Three

```javascript
function sum(a, b, c) {
  // 'this' will be the value we provide
  console.log(`this.value = ${this.value}`);
  return a + b + c;
}

const context = { value: 100 };

// Using call
const resultCall = sum.call(context, 1, 2, 3);
console.log(`call result: ${resultCall}`); 
// Output: this.value = 100
// Output: call result: 6

// Using apply
const resultApply = sum.apply(context, [1, 2, 3]);
console.log(`apply result: ${resultApply}`); 
// Output: this.value = 100
// Output: apply result: 6

// Using bind
const boundSum = sum.bind(context, 1, 2);
const resultBind = boundSum(3); // We can pass the remaining arguments when calling
console.log(`bind result: ${resultBind}`); 
// Output: this.value = 100
// Output: bind result: 6
```

## When to Use Each Method

### Use `call()` when:
- You want to call a function immediately with a specific `this` value
- You have individual arguments to pass to the function
- You want to borrow a method from another object

### Use `apply()` when:
- You want to call a function immediately with a specific `this` value
- You have arguments available as an array
- You want to use array-related methods or math functions on arrays

### Use `bind()` when:
- You want to create a new function with a fixed `this` value
- You need to pass a function as a callback but want to control what `this` will be
- You want to create a partial application of a function with some arguments fixed

## Common Pitfalls and Edge Cases

### What Happens with Null or Undefined?

If you pass `null` or `undefined` as the `this` value to `call()`, `apply()`, or `bind()` in non-strict mode, it will be replaced with the global object:

```javascript
function showThis() {
  console.log(this);
}

// In a browser, both of these will log the window object in non-strict mode
showThis.call(null);
showThis.apply(undefined);

// In strict mode, this would actually be null and undefined respectively
```

### Binding a Bound Function

If you try to bind a function that's already bound, the original binding won't be overridden:

```javascript
function greet() {
  console.log(`Hello, I am ${this.name}`);
}

const person1 = { name: 'Alice' };
const person2 = { name: 'Bob' };

const greetAlice = greet.bind(person1);
greetAlice(); // Output: Hello, I am Alice

// Trying to rebind won't work
const tryGreetBob = greetAlice.bind(person2);
tryGreetBob(); // Output: Hello, I am Alice (not Bob!)
```

## Real-World Applications

### Function Borrowing

```javascript
const calculator = {
  num: 0,
  sum: function(a, b) {
    return this.num + a + b;
  }
};

const calculator2 = {
  num: 5
};

// Borrow the sum method from calculator
console.log(calculator.sum.call(calculator2, 3, 2)); // Output: 10
```

### Creating Variadic Functions

```javascript
// Convert arguments object to array using apply
function makeArray() {
  return Array.prototype.slice.apply(arguments);
}

const array = makeArray(1, 2, 3, 4);
console.log(array); // Output: [1, 2, 3, 4]
```

### Partial Application

```javascript
function multiply(a, b, c) {
  return a * b * c;
}

// Create a function that has the first argument fixed to 2
const double = multiply.bind(null, 2);
console.log(double(3, 4)); // Output: 24 (2 * 3 * 4)

// Create a function that has the first and second arguments fixed
const sixTimes = multiply.bind(null, 2, 3);
console.log(sixTimes(4)); // Output: 24 (2 * 3 * 4)
```

## Conclusion

> "Mastering explicit binding is like having a superpower in JavaScript - it gives you precise control over how your code behaves in different contexts."

Understanding explicit binding with `call()`, `apply()`, and `bind()` is crucial for effective JavaScript programming. These methods give you control over the `this` value in your functions, allowing for more flexible and reusable code.

- Use `call()` when you need to invoke a function immediately with a specific context and individual arguments.
- Use `apply()` when you need to invoke a function immediately with a specific context and have arguments as an array.
- Use `bind()` when you need to create a new function with a fixed context, especially useful for callbacks and event handlers.

By mastering these methods, you'll be able to write more elegant, reusable, and maintainable JavaScript code.