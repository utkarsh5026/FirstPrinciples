# Dynamic Programming Space Optimization: From First Principles to FAANG Mastery

## Understanding the Foundation: What is Dynamic Programming?

Before diving into optimization techniques, let's establish the fundamental principles that make Dynamic Programming work.

> **Core Principle** : Dynamic Programming is a problem-solving paradigm that breaks down complex problems into simpler subproblems, solves each subproblem once, and stores the results to avoid redundant calculations.

Think of it like this: imagine you're climbing a staircase and someone asks you "How many ways can you reach step 10?" Instead of recalculating from scratch every time, you build up your answer step by step, remembering what you learned at each level.

### The Memory-Time Trade-off

Every DP solution faces a fundamental trade-off:

* **Time Complexity** : How fast can we solve the problem?
* **Space Complexity** : How much memory do we need to store intermediate results?

> **The Optimization Challenge** : In FAANG interviews, showing that you can optimize space while maintaining correctness demonstrates advanced problem-solving skills and deep algorithmic understanding.

## First Principles of Space Optimization

### Principle 1: Dependency Analysis

The foundation of space optimization lies in understanding **which previous states we actually need** to compute the current state.

Let's examine this with the classic Fibonacci sequence:

```python
# Naive recursive approach - exponential time
def fibonacci_naive(n):
    if n <= 1:
        return n
    return fibonacci_naive(n-1) + fibonacci_naive(n-2)
```

**What's happening here?**

* We're recalculating the same values multiple times
* `fibonacci_naive(5)` calculates `fibonacci_naive(3)` multiple times
* This leads to exponential time complexity

### Principle 2: Memoization - The First Step

```python
# Memoized version - O(n) time, O(n) space
def fibonacci_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
  
    memo[n] = fibonacci_memo(n-1, memo) + fibonacci_memo(n-2, memo)
    return memo[n]
```

**Detailed Analysis:**

* `memo={}` creates a dictionary to store computed results
* `if n in memo:` checks if we've already solved this subproblem
* `memo[n] = ...` stores the result for future use
* Time: O(n) - each number calculated once
* Space: O(n) - storing all previous results

### Principle 3: Bottom-Up Tabulation

```python
# Tabulation approach - O(n) time, O(n) space
def fibonacci_tabulation(n):
    if n <= 1:
        return n
  
    dp = [0] * (n + 1)  # Create array to store results
    dp[0] = 0           # Base case 1
    dp[1] = 1           # Base case 2
  
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]  # Build solution bottom-up
  
    return dp[n]
```

**Step-by-step breakdown:**

* `dp = [0] * (n + 1)` creates an array of size n+1 initialized with zeros
* `dp[0] = 0` and `dp[1] = 1` set our base cases
* The loop `for i in range(2, n + 1)` builds the solution from bottom to top
* `dp[i] = dp[i-1] + dp[i-2]` uses the recurrence relation

> **Key Insight** : Notice that to compute `dp[i]`, we only need `dp[i-1]` and `dp[i-2]`. We don't need `dp[0]`, `dp[1]`, ..., `dp[i-3]`. This observation is the foundation of space optimization!

## The Rolling Array Technique: First Principles

### Understanding the Pattern

Let's analyze what values we actually need at each step:

```
To compute dp[5]: need dp[4] and dp[3]
To compute dp[4]: need dp[3] and dp[2]  
To compute dp[3]: need dp[2] and dp[1]
To compute dp[2]: need dp[1] and dp[0]
```

> **Critical Observation** : At any point, we only need the **last two values** to compute the next value. This means we can reduce our space from O(n) to O(1)!

### Implementation of Space-Optimized Fibonacci

```python
# Space-optimized version - O(n) time, O(1) space
def fibonacci_optimized(n):
    if n <= 1:
        return n
  
    # Only keep track of the last two values
    prev2 = 0  # This represents dp[i-2]
    prev1 = 1  # This represents dp[i-1]
  
    for i in range(2, n + 1):
        current = prev1 + prev2  # Calculate dp[i]
      
        # "Roll" the array: shift values for next iteration
        prev2 = prev1  # What was dp[i-1] becomes dp[i-2]
        prev1 = current  # What was dp[i] becomes dp[i-1]
  
    return prev1
```

**Detailed execution trace for n=5:**

```
Initial: prev2=0, prev1=1

i=2: current = 1+0 = 1
     Roll: prev2=1, prev1=1

i=3: current = 1+1 = 2  
     Roll: prev2=1, prev1=2

i=4: current = 2+1 = 3
     Roll: prev2=2, prev1=3

i=5: current = 3+2 = 5
     Roll: prev2=3, prev1=5

Return: 5
```

