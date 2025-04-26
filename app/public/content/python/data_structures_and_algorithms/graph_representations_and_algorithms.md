# Graph Representations and Algorithms from First Principles

Graphs are one of the most powerful and versatile data structures in computer science. They allow us to model relationships between objects in a way that's both visually intuitive and mathematically rigorous. Let's build our understanding from absolute first principles.

## What Is a Graph?

At its most fundamental level, a graph is a collection of two things:

* **Vertices** (also called nodes): These represent objects or entities
* **Edges** : These represent connections or relationships between vertices

Think of a social network where people are vertices and friendships are edges, or a road map where cities are vertices and roads are edges.

### Mathematical Definition

Formally, a graph G can be defined as an ordered pair G = (V, E) where:

* V is a set of vertices
* E is a set of edges, where each edge connects two vertices in V

## Types of Graphs

Before diving into representations, let's understand the different types of graphs:

### 1. Undirected vs Directed Graphs

In an  **undirected graph** , edges have no direction. If vertex A is connected to vertex B, then B is also connected to A.

In a **directed graph** (or digraph), edges have direction. If A points to B, it doesn't necessarily mean B points to A.

### 2. Weighted vs Unweighted Graphs

In a  **weighted graph** , each edge has a value (weight) associated with it. This could represent distance, cost, or capacity.

In an  **unweighted graph** , edges simply exist or don't exist, with no additional value assigned.

### 3. Simple vs Multi-Graphs

A **simple graph** has no self-loops (edges from a vertex to itself) and no multiple edges between the same pair of vertices.

A **multi-graph** allows multiple edges between the same pair of vertices.

## Graph Representations in Python

Now let's explore how to represent graphs in Python code. There are two primary ways to represent a graph:

### 1. Adjacency Matrix

An adjacency matrix is a 2D array where rows and columns represent vertices. The value at position [i][j] indicates whether there's an edge from vertex i to vertex j.

Let's implement a simple undirected graph using an adjacency matrix:

```python
class GraphMatrix:
    def __init__(self, num_vertices):
        # Initialize a matrix with all zeros
        self.V = num_vertices
        self.graph = [[0 for _ in range(num_vertices)] for _ in range(num_vertices)]
  
    def add_edge(self, u, v, weight=1):
        # Add edge from vertex u to vertex v with given weight
        self.graph[u][v] = weight
        # For undirected graph, add edge from v to u as well
        self.graph[v][u] = weight
  
    def print_graph(self):
        for row in self.graph:
            print(row)

# Create a simple undirected graph
g = GraphMatrix(5)  # 5 vertices labeled 0 to 4
g.add_edge(0, 1)    # Edge between vertices 0 and 1
g.add_edge(0, 4)    # Edge between vertices 0 and 4
g.add_edge(1, 2)    # Edge between vertices 1 and 2
g.add_edge(1, 3)    # Edge between vertices 1 and 3
g.add_edge(1, 4)    # Edge between vertices 1 and 4
g.add_edge(2, 3)    # Edge between vertices 2 and 3
g.add_edge(3, 4)    # Edge between vertices 3 and 4

g.print_graph()
```

When executed, this will print:

```
[0, 1, 0, 0, 1]
[1, 0, 1, 1, 1]
[0, 1, 0, 1, 0]
[0, 1, 1, 0, 1]
[1, 1, 0, 1, 0]
```

This matrix tells us which vertices are connected. For example, vertices 0 and 1 are connected because there's a 1 at position [0][1] and [1][0] (it's undirected, so both positions have 1).

**Pros of Adjacency Matrix:**

* Fast to check if there's an edge between two vertices: O(1) time
* Simple to implement and understand
* Works well for dense graphs

**Cons of Adjacency Matrix:**

* Uses O(V²) space, inefficient for sparse graphs
* Adding a vertex requires creating a new matrix

### 2. Adjacency List

An adjacency list uses a list (or dictionary) to represent the graph. For each vertex, we maintain a list of all vertices adjacent to it.

Let's implement the same undirected graph using an adjacency list:

```python
class GraphList:
    def __init__(self, num_vertices):
        self.V = num_vertices
        # Initialize adjacency list
        self.graph = [[] for _ in range(num_vertices)]
  
    def add_edge(self, u, v, weight=1):
        # For weighted graph, store (vertex, weight) tuples
        self.graph[u].append((v, weight))
        # For undirected graph, add edge in both directions
        self.graph[v].append((u, weight))
  
    def print_graph(self):
        for i in range(self.V):
            print(f"Vertex {i} connected to: {self.graph[i]}")

# Create the same undirected graph
g = GraphList(5)  # 5 vertices labeled 0 to 4
g.add_edge(0, 1)  # Edge between vertices 0 and 1
g.add_edge(0, 4)  # Edge between vertices 0 and 4
g.add_edge(1, 2)  # Edge between vertices 1 and 2
g.add_edge(1, 3)  # Edge between vertices 1 and 3
g.add_edge(1, 4)  # Edge between vertices 1 and 4
g.add_edge(2, 3)  # Edge between vertices 2 and 3
g.add_edge(3, 4)  # Edge between vertices 3 and 4

g.print_graph()
```

This will print:

```
Vertex 0 connected to: [(1, 1), (4, 1)]
Vertex 1 connected to: [(0, 1), (2, 1), (3, 1), (4, 1)]
Vertex 2 connected to: [(1, 1), (3, 1)]
Vertex 3 connected to: [(1, 1), (2, 1), (4, 1)]
Vertex 4 connected to: [(0, 1), (1, 1), (3, 1)]
```

Here, each vertex's list contains tuples of the form (adjacent_vertex, weight). For example, vertex 0 is connected to vertices 1 and 4.

**Pros of Adjacency List:**

* Space-efficient for sparse graphs: O(V + E)
* Adding a vertex is easier
* Iterating over adjacent vertices is faster

**Cons of Adjacency List:**

* Checking if there's an edge between two vertices takes O(degree(v)) time
* Implementation is slightly more complex

### 3. Using NetworkX Library

While building graphs from scratch is educational, Python has excellent libraries for working with graphs. The most popular is NetworkX:

```python
import networkx as nx
import matplotlib.pyplot as plt

# Create an undirected graph
G = nx.Graph()

# Add edges (NetworkX will automatically add the vertices)
G.add_edge(0, 1)
G.add_edge(0, 4)
G.add_edge(1, 2)
G.add_edge(1, 3)
G.add_edge(1, 4)
G.add_edge(2, 3)
G.add_edge(3, 4)

# Print adjacency list
for node in G.nodes():
    neighbors = list(G.neighbors(node))
    print(f"Node {node} connected to: {neighbors}")

# Draw the graph
nx.draw(G, with_labels=True, node_color='lightblue', node_size=500, font_weight='bold')
plt.show()
```

NetworkX provides powerful functionality for graph operations and visualizations, making it ideal for practical applications.

## Graph Traversal Algorithms

Now that we understand how to represent graphs, let's explore fundamental algorithms for traversing them.

### Breadth-First Search (BFS)

BFS explores a graph level by level, visiting all neighbors of a vertex before moving to the next level. It uses a queue data structure.

Let's implement BFS from scratch:

```python
from collections import deque

def bfs(graph, start_vertex):
    # Number of vertices in the graph
    V = len(graph)
  
    # Mark all vertices as not visited
    visited = [False] * V
  
    # Create a queue for BFS
    queue = deque()
  
    # Mark the source vertex as visited and enqueue it
    visited[start_vertex] = True
    queue.append(start_vertex)
  
    # List to track the order of traversal
    traversal_order = []
  
    while queue:
        # Dequeue a vertex from queue and print it
        current_vertex = queue.popleft()
        traversal_order.append(current_vertex)
      
        # Get all adjacent vertices of the dequeued vertex
        # If an adjacent vertex has not been visited, mark it
        # visited and enqueue it
        for neighbor, _ in graph[current_vertex]:
            if not visited[neighbor]:
                visited[neighbor] = True
                queue.append(neighbor)
  
    return traversal_order

# Create a graph using adjacency list
g = GraphList(5)
g.add_edge(0, 1)
g.add_edge(0, 4)
g.add_edge(1, 2)
g.add_edge(1, 3)
g.add_edge(1, 4)
g.add_edge(2, 3)
g.add_edge(3, 4)

print("BFS traversal starting from vertex 0:")
print(bfs(g.graph, 0))
```

This will output something like:

```
BFS traversal starting from vertex 0:
[0, 1, 4, 2, 3]
```

**How BFS Works:**

