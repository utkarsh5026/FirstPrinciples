# Partial Functions and Currying in Python: A Deep Dive from First Principles

Let me take you on a journey through one of the most elegant concepts in functional programming. We'll start from the very foundation and build our understanding step by step.

## Understanding Functions from First Principles

Before we can grasp partial functions and currying, we need to understand what a function truly is at its core.

> **A function is fundamentally a mapping between inputs and outputs.** Think of it as a machine that takes some ingredients (arguments) and produces a result.

```python
def add_two_numbers(a, b):
    """A simple function that maps two inputs to one output"""
    return a + b

# This function creates a mapping: (3, 5) → 8
result = add_two_numbers(3, 5)
print(result)  # Output: 8
```

In this example, our function `add_two_numbers` takes exactly two arguments and produces one result. Every time we call it, we must provide both arguments. But what if we could be more flexible?

## The Birth of Partial Functions

> **A partial function is a function where some of its arguments have been "fixed" or "pre-filled," creating a new function that needs fewer arguments.**

Imagine you're at a coffee shop, and you always order the same size (large) but vary the type of coffee. Instead of saying "large cappuccino," "large latte," "large mocha" every time, wouldn't it be convenient to just say "cappuccino," "latte," "mocha" with the size already understood?

This is exactly what partial functions do in programming.

### Creating Our First Partial Function

Let's start with a concrete example:

```python
from functools import partial

def create_coffee_order(size, coffee_type, milk_type):
    """A function that creates a complete coffee order"""
    return f"One {size} {coffee_type} with {milk_type}"

# Let's say you always order large coffees
# We can create a partial function with size pre-filled
large_coffee = partial(create_coffee_order, "large")

# Now we only need to specify coffee type and milk type
order1 = large_coffee("cappuccino", "whole milk")
order2 = large_coffee("latte", "oat milk")

print(order1)  # Output: One large cappuccino with whole milk
print(order2)  # Output: One large latte with oat milk
```

> **What happened here?** We took a function that needed three arguments and created a new function that only needs two arguments by "partially applying" the first argument.

Let's visualize this transformation:

```
Original function:
create_coffee_order(size, coffee_type, milk_type) → complete order

After partial application:
large_coffee(coffee_type, milk_type) → complete order
(size is already "large")
```

### Building Partial Functions Step by Step

Let's create our own partial function implementation to understand what's happening under the hood:

```python
def my_partial(func, *args):
    """Our own implementation of partial function"""
    def wrapper(*remaining_args):
        # Combine the pre-filled arguments with the new ones
        all_args = args + remaining_args
        return func(*all_args)
    return wrapper

# Let's test our implementation
def multiply_three_numbers(x, y, z):
    """Multiply three numbers together"""
    return x * y * z

# Create a partial function with the first argument fixed to 2
double_and_multiply = my_partial(multiply_three_numbers, 2)

result = double_and_multiply(3, 4)  # This becomes multiply_three_numbers(2, 3, 4)
print(result)  # Output: 24
```

> **The key insight:** A partial function doesn't execute the original function immediately. Instead, it returns a new function that "remembers" the arguments you've already provided.

## Understanding Currying from First Principles

Now that we understand partial functions, let's explore currying, which takes this concept even further.

> **Currying is the technique of transforming a function that takes multiple arguments into a sequence of functions, each taking a single argument.**

The name comes from mathematician Haskell Curry (yes, the programming language Haskell is also named after him!).

### The Philosophy Behind Currying

Think of currying like a conversation:

* Instead of asking "What's your name, age, and city?" all at once
* You ask "What's your name?" → "What's your age?" → "What's your city?"

Each question (function) takes one piece of information and prepares for the next question.

### Building a Curried Function from Scratch

Let's transform our multiplication function into a curried version:

```python
def curried_multiply_three(x):
    """A curried version of multiply_three_numbers"""
    def multiply_by_y(y):
        def multiply_by_z(z):
            return x * y * z
        return multiply_by_z
    return multiply_by_y

# Now we can call it step by step
step1 = curried_multiply_three(2)    # x = 2
step2 = step1(3)                     # y = 3  
result = step2(4)                    # z = 4, final calculation: 2 * 3 * 4
print(result)  # Output: 24

# Or chain the calls together
result = curried_multiply_three(2)(3)(4)
print(result)  # Output: 24
```

Let's visualize this step-by-step process:

