# Regular Expressions in Python: Pattern Matching from First Principles

## What is Pattern Matching?

Before diving into regular expressions, let's understand the fundamental problem they solve. At its core, pattern matching is about finding structure in text.

```python
# The basic human problem: finding patterns in text
text = "My phone number is 555-123-4567, call me!"

# Without patterns, we'd need to manually specify every possibility:
if "555-123-4567" in text:
    print("Found specific number")
# But what about 555-124-4567? Or (555) 123-4567?
# We'd need infinite conditions!
```

> **Mental Model** : Think of patterns like templates with blanks to fill in. A phone number pattern is "3 digits, dash, 3 digits, dash, 4 digits" rather than one specific number.

## Why Regular Expressions Exist

Regular expressions (regex) provide a concise language for describing text patterns. They solve the problem of flexible pattern matching without writing enormous amounts of conditional code.

```python
# The evolution from simple to sophisticated pattern matching

# Level 1: Exact matching (what we learned first)
text = "The price is $25.99"
if "$25.99" in text:
    print("Found exact price")

# Level 2: Simple wildcards (still limited)
import fnmatch
if fnmatch.fnmatch("file.txt", "*.txt"):
    print("Found text file")

# Level 3: Regular expressions (powerful and flexible)
import re
if re.search(r'\$\d+\.\d{2}', text):
    print("Found any price format")
```

> **Python Philosophy** : Regular expressions follow Python's principle of "powerful when needed, simple when possible." The `re` module provides both simple and advanced pattern matching capabilities.

## Python's `re` Module: First Steps

Python's `re` module implements regular expressions as a separate import because not all programs need pattern matching, keeping the core language clean.

```python
import re

# The fundamental re functions (start here):
text = "Hello, my email is john@example.com"

# 1. re.search() - finds first match anywhere in string
match = re.search(r'email', text)
if match:
    print(f"Found 'email' at position {match.start()}")  # Found 'email' at position 13

# 2. re.match() - only matches at the beginning
match = re.match(r'Hello', text)
if match:
    print("Text starts with 'Hello'")

# 3. re.findall() - finds all matches as a list
emails = re.findall(r'\w+@\w+\.\w+', text)
print(emails)  # ['john@example.com']
```

> **Key Insight** : Regular expressions are compiled patterns. Python compiles them into efficient matching machines behind the scenes.

## Building Patterns: From Simple to Complex

### Level 1: Literal Characters

```python
import re

text = "The cat sat on the mat"

# Exact character matching
print(re.findall(r'cat', text))      # ['cat']
print(re.findall(r'at', text))       # ['at', 'at', 'at'] (in cat, sat, mat)

# Case sensitivity matters
print(re.findall(r'Cat', text))      # [] (empty - no capital C)
print(re.findall(r'cat', text, re.IGNORECASE))  # ['cat'] (flag for case-insensitive)
```

### Level 2: Special Characters (Metacharacters)

```python
# The "grammar" of regular expressions
text = "Phone: 555-123-4567. Fax: 555-987-6543."

# \d = any digit (0-9)
print(re.findall(r'\d', text))           # ['5', '5', '5', '1', '2', '3', '4', '5', '6', '7', ...]

# \w = any word character (letters, digits, underscore)
print(re.findall(r'\w+', text))          # ['Phone', '555', '123', '4567', 'Fax', '555', '987', '6543']

# \s = any whitespace (space, tab, newline)
print(re.findall(r'\s', text))           # [' ', ' ', ' ']

# . = any character except newline
print(re.findall(r'5..', text))          # ['555', '555'] (5 followed by any two characters)
```

```
Pattern Building Blocks:
┌─────────────────┐
│ Literal chars   │ → cat, dog, 123
├─────────────────┤
│ \d (digits)     │ → 0,1,2...9
├─────────────────┤
│ \w (word chars) │ → a-z,A-Z,0-9,_
├─────────────────┤
│ \s (whitespace) │ → space,tab,newline
├─────────────────┤
│ . (any char)    │ → matches anything
└─────────────────┘
```

### Level 3: Quantifiers (How Many?)

```python
text = "I have 1 cat, 22 dogs, and 333 birds"

# + = one or more
print(re.findall(r'\d+', text))          # ['1', '22', '333'] (complete numbers)

# * = zero or more  
print(re.findall(r'ca*t', 'ct cat caat'))  # ['ct', 'cat', 'caat']

# ? = zero or one (optional)
print(re.findall(r'colou?r', 'color colour'))  # ['color', 'colour']

# {n} = exactly n times
print(re.findall(r'\d{3}', text))        # ['333'] (exactly 3 digits)

# {n,m} = between n and m times
print(re.findall(r'\d{1,2}', text))      # ['1', '22', '33'] (1 or 2 digits)
```

