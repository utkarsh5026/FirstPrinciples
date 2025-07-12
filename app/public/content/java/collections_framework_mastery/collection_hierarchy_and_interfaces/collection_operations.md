# Collection Operations in Java: From Imperative to Functional Programming

Let me explain Java collection operations from the ground up, starting with why we need them and how they evolved to support modern functional programming paradigms.

## First Principles: What Are Collection Operations?

Before diving into specific operations, let's understand the fundamental problem we're solving:

> **Core Concept** : In programming, we constantly need to process groups of data - finding items that match criteria, transforming data, combining results, or extracting statistics. Collection operations provide systematic ways to perform these tasks efficiently and expressively.

```java
// The fundamental challenge: processing groups of data
import java.util.*;

public class DataProcessingEvolution {
    public static void main(String[] args) {
        // Sample data: employee salaries
        List<Integer> salaries = Arrays.asList(45000, 55000, 65000, 75000, 85000);
      
        // Challenge: Find average salary of employees earning > 60000
        // We'll see how this evolved from imperative to functional approaches
    }
}
```

## The Evolution: From Imperative to Functional Operations

### Traditional Imperative Approach (Pre-Java 8)

```java
import java.util.*;

public class ImperativeCollectionOperations {
    public static void main(String[] args) {
        List<Integer> salaries = Arrays.asList(45000, 55000, 65000, 75000, 85000);
      
        // Imperative approach: manually control the "how"
        List<Integer> highSalaries = new ArrayList<>();
      
        // Step 1: Filter salaries > 60000
        for (Integer salary : salaries) {
            if (salary > 60000) {
                highSalaries.add(salary);
            }
        }
      
        // Step 2: Calculate average
        int sum = 0;
        for (Integer salary : highSalaries) {
            sum += salary;
        }
        double average = (double) sum / highSalaries.size();
      
        System.out.println("High salaries: " + highSalaries);
        System.out.println("Average high salary: " + average);
    }
}
```

**Problems with imperative approach:**

* Verbose and error-prone
* Mixes "what" we want with "how" to achieve it
* Difficult to parallelize
* Hard to compose operations

### Modern Functional Approach (Java 8+)

```java
import java.util.*;
import java.util.stream.Collectors;

public class FunctionalCollectionOperations {
    public static void main(String[] args) {
        List<Integer> salaries = Arrays.asList(45000, 55000, 65000, 75000, 85000);
      
        // Functional approach: declare "what" we want
        double averageHighSalary = salaries.stream()
            .filter(salary -> salary > 60000)  // What: keep high salaries
            .mapToInt(Integer::intValue)        // What: convert to int stream
            .average()                          // What: calculate average
            .orElse(0.0);                      // What: default if empty
      
        System.out.println("Average high salary: " + averageHighSalary);
      
        // Collect high salaries for display
        List<Integer> highSalaries = salaries.stream()
            .filter(salary -> salary > 60000)
            .collect(Collectors.toList());
      
        System.out.println("High salaries: " + highSalaries);
    }
}
```

> **Key Philosophy Shift** : Functional operations separate "what" we want from "how" it's computed. This makes code more readable, testable, and enables automatic optimizations like parallelization.

## Understanding Bulk Operations

Bulk operations work on entire collections at once, rather than individual elements:

```java
import java.util.*;
import java.util.function.Predicate;

public class BulkOperationsDemo {
    public static void main(String[] args) {
        List<String> employees = new ArrayList<>(
            Arrays.asList("Alice", "Bob", "Charlie", "David", "Eve")
        );
      
        // Traditional bulk operations (modify the collection)
        System.out.println("=== Traditional Bulk Operations ===");
      
        // removeIf: bulk removal based on predicate
        List<String> temp1 = new ArrayList<>(employees);
        temp1.removeIf(name -> name.length() < 4);
        System.out.println("Names with 4+ characters: " + temp1);
      
        // replaceAll: bulk transformation
        List<String> temp2 = new ArrayList<>(employees);
        temp2.replaceAll(String::toUpperCase);
        System.out.println("Uppercase names: " + temp2);
      
        // forEach: bulk action without modification
        System.out.print("Greeting each: ");
        employees.forEach(name -> System.out.print("Hello " + name + " "));
        System.out.println();
      
        // Modern stream-based bulk operations (create new collections)
        System.out.println("\n=== Stream-Based Bulk Operations ===");
      
        // Filter and collect
        List<String> longNames = employees.stream()
            .filter(name -> name.length() > 3)
            .collect(Collectors.toList());
        System.out.println("Long names: " + longNames);
      
        // Transform and collect
        List<String> upperNames = employees.stream()
            .map(String::toUpperCase)
            .collect(Collectors.toList());
        System.out.println("Upper names: " + upperNames);
    }
}
```

