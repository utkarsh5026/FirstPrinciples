# Binary Search Tree Validation and Inorder Operations: A Deep Dive for FAANG Interviews

## Understanding Binary Search Trees from First Principles

Before we dive into validation and successor/predecessor finding, let's build our understanding from the ground up.

> **Core Principle** : A Binary Search Tree is a hierarchical data structure where each node has at most two children, and for every node, all values in the left subtree are smaller, and all values in the right subtree are larger.

### The Fundamental BST Property

```
      8
     / \
    3   10
   / \    \
  1   6    14
     / \   /
    4   7 13
```

Let's examine why this structure is powerful:

**For any node with value X:**

* Every node in the left subtree has value < X
* Every node in the right subtree has value > X
* This property must hold recursively for all nodes

> **Why This Matters** : This property gives us O(log n) average-case search, insert, and delete operations, making BSTs incredibly efficient for dynamic data management.

## BST Validation: The Foundation Problem

### Why Validation is Crucial in Interviews

BST validation tests your understanding of:

1. Tree traversal techniques
2. Constraint propagation
3. Edge case handling
4. Space-time complexity analysis

### Approach 1: Naive (Incorrect) Method

Many candidates initially try this approach:

```python
def validate_bst_naive(root):
    """
    INCORRECT APPROACH - Only checks immediate children
    """
    if not root:
        return True
  
    # Check immediate children only
    if root.left and root.left.val >= root.val:
        return False
    if root.right and root.right.val <= root.val:
        return False
  
    # Recursively check subtrees
    return (validate_bst_naive(root.left) and 
            validate_bst_naive(root.right))
```

**Why this fails:**

```
      10
     /  \
    5    15
        /  \
       6    20
```

This tree would pass the naive check, but node 6 violates the BST property (it's in the right subtree of 10 but is less than 10).

### Approach 2: Range-Based Validation (Optimal)

```python
def validate_bst(root):
    """
    Validates BST using range constraints
    Time: O(n), Space: O(h) where h is height
    """
    def validate_with_bounds(node, min_val, max_val):
        # Base case: empty node is valid
        if not node:
            return True
      
        # Check if current node violates constraints
        if node.val <= min_val or node.val >= max_val:
            return False
      
        # Recursively validate subtrees with updated bounds
        # Left subtree: all values must be < current node's value
        # Right subtree: all values must be > current node's value
        return (validate_with_bounds(node.left, min_val, node.val) and
                validate_with_bounds(node.right, node.val, max_val))
  
    # Start with infinite bounds
    return validate_with_bounds(root, float('-inf'), float('inf'))
```

**How the bounds propagate:**

```
Initial call: validate_with_bounds(8, -∞, +∞)

      8 (-∞, +∞) ✓
     / \
    3   10
   /|   |\
(-∞,8) (8,+∞)
```

**Step-by-step execution:**

1. Node 8: -∞ < 8 < +∞ ✓
2. Node 3: -∞ < 3 < 8 ✓
3. Node 10: 8 < 10 < +∞ ✓

> **Key Insight** : Each recursive call narrows the valid range, ensuring all descendants respect the BST property relative to their ancestors.

### Approach 3: Inorder Traversal Validation

```python
def validate_bst_inorder(root):
    """
    Uses inorder traversal property: BST inorder gives sorted sequence
    Time: O(n), Space: O(h)
    """
    def inorder(node):
        if not node:
            return []
      
        result = []
        result.extend(inorder(node.left))    # Visit left subtree
        result.append(node.val)              # Visit current node
        result.extend(inorder(node.right))   # Visit right subtree
      
        return result
  
    # Get inorder traversal and check if sorted
    values = inorder(root)
  
    # Check if strictly increasing (no duplicates allowed)
    for i in range(1, len(values)):
        if values[i] <= values[i-1]:
            return False
  
    return True
```

**Optimized inorder approach (early termination):**

```python
def validate_bst_inorder_optimized(root):
    """
    Optimized inorder validation with early termination
    """
    def inorder_check(node, prev_val):
        if not node:
            return True, prev_val
      
        # Check left subtree
        is_valid, prev_val = inorder_check(node.left, prev_val)
        if not is_valid:
            return False, prev_val
      
        # Check current node
        if prev_val is not None and node.val <= prev_val:
            return False, prev_val
      
        # Update previous value
        prev_val = node.val
      
        # Check right subtree
        return inorder_check(node.right, prev_val)
  
    is_valid, _ = inorder_check(root, None)
    return is_valid
```

## Understanding Inorder Traversal: The Key to Successors and Predecessors

### What is Inorder Traversal?

> **Definition** : Inorder traversal visits nodes in the order: Left subtree → Current node → Right subtree

For a BST, inorder traversal produces values in  **sorted ascending order** .

```
      8
     / \
    3   10
   / \    \
  1   6    14
     / \   /
    4   7 13

Inorder: 1, 3, 4, 6, 7, 8, 10, 13, 14
```

**Implementation:**

```python
def inorder_traversal(root):
    """
    Performs inorder traversal of BST
    Time: O(n), Space: O(h)
    """
    def inorder(node, result):
        if node:
            inorder(node.left, result)   # Visit left
            result.append(node.val)      # Process current
            inorder(node.right, result)  # Visit right
  
    result = []
    inorder(root, result)
    return result
```

## Finding Inorder Successor

### Definition and Importance

> **Inorder Successor** : The next node in the inorder traversal sequence. In a BST, this is the smallest value greater than the given node's value.

### Case Analysis for Successor Finding

**Case 1: Node has a right subtree**

* Successor is the leftmost node in the right subtree

**Case 2: Node has no right subtree**

* Successor is the lowest ancestor for which the given node is in the left subtree

```
      8
     / \
    3   10
   / \    \
  1   6    14
     / \   /
    4   7 13
```

**Examples:**

* Successor of 3: 4 (leftmost in right subtree)
* Successor of 7: 8 (lowest ancestor where 7 is in left subtree)
* Successor of 14: None (largest element)

### Implementation: Method 1 (With Parent Pointers)

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None, parent=None):
        self.val = val
        self.left = left
        self.right = right
        self.parent = parent

