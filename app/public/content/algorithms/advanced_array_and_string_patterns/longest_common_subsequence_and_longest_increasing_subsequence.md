# Understanding Longest Common Subsequence and Longest Increasing Subsequence: A FAANG Interview Deep Dive

## What is a Subsequence? Building from First Principles

Before we dive into the specific algorithms, let's establish the fundamental concept that underlies both problems.

> **A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.**

Think of it like this: imagine you have a string of beads on a wire. A subsequence would be what you get if you cut out some beads but keep the remaining ones in their original order.

**Example with string "ABCDE":**

* Valid subsequences: "A", "AB", "ACE", "ABCDE", "BD", "" (empty)
* Invalid subsequences: "BA" (wrong order), "AF" (F doesn't exist)

This concept is crucial because both LCS and LIS deal with finding optimal subsequences under different constraints.

## Longest Common Subsequence (LCS): Finding Shared Patterns

### The Core Problem

> **LCS finds the longest subsequence that appears in the same order in two or more sequences.**

Imagine you're comparing two DNA strands or finding similarities between two documents. LCS helps identify the common patterns.

**Real-world analogy:** Think of LCS like finding the longest series of dance moves that two dancers perform in the same order, even if they have different moves in between.

### Step-by-Step Example

Let's work with strings `X = "AGGTAB"` and `Y = "GXTXAYB"`:

```
X: A G G T A B
Y: G X T X A Y B
```

Let's trace through manually first:

* 'G' appears in both (position 1 in X, position 0 in Y)
* 'T' appears in both (position 3 in X, position 2 in Y)
* 'A' appears in both (position 4 in X, position 4 in Y)
* 'B' appears in both (position 5 in X, position 6 in Y)

So "GTAB" is a common subsequence of length 4.

### The Dynamic Programming Approach

> **Key Insight: LCS exhibits optimal substructure - the LCS of two strings can be built from the LCS of their prefixes.**

Let's build a 2D table where `dp[i][j]` represents the length of LCS of first `i` characters of X and first `j` characters of Y.

**The recurrence relation:**

```
If X[i-1] == Y[j-1]:
    dp[i][j] = dp[i-1][j-1] + 1
Else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
```

Here's the step-by-step DP table construction:

```
    ""  G  X  T  X  A  Y  B
""   0  0  0  0  0  0  0  0
A    0  0  0  0  0  1  1  1
G    0  1  1  1  1  1  1  1
G    0  1  1  1  1  1  1  1
T    0  1  1  2  2  2  2  2
A    0  1  1  2  2  3  3  3
B    0  1  1  2  2  3  3  4
```

### Implementation with Detailed Explanation

```python
def longest_common_subsequence(text1, text2):
    """
    Find the length of longest common subsequence between two strings.
  
    Time: O(m*n), Space: O(m*n)
    """
    m, n = len(text1), len(text2)
  
    # Create DP table with extra row/column for empty string cases
    dp = [[0] * (n + 1) for _ in range(m + 1)]
  
    # Fill the DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            # If characters match, extend the LCS from diagonal
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                # Take maximum from either excluding current char from text1 or text2
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  
    return dp[m][n]

# Example usage
result = longest_common_subsequence("AGGTAB", "GXTXAYB")
print(f"LCS length: {result}")  # Output: 4
```

**Code Breakdown:**

* **Line 7:** We create a table with `(m+1) × (n+1)` dimensions to handle empty string cases
* **Line 12:** When characters match, we add 1 to the LCS length from the diagonal cell
* **Line 15:** When they don't match, we take the maximum from either direction (excluding one character)

### Reconstructing the Actual LCS

```python
def get_lcs_string(text1, text2):
    """
    Returns the actual LCS string, not just its length.
    """
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
  
    # Fill DP table (same as before)
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  
    # Backtrack to find the actual LCS
    lcs = []
    i, j = m, n
  
    while i > 0 and j > 0:
        # If characters match, it's part of LCS
        if text1[i-1] == text2[j-1]:
            lcs.append(text1[i-1])
            i -= 1
            j -= 1
        # Move in direction of larger value
        elif dp[i-1][j] > dp[i][j-1]:
            i -= 1
        else:
            j -= 1
  
    return ''.join(reversed(lcs))
```

> **Important: We build the LCS backwards during backtracking, so we reverse it at the end.**

## Longest Increasing Subsequence (LIS): Finding Growth Patterns

### The Core Problem

> **LIS finds the longest subsequence where elements are in strictly increasing order.**

Think of LIS like finding the longest upward trend in stock prices, or the longest chain of dominoes of increasing height.

### Example Walkthrough

Consider array `[10, 9, 2, 5, 3, 7, 101, 18]`:

Let's trace through possible increasing subsequences:

* `[2, 5, 7, 101]` - length 4
* `[2, 3, 7, 18]` - length 4
* `[2, 5, 7, 18]` - length 4

The LIS has length 4.

### Dynamic Programming Solution

> **Key Insight: For each position, we can extend any previous increasing subsequence that ends with a smaller value.**

```python
def length_of_lis_dp(nums):
    """
    DP approach: O(n²) time, O(n) space
  
    dp[i] = length of LIS ending at index i
    """
    if not nums:
        return 0
  
    n = len(nums)
    # Each element forms a subsequence of length 1
    dp = [1] * n
  
    for i in range(1, n):
        # Check all previous elements
        for j in range(i):
            # If current element is larger, we can extend that subsequence
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
  
    # Return the maximum LIS length found
    return max(dp)

# Example
nums = [10, 9, 2, 5, 3, 7, 101, 18]
print(f"LIS length: {length_of_lis_dp(nums)}")  # Output: 4
```

**Code Explanation:**

* **Line 8:** Initialize dp array where each element can form a subsequence of length 1
* **Line 13:** For each element, check all previous elements
* **Line 15:** If previous element is smaller, we can extend its LIS
* **Line 16:** Take the maximum possible extension

Let's trace through the DP array:

```
nums: [10,  9,  2,  5,  3,  7, 101, 18]
dp:   [ 1,  1,  1,  2,  2,  3,   4,  4]
```

### Optimized Binary Search Solution

> **Advanced Optimization: We can use binary search to achieve O(n log n) time complexity.**

```python
def length_of_lis_optimized(nums):
    """
    Binary search approach: O(n log n) time, O(n) space
  
    The key insight: maintain an array of smallest tail elements
    for increasing subsequences of each length.
    """
    if not nums:
        return 0
  
    # tails[i] = smallest tail of all increasing subsequences of length i+1
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
      
        # If num is larger than all elements, append it
        if left == len(tails):
            tails.append(num)
        else:
            # Replace the element at position 'left'
            tails[left] = num
  
    return len(tails)
```

**Why this works:**

* **tails[i]** stores the smallest ending element of all increasing subsequences of length `i+1`
* When we see a new number, we find where it belongs using binary search
* If it's larger than everything, it extends our longest subsequence
* If not, it potentially creates a better (smaller) ending for some length

## FAANG Interview Context and Variations

### Common Interview Patterns

> **In FAANG interviews, these problems often appear in disguised forms or with additional constraints.**

**LCS Variations:**

1. **Edit Distance** : Find minimum operations to transform one string to another
2. **Palindromic Subsequences** : Find LCS of string with its reverse
3. **String Matching** : Pattern matching with wildcards

**LIS Variations:**

1. **Box Stacking** : 3D version where you stack boxes optimally
2. **Russian Doll Envelopes** : 2D LIS problem
3. **Building Bridges** : Connect points without crossing lines

### Space Optimization Techniques

```python
def lcs_space_optimized(text1, text2):
    """
    Space optimized LCS: O(min(m,n)) space instead of O(m*n)
  
    Key insight: We only need the previous row to compute current row
    """
    # Make text1 the shorter string to optimize space
    if len(text1) > len(text2):
        text1, text2 = text2, text1
  
    m, n = len(text1), len(text2)
  
    # Only need two rows: previous and current
    prev = [0] * (m + 1)
    curr = [0] * (m + 1)
  
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if text2[i-1] == text1[j-1]:
                curr[j] = prev[j-1] + 1
            else:
                curr[j] = max(prev[j], curr[j-1])
      
        # Swap rows for next iteration
        prev, curr = curr, prev
  
    return prev[m]
```

### Interview Tips and Common Mistakes

> **Key Interview Insights:**

1. **Always clarify the problem** : Ask about duplicates, empty inputs, and edge cases
2. **Start with brute force** : Explain the recursive approach first, then optimize
3. **Draw the DP table** : Visual representation helps both you and the interviewer
4. **Discuss trade-offs** : Mention time vs space complexity options

**Common Pitfalls:**

* Forgetting to handle empty strings/arrays
* Off-by-one errors in indexing
* Not considering the difference between "subsequence" and "substring"
* Mixing up the recurrence relations between LCS and LIS

### Complexity Analysis Summary

| Algorithm           | Time Complexity | Space Complexity | Best For          |
| ------------------- | --------------- | ---------------- | ----------------- |
| LCS (DP)            | O(m × n)       | O(m × n)        | General case      |
| LCS (Optimized)     | O(m × n)       | O(min(m,n))      | Space constraints |
| LIS (DP)            | O(n²)          | O(n)             | Small arrays      |
| LIS (Binary Search) | O(n log n)      | O(n)             | Large arrays      |

> **Remember: In FAANG interviews, demonstrating understanding of when to use each approach and their trade-offs is often more important than just coding the solution.**

Both LCS and LIS are fundamental building blocks for more complex dynamic programming problems. Master these patterns, and you'll be well-equipped to tackle the variations that commonly appear in technical interviews.
