# Interval Dynamic Programming: From First Principles to FAANG Mastery

## What is Dynamic Programming?

Before diving into Interval DP, let's establish the foundation from first principles.

> **Dynamic Programming is a problem-solving technique that breaks down complex problems into simpler subproblems, solves each subproblem once, and stores the results to avoid redundant calculations.**

Think of it like this: instead of climbing a mountain by taking the same difficult path repeatedly, you build stepping stones (store solutions) that you can reuse.

## The Birth of Interval DP

**Interval DP** is a specialized form of dynamic programming where:

> **We solve problems by considering all possible intervals (subarrays/subsequences) of our input and finding optimal solutions for each interval.**

The key insight is: *many problems can be solved by finding the optimal way to "break" or "process" an interval into smaller intervals.*

## The Interval DP Pattern

Here's the fundamental structure that appears in virtually all Interval DP problems:

```
For each possible interval [i, j]:
    For each possible "split point" k between i and j:
        Combine solutions from [i, k] and [k+1, j]
        Keep track of the optimal solution
```

Let's visualize this pattern:

```
Original interval: [i -------- j]

Split at k:       [i -- k] [k+1 -- j]
                    ↓         ↓
                  solve    solve
                 smaller  smaller
                subprob  subprob
```

## Matrix Chain Multiplication: The Classic Example

### Understanding the Problem from First Principles

 **The Problem** : Given a sequence of matrices A₁, A₂, ..., Aₙ, find the optimal way to parenthesize the multiplication to minimize scalar multiplications.

> **Why does this matter?** Matrix multiplication is associative but not commutative. (AB)C ≠ A(BC) in terms of computational cost, even though they produce the same result.

Let's say we have matrices with dimensions:

* A₁: 40×20
* A₂: 20×30
* A₃: 30×10

**Two ways to multiply A₁×A₂×A₃:**

1. `(A₁×A₂)×A₃`:
   * A₁×A₂: 40×20×30 = 24,000 operations
   * Result×A₃: 40×30×10 = 12,000 operations
   * **Total: 36,000 operations**
2. `A₁×(A₂×A₃)`:
   * A₂×A₃: 20×30×10 = 6,000 operations
   * A₁×Result: 40×20×10 = 8,000 operations
   * **Total: 14,000 operations**

The difference is massive! This is why we need to find the optimal parenthesization.

### The Interval DP Solution

**Step 1: Define the DP State**

```python
# dp[i][j] = minimum cost to multiply matrices from i to j
dp = [[0 for _ in range(n)] for _ in range(n)]
```

**Step 2: The Recurrence Relation**

For any interval [i, j], we try all possible split points k:

```python
dp[i][j] = min(
    dp[i][k] + dp[k+1][j] + dimensions[i-1] * dimensions[k] * dimensions[j]
    for k in range(i, j)
)
```

> **Why this formula?**
>
> * `dp[i][k]`: cost to multiply matrices i to k
> * `dp[k+1][j]`: cost to multiply matrices k+1 to j
> * `dimensions[i-1] * dimensions[k] * dimensions[j]`: cost to multiply the two resulting matrices

**Step 3: Complete Implementation**

```python
def matrix_chain_multiplication(dimensions):
    """
    dimensions[i] gives the number of rows of matrix i and columns of matrix i-1
    For n matrices, we need n+1 dimensions
    """
    n = len(dimensions) - 1  # number of matrices
  
    # dp[i][j] represents minimum cost to multiply matrices from i to j
    dp = [[0 for _ in range(n + 1)] for _ in range(n + 1)]
  
    # length is the chain length (2 means 2 matrices, 3 means 3 matrices, etc.)
    for length in range(2, n + 1):  # Start from length 2
        for i in range(1, n - length + 2):  # Starting position
            j = i + length - 1  # Ending position
            dp[i][j] = float('inf')
          
            # Try all possible split points
            for k in range(i, j):
                # Cost of multiplying matrices i..k and k+1..j
                # plus cost of multiplying the resulting matrices
                cost = (dp[i][k] + 
                       dp[k + 1][j] + 
                       dimensions[i - 1] * dimensions[k] * dimensions[j])
              
                dp[i][j] = min(dp[i][j], cost)
  
    return dp[1][n]

# Example usage
dimensions = [40, 20, 30, 10]  # Three matrices: 40x20, 20x30, 30x10
result = matrix_chain_multiplication(dimensions)
print(f"Minimum cost: {result}")  # Output: 14000
```

**Let's trace through this step by step:**

1. **Base cases** : `dp[i][i] = 0` (single matrix costs nothing)
2. **Length 2** (2 matrices):
   * `dp[1][2]`: A₁×A₂ = 40×20×30 = 24,000
   * `dp[2][3]`: A₂×A₃ = 20×30×10 = 6,000
3. **Length 3** (3 matrices):
   * `dp[1][3]`: Try splitting at k=1 and k=2
   * k=1: `dp[1][1] + dp[2][3] + 40×20×10 = 0 + 6,000 + 8,000 = 14,000`
   * k=2: `dp[1][2] + dp[3][3] + 40×30×10 = 24,000 + 0 + 12,000 = 36,000`
   * Minimum: 14,000

