# Binary Tree Properties: The Complete Guide for FAANG Interviews

Let me take you through the fundamental properties of binary trees that are absolutely crucial for technical interviews at top tech companies. We'll build everything from the ground up, ensuring you understand not just *what* these properties are, but *why* they matter and *how* to work with them.

## What is a Binary Tree? (First Principles)

Before diving into properties, let's establish what we're working with from the very beginning.

> **Core Definition** : A binary tree is a hierarchical data structure where each node has at most two children, typically called the "left child" and "right child".

Think of it like a family tree, but with a strict rule: each person can have at most two children. Here's the most basic structure:

```
    A
   / \
  B   C
```

In code, a binary tree node is typically represented as:

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val      # The data stored in this node
        self.left = left    # Reference to left child (another TreeNode or None)
        self.right = right  # Reference to right child (another TreeNode or None)
```

**Why this structure?** Each node contains three pieces of information:

* `val`: The actual data we're storing
* `left`: A pointer/reference to the left subtree
* `right`: A pointer/reference to the right subtree

This simple structure gives us incredible flexibility for organizing and searching data efficiently.

## 1. Height of a Binary Tree

### Understanding Height from First Principles

> **Height Definition** : The height of a binary tree is the length of the longest path from the root node to any leaf node, measured in edges (connections between nodes).

Let's break this down step by step:

```
Example Tree:
      1
     / \
    2   3
   / \
  4   5
```

To find the height, we need to:

1. Start at the root (node 1)
2. Find all possible paths to leaf nodes
3. Count the edges in each path
4. Take the maximum

**Paths from root to leaves:**

* Root → 3: path length = 1 edge
* Root → 2 → 4: path length = 2 edges
* Root → 2 → 5: path length = 2 edges

**Therefore, height = 2** (the longest path has 2 edges)

### Height Calculation Algorithm

The recursive approach mirrors our thinking process:

```python
def height(root):
    # Base case: empty tree has height -1
    # (some define empty tree height as 0, but -1 is more common)
    if not root:
        return -1
  
    # Recursive case: height = 1 + max(left_height, right_height)
    left_height = height(root.left)
    right_height = height(root.right)
  
    return 1 + max(left_height, right_height)
```

**Code Explanation:**

* **Base case** : If we reach a null node, we return -1 (no edges)
* **Recursive case** : For any node, its height is 1 (current edge) plus the maximum height of its subtrees
* **The magic** : This naturally explores all paths and finds the longest one

### Why Height Matters in FAANG Interviews

> **Interview Insight** : Height determines the time complexity of many tree operations. In a balanced tree, height ≈ log(n), giving us efficient O(log n) operations. In an unbalanced tree, height can be O(n), making operations linear.

**Common Interview Questions:**

* "What's the time complexity of searching in this tree?"
* "How would you optimize this tree structure?"
* "Is this tree balanced?"

## 2. Depth of a Node

### Understanding Depth from First Principles

> **Depth Definition** : The depth of a specific node is the length of the path from the root to that node, measured in edges.

This is the "opposite" of height - instead of going down from root, we're measuring how far down a specific node is.

```
Example Tree:
      1     <- depth 0 (root)
     / \
    2   3   <- depth 1
   / \
  4   5     <- depth 2
```

 **Key insight** : While a tree has one height, every node has its own depth.

### Depth Calculation Algorithm

```python
def find_depth(root, target, current_depth=0):
    # Base case: node not found
    if not root:
        return -1
  
    # Found the target node
    if root.val == target:
        return current_depth
  
    # Search in left subtree
    left_depth = find_depth(root.left, target, current_depth + 1)
    if left_depth != -1:
        return left_depth
  
    # Search in right subtree
    right_depth = find_depth(root.right, target, current_depth + 1)
    if right_depth != -1:
        return right_depth
  
    # Target not found in either subtree
    return -1
```

**Code Explanation:**

* **Parameter tracking** : We pass `current_depth` to track how deep we are
* **Early termination** : As soon as we find the target, we return its depth
* **Systematic search** : We check left subtree first, then right subtree
* **Not found case** : Return -1 if the target doesn't exist

## 3. Diameter of a Binary Tree

### Understanding Diameter from First Principles

> **Diameter Definition** : The diameter is the length of the longest path between any two nodes in the tree. This path may or may not pass through the root.

This is where it gets interesting! Unlike height (which always starts from root), diameter can be between any two nodes.

```
Example Tree:
      1
     / \
    2   3
   / \
  4   5
 /
6

