# Optimal Binary Search Tree: From First Principles to FAANG Interview Mastery

Let me take you through one of the most elegant problems in computer science - building an Optimal Binary Search Tree using Dynamic Programming. We'll start from the very foundations and build up to interview-level mastery.

## Understanding the Foundation: What is a Binary Search Tree?

> **Core Principle** : A Binary Search Tree is a hierarchical data structure where each node has at most two children, and for every node, all values in the left subtree are smaller, and all values in the right subtree are larger.

Let's start with a simple example:

```
    8
   / \
  3   10
 / \    \
1   6    14
   / \   /
  4   7 13
```

In this BST, to find any value, we start at the root and make decisions: go left if the target is smaller, go right if larger.

## The Problem: What Makes a BST "Optimal"?

> **Key Insight** : Not all BSTs are created equal. The same set of keys can form different BSTs with vastly different search performance.

Consider keys `[1, 2, 3]`. We can build these BSTs:

**BST 1 (Balanced):**

```
  2
 / \
1   3
```

**BST 2 (Skewed):**

```
1
 \
  2
   \
    3
```

**BST 3 (Different balance):**

```
    3
   /
  2
 /
1
```

> **Critical Understanding** : If we search for key `1` frequently, BST 2 is actually better than BST 1, even though BST 1 looks more "balanced"!

This is where the **frequency** of searches becomes crucial.

## The Mathematical Foundation: Expected Search Cost

> **First Principle** : The cost of searching in a BST is the depth of the node plus 1 (counting from root as depth 0).

Let's say we have keys with their search frequencies:

* Key 1: frequency = 0.1 (searched 10% of the time)
* Key 2: frequency = 0.6 (searched 60% of the time)
* Key 3: frequency = 0.3 (searched 30% of the time)

For BST 1 above:

* Cost to find 1: 2 levels → cost = 2
* Cost to find 2: 1 level → cost = 1
* Cost to find 3: 2 levels → cost = 2

**Expected cost** = (0.1 × 2) + (0.6 × 1) + (0.3 × 2) = 0.2 + 0.6 + 0.6 = **1.4**

For BST 2:

* Cost to find 1: 1 level → cost = 1
* Cost to find 2: 2 levels → cost = 2
* Cost to find 3: 3 levels → cost = 3

**Expected cost** = (0.1 × 1) + (0.6 × 2) + (0.3 × 3) = 0.1 + 1.2 + 0.9 = **2.2**

BST 1 is optimal for this frequency distribution!

## The Dynamic Programming Insight

> **Core Realization** : To find the optimal BST, we need to try every possible root and recursively solve for left and right subtrees.

### The Subproblem Structure

Let's define our problem formally:

* We have keys `k₁, k₂, ..., kₙ` in sorted order
* Each key `kᵢ` has frequency `fᵢ`
* We want to minimize the expected search cost

 **Subproblem definition** : `dp[i][j]` = minimum expected search cost for keys from index `i` to `j`

### The Recurrence Relation

For keys from `i` to `j`, we can choose any key `k` (where `i ≤ k ≤ j`) as the root:

```
dp[i][j] = min(dp[i][k-1] + dp[k+1][j] + sum(frequencies from i to j))
           for all k where i ≤ k ≤ j
```

> **Why add the sum of frequencies?** When we make `k` the root, all nodes in the subtree go one level deeper, increasing their cost by 1.

## Step-by-Step Algorithm Development

Let me show you how to build this solution:

### Step 1: Basic Setup

```python
def optimal_bst(keys, frequencies):
    n = len(keys)
  
    # dp[i][j] represents minimum cost for keys from i to j
    dp = [[0 for _ in range(n)] for _ in range(n)]
  
    # sum[i][j] represents sum of frequencies from i to j
    freq_sum = [[0 for _ in range(n)] for _ in range(n)]
  
    return dp, freq_sum
```

 **Explanation** : We create two 2D arrays:

* `dp[i][j]`: stores the minimum cost for the subproblem
* `freq_sum[i][j]`: precomputed sum of frequencies (optimization)

### Step 2: Precompute Frequency Sums

```python
def precompute_sums(frequencies, freq_sum, n):
    # Single keys
    for i in range(n):
        freq_sum[i][i] = frequencies[i]
  
    # Multiple keys
    for length in range(2, n + 1):  # length of subarray
        for i in range(n - length + 1):
            j = i + length - 1
            freq_sum[i][j] = freq_sum[i][j-1] + frequencies[j]
```

 **Detailed explanation** :

* We fill the diagonal first (single keys)
* Then we build up larger subarrays using previously computed sums
* `freq_sum[i][j-1]` already contains sum from `i` to `j-1`, so we just add `frequencies[j]`

### Step 3: Fill the DP Table

```python
def fill_dp_table(dp, freq_sum, n):
    # Base case: single keys
    for i in range(n):
        dp[i][i] = frequencies[i]
  
    # Fill for chains of length 2 to n
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
          
            # Try each key as root
            for root in range(i, j + 1):
                # Cost calculation
                left_cost = dp[i][root-1] if root > i else 0
                right_cost = dp[root+1][j] if root < j else 0
              
                total_cost = left_cost + right_cost + freq_sum[i][j]
                dp[i][j] = min(dp[i][j], total_cost)
```

 **Key insights in this code** :

* We build solutions bottom-up: single keys → pairs → triplets → ... → all keys
* For each subproblem `[i,j]`, we try every possible root
* `left_cost` and `right_cost` handle boundary cases when subtrees don't exist

## Complete Implementation with Root Tracking

Here's the full solution that also tracks which key should be the root:

```python
def optimal_bst_complete(keys, frequencies):
    n = len(keys)
  
    # Initialize tables
    dp = [[0 for _ in range(n)] for _ in range(n)]
    root = [[0 for _ in range(n)] for _ in range(n)]
  
    # Precompute frequency sums
    freq_sum = [[0 for _ in range(n)] for _ in range(n)]
  
    # Fill frequency sums
    for i in range(n):
        freq_sum[i][i] = frequencies[i]
        dp[i][i] = frequencies[i]
        root[i][i] = i
  
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            freq_sum[i][j] = freq_sum[i][j-1] + frequencies[j]
            dp[i][j] = float('inf')
          
            # Try each possible root
            for k in range(i, j + 1):
                left_cost = dp[i][k-1] if k > i else 0
                right_cost = dp[k+1][j] if k < j else 0
              
                cost = left_cost + right_cost + freq_sum[i][j]
              
                if cost < dp[i][j]:
                    dp[i][j] = cost
                    root[i][j] = k
  
    return dp[0][n-1], root

# Example usage
keys = [1, 2, 3, 4]
frequencies = [0.1, 0.2, 0.4, 0.3]
min_cost, root_table = optimal_bst_complete(keys, frequencies)
print(f"Minimum expected cost: {min_cost}")
```

 **What each part does** :

* `dp[i][j]`: minimum cost for keys from index `i` to `j`
* `root[i][j]`: which key index should be root for optimal BST of keys `i` to `j`
* The nested loops ensure we solve smaller subproblems before larger ones

## Reconstructing the Optimal BST

```python
def construct_optimal_bst(keys, root_table, i, j):
    if i > j:
        return None
  
    root_idx = root_table[i][j]
    root_key = keys[root_idx]
  
    # Create node (in actual implementation, you'd create a TreeNode)
    node = {
        'key': root_key,
        'left': construct_optimal_bst(keys, root_table, i, root_idx - 1),
        'right': construct_optimal_bst(keys, root_table, root_idx + 1, j)
    }
  
    return node
```

 **How reconstruction works** :

* `root_table[i][j]` tells us which key should be the root
* We recursively build left subtree with keys `[i, root_idx-1]`
* We recursively build right subtree with keys `[root_idx+1, j]`

## Complexity Analysis

> **Time Complexity: O(n³)**
>
> * We have O(n²) subproblems (all pairs `[i,j]`)
> * For each subproblem, we try O(n) possible roots
> * Total: O(n²) × O(n) = O(n³)

> **Space Complexity: O(n²)**
>
> * We store two 2D tables: `dp` and `root`
> * Each table is of size n×n

## Interview Optimization: Knuth's Improvement

> **Advanced Insight** : We can optimize this to O(n²) using Knuth's observation that optimal roots have a monotonic property.

```python
def optimal_bst_knuth(keys, frequencies):
    n = len(keys)
    dp = [[0 for _ in range(n+1)] for _ in range(n+1)]
    root = [[0 for _ in range(n)] for _ in range(n)]
  
    # Knuth's optimization: root[i][j-1] <= root[i][j] <= root[i+1][j]
    for i in range(n):
        root[i][i] = i
  
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
          
            # Knuth's optimization: limit the search range
            start = root[i][j-1] if j > i else i
            end = root[i+1][j] if i < j else j
          
            for k in range(start, end + 1):
                cost = (dp[i][k-1] if k > i else 0) + \
                       (dp[k+1][j] if k < j else 0) + \
                       sum(frequencies[i:j+1])
              
                if cost < dp[i][j]:
                    dp[i][j] = cost
                    root[i][j] = k
  
    return dp[0][n-1]
```

## FAANG Interview Variations

### Variation 1: With Unsuccessful Search Costs

Sometimes interviews include "dummy keys" - searches for values not in the BST:

```python
def optimal_bst_with_dummy(keys, key_freq, dummy_freq):
    # dummy_freq[i] = frequency of searching between keys[i-1] and keys[i]
    n = len(keys)
    # Implementation similar but includes dummy frequencies in cost calculation
    pass
```

### Variation 2: Building the Actual Tree

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build_optimal_bst(keys, frequencies):
    min_cost, root_table = optimal_bst_complete(keys, frequencies)
  
    def build_tree(i, j):
        if i > j:
            return None
      
        root_idx = root_table[i][j]
        node = TreeNode(keys[root_idx])
        node.left = build_tree(i, root_idx - 1)
        node.right = build_tree(root_idx + 1, j)
        return node
  
    return build_tree(0, len(keys) - 1), min_cost
```

## Key Interview Talking Points

> **Why DP?** The problem has optimal substructure (optimal BST contains optimal sub-BSTs) and overlapping subproblems (same ranges `[i,j]` appear multiple times).

> **Why not Greedy?** Choosing the most frequent key as root doesn't always work because it might create unbalanced subtrees.

> **Real-world applications** : Database indexing, compiler symbol tables, autocomplete systems where search frequencies vary significantly.

## Practice Problem for Interviews

 **Given** : Keys `[10, 12, 20]` with frequencies `[34, 8, 50]`

 **Walk through** : Try calculating by hand first, then verify with code:

```python
keys = [10, 12, 20]
frequencies = [34, 8, 50]
min_cost, root_table = optimal_bst_complete(keys, frequencies)
print(f"Optimal cost: {min_cost}")
print(f"Root should be key at index: {root_table[0][2]}")
```

The optimal BST here should have key `20` as root (index 2) because it has the highest frequency, and the expected cost should be significantly lower than other arrangements.

> **Interview Success Tip** : Always start by explaining the problem clearly, give a small example, explain why brute force won't work, then derive the DP solution step by step. Show the recurrence relation before coding!

This problem beautifully demonstrates how Dynamic Programming can solve complex optimization problems by breaking them into manageable subproblems and building up optimal solutions systematically.
