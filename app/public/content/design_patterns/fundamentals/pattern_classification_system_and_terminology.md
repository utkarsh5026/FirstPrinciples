# Design Pattern Classification System and Terminology in Software

Design patterns represent proven solutions to common software design problems. They provide a shared vocabulary for developers to discuss software architecture and design approaches. Let me explain the classification system and terminology of design patterns from first principles.

## The Foundation: What Are Design Patterns?

> "Each pattern describes a problem which occurs over and over again in our environment, and then describes the core of the solution to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice."
> — Christopher Alexander

Design patterns emerged from the recognition that certain software design problems appear repeatedly across different projects and domains. Rather than reinventing solutions each time, experienced developers identified, documented, and named these recurring patterns.

### Origins of Software Design Patterns

The concept of design patterns in software originated from the work of architects, particularly Christopher Alexander, who documented patterns in architectural design. In 1994, the "Gang of Four" (GoF) — Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides — published the influential book "Design Patterns: Elements of Reusable Object-Oriented Software," which codified 23 patterns for object-oriented design.

## The Classification System

Design patterns are typically classified into three main categories based on their purpose or intent:

1. **Creational Patterns**
2. **Structural Patterns**
3. **Behavioral Patterns**

Let's explore each category in depth.

### 1. Creational Patterns

Creational patterns focus on object creation mechanisms, abstracting the instantiation process. They help make a system independent of how its objects are created, composed, and represented.

> "Creational patterns become important as systems evolve to depend more on object composition than class inheritance."

#### Key Creational Patterns:

**Singleton Pattern**

The Singleton pattern ensures a class has only one instance and provides a global point of access to it.

Example in JavaScript:

```javascript
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }
  
    // Initialize the database connection
    this.connectionString = "mongodb://localhost:27017";
    this.isConnected = false;
  
    // Save the instance
    DatabaseConnection.instance = this;
  }
  
  connect() {
    if (!this.isConnected) {
      console.log(`Connecting to ${this.connectionString}`);
      this.isConnected = true;
    } else {
      console.log("Already connected");
    }
  }
}

// Usage
const connection1 = new DatabaseConnection();
const connection2 = new DatabaseConnection();

console.log(connection1 === connection2); // true - same instance
connection1.connect(); // "Connecting to mongodb://localhost:27017"
connection2.connect(); // "Already connected"
```

In this example, no matter how many times we try to create a new `DatabaseConnection`, we always get back the same instance. This is useful for resources that should be shared, like database connections or configuration settings.

**Factory Method Pattern**

The Factory Method pattern defines an interface for creating an object but lets subclasses decide which class to instantiate.

Example in Python:

```python
from abc import ABC, abstractmethod

# Product interface
class Document(ABC):
    @abstractmethod
    def create(self):
        pass

# Concrete Products
class PDFDocument(Document):
    def create(self):
        return "Creating PDF document"

class WordDocument(Document):
    def create(self):
        return "Creating Word document"

# Creator interface
class DocumentCreator(ABC):
    @abstractmethod
    def factory_method(self):
        pass
  
    def operation(self):
        # Call the factory method to create a Document object
        document = self.factory_method()
        result = document.create()
        return result

# Concrete Creators
class PDFCreator(DocumentCreator):
    def factory_method(self):
        return PDFDocument()

class WordCreator(DocumentCreator):
    def factory_method(self):
        return WordDocument()

# Usage
pdf_creator = PDFCreator()
word_creator = WordCreator()

print(pdf_creator.operation())  # "Creating PDF document"
print(word_creator.operation())  # "Creating Word document"
```

In this example, the `DocumentCreator` abstract class provides an interface with a factory method that subclasses must implement. Each subclass (`PDFCreator`, `WordCreator`) decides which concrete `Document` class to instantiate. This decouples the client code from the specific classes it uses.

### 2. Structural Patterns

Structural patterns deal with object composition, creating relationships between objects to form larger structures. They help ensure that when parts of a system change, the entire system doesn't need to change.

> "Structural patterns are concerned with how classes and objects are composed to form larger structures."

#### Key Structural Patterns:

**Adapter Pattern**

The Adapter pattern allows classes with incompatible interfaces to work together by creating a wrapper with a compatible interface.

Example in Java:

