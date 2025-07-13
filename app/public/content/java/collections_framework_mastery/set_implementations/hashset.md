# HashSet: Hash Table Implementation from First Principles

Let's build understanding of HashSet by starting with fundamental computer science concepts and working up to Java's sophisticated implementation.

## Foundation: What Problem Does a Set Solve?

Before diving into hash tables, let's understand why we need Sets in programming:

```java
// Problem: Finding unique elements efficiently
import java.util.*;

public class SetProblemDemo {
    public static void main(String[] args) {
        // Naive approach - checking duplicates manually
        List<String> names = Arrays.asList("Alice", "Bob", "Alice", "Charlie", "Bob");
        List<String> uniqueNames = new ArrayList<>();
      
        for (String name : names) {
            // O(n) search for each element - O(n²) overall!
            if (!uniqueNames.contains(name)) {
                uniqueNames.add(name);
            }
        }
        System.out.println("Unique names: " + uniqueNames);
      
        // Better approach with Set - O(1) average lookup!
        Set<String> uniqueSet = new HashSet<>(names);
        System.out.println("With HashSet: " + uniqueSet);
    }
}
```

> **Core Problem** : Collections often need to guarantee uniqueness and provide fast membership testing. Linear search through lists becomes prohibitively expensive as data grows. We need a data structure that can determine "is this element already present?" in constant time.

## Hash Tables: The Fundamental Data Structure

### How Hash Tables Work at the Lowest Level

```java
// Simplified hash table concept demonstration
public class SimpleHashTable {
    private String[] buckets;
    private int size;
  
    public SimpleHashTable(int capacity) {
        this.buckets = new String[capacity];
        this.size = 0;
    }
  
    // Hash function: converts object to array index
    private int hash(String key) {
        // Simple hash: sum of character codes mod array length
        int hashCode = 0;
        for (char c : key.toCharArray()) {
            hashCode += c;
        }
        return Math.abs(hashCode) % buckets.length;
    }
  
    public boolean add(String element) {
        int index = hash(element);
      
        // Check if already exists (collision handling simplified)
        if (buckets[index] != null && buckets[index].equals(element)) {
            return false; // Already exists
        }
      
        buckets[index] = element;
        size++;
        return true;
    }
  
    public boolean contains(String element) {
        int index = hash(element);
        return buckets[index] != null && buckets[index].equals(element);
    }
}
```

### Hash Table Memory Layout

```
Hash Function: "Alice" → hash(Alice) = 42
              "Bob"   → hash(Bob)   = 17
              "Charlie" → hash(Charlie) = 9

Array Layout:
Index:  0    1    2    ...  9       ...  17    ...  42    ...  99
Value: null null null     "Charlie"      "Bob"      "Alice"    null

Memory Access Pattern:
1. hash("Alice") = 42
2. buckets[42] → Direct memory access in O(1) time!
3. Compare with stored value for equality
```

> **Key Insight** : Hash tables achieve O(1) average time complexity by using a hash function to map objects directly to memory locations, eliminating the need to search through data sequentially.

## Java's HashSet Implementation

### Understanding the Internal Structure

```java
// Demonstrating HashSet's internal behavior
import java.util.*;

public class HashSetInternals {
    public static void main(String[] args) {
        HashSet<String> set = new HashSet<>();
      
        // Each add() operation:
        // 1. Calls hashCode() on the object
        // 2. Uses hash to find bucket location
        // 3. Calls equals() to check for duplicates in that bucket
        // 4. Stores reference if unique
      
        set.add("Java");     // hashCode() → bucket location
        set.add("Python");   // hashCode() → different bucket
        set.add("Java");     // hashCode() → same bucket, equals() check → not added
      
        System.out.println("Set contents: " + set);
        System.out.println("Size: " + set.size()); // Only 2 elements
      
        // HashSet initial capacity is 16, load factor is 0.75
        // Resizes when size > capacity * load_factor
        System.out.println("Current capacity approximately: 16");
    }
}
```

### HashSet Internal Architecture

