# The Template Method Pattern: A First Principles Approach

I'll explain the Template Method pattern from absolute first principles, exploring how it creates algorithmic skeletons for software while providing concrete examples along the way.

> The Template Method pattern is one of the most elegant expressions of code reuse in object-oriented programming. It captures the essence of abstraction by defining the skeleton of an algorithm while allowing subclasses to redefine certain steps without changing the algorithm's structure.

## First Principles: What Is An Algorithm?

Before diving into the Template Method pattern, let's understand what an algorithm is from first principles:

An algorithm is a step-by-step procedure for solving a problem or accomplishing a task. Think of it as a recipe:

1. It has a clear beginning and end
2. It consists of a sequence of well-defined steps
3. It produces a result when followed correctly

Consider a simple algorithm for making tea:

* Boil water
* Add tea leaves to a cup
* Pour hot water into the cup
* Let it steep for a few minutes
* Remove the tea leaves or bag
* Add optional ingredients (sugar, milk, etc.)
* Serve

## The Problem: Algorithmic Variations

In software, we often encounter algorithms that follow the same general structure but differ in specific details. For instance, consider document processing:

1. Open the document
2. Read the content
3. Process the content
4. Save the result
5. Close the document

This algorithm works for many document types (text files, PDFs, spreadsheets), but the exact implementation of each step varies based on the document type.

The challenge: How do we reuse the common structure while allowing for customization of the specific steps?

## The Template Method Pattern Solution

The Template Method pattern solves this problem by:

1. Defining the skeleton of an algorithm in a method (the template method)
2. Deferring some steps to subclasses
3. Letting subclasses redefine certain steps without changing the algorithm's structure

> The beauty of the Template Method lies in its separation of concerns: the parent class controls the overall algorithm flow, while the child classes handle specific implementation details.

## The Pattern Structure from First Principles

The Template Method pattern consists of:

1. **Abstract Class** : Contains the template method that defines the algorithm's skeleton and abstract operations that subclasses must implement.
2. **Concrete Classes** : Implement the abstract operations, providing specific behavior for steps of the algorithm.

Let's illustrate this with a simple example:

```java
// The Abstract Class
abstract class Beverage {
    // The template method - final so it cannot be overridden
    final void prepareBeverage() {
        boilWater();
        brew();           // Abstract step
        pourInCup();
        if (customerWantsCondiments()) {
            addCondiments();  // Abstract step
        }
    }
  
    // Common implementation
    private void boilWater() {
        System.out.println("Boiling water");
    }
  
    private void pourInCup() {
        System.out.println("Pouring into cup");
    }
  
    // Abstract methods that subclasses must implement
    abstract void brew();
    abstract void addCondiments();
  
    // Hook method - provides default implementation but can be overridden
    boolean customerWantsCondiments() {
        return true;  // Default is yes
    }
}

// Concrete Class 1
class Tea extends Beverage {
    @Override
    void brew() {
        System.out.println("Steeping the tea");
    }
  
    @Override
    void addCondiments() {
        System.out.println("Adding lemon");
    }
}

// Concrete Class 2
class Coffee extends Beverage {
    @Override
    void brew() {
        System.out.println("Dripping coffee through filter");
    }
  
    @Override
    void addCondiments() {
        System.out.println("Adding sugar and milk");
    }
  
    @Override
    boolean customerWantsCondiments() {
        // Implementation to ask customer
        return false;  // This customer doesn't want condiments
    }
}
```

Let's break down what's happening in this example:

1. `Beverage` defines the template method `prepareBeverage()` which outlines the algorithm for making a beverage.
2. Some steps (like `boilWater()` and `pourInCup()`) are implemented in the abstract class because they're the same for all beverages.
3. Other steps (like `brew()` and `addCondiments()`) are abstract and must be implemented by subclasses.
4. `customerWantsCondiments()` is a hook method - it has a default implementation but can be overridden by subclasses.

## Key Concepts Explained

Let's explore the key concepts of the Template Method pattern in greater detail:

### 1. The Template Method

This is the core of the pattern. It defines the algorithm's structure as a sequence of steps, some of which are implemented in the abstract class and others deferred to subclasses.

> Think of the template method as an architectural blueprint, specifying the overall design but leaving certain details for later customization.

In our example, `prepareBeverage()` is the template method. It orchestrates the entire algorithm for making a beverage, calling other methods in a specific sequence.

### 2. Abstract Operations

These are the methods that must be implemented by concrete subclasses. They represent the steps that vary between different implementations of the algorithm.

