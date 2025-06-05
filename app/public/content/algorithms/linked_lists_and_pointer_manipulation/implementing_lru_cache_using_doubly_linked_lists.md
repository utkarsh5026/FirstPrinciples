# Implementing LRU Cache Using Doubly Linked Lists: A Complete Guide

Let me take you through one of the most elegant and frequently asked data structure problems in FAANG interviews. We'll build this understanding step by step, starting from the very fundamentals.

## What is Caching? (First Principles)

Before diving into LRU, let's understand why caching exists:

> **Fundamental Principle** : Computers have a hierarchy of storage - CPU registers (fastest), RAM (fast), disk storage (slow). Caching brings frequently used data closer to where it's needed, trading space for speed.

Imagine you're a librarian. Instead of walking to the back room every time someone asks for a popular book, you keep the most requested books on your desk. That's caching!

## Understanding LRU (Least Recently Used)

> **Core Concept** : LRU is an eviction policy that removes the item that hasn't been accessed for the longest time when the cache reaches capacity.

Think of it like your phone's recent apps list - the apps you haven't used recently get pushed to the bottom and eventually disappear.

### Why LRU Makes Sense

The principle behind LRU is **temporal locality** - if something was accessed recently, it's likely to be accessed again soon. This isn't just theory; it's how CPU caches, operating system page replacement, and database buffer pools work.

## The Challenge: What Data Structures Do We Need?

Let's think about what operations an LRU cache must support:

1. **Get(key)** - Retrieve value and mark as recently used
2. **Put(key, value)** - Insert/update and mark as recently used
3. **Eviction** - Remove least recently used when at capacity

> **Critical Insight** : We need both fast lookups (O(1)) and fast reordering (O(1)). No single data structure gives us both!

### Why Arrays/Lists Don't Work

```python
# Naive approach with list
class BadLRUCache:
    def __init__(self, capacity):
        self.items = []  # [(key, value), ...]
        self.capacity = capacity
  
    def get(self, key):
        # O(n) to find the item
        for i, (k, v) in enumerate(self.items):
            if k == key:
                # O(n) to move to front
                item = self.items.pop(i)
                self.items.insert(0, item)
                return v
        return -1
```

 **Problem** : Both finding and reordering are O(n). In interviews, O(n) operations are usually unacceptable for cache implementations.

## Enter the Doubly Linked List

> **Key Insight** : Doubly linked lists allow O(1) insertion, deletion, and moving of nodes when you have a reference to the node.

### Anatomy of a Doubly Linked List Node

```python
class DLLNode:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None
```

Let's visualize this:

```
     ┌─────────┐
     │   key   │
     │  value  │
     │ ┌─────┐ │
     │ │prev │ │ ──→ Points to previous node
     │ └─────┘ │
     │ ┌─────┐ │
     │ │next │ │ ──→ Points to next node  
     │ └─────┘ │
     └─────────┘
```

### Why Doubly (Not Singly) Linked?

> **Critical Requirement** : To remove a node in O(1), we need access to both its predecessor and successor. Singly linked lists require O(n) traversal to find the predecessor.

## The Hybrid Approach: HashMap + Doubly Linked List

Here's the breakthrough insight:

> **Design Pattern** : Use a HashMap for O(1) lookups and a doubly linked list for O(1) reordering. The HashMap values point directly to the linked list nodes.

### Visual Representation

```
HashMap                    Doubly Linked List
┌─────────┐               ┌─────────────────────┐
│"key1" ──│──────────────→│ [key1, val1] ←─→    │
├─────────┤               ├─────────────────────┤
│"key2" ──│──────────────→│ [key2, val2] ←─→    │
├─────────┤               ├─────────────────────┤  
│"key3" ──│──────────────→│ [key3, val3] ←─→    │
└─────────┘               └─────────────────────┘
                          Most Recent ←──→ Least Recent
```

## Step-by-Step Implementation

Let's build this systematically:

### Step 1: The Node Structure

```python
class DLLNode:
    def __init__(self, key=0, value=0):
        self.key = key      # Store key for reverse lookup during eviction
        self.value = value  # The actual cached value
        self.prev = None    # Pointer to previous node
        self.next = None    # Pointer to next node
```

