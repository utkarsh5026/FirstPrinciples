# Functional Programming in Python: A Journey from First Principles

Let me take you on a journey through functional programming, starting from the very foundation of what programming paradigms are and building up to mastering functional concepts in Python.

## Understanding Programming Paradigms: The Foundation

Before we dive into functional programming, let's establish what a programming paradigm actually means from first principles.

> **Core Insight** : A programming paradigm is simply a fundamental style or approach to structuring and organizing your code. Think of it like different architectural styles for building houses - you could build a modern minimalist house, a Victorian mansion, or a log cabin. Each style has its own principles, benefits, and best use cases.

Programming has evolved through several major paradigms:

**Imperative Programming** is like giving someone step-by-step driving directions: "Go straight for 2 miles, turn left at the traffic light, then turn right at the gas station." You specify exactly what to do and in what order.

```python
# Imperative style - telling the computer HOW to do something
numbers = [1, 2, 3, 4, 5]
doubled = []
for number in numbers:
    doubled.append(number * 2)
print(doubled)  # [2, 4, 6, 8, 10]
```

**Object-Oriented Programming** is like organizing the world into entities (objects) that have properties and behaviors, similar to how we naturally think about real-world things.

```python
# Object-oriented style - organizing around entities
class NumberProcessor:
    def __init__(self, numbers):
        self.numbers = numbers
  
    def double_all(self):
        return [num * 2 for num in self.numbers]

processor = NumberProcessor([1, 2, 3, 4, 5])
result = processor.double_all()
```

**Functional Programming** is like mathematics - you express what you want as a series of function applications and transformations, focusing on the relationships between inputs and outputs rather than step-by-step instructions.

```python
# Functional style - expressing WHAT you want
numbers = [1, 2, 3, 4, 5]
doubled = list(map(lambda x: x * 2, numbers))
print(doubled)  # [2, 4, 6, 8, 10]
```

## The Mathematical Foundation of Functional Programming

> **First Principle** : Functional programming is rooted in mathematical function theory. In mathematics, a function is a relationship that maps each input to exactly one output, with no side effects or hidden behaviors.

Consider the mathematical function f(x) = x². This function has several key properties:

* **Deterministic** : f(3) always equals 9, no matter when or where you calculate it
* **No side effects** : Calculating f(3) doesn't change anything else in the universe
* **Referential transparency** : You can replace f(3) with 9 anywhere without changing the meaning

Functional programming brings these mathematical principles into software development.

## Core Principle 1: Pure Functions

A pure function is the cornerstone of functional programming. Let's build this concept from the ground up.

> **Definition** : A pure function is one that always returns the same output for the same input and has no observable side effects.

Let's examine what makes a function "impure" first:

```python
# IMPURE function - has side effects
counter = 0

def impure_increment(x):
    global counter
    counter += 1  # Side effect: modifying global state
    print(f"Called {counter} times")  # Side effect: I/O operation
    return x + counter

# This function's behavior changes each time you call it
print(impure_increment(5))  # Output: "Called 1 times", returns 6
print(impure_increment(5))  # Output: "Called 2 times", returns 7
```

In this impure function, calling it with the same input (5) produces different outputs (6, then 7) because it depends on and modifies external state.

Now let's see a pure version:

```python
# PURE function - no side effects, deterministic
def pure_add(x, y):
    return x + y

# This function's behavior is completely predictable
print(pure_add(5, 3))  # Always returns 8
print(pure_add(5, 3))  # Always returns 8
```

Let's explore a more practical example that demonstrates the power of pure functions:

```python
# Pure function for calculating tax
def calculate_tax(income, tax_rate):
    """
    Pure function to calculate tax.
    - Takes income and tax_rate as parameters (no hidden dependencies)
    - Returns calculated tax (deterministic output)
    - No side effects (doesn't modify anything outside itself)
    """
    if income <= 0:
        return 0
    return income * tax_rate

# Pure function for formatting currency
def format_currency(amount):
    """
    Pure function to format money.
    - Always produces same output for same input
    - No side effects
    """
    return f"${amount:.2f}"

# Using pure functions together
income = 50000
rate = 0.15
tax = calculate_tax(income, rate)
formatted_tax = format_currency(tax)

print(f"Tax on {format_currency(income)}: {formatted_tax}")
```

