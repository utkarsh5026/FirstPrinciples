# B-Trees and B+ Trees: From First Principles to FAANG Interviews

## The Fundamental Problem: Why These Trees Exist

Before diving into B-trees and B+ trees, let's understand the core problem they solve from first principles.

> **The Core Problem** : Traditional binary search trees work great in memory, but databases store massive amounts of data on disk. Disk access is thousands of times slower than memory access, so we need data structures optimized for minimizing disk reads.

### The Disk Access Reality

When you search for data in a database:

* **Memory access** : ~1 nanosecond
* **Disk access** : ~10 milliseconds (10 million times slower!)

This means if a binary search tree requires 20 disk reads to find data, it takes 200ms. But if we can reduce it to 3 disk reads, it takes only 30ms.

## First Principles: What Makes B-Trees Special

### Principle 1: Minimize Tree Height

> **Key Insight** : Instead of storing one key per node (like binary trees), store many keys per node to reduce height.

A binary search tree with 1 million nodes has height ~20. A B-tree with the same data might have height 3-4.

### Principle 2: Match Disk Block Size

> **Key Insight** : Each node should fit exactly in one disk block (typically 4KB-8KB), maximizing the number of keys we can read in one disk operation.

### Principle 3: Maintain Balance

All leaf nodes must be at the same level, ensuring consistent performance.

## B-Tree Fundamentals

### Definition and Properties

> **B-Tree Definition** : A self-balancing tree where each node can contain multiple keys and has multiple children. Every node except the root must contain at least ⌈m/2⌉-1 keys, where m is the maximum number of children (order).

**Essential Properties:**

