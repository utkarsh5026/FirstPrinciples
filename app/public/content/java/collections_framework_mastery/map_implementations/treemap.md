# TreeMap: Understanding Sorted Maps Through Red-Black Trees

Let me explain TreeMap by building from fundamental computer science concepts up to Java's sophisticated implementation.

## Foundation: Why We Need Sorted Data Structures

Before diving into TreeMap, let's understand the fundamental problem it solves:

> **Core Problem** : Sometimes we need to store key-value pairs AND maintain them in sorted order by key. This enables efficient range queries, ordered iteration, and navigation operations that are impossible with hash-based structures.

```
Unsorted Map (HashMap):
Key-Value Pairs: {banana=2, apple=5, cherry=1, date=3}
Storage order: [banana=2] → [cherry=1] → [apple=5] → [date=3]
Problem: Cannot efficiently find "all fruits between 'apple' and 'date'"

Sorted Map (TreeMap):
Key-Value Pairs: {banana=2, apple=5, cherry=1, date=3}
Storage order: [apple=5] → [banana=2] → [cherry=1] → [date=3]
Benefit: Can efficiently navigate, find ranges, get first/last elements
```

## Understanding Tree Data Structures

> **Mental Model** : A tree is like an organizational chart where each node can have children, but unlike real trees, computer science trees grow downward from a root node.

```
Basic Binary Tree Structure:
                Root
               /    \
          Left Child  Right Child
           /    \      /    \
         ...    ...  ...   ...

For Sorted Trees (Binary Search Trees):
- Left child's key < Parent's key < Right child's key
- This property applies recursively to all subtrees
```

### Why Trees Beat Linear Structures for Sorted Data

```java
// Linear search in sorted array - O(n) for insertion
public class SortedArrayDemo {
    public static void main(String[] args) {
        // To insert into sorted array, must shift elements
        int[] sortedArray = {1, 3, 5, 7, 9};
        // To insert 6: find position (O(log n)) + shift elements (O(n))
        // Total: O(n) - expensive for large datasets
    }
}

// Tree insertion - O(log n) average case
// No element shifting required - just navigate and attach
```

## What Makes Red-Black Trees Special

> **Key Insight** : Red-black trees are self-balancing binary search trees. "Self-balancing" means they automatically reorganize themselves to prevent worst-case scenarios where the tree becomes a long chain (which would degrade performance to O(n)).

### Red-Black Tree Properties

> **Red-Black Rules** : Every red-black tree must satisfy these invariants:
>
> 1. Every node is either red or black
> 2. Root node is always black
> 3. Red nodes cannot have red children (no two red nodes adjacent)
> 4. Every path from root to leaf contains the same number of black nodes
> 5. All leaf nodes (null references) are considered black

```
Example Red-Black Tree:
                 B(10)
               /       \
           R(5)         B(15)
          /    \       /     \
      B(3)    B(7)  R(12)   R(18)
                    /         \
                B(nil)      B(nil)

B = Black node, R = Red node
This maintains O(log n) height guarantee
```

### Why Java Chose Red-Black Trees Over Other Options

> **Design Decision** : Java's TreeMap uses red-black trees instead of simpler BSTs or other balanced trees (like AVL) because:
>
> * **Guaranteed O(log n)** operations (unlike simple BST which can degrade to O(n))
> * **Less strict balancing** than AVL trees (fewer rotations needed)
> * **Good performance** for both reading and writing operations
> * **Proven stability** in enterprise applications

## TreeMap Implementation Architecture

```java
// Understanding TreeMap's core structure
import java.util.*;

public class TreeMapBasics {
    public static void main(String[] args) {
        // TreeMap requires keys to be Comparable OR provide a Comparator
        TreeMap<String, Integer> fruitInventory = new TreeMap<>();
      
        // Internal structure: Red-black tree nodes
        // Each node contains: key, value, color, left, right, parent references
      
        fruitInventory.put("banana", 12);
        fruitInventory.put("apple", 8);      // Will be placed before banana
        fruitInventory.put("cherry", 15);    // Will be placed after banana
        fruitInventory.put("date", 6);       // Will be placed after cherry
      
        // Internal tree automatically maintains sorted order:
        //           apple(8)
        //          /        \
        //      (nil)      banana(12)
        //                    \
        //                  cherry(15)
        //                     \
        //                   date(6)
      
        System.out.println("Sorted iteration: " + fruitInventory);
        // Output: {apple=8, banana=12, cherry=15, date=6}
    }
}
```

## The Map Interface Hierarchy

```
Collection Framework Hierarchy for Maps:

                    Map<K,V>
                       |
                 SortedMap<K,V>
                       |
               NavigableMap<K,V>
                       |
                 TreeMap<K,V>

Each level adds capabilities:
- Map: Basic key-value operations
- SortedMap: Ordered keys, range views
- NavigableMap: Navigation methods (ceiling, floor, etc.)
- TreeMap: Red-black tree implementation
```

### Progressive Interface Implementation

