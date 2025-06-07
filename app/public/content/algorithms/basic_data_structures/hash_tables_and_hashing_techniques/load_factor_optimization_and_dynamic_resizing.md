# Load Factor Optimization and Dynamic Resizing in Hash Tables

Let me walk you through one of the most crucial concepts in hash table design that frequently appears in FAANG interviews. We'll build this understanding from the ground up.

## Understanding Hash Tables from First Principles

Before diving into load factor, let's establish what a hash table fundamentally is:

> **Core Concept** : A hash table is a data structure that maps keys to values using a hash function to compute an index into an array of buckets or slots.

Think of it like a library catalog system. Instead of searching through every book linearly, you use a systematic method (hash function) to quickly locate where a book should be stored.

### Basic Hash Table Structure

```python
class SimpleHashTable:
    def __init__(self, initial_capacity=8):
        self.capacity = initial_capacity
        self.size = 0  # Number of key-value pairs stored
        self.buckets = [None] * self.capacity
  
    def _hash(self, key):
        """Simple hash function - converts key to array index"""
        return hash(key) % self.capacity
```

 **Code Explanation** :

* `capacity`: Total number of slots in our array
* `size`: How many items we've actually stored
* `_hash()`: Takes a key and returns an index between 0 and capacity-1

## What is Load Factor?

> **Load Factor (α) = Number of stored elements / Total capacity**

The load factor tells us how "full" our hash table is. It's the single most important metric for hash table performance.

### Visual Representation

```
Hash Table with capacity = 8, size = 3
Load Factor = 3/8 = 0.375 (37.5% full)

Index:  0    1    2    3    4    5    6    7
       ┌────┬────┬────┬────┬────┬────┬────┬────┐
Bucket:│Key1│    │Key2│    │    │Key3│    │    │
       └────┴────┴────┴────┴────┴────┴────┴────┘
```

## Why Load Factor Matters: The Performance Story

Let's understand this through collision analysis. When multiple keys hash to the same index, we have a collision.

### Collision Handling Example

```python
class HashTableWithChaining:
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.size = 0
        # Each bucket is a list to handle collisions
        self.buckets = [[] for _ in range(capacity)]
  
    def _hash(self, key):
        return hash(key) % self.capacity
  
    def put(self, key, value):
        index = self._hash(key)
        bucket = self.buckets[index]
      
        # Check if key already exists
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)  # Update existing
                return
      
        # Add new key-value pair
        bucket.append((key, value))
        self.size += 1
```

 **Code Explanation** :

* Each bucket is now a list that can store multiple key-value pairs
* When inserting, we first check if the key exists in that bucket's list
* If not found, we append the new pair to the bucket's list

### Performance Impact of Load Factor

> **Critical Insight** : As load factor increases, the average length of collision chains increases, degrading performance from O(1) to O(n) in worst case.

Let's see this mathematically:

```python
def analyze_performance(load_factor):
    """
    Average chain length ≈ load_factor (for uniform hashing)
    Expected time complexity: O(1 + α) where α is load factor
    """
    if load_factor <= 0.75:
        return "Excellent performance O(1)"
    elif load_factor <= 1.0:
        return "Good performance O(1-2)"
    elif load_factor <= 2.0:
        return "Degraded performance O(2-3)"
    else:
        return "Poor performance O(n)"

# Examples
print(analyze_performance(0.5))   # Excellent
print(analyze_performance(0.75))  # Excellent  
print(analyze_performance(1.5))   # Degraded
```

## Dynamic Resizing: The Solution

> **Key Principle** : When load factor exceeds a threshold (typically 0.75), we resize the hash table to maintain optimal performance.

### The Resizing Process

Dynamic resizing involves three critical steps:

1. **Create a new, larger array** (typically double the size)
2. **Rehash all existing elements** into the new array
3. **Update the capacity and reset size counter**

### Complete Implementation

```python
class DynamicHashTable:
    def __init__(self, initial_capacity=8):
        self.capacity = initial_capacity
        self.size = 0
        self.buckets = [[] for _ in range(self.capacity)]
        self.load_factor_threshold = 0.75
  
    def _hash(self, key):
        return hash(key) % self.capacity
  
    def _get_load_factor(self):
        return self.size / self.capacity if self.capacity > 0 else 0
  
    def _resize(self):
        """Double the capacity and rehash all elements"""
        print(f"Resizing from {self.capacity} to {self.capacity * 2}")
      
        # Store old buckets
        old_buckets = self.buckets
        old_capacity = self.capacity
      
        # Create new, larger array
        self.capacity *= 2
        self.size = 0  # Reset size, will be incremented during rehashing
        self.buckets = [[] for _ in range(self.capacity)]
      
        # Rehash all existing elements
        for bucket in old_buckets:
            for key, value in bucket:
                self._put_without_resize(key, value)
  
    def _put_without_resize(self, key, value):
        """Helper method to insert without triggering resize"""
        index = self._hash(key)
        bucket = self.buckets[index]
      
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                return
      
        bucket.append((key, value))
        self.size += 1
  
    def put(self, key, value):
        """Main insertion method with resize logic"""
        # Check if resize is needed BEFORE insertion
        if self._get_load_factor() >= self.load_factor_threshold:
            self._resize()
      
        self._put_without_resize(key, value)
      
        print(f"Load factor: {self._get_load_factor():.3f}")
```

 **Code Explanation** :

* `_resize()`: Creates new array with double capacity and rehashes all elements
* `_put_without_resize()`: Helper that inserts without checking resize conditions
* We check load factor BEFORE insertion to prevent exceeding threshold
* During resize, we reset size to 0 and recount as we rehash

### Demonstrating Dynamic Resizing

