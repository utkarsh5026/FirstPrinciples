# Treap and Skip List: Advanced Data Structures for FAANG Interviews

When preparing for FAANG interviews, understanding advanced data structures like **Treap** and **Skip List** can set you apart from other candidates. These structures represent elegant solutions to fundamental computer science problems and demonstrate deep algorithmic thinking.

> **Why These Matter in FAANG Interviews:** Both Treap and Skip List are probabilistic data structures that provide efficient search, insertion, and deletion operations. They showcase your understanding of randomization in algorithms and your ability to work with complex data structures beyond basic trees and hash tables.

## Understanding the Foundation: What Problem Do They Solve?

Before diving into these structures, let's understand the fundamental challenge they address.

**The Core Problem:** We want a data structure that maintains sorted order while providing fast operations (search, insert, delete) - ideally O(log n) time complexity. Traditional Binary Search Trees can degrade to O(n) in worst-case scenarios when they become unbalanced.

> **Key Insight:** Both Treap and Skip List use randomization to achieve probabilistic balance, ensuring good average-case performance without the complexity of deterministic balancing (like AVL or Red-Black trees).

## Treap: First Principles Explanation

### What is a Treap?

A **Treap** (Tree + Heap) is a brilliant combination of two fundamental data structures:

1. **Binary Search Tree property** for the keys
2. **Heap property** for randomly assigned priorities

> **The Genius of Treap:** Each node has two values - a key (follows BST property) and a priority (follows heap property). The randomness in priorities ensures the tree stays balanced on average.

Let's visualize this concept:

```
Example Treap Structure:
     (5,90)
    /      \
 (3,70)   (8,60)
 /         /    \
(1,40)  (7,30) (9,20)

Key: (key, priority)
BST property: left < parent < right (for keys)
Heap property: parent_priority > child_priority
```

### Building a Treap from First Principles

Let's implement a basic Treap step by step:

```python
import random

class TreapNode:
    def __init__(self, key, value=None):
        self.key = key
        self.value = value if value is not None else key
        self.priority = random.random()  # Random priority [0,1)
        self.left = None
        self.right = None
  
    def __str__(self):
        return f"({self.key},{self.priority:.2f})"
```

**Explanation of the Node Structure:**

* `key`: The value we're storing (maintains BST property)
* `value`: Additional data (optional, defaults to key)
* `priority`: Random number that maintains heap property
* `left/right`: Child pointers like any binary tree

> **Why Random Priority Works:** The random priority ensures that the tree structure is independent of the insertion order. This randomization prevents worst-case scenarios where all insertions create a linear chain.

### Core Operations: Rotations

Treaps maintain their properties through rotations, just like other balanced trees:

```python
def rotate_right(self, root):
    """
    Right rotation: brings left child up
  
    Before:      After:
        y           x
       / \         / \
      x   C  -->  A   y
     / \             / \
    A   B           B   C
    """
    if not root or not root.left:
        return root
  
    new_root = root.left
    root.left = new_root.right
    new_root.right = root
    return new_root

def rotate_left(self, root):
    """
    Left rotation: brings right child up
  
    Before:      After:
      x             y
     / \           / \
    A   y   -->   x   C
       / \       / \
      B   C     A   B
    """
    if not root or not root.right:
        return root
  
    new_root = root.right
    root.right = new_root.left
    new_root.left = root
    return new_root
```

**Why These Rotations Work:**

* They preserve the BST property (in-order traversal remains the same)
* They allow us to adjust the tree structure to maintain heap property
* They're the fundamental operations for maintaining balance

### Complete Treap Implementation

```python
class Treap:
    def __init__(self):
        self.root = None
  
    def insert(self, key, value=None):
        """Insert a key-value pair maintaining both BST and heap properties"""
        self.root = self._insert(self.root, key, value)
  
    def _insert(self, root, key, value):
        # Base case: create new node
        if not root:
            return TreapNode(key, value)
      
        # BST insertion logic
        if key < root.key:
            root.left = self._insert(root.left, key, value)
            # Check heap property with left child
            if root.left.priority > root.priority:
                root = self.rotate_right(root)
        elif key > root.key:
            root.right = self._insert(root.right, key, value)
            # Check heap property with right child
            if root.right.priority > root.priority:
                root = self.rotate_left(root)
        else:
            # Key already exists, update value
            root.value = value if value is not None else key
      
        return root
```

**Step-by-Step Insertion Process:**

1. **Follow BST property** to find insertion point
2. **Create new node** with random priority
3. **Bubble up** using rotations if heap property is violated
4. **Stop when** heap property is satisfied

Let's trace through an example:

```python
# Example: Inserting keys 1, 2, 3, 4, 5
treap = Treap()
keys = [3, 1, 4, 2, 5]

for key in keys:
    treap.insert(key)
    print(f"Inserted {key}")
```

## Skip List: First Principles Explanation

### What is a Skip List?

A **Skip List** is a probabilistic data structure that allows fast search within an ordered sequence of elements. Think of it as a "highway system" for linked lists.

> **The Skip List Insight:** Instead of just having one level of linked list, we create multiple levels where higher levels "skip" over more elements, allowing faster traversal.

### Visualizing Skip List Structure

```
Level 3: 1 ----------------> 9
Level 2: 1 -------> 5 -----> 9
Level 1: 1 -> 3 -> 5 -> 7 -> 9
Level 0: 1 -> 3 -> 5 -> 7 -> 9

Search path for 7:
Start at highest level of leftmost node
Move right until next > target, then drop down
```

### Building Skip List from First Principles

