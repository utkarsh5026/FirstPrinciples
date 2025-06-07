# Graph Traversal: From First Principles to FAANG Mastery

## Understanding Graphs: The Foundation

Let's start from the very beginning. Imagine you're looking at a map of cities connected by roads. Each city is a **node** (or vertex), and each road is an **edge** connecting two cities. This is exactly what a graph represents in computer science.

> **Core Principle** : A graph is a collection of nodes (vertices) connected by edges. It's one of the most fundamental data structures for modeling relationships between entities.

### What Makes Graphs Special?

Unlike linear data structures (arrays, linked lists) or hierarchical ones (trees), graphs can represent complex, non-linear relationships:

```
Simple Graph Example:
    A --- B
    |   / |
    |  /  |
    | /   |
    C --- D
```

In this graph:

* Nodes: A, B, C, D
* Edges: A-B, A-C, B-C, B-D, C-D

### Graph Representation in Code

Let's implement the most common representations:

```python
# Adjacency List Representation (Most Common)
class Graph:
    def __init__(self):
        self.graph = {}
  
    def add_edge(self, u, v):
        # Add edge from u to v
        if u not in self.graph:
            self.graph[u] = []
        if v not in self.graph:
            self.graph[v] = []
      
        self.graph[u].append(v)
        self.graph[v].append(u)  # For undirected graph
  
    def get_neighbors(self, node):
        return self.graph.get(node, [])
```

**Why Adjacency List?**

* Space efficient: O(V + E) where V = vertices, E = edges
* Fast neighbor lookup: O(1) to get all neighbors
* Dynamic: Easy to add/remove edges

## Graph Traversal: The Heart of Graph Algorithms

> **Fundamental Question** : How do we systematically visit every node in a graph exactly once?

Graph traversal is like exploring a maze with a specific strategy. There are two primary approaches:

1. **Depth-First Search (DFS)** : Go as deep as possible before backtracking
2. **Breadth-First Search (BFS)** : Explore all neighbors before going deeper

## Depth-First Search (DFS): The Deep Diver

### The Core Concept

DFS follows the principle: "Go as far as you can, then backtrack and try a different path."

```
DFS Traversal Example:
    A
   / \
  B   C
 /   / \
D   E   F

DFS Order: A → B → D → C → E → F
```

### DFS Implementation Patterns

**Pattern 1: Recursive DFS (Most Intuitive)**

```python
def dfs_recursive(graph, node, visited=None):
    if visited is None:
        visited = set()
  
    # Mark current node as visited
    visited.add(node)
    print(f"Visiting: {node}")
  
    # Recursively visit all unvisited neighbors
    for neighbor in graph.get_neighbors(node):
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)
  
    return visited
```

**What's happening here?**

* We use a `visited` set to track explored nodes
* For each node, we mark it visited, then recursively explore unvisited neighbors
* The call stack handles the "backtracking" automatically

**Pattern 2: Iterative DFS (Stack-Based)**

```python
def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
  
    while stack:
        # Pop from stack (LIFO - Last In, First Out)
        node = stack.pop()
      
        if node not in visited:
            visited.add(node)
            print(f"Visiting: {node}")
          
            # Add all unvisited neighbors to stack
            for neighbor in graph.get_neighbors(node):
                if neighbor not in visited:
                    stack.append(neighbor)
  
    return visited
```

 **Key Insight** : The stack mimics the function call stack in recursive DFS.

### DFS Applications in FAANG Interviews

> **Pattern Recognition** : DFS excels at problems involving paths, cycles, and exhaustive exploration.

**Application 1: Path Finding**

```python
def find_path_dfs(graph, start, end, path=None):
    if path is None:
        path = []
  
    path = path + [start]
  
    # Base case: reached destination
    if start == end:
        return path
  
    # Explore all neighbors
    for neighbor in graph.get_neighbors(start):
        if neighbor not in path:  # Avoid cycles
            new_path = find_path_dfs(graph, neighbor, end, path)
            if new_path:
                return new_path
  
    return None  # No path found
```

