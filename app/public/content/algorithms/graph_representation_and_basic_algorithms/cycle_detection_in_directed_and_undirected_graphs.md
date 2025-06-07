# Cycle Detection in Graphs: A Complete FAANG Interview Guide

Let's embark on a journey to understand one of the most fundamental and frequently asked graph problems in FAANG interviews. Cycle detection is not just about finding loops - it's about understanding graph traversal, state management, and algorithmic thinking at its core.

## What is a Cycle? Building from First Principles

> **A cycle in a graph is a path that starts and ends at the same vertex, with no repeated edges along the way.**

Think of it like walking in a neighborhood. If you start at your house, walk around some blocks, and end up back at your house without retracing your exact steps, you've completed a cycle.

But here's where it gets interesting - the rules change depending on whether our graph is directed or undirected:

* **Undirected graphs** : Roads you can travel in both directions
* **Directed graphs** : One-way streets with specific directions

## Why FAANG Companies Love This Problem

> **Cycle detection tests multiple core competencies: graph traversal mastery, state management, and the ability to adapt algorithms based on graph properties.**

FAANG interviewers use this problem because it reveals:

1. Your understanding of graph fundamentals
2. How you handle different graph types
3. Your ability to optimize algorithms
4. State management skills (crucial for system design)

## Undirected Graphs: The Parent-Child Relationship Approach

In undirected graphs, we need to be careful about what constitutes a "real" cycle versus just going back to where we came from.

### The Core Insight

> **In an undirected graph, a cycle exists if during DFS traversal, we encounter a visited vertex that is NOT the immediate parent of our current vertex.**

Let's visualize this with a simple example:

```
    A --- B
    |     |
    D --- C
```

If we start DFS from A and go A → B → C → D → A, we've found a cycle because when we reach A again, it's not the immediate parent of D.

### Implementation with Detailed Explanation

```python
def has_cycle_undirected(graph):
    """
    Detects cycle in undirected graph using DFS
  
    Args:
        graph: Dictionary where graph[node] = list of neighbors
  
    Returns:
        Boolean indicating if cycle exists
    """
    visited = set()
  
    def dfs(node, parent):
        # Mark current node as visited
        visited.add(node)
      
        # Explore all neighbors
        for neighbor in graph[node]:
            if neighbor not in visited:
                # If neighbor unvisited, recursively explore
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:
                # Found visited neighbor that's not our parent = CYCLE!
                return True
      
        return False
  
    # Check all components (graph might be disconnected)
    for node in graph:
        if node not in visited:
            if dfs(node, None):
                return True
  
    return False
```

### Breaking Down the Logic

Let me explain each part of this algorithm:

 **1. The Visited Set** : We track which nodes we've seen to avoid infinite loops.

 **2. The Parent Parameter** : This is crucial! In undirected graphs, if we go A → B, then B can see A as a neighbor. Without tracking the parent, we'd falsely detect a cycle.

 **3. The Core Logic** :

* If neighbor is unvisited: explore it recursively
* If neighbor is visited AND not our parent: we found a cycle!
* If neighbor is our parent: ignore it (we just came from there)

 **4. Component Handling** : The outer loop ensures we check all connected components.

## Directed Graphs: The Color-Based State Management

Directed graphs require a more sophisticated approach because we need to distinguish between:

* Nodes in our current path (potential cycle)
* Nodes we've finished exploring completely

### The Three-Color Approach

> **We use three colors to represent node states: WHITE (unvisited), GRAY (currently exploring), BLACK (completely explored).**

```
WHITE: Never visited
GRAY:  Currently in our DFS path
BLACK: Finished exploring (and all its descendants)
```

The key insight: **A cycle exists if we encounter a GRAY node during DFS traversal.**

### Visualizing the Process

```
Start: A → B → C
       ↓
       D → E

If E points back to B (which is GRAY), 
we have a cycle!
```

### Implementation with State Management

```python
def has_cycle_directed(graph):
    """
    Detects cycle in directed graph using DFS with colors
  
    Args:
        graph: Dictionary where graph[node] = list of neighbors
  
    Returns:
        Boolean indicating if cycle exists
    """
    # Three states: 0=WHITE, 1=GRAY, 2=BLACK
    color = {}
  
    def dfs(node):
        # Mark as GRAY (currently exploring)
        color[node] = 1
      
        # Explore all neighbors
        for neighbor in graph.get(node, []):
            if neighbor not in color:
                # WHITE neighbor - explore it
                if dfs(neighbor):
                    return True
            elif color[neighbor] == 1:
                # GRAY neighbor - found cycle!
                return True
            # BLACK neighbor (color[neighbor] == 2) - safe to ignore
      
        # Mark as BLACK (completely explored)
        color[node] = 2
        return False
  
    # Check all nodes
    for node in graph:
        if node not in color:
            if dfs(node):
                return True
  
    return False
```

