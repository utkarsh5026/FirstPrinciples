# Python Exception Types: Understanding Errors from First Principles

## What Are Exceptions Fundamentally?

Before diving into specific exception types, let's understand what exceptions represent in computational thinking:

> **Core Concept** : An exception is Python's way of saying "I encountered a situation I can't handle with normal program flow." Instead of crashing silently or producing incorrect results, Python raises an exception to signal that something unexpected happened.

Think of exceptions like error messages in human communication. When someone asks you "What's the square root of -1?" in basic arithmetic, you can't give a real number answer - you need to signal that this request has a problem.

```python
# This represents a computational impossibility in basic arithmetic
import math
try:
    result = math.sqrt(-1)  # This will raise ValueError
except ValueError as e:
    print(f"Can't compute: {e}")
    # Output: Can't compute: math domain error
```

## Python's Exception Philosophy

> **Python's Approach** : "It's easier to ask for forgiveness than permission" (EAFP)
>
> Python encourages trying operations and handling exceptions rather than checking conditions beforehand. This reflects Python's philosophy of optimistic programming.

```python
# Non-Pythonic (LBYL - Look Before You Leap)
if len(my_list) > index and index >= 0:
    value = my_list[index]
else:
    print("Invalid index")

# Pythonic (EAFP - Easier to Ask for Forgiveness than Permission)
try:
    value = my_list[index]
except IndexError:
    print("Invalid index")
```

---

## The Big Five: Core Exception Types

### 1.  **ValueError** : "The Type is Right, But the Value is Wrong"

> **Mental Model** : ValueError occurs when you pass a function an argument of the correct type, but with an inappropriate value that the function can't work with.

```python
# ValueError examples - correct type, wrong value

# Example 1: Converting invalid string to integer
try:
    number = int("hello")  # str type is correct, but "hello" can't be an int
except ValueError as e:
    print(f"Conversion failed: {e}")
    # Output: Conversion failed: invalid literal for int() with base 10: 'hello'

# Example 2: Math domain errors
import math
try:
    result = math.sqrt(-5)  # float type is correct, but negative values invalid
except ValueError as e:
    print(f"Math error: {e}")
    # Output: Math error: math domain error

# Example 3: Unpacking with wrong number of values
try:
    a, b = [1, 2, 3]  # list type is correct, but has 3 items, not 2
except ValueError as e:
    print(f"Unpacking error: {e}")
    # Output: Unpacking error: too many values to unpack (expected 2)
```

**When ValueError Typically Occurs:**

* String to number conversions with invalid strings
* Mathematical operations outside valid domains
* Unpacking sequences with mismatched lengths
* Functions receiving valid types but logically invalid values

### 2.  **TypeError** : "Wrong Type Entirely"

> **Mental Model** : TypeError occurs when you try to use an operation on an object that doesn't support that operation, or when you pass completely wrong types to functions.

```python
# TypeError examples - wrong types for operations

# Example 1: Unsupported operation between types
try:
    result = "hello" + 5  # Can't add string and integer
except TypeError as e:
    print(f"Type mismatch: {e}")
    # Output: Type mismatch: can only concatenate str (not "int") to str

# Example 2: Calling non-callable objects
try:
    number = 42
    result = number()  # Trying to "call" an integer like a function
except TypeError as e:
    print(f"Call error: {e}")
    # Output: Call error: 'int' object is not callable

# Example 3: Wrong argument types to functions
try:
    length = len(42)  # len() expects sequences/collections, not numbers
except TypeError as e:
    print(f"Function error: {e}")
    # Output: Function error: object of type 'int' has no len()

# Example 4: Unsupported operations on types
try:
    my_list = [1, 2, 3]
    result = my_list[1.5]  # Lists need integer indices, not floats
except TypeError as e:
    print(f"Index error: {e}")
    # Output: Index error: list indices must be integers or slices, not float
```

**When TypeError Typically Occurs:**

* Using operators between incompatible types
* Calling non-callable objects
* Passing wrong types to functions
* Using inappropriate types for operations (like float indices)

### 3.  **IndexError** : "Valid Container, Invalid Position"

> **Mental Model** : IndexError occurs when you try to access a position in a sequence (list, tuple, string) that doesn't exist. The container itself is fine, but you're asking for a location that's out of bounds.

```python
# IndexError examples - accessing invalid positions

# Example 1: List index out of range
my_list = [10, 20, 30]  # Valid indices: 0, 1, 2
try:
    value = my_list[5]  # Asking for index 5, which doesn't exist
except IndexError as e:
    print(f"List error: {e}")
    # Output: List error: list index out of range

# Example 2: String index out of range
text = "Python"  # Valid indices: 0,1,2,3,4,5 (length 6)
try:
    char = text[10]  # Asking for position 10 in a 6-character string
except IndexError as e:
    print(f"String error: {e}")
    # Output: String error: string index out of range

# Example 3: Negative indices that go too far
try:
    value = my_list[-5]  # my_list only has 3 items, so -5 is invalid
except IndexError as e:
    print(f"Negative index error: {e}")
    # Output: Negative index error: list index out of range

# Example 4: Empty list access
empty_list = []
try:
    first_item = empty_list[0]  # No items exist, so index 0 is invalid
except IndexError as e:
    print(f"Empty list error: {e}")
    # Output: Empty list error: list index out of range
```

**Visual Representation:**

```
my_list = [10, 20, 30]
indices:   0   1   2

Valid: my_list[0] → 10
Valid: my_list[2] → 30
Invalid: my_list[3] → IndexError!
Invalid: my_list[-4] → IndexError!
```

**When IndexError Typically Occurs:**

* Accessing list/tuple elements beyond the container's length
* Using invalid string positions
* Working with empty sequences
* Off-by-one errors in loops