> **Important Detail** : We store the key in the node because when we evict the least recently used node, we need to remove its entry from the HashMap too.

### Step 2: Setting Up the Cache Structure

```python
class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}  # HashMap: key -> DLLNode
      
        # Create dummy head and tail nodes
        self.head = DLLNode()  # Most recently used end
        self.tail = DLLNode()  # Least recently used end
      
        # Connect them
        self.head.next = self.tail
        self.tail.prev = self.head
```

### Why Dummy Nodes?

> **Design Simplification** : Dummy head and tail nodes eliminate edge cases when the list is empty or has one element. Every real node will have valid prev and next pointers.

### Step 3: Core Helper Methods

```python
def _add_node(self, node):
    """Add node right after head (most recent position)"""
    node.prev = self.head
    node.next = self.head.next
  
    self.head.next.prev = node
    self.head.next = node

def _remove_node(self, node):
    """Remove an existing node from the linked list"""
    prev_node = node.prev
    next_node = node.next
  
    prev_node.next = next_node
    next_node.prev = prev_node
```

Let's trace through `_add_node`:

```
Before: HEAD ←─→ [existing] ←─→ TAIL
After:  HEAD ←─→ [new_node] ←─→ [existing] ←─→ TAIL

Steps:
1. new_node.prev = HEAD
2. new_node.next = HEAD.next (which is [existing])
3. [existing].prev = new_node  
4. HEAD.next = new_node
```

### Step 4: Move to Head (Mark as Recently Used)

```python
def _move_to_head(self, node):
    """Move existing node to head (mark as recently used)"""
    self._remove_node(node)
    self._add_node(node)

def _pop_tail(self):
    """Remove the last node (least recently used)"""
    last_node = self.tail.prev
    self._remove_node(last_node)
    return last_node
```

### Step 5: The Main Operations

```python
def get(self, key):
    node = self.cache.get(key)
  
    if node:
        # Move to head (mark as recently used)
        self._move_to_head(node)
        return node.value
  
    return -1  # Key not found

def put(self, key, value):
    node = self.cache.get(key)
  
    if node:
        # Update existing node
        node.value = value
        self._move_to_head(node)
    else:
        # Create new node
        new_node = DLLNode(key, value)
      
        if len(self.cache) >= self.capacity:
            # Remove least recently used
            tail_node = self._pop_tail()
            del self.cache[tail_node.key]
      
        # Add new node
        self.cache[key] = new_node
        self._add_node(new_node)
```

## Complete Implementation## Understanding the Complexity Analysis

### Time Complexity Deep Dive

> **Every operation is O(1)** - This is the holy grail of cache implementations.

Let's analyze each operation:

 **get(key)** :

* HashMap lookup: O(1)
* Move to head: O(1) (we have direct node reference)
* **Total: O(1)**

 **put(key, value)** :

* HashMap lookup: O(1)
* Node operations (remove/add): O(1)
* **Total: O(1)**

### Space Complexity

> **Space Complexity: O(capacity)** - We store exactly `capacity` nodes plus the HashMap entries.

The space usage is predictable and bounded, which is crucial for production systems.

## Tracing Through an Example

Let's walk through a complete example to solidify understanding:

```python
# Initialize LRU with capacity 3
lru = LRUCache(3)

# State: HEAD ←─→ TAIL (empty)
# HashMap: {}
```

### Step 1: Add First Item

```python
lru.put(1, "A")
```

```
State: HEAD ←─→ [1,"A"] ←─→ TAIL
HashMap: {1: node_reference}
```

### Step 2: Add More Items

```python
lru.put(2, "B")
lru.put(3, "C")
```

```
State: HEAD ←─→ [3,"C"] ←─→ [2,"B"] ←─→ [1,"A"] ←─→ TAIL
HashMap: {1: ref1, 2: ref2, 3: ref3}
Most Recent ────────────────────────────────→ Least Recent
```

### Step 3: Access Existing Key

```python
result = lru.get(1)  # Returns "A"
```

> **Key Operation** : Node [1,"A"] moves to the front

```
State: HEAD ←─→ [1,"A"] ←─→ [3,"C"] ←─→ [2,"B"] ←─→ TAIL
HashMap: {1: ref1, 2: ref2, 3: ref3} (unchanged)
```

