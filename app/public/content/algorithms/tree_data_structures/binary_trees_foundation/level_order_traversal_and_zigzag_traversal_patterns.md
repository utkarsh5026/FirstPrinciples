# Tree Traversal Patterns: Level-Order and Zigzag from First Principles

Let me walk you through these fundamental tree traversal patterns that are absolutely crucial for FAANG interviews. We'll build everything from the ground up, starting with the core concepts.

## Understanding the Foundation: What is Level-Order Traversal?

> **Core Principle** : Level-order traversal visits nodes level by level, from left to right, starting from the root. Think of it like reading a book - you read each line completely before moving to the next line.

### The Mental Model

Imagine you're standing in front of a family tree displayed on a wall. Instead of following family lineages (which would be depth-first), you're reading each generation completely before moving to the next generation:

```
Generation 1:    [Grandparent]
Generation 2:    [Parent1] [Parent2]  
Generation 3:    [Child1] [Child2] [Child3] [Child4]
```

This is exactly how level-order traversal works - we process each "generation" (level) of the tree completely before moving deeper.

### The Data Structure Foundation

> **Key Insight** : Level-order traversal naturally uses a Queue (FIFO - First In, First Out) because we need to process nodes in the exact order we discover them at each level.

Why a queue? Let's think through this:

* When we visit a node, we want to visit its children later
* But we want to finish the current level first
* A queue ensures that nodes discovered earlier get processed earlier

## Step-by-Step Example: Building Intuition

Let's trace through a concrete example:

```
        3
       / \
      9   20
         /  \
        15   7
```

**Step-by-step execution:**

```
Initial: Queue = [3]
Level 0: Process 3 → Add children 9,20 → Queue = [9,20]
Level 1: Process 9 → No children → Queue = [20]
         Process 20 → Add children 15,7 → Queue = [15,7]
Level 2: Process 15 → No children → Queue = [7]
         Process 7 → No children → Queue = []
```

 **Result** : [3, 9, 20, 15, 7]

## Code Implementation: Level-Order Traversal

Let me show you the standard implementation with detailed explanation:

```python
from collections import deque

def level_order_traversal(root):
    """
    Performs level-order traversal of a binary tree
    Returns: List of values in level-order
    """
    if not root:
        return []
  
    result = []
    queue = deque([root])  # Initialize with root node
  
    while queue:
        # Process current node
        current = queue.popleft()
        result.append(current.val)
      
        # Add children to queue for next level processing
        if current.left:
            queue.append(current.left)
        if current.right:
            queue.append(current.right)
  
    return result
```

**Detailed Code Explanation:**

1. **Initialization** : We start with the root in our queue. The `deque` gives us O(1) operations for both ends.
2. **Main Loop Logic** : While there are nodes to process:

* Remove the front node (FIFO principle)
* Process it (add to result)
* Add its children to the back of queue

1. **Child Addition Order** : We add left child first, then right child. This ensures left-to-right processing at each level.

## Level-by-Level Collection Pattern

> **Interview Tip** : Often, you'll need to return each level as a separate list rather than a flattened result. This is extremely common in FAANG interviews.

Here's the enhanced version:

```python
def level_order_by_levels(root):
    """
    Returns each level as a separate list
    Example: [[3], [9, 20], [15, 7]]
    """
    if not root:
        return []
  
    result = []
    queue = deque([root])
  
    while queue:
        level_size = len(queue)  # Crucial: snapshot current level size
        current_level = []
      
        # Process exactly 'level_size' nodes (current level)
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
          
            # Add next level nodes
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
      
        result.append(current_level)
  
    return result
```

 **Critical Insight** : The `level_size = len(queue)` line is the key. It captures how many nodes are in the current level before we start adding the next level's nodes.

## Zigzag Traversal: The Alternating Pattern

> **Core Concept** : Zigzag traversal follows the same level-by-level approach, but alternates the direction of processing within each level. Level 0: left-to-right, Level 1: right-to-left, Level 2: left-to-right, and so on.

### Visual Understanding

```
        3        ← Level 0 (left to right)
       / \
      9   20     ← Level 1 (right to left) 
         /  \
        15   7   ← Level 2 (left to right)
```

 **Expected Output** : [3, 20, 9, 15, 7]

Notice how level 1 is processed as [20, 9] instead of [9, 20].

### Two Approaches for Zigzag

**Approach 1: Reverse Alternate Levels**

