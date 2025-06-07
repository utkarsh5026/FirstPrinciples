# Bipartite Graph Detection and Two-Coloring: A Complete DSA Guide

Let me take you through this fundamental graph algorithm from the very beginning, building each concept step by step.

## Understanding Graphs from First Principles

Before we dive into bipartite graphs, let's establish what a graph actually is:

> **A graph is a mathematical structure consisting of vertices (nodes) connected by edges (links).** Think of it like a social network where people are vertices and friendships are edges.

```
Simple Graph Example:
    A --- B
    |     |
    |     |
    C --- D
```

In programming, we typically represent graphs using:

* **Adjacency List** : Each vertex stores a list of its neighbors
* **Adjacency Matrix** : A 2D array where matrix[i][j] = 1 if there's an edge between vertex i and j

## What is a Bipartite Graph?

> **A bipartite graph is a graph whose vertices can be divided into two disjoint sets such that no two vertices within the same set are adjacent (connected by an edge).**

Think of it like a dating app where you have two groups: Group A (one gender) and Group B (another gender), and connections only exist between different groups, never within the same group.

```
Bipartite Graph Example:
Set A: {1, 3}    Set B: {2, 4}

    1 ---- 2
    |      |
    |      |
    3 ---- 4

All edges connect vertices from Set A to Set B
```

```
Non-Bipartite Graph Example:
    1 ---- 2
    |      |
    |      |
    3 ---- 4
    |      |
    |      |
    5 ---- 6

Triangle formed by 1-2-4 makes it non-bipartite
```

## The Mathematical Foundation: Why Two-Coloring Works

> **A graph is bipartite if and only if it can be colored using exactly two colors such that no two adjacent vertices share the same color.**

This is the fundamental theorem that connects bipartite graphs to the two-coloring problem. Here's why this works:

1. **If a graph is bipartite** : We can color all vertices in Set A with Color 1 and all vertices in Set B with Color 2. Since no edges exist within sets, adjacent vertices will always have different colors.
2. **If a graph can be two-colored** : The vertices with Color 1 form one set, vertices with Color 2 form another set, and no edges exist within each colored group.

## Detection Algorithm: BFS Approach

Let's implement the BFS-based detection algorithm step by step:

```python
from collections import deque

def is_bipartite_bfs(graph):
    """
    Detect if a graph is bipartite using BFS and two-coloring
  
    Args:
        graph: adjacency list representation
    Returns:
        tuple: (is_bipartite: bool, coloring: dict)
    """
    n = len(graph)
    colors = [-1] * n  # -1 means uncolored, 0 and 1 are the two colors
  
    # Check each component separately (graph might be disconnected)
    for start in range(n):
        if colors[start] == -1:  # Unvisited component
            if not bfs_color_component(graph, start, colors):
                return False, {}
  
    # Convert colors array to dictionary for clarity
    color_dict = {i: colors[i] for i in range(n)}
    return True, color_dict

def bfs_color_component(graph, start, colors):
    """
    Color a single connected component using BFS
    """
    queue = deque([start])
    colors[start] = 0  # Start with color 0
  
    while queue:
        current = queue.popleft()
        current_color = colors[current]
        next_color = 1 - current_color  # Flip between 0 and 1
      
        # Check all neighbors
        for neighbor in graph[current]:
            if colors[neighbor] == -1:
                # Uncolored neighbor - assign opposite color
                colors[neighbor] = next_color
                queue.append(neighbor)
            elif colors[neighbor] == current_color:
                # Neighbor has same color - not bipartite!
                return False
  
    return True
```

Let me explain this algorithm step by step:

**Step 1: Initialize Colors**

```python
colors = [-1] * n  # -1 means uncolored
```

We use -1 to represent unvisited vertices, 0 and 1 as our two colors.

**Step 2: Handle Disconnected Components**

```python
for start in range(n):
    if colors[start] == -1:  # Found new component
```

> **Important** : A graph might have multiple disconnected components. Each component must be checked separately, but each component must individually be bipartite.

**Step 3: BFS Coloring Process**

```python
next_color = 1 - current_color  # Smart way to flip between 0 and 1
```

This elegant line switches between colors: if current_color is 0, next_color becomes 1, and vice versa.

**Step 4: Conflict Detection**

```python
elif colors[neighbor] == current_color:
    return False  # Same color conflict!
```

This is the crucial check - if we find two adjacent vertices with the same color, the graph cannot be bipartite.

## DFS Approach: Recursive Implementation