> **Immutability Principle** : Stream operations create new collections rather than modifying existing ones, following functional programming principles that reduce side effects and improve thread safety.

## Stream Integration: The Heart of Modern Java Collections

### Understanding the Stream Pipeline

```java
import java.util.*;
import java.util.stream.Collectors;

public class StreamPipelineDemo {
    public static void main(String[] args) {
        List<String> words = Arrays.asList(
            "java", "stream", "functional", "programming", "collection"
        );
      
        // Stream pipeline anatomy:
        // Source -> Intermediate Operations -> Terminal Operation
      
        System.out.println("=== Stream Pipeline Breakdown ===");
      
        // Step-by-step demonstration
        List<String> result = words.stream()              // Source: create stream
            .peek(w -> System.out.println("Processing: " + w))  // Debug: see each element
            .filter(w -> w.length() > 4)                  // Intermediate: filter
            .peek(w -> System.out.println("After filter: " + w))
            .map(String::toUpperCase)                     // Intermediate: transform
            .peek(w -> System.out.println("After map: " + w))
            .sorted()                                     // Intermediate: sort
            .peek(w -> System.out.println("After sort: " + w))
            .collect(Collectors.toList());                // Terminal: collect
      
        System.out.println("Final result: " + result);
    }
}
```

### Stream Characteristics

```java
import java.util.*;
import java.util.stream.Stream;

public class StreamCharacteristics {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
      
        // 1. Lazy Evaluation: intermediate operations are deferred
        System.out.println("=== Lazy Evaluation Demo ===");
        Stream<Integer> stream = numbers.stream()
            .filter(n -> {
                System.out.println("Filtering: " + n);
                return n % 2 == 0;
            })
            .map(n -> {
                System.out.println("Mapping: " + n);
                return n * 2;
            });
      
        System.out.println("Stream created, but no output yet (lazy!)");
        System.out.println("Now calling terminal operation:");
        List<Integer> result = stream.collect(Collectors.toList());
        System.out.println("Result: " + result);
      
        // 2. Single-use: streams can only be consumed once
        System.out.println("\n=== Single-use Nature ===");
        Stream<Integer> singleUseStream = numbers.stream();
        singleUseStream.forEach(System.out::println);
      
        try {
            singleUseStream.forEach(System.out::println);  // This will throw exception
        } catch (IllegalStateException e) {
            System.out.println("Error: " + e.getMessage());
        }
      
        // 3. Internal iteration vs external iteration
        System.out.println("\n=== Internal vs External Iteration ===");
      
        // External iteration (traditional)
        System.out.println("External iteration:");
        for (Integer num : numbers) {
            if (num % 2 == 0) {
                System.out.println("Even: " + num);
            }
        }
      
        // Internal iteration (streams)
        System.out.println("Internal iteration:");
        numbers.stream()
            .filter(n -> n % 2 == 0)
            .forEach(n -> System.out.println("Even: " + n));
    }
}
```

## Functional Operations: Map, Filter, Reduce, and More

### Core Functional Operations

