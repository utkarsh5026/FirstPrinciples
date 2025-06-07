# Tree Traversals: Vertical and Diagonal - From First Principles

Let me walk you through one of the most elegant and frequently asked concepts in FAANG interviews:  **vertical and diagonal tree traversals** . We'll build this understanding from the ground up, starting with the very basics.

## Understanding Trees: The Foundation

Before we dive into complex traversals, let's establish what we're working with.

> **A tree is a hierarchical data structure that consists of nodes connected by edges, where each node has at most one parent (except the root) and can have multiple children.**

Think of it like a family tree, but upside down - the oldest ancestor (root) is at the top, and descendants branch downward.

```
        1
       / \
      2   3
     / \   \
    4   5   6
```

In this tree:

* Node 1 is the **root** (no parent)
* Nodes 4, 5, 6 are **leaves** (no children)
* Each connection represents a **parent-child relationship**

## The Coordinate System: Adding Spatial Awareness

Here's where it gets interesting for vertical and diagonal traversals. We need to think of each node as having **coordinates** in a 2D space.

> **Every node in a tree can be assigned coordinates (x, y) where x represents horizontal position and y represents vertical level.**

Let's assign coordinates to our tree:

```
        1(0,0)
       /      \
   2(-1,1)   3(1,1)
   /    \        \
4(-2,2) 5(0,2)  6(2,2)
```

**The coordinate rules:**

* **Root starts at (0, 0)**
* **Left child: (x-1, y+1)**
* **Right child: (x+1, y+1)**
* **Y increases as we go down levels**
* **X shifts left for left children, right for right children**

## Vertical Tree Traversal: Same Column, Top to Bottom

Vertical traversal groups nodes that share the **same x-coordinate** (same vertical column).

> **Vertical traversal collects all nodes in the same vertical line, ordered from top to bottom, and then from left to right across columns.**

From our example:

* **Column -2:** [4]
* **Column -1:** [2]
* **Column 0:** [1, 5]
* **Column 1:** [3]
* **Column 2:** [6]

**Result:** `[4, 2, 1, 5, 3, 6]`

### Implementation: Building the Solution Step by Step

Let's implement this with detailed explanation:

```python
from collections import defaultdict, deque

def vertical_traversal(root):
    if not root:
        return []
  
    # Step 1: Store nodes with their coordinates
    # Key insight: We need (x, y, node_value) for sorting
    coordinates = []
  
    # Step 2: BFS to assign coordinates
    queue = deque([(root, 0, 0)])  # (node, x, y)
  
    while queue:
        node, x, y = queue.popleft()
      
        # Store this node's position and value
        coordinates.append((x, y, node.val))
      
        # Add children with updated coordinates
        if node.left:
            queue.append((node.left, x - 1, y + 1))
        if node.right:
            queue.append((node.right, x + 1, y + 1))
  
    # Step 3: Sort by column (x), then row (y), then value
    coordinates.sort(key=lambda item: (item[0], item[1], item[2]))
  
    # Step 4: Group by columns and extract values
    result = []
    current_column = float('-inf')
  
    for x, y, val in coordinates:
        if x != current_column:
            current_column = x
            result.append([])
        result[-1].append(val)
  
    # Flatten the result
    return [val for column in result for val in column]
```

**Let me break down what each step does:**

1. **Coordinate Collection:** We traverse the tree and record each node's position `(x, y)` along with its value
2. **BFS Traversal:** We use breadth-first search to systematically visit nodes level by level
3. **Coordinate Assignment:** Left children get `x-1`, right children get `x+1`, both get `y+1`
4. **Sorting Strategy:** Primary by x-coordinate (column), secondary by y-coordinate (level), tertiary by value (for ties)
5. **Result Construction:** Group nodes by column and flatten into final answer

### Why This Approach Works

> **The key insight is that vertical traversal is essentially a sorting problem once we have coordinates.**

The BFS ensures we visit nodes systematically, and the sorting handles the complex ordering requirements that vertical traversal demands.

## Diagonal Tree Traversal: Following the Slope

Diagonal traversal is conceptually different but equally elegant.

> **Diagonal traversal groups nodes along diagonal lines where the sum of coordinates (x + y) remains constant.**

Think of it as following diagonal lines from top-left to bottom-right.

Using our tree:

```
        1(0,0) → sum = 0
       /      \
   2(-1,1)   3(1,1) → sum = 0, 2
   /    \        \
4(-2,2) 5(0,2)  6(2,2) → sum = 0, 2, 4
```

**Diagonal groups:**

* **Diagonal 0:** [1, 2, 5] (sum of coordinates = 0)
* **Diagonal 2:** [3, 6] (sum of coordinates = 2)
* **Diagonal 4:** [4] (sum of coordinates = 4)

### Implementation: The Diagonal Solution

```python
from collections import defaultdict

def diagonal_traversal(root):
    if not root:
        return []
  
    # Step 1: Group nodes by diagonal index (x + y)
    diagonals = defaultdict(list)
  
    def dfs(node, x, y):
        if not node:
            return
      
        # The diagonal index is x + y
        diagonal_index = x + y
        diagonals[diagonal_index].append(node.val)
      
        # Traverse children with updated coordinates
        dfs(node.left, x - 1, y + 1)
        dfs(node.right, x + 1, y + 1)
  
    # Step 2: Start DFS from root at (0, 0)
    dfs(root, 0, 0)
  
    # Step 3: Sort diagonals by index and flatten
    result = []
    for diagonal_index in sorted(diagonals.keys()):
        result.extend(diagonals[diagonal_index])
  
    return result
```