```
Step 1: curried_multiply_three(2)
        Returns a function that remembers x = 2

Step 2: (returned function)(3)
        Returns a function that remembers x = 2, y = 3

Step 3: (returned function)(4)
        Finally calculates: 2 * 3 * 4 = 24
```

### Creating a General Currying Function

Let's build a function that can curry any function automatically:

```python
def curry(func, num_args):
    """Transform any function into a curried version"""
    def curried(*args):
        # If we have enough arguments, call the original function
        if len(args) >= num_args:
            return func(*args[:num_args])
      
        # Otherwise, return a function that waits for more arguments
        def partial_func(*more_args):
            return curried(*(args + more_args))
        return partial_func
  
    return curried

# Let's test our currying function
def add_four_numbers(a, b, c, d):
    """Add four numbers together"""
    return a + b + c + d

# Create a curried version
curried_add = curry(add_four_numbers, 4)

# We can now call it in various ways
result1 = curried_add(1)(2)(3)(4)           # One at a time
result2 = curried_add(1, 2)(3)(4)           # Two, then one, then one
result3 = curried_add(1)(2, 3, 4)           # One, then three
result4 = curried_add(1, 2, 3, 4)           # All at once

print(f"All results: {result1}, {result2}, {result3}, {result4}")
# Output: All results: 10, 10, 10, 10
```

> **The beauty of currying:** It gives us maximum flexibility in how we apply arguments to a function, allowing us to build up the function call piece by piece.

## The Relationship Between Partial Functions and Currying

Now let's explore how these two concepts are related and where they differ.

### Similarities and Differences

```python
from functools import partial

def calculate_total_price(base_price, tax_rate, discount_rate):
    """Calculate total price with tax and discount"""
    price_with_tax = base_price * (1 + tax_rate)
    final_price = price_with_tax * (1 - discount_rate)
    return final_price

# Using partial functions - we fix some arguments
standard_tax_calculator = partial(calculate_total_price, tax_rate=0.08)
# This creates: calculate_total_price(base_price, tax_rate=0.08, discount_rate)

# Using currying - we create a chain of single-argument functions
def curried_price_calculator(base_price):
    def with_tax(tax_rate):
        def with_discount(discount_rate):
            price_with_tax = base_price * (1 + tax_rate)
            return price_with_tax * (1 - discount_rate)
        return with_discount
    return with_tax

# Partial function usage
price1 = standard_tax_calculator(100, 0.1)  # base_price=100, discount_rate=0.1
print(f"Partial function result: ${price1:.2f}")

# Curried function usage  
price2 = curried_price_calculator(100)(0.08)(0.1)
print(f"Curried function result: ${price2:.2f}")
```

> **Key Difference:** Partial functions let you fix any subset of arguments in any order, while currying specifically transforms a function into a chain of single-argument functions applied in a specific order.

## Practical Applications and Real-World Examples

### Example 1: Event Handler Creation

Let's see how partial functions can simplify event handling:

```python
from functools import partial

def handle_button_click(button_id, action_type, event_data):
    """Generic button click handler"""
    print(f"Button {button_id} performed {action_type}")
    print(f"Event data: {event_data}")
  
    if action_type == "save":
        # Simulate saving data
        print("Data saved successfully!")
    elif action_type == "delete":
        # Simulate deleting data
        print("Data deleted successfully!")

# Create specific handlers using partial functions
save_button_handler = partial(handle_button_click, "save_btn", "save")
delete_button_handler = partial(handle_button_click, "delete_btn", "delete")

# Now we can easily use these handlers
save_button_handler({"user_id": 123, "form_data": "example"})
print("---")
delete_button_handler({"item_id": 456})
```

### Example 2: Configuration-Based Functions

Here's how currying can help with configuration:

```python
def create_database_query(table_name):
    """Curried function for building database queries"""
    def with_operation(operation):
        def with_conditions(conditions):
            if operation == "SELECT":
                return f"SELECT * FROM {table_name} WHERE {conditions}"
            elif operation == "DELETE":
                return f"DELETE FROM {table_name} WHERE {conditions}"
            elif operation == "UPDATE":
                return f"UPDATE {table_name} SET {conditions}"
        return with_conditions
    return with_operation

# Create specialized query builders
user_queries = create_database_query("users")
product_queries = create_database_query("products")

# Build specific queries
user_select = user_queries("SELECT")
user_delete = user_queries("DELETE")

# Generate actual SQL
query1 = user_select("age > 18 AND status = 'active'")
query2 = user_delete("created_date < '2020-01-01'")

print("User select query:", query1)
print("User delete query:", query2)
```

