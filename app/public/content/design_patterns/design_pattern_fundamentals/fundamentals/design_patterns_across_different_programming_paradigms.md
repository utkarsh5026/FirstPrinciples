# Design Patterns Across Different Programming Paradigms

## Introduction to Design Patterns

> Design patterns are elegant solutions to recurring problems in software design. They represent the collective experience of software engineering communities, captured as reusable templates that can be applied across different contexts.

At their core, design patterns are not code libraries or components that you can simply plug into your applications. Rather, they are descriptions or templates for how to solve problems that can be used in many different situations. Design patterns are about communication and shared understanding among developers.

### First Principles of Design Patterns

To truly understand design patterns, we need to start with the fundamental principles that drive their creation:

1. **Abstraction** - The ability to hide implementation details and expose only what's necessary
2. **Encapsulation** - Bundling data and methods that operate on that data
3. **Modularity** - Breaking systems into well-defined, independent components
4. **Separation of Concerns** - Dividing programs into distinct sections addressing different concerns
5. **Reusability** - Creating components that can be used in multiple contexts

The concept of design patterns was formalized in the seminal book "Design Patterns: Elements of Reusable Object-Oriented Software" by the "Gang of Four" (Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides) in 1994. While their focus was specifically on object-oriented design patterns, the principles have since expanded across various programming paradigms.

## Understanding Programming Paradigms

> A programming paradigm is a fundamental style of computer programming that shapes how we structure and organize code, representing a way of thinking about and approaching problems.

Before diving into specific design patterns, it's crucial to understand what programming paradigms are. At the most basic level, a programming paradigm provides a mental model for solving problems and structuring code. Different paradigms can lead to radically different approaches to the same problem.

The major programming paradigms include:

1. **Object-Oriented Programming (OOP)** : Organizes code around objects that encapsulate data and behavior
2. **Functional Programming (FP)** : Treats computation as the evaluation of mathematical functions, avoiding state and mutable data
3. **Procedural Programming** : Focuses on procedure calls, organizing code as sequences of commands
4. **Reactive Programming** : Centers on data streams and the propagation of changes
5. **Concurrent Programming** : Deals with executing operations simultaneously

Each paradigm comes with its own philosophy, strengths, weaknesses, and associated design patterns. Let's explore them one by one.

## Object-Oriented Design Patterns

Object-Oriented Programming (OOP) is built around the concept of "objects" that contain data and code. Objects can be thought of as instances of classes, which define their structure and behavior.

### Core OOP Principles

1. **Encapsulation** : Bundling data with methods that operate on that data
2. **Inheritance** : Ability of a class to derive properties and characteristics from another class
3. **Polymorphism** : Ability to present the same interface for different underlying forms
4. **Abstraction** : Hiding complex implementation details behind simple interfaces

### Categories of OOP Design Patterns

The Gang of Four categorized OOP design patterns into three main types:

#### 1. Creational Patterns

> Creational patterns focus on object creation mechanisms, trying to create objects in a manner suitable to the situation.

Let's look at a simple example of the **Factory Method** pattern:

```java
// Product interface
interface Animal {
    void speak();
}

// Concrete Products
class Dog implements Animal {
    @Override
    public void speak() {
        System.out.println("Woof!");
    }
}

class Cat implements Animal {
    @Override
    public void speak() {
        System.out.println("Meow!");
    }
}

// Creator abstract class
abstract class AnimalFactory {
    public abstract Animal createAnimal();
  
    // The "factory method"
    public Animal getAnimal() {
        Animal animal = createAnimal();
        return animal;
    }
}

// Concrete Creators
class DogFactory extends AnimalFactory {
    @Override
    public Animal createAnimal() {
        return new Dog();
    }
}

class CatFactory extends AnimalFactory {
    @Override
    public Animal createAnimal() {
        return new Cat();
    }
}
```

In this example, the Factory Method pattern allows us to create different types of animals without specifying their concrete classes. The `AnimalFactory` abstract class defines a method for creating an `Animal` object, but lets subclasses decide which class to instantiate. This promotes loose coupling and adheres to the principle "program to an interface, not an implementation."

The key benefit here is that our client code can work with the abstract `Animal` type without knowing the specific implementation details of `Dog` or `Cat`.

#### 2. Structural Patterns

> Structural patterns focus on how classes and objects are composed to form larger structures while keeping these structures flexible and efficient.

Let's examine the **Adapter** pattern:

```python
# Existing class with incompatible interface
class OldPrinter:
    def print_old_way(self, text):
        print(f"[Old printer] {text}")

# Target interface that clients expect
class ModernPrinter:
    def print(self, text):
        pass

# Adapter makes OldPrinter compatible with ModernPrinter interface
class PrinterAdapter(ModernPrinter):
    def __init__(self, old_printer):
        self.old_printer = old_printer
  
    def print(self, text):
        self.old_printer.print_old_way(text)
      
# Client code
def client_code(printer):
    printer.print("Hello, World!")

# Usage
old_printer = OldPrinter()
adapter = PrinterAdapter(old_printer)
client_code(adapter)  # Output: [Old printer] Hello, World!
```

The Adapter pattern allows objects with incompatible interfaces to collaborate. In this example, we have an old printer system that uses a different method name (`print_old_way`) than what our client code expects (`print`). The adapter wraps the old printer and translates calls to the new interface into calls to the old interface.

This pattern is especially useful when integrating legacy code or third-party libraries that cannot be modified directly.

#### 3. Behavioral Patterns

> Behavioral patterns identify common communication patterns between objects, increasing flexibility in carrying out this communication.

Here's an example of the **Observer** pattern:

```javascript
class Subject {
    constructor() {
        this.observers = [];
    }
  
    addObserver(observer) {
        this.observers.push(observer);
    }
  
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }
  
    notifyObservers(data) {
        this.observers.forEach(observer => observer.update(data));
    }
}

class Observer {
    constructor(name) {
        this.name = name;
    }
  
    update(data) {
        console.log(`${this.name} received update: ${data}`);
    }
}

// Usage
const subject = new Subject();
const observer1 = new Observer("Observer 1");
const observer2 = new Observer("Observer 2");

subject.addObserver(observer1);
subject.addObserver(observer2);
subject.notifyObservers("New data available!");

// Output:
// Observer 1 received update: New data available!
// Observer 2 received update: New data available!
```

The Observer pattern establishes a one-to-many dependency between objects: when one object (the subject) changes state, all its dependents (observers) are notified and updated automatically. This pattern is the foundation for event handling systems and is widely used in implementing user interfaces and reactive programming.

## Functional Programming Patterns

> Functional programming treats computation as the evaluation of mathematical functions and avoids changing state and mutable data.

### Core Functional Programming Principles

1. **Pure Functions** : Functions that always produce the same output for the same input and have no side effects
2. **Immutability** : Once created, data cannot be changed
3. **Function Composition** : Building complex functions by combining simpler ones
4. **Higher-Order Functions** : Functions that can accept other functions as arguments or return them

### Common Functional Programming Patterns

#### 1. Function Composition

Function composition is about building complex functions by combining simpler ones. This pattern emphasizes reusability and modularity.

```javascript
// Simple functions
const add10 = x => x + 10;
const multiply2 = x => x * 2;
const subtract5 = x => x - 5;

// Function composition
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

// Create a new function that combines these operations
const computeValue = compose(subtract5, multiply2, add10);

// Use the composed function
console.log(computeValue(5));  // (((5 + 10) * 2) - 5) = 25
```

This example demonstrates how we can compose multiple functions to create a new function that applies each operation in sequence. The beauty of this approach is that each function is focused on doing one thing well, making the code more maintainable and testable.

#### 2. Monads

Monads are a powerful pattern for encapsulating computations and managing side effects in a pure functional way. While the concept can seem abstract, let's look at a concrete example using JavaScript's Promise, which is a type of monad:

```javascript
// A function that might fail
const fetchUser = userId => {
    return new Promise((resolve, reject) => {
        // Simulating API call
        setTimeout(() => {
            if (userId > 0) {
                resolve({ id: userId, name: `User ${userId}` });
            } else {
                reject(new Error("Invalid user ID"));
            }
        }, 100);
    });
};

// Using the monad pattern
fetchUser(123)
    .then(user => {
        console.log(`User found: ${user.name}`);
        return user.id;
    })
    .then(userId => fetchUser(userId + 1))
    .then(nextUser => console.log(`Next user: ${nextUser.name}`))
    .catch(error => console.error(`Error: ${error.message}`));
```

In this example, the Promise monad allows us to chain operations together while handling potential failures in a structured way. Each `.then()` call transforms the value inside the monad, and `.catch()` handles any errors that might occur along the way. This approach helps manage side effects (like network requests) in a more predictable and composable manner.

#### 3. Currying

Currying is a technique of transforming a function that takes multiple arguments into a sequence of functions, each taking a single argument.

```python
# Curried function for calculating volume
def calculate_volume(length):
    def with_width(width):
        def with_height(height):
            return length * width * height
        return with_height
    return with_width

# Usage
volume_10_length = calculate_volume(10)  # Fix the length at 10
volume_10_5_width = volume_10_length(5)  # Fix the width at 5
final_volume = volume_10_5_width(2)      # Calculate with height 2

print(final_volume)  # 10 * 5 * 2 = 100

# Or in one call
print(calculate_volume(10)(5)(2))  # Same result: 100
```

