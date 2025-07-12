# Immutability in Java: From First Principles to Enterprise Patterns

Let's build your understanding of immutability from the ground up, starting with what it means for data to be unchangeable and why this matters in programming.

## Foundation: What is Immutability?

> **Core Principle** : An immutable object is one whose state cannot be modified after it's created. Instead of changing existing objects, you create new objects with the desired state.

Think of immutability like a photograph versus a whiteboard:

* **Photograph (Immutable)** : Once taken, the image never changes. To get a different image, you take a new photograph.
* **Whiteboard (Mutable)** : You can erase and redraw content, changing the same physical board.

```
Memory Layout Comparison:

Mutable Object:
┌─────────────────┐
│ Person obj      │ ← Same memory location
│ name: "John"    │
├─────────────────┤
│ name: "Jane"    │ ← State changed in place
└─────────────────┘

Immutable Objects:
┌─────────────────┐    ┌─────────────────┐
│ Person obj1     │    │ Person obj2     │ ← New memory location
│ name: "John"    │    │ name: "Jane"    │
└─────────────────┘    └─────────────────┘
       ↑                       ↑
   Original stays          New object
   unchanged               created
```

## Computer Science Foundation: Why Immutability Matters

Before diving into Java specifics, let's understand the fundamental problems that immutability solves:

> **Thread Safety** : Multiple threads can safely read immutable objects simultaneously without synchronization, because there's no risk of one thread modifying data while another reads it.

> **Predictable Behavior** : Once created, an immutable object's state never changes, eliminating entire categories of bugs related to unexpected state modifications.

> **Easier Reasoning** : You can pass immutable objects to methods without worrying about side effects - the method cannot change your object's state.

## Java's Built-in Immutability: Strings and Primitives

Java demonstrates immutability through its String class. Let's see how this works:

```java
public class StringImmutabilityDemo {
    public static void main(String[] args) {
        // Step 1: Create initial string
        String original = "Hello";
        System.out.println("Original: " + original);
        System.out.println("Memory location: " + System.identityHashCode(original));
      
        // Step 2: "Modify" the string
        String modified = original.toUpperCase();
        System.out.println("\nAfter toUpperCase():");
        System.out.println("Original: " + original);  // Still "Hello"!
        System.out.println("Modified: " + modified);   // "HELLO"
        System.out.println("Original memory: " + System.identityHashCode(original));
        System.out.println("Modified memory: " + System.identityHashCode(modified));
      
        // Step 3: Demonstrate that original is truly unchanged
        demonstrateStringImmutability(original);
        System.out.println("After method call, original still: " + original);
    }
  
    // This method cannot modify the string passed to it
    public static void demonstrateStringImmutability(String str) {
        str = str + " World";  // Creates new string, doesn't modify parameter
        System.out.println("Inside method: " + str);
    }
}

// Compilation: javac StringImmutabilityDemo.java
// Execution: java StringImmutabilityDemo
```

> **Key Insight** : String methods like `toUpperCase()`, `substring()`, and `concat()` don't modify the original string. They return new String objects with the desired content.

## Building Your First Immutable Class

Let's create an immutable class step by step, understanding each design decision:

```java
// Poor Design: Mutable Person class
class MutablePerson {
    public String name;        // Public fields = bad
    public int age;
  
    public MutablePerson(String name, int age) {
        this.name = name;
        this.age = age;
    }
  
    // Anyone can change the state!
    // person.name = "Different Name";
    // person.age = -100;  // Invalid but possible
}

// Excellent Design: Immutable Person class
public final class ImmutablePerson {
    // Step 1: All fields are private and final
    private final String name;
    private final int age;
  
    // Step 2: Constructor validates and sets all fields
    public ImmutablePerson(String name, int age) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative");
        }
      
        this.name = name.trim();
        this.age = age;
    }
  
    // Step 3: Only provide getters, no setters
    public String getName() {
        return name;
    }
  
    public int getAge() {
        return age;
    }
  
    // Step 4: Any "modification" returns a new object
    public ImmutablePerson withAge(int newAge) {
        return new ImmutablePerson(this.name, newAge);
    }
  
    public ImmutablePerson withName(String newName) {
        return new ImmutablePerson(newName, this.age);
    }
  
    // Step 5: Implement equals, hashCode, and toString
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
      
        ImmutablePerson person = (ImmutablePerson) obj;
        return age == person.age && name.equals(person.name);
    }
  
    @Override
    public int hashCode() {
        return 31 * name.hashCode() + age;
    }
  
    @Override
    public String toString() {
        return "ImmutablePerson{name='" + name + "', age=" + age + "}";
    }
}
```