The beauty of pure functions becomes apparent when testing and reasoning about code:

```python
# Testing pure functions is straightforward
def test_calculate_tax():
    # No setup required, no state to worry about
    assert calculate_tax(50000, 0.15) == 7500
    assert calculate_tax(0, 0.15) == 0
    assert calculate_tax(-1000, 0.15) == 0
  
# Pure functions are easy to debug and understand
```

## Core Principle 2: Immutability

> **First Principle** : In functional programming, once you create a data structure, you never modify it. Instead, you create new data structures with the desired changes.

Think of immutability like taking photographs. When you want to edit a photo, you don't destroy the original - you create a new version with your edits. The original remains unchanged, and you can always go back to it.

Let's explore this concept step by step:

```python
# MUTABLE approach (traditional imperative style)
def mutable_example():
    original_list = [1, 2, 3, 4, 5]
    print(f"Original: {original_list}")
  
    # Modifying the original list
    original_list.append(6)
    original_list[0] = 100
  
    print(f"After modification: {original_list}")
    # Problem: We've lost the original data!

mutable_example()
# Output:
# Original: [1, 2, 3, 4, 5]
# After modification: [100, 2, 3, 4, 5, 6]
```

Now let's see the immutable approach:

```python
# IMMUTABLE approach (functional style)
def immutable_example():
    original_list = [1, 2, 3, 4, 5]
    print(f"Original: {original_list}")
  
    # Creating new data structures instead of modifying
    with_new_item = original_list + [6]  # Creates a new list
    with_changed_first = [100] + original_list[1:]  # Creates another new list
  
    print(f"Original (unchanged): {original_list}")
    print(f"With new item: {with_new_item}")
    print(f"With changed first: {with_changed_first}")

immutable_example()
# Output:
# Original: [1, 2, 3, 4, 5]
# Original (unchanged): [1, 2, 3, 4, 5]
# With new item: [1, 2, 3, 4, 5, 6]
# With changed first: [100, 2, 3, 4, 5]
```

Let's see a practical example with a shopping cart:

```python
# Immutable shopping cart operations
def add_item_to_cart(cart, item):
    """
    Pure function that returns a new cart with an added item.
    The original cart remains unchanged.
    """
    return cart + [item]

def remove_item_from_cart(cart, item_to_remove):
    """
    Pure function that returns a new cart with an item removed.
    Uses list comprehension to create a new list.
    """
    return [item for item in cart if item != item_to_remove]

def calculate_total(cart, prices):
    """
    Pure function to calculate cart total.
    Doesn't modify cart or prices.
    """
    return sum(prices.get(item, 0) for item in cart)

# Using immutable operations
prices = {"apple": 1.50, "banana": 0.80, "orange": 1.20}

# Start with empty cart
cart1 = []
print(f"Cart 1: {cart1}")

# Add items (each operation returns a new cart)
cart2 = add_item_to_cart(cart1, "apple")
cart3 = add_item_to_cart(cart2, "banana")
cart4 = add_item_to_cart(cart3, "orange")

print(f"Cart 2 (added apple): {cart2}")
print(f"Cart 3 (added banana): {cart3}")
print(f"Cart 4 (added orange): {cart4}")

# Remove an item
cart5 = remove_item_from_cart(cart4, "banana")
print(f"Cart 5 (removed banana): {cart5}")

# All previous cart states are still available!
print(f"Original cart still exists: {cart1}")
print(f"Cart with just apple still exists: {cart2}")

# Calculate totals
print(f"Total for cart 4: ${calculate_total(cart4, prices):.2f}")
print(f"Total for cart 5: ${calculate_total(cart5, prices):.2f}")
```

## Core Principle 3: Higher-Order Functions

> **Foundation Concept** : A higher-order function is a function that either takes other functions as arguments, returns a function, or both. This is possible because in functional programming, functions are "first-class citizens" - they can be treated like any other value.

Think of higher-order functions like factories or workshops. Just as a car factory takes raw materials and blueprints to produce cars, a higher-order function takes functions and data to produce new functionality.

Let's start with the simplest example:

```python
# Functions as first-class citizens
def greet(name):
    return f"Hello, {name}!"

def shout(name):
    return f"HEY {name.upper()}!"

def whisper(name):
    return f"psst... {name.lower()}"

# Storing functions in variables
greeting_styles = [greet, shout, whisper]

# Using functions from a list
name = "Alice"
for style_function in greeting_styles:
    print(style_function(name))

# Output:
# Hello, Alice!
# HEY ALICE!
# psst... alice
```

Now let's create our first higher-order function:

```python
def apply_greeting_style(names, greeting_function):
    """
    Higher-order function that takes a list of names and a greeting function,
    then applies that function to each name.
  
    Parameters:
    - names: list of strings
    - greeting_function: a function that takes a name and returns a greeting
  
    Returns: list of greetings
    """
    return [greeting_function(name) for name in names]

# Using the higher-order function
names = ["Alice", "Bob", "Charlie"]

# Apply different greeting styles
formal_greetings = apply_greeting_style(names, greet)
loud_greetings = apply_greeting_style(names, shout)
quiet_greetings = apply_greeting_style(names, whisper)

print("Formal:", formal_greetings)
print("Loud:", loud_greetings)
print("Quiet:", quiet_greetings)
```

Let's explore a more practical example with data processing:

```python
# Higher-order function for data transformation
def transform_data(data, transformation_function):
    """
    Applies a transformation function to each item in the data.
    This is essentially our own implementation of 'map'.
    """
    result = []
    for item in data:
        transformed_item = transformation_function(item)
        result.append(transformed_item)
    return result

# Different transformation functions
def square(x):
    return x ** 2

def cube(x):
    return x ** 3

def make_negative(x):
    return -x

# Using the higher-order function
numbers = [1, 2, 3, 4, 5]

squared_numbers = transform_data(numbers, square)
cubed_numbers = transform_data(numbers, cube)
negative_numbers = transform_data(numbers, make_negative)

print(f"Original: {numbers}")
print(f"Squared: {squared_numbers}")
print(f"Cubed: {cubed_numbers}")
print(f"Negative: {negative_numbers}")
```

## Python's Built-in Functional Tools

Python provides several powerful built-in higher-order functions. Let's explore each one from first principles:

### The `map()` Function

> **Concept** : `map()` applies a function to every item in an iterable (like a list) and returns a new iterable with the results.

```python
# Understanding map() step by step
def celsius_to_fahrenheit(celsius):
    """Convert Celsius to Fahrenheit using the formula: F = C * 9/5 + 32"""
    return celsius * 9/5 + 32

# Temperature data in Celsius
celsius_temps = [0, 10, 20, 30, 40]

# Using map to convert all temperatures
fahrenheit_temps = map(celsius_to_fahrenheit, celsius_temps)

# map returns a map object (iterator), so we convert to list to see results
fahrenheit_list = list(fahrenheit_temps)

print(f"Celsius: {celsius_temps}")
print(f"Fahrenheit: {fahrenheit_list}")

# Let's trace through what map() does internally:
print("\nStep-by-step conversion:")
for i, temp in enumerate(celsius_temps):
    converted = celsius_to_fahrenheit(temp)
    print(f"  {temp}°C → {converted}°F")
```

Using `map()` with lambda functions (anonymous functions):

```python
# Lambda functions are short, anonymous functions
numbers = [1, 2, 3, 4, 5]

# Using lambda with map
doubled = list(map(lambda x: x * 2, numbers))
squared = list(map(lambda x: x ** 2, numbers))

print(f"Original: {numbers}")
print(f"Doubled: {doubled}")
print(f"Squared: {squared}")

# The lambda 'lambda x: x * 2' is equivalent to:
def double(x):
    return x * 2
# But written in a more concise way for simple operations
```

### The `filter()` Function

> **Concept** : `filter()` creates a new iterable containing only the items from the original iterable that pass a test (return True for a given function).

