
# The Strategy Pattern: A First Principles Approach

> The Strategy pattern is one of the most elegant and useful patterns in object-oriented programming. It enables selecting an algorithm's implementation at runtime, making your code more flexible and maintainable.

## Understanding From First Principles

### What Is a Design Pattern?

Before diving into the Strategy pattern specifically, let's understand what a design pattern is:

A design pattern is a reusable solution to a commonly occurring problem in software design. It's not a finished piece of code but rather a template for solving certain types of problems.

### The Core Problem Strategy Pattern Solves

At its core, the Strategy pattern addresses this fundamental problem:

> How can we select and switch between different algorithms or behaviors at runtime without creating complex conditional logic?

This pattern separates what varies (the algorithms/strategies) from what stays the same (the context where these algorithms are used).

## Key Components of the Strategy Pattern

1. **Context** : The class that uses a Strategy
2. **Strategy Interface** : Defines a common interface for all concrete strategies
3. **Concrete Strategies** : The different algorithm implementations

Let's visualize this with a simple diagram:

```
Context
   │
   │ uses
   ▼
Strategy Interface
   ▲
   │ implements
   │
   ├───────┬───────┬───────┐
   │       │       │       │
Strategy1 Strategy2 Strategy3 Strategy4
```

## A Practical Example: Payment Processing

Let's implement a payment system using the Strategy pattern. We'll create different payment strategies that can be selected at runtime.

### Step 1: Define the Strategy Interface

First, we create a common interface that all payment strategies will implement:

```javascript
// The Strategy interface
class PaymentStrategy {
  pay(amount) {
    // This method will be implemented by concrete strategies
    throw new Error("This method must be implemented");
  }
}
```

This is a simple class that defines the interface all our concrete strategies must follow. Any class that extends `PaymentStrategy` must implement the `pay` method.

### Step 2: Create Concrete Strategies

Now, let's implement various payment methods:

```javascript
// Concrete Strategy 1: Credit Card Payment
class CreditCardPayment extends PaymentStrategy {
  constructor(cardNumber, name, cvv, expiryDate) {
    super();
    this.cardNumber = cardNumber;
    this.name = name;
    this.cvv = cvv; 
    this.expiryDate = expiryDate;
  }
  
  pay(amount) {
    console.log(`Paying ${amount} using Credit Card`);
    // Credit card processing logic would go here
    return true;
  }
}

// Concrete Strategy 2: PayPal Payment
class PayPalPayment extends PaymentStrategy {
  constructor(email, password) {
    super();
    this.email = email;
    this.password = password;
  }
  
  pay(amount) {
    console.log(`Paying ${amount} using PayPal`);
    // PayPal processing logic would go here
    return true;
  }
}

// Concrete Strategy 3: Bitcoin Payment
class BitcoinPayment extends PaymentStrategy {
  constructor(walletAddress) {
    super();
    this.walletAddress = walletAddress;
  }
  
  pay(amount) {
    console.log(`Paying ${amount} using Bitcoin`);
    // Bitcoin processing logic would go here
    return true;
  }
}
```

Each concrete strategy:

* Extends the base `PaymentStrategy` class
* Implements the required `pay` method
* Has its own constructor with strategy-specific parameters
* Contains the unique algorithm/logic for that particular payment method

### Step 3: Create the Context

The context is the class that will use these payment strategies:

```javascript
// The Context class
class ShoppingCart {
  constructor() {
    this.items = [];
    this.paymentStrategy = null; // Will be set at runtime
  }
  
  addItem(item) {
    this.items.push(item);
  }
  
  // Set the payment strategy at runtime
  setPaymentStrategy(paymentStrategy) {
    this.paymentStrategy = paymentStrategy;
  }
  
  // Calculate total amount
  calculateTotal() {
    return this.items.reduce((total, item) => total + item.price, 0);
  }
  
  // Use the selected strategy to make payment
  checkout() {
    const amount = this.calculateTotal();
    if (this.paymentStrategy) {
      return this.paymentStrategy.pay(amount);
    } else {
      throw new Error("No payment strategy selected!");
    }
  }
}
```

