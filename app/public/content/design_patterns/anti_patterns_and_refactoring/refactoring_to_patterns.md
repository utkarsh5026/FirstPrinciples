# Refactoring to Patterns in Software Design

Refactoring to patterns represents an important evolution in software development that bridges the gap between two powerful ideas: refactoring and design patterns. I'll explain this concept thoroughly from first principles, building your understanding step by step.

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler

## First Principles: What Is Refactoring?

Refactoring is the process of changing a software system in such a way that it does not alter the external behavior of the code, yet improves its internal structure. It's like reorganizing a cluttered room without throwing anything away—the room contains the same items, but becomes more functional and pleasant to use.

The fundamental purpose of refactoring is to make code more maintainable, readable, and extensible without changing what the code does from the user's perspective.

### Key Characteristics of Refactoring:

1. **Preserves behavior** : The external functionality remains unchanged.
2. **Improves internal quality** : The structure becomes cleaner, simpler, or more efficient.
3. **Proceeds in small steps** : Changes are made incrementally, not all at once.
4. **Regular practice** : It's not a one-time activity but a continuous process.

### Example of Simple Refactoring:

Consider this function that calculates the total price including tax:

```javascript
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  total = total * 1.2; // Adding 20% tax
  return total;
}
```

We can refactor this to:

```javascript
function calculateTotal(items) {
  const subtotal = calculateSubtotal(items);
  return applyTax(subtotal);
}

function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function applyTax(amount) {
  const TAX_RATE = 1.2;
  return amount * TAX_RATE;
}
```

This refactored version is more readable, each function has a single responsibility, and constants are named rather than using magic numbers—but the behavior is identical.

## First Principles: What Are Design Patterns?

Design patterns are proven solutions to common problems in software design. They represent best practices evolved over time by experienced software developers.

> "Design patterns are reusable solutions to commonly occurring problems in software design."

A design pattern isn't code you copy-paste, but a general concept for solving a particular problem. It's like an architectural blueprint that can be implemented in many different ways.

### Key Characteristics of Design Patterns:

1. **Reusable** : They can be applied across different projects and contexts.
2. **Proven** : They've been tested and validated by many developers over time.
3. **Expressive** : They establish a common vocabulary among developers.
4. **Contextual** : Not every pattern is suitable for every situation.

### Example of a Simple Design Pattern:

The **Factory Method** pattern provides an interface for creating objects but allows subclasses to decide which classes to instantiate:

```javascript
// Without a pattern
function createUIElement(type) {
  if (type === 'button') {
    return new Button();
  } else if (type === 'checkbox') {
    return new Checkbox();
  } else if (type === 'textfield') {
    return new TextField();
  }
  // More elements...
}

// With Factory Method pattern
class UIFactory {
  createElement(type) {
    const element = this.createElement(type);
    element.render();
    return element;
  }
  
  createElement(type) {
    throw new Error("This method should be overridden");
  }
}

class WebUIFactory extends UIFactory {
  createElement(type) {
    if (type === 'button') return new WebButton();
    if (type === 'checkbox') return new WebCheckbox();
    // More elements...
  }
}

class MobileUIFactory extends UIFactory {
  createElement(type) {
    if (type === 'button') return new MobileButton();
    if (type === 'checkbox') return new MobileCheckbox();
    // More elements...
  }
}
```

The pattern allows us to create different types of UI elements for different platforms while keeping the creation logic separate from the client code.

## The Marriage: Refactoring to Patterns

"Refactoring to Patterns" is an approach popularized by Joshua Kerievsky in his book of the same name. It combines the incremental nature of refactoring with the destination of well-established design patterns.

> "Refactoring to patterns means using refactoring to make a design pattern emerge from your code when the pattern brings demonstrable value."

Rather than forcing patterns onto your code from the start (which can lead to overengineering), you refactor toward patterns only when they provide a clear benefit to address a specific issue.

### Key Principles of Refactoring to Patterns:

1. **Use patterns as targets, not blueprints** : Move toward patterns as needed, rather than implementing them from the start.
2. **Focus on simplicity first** : Start with simple code and evolve it through refactoring.
3. **Respond to actual problems** : Don't anticipate problems with speculative patterns.
4. **Know when to stop** : Sometimes, simpler solutions are better than full pattern implementations.