In our example, `brew()` and `addCondiments()` are abstract operations. Their implementation varies depending on whether we're making tea or coffee.

### 3. Concrete Operations

These are methods with implementations in the abstract class. They represent the steps that are common to all variations of the algorithm.

In our example, `boilWater()` and `pourInCup()` are concrete operations. They're the same regardless of whether we're making tea or coffee.

### 4. Hook Methods

These are methods with default implementations in the abstract class that can be overridden by subclasses if needed. They provide additional customization points.

In our example, `customerWantsCondiments()` is a hook method. It returns `true` by default, but the `Coffee` class overrides it to check whether the customer wants condiments.

## A More Practical Example: Document Processing

Let's consider a more practical example related to document processing:

```java
// Abstract document processor
abstract class DocumentProcessor {
    // Template method
    public final void processDocument(String document) {
        openDocument(document);
        String content = extractContent();
        String processedContent = processContent(content);
        saveDocument(processedContent);
        closeDocument();
    }
  
    // Common implementations
    protected void openDocument(String document) {
        System.out.println("Opening document: " + document);
    }
  
    protected void closeDocument() {
        System.out.println("Closing document");
    }
  
    // Abstract methods for subclasses to implement
    protected abstract String extractContent();
    protected abstract String processContent(String content);
  
    // Hook method with default implementation
    protected void saveDocument(String content) {
        System.out.println("Saving document with content length: " + content.length());
    }
}

// Text document processor
class TextDocumentProcessor extends DocumentProcessor {
    @Override
    protected String extractContent() {
        System.out.println("Extracting text from document");
        return "Sample text content";
    }
  
    @Override
    protected String processContent(String content) {
        System.out.println("Processing text content");
        return content.toUpperCase();  // Convert to uppercase
    }
}

// CSV document processor
class CSVDocumentProcessor extends DocumentProcessor {
    @Override
    protected String extractContent() {
        System.out.println("Extracting data from CSV");
        return "name,age,email";
    }
  
    @Override
    protected String processContent(String content) {
        System.out.println("Processing CSV data");
        // Convert CSV to JSON (simplified)
        return "{data: [" + content + "]}";
    }
  
    @Override
    protected void saveDocument(String content) {
        System.out.println("Saving processed CSV as JSON");
        super.saveDocument(content);
    }
}
```

In this example:

1. `DocumentProcessor` defines the template method `processDocument()` that outlines the algorithm for processing a document.
2. `TextDocumentProcessor` and `CSVDocumentProcessor` implement the abstract methods to provide specific behavior for different document types.
3. `CSVDocumentProcessor` overrides the hook method `saveDocument()` to add custom behavior while still calling the parent implementation.

## When to Use the Template Method Pattern

The Template Method pattern is particularly useful when:

1. **You have an algorithm with invariant parts and variant parts** :

* The invariant parts can be implemented once in the abstract class
* The variant parts can be implemented in subclasses

1. **You want to control the algorithm's structure** :

* The template method ensures that the steps are always executed in the correct order
* Subclasses can't change the overall structure

1. **You want to eliminate code duplication** :

* Common code is moved to the abstract class
* Only the varying parts are implemented in subclasses

1. **You want to provide hooks for optional extensions** :

* Hook methods allow subclasses to extend the algorithm at specific points without changing its structure

## Implementation Guidelines

When implementing the Template Method pattern, consider these guidelines:

1. **Make the template method final** to prevent subclasses from changing the algorithm's structure.
2. **Minimize the number of abstract methods** that subclasses must implement. Too many abstract methods can make the pattern harder to use.
3. **Use hook methods to provide additional customization points** without forcing subclasses to implement them.
4. **Document the algorithm's structure and the purpose of each method** to make it easier for developers to understand and extend.
5. **Consider using protected methods** for operations that should only be called from within the template method, not from outside classes.

## A Python Example

Let's see how the Template Method pattern can be implemented in Python:

```python
from abc import ABC, abstractmethod

class DataProcessor(ABC):
    # Template method
    def process_data(self, data_source):
        data = self.extract_data(data_source)
        transformed_data = self.transform_data(data)
        self.load_data(transformed_data)
        if self.should_notify():
            self.send_notification()
  
    @abstractmethod
    def extract_data(self, data_source):
        pass
  
    @abstractmethod
    def transform_data(self, data):
        pass
  
    @abstractmethod
    def load_data(self, transformed_data):
        pass
  
    # Hook method
    def should_notify(self):
        return False
  
    def send_notification(self):
        print("Notification sent about data processing completion")

# Concrete implementation for database data
class DatabaseProcessor(DataProcessor):
    def extract_data(self, data_source):
        print(f"Extracting data from database: {data_source}")
        return [1, 2, 3, 4, 5]  # Simulated data
  
    def transform_data(self, data):
        print("Transforming database data")
        return [x * 2 for x in data]  # Double each value
  
    def load_data(self, transformed_data):
        print(f"Loading transformed data: {transformed_data}")
  
    def should_notify(self):
        return True  # Override to enable notifications

# Concrete implementation for API data
class APIProcessor(DataProcessor):
    def extract_data(self, data_source):
        print(f"Extracting data from API: {data_source}")
        return {"key1": "value1", "key2": "value2"}  # Simulated data
  
    def transform_data(self, data):
        print("Transforming API data")
        return {k.upper(): v.upper() for k, v in data.items()}  # Uppercase keys and values
  
    def load_data(self, transformed_data):
        print(f"Loading transformed API data: {transformed_data}")
```

This Python example demonstrates:

1. The use of Python's `ABC` (Abstract Base Class) to define the abstract class
2. The `@abstractmethod` decorator to mark methods that must be implemented by subclasses
3. Two concrete implementations for different data sources (database and API)
4. A hook method (`should_notify()`) that has a default implementation but can be overridden

## Distinguishing Template Method from Other Patterns

The Template Method pattern might seem similar to other patterns, but it has distinct characteristics:

1. **Template Method vs. Strategy Pattern** :

* Template Method uses inheritance to vary parts of an algorithm
* Strategy uses composition to vary the entire algorithm
* Template Method focuses on the algorithm's structure
* Strategy focuses on interchangeable algorithms

1. **Template Method vs. Factory Method** :

* Both use inheritance and abstract methods
* Template Method focuses on the algorithm's structure
* Factory Method focuses on creating objects
* Factory Method is often used within a Template Method

> The Template Method pattern focuses on the "how" of an algorithm, defining its structure while allowing customization of specific steps. Strategy focuses on the "what" of an algorithm, allowing complete algorithm replacement.

## The Hollywood Principle

The Template Method pattern follows what's called the "Hollywood Principle": "Don't call us, we'll call you."

This means that the high-level component (the abstract class with the template method) calls the low-level components (the concrete subclasses), not the other way around. The subclasses don't control when their methods are called—they just provide implementations that are called by the template method when needed.

This inversion of control:

* Reduces dependencies between components
* Makes the system more modular and extensible
* Centralizes the control flow in the template method

## Advantages and Disadvantages

### Advantages:

1. **Code Reuse** : Common code is placed in the abstract class, eliminating duplication.
2. **Control** : The abstract class controls the algorithm's structure, ensuring steps are executed correctly.
3. **Extensibility** : New variations can be added by creating new subclasses.
4. **Standardization** : All implementations follow the same basic algorithm structure.

### Disadvantages:

1. **Rigidity** : The template method's structure is fixed and can't be changed at runtime.
2. **Complexity** : Understanding the flow can be difficult if the template method is large and complex.
3. **Inheritance Issues** : The pattern relies heavily on inheritance, which can be a problem in languages with single inheritance restrictions.
4. **Maintenance** : Changes to the template method can impact all subclasses.

## Real-World Applications

The Template Method pattern appears in many real-world applications:

1. **Framework Methods** : Many frameworks use template methods to define the structure of operations while allowing customization.
2. **UI Component Lifecycles** : UI frameworks often define component lifecycles (init, render, update, destroy) as template methods.
3. **Database Operations** : ORMs and database libraries use template methods for transactions, queries, and connection management.
4. **Build Systems** : Build tools use template methods to define build processes while allowing customization of specific steps.
5. **Game Engines** : Game loops and rendering pipelines are often implemented as template methods.

## A JavaScript Example

Let's see a JavaScript implementation of the Template Method pattern:

```javascript
// Abstract class (in JavaScript, we simulate abstract classes)
class SortAlgorithm {
    // Template method
    sort(array) {
        console.log("Preparing to sort array of length:", array.length);
      
        if (array.length <= 1) {
            return array;
        }
      
        const sortedArray = this.doSort([...array]);  // Create a copy to avoid modifying original
      
        this.verify(sortedArray);
      
        console.log("Sorting completed");
        return sortedArray;
    }
  
    // Abstract method - must be implemented by subclasses
    doSort(array) {
        throw new Error("doSort() must be implemented by subclasses");
    }
  
    // Hook method - can be overridden by subclasses
    verify(array) {
        console.log("Verifying sort correctness");
        for (let i = 1; i < array.length; i++) {
            if (array[i] < array[i - 1]) {
                console.error("Sort failed: array not in ascending order");
                return false;
            }
        }
        console.log("Verification successful");
        return true;
    }
}

// Concrete implementation - Bubble Sort
class BubbleSort extends SortAlgorithm {
    doSort(array) {
        console.log("Performing bubble sort");
      
        const len = array.length;
        for (let i = 0; i < len; i++) {
            for (let j = 0; j < len - i - 1; j++) {
                if (array[j] > array[j + 1]) {
                    // Swap elements
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                }
            }
        }
      
        return array;
    }
}

// Concrete implementation - Quick Sort
class QuickSort extends SortAlgorithm {
    doSort(array) {
        console.log("Performing quick sort");
      
        if (array.length <= 1) {
            return array;
        }
      
        const pivot = array[0];
        const left = [];
        const right = [];
      
        for (let i = 1; i < array.length; i++) {
            if (array[i] < pivot) {
                left.push(array[i]);
            } else {
                right.push(array[i]);
            }
        }
      
        return [...this.doSort(left), pivot, ...this.doSort(right)];
    }
  
    // Override the hook method
    verify(array) {
        console.log("Doing quick sort specific verification");
        return super.verify(array);  // Call parent implementation too
    }
}
```

In this JavaScript example:

1. `SortAlgorithm` defines the template method `sort()` that outlines the algorithm for sorting an array.
2. `BubbleSort` and `QuickSort` implement the abstract method `doSort()` to provide specific sorting algorithms.
3. `QuickSort` overrides the hook method `verify()` to add custom verification logic.

## Template Method in Real Frameworks

Many popular frameworks use the Template Method pattern:

### Spring Framework (Java)

Spring's `JdbcTemplate` uses the Template Method pattern to simplify database operations. The template method defines the overall process (connecting, executing, handling exceptions, closing), while concrete implementations specify what to do with the results.

```java
// Using Spring's JdbcTemplate
JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

// The queryForObject method is a template method
String sql = "SELECT COUNT(*) FROM users";
int count = jdbcTemplate.queryForObject(sql, Integer.class);
```

### Android Framework

Android's `Activity` class uses the Template Method pattern for the activity lifecycle. The template method `onCreate()` calls `setContentView()` and then executes other initialization logic.

```java
public class MyActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
      
        // Initialize UI components
        Button button = findViewById(R.id.button);
        button.setOnClickListener(v -> {
            // Handle click
        });
    }
}
```

## Common Pitfalls and Best Practices

### Pitfalls to Avoid:

1. **Making the Template Method Too Complex** : A template method that does too much can be hard to understand and maintain.
2. **Overusing Abstract Methods** : Requiring subclasses to implement too many methods creates unnecessary complexity.
3. **Violating the Liskov Substitution Principle** : Subclasses should be substitutable for their base class without affecting program correctness.
4. **Changing the Template Method's Behavior in Subclasses** : If the template method isn't final, subclasses might change its behavior, breaking the algorithm's structure.

### Best Practices:

1. **Keep the Template Method Focused** : Each template method should have a single responsibility.
2. **Provide Hook Methods** : Use hook methods to allow customization without requiring implementation.
3. **Document the Algorithm's Flow** : Clearly document the steps in the template method and their expected behavior.
4. **Use Final Methods Where Appropriate** : Mark methods as final if they shouldn't be overridden by subclasses.
5. **Consider Using Abstract Classes** : In languages like Java and C#, abstract classes provide better enforcement of the pattern than interfaces.

## Conclusion

> The Template Method pattern is a powerful tool for encapsulating algorithms while allowing customization of specific steps. It promotes code reuse, standardization, and extensibility through a clean separation of invariant and variant parts.

From first principles, the Template Method pattern is about:

1. **Abstraction** : Separating what stays the same from what changes
2. **Structure** : Defining a clear sequence of steps
3. **Customization** : Allowing specific steps to be redefined without changing the overall structure

By understanding these fundamental principles, you can effectively apply the Template Method pattern to create flexible, reusable algorithms in your software.

Whether you're building frameworks, processing documents, or implementing sorting algorithms, the Template Method pattern provides a clean, structured approach to handling variations while maintaining consistency in your code.