## Advanced Patterns and Techniques

### Combining Partial Functions with Higher-Order Functions

```python
from functools import partial

def apply_operation(operation, *values):
    """Apply an operation to multiple values"""
    if operation == "sum":
        return sum(values)
    elif operation == "product":
        result = 1
        for value in values:
            result *= value
        return result
    elif operation == "max":
        return max(values)

# Create specialized functions
sum_calculator = partial(apply_operation, "sum")
product_calculator = partial(apply_operation, "product")
max_finder = partial(apply_operation, "max")

# Use them with different data sets
numbers1 = [1, 2, 3, 4, 5]
numbers2 = [10, 20, 30]

print(f"Sum of {numbers1}: {sum_calculator(*numbers1)}")
print(f"Product of {numbers2}: {product_calculator(*numbers2)}")
print(f"Max of {numbers1}: {max_finder(*numbers1)}")
```

### Creating Decorator Functions with Currying

```python
def create_retry_decorator(max_attempts):
    """Curried function that creates a retry decorator"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_exception = None
          
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    print(f"Attempt {attempt + 1} failed: {e}")
                  
            # If all attempts failed, raise the last exception
            raise last_exception
        return wrapper
    return decorator

# Create specific retry decorators
retry_3_times = create_retry_decorator(3)
retry_5_times = create_retry_decorator(5)

# Use them to decorate functions
@retry_3_times
def unreliable_network_call():
    """Simulate an unreliable network operation"""
    import random
    if random.random() < 0.7:  # 70% chance of failure
        raise ConnectionError("Network connection failed")
    return "Success!"

# Test the decorated function
try:
    result = unreliable_network_call()
    print(f"Final result: {result}")
except Exception as e:
    print(f"All attempts failed: {e}")
```

## Memory and Performance Considerations

> **Important to understand:** Both partial functions and currying create new function objects, which can have memory implications in certain scenarios.

```python
import sys
from functools import partial

def simple_function(a, b, c):
    return a + b + c

# Create many partial functions
partial_functions = []
for i in range(1000):
    partial_func = partial(simple_function, i)
    partial_functions.append(partial_func)

print(f"Memory usage of 1000 partial functions: {sys.getsizeof(partial_functions)} bytes")

# Each partial function stores references to the original function and arguments
print(f"Size of one partial function: {sys.getsizeof(partial_functions[0])} bytes")
```

> **Best Practice:** Use partial functions and currying when they improve code readability and maintainability, but be mindful of creating too many in performance-critical applications.

## When to Use Each Technique

### Use Partial Functions When:

* You want to fix some arguments of an existing function
* You need to create specialized versions of general functions
* You're working with callback functions or event handlers
* You want to simplify function calls in specific contexts

### Use Currying When:

* You're building functions step by step
* You want maximum flexibility in argument application
* You're working with functional programming patterns
* You need to create function pipelines or compositions

```python
# Partial functions - great for specialization
from functools import partial

def send_email(sender, recipient, subject, body, priority="normal"):
    return f"Email from {sender} to {recipient}: '{subject}' (Priority: {priority})"

# Create a specialized sender
admin_emailer = partial(send_email, "admin@company.com", priority="high")

# Easy to use
notification = admin_emailer("user@company.com", "Welcome", "Welcome to our service!")
print(notification)

# Currying - great for building step by step
def build_url(protocol):
    def with_domain(domain):
        def with_path(path):
            def with_params(params=""):
                url = f"{protocol}://{domain}/{path}"
                if params:
                    url += f"?{params}"
                return url
            return with_params
        return with_path
    return with_domain

# Build URLs step by step
api_builder = build_url("https")("api.example.com")
user_endpoint = api_builder("users")
specific_user = user_endpoint("id=123&include=profile")

print(f"Generated URL: {specific_user}")
```

> **The key takeaway:** Both partial functions and currying are powerful tools for creating more flexible and reusable code. They allow you to transform general functions into more specific ones, making your code more modular and easier to reason about.

Understanding these concepts deeply will help you write more elegant and functional Python code, especially when working with higher-order functions, decorators, and functional programming patterns.
