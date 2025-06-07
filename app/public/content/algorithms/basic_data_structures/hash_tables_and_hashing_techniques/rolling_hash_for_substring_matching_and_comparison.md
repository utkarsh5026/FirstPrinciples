# Rolling Hash: The Art of Efficient Substring Matching

> **Rolling hash is one of the most elegant algorithms in computer science - it transforms what would be an expensive string comparison operation into a constant-time mathematical calculation.**

Let's embark on a journey to understand rolling hash from its mathematical foundations to its practical applications in FAANG interviews.

## What is Rolling Hash? Understanding the Core Concept

Imagine you're reading a book through a small window that shows exactly 5 characters at a time. As you slide this window one character to the right, you see a new 5-character substring. Now, what if instead of reading and comparing these characters each time, you could represent each window's content as a single number? That's exactly what rolling hash does.

> **First Principle** : Rolling hash converts a string into a numerical representation (hash value) that can be computed incrementally as we "roll" through the string.

### The Mathematical Foundation

Rolling hash is built on  **polynomial rolling hash** , which treats a string as a polynomial evaluated at a specific base.

For a string `s = "abc"`, we calculate:

```
hash(s) = (a × base²) + (b × base¹) + (c × base⁰)
```

Let's see this with a concrete example:
```python
def calculate_hash_basic(s, base=31):
    """
    Calculate hash value for a string using polynomial rolling hash
    
    Args:
        s: Input string
        base: Base for polynomial (commonly 31 or 256)
    
    Returns:
        Hash value as integer
    """
    hash_value = 0
    
    # Calculate polynomial hash: s[0]*base^(n-1) + s[1]*base^(n-2) + ... + s[n-1]*base^0
    for i, char in enumerate(s):
        power = len(s) - 1 - i  # Decreasing powers
        hash_value += ord(char) * (base ** power)
    
    return hash_value

# Example: Calculate hash for "abc"
text = "abc"
base = 31

print(f"String: '{text}'")
print(f"ASCII values: a={ord('a')}, b={ord('b')}, c={ord('c')}")
print()

# Step by step calculation
hash_val = 0
for i, char in enumerate(text):
    power = len(text) - 1 - i
    contribution = ord(char) * (base ** power)
    hash_val += contribution
    print(f"'{char}': {ord(char)} × {base}^{power} = {contribution}")

print(f"\nFinal hash value: {hash_val}")
print(f"Using function: {calculate_hash_basic(text, base)}")
```

## The Magic of "Rolling": Incremental Hash Updates

The real power of rolling hash comes from its ability to update the hash value in **constant time** when we shift our window by one position.

> **Key Insight** : When we move from substring `s[i...j]` to `s[i+1...j+1]`, we don't need to recalculate the entire hash. We can mathematically transform the old hash into the new hash.

### The Rolling Formula

When we shift right by one position:

1. **Remove** the leftmost character's contribution
2. **Shift** all remaining characters (multiply by base)
3. **Add** the new rightmost character

```
new_hash = (old_hash - leftmost_char × base^(k-1)) × base + new_char
```

