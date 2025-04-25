# Python Basic Data Types: First Principles

Let's explore Python's foundational data types from first principles. These building blocks form the basis of all Python programs and understanding them thoroughly will give you a solid foundation for your programming journey.

## What Are Data Types?

At the most fundamental level, computers store information as patterns of electrical signals - sequences of 0s and 1s (binary). Data types are abstractions that allow us to work with this information in meaningful ways. They define:

1. How the data is stored in memory
2. What operations can be performed on the data
3. What values the data can take

Python's basic data types act as the vocabulary of the language - they're the fundamental units of meaning that everything else is built upon.

## 1. Integers (`int`)

Integers represent whole numbers without fractional parts.

### First Principles of Integers

In Python, integers are implemented as objects with unlimited precision. This means they can be as large as your computer's memory allows, without the overflow issues that plague many other languages.

When you create an integer in Python, the interpreter:

1. Allocates memory for the integer object
2. Stores the value in that memory location
3. Returns a reference to that memory location

### Examples of Integer Operations

```python
# Creating integers
a = 5       # Direct assignment
b = int(7)  # Using the int constructor
c = int("9") # Converting a string to an integer

# Basic operations
sum_result = a + b     # Addition: 12
diff_result = b - a    # Subtraction: 2
product = a * b        # Multiplication: 35
quotient = b // a      # Integer division: 1 (drops the fractional part)
remainder = 7 % 3      # Modulo (remainder): 1
power = 2 ** 3         # Exponentiation: 8

# Comparison operations
is_equal = (a == 5)    # True
is_greater = (b > a)   # True

# Bit operations
bit_and = 5 & 3        # Bitwise AND: 1 (101 & 011 = 001)
bit_or = 5 | 3         # Bitwise OR: 7 (101 | 011 = 111)
```

In these examples, we're creating integer objects and performing various operations on them. Python handles all the memory management for us, making it easy to focus on the logic of our program.

### Integer Internal Representation

When you create an integer like `x = 42`, Python:

1. Creates an object of type `int`
2. Assigns the value 42 to it
3. Makes the name `x` reference this object

You can confirm this with:

```python
x = 42
print(type(x))  # <class 'int'>
print(id(x))    # Shows the memory address of the object
```

## 2. Floating-Point Numbers (`float`)

Floats represent real numbers with decimal points or in scientific notation.

### First Principles of Floats

Floating-point numbers in Python follow the IEEE 754 standard, typically using 64 bits (double precision). This representation includes:

* A sign bit (positive or negative)
* An exponent (for scale)
* A mantissa (the significant digits)

This structure allows for a wide range of values but has limitations in precision that stem from the binary nature of computers.

### Examples of Float Operations

```python
# Creating floats
x = 3.14              # Direct decimal notation
y = 2.71828           # Another float
z = float(5)          # Converting an integer to float: 5.0
w = float("2.5")      # Converting a string to float: 2.5
scientific = 6.022e23 # Scientific notation: 6.022 × 10²³

# Basic operations
sum_float = x + y     # Addition: 5.85828
product_float = x * z # Multiplication: 15.7
division = 5 / 2      # True division: 2.5 (always returns a float)
power_float = y ** 2  # Exponentiation: 7.389
```

### Float Precision Considerations

One key aspect of floating-point numbers is that they cannot represent all decimal numbers exactly due to their binary nature:

```python
# Precision example
result = 0.1 + 0.2
print(result)         # 0.30000000000000004, not exactly 0.3
print(result == 0.3)  # False - demonstrates precision issues
```

This happens because some decimal fractions cannot be represented exactly in binary. When working with financial calculations or any application requiring exact decimal representation, consider using the `decimal` module instead.

## 3. Strings (`str`)

Strings are sequences of characters used to represent text.

### First Principles of Strings

In Python, strings are:

* Immutable (cannot be changed after creation)
* Unicode by default, supporting characters from virtually any language
* Sequences, meaning they can be indexed and sliced

When you create a string, Python allocates memory for each character and stores additional metadata like the string's length.

### Examples of String Operations

```python
# Creating strings
greeting = "Hello"          # Double quotes
name = 'World'              # Single quotes
message = """Multi-line
string example"""           # Triple quotes for multi-line strings

# String concatenation
full_greeting = greeting + ", " + name + "!"  # "Hello, World!"

# String repetition
repeated = "echo " * 3      # "echo echo echo "

# Indexing (zero-based)
first_char = greeting[0]    # "H"
last_char = greeting[-1]    # "o"

# Slicing (start:end) - end index is exclusive
substring = greeting[1:4]   # "ell" (characters at positions 1, 2, and 3)

# String methods
upper_case = greeting.upper()     # "HELLO"
contains = "e" in greeting        # True
position = greeting.find("l")     # 2 (position of first 'l')
replaced = greeting.replace("l", "p")  # "Heppo"
```

### String Formatting

Python offers several ways to format strings:

```python
name = "Alice"
age = 30

# Using f-strings (Python 3.6+)
f_string = f"My name is {name} and I am {age} years old."

# Using format method
format_string = "My name is {} and I am {} years old.".format(name, age)

# Using % operator (older style)
old_style = "My name is %s and I am %d years old." % (name, age)
```

Each of these approaches produces: "My name is Alice and I am 30 years old."

### String Internal Representation

