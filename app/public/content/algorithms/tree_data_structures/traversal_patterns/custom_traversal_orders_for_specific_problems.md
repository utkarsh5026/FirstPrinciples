# Custom Traversal Orders in Binary Trees: From First Principles to FAANG Mastery

## Understanding Traversal at Its Core

Before diving into custom traversals, let's establish what "traversal" fundamentally means in computer science.

> **First Principle** : Traversal is the systematic process of visiting every node in a data structure exactly once, following a specific order or pattern.

In binary trees, traversal is like having a map of a building and deciding the route you'll take to visit every room. The "order" determines which room (node) you visit next.

### The Foundation: Why Do We Need Different Orders?

Consider this simple binary tree:

```
    1
   / \
  2   3
 / \
4   5
```

**Standard traversals give us these sequences:**

* **Inorder** : 4, 2, 5, 1, 3 (Left → Root → Right)
* **Preorder** : 1, 2, 4, 5, 3 (Root → Left → Right)
* **Postorder** : 4, 5, 2, 3, 1 (Left → Right → Root)
* **Level-order** : 1, 2, 3, 4, 5 (Top to bottom, left to right)

But what if your problem requires:

* **Right-to-left level order** : 1, 3, 2, 5, 4
* **Zigzag pattern** : 1, 3, 2, 4, 5
* **Boundary nodes only** : 1, 2, 4, 5, 3

> **Key Insight** : Custom traversals emerge when standard patterns don't match the problem's requirements. FAANG interviews test your ability to modify these fundamental patterns creatively.

## The Anatomy of Custom Traversals

### 1. **Zigzag (Level Order) Traversal**

This is one of the most common custom traversals in FAANG interviews.

 **Problem** : Traverse tree level by level, but alternate direction each level.

```
Example Tree:
      3
     / \
    9   20
       /  \
      15   7

Expected Output: [3], [20, 9], [15, 7]
```

**First Principles Approach:**

The core insight is that we need level-order traversal but with direction reversal. This requires:

1. Level-by-level processing (BFS foundation)
2. Direction tracking mechanism
3. Efficient reversal strategy

```python
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def zigzag_traversal(root):
    if not root:
        return []
  
    result = []
    queue = deque([root])
    left_to_right = True  # Direction flag
  
    while queue:
        level_size = len(queue)
        current_level = []
      
        # Process all nodes at current level
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
          
            # Add children for next level
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
      
        # Apply direction: reverse if going right-to-left
        if not left_to_right:
            current_level.reverse()
      
        result.append(current_level)
        left_to_right = not left_to_right  # Toggle direction
  
    return result
```

**Detailed Code Explanation:**

1. **`queue = deque([root])`** : We use a deque for O(1) append/pop operations
2. **`left_to_right = True`** : Boolean flag tracks current direction
3. **`level_size = len(queue)`** : Captures current level size before processing
4. **Level processing loop** : Processes exactly `level_size` nodes (current level)
5. **Direction application** : We reverse the collected level if going right-to-left
6. **Direction toggle** : `left_to_right = not left_to_right` flips direction for next level

> **Time Complexity** : O(n) where n is number of nodes
>
> **Space Complexity** : O(w) where w is maximum width of tree

### 2. **Boundary Traversal**

 **Problem** : Traverse only the boundary nodes of the tree (like drawing the outline).

```
Example Tree:
        1
       / \
      2   3
     / \   \
    4   5   6
           / \
          7   8

Boundary: [1, 2, 4, 7, 8, 6, 3]
```

**First Principles Breakdown:**

The boundary consists of three parts:

1. **Left boundary** (excluding leaves): Path from root going left
2. **Leaves** : All leaf nodes from left to right
3. **Right boundary** (excluding leaves, in reverse): Path from root going right

```python
def boundary_traversal(root):
    if not root:
        return []
  
    if not root.left and not root.right:
        return [root.val]  # Single node case
  
    result = [root.val]  # Always include root
  
    # Helper function to get left boundary
    def get_left_boundary(node):
        if not node or (not node.left and not node.right):
            return  # Skip leaves and null nodes
      
        result.append(node.val)
      
        # Prefer left child, fallback to right
        if node.left:
            get_left_boundary(node.left)
        else:
            get_left_boundary(node.right)
  
    # Helper function to get all leaves
    def get_leaves(node):
        if not node:
            return
      
        # If it's a leaf, add it
        if not node.left and not node.right:
            result.append(node.val)
            return
      
        # Recurse on children
        get_leaves(node.left)
        get_leaves(node.right)
  
    # Helper function to get right boundary (in reverse)
    def get_right_boundary(node):
        if not node or (not node.left and not node.right):
            return  # Skip leaves and null nodes
      
        # Prefer right child, fallback to left
        if node.right:
            get_right_boundary(node.right)
        else:
            get_right_boundary(node.left)
      
        result.append(node.val)  # Add after recursion (reverse order)
  
    # Execute the three phases
    get_left_boundary(root.left)   # Left boundary (exclude root)
    get_leaves(root)               # All leaves
    get_right_boundary(root.right) # Right boundary (exclude root)
  
    return result
```

