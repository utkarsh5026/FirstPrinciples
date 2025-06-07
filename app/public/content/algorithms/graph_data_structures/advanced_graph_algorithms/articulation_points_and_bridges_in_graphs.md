# Articulation Points and Bridges in Graphs: A Complete Guide for FAANG Interviews

## Understanding Graphs: The Foundation

Before diving into articulation points and bridges, let's establish our foundation from first principles.

> **A graph is a collection of vertices (nodes) connected by edges.** Think of it like a social network where people are vertices and friendships are edges, or a road network where intersections are vertices and roads are edges.

In an  **undirected graph** , edges have no direction - if you can go from A to B, you can also go from B to A. This is crucial for understanding articulation points and bridges, as these concepts specifically apply to undirected graphs.

### Connected Components: The Building Blocks

A **connected component** is a maximal set of vertices where every vertex can reach every other vertex through some path. Imagine islands connected by bridges - each island system forms one connected component.

```
Component 1:     Component 2:
A---B            E---F
|   |            |
C---D            G
```

## What Are Articulation Points?

> **An articulation point (or cut vertex) is a vertex whose removal increases the number of connected components in the graph.**

Let's understand this with a real-world analogy: imagine a transportation network where removing one critical junction would isolate entire neighborhoods. That junction is an articulation point.

### Visual Example

```
Original graph:
    A
    |
    B---E
   /|   |
  C |   F
   \|   |
    D---G

Connected components: 1
```

If we remove vertex B:

```
After removing B:
    A
  
    E
    |
    F
    |
    G    C
         |
         D

Connected components: 3
```

> **Vertex B is an articulation point because removing it breaks the graph into 3 separate components instead of 1.**

## What Are Bridges?

> **A bridge (or cut edge) is an edge whose removal increases the number of connected components in the graph.**

Using our transportation analogy: a bridge is like a critical road that, if closed, would isolate communities from each other.

### Visual Example

```
Original graph:
A---B---C---D
|       |
E       F

Connected components: 1
```

If we remove edge B-C:

```
After removing edge B-C:
A---B   C---D
|       |
E       F

Connected components: 2
```

> **Edge B-C is a bridge because removing it splits the graph into 2 separate components.**

## Why These Concepts Matter in FAANG Interviews

Understanding articulation points and bridges is crucial because they represent:

1. **Critical infrastructure points** in network design
2. **Single points of failure** in distributed systems
3. **Bottlenecks** in data flow
4. **Essential connections** in social networks

> **These problems test your ability to think about graph connectivity, implement sophisticated algorithms, and optimize for time complexity - all key skills for system design and algorithmic thinking.**

## Tarjan's Algorithm: The Elegant Solution

The most efficient approach to find articulation points and bridges is  **Tarjan's Algorithm** , which uses DFS with some clever bookkeeping.

### Core Concepts

 **Discovery Time** : When we first visit a vertex during DFS
 **Low Value** : The lowest discovery time reachable from a vertex using back edges

> **The genius of Tarjan's algorithm is that it processes the entire graph in a single DFS pass, achieving O(V + E) time complexity.**

### Finding Articulation Points: Step by Step

Let's implement this with detailed explanations:

```python
def find_articulation_points(graph):
    n = len(graph)
    visited = [False] * n
    discovery = [0] * n
    low = [0] * n
    parent = [-1] * n
    articulation_points = set()
    time = [0]  # Using list to make it mutable
  
    def dfs(u):
        # Mark current vertex as visited
        visited[u] = True
      
        # Initialize discovery time and low value
        discovery[u] = low[u] = time[0]
        time[0] += 1
      
        children = 0  # Count children in DFS tree
      
        # Explore all adjacent vertices
        for v in graph[u]:
            if not visited[v]:
                children += 1
                parent[v] = u
                dfs(v)
              
                # Update low value based on subtree
                low[u] = min(low[u], low[v])
              
                # Check articulation point conditions
                # Case 1: Root with 2+ children
                if parent[u] == -1 and children > 1:
                    articulation_points.add(u)
              
                # Case 2: Non-root vertex where subtree can't reach back
                if parent[u] != -1 and low[v] >= discovery[u]:
                    articulation_points.add(u)
                  
            elif v != parent[u]:  # Back edge (not to parent)
                low[u] = min(low[u], discovery[v])
  
    # Run DFS from each unvisited vertex
    for i in range(n):
        if not visited[i]:
            dfs(i)
  
    return list(articulation_points)
```

### Understanding the Algorithm

Let's break down the key parts:

 **Discovery and Low Arrays** :

```python
discovery[u] = low[u] = time[0]
time[0] += 1
```

> **We assign each vertex a unique timestamp when first discovered. The low value starts the same but may decrease as we find back edges.**

 **Updating Low Values** :

```python
low[u] = min(low[u], low[v])  # From subtree
low[u] = min(low[u], discovery[v])  # From back edge
```

> **The low value represents the earliest discovered vertex reachable from the current vertex's subtree. This is the key insight that makes the algorithm work.**

 **Articulation Point Detection** :

1. **Root Case** : If the DFS root has 2+ children, it's an articulation point
2. **Non-root Case** : If `low[v] >= discovery[u]`, then `u` is an articulation point

