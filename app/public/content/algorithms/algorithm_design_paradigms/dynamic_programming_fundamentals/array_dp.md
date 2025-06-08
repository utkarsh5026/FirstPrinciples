# Array Dynamic Programming: Mastering LIS and Maximum Subarray for FAANG Interviews

Let me take you on a comprehensive journey through Array Dynamic Programming, starting from the very foundation and building up to these crucial FAANG interview problems.

## Understanding Dynamic Programming from First Principles

> **Core Principle** : Dynamic Programming is fundamentally about breaking down complex problems into simpler subproblems and storing their solutions to avoid redundant calculations.

Think of DP like this: imagine you're climbing a staircase and someone asks "How many ways can you reach step N?" Instead of recalculating the same steps over and over, you write down the answer for each step as you go. That's the essence of DP.

### The Two Pillars of DP

 **1. Optimal Substructure** : The solution to a problem can be constructed from solutions to its subproblems.

 **2. Overlapping Subproblems** : The same subproblems are solved multiple times in a naive recursive approach.

```python
# Example: Simple Fibonacci to illustrate DP concepts
def fibonacci_naive(n):
    """Naive recursive approach - exponential time"""
    if n <= 1:
        return n
    return fibonacci_naive(n-1) + fibonacci_naive(n-2)

def fibonacci_dp(n):
    """DP approach - linear time"""
    if n <= 1:
        return n
  
    # Store solutions to subproblems
    dp = [0] * (n + 1)
    dp[0], dp[1] = 0, 1
  
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]  # Using previously computed results
  
    return dp[n]
```

 **Why this matters** : The naive approach recalculates `fibonacci_naive(5)` multiple times when computing `fibonacci_naive(7)`. The DP approach calculates each value exactly once.

## Problem 1: Longest Increasing Subsequence (LIS)

### Understanding the Problem from First Principles

> **Problem Definition** : Given an array of integers, find the length of the longest subsequence where elements are in strictly increasing order.

Let's start with a concrete example:

```
Array: [10, 9, 2, 5, 3, 7, 101, 18]
```

**What is a subsequence?**

* A subsequence maintains the relative order of elements
* Elements don't need to be consecutive
* Example subsequences: [10, 101], [2, 5, 7, 101], [9, 101]

**Visual representation:**

```
Array:  [10, 9, 2, 5, 3, 7, 101, 18]
Index:   0   1  2  3  4  5   6    7

Some increasing subsequences:
[2, 5, 7, 101] - length 4
[2, 3, 7, 18]  - length 4
[2, 5, 7, 18]  - length 4
```

### Approach 1: Brute Force (Understanding the Foundation)

```python
def lis_brute_force(nums):
    """
    Generate all possible subsequences and check which ones are increasing.
    Time Complexity: O(2^n * n) - exponential
    """
    def is_increasing(seq):
        for i in range(1, len(seq)):
            if seq[i] <= seq[i-1]:
                return False
        return True
  
    def generate_subsequences(index, current_seq):
        if index == len(nums):
            if is_increasing(current_seq):
                return len(current_seq)
            return 0
      
        # Two choices: include current element or exclude it
        include = generate_subsequences(index + 1, current_seq + [nums[index]])
        exclude = generate_subsequences(index + 1, current_seq)
      
        return max(include, exclude)
  
    return generate_subsequences(0, [])
```

 **Why this is inefficient** : We're generating 2^n subsequences and checking each one. This leads to massive redundancy.

### Approach 2: Dynamic Programming Solution

> **Key Insight** : For each position i, we need to know the length of the longest increasing subsequence ending at position i.

```python
def longest_increasing_subsequence(nums):
    """
    DP approach to find LIS length.
    Time Complexity: O(n²)
    Space Complexity: O(n)
    """
    if not nums:
        return 0
  
    n = len(nums)
    # dp[i] = length of LIS ending at index i
    dp = [1] * n  # Each element forms a subsequence of length 1
  
    # For each position, check all previous positions
    for i in range(1, n):
        for j in range(i):
            # If current element is greater than previous element
            if nums[i] > nums[j]:
                # Update LIS length ending at i
                dp[i] = max(dp[i], dp[j] + 1)
  
    # Return the maximum LIS length found
    return max(dp)

# Example walkthrough
nums = [10, 9, 2, 5, 3, 7, 101, 18]
```

 **Detailed walkthrough** :

