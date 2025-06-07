# Maximum Bipartite Matching & Hungarian Algorithm: A Deep Dive for FAANG Interviews

## Understanding the Foundation: What is a Bipartite Graph?

Let's start from the very beginning. Imagine you're organizing a school dance where you need to pair up students. You have two groups: boys and girls. A boy can only be paired with a girl, and vice versa. This natural separation into two distinct groups is exactly what defines a  **bipartite graph** .

> **First Principle** : A bipartite graph is a graph whose vertices can be divided into two disjoint sets such that no two vertices within the same set are adjacent (connected by an edge).

```
Visual Representation (Mobile Optimized):

    Boys        Girls
     A  --------  1
     |     X     |
     |        X  |
     B  --------  2
     |           |
     |           |
     C  --------  3
```

In this example:

* Set 1: {A, B, C} (boys)
* Set 2: {1, 2, 3} (girls)
* Edges exist only between different sets

## What is Matching in Graph Theory?

> **Core Concept** : A matching in a graph is a set of edges without common vertices. In simpler terms, each vertex can be "matched" to at most one other vertex.

Let's examine different types of matchings:

**Example Graph:**

```
    A  --------  1
    |           |
    |           |
    B  --------  2
    |           |
    |           |
    C  --------  3
                |
                |
    D  --------  4
```

**Valid Matching 1:** {(A,1), (B,2)}

* A is matched to 1
* B is matched to 2
* C and D remain unmatched

**Valid Matching 2:** {(A,1), (C,3), (D,4)}

* Three pairs are formed
* B remains unmatched

> **Key Insight** : In a matching, no vertex can appear in more than one edge. This is like ensuring each person gets exactly one dance partner.

## Maximum Bipartite Matching: The Core Problem

**Maximum Bipartite Matching** asks: *What's the largest possible matching we can find in a bipartite graph?*

Let's work through a practical example:

```
Job Assignment Problem:

Candidates    Jobs
    A  --------  1 (Developer)
    |     X     |
    |        X  |
    B  --------  2 (Designer)
    |           |
    |           |
    C  --------  3 (Manager)
```

Here, each candidate can be qualified for multiple jobs, but each job can only be assigned to one candidate.

**Finding Maximum Matching - Step by Step:**

1. **Start with any valid matching**
2. **Look for "augmenting paths"**
3. **Increase matching size using these paths**

### Implementation: Maximum Bipartite Matching using DFS

```python
class BipartiteMatching:
    def __init__(self, n_left, n_right):
        # n_left: number of vertices in left set
        # n_right: number of vertices in right set
        self.n_left = n_left
        self.n_right = n_right
      
        # Adjacency list for left vertices
        self.graph = [[] for _ in range(n_left)]
      
        # match[i] = j means right vertex j is matched to left vertex i
        # -1 means unmatched
        self.match = [-1] * n_right
  
    def add_edge(self, u, v):
        """Add edge from left vertex u to right vertex v"""
        self.graph[u].append(v)
  
    def dfs(self, u, visited):
        """
        DFS to find augmenting path starting from left vertex u
      
        An augmenting path is a path that:
        1. Starts from an unmatched left vertex
        2. Alternates between unmatched and matched edges
        3. Ends at an unmatched right vertex
        """
        # Try all adjacent right vertices
        for v in self.graph[u]:
            if visited[v]:
                continue
              
            visited[v] = True
          
            # If right vertex v is unmatched OR
            # we can find an augmenting path from its current match
            if self.match[v] == -1 or self.dfs(self.match[v], visited):
                self.match[v] = u  # Create/update the matching
                return True
      
        return False
  
    def max_matching(self):
        """Find maximum bipartite matching"""
        result = 0
      
        # Try to find augmenting path for each left vertex
        for u in range(self.n_left):
            visited = [False] * self.n_right
            if self.dfs(u, visited):
                result += 1
      
        return result, self.match
```

**Detailed Explanation of the Algorithm:**

> **Why does this work?** The algorithm is based on the concept of "augmenting paths" from flow theory. An augmenting path is like finding a chain reaction where we can reassign matches to increase the total matching size.

Let's trace through an example:

```python
# Example: Job assignment
# Candidates: A(0), B(1), C(2)
# Jobs: Dev(0), Design(1), Manager(2)

bm = BipartiteMatching(3, 3)

# Add edges (candidate -> job they can do)
bm.add_edge(0, 0)  # A can do Dev
bm.add_edge(0, 1)  # A can do Design
bm.add_edge(1, 1)  # B can do Design  
bm.add_edge(1, 2)  # B can do Manager
bm.add_edge(2, 0)  # C can do Dev

max_size, matching = bm.max_matching()
print(f"Maximum matching size: {max_size}")
print(f"Job assignments: {matching}")
```

