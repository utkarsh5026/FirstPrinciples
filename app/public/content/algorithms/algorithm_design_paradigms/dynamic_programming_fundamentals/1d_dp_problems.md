# Understanding 1D Dynamic Programming: From First Principles to FAANG Interview Success

## What is Dynamic Programming? The Foundation

> **Dynamic Programming is fundamentally about avoiding redundant work by remembering solutions to subproblems we've already solved.**

Before diving into specific problems, let's understand what Dynamic Programming (DP) really means from the ground up.

Imagine you're asked to calculate something complex, like the 50th Fibonacci number. The naive approach would recalculate the same values repeatedly. Dynamic Programming says: "Why recalculate when you can remember?"

### The Two Pillars of Dynamic Programming

 **1. Optimal Substructure** : The solution to a problem can be constructed from solutions to its subproblems.

 **2. Overlapping Subproblems** : The same subproblems appear multiple times in our recursive solution.

### Why 1D DP Matters in FAANG Interviews

> **1D DP problems are the gateway to understanding more complex DP concepts. Master these, and you'll have the foundation for 2D DP, tree DP, and other advanced topics.**

FAANG companies love these problems because they test:

* Your ability to recognize patterns
* Optimization thinking
* Space-time complexity trade-offs
* Problem-solving methodology

---

## The Systematic Approach to 1D DP Problems

Before we dive into specific problems, let's establish a systematic approach that works for any 1D DP problem:

```
Step 1: Identify the DP nature
├── Can we break it into smaller subproblems?
├── Do subproblems overlap?
└── Can we build solution from subproblem solutions?

Step 2: Define the state
├── What does dp[i] represent?
└── What are we trying to compute?

Step 3: Find the recurrence relation
├── How does dp[i] relate to previous states?
└── What are the base cases?

Step 4: Implement and optimize
├── Start with recursive + memoization
├── Convert to iterative bottom-up
└── Optimize space if possible
```

---

## Problem 1: Fibonacci Sequence - The Classic Introduction

### Understanding the Problem from First Principles

The Fibonacci sequence is defined as:

* F(0) = 0
* F(1) = 1
* F(n) = F(n-1) + F(n-2) for n > 1

 **Sequence** : 0, 1, 1, 2, 3, 5, 8, 13, 21, 34...

### Why This is a DP Problem

Let's trace F(5) using naive recursion:

```
F(5)
├── F(4)
│   ├── F(3)
│   │   ├── F(2)
│   │   │   ├── F(1) = 1
│   │   │   └── F(0) = 0
│   │   └── F(1) = 1
│   └── F(2)
│       ├── F(1) = 1
│       └── F(0) = 0
└── F(3)
    ├── F(2)
    │   ├── F(1) = 1
    │   └── F(0) = 0
    └── F(1) = 1
```

Notice how F(2), F(1), F(0) are calculated multiple times? This is the "overlapping subproblems" we need to eliminate.

### Solution Evolution