```
HashSet Structure:
    ┌─ HashSet ─┐
    │           │
    │  Node[]   │ ← Array of buckets (initial size: 16)
    │  table    │
    └───────────┘
         │
         ▼
Bucket Array:
[0] → Node("Java", hash=123, next=null)
[1] → null
[2] → Node("Python", hash=456, next=Node("Ruby", hash=789, next=null))
[3] → null
...
[15] → Node("C++", hash=999, next=null)

Each Node contains:
- Object reference
- Hash value (cached)
- Next pointer (for collision chaining)
```

## The Critical equals() and hashCode() Contract

### Why This Contract Exists

> **Fundamental Rule** : If two objects are equal according to equals(), they MUST have the same hashCode(). This ensures hash table correctness - equal objects must map to the same bucket.

```java
// Demonstrating the equals/hashCode contract
class Person {
    private String name;
    private int age;
  
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
  
    // CORRECT implementation following the contract
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
      
        Person person = (Person) obj;
        return age == person.age && 
               Objects.equals(name, person.name);
    }
  
    @Override
    public int hashCode() {
        // MUST use same fields as equals()
        return Objects.hash(name, age);
    }
  
    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}

public class HashCodeContractDemo {
    public static void main(String[] args) {
        Set<Person> people = new HashSet<>();
      
        Person alice1 = new Person("Alice", 25);
        Person alice2 = new Person("Alice", 25); // Same data, different object
      
        // These should be considered equal
        System.out.println("alice1.equals(alice2): " + alice1.equals(alice2));
        System.out.println("alice1.hashCode(): " + alice1.hashCode());
        System.out.println("alice2.hashCode(): " + alice2.hashCode());
      
        people.add(alice1);
        people.add(alice2); // Won't be added - duplicate detected
      
        System.out.println("Set size: " + people.size()); // Size: 1
        System.out.println("Contains alice2: " + people.contains(alice2)); // true
    }
}
```

### What Happens When the Contract is Broken

```java
// BROKEN implementation - violates hashCode contract
class BrokenPerson {
    private String name;
    private int age;
  
    public BrokenPerson(String name, int age) {
        this.name = name;
        this.age = age;
    }
  
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
      
        BrokenPerson person = (BrokenPerson) obj;
        return age == person.age && Objects.equals(name, person.name);
    }
  
    // BROKEN: doesn't override hashCode()
    // Uses Object.hashCode() which returns different values for different instances
  
    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}

public class BrokenHashCodeDemo {
    public static void main(String[] args) {
        Set<BrokenPerson> people = new HashSet<>();
      
        BrokenPerson bob1 = new BrokenPerson("Bob", 30);
        BrokenPerson bob2 = new BrokenPerson("Bob", 30);
      
        System.out.println("bob1.equals(bob2): " + bob1.equals(bob2)); // true
        System.out.println("bob1.hashCode(): " + bob1.hashCode());     // e.g., 123456
        System.out.println("bob2.hashCode(): " + bob2.hashCode());     // e.g., 789012
      
        people.add(bob1);
        people.add(bob2); // Added as different object due to different hash codes!
      
        System.out.println("Set size: " + people.size());              // Size: 2 (WRONG!)
        System.out.println("Contains bob2: " + people.contains(bob2)); // true (lucky)
      
        // Create identical third instance
        BrokenPerson bob3 = new BrokenPerson("Bob", 30);
        System.out.println("Contains bob3: " + people.contains(bob3)); // false (BROKEN!)
    }
}
```

## Collision Handling: Separate Chaining

### How Java Handles Hash Collisions

When multiple objects hash to the same bucket, Java uses separate chaining with linked lists (and trees for large chains):

```java
// Demonstrating collision handling
import java.util.*;

public class CollisionDemo {
    static class CollisionString {
        private String value;
      
        public CollisionString(String value) {
            this.value = value;
        }
      
        @Override
        public int hashCode() {
            // Force collisions by always returning same hash code
            return 42; // All objects go to bucket 42!
        }
      
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            CollisionString that = (CollisionString) obj;
            return Objects.equals(value, that.value);
        }
      
        @Override
        public String toString() {
            return value;
        }
    }
  
    public static void main(String[] args) {
        Set<CollisionString> set = new HashSet<>();
      
        // All these will hash to the same bucket
        set.add(new CollisionString("A"));
        set.add(new CollisionString("B"));
        set.add(new CollisionString("C"));
        set.add(new CollisionString("A")); // Duplicate - won't be added
      
        System.out.println("Set contents: " + set);
        System.out.println("Size: " + set.size()); // 3 elements in one bucket chain
      
        // Lookup still works but requires O(n) search through chain
        System.out.println("Contains 'B': " + set.contains(new CollisionString("B")));
    }
}
```

