# Java Stream Intermediate Operations: From First Principles

Let me explain Java Stream intermediate operations by first establishing the foundational concepts, then building up to the sophisticated functional programming capabilities they provide.

## Understanding Streams: The Foundation

Before diving into specific operations, let's understand what streams are and why Java introduced them.

> **Core Concept: Streams represent a functional approach to processing collections of data. They transform how we think from "how to iterate" to "what transformation to apply."**

### Traditional vs Stream Approach

```java
import java.util.*;
import java.util.stream.*;

public class StreamFoundations {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Alice", "Bob", "Charlie", "David", "Eve");
      
        // Traditional imperative approach
        List<String> longNamesTraditional = new ArrayList<>();
        for (String name : names) {
            if (name.length() > 3) {          // Filter condition
                longNamesTraditional.add(name.toUpperCase()); // Transform
            }
        }
        Collections.sort(longNamesTraditional);  // Sort
      
        // Modern stream approach - declarative
        List<String> longNamesStream = names.stream()
            .filter(name -> name.length() > 3)    // What to keep
            .map(String::toUpperCase)             // How to transform
            .sorted()                             // How to order
            .collect(Collectors.toList());        // How to collect
          
        System.out.println("Traditional: " + longNamesTraditional);
        System.out.println("Stream: " + longNamesStream);
    }
}
```

**Compilation & Execution:**

```bash
javac StreamFoundations.java
java StreamFoundations
```

> **Key Insight: Streams separate the "what" (the data transformation logic) from the "how" (the iteration mechanism). This makes code more readable, maintainable, and potentially more efficient.**

## What Are Intermediate Operations?

```
Stream Pipeline Structure:
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│   Source    │───▶│  Intermediate   │───▶│  Terminal   │
│ (Collection)│    │   Operations    │    │ Operation   │
│             │    │ (Lazy/Chainable)│    │ (Triggers)  │
└─────────────┘    └─────────────────┘    └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  filter()   │
                    │   map()     │
                    │ flatMap()   │
                    │ distinct()  │
                    │  sorted()   │
                    │  limit()    │
                    │   skip()    │
                    └─────────────┘
```

> **Fundamental Principle: Intermediate operations are lazy - they don't execute until a terminal operation is called. They return a new stream, allowing for method chaining.**

## 1. filter() - Selective Data Processing

The `filter()` operation implements predicate-based selection, keeping only elements that satisfy a given condition.

```java
import java.util.*;
import java.util.stream.*;
import java.util.function.Predicate;

public class FilterOperations {
    static class Product {
        private String name;
        private double price;
        private String category;
      
        public Product(String name, double price, String category) {
            this.name = name;
            this.price = price;
            this.category = category;
        }
      
        // Getters
        public String getName() { return name; }
        public double getPrice() { return price; }
        public String getCategory() { return category; }
      
        @Override
        public String toString() {
            return String.format("%s ($%.2f, %s)", name, price, category);
        }
    }
  
    public static void main(String[] args) {
        List<Product> products = Arrays.asList(
            new Product("Laptop", 999.99, "Electronics"),
            new Product("Book", 19.99, "Education"),
            new Product("Phone", 599.99, "Electronics"),
            new Product("Pen", 2.99, "Office"),
            new Product("Tablet", 299.99, "Electronics")
        );
      
        // Basic filtering - expensive products
        List<Product> expensiveProducts = products.stream()
            .filter(product -> product.getPrice() > 100)  // Predicate function
            .collect(Collectors.toList());
      
        // Complex filtering - combining conditions
        List<Product> affordableElectronics = products.stream()
            .filter(product -> product.getCategory().equals("Electronics"))
            .filter(product -> product.getPrice() < 700)  // Chain filters
            .collect(Collectors.toList());
      
        // Using method references and custom predicates
        Predicate<Product> isElectronics = product -> product.getCategory().equals("Electronics");
        Predicate<Product> isAffordable = product -> product.getPrice() < 500;
      
        List<Product> filteredProducts = products.stream()
            .filter(isElectronics.and(isAffordable))  // Combining predicates
            .collect(Collectors.toList());
      
        System.out.println("Expensive products: " + expensiveProducts);
        System.out.println("Affordable electronics: " + affordableElectronics);
        System.out.println("Combined filter: " + filteredProducts);
    }
}
```

