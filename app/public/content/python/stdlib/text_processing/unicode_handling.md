# Unicode Handling in Python: From First Principles

## Understanding Text at the Fundamental Level

Before diving into Python's Unicode handling, we need to understand what text actually *is* at the computer level.

### The Fundamental Problem: Representing Text as Numbers

Computers only understand numbers (specifically, binary numbers). So how do we represent text? We need a mapping system.

```python
# At the most basic level, computers store everything as numbers
# Let's see how Python shows us the numeric value of characters
print(ord('A'))  # 65 - the number that represents 'A'
print(ord('a'))  # 97 - the number that represents 'a'
print(chr(65))   # 'A' - convert number back to character
print(chr(97))   # 'a'
```

> **Key Mental Model** : Every character you see on screen is actually a number in the computer's memory. The question is: which number represents which character?

### The Historical Mess: Multiple Encoding Systems

Early computers used different number-to-character mappings:

```python
# ASCII (American Standard Code for Information Interchange)
# Used numbers 0-127 to represent English characters
ascii_chars = [chr(i) for i in range(32, 127)]
print(''.join(ascii_chars))
# Output: !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~

# But what about other languages?
# Different countries created their own extensions:
# - Latin-1 (ISO 8859-1) for Western European languages
# - Windows-1252 for Windows systems
# - KOI8-R for Russian
# - Shift JIS for Japanese
# ... and hundreds more!
```

> **The Encoding Problem** : The same number could represent different characters depending on which encoding system was used. A file created on a Russian computer might display as gibberish on an American computer.

## Unicode: The Universal Solution

Unicode was created to solve this chaos by providing a single, universal character set.

### What Unicode Actually Is

```python
# Unicode assigns a unique number (called a "code point") to every character
# in every writing system in the world

# Let's explore some Unicode code points
characters = ['A', 'α', '中', '🌟', '🐍']
for char in characters:
    code_point = ord(char)
    print(f"'{char}' → U+{code_point:04X} (decimal: {code_point})")

# Output:
# 'A' → U+0041 (decimal: 65)
# 'α' → U+03B1 (decimal: 945)  
# '中' → U+4E2D (decimal: 20013)
# '🌟' → U+1F31F (decimal: 127775)
# '🐍' → U+1F40D (decimal: 128013)
```

> **Unicode Code Points** : Unicode assigns each character a unique number called a "code point". These are written as U+XXXX where XXXX is the hexadecimal representation.

```
Unicode Planes (Vertical ASCII Diagram):
┌─────────────────────────────────────┐
│ Plane 0: Basic Multilingual Plane  │ U+0000 - U+FFFF
│ (Most common characters)            │
├─────────────────────────────────────┤
│ Plane 1: Supplementary             │ U+10000 - U+1FFFF  
│ (Emojis, ancient scripts)          │
├─────────────────────────────────────┤
│ Plane 2: Supplementary             │ U+20000 - U+2FFFF
│ (More CJK characters)              │
├─────────────────────────────────────┤
│ ... (up to Plane 16)               │
└─────────────────────────────────────┘
```

## Python's String Model: Unicode by Default

### Python 3's Revolutionary Change

```python
# In Python 3, strings are Unicode by default
text = "Hello, 世界! 🌍"
print(type(text))           # <class 'str'>
print(len(text))            # 10 (characters, not bytes!)
print(text[7])              # '界'

# Each character in the string is a Unicode code point
for i, char in enumerate(text):
    if char not in ' !,':  # Skip punctuation for clarity
        print(f"Position {i}: '{char}' (U+{ord(char):04X})")
```

> **Python 3 Mental Model** : In Python 3, a `str` is a sequence of Unicode code points. It's NOT a sequence of bytes. This is fundamentally different from many other languages.

### The Two Types of Text Data in Python

```python
# Python has two distinct types for text data:

# 1. str - Unicode strings (what you usually work with)
unicode_string = "Hello, 世界!"
print(type(unicode_string))     # <class 'str'>
print(repr(unicode_string))     # 'Hello, 世界!'

# 2. bytes - Raw byte sequences
byte_sequence = b"Hello, world!"  # Note the 'b' prefix
print(type(byte_sequence))      # <class 'bytes'>
print(repr(byte_sequence))      # b'Hello, world!'

# They are NOT the same thing!
# print(unicode_string == byte_sequence)  # This would raise an error
```