Let's implement this step by step:
```python
def rolling_hash_demo(text, window_size, base=31):
    """
    Demonstrates how rolling hash works by showing each step
    """
    if len(text) < window_size:
        return
    
    print(f"Text: '{text}', Window size: {window_size}, Base: {base}")
    print("=" * 60)
    
    # Calculate initial hash for first window
    initial_window = text[:window_size]
    current_hash = 0
    
    # Calculate hash from scratch for first window
    for i, char in enumerate(initial_window):
        power = window_size - 1 - i
        current_hash += ord(char) * (base ** power)
    
    print(f"Initial window: '{initial_window}'")
    print(f"Initial hash: {current_hash}")
    print()
    
    # Pre-calculate base^(window_size-1) for efficiency
    base_power = base ** (window_size - 1)
    
    # Roll through remaining positions
    for i in range(1, len(text) - window_size + 1):
        old_window = text[i-1:i-1+window_size]
        new_window = text[i:i+window_size]
        
        # Character being removed and added
        old_char = text[i-1]
        new_char = text[i-1+window_size]
        
        print(f"Rolling from '{old_window}' to '{new_window}'")
        
        # Step 1: Remove leftmost character
        old_hash = current_hash
        current_hash -= ord(old_char) * base_power
        print(f"  Remove '{old_char}': {old_hash} - {ord(old_char)} × {base_power} = {current_hash}")
        
        # Step 2: Shift (multiply by base)
        current_hash *= base
        print(f"  Shift left: {current_hash // base} × {base} = {current_hash}")
        
        # Step 3: Add new character
        current_hash += ord(new_char)
        print(f"  Add '{new_char}': {current_hash - ord(new_char)} + {ord(new_char)} = {current_hash}")
        
        # Verify by calculating from scratch
        verification = 0
        for j, char in enumerate(new_window):
            power = window_size - 1 - j
            verification += ord(char) * (base ** power)
        
        print(f"  Verification (calculated from scratch): {verification}")
        print(f"  Match: {current_hash == verification}")
        print()

# Demo with a simple string
rolling_hash_demo("abcdef", 3)
```

## Complete Rolling Hash Implementation

In practice, we need to handle integer overflow by using modular arithmetic. Here's a production-ready implementation:

```python
class RollingHash:
    """
    Complete Rolling Hash implementation for substring matching
    
    Key features:
    - Modular arithmetic to prevent overflow
    - O(1) hash updates when rolling
    - Configurable base and modulus
    """
    
    def __init__(self, base=31, mod=10**9 + 7):
        """
        Initialize rolling hash with base and modulus
        
        Args:
            base: Base for polynomial hash (31 is common choice)
            mod: Large prime for modular arithmetic (prevents overflow)
        """
        self.base = base
        self.mod = mod
        self.hash_value = 0
        self.window_size = 0
        self.base_power = 1  # base^(window_size-1) % mod
    
    def compute_hash(self, s):
        """
        Compute hash for entire string
        
        Time Complexity: O(n)
        Space Complexity: O(1)
        """
        hash_val = 0
        base_pow = 1
        
        # Process from right to left to avoid recalculating powers
        for i in range(len(s) - 1, -1, -1):
            hash_val = (hash_val + ord(s[i]) * base_pow) % self.mod
            base_pow = (base_pow * self.base) % self.mod
        
        return hash_val
    
    def init_window(self, s, start, window_size):
        """
        Initialize hash for first window
        
        Args:
            s: Input string
            start: Starting position
            window_size: Size of the window
        """
        self.window_size = window_size
        self.hash_value = 0
        self.base_power = 1
        
        # Calculate hash for window s[start:start+window_size]
        for i in range(start, start + window_size):
            self.hash_value = (self.hash_value * self.base + ord(s[i])) % self.mod
        
        # Calculate base^(window_size-1) % mod for rolling
        for _ in range(window_size - 1):
            self.base_power = (self.base_power * self.base) % self.mod
    
    def roll_hash(self, old_char, new_char):
        """
        Update hash when rolling window by one position
        
        Args:
            old_char: Character being removed from left
            new_char: Character being added to right
        
        Returns:
            New hash value
            
        Time Complexity: O(1)
        """
        # Remove leftmost character
        self.hash_value = (self.hash_value - ord(old_char) * self.base_power) % self.mod
        
        # Shift and add new character
        self.hash_value = (self.hash_value * self.base + ord(new_char)) % self.mod
        
        return self.hash_value
    
    def get_hash(self):
        """Get current hash value"""
        return self.hash_value

# Example usage and testing
def test_rolling_hash():
    """Test rolling hash with string matching"""
    text = "abcabcabc"
    pattern = "abc"
    
    rh = RollingHash()
    
    # Calculate pattern hash
    pattern_hash = rh.compute_hash(pattern)
    print(f"Pattern '{pattern}' hash: {pattern_hash}")
    print()
    
    # Find all occurrences using rolling hash
    matches = []
    text_hash = RollingHash()
    text_hash.init_window(text, 0, len(pattern))
    
    print(f"Searching in text: '{text}'")
    print("-" * 40)
    
    # Check first window
    window = text[:len(pattern)]
    current_hash = text_hash.get_hash()
    print(f"Window '{window}': hash = {current_hash}, match = {current_hash == pattern_hash}")
    if current_hash == pattern_hash:
        matches.append(0)
    
    # Roll through rest of text
    for i in range(1, len(text) - len(pattern) + 1):
        old_char = text[i - 1]
        new_char = text[i + len(pattern) - 1]
        
        current_hash = text_hash.roll_hash(old_char, new_char)
        window = text[i:i + len(pattern)]
        
        print(f"Window '{window}': hash = {current_hash}, match = {current_hash == pattern_hash}")
        
        if current_hash == pattern_hash:
            matches.append(i)
    
    print(f"\nPattern found at positions: {matches}")
    return matches

# Run the test
test_rolling_hash()
```

