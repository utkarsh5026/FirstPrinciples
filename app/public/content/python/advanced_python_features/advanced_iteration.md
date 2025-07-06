# Advanced Iteration in Python: From First Principles

## Understanding Iteration at Its Core

Before diving into Python's advanced iteration features, let's establish what iteration fundamentally means in programming:

> **Core Concept** : Iteration is the process of accessing elements from a collection one at a time, in a sequential manner. It's the foundation for processing data efficiently without loading everything into memory at once.

### Why Iteration Matters

```python
# Problem: Processing a million numbers
# Bad approach - creates all numbers in memory at once
numbers = [x for x in range(1000000)]  # Uses ~40MB of memory
total = sum(numbers)

# Good approach - processes one number at a time
total = sum(range(1000000))  # Uses minimal memory
```

## The Iterator Protocol: Python's Systematic Approach

Python formalizes iteration through the **iterator protocol** - a contract that objects must follow to be iterable.

> **Iterator Protocol** : An object is iterable if it implements `__iter__()` method. An object is an iterator if it implements both `__iter__()` and `__next__()` methods.

Let's build understanding step by step:

### Step 1: What Makes Something Iterable?

```python
# Basic iterable objects
my_list = [1, 2, 3]
my_string = "hello"
my_dict = {'a': 1, 'b': 2}

# All these work in for loops because they implement __iter__()
for item in my_list:    # Works
    print(item)

for char in my_string:  # Works
    print(char)

for key in my_dict:     # Works
    print(key)
```

### Step 2: How `iter()` Function Works

The `iter()` function is Python's gateway to the iteration system:

```python
# iter() returns an iterator object from an iterable
my_list = [1, 2, 3]
iterator = iter(my_list)

print(type(my_list))    # <class 'list'> - iterable but not iterator
print(type(iterator))   # <class 'list_iterator'> - actual iterator

# The iterator maintains state - where we are in the sequence
print(next(iterator))   # 1
print(next(iterator))   # 2
print(next(iterator))   # 3
# print(next(iterator)) # Would raise StopIteration
```

### Visual Understanding of Iterator State

```
Initial state:    [1, 2, 3]
                   ^
                position

After next():     [1, 2, 3]
                      ^
                   position

After next():     [1, 2, 3]
                         ^
                      position

After next():     [1, 2, 3]
                            ^
                         position (StopIteration)
```

## Deep Dive: How For Loops Actually Work

Understanding what happens behind the scenes when you write a for loop:

```python
# This for loop:
for item in [1, 2, 3]:
    print(item)

# Is equivalent to this manual iteration:
iterable = [1, 2, 3]
iterator = iter(iterable)  # Get iterator from iterable

while True:
    try:
        item = next(iterator)  # Get next item
        print(item)
    except StopIteration:      # No more items
        break                  # Exit the loop
```

> **Key Insight** : For loops are syntactic sugar over the iterator protocol. Python automatically calls `iter()` and handles `StopIteration` exceptions.

## Creating Custom Iterables: Building from Scratch

### Level 1: Simple Custom Iterable

Let's create a countdown iterable that demonstrates the protocol:

```python
class Countdown:
    """A simple iterable that counts down from a given number"""
  
    def __init__(self, start):
        self.start = start
  
    def __iter__(self):
        """Return an iterator object"""
        return CountdownIterator(self.start)

class CountdownIterator:
    """The actual iterator that maintains state"""
  
    def __init__(self, start):
        self.current = start
  
    def __iter__(self):
        """Iterators must return themselves"""
        return self
  
    def __next__(self):
        """Return the next item or raise StopIteration"""
        if self.current <= 0:
            raise StopIteration
      
        self.current -= 1
        return self.current + 1  # Return the value before decrementing

# Using our custom iterable
countdown = Countdown(3)
for num in countdown:
    print(f"T-minus {num}")

# Output:
# T-minus 3
# T-minus 2
# T-minus 1
```

### Level 2: Simplified Approach - Iterator as Iterable

Most of the time, we can simplify by making the iterable also be its own iterator:

```python
class CountdownSimple:
    """Simplified version where the object is both iterable and iterator"""
  
    def __init__(self, start):
        self.start = start
        self.current = start  # Track current position
  
    def __iter__(self):
        """Return self as the iterator"""
        return self
  
    def __next__(self):
        """Return next item or raise StopIteration"""
        if self.current <= 0:
            raise StopIteration
      
        self.current -= 1
        return self.current + 1

# Usage
countdown = CountdownSimple(3)
for num in countdown:
    print(f"Launch in {num}")
```

> **Important Gotcha** : When an object is both iterable and iterator, it can only be iterated once!

```python
countdown = CountdownSimple(3)

# First iteration - works fine
for num in countdown:
    print(num)  # Prints 3, 2, 1

# Second iteration - doesn't work!
for num in countdown:
    print(num)  # Prints nothing! Iterator is exhausted
```

### Level 3: Resettable Iterator Pattern

To solve the "one-time use" problem, separate the iterable from the iterator:

```python
class CountdownReusable:
    """Reusable countdown that creates fresh iterators"""
  
    def __init__(self, start):
        self.start = start
  
    def __iter__(self):
        """Always return a fresh iterator"""
        return CountdownIterator(self.start)

class CountdownIterator:
    def __init__(self, start):
        self.current = start
  
    def __iter__(self):
        return self
  
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        self.current -= 1
        return self.current + 1

# Now we can iterate multiple times
countdown = CountdownReusable(3)

print("First iteration:")
for num in countdown:
    print(num)  # 3, 2, 1

print("Second iteration:")
for num in countdown:
    print(num)  # 3, 2, 1 (works!)
```

## Advanced `iter()` Usage Patterns

### Pattern 1: `iter()` with Callable and Sentinel

```python
# Reading file line by line until empty line
def read_line():
    """Simulate reading input"""
    lines = ["hello", "world", "", "more", "text"]
    return lines.pop(0) if lines else ""

# iter(callable, sentinel) - calls function until sentinel value
lines = iter(read_line, "")  # Call read_line() until it returns ""

for line in lines:
    print(f"Read: {line}")

# Output:
# Read: hello
# Read: world
# (stops at empty string)
```

### Pattern 2: Converting Non-Iterables to Iterables

```python
# Making a custom object iterable
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius
  
    def __iter__(self):
        """Make Temperature iterable by returning its properties"""
        # Return an iterator over the object's attributes
        return iter([
            ('celsius', self.celsius),
            ('fahrenheit', self.celsius * 9/5 + 32),
            ('kelvin', self.celsius + 273.15)
        ])

temp = Temperature(25)
for scale, value in temp:
    print(f"{scale}: {value}")

# Output:
# celsius: 25
# fahrenheit: 77.0
# kelvin: 298.15
```

## Real-World Application: File Processing Iterator

Here's a practical example that demonstrates advanced iteration concepts:

```python
class FileLineProcessor:
    """Iterator for processing large files line by line with transformations"""
  
    def __init__(self, filename, transform_func=None, skip_empty=True):
        self.filename = filename
        self.transform_func = transform_func or (lambda x: x.strip())
        self.skip_empty = skip_empty
        self.file = None
        self.line_number = 0
  
    def __iter__(self):
        """Open file and return self as iterator"""
        self.file = open(self.filename, 'r')
        self.line_number = 0
        return self
  
    def __next__(self):
        """Process next line with error handling"""
        while True:  # Loop to skip empty lines if needed
            try:
                line = next(self.file)
                self.line_number += 1
              
                # Apply transformation
                processed_line = self.transform_func(line)
              
                # Skip empty lines if configured
                if self.skip_empty and not processed_line:
                    continue
              
                return (self.line_number, processed_line)
              
            except StopIteration:
                # Clean up when done
                if self.file:
                    self.file.close()
                raise
  
    def __del__(self):
        """Ensure file is closed"""
        if self.file and not self.file.closed:
            self.file.close()

# Usage example
def uppercase_transform(line):
    return line.strip().upper()

# Process file with custom transformation
processor = FileLineProcessor('data.txt', uppercase_transform)

for line_num, content in processor:
    print(f"Line {line_num}: {content}")
    if line_num > 10:  # Process only first 10 lines
        break
```

