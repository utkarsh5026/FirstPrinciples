# Text Processing in Python: From First Principles

Let's build up text processing from the ground up, starting with what text actually means to a computer and progressing to sophisticated Python patterns.

## Understanding Text Computationally

At its core, text processing is about transforming sequences of characters according to rules. Computers represent text as sequences of numbers (character codes), and all text operations are ultimately pattern matching and transformation algorithms.

```python
# Text is fundamentally a sequence of characters
text = "Hello, World!"
print([ord(char) for char in text])  # Character codes
# Output: [72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33]

# Python strings are immutable sequences
original = "hello"
new_text = original.upper()  # Creates new string
print(f"Original: {original}, New: {new_text}")
# Original remains unchanged: "hello"
```

> **Key Principle** : Python strings are immutable sequences of Unicode characters. Every "modification" creates a new string object, which has important implications for performance and memory usage.

## Fundamental Text Operations

### 1. Basic String Manipulation

```python
# String creation and basic operations
text = "  Python Programming  "

# Inspection methods
print(f"Length: {len(text)}")
print(f"Contains 'Python': {'Python' in text}")
print(f"Starts with space: {text.startswith(' ')}")

# Transformation methods (all return new strings)
cleaned = text.strip()          # Remove whitespace
lowered = text.lower()          # Convert to lowercase
replaced = text.replace("Python", "Java")  # Replace substring

print(f"Original: '{text}'")
print(f"Cleaned: '{cleaned}'")
```

### 2. String Indexing and Slicing

```python
text = "Programming"

# Indexing (0-based, negative indexing from end)
print(f"First char: {text[0]}")      # 'P'
print(f"Last char: {text[-1]}")      # 'g'

# Slicing [start:end:step]
print(f"First 4: {text[:4]}")        # 'Prog'
print(f"Last 4: {text[-4:]}")        # 'ming'
print(f"Every 2nd: {text[::2]}")     # 'Pormig'
print(f"Reversed: {text[::-1]}")     # 'gnimmargorP'
```

ASCII diagram of string indexing:

```
Text: P r o g r a m m i n g
Pos:  0 1 2 3 4 5 6 7 8 9 10
Neg: -11-10-9-8-7-6-5-4-3-2-1
```

## Text Parsing Patterns

Parsing is the process of analyzing text structure to extract meaningful components. Python provides multiple approaches, from simple to sophisticated.

### 1. Split-Based Parsing

```python
# Simple delimiter-based parsing
csv_line = "John,25,Engineer,New York"
fields = csv_line.split(',')
print(fields)  # ['John', '25', 'Engineer', 'New York']

# More sophisticated splitting
data = "apple:5,banana:3,orange:7"
items = {}
for pair in data.split(','):
    key, value = pair.split(':')
    items[key] = int(value)
print(items)  # {'apple': 5, 'banana': 3, 'orange': 7}

# Handling edge cases
text = "a,,b,c,"  # Empty fields and trailing delimiter
fields = [field for field in text.split(',') if field]  # Filter empty
print(fields)  # ['a', 'b', 'c']
```

### 2. Character-by-Character Parsing

```python
def parse_simple_json_string(text):
    """Parse a simple JSON-like string manually."""
    result = {}
    i = 0
  
    while i < len(text):
        if text[i] == '"':  # Start of key
            # Find end of key
            key_start = i + 1
            i += 1
            while i < len(text) and text[i] != '"':
                i += 1
            key = text[key_start:i]
          
            # Skip to value
            i += 1
            while i < len(text) and text[i] in ' :':
                i += 1
              
            # Parse value (simplified - assumes quoted strings)
            if text[i] == '"':
                value_start = i + 1
                i += 1
                while i < len(text) and text[i] != '"':
                    i += 1
                value = text[value_start:i]
                result[key] = value
        i += 1
  
    return result

# Example usage
simple_json = '{"name": "John", "age": "25"}'
parsed = parse_simple_json_string(simple_json)
print(parsed)  # {'name': 'John', 'age': '25'}
```

### 3. Regular Expression Parsing