> **Design Principle: filter() embodies functional programming's emphasis on immutability. It doesn't modify the original stream but creates a new stream with filtered elements.**

## 2. map() - Element Transformation

The `map()` operation applies a function to each element, transforming it into a different type or value.

```java
import java.util.*;
import java.util.stream.*;
import java.time.LocalDate;

public class MapOperations {
    static class Employee {
        private String name;
        private int age;
        private double salary;
        private LocalDate hireDate;
      
        public Employee(String name, int age, double salary, LocalDate hireDate) {
            this.name = name;
            this.age = age;
            this.salary = salary;
            this.hireDate = hireDate;
        }
      
        // Getters
        public String getName() { return name; }
        public int getAge() { return age; }
        public double getSalary() { return salary; }
        public LocalDate getHireDate() { return hireDate; }
      
        @Override
        public String toString() {
            return String.format("%s (Age: %d, Salary: $%.0f)", name, age, salary);
        }
    }
  
    public static void main(String[] args) {
        List<Employee> employees = Arrays.asList(
            new Employee("Alice", 30, 75000, LocalDate.of(2020, 1, 15)),
            new Employee("Bob", 25, 65000, LocalDate.of(2021, 3, 10)),
            new Employee("Charlie", 35, 85000, LocalDate.of(2019, 7, 20))
        );
      
        // Basic transformation - extract names
        List<String> employeeNames = employees.stream()
            .map(Employee::getName)  // Method reference transformation
            .collect(Collectors.toList());
      
        // Type transformation - convert to different type
        List<String> employeeSummaries = employees.stream()
            .map(emp -> String.format("%s earns $%.0f", 
                 emp.getName(), emp.getSalary()))  // Lambda transformation
            .collect(Collectors.toList());
      
        // Mathematical transformation
        List<Double> annualSalaries = employees.stream()
            .map(Employee::getSalary)
            .map(salary -> salary * 1.05)  // 5% raise calculation
            .collect(Collectors.toList());
      
        // Complex transformation - creating new objects
        List<Map<String, Object>> employeeData = employees.stream()
            .map(emp -> {
                Map<String, Object> data = new HashMap<>();
                data.put("name", emp.getName());
                data.put("isExperienced", emp.getAge() > 30);
                data.put("salaryGrade", emp.getSalary() > 70000 ? "Senior" : "Junior");
                return data;
            })
            .collect(Collectors.toList());
      
        System.out.println("Names: " + employeeNames);
        System.out.println("Summaries: " + employeeSummaries);
        System.out.println("Raised salaries: " + annualSalaries);
        System.out.println("Employee data: " + employeeData);
    }
}
```

> **Important Distinction: map() is a one-to-one transformation. Each input element produces exactly one output element, though the types can be completely different.**

## 3. flatMap() - Flattening Nested Structures

The `flatMap()` operation is crucial for handling nested collections or structures that need to be "flattened."

