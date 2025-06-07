# Lowest Common Ancestor with Binary Lifting: A Complete Guide from First Principles

Let me take you through one of the most elegant and powerful techniques in competitive programming and technical interviews -  **Lowest Common Ancestor (LCA) using Binary Lifting** .

## Understanding the Foundation: What is a Lowest Common Ancestor?

> **First Principle** : The Lowest Common Ancestor of two nodes in a tree is the deepest node that is an ancestor of both nodes.

Let's start with the most basic understanding. Imagine you have a family tree:

```
        A (Great-Grandparent)
       / \
      B   C
     /   / \
    D   E   F
   /
  G
```

If we want to find the LCA of nodes `G` and `E`:

* Ancestors of `G`: G → D → B → A
* Ancestors of `E`: E → C → A
* **Common ancestors** : A
* **Lowest (deepest) common ancestor** : A

But what about `G` and `D`?

* Ancestors of `G`: G → D → B → A
* Ancestors of `D`: D → B → A
* **Lowest common ancestor** : D (since D is an ancestor of G)

> **Key Insight** : LCA is fundamental because it represents the "meeting point" when tracing paths from two nodes toward the root.

## Why Do We Need LCA? The Problem Motivation

In FAANG interviews, LCA appears in various disguises:

**1. Distance Between Nodes**

```
Distance(u, v) = depth[u] + depth[v] - 2 * depth[LCA(u, v)]
```

**2. Path Queries**

* Finding path between any two nodes
* Checking if one node lies on path between two others

**3. Range Queries on Trees**

* Answering queries about values on paths
* Tree-based dynamic programming

## The Naive Approach: Understanding the Limitations

Before diving into binary lifting, let's understand why simpler approaches fall short:

**Approach 1: Store All Ancestors**

```python
def find_lca_naive(node1, node2, parent):
    # Get all ancestors of node1
    ancestors1 = set()
    current = node1
    while current != -1:  # -1 represents no parent (root)
        ancestors1.add(current)
        current = parent[current]
  
    # Find first common ancestor of node2
    current = node2
    while current != -1:
        if current in ancestors1:
            return current
        current = parent[current]
  
    return -1  # Should never happen in a valid tree
```

> **Problem** : This approach takes O(height) time per query, which can be O(n) in the worst case (skewed tree).

**Approach 2: Move Both Nodes Up Level by Level**

```python
def find_lca_level_by_level(u, v, parent, depth):
    # Make both nodes at same level
    while depth[u] > depth[v]:
        u = parent[u]
    while depth[v] > depth[u]:
        v = parent[v]
  
    # Move both up until they meet
    while u != v:
        u = parent[u]
        v = parent[v]
  
    return u
```

> **Problem** : Still O(height) per query, and when you have many queries (typical in interviews), this becomes inefficient.

## Enter Binary Lifting: The Elegant Solution

> **Core Insight** : Instead of moving one step at a time, what if we could take "jumps" of powers of 2? This is the essence of binary lifting.

**Binary lifting** is based on a simple but powerful idea:

> **Any positive integer can be represented as a sum of distinct powers of 2** (binary representation).

For example: 13 = 8 + 4 + 1 = 2³ + 2² + 2⁰

So if we want to move 13 steps up from a node, we can:

1. Jump 8 steps (2³)
2. Jump 4 steps (2²)
3. Jump 1 step (2⁰)

## Building the Binary Lifting Table

Let's understand how to preprocess our tree for binary lifting:

```python
import math

class BinaryLifting:
    def __init__(self, n, edges, root=0):
        self.n = n
        self.LOG = int(math.log2(n)) + 1  # Maximum power of 2 we need
      
        # Build adjacency list
        self.adj = [[] for _ in range(n)]
        for u, v in edges:
            self.adj[u].append(v)
            self.adj[v].append(u)
      
        # Initialize arrays
        self.depth = [0] * n
        self.up = [[-1] * self.LOG for _ in range(n)]
      
        # Build the lifting table
        self._dfs(root, -1)
        self._build_lifting_table()
```