## FAANG Interview Applications

> **Rolling hash is a cornerstone technique in FAANG interviews because it transforms brute force O(n×m) string matching problems into elegant O(n+m) solutions.**

### 1. Rabin-Karp Algorithm: Pattern Matching

The most fundamental application is the Rabin-Karp algorithm for finding pattern occurrences:
```python
def rabin_karp(text, pattern, base=31, mod=10**9 + 7):
    """
    Rabin-Karp algorithm for pattern matching using rolling hash
    
    Args:
        text: Text to search in
        pattern: Pattern to find
        base: Base for rolling hash
        mod: Modulus for hash calculation
    
    Returns:
        List of starting indices where pattern is found
        
    Time Complexity: 
        - Average case: O(n + m)
        - Worst case: O(n × m) due to hash collisions
        
    Space Complexity: O(1)
    """
    if len(pattern) > len(text):
        return []
    
    n, m = len(text), len(pattern)
    matches = []
    
    # Calculate pattern hash
    pattern_hash = 0
    for char in pattern:
        pattern_hash = (pattern_hash * base + ord(char)) % mod
    
    # Calculate base^(m-1) % mod for rolling
    base_power = pow(base, m - 1, mod)
    
    # Calculate initial window hash
    window_hash = 0
    for i in range(m):
        window_hash = (window_hash * base + ord(text[i])) % mod
    
    print(f"Searching for pattern '{pattern}' in text '{text}'")
    print(f"Pattern hash: {pattern_hash}")
    print("-" * 50)
    
    # Check first window
    current_window = text[:m]
    print(f"Position 0: '{current_window}' -> hash = {window_hash}")
    
    if window_hash == pattern_hash:
        # Hash match - verify with actual string comparison
        if text[:m] == pattern:
            matches.append(0)
            print(f"  ✓ MATCH found at position 0")
        else:
            print(f"  ✗ Hash collision (false positive)")
    
    # Roll through remaining positions
    for i in range(1, n - m + 1):
        # Remove leftmost character and add rightmost character
        old_char = text[i - 1]
        new_char = text[i + m - 1]
        
        # Rolling hash update
        window_hash = (window_hash - ord(old_char) * base_power) % mod
        window_hash = (window_hash * base + ord(new_char)) % mod
        
        current_window = text[i:i + m]
        print(f"Position {i}: '{current_window}' -> hash = {window_hash}")
        
        if window_hash == pattern_hash:
            # Hash match - verify with actual string comparison
            if text[i:i + m] == pattern:
                matches.append(i)
                print(f"  ✓ MATCH found at position {i}")
            else:
                print(f"  ✗ Hash collision (false positive)")
    
    return matches

# Test with different scenarios
print("=== Test Case 1: Multiple matches ===")
result1 = rabin_karp("ababcababa", "aba")
print(f"Final result: Pattern found at positions {result1}")
print()

print("=== Test Case 2: No matches ===")
result2 = rabin_karp("abcdef", "xyz")
print(f"Final result: Pattern found at positions {result2}")
print()

print("=== Test Case 3: Edge case - pattern at end ===")
result3 = rabin_karp("hello world", "world")
print(f"Final result: Pattern found at positions {result3}")
```