```java
import java.util.*;
import java.util.stream.*;

public class FlatMapOperations {
    static class Department {
        private String name;
        private List<String> employees;
      
        public Department(String name, List<String> employees) {
            this.name = name;
            this.employees = employees;
        }
      
        public String getName() { return name; }
        public List<String> getEmployees() { return employees; }
    }
  
    public static void main(String[] args) {
        // Example 1: Flattening nested lists
        List<List<Integer>> nestedNumbers = Arrays.asList(
            Arrays.asList(1, 2, 3),
            Arrays.asList(4, 5),
            Arrays.asList(6, 7, 8, 9)
        );
      
        // Wrong approach with map() - creates Stream<Stream<Integer>>
        // This won't work as expected
        Stream<Stream<Integer>> nestedStream = nestedNumbers.stream()
            .map(List::stream);
      
        // Correct approach with flatMap() - creates Stream<Integer>
        List<Integer> flattenedNumbers = nestedNumbers.stream()
            .flatMap(List::stream)  // Flattens nested streams
            .collect(Collectors.toList());
      
        // Example 2: Department employees
        List<Department> departments = Arrays.asList(
            new Department("Engineering", Arrays.asList("Alice", "Bob", "Charlie")),
            new Department("Marketing", Arrays.asList("Diana", "Eve")),
            new Department("Sales", Arrays.asList("Frank", "Grace", "Henry"))
        );
      
        // Get all employees across departments
        List<String> allEmployees = departments.stream()
            .flatMap(dept -> dept.getEmployees().stream())
            .collect(Collectors.toList());
      
        // Example 3: String word processing
        List<String> sentences = Arrays.asList(
            "Java streams are powerful",
            "Functional programming is elegant",
            "FlatMap handles nested structures"
        );
      
        // Get all unique words
        List<String> allWords = sentences.stream()
            .flatMap(sentence -> Arrays.stream(sentence.split(" ")))
            .map(String::toLowerCase)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
      
        // Example 4: Complex nested processing
        Map<String, List<String>> projectTeams = Map.of(
            "Project A", Arrays.asList("Alice", "Bob"),
            "Project B", Arrays.asList("Charlie", "Diana", "Alice"),
            "Project C", Arrays.asList("Eve", "Bob", "Frank")
        );
      
        Set<String> allTeamMembers = projectTeams.values().stream()
            .flatMap(List::stream)  // Flatten all team lists
            .collect(Collectors.toSet());  // Remove duplicates
      
        System.out.println("Flattened numbers: " + flattenedNumbers);
        System.out.println("All employees: " + allEmployees);
        System.out.println("All words: " + allWords);
        System.out.println("All team members: " + allTeamMembers);
    }
}
```

```
flatMap() Visual Representation:

Input:  [[1,2,3], [4,5], [6,7,8,9]]
         │       │     │
         ▼       ▼     ▼
map():   [1,2,3] [4,5] [6,7,8,9]  ← Still nested!
         │       │     │
         ▼       ▼     ▼
flatMap(): 1,2,3,4,5,6,7,8,9      ← Flattened!
```

> **Key Concept: flatMap() solves the common problem of nested data structures. It applies a function that returns a stream, then flattens all resulting streams into a single stream.**

## 4. distinct() - Eliminating Duplicates

The `distinct()` operation removes duplicate elements based on the `equals()` method.

```java
import java.util.*;
import java.util.stream.*;

public class DistinctOperations {
    static class Customer {
        private String name;
        private String email;
        private String city;
      
        public Customer(String name, String email, String city) {
            this.name = name;
            this.email = email;
            this.city = city;
        }
      
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getCity() { return city; }
      
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            Customer customer = (Customer) obj;
            return Objects.equals(email, customer.email);  // Unique by email
        }
      
        @Override
        public int hashCode() {
            return Objects.hash(email);
        }
      
        @Override
        public String toString() {
            return String.format("%s (%s, %s)", name, email, city);
        }
    }
  
    public static void main(String[] args) {
        // Example 1: Simple primitive distinct
        List<Integer> numbers = Arrays.asList(1, 2, 3, 2, 4, 3, 5, 1, 6);
        List<Integer> uniqueNumbers = numbers.stream()
            .distinct()
            .collect(Collectors.toList());
      
        // Example 2: String distinct (case sensitive)
        List<String> words = Arrays.asList("apple", "banana", "Apple", "cherry", "banana");
        List<String> uniqueWords = words.stream()
            .distinct()
            .collect(Collectors.toList());
      
        // Example 3: Case-insensitive distinct
        List<String> uniqueWordsIgnoreCase = words.stream()
            .map(String::toLowerCase)  // Transform first
            .distinct()                // Then eliminate duplicates
            .collect(Collectors.toList());
      
        // Example 4: Object distinct (using equals/hashCode)
        List<Customer> customers = Arrays.asList(
            new Customer("Alice", "alice@email.com", "New York"),
            new Customer("Bob", "bob@email.com", "Boston"),
            new Customer("Alice Smith", "alice@email.com", "Chicago"),  // Duplicate email
            new Customer("Charlie", "charlie@email.com", "Denver"),
            new Customer("Bob", "bob@email.com", "Seattle")  // Duplicate email
        );
      
        List<Customer> uniqueCustomers = customers.stream()
            .distinct()  // Uses Customer.equals() method
            .collect(Collectors.toList());
      
        // Example 5: Distinct by specific property
        List<String> uniqueCities = customers.stream()
            .map(Customer::getCity)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
      
        // Example 6: Advanced - distinct by custom criteria
        // Using a Set to track seen values for complex distinctness
        Set<String> seenEmails = new HashSet<>();
        List<Customer> distinctByEmail = customers.stream()
            .filter(customer -> seenEmails.add(customer.getEmail()))
            .collect(Collectors.toList());
      
        System.out.println("Unique numbers: " + uniqueNumbers);
        System.out.println("Unique words: " + uniqueWords);
        System.out.println("Unique words (ignore case): " + uniqueWordsIgnoreCase);
        System.out.println("Unique customers: " + uniqueCustomers);
        System.out.println("Unique cities: " + uniqueCities);
    }
}
```