```python
# Test the dynamic resizing
ht = DynamicHashTable(4)  # Start with small capacity

keys = ['apple', 'banana', 'cherry', 'date', 'elderberry']

for i, key in enumerate(keys):
    print(f"\nInserting '{key}':")
    ht.put(key, f"value_{i}")
    print(f"Capacity: {ht.capacity}, Size: {ht.size}")
```

 **Expected Output** :

```
Inserting 'apple':
Load factor: 0.250

Inserting 'banana':
Load factor: 0.500

Inserting 'cherry':
Load factor: 0.750

Inserting 'date':
Resizing from 4 to 8
Load factor: 0.500

Inserting 'elderberry':
Load factor: 0.625
```

## Advanced Optimization Techniques

### 1. Shrinking on Deletion

```python
def remove(self, key):
    """Remove a key and potentially shrink the table"""
    index = self._hash(key)
    bucket = self.buckets[index]
  
    for i, (k, v) in enumerate(bucket):
        if k == key:
            bucket.pop(i)
            self.size -= 1
          
            # Shrink if load factor drops too low
            if (self.capacity > 8 and 
                self._get_load_factor() < 0.25):
                self._shrink()
            return True
  
    return False  # Key not found

def _shrink(self):
    """Halve the capacity when load factor is too low"""
    old_buckets = self.buckets
    self.capacity //= 2
    self.size = 0
    self.buckets = [[] for _ in range(self.capacity)]
  
    for bucket in old_buckets:
        for key, value in bucket:
            self._put_without_resize(key, value)
```

### 2. Load Factor Thresholds for Different Use Cases

> **Interview Insight** : Different applications require different load factor strategies.

```python
class OptimizedHashTable:
    def __init__(self, use_case="balanced"):
        self.capacity = 8
        self.size = 0
        self.buckets = [[] for _ in range(self.capacity)]
      
        # Different thresholds for different use cases
        if use_case == "memory_efficient":
            self.max_load_factor = 0.9  # Higher threshold
            self.min_load_factor = 0.3
        elif use_case == "speed_optimized":
            self.max_load_factor = 0.5  # Lower threshold
            self.min_load_factor = 0.1
        else:  # balanced
            self.max_load_factor = 0.75
            self.min_load_factor = 0.25
```

## Time Complexity Analysis

> **Critical for FAANG Interviews** : Understanding the amortized analysis of dynamic resizing.

### Amortized Cost Calculation

```python
def amortized_analysis():
    """
    Individual resize operation: O(n) - must rehash all elements
    But resizing frequency decreases as table grows
  
    Amortized cost per insertion: O(1)
  
    Proof sketch:
    - Insert n elements into initially empty table
    - Resizing happens at sizes: 1, 2, 4, 8, 16, ..., n
    - Total rehashing cost: 1 + 2 + 4 + 8 + ... + n ≈ 2n
    - Average cost per insertion: 2n/n = 2 = O(1)
    """
    pass
```

### Space Complexity Considerations

```
Best Case Space: O(n) - when load factor ≈ 0.75
Worst Case Space: O(2n) - right after resize, load factor ≈ 0.375
Average Space: O(1.33n) - accounting for resize cycles
```

## Common FAANG Interview Questions

### Question 1: "Design a Hash Table with Dynamic Resizing"

 **Key Points to Cover** :

* Load factor monitoring
* Resize triggers (both growth and shrinkage)
* Rehashing strategy
* Amortized complexity analysis

### Question 2: "What happens if we set load factor threshold to 0.95?"

```python
# High load factor consequences
def high_load_factor_analysis():
    """
    Pros:
    - Better memory utilization
    - Fewer resize operations
  
    Cons:
    - Longer collision chains
    - Degraded average performance
    - Higher worst-case latency
  
    Trade-off: Memory vs Speed
    """
    pass
```

### Question 3: "Implement a hash table that never exceeds O(1) lookup time"

> **Advanced Concept** : This leads to discussing Cuckoo Hashing or Robin Hood Hashing - advanced techniques that guarantee O(1) worst-case lookup.

## Practical Implementation Tips

### 1. Prime Number Capacities

```python
def next_prime(n):
    """Using prime capacities reduces clustering"""
    def is_prime(num):
        if num < 2:
            return False
        for i in range(2, int(num ** 0.5) + 1):
            if num % i == 0:
                return False
        return True
  
    while not is_prime(n):
        n += 1
    return n

# Usage in hash table
self.capacity = next_prime(self.capacity * 2)
```

### 2. Incremental Resizing

```python
class IncrementalHashTable:
    """
    Spreads resize cost across multiple operations
    instead of doing it all at once
    """
    def __init__(self):
        self.old_buckets = None
        self.new_buckets = None
        self.resize_index = 0
        self.in_resize = False
  
    def _incremental_resize_step(self):
        """Migrate one bucket per operation during resize"""
        if self.in_resize and self.resize_index < len(self.old_buckets):
            # Migrate one bucket
            bucket = self.old_buckets[self.resize_index]
            for key, value in bucket:
                # Insert into new table
                pass
            self.resize_index += 1
          
            if self.resize_index >= len(self.old_buckets):
                self.in_resize = False
```

## Summary: Key Takeaways

> **For FAANG Interviews, Remember** :
>
> 1. **Load Factor = Size / Capacity** - the fundamental metric
> 2. **Typical threshold: 0.75** - balance between space and time
> 3. **Resize doubles capacity** - maintains amortized O(1) performance
> 4. **Rehashing is required** - all elements get new positions
> 5. **Amortized analysis** - individual resize is O(n), but average insertion remains O(1)

The beauty of dynamic resizing lies in its ability to maintain consistent performance as data grows, making hash tables one of the most efficient data structures for real-world applications. Understanding these principles deeply will serve you well in both interviews and system design scenarios.
