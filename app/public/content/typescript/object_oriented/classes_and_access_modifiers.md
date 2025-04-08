# Classes and Access Modifiers in TypeScript: From First Principles

## What Are Classes?

Let's start with the most fundamental question: what is a class?

At its core, a class is a blueprint for creating objects. Think of it like a cookie cutter - the class defines the shape and characteristics, and the objects are the cookies you make with it. Each cookie has the same basic shape but can have different decorations or flavors.

In programming terms, a class defines:
- Properties (data)
- Methods (functions that operate on that data)
- Access rules for those properties and methods

### A Simple Class Example

Let's create the most basic class possible in TypeScript:

```typescript
class Person {
  name: string;
  age: number;
  
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    return `Hello, my name is ${this.name} and I am ${this.age} years old.`;
  }
}

// Creating an instance of the Person class
const alice = new Person("Alice", 30);
console.log(alice.greet()); // "Hello, my name is Alice and I am 30 years old."
```

This example demonstrates several fundamental concepts:

1. The `class` keyword defines a new class called `Person`
2. Inside the class, we declare two properties: `name` and `age` with their types
3. The `constructor` is a special method that runs when we create a new instance
4. The `greet` method is a function that uses the object's properties
5. We create an actual `Person` object using the `new` keyword
6. We can access the object's methods using dot notation

## Understanding Access Modifiers

Now that we understand what a class is, let's explore access modifiers - the rules that control who can access the properties and methods of a class.

TypeScript provides three access modifiers:

1. `public` - accessible from anywhere (default)
2. `private` - accessible only from within the class
3. `protected` - accessible from within the class and from subclasses

### Public Access Modifier

When a property or method is declared as `public`, it can be accessed from anywhere - inside the class, outside the class, and in derived classes.

```typescript
class Car {
  public make: string;
  public model: string;
  
  constructor(make: string, model: string) {
    this.make = make;
    this.model = model;
  }
  
  public drive() {
    return `Driving a ${this.make} ${this.model}`;
  }
}

const myCar = new Car("Toyota", "Corolla");
console.log(myCar.make); // "Toyota" - this works fine
console.log(myCar.drive()); // "Driving a Toyota Corolla" - this works fine
```

In this example, both the properties (`make`, `model`) and the method (`drive`) are accessible from outside the class. Notice that `public` is actually the default, so I could have omitted it, but I included it for clarity.

### Private Access Modifier

The `private` modifier restricts access to the containing class only. This is useful for hiding implementation details that shouldn't be accessed directly from outside the class.

```typescript
class BankAccount {
  private balance: number;
  
  constructor(initialBalance: number) {
    this.balance = initialBalance;
  }
  
  public deposit(amount: number) {
    if (amount > 0) {
      this.balance += amount;
      return true;
    }
    return false;
  }
  
  public withdraw(amount: number) {
    if (amount > 0 && amount <= this.balance) {
      this.balance -= amount;
      return true;
    }
    return false;
  }
  
  public getBalance() {
    return this.balance;
  }
}

const account = new BankAccount(1000);
// account.balance = 5000; // Error: Property 'balance' is private
account.deposit(500);
console.log(account.getBalance()); // 1500
```

In this example, the `balance` property is private. We can't access or modify it directly from outside the class. Instead, we need to use the public methods (`deposit`, `withdraw`, `getBalance`) that the class provides. This way, the class can enforce rules about how the balance can be changed.

### Protected Access Modifier

The `protected` modifier allows access within the class and any classes that inherit from it (subclasses). It's not accessible from outside these classes.

```typescript
class Animal {
  protected species: string;
  
  constructor(species: string) {
    this.species = species;
  }
  
  public makeSound() {
    return "Some generic animal sound";
  }
}

class Dog extends Animal {
  private name: string;
  
  constructor(name: string) {
    super("Canine"); // Call the parent constructor
    this.name = name;
  }
  
  public makeSound() {
    // Can access protected property from parent
    return `${this.name} the ${this.species} says: Woof!`;
  }
}

const rex = new Dog("Rex");
console.log(rex.makeSound()); // "Rex the Canine says: Woof!"
// console.log(rex.species); // Error: Property 'species' is protected
```

In this example, the `species` property is protected. The `Dog` class, which extends `Animal`, can access the protected `species` property. However, outside code cannot access it directly.

## Class Inheritance

As shown briefly in the previous example, TypeScript supports inheritance, where one class can inherit properties and methods from another class.