```python
# Understanding filter() with a practical example
def is_even(number):
    """Test if a number is even"""
    return number % 2 == 0

def is_positive(number):
    """Test if a number is positive"""
    return number > 0

def is_long_word(word):
    """Test if a word has more than 4 characters"""
    return len(word) > 4

# Filtering numbers
numbers = [-3, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

even_numbers = list(filter(is_even, numbers))
positive_numbers = list(filter(is_positive, numbers))
positive_even_numbers = list(filter(is_even, filter(is_positive, numbers)))

print(f"All numbers: {numbers}")
print(f"Even numbers: {even_numbers}")
print(f"Positive numbers: {positive_numbers}")
print(f"Positive even numbers: {positive_even_numbers}")

# Filtering words
words = ["cat", "dog", "elephant", "ant", "butterfly", "bee"]
long_words = list(filter(is_long_word, words))

print(f"\nAll words: {words}")
print(f"Long words (>4 chars): {long_words}")
```

Let's trace through how `filter()` works:

```python
# Understanding filter() step by step
def trace_filter(predicate_function, data):
    """Our own implementation to show how filter works"""
    result = []
    print(f"Filtering {data} with function {predicate_function.__name__}")
  
    for item in data:
        test_result = predicate_function(item)
        print(f"  {item} → {predicate_function.__name__}({item}) = {test_result}")
      
        if test_result:
            result.append(item)
            print(f"    ✓ Keep {item}")
        else:
            print(f"    ✗ Reject {item}")
  
    return result

# Test our understanding
numbers = [1, 2, 3, 4, 5, 6]
result = trace_filter(is_even, numbers)
print(f"\nFinal result: {result}")
```

### The `reduce()` Function

> **Concept** : `reduce()` applies a function cumulatively to items in an iterable, reducing the entire iterable to a single value.

```python
from functools import reduce

# Understanding reduce() with simple examples
def add_two_numbers(a, b):
    """Add two numbers together"""
    print(f"  Adding {a} + {b} = {a + b}")
    return a + b

def multiply_two_numbers(a, b):
    """Multiply two numbers together"""
    print(f"  Multiplying {a} × {b} = {a * b}")
    return a * b

# Using reduce to sum all numbers
numbers = [1, 2, 3, 4, 5]

print("Calculating sum using reduce:")
total_sum = reduce(add_two_numbers, numbers)
print(f"Final sum: {total_sum}")

print("\nCalculating product using reduce:")
total_product = reduce(multiply_two_numbers, numbers)
print(f"Final product: {total_product}")
```

Let's trace through exactly how `reduce()` works:

```python
# Manual trace of reduce behavior
def manual_reduce(function, iterable, initial=None):
    """Our own implementation to understand reduce"""
    iterator = iter(iterable)
  
    if initial is None:
        # If no initial value, use the first item
        accumulator = next(iterator)
        print(f"Starting with first item: {accumulator}")
    else:
        accumulator = initial
        print(f"Starting with initial value: {accumulator}")
  
    step = 1
    for item in iterator:
        old_accumulator = accumulator
        accumulator = function(accumulator, item)
        print(f"Step {step}: {function.__name__}({old_accumulator}, {item}) = {accumulator}")
        step += 1
  
    return accumulator

# Test our understanding
numbers = [10, 20, 30, 40]
print("Manual reduce trace:")
result = manual_reduce(add_two_numbers, numbers)
print(f"Final result: {result}")
```

A practical example with reduce:

```python
# Finding the maximum value using reduce
def find_larger(a, b):
    """Return the larger of two values"""
    return a if a > b else b

# Finding maximum
numbers = [15, 3, 9, 21, 7, 12]
maximum = reduce(find_larger, numbers)
print(f"Numbers: {numbers}")
print(f"Maximum: {maximum}")

# Building a string using reduce
def concatenate_with_space(a, b):
    """Concatenate two strings with a space"""
    return f"{a} {b}"

words = ["Functional", "programming", "is", "powerful"]
sentence = reduce(concatenate_with_space, words)
print(f"Words: {words}")
print(f"Sentence: {sentence}")
```

## Function Composition: Building Complex Logic from Simple Parts

> **Core Principle** : Function composition is the act of combining simple functions to build more complex operations. It's like building with LEGO blocks - each function is a block, and you can combine them in different ways to create something larger.

