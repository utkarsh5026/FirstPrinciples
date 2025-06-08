# Multi-dimensional Dynamic Programming & State Space Optimization

Let me take you on a journey through one of the most powerful algorithmic paradigms that frequently appears in FAANG interviews. We'll build everything from the ground up, ensuring you understand not just the "how" but the "why" behind every concept.

## Chapter 1: The Foundation - Understanding Dynamic Programming

> **Core Principle** : Dynamic Programming is fundamentally about avoiding redundant computations by storing solutions to subproblems and reusing them when needed.

Before we dive into multi-dimensional DP, let's establish the bedrock principles:

### The Three Pillars of DP

 **1. Optimal Substructure** : The optimal solution contains optimal solutions to subproblems
 **2. Overlapping Subproblems** : The same subproblems are solved multiple times
 **3. Memoization/Tabulation** : Store solutions to avoid recomputation

Let's start with a simple example to illustrate these principles:

```python
# Fibonacci - The simplest DP example
def fibonacci_naive(n):
    """Naive recursive approach - exponential time"""
    if n <= 1:
        return n
    return fibonacci_naive(n-1) + fibonacci_naive(n-2)

# With memoization - linear time
def fibonacci_dp(n, memo={}):
    """DP approach with memoization"""
    if n in memo:
        return memo[n]
  
    if n <= 1:
        memo[n] = n
    else:
        memo[n] = fibonacci_dp(n-1, memo) + fibonacci_dp(n-2, memo)
  
    return memo[n]
```

**What's happening here?**

* In the naive version, we compute `fibonacci(3)` multiple times when calculating `fibonacci(5)`
* The DP version stores each result in `memo`, so we compute each Fibonacci number exactly once
* This transforms O(2^n) time complexity to O(n)

## Chapter 2: Expanding to Multiple Dimensions

> **Key Insight** : Multi-dimensional DP extends the concept of storing subproblem solutions to problems where the state is described by multiple variables.

### Understanding State Space

In single-dimensional DP, our state might be:

* `dp[i]` = solution for position i

In multi-dimensional DP, our state becomes:

* `dp[i][j]` = solution for position (i, j)
* `dp[i][j][k]` = solution for state (i, j, k)
* And so on...

### The Grid Traversal Problem - A Perfect Introduction

Let's explore this with the classic "Unique Paths" problem:

```
Problem: Robot starts at top-left of m×n grid, 
can only move right or down. How many unique 
paths to bottom-right?

Grid visualization (3×3):
S . .
. . .
. . E
```

**First Principles Analysis:**

1. **State Definition** : `dp[i][j]` = number of ways to reach cell (i,j)
2. **Base Cases** : First row and first column have only 1 way each
3. **Recurrence** : `dp[i][j] = dp[i-1][j] + dp[i][j-1]`

```python
def unique_paths(m, n):
    """
    Multi-dimensional DP solution
  
    State: dp[i][j] = ways to reach cell (i,j)
    Transition: dp[i][j] = dp[i-1][j] + dp[i][j-1]
    """
    # Create 2D DP table
    dp = [[0] * n for _ in range(m)]
  
    # Base cases: first row and first column
    for i in range(m):
        dp[i][0] = 1  # Only one way to reach leftmost column
  
    for j in range(n):
        dp[0][j] = 1  # Only one way to reach topmost row
  
    # Fill the DP table
    for i in range(1, m):
        for j in range(1, n):
            # Ways to reach (i,j) = ways from above + ways from left
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
  
    return dp[m-1][n-1]

# Example execution trace for 3×3 grid:
# dp = [[1, 1, 1],
#       [1, 2, 3],
#       [1, 3, 6]]
```

**Step-by-step breakdown:**

* We create a 2D table to represent our state space
* Each cell `dp[i][j]` stores the number of unique paths to reach that position
* We can only reach `(i,j)` from `(i-1,j)` (above) or `(i,j-1)` (left)
* The answer is stored in the bottom-right corner

## Chapter 3: Advanced Multi-dimensional Patterns

### Pattern 1: Interval DP

> **Core Concept** : Problems involving optimal ways to process intervals or ranges.

**Classic Example: Matrix Chain Multiplication**

```python
def matrix_chain_order(p):
    """
    Find minimum scalar multiplications needed to compute matrix chain
  
    State: dp[i][j] = minimum operations to multiply matrices from i to j
    Recurrence: dp[i][j] = min(dp[i][k] + dp[k+1][j] + p[i]*p[k+1]*p[j+1])
                           for all k from i to j-1
    """
    n = len(p) - 1  # Number of matrices
    dp = [[0] * n for _ in range(n)]
  
    # l is the chain length
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = float('inf')
          
            # Try all possible split points
            for k in range(i, j):
                cost = (dp[i][k] + dp[k+1][j] + 
                       p[i] * p[k+1] * p[j+1])
                dp[i][j] = min(dp[i][j], cost)
  
    return dp[0][n-1]
```

**What makes this multi-dimensional?**

* State depends on two variables: start index `i` and end index `j`
* We build solutions for smaller intervals to solve larger ones
* The optimal split point `k` creates two subproblems: `[i,k]` and `[k+1,j]`

### Pattern 2: Knapsack Variations

**0/1 Knapsack with Weight and Volume Constraints**

```python
def knapsack_2d(weights, volumes, values, max_weight, max_volume):
    """
    3D DP: items, weight capacity, volume capacity
  
    State: dp[i][w][v] = max value using first i items with 
                        weight ≤ w and volume ≤ v
    """
    n = len(values)
    dp = [[[0 for _ in range(max_volume + 1)] 
           for _ in range(max_weight + 1)] 
          for _ in range(n + 1)]
  
    for i in range(1, n + 1):
        for w in range(max_weight + 1):
            for v in range(max_volume + 1):
                # Don't take item i-1
                dp[i][w][v] = dp[i-1][w][v]
              
                # Take item i-1 if possible
                if (weights[i-1] <= w and volumes[i-1] <= v):
                    take_value = (dp[i-1][w-weights[i-1]][v-volumes[i-1]] + 
                                 values[i-1])
                    dp[i][w][v] = max(dp[i][w][v], take_value)
  
    return dp[n][max_weight][max_volume]
```

**Understanding the complexity:**

* We have three state variables: item index, weight capacity, volume capacity
* Each state represents a unique subproblem
* Time complexity: O(n × W × V)
* Space complexity: O(n × W × V)

## Chapter 4: State Space Optimization Techniques

> **Critical Insight** : The biggest challenge in multi-dimensional DP is managing memory and time complexity. State space optimization is about reducing dimensions without losing correctness.

### Technique 1: Space Optimization through Dimension Reduction

**Rolling Array Technique:**

```python
def unique_paths_optimized(m, n):
    """
    Space optimization: O(n) instead of O(m×n)
  
    Key insight: We only need the previous row to compute current row
    """
    # Only store current and previous row
    prev = [1] * n  # Previous row (all 1s initially)
  
    for i in range(1, m):
        curr = [1]  # First element is always 1
      
        for j in range(1, n):
            # curr[j] = prev[j] + curr[j-1]
            # where prev[j] is value from above
            # and curr[j-1] is value from left
            curr.append(prev[j] + curr[j-1])
      
        prev = curr  # Update previous row
  
    return prev[n-1]

# Even more optimized - single array:
def unique_paths_ultra_optimized(m, n):
    """
    Single array optimization: reuse the same array
    """
    dp = [1] * n
  
    for i in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j-1]  # dp[j] was previous row value
                              # dp[j-1] is current row left value
  
    return dp[n-1]
```

**How this works:**

* Original: O(m×n) space for full 2D table
* Optimized: O(n) space using only current and previous row
* Ultra-optimized: O(n) space using single array with in-place updates

### Technique 2: State Compression

**Example: Traveling Salesman Problem with Bitmask DP**

```python
def tsp_bitmask(graph):
    """
    State compression using bitmasks
  
    State: dp[mask][i] = minimum cost to visit all cities in mask,
                        ending at city i
  
    mask is a bitmask representing visited cities
    """
    n = len(graph)
    dp = {}
  
    def solve(mask, pos):
        if mask == (1 << n) - 1:  # All cities visited
            return graph[pos][0]  # Return to start
      
        if (mask, pos) in dp:
            return dp[(mask, pos)]
      
        result = float('inf')
      
        # Try visiting each unvisited city
        for city in range(n):
            if mask & (1 << city) == 0:  # City not visited
                new_mask = mask | (1 << city)  # Mark city as visited
                distance = graph[pos][city] + solve(new_mask, city)
                result = min(result, distance)
      
        dp[(mask, pos)] = result
        return result
  
    return solve(1, 0)  # Start from city 0, only city 0 visited initially
```

**State compression breakdown:**

* Instead of storing which cities are visited in a list/set
* We use a bitmask where bit `i` represents whether city `i` is visited
* This reduces space and enables efficient subset enumeration
* State space: O(2^n × n) instead of exponential combinations

### Technique 3: Coordinate Compression

```python
def range_sum_2d_compressed(matrix, queries):
    """
    When dealing with large coordinate spaces but few actual points
  
    Instead of creating full 2D array, compress coordinates
    """
    # Extract unique coordinates
    xs = set()
    ys = set()
  
    for x, y, val in matrix:
        xs.add(x)
        ys.add(y)
  
    # Sort and create mapping
    xs = sorted(xs)
    ys = sorted(ys)
  
    x_map = {x: i for i, x in enumerate(xs)}
    y_map = {y: i for i, y in enumerate(ys)}
  
    # Create compressed 2D array
    compressed = [[0] * len(ys) for _ in range(len(xs))]
  
    for x, y, val in matrix:
        compressed[x_map[x]][y_map[y]] = val
  
    # Build prefix sum on compressed coordinates
    prefix = [[0] * (len(ys) + 1) for _ in range(len(xs) + 1)]
  
    for i in range(len(xs)):
        for j in range(len(ys)):
            prefix[i+1][j+1] = (compressed[i][j] + 
                               prefix[i][j+1] + 
                               prefix[i+1][j] - 
                               prefix[i][j])
  
    return prefix
```

## Chapter 5: FAANG Interview Patterns & Problem-Solving Framework

> **Interview Strategy** : Recognize patterns quickly and apply systematic optimization techniques.

### The FAANG DP Problem-Solving Template

```
Step 1: Identify if it's a DP problem
├── Optimal substructure?
├── Overlapping subproblems?
└── Optimization/counting objective?

Step 2: Define state space
├── What variables describe a subproblem?
├── What's the meaning of dp[state]?
└── How many dimensions needed?

Step 3: Find recurrence relation
├── How to build solution from smaller subproblems?
├── What are the transitions?
└── What are base cases?

Step 4: Consider optimizations
├── Can we reduce dimensions?
├── Can we compress coordinates/states?
└── What's the bottleneck?
```

### Common FAANG Multi-dimensional DP Problems

**1. Edit Distance (Levenshtein Distance)**

```python
def edit_distance(word1, word2):
    """
    2D DP: Transform word1 to word2 with minimum operations
  
    State: dp[i][j] = min operations to transform word1[0:i] to word2[0:j]
    Operations: insert, delete, replace
    """
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
  
    # Base cases
    for i in range(m + 1):
        dp[i][0] = i  # Delete all characters from word1
  
    for j in range(n + 1):
        dp[0][j] = j  # Insert all characters to get word2
  
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]  # No operation needed
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],    # Delete from word1
                    dp[i][j-1],    # Insert into word1
                    dp[i-1][j-1]   # Replace in word1
                )
  
    return dp[m][n]
```

**2. Regular Expression Matching**

```python
def is_match(s, p):
    """
    2D DP: String matching with . and * wildcards
  
    State: dp[i][j] = whether s[0:i] matches p[0:j]
    """
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
  
    # Base case: empty string matches empty pattern
    dp[0][0] = True
  
    # Handle patterns like a*, a*b*, etc. that can match empty string
    for j in range(2, n + 1):
        if p[j-1] == '*':
            dp[0][j] = dp[0][j-2]
  
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j-1] == '*':
                # * can match zero or more of preceding character
                dp[i][j] = dp[i][j-2]  # Match zero occurrences
              
                if p[j-2] == '.' or p[j-2] == s[i-1]:
                    dp[i][j] |= dp[i-1][j]  # Match one more occurrence
            elif p[j-1] == '.' or p[j-1] == s[i-1]:
                dp[i][j] = dp[i-1][j-1]  # Characters match
  
    return dp[m][n]
```

## Chapter 6: Advanced Optimization Strategies

### Memory-Efficient State Transitions

> **Pro Tip** : When memory becomes a constraint, focus on the order of state computation and what previous states you actually need.

```python
def longest_palindromic_subsequence_optimized(s):
    """
    Space optimization for palindrome problems
  
    Original: O(n²) space
    Optimized: O(n) space using diagonal processing
    """
    n = len(s)
    # Only need two diagonals at a time
    prev = [1] * n  # Length 1 palindromes
  
    for length in range(2, n + 1):
        curr = [0] * (n - length + 1)
      
        for i in range(n - length + 1):
            j = i + length - 1
          
            if s[i] == s[j]:
                if length == 2:
                    curr[i] = 2
                else:
                    curr[i] = 2 + prev[i + 1]
            else:
                curr[i] = max(
                    curr[i + 1] if i + 1 < len(curr) else 0,
                    prev[i] if i < len(prev) else 0
                )
      
        prev = curr
  
    return prev[0] if prev else 1
```

### Time Complexity Optimization

**Matrix Exponentiation for Linear Recurrences:**

```python
def matrix_multiply(A, B):
    """Helper function for matrix multiplication"""
    rows_A, cols_A = len(A), len(A[0])
    rows_B, cols_B = len(B), len(B[0])
  
    result = [[0] * cols_B for _ in range(rows_A)]
  
    for i in range(rows_A):
        for j in range(cols_B):
            for k in range(cols_A):
                result[i][j] += A[i][k] * B[k][j]
  
    return result

def matrix_power(matrix, n):
    """Fast matrix exponentiation using binary exponentiation"""
    size = len(matrix)
    result = [[1 if i == j else 0 for j in range(size)] 
              for i in range(size)]  # Identity matrix
  
    while n > 0:
        if n % 2 == 1:
            result = matrix_multiply(result, matrix)
        matrix = matrix_multiply(matrix, matrix)
        n //= 2
  
    return result

def fibonacci_matrix(n):
    """
    Compute nth Fibonacci number in O(log n) time
  
    Using matrix exponentiation:
    [F(n+1)]   [1 1]^n   [F(1)]   [1 1]^n   [1]
    [F(n)  ] = [1 0]   * [F(0)] = [1 0]   * [0]
    """
    if n == 0:
        return 0
  
    base_matrix = [[1, 1], [1, 0]]
    result_matrix = matrix_power(base_matrix, n)
  
    return result_matrix[0][1]  # F(n) is at position [0][1]
```

## Chapter 7: Debugging Multi-dimensional DP

> **Essential Skill** : Being able to trace through your DP solution and verify correctness.

### Systematic Debugging Approach

```python
def debug_dp_solution(dp_function, test_cases):
    """
    Template for debugging DP solutions
    """
    for i, (input_data, expected) in enumerate(test_cases):
        print(f"\n=== Test Case {i+1} ===")
        print(f"Input: {input_data}")
        print(f"Expected: {expected}")
      
        # Add instrumentation to your DP function
        result = dp_function(*input_data, debug=True)
        print(f"Got: {result}")
        print(f"✓ PASS" if result == expected else "✗ FAIL")

# Example instrumented function
def edit_distance_debug(word1, word2, debug=False):
    """Edit distance with debug output"""
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
  
    # Base cases
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
  
    if debug:
        print("Initial DP table:")
        for row in dp:
            print(row)
  
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
          
            if debug:
                print(f"dp[{i}][{j}] = {dp[i][j]} "
                      f"(comparing '{word1[i-1]}' vs '{word2[j-1]}')")
  
    if debug:
        print("Final DP table:")
        for row in dp:
            print(row)
  
    return dp[m][n]
```

---

## Key Takeaways for FAANG Interviews

> **Remember** : Multi-dimensional DP is not just about adding more dimensions—it's about understanding when those dimensions are necessary and how to optimize them effectively.

**The Three Pillars of Mastery:**

1. **Pattern Recognition** : Quickly identify when a problem needs multi-dimensional state
2. **Optimization Mindset** : Always consider space and time optimizations
3. **Implementation Precision** : Write clean, bug-free code under pressure

**Common Interview Mistakes to Avoid:**

* Overcomplicating the state space (using more dimensions than needed)
* Forgetting base cases in multi-dimensional arrays
* Not considering space optimization when asked about improvements
* Incorrect indexing in multi-dimensional arrays

With this foundation, you're equipped to tackle even the most challenging multi-dimensional DP problems that appear in FAANG interviews. Practice identifying patterns, implementing solutions cleanly, and optimizing both time and space complexity.
