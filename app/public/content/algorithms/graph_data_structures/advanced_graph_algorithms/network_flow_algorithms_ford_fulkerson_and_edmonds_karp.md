# Network Flow Algorithms: Ford-Fulkerson and Edmonds-Karp

## Understanding the Foundation: What is a Flow Network?

Before diving into algorithms, let's build our understanding from the ground up. Imagine you're an engineer tasked with designing a water distribution system for a city.

> **Core Concept** : A flow network is a directed graph where each edge has a capacity - the maximum amount of "stuff" (water, data, traffic) that can flow through it per unit time.

### The Mathematical Foundation

A flow network consists of:

* **Graph G = (V, E)** : Vertices (nodes) and directed edges
* **Source s** : Where flow originates
* **Sink t** : Where flow terminates
* **Capacity function c(u,v)** : Maximum flow allowed from vertex u to v
* **Flow function f(u,v)** : Actual flow from u to v

### The Three Sacred Rules of Flow

Every valid flow must satisfy these constraints:

1. **Capacity Constraint** : `f(u,v) ≤ c(u,v)` for all edges
2. **Skew Symmetry** : `f(u,v) = -f(v,u)` (flow in opposite direction is negative)
3. **Flow Conservation** : For every vertex except source and sink, flow in = flow out

Let's visualize this with a simple example:

```
    Source(s) --10--> Node(1) --8--> Sink(t)
         |                |          ^
         15               6          |
         |                |          7
         v                v          |
      Node(2) --------12------------>
```

> **Key Insight** : The maximum flow from source to sink is limited by the bottleneck - the smallest capacity along any path from s to t.

## The Ford-Fulkerson Method: The Foundation Algorithm

Ford-Fulkerson isn't just one algorithm - it's a **method** or approach that can be implemented in different ways.

### The Core Idea: Augmenting Paths

> **Central Principle** : Keep finding paths from source to sink with available capacity, and push flow through them until no more paths exist.

The algorithm works by finding **augmenting paths** - paths from source to sink where we can increase flow.

### Understanding Residual Networks

This is where it gets interesting. We create a **residual network** that shows remaining capacities:

```python
def create_residual_graph(graph, flow):
    """
    Creates residual graph showing remaining capacities
  
    For each edge (u,v) with capacity c and current flow f:
    - Forward edge has residual capacity: c - f
    - Backward edge has residual capacity: f
    """
    residual = {}
  
    for u in graph:
        residual[u] = {}
        for v in graph[u]:
            # Forward edge: remaining capacity
            residual[u][v] = graph[u][v] - flow.get((u,v), 0)
          
            # Backward edge: current flow (can be "undone")
            if v not in residual:
                residual[v] = {}
            residual[v][u] = flow.get((u,v), 0)
  
    return residual
```

> **Why Backward Edges?** : They allow us to "undo" previous flow decisions. If we pushed flow through a path but later find a better routing, backward edges let us redirect that flow.

### Ford-Fulkerson Implementation

```python
def ford_fulkerson_basic(graph, source, sink):
    """
    Basic Ford-Fulkerson using DFS to find augmenting paths
  
    Args:
        graph: adjacency list with capacities {u: {v: capacity}}
        source: starting vertex
        sink: ending vertex
  
    Returns:
        maximum flow value
    """
  
    def dfs_find_path(graph, source, sink, visited):
        """Find any path from source to sink with positive capacity"""
        if source == sink:
            return [sink]
      
        visited.add(source)
      
        for neighbor in graph.get(source, {}):
            if neighbor not in visited and graph[source][neighbor] > 0:
                path = dfs_find_path(graph, neighbor, sink, visited)
                if path:
                    return [source] + path
      
        return None
  
    def find_bottleneck(graph, path):
        """Find minimum capacity along the path"""
        min_capacity = float('inf')
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            min_capacity = min(min_capacity, graph[u][v])
        return min_capacity
  
    def update_residual_graph(graph, path, flow):
        """Update residual capacities after pushing flow"""
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            # Decrease forward capacity
            graph[u][v] -= flow
            # Increase backward capacity
            if v not in graph:
                graph[v] = {}
            if u not in graph[v]:
                graph[v][u] = 0
            graph[v][u] += flow
  
    # Create residual graph (copy of original)
    residual_graph = {}
    for u in graph:
        residual_graph[u] = graph[u].copy()
  
    max_flow = 0
  
    # Keep finding augmenting paths
    while True:
        visited = set()
        path = dfs_find_path(residual_graph, source, sink, visited)
      
        if not path:  # No more augmenting paths
            break
      
        # Find bottleneck capacity
        flow = find_bottleneck(residual_graph, path)
        max_flow += flow
      
        # Update residual graph
        update_residual_graph(residual_graph, path, flow)
      
        print(f"Found path: {' -> '.join(path)}, flow: {flow}")
  
    return max_flow
```

