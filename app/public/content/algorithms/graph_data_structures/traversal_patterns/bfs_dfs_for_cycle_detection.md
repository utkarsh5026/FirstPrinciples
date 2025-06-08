# Cycle Detection in Graphs: BFS and DFS from First Principles

## What is a Graph? Building from the Ground Up

Before we dive into cycle detection, let's establish the fundamental building blocks.

> **A graph is simply a collection of nodes (vertices) connected by edges.** Think of it like a social network where people are nodes and friendships are edges, or a city map where intersections are nodes and roads are edges.

### The Two Types of Graphs We Need to Understand

 **Undirected Graph** : Connections go both ways

```
A --- B
|     |
C --- D
```

 **Directed Graph** : Connections have a specific direction

```
A --> B
|     ↓
↓     D
C <---
```

## What is a Cycle? The Core Concept

> **A cycle exists when you can start from a node, follow edges, and return to the same node without repeating any edges.**

In an undirected graph:

```
A --- B
|     |
C --- D
```

Here, A → B → D → C → A forms a cycle.

In a directed graph:

```
A --> B
↑     |
|     ↓
C <-- D
```

Here, A → B → D → C → A forms a cycle (following arrow directions).

## Why Does Cycle Detection Matter in FAANG Interviews?

> **Cycle detection is fundamental to many real-world problems:** dependency resolution, deadlock detection, finding infinite loops in state machines, and validating workflows.

Common interview scenarios:

* **Course Prerequisites** : Can all courses be completed?
* **Build Dependencies** : Can a project be built?
* **Task Scheduling** : Is the schedule valid?

## DFS Approach: The Recursive Explorer

### The Core Intuition

> **DFS explores as deep as possible before backtracking.** For cycle detection, we track which nodes we're currently exploring (the "path") versus which nodes we've completely finished exploring.

### Three States System

```javascript
const WHITE = 0;  // Unvisited
const GRAY = 1;   // Currently being explored (in current path)
const BLACK = 2;  // Completely explored
```

> **The key insight: If we encounter a GRAY node while exploring, we've found a cycle!**

### DFS Implementation for Directed Graphs

```javascript
function hasCycleDFS(graph) {
    const n = graph.length;
    const colors = new Array(n).fill(0); // All WHITE initially
  
    // Helper function for DFS traversal
    function dfs(node) {
        // Mark current node as being explored
        colors[node] = 1; // GRAY
      
        // Explore all neighbors
        for (let neighbor of graph[node]) {
            if (colors[neighbor] === 1) {
                // Found a GRAY node - cycle detected!
                return true;
            }
          
            if (colors[neighbor] === 0 && dfs(neighbor)) {
                // Recursively check unvisited neighbors
                return true;
            }
        }
      
        // Mark as completely explored
        colors[node] = 2; // BLACK
        return false;
    }
  
    // Check each component of the graph
    for (let i = 0; i < n; i++) {
        if (colors[i] === 0 && dfs(i)) {
            return true;
        }
    }
  
    return false;
}
```

**Let's trace through this step by step:**

Consider this directed graph:

```
0 --> 1
|     |
↓     ↓
2 --> 3
↑     |
|     ↓
←-----
```

1. Start DFS from node 0
2. Mark 0 as GRAY, explore its neighbor 1
3. Mark 1 as GRAY, explore its neighbor 3
4. Mark 3 as GRAY, explore its neighbor 2
5. Mark 2 as GRAY, explore its neighbor 3
6. **Node 3 is already GRAY - CYCLE DETECTED!**

### DFS for Undirected Graphs: A Different Challenge

> **In undirected graphs, we need to be careful not to count the edge we just came from as a cycle.**

```javascript
function hasCycleUndirectedDFS(graph) {
    const n = graph.length;
    const visited = new Array(n).fill(false);
  
    function dfs(node, parent) {
        visited[node] = true;
      
        for (let neighbor of graph[node]) {
            // Skip the edge we came from
            if (neighbor === parent) continue;
          
            if (visited[neighbor]) {
                // Found a visited node that's not our parent - cycle!
                return true;
            }
          
            if (dfs(neighbor, node)) {
                return true;
            }
        }
      
        return false;
    }
  
    // Check each component
    for (let i = 0; i < n; i++) {
        if (!visited[i] && dfs(i, -1)) {
            return true;
        }
    }
  
    return false;
}
```

## BFS Approach: The Level-by-Level Explorer

### The Topological Sort Strategy

> **For directed graphs, BFS uses Kahn's algorithm for topological sorting.** If we can't sort all nodes topologically, there must be a cycle.

### The Intuition Behind Kahn's Algorithm

1. **Find nodes with no incoming edges** (in-degree = 0)
2. **Remove them and update in-degrees** of their neighbors
3. **Repeat until no more nodes can be removed**
4. **If nodes remain, there's a cycle**

```javascript
function hasCycleBFS(graph) {
    const n = graph.length;
    const inDegree = new Array(n).fill(0);
  
    // Calculate in-degrees
    for (let i = 0; i < n; i++) {
        for (let neighbor of graph[i]) {
            inDegree[neighbor]++;
        }
    }
  
    // Find all nodes with in-degree 0
    const queue = [];
    for (let i = 0; i < n; i++) {
        if (inDegree[i] === 0) {
            queue.push(i);
        }
    }
  
    let processedNodes = 0;
  
    // Process nodes level by level
    while (queue.length > 0) {
        const current = queue.shift();
        processedNodes++;
      
        // Remove current node and update neighbors
        for (let neighbor of graph[current]) {
            inDegree[neighbor]--;
          
            // If neighbor now has no incoming edges, add to queue
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        }
    }
  
    // If we couldn't process all nodes, there's a cycle
    return processedNodes !== n;
}
```