```java
import java.util.*;
import java.util.stream.Collectors;

public class CoreFunctionalOperations {
  
    static class Employee {
        String name;
        String department;
        int salary;
      
        Employee(String name, String department, int salary) {
            this.name = name;
            this.department = department;
            this.salary = salary;
        }
      
        @Override
        public String toString() {
            return name + "(" + department + ", $" + salary + ")";
        }
    }
  
    public static void main(String[] args) {
        List<Employee> employees = Arrays.asList(
            new Employee("Alice", "Engineering", 75000),
            new Employee("Bob", "Marketing", 55000),
            new Employee("Charlie", "Engineering", 85000),
            new Employee("Diana", "Sales", 65000),
            new Employee("Eve", "Marketing", 60000)
        );
      
        // 1. FILTER: Select elements that match a condition
        System.out.println("=== FILTER Operation ===");
        List<Employee> engineers = employees.stream()
            .filter(emp -> emp.department.equals("Engineering"))
            .collect(Collectors.toList());
        System.out.println("Engineers: " + engineers);
      
        // 2. MAP: Transform each element
        System.out.println("\n=== MAP Operation ===");
        List<String> names = employees.stream()
            .map(emp -> emp.name)  // Extract just the name
            .collect(Collectors.toList());
        System.out.println("Employee names: " + names);
      
        // Complex mapping: salary with bonus
        List<Integer> salariesWithBonus = employees.stream()
            .map(emp -> emp.salary + 5000)  // Add $5000 bonus
            .collect(Collectors.toList());
        System.out.println("Salaries with bonus: " + salariesWithBonus);
      
        // 3. REDUCE: Combine elements into a single result
        System.out.println("\n=== REDUCE Operation ===");
      
        // Sum all salaries
        int totalSalaries = employees.stream()
            .mapToInt(emp -> emp.salary)
            .reduce(0, (sum, salary) -> sum + salary);
        System.out.println("Total salaries: $" + totalSalaries);
      
        // Find highest salary
        OptionalInt maxSalary = employees.stream()
            .mapToInt(emp -> emp.salary)
            .reduce(Integer::max);
        System.out.println("Max salary: $" + maxSalary.orElse(0));
      
        // 4. COLLECT: Flexible accumulation
        System.out.println("\n=== COLLECT Operation ===");
      
        // Group by department
        Map<String, List<Employee>> byDepartment = employees.stream()
            .collect(Collectors.groupingBy(emp -> emp.department));
        System.out.println("By department: " + byDepartment);
      
        // Average salary by department
        Map<String, Double> avgSalaryByDept = employees.stream()
            .collect(Collectors.groupingBy(
                emp -> emp.department,
                Collectors.averagingInt(emp -> emp.salary)
            ));
        System.out.println("Average salary by department: " + avgSalaryByDept);
    }
}
```

### Advanced Functional Operations

```java
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class AdvancedFunctionalOperations {
    public static void main(String[] args) {
        List<String> words = Arrays.asList(
            "Java", "Stream", "Functional", "Programming", "Collection", "API"
        );
      
        // 1. FLATMAP: Flatten nested structures
        System.out.println("=== FLATMAP Operation ===");
        List<Character> allCharacters = words.stream()
            .flatMap(word -> word.chars()           // Convert word to IntStream of chars
                .mapToObj(c -> (char) c))           // Convert back to Character stream
            .collect(Collectors.toList());
        System.out.println("All characters: " + allCharacters);
      
        // FlatMap with collections
        List<List<String>> nestedLists = Arrays.asList(
            Arrays.asList("a", "b"),
            Arrays.asList("c", "d", "e"),
            Arrays.asList("f")
        );
      
        List<String> flattened = nestedLists.stream()
            .flatMap(List::stream)  // Flatten the nested lists
            .collect(Collectors.toList());
        System.out.println("Flattened: " + flattened);
      
        // 2. DISTINCT: Remove duplicates
        System.out.println("\n=== DISTINCT Operation ===");
        List<String> withDuplicates = Arrays.asList("a", "b", "a", "c", "b", "d");
        List<String> unique = withDuplicates.stream()
            .distinct()
            .collect(Collectors.toList());
        System.out.println("Unique elements: " + unique);
      
        // 3. LIMIT and SKIP: Control stream size
        System.out.println("\n=== LIMIT and SKIP Operations ===");
        List<Integer> first3 = IntStream.range(1, 10)
            .boxed()
            .limit(3)
            .collect(Collectors.toList());
        System.out.println("First 3 numbers: " + first3);
      
        List<Integer> skip5Take3 = IntStream.range(1, 10)
            .boxed()
            .skip(5)
            .limit(3)
            .collect(Collectors.toList());
        System.out.println("Skip 5, take 3: " + skip5Take3);
      
        // 4. SORTED: Order elements
        System.out.println("\n=== SORTED Operation ===");
        List<String> sortedWords = words.stream()
            .sorted()  // Natural ordering
            .collect(Collectors.toList());
        System.out.println("Sorted alphabetically: " + sortedWords);
      
        List<String> sortedByLength = words.stream()
            .sorted(Comparator.comparing(String::length))  // Custom comparator
            .collect(Collectors.toList());
        System.out.println("Sorted by length: " + sortedByLength);
      
        // 5. MATCHING operations: anyMatch, allMatch, noneMatch
        System.out.println("\n=== MATCHING Operations ===");
        boolean hasLongWord = words.stream()
            .anyMatch(word -> word.length() > 8);
        System.out.println("Has word longer than 8 chars: " + hasLongWord);
      
        boolean allCapitalized = words.stream()
            .allMatch(word -> Character.isUpperCase(word.charAt(0)));
        System.out.println("All words capitalized: " + allCapitalized);
      
        boolean noneEmpty = words.stream()
            .noneMatch(String::isEmpty);
        System.out.println("No empty words: " + noneEmpty);
    }
}
```