> **Critical Understanding: distinct() relies on proper implementation of equals() and hashCode() methods for custom objects. For complex distinctness criteria, you may need to transform the data first or use filtering techniques.**

## 5. sorted() - Ordering Elements

The `sorted()` operation arranges elements according to natural ordering or a custom comparator.

```java
import java.util.*;
import java.util.stream.*;
import java.util.Comparator;

public class SortedOperations {
    static class Student {
        private String name;
        private int age;
        private double gpa;
        private String major;
      
        public Student(String name, int age, double gpa, String major) {
            this.name = name;
            this.age = age;
            this.gpa = gpa;
            this.major = major;
        }
      
        public String getName() { return name; }
        public int getAge() { return age; }
        public double getGpa() { return gpa; }
        public String getMajor() { return major; }
      
        @Override
        public String toString() {
            return String.format("%s (Age: %d, GPA: %.2f, %s)", 
                               name, age, gpa, major);
        }
    }
  
    public static void main(String[] args) {
        List<Student> students = Arrays.asList(
            new Student("Alice", 20, 3.8, "Computer Science"),
            new Student("Bob", 22, 3.2, "Mathematics"),
            new Student("Charlie", 19, 3.9, "Physics"),
            new Student("Diana", 21, 3.5, "Computer Science"),
            new Student("Eve", 20, 3.7, "Mathematics")
        );
      
        // Example 1: Natural ordering (primitives)
        List<Integer> numbers = Arrays.asList(5, 2, 8, 1, 9, 3);
        List<Integer> sortedNumbers = numbers.stream()
            .sorted()  // Natural ordering for integers
            .collect(Collectors.toList());
      
        // Example 2: String natural ordering
        List<String> names = Arrays.asList("Charlie", "Alice", "Bob", "Diana");
        List<String> sortedNames = names.stream()
            .sorted()  // Alphabetical ordering
            .collect(Collectors.toList());
      
        // Example 3: Simple property sorting
        List<Student> sortedByAge = students.stream()
            .sorted(Comparator.comparing(Student::getAge))
            .collect(Collectors.toList());
      
        // Example 4: Reverse sorting
        List<Student> sortedByGpaDesc = students.stream()
            .sorted(Comparator.comparing(Student::getGpa).reversed())
            .collect(Collectors.toList());
      
        // Example 5: Multi-level sorting
        List<Student> complexSort = students.stream()
            .sorted(Comparator
                .comparing(Student::getMajor)           // Primary: by major
                .thenComparing(Student::getGpa, Comparator.reverseOrder()) // Secondary: GPA desc
                .thenComparing(Student::getName))       // Tertiary: by name
            .collect(Collectors.toList());
      
        // Example 6: Custom comparator logic
        List<Student> customSort = students.stream()
            .sorted((s1, s2) -> {
                // Custom logic: high GPA students first, then by age
                if (s1.getGpa() >= 3.7 && s2.getGpa() < 3.7) return -1;
                if (s1.getGpa() < 3.7 && s2.getGpa() >= 3.7) return 1;
                return Integer.compare(s1.getAge(), s2.getAge());
            })
            .collect(Collectors.toList());
      
        // Example 7: Null-safe sorting
        List<String> wordsWithNulls = Arrays.asList("apple", null, "banana", "cherry", null);
        List<String> nullSafeSorted = wordsWithNulls.stream()
            .sorted(Comparator.nullsLast(Comparator.naturalOrder()))
            .collect(Collectors.toList());
      
        System.out.println("Sorted numbers: " + sortedNumbers);
        System.out.println("Sorted names: " + sortedNames);
        System.out.println("Sorted by age: " + sortedByAge);
        System.out.println("Sorted by GPA (desc): " + sortedByGpaDesc);
        System.out.println("Complex sort: " + complexSort);
        System.out.println("Custom sort: " + customSort);
        System.out.println("Null-safe sort: " + nullSafeSorted);
    }
}
```

