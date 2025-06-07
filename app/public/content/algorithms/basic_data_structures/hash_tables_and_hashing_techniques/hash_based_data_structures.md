# Hash-Based Data Structures: From First Principles to FAANG Success

Let's embark on a comprehensive journey through hash-based data structures, building from the ground up to understand how HashSet and HashMap work internally—knowledge that's crucial for FAANG interviews.

## Chapter 1: The Foundation - What is Hashing?

> **Core Principle** : Hashing is a technique that transforms any input (key) into a fixed-size numerical value (hash code) that serves as an index to directly access data in constant time.

Think of hashing like a library's cataloging system. Instead of searching through every book linearly, the librarian uses a systematic method to assign each book a specific shelf location based on its title or ISBN. Similarly, hashing assigns each piece of data a specific "address" in memory.

### The Mathematical Foundation

At its core, a hash function is a mathematical transformation:

```
hash_function: Key → Integer (within array bounds)
```

Here's a simple visualization of the concept:

```
Input Key → Hash Function → Hash Code → Array Index

"apple"   →      h()     →    1234    →      4
"banana"  →      h()     →    5678    →      8  
"cherry"  →      h()     →    9012    →      2
```

### Why Hashing Matters in FAANG Interviews

> **Interview Insight** : Hash-based structures provide O(1) average-case lookup, insertion, and deletion—making them essential for optimizing brute-force O(n²) solutions to O(n).

## Chapter 2: Designing a Hash Function

A good hash function must satisfy several critical properties:

### Property 1: Deterministic Behavior

```java
// A hash function must always return the same output for the same input
public int simpleHash(String key) {
    int hash = 0;
    for (int i = 0; i < key.length(); i++) {
        hash += key.charAt(i);  // Sum ASCII values
    }
    return hash;
}
```

 **Explanation** : This function sums ASCII values of all characters. For "abc", it returns 97+98+99 = 294. Every time we call it with "abc", we get 294.

### Property 2: Uniform Distribution

```java
// Better hash function using polynomial rolling hash
public int polynomialHash(String key, int tableSize) {
    int hash = 0;
    int prime = 31;  // Small prime number
  
    for (int i = 0; i < key.length(); i++) {
        hash = (hash * prime + key.charAt(i)) % tableSize;
    }
    return Math.abs(hash);
}
```

 **Detailed Breakdown** :

* `prime = 31`: Using a prime number reduces clustering
* `hash * prime`: Gives positional weight to characters
* `+ key.charAt(i)`: Adds character's ASCII value
* `% tableSize`: Ensures result fits within array bounds
* `Math.abs()`: Handles potential negative values

> **Why Prime Numbers?** Prime numbers in hash functions reduce the likelihood of patterns that cause clustering, ensuring better distribution across the hash table.

## Chapter 3: The Collision Problem

Even with perfect hash functions, collisions are inevitable due to the  **Pigeonhole Principle** :

```
If n items are put into m containers, with n > m, 
then at least one container must contain more than one item.
```

### Collision Resolution Strategies

#### Strategy 1: Separate Chaining

```java
class HashNode {
    String key;
    int value;
    HashNode next;
  
    HashNode(String key, int value) {
        this.key = key;
        this.value = value;
        this.next = null;
    }
}

class SeparateChainingHashMap {
    private HashNode[] table;
    private int size;
    private int capacity;
  
    public SeparateChainingHashMap() {
        this.capacity = 16;  // Initial capacity
        this.table = new HashNode[capacity];
        this.size = 0;
    }
}
```

 **Visual Representation** :

```
Index | Chain
------|--------
  0   | null
  1   | ["apple",10] → ["grape",20] → null
  2   | ["banana",15] → null
  3   | null
  4   | ["cherry",25] → null
```

#### Strategy 2: Open Addressing (Linear Probing)

```java
class LinearProbingHashMap {
    private String[] keys;
    private Integer[] values;
    private boolean[] deleted;  // Handle deletions
    private int size;
    private int capacity;
  
    public LinearProbingHashMap() {
        this.capacity = 16;
        this.keys = new String[capacity];
        this.values = new Integer[capacity];
        this.deleted = new boolean[capacity];
        this.size = 0;
    }
  
    private int hash(String key) {
        return Math.abs(key.hashCode() % capacity);
    }
  
    public void put(String key, int value) {
        if (size >= capacity * 0.75) {  // Load factor check
            resize();
        }
      
        int index = hash(key);
      
        // Linear probing to find empty slot
        while (keys[index] != null && !deleted[index]) {
            if (keys[index].equals(key)) {
                values[index] = value;  // Update existing
                return;
            }
            index = (index + 1) % capacity;  // Wrap around
        }
      
        keys[index] = key;
        values[index] = value;
        deleted[index] = false;
        size++;
    }
}
```

 **Key Points in the Code** :