## Advanced Collection Operations and Patterns

### Custom Collectors

```java
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;

public class CustomCollectorDemo {
  
    static class Product {
        String name;
        String category;
        double price;
      
        Product(String name, String category, double price) {
            this.name = name;
            this.category = category;
            this.price = price;
        }
      
        @Override
        public String toString() {
            return name + "($" + price + ")";
        }
    }
  
    public static void main(String[] args) {
        List<Product> products = Arrays.asList(
            new Product("Laptop", "Electronics", 999.99),
            new Product("Phone", "Electronics", 699.99),
            new Product("Shirt", "Clothing", 29.99),
            new Product("Jeans", "Clothing", 59.99),
            new Product("Book", "Media", 19.99)
        );
      
        // 1. Built-in collectors
        System.out.println("=== Built-in Collectors ===");
      
        // Group by category and count
        Map<String, Long> countByCategory = products.stream()
            .collect(Collectors.groupingBy(
                p -> p.category,
                Collectors.counting()
            ));
        System.out.println("Count by category: " + countByCategory);
      
        // Group by category and find max price
        Map<String, Optional<Product>> maxPriceByCategory = products.stream()
            .collect(Collectors.groupingBy(
                p -> p.category,
                Collectors.maxBy(Comparator.comparing(p -> p.price))
            ));
        System.out.println("Most expensive by category: " + maxPriceByCategory);
      
        // 2. Custom collector: collect to delimited string
        System.out.println("\n=== Custom Collector ===");
      
        String productNames = products.stream()
            .map(p -> p.name)
            .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("Product names: " + productNames);
      
        // 3. Partitioning (special case of grouping)
        System.out.println("\n=== Partitioning ===");
      
        Map<Boolean, List<Product>> expensivePartition = products.stream()
            .collect(Collectors.partitioningBy(p -> p.price > 50));
        System.out.println("Expensive products: " + expensivePartition.get(true));
        System.out.println("Cheap products: " + expensivePartition.get(false));
      
        // 4. Multi-level grouping
        System.out.println("\n=== Multi-level Grouping ===");
      
        Map<String, Map<String, List<Product>>> nestedGrouping = products.stream()
            .collect(Collectors.groupingBy(
                p -> p.category,
                Collectors.groupingBy(p -> p.price > 50 ? "Expensive" : "Cheap")
            ));
        System.out.println("Nested grouping: " + nestedGrouping);
    }
}
```

### Parallel Stream Operations