### 4.  **KeyError** : "Valid Dictionary, Invalid Key"

> **Mental Model** : KeyError occurs when you try to access a dictionary key that doesn't exist. The dictionary itself is perfectly fine, but you're asking for a key that was never added to it.

```python
# KeyError examples - accessing non-existent keys

# Example 1: Basic missing key
student_grades = {"Alice": 95, "Bob": 87, "Carol": 92}
try:
    grade = student_grades["David"]  # "David" key doesn't exist
except KeyError as e:
    print(f"Missing student: {e}")
    # Output: Missing student: 'David'

# Example 2: Case sensitivity matters
try:
    grade = student_grades["alice"]  # "alice" != "Alice"
except KeyError as e:
    print(f"Case sensitive error: {e}")
    # Output: Case sensitive error: 'alice'

# Example 3: Deleting then accessing
try:
    del student_grades["Bob"]  # Remove Bob from dictionary
    bobs_grade = student_grades["Bob"]  # Now Bob's key is gone
except KeyError as e:
    print(f"Deleted key error: {e}")
    # Output: Deleted key error: 'Bob'

# Example 4: Wrong data type for key
mixed_dict = {1: "one", "two": 2, 3.0: "three"}
try:
    value = mixed_dict["1"]  # Looking for string "1", but key is integer 1
except KeyError as e:
    print(f"Type mismatch: {e}")
    # Output: Type mismatch: '1'
```

**Safe Alternatives to Avoid KeyError:**

```python
# Method 1: Use .get() with default value
grade = student_grades.get("David", "Not found")
print(grade)  # Output: Not found

# Method 2: Check if key exists first
if "David" in student_grades:
    grade = student_grades["David"]
else:
    print("Student not found")

# Method 3: Use try/except for complex logic
try:
    grade = student_grades["David"]
    print(f"David's grade: {grade}")
except KeyError:
    print("Adding David to database...")
    student_grades["David"] = 0
```

**When KeyError Typically Occurs:**

* Accessing dictionary keys that don't exist
* Typos in key names
* Case sensitivity issues
* Using wrong data types as keys

### 5.  **AttributeError** : "Object Exists, But Attribute/Method Doesn't"

> **Mental Model** : AttributeError occurs when you try to access an attribute or method that doesn't exist on an object. The object itself is valid, but you're asking for something it doesn't have.

```python
# AttributeError examples - accessing non-existent attributes/methods

# Example 1: Method doesn't exist on this type
try:
    number = 42
    number.append(50)  # integers don't have an append method
except AttributeError as e:
    print(f"Method error: {e}")
    # Output: Method error: 'int' object has no attribute 'append'

# Example 2: Attribute doesn't exist
try:
    text = "Hello"
    length = text.length  # strings don't have .length, they use len()
except AttributeError as e:
    print(f"Attribute error: {e}")
    # Output: Attribute error: 'str' object has no attribute 'length'

# Example 3: Typo in method name
try:
    my_list = [1, 2, 3]
    my_list.apend(4)  # typo: should be "append"
except AttributeError as e:
    print(f"Typo error: {e}")
    # Output: Typo error: 'list' object has no attribute 'apend'

# Example 4: Wrong object type assumption
def process_data(data):
    try:
        return data.upper()  # assumes data is a string
    except AttributeError as e:
        print(f"Type assumption error: {e}")
        return str(data).upper()  # convert to string first

# Test with wrong type
result = process_data(123)  # passing int instead of string
# Output: Type assumption error: 'int' object has no attribute 'upper'
```

**When AttributeError Typically Occurs:**

* Calling methods that don't exist on an object type
* Typos in attribute/method names
* Assuming wrong object types
* Accessing attributes before they're defined

---

## Exception Hierarchy and Relationships

> **Key Insight** : All these exceptions inherit from a common base class, allowing you to catch multiple related errors efficiently.

```python
# Exception hierarchy (simplified)
"""
BaseException
 └── Exception
     ├── ValueError
     ├── TypeError  
     ├── LookupError
     │   ├── IndexError
     │   └── KeyError
     └── AttributeError
"""

# Catching multiple related exceptions
def safe_access(container, key_or_index):
    try:
        return container[key_or_index]
    except (IndexError, KeyError) as e:
        return f"Access failed: {e}"
    except TypeError as e:
        return f"Type problem: {e}"

# Test the function
print(safe_access([1, 2, 3], 5))        # IndexError
print(safe_access({"a": 1}, "b"))       # KeyError  
print(safe_access([1, 2, 3], "hello"))  # TypeError
```

---

## Practical Debugging Patterns

> **Best Practice** : When debugging, the exception type tells you exactly what category of problem you're dealing with, making fixes more targeted.

```python
# Debugging decision tree based on exception type

def debug_by_exception_type():
    data = [1, 2, 3]
    lookup = {"key1": "value1"}
  
    # ValueError: Check your input values
    try:
        int("not_a_number")
    except ValueError:
        print("Check if input string contains valid number format")
  
    # TypeError: Check your data types
    try:
        data + "string"
    except TypeError:
        print("Check if you're mixing incompatible types")
  
    # IndexError: Check your boundaries
    try:
        data[10]
    except IndexError:
        print("Check if index is within list length")
  
    # KeyError: Check your keys
    try:
        lookup["missing_key"]
    except KeyError:
        print("Check if key exists in dictionary")
  
    # AttributeError: Check your object types and method names
    try:
        data.nonexistent_method()
    except AttributeError:
        print("Check if method exists on this object type")

debug_by_exception_type()
```

These five exception types form the foundation of Python error handling. Understanding them helps you write more robust code and debug problems more efficiently by immediately knowing what category of issue you're dealing with.
