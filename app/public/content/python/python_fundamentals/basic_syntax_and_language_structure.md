# Python: From First Principles

Python is a high-level, interpreted programming language designed with readability and simplicity in mind. Let's explore its basic syntax and language structure from the ground up.

## The Philosophy of Python

Python was created by Guido van Rossum with a philosophy summarized in "The Zen of Python," which emphasizes readability, simplicity, and explicitness. This philosophy shapes every aspect of the language's design.

One key principle is that code is read more often than it's written, so Python prioritizes human readability over machine efficiency. This explains why Python uses indentation for code blocks rather than brackets or keywords - it forces a consistent, readable style.

## Basic Elements of Python

### Expressions and Statements

At its most fundamental level, Python code consists of expressions and statements.

**Expressions** are combinations of values, variables, and operators that Python can evaluate to produce a value.

For example:

```python
2 + 3           # Evaluates to 5
"Hello" + "!"   # Evaluates to "Hello!"
7 > 5           # Evaluates to True
```

In each case, Python evaluates the expression to produce a single value.

**Statements** are complete lines of code that perform some action. They may contain expressions, but they don't necessarily produce a value themselves.

```python
x = 10          # Assignment statement
print("Hello")  # Function call statement
if x > 5:       # Control flow statement
    print("x is greater than 5")
```

### Variables and Assignment

Variables in Python are names that refer to values. They're created through assignment:

```python
name = "Alice"
age = 30
is_student = True
```

Unlike many languages, Python variables:

* Don't need to be declared before use
* Don't have explicit types attached to them
* Can be reassigned to values of different types

When Python executes `name = "Alice"`, it:

1. Creates a string object with the value "Alice"
2. Creates a name "name" in the current namespace
3. Makes this name refer to that string object

This is fundamentally different from languages where variables are "boxes" that store values. In Python, variables are more like "labels" attached to objects.

### Data Types

Python has several built-in data types:

**Numeric Types:**

```python
# Integer - whole numbers
age = 25

# Float - decimal numbers
height = 1.75

# Complex - numbers with real and imaginary parts
complex_number = 3 + 4j
```

**Sequence Types:**

```python
# String - immutable sequence of characters
name = "Alice"
also_name = 'Alice'  # Single or double quotes work the same

# List - mutable sequence of elements (can be of different types)
fruits = ["apple", "banana", "cherry"]

# Tuple - immutable sequence of elements
coordinates = (10.5, 20.3)
```

**Mapping Type:**

```python
# Dictionary - collection of key-value pairs
person = {"name": "Alice", "age": 30, "is_student": True}
```

**Set Types:**

```python
# Set - unordered collection of unique elements
unique_numbers = {1, 2, 3, 4, 5}
```

**Boolean Type:**

```python
# Boolean - True or False
is_valid = True
has_permission = False
```

**None Type:**

```python
# None - represents absence of value
result = None
```

### Operators

Python includes various operators for different operations:

**Arithmetic Operators:**

```python
addition = 5 + 3        # 8
subtraction = 5 - 3     # 2
multiplication = 5 * 3  # 15
division = 5 / 3        # 1.6666...
floor_division = 5 // 3 # 1
modulus = 5 % 3         # 2
exponentiation = 5 ** 3 # 125
```

**Comparison Operators:**

```python
equal = 5 == 5          # True
not_equal = 5 != 3      # True
greater_than = 5 > 3    # True
less_than = 5 < 3       # False
greater_or_equal = 5 >= 5  # True
less_or_equal = 5 <= 6     # True
```

**Logical Operators:**

```python
# and - True if both operands are True
result1 = True and False  # False

# or - True if at least one operand is True
result2 = True or False   # True

# not - Negates the operand
result3 = not True        # False
```

**Identity Operators:**

```python
# is - Returns True if both variables reference the same object
x = [1, 2, 3]
y = [1, 2, 3]
z = x
print(x is z)  # True - x and z reference the same object
print(x is y)  # False - x and y are equal but different objects

# is not - Returns True if variables reference different objects
print(x is not y)  # True
```

**Membership Operators:**

```python
# in - Returns True if a value exists in a sequence
fruits = ["apple", "banana", "cherry"]
print("apple" in fruits)  # True

# not in - Returns True if a value doesn't exist in a sequence
print("orange" not in fruits)  # True
```

## Control Flow

### Indentation

Python uses indentation (whitespace at the beginning of a line) to define code blocks. This is different from many other languages that use braces {} or keywords.

