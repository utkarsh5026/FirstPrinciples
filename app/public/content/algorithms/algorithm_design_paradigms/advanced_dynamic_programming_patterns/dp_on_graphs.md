# Dynamic Programming on Graphs: Shortest Paths & Path Counting for FAANG Interviews

Let me take you on a comprehensive journey through one of the most powerful algorithmic paradigms in computer science - Dynamic Programming applied to graph problems. We'll build this understanding from the ground up, ensuring every concept is crystal clear.

## Understanding the Foundation: What Are Graphs?

Before diving into dynamic programming on graphs, let's establish our foundation. A graph is simply a collection of **vertices** (nodes) connected by  **edges** . Think of it like a social network where people are vertices and friendships are edges.

> **Key Insight** : Graphs are everywhere in real-world problems - from finding the shortest route on Google Maps to analyzing social networks, from dependency resolution in package managers to recommendation systems.

## The Marriage of Dynamic Programming and Graphs

Dynamic Programming (DP) is fundamentally about **optimal substructure** and  **overlapping subproblems** . When we apply DP to graphs, we're looking for problems where:

1. **Optimal Substructure** : The optimal solution contains optimal solutions to subproblems
2. **Overlapping Subproblems** : We encounter the same subproblems multiple times

> **Critical Understanding** : In graph DP, we typically use memoization or tabulation to store results of visiting certain vertices or states, avoiding redundant calculations.

## Core Graph DP Pattern: State Definition

The most crucial step in graph DP is defining our  **state** . Common state definitions include:

* `dp[node]` = optimal value ending at node
* `dp[node][k]` = optimal value ending at node using exactly k steps
* `dp[i][j]` = optimal value from vertex i to vertex j

Let me illustrate with our first fundamental problem.

## Shortest Path Problems: The Foundation

### 1. Single Source Shortest Path (Dijkstra's Algorithm as DP)

Let's start with the most intuitive shortest path problem. Dijkstra's algorithm is actually a form of dynamic programming!

```python
import heapq
from collections import defaultdict

def dijkstra_shortest_path(graph, start):
    """
    Find shortest paths from start to all other vertices
  
    State Definition: dp[node] = shortest distance from start to node
    Transition: dp[neighbor] = min(dp[neighbor], dp[current] + edge_weight)
    """
    # dp[node] represents minimum distance from start to node
    dp = defaultdict(lambda: float('inf'))
    dp[start] = 0
  
    # Priority queue: (distance, node)
    pq = [(0, start)]
    visited = set()
  
    while pq:
        current_dist, current_node = heapq.heappop(pq)
      
        # Skip if we've already processed this node optimally
        if current_node in visited:
            continue
          
        visited.add(current_node)
      
        # Explore all neighbors
        for neighbor, weight in graph[current_node]:
            new_distance = dp[current_node] + weight
          
            # DP transition: update if we found a better path
            if new_distance < dp[neighbor]:
                dp[neighbor] = new_distance
                heapq.heappush(pq, (new_distance, neighbor))
  
    return dict(dp)
```

> **Why This Is DP** : We're building optimal solutions incrementally. The shortest path to any vertex is built using the shortest paths to previous vertices.

Let's trace through a small example:

```
Graph: A --3--> B --2--> C
       |        |
       5        4
       |        |
       v        v
       D --1--> E

Starting from A:
Step 1: dp[A] = 0
Step 2: dp[B] = 3, dp[D] = 5
Step 3: dp[C] = 5, dp[E] = 7 (from B) then dp[E] = 6 (from D)
```

### 2. All-Pairs Shortest Path (Floyd-Warshall)

When we need shortest paths between ALL pairs of vertices, Floyd-Warshall gives us a beautiful DP formulation:

```python
def floyd_warshall(n, edges):
    """
    Find shortest paths between all pairs of vertices
  
    State Definition: dp[i][j][k] = shortest path from i to j using vertices 0..k as intermediates
    Optimized to: dp[i][j] = shortest path from i to j
    """
    # Initialize distance matrix
    INF = float('inf')
    dp = [[INF] * n for _ in range(n)]
  
    # Distance from vertex to itself is 0
    for i in range(n):
        dp[i][i] = 0
  
    # Fill in direct edges
    for u, v, weight in edges:
        dp[u][v] = weight
  
    # Core DP: try each vertex as intermediate
    for k in range(n):  # Intermediate vertex
        for i in range(n):  # Source
            for j in range(n):  # Destination
                # Can we improve path i->j by going through k?
                if dp[i][k] + dp[k][j] < dp[i][j]:
                    dp[i][j] = dp[i][k] + dp[k][j]
  
    return dp
```

