# String Manipulation in DSA: From First Principles to FAANG Interview Mastery

## Understanding Strings at the Fundamental Level

Let's begin our journey by understanding what a string truly is at its core. In computer science, a string is not just text—it's a  **sequence of characters stored in memory** , where each character has a specific numerical representation.

> **Core Principle** : A string is essentially an array of characters, where each character is represented by a number (ASCII or Unicode value) that the computer can understand and manipulate.

### The Foundation: How Characters Become Numbers

Every character you see on your screen has a corresponding numerical value. This mapping system allows computers to store, process, and manipulate text data efficiently.

```python
# Understanding character to number conversion
char = 'A'
ascii_value = ord(char)
print(f"Character '{char}' has ASCII value: {ascii_value}")
# Output: Character 'A' has ASCII value: 65

# Converting back from number to character
number = 65
character = chr(number)
print(f"ASCII value {number} represents: '{character}'")
# Output: ASCII value 65 represents: 'A'
```

 **Code Explanation** : The `ord()` function converts a character to its ASCII/Unicode value, while `chr()` does the reverse. This bidirectional conversion is fundamental to many string manipulation algorithms in interviews.

## ASCII vs Unicode: The Character Encoding Landscape

### ASCII: The Original Character Set

ASCII (American Standard Code for Information Interchange) uses 7 bits to represent 128 different characters:

```
ASCII Value Range Breakdown:
┌─────────────────────────┐
│ 0-31:   Control chars   │
│ 32-47:  Symbols         │
│ 48-57:  Digits (0-9)    │
│ 58-64:  More symbols    │
│ 65-90:  Uppercase A-Z   │
│ 91-96:  More symbols    │
│ 97-122: Lowercase a-z   │
│ 123-127: Final symbols  │
└─────────────────────────┘
```

> **Interview Insight** : Many FAANG problems rely on ASCII properties. For example, the difference between 'A' and 'a' is always 32, which allows for efficient case conversion algorithms.

```python
# Practical ASCII manipulation example
def toggle_case(char):
    """Toggle between uppercase and lowercase"""
    if 'A' <= char <= 'Z':
        # Convert to lowercase by adding 32
        return chr(ord(char) + 32)
    elif 'a' <= char <= 'z':
        # Convert to uppercase by subtracting 32
        return chr(ord(char) - 32)
    return char

# Test the function
print(toggle_case('A'))  # Output: 'a'
print(toggle_case('z'))  # Output: 'Z'
```

 **Code Explanation** : This function leverages the mathematical relationship between uppercase and lowercase ASCII values. Instead of using built-in functions, we perform direct arithmetic on ASCII values—a technique often expected in interviews.

### Unicode: The Global Standard

Unicode extends beyond ASCII to support millions of characters from different languages and symbol systems. In Python, strings are Unicode by default.

```python
# Unicode examples beyond ASCII
unicode_chars = ['α', '中', '🌟', 'é']
for char in unicode_chars:
    print(f"'{char}' → Unicode: {ord(char)}")

# Output:
# 'α' → Unicode: 945
# '中' → Unicode: 20013
# '🌟' → Unicode: 127775
# 'é' → Unicode: 233
```

> **FAANG Reality Check** : While ASCII problems are common in interviews, real-world applications often require Unicode handling. Understanding both prepares you for technical discussions about scalability and internationalization.

## String Operations and Time Complexity Analysis

### Fundamental String Operations

Let's examine the core operations and their computational complexities:

```python
# 1. String Access - O(1)
def char_at_index(s, index):
    """Access character at specific index"""
    if 0 <= index < len(s):
        return s[index]
    return None

text = "interview"
print(char_at_index(text, 3))  # Output: 'e'
```

 **Code Explanation** : String indexing in most languages is O(1) because strings are stored as arrays in memory. We can directly calculate the memory address of any character.

```python
# 2. String Concatenation - Important complexity analysis
def concatenate_strings(str1, str2):
    """Demonstrates string concatenation"""
    # In Python, this creates a new string object
    result = str1 + str2
    return result

# Time Complexity: O(n + m) where n, m are string lengths
# Space Complexity: O(n + m) for the new string
```

