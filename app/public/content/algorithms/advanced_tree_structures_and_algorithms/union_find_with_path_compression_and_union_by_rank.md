# Union-Find (Disjoint Set Union): A Complete Guide for FAANG Interviews

## What is Union-Find? Starting from the Very Beginning

Imagine you're organizing a massive social network where you need to quickly answer questions like "Are person A and person B connected through mutual friends?" or "How many separate friend groups exist?"

> **The Core Problem** : We need a data structure that can efficiently manage collections of disjoint (non-overlapping) sets and perform two main operations: combining sets and checking if elements belong to the same set.

Union-Find, also known as Disjoint Set Union (DSU), is a data structure designed specifically for this purpose. Let's understand why it exists by examining what happens without it.

## The Problem That Union-Find Solves

### Example: Social Network Components

Consider this social network represented as connections:

```
Person 1 ↔ Person 2
Person 2 ↔ Person 3
Person 5 ↔ Person 6
Person 7 (alone)
```

Without Union-Find, to check if Person 1 and Person 3 are connected, we'd need to:

1. Start from Person 1
2. Visit all connected people using BFS/DFS
3. Check if we reach Person 3

This takes O(V + E) time for each query, which becomes expensive with many queries.

> **Union-Find's Promise** : Answer connectivity queries in nearly O(1) time after preprocessing!

## Building Union-Find from First Principles

### Step 1: The Naive Approach - Array Representation

Let's start with the simplest possible implementation:

```python
class UnionFindNaive:
    def __init__(self, n):
        # Each element initially belongs to its own set
        # parent[i] represents which set element i belongs to
        self.parent = list(range(n))
  
    def find(self, x):
        """Find which set x belongs to"""
        return self.parent[x]
  
    def union(self, x, y):
        """Merge the sets containing x and y"""
        set_x = self.find(x)
        set_y = self.find(y)
      
        if set_x != set_y:
            # Change all elements in set_y to belong to set_x
            for i in range(len(self.parent)):
                if self.parent[i] == set_y:
                    self.parent[i] = set_x
```

**What's happening here?**

* Initially, each element is its own parent (set representative)
* `find(x)` returns the set ID that element x belongs to
* `union(x, y)` merges two sets by updating all elements in one set

**Example walkthrough:**

```
Initial: [0, 1, 2, 3, 4]  (5 elements, each in own set)
union(0, 1): [0, 0, 2, 3, 4]  (0 and 1 now in same set)
union(2, 3): [0, 0, 2, 2, 4]  (2 and 3 now in same set)
union(0, 2): [0, 0, 0, 0, 4]  (all except 4 now in same set)
```

 **Problem** : Union operation takes O(n) time because we might need to update all elements!

### Step 2: Tree Representation - The Real Union-Find

Instead of storing set IDs, let's represent each set as a tree where elements point to their parents:

```python
class UnionFindTree:
    def __init__(self, n):
        # Each element is initially its own parent (root)
        self.parent = list(range(n))
  
    def find(self, x):
        """Find the root of the tree containing x"""
        while self.parent[x] != x:
            x = self.parent[x]
        return x
  
    def union(self, x, y):
        """Connect the roots of trees containing x and y"""
        root_x = self.find(x)
        root_y = self.find(y)
      
        if root_x != root_y:
            # Make one root point to the other
            self.parent[root_x] = root_y
```

 **Key insight** : Instead of storing set IDs, we create tree structures where:

* Each element points to its parent
* The root of each tree represents the entire set
* Two elements are in the same set if they have the same root

**Visual example:**

```
Initial state (each node is its own tree):
0   1   2   3   4

After union(1, 2):
0       2   3   4
        ↑
        1

After union(3, 4):
0       2       4
        ↑       ↑
        1       3

After union(2, 4):
0               4
                ↑
        2       3
        ↑
        1
```

> **This is much better!** Union now takes O(1) time (just updating one parent pointer), and find takes O(height of tree) time.

## The Problem with Basic Trees

Consider this worst-case scenario:

```python
# If we always union in order: union(0,1), union(1,2), union(2,3)...
# We get a linear chain:
```

