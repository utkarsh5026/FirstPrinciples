# Modified DFS for Graphs: A Complete Deep Dive for FAANG Interviews

## Understanding DFS from First Principles

Before diving into modifications, let's establish what Depth-First Search fundamentally is and why we need to modify it.

> **Core Principle** : DFS is a graph traversal algorithm that explores as far as possible along each branch before backtracking. Think of it like exploring a maze by always taking the first path you see and only turning back when you hit a dead end.

### The Basic DFS Foundation

```python
def basic_dfs(graph, start, visited=None):
    """
    Basic DFS implementation - our foundation
  
    Args:
        graph: Dictionary representing adjacency list
        start: Starting node
        visited: Set to track visited nodes
    """
    if visited is None:
        visited = set()
  
    # Mark current node as visited
    visited.add(start)
    print(f"Visiting: {start}")
  
    # Explore all unvisited neighbors
    for neighbor in graph[start]:
        if neighbor not in visited:
            basic_dfs(graph, neighbor, visited)
  
    return visited
```

**What's happening here?**

* We mark the current node as visited (preventing infinite loops)
* We recursively explore each unvisited neighbor
* The recursion stack naturally handles the "backtracking" behavior

But in FAANG interviews, basic DFS rarely suffices. You need **modifications** to solve complex problems.

## What Makes DFS "Modified"?

> **Key Insight** : Modified DFS means adapting the core DFS algorithm by changing what we track, when we visit nodes, or how we handle the traversal state to solve specific problems.

Common modifications include:

* **State tracking** during traversal
* **Path recording** and backtracking
* **Cycle detection** mechanisms
* **Conditional visiting** based on problem constraints
* **Multiple DFS calls** with different purposes

## Core Modified DFS Patterns for FAANG

### 1. Path Tracking DFS

This modification tracks the current path during traversal, essential for problems involving routes, cycles, or path-dependent decisions.

```python
def path_tracking_dfs(graph, start, target, current_path=None, all_paths=None):
    """
    DFS that tracks all paths from start to target
  
    Key Modification: We maintain current_path and backtrack by removing nodes
    """
    if current_path is None:
        current_path = []
    if all_paths is None:
        all_paths = []
  
    # Add current node to path
    current_path.append(start)
  
    # If we reached target, save this path
    if start == target:
        all_paths.append(current_path.copy())  # Important: copy the path!
    else:
        # Continue exploring neighbors
        for neighbor in graph[start]:
            if neighbor not in current_path:  # Avoid cycles in current path
                path_tracking_dfs(graph, neighbor, target, current_path, all_paths)
  
    # CRUCIAL: Backtrack by removing current node
    current_path.pop()
  
    return all_paths
```

**Why the modification matters:**

* `current_path.append(start)` - We track our journey
* `neighbor not in current_path` - We avoid cycles within a single path
* `current_path.pop()` - We backtrack to explore other possibilities

### 2. State-Based DFS

This modification maintains additional state information that influences traversal decisions.

```python
def state_based_dfs(grid, row, col, visited, original_color, new_color):
    """
    DFS for flood fill algorithm - classic FAANG problem
  
    Key Modification: We carry state (colors) and have conditional visiting
    """
    # Boundary checks
    if (row < 0 or row >= len(grid) or 
        col < 0 or col >= len(grid[0])):
        return
  
    # State-based conditions
    if (row, col) in visited:
        return
    if grid[row][col] != original_color:
        return
  
    # Mark as visited and change state
    visited.add((row, col))
    grid[row][col] = new_color
  
    # Explore 4 directions
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    for dr, dc in directions:
        state_based_dfs(grid, row + dr, col + dc, visited, original_color, new_color)
```

**State modifications explained:**

* We check multiple conditions before visiting
* We modify the grid state as we traverse
* Boundary conditions become part of our traversal logic

## Advanced Modified DFS Applications

### 1. Cycle Detection with Colors (Three-State DFS)

> **FAANG Favorite** : This pattern appears in dependency resolution, deadlock detection, and topological sorting problems.

```python
def detect_cycle_directed_graph(graph):
    """
    Detect cycles in directed graph using three-color DFS
  
    States: WHITE (0) = unvisited, GRAY (1) = in progress, BLACK (2) = completed
    """
    WHITE, GRAY, BLACK = 0, 1, 2
    colors = {node: WHITE for node in graph}
  
    def dfs(node):
        if colors[node] == GRAY:  # Back edge found = cycle!
            return True
        if colors[node] == BLACK:  # Already processed
            return False
      
        # Mark as in progress
        colors[node] = GRAY
      
        # Explore neighbors
        for neighbor in graph[node]:
            if dfs(neighbor):
                return True
      
        # Mark as completed
        colors[node] = BLACK
        return False
  
    # Check all components
    for node in graph:
        if colors[node] == WHITE:
            if dfs(node):
                return True
    return False
```

**Three-state logic breakdown:**

* **WHITE** : Node not yet visited
* **GRAY** : Node currently being processed (in recursion stack)
* **BLACK** : Node completely processed

> **Critical Insight** : If we encounter a GRAY node during traversal, we've found a back edge, indicating a cycle.

### 2. Island Counting with Connected Components

```python
def count_islands(grid):
    """
    Count islands in 2D grid - classic FAANG problem
  
    Modification: DFS marks entire connected component as visited
    """
    if not grid or not grid[0]:
        return 0
  
    rows, cols = len(grid), len(grid[0])
    visited = set()
    island_count = 0
  
    def dfs_island(row, col):
        """Helper DFS to mark entire island as visited"""
        if (row < 0 or row >= rows or 
            col < 0 or col >= cols or
            (row, col) in visited or 
            grid[row][col] == '0'):
            return
      
        visited.add((row, col))
      
        # Explore all 4 directions
        for dr, dc in [(0,1), (0,-1), (1,0), (-1,0)]:
            dfs_island(row + dr, col + dc)
  
    # Main logic: start DFS from each unvisited land cell
    for row in range(rows):
        for col in range(cols):
            if grid[row][col] == '1' and (row, col) not in visited:
                dfs_island(row, col)  # Mark entire island
                island_count += 1     # Increment count
  
    return island_count
```

**Connected component logic:**

* Each DFS call marks an entire connected component
* We count how many times we need to start a new DFS

## Complex Modified DFS: Parentheses Generation

Let's examine a sophisticated modification that combines multiple techniques:

```python
def generate_parentheses(n):
    """
    Generate all valid parentheses combinations
  
    Multiple Modifications:
    - State tracking (open/close counts)
    - Path building with backtracking
    - Conditional exploration based on validity rules
    """
    result = []
  
    def dfs(current_string, open_count, close_count):
        # Base case: complete valid combination
        if len(current_string) == 2 * n:
            result.append(current_string)
            return
      
        # Add opening parenthesis if we haven't used all
        if open_count < n:
            dfs(current_string + '(', open_count + 1, close_count)
      
        # Add closing parenthesis if it maintains validity
        if close_count < open_count:
            dfs(current_string + ')', open_count, close_count + 1)
  
    dfs("", 0, 0)
    return result
```

**Multiple modifications at work:**

1. **State tracking** : `open_count` and `close_count`
2. **Path building** : `current_string` grows with each choice
3. **Conditional exploration** : Rules prevent invalid combinations
4. **Implicit backtracking** : Function calls naturally backtrack

## Visual Understanding: DFS Traversal Tree

```
     Start
      /|\
     / | \
    A  B  C
   /|  |  |\
  D E  F  G H
    |     /|\
    I    J K L

Standard DFS order: Start → A → D → E → I → B → F → C → G → J → K → L → H

Modified DFS might:
- Skip certain branches (conditional)
- Remember the path taken
- Maintain additional state at each node
- Apply different logic at different depths
```

## FAANG Interview Problem Categories

### 1. **Grid/Matrix Problems**

> **Pattern** : 2D DFS with boundary checks and state modifications

**Common problems:**

* Number of Islands
* Flood Fill
* Surrounded Regions
* Pacific Atlantic Water Flow

### 2. **Path Finding Problems**

> **Pattern** : DFS with path tracking and backtracking

**Common problems:**

* All Paths from Source to Target
* Word Search
* N-Queens
* Sudoku Solver

### 3. **Cycle Detection Problems**

> **Pattern** : Three-state DFS or path-based cycle detection

**Common problems:**

* Course Schedule (topological sort)
* Detect Cycle in Directed Graph
* Find Eventual Safe States

### 4. **Tree/Graph Validation**

> **Pattern** : DFS with property checking during traversal

**Common problems:**

* Validate Binary Search Tree
* Check if Graph is Bipartite
* Longest Path in Graph

## Key Optimization Techniques

### Memoization in DFS

```python
def dfs_with_memo(graph, start, target, memo=None):
    """
    DFS with memoization for overlapping subproblems
    """
    if memo is None:
        memo = {}
  
    if start in memo:
        return memo[start]
  
    if start == target:
        return True
  
    for neighbor in graph[start]:
        if dfs_with_memo(graph, neighbor, target, memo):
            memo[start] = True
            return True
  
    memo[start] = False
    return False
```

### Early Termination

```python
def dfs_with_early_termination(graph, start, condition_func):
    """
    DFS that terminates early when condition is met
    """
    visited = set()
  
    def dfs(node):
        if condition_func(node):  # Early termination condition
            return True
      
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                if dfs(neighbor):  # Propagate early termination
                    return True
        return False
  
    return dfs(start)
```

## Practice Strategy for FAANG Interviews

> **Study Approach** : Master these modification patterns individually, then combine them for complex problems.

**Progression ladder:**

1. **Basic DFS** → understand the foundation
2. **Single modifications** → path tracking, state management
3. **Combined modifications** → multiple techniques together
4. **Optimization** → memoization, early termination
5. **Problem-specific adaptations** → recognize which modifications to apply

**Interview tip:** When you see a graph/tree problem, immediately ask yourself:

* Do I need to track paths?
* Do I need additional state?
* Are there cycles to detect?
* Can I optimize with memoization?

The key to mastering modified DFS is understanding that each modification serves a specific purpose in solving different types of problems. Start with the basic pattern, then learn to recognize which modifications each problem requires.