### Real-World Example: Refactoring to Strategy Pattern

Let's look at a concrete example of refactoring to the Strategy pattern. The Strategy pattern allows you to define a family of algorithms, encapsulate each one, and make them interchangeable.

**Initial Code (with problems):**

```javascript
class ShoppingCart {
  constructor(discountType) {
    this.discountType = discountType;
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }

  calculateTotal() {
    let subtotal = 0;
    for (const item of this.items) {
      subtotal += item.price;
    }
  
    // Problem: Complex conditional logic for different discount strategies
    if (this.discountType === 'regular') {
      return subtotal; // No discount
    } else if (this.discountType === 'premium') {
      return subtotal * 0.9; // 10% discount
    } else if (this.discountType === 'vip') {
      return subtotal * 0.8; // 20% discount
    } else if (this.discountType === 'seasonal') {
      const today = new Date();
      // Extra 5% off during December
      if (today.getMonth() === 11) {
        return subtotal * 0.85;
      }
      return subtotal * 0.9;
    }
    return subtotal;
  }
}
```

**Problems with this code:**

* The `calculateTotal` method is doing too much
* Adding a new discount type requires modifying the class
* The discount logic is mixed with the cart logic
* Testing different discount scenarios is difficult

**Step 1: Extract Method**

```javascript
class ShoppingCart {
  constructor(discountType) {
    this.discountType = discountType;
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }

  calculateTotal() {
    const subtotal = this.calculateSubtotal();
    return this.applyDiscount(subtotal);
  }
  
  calculateSubtotal() {
    let subtotal = 0;
    for (const item of this.items) {
      subtotal += item.price;
    }
    return subtotal;
  }
  
  applyDiscount(subtotal) {
    if (this.discountType === 'regular') {
      return subtotal; // No discount
    } else if (this.discountType === 'premium') {
      return subtotal * 0.9; // 10% discount
    } else if (this.discountType === 'vip') {
      return subtotal * 0.8; // 20% discount
    } else if (this.discountType === 'seasonal') {
      const today = new Date();
      if (today.getMonth() === 11) {
        return subtotal * 0.85;
      }
      return subtotal * 0.9;
    }
    return subtotal;
  }
}
```

**Step 2: Move Toward Strategy Pattern**

```javascript
// Strategy interface
class DiscountStrategy {
  applyDiscount(subtotal) {
    throw new Error("This method should be overridden");
  }
}

// Concrete strategies
class RegularDiscountStrategy extends DiscountStrategy {
  applyDiscount(subtotal) {
    return subtotal; // No discount
  }
}

class PremiumDiscountStrategy extends DiscountStrategy {
  applyDiscount(subtotal) {
    return subtotal * 0.9; // 10% discount
  }
}

class VIPDiscountStrategy extends DiscountStrategy {
  applyDiscount(subtotal) {
    return subtotal * 0.8; // 20% discount
  }
}

class SeasonalDiscountStrategy extends DiscountStrategy {
  applyDiscount(subtotal) {
    const today = new Date();
    if (today.getMonth() === 11) {
      return subtotal * 0.85; // Extra 5% off during December
    }
    return subtotal * 0.9;
  }
}

// Refactored ShoppingCart
class ShoppingCart {
  constructor(discountStrategy) {
    this.discountStrategy = discountStrategy;
    this.items = [];
  }

  addItem(item) {
    this.items.push(item);
  }

  calculateTotal() {
    const subtotal = this.calculateSubtotal();
    return this.discountStrategy.applyDiscount(subtotal);
  }
  
  calculateSubtotal() {
    let subtotal = 0;
    for (const item of this.items) {
      subtotal += item.price;
    }
    return subtotal;
  }
  
  setDiscountStrategy(discountStrategy) {
    this.discountStrategy = discountStrategy;
  }
}
```

**Step 3: Using the Refactored Code**