```
Tree becomes a linked list:
4
↑
3
↑
2
↑
1
↑
0
```

Now `find(0)` takes O(n) time! We've traded one problem for another.

## Optimization 1: Union by Rank

> **The idea** : When unioning two trees, always make the shorter tree point to the taller tree's root.

```python
class UnionFindRank:
    def __init__(self, n):
        self.parent = list(range(n))
        # rank[i] = height of tree rooted at i
        self.rank = [0] * n
  
    def find(self, x):
        while self.parent[x] != x:
            x = self.parent[x]
        return x
  
    def union(self, x, y):
        root_x = self.find(x)
        root_y = self.find(y)
      
        if root_x == root_y:
            return  # Already in same set
      
        # Union by rank: attach smaller tree under larger tree
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            # Same rank: choose arbitrarily and increase rank
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
```

**Why this works:**

* By keeping trees balanced, we ensure the height stays logarithmic
* A tree of height h has at least 2^h nodes
* With n nodes, maximum height is log(n)

**Example of union by rank in action:**

```
Trees of rank 1:    Trees after union:
   1       3           3
   ↑       ↑           ↑ ↑
   0       2           1 2
                       ↑
                       0

The tree with higher rank (3) becomes the new root.
If ranks were equal, we'd pick one and increment its rank.
```

## Optimization 2: Path Compression

Even with union by rank, we still traverse paths during `find`. Path compression optimizes this:

> **The idea** : During `find(x)`, make every node on the path point directly to the root.

```python
class UnionFindPathCompression:
    def __init__(self, n):
        self.parent = list(range(n))
  
    def find(self, x):
        # If x is not the root, recursively find root and compress path
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression!
        return self.parent[x]
  
    def union(self, x, y):
        root_x = self.find(x)
        root_y = self.find(y)
      
        if root_x != root_y:
            self.parent[root_x] = root_y
```

**What path compression does:**

```
Before find(0):         After find(0):
    4                       4
    ↑                     ↑ ↑ ↑ ↑
    3                     0 1 2 3
    ↑
    2
    ↑
    1
    ↑
    0

Now all nodes point directly to root!
Next find(0) will be O(1).
```

## The Complete Implementation: Union by Rank + Path Compression

Here's the optimal Union-Find that combines both optimizations:## Time Complexity Analysis: The Magic of Inverse Ackermann

```python
class UnionFind:
    def __init__(self, n):
        """
        Initialize Union-Find with n elements (0 to n-1)
        Each element starts as its own set
        """
        self.parent = list(range(n))  # parent[i] = parent of element i
        self.rank = [0] * n          # rank[i] = approximate height of tree rooted at i
        self.count = n               # number of disjoint sets
    
    def find(self, x):
        """
        Find the root of the set containing x with path compression
        Time: O(α(n)) where α is inverse Ackermann function (practically O(1))
        """
        if self.parent[x] != x:
            # Path compression: make x point directly to root
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        """
        Unite the sets containing x and y using union by rank
        Returns True if union happened, False if already in same set
        Time: O(α(n))
        """
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x == root_y:
            return False  # Already in same set
        
        # Union by rank: attach tree with lower rank under tree with higher rank
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            # Equal ranks: choose one as root and increment its rank
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        
        self.count -= 1  # One less disjoint set
        return True
    
    def connected(self, x, y):
        """
        Check if x and y are in the same set
        Time: O(α(n))
        """
        return self.find(x) == self.find(y)
    
    def get_count(self):
        """
        Get number of disjoint sets
        Time: O(1)
        """
        return self.count
    
    def get_set_size(self, x):
        """
        Get size of the set containing x
        Note: This requires modification to track sizes
        """
        # This is a bonus method - would need size array to implement efficiently
        pass

# Example usage and testing
def demonstrate_union_find():
    print("=== Union-Find Demonstration ===")
    
    # Create Union-Find for 6 elements: 0, 1, 2, 3, 4, 5
    uf = UnionFind(6)
    print(f"Initial sets: {uf.get_count()}")  # 6 separate sets
    
    # Connect some elements
    print("\nPerforming unions:")
    print(f"union(0, 1): {uf.union(0, 1)}")  # True - union happened
    print(f"union(1, 2): {uf.union(1, 2)}")  # True - union happened
    print(f"union(3, 4): {uf.union(3, 4)}")  # True - union happened
    
    print(f"\nSets after unions: {uf.get_count()}")  # 3 sets now
    
    # Test connectivity
    print(f"\nConnectivity tests:")
    print(f"connected(0, 2): {uf.connected(0, 2)}")  # True
    print(f"connected(0, 3): {uf.connected(0, 3)}")  # False
    print(f"connected(3, 4): {uf.connected(3, 4)}")  # True
    
    # Union already connected elements
    print(f"\nUnion already connected:")
    print(f"union(0, 2): {uf.union(0, 2)}")  # False - already connected
    
    # Final union to connect all
    print(f"\nFinal union:")
    print(f"union(2, 4): {uf.union(2, 4)}")  # True - connects two groups
    print(f"Final sets: {uf.get_count()}")    # 2 sets (one big group + element 5)

# Run the demonstration
demonstrate_union_find()
```

