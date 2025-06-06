# Tree Diameter and Center Finding: From First Principles to FAANG Interview Mastery

Let's embark on a comprehensive journey through tree diameter and center finding algorithms, building from the ground up to interview-ready expertise.

## Understanding Trees from First Principles

Before diving into diameter and center concepts, let's establish what a tree actually represents:

> **A tree is a connected, acyclic graph** - meaning all nodes are reachable from any other node, and there are no cycles (circular paths).

```python
# Basic tree node representation
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.children = []  # For general trees
        # For binary trees: self.left = None, self.right = None
```

**Key Properties of Trees:**

* **N nodes, N-1 edges** : This is fundamental - one less edge than nodes
* **Unique path** : Between any two nodes, there's exactly one path
* **Removal breaks connectivity** : Remove any edge, and the tree splits into two components

## Tree Diameter: The Longest Path

> **Tree diameter is the longest path between any two nodes in the tree** , measured in number of edges or nodes depending on the problem statement.

Think of it like measuring the "width" of a tree if you could stretch it out completely.

### The Two-DFS Approach (Most Intuitive)

The key insight is profound yet simple:

> **The diameter of a tree always has at least one endpoint that is the farthest node from any arbitrarily chosen starting node.**

**Why does this work?**

Imagine you're standing at any node in the tree. The farthest node from you must be at one end of the longest path in the tree. Here's why:

1. If the longest path doesn't include the farthest node from your position, then you could extend that longest path by going to the farthest node, making it even longer
2. This contradicts our assumption that we had the longest path

```python
def find_diameter_two_dfs(adj_list, n):
    """
    Find diameter using two DFS calls
    adj_list: adjacency list representation
    n: number of nodes
    """
  
    def dfs(start, graph):
        """Returns (farthest_node, max_distance)"""
        visited = [False] * n
        max_dist = 0
        farthest_node = start
      
        def dfs_helper(node, dist):
            nonlocal max_dist, farthest_node
            visited[node] = True
          
            if dist > max_dist:
                max_dist = dist
                farthest_node = node
          
            for neighbor in graph[node]:
                if not visited[neighbor]:
                    dfs_helper(neighbor, dist + 1)
      
        dfs_helper(start, 0)
        return farthest_node, max_dist
  
    # Step 1: Find farthest node from node 0
    farthest_from_0, _ = dfs(0, adj_list)
  
    # Step 2: Find farthest node from the node found in step 1
    other_end, diameter = dfs(farthest_from_0, adj_list)
  
    return diameter, farthest_from_0, other_end
```

**Detailed Algorithm Breakdown:**