```
Initial: dp = [1, 1, 1, 1, 1, 1, 1, 1]

i=1 (nums[1]=9):
  j=0: nums[1]=9 not > nums[0]=10, no update
  dp = [1, 1, 1, 1, 1, 1, 1, 1]

i=2 (nums[2]=2):
  j=0: nums[2]=2 not > nums[0]=10, no update
  j=1: nums[2]=2 not > nums[1]=9, no update
  dp = [1, 1, 1, 1, 1, 1, 1, 1]

i=3 (nums[3]=5):
  j=0: nums[3]=5 not > nums[0]=10, no update
  j=1: nums[3]=5 not > nums[1]=9, no update
  j=2: nums[3]=5 > nums[2]=2, dp[3] = max(1, dp[2]+1) = 2
  dp = [1, 1, 1, 2, 1, 1, 1, 1]

i=4 (nums[4]=3):
  j=0,1: no updates
  j=2: nums[4]=3 > nums[2]=2, dp[4] = max(1, dp[2]+1) = 2
  j=3: nums[4]=3 not > nums[3]=5, no update
  dp = [1, 1, 1, 2, 2, 1, 1, 1]
```

### Approach 3: Optimized Binary Search Solution

> **Advanced Insight** : We can use binary search to achieve O(n log n) time complexity by maintaining a smart data structure.

```python
def lis_binary_search(nums):
    """
    Optimized LIS using binary search.
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    if not nums:
        return 0
  
    # tails[i] = smallest ending element of all increasing subsequences of length i+1
    tails = []
  
    for num in nums:
        # Binary search for the position to insert/replace
        left, right = 0, len(tails)
      
        while left < right:
            mid = (left + right) // 2
            if tails[mid] < num:
                left = mid + 1
            else:
                right = mid
      
        # If num is larger than all elements in tails, append it
        if left == len(tails):
            tails.append(num)
        else:
            # Replace the element at position 'left'
            tails[left] = num
  
    return len(tails)
```

 **How the `tails` array works** :

```
nums = [10, 9, 2, 5, 3, 7, 101, 18]

Process num=10: tails = [10]
Process num=9:  tails = [9]    (replace 10 with 9)
Process num=2:  tails = [2]    (replace 9 with 2)
Process num=5:  tails = [2, 5] (append 5)
Process num=3:  tails = [2, 3] (replace 5 with 3)
Process num=7:  tails = [2, 3, 7] (append 7)
Process num=101: tails = [2, 3, 7, 101] (append 101)
Process num=18: tails = [2, 3, 7, 18] (replace 101 with 18)

Length = 4
```

## Problem 2: Maximum Subarray (Kadane's Algorithm)

### Understanding the Problem from First Principles

> **Problem Definition** : Given an array of integers, find the contiguous subarray with the largest sum.

```
Array: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Answer: [4, -1, 2, 1] with sum = 6
```

**What is a subarray?**

* Elements must be contiguous (adjacent)
* Can be any length from 1 to n
* Different from subsequence (which can skip elements)

### Approach 1: Brute Force Understanding

```python
def max_subarray_brute_force(nums):
    """
    Check all possible subarrays.
    Time Complexity: O(n³)
    """
    max_sum = float('-inf')
    n = len(nums)
  
    # Try all possible starting positions
    for i in range(n):
        # Try all possible ending positions
        for j in range(i, n):
            # Calculate sum of subarray from i to j
            current_sum = 0
            for k in range(i, j + 1):
                current_sum += nums[k]
            max_sum = max(max_sum, current_sum)
  
    return max_sum
```

 **Why this is inefficient** : We recalculate sums repeatedly. For array of size n, we examine O(n²) subarrays and spend O(n) time calculating each sum.

### Approach 2: Optimized Brute Force