```java
import java.util.*;

public class MapInterfaceDemo {
    public static void main(String[] args) {
        // Each reference type provides different capabilities
      
        // 1. Basic Map interface - fundamental operations
        Map<Integer, String> basicMap = new TreeMap<>();
        basicMap.put(3, "three");
        basicMap.put(1, "one");
        basicMap.put(2, "two");
      
        // 2. SortedMap interface - adds ordering concepts
        SortedMap<Integer, String> sortedMap = new TreeMap<>();
        sortedMap.putAll(basicMap);
        System.out.println("First key: " + sortedMap.firstKey()); // 1
        System.out.println("Last key: " + sortedMap.lastKey());   // 3
      
        // 3. NavigableMap interface - adds navigation methods
        NavigableMap<Integer, String> navMap = new TreeMap<>();
        navMap.putAll(basicMap);
        System.out.println("Ceiling of 2: " + navMap.ceilingKey(2));  // 2
        System.out.println("Floor of 2.5: " + navMap.floorKey(2));    // 2
      
        // 4. TreeMap class - provides specific implementation details
        TreeMap<Integer, String> treeMap = new TreeMap<>();
        treeMap.putAll(basicMap);
        // Access to TreeMap-specific methods and performance guarantees
    }
}
```

## Understanding Comparability Requirements

> **Critical Concept** : TreeMap requires a way to order keys. This happens through either:
>
> 1. Keys implementing Comparable`<T>` interface
> 2. Providing a custom Comparator`<T>` to the TreeMap constructor

### Natural Ordering vs Custom Comparators

```java
import java.util.*;

// Demonstrating different ordering strategies
public class TreeMapOrdering {
  
    // Custom class that implements Comparable
    static class Person implements Comparable<Person> {
        String name;
        int age;
      
        Person(String name, int age) {
            this.name = name;
            this.age = age;
        }
      
        // Natural ordering: by name alphabetically
        @Override
        public int compareTo(Person other) {
            return this.name.compareTo(other.name);
        }
      
        @Override
        public String toString() {
            return name + "(" + age + ")";
        }
    }
  
    public static void main(String[] args) {
        // 1. Natural ordering using Comparable
        TreeMap<Person, String> peopleByName = new TreeMap<>();
        peopleByName.put(new Person("Charlie", 30), "Engineer");
        peopleByName.put(new Person("Alice", 25), "Designer");
        peopleByName.put(new Person("Bob", 35), "Manager");
      
        System.out.println("Natural ordering (by name):");
        peopleByName.forEach((person, job) -> 
            System.out.println(person + " -> " + job));
      
        // 2. Custom ordering using Comparator
        TreeMap<Person, String> peopleByAge = new TreeMap<>(
            Comparator.comparingInt(p -> p.age)
        );
        peopleByAge.putAll(peopleByName);
      
        System.out.println("\nCustom ordering (by age):");
        peopleByAge.forEach((person, job) -> 
            System.out.println(person + " -> " + job));
      
        // 3. Reverse ordering
        TreeMap<Person, String> peopleReverse = new TreeMap<>(
            Comparator.comparing((Person p) -> p.name).reversed()
        );
        peopleReverse.putAll(peopleByName);
      
        System.out.println("\nReverse ordering:");
        peopleReverse.forEach((person, job) -> 
            System.out.println(person + " -> " + job));
    }
}
```

## NavigableMap Operations Deep Dive

> **NavigableMap Philosophy** : Beyond basic map operations, NavigableMap provides methods that leverage the sorted nature of the data structure to enable efficient navigation and range operations.