**Understanding the diagonal logic:**

1. **Diagonal Index:** `x + y` gives us the diagonal number
2. **DFS Traversal:** We use depth-first search to maintain the natural order within diagonals
3. **Grouping:** Nodes with the same `x + y` value belong to the same diagonal
4. **Ordering:** We process diagonals in ascending order of their indices

### Why x + y Works for Diagonals

> **The mathematical insight: nodes on the same diagonal have a constant sum of their coordinates.**

If you imagine the tree plotted on a coordinate system, diagonal lines slanting down-right have the property that as x increases by 1, y also increases by 1, keeping `x + y` constant.

## Mobile-Optimized Tree Visualization

```
     1(0,0)
     /    \
  2(-1,1)  3(1,1)
   /  \      \
4(-2,2) 5(0,2) 6(2,2)

Vertical Columns:
│     │     │     │     │
│  4  │  2  │1 5  │  3  │  6
│     │     │     │     │
-2   -1     0     1     2

Diagonal Lines:
╲     ╲     ╲     ╲
 ╲ 1  ╲     ╲     ╲
  ╲2,5╲  3  ╲     ╲
   ╲4 ╲  6  ╲     ╲
    ╲  ╲     ╲     ╲
    0   2     4     6
```

## FAANG Interview Strategies

### Common Variations You'll Encounter

> **Interviewers love to modify these problems slightly to test your adaptability.**

**1. Vertical Traversal with Level Order**

```python
def vertical_traversal_level_order(root):
    # Same as vertical, but process level by level first
    level_nodes = defaultdict(list)
  
    def bfs_with_levels(root):
        queue = deque([(root, 0, 0)])
      
        while queue:
            node, x, y = queue.popleft()
            level_nodes[y].append((x, node.val))
          
            if node.left:
                queue.append((node.left, x - 1, y + 1))
            if node.right:
                queue.append((node.right, x + 1, y + 1))
  
    bfs_with_levels(root)
    # Process level by level, then sort within each level
```

**2. Right Diagonal Traversal**

```python
def right_diagonal_traversal(root):
    # For right diagonals, use x - y as the key
    diagonals = defaultdict(list)
  
    def dfs(node, x, y):
        if not node:
            return
      
        # Right diagonal index is x - y
        diagonal_index = x - y
        diagonals[diagonal_index].append(node.val)
      
        dfs(node.left, x - 1, y + 1)
        dfs(node.right, x + 1, y + 1)
```

### Time and Space Complexity Analysis

> **Understanding complexity is crucial for FAANG interviews.**

**Vertical Traversal:**

* **Time Complexity:** O(N log N) where N is number of nodes
  * O(N) for BFS traversal
  * O(N log N) for sorting coordinates
* **Space Complexity:** O(N) for storing coordinates and result

**Diagonal Traversal:**

* **Time Complexity:** O(N log D) where D is number of diagonals
  * O(N) for DFS traversal
  * O(D log D) for sorting diagonal keys (D ≤ N)
* **Space Complexity:** O(N) for storing diagonals and recursion stack

### Interview Tips and Gotchas

> **These are the details that separate good candidates from great ones.**

**1. Handle Edge Cases**

```python
# Always check for empty tree
if not root:
    return []

# Consider single node tree
if not root.left and not root.right:
    return [root.val]
```

**2. Clarify Requirements**

* "Should nodes with same coordinates be sorted by value?"
* "Do you want left-to-right or right-to-left within columns?"
* "Should I return list of lists or flattened list?"

**3. Optimize Space When Possible**

```python
# Instead of storing all coordinates, you can sometimes
# build result directly during traversal
def vertical_traversal_optimized(root):
    columns = defaultdict(list)
  
    def dfs(node, x, y):
        if not node:
            return
        columns[x].append((y, node.val))
        dfs(node.left, x - 1, y + 1)
        dfs(node.right, x + 1, y + 1)
  
    dfs(root, 0, 0)
  
    result = []
    for x in sorted(columns.keys()):
        # Sort by y-coordinate, then by value
        columns[x].sort()
        result.extend([val for y, val in columns[x]])
  
    return result
```

## Advanced Considerations

### When to Use Each Approach

> **Choose your traversal method based on the problem requirements.**

**Use Vertical Traversal when:**

* You need to group nodes by their horizontal position
* Problem asks for "column-wise" processing
* You're implementing features like "print tree vertically"

**Use Diagonal Traversal when:**

* You need to process nodes along diagonal paths
* Problem involves "anti-diagonal" or "slope-based" grouping
* You're working with matrix representations of trees

### Connecting to Other Tree Problems

These traversal techniques are building blocks for more complex problems:

**1. Tree Serialization/Deserialization**
**2. Vertical Sum of Binary Tree**
**3. Print Binary Tree in 2D**
**4. Bottom View/Top View of Binary Tree**

The coordinate system thinking we've developed here applies to all these problems.

---

> **Remember: The key to mastering these traversals is understanding that trees can be viewed as coordinate systems, and different traversals are just different ways of organizing those coordinates.**

Practice implementing both approaches until the coordinate assignment becomes second nature. In FAANG interviews, the ability to visualize and manipulate these coordinate relationships often determines success.