> **The remarkable result** : With both optimizations, both `find` and `union` operations run in O(α(n)) time, where α is the inverse Ackermann function.

### What is α(n)?

The inverse Ackermann function α(n) grows so slowly that:

* α(n) ≤ 4 for all practical values of n (even n = 2^65536)
* For all intents and purposes, α(n) is a constant

**Why this happens:**

1. **Union by rank** ensures tree height is at most log(n)
2. **Path compression** flattens trees over time
3. Together, they create an amortized cost that's nearly constant

### Formal Analysis

Without going into the complex proof, here's the intuition:

```
Operation    | Without optimizations | With rank only | With compression only | With both
-------------|----------------------|----------------|----------------------|----------
find(x)      | O(n)                 | O(log n)       | O(log n) amortized   | O(α(n))
union(x,y)   | O(n)                 | O(log n)       | O(log n) amortized   | O(α(n))
```

> **For FAANG interviews** : You can safely assume Union-Find operations are O(1) for practical purposes.

## Common FAANG Interview Problems and Patterns

### Pattern 1: Connected Components

 **Problem** : Given edges in a graph, find the number of connected components.

```python
def count_components(n, edges):
    """
    Count connected components in an undirected graph
  
    Args:
        n: number of vertices (0 to n-1)
        edges: list of [u, v] representing edges
  
    Returns:
        number of connected components
    """
    uf = UnionFind(n)
  
    # Process each edge
    for u, v in edges:
        uf.union(u, v)
  
    return uf.get_count()

# Example usage
edges = [[0,1], [1,2], [3,4]]  # Two components: {0,1,2} and {3,4}
print(count_components(5, edges))  # Output: 3 (including isolated node 4)
```

**What's happening:**

1. Start with n separate components
2. Each edge potentially merges two components
3. Union-Find efficiently tracks merges
4. Final count gives us the answer

### Pattern 2: Dynamic Connectivity

 **Problem** : Process a sequence of operations to connect nodes and check connectivity.

```python
def process_operations(n, operations):
    """
    Process connectivity operations
  
    operations can be:
    - ("union", x, y): connect x and y
    - ("find", x, y): check if x and y are connected
    """
    uf = UnionFind(n)
    results = []
  
    for op in operations:
        if op[0] == "union":
            uf.union(op[1], op[2])
        elif op[0] == "find":
            results.append(uf.connected(op[1], op[2]))
  
    return results
```

### Pattern 3: Island Problems (2D Grid)

 **Problem** : Count islands in a 2D grid (LeetCode 200 variant with Union-Find).