```python
import re

# Pattern matching for structured data
log_line = "2024-01-15 14:30:22 ERROR Failed to connect to database"

# Define pattern with named groups
log_pattern = r'(?P<date>\d{4}-\d{2}-\d{2}) (?P<time>\d{2}:\d{2}:\d{2}) (?P<level>\w+) (?P<message>.*)'

match = re.match(log_pattern, log_line)
if match:
    log_data = match.groupdict()
    print(log_data)
    # {'date': '2024-01-15', 'time': '14:30:22', 'level': 'ERROR', 'message': 'Failed to connect to database'}

# Multiple matches
text = "Email: john@example.com, Phone: (555) 123-4567"
email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
phone_pattern = r'\(\d{3}\) \d{3}-\d{4}'

emails = re.findall(email_pattern, text)
phones = re.findall(phone_pattern, text)
print(f"Emails: {emails}, Phones: {phones}")
```

> **Parsing Mental Model** : Always consider three approaches: 1) Split on delimiters (fastest, simple), 2) Character-by-character (most control, complex), 3) Regular expressions (powerful, moderate complexity). Choose based on data complexity and performance needs.

## Text Validation Patterns

Validation ensures text conforms to expected formats and constraints.

### 1. Format Validation

```python
import re
from typing import Tuple

def validate_email(email: str) -> Tuple[bool, str]:
    """Validate email format with detailed feedback."""
    if not email:
        return False, "Email cannot be empty"
  
    if len(email) > 254:  # RFC limit
        return False, "Email too long (max 254 characters)"
  
    # Basic pattern check
    pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    if not re.match(pattern, email):
        return False, "Invalid email format"
  
    # Additional checks
    local, domain = email.rsplit('@', 1)
    if len(local) > 64:
        return False, "Local part too long (max 64 characters)"
  
    return True, "Valid email"

# Test validation
test_emails = [
    "user@example.com",      # Valid
    "invalid.email",         # No @ symbol
    "a" * 65 + "@test.com",  # Local part too long
    ""                       # Empty
]

for email in test_emails:
    valid, message = validate_email(email)
    print(f"'{email}': {valid} - {message}")
```

### 2. Content Validation

```python
def validate_password_strength(password: str) -> dict:
    """Comprehensive password validation."""
    results = {
        'valid': True,
        'errors': [],
        'strength': 0
    }
  
    # Length check
    if len(password) < 8:
        results['errors'].append("Password must be at least 8 characters")
        results['valid'] = False
    else:
        results['strength'] += 1
  
    # Character type checks
    checks = [
        (r'[a-z]', "lowercase letter"),
        (r'[A-Z]', "uppercase letter"),
        (r'[0-9]', "digit"),
        (r'[!@#$%^&*(),.?":{}|<>]', "special character")
    ]
  
    for pattern, description in checks:
        if re.search(pattern, password):
            results['strength'] += 1
        else:
            results['errors'].append(f"Password must contain at least one {description}")
            results['valid'] = False
  
    # Sequence checks
    if re.search(r'(.)\1{2,}', password):  # Three same characters in a row
        results['errors'].append("Password cannot have repeating characters")
        results['valid'] = False
  
    return results

# Test password validation
passwords = ["password", "Password1!", "Str0ng!Pass", "aaa111"]
for pwd in passwords:
    result = validate_password_strength(pwd)
    print(f"'{pwd}': Strength {result['strength']}/5, Errors: {result['errors']}")
```

### 3. Data Type Validation

```python
def smart_type_converter(value: str) -> Tuple[object, str]:
    """Convert string to appropriate Python type."""
    original = value
    value = value.strip()
  
    # None/null values
    if value.lower() in ('none', 'null', ''):
        return None, 'none'
  
    # Boolean values
    if value.lower() in ('true', 'yes', '1'):
        return True, 'boolean'
    if value.lower() in ('false', 'no', '0'):
        return False, 'boolean'
  
    # Numeric values
    try:
        # Try integer first
        if '.' not in value and 'e' not in value.lower():
            return int(value), 'integer'
        else:
            return float(value), 'float'
    except ValueError:
        pass
  
    # Date patterns
    date_patterns = [
        (r'\d{4}-\d{2}-\d{2}', '%Y-%m-%d'),
        (r'\d{2}/\d{2}/\d{4}', '%m/%d/%Y'),
    ]
  
    for pattern, fmt in date_patterns:
        if re.match(pattern, value):
            try:
                from datetime import datetime
                return datetime.strptime(value, fmt), 'date'
            except ValueError:
                pass
  
    # Default to string
    return original, 'string'

# Test type conversion
test_values = ["123", "45.67", "true", "2024-01-15", "hello", "  null  "]
for val in test_values:
    converted, type_name = smart_type_converter(val)
    print(f"'{val}' -> {converted} ({type_name})")
```

