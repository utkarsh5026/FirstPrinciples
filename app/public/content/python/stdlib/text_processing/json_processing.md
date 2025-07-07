# JSON Processing in Python: From First Principles

## What is JSON and Why Does It Exist?

Before diving into Python's JSON handling, let's understand what JSON actually is and the fundamental problem it solves.

> **The Core Problem** : Different programming languages represent data differently in memory. How do we share structured data between systems, applications, or over networks in a way that both humans and computers can easily read and write?

JSON (JavaScript Object Notation) emerged as a solution to this data interchange problem. It's a text-based format that represents structured data using a syntax that's both human-readable and machine-parseable.

```python
# This Python dictionary exists only in Python's memory:
python_data = {"name": "Alice", "age": 30, "skills": ["Python", "JavaScript"]}

# This JSON string can be sent over networks, saved to files, 
# or read by any programming language:
json_string = '{"name": "Alice", "age": 30, "skills": ["Python", "JavaScript"]}'
```

## The Data Type Mapping Problem

The fundamental challenge in JSON processing is mapping between Python's rich type system and JSON's limited but universal type system:

```
Python Types          →    JSON Types
================================================================
dict                  →    Object {}
list, tuple           →    Array []
str                   →    String ""
int, float            →    Number
True, False           →    true, false
None                  →    null
```

> **Key Insight** : JSON has only 6 data types (object, array, string, number, boolean, null), while Python has dozens. This limitation is intentional - it ensures maximum compatibility across different systems.

## Basic Serialization: Python → JSON

Serialization is the process of converting Python objects into JSON strings:

```python
import json

# Basic serialization examples
data = {
    "name": "Alice",
    "age": 30,
    "is_active": True,
    "balance": None,
    "skills": ["Python", "JavaScript", "SQL"]
}

# Convert Python object to JSON string
json_string = json.dumps(data)
print(json_string)
# Output: {"name": "Alice", "age": 30, "is_active": true, "balance": null, "skills": ["Python", "JavaScript", "SQL"]}

# Notice the transformations:
# Python True → JSON true
# Python None → JSON null
# Python strings use single quotes → JSON uses double quotes
```

### Pretty-Printing for Human Readability

```python
# Make JSON human-readable with indentation
pretty_json = json.dumps(data, indent=2)
print(pretty_json)
# Output:
# {
#   "name": "Alice",
#   "age": 30,
#   "is_active": true,
#   "balance": null,
#   "skills": [
#     "Python",
#     "JavaScript",
#     "SQL"
#   ]
# }

# Additional formatting options
formatted_json = json.dumps(data, 
                           indent=2,           # 2-space indentation
                           sort_keys=True,     # Sort dictionary keys
                           separators=(',', ': '))  # Custom separators
```

## Basic Deserialization: JSON → Python

Deserialization is the reverse process - converting JSON strings back into Python objects:

```python
# Starting with a JSON string
json_data = '{"name": "Bob", "scores": [85, 92, 78], "passed": true}'

# Convert JSON string to Python object
python_obj = json.loads(json_data)
print(python_obj)
# Output: {'name': 'Bob', 'scores': [85, 92, 78], 'passed': True}
print(type(python_obj))  # <class 'dict'>

# Access the data like any Python dictionary
print(python_obj["name"])        # Bob
print(python_obj["scores"][0])   # 85
print(python_obj["passed"])      # True (notice: JSON true → Python True)
```

## Working with Files

Real applications often read JSON from files or write JSON to files:

```python
# Writing Python data to a JSON file
student_data = {
    "students": [
        {"name": "Alice", "grade": "A", "subjects": ["Math", "Science"]},
        {"name": "Bob", "grade": "B", "subjects": ["History", "English"]}
    ],
    "class": "10th Grade",
    "year": 2024
}

# Write to file
with open('students.json', 'w') as file:
    json.dump(student_data, file, indent=2)
    # json.dump() writes directly to file
    # json.dumps() returns a string

# Reading from file
with open('students.json', 'r') as file:
    loaded_data = json.load(file)
    # json.load() reads from file
    # json.loads() reads from string

print(loaded_data["class"])  # 10th Grade
print(len(loaded_data["students"]))  # 2
```