```java
import java.util.*;
import java.util.concurrent.ForkJoinPool;
import java.util.stream.IntStream;

public class ParallelStreamDemo {
    public static void main(String[] args) {
        // Create large dataset for meaningful comparison
        List<Integer> numbers = IntStream.range(1, 1000000)
            .boxed()
            .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
      
        // 1. Sequential vs Parallel comparison
        System.out.println("=== Sequential vs Parallel Performance ===");
      
        // Sequential processing
        long startTime = System.currentTimeMillis();
        long sequentialSum = numbers.stream()
            .mapToLong(n -> n * n)  // Expensive operation: square each number
            .sum();
        long sequentialTime = System.currentTimeMillis() - startTime;
      
        // Parallel processing
        startTime = System.currentTimeMillis();
        long parallelSum = numbers.parallelStream()
            .mapToLong(n -> n * n)  // Same expensive operation
            .sum();
        long parallelTime = System.currentTimeMillis() - startTime;
      
        System.out.println("Sequential sum: " + sequentialSum + " (took " + sequentialTime + "ms)");
        System.out.println("Parallel sum: " + parallelSum + " (took " + parallelTime + "ms)");
        System.out.println("Speedup: " + (double) sequentialTime / parallelTime + "x");
      
        // 2. When NOT to use parallel streams
        System.out.println("\n=== When NOT to Use Parallel Streams ===");
      
        List<String> words = Arrays.asList("java", "stream", "parallel", "sequential");
      
        // BAD: Small dataset - overhead > benefit
        List<String> upperWords = words.parallelStream()  // Overkill for 4 elements
            .map(String::toUpperCase)
            .collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
        System.out.println("Small dataset result: " + upperWords);
      
        // 3. Thread pool configuration
        System.out.println("\n=== Custom Thread Pool ===");
      
        // Default: uses common ForkJoinPool
        System.out.println("Default parallelism: " + 
            ForkJoinPool.commonPool().getParallelism());
      
        // Custom thread pool
        ForkJoinPool customThreadPool = new ForkJoinPool(2);
        try {
            Integer result = customThreadPool.submit(() ->
                IntStream.range(1, 100)
                    .parallel()
                    .map(n -> {
                        System.out.println("Processing " + n + " on " + 
                            Thread.currentThread().getName());
                        return n * n;
                    })
                    .sum()
            ).get();
            System.out.println("Custom pool result: " + result);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            customThreadPool.shutdown();
        }
    }
}
```

> **Parallel Stream Guidelines** : Use parallel streams for CPU-intensive operations on large datasets (typically 1000+ elements). Avoid for I/O operations, small datasets, or operations with side effects. The overhead of thread coordination can outweigh benefits for simple operations.

## Performance Considerations and Best Practices

### Memory and Performance Optimization

```java
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class PerformanceOptimization {
    public static void main(String[] args) {
        // 1. Avoid unnecessary boxing/unboxing
        System.out.println("=== Primitive Streams for Performance ===");
      
        // BAD: Boxing overhead
        long badSum = IntStream.range(1, 1000000)
            .boxed()                    // int -> Integer (boxing)
            .mapToInt(Integer::intValue) // Integer -> int (unboxing)
            .sum();
      
        // GOOD: Stay primitive
        long goodSum = IntStream.range(1, 1000000)
            .sum();  // No boxing/unboxing
      
        System.out.println("Sums equal: " + (badSum == goodSum));
      
        // 2. Short-circuit operations
        System.out.println("\n=== Short-circuit Optimization ===");
      
        List<Integer> numbers = IntStream.range(1, 1000000)
            .boxed()
            .collect(Collectors.toList());
      
        // findFirst stops at first match - efficient
        Optional<Integer> firstEven = numbers.stream()
            .filter(n -> {
                System.out.println("Checking: " + n);  // See how many we check
                return n % 2 == 0;
            })
            .findFirst();
        System.out.println("First even: " + firstEven.get());
      
        // 3. Order matters for performance
        System.out.println("\n=== Operation Order Optimization ===");
      
        List<String> words = Arrays.asList(
            "java", "stream", "performance", "optimization", "functional", 
            "programming", "collection", "api", "lambda", "method"
        );
      
        // BAD: Expensive operation first
        long badCount = words.stream()
            .map(String::toUpperCase)      // Transform all first
            .filter(w -> w.length() > 5)   // Then filter
            .count();
      
        // GOOD: Filter first, then transform
        long goodCount = words.stream()
            .filter(w -> w.length() > 5)   // Filter first (cheaper)
            .map(String::toUpperCase)      // Transform only survivors
            .count();
      
        System.out.println("Counts equal: " + (badCount == goodCount));
      
        // 4. Reuse expensive predicates
        System.out.println("\n=== Predicate Reuse ===");
      
        // Create reusable predicates for complex conditions
        java.util.function.Predicate<String> isLong = w -> w.length() > 6;
        java.util.function.Predicate<String> startsWithP = w -> w.startsWith("p");
        java.util.function.Predicate<String> complexCondition = isLong.and(startsWithP);
      
        List<String> filtered = words.stream()
            .filter(complexCondition)
            .collect(Collectors.toList());
        System.out.println("Complex filtered: " + filtered);
    }
}
```

