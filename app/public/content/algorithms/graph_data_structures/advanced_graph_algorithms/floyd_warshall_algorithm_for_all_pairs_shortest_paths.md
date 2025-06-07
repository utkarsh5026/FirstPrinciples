# Floyd-Warshall Algorithm: Mastering All-Pairs Shortest Paths for FAANG Interviews

## Understanding the Fundamental Problem

Let's start from the very beginning. Imagine you're a travel planner, and you have a map of cities connected by roads with different distances. A natural question arises:

> **Core Problem** : Given a graph where edges have weights (representing distances, costs, or time), how do we find the shortest path between *every pair* of vertices?

This is fundamentally different from single-source shortest path problems (like Dijkstra's algorithm) where we find shortest paths from one source to all other vertices. Here, we want to know the shortest distance between *any two cities* in our network.

## Why Floyd-Warshall? The Intuitive Foundation

Before diving into the algorithm, let's understand why we need a different approach:

 **Single-Source Limitations** : If we used Dijkstra's algorithm for each vertex as a source, we'd have O(V) calls to an O((V + E) log V) algorithm, giving us O(V² log V + VE log V) complexity. For dense graphs where E ≈ V², this becomes quite expensive.

 **The Key Insight** : Floyd-Warshall leverages a brilliant observation about optimal paths:

> **Fundamental Principle** : If the shortest path from vertex i to vertex j goes through vertex k, then the path from i to k and the path from k to j must also be optimal.

This is the **optimal substructure** property that makes dynamic programming applicable.

## The Mathematical Foundation

Let's formalize our thinking. We'll define:

* `dist[i][j]` = shortest distance from vertex i to vertex j
* `k` = an intermediate vertex we're considering

The recurrence relation becomes:

```
dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
```

> **Critical Insight** : We consider each vertex k as a potential "stepping stone" and ask: "Is it better to go from i to j directly, or to go through k?"

## Building the Algorithm Step by Step

### Step 1: Initialize the Distance Matrix

```python
def initialize_graph(n, edges):
    """
    Initialize the distance matrix with direct edge weights.
  
    n: number of vertices
    edges: list of (from, to, weight) tuples
    """
    # Start with infinity for all pairs
    INF = float('inf')
    dist = [[INF for _ in range(n)] for _ in range(n)]
  
    # Distance from a vertex to itself is 0
    for i in range(n):
        dist[i][i] = 0
  
    # Fill in direct edges
    for u, v, weight in edges:
        dist[u][v] = weight
        # For undirected graphs, uncomment the next line:
        # dist[v][u] = weight
  
    return dist
```

**What's happening here?**

* We create a 2D matrix where `dist[i][j]` will eventually hold the shortest distance from vertex i to j
* Initially, we assume infinite distance between all pairs (meaning no path exists)
* We set diagonal elements to 0 (distance from a vertex to itself)
* We populate direct edges with their given weights

### Step 2: The Core Floyd-Warshall Logic

```python
def floyd_warshall(dist):
    """
    Apply Floyd-Warshall algorithm to find all-pairs shortest paths.
  
    dist: initialized distance matrix
    Returns: updated matrix with shortest distances
    """
    n = len(dist)
  
    # Try each vertex as an intermediate point
    for k in range(n):
        # For each pair of vertices
        for i in range(n):
            for j in range(n):
                # Check if path through k is shorter
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
  
    return dist
```

> **The Magic Happens Here** : The outer loop iterates through each vertex k, considering it as a potential intermediate vertex for all pairs (i,j). The order matters crucially - we must complete all pairs for k before moving to k+1.

### Step 3: Complete Implementation with Example

```python
def floyd_warshall_complete(n, edges):
    """
    Complete Floyd-Warshall implementation with example.
    """
    # Initialize
    INF = float('inf')
    dist = [[INF for _ in range(n)] for _ in range(n)]
  
    for i in range(n):
        dist[i][i] = 0
  
    for u, v, weight in edges:
        dist[u][v] = weight
  
    # Floyd-Warshall algorithm
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] != INF and dist[k][j] != INF:
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
  
    return dist

# Example usage
if __name__ == "__main__":
    # Graph with 4 vertices (0, 1, 2, 3)
    edges = [
        (0, 1, 3),
        (0, 3, 7),
        (1, 0, 8),
        (1, 2, 2),
        (2, 0, 5),
        (2, 3, 1),
        (3, 0, 2)
    ]
  
    result = floyd_warshall_complete(4, edges)
  
    print("Shortest distances between all pairs:")
    for i in range(4):
        for j in range(4):
            if result[i][j] == float('inf'):
                print("INF", end="\t")
            else:
                print(f"{result[i][j]}", end="\t")
        print()
```

## Tracing Through a Concrete Example

Let's trace through our example step by step to truly understand what's happening:

 **Initial Graph** :

```
Vertices: 0, 1, 2, 3
Edges: (0→1: 3), (0→3: 7), (1→0: 8), (1→2: 2), (2→0: 5), (2→3: 1), (3→0: 2)
```

 **Initial Distance Matrix** :

```
    0   1   2   3
0 [ 0   3  INF  7 ]
1 [ 8   0   2  INF]
2 [ 5  INF  0   1 ]
3 [ 2  INF INF  0 ]
```

**Iteration k=0** (considering vertex 0 as intermediate):

* For i=1, j=3: dist[1][3] = min(INF, dist[1][0] + dist[0][3]) = min(INF, 8 + 7) = 15
* For i=2, j=1: dist[2][1] = min(INF, dist[2][0] + dist[0][1]) = min(INF, 5 + 3) = 8
* For i=3, j=1: dist[3][1] = min(INF, dist[3][0] + dist[0][1]) = min(INF, 2 + 3) = 5

After k=0:

```
    0   1   2   3
0 [ 0   3  INF  7 ]
1 [ 8   0   2   15]
2 [ 5   8   0   1 ]
3 [ 2   5  INF  0 ]
```

> **Key Observation** : Notice how we're building up knowledge incrementally. After considering vertex 0, we've found some new shortest paths that go through vertex 0.

## Advanced Implementation: Path Reconstruction

In FAANG interviews, you'll often be asked not just for distances, but for the actual paths. Here's how to track them:

```python
def floyd_warshall_with_paths(n, edges):
    """
    Floyd-Warshall with path reconstruction capability.
    """
    INF = float('inf')
    dist = [[INF for _ in range(n)] for _ in range(n)]
    next_vertex = [[None for _ in range(n)] for _ in range(n)]
  
    # Initialize
    for i in range(n):
        dist[i][i] = 0
  
    for u, v, weight in edges:
        dist[u][v] = weight
        next_vertex[u][v] = v  # Next vertex in path from u to v
  
    # Floyd-Warshall
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    next_vertex[i][j] = next_vertex[i][k]
  
    return dist, next_vertex

def get_path(next_vertex, start, end):
    """
    Reconstruct the actual shortest path from start to end.
    """
    if next_vertex[start][end] is None:
        return []  # No path exists
  
    path = [start]
    current = start
  
    while current != end:
        current = next_vertex[current][end]
        path.append(current)
  
    return path
```

 **Path Reconstruction Explanation** :

* `next_vertex[i][j]` stores the next vertex to visit when going from i to j on the shortest path
* When we update a distance through vertex k, we also update the next vertex to be the same as going from i to k
* To reconstruct a path, we follow the next_vertex pointers until we reach our destination

## Complexity Analysis: Time and Space

### Time Complexity: O(V³)

The three nested loops each run V times, giving us:

* Outer loop (k): V iterations
* Middle loop (i): V iterations
* Inner loop (j): V iterations
* Total: V × V × V = O(V³)

> **FAANG Interview Insight** : This cubic time complexity makes Floyd-Warshall ideal for dense graphs but potentially inefficient for sparse graphs where running Dijkstra V times might be faster.

### Space Complexity: O(V²)

We need a 2D matrix to store distances between all pairs of vertices.

## Detecting Negative Cycles

A crucial feature for FAANG interviews is negative cycle detection:

```python
def has_negative_cycle(dist):
    """
    Check if the graph contains a negative cycle.
    After Floyd-Warshall, if any diagonal element is negative,
    there's a negative cycle.
    """
    n = len(dist)
    for i in range(n):
        if dist[i][i] < 0:
            return True
    return False

def floyd_warshall_with_negative_detection(n, edges):
    """
    Floyd-Warshall with negative cycle detection.
    """
    dist = initialize_distance_matrix(n, edges)
  
    # Standard Floyd-Warshall
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] != float('inf') and dist[k][j] != float('inf'):
                    dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
  
    # Check for negative cycles
    if has_negative_cycle(dist):
        return None, True  # Negative cycle detected
  
    return dist, False
```

> **Why This Works** : If there's a negative cycle, we can keep going around it to get arbitrarily small distances. This manifests as negative values on the diagonal of our distance matrix.

## FAANG Interview Variations and Follow-ups

### 1. "Can you modify this for undirected graphs?"

```python
def floyd_warshall_undirected(n, edges):
    """
    Floyd-Warshall for undirected graphs.
    """
    dist = [[float('inf')] * n for _ in range(n)]
  
    for i in range(n):
        dist[i][i] = 0
  
    # For undirected graphs, add both directions
    for u, v, weight in edges:
        dist[u][v] = weight
        dist[v][u] = weight  # Key difference
  
    # Rest remains the same
    for k in range(n):
        for i in range(n):
            for j in range(n):
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
  
    return dist
```

### 2. "What if we want to find the maximum path instead?"

```python
def floyd_warshall_max_path(n, edges):
    """
    Find maximum path between all pairs (useful for capacity problems).
    """
    # Initialize with 0 instead of infinity
    dist = [[0 for _ in range(n)] for _ in range(n)]
  
    for u, v, capacity in edges:
        dist[u][v] = capacity
  
    # Use max instead of min
    for k in range(n):
        for i in range(n):
            for j in range(n):
                dist[i][j] = max(dist[i][j], min(dist[i][k], dist[k][j]))
  
    return dist
```

### 3. "How would you optimize space complexity?"

> **Space Optimization Insight** : Since we only need the previous state to compute the current state, we might think we can optimize space. However, Floyd-Warshall updates the matrix in-place, and we need all values from the current iteration, so O(V²) space is unavoidable.

## When to Choose Floyd-Warshall in Interviews

 **Use Floyd-Warshall when** :

* You need all-pairs shortest paths
* The graph is relatively small (V ≤ 400-500)
* The graph is dense
* You need to handle negative edge weights (but no negative cycles)
* The problem asks for shortest paths between multiple queries

 **Don't use Floyd-Warshall when** :

* You only need single-source shortest paths (use Dijkstra or Bellman-Ford)
* The graph is very large and sparse
* You only need a few specific pairs (use targeted algorithms instead)

## Common Interview Questions and Solutions

### Question 1: "Find the shortest path between all pairs in a weighted graph"

This is the direct application we've covered above.

### Question 2: "Given a graph, find if there's a negative cycle"

Use the negative cycle detection we discussed.

### Question 3: "Find the vertex that minimizes the maximum distance to all other vertices" (Graph Center Problem)

```python
def find_graph_center(dist_matrix):
    """
    Find the vertex that minimizes the maximum distance to any other vertex.
    """
    n = len(dist_matrix)
    min_max_dist = float('inf')
    center = -1
  
    for i in range(n):
        max_dist_from_i = max(dist_matrix[i][j] for j in range(n) if i != j)
        if max_dist_from_i < min_max_dist:
            min_max_dist = max_dist_from_i
            center = i
  
    return center, min_max_dist
```

## Conclusion: Mastering Floyd-Warshall for Success

Floyd-Warshall represents a beautiful application of dynamic programming to graph problems. The key insights to remember:

> **Final Takeaways** :
>
> * It solves all-pairs shortest paths in O(V³) time
> * It can handle negative edges but not negative cycles
> * It's optimal for dense graphs and small to medium-sized problems
> * Path reconstruction requires additional bookkeeping but follows naturally
> * Negative cycle detection is built into the algorithm

Understanding Floyd-Warshall deeply - from first principles through implementation details to optimization variations - demonstrates the kind of algorithmic thinking that FAANG companies value. The algorithm showcases dynamic programming, graph theory, and optimization principles all in one elegant solution.