**Application 2: Cycle Detection**

```python
def has_cycle_dfs(graph):
    visited = set()
    rec_stack = set()  # Recursion stack for current path
  
    def dfs_helper(node):
        visited.add(node)
        rec_stack.add(node)
      
        for neighbor in graph.get_neighbors(node):
            if neighbor not in visited:
                if dfs_helper(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True  # Back edge found = cycle
      
        rec_stack.remove(node)  # Remove from current path
        return False
  
    for node in graph.graph:
        if node not in visited:
            if dfs_helper(node):
                return True
  
    return False
```

## Breadth-First Search (BFS): The Level Explorer

### The Core Concept

BFS explores nodes level by level, like ripples in a pond expanding outward.

```
BFS Traversal Example:
    A
   / \
  B   C
 /   / \
D   E   F

BFS Order: A → B → C → D → E → F
(Level 0: A, Level 1: B,C, Level 2: D,E,F)
```

### BFS Implementation

```python
from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    visited.add(start)
  
    while queue:
        # Dequeue from front (FIFO - First In, First Out)
        node = queue.popleft()
        print(f"Visiting: {node}")
      
        # Add all unvisited neighbors to queue
        for neighbor in graph.get_neighbors(node):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
  
    return visited
```

 **Critical Difference** : BFS uses a queue (FIFO) while DFS uses a stack (LIFO).

### BFS Applications in FAANG Interviews

> **Pattern Recognition** : BFS excels at shortest path problems and level-based exploration.

**Application 1: Shortest Path (Unweighted)**

```python
def shortest_path_bfs(graph, start, end):
    if start == end:
        return [start]
  
    visited = set([start])
    queue = deque([(start, [start])])  # (node, path_to_node)
  
    while queue:
        node, path = queue.popleft()
      
        for neighbor in graph.get_neighbors(node):
            if neighbor == end:
                return path + [neighbor]
          
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
  
    return None  # No path found
```

**Application 2: Level-Order Processing**

```python
def bfs_by_levels(graph, start):
    visited = set([start])
    current_level = [start]
    level = 0
  
    while current_level:
        print(f"Level {level}: {current_level}")
        next_level = []
      
        for node in current_level:
            for neighbor in graph.get_neighbors(node):
                if neighbor not in visited:
                    visited.add(neighbor)
                    next_level.append(neighbor)
      
        current_level = next_level
        level += 1
```

## Common FAANG Interview Patterns

### Pattern 1: Connected Components

> **Problem** : Find the number of disconnected components in a graph.

```python
def count_connected_components(graph):
    visited = set()
    components = 0
  
    def dfs(node):
        visited.add(node)
        for neighbor in graph.get_neighbors(node):
            if neighbor not in visited:
                dfs(neighbor)
  
    for node in graph.graph:
        if node not in visited:
            dfs(node)
            components += 1
  
    return components
```

 **Real Interview Example** : "Number of Islands" (LeetCode 200)

### Pattern 2: Topological Sorting

> **Application** : Course prerequisites, task scheduling, dependency resolution.

```python
def topological_sort_dfs(graph):
    visited = set()
    stack = []
  
    def dfs(node):
        visited.add(node)
      
        for neighbor in graph.get_neighbors(node):
            if neighbor not in visited:
                dfs(neighbor)
      
        stack.append(node)  # Add to stack after visiting all neighbors
  
    for node in graph.graph:
        if node not in visited:
            dfs(node)
  
    return stack[::-1]  # Reverse the stack
```

**Why does this work?**

* We add a node to the result only after visiting all its dependencies
* The reverse gives us the correct topological order

### Pattern 3: Bipartite Graph Detection

> **Problem** : Can we color the graph with two colors such that no adjacent nodes have the same color?