1. Start at a chosen vertex (source)
2. Explore all neighbors of the source
3. Then for each of those neighbors, explore their unexplored neighbors
4. Continue until all vertices are visited

BFS is useful for finding the shortest path in an unweighted graph, as it guarantees that the first time a vertex is discovered is the shortest path to it from the source.

### Depth-First Search (DFS)

DFS explores as far as possible along each branch before backtracking. It uses a stack (or recursion, which implicitly uses the call stack).

Here's a recursive implementation of DFS:

```python
def dfs_recursive(graph, vertex, visited=None, traversal_order=None):
    # Initialize visited and traversal_order on first call
    if visited is None:
        visited = [False] * len(graph)
    if traversal_order is None:
        traversal_order = []
  
    # Mark the current vertex as visited and add to traversal order
    visited[vertex] = True
    traversal_order.append(vertex)
  
    # Recur for all adjacent vertices
    for neighbor, _ in graph[vertex]:
        if not visited[neighbor]:
            dfs_recursive(graph, neighbor, visited, traversal_order)
  
    return traversal_order

# Create a graph using adjacency list
g = GraphList(5)
g.add_edge(0, 1)
g.add_edge(0, 4)
g.add_edge(1, 2)
g.add_edge(1, 3)
g.add_edge(1, 4)
g.add_edge(2, 3)
g.add_edge(3, 4)

print("DFS traversal starting from vertex 0:")
print(dfs_recursive(g.graph, 0))
```

This will output something like:

```
DFS traversal starting from vertex 0:
[0, 1, 2, 3, 4]
```

And here's an iterative implementation using a stack:

```python
def dfs_iterative(graph, start_vertex):
    # Number of vertices in the graph
    V = len(graph)
  
    # Mark all vertices as not visited
    visited = [False] * V
  
    # Create a stack for DFS
    stack = []
  
    # Push the source vertex
    stack.append(start_vertex)
  
    # List to track the order of traversal
    traversal_order = []
  
    while stack:
        # Pop a vertex from stack
        vertex = stack.pop()
      
        # If the vertex is not visited yet, mark it and add to traversal
        if not visited[vertex]:
            visited[vertex] = True
            traversal_order.append(vertex)
      
        # Get all adjacent vertices of the popped vertex
        # If an adjacent vertex is not visited, push it to the stack
        for neighbor, _ in reversed(graph[vertex]):  # reversed to match recursive DFS order
            if not visited[neighbor]:
                stack.append(neighbor)
  
    return traversal_order

print("Iterative DFS traversal starting from vertex 0:")
print(dfs_iterative(g.graph, 0))
```

**How DFS Works:**

1. Start at a chosen vertex
2. Explore a path as deeply as possible
3. When you reach a dead end (a vertex with no unvisited neighbors), backtrack
4. Continue exploring unexplored paths until all vertices are visited

DFS is useful for topological sorting, cycle detection, and finding connected components in a graph.

## Path Finding Algorithms

Now let's look at algorithms to find paths between vertices.

### Dijkstra's Algorithm

Dijkstra's algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph with non-negative weights.

```python
import heapq

def dijkstra(graph, start_vertex):
    # Number of vertices
    V = len(graph)
  
    # Initialize distances as infinity for all vertices except start
    distances = [float('infinity')] * V
    distances[start_vertex] = 0
  
    # Track path
    previous = [None] * V
  
    # Priority queue for vertices to visit next
    # Format: (distance, vertex)
    priority_queue = [(0, start_vertex)]
  
    # Track visited vertices
    visited = [False] * V
  
    while priority_queue:
        # Get vertex with minimum distance
        current_distance, current_vertex = heapq.heappop(priority_queue)
      
        # If already processed, skip
        if visited[current_vertex]:
            continue
      
        # Mark as visited
        visited[current_vertex] = True
      
        # Check all neighbors
        for neighbor, weight in graph[current_vertex]:
            # If not visited
            if not visited[neighbor]:
                # Calculate distance through current vertex
                distance = current_distance + weight
              
                # If shorter path found
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    previous[neighbor] = current_vertex
                    heapq.heappush(priority_queue, (distance, neighbor))
  
    return distances, previous

# Create a weighted graph
g = GraphList(6)
g.add_edge(0, 1, 4)  # Edge from 0 to 1 with weight 4
g.add_edge(0, 2, 3)  # Edge from 0 to 2 with weight 3
g.add_edge(1, 2, 1)  # Edge from 1 to 2 with weight 1
g.add_edge(1, 3, 2)  # Edge from 1 to 3 with weight 2
g.add_edge(2, 3, 4)  # Edge from 2 to 3 with weight 4
g.add_edge(2, 4, 3)  # Edge from 2 to 4 with weight 3
g.add_edge(3, 4, 2)  # Edge from 3 to 4 with weight 2
g.add_edge(3, 5, 1)  # Edge from 3 to 5 with weight 1
g.add_edge(4, 5, 6)  # Edge from 4 to 5 with weight 6

distances, previous = dijkstra(g.graph, 0)

# Print shortest distances
print("Shortest distances from vertex 0:")
for i in range(len(distances)):
    print(f"To vertex {i}: {distances[i]}")

# Function to reconstruct path
def get_path(previous, target):
    path = []
    while target is not None:
        path.append(target)
        target = previous[target]
    path.reverse()
    return path

# Print path to vertex 5
print("Shortest path from 0 to 5:", get_path(previous, 5))
```