## Text Extraction Patterns

Extraction involves finding and pulling specific information from unstructured or semi-structured text.

### 1. Pattern-Based Extraction

```python
import re
from collections import defaultdict

def extract_entities(text: str) -> dict:
    """Extract various entities from text using patterns."""
    entities = defaultdict(list)
  
    # Patterns for different entities
    patterns = {
        'emails': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'phones': r'(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}',
        'urls': r'https?://[^\s<>"{}|\\^`\[\]]+',
        'dates': r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b',
        'currency': r'\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?',
        'hashtags': r'#\w+',
        'mentions': r'@\w+'
    }
  
    for entity_type, pattern in patterns.items():
        matches = re.findall(pattern, text, re.IGNORECASE)
        entities[entity_type] = matches
  
    return dict(entities)

# Example usage
social_media_post = """
Just bought a new laptop for $1,299.99! 
Contact me at john.doe@email.com or (555) 123-4567
Check out the review: https://techreview.com/laptop-review
#technology #laptop @TechReviewer
Order date: 2024-01-15
"""

extracted = extract_entities(social_media_post)
for entity_type, items in extracted.items():
    if items:
        print(f"{entity_type.title()}: {items}")
```

### 2. Context-Aware Extraction

```python
def extract_key_value_pairs(text: str) -> dict:
    """Extract key-value pairs from natural language text."""
    result = {}
  
    # Pattern for "key: value" or "key is value"
    kv_patterns = [
        r'(\w+(?:\s+\w+)*)\s*:\s*([^\n,;]+)',        # "name: John"
        r'(\w+(?:\s+\w+)*)\s+is\s+([^\n,;.]+)',      # "age is 25"
        r'(\w+(?:\s+\w+)*)\s*=\s*([^\n,;]+)',        # "status = active"
    ]
  
    for pattern in kv_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            key = match.group(1).strip().lower().replace(' ', '_')
            value = match.group(2).strip()
          
            # Clean up value
            value = re.sub(r'^["\']|["\']$', '', value)  # Remove quotes
            result[key] = value
  
    return result

# Example usage
description = """
The product name: Premium Widget Pro
The price is $99.99
Status = Available
Color: Blue
Weight is 2.5 pounds
"""

extracted_data = extract_key_value_pairs(description)
print("Extracted data:", extracted_data)
```

### 3. Multi-Step Extraction Pipeline

```python
class TextExtractor:
    """A pipeline for complex text extraction tasks."""
  
    def __init__(self):
        self.steps = []
  
    def add_step(self, name: str, function):
        """Add an extraction step to the pipeline."""
        self.steps.append((name, function))
        return self
  
    def process(self, text: str) -> dict:
        """Run the full extraction pipeline."""
        results = {'original_text': text}
      
        for step_name, func in self.steps:
            try:
                step_result = func(text)
                results[step_name] = step_result
            except Exception as e:
                results[step_name] = {'error': str(e)}
      
        return results

# Define extraction functions
def extract_sentences(text):
    """Split text into sentences."""
    # Simple sentence splitting (can be improved with NLTK)
    sentences = re.split(r'[.!?]+', text)
    return [s.strip() for s in sentences if s.strip()]

def extract_numbers(text):
    """Extract all numbers from text."""
    return {
        'integers': [int(x) for x in re.findall(r'\b\d+\b', text)],
        'floats': [float(x) for x in re.findall(r'\b\d+\.\d+\b', text)],
        'currency': re.findall(r'\$\d+(?:\.\d{2})?', text)
    }

def extract_capitalized_words(text):
    """Extract words that start with capital letters."""
    return re.findall(r'\b[A-Z][a-z]+\b', text)

# Build and use extraction pipeline
extractor = (TextExtractor()
             .add_step('sentences', extract_sentences)
             .add_step('numbers', extract_numbers)
             .add_step('proper_nouns', extract_capitalized_words)
             .add_step('entities', extract_entities))

sample_text = """
John Smith works at Apple Inc. He earned $75,000.50 last year.
His phone number is (555) 123-4567 and email is john@apple.com.
The company is located in California.
"""

extraction_results = extractor.process(sample_text)
for step, result in extraction_results.items():
    print(f"\n{step.upper()}:")
    print(result)