```
Immutable Class Design Pattern:

┌─────────────────────────────────┐
│        Class Declaration        │
│    final class (no subclass)    │
├─────────────────────────────────┤
│         Private Fields          │
│    final (set once in ctor)     │
├─────────────────────────────────┤
│        Constructor Only         │
│  (validates, sets all fields)   │
├─────────────────────────────────┤
│        Getter Methods           │
│     (no setter methods)         │
├─────────────────────────────────┤
│      "With" Methods             │
│  (return new objects with       │
│   modified state)               │
├─────────────────────────────────┤
│   equals/hashCode/toString      │
│    (based on field values)      │
└─────────────────────────────────┘
```

## Defensive Copying: Handling Mutable Objects

When your immutable class contains mutable objects, you must use defensive copying:

```java
import java.util.*;

// Problematic: Mutable object exposure
class ProblematicImmutable {
    private final List<String> items;
  
    public ProblematicImmutable(List<String> items) {
        this.items = items;  // DANGER: Storing reference to mutable object
    }
  
    public List<String> getItems() {
        return items;  // DANGER: Exposing internal mutable state
    }
}

// Correct: Defensive copying
public final class SafeImmutableList {
    private final List<String> items;
  
    public SafeImmutableList(List<String> items) {
        // Defensive copy on input
        this.items = items == null ? 
            Collections.emptyList() : 
            Collections.unmodifiableList(new ArrayList<>(items));
    }
  
    public List<String> getItems() {
        // Return unmodifiable view (defensive copy on output)
        return items;  // Already unmodifiable from constructor
    }
  
    // Proper way to "modify" - return new object
    public SafeImmutableList withItem(String newItem) {
        List<String> newList = new ArrayList<>(this.items);
        newList.add(newItem);
        return new SafeImmutableList(newList);
    }
  
    public SafeImmutableList withoutItem(String itemToRemove) {
        List<String> newList = new ArrayList<>(this.items);
        newList.remove(itemToRemove);
        return new SafeImmutableList(newList);
    }
}

// Usage demonstration
public class DefensiveCopyingDemo {
    public static void main(String[] args) {
        // Create original list
        List<String> originalList = new ArrayList<>();
        originalList.add("Apple");
        originalList.add("Banana");
      
        // Create immutable wrapper
        SafeImmutableList immutableList = new SafeImmutableList(originalList);
      
        // Modifying original list doesn't affect immutable object
        originalList.add("Cherry");
        System.out.println("Original list size: " + originalList.size());      // 3
        System.out.println("Immutable list size: " + immutableList.getItems().size()); // 2
      
        // Cannot modify through the immutable object's getter
        try {
            immutableList.getItems().add("Date");  // Throws UnsupportedOperationException
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify immutable list: " + e.getMessage());
        }
      
        // Proper way to create modified version
        SafeImmutableList newList = immutableList.withItem("Elderberry");
        System.out.println("Original immutable list: " + immutableList.getItems());
        System.out.println("New immutable list: " + newList.getItems());
    }
}
```

> **Defensive Copying Rule** : When an immutable class holds references to mutable objects, always create copies on input (constructor) and return unmodifiable views on output (getters).

## Advanced Pattern: Builder for Complex Immutable Objects

For immutable objects with many fields, the Builder pattern provides a clean API:

```java
public final class ImmutableEmployee {
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String department;
    private final double salary;
    private final List<String> skills;
    private final Map<String, String> metadata;
  
    // Private constructor - only Builder can create instances
    private ImmutableEmployee(Builder builder) {
        this.firstName = builder.firstName;
        this.lastName = builder.lastName;
        this.email = builder.email;
        this.department = builder.department;
        this.salary = builder.salary;
        this.skills = Collections.unmodifiableList(new ArrayList<>(builder.skills));
        this.metadata = Collections.unmodifiableMap(new HashMap<>(builder.metadata));
    }
  
    // Getters
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public String getDepartment() { return department; }
    public double getSalary() { return salary; }
    public List<String> getSkills() { return skills; }
    public Map<String, String> getMetadata() { return metadata; }
  
    // Builder pattern for construction
    public static class Builder {
        private String firstName;
        private String lastName;
        private String email;
        private String department;
        private double salary;
        private List<String> skills = new ArrayList<>();
        private Map<String, String> metadata = new HashMap<>();
      
        public Builder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }
      
        public Builder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }
      
        public Builder email(String email) {
            this.email = email;
            return this;
        }
      
        public Builder department(String department) {
            this.department = department;
            return this;
        }
      
        public Builder salary(double salary) {
            this.salary = salary;
            return this;
        }
      
        public Builder addSkill(String skill) {
            this.skills.add(skill);
            return this;
        }
      
        public Builder addMetadata(String key, String value) {
            this.metadata.put(key, value);
            return this;
        }
      
        public ImmutableEmployee build() {
            // Validation before construction
            if (firstName == null || lastName == null || email == null) {
                throw new IllegalStateException("First name, last name, and email are required");
            }
            return new ImmutableEmployee(this);
        }
    }
  
    // Method to create modified versions
    public Builder toBuilder() {
        return new Builder()
            .firstName(this.firstName)
            .lastName(this.lastName)
            .email(this.email)
            .department(this.department)
            .salary(this.salary);
        // Note: Would need to copy skills and metadata too in real implementation
    }
  
    @Override
    public String toString() {
        return String.format("Employee{%s %s, %s, %s, $%.2f}", 
            firstName, lastName, email, department, salary);
    }
}

// Usage example
public class BuilderPatternDemo {
    public static void main(String[] args) {
        // Build complex immutable object step by step
        ImmutableEmployee employee = new ImmutableEmployee.Builder()
            .firstName("John")
            .lastName("Doe")
            .email("john.doe@company.com")
            .department("Engineering")
            .salary(75000.0)
            .addSkill("Java")
            .addSkill("Spring")
            .addMetadata("office", "Building A")
            .addMetadata("manager", "Jane Smith")
            .build();
      
        System.out.println("Original: " + employee);
      
        // Create modified version
        ImmutableEmployee promoted = employee.toBuilder()
            .department("Senior Engineering")
            .salary(85000.0)
            .build();
      
        System.out.println("Promoted: " + promoted);
        System.out.println("Original unchanged: " + employee);
    }
}
```

## Functional Data Structures and Collections

> **Functional Data Structures** : Data structures designed for immutability, where operations return new structures sharing as much data as possible with the original (structural sharing).

```java
import java.util.*;
import java.util.stream.Collectors;

public class FunctionalCollectionsDemo {
  
    // Immutable list implementation with structural sharing
    public static class ImmutableList<T> {
        private final List<T> data;
      
        private ImmutableList(List<T> data) {
            this.data = Collections.unmodifiableList(new ArrayList<>(data));
        }
      
        public static <T> ImmutableList<T> of(T... elements) {
            return new ImmutableList<>(Arrays.asList(elements));
        }
      
        public static <T> ImmutableList<T> empty() {
            return new ImmutableList<>(Collections.emptyList());
        }
      
        // Functional operations - return new immutable lists
        public ImmutableList<T> add(T element) {
            List<T> newData = new ArrayList<>(this.data);
            newData.add(element);
            return new ImmutableList<>(newData);
        }
      
        public ImmutableList<T> remove(T element) {
            List<T> newData = new ArrayList<>(this.data);
            newData.remove(element);
            return new ImmutableList<>(newData);
        }
      
        public <R> ImmutableList<R> map(java.util.function.Function<T, R> mapper) {
            List<R> mapped = this.data.stream()
                .map(mapper)
                .collect(Collectors.toList());
            return new ImmutableList<>(mapped);
        }
      
        public ImmutableList<T> filter(java.util.function.Predicate<T> predicate) {
            List<T> filtered = this.data.stream()
                .filter(predicate)
                .collect(Collectors.toList());
            return new ImmutableList<>(filtered);
        }
      
        public T get(int index) {
            return data.get(index);
        }
      
        public int size() {
            return data.size();
        }
      
        @Override
        public String toString() {
            return data.toString();
        }
    }
  
    public static void main(String[] args) {
        // Create immutable list
        ImmutableList<Integer> numbers = ImmutableList.of(1, 2, 3, 4, 5);
        System.out.println("Original: " + numbers);
      
        // Functional transformations create new lists
        ImmutableList<Integer> withSix = numbers.add(6);
        ImmutableList<Integer> evens = numbers.filter(n -> n % 2 == 0);
        ImmutableList<String> strings = numbers.map(n -> "Number: " + n);
      
        System.out.println("Original (unchanged): " + numbers);
        System.out.println("With 6 added: " + withSix);
        System.out.println("Even numbers: " + evens);
        System.out.println("As strings: " + strings);
      
        // Chaining operations
        ImmutableList<Integer> result = numbers
            .filter(n -> n > 2)
            .map(n -> n * 2)
            .add(100);
      
        System.out.println("Chained operations: " + result);
    }
}
```

