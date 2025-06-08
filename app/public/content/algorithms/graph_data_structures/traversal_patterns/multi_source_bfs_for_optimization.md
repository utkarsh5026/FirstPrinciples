# Multi-source BFS for Graph Optimization: A Complete FAANG Interview Guide

Let me take you through Multi-source BFS from the absolute ground up, building each concept systematically so you understand not just the "how" but the fundamental "why" behind this powerful optimization technique.

## Understanding the Foundation: What is BFS?

Before we dive into multi-source BFS, let's establish the fundamental principles of Breadth-First Search (BFS).

> **Core Principle** : BFS explores a graph level by level, visiting all nodes at distance 1 before moving to nodes at distance 2, then distance 3, and so on.

Think of BFS like ripples in a pond when you drop a stone. The ripples expand outward in concentric circles, reaching closer points before distant ones.

### Single-Source BFS: The Building Block

```python
from collections import deque

def single_source_bfs(graph, start):
    """
    Basic BFS from a single starting point
  
    Args:
        graph: adjacency list representation
        start: starting node
  
    Returns:
        distances from start to all reachable nodes
    """
    # Queue stores (node, distance_from_start)
    queue = deque([(start, 0)])
  
    # Track visited nodes to avoid cycles
    visited = {start}
  
    # Store minimum distances
    distances = {start: 0}
  
    while queue:
        current_node, current_distance = queue.popleft()
      
        # Explore all neighbors
        for neighbor in graph[current_node]:
            if neighbor not in visited:
                visited.add(neighbor)
                new_distance = current_distance + 1
                distances[neighbor] = new_distance
                queue.append((neighbor, new_distance))
  
    return distances
```

**What's happening here?**

* We use a queue (FIFO) to ensure level-by-level exploration
* `visited` set prevents infinite loops in cyclic graphs
* Each node gets the shortest distance from the start node
* Time complexity: O(V + E) where V = vertices, E = edges

## The Limitation: Why Single-Source Isn't Always Enough

Consider this scenario: You're building a delivery optimization system. You have multiple warehouses and need to find the closest warehouse to each customer location.

With single-source BFS, you'd need to:

1. Run BFS from warehouse 1 → O(V + E)
2. Run BFS from warehouse 2 → O(V + E)
3. Run BFS from warehouse 3 → O(V + E)
4. ...and so on

Total time: O(W × (V + E)) where W = number of warehouses.

> **The Problem** : This approach is inefficient when you have multiple sources and need to find the optimal solution considering all of them simultaneously.

## Multi-source BFS: The Optimization Revolution

Multi-source BFS solves this by starting the search from **multiple sources simultaneously** in a single traversal.

> **Key Insight** : Instead of running separate BFS from each source, we initialize our queue with ALL sources at once, each starting at distance 0.

### The Conceptual Breakthrough

Imagine multiple stones dropped in a pond simultaneously. The ripples from each stone expand outward, and when they meet, we know we've found the optimal meeting point or closest source for each location.

```python
from collections import deque

def multi_source_bfs(graph, sources):
    """
    BFS starting from multiple sources simultaneously
  
    Args:
        graph: adjacency list representation  
        sources: list of source nodes
  
    Returns:
        For each node, the minimum distance to ANY source
        and which source provides that minimum distance
    """
    queue = deque()
    distances = {}
    closest_source = {}
  
    # Initialize: Add ALL sources to queue with distance 0
    for source in sources:
        queue.append((source, 0))
        distances[source] = 0
        closest_source[source] = source
  
    while queue:
        current_node, current_distance = queue.popleft()
      
        # If we've already found a shorter path, skip
        if current_distance > distances.get(current_node, float('inf')):
            continue
          
        for neighbor in graph[current_node]:
            new_distance = current_distance + 1
          
            # Only update if we found a shorter path
            if neighbor not in distances or new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
                closest_source[neighbor] = closest_source[current_node]
                queue.append((neighbor, new_distance))
  
    return distances, closest_source
```

**Critical Implementation Details:**

1. **Initialization** : All sources start at distance 0 simultaneously
2. **Natural Optimization** : The first time we reach a node, it's guaranteed to be via the shortest path from the closest source
3. **Single Traversal** : We only traverse the graph once, not once per source

## Visual Understanding: Step-by-Step Execution

Let's trace through a concrete example:

```
Graph visualization (portrait layout):
    A
   /|\
  B C D
  |   |
  E   F
```

 **Sources** : A and F

 **Step-by-step execution** :

