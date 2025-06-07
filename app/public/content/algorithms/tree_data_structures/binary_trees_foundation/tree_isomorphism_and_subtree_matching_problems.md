# Tree Isomorphism and Subtree Matching: A Complete Guide for FAANG Interviews

## Understanding the Foundation: What Are Trees?

Before diving into isomorphism and subtree matching, let's establish the fundamental building blocks from first principles.

> **Core Concept** : A tree is a hierarchical data structure consisting of nodes connected by edges, where there's exactly one path between any two nodes and no cycles exist.

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

 **What this code does** : We define a basic tree node structure where each node contains:

* `val`: The data stored in the node
* `left`: Reference to the left child node
* `right`: Reference to the right child node

Let's visualize a simple tree:

```
    1
   / \
  2   3
 /   / \
4   5   6
```

This tree has 6 nodes with node 1 as the root, and follows the binary tree property where each node has at most two children.

## Tree Isomorphism: The Core Concept

> **Definition** : Two trees are isomorphic if one can be transformed into the other by swapping the left and right children of any number of nodes.

Think of isomorphism like this: imagine you have two family trees drawn on paper. You can flip any subtree (swap left and right children) as many times as you want. If you can make them look identical after these flips, they're isomorphic.

### Visual Understanding

These two trees are isomorphic:

```
Tree A:        Tree B:
   1              1
  / \            / \
 2   3          3   2
    / \        / \
   4   5      5   4
```

 **Why they're isomorphic** : If we flip the children of node 1 in Tree A, and then flip the children of node 3, we get Tree B.

## First Principles Approach to Tree Isomorphism

Let's build our understanding step by step:

### Approach 1: Brute Force with Recursion

The most intuitive approach is to check all possible combinations:

```python
def is_isomorphic_brute_force(root1, root2):
    # Base case: both trees are empty
    if not root1 and not root2:
        return True
  
    # One tree is empty, the other is not
    if not root1 or not root2:
        return False
  
    # Values must match for isomorphism
    if root1.val != root2.val:
        return False
  
    # Check two possibilities:
    # 1. No swap needed: left matches left, right matches right
    # 2. Swap needed: left matches right, right matches left
    return ((is_isomorphic_brute_force(root1.left, root2.left) and 
             is_isomorphic_brute_force(root1.right, root2.right)) or
            (is_isomorphic_brute_force(root1.left, root2.right) and 
             is_isomorphic_brute_force(root1.right, root2.left)))
```

 **Code Explanation** :

1. **Base cases** : Handle empty trees - two empty trees are isomorphic
2. **Value check** : Nodes must have the same value to be isomorphic
3. **Recursive exploration** : For each node, we check two scenarios:

* Children align normally (no swap)
* Children are swapped

> **Time Complexity** : O(2^n) in worst case, where n is the number of nodes. This happens because we explore two possibilities at each level.

### Approach 2: Canonical Form (Optimized)

A more efficient approach uses the concept of canonical form - a standardized representation.

```python
def get_canonical_form(root):
    if not root:
        return "null"
  
    # Get canonical forms of left and right subtrees
    left_form = get_canonical_form(root.left)
    right_form = get_canonical_form(root.right)
  
    # Sort to ensure consistent ordering
    # This handles the isomorphism property automatically
    children = sorted([left_form, right_form])
  
    return f"({root.val},{children[0]},{children[1]})"

def is_isomorphic_canonical(root1, root2):
    return get_canonical_form(root1) == get_canonical_form(root2)
```

 **What this approach does** :

1. **Canonical representation** : We create a string representation where children are always in sorted order
2. **Automatic handling** : By sorting children, we automatically handle the swapping aspect of isomorphism
3. **Comparison** : Two trees are isomorphic if their canonical forms are identical

 **Example walkthrough** :
For the tree:

```
  1
 / \
2   3
```

The canonical form would be: `(1,(2,null,null),(3,null,null))`

If we swap children:

```
  1
 / \
3   2
```

The canonical form would still be: `(1,(2,null,null),(3,null,null))` because we sort the children.

> **Time Complexity** : O(n log n) due to sorting at each level
> **Space Complexity** : O(n) for the recursion stack and string storage

## Subtree Matching: The Complete Picture

> **Definition** : Tree S is a subtree of tree T if there exists a node in T such that the subtree rooted at that node is identical to S.

Notice the key difference: subtree matching requires  **exact structure match** , while isomorphism allows swapping.

### Visual Understanding

```
Main Tree T:        Subtree S:
      1                2
     / \              / \
    2   3            4   5
   / \   \
  4   5   6
```

Here, S is a subtree of T because the subtree rooted at node 2 in T is exactly the same as S.

## Building Subtree Matching from First Principles

### Approach 1: Brute Force Traversal

```python
def is_same_tree(p, q):
    # Both trees are empty
    if not p and not q:
        return True
  
    # One is empty, other is not
    if not p or not q:
        return False
  
    # Values don't match
    if p.val != q.val:
        return False
  
    # Recursively check left and right subtrees
    return (is_same_tree(p.left, q.left) and 
            is_same_tree(p.right, q.right))

def is_subtree_brute_force(root, subRoot):
    if not root:
        return False
  
    # Check if current node starts a matching subtree
    if is_same_tree(root, subRoot):
        return True
  
    # Recursively check left and right subtrees
    return (is_subtree_brute_force(root.left, subRoot) or
            is_subtree_brute_force(root.right, subRoot))
```

 **Step-by-step explanation** :

