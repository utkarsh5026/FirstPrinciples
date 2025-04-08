# Abstract Classes and Methods in TypeScript: A First Principles Approach

Abstract classes and methods are fundamental concepts in object-oriented programming that TypeScript implements elegantly. Let's explore these concepts from first principles, understanding exactly what they are, why they exist, and how to use them effectively.

## What is Abstraction in Programming?

Before we dive into abstract classes, let's understand what "abstraction" means in programming. Abstraction is the process of hiding complex implementation details while exposing only the necessary parts of an object. It's about focusing on *what* something does rather than *how* it does it.

Think of your car. You know how to use the steering wheel, pedals, and gear shift, but you don't need to understand the internal combustion engine or transmission mechanics to drive it. That's abstraction in real life.

## Classes in TypeScript: A Quick Refresher

A class in TypeScript is a blueprint for creating objects with specific properties and methods. For example:

```typescript
class Car {
  make: string;
  model: string;
  
  constructor(make: string, model: string) {
    this.make = make;
    this.model = model;
  }
  
  drive(): void {
    console.log(`The ${this.make} ${this.model} is driving.`);
  }
}

// Creating an instance
const myCar = new Car("Toyota", "Corolla");
myCar.drive(); // Outputs: "The Toyota Corolla is driving."
```

In this example, `Car` is a concrete class - one that can be instantiated directly to create objects.

## What Are Abstract Classes?

An abstract class is a special type of class that cannot be instantiated directly. It serves as a base class from which other classes may be derived. Abstract classes can contain both complete methods (with implementations) and abstract methods (without implementations).

Think of an abstract class as an incomplete blueprint - it provides structure but leaves some details to be filled in by whoever uses it.

## Why Use Abstract Classes?

Abstract classes are useful when:

1. You want to share code among several closely related classes
2. You expect classes that extend your abstract class to have many common methods or fields
3. You want to declare non-static or non-final methods that subclasses must implement
4. You want to provide a common interface while forcing inheritors to implement specific behaviors

## Creating Abstract Classes in TypeScript

In TypeScript, you define an abstract class using the `abstract` keyword:

```typescript
abstract class Vehicle {
  // Regular property
  protected wheels: number;
  
  constructor(wheels: number) {
    this.wheels = wheels;
  }
  
  // Regular method with implementation
  honk(): void {
    console.log("Beep beep!");
  }
  
  // Abstract method - no implementation
  abstract move(): void;
}
```

In this example:
- `Vehicle` is an abstract class
- It has a regular property `wheels` and a regular method `honk()`
- It also has an abstract method `move()` that has no implementation

Let's try to create an instance of this abstract class:

```typescript
// This will cause a compilation error!
const myVehicle = new Vehicle(4); // Error: Cannot create an instance of an abstract class.
```

As expected, we cannot instantiate the abstract class directly.

## Abstract Methods

Abstract methods are methods declared in an abstract class but don't contain an implementation. They only provide a signature. Any class that extends an abstract class must implement all its abstract methods, or be declared abstract itself.

Abstract methods use the `abstract` keyword and don't have a method body; they end with a semicolon rather than curly braces:

```typescript
abstract class Animal {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  // Regular method
  eat(): void {
    console.log(`${this.name} is eating.`);
  }
  
  // Abstract method
  abstract makeSound(): void;
}
```

In this example, `makeSound()` is an abstract method. Any non-abstract class extending `Animal` must provide an implementation for `makeSound()`.

## Extending Abstract Classes

To use an abstract class, we need to extend it and implement all its abstract methods:

```typescript
class Dog extends Animal {
  breed: string;
  
  constructor(name: string, breed: string) {
    super(name); // Call the parent constructor
    this.breed = breed;
  }
  
  // Implementing the abstract method
  makeSound(): void {
    console.log("Woof! Woof!");
  }
  
  // Adding a new method
  fetch(): void {
    console.log(`${this.name} is fetching the ball!`);
  }
}

// Now we can create an instance
const myDog = new Dog("Rex", "German Shepherd");
myDog.eat(); // From the parent class: "Rex is eating."
myDog.makeSound(); // From the child class: "Woof! Woof!"
myDog.fetch(); // From the child class: "Rex is fetching the ball!"
```

In this example:
1. `Dog` extends the abstract class `Animal`
2. It implements the required abstract method `makeSound()`
3. It also adds its own method `fetch()`
4. We can now create instances of `Dog` (but not of `Animal`)