Let me explain each component:

 **1. The `up` table** : `up[node][i]` stores the ancestor that is 2^i steps above `node`

```python
def _dfs(self, node, parent):
    """DFS to set immediate parents and depths"""
    self.up[node][0] = parent  # 2^0 = 1 step up is the direct parent
  
    for neighbor in self.adj[node]:
        if neighbor != parent:
            self.depth[neighbor] = self.depth[node] + 1
            self._dfs(neighbor, node)
```

 **2. Building the complete lifting table** :

```python
def _build_lifting_table(self):
    """Fill up[node][i] for all i from 1 to LOG-1"""
    for i in range(1, self.LOG):
        for node in range(self.n):
            if self.up[node][i-1] != -1:
                # 2^i steps up = 2^(i-1) steps up from the node that is 2^(i-1) steps up
                self.up[node][i] = self.up[self.up[node][i-1]][i-1]
```

> **Mathematical Beauty** : `up[node][i] = up[up[node][i-1]][i-1]`
>
> This means: to go 2^i steps up, first go 2^(i-1) steps up, then go another 2^(i-1) steps up from there.

Let's trace through an example:

```
Tree:    0
        /|\
       1 2 3
      /| |
     4 5 6

up table after DFS:
Node | up[node][0] (parent)
0    | -1
1    | 0  
2    | 0
3    | 0
4    | 1
5    | 1  
6    | 2

up table after building:
Node | up[0] | up[1] | up[2]
0    | -1    | -1    | -1
1    | 0     | -1    | -1  
2    | 0     | -1    | -1
3    | 0     | -1    | -1
4    | 1     | 0     | -1
5    | 1     | 0     | -1
6    | 2     | 0     | -1
```

## The LCA Algorithm: Putting It All Together

Now comes the main algorithm:

```python
def lca(self, u, v):
    """Find LCA of nodes u and v using binary lifting"""
    # Make u the deeper node
    if self.depth[u] < self.depth[v]:
        u, v = v, u
  
    # Step 1: Bring u to the same level as v
    diff = self.depth[u] - self.depth[v]
    u = self._lift_node(u, diff)
  
    # Step 2: If they're the same now, we found LCA
    if u == v:
        return u
  
    # Step 3: Binary search for LCA
    for i in range(self.LOG - 1, -1, -1):
        if (self.up[u][i] != -1 and 
            self.up[v][i] != -1 and 
            self.up[u][i] != self.up[v][i]):
            u = self.up[u][i]
            v = self.up[v][i]
  
    # The LCA is one step up from current positions
    return self.up[u][0]

def _lift_node(self, node, steps):
    """Lift node by exactly 'steps' using binary representation"""
    for i in range(self.LOG):
        if steps & (1 << i):  # If i-th bit is set in steps
            node = self.up[node][i]
            if node == -1:
                break
    return node
```

Let me break down the algorithm step by step:

**Step 1: Level Equalization**

```python
diff = self.depth[u] - self.depth[v]
u = self._lift_node(u, diff)
```

> **Why this works** : We use the binary representation of `diff` to make jumps. For example, if `diff = 5 = 101₂`, we make jumps of 2² and 2⁰.

**Step 2: Binary Search for LCA**

```python
for i in range(self.LOG - 1, -1, -1):
    if (self.up[u][i] != -1 and 
        self.up[v][i] != -1 and 
        self.up[u][i] != self.up[v][i]):
        u = self.up[u][i]
        v = self.up[v][i]
```

> **Core Insight** : We try jumps from largest to smallest. If jumping 2^i steps from both nodes gives us different ancestors, it's safe to make that jump (LCA is still above). If it gives the same ancestor, that ancestor might be the LCA, so we don't jump.

## Complete Implementation with Example

