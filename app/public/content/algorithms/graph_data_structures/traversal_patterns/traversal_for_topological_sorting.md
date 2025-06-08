# Graph Traversal for Topological Sorting: A Deep Dive from First Principles

Let me take you on a comprehensive journey through topological sorting - one of the most elegant and frequently tested graph algorithms in FAANG interviews.

## What is Topological Sorting? The Foundation

> **Core Principle** : Topological sorting is the process of arranging vertices in a directed graph such that for every directed edge from vertex A to vertex B, vertex A appears before vertex B in the ordering.

Think of it as creating a "dependency chain" - like organizing tasks where some tasks must be completed before others can begin.

### Real-World Analogy

Imagine you're getting dressed in the morning:

```
Underwear → Pants → Belt
Socks → Shoes
Shirt → Jacket
```

You can't put on pants before underwear, or shoes before socks. Topological sorting gives us a valid order like: `[Underwear, Socks, Pants, Shirt, Belt, Shoes, Jacket]`

## The Mathematical Foundation

> **Critical Requirement** : Topological sorting only works on  **Directed Acyclic Graphs (DAGs)** . If there's a cycle, no valid topological ordering exists.

### Why No Cycles?

If we have a cycle like: A → B → C → A, then:

* A must come before B
* B must come before C
* C must come before A

This creates a logical contradiction - A cannot come before itself!

## Algorithm 1: Kahn's Algorithm (BFS-Based)

Kahn's algorithm uses the concept of **in-degree** - the number of incoming edges to a vertex.

### The Core Insight

> **Key Principle** : A vertex with in-degree 0 has no dependencies, so it can be placed first in our topological ordering.

### Step-by-Step Process

1. Calculate in-degree for all vertices
2. Add all vertices with in-degree 0 to a queue
3. While queue is not empty:
   * Remove a vertex from queue
   * Add it to result
   * For each neighbor, decrease its in-degree by 1
   * If neighbor's in-degree becomes 0, add it to queue

### Implementation with Detailed Explanation

```python
from collections import deque, defaultdict

def topological_sort_kahn(graph, num_vertices):
    # Step 1: Calculate in-degrees
    # in_degree[i] = number of edges pointing TO vertex i
    in_degree = [0] * num_vertices
  
    # Count incoming edges for each vertex
    for vertex in graph:
        for neighbor in graph[vertex]:
            in_degree[neighbor] += 1
  
    # Step 2: Find all vertices with no dependencies (in-degree = 0)
    queue = deque()
    for i in range(num_vertices):
        if in_degree[i] == 0:
            queue.append(i)
  
    # Step 3: Process vertices level by level
    result = []
  
    while queue:
        # Remove a vertex with no dependencies
        current = queue.popleft()
        result.append(current)
      
        # "Remove" this vertex by decreasing in-degrees of neighbors
        for neighbor in graph[current]:
            in_degree[neighbor] -= 1
          
            # If neighbor now has no dependencies, add to queue
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
  
    # Check for cycles: if we processed all vertices, no cycle exists
    if len(result) != num_vertices:
        return []  # Cycle detected
  
    return result
```

### Example Walkthrough

Let's trace through a course dependency example:

```
Course Dependencies:
0 (Math) → 1 (Physics)
0 (Math) → 2 (Chemistry) 
1 (Physics) → 3 (Engineering)
2 (Chemistry) → 3 (Engineering)
```

 **Visualization** :

```
   0 (Math)
  / \
 ↓   ↓
1    2
(Physics) (Chemistry)
 ↓   ↓
  \ /
   3 (Engineering)
```

 **Step-by-step execution** :

```python
# Example usage
graph = {
    0: [1, 2],  # Math prerequisite for Physics and Chemistry
    1: [3],     # Physics prerequisite for Engineering  
    2: [3],     # Chemistry prerequisite for Engineering
    3: []       # Engineering has no dependencies it creates
}

result = topological_sort_kahn(graph, 4)
print(result)  # Output: [0, 1, 2, 3] or [0, 2, 1, 3]
```

 **Trace through algorithm** :

1. **In-degrees** : [0, 1, 1, 2] (Math:0, Physics:1, Chemistry:1, Engineering:2)
2. **Initial queue** : [0] (only Math has in-degree 0)
3. **Process Math(0)** : Remove from queue, add to result [0], decrease in-degrees of Physics and Chemistry
4. **New in-degrees** : [-, 0, 0, 2],  **Queue** : [1, 2]
5. **Process Physics(1)** : Result [0, 1], decrease Engineering's in-degree
6. **New in-degrees** : [-, -, 0, 1],  **Queue** : [2]
7. **Process Chemistry(2)** : Result [0, 1, 2], decrease Engineering's in-degree
8. **New in-degrees** : [-, -, -, 0],  **Queue** : [3]
9. **Process Engineering(3)** : Result [0, 1, 2, 3],  **Queue** : []

## Algorithm 2: DFS-Based Approach

The DFS approach uses a different insight: in a valid topological ordering, when we finish processing a vertex (post-order), all its dependencies have been processed.

### The Core Insight

> **Key Principle** : If we perform DFS and record vertices in post-order (when we finish processing them), the reverse of this order gives us a valid topological sorting.

### Implementation with Detailed Explanation