```
Text Data Types in Python (Vertical Diagram):
┌─────────────────────────────────────┐
│            str                      │
│    (Unicode Code Points)           │
│                                     │
│    "Hello, 世界!"                  │
│                                     │
│         encode()                    │
│            ↓                        │
├─────────────────────────────────────┤
│           bytes                     │
│      (Raw Byte Sequences)          │
│                                     │
│    b'\x48\x65\x6c\x6c\x6f...'     │
│                                     │
│         decode()                    │
│            ↑                        │
└─────────────────────────────────────┘
```

## The encode() Method: From Unicode to Bytes

### Why Encoding is Necessary

```python
# Unicode code points are abstract numbers
# To store them in files or send them over networks, 
# we need to convert them to actual bytes

text = "Hello, 世界!"
print(f"String: {text}")
print(f"Length in characters: {len(text)}")

# Let's see what happens when we encode to different formats
encodings = ['utf-8', 'utf-16', 'latin-1']

for encoding in encodings:
    try:
        encoded = text.encode(encoding)
        print(f"\nEncoded as {encoding}:")
        print(f"  Type: {type(encoded)}")
        print(f"  Length in bytes: {len(encoded)}")
        print(f"  Raw bytes: {encoded}")
        print(f"  Hex representation: {encoded.hex()}")
    except UnicodeEncodeError as e:
        print(f"\n{encoding} encoding failed: {e}")
```

### Understanding UTF-8 Encoding

```python
# UTF-8 is the most common Unicode encoding
# It uses variable-length encoding (1-4 bytes per character)

def analyze_utf8_encoding(text):
    """Show how UTF-8 encodes different characters"""
    print(f"Analyzing UTF-8 encoding of: '{text}'")
  
    encoded = text.encode('utf-8')
    print(f"Total bytes: {len(encoded)}")
  
    byte_index = 0
    for char in text:
        char_encoded = char.encode('utf-8')
        num_bytes = len(char_encoded)
      
        print(f"  '{char}' (U+{ord(char):04X}) → {num_bytes} byte(s): {char_encoded.hex()}")
        byte_index += num_bytes

# Test with characters requiring different byte lengths
analyze_utf8_encoding("A")        # 1 byte
analyze_utf8_encoding("α")        # 2 bytes  
analyze_utf8_encoding("中")       # 3 bytes
analyze_utf8_encoding("🐍")       # 4 bytes
analyze_utf8_encoding("Aα中🐍")   # Mix of all
```

> **UTF-8 Encoding Rule** :
>
> * ASCII characters (U+0000 to U+007F): 1 byte
> * Characters U+0080 to U+07FF: 2 bytes
> * Characters U+0800 to U+FFFF: 3 bytes
> * Characters U+10000 to U+10FFFF: 4 bytes

### Common Encoding Scenarios

```python
# Scenario 1: Saving text to a file
text = "Python 是很棒的! 🐍"

# Write as UTF-8 (recommended for most use cases)
with open('example.txt', 'w', encoding='utf-8') as f:
    f.write(text)

# Scenario 2: Sending data over HTTP
import urllib.parse

# URLs must be encoded
url_data = "search=Python 教程"
encoded_url = urllib.parse.quote(url_data)
print(f"Original: {url_data}")
print(f"URL encoded: {encoded_url}")

# Scenario 3: Working with APIs that expect specific encodings
api_data = {"message": "Hello, 世界!"}
json_string = str(api_data)  # This is still Unicode
json_bytes = json_string.encode('utf-8')  # Now it's bytes for transmission
```

## The decode() Method: From Bytes to Unicode

### Basic Decoding

```python
# decode() converts bytes back to Unicode strings
byte_data = b'\x48\x65\x6c\x6c\x6f\x2c\x20\xe4\xb8\x96\xe7\x95\x8c\x21'

# We need to know the encoding that was used
decoded_text = byte_data.decode('utf-8')
print(f"Bytes: {byte_data}")
print(f"Decoded: {decoded_text}")  # "Hello, 世界!"
```

### The Importance of Knowing the Encoding

```python
# The same bytes can represent different text in different encodings!
mysterious_bytes = b'\xe4\xb8\x96\xe7\x95\x8c'

encodings_to_try = ['utf-8', 'latin-1', 'cp1252']
for encoding in encodings_to_try:
    try:
        result = mysterious_bytes.decode(encoding)
        print(f"{encoding}: '{result}'")
    except UnicodeDecodeError as e:
        print(f"{encoding}: Decoding failed - {e}")

# Output shows completely different results!
# utf-8: '世界'     (correct - Chinese for "world")
# latin-1: 'ä¸ç'   (wrong interpretation)
# cp1252: 'ä¸ç'    (wrong interpretation)
```

