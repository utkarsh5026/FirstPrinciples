# Design Patterns in Java Collections: Iterator and Template Method

## Understanding Design Patterns from First Principles

Before diving into specific patterns, let's establish what design patterns are and why they exist in programming.

> **Design Pattern Philosophy** : A design pattern is a reusable solution to a commonly occurring problem in software design. It's not finished code you can copy-paste, but rather a template for how to solve a problem that can be used in many different situations.

### Why Design Patterns Exist

From a computer science perspective, programs are essentially algorithms that manipulate data structures. As programs grow larger and more complex, certain structural problems appear repeatedly:

1. **Iteration Problem** : How do you traverse different data structures uniformly?
2. **Algorithm Structure Problem** : How do you define the skeleton of an algorithm while letting subclasses override specific steps?
3. **Encapsulation Problem** : How do you hide implementation details while providing consistent interfaces?

> **The Core Need** : Design patterns emerged because programmers kept solving the same fundamental problems over and over. Instead of reinventing solutions, patterns codify proven approaches that promote code reuse, maintainability, and clear communication between developers.

## The Iterator Pattern: Traversing Collections Uniformly

### The Fundamental Problem

Imagine you're writing a program that needs to process different types of collections:

```java
// Without patterns - tightly coupled to specific implementations
public class DataProcessor {
    public void processArray(int[] numbers) {
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("Processing: " + numbers[i]);
        }
    }
  
    public void processList(ArrayList<Integer> numbers) {
        for (int i = 0; i < numbers.size(); i++) {
            System.out.println("Processing: " + numbers.get(i));
        }
    }
  
    public void processLinkedList(LinkedList<Integer> numbers) {
        Node current = numbers.getFirst();
        while (current != null) {
            System.out.println("Processing: " + current.data);
            current = current.next;
        }
    }
}
```

**Problems with this approach:**

* Different traversal code for each data structure
* Tight coupling between processing logic and data structure implementation
* Violation of the "Don't Repeat Yourself" (DRY) principle
* Hard to maintain and extend

### Iterator Pattern Solution

> **Iterator Pattern Definition** : Provides a way to access the elements of an aggregate object sequentially without exposing its underlying representation. It separates the traversal logic from the data structure implementation.

Here's the conceptual structure:

```
Iterator Interface
    |
    ├── hasNext(): boolean
    └── next(): Element

Collection Interface
    |
    └── iterator(): Iterator

Concrete Collection
    |
    ├── Internal Data Structure
    └── iterator() returns ConcreteIterator

ConcreteIterator
    |
    ├── Reference to Collection
    ├── Current Position
    └── Implements hasNext() and next()
```

### Building Iterator from First Principles

Let's build our own iterator to understand the pattern:

```java
// Step 1: Define the Iterator interface
interface MyIterator<T> {
    boolean hasNext();  // Check if more elements exist
    T next();          // Return next element and advance position
}

// Step 2: Define a Collection interface that can create iterators
interface MyIterable<T> {
    MyIterator<T> iterator();
}

// Step 3: Implement a simple collection with iterator support
class MyArrayList<T> implements MyIterable<T> {
    private Object[] elements;
    private int size;
    private static final int DEFAULT_CAPACITY = 10;
  
    public MyArrayList() {
        elements = new Object[DEFAULT_CAPACITY];
        size = 0;
    }
  
    public void add(T element) {
        if (size >= elements.length) {
            resize();
        }
        elements[size++] = element;
    }
  
    private void resize() {
        Object[] newArray = new Object[elements.length * 2];
        System.arraycopy(elements, 0, newArray, 0, size);
        elements = newArray;
    }
  
    public int size() {
        return size;
    }
  
    // This is where the Iterator pattern magic happens
    @Override
    public MyIterator<T> iterator() {
        return new ArrayListIterator();
    }
  
    // Inner class implements the actual iteration logic
    private class ArrayListIterator implements MyIterator<T> {
        private int currentIndex = 0;
      
        @Override
        public boolean hasNext() {
            return currentIndex < size;
        }
      
        @Override
        @SuppressWarnings("unchecked")
        public T next() {
            if (!hasNext()) {
                throw new RuntimeException("No more elements");
            }
            return (T) elements[currentIndex++];
        }
    }
}

// Step 4: Now we can process ANY iterable collection uniformly
class UniversalProcessor {
    public static <T> void process(MyIterable<T> collection) {
        MyIterator<T> iterator = collection.iterator();
        while (iterator.hasNext()) {
            T element = iterator.next();
            System.out.println("Processing: " + element);
        }
    }
}

// Step 5: Usage demonstration
public class IteratorDemo {
    public static void main(String[] args) {
        MyArrayList<String> names = new MyArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");
      
        // Same processing code works for any iterable collection
        UniversalProcessor.process(names);
      
        // We could easily add other collection types (LinkedList, Tree, etc.)
        // and the processing code wouldn't change at all
    }
}
```