```

## Text Transformation Patterns

Transformation involves converting text from one format or structure to another while preserving or modifying its meaning.

### 1. Case and Format Transformations

```python
import re

def to_snake_case(text: str) -> str:
    """Convert CamelCase or Title Case to snake_case."""
    # Insert underscore before uppercase letters (except first)
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', text)
    # Insert underscore before uppercase letters preceded by lowercase
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1)
    return s2.lower()

def to_camel_case(text: str) -> str:
    """Convert snake_case or kebab-case to camelCase."""
    components = re.split('[-_\s]+', text.lower())
    return components[0] + ''.join(word.capitalize() for word in components[1:])

def to_title_case(text: str) -> str:
    """Convert to Title Case with proper handling of articles."""
    # Articles and prepositions that should remain lowercase (except at start)
    lowercase_words = {'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 
                      'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'}
  
    words = text.lower().split()
    result = []
  
    for i, word in enumerate(words):
        if i == 0 or word not in lowercase_words:
            result.append(word.capitalize())
        else:
            result.append(word)
  
    return ' '.join(result)

# Test transformations
test_cases = [
    "XMLHttpRequest",
    "user_profile_data", 
    "my-component-name",
    "the lord of the rings"
]

for text in test_cases:
    print(f"Original: {text}")
    print(f"  Snake: {to_snake_case(text)}")
    print(f"  Camel: {to_camel_case(text)}")
    print(f"  Title: {to_title_case(text)}")
    print()
```

### 2. Content Transformation

```python
def text_summarizer(text: str, max_sentences: int = 3) -> str:
    """Simple extractive text summarization."""
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
  
    if len(sentences) <= max_sentences:
        return text
  
    # Score sentences by word frequency
    word_freq = {}
    all_words = re.findall(r'\b\w+\b', text.lower())
  
    for word in all_words:
        if len(word) > 3:  # Skip short words
            word_freq[word] = word_freq.get(word, 0) + 1
  
    # Score each sentence
    sentence_scores = []
    for sentence in sentences:
        words = re.findall(r'\b\w+\b', sentence.lower())
        score = sum(word_freq.get(word, 0) for word in words if len(word) > 3)
        sentence_scores.append((score, sentence))
  
    # Get top sentences
    sentence_scores.sort(reverse=True)
    top_sentences = [sent for _, sent in sentence_scores[:max_sentences]]
  
    # Maintain original order
    result = []
    for sentence in sentences:
        if sentence in top_sentences:
            result.append(sentence)
  
    return '. '.join(result) + '.'

# Test summarization
long_text = """
Python is a high-level programming language. It was created by Guido van Rossum 
and first released in 1991. Python emphasizes code readability and simplicity. 
The language supports multiple programming paradigms including procedural, 
object-oriented, and functional programming. Python has a large standard library. 
It is widely used in web development, data science, and artificial intelligence. 
The Python community is very active and supportive. Many major companies use 
Python for their applications.
"""

summary = text_summarizer(long_text, max_sentences=2)
print("Original length:", len(long_text.split()))
print("Summary length:", len(summary.split()))
print("\nSummary:", summary)
```

### 3. Template-Based Transformation

```python
import re
from string import Template

class AdvancedTemplate:
    """Enhanced template system with conditional logic and loops."""
  
    def __init__(self, template: str):
        self.template = template
  
    def render(self, context: dict) -> str:
        """Render template with context data."""
        result = self.template
      
        # Handle conditionals: {{if condition}}content{{endif}}
        result = self._process_conditionals(result, context)
      
        # Handle loops: {{for item in items}}content{{endfor}}
        result = self._process_loops(result, context)
      
        # Handle simple variable substitution: {{variable}}
        result = self._process_variables(result, context)
      
        return result
  
    def _process_conditionals(self, text: str, context: dict) -> str:
        """Process conditional blocks."""
        pattern = r'\{\{if\s+(\w+)\}\}(.*?)\{\{endif\}\}'
      
        def replace_conditional(match):
            condition = match.group(1)
            content = match.group(2)
            return content if context.get(condition) else ''
      
        return re.sub(pattern, replace_conditional, text, flags=re.DOTALL)
  
    def _process_loops(self, text: str, context: dict) -> str:
        """Process loop blocks."""
        pattern = r'\{\{for\s+(\w+)\s+in\s+(\w+)\}\}(.*?)\{\{endfor\}\}'
      
        def replace_loop(match):
            item_var = match.group(1)
            list_var = match.group(2)
            content = match.group(3)
          
            items = context.get(list_var, [])
            result = []
          
            for item in items:
                loop_context = context.copy()
                loop_context[item_var] = item
                processed_content = self._process_variables(content, loop_context)
                result.append(processed_content)
          
            return ''.join(result)
      
        return re.sub(pattern, replace_loop, text, flags=re.DOTALL)
  
    def _process_variables(self, text: str, context: dict) -> str:
        """Process variable substitutions."""
        pattern = r'\{\{(\w+)\}\}'
      
        def replace_var(match):
            var_name = match.group(1)
            return str(context.get(var_name, ''))
      
        return re.sub(pattern, replace_var, text)

