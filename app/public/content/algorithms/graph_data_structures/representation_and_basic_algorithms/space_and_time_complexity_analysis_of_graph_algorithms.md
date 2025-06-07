# Space and Time Complexity Analysis of Graph Algorithms for FAANG Interviews

## Understanding Complexity Analysis from First Principles

Before diving into graph algorithms, let's establish the fundamental concepts that form the backbone of complexity analysis.

> **Core Principle** : Complexity analysis measures how an algorithm's resource consumption (time and space) grows as the input size increases. It's not about exact measurements, but about growth patterns.

### What is Time Complexity?

Time complexity represents how the number of operations in an algorithm grows with input size. We use Big O notation to describe this growth in the worst-case scenario.

 **Think of it like this** : If you're organizing books on shelves, time complexity tells you how much longer it takes as you add more books to organize.

```python
# O(1) - Constant Time
def get_first_vertex(graph):
    """Always takes the same time regardless of graph size"""
    if graph:
        return list(graph.keys())[0]
    return None

# This operation doesn't depend on how many vertices exist
```

 **Explanation** : This function accesses the first element, which takes the same time whether we have 10 vertices or 10,000 vertices.

```python
# O(n) - Linear Time
def count_vertices(graph):
    """Time grows linearly with number of vertices"""
    count = 0
    for vertex in graph:
        count += 1
    return count

# If we double the vertices, we roughly double the time
```

 **Explanation** : Here we iterate through each vertex once. If we have `n` vertices, we perform `n` operations.

### What is Space Complexity?

Space complexity measures how much additional memory an algorithm needs as input size grows.

> **Key Insight** : We typically ignore the space needed to store the input itself and focus on extra space the algorithm requires.

```python
# O(1) - Constant Space
def has_vertex(graph, target):
    """Uses same extra memory regardless of graph size"""
    return target in graph

# Only uses a few variables, no matter how big the graph is
```

```python
# O(n) - Linear Space
def get_all_vertices(graph):
    """Creates a list that grows with input size"""
    vertices = []
    for vertex in graph:
        vertices.append(vertex)
    return vertices

# The vertices list grows with the number of vertices in graph
```

 **Explanation** : We create a new list that stores all vertices, so if the graph has `n` vertices, our extra space is proportional to `n`.

## Graph Representations and Their Complexity Impact

The way we represent graphs fundamentally affects the complexity of our algorithms. Let's examine the two primary representations.

### Adjacency List Representation

```python
# Adjacency List - Most common in interviews
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D'],
    'C': ['A', 'D'],
    'D': ['B', 'C']
}
```

 **Space Complexity** : O(V + E)

* V vertices in the dictionary keys
* E edges total across all lists

 **Why this matters** : Most graph problems in FAANG interviews assume adjacency list representation because it's space-efficient for sparse graphs (common in real applications).

### Adjacency Matrix Representation

```python
# Adjacency Matrix - Less common but important to understand
import numpy as np

# For 4 vertices (A=0, B=1, C=2, D=3)
matrix = [
    [0, 1, 1, 0],  # A connects to B, C
    [1, 0, 0, 1],  # B connects to A, D
    [1, 0, 0, 1],  # C connects to A, D
    [0, 1, 1, 0]   # D connects to B, C
]
```

 **Space Complexity** : O(V²)

* Always uses V² space regardless of edge count

> **Interview Tip** : Adjacency matrices are useful when you need O(1) edge lookup, but they waste space for sparse graphs. In FAANG interviews, mention this trade-off explicitly.

## Core Graph Algorithms: Detailed Analysis

### Depth-First Search (DFS)

DFS explores as far as possible along each branch before backtracking. Let's analyze it step by step.

```python
def dfs_recursive(graph, start, visited=None):
    """
    Recursive DFS implementation
  
    Args:
        graph: adjacency list representation
        start: starting vertex
        visited: set of visited vertices
    """
    if visited is None:
        visited = set()
  
    # Mark current vertex as visited
    visited.add(start)
    print(f"Visiting: {start}")
  
    # Explore all unvisited neighbors
    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)
  
    return visited
```

 **Time Complexity Analysis** :

* We visit each vertex exactly once: O(V)
* For each vertex, we examine all its edges: O(E)
* **Total: O(V + E)**

 **Space Complexity Analysis** :