```python
# Building functions step by step
def add_ten(x):
    """Add 10 to a number"""
    return x + 10

def multiply_by_two(x):
    """Multiply a number by 2"""
    return x * 2

def make_positive(x):
    """Make a number positive (absolute value)"""
    return abs(x)

# Simple composition: applying functions one after another
def process_number_v1(x):
    """Process a number through multiple transformations"""
    step1 = make_positive(x)      # First: make it positive
    step2 = add_ten(step1)        # Second: add 10
    step3 = multiply_by_two(step2) # Third: multiply by 2
    return step3

# Test the composed function
test_number = -5
result = process_number_v1(test_number)
print(f"Processing {test_number}:")
print(f"  Make positive: {make_positive(test_number)}")
print(f"  Add ten: {add_ten(make_positive(test_number))}")
print(f"  Multiply by two: {result}")
```

Let's create a more elegant composition system:

```python
# Creating a compose function
def compose(*functions):
    """
    Compose multiple functions into a single function.
    Functions are applied from right to left (like mathematical composition).
    """
    def composed_function(x):
        result = x
        # Apply functions from right to left
        for function in reversed(functions):
            result = function(result)
        return result
    return composed_function

# Using composition
process_number_v2 = compose(multiply_by_two, add_ten, make_positive)

# This is equivalent to: multiply_by_two(add_ten(make_positive(x)))
test_numbers = [-5, 3, -12, 7]
for num in test_numbers:
    result = process_number_v2(num)
    print(f"{num} → {result}")
```

## Practical Example: Data Processing Pipeline

Let's build a complete data processing system using functional programming principles:

```python
# Data processing with functional programming
from functools import reduce

# Sample data: student records
students = [
    {"name": "Alice", "scores": [85, 92, 78, 96], "age": 20},
    {"name": "Bob", "scores": [75, 84, 89, 72], "age": 19},
    {"name": "Charlie", "scores": [92, 88, 91, 94], "age": 21},
    {"name": "Diana", "scores": [68, 75, 82, 79], "age": 20},
    {"name": "Eve", "scores": [95, 97, 89, 93], "age": 22}
]

# Pure functions for data processing
def calculate_average(scores):
    """Calculate the average of a list of scores"""
    return sum(scores) / len(scores) if scores else 0

def add_average_score(student):
    """Add average score to student record (returns new record)"""
    return {
        **student,  # Copy all existing fields
        "average": calculate_average(student["scores"])
    }

def add_letter_grade(student):
    """Add letter grade based on average (returns new record)"""
    avg = student["average"]
    if avg >= 90:
        grade = "A"
    elif avg >= 80:
        grade = "B"
    elif avg >= 70:
        grade = "C"
    elif avg >= 60:
        grade = "D"
    else:
        grade = "F"
  
    return {**student, "letter_grade": grade}

def is_honor_student(student):
    """Check if student qualifies for honors (average >= 90)"""
    return student["average"] >= 90

def format_student_summary(student):
    """Create a formatted summary string for a student"""
    return (f"{student['name']} (Age {student['age']}): "
            f"Average {student['average']:.1f} - Grade {student['letter_grade']}")

# Building the processing pipeline
print("Original data:")
for student in students:
    print(f"  {student}")

print("\n" + "="*60)

# Step 1: Add average scores to all students
students_with_averages = list(map(add_average_score, students))

print("\nAfter adding averages:")
for student in students_with_averages:
    print(f"  {student['name']}: {student['average']:.1f}")

# Step 2: Add letter grades
students_with_grades = list(map(add_letter_grade, students_with_averages))

print("\nAfter adding letter grades:")
for student in students_with_grades:
    print(f"  {student['name']}: {student['letter_grade']}")

# Step 3: Filter honor students
honor_students = list(filter(is_honor_student, students_with_grades))

print(f"\nHonor students ({len(honor_students)} total):")
for student in honor_students:
    print(f"  {format_student_summary(student)}")

# Step 4: Calculate class statistics using reduce
def calculate_class_average(students):
    """Calculate the overall class average"""
    if not students:
        return 0
  
    total_average = reduce(
        lambda acc, student: acc + student["average"],
        students,
        0  # Initial value
    )
    return total_average / len(students)

class_avg = calculate_class_average(students_with_grades)
print(f"\nClass average: {class_avg:.1f}")

# Demonstrating the complete pipeline in a functional style
def process_student_data(raw_students):
    """Complete processing pipeline using functional composition"""
    # Chain all transformations together
    processed = list(map(
        lambda student: add_letter_grade(add_average_score(student)),
        raw_students
    ))
  
    return {
        "all_students": processed,
        "honor_students": list(filter(is_honor_student, processed)),
        "class_average": calculate_class_average(processed)
    }

# Using the complete pipeline
results = process_student_data(students)
print(f"\n" + "="*60)
print("Complete pipeline results:")
print(f"Total students: {len(results['all_students'])}")
print(f"Honor students: {len(results['honor_students'])}")
print(f"Class average: {results['class_average']:.1f}")
```