```python
def max_subarray_optimized_brute(nums):
    """
    Optimize by calculating sum incrementally.
    Time Complexity: O(n²)
    """
    max_sum = float('-inf')
    n = len(nums)
  
    for i in range(n):
        current_sum = 0
        # Extend subarray from position i
        for j in range(i, n):
            current_sum += nums[j]  # Add current element to running sum
            max_sum = max(max_sum, current_sum)
  
    return max_sum
```

### Approach 3: Kadane's Algorithm (The DP Solution)

> **Core Insight** : At each position, we have two choices: start a new subarray from current position, or extend the existing subarray to include current position.

```python
def max_subarray_kadane(nums):
    """
    Kadane's Algorithm - Dynamic Programming approach.
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if not nums:
        return 0
  
    # current_sum = maximum sum ending at current position
    # max_sum = overall maximum sum found so far
    current_sum = max_sum = nums[0]
  
    for i in range(1, len(nums)):
        # Key decision: start new subarray or extend existing one?
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
  
    return max_sum
```

 **Detailed walkthrough** :

```
Array: [-2, 1, -3, 4, -1, 2, 1, -5, 4]

Initial: current_sum = -2, max_sum = -2

i=1 (nums[1]=1):
  current_sum = max(1, -2+1) = max(1, -1) = 1
  max_sum = max(-2, 1) = 1

i=2 (nums[2]=-3):
  current_sum = max(-3, 1+(-3)) = max(-3, -2) = -2
  max_sum = max(1, -2) = 1

i=3 (nums[3]=4):
  current_sum = max(4, -2+4) = max(4, 2) = 4
  max_sum = max(1, 4) = 4

i=4 (nums[4]=-1):
  current_sum = max(-1, 4+(-1)) = max(-1, 3) = 3
  max_sum = max(4, 3) = 4

i=5 (nums[5]=2):
  current_sum = max(2, 3+2) = max(2, 5) = 5
  max_sum = max(4, 5) = 5

i=6 (nums[6]=1):
  current_sum = max(1, 5+1) = max(1, 6) = 6
  max_sum = max(5, 6) = 6

Final answer: 6
```

### Enhanced Version: Tracking the Actual Subarray

```python
def max_subarray_with_indices(nums):
    """
    Kadane's algorithm that also returns the actual subarray.
    """
    if not nums:
        return 0, []
  
    current_sum = max_sum = nums[0]
    start = end = 0
    temp_start = 0
  
    for i in range(1, len(nums)):
        if current_sum < 0:
            current_sum = nums[i]
            temp_start = i
        else:
            current_sum += nums[i]
      
        if current_sum > max_sum:
            max_sum = current_sum
            start = temp_start
            end = i
  
    return max_sum, nums[start:end+1]
```

## Key Patterns for FAANG Interviews

> **Pattern Recognition** : Both problems demonstrate the fundamental DP pattern of making optimal decisions at each step based on previous results.

### Common DP Array Patterns:

 **1. State Definition** :

* LIS: `dp[i]` = length of LIS ending at position i
* Max Subarray: `current_sum` = max sum ending at current position

 **2. Transition** :

* LIS: `dp[i] = max(dp[i], dp[j] + 1)` for all j < i where nums[j] < nums[i]
* Max Subarray: `current_sum = max(nums[i], current_sum + nums[i])`

 **3. Base Case** :

* LIS: Each element forms a subsequence of length 1
* Max Subarray: First element is both current and maximum sum

### Interview Tips:

```
Mobile-Optimized Problem-Solving Framework:

Step 1: Understand
├── Clarify problem constraints
├── Work through examples manually
└── Identify edge cases

Step 2: Approach
├── Start with brute force
├── Identify repeated subproblems
└── Design DP state and transitions

Step 3: Implement
├── Code the solution
├── Trace through examples
└── Analyze time/space complexity

Step 4: Optimize
├── Look for space optimization
├── Consider alternative approaches
└── Discuss trade-offs
```

> **Final Insight** : Master these patterns because they appear in countless variations. The key is recognizing when a problem has optimal substructure and overlapping subproblems - the hallmarks of dynamic programming.

These two problems form the foundation for understanding more complex DP problems you'll encounter in FAANG interviews. The thinking process - breaking down the problem, identifying the state, and building the solution incrementally - is more valuable than memorizing the code.
