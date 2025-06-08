# Mastering 2D Dynamic Programming: From First Principles to FAANG Interview Success

Let me take you on a comprehensive journey through 2D Dynamic Programming, starting from the absolute fundamentals and building up to solving complex interview problems that frequently appear at top tech companies.

## Understanding Dynamic Programming from First Principles

> **Core Principle** : Dynamic Programming is a problem-solving technique that breaks down complex problems into simpler subproblems, stores their solutions to avoid redundant calculations, and builds up to the final answer.

Before diving into 2D DP, let's establish what makes a problem suitable for dynamic programming:

### The Three Pillars of DP Problems

**1. Optimal Substructure**
The optimal solution to the problem contains optimal solutions to subproblems. Think of it like building a house - the best house is built using the best foundation, best walls, and best roof.

**2. Overlapping Subproblems**
The same subproblems appear multiple times when solving the main problem. Instead of solving them repeatedly, we store their results.

**3. State Transition**
We can define how to move from one state to another using a recurrence relation.

### From 1D to 2D: The Natural Evolution

In 1D DP, we typically have one parameter that changes (like position in an array). In 2D DP, we have two parameters that vary simultaneously:

```python
# 1D DP: dp[i] represents solution at position i
dp[i] = some_function(dp[i-1], dp[i-2], ...)

# 2D DP: dp[i][j] represents solution at position (i,j)
dp[i][j] = some_function(dp[i-1][j], dp[i][j-1], dp[i-1][j-1], ...)
```

## The 2D DP Framework

> **Mental Model** : Think of 2D DP as filling a table where each cell depends on previously computed cells. We're essentially building our solution row by row, column by column.

### General Problem-Solving Approach

1. **Identify the State** : What does `dp[i][j]` represent?
2. **Define the Base Cases** : What are the simplest scenarios?
3. **Establish the Recurrence Relation** : How do we transition between states?
4. **Determine the Order** : In what sequence should we fill the table?
5. **Extract the Answer** : Where in our table is the final result?

---

## Problem 1: Unique Paths - The Foundation

Let's start with the most fundamental 2D DP problem that introduces core concepts.

### Problem Statement

> Given a robot on an `m x n` grid, starting at top-left corner, find the number of unique paths to reach the bottom-right corner. The robot can only move right or down.

### Thinking from First Principles

**Step 1: Understanding the Problem**

```
Grid visualization (3x3):
S . .
. . .
. . E

S = Start (0,0)
E = End (2,2)
```

**Step 2: State Definition**

> **Key Insight** : `dp[i][j]` = number of unique paths to reach cell (i,j) from (0,0)

**Step 3: Base Cases Analysis**

```
First row: dp[0][j] = 1 (only one way - keep going right)
First column: dp[i][0] = 1 (only one way - keep going down)
```

**Step 4: Recurrence Relation**

```
dp[i][j] = dp[i-1][j] + dp[i][j-1]
```

> **Why this works** : To reach cell (i,j), the robot must come from either the cell above (i-1,j) or the cell to the left (i,j-1). The total paths is the sum of paths to both these cells.

### Implementation with Detailed Explanation

```python
def uniquePaths(m, n):
    # Step 1: Create and initialize the DP table
    # dp[i][j] represents unique paths to reach position (i,j)
    dp = [[0] * n for _ in range(m)]
  
    # Step 2: Initialize base cases
    # First row: only one way to reach any cell (keep moving right)
    for j in range(n):
        dp[0][j] = 1
  
    # First column: only one way to reach any cell (keep moving down)  
    for i in range(m):
        dp[i][0] = 1
  
    # Step 3: Fill the table using our recurrence relation
    for i in range(1, m):
        for j in range(1, n):
            # Current cell paths = paths from above + paths from left
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
  
    # Step 4: Return the answer (paths to bottom-right corner)
    return dp[m-1][n-1]
```

### Visualizing the Solution Process

For a 3x3 grid, here's how our DP table gets filled:

```
Initial state (base cases):
1 1 1
1 0 0  
1 0 0

After filling row 1:
1 1 1
1 2 3
1 0 0

Final state:
1 1 1
1 2 3
1 3 6
```

> **Pattern Recognition** : Notice how each cell is the sum of the cell above and to the left. This creates a Pascal's triangle-like pattern!

---

## Problem 2: Minimum Path Sum - Adding Optimization

Now let's increase complexity by introducing the concept of optimization.

### Problem Statement

> Given an `m x n` grid filled with non-negative numbers, find a path from top-left to bottom-right that minimizes the sum of numbers along the path. You can only move right or down.

### Building on Previous Knowledge

This problem extends our unique paths concept but instead of counting paths, we're finding the optimal path.

**State Definition Evolution**

> **Enhanced Insight** : `dp[i][j]` = minimum sum to reach cell (i,j) from (0,0)

### Step-by-Step Analysis

```python
def minPathSum(grid):
    m, n = len(grid), len(grid[0])
  
    # Step 1: Create DP table
    # We can actually reuse the input grid to save space
    # but let's use separate table for clarity
    dp = [[0] * n for _ in range(m)]
  
    # Step 2: Initialize the starting point
    dp[0][0] = grid[0][0]
  
    # Step 3: Fill the first row
    # Can only come from the left, so accumulate costs
    for j in range(1, n):
        dp[0][j] = dp[0][j-1] + grid[0][j]
  
    # Step 4: Fill the first column  
    # Can only come from above, so accumulate costs
    for i in range(1, m):
        dp[i][0] = dp[i-1][0] + grid[i][0]
  
    # Step 5: Fill the rest using optimal substructure
    for i in range(1, m):
        for j in range(1, n):
            # Choose the minimum cost path: from above or from left
            dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]
  
    return dp[m-1][n-1]
```

### Understanding the Recurrence Relation

```
dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j]
```

> **Critical Insight** : We take the minimum of the two possible previous states because we want the optimal (minimum) path. The `+ grid[i][j]` adds the current cell's cost to our running total.

### Example Walkthrough

Given grid:

```
1 3 1
1 5 1  
4 2 1
```

DP table evolution:

```
Step 1 (base cases):
1 4 5
2 0 0
6 0 0

Step 2 (fill remaining):
1 4 5
2 7 6
6 8 7
```

The minimum path sum is 7, following path: 1→1→5→1→1

---

## Problem 3: Edit Distance - The Ultimate 2D DP Challenge

This is where 2D DP truly shines, handling complex string manipulation problems that frequently appear in FAANG interviews.

### Problem Statement

> Given two strings `word1` and `word2`, return the minimum number of operations to convert `word1` to `word2`. You can insert, delete, or replace any character.

### Deep Dive into State Design

**State Definition - The Key Breakthrough**

> **Profound Insight** : `dp[i][j]` = minimum operations to convert the first `i` characters of `word1` to the first `j` characters of `word2`

### Analyzing All Possible Scenarios

When comparing `word1[i-1]` with `word2[j-1]`, we have two main cases:

**Case 1: Characters Match**

```python
if word1[i-1] == word2[j-1]:
    dp[i][j] = dp[i-1][j-1]  # No operation needed
```

**Case 2: Characters Don't Match**
We have three operations to consider:

```python
# Option 1: Replace word1[i-1] with word2[j-1]
replace_cost = dp[i-1][j-1] + 1

# Option 2: Delete word1[i-1] 
delete_cost = dp[i-1][j] + 1

# Option 3: Insert word2[j-1] into word1
insert_cost = dp[i][j-1] + 1

dp[i][j] = min(replace_cost, delete_cost, insert_cost)
```

### Complete Implementation with Explanations

```python
def minDistance(word1, word2):
    m, n = len(word1), len(word2)
  
    # Step 1: Create DP table with extra row/column for empty string cases
    dp = [[0] * (n + 1) for _ in range(m + 1)]
  
    # Step 2: Initialize base cases
    # Converting empty string to word2[:j] requires j insertions
    for j in range(n + 1):
        dp[0][j] = j
  
    # Converting word1[:i] to empty string requires i deletions  
    for i in range(m + 1):
        dp[i][0] = i
  
    # Step 3: Fill the table using our complex recurrence relation
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                # Characters match - no operation needed
                dp[i][j] = dp[i-1][j-1]
            else:
                # Characters don't match - find minimum cost operation
                replace = dp[i-1][j-1] + 1  # Replace
                delete = dp[i-1][j] + 1     # Delete  
                insert = dp[i][j-1] + 1     # Insert
              
                dp[i][j] = min(replace, delete, insert)
  
    return dp[m][n]
```

### Detailed Example: "horse" → "ros"

Let's trace through this transformation:

```
    ""  r  o  s
""   0  1  2  3
h    1  ?  ?  ?
o    2  ?  ?  ?  
r    3  ?  ?  ?
s    4  ?  ?  ?
e    5  ?  ?  ?
```

> **Base Cases Explanation** :
>
> * `dp[0][j]` = j insertions to get from "" to "ros"[:j]
> * `dp[i][0]` = i deletions to get from "horse"[:i] to ""

Filling step by step:

```
Final DP table:
    ""  r  o  s
""   0  1  2  3
h    1  1  2  3
o    2  2  1  2  
r    3  2  2  2
s    4  3  3  2
e    5  4  4  3
```

The answer is 3 operations: replace 'h'→'r', delete 'r', delete 'e'.

---

## Common 2D DP Patterns for FAANG Interviews

### Pattern 1: Grid Traversal Problems

> **Recognition** : Problems involving moving through a 2D grid with constraints

 **Key Characteristics** :

* Usually involve paths, costs, or counting
* Transitions typically from adjacent cells
* Base cases often involve edges of the grid

### Pattern 2: String Comparison Problems

> **Recognition** : Two strings being compared or transformed

 **Key Characteristics** :

* State usually involves positions in both strings
* Recurrence relation handles character matching/mismatching
* Base cases involve empty strings

### Pattern 3: Sequence Alignment Problems

> **Recognition** : Finding optimal way to align or match sequences

 **Key Characteristics** :

* Often involves costs for different operations
* May have gap penalties or bonuses for matches
* Usually seeks minimum cost or maximum score

## Space Optimization Techniques

> **Interview Tip** : Always discuss space optimization after presenting the basic solution!

### Rolling Array Technique

For problems where `dp[i][j]` only depends on the previous row:

```python
def uniquePathsOptimized(m, n):
    # Only need current and previous row
    prev = [1] * n  # Previous row
  
    for i in range(1, m):
        curr = [1] * n  # Current row
        for j in range(1, n):
            curr[j] = prev[j] + curr[j-1]
        prev = curr  # Update for next iteration
  
    return prev[n-1]
```

### In-Place Modification

When allowed to modify input:

```python
def minPathSumOptimized(grid):
    m, n = len(grid), len(grid[0])
  
    # Modify the grid in-place to save space
    for i in range(m):
        for j in range(n):
            if i == 0 and j == 0:
                continue
            elif i == 0:
                grid[i][j] += grid[i][j-1]
            elif j == 0:
                grid[i][j] += grid[i-1][j]
            else:
                grid[i][j] += min(grid[i-1][j], grid[i][j-1])
  
    return grid[m-1][n-1]
```

## FAANG Interview Strategy Guide

### Phase 1: Problem Understanding (2-3 minutes)

1. **Clarify constraints** : Grid size, string length, character sets
2. **Identify the problem type** : Counting, optimization, or decision
3. **Confirm input/output format**

### Phase 2: Solution Design (5-7 minutes)

1. **State definition** : Be very clear about what `dp[i][j]` represents
2. **Base cases** : Start with the simplest scenarios
3. **Recurrence relation** : Explain the logic step by step
4. **Example walkthrough** : Use a small example to verify logic

### Phase 3: Implementation (10-15 minutes)

1. **Code the basic solution first**
2. **Add comments explaining key steps**
3. **Test with the example**

### Phase 4: Optimization Discussion (3-5 minutes)

1. **Time complexity analysis**
2. **Space optimization possibilities**
3. **Alternative approaches**

> **Final Tip** : Practice verbalizing your thought process. FAANG interviews heavily weight problem-solving communication, not just the final code!

The beauty of 2D DP lies in its systematic approach to breaking down complex problems into manageable subproblems. Master these three fundamental problems, understand their patterns deeply, and you'll be well-equipped to tackle any 2D DP challenge in your technical interviews.
