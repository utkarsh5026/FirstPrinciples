# Segment Trees: Mastering Range Queries and Updates for FAANG Interviews

## What Are Segment Trees? (First Principles)

> **Core Concept** : A Segment Tree is a binary tree data structure that allows us to perform range queries and updates on an array in logarithmic time, rather than linear time.

Let's start with the fundamental problem that segment trees solve. Imagine you have an array and need to:

1. Find the sum of elements between indices `i` and `j`
2. Update a single element or a range of elements
3. Do these operations many times efficiently

**Without Segment Trees:**

```
Array: [1, 3, 5, 7, 9, 11]
Query: Sum from index 1 to 4 = 3 + 5 + 7 + 9 = 24
Time: O(n) for each query
```

**With Segment Trees:**

```
Same query takes O(log n) time!
```

## The Fundamental Problem

> **Real-World Scenario** : Think of a bank system where you need to quickly calculate the total deposits in any branch range, or a gaming leaderboard where you need to find the maximum score in any rank range.

Consider this simple problem:

* Array: `[2, 1, 1, 4, 6, 3]`
* Query 1: What's the sum from index 1 to 3? (Answer: 6)
* Query 2: What's the sum from index 0 to 5? (Answer: 17)
* Update: Change index 2 from 1 to 5
* Query 3: What's the sum from index 1 to 3? (Answer: 10)

Doing this naively would take O(n) time per query and O(1) per update. With many queries, this becomes inefficient.

## How Segment Trees Work (Conceptual Understanding)

> **Key Insight** : We pre-compute and store partial results in a tree structure, where each node represents the result for a specific range of the array.

Think of it like a tournament bracket:

```
        [0,5]: 17
       /         \
   [0,2]: 4    [3,5]: 13
   /    \       /     \
[0,1]:3 [2]:1 [3,4]:10 [5]:3
/   \         /    \
[0]:2 [1]:1  [3]:4  [4]:6
```

Each node stores:

* The range it represents
* The computed value for that range (sum, min, max, etc.)

## Building a Segment Tree

Let's build this step by step with code:

```python
class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.arr = arr
        # Tree size is 4*n to be safe (mathematical proof exists)
        self.tree = [0] * (4 * self.n)
        self.build(0, 0, self.n - 1)
  
    def build(self, node, start, end):
        """
        node: current node index in tree array
        start, end: range this node represents in original array
        """
        if start == end:
            # Leaf node - stores single array element
            self.tree[node] = self.arr[start]
        else:
            # Internal node - combine children
            mid = (start + end) // 2
          
            # Build left and right subtrees
            left_child = 2 * node + 1
            right_child = 2 * node + 2
          
            self.build(left_child, start, mid)
            self.build(right_child, mid + 1, end)
          
            # Combine results from children
            self.tree[node] = self.tree[left_child] + self.tree[right_child]
```

**Detailed Explanation:**

1. **Tree Array** : We use an array to represent our tree. For node at index `i`:

* Left child: `2*i + 1`
* Right child: `2*i + 2`

1. **Build Process** : We recursively divide the array range and build from bottom up:

* Base case: Single element (leaf node)
* Recursive case: Combine left and right halves

1. **Node Representation** : Each node stores the sum of its range

Let's trace through building for array `[2, 1, 1, 4]`:

```
Step 1: build(0, 0, 3) - Root node
├── build(1, 0, 1) - Left subtree
│   ├── build(3, 0, 0) → tree[3] = 2
│   └── build(4, 1, 1) → tree[4] = 1
│   └── tree[1] = 2 + 1 = 3
└── build(2, 2, 3) - Right subtree
    ├── build(5, 2, 2) → tree[5] = 1
    └── build(6, 3, 3) → tree[6] = 4
    └── tree[2] = 1 + 4 = 5
└── tree[0] = 3 + 5 = 8
```

## Range Queries

> **The Magic** : To find sum of any range, we cleverly combine pre-computed partial sums without recalculating everything.

```python
def query(self, node, start, end, left, right):
    """
    Find sum in range [left, right]
    node: current node in tree
    start, end: range represented by current node
    left, right: query range
    """
    # No overlap - this range doesn't contribute
    if right < start or left > end:
        return 0
  
    # Complete overlap - use pre-computed value
    if left <= start and end <= right:
        return self.tree[node]
  
    # Partial overlap - check children
    mid = (start + end) // 2
    left_child = 2 * node + 1
    right_child = 2 * node + 2
  
    left_sum = self.query(left_child, start, mid, left, right)
    right_sum = self.query(right_child, mid + 1, end, left, right)
  
    return left_sum + right_sum
```

 **Query Example** : Find sum from index 1 to 2 in array `[2, 1, 1, 4]`