```python
import math

class BinaryLiftingLCA:
    def __init__(self, n, edges, root=0):
        """
        Initialize Binary Lifting for LCA queries
        
        Args:
            n: Number of nodes (0 to n-1)
            edges: List of [u, v] representing edges
            root: Root of the tree (default 0)
        """
        self.n = n
        self.LOG = int(math.log2(n)) + 1 if n > 0 else 1
        
        # Build adjacency list representation of tree
        self.adj = [[] for _ in range(n)]
        for u, v in edges:
            self.adj[u].append(v)
            self.adj[v].append(u)
        
        # Initialize data structures
        self.depth = [0] * n
        # up[node][i] = ancestor that is 2^i steps above node
        self.up = [[-1] * self.LOG for _ in range(n)]
        
        # Build the binary lifting table
        self._build_tree(root)
    
    def _build_tree(self, root):
        """Build depth array and binary lifting table"""
        # DFS to set depths and immediate parents
        self._dfs(root, -1)
        
        # Fill the binary lifting table
        self._build_up_table()
    
    def _dfs(self, node, parent):
        """
        DFS to compute depths and set immediate parents
        
        Args:
            node: Current node
            parent: Parent of current node (-1 for root)
        """
        self.up[node][0] = parent  # Direct parent
        
        for neighbor in self.adj[node]:
            if neighbor != parent:
                self.depth[neighbor] = self.depth[node] + 1
                self._dfs(neighbor, node)
    
    def _build_up_table(self):
        """
        Build the complete binary lifting table
        up[node][i] = up[up[node][i-1]][i-1]
        """
        for i in range(1, self.LOG):
            for node in range(self.n):
                if self.up[node][i-1] != -1:
                    # To go 2^i steps up: go 2^(i-1) steps, then 2^(i-1) more
                    self.up[node][i] = self.up[self.up[node][i-1]][i-1]
    
    def _lift_node(self, node, steps):
        """
        Lift a node by exactly 'steps' using binary lifting
        
        Args:
            node: Starting node
            steps: Number of steps to go up
            
        Returns:
            Node after lifting by 'steps'
        """
        for i in range(self.LOG):
            if steps & (1 << i):  # If i-th bit is set in binary representation
                if self.up[node][i] == -1:
                    return -1  # Can't go that far up
                node = self.up[node][i]
        return node
    
    def lca(self, u, v):
        """
        Find LCA of nodes u and v
        
        Args:
            u, v: Nodes to find LCA for
            
        Returns:
            LCA of u and v
        """
        # Ensure u is the deeper node
        if self.depth[u] < self.depth[v]:
            u, v = v, u
        
        # Step 1: Bring u to same level as v
        level_diff = self.depth[u] - self.depth[v]
        u = self._lift_node(u, level_diff)
        
        # Step 2: If they're same node now, that's the LCA
        if u == v:
            return u
        
        # Step 3: Binary search to find LCA
        # Try jumps from largest to smallest power of 2
        for i in range(self.LOG - 1, -1, -1):
            # If jumping 2^i steps gives different ancestors, it's safe to jump
            if (self.up[u][i] != -1 and 
                self.up[v][i] != -1 and 
                self.up[u][i] != self.up[v][i]):
                u = self.up[u][i]
                v = self.up[v][i]
        
        # After binary search, both u and v are just below LCA
        return self.up[u][0]
    
    def distance(self, u, v):
        """
        Find distance between nodes u and v
        
        Args:
            u, v: Nodes to find distance between
            
        Returns:
            Distance between u and v
        """
        lca_node = self.lca(u, v)
        return self.depth[u] + self.depth[v] - 2 * self.depth[lca_node]
    
    def is_ancestor(self, u, v):
        """
        Check if u is an ancestor of v
        
        Args:
            u: Potential ancestor
            v: Potential descendant
            
        Returns:
            True if u is ancestor of v, False otherwise
        """
        return self.lca(u, v) == u

# Example usage and testing
def test_binary_lifting():
    """
    Test the implementation with a sample tree:
    
         0
        /|\
       1 2 3
      /| |  \
     4 5 6   7
    /
   8
    """
    # Define edges of the tree
    edges = [
        [0, 1], [0, 2], [0, 3],  # Root connections
        [1, 4], [1, 5],          # Node 1's children
        [2, 6],                  # Node 2's children  
        [3, 7],                  # Node 3's children
        [4, 8]                   # Node 4's children
    ]
    
    # Create binary lifting structure
    lca_solver = BinaryLiftingLCA(9, edges, root=0)
    
    # Test cases
    test_cases = [
        (8, 5, 1),  # LCA of 8 and 5 should be 1
        (8, 6, 0),  # LCA of 8 and 6 should be 0  
        (5, 6, 0),  # LCA of 5 and 6 should be 0
        (4, 8, 4),  # LCA of 4 and 8 should be 4 (ancestor case)
        (7, 6, 0),  # LCA of 7 and 6 should be 0
    ]
    
    print("Testing Binary Lifting LCA:")
    print("Tree structure:")
    print("     0")
    print("    /|\\")
    print("   1 2 3")
    print("  /| |  \\")
    print(" 4 5 6   7")
    print("/")
    print("8")
    print()
    
    for u, v, expected in test_cases:
        result = lca_solver.lca(u, v)
        distance = lca_solver.distance(u, v)
        print(f"LCA({u}, {v}) = {result} (expected: {expected}) ✓" if result == expected else f"LCA({u}, {v}) = {result} (expected: {expected}) ✗")
        print(f"Distance({u}, {v}) = {distance}")
        print()

if __name__ == "__main__":
    test_binary_lifting()
```


