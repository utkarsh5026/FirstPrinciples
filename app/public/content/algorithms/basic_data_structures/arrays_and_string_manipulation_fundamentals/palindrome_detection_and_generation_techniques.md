# Palindrome Detection and Generation: A Complete DSA Guide for FAANG Interviews

## Understanding Palindromes from First Principles

> **Core Definition** : A palindrome is a sequence that reads the same forwards and backwards. The fundamental property is symmetry around a center point.

Let's start with the mathematical foundation. For any sequence of length `n`, element at position `i` must equal element at position `n-1-i` for all valid indices.

```javascript
// Mathematical representation
// For string s of length n:
// s[0] == s[n-1]
// s[1] == s[n-2]
// s[2] == s[n-3]
// ... and so on
```

### Types of Palindromes

 **Odd Length Palindromes** : Have a single center character

* Example: "racecar" (center: 'e')
* Pattern: `abc|d|cba`

 **Even Length Palindromes** : Have a center between two characters

* Example: "abba" (center: between 'b' and 'b')
* Pattern: `abc|cba`

---

## Detection Techniques: Building from Simple to Complex

### 1. Two-Pointer Approach (The Foundation)

> **First Principle** : If we compare characters moving inward from both ends simultaneously, any mismatch immediately disqualifies the palindrome.

```javascript
function isPalindrome(s) {
    let left = 0;
    let right = s.length - 1;
  
    while (left < right) {
        // Compare characters at symmetric positions
        if (s[left] !== s[right]) {
            return false;  // Mismatch found
        }
        left++;    // Move inward from start
        right--;   // Move inward from end
    }
    return true;  // All comparisons passed
}

// Example walkthrough with "racecar":
// Step 1: s[0]='r', s[6]='r' ✓ (left=1, right=5)
// Step 2: s[1]='a', s[5]='a' ✓ (left=2, right=4)  
// Step 3: s[2]='c', s[4]='c' ✓ (left=3, right=3)
// left >= right, so we're done - it's a palindrome!
```

 **Why this works** : We're essentially "folding" the string in half and checking if both halves match perfectly.

 **Time Complexity** : O(n) - we visit each character at most once
 **Space Complexity** : O(1) - only using two pointers

### 2. Recursive Approach (Divide and Conquer)

> **Recursive Insight** : A string is a palindrome if its first and last characters match AND the substring between them is also a palindrome.

```javascript
function isPalindromeRecursive(s, left = 0, right = s.length - 1) {
    // Base case: single character or empty string
    if (left >= right) {
        return true;
    }
  
    // Check outer characters
    if (s[left] !== s[right]) {
        return false;
    }
  
    // Recursively check inner substring
    return isPalindromeRecursive(s, left + 1, right - 1);
}

// Call stack for "aba":
// isPalindrome("aba", 0, 2) → s[0]='a', s[2]='a' ✓
//   → isPalindrome("aba", 1, 1) → left >= right, return true
//   → return true
```

 **Time Complexity** : O(n) - each character checked once
 **Space Complexity** : O(n) - recursion stack depth

---

## Advanced Detection Patterns

### 3. Handling Case-Insensitive and Alphanumeric-Only

> **Real-world Insight** : Interview problems often require ignoring case, spaces, and special characters.

```javascript
function isPalindromeAlphanumeric(s) {
    // Helper function to check if character is alphanumeric
    function isAlphanumeric(char) {
        return /[a-zA-Z0-9]/.test(char);
    }
  
    let left = 0;
    let right = s.length - 1;
  
    while (left < right) {
        // Skip non-alphanumeric from left
        while (left < right && !isAlphanumeric(s[left])) {
            left++;
        }
      
        // Skip non-alphanumeric from right  
        while (left < right && !isAlphanumeric(s[right])) {
            right--;
        }
      
        // Compare normalized characters
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
      
        left++;
        right--;
    }
    return true;
}

// Example: "A man, a plan, a canal: Panama"
// After normalization: "amanaplanacanalpanama" → palindrome!
```

### 4. Substring Palindrome Detection (Expand Around Centers)

> **Center Expansion Principle** : Every palindrome has a center. We can find all palindromes by expanding around each possible center.

```javascript
function findAllPalindromes(s) {
    const palindromes = [];
  
    function expandAroundCenter(left, right) {
        // Expand while characters match and indices are valid
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            palindromes.push(s.substring(left, right + 1));
            left--;
            right++;
        }
    }
  
    for (let i = 0; i < s.length; i++) {
        // Check for odd-length palindromes (center at i)
        expandAroundCenter(i, i);
      
        // Check for even-length palindromes (center between i and i+1)
        expandAroundCenter(i, i + 1);
    }
  
    return palindromes;
}

// Example with "aba":
// i=0: expandAroundCenter(0,0) → "a"
// i=0: expandAroundCenter(0,1) → no match
// i=1: expandAroundCenter(1,1) → "b", then "aba"  
// i=1: expandAroundCenter(1,2) → no match
// i=2: expandAroundCenter(2,2) → "a"
// Result: ["a", "b", "aba", "a"]
```

---

## Palindrome Generation Techniques

### 5. Generating Palindromes of Specific Length

> **Generation Strategy** : Build palindromes by mirroring characters around a center point.

```javascript
function generatePalindromes(length) {
    const result = [];
    const chars = 'abcdefghijklmnopqrstuvwxyz';
  
    function generateHelper(current) {
        // Base case: reached desired length
        if (current.length === length) {
            result.push(current);
            return;
        }
      
        // If we're building the first half
        if (current.length < Math.ceil(length / 2)) {
            // Try each character
            for (let char of chars) {
                generateHelper(current + char);
            }
        } else {
            // Mirror the character from symmetric position
            const mirrorIndex = length - 1 - current.length;
            const mirrorChar = current[mirrorIndex];
            generateHelper(current + mirrorChar);
        }
    }
  
    generateHelper('');
    return result;
}

// For length 3, generates: "aaa", "aba", "aca", ..., "zzz"
// For length 4, generates: "aaaa", "abba", "acca", ..., "zzzz"
```

### 6. Next Palindrome Generation

> **Mathematical Insight** : To find the next palindrome, we increment the left half and mirror it to the right half.

```javascript
function nextPalindrome(num) {
    const digits = num.toString().split('').map(Number);
    const n = digits.length;
  
    // Helper to check if current number is palindrome
    function isPalin(arr) {
        let l = 0, r = arr.length - 1;
        while (l < r) {
            if (arr[l] !== arr[r]) return false;
            l++; r--;
        }
        return true;
    }
  
    // Helper to increment number represented as array
    function increment(arr, pos) {
        if (pos < 0) {
            // Need to add a digit (like 999 → 1001)
            return [1, ...new Array(arr.length + 1).fill(0), 1];
        }
      
        if (arr[pos] < 9) {
            arr[pos]++;
            return arr;
        } else {
            arr[pos] = 0;
            return increment(arr, pos - 1);
        }
    }
  
    // Mirror left half to right half
    function mirrorLeftToRight(arr) {
        const result = [...arr];
        const mid = Math.floor(arr.length / 2);
      
        for (let i = 0; i < mid; i++) {
            result[arr.length - 1 - i] = result[i];
        }
        return result;
    }
  
    // First, try mirroring current number
    let mirrored = mirrorLeftToRight(digits);
    let mirroredNum = parseInt(mirrored.join(''));
  
    if (mirroredNum > num) {
        return mirroredNum;
    }
  
    // If mirrored is not greater, increment left half
    const mid = Math.floor(n / 2);
    const leftHalf = digits.slice(0, n % 2 === 0 ? mid : mid + 1);
    const incremented = increment(leftHalf, leftHalf.length - 1);
  
    if (incremented.length > leftHalf.length) {
        return parseInt(incremented.join(''));
    }
  
    const nextPalin = mirrorLeftToRight([...incremented, 
        ...new Array(n - incremented.length).fill(0)]);
  
    return parseInt(nextPalin.join(''));
}

// Example: nextPalindrome(1234)
// Step 1: Mirror 1234 → 1221, but 1221 < 1234
// Step 2: Increment left half: 12 → 13  
// Step 3: Mirror: 13|31 → 1331
```

---

## Common FAANG Interview Patterns

### 7. Longest Palindromic Substring (Manacher's Algorithm)

> **Advanced Technique** : Manacher's algorithm finds the longest palindromic substring in linear time by reusing previous computations.

```javascript
function longestPalindrome(s) {
    // Preprocess: insert '#' between characters
    // "aba" → "#a#b#a#"  
    // This makes all palindromes odd-length
    const processed = '#' + s.split('').join('#') + '#';
    const n = processed.length;
    const radius = new Array(n).fill(0);  // radius[i] = radius of palindrome at i
  
    let center = 0;    // center of rightmost palindrome found
    let rightmost = 0; // rightmost boundary of palindromes found
    let maxLen = 0;    // length of longest palindrome
    let maxCenter = 0; // center of longest palindrome
  
    for (let i = 0; i < n; i++) {
        // If i is within rightmost boundary, we can reuse previous computation
        if (i < rightmost) {
            const mirror = 2 * center - i;  // mirror of i with respect to center
            radius[i] = Math.min(rightmost - i, radius[mirror]);
        }
      
        // Try to expand palindrome centered at i
        while (i + radius[i] + 1 < n && 
               i - radius[i] - 1 >= 0 && 
               processed[i + radius[i] + 1] === processed[i - radius[i] - 1]) {
            radius[i]++;
        }
      
        // Update rightmost boundary if we expanded beyond it
        if (i + radius[i] > rightmost) {
            center = i;
            rightmost = i + radius[i];
        }
      
        // Track longest palindrome found
        if (radius[i] > maxLen) {
            maxLen = radius[i];
            maxCenter = i;
        }
    }
  
    // Extract the actual palindrome from original string
    const start = (maxCenter - maxLen) / 2;
    return s.substring(start, start + maxLen);
}
```

### 8. Palindrome Partitioning

> **Dynamic Programming Insight** : We can break the problem into subproblems - if we know all palindromic partitions of a substring, we can build solutions for larger strings.

```javascript
function palindromePartitioning(s) {
    const result = [];
    const currentPartition = [];
  
    // Precompute palindrome status for all substrings
    const n = s.length;
    const isPalin = Array(n).fill(null).map(() => Array(n).fill(false));
  
    // Every single character is a palindrome
    for (let i = 0; i < n; i++) {
        isPalin[i][i] = true;
    }
  
    // Check for 2-character palindromes
    for (let i = 0; i < n - 1; i++) {
        if (s[i] === s[i + 1]) {
            isPalin[i][i + 1] = true;
        }
    }
  
    // Check for palindromes of length 3 and more
    for (let len = 3; len <= n; len++) {
        for (let i = 0; i <= n - len; i++) {
            const j = i + len - 1;
            if (s[i] === s[j] && isPalin[i + 1][j - 1]) {
                isPalin[i][j] = true;
            }
        }
    }
  
    function backtrack(start) {
        // Base case: reached end of string
        if (start === s.length) {
            result.push([...currentPartition]);
            return;
        }
      
        // Try all possible endings for current partition
        for (let end = start; end < s.length; end++) {
            if (isPalin[start][end]) {
                // Current substring is palindrome
                currentPartition.push(s.substring(start, end + 1));
                backtrack(end + 1);  // Recurse for remaining string
                currentPartition.pop();  // Backtrack
            }
        }
    }
  
    backtrack(0);
    return result;
}

// Example: palindromePartitioning("aab")
// Returns: [["a","a","b"], ["aa","b"]]
```

---

## Performance Analysis and Optimization

### Time Complexity Summary

```
Detection Algorithms:
├── Two Pointer: O(n)
├── Recursive: O(n) 
├── Expand Around Centers: O(n²)
└── Manacher's: O(n)

Generation Algorithms:
├── Fixed Length: O(26^(n/2))
├── Next Palindrome: O(n)
└── All Partitions: O(n × 2^n)
```

### Space Complexity Patterns

> **Memory Trade-offs** : Different approaches have different space requirements based on their strategy.

**Iterative approaches** (Two-pointer): O(1) space
 **Recursive approaches** : O(n) space for call stack

 **Dynamic Programming approaches** : O(n²) space for memoization
**Preprocessing approaches** (Manacher's): O(n) space for auxiliary arrays

---

## Interview Tips and Edge Cases

### Critical Edge Cases to Consider

```javascript
// Empty and single character
isPalindrome("")     // → true (empty string convention)
isPalindrome("a")    // → true

// Case sensitivity  
isPalindrome("Aa")   // → false (if case-sensitive)

// Special characters
isPalindrome("A man, a plan, a canal: Panama")  // → depends on requirements

// Unicode and multi-byte characters
isPalindrome("不不")  // → true (be careful with string indexing)

// Very long strings (performance considerations)
isPalindrome("a".repeat(1000000))  // → should complete quickly
```

### Common Interview Variations

> **Pattern Recognition** : Most palindrome problems follow these templates, with small modifications for specific constraints.

1. **"Is Valid Palindrome"** → Two-pointer technique
2. **"Longest Palindromic Substring"** → Manacher's or expand around centers
3. **"Palindrome Partitioning"** → Backtracking with memoization
4. **"Shortest Palindrome"** → KMP algorithm with reverse string
5. **"Valid Palindrome II"** → Two-pointer with one deletion allowed

The key to mastering palindrome problems is understanding that they all rely on the fundamental symmetry property, and choosing the right technique based on the specific constraints and requirements of each problem.