```
Comparator Chain Visualization:

Primary Sort:    [CS, CS, Math, Math, Physics]
                    │    │    │     │      │
Secondary Sort:  [3.8,3.5][3.7,3.2] [3.9]
(GPA desc)          │    │    │     │      │
Tertiary Sort:   [Alice,Diana][Eve,Bob][Charlie]
(Name asc)
```

> **Sorting Principles: Java's Comparator interface provides a fluent API for building complex sorting logic. Always consider stability (equal elements maintain relative order) and null handling in production code.**

## 6. limit() - Restricting Stream Size

The `limit()` operation truncates a stream to contain no more than a specified number of elements.

```java
import java.util.*;
import java.util.stream.*;
import java.util.concurrent.ThreadLocalRandom;

public class LimitOperations {
    public static void main(String[] args) {
        // Example 1: Basic limiting
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        List<Integer> firstFive = numbers.stream()
            .limit(5)  // Take only first 5 elements
            .collect(Collectors.toList());
      
        // Example 2: Limit with other operations
        List<Integer> firstThreeEven = numbers.stream()
            .filter(n -> n % 2 == 0)  // Filter even numbers first
            .limit(3)                 // Then take first 3
            .collect(Collectors.toList());
      
        // Example 3: Limit with sorting
        List<String> words = Arrays.asList("elephant", "cat", "dog", "bird", "fish", "ant");
        List<String> shortestThree = words.stream()
            .sorted(Comparator.comparing(String::length))  // Sort by length
            .limit(3)                                      // Take 3 shortest
            .collect(Collectors.toList());
      
        // Example 4: Infinite stream limiting (crucial for infinite streams)
        List<Integer> randomNumbers = Stream.generate(() -> 
            ThreadLocalRandom.current().nextInt(1, 100))
            .limit(10)  // MUST limit infinite streams!
            .collect(Collectors.toList());
      
        // Example 5: Pagination simulation
        List<String> allUsers = Arrays.asList(
            "Alice", "Bob", "Charlie", "Diana", "Eve", 
            "Frank", "Grace", "Henry", "Ivy", "Jack"
        );
      
        int pageSize = 3;
        int pageNumber = 2; // 0-indexed
      
        List<String> pageResults = allUsers.stream()
            .skip(pageNumber * pageSize)  // Skip previous pages
            .limit(pageSize)              // Take current page
            .collect(Collectors.toList());
      
        // Example 6: Top-N pattern
        List<Double> scores = Arrays.asList(85.5, 92.0, 78.5, 95.5, 88.0, 91.5, 76.0);
        List<Double> topThreeScores = scores.stream()
            .sorted(Comparator.reverseOrder())  // Sort descending
            .limit(3)                           // Take top 3
            .collect(Collectors.toList());
      
        // Example 7: Early termination for performance
        Optional<String> firstLongWord = words.stream()
            .filter(word -> word.length() > 5)
            .limit(1)        // Stop after finding first match
            .findFirst();    // Convert to Optional
      
        System.out.println("First five: " + firstFive);
        System.out.println("First three even: " + firstThreeEven);
        System.out.println("Shortest three: " + shortestThree);
        System.out.println("Random numbers: " + randomNumbers);
        System.out.println("Page 2 results: " + pageResults);
        System.out.println("Top three scores: " + topThreeScores);
        System.out.println("First long word: " + firstLongWord);
    }
}
```

> **Performance Insight: limit() enables short-circuiting behavior. When combined with infinite streams or expensive operations, it prevents unnecessary computation by stopping processing once the limit is reached.**

## 7. skip() - Bypassing Elements

The `skip()` operation discards the first N elements and returns a stream of the remaining elements.