```java
import java.util.*;

public class NavigableMapOperations {
    public static void main(String[] args) {
        NavigableMap<Integer, String> scores = new TreeMap<>();
      
        // Populate with test scores
        scores.put(95, "Alice");    // A
        scores.put(87, "Bob");      // B+
        scores.put(78, "Charlie");  // C+
        scores.put(92, "Diana");    // A-
        scores.put(83, "Eve");      // B
        scores.put(71, "Frank");    // C-
      
        System.out.println("All scores: " + scores);
      
        // Navigation methods - finding closest keys
        demonstrateNavigation(scores);
      
        // Range operations - working with subsets
        demonstrateRangeOperations(scores);
      
        // Polling operations - removing while accessing
        demonstratePollingOperations(scores);
    }
  
    static void demonstrateNavigation(NavigableMap<Integer, String> scores) {
        System.out.println("\n=== Navigation Operations ===");
      
        // Finding exact or closest keys
        Integer target = 85;
      
        // Lower: greatest key strictly less than target
        Integer lower = scores.lowerKey(target);
        System.out.println("Lower than " + target + ": " + lower + 
                          " (" + scores.get(lower) + ")");
      
        // Floor: greatest key less than or equal to target
        Integer floor = scores.floorKey(target);
        System.out.println("Floor of " + target + ": " + floor + 
                          " (" + scores.get(floor) + ")");
      
        // Ceiling: smallest key greater than or equal to target
        Integer ceiling = scores.ceilingKey(target);
        System.out.println("Ceiling of " + target + ": " + ceiling + 
                          " (" + scores.get(ceiling) + ")");
      
        // Higher: smallest key strictly greater than target
        Integer higher = scores.higherKey(target);
        System.out.println("Higher than " + target + ": " + higher + 
                          " (" + scores.get(higher) + ")");
    }
  
    static void demonstrateRangeOperations(NavigableMap<Integer, String> scores) {
        System.out.println("\n=== Range Operations ===");
      
        // SubMap: all entries within a range
        SortedMap<Integer, String> bGrades = scores.subMap(80, 90);
        System.out.println("B grades (80-89): " + bGrades);
      
        // HeadMap: all entries before a key
        SortedMap<Integer, String> belowB = scores.headMap(80);
        System.out.println("Below B grade (<80): " + belowB);
      
        // TailMap: all entries from a key onwards
        SortedMap<Integer, String> aGrades = scores.tailMap(90);
        System.out.println("A grades (90+): " + aGrades);
      
        // NavigableMap versions with inclusive/exclusive bounds
        NavigableMap<Integer, String> inclusiveRange = 
            scores.subMap(80, true, 90, false);
        System.out.println("80 <= grade < 90: " + inclusiveRange);
    }
  
    static void demonstratePollingOperations(NavigableMap<Integer, String> scores) {
        System.out.println("\n=== Polling Operations ===");
      
        // Create a copy for destructive operations
        NavigableMap<Integer, String> mutableScores = new TreeMap<>(scores);
      
        // Poll first (lowest key)
        Map.Entry<Integer, String> lowest = mutableScores.pollFirstEntry();
        System.out.println("Removed lowest: " + lowest);
      
        // Poll last (highest key)
        Map.Entry<Integer, String> highest = mutableScores.pollLastEntry();
        System.out.println("Removed highest: " + highest);
      
        System.out.println("Remaining: " + mutableScores);
    }
}
```

## Performance Characteristics and Trade-offs

> **Performance Analysis** : Understanding when TreeMap excels and when other Map implementations might be better choices.

```java
import java.util.*;

public class TreeMapPerformance {
    public static void main(String[] args) {
        demonstrateTimeComplexity();
        demonstrateMemoryOverhead();
        compareWithOtherMaps();
    }
  
    static void demonstrateTimeComplexity() {
        System.out.println("=== TreeMap Time Complexity ===");
      
        TreeMap<Integer, String> tree = new TreeMap<>();
        long start, end;
      
        // O(log n) insertion
        start = System.nanoTime();
        for (int i = 0; i < 100000; i++) {
            tree.put(i, "value" + i);
        }
        end = System.nanoTime();
        System.out.println("100K insertions: " + (end - start) / 1_000_000 + "ms");
      
        // O(log n) search
        start = System.nanoTime();
        for (int i = 0; i < 1000; i++) {
            tree.get(i * 100); // Search for every 100th element
        }
        end = System.nanoTime();
        System.out.println("1K searches: " + (end - start) / 1_000_000 + "ms");
      
        // O(log n) deletion
        start = System.nanoTime();
        for (int i = 0; i < 1000; i++) {
            tree.remove(i * 50); // Remove every 50th element
        }
        end = System.nanoTime();
        System.out.println("1K deletions: " + (end - start) / 1_000_000 + "ms");
    }
  
    static void demonstrateMemoryOverhead() {
        System.out.println("\n=== Memory Overhead ===");
      
        // TreeMap nodes require additional pointers
        // Each node stores: key, value, parent, left, right, color
        // vs HashMap: key, value, hash, next
      
        Runtime runtime = Runtime.getRuntime();
        runtime.gc(); // Suggest garbage collection
      
        long beforeTreeMap = runtime.totalMemory() - runtime.freeMemory();
      
        TreeMap<Integer, String> tree = new TreeMap<>();
        for (int i = 0; i < 50000; i++) {
            tree.put(i, "value" + i);
        }
      
        long afterTreeMap = runtime.totalMemory() - runtime.freeMemory();
        System.out.println("TreeMap memory usage: " + 
                          (afterTreeMap - beforeTreeMap) / 1024 + "KB");
    }
  
    static void compareWithOtherMaps() {
        System.out.println("\n=== Comparison with Other Maps ===");
      
        System.out.println("HashMap: O(1) average, no ordering, high memory efficiency");
        System.out.println("LinkedHashMap: O(1) average, insertion order, moderate overhead");
        System.out.println("TreeMap: O(log n), sorted order, high overhead");
        System.out.println("\nUse TreeMap when:");
        System.out.println("- Need sorted iteration");
        System.out.println("- Require range operations");
        System.out.println("- Need navigation methods");
        System.out.println("- Consistent performance is more important than peak performance");
    }
}
```

## Advanced TreeMap Patterns and Best Practices

### Custom Sorting Strategies