> **Critical Interview Concept** : String concatenation in loops can be O(n²) in languages where strings are immutable. This is a common performance trap that interviewers test.

```python
# Inefficient string building - O(n²)
def build_string_inefficient(chars):
    result = ""
    for char in chars:
        result += char  # Creates new string each time
    return result

# Efficient string building - O(n)
def build_string_efficient(chars):
    return ''.join(chars)  # Single concatenation operation
```

 **Code Explanation** : The inefficient version creates a new string object in each iteration, leading to quadratic time complexity. The efficient version uses `join()`, which allocates memory once and performs linear concatenation.

## Character-Level Manipulation Techniques

### Pattern 1: Character Frequency Analysis

```python
def character_frequency(s):
    """Count frequency of each character - O(n) time, O(k) space"""
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    return freq

def has_unique_characters(s):
    """Check if string has all unique characters"""
    seen = set()
    for char in s:
        if char in seen:
            return False
        seen.add(char)
    return True

# Test examples
print(character_frequency("hello"))     # {'h': 1, 'e': 1, 'l': 2, 'o': 1}
print(has_unique_characters("abc"))     # True
print(has_unique_characters("hello"))   # False
```

 **Code Explanation** : These functions demonstrate hashtable usage for character tracking. The frequency counter uses a dictionary to maintain character counts, while the uniqueness checker uses a set for O(1) lookup times.

### Pattern 2: Two-Pointer String Manipulation

```python
def is_palindrome(s):
    """Check if string is palindrome using two pointers"""
    left, right = 0, len(s) - 1
  
    while left < right:
        # Skip non-alphanumeric characters
        if not s[left].isalnum():
            left += 1
            continue
        if not s[right].isalnum():
            right -= 1
            continue
          
        # Compare characters (case-insensitive)
        if s[left].lower() != s[right].lower():
            return False
          
        left += 1
        right -= 1
  
    return True

# Test cases
print(is_palindrome("A man a plan a canal Panama"))  # True
print(is_palindrome("race a car"))                   # False
```

 **Code Explanation** : This two-pointer approach efficiently checks palindromes in O(n) time without creating additional strings. We skip non-alphanumeric characters and perform case-insensitive comparison by converting to lowercase.

### Pattern 3: Sliding Window for Substrings

```python
def longest_substring_without_repeating(s):
    """Find longest substring without repeating characters"""
    char_index = {}
    left = 0
    max_length = 0
  
    for right in range(len(s)):
        char = s[right]
      
        # If character seen before and within current window
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
      
        char_index[char] = right
        max_length = max(max_length, right - left + 1)
  
    return max_length

# Test example
text = "abcabcbb"
print(f"Input: '{text}'")
print(f"Longest substring length: {longest_substring_without_repeating(text)}")
# Output: Longest substring length: 3 (for "abc")
```

 **Code Explanation** : This sliding window algorithm maintains a dynamic window of unique characters. When we encounter a repeated character, we move the left pointer to exclude the previous occurrence, ensuring our window always contains unique characters.

## Advanced String Manipulation Patterns

### Pattern 4: String Transformation and Parsing

```python
def reverse_words_in_string(s):
    """Reverse words while preserving word order"""
    words = []
    current_word = []
  
    for char in s:
        if char != ' ':
            current_word.append(char)
        else:
            if current_word:
                words.append(''.join(current_word))
                current_word = []
  
    # Don't forget the last word
    if current_word:
        words.append(''.join(current_word))
  
    # Reverse each word individually
    reversed_words = [word[::-1] for word in words]
    return ' '.join(reversed_words)

# Test
input_str = "Hello World Programming"
output = reverse_words_in_string(input_str)
print(f"Input:  '{input_str}'")
print(f"Output: '{output}'")
# Output: 'olleH dlroW gnimmargorP'
```

 **Code Explanation** : This function demonstrates string parsing by manually building words character by character. We maintain a current word buffer and flush it when encountering spaces, then reverse each word individually.

### Pattern 5: Character Encoding and Decoding