Currying allows us to create specialized functions from more general ones by partially applying arguments. This pattern enhances reusability and can make the code more readable when used appropriately.

## Procedural Programming Patterns

Procedural programming organizes code as a sequence of steps or procedures. While not as fashionable as OOP or functional programming today, it still has valuable patterns.

### Core Procedural Programming Principles

1. **Top-down design** : Breaking a problem into smaller sub-problems
2. **Procedures/Subroutines** : Blocks of code that perform specific tasks
3. **Sequential execution** : Code executes in the order it's written
4. **Global state** : Data often shared across different procedures

### Common Procedural Programming Patterns

#### 1. Modular Design

```c
// Module for mathematical operations
// math_module.c
#include "math_module.h"

int add(int a, int b) {
    return a + b;
}

int subtract(int a, int b) {
    return a - b;
}

int multiply(int a, int b) {
    return a * b;
}

int divide(int a, int b) {
    if (b == 0) {
        return 0; // Error handling simplified for example
    }
    return a / b;
}

// In math_module.h
#ifndef MATH_MODULE_H
#define MATH_MODULE_H

int add(int a, int b);
int subtract(int a, int b);
int multiply(int a, int b);
int divide(int a, int b);

#endif
```

This example demonstrates the modular design pattern in procedural programming. Functions with related responsibilities are grouped together in modules, with clear interfaces defined in header files. This organization improves maintainability by creating logical partitions in the code.

#### 2. Table-Driven Methods

Table-driven methods use tables (arrays or other data structures) to look up information rather than using complex logic statements.

```c
#include <stdio.h>

// Day of week calculation using table-driven method
int get_days_in_month(int month, int year) {
    // Table of days in each month
    int days_table[12] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
  
    // Special case for February in leap years
    if (month == 1) {  // February (0-based index)
        if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
            return 29;  // Leap year
        }
    }
  
    return days_table[month];
}

int main() {
    // Get days in February 2024 (a leap year)
    printf("Days in February 2024: %d\n", get_days_in_month(1, 2024));  // Output: 29
  
    // Get days in February 2023 (not a leap year)
    printf("Days in February 2023: %d\n", get_days_in_month(1, 2023));  // Output: 28
  
    return 0;
}
```

This pattern replaces complex conditional logic with simple table lookups, making the code more maintainable and often more efficient. It's particularly useful when mapping inputs to outputs or states to actions.

## Reactive Programming Patterns

> Reactive Programming focuses on asynchronous data streams and the propagation of changes through the system.

### Core Reactive Programming Principles

1. **Responsive** : Systems respond in a timely manner
2. **Resilient** : Systems stay responsive in the face of failure
3. **Elastic** : Systems stay responsive under varying workload
4. **Message-Driven** : Systems rely on asynchronous message-passing

### Common Reactive Programming Patterns

#### 1. Observable Pattern

The Observable pattern is a cornerstone of reactive programming, similar to the Observer pattern in OOP but with a focus on data streams.

```typescript
import { Observable, Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// Create a subject (both an Observable and an Observer)
const subject = new Subject<number>();

// Create an observable pipeline with transformations
const doubledEvens = subject.pipe(
    filter(n => n % 2 === 0),      // Only allow even numbers
    map(n => n * 2)                // Double the value
);

// Subscribe to the observable
const subscription = doubledEvens.subscribe({
    next: value => console.log(`Received: ${value}`),
    error: err => console.error(`Error: ${err}`),
    complete: () => console.log('Observable completed')
});

// Emit values
subject.next(1);  // Odd, filtered out
subject.next(2);  // Even, doubled to 4
subject.next(3);  // Odd, filtered out
subject.next(4);  // Even, doubled to 8

// Complete the observable
subject.complete();

// Output:
// Received: 4
// Received: 8
// Observable completed
```

This example uses RxJS, a popular reactive programming library. We create a data stream (Subject), apply transformations to it (filter and map), and subscribe to receive the results. The beauty of this pattern is that it allows complex transformations on asynchronous data streams in a declarative way.

#### 2. Event Stream Processing

```javascript
const button = document.querySelector('#myButton');

// Create a stream of button click events
const clicks = fromEvent(button, 'click');

// Transform the stream
const positions = clicks.pipe(
    // Throttle to avoid too many events
    throttleTime(1000),
    // Extract cursor position
    map(event => ({ x: event.clientX, y: event.clientY })),
    // Only track positions within a certain area
    filter(pos => pos.x < window.innerWidth / 2)
);

// Subscribe to the transformed stream
positions.subscribe(pos => {
    console.log(`Clicked at position: x=${pos.x}, y=${pos.y}`);
});
```