```
                Node 0 [0,3]
               /            \
        Node 1 [0,1]    Node 2 [2,3]
        /       \        /        \
   Node 3     Node 4  Node 5   Node 6
   [0,0]      [1,1]   [2,2]    [3,3]
     2          1       1        4
```

**Trace:**

1. `query(0, 0, 3, 1, 2)` - Partial overlap, check children
2. `query(1, 0, 1, 1, 2)` - Partial overlap, check children
   * `query(3, 0, 0, 1, 2)` - No overlap, return 0
   * `query(4, 1, 1, 1, 2)` - Complete overlap, return 1
3. `query(2, 2, 3, 1, 2)` - Partial overlap, check children
   * `query(5, 2, 2, 1, 2)` - Complete overlap, return 1
   * `query(6, 3, 3, 1, 2)` - No overlap, return 0

 **Result** : 0 + 1 + 1 + 0 = 2 ✓

## Single Point Updates

```python
def update(self, node, start, end, index, value):
    """
    Update array[index] = value
    """
    if start == end:
        # Found the leaf node to update
        self.arr[index] = value
        self.tree[node] = value
    else:
        mid = (start + end) // 2
        left_child = 2 * node + 1
        right_child = 2 * node + 2
      
        if index <= mid:
            # Update in left subtree
            self.update(left_child, start, mid, index, value)
        else:
            # Update in right subtree
            self.update(right_child, mid + 1, end, index, value)
      
        # Recalculate current node from updated children
        self.tree[node] = self.tree[left_child] + self.tree[right_child]
```

 **Update Process** : When we update a single element, we only need to update the nodes on the path from root to that leaf - that's O(log n) nodes!

## Range Updates with Lazy Propagation

> **Advanced Concept** : For range updates, we use "lazy propagation" - we delay updates until absolutely necessary to maintain efficiency.

```python
class LazySegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.lazy = [0] * (4 * self.n)  # Lazy propagation array
        self.build(arr, 0, 0, self.n - 1)
  
    def push(self, node, start, end):
        """Apply pending updates to current node"""
        if self.lazy[node] != 0:
            # Apply the lazy value
            self.tree[node] += self.lazy[node] * (end - start + 1)
          
            # If not leaf, propagate to children
            if start != end:
                left_child = 2 * node + 1
                right_child = 2 * node + 2
                self.lazy[left_child] += self.lazy[node]
                self.lazy[right_child] += self.lazy[node]
          
            # Clear current lazy value
            self.lazy[node] = 0
  
    def range_update(self, node, start, end, left, right, value):
        """Add 'value' to all elements in range [left, right]"""
        self.push(node, start, end)  # Apply pending updates
      
        if start > right or end < left:
            return  # No overlap
      
        if start >= left and end <= right:
            # Complete overlap - mark as lazy
            self.lazy[node] += value
            self.push(node, start, end)
            return
      
        # Partial overlap - recurse to children
        mid = (start + end) // 2
        left_child = 2 * node + 1
        right_child = 2 * node + 2
      
        self.range_update(left_child, start, mid, left, right, value)
        self.range_update(right_child, mid + 1, end, left, right, value)
      
        # Update current node
        self.push(left_child, start, mid)
        self.push(right_child, mid + 1, end)
        self.tree[node] = self.tree[left_child] + self.tree[right_child]
```

**Lazy Propagation Concept:**

* Instead of immediately updating all nodes in a range, we mark them as "lazy"
* We only apply updates when we actually need to visit those nodes
* This keeps range updates at O(log n) instead of O(n)

## FAANG Interview Perspective

> **What Interviewers Look For** : Understanding of when to use segment trees, ability to implement them cleanly, and knowledge of time/space complexities.

### Common Interview Questions:

**1. Range Sum Queries (Easy)**

```python
def solve_range_sum():
    # Given array and multiple queries for range sums
    arr = [1, 3, 5, 7, 9, 11]
    st = SegmentTree(arr)
  
    # Query: sum from index 1 to 4
    result = st.query(0, 0, len(arr)-1, 1, 4)
    return result  # Returns 24
```

**2. Range Minimum Query (Medium)**

```python
class MinSegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [float('inf')] * (4 * self.n)
        self.build(arr, 0, 0, self.n - 1)
  
    def build(self, arr, node, start, end):
        if start == end:
            self.tree[node] = arr[start]
        else:
            mid = (start + end) // 2
            left_child = 2 * node + 1
            right_child = 2 * node + 2
          
            self.build(arr, left_child, start, mid)
            self.build(arr, right_child, mid + 1, end)
          
            # For minimum, we take min of children
            self.tree[node] = min(self.tree[left_child], 
                                 self.tree[right_child])
```