## Burst Balloons: Advanced Interval DP

### Understanding the Problem

 **The Problem** : Given balloons with values, burst them to maximize points. When you burst balloon i, you get `nums[left] × nums[i] × nums[right]` points.

> **The Tricky Part** : When you burst a balloon, the adjacent balloons become neighbors! This creates dependencies that make greedy approaches fail.

### The Key Insight

Instead of thinking "which balloon to burst first," think "which balloon to burst **last** in each interval."

> **Why this works** : If balloon k is the last to be burst in interval [i, j], then when we burst it, balloons i-1 and j+1 are still there as boundaries.

### The Solution

```python
def max_coins(nums):
    """
    Add boundary balloons with value 1 to simplify calculations
    """
    # Add boundaries: [1] + nums + [1]
    balloons = [1] + nums + [1]
    n = len(balloons)
  
    # dp[i][j] = maximum coins from bursting balloons between i and j (exclusive)
    dp = [[0 for _ in range(n)] for _ in range(n)]
  
    # length represents the gap between boundaries
    for length in range(2, n):  # Start from gap of 2
        for i in range(n - length):
            j = i + length
          
            # Try each balloon k as the last one to burst in (i, j)
            for k in range(i + 1, j):
                # When k is burst last, boundaries are still i and j
                coins = balloons[i] * balloons[k] * balloons[j]
                total = dp[i][k] + dp[k][j] + coins
                dp[i][j] = max(dp[i][j], total)
  
    # Answer is maximum coins from interval (0, n-1)
    return dp[0][n - 1]

# Example
nums = [3, 1, 5, 8]
result = max_coins(nums)
print(f"Maximum coins: {result}")  # Output: 167
```

 **Let's trace through a smaller example** : `nums = [3, 1, 5]`

After adding boundaries: `[1, 3, 1, 5, 1]`

1. **Length 2** (adjacent boundaries):
   * `dp[0][2]`: burst balloon 1 (value 3) → 1×3×1 = 3
   * `dp[1][3]`: burst balloon 2 (value 1) → 3×1×5 = 15
   * `dp[2][4]`: burst balloon 3 (value 5) → 1×5×1 = 5
2. **Length 3** :

* `dp[0][3]`: burst balloons between 0 and 3
  * k=1: `dp[0][1] + dp[1][3] + 1×3×5 = 0 + 15 + 15 = 30`
  * k=2: `dp[0][2] + dp[2][3] + 1×1×5 = 3 + 0 + 5 = 8`
  * Maximum: 30

1. **Length 4** :

* `dp[0][4]`: Full problem
  * k=1: `dp[0][1] + dp[1][4] + 1×3×1 = 0 + 35 + 3 = 38`
  * k=2: `dp[0][2] + dp[2][4] + 1×1×1 = 3 + 5 + 1 = 9`
  * k=3: `dp[0][3] + dp[3][4] + 1×5×1 = 30 + 0 + 5 = 35`
  * Maximum: 38

## The Universal Interval DP Template

Here's the pattern that works for most Interval DP problems:

```python
def interval_dp_template(arr):
    n = len(arr)
    dp = [[initial_value for _ in range(n)] for _ in range(n)]
  
    # Fill base cases (length 1 intervals)
    for i in range(n):
        dp[i][i] = base_case_value(i)
  
    # Fill for increasing lengths
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
          
            # Try all possible split points
            for k in range(i, j):
                # Combine solutions and update dp[i][j]
                dp[i][j] = optimize(dp[i][j], 
                                  combine(dp[i][k], dp[k+1][j], extra_cost))
  
    return dp[0][n-1]
```

## FAANG Interview Strategy

### When to Recognize Interval DP

> **Look for these clues:**
>
> 1. Problem involves finding optimal way to "process" or "split" an array/string
> 2. Local decisions affect global optimization
> 3. Greedy approach fails due to dependencies
> 4. Problem asks for "minimum cost" or "maximum value" across all possible ways

### Common Variations

1. **Palindrome Partitioning** : Minimum cuts to make all palindromes
2. **Boolean Parenthesization** : Ways to parenthesize boolean expression
3. **Optimal BST** : Construct BST with minimum search cost
4. **Stone Merging** : Minimum cost to merge stones

### Time and Space Complexity

> **Time Complexity** : O(n³) - three nested loops
> **Space Complexity** : O(n²) - 2D DP table

### Interview Tips

1. **Start with small examples** - trace through manually
2. **Identify the "last operation"** - what happens at the end?
3. **Define DP state clearly** - what does dp[i][j] represent?
4. **Handle boundaries carefully** - off-by-one errors are common
5. **Optimize space if asked** - sometimes only previous states needed

> **Remember** : Interval DP problems test your ability to think recursively about optimization problems. The key is recognizing that optimal solutions for larger intervals depend on optimal solutions for smaller intervals, combined with a local decision about where to "split" the interval.

The beauty of Interval DP lies in its systematic approach to exploring all possibilities while avoiding redundant calculations - a perfect demonstration of the power of dynamic programming in competitive programming and technical interviews.