# Example usage
email_template = """
Dear {{name}},

{{if is_premium}}
Thank you for being a premium member!
{{endif}}

Your recent orders:
{{for order in orders}}
- Order #{{order}}: ${{price}}
{{endfor}}

Best regards,
Customer Service
"""

context = {
    'name': 'John Doe',
    'is_premium': True,
    'orders': ['12345', '12346', '12347'],
    'price': '99.99'
}

template = AdvancedTemplate(email_template)
rendered = template.render(context)
print(rendered)
```

## Advanced Text Processing Patterns

### 1. Streaming Text Processing

```python
def process_large_file(filename: str, chunk_size: int = 8192):
    """Process large text files without loading entirely into memory."""
  
    def extract_emails_streaming(file_obj):
        """Extract emails from file stream."""
        buffer = ""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
      
        for chunk in iter(lambda: file_obj.read(chunk_size), ''):
            buffer += chunk
          
            # Process complete lines
            while '\n' in buffer:
                line, buffer = buffer.split('\n', 1)
                emails = re.findall(email_pattern, line)
                for email in emails:
                    yield email
      
        # Process remaining buffer
        if buffer:
            emails = re.findall(email_pattern, buffer)
            for email in emails:
                yield email
  
    # Example: create a test file and process it
    test_content = """
    Contact john@example.com for more info.
    Also reach out to mary@company.org.
    Sales team: sales@business.net
    """ * 1000  # Simulate large file
  
    with open('temp_large_file.txt', 'w') as f:
        f.write(test_content)
  
    # Process the file
    unique_emails = set()
    with open('temp_large_file.txt', 'r') as f:
        for email in extract_emails_streaming(f):
            unique_emails.add(email)
  
    print(f"Found {len(unique_emails)} unique emails")
    print("Sample emails:", list(unique_emails)[:3])

# Run streaming example
process_large_file('dummy')
```

### 2. Text Normalization Pipeline

```python
import unicodedata
import re

class TextNormalizer:
    """Comprehensive text normalization for consistent processing."""
  
    def __init__(self):
        self.steps = []
  
    def add_step(self, func):
        """Add a normalization step."""
        self.steps.append(func)
        return self
  
    def normalize(self, text: str) -> str:
        """Apply all normalization steps."""
        for step in self.steps:
            text = step(text)
        return text
  
    @staticmethod
    def remove_accents(text: str) -> str:
        """Remove accents from characters."""
        return ''.join(c for c in unicodedata.normalize('NFD', text)
                      if unicodedata.category(c) != 'Mn')
  
    @staticmethod
    def normalize_whitespace(text: str) -> str:
        """Normalize all whitespace to single spaces."""
        return re.sub(r'\s+', ' ', text.strip())
  
    @staticmethod
    def remove_punctuation(text: str) -> str:
        """Remove punctuation except for specific cases."""
        # Keep some punctuation that might be meaningful
        return re.sub(r'[^\w\s@.-]', '', text)
  
    @staticmethod
    def normalize_case(text: str) -> str:
        """Convert to lowercase."""
        return text.lower()
  
    @staticmethod
    def expand_contractions(text: str) -> str:
        """Expand common English contractions."""
        contractions = {
            "won't": "will not",
            "can't": "cannot",
            "n't": " not",
            "'re": " are",
            "'ve": " have",
            "'ll": " will",
            "'d": " would",
            "'m": " am"
        }
      
        for contraction, expansion in contractions.items():
            text = text.replace(contraction, expansion)
      
        return text