> **Critical Principle** : Always know the encoding! The same sequence of bytes can represent completely different text depending on how you decode it.

### Handling Decoding Errors

```python
# Real-world data is messy - you'll encounter decoding errors
problematic_bytes = b'\x48\x65\x6c\x6c\x6f\xff\xfe'  # Contains invalid UTF-8

# Different error handling strategies:
strategies = ['strict', 'ignore', 'replace', 'backslashreplace']

for strategy in strategies:
    try:
        result = problematic_bytes.decode('utf-8', errors=strategy)
        print(f"{strategy}: '{result}' (length: {len(result)})")
    except UnicodeDecodeError as e:
        print(f"{strategy}: Failed - {e}")

# Output:
# strict: Failed - 'utf-8' codec can't decode byte 0xff in position 5
# ignore: 'Hello' (problematic bytes silently removed)
# replace: 'Hello��' (replaced with replacement character)
# backslashreplace: 'Hello\\xff\\xfe' (shows the actual bytes)
```

## Unicode Normalization: When the Same Text Isn't Equal

### The Normalization Problem

```python
# These look identical but are actually different!
text1 = "café"  # Single character é (U+00E9)
text2 = "cafe\u0301"  # e (U+0065) + combining acute accent (U+0301)

print(f"Text 1: '{text1}'")
print(f"Text 2: '{text2}'")
print(f"Look the same? {text1 == text2}")  # False!
print(f"Length 1: {len(text1)}")  # 4
print(f"Length 2: {len(text2)}")  # 5

# Show the actual code points
def show_code_points(text, label):
    print(f"{label}: ", end="")
    for char in text:
        print(f"U+{ord(char):04X}", end=" ")
    print()

show_code_points(text1, "Text 1")
show_code_points(text2, "Text 2")
```

### Unicode Normalization Forms

```python
import unicodedata

# The four normalization forms
text_with_accents = "café naïve résumé"  # Mixed composition

forms = ['NFC', 'NFD', 'NFKC', 'NFKD']
for form in forms:
    normalized = unicodedata.normalize(form, text_with_accents)
    print(f"{form}: '{normalized}' (length: {len(normalized)})")

# Let's see what each form does to a specific character
accent_char = "é"  # Single character
decomposed = "e\u0301"  # e + combining accent

print(f"\nOriginal character: '{accent_char}' (U+{ord(accent_char):04X})")
print(f"Decomposed form: '{decomposed}' (length: {len(decomposed)})")

for form in forms:
    nfc_result = unicodedata.normalize(form, accent_char)
    nfd_result = unicodedata.normalize(form, decomposed)
    print(f"{form}: '{nfc_result}' == '{nfd_result}' → {nfc_result == nfd_result}")
```

> **Unicode Normalization Forms** :
>
> * **NFC** (Canonical Composition): Combines base + combining characters → é
> * **NFD** (Canonical Decomposition): Separates into base + combining → e + ́
> * **NFKC** (Compatibility Composition): Like NFC but also handles compatibility chars
> * **NFKD** (Compatibility Decomposition): Like NFD but also handles compatibility chars

### Practical Normalization Example

```python
def safe_text_comparison(text1, text2):
    """Compare two texts properly, handling Unicode normalization"""
    # Always normalize to NFC for consistent comparison
    normalized1 = unicodedata.normalize('NFC', text1)
    normalized2 = unicodedata.normalize('NFC', text2)
  
    # Also consider case-insensitive comparison
    return normalized1.lower() == normalized2.lower()

# Test with problematic examples
test_cases = [
    ("café", "cafe\u0301"),  # Different compositions
    ("CAFÉ", "café"),        # Different cases
    ("naïve", "naïve"),      # Potentially different accent encodings
]

for text1, text2 in test_cases:
    basic_equal = (text1 == text2)
    safe_equal = safe_text_comparison(text1, text2)
    print(f"'{text1}' vs '{text2}':")
    print(f"  Basic comparison: {basic_equal}")
    print(f"  Safe comparison: {safe_equal}")
    print()
```

## Working with Different Character Sets

### Detecting Encoding

