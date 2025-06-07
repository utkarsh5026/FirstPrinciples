# Topological Sorting: From First Principles to FAANG Interview Mastery

## What is Topological Sorting? The Foundation

> **Core Insight** : Topological sorting is about finding a linear ordering of vertices in a directed graph such that for every directed edge (u, v), vertex u comes before vertex v in the ordering.

Let's start from the absolute beginning. Imagine you're getting dressed in the morning - you can't put on your shoes before your socks, and you can't put on your jacket before your shirt. This natural ordering of dependencies is exactly what topological sorting solves in computer science.

### The Mathematical Foundation

A topological sort is only possible for  **Directed Acyclic Graphs (DAGs)** . Let's break this down:

* **Directed** : Edges have a direction (A → B means A must come before B)
* **Acyclic** : No cycles exist (you can't have A → B → C → A)
* **Graph** : A collection of vertices connected by edges

> **Why No Cycles?** If we had A → B → C → A, then A must come before B, B before C, and C before A. This creates an impossible contradiction - A cannot come before itself!

### Real-World Applications in Tech

Before diving into algorithms, let's understand why FAANG companies care about this:

1. **Build Systems** : Compiling source files with dependencies
2. **Task Scheduling** : Running tasks with prerequisites
3. **Course Prerequisites** : University course planning systems
4. **Package Management** : Installing software with dependencies
5. **Spreadsheet Calculations** : Computing formulas in correct order

## Prerequisites: Graph Representation

Let's establish how we represent graphs in code:

```python
# Adjacency List Representation
class Graph:
    def __init__(self, vertices):
        self.V = vertices  # Number of vertices
        self.graph = [[] for _ in range(vertices)]  # List of lists
  
    def add_edge(self, u, v):
        """Add directed edge from u to v"""
        self.graph[u].append(v)
```

**Code Explanation:**

* `self.V` stores the number of vertices (0 to V-1)
* `self.graph` is a list where `graph[i]` contains all vertices that vertex `i` points to
* `add_edge(u, v)` creates a directed edge from vertex `u` to vertex `v`

## Method 1: DFS-Based Topological Sort

### The Core Intuition

> **Key Insight** : In DFS-based topological sorting, we use the **finish time** of vertices. A vertex should appear in the topological order only after all vertices it depends on have been processed.

Think of it like this: when we finish exploring all paths from a vertex (meaning all its dependencies are handled), only then can we safely place it in our result.

### The Algorithm Step-by-Step

1. **Initialization** : Create a visited array and an empty stack
2. **DFS Traversal** : For each unvisited vertex, perform DFS
3. **Recursive Exploration** : Visit all neighbors before finishing current vertex
4. **Stack Insertion** : When finishing a vertex, push it to stack
5. **Result Construction** : Pop all elements from stack to get topological order

### Implementation with Detailed Explanation

```python
def topological_sort_dfs(self):
    """
    Performs topological sorting using DFS approach
    Returns: List representing topological order
    """
    # Step 1: Initialize data structures
    visited = [False] * self.V  # Track visited vertices
    stack = []  # Store the topological order
  
    def dfs_helper(vertex):
        """
        Recursive DFS helper function
        Args: vertex - current vertex being processed
        """
        # Mark current vertex as visited
        visited[vertex] = True
      
        # Recursively visit all adjacent vertices
        for neighbor in self.graph[vertex]:
            if not visited[neighbor]:
                dfs_helper(neighbor)
      
        # CRITICAL: Add to stack after exploring all dependencies
        stack.append(vertex)
  
    # Step 2: Perform DFS from all unvisited vertices
    for vertex in range(self.V):
        if not visited[vertex]:
            dfs_helper(vertex)
  
    # Step 3: Reverse the stack to get correct order
    return stack[::-1]
```

**Detailed Code Walkthrough:**

1. **Visited Array** : Prevents infinite loops and ensures each vertex is processed once
2. **Stack Usage** : The stack captures the "finish order" - vertices are added when we've fully explored their dependencies
3. **Recursive DFS** : We explore as deep as possible before backtracking
4. **Stack Reversal** : Since we add vertices when finishing, we need to reverse to get the correct topological order

### Example Walkthrough

Let's trace through a concrete example:

```
Graph: 0→1, 0→2, 1→3, 2→3
```

```
    0
   ╱ ╲
  1   2
   ╲ ╱
    3
```

**Step-by-Step Execution:**

1. Start DFS from vertex 0
2. From 0, go to 1, then to 3
3. Vertex 3 has no neighbors → add 3 to stack: `[3]`
4. Back to 1, all neighbors visited → add 1 to stack: `[3, 1]`
5. Back to 0, go to 2, then to 3 (already visited)
6. Add 2 to stack: `[3, 1, 2]`
7. Add 0 to stack: `[3, 1, 2, 0]`
8. Reverse: `[0, 2, 1, 3]`

### Time and Space Complexity

> **Time Complexity** : O(V + E) where V = vertices, E = edges
> **Space Complexity** : O(V) for the recursion stack and data structures

## Method 2: Kahn's Algorithm (BFS-Based)

### The Core Intuition

> **Key Insight** : Kahn's algorithm uses **in-degree** (number of incoming edges) to determine which vertices can be processed next. A vertex with in-degree 0 has no dependencies and can be safely added to the result.

This approach mimics how you might naturally solve the problem: start with items that have no prerequisites, then gradually remove dependencies.

### The Algorithm Step-by-Step

1. **Calculate In-degrees** : Count incoming edges for each vertex
2. **Initialize Queue** : Add all vertices with in-degree 0
3. **Process Queue** : Remove vertex, add to result, update neighbors' in-degrees
4. **Repeat** : Continue until queue is empty
5. **Cycle Detection** : If result size ≠ vertex count, cycle exists

### Implementation with Detailed Explanation

```python
from collections import deque

def topological_sort_kahn(self):
    """
    Performs topological sorting using Kahn's algorithm
    Returns: List representing topological order, or None if cycle exists
    """
    # Step 1: Calculate in-degree for all vertices
    in_degree = [0] * self.V
  
    for vertex in range(self.V):
        for neighbor in self.graph[vertex]:
            in_degree[neighbor] += 1
  
    # Step 2: Initialize queue with vertices having in-degree 0
    queue = deque()
    for vertex in range(self.V):
        if in_degree[vertex] == 0:
            queue.append(vertex)
  
    # Step 3: Process vertices level by level
    result = []
    processed_count = 0
  
    while queue:
        # Remove vertex with no dependencies
        current = queue.popleft()
        result.append(current)
        processed_count += 1
      
        # Update in-degrees of neighbors
        for neighbor in self.graph[current]:
            in_degree[neighbor] -= 1
          
            # If neighbor now has no dependencies, add to queue
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
  
    # Step 4: Check for cycles
    if processed_count != self.V:
        return None  # Cycle detected
  
    return result
```

**Detailed Code Walkthrough:**

1. **In-degree Calculation** : We iterate through all edges to count how many edges point to each vertex
2. **Queue Initialization** : Vertices with in-degree 0 are ready to be processed immediately
3. **BFS Processing** : We process vertices level by level, similar to BFS traversal
4. **Dependency Update** : When we process a vertex, we "remove" its outgoing edges by decrementing neighbors' in-degrees
5. **Cycle Detection** : If we can't process all vertices, a cycle must exist

### Example Walkthrough

Using the same graph: 0→1, 0→2, 1→3, 2→3

**Initial State:**

```
In-degrees: [0, 1, 1, 2]
Queue: [0] (only vertex 0 has in-degree 0)
```

**Step-by-Step Execution:**

1. **Process 0** : Add to result: `[0]`

* Decrease in-degree of 1: `[0, 0, 1, 2]`
* Decrease in-degree of 2: `[0, 0, 0, 2]`
* Add 1 and 2 to queue: `[1, 2]`

1. **Process 1** : Add to result: `[0, 1]`

* Decrease in-degree of 3: `[0, 0, 0, 1]`

1. **Process 2** : Add to result: `[0, 1, 2]`

* Decrease in-degree of 3: `[0, 0, 0, 0]`
* Add 3 to queue: `[3]`

1. **Process 3** : Add to result: `[0, 1, 2, 3]`

 **Final Result** : `[0, 1, 2, 3]`

### Time and Space Complexity

> **Time Complexity** : O(V + E) for calculating in-degrees and processing all vertices/edges
> **Space Complexity** : O(V) for in-degree array and queue

## Complete Working Example

Let's implement a complete solution that demonstrates both approaches:

```python
from collections import deque

class TopologicalSort:
    def __init__(self, vertices):
        self.V = vertices
        self.graph = [[] for _ in range(vertices)]
  
    def add_edge(self, u, v):
        """Add directed edge from u to v"""
        self.graph[u].append(v)
  
    def dfs_topological_sort(self):
        """DFS-based topological sort"""
        visited = [False] * self.V
        stack = []
      
        def dfs(vertex):
            visited[vertex] = True
            for neighbor in self.graph[vertex]:
                if not visited[neighbor]:
                    dfs(neighbor)
            stack.append(vertex)
      
        for vertex in range(self.V):
            if not visited[vertex]:
                dfs(vertex)
      
        return stack[::-1]
  
    def kahn_topological_sort(self):
        """Kahn's algorithm for topological sort"""
        in_degree = [0] * self.V
      
        # Calculate in-degrees
        for vertex in range(self.V):
            for neighbor in self.graph[vertex]:
                in_degree[neighbor] += 1
      
        # Initialize queue
        queue = deque([v for v in range(self.V) if in_degree[v] == 0])
        result = []
      
        while queue:
            current = queue.popleft()
            result.append(current)
          
            for neighbor in self.graph[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
      
        return result if len(result) == self.V else None

# Example usage
def demonstrate_topological_sort():
    """Demonstrate both algorithms with the same graph"""
    g = TopologicalSort(6)
  
    # Create a dependency graph
    edges = [(5, 2), (5, 0), (4, 0), (4, 1), (2, 3), (3, 1)]
    for u, v in edges:
        g.add_edge(u, v)
  
    print("DFS Topological Sort:", g.dfs_topological_sort())
    print("Kahn's Algorithm:", g.kahn_topological_sort())

demonstrate_topological_sort()
```

**Expected Output:**

```
DFS Topological Sort: [5, 4, 2, 3, 1, 0]
Kahn's Algorithm: [4, 5, 0, 2, 3, 1]
```

> **Important Note** : Multiple valid topological orderings can exist for the same graph. Both results above are correct!

## FAANG Interview Perspective

### When to Use Which Algorithm?

**Use DFS-based approach when:**

* You need to detect cycles in the graph
* Memory is constrained (slightly less space overhead)
* The graph is sparse (fewer edges)

**Use Kahn's algorithm when:**

* You need to explicitly detect cycles and handle them
* You want to process vertices "level by level"
* You're implementing a real-time system where you process dependencies as they become available

### Common Interview Variations

1. **Course Schedule Problems** : Direct application of topological sorting
2. **Task Scheduling** : Find if tasks can be completed given dependencies
3. **Alien Dictionary** : Derive character ordering from sorted alien words
4. **Minimum Time to Complete Tasks** : Find critical path in dependency graph

### Edge Cases to Handle

```python
def robust_topological_sort(self):
    """
    Handle edge cases that interviewers might test
    """
    # Case 1: Empty graph
    if self.V == 0:
        return []
  
    # Case 2: Single vertex
    if self.V == 1:
        return [0]
  
    # Case 3: Disconnected components
    # Both algorithms handle this correctly
  
    # Case 4: Self-loops (cycles)
    # Kahn's algorithm will detect this
  
    return self.kahn_topological_sort()
```

### Optimization Tips for Interviews

> **Space Optimization** : If the interviewer asks about space optimization, mention that DFS can be implemented iteratively to avoid recursion stack overhead.

> **Cycle Detection** : Kahn's algorithm naturally detects cycles, while DFS requires additional color-coding (white/gray/black) for robust cycle detection.

## Advanced Concepts and Extensions

### All Topological Orderings

Sometimes interviews ask for all possible topological orderings:

```python
def all_topological_sorts(self):
    """Find all possible topological orderings"""
    in_degree = [0] * self.V
  
    # Calculate initial in-degrees
    for vertex in range(self.V):
        for neighbor in self.graph[vertex]:
            in_degree[neighbor] += 1
  
    def backtrack(current_order, remaining_in_degree):
        """Recursive backtracking to find all orderings"""
        if len(current_order) == self.V:
            return [current_order[:]]  # Found complete ordering
      
        results = []
        for vertex in range(self.V):
            if remaining_in_degree[vertex] == 0 and vertex not in current_order:
                # Choose this vertex
                current_order.append(vertex)
              
                # Update in-degrees
                new_in_degree = remaining_in_degree[:]
                for neighbor in self.graph[vertex]:
                    new_in_degree[neighbor] -= 1
              
                # Recurse
                results.extend(backtrack(current_order, new_in_degree))
              
                # Backtrack
                current_order.pop()
      
        return results
  
    return backtrack([], in_degree)
```

## Summary and Key Takeaways

> **Essential Understanding** : Topological sorting is fundamentally about respecting dependencies in a directed acyclic graph. The choice between DFS and Kahn's algorithm depends on your specific requirements for cycle detection, memory usage, and processing style.

**For FAANG Interviews, Remember:**

1. **Always ask about cycle detection requirements**
2. **Clarify if multiple valid orderings exist**
3. **Consider the trade-offs between recursive and iterative approaches**
4. **Be prepared to modify the algorithm for specific constraints**
5. **Practice with real-world examples like course scheduling**

Both algorithms are essential tools in your algorithmic toolkit, each with its own strengths and optimal use cases. Master both, understand their nuances, and you'll be well-prepared for any topological sorting challenge in technical interviews.