**Step-by-step execution:**

1. **Try candidate A (0):**
   * Can do Job 0 (Dev) - Job 0 is unmatched
   * Assign: match[0] = 0 (Job Dev assigned to A)
   * Matching size: 1
2. **Try candidate B (1):**
   * Can do Job 1 (Design) - Job 1 is unmatched
   * Assign: match[1] = 1 (Job Design assigned to B)
   * Matching size: 2
3. **Try candidate C (2):**
   * Can do Job 0 (Dev) - Job 0 is already matched to A
   * Check if we can reassign A: A can also do Job 1
   * Job 1 is matched to B, check if B can be reassigned: B can do Job 2
   * Job 2 is unmatched!
   * **Chain reassignment:** C→Job0, A→Job1, B→Job2
   * Matching size: 3

## The Hungarian Algorithm: Optimal Assignment with Costs

While maximum bipartite matching finds the largest matching, the **Hungarian Algorithm** solves a more complex problem: finding the minimum (or maximum) cost perfect matching.

> **Perfect Matching** : A matching that covers every vertex in the graph.

> **Cost Matrix** : Each edge has an associated cost/weight representing the "cost" of that assignment.

### Problem Setup: Assignment Problem

Imagine you're a project manager assigning tasks to team members. Each person has different efficiency levels for different tasks:

```
Cost Matrix (time in hours):
         Task1  Task2  Task3
Alice      2      4      6
Bob        3      1      5  
Carol      4      3      2
```

**Goal:** Assign each person to exactly one task such that total time is minimized.

### Hungarian Algorithm Implementation

```python
import numpy as np
from typing import List, Tuple

class HungarianAlgorithm:
    def __init__(self, cost_matrix):
        """
        Initialize with cost matrix where cost_matrix[i][j] 
        is the cost of assigning worker i to job j
        """
        self.original_cost = np.array(cost_matrix, dtype=float)
        self.n = len(cost_matrix)
        self.cost_matrix = self.original_cost.copy()
      
    def solve(self) -> Tuple[float, List[int]]:
        """
        Solve assignment problem using Hungarian Algorithm
        Returns: (minimum_cost, assignment_list)
        """
        # Step 1: Subtract row minimums
        self._subtract_row_minimums()
      
        # Step 2: Subtract column minimums  
        self._subtract_column_minimums()
      
        # Step 3: Find minimum number of lines to cover all zeros
        while True:
            assignment = self._find_assignment()
            if assignment:
                cost = self._calculate_cost(assignment)
                return cost, assignment
          
            # If no complete assignment found, modify matrix
            self._modify_matrix()
  
    def _subtract_row_minimums(self):
        """Step 1: Subtract minimum element of each row from all elements in that row"""
        for i in range(self.n):
            row_min = np.min(self.cost_matrix[i])
            self.cost_matrix[i] -= row_min
  
    def _subtract_column_minimums(self):
        """Step 2: Subtract minimum element of each column from all elements in that column"""
        for j in range(self.n):
            col_min = np.min(self.cost_matrix[:, j])
            self.cost_matrix[:, j] -= col_min
  
    def _find_assignment(self) -> List[int]:
        """
        Try to find a complete assignment using only zero-cost edges
        Returns assignment or None if not possible
        """
        # Create bipartite matching on zero elements
        assignment = [-1] * self.n
      
        for i in range(self.n):
            visited = [False] * self.n
            self._dfs_assignment(i, assignment, visited)
      
        # Check if assignment is complete
        if all(job != -1 for job in assignment):
            return assignment
        return None
  
    def _dfs_assignment(self, worker, assignment, visited):
        """DFS to find augmenting path for assignment"""
        for job in range(self.n):
            if self.cost_matrix[worker][job] == 0 and not visited[job]:
                visited[job] = True
              
                if assignment[job] == -1 or self._dfs_assignment(assignment[job], assignment, visited):
                    assignment[job] = worker
                    return True
        return False
  
    def _modify_matrix(self):
        """Modify matrix when complete assignment not found"""
        # Find minimum uncovered element
        covered_rows, covered_cols = self._find_minimum_cover()
      
        min_uncovered = float('inf')
        for i in range(self.n):
            for j in range(self.n):
                if not covered_rows[i] and not covered_cols[j]:
                    min_uncovered = min(min_uncovered, self.cost_matrix[i][j])
      
        # Subtract min_uncovered from uncovered elements
        # Add min_uncovered to doubly covered elements
        for i in range(self.n):
            for j in range(self.n):
                if not covered_rows[i] and not covered_cols[j]:
                    self.cost_matrix[i][j] -= min_uncovered
                elif covered_rows[i] and covered_cols[j]:
                    self.cost_matrix[i][j] += min_uncovered
  
    def _calculate_cost(self, assignment):
        """Calculate total cost of assignment using original cost matrix"""
        total_cost = 0
        for job, worker in enumerate(assignment):
            total_cost += self.original_cost[worker][job]
        return total_cost
```