### Common Pitfalls and Debugging

```java
import java.util.*;
import java.util.stream.Collectors;

public class CommonPitfalls {
    public static void main(String[] args) {
        // 1. Modifying source during stream operations
        System.out.println("=== Pitfall: Concurrent Modification ===");
      
        List<Integer> numbers = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
      
        try {
            // BAD: Modifying source collection during stream
            numbers.stream()
                .filter(n -> n % 2 == 0)
                .forEach(n -> numbers.remove(n));  // ConcurrentModificationException
        } catch (Exception e) {
            System.out.println("Error: " + e.getClass().getSimpleName());
        }
      
        // GOOD: Collect what to remove, then remove
        List<Integer> toRemove = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        numbers.removeAll(toRemove);
        System.out.println("After safe removal: " + numbers);
      
        // 2. Side effects in functional operations
        System.out.println("\n=== Pitfall: Side Effects ===");
      
        List<String> words = Arrays.asList("java", "stream", "functional");
        List<String> sideEffectList = new ArrayList<>();
      
        // BAD: Side effects in map operation
        List<String> upperWords = words.stream()
            .map(w -> {
                sideEffectList.add(w);  // Side effect - unpredictable in parallel
                return w.toUpperCase();
            })
            .collect(Collectors.toList());
      
        System.out.println("Upper words: " + upperWords);
        System.out.println("Side effect list: " + sideEffectList);
      
        // GOOD: Use peek for side effects or forEach for terminal side effects
        sideEffectList.clear();
        words.stream()
            .peek(sideEffectList::add)  // Explicit side effect
            .map(String::toUpperCase)
            .forEach(System.out::println);
      
        // 3. Forgetting terminal operations
        System.out.println("\n=== Pitfall: Missing Terminal Operation ===");
      
        // BAD: No terminal operation - nothing happens!
        numbers.stream()
            .filter(n -> n > 0)
            .map(n -> {
                System.out.println("Processing: " + n);  // This won't print!
                return n * 2;
            });
        System.out.println("No output above because no terminal operation");
      
        // GOOD: Add terminal operation
        numbers.stream()
            .filter(n -> n > 0)
            .map(n -> {
                System.out.println("Processing: " + n);  // This will print
                return n * 2;
            })
            .forEach(result -> {}); // Terminal operation (even if empty)
      
        // 4. Null handling in streams
        System.out.println("\n=== Pitfall: Null Values ===");
      
        List<String> wordsWithNull = Arrays.asList("java", null, "stream", null, "api");
      
        // BAD: NullPointerException waiting to happen
        try {
            List<Integer> lengths = wordsWithNull.stream()
                .map(String::length)  // NPE on null values
                .collect(Collectors.toList());
        } catch (NullPointerException e) {
            System.out.println("NPE caught: " + e.getMessage());
        }
      
        // GOOD: Filter nulls first
        List<Integer> safeLengths = wordsWithNull.stream()
            .filter(Objects::nonNull)  // Remove nulls first
            .map(String::length)
            .collect(Collectors.toList());
        System.out.println("Safe lengths: " + safeLengths);
    }
}
```

## Real-World Application Patterns

### Data Processing Pipeline

