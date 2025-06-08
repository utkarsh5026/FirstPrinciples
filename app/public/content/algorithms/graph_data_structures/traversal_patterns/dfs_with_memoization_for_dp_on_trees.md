
# DFS with Memoization for Dynamic Programming on Trees: A Complete Guide

## Understanding the Foundation: First Principles

Let me walk you through this powerful technique that combines three fundamental concepts to solve complex tree problems efficiently.

### What is Depth-First Search (DFS)?

> **Core Principle** : DFS is a graph traversal algorithm that explores as far as possible along each branch before backtracking.

In the context of trees, DFS means:

* Start at a node (usually root)
* Visit one child completely before visiting siblings
* Recursively process subtrees
* Return results back up the tree

```python
def simple_dfs(node):
    if not node:
        return
  
    # Process current node
    print(node.val)
  
    # Recursively visit children
    for child in node.children:
        simple_dfs(child)
```

**What's happening here?**

* We check if the current node exists
* Process the node (in this case, print its value)
* Recursively call DFS on each child
* The function naturally backtracks when it reaches leaf nodes

### What is Memoization?

> **Core Principle** : Memoization is an optimization technique that stores the results of expensive function calls and returns the cached result when the same inputs occur again.

```python
# Without memoization - inefficient
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# With memoization - efficient
memo = {}
def fibonacci_memo(n):
    if n in memo:
        return memo[n]  # Return cached result
  
    if n <= 1:
        result = n
    else:
        result = fibonacci_memo(n-1) + fibonacci_memo(n-2)
  
    memo[n] = result  # Cache the result
    return result
```

 **Key insight** : The memoized version transforms an exponential time complexity O(2^n) into linear O(n) by avoiding redundant calculations.

### What is Dynamic Programming?

> **Dynamic Programming is an algorithmic paradigm that solves complex problems by breaking them down into simpler subproblems and storing the results to avoid redundant computations.**

The two key properties for DP:

1. **Optimal Substructure** : The optimal solution contains optimal solutions to subproblems
2. **Overlapping Subproblems** : The same subproblems are solved multiple times

## Why Combine DFS + Memoization for Tree DP?

Trees naturally have a recursive structure where:

* Each subtree is an independent subproblem
* Results from subtrees can be combined to solve the parent problem
* The same subtree configurations might appear multiple times

> **The Magic** : When we traverse a tree with DFS and memoize results based on subtree characteristics, we can solve problems that would otherwise be exponentially complex.

## The Pattern: Tree DP with Memoization

Let's understand this through a concrete example:  **Finding the diameter of a tree** .

### Problem Setup

```
Tree Visualization (Portrait View):
        1
       / \
      2   3
     / \   \
    4   5   6
   /
  7
```

The diameter is the longest path between any two nodes. For this tree, it's 4 → 2 → 1 → 3 → 6 (length 4).

### Step-by-Step Implementation

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def tree_diameter(root):
    memo = {}  # Memoization cache
    max_diameter = 0
  
    def dfs(node):
        nonlocal max_diameter
      
        # Base case: empty node
        if not node:
            return 0
      
        # Check if we've already computed this subtree
        if id(node) in memo:
            return memo[id(node)]
      
        # Recursively get depths of left and right subtrees
        left_depth = dfs(node.left)
        right_depth = dfs(node.right)
      
        # Update global maximum diameter
        # Diameter through this node = left_depth + right_depth
        current_diameter = left_depth + right_depth
        max_diameter = max(max_diameter, current_diameter)
      
        # Return the maximum depth from this node
        result = 1 + max(left_depth, right_depth)
      
        # Memoize the result
        memo[id(node)] = result
        return result
  
    dfs(root)
    return max_diameter
```

**Detailed Code Explanation:**

1. **Memoization Setup** : We use `memo = {}` to store computed results for each node
2. **Global State** : `max_diameter` tracks the best diameter found so far
3. **Base Case** : If `node` is None, return 0 (no depth contribution)
4. **Cache Check** : Before computing, check if we've seen this node before
5. **Recursive Calls** : Get depths from left and right subtrees
6. **Diameter Calculation** : For any node, diameter through it = left_depth + right_depth
7. **Return Value** : Each call returns the maximum depth from current node downward
8. **Memoization** : Store the computed depth for future use

### Execution Trace

Let's trace through our example tree:

```
DFS Execution (Portrait View):

Call Stack:        Memo State:
dfs(1)            {}
├─ dfs(2)         {}
│  ├─ dfs(4)      {}
│  │  ├─ dfs(7)   {}
│  │  │  returns 1   {id(7): 1}
│  │  returns 2      {id(7): 1, id(4): 2}
│  ├─ dfs(5)         {id(7): 1, id(4): 2}
│  │  returns 1      {id(7): 1, id(4): 2, id(5): 1}
│  returns 3         {id(7): 1, id(4): 2, id(5): 1, id(2): 3}
├─ dfs(3)            {id(7): 1, id(4): 2, id(5): 1, id(2): 3}
│  ├─ dfs(6)         {id(7): 1, id(4): 2, id(5): 1, id(2): 3}
│  │  returns 1      {id(7): 1, id(4): 2, id(5): 1, id(2): 3, id(6): 1}
│  returns 2         {id(7): 1, id(4): 2, id(5): 1, id(2): 3, id(6): 1, id(3): 2}
returns 4            {all nodes cached}