```
Quantifier Mental Model:
┌──────────────────────────────┐
│ Pattern: \d                  │
│ Matches: one digit           │
├──────────────────────────────┤
│ Pattern: \d+                 │
│ Matches: one or more digits  │
├──────────────────────────────┤
│ Pattern: \d*                 │
│ Matches: zero or more digits │
├──────────────────────────────┤
│ Pattern: \d?                 │
│ Matches: optional digit      │
└──────────────────────────────┘
```

## Groups: Capturing and Organizing Matches

Groups are one of regex's most powerful features - they let you extract specific parts of a match.

### Basic Groups with Parentheses

```python
import re

# Without groups - gets the whole match
text = "Born: 1990-05-15, Graduated: 2012-12-20"
dates = re.findall(r'\d{4}-\d{2}-\d{2}', text)
print(dates)  # ['1990-05-15', '2012-12-20']

# With groups - extracts parts of the match
dates_parts = re.findall(r'(\d{4})-(\d{2})-(\d{2})', text)
print(dates_parts)  # [('1990', '05', '15'), ('2012', '12', '20')]

# Accessing individual groups
for year, month, day in dates_parts:
    print(f"Year: {year}, Month: {month}, Day: {day}")
```

### Named Groups (More Readable)

```python
# Instead of remembering group numbers, use names
pattern = r'(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})'
match = re.search(pattern, "Today is 2025-07-07")

if match:
    print(match.group('year'))    # '2025'
    print(match.group('month'))   # '07' 
    print(match.group('day'))     # '07'
    print(match.groupdict())      # {'year': '2025', 'month': '07', 'day': '07'}
```

### Practical Example: Parsing Email Addresses

```python
email_text = "Contact john.doe@company.com or jane_smith@university.edu"

# Complex email pattern with groups
email_pattern = r'(?P<username>[\w.-]+)@(?P<domain>[\w.-]+)\.(?P<tld>\w+)'

matches = re.finditer(email_pattern, email_text)
for match in matches:
    print(f"Full email: {match.group()}")
    print(f"Username: {match.group('username')}")
    print(f"Domain: {match.group('domain')}")
    print(f"TLD: {match.group('tld')}")
    print("---")

# Output:
# Full email: john.doe@company.com
# Username: john.doe
# Domain: company
# TLD: com
# ---
# Full email: jane_smith@university.edu
# Username: jane_smith
# Domain: university
# TLD: edu
```

```
Group Architecture:
┌─────────────────────────────────┐
│ Outer Pattern: Full Match       │
│ ┌─────────────────────────────┐ │
│ │ Group 1: Username           │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Group 2: Domain         │ │ │
│ │ │ ┌─────────────────────┐ │ │ │
│ │ │ │ Group 3: TLD        │ │ │ │
│ │ │ └─────────────────────┘ │ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Substitution: Find and Replace with Power

Regular expressions excel at sophisticated find-and-replace operations.

### Basic Substitution

```python
import re

text = "The quick brown fox jumps over the lazy dog"

# Simple replacement
result = re.sub(r'fox', 'cat', text)
print(result)  # "The quick brown cat jumps over the lazy dog"

# Replace all digits with 'X'
text_with_numbers = "Call 555-1234 or 555-5678"
result = re.sub(r'\d', 'X', text_with_numbers)
print(result)  # "Call XXX-XXXX or XXX-XXXX"

# Limit number of replacements
result = re.sub(r'\d', 'X', text_with_numbers, count=4)
print(result)  # "Call XXX-X234 or 555-5678"
```

### Advanced Substitution with Groups

```python
# Rearranging date formats
dates = "Events: 2025-07-07, 2025-12-25, 2026-01-01"

# Convert YYYY-MM-DD to MM/DD/YYYY format
new_format = re.sub(r'(\d{4})-(\d{2})-(\d{2})', r'\2/\3/\1', dates)
print(new_format)  # "Events: 07/07/2025, 12/25/2025, 01/01/2026"

# Using named groups for clarity
pattern = r'(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})'
new_format = re.sub(pattern, r'\g<month>/\g<day>/\g<year>', dates)
print(new_format)  # Same result, but more readable
```

### Function-Based Substitution

```python
# Sometimes you need complex logic during replacement
def format_currency(match):
    """Convert numbers to currency format"""
    number = float(match.group())
    return f"${number:,.2f}"

