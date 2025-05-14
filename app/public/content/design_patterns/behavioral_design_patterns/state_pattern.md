# The State Pattern: Managing State-Dependent Behavior

I'll explain the State pattern from first principles, breaking down how it helps manage complexity when an object's behavior depends on its internal state.

> "The State pattern allows an object to alter its behavior when its internal state changes. The object will appear to change its class." — Design Patterns: Elements of Reusable Object-Oriented Software

## First Principles: The Problem of State-Dependent Behavior

Let's start with a fundamental problem in software: objects that need to behave differently depending on their current state.

Imagine we're building a simple document editor. A document can be in different states:

* Draft
* Under Review
* Approved
* Published

For each state, the document responds differently to the same actions:

* When you call `save()` on a draft, it just updates the file
* When you call `save()` on a document under review, it might notify reviewers
* When you call `save()` on an approved document, it might create a new version
* When you call `save()` on a published document, it might refuse the operation entirely

The naive approach is to use conditional logic:

```java
public class Document {
    private String content;
    private DocumentState state = DocumentState.DRAFT;
  
    public void save() {
        if (state == DocumentState.DRAFT) {
            // Save the draft
            System.out.println("Saving draft...");
            // Update file logic
        } else if (state == DocumentState.UNDER_REVIEW) {
            // Save and notify reviewers
            System.out.println("Saving and notifying reviewers...");
            // Notification logic
        } else if (state == DocumentState.APPROVED) {
            // Create new version
            System.out.println("Creating new version...");
            // Versioning logic
        } else if (state == DocumentState.PUBLISHED) {
            // Refuse operation
            System.out.println("Cannot save published document!");
        }
    }
  
    // Other methods with similar conditional logic
    public void publish() {
        if (state == DocumentState.DRAFT) {
            System.out.println("Cannot publish draft!");
        } else if (state == DocumentState.UNDER_REVIEW) {
            System.out.println("Cannot publish document under review!");
        } else if (state == DocumentState.APPROVED) {
            state = DocumentState.PUBLISHED;
            System.out.println("Document published!");
        } else if (state == DocumentState.PUBLISHED) {
            System.out.println("Document is already published!");
        }
    }
  
    // More methods with conditional logic...
}

enum DocumentState {
    DRAFT, UNDER_REVIEW, APPROVED, PUBLISHED
}
```

This approach has serious problems:

1. **Code duplication** : Each method repeats the same state-checking logic
2. **Scattered logic** : Behavior for a specific state is spread across multiple methods
3. **Maintenance nightmare** : Adding a new state means modifying every method
4. **Violation of Open/Closed Principle** : We need to modify existing code to add new states

## The Insight: Encapsulate State-Specific Behavior

The key insight of the State pattern is to:

1. Extract state-specific behavior into separate classes
2. Let each state class handle the behavior for that state
3. Delegate actions to the current state object

This transforms conditional logic into polymorphic behavior.

## The State Pattern Structure

The State pattern consists of:

1. **Context** : The object whose behavior changes based on its internal state
2. **State interface** : Defines methods that all concrete states must implement
3. **Concrete States** : Implements behavior specific to each state

Here's a visual representation of the pattern:

```
Context                             State
+----------------+                  +----------------+
| - state        |<>-------------->| + handle()     |
| + request()    |                  +----------------+
+----------------+                          ↑
       |                                    |
       |                          +------------------+
       |                          |                  |
       |                +-----------------+  +-----------------+
       |                | ConcreteStateA  |  | ConcreteStateB  |
       |                | + handle()      |  | + handle()      |
       +--------------->+-----------------+  +-----------------+
```

## Implementing the State Pattern

Let's refactor our document example using the State pattern:

```java
// Step 1: Create the State interface
interface DocumentState {
    void save(Document document);
    void review(Document document);
    void approve(Document document);
    void publish(Document document);
}

// Step 2: Implement concrete states
class DraftState implements DocumentState {
    @Override
    public void save(Document document) {
        System.out.println("Saving draft...");
        // Update file logic
    }
  
    @Override
    public void review(Document document) {
        System.out.println("Document sent for review");
        document.setState(new UnderReviewState());
    }
  
    @Override
    public void approve(Document document) {
        System.out.println("Cannot approve a draft!");
    }
  
    @Override
    public void publish(Document document) {
        System.out.println("Cannot publish a draft!");
    }
}

class UnderReviewState implements DocumentState {
    @Override
    public void save(Document document) {
        System.out.println("Saving and notifying reviewers...");
        // Notification logic
    }
  
    @Override
    public void review(Document document) {
        System.out.println("Document is already under review!");
    }
  
    @Override
    public void approve(Document document) {
        System.out.println("Document approved!");
        document.setState(new ApprovedState());
    }
  
    @Override
    public void publish(Document document) {
        System.out.println("Cannot publish a document under review!");
    }
}

// More state implementations...
class ApprovedState implements DocumentState {
    @Override
    public void save(Document document) {
        System.out.println("Creating new version...");
        // Versioning logic
    }
  
    @Override
    public void review(Document document) {
        System.out.println("Approved document sent back for review");
        document.setState(new UnderReviewState());
    }
  
    @Override
    public void approve(Document document) {
        System.out.println("Document is already approved!");
    }
  
    @Override
    public void publish(Document document) {
        System.out.println("Document published!");
        document.setState(new PublishedState());
    }
}

class PublishedState implements DocumentState {
    @Override
    public void save(Document document) {
        System.out.println("Cannot save published document!");
    }
  
    @Override
    public void review(Document document) {
        System.out.println("Cannot review published document!");
    }
  
    @Override
    public void approve(Document document) {
        System.out.println("Published document is already approved!");
    }
  
    @Override
    public void publish(Document document) {
        System.out.println("Document is already published!");
    }
}

// Step 3: Create the Context class
public class Document {
    private String content;
    private DocumentState state;
  
    // Initialize with the default state
    public Document() {
        this.state = new DraftState();
    }
  
    // Setter for state
    public void setState(DocumentState state) {
        this.state = state;
    }
  
    // Methods delegate to the current state
    public void save() {
        state.save(this);
    }
  
    public void review() {
        state.review(this);
    }
  
    public void approve() {
        state.approve(this);
    }
  
    public void publish() {
        state.publish(this);
    }
}
```

## Using the State Pattern

Here's an example of how to use our State pattern implementation:

```java
public class StatePatternDemo {
    public static void main(String[] args) {
        Document document = new Document();
      
        // Document starts in Draft state
        document.save();    // Output: Saving draft...
      
        // Move to Under Review state
        document.review();  // Output: Document sent for review
        document.save();    // Output: Saving and notifying reviewers...
      
        // Try to publish directly (not allowed)
        document.publish(); // Output: Cannot publish a document under review!
      
        // Approve the document
        document.approve(); // Output: Document approved!
      
        // Now we can publish
        document.publish(); // Output: Document published!
      
        // Try to save again
        document.save();    // Output: Cannot save published document!
    }
}
```

## Benefits of the State Pattern

Let's analyze what we've achieved:

1. **Encapsulation of state-specific behavior** : Each state's behavior is contained in its own class.
2. **Elimination of conditional logic** : No more if-else chains or switch statements.
3. **Single Responsibility Principle** : Each state class has one responsibility - handling behavior for that state.
4. **Open/Closed Principle** : We can add new states without modifying existing states.
5. **State transitions are explicit** : They happen in the state classes themselves.
6. **Enhanced readability** : It's clear what behavior is associated with each state.

> "Program to an interface, not an implementation." — Design Patterns

## Real-World Examples of the State Pattern

### Example 1: Order Processing System

An order can be in various states: New, Paid, Shipped, Delivered, Canceled. Each state handles operations like `pay()`, `ship()`, `deliver()`, `cancel()` differently:

```java
interface OrderState {
    void pay(Order order);
    void ship(Order order);
    void deliver(Order order);
    void cancel(Order order);
}

class NewOrderState implements OrderState {
    @Override
    public void pay(Order order) {
        System.out.println("Payment received!");
        order.setState(new PaidOrderState());
    }
  
    @Override
    public void ship(Order order) {
        System.out.println("Cannot ship unpaid order!");
    }
  
    // Other methods...
}

// Other state implementations...

public class Order {
    private OrderState state;
    private String orderId;
  
    public Order(String orderId) {
        this.orderId = orderId;
        this.state = new NewOrderState();
    }
  
    // State delegation methods...
}
```

### Example 2: Media Player

A media player can be in states like Playing, Paused, Stopped. Each state handles operations like `play()`, `pause()`, `stop()` differently:

```java
interface PlayerState {
    void play(MediaPlayer player);
    void pause(MediaPlayer player);
    void stop(MediaPlayer player);
}

class PlayingState implements PlayerState {
    @Override
    public void play(MediaPlayer player) {
        System.out.println("Already playing!");
    }
  
    @Override
    public void pause(MediaPlayer player) {
        System.out.println("Pausing playback");
        player.setState(new PausedState());
    }
  
    @Override
    public void stop(MediaPlayer player) {
        System.out.println("Stopping playback");
        player.setState(new StoppedState());
    }
}

// Other state implementations...

public class MediaPlayer {
    private PlayerState state;
    private String currentTrack;
  
    public MediaPlayer() {
        this.state = new StoppedState();
    }
  
    // State delegation methods...
}
```

## State Pattern in JavaScript

The pattern is language-agnostic. Here's how it might look in JavaScript:

```javascript
// State interface (implicitly defined through duck typing)
class Document {
    constructor() {
        // Default state
        this.state = new DraftState();
    }
  
    setState(state) {
        this.state = state;
    }
  
    save() {
        this.state.save(this);
    }
  
    review() {
        this.state.review(this);
    }
  
    approve() {
        this.state.approve(this);
    }
  
    publish() {
        this.state.publish(this);
    }
}

// Concrete states
class DraftState {
    save(document) {
        console.log("Saving draft...");
    }
  
    review(document) {
        console.log("Document sent for review");
        document.setState(new UnderReviewState());
    }
  
    approve(document) {
        console.log("Cannot approve a draft!");
    }
  
    publish(document) {
        console.log("Cannot publish a draft!");
    }
}

// Other state implementations...

// Usage
const doc = new Document();
doc.save();    // "Saving draft..."
doc.review();  // "Document sent for review"
doc.save();    // Would call the UnderReviewState's save method
```

## State Pattern in Python

Here's how the State pattern might be implemented in Python:

```python
from abc import ABC, abstractmethod

# State interface
class DocumentState(ABC):
    @abstractmethod
    def save(self, document):
        pass
  
    @abstractmethod
    def review(self, document):
        pass
  
    @abstractmethod
    def approve(self, document):
        pass
  
    @abstractmethod
    def publish(self, document):
        pass

# Concrete states
class DraftState(DocumentState):
    def save(self, document):
        print("Saving draft...")
  
    def review(self, document):
        print("Document sent for review")
        document.set_state(UnderReviewState())
  
    def approve(self, document):
        print("Cannot approve a draft!")
  
    def publish(self, document):
        print("Cannot publish a draft!")

# Other state implementations...

# Context
class Document:
    def __init__(self):
        self._state = DraftState()
  
    def set_state(self, state):
        self._state = state
  
    def save(self):
        self._state.save(self)
  
    def review(self):
        self._state.review(self)
  
    def approve(self):
        self._state.approve(self)
  
    def publish(self):
        self._state.publish(self)

# Usage
doc = Document()
doc.save()     # "Saving draft..."
doc.review()   # "Document sent for review"
```

## Common Variations and Extensions

### State Pattern with History

Sometimes you need to remember previous states:

```java
public class DocumentWithHistory {
    private DocumentState state;
    private Stack<DocumentState> history = new Stack<>();
  
    // ... other methods
  
    public void setState(DocumentState state) {
        history.push(this.state); // Save current state to history
        this.state = state;
    }
  
    public void undo() {
        if (!history.isEmpty()) {
            this.state = history.pop();
            System.out.println("Returned to previous state");
        } else {
            System.out.println("No history to undo");
        }
    }
}
```

### Shared State vs. Instance State

Sometimes, state objects can be shared across multiple contexts:

```java
// Singleton state objects
class SharedDraftState implements DocumentState {
    private static final SharedDraftState instance = new SharedDraftState();
  
    private SharedDraftState() {}
  
    public static SharedDraftState getInstance() {
        return instance;
    }
  
    // ... state methods
}

// Usage:
document.setState(SharedDraftState.getInstance());
```

### State with State Data

Sometimes states need to maintain their own data:

```java
class UnderReviewState implements DocumentState {
    private List<String> reviewers;
    private Date reviewStartDate;
  
    public UnderReviewState(List<String> reviewers) {
        this.reviewers = reviewers;
        this.reviewStartDate = new Date();
    }
  
    // ... state methods that can use reviewers and reviewStartDate
}
```

## When to Use the State Pattern

Use the State pattern when:

1. An object's behavior depends on its state, and it must change behavior at runtime
2. Operations have large, multipart conditional statements that depend on the object's state
3. State transitions are explicit and need to be managed carefully
4. You want to avoid "state explosion" in a single class

> "Favor composition over inheritance." — Design Patterns

The State pattern uses composition (the Context has a State) rather than inheritance to vary behavior.

## When Not to Use the State Pattern

Consider alternatives when:

1. The number of states is small and unlikely to change
2. The state-dependent behavior is simple and limited to a few operations
3. Performance is critical (the pattern adds objects)

## Potential Pitfalls

1. **Proliferation of classes** : Each state requires a new class
2. **State transition management** : Can become complex if not well-designed
3. **Shared state** : Be careful with state objects that maintain their own data
4. **Circular dependencies** : The context and state objects reference each other

## The State Pattern vs. Strategy Pattern

These patterns are structurally similar but have different intents:

* **State Pattern** : Allows an object to change its behavior when its internal state changes
* **Strategy Pattern** : Allows selecting an algorithm at runtime

In the State pattern, states often know about each other for transitions. In the Strategy pattern, strategies are typically independent and unaware of each other.

## Summary: Key Principles of the State Pattern

1. **Encapsulate what varies** : State-specific behaviors are encapsulated in separate classes
2. **Delegate instead of conditional logic** : Context delegates to state objects instead of using conditionals
3. **Open/Closed Principle** : New states can be added without modifying existing code
4. **Single Responsibility Principle** : Each state class has one responsibility
5. **Program to interfaces** : Context depends on the State interface, not concrete implementations

The State pattern transforms the problem of maintaining complex state-dependent behavior into a cleaner, more maintainable object-oriented solution.

Would you like me to explore any particular aspect of the State pattern in more depth?