> **Common Confusion** : Remember the 's' in the function names:
>
> * `dumps()` and `loads()` work with **s**trings
> * `dump()` and `load()` work with **files**

## Understanding JSON's Limitations

Not all Python objects can be directly serialized to JSON:

```python
import datetime
from decimal import Decimal

# These will cause errors:
problematic_data = {
    "date": datetime.datetime.now(),    # datetime objects not supported
    "price": Decimal("19.99"),          # Decimal not supported
    "data": {1, 2, 3},                  # sets not supported
    "coord": (10, 20)                   # tuples become arrays (usually okay)
}

try:
    json.dumps(problematic_data)
except TypeError as e:
    print(f"Error: {e}")
    # Error: Object of type datetime is not JSON serializable
```

### Converting Unsupported Types

```python
# Solution 1: Convert manually before serialization
safe_data = {
    "date": datetime.datetime.now().isoformat(),  # Convert to string
    "price": float(Decimal("19.99")),             # Convert to float
    "data": list({1, 2, 3}),                     # Convert set to list
    "coord": [10, 20]                            # Tuple becomes list anyway
}

json_string = json.dumps(safe_data)
print(json_string)
```

## Custom JSON Encoders

For complex objects, you can create custom encoders:

```python
import json
import datetime
from decimal import Decimal

class CustomJSONEncoder(json.JSONEncoder):
    """Custom encoder to handle datetime and Decimal objects"""
  
    def default(self, obj):
        # This method is called for objects that aren't natively serializable
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        elif isinstance(obj, set):
            return list(obj)
      
        # Let the base class handle other objects
        return super().default(obj)

# Using the custom encoder
complex_data = {
    "timestamp": datetime.datetime.now(),
    "price": Decimal("29.99"),
    "tags": {"python", "json", "tutorial"}
}

# This works now!
json_string = json.dumps(complex_data, cls=CustomJSONEncoder, indent=2)
print(json_string)
```

### Alternative: Using the `default` Parameter

```python
def json_serializer(obj):
    """Custom serialization function"""
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    elif isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, set):
        return list(obj)
  
    # This will raise TypeError for unknown types
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

# Using the function directly
json_string = json.dumps(complex_data, default=json_serializer, indent=2)
```

## Custom JSON Decoders

Sometimes you want to automatically convert JSON back to specific Python types:

```python
class CustomJSONDecoder(json.JSONDecoder):
    """Custom decoder to reconstruct datetime objects"""
  
    def __init__(self, *args, **kwargs):
        super().__init__(object_hook=self.object_hook, *args, **kwargs)
  
    def object_hook(self, obj):
        # This method is called for every JSON object
        for key, value in obj.items():
            # Look for ISO datetime strings and convert them back
            if key.endswith('_datetime') or key == 'timestamp':
                try:
                    obj[key] = datetime.datetime.fromisoformat(value)
                except (ValueError, TypeError):
                    pass  # Keep original value if conversion fails
      
        return obj

# Example usage
json_data = '{"name": "Alice", "timestamp": "2024-01-15T10:30:00"}'

# Regular decoding
normal_result = json.loads(json_data)
print(type(normal_result["timestamp"]))  # <class 'str'>

# Custom decoding
custom_result = json.loads(json_data, cls=CustomJSONDecoder)
print(type(custom_result["timestamp"]))  # <class 'datetime.datetime'>
```

## Handling Malformed JSON

JSON parsing can fail, so always handle exceptions:

```python
def safe_json_load(json_string):
    """Safely load JSON with error handling"""
    try:
        return json.loads(json_string), None
    except json.JSONDecodeError as e:
        return None, f"JSON Error: {e}"

# Test with various inputs
test_cases = [
    '{"valid": "json"}',           # Valid
    '{"missing": "quote}',         # Invalid: missing quote
    '{trailing: "comma",}',        # Invalid: trailing comma
    "{'single': 'quotes'}",        # Invalid: single quotes
    '{"valid": true}'              # Valid
]

for test_json in test_cases:
    result, error = safe_json_load(test_json)
    if error:
        print(f"Failed: {error}")
    else:
        print(f"Success: {result}")
```