### Example Walkthrough

Let's trace through a simple example:

```python
# Example network
graph = {
    's': {'a': 10, 'b': 10},
    'a': {'b': 2, 't': 10},
    'b': {'t': 10},
    't': {}
}

print("Initial graph:")
print("s -> a: 10")
print("s -> b: 10") 
print("a -> b: 2")
print("a -> t: 10")
print("b -> t: 10")
```

 **Step-by-step execution** :

1. **First iteration** : Find path s → a → t, push flow 10
2. **Second iteration** : Find path s → b → t, push flow 10
3. **Third iteration** : No more paths available

> **Time Complexity Issue** : Basic Ford-Fulkerson can be slow because DFS might find inefficient paths. In the worst case, it's O(E × max_flow).

## Edmonds-Karp: The BFS Optimization

The key insight that led to Edmonds-Karp:

> **Problem with DFS** : It might find very long paths with small bottlenecks, leading to many iterations.
>
> **Solution** : Use BFS to find the shortest augmenting path (in terms of number of edges).

### Why BFS Makes It Faster

Using BFS guarantees:

1. We find paths with minimum number of edges
2. The number of iterations is bounded by O(VE)
3. Total time complexity becomes O(VE²)

### Edmonds-Karp Implementation

```python
from collections import deque

def edmonds_karp(graph, source, sink):
    """
    Edmonds-Karp algorithm: Ford-Fulkerson with BFS
  
    Key improvement: Uses BFS to find shortest augmenting paths
    This guarantees O(VE²) time complexity
    """
  
    def bfs_find_path(graph, source, sink):
        """
        BFS to find shortest path with positive capacity
        Returns: (path, bottleneck_capacity) or (None, 0)
        """
        queue = deque([(source, [source], float('inf'))])
        visited = {source}
      
        while queue:
            current, path, min_capacity = queue.popleft()
          
            if current == sink:
                return path, min_capacity
          
            # Explore all neighbors
            for neighbor in graph.get(current, {}):
                if neighbor not in visited and graph[current][neighbor] > 0:
                    visited.add(neighbor)
                    new_capacity = min(min_capacity, graph[current][neighbor])
                    new_path = path + [neighbor]
                    queue.append((neighbor, new_path, new_capacity))
      
        return None, 0  # No path found
  
    def update_residual_graph(graph, path, flow):
        """Update residual graph after pushing flow through path"""
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            # Reduce forward edge
            graph[u][v] -= flow
            # Add/increase backward edge
            if v not in graph:
                graph[v] = {}
            graph[v][u] = graph[v].get(u, 0) + flow
  
    # Initialize residual graph
    residual_graph = {}
    for u in graph:
        residual_graph[u] = {}
        for v in graph[u]:
            residual_graph[u][v] = graph[u][v]
  
    max_flow = 0
    iteration = 0
  
    print("Starting Edmonds-Karp algorithm...")
  
    while True:
        # Find shortest augmenting path using BFS
        path, bottleneck = bfs_find_path(residual_graph, source, sink)
      
        if not path:  # No more augmenting paths
            break
      
        iteration += 1
        max_flow += bottleneck
      
        print(f"Iteration {iteration}:")
        print(f"  Path: {' -> '.join(path)}")
        print(f"  Bottleneck: {bottleneck}")
        print(f"  Total flow so far: {max_flow}")
      
        # Update residual graph
        update_residual_graph(residual_graph, path, bottleneck)
  
    print(f"\nFinal maximum flow: {max_flow}")
    return max_flow
```

### Detailed Example with Edmonds-Karp

```python
# More complex example
def run_example():
    graph = {
        's': {'a': 16, 'b': 13},
        'a': {'b': 10, 'c': 12},
        'b': {'a': 4, 'd': 14},
        'c': {'b': 9, 't': 20},
        'd': {'c': 7, 't': 4},
        't': {}
    }
  
    print("Network topology:")
    print("s -> a: 16,  s -> b: 13")
    print("a -> b: 10,  a -> c: 12") 
    print("b -> a: 4,   b -> d: 14")
    print("c -> b: 9,   c -> t: 20")
    print("d -> c: 7,   d -> t: 4")
    print("\n" + "="*40 + "\n")
  
    result = edmonds_karp(graph, 's', 't')
    return result

# Run the example
max_flow = run_example()
```

## FAANG Interview Perspective

### Common Interview Patterns

> **Pattern Recognition** : Network flow problems often disguise themselves as other types of problems in interviews.

#### 1. **Maximum Bipartite Matching**