## Advanced Example: House Robber Problem

Let's apply these principles to a classic FAANG interview question:

> **Problem** : You are a robber planning to rob houses along a street. Each house has a certain amount of money. You cannot rob two adjacent houses. What is the maximum amount you can rob?

### First Principles Analysis

**Step 1: Define the subproblem**

* `dp[i]` = maximum money we can rob from houses 0 to i

**Step 2: Find the recurrence relation**

* For house i, we have two choices:
  * Rob house i: `money[i] + dp[i-2]` (skip adjacent house)
  * Don't rob house i: `dp[i-1]` (take previous maximum)
* `dp[i] = max(money[i] + dp[i-2], dp[i-1])`

**Step 3: Identify base cases**

* `dp[0] = money[0]` (only one house)
* `dp[1] = max(money[0], money[1])` (take the better of first two)

### Standard DP Solution

```python
def rob_standard(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
  
    n = len(nums)
    dp = [0] * n
  
    # Base cases
    dp[0] = nums[0]
    dp[1] = max(nums[0], nums[1])
  
    # Fill the DP table
    for i in range(2, n):
        dp[i] = max(nums[i] + dp[i-2], dp[i-1])
        # Either rob current house + best from i-2,
        # or don't rob current house (take best from i-1)
  
    return dp[n-1]
```

**Space Complexity Analysis:**

* We're using an array of size n to store all intermediate results
* Space: O(n)

### Space-Optimized Solution

> **Key Insight** : Notice that `dp[i]` only depends on `dp[i-1]` and `dp[i-2]`. We can use rolling variables!

```python
def rob_optimized(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
  
    # Rolling variables - only keep track of last two states
    rob_prev2 = nums[0]                    # dp[i-2]: max money up to house i-2
    rob_prev1 = max(nums[0], nums[1])      # dp[i-1]: max money up to house i-1
  
    for i in range(2, len(nums)):
        # Calculate current maximum
        current_max = max(
            nums[i] + rob_prev2,  # Rob current house + best from i-2
            rob_prev1              # Don't rob current house
        )
      
        # Roll the variables for next iteration
        rob_prev2 = rob_prev1    # Previous i-1 becomes new i-2
        rob_prev1 = current_max  # Current becomes new i-1
  
    return rob_prev1
```

**Step-by-step execution for nums = [2, 7, 9, 3, 1]:**

```
Initial: rob_prev2 = 2, rob_prev1 = max(2,7) = 7

i=2 (house value 9):
  current_max = max(9+2, 7) = max(11, 7) = 11
  Roll: rob_prev2 = 7, rob_prev1 = 11

i=3 (house value 3):  
  current_max = max(3+7, 11) = max(10, 11) = 11
  Roll: rob_prev2 = 11, rob_prev1 = 11

i=4 (house value 1):
  current_max = max(1+11, 11) = max(12, 11) = 12
  Roll: rob_prev2 = 11, rob_prev1 = 12

Return: 12
```

## 2D DP Space Optimization: Minimum Path Sum

Let's explore space optimization in 2D problems, which frequently appear in FAANG interviews.

> **Problem** : Given a grid filled with non-negative numbers, find a path from top-left to bottom-right that minimizes the sum of all numbers along the path. You can only move right or down.

### Understanding 2D Dependencies

**Recurrence relation:**

* `dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])`

**Dependency pattern:**

```
Current cell depends on:
- Cell above: dp[i-1][j]  
- Cell to the left: dp[i][j-1]
```

### Standard 2D DP Solution

```python
def min_path_sum_2d(grid):
    if not grid or not grid[0]:
        return 0
  
    rows, cols = len(grid), len(grid[0])
  
    # Create 2D DP table
    dp = [[0] * cols for _ in range(rows)]
  
    # Base case: starting cell
    dp[0][0] = grid[0][0]
  
    # Fill first row (can only come from left)
    for j in range(1, cols):
        dp[0][j] = dp[0][j-1] + grid[0][j]
  
    # Fill first column (can only come from above)  
    for i in range(1, rows):
        dp[i][0] = dp[i-1][0] + grid[i][0]
  
    # Fill the rest of the table
    for i in range(1, rows):
        for j in range(1, cols):
            dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
  
    return dp[rows-1][cols-1]
```

**Space Complexity: O(rows × cols)**

### Space Optimization: Rolling Array Technique

> **Key Insight** : To compute row i, we only need the values from row i-1. We can use a 1D array that represents the "current row" and update it in-place.