### 2. Classic FAANG Problem: Longest Duplicate Substring

> **This is a LeetCode Hard problem that frequently appears in FAANG interviews. It demonstrates the power of rolling hash combined with binary search.**


 **Problem** : Given a string, find the longest substring that appears at least twice.## Complexity Analysis and Optimization Techniques

```python
def longest_duplicate_substring(s):
    """
    Find the longest substring that appears at least twice
    
    Approach: Binary search on length + Rolling hash for duplicate detection
    
    Time Complexity: O(n log n) - binary search × rolling hash
    Space Complexity: O(n) - for storing hash values
    
    This is a classic FAANG interview problem!
    """
    
    def has_duplicate_of_length(s, length, base=31, mod=10**9 + 7):
        """
        Check if there's a duplicate substring of given length
        Returns the duplicate substring if found, None otherwise
        """
        if length == 0:
            return ""
        
        # Use rolling hash to find duplicates
        seen_hashes = {}  # hash -> first occurrence position
        
        # Calculate initial hash for first window
        current_hash = 0
        base_power = 1
        
        # Calculate hash for first window
        for i in range(length):
            current_hash = (current_hash * base + ord(s[i])) % mod
        
        # Calculate base^(length-1) for rolling
        for _ in range(length - 1):
            base_power = (base_power * base) % mod
        
        # Store first hash
        first_substring = s[:length]
        seen_hashes[current_hash] = (0, first_substring)
        
        # Roll through remaining positions
        for i in range(1, len(s) - length + 1):
            # Rolling hash update
            old_char = s[i - 1]
            new_char = s[i + length - 1]
            
            current_hash = (current_hash - ord(old_char) * base_power) % mod
            current_hash = (current_hash * base + ord(new_char)) % mod
            
            current_substring = s[i:i + length]
            
            if current_hash in seen_hashes:
                # Potential duplicate found - verify to avoid hash collisions
                prev_pos, prev_substring = seen_hashes[current_hash]
                if current_substring == prev_substring:
                    return current_substring  # Found duplicate!
                # Hash collision - continue searching
            else:
                seen_hashes[current_hash] = (i, current_substring)
        
        return None
    
    # Binary search on the length of duplicate substring
    left, right = 0, len(s) - 1
    longest_duplicate = ""
    
    print(f"Searching for longest duplicate in: '{s}'")
    print("Binary search process:")
    print("-" * 40)
    
    while left <= right:
        mid = (left + right) // 2
        
        print(f"Checking length {mid}...")
        duplicate = has_duplicate_of_length(s, mid)
        
        if duplicate is not None:
            # Found duplicate of length mid, try to find longer
            longest_duplicate = duplicate
            left = mid + 1
            print(f"  ✓ Found duplicate: '{duplicate}' (length {mid})")
        else:
            # No duplicate of length mid, try shorter
            right = mid - 1
            print(f"  ✗ No duplicate of length {mid}")
    
    return longest_duplicate

# Test cases
test_cases = [
    "banana",      # Expected: "ana" 
    "abcdef",      # Expected: "" (no duplicates)
    "aabaaaba",    # Expected: "aaba"
    "abcabcabc",   # Expected: "abcabc"
]

for i, test in enumerate(test_cases, 1):
    print(f"\n=== Test Case {i}: '{test}' ===")
    result = longest_duplicate_substring(test)
    print(f"Result: '{result}' (length: {len(result)})")
    print()

# Detailed walkthrough for "banana"
print("=== Detailed Analysis for 'banana' ===")
s = "banana"
print(f"All substrings of length 3 in '{s}':")
for i in range(len(s) - 3 + 1):
    substring = s[i:i+3]
    print(f"  Position {i}: '{substring}'")
print("Notice 'ana' appears at positions 1 and 3!")
```