```java
import java.util.*;
import java.time.LocalDate;

public class AdvancedTreeMapPatterns {
  
    // Complex object for sorting demonstrations
    static class Task {
        String name;
        LocalDate dueDate;
        int priority; // 1 = high, 5 = low
      
        Task(String name, LocalDate dueDate, int priority) {
            this.name = name;
            this.dueDate = dueDate;
            this.priority = priority;
        }
      
        @Override
        public String toString() {
            return String.format("%s (Due: %s, Priority: %d)", name, dueDate, priority);
        }
    }
  
    public static void main(String[] args) {
        demonstrateMultiFieldSorting();
        demonstrateNullHandling();
        demonstrateCustomComparatorChaining();
    }
  
    static void demonstrateMultiFieldSorting() {
        System.out.println("=== Multi-field Sorting ===");
      
        // Sort by priority first, then by due date
        Comparator<Task> taskComparator = Comparator
            .comparingInt((Task t) -> t.priority)           // Primary: priority
            .thenComparing(t -> t.dueDate)                  // Secondary: due date
            .thenComparing(t -> t.name);                    // Tertiary: name
      
        TreeMap<Task, String> taskMap = new TreeMap<>(taskComparator);
      
        taskMap.put(new Task("Write report", LocalDate.of(2025, 7, 20), 2), "In Progress");
        taskMap.put(new Task("Fix bug", LocalDate.of(2025, 7, 15), 1), "Pending");
        taskMap.put(new Task("Code review", LocalDate.of(2025, 7, 15), 1), "Assigned");
        taskMap.put(new Task("Meeting prep", LocalDate.of(2025, 7, 25), 3), "Not Started");
      
        taskMap.forEach((task, status) -> 
            System.out.println(task + " -> " + status));
    }
  
    static void demonstrateNullHandling() {
        System.out.println("\n=== Null Handling ===");
      
        // TreeMap cannot handle null keys (would break sorting)
        // But can handle null values
        TreeMap<String, String> map = new TreeMap<>();
      
        try {
            map.put("valid", "value");
            map.put("another", null);  // Null values are OK
            // map.put(null, "value");    // This would throw NullPointerException
          
            System.out.println("Map with null value: " + map);
        } catch (NullPointerException e) {
            System.out.println("Cannot use null keys in TreeMap");
        }
      
        // Custom comparator can handle nulls if needed
        Comparator<String> nullSafeComparator = Comparator.nullsFirst(String::compareTo);
        TreeMap<String, String> nullSafeMap = new TreeMap<>(nullSafeComparator);
      
        nullSafeMap.put("beta", "2");
        nullSafeMap.put(null, "null value");  // Now this works
        nullSafeMap.put("alpha", "1");
      
        System.out.println("Null-safe map: " + nullSafeMap);
    }
  
    static void demonstrateCustomComparatorChaining() {
        System.out.println("\n=== Complex Comparator Chaining ===");
      
        // Business requirement: Sort strings by length first, then alphabetically,
        // but prioritize strings starting with uppercase letters
        Comparator<String> complexComparator = Comparator
            .<String>comparingInt(s -> Character.isUpperCase(s.charAt(0)) ? 0 : 1)
            .thenComparingInt(String::length)
            .thenComparing(String::compareTo);
      
        TreeMap<String, Integer> wordMap = new TreeMap<>(complexComparator);
      
        String[] words = {"apple", "Banana", "cat", "Dog", "elephant", "Fig"};
        for (int i = 0; i < words.length; i++) {
            wordMap.put(words[i], i);
        }
      
        System.out.println("Complex sorting result:");
        wordMap.forEach((word, index) -> 
            System.out.println(word + " (original index: " + index + ")"));
    }
}
```

## Common Pitfalls and Debugging Strategies

> **Critical Debugging Insight** : Many TreeMap issues stem from inconsistent or changing comparison logic. The compareTo/compare method must be consistent with equals, and objects used as keys should be immutable regarding their comparison fields.