### Collision Resolution Visualization

```
Bucket 42 with Multiple Collisions:
  
bucket[42] → Node("A") → Node("B") → Node("C") → null
              │           │           │
              ▼           ▼           ▼
         hash=42     hash=42     hash=42
         equals()    equals()    equals()
       
Lookup Process for contains("B"):
1. hashCode("B") = 42
2. Go to bucket[42]
3. Traverse chain: "A".equals("B")? No
4. Next: "B".equals("B")? Yes → Found!
5. Return true

Time Complexity:
- Best case (no collisions): O(1)
- Worst case (all in one bucket): O(n)
- Average case (good hash distribution): O(1)
```

## Performance Characteristics and Load Factor

### Understanding HashSet Resizing

```java
// Demonstrating HashSet resizing behavior
import java.lang.reflect.Field;
import java.util.*;

public class HashSetResizing {
    public static void main(String[] args) throws Exception {
        HashSet<Integer> set = new HashSet<>();
      
        // HashSet starts with capacity 16, load factor 0.75
        // Resizes when size > capacity * load_factor (12 elements)
      
        System.out.println("Adding elements and observing capacity...");
      
        for (int i = 0; i < 20; i++) {
            set.add(i);
            if (i == 0 || i == 12 || i == 19) {
                System.out.printf("After adding %d elements:\n", i + 1);
                System.out.printf("  Set size: %d\n", set.size());
                // Note: Actual capacity inspection requires reflection
                // and is implementation-dependent
            }
        }
      
        // Resize triggers:
        // Initial: capacity=16, threshold=12
        // At 13th element: resize to capacity=32, threshold=24
        // At 25th element: resize to capacity=64, threshold=48
    }
}
```

> **Load Factor Significance** : The load factor (0.75) balances memory usage vs. performance. Lower values waste memory but reduce collisions. Higher values save memory but increase collision probability.

### Performance Analysis

```java
// Comparing HashSet performance with different scenarios
import java.util.*;

public class HashSetPerformance {
    public static void main(String[] args) {
        int size = 100000;
      
        // Test 1: Good hash distribution
        long start = System.nanoTime();
        Set<Integer> goodSet = new HashSet<>();
        for (int i = 0; i < size; i++) {
            goodSet.add(i);
        }
        long goodTime = System.nanoTime() - start;
      
        // Test 2: Poor hash distribution (many collisions)
        start = System.nanoTime();
        Set<BadHash> badSet = new HashSet<>();
        for (int i = 0; i < size; i++) {
            badSet.add(new BadHash(i));
        }
        long badTime = System.nanoTime() - start;
      
        System.out.printf("Good hash distribution: %d ms\n", goodTime / 1_000_000);
        System.out.printf("Poor hash distribution: %d ms\n", badTime / 1_000_000);
        System.out.printf("Performance ratio: %.2fx slower\n", (double) badTime / goodTime);
    }
  
    static class BadHash {
        int value;
      
        BadHash(int value) { this.value = value; }
      
        @Override
        public int hashCode() {
            return value % 10; // Only 10 possible hash values!
        }
      
        @Override
        public boolean equals(Object obj) {
            return obj instanceof BadHash && ((BadHash) obj).value == this.value;
        }
    }
}
```

## Common Pitfalls and Best Practices

### Pitfall 1: Mutable Objects in HashSet

