# Self-Balancing Trees: AVL Trees and Rotations in FAANG Interviews

## The Foundation: Understanding the Problem

Let's start from the very beginning - why do we even need self-balancing trees?

### Binary Search Trees: The Starting Point

A **Binary Search Tree (BST)** is a fundamental data structure where:

* Each node has at most two children
* Left child's value < Parent's value < Right child's value
* This property holds for every node in the tree

```python
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None
        self.height = 1  # We'll use this for AVL trees
```

**Why BSTs are powerful:** They allow us to search, insert, and delete in O(log n) time in the  **best case** .

### The Critical Problem: Degeneration

> **Key Insight:** The "best case" scenario rarely happens in real-world data!

Consider inserting values `[1, 2, 3, 4, 5]` into a BST:

```
Insertion sequence: 1 → 2 → 3 → 4 → 5

Result:
    1
     \
      2
       \
        3
         \
          4
           \
            5
```

**This becomes a linked list!** Our O(log n) operations become O(n).

> **The Core Problem:** Regular BSTs don't maintain balance automatically, leading to worst-case linear time complexity.

## Understanding Balance: The Heart of Efficiency

### What is "Balance" in Trees?

**Balance** refers to how evenly distributed the nodes are across the tree's structure.

**Perfectly Balanced Tree:**

```
      4
    /   \
   2     6
  / \   / \
 1   3 5   7
```

Height = 3, All operations = O(log n)

**Unbalanced Tree:**

```
1
 \
  2
   \
    3
     \
      4
```

Height = 4, Operations degrade to O(n)

### The Balance Factor: Measuring Balance

> **Balance Factor (BF) = Height of Left Subtree - Height of Right Subtree**

For any node in an AVL tree:

* BF ∈ {-1, 0, 1} ← **This is the AVL property!**
* If |BF| > 1, the tree is unbalanced and needs fixing

## AVL Trees: Self-Balancing Perfection

### What Makes AVL Special?

**AVL (Adelson-Velsky and Landis) trees** are BSTs that automatically maintain balance through  **rotations** .

> **AVL Guarantee:** The height difference between left and right subtrees of any node is at most 1.

This simple constraint ensures:

* **Search time:** Always O(log n)
* **Insertion time:** O(log n)
* **Deletion time:** O(log n)
* **Space complexity:** O(n)

### Height Calculation in AVL Trees

```python
def get_height(node):
    """
    Get the height of a node.
    Height of None (empty subtree) is 0.
    Height of leaf node is 1.
    """
    if not node:
        return 0
    return node.height

def update_height(node):
    """
    Update the height of a node based on its children.
    Height = 1 + max(left_height, right_height)
    """
    if not node:
        return
  
    left_height = get_height(node.left)
    right_height = get_height(node.right)
    node.height = 1 + max(left_height, right_height)
```

**Example height calculation:**

```
      4 (height=3)
    /   \
   2(2)  6(2)
  / \   / \
 1(1) 3(1) 5(1) 7(1)
```

### Balance Factor Implementation

```python
def get_balance_factor(node):
    """
    Calculate balance factor for a node.
    BF = height(left) - height(right)
    """
    if not node:
        return 0
  
    left_height = get_height(node.left)
    right_height = get_height(node.right)
    return left_height - right_height
```

## The Magic of Rotations: Restoring Balance

When an insertion or deletion makes the tree unbalanced (|BF| > 1), we use **rotations** to restore balance.

### The Four Rotation Cases

There are exactly **four scenarios** that can cause imbalance:

1. **Left-Left (LL)** → Right Rotation
2. **Right-Right (RR)** → Left Rotation
3. **Left-Right (LR)** → Left-Right Rotation
4. **Right-Left (RL)** → Right-Left Rotation

### Case 1: Left-Left (LL) - Right Rotation

**When does this happen?**

* BF of current node > 1 (left-heavy)
* BF of left child ≥ 0 (left subtree of left child is taller)

**Example before rotation:**

```
    30 (BF=2)
   /
  20 (BF=1)  
 /
10
```

**Right rotation process:**

```python
def right_rotate(y):
    """
    Perform right rotation on node y.
  
    Before:     After:
        y         x
       /         / \
      x         T1  y
     / \           / \
    T1  T2        T2  T3
  
    """
    # Store the left child
    x = y.left
  
    # Store the right subtree of x (T2)
    T2 = x.right
  
    # Perform rotation
    x.right = y    # x becomes the new root
    y.left = T2    # T2 becomes left child of y
  
    # Update heights (order matters!)
    update_height(y)  # Update y first
    update_height(x)  # Then update x
  
    # Return the new root
    return x
```

**After right rotation:**

```
   20 (BF=0)
  /  \
 10   30
```

> **Key Insight:** The rotation maintains BST property while reducing height!

### Case 2: Right-Right (RR) - Left Rotation

**When does this happen?**

* BF of current node < -1 (right-heavy)
* BF of right child ≤ 0 (right subtree of right child is taller)

```python
def left_rotate(x):
    """
    Perform left rotation on node x.
  
    Before:     After:
        x           y
         \         / \
          y       x   T3
         / \     / \
        T2  T3  T1  T2
    """
    # Store the right child
    y = x.right
  
    # Store the left subtree of y (T2)
    T2 = y.left
  
    # Perform rotation
    y.left = x     # y becomes the new root
    x.right = T2   # T2 becomes right child of x
  
    # Update heights
    update_height(x)
    update_height(y)
  
    return y
```

### Case 3: Left-Right (LR) - Double Rotation

**When does this happen?**