```python
def is_bipartite_dfs(graph):
    """
    Detect bipartite graph using DFS approach
    """
    n = len(graph)
    colors = [-1] * n
  
    def dfs(node, color):
        """
        Recursive DFS to color the graph
        Returns False if conflict found
        """
        colors[node] = color
      
        for neighbor in graph[node]:
            if colors[neighbor] == -1:
                # Uncolored neighbor - recursively color with opposite color
                if not dfs(neighbor, 1 - color):
                    return False
            elif colors[neighbor] == color:
                # Conflict: same color as current node
                return False
      
        return True
  
    # Check all components
    for i in range(n):
        if colors[i] == -1:
            if not dfs(i, 0):
                return False
  
    return True
```

**Key Differences from BFS:**

* Uses recursion instead of explicit queue
* More concise but uses stack space (O(V) in worst case)
* Same time complexity: O(V + E)

## Practical Example: Social Network Analysis

Let's trace through a concrete example:

```python
# Example: Friend recommendation system
# We want to check if we can divide users into two groups
# such that we only recommend friends from the opposite group

def analyze_social_network():
    # Graph representation: user_id -> list of connections
    social_graph = {
        0: [1, 3],     # User 0 connected to users 1, 3
        1: [0, 2],     # User 1 connected to users 0, 2  
        2: [1, 3],     # User 2 connected to users 1, 3
        3: [0, 2]      # User 3 connected to users 0, 2
    }
  
    # Convert to adjacency list format
    adj_list = [[] for _ in range(4)]
    for node, neighbors in social_graph.items():
        adj_list[node] = neighbors
  
    is_bip, coloring = is_bipartite_bfs(adj_list)
  
    if is_bip:
        print("✅ Can divide into two groups:")
        group_a = [user for user, color in coloring.items() if color == 0]
        group_b = [user for user, color in coloring.items() if color == 1]
        print(f"Group A: {group_a}")
        print(f"Group B: {group_b}")
    else:
        print("❌ Cannot divide into two groups")

# Output:
# ✅ Can divide into two groups:
# Group A: [0, 2]
# Group B: [1, 3]
```

**Tracing the Algorithm:**

```
Step 1: Start BFS from node 0, color it 0
Queue: [0]
Colors: [0, -1, -1, -1]

Step 2: Process node 0, check neighbors 1 and 3
- Color node 1 with color 1
- Color node 3 with color 1
Queue: [1, 3]
Colors: [0, 1, -1, 1]

Step 3: Process node 1, check neighbors 0 and 2
- Node 0 already colored 0 (different from 1) ✅
- Color node 2 with color 0
Queue: [3, 2]
Colors: [0, 1, 0, 1]

Step 4: Process node 3, check neighbors 0 and 2
- Node 0 has color 0 (different from 1) ✅
- Node 2 has color 0 (different from 1) ✅
Queue: [2]

Step 5: Process node 2, check neighbors 1 and 3
- Node 1 has color 1 (different from 0) ✅
- Node 3 has color 1 (different from 0) ✅
Queue: []

Result: Bipartite! Groups are {0,2} and {1,3}
```

## FAANG Interview Variations and Patterns

### 1. **Classic Bipartite Detection**

```python
def isBipartite(graph):
    """
    LeetCode 785: Is Graph Bipartite?
    """
    n = len(graph)
    colors = [0] * n  # 0: uncolored, 1: color A, -1: color B
  
    for i in range(n):
        if colors[i] == 0:
            stack = [i]
            colors[i] = 1
          
            while stack:
                node = stack.pop()
                for neighbor in graph[node]:
                    if colors[neighbor] == 0:
                        colors[neighbor] = -colors[node]
                        stack.append(neighbor)
                    elif colors[neighbor] == colors[node]:
                        return False
    return True
```

### 2. **Possible Bipartition (with Dislikes)**

```python
def possibleBipartition(n, dislikes):
    """
    LeetCode 886: People can be divided into two groups
    where people in dislikes cannot be in same group
    """
    # Build adjacency list from dislikes
    graph = [[] for _ in range(n + 1)]
    for a, b in dislikes:
        graph[a].append(b)
        graph[b].append(a)
  
    colors = [0] * (n + 1)
  
    def dfs(node, color):
        colors[node] = color
        for neighbor in graph[node]:
            if colors[neighbor] == color:
                return False
            if colors[neighbor] == 0 and not dfs(neighbor, -color):
                return False
        return True
  
    for i in range(1, n + 1):
        if colors[i] == 0:
            if not dfs(i, 1):
                return False
    return True
```

## Advanced Concepts and Edge Cases

### **Handling Disconnected Graphs**

> **Critical Insight** : A disconnected graph is bipartite if and only if each of its connected components is bipartite.