## Benefits and Trade-offs of Functional Programming

> **Understanding the Why** : Functional programming isn't just about syntax and techniques - it's about solving real problems that arise in software development.

### Benefits of Functional Programming

**1. Predictability and Testing**

```python
# Pure functions are extremely easy to test
def calculate_compound_interest(principal, rate, time):
    """Pure function for compound interest calculation"""
    return principal * (1 + rate) ** time

# Testing is straightforward - no setup, no mocking, no state
def test_compound_interest():
    # Test with known values
    result = calculate_compound_interest(1000, 0.05, 2)
    expected = 1102.50
    assert abs(result - expected) < 0.01
  
    # Test edge cases
    assert calculate_compound_interest(1000, 0, 5) == 1000  # No growth
    assert calculate_compound_interest(0, 0.05, 5) == 0     # No principal

test_compound_interest()
print("All tests passed!")
```

**2. Debugging and Reasoning**

```python
# With pure functions, debugging is easier
def process_order_functionally(order_data):
    """Each step is pure and can be traced independently"""
    validated_order = validate_order(order_data)
    priced_order = calculate_pricing(validated_order)
    taxed_order = add_taxes(priced_order)
    return taxed_order

# You can test each step independently:
# - If validate_order works, you know the problem isn't there
# - If calculate_pricing fails, you know exactly where to look
# - No hidden state changes to worry about
```

**3. Parallelization and Concurrency**

```python
# Pure functions can be safely run in parallel
from concurrent.futures import ThreadPoolExecutor
import time

def expensive_calculation(n):
    """Simulate an expensive pure calculation"""
    time.sleep(0.1)  # Simulate processing time
    return n ** 2

numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Sequential processing
start_time = time.time()
sequential_results = [expensive_calculation(n) for n in numbers]
sequential_time = time.time() - start_time

# Parallel processing (safe because function is pure)
start_time = time.time()
with ThreadPoolExecutor(max_workers=4) as executor:
    parallel_results = list(executor.map(expensive_calculation, numbers))
parallel_time = time.time() - start_time

print(f"Sequential time: {sequential_time:.2f} seconds")
print(f"Parallel time: {parallel_time:.2f} seconds")
print(f"Speedup: {sequential_time/parallel_time:.1f}x")
```

### Trade-offs and Considerations

**1. Performance Considerations**

```python
# Immutability can create more objects
def inefficient_list_building():
    """This creates many intermediate lists"""
    result = []
    for i in range(1000):
        result = result + [i]  # Creates a new list each time!
    return result

def efficient_list_building():
    """More efficient approach"""
    return list(range(1000))

# For large data, consider using libraries like 'pyrsistent' 
# that provide efficient immutable data structures
```

**2. Learning Curve**

```python
# Functional style can be less intuitive at first
# Instead of:
def imperative_sum_squares(numbers):
    total = 0
    for num in numbers:
        if num > 0:
            total += num ** 2
    return total

# Functional style:
def functional_sum_squares(numbers):
    return reduce(
        lambda acc, x: acc + x,
        map(lambda x: x ** 2, filter(lambda x: x > 0, numbers)),
        0
    )

# Both do the same thing, but functional style requires more practice to read
```

## Practical Functional Programming in Python

Let's conclude with a real-world example that shows how to apply functional programming principles effectively:

```python
# Real-world example: Log file analysis
from datetime import datetime
from functools import reduce
import re

# Sample log entries
log_entries = [
    "2024-05-24 10:15:23 INFO User login: alice@example.com",
    "2024-05-24 10:16:45 ERROR Failed login: bob@example.com",
    "2024-05-24 10:17:12 INFO User login: charlie@example.com", 
    "2024-05-24 10:18:33 ERROR Database connection failed",
    "2024-05-24 10:19:45 INFO User logout: alice@example.com",
    "2024-05-24 10:20:15 WARNING High memory usage detected",
    "2024-05-24 10:21:30 ERROR Failed login: bob@example.com"
]

# Pure functions for log processing
def parse_log_entry(entry):
    """Parse a single log entry into structured data"""
    pattern = r'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (.+)'
    match = re.match(pattern, entry)
  
    if match:
        timestamp_str, level, message = match.groups()
        timestamp = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
        return {
            'timestamp': timestamp,
            'level': level,
            'message': message,
            'raw': entry
        }
    return None

def is_error_log(log_entry):
    """Check if a log entry is an error"""
    return log_entry and log_entry['level'] == 'ERROR'

def is_login_attempt(log_entry):
    """Check if a log entry is a login attempt"""
    return log_entry and 'login' in log_entry['message'].lower()

def extract_email(log_entry):
    """Extract email from login-related log entries"""
    email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'
    match = re.search(email_pattern, log_entry['message'])
    return match.group(0) if match else None

def count_occurrences(items):
    """Count occurrences of items (returns dictionary)"""
    return reduce(
        lambda counts, item: {**counts, item: counts.get(item, 0) + 1},
        items,
        {}
    )

# Functional processing pipeline
print("Analyzing log files using functional programming:")
print("="*60)

# Step 1: Parse all log entries
parsed_logs = list(filter(None, map(parse_log_entry, log_entries)))
print(f"Parsed {len(parsed_logs)} log entries")

# Step 2: Analyze errors
error_logs = list(filter(is_error_log, parsed_logs))
print(f"Found {len(error_logs)} error entries:")
for error in error_logs:
    print(f"  {error['timestamp'].strftime('%H:%M:%S')} - {error['message']}")

# Step 3: Analyze login attempts
login_logs = list(filter(is_login_attempt, parsed_logs))
failed_logins = list(filter(is_error_log, login_logs))

print(f"\nLogin analysis:")
print(f"  Total login attempts: {len(login_logs)}")
print(f"  Failed login attempts: {len(failed_logins)}")

# Step 4: Count failed login attempts by email
failed_login_emails = list(filter(None, map(extract_email, failed_logins)))
failure_counts = count_occurrences(failed_login_emails)

print(f"  Failed login counts by email:")
for email, count in failure_counts.items():
    print(f"    {email}: {count} attempts")

# Step 5: Generate summary statistics
log_level_counts = count_occurrences([log['level'] for log in parsed_logs])

print(f"\nLog level summary:")
for level, count in log_level_counts.items():
    print(f"  {level}: {count}")

# Demonstrating the complete functional pipeline
def analyze_logs(raw_log_entries):
    """Complete log analysis using functional programming principles"""
  
    # Parse and filter valid entries
    parsed = list(filter(None, map(parse_log_entry, raw_log_entries)))
  
    # Create analysis pipeline
    return {
        'total_entries': len(parsed),
        'error_count': len(list(filter(is_error_log, parsed))),
        'login_attempts': len(list(filter(is_login_attempt, parsed))),
        'failed_logins': len(list(filter(lambda x: is_error_log(x) and is_login_attempt(x), parsed))),
        'level_distribution': count_occurrences([log['level'] for log in parsed])
    }

# Use the complete pipeline
analysis_results = analyze_logs(log_entries)
print(f"\n" + "="*60)
print("Complete analysis results:")
for key, value in analysis_results.items():
    print(f"  {key}: {value}")
```

> **Final Insight** : Functional programming in Python isn't about abandoning all other paradigms. It's about having powerful tools in your toolkit that make certain problems easier to solve, test, and maintain. The key is knowing when and how to apply these principles effectively.

The journey from imperative to functional thinking takes practice, but the benefits - clearer code, easier testing, better parallelization, and fewer bugs - make it a worthwhile investment in your programming skills.
