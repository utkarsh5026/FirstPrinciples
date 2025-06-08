# BFS for Shortest Path in Unweighted Graphs: A Complete FAANG Interview Guide

Let me take you through one of the most fundamental and frequently asked concepts in FAANG interviews - using Breadth-First Search (BFS) to find the shortest path in unweighted graphs.

## Understanding the Foundation: What Are We Actually Solving?

Before we dive into BFS, let's establish the first principles.

### What is an Unweighted Graph?

An **unweighted graph** is a collection of nodes (vertices) connected by edges where each edge has the same "cost" or "weight" - essentially, moving from any node to any directly connected neighbor takes exactly one step.

```
Simple unweighted graph:
    A --- B
    |     |
    C --- D
```

> **Key Insight** : In unweighted graphs, the shortest path is simply the path with the fewest edges. This is crucial because it's why BFS works perfectly here.

### What Does "Shortest Path" Mean?

The shortest path between two nodes is the path that requires the minimum number of edge traversals to get from source to destination.

## Why BFS Works: The Core Principle

Here's the fundamental insight that makes BFS perfect for this problem:

> **First Principle** : BFS explores nodes in order of their distance from the source. It visits all nodes at distance 1, then all nodes at distance 2, then distance 3, and so on.

This means when BFS first reaches a node, it has found the shortest path to that node. Why? Because if there were a shorter path, BFS would have found it earlier!

Let me illustrate this with a step-by-step example:

```
Graph:
    A --- B --- E
    |     |     |
    C --- D --- F

Starting from A, BFS explores:
Level 0: A (distance 0)
Level 1: B, C (distance 1)  
Level 2: E, D (distance 2)
Level 3: F (distance 3)
```

## The BFS Algorithm: Step by Step

Let's build the algorithm from first principles:

### Step 1: The Basic Structure

```python
from collections import deque

def bfs_shortest_path(graph, start, target):
    # Queue stores (node, distance) pairs
    queue = deque([(start, 0)])
    visited = {start}
  
    while queue:
        current_node, distance = queue.popleft()
      
        # Found our target!
        if current_node == target:
            return distance
      
        # Explore neighbors
        for neighbor in graph[current_node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, distance + 1))
  
    return -1  # Path not found
```

Let me explain each component in detail:

> **The Queue** : We use a deque (double-ended queue) because we need to add elements to the back and remove from the front efficiently. This ensures we process nodes in the correct order.

> **The Visited Set** : This prevents us from revisiting nodes and getting stuck in cycles. Once we've found the shortest path to a node, we never need to visit it again.

> **Distance Tracking** : We track the distance as we go, incrementing it each time we move to a neighbor.

### Step 2: Enhanced Version with Path Reconstruction

Often in interviews, they'll ask you to return the actual path, not just the distance:

```python
def bfs_shortest_path_with_path(graph, start, target):
    queue = deque([(start, 0, [start])])
    visited = {start}
  
    while queue:
        current_node, distance, path = queue.popleft()
      
        if current_node == target:
            return distance, path
      
        for neighbor in graph[current_node]:
            if neighbor not in visited:
                visited.add(neighbor)
                new_path = path + [neighbor]
                queue.append((neighbor, distance + 1, new_path))
  
    return -1, []
```

**What's happening here?**

* We store the entire path as we explore
* `path + [neighbor]` creates a new list with the neighbor added
* When we find the target, we return both distance and the complete path

## Complete Example Walkthrough

Let's trace through a concrete example to solidify understanding:

```python
# Graph representation as adjacency list
graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'D'],
    'D': ['B', 'C', 'F'],
    'E': ['B'],
    'F': ['D']
}

# Find shortest path from A to F
```

Let me trace this step by step:

```
Initial: queue = [('A', 0)], visited = {'A'}

Step 1: Process A
- Remove ('A', 0) from queue
- A ≠ F, so check neighbors: B, C
- Add B and C to queue and visited
- queue = [('B', 1), ('C', 1)], visited = {'A', 'B', 'C'}

Step 2: Process B  
- Remove ('B', 1) from queue
- B ≠ F, check neighbors: A, D, E
- A already visited, add D and E
- queue = [('C', 1), ('D', 2), ('E', 2)], visited = {'A', 'B', 'C', 'D', 'E'}

Step 3: Process C
- Remove ('C', 1) from queue  
- C ≠ F, check neighbors: A, D
- Both already visited, nothing to add
- queue = [('D', 2), ('E', 2)]

Step 4: Process D
- Remove ('D', 2) from queue
- D ≠ F, check neighbors: B, C, F
- B, C already visited, add F
- queue = [('E', 2), ('F', 3)], visited = {'A', 'B', 'C', 'D', 'E', 'F'}

Step 5: Process E  
- Remove ('E', 2) from queue
- E ≠ F, check neighbors: B
- B already visited
- queue = [('F', 3)]

Step 6: Process F
- Remove ('F', 3) from queue  
- F = F, return distance 3!
```

