# Path Sum Problems & Root-to-Leaf Analysis: A Complete FAANG Interview Guide

Let me walk you through path sum problems from the ground up, building every concept from first principles so you'll have complete mastery of this crucial topic.

## 🌳 First Principles: Understanding the Foundation

### What is a Binary Tree?

Before we dive into path sums, let's establish what we're working with. A binary tree is a hierarchical data structure where:

> **Core Principle** : Each node has at most two children - a left child and a right child. Think of it like a family tree where each person can have at most two direct descendants.

```
     5
   /   \
  4     8
 /     / \
11    13  4
```

### What is a Path in a Tree?

> **Path Definition** : A path is a sequence of nodes connected by edges, starting from one node and ending at another. In trees, there's exactly one path between any two nodes.

A **root-to-leaf path** specifically starts at the root (top node) and ends at a leaf (bottom node with no children).

```
Tree:
     5
   /   \
  4     8
 /     / \
11    13  4

Root-to-leaf paths:
5 → 4 → 11  (sum = 20)
5 → 8 → 13  (sum = 26)
5 → 8 → 4   (sum = 17)
```

### What is a Path Sum?

> **Path Sum** : The sum of all node values along a specific path from root to leaf.

Now that we have our foundations, let's build up the complexity.

## 🎯 The Classic Path Sum Problem

### Problem Statement

Given a binary tree and a target sum, determine if there exists a root-to-leaf path where the sum of node values equals the target.

### The Recursive Thinking Process

> **Key Insight** : At each node, we ask: "Can I reach the target by subtracting my current value and checking if either of my children can reach the remaining sum?"

Let's trace through this step by step:

```python
def hasPathSum(root, targetSum):
    # Base case: empty tree cannot have any path
    if not root:
        return False
  
    # Base case: we're at a leaf node
    if not root.left and not root.right:
        return root.val == targetSum
  
    # Recursive case: check both subtrees with reduced target
    remaining = targetSum - root.val
    return (hasPathSum(root.left, remaining) or 
            hasPathSum(root.right, remaining))
```

**Let me explain each part:**

1. **Empty Tree Check** : `if not root: return False`

* If we've gone past a leaf (null node), no path exists here

1. **Leaf Node Check** : `if not root.left and not root.right:`

* We've reached the end of a path
* Check if current node value equals remaining target

1. **Recursive Exploration** :

* Subtract current node's value from target
* Ask both children: "Can you complete the path with this remaining sum?"

### Visual Walkthrough

```
Target: 22
Tree:
      5
    /   \
   4     8
  /     / \
 11    13  4

Step-by-step for left path:
5: target=22, remaining=17, continue...
4: target=17, remaining=13, continue...
11: target=13, this equals 11? No, return False

Step-by-step for right-left path:
5: target=22, remaining=17, continue...
8: target=17, remaining=9, continue...
13: target=9, this equals 13? No, return False

Step-by-step for right-right path:
5: target=22, remaining=17, continue...
8: target=17, remaining=9, continue...
4: target=9, this equals 4? No, return False
```

## 🔍 Path Sum II: Collecting All Valid Paths

Now let's evolve our understanding. Instead of just checking if a path exists, what if we need to find all paths that sum to the target?

> **Evolution of Thinking** : We need to maintain the current path and add it to our result when we find a valid sum.

```python
def pathSum(root, targetSum):
    def dfs(node, target, current_path, all_paths):
        if not node:
            return
      
        # Add current node to path
        current_path.append(node.val)
      
        # Check if we're at a leaf with correct sum
        if not node.left and not node.right and target == node.val:
            # Important: create a copy of the path!
            all_paths.append(current_path[:])
      
        # Explore children with reduced target
        remaining = target - node.val
        dfs(node.left, remaining, current_path, all_paths)
        dfs(node.right, remaining, current_path, all_paths)
      
        # Backtrack: remove current node from path
        current_path.pop()
  
    all_paths = []
    dfs(root, targetSum, [], all_paths)
    return all_paths
```

**Critical Implementation Details:**

1. **Path Building** : `current_path.append(node.val)`

* We build the path as we go down

1. **Path Copying** : `all_paths.append(current_path[:])`

* We must create a copy! If we just append `current_path`, all results will reference the same list

1. **Backtracking** : `current_path.pop()`

* After exploring a node's children, we remove it from the path
* This allows us to explore other branches correctly

## 🚀 Path Sum III: The Advanced Challenge

This is where FAANG interviews get interesting. Now we're looking for paths that:

* Can start at any node (not just root)
* Can end at any node (not just leaves)
* Sum to the target

> **Mental Model Shift** : Think of this as "for every node, consider it as a potential starting point and explore all downward paths from there."

```python
def pathSum(root, targetSum):
    def dfs_from_node(node, target):
        """Count paths starting from this node"""
        if not node:
            return 0
      
        count = 0
        # If current node equals target, we found one path
        if node.val == target:
            count = 1
      
        # Continue exploring even if we found a match
        # (there might be paths that sum to 0 ahead)
        remaining = target - node.val
        count += dfs_from_node(node.left, remaining)
        count += dfs_from_node(node.right, remaining)
      
        return count
  
    def dfs(node):
        """Try starting path from every node"""
        if not node:
            return 0
      
        # Paths starting from current node
        paths_from_here = dfs_from_node(node, targetSum)
      
        # Paths starting from nodes in left and right subtrees
        paths_from_left = dfs(node.left)
        paths_from_right = dfs(node.right)
      
        return paths_from_here + paths_from_left + paths_from_right
  
    return dfs(root)
```