```javascript
// Example of using the refactored code
const regularCart = new ShoppingCart(new RegularDiscountStrategy());
regularCart.addItem({ name: "Book", price: 20 });
regularCart.addItem({ name: "Pen", price: 5 });
console.log("Regular customer total:", regularCart.calculateTotal());

// Easy to switch strategies
regularCart.setDiscountStrategy(new VIPDiscountStrategy());
console.log("Same cart with VIP discount:", regularCart.calculateTotal());

// Easy to add new strategies without modifying existing code
class EmployeeDiscountStrategy extends DiscountStrategy {
  applyDiscount(subtotal) {
    return subtotal * 0.7; // 30% employee discount
  }
}

regularCart.setDiscountStrategy(new EmployeeDiscountStrategy());
console.log("Same cart with employee discount:", regularCart.calculateTotal());
```

**Benefits of the Refactored Code:**

* The `ShoppingCart` class only manages cart functionality
* New discount strategies can be added without changing existing code
* Each strategy is encapsulated and can be tested independently
* Strategies can be switched at runtime
* The code follows the Open/Closed Principle (open for extension, closed for modification)

This example demonstrates how we incrementally refactored toward the Strategy pattern to solve a specific problem: complex conditional logic for discount calculation. We didn't start with the pattern; we let it emerge through refactoring when it became clear that the pattern would improve our code.

## Common Patterns to Refactor Toward

Here are some common design patterns that are frequently targets of refactoring:

### 1. Factory Method

**When to refactor toward it:** When object creation logic becomes complex, or when you need to create objects without specifying their exact class.

**Example smell:** Large `switch` or `if-else` chains that create different object types.

```javascript
// Before refactoring
function createShape(type) {
  if (type === 'circle') {
    return new Circle();
  } else if (type === 'square') {
    return new Square();
  } else if (type === 'triangle') {
    return new Triangle();
  }
  throw new Error('Unknown shape type');
}

// After refactoring to Factory Method
class ShapeFactory {
  createShape(type) {
    if (type === 'circle') {
      return new Circle();
    } else if (type === 'square') {
      return new Square();
    } else if (type === 'triangle') {
      return new Triangle();
    }
    throw new Error('Unknown shape type');
  }
}

// Can be further refined with subclasses for different types of factories
```

### 2. Observer

**When to refactor toward it:** When objects need to be notified of changes in other objects without tight coupling.

**Example smell:** Multiple direct calls to update dependent objects when a state changes.

```javascript
// Before refactoring
class WeatherStation {
  constructor() {
    this.temperature = 0;
    this.display1 = new Display1();
    this.display2 = new Display2();
    this.logger = new Logger();
  }
  
  setTemperature(temp) {
    this.temperature = temp;
    // Direct calls to all dependent objects
    this.display1.update(temp);
    this.display2.update(temp);
    this.logger.log(temp);
  }
}

// After refactoring to Observer
class WeatherStation {
  constructor() {
    this.temperature = 0;
    this.observers = [];
  }
  
  addObserver(observer) {
    this.observers.push(observer);
  }
  
  removeObserver(observer) {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }
  
  setTemperature(temp) {
    this.temperature = temp;
    this.notifyObservers();
  }
  
  notifyObservers() {
    for (const observer of this.observers) {
      observer.update(this.temperature);
    }
  }
}

// Using the observer pattern
const station = new WeatherStation();
station.addObserver(new Display1());
station.addObserver(new Display2());
station.addObserver(new Logger());
```

### 3. Composite

**When to refactor toward it:** When you need to treat individual objects and compositions of objects uniformly.

**Example smell:** Special case logic for handling collections vs. single items.

```javascript
// Before refactoring
class FileSystem {
  printFileNames(item) {
    if (item.isDirectory) {
      console.log(`Directory: ${item.name}`);
      for (const child of item.children) {
        this.printFileNames(child);
      }
    } else {
      console.log(`File: ${item.name}`);
    }
  }
}

// After refactoring to Composite
class FileSystemItem {
  constructor(name) {
    this.name = name;
  }
  
  print() {
    throw new Error("This method should be overridden");
  }
}

class File extends FileSystemItem {
  print() {
    console.log(`File: ${this.name}`);
  }
}

class Directory extends FileSystemItem {
  constructor(name) {
    super(name);
    this.children = [];
  }
  
  add(item) {
    this.children.push(item);
  }
  
  print() {
    console.log(`Directory: ${this.name}`);
    for (const child of this.children) {
      child.print();
    }
  }
}

// Usage becomes simpler
const root = new Directory('root');
const docs = new Directory('docs');
root.add(docs);
docs.add(new File('resume.pdf'));
docs.add(new File('photo.jpg'));
root.print(); // Uniform treatment of both files and directories
```

