# String Dynamic Programming: Mastering LCS and Palindromic Subsequences for FAANG Interviews

Dynamic Programming on strings represents one of the most elegant intersections of algorithmic thinking and practical problem-solving. Let's build this understanding from the ground up, as if we're discovering these concepts for the first time.

## Understanding the Foundation: What Makes String DP Special?

Before diving into specific algorithms, we need to understand why strings require a different approach than other data structures.

> **Core Insight** : Strings have an inherent sequential nature where the *order* and *position* of characters matter immensely. Unlike arrays of numbers where we might only care about values, strings carry meaning through their sequence.

### The Building Blocks of String DP

**First Principle #1: Subproblem Definition**
In string DP, our subproblems almost always involve:

* Prefixes of strings (first i characters)
* Suffixes of strings (last i characters)
* Substrings (characters from position i to j)

**First Principle #2: State Representation**
We typically use 2D tables where:

* `dp[i][j]` represents some property involving the first `i` characters of one string and first `j` characters of another
* Or `dp[i][j]` represents some property of substring from index `i` to `j`

Let's see how these principles manifest in real problems.

---

## Longest Common Subsequence (LCS): The Foundation Stone

### Understanding Subsequences vs Substrings

Before we code anything, let's clarify this crucial distinction:

> **Subsequence** : Characters that appear in the same relative order, but not necessarily consecutive.
>
> **Substring** : Characters that appear consecutively in the original string.

 **Example** :

* String: "ABCDE"
* Subsequence: "ACE" (positions 0, 2, 4)
* Substring: "BCD" (positions 1, 2, 3)

### The LCS Problem Statement

Given two strings, find the length of their longest common subsequence.

 **Example** :

```
String 1: "ABCDGH"
String 2: "AEDFHR"
LCS: "ADH" (length = 3)
```

### Building the Solution from First Principles

Let's think about this step by step:

1. **Base Case** : If either string is empty, LCS length is 0
2. **Recursive Relationship** : For any two characters at current positions:

* If they match: LCS length = 1 + LCS of remaining parts
* If they don't match: LCS length = max(LCS excluding current char from string1, LCS excluding current char from string2)

Here's how we translate this thinking into code:

```python
def lcs_length(text1, text2):
    """
    Find the length of longest common subsequence between two strings.
  
    Approach: We'll build a 2D table where dp[i][j] represents
    the LCS length between first i characters of text1 and 
    first j characters of text2.
    """
    m, n = len(text1), len(text2)
  
    # Create DP table with extra row/column for empty string cases
    # dp[i][j] = LCS length of text1[0:i] and text2[0:j]
    dp = [[0] * (n + 1) for _ in range(m + 1)]
  
    # Fill the table using our recursive relationship
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            # Current characters (subtract 1 for 0-based indexing)
            char1 = text1[i - 1]
            char2 = text2[j - 1]
          
            if char1 == char2:
                # Characters match: add 1 to LCS of previous parts
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                # Characters don't match: take maximum of two possibilities
                # Either exclude current char from text1 OR exclude from text2
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
  
    return dp[m][n]

# Test our function
result = lcs_length("ABCDGH", "AEDFHR")
print(f"LCS length: {result}")  # Output: 3
```

### Visualizing the DP Table

Let's trace through our example to see how the table fills:

```
       ""  A   E   D   F   H   R
    ""  0   0   0   0   0   0   0
    A   0   1   1   1   1   1   1
    B   0   1   1   1   1   1   1
    C   0   1   1   1   1   1   1
    D   0   1   1   2   2   2   2
    G   0   1   1   2   2   2   2
    H   0   1   1   2   2   3   3
```

> **Key Observation** : Each cell represents the best we can do with the characters available up to that point. The final answer accumulates all our optimal local decisions.

### Reconstructing the Actual LCS

Finding the length is often not enough in interviews. Let's enhance our solution to return the actual subsequence:

```python
def lcs_with_string(text1, text2):
    """
    Returns both the length and the actual LCS string.
    We'll use the same DP approach but track how we built the solution.
    """
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
  
    # Build the DP table (same as before)
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = 1 + dp[i - 1][j - 1]
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
  
    # Reconstruct the LCS by backtracking
    lcs = []
    i, j = m, n
  
    while i > 0 and j > 0:
        if text1[i - 1] == text2[j - 1]:
            # This character is part of LCS
            lcs.append(text1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] > dp[i][j - 1]:
            # We got here from dp[i-1][j]
            i -= 1
        else:
            # We got here from dp[i][j-1]
            j -= 1
  
    # LCS was built backwards, so reverse it
    return dp[m][n], ''.join(reversed(lcs))

length, subsequence = lcs_with_string("ABCDGH", "AEDFHR")
print(f"LCS: '{subsequence}' with length {length}")  # Output: LCS: 'ADH' with length 3
```

> **Interview Tip** : The backtracking approach demonstrates deep understanding of how DP solutions are constructed. This technique applies to many DP problems where you need to reconstruct the optimal solution.

---

## Palindromic Subsequences: Building on LCS Foundations

Now let's explore palindromic subsequences, which builds beautifully on our LCS understanding.

### Longest Palindromic Subsequence (LPS)

 **Problem** : Given a string, find the length of its longest palindromic subsequence.

 **Key Insight** : The LPS of string `s` is the same as the LCS between `s` and its reverse!