```
Initial Queue: [(A,0), (F,0)]
Distances: {A:0, F:0}

Step 1: Process A
- Add B, C, D to queue with distance 1
Queue: [(F,0), (B,1), (C,1), (D,1)]
Distances: {A:0, F:0, B:1, C:1, D:1}

Step 2: Process F  
- Add D to queue with distance 1 (but D already has distance 1, so skip)
Queue: [(B,1), (C,1), (D,1)]

Step 3: Process B
- Add E with distance 2
Queue: [(C,1), (D,1), (E,2)]
Distances: {A:0, F:0, B:1, C:1, D:1, E:2}

Final result:
- A: distance 0 (source)
- B: distance 1 (closest to A)
- C: distance 1 (closest to A)  
- D: distance 1 (closest to A or F - tie)
- E: distance 2 (closest to A via B)
- F: distance 0 (source)
```

## FAANG Interview Pattern Recognition

Multi-source BFS appears in several classic interview patterns:

### Pattern 1: "Nearest/Closest" Problems

 **Problem** : Given a grid with obstacles and multiple targets, find the shortest distance from each cell to the nearest target.

```python
def shortest_distance_to_targets(grid, targets):
    """
    Find shortest distance from each cell to nearest target
  
    Grid: 2D array where 0 = empty, 1 = obstacle
    Targets: list of (row, col) coordinates
    """
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    distances = {}
  
    # Initialize all targets as sources
    for r, c in targets:
        if grid[r][c] == 0:  # Valid target
            queue.append((r, c, 0))
            distances[(r, c)] = 0
  
    # Directions: up, down, left, right
    directions = [(-1,0), (1,0), (0,-1), (0,1)]
  
    while queue:
        row, col, dist = queue.popleft()
      
        # Skip if we found a better path already
        if dist > distances.get((row, col), float('inf')):
            continue
          
        # Explore neighbors
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            new_dist = dist + 1
          
            # Check bounds and obstacles
            if (0 <= new_row < rows and 0 <= new_col < cols and 
                grid[new_row][new_col] == 0):
              
                current_dist = distances.get((new_row, new_col), float('inf'))
                if new_dist < current_dist:
                    distances[(new_row, new_col)] = new_dist
                    queue.append((new_row, new_col, new_dist))
  
    return distances
```

 **Key Insight** : By starting from all targets simultaneously, we automatically find the minimum distance to the nearest target for every cell.

### Pattern 2: "Spreading/Infection" Problems

 **Problem** : A virus spreads from multiple initial infection points. Find when each cell gets infected.

> **Mental Model** : Think of each infected cell as a source spreading the infection outward. Multi-source BFS naturally models this simultaneous spreading.

```python
def virus_spread_simulation(grid, initial_infected):
    """
    Simulate virus spread from multiple initial points
  
    Returns: time when each cell gets infected
    """
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    infection_time = {}
  
    # All initial infected cells start at time 0
    for r, c in initial_infected:
        queue.append((r, c, 0))
        infection_time[(r, c)] = 0
  
    directions = [(-1,0), (1,0), (0,-1), (0,1)]
  
    while queue:
        row, col, time = queue.popleft()
      
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            new_time = time + 1
          
            if (0 <= new_row < rows and 0 <= new_col < cols and
                grid[new_row][new_col] == 0 and  # Not blocked
                (new_row, new_col) not in infection_time):
              
                infection_time[(new_row, new_col)] = new_time
                queue.append((new_row, new_col, new_time))
  
    return infection_time
```

## Advanced Optimization: The "01-BFS" Variant

Sometimes edge weights aren't uniform. If edges have weights 0 or 1, we can still use a BFS-like approach with a deque optimization:

> **Principle** : For 0-weight edges, add to the front of queue (maintain same distance). For 1-weight edges, add to the back (increase distance).

```python
from collections import deque

def zero_one_bfs(graph, sources, edge_weights):
    """
    Multi-source BFS for graphs with 0/1 edge weights
  
    edge_weights: dict mapping (u,v) -> weight (0 or 1)
    """
    queue = deque()
    distances = {}
  
    # Initialize sources
    for source in sources:
        queue.append(source)
        distances[source] = 0
  
    while queue:
        current = queue.popleft()
      
        for neighbor in graph[current]:
            weight = edge_weights.get((current, neighbor), 1)
            new_distance = distances[current] + weight
          
            if neighbor not in distances or new_distance < distances[neighbor]:
                distances[neighbor] = new_distance
              
                if weight == 0:
                    queue.appendleft(neighbor)  # 0-weight: front
                else:
                    queue.append(neighbor)      # 1-weight: back
  
    return distances
```

## Complexity Analysis: Why This Optimization Matters

### Time Complexity Comparison

**Single-source approach** (running BFS from each source):

* Per source: O(V + E)
* Total: O(S × (V + E)) where S = number of sources

 **Multi-source approach** :

* Single traversal: O(V + E)
* Improvement factor: S times faster!

### Space Complexity

* Both approaches: O(V) for visited/distance tracking
* Multi-source uses slightly more queue space initially but same asymptotic complexity

> **Real-world Impact** : For a graph with 1000 sources, multi-source BFS is approximately 1000 times faster than the naive approach!

## Common FAANG Interview Problems

### Problem 1: Walls and Gates (LeetCode 286)

Fill each empty room with distance to nearest gate.

```python
def walls_and_gates(rooms):
    """
    rooms[i][j] = -1 (wall), 0 (gate), INF (empty room)
    Fill each empty room with distance to nearest gate
    """
    if not rooms or not rooms[0]:
        return
  
    rows, cols = len(rooms), len(rooms[0])
    queue = deque()
    INF = 2**31 - 1
  
    # Find all gates (sources)
    for r in range(rows):
        for c in range(cols):
            if rooms[r][c] == 0:  # Gate found
                queue.append((r, c, 0))
  
    directions = [(-1,0), (1,0), (0,-1), (0,1)]
  
    while queue:
        row, col, dist = queue.popleft()
      
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
          
            if (0 <= new_row < rows and 0 <= new_col < cols and
                rooms[new_row][new_col] == INF):
              
                rooms[new_row][new_col] = dist + 1
                queue.append((new_row, new_col, dist + 1))
```

 **Why Multi-source BFS Works Here** : All gates expand simultaneously, ensuring each room gets the shortest distance to ANY gate.

### Problem 2: Rotting Oranges (LeetCode 994)

Find minimum time for all oranges to rot, given multiple initially rotten oranges.

```python
def oranges_rotting(grid):
    """
    0 = empty, 1 = fresh orange, 2 = rotten orange
    Return minimum time for all oranges to rot
    """
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh_count = 0
  
    # Find all initially rotten oranges and count fresh ones
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c, 0))  # (row, col, time)
            elif grid[r][c] == 1:
                fresh_count += 1
  
    if fresh_count == 0:
        return 0  # No fresh oranges
  
    directions = [(-1,0), (1,0), (0,-1), (0,1)]
    max_time = 0
  
    while queue:
        row, col, time = queue.popleft()
        max_time = max(max_time, time)
      
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
          
            if (0 <= new_row < rows and 0 <= new_col < cols and
                grid[new_row][new_col] == 1):
              
                grid[new_row][new_col] = 2  # Make it rotten
                fresh_count -= 1
                queue.append((new_row, new_col, time + 1))
  
    return max_time if fresh_count == 0 else -1
```

## Interview Tips and Common Pitfalls

### Tip 1: Recognize the Pattern

> **Question to ask yourself** : "Am I looking for the shortest distance/time from ANY of multiple starting points?"

If yes, multi-source BFS is likely the optimal approach.

### Tip 2: Initialization is Crucial

```python
# CORRECT: Add all sources with distance 0
for source in sources:
    queue.append((source, 0))
    distances[source] = 0

# WRONG: This defeats the purpose
for source in sources:
    single_source_bfs(graph, source)  # Don't do this!
```

### Tip 3: Handle Edge Cases

```python
def robust_multi_source_bfs(graph, sources):
    # Edge case: No sources
    if not sources:
        return {}
  
    # Edge case: Empty graph  
    if not graph:
        return {}
  
    # Rest of implementation...
```

## Practice Problems for Mastery

1. **As Far from Land as Possible** (LeetCode 1162)
   * Find water cell farthest from any land cell
   * Use multi-source BFS starting from all land cells
2. **Shortest Path in Binary Matrix** (LeetCode 1091)
   * Modified to have multiple start/end points
   * Apply 01-BFS variant
3. **Cut Off Trees for Golf Event** (LeetCode 675)
   * Navigate between multiple tree locations optimally

> **Study Strategy** : For each problem, first identify if it fits the multi-source pattern, then implement step by step, always starting with the initialization of multiple sources.

Multi-source BFS is a powerful optimization that transforms potentially exponential algorithms into linear ones. Master this pattern, and you'll have a significant advantage in graph-related FAANG interviews!
