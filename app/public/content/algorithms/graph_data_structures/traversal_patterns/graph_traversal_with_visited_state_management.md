# Graph Traversal with Visited State Management: A Complete Guide from First Principles

## Understanding Graphs: The Foundation

Let's start from the very beginning. A **graph** is one of the most fundamental data structures in computer science, representing relationships between entities.

> **Core Concept** : A graph consists of **vertices** (nodes) and **edges** (connections between nodes). Think of it like a social network where people are vertices and friendships are edges.

### What Makes Graphs Special?

Unlike linear data structures (arrays, linked lists) or hierarchical ones (trees), graphs can have:

* **Cycles** : You can start from a node and come back to it
* **Multiple paths** : Different routes to reach the same destination
* **Disconnected components** : Islands of nodes with no connections between them

Here's a simple visual representation:

```
    A ---- B
    |      |
    |      |
    D ---- C
```

This represents a graph where:

* Vertices: {A, B, C, D}
* Edges: {(A,B), (B,C), (C,D), (D,A)}

## Why Do We Need Graph Traversal?

Graph traversal is the process of visiting every vertex in a graph systematically. But why is this important?

> **Real-world Applications** : Finding shortest paths in maps, social network analysis, web crawling, dependency resolution, circuit analysis, and countless other problems.

### The Core Challenge: Avoiding Infinite Loops

Here's where the **visited state** becomes crucial. Consider this scenario:

```
A ---- B
|      |
|      |
D ---- C
```

If we start at A and want to visit all nodes:

* Visit A
* Go to B (connected to A)
* Go to C (connected to B)
* Go to D (connected to C)
* Go to A (connected to D) ← **Problem!** We're back where we started

> **The Visited State Problem** : Without tracking which nodes we've already visited, we'll get stuck in infinite loops, visiting the same nodes repeatedly.

## Understanding Visited State Management

The visited state is a mechanism to remember which nodes we've already processed during our traversal.

### Different Approaches to Implement Visited State

#### 1. Boolean Array/Set Approach

```python
# For graphs with numbered vertices (0 to n-1)
visited = [False] * n

# For graphs with any type of vertices
visited = set()
```

#### 2. Marking in the Graph Itself

```python
# Modify the graph structure directly
# (Less preferred as it mutates original data)
```

#### 3. Using Node Colors (Advanced)

```python
# WHITE: Unvisited
# GRAY: Currently being processed
# BLACK: Completely processed
color = ['WHITE'] * n
```

Let me show you the most common and interview-friendly approaches:

## Depth-First Search (DFS) with Visited State

DFS explores as far as possible along each branch before backtracking.

> **Key Insight** : DFS uses a stack (either explicit or implicit through recursion) and marks nodes as visited to prevent cycles.

### Recursive DFS Implementation

```python
def dfs_recursive(graph, start, visited=None):
    """
    Performs DFS traversal starting from 'start' node.
  
    Args:
        graph: Dictionary representing adjacency list
        start: Starting vertex
        visited: Set to track visited nodes
    """
    # Initialize visited set on first call
    if visited is None:
        visited = set()
  
    # Mark current node as visited
    visited.add(start)
    print(f"Visiting node: {start}")
  
    # Explore all unvisited neighbors
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)
  
    return visited
```

 **Code Explanation** :

* `visited = set()`: We use a set for O(1) lookup time
* `visited.add(start)`: Mark current node as visited before processing
* `if neighbor not in visited`: Only recurse on unvisited nodes
* The recursion stack handles the "backtracking" automatically

### Iterative DFS Implementation

```python
def dfs_iterative(graph, start):
    """
    Iterative DFS using explicit stack.
    Often preferred in interviews for better space control.
    """
    visited = set()
    stack = [start]
  
    while stack:
        # Pop from stack (LIFO behavior)
        current = stack.pop()
      
        # Skip if already visited
        if current in visited:
            continue
          
        # Mark as visited and process
        visited.add(current)
        print(f"Visiting node: {current}")
      
        # Add unvisited neighbors to stack
        for neighbor in graph[current]:
            if neighbor not in visited:
                stack.append(neighbor)
  
    return visited
```

 **Code Explanation** :

* `stack = [start]`: Initialize with starting node
* `stack.pop()`: LIFO (Last In, First Out) gives us DFS behavior
* We check `if current in visited` after popping to handle duplicates in stack
* Adding neighbors to stack explores them in the next iterations

## Breadth-First Search (BFS) with Visited State

BFS explores all neighbors at the current depth before moving to the next depth level.

> **Key Insight** : BFS uses a queue (FIFO) and is particularly useful for finding shortest paths in unweighted graphs.

### BFS Implementation

```python
from collections import deque

def bfs(graph, start):
    """
    Performs BFS traversal starting from 'start' node.
  
    Returns the order of visited nodes and can find shortest paths.
    """
    visited = set()
    queue = deque([start])
    visited.add(start)  # Mark start as visited when adding to queue
  
    while queue:
        # Dequeue from front (FIFO behavior)
        current = queue.popleft()
        print(f"Visiting node: {current}")
      
        # Add unvisited neighbors to queue
        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)  # Mark when adding to queue
                queue.append(neighbor)
  
    return visited
```

 **Code Explanation** :

* `deque([start])`: Double-ended queue for efficient operations
* `visited.add(start)`:  **Critical** : Mark as visited when adding to queue, not when processing
* `queue.popleft()`: FIFO (First In, First Out) gives us BFS behavior
* Early marking prevents the same node from being added multiple times