```java
import java.util.*;
import java.util.stream.*;

public class SkipOperations {
    static class LogEntry {
        private String timestamp;
        private String level;
        private String message;
      
        public LogEntry(String timestamp, String level, String message) {
            this.timestamp = timestamp;
            this.level = level;
            this.message = message;
        }
      
        public String getTimestamp() { return timestamp; }
        public String getLevel() { return level; }
        public String getMessage() { return message; }
      
        @Override
        public String toString() {
            return String.format("[%s] %s: %s", timestamp, level, message);
        }
    }
  
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
      
        // Example 1: Basic skipping
        List<Integer> skipFirstThree = numbers.stream()
            .skip(3)  // Skip first 3 elements
            .collect(Collectors.toList());
      
        // Example 2: Skip with limit for pagination
        int pageSize = 3;
        int pageNumber = 2;  // 0-indexed (third page)
      
        List<Integer> pageData = numbers.stream()
            .skip(pageNumber * pageSize)  // Skip: 2 * 3 = 6 elements
            .limit(pageSize)              // Take: 3 elements
            .collect(Collectors.toList());
      
        // Example 3: Skip header/metadata
        List<String> csvData = Arrays.asList(
            "Name,Age,City",           // Header to skip
            "Alice,25,New York",
            "Bob,30,Boston",
            "Charlie,35,Chicago"
        );
      
        List<String> dataOnly = csvData.stream()
            .skip(1)  // Skip header row
            .collect(Collectors.toList());
      
        // Example 4: Log processing - skip old entries
        List<LogEntry> logs = Arrays.asList(
            new LogEntry("10:00", "INFO", "System started"),
            new LogEntry("10:05", "DEBUG", "Loading config"),
            new LogEntry("10:10", "INFO", "Config loaded"),
            new LogEntry("10:15", "WARN", "High memory usage"),
            new LogEntry("10:20", "ERROR", "Database connection failed"),
            new LogEntry("10:25", "INFO", "Connection restored")
        );
      
        // Get logs after 10:10 (skip first 3)
        List<LogEntry> recentLogs = logs.stream()
            .skip(3)
            .collect(Collectors.toList());
      
        // Example 5: Statistical sampling - skip outliers
        List<Double> measurements = Arrays.asList(
            1.2, 1.5, 1.8, 2.1, 2.3, 2.5, 2.7, 2.9, 3.1, 15.7  // Last one is outlier
        );
      
        double average = measurements.stream()
            .sorted()                    // Sort to identify outliers
            .skip(1)                     // Skip lowest value
            .limit(measurements.size() - 2)  // Skip highest value too
            .mapToDouble(Double::doubleValue)
            .average()
            .orElse(0.0);
      
        // Example 6: Windowing data
        List<String> timeSeriesData = Arrays.asList(
            "00:00", "01:00", "02:00", "03:00", "04:00", 
            "05:00", "06:00", "07:00", "08:00", "09:00"
        );
      
        // Get data from 6 AM onwards
        List<String> businessHours = timeSeriesData.stream()
            .skip(6)  // Skip first 6 hours
            .collect(Collectors.toList());
      
        // Example 7: Combining skip with other operations
        List<String> words = Arrays.asList(
            "the", "quick", "brown", "fox", "jumps", 
            "over", "the", "lazy", "dog", "today"
        );
      
        // Skip common words, then process
        Set<String> commonWords = Set.of("the", "over", "today");
        String processedText = words.stream()
            .filter(word -> !commonWords.contains(word))
            .skip(1)                    // Skip first remaining word
            .map(String::toUpperCase)
            .collect(Collectors.joining(" "));
      
        System.out.println("Original: " + numbers);
        System.out.println("Skip first 3: " + skipFirstThree);
        System.out.println("Page 3 data: " + pageData);
        System.out.println("CSV data only: " + dataOnly);
        System.out.println("Recent logs: " + recentLogs);
        System.out.println("Average (outliers removed): " + average);
        System.out.println("Business hours: " + businessHours);
        System.out.println("Processed text: " + processedText);
    }
}
```