def find_successor_with_parent(node):
    """
    Finds inorder successor using parent pointers
    Time: O(h), Space: O(1)
    """
    if not node:
        return None
  
    # Case 1: Node has right subtree
    if node.right:
        # Find leftmost node in right subtree
        current = node.right
        while current.left:
            current = current.left
        return current
  
    # Case 2: No right subtree - traverse up using parent pointers
    current = node
    parent = node.parent
  
    # Keep going up until we find a node that is a left child
    while parent and current == parent.right:
        current = parent
        parent = parent.parent
  
    return parent
```

**Step-by-step for finding successor of 7:**

```
Step 1: Check if 7 has right subtree → No
Step 2: Go up to parent (6)
Step 3: Is 7 the right child of 6? → Yes
Step 4: Go up to parent (3) 
Step 5: Is 6 the right child of 3? → Yes
Step 6: Go up to parent (8)
Step 7: Is 3 the right child of 8? → No (it's left child)
Step 8: Return 8
```

### Implementation: Method 2 (Without Parent Pointers)

```python
def find_successor_no_parent(root, target_val):
    """
    Finds inorder successor without parent pointers
    Time: O(h), Space: O(1)
    """
    successor = None
    current = root
  
    while current:
        if target_val < current.val:
            # Current node could be successor
            # Go left to find potentially smaller successor
            successor = current
            current = current.left
        else:
            # target_val >= current.val
            # Successor must be in right subtree
            current = current.right
  
    return successor
```

**How this works:**

1. **When we go left** : Current node becomes a potential successor
2. **When we go right** : We're looking for a larger value

**Trace for successor of 7:**

```
current = 8, target = 7
7 < 8 → successor = 8, go left

current = 3, target = 7  
7 ≥ 3 → go right

current = 6, target = 7
7 ≥ 6 → go right

current = 7, target = 7
7 ≥ 7 → go right

current = None
Return successor = 8
```

## Finding Inorder Predecessor

### Definition

> **Inorder Predecessor** : The previous node in the inorder traversal sequence. In a BST, this is the largest value smaller than the given node's value.

### Case Analysis for Predecessor Finding

**Case 1: Node has a left subtree**

* Predecessor is the rightmost node in the left subtree

**Case 2: Node has no left subtree**

* Predecessor is the lowest ancestor for which the given node is in the right subtree

### Implementation: Method 1 (With Parent Pointers)

```python
def find_predecessor_with_parent(node):
    """
    Finds inorder predecessor using parent pointers
    Time: O(h), Space: O(1)
    """
    if not node:
        return None
  
    # Case 1: Node has left subtree
    if node.left:
        # Find rightmost node in left subtree
        current = node.left
        while current.right:
            current = current.right
        return current
  
    # Case 2: No left subtree - traverse up using parent pointers
    current = node
    parent = node.parent
  
    # Keep going up until we find a node that is a right child
    while parent and current == parent.left:
        current = parent
        parent = parent.parent
  
    return parent
```

### Implementation: Method 2 (Without Parent Pointers)

```python
def find_predecessor_no_parent(root, target_val):
    """
    Finds inorder predecessor without parent pointers
    Time: O(h), Space: O(1)
    """
    predecessor = None
    current = root
  
    while current:
        if target_val > current.val:
            # Current node could be predecessor
            # Go right to find potentially larger predecessor
            predecessor = current
            current = current.right
        else:
            # target_val <= current.val
            # Predecessor must be in left subtree
            current = current.left
  
    return predecessor
```

## FAANG Interview Patterns and Advanced Scenarios

### Common Interview Questions

> **Level 1** : Basic BST validation
> **Level 2** : Find successor/predecessor
> **Level 3** : Find kth smallest/largest element
> **Level 4** : BST from preorder/inorder traversals

### Edge Cases That Trip Candidates

```python
def comprehensive_bst_validation(root):
    """
    Handles all edge cases for BST validation
    """
    # Edge case 1: Empty tree
    if not root:
        return True
  
    # Edge case 2: Single node
    if not root.left and not root.right:
        return True
  
    # Edge case 3: Integer overflow bounds
    def validate_with_bounds(node, min_val, max_val):
        if not node:
            return True
      
        # Handle integer overflow
        if (min_val is not None and node.val <= min_val) or \
           (max_val is not None and node.val >= max_val):
            return False
      
        return (validate_with_bounds(node.left, min_val, node.val) and
                validate_with_bounds(node.right, node.val, max_val))
  
    return validate_with_bounds(root, None, None)
```

### Advanced Problem: Kth Smallest Element

```python
def kth_smallest(root, k):
    """
    Finds kth smallest element using inorder traversal
    Time: O(k), Space: O(h)
    """
    def inorder(node):
        if not node or self.count >= k:
            return
      
        inorder(node.left)
      
        self.count += 1
        if self.count == k:
            self.result = node.val
            return
      
        inorder(node.right)
  
    self.count = 0
    self.result = None
    inorder(root)
    return self.result
```

### Interview Optimization Techniques

> **Space Optimization** : Use Morris traversal for O(1) space inorder traversal
> **Time Optimization** : Early termination in validation
> **Code Clarity** : Clear variable names and comments for interview readability

**Morris Traversal for Successor Finding:**

```python
def morris_successor(root, target):
    """
    Finds successor using Morris traversal (O(1) space)
    Time: O(n), Space: O(1)
    """
    current = root
    successor = None
    found_target = False
  
    while current:
        if not current.left:
            # Process current node
            if found_target:
                return current
            if current.val == target:
                found_target = True
            current = current.right
        else:
            # Find inorder predecessor
            predecessor = current.left
            while predecessor.right and predecessor.right != current:
                predecessor = predecessor.right
          
            if not predecessor.right:
                # Create thread
                predecessor.right = current
                current = current.left
            else:
                # Remove thread and process
                predecessor.right = None
                if found_target:
                    return current
                if current.val == target:
                    found_target = True
                current = current.right
  
    return None
```

## Key Takeaways for FAANG Interviews

> **Algorithm Choice** : Range-based validation is preferred for its clarity and efficiency

> **Edge Case Mastery** : Always consider empty trees, single nodes, and integer bounds

> **Code Quality** : Write clean, well-commented code that interviewers can easily follow

> **Complexity Analysis** : Be ready to discuss time and space complexity trade-offs

> **Follow-up Readiness** : Prepare for variations like finding kth element, range queries, or tree modifications

Understanding these concepts deeply will give you a strong foundation for tackling BST problems in technical interviews. The key is not just memorizing the algorithms, but understanding the underlying principles that make them work.