```java
import java.util.*;

public class TreeMapPitfalls {
  
    // WRONG: Mutable key class - dangerous for TreeMap
    static class MutableKey {
        int value;
      
        MutableKey(int value) { this.value = value; }
      
        // Comparison based on mutable field - PROBLEMATIC
        public int compareTo(MutableKey other) {
            return Integer.compare(this.value, other.value);
        }
      
        @Override
        public String toString() { return "Key(" + value + ")"; }
    }
  
    // CORRECT: Immutable key class
    static class ImmutableKey implements Comparable<ImmutableKey> {
        private final int value;  // final = immutable
      
        ImmutableKey(int value) { this.value = value; }
      
        @Override
        public int compareTo(ImmutableKey other) {
            return Integer.compare(this.value, other.value);
        }
      
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (!(obj instanceof ImmutableKey)) return false;
            return value == ((ImmutableKey) obj).value;
        }
      
        @Override
        public int hashCode() { return Integer.hashCode(value); }
      
        @Override
        public String toString() { return "ImmutableKey(" + value + ")"; }
    }
  
    public static void main(String[] args) {
        demonstrateMutableKeyProblem();
        demonstrateInconsistentComparison();
        demonstrateClassCastException();
        showCorrectImplementation();
    }
  
    static void demonstrateMutableKeyProblem() {
        System.out.println("=== Mutable Key Problem ===");
      
        TreeMap<MutableKey, String> problematicMap = new TreeMap<>();
      
        MutableKey key1 = new MutableKey(10);
        MutableKey key2 = new MutableKey(20);
      
        problematicMap.put(key1, "value1");
        problematicMap.put(key2, "value2");
      
        System.out.println("Initial map: " + problematicMap);
        System.out.println("Can find key1: " + problematicMap.containsKey(key1));
      
        // DANGEROUS: Modifying key after insertion
        key1.value = 30;  // This breaks TreeMap's internal structure!
      
        System.out.println("After modifying key1 to 30:");
        System.out.println("Map appears as: " + problematicMap);
        System.out.println("Can find key1: " + problematicMap.containsKey(key1));
      
        // The map is now in an inconsistent state
        // Tree structure is based on old comparison, but key has changed
    }
  
    static void demonstrateInconsistentComparison() {
        System.out.println("\n=== Inconsistent Comparison Problem ===");
      
        // Comparator that's inconsistent with equals
        Comparator<String> inconsistentComparator = (s1, s2) -> {
            // Only compares length, ignoring content
            return Integer.compare(s1.length(), s2.length());
        };
      
        TreeMap<String, Integer> map = new TreeMap<>(inconsistentComparator);
      
        map.put("cat", 1);
        map.put("dog", 2);  // Same length as "cat" - will overwrite!
        map.put("bird", 3);
      
        System.out.println("Map with inconsistent comparator: " + map);
        System.out.println("Expected 3 entries, got: " + map.size());
      
        // "dog" overwrote "cat" because comparator considered them equal
        System.out.println("Contains 'cat': " + map.containsKey("cat"));
        System.out.println("Contains 'dog': " + map.containsKey("dog"));
    }
  
    static void demonstrateClassCastException() {
        System.out.println("\n=== ClassCastException Problem ===");
      
        TreeMap<Object, String> mixedMap = new TreeMap<>();
      
        try {
            mixedMap.put("string", "value1");
            mixedMap.put(42, "value2");  // Integer cannot be compared to String
        } catch (ClassCastException e) {
            System.out.println("ClassCastException: " + e.getMessage());
            System.out.println("Solution: Use consistent types or provide custom comparator");
        }
    }
  
    static void showCorrectImplementation() {
        System.out.println("\n=== Correct Implementation ===");
      
        TreeMap<ImmutableKey, String> correctMap = new TreeMap<>();
      
        ImmutableKey key1 = new ImmutableKey(10);
        ImmutableKey key2 = new ImmutableKey(20);
        ImmutableKey key3 = new ImmutableKey(10); // Same value as key1
      
        correctMap.put(key1, "value1");
        correctMap.put(key2, "value2");
        correctMap.put(key3, "value3"); // Should overwrite value1
      
        System.out.println("Correct map: " + correctMap);
        System.out.println("Size: " + correctMap.size());
      
        // Demonstrate proper behavior
        System.out.println("key1.equals(key3): " + key1.equals(key3));
        System.out.println("key1.compareTo(key3): " + key1.compareTo(key3));
        System.out.println("Map value for equivalent key: " + correctMap.get(key1));
    }
}
```

## Real-World Applications and Design Patterns

> **Enterprise Pattern** : TreeMap excels in scenarios requiring sorted access patterns, such as time-series data, priority queues, and range-based queries common in financial and analytical applications.

