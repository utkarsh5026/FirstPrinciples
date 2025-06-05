# Regular Expression Matching and Pattern Recognition in FAANG Interviews

Let me take you on a journey through one of the most fascinating and frequently asked topics in FAANG interviews - regular expression matching and pattern recognition. We'll build this understanding from the ground up, exploring every concept in detail.

## Understanding the Fundamental Problem

> **Core Question** : How do we determine if a given text matches a specific pattern?

Before diving into complex algorithms, let's understand what we're trying to solve. Imagine you're building a search engine or a text validator. You need to answer questions like:

* Does this email address follow the correct format?
* Can we find all phone numbers in a document?
* Does a string match a specific pattern with wildcards?

### What Makes Pattern Matching Complex?

Pattern matching becomes challenging when we introduce **special characters** that have specific meanings:

```
Pattern: a*b
Meaning: Zero or more 'a's followed by 'b'
Matches: "b", "ab", "aab", "aaab"
Doesn't match: "a", "ba", "abb"
```

## Building Blocks: Understanding Pattern Elements

Let's establish our foundation by understanding the core pattern elements used in FAANG interviews:

> **Fundamental Pattern Elements** :
>
> * `.` (dot): Matches any single character
> * `*` (asterisk): Matches zero or more of the preceding element
> * `?` (question mark): Matches zero or one of the preceding element (in some variations)

### Example Walkthrough

Consider the pattern `a.c*`:

* `a`: Must match exactly 'a'
* `.`: Matches any single character
* `c*`: Matches zero or more 'c's

```
Valid matches:
- "abc" → a + b + c
- "axc" → a + x + c  
- "ax" → a + x + (zero c's)
- "abcccc" → a + b + cccc

Invalid matches:
- "ac" → missing the middle character
- "abcd" → 'd' doesn't match the pattern
```

## The Theoretical Foundation: Finite Automata

> **Key Insight** : Regular expression matching is fundamentally about state transitions in a finite automaton.

Think of pattern matching as a state machine where:

* Each state represents a position in our pattern
* Transitions occur when we consume characters from the input
* We succeed if we reach an accepting state after consuming all input

### Visualizing State Transitions

Let's trace through pattern `ab*c` with input "abbc":

```
States:
[Start] → [a matched] → [b* state] → [c matched/Accept]

Input: "abbc"
Step 1: 'a' → Move from Start to "a matched"
Step 2: 'b' → Stay in "b* state" (consume first b)
Step 3: 'b' → Stay in "b* state" (consume second b)  
Step 4: 'c' → Move to Accept state
Result: MATCH
```

## Dynamic Programming Approach: The Interview Solution

> **Core Strategy** : Use a 2D DP table where `dp[i][j]` represents whether the first `i` characters of text match the first `j` characters of pattern.

This is the most common approach tested in FAANG interviews because it demonstrates:

* Problem decomposition skills
* Understanding of overlapping subproblems
* Ability to handle edge cases systematically

### Implementation Framework

```python
def isMatch(text, pattern):
    m, n = len(text), len(pattern)
  
    # Create DP table with extra row/column for empty string cases
    dp = [[False] * (n + 1) for _ in range(m + 1)]
  
    # Base case: empty text matches empty pattern
    dp[0][0] = True
  
    # Handle patterns that can match empty string (like "a*b*")
    for j in range(2, n + 1):
        if pattern[j - 1] == '*':
            dp[0][j] = dp[0][j - 2]
  
    return dp[m][n]
```

Let me explain each part in detail:

**1. Table Initialization**

```python
dp = [[False] * (n + 1) for _ in range(m + 1)]
```

* We need `(m+1) × (n+1)` because we include empty string cases
* `dp[i][j]` answers: "Do first `i` characters of text match first `j` characters of pattern?"

**2. Base Case Handling**

```python
dp[0][0] = True  # Empty text matches empty pattern
```

**3. Empty Text Cases**

```python
for j in range(2, n + 1):
    if pattern[j - 1] == '*':
        dp[0][j] = dp[0][j - 2]
```

This handles patterns like `a*b*` which can match empty text by treating `a*` as "zero a's".

### Complete Solution with Detailed Logic

```python
def isMatch(text, pattern):
    m, n = len(text), len(pattern)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
  
    # Base case
    dp[0][0] = True
  
    # Handle empty text with patterns containing '*'
    for j in range(2, n + 1):
        if pattern[j - 1] == '*':
            dp[0][j] = dp[0][j - 2]
  
    # Fill the DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            current_text_char = text[i - 1]
            current_pattern_char = pattern[j - 1]
          
            if current_pattern_char == '*':
                # '*' applies to the character before it
                prev_pattern_char = pattern[j - 2]
              
                # Option 1: Use '*' as zero occurrences
                dp[i][j] = dp[i][j - 2]
              
                # Option 2: Use '*' as one or more occurrences
                if (prev_pattern_char == '.' or 
                    prev_pattern_char == current_text_char):
                    dp[i][j] = dp[i][j] or dp[i - 1][j]
          
            elif (current_pattern_char == '.' or 
                  current_pattern_char == current_text_char):
                # Direct character match or wildcard
                dp[i][j] = dp[i - 1][j - 1]
  
    return dp[m][n]
```

### Understanding the Star (*) Logic