The `ShoppingCart` (our context):

* Stores items and maintains the selected strategy
* Has a method to set the strategy at runtime
* Delegates the payment processing to the selected strategy
* Doesn't need to know the details of how each payment method works

### Step 4: Using the Pattern

Now let's see how we can use this pattern in practice:

```javascript
// Create a shopping cart
const cart = new ShoppingCart();

// Add some items
cart.addItem({ name: "JavaScript Book", price: 39.99 });
cart.addItem({ name: "Design Patterns Book", price: 49.99 });

// User selects Credit Card payment method
const creditCardStrategy = new CreditCardPayment(
  "1234-5678-9012-3456",
  "John Doe",
  "123",
  "12/2025"
);
cart.setPaymentStrategy(creditCardStrategy);

// Process checkout
cart.checkout(); // Output: Paying 89.98 using Credit Card

// User changes their mind and wants to pay with PayPal
const paypalStrategy = new PayPalPayment("john@example.com", "password");
cart.setPaymentStrategy(paypalStrategy);

// Process checkout again
cart.checkout(); // Output: Paying 89.98 using PayPal
```

This example demonstrates the flexibility of the Strategy pattern:

* We can switch payment methods at runtime
* Adding new payment methods doesn't require changing the `ShoppingCart` class
* Each payment method is encapsulated in its own class

## Using Function-Based Strategies in JavaScript

One of JavaScript's strengths is its first-class functions. We can simplify the Strategy pattern using functions instead of classes:

```javascript
// Function-based Strategy pattern

// Context
class ShoppingCart {
  constructor() {
    this.items = [];
    this.paymentStrategy = null;
  }
  
  addItem(item) {
    this.items.push(item);
  }
  
  setPaymentStrategy(paymentFunction) {
    this.paymentStrategy = paymentFunction;
  }
  
  calculateTotal() {
    return this.items.reduce((total, item) => total + item.price, 0);
  }
  
  checkout() {
    const amount = this.calculateTotal();
    if (this.paymentStrategy) {
      return this.paymentStrategy(amount);
    } else {
      throw new Error("No payment strategy selected!");
    }
  }
}

// Define strategies as functions
const creditCardPayment = (amount) => {
  console.log(`Paid ${amount} using Credit Card`);
  return true;
};

const paypalPayment = (amount) => {
  console.log(`Paid ${amount} using PayPal`);
  return true;
};

const bitcoinPayment = (amount) => {
  console.log(`Paid ${amount} using Bitcoin`);
  return true;
};

// Usage
const cart = new ShoppingCart();
cart.addItem({ name: "JavaScript Book", price: 39.99 });
cart.setPaymentStrategy(creditCardPayment);
cart.checkout(); // Output: Paid 39.99 using Credit Card

// Switch strategy
cart.setPaymentStrategy(paypalPayment);
cart.checkout(); // Output: Paid 39.99 using PayPal
```

This approach is more concise and aligns well with JavaScript's functional programming capabilities.

## A More Advanced Example: Sorting Algorithms

Let's explore another example that highlights algorithm selection - implementing different sorting strategies:

```javascript
// Strategy Interface (can be an actual class or just a convention in JS)
class SortingStrategy {
  sort(data) {
    throw new Error("Sort method must be implemented");
  }
}

// Concrete Strategy 1: Bubble Sort
class BubbleSort extends SortingStrategy {
  sort(data) {
    console.log("Using Bubble Sort");
    // Clone the array to avoid modifying the original
    const arr = [...data];
    const n = arr.length;
  
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          // Swap elements
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
  
    return arr;
  }
}

// Concrete Strategy 2: Quick Sort
class QuickSort extends SortingStrategy {
  sort(data) {
    console.log("Using Quick Sort");
    // Clone the array to avoid modifying the original
    const arr = [...data];
  
    if (arr.length <= 1) {
      return arr;
    }
  
    const pivot = arr[0];
    const left = [];
    const right = [];
  
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < pivot) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
  
    // Recursively sort the left and right arrays
    return [...this.sort(left), pivot, ...this.sort(right)];
  }
}

// Concrete Strategy 3: Merge Sort
class MergeSort extends SortingStrategy {
  sort(data) {
    console.log("Using Merge Sort");
    // Clone the array to avoid modifying the original
    const arr = [...data];
  
    if (arr.length <= 1) {
      return arr;
    }
  
    // Split the array into two halves
    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);
  
    // Merge the sorted halves
    return this.merge(this.sort(left), this.sort(right));
  }
  
  merge(left, right) {
    const result = [];
    let leftIndex = 0;
    let rightIndex = 0;
  
    while (leftIndex < left.length && rightIndex < right.length) {
      if (left[leftIndex] < right[rightIndex]) {
        result.push(left[leftIndex]);
        leftIndex++;
      } else {
        result.push(right[rightIndex]);
        rightIndex++;
      }
    }
  
    // Add remaining elements
    return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  }
}

// Context
class Sorter {
  constructor() {
    this.sortingStrategy = null;
  }
  
  setSortingStrategy(strategy) {
    this.sortingStrategy = strategy;
  }
  
  sort(data) {
    if (!this.sortingStrategy) {
      throw new Error("No sorting strategy selected!");
    }
    return this.sortingStrategy.sort(data);
  }
}

// Usage
const sorter = new Sorter();
const data = [9, 3, 7, 5, 1, 8, 2, 6, 4];

// Choose strategy based on data size
if (data.length < 10) {
  sorter.setSortingStrategy(new BubbleSort());
} else if (data.length < 1000) {
  sorter.setSortingStrategy(new QuickSort());
} else {
  sorter.setSortingStrategy(new MergeSort());
}

const sortedData = sorter.sort(data);
console.log(sortedData); // [1, 2, 3, 4, 5, 6, 7, 8, 9]

// Switch strategy based on a different condition
if (data.includes(1)) {
  sorter.setSortingStrategy(new MergeSort());
  console.log(sorter.sort(data)); // Using Merge Sort
}
```

In this example:

* We have three different sorting algorithms
* We select the algorithm based on the data's characteristics
* We can easily switch between strategies at runtime
* Adding a new sorting algorithm would be as simple as creating a new class

## Simplified Strategy Pattern with Objects

JavaScript allows us to use plain objects as strategies, which can be even simpler:

```javascript
// Define strategies as object methods
const sortingStrategies = {
  bubble: function(data) {
    console.log("Using Bubble Sort");
    const arr = [...data];
    const n = arr.length;
  
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
  
    return arr;
  },
  
  quick: function(data) {
    console.log("Using Quick Sort");
    const arr = [...data];
  
    if (arr.length <= 1) return arr;
  
    const pivot = arr[0];
    const left = [];
    const right = [];
  
    for (let i = 1; i < arr.length; i++) {
      arr[i] < pivot ? left.push(arr[i]) : right.push(arr[i]);
    }
  
    return [...this.quick(left), pivot, ...this.quick(right)];
  },
  
  merge: function(data) {
    console.log("Using Merge Sort");
    const merge = (left, right) => {
      const result = [];
      let leftIndex = 0;
      let rightIndex = 0;
    
      while (leftIndex < left.length && rightIndex < right.length) {
        result.push(
          left[leftIndex] < right[rightIndex] 
            ? left[leftIndex++] 
            : right[rightIndex++]
        );
      }
    
      return [...result, ...left.slice(leftIndex), ...right.slice(rightIndex)];
    };
  
    const arr = [...data];
    if (arr.length <= 1) return arr;
  
    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);
  
    return merge(this.merge(left), this.merge(right));
  }
};

// Context
class Sorter {
  constructor(strategyName = 'quick') {
    this.setStrategy(strategyName);
  }
  
  setStrategy(strategyName) {
    if (!sortingStrategies[strategyName]) {
      throw new Error(`Strategy ${strategyName} not found!`);
    }
    this.currentStrategy = strategyName;
  }
  
  sort(data) {
    return sortingStrategies[this.currentStrategy](data);
  }
}

// Usage
const sorter = new Sorter();
const data = [9, 3, 7, 5, 1, 8, 2, 6, 4];

console.log(sorter.sort(data)); // Using Quick Sort (default)

// Change strategy
sorter.setStrategy('bubble');
console.log(sorter.sort(data)); // Using Bubble Sort

// Change strategy again
sorter.setStrategy('merge');
console.log(sorter.sort(data)); // Using Merge Sort
```