* BF of current node > 1 (left-heavy)
* BF of left child < 0 (right subtree of left child is taller)

**This requires TWO rotations:**

```python
def left_right_rotate(node):
    """
    Perform left-right rotation.
    1. Left rotate the left child
    2. Right rotate the current node
    """
    # First: left rotation on left child
    node.left = left_rotate(node.left)
  
    # Second: right rotation on current node
    return right_rotate(node)
```

**Example:**

```
Before:          After step 1:       After step 2:
   30 (BF=2)        30 (BF=2)           20
  /                /                   /  \
 10 (BF=-1)       20 (BF=1)           10   30
  \              /
   20           10
```

### Case 4: Right-Left (RL) - Double Rotation

```python
def right_left_rotate(node):
    """
    Perform right-left rotation.
    1. Right rotate the right child
    2. Left rotate the current node
    """
    # First: right rotation on right child
    node.right = right_rotate(node.right)
  
    # Second: left rotation on current node
    return left_rotate(node)
```

## Complete AVL Tree Implementation

Now let's put it all together:

```python
class AVLTree:
    def __init__(self):
        self.root = None
  
    def insert(self, val):
        """Public method to insert a value."""
        self.root = self._insert(self.root, val)
  
    def _insert(self, node, val):
        """
        Private recursive method to insert and balance.
        Returns the new root of the subtree.
        """
        # Step 1: Perform normal BST insertion
        if not node:
            return TreeNode(val)
      
        if val < node.val:
            node.left = self._insert(node.left, val)
        elif val > node.val:
            node.right = self._insert(node.right, val)
        else:
            # Duplicate values not allowed
            return node
      
        # Step 2: Update height of current node
        update_height(node)
      
        # Step 3: Get balance factor
        balance = get_balance_factor(node)
      
        # Step 4: Check for imbalance and fix with rotations
      
        # Left-Left case
        if balance > 1 and val < node.left.val:
            return right_rotate(node)
      
        # Right-Right case
        if balance < -1 and val > node.right.val:
            return left_rotate(node)
      
        # Left-Right case
        if balance > 1 and val > node.left.val:
            return left_right_rotate(node)
      
        # Right-Left case
        if balance < -1 and val < node.right.val:
            return right_left_rotate(node)
      
        # No imbalance, return unchanged node
        return node
```

## FAANG Interview Perspective

### Why AVL Trees Matter in Interviews

> **FAANG companies love AVL trees because they test multiple concepts simultaneously:**
>
> * Recursion and tree traversal
> * Algorithm optimization
> * Space-time complexity analysis
> * Code organization and clean implementation

### Common Interview Questions

**1. "Implement an AVL tree with insertion"**

* Focus on the rotation logic
* Explain why each rotation type is needed
* Discuss time complexity: O(log n) for all operations

**2. "What's the difference between AVL and Red-Black trees?"**

* AVL: Stricter balancing (height difference ≤ 1)
* Red-Black: Looser balancing but simpler rotations
* AVL: Better for search-heavy applications
* Red-Black: Better for insert/delete-heavy applications

**3. "Implement deletion in AVL tree"**

```python
def delete(self, val):
    """Delete a value from AVL tree."""
    self.root = self._delete(self.root, val)

def _delete(self, node, val):
    # Step 1: Perform standard BST deletion
    if not node:
        return node
  
    if val < node.val:
        node.left = self._delete(node.left, val)
    elif val > node.val:
        node.right = self._delete(node.right, val)
    else:
        # Node to delete found
        if not node.left:
            return node.right
        elif not node.right:
            return node.left
      
        # Node has two children: find inorder successor
        temp = self._find_min(node.right)
        node.val = temp.val
        node.right = self._delete(node.right, temp.val)
  
    # Step 2: Update height and rebalance (same as insertion)
    update_height(node)
    balance = get_balance_factor(node)
  
    # Rebalancing logic (same 4 cases as insertion)
    if balance > 1 and get_balance_factor(node.left) >= 0:
        return right_rotate(node)
    # ... (other cases)
  
    return node
```

### Interview Tips

> **Pro Tip 1:** Always explain your approach before coding. Mention the four rotation cases upfront.

> **Pro Tip 2:** Start with the balance factor calculation - it's the foundation of everything else.

> **Pro Tip 3:** Draw diagrams during the interview. Visual explanations score major points.

### Time and Space Complexity Summary

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Search    | O(log n)        | O(1)             |
| Insert    | O(log n)        | O(log n)*        |
| Delete    | O(log n)        | O(log n)*        |
| Traversal | O(n)            | O(log n)*        |

*Due to recursion stack

### Real-World Applications

> **Where AVL trees shine:**
>
> * Database indexing systems
> * Memory management in operating systems
> * Autocomplete features in search engines
> * Any scenario requiring guaranteed O(log n) operations

## Practice Problems for FAANG Prep

**Easy:**

1. Check if a binary tree is an AVL tree
2. Find the height of an AVL tree
3. Count nodes in an AVL tree

**Medium:**

1. Convert a sorted array to an AVL tree
2. Find the kth smallest element in an AVL tree
3. Merge two AVL trees

**Hard:**

1. Implement a complete AVL tree with insert, delete, and search
2. Range query on AVL tree (find all elements in range [a, b])
3. Serialize and deserialize an AVL tree

> **Final Insight:** AVL trees represent the perfect balance between theoretical elegance and practical efficiency. Master them, and you'll have a powerful tool for any tree-related interview question!

The beauty of AVL trees lies not just in their self-balancing property, but in how they demonstrate that with the right invariants and maintenance operations, we can guarantee optimal performance even in the worst-case scenarios.