> **Understanding the complexity trade-offs and potential pitfalls of rolling hash is crucial for FAANG interviews.**

### Time Complexity Analysis

Let's break down the complexity for different scenarios:

```
┌─────────────────────────────────────────┐
│              COMPLEXITY TABLE           │
├─────────────────┬───────────┬───────────┤
│ Operation       │ Time      │ Space     │
├─────────────────┼───────────┼───────────┤
│ Hash Calculation│ O(n)      │ O(1)      │
│ Rolling Update  │ O(1)      │ O(1)      │
│ Pattern Matching│ O(n+m)    │ O(1)      │
│ Duplicate Search│ O(n²) avg │ O(n)      │
│                 │ O(n³) worst│          │
│ Binary Search + │ O(n log n)│ O(n)      │
│ Rolling Hash    │           │           │
└─────────────────┴───────────┴───────────┘
```

### Critical Edge Cases and Optimizations## FAANG Interview Strategy and Common Pitfalls

> **Interviewers test not just your implementation skills, but also your understanding of when and why to use rolling hash.**

```python
class OptimizedRollingHash:
    """
    Production-ready rolling hash with optimizations for FAANG interviews
    """
    
    def __init__(self, base=31, mod=10**9 + 7):
        """
        Choice of base and mod:
        - base = 31: Good distribution, fast multiplication
        - mod = 10^9 + 7: Large prime, prevents overflow
        """
        self.base = base
        self.mod = mod
    
    def prevent_hash_collision(self, text, pattern_positions, pattern):
        """
        Handle hash collisions by string verification
        
        This is CRITICAL in interviews - always verify hash matches!
        """
        verified_positions = []
        
        for pos in pattern_positions:
            substring = text[pos:pos + len(pattern)]
            if substring == pattern:
                verified_positions.append(pos)
            else:
                print(f"Hash collision detected at position {pos}!")
                print(f"  Expected: '{pattern}'")
                print(f"  Found:    '{substring}'")
        
        return verified_positions
    
    def handle_edge_cases(self, text, pattern):
        """
        Handle edge cases that appear in FAANG interviews
        """
        print("Checking edge cases:")
        
        # Case 1: Empty strings
        if not text or not pattern:
            print("  ✓ Empty string detected")
            return []
        
        # Case 2: Pattern longer than text
        if len(pattern) > len(text):
            print("  ✓ Pattern longer than text")
            return []
        
        # Case 3: Single character pattern
        if len(pattern) == 1:
            print("  ✓ Single character pattern - using simple search")
            return [i for i, char in enumerate(text) if char == pattern]
        
        # Case 4: Pattern equals text
        if pattern == text:
            print("  ✓ Pattern equals entire text")
            return [0]
        
        print("  ✓ All edge cases passed")
        return None  # Continue with normal algorithm
    
    def double_rolling_hash(self, text, pattern):
        """
        Use two different hash functions to reduce collision probability
        
        Collision probability: 1/mod₁ × 1/mod₂ ≈ 1/10¹⁸ (practically zero)
        """
        base1, mod1 = 31, 10**9 + 7
        base2, mod2 = 37, 10**9 + 9
        
        n, m = len(text), len(pattern)
        matches = []
        
        # Calculate pattern hashes
        pattern_hash1 = pattern_hash2 = 0
        for char in pattern:
            pattern_hash1 = (pattern_hash1 * base1 + ord(char)) % mod1
            pattern_hash2 = (pattern_hash2 * base2 + ord(char)) % mod2
        
        # Calculate base powers
        base_power1 = pow(base1, m - 1, mod1)
        base_power2 = pow(base2, m - 1, mod2)
        
        # Initialize window hashes
        window_hash1 = window_hash2 = 0
        for i in range(m):
            window_hash1 = (window_hash1 * base1 + ord(text[i])) % mod1
            window_hash2 = (window_hash2 * base2 + ord(text[i])) % mod2
        
        # Check first window
        if window_hash1 == pattern_hash1 and window_hash2 == pattern_hash2:
            matches.append(0)
        
        # Roll through remaining positions
        for i in range(1, n - m + 1):
            old_char = ord(text[i - 1])
            new_char = ord(text[i + m - 1])
            
            # Update both hashes
            window_hash1 = (window_hash1 - old_char * base_power1) % mod1
            window_hash1 = (window_hash1 * base1 + new_char) % mod1
            
            window_hash2 = (window_hash2 - old_char * base_power2) % mod2
            window_hash2 = (window_hash2 * base2 + new_char) % mod2
            
            # Both hashes must match
            if window_hash1 == pattern_hash1 and window_hash2 == pattern_hash2:
                matches.append(i)
        
        return matches
    
    def benchmark_comparison(self, text, pattern):
        """
        Compare rolling hash vs naive approach performance
        """
        import time
        
        print(f"Benchmarking with text length: {len(text)}, pattern length: {len(pattern)}")
        
        # Naive approach
        start_time = time.time()
        naive_matches = []
        for i in range(len(text) - len(pattern) + 1):
            if text[i:i + len(pattern)] == pattern:
                naive_matches.append(i)
        naive_time = time.time() - start_time
        
        # Rolling hash approach
        start_time = time.time()
        rolling_matches = self.double_rolling_hash(text, pattern)
        rolling_time = time.time() - start_time
        
        print(f"Naive approach:      {naive_time:.6f} seconds")
        print(f"Rolling hash:        {rolling_time:.6f} seconds")
        print(f"Speedup:             {naive_time / rolling_time:.2f}x")
        print(f"Results match:       {naive_matches == rolling_matches}")
        
        return rolling_matches

# Test with various scenarios
optimizer = OptimizedRollingHash()

print("=== Edge Case Testing ===")
test_cases = [
    ("", "abc"),           # Empty text
    ("abc", ""),           # Empty pattern  
    ("abc", "abcd"),       # Pattern longer than text
    ("a", "a"),            # Single characters
    ("hello", "hello"),    # Pattern equals text
]

for text, pattern in test_cases:
    print(f"\nTesting: text='{text}', pattern='{pattern}'")
    result = optimizer.handle_edge_cases(text, pattern)
    if result is not None:
        print(f"Result: {result}")

print("\n=== Double Hash Collision Resistance ===")
# Test with strings that might cause collisions with single hash
collision_text = "abcdefabcdef" * 100  # Long text
collision_pattern = "abc"
result = optimizer.double_rolling_hash(collision_text, collision_pattern)
print(f"Found {len(result)} matches in long text")

print("\n=== Performance Benchmark ===")
# Create large test case
large_text = "abc" * 1000 + "def" * 1000
large_pattern = "abc"
optimizer.benchmark_comparison(large_text, large_pattern)
```