Final max_diameter = 4
```

## Advanced Pattern: State-Based Memoization

Sometimes, memoization isn't just about the node but about the **state** at that node.

### Example: Maximum Sum Path with Constraints

> **Problem** : Find the maximum sum path in a tree where you can't take two adjacent nodes.

```python
def rob_tree(root):
    memo = {}
  
    def dfs(node, can_take):
        # State: (node, whether we can take this node)
        if not node:
            return 0
      
        state = (id(node), can_take)
        if state in memo:
            return memo[state]
      
        if can_take:
            # Two choices: take this node or skip it
            take = node.val + dfs(node.left, False) + dfs(node.right, False)
            skip = dfs(node.left, True) + dfs(node.right, True)
            result = max(take, skip)
        else:
            # Must skip this node
            result = dfs(node.left, True) + dfs(node.right, True)
      
        memo[state] = result
        return result
  
    return dfs(root, True)
```

**What makes this different?**

* **State Complexity** : Our memoization key includes both the node AND whether we can take it
* **Decision Tree** : At each node, we have explicit choices that affect future decisions
* **Constraint Propagation** : Taking a node affects what we can do with its children

## Common FAANG Interview Patterns

### Pattern 1: Tree Traversal with Global Optimization

```python
def binary_tree_cameras(root):
    """
    Minimum cameras needed to monitor all nodes.
    Each camera monitors itself, parent, and children.
    """
    memo = {}
  
    def dfs(node):
        if not node:
            return float('inf'), 0, 0  # (need_camera, has_camera, covered)
      
        if id(node) in memo:
            return memo[id(node)]
      
        left_states = dfs(node.left) if node.left else (0, 0, 1)
        right_states = dfs(node.right) if node.right else (0, 0, 1)
      
        # Calculate minimum cameras for different states
        # State 0: node needs camera
        # State 1: node has camera  
        # State 2: node is covered
      
        result = calculate_optimal_states(left_states, right_states)
        memo[id(node)] = result
        return result
  
    return min(dfs(root)[:2])  # Return minimum of first two states
```

### Pattern 2: Path-Based DP

```python
def max_path_sum(root):
    """
    Find maximum sum of any path in the tree.
    Path can start and end at any nodes.
    """
    memo = {}
    max_sum = float('-inf')
  
    def dfs(node):
        nonlocal max_sum
      
        if not node:
            return 0
      
        if id(node) in memo:
            return memo[id(node)]
      
        # Get maximum contribution from left and right
        left_gain = max(dfs(node.left), 0)  # Ignore negative paths
        right_gain = max(dfs(node.right), 0)
      
        # Maximum path through current node
        path_sum = node.val + left_gain + right_gain
        max_sum = max(max_sum, path_sum)
      
        # Return maximum gain from this node
        result = node.val + max(left_gain, right_gain)
        memo[id(node)] = result
        return result
  
    dfs(root)
    return max_sum
```

## Optimization Techniques

### Memory Optimization

> **Key Insight** : In trees, each node is visited exactly once in DFS, so sometimes we don't need memoization if we're careful about our recursion.

```python
def optimized_tree_dp(root):
    """
    Sometimes we can eliminate memoization by ensuring
    single visits and careful state management.
    """
    def dfs(node):
        if not node:
            return 0, 0  # (include_node, exclude_node)
      
        left_inc, left_exc = dfs(node.left)
        right_inc, right_exc = dfs(node.right)
      
        # Include current node: must exclude children
        include = node.val + left_exc + right_exc
      
        # Exclude current node: can choose best from children
        exclude = max(left_inc, left_exc) + max(right_inc, right_exc)
      
        return include, exclude
  
    return max(dfs(root))
```

### Time Complexity Analysis

> **Without Memoization** : O(2^n) - exponential due to overlapping subproblems
> **With Memoization** : O(n) - each node computed once
> **Space Complexity** : O(n) for memoization + O(h) for recursion stack

## Common Pitfalls and Solutions

### Pitfall 1: Incorrect Memoization Key

```python
# WRONG: Using node value as key
memo = {}
def wrong_dfs(node):
    if node.val in memo:  # Multiple nodes can have same value!
        return memo[node.val]

# CORRECT: Using node identity
memo = {}
def correct_dfs(node):
    if id(node) in memo:  # Each node has unique identity
        return memo[id(node)]
```

### Pitfall 2: Not Considering All States

```python
# WRONG: Only memoizing one aspect
def incomplete_memo(node, constraint):
    if id(node) in memo:  # Missing constraint in key!
        return memo[id(node)]

# CORRECT: Include all relevant state
def complete_memo(node, constraint):
    key = (id(node), constraint)
    if key in memo:
        return memo[key]
```

## Practice Problems for FAANG Interviews

> **Essential Problems to Master:**
>
> 1. **Tree Diameter** - Classic introduction to tree DP
> 2. **House Robber III** - State-based memoization
> 3. **Binary Tree Cameras** - Complex state management
> 4. **Maximum Path Sum** - Global optimization with local decisions

### Problem-Solving Framework

When you see a tree DP problem:

1. **Identify the Decision** : What choice do you make at each node?
2. **Define the State** : What information do you need to make optimal decisions?
3. **Find the Recurrence** : How do child results combine to form parent result?
4. **Handle Base Cases** : What happens at leaf nodes or null nodes?
5. **Optimize with Memoization** : Cache results to avoid recomputation

> **Remember** : Tree DP with memoization transforms exponential problems into linear ones by recognizing that tree structures naturally break problems into independent subproblems that can be solved optimally and combined efficiently.

This technique is your key to solving complex tree problems that appear frequently in FAANG interviews. Master the pattern, and you'll be able to tackle any tree DP problem with confidence!