```typescript
class Shape {
  protected color: string;
  
  constructor(color: string) {
    this.color = color;
  }
  
  public getColor(): string {
    return this.color;
  }
  
  public calculateArea(): number {
    return 0; // Base implementation
  }
}

class Circle extends Shape {
  private radius: number;
  
  constructor(color: string, radius: number) {
    super(color); // Call parent constructor
    this.radius = radius;
  }
  
  public calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
  
  public getDescription(): string {
    return `A ${this.color} circle with radius ${this.radius}`;
  }
}

const myCircle = new Circle("red", 5);
console.log(myCircle.getColor()); // "red"
console.log(myCircle.calculateArea()); // 78.54...
console.log(myCircle.getDescription()); // "A red circle with radius 5"
```

In this example:
- We define a base `Shape` class with a protected `color` property
- The `Circle` class extends `Shape` and adds a `radius` property
- `Circle` calls the parent constructor using `super()`
- `Circle` overrides the `calculateArea` method with its own implementation
- A circle instance can use methods from both classes

## Parameter Properties Shorthand

TypeScript offers a shorthand for defining properties and initializing them in the constructor:

```typescript
class Student {
  // This shorthand automatically creates and initializes the properties
  constructor(
    public name: string,
    private id: number,
    protected grade: number
  ) {}
  
  public getDetails() {
    return `${this.name} (ID: ${this.id}) is in grade ${this.grade}`;
  }
}

const student = new Student("Bob", 12345, 11);
console.log(student.name); // "Bob"
// console.log(student.id); // Error: Property 'id' is private
console.log(student.getDetails()); // "Bob (ID: 12345) is in grade 11"
```

In this example, the constructor parameters automatically create and initialize class properties with the specified access modifiers. This saves us from having to declare the properties separately and assign them in the constructor.

## Readonly Properties

TypeScript also allows you to create `readonly` properties that can be assigned once (either at declaration or in the constructor) but cannot be changed afterward:

```typescript
class Config {
  readonly apiKey: string;
  readonly maxRetries: number = 3; // Default value
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // this.maxRetries can no longer be changed
  }
  
  public connect() {
    return `Connecting with key ${this.apiKey}, will retry up to ${this.maxRetries} times`;
  }
}

const config = new Config("abc123");
console.log(config.apiKey); // "abc123" - can read
// config.apiKey = "xyz789"; // Error: Cannot assign to 'apiKey' because it is a read-only property
console.log(config.connect()); // "Connecting with key abc123, will retry up to 3 times"
```

The `readonly` modifier ensures that once a property is set, it cannot be changed. This is useful for configuration values or other properties that should remain constant after initialization.

## Static Properties and Methods

So far, all our properties and methods belong to instances of the class. TypeScript also supports static properties and methods, which belong to the class itself rather than to instances:

```typescript
class MathHelper {
  static readonly PI: number = 3.14159265359;
  
  static square(num: number): number {
    return num * num;
  }
  
  static getCircumference(radius: number): number {
    return 2 * MathHelper.PI * radius;
  }
}

// No need to create an instance
console.log(MathHelper.PI); // 3.14159265359
console.log(MathHelper.square(5)); // 25
console.log(MathHelper.getCircumference(10)); // 62.8318...
```

Static members are accessed using the class name, not an instance of the class. They're useful for utility functions and constants that are related to the class but don't need access to instance-specific data.

## Abstract Classes

Abstract classes serve as base classes that cannot be instantiated directly. They can contain implementation details as well as abstract methods that derived classes must implement:

```typescript
abstract class Vehicle {
  protected make: string;
  
  constructor(make: string) {
    this.make = make;
  }
  
  // Regular method with implementation
  public getMake(): string {
    return this.make;
  }
  
  // Abstract method that subclasses must implement
  abstract start(): string;
}

class ElectricCar extends Vehicle {
  private batteryLevel: number;
  
  constructor(make: string, batteryLevel: number) {
    super(make);
    this.batteryLevel = batteryLevel;
  }
  
  // We must implement the abstract method
  public start(): string {
    return `The ${this.make} silently powers up. Battery at ${this.batteryLevel}%`;
  }
}

// const vehicle = new Vehicle("Generic"); // Error: Cannot create an instance of an abstract class
const tesla = new ElectricCar("Tesla", 90);
console.log(tesla.getMake()); // "Tesla"
console.log(tesla.start()); // "The Tesla silently powers up. Battery at 90%"
```

In this example:
- The `Vehicle` class is abstract and cannot be instantiated directly
- It provides a concrete implementation of `getMake()`
- It declares an abstract `start()` method without an implementation
- The `ElectricCar` class extends `Vehicle` and must implement `start()`