1. **Load Factor** : `size >= capacity * 0.75` prevents clustering
2. **Linear Probing** : `(index + 1) % capacity` moves to next slot
3. **Wrap Around** : `% capacity` ensures we stay within bounds
4. **Deletion Handling** : `deleted[]` array marks removed elements

## Chapter 4: Building HashSet from Scratch

> **HashSet Principle** : A HashSet is essentially a HashMap where we only care about keys, not values. We store keys and use a dummy value (like Boolean.TRUE).

```java
class MyHashSet {
    private boolean[] buckets;
    private int capacity;
  
    public MyHashSet() {
        this.capacity = 1000;  // Initial size
        this.buckets = new boolean[capacity];
    }
  
    private int hash(int key) {
        return key % capacity;
    }
  
    public void add(int key) {
        int index = hash(key);
        buckets[index] = true;
    }
  
    public boolean contains(int key) {
        int index = hash(key);
        return buckets[index];
    }
  
    public void remove(int key) {
        int index = hash(key);
        buckets[index] = false;
    }
}
```

 **This Simple Version Has Problems** : What if `hash(5) == hash(1005)`? Both would map to the same index!

### Improved HashSet with Collision Handling

```java
class ImprovedHashSet {
    private List<Integer>[] buckets;
    private int capacity;
  
    @SuppressWarnings("unchecked")
    public ImprovedHashSet() {
        this.capacity = 1000;
        this.buckets = new LinkedList[capacity];
      
        // Initialize each bucket
        for (int i = 0; i < capacity; i++) {
            buckets[i] = new LinkedList<>();
        }
    }
  
    private int hash(int key) {
        return key % capacity;
    }
  
    public void add(int key) {
        int index = hash(key);
        List<Integer> bucket = buckets[index];
      
        // Check if key already exists
        if (!bucket.contains(key)) {
            bucket.add(key);
        }
    }
  
    public boolean contains(int key) {
        int index = hash(key);
        return buckets[index].contains(key);
    }
  
    public void remove(int key) {
        int index = hash(key);
        buckets[index].removeIf(k -> k.equals(key));
    }
}
```

 **Detailed Explanation** :

* **`List<Integer>[] buckets`** : Array of lists for separate chaining
* **Initialization Loop** : Each bucket starts as an empty LinkedList
* **`bucket.contains(key)`** : Checks if key exists before adding
* **`removeIf()`** : Lambda expression to remove matching elements

## Chapter 5: Building HashMap from Scratch

HashMap extends the HashSet concept by storing key-value pairs:

```java
class MyHashMap {
    class MapNode {
        int key;
        int value;
        MapNode next;
      
        MapNode(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }
  
    private MapNode[] table;
    private int size;
    private int capacity;
    private static final double LOAD_FACTOR = 0.75;
  
    public MyHashMap() {
        this.capacity = 16;
        this.table = new MapNode[capacity];
        this.size = 0;
    }
  
    private int hash(int key) {
        // Better hash function to reduce clustering
        key ^= (key >>> 16);  // XOR with shifted version
        return Math.abs(key % capacity);
    }
  
    public void put(int key, int value) {
        if (size >= capacity * LOAD_FACTOR) {
            resize();
        }
      
        int index = hash(key);
        MapNode current = table[index];
      
        // Check if key already exists in chain
        while (current != null) {
            if (current.key == key) {
                current.value = value;  // Update existing
                return;
            }
            current = current.next;
        }
      
        // Add new node at beginning of chain
        MapNode newNode = new MapNode(key, value);
        newNode.next = table[index];
        table[index] = newNode;
        size++;
    }
  
    public int get(int key) {
        int index = hash(key);
        MapNode current = table[index];
      
        while (current != null) {
            if (current.key == key) {
                return current.value;
            }
            current = current.next;
        }
      
        return -1;  // Key not found
    }
  
    private void resize() {
        MapNode[] oldTable = table;
        capacity *= 2;
        size = 0;
        table = new MapNode[capacity];
      
        // Rehash all existing elements
        for (MapNode head : oldTable) {
            while (head != null) {
                put(head.key, head.value);
                head = head.next;
            }
        }
    }
}
```

### Critical Implementation Details

 **Hash Function Enhancement** :

```java
key ^= (key >>> 16);  // XOR with shifted version
```

This XOR operation with a right-shifted version reduces hash collisions by mixing bits more thoroughly.

 **Resize Operation** :

> **Why Resize?** When load factor exceeds 0.75, chains become too long, degrading performance from O(1) to O(n). Resizing maintains optimal performance.

The resize process:

1. **Double capacity** : `capacity *= 2`
2. **Reset size** : Start counting again
3. **Rehash everything** : All elements get new positions due to new capacity

## Chapter 6: Time and Space Complexity Analysis

### Time Complexity Breakdown

| Operation | Average Case | Worst Case | Best Case |
| --------- | ------------ | ---------- | --------- |
| Insert    | O(1)         | O(n)       | O(1)      |
| Search    | O(1)         | O(n)       | O(1)      |
| Delete    | O(1)         | O(n)       | O(1)      |