In this example, we treat UI events as streams that can be transformed, filtered, and composed. This approach separates the concerns of event generation, transformation, and consumption, making complex UI behaviors more manageable.

## Concurrent Programming Patterns

Concurrent programming deals with executing operations simultaneously, which brings its own set of challenges and design patterns.

### Core Concurrent Programming Principles

1. **Parallelism** : Executing multiple operations at the exact same time
2. **Concurrency** : Managing multiple operations that may overlap in time
3. **Thread safety** : Ensuring correct program behavior when executed in multiple threads
4. **Deadlock prevention** : Avoiding situations where threads wait indefinitely for each other

### Common Concurrent Programming Patterns

#### 1. Thread Pool Pattern

The Thread Pool pattern reuses a fixed number of threads to execute tasks, reducing the overhead of thread creation.

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ThreadPoolExample {
    public static void main(String[] args) {
        // Create a thread pool with 3 threads
        ExecutorService executor = Executors.newFixedThreadPool(3);
      
        // Submit 5 tasks
        for (int i = 1; i <= 5; i++) {
            final int taskNum = i;
            executor.submit(() -> {
                String threadName = Thread.currentThread().getName();
                System.out.println("Task " + taskNum + " executing on " + threadName);
              
                // Simulate work
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
              
                System.out.println("Task " + taskNum + " completed");
            });
        }
      
        // Shutdown the executor
        executor.shutdown();
    }
}
```

In this example, instead of creating a new thread for each task, we use a fixed-size thread pool. The pool manages a group of worker threads that execute tasks from a work queue. This pattern improves performance by reducing the overhead of thread creation and destruction.

#### 2. Future Pattern

The Future pattern represents a value that may not be available yet but will be at some point in the future.

```python
import concurrent.futures
import time

def compute_value(x):
    # Simulate a time-consuming computation
    time.sleep(2)
    return x * x

# Using the Future pattern
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    # Start computations and get futures
    future1 = executor.submit(compute_value, 5)
    future2 = executor.submit(compute_value, 10)
    future3 = executor.submit(compute_value, 15)
  
    # Do other work while computations are running
    print("Computations started, doing other work...")
    time.sleep(1)
    print("Still computing...")
  
    # Get results (will block until each result is ready)
    result1 = future1.result()
    result2 = future2.result()
    result3 = future3.result()
  
    print(f"Results: {result1}, {result2}, {result3}")
```

The Future pattern decouples the execution of a task from obtaining its result. This allows us to start a computation and continue doing other work, checking back later when we actually need the result. This pattern is essential for writing non-blocking code in concurrent environments.

## Cross-Paradigm Design Patterns

Some design patterns transcend specific programming paradigms and can be implemented across different styles of programming.

### 1. Pipeline Pattern

The Pipeline pattern processes data through a series of operations, with each operation's output serving as input to the next.

**Object-Oriented Implementation:**

```python
class TextProcessor:
    def process(self, text):
        return text

class LowercaseProcessor(TextProcessor):
    def process(self, text):
        return text.lower()

class RemovePunctuationProcessor(TextProcessor):
    def process(self, text):
        import string
        return ''.join(char for char in text if char not in string.punctuation)

class TokenizeProcessor(TextProcessor):
    def process(self, text):
        return text.split()

# Pipeline implementation
class Pipeline:
    def __init__(self):
        self.processors = []
  
    def add_processor(self, processor):
        self.processors.append(processor)
        return self
  
    def process(self, input_data):
        result = input_data
        for processor in self.processors:
            result = processor.process(result)
        return result

# Usage
pipeline = Pipeline()
pipeline.add_processor(LowercaseProcessor())
pipeline.add_processor(RemovePunctuationProcessor())
pipeline.add_processor(TokenizeProcessor())

text = "Hello, World! This is a TEST."
result = pipeline.process(text)
print(result)  # Output: ['hello', 'world', 'this', 'is', 'a', 'test']
```

**Functional Implementation:**

```javascript
// Pure functions for text processing
const lowercase = text => text.toLowerCase();
const removePunctuation = text => text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
const tokenize = text => text.split(/\s+/);

// Function composition to create a pipeline
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Create the text processing pipeline
const processText = pipe(lowercase, removePunctuation, tokenize);