## The Process of Refactoring to Patterns

The process of refactoring to patterns follows a systematic approach:

1. **Identify code smells** : Recognize problems in your code, such as duplicated code, large classes, or complex conditional logic.
2. **Determine the appropriate pattern** : Based on the smell, identify a pattern that might solve the problem effectively.
3. **Apply basic refactorings** : Use small, safe refactorings to move your code incrementally toward the pattern.
4. **Test frequently** : Ensure that each small refactoring preserves behavior by running tests after each change.
5. **Evaluate the results** : Assess whether the pattern has improved your code and solved the initial problem.

> "The best way to use patterns is to first solve a problem without them, and then apply patterns to generalize a solution."

### Code Smells That Suggest Pattern Refactoring

1. **Switch statements or large if-else chains** : May indicate a need for Strategy, State, or Factory Method patterns.
2. **Duplicated code with slight variations** : May benefit from Template Method or Strategy patterns.
3. **High coupling between classes** : May need Observer, Mediator, or Facade patterns.
4. **Large classes with many responsibilities** : May need to be broken down using Composite, Decorator, or Chain of Responsibility patterns.
5. **Complex object creation** : May call for Builder, Factory Method, or Abstract Factory patterns.

## Advanced Example: Refactoring to Command Pattern

Let's look at another example where we refactor toward the Command pattern to solve a problem with complex user interface actions.

**Initial Code (with problems):**

```javascript
class Editor {
  constructor() {
    this.content = "";
    this.setupButtons();
  }
  
  setupButtons() {
    document.getElementById("copyButton").addEventListener("click", () => {
      // Copy logic
      navigator.clipboard.writeText(this.content);
    });
  
    document.getElementById("cutButton").addEventListener("click", () => {
      // Cut logic
      navigator.clipboard.writeText(this.content);
      this.content = "";
      this.updateUI();
    });
  
    document.getElementById("pasteButton").addEventListener("click", async () => {
      // Paste logic
      const text = await navigator.clipboard.readText();
      this.content += text;
      this.updateUI();
    });
  
    document.getElementById("undoButton").addEventListener("click", () => {
      // Problem: No undo functionality implemented yet
      alert("Undo not implemented");
    });
  }
  
  updateUI() {
    document.getElementById("editor").textContent = this.content;
  }
}
```

**Problems with this code:**

* Action logic is mixed with the UI event handling
* No history tracking for undo functionality
* Adding new commands requires modifying the Editor class
* Hard to test the action logic separately from the UI

**Step 1: Extract Methods for Actions**

```javascript
class Editor {
  constructor() {
    this.content = "";
    this.setupButtons();
  }
  
  setupButtons() {
    document.getElementById("copyButton").addEventListener("click", () => {
      this.copy();
    });
  
    document.getElementById("cutButton").addEventListener("click", () => {
      this.cut();
    });
  
    document.getElementById("pasteButton").addEventListener("click", async () => {
      await this.paste();
    });
  
    document.getElementById("undoButton").addEventListener("click", () => {
      alert("Undo not implemented");
    });
  }
  
  copy() {
    navigator.clipboard.writeText(this.content);
  }
  
  cut() {
    navigator.clipboard.writeText(this.content);
    this.content = "";
    this.updateUI();
  }
  
  async paste() {
    const text = await navigator.clipboard.readText();
    this.content += text;
    this.updateUI();
  }
  
  updateUI() {
    document.getElementById("editor").textContent = this.content;
  }
}
```

**Step 2: Refactor to Command Pattern**