```java
// DANGEROUS: Using mutable objects as HashSet elements
import java.util.*;

class MutablePerson {
    String name;  // Mutable field used in equals/hashCode
  
    MutablePerson(String name) { this.name = name; }
  
    @Override
    public boolean equals(Object obj) {
        return obj instanceof MutablePerson && 
               Objects.equals(name, ((MutablePerson) obj).name);
    }
  
    @Override
    public int hashCode() { return Objects.hash(name); }
  
    @Override
    public String toString() { return name; }
}

public class MutableObjectPitfall {
    public static void main(String[] args) {
        Set<MutablePerson> people = new HashSet<>();
        MutablePerson person = new MutablePerson("Alice");
      
        people.add(person);
        System.out.println("Added: " + people); // [Alice]
        System.out.println("Contains Alice: " + people.contains(person)); // true
      
        // DANGER: Modifying object after adding to HashSet
        person.name = "Bob";  // Changes hash code!
      
        System.out.println("After mutation: " + people); // [Bob]
        System.out.println("Contains Bob: " + people.contains(person)); // false!
      
        // Object is "lost" in the HashSet - can't find it anymore!
        System.out.println("Contains Alice: " + people.contains(new MutablePerson("Alice"))); // false
    }
}
```

> **Critical Rule** : Never modify objects stored in HashSet in ways that affect equals() or hashCode(). This breaks the hash table's internal structure and can cause data corruption.

### Best Practice: Immutable Hash Objects

```java
// CORRECT: Using immutable objects
import java.util.*;

public final class ImmutablePerson {
    private final String name;
    private final int age;
    private final int hashCache; // Cache hash code for performance
  
    public ImmutablePerson(String name, int age) {
        this.name = Objects.requireNonNull(name);
        this.age = age;
        this.hashCache = Objects.hash(name, age); // Compute once
    }
  
    public String getName() { return name; }
    public int getAge() { return age; }
  
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
      
        ImmutablePerson that = (ImmutablePerson) obj;
        return age == that.age && name.equals(that.name);
    }
  
    @Override
    public int hashCode() {
        return hashCache; // O(1) hash code lookup
    }
  
    @Override
    public String toString() {
        return String.format("%s(%d)", name, age);
    }
}

public class ImmutableHashSetDemo {
    public static void main(String[] args) {
        Set<ImmutablePerson> people = new HashSet<>();
      
        people.add(new ImmutablePerson("Alice", 25));
        people.add(new ImmutablePerson("Bob", 30));
        people.add(new ImmutablePerson("Alice", 25)); // Duplicate - not added
      
        System.out.println("People: " + people);
        System.out.println("Size: " + people.size()); // 2
      
        // Safe operations - objects cannot be modified
        ImmutablePerson alice = new ImmutablePerson("Alice", 25);
        System.out.println("Contains Alice: " + people.contains(alice)); // true
    }
}
```

## Memory Management and Garbage Collection

### Understanding HashSet Memory Usage

```java
// Analyzing HashSet memory characteristics
import java.util.*;

public class HashSetMemoryAnalysis {
    public static void main(String[] args) {
        // HashSet memory components:
        // 1. Node[] table - array of references (initial 16 * 8 bytes = 128 bytes on 64-bit)
        // 2. Node objects - each contains: hash, key, next (24+ bytes per node)
        // 3. Actual objects stored
      
        Runtime runtime = Runtime.getRuntime();
      
        long memBefore = runtime.totalMemory() - runtime.freeMemory();
      
        Set<String> largeSet = new HashSet<>();
        for (int i = 0; i < 100000; i++) {
            largeSet.add("String_" + i); // Each string ~15 bytes + overhead
        }
      
        long memAfter = runtime.totalMemory() - runtime.freeMemory();
        long memUsed = memAfter - memBefore;
      
        System.out.printf("Memory used by HashSet with 100,000 strings: %d KB\n", 
                         memUsed / 1024);
        System.out.printf("Average memory per element: %d bytes\n", 
                         memUsed / largeSet.size());
      
        // Memory is automatically managed by GC
        largeSet.clear(); // Makes objects eligible for garbage collection
        System.gc(); // Suggest garbage collection
      
        System.out.println("HashSet cleared - memory will be reclaimed by GC");
    }
}
```

## Integration with Java Collections Framework

### HashSet in the Collections Hierarchy