> **The Beautiful Insight** : We're asking "Can vertex k help us find a shorter path from i to j?" This is the essence of the DP transition.

### 3. Shortest Path with Exactly K Edges

This is where DP on graphs gets particularly elegant for interview problems:

```python
def shortest_path_k_edges(graph, start, end, k):
    """
    Find shortest path from start to end using exactly k edges
  
    State Definition: dp[node][steps] = minimum cost to reach node using exactly 'steps' edges
    """
    n = len(graph)
    # dp[node][steps] = min cost to reach node in exactly steps
    dp = [[float('inf')] * (k + 1) for _ in range(n)]
  
    # Base case: starting point with 0 steps
    dp[start][0] = 0
  
    # Fill DP table
    for steps in range(1, k + 1):
        for node in range(n):
            # Try coming from each neighbor
            for neighbor, weight in graph[node]:
                if dp[neighbor][steps - 1] != float('inf'):
                    dp[node][steps] = min(dp[node][steps], 
                                        dp[neighbor][steps - 1] + weight)
  
    return dp[end][k] if dp[end][k] != float('inf') else -1
```

> **Interview Gold** : This pattern appears frequently in problems like "Cheapest Flights Within K Stops" - a classic FAANG question!

## Path Counting Problems: The Art of Enumeration

Now let's explore the fascinating world of counting paths in graphs using DP.

### 1. Basic Path Counting

```python
def count_paths(graph, start, end):
    """
    Count number of paths from start to end in a DAG
  
    State Definition: dp[node] = number of ways to reach 'end' from 'node'
    """
    memo = {}
  
    def dfs(current):
        # Base case: reached destination
        if current == end:
            return 1
      
        # Memoization: avoid recomputing
        if current in memo:
            return memo[current]
      
        # Count paths through all neighbors
        total_paths = 0
        for neighbor in graph[current]:
            total_paths += dfs(neighbor)
      
        memo[current] = total_paths
        return total_paths
  
    return dfs(start)
```

### 2. Path Counting with Constraints

Let's solve a more complex problem: counting paths of exactly length k.

```python
def count_paths_length_k(adj_matrix, start, end, k):
    """
    Count paths from start to end with exactly k edges
  
    State Definition: dp[node][length] = number of paths to reach 'end' from 'node' in exactly 'length' steps
    """
    n = len(adj_matrix)
    # dp[node][steps] = ways to reach end from node in exactly steps
    dp = [[0] * (k + 1) for _ in range(n)]
  
    # Base case: from end to end in 0 steps = 1 way
    dp[end][0] = 1
  
    # Fill the DP table
    for length in range(1, k + 1):
        for node in range(n):
            for neighbor in range(n):
                if adj_matrix[node][neighbor]:  # If edge exists
                    dp[node][length] += dp[neighbor][length - 1]
  
    return dp[start][k]
```

> **Matrix Exponentiation Connection** : This problem is actually equivalent to raising the adjacency matrix to the power k and looking at entry [start][end]!

### 3. Path Counting in a Grid (Classic Interview Problem)

The famous "Unique Paths" problem demonstrates grid-based path counting:

```python
def unique_paths_with_obstacles(grid):
    """
    Count unique paths from top-left to bottom-right avoiding obstacles
  
    State Definition: dp[i][j] = number of ways to reach cell (i,j)
    """
    if not grid or grid[0][0] == 1:
        return 0
  
    m, n = len(grid), len(grid[0])
    dp = [[0] * n for _ in range(m)]
  
    # Base case: starting position
    dp[0][0] = 1
  
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 1:  # Obstacle
                dp[i][j] = 0
            else:
                if i > 0:  # Can come from above
                    dp[i][j] += dp[i-1][j]
                if j > 0:  # Can come from left
                    dp[i][j] += dp[i][j-1]
  
    return dp[m-1][n-1]
```

## Advanced Patterns for FAANG Interviews

### 1. DP on Trees (Special Case of Graphs)