### What Interviewers Look For

**1. Problem Recognition**

* Can you identify when rolling hash is the optimal approach?
* Do you recognize the pattern: "find/compare substrings efficiently"?

**2. Implementation Details**

* Do you handle integer overflow with modular arithmetic?
* Do you verify hash matches to avoid false positives?
* Can you explain the time complexity trade-offs?

**3. Optimization Awareness**

* Do you know when to use double hashing?
* Can you handle edge cases gracefully?

### Interview Problem Patterns

```
┌─────────────────────────────────────────┐
│         ROLLING HASH PATTERNS           │
├─────────────────────────────────────────┤
│ Pattern Matching                        │
│ • Find all occurrences of pattern       │
│ • Multiple pattern matching             │
│                                         │
│ Substring Problems                      │
│ • Longest duplicate substring           │
│ • Shortest unique substring             │
│ • Repeated DNA sequences                │
│                                         │
│ String Comparison                       │
│ • Compare large strings efficiently     │
│ • Find common substrings                │
│ • Palindrome detection in windows       │
│                                         │
│ Advanced Applications                   │
│ • Rolling hash + binary search          │
│ • Multiple string matching              │
│ • Suffix array construction             │
└─────────────────────────────────────────┘
```

### Complete Interview Template## Key Takeaways for FAANG Success