1. **`is_same_tree` function** : Checks if two trees are structurally identical
2. **Base cases** : Handle empty trees appropriately
3. **Recursive strategy** : For each node in the main tree, check if it starts a subtree that matches our target

> **Time Complexity** : O(m × n) where m is the size of main tree and n is the size of subtree
> **Space Complexity** : O(max(m, n)) for recursion stack

### Approach 2: String Serialization

This elegant approach converts trees to strings and uses string matching:

```python
def serialize_tree(root):
    if not root:
        return "#"
  
    # Create unique serialization with delimiters
    return f"^{root.val}#{serialize_tree(root.left)}#{serialize_tree(root.right)}#"

def is_subtree_serialization(root, subRoot):
    # Serialize both trees
    main_serialized = serialize_tree(root)
    sub_serialized = serialize_tree(subRoot)
  
    # Check if subtree's serialization is in main tree's serialization
    return sub_serialized in main_serialized
```

 **Why this works** :

1. **Unique representation** : Each tree gets a unique string representation
2. **Structural preservation** : The serialization preserves the exact tree structure
3. **Substring matching** : If the subtree exists, its serialization will be a substring

 **Example** :

```
Tree:    1
        / \
       2   3
      /
     4

Serialization: "^1#^2#^4###^3##"
```

> **Important** : We use special characters like `^` and `#` as delimiters to avoid false matches. For example, without delimiters, trees with values "12" and "1,2" might be confused.

### Approach 3: Hash-Based Comparison

For even better performance in average cases:

```python
def get_tree_hash(root):
    if not root:
        return 0
  
    # Use polynomial rolling hash
    left_hash = get_tree_hash(root.left)
    right_hash = get_tree_hash(root.right)
  
    # Combine hashes with prime numbers to reduce collisions
    return hash((root.val, left_hash, right_hash))

def is_subtree_hash(root, subRoot):
    if not root and not subRoot:
        return True
    if not root or not subRoot:
        return False
  
    target_hash = get_tree_hash(subRoot)
  
    def dfs(node):
        if not node:
            return False
      
        if get_tree_hash(node) == target_hash:
            # Hash matches, verify with exact comparison
            if is_same_tree(node, subRoot):
                return True
      
        return dfs(node.left) or dfs(node.right)
  
    return dfs(root)
```

 **Why we need exact comparison after hash match** :
Hash collisions can occur, so we verify the match with exact tree comparison when hashes are equal.

## Advanced Patterns for FAANG Interviews

### Pattern 1: Multiple Subtree Matching

```python
def count_subtree_occurrences(root, subRoot):
    if not root:
        return 0
  
    count = 0
  
    # Check current node
    if is_same_tree(root, subRoot):
        count += 1
  
    # Add counts from left and right subtrees
    count += count_subtree_occurrences(root.left, subRoot)
    count += count_subtree_occurrences(root.right, subRoot)
  
    return count
```

### Pattern 2: Isomorphic Subtree Matching

Combining both concepts - find if any subtree is isomorphic to target:

```python
def has_isomorphic_subtree(root, target):
    if not root:
        return False
  
    # Check if current subtree is isomorphic to target
    if is_isomorphic_canonical(root, target):
        return True
  
    # Recursively check children
    return (has_isomorphic_subtree(root.left, target) or
            has_isomorphic_subtree(root.right, target))
```

## Common Interview Variations and Edge Cases

> **Edge Case 1** : Empty trees
>
> * Two empty trees are isomorphic
> * Empty tree is a subtree of any tree
> * Any tree contains empty subtree

> **Edge Case 2** : Single node trees
>
> * Always isomorphic if values match
> * Single node subtree matching is straightforward

> **Edge Case 3** : Duplicate values
>
> * Can create false positives in naive implementations
> * Proper serialization handles this correctly

```python
def handle_duplicates_example():
    """
    Example showing why structure matters with duplicates:
  
    Tree A:  1     Tree B:  1
            /              \
           1                1
  
    These are NOT isomorphic despite same values
    """
    pass
```

## Complexity Analysis Summary

| Algorithm               | Time Complexity | Space Complexity | Best Use Case        |
| ----------------------- | --------------- | ---------------- | -------------------- |
| Brute Force Isomorphism | O(2^n)          | O(n)             | Small trees          |
| Canonical Form          | O(n log n)      | O(n)             | Medium trees         |
| Subtree Brute Force     | O(m × n)       | O(max(m,n))      | General case         |
| Serialization           | O(m + n)        | O(m + n)         | Large trees          |
| Hash-based              | O(m + n) avg    | O(m + n)         | Performance critical |

## Interview Tips and Common Mistakes

> **Tip 1** : Always clarify if the problem asks for isomorphism or exact matching

> **Tip 2** : Handle null nodes explicitly in your base cases

> **Tip 3** : For string serialization, use unique delimiters to avoid false matches

 **Common mistakes to avoid** :

1. Forgetting to handle empty trees
2. Not considering the isomorphic property (swapping allowed)
3. Using insufficient delimiters in serialization
4. Ignoring hash collision possibilities

## Practice Problems for Mastery

1. **LeetCode 572** : Subtree of Another Tree
2. **LeetCode 951** : Flip Equivalent Binary Trees
3. **Custom** : Count all isomorphic subtrees
4. **Custom** : Find the largest isomorphic subtree

> **Final Thought** : These problems test your understanding of tree traversal, recursion, and creative problem-solving. Master the fundamental approaches first, then optimize based on constraints.

The key to excelling in FAANG interviews with these topics is understanding the underlying principles deeply, recognizing patterns, and being able to adapt your approach based on the specific problem constraints and requirements.