## Complexity Analysis: Why Binary Lifting is Superior

> **Time Complexity** :
>
> * **Preprocessing** : O(n log n) - We fill up table of size n × log n
> * **Query** : O(log n) - Each LCA query takes at most log n steps
>
> **Space Complexity** : O(n log n) - For storing the up table

 **Comparison with other approaches** :

| Approach       | Preprocessing | Query    | Space      |
| -------------- | ------------- | -------- | ---------- |
| Naive          | O(1)          | O(h)     | O(1)       |
| Binary Lifting | O(n log n)    | O(log n) | O(n log n) |
| Sparse Table   | O(n log n)    | O(1)     | O(n log n) |

> **Key Insight** : When you have many queries (typical in interviews), the O(log n) query time with O(n log n) preprocessing becomes extremely valuable.

## Tracing Through an Example

Let's trace through finding LCA(8, 6) in our example tree:

```
Tree:    0 (depth 0)
        /|\
       1 2 3 (depth 1)  
      /| |  \
     4 5 6   7 (depth 2)
    /
   8 (depth 3)
```

 **up table (after preprocessing)** :

```
Node | up[0] | up[1] | up[2]
0    | -1    | -1    | -1
1    | 0     | -1    | -1
2    | 0     | -1    | -1  
3    | 0     | -1    | -1
4    | 1     | 0     | -1
5    | 1     | 0     | -1
6    | 2     | 0     | -1
7    | 3     | 0     | -1
8    | 4     | 1     | 0
```

 **Step-by-step execution of lca(8, 6)** :

1. **Initial state** : u=8 (depth 3), v=6 (depth 2)
2. **Make u deeper** : u is already deeper, so no swap needed
3. **Level equalization** :

* diff = 3 - 2 = 1
* lift u by 1 step: u = up[8][0] = 4
* Now: u=4 (depth 2), v=6 (depth 2)

1. **Check if equal** : u ≠ v, so continue
2. **Binary search for LCA** :

* i=2: up[4][2] = -1, skip
* i=1: up[4][1] = 0, up[6][1] = 0. They're equal! Don't jump
* i=0: up[4][0] = 1, up[6][0] = 2. They're different! Jump
  * u = up[4][0] = 1
  * v = up[6][0] = 2

1. **Final result** : up[1][0] = 0, so LCA = 0

> **Why the binary search works** : We maintain the invariant that LCA is always above both current positions. When we can't jump (ancestors become equal), we know LCA is exactly one step above.

## Advanced Applications in FAANG Interviews

### 1. Path Queries on Trees

