# Lowest Common Ancestor (LCA) Algorithms: From First Principles

## What is a Lowest Common Ancestor?

Let's start from the very beginning. Imagine you have a family tree where each person has exactly one parent (except the root ancestor). Now, if you pick any two people in this tree, their **Lowest Common Ancestor** is the closest person who is an ancestor to both of them.

> **Key Insight** : The LCA is the deepest node in the tree that has both given nodes as descendants. Think of it as the "meeting point" when you trace upward from both nodes toward the root.

Let's visualize this with a simple tree:

```
        1
       / \
      2   3
     / \   \
    4   5   6
   /       / \
  8       7   9
```

If we want to find LCA(8, 5):

* Path from 8 to root: 8 → 4 → 2 → 1
* Path from 5 to root: 5 → 2 → 1
* **LCA(8, 5) = 2** (the first common node when tracing upward)

## Why LCA Matters in FAANG Interviews

> **Interview Reality** : LCA problems appear frequently because they test your understanding of trees, recursion, preprocessing, and optimization techniques - all crucial skills for system design and algorithmic thinking.

FAANG companies love LCA because it can be solved in multiple ways with different time-space trade-offs, testing your ability to:

1. Think recursively
2. Optimize with preprocessing
3. Handle edge cases
4. Analyze complexity

## Approach 1: Naive Recursive Solution

Let's build our understanding step by step, starting with the most intuitive approach.

### The Core Logic

The fundamental insight is that for any node in the tree, the LCA of two nodes can be:

1. The current node itself (if one target is in left subtree, other in right)
2. Somewhere in the left subtree (if both targets are in left subtree)
3. Somewhere in the right subtree (if both targets are in right subtree)

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def lowestCommonAncestor(root, p, q):
    # Base case: if we hit null or find one of our targets
    if not root or root == p or root == q:
        return root
  
    # Recursively search in left and right subtrees
    left_result = lowestCommonAncestor(root.left, p, q)
    right_result = lowestCommonAncestor(root.right, p, q)
  
    # If we found nodes in both subtrees, current node is LCA
    if left_result and right_result:
        return root
  
    # Otherwise, return whichever subtree had a result
    return left_result if left_result else right_result
```

### Detailed Code Explanation

Let me break down exactly what's happening:

1. **Base Case Logic** : `if not root or root == p or root == q:`

* If we hit a null node, we haven't found anything, return None
* If we found one of our target nodes, return it immediately
* This works because once we find a target, we know it's a potential ancestor

1. **Recursive Exploration** :

```python
   left_result = lowestCommonAncestor(root.left, p, q)
   right_result = lowestCommonAncestor(root.right, p, q)
```

* We search both subtrees completely
* Each recursive call returns either None or a node

1. **Decision Logic** :

* `if left_result and right_result:` means we found one target in each subtree
* This can only happen at the LCA node!
* `return left_result if left_result else right_result` means return whichever subtree found something

### Time & Space Complexity

* **Time** : O(n) - we might visit every node once
* **Space** : O(h) - recursion depth equals tree height

## Approach 2: Parent Pointer Method

Sometimes you'll have parent pointers available, which opens up a different strategy.

> **Core Idea** : If we can trace back to parents, finding LCA becomes like finding the intersection point of two linked lists!

```python
def lowestCommonAncestorWithParents(p, q):
    # First, collect all ancestors of p
    ancestors = set()
    current = p
    while current:
        ancestors.add(current)
        current = current.parent
  
    # Now traverse ancestors of q until we find common one
    current = q
    while current:
        if current in ancestors:
            return current
        current = current.parent
  
    return None  # Should never happen in valid tree
```

### Why This Works

1. **Path to Root** : Every node has exactly one path to the root
2. **Set Lookup** : We store all of p's ancestors in O(1) lookup structure
3. **First Match** : The first ancestor of q that's also an ancestor of p must be the LCA

 **Complexity** :

* Time: O(h) where h is height
* Space: O(h) for the ancestor set

## Approach 3: Binary Lifting (Advanced Preprocessing)

For scenarios with multiple LCA queries, we can preprocess the tree to answer each query in O(log n) time.

> **Advanced Concept** : Binary lifting uses the idea that we can "jump" to ancestors at distances of powers of 2 (1, 2, 4, 8, 16...), allowing us to quickly navigate up the tree.

### Preprocessing Phase

```python
import math

class BinaryLiftingLCA:
    def __init__(self, root, n):
        self.n = n
        self.LOG = int(math.log2(n)) + 1
      
        # parent[i][j] = 2^j-th ancestor of node i
        self.parent = [[-1] * self.LOG for _ in range(n)]
        self.depth = [0] * n
      
        # Build the structure
        self._dfs(root, -1, 0)
        self._preprocess()
  
    def _dfs(self, node, par, d):
        self.parent[node.val][0] = par  # Direct parent
        self.depth[node.val] = d
      
        for child in [node.left, node.right]:
            if child:
                self._dfs(child, node.val, d + 1)
  
    def _preprocess(self):
        # Fill the binary lifting table
        for j in range(1, self.LOG):
            for i in range(self.n):
                if self.parent[i][j-1] != -1:
                    # 2^j ancestor = 2^(j-1) ancestor of 2^(j-1) ancestor
                    self.parent[i][j] = self.parent[self.parent[i][j-1]][j-1]
```

### Query Phase

```python
def lca(self, u, v):
    # Make sure u is deeper than v
    if self.depth[u] < self.depth[v]:
        u, v = v, u
  
    # Bring u to same level as v
    diff = self.depth[u] - self.depth[v]
    for i in range(self.LOG):
        if (diff >> i) & 1:  # If i-th bit is set
            u = self.parent[u][i]
  
    # If they're the same node now, that's our LCA
    if u == v:
        return u
  
    # Binary search for LCA
    for i in range(self.LOG - 1, -1, -1):
        if self.parent[u][i] != self.parent[v][i]:
            u = self.parent[u][i]
            v = self.parent[v][i]
  
    return self.parent[u][0]
```

### Understanding Binary Lifting

The magic happens in these key steps:

1. **Power-of-2 Jumps** : `parent[i][j]` stores the 2^j-th ancestor
2. **Level Equalization** : We use bit manipulation to bring nodes to same depth
3. **Binary Search** : We find the highest point where paths are still separate

## Approach 4: Euler Tour + Range Minimum Query

This is the most sophisticated approach, converting the LCA problem into a Range Minimum Query problem.

> **Transformation Insight** : We can convert any tree into a sequence where LCA queries become "find minimum depth in range" queries.

### Step 1: Euler Tour

```python
def euler_tour(root):
    tour = []
    depths = []
    first_occurrence = {}
  
    def dfs(node, depth):
        if not node:
            return
      
        # Record first occurrence
        if node.val not in first_occurrence:
            first_occurrence[node.val] = len(tour)
      
        tour.append(node.val)
        depths.append(depth)
      
        # Visit left child
        if node.left:
            dfs(node.left, depth + 1)
            tour.append(node.val)  # Return to current
            depths.append(depth)
      
        # Visit right child
        if node.right:
            dfs(node.right, depth + 1)
            tour.append(node.val)  # Return to current
            depths.append(depth)
  
    dfs(root, 0)
    return tour, depths, first_occurrence
```

### Step 2: Range Minimum Query

```python
class SparseTable:
    def __init__(self, arr):
        n = len(arr)
        k = int(math.log2(n)) + 1
        self.st = [[0] * k for _ in range(n)]
        self.arr = arr
      
        # Initialize for length 1
        for i in range(n):
            self.st[i][0] = i
      
        # Build sparse table
        j = 1
        while (1 << j) <= n:
            i = 0
            while (i + (1 << j) - 1) < n:
                left = self.st[i][j-1]
                right = self.st[i + (1 << (j-1))][j-1]
              
                if arr[left] <= arr[right]:
                    self.st[i][j] = left
                else:
                    self.st[i][j] = right
                i += 1
            j += 1
  
    def query(self, left, right):
        j = int(math.log2(right - left + 1))
        left_min = self.st[left][j]
        right_min = self.st[right - (1 << j) + 1][j]
      
        if self.arr[left_min] <= self.arr[right_min]:
            return left_min
        return right_min
```

## When to Use Which Approach?

> **Decision Framework** : Choose your approach based on the constraints and query patterns:

| Approach        | Best When                      | Time     | Space      | Preprocessing |
| --------------- | ------------------------------ | -------- | ---------- | ------------- |
| Naive Recursive | Single queries, simple trees   | O(n)     | O(h)       | None          |
| Parent Pointers | Parent links available         | O(h)     | O(h)       | None          |
| Binary Lifting  | Multiple queries, medium trees | O(log n) | O(n log n) | O(n log n)    |
| Euler + RMQ     | Many queries, large trees      | O(1)     | O(n)       | O(n log n)    |

## Common Interview Variations

### 1. LCA in Binary Search Tree

```python
def lcaInBST(root, p, q):
    # Ensure p <= q for easier logic
    if p.val > q.val:
        p, q = q, p
  
    current = root
    while current:
        if current.val > q.val:
            # Both nodes are in left subtree
            current = current.left
        elif current.val < p.val:
            # Both nodes are in right subtree
            current = current.right
        else:
            # Current node is between p and q, so it's LCA
            return current
```

 **Why This Works** : In BST, if a node's value is between two target values, it must be their LCA because of the ordering property.

### 2. LCA with Node Values (No Direct References)

```python
def lcaWithValues(root, p_val, q_val):
    def helper(node):
        if not node:
            return None
      
        if node.val == p_val or node.val == q_val:
            return node
      
        left = helper(node.left)
        right = helper(node.right)
      
        if left and right:
            return node
      
        return left or right
  
    return helper(root)
```

## Key Insights for Interviews

> **Success Strategy** : Focus on explaining your thought process clearly. Interviewers care more about your reasoning than perfect code.

1. **Start Simple** : Always begin with the recursive approach
2. **Optimize Gradually** : Mention advanced techniques if asked about multiple queries
3. **Handle Edge Cases** : Consider null nodes, same node queries, invalid inputs
4. **Explain Trade-offs** : Discuss why you'd choose one approach over another

### Common Edge Cases to Address

```python
def robustLCA(root, p, q):
    # Handle edge cases
    if not root or not p or not q:
        return None
  
    if p == q:
        return p
  
    # Your main algorithm here
    return lowestCommonAncestor(root, p, q)
```

The beauty of LCA problems lies in their progression from simple recursive thinking to sophisticated preprocessing techniques. Master the recursive approach first, understand why it works, then gradually explore optimizations based on the specific requirements of your problem.

Remember: in interviews, clarity of explanation often matters more than the most optimal solution. Start with what you know, explain your reasoning, and then discuss how you might optimize if needed.