**Compilation and execution:**

```bash
javac IteratorDemo.java
java IteratorDemo
```

### Java's Built-in Iterator Implementation

Java's collections framework implements this pattern extensively:

```java
import java.util.*;

public class JavaIteratorDemo {
    public static void main(String[] args) {
        // Different collection types
        List<String> arrayList = new ArrayList<>();
        List<String> linkedList = new LinkedList<>();
        Set<String> hashSet = new HashSet<>();
      
        // All implement the same Iterator interface
        arrayList.add("A"); arrayList.add("B");
        linkedList.add("X"); linkedList.add("Y");
        hashSet.add("1"); hashSet.add("2");
      
        // Same iteration code works for all
        processCollection(arrayList);
        processCollection(linkedList);
        processCollection(hashSet);
      
        // Enhanced for-loop uses Iterator internally
        for (String item : arrayList) {
            System.out.println("Enhanced for: " + item);
        }
    }
  
    // Generic method that works with any Collection
    public static void processCollection(Collection<String> collection) {
        Iterator<String> iterator = collection.iterator();
        while (iterator.hasNext()) {
            String element = iterator.next();
            System.out.println("Processing: " + element);
        }
    }
}
```

> **Key Insight** : The enhanced for-loop (`for (Type item : collection)`) is syntactic sugar that the Java compiler converts to iterator-based code. This is why any class implementing `Iterable<T>` can be used in enhanced for-loops.

## The Template Method Pattern: Algorithmic Frameworks

### The Fundamental Problem

Consider sorting algorithms. While the overall structure is similar, specific comparison and swapping strategies vary:

```java
// Without patterns - duplicated algorithm structure
public class BubbleSortInt {
    public void sort(int[] array) {
        for (int i = 0; i < array.length - 1; i++) {
            for (int j = 0; j < array.length - 1 - i; j++) {
                if (array[j] > array[j + 1]) {  // Comparison logic
                    // Swap logic
                    int temp = array[j];
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                }
            }
        }
    }
}

public class BubbleSortString {
    public void sort(String[] array) {
        for (int i = 0; i < array.length - 1; i++) {
            for (int j = 0; j < array.length - 1 - i; j++) {
                if (array[j].compareTo(array[j + 1]) > 0) {  // Different comparison
                    // Same swap logic
                    String temp = array[j];
                    array[j] = array[j + 1];
                    array[j + 1] = temp;
                }
            }
        }
    }
}
```

**Problems:**

* Algorithm structure is duplicated
* Changes to the algorithm require modifying multiple classes
* No way to reuse the sorting framework for new types

### Template Method Pattern Solution

> **Template Method Pattern Definition** : Defines the skeleton of an algorithm in a base class, letting subclasses override specific steps without changing the algorithm's structure. It promotes code reuse while allowing customization of specific behaviors.

Here's the conceptual structure:

```
Abstract Class
    |
    ├── templateMethod() [final] - Algorithm skeleton
    ├── primitiveOperation1() [abstract] - Step to be implemented
    ├── primitiveOperation2() [abstract] - Step to be implemented
    └── hook() [optional] - Optional customization point

Concrete Class A
    |
    ├── primitiveOperation1() - Specific implementation
    └── primitiveOperation2() - Specific implementation

Concrete Class B
    |
    ├── primitiveOperation1() - Different implementation
    └── primitiveOperation2() - Different implementation
```

### Building Template Method from First Principles