```python
def zigzag_level_order_v1(root):
    """
    Simple approach: Do normal level-order, then reverse alternate levels
    """
    if not root:
        return []
  
    result = []
    queue = deque([root])
    left_to_right = True
  
    while queue:
        level_size = len(queue)
        current_level = []
      
        for _ in range(level_size):
            node = queue.popleft()
            current_level.append(node.val)
          
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
      
        # Reverse if we're going right to left
        if not left_to_right:
            current_level.reverse()
      
        result.extend(current_level)
        left_to_right = not left_to_right  # Toggle direction
  
    return result
```

**Approach 2: Use Deque for Directional Addition**

```python
def zigzag_level_order_v2(root):
    """
    Advanced approach: Use deque to add elements in correct order directly
    """
    if not root:
        return []
  
    result = []
    queue = deque([root])
    left_to_right = True
  
    while queue:
        level_size = len(queue)
        level_values = deque()  # For this level's values
      
        for _ in range(level_size):
            node = queue.popleft()
          
            # Add to appropriate end based on direction
            if left_to_right:
                level_values.append(node.val)      # Add to right end
            else:
                level_values.appendleft(node.val)  # Add to left end
          
            # Always add children in same order
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
      
        result.extend(level_values)
        left_to_right = not left_to_right
  
    return result
```

 **Key Difference** : The second approach builds the level result in the correct order as we process, eliminating the need for reversal.

## Advanced Pattern: Right-to-Left Processing

> **Interview Variation** : Sometimes you need to process nodes from right to left at each level, not just reverse the final result.

```python
def process_right_to_left_levels(root):
    """
    Actually processes nodes right-to-left using two stacks
    """
    if not root:
        return []
  
    result = []
    current_level = [root]
    left_to_right = True
  
    while current_level:
        next_level = []
        level_values = []
      
        for node in current_level:
            level_values.append(node.val)
          
            if left_to_right:
                # Add children left to right
                if node.left:
                    next_level.append(node.left)
                if node.right:
                    next_level.append(node.right)
            else:
                # Add children right to left
                if node.right:
                    next_level.append(node.right)
                if node.left:
                    next_level.append(node.left)
      
        result.extend(level_values)
        current_level = next_level
        left_to_right = not left_to_right
  
    return result
```

## Complexity Analysis

> **Time Complexity** : O(n) for both patterns - we visit each node exactly once
>
> **Space Complexity** :
>
> * O(w) where w is the maximum width of the tree (for the queue)
> * In the worst case (complete binary tree), this is O(n/2) = O(n)

### Why O(n) Time?

Each node is:

1. Added to queue once: O(1)
2. Removed from queue once: O(1)
3. Processed once: O(1)

Total: 3 × n = O(n)

## Common Interview Variations

### 1. Return Each Level Separately

```python
def zigzag_by_levels(root):
    """Returns: [[3], [20, 9], [15, 7]]"""
    # Similar to above but append current_level instead of extending
    pass
```

### 2. Bottom-Up Level Order

```python
def level_order_bottom_up(root):
    """Returns levels from bottom to top"""
    levels = level_order_by_levels(root)
    return levels[::-1]  # Simply reverse the levels
```

### 3. Right View of Tree

```python
def right_view(root):
    """Return the rightmost node at each level"""
    if not root:
        return []
  
    result = []
    queue = deque([root])
  
    while queue:
        level_size = len(queue)
      
        for i in range(level_size):
            node = queue.popleft()
          
            # Last node in level is rightmost
            if i == level_size - 1:
                result.append(node.val)
          
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
  
    return result
```

## Interview Strategy and Tips

> **Key Pattern Recognition** : These problems often appear disguised as:
>
> * "Print tree level by level"
> * "Find nodes at each depth"
> * "Serialize tree by levels"
> * "Connect nodes at same level"
> * "Find minimum depth" (early termination BFS)

### Problem-Solving Framework

1. **Identify the Pattern** : Is it asking for level-by-level processing?
2. **Choose the Structure** : Queue for level-order, consider deque for zigzag
3. **Handle Level Boundaries** : Use `level_size` snapshot technique
4. **Consider Direction** : Does order within levels matter?
5. **Optimize if Needed** : Early termination, space optimization

### Common Mistakes to Avoid

1. **Forgetting Level Boundaries** : Not using `level_size` leads to mixing levels
2. **Wrong Direction Logic** : Confusing when to reverse or change addition order
3. **Edge Cases** : Empty tree, single node, unbalanced trees
4. **Queue vs Stack** : Remember BFS uses queue, not stack

This foundation will serve you well for the numerous tree traversal problems you'll encounter in FAANG interviews. The key is recognizing the pattern and adapting the basic template to the specific requirements.