**Detailed Explanation:**

1. **Left Boundary Function** :

* Starts from root's left child
* Always prefers going left, falls back to right only if no left child
* Stops at leaves (they'll be handled separately)

1. **Leaves Function** :

* Uses inorder-like traversal to visit leaves left-to-right
* Checks `not node.left and not node.right` for leaf condition

1. **Right Boundary Function** :

* Starts from root's right child
* Uses **post-order** style (recurse first, then add) to get reverse order
* Prefers going right, falls back to left

> **Critical Insight** : The order of operations matters! Left boundary → Leaves → Right boundary ensures no duplicates and correct sequence.

### 3. **Vertical Order Traversal**

 **Problem** : Group nodes by their horizontal distance from root.

```
Example Tree:
       3
      / \
     9   8
    / \   \
   4   0   1
          / \
         5   2

Vertical Groups:
Column -2: [4]
Column -1: [9]
Column 0:  [3, 0, 5]
Column 1:  [8, 1]
Column 2:  [2]
```

**First Principles Approach:**

Each node has a "column" position relative to root (which is at column 0):

* Going left decreases column by 1
* Going right increases column by 1

```python
from collections import defaultdict, deque

def vertical_traversal(root):
    if not root:
        return []
  
    # Dictionary to store nodes by column
    column_map = defaultdict(list)
  
    # Queue stores (node, row, column)
    queue = deque([(root, 0, 0)])
  
    while queue:
        node, row, col = queue.popleft()
      
        # Store node with its position info
        column_map[col].append((row, node.val))
      
        # Add children with updated positions
        if node.left:
            queue.append((node.left, row + 1, col - 1))
        if node.right:
            queue.append((node.right, row + 1, col + 1))
  
    # Sort columns and prepare result
    result = []
    for col in sorted(column_map.keys()):
        # Sort by row, then by value for same row
        column_nodes = sorted(column_map[col])
        result.append([val for row, val in column_nodes])
  
    return result
```

**Code Breakdown:**

1. **Position Tracking** : Each node carries `(row, column)` coordinates
2. **Column Mapping** : `defaultdict(list)` groups nodes by column efficiently
3. **BFS with Coordinates** : Level-order ensures we process top-to-bottom
4. **Sorting Strategy** :

* Sort columns by their number
* Within each column, sort by row (top-to-bottom)
* For same position, sort by value

### 4. **Morris Traversal Variations**

 **Problem** : Traverse tree with O(1) extra space (no recursion stack or explicit stack).

> **Fundamental Principle** : Morris traversal uses the tree's structure itself for navigation by creating temporary links.

 **Core Concept** : Create temporary "threads" from inorder predecessor to current node, allowing us to return after processing left subtree.

```python
def morris_inorder(root):
    result = []
    current = root
  
    while current:
        if not current.left:
            # No left subtree, process current and go right
            result.append(current.val)
            current = current.right
        else:
            # Find inorder predecessor
            predecessor = current.left
          
            # Go to rightmost node in left subtree
            while predecessor.right and predecessor.right != current:
                predecessor = predecessor.right
          
            if not predecessor.right:
                # Create thread: predecessor -> current
                predecessor.right = current
                current = current.left
            else:
                # Thread exists, remove it and process current
                predecessor.right = None
                result.append(current.val)
                current = current.right
  
    return result
```

**Step-by-Step Morris Process:**

1. **No Left Child** : Process current node, move right
2. **Has Left Child** : Find inorder predecessor (rightmost in left subtree)
3. **No Thread** : Create thread from predecessor to current, go left
4. **Thread Exists** : Remove thread, process current, go right

**Visualization for Tree [1,2,3,4,5]:**

```
Initial:     After Threading:    After Processing:
    1            1                    1
   / \          / \                  / \
  2   3        2   3                2   3
 / \          / \                  / \
4   5        4   5                4   5
             \                  
              1 (thread)         
```

## Problem-Solving Framework for Custom Traversals

### **Step 1: Identify the Pattern**

> **Ask yourself** : What makes this traversal "custom"? Is it the order, the grouping, or the filtering criteria?

**Common Patterns:**

* **Direction changes** : Zigzag, spiral
* **Positional grouping** : Vertical, diagonal
* **Conditional inclusion** : Boundary, even levels only
* **Space optimization** : Morris-style modifications

### **Step 2: Choose Your Foundation**

| Base Technique            | Best For                | Space | Time |
| ------------------------- | ----------------------- | ----- | ---- |
| **BFS (Queue)**     | Level-based patterns    | O(w)  | O(n) |
| **DFS (Recursion)** | Path-based patterns     | O(h)  | O(n) |
| **Morris**          | Space-critical problems | O(1)  | O(n) |

### **Step 3: Add Custom Logic**

**Template for Custom BFS:**

```python
def custom_bfs_traversal(root):
    if not root:
        return []
  
    queue = deque([root])
    result = []
  
    # Custom state variables
    level = 0
    direction = True
  
    while queue:
        level_size = len(queue)
        current_level = []
      
        for _ in range(level_size):
            node = queue.popleft()
          
            # Custom processing logic here
            if meets_custom_condition(node, level):
                current_level.append(process_node(node))
          
            # Add children
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
      
        # Custom level processing
        result.append(apply_custom_transform(current_level, level))
        level += 1
  
    return result
```

## Advanced Custom Traversal: Diagonal Traversal

Let's solve a complex problem that combines multiple concepts:

 **Problem** : Print diagonal elements of binary tree. Elements in same diagonal have same (row - col) value.

```
Example Tree:
       8
      / \
     3   10
    / \    \
   1   6    14
      / \   /
     4   7 13

Diagonals:
Diagonal 0: [8, 10, 14]
Diagonal 1: [3, 6, 7, 13] 
Diagonal 2: [1, 4]
```

**Solution with Detailed Explanation:**

```python
from collections import defaultdict, deque

def diagonal_traversal(root):
    if not root:
        return []
  
    # Map: diagonal_index -> list of nodes
    diagonal_map = defaultdict(list)
  
    # Queue: (node, diagonal_index)
    # Diagonal index = row - col
    queue = deque([(root, 0)])
  
    while queue:
        node, diag = queue.popleft()
        diagonal_map[diag].append(node.val)
      
        # Left child: row+1, col-1 -> diag increases by 2
        if node.left:
            queue.append((node.left, diag + 1))
      
        # Right child: row+1, col+1 -> diag stays same  
        if node.right:
            queue.append((node.right, diag))
  
    # Extract diagonals in order
    result = []
    for diag_idx in sorted(diagonal_map.keys()):
        result.append(diagonal_map[diag_idx])
  
    return result
```

**Key Insights:**

1. **Diagonal Formula** : `diagonal_index = row - col`
2. **Movement Rules** :

* Left child: `diag + 1` (row increases, col decreases)
* Right child: `diag + 0` (row increases, col increases - net zero)

1. **BFS ensures** top-to-bottom order within each diagonal

> **FAANG Interview Tip** : Always explain your coordinate system and movement rules clearly. Draw a small example to verify your logic.

## Common Mistakes and How to Avoid Them

### **Mistake 1: Not Handling Edge Cases**

```python
# ❌ Wrong: Doesn't handle single node
def boundary_traversal(root):
    result = [root.val]  # What if root is None?
    # ... rest of code

# ✅ Correct: Handle all edge cases  
def boundary_traversal(root):
    if not root:
        return []
    if not root.left and not root.right:
        return [root.val]  # Single node
    # ... rest of code
```

### **Mistake 2: Direction Logic Errors**

```python
# ❌ Wrong: Inconsistent direction tracking
for level in range(levels):
    if level % 2 == 1:  # This might not match your initial direction
        current_level.reverse()

# ✅ Correct: Use explicit boolean flag
left_to_right = True
while queue:
    # ... process level
    if not left_to_right:
        current_level.reverse()
    left_to_right = not left_to_right
```

### **Mistake 3: Morris Traversal Thread Management**

```python
# ❌ Wrong: Forgetting to remove threads
if predecessor.right == current:
    result.append(current.val)  # Missing: predecessor.right = None
    current = current.right

# ✅ Correct: Always clean up threads
if predecessor.right == current:
    predecessor.right = None  # Remove thread
    result.append(current.val)
    current = current.right
```

## Practice Problems for Mastery

> **Progressive Difficulty** : Start with these problems to build your custom traversal intuition.

### **Level 1: Foundation**

1. **Right View of Binary Tree** : What's the rightmost node at each level?
2. **Left View of Binary Tree** : What's the leftmost node at each level?
3. **Bottom View of Binary Tree** : What nodes are visible from bottom?

### **Level 2: Intermediate**

1. **Spiral Level Order** : Clockwise spiral traversal
2. **Reverse Level Order** : Bottom-up level traversal
3. **Even-Odd Level Traversal** : Different processing for even/odd levels

### **Level 3: Advanced**

1. **Anti-Clockwise Spiral** : Counter-clockwise boundary traversal
2. **K-Distance Nodes** : All nodes exactly K distance from target
3. **Time-Based Infection** : Simulate infection spread with timing

## Final Thoughts: The FAANG Mindset

> **Remember** : Custom traversals test your ability to break down complex requirements into fundamental operations. The key is recognizing which standard traversal to modify and how.

**Interview Strategy:**

1. **Draw the example** : Visualize the expected output
2. **Identify the pattern** : What makes it different from standard traversals?
3. **Choose your base** : BFS, DFS, or Morris?
4. **Code incrementally** : Start with standard traversal, add custom logic
5. **Test edge cases** : Empty tree, single node, unbalanced trees

**Time Management Tips:**

* Spend 2-3 minutes understanding the problem deeply
* Start coding only after you're clear about the approach
* Test with the given example before submitting
* Discuss optimizations only after basic solution works

Custom traversals showcase your problem-solving depth - the ability to take fundamental algorithms and adapt them creatively to solve novel problems. Master these patterns, and you'll handle any tree traversal challenge FAANG interviews can present!