```python
# When you receive text data and don't know the encoding
import chardet  # You might need: pip install chardet

def detect_and_decode(byte_data):
    """Detect encoding and decode bytes to string"""
    # Detect the encoding
    result = chardet.detect(byte_data)
    encoding = result['encoding']
    confidence = result['confidence']
  
    print(f"Detected encoding: {encoding} (confidence: {confidence:.2%})")
  
    if confidence > 0.7:  # Only decode if confident enough
        try:
            decoded = byte_data.decode(encoding)
            return decoded
        except UnicodeDecodeError:
            print("Detection was wrong, falling back to UTF-8 with error handling")
            return byte_data.decode('utf-8', errors='replace')
    else:
        print("Low confidence, using UTF-8 with error handling")
        return byte_data.decode('utf-8', errors='replace')

# Example with different encoded data
test_data = [
    "Hello, 世界!".encode('utf-8'),
    "Bonjour, café!".encode('latin-1'),
    "Привет, мир!".encode('cp1251'),
]

for data in test_data:
    print(f"Raw bytes: {data}")
    decoded = detect_and_decode(data)
    print(f"Decoded: '{decoded}'")
    print("-" * 40)
```

### Working with Files of Unknown Encoding

```python
def read_text_file_safely(filename):
    """Read a text file, trying different encodings"""
    encodings_to_try = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
  
    for encoding in encodings_to_try:
        try:
            with open(filename, 'r', encoding=encoding) as f:
                content = f.read()
                print(f"Successfully read with {encoding}")
                return content
        except UnicodeDecodeError:
            print(f"Failed to read with {encoding}")
            continue
        except FileNotFoundError:
            print(f"File {filename} not found")
            return None
  
    # If all encodings fail, read as bytes and use replacement
    print("All encodings failed, reading as bytes with replacement")
    with open(filename, 'rb') as f:
        raw_bytes = f.read()
        return raw_bytes.decode('utf-8', errors='replace')

# Example usage (you would call this on actual files)
# content = read_text_file_safely('mystery_file.txt')
```

## Common Unicode Pitfalls and Solutions

### Pitfall 1: Mixing Strings and Bytes

```python
# ❌ Common mistake: trying to mix str and bytes
text = "Hello, 世界!"
byte_data = b" How are you?"

# This will raise TypeError
try:
    result = text + byte_data
except TypeError as e:
    print(f"Error: {e}")

# ✅ Correct approaches:
# Option 1: Convert bytes to string
result1 = text + byte_data.decode('utf-8')
print(f"Option 1: {result1}")

# Option 2: Convert string to bytes
result2 = text.encode('utf-8') + byte_data
print(f"Option 2: {result2}")
```

### Pitfall 2: Default Encoding Assumptions

```python
# ❌ Dangerous: relying on default encoding
import locale

print(f"System default encoding: {locale.getpreferredencoding()}")

# Don't do this - encoding varies by system!
# with open('file.txt', 'w') as f:  # Uses system default
#     f.write("文本")

# ✅ Always specify encoding explicitly
with open('file.txt', 'w', encoding='utf-8') as f:
    f.write("文本")

with open('file.txt', 'r', encoding='utf-8') as f:
    content = f.read()
    print(f"Read back: {content}")
```

### Pitfall 3: URL and Form Data Encoding

```python
import urllib.parse

# ❌ Wrong: trying to use Unicode strings in URLs directly
search_term = "Python 教程"
# bad_url = f"https://example.com/search?q={search_term}"  # Will cause issues

# ✅ Correct: properly encode for URLs
encoded_term = urllib.parse.quote(search_term, safe='')
good_url = f"https://example.com/search?q={encoded_term}"
print(f"Properly encoded URL: {good_url}")

# For form data
form_data = {'query': 'Python 教程', 'lang': '中文'}
encoded_form = urllib.parse.urlencode(form_data)
print(f"Form data: {encoded_form}")
```

## Best Practices for Unicode in Python

### 1. The Unicode Sandwich Pattern

```python
"""
The Unicode Sandwich Pattern:
1. Decode bytes to Unicode strings as early as possible (at I/O boundaries)
2. Work with Unicode strings throughout your program
3. Encode back to bytes as late as possible (at I/O boundaries)
"""

def process_text_file(input_filename, output_filename):
    # 🥪 DECODE: Read and immediately convert to Unicode
    with open(input_filename, 'rb') as f:
        raw_bytes = f.read()
        text = raw_bytes.decode('utf-8')  # Convert to Unicode immediately
  
    # 🥪 PROCESS: Work with Unicode strings
    processed_text = text.upper()  # All string operations work naturally
    processed_text = processed_text.replace('OLD', 'NEW')
  
    # 🥪 ENCODE: Convert back to bytes only when writing
    with open(output_filename, 'wb') as f:
        f.write(processed_text.encode('utf-8'))  # Convert to bytes at the end

# This pattern prevents encoding/decoding errors throughout your program
```