```python
def path_sum(self, u, v, values):
    """Calculate sum of values on path from u to v"""
    lca_node = self.lca(u, v)
  
    # Sum from u to lca + sum from v to lca - value at lca
    sum_u_to_lca = self._path_sum_to_ancestor(u, lca_node, values)
    sum_v_to_lca = self._path_sum_to_ancestor(v, lca_node, values)
  
    return sum_u_to_lca + sum_v_to_lca - values[lca_node]

def _path_sum_to_ancestor(self, node, ancestor, values):
    """Helper: sum values from node to ancestor (inclusive)"""
    total = 0
    current = node
  
    # Calculate steps needed
    steps = self.depth[node] - self.depth[ancestor]
  
    # Add current node value and lift
    while steps > 0 and current != ancestor:
        total += values[current]
      
        # Find highest bit set in steps
        highest_bit = steps.bit_length() - 1
        if self.up[current][highest_bit] != -1:
            current = self.up[current][highest_bit]
            steps -= (1 << highest_bit)
        else:
            current = self.up[current][0]
            steps -= 1
  
    total += values[ancestor]  # Add ancestor value
    return total
```

### 2. Checking if Node is on Path

```python
def is_on_path(self, u, v, node):
    """Check if 'node' lies on path between u and v"""
    lca_uv = self.lca(u, v)
    lca_un = self.lca(u, node)
    lca_vn = self.lca(v, node)
  
    # Node is on path if one of these conditions holds:
    # 1. LCA(u,node) = node and LCA(node,v) = LCA(u,v)
    # 2. LCA(v,node) = node and LCA(node,u) = LCA(u,v)
    return ((lca_un == node and self.lca(node, v) == lca_uv) or
            (lca_vn == node and self.lca(node, u) == lca_uv))
```

## Common Interview Patterns and Edge Cases

> **Pattern 1** : "Find distance between two nodes"
> **Solution** : `distance(u,v) = depth[u] + depth[v] - 2*depth[LCA(u,v)]`

> **Pattern 2** : "Find path between two nodes"
>
> **Solution** : Path u→v = Path u→LCA + Path LCA→v

> **Pattern 3** : "Range queries on tree paths"
> **Solution** : Combine LCA with additional data structures

 **Critical Edge Cases to Handle** :

1. **One node is ancestor of another** :

```python
   # When u is ancestor of v, LCA(u,v) = u
   if self.depth[u] <= self.depth[v]:
       if self._lift_node(v, self.depth[v] - self.depth[u]) == u:
           return u
```

1. **Root queries** :

```python
   # LCA with root is always root
   if u == root or v == root:
       return root
```

1. **Same node queries** :

```python
   # LCA of node with itself
   if u == v:
       return u
```

## FAANG Interview Tips and Gotchas

> **🔥 Pro Tip** : Always ask about the constraints. If there are ≤ 1000 queries with n ≤ 1000, a simpler O(√n) approach might be sufficient and easier to implement.

 **What interviewers look for** :

1. **Understanding of the problem** : Can you explain why LCA is useful?
2. **Multiple approaches** : Start with naive, then optimize
3. **Binary representation insight** : Understanding why powers of 2 work
4. **Implementation details** : Handling edge cases, off-by-one errors
5. **Complexity analysis** : Both time and space

 **Common mistakes to avoid** :

```python
# ❌ Wrong: Forgetting to handle root case
if parent[node] == -1:  # This should be checked

# ❌ Wrong: Not ensuring u is deeper node  
if depth[u] < depth[v]:
    u, v = v, u  # Always do this swap

# ❌ Wrong: Off-by-one in binary search
for i in range(LOG-1, -1, -1):  # Start from LOG-1, not LOG

# ❌ Wrong: Not checking bounds in lifting
if self.up[node][i] == -1:
    continue  # Skip invalid jumps
```

> **Interview Strategy** :
>
> 1. Start by explaining the problem and naive solution
> 2. Identify the bottleneck (repeated ancestor traversal)
> 3. Introduce binary lifting concept with powers of 2
> 4. Walk through preprocessing and query algorithm
> 5. Analyze complexity and discuss trade-offs

The beauty of binary lifting lies in its mathematical elegance - converting the linear problem of tree traversal into a logarithmic one through binary representation. This technique showcases deep algorithmic thinking that interviewers love to see.

Remember: **LCA with binary lifting is not just about memorizing code; it's about understanding how mathematical insights can transform algorithmic complexity.**