> **Key Observation** : BFS found F at distance 3, which is indeed the shortest path: A → B → D → F or A → C → D → F.

## Time and Space Complexity Analysis

Understanding complexity is crucial for FAANG interviews:

**Time Complexity: O(V + E)**

* V = number of vertices, E = number of edges
* We visit each vertex at most once: O(V)
* We examine each edge at most once: O(E)
* Combined: O(V + E)

**Space Complexity: O(V)**

* Queue can hold at most all vertices: O(V)
* Visited set stores all vertices: O(V)
* Combined: O(V)

## Common Variations You'll See in Interviews

### 1. Grid-Based BFS (Very Common)

```python
def shortest_path_grid(grid, start, target):
    rows, cols = len(grid), len(grid[0])
    queue = deque([(start[0], start[1], 0)])
    visited = {start}
  
    # Four directions: up, down, left, right
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
  
    while queue:
        row, col, distance = queue.popleft()
      
        if (row, col) == target:
            return distance
      
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
          
            # Check bounds and obstacles
            if (0 <= new_row < rows and 
                0 <= new_col < cols and 
                grid[new_row][new_col] != 1 and  # 1 = obstacle
                (new_row, new_col) not in visited):
              
                visited.add((new_row, new_col))
                queue.append((new_row, new_col, distance + 1))
  
    return -1
```

**What's different here?**

* We use coordinates (row, col) instead of node names
* We check grid boundaries and obstacles
* We use direction vectors to explore neighbors

### 2. Multi-Source BFS

Sometimes you start from multiple sources simultaneously:

```python
def shortest_path_multi_source(graph, sources, target):
    queue = deque()
    visited = set()
  
    # Add all sources to queue with distance 0
    for source in sources:
        queue.append((source, 0))
        visited.add(source)
  
    while queue:
        current_node, distance = queue.popleft()
      
        if current_node == target:
            return distance
      
        for neighbor in graph[current_node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, distance + 1))
  
    return -1
```

## FAANG Interview Tips and Common Pitfalls

### Things Interviewers Look For:

> **1. Correct Algorithm Choice** : Recognizing that BFS is optimal for unweighted shortest path problems.

> **2. Implementation Details** : Proper use of queue, visited set, and distance tracking.

> **3. Edge Case Handling** : What if start == target? What if no path exists?

> **4. Code Quality** : Clean, readable code with meaningful variable names.

### Common Mistakes to Avoid:

```python
# ❌ WRONG: Using DFS for shortest path
def wrong_shortest_path(graph, start, target):
    # DFS might find A path, but not the shortest!
    pass

# ❌ WRONG: Not using visited set
def wrong_bfs(graph, start, target):
    queue = deque([(start, 0)])
    # Missing visited set leads to infinite loops!
  
# ❌ WRONG: Using wrong data structure
def wrong_queue(graph, start, target):
    stack = [start]  # Stack gives DFS behavior, not BFS!
```

### Interview-Ready Template:

```python
def shortest_path_bfs(graph, start, target):
    # Edge case: start is target
    if start == target:
        return 0
  
    # BFS setup
    queue = deque([(start, 0)])
    visited = {start}
  
    # BFS traversal
    while queue:
        current_node, distance = queue.popleft()
      
        # Explore all neighbors
        for neighbor in graph[current_node]:
            # Skip if already visited
            if neighbor in visited:
                continue
              
            # Check if we found target
            if neighbor == target:
                return distance + 1
          
            # Add to queue for further exploration
            visited.add(neighbor)
            queue.append((neighbor, distance + 1))
  
    # No path found
    return -1
```

## Practice Problems to Master

> **Essential Problems** :
>
> 1. Word Ladder (LeetCode 127)
> 2. Rotting Oranges (LeetCode 994)
> 3. 01 Matrix (LeetCode 542)
> 4. Shortest Path in Binary Matrix (LeetCode 1091)

Each of these problems tests your understanding of BFS for shortest path in different contexts, helping you recognize the pattern when it appears in interviews.

The key to mastering BFS for shortest path is understanding the fundamental principle: **BFS explores nodes in order of distance, guaranteeing that the first time you reach a node, you've found the shortest path to it.** Once you internalize this insight, the implementation becomes straightforward and you'll confidently tackle any variation in your FAANG interviews.
