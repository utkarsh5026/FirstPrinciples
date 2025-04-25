# Python Regular Expressions: A First Principles Approach

Regular expressions (regex) are powerful tools for pattern matching and text manipulation. Let's explore them from first principles, building our understanding layer by layer.

## The Fundamental Concept: Pattern Matching

At its core, a regular expression is a sequence of characters that defines a search pattern. Think of it as a specialized mini-language for describing text patterns.

### Why Do We Need Regular Expressions?

Imagine you need to find all email addresses in a document. Without regex, you'd need complex code with many conditional statements. With regex, you can express this pattern concisely.

## The Building Blocks of Regular Expressions

### 1. Literal Characters

The simplest regex consists of literal characters that match themselves.

```python
import re

text = "Hello, world!"
pattern = "world"
result = re.search(pattern, text)
print(result)  # <re.Match object; span=(7, 12), match='world'>
```

In this example, we're using the `re.search()` function which looks for the first occurrence of the pattern. The pattern "world" matches exactly those five characters in our text. The result contains information about where the match was found (positions 7-12).

### 2. Special Characters (Metacharacters)

Certain characters have special meanings in regex:

* `.` - Matches any character except newline
* `^` - Matches the start of a string
* `$` - Matches the end of a string
* `*` - Matches 0 or more repetitions
* `+` - Matches 1 or more repetitions
* `?` - Matches 0 or 1 repetition
* `\` - Escapes special characters

Let's see how we might use the dot (`.`) metacharacter:

```python
import re

text = "cat, bat, rat, mat"
pattern = "..t"
matches = re.findall(pattern, text)
print(matches)  # ['cat', 'bat', 'rat', 'mat']
```

Here, `..t` means "any character, followed by any character, followed by 't'". The `re.findall()` function returns all non-overlapping matches as a list.

### 3. Character Classes

Character classes let you specify a set of characters to match:

```python
import re

text = "The price is $15.50"
pattern = "[0-9]"  # Match any single digit
matches = re.findall(pattern, text)
print(matches)  # ['1', '5', '5', '0']
```

Here, `[0-9]` matches any single digit. Let's look at a more complex example:

```python
import re

text = "The quick brown fox jumps over the lazy dog."
pattern = "[aeiou]"  # Match any vowel
matches = re.findall(pattern, text)
print(matches)  # ['e', 'u', 'i', 'o', 'o', 'u', 'o', 'e', 'e', 'a', 'o']
```

We can also create negated character classes with `^` as the first character inside brackets:

```python
import re

text = "abc123"
pattern = "[^0-9]"  # Match anything that is NOT a digit
matches = re.findall(pattern, text)
print(matches)  # ['a', 'b', 'c']
```

### 4. Predefined Character Classes

Python regex provides shorthand for common character classes:

* `\d` - Matches any digit (equivalent to `[0-9]`)
* `\D` - Matches any non-digit (equivalent to `[^0-9]`)
* `\w` - Matches any alphanumeric character (equivalent to `[a-zA-Z0-9_]`)
* `\W` - Matches any non-alphanumeric character
* `\s` - Matches any whitespace character (space, tab, newline)
* `\S` - Matches any non-whitespace character

Let's see how these work:

```python
import re

text = "Hello, World! 123"
digit_pattern = r"\d"  # Note the raw string prefix 'r'
word_pattern = r"\w"
space_pattern = r"\s"

digits = re.findall(digit_pattern, text)
words = re.findall(word_pattern, text)
spaces = re.findall(space_pattern, text)

print(digits)  # ['1', '2', '3']
print(words)   # ['H', 'e', 'l', 'l', 'o', 'W', 'o', 'r', 'l', 'd', '1', '2', '3']
print(spaces)  # [' ', ' ']
```

Notice the `r` prefix before the string. This creates a "raw string" where backslashes are treated literally, which is important for regex patterns that use backslashes.

## Quantifiers: Controlling Repetition

Quantifiers let you specify how many times a pattern should match:

* `*` - 0 or more times
* `+` - 1 or more times
* `?` - 0 or 1 time
* `{n}` - Exactly n times
* `{n,}` - At least n times
* `{n,m}` - Between n and m times

Let's explore these with examples:

```python
import re

text = "aaabbbccc"
pattern1 = "a+"  # Match 'a' one or more times
pattern2 = "a*b+"  # Match 0 or more 'a's followed by 1 or more 'b's
pattern3 = "a{2,3}"  # Match 'a' 2 to 3 times

matches1 = re.findall(pattern1, text)
matches2 = re.findall(pattern2, text)
matches3 = re.findall(pattern3, text)