> **Rolling hash is not just an algorithm - it's a problem-solving paradigm that transforms expensive operations into mathematical calculations.**


```python
def rolling_hash_interview_template(text, pattern):
    """
    Template for solving rolling hash problems in FAANG interviews
    
    Follow this structure to impress your interviewer:
    1. Clarify the problem
    2. Discuss approach and complexity
    3. Handle edge cases
    4. Implement with proper error handling
    5. Test and optimize
    """
    
    # STEP 1: Clarify the problem with interviewer
    print("=== STEP 1: Problem Clarification ===")
    print("Questions to ask:")
    print("- Are we looking for all occurrences or just first?")
    print("- What's the expected size of input? (affects choice of mod)")
    print("- Should we handle case sensitivity?")
    print("- Are there any special characters to consider?")
    print()
    
    # STEP 2: Explain approach and complexity
    print("=== STEP 2: Approach Discussion ===")
    print("Approach: Rolling hash (Rabin-Karp algorithm)")
    print("Time Complexity: O(n + m) average, O(nm) worst case")
    print("Space Complexity: O(1)")
    print("Why better than naive: Avoids recalculating hash for each position")
    print()
    
    # STEP 3: Handle edge cases first
    print("=== STEP 3: Edge Case Handling ===")
    if not text or not pattern:
        print("Empty input detected")
        return []
    
    if len(pattern) > len(text):
        print("Pattern longer than text")
        return []
    
    n, m = len(text), len(pattern)
    
    # STEP 4: Implement algorithm
    print("=== STEP 4: Implementation ===")
    
    # Constants (explain choice to interviewer)
    BASE = 31       # Small prime, good distribution
    MOD = 10**9 + 7 # Large prime, prevents overflow
    
    matches = []
    
    # Calculate pattern hash
    pattern_hash = 0
    for char in pattern:
        pattern_hash = (pattern_hash * BASE + ord(char)) % MOD
    
    print(f"Pattern '{pattern}' hash: {pattern_hash}")
    
    # Calculate base^(m-1) % MOD for rolling
    base_power = pow(BASE, m - 1, MOD)
    
    # Initialize first window hash
    window_hash = 0
    for i in range(m):
        window_hash = (window_hash * BASE + ord(text[i])) % MOD
    
    # Check first window
    if window_hash == pattern_hash:
        # CRITICAL: Always verify to avoid false positives
        if text[:m] == pattern:
            matches.append(0)
            print(f"Match found at position 0")
    
    # Roll through remaining positions
    for i in range(1, n - m + 1):
        # Remove leftmost character
        old_char = ord(text[i - 1])
        window_hash = (window_hash - old_char * base_power) % MOD
        
        # Add rightmost character
        new_char = ord(text[i + m - 1])
        window_hash = (window_hash * BASE + new_char) % MOD
        
        # Check for match
        if window_hash == pattern_hash:
            # CRITICAL: String verification
            if text[i:i + m] == pattern:
                matches.append(i)
                print(f"Match found at position {i}")
    
    # STEP 5: Test and discuss optimizations
    print("\n=== STEP 5: Testing and Optimizations ===")
    print(f"Found {len(matches)} matches at positions: {matches}")
    
    print("\nPossible optimizations to discuss:")
    print("1. Double hashing to reduce collision probability")
    print("2. Different base values for different character sets")
    print("3. Precomputed powers for multiple pattern matching")
    
    return matches

def demonstrate_hash_collision():
    """
    Show why string verification is crucial
    """
    print("=== Hash Collision Demonstration ===")
    
    # These strings have same hash with certain base/mod combinations
    BASE, MOD = 31, 100  # Small mod to force collision
    
    strings = ["abc", "bcd"]  # These might collide with small mod
    
    for s in strings:
        hash_val = 0
        for char in s:
            hash_val = (hash_val * BASE + ord(char)) % MOD
        print(f"'{s}' -> hash = {hash_val}")
    
    print("This is why we ALWAYS verify with string comparison!")

# Run the complete interview demonstration
print("=== FAANG ROLLING HASH INTERVIEW SIMULATION ===")
text = "ababcababa"
pattern = "aba"
result = rolling_hash_interview_template(text, pattern)

print("\n" + "="*50)
demonstrate_hash_collision()

# Key points to mention in interview
print("\n=== KEY INTERVIEW TALKING POINTS ===")
talking_points = [
    "Rolling hash reduces substring comparison from O(m) to O(1)",
    "Always use modular arithmetic to prevent integer overflow", 
    "Must verify hash matches with string comparison (false positives)",
    "Choice of base and modulus affects collision probability",
    "Double hashing virtually eliminates collisions",
    "Average case O(n+m), worst case O(nm) due to collisions"
]

for i, point in enumerate(talking_points, 1):
    print(f"{i}. {point}")
```

