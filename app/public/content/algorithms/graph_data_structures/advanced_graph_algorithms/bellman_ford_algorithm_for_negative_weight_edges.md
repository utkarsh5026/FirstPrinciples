# The Bellman-Ford Algorithm: Mastering Negative Weight Edges for FAANG Interviews

## Understanding the Foundation: What Are Shortest Paths?

Let's start from the very beginning. In graph theory, a **shortest path** between two vertices is the path that minimizes some cost function - typically the sum of edge weights along the path.

> **Core Principle** : In real-world scenarios, "weights" represent costs, distances, time, or even negative benefits (like earning money while traveling a route).

Consider this simple example:

```
A ----5---- B
|           |
3           2
|           |
C ----1---- D
```

The shortest path from A to D could be:

* A → B → D (cost: 5 + 2 = 7)
* A → C → D (cost: 3 + 1 = 4) ← This is shorter!

## The Problem with Dijkstra's Algorithm

Dijkstra's algorithm is the go-to solution for shortest paths, but it has a fundamental limitation:

> **Critical Limitation** : Dijkstra's algorithm fails when the graph contains negative weight edges.

Why does this happen? Let's understand through first principles:

 **Dijkstra's Core Assumption** : Once we've found the shortest path to a vertex, we never need to revisit it because all remaining edges have non-negative weights.

But with negative weights, this assumption breaks down:

```
    A
   / \
  5   -3
 /     \
B       C
 \     /
  -4  2
   \ /
    D
```

If we start from A:

1. Dijkstra might first go A → C (cost: -3)
2. Then mark C as "done"
3. But later, we discover A → B → D → C has a lower total cost!

This is why we need Bellman-Ford.

## Bellman-Ford Algorithm: The Complete Solution

The Bellman-Ford algorithm solves shortest paths even with negative weights by using a fundamentally different approach:

> **Key Insight** : Instead of greedily selecting the next closest vertex, Bellman-Ford systematically relaxes ALL edges multiple times.

### The Core Concept: Edge Relaxation

**Relaxation** is the process of updating distance estimates:

```python
def relax(u, v, weight, distances):
    """
    Try to improve the shortest path to vertex v
    by going through vertex u
    """
    if distances[u] + weight < distances[v]:
        distances[v] = distances[u] + weight
        return True  # Distance was improved
    return False  # No improvement
```

Let's trace through this concept:

```
Initial: distances = {A: 0, B: ∞, C: ∞}
Edge A→B (weight=5): relax(A, B, 5, distances)
- distances[A] + 5 = 0 + 5 = 5
- 5 < ∞, so distances[B] = 5

Edge A→C (weight=-3): relax(A, C, -3, distances)  
- distances[A] + (-3) = 0 + (-3) = -3
- -3 < ∞, so distances[C] = -3
```

## The Algorithm Step by Step

Here's the complete Bellman-Ford algorithm with detailed explanation:

```python
def bellman_ford(graph, source):
    """
    Find shortest paths from source to all vertices,
    handling negative weights and detecting negative cycles.
  
    Args:
        graph: Dictionary of adjacency lists
               {vertex: [(neighbor, weight), ...]}
        source: Starting vertex
  
    Returns:
        (distances, has_negative_cycle)
    """
    # Step 1: Initialize distances
    distances = {}
    for vertex in graph:
        distances[vertex] = float('inf')
    distances[source] = 0
  
    # Step 2: Relax all edges (V-1) times
    vertices = list(graph.keys())
    num_vertices = len(vertices)
  
    # Why V-1 iterations? We'll explain this crucial detail!
    for iteration in range(num_vertices - 1):
        # Track if any distance was updated in this iteration
        updated = False
      
        # Try to relax every single edge in the graph
        for u in graph:
            for v, weight in graph[u]:
                if distances[u] != float('inf'):
                    old_distance = distances[v]
                    new_distance = distances[u] + weight
                  
                    if new_distance < old_distance:
                        distances[v] = new_distance
                        updated = True
      
        # Optimization: if no updates occurred, we're done early
        if not updated:
            break
  
    # Step 3: Check for negative cycles
    has_negative_cycle = False
    for u in graph:
        for v, weight in graph[u]:
            if distances[u] != float('inf'):
                if distances[u] + weight < distances[v]:
                    has_negative_cycle = True
                    break
        if has_negative_cycle:
            break
  
    return distances, has_negative_cycle
```