## A More Comprehensive Example

Let's look at a more realistic example using shapes:

```typescript
abstract class Shape {
  color: string;
  
  constructor(color: string) {
    this.color = color;
  }
  
  // Regular method
  describe(): void {
    console.log(`This is a ${this.color} shape.`);
  }
  
  // Abstract methods
  abstract calculateArea(): number;
  abstract calculatePerimeter(): number;
}

class Circle extends Shape {
  radius: number;
  
  constructor(color: string, radius: number) {
    super(color);
    this.radius = radius;
  }
  
  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  calculatePerimeter(): number {
    return 2 * Math.PI * this.radius;
  }
  
  // Circle-specific method
  getDiameter(): number {
    return 2 * this.radius;
  }
}

class Rectangle extends Shape {
  width: number;
  height: number;
  
  constructor(color: string, width: number, height: number) {
    super(color);
    this.width = width;
    this.height = height;
  }
  
  calculateArea(): number {
    return this.width * this.height;
  }
  
  calculatePerimeter(): number {
    return 2 * (this.width + this.height);
  }
  
  // Rectangle-specific method
  isSquare(): boolean {
    return this.width === this.height;
  }
}

// Using our shapes
const myCircle = new Circle("red", 5);
console.log(`Circle area: ${myCircle.calculateArea()}`);
console.log(`Circle perimeter: ${myCircle.calculatePerimeter()}`);
console.log(`Circle diameter: ${myCircle.getDiameter()}`);

const myRectangle = new Rectangle("blue", 4, 6);
console.log(`Rectangle area: ${myRectangle.calculateArea()}`);
console.log(`Rectangle perimeter: ${myRectangle.calculatePerimeter()}`);
console.log(`Is square? ${myRectangle.isSquare()}`);
```

This example shows:
1. An abstract `Shape` class with two abstract methods
2. Two concrete classes, `Circle` and `Rectangle`, each implementing the abstract methods
3. Each concrete class also adding its own specific methods
4. Both classes sharing the common structure and behavior from `Shape`

## Important Properties of Abstract Classes

1. **Partial Implementation**: Abstract classes can provide both implemented methods and abstract methods requiring implementation in subclasses.

2. **Cannot Be Instantiated**: You cannot create instances of abstract classes.

3. **Can Have Constructors**: Abstract classes can have constructors, even though they cannot be directly instantiated. These constructors are called when a derived class is instantiated.

4. **Can Have Properties**: Abstract classes can have properties that are inherited by subclasses.

5. **Access Modifiers**: Abstract classes can use access modifiers (public, private, protected) like regular classes.

## Abstract Classes vs. Interfaces

TypeScript also has interfaces, which might seem similar to abstract classes. Here's a quick comparison:

```typescript
// Interface
interface Vehicle {
  wheels: number;
  move(): void;
}

// Abstract class
abstract class AbstractVehicle {
  wheels: number;
  
  constructor(wheels: number) {
    this.wheels = wheels;
  }
  
  abstract move(): void;
  
  honk(): void {
    console.log("Beep!");
  }
}
```

Key differences:
1. **Implementation**: Abstract classes can provide implementations for some methods; interfaces cannot.
2. **Constructors**: Abstract classes can have constructors; interfaces cannot.
3. **Access Modifiers**: Abstract classes can use access modifiers; interfaces cannot.
4. **Multiple Inheritance**: A class can implement multiple interfaces but extend only one abstract class.
5. **Properties**: In abstract classes, properties can have values and be initialized; in interfaces, properties are just declarations.

## When to Use Abstract Classes vs. Interfaces

Use abstract classes when:
- You want to share code among several closely related classes
- You need to use access modifiers other than public
- You need to declare non-static or non-final fields
- You're building a framework where many classes share a common API but have different implementations

Use interfaces when:
- You want to define a contract that unrelated classes can implement
- You want to take advantage of multiple inheritance
- You need a lightweight way to express a common contract with no implementation

## Real-World Example: Form Controls

Let's consider a more practical example - a system for form controls in a UI framework:

```typescript
// Base abstract class for all form controls
abstract class FormControl {
  id: string;
  label: string;
  value: any;
  
  constructor(id: string, label: string) {
    this.id = id;
    this.label = label;
    this.value = null;
  }
  
  // Common functionality for all controls
  getValue(): any {
    return this.value;
  }
  
  setValue(newValue: any): void {
    this.value = newValue;
    this.render(); // Re-render when value changes
  }
  
  // Abstract methods that each control must implement
  abstract validate(): boolean;
  abstract render(): void;
}

// Text input implementation
class TextInput extends FormControl {
  maxLength: number;
  
  constructor(id: string, label: string, maxLength: number = 100) {
    super(id, label);
    this.maxLength = maxLength;
    this.value = "";
  }
  
  validate(): boolean {
    return typeof this.value === 'string' && 
           this.value.length <= this.maxLength;
  }
  
  render(): void {
    console.log(`Rendering text input: ${this.label} with value: ${this.value}`);
    // In a real app, this would create/update DOM elements
  }
}

// Checkbox implementation
class Checkbox extends FormControl {
  constructor(id: string, label: string) {
    super(id, label);
    this.value = false;
  }
  
  validate(): boolean {
    return typeof this.value === 'boolean';
  }
  
  render(): void {
    console.log(`Rendering checkbox: ${this.label}, checked: ${this.value}`);
    // In a real app, this would create/update DOM elements
  }
  
  // Checkbox-specific method
  toggle(): void {
    this.setValue(!this.value);
  }
}

// Using the controls
const nameInput = new TextInput("name", "Full Name");
nameInput.setValue("John Doe");
console.log(nameInput.validate()); // true

const agreeCheckbox = new Checkbox("agree", "I agree to terms");
agreeCheckbox.toggle(); // Checks the box
console.log(agreeCheckbox.getValue()); // true
```

In this example:
1. `FormControl` is an abstract base class with some implemented methods (`getValue`, `setValue`) and abstract methods (`validate`, `render`)
2. Each specific control type extends `FormControl` and implements the abstract methods
3. The abstract class provides a common structure and behavior that all controls share
4. Each concrete class adds its specific implementation and potentially new methods

## Common Gotchas and Best Practices

### 1. Abstract Class Members Must Be Implemented

All abstract methods must be implemented in derived classes, or the derived class must also be marked as abstract:

```typescript
abstract class Base {
  abstract method1(): void;
  abstract method2(): void;
}

// This is okay - implementing all abstract methods
class Complete extends Base {
  method1(): void {
    console.log("Method 1 implemented");
  }
  
  method2(): void {
    console.log("Method 2 implemented");
  }
}

// This is okay - making a new abstract class
abstract class Partial extends Base {
  // Implements one method
  method1(): void {
    console.log("Method 1 implemented");
  }
  
  // Still abstract for method2
}

// This would cause a compilation error - not implementing all required methods
class Incomplete extends Base {
  method1(): void {
    console.log("Method 1 implemented");
  }
  
  // Error: Non-abstract class 'Incomplete' does not implement
  // inherited abstract member 'method2' from class 'Base'
}
```

### 2. Access Modifiers in Abstract Methods

When implementing an abstract method, the access modifier must be the same or less restrictive:

```typescript
abstract class Base {
  abstract protected doSomething(): void;
}

class Derived extends Base {
  // This is valid - same access modifier
  protected doSomething(): void {
    console.log("Doing something");
  }
}

class Incorrect extends Base {
  // This would cause an error - more restrictive
  private doSomething(): void {
    console.log("Doing something");
  }
}

class Better extends Base {
  // This is valid - less restrictive
  public doSomething(): void {
    console.log("Doing something");
  }
}
```

### 3. Abstract Classes Can Have Static Members

Abstract classes can have static methods and properties that can be used without instantiation:

```typescript
abstract class Config {
  // Static property
  static readonly API_URL: string = "https://api.example.com";
  
  // Static method
  static getApiVersion(): string {
    return "v1.0";
  }
  
  // Instance abstract method
  abstract loadConfig(): void;
}

// Using static members without instantiating
console.log(Config.API_URL);
console.log(Config.getApiVersion());
```

## Conclusion

Abstract classes and methods in TypeScript provide a powerful way to share code while enforcing a common structure across related classes. They help you implement the principle of "code to an interface, not an implementation" while still allowing you to provide common functionality.

To summarize:
1. Abstract classes cannot be instantiated directly
2. They can contain both implemented methods and abstract methods
3. Classes that extend an abstract class must implement all its abstract methods
4. Abstract classes are ideal for hierarchies where related classes share behavior
5. They differ from interfaces in that they can provide implementations and use access modifiers

By mastering abstract classes and methods, you gain a powerful tool in your TypeScript toolkit for creating flexible, maintainable, and extensible code.