> **Critical Insight** : The `*` operator gives us two choices at each step.

When we encounter `*`, we have two options:

**Option 1: Zero Occurrences**

```python
dp[i][j] = dp[i][j - 2]  # Skip the 'char*' pattern entirely
```

**Option 2: One or More Occurrences**

```python
if characters_match:
    dp[i][j] = dp[i][j] or dp[i - 1][j]  # Consume one text char, stay in pattern
```

### Tracing Through an Example

Let's trace `text = "aab"`, `pattern = "c*a*b"`:

```
DP Table Construction:
    ""  c  *  a  *  b
""   T  F  T  F  T  F
a    F  F  F  T  T  F  
a    F  F  F  F  T  F
b    F  F  F  F  F  T

Key steps:
- dp[0][2] = T (c* matches empty)
- dp[0][4] = T (c*a* matches empty)  
- dp[1][3] = T (first 'a' matches 'a')
- dp[1][4] = T (a* can match one 'a')
- dp[2][4] = T (a* can match two 'a's)
- dp[3][5] = T (final 'b' matches 'b')
```

## Common FAANG Interview Variations

### 1. Wildcard Matching (LeetCode 44)

This variation uses `?` for single character and `*` for any sequence:

```python
def isMatchWildcard(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
  
    dp[0][0] = True
  
    # Handle leading '*' in pattern
    for j in range(1, n + 1):
        if p[j - 1] == '*':
            dp[0][j] = dp[0][j - 1]
  
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                # '*' can match empty or any sequence
                dp[i][j] = dp[i][j - 1] or dp[i - 1][j]
            elif p[j - 1] == '?' or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]
  
    return dp[m][n]
```

> **Key Difference** : In wildcard matching, `*` matches any sequence directly, not repetitions of the previous character.

### 2. Pattern Matching with Recursion + Memoization

```python
def isMatchRecursive(text, pattern):
    memo = {}
  
    def helper(i, j):
        if (i, j) in memo:
            return memo[(i, j)]
      
        # Base cases
        if j == len(pattern):
            return i == len(text)
      
        # Check if current characters match
        first_match = (i < len(text) and 
                      (pattern[j] == '.' or pattern[j] == text[i]))
      
        # Handle '*' in next position
        if j + 1 < len(pattern) and pattern[j + 1] == '*':
            result = (helper(i, j + 2) or  # Zero occurrences
                     (first_match and helper(i + 1, j)))  # One+ occurrences
        else:
            result = first_match and helper(i + 1, j + 1)
      
        memo[(i, j)] = result
        return result
  
    return helper(0, 0)
```

## Advanced Optimization Techniques

### Space Optimization

> **Insight** : We only need the previous row to compute the current row.

```python
def isMatchOptimized(text, pattern):
    m, n = len(text), len(pattern)
    prev = [False] * (n + 1)
    prev[0] = True
  
    # Initialize for empty text cases
    for j in range(2, n + 1):
        if pattern[j - 1] == '*':
            prev[j] = prev[j - 2]
  
    for i in range(1, m + 1):
        curr = [False] * (n + 1)
        for j in range(1, n + 1):
            if pattern[j - 1] == '*':
                curr[j] = curr[j - 2]
                if (pattern[j - 2] == '.' or 
                    pattern[j - 2] == text[i - 1]):
                    curr[j] = curr[j] or prev[j]
            elif (pattern[j - 1] == '.' or 
                  pattern[j - 1] == text[i - 1]):
                curr[j] = prev[j - 1]
        prev = curr
  
    return prev[n]
```

## Time and Space Complexity Analysis

> **Time Complexity** : O(m × n) where m = text length, n = pattern length
> **Space Complexity** : O(m × n) for basic DP, O(n) for optimized version

### Why This Complexity?

1. **Each cell computation** : O(1) - constant time operations
2. **Total cells** : m × n cells in our DP table
3. **Overall** : O(m × n) time complexity

The space can be optimized because we only reference the previous row and current row during computation.

## Interview Strategy and Common Pitfalls

### What Interviewers Look For

1. **Clear problem understanding** : Can you explain what the pattern means?
2. **Edge case handling** : Empty strings, invalid patterns
3. **Algorithm choice justification** : Why DP over recursion?
4. **Code clarity** : Clean, readable implementation
5. **Optimization awareness** : Can you improve space complexity?

### Common Mistakes to Avoid

```python
# ❌ Wrong: Forgetting empty string cases
dp[0][0] = True  # This is essential!

# ❌ Wrong: Incorrect '*' handling  
if pattern[j] == '*':  # Should be pattern[j-1] == '*'

# ❌ Wrong: Off-by-one errors
dp[i][j] = dp[i-1][j-1]  # Make sure indices are correct

# ✅ Correct approach shown in examples above
```

### Practice Problems for Mastery

> **Essential Problems** :
>
> 1. Regular Expression Matching (LeetCode 10)
> 2. Wildcard Matching (LeetCode 44)
> 3. Edit Distance (LeetCode 72) - related DP pattern
> 4. Longest Common Subsequence (LeetCode 1143) - foundational DP

This comprehensive understanding of regular expression matching will serve you well in FAANG interviews. The key is to master the underlying DP pattern, understand the state transitions clearly, and practice implementing clean, bug-free solutions.