## Memory Efficiency and Performance Insights

> **Key Principle** : Iterators enable lazy evaluation - they compute values on-demand rather than storing everything in memory.

```python
import sys

# Memory comparison
# List comprehension - creates all items immediately
squares_list = [x**2 for x in range(1000000)]
print(f"List size: {sys.getsizeof(squares_list)} bytes")

# Generator expression - creates items on demand
squares_gen = (x**2 for x in range(1000000))
print(f"Generator size: {sys.getsizeof(squares_gen)} bytes")

# The generator uses ~100 bytes vs ~8MB for the list!
```

## Common Pitfalls and Best Practices

### Pitfall 1: Iterator Exhaustion

```python
# Problem: Iterator can only be used once
numbers = iter([1, 2, 3])
list1 = list(numbers)  # [1, 2, 3]
list2 = list(numbers)  # [] - empty! Iterator exhausted

# Solution: Use itertools.tee() for multiple iterations
import itertools
numbers = iter([1, 2, 3])
iter1, iter2 = itertools.tee(numbers, 2)
list1 = list(iter1)  # [1, 2, 3]
list2 = list(iter2)  # [1, 2, 3] - works!
```

### Pitfall 2: Infinite Iterators

```python
class InfiniteCounter:
    def __init__(self, start=0):
        self.current = start
  
    def __iter__(self):
        return self
  
    def __next__(self):
        self.current += 1
        return self.current

# Dangerous - infinite loop!
# for num in InfiniteCounter():
#     print(num)  # Will run forever!

# Safe usage with break condition
counter = InfiniteCounter()
for num in counter:
    print(num)
    if num >= 5:
        break
```

> **Best Practice** : Always have a clear termination condition for custom iterators to avoid infinite loops.

## Advanced Patterns and Idioms

### Chain Multiple Iterables

```python
import itertools

# Efficiently chain multiple iterables
lists = [[1, 2], [3, 4], [5, 6]]

# Method 1: Using itertools.chain
chained = itertools.chain(*lists)
print(list(chained))  # [1, 2, 3, 4, 5, 6]

# Method 2: Custom implementation
class ChainIterator:
    def __init__(self, *iterables):
        self.iterables = iter(iterables)
        self.current_iter = iter([])  # Start with empty iterator
  
    def __iter__(self):
        return self
  
    def __next__(self):
        while True:
            try:
                return next(self.current_iter)
            except StopIteration:
                # Current iterator exhausted, try next one
                self.current_iter = iter(next(self.iterables))
```

### Iterator with State Management

```python
class StatefulIterator:
    """Iterator that tracks statistics while iterating"""
  
    def __init__(self, iterable):
        self.data = iter(iterable)
        self.count = 0
        self.total = 0
        self.max_value = float('-inf')
        self.min_value = float('inf')
  
    def __iter__(self):
        return self
  
    def __next__(self):
        try:
            value = next(self.data)
          
            # Update statistics
            self.count += 1
            self.total += value
            self.max_value = max(self.max_value, value)
            self.min_value = min(self.min_value, value)
          
            return value
        except StopIteration:
            # Print final statistics when iteration ends
            if self.count > 0:
                print(f"Statistics: Count={self.count}, "
                      f"Average={self.total/self.count:.2f}, "
                      f"Min={self.min_value}, Max={self.max_value}")
            raise

# Usage
numbers = StatefulIterator([1, 5, 3, 9, 2])
result = list(numbers)
# Output: Statistics: Count=5, Average=4.00, Min=1, Max=9
```

This comprehensive exploration of Python's iteration system shows how the iterator protocol provides a powerful, memory-efficient way to process data. The key is understanding that iteration is about creating a standardized interface for sequential access, allowing Python to handle everything from simple lists to infinite sequences with the same elegant syntax.