This implementation:

* Uses a simple object to store all strategies
* Allows strategies to be referenced by name
* Is more idiomatic to JavaScript
* Reduces boilerplate code

## Dynamic Strategy Creation

Another powerful approach in JavaScript is creating strategies dynamically:

```javascript
// Create a strategy factory
class SortStrategyFactory {
  static createStrategy(type, options = {}) {
    switch (type) {
      case 'bubble':
        return (data) => {
          console.log("Using Bubble Sort");
          const arr = [...data];
          const n = arr.length;
        
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
              if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
              }
            }
          }
        
          return arr;
        };
      
      case 'quick':
        // We can customize the strategy based on options
        const pivotMethod = options.pivotMethod || 'first';
      
        return function quickSort(data) {
          console.log(`Using Quick Sort with ${pivotMethod} pivot`);
          const arr = [...data];
        
          if (arr.length <= 1) return arr;
        
          // Choose pivot based on option
          let pivotIndex = 0; // default: first element
          if (pivotMethod === 'middle') {
            pivotIndex = Math.floor(arr.length / 2);
          } else if (pivotMethod === 'random') {
            pivotIndex = Math.floor(Math.random() * arr.length);
          }
        
          const pivot = arr[pivotIndex];
          const left = arr.filter((x, i) => x < pivot && i !== pivotIndex);
          const right = arr.filter((x, i) => x >= pivot && i !== pivotIndex);
        
          return [...quickSort(left), pivot, ...quickSort(right)];
        };
      
      default:
        throw new Error(`Strategy type ${type} not supported!`);
    }
  }
}

// Context
class Sorter {
  constructor() {
    this.sortingStrategy = null;
  }
  
  setSortingStrategy(strategy) {
    this.sortingStrategy = strategy;
  }
  
  sort(data) {
    if (!this.sortingStrategy) {
      throw new Error("No sorting strategy selected!");
    }
    return this.sortingStrategy(data);
  }
}

// Usage with factory
const sorter = new Sorter();

// Create and set a bubble sort strategy
sorter.setSortingStrategy(SortStrategyFactory.createStrategy('bubble'));
console.log(sorter.sort([5, 3, 1, 4, 2])); // [1, 2, 3, 4, 5]

// Create and set a customized quick sort strategy
sorter.setSortingStrategy(SortStrategyFactory.createStrategy('quick', { 
  pivotMethod: 'middle' 
}));
console.log(sorter.sort([5, 3, 1, 4, 2])); // [1, 2, 3, 4, 5]
```

This factory approach:

* Creates strategies on-demand
* Allows for customization through options
* Is highly flexible and adaptable
* Demonstrates how JavaScript's functional nature complements the Strategy pattern

## Real-World Use Case: Form Validation

Let's explore a practical real-world example - form validation strategies:

```javascript
// Strategy Interface (implicit in JavaScript)
// Each strategy should have a validate method that returns true/false

// Concrete Strategies
const validationStrategies = {
  // Email validation strategy
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  // Password strength validation
  strongPassword: (value) => {
    // At least 8 chars, with numbers, uppercase, lowercase, and special chars
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(value);
  },
  
  // Required field validation
  required: (value) => {
    return value !== null && value !== undefined && value.trim() !== '';
  },
  
  // Min length validation
  minLength: (value, min) => {
    return value.length >= min;
  },
  
  // Max length validation
  maxLength: (value, max) => {
    return value.length <= max;
  },
  
  // Numeric validation
  numeric: (value) => {
    return /^\d+$/.test(value);
  }
};

// Context: Form Validator
class FormValidator {
  constructor() {
    this.validations = {};
  }
  
  // Add a validation rule for a field
  addValidation(fieldName, strategy, ...args) {
    if (!this.validations[fieldName]) {
      this.validations[fieldName] = [];
    }
  
    this.validations[fieldName].push({
      strategy,
      args
    });
  }
  
  // Validate all fields
  validate(formData) {
    const errors = {};
  
    Object.keys(this.validations).forEach(fieldName => {
      const fieldValidations = this.validations[fieldName];
      const value = formData[fieldName];
    
      for (const validation of fieldValidations) {
        const { strategy, args } = validation;
      
        // Get the strategy function
        const validationFn = validationStrategies[strategy];
        if (!validationFn) {
          throw new Error(`Validation strategy ${strategy} not found!`);
        }
      
        // Apply the strategy with value and any additional args
        const isValid = validationFn(value, ...args);
      
        if (!isValid) {
          if (!errors[fieldName]) {
            errors[fieldName] = [];
          }
          errors[fieldName].push(`Failed ${strategy} validation`);
        }
      }
    });
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Example usage
const validator = new FormValidator();

// Add validation rules
validator.addValidation('email', 'required');
validator.addValidation('email', 'email');
validator.addValidation('password', 'required');
validator.addValidation('password', 'strongPassword');
validator.addValidation('password', 'minLength', 8);
validator.addValidation('age', 'numeric');

// Validate form data
const formData = {
  email: 'user@example.com',
  password: 'Weak', // This will fail
  age: '30'
};

const result = validator.validate(formData);
console.log(result.isValid); // false
console.log(result.errors); // { password: ['Failed strongPassword validation', 'Failed minLength validation'] }
```

This validation example shows:

* How strategies can be selected and combined
* How we can pass additional parameters to strategies
* How the context (`FormValidator`) can manage multiple strategies for different fields
* The flexibility to add new validation rules without changing existing code

## Benefits of the Strategy Pattern

1. **Eliminates Conditional Statements**
   > Instead of complex if-else chains, you have clean, encapsulated strategies.
   >
2. **Open/Closed Principle**
   > You can add new strategies without modifying existing code, making your system "open for extension but closed for modification."
   >
3. **Improved Testability**
   > Each strategy can be tested in isolation, making unit testing more straightforward.
   >
4. **Flexibility at Runtime**
   > Algorithms can be selected or switched during program execution based on conditions.
   >
5. **Separation of Concerns**
   > The context doesn't need to know how strategies work internally.
   >

## When to Use the Strategy Pattern

The Strategy pattern is particularly useful when:

1. You have multiple variants of an algorithm
2. You want to avoid excessive conditional logic
3. You need to select behaviors at runtime
4. Related classes differ only in their behavior

## Implementation Considerations in JavaScript

1. **Class-Based vs Function-Based**
   JavaScript allows both object-oriented and functional approaches. Choose based on your project's conventions.
2. **Dynamic vs Static Strategies**
   JavaScript's dynamism allows creating strategies on-the-fly, unlike more static languages.
3. **Strategy Configuration**
   Consider how strategies will be selected - by user choice, data characteristics, or system conditions.
4. **Strategy Composition**
   In complex cases, strategies themselves can be composed of other strategies.

## Conclusion

The Strategy pattern is a powerful tool for managing algorithm variation in your JavaScript code. By separating the "what" from the "how," it promotes cleaner, more maintainable, and flexible code.

From first principles, we've seen how:

1. Encapsulation of behavior leads to better organization
2. Runtime algorithm selection provides flexibility
3. The Open/Closed principle enables safer extension
4. JavaScript's functional nature offers multiple implementation options

Whether you're dealing with payment processing, sorting algorithms, or form validation, the Strategy pattern provides an elegant solution to algorithm selection problems.