```java
// Step 1: Define the abstract template class
abstract class SortTemplate<T> {
  
    // Template method - defines the algorithm skeleton
    // Final prevents subclasses from changing the algorithm structure
    public final void sort(T[] array) {
        System.out.println("Starting sort algorithm...");
      
        // The algorithm structure is fixed
        for (int i = 0; i < array.length - 1; i++) {
            for (int j = 0; j < array.length - 1 - i; j++) {
                // Delegate comparison to subclass
                if (compare(array[j], array[j + 1]) > 0) {
                    swap(array, j, j + 1);
                }
            }
        }
      
        System.out.println("Sort completed.");
    }
  
    // Abstract method - must be implemented by subclasses
    protected abstract int compare(T a, T b);
  
    // Concrete method - shared implementation
    protected final void swap(T[] array, int i, int j) {
        T temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  
    // Hook method - optional customization point
    protected void beforeSort(T[] array) {
        // Default implementation does nothing
        // Subclasses can override if needed
    }
}

// Step 2: Implement concrete sorting strategies
class IntegerSorter extends SortTemplate<Integer> {
    @Override
    protected int compare(Integer a, Integer b) {
        return a.compareTo(b);  // Ascending order
    }
  
    @Override
    protected void beforeSort(Integer[] array) {
        System.out.println("Sorting integers in ascending order");
    }
}

class StringSorter extends SortTemplate<String> {
    @Override
    protected int compare(String a, String b) {
        return a.compareToIgnoreCase(b);  // Case-insensitive
    }
  
    @Override
    protected void beforeSort(String[] array) {
        System.out.println("Sorting strings case-insensitively");
    }
}

class ReverseIntegerSorter extends SortTemplate<Integer> {
    @Override
    protected int compare(Integer a, Integer b) {
        return b.compareTo(a);  // Descending order
    }
}

// Step 3: Usage demonstration
public class TemplateMethodDemo {
    public static void main(String[] args) {
        Integer[] numbers = {64, 34, 25, 12, 22, 11, 90};
        String[] words = {"banana", "Apple", "cherry", "Date"};
      
        SortTemplate<Integer> intSorter = new IntegerSorter();
        SortTemplate<String> stringSorter = new StringSorter();
        SortTemplate<Integer> reverseSorter = new ReverseIntegerSorter();
      
        System.out.println("Original numbers: " + Arrays.toString(numbers));
        intSorter.sort(numbers);
        System.out.println("Sorted numbers: " + Arrays.toString(numbers));
      
        System.out.println("\nOriginal words: " + Arrays.toString(words));
        stringSorter.sort(words);
        System.out.println("Sorted words: " + Arrays.toString(words));
      
        Integer[] moreNumbers = {5, 2, 8, 1, 9};
        System.out.println("\nOriginal numbers: " + Arrays.toString(moreNumbers));
        reverseSorter.sort(moreNumbers);
        System.out.println("Reverse sorted: " + Arrays.toString(moreNumbers));
    }
}
```

### Template Method in Java Collections Framework

Java's collections framework extensively uses the Template Method pattern:

```java
import java.util.*;

// AbstractList is a great example of Template Method pattern
class MyCustomList<E> extends AbstractList<E> {
    private List<E> list = new ArrayList<>();
  
    // We only need to implement these primitive operations
    @Override
    public E get(int index) {
        System.out.println("Custom get() called for index: " + index);
        return list.get(index);
    }
  
    @Override
    public int size() {
        return list.size();
    }
  
    @Override
    public void add(int index, E element) {
        System.out.println("Custom add() called");
        list.add(index, element);
    }
  
    @Override
    public E remove(int index) {
        System.out.println("Custom remove() called");
        return list.remove(index);
    }
  
    // AbstractList provides template methods like:
    // - iterator() - built using get() and size()
    // - contains() - built using iterator()
    // - indexOf() - built using iterator()
    // - clear() - built using remove()
    // etc.
}

public class CollectionsTemplateDemo {
    public static void main(String[] args) {
        MyCustomList<String> myList = new MyCustomList<>();
      
        // These operations use our primitive methods
        myList.add("Hello");
        myList.add("World");
      
        // This uses the template method iterator() from AbstractList
        // which internally uses our get() and size() methods
        for (String item : myList) {
            System.out.println("Item: " + item);
        }
      
        // This uses the template method contains() from AbstractList
        boolean found = myList.contains("Hello");
        System.out.println("Contains 'Hello': " + found);
    }
}
```

## How Iterator and Template Method Work Together

These patterns complement each other beautifully in Java's collections framework:

```java
// Demonstration of both patterns working together
public class PatternsTogetherDemo {
    public static void main(String[] args) {
        // Create different collection types
        List<Integer> arrayList = new ArrayList<>();
        List<Integer> linkedList = new LinkedList<>();
      
        // Fill with data
        Collections.addAll(arrayList, 5, 2, 8, 1, 9);
        Collections.addAll(linkedList, 5, 2, 8, 1, 9);
      
        System.out.println("ArrayList before sort: " + arrayList);
        System.out.println("LinkedList before sort: " + linkedList);
      
        // Collections.sort() uses Template Method pattern internally
        // It defines the sorting algorithm but delegates comparison
        Collections.sort(arrayList);  // Uses natural ordering
        Collections.sort(linkedList, Collections.reverseOrder());  // Custom comparator
      
        System.out.println("ArrayList after sort: " + arrayList);
        System.out.println("LinkedList after reverse sort: " + linkedList);
      
        // Iterator pattern allows uniform traversal
        System.out.println("\nTraversing with Iterator:");
        processAnyCollection(arrayList);
        processAnyCollection(linkedList);
    }
  
    // This method works with ANY collection thanks to Iterator pattern
    private static void processAnyCollection(Collection<Integer> collection) {
        Iterator<Integer> iterator = collection.iterator();
        while (iterator.hasNext()) {
            Integer value = iterator.next();
            System.out.print(value + " ");
        }
        System.out.println();
    }
}
```

## Advanced Implementation: Custom Collection with Both Patterns

Let's create a comprehensive example that demonstrates both patterns:

```java
import java.util.*;

// Custom collection implementing both patterns
class NumberContainer implements Iterable<Integer> {
    private List<Integer> numbers;
    private SortStrategy sortStrategy;
  
    public NumberContainer() {
        this.numbers = new ArrayList<>();
        this.sortStrategy = new AscendingSortStrategy();
    }
  
    public void add(Integer number) {
        numbers.add(number);
    }
  
    public void setSortStrategy(SortStrategy strategy) {
        this.sortStrategy = strategy;
    }
  
    public void sort() {
        sortStrategy.sort(numbers);
    }
  
    // Iterator pattern implementation
    @Override
    public Iterator<Integer> iterator() {
        return numbers.iterator();
    }
  
    public int size() {
        return numbers.size();
    }
}

// Template Method pattern for sorting strategies
abstract class SortStrategy {
    // Template method
    public final void sort(List<Integer> numbers) {
        beforeSort(numbers);
        performSort(numbers);
        afterSort(numbers);
    }
  
    // Primitive operations
    protected abstract void performSort(List<Integer> numbers);
  
    // Hook methods
    protected void beforeSort(List<Integer> numbers) {
        System.out.println("Preparing to sort " + numbers.size() + " numbers");
    }
  
    protected void afterSort(List<Integer> numbers) {
        System.out.println("Sorting completed");
    }
}

class AscendingSortStrategy extends SortStrategy {
    @Override
    protected void performSort(List<Integer> numbers) {
        Collections.sort(numbers);
    }
  
    @Override
    protected void beforeSort(List<Integer> numbers) {
        super.beforeSort(numbers);
        System.out.println("Using ascending sort strategy");
    }
}

class DescendingSortStrategy extends SortStrategy {
    @Override
    protected void performSort(List<Integer> numbers) {
        Collections.sort(numbers, Collections.reverseOrder());
    }
  
    @Override
    protected void beforeSort(List<Integer> numbers) {
        super.beforeSort(numbers);
        System.out.println("Using descending sort strategy");
    }
}

class EvenFirstSortStrategy extends SortStrategy {
    @Override
    protected void performSort(List<Integer> numbers) {
        Collections.sort(numbers, (a, b) -> {
            // Even numbers first, then odd numbers
            if (a % 2 == 0 && b % 2 != 0) return -1;
            if (a % 2 != 0 && b % 2 == 0) return 1;
            return a.compareTo(b);
        });
    }
  
    @Override
    protected void beforeSort(List<Integer> numbers) {
        super.beforeSort(numbers);
        System.out.println("Using even-first sort strategy");
    }
}

// Demonstration
public class ComprehensivePatternDemo {
    public static void main(String[] args) {
        NumberContainer container = new NumberContainer();
      
        // Add some numbers
        int[] values = {7, 2, 9, 4, 1, 8, 3, 6, 5};
        for (int value : values) {
            container.add(value);
        }
      
        System.out.println("Original numbers:");
        printContainer(container);
      
        // Try different sorting strategies (Template Method pattern)
        System.out.println("\n--- Ascending Sort ---");
        container.setSortStrategy(new AscendingSortStrategy());
        container.sort();
        printContainer(container);
      
        System.out.println("\n--- Descending Sort ---");
        container.setSortStrategy(new DescendingSortStrategy());
        container.sort();
        printContainer(container);
      
        System.out.println("\n--- Even-First Sort ---");
        container.setSortStrategy(new EvenFirstSortStrategy());
        container.sort();
        printContainer(container);
    }
  
    // Uses Iterator pattern for traversal
    private static void printContainer(NumberContainer container) {
        System.out.print("Numbers: ");
        for (Integer number : container) {  // Enhanced for-loop uses Iterator
            System.out.print(number + " ");
        }
        System.out.println();
    }
}
```