**Example Usage:**

```python
# Cost matrix: rows=workers, columns=jobs
cost_matrix = [
    [2, 4, 6],  # Alice's efficiency for each task
    [3, 1, 5],  # Bob's efficiency  
    [4, 3, 2]   # Carol's efficiency
]

hungarian = HungarianAlgorithm(cost_matrix)
min_cost, assignment = hungarian.solve()

print(f"Minimum total cost: {min_cost}")
print("Optimal assignment:")
workers = ["Alice", "Bob", "Carol"]
tasks = ["Task1", "Task2", "Task3"] 

for job, worker_idx in enumerate(assignment):
    print(f"  {tasks[job]} -> {workers[worker_idx]} (cost: {cost_matrix[worker_idx][job]})")
```

## Visual Understanding: How Hungarian Algorithm Works

Let's trace through the algorithm step by step:

```
Initial Cost Matrix:
    T1  T2  T3
A   2   4   6
B   3   1   5
C   4   3   2

Step 1 - Subtract row minimums:
Row mins: [2, 1, 2]

    T1  T2  T3
A   0   2   4
B   2   0   4  
C   2   1   0

Step 2 - Subtract column minimums:
Col mins: [0, 0, 0] (already all minimized)

    T1  T2  T3
A   0   2   4
B   2   0   4
C   2   1   0

Step 3 - Find assignment using zeros:
Possible assignments:
- A -> T1 (cost 0)
- B -> T2 (cost 0)  
- C -> T3 (cost 0)

Total cost = 2 + 1 + 2 = 5
```

## Complexity Analysis

> **Time Complexity:**
>
> * Maximum Bipartite Matching: O(V × E) where V is vertices and E is edges
> * Hungarian Algorithm: O(n³) for n×n assignment problem

> **Space Complexity:**
>
> * Both algorithms: O(V + E) for adjacency representation

## FAANG Interview Perspective

### Common Problem Patterns

**1. Direct Maximum Bipartite Matching:**

```python
def solve_assignment_problem(candidates, jobs, qualifications):
    """
    Given candidates and jobs with qualification requirements,
    find maximum number of assignments possible.
    """
    # Build bipartite graph
    # Apply maximum matching algorithm
    pass
```

**2. Hungarian Algorithm Applications:**

```python
def minimize_task_completion_time(workers, tasks, time_matrix):
    """
    Assign tasks to workers to minimize total completion time.
    Classic Hungarian algorithm application.
    """
    pass
```

**3. Variations and Optimizations:**

* **Hopcroft-Karp Algorithm** : O(E√V) for maximum bipartite matching
* **Min-Cost Max-Flow** : When you need both maximum matching AND minimum cost

### Interview Tips

> **Key Points to Remember:**
>
> 1. Always clarify if the problem needs maximum matching or minimum cost matching
> 2. Identify if the graph is actually bipartite
> 3. Consider edge cases: empty graphs, perfect matchings impossible
> 4. Discuss optimization possibilities based on graph density

**Common Follow-up Questions:**

* "What if costs can be negative?"
* "How would you handle online assignment (dynamic updates)?"
* "Can you optimize for sparse graphs?"

### Practice Problems for FAANG Prep

1. **Maximum Bipartite Matching:**
   * Job assignment with constraints
   * Course scheduling with professor availability
   * Matching mentors to students
2. **Hungarian Algorithm:**
   * Taxi dispatch optimization
   * Server-request assignment in load balancing
   * Resource allocation in cloud computing

The beauty of these algorithms lies in their wide applicability across domains—from computer science theory to real-world optimization problems. Understanding them deeply, especially the underlying principles of augmenting paths and cost reduction, will serve you well in both interviews and practical applications.

> **Final Insight** : These algorithms showcase the power of graph theory in solving complex assignment problems. The key is recognizing when a problem can be modeled as bipartite matching and choosing the appropriate algorithm based on whether you need maximum cardinality or optimal cost.
>
