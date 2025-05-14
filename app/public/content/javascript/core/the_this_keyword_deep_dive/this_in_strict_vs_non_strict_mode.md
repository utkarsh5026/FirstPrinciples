I'll explain the `this` keyword in JavaScript from first principles, comparing how it behaves in strict and non-strict mode. I'll use clear examples and detailed explanations to build a complete understanding of this fundamental but often confusing concept.

# Understanding `this` in JavaScript

> The `this` keyword is perhaps one of the most misunderstood concepts in JavaScript. It's a special identifier that is automatically defined in the scope of every function, but what it references depends entirely on how the function is called.

## First Principles: What is `this`?

At its core, `this` is a reference to an execution context - the environment in which the current code is being executed. In JavaScript, functions can be called in various ways, and each way affects what `this` refers to.

The key principle to remember is:

> **`this` is not determined by where a function is declared, but by how it is invoked.**

This is fundamentally different from most other programming languages, where `this` (or its equivalent) typically refers to an instance of a class.

## Non-Strict Mode vs. Strict Mode

JavaScript has two operating modes:

1. **Non-strict mode**: The default, more forgiving mode
2. **Strict mode**: A stricter parsing and error handling mode activated by adding `"use strict"` at the top of your file or function

The behavior of `this` differs significantly between these modes, especially in certain scenarios.

## The Global Context

Let's start with the simplest case: what happens when `this` is referenced in the global scope?

### Example: Global `this` (both modes)

```javascript
console.log(this); // In a browser, refers to the window object in both modes
```

In both strict and non-strict mode, when `this` is used in the global context (outside any function), it refers to the global object. In browsers, that's the `window` object; in Node.js, it's the `global` object.

## Function Invocation

Now let's look at regular function calls - this is where the differences between strict and non-strict mode become apparent.

### Non-Strict Mode Function Calls

In non-strict mode, when a function is called as a standalone function (not as a method or with `new`), `this` automatically refers to the global object:

```javascript
function showThis() {
  console.log(this);
}

showThis(); // In a browser: window object
```

This behavior is often unexpected and can lead to bugs, as it can unintentionally modify global variables.

### Strict Mode Function Calls

> Strict mode fundamentally changes how `this` behaves in function calls to prevent accidental global object references.

```javascript
"use strict";

function showThis() {
  console.log(this);
}

showThis(); // undefined
```

In strict mode, when a function is called as a standalone function, `this` is `undefined` instead of the global object. This helps prevent unintended modifications to the global object.

Let's demonstrate with a more practical example:

### Example: Accidentally Modifying the Global Object

**Non-strict mode:**

```javascript
function createUser(name) {
  this.name = name; // Modifies the global object!
}

createUser("Alice");
console.log(window.name); // "Alice" - Oops! We modified the global window object
```

**Strict mode:**

```javascript
"use strict";

function createUser(name) {
  this.name = name; // This will throw an error!
}

createUser("Alice"); // TypeError: Cannot set property 'name' of undefined
```

In strict mode, this code throws an error because `this` is `undefined`, and you can't set properties on `undefined`. This helps catch bugs early.

## Method Invocation

When a function is called as a method of an object, `this` refers to the object that owns the method. This behavior is the same in both strict and non-strict modes.

### Example: Method Invocation (both modes)

```javascript
const user = {
  name: "Alice",
  greet: function() {
    console.log(`Hello, my name is ${this.name}`);
  }
};

user.greet(); // "Hello, my name is Alice" (in both strict and non-strict mode)
```

Here, `this` inside the `greet` method refers to the `user` object because that's what's to the left of the dot when the method is called.

## The Tricky Part: Function vs. Method Context

A common source of confusion is when you take a method from an object and call it as a standalone function:

### Example: Losing the Context

```javascript
const user = {
  name: "Alice",
  greet: function() {
    console.log(`Hello, my name is ${this.name}`);
  }
};

const greetFunction = user.greet; // Store reference to the method

// Now calling it as a standalone function:
greetFunction(); // In non-strict mode: "Hello, my name is undefined"
                // In strict mode: TypeError (cannot read property 'name' of undefined)
```

When we call `greetFunction()`, it's no longer being called as a method of `user`, so `this` isn't `user` anymore - it's either the global object (non-strict) or `undefined` (strict).

## Constructor Invocation

When a function is used with the `new` keyword, it's treated as a constructor. In this case, `this` refers to the newly created object, regardless of strict or non-strict mode.

### Example: Constructor Invocation (both modes)

```javascript
function User(name) {
  this.name = name;
  this.greet = function() {
    console.log(`Hello, I'm ${this.name}`);
  };
}

const alice = new User("Alice");
alice.greet(); // "Hello, I'm Alice" (in both strict and non-strict mode)
```

With the `new` keyword, JavaScript creates a new empty object, sets `this` to reference that object inside the constructor function, and then returns `this` if no other object is explicitly returned.

## Explicit Binding: call, apply, and bind

JavaScript provides methods to explicitly set what `this` should be, regardless of how the function is called.

### Example: Explicit Binding (both modes)

```javascript
function greet() {
  console.log(`Hello, my name is ${this.name}`);
}

const alice = { name: "Alice" };
const bob = { name: "Bob" };

// Using call - invoke immediately with specified 'this'
greet.call(alice); // "Hello, my name is Alice"

// Using apply - like call but takes arguments as array
greet.apply(bob); // "Hello, my name is Bob"