### Step 4: Exceed Capacity

```python
lru.put(4, "D")  # This will evict key 2
```

 **Process** :

1. Cache is at capacity (3/3)
2. Pop tail node [2,"B"]
3. Remove key 2 from HashMap
4. Add new node [4,"D"] at head

```
State: HEAD ←─→ [4,"D"] ←─→ [1,"A"] ←─→ [3,"C"] ←─→ TAIL
HashMap: {1: ref1, 3: ref3, 4: ref4}
```

## Common Interview Variations

### Variation 1: TTL (Time To Live) Cache

```python
import time

class TTLNode(DLLNode):
    def __init__(self, key=0, value=0, ttl=0):
        super().__init__(key, value)
        self.expiry = time.time() + ttl if ttl > 0 else float('inf')
  
    def is_expired(self):
        return time.time() > self.expiry
```

### Variation 2: LRU with Size-based Eviction

Instead of counting items, evict based on memory size:

```python
class SizeLRUCache(LRUCache):
    def __init__(self, max_size):
        super().__init__(float('inf'))  # No item limit
        self.max_size = max_size
        self.current_size = 0
  
    def _get_size(self, value):
        # Simplified - in reality, you'd measure actual memory
        return len(str(value))
```

## Edge Cases and Error Handling

> **Interview Tip** : Always discuss edge cases! This shows thorough thinking.

### Critical Edge Cases

1. **Capacity of 1**

```python
lru = LRUCache(1)
lru.put(1, "A")
lru.put(2, "B")  # Should evict key 1 immediately
```

2. **Updating Existing Key**

```python
lru.put(1, "A")
lru.put(1, "B")  # Should update, not add new node
```

3. **Getting Non-existent Key**

```python
result = lru.get(999)  # Should return -1
```

## Interview Performance Tips

### What Interviewers Look For

> **Red Flags to Avoid** :
>
> * Not clarifying requirements upfront
> * Forgetting to update HashMap during eviction
> * Missing the need for dummy nodes
> * Not explaining time complexity confidently

### Strong Interview Approach

1. **Start with the problem breakdown** :
   "I need O(1) access and O(1) reordering. HashMap gives me access, doubly linked list gives me reordering."
2. **Draw the data structure** :
   Visual representation shows deep understanding.
3. **Implement incrementally** :
   Build helper methods first, then main operations.
4. **Test with examples** :
   Walk through operations step-by-step.

## Advanced Optimizations

### Memory Pool Pattern

```python
class OptimizedLRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        # Pre-allocate nodes to avoid memory allocation overhead
        self.node_pool = [DLLNode() for _ in range(capacity)]
        self.pool_index = 0
  
    def _get_node(self):
        if self.pool_index < len(self.node_pool):
            node = self.node_pool[self.pool_index]
            self.pool_index += 1
            return node
        return DLLNode()  # Fallback
```

### Thread-Safe Version

```python
import threading

class ThreadSafeLRUCache(LRUCache):
    def __init__(self, capacity):
        super().__init__(capacity)
        self.lock = threading.RLock()
  
    def get(self, key):
        with self.lock:
            return super().get(key)
  
    def put(self, key, value):
        with self.lock:
            return super().put(key, value)
```

## Summary: The Beauty of This Design

> **Final Insight** : The LRU cache exemplifies elegant system design - combining two simple data structures to create something more powerful than either alone.

The key breakthroughs that make this work:

1. **Separation of Concerns** : HashMap handles lookups, linked list handles ordering
2. **Pointer Manipulation** : Direct node references enable O(1) operations
3. **Dummy Nodes** : Eliminate special cases for empty/single-element lists
4. **Bidirectional Links** : Enable O(1) removal from arbitrary positions

This pattern appears throughout systems design - in CPU caches, database buffer pools, CDN implementations, and more. Understanding LRU cache implementation deeply prepares you for these broader system design discussions.

The elegance lies not just in the code, but in how it mirrors the fundamental trade-offs of computer systems: using space (extra pointers, HashMap) to buy time (O(1) operations), and combining simple components (HashMap + linked list) to solve complex problems (efficient caching with ordering).