```python
def min_path_sum_optimized(grid):
    if not grid or not grid[0]:
        return 0
  
    rows, cols = len(grid), len(grid[0])
  
    # Use 1D array to represent current row
    dp = [0] * cols
  
    # Initialize first row
    dp[0] = grid[0][0]
    for j in range(1, cols):
        dp[j] = dp[j-1] + grid[0][j]
  
    # Process each subsequent row
    for i in range(1, rows):
        # Update first column (can only come from above)
        dp[0] += grid[i][0]
      
        # Update rest of the row
        for j in range(1, cols):
            # dp[j] currently holds value from previous row (above)
            # dp[j-1] holds value from current row (left)
            dp[j] = grid[i][j] + min(dp[j], dp[j-1])
  
    return dp[cols-1]
```

**Detailed explanation of the update process:**

```
Initial grid:    dp array after row 0:
[1, 3, 1]       [1, 4, 5]
[1, 5, 1]     
[4, 2, 1]     

Processing row 1:
- dp[0] = dp[0] + grid[1][0] = 1 + 1 = 2
- dp[1] = grid[1][1] + min(dp[1], dp[0]) = 5 + min(4, 2) = 7  
- dp[2] = grid[1][2] + min(dp[2], dp[1]) = 1 + min(5, 7) = 6

dp after row 1: [2, 7, 6]
```

**Space Complexity: O(cols) instead of O(rows × cols)**

## FAANG Interview Optimization Patterns

### Pattern 1: Identify Minimal Dependencies

> **Interview Tip** : Always ask yourself: "What is the minimum amount of previous information I need to compute the current state?"

Common dependency patterns:

* **1D DP** : Usually need 1-2 previous values → O(1) space
* **2D DP** : Usually need previous row → O(cols) space
* **String matching** : Need previous row and sometimes diagonal → O(min(m,n)) space

### Pattern 2: In-Place Optimization

Sometimes you can modify the input array itself:

```python
def min_path_sum_inplace(grid):
    if not grid or not grid[0]:
        return 0
  
    rows, cols = len(grid), len(grid[0])
  
    # Use the grid itself as DP table
    # Fill first row
    for j in range(1, cols):
        grid[0][j] += grid[0][j-1]
  
    # Fill first column
    for i in range(1, rows):
        grid[i][0] += grid[i-1][0]
  
    # Fill the rest
    for i in range(1, rows):
        for j in range(1, cols):
            grid[i][j] += min(grid[i-1][j], grid[i][j-1])
  
    return grid[rows-1][cols-1]
```

> **Caution** : Only use in-place optimization when the problem allows modifying the input. Always clarify with the interviewer!

### Pattern 3: Two-Pass Optimization

For some problems, you can achieve better space complexity with multiple passes:

```python
# Example: Paint House problem with k colors
def min_cost_paint_houses(costs):
    if not costs:
        return 0
  
    n, k = len(costs), len(costs[0])
  
    # Instead of n×k DP table, use two 1D arrays
    prev_row = costs[0][:]  # Copy first row
  
    for i in range(1, n):
        curr_row = [0] * k
      
        for j in range(k):
            # Find minimum from previous row excluding same color
            min_prev = float('inf')
            for prev_j in range(k):
                if prev_j != j:
                    min_prev = min(min_prev, prev_row[prev_j])
          
            curr_row[j] = costs[i][j] + min_prev
      
        prev_row = curr_row  # Roll the array
  
    return min(prev_row)
```

## Advanced Techniques for Complex Problems

### Technique 1: State Compression

When dealing with bitmask DP or states that can be represented compactly:

```python
# Example: Traveling Salesman Problem space optimization
def tsp_optimized(dist):
    n = len(dist)
  
    # Instead of storing all intermediate states,
    # use current and next level sets
    current_level = {(1 << 0, 0): 0}  # (mask, last_city): min_cost
  
    for level in range(1, n):
        next_level = {}
      
        for (mask, last), cost in current_level.items():
            for next_city in range(n):
                if mask & (1 << next_city):
                    continue
              
                new_mask = mask | (1 << next_city)
                new_cost = cost + dist[last][next_city]
              
                key = (new_mask, next_city)
                if key not in next_level or next_level[key] > new_cost:
                    next_level[key] = new_cost
      
        current_level = next_level
  
    # Find minimum cost to return to start
    full_mask = (1 << n) - 1
    min_cost = float('inf')
  
    for last_city in range(1, n):
        if (full_mask, last_city) in current_level:
            total_cost = current_level[(full_mask, last_city)] + dist[last_city][0]
            min_cost = min(min_cost, total_cost)
  
    return min_cost
```

### Technique 2: Sliding Window DP

For problems with range dependencies:

```python
# Example: Maximum sum of k non-adjacent elements
def max_sum_k_non_adjacent(nums, k):
    if k == 0:
        return 0
  
    n = len(nums)
  
    # Use deque to maintain sliding window of possibilities
    from collections import deque
  
    # dp[i] represents max sum using exactly i elements
    prev_dp = [0] * (k + 1)
  
    for num in nums:
        curr_dp = prev_dp[:]
      
        # Try adding current number to each possible state
        for used in range(min(k, len(prev_dp) - 1), 0, -1):
            curr_dp[used] = max(curr_dp[used], prev_dp[used-1] + num)
      
        prev_dp = curr_dp
  
    return prev_dp[k]
```

## Complete FAANG Interview Example: Edit Distance

Let's solve a comprehensive example that showcases multiple optimization techniques:

> **Problem** : Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You can insert, delete, or replace any character.

### Standard 2D DP Solution

```python
def edit_distance_2d(word1, word2):
    m, n = len(word1), len(word2)
  
    # dp[i][j] = min operations to convert word1[0:i] to word2[0:j]
    dp = [[0] * (n + 1) for _ in range(m + 1)]
  
    # Base cases
    for i in range(m + 1):
        dp[i][0] = i  # Delete all characters from word1
  
    for j in range(n + 1):
        dp[0][j] = j  # Insert all characters of word2
  
    # Fill the DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]  # No operation needed
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],     # Delete from word1
                    dp[i][j-1],     # Insert into word1  
                    dp[i-1][j-1]    # Replace in word1
                )
  
    return dp[m][n]
```

### Space-Optimized Solution

```python
def edit_distance_optimized(word1, word2):
    m, n = len(word1), len(word2)
  
    # Optimize for smaller second dimension
    if m < n:
        word1, word2 = word2, word1
        m, n = n, m
  
    # Use 1D array for current row
    prev_row = list(range(n + 1))  # Base case for first row
  
    for i in range(1, m + 1):
        curr_row = [i]  # Base case: delete all chars from word1[0:i]
      
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                curr_row.append(prev_row[j-1])  # No operation
            else:
                curr_row.append(1 + min(
                    prev_row[j],        # Delete
                    curr_row[j-1],      # Insert
                    prev_row[j-1]       # Replace
                ))
      
        prev_row = curr_row  # Roll the array
  
    return prev_row[n]
```

 **Space Complexity** : Reduced from O(m×n) to O(min(m,n))

### Ultra-Optimized: O(min(m,n)) with Two Variables

For the ultimate optimization, we can reduce space even further:

```python
def edit_distance_ultra_optimized(word1, word2):
    m, n = len(word1), len(word2)
  
    # Always iterate over the longer string
    if m < n:
        word1, word2 = word2, word1
        m, n = n, m
  
    prev_row = list(range(n + 1))
  
    for i in range(1, m + 1):
        prev_diag = prev_row[0]  # Store diagonal value
        prev_row[0] = i
      
        for j in range(1, n + 1):
            temp = prev_row[j]  # Store current value before overwriting
          
            if word1[i-1] == word2[j-1]:
                prev_row[j] = prev_diag
            else:
                prev_row[j] = 1 + min(
                    prev_row[j],    # From above (delete)
                    prev_row[j-1],  # From left (insert)  
                    prev_diag       # From diagonal (replace)
                )
          
            prev_diag = temp  # Update diagonal for next iteration
  
    return prev_row[n]
```

## Summary: FAANG Interview Strategy

> **Key Takeaway** : Space optimization in DP is not just about reducing memory usage—it demonstrates your ability to analyze algorithms deeply and find elegant solutions to complex problems.

### The Optimization Framework

1. **Analyze Dependencies** : What previous states do you actually need?
2. **Identify Patterns** : Look for rolling array opportunities
3. **Consider Trade-offs** : Sometimes slight complexity increase is worth major space savings
4. **Verify Correctness** : Always trace through examples after optimization

### Common Interview Questions to Practice

**1D Problems (O(n) → O(1)):**

* Fibonacci sequence
* House Robber
* Climbing Stairs
* Maximum subarray sum

**2D Problems (O(m×n) → O(min(m,n))):**

* Edit Distance
* Longest Common Subsequence
* Unique Paths
* Minimum Path Sum

### Final Interview Tips

> **Pro Tip** : Always start with the standard DP solution, then ask the interviewer: "Would you like me to optimize this for space?" This shows you understand both approaches and can adapt based on requirements.

**The Three-Step Approach:**

1. **Solve correctly first** - Get the logic right
2. **Identify optimization opportunities** - Analyze dependencies
3. **Implement optimized version** - Reduce space complexity

Remember: In FAANG interviews, showing the thought process is often more important than just arriving at the optimal solution. Explain your reasoning, discuss trade-offs, and demonstrate your deep understanding of algorithmic principles.