```python
def max_bipartite_matching(left_nodes, right_nodes, edges):
    """
    Convert bipartite matching to max flow problem
  
    Approach:
    1. Add super source connected to all left nodes (capacity 1)
    2. Add super sink connected to all right nodes (capacity 1)  
    3. All original edges have capacity 1
    4. Max flow = maximum matching
    """
    graph = {'source': {}, 'sink': {}}
  
    # Connect source to left nodes
    for node in left_nodes:
        graph['source'][node] = 1
        graph[node] = {}
  
    # Connect right nodes to sink
    for node in right_nodes:
        graph[node] = {'sink': 1}
  
    # Add bipartite edges
    for u, v in edges:
        if u in left_nodes and v in right_nodes:
            graph[u][v] = 1
  
    return edmonds_karp(graph, 'source', 'sink')
```

#### 2. **Multiple Sources/Sinks**

```python
def multiple_source_sink_flow(graph, sources, sinks):
    """
    Handle multiple sources and sinks
  
    Technique: Add super source and super sink
    """
    # Add super source connected to all sources
    graph['super_source'] = {}
    for source in sources:
        graph['super_source'][source] = float('inf')
  
    # Connect all sinks to super sink
    graph['super_sink'] = {}
    for sink in sinks:
        if sink not in graph:
            graph[sink] = {}
        graph[sink]['super_sink'] = float('inf')
  
    return edmonds_karp(graph, 'super_source', 'super_sink')
```

### Time and Space Complexity Analysis

> **Edmonds-Karp Complexity** :
>
> * **Time** : O(VE²) where V = vertices, E = edges
> * **Space** : O(V²) for adjacency matrix or O(V + E) for adjacency list

**Why O(VE²)?**

1. Each BFS takes O(E) time
2. There are at most O(VE) iterations
3. Total: O(VE) × O(E) = O(VE²)

### Interview Tips and Common Pitfalls

> **Red Flags to Watch For** :
>
> 1. **Forgetting backward edges** - Critical for the algorithm's correctness
> 2. **Not handling the residual graph properly** - Must update both forward and backward capacities
> 3. **Infinite loops** - Make sure to check if capacity > 0 before exploring

#### Common Interview Questions

**Q1: "How would you find the maximum number of edge-disjoint paths?"**

* Convert to max flow with all edge capacities = 1
* Each unit of flow represents one edge-disjoint path

**Q2: "What if edges have minimum flow requirements?"**

* Transform to circulation problem
* Add demand/supply to nodes

### Practical Implementation Tips

```python
class MaxFlowSolver:
    """
    Clean, interview-friendly implementation
    """
  
    def __init__(self, n):
        """Initialize with n vertices (0 to n-1)"""
        self.n = n
        self.graph = [[0] * n for _ in range(n)]
  
    def add_edge(self, from_vertex, to_vertex, capacity):
        """Add edge with given capacity"""
        self.graph[from_vertex][to_vertex] = capacity
  
    def bfs_find_path(self, source, sink, parent):
        """BFS to find augmenting path"""
        visited = [False] * self.n
        queue = deque([source])
        visited[source] = True
      
        while queue:
            u = queue.popleft()
          
            for v in range(self.n):
                if not visited[v] and self.graph[u][v] > 0:
                    visited[v] = True
                    parent[v] = u
                    if v == sink:
                        return True
                    queue.append(v)
      
        return False
  
    def edmonds_karp(self, source, sink):
        """Main algorithm"""
        parent = [-1] * self.n
        max_flow = 0
      
        # Find augmenting paths until none exist
        while self.bfs_find_path(source, sink, parent):
            # Find bottleneck capacity
            path_flow = float('inf')
            s = sink
          
            while s != source:
                path_flow = min(path_flow, self.graph[parent[s]][s])
                s = parent[s]
          
            # Update residual graph
            v = sink
            while v != source:
                u = parent[v]
                self.graph[u][v] -= path_flow  # Forward edge
                self.graph[v][u] += path_flow  # Backward edge
                v = parent[v]
          
            max_flow += path_flow
      
        return max_flow

# Example usage in interview setting
def solve_flow_problem():
    """
    Example: 4 vertices, find max flow from 0 to 3
    """
    solver = MaxFlowSolver(4)
  
    # Add edges: (from, to, capacity)
    solver.add_edge(0, 1, 16)
    solver.add_edge(0, 2, 13)
    solver.add_edge(1, 2, 10)
    solver.add_edge(1, 3, 12)
    solver.add_edge(2, 1, 4)
    solver.add_edge(2, 3, 14)
  
    result = solver.edmonds_karp(0, 3)
    print(f"Maximum flow from 0 to 3: {result}")
  
    return result
```

> **Interview Success Strategy** :
>
> 1. **Recognize** when a problem can be modeled as max flow
> 2. **Explain** the transformation clearly
> 3. **Implement** Edmonds-Karp efficiently
> 4. **Analyze** time/space complexity
> 5. **Handle** edge cases (no path, multiple components)

The beauty of network flow algorithms lies in their ability to solve seemingly different problems through a unified approach. Master these fundamentals, and you'll have a powerful tool for tackling complex optimization problems in technical interviews.
