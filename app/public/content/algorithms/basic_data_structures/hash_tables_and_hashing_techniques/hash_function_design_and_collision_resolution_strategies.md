# Hash Function Design and Collision Resolution: From First Principles to FAANG Mastery

## What Is a Hash Function? Building from the Ground Up

> **Core Principle** : A hash function is a mathematical transformation that converts input data of arbitrary size into a fixed-size output, called a hash value or hash code.

Let's start with the most fundamental question: *Why do we need to transform data at all?*

Imagine you're organizing a massive library with millions of books. Instead of searching through every shelf linearly, you create a system where each book gets a unique "address" based on its title. This address tells you exactly which shelf and position to find the book. A hash function does exactly this for computer memory.

### The Mathematical Foundation

A hash function `h` maps elements from a large universe `U` to a smaller set of integers `{0, 1, 2, ..., m-1}` where `m` is the size of our hash table.

```
h: U → {0, 1, 2, ..., m-1}
```

Here's a simple example to build intuition:

```python
def simple_hash(key, table_size):
    """
    The most basic hash function - demonstrates the core concept
  
    Args:
        key: The input we want to hash (assuming it's a string)
        table_size: Size of our hash table
  
    Returns:
        An index between 0 and table_size-1
    """
    # Convert string to a number by summing ASCII values
    hash_value = 0
    for char in key:
        hash_value += ord(char)  # ord() gives ASCII value
  
    # Use modulo to ensure result fits in table
    return hash_value % table_size

# Example usage
print(simple_hash("apple", 10))  # Output: 2
print(simple_hash("banana", 10)) # Output: 5
```

 **Detailed Explanation** :

* We iterate through each character in the string
* `ord(char)` converts each character to its ASCII value (e.g., 'a' = 97)
* We sum all ASCII values to get a large number
* The modulo operation (`%`) ensures our result fits within the table bounds

## The Three Pillars of Hash Function Design

> **Fundamental Truth** : Every good hash function must balance three competing goals: speed, uniformity, and determinism.

### 1. Determinism: Same Input, Same Output

A hash function must *always* produce the same output for the same input. This seems obvious, but it's the foundation that makes hash tables work.

### 2. Uniformity: Spreading Data Evenly

The function should distribute keys as evenly as possible across the hash table. Poor distribution leads to clustering and performance degradation.

### 3. Speed: Computational Efficiency

Hash functions are called frequently, so they must be fast. Complex mathematical operations defeat the purpose.

## Advanced Hash Function Designs

### The Division Method: Simple but Effective

```python
def division_hash(key, table_size):
    """
    Division method: h(k) = k mod m
  
    Best practices:
    - Choose m as a prime number
    - Avoid powers of 2 for m
    - Avoid m with small divisors
    """
    # Convert string key to integer if needed
    if isinstance(key, str):
        key_int = 0
        for i, char in enumerate(key):
            key_int += ord(char) * (31 ** i)  # Using 31 as multiplier
        return key_int % table_size
  
    return key % table_size

# Example with prime table size
table_size = 101  # Prime number
print(division_hash("hello", table_size))
```

**Why Prime Numbers?** If `m` has small factors, keys with similar patterns will collide more frequently. Prime numbers minimize these systematic collisions.

### The Multiplication Method: More Uniform Distribution

```python
def multiplication_hash(key, table_size):
    """
    Multiplication method: h(k) = floor(m * (k * A mod 1))
    where A is a constant (0 < A < 1)
  
    Knuth suggests A = (√5 - 1) / 2 ≈ 0.618 (golden ratio)
    """
    import math
  
    # Convert string to integer
    if isinstance(key, str):
        key_int = sum(ord(char) * (31 ** i) for i, char in enumerate(key))
    else:
        key_int = key
  
    A = 0.6180339887  # Golden ratio constant
  
    # Extract fractional part of k * A
    fractional_part = (key_int * A) % 1
  
    # Multiply by table size and take floor
    return int(table_size * fractional_part)

# Example
print(multiplication_hash("data", 1000))
```

 **Key Insight** : The multiplication method is less sensitive to the choice of `m`, making it more robust than the division method.

## Collision Resolution: When Hash Values Collide

> **Inevitable Reality** : No matter how good your hash function, collisions will occur. The art lies in handling them efficiently.

### Strategy 1: Chaining (Separate Chaining)

Chaining stores all colliding elements in a linked list at each hash table slot.