1. **First DFS** : Start from any node (let's say node 0) and find the farthest node from it
2. **Second DFS** : Start from the node found in step 1 and find the farthest node from it
3. **The distance found in step 2 is the diameter**

**Example Walkthrough:**

```
Tree:    1
        / \
       2   3
      /     \
     4       5
            /
           6
```

* First DFS from node 1: Farthest node is 4 or 6 (both distance 3)
* Second DFS from node 4: Farthest node is 6 (distance 4)
* Diameter = 4 (path: 4→2→1→3→5→6)

### Single DFS Approach (More Efficient)

> **We can find the diameter in a single DFS by calculating the longest path passing through each node.**

The insight here is that for each node, the longest path either:

1. Passes through this node (connecting its two deepest subtrees)
2. Lies entirely within one of its subtrees

```python
def find_diameter_single_dfs(adj_list, n):
    """
    Find diameter using single DFS
    Returns the diameter length
    """
    max_diameter = 0
  
    def dfs(node, parent):
        nonlocal max_diameter
      
        # Get the two largest depths from children
        first_max = second_max = 0
      
        for neighbor in adj_list[node]:
            if neighbor != parent:
                child_depth = dfs(neighbor, node)
              
                if child_depth > first_max:
                    second_max = first_max
                    first_max = child_depth
                elif child_depth > second_max:
                    second_max = child_depth
      
        # Diameter through current node
        current_diameter = first_max + second_max
        max_diameter = max(max_diameter, current_diameter)
      
        # Return depth of current subtree
        return first_max + 1
  
    dfs(0, -1)
    return max_diameter
```

**How this works:**

* For each node, we find the two deepest paths going down into its subtrees
* The sum of these two depths gives us the longest path passing through this node
* We keep track of the maximum such path across all nodes

## Tree Center: The Balanced Point

> **The center of a tree consists of the node(s) that minimize the maximum distance to any other node in the tree.**

Think of it as finding the most "central" location in the tree structure.

### Key Insights About Tree Centers

**Fundamental Properties:**

> **Every tree has either 1 or 2 centers, never more, never fewer.**

**Why only 1 or 2?**

* If we have the diameter path of the tree, the center(s) are the middle node(s) of this path
* For odd-length diameter: 1 center (exact middle)
* For even-length diameter: 2 centers (two middle nodes)

### Topological Sorting Approach (Most Common)

The elegant solution uses the concept of "peeling" the tree layer by layer:

```python
def find_tree_centers(adj_list, n):
    """
    Find tree center(s) using topological sorting approach
    """
    if n == 1:
        return [0]
  
    # Build adjacency list and degree count
    degrees = [len(adj_list[i]) for i in range(n)]
  
    # Initialize leaves (nodes with degree 1)
    from collections import deque
    leaves = deque()
  
    for i in range(n):
        if degrees[i] == 1:
            leaves.append(i)
  
    remaining_nodes = n
  
    # Keep removing leaves until 1 or 2 nodes remain
    while remaining_nodes > 2:
        leaves_count = len(leaves)
        remaining_nodes -= leaves_count
      
        # Process current layer of leaves
        for _ in range(leaves_count):
            leaf = leaves.popleft()
          
            # Remove this leaf from its neighbor
            for neighbor in adj_list[leaf]:
                degrees[neighbor] -= 1
                if degrees[neighbor] == 1:
                    leaves.append(neighbor)
  
    # Remaining nodes are the centers
    result = []
    while leaves:
        result.append(leaves.popleft())
  
    return result
```

**Algorithm Intuition:**

> **The center(s) are the last node(s) remaining when we repeatedly remove all leaf nodes.**

**Why does this work?**

1. Leaf nodes (degree 1) cannot be centers because their neighbor would always be more central
2. By removing leaves iteratively, we "peel" the tree from outside to inside
3. The process naturally converges to the most central node(s)

**Step-by-step example:**

```
Initial tree:    1
                / \
               2   3
              /     \
             4       5
                    /
                   6

Step 1: Remove leaves {4, 6}
Remaining:      1
               / \
              2   3
               \ /
                5

Step 2: Remove leaves {2, 5}  
Remaining:      1
               /
              3

Step 3: Remove leaf {3}
Center: {1}
```

### Alternative: Diameter-Based Center Finding

```python
def find_centers_via_diameter(adj_list, n):
    """
    Find centers by first finding diameter endpoints
    """
  
    def dfs_farthest(start):
        visited = [False] * n
        max_dist = 0
        farthest = start
        parent = [-1] * n
      
        def dfs_helper(node, dist):
            nonlocal max_dist, farthest
            visited[node] = True
          
            if dist > max_dist:
                max_dist = dist
                farthest = node
          
            for neighbor in adj_list[node]:
                if not visited[neighbor]:
                    parent[neighbor] = node
                    dfs_helper(neighbor, dist + 1)
      
        dfs_helper(start, 0)
        return farthest, max_dist, parent
  
    # Find one end of diameter
    end1, _, _ = dfs_farthest(0)
  
    # Find other end and path
    end2, diameter, parent = dfs_farthest(end1)
  
    # Reconstruct diameter path
    path = []
    current = end2
    while current != -1:
        path.append(current)
        current = parent[current]
  
    path.reverse()
  
    # Center(s) are middle node(s) of diameter path
    path_length = len(path)
    if path_length % 2 == 1:
        return [path[path_length // 2]]
    else:
        mid = path_length // 2
        return [path[mid - 1], path[mid]]
```

## Complexity Analysis

> **Time Complexity Comparison:**
>
> * Two-DFS diameter: O(n) - two complete tree traversals
> * Single-DFS diameter: O(n) - one complete traversal
> * Topological center finding: O(n) - each node processed once
> * Diameter-based center: O(n) - dominated by diameter finding

> **Space Complexity: O(n)** for all approaches due to adjacency list storage and recursion stack.

## Interview Strategy and Common Variations

### Binary Tree vs General Tree

**Binary Tree Diameter:**

```python
def diameter_binary_tree(root):
    """
    LeetCode 543: Diameter of Binary Tree
    """
    max_diameter = 0
  
    def dfs(node):
        nonlocal max_diameter
        if not node:
            return 0
      
        left_depth = dfs(node.left)
        right_depth = dfs(node.right)
      
        # Diameter through current node
        max_diameter = max(max_diameter, left_depth + right_depth)
      
        # Return height of current subtree
        return max(left_depth, right_depth) + 1
  
    dfs(root)
    return max_diameter
```

### Edge Cases to Consider

> **Critical Edge Cases:**
>
> * Single node tree: diameter = 0, center = [single_node]
> * Two node tree: diameter = 1, centers = [both_nodes]
> * Linear tree (linked list): centers are middle node(s)
> * Star graph: center is the central node

### Interview Tips

**When to use which approach:**

1. **Use Two-DFS** when you need the actual diameter path endpoints
2. **Use Single-DFS** when you only need the diameter length
3. **Use Topological sorting** for center finding (most reliable)
4. **Use Diameter-based center** when you need both diameter and center

> **Key insight for interviews: Always clarify whether diameter is measured in edges or nodes, as this affects the final answer by 1.**

The mastery of these algorithms demonstrates deep understanding of tree properties and graph traversal techniques - exactly what FAANG interviews are designed to test.