text = "Prices: 1234.5, 67890, 42.75"
result = re.sub(r'\d+(?:\.\d+)?', format_currency, text)
print(result)  # "Prices: $1,234.50, $67,890.00, $42.75"

# The function receives a match object and returns replacement text
def uppercase_words(match):
    """Convert captured words to uppercase"""
    return match.group().upper()

text = "hello world python programming"
result = re.sub(r'\b\w+\b', uppercase_words, text)
print(result)  # "HELLO WORLD PYTHON PROGRAMMING"
```

## When to Use Regex vs String Methods

This is crucial for writing maintainable code. Regular expressions are powerful but can be overkill.

### Use String Methods When:

```python
# Simple, exact matching
text = "hello@example.com"

# GOOD: Simple and readable
if text.endswith('.com'):
    print("Commercial email")

# OVERKILL: Regex for simple task
if re.search(r'\.com$', text):
    print("Commercial email")

# GOOD: Simple replacement
clean_text = text.replace(' ', '_')

# OVERKILL: Regex for simple replacement  
clean_text = re.sub(r' ', '_', text)

# GOOD: Simple validation
if '@' in text and '.' in text:
    print("Might be an email")
```

### Use Regular Expressions When:

```python
# Pattern-based matching
emails = ["user@domain.com", "invalid.email", "test@sub.domain.org"]

# GOOD: Pattern validation
email_pattern = r'^[\w.-]+@[\w.-]+\.\w+$'
for email in emails:
    if re.match(email_pattern, email):
        print(f"{email} is valid format")

# Complex text processing
log_line = "2025-07-07 14:30:22 ERROR: Connection failed to 192.168.1.1"

# GOOD: Extract structured data
log_pattern = r'(?P<date>\d{4}-\d{2}-\d{2}) (?P<time>\d{2}:\d{2}:\d{2}) (?P<level>\w+): (?P<message>.*)'
match = re.match(log_pattern, log_line)
if match:
    log_data = match.groupdict()
    print(log_data)
```

> **Decision Framework** : Use string methods for exact, simple operations. Use regex for patterns, validation, and complex text transformations.

### Performance Comparison

```python
import re
import time

# For simple operations, string methods are faster
text = "hello world " * 10000

# String method approach
start = time.time()
for _ in range(1000):
    result = text.replace('world', 'python')
string_time = time.time() - start

# Regex approach
pattern = re.compile(r'world')  # Pre-compile for fair comparison
start = time.time()
for _ in range(1000):
    result = pattern.sub('python', text)
regex_time = time.time() - start

print(f"String method: {string_time:.4f}s")
print(f"Regex method: {regex_time:.4f}s")
# String methods are typically 2-5x faster for simple operations
```

## Advanced Regex Features

### Lookahead and Lookbehind

```python
# Sometimes you want to match based on context without including it

text = "Password123, SecretABC, public999"

# Positive lookahead (?=...): match if followed by pattern
# Find words followed by digits
words_before_digits = re.findall(r'\w+(?=\d)', text)
print(words_before_digits)  # ['Password', 'public']

# Negative lookahead (?!...): match if NOT followed by pattern  
# Find words NOT followed by digits
words_not_before_digits = re.findall(r'\w+(?!\d)', text)
print(words_not_before_digits)  # ['SecretABC'] (and others)

# Positive lookbehind (?<=...): match if preceded by pattern
# Find digits after letters
digits_after_letters = re.findall(r'(?<=\w)\d+', text)
print(digits_after_letters)  # ['123', '999']
```

### Greedy vs Non-Greedy Matching

```python
# Understanding how regex engines match

html = '<div>Content 1</div><div>Content 2</div>'

# Greedy matching (default) - matches as much as possible
greedy = re.findall(r'<div>.*</div>', html)
print(greedy)  # ['<div>Content 1</div><div>Content 2</div>'] - too much!

# Non-greedy matching - matches as little as possible
non_greedy = re.findall(r'<div>.*?</div>', html)
print(non_greedy)  # ['<div>Content 1</div>', '<div>Content 2</div>'] - perfect!

# Why this matters for data extraction
text = 'Price: $10.99, Tax: $1.50, Total: $12.49'

# Greedy - gets too much
bad_prices = re.findall(r'\$.*\d', text)
print(bad_prices)  # ['$10.99, Tax: $1.50, Total: $12.49'] - wrong!