```
Hash Table with Chaining:
┌─────┬─────────────────┐
│  0  │ → "apple" → NULL│
├─────┼─────────────────┤
│  1  │ → NULL          │
├─────┼─────────────────┤
│  2  │ → "dog" → "cat" │
│     │   → NULL        │
├─────┼─────────────────┤
│  3  │ → "bird" → NULL │
└─────┴─────────────────┘
```

```python
class HashTableChaining:
    def __init__(self, size):
        """
        Initialize hash table with chaining
        Each slot contains a list for collision resolution
        """
        self.size = size
        self.table = [[] for _ in range(size)]  # List of lists
        self.count = 0
  
    def _hash(self, key):
        """Simple hash function using division method"""
        if isinstance(key, str):
            return sum(ord(char) for char in key) % self.size
        return key % self.size
  
    def insert(self, key, value):
        """
        Insert key-value pair into hash table
      
        Time Complexity: O(1) average, O(n) worst case
        """
        index = self._hash(key)
      
        # Check if key already exists
        for i, (k, v) in enumerate(self.table[index]):
            if k == key:
                self.table[index][i] = (key, value)  # Update existing
                return
      
        # Add new key-value pair
        self.table[index].append((key, value))
        self.count += 1
  
    def search(self, key):
        """
        Search for a key in the hash table
      
        Time Complexity: O(1) average, O(n) worst case
        """
        index = self._hash(key)
      
        for k, v in self.table[index]:
            if k == key:
                return v
      
        raise KeyError(f"Key '{key}' not found")
  
    def delete(self, key):
        """Remove key from hash table"""
        index = self._hash(key)
      
        for i, (k, v) in enumerate(self.table[index]):
            if k == key:
                del self.table[index][i]
                self.count -= 1
                return v
      
        raise KeyError(f"Key '{key}' not found")

# Example usage
ht = HashTableChaining(5)
ht.insert("apple", 100)
ht.insert("banana", 200)
ht.insert("orange", 300)

print(ht.search("apple"))   # Output: 100
print(ht.search("banana"))  # Output: 200
```

 **Chaining Analysis** :

* **Advantages** : Simple implementation, handles high load factors well
* **Disadvantages** : Extra memory for pointers, poor cache performance
* **Load Factor** : α = n/m (where n = number of elements, m = table size)

### Strategy 2: Open Addressing (Linear Probing)

Open addressing stores all elements directly in the hash table. When a collision occurs, we probe for the next available slot.

```
Hash Table with Linear Probing:
┌─────┬─────────┐
│  0  │ "apple" │ ← Original position
├─────┼─────────┤
│  1  │ "dog"   │ ← Collision, moved here
├─────┼─────────┤
│  2  │ "cat"   │ ← Also hashed to 0, moved here
├─────┼─────────┤
│  3  │ NULL    │
├─────┼─────────┤
│  4  │ "bird"  │
└─────┴─────────┘
```

```python
class HashTableLinearProbing:
    def __init__(self, size):
        """
        Initialize hash table with open addressing
        Uses None to indicate empty slots
        """
        self.size = size
        self.table = [None] * size
        self.count = 0
  
    def _hash(self, key):
        """Primary hash function"""
        if isinstance(key, str):
            return sum(ord(char) for char in key) % self.size
        return key % self.size
  
    def _probe(self, key):
        """
        Find the correct index for a key using linear probing
      
        Returns: (index, found)
        - index: where the key is or should be placed
        - found: True if key exists, False if empty slot found
        """
        index = self._hash(key)
        original_index = index
      
        while self.table[index] is not None:
            stored_key, stored_value = self.table[index]
          
            if stored_key == key:
                return index, True  # Key found
          
            # Linear probing: move to next slot
            index = (index + 1) % self.size
          
            # Table is full if we've circled back
            if index == original_index:
                raise Exception("Hash table is full")
      
        return index, False  # Empty slot found
  
    def insert(self, key, value):
        """
        Insert key-value pair using linear probing
      
        Time Complexity: O(1) average, O(n) worst case
        """
        if self.count >= self.size * 0.7:  # Load factor threshold
            raise Exception("Hash table too full, consider resizing")
      
        index, found = self._probe(key)
      
        if found:
            # Update existing key
            self.table[index] = (key, value)
        else:
            # Insert new key
            self.table[index] = (key, value)
            self.count += 1
  
    def search(self, key):
        """Search for key using linear probing"""
        index, found = self._probe(key)
      
        if found:
            return self.table[index][1]
        else:
            raise KeyError(f"Key '{key}' not found")
  
    def delete(self, key):
        """
        Delete key - requires special handling in open addressing
        We mark slots as 'deleted' rather than None
        """
        index, found = self._probe(key)
      
        if found:
            value = self.table[index][1]
            # Mark as deleted (special sentinel value)
            self.table[index] = ("__DELETED__", None)
            self.count -= 1
            return value
        else:
            raise KeyError(f"Key '{key}' not found")

# Example usage
ht = HashTableLinearProbing(7)
ht.insert("apple", 100)
ht.insert("banana", 200)
ht.insert("orange", 300)

print(ht.search("apple"))   # Output: 100
```

 **Linear Probing Analysis** :