### Why Exactly V-1 Iterations?

This is a crucial understanding for interviews:

> **Fundamental Theorem** : In a graph with V vertices, the shortest path between any two vertices can have at most V-1 edges (assuming no negative cycles).

 **Proof by contradiction** :

* If a shortest path had V or more edges, it would visit at least one vertex twice
* This creates a cycle, and we could remove that cycle to get a shorter path
* Therefore, V-1 edges are sufficient

**Each iteration** of Bellman-Ford guarantees that we find shortest paths with one more edge than the previous iteration:

* Iteration 1: Finds shortest paths with ≤ 1 edge
* Iteration 2: Finds shortest paths with ≤ 2 edges
* ...
* Iteration V-1: Finds shortest paths with ≤ V-1 edges

## Detailed Example: Tracing the Algorithm

Let's trace through a complete example:

```
Graph:
A --(-1)--> B
|           |
2           3
|           |
v           v
C --(-4)--> D
```

 **Step-by-step execution starting from A** :

```python
# Initial state
distances = {A: 0, B: ∞, C: ∞, D: ∞}

# Iteration 1: Relax all edges
# Edge A→B (-1): 0 + (-1) = -1 < ∞ ✓
distances = {A: 0, B: -1, C: ∞, D: ∞}

# Edge A→C (2): 0 + 2 = 2 < ∞ ✓  
distances = {A: 0, B: -1, C: 2, D: ∞}

# Edge B→D (3): -1 + 3 = 2 < ∞ ✓
distances = {A: 0, B: -1, C: 2, D: 2}

# Edge C→D (-4): 2 + (-4) = -2 < 2 ✓
distances = {A: 0, B: -1, C: 2, D: -2}

# Iteration 2: Continue relaxing...
# Most edges don't improve, but this shows the systematic approach
```

## Detecting Negative Cycles: The Critical Feature

One of Bellman-Ford's superpowers is detecting negative cycles:

> **Negative Cycle** : A cycle where the sum of edge weights is negative. If reachable from the source, shortest paths become undefined (can be made arbitrarily small).

```python
def detect_and_handle_negative_cycles(graph, source):
    """
    Enhanced version that not only detects negative cycles
    but also identifies which vertices are affected.
    """
    distances, has_negative_cycle = bellman_ford(graph, source)
  
    if not has_negative_cycle:
        return distances, []
  
    # Find vertices affected by negative cycles
    affected_vertices = set()
  
    # Run one more iteration to see what gets updated
    for u in graph:
        for v, weight in graph[u]:
            if distances[u] != float('inf'):
                if distances[u] + weight < distances[v]:
                    affected_vertices.add(v)
  
    # Propagate the effect (vertices reachable from affected ones)
    # are also affected
    queue = list(affected_vertices)
    while queue:
        current = queue.pop(0)
        for neighbor, _ in graph.get(current, []):
            if neighbor not in affected_vertices:
                affected_vertices.add(neighbor)
                queue.append(neighbor)
  
    return distances, list(affected_vertices)
```

## FAANG Interview Optimization: Space and Time Analysis

### Time Complexity: O(V × E)

* **V iterations** (worst case)
* **E edge relaxations** per iteration
* **Total** : O(V × E)

### Space Complexity: O(V)

* Distance array: O(V)
* No additional data structures needed

### Optimization for Sparse Graphs:

```python
def optimized_bellman_ford(edges, num_vertices, source):
    """
    Alternative implementation using edge list
    instead of adjacency list - often cleaner for interviews.
  
    Args:
        edges: List of (u, v, weight) tuples
        num_vertices: Number of vertices (0 to num_vertices-1)
        source: Source vertex
    """
    distances = [float('inf')] * num_vertices
    distances[source] = 0
  
    # Main algorithm
    for _ in range(num_vertices - 1):
        updated = False
        for u, v, weight in edges:
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                updated = True
      
        if not updated:  # Early termination optimization
            break
  
    # Negative cycle detection
    for u, v, weight in edges:
        if distances[u] != float('inf') and distances[u] + weight < distances[v]:
            return None  # Negative cycle detected
  
    return distances
```

## Common FAANG Interview Variations

### 1. **"Find if negative cycle exists"**

```python
def has_negative_cycle(edges, num_vertices):
    """Just detect negative cycle, don't need distances."""
    # Pick any vertex as source (cycle detection works from any start)
    distances = [float('inf')] * num_vertices
    distances[0] = 0
  
    # Standard Bellman-Ford relaxation
    for _ in range(num_vertices - 1):
        for u, v, weight in edges:
            if distances[u] != float('inf'):
                distances[v] = min(distances[v], distances[u] + weight)
  
    # Check for improvements in one more iteration
    for u, v, weight in edges:
        if distances[u] != float('inf') and distances[u] + weight < distances[v]:
            return True
  
    return False
```

### 2. **"Modified weights - can we make path costs zero?"**

This often appears as: *"You can decrease any edge weight by at most K. Can you make the shortest path from A to B equal to zero?"*

> **Key Insight** : This becomes a problem of finding if there exists a path where the total decrease needed is ≤ K.

## Mobile-Optimized Algorithm Visualization

```
Bellman-Ford Iteration Flow:
┌─────────────────────────┐
│     Initialize:         │
│   dist[source] = 0      │
│   dist[others] = ∞      │
└──────────┬──────────────┘
           │
           v
┌─────────────────────────┐
│   For i = 1 to V-1:     │
│                         │
│   For each edge (u,v):  │
│     if dist[u] + w < dist[v]: │
│       dist[v] = dist[u] + w   │
└──────────┬──────────────┘
           │
           v
┌─────────────────────────┐
│  Negative Cycle Check:  │
│                         │
│   For each edge (u,v):  │
│     if dist[u] + w < dist[v]: │
│       return "Neg Cycle"│
│     else:               │
│       return distances  │
└─────────────────────────┘
```

## Advanced Interview Topics

### **Question** : "Why can't we use Dijkstra with negative weights even if we add a constant to make all weights positive?"

> **Answer** : Adding a constant doesn't preserve shortest paths! If we add +10 to all edges, a 3-edge path gets +30 while a 1-edge path gets +10, completely changing the relative ordering.

### **Follow-up** : "What about Johnson's Algorithm?"

Johnson's algorithm cleverly reweights edges using potentials to make them non-negative while preserving shortest paths, then uses Dijkstra. But that's beyond typical FAANG scope.

## Practice Problem for Mastery

Here's a classic FAANG-style problem:

```python
def cheapest_flights_with_stops(flights, src, dst, k):
    """
    Find cheapest flight from src to dst with at most k stops.
    This is Bellman-Ford with a twist - limited iterations!
  
    flights: list of [from, to, price]
    k: maximum stops allowed
    """
    distances = [float('inf')] * n  # n = number of cities
    distances[src] = 0
  
    # Key insight: k stops means k+1 flights maximum
    for i in range(k + 1):
        temp_distances = distances[:]  # Important: use previous iteration's values
      
        for u, v, price in flights:
            if distances[u] != float('inf'):
                temp_distances[v] = min(temp_distances[v], distances[u] + price)
      
        distances = temp_distances
  
    return distances[dst] if distances[dst] != float('inf') else -1
```

> **Key Interview Insight** : This problem demonstrates why understanding Bellman-Ford's iteration limit is crucial - here we limit iterations to control path length!

The Bellman-Ford algorithm is your reliable tool for negative weight scenarios. Master its principles, understand why V-1 iterations suffice, and you'll handle any shortest path problem with confidence in your FAANG interviews.