Abstract classes are useful when you want to share code among several related classes while ensuring they all follow a particular interface.

## Private vs. # Private Fields (ECMAScript Private Fields)

TypeScript supports two ways to make fields private: the TypeScript `private` modifier and the JavaScript private fields syntax using `#`:

```typescript
class PrivateDemo {
  private tsPrivate: string;
  #jsPrivate: string;
  
  constructor(value: string) {
    this.tsPrivate = value;
    this.#jsPrivate = value;
  }
  
  public getTsPrivate() {
    return this.tsPrivate;
  }
  
  public getJsPrivate() {
    return this.#jsPrivate;
  }
}

const demo = new PrivateDemo("secret");
console.log(demo.getTsPrivate()); // "secret"
console.log(demo.getJsPrivate()); // "secret"

// TypeScript private is enforced by the TypeScript compiler
// console.log(demo.tsPrivate); // TypeScript Error: Property 'tsPrivate' is private

// JavaScript private is enforced by the JavaScript runtime
// console.log(demo.#jsPrivate); // JavaScript Error at runtime
```

The difference is that `private` is a TypeScript feature that's erased during compilation, while `#private` is a JavaScript language feature that remains in the emitted code and is enforced at runtime.

## Real-World Example: User Management System

Let's put it all together with a more comprehensive example:

```typescript
// Define a User class with various access modifiers
class User {
  // Public property - accessible from anywhere
  public username: string;
  
  // Private property - only accessible within this class
  private password: string;
  
  // Protected property - accessible within this class and subclasses
  protected email: string;
  
  // Readonly property - can only be set once
  readonly id: number;
  
  // Static property - belongs to the class, not instances
  static userCount: number = 0;
  
  constructor(username: string, password: string, email: string) {
    this.username = username;
    this.password = password;
    this.email = email;
    
    // Generate an ID based on current timestamp
    this.id = Date.now();
    
    // Increment the static user count
    User.userCount++;
  }
  
  // Public method to check password
  public checkPassword(inputPassword: string): boolean {
    return this.password === inputPassword;
  }
  
  // Protected method that could be used by subclasses
  protected getEmailDomain(): string {
    const domain = this.email.split('@')[1];
    return domain || '';
  }
  
  // Static method to get total user count
  static getTotalUsers(): number {
    return User.userCount;
  }
}

// Admin class that extends User
class Admin extends User {
  // Private property for this class
  private permissions: string[];
  
  constructor(
    username: string,
    password: string,
    email: string,
    permissions: string[]
  ) {
    // Call the parent constructor
    super(username, password, email);
    this.permissions = permissions;
  }
  
  // Public method that uses parent's protected method
  public getAdminDomain(): string {
    return this.getEmailDomain();
  }
  
  // Public method to check if admin has a specific permission
  public hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}

// Create a regular user
const regularUser = new User("john_doe", "password123", "john@example.com");
console.log(regularUser.username); // "john_doe"
console.log(regularUser.checkPassword("password123")); // true
console.log(regularUser.id); // Some timestamp number

// Create an admin user
const adminUser = new Admin(
  "admin_jane",
  "admin_pass",
  "jane@company.com",
  ["users", "settings", "payments"]
);
console.log(adminUser.username); // "admin_jane"
console.log(adminUser.getAdminDomain()); // "company.com"
console.log(adminUser.hasPermission("users")); // true
console.log(adminUser.hasPermission("database")); // false

// Use the static method
console.log(User.getTotalUsers()); // 2
```

This example demonstrates:
- Different access modifiers (`public`, `private`, `protected`)
- Readonly properties
- Static properties and methods
- Inheritance between related classes
- How access modifiers affect what can be accessed and from where

## Conclusion

In TypeScript, classes provide a powerful way to structure and organize your code, encapsulate data, and control access to that data. Access modifiers help you enforce encapsulation principles by clearly defining what parts of your class are accessible from where.

Understanding these concepts from first principles allows you to create more robust, maintainable, and secure code. The class structure makes it possible to model real-world relationships and behaviors in your code, while access modifiers give you fine-grained control over how that code can be used.

Remember these key points:
- Classes are blueprints for objects with properties and methods
- `public` members are accessible from anywhere (default)
- `private` members are only accessible within the class
- `protected` members are accessible within the class and its subclasses
- Inheritance allows a class to extend another class
- `readonly` properties can only be set once
- Static members belong to the class itself, not instances
- Abstract classes provide a template for other classes to extend

By leveraging these features effectively, you can write TypeScript code that is not only type-safe but also well-structured and following good object-oriented design principles.