# Non-greedy - gets just what we want
good_prices = re.findall(r'\$\d+\.\d{2}', text)
print(good_prices)  # ['$10.99', '$1.50', '$12.49'] - correct!
```

> **Greedy vs Non-Greedy Mental Model** : Greedy quantifiers are like hungry people who take as much food as possible. Non-greedy quantifiers are polite - they take just enough to satisfy the pattern.

## Common Pitfalls and How to Avoid Them

### 1. Escaping Special Characters

```python
# WRONG: Special characters not escaped
text = "Price: $25.99 (was $30.00)"
# This won't work as expected because $ and . are special in regex
bad_pattern = r'$25.99'
matches = re.findall(bad_pattern, text)
print(matches)  # [] - empty because $ means "end of line" in regex

# CORRECT: Escape special characters with backslash
good_pattern = r'\$25\.99'
matches = re.findall(good_pattern, text)
print(matches)  # ['$25.99']

# Alternative: Use re.escape() for user input
user_input = "$25.99"
safe_pattern = re.escape(user_input)
print(safe_pattern)  # '\$25\.99'
matches = re.findall(safe_pattern, text)
print(matches)  # ['$25.99']
```

### 2. Raw Strings vs Regular Strings

```python
# PROBLEMATIC: Regular strings require double escaping
# \d needs to be \\d because Python processes \ first
pattern1 = '\\d+'  # Python string escaping makes this \d+
pattern2 = r'\d+'   # Raw string - what you see is what regex gets

text = "Number: 123"
print(re.findall(pattern1, text))  # ['123']
print(re.findall(pattern2, text))  # ['123'] - same result, clearer code

# The difference becomes critical with backslashes
path = r'C:\Users\Documents'
# WRONG: Double backslash confusion
bad_pattern = '\\\\Users'    # Becomes \\Users in regex
# CORRECT: Raw string clarity  
good_pattern = r'\\Users'    # Becomes \Users in regex
```

> **Best Practice** : Always use raw strings (r'pattern') for regex patterns to avoid escaping confusion.

### 3. Compilation for Repeated Use

```python
import re

text_list = ["email1@test.com", "invalid", "email2@example.org"] * 1000

# INEFFICIENT: Recompiles pattern every time
def slow_validation(texts):
    valid_emails = []
    for text in texts:
        if re.match(r'^[\w.-]+@[\w.-]+\.\w+$', text):  # Recompiles each time!
            valid_emails.append(text)
    return valid_emails

# EFFICIENT: Compile once, use many times
def fast_validation(texts):
    email_pattern = re.compile(r'^[\w.-]+@[\w.-]+\.\w+$')  # Compile once
    valid_emails = []
    for text in texts:
        if email_pattern.match(text):  # Use compiled pattern
            valid_emails.append(text)
    return valid_emails

# The compiled version is significantly faster for repeated use
```

## Real-World Applications

### 1. Log File Analysis

```python
import re
from collections import defaultdict

# Analyzing web server logs
log_entries = [
    '192.168.1.1 - - [07/Jul/2025:14:30:22 +0000] "GET /api/users HTTP/1.1" 200 1234',
    '10.0.0.1 - - [07/Jul/2025:14:30:25 +0000] "POST /api/login HTTP/1.1" 401 567',
    '192.168.1.1 - - [07/Jul/2025:14:30:30 +0000] "GET /api/data HTTP/1.1" 500 89'
]

# Complex pattern to parse log structure
log_pattern = re.compile(
    r'(?P<ip>\d+\.\d+\.\d+\.\d+) - - '
    r'\[(?P<timestamp>[^\]]+)\] '
    r'"(?P<method>\w+) (?P<path>/[^\s]*) HTTP/1\.1" '
    r'(?P<status>\d+) (?P<size>\d+)'
)

# Analyze the logs
status_counts = defaultdict(int)
ip_requests = defaultdict(int)

for log_line in log_entries:
    match = log_pattern.match(log_line)
    if match:
        data = match.groupdict()
        status_counts[data['status']] += 1
        ip_requests[data['ip']] += 1
      
        if data['status'] == '500':
            print(f"Error on {data['path']} from {data['ip']}")

print(f"Status codes: {dict(status_counts)}")
print(f"Requests per IP: {dict(ip_requests)}")
```

### 2. Data Cleaning and Validation

```python
import re

def clean_phone_numbers(phone_list):
    """
    Standardize various phone number formats to (XXX) XXX-XXXX
    """
    # Pattern to capture different phone formats
    phone_pattern = re.compile(r'''
        (?:\+1[-.\s]?)?          # Optional +1 country code
        (?:\(?([0-9]{3})\)?      # Area code (may have parentheses)
        [-.\s]?)                 # Optional separator
        ([0-9]{3})               # First 3 digits
        [-.\s]?                  # Optional separator  
        ([0-9]{4})               # Last 4 digits
    ''', re.VERBOSE)
  
    cleaned_numbers = []
    for phone in phone_list:
        match = phone_pattern.search(phone)
        if match:
            area, first, last = match.groups()
            standardized = f"({area}) {first}-{last}"
            cleaned_numbers.append(standardized)
        else:
            cleaned_numbers.append("Invalid number")
  
    return cleaned_numbers