print(matches1)  # ['aaa']
print(matches2)  # ['aaabbb']
print(matches3)  # ['aaa']
```

These quantifiers allow you to define complex patterns with varying repetition requirements.

## Anchors: Specifying Position

Anchors don't match characters but rather positions:

* `^` - Start of a string
* `$` - End of a string
* `\b` - Word boundary
* `\B` - Not a word boundary

Here's how anchors work:

```python
import re

text = "The quick brown fox"
pattern1 = r"^The"  # Match 'The' at the beginning
pattern2 = r"fox$"  # Match 'fox' at the end
pattern3 = r"\bfox\b"  # Match 'fox' as a whole word

print(re.search(pattern1, text))  # <re.Match object; span=(0, 3), match='The'>
print(re.search(pattern2, text))  # <re.Match object; span=(16, 19), match='fox'>
print(re.search(pattern3, text))  # <re.Match object; span=(16, 19), match='fox'>

# Example showing when pattern doesn't match
print(re.search(r"\bThe\b", "TheQuick"))  # None - because 'The' is not a separate word
```

## Grouping and Capturing

Parentheses `()` serve two purposes in regex:

1. Grouping elements together so operators apply to the whole group
2. Capturing matched text for later use

```python
import re

text = "John Smith's phone is 123-456-7890"
pattern = r"(\d{3})-(\d{3})-(\d{4})"  # Capture 3 groups of digits

match = re.search(pattern, text)
if match:
    print("Full match:", match.group(0))  # Full match: 123-456-7890
    print("Area code:", match.group(1))   # Area code: 123
    print("Exchange:", match.group(2))    # Exchange: 456
    print("Line number:", match.group(3)) # Line number: 7890
```

In this example, we've created three capture groups for the different parts of a phone number. The `group()` method lets us access these captured groups.

## Non-capturing Groups

Sometimes you want to group elements without capturing them. Use `(?:...)` for this:

```python
import re

text = "apple and banana"
pattern = r"(?:apple|banana)"  # Non-capturing group
matches = re.findall(pattern, text)
print(matches)  # ['apple', 'banana']
```

## Alternation: Matching One of Several Patterns

The pipe symbol `|` acts as a logical OR in regex:

```python
import re

text = "Do you prefer cats or dogs?"
pattern = r"cats|dogs"
matches = re.findall(pattern, text)
print(matches)  # ['cats', 'dogs']
```

## Greedy vs. Non-Greedy Matching

By default, quantifiers are "greedy" - they match as much as possible. Adding a `?` after a quantifier makes it "non-greedy":

```python
import re

text = "<p>First paragraph</p><p>Second paragraph</p>"
greedy_pattern = r"<p>.*</p>"
non_greedy_pattern = r"<p>.*?</p>"

greedy_matches = re.findall(greedy_pattern, text)
non_greedy_matches = re.findall(non_greedy_pattern, text)

print(greedy_matches)      # ['<p>First paragraph</p><p>Second paragraph</p>']
print(non_greedy_matches)  # ['<p>First paragraph</p>', '<p>Second paragraph</p>']
```

The greedy `.*` matched everything between the first `<p>` and the last `</p>`, while the non-greedy `.*?` matched each paragraph separately.

## Look-ahead and Look-behind Assertions

These are zero-width assertions that don't consume characters:

* Positive look-ahead `(?=...)`: Asserts that what follows matches the pattern
* Negative look-ahead `(?!...)`: Asserts that what follows doesn't match
* Positive look-behind `(?<=...)`: Asserts that what precedes matches
* Negative look-behind `(?<!...)`: Asserts that what precedes doesn't match

```python
import re

# Find all words followed by a colon
text = "name: John, age: 30, country: USA"
pattern = r"\w+(?=:)"
matches = re.findall(pattern, text)
print(matches)  # ['name', 'age', 'country']

# Find all numbers not preceded by '$'
text = "Price: $100, Count: 5, Total: $505"
pattern = r"(?<!\$)\d+"
matches = re.findall(pattern, text)
print(matches)  # ['5']
```

## Real-World Examples

### Example 1: Validating Email Addresses

```python
import re

def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

# Testing the function
emails = ["user@example.com", "invalid@email", "name.lastname@domain.co.uk"]
for email in emails:
    print(f"{email}: {is_valid_email(email)}")
# Output:
# user@example.com: True
# invalid@email: False
# name.lastname@domain.co.uk: True
```

Breaking down the pattern:

* `^[\w\.-]+` - Start with one or more word characters, dots, or hyphens
* `@` - Followed by the @ symbol
* `[\w\.-]+` - One or more word characters, dots, or hyphens
* `\.` - A literal dot (escaped because dot is a special character)
* `\w+$` - End with one or more word characters

### Example 2: Extracting URLs from Text

```python
import re