```python
def encode_string(s):
    """Run-length encoding: 'aaabbc' → 'a3b2c1'"""
    if not s:
        return ""
  
    encoded = []
    current_char = s[0]
    count = 1
  
    for i in range(1, len(s)):
        if s[i] == current_char:
            count += 1
        else:
            encoded.append(current_char + str(count))
            current_char = s[i]
            count = 1
  
    # Don't forget the last group
    encoded.append(current_char + str(count))
    return ''.join(encoded)

def decode_string(encoded):
    """Decode run-length encoded string"""
    decoded = []
    i = 0
  
    while i < len(encoded):
        char = encoded[i]
        i += 1
      
        # Extract the count
        count_str = ""
        while i < len(encoded) and encoded[i].isdigit():
            count_str += encoded[i]
            i += 1
      
        count = int(count_str)
        decoded.append(char * count)
  
    return ''.join(decoded)

# Test encoding/decoding
original = "aaabbcccc"
encoded = encode_string(original)
decoded = decode_string(encoded)

print(f"Original: '{original}'")
print(f"Encoded:  '{encoded}'")
print(f"Decoded:  '{decoded}'")
# Original: 'aaabbcccc'
# Encoded:  'a3b2c4'
# Decoded:  'aaabbcccc'
```

 **Code Explanation** : This encoding algorithm groups consecutive identical characters and represents them as character + count pairs. The decoding reverses this process by parsing character-count pairs and reconstructing the original string.

## FAANG Interview String Patterns

### Pattern 6: Anagram Detection and Grouping

> **FAANG Favorite** : Anagram problems test your understanding of character frequency analysis and hash table optimization.

```python
def are_anagrams(s1, s2):
    """Check if two strings are anagrams"""
    if len(s1) != len(s2):
        return False
  
    # Count character frequencies
    char_count = {}
  
    # Add characters from first string
    for char in s1:
        char_count[char] = char_count.get(char, 0) + 1
  
    # Subtract characters from second string
    for char in s2:
        if char not in char_count:
            return False
        char_count[char] -= 1
        if char_count[char] == 0:
            del char_count[char]
  
    return len(char_count) == 0

def group_anagrams(words):
    """Group words that are anagrams of each other"""
    anagram_groups = {}
  
    for word in words:
        # Sort characters to create a key
        sorted_word = ''.join(sorted(word))
      
        if sorted_word not in anagram_groups:
            anagram_groups[sorted_word] = []
        anagram_groups[sorted_word].append(word)
  
    return list(anagram_groups.values())

# Test anagram functions
print(are_anagrams("listen", "silent"))  # True
print(are_anagrams("hello", "world"))    # False

words = ["eat", "tea", "tan", "ate", "nat", "bat"]
groups = group_anagrams(words)
print("Anagram groups:", groups)
# Output: [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
```

 **Code Explanation** : The anagram checker uses a single hash table to count and then decrease character frequencies. The grouping function uses sorted characters as keys to identify anagram groups—a clever technique that avoids comparing every pair.

### Pattern 7: String Subsequence and Substring Problems

```python
def is_subsequence(s, t):
    """Check if s is subsequence of t"""
    s_index = 0
  
    for char in t:
        if s_index < len(s) and char == s[s_index]:
            s_index += 1
  
    return s_index == len(s)

def longest_common_subsequence_length(text1, text2):
    """Find length of longest common subsequence using DP"""
    m, n = len(text1), len(text2)
  
    # Create DP table
    dp = [[0] * (n + 1) for _ in range(m + 1)]
  
    # Fill the DP table
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  
    return dp[m][n]

# Test subsequence functions
print(is_subsequence("ace", "abcde"))  # True
print(is_subsequence("aec", "abcde"))  # False

lcs_length = longest_common_subsequence_length("abcde", "ace")
print(f"LCS length: {lcs_length}")  # Output: 3
```

 **Code Explanation** : The subsequence checker uses a greedy approach with a single pass through the target string. The LCS function uses dynamic programming where `dp[i][j]` represents the LCS length for the first i characters of text1 and first j characters of text2.

## Memory and Performance Optimization

### Understanding String Immutability

> **Critical Concept** : In many languages including Python and Java, strings are immutable. Every "modification" creates a new string object.