```java
import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Real-world TreeMap application: Event scheduling system
 * Demonstrates sorted maps, range queries, and navigation operations
 */
public class EventScheduler {
    
    // Event class representing scheduled activities
    static class Event {
        private final String title;
        private final String description;
        private final int durationMinutes;
        
        public Event(String title, String description, int durationMinutes) {
            this.title = title;
            this.description = description;
            this.durationMinutes = durationMinutes;
        }
        
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public int getDurationMinutes() { return durationMinutes; }
        
        @Override
        public String toString() {
            return String.format("%s (%d min) - %s", title, durationMinutes, description);
        }
    }
    
    // TreeMap stores events sorted by start time
    private final NavigableMap<LocalDateTime, Event> schedule;
    private final DateTimeFormatter timeFormatter;
    
    public EventScheduler() {
        this.schedule = new TreeMap<>();
        this.timeFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
    }
    
    /**
     * Schedule an event at specific time
     * TreeMap automatically maintains chronological order
     */
    public boolean scheduleEvent(LocalDateTime startTime, Event event) {
        // Check for conflicts using TreeMap's range operations
        if (hasConflict(startTime, event.getDurationMinutes())) {
            System.out.println("Conflict detected! Cannot schedule: " + event.getTitle());
            return false;
        }
        
        schedule.put(startTime, event);
        System.out.println("Scheduled: " + event.getTitle() + " at " + 
                          timeFormatter.format(startTime));
        return true;
    }
    
    /**
     * Check for scheduling conflicts using NavigableMap operations
     * Demonstrates practical use of ceiling/floor methods
     */
    private boolean hasConflict(LocalDateTime startTime, int durationMinutes) {
        LocalDateTime endTime = startTime.plusMinutes(durationMinutes);
        
        // Find the event that starts at or after our start time
        Map.Entry<LocalDateTime, Event> nextEvent = schedule.ceilingEntry(startTime);
        if (nextEvent != null && nextEvent.getKey().isBefore(endTime)) {
            return true; // Our event would overlap with next event
        }
        
        // Find the event that starts at or before our start time
        Map.Entry<LocalDateTime, Event> prevEvent = schedule.floorEntry(startTime);
        if (prevEvent != null) {
            LocalDateTime prevEndTime = prevEvent.getKey()
                .plusMinutes(prevEvent.getValue().getDurationMinutes());
            if (prevEndTime.isAfter(startTime)) {
                return true; // Previous event overlaps with our start time
            }
        }
        
        return false;
    }
    
    /**
     * Get events within a time range
     * Demonstrates TreeMap's subMap operation
     */
    public void printEventsInRange(LocalDateTime start, LocalDateTime end) {
        NavigableMap<LocalDateTime, Event> rangeEvents = 
            schedule.subMap(start, true, end, false);
        
        System.out.println("\nEvents from " + timeFormatter.format(start) + 
                          " to " + timeFormatter.format(end) + ":");
        
        if (rangeEvents.isEmpty()) {
            System.out.println("No events scheduled in this range.");
        } else {
            rangeEvents.forEach((time, event) -> 
                System.out.println("  " + timeFormatter.format(time) + " - " + event));
        }
    }
    
    /**
     * Find next available time slot
     * Demonstrates navigation methods for practical scheduling
     */
    public LocalDateTime findNextAvailableSlot(LocalDateTime after, int durationMinutes) {
        // Start checking from the requested time
        LocalDateTime candidate = after;
        
        while (true) {
            // Find next event at or after candidate time
            Map.Entry<LocalDateTime, Event> nextEvent = schedule.ceilingEntry(candidate);
            
            if (nextEvent == null) {
                // No more events - candidate time is available
                return candidate;
            }
            
            LocalDateTime nextEventStart = nextEvent.getKey();
            
            // Check if we have enough time before next event
            if (candidate.plusMinutes(durationMinutes).isAfter(nextEventStart)) {
                // Not enough time - try after the next event ends
                candidate = nextEventStart.plusMinutes(
                    nextEvent.getValue().getDurationMinutes());
            } else {
                // Found available slot
                return candidate;
            }
        }
    }
    
    /**
     * Get today's schedule in chronological order
     * Demonstrates TreeMap's natural ordering
     */
    public void printTodaysSchedule() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        printEventsInRange(startOfDay, endOfDay);
    }
    
    /**
     * Cancel event and suggest rescheduling
     * Demonstrates removal and navigation operations
     */
    public void cancelEvent(LocalDateTime eventTime) {
        Event cancelled = schedule.remove(eventTime);
        if (cancelled != null) {
            System.out.println("Cancelled: " + cancelled.getTitle());
            
            // Suggest next available time
            LocalDateTime nextSlot = findNextAvailableSlot(
                eventTime.plusHours(1), cancelled.getDurationMinutes());
            System.out.println("Next available slot: " + timeFormatter.format(nextSlot));
        } else {
            System.out.println("No event found at " + timeFormatter.format(eventTime));
        }
    }
    
    /**
     * Get summary statistics
     * Demonstrates TreeMap iteration and aggregation
     */
    public void printScheduleSummary() {
        if (schedule.isEmpty()) {
            System.out.println("No events scheduled.");
            return;
        }
        
        int totalEvents = schedule.size();
        int totalMinutes = schedule.values().stream()
            .mapToInt(Event::getDurationMinutes)
            .sum();
        
        LocalDateTime firstEvent = schedule.firstKey();
        LocalDateTime lastEvent = schedule.lastKey();
        
        System.out.println("\n=== Schedule Summary ===");
        System.out.println("Total events: " + totalEvents);
        System.out.println("Total duration: " + totalMinutes + " minutes (" + 
                          totalMinutes / 60.0 + " hours)");
        System.out.println("First event: " + timeFormatter.format(firstEvent));
        System.out.println("Last event: " + timeFormatter.format(lastEvent));
    }
    
    public static void main(String[] args) {
        EventScheduler scheduler = new EventScheduler();
        
        // Create sample events
        LocalDateTime now = LocalDateTime.now();
        
        // Schedule events - TreeMap maintains chronological order automatically
        scheduler.scheduleEvent(now.plusHours(2), 
            new Event("Team Meeting", "Weekly standup", 60));
        scheduler.scheduleEvent(now.plusHours(1), 
            new Event("Code Review", "Review pull requests", 45));
        scheduler.scheduleEvent(now.plusHours(4), 
            new Event("Client Call", "Project status update", 30));
        scheduler.scheduleEvent(now.plusHours(3), 
            new Event("Documentation", "Update API docs", 90));
        
        // Try to schedule conflicting event
        scheduler.scheduleEvent(now.plusHours(1).plusMinutes(30), 
            new Event("Lunch", "Team lunch", 60));
        
        // Demonstrate range queries
        scheduler.printEventsInRange(now, now.plusHours(5));
        
        // Find available time slot
        LocalDateTime availableSlot = scheduler.findNextAvailableSlot(
            now.plusHours(1), 60);
        System.out.println("\nNext 60-minute slot available: " + 
                          scheduler.timeFormatter.format(availableSlot));
        
        // Cancel an event
        scheduler.cancelEvent(now.plusHours(3));
        
        // Print summary
        scheduler.printScheduleSummary();
        
        // Show final schedule
        System.out.println("\n=== Final Schedule ===");
        scheduler.schedule.forEach((time, event) -> 
            System.out.println(scheduler.timeFormatter.format(time) + " - " + event));
    }
}
```

