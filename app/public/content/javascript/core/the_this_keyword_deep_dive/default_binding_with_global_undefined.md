I'll explain JavaScript's default binding with global/undefined from first principles, providing detailed explanations with examples to ensure a comprehensive understanding.

# Default Binding in JavaScript: Understanding the Foundation

> "Understanding how `this` works in JavaScript is not merely about syntax, but about grasping the fundamental nature of function execution contexts." 

## The Core Concept: What is Binding?

Let's start with the absolute basics. In JavaScript, the keyword `this` refers to an object—the subject in the context of which the current code is executing. This special variable is automatically created for every function execution context.

The process of determining what `this` points to is called "binding." There are several rules that determine this binding, with default binding being the most fundamental one.

### First Principles: Execution Contexts in JavaScript

To understand default binding, we first need to grasp what happens when JavaScript executes code:

1. All JavaScript code runs within an execution context
2. Each execution context has its own `this` reference
3. How a function is called determines what `this` will reference

## Default Binding: The Fallback Rule

> "Default binding is the fallback binding rule when no other binding rules apply. It's JavaScript's way of saying, 'If you haven't told me otherwise, here's what I'll assume.'"

Default binding occurs when a function is called with a plain, undecorated function reference. In this case, `this` is bound to the global object (in browsers, that's `window`; in Node.js, it's `global`). However, in strict mode, default binding sets `this` to `undefined` instead.

### Example 1: Default Binding in Non-Strict Mode

Let's see default binding in action:

```javascript
function showThis() {
  console.log(this);  // 'this' refers to the global object
}

showThis(); // Outputs: global object (window in browsers, global in Node.js)
```

In this example, `showThis()` is called as a standalone function. There's no object preceding the function call (like `obj.showThis()`), so default binding applies, and `this` refers to the global object.

Let's break down what happens:
1. `showThis()` is defined as a function
2. When called plainly, JavaScript applies default binding
3. `this` inside the function refers to the global object
4. The function logs the global object to the console

### Example 2: The Impact of Strict Mode

Now, let's see how strict mode changes the behavior:

```javascript
'use strict';

function showThisStrict() {
  console.log(this);  // 'this' is undefined in strict mode
}

showThisStrict(); // Outputs: undefined
```

In this example:
1. We enable strict mode with `'use strict'`
2. We define the function `showThisStrict()`
3. When called plainly, default binding still applies
4. But in strict mode, default binding sets `this` to `undefined`
5. The function logs `undefined` to the console

Strict mode was introduced in ECMAScript 5 as a way to catch common coding errors and "unsafe" actions. One of its effects is changing default binding from the global object to `undefined`.

### Example 3: Nested Functions and Default Binding

Let's explore a more complex example with nested functions:

```javascript
function outer() {
  console.log("Outer this:", this); // Depends on how 'outer' is called
  
  function inner() {
    console.log("Inner this:", this); // Always applies default binding
  }
  
  inner(); // Plain function call -> default binding
}

// Plain call to outer
outer(); // Outer this: global object (or undefined in strict mode)
         // Inner this: global object (or undefined in strict mode)

// Create an object
const obj = { name: "Example Object", method: outer };

// Method call to outer
obj.method(); // Outer this: obj
              // Inner this: global object (or undefined in strict mode)
```

This example demonstrates that:
1. The binding of `this` in `outer` depends on how `outer` is called
2. When `inner` is called, it's always a plain function call, so default binding applies
3. The context of the outer function doesn't automatically pass to the inner function

### Example 4: Default Binding with Arrow Functions

Arrow functions behave differently with regard to `this` binding:

```javascript
function regularFunction() {
  console.log("Regular function this:", this);
  
  // Arrow function doesn't create its own 'this'
  const arrowFunction = () => {
    console.log("Arrow function this:", this);
  };
  
  arrowFunction();
}

// Plain call
regularFunction(); // Regular function this: global object (or undefined in strict mode)
                   // Arrow function this: same as regularFunction's this
```

Arrow functions don't have their own `this` binding. Instead, they inherit `this` from the enclosing lexical context. This makes arrow functions particularly useful for callbacks and nested functions where you want to preserve the outer `this` context.

## Understanding Default Binding with Global/Undefined

> "The distinction between binding to the global object versus undefined is a small but crucial detail that can mean the difference between code that works and subtle bugs that are hard to track down."

### The Global Object as Default

In non-strict mode, default binding assigns `this` to the global object. This global object varies depending on the environment:

- In browsers, it's `window`
- In Node.js, it's `global`
- In Web Workers, it's `self`

Let's see an example of how this can sometimes lead to unexpected behavior:

```javascript
var globalVariable = "I'm global!";

function createGlobalVariable() {
  // Without var, let, or const, this creates a property on the global object
  this.oopsGlobal = "Accidentally global!";
}

createGlobalVariable(); // Plain function call -> default binding to global

console.log(globalVariable); // "I'm global!"
console.log(oopsGlobal);     // "Accidentally global!"
console.log(window.oopsGlobal); // Same as above in a browser environment
```