// Using bind - returns a new function with 'this' permanently bound
const greetAlice = greet.bind(alice);
greetAlice(); // "Hello, my name is Alice"
```

These methods work the same way in both strict and non-strict mode.

## Arrow Functions: Special Case

Arrow functions, introduced in ES6, handle `this` differently from regular functions. They don't have their own `this` binding; instead, they inherit `this` from the surrounding lexical context.

### Example: Arrow Functions (both modes)

```javascript
const user = {
  name: "Alice",
  // Traditional function expression
  greetRegular: function() {
    console.log(`Regular function: ${this.name}`);
    
    // Inner function loses context in both modes (though errors differently)
    function inner() {
      console.log(`Inner function: ${this.name}`);
    }
    inner();
    
    // Arrow function inherits context
    const innerArrow = () => {
      console.log(`Arrow function: ${this.name}`);
    };
    innerArrow();
  }
};

user.greetRegular();
// Output in non-strict mode:
// "Regular function: Alice"
// "Inner function: " (window.name or empty)
// "Arrow function: Alice"

// Output in strict mode:
// "Regular function: Alice"
// TypeError (cannot read property 'name' of undefined) for inner function
// "Arrow function: Alice"
```

The arrow function in this example inherits `this` from its surrounding context (the `greetRegular` method), where `this` is `user`. This behavior is the same in both strict and non-strict mode.

## Common Scenarios and Common Mistakes

Let's look at some practical examples to solidify our understanding:

### 1. Event Handlers

```javascript
const button = document.querySelector("button");

// Problem: 'this' will be the button element, not our object
button.addEventListener("click", user.greet); // 'this' will be the button!

// Solution 1: Use bind
button.addEventListener("click", user.greet.bind(user));

// Solution 2: Use arrow function to capture the lexical 'this'
button.addEventListener("click", () => user.greet());
```

### 2. Callbacks

```javascript
const user = {
  name: "Alice",
  loadProfile: function() {
    // Problem: 'this' will be lost in the callback
    setTimeout(function() {
      console.log(`Loaded profile for ${this.name}`);
    }, 1000); // 'this' will be window (non-strict) or undefined (strict)
    
    // Solution: Use arrow function
    setTimeout(() => {
      console.log(`Loaded profile for ${this.name}`);
    }, 1000); // 'this' remains the user object
  }
};

user.loadProfile();
```

## Summary: `this` in Strict vs. Non-Strict Mode

Let's create a clear comparison table of how `this` behaves in different scenarios:

| Context | Non-Strict Mode | Strict Mode |
|---------|----------------|-------------|
| Global scope | Global object (window/global) | Global object (window/global) |
| Function call | Global object | undefined |
| Method call | Owner object | Owner object |
| Constructor call (with new) | The new object | The new object |
| call/apply/bind | The specified object | The specified object |
| Arrow functions | Inherited from lexical scope | Inherited from lexical scope |

> The primary difference is that in non-strict mode, standalone function calls default to the global object for `this`, while strict mode uses `undefined`. This seemingly small difference can dramatically impact code safety and behavior.

## Why Strict Mode Behavior is Better

The strict mode behavior of `this` is generally considered better for several reasons:

1. **Prevents accidental global property modification**
2. **Catches errors earlier** - when you try to use `this` incorrectly, you get an error instead of unexpected behavior
3. **Makes code intent clearer** - if you want to reference the global object, you have to do so explicitly
4. **Aligns with more modern JavaScript practices**

## Best Practices for Working with `this`

1. **Use strict mode** - Add `"use strict"` at the top of your files or functions
2. **Use arrow functions for callbacks** - They inherit `this` lexically
3. **Use explicit binding when necessary** - Use `call`, `apply`, or `bind` to be clear about your intentions
4. **Be careful with method references** - Remember that `const fn = obj.method` loses the `this` binding
5. **Consider using class syntax** - ES6 classes make `this` behavior more intuitive

## Complete Example: Putting It All Together

```javascript
// Enable strict mode
"use strict";

class UserManager {
  constructor() {
    this.users = [];
    
    // Bind methods to ensure 'this' always refers to the UserManager instance
    this.addUser = this.addUser.bind(this);
    this.listUsers = this.listUsers.bind(this);
  }
  
  addUser(name) {
    // Safe to use this.users because we've bound the method
    this.users.push({ name, id: this.users.length + 1 });
    console.log(`Added user: ${name}`);
    
    // Demonstrate arrow function keeping 'this' context
    setTimeout(() => {
      console.log(`Current user count: ${this.users.length}`);
    }, 100);
    
    // Demonstrate regular function losing 'this' context
    setTimeout(function() {
      // This would be undefined in strict mode
      // We can't access this.users here!
      console.log("Regular function timeout complete");
    }, 100);
  }
  
  listUsers() {
    console.log("User list:");
    this.users.forEach(user => {
      // Arrow function keeps 'this' context
      console.log(`- ${user.name} (ID: ${user.id})`);
    });
  }
}

// Usage
const manager = new UserManager();
manager.addUser("Alice");
manager.addUser("Bob");
manager.listUsers();

// Demonstrate losing 'this' context if we didn't use .bind() earlier
const addUserFn = manager.addUser;
try {
  // This would throw an error in strict mode because 'this' is undefined
  addUserFn("Charlie");
} catch (e) {
  console.error("Error:", e.message);
}
```

By understanding how `this` works in different contexts and modes, you can write more predictable JavaScript code and avoid common pitfalls.