# Control Structures in Python: A First Principles Approach

I'll explain Python's control structures from first principles, breaking down how they work at the most fundamental level and building up to practical applications.

> Control structures are the backbone of programming logic. They determine how a program flows, which instructions execute when, and how many times they repeat. They're what transform code from a simple list of sequential instructions into something that can make decisions and adapt.

## 1. The `if` Statement: Conditional Execution

At its core, the `if` statement implements decision-making in your code. It evaluates a condition and executes a block of code only if that condition is true.

### First Principles of `if` Statements

1. **Boolean Evaluation** : Every condition in an `if` statement must evaluate to either `True` or `False`.
2. **Conditional Execution** : Code inside the `if` block executes only when the condition is `True`.
3. **Indentation Matters** : Python uses indentation to define blocks of code, not braces or keywords.

### Basic Syntax:

```python
if condition:
    # This code runs only if the condition is True
    statement1
    statement2
    # ... and so on
```

### Simple Example:

```python
temperature = 28

if temperature > 25:
    print("It's a hot day!")
    print("Remember to drink water.")
```

In this example:

* We check if the temperature is greater than 25
* If it is, both print statements execute
* If not, the program skips the indented block entirely

### Adding Alternatives with `else` and `elif`

The `if` statement can be extended with `else` to provide an alternative action:

```python
temperature = 15

if temperature > 25:
    print("It's a hot day!")
else:
    print("It's not hot today.")
```

For multiple alternatives, we use `elif` (short for "else if"):

```python
temperature = 15

if temperature > 30:
    print("It's very hot!")
elif temperature > 20:
    print("It's warm.")
elif temperature > 10:
    print("It's cool.")
else:
    print("It's cold!")
```

The program evaluates conditions from top to bottom, and only the first matching condition's block executes. Once a condition matches, subsequent `elif` and `else` blocks are skipped.

### Nested `if` Statements

You can place an `if` statement inside another `if` statement:

```python
temperature = 28
humidity = 80

if temperature > 25:
    print("It's a hot day!")
    if humidity > 70:
        print("And it's humid too.")
    else:
        print("At least it's dry.")
```

### Truthiness and Falsiness in Python

Python treats certain values as inherently `True` or `False`:

* **Falsy values** : `0`, `None`, `False`, empty sequences (`''`, `[]`, `()`), empty mappings (`{}`)
* **Truthy values** : Everything else

This allows for concise code:

```python
name = "Alice"

if name:  # This is True because name is not empty
    print(f"Hello, {name}!")
```

## 2. The `for` Loop: Iteration Over Sequences

The `for` loop iterates over a sequence (like a list, tuple, string) or any iterable object.

### First Principles of `for` Loops

1. **Iteration** : The loop processes each item in a sequence one at a time.
2. **Assignment** : For each iteration, an item from the sequence is assigned to a variable.
3. **Sequence Exhaustion** : The loop terminates when it runs out of items.

### Basic Syntax:

```python
for variable in sequence:
    # This code repeats for each item in the sequence
    # variable holds the current item
```

### Simple Example:

```python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(f"I like {fruit}s")
```

Output:

```
I like apples
I like bananas
I like cherrys
```

This loop:

1. Takes the first item from `fruits` ("apple") and assigns it to `fruit`
2. Executes the indented block
3. Moves to the next item ("banana"), repeating until all items are processed

### Iterating Over Ranges

The `range()` function generates a sequence of numbers:

```python
# Prints numbers 0 through 4
for i in range(5):
    print(i)
```

The `range()` function has three forms:

* `range(stop)`: Numbers 0 to stop-1
* `range(start, stop)`: Numbers start to stop-1
* `range(start, stop, step)`: Numbers start to stop-1, incrementing by step

```python
# Count from 1 to 10
for i in range(1, 11):
    print(i)

# Even numbers from 0 to 10
for i in range(0, 11, 2):
    print(i)
```

### Nested `for` Loops

You can place one `for` loop inside another:

```python
for i in range(1, 4):  # Outer loop
    for j in range(1, 4):  # Inner loop
        print(f"{i} × {j} = {i*j}")
```

This produces a multiplication table:

```
1 × 1 = 1
1 × 2 = 2
1 × 3 = 3
2 × 1 = 2
...and so on
```

### Loop Control: `break` and `continue`

* `break`: Exits the loop immediately
* `continue`: Skips the rest of the current iteration and moves to the next

```python
for i in range(10):
    if i == 3:
        continue  # Skip 3
    if i == 7:
        break     # Stop at 7
    print(i)
```

Output:

```
0
1
2
4
5
6
```

### `else` Clause in `for` Loops

Unlike many languages, Python's `for` loops can have an `else` clause that executes when the loop completes normally (not through a `break`):

```python
for i in range(5):
    print(i)
else:
    print("Loop completed normally")
```

If we add a `break`:

```python
for i in range(5):
    if i == 3:
        break
    print(i)
else:
    print("This won't print because we used break")
```

## 3. The `while` Loop: Condition-Based Repetition

The `while` loop repeats a block of code as long as a condition remains `True`.

### First Principles of `while` Loops

1. **Condition Testing** : Before each iteration, a condition is evaluated.
2. **Conditional Repetition** : The loop continues only while the condition is `True`.
3. **Potential Infinity** : A `while` loop can run indefinitely if the condition never becomes `False`.

### Basic Syntax:

```python
while condition:
    # This code repeats as long as the condition is True
```

### Simple Example:

```python
count = 0

while count < 5:
    print(count)
    count += 1  # Don't forget to update the condition variable!
```

This produces:

```
0
1
2
3
4
```

The loop:

1. Checks if `count < 5` (initially true)
2. Executes the block, printing the current value of `count`
3. Increments `count`
4. Goes back to step 1, repeating until `count` reaches 5

### Infinite Loops

If the condition never becomes `False`, you get an infinite loop:

```python
# CAUTION: This code will run forever unless interrupted
while True:
    print("This prints forever!")
```

Infinite loops are sometimes intentional, especially in programs that need to run continuously (like game loops or server programs), but usually, you'd include a `break` statement somewhere:

```python
count = 0
while True:
    print(count)
    count += 1
    if count >= 5:
        break  # Exit the loop when count reaches 5
```

### `while` vs. `for` Loops

* Use `for` when iterating over a known sequence or a specific number of times
* Use `while` when you need to repeat based on a condition that might change

Example: Reading user input until they enter "quit":

```python
user_input = ""
while user_input != "quit":
    user_input = input("Enter a command (type 'quit' to exit): ")
    print(f"You entered: {user_input}")
```

### Loop Control with `break` and `continue`

Just like with `for` loops, you can use `break` and `continue` in `while` loops:

```python
count = 0
while count < 10:
    count += 1
    if count % 2 == 0:  # If count is even
        continue  # Skip even numbers
    if count > 7:
        break  # Stop after 7
    print(count)
```

Output:

```
1
3
5
7
```

### The `else` Clause in `while` Loops

Like `for` loops, `while` loops can have an `else` clause:

```python
count = 0
while count < 5:
    print(count)
    count += 1
else:
    print("Loop completed normally")
```

## 4. The `match` Statement: Pattern Matching (Python 3.10+)

The `match` statement (added in Python 3.10) provides structured pattern matching, similar to switch/case in other languages but more powerful.

### First Principles of Pattern Matching

1. **Subject Evaluation** : An expression (the subject) is evaluated once.
2. **Pattern Matching** : The subject is compared against multiple patterns.
3. **Case Selection** : The first matching pattern's block executes.

### Basic Syntax:

```python
match subject:
    case pattern1:
        # Code for pattern1
    case pattern2:
        # Code for pattern2
    case _:  # Wildcard (default case)
        # Code for no match
```

### Simple Example:

```python
status_code = 404

match status_code:
    case 200:
        print("OK")
    case 404:
        print("Not Found")
    case 500:
        print("Server Error")
    case _:
        print("Unknown status code")
```

Output:

```
Not Found
```

### Pattern Matching with Variables

You can capture values within patterns:

```python
command = "open file.txt"

match command.split():
    case ["quit"]:
        print("Exiting program")
    case ["open", filename]:
        print(f"Opening {filename}")
    case ["save", filename]:
        print(f"Saving {filename}")
    case _:
        print("Unknown command")
```

Output:

```
Opening file.txt
```

Here, the pattern `["open", filename]` matches the list `["open", "file.txt"]`, and `filename` captures the value `"file.txt"`.

### OR Patterns

You can combine patterns with `|`:

```python
day = "Tuesday"

match day:
    case "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday":
        print("Weekday")
    case "Saturday" | "Sunday":
        print("Weekend")
    case _:
        print("Invalid day")
```

Output:

```
Weekday
```

### Guard Clauses with `if`

You can add conditions to patterns:

```python
number = 42

match number:
    case n if n < 0:
        print("Negative number")
    case n if n % 2 == 0:
        print("Even number")
    case n if n % 2 == 1:
        print("Odd number")
```

Output:

```
Even number
```

### Matching Objects and Structures

Pattern matching works with complex data structures:

```python
point = (3, 4)

match point:
    case (0, 0):
        print("Origin")
    case (0, y):
        print(f"Y-axis at y={y}")
    case (x, 0):
        print(f"X-axis at x={x}")
    case (x, y):
        print(f"Point at ({x}, {y})")
```

Output:

```
Point at (3, 4)
```

## 5. Practical Examples and Combinations

Let's see how these control structures work together in real-world scenarios.

### Example 1: Finding Prime Numbers

```python
def is_prime(n):
    """Check if a number is prime."""
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
  
    # Check divisibility by numbers of form 6k ± 1
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
  
    return True

# Print all prime numbers less than 50
for num in range(2, 50):
    if is_prime(num):
        print(num, end=" ")
```

Output:

```
2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
```

This example combines:

* An `if` statement for early returns and optimizations
* A `while` loop to check divisibility efficiently
* A `for` loop to iterate through numbers

### Example 2: Text-Based Menu System

```python
def show_menu():
    print("\nMenu:")
    print("1. Say Hello")
    print("2. Count to Ten")
    print("3. Check if a Number is Prime")
    print("4. Exit")

# Main program
choice = 0
while choice != 4:
    show_menu()
  
    try:
        choice = int(input("Enter your choice (1-4): "))
      
        match choice:
            case 1:
                print("Hello, world!")
            case 2:
                for i in range(1, 11):
                    print(i, end=" ")
                print()
            case 3:
                num = int(input("Enter a number: "))
                if is_prime(num):
                    print(f"{num} is prime.")
                else:
                    print(f"{num} is not prime.")
            case 4:
                print("Exiting program. Goodbye!")
            case _:
                print("Invalid choice. Please try again.")
              
    except ValueError:
        print("Please enter a valid number.")
```

This example combines:

* A `while` loop for the main program loop
* A `match` statement to handle menu choices
* `if` statements for the prime number check
* A `for` loop to count to ten

### Example 3: Data Processing

```python
data = [
    {"name": "Alice", "age": 25, "active": True},
    {"name": "Bob", "age": 17, "active": False},
    {"name": "Charlie", "age": 30, "active": True},
    {"name": "Diana", "age": 22, "active": False},
    {"name": "Eve", "age": 15, "active": True}
]

# Find active adult users
active_adults = []
for user in data:
    if user["active"] and user["age"] >= 18:
        active_adults.append(user["name"])

print("Active adult users:", active_adults)

# Process users based on age groups
for user in data:
    match user:
        case {"name": name, "age": age} if age < 18:
            print(f"{name} is a minor.")
        case {"name": name, "age": age} if 18 <= age < 25:
            print(f"{name} is a young adult.")
        case {"name": name, "age": age} if 25 <= age < 65:
            print(f"{name} is an adult.")
        case {"name": name}:
            print(f"{name} is a senior.")
```

Output:

```
Active adult users: ['Alice', 'Charlie']
Alice is an adult.
Bob is a minor.
Charlie is an adult.
Diana is a young adult.
Eve is a minor.
```

This example demonstrates:

* Using a `for` loop to iterate over a list of dictionaries
* Using an `if` statement to filter data
* Using pattern matching with dictionaries and guard clauses

## 6. Common Pitfalls and Best Practices

### Indentation Errors

Python uses indentation to define blocks. Inconsistent indentation causes errors:

```python
if x > 0:
    print("Positive")
  print("This indentation is wrong")  # IndentationError
```

### Infinite Loops

Always ensure your `while` loops have a way to terminate:

```python
# Bad:
while x < 10:
    print(x)
    # x never changes, loop never ends

# Good:
while x < 10:
    print(x)
    x += 1  # x changes, loop will end
```

### Forgetting `break` or `continue`

Using `break` and `continue` incorrectly can lead to unexpected behavior:

```python
# This will always find the first even number and then stop
for num in numbers:
    if num % 2 == 0:
        print(f"Found even number: {num}")
        break  # Stops after finding the first even number

# This skips all even numbers and processes only odd ones
for num in numbers:
    if num % 2 == 0:
        continue  # Skip even numbers
    print(f"Processing odd number: {num}")
```

### Comparison Operators vs. Assignment Operators

A common mistake is using `=` (assignment) instead of `==` (equality):

```python
# Wrong (assigns True to x, condition is always True)
if x = True:
    print("This always runs and causes a syntax error")

# Correct (compares x to True)
if x == True:
    print("This runs only if x is True")
```

### Empty Blocks

Python doesn't allow empty code blocks. Use `pass` for empty blocks:

```python
# This is invalid:
if condition:
    # Empty block causes an error

# This is valid:
if condition:
    pass  # Placeholder for future code
```

## 7. Advanced Concepts

### Conditional Expressions (Ternary Operator)

Python offers a concise way to write simple if-else statements:

```python
# Long form:
if condition:
    x = value1
else:
    x = value2

# Conditional expression (ternary operator):
x = value1 if condition else value2
```

Example:

```python
age = 20
status = "adult" if age >= 18 else "minor"
print(status)  # Outputs: adult
```

### List Comprehensions

List comprehensions combine `for` loops and conditional logic:

```python
# Traditional way:
squares = []
for i in range(10):
    squares.append(i**2)

# List comprehension:
squares = [i**2 for i in range(10)]

# With conditional:
even_squares = [i**2 for i in range(10) if i % 2 == 0]
```

### Using `any()` and `all()`

These functions work with boolean conditions over iterables:

```python
numbers = [2, 4, 6, 8, 9]

# Check if any number is odd
any_odd = any(num % 2 == 1 for num in numbers)
print(any_odd)  # True (9 is odd)

# Check if all numbers are even
all_even = all(num % 2 == 0 for num in numbers)
print(all_even)  # False (9 is odd)
```

> Python's control structures may seem simple on the surface, but they give us tremendous power to express complex logic clearly and concisely. By mastering these structures, you gain the ability to control the flow of your program with precision, creating more efficient, readable, and maintainable code.

I hope this comprehensive guide has helped you understand Python control structures from first principles. The examples demonstrate not just how to write these structures, but why they work the way they do, allowing you to apply them effectively in your own programming tasks.