```python
def count_islands_union_find(grid):
    """
    Count islands using Union-Find approach
    Each cell gets a unique ID: row * cols + col
    """
    if not grid or not grid[0]:
        return 0
  
    rows, cols = len(grid), len(grid[0])
  
    # Count land cells and create Union-Find
    land_cells = 0
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == '1':
                land_cells += 1
  
    uf = UnionFind(rows * cols)
  
    # Directions for adjacent cells (up, down, left, right)
    directions = [(-1,0), (1,0), (0,-1), (0,1)]
  
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == '1':
                current_id = i * cols + j
              
                # Check all adjacent cells
                for di, dj in directions:
                    ni, nj = i + di, j + dj
                    if (0 <= ni < rows and 0 <= nj < cols and 
                        grid[ni][nj] == '1'):
                        neighbor_id = ni * cols + nj
                        uf.union(current_id, neighbor_id)
  
    # Count unique roots among land cells
    roots = set()
    for i in range(rows):
        for j in range(cols):
            if grid[i][j] == '1':
                cell_id = i * cols + j
                roots.add(uf.find(cell_id))
  
    return len(roots)
```

**Key insight for 2D problems:**

* Convert 2D coordinates (i, j) to 1D index: `i * cols + j`
* Only union adjacent land cells
* Count distinct root representatives

## Advanced Interview Scenarios

### Scenario 1: Online vs Offline Processing

> **Online** : Process queries as they come, one by one
>
> **Offline** : See all queries first, then process optimally

Union-Find excels in online scenarios where you can't reorder operations.

### Scenario 2: Deletion Operations

Standard Union-Find doesn't support efficient deletion. Common interview tricks:

1. **Reverse time** : Process deletions backwards as insertions
2. **Tombstone marking** : Mark deleted nodes and handle in find/union
3. **Rebuilding** : Periodically rebuild the structure

### Scenario 3: Weighted Union-Find

Some problems require tracking additional information:

```python
class WeightedUnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.weight = [0] * n  # Additional weight information
  
    def find(self, x):
        if self.parent[x] != x:
            old_parent = self.parent[x]
            self.parent[x] = self.find(self.parent[x])
            # Update weight during path compression
            self.weight[x] += self.weight[old_parent]
        return self.parent[x]
```

## Common Mistakes and Interview Tips

### Mistake 1: Forgetting Path Compression

```python
# Wrong - no path compression
def find(self, x):
    while self.parent[x] != x:
        x = self.parent[x]
    return x

# Correct - with path compression
def find(self, x):
    if self.parent[x] != x:
        self.parent[x] = self.find(self.parent[x])
    return self.parent[x]
```

### Mistake 2: Incorrect Union by Rank

```python
# Wrong - always make y the parent
def union(self, x, y):
    self.parent[self.find(x)] = self.find(y)

# Correct - consider ranks
def union(self, x, y):
    root_x, root_y = self.find(x), self.find(y)
    if root_x == root_y:
        return
    if self.rank[root_x] < self.rank[root_y]:
        self.parent[root_x] = root_y
    elif self.rank[root_x] > self.rank[root_y]:
        self.parent[root_y] = root_x
    else:
        self.parent[root_y] = root_x
        self.rank[root_x] += 1
```

### Interview Communication Tips

1. **Start simple** : Explain the naive approach first
2. **Identify bottlenecks** : "Find takes O(n), can we do better?"
3. **Introduce optimizations** : "Let's use trees... but they can be unbalanced..."
4. **Explain trade-offs** : "Path compression helps future queries"
5. **Mention complexity** : "With both optimizations, it's practically O(1)"

> **Remember** : In FAANG interviews, demonstrating your thought process is as important as the final solution. Show how you build up from simple ideas to the optimal solution.

## When to Use Union-Find vs Alternatives

| Problem Type         | Union-Find | DFS/BFS | Other                 |
| -------------------- | ---------- | ------- | --------------------- |
| Static connectivity  | ✓         | ✓      | Graph data structures |
| Dynamic connectivity | ✓✓       | ✗      | Link-cut tree         |
| Path queries         | ✗         | ✓✓    | -                     |
| Shortest path        | ✗         | ✗      | Dijkstra/Floyd        |
| Cycle detection      | ✓         | ✓      | -                     |
| MST algorithms       | ✓✓       | ✗      | Kruskal's algorithm   |

> **Use Union-Find when** : You need to efficiently merge sets and check connectivity, especially in dynamic scenarios with many queries.

This comprehensive understanding of Union-Find—from first principles to advanced optimizations—will serve you well in any FAANG interview scenario. The key is understanding not just the code, but the reasoning behind each optimization and when to apply this powerful data structure.