```python
def is_bipartite(graph):
    color = {}
  
    def dfs(node, c):
        color[node] = c
      
        for neighbor in graph.get_neighbors(node):
            if neighbor in color:
                if color[neighbor] == c:
                    return False  # Same color = not bipartite
            else:
                if not dfs(neighbor, 1 - c):  # Flip color
                    return False
      
        return True
  
    for node in graph.graph:
        if node not in color:
            if not dfs(node, 0):
                return False
  
    return True
```

## Advanced Problem-Solving Patterns

### Pattern 4: Graph Reconstruction

 **Problem** : Given edges, rebuild and analyze the graph structure.

```python
def solve_graph_problem(edges):
    # Step 1: Build the graph
    graph = {}
    for u, v in edges:
        if u not in graph:
            graph[u] = []
        if v not in graph:
            graph[v] = []
        graph[u].append(v)
        graph[v].append(u)
  
    # Step 2: Apply traversal algorithm
    # ... rest of solution
```

### Pattern 5: State Space Search

> **Advanced Concept** : Treating problem states as graph nodes.

```python
def solve_state_problem(initial_state, target_state):
    visited = set()
    queue = deque([(initial_state, 0)])  # (state, steps)
    visited.add(initial_state)
  
    while queue:
        current_state, steps = queue.popleft()
      
        if current_state == target_state:
            return steps
      
        # Generate all possible next states
        for next_state in get_next_states(current_state):
            state_key = state_to_string(next_state)
            if state_key not in visited:
                visited.add(state_key)
                queue.append((next_state, steps + 1))
  
    return -1  # No solution
```

 **Example** : Sliding puzzle, word ladder, etc.

## Interview Success Strategies

### Strategy 1: Pattern Recognition

> **Key Insight** : Most graph problems follow one of a few core patterns.

 **Quick Decision Tree** :

```
Is it about shortest path? → BFS
Is it about exploring all possibilities? → DFS
Is it about dependencies/ordering? → Topological Sort
Is it about grouping/partitioning? → Connected Components
```

### Strategy 2: Template Approach

 **Standard DFS Template** :

```python
def dfs_template(graph, start, target_condition):
    visited = set()
  
    def dfs(node):
        if target_condition(node):
            return True  # or the result
      
        visited.add(node)
      
        for neighbor in graph.get_neighbors(node):
            if neighbor not in visited:
                if dfs(neighbor):
                    return True
      
        return False
  
    return dfs(start)
```

### Strategy 3: Complexity Analysis

> **Always Consider** : Time and Space complexity of your traversal.

 **DFS Complexity** :

* Time: O(V + E) - visit each vertex and edge once
* Space: O(V) - for visited set and recursion stack

 **BFS Complexity** :

* Time: O(V + E) - visit each vertex and edge once
* Space: O(V) - for visited set and queue

## Practical Tips for FAANG Interviews

### Tip 1: Start Simple

Always implement the basic traversal first, then modify for the specific problem.

### Tip 2: Handle Edge Cases

```python
# Always check for empty graph
if not graph or not start:
    return []

# Handle single node
if start not in graph:
    return [start]
```

### Tip 3: Choose the Right Tool

> **DFS when** : You need to explore all possibilities, find any path, or detect cycles.

> **BFS when** : You need the shortest path, level-by-level processing, or minimum steps.

### Tip 4: Practice Problem Categories

 **Essential Problems** :

1. Number of Islands (Connected Components)
2. Course Schedule (Topological Sort + Cycle Detection)
3. Word Ladder (BFS State Space)
4. Clone Graph (DFS/BFS + Hash Map)
5. Surrounded Regions (DFS Boundary)

---

Graph traversal is the foundation of solving complex relationship and connectivity problems. Master these patterns, understand when to apply each technique, and you'll be well-equipped to tackle any graph problem in your FAANG interviews. Remember: the key is not just knowing the algorithms, but recognizing which pattern fits each problem scenario.