```java
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;

public class DataProcessingPipeline {
  
    static class Transaction {
        String id;
        String customerId;
        double amount;
        String type;
        LocalDate date;
      
        Transaction(String id, String customerId, double amount, String type, LocalDate date) {
            this.id = id;
            this.customerId = customerId;
            this.amount = amount;
            this.type = type;
            this.date = date;
        }
      
        @Override
        public String toString() {
            return String.format("%s: $%.2f (%s)", id, amount, type);
        }
    }
  
    static class Customer {
        String id;
        String name;
        String tier;
      
        Customer(String id, String name, String tier) {
            this.id = id;
            this.name = name;
            this.tier = tier;
        }
      
        @Override
        public String toString() {
            return name + "(" + tier + ")";
        }
    }
  
    public static void main(String[] args) {
        // Sample data
        List<Transaction> transactions = Arrays.asList(
            new Transaction("T1", "C1", 100.0, "PURCHASE", LocalDate.of(2024, 1, 15)),
            new Transaction("T2", "C2", 250.0, "PURCHASE", LocalDate.of(2024, 1, 16)),
            new Transaction("T3", "C1", 50.0, "REFUND", LocalDate.of(2024, 1, 17)),
            new Transaction("T4", "C3", 500.0, "PURCHASE", LocalDate.of(2024, 1, 18)),
            new Transaction("T5", "C2", 75.0, "PURCHASE", LocalDate.of(2024, 1, 19))
        );
      
        List<Customer> customers = Arrays.asList(
            new Customer("C1", "Alice", "GOLD"),
            new Customer("C2", "Bob", "SILVER"), 
            new Customer("C3", "Charlie", "PLATINUM")
        );
      
        // Convert customers to map for lookup
        Map<String, Customer> customerMap = customers.stream()
            .collect(Collectors.toMap(c -> c.id, c -> c));
      
        // Complex data processing pipeline
        System.out.println("=== Transaction Analysis Pipeline ===");
      
        // Pipeline: Filter -> Enrich -> Group -> Aggregate -> Sort
        Map<String, Double> customerPurchaseTotals = transactions.stream()
            // 1. Filter: Only purchases (not refunds)
            .filter(t -> t.type.equals("PURCHASE"))
          
            // 2. Enrich: Add customer information
            .filter(t -> customerMap.containsKey(t.customerId))
          
            // 3. Group by customer and sum amounts
            .collect(Collectors.groupingBy(
                t -> customerMap.get(t.customerId).name,
                Collectors.summingDouble(t -> t.amount)
            ));
      
        // 4. Sort by total amount (descending)
        List<Map.Entry<String, Double>> sortedTotals = customerPurchaseTotals.entrySet()
            .stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .collect(Collectors.toList());
      
        System.out.println("Customer purchase totals (sorted):");
        sortedTotals.forEach(entry -> 
            System.out.printf("%s: $%.2f%n", entry.getKey(), entry.getValue()));
      
        // Advanced: Multi-dimensional analysis
        System.out.println("\n=== Advanced Analysis ===");
      
        // Group by customer tier and transaction type, then calculate statistics
        Map<String, Map<String, DoubleSummaryStatistics>> tierTypeStats = transactions.stream()
            .filter(t -> customerMap.containsKey(t.customerId))
            .collect(Collectors.groupingBy(
                t -> customerMap.get(t.customerId).tier,  // Group by tier
                Collectors.groupingBy(
                    t -> t.type,  // Then by transaction type
                    Collectors.summarizingDouble(t -> t.amount)  // Get statistics
                )
            ));
      
        tierTypeStats.forEach((tier, typeStats) -> {
            System.out.println(tier + " tier customers:");
            typeStats.forEach((type, stats) -> {
                System.out.printf("  %s: avg=$%.2f, total=$%.2f, count=%d%n",
                    type, stats.getAverage(), stats.getSum(), stats.getCount());
            });
        });
    }
}
```

> **Enterprise Pattern** : Real-world data processing often follows the pattern: Filter → Enrich → Transform → Group → Aggregate → Sort. Stream operations make this pipeline explicit and composable, improving both readability and maintainability.

## Summary: Key Takeaways

> **Fundamental Shift** : Collection operations in Java evolved from imperative "how" to functional "what" - focusing on declaring intent rather than implementation details.

**Core Principles:**

1. **Immutability** : Stream operations create new collections rather than modifying existing ones
2. **Lazy Evaluation** : Intermediate operations are deferred until a terminal operation is called
3. **Composability** : Operations can be chained to build complex data processing pipelines
4. **Parallelization** : Operations can be automatically parallelized for performance

**Best Practices:**

* Use primitive streams (IntStream, LongStream, DoubleStream) for numeric operations
* Filter early in the pipeline to reduce subsequent processing
* Avoid side effects in functional operations
* Consider parallel streams only for CPU-intensive operations on large datasets
* Always include a terminal operation to execute the stream pipeline

**Common Patterns:**

* **ETL Pipeline** : Extract → Transform → Load using filter → map → collect
* **Statistical Analysis** : Group → Aggregate → Sort for business intelligence
* **Data Enrichment** : Join streams with lookup maps for additional context
* **Conditional Processing** : Use partitioning and grouping for decision logic

The evolution from traditional loops to functional collection operations represents one of the most significant improvements in Java's expressiveness and maintainability, enabling developers to write more readable, testable, and performant data processing code.