### The Rolling Hash Mental Model

When you see these patterns in interviews, think rolling hash:

```
🔍 RECOGNITION PATTERNS
├── "Find pattern in text"
├── "Compare substrings efficiently" 
├── "Detect duplicate substrings"
├── "Longest/shortest substring with property"
└── "Multiple string matching"
```

### Implementation Checklist

**✅ Must-Haves for Interview Success:**

1. **Modular Arithmetic** : Always use `(value) % MOD` to prevent overflow
2. **String Verification** : Never trust hash equality alone - verify with string comparison
3. **Edge Case Handling** : Empty strings, pattern longer than text, single characters
4. **Complexity Analysis** : Explain average O(n+m) vs worst-case O(nm) scenarios
5. **Base/Modulus Choice** : Justify your constants (31 and 10^9+7 are standards)

### Advanced Interview Topics

**For Senior Positions:**

* **Double Rolling Hash** : Reduces collision probability to negligible levels
* **Multiple Pattern Matching** : Aho-Corasick + Rolling Hash hybrid approaches
* **Bidirectional Rolling Hash** : Rolling in both directions for palindrome problems
* **Rolling Hash + Binary Search** : Classic combination for optimization problems

### The Deeper Understanding

> **Rolling hash exemplifies the art of algorithm design: converting a computational problem into a mathematical one, trading space for time, and leveraging mathematical properties for efficiency.**

The beauty of rolling hash lies in its elegance - it takes the fundamental operation of string comparison and transforms it from character-by-character checking into a single mathematical calculation. This transformation is what allows us to solve complex string problems that would otherwise be prohibitively expensive.

When you master rolling hash, you're not just learning an algorithm - you're developing an intuition for how to approach optimization problems by finding the right mathematical abstraction. This mindset is exactly what FAANG interviewers are looking for: the ability to see beyond the surface problem and identify the underlying mathematical structure that enables efficient solutions.

 **Remember** : In your next FAANG interview, when you see a string problem that seems like it requires expensive comparisons, pause and ask yourself - "Can I represent these strings as numbers and make this problem mathematical instead of computational?" That's the rolling hash way of thinking, and it's your path to interview success.