Possible long paths:
- 6 → 4 → 2 → 5: length = 3 edges
- 6 → 4 → 2 → 1 → 3: length = 4 edges (this is the diameter!)
```

### The Key Insight for Diameter

> **Critical Understanding** : For any node, the longest path through that node is the sum of the heights of its left and right subtrees plus 2 (for the edges connecting to the subtrees).

This leads us to check every node as a potential "center" of the longest path.

### Diameter Calculation Algorithm

```python
def diameter(root):
    def get_height_and_diameter(node):
        # Base case: empty node
        if not node:
            return 0, 0  # (height, diameter)
      
        # Get info from left and right subtrees
        left_height, left_diameter = get_height_and_diameter(node.left)
        right_height, right_diameter = get_height_and_diameter(node.right)
      
        # Height of current node
        current_height = 1 + max(left_height, right_height)
      
        # Diameter through current node
        diameter_through_node = left_height + right_height
      
        # Maximum diameter found so far
        current_diameter = max(
            left_diameter,           # Best diameter in left subtree
            right_diameter,          # Best diameter in right subtree
            diameter_through_node    # Diameter passing through current node
        )
      
        return current_height, current_diameter
  
    _, result = get_height_and_diameter(root)
    return result
```

**Code Explanation:**

* **Dual purpose function** : We calculate both height and diameter in one pass for efficiency
* **Three diameter candidates** : At each node, we consider diameters from left subtree, right subtree, and through current node
* **Optimization** : We compute everything in O(n) time instead of calling height() repeatedly

## 4. Balance of a Binary Tree

### Understanding Balance from First Principles

> **Balance Definition** : A binary tree is balanced if, for every node, the heights of its left and right subtrees differ by at most 1.

This is the AVL tree condition, crucial for maintaining efficient operations.

```
Balanced Example:
      1
     / \
    2   3
   / \
  4   5

Heights: left subtree = 1, right subtree = 0
Difference = |1 - 0| = 1 ≤ 1 ✓ Balanced

Unbalanced Example:
    1
   /
  2
 /
3

Heights: left subtree = 2, right subtree = 0  
Difference = |2 - 0| = 2 > 1 ✗ Not balanced
```

### Balance Check Algorithm

```python
def is_balanced(root):
    def check_balance(node):
        # Base case: empty tree is balanced with height -1
        if not node:
            return True, -1  # (is_balanced, height)
      
        # Check left subtree
        left_balanced, left_height = check_balance(node.left)
        if not left_balanced:
            return False, 0  # Early termination
      
        # Check right subtree
        right_balanced, right_height = check_balance(node.right)
        if not right_balanced:
            return False, 0  # Early termination
      
        # Check current node's balance
        height_diff = abs(left_height - right_height)
        current_height = 1 + max(left_height, right_height)
        is_current_balanced = height_diff <= 1
      
        return is_current_balanced, current_height
  
    balanced, _ = check_balance(root)
    return balanced
```

**Code Explanation:**

* **Early termination** : If any subtree is unbalanced, we immediately return false
* **Bottom-up approach** : We check balance from leaves up to root
* **Dual tracking** : We track both balance status and height for efficiency

## FAANG Interview Applications

### Why These Properties Matter

> **Interview Reality** : These properties appear in 80% of tree-related coding questions at top tech companies. Understanding them deeply gives you the foundation to solve complex problems quickly.

**Common Interview Patterns:**

1. **Height-based problems** : "Find the minimum depth to reach a leaf"
2. **Depth-based problems** : "Print all nodes at depth k"
3. **Diameter problems** : "Find the longest path in the tree"
4. **Balance problems** : "Check if reorganization is needed"

### Example Interview Question

 **Problem** : "Given a binary tree, return the diameter but only count paths where all nodes have even values."

**Solution approach using our foundations:**

```python
def even_diameter(root):
    def helper(node):
        if not node:
            return 0, 0  # (height, diameter)
      
        # Only proceed if current node is even
        if node.val % 2 != 0:
            return 0, 0
      
        left_height, left_diameter = helper(node.left)
        right_height, right_diameter = helper(node.right)
      
        current_height = 1 + max(left_height, right_height)
        diameter_through_node = left_height + right_height
      
        current_diameter = max(left_diameter, right_diameter, diameter_through_node)
      
        return current_height, current_diameter
  
    _, result = helper(root)
    return result
```

This builds directly on our diameter algorithm, showing how mastering the fundamentals lets you adapt to variations quickly.

> **Key Takeaway** : Master these four properties completely, and you'll have the foundation to tackle any tree problem thrown at you in a FAANG interview. The patterns repeat, but the applications vary endlessly.

Understanding these properties from first principles means you're not just memorizing solutions—you're building the fundamental thinking tools that will serve you across any tree-related challenge.