> **Worst Case Scenario** : All keys hash to the same index, creating a single long chain. This degrades to linear search through a linked list.

### Space Complexity

* **HashMap/HashSet** : O(n) where n is the number of elements
* **Additional overhead** : O(capacity) for the underlying array

### Load Factor Impact

```java
// Demonstration of load factor effects
public void demonstrateLoadFactor() {
    // Good load factor (0.75)
    HashMap<String, Integer> goodMap = new HashMap<>(); 
    // Average chain length ≈ 0.75
  
    // Bad load factor (approach 1.0)
    HashMap<String, Integer> badMap = new HashMap<>(10);
    // If we add 15 elements, average chain length ≈ 1.5
}
```

## Chapter 7: FAANG Interview Patterns

### Pattern 1: Frequency Counting

```java
// Count character frequency in a string
public Map<Character, Integer> countFrequency(String s) {
    Map<Character, Integer> freq = new HashMap<>();
  
    for (char c : s.toCharArray()) {
        freq.put(c, freq.getOrDefault(c, 0) + 1);
    }
  
    return freq;
}
```

 **Interview Insight** : `getOrDefault()` is cleaner than checking `containsKey()` first.

### Pattern 2: Two Sum Problem

```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
  
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
      
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
      
        map.put(nums[i], i);
    }
  
    return new int[]{};
}
```

 **Key Strategy** : Use HashMap to store previously seen numbers and their indices. For each new number, check if its complement exists.

### Pattern 3: Detecting Duplicates

```java
public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
  
    for (int num : nums) {
        if (!seen.add(num)) {  // add() returns false if already exists
            return true;
        }
    }
  
    return false;
}
```

 **Clever Technique** : `Set.add()` returns `false` if element already exists, eliminating need for separate `contains()` check.

## Chapter 8: Advanced Concepts for Senior Interviews

### Consistent Hashing

Used in distributed systems (like those at FAANG companies):

```java
class ConsistentHash {
    private TreeMap<Integer, String> ring = new TreeMap<>();
    private int virtualNodes = 100;
  
    public void addServer(String server) {
        for (int i = 0; i < virtualNodes; i++) {
            int hash = hash(server + ":" + i);
            ring.put(hash, server);
        }
    }
  
    public String getServer(String key) {
        int hash = hash(key);
        Map.Entry<Integer, String> entry = ring.ceilingEntry(hash);
      
        return entry != null ? entry.getValue() : ring.firstEntry().getValue();
    }
}
```

> **Why Virtual Nodes?** They ensure better load distribution when servers are added or removed, preventing hotspots.

### Hash Table Resizing Strategies

```java
// Incremental resizing to avoid blocking
class IncrementalHashMap {
    private MapNode[] oldTable;
    private MapNode[] newTable;
    private int resizeIndex = 0;
  
    private void incrementalResize() {
        if (oldTable != null && resizeIndex < oldTable.length) {
            // Move one bucket per operation
            MapNode head = oldTable[resizeIndex];
            while (head != null) {
                MapNode next = head.next;
                rehashNode(head);
                head = next;
            }
            resizeIndex++;
        }
    }
}
```

## Chapter 9: Common Pitfalls and Interview Tips

### Pitfall 1: Hash Code Consistency

```java
// Wrong approach
class BadKey {
    private List<String> data;
  
    @Override
    public int hashCode() {
        return data.hashCode();  // Changes if list is modified!
    }
}

// Correct approach
class GoodKey {
    private final List<String> data;  // Immutable
  
    @Override
    public int hashCode() {
        return Objects.hash(data);
    }
}
```

> **Golden Rule** : Objects used as keys must be immutable, or at least their hash-relevant fields must not change.

### Pitfall 2: Null Handling

```java
public void safeHashMapUsage() {
    Map<String, Integer> map = new HashMap<>();
  
    // HashMap allows one null key
    map.put(null, 42);  // Valid
  
    // But be careful with operations
    String key = null;
    map.getOrDefault(key, 0);  // Safe
    map.computeIfAbsent(key, k -> k.length());  // NullPointerException!
}
```

### Interview Strategy: Complexity Analysis

When explaining your solution:

1. **State the time complexity** : "This solution runs in O(n) time..."
2. **Explain the space complexity** : "We use O(n) extra space for the HashMap..."
3. **Justify the hash table choice** : "HashMap gives us O(1) lookup, which improves our solution from O(n²) to O(n)"

> **Final Thought** : Hash-based data structures are fundamental to efficient algorithm design. Master them not just for interviews, but for building scalable systems that can handle real-world data volumes.

This deep understanding of hash-based structures—from first principles to advanced patterns—will serve you well in FAANG interviews and beyond. The key is not just knowing how to use HashMap and HashSet, but understanding *why* they work and *when* to apply them optimally.