```python
def topological_sort_dfs(graph, num_vertices):
    # Track vertex states: 0=unvisited, 1=visiting, 2=visited
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * num_vertices
  
    result = []
    has_cycle = False
  
    def dfs(vertex):
        nonlocal has_cycle
      
        if color[vertex] == GRAY:
            # Found back edge - cycle detected!
            has_cycle = True
            return
      
        if color[vertex] == BLACK:
            # Already processed
            return
      
        # Mark as currently being processed
        color[vertex] = GRAY
      
        # Visit all neighbors first
        for neighbor in graph[vertex]:
            dfs(neighbor)
            if has_cycle:
                return
      
        # Mark as completely processed
        color[vertex] = BLACK
      
        # Add to result when finishing (post-order)
        result.append(vertex)
  
    # Try DFS from each unvisited vertex
    for i in range(num_vertices):
        if color[i] == WHITE:
            dfs(i)
            if has_cycle:
                return []
  
    # Reverse to get correct topological order
    return result[::-1]
```

### Why the Reverse?

When we finish processing a vertex in DFS, all vertices it depends on have already been finished. So the finish order is actually the reverse of dependency order.

 **Example trace** :

```
Graph: 0→1→3, 0→2→3

DFS calls:
1. Start DFS(0)
2. DFS(0) calls DFS(1) 
3. DFS(1) calls DFS(3)
4. DFS(3) finishes → result = [3]
5. DFS(1) finishes → result = [3, 1]  
6. DFS(0) calls DFS(2)
7. DFS(2) calls DFS(3) (already done)
8. DFS(2) finishes → result = [3, 1, 2]
9. DFS(0) finishes → result = [3, 1, 2, 0]

Reverse: [0, 2, 1, 3] ✓
```

## FAANG Interview Perspective

### Common Question Patterns

> **Pattern 1: Course Prerequisites**
> "Given course dependencies, find a valid order to take all courses"

> **Pattern 2: Build Dependencies**
>
> "Given project dependencies, find build order"

> **Pattern 3: Alien Dictionary**
> "Given words in alien language sorted order, find the alphabet order"

### Which Algorithm to Choose?

**Kahn's Algorithm** when:

* You need to detect cycles explicitly
* You want intuitive BFS-like processing
* The problem mentions "prerequisites" or "dependencies"

**DFS Algorithm** when:

* You're comfortable with recursion
* The graph is sparse
* You need to handle disconnected components naturally

### Interview Tips

> **Key Insight** : Most interviewers expect you to know both approaches and explain the trade-offs.

 **Time Complexity** : Both algorithms are O(V + E)

* V vertices need to be processed once
* E edges need to be examined once

 **Space Complexity** : O(V + E) for adjacency list + O(V) for auxiliary structures

## Advanced Variations for FAANG

### 1. Course Schedule with Prerequisites

```python
def can_finish_courses(num_courses, prerequisites):
    """
    Returns True if all courses can be completed
    prerequisites = [[1,0]] means course 1 requires course 0
    """
    graph = defaultdict(list)
    in_degree = [0] * num_courses
  
    # Build graph from prerequisites
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1
  
    # Apply Kahn's algorithm
    queue = deque([i for i in range(num_courses) if in_degree[i] == 0])
    completed = 0
  
    while queue:
        current = queue.popleft()
        completed += 1
      
        for next_course in graph[current]:
            in_degree[next_course] -= 1
            if in_degree[next_course] == 0:
                queue.append(next_course)
  
    return completed == num_courses
```

### 2. Finding All Possible Topological Orders

```python
def all_topological_sorts(graph, num_vertices):
    """
    Find all possible topological orderings
    """
    in_degree = [0] * num_vertices
    for vertex in graph:
        for neighbor in graph[vertex]:
            in_degree[neighbor] += 1
  
    result = []
    current_path = []
  
    def backtrack():
        # Find all vertices with in-degree 0
        available = [i for i in range(num_vertices) 
                    if in_degree[i] == 0 and i not in current_path]
      
        if not available:
            if len(current_path) == num_vertices:
                result.append(current_path[:])
            return
      
        # Try each available vertex
        for vertex in available:
            # Choose
            current_path.append(vertex)
            # Update in-degrees
            for neighbor in graph[vertex]:
                in_degree[neighbor] -= 1
          
            # Recurse
            backtrack()
          
            # Backtrack
            current_path.pop()
            for neighbor in graph[vertex]:
                in_degree[neighbor] += 1
  
    backtrack()
    return result
```

## Common Pitfalls and Edge Cases

> **Pitfall 1** : Forgetting to check for cycles
> Always verify that the number of processed vertices equals the total vertices

> **Pitfall 2** : Graph representation confusion
> Make sure you understand if edges represent dependencies or the reverse

> **Pitfall 3** : Multiple valid orderings
> Remember that topological sorting may have multiple valid answers

### Edge Cases to Handle:

1. **Empty graph** : Return empty list
2. **Single vertex** : Return [vertex]
3. **Disconnected components** : Both algorithms handle this naturally
4. **Self-loops** : Always indicate a cycle

## Practice Problems for Mastery

1. **Course Schedule** (LeetCode 207)
2. **Course Schedule II** (LeetCode 210)
3. **Alien Dictionary** (LeetCode 269)
4. **Minimum Height Trees** (LeetCode 310)
5. **Parallel Courses** (LeetCode 1136)

> **Final Thought** : Topological sorting is not just about implementing an algorithm - it's about recognizing dependency relationships and choosing the right tool to solve ordering problems elegantly.

Understanding these principles from the ground up will serve you well not just in interviews, but in real-world system design where dependency management is crucial.