This example shows how default binding can accidentally create global variables when:
1. A function is called plainly (default binding applies)
2. `this` refers to the global object
3. Properties are assigned to `this` without declaring them with `var`, `let`, or `const`

### Undefined as Default in Strict Mode

In strict mode, default binding assigns `this` to `undefined` instead of the global object. This prevents accidental creation of global variables:

```javascript
'use strict';

var globalVariable = "I'm global!";

function createGlobalVariable() {
  // This will throw a TypeError in strict mode
  this.oopsGlobal = "This won't work!";
}

createGlobalVariable(); // TypeError: Cannot set property 'oopsGlobal' of undefined
```

In this example:
1. We enable strict mode
2. When `createGlobalVariable()` is called plainly, default binding sets `this` to `undefined`
3. Attempting to set a property on `undefined` throws a TypeError
4. This prevents the accidental creation of a global variable

## Practical Implications of Default Binding

### Example 5: Callbacks and Default Binding

Many JavaScript programming patterns involve passing functions as callbacks. Default binding often applies in these situations:

```javascript
function getUserData(callback) {
  // Some data fetching operation
  const userData = { name: "John", age: 30 };
  
  // Plain function call to callback
  callback(userData);
}

function processUser(user) {
  console.log(this); // global object or undefined in strict mode
  console.log(`Processing user: ${user.name}`);
}

getUserData(processUser);
```

In this example:
1. We define a function `getUserData` that takes a callback
2. We pass `processUser` as the callback
3. When `callback(userData)` is executed, it's a plain function call
4. Default binding applies, so `this` inside `processUser` is the global object (or `undefined` in strict mode)

### Example 6: Understanding Function Borrowing and Default Binding

Function borrowing is a common pattern in JavaScript where a method from one object is used by another:

```javascript
const person = {
  name: "Alice",
  greet: function() {
    return `Hello, my name is ${this.name}`;
  }
};

const greetFunction = person.greet; // Extract the function reference
console.log(greetFunction()); // "Hello, my name is undefined"

// Compare with:
console.log(person.greet()); // "Hello, my name is Alice"
```

In this example:
1. We define an object `person` with a method `greet`
2. We extract the function reference with `const greetFunction = person.greet`
3. When we call `greetFunction()`, it's a plain function call, so default binding applies
4. `this` is the global object (or `undefined` in strict mode)
5. The global object doesn't have a `name` property, so `this.name` is `undefined`
6. In contrast, when we call `person.greet()`, method binding applies and `this` is `person`

## Preventing Default Binding Issues

### Solution 1: Using `.bind()`, `.call()`, or `.apply()`

JavaScript provides methods to explicitly specify what `this` should be:

```javascript
function greet() {
  console.log(`Hello, my name is ${this.name}`);
}

const person = { name: "Bob" };

// Using .call()
greet.call(person); // "Hello, my name is Bob"

// Using .apply()
greet.apply(person); // "Hello, my name is Bob"

// Using .bind() - returns a new function with 'this' bound
const boundGreet = greet.bind(person);
boundGreet(); // "Hello, my name is Bob"
```

These methods allow you to control what `this` refers to, overriding default binding.

### Solution 2: Arrow Functions

As we saw earlier, arrow functions inherit `this` from their enclosing lexical context:

```javascript
const person = {
  name: "Charlie",
  friends: ["Alice", "Bob"],
  
  greetFriends: function() {
    // Using arrow function to preserve 'this'
    this.friends.forEach(friend => {
      console.log(`${this.name} says hello to ${friend}`);
    });
  }
};

person.greetFriends();
// Charlie says hello to Alice
// Charlie says hello to Bob
```

In this example:
1. The arrow function passed to `forEach` doesn't create its own `this`
2. It inherits `this` from `greetFriends`, which is bound to `person`
3. Therefore, `this.name` inside the arrow function is `person.name`

Compare with a regular function, which would use default binding:

```javascript
const person = {
  name: "Charlie",
  friends: ["Alice", "Bob"],
  
  greetFriends: function() {
    // Using regular function - 'this' will get default binding
    this.friends.forEach(function(friend) {
      console.log(`${this.name} says hello to ${friend}`); // this.name is undefined
    });
  }
};

person.greetFriends();
// undefined says hello to Alice
// undefined says hello to Bob
```

## Conclusion

> "Default binding in JavaScript is the foundation upon which all other binding rules are built. Understanding it is crucial for writing predictable and bug-free code."

Default binding is the most basic rule for determining what `this` refers to in JavaScript:

1. It applies when a function is called plainly, without any decoration
2. In non-strict mode, `this` is bound to the global object
3. In strict mode, `this` is bound to `undefined`
4. This difference in behavior can lead to bugs if not properly understood
5. Arrow functions, `.bind()`, `.call()`, and `.apply()` can be used to control `this` binding

By understanding default binding, you've gained insight into one of JavaScript's most fundamental mechanisms. This knowledge serves as a foundation for understanding the other binding rules (implicit/method binding, explicit binding, and `new` binding) that determine how `this` works in different situations.