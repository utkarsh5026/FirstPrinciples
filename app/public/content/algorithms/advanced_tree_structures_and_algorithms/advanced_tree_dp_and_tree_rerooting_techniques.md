# Advanced Tree Dynamic Programming and Tree Rerooting: A Complete Guide for FAANG Interviews

## Foundation: Understanding Trees from First Principles

Before diving into advanced tree DP, let's establish the fundamental building blocks that will guide our journey through these sophisticated algorithms.

### What is a Tree?

> **Core Definition** : A tree is a connected acyclic graph with n nodes and n-1 edges, where any two nodes are connected by exactly one path.

In competitive programming and interviews, we typically work with:

* **Rooted trees** : One node is designated as the root
* **Unrooted trees** : No specific root is chosen initially

```python
# Basic tree node representation
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.children = []  # For general trees
        self.left = None    # For binary trees
        self.right = None   # For binary trees
        self.parent = None  # Sometimes needed

# Graph representation (more common in advanced problems)
def build_tree(edges, n):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    return adj
```

The graph representation is crucial because most FAANG tree problems give you edges, not a pre-built tree structure.

## Dynamic Programming: The Foundation

> **First Principle** : Dynamic Programming solves complex problems by breaking them into simpler subproblems and storing results to avoid redundant calculations.

### Why DP Works on Trees

Trees have a beautiful property:  **optimal substructure** . The solution for a subtree can be computed independently and then combined with solutions from other subtrees.

```python
# Classic example: Tree diameter using DP
def tree_diameter(adj, n):
    visited = [False] * n
  
    def dfs(node):
        visited[node] = True
        # dp[node] = maximum depth from this node
        max_depth1 = max_depth2 = 0
      
        for neighbor in adj[node]:
            if not visited[neighbor]:
                depth = dfs(neighbor)
                # Keep track of two largest depths
                if depth > max_depth1:
                    max_depth2 = max_depth1
                    max_depth1 = depth
                elif depth > max_depth2:
                    max_depth2 = depth
      
        # Update global diameter
        nonlocal diameter
        diameter = max(diameter, max_depth1 + max_depth2)
      
        return max_depth1 + 1
  
    diameter = 0
    dfs(0)
    return diameter
```

**What's happening here?**

1. For each node, we compute the maximum depth we can reach in its subtree
2. We combine the two largest depths to get the diameter passing through this node
3. We return the maximum depth for the parent to use

## Pattern 1: Subtree-based Tree DP

This is the most fundamental pattern where we compute something for each subtree.

### Core Template

```python
def tree_dp_subtree(adj, n):
    visited = [False] * n
    dp = [0] * n  # dp[i] = answer for subtree rooted at i
  
    def dfs(node):
        visited[node] = True
      
        # Process all children first
        for child in adj[node]:
            if not visited[child]:
                dfs(child)
                # Combine child's result with current node
                dp[node] = combine(dp[node], dp[child])
      
        # Compute final value for this node
        dp[node] = compute_final(dp[node], node)
      
    dfs(0)  # Start from any node
    return dp
```

### Example: Maximum Sum of Non-Adjacent Nodes

> **Problem** : Find the maximum sum of node values such that no two adjacent nodes are selected.

```python
def rob_tree(adj, values, n):
    visited = [False] * n
  
    def dfs(node):
        visited[node] = True
      
        include = values[node]  # Include current node
        exclude = 0             # Exclude current node
      
        for child in adj[node]:
            if not visited[child]:
                child_include, child_exclude = dfs(child)
              
                # If we include current, we must exclude children
                include += child_exclude
              
                # If we exclude current, we can choose best for children
                exclude += max(child_include, child_exclude)
      
        return include, exclude
  
    inc, exc = dfs(0)
    return max(inc, exc)
```

**Detailed Explanation:**

* **State Definition** : For each node, we track two states - including it or excluding it
* **Transition** : If we include a node, all children must be excluded. If we exclude a node, we can choose the best option for each child
* **Combination** : We sum up the results from all children

## Pattern 2: Tree Rerooting - The Game Changer

> **Key Insight** : Tree rerooting allows us to efficiently compute answers for every possible root without running separate DFS from each node.

Traditional approach: O(n²) - run DFS from each node
Rerooting approach: O(n) - run DFS twice with clever state transitions

### The Two-Phase Process

 **Phase 1** : Compute "downward" information (what we can get from subtrees)
 **Phase 2** : Compute "upward" information (what we can get from ancestors and siblings)

```python
def tree_rerooting_template(adj, n):
    # Phase 1: Downward DP
    down = [0] * n
    visited = [False] * n
  
    def dfs1(node, parent):
        visited[node] = True
      
        for child in adj[node]:
            if child != parent:
                dfs1(child, node)
                down[node] = combine_down(down[node], down[child])
      
        down[node] = finalize_down(down[node], node)
  
    # Phase 2: Upward DP
    up = [0] * n
    answer = [0] * n
  
    def dfs2(node, parent):
        # Compute answer for current node
        answer[node] = combine_final(down[node], up[node])
      
        # Prepare upward information for children
        child_contributions = []
        for child in adj[node]:
            if child != parent:
                child_contributions.append(down[child])
      
        # For each child, compute what it gets from "up"
        for i, child in enumerate([c for c in adj[node] if c != parent]):
            # up[child] = what child gets from everything except its own subtree
            up[child] = combine_up(up[node], exclude_index(child_contributions, i))
            dfs2(child, node)
  
    dfs1(0, -1)
    dfs2(0, -1)
    return answer
```

### Concrete Example: Sum of Distances

> **Problem** : For each node, find the sum of distances to all other nodes in the tree.

Let me break this down step by step:

```python
def sum_of_distances(adj, n):
    # Phase 1: Count nodes in each subtree and sum of distances within subtree
    subtree_size = [1] * n
    subtree_sum = [0] * n
  
    def dfs1(node, parent):
        for child in adj[node]:
            if child != parent:
                dfs1(child, node)
              
                # Add child's subtree size
                subtree_size[node] += subtree_size[child]
              
                # Add child's internal distances + distances through this edge
                subtree_sum[node] += subtree_sum[child] + subtree_size[child]
  
    # Phase 2: Propagate answers using rerooting
    answer = [0] * n
  
    def dfs2(node, parent):
        # Current answer = distances within subtree + distances to outside
        answer[node] = subtree_sum[node]
        if parent != -1:
            # Add distances from outside (computed in previous call)
            outside_nodes = n - subtree_size[node]
            answer[node] += outside_nodes
  
        for child in adj[node]:
            if child != parent:
                # Reroot: move root from 'node' to 'child'
              
                # Remove child's contribution from node
                subtree_size[node] -= subtree_size[child]
                subtree_sum[node] -= (subtree_sum[child] + subtree_size[child])
              
                # Add node's contribution to child
                subtree_size[child] += subtree_size[node]
                subtree_sum[child] += (subtree_sum[node] + subtree_size[node])
              
                dfs2(child, node)
              
                # Restore for other children
                subtree_size[child] -= subtree_size[node]
                subtree_sum[child] -= (subtree_sum[node] + subtree_size[node])
                subtree_size[node] += subtree_size[child]
                subtree_sum[node] += (subtree_sum[child] + subtree_size[child])
  
    dfs1(0, -1)
    dfs2(0, -1)
    return answer
```

**Phase 1 Explanation:**

* `subtree_size[node]`: Number of nodes in subtree rooted at node
* `subtree_sum[node]`: Sum of distances from node to all nodes in its subtree

**Phase 2 Explanation:**

* When we move from parent to child, we need to update the DP states
* Nodes that were in parent's subtree now become "outside" for the child
* This is the magic of rerooting - we maintain the same information but shift perspective

## Advanced Pattern: Multi-state Tree DP

Some problems require tracking multiple states per node.

### Example: Tree Coloring with Constraints

> **Problem** : Color tree nodes with two colors such that no two adjacent nodes have the same color. Maximize the sum of values.

```python
def max_tree_coloring(adj, red_values, blue_values, n):
    visited = [False] * n
  
    def dfs(node, parent):
        visited[node] = True
      
        # dp[0] = max value if node is colored red
        # dp[1] = max value if node is colored blue
        red_sum = red_values[node]
        blue_sum = blue_values[node]
      
        for child in adj[node]:
            if child != parent:
                child_red, child_blue = dfs(child, node)
              
                # If current is red, children can only be blue
                red_sum += child_blue
              
                # If current is blue, children can only be red
                blue_sum += child_red
      
        return red_sum, blue_sum
  
    red, blue = dfs(0, -1)
    return max(red, blue)
```

## FAANG Interview Patterns

### Pattern Recognition for Interviews

> **When to use Tree DP** : Problems asking for optimal values, counts, or properties computed over all subtrees.

> **When to use Tree Rerooting** : Problems asking for answers with respect to each node as a potential root.

### Common Interview Questions

**1. Tree DP Questions:**

* House Robber III
* Binary Tree Maximum Path Sum
* Tree Diameter
* Longest Univalue Path

**2. Tree Rerooting Questions:**

* Sum of Distances in Tree
* All Possible Full Binary Trees (variations)
* Minimum Height Trees

### Mobile-Optimized Problem Visualization

```
Tree Rerooting Visualization:

Original Tree (rooted at 0):
     0
   /   \
  1     2
 / \   /
3   4 5

Phase 1 - Compute down[]:
down[3] = base_value(3)
down[4] = base_value(4)  
down[5] = base_value(5)
down[1] = combine(down[3], down[4])
down[2] = down[5]
down[0] = combine(down[1], down[2])

Phase 2 - Compute up[] and answers:
answer[0] = combine(down[0], up[0]=0)

For child 1:
up[1] = combine(up[0], down[2])
answer[1] = combine(down[1], up[1])

For child 2:  
up[2] = combine(up[0], down[1])
answer[2] = combine(down[2], up[2])
```

## Advanced Optimization Techniques

### 1. Memory Optimization

```python
# Instead of storing all DP states
def memory_optimized_tree_dp(adj, n):
    def dfs(node, parent):
        result = base_case(node)
      
        for child in adj[node]:
            if child != parent:
                child_result = dfs(child, node)
                result = combine(result, child_result)
      
        return result
  
    return dfs(0, -1)
```

### 2. Handling Edge Cases

> **Critical Interview Considerations** :
>
> * Single node trees
> * Linear trees (essentially linked lists)
> * Trees with negative values
> * Empty trees

```python
def robust_tree_dp(adj, n):
    if n == 0:
        return []
    if n == 1:
        return [base_case(0)]
  
    # Continue with normal algorithm
    return tree_dp_algorithm(adj, n)
```

## Practice Problems for Mastery

**Beginner Tree DP:**

1. Maximum Depth of Binary Tree
2. Sum of Left Leaves
3. Path Sum

**Intermediate Tree DP:**

1. House Robber III
2. Binary Tree Maximum Path Sum
3. Longest Univalue Path

**Advanced Tree Rerooting:**

1. Sum of Distances in Tree
2. Number of Nodes in the Sub-Tree With the Same Label
3. Minimum Height Trees

**Expert Level:**

1. Tree DP with multiple constraints
2. Tree rerooting with complex state transitions
3. Dynamic tree problems (LCA + DP)

## Key Takeaways for FAANG Interviews

> **Time Complexity** : Most tree DP problems are O(n), tree rerooting is O(n) with two DFS passes.

> **Space Complexity** : O(n) for recursion stack and DP arrays, can be optimized to O(h) where h is height.

> **Interview Strategy** : Start with brute force O(n²) solution, then optimize using rerooting technique to impress interviewers.

The beauty of tree DP and rerooting lies in their elegance - they transform seemingly complex problems into manageable subproblems while maintaining optimal time complexity. Master these patterns, and you'll have powerful tools for tackling some of the most challenging tree problems in technical interviews.
