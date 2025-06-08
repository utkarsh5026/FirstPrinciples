# Word Search and Path-Finding in Grids: A Complete Guide to Backtracking

## Understanding Backtracking from First Principles

> **Core Concept** : Backtracking is a systematic method for solving problems by exploring all possible solutions and abandoning ("backtracking" from) paths that cannot lead to a valid solution.

Think of backtracking like exploring a maze. You walk down a path, and if you hit a dead end, you return to the last decision point and try a different direction. This is exactly what backtracking algorithms do in code.

### The Three Pillars of Backtracking

 **1. Choice** : What options do we have at each step?
 **2. Constraint** : What rules must we follow?
 **3. Goal** : What are we trying to achieve?

Let's visualize this with a simple example:

```
Finding path in a 3x3 grid:
┌─────┬─────┬─────┐
│  S  │  .  │  .  │
├─────┼─────┼─────┤
│  .  │  X  │  .  │
├─────┼─────┼─────┤
│  .  │  .  │  E  │
└─────┴─────┴─────┘

S = Start, E = End, X = Blocked, . = Open
```

## Grid Fundamentals: The Foundation

Before diving into complex algorithms, let's understand how grids work in programming:

### Grid Representation

```python
# A grid is typically a 2D array/list
grid = [
    ['S', '.', '.'],
    ['.', 'X', '.'],
    ['.', '.', 'E']
]

# Access: grid[row][column]
# grid[0][0] = 'S'
# grid[1][1] = 'X'
```

### Direction Vectors: The Navigator's Compass

```python
# Four directions: up, down, left, right
directions = [
    (-1, 0),  # up (decrease row)
    (1, 0),   # down (increase row)
    (0, -1),  # left (decrease column)
    (0, 1)    # right (increase column)
]

# Why these values?
# In a grid, (0,0) is top-left
# Moving up means going to a smaller row number
# Moving right means going to a larger column number
```

Let me show you how we use these:

```python
def get_neighbors(row, col, grid):
    neighbors = []
    rows, cols = len(grid), len(grid[0])
  
    for dr, dc in directions:
        new_row = row + dr
        new_col = col + dc
      
        # Check bounds - crucial for avoiding crashes
        if 0 <= new_row < rows and 0 <= new_col < cols:
            neighbors.append((new_row, new_col))
  
    return neighbors

# Example: neighbors of (1,1) in 3x3 grid
# Returns: [(0,1), (2,1), (1,0), (1,2)]
```

> **Key Insight** : Direction vectors are your building blocks for any grid traversal. Master this pattern, and you'll solve 80% of grid problems effortlessly.

## Word Search: The Classic Interview Problem

Let's tackle the famous "Word Search" problem step by step.

### Problem Statement

Given a 2D board and a word, find if the word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where "adjacent" cells are horizontally or vertically neighboring.

```
Example Grid:
┌─────┬─────┬─────┬─────┐
│  A  │  B  │  C  │  E  │
├─────┼─────┼─────┼─────┤
│  S  │  F  │  C  │  S  │
├─────┼─────┼─────┼─────┤
│  A  │  D  │  E  │  E  │
└─────┴─────┴─────┴─────┘

Can we find "ABCCED"? YES
Can we find "SEE"? YES  
Can we find "ABCB"? NO (can't reuse cells)
```

### Breaking Down the Algorithm

**Step 1: Understanding the Search Process**

For word "ABCCED":

1. Find all 'A' positions as starting points
2. From each 'A', look for 'B' in adjacent cells
3. From each valid 'B', look for 'C' in adjacent cells
4. Continue until word is complete or path fails

**Step 2: The Backtracking Template**

```python
def exist(board, word):
    if not board or not word:
        return False
  
    rows, cols = len(board), len(board[0])
  
    def backtrack(row, col, index):
        # Base case: found complete word
        if index == len(word):
            return True
      
        # Boundary checks and character match
        if (row < 0 or row >= rows or 
            col < 0 or col >= cols or 
            board[row][col] != word[index]):
            return False
      
        # Mark current cell as visited
        temp = board[row][col]
        board[row][col] = '#'  # temporary marker
      
        # Explore all four directions
        found = False
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            if backtrack(row + dr, col + dc, index + 1):
                found = True
                break
      
        # Restore original value (backtrack)
        board[row][col] = temp
      
        return found
  
    # Try starting from each cell
    for i in range(rows):
        for j in range(cols):
            if backtrack(i, j, 0):
                return True
  
    return False
```

### Detailed Code Explanation

Let me break down each part of this algorithm:

**The Backtrack Function Parameters:**

* `row, col`: Current position in grid
* `index`: Current position in word we're trying to match

