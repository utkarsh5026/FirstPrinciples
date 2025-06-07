# Shortest Path Algorithms: Dijkstra's Algorithm - From First Principles

## Understanding the Foundation: What is a Shortest Path Problem?

Before diving into Dijkstra's algorithm, let's establish the fundamental concepts from the ground up.

> **Core Concept** : A shortest path problem asks us to find the minimum cost to travel from one point to another in a network where connections have different costs or weights.

### Real-World Analogy

Imagine you're planning a road trip from your home to a friend's house. You have multiple routes available:

* Route A: 100 miles, heavy traffic
* Route B: 120 miles, light traffic
* Route C: 80 miles, but includes toll roads

The "shortest" path isn't necessarily the one with fewer miles - it depends on what we're optimizing for (time, distance, cost, etc.).

### Mathematical Foundation

In graph theory terms, we represent this as:

* **Vertices (Nodes)** : Cities, intersections, or points of interest
* **Edges** : Roads or connections between vertices
* **Weights** : The cost of traversing each edge (distance, time, toll cost, etc.)

```
Graph Representation:
    A ----5---- B
    |          /|
    2        3  |
    |       /   4
    C ----1---- D
```

## Why Do We Need Special Algorithms?

### The Naive Approach Problem

You might think: "Why not just try all possible paths?" Let's see why this fails:

```javascript
// Naive approach - try all paths (NEVER do this!)
function findAllPaths(graph, start, end, visited = new Set()) {
    if (start === end) return [[end]];
  
    visited.add(start);
    let allPaths = [];
  
    for (let neighbor of graph[start]) {
        if (!visited.has(neighbor)) {
            let subPaths = findAllPaths(graph, neighbor, end, visited);
            for (let path of subPaths) {
                allPaths.push([start, ...path]);
            }
        }
    }
  
    visited.delete(start);
    return allPaths;
}
```

> **Critical Issue** : This approach has exponential time complexity O(n!). For a graph with just 10 nodes, we might need to check 3,628,800 different paths!

### Why Dijkstra's Algorithm is Revolutionary

Dijkstra's algorithm uses a **greedy approach** with **optimal substructure** - meaning:

1. We make the locally optimal choice at each step
2. The optimal solution contains optimal solutions to subproblems

## Dijkstra's Algorithm: The Core Principle

> **Dijkstra's Key Insight** : If we know the shortest path to a vertex, we can use that information to find shortest paths to its neighbors without recalculating everything.

### The Algorithm's Logic Flow

Let me break down the algorithm step-by-step:

#### Step 1: Initialization

```
Distance to start vertex = 0
Distance to all other vertices = ∞
Mark all vertices as unvisited
```

#### Step 2: The Main Loop

```
While there are unvisited vertices:
    1. Pick unvisited vertex with minimum distance
    2. Mark it as visited
    3. Update distances to its neighbors
    4. Repeat
```

### Visual Walkthrough Example

Let's trace through this graph:

```
     A
   /   \
  4     2
 /       \
B ----3---- C
 \         /
  5       1
   \     /
     D
```

 **Goal** : Find shortest path from A to D

#### Iteration 1:

```
Current: A (distance = 0)
Distances: {A: 0, B: ∞, C: ∞, D: ∞}
Update neighbors of A:
- B: min(∞, 0 + 4) = 4
- C: min(∞, 0 + 2) = 2
Distances: {A: 0, B: 4, C: 2, D: ∞}
Visited: {A}
```

#### Iteration 2:

```
Current: C (distance = 2, minimum unvisited)
Update neighbors of C:
- B: min(4, 2 + 3) = 4 (no change)
- D: min(∞, 2 + 1) = 3
Distances: {A: 0, B: 4, C: 2, D: 3}
Visited: {A, C}
```

#### Iteration 3:

```
Current: D (distance = 3, minimum unvisited)
Update neighbors of D:
- B: min(4, 3 + 5) = 4 (no change)
Distances: {A: 0, B: 4, C: 2, D: 3}
Visited: {A, C, D}
```

 **Result** : Shortest path A → D = 3 (via A → C → D)

## Implementation Details: Priority Queue is Key

> **Critical Data Structure** : Dijkstra's efficiency depends heavily on using a priority queue (min-heap) to always get the vertex with minimum distance.

### Basic Implementation Structure