```python
if age > 18:
    print("Adult")  # This line is indented, part of the if block
    print("Can vote")  # Also part of the if block
print("This code always runs")  # Not indented, not part of the if block
```

The standard is to use 4 spaces for each level of indentation, though any consistent number of spaces (or tabs) will work.

### Conditional Statements

**if, elif, else:**

```python
age = 20

if age < 13:
    print("Child")
elif age < 18:
    print("Teenager")
else:
    print("Adult")
```

This works by:

1. Evaluating the first condition (`age < 13`)
2. If True, executing its block and skipping the rest
3. If False, moving to the next condition (`age < 18`)
4. If all conditions are False, executing the `else` block (if present)

### Loops

**for loop** - Iterates over a sequence:

```python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(f"I like {fruit}")
```

The loop works by:

1. Taking each element from the sequence one by one
2. Assigning it to the loop variable (`fruit`)
3. Executing the loop body with that variable

**while loop** - Repeats as long as a condition is True:

```python
count = 0

while count < 5:
    print(count)
    count += 1  # Increment count to avoid infinite loop
```

The loop works by:

1. Testing the condition (`count < 5`)
2. If True, executing the loop body
3. Testing the condition again
4. Repeating until the condition becomes False

**Loop control statements:**

```python
for i in range(10):
    if i == 3:
        continue  # Skip the rest of this iteration
    if i == 7:
        break  # Exit the loop completely
    print(i)
```

This will print 0, 1, 2, 4, 5, 6 (skipping 3 and stopping at 7).

## Functions

Functions are reusable blocks of code that perform specific tasks:

```python
def greet(name):
    """This is a docstring that describes what the function does"""
    return f"Hello, {name}!"

# Calling the function
message = greet("Alice")
print(message)  # Prints: Hello, Alice!
```

Components of a function:

* `def` keyword indicates a function definition
* Function name (`greet`)
* Parameters in parentheses (`name`)
* Docstring (optional but recommended) describing the function
* Function body (indented code block)
* `return` statement (optional) specifying what the function outputs

**Parameters and Arguments:**

```python
def describe_person(name, age, occupation="student"):
    return f"{name} is {age} years old and works as a {occupation}."

# Positional arguments
print(describe_person("Alice", 30, "engineer"))

# Keyword arguments
print(describe_person(age=25, name="Bob", occupation="doctor"))

# Default parameter
print(describe_person("Charlie", 19))  # Uses default occupation="student"
```

This function demonstrates:

* Required parameters (`name`, `age`)
* Optional parameter with default value (`occupation="student"`)
* Positional arguments (values passed in parameter order)
* Keyword arguments (values passed by parameter name)

## Data Structures in Detail

### Lists

Lists are ordered, mutable collections:

```python
# Creating a list
fruits = ["apple", "banana", "cherry"]

# Accessing elements (0-indexed)
first_fruit = fruits[0]  # "apple"
last_fruit = fruits[-1]  # "cherry"

# Slicing
subset = fruits[0:2]  # ["apple", "banana"]

# Modifying
fruits[1] = "blueberry"  # Replace "banana" with "blueberry"
fruits.append("orange")  # Add to the end
fruits.insert(1, "kiwi")  # Insert at position 1
removed = fruits.pop()  # Remove and return the last item
fruits.remove("apple")  # Remove first occurrence of "apple"

# List comprehensions - powerful way to create lists
squares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]
```

### Dictionaries

Dictionaries store key-value pairs:

```python
# Creating a dictionary
person = {
    "name": "Alice",
    "age": 30,
    "skills": ["Python", "SQL", "JavaScript"]
}

# Accessing values
name = person["name"]  # "Alice"
age = person.get("age")  # 30
# Using get() avoids errors if key doesn't exist
hobby = person.get("hobby", "No hobby listed")  # Returns default if key not found

# Modifying
person["age"] = 31  # Update value
person["location"] = "New York"  # Add new key-value pair
del person["skills"]  # Remove key-value pair

# Iterating
for key in person:
    print(f"{key}: {person[key]}")

# Get all keys, values, or items
keys = person.keys()
values = person.values()
items = person.items()  # Returns (key, value) tuples
```

## Modules and Imports

Python promotes code reuse through modules:

```python
# Importing an entire module
import math
result = math.sqrt(16)  # 4.0

# Importing specific functions
from random import randint
random_number = randint(1, 10)  # Random integer between 1 and 10

# Importing with alias
import datetime as dt
today = dt.date.today()

# Importing all functions (generally not recommended)
from math import *
result = sqrt(16)  # No need for math.sqrt
```

When you import a module, Python:

1. Searches for the module in a list of directories
2. Executes the module code once
3. Creates a namespace for the module
4. Makes the module's functions, classes, and variables available

## Object-Oriented Programming

Python is a multi-paradigm language, but has strong support for object-oriented programming:

```python
class Person:
    # Class variable (shared by all instances)
    species = "Homo sapiens"
  
    # Constructor method
    def __init__(self, name, age):
        # Instance variables (unique to each instance)
        self.name = name
        self.age = age
  
    # Instance method
    def greet(self):
        return f"Hello, my name is {self.name}!"
  
    # Another instance method
    def celebrate_birthday(self):
        self.age += 1
        return f"{self.name} is now {self.age} years old."

# Creating an object (instance of the class)
alice = Person("Alice", 30)

# Using methods
print(alice.greet())  # "Hello, my name is Alice!"
print(alice.celebrate_birthday())  # "Alice is now 31 years old."

# Accessing attributes
print(alice.name)  # "Alice"
print(alice.species)  # "Homo sapiens"
```

The class definition demonstrates:

* `class` keyword followed by the class name
* Constructor method `__init__` that initializes new objects
* `self` parameter referring to the instance being operated on
* Instance methods that can access and modify the object's attributes
* Class variables shared by all instances of the class

## Exception Handling

Python uses try-except blocks to handle errors gracefully:

```python
try:
    # Code that might raise an exception
    number = int(input("Enter a number: "))
    result = 10 / number
    print(f"10 divided by {number} is {result}")
except ValueError:
    # Handles case where input is not a valid integer
    print("That's not a valid number!")
except ZeroDivisionError:
    # Handles division by zero
    print("You can't divide by zero!")
except Exception as e:
    # Catches any other exceptions
    print(f"An error occurred: {e}")
else:
    # Runs if no exceptions were raised in the try block
    print("Calculation successful!")
finally:
    # Always runs, regardless of whether an exception occurred
    print("Thank you for using this program.")
```

The exception handling shows:

* `try` block containing code that might fail
* Multiple `except` blocks for different exception types
* Capturing the exception object with `as e`
* `else` block for code that runs only if no exception occurs
* `finally` block for cleanup code that always executes

## Putting It All Together

Let's create a small program that demonstrates these concepts working together:

```python
def calculate_grade(scores):
    """Calculate letter grade based on numerical scores."""
    if not scores:  # Check if list is empty
        return "No scores provided"
  
    average = sum(scores) / len(scores)
  
    if average >= 90:
        return "A"
    elif average >= 80:
        return "B"
    elif average >= 70:
        return "C"
    elif average >= 60:
        return "D"
    else:
        return "F"

def process_student_data():
    """Process student data entered by the user."""
    student_records = {}
  
    while True:
        try:
            # Get student information
            name = input("Enter student name (or 'quit' to exit): ")
          
            if name.lower() == 'quit':
                break
              
            # Get scores as comma-separated values
            scores_input = input("Enter scores separated by commas: ")
            scores_list = [float(score) for score in scores_input.split(',')]
          
            # Calculate grade
            grade = calculate_grade(scores_list)
          
            # Store in dictionary
            student_records[name] = {
                'scores': scores_list,
                'average': sum(scores_list) / len(scores_list),
                'grade': grade
            }
          
            print(f"{name}'s grade: {grade}")
          
        except ValueError:
            print("Error: Scores must be valid numbers.")
        except ZeroDivisionError:
            print("Error: No scores were provided.")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
  
    # Print summary
    print("\nStudent Summary:")
    for name, data in student_records.items():
        print(f"{name}: {data['grade']} (Average: {data['average']:.2f})")

# Run the program
if __name__ == "__main__":
    process_student_data()
```

This program demonstrates:

* Function definitions with docstrings
* Input/output operations
* List comprehensions for data transformation
* Exception handling for robust error management
* Dictionaries for storing complex data
* String formatting for output
* Conditional logic for grade determination
* Loops for repeated user interaction
* Control structures for program flow

## Conclusion

Python's syntax and structure are designed around readability and simplicity. The language follows these fundamental principles:

1. **Readability counts** - Code structure is enforced through indentation
2. **Explicit is better than implicit** - Operations are clear and straightforward
3. **Simple is better than complex** - Basic syntax is easy to learn
4. **Complex is better than complicated** - Advanced features build logically on simple ones

By understanding these first principles, you can write Python code that is not only functional but also maintainable and elegant.

Remember that Python's philosophy is reflected in how you approach problems with it - often there is a clear, "Pythonic" way to solve a problem that embraces these principles rather than fighting against them.