**Understanding the Dual DFS:**

1. **Outer DFS** : Visits every node to use it as a potential starting point
2. **Inner DFS** : From each starting point, explores all possible downward paths

## 🎯 Optimized Path Sum III with Prefix Sums

The above solution has O(N²) time complexity. In FAANG interviews, they often want the optimized O(N) solution:

> **Key Insight** : Use prefix sums and a hashmap to track how many times each sum has occurred on the current path.

```python
def pathSum(root, targetSum):
    def dfs(node, current_sum, prefix_count):
        if not node:
            return 0
      
        # Update current sum
        current_sum += node.val
      
        # Check if there's a prefix that when removed gives us target
        # current_sum - prefix_sum = targetSum
        # So we look for: prefix_sum = current_sum - targetSum
        needed_prefix = current_sum - targetSum
        count = prefix_count.get(needed_prefix, 0)
      
        # Add current sum to prefix counts
        prefix_count[current_sum] = prefix_count.get(current_sum, 0) + 1
      
        # Explore children
        count += dfs(node.left, current_sum, prefix_count)
        count += dfs(node.right, current_sum, prefix_count)
      
        # Backtrack: remove current sum from prefix counts
        prefix_count[current_sum] -= 1
      
        return count
  
    # Initialize with 0 sum (for paths starting from root)
    prefix_count = {0: 1}
    return dfs(root, 0, prefix_count)
```

**The Prefix Sum Magic:**

> **Core Concept** : If we have a path from root to current node with sum S, and we want a subpath ending at current node with sum T, then we need a prefix with sum (S - T).

## 🔄 Common Patterns in Path Problems

### Pattern 1: Maintaining State During Traversal

```python
def traverse_with_state(node, state):
    if not node:
        return
  
    # Modify state for current node
    state.append(node.val)
  
    # Process current node if needed
    if is_leaf(node):
        process_complete_path(state)
  
    # Recurse
    traverse_with_state(node.left, state)
    traverse_with_state(node.right, state)
  
    # Backtrack
    state.pop()
```

### Pattern 2: Prefix Sum Technique

```python
def path_problems_optimized(node, target, prefix_sums):
    # Add current value to running sum
    current_sum += node.val
  
    # Check if any previous prefix can be removed to get target
    needed = current_sum - target
    count += prefix_sums.get(needed, 0)
  
    # Record current sum for future nodes
    prefix_sums[current_sum] += 1
  
    # Recurse
    # ... 
  
    # Backtrack
    prefix_sums[current_sum] -= 1
```

## 📱 Mobile-Optimized Tree Visualizations

```
Example Tree:
    10
   /  \
  5    -3
 / \     \
3   2     11
   / \   /
  3  -2 3

All root-to-leaf paths:
10→5→3      = 18
10→5→2→3    = 20  
10→5→2→-2   = 15
10→-3→11→3  = 21

Path starting anywhere:
5→3         = 8
5→2→3       = 10
2→3         = 5
-3→11→3     = 11
...and more
```

## 🎯 FAANG Interview Strategy

### What Interviewers Look For:

> **Problem-Solving Approach** : They want to see you break down the problem systematically, not jump straight to code.

1. **Clarify Requirements** :

* Root-to-leaf only or any path?
* Can values be negative?
* Do we want count, existence, or actual paths?

1. **Start Simple** :

* Begin with basic path sum
* Evolve to more complex variants

1. **Optimize When Asked** :

* Know the O(N²) solution first
* Then present the O(N) prefix sum optimization

### Common Follow-up Questions:

1. **"What if we want the maximum path sum?"**
   ```python
   def maxPathSum(node):
       if not node:
           return float('-inf')

       if not node.left and not node.right:
           return node.val

       left_max = maxPathSum(node.left) if node.left else float('-inf')
       right_max = maxPathSum(node.right) if node.right else float('-inf')

       return node.val + max(left_max, right_max)
   ```
2. **"What about paths that can go up and down?"** (Binary Tree Maximum Path Sum)
   * This requires tracking both the maximum path ending at each node and the global maximum

## 🧠 Memory Aids for Interviews

> **The Three Questions Framework** : For any path problem, ask:
>
> 1. Where can paths start? (root only vs any node)
> 2. Where can paths end? (leaves only vs any node)
> 3. What are we optimizing? (existence, count, sum, actual paths)

### Code Template for Path Problems:

```python
def path_problem_template(root, target):
    def dfs(node, current_state):
        # Base cases
        if not node:
            return base_result
      
        # Update state with current node
        update_state(current_state, node.val)
      
        # Check if current state satisfies condition
        result = check_condition(current_state, target)
      
        # Recurse on children
        result += dfs(node.left, current_state)
        result += dfs(node.right, current_state)
      
        # Backtrack if needed
        backtrack(current_state)
      
        return result
  
    return dfs(root, initial_state)
```

This foundation will serve you well across all path sum variations you'll encounter in FAANG interviews. The key is understanding the core principles and being able to adapt them to specific problem constraints.