```
Functional Data Structure Operations:

Original List: [1, 2, 3]
                 ↓
              add(4)
                 ↓
New List: [1, 2, 3, 4]

┌─────────────────┐    ┌─────────────────┐
│ Original List   │    │ New List        │
│ [1, 2, 3]      │    │ [1, 2, 3, 4]   │
│ (unchanged)     │    │ (new object)    │
└─────────────────┘    └─────────────────┘
```

## Thread Safety and Concurrent Access

> **Thread Safety Guarantee** : Immutable objects are inherently thread-safe. Multiple threads can read them simultaneously without any synchronization mechanisms.

```java
import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;

public class ThreadSafetyDemo {
  
    // Thread-safe immutable counter
    public static final class ImmutableCounter {
        private final int value;
      
        public ImmutableCounter(int value) {
            this.value = value;
        }
      
        public int getValue() {
            return value;
        }
      
        public ImmutableCounter increment() {
            return new ImmutableCounter(value + 1);
        }
      
        public ImmutableCounter add(int amount) {
            return new ImmutableCounter(value + amount);
        }
      
        @Override
        public String toString() {
            return "Counter{" + value + "}";
        }
    }
  
    public static void main(String[] args) throws InterruptedException {
        ImmutableCounter initialCounter = new ImmutableCounter(0);
      
        // Multiple threads can safely read the same immutable object
        ExecutorService executor = Executors.newFixedThreadPool(10);
        List<Future<ImmutableCounter>> futures = new ArrayList<>();
      
        // Start 100 tasks that each increment the counter
        for (int i = 0; i < 100; i++) {
            final int taskId = i;
            Future<ImmutableCounter> future = executor.submit(() -> {
                // Each thread works with its own counter object
                ImmutableCounter myCounter = initialCounter;
              
                // Simulate some work
                for (int j = 0; j < 10; j++) {
                    myCounter = myCounter.increment();
                  
                    // Safe to read original counter from any thread
                    System.out.println("Task " + taskId + 
                        " - My counter: " + myCounter.getValue() + 
                        ", Original: " + initialCounter.getValue());
                }
              
                return myCounter;
            });
            futures.add(future);
        }
      
        // Collect results
        System.out.println("\nFinal Results:");
        for (int i = 0; i < futures.size(); i++) {
            try {
                ImmutableCounter result = futures.get(i).get();
                System.out.println("Task " + i + " final counter: " + result);
            } catch (ExecutionException e) {
                e.printStackTrace();
            }
        }
      
        // Original counter is completely unchanged
        System.out.println("Original counter (unchanged): " + initialCounter);
      
        executor.shutdown();
    }
}
```

> **Key Insight** : With immutable objects, you never need locks, synchronization, or volatile keywords for read operations. This eliminates entire categories of concurrency bugs.

## Performance Considerations and Memory Management

While immutability provides safety and simplicity, it does have performance implications:

```java
public class PerformanceConsiderations {
  
    // Inefficient: Creating many intermediate objects
    public static String inefficientStringBuilding(String[] words) {
        String result = "";
        for (String word : words) {
            result = result + word + " ";  // Creates new String each iteration!
        }
        return result.trim();
    }
  
    // Efficient: Use StringBuilder for building, then create immutable result
    public static String efficientStringBuilding(String[] words) {
        StringBuilder builder = new StringBuilder();
        for (String word : words) {
            builder.append(word).append(" ");
        }
        return builder.toString().trim();  // Single immutable String at end
    }
  
    // Memory-efficient immutable class with lazy initialization
    public static final class LazyImmutablePerson {
        private final String firstName;
        private final String lastName;
      
        // Lazily computed fields
        private volatile String fullName;      // volatile for thread safety
        private volatile int hashCodeCache;
        private volatile boolean hashCodeCached = false;
      
        public LazyImmutablePerson(String firstName, String lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
        }
      
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
      
        // Expensive computation done only once
        public String getFullName() {
            if (fullName == null) {
                // Thread-safe lazy initialization (double-checked locking not needed for Strings)
                fullName = firstName + " " + lastName;
            }
            return fullName;
        }
      
        @Override
        public int hashCode() {
            if (!hashCodeCached) {
                hashCodeCache = 31 * firstName.hashCode() + lastName.hashCode();
                hashCodeCached = true;
            }
            return hashCodeCache;
        }
      
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (!(obj instanceof LazyImmutablePerson)) return false;
          
            LazyImmutablePerson other = (LazyImmutablePerson) obj;
            return firstName.equals(other.firstName) && lastName.equals(other.lastName);
        }
    }
  
    public static void main(String[] args) {
        // Demonstrate performance difference
        String[] words = {"Java", "is", "a", "powerful", "programming", "language"};
      
        long start = System.nanoTime();
        String inefficient = inefficientStringBuilding(words);
        long inefficientTime = System.nanoTime() - start;
      
        start = System.nanoTime();
        String efficient = efficientStringBuilding(words);
        long efficientTime = System.nanoTime() - start;
      
        System.out.println("Inefficient result: " + inefficient);
        System.out.println("Efficient result: " + efficient);
        System.out.println("Inefficient time: " + inefficientTime + " ns");
        System.out.println("Efficient time: " + efficientTime + " ns");
        System.out.println("Speedup: " + (inefficientTime / (double) efficientTime) + "x");
      
        // Demonstrate lazy initialization
        LazyImmutablePerson person = new LazyImmutablePerson("John", "Doe");
        System.out.println("\nCreated person, full name not computed yet");
      
        System.out.println("First call to getFullName(): " + person.getFullName());
        System.out.println("Second call to getFullName(): " + person.getFullName());
        System.out.println("Subsequent calls reuse cached value");
    }
}
```

```
Memory Usage Pattern:

Mutable Approach:
┌────────────┐
│ One Object │ ← Same memory location
│ (modified  │   (reused)
│  in place) │
└────────────┘

Immutable Approach:
┌────────────┐  ┌────────────┐  ┌────────────┐
│  Object 1  │  │  Object 2  │  │  Object 3  │
│ (original) │  │ (modified) │  │ (further   │
│            │  │            │  │  modified) │
└────────────┘  └────────────┘  └────────────┘
       ↑               ↑               ↑
   Eligible for    Eligible for    Current
   GC if no refs   GC if no refs   version

Strategy: Use mutable builders, create immutable results
```

## Enterprise Patterns and Best Practices

> **Value Objects Pattern** : In enterprise applications, immutable objects are perfect for representing values that should never change, like money amounts, dates, or identifiers.