```javascript
function dijkstra(graph, start) {
    // Initialize distances - this is our "distance table"
    const distances = {};
    const visited = new Set();
    const previous = {}; // To reconstruct the path
  
    // Set all distances to infinity except start
    for (let vertex in graph) {
        distances[vertex] = vertex === start ? 0 : Infinity;
        previous[vertex] = null;
    }
  
    // Priority queue implementation (simplified)
    const pq = new MinPriorityQueue();
    pq.enqueue(start, 0);
  
    return { distances, previous };
}
```

### The Core Update Logic

```javascript
// This is the heart of Dijkstra's algorithm
function relaxEdge(current, neighbor, weight, distances, pq, previous) {
    const newDistance = distances[current] + weight;
  
    // If we found a shorter path, update it
    if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = current;
        pq.enqueue(neighbor, newDistance);
    }
}
```

> **The "Relaxation" Concept** : We "relax" an edge when we find a shorter path. Think of it like releasing tension on a rubber band - we're making the path as short as possible.

### Complete Implementation with Detailed Explanations

```javascript
class MinPriorityQueue {
    constructor() {
        this.queue = [];
    }
  
    enqueue(item, priority) {
        // Add item with its priority
        this.queue.push({ item, priority });
        // Keep queue sorted by priority (simple approach)
        this.queue.sort((a, b) => a.priority - b.priority);
    }
  
    dequeue() {
        // Remove and return item with lowest priority
        return this.queue.shift();
    }
  
    isEmpty() {
        return this.queue.length === 0;
    }
}

function dijkstraComplete(graph, start) {
    // Step 1: Initialize all our tracking structures
    const distances = {};
    const visited = new Set();
    const previous = {}; // For path reconstruction
    const pq = new MinPriorityQueue();
  
    // Step 2: Set up initial distances
    for (let vertex in graph) {
        distances[vertex] = vertex === start ? 0 : Infinity;
        previous[vertex] = null;
    }
  
    // Step 3: Start with our source vertex
    pq.enqueue(start, 0);
  
    // Step 4: Main algorithm loop
    while (!pq.isEmpty()) {
        const { item: current } = pq.dequeue();
      
        // Skip if we've already processed this vertex
        if (visited.has(current)) continue;
      
        // Mark current vertex as visited
        visited.add(current);
      
        // Step 5: Check all neighbors
        for (let neighbor in graph[current]) {
            const weight = graph[current][neighbor];
          
            // Skip if neighbor is already visited
            if (visited.has(neighbor)) continue;
          
            // Step 6: Calculate potential new distance
            const newDistance = distances[current] + weight;
          
            // Step 7: Update if we found a shorter path
            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previous[neighbor] = current;
                pq.enqueue(neighbor, newDistance);
            }
        }
    }
  
    return { distances, previous };
}
```

### Path Reconstruction Function

```javascript
function getShortestPath(previous, start, end) {
    const path = [];
    let current = end;
  
    // Trace back from end to start using previous pointers
    while (current !== null) {
        path.unshift(current); // Add to beginning of array
        current = previous[current];
    }
  
    // If path doesn't start with start vertex, no path exists
    return path[0] === start ? path : [];
}
```

## Complexity Analysis: Why Dijkstra's is Efficient

### Time Complexity Breakdown

> **Time Complexity** : O((V + E) log V) where V = vertices, E = edges

Let's understand why:

1. **Initialization** : O(V) - setting up distance array
2. **Main loop** : Runs V times (once per vertex)
3. **Priority queue operations** :

* Each vertex dequeued once: O(V log V)
* Each edge causes at most one enqueue: O(E log V)

1. **Total** : O(V log V + E log V) = O((V + E) log V)

### Space Complexity

> **Space Complexity** : O(V) for storing distances, previous pointers, and priority queue

### Comparison with Alternatives

```
Algorithm    | Time Complexity | Space | Use Case
-------------|----------------|-------|----------
Dijkstra     | O((V+E)logV)   | O(V)  | Single source, positive weights
Bellman-Ford | O(VE)          | O(V)  | Negative weights allowed
Floyd-Ward   | O(V³)          | O(V²) | All pairs shortest paths
```

## FAANG Interview Perspective

### Common Interview Variations

#### 1. Network Delay Time (LeetCode 743)