# Test with various formats
phones = [
    "555-123-4567",
    "(555) 123-4567", 
    "555.123.4567",
    "+1 555 123 4567",
    "5551234567",
    "invalid phone"
]

cleaned = clean_phone_numbers(phones)
for original, clean in zip(phones, cleaned):
    print(f"{original:15} → {clean}")
```

### 3. Text Extraction from HTML

```python
import re

html_content = """
<div class="product">
    <h2>Python Programming Book</h2>
    <span class="price">$29.99</span>
    <p class="description">Learn Python from basics to advanced topics.</p>
</div>
<div class="product">
    <h2>Data Science Handbook</h2>
    <span class="price">$39.99</span>
    <p class="description">Complete guide to data analysis with Python.</p>
</div>
"""

# Extract product information
def extract_products(html):
    # Pattern to match entire product blocks
    product_pattern = re.compile(
        r'<div class="product">(.*?)</div>', 
        re.DOTALL  # Makes . match newlines too
    )
  
    # Patterns for individual fields
    title_pattern = re.compile(r'<h2>(.*?)</h2>')
    price_pattern = re.compile(r'<span class="price">\$([\d.]+)</span>')
    desc_pattern = re.compile(r'<p class="description">(.*?)</p>')
  
    products = []
  
    for product_html in product_pattern.findall(html):
        # Extract each field
        title = title_pattern.search(product_html)
        price = price_pattern.search(product_html)
        description = desc_pattern.search(product_html)
      
        if title and price and description:
            products.append({
                'title': title.group(1),
                'price': float(price.group(1)),
                'description': description.group(1)
            })
  
    return products

products = extract_products(html_content)
for product in products:
    print(f"Title: {product['title']}")
    print(f"Price: ${product['price']:.2f}")
    print(f"Description: {product['description']}")
    print("---")
```

> **Warning** : While regex can handle simple HTML parsing, for complex HTML use dedicated parsers like BeautifulSoup. Regex and HTML don't mix well for complex structures.

## Performance and Best Practices

### Compilation Strategy

```python
import re

class TextProcessor:
    def __init__(self):
        # Compile frequently used patterns once
        self.email_pattern = re.compile(r'^[\w.-]+@[\w.-]+\.\w+$')
        self.phone_pattern = re.compile(r'\b\d{3}-\d{3}-\d{4}\b')
        self.url_pattern = re.compile(r'https?://[\w.-]+/\S*')
  
    def extract_contacts(self, text):
        """Extract all contact information from text"""
        return {
            'emails': self.email_pattern.findall(text),
            'phones': self.phone_pattern.findall(text), 
            'urls': self.url_pattern.findall(text)
        }
```

### When Regex Becomes Too Complex

```python
# HARD TO MAINTAIN: Complex nested pattern
complex_pattern = r'(?:(?:https?://)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:/[^\s]*)?)'

# BETTER: Break down into readable parts
def build_url_pattern():
    protocol = r'(?:https?://)?'          # Optional protocol
    subdomain = r'(?:www\.)?'             # Optional www
    domain = r'(?:[a-zA-Z0-9-]+\.)+'      # Domain parts
    tld = r'[a-zA-Z]{2,}'                 # Top level domain
    path = r'(?:/[^\s]*)?'                # Optional path
  
    return re.compile(protocol + subdomain + domain + tld + path)

url_pattern = build_url_pattern()

# EVEN BETTER: Use multiple simpler patterns
def extract_urls_robust(text):
    # Start with simple cases, add complexity as needed
    simple_urls = re.findall(r'https?://\S+', text)
    www_urls = re.findall(r'www\.\S+', text)
    # Combine and validate results
    return simple_urls + www_urls
```

> **Regex Complexity Rule** : If your regex needs comments to understand, consider breaking it into multiple simpler patterns or using a parser library.

---

Regular expressions in Python provide a powerful tool for pattern matching and text processing. The key is knowing when to use them versus simpler string methods, and building patterns progressively from simple to complex. Start with basic patterns, use groups to extract data, and leverage substitution for text transformation. Remember that readable code is often more valuable than clever regex, so choose the right tool for the job.
