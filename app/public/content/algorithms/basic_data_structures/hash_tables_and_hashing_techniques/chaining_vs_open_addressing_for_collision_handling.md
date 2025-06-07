# Hash Table Collision Handling: Chaining vs Open Addressing

Let me take you through the fundamental concepts of hash table collision resolution from the ground up, as this is a critical topic for FAANG interviews.

## Understanding Hash Tables from First Principles

Before diving into collision handling, let's establish what hash tables are and why collisions occur.

> **Core Concept** : A hash table is a data structure that implements an associative array - a structure that maps keys to values using a hash function to compute an index into an array of buckets or slots.

### Why Do Collisions Happen?

Imagine you have an array of size 7, and you want to store the following keys: "apple", "banana", "cherry". You use a simple hash function:

```python
def simple_hash(key, table_size):
    """
    Simple hash function that sums ASCII values
    """
    hash_value = 0
    for char in key:
        hash_value += ord(char)  # Get ASCII value
    return hash_value % table_size

# Example with table size 7
print(simple_hash("apple", 7))   # Returns some index
print(simple_hash("banana", 7))  # Might return the same index!
```

> **The Collision Problem** : When two different keys hash to the same index, we have a collision. This is inevitable due to the Pigeonhole Principle - if you have more keys than slots, at least one slot must contain multiple keys.

```
Visual representation:
Keys to store: "apple", "banana", "cherry", "date", "elderberry"
Table size: 3

Index 0: [  ]
Index 1: [  ]  
Index 2: [  ]

After hashing:
Index 0: ["apple", "date"]     ← Collision!
Index 1: ["banana"]
Index 2: ["cherry", "elderberry"] ← Another collision!
```

Now let's explore the two main strategies to handle these collisions.

---

## Method 1: Chaining (Separate Chaining)

> **Core Idea** : Store all colliding elements in the same slot using a secondary data structure (usually a linked list, but can be dynamic arrays or even balanced trees).

### How Chaining Works

Think of each slot in your hash table as a "parking spot" that can accommodate multiple cars by stacking them vertically.

```python
class HashNode:
    """
    Node for storing key-value pairs in a chain
    """
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.next = None  # Pointer to next node in chain

class HashTableChaining:
    def __init__(self, initial_size=7):
        """
        Initialize hash table with separate chaining
        """
        self.size = initial_size
        self.table = [None] * self.size  # Array of chain heads
        self.count = 0  # Number of key-value pairs
  
    def _hash(self, key):
        """
        Hash function: converts key to table index
        """
        hash_value = 0
        for char in str(key):
            hash_value = (hash_value * 31 + ord(char)) % self.size
        return hash_value
  
    def insert(self, key, value):
        """
        Insert a key-value pair
        Time Complexity: O(1) average, O(n) worst case
        """
        index = self._hash(key)
      
        # If slot is empty, create first node
        if self.table[index] is None:
            self.table[index] = HashNode(key, value)
            self.count += 1
            return
      
        # Traverse the chain to check if key exists or find end
        current = self.table[index]
        while current:
            if current.key == key:
                current.value = value  # Update existing key
                return
            if current.next is None:
                break
            current = current.next
      
        # Add new node at end of chain
        current.next = HashNode(key, value)
        self.count += 1
```

### Detailed Example of Chaining in Action

Let's trace through inserting several items:

```python
# Create hash table and insert items
ht = HashTableChaining(5)

# Insert "apple" -> 100
# _hash("apple") = 2
# table[2] = Node("apple", 100)

ht.insert("apple", 100)
print("After inserting 'apple':")
# Index 0: None
# Index 1: None  
# Index 2: ["apple":100] -> None
# Index 3: None
# Index 4: None

# Insert "banana" -> 200  
# _hash("banana") = 2 (collision with apple!)
# table[2] = Node("apple", 100) -> Node("banana", 200)

ht.insert("banana", 200)
print("After inserting 'banana' (collision!):")
# Index 0: None
# Index 1: None
# Index 2: ["apple":100] -> ["banana":200] -> None
# Index 3: None  
# Index 4: None
```

> **Key Insight** : Each collision simply extends the chain at that index. The hash table never "fills up" in the traditional sense.

### Search Operation in Chaining