**3. Count of Elements in Range (Hard)**

```python
# Using coordinate compression + segment tree
def count_in_range(arr, queries):
    """
    For each query [L, R, X, Y], count elements in arr[L:R+1] 
    that have values between X and Y
    """
    # This requires advanced techniques like 
    # persistent segment trees or coordinate compression
    pass
```

### Interview Tips:

> **Key Points to Remember** :
>
> * Always clarify if updates are single-point or range updates
> * Ask about the type of operation (sum, min, max, count)
> * Mention time complexities: Build O(n), Query O(log n), Update O(log n)
> * Space complexity: O(n)

**Common Mistakes to Avoid:**

1. **Off-by-one errors** in range calculations
2. **Forgetting to handle** base cases in recursion
3. **Not considering** edge cases like empty ranges
4. **Mixing up** node indices and array indices

## Time and Space Complexity Analysis

> **Complexity Summary** :
>
> * **Build** : O(n) - we visit each array element once
> * **Query** : O(log n) - we traverse at most one path from root to leaf
> * **Update** : O(log n) - same reasoning as query
> * **Space** : O(n) - tree has at most 4n nodes

**Why O(log n) for queries?**

* Tree height is log n
* In worst case, we visit one node per level
* Each level contributes to our answer

**Why 4n space?**

* For a complete binary tree with n leaves, we need at most 4n nodes
* This gives us a safe upper bound without complex calculations

## Variations and Advanced Concepts

### 1. Different Operations

```python
# Maximum segment tree
def combine_max(left, right):
    return max(left, right)

# GCD segment tree  
def combine_gcd(left, right):
    return math.gcd(left, right)

# XOR segment tree
def combine_xor(left, right):
    return left ^ right
```

### 2. 2D Segment Trees

```python
# For 2D range queries (advanced topic)
class SegmentTree2D:
    def __init__(self, matrix):
        # Implementation involves segment tree of segment trees
        pass
```

### 3. Persistent Segment Trees

> **Advanced Interview Topic** : Used when you need to query historical versions of the data structure.

## Practice Problems for FAANG Prep

**Beginner:**

1. Range Sum Query - Mutable (LeetCode 307)
2. Range Minimum Query

**Intermediate:**
3. Count of Range Sum (LeetCode 327)
4. Range Sum Query 2D - Mutable (LeetCode 308)

**Advanced:**
5. Falling Squares (LeetCode 699)
6. Number of Longest Increasing Subsequence (LeetCode 673)

## Complete Working Example

Here's a complete implementation you can use to practice:

```python
class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.build(arr, 0, 0, self.n - 1)
  
    def build(self, arr, node, start, end):
        if start == end:
            self.tree[node] = arr[start]
        else:
            mid = (start + end) // 2
            left_child = 2 * node + 1
            right_child = 2 * node + 2
          
            self.build(arr, left_child, start, mid)
            self.build(arr, right_child, mid + 1, end)
            self.tree[node] = self.tree[left_child] + self.tree[right_child]
  
    def query(self, node, start, end, left, right):
        if right < start or left > end:
            return 0
        if left <= start and end <= right:
            return self.tree[node]
      
        mid = (start + end) // 2
        left_child = 2 * node + 1
        right_child = 2 * node + 2
      
        return (self.query(left_child, start, mid, left, right) + 
                self.query(right_child, mid + 1, end, left, right))
  
    def update(self, node, start, end, index, value):
        if start == end:
            self.tree[node] = value
        else:
            mid = (start + end) // 2
            left_child = 2 * node + 1
            right_child = 2 * node + 2
          
            if index <= mid:
                self.update(left_child, start, mid, index, value)
            else:
                self.update(right_child, mid + 1, end, index, value)
          
            self.tree[node] = self.tree[left_child] + self.tree[right_child]

# Usage example
arr = [1, 3, 5, 7, 9, 11]
st = SegmentTree(arr)

print(st.query(0, 0, 5, 1, 3))  # Sum from index 1 to 3: 15
st.update(0, 0, 5, 1, 10)       # Update index 1 to value 10
print(st.query(0, 0, 5, 1, 3))  # New sum: 22
```

> **Final Thought** : Segment trees are powerful tools that turn O(n) range operations into O(log n). Master the basic implementation first, then tackle advanced variations like lazy propagation and 2D segment trees. In FAANG interviews, demonstrating clean code, proper complexity analysis, and handling edge cases will set you apart.

The key to mastering segment trees is understanding that they're all about **precomputing partial results** and **smartly combining them** to answer queries efficiently. Once this clicks, you'll see applications everywhere - from database indexing to graphics rendering!