This will output:

```
Shortest distances from vertex 0:
To vertex 0: 0
To vertex 1: 4
To vertex 2: 3
To vertex 3: 6
To vertex 4: 6
To vertex 5: 7
Shortest path from 0 to 5: [0, 2, 3, 5]
```

**How Dijkstra's Algorithm Works:**

1. Initialize distances to all vertices as infinity except the source (0)
2. Use a priority queue to select vertices in order of current shortest distance
3. For each vertex, update the distances to its neighbors if a shorter path is found
4. Continue until all vertices are processed

Dijkstra's algorithm is greedy and guarantees the shortest path in graphs with non-negative weights.

### A* Search Algorithm

A* (A-star) is an informed search algorithm that finds the shortest path from a start node to a goal node. It uses a heuristic to guide the search.

```python
import heapq

def astar(graph, start, goal, heuristic):
    # Initialize open and closed sets
    open_set = []
    closed_set = set()
  
    # Priority queue: (f_score, vertex)
    # f_score = g_score (distance from start) + h_score (heuristic to goal)
    heapq.heappush(open_set, (heuristic[start], start))
  
    # Track path and scores
    came_from = {}
    g_score = {vertex: float('infinity') for vertex in range(len(graph))}
    g_score[start] = 0
  
    f_score = {vertex: float('infinity') for vertex in range(len(graph))}
    f_score[start] = heuristic[start]
  
    while open_set:
        # Get vertex with lowest f_score
        current_f, current = heapq.heappop(open_set)
      
        # If reached goal
        if current == goal:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            path.reverse()
            return path, g_score[goal]
      
        # Add to closed set
        closed_set.add(current)
      
        # Check all neighbors
        for neighbor, weight in graph[current]:
            # If already evaluated
            if neighbor in closed_set:
                continue
          
            # Calculate tentative g_score
            tentative_g_score = g_score[current] + weight
          
            # If this path is better
            if tentative_g_score < g_score[neighbor]:
                # Record the path
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g_score
                f_score[neighbor] = g_score[neighbor] + heuristic[neighbor]
              
                # Add to open set if not there
                if neighbor not in [item[1] for item in open_set]:
                    heapq.heappush(open_set, (f_score[neighbor], neighbor))
  
    # No path found
    return None, float('infinity')

# For this example, let's use a simple heuristic: distance to goal is 0
# In real applications, you would use a problem-specific heuristic like Euclidean distance
heuristic = [0, 0, 0, 0, 0, 0]

# Find path from 0 to 5
path, distance = astar(g.graph, 0, 5, heuristic)
print("A* path from 0 to 5:", path)
print("Path distance:", distance)
```

This will output:

```
A* path from 0 to 5: [0, 2, 3, 5]
Path distance: 7
```

 **How A* Works:* *

1. Maintain an open set of vertices to explore (priority queue)
2. Select vertex with lowest f_score (f = g + h)
3. Explore its neighbors and update their scores if better paths are found
4. Continue until goal is reached or no paths remain

A* is optimal when the heuristic is admissible (never overestimates the true cost) and consistent.

## Graph Applications and Advanced Algorithms

Let's briefly look at some common applications of graphs and advanced algorithms.

### Minimum Spanning Tree - Kruskal's Algorithm