```python
def search(self, key):
    """
    Search for a key in the hash table
    Time Complexity: O(1) average, O(n) worst case
    """
    index = self._hash(key)
    current = self.table[index]
  
    # Traverse the chain at this index
    while current:
        if current.key == key:
            return current.value
        current = current.next
  
    raise KeyError(f"Key '{key}' not found")

# Example usage
try:
    value = ht.search("apple")  # Returns 100
    print(f"Found: {value}")
except KeyError as e:
    print(e)
```

### Visual Representation of Chaining

```
Hash Table with Chaining (Size = 5)

Index 0: None

Index 1: ["cat":50] -> ["dog":75] -> None
         (Both hash to index 1)

Index 2: ["apple":100] -> ["banana":200] -> ["cherry":150] -> None
         (All three hash to index 2)

Index 3: None

Index 4: ["elephant":300] -> None
```

---

## Method 2: Open Addressing

> **Core Idea** : When a collision occurs, find another empty slot within the hash table itself using a probing sequence. All elements are stored directly in the table array.

### Linear Probing (Simplest Open Addressing)

Think of this like looking for a parking spot - if your preferred spot is taken, check the next spot, then the next, until you find an empty one.

```python
class HashTableOpenAddressing:
    def __init__(self, initial_size=7):
        """
        Initialize hash table with open addressing (linear probing)
        """
        self.size = initial_size
        self.keys = [None] * self.size    # Store keys
        self.values = [None] * self.size  # Store values  
        self.deleted = [False] * self.size # Track deleted slots
        self.count = 0
  
    def _hash(self, key):
        """Primary hash function"""
        hash_value = 0
        for char in str(key):
            hash_value = (hash_value * 31 + ord(char)) % self.size
        return hash_value
  
    def _probe(self, key):
        """
        Find the appropriate slot for a key using linear probing
        Returns: (index, found) where found indicates if key exists
        """
        index = self._hash(key)
        original_index = index
      
        while self.keys[index] is not None:
            # Key found
            if self.keys[index] == key and not self.deleted[index]:
                return index, True
          
            # Move to next slot (linear probing)
            index = (index + 1) % self.size
          
            # Table is full or we've gone full circle
            if index == original_index:
                break
              
        return index, False
  
    def insert(self, key, value):
        """
        Insert key-value pair using open addressing
        Time Complexity: O(1) average, O(n) worst case
        """
        if self.count >= self.size * 0.7:  # Load factor threshold
            self._resize()
      
        index, found = self._probe(key)
      
        if found:
            self.values[index] = value  # Update existing
        else:
            self.keys[index] = key
            self.values[index] = value
            self.deleted[index] = False
            self.count += 1
```

### Detailed Example of Linear Probing

Let's trace through the insertion process:

```python
# Create hash table with size 7
ht = HashTableOpenAddressing(7)

# Insert "apple" -> 100
# _hash("apple") = 3
# keys[3] = "apple", values[3] = 100

ht.insert("apple", 100)
print("After inserting 'apple':")
# Index 0: [None, None]
# Index 1: [None, None]  
# Index 2: [None, None]
# Index 3: ["apple", 100]  ← Stored here
# Index 4: [None, None]
# Index 5: [None, None]
# Index 6: [None, None]

# Insert "banana" -> 200
# _hash("banana") = 3 (collision!)
# Check index 3: occupied by "apple"
# Check index 4: empty! Store here

ht.insert("banana", 200)
print("After inserting 'banana' (collision resolved):")
# Index 0: [None, None]
# Index 1: [None, None]
# Index 2: [None, None]  
# Index 3: ["apple", 100]   ← Original location
# Index 4: ["banana", 200]  ← Probed to next slot
# Index 5: [None, None]
# Index 6: [None, None]
```

### Search in Open Addressing

```python
def search(self, key):
    """
    Search for a key using the same probing sequence
    """
    index, found = self._probe(key)
  
    if found and not self.deleted[index]:
        return self.values[index]
  
    raise KeyError(f"Key '{key}' not found")

# The search follows the same path as insertion
# For "banana": hash to 3, find "apple", probe to 4, find "banana"
```

> **Critical Point** : Search must follow the exact same probing sequence as insertion, otherwise we might miss elements that were displaced by collisions.

### The Deletion Challenge in Open Addressing

Deletion in open addressing is tricky because you can't simply remove an element - it might break the probing chain for other elements.