def extract_urls(text):
    pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+'
    return re.findall(pattern, text)

sample_text = """
Check out these websites:
https://www.example.com
http://blog.example.org/posts/123
"""

urls = extract_urls(sample_text)
for url in urls:
    print(url)
# Output:
# https://www.example.com
# http://blog.example.org/posts/123
```

### Example 3: Parsing Log Files

```python
import re

log_line = '192.168.1.1 - - [25/Sep/2023:14:23:12 +0000] "GET /index.html HTTP/1.1" 200 1234'

pattern = r'(\d+\.\d+\.\d+\.\d+).*?"(\w+) ([^"]*) HTTP/[\d.]+"\s+(\d+)\s+(\d+)'
match = re.search(pattern, log_line)

if match:
    ip = match.group(1)
    method = match.group(2)
    path = match.group(3)
    status = match.group(4)
    bytes_sent = match.group(5)
  
    print(f"IP: {ip}")
    print(f"Method: {method}")
    print(f"Path: {path}")
    print(f"Status: {status}")
    print(f"Bytes sent: {bytes_sent}")

# Output:
# IP: 192.168.1.1
# Method: GET
# Path: /index.html
# Status: 200
# Bytes sent: 1234
```

## Common Python Regex Functions

### re.search()

Searches for the first occurrence of the pattern.

```python
import re

text = "The rain in Spain"
pattern = r"rain"
match = re.search(pattern, text)
if match:
    print(f"Found '{match.group()}' at position {match.start()}-{match.end()}")
# Output: Found 'rain' at position 4-8
```

### re.match()

Checks if the pattern matches at the beginning of the string.

```python
import re

pattern = r"Hello"
print(re.match(pattern, "Hello World"))  # <re.Match object; span=(0, 5), match='Hello'>
print(re.match(pattern, "World Hello"))  # None - because it doesn't match at the beginning
```

### re.findall()

Returns all non-overlapping matches as a list.

```python
import re

text = "The rain in Spain falls mainly in the plain"
pattern = r"\w+ain"
matches = re.findall(pattern, text)
print(matches)  # ['rain', 'Spain', 'main', 'plain']
```

### re.finditer()

Returns an iterator of match objects for all non-overlapping matches.

```python
import re

text = "The rain in Spain"
pattern = r"\w+"
for match in re.finditer(pattern, text):
    print(f"Found '{match.group()}' at position {match.start()}-{match.end()}")
# Output:
# Found 'The' at position 0-3
# Found 'rain' at position 4-8
# Found 'in' at position 9-11
# Found 'Spain' at position 12-17
```

### re.sub()

Replaces all occurrences of the pattern with a replacement string.

```python
import re

text = "Hello, my phone number is 123-456-7890"
pattern = r"\d{3}-\d{3}-\d{4}"
replacement = "XXX-XXX-XXXX"
new_text = re.sub(pattern, replacement, text)
print(new_text)  # Hello, my phone number is XXX-XXX-XXXX
```

### re.split()

Splits the string by the occurrences of the pattern.

```python
import re

text = "apple,banana;orange.grape"
pattern = r"[,;.]"  # Split by comma, semicolon, or period
result = re.split(pattern, text)
print(result)  # ['apple', 'banana', 'orange', 'grape']
```

## Compiling Patterns for Better Performance

If you're using the same pattern multiple times, it's more efficient to compile it first:

```python
import re

pattern = re.compile(r"\d+")

text1 = "I have 3 apples and 5 oranges"
text2 = "She bought 12 eggs"

# Using the compiled pattern
print(pattern.findall(text1))  # ['3', '5']
print(pattern.findall(text2))  # ['12']
```

## Tips for Writing Effective Regular Expressions

1. **Start Simple** : Begin with basic patterns and gradually add complexity.
2. **Test Incrementally** : Test each component of your regex separately.
3. **Use Raw Strings** : Always use raw strings (`r"pattern"`) for regex in Python.
4. **Beware of Greediness** : Remember that quantifiers are greedy by default.
5. **Mind the Special Characters** : Escape special characters when you want their literal meaning.
6. **Consider Performance** : Very complex regex can be computationally expensive.
7. **Readability Matters** : Sometimes it's better to use multiple simple regex operations than one complex pattern.

## Conclusion

Regular expressions are a powerful tool for text processing in Python. While they may seem intimidating at first, understanding the basic principles allows you to build complex patterns systematically. Regular expressions provide a concise and efficient way to search, extract, and manipulate text data based on patterns.

By mastering regex in Python, you gain a versatile skill applicable in data cleaning, web scraping, form validation, log file analysis, and many other text processing tasks. The key is to practice with real-world examples and gradually build your regex vocabulary.