**Base Case Analysis:**

```python
if index == len(word):
    return True
```

This means we've successfully matched every character in the word. We're done!

**Boundary and Character Checking:**

```python
if (row < 0 or row >= rows or 
    col < 0 or col >= cols or 
    board[row][col] != word[index]):
    return False
```

Three conditions must pass:

1. Position must be within grid bounds
2. Current cell must match current character in word
3. Cell must not be already visited (handled by marking)

**The Marking Technique:**

```python
temp = board[row][col]
board[row][col] = '#'
# ... do exploration ...
board[row][col] = temp
```

> **Why Mark Cells?** We need to prevent using the same cell twice in one path. The marking ensures we don't create cycles like A→B→A in our search.

## Path-Finding: From Simple to Advanced

### Basic Path Existence

Let's start with the simplest question: "Does a path exist from start to end?"

```python
def has_path(grid, start, end):
    """
    grid: 2D array where 0 = open, 1 = blocked
    start: (row, col) tuple
    end: (row, col) tuple
    """
    rows, cols = len(grid), len(grid[0])
    visited = set()
  
    def dfs(row, col):
        # Reached destination
        if (row, col) == end:
            return True
      
        # Invalid position
        if (row < 0 or row >= rows or 
            col < 0 or col >= cols or 
            grid[row][col] == 1 or 
            (row, col) in visited):
            return False
      
        # Mark as visited
        visited.add((row, col))
      
        # Explore neighbors
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            if dfs(row + dr, col + dc):
                return True
      
        return False
  
    return dfs(start[0], start[1])
```

### Finding the Actual Path

Now let's find not just whether a path exists, but what that path is:

```python
def find_path(grid, start, end):
    """Returns the actual path as a list of coordinates"""
    rows, cols = len(grid), len(grid[0])
    visited = set()
  
    def dfs(row, col, path):
        # Reached destination
        if (row, col) == end:
            return path + [(row, col)]
      
        # Invalid position
        if (row < 0 or row >= rows or 
            col < 0 or col >= cols or 
            grid[row][col] == 1 or 
            (row, col) in visited):
            return None
      
        # Mark as visited
        visited.add((row, col))
        current_path = path + [(row, col)]
      
        # Explore neighbors
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            result = dfs(row + dr, col + dc, current_path)
            if result:
                return result
      
        # Backtrack: remove from visited set
        visited.remove((row, col))
        return None
  
    return dfs(start[0], start[1], [])
```

> **Path vs Existence** : Notice how finding the actual path requires us to maintain and pass the current path. This increases space complexity but gives us the complete solution.

### Visualizing the Search Process

Let's trace through a small example:

```
Grid (0=open, 1=blocked):
┌─────┬─────┬─────┐
│  0  │  1  │  0  │  ← Row 0
├─────┼─────┼─────┤
│  0  │  0  │  0  │  ← Row 1  
├─────┼─────┼─────┤
│  1  │  0  │  0  │  ← Row 2
└─────┴─────┴─────┘
  ↑     ↑     ↑
Col 0  Col 1  Col 2

Start: (0,0), End: (2,2)
```

**Search Process:**

1. Start at (0,0), mark visited
2. Try (0,1) → blocked, try (-1,0) → out of bounds, try (1,0) → valid!
3. From (1,0), try neighbors: (0,0) → visited, (2,0) → blocked, (1,1) → valid!
4. Continue this process...

## Advanced Patterns and Optimizations

### Multiple Paths: Finding All Solutions

Sometimes you need all possible paths, not just one:

```python
def find_all_paths(grid, start, end):
    """Find all possible paths from start to end"""
    rows, cols = len(grid), len(grid[0])
    all_paths = []
  
    def dfs(row, col, path, visited):
        if (row, col) == end:
            all_paths.append(path + [(row, col)])
            return
      
        if (row < 0 or row >= rows or 
            col < 0 or col >= cols or 
            grid[row][col] == 1 or 
            (row, col) in visited):
            return
      
        visited.add((row, col))
      
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            dfs(row + dr, col + dc, 
                path + [(row, col)], visited)
      
        visited.remove((row, col))  # Backtrack
  
    dfs(start[0], start[1], [], set())
    return all_paths
```

### Optimization Techniques

**1. Early Termination**

```python
# If looking for shortest path, stop when found
if len(current_path) > best_length:
    return  # Prune this branch
```

**2. Memoization for Overlapping Subproblems**

```python
# Cache results for positions we've fully explored
memo = {}

def dfs_with_memo(row, col, target):
    if (row, col, target) in memo:
        return memo[(row, col, target)]
  
    # ... regular DFS logic ...
  
    memo[(row, col, target)] = result
    return result
```