* **Primary Clustering** : Elements tend to cluster together, degrading performance
* **Load Factor Sensitivity** : Performance degrades rapidly as load factor approaches 1
* **Cache Friendly** : Better memory locality than chaining

### Strategy 3: Quadratic Probing

Quadratic probing reduces primary clustering by using a quadratic function for probing.

```python
class HashTableQuadraticProbing:
    def __init__(self, size):
        self.size = size
        self.table = [None] * size
        self.count = 0
  
    def _hash(self, key):
        if isinstance(key, str):
            return sum(ord(char) for char in key) % self.size
        return key % self.size
  
    def _probe(self, key):
        """
        Quadratic probing: h(k, i) = (h(k) + i²) mod m
        where i is the probe number (0, 1, 2, ...)
        """
        base_index = self._hash(key)
      
        for i in range(self.size):
            # Quadratic probe sequence: i² for i = 0, 1, 2, ...
            index = (base_index + i * i) % self.size
          
            if self.table[index] is None:
                return index, False  # Empty slot
          
            stored_key, stored_value = self.table[index]
            if stored_key == key:
                return index, True   # Key found
      
        raise Exception("Hash table is full or probe limit reached")
  
    def insert(self, key, value):
        index, found = self._probe(key)
      
        if found:
            self.table[index] = (key, value)  # Update
        else:
            self.table[index] = (key, value)  # Insert
            self.count += 1

# Example probe sequence for quadratic probing
# If base_index = 3 and table_size = 11:
# Probe 0: (3 + 0²) % 11 = 3
# Probe 1: (3 + 1²) % 11 = 4
# Probe 2: (3 + 2²) % 11 = 7
# Probe 3: (3 + 3²) % 11 = 1 (wraps around)
```

> **Critical Insight** : Quadratic probing eliminates primary clustering but can still suffer from secondary clustering. It also requires careful choice of table size (preferably prime) to ensure all slots can be probed.

### Strategy 4: Double Hashing - The Ultimate Solution

Double hashing uses a second hash function to determine the probe sequence, virtually eliminating clustering.

```python
class HashTableDoubleHashing:
    def __init__(self, size):
        # Ensure size is prime for optimal performance
        self.size = size
        self.table = [None] * size
        self.count = 0
  
    def _hash1(self, key):
        """Primary hash function"""
        if isinstance(key, str):
            return sum(ord(char) for char in key) % self.size
        return key % self.size
  
    def _hash2(self, key):
        """
        Secondary hash function: h2(k) = R - (k mod R)
        where R is a prime smaller than table size
      
        This ensures the step size is never 0
        """
        R = 7  # Prime number smaller than typical table sizes
        if isinstance(key, str):
            key_int = sum(ord(char) for char in key)
            return R - (key_int % R)
        return R - (key % R)
  
    def _probe(self, key):
        """
        Double hashing probe: h(k, i) = (h1(k) + i * h2(k)) mod m
        """
        h1 = self._hash1(key)
        h2 = self._hash2(key)
      
        for i in range(self.size):
            index = (h1 + i * h2) % self.size
          
            if self.table[index] is None:
                return index, False  # Empty slot
          
            stored_key, stored_value = self.table[index]
            if stored_key == key:
                return index, True   # Key found
      
        raise Exception("Hash table is full")
  
    def insert(self, key, value):
        index, found = self._probe(key)
      
        if found:
            self.table[index] = (key, value)
        else:
            self.table[index] = (key, value)
            self.count += 1

# Example probe sequence for double hashing
# If h1(k) = 4, h2(k) = 3, table_size = 11:
# Probe 0: (4 + 0*3) % 11 = 4
# Probe 1: (4 + 1*3) % 11 = 7
# Probe 2: (4 + 2*3) % 11 = 10
# Probe 3: (4 + 3*3) % 11 = 2 (wraps around)
```

