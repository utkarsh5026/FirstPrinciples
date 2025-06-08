# String Hashing and Rolling Hash: From First Principles to FAANG Mastery

## Understanding the Foundation: Why Do We Need String Hashing?

Let's start from the absolute beginning. Imagine you're comparing two strings to see if they're equal:

```
String A: "hello"
String B: "hello"
```

The naive approach would be to compare character by character:

* h == h ✓
* e == e ✓
* l == l ✓
* l == l ✓
* o == o ✓

This takes **O(n)** time where n is the length of the string. Now imagine you need to do this comparison millions of times, or you're searching for a pattern in a massive text. The time complexity becomes prohibitive.

> **Core Insight** : String hashing transforms a string into a single numerical value (hash) that can be compared in O(1) time instead of O(n) time.

## First Principles: What Is a Hash Function?

A hash function is a mathematical function that takes an input of arbitrary size and produces a fixed-size output. For strings, we want:

1. **Deterministic** : Same string always produces same hash
2. **Fast computation** : O(n) to compute initially
3. **Good distribution** : Different strings should produce different hashes
4. **Collision resistance** : Minimize chances of different strings having same hash

## The Polynomial Rolling Hash: Building From Scratch

The most common string hashing technique uses polynomial hashing. Let's build it step by step.

### Step 1: The Basic Concept

Think of a string as a number in base-p representation, where p is a prime number:

For string "abc":

```
'a' = 1, 'b' = 2, 'c' = 3
hash = 1×p² + 2×p¹ + 3×p⁰
```

### Step 2: Why Use a Prime Base?

> **Mathematical Foundation** : Prime numbers reduce hash collisions because they have no common factors with most other numbers, creating better distribution.

Common choices: p = 31, 37, 53, 97, 101

### Step 3: Handling Large Numbers

Since hash values can become enormous, we use modular arithmetic:

```
hash = (hash_value) mod M
```

Where M is a large prime (typically 10⁹ + 7 or 10⁹ + 9).

### Step 4: Implementation of Basic String Hashing

```cpp
class StringHasher {
private:
    static const int BASE = 31;
    static const int MOD = 1000000007;
  
public:
    long long computeHash(const string& s) {
        long long hash = 0;
        long long power = 1;
      
        // Process each character from right to left
        for (int i = s.length() - 1; i >= 0; i--) {
            // Convert character to number (a=1, b=2, etc.)
            int charValue = s[i] - 'a' + 1;
          
            // Add contribution of this character
            hash = (hash + (charValue * power) % MOD) % MOD;
          
            // Update power for next position
            power = (power * BASE) % MOD;
        }
      
        return hash;
    }
};
```

 **Code Explanation** :

* We iterate from right to left to build the polynomial
* `charValue = s[i] - 'a' + 1` converts 'a' to 1, 'b' to 2, etc.
* We use modular arithmetic at each step to prevent overflow
* `power` keeps track of BASE^position

Let's trace through "abc":

```
i=2: char='c'(3), power=1, hash = 0 + 3×1 = 3
i=1: char='b'(2), power=31, hash = 3 + 2×31 = 65
i=0: char='a'(1), power=961, hash = 65 + 1×961 = 1026
```

## The Rolling Hash Revolution

Now comes the real magic. What if we want to find all occurrences of pattern "abc" in text "xabcabc"?

Basic approach: Compute hash of "abc", then compute hash of each 3-character substring:

* "xab" → compute hash
* "abc" → compute hash
* "bca" → compute hash
* "cab" → compute hash
* "abc" → compute hash

This is still O(n×m) where n is text length and m is pattern length.

> **Rolling Hash Breakthrough** : We can compute the hash of the next substring in O(1) time by "rolling" the previous hash!

### The Rolling Hash Formula

Given a string's hash, we can compute the next substring's hash by:

1. **Remove** the leftmost character's contribution
2. **Shift** all remaining characters one position left
3. **Add** the new rightmost character

Mathematically:

```
new_hash = ((old_hash - leftChar × BASE^(m-1)) × BASE + rightChar) mod MOD
```

### Rolling Hash Implementation

```cpp
class RollingHash {
private:
    static const int BASE = 31;
    static const int MOD = 1000000007;
    long long basePower;  // BASE^(pattern_length-1)
  
public:
    RollingHash(int patternLength) {
        // Precompute BASE^(patternLength-1)
        basePower = 1;
        for (int i = 0; i < patternLength - 1; i++) {
            basePower = (basePower * BASE) % MOD;
        }
    }
  
    long long getInitialHash(const string& text, int start, int length) {
        long long hash = 0;
        long long power = 1;
      
        // Build hash from right to left
        for (int i = start + length - 1; i >= start; i--) {
            int charValue = text[i] - 'a' + 1;
            hash = (hash + (charValue * power) % MOD) % MOD;
            power = (power * BASE) % MOD;
        }
      
        return hash;
    }
  
    long long rollHash(long long currentHash, char oldChar, char newChar) {
        // Remove contribution of old leftmost character
        int oldCharValue = oldChar - 'a' + 1;
        currentHash = (currentHash - (oldCharValue * basePower) % MOD + MOD) % MOD;
      
        // Shift left (multiply by BASE)
        currentHash = (currentHash * BASE) % MOD;
      
        // Add new rightmost character
        int newCharValue = newChar - 'a' + 1;
        currentHash = (currentHash + newCharValue) % MOD;
      
        return currentHash;
    }
};
```

 **Code Breakdown** :

* `basePower` stores BASE^(m-1) to quickly remove leftmost character
* `getInitialHash` computes the first window's hash
* `rollHash` transforms one hash to the next in O(1)
* We add MOD before modulo to handle negative numbers

### Rolling Hash in Action: Pattern Matching

```cpp
vector<int> findPattern(const string& text, const string& pattern) {
    vector<int> matches;
  
    if (pattern.length() > text.length()) return matches;
  
    RollingHash roller(pattern.length());
  
    // Compute pattern hash
    long long patternHash = roller.getInitialHash(pattern, 0, pattern.length());
  
    // Compute initial window hash  
    long long windowHash = roller.getInitialHash(text, 0, pattern.length());
  
    // Check first window
    if (windowHash == patternHash) {
        matches.push_back(0);
    }
  
    // Roll through remaining positions
    for (int i = 1; i <= text.length() - pattern.length(); i++) {
        // Roll the hash
        windowHash = roller.rollHash(
            windowHash,
            text[i - 1],        // character leaving window
            text[i + pattern.length() - 1]  // character entering window
        );
      
        // Check for match
        if (windowHash == patternHash) {
            matches.push_back(i);
        }
    }
  
    return matches;
}
```

Let's trace through finding "abc" in "xabcdef":

```
Pattern "abc" hash: 1026
Text positions:
i=0: "xab" → hash_0
i=1: "abc" → roll(hash_0, 'x', 'c') → if equals 1026, match!
i=2: "bcd" → roll(hash_1, 'a', 'd')
i=3: "cde" → roll(hash_2, 'b', 'e')
```

## Advanced Applications in FAANG Interviews

### 1. Longest Common Substring

> **Problem** : Find the longest substring that appears in both strings.

 **Approach** : Use binary search on answer length + rolling hash for verification.

```cpp
bool hasCommonSubstring(const string& s1, const string& s2, int length) {
    if (length == 0) return true;
  
    unordered_set<long long> hashes;
    RollingHash roller(length);
  
    // Generate all hashes of length 'length' from s1
    long long hash = roller.getInitialHash(s1, 0, length);
    hashes.insert(hash);
  
    for (int i = 1; i <= s1.length() - length; i++) {
        hash = roller.rollHash(hash, s1[i-1], s1[i+length-1]);
        hashes.insert(hash);
    }
  
    // Check if any substring of s2 matches
    hash = roller.getInitialHash(s2, 0, length);
    if (hashes.count(hash)) return true;
  
    for (int i = 1; i <= s2.length() - length; i++) {
        hash = roller.rollHash(hash, s2[i-1], s2[i+length-1]);
        if (hashes.count(hash)) return true;
    }
  
    return false;
}
```

### 2. Duplicate Substrings Detection

```cpp
vector<string> findDuplicates(const string& s, int length) {
    unordered_map<long long, vector<int>> hashToPositions;
    vector<string> duplicates;
  
    RollingHash roller(length);
    long long hash = roller.getInitialHash(s, 0, length);
    hashToPositions[hash].push_back(0);
  
    for (int i = 1; i <= s.length() - length; i++) {
        hash = roller.rollHash(hash, s[i-1], s[i+length-1]);
        hashToPositions[hash].push_back(i);
    }
  
    // Find actual duplicates (handle hash collisions)
    for (auto& [hashVal, positions] : hashToPositions) {
        if (positions.size() > 1) {
            // Verify it's truly a duplicate, not just hash collision
            string first = s.substr(positions[0], length);
            for (int i = 1; i < positions.size(); i++) {
                string current = s.substr(positions[i], length);
                if (current == first) {
                    duplicates.push_back(first);
                    break;
                }
            }
        }
    }
  
    return duplicates;
}
```

## Visual Understanding: Rolling Hash Process

```
Text: "abcdef"
Pattern: "bcd" (length=3)

Initial state:
[a][b][c] d  e  f
 ↑  ↑  ↑
 |  |  └─ new char position
 |  └─ middle chars  
 └─ old char (to remove)

After rolling:
 a [b][c][d] e  f
    ↑  ↑  ↑
    |  |  └─ new char added
    |  └─ middle chars stay
    └─ old char removed

Hash transformation:
old_hash = a×31² + b×31¹ + c×31⁰
new_hash = b×31² + c×31¹ + d×31⁰

Rolling formula:
1. Remove: old_hash - a×31²
2. Shift: (result) × 31  
3. Add: (result) + d
```

## Hash Collision Handling: The Reality Check

> **Critical Insight** : Hash collisions are inevitable. Two different strings might produce the same hash value.

### Collision Mitigation Strategies

1. **Double Hashing** : Use two different bases

```cpp
struct DoubleHash {
    long long hash1, hash2;
  
    bool operator==(const DoubleHash& other) const {
        return hash1 == other.hash1 && hash2 == other.hash2;
    }
};
```

2. **Verification** : Always verify string equality when hashes match

```cpp
if (hash1 == hash2) {
    // Hash collision possible - verify actual strings
    if (substring1 == substring2) {
        // True match confirmed
    }
}
```

## Time and Space Complexity Analysis

| Operation                | Time Complexity | Space Complexity |
| ------------------------ | --------------- | ---------------- |
| Initial hash computation | O(m)            | O(1)             |
| Rolling to next hash     | O(1)            | O(1)             |
| Pattern matching (total) | O(n + m)        | O(1)             |
| Finding all substrings   | O(n)            | O(n)             |

Where:

* n = length of text
* m = length of pattern

> **Efficiency Gain** : Rolling hash reduces pattern matching from O(n×m) to O(n+m), a massive improvement for large texts!

## Common Pitfalls and Edge Cases

### 1. Overflow Handling

```cpp
// Wrong: might overflow
hash = hash + charValue * power;

// Right: use modular arithmetic
hash = (hash + (charValue * power) % MOD) % MOD;
```

### 2. Negative Numbers in Rolling

```cpp
// Wrong: can produce negative results
hash = (hash - oldChar * basePower) % MOD;

// Right: add MOD to handle negatives  
hash = (hash - oldChar * basePower + MOD) % MOD;
```

### 3. Empty String Handling

```cpp
if (pattern.empty()) return {0}; // Empty pattern matches at position 0
if (text.empty()) return {};     // No matches in empty text
```

This comprehensive foundation gives you the tools to tackle any string hashing problem in FAANG interviews. The key is understanding that rolling hash transforms an O(n×m) problem into an O(n+m) solution through clever mathematical preprocessing and constant-time hash updates.