* Visited set stores at most V vertices: O(V)
* Recursion stack can go V levels deep in worst case: O(V)
* **Total: O(V)**

> **Critical Interview Point** : The space complexity of recursive DFS can be problematic for deep graphs due to stack overflow. Always mention the iterative alternative.

```python
def dfs_iterative(graph, start):
    """
    Iterative DFS using explicit stack
    Avoids recursion depth issues
    """
    visited = set()
    stack = [start]
  
    while stack:
        # Pop from stack (LIFO behavior)
        current = stack.pop()
      
        if current not in visited:
            visited.add(current)
            print(f"Visiting: {current}")
          
            # Add unvisited neighbors to stack
            for neighbor in graph.get(current, []):
                if neighbor not in visited:
                    stack.append(neighbor)
  
    return visited
```

 **Explanation** : The iterative version uses an explicit stack instead of the call stack, giving us better control over memory usage while maintaining the same time and space complexity.

### Breadth-First Search (BFS)

BFS explores all vertices at the current depth before moving to the next depth level.

```python
from collections import deque

def bfs(graph, start):
    """
    BFS implementation using queue
  
    Key insight: BFS guarantees shortest path in unweighted graphs
    """
    visited = set()
    queue = deque([start])
    visited.add(start)
  
    while queue:
        # Remove from front of queue (FIFO behavior)
        current = queue.popleft()
        print(f"Visiting: {current}")
      
        # Add all unvisited neighbors to queue
        for neighbor in graph.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
  
    return visited
```

 **Time Complexity** : O(V + E)

* Same as DFS: visit each vertex once, examine each edge once

 **Space Complexity** : O(V)

* Queue can contain at most V vertices
* Visited set contains at most V vertices

> **Key Difference from DFS** : BFS uses O(V) space in the queue/visited set, while recursive DFS uses O(V) space in the call stack. For very wide graphs, BFS might use more queue space than DFS uses stack space.

### Finding Connected Components

This is a common FAANG interview question that builds on DFS/BFS.

```python
def count_connected_components(graph):
    """
    Count number of connected components in undirected graph
  
    Strategy: Run DFS from each unvisited vertex
    Each DFS call finds one complete component
    """
    visited = set()
    component_count = 0
  
    # Check every vertex as potential starting point
    for vertex in graph:
        if vertex not in visited:
            # Found a new component
            component_count += 1
          
            # Mark all vertices in this component as visited
            dfs_component(graph, vertex, visited)
  
    return component_count

def dfs_component(graph, start, visited):
    """Helper function to mark all vertices in a component"""
    visited.add(start)
  
    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            dfs_component(graph, neighbor, visited)
```

 **Time Complexity Analysis** :

* We visit each vertex exactly once across all DFS calls: O(V)
* We examine each edge exactly once: O(E)
* **Total: O(V + E)**

 **Space Complexity** : O(V) for the visited set and recursion stack

 **Explanation** : Even though we have nested loops, each vertex is processed exactly once. The outer loop runs V times, but the inner DFS calls collectively visit all V vertices just once.

## Advanced Graph Algorithms

### Dijkstra's Algorithm

Used for finding shortest paths in weighted graphs with non-negative weights.

```python
import heapq

def dijkstra(graph, start):
    """
    Find shortest distances from start to all vertices
  
    Key insight: Always process the closest unvisited vertex next
    This greedy choice leads to optimal solution
    """
    # Initialize distances
    distances = {vertex: float('infinity') for vertex in graph}
    distances[start] = 0
  
    # Priority queue: (distance, vertex)
    pq = [(0, start)]
    visited = set()
  
    while pq:
        # Get vertex with minimum distance
        current_dist, current = heapq.heappop(pq)
      
        # Skip if already processed with better distance
        if current in visited:
            continue
          
        visited.add(current)
      
        # Update distances to neighbors
        for neighbor, weight in graph.get(current, []):
            new_distance = current_dist + weight
          
            if new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                heapq.heappush(pq, (new_distance, neighbor))
  
    return distances
```

 **Time Complexity Analysis** :

* Each vertex is added to priority queue at most once per edge: O(E) insertions
* Each heap operation takes O(log V) time
* **Total: O((V + E) log V)**

 **Space Complexity** : O(V)