A minimum spanning tree (MST) is a subset of edges that connects all vertices with the minimum total edge weight. Kruskal's algorithm finds the MST.

```python
def kruskal(graph, num_vertices):
    # Create a list of all edges
    edges = []
    for u in range(num_vertices):
        for v, weight in graph[u]:
            # Add each edge once (for undirected graph)
            if u < v:
                edges.append((u, v, weight))
  
    # Sort edges by weight
    edges.sort(key=lambda x: x[2])
  
    # Initialize disjoint set for tracking connected components
    parent = list(range(num_vertices))
  
    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])  # Path compression
        return parent[x]
  
    def union(x, y):
        parent[find(x)] = find(y)
  
    # Initialize MST
    mst = []
    mst_weight = 0
  
    # Process edges in order of weight
    for u, v, weight in edges:
        # If including this edge doesn't create a cycle
        if find(u) != find(v):
            union(u, v)
            mst.append((u, v, weight))
            mst_weight += weight
          
            # Stop when MST is complete (has V-1 edges)
            if len(mst) == num_vertices - 1:
                break
  
    return mst, mst_weight

# Find MST
mst, total_weight = kruskal(g.graph, 6)
print("Minimum Spanning Tree edges:")
for u, v, w in mst:
    print(f"Edge {u}-{v} with weight {w}")
print("Total MST weight:", total_weight)
```

**How Kruskal's Algorithm Works:**

1. Sort all edges by weight
2. Start with an empty MST
3. Add edges one by one, ensuring no cycles are formed
4. Continue until MST has V-1 edges

### Topological Sort

A topological sort is a linear ordering of vertices such that for every directed edge (u,v), vertex u comes before v in the ordering. It's only possible in a directed acyclic graph (DAG).

```python
def topological_sort(graph):
    # Number of vertices
    V = len(graph)
  
    # Initialize visited array and stack for result
    visited = [False] * V
    stack = []
  
    # Helper function for DFS
    def dfs(vertex):
        visited[vertex] = True
      
        # Visit all neighbors
        for neighbor, _ in graph[vertex]:
            if not visited[neighbor]:
                dfs(neighbor)
      
        # Push current vertex to stack
        stack.append(vertex)
  
    # Perform DFS for all vertices
    for i in range(V):
        if not visited[i]:
            dfs(i)
  
    # Return reversed stack (topological order)
    return stack[::-1]

# Create a directed acyclic graph (DAG)
dag = GraphList(6)
dag.add_edge(5, 2, 1)  # One-way edges for directed graph
dag.add_edge(5, 0, 1)
dag.add_edge(4, 0, 1)
dag.add_edge(4, 1, 1)
dag.add_edge(2, 3, 1)
dag.add_edge(3, 1, 1)

# This is now a directed graph, so we need to modify our graph class:
# Remove the line `self.graph[v].append((u, weight))` from add_edge method

print("Topological Sort:")
print(topological_sort(dag.graph))
```

This will output:

```
Topological Sort:
[5, 4, 2, 3, 1, 0]
```

**How Topological Sort Works:**

1. Use DFS to visit all vertices
2. After visiting all neighbors of a vertex, add it to a stack
3. The reversed stack gives the topological order

Topological sorting is useful for scheduling tasks with dependencies, course prerequisites, and more.

## Real-World Applications

Let's wrap up by discussing some real-world applications of graphs:

1. **Social Networks** : Friend relationships, followers, connections
2. **Web Crawling** : Web pages are vertices, hyperlinks are edges
3. **GPS and Navigation** : Cities as vertices, roads as edges
4. **Network Routing** : Routers as vertices, connections as edges
5. **Recommendation Systems** : Users and items as vertices with preference edges
6. **Dependency Resolution** : Software packages and their dependencies

## Conclusion

We've covered the fundamentals of graph theory, representations in Python, and several important algorithms. Graphs are incredibly versatile data structures that model relationships in a natural way. The algorithms we've explored—BFS, DFS, Dijkstra's, A*, Kruskal's, and topological sort—form the foundation for solving complex real-world problems.

To deepen your understanding, I recommend:

1. Implementing these algorithms on your own
2. Solving graph problems on platforms like LeetCode or HackerRank
3. Exploring the NetworkX library for more advanced functionality
4. Applying graphs to model problems in your domain

By mastering graphs, you gain access to powerful tools for tackling complex interconnected systems and relationships.