> **Why this works** : A palindrome reads the same forwards and backwards. So if we find the longest common subsequence between a string and its reverse, we're finding the longest sequence that appears in the same order in both directions - which is exactly a palindrome!

```python
def lps_using_lcs(s):
    """
    Find longest palindromic subsequence using LCS approach.
  
    The insight: LPS(s) = LCS(s, reverse(s))
    This works because a palindrome must read the same forwards and backwards.
    """
    return lcs_length(s, s[::-1])

# Test the function
result = lps_using_lcs("bbbab")
print(f"LPS length: {result}")  # Output: 4 (subsequence: "bbbb")
```

### Direct DP Approach for LPS

While the LCS approach is clever, let's also understand the direct DP approach:

```python
def lps_direct(s):
    """
    Direct DP approach for longest palindromic subsequence.
  
    dp[i][j] represents the length of LPS in substring s[i:j+1]
    """
    n = len(s)
    # dp[i][j] = LPS length in substring from index i to j (inclusive)
    dp = [[0] * n for _ in range(n)]
  
    # Base case: single characters are palindromes of length 1
    for i in range(n):
        dp[i][i] = 1
  
    # Fill for substrings of length 2 to n
    for length in range(2, n + 1):  # substring length
        for i in range(n - length + 1):
            j = i + length - 1  # ending index
          
            if s[i] == s[j]:
                if length == 2:
                    # Two identical characters
                    dp[i][j] = 2
                else:
                    # Add 2 to the LPS of inner substring
                    dp[i][j] = 2 + dp[i + 1][j - 1]
            else:
                # Take maximum: either exclude left or right character
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
  
    return dp[0][n - 1]

result = lps_direct("bbbab")
print(f"LPS length (direct): {result}")  # Output: 4
```

### Visualizing LPS DP Table

For string "bbbab", our DP table looks like:

```
    b   b   b   a   b
b   1   2   3   3   4
b       1   2   2   3
b           1   1   3
a               1   1
b                   1
```

> **Pattern Recognition** : Notice how we fill the table diagonally. This is because we're building longer substrings from shorter ones - a classic interval DP pattern.

---

## Advanced Variations and Interview Patterns

### Counting Palindromic Subsequences

Sometimes interviews ask for the count of palindromic subsequences, not just the longest:

```python
def count_palindromic_subsequences(s):
    """
    Count total number of palindromic subsequences.
  
    dp[i][j] = count of palindromic subsequences in s[i:j+1]
    """
    n = len(s)
    dp = [[0] * n for _ in range(n)]
  
    # Single characters
    for i in range(n):
        dp[i][i] = 1
  
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
          
            if s[i] == s[j]:
                # All subsequences from inner + new palindromes + individual chars
                dp[i][j] = 2 * dp[i + 1][j - 1] + 2
            else:
                # Remove double counting
                dp[i][j] = dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1]
  
    return dp[0][n - 1]
```

### Space Optimization Techniques

> **Interview Excellence** : Showing space optimization demonstrates advanced understanding and is often the difference between good and great candidates.

For LCS, we can optimize from O(mn) to O(min(m,n)) space:

```python
def lcs_space_optimized(text1, text2):
    """
    Space-optimized LCS using only two arrays instead of full 2D table.
  
    Key insight: We only need the previous row to compute current row.
    """
    # Ensure text1 is the shorter string for better space efficiency
    if len(text1) > len(text2):
        text1, text2 = text2, text1
  
    m, n = len(text1), len(text2)
  
    # Only need current and previous row
    prev = [0] * (m + 1)
    curr = [0] * (m + 1)
  
    for j in range(1, n + 1):
        for i in range(1, m + 1):
            if text1[i - 1] == text2[j - 1]:
                curr[i] = 1 + prev[i - 1]
            else:
                curr[i] = max(prev[i], curr[i - 1])
      
        # Swap arrays for next iteration
        prev, curr = curr, prev
  
    return prev[m]
```

---

## Interview Strategy and Common Patterns

### Pattern Recognition Framework

> **Master Key** : Most string DP problems follow these patterns:
>
> 1. **Matching Pattern** : Compare characters from two strings (LCS family)
> 2. **Interval Pattern** : Work with substrings of varying lengths (Palindrome family)
> 3. **Transform Pattern** : Convert one string to another (Edit Distance family)

### Time and Space Complexity Analysis

 **LCS Analysis** :

* Time: O(mn) where m, n are string lengths
* Space: O(mn) for basic version, O(min(m,n)) for optimized
* The nested loops are necessary because each subproblem depends on multiple previous subproblems

 **LPS Analysis** :

* Time: O(n²) where n is string length
* Space: O(n²) for basic version
* We examine all possible substrings, hence n² subproblems

### Common Interview Variations

1. **Edit Distance** : Minimum operations to transform one string to another
2. **Palindrome Partitioning** : Minimum cuts to make all parts palindromes
3. **Distinct Subsequences** : Count how many times one string appears as subsequence in another
4. **Wildcard Matching** : String matching with * and ? wildcards

> **Pro Tip** : Once you master LCS and LPS, these variations become much more approachable because they share the same fundamental DP thinking patterns.

---

This foundation in string DP will serve you well across a wide range of interview problems. The key is recognizing these patterns and understanding how to adapt the basic frameworks to specific problem constraints.