```javascript
function networkDelayTime(times, n, k) {
    // Build adjacency list representation
    const graph = {};
    for (let i = 1; i <= n; i++) {
        graph[i] = {};
    }
  
    // Add edges with weights
    for (let [u, v, w] of times) {
        graph[u][v] = w;
    }
  
    // Run Dijkstra from source k
    const { distances } = dijkstraComplete(graph, k);
  
    // Find maximum distance (time for signal to reach all nodes)
    let maxTime = 0;
    for (let i = 1; i <= n; i++) {
        if (distances[i] === Infinity) return -1; // Unreachable node
        maxTime = Math.max(maxTime, distances[i]);
    }
  
    return maxTime;
}
```

> **Interview Tip** : Always clarify if the graph is directed/undirected and if weights can be negative. Dijkstra's only works with non-negative weights!

#### 2. Cheapest Flights Within K Stops (Modified Dijkstra)

```javascript
function findCheapestPrice(n, flights, src, dst, k) {
    // This requires a modification because we need to track stops
    const graph = {};
    for (let i = 0; i < n; i++) graph[i] = [];
  
    for (let [from, to, price] of flights) {
        graph[from].push([to, price]);
    }
  
    // Priority queue: [cost, city, stops]
    const pq = new MinPriorityQueue();
    pq.enqueue([0, src, 0], 0);
  
    const visited = new Map(); // Track [city, stops] combinations
  
    while (!pq.isEmpty()) {
        const { item: [cost, city, stops] } = pq.dequeue();
      
        if (city === dst) return cost;
        if (stops > k) continue;
      
        const key = `${city}-${stops}`;
        if (visited.has(key)) continue;
        visited.set(key, cost);
      
        for (let [nextCity, price] of graph[city]) {
            pq.enqueue([cost + price, nextCity, stops + 1], cost + price);
        }
    }
  
    return -1;
}
```

### Key Interview Points to Remember

> **Memory Aid** : "Dijkstra's is greedy with positive weights, needs priority queue, and builds optimal solutions incrementally."

#### What Interviewers Look For:

1. **Understanding of when to use Dijkstra's** :

* Single source shortest path
* Non-negative edge weights
* Need actual shortest distances (not just connectivity)

1. **Proper implementation details** :

* Using priority queue/min-heap
* Handling visited vertices correctly
* Path reconstruction when needed

1. **Edge case handling** :

* Disconnected graphs
* Self-loops
* Multiple edges between same vertices

### Common Mistakes in Interviews

```javascript
// WRONG: Using regular array instead of priority queue
function dijkstraBad(graph, start) {
    const distances = { [start]: 0 };
    const unvisited = Object.keys(graph);
  
    // This is O(V²) instead of O((V+E)logV)
    while (unvisited.length > 0) {
        let current = unvisited[0];
        for (let vertex of unvisited) {
            if (distances[vertex] < distances[current]) {
                current = vertex;
            }
        }
        // ... rest of logic
    }
}
```

> **Critical Error** : Without a proper priority queue, the algorithm becomes O(V²), which is unacceptable for large graphs in FAANG interviews.

## Advanced Concepts for Senior Interviews

### Bidirectional Dijkstra

For very large graphs, you might be asked about bidirectional search:

```javascript
function bidirectionalDijkstra(graph, start, end) {
    // Run Dijkstra from both start and end simultaneously
    // Stop when the searches meet
    // This can reduce time complexity significantly for long paths
  
    const forwardDistances = {};
    const backwardDistances = {};
    // Implementation details...
}
```

### A* Algorithm (Dijkstra + Heuristic)

> **Advanced Topic** : A* is Dijkstra's algorithm enhanced with a heuristic function to guide the search toward the target more efficiently.

## Summary: Mastering Dijkstra's for Interviews

**The Essential Checklist:**

1. ✅ Understand the problem requires shortest paths
2. ✅ Verify edge weights are non-negative
3. ✅ Implement with proper priority queue
4. ✅ Handle edge cases (disconnected graph, unreachable nodes)
5. ✅ Know time/space complexity
6. ✅ Can reconstruct actual paths if needed

> **Final Interview Wisdom** : Dijkstra's algorithm embodies the principle of dynamic programming through its optimal substructure property, combined with a greedy approach. Master this, and you'll handle most shortest path problems with confidence.

The algorithm's beauty lies in its guarantee: once a vertex is visited, we've found its shortest path from the source. This certainty allows us to build optimal solutions incrementally, making it both efficient and reliable for solving real-world routing and optimization problems.