**Visual representation of the process:**

```
Initial: [1] -> [2] -> [3]
              ↗ ↓
           [0]   [4]

Step 1: in-degrees = [0, 1, 1, 1, 1]
        queue = [0]

Step 2: Remove 0, update neighbors
        in-degrees = [0, 0, 0, 1, 1]
        queue = [1, 2]

Step 3: Remove 1, remove 2...
        Continue until all processed
```

### BFS for Undirected Graphs: Union-Find Approach

> **For undirected graphs, BFS cycle detection often uses Union-Find (Disjoint Set) data structure.**

```javascript
class UnionFind {
    constructor(n) {
        this.parent = Array.from({length: n}, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }
  
    find(x) {
        if (this.parent[x] !== x) {
            // Path compression
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }
  
    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);
      
        if (rootX === rootY) {
            return false; // Already in same set - cycle detected!
        }
      
        // Union by rank
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
      
        return true;
    }
}

function hasCycleUndirectedBFS(edges, n) {
    const uf = new UnionFind(n);
  
    for (let [u, v] of edges) {
        if (!uf.union(u, v)) {
            return true; // Cycle detected
        }
    }
  
    return false;
}
```

## Interview Strategy: When to Use Which Approach

### DFS vs BFS Decision Matrix

> **DFS is generally preferred for cycle detection because:**
>
> * More intuitive recursive implementation
> * Better space complexity for sparse graphs
> * Easier to implement under interview pressure

| Graph Type             | Best Approach            | Why                         |
| ---------------------- | ------------------------ | --------------------------- |
| Directed               | DFS with 3-colors        | Clear cycle detection logic |
| Undirected             | DFS with parent tracking | Simple and efficient        |
| Dense graphs           | BFS (Kahn's)             | Better cache performance    |
| Need topological order | BFS (Kahn's)             | Gets ordering as bonus      |

### Common Interview Variations

**1. Course Schedule Problem**

```javascript
// Can finish all courses given prerequisites?
function canFinish(numCourses, prerequisites) {
    // Build adjacency list
    const graph = Array.from({length: numCourses}, () => []);
  
    for (let [course, prereq] of prerequisites) {
        graph[prereq].push(course);
    }
  
    // Use DFS cycle detection
    return !hasCycleDFS(graph);
}
```

**2. Detect Cycle in Linked List**

```javascript
// Special case: use Floyd's algorithm (two pointers)
function hasCycleLinkedList(head) {
    let slow = head;
    let fast = head;
  
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
      
        if (slow === fast) {
            return true; // Cycle detected
        }
    }
  
    return false;
}
```

## Complexity Analysis

### Time Complexity

> **Both DFS and BFS have the same time complexity: O(V + E)**
>
> * V = number of vertices
> * E = number of edges
> * We visit each vertex once and examine each edge once

### Space Complexity

 **DFS** : O(V) for recursion stack + color array
 **BFS** : O(V) for queue + in-degree array

> **In practice, DFS might use more space due to recursion stack depth, especially in deep graphs.**

## Advanced Patterns for FAANG Interviews

### Pattern 1: Finding the Actual Cycle

```javascript
function findCycle(graph) {
    const colors = new Array(graph.length).fill(0);
    const parent = new Array(graph.length).fill(-1);
    let cycleStart = -1;
  
    function dfs(node) {
        colors[node] = 1;
      
        for (let neighbor of graph[node]) {
            if (colors[neighbor] === 1) {
                cycleStart = neighbor;
                return true;
            }
          
            if (colors[neighbor] === 0) {
                parent[neighbor] = node;
                if (dfs(neighbor)) return true;
            }
        }
      
        colors[node] = 2;
        return false;
    }
  
    // Find cycle and reconstruct path
    for (let i = 0; i < graph.length; i++) {
        if (colors[i] === 0 && dfs(i)) {
            const cycle = [];
            let curr = cycleStart;
          
            do {
                cycle.push(curr);
                curr = parent[curr];
            } while (curr !== cycleStart);
          
            cycle.push(cycleStart);
            return cycle.reverse();
        }
    }
  
    return [];
}
```

### Pattern 2: Counting Cycles

> **For counting all cycles, use backtracking with DFS, but be careful of exponential complexity.**

## Interview Tips and Common Pitfalls

### What Interviewers Look For

1. **Clear problem understanding** : Directed vs undirected graphs
2. **Correct algorithm choice** : DFS vs BFS reasoning
3. **Edge case handling** : Empty graphs, single nodes, self-loops
4. **Code clarity** : Clean, readable implementation
5. **Complexity analysis** : Time and space trade-offs

### Common Mistakes to Avoid

> **Pitfall 1** : Forgetting parent tracking in undirected graphs
> **Pitfall 2** : Not handling disconnected components
> **Pitfall 3** : Mixing up the three-color system in directed graphs
> **Pitfall 4** : Off-by-one errors in adjacency list indexing

### The Perfect Interview Answer Structure

1. **Clarify the problem** : "Are we dealing with directed or undirected graphs?"
2. **Explain the approach** : "I'll use DFS with three colors because..."
3. **Write clean code** : Step by step, with comments
4. **Test with examples** : Walk through a small case
5. **Analyze complexity** : Both time and space
6. **Discuss alternatives** : "We could also use BFS with Kahn's algorithm..."

This comprehensive understanding of cycle detection will serve you well in technical interviews, where the ability to explain your reasoning from first principles is just as important as writing correct code.