## Memory Model and Garbage Collection Considerations

> **Memory Layout** : Understanding how TreeMap stores data in memory helps optimize usage in memory-constrained environments and explains performance characteristics.

```
TreeMap Memory Structure:

Heap Memory Layout:
┌─────────────────┐
│   TreeMap       │
├─────────────────┤
│ root: Node*     │ ──┐
│ size: int       │   │
│ comparator: *   │   │
└─────────────────┘   │
                      │
    ┌─────────────────▼────┐
    │     Tree Node        │
    ├──────────────────────┤
    │ key: Object*         │ ──► Key Object
    │ value: Object*       │ ──► Value Object  
    │ parent: Node*        │ ──► Parent Node
    │ left: Node*          │ ──► Left Child
    │ right: Node*         │ ──► Right Child
    │ color: boolean       │
    └──────────────────────┘

Memory overhead per entry:
- HashMap: ~32 bytes + key/value objects
- TreeMap: ~40 bytes + key/value objects
- Additional GC pressure from tree restructuring
```

### Optimization Strategies

```java
import java.util.*;
import java.lang.ref.WeakReference;

public class TreeMapOptimization {
  
    // Strategy 1: Use primitive wrapper caching for small numbers
    static void demonstrateIntegerCaching() {
        System.out.println("=== Integer Caching Strategy ===");
      
        TreeMap<Integer, String> optimized = new TreeMap<>();
        TreeMap<Integer, String> unoptimized = new TreeMap<>();
      
        // Use cached integers (-128 to 127) when possible
        for (int i = 0; i < 100; i++) {
            Integer key = i;  // Uses cached Integer objects
            optimized.put(key, "value" + i);
        }
      
        // Create new Integer objects (memory inefficient)
        for (int i = 0; i < 100; i++) {
            Integer key = new Integer(i);  // @deprecated - creates new objects
            unoptimized.put(key, "value" + i);
        }
      
        System.out.println("Optimized uses cached Integer objects for -128 to 127");
        System.out.println("Unoptimized creates new Integer objects (more GC pressure)");
    }
  
    // Strategy 2: Bulk operations for better performance
    static void demonstrateBulkOperations() {
        System.out.println("\n=== Bulk Operations Strategy ===");
      
        // Inefficient: Individual puts
        TreeMap<Integer, String> individual = new TreeMap<>();
        long start = System.currentTimeMillis();
        for (int i = 0; i < 10000; i++) {
            individual.put(i, "value" + i);
        }
        long individualTime = System.currentTimeMillis() - start;
      
        // More efficient: Bulk operation with sorted data
        TreeMap<Integer, String> bulk = new TreeMap<>();
        Map<Integer, String> tempMap = new HashMap<>();
        for (int i = 0; i < 10000; i++) {
            tempMap.put(i, "value" + i);
        }
      
        start = System.currentTimeMillis();
        bulk.putAll(tempMap);
        long bulkTime = System.currentTimeMillis() - start;
      
        System.out.println("Individual insertions: " + individualTime + "ms");
        System.out.println("Bulk insertion: " + bulkTime + "ms");
    }
  
    // Strategy 3: Memory-conscious comparators
    static void demonstrateEfficientComparators() {
        System.out.println("\n=== Efficient Comparator Strategy ===");
      
        // Inefficient: Creates temporary objects during comparison
        Comparator<String> inefficient = (s1, s2) -> {
            String lower1 = s1.toLowerCase();  // Creates new String
            String lower2 = s2.toLowerCase();  // Creates new String
            return lower1.compareTo(lower2);
        };
      
        // Efficient: Reuses comparison logic without object creation
        Comparator<String> efficient = String.CASE_INSENSITIVE_ORDER;
      
        // For custom objects, minimize object creation in compareTo
        class OptimizedPerson implements Comparable<OptimizedPerson> {
            final String name;  // final for safety
            final int age;
            private final int hashCode;  // Pre-computed
          
            OptimizedPerson(String name, int age) {
                this.name = name;
                this.age = age;
                this.hashCode = Objects.hash(name, age);  // Compute once
            }
          
            @Override
            public int compareTo(OptimizedPerson other) {
                // Primary sort: age (primitive comparison - fast)
                int result = Integer.compare(this.age, other.age);
                if (result != 0) return result;
              
                // Secondary sort: name (avoid creating substrings)
                return this.name.compareTo(other.name);
            }
          
            @Override
            public int hashCode() { return hashCode; }  // O(1) lookup
        }
      
        System.out.println("Use pre-computed values and primitive comparisons when possible");
    }
  
    public static void main(String[] args) {
        demonstrateIntegerCaching();
        demonstrateBulkOperations();
        demonstrateEfficientComparators();
    }
}
```