* Distances dictionary: O(V)
* Priority queue: O(V) in worst case
* Visited set: O(V)

> **FAANG Interview Insight** : Dijkstra's algorithm is a classic example where the choice of data structure (priority queue) directly affects complexity. Using a simple array instead of a heap would give O(V²) time complexity.

### Detecting Cycles in Directed Graphs

```python
def has_cycle_directed(graph):
    """
    Detect cycle in directed graph using DFS with coloring
  
    White (0): Unvisited
    Gray (1): Currently being processed (in recursion stack)
    Black (2): Completely processed
    """
    # 0 = white, 1 = gray, 2 = black
    colors = {vertex: 0 for vertex in graph}
  
    def dfs_visit(vertex):
        colors[vertex] = 1  # Mark as gray (processing)
      
        for neighbor in graph.get(vertex, []):
            if colors[neighbor] == 1:  # Back edge found!
                return True
            elif colors[neighbor] == 0 and dfs_visit(neighbor):
                return True
      
        colors[vertex] = 2  # Mark as black (done)
        return False
  
    # Check each vertex as potential start
    for vertex in graph:
        if colors[vertex] == 0:
            if dfs_visit(vertex):
                return True
  
    return False
```

 **Time Complexity** : O(V + E)
 **Space Complexity** : O(V)

 **Explanation** : The three-color approach is crucial here. A cycle exists if we encounter a gray vertex (currently being processed) from another gray vertex, indicating a back edge in the DFS tree.

## Interview-Specific Complexity Considerations

### Space Optimization Techniques

```python
# Space-optimized BFS for level-order processing
def bfs_levels_optimized(graph, start):
    """
    Process graph level by level with O(width) space instead of O(V)
    Useful when graph is very deep but narrow
    """
    current_level = [start]
    visited = {start}
    level = 0
  
    while current_level:
        print(f"Level {level}: {current_level}")
        next_level = []
      
        for vertex in current_level:
            for neighbor in graph.get(vertex, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    next_level.append(neighbor)
      
        current_level = next_level
        level += 1
```

 **Space Complexity** : O(max_width + V)

* Instead of storing all vertices in queue simultaneously
* Only store current and next level

> **Pro Tip for FAANG Interviews** : Always discuss space optimizations. Interviewers love candidates who think about memory efficiency, especially for large-scale systems.

### Common Complexity Traps

```python
# INEFFICIENT: O(V²) time due to repeated 'in' checks
def inefficient_bfs(graph, start):
    queue = [start]
    visited = []  # Using list instead of set!
  
    while queue:
        current = queue.pop(0)
        if current not in visited:  # O(V) operation!
            visited.append(current)
            for neighbor in graph.get(current, []):
                queue.append(neighbor)

# EFFICIENT: O(V + E) time with proper data structures
def efficient_bfs(graph, start):
    queue = deque([start])
    visited = set()  # O(1) lookup!
  
    while queue:
        current = queue.popleft()
        if current not in visited:
            visited.add(current)
            for neighbor in graph.get(current, []):
                queue.append(neighbor)
```

## Graph Algorithm Complexity Cheat Sheet

| Algorithm        | Time Complexity  | Space Complexity | Use Case                   |
| ---------------- | ---------------- | ---------------- | -------------------------- |
| DFS              | O(V + E)         | O(V)             | Connectivity, Cycles       |
| BFS              | O(V + E)         | O(V)             | Shortest Path (unweighted) |
| Dijkstra         | O((V + E) log V) | O(V)             | Shortest Path (weighted)   |
| Bellman-Ford     | O(VE)            | O(V)             | Negative weights           |
| Floyd-Warshall   | O(V³)           | O(V²)           | All pairs shortest path    |
| Topological Sort | O(V + E)         | O(V)             | Dependency resolution      |

> **Final Interview Strategy** : When analyzing graph algorithms, always start by identifying the graph representation, then work through the algorithm step by step, counting operations and space usage. Practice explaining your reasoning clearly, as this demonstrates deep understanding to interviewers.

 **Remember** : In FAANG interviews, it's not just about knowing the complexity—it's about understanding why the complexity is what it is and being able to optimize when needed.