### 2. Consistent Normalization Strategy

```python
import unicodedata

def normalize_user_input(text):
    """Normalize all user input consistently"""
    # 1. Strip whitespace
    text = text.strip()
  
    # 2. Normalize Unicode composition
    text = unicodedata.normalize('NFC', text)
  
    # 3. Optional: case normalization
    # text = text.lower()  # Uncomment if case-insensitive
  
    return text

# Use this for all user input
user_inputs = ["  café  ", "cafe\u0301", "CAFÉ"]
for inp in user_inputs:
    normalized = normalize_user_input(inp)
    print(f"'{inp}' → '{normalized}'")
```

### 3. Robust Error Handling

```python
def robust_decode(byte_data, encodings=None):
    """Decode bytes with fallback strategies"""
    if encodings is None:
        encodings = ['utf-8', 'utf-8-sig', 'latin-1']
  
    for encoding in encodings:
        try:
            return byte_data.decode(encoding), encoding
        except UnicodeDecodeError:
            continue
  
    # Final fallback: decode with replacement
    return byte_data.decode('utf-8', errors='replace'), 'utf-8-replace'

def robust_encode(text, encoding='utf-8'):
    """Encode text with error handling"""
    try:
        return text.encode(encoding)
    except UnicodeEncodeError as e:
        print(f"Encoding error: {e}")
        # Fallback strategies
        return text.encode(encoding, errors='replace')

# Example usage
test_bytes = b'\xe4\xb8\x96\xe7\x95\x8c'  # "世界" in UTF-8
decoded_text, used_encoding = robust_decode(test_bytes)
print(f"Decoded '{decoded_text}' using {used_encoding}")
```

## Real-World Application Examples

### Example 1: Processing Multilingual CSV Data

```python
import csv
import unicodedata

def process_multilingual_csv(filename):
    """Process a CSV file that might contain any language"""
  
    # Read with explicit UTF-8 encoding
    with open(filename, 'r', encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
      
        processed_data = []
        for row in reader:
            # Normalize all text fields
            normalized_row = {}
            for key, value in row.items():
                if isinstance(value, str):
                    # Normalize Unicode and strip whitespace
                    normalized_value = unicodedata.normalize('NFC', value.strip())
                    normalized_row[key] = normalized_value
                else:
                    normalized_row[key] = value
          
            processed_data.append(normalized_row)
  
    return processed_data

# Usage example (would work with actual CSV file)
# data = process_multilingual_csv('international_customers.csv')
```

### Example 2: Web Scraping with Unicode

```python
import requests
from html import unescape

def scrape_international_content(url):
    """Scrape web content that might be in any encoding"""
  
    # Get the raw response
    response = requests.get(url)
  
    # requests library handles encoding detection automatically,
    # but let's be explicit about it
    print(f"Detected encoding: {response.encoding}")
  
    # Get the text content (already decoded to Unicode)
    content = response.text
  
    # HTML entities need to be unescaped
    content = unescape(content)
  
    # Normalize Unicode composition
    content = unicodedata.normalize('NFC', content)
  
    return content

# The beauty of Python 3: once you have Unicode strings,
# all string operations work naturally regardless of language
def extract_keywords(text):
    """Extract keywords - works with any language"""
    # Simple keyword extraction (you could use more sophisticated NLP)
    words = text.split()
  
    # Filter out short words and normalize case
    keywords = [word.lower() for word in words if len(word) > 3]
  
    return list(set(keywords))  # Remove duplicates

# This would work with content in Chinese, Arabic, Russian, etc.
# keywords = extract_keywords(content)
```

> **The Power of Unicode** : Once your text is properly decoded into Python Unicode strings, all string operations work naturally regardless of the original language or script. This is the magic of Python 3's Unicode-first approach.

Understanding Unicode handling is crucial for any Python developer working with text data. The key principles are:

1. **Always be explicit about encoding** when reading/writing files or data
2. **Use the Unicode sandwich pattern** - decode early, work with Unicode, encode late
3. **Normalize Unicode text** when comparing or processing user input
4. **Handle encoding errors gracefully** with appropriate fallback strategies
5. **Remember that bytes ≠ strings** - they are fundamentally different types

With these principles, you can confidently handle text in any language, from any source, in your Python applications.