```python
import time

def compare_string_building_methods(n):
    """Compare different string building approaches"""
  
    # Method 1: Concatenation (inefficient)
    start_time = time.time()
    result1 = ""
    for i in range(n):
        result1 += str(i)
    time1 = time.time() - start_time
  
    # Method 2: List join (efficient)
    start_time = time.time()
    parts = []
    for i in range(n):
        parts.append(str(i))
    result2 = ''.join(parts)
    time2 = time.time() - start_time
  
    print(f"Concatenation time: {time1:.4f}s")
    print(f"List join time: {time2:.4f}s")
    print(f"Join is {time1/time2:.1f}x faster")

# Uncomment to test performance difference
# compare_string_building_methods(1000)
```

 **Code Explanation** : This performance comparison demonstrates why understanding string immutability matters in interviews. The concatenation method has O(n²) complexity due to repeated string creation, while list joining is O(n).

## Character Classification and Validation

### Building Character Classification Functions

```python
def classify_character(char):
    """Classify character type using ASCII values"""
    ascii_val = ord(char)
  
    if 48 <= ascii_val <= 57:  # '0' to '9'
        return "digit"
    elif 65 <= ascii_val <= 90:  # 'A' to 'Z'
        return "uppercase"
    elif 97 <= ascii_val <= 122:  # 'a' to 'z'
        return "lowercase"
    elif ascii_val == 32:  # space
        return "space"
    else:
        return "special"

def validate_identifier(name):
    """Check if string is valid identifier (no built-in functions)"""
    if not name:
        return False
  
    # First character must be letter or underscore
    if not (name[0].isalpha() or name[0] == '_'):
        return False
  
    # Remaining characters must be alphanumeric or underscore
    for char in name[1:]:
        if not (char.isalnum() or char == '_'):
            return False
  
    return True

# Test character classification
test_chars = ['A', 'z', '5', ' ', '@']
for char in test_chars:
    print(f"'{char}' is {classify_character(char)}")

# Test identifier validation
identifiers = ["valid_name", "123invalid", "_underscore", "with space"]
for name in identifiers:
    print(f"'{name}' is {'valid' if validate_identifier(name) else 'invalid'}")
```

 **Code Explanation** : These functions demonstrate character analysis using ASCII value ranges and built-in character methods. The identifier validation follows common programming language rules for variable naming.

## String Algorithm Optimization Techniques

### Space-Optimized String Reversal

```python
def reverse_string_in_place(chars):
    """Reverse string represented as list of characters"""
    left, right = 0, len(chars) - 1
  
    while left < right:
        # Swap characters
        chars[left], chars[right] = chars[right], chars[left]
        left += 1
        right -= 1
  
    return chars

def reverse_between_delimiters(s, delimiter):
    """Reverse substrings between delimiters"""
    result = []
    current_segment = []
  
    for char in s:
        if char == delimiter:
            if current_segment:
                # Reverse current segment and add to result
                result.extend(current_segment[::-1])
                current_segment = []
            result.append(delimiter)
        else:
            current_segment.append(char)
  
    # Don't forget the last segment
    if current_segment:
        result.extend(current_segment[::-1])
  
    return ''.join(result)

# Test reversal functions
chars = list("hello")
reversed_chars = reverse_string_in_place(chars)
print(''.join(reversed_chars))  # "olleh"

text = "abc|def|ghi"
reversed_text = reverse_between_delimiters(text, '|')
print(f"'{text}' → '{reversed_text}'")  # "cba|fed|ihg"
```

 **Code Explanation** : The in-place reversal demonstrates the two-pointer technique for O(1) space complexity. The delimiter-based reversal shows how to apply transformations to specific segments while preserving structure.

> **Final Interview Wisdom** : String manipulation in FAANG interviews tests your understanding of time/space complexity, ASCII/Unicode knowledge, and algorithm design patterns. Master these fundamentals, and you'll confidently tackle any string problem thrown your way.

The key to success lies in recognizing patterns, understanding the underlying character representation, and choosing the most efficient approach for each specific problem. Practice these techniques, understand their complexities, and you'll be well-prepared for your next technical interview.