```python
import random

class SkipListNode:
    def __init__(self, key, value=None, level=0):
        self.key = key
        self.value = value if value is not None else key
        # Array of forward pointers for each level
        self.forward = [None] * (level + 1)
  
    def __str__(self):
        return f"Key: {self.key}, Levels: {len(self.forward)}"
```

**Understanding the Node Structure:**

* `key`: The value we're storing
* `value`: Associated data
* `forward`: Array of pointers, one for each level the node participates in

> **Key Concept:** Each node participates in multiple levels with probability 1/2 for each higher level. This creates the "highway" effect where higher levels have fewer nodes.

### Core Skip List Operations

```python
class SkipList:
    def __init__(self, max_level=16):
        self.max_level = max_level
        self.level = 0  # Current highest level in use
        # Header node with maximum possible levels
        self.header = SkipListNode(-float('inf'), None, max_level)
  
    def random_level(self):
        """Generate random level for new node"""
        level = 0
        while random.random() < 0.5 and level < self.max_level:
            level += 1
        return level
  
    def search(self, key):
        """Search for a key in the skip list"""
        current = self.header
      
        # Start from highest level and work down
        for i in range(self.level, -1, -1):
            # Move right while next node's key < search key
            while (current.forward[i] and 
                   current.forward[i].key < key):
                current = current.forward[i]
      
        # Move to level 0 and check if we found the key
        current = current.forward[0]
        if current and current.key == key:
            return current.value
        return None
```

**Search Algorithm Explanation:**

1. **Start at top-left** (header node, highest level)
2. **Move right** while next key < target
3. **Drop down one level** when next key ≥ target
4. **Repeat until level 0**
5. **Check final position** for exact match

### Complete Skip List Implementation

```python
def insert(self, key, value=None):
    """Insert key-value pair into skip list"""
    # Array to store update positions for each level
    update = [None] * (self.max_level + 1)
    current = self.header
  
    # Find insertion point, recording update positions
    for i in range(self.level, -1, -1):
        while (current.forward[i] and 
               current.forward[i].key < key):
            current = current.forward[i]
        update[i] = current
  
    current = current.forward[0]
  
    # If key doesn't exist, insert new node
    if not current or current.key != key:
        new_level = self.random_level()
      
        # If new level is higher than current max level
        if new_level > self.level:
            for i in range(self.level + 1, new_level + 1):
                update[i] = self.header
            self.level = new_level
      
        # Create new node
        new_node = SkipListNode(key, value, new_level)
      
        # Update forward pointers
        for i in range(new_level + 1):
            new_node.forward[i] = update[i].forward[i]
            update[i].forward[i] = new_node
    else:
        # Key exists, update value
        current.value = value if value is not None else key
```

**Insertion Process Breakdown:**

1. **Find insertion point** (same as search)
2. **Record update positions** for pointer adjustments
3. **Generate random level** for new node
4. **Update level tracking** if necessary
5. **Create and link new node** at all its levels

## Comparison and Interview Perspectives

### Time Complexity Analysis

| Operation | Treap             | Skip List         |
| --------- | ----------------- | ----------------- |
| Search    | O(log n) expected | O(log n) expected |
| Insert    | O(log n) expected | O(log n) expected |
| Delete    | O(log n) expected | O(log n) expected |
| Space     | O(n)              | O(n) expected     |

> **Important Note:** Both structures provide probabilistic guarantees. The "expected" time complexity assumes random inputs or good randomization.

### When to Use Which?

**Choose Treap when:**

* You need range queries (easy in-order traversal)
* Memory usage must be predictable (exactly n nodes)
* You're comfortable with tree rotations

**Choose Skip List when:**

* Implementation simplicity is important
* You need concurrent access (easier to lock individual levels)
* Forward-only traversal is sufficient

### Common FAANG Interview Questions

**Question 1:** "Design a data structure that supports fast insertion, deletion, and finding the k-th smallest element."

```python
class TreapWithRank:
    """Treap extended to support order statistics"""
  
    def __init__(self):
        self.root = None
  
    def get_size(self, node):
        """Get subtree size (number of nodes)"""
        return node.size if node else 0
  
    def update_size(self, node):
        """Update size after structural changes"""
        if node:
            node.size = 1 + self.get_size(node.left) + self.get_size(node.right)
  
    def find_kth(self, k):
        """Find k-th smallest element (1-indexed)"""
        return self._find_kth(self.root, k)
  
    def _find_kth(self, root, k):
        if not root:
            return None
      
        left_size = self.get_size(root.left)
      
        if k <= left_size:
            return self._find_kth(root.left, k)
        elif k == left_size + 1:
            return root.key
        else:
            return self._find_kth(root.right, k - left_size - 1)
```

**This extension demonstrates:**

* How to augment basic structures for additional functionality
* The power of maintaining subtree information
* O(log n) order statistics queries

> **Interview Tip:** Always discuss trade-offs. Mention that while these structures are elegant, simpler alternatives like balanced trees or even sorted arrays might be better depending on the specific use case and constraints.

### Implementation Strategy for Interviews

**For Treap:**

1. Start with basic BST structure
2. Add priority field and explain randomization
3. Implement rotations with clear explanations
4. Show insertion maintaining both properties

**For Skip List:**

1. Explain the multi-level concept first
2. Implement search algorithm clearly
3. Show probabilistic level generation
4. Demonstrate insertion with update tracking

Both structures showcase advanced algorithmic thinking and are excellent talking points about probabilistic algorithms, which are increasingly important in modern systems design.

The key to success with these topics in interviews is not just knowing the implementation, but understanding **why** they work, **when** to use them, and **how** they compare to simpler alternatives.