1. All leaves are at the same level
2. Each node has at most m children
3. Each non-leaf node (except root) has at least ⌈m/2⌉ children
4. Root has at least 2 children (unless it's a leaf)
5. Keys within each node are sorted

### Visual Structure (Mobile-Optimized)

```
B-Tree of order 5 (max 4 keys per node):

                [50, 75]
               /    |    \
         [25, 40]  [60]  [80, 90, 95]
        /   |   \   / \   /   |   |   \
      [10] [30] [45][55][65][77][85][88][99]
```

## B-Tree Operations with Code Examples

### 1. Node Structure

```python
class BTreeNode:
    def __init__(self, is_leaf=False):
        self.keys = []           # List of keys in sorted order
        self.children = []       # List of child pointers
        self.is_leaf = is_leaf   # True if leaf node
        self.parent = None       # Parent pointer (for easier operations)
```

 **Explanation** : Each node stores multiple keys in a sorted array and maintains pointers to children. The `is_leaf` flag helps optimize operations since leaf nodes don't have children.

### 2. Search Operation

```python
def search(self, key):
    """Search for a key in the B-tree"""
    # Find the index where key should be located
    i = 0
    while i < len(self.keys) and key > self.keys[i]:
        i += 1
  
    # If key found at current node
    if i < len(self.keys) and key == self.keys[i]:
        return self
  
    # If this is a leaf and key not found
    if self.is_leaf:
        return None
  
    # Recursively search in appropriate child
    return self.children[i].search(key)
```

 **Detailed Explanation** :

* We scan through keys to find the correct position
* If key matches, we found it
* If we're at a leaf without finding the key, it doesn't exist
* Otherwise, we recurse to the appropriate child subtree

### 3. Insertion with Node Splitting

```python
def insert_non_full(self, key):
    """Insert key into a node that's guaranteed not to be full"""
    i = len(self.keys) - 1
  
    if self.is_leaf:
        # Insert into leaf node
        self.keys.append(None)
        while i >= 0 and key < self.keys[i]:
            self.keys[i + 1] = self.keys[i]
            i -= 1
        self.keys[i + 1] = key
    else:
        # Find child to insert into
        while i >= 0 and key < self.keys[i]:
            i -= 1
        i += 1
      
        # If child is full, split it first
        if len(self.children[i].keys) == self.max_keys:
            self.split_child(i)
            if key > self.keys[i]:
                i += 1
      
        # Recursively insert into child
        self.children[i].insert_non_full(key)
```

 **Key Concepts Explained** :

* **Non-full insertion** : We only insert into nodes with space
* **Proactive splitting** : If a child is full, we split it before descending
* **Maintaining order** : Keys are shifted to maintain sorted order

## B+ Tree: Evolution for Database Optimization

### Key Differences from B-Trees

> **Fundamental Change** : In B+ trees, all actual data is stored only in leaf nodes. Internal nodes contain only keys for navigation.

### B+ Tree Properties

1. **All data in leaves** : Internal nodes are purely for routing
2. **Leaf node linking** : All leaf nodes are connected in a linked list
3. **Key duplication** : Keys appear in both internal nodes and leaves
4. **Sequential access** : Perfect for range queries

### Visual Structure (Mobile-Optimized)

```
B+ Tree:

Internal Nodes (routing only):
                [50, 75]
               /    |    \
         [25, 40]  [60]  [80, 90]
              |      |      |

Leaf Level (all data here):
[10,20,25]→[30,40,45]→[50,55,60,65]→[75,77,80]→[85,90,95,99]
    ↑                                                    ↑
  First                                                Last
```

### B+ Tree Node Implementation

```python
class BPlusTreeNode:
    def __init__(self, is_leaf=False):
        self.keys = []
        self.values = []        # Only used in leaf nodes
        self.children = []      # Only used in internal nodes
        self.is_leaf = is_leaf
        self.next_leaf = None   # Points to next leaf (for range queries)
        self.parent = None
      
    def is_full(self, max_keys):
        return len(self.keys) >= max_keys
```

 **Important Distinctions** :

* `values` array only exists in leaf nodes
* `next_leaf` pointer creates a linked list of all leaves
* Internal nodes only contain routing information

### Range Query Implementation

```python
def range_query(self, start_key, end_key):
    """Find all values between start_key and end_key"""
    result = []
  
    # Find the starting leaf node
    leaf = self.find_leaf(start_key)
  
    # Traverse leaves using next_leaf pointers
    while leaf is not None:
        for i, key in enumerate(leaf.keys):
            if start_key <= key <= end_key:
                result.append(leaf.values[i])
            elif key > end_key:
                return result  # We've gone past the range
      
        leaf = leaf.next_leaf  # Move to next leaf
  
    return result
```

 **Why This Is Powerful** :

* **Sequential access** : Once we find the starting point, we just follow linked list
* **No tree traversal** : No need to go back up and down the tree
* **Cache friendly** : Sequential memory access pattern

## Time Complexity Analysis

### B-Tree Complexities

> **Search, Insert, Delete** : O(log_m n) where m is the order and n is the number of keys

**Why logarithmic with base m?**

* Each level can have up to m children
* Height is log_m(n)
* At each level, we do O(log m) work to find the right child (binary search on keys)

### Practical Example

For a B-tree of order 100 with 1 million records:

* Height ≈ log₁₀₀(1,000,000) ≈ 3
* Maximum disk reads needed: 3
* Binary search tree would need: log₂(1,000,000) ≈ 20 disk reads

## FAANG Interview Perspectives

### Common Interview Questions

 **Question 1** : "Why don't databases use binary search trees?"

> **Perfect Answer** : "Binary search trees have O(log n) height, requiring many disk accesses. B-trees reduce height by storing multiple keys per node, matching disk block sizes. This minimizes expensive disk I/O operations."

 **Question 2** : "When would you choose B+ trees over B-trees?"

> **Key Points** :
>
> * Range queries are frequent (B+ tree's linked leaves excel here)
> * Sequential access patterns
> * All data at leaves improves cache locality
> * Internal nodes can be kept in memory more easily

### Implementation Challenges

 **Memory Management** :

```python
class BTreeManager:
    def __init__(self, order):
        self.order = order
        self.max_keys = order - 1
        self.min_keys = (order // 2) - 1
      
    def needs_split(self, node):
        return len(node.keys) > self.max_keys
      
    def needs_merge(self, node):
        return len(node.keys) < self.min_keys
```

 **Split Operation Detail** :

```python
def split_child(self, parent, child_index):
    """Split a full child node"""
    full_child = parent.children[child_index]
    mid_index = len(full_child.keys) // 2
  
    # Create new node for right half
    new_child = BTreeNode(full_child.is_leaf)
  
    # Move right half of keys to new node
    new_child.keys = full_child.keys[mid_index + 1:]
    full_child.keys = full_child.keys[:mid_index]
  
    # If not leaf, move children too
    if not full_child.is_leaf:
        new_child.children = full_child.children[mid_index + 1:]
        full_child.children = full_child.children[:mid_index + 1]
  
    # Promote middle key to parent
    promoted_key = full_child.keys[mid_index]
    parent.keys.insert(child_index, promoted_key)
    parent.children.insert(child_index + 1, new_child)
```

## Real-World Database Applications

### Index Structures

> **Primary Use Case** : Database indexes use B+ trees because they need to support both point queries (find specific record) and range queries (find all records between two values).

 **Example SQL Query** :

```sql
SELECT * FROM employees WHERE salary BETWEEN 50000 AND 80000;
```

This query benefits from B+ tree's linked leaf nodes for efficient range scanning.

### File System Applications

Modern file systems (like ext4, NTFS) use B-tree variants for:

* Directory structures
* File allocation tables
* Metadata indexing

## Advanced Concepts for Senior Interviews

### Concurrency Control

 **Problem** : Multiple transactions accessing B-trees simultaneously

 **Solution** : Lock coupling (crab-walking)

```python
def concurrent_search(self, key):
    """Thread-safe search using lock coupling"""
    current = self.root
    current.read_lock()
  
    while not current.is_leaf:
        next_child = current.find_child(key)
        next_child.read_lock()
        current.read_unlock()  # Release parent lock
        current = next_child
  
    result = current.search_key(key)
    current.read_unlock()
    return result
```

### Buffer Pool Management

> **Key Insight** : Database systems keep frequently accessed B-tree pages in memory buffer pool to avoid disk I/O.

 **LRU-based Buffer Management** :

```python
class BufferPool:
    def __init__(self, size):
        self.cache = {}  # page_id -> BTreeNode
        self.lru = OrderedDict()
        self.max_size = size
  
    def get_page(self, page_id):
        if page_id in self.cache:
            # Move to end (most recently used)
            self.lru.move_to_end(page_id)
            return self.cache[page_id]
      
        # Load from disk and manage cache
        if len(self.cache) >= self.max_size:
            self.evict_lru()
      
        page = self.load_from_disk(page_id)
        self.cache[page_id] = page
        self.lru[page_id] = True
        return page
```

## Summary: Key Takeaways for Interviews

> **The Big Picture** : B-trees and B+ trees solve the fundamental problem of efficient disk-based data access by minimizing tree height and optimizing for block-based I/O patterns.

 **Interview Success Points** :

1. **Understand the "why"** : Always explain that these structures exist because of the massive speed difference between memory and disk access
2. **Know the trade-offs** : B-trees vs B+ trees, when to use each
3. **Implementation details** : Splitting, merging, maintaining balance properties
4. **Real-world context** : Database indexes, file systems, search engines
5. **Complexity analysis** : Why O(log_m n) matters in practice

 **Final Advice** : In FAANG interviews, they often care more about your understanding of the fundamental problems these structures solve than perfect implementation details. Focus on explaining the reasoning behind design decisions and how they optimize for real-world constraints.