```
Collection Framework Hierarchy:
  
    Collection<E>
        │
        └── Set<E>
            │
            ├── HashSet<E>     ← Hash table implementation
            ├── LinkedHashSet<E> ← Hash table + linked list (maintains insertion order)
            └── TreeSet<E>     ← Red-black tree (sorted order)

Performance Comparison:
Operation    | HashSet | LinkedHashSet | TreeSet
-------------|---------|---------------|--------
add()        | O(1)    | O(1)         | O(log n)
contains()   | O(1)    | O(1)         | O(log n)
remove()     | O(1)    | O(1)         | O(log n)
iteration    | O(n)    | O(n)         | O(n)
ordering     | None    | Insertion    | Natural/Custom
```

### Practical Usage Patterns

```java
// Common HashSet usage patterns in enterprise applications
import java.util.*;
import java.util.stream.Collectors;

public class HashSetUsagePatterns {
    public static void main(String[] args) {
        // Pattern 1: Deduplication
        List<String> emailsWithDuplicates = Arrays.asList(
            "user@domain.com", "admin@site.com", "user@domain.com", "test@example.com"
        );
        Set<String> uniqueEmails = new HashSet<>(emailsWithDuplicates);
        System.out.println("Unique emails: " + uniqueEmails);
      
        // Pattern 2: Fast membership testing
        Set<String> adminUsers = new HashSet<>(Arrays.asList("admin", "root", "superuser"));
        String currentUser = "admin";
        if (adminUsers.contains(currentUser)) {
            System.out.println("User has admin privileges");
        }
      
        // Pattern 3: Set operations (union, intersection, difference)
        Set<String> frontendSkills = new HashSet<>(Arrays.asList("HTML", "CSS", "JavaScript"));
        Set<String> backendSkills = new HashSet<>(Arrays.asList("Java", "SQL", "JavaScript"));
      
        // Intersection - common skills
        Set<String> commonSkills = new HashSet<>(frontendSkills);
        commonSkills.retainAll(backendSkills);
        System.out.println("Full-stack skills: " + commonSkills);
      
        // Union - all skills
        Set<String> allSkills = new HashSet<>(frontendSkills);
        allSkills.addAll(backendSkills);
        System.out.println("All skills: " + allSkills);
      
        // Pattern 4: Stream API integration
        List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 4, 4, 5);
        Set<Integer> uniqueEvens = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toSet());
        System.out.println("Unique even numbers: " + uniqueEvens);
    }
}
```

> **Enterprise Insight** : HashSet is fundamental to many enterprise patterns - caching unique identifiers, implementing security role checks, deduplicating data streams, and optimizing database query results. Its O(1) performance characteristics make it essential for scalable applications.

## Thread Safety Considerations

```java
// HashSet is NOT thread-safe
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class HashSetThreadSafety {
    public static void main(String[] args) throws InterruptedException {
        // UNSAFE: HashSet in multithreaded environment
        Set<Integer> unsafeSet = new HashSet<>();
      
        // SAFE alternatives:
        // 1. Synchronized wrapper (performance impact)
        Set<Integer> syncSet = Collections.synchronizedSet(new HashSet<>());
      
        // 2. ConcurrentHashMap KeySet (better performance)
        Set<Integer> concurrentSet = ConcurrentHashMap.newKeySet();
      
        // 3. Copy-on-write for read-heavy scenarios
        Set<Integer> cowSet = Collections.newSetFromMap(new ConcurrentHashMap<>());
      
        System.out.println("Use synchronized collections or concurrent alternatives");
        System.out.println("for thread-safe Set operations in multithreaded applications");
    }
}
```

> **Threading Rule** : Always use thread-safe alternatives like `Collections.synchronizedSet()` or `ConcurrentHashMap.newKeySet()` when multiple threads access the same Set instance. HashSet's internal state can become corrupted under concurrent modification.

This comprehensive exploration shows how HashSet leverages fundamental computer science principles (hash tables, hash functions) to provide efficient Set operations, while Java's implementation adds robust collision handling, dynamic resizing, and integration with the broader Collections framework. Understanding these principles enables you to use HashSet effectively and debug issues when they arise.
