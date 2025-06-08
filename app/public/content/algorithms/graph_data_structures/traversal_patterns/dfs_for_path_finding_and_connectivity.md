# Depth-First Search (DFS): The Complete Guide for Path Finding and Connectivity

Let me take you on a journey through one of the most fundamental algorithms in computer science, building everything from the ground up.

## What is a Graph? The Foundation

Before we dive into DFS, we need to understand what we're working with. Imagine you're looking at a map of cities connected by roads, or a social network where people are connected by friendships.

> **Core Concept** : A graph is simply a collection of nodes (vertices) connected by edges. Think of it as a web of relationships where each connection tells us something meaningful.

```
Simple Graph Example:
    A --- B
    |     |
    C --- D
```

In this graph:

* **Nodes/Vertices** : A, B, C, D (the cities or people)
* **Edges** : The lines connecting them (the roads or friendships)

## The Essence of Depth-First Search

> **The Big Idea** : DFS explores a graph like you're in a maze with a ball of yarn. You go as deep as possible down one path before backtracking and trying another route.

Think of it this way: imagine you're exploring a cave system. You take one tunnel and keep going deeper and deeper until you hit a dead end or find what you're looking for. Only then do you backtrack to the last junction and try a different tunnel.

## How DFS Actually Works: Step by Step

Let's trace through DFS with a concrete example:

```
Graph:
    1
   / \
  2   3
 /   / \
4   5   6
```