```java
import java.math.BigDecimal;
import java.util.Currency;
import java.util.Objects;

// Enterprise-grade immutable Money class
public final class Money {
    private final BigDecimal amount;
    private final Currency currency;
  
    private Money(BigDecimal amount, Currency currency) {
        this.amount = Objects.requireNonNull(amount, "Amount cannot be null");
        this.currency = Objects.requireNonNull(currency, "Currency cannot be null");
      
        if (amount.scale() > currency.getDefaultFractionDigits()) {
            throw new IllegalArgumentException(
                "Amount precision exceeds currency precision");
        }
    }
  
    // Factory methods for different creation scenarios
    public static Money of(BigDecimal amount, Currency currency) {
        return new Money(amount, currency);
    }
  
    public static Money of(double amount, Currency currency) {
        return new Money(BigDecimal.valueOf(amount), currency);
    }
  
    public static Money usd(double amount) {
        return of(amount, Currency.getInstance("USD"));
    }
  
    public static Money eur(double amount) {
        return of(amount, Currency.getInstance("EUR"));
    }
  
    // Getters
    public BigDecimal getAmount() { return amount; }
    public Currency getCurrency() { return currency; }
  
    // Mathematical operations return new Money objects
    public Money add(Money other) {
        requireSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }
  
    public Money subtract(Money other) {
        requireSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }
  
    public Money multiply(BigDecimal multiplier) {
        return new Money(this.amount.multiply(multiplier), this.currency);
    }
  
    public Money multiply(double multiplier) {
        return multiply(BigDecimal.valueOf(multiplier));
    }
  
    // Comparison methods
    public boolean isGreaterThan(Money other) {
        requireSameCurrency(other);
        return this.amount.compareTo(other.amount) > 0;
    }
  
    public boolean isLessThan(Money other) {
        requireSameCurrency(other);
        return this.amount.compareTo(other.amount) < 0;
    }
  
    // Helper method
    private void requireSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                "Cannot operate on different currencies: " + 
                this.currency + " and " + other.currency);
        }
    }
  
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Money)) return false;
      
        Money money = (Money) obj;
        return amount.equals(money.amount) && currency.equals(money.currency);
    }
  
    @Override
    public int hashCode() {
        return Objects.hash(amount, currency);
    }
  
    @Override
    public String toString() {
        return String.format("%s %s", currency.getCurrencyCode(), amount);
    }
}

// Usage in enterprise application
public class EnterpriseUsageDemo {
  
    // Immutable transaction record
    public static final class Transaction {
        private final String id;
        private final Money amount;
        private final String fromAccount;
        private final String toAccount;
        private final java.time.Instant timestamp;
      
        public Transaction(String id, Money amount, String fromAccount, 
                          String toAccount, java.time.Instant timestamp) {
            this.id = Objects.requireNonNull(id);
            this.amount = Objects.requireNonNull(amount);
            this.fromAccount = Objects.requireNonNull(fromAccount);
            this.toAccount = Objects.requireNonNull(toAccount);
            this.timestamp = Objects.requireNonNull(timestamp);
        }
      
        // Getters only - no setters
        public String getId() { return id; }
        public Money getAmount() { return amount; }
        public String getFromAccount() { return fromAccount; }
        public String getToAccount() { return toAccount; }
        public java.time.Instant getTimestamp() { return timestamp; }
      
        @Override
        public String toString() {
            return String.format("Transaction{%s: %s from %s to %s at %s}", 
                id, amount, fromAccount, toAccount, timestamp);
        }
    }
  
    public static void main(String[] args) {
        // Create immutable money objects
        Money salary = Money.usd(5000.00);
        Money bonus = Money.usd(1000.00);
        Money tax = Money.usd(1500.00);
      
        // Safe calculations - original objects never change
        Money totalIncome = salary.add(bonus);
        Money netIncome = totalIncome.subtract(tax);
      
        System.out.println("Salary: " + salary);
        System.out.println("Bonus: " + bonus);
        System.out.println("Total Income: " + totalIncome);
        System.out.println("After Tax: " + netIncome);
      
        // Create immutable transaction
        Transaction payment = new Transaction(
            "TXN-001",
            netIncome,
            "PAYROLL",
            "EMPLOYEE-123",
            java.time.Instant.now()
        );
      
        System.out.println("\nTransaction: " + payment);
      
        // Thread-safe sharing - multiple threads can safely read these objects
        processTransaction(payment);  // Safe to pass around
        auditTransaction(payment);    // No risk of modification
      
        // Original objects remain unchanged
        System.out.println("\nOriginal salary still: " + salary);
    }
  
    public static void processTransaction(Transaction transaction) {
        // Can safely use transaction without fear of modification
        System.out.println("Processing: " + transaction.getId());
    }
  
    public static void auditTransaction(Transaction transaction) {
        // Can safely audit without fear of modification
        System.out.println("Auditing: " + transaction.getAmount());
    }
}
```

## Summary: When and How to Use Immutability

> **Design Principle** : Prefer immutability by default. Make objects mutable only when you have a compelling performance or design reason.

**Use immutable objects for:**

* Value objects (Money, Date, Coordinate, etc.)
* Configuration and settings
* Data transfer objects (DTOs)
* API responses and requests
* Threading scenarios
* Functional programming styles

**Use mutable objects for:**

* Builder patterns (during construction)
* Performance-critical scenarios with frequent updates
* Large collections that change frequently
* Integration with mutable frameworks

```java
// Quick reference: Immutable class checklist
public final class ImmutableTemplate {
    // ✓ final class (prevent subclassing)
    // ✓ private final fields
    // ✓ constructor validation
    // ✓ no setters
    // ✓ defensive copying for mutable fields
    // ✓ proper equals/hashCode/toString
    // ✓ "with" methods for modifications
}
```

**The immutability mindset shift:**

* Instead of changing objects, create new ones
* Think in terms of transformations, not mutations
* Embrace the safety and predictability it provides
* Use builders for complex construction
* Leverage Java's built-in immutable types

Immutability is a powerful tool for writing safer, more predictable, and more maintainable Java code. Start with simple immutable classes and gradually incorporate more advanced patterns as your applications grow in complexity.