```python
def count_bipartite_components(graph):
    """
    Count how many connected components are bipartite
    """
    n = len(graph)
    visited = [False] * n
    bipartite_components = 0
  
    def is_component_bipartite(start):
        colors = [-1] * n
        queue = deque([start])
        colors[start] = 0
      
        while queue:
            node = queue.popleft()
            visited[node] = True
          
            for neighbor in graph[node]:
                if colors[neighbor] == -1:
                    colors[neighbor] = 1 - colors[node]
                    queue.append(neighbor)
                elif colors[neighbor] == colors[node]:
                    return False
        return True
  
    for i in range(n):
        if not visited[i]:
            if is_component_bipartite(i):
                bipartite_components += 1
  
    return bipartite_components
```

### **Memory Optimization**

For very large graphs, we can optimize memory usage:

```python
def is_bipartite_optimized(graph):
    """
    Space-optimized version using sets instead of arrays
    """
    unvisited = set(range(len(graph)))
    color_a = set()
    color_b = set()
  
    while unvisited:
        start = unvisited.pop()
        queue = deque([start])
        color_a.add(start)
      
        while queue:
            node = queue.popleft()
            node_in_a = node in color_a
            target_set = color_b if node_in_a else color_a
          
            for neighbor in graph[node]:
                if neighbor in unvisited:
                    unvisited.remove(neighbor)
                    target_set.add(neighbor)
                    queue.append(neighbor)
                elif (neighbor in color_a) == node_in_a:
                    return False
  
    return True
```

## Time and Space Complexity Analysis

> **Time Complexity: O(V + E)** where V is vertices and E is edges
>
> * We visit each vertex exactly once
> * We examine each edge exactly twice (once from each endpoint)

> **Space Complexity: O(V)**
>
> * Colors array: O(V)
> * Queue/Stack for BFS/DFS: O(V) in worst case
> * Recursion stack for DFS: O(V) in worst case

```python
def complexity_demonstration():
    """
    Demonstrate how complexity scales
    """
    import time
  
    def create_test_graph(n):
        # Create a bipartite graph: complete bipartite graph K_{n/2, n/2}
        graph = [[] for _ in range(n)]
        mid = n // 2
      
        for i in range(mid):
            for j in range(mid, n):
                graph[i].append(j)
                graph[j].append(i)
      
        return graph
  
    sizes = [100, 500, 1000, 5000]
  
    for n in sizes:
        graph = create_test_graph(n)
        start_time = time.time()
        is_bipartite_bfs(graph)
        end_time = time.time()
      
        print(f"n={n}: {end_time - start_time:.4f} seconds")
```

## Common Interview Patterns and Gotchas

### **Pattern 1: Graph Construction from Constraints**

```python
def solve_team_division(n, conflicts):
    """
    Given conflicts between people, can we divide into 2 teams?
    """
    # Build conflict graph
    graph = [[] for _ in range(n)]
    for person1, person2 in conflicts:
        graph[person1].append(person2)
        graph[person2].append(person1)
  
    return is_bipartite_bfs(graph)[0]
```

### **Pattern 2: Multiple Constraint Types**

```python
def complex_grouping(n, must_same_group, must_different_group):
    """
    Handle both 'must be together' and 'must be separate' constraints
    """
    # First, handle must_same_group using Union-Find
    parent = list(range(n))
  
    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]
  
    def union(x, y):
        px, py = find(x), find(y)
        if px != py:
            parent[px] = py
  
    for a, b in must_same_group:
        union(a, b)
  
    # Build conflict graph using representatives
    conflicts = [[] for _ in range(n)]
    for a, b in must_different_group:
        rep_a, rep_b = find(a), find(b)
        if rep_a == rep_b:
            return False  # Contradiction!
        conflicts[rep_a].append(rep_b)
        conflicts[rep_b].append(rep_a)
  
    return is_bipartite_bfs(conflicts)[0]
```

## Interview Tips and Common Mistakes

> **Mistake 1** : Forgetting to handle disconnected components
> **Solution** : Always iterate through all vertices and check unvisited ones

> **Mistake 2** : Using wrong data structures for the problem constraints
> **Solution** : Read carefully - sometimes you need adjacency matrix, sometimes adjacency list

> **Mistake 3** : Not handling self-loops correctly
> **Solution** : A self-loop makes a graph non-bipartite immediately

```python
def robust_bipartite_check(edges, n):
    """
    Handle edge cases robustly
    """
    # Check for self-loops first
    for u, v in edges:
        if u == v:
            return False  # Self-loop = not bipartite
  
    # Build adjacency list
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)
  
    return is_bipartite_bfs(graph)[0]
```

This comprehensive understanding of bipartite graphs and two-coloring will serve you well in technical interviews. The key is recognizing when a problem can be modeled as a bipartite graph detection problem and implementing the solution efficiently while handling all edge cases.