```
Skip + Limit Pagination Pattern:

Data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
Page 0: skip(0).limit(3) → [1, 2, 3]
Page 1: skip(3).limit(3) → [4, 5, 6]  
Page 2: skip(6).limit(3) → [7, 8, 9]
Page 3: skip(9).limit(3) → [10]
```

> **Common Pattern: skip() and limit() together implement pagination efficiently. This pattern is essential for processing large datasets in chunks or implementing user interfaces with paged results.**

## Chaining Operations: The Power of Composition

```java
import java.util.*;
import java.util.stream.*;

public class OperationChaining {
    static class Sale {
        private String product;
        private double amount;
        private String region;
        private String salesperson;
      
        public Sale(String product, double amount, String region, String salesperson) {
            this.product = product;
            this.amount = amount;
            this.region = region;
            this.salesperson = salesperson;
        }
      
        public String getProduct() { return product; }
        public double getAmount() { return amount; }
        public String getRegion() { return region; }
        public String getSalesperson() { return salesperson; }
      
        @Override
        public String toString() {
            return String.format("%s: $%.2f (%s, %s)", 
                               product, amount, region, salesperson);
        }
    }
  
    public static void main(String[] args) {
        List<Sale> sales = Arrays.asList(
            new Sale("Laptop", 999.99, "North", "Alice"),
            new Sale("Mouse", 29.99, "South", "Bob"),
            new Sale("Laptop", 1199.99, "North", "Charlie"),
            new Sale("Keyboard", 79.99, "East", "Alice"),
            new Sale("Monitor", 299.99, "West", "Diana"),
            new Sale("Laptop", 899.99, "South", "Eve"),
            new Sale("Mouse", 25.99, "North", "Alice"),
            new Sale("Monitor", 349.99, "East", "Bob")
        );
      
        // Complex chaining example: Top 3 laptop sales in North region
        List<Sale> topNorthLaptops = sales.stream()
            .filter(sale -> sale.getRegion().equals("North"))    // 1. Filter by region
            .filter(sale -> sale.getProduct().equals("Laptop"))  // 2. Filter by product
            .sorted(Comparator.comparing(Sale::getAmount).reversed()) // 3. Sort by amount desc
            .limit(3)                                            // 4. Take top 3
            .collect(Collectors.toList());                       // 5. Collect results
      
        // Performance-optimized chaining
        double totalHighValueSales = sales.stream()
            .filter(sale -> sale.getAmount() > 100)             // Filter early
            .mapToDouble(Sale::getAmount)                       // Transform to primitive
            .sum();                                             // Terminal operation
      
        // Data transformation pipeline
        Map<String, Double> salesByRegion = sales.stream()
            .filter(sale -> sale.getAmount() > 50)              // Only significant sales
            .collect(Collectors.groupingBy(                     // Group by region
                Sale::getRegion,
                Collectors.summingDouble(Sale::getAmount)       // Sum amounts per region
            ));
      
        System.out.println("Top North laptops: " + topNorthLaptops);
        System.out.println("Total high-value sales: $" + totalHighValueSales);
        System.out.println("Sales by region: " + salesByRegion);
    }
}
```

## Performance Considerations and Best Practices

> **Memory and Performance Principles:**
>
> 1. **Lazy Evaluation** : Intermediate operations don't execute until a terminal operation is called
> 2. **Short-circuiting** : Operations like limit() can stop processing early
> 3. **Order Matters** : Filter before expensive operations like sorting
> 4. **Stateful vs Stateless** : sorted(), distinct() require storing elements; filter(), map() don't

```java
// Poor performance - sorts everything then filters
list.stream()
    .sorted()           // Expensive: O(n log n)
    .filter(expensive)  // Applied to all elements
    .limit(10);

// Better performance - filters first
list.stream()
    .filter(expensive)  // Applied to fewer elements
    .sorted()           // Sorts filtered subset
    .limit(10);         // May short-circuit sorting
```

> **Enterprise Development Insights: Stream operations excel at data transformation pipelines, ETL processes, and implementing functional programming patterns. They promote immutability, testability, and parallel processing capabilities essential for scalable applications.**

These intermediate operations form the foundation of functional programming in Java, enabling elegant, readable, and maintainable data processing pipelines that scale from simple transformations to complex enterprise data workflows.