// Usage
const text = "Hello, World! This is a TEST.";
const result = processText(text);
console.log(result);  // Output: ['hello', 'world', 'this', 'is', 'a', 'test']
```

This example demonstrates how the same pattern can be implemented in both object-oriented and functional styles. The OOP approach uses class hierarchies and composition, while the functional approach uses pure functions and function composition.

## Comparing Design Patterns Across Paradigms

To better understand how design patterns differ across paradigms, let's compare solutions to the same problem:

 **Problem** : Implement a system to notify multiple components when a data source changes.

### OOP Solution (Observer Pattern)

```java
// Subject interface
interface Subject {
    void addObserver(Observer observer);
    void removeObserver(Observer observer);
    void notifyObservers();
}

// Observer interface
interface Observer {
    void update(Object data);
}

// Concrete Subject
class DataSource implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private Object data;
  
    public void setData(Object data) {
        this.data = data;
        notifyObservers();
    }
  
    public Object getData() {
        return data;
    }
  
    @Override
    public void addObserver(Observer observer) {
        observers.add(observer);
    }
  
    @Override
    public void removeObserver(Observer observer) {
        observers.remove(observer);
    }
  
    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(data);
        }
    }
}

// Concrete Observer
class Display implements Observer {
    private String name;
  
    public Display(String name) {
        this.name = name;
    }
  
    @Override
    public void update(Object data) {
        System.out.println(name + " received update: " + data);
    }
}

// Usage
DataSource source = new DataSource();
source.addObserver(new Display("Display 1"));
source.addObserver(new Display("Display 2"));
source.setData("New data");
```

### Functional Reactive Solution

```javascript
import { BehaviorSubject } from 'rxjs';

// Create a data source as a stream
const dataSource = new BehaviorSubject(null);

// Create subscribers (equivalent to Observers)
const display1 = data => console.log(`Display 1 received: ${data}`);
const display2 = data => console.log(`Display 2 received: ${data}`);

// Subscribe to the data source
const subscription1 = dataSource.subscribe(display1);
const subscription2 = dataSource.subscribe(display2);

// Update the data
dataSource.next("New data");

// Later, unsubscribe if needed
subscription1.unsubscribe();
```

### Procedural Solution

```c
#include <stdio.h>
#include <stdlib.h>

#define MAX_OBSERVERS 10

// Function pointer type for observers
typedef void (*ObserverFunc)(void* data);

// Global variables (state)
ObserverFunc observers[MAX_OBSERVERS];
int observer_count = 0;
void* shared_data = NULL;

// Register an observer
void add_observer(ObserverFunc observer) {
    if (observer_count < MAX_OBSERVERS) {
        observers[observer_count++] = observer;
    }
}

// Notify all observers
void notify_observers() {
    for (int i = 0; i < observer_count; i++) {
        observers[i](shared_data);
    }
}

// Update data
void set_data(void* data) {
    shared_data = data;
    notify_observers();
}

// Observer functions
void display1(void* data) {
    printf("Display 1 received: %s\n", (char*)data);
}

void display2(void* data) {
    printf("Display 2 received: %s\n", (char*)data);
}

int main() {
    // Register observers
    add_observer(display1);
    add_observer(display2);
  
    // Update data
    set_data("New data");
  
    return 0;
}
```

### Comparison Analysis

Looking at these implementations, we can observe some key differences:

1. **State Management** :

* OOP encapsulates state within objects
* Functional approach treats state as immutable data flowing through streams
* Procedural approach often relies on global state

1. **Coupling** :

* OOP creates explicit relationships between objects through interfaces
* Functional approach loosely couples components through stream subscriptions
* Procedural approach typically has tighter coupling through direct function calls

1. **Flexibility** :

* OOP provides flexibility through polymorphism and inheritance
* Functional approach achieves flexibility through composition and higher-order functions
* Procedural approach is generally less flexible but can be simpler to understand

## Conclusion

> Design patterns are not tied to specific languages or paradigms but represent fundamental approaches to solving common software design problems.

As we've seen, design patterns manifest differently across programming paradigms, but they all aim to solve similar problems. The choice of paradigm—and consequently, the specific design pattern implementation—depends on factors such as:

1. The nature of the problem being solved
2. The programming language being used
3. Team expertise and preferences
4. Performance requirements
5. Maintainability considerations

Understanding design patterns across different paradigms broadens your toolbox as a developer, allowing you to select the most appropriate approach for each problem. While certain paradigms excel at particular types of problems, the most effective solutions often blend patterns from multiple paradigms.

Remember that design patterns are tools, not rules. They should be applied judiciously, and sometimes the simplest solution is the best, even if it doesn't follow a recognized pattern. The goal is always to create code that is correct, maintainable, and efficient.

Would you like me to elaborate on any specific design pattern or paradigm in more detail?