## When to Choose TreeMap vs Alternatives

> **Decision Framework** : Choose TreeMap when sorted access patterns outweigh the performance and memory costs. The decision often depends on your application's access patterns and requirements.

```java
import java.util.*;
import java.util.concurrent.ConcurrentSkipListMap;

public class MapSelectionGuide {
  
    public static void main(String[] args) {
        System.out.println("=== Map Implementation Selection Guide ===\n");
      
        demonstrateUseCase("Need fastest possible access", () -> {
            Map<String, Integer> map = new HashMap<>();
            // Best for: High-frequency access, no ordering requirements
            // O(1) average case for get/put/remove
            return map;
        });
      
        demonstrateUseCase("Need sorted iteration", () -> {
            Map<String, Integer> map = new TreeMap<>();
            // Best for: Ordered iteration, range queries, navigation
            // O(log n) for all operations
            return map;
        });
      
        demonstrateUseCase("Need insertion order preservation", () -> {
            Map<String, Integer> map = new LinkedHashMap<>();
            // Best for: Caching (LRU), maintaining insertion order
            // O(1) average case, but additional memory overhead
            return map;
        });
      
        demonstrateUseCase("Need thread-safe sorted map", () -> {
            Map<String, Integer> map = new ConcurrentSkipListMap<>();
            // Best for: Concurrent access with sorting requirements
            // O(log n) with thread safety
            return map;
        });
      
        printDecisionMatrix();
    }
  
    static void demonstrateUseCase(String scenario, java.util.function.Supplier<Map<String, Integer>> mapSupplier) {
        System.out.println("Scenario: " + scenario);
        Map<String, Integer> map = mapSupplier.get();
        System.out.println("Recommended: " + map.getClass().getSimpleName());
        System.out.println();
    }
  
    static void printDecisionMatrix() {
        System.out.println("=== Decision Matrix ===");
        System.out.println("Requirement              | HashMap | LinkedHashMap | TreeMap | ConcurrentSkipListMap");
        System.out.println("─────────────────────────|─────────|───────────────|─────────|──────────────────────");
        System.out.println("Fastest access           |   ✓✓✓   |      ✓✓       |    ✓    |          ✓           ");
        System.out.println("Sorted iteration         |    ✗    |       ✗       |   ✓✓✓   |         ✓✓✓          ");
        System.out.println("Insertion order          |    ✗    |      ✓✓✓      |    ✗    |          ✗           ");
        System.out.println("Range operations         |    ✗    |       ✗       |   ✓✓✓   |         ✓✓✓          ");
        System.out.println("Memory efficiency        |   ✓✓✓   |      ✓✓       |    ✓    |          ✓           ");
        System.out.println("Thread safety            |    ✗    |       ✗       |    ✗    |         ✓✓✓          ");
        System.out.println("Navigation methods       |    ✗    |       ✗       |   ✓✓✓   |         ✓✓✓          ");
      
        System.out.println("\nChoose TreeMap when you need:");
        System.out.println("• Sorted iteration over key-value pairs");
        System.out.println("• Range queries (subMap, headMap, tailMap)");
        System.out.println("• Navigation operations (ceiling, floor, higher, lower)");
        System.out.println("• Consistent O(log n) performance guarantees");
        System.out.println("• Natural ordering of keys is important for business logic");
    }
}
```

## Summary: TreeMap's Place in Java's Ecosystem

> **Core Understanding** : TreeMap bridges the gap between basic Map functionality and advanced sorted data structure operations. It provides guaranteed O(log n) performance through red-black tree implementation while offering rich navigation and range query capabilities through the NavigableMap interface.

### Key Mental Models to Remember:

1. **Tree Structure** : TreeMap maintains a balanced binary search tree where left < parent < right, ensuring logarithmic height
2. **Sorting Requirement** : Keys must be comparable through Comparable interface or custom Comparator
3. **Performance Trade-off** : Sacrifices HashMap's O(1) average case for guaranteed O(log n) with sorted benefits
4. **Immutability Principle** : Keys should be immutable regarding their comparison fields to maintain tree integrity

### When TreeMap Excels:

* **Time-series data** where chronological access patterns matter
* **Priority systems** requiring sorted iteration and range operations
* **Financial applications** needing ordered data with navigation capabilities
* **Any scenario** where the business logic depends on natural ordering of keys

TreeMap represents Java's commitment to providing specialized collections that solve specific problems efficiently, embodying the principle that the right data structure choice can dramatically improve both performance and code clarity in enterprise applications.