```javascript
// Command interface
class EditorCommand {
  execute() {
    throw new Error("This method should be overridden");
  }
  
  undo() {
    throw new Error("This method should be overridden");
  }
}

// Concrete Commands
class CopyCommand extends EditorCommand {
  constructor(editor) {
    super();
    this.editor = editor;
  }
  
  execute() {
    navigator.clipboard.writeText(this.editor.content);
    // Copy doesn't change state, so we don't need to store previous state
  }
  
  undo() {
    // Nothing to undo for a copy operation
  }
}

class CutCommand extends EditorCommand {
  constructor(editor) {
    super();
    this.editor = editor;
    this.previousContent = "";
  }
  
  execute() {
    this.previousContent = this.editor.content;
    navigator.clipboard.writeText(this.editor.content);
    this.editor.content = "";
    this.editor.updateUI();
  }
  
  undo() {
    this.editor.content = this.previousContent;
    this.editor.updateUI();
  }
}

class PasteCommand extends EditorCommand {
  constructor(editor) {
    super();
    this.editor = editor;
    this.previousContent = "";
    this.pastedText = "";
  }
  
  async execute() {
    this.previousContent = this.editor.content;
    this.pastedText = await navigator.clipboard.readText();
    this.editor.content += this.pastedText;
    this.editor.updateUI();
  }
  
  undo() {
    this.editor.content = this.previousContent;
    this.editor.updateUI();
  }
}

// Command invoker with history
class CommandHistory {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }
  
  push(command) {
    // If we executed some commands and then added a new one,
    // we need to clear the redo stack
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
  
    this.history.push(command);
    this.currentIndex = this.history.length - 1;
  }
  
  undo() {
    if (this.currentIndex >= 0) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
      return true;
    }
    return false;
  }
  
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
      return true;
    }
    return false;
  }
}

// Refactored Editor
class Editor {
  constructor() {
    this.content = "";
    this.history = new CommandHistory();
    this.setupButtons();
  }
  
  setupButtons() {
    document.getElementById("copyButton").addEventListener("click", async () => {
      const command = new CopyCommand(this);
      await command.execute();
      // We don't add copy to history as it doesn't modify state
    });
  
    document.getElementById("cutButton").addEventListener("click", async () => {
      const command = new CutCommand(this);
      await command.execute();
      this.history.push(command);
    });
  
    document.getElementById("pasteButton").addEventListener("click", async () => {
      const command = new PasteCommand(this);
      await command.execute();
      this.history.push(command);
    });
  
    document.getElementById("undoButton").addEventListener("click", () => {
      if (!this.history.undo()) {
        alert("Nothing to undo");
      }
    });
  
    document.getElementById("redoButton").addEventListener("click", async () => {
      if (!this.history.redo()) {
        alert("Nothing to redo");
      }
    });
  }
  
  updateUI() {
    document.getElementById("editor").textContent = this.content;
  }
}
```

**Benefits of the Refactored Code:**

* Each command is encapsulated in its own class
* Commands maintain the state needed for undo/redo
* The Editor class is decoupled from specific command implementations
* New commands can be added without modifying existing code
* Commands can be tested independently of the UI
* We now have a robust undo/redo mechanism

## Best Practices for Refactoring to Patterns

1. **Start with tests** : Ensure you have good test coverage before refactoring to preserve behavior.
2. **Keep changes small** : Apply many small refactorings rather than one big change.
3. **Know your patterns** : Understand the intent and consequences of the patterns you're refactoring toward.
4. **Don't overdo it** : Sometimes a partial pattern implementation is sufficient; don't force patterns where they don't fit.
5. **Maintain balance** : Balance pattern usage with code simplicity. Sometimes simpler code is better than a perfect pattern implementation.

> "The purpose of patterns is not to be the goal itself, but to help achieve the goal of well-designed code."

### Common Anti-patterns to Avoid

1. **Pattern obsession** : Forcing patterns into code where they aren't needed.
2. **Premature pattern application** : Implementing patterns before the code shows a clear need for them.
3. **Pattern overcomplication** : Using complex patterns when simpler solutions would work.
4. **Refactoring without tests** : Changing code structure without a safety net.
5. **Big-bang refactoring** : Trying to implement a pattern completely in one giant step.

## Conclusion

Refactoring to patterns is a powerful approach that combines the incremental safety of refactoring with the proven solutions of design patterns. By identifying code smells and gradually moving toward appropriate patterns, you can improve your code's structure while maintaining its behavior.

The key takeaway is to let patterns emerge from your code as needed, rather than forcing patterns into your design from the start. This approach leads to more maintainable, flexible, and extensible software that adapts naturally to changing requirements.

> "The best designs evolve; they are not merely invented."

Remember that patterns are tools to help solve specific problems, not goals in themselves. By focusing on addressing concrete issues in your code through careful refactoring, you'll naturally gravitate toward elegant solutions that may align with established patterns—or create new patterns of your own.