**Approach 1: Naive Recursion (Don't do this in interviews!)**

```python
def fibonacci_naive(n):
    # Base cases
    if n <= 1:
        return n
  
    # Recursive case - this creates exponential time complexity
    return fibonacci_naive(n - 1) + fibonacci_naive(n - 2)

# Time: O(2^n) - exponential!
# Space: O(n) - recursion stack
```

> **This approach has exponential time complexity because we're solving the same subproblems repeatedly. For n=40, this takes several seconds!**

**Approach 2: Top-Down DP (Memoization)**

```python
def fibonacci_memo(n, memo={}):
    # Check if we've already calculated this value
    if n in memo:
        return memo[n]
  
    # Base cases
    if n <= 1:
        return n
  
    # Calculate and store the result
    memo[n] = fibonacci_memo(n - 1, memo) + fibonacci_memo(n - 2, memo)
    return memo[n]

# Time: O(n) - each subproblem solved once
# Space: O(n) - memo table + recursion stack
```

**What's happening here?**

* `memo` is our cache to store previously computed results
* Before computing F(n), we check if it's already in our cache
* If not, we compute it once and store it for future use
* This transforms our exponential algorithm into linear time

**Approach 3: Bottom-Up DP (Iterative)**

```python
def fibonacci_bottom_up(n):
    # Handle edge cases
    if n <= 1:
        return n
  
    # Create DP table
    dp = [0] * (n + 1)
  
    # Base cases
    dp[0] = 0
    dp[1] = 1
  
    # Fill the table from bottom to top
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
  
    return dp[n]

# Time: O(n)
# Space: O(n)
```

**Understanding the flow:**

* We create a table `dp` where `dp[i]` represents the i-th Fibonacci number
* We start with known values (base cases)
* We build up to our answer by filling the table iteratively

**Approach 4: Space-Optimized DP**

```python
def fibonacci_optimized(n):
    # Handle edge cases
    if n <= 1:
        return n
  
    # We only need the last two values
    prev2 = 0  # F(0)
    prev1 = 1  # F(1)
  
    # Calculate F(2) to F(n)
    for i in range(2, n + 1):
        current = prev1 + prev2
        # Slide the window
        prev2 = prev1
        prev1 = current
  
    return prev1

# Time: O(n)
# Space: O(1) - constant space!
```

> **This is the most interview-friendly solution! It demonstrates that you understand the core DP concept and can optimize for space complexity.**

---

## Problem 2: Climbing Stairs - The Gateway Problem

### Understanding from First Principles

 **Problem** : You're climbing a staircase with `n` steps. You can climb either 1 or 2 steps at a time. How many distinct ways can you reach the top?

Let's think step by step:

* To reach step `n`, you could come from step `n-1` (take 1 step) or step `n-2` (take 2 steps)
* The number of ways to reach step `n` = ways to reach `n-1` + ways to reach `n-2`

**Wait, this sounds familiar!** This is exactly the Fibonacci sequence in disguise!

### Building Intuition

```
For n=1: 1 way
└── [1]

For n=2: 2 ways  
├── [1,1]
└── [2]

For n=3: 3 ways
├── [1,1,1]
├── [1,2]  
└── [2,1]

For n=4: 5 ways
├── [1,1,1,1]
├── [1,1,2]
├── [1,2,1]
├── [2,1,1]
└── [2,2]
```

The pattern: 1, 2, 3, 5, 8... (Fibonacci starting from 1, 2)

### DP Solution

```python
def climb_stairs(n):
    """
    Calculate number of ways to climb n stairs.
  
    State definition: dp[i] = number of ways to reach step i
    Recurrence: dp[i] = dp[i-1] + dp[i-2]
    Base cases: dp[1] = 1, dp[2] = 2
    """
  
    # Handle edge cases
    if n <= 2:
        return n
  
    # Space-optimized approach
    prev2 = 1  # ways to reach step 1
    prev1 = 2  # ways to reach step 2
  
    for i in range(3, n + 1):
        current = prev1 + prev2
        prev2 = prev1
        prev1 = current
  
    return prev1

# Time: O(n)
# Space: O(1)
```

### Interview Tips for Climbing Stairs

> **In interviews, start by working through small examples (n=1,2,3,4) to discover the pattern. This shows your problem-solving process.**

**Common follow-up questions:**

1. "What if you can take 1, 2, or 3 steps?" → Recurrence becomes `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]`
2. "What if some steps are broken?" → This becomes a different DP problem

---

## Problem 3: House Robber - The Decision-Making DP

### Understanding the Problem

 **Problem** : You're a robber planning to rob houses along a street. Each house has a certain amount of money. You cannot rob two adjacent houses (alarms will go off). What's the maximum money you can rob?

 **Example** : `houses = [2, 7, 9, 3, 1]`

* Rob houses 0, 2, 4: 2 + 9 + 1 = 12
* Rob houses 1, 3: 7 + 3 = 10
* Rob houses 1, 4: 7 + 1 = 8
* **Maximum** : 12

### The Decision at Each House

> **At each house, you face a binary decision: rob it or skip it. This decision depends on what you've done with previous houses.**

Let's define our state carefully:

* `dp[i]` = maximum money you can rob from houses 0 to i

At house `i`, you have two choices:

1. **Rob house i** : You get `houses[i] + dp[i-2]` (can't rob adjacent house i-1)
2. **Skip house i** : You get `dp[i-1]` (take the best from previous houses)

 **Recurrence relation** : `dp[i] = max(houses[i] + dp[i-2], dp[i-1])`

### Building Intuition with Example

```
houses = [2, 7, 9, 3, 1]
indices: [0, 1, 2, 3, 4]

dp[0] = 2 (only choice: rob house 0)
dp[1] = max(rob 1: 7, skip 1: 2) = 7
dp[2] = max(rob 2: 9+2=11, skip 2: 7) = 11  
dp[3] = max(rob 3: 3+7=10, skip 3: 11) = 11
dp[4] = max(rob 4: 1+11=12, skip 4: 11) = 12
```

### Complete Solution

```python
def rob_houses(houses):
    """
    Find maximum money that can be robbed without robbing adjacent houses.
  
    State: dp[i] = max money from houses[0...i]
    Recurrence: dp[i] = max(rob_i + dp[i-2], skip_i + dp[i-1])
    """
  
    n = len(houses)
  
    # Handle edge cases
    if n == 0:
        return 0
    if n == 1:
        return houses[0]
  
    # Space-optimized DP
    prev2 = houses[0]              # Best for houses[0...0]
    prev1 = max(houses[0], houses[1])  # Best for houses[0...1]
  
    # Process remaining houses
    for i in range(2, n):
        # Choice 1: Rob current house + best from two houses ago
        rob_current = houses[i] + prev2
      
        # Choice 2: Skip current house, take best from previous
        skip_current = prev1
      
        # Take the maximum
        current = max(rob_current, skip_current)
      
        # Update for next iteration
        prev2 = prev1
        prev1 = current
  
    return prev1

# Time: O(n)
# Space: O(1)
```

### Advanced Variant: Circular House Robber

 **Problem** : What if houses are arranged in a circle? (House 0 and house n-1 are adjacent)

```python
def rob_circular(houses):
    """
    Rob houses arranged in a circle.
  
    Key insight: Either rob house 0 (can't rob house n-1) 
    or don't rob house 0 (can rob house n-1)
    """
  
    n = len(houses)
    if n == 1:
        return houses[0]
  
    # Case 1: Rob houses[0...n-2] (include first, exclude last)
    case1 = rob_linear(houses[:-1])
  
    # Case 2: Rob houses[1...n-1] (exclude first, include last)  
    case2 = rob_linear(houses[1:])
  
    return max(case1, case2)

def rob_linear(houses):
    """Helper function for linear house robbing"""
    if not houses:
        return 0
    if len(houses) == 1:
        return houses[0]
  
    prev2, prev1 = houses[0], max(houses[0], houses[1])
  
    for i in range(2, len(houses)):
        current = max(houses[i] + prev2, prev1)
        prev2, prev1 = prev1, current
  
    return prev1
```

---

## The Universal Pattern: Recognizing 1D DP

### Common Characteristics

> **1D DP problems typically involve making optimal decisions at each step, where the decision depends on a fixed number of previous states.**

**Pattern Recognition Checklist:**

* [ ] Can you define the problem in terms of smaller subproblems?
* [ ] Do you make decisions at each step?
* [ ] Does the current state depend only on a few previous states?
* [ ] Are there overlapping subproblems?

### The Interview Strategy

**Step 1: Understand the Problem**

* Work through small examples
* Identify what you're optimizing for
* Look for patterns

**Step 2: Define Your State**

* What does `dp[i]` represent?
* Be precise in your definition

**Step 3: Find the Recurrence**

* How does `dp[i]` relate to previous states?
* What are the base cases?

**Step 4: Code and Optimize**

* Start with the recurrence relation
* Optimize space if you only need a few previous states

### Time and Space Complexity Analysis

```
Problem          | Time | Space | Space Optimized
----------------|------|-------|----------------
Fibonacci       | O(n) | O(n)  | O(1)
Climbing Stairs | O(n) | O(n)  | O(1)  
House Robber    | O(n) | O(n)  | O(1)
```

> **The space optimization from O(n) to O(1) is often what separates a good solution from a great one in interviews.**

---

## Practice Problems and Extensions

### Similar 1D DP Problems for Practice

1. **Min Cost Climbing Stairs** : Each step has a cost, find minimum cost to reach top
2. **Decode Ways** : Count ways to decode a numeric string
3. **Paint House** : Minimize cost to paint houses with color constraints
4. **Delete and Earn** : Maximize points by deleting numbers with constraints

### Key Takeaways for FAANG Interviews

> **Remember: DP is not about memorizing solutions, it's about recognizing patterns and building solutions systematically.**

**What Interviewers Look For:**

1. **Pattern Recognition** : Can you identify this as a DP problem?
2. **State Definition** : Can you clearly define what your DP state represents?
3. **Recurrence Relation** : Can you derive the mathematical relationship?
4. **Optimization** : Can you optimize space complexity?
5. **Edge Cases** : Do you handle boundary conditions correctly?

**Common Mistakes to Avoid:**

* Not defining the state clearly
* Forgetting base cases
* Off-by-one errors in indexing
* Not optimizing space when possible
* Overcomplicating the solution

The beauty of 1D DP lies in its simplicity and elegance. Master these foundational problems, and you'll have the tools to tackle much more complex dynamic programming challenges in your FAANG interviews!