In Python 3, strings are sequences of Unicode code points. This means they can represent characters from virtually any language:

```python
# Unicode support
unicode_example = "こんにちは"  # Japanese: "Hello"
emoji = "😊"                  # Emoji
```

## 4. Boolean (`bool`)

Booleans represent truth values: either `True` or `False`.

### First Principles of Booleans

Booleans are implemented as a subclass of integers in Python, where:

* `True` is equivalent to the integer 1
* `False` is equivalent to the integer 0

This heritage enables booleans to be used in arithmetic operations, though this is generally avoided for clarity.

### Examples of Boolean Operations

```python
# Creating booleans
x = True
y = False
z = bool(1)      # True (any non-zero number is treated as True)
w = bool(0)      # False
empty = bool("") # False (empty strings are falsy)
full = bool("a") # True (non-empty strings are truthy)

# Logical operations
and_result = x and y   # False (True AND False)
or_result = x or y     # True (True OR False)
not_result = not x     # False (NOT True)

# Comparison operations producing booleans
greater = 5 > 3        # True
less_equal = 7 <= 4    # False
equality = 5 == 5      # True
inequality = 5 != 5    # False
```

### Truth Value Testing

Every object in Python has an inherent truth value:

```python
# Examples of truthy and falsy values
print(bool(0))         # False
print(bool(42))        # True
print(bool(""))        # False
print(bool("Hello"))   # True
print(bool([]))        # False (empty list)
print(bool([1, 2, 3])) # True (non-empty list)
print(bool(None))      # False

# This is used in conditional statements
value = 42
if value:
    print("Value is truthy")  # This will run because 42 is truthy
```

## Checking and Converting Between Data Types

Python provides functions to check types and convert between them:

```python
# Checking types
x = 42
print(type(x))         # <class 'int'>
print(isinstance(x, int))  # True

# Type conversions
integer_value = 42
float_value = float(integer_value)    # 42.0
string_value = str(integer_value)     # "42"
bool_value = bool(integer_value)      # True

# Convert string to number
num_string = "123"
number = int(num_string)      # 123
```

## Memory Model and Object Identity

Understanding how Python stores these data types in memory helps explain some of their behavior:

```python
# Variable assignment creates a reference to an object
a = 5
b = a      # b references the same object as a
print(a is b)  # True - they reference the same object

# But with mutable objects (not our basic types), this can cause surprises
# For immutable types like our basic types, this is less of an issue
c = 5
d = 5
print(c is d)  # True - Python often reuses small integer objects

# Large integers are not interned (reused)
large1 = 1000000
large2 = 1000000
print(large1 is large2)  # May be False, depending on implementation
```

## Practical Applications

Let's see how these basic data types work together in a simple program:

```python
def calculate_total_cost(item_price, quantity, tax_rate, discount=0):
    """
    Calculate the total cost of an order with tax and discount.
  
    Args:
        item_price (float): Price of a single item
        quantity (int): Number of items purchased
        tax_rate (float): Tax rate as a decimal (e.g., 0.08 for 8%)
        discount (float): Discount amount to subtract from total (default 0)
  
    Returns:
        float: Total cost including tax and discount
    """
    # Calculate subtotal (price × quantity)
    subtotal = item_price * quantity
  
    # Apply tax
    tax_amount = subtotal * tax_rate
  
    # Apply discount
    final_total = subtotal + tax_amount - discount
  
    # Return the final amount rounded to 2 decimal places
    return round(final_total, 2)

# Example usage
price = 24.99          # float: item price
count = 3              # int: quantity
tax = 0.08             # float: 8% tax rate
coupon = 10.00         # float: $10 discount

total = calculate_total_cost(price, count, tax, coupon)
is_expensive = total > 50  # bool: whether the total exceeds $50

# Create a receipt message
receipt = f"""
RECEIPT
-------
Item price: ${price}
Quantity: {count}
Subtotal: ${price * count:.2f}
Tax (8%): ${price * count * tax:.2f}
Discount: ${coupon:.2f}
Total: ${total:.2f}

Premium purchase: {is_expensive}
"""

print(receipt)
```

This example shows how integers, floats, strings, and booleans work together to create a meaningful program.

## Key Differences Between Basic Data Types

| Type      | Mutability | Use Case                   | Example Literal |
| --------- | ---------- | -------------------------- | --------------- |
| `int`   | Immutable  | Counting, indices          | `42`          |
| `float` | Immutable  | Measurements, calculations | `3.14159`     |
| `str`   | Immutable  | Text, data representation  | `"Hello"`     |
| `bool`  | Immutable  | Logic, conditions          | `True`        |

## Summary

Python's basic data types provide the foundation for all Python programs:

1. **Integers (`int`)** : Whole numbers without decimal points, used for counting and indexing
2. **Floating-point numbers (`float`)** : Real numbers with decimal points, used for measurements and calculations
3. **Strings (`str`)** : Sequences of characters, used for text representation
4. **Booleans (`bool`)** : Truth values (`True` or `False`), used for logical operations

Understanding these types from first principles allows you to build more complex data structures and algorithms with confidence. As you advance in Python, you'll encounter more data types and structures built on these fundamentals, such as lists, dictionaries, and custom classes.

Remember that Python is dynamically typed, meaning variables can change types during execution, but the objects themselves are strongly typed, with well-defined operations and behaviors.