### Understanding the Color Transitions

Let me walk through what happens at each step:

 **1. WHITE → GRAY** : When we first visit a node, we're starting to explore it.

 **2. GRAY State** : The node is in our current DFS path. If we encounter another GRAY node, it means we've found a back edge - a cycle!

 **3. GRAY → BLACK** : When we finish exploring all descendants, the node is "safe" - no cycles found through this path.

 **4. Encountering BLACK** : These nodes are already fully explored, so we can safely ignore them.

## Advanced Example: Detecting Cycles with Path Reconstruction

Sometimes interviews ask not just "is there a cycle?" but "show me the cycle." Here's how we can modify our approach:

```python
def find_cycle_with_path(graph):
    """
    Finds a cycle and returns the actual cycle path
  
    Returns:
        List representing the cycle, or None if no cycle exists
    """
    color = {}
    parent = {}
    cycle_start = None
  
    def dfs(node):
        nonlocal cycle_start
        color[node] = 1  # GRAY
      
        for neighbor in graph.get(node, []):
            if neighbor not in color:
                parent[neighbor] = node
                if dfs(neighbor):
                    return True
            elif color[neighbor] == 1:
                # Found cycle!
                cycle_start = neighbor
                parent[neighbor] = node
                return True
      
        color[node] = 2  # BLACK
        return False
  
    # Find cycle
    for node in graph:
        if node not in color and dfs(node):
            break
  
    if cycle_start is None:
        return None
  
    # Reconstruct cycle path
    cycle = []
    current = cycle_start
    while True:
        cycle.append(current)
        current = parent[current]
        if current == cycle_start:
            break
  
    cycle.append(cycle_start)  # Complete the cycle
    return cycle[::-1]  # Reverse for correct order
```

## Complexity Analysis: Time and Space Trade-offs

> **Understanding complexity is crucial for FAANG interviews. Let's break down the costs:**

### Time Complexity

* **Both algorithms** : O(V + E)
* V = number of vertices
* E = number of edges
* We visit each vertex once and each edge once

### Space Complexity

* **Undirected** : O(V) for visited set + O(V) for recursion stack = O(V)
* **Directed** : O(V) for color mapping + O(V) for recursion stack = O(V)

### Why This Complexity is Optimal

> **You cannot detect cycles faster than O(V + E) because in the worst case, you need to examine every edge to determine if a cycle exists.**

## Common Interview Variations and Edge Cases

### 1. Self-Loops

```python
# A node pointing to itself
graph = {'A': ['A']}
# This is a cycle of length 1
```

### 2. Disconnected Components

```python
# Multiple separate graphs
graph = {
    'A': ['B'], 'B': ['C'], 'C': [],
    'D': ['E'], 'E': ['D']  # Cycle here
}
```

### 3. Empty Graphs

```python
# Edge case: no nodes or edges
graph = {}
# Should return False (no cycles in empty graph)
```

## Interview Tips and Best Practices

> **When approaching cycle detection in an interview, follow this systematic approach:**

### 1. Clarify the Graph Type

Always ask: "Is this a directed or undirected graph?" The approach changes significantly.

### 2. Discuss Edge Cases

* Self-loops
* Disconnected components
* Empty graphs
* Single nodes

### 3. Start with the Simpler Approach

For undirected graphs, the parent-tracking method is more intuitive to explain.

### 4. Optimize if Asked

Some interviewers might ask about Union-Find for undirected graphs:

```python
def has_cycle_union_find(edges, n):
    """
    Alternative approach for undirected graphs using Union-Find
    More efficient for dense graphs
    """
    parent = list(range(n))
  
    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]
  
    def union(x, y):
        px, py = find(x), find(y)
        if px == py:
            return False  # Cycle detected!
        parent[px] = py
        return True
  
    for u, v in edges:
        if not union(u, v):
            return True
  
    return False
```

## Putting It All Together

> **Cycle detection is fundamental because it appears in many real-world problems: dependency resolution, deadlock detection, workflow validation, and more.**

The key takeaways for your FAANG interview:

1. **Understand the difference** between directed and undirected approaches
2. **Master state management** - especially the three-color system for directed graphs
3. **Practice edge cases** - they often separate good candidates from great ones
4. **Know your complexities** - both time and space
5. **Be ready to extend** - can you find the actual cycle? Handle weighted graphs?

When you see a cycle detection problem in your interview, take a deep breath and remember: you're not just finding a loop, you're demonstrating your mastery of graph algorithms, state management, and systematic problem-solving. These skills will serve you well not just in the interview, but in building the next generation of scalable systems.