## Time and Space Complexity Analysis

### Word Search Complexity

> **Time Complexity** : O(N × M × 4^L) where N×M is grid size and L is word length
>
> * We might start from each of N×M cells
> * For each start, we explore up to 4^L paths (4 directions, L steps deep)

> **Space Complexity** : O(L) for recursion stack depth
>
> * Maximum recursion depth equals word length
> * We don't count the visited marking since we restore values

### Path Finding Complexity

> **Time Complexity** : O(N × M) in worst case
>
> * We might visit each cell once
> * Each cell has at most 4 neighbors

> **Space Complexity** : O(N × M) for visited set + O(N × M) for recursion stack
>
> * Visited set tracks all cells we've seen
> * Recursion depth could be entire grid in worst case (spiral path)

## Common Interview Patterns and Variations

### Pattern 1: Island Problems

```python
def count_islands(grid):
    """Count number of connected components of 1s"""
    count = 0
  
    def dfs(row, col):
        if (row < 0 or row >= len(grid) or 
            col < 0 or col >= len(grid[0]) or 
            grid[row][col] != '1'):
            return
      
        grid[row][col] = '0'  # Mark as visited
      
        # Visit all 4 directions
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            dfs(row + dr, col + dc)
  
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == '1':
                dfs(i, j)
                count += 1
  
    return count
```

### Pattern 2: Shortest Path (requires BFS, but shown for comparison)

```python
from collections import deque

def shortest_path_length(grid, start, end):
    """Use BFS for shortest path in unweighted grid"""
    queue = deque([(start[0], start[1], 0)])  # row, col, distance
    visited = {start}
  
    while queue:
        row, col, dist = queue.popleft()
      
        if (row, col) == end:
            return dist
      
        for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
            new_row, new_col = row + dr, col + dc
          
            if (0 <= new_row < len(grid) and 
                0 <= new_col < len(grid[0]) and 
                grid[new_row][new_col] == 0 and 
                (new_row, new_col) not in visited):
              
                visited.add((new_row, new_col))
                queue.append((new_row, new_col, dist + 1))
  
    return -1  # No path found
```

## Interview Success Strategies

### The FAANG Interview Approach

**1. Clarify the Problem**

* "Can I revisit cells?"
* "What characters are valid?"
* "Is the grid always rectangular?"
* "What should I return if no solution exists?"

**2. Start with Brute Force**

```python
# Always start with the simplest working solution
def word_search_bruteforce(board, word):
    # Try every possible starting position
    for i in range(len(board)):
        for j in range(len(board[0])):
            if dfs(board, word, i, j, 0):
                return True
    return False
```

**3. Identify Optimization Opportunities**

* "Can I prune invalid branches early?"
* "Am I doing redundant work?"
* "Can I use memoization?"

**4. Code Incrementally**

```python
# Step 1: Basic structure
def exist(board, word):
    def dfs(row, col, index):
        # TODO: implement base cases
        # TODO: implement recursive calls
        pass
  
    # TODO: try all starting positions
    pass

# Step 2: Fill in base cases
# Step 3: Add recursive logic
# Step 4: Add optimization
```

### Common Pitfalls to Avoid

> **Mistake 1** : Forgetting to restore state after backtracking
>
> ```python
> # WRONG
> board[row][col] = '#'
> result = dfs(...)
> # Missing: board[row][col] = original_value
> ```

> **Mistake 2** : Incorrect boundary checking
>
> ```python
> # WRONG - doesn't check upper bounds
> if row >= 0 and col >= 0:
>
> # CORRECT
> if 0 <= row < rows and 0 <= col < cols:
> ```

> **Mistake 3** : Using global variables carelessly
>
> ```python
> # WRONG - state persists between test cases
> visited = set()
>
> def dfs(...):
>     # visited never gets cleared
> ```

### Practice Problems for Mastery

1. **Word Search** (Leetcode 79) - Foundation
2. **Word Search II** (Leetcode 212) - Multiple words using Trie
3. **Number of Islands** (Leetcode 200) - Connected components
4. **Surrounded Regions** (Leetcode 130) - Boundary-connected regions
5. **Pacific Atlantic Water Flow** (Leetcode 417) - Multi-source DFS

> **Final Insight** : Backtracking in grids is essentially a systematic exploration of all possibilities. Master the template, understand when to mark/unmark visited cells, and practice visualizing the search process. With these foundations, you'll confidently tackle any grid-based interview problem.

The key to success is not memorizing solutions, but understanding the underlying patterns. Every grid problem follows similar principles: define your state, check constraints, explore neighbors, and backtrack when necessary. This systematic approach will serve you well in any technical interview.