> **Common JSON Pitfalls** :
>
> * JSON requires double quotes for strings (not single quotes)
> * No trailing commas allowed
> * No comments allowed in JSON
> * All keys must be strings

## Advanced Streaming for Large Files

For very large JSON files, you might need streaming approaches:

```python
import json

def process_large_json_file(filename):
    """Process large JSON files without loading everything into memory"""
    with open(filename, 'r') as file:
        # For line-delimited JSON (each line is a separate JSON object)
        for line_number, line in enumerate(file, 1):
            line = line.strip()
            if line:  # Skip empty lines
                try:
                    json_obj = json.loads(line)
                    # Process each object individually
                    yield json_obj
                except json.JSONDecodeError as e:
                    print(f"Error on line {line_number}: {e}")

# Example usage
# for record in process_large_json_file('large_data.jsonl'):
#     process_record(record)
```

## Real-World JSON Processing Patterns

### Configuration Files

```python
# config.json
config_json = '''
{
    "database": {
        "host": "localhost",
        "port": 5432,
        "name": "myapp"
    },
    "api": {
        "base_url": "https://api.example.com",
        "timeout": 30,
        "retries": 3
    },
    "features": {
        "debug_mode": false,
        "cache_enabled": true
    }
}
'''

class AppConfig:
    """Application configuration from JSON"""
  
    def __init__(self, config_file):
        with open(config_file, 'r') as f:
            self.config = json.load(f)
  
    def get_database_url(self):
        db = self.config['database']
        return f"postgresql://{db['host']}:{db['port']}/{db['name']}"
  
    def is_debug_enabled(self):
        return self.config['features']['debug_mode']

# config = AppConfig('config.json')
```

### API Response Processing

```python
def process_api_response(json_response):
    """Process a typical API response"""
    try:
        data = json.loads(json_response)
      
        # Check for API errors
        if 'error' in data:
            raise Exception(f"API Error: {data['error']['message']}")
      
        # Extract and validate data
        if 'results' not in data:
            raise ValueError("No results in response")
      
        # Process each result
        processed_results = []
        for item in data['results']:
            processed_item = {
                'id': item['id'],
                'name': item['name'],
                'created_at': datetime.datetime.fromisoformat(
                    item['created_at'].replace('Z', '+00:00')
                )
            }
            processed_results.append(processed_item)
      
        return processed_results
      
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON response")
```

## Performance Considerations

```python
import time

# For performance-critical applications, consider:

# 1. Use json.loads() for strings, json.load() for files
# 2. Avoid pretty-printing in production (indent=None)
# 3. Consider using faster JSON libraries for large data

# Timing example
large_data = {"data": list(range(100000))}

# Standard JSON
start = time.time()
json_str = json.dumps(large_data)
result = json.loads(json_str)
standard_time = time.time() - start

print(f"Standard JSON processing: {standard_time:.4f} seconds")

# With compression (for network transfer)
import gzip

start = time.time()
json_bytes = json.dumps(large_data).encode('utf-8')
compressed = gzip.compress(json_bytes)
decompressed = gzip.decompress(compressed)
result = json.loads(decompressed.decode('utf-8'))
compression_time = time.time() - start

print(f"With compression: {compression_time:.4f} seconds")
print(f"Size reduction: {len(json_bytes)} → {len(compressed)} bytes")
```

> **Best Practices for JSON in Python** :
>
> * Always handle `JSONDecodeError` exceptions
> * Use custom encoders/decoders for complex types
> * Consider compression for large JSON data over networks
> * Validate JSON structure before processing critical data
> * Use appropriate indentation (2-4 spaces) for human-readable files
> * Store configuration in JSON files for easy editing

## Memory Model: Understanding JSON Processing

```
Python Object → JSON String → Python Object
     ↓              ↓              ↓
   Memory         Text           Memory
   Format        Format         Format
     ↓              ↓              ↓
 Rich types    Limited types   Rich types
    dict           object         dict
    list           array          list
    str            string         str
    int            number         int
   bool           boolean        bool
   None            null          None
```

JSON serves as a universal "lingua franca" for data exchange - a common language that different systems can speak, even if they represent data very differently internally.