# Build normalization pipeline
normalizer = (TextNormalizer()
             .add_step(TextNormalizer.normalize_whitespace)
             .add_step(TextNormalizer.expand_contractions)
             .add_step(TextNormalizer.remove_accents)
             .add_step(TextNormalizer.normalize_case)
             .add_step(TextNormalizer.remove_punctuation))

# Test normalization
test_texts = [
    "Hello,    World!   I'm excited about this café...",
    "We won't be able to attend the soirée tomorrow.",
    "É-mail addresses like josé@España.com need special handling."
]

for text in test_texts:
    normalized = normalizer.normalize(text)
    print(f"Original:   '{text}'")
    print(f"Normalized: '{normalized}'")
    print()
```

> **Text Processing Philosophy** : Always consider the trade-offs between accuracy, performance, and complexity. Simple string methods are often sufficient and much faster than regular expressions. Use regex for pattern matching, but consider specialized libraries (like NLTK or spaCy) for complex linguistic processing.

### 3. Error-Tolerant Text Processing

```python
from difflib import SequenceMatcher

def fuzzy_text_matcher(text: str, patterns: list, threshold: float = 0.6) -> list:
    """Find approximate matches for patterns in text."""
    words = text.lower().split()
    matches = []
  
    for pattern in patterns:
        pattern_lower = pattern.lower()
        for i, word in enumerate(words):
            similarity = SequenceMatcher(None, pattern_lower, word).ratio()
            if similarity >= threshold:
                matches.append({
                    'pattern': pattern,
                    'match': word,
                    'similarity': similarity,
                    'position': i,
                    'context': ' '.join(words[max(0, i-2):i+3])
                })
  
    return sorted(matches, key=lambda x: x['similarity'], reverse=True)

def auto_correct_common_errors(text: str) -> str:
    """Automatically correct common text errors."""
    corrections = {
        # Common typos
        r'\bteh\b': 'the',
        r'\brecieve\b': 'receive',
        r'\bseperate\b': 'separate',
        r'\bdefinate\b': 'definite',
      
        # Extra spaces
        r'\s+': ' ',
      
        # Multiple punctuation
        r'[.]{2,}': '...',
        r'[!]{2,}': '!',
        r'[?]{2,}': '?',
      
        # Common formatting issues
        r'(\w),(\w)': r'\1, \2',  # Add space after comma
        r'(\w)\.(\w)': r'\1. \2',  # Add space after period
    }
  
    corrected = text
    for pattern, replacement in corrections.items():
        corrected = re.sub(pattern, replacement, corrected, flags=re.IGNORECASE)
  
    return corrected.strip()

# Test error-tolerant processing
sample_text = "Teh receival of seperate emails.It is definate that we need auto-correction,don't you think???"
search_patterns = ["the", "receive", "separate", "definite"]

print("Original:", sample_text)
print("Corrected:", auto_correct_common_errors(sample_text))
print("\nFuzzy matches:")
matches = fuzzy_text_matcher(sample_text, search_patterns)
for match in matches[:3]:
    print(f"  '{match['pattern']}' ≈ '{match['match']}' (similarity: {match['similarity']:.2f})")
```

## Real-World Applications and Best Practices

> **Performance Considerations** :
>
> * String concatenation in loops is inefficient; use `''.join()` for multiple concatenations
> * Compile regex patterns if using them repeatedly: `pattern = re.compile(r'...')`
> * For large files, use streaming/chunked processing instead of loading everything into memory
> * Consider `str.translate()` for character replacement - it's faster than multiple `str.replace()` calls

### Complete Example: Log File Analyzer

```python
import re
from collections import defaultdict, Counter
from datetime import datetime
from typing import Dict, List, Tuple