```python
def max_path_sum_tree(root):
    """
    Find maximum path sum in a binary tree
  
    State Definition: For each node, track max path sum ending at that node
    """
    def dfs(node):
        if not node:
            return 0
      
        # Get max path sums from children (ignore negative contributions)
        left_sum = max(0, dfs(node.left))
        right_sum = max(0, dfs(node.right))
      
        # Max path through current node
        path_through_node = node.val + left_sum + right_sum
      
        # Update global maximum
        self.max_sum = max(self.max_sum, path_through_node)
      
        # Return max path ending at current node
        return node.val + max(left_sum, right_sum)
  
    self.max_sum = float('-inf')
    dfs(root)
    return self.max_sum
```

### 2. State Compression Techniques

For problems with large state spaces, we often need to compress our DP state:

```python
def shortest_path_visiting_all_nodes(graph):
    """
    TSP-like problem: visit all nodes with minimum cost
  
    State Definition: dp[mask][node] = min cost to visit nodes in mask, ending at node
    """
    n = len(graph)
    # Bitmask DP: mask represents set of visited nodes
    dp = {}
  
    def solve(mask, node):
        if mask == (1 << n) - 1:  # All nodes visited
            return 0
      
        if (mask, node) in dp:
            return dp[(mask, node)]
      
        result = float('inf')
        for neighbor, weight in graph[node]:
            if not (mask & (1 << neighbor)):  # If neighbor not visited
                new_mask = mask | (1 << neighbor)
                result = min(result, weight + solve(new_mask, neighbor))
      
        dp[(mask, node)] = result
        return result
  
    # Try starting from each node
    min_cost = float('inf')
    for start in range(n):
        min_cost = min(min_cost, solve(1 << start, start))
  
    return min_cost
```

## Mobile-Optimized Algorithm Visualization

```
Dynamic Programming on Graphs - Key Patterns:

📊 SHORTEST PATHS
├── Single Source (Dijkstra)
│   └── State: dp[node] = min_dist
├── All Pairs (Floyd-Warshall) 
│   └── State: dp[i][j] = min_dist(i→j)
└── K-Edges Constraint
    └── State: dp[node][k] = min_dist_k_steps

🔢 PATH COUNTING  
├── Basic Counting
│   └── State: dp[node] = paths_to_target
├── Length Constraint
│   └── State: dp[node][len] = paths_len_k  
└── Grid Problems
    └── State: dp[i][j] = paths_to_cell

🎯 INTERVIEW FAVORITES
├── Tree DP (Max Path Sum)
├── Bitmask DP (TSP variants)
└── State Compression
```

## Common Interview Problem Patterns

> **Pattern Recognition** : Most graph DP problems in FAANG interviews fall into these categories:

1. **Shortest/Longest Path Variants** : Dijkstra with modifications, paths with constraints
2. **Path Counting** : Unique paths, paths with specific properties
3. **Tree DP** : Maximum/minimum values in trees
4. **State Space Search** : Using bitmasks or complex states

### Example: Classic "Network Delay Time" Problem

```python
def network_delay_time(times, n, k):
    """
    Classic FAANG problem: find time for signal to reach all nodes
  
    This is essentially single-source shortest path with a twist
    """
    graph = defaultdict(list)
    for u, v, w in times:
        graph[u].append((v, w))
  
    # Standard Dijkstra
    dist = {i: float('inf') for i in range(1, n + 1)}
    dist[k] = 0
    pq = [(0, k)]
  
    while pq:
        d, node = heapq.heappop(pq)
        if d > dist[node]:
            continue
          
        for neighbor, weight in graph[node]:
            new_dist = dist[node] + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                heapq.heappush(pq, (new_dist, neighbor))
  
    max_time = max(dist.values())
    return max_time if max_time != float('inf') else -1
```

## Key Takeaways for FAANG Success

> **Master These Concepts** :
>
> 1. **State Definition** : Always clearly define what your DP state represents
> 2. **Transition Relations** : Understand how current state relates to previous states
> 3. **Base Cases** : Identify and handle boundary conditions carefully
> 4. **Optimization** : Know when to use memoization vs tabulation
> 5. **Space Optimization** : Understand when you can reduce space complexity

The beauty of DP on graphs lies in its ability to break down complex problems into manageable subproblems. Whether you're finding shortest paths, counting routes, or optimizing network flows, the fundamental principle remains the same:  **build optimal solutions incrementally using previously computed results** .

Practice these patterns, understand the underlying principles, and you'll be well-equipped to tackle any graph DP problem in your FAANG interviews!