> **The condition `low[v] >= discovery[u]` means the subtree rooted at v cannot reach any vertex discovered before u, so removing u would disconnect v's subtree.**

### Finding Bridges: Similar Logic

```python
def find_bridges(graph):
    n = len(graph)
    visited = [False] * n
    discovery = [0] * n
    low = [0] * n
    parent = [-1] * n
    bridges = []
    time = [0]
  
    def dfs(u):
        visited[u] = True
        discovery[u] = low[u] = time[0]
        time[0] += 1
      
        for v in graph[u]:
            if not visited[v]:
                parent[v] = u
                dfs(v)
              
                low[u] = min(low[u], low[v])
              
                # Bridge condition: stricter than articulation point
                if low[v] > discovery[u]:
                    bridges.append((u, v))
                  
            elif v != parent[u]:
                low[u] = min(low[u], discovery[v])
  
    for i in range(n):
        if not visited[i]:
            dfs(i)
  
    return bridges
```

### Key Difference: Bridge vs Articulation Point

> **For bridges, we use `low[v] > discovery[u]` (strict inequality) instead of `>=`. This means the subtree rooted at v has NO way to reach back to u or any ancestor of u.**

## Worked Example: Tracing the Algorithm

Let's trace through a small example:

```
Graph:
0---1---2
|       |
3       4
```

 **Adjacency List** :

```python
graph = {
    0: [1, 3],
    1: [0, 2],
    2: [1, 4], 
    3: [0],
    4: [2]
}
```

**DFS Traversal** (starting from vertex 0):

| Vertex | Discovery | Low | Parent | Action       |
| ------ | --------- | --- | ------ | ------------ |
| 0      | 0         | 0   | -1     | Start DFS    |
| 1      | 1         | 0   | 0      | Visit from 0 |
| 2      | 2         | 2   | 1      | Visit from 1 |
| 4      | 3         | 3   | 2      | Visit from 2 |
| 3      | 4         | 4   | 0      | Visit from 0 |

 **Analysis** :

* Edge (1,2): `low[2] = 2 > discovery[1] = 1` → **Bridge**
* Edge (2,4): `low[4] = 3 > discovery[2] = 2` → **Bridge**
* Edge (0,3): `low[3] = 4 > discovery[0] = 0` → **Bridge**

> **All edges except (0,1) are bridges because this graph is essentially a tree structure with vertex 0 as a hub.**

## Common Interview Variations

### 1. Critical Connections in a Network

```python
def critical_connections(n, connections):
    """
    LeetCode 1192: Find all critical connections
    """
    # Build adjacency list
    graph = [[] for _ in range(n)]
    for u, v in connections:
        graph[u].append(v)
        graph[v].append(u)
  
    # Apply Tarjan's algorithm
    return find_bridges(graph)
```

### 2. Network Delay After Removing One Server

```python
def max_components_after_removal(graph):
    """
    Find which vertex removal creates maximum components
    """
    articulation_points = find_articulation_points(graph)
    max_components = 1
  
    for vertex in articulation_points:
        # Calculate components after removing this vertex
        components = count_components_without_vertex(graph, vertex)
        max_components = max(max_components, components)
  
    return max_components
```

### 3. Minimum Edges to Add for Robustness

This is a more advanced variation:

```python
def min_edges_for_robustness(graph):
    """
    Minimum edges to add so no single vertex removal disconnects graph
    """
    bridges = find_bridges(graph)
  
    # Create bridge tree (each bridge becomes a node)
    # Count leaf nodes in bridge tree
    # Answer is ceil(leaf_count / 2)
  
    return calculate_min_edges(bridges)
```

## Time and Space Complexity

> **Time Complexity: O(V + E)** - We visit each vertex once and each edge twice (once from each endpoint)

> **Space Complexity: O(V)** - For the recursion stack, discovery/low arrays, and visited array

This linear time complexity is what makes Tarjan's algorithm so powerful and interview-friendly.

## Common Pitfalls and Interview Tips

### 1. Handling Disconnected Graphs

```python
# Always iterate through all vertices
for i in range(n):
    if not visited[i]:
        dfs(i)  # Handle each component separately
```

### 2. Parallel Edges

> **In graphs with multiple edges between the same vertices, ensure your adjacency list representation handles this correctly.**

### 3. Self-Loops

Self-loops don't affect articulation points or bridges, but make sure your algorithm handles them gracefully.

### 4. Root Vertex Special Case

> **Remember: The root of the DFS tree is an articulation point only if it has 2 or more children in the DFS tree.**

## Interview Strategy

1. **Start with the definition** - explain what articulation points/bridges mean
2. **Give a simple example** - draw a small graph and identify them manually
3. **Explain the naive approach** - removing each vertex/edge and checking connectivity
4. **Introduce Tarjan's algorithm** - explain why it's more efficient
5. **Code the solution** - implement with clear variable names and comments
6. **Trace through an example** - show how discovery/low values work
7. **Discuss complexity** - emphasize the O(V + E) time complexity

> **The key insight interviewers look for is understanding that back edges in DFS provide alternative paths, and articulation points/bridges are where these alternative paths don't exist.**

This problem beautifully combines graph theory, DFS traversal, and algorithmic optimization - making it a favorite in technical interviews. The elegant solution showcases your ability to think deeply about graph connectivity while implementing an efficient algorithm.