```python
def delete(self, key):
    """
    Delete a key using lazy deletion (marking as deleted)
    """
    index, found = self._probe(key)
  
    if found and not self.deleted[index]:
        self.deleted[index] = True  # Mark as deleted, don't remove
        self.count -= 1
        return True
  
    return False
```

### Visual Representation of Linear Probing

```
Hash Table with Linear Probing (Size = 7)

Initial state:
[0] [1] [2] [3] [4] [5] [6]
 ∅   ∅   ∅   ∅   ∅   ∅   ∅

After inserting keys that hash to index 2:

Step 1: Insert "cat" (hashes to 2)
[0] [1] [2] [3] [4] [5] [6]
 ∅   ∅  cat  ∅   ∅   ∅   ∅

Step 2: Insert "dog" (hashes to 2, collision!)
[0] [1] [2] [3] [4] [5] [6]
 ∅   ∅  cat dog  ∅   ∅   ∅
            ↑   ↑
         taken, so probe to next

Step 3: Insert "fish" (hashes to 2, collision!)  
[0] [1] [2] [3] [4] [5] [6]
 ∅   ∅  cat dog fish ∅   ∅
            ↑   ↑   ↑
         taken taken, so probe to next
```

---

## Advanced Open Addressing: Quadratic Probing and Double Hashing

### Quadratic Probing

Instead of checking consecutive slots, jump by increasing squares to reduce clustering.

```python
def _quadratic_probe(self, key):
    """
    Quadratic probing: check positions hash(key), hash(key)+1², hash(key)+2², etc.
    """
    index = self._hash(key)
    original_index = index
    i = 0
  
    while self.keys[index] is not None:
        if self.keys[index] == key and not self.deleted[index]:
            return index, True
      
        i += 1
        # Quadratic probing formula
        index = (original_index + i * i) % self.size
      
        if i >= self.size:  # Avoid infinite loop
            break
          
    return index, False
```

### Double Hashing

Use a second hash function to determine the step size for probing.

```python
def _double_hash_probe(self, key):
    """
    Double hashing: step size determined by second hash function
    """
    index = self._hash(key)
    step = self._hash2(key)  # Second hash function
    original_index = index
  
    while self.keys[index] is not None:
        if self.keys[index] == key and not self.deleted[index]:
            return index, True
      
        index = (index + step) % self.size
      
        if index == original_index:  # Full circle
            break
          
    return index, False

def _hash2(self, key):
    """
    Second hash function for double hashing
    Should return a value coprime to table size
    """
    hash_value = 0
    for char in str(key):
        hash_value = (hash_value * 37 + ord(char))
    return 7 - (hash_value % 7)  # Assuming table size is prime
```

---

## Comprehensive Comparison: Chaining vs Open Addressing

> **Performance Analysis** : Understanding when to choose each method is crucial for FAANG interviews.

### Time Complexity Comparison

| Operation | Chaining (Average) | Chaining (Worst) | Open Addressing (Average) | Open Addressing (Worst) |
| --------- | ------------------ | ---------------- | ------------------------- | ----------------------- |
| Search    | O(1)               | O(n)             | O(1)                      | O(n)                    |
| Insert    | O(1)               | O(1)             | O(1)                      | O(n)                    |
| Delete    | O(1)               | O(n)             | O(1)                      | O(n)                    |

### Space Complexity Analysis

```python
# Chaining space usage
class SpaceAnalysisChaining:
    """
    Space = Table array + All nodes + Pointers
    """
    def calculate_space(self, table_size, num_elements):
        table_space = table_size * 8  # Pointer size
        node_space = num_elements * (8 + 8 + 8)  # key + value + next pointer
        return table_space + node_space

# Open Addressing space usage  
class SpaceAnalysisOpenAddressing:
    """
    Space = Fixed table size (keys + values + deleted flags)
    """
    def calculate_space(self, table_size):
        return table_size * (8 + 8 + 1)  # key + value + deleted flag
```

> **Memory Efficiency** : Open addressing is generally more memory-efficient as it doesn't require extra pointers, but requires maintaining a low load factor.

### Load Factor Considerations

```python
def analyze_load_factor():
    """
    Load Factor = Number of elements / Table size
    """
  
    # Chaining can handle load factor > 1
    chaining_performance = {
        "load_factor_0.5": "Excellent performance",
        "load_factor_1.0": "Good performance", 
        "load_factor_2.0": "Acceptable performance",
        "load_factor_5.0": "Poor performance (long chains)"
    }
  
    # Open addressing requires load factor < 1
    open_addressing_performance = {
        "load_factor_0.5": "Excellent performance",
        "load_factor_0.7": "Good performance (typical threshold)",
        "load_factor_0.9": "Poor performance (many collisions)",
        "load_factor_1.0": "Table full, operations fail"
    }
```