## Memory and Performance Considerations

> **Iterator Pattern Performance** : Iterators are generally very efficient because they maintain minimal state (usually just a position index or reference). They provide O(1) space complexity for the iterator itself, regardless of collection size.

> **Template Method Performance** : The Template Method pattern has minimal runtime overhead. The main cost is the virtual method calls for abstract methods, but modern JVMs optimize these heavily through techniques like method inlining.

### Memory Layout Visualization

```
Iterator Pattern Memory Layout:
┌─────────────────┐
│   Collection    │
│  ┌─────────────┐│
│  │ Element[0]  ││
│  │ Element[1]  ││
│  │ Element[2]  ││
│  │     ...     ││
│  └─────────────┘│
└─────────────────┘
         │
         │ creates
         ▼
┌─────────────────┐
│    Iterator     │
│ ┌─────────────┐ │
│ │currentIndex │ │ ← Small memory footprint
│ │ reference   │ │
│ └─────────────┘ │
└─────────────────┘

Template Method Memory Layout:
┌─────────────────┐
│ Abstract Class  │ ← Template method stored once
│ ┌─────────────┐ │
│ │templateMethod│ │
│ │(final)      │ │
│ └─────────────┘ │
└─────────────────┘
         │ inheritance
         ▼
┌─────────────────┐
│ Concrete Class  │ ← Only specific implementations
│ ┌─────────────┐ │   stored per subclass
│ │primitive    │ │
│ │operations   │ │
│ └─────────────┘ │
└─────────────────┘
```

## Best Practices and Common Pitfalls

> **Iterator Best Practices:**
>
> 1. Always check `hasNext()` before calling `next()`
> 2. Don't modify the collection while iterating (use `Iterator.remove()` instead)
> 3. Implement `fail-fast` behavior in custom iterators for safety
> 4. Consider implementing `ListIterator` for bidirectional traversal when appropriate

> **Template Method Best Practices:**
>
> 1. Make the template method `final` to prevent subclasses from changing the algorithm
> 2. Use meaningful names for primitive operations
> 3. Provide hook methods for optional customization
> 4. Document the contract and expected behavior of abstract methods clearly

### Common Pitfalls to Avoid

```java
// PITFALL 1: Modifying collection during iteration
public class IteratorPitfalls {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
      
        // WRONG - ConcurrentModificationException
        try {
            for (Integer num : numbers) {
                if (num % 2 == 0) {
                    numbers.remove(num);  // Don't do this!
                }
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("Caught exception: " + e.getMessage());
        }
      
        // CORRECT - Use iterator's remove method
        Iterator<Integer> iterator = numbers.iterator();
        while (iterator.hasNext()) {
            Integer num = iterator.next();
            if (num % 2 == 0) {
                iterator.remove();  // Safe removal
            }
        }
      
        System.out.println("After safe removal: " + numbers);
    }
}

// PITFALL 2: Not making template method final
abstract class BadTemplate {
    // BAD - subclasses can override and break the algorithm
    public void templateMethod() {
        step1();
        step2();
        step3();
    }
  
    protected abstract void step1();
    protected abstract void step2();
    protected abstract void step3();
}

abstract class GoodTemplate {
    // GOOD - algorithm structure is protected
    public final void templateMethod() {
        step1();
        step2();
        step3();
    }
  
    protected abstract void step1();
    protected abstract void step2();
    protected abstract void step3();
}
```

## Connection to Enterprise Development

These patterns are fundamental to enterprise Java development:

> **Framework Integration** : Most Java frameworks (Spring, Hibernate, etc.) heavily use these patterns. Understanding them helps you work more effectively with framework APIs and create better integrations.

> **API Design** : When designing APIs for large teams, these patterns help create consistent, extensible interfaces that multiple developers can implement safely.

> **Testing Strategy** : Both patterns facilitate unit testing by allowing you to test algorithm logic separately from data structure implementation or specific business logic.

**Real-world applications:**

* **Web Services** : Template Method for request processing pipelines
* **Data Processing** : Iterator for streaming large datasets
* **Configuration Management** : Template Method for application startup sequences
* **Plugin Architectures** : Both patterns for extensible plugin systems

These design patterns represent decades of accumulated wisdom about how to structure object-oriented programs effectively. They solve fundamental problems that appear in virtually every substantial Java application, making them essential tools for any serious Java developer.