## FAANG Interview Deep Dive: What They Really Want

> **Interview Reality** : FAANG companies don't just want you to implement hash tables - they want to see your understanding of trade-offs, scalability, and real-world constraints.

### The Performance Analysis Framework

When discussing hash tables in interviews, structure your analysis around these dimensions:

#### Time Complexity Analysis

```
Operation    | Average | Worst Case | Best Case
-------------|---------|------------|----------
Search       | O(1)    | O(n)       | O(1)
Insert       | O(1)    | O(n)       | O(1)
Delete       | O(1)    | O(n)       | O(1)
```

#### Space Complexity Considerations

* **Chaining** : O(n + m) where n = elements, m = table size
* **Open Addressing** : O(m) where m ≥ n

### Common FAANG Interview Questions and Approaches

#### Question 1: "Design a hash table that maintains O(1) operations even in worst case"

 **Answer Framework** :

```python
class CuckooHashTable:
    """
    Cuckoo hashing guarantees O(1) worst-case lookup time
    Uses two hash functions and two tables
    """
    def __init__(self, size):
        self.size = size
        self.table1 = [None] * size
        self.table2 = [None] * size
        self.max_iterations = 8  # Rehash threshold
  
    def _hash1(self, key):
        return hash(key) % self.size
  
    def _hash2(self, key):
        return (hash(key) // self.size) % self.size
  
    def search(self, key):
        """Guaranteed O(1) lookup"""
        # Check both tables
        idx1 = self._hash1(key)
        if self.table1[idx1] and self.table1[idx1][0] == key:
            return self.table1[idx1][1]
      
        idx2 = self._hash2(key)
        if self.table2[idx2] and self.table2[idx2][0] == key:
            return self.table2[idx2][1]
      
        raise KeyError("Key not found")
  
    def insert(self, key, value):
        """Insert with cuckoo eviction strategy"""
        current_key, current_value = key, value
      
        for _ in range(self.max_iterations):
            # Try table 1
            idx1 = self._hash1(current_key)
            if self.table1[idx1] is None:
                self.table1[idx1] = (current_key, current_value)
                return
          
            # Evict from table 1, move to table 2
            evicted = self.table1[idx1]
            self.table1[idx1] = (current_key, current_value)
            current_key, current_value = evicted
          
            # Try table 2
            idx2 = self._hash2(current_key)
            if self.table2[idx2] is None:
                self.table2[idx2] = (current_key, current_value)
                return
          
            # Evict from table 2, continue cycle
            evicted = self.table2[idx2]
            self.table2[idx2] = (current_key, current_value)
            current_key, current_value = evicted
      
        # If we reach here, need to rehash
        self._rehash()
        self.insert(key, value)  # Retry after rehash
```

#### Question 2: "How would you handle hash table resizing in a production system?"

> **Production Insight** : Resizing can't block the system - you need incremental rehashing.

```python
class IncrementalHashTable:
    """
    Hash table with incremental resizing to avoid blocking
    """
    def __init__(self, initial_size=8):
        self.old_table = None
        self.new_table = [None] * initial_size
        self.old_size = 0
        self.new_size = initial_size
        self.rehash_index = 0  # Track rehashing progress
        self.is_rehashing = False
        self.count = 0
  
    def _should_resize(self):
        """Check if resize is needed"""
        load_factor = self.count / self.new_size
        return load_factor > 0.75
  
    def _incremental_rehash(self, steps=1):
        """
        Rehash a few elements at a time to avoid blocking
        """
        if not self.is_rehashing:
            return
      
        for _ in range(steps):
            if self.rehash_index >= self.old_size:
                # Rehashing complete
                self.old_table = None
                self.is_rehashing = False
                self.rehash_index = 0
                break
          
            # Move elements from old table to new table
            if self.old_table[self.rehash_index] is not None:
                for key, value in self.old_table[self.rehash_index]:
                    self._insert_new_table(key, value)
          
            self.rehash_index += 1
  
    def insert(self, key, value):
        """Insert with incremental rehashing"""
        # Perform a few rehash steps if in progress
        self._incremental_rehash(2)
      
        if self._should_resize() and not self.is_rehashing:
            self._start_resize()
      
        # Insert into appropriate table
        if self.is_rehashing:
            # During rehashing, always insert into new table
            self._insert_new_table(key, value)
        else:
            self._insert_new_table(key, value)
      
        self.count += 1
```