class LogAnalyzer:
    """Comprehensive log file analysis tool."""
  
    def __init__(self):
        self.log_pattern = re.compile(
            r'(?P<timestamp>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) '
            r'(?P<level>\w+) '
            r'(?P<message>.*)'
        )
        self.ip_pattern = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')
      
    def parse_log_line(self, line: str) -> Dict:
        """Parse a single log line."""
        match = self.log_pattern.match(line.strip())
        if not match:
            return None
      
        data = match.groupdict()
      
        # Extract additional information
        data['ips'] = self.ip_pattern.findall(data['message'])
        data['timestamp_obj'] = datetime.strptime(data['timestamp'], '%Y-%m-%d %H:%M:%S')
      
        return data
  
    def analyze_logs(self, log_text: str) -> Dict:
        """Perform comprehensive log analysis."""
        lines = log_text.strip().split('\n')
      
        stats = {
            'total_lines': len(lines),
            'parsed_lines': 0,
            'level_counts': Counter(),
            'hourly_activity': defaultdict(int),
            'error_messages': [],
            'unique_ips': set(),
            'time_range': {'start': None, 'end': None}
        }
      
        for line in lines:
            parsed = self.parse_log_line(line)
            if parsed:
                stats['parsed_lines'] += 1
                stats['level_counts'][parsed['level']] += 1
              
                # Track time-based patterns
                hour = parsed['timestamp_obj'].hour
                stats['hourly_activity'][hour] += 1
              
                # Track time range
                if stats['time_range']['start'] is None:
                    stats['time_range']['start'] = parsed['timestamp_obj']
                    stats['time_range']['end'] = parsed['timestamp_obj']
                else:
                    if parsed['timestamp_obj'] < stats['time_range']['start']:
                        stats['time_range']['start'] = parsed['timestamp_obj']
                    if parsed['timestamp_obj'] > stats['time_range']['end']:
                        stats['time_range']['end'] = parsed['timestamp_obj']
              
                # Collect error information
                if parsed['level'].upper() in ['ERROR', 'CRITICAL']:
                    stats['error_messages'].append({
                        'timestamp': parsed['timestamp'],
                        'message': parsed['message']
                    })
              
                # Track IP addresses
                stats['unique_ips'].update(parsed['ips'])
      
        # Convert sets to lists for JSON serialization
        stats['unique_ips'] = list(stats['unique_ips'])
      
        return stats
  
    def generate_report(self, stats: Dict) -> str:
        """Generate a human-readable analysis report."""
        report = ["=== LOG ANALYSIS REPORT ===\n"]
      
        # Basic statistics
        report.append(f"Total lines processed: {stats['total_lines']}")
        report.append(f"Successfully parsed: {stats['parsed_lines']}")
        report.append(f"Parse success rate: {stats['parsed_lines']/stats['total_lines']*100:.1f}%\n")
      
        # Time range
        if stats['time_range']['start']:
            report.append(f"Time range: {stats['time_range']['start']} to {stats['time_range']['end']}")
            duration = stats['time_range']['end'] - stats['time_range']['start']
            report.append(f"Duration: {duration}\n")
      
        # Log levels
        report.append("Log level distribution:")
        for level, count in stats['level_counts'].most_common():
            percentage = count / stats['parsed_lines'] * 100
            report.append(f"  {level}: {count} ({percentage:.1f}%)")
      
        # Peak hours
        if stats['hourly_activity']:
            peak_hour = max(stats['hourly_activity'], key=stats['hourly_activity'].get)
            report.append(f"\nPeak activity hour: {peak_hour}:00 ({stats['hourly_activity'][peak_hour]} events)")
      
        # IP addresses
        report.append(f"\nUnique IP addresses: {len(stats['unique_ips'])}")
        if stats['unique_ips']:
            report.append(f"Sample IPs: {', '.join(stats['unique_ips'][:5])}")
      
        # Recent errors
        if stats['error_messages']:
            report.append(f"\nRecent errors ({len(stats['error_messages'])} total):")
            for error in stats['error_messages'][-3:]:  # Show last 3 errors
                report.append(f"  {error['timestamp']}: {error['message'][:100]}...")
      
        return '\n'.join(report)

# Example usage
sample_logs = """
2024-01-15 10:30:15 INFO User login successful from 192.168.1.100
2024-01-15 10:31:22 WARNING Failed login attempt from 10.0.0.50
2024-01-15 10:32:45 ERROR Database connection failed: timeout after 30s
2024-01-15 11:15:33 INFO Data backup completed successfully
2024-01-15 11:16:01 CRITICAL System disk space below 5% from 172.16.0.1
2024-01-15 12:45:10 INFO User logout: session ended normally
"""

analyzer = LogAnalyzer()
analysis = analyzer.analyze_logs(sample_logs)
report = analyzer.generate_report(analysis)
print(report)
```

This comprehensive exploration demonstrates how Python's text processing capabilities build from simple string operations to sophisticated analysis pipelines. The key is understanding when to use each approach and how to combine them effectively for real-world applications.