```java
// Target interface expected by the client
interface USPlug {
    void plugIntoUSSocket();
}

// Adaptee - has an incompatible interface
class EuropeanPlug {
    public void plugIntoEuropeanSocket() {
        System.out.println("Plugged into European socket");
    }
}

// Adapter - makes EuropeanPlug compatible with USPlug interface
class PlugAdapter implements USPlug {
    private EuropeanPlug europeanPlug;
  
    public PlugAdapter(EuropeanPlug europeanPlug) {
        this.europeanPlug = europeanPlug;
    }
  
    @Override
    public void plugIntoUSSocket() {
        System.out.println("Using adapter to convert");
        europeanPlug.plugIntoEuropeanSocket();
        System.out.println("Now works with US socket");
    }
}

// Client code
public class Client {
    public static void main(String[] args) {
        // Using a US plug directly
        USPlug usPlug = new USPlugImpl();
        usPlug.plugIntoUSSocket();
      
        // Using a European plug with an adapter
        EuropeanPlug europeanPlug = new EuropeanPlug();
        USPlug adapter = new PlugAdapter(europeanPlug);
        adapter.plugIntoUSSocket();
    }
}
```

In this example, we have a European plug that doesn't fit into a US socket. The adapter acts as a wrapper that allows the European plug to work with the US socket interface. This pattern is useful when integrating with legacy systems or third-party libraries.

**Composite Pattern**

The Composite pattern composes objects into tree structures to represent part-whole hierarchies, allowing clients to treat individual objects and compositions uniformly.

Example in TypeScript:

```typescript
// Component interface
interface FileSystemComponent {
    getName(): string;
    getSize(): number;
    print(indent: string): void;
}

// Leaf class
class File implements FileSystemComponent {
    constructor(private name: string, private size: number) {}
  
    getName(): string {
        return this.name;
    }
  
    getSize(): number {
        return this.size;
    }
  
    print(indent: string): void {
        console.log(`${indent}File: ${this.name} (${this.size} KB)`);
    }
}

// Composite class
class Directory implements FileSystemComponent {
    private children: FileSystemComponent[] = [];
  
    constructor(private name: string) {}
  
    add(component: FileSystemComponent): void {
        this.children.push(component);
    }
  
    remove(component: FileSystemComponent): void {
        const index = this.children.indexOf(component);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }
  
    getName(): string {
        return this.name;
    }
  
    getSize(): number {
        return this.children.reduce((total, child) => total + child.getSize(), 0);
    }
  
    print(indent: string): void {
        console.log(`${indent}Directory: ${this.name} (${this.getSize()} KB)`);
        this.children.forEach(child => {
            child.print(indent + "  ");
        });
    }
}

// Usage
const root = new Directory("root");
const docs = new Directory("documents");
const photos = new Directory("photos");

const resume = new File("resume.pdf", 1000);
const photo1 = new File("vacation.jpg", 2000);
const photo2 = new File("family.jpg", 3000);

docs.add(resume);
photos.add(photo1);
photos.add(photo2);

root.add(docs);
root.add(photos);
root.add(new File("notes.txt", 100));

root.print("");
console.log(`Total size: ${root.getSize()} KB`);
```

In this example, both `File` (leaf) and `Directory` (composite) implement the `FileSystemComponent` interface, allowing them to be treated uniformly. A directory can contain files or other directories, creating a tree structure. Clients can work with individual objects or compositions through the same interface.

### 3. Behavioral Patterns

Behavioral patterns focus on communication between objects, defining how objects interact and distribute responsibility.

> "Behavioral patterns are concerned with algorithms and the assignment of responsibilities between objects."

#### Key Behavioral Patterns:

**Observer Pattern**

The Observer pattern defines a one-to-many dependency between objects where all dependents are notified when the state of the observed object changes.

Example in JavaScript:

```javascript
class WeatherStation {
  constructor() {
    this.temperature = 0;
    this.humidity = 0;
    this.observers = [];
  }
  
  registerObserver(observer) {
    this.observers.push(observer);
  }
  
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }
  
  notifyObservers() {
    for (const observer of this.observers) {
      observer.update(this.temperature, this.humidity);
    }
  }
  
  setMeasurements(temperature, humidity) {
    this.temperature = temperature;
    this.humidity = humidity;
    this.notifyObservers();
  }
}

class Display {
  constructor(name) {
    this.name = name;
  }
  
  update(temperature, humidity) {
    console.log(`${this.name} Display: Temperature: ${temperature}°C, Humidity: ${humidity}%`);
  }
}

// Usage
const weatherStation = new WeatherStation();

const phoneDisplay = new Display("Phone");
const laptopDisplay = new Display("Laptop");
const tabletDisplay = new Display("Tablet");

weatherStation.registerObserver(phoneDisplay);
weatherStation.registerObserver(laptopDisplay);
weatherStation.registerObserver(tabletDisplay);

// When weather changes, all displays get updated
weatherStation.setMeasurements(25, 65);
// Phone Display: Temperature: 25°C, Humidity: 65%
// Laptop Display: Temperature: 25°C, Humidity: 65%
// Tablet Display: Temperature: 25°C, Humidity: 65%

// Remove one observer
weatherStation.removeObserver(tabletDisplay);

// Next update only goes to remaining observers
weatherStation.setMeasurements(26, 70);
// Phone Display: Temperature: 26°C, Humidity: 70%
// Laptop Display: Temperature: 26°C, Humidity: 70%
```

In this example, the `WeatherStation` (subject) maintains a list of `Display` objects (observers) and notifies them automatically when measurements change. This pattern is widely used in implementing event-handling systems.

**Strategy Pattern**

The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from clients that use it.

Example in Python:

```python
from abc import ABC, abstractmethod

# Strategy interface
class PaymentStrategy(ABC):
    @abstractmethod
    def pay(self, amount):
        pass

# Concrete strategies
class CreditCardPayment(PaymentStrategy):
    def __init__(self, card_number, expiry, cvv):
        self.card_number = card_number
        self.expiry = expiry
        self.cvv = cvv
  
    def pay(self, amount):
        # In a real implementation, this would process a credit card payment
        print(f"Paying ${amount} with credit card ending with {self.card_number[-4:]}")
        return True

class PayPalPayment(PaymentStrategy):
    def __init__(self, email, password):
        self.email = email
        self.password = password
  
    def pay(self, amount):
        # In a real implementation, this would process a PayPal payment
        print(f"Paying ${amount} with PayPal account {self.email}")
        return True

class BitcoinPayment(PaymentStrategy):
    def __init__(self, wallet_address):
        self.wallet_address = wallet_address
  
    def pay(self, amount):
        # In a real implementation, this would process a Bitcoin payment
        print(f"Paying ${amount} equivalent in Bitcoin to wallet {self.wallet_address[:8]}...")
        return True

# Context
class ShoppingCart:
    def __init__(self):
        self.items = []
        self.payment_strategy = None
  
    def add_item(self, item, price):
        self.items.append({"item": item, "price": price})
  
    def set_payment_strategy(self, payment_strategy):
        self.payment_strategy = payment_strategy
  
    def checkout(self):
        if not self.payment_strategy:
            raise Exception("Payment strategy not set")
      
        total = sum(item["price"] for item in self.items)
        return self.payment_strategy.pay(total)

# Usage
cart = ShoppingCart()
cart.add_item("Laptop", 1200)
cart.add_item("Headphones", 100)

# First scenario - pay with credit card
credit_card = CreditCardPayment("1234567890123456", "12/25", "123")
cart.set_payment_strategy(credit_card)
cart.checkout()  # Paying $1300 with credit card ending with 3456

# Second scenario - pay with PayPal
paypal = PayPalPayment("email@example.com", "password123")
cart.set_payment_strategy(paypal)
cart.checkout()  # Paying $1300 with PayPal account email@example.com
```

In this example, the `ShoppingCart` class can use different payment methods without knowing the details of how each payment is processed. The payment strategies can be switched at runtime, and new strategies can be added without modifying the shopping cart code.

## Additional Classification: Architectural Patterns

Beyond the GoF patterns, there are higher-level architectural patterns that structure entire applications or systems:

> "Architectural patterns express fundamental structural organization schemas for software systems."

### Example Architectural Patterns:

**Model-View-Controller (MVC)**

MVC divides an application into three interconnected components:

* Model: Manages data and business logic
* View: Handles layout and display
* Controller: Routes commands to the model and view

Example in simplified JavaScript:

```javascript
// Model
class TodoModel {
  constructor() {
    this.todos = [];
    this.observers = [];
  }
  
  addTodo(text) {
    const todo = {
      id: Date.now(),
      text,
      completed: false
    };
    this.todos.push(todo);
    this.notifyObservers();
    return todo;
  }
  
  toggleTodo(id) {
    this.todos = this.todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    this.notifyObservers();
  }
  
  registerObserver(observer) {
    this.observers.push(observer);
  }
  
  notifyObservers() {
    for (const observer of this.observers) {
      observer.update(this.todos);
    }
  }
}

// View
class TodoView {
  constructor() {
    this.todoList = document.getElementById('todo-list');
    this.addButton = document.getElementById('add-button');
    this.todoInput = document.getElementById('todo-input');
  }
  
  render(todos) {
    this.todoList.innerHTML = '';
    todos.forEach(todo => {
      const li = document.createElement('li');
      li.textContent = todo.text;
      li.dataset.id = todo.id;
      if (todo.completed) {
        li.style.textDecoration = 'line-through';
      }
      this.todoList.appendChild(li);
    });
  }
  
  bindAddTodo(handler) {
    this.addButton.addEventListener('click', () => {
      const text = this.todoInput.value.trim();
      if (text) {
        handler(text);
        this.todoInput.value = '';
      }
    });
  }
  
  bindToggleTodo(handler) {
    this.todoList.addEventListener('click', event => {
      if (event.target.tagName === 'LI') {
        const id = parseInt(event.target.dataset.id);
        handler(id);
      }
    });
  }
  
  update(todos) {
    this.render(todos);
  }
}

// Controller
class TodoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  
    // Bind view to model
    this.model.registerObserver(this.view);
  
    // Bind controller methods to view events
    this.view.bindAddTodo(this.addTodo.bind(this));
    this.view.bindToggleTodo(this.toggleTodo.bind(this));
  
    // Initial render
    this.model.notifyObservers();
  }
  
  addTodo(text) {
    this.model.addTodo(text);
  }
  
  toggleTodo(id) {
    this.model.toggleTodo(id);
  }
}

// Usage
const app = new TodoController(new TodoModel(), new TodoView());
```

In this example, the Model manages the todo data, the View handles rendering and user interaction, and the Controller connects the two. This separation of concerns makes the code more maintainable and testable.

## Design Pattern Terminology

Understanding design pattern terminology is essential for effective communication among developers:

1. **Pattern Name** : A descriptive name that identifies the pattern and its purpose.
2. **Intent** : The goal or purpose of the pattern and the problem it addresses.
3. **Motivation** : A scenario illustrating a design problem and how the pattern solves it.
4. **Applicability** : Situations where the pattern can be applied.
5. **Structure** : A graphical representation of the classes and their relationships.
6. **Participants** : The classes and objects participating in the pattern and their responsibilities.
7. **Collaborations** : How participants collaborate to fulfill responsibilities.
8. **Consequences** : The trade-offs and results of using the pattern.
9. **Implementation** : Tips and techniques for implementing the pattern.
10. **Sample Code** : Code examples in a programming language.
11. **Related Patterns** : Other patterns that have similarities or are commonly used together.

## Anti-Patterns: What Not to Do

> "An anti-pattern is a pattern that tells you how to go from a problem to a bad solution."
> — Andrew Koenig

It's also valuable to understand anti-patterns — common approaches that appear to solve a problem but actually create more problems:

### Common Anti-Patterns:

**God Object/Blob**

A God Object is a class that knows too much or does too much. It violates the Single Responsibility Principle.

Example:

```java
// Anti-pattern: God Object
class UserManager {
    private Database db;
    private EmailService emailService;
    private SecurityService securityService;
    private PaymentProcessor paymentProcessor;
  
    public void registerUser(String username, String password, String email) {
        // Validate input
        if (username.length() < 3) {
            throw new ValidationException("Username too short");
        }
        if (password.length() < 8) {
            throw new ValidationException("Password too short");
        }
        if (!email.contains("@")) {
            throw new ValidationException("Invalid email");
        }
      
        // Check if user exists
        if (db.userExists(username)) {
            throw new DuplicateUserException("User already exists");
        }
      
        // Hash password
        String hashedPassword = securityService.hashPassword(password);
      
        // Store in database
        db.createUser(username, hashedPassword, email);
      
        // Send welcome email
        String emailContent = "<html><body><h1>Welcome to our service!</h1></body></html>";
        emailService.sendHtmlEmail(email, "Welcome!", emailContent);
      
        // Initialize user profile
        db.createUserProfile(username);
      
        // Log the registration
        System.out.println("User registered: " + username + " at " + new Date());
    }
  
    public void processPayment(String username, double amount) {
        // Get user
        User user = db.getUser(username);
      
        // Process payment
        PaymentResult result = paymentProcessor.charge(user.getPaymentInfo(), amount);
      
        // Update database
        db.recordPayment(username, amount, result.getTransactionId());
      
        // Send receipt
        emailService.sendHtmlEmail(user.getEmail(), "Payment Receipt", 
                                 "<html><body>Payment of $" + amount + " processed.</body></html>");
    }
  
    // Many more methods for user management, authentication, 
    // password reset, email verification, etc.
}
```