### Memory-Efficient Techniques for FAANG Scale

#### Robin Hood Hashing

```python
class RobinHoodHashTable:
    """
    Robin Hood hashing minimizes variance in probe distances
    "Rich" elements (those close to home) give way to "poor" ones
    """
    def __init__(self, size):
        self.size = size
        self.table = [None] * size
      
    def _probe_distance(self, key, index):
        """Calculate how far an element is from its home position"""
        home = self._hash(key)
        if index >= home:
            return index - home
        else:
            return index + self.size - home  # Wrapped around
  
    def insert(self, key, value):
        """Insert using Robin Hood strategy"""
        index = self._hash(key)
        inserting = (key, value)
        distance = 0
      
        while True:
            if self.table[index] is None:
                # Empty slot found
                self.table[index] = inserting
                break
          
            existing_key, existing_value = self.table[index]
            existing_distance = self._probe_distance(existing_key, index)
          
            if distance > existing_distance:
                # Rob from the rich, give to the poor
                self.table[index] = inserting
                inserting = (existing_key, existing_value)
                distance = existing_distance
          
            index = (index + 1) % self.size
            distance += 1
```

## Key Interview Insights and Gotchas

> **FAANG Secret** : They're not just testing your coding - they want to see systems thinking and trade-off analysis.

### The Questions Behind the Questions

1. **"Implement a hash table"** →  *Really asking* : Do you understand load factors, collision resolution trade-offs, and when to resize?
2. **"Handle a billion records"** →  *Really asking* : Do you understand distributed hashing, consistent hashing, and memory constraints?
3. **"Optimize for cache performance"** →  *Really asking* : Do you understand memory hierarchy and locality of reference?

### The Complete Performance Model

```python
def analyze_hash_table_performance():
    """
    Complete performance analysis for interview discussions
    """
    analysis = {
        "time_complexity": {
            "chaining": {
                "average": "O(1 + α) where α = load factor",
                "worst_case": "O(n) - all elements in one chain"
            },
            "open_addressing": {
                "average": "O(1/(1-α)) for α < 1",
                "worst_case": "O(n) - linear search through table"
            }
        },
      
        "space_complexity": {
            "chaining": "O(n + m) - extra space for pointers",
            "open_addressing": "O(m) - only table space needed"
        },
      
        "cache_performance": {
            "chaining": "Poor - pointer chasing breaks locality",
            "open_addressing": "Good - sequential memory access"
        },
      
        "load_factor_sensitivity": {
            "chaining": "Handles α > 1 gracefully",
            "open_addressing": "Performance degrades rapidly as α → 1"
        }
    }
  
    return analysis
```

### Real-World Production Considerations

> **Production Reality** : Hash tables in FAANG systems handle billions of operations per second with strict latency requirements.

#### Consistent Hashing for Distributed Systems

```python
class ConsistentHashRing:
    """
    Consistent hashing for distributed hash tables
    Used in systems like DynamoDB, Cassandra
    """
    def __init__(self, replicas=150):
        self.replicas = replicas
        self.ring = {}  # Hash value -> node mapping
        self.sorted_hashes = []  # Sorted list of hash values
  
    def _hash(self, key):
        """Use a strong hash function like SHA-1"""
        import hashlib
        return int(hashlib.sha1(key.encode()).hexdigest(), 16)
  
    def add_node(self, node):
        """Add a node to the ring with virtual replicas"""
        for i in range(self.replicas):
            virtual_key = f"{node}:{i}"
            hash_value = self._hash(virtual_key)
            self.ring[hash_value] = node
            self.sorted_hashes.append(hash_value)
      
        self.sorted_hashes.sort()
  
    def get_node(self, key):
        """Find the node responsible for a key"""
        if not self.ring:
            return None
      
        hash_value = self._hash(key)
      
        # Find first node clockwise from hash_value
        for ring_hash in self.sorted_hashes:
            if hash_value <= ring_hash:
                return self.ring[ring_hash]
      
        # Wrap around to first node
        return self.ring[self.sorted_hashes[0]]
```

This comprehensive exploration from first principles to production systems gives you the depth needed to excel in FAANG interviews. The key is demonstrating not just implementation skills, but deep understanding of trade-offs and scalability considerations that matter in real-world systems.