### The DFS Process

 **Step 1** : Start at node 1, mark it as visited
 **Step 2** : Go to an unvisited neighbor (let's say 2)
 **Step 3** : From 2, go deeper to 4
 **Step 4** : 4 has no unvisited neighbors, backtrack to 2
 **Step 5** : 2 has no more unvisited neighbors, backtrack to 1
 **Step 6** : From 1, try the other path to 3
 **Step 7** : From 3, go to 5, then backtrack and try 6

> **Key Insight** : DFS uses a **stack** data structure (either explicitly or through recursion's call stack) to remember where to backtrack to.

## DFS Implementation: Building It From Scratch

Let's implement DFS step by step, understanding every piece:

### Basic Recursive DFS

```python
def dfs_recursive(graph, node, visited):
    # Mark current node as visited
    visited.add(node)
    print(f"Visiting node: {node}")
  
    # Explore all unvisited neighbors
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)

# Example usage
graph = {
    1: [2, 3],
    2: [1, 4],
    3: [1, 5, 6],
    4: [2],
    5: [3],
    6: [3]
}

visited = set()
dfs_recursive(graph, 1, visited)
```

**What's happening here?**

* `visited.add(node)`: We mark the current node so we don't revisit it
* `for neighbor in graph[node]`: We check each connected node
* `if neighbor not in visited`: We only explore unvisited paths
* The recursive call creates our "backtracking" behavior automatically

### Iterative DFS (Using Explicit Stack)

```python
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
  
    while stack:
        # Pop from stack (most recent addition)
        node = stack.pop()
      
        if node not in visited:
            visited.add(node)
            print(f"Visiting node: {node}")
          
            # Add neighbors to stack
            for neighbor in graph[node]:
                if neighbor not in visited:
                    stack.append(neighbor)
  
    return visited
```

**Why the iterative version matters:**

* Sometimes recursion can cause stack overflow for very deep graphs
* It makes the stack behavior explicit and controllable
* Some interview problems require iterative solutions

## DFS for Path Finding: Finding Routes

One of the most common uses of DFS is finding paths between nodes. Let's build a path-finding algorithm:

```python
def find_path_dfs(graph, start, target, path=None):
    # Initialize path if not provided
    if path is None:
        path = []
  
    # Add current node to path
    path = path + [start]
  
    # Found our target!
    if start == target:
        return path
  
    # Try each neighbor
    for neighbor in graph[start]:
        # Avoid cycles by checking if neighbor is in current path
        if neighbor not in path:
            new_path = find_path_dfs(graph, neighbor, target, path)
            if new_path:  # If path found, return it
                return new_path
  
    # No path found from this route
    return None

# Example: Find path from 1 to 6
result = find_path_dfs(graph, 1, 6)
print(f"Path found: {result}")  # Output: [1, 3, 6]
```

**Deep dive into the logic:**

* `path = path + [start]`: Creates a new list to avoid modifying the original
* `if neighbor not in path`: Prevents infinite loops in cyclic graphs
* `if new_path`: Only returns if a valid path was found
* The recursion naturally handles backtracking for us

### Finding ALL Paths

Sometimes we want every possible route:

```python
def find_all_paths_dfs(graph, start, target, path=None):
    if path is None:
        path = []
  
    path = path + [start]
  
    # Base case: reached target
    if start == target:
        return [path]
  
    paths = []
    for neighbor in graph[start]:
        if neighbor not in path:  # Avoid cycles
            new_paths = find_all_paths_dfs(graph, neighbor, target, path)
            paths.extend(new_paths)
  
    return paths

# Find all paths from 1 to 6
all_paths = find_all_paths_dfs(graph, 1, 6)
for i, path in enumerate(all_paths, 1):
    print(f"Path {i}: {path}")
```

## DFS for Connectivity: Understanding Graph Structure

> **Connectivity Question** : Are two nodes connected? How many separate components exist in the graph?

### Checking if Two Nodes are Connected

```python
def are_connected(graph, start, target):
    visited = set()
  
    def dfs_search(node):
        if node == target:
            return True
      
        visited.add(node)
      
        for neighbor in graph[node]:
            if neighbor not in visited:
                if dfs_search(neighbor):
                    return True
      
        return False
  
    return dfs_search(start)

# Check if nodes 1 and 6 are connected
connected = are_connected(graph, 1, 6)
print(f"Nodes 1 and 6 connected: {connected}")
```

### Finding Connected Components

In many graphs, you have separate "islands" of connectivity:

```python
def find_connected_components(graph):
    visited = set()
    components = []
  
    def dfs_component(node, current_component):
        visited.add(node)
        current_component.append(node)
      
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs_component(neighbor, current_component)
  
    # Check each node
    for node in graph:
        if node not in visited:
            component = []
            dfs_component(node, component)
            components.append(component)
  
    return components

# Example with disconnected graph
disconnected_graph = {
    1: [2], 2: [1],           # Component 1
    3: [4], 4: [3],           # Component 2  
    5: []                     # Component 3 (isolated)
}

components = find_connected_components(disconnected_graph)
print(f"Connected components: {components}")
# Output: [[1, 2], [3, 4], [5]]
```

## FAANG Interview Patterns: Common DFS Applications

### Pattern 1: Island Problems

```python
def count_islands(grid):
    """
    Count number of islands in a 2D grid
    '1' = land, '0' = water
    """
    if not grid:
        return 0
  
    rows, cols = len(grid), len(grid[0])
    visited = set()
    islands = 0
  
    def dfs(r, c):
        # Boundary and visited checks
        if (r < 0 or r >= rows or c < 0 or c >= cols or 
            (r, c) in visited or grid[r][c] == '0'):
            return
      
        visited.add((r, c))
      
        # Explore 4 directions
        directions = [(0,1), (1,0), (0,-1), (-1,0)]
        for dr, dc in directions:
            dfs(r + dr, c + dc)
  
    # Check each cell
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1' and (r, c) not in visited:
                dfs(r, c)  # Explore entire island
                islands += 1
  
    return islands
```

**What makes this DFS special:**

* **2D grid traversal** : We treat each cell as a node
* **4-directional movement** : Each cell connects to its neighbors
* **Component counting** : Each DFS call finds one complete island

### Pattern 2: Cycle Detection

```python
def has_cycle(graph):
    """
    Detect if undirected graph has a cycle
    """
    visited = set()
  
    def dfs(node, parent):
        visited.add(node)
      
        for neighbor in graph[node]:
            if neighbor not in visited:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:
                # Found back edge = cycle
                return True
      
        return False
  
    # Check each component
    for node in graph:
        if node not in visited:
            if dfs(node, -1):
                return True
  
    return False
```

> **Cycle Detection Logic** : If we encounter a visited node that isn't our immediate parent, we've found a cycle.

## Time and Space Complexity Analysis

### Time Complexity: O(V + E)

* **V** : Number of vertices (we visit each node once)
* **E** : Number of edges (we examine each edge once)
* **Why** : In worst case, we visit every node and traverse every edge

### Space Complexity: O(V)

* **Recursive** : O(V) for call stack in worst case (linear graph)
* **Iterative** : O(V) for explicit stack
* **Visited set** : Always O(V)

```
Worst Case Scenario (Linear Graph):
1 → 2 → 3 → 4 → 5 → 6

Stack depth = 6 nodes = O(V)
```

## Advanced DFS Techniques for Interviews

### DFS with Backtracking and State Management

```python
def solve_maze(maze, start, end):
    """
    Find path through maze with obstacles
    """
    rows, cols = len(maze), len(maze[0])
    path = []
  
    def dfs(r, c):
        # Boundary check or obstacle
        if (r < 0 or r >= rows or c < 0 or c >= cols or 
            maze[r][c] == 1):  # 1 = wall
            return False
      
        # Add to current path
        path.append((r, c))
      
        # Reached destination
        if (r, c) == end:
            return True
      
        # Mark as visited (temporarily)
        maze[r][c] = 1
      
        # Try all 4 directions
        directions = [(0,1), (1,0), (0,-1), (-1,0)]
        for dr, dc in directions:
            if dfs(r + dr, c + dc):
                return True
      
        # Backtrack: remove from path and unmark
        path.pop()
        maze[r][c] = 0
        return False
  
    if dfs(start[0], start[1]):
        return path
    return None
```

**Key backtracking concepts:**

* **State modification** : We temporarily mark cells as visited
* **State restoration** : We undo changes when backtracking
* **Path tracking** : We build the solution incrementally

## DFS vs BFS: When to Choose What

> **DFS is best for** : Path finding, cycle detection, topological sorting, maze solving
> **BFS is best for** : Shortest path (unweighted), level-order traversal, minimum steps

```
DFS Exploration Pattern:
    1
   / \
  2   3
 /   / \
4   5   6

DFS Order: 1 → 2 → 4 → 3 → 5 → 6
BFS Order: 1 → 2 → 3 → 4 → 5 → 6
```

## Common Interview Mistakes and How to Avoid Them

### Mistake 1: Forgetting to Handle Cycles

```python
# WRONG: Can cause infinite recursion
def dfs_wrong(graph, node):
    for neighbor in graph[node]:
        dfs_wrong(graph, neighbor)  # No visited check!

# CORRECT: Always check visited
def dfs_correct(graph, node, visited):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs_correct(graph, neighbor, visited)
```

### Mistake 2: Modifying Input During DFS

```python
# WRONG: Permanently modifies the graph
def dfs_wrong(graph, node):
    graph[node] = []  # Destroys original graph!
  
# CORRECT: Use separate visited structure
def dfs_correct(graph, node, visited):
    visited.add(node)  # External tracking
```

## Putting It All Together: A Complete Interview Solution

Let's solve a classic problem: **"Number of Connected Components in Undirected Graph"**

```python
def count_components(n, edges):
    """
    Given n nodes (0 to n-1) and list of edges,
    return number of connected components
    """
    # Build adjacency list
    graph = {i: [] for i in range(n)}
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
  
    visited = set()
    components = 0
  
    def dfs(node):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)
  
    # Count components
    for node in range(n):
        if node not in visited:
            dfs(node)
            components += 1
  
    return components

# Example
edges = [[0,1], [1,2], [3,4]]
result = count_components(5, edges)
print(f"Components: {result}")  # Output: 2
```

> **Interview Success Strategy** : Always start by clarifying the problem, draw out examples, then code step by step while explaining your thought process.

DFS is your Swiss Army knife for graph problems. Master these patterns, understand the underlying principles, and you'll be ready to tackle any graph challenge that comes your way in your FAANG interviews!