This class violates multiple design principles by handling user registration, validation, database interactions, email sending, payment processing, and more. A better approach would be to split these responsibilities into separate classes.

**Spaghetti Code**

Spaghetti Code refers to code with complex and tangled control flow, often a result of poor structure and excessive use of goto statements or deeply nested conditions.

Example:

```javascript
// Anti-pattern: Spaghetti Code
function processOrder(order) {
  let total = 0;
  let discount = 0;
  let shipping = 0;
  let tax = 0;
  
  // Calculate item totals
  for (let i = 0; i < order.items.length; i++) {
    let item = order.items[i];
    total += item.price * item.quantity;
  
    // Apply item-specific discounts
    if (item.onSale) {
      if (item.quantity > 3) {
        discount += item.price * item.quantity * 0.15;
      } else {
        discount += item.price * item.quantity * 0.1;
      }
    }
  
    // Check for free shipping items
    if (item.freeShipping) {
      item.shippingCost = 0;
    } else {
      if (item.weight < 1) {
        item.shippingCost = 5;
      } else if (item.weight < 5) {
        item.shippingCost = 10;
      } else {
        item.shippingCost = 15;
      }
      shipping += item.shippingCost * item.quantity;
    }
  }
  
  // Apply order-level discounts
  if (total > 100) {
    if (order.customerType === 'premium') {
      discount += total * 0.1;
    } else {
      discount += total * 0.05;
    }
  }
  
  // Calculate tax
  if (order.shippingAddress.country === 'US') {
    if (order.shippingAddress.state === 'CA') {
      tax = (total - discount) * 0.0725;
    } else if (order.shippingAddress.state === 'NY') {
      tax = (total - discount) * 0.08875;
    } else {
      tax = (total - discount) * 0.05;
    }
  }
  
  // Free shipping threshold
  if (total > 50 && order.customerType === 'premium') {
    shipping = 0;
  } else if (total > 100) {
    shipping = 0;
  }
  
  // Calculate final total
  const finalTotal = total - discount + shipping + tax;
  
  // Update order
  order.subtotal = total;
  order.discount = discount;
  order.shipping = shipping;
  order.tax = tax;
  order.total = finalTotal;
  
  return order;
}
```

This code mixes multiple concerns (pricing, discounts, shipping, taxes) into a single hard-to-maintain function. A better approach would involve breaking these into separate, focused functions or classes.

## Benefits of Using Design Patterns

> "Design patterns capture solutions that have developed and evolved over time."

1. **Common Vocabulary** : Patterns provide a shared language for developers to communicate efficiently.
2. **Proven Solutions** : Patterns represent best practices refined over time by experienced developers.
3. **Code Reusability** : Patterns promote reusable design solutions across different contexts.
4. **Higher Abstraction Level** : Patterns allow developers to think at a higher level about architectural concerns.
5. **Design Flexibility** : Patterns often enhance flexibility and adaptability of systems.

## Criticisms and Limitations

While design patterns are valuable tools, they have limitations:

1. **Overuse** : Applying patterns when they're not needed adds unnecessary complexity.
2. **Language Limitations** : Some patterns exist to overcome limitations in programming languages (e.g., Visitor pattern in languages without multiple dispatch).
3. **Performance Overhead** : Some patterns introduce indirection that can impact performance.
4. **Learning Curve** : Understanding when and how to apply patterns requires experience.

## Conclusion

Design patterns provide a structured approach to solving common software design problems. By understanding the classification system and terminology, developers can communicate more effectively and leverage accumulated knowledge to build better software.

Remember that patterns are guidelines, not strict rules. The key is to understand the problem you're solving and choose the appropriate pattern based on your specific context and requirements.

> "Design patterns are not a silver bullet but rather a toolkit for solving problems that have already been encountered and solved by others."

As you gain experience, you'll develop an intuition for when to apply specific patterns and when to create your own solutions based on fundamental design principles.
