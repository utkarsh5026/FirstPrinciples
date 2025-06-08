# The Knapsack Problem: A Complete Guide from First Principles

## What is the Knapsack Problem?

> **Core Concept** : The knapsack problem is fundamentally about  **optimization under constraints** . You have limited resources (capacity) and must choose items to maximize value while staying within those limits.

Imagine you're a treasure hunter with a backpack that can only carry a certain weight. You've discovered a cave filled with treasures, each with different weights and values. **How do you choose which treasures to take to maximize your total value without exceeding your bag's weight limit?**

This seemingly simple scenario represents one of the most important problem categories in computer science and appears frequently in FAANG interviews because it tests:

* Dynamic programming understanding
* Space and time complexity optimization
* Problem-solving approach and pattern recognition

Let's build our understanding from the ground up.

## The 0/1 Knapsack Problem

### Understanding from First Principles

> **Key Insight** : In 0/1 knapsack, each item can either be taken completely (1) or not taken at all (0). You cannot take partial items.

**Problem Definition:**

* You have `n` items, each with a weight `w[i]` and value `v[i]`
* You have a knapsack with maximum capacity `W`
* Goal: Select items to maximize total value without exceeding capacity
* Constraint: Each item can be selected at most once

### The Brute Force Approach

Let's start with the most intuitive approach to understand the problem structure:

```python
def knapsack_brute_force(weights, values, capacity, index=0):
    """
    Brute force approach: try all possible combinations
  
    For each item, we have 2 choices:
    1. Include it (if it fits)
    2. Exclude it
  
    Time: O(2^n), Space: O(n) for recursion stack
    """
    # Base case: no more items to consider
    if index == len(weights):
        return 0
  
    # Choice 1: Don't include current item
    exclude_value = knapsack_brute_force(weights, values, capacity, index + 1)
  
    # Choice 2: Include current item (if it fits)
    include_value = 0
    if weights[index] <= capacity:
        include_value = (values[index] + 
                        knapsack_brute_force(weights, values, 
                                           capacity - weights[index], 
                                           index + 1))
  
    # Return maximum of both choices
    return max(exclude_value, include_value)
```

**Why this works but is inefficient:**

* We explore every possible combination (2^n possibilities)
* We solve the same subproblems repeatedly
* For large inputs, this becomes computationally impossible

### The Dynamic Programming Approach

> **Fundamental DP Insight** : If we can break the problem into smaller subproblems and store their solutions, we can avoid redundant calculations.

**Subproblem Definition:**
`dp[i][w]` = maximum value achievable using first `i` items with capacity `w`

**Recurrence Relation:**

```
dp[i][w] = max(
    dp[i-1][w],                    // Don't take item i
    dp[i-1][w-weight[i]] + value[i] // Take item i (if it fits)
)
```

Let's visualize this with a concrete example:

**Example:**

* Items: [(weight=2, value=3), (weight=3, value=4), (weight=4, value=5)]
* Capacity: 5

```
DP Table Building Process:
     w=0  w=1  w=2  w=3  w=4  w=5
i=0   0    0    0    0    0    0
i=1   0    0    3    3    3    3
i=2   0    0    3    4    4    7
i=3   0    0    3    4    5    7
```

### Complete DP Implementation

```python
def knapsack_01_dp(weights, values, capacity):
    """
    0/1 Knapsack using Dynamic Programming
  
    Time: O(n * capacity)
    Space: O(n * capacity)
    """
    n = len(weights)
  
    # Create DP table: dp[i][w] represents max value 
    # using first i items with capacity w
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
  
    # Fill the DP table
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            # Current item index in original arrays
            current_item = i - 1
          
            # Option 1: Don't include current item
            dp[i][w] = dp[i-1][w]
          
            # Option 2: Include current item (if it fits)
            if weights[current_item] <= w:
                include_value = (values[current_item] + 
                               dp[i-1][w - weights[current_item]])
                dp[i][w] = max(dp[i][w], include_value)
  
    return dp[n][capacity]

# Example usage
weights = [2, 3, 4]
values = [3, 4, 5] 
capacity = 5
result = knapsack_01_dp(weights, values, capacity)
print(f"Maximum value: {result}")  # Output: 7
```

**Detailed Code Explanation:**

1. **Table Initialization** : We create a 2D table where `dp[i][w]` stores the maximum value achievable with the first `i` items and capacity `w`
2. **Base Case** : Row 0 and Column 0 are initialized to 0 (no items or no capacity means 0 value)
3. **State Transition** : For each cell, we consider two options:

* **Don't take** : Inherit value from `dp[i-1][w]`
* **Take** : Add current item's value to the best solution with remaining capacity

1. **Final Answer** : `dp[n][capacity]` contains our answer

### Space-Optimized Version

> **Space Optimization Insight** : Since we only need the previous row to compute the current row, we can reduce space complexity from O(n×capacity) to O(capacity).

```python
def knapsack_01_optimized(weights, values, capacity):
    """
    Space-optimized 0/1 Knapsack
  
    Time: O(n * capacity)
    Space: O(capacity)
    """
    n = len(weights)
  
    # Only need one row instead of full 2D table
    dp = [0] * (capacity + 1)
  
    for i in range(n):
        # Traverse backwards to avoid using updated values
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
  
    return dp[capacity]
```

**Why traverse backwards?**

* If we go forward, we might use updated values from the current iteration
* Backwards ensures we use values from the "previous row" (previous iteration)

## The Unbounded Knapsack Problem

### How It Differs from 0/1 Knapsack

> **Key Difference** : In unbounded knapsack, you have **unlimited quantity** of each item type. You can take the same item multiple times.

**Problem Definition:**

* Same setup as 0/1 knapsack
* **New constraint** : Each item can be selected multiple times
* Goal remains the same: maximize value within capacity

### The Approach

The recurrence relation changes slightly:

```
dp[w] = max(dp[w], dp[w - weight[i]] + value[i]) for all items i
```

 **Key insight** : After considering an item, we don't move to the next item index because we can use the same item again.

```python
def unbounded_knapsack(weights, values, capacity):
    """
    Unbounded Knapsack Problem
  
    Time: O(n * capacity)
    Space: O(capacity)
    """
    # dp[w] = maximum value achievable with capacity w
    dp = [0] * (capacity + 1)
  
    # For each capacity from 1 to total capacity
    for w in range(1, capacity + 1):
        # Try each item
        for i in range(len(weights)):
            # If current item fits
            if weights[i] <= w:
                dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
  
    return dp[capacity]

# Alternative implementation (item-first approach)
def unbounded_knapsack_v2(weights, values, capacity):
    """
    Alternative approach: for each item, update all possible capacities
    """
    dp = [0] * (capacity + 1)
  
    # For each item
    for i in range(len(weights)):
        # Update all capacities that can accommodate this item
        for w in range(weights[i], capacity + 1):
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])
  
    return dp[capacity]
```

**Detailed Explanation:**

1. **Outer Loop (Capacity)** : We build solutions for increasing capacities
2. **Inner Loop (Items)** : For each capacity, we try adding each item
3. **Multiple Usage** : Since we don't advance item index, the same item can be selected again in future iterations

**Example Trace:**

```
Items: [(weight=2, value=3), (weight=3, value=4)]
Capacity: 7

dp array evolution:
Initial: [0, 0, 0, 0, 0, 0, 0, 0]
After w=2: [0, 0, 3, 0, 0, 0, 0, 0]
After w=3: [0, 0, 3, 4, 0, 0, 0, 0]
After w=4: [0, 0, 3, 4, 6, 0, 0, 0] (item 1 twice)
...
Final: [0, 0, 3, 4, 6, 7, 9, 10]
```

## Common Knapsack Variants in FAANG Interviews

### 1. Subset Sum Problem

> **Special Case** : This is 0/1 knapsack where all values equal 1, and we want to check if a specific sum is achievable.

```python
def can_partition_subset_sum(nums, target):
    """
    Check if array can be partitioned into subset with given sum
  
    Example: [1, 5, 11, 5] -> Can we get sum=11? Yes: [1, 5, 5]
    """
    dp = [False] * (target + 1)
    dp[0] = True  # Empty subset has sum 0
  
    for num in nums:
        # Traverse backwards (0/1 knapsack pattern)
        for j in range(target, num - 1, -1):
            dp[j] = dp[j] or dp[j - num]
  
    return dp[target]
```

### 2. Coin Change Problem

> **Unbounded Knapsack Application** : Find minimum coins needed to make a target amount.

```python
def coin_change_min_coins(coins, amount):
    """
    Minimum number of coins to make target amount
  
    This is unbounded knapsack where we minimize count instead of maximize value
    """
    # dp[i] = minimum coins needed for amount i
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0  # 0 coins needed for amount 0
  
    for coin in coins:
        for j in range(coin, amount + 1):
            if dp[j - coin] != float('inf'):
                dp[j] = min(dp[j], dp[j - coin] + 1)
  
    return dp[amount] if dp[amount] != float('inf') else -1
```

### 3. Target Sum Problem

> **Transform to Subset Sum** : Given array and target, assign +/- to each element to reach target.

```python
def find_target_sum_ways(nums, target):
    """
    Number of ways to assign +/- to reach target
  
    Key insight: If P = positive subset, N = negative subset
    P - N = target and P + N = sum(nums)
    Therefore: P = (target + sum(nums)) / 2
  
    Problem reduces to: count subsets with sum P
    """
    total = sum(nums)
    if target > total or target < -total or (target + total) % 2 == 1:
        return 0
  
    target_sum = (target + total) // 2
  
    # Count ways to achieve target_sum
    dp = [0] * (target_sum + 1)
    dp[0] = 1  # One way to get sum 0: select nothing
  
    for num in nums:
        for j in range(target_sum, num - 1, -1):
            dp[j] += dp[j - num]
  
    return dp[target_sum]
```

## Interview Strategy and Pattern Recognition

### Common Question Patterns

> **Pattern Recognition** : Learn to identify knapsack problems in disguise.

```
Decision Tree for Knapsack Problems:

Is it optimization? (max/min value/count)
├── Yes: Likely DP problem
    ├── Limited items? 
    │   ├── Each item once? → 0/1 Knapsack
    │   └── Items multiple times? → Unbounded Knapsack
    └── Constraint on capacity/sum? → Knapsack variant
```

### FAANG Interview Template

```python
def knapsack_template(items, capacity, problem_type):
    """
    Universal template for knapsack problems
  
    Steps:
    1. Identify the state space
    2. Define the recurrence relation  
    3. Implement with appropriate space optimization
    4. Handle edge cases
    """
  
    # Step 1: State definition
    # dp[i] usually represents optimal solution for capacity/sum i
  
    # Step 2: Base case initialization
  
    # Step 3: State transition based on problem type
    if problem_type == "0/1":
        # Process backwards to avoid reusing items
        pass
    elif problem_type == "unbounded":
        # Process forwards to allow reuse
        pass
  
    # Step 4: Return final answer
```

### Time and Space Complexity Summary

```
Problem Type          | Time Complexity    | Space Complexity
---------------------|-------------------|------------------
0/1 Knapsack         | O(n × capacity)   | O(capacity)*
Unbounded Knapsack   | O(n × capacity)   | O(capacity)
Subset Sum           | O(n × target)     | O(target)
Coin Change          | O(n × amount)     | O(amount)

*Can be optimized from O(n × capacity) to O(capacity)
```

> **Interview Tip** : Always discuss both the 2D approach (easier to understand) and the space-optimized 1D approach (shows optimization skills).

### Key Takeaways for Interviews

1. **Start Simple** : Begin with brute force to show understanding
2. **Identify Patterns** : Recognize the optimization structure
3. **Build Gradually** : Move from recursive to memoized to bottom-up DP
4. **Optimize Space** : Show you can reduce space complexity
5. **Test Edge Cases** : Empty input, zero capacity, impossible targets

The knapsack problem family represents a fundamental pattern in dynamic programming that, once mastered, provides a powerful framework for solving a wide range of optimization problems commonly encountered in technical interviews.