---

## FAANG Interview Considerations

> **What interviewers look for** : Deep understanding of trade-offs, implementation details, and when to use each approach.

### Common Interview Questions and Answers

**Q: "When would you choose chaining over open addressing?"**

```python
def choose_collision_resolution(requirements):
    """
    Decision framework for collision resolution
    """
    if requirements.get("memory_constrained"):
        return "Open Addressing - No pointer overhead"
  
    if requirements.get("high_load_factor"):
        return "Chaining - Can handle load factor > 1"
  
    if requirements.get("frequent_deletions"):
        return "Chaining - No lazy deletion issues"
  
    if requirements.get("cache_performance_critical"):
        return "Open Addressing - Better cache locality"
  
    if requirements.get("simple_implementation"):
        return "Chaining - Easier to implement correctly"
```

**Q: "How do you handle resizing in both approaches?"**

```python
class ResizableHashTable:
    def _resize_chaining(self):
        """
        Resizing with chaining: rehash all elements
        """
        old_table = self.table
        old_size = self.size
      
        # Double the size and reinitialize
        self.size = old_size * 2
        self.table = [None] * self.size
        self.count = 0
      
        # Rehash all existing elements
        for head in old_table:
            current = head
            while current:
                self.insert(current.key, current.value)
                current = current.next
  
    def _resize_open_addressing(self):
        """
        Resizing with open addressing: rehash all non-deleted elements
        """
        old_keys = self.keys
        old_values = self.values
        old_deleted = self.deleted
        old_size = self.size
      
        # Double the size and reinitialize
        self.size = old_size * 2
        self.keys = [None] * self.size
        self.values = [None] * self.size
        self.deleted = [False] * self.size
        self.count = 0
      
        # Rehash all non-deleted elements
        for i in range(old_size):
            if old_keys[i] is not None and not old_deleted[i]:
                self.insert(old_keys[i], old_values[i])
```

### Performance Benchmarking Code

```python
import time
import random

def benchmark_collision_methods():
    """
    Compare performance of both methods
    """
    # Test data
    test_keys = [f"key_{i}" for i in range(1000)]
    test_values = list(range(1000))
  
    # Benchmark chaining
    ht_chain = HashTableChaining(100)
    start_time = time.time()
    for key, value in zip(test_keys, test_values):
        ht_chain.insert(key, value)
    chain_insert_time = time.time() - start_time
  
    # Benchmark open addressing
    ht_open = HashTableOpenAddressing(100)
    start_time = time.time()
    for key, value in zip(test_keys, test_values):
        ht_open.insert(key, value)
    open_insert_time = time.time() - start_time
  
    print(f"Chaining insert time: {chain_insert_time:.4f}s")
    print(f"Open addressing insert time: {open_insert_time:.4f}s")
```

---

## Real-World Applications and Best Practices

> **Industry Usage** : Understanding where each method is used in practice gives you credibility in interviews.

### When Big Tech Uses Each Method

**Chaining is preferred when:**

* High load factors are expected (Python dictionaries use a variant)
* Memory allocation is not a primary concern
* Deletion operations are frequent
* Thread safety is easier to implement (lock individual chains)

**Open Addressing is preferred when:**

* Cache performance is critical (Java HashMap uses a hybrid approach)
* Memory is constrained
* Load factors can be kept low
* Better worst-case memory usage is needed

### Summary for Interview Success

> **Key Takeaway** : Both collision resolution methods have their place. The choice depends on your specific requirements: memory constraints, expected load factor, deletion frequency, and performance requirements.

Remember these essential points for your FAANG interview:

1. **Understand the trade-offs deeply** - Don't just memorize, understand why each approach works
2. **Know the implementation details** - Be able to code both methods from scratch
3. **Discuss load factors** - Show you understand performance implications
4. **Consider resizing strategies** - Demonstrate knowledge of dynamic data structures
5. **Think about real-world usage** - Connect your knowledge to practical applications

The interviewer wants to see that you can not only implement these structures but also make informed decisions about when to use each approach based on the problem constraints.