## Advanced Visited State: The Three-Color Approach

For more complex scenarios (like cycle detection), we use three states:

```python
def dfs_three_color(graph, start):
    """
    Three-color DFS for cycle detection and topological sorting.
    WHITE: Unvisited, GRAY: Being processed, BLACK: Completely processed
    """
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {node: WHITE for node in graph}
  
    def dfs_visit(node):
        color[node] = GRAY  # Mark as being processed
      
        for neighbor in graph[node]:
            if color[neighbor] == GRAY:
                return True  # Back edge found - cycle detected!
            elif color[neighbor] == WHITE and dfs_visit(neighbor):
                return True
      
        color[node] = BLACK  # Mark as completely processed
        return False
  
    return dfs_visit(start)
```

 **Code Explanation** :

* `GRAY` nodes are currently in the recursion stack
* Finding a `GRAY` neighbor means we've found a back edge (cycle)
* `BLACK` nodes are completely processed and safe

## FAANG Interview Patterns

### Pattern 1: Connected Components

> **Problem** : Find the number of connected components in an undirected graph.

```python
def count_components(n, edges):
    """
    Count connected components using DFS with visited state.
  
    Time: O(V + E), Space: O(V)
    """
    # Build adjacency list
    graph = {i: [] for i in range(n)}
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
  
    visited = set()
    components = 0
  
    # Try to start DFS from each unvisited node
    for node in range(n):
        if node not in visited:
            components += 1
            dfs_component(graph, node, visited)
  
    return components

def dfs_component(graph, node, visited):
    """Helper DFS that marks all reachable nodes as visited."""
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs_component(graph, neighbor, visited)
```

### Pattern 2: Path Existence

> **Problem** : Check if a path exists between two nodes.

```python
def has_path(graph, start, target):
    """
    Check if path exists from start to target using BFS.
    """
    if start == target:
        return True
  
    visited = set()
    queue = deque([start])
    visited.add(start)
  
    while queue:
        current = queue.popleft()
      
        for neighbor in graph[current]:
            if neighbor == target:
                return True
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
  
    return False
```

### Pattern 3: Shortest Path in Unweighted Graph

```python
def shortest_path_length(graph, start, target):
    """
    Find shortest path length in unweighted graph using BFS.
    """
    if start == target:
        return 0
  
    visited = set()
    queue = deque([(start, 0)])  # (node, distance)
    visited.add(start)
  
    while queue:
        current, distance = queue.popleft()
      
        for neighbor in graph[current]:
            if neighbor == target:
                return distance + 1
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, distance + 1))
  
    return -1  # No path found
```

## Common Interview Mistakes and How to Avoid Them

### Mistake 1: Marking Visited Too Late in BFS

```python
# WRONG: Marking when processing
while queue:
    current = queue.popleft()
    visited.add(current)  # Too late!
  
# CORRECT: Marking when adding to queue
for neighbor in graph[current]:
    if neighbor not in visited:
        visited.add(neighbor)  # Mark here!
        queue.append(neighbor)
```

> **Why This Matters** : Late marking can cause the same node to be added to the queue multiple times, leading to inefficiency or incorrect results.

### Mistake 2: Forgetting to Initialize Visited State

```python
# WRONG: Forgetting to initialize
def dfs(graph, start):
    # visited is undefined!
    dfs_helper(graph, start, visited)

# CORRECT: Always initialize
def dfs(graph, start):
    visited = set()
    return dfs_helper(graph, start, visited)
```

### Mistake 3: Mutating the Graph Instead of Using Visited State

```python
# WRONG: Modifying original graph
def dfs(graph, start):
    print(start)
    for neighbor in graph[start]:
        graph[start].remove(neighbor)  # Destructive!
        dfs(graph, neighbor)

# CORRECT: Use visited state
def dfs(graph, start, visited):
    if start in visited:
        return
    visited.add(start)
    # ... rest of implementation
```

## Space and Time Complexity Analysis

### DFS Complexity

* **Time** : O(V + E) where V = vertices, E = edges
* **Space** : O(V) for visited set + O(V) for recursion stack = O(V)

### BFS Complexity

* **Time** : O(V + E)
* **Space** : O(V) for visited set + O(V) for queue = O(V)

> **Interview Insight** : Both DFS and BFS have the same time complexity, but their space usage patterns differ. DFS uses the call stack (or explicit stack), while BFS uses a queue.

## Advanced Considerations for FAANG Interviews

### When to Choose DFS vs BFS

 **Use DFS when** :

* Detecting cycles
* Topological sorting
* Finding strongly connected components
* Tree/graph structure problems
* Memory is a constraint (generally uses less space)

 **Use BFS when** :

* Finding shortest path in unweighted graphs
* Level-order traversal
* Finding all nodes at distance K
* When you need to explore neighbors before going deeper

### Optimizations for Large Graphs

```python
def optimized_dfs(graph, start, target):
    """
    Early termination when target is found.
    """
    visited = set()
    stack = [start]
  
    while stack:
        current = stack.pop()
      
        if current == target:
            return True  # Early termination
      
        if current in visited:
            continue
          
        visited.add(current)
      
        for neighbor in graph[current]:
            if neighbor not in visited:
                stack.append(neighbor)
  
    return False
```

This comprehensive understanding of graph traversal with visited state management will serve you well in FAANG interviews. The key is understanding not just the algorithms, but when and why to use each approach, and how to implement them correctly with proper state management.
