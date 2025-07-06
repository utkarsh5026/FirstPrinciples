# Python Decorators: From First Principles to Advanced Patterns

## Foundation: Functions as First-Class Objects

Before understanding decorators, we need to grasp a fundamental Python concept:  **functions are objects** .

```python
# Functions can be assigned to variables
def greet(name):
    return f"Hello, {name}!"

# The function is an object we can reference
greeting_function = greet
print(greeting_function("Alice"))  # "Hello, Alice!"
print(type(greet))  # <class 'function'>
```

> **Key Mental Model** : In Python, functions are not just code blocks - they're objects that can be passed around, stored in variables, and manipulated like any other data.

```python
# Functions can be passed as arguments
def apply_twice(func, value):
    """Apply a function twice to a value"""
    return func(func(value))

def add_five(x):
    return x + 5

result = apply_twice(add_five, 10)  # ((10 + 5) + 5) = 20
print(result)  # 20
```

## What Are Decorators Conceptually?

```
Original Function    Decorator        Enhanced Function
     ┌─────────┐        ┌───┐         ┌─────────────┐
     │  func   │───────▶│ @ │────────▶│ enhanced    │
     │         │        │   │         │ func        │
     └─────────┘        └───┘         └─────────────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │ Extra       │
                                    │ Behavior    │
                                    └─────────────┘
```

> **Decorator Philosophy** : Decorators implement the "Open/Closed Principle" - they allow you to extend functionality without modifying existing code. They embody Python's philosophy of readability and expressiveness.

## Building Decorators Step by Step

### Step 1: Manual Function Wrapping (Pre-Decorator)

```python
# The manual way - what decorators automate
def original_function():
    print("Doing something important")

def timing_wrapper(func):
    """Manually wrap a function to add timing"""
    def inner():
        import time
        start = time.time()
        func()  # Call the original function
        end = time.time()
        print(f"Function took {end - start:.4f} seconds")
    return inner

# Manual wrapping
original_function = timing_wrapper(original_function)
original_function()  # Now includes timing
```

### Step 2: First Real Decorator

```python
def timer(func):
    """A simple timing decorator"""
    def wrapper():
        import time
        start = time.time()
        result = func()  # Call original function
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result  # Don't forget to return the result!
    return wrapper

# Using the @ syntax - Python's syntactic sugar
@timer
def slow_function():
    import time
    time.sleep(1)
    return "Done!"

# This is equivalent to: slow_function = timer(slow_function)
result = slow_function()
```

> **Common Pitfall** : Always remember to return the result from your wrapper function, or you'll lose the original function's return value!

### Step 3: Handling Arguments with *args and **kwargs

```python
def debug_calls(func):
    """Decorator that logs function calls with arguments"""
    def wrapper(*args, **kwargs):
        # *args captures positional arguments as a tuple
        # **kwargs captures keyword arguments as a dictionary
        print(f"Calling {func.__name__} with args: {args}, kwargs: {kwargs}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned: {result}")
        return result
    return wrapper

@debug_calls
def calculate(x, y, operation="add"):
    if operation == "add":
        return x + y
    elif operation == "multiply":
        return x * y
    return 0

# Test the decorated function
calculate(5, 3)                    # Logs: args: (5, 3), kwargs: {}
calculate(4, 7, operation="multiply")  # Logs: args: (4, 7), kwargs: {'operation': 'multiply'}
```

### Step 4: Preserving Function Metadata

```python
import functools

def better_timer(func):
    """Properly preserves original function metadata"""
    @functools.wraps(func)  # This preserves __name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper

@better_timer
def important_function():
    """This function does important work"""
    return "Important result"

# Without @functools.wraps, this would be 'wrapper'
print(important_function.__name__)  # 'important_function'
print(important_function.__doc__)   # 'This function does important work'
```

> **Best Practice** : Always use `@functools.wraps(func)` in your decorators to preserve the original function's metadata. This is crucial for debugging and introspection.

## Advanced Decorator Patterns

### Parameterized Decorators

```python
def retry(max_attempts=3, delay=1):
    """Decorator factory - returns a decorator based on parameters"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise  # Re-raise on final attempt
                    print(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay}s...")
                    time.sleep(delay)
        return wrapper
    return decorator

# Using the parameterized decorator
@retry(max_attempts=5, delay=0.5)
def unreliable_network_call():
    import random
    if random.random() < 0.7:  # 70% chance of failure
        raise ConnectionError("Network timeout")
    return "Success!"

# This creates: retry(5, 0.5)(unreliable_network_call)
```

Let's break down the three-layer structure:

```
┌─────────────────────────────────────┐
│ retry(max_attempts=3, delay=1)      │  ← Decorator Factory
│ ┌─────────────────────────────────┐ │
│ │ decorator(func)                 │ │  ← Actual Decorator  
│ │ ┌─────────────────────────────┐ │ │
│ │ │ wrapper(*args, **kwargs)    │ │ │  ← Wrapper Function
│ │ │   # retry logic here        │ │ │
│ │ │   return func(*args, **kw.) │ │ │
│ │ └─────────────────────────────┘ │ │
│ │ return wrapper                  │ │
│ └─────────────────────────────────┘ │
│ return decorator                    │
└─────────────────────────────────────┘
```

### Class-Based Decorators

```python
class CountCalls:
    """Decorator implemented as a class"""
    def __init__(self, func):
        self.func = func
        self.count = 0
        # Preserve function metadata manually for class decorators
        functools.update_wrapper(self, func)
  
    def __call__(self, *args, **kwargs):
        """Make the instance callable like a function"""
        self.count += 1
        print(f"{self.func.__name__} has been called {self.count} times")
        return self.func(*args, **kwargs)

@CountCalls
def say_hello(name):
    return f"Hello, {name}!"

say_hello("Alice")  # say_hello has been called 1 times
say_hello("Bob")    # say_hello has been called 2 times
print(say_hello.count)  # Access the counter: 2
```

### Decorating Classes

```python
def add_repr(cls):
    """Class decorator that adds a __repr__ method"""
    def __repr__(self):
        attrs = ', '.join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"
  
    cls.__repr__ = __repr__
    return cls

@add_repr
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

person = Person("Alice", 30)
print(person)  # Person(name='Alice', age=30)
```

## Real-World Decorator Patterns

### Authentication and Authorization

```python
def require_auth(role=None):
    """Decorator for checking user authentication and authorization"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # In a real app, this would check session/token
            current_user = get_current_user()  # Imaginary function
          
            if not current_user:
                raise PermissionError("Authentication required")
          
            if role and current_user.role != role:
                raise PermissionError(f"Role '{role}' required")
          
            return func(*args, **kwargs)
        return wrapper
    return decorator

@require_auth(role="admin")
def delete_user(user_id):
    """Only admins can delete users"""
    print(f"Deleting user {user_id}")

@require_auth()
def view_profile():
    """Any authenticated user can view their profile"""
    print("Viewing profile")
```

### Caching with TTL (Time To Live)

```python
import time
from functools import wraps

def cache_with_ttl(ttl_seconds=300):
    """Decorator that caches results for a specified time"""
    def decorator(func):
        cache = {}
      
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create a cache key from arguments
            key = str(args) + str(sorted(kwargs.items()))
            current_time = time.time()
          
            # Check if we have a cached result that's still valid
            if key in cache:
                result, timestamp = cache[key]
                if current_time - timestamp < ttl_seconds:
                    print(f"Cache hit for {func.__name__}")
                    return result
          
            # Cache miss or expired - call function and cache result
            print(f"Cache miss for {func.__name__}")
            result = func(*args, **kwargs)
            cache[key] = (result, current_time)
            return result
      
        # Add cache inspection methods
        wrapper.cache_info = lambda: len(cache)
        wrapper.cache_clear = lambda: cache.clear()
        return wrapper
    return decorator

@cache_with_ttl(ttl_seconds=5)
def expensive_computation(n):
    """Simulate an expensive computation"""
    time.sleep(2)  # Simulate work
    return n * n

# First call - cache miss
result1 = expensive_computation(10)  # Takes 2 seconds

# Second call within TTL - cache hit
result2 = expensive_computation(10)  # Returns immediately

# Wait for TTL to expire
time.sleep(6)
result3 = expensive_computation(10)  # Cache miss again
```

## Advanced Decorator Techniques

### Property Decorators

```python
class Temperature:
    def __init__(self, celsius=0):
        self._celsius = celsius
  
    @property
    def celsius(self):
        """Get temperature in Celsius"""
        return self._celsius
  
    @celsius.setter
    def celsius(self, value):
        """Set temperature in Celsius with validation"""
        if value < -273.15:
            raise ValueError("Temperature cannot be below absolute zero")
        self._celsius = value
  
    @property
    def fahrenheit(self):
        """Get temperature in Fahrenheit"""
        return self._celsius * 9/5 + 32
  
    @fahrenheit.setter
    def fahrenheit(self, value):
        """Set temperature via Fahrenheit"""
        self.celsius = (value - 32) * 5/9

temp = Temperature()
temp.celsius = 25
print(temp.fahrenheit)  # 77.0

temp.fahrenheit = 100
print(temp.celsius)     # 37.777...
```

### Stacking Decorators

```python
@retry(max_attempts=3)
@timer
@debug_calls
def critical_operation(data):
    """Function with multiple decorators applied"""
    # Process data
    return f"Processed: {data}"

# Execution order (bottom to top):
# 1. debug_calls wraps the original function
# 2. timer wraps the debug_calls wrapper  
# 3. retry wraps the timer wrapper
```

```
Call Stack Visualization:
┌─────────────────────────┐
│ retry wrapper           │
│ ┌─────────────────────┐ │
│ │ timer wrapper       │ │
│ │ ┌─────────────────┐ │ │
│ │ │ debug wrapper   │ │ │
│ │ │ ┌─────────────┐ │ │ │
│ │ │ │ original    │ │ │ │
│ │ │ │ function    │ │ │ │
│ │ │ └─────────────┘ │ │ │
│ │ └─────────────────┘ │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## Common Pitfalls and How to Avoid Them

### Pitfall 1: Mutable Default Arguments in Decorator Factories

```python
# WRONG - dangerous mutable default
def cache_bad(cache={}):  # Don't do this!
    def decorator(func):
        def wrapper(*args):
            if args not in cache:
                cache[args] = func(*args)
            return cache[args]
        return wrapper
    return decorator

# RIGHT - create new cache each time
def cache_good(cache=None):
    if cache is None:
        cache = {}
    def decorator(func):
        def wrapper(*args):
            if args not in cache:
                cache[args] = func(*args)
            return cache[args]
        return wrapper
    return decorator
```

### Pitfall 2: Forgetting to Handle Methods

```python
class MyClass:
    @timer  # This breaks because 'self' is passed as first argument
    def method(self, x):
        return x * 2

# Fix: Use functools.wraps and handle *args, **kwargs properly
def method_timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):  # This handles 'self' correctly
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"{func.__name__} took {end - start:.4f} seconds")
        return result
    return wrapper
```

> **Key Insight** : When decorating methods, the `self` parameter is just another argument. Using `*args, **kwargs` in your wrapper handles this automatically.

## Performance Considerations

```python
import functools
import time

def performance_decorator(func):
    """Decorator that tracks performance metrics"""
    call_count = 0
    total_time = 0
  
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        nonlocal call_count, total_time
      
        start = time.perf_counter()
        result = func(*args, **kwargs)
        duration = time.perf_counter() - start
      
        call_count += 1
        total_time += duration
      
        return result
  
    # Add performance inspection methods
    wrapper.get_stats = lambda: {
        'calls': call_count,
        'total_time': total_time,
        'avg_time': total_time / call_count if call_count > 0 else 0
    }
  
    return wrapper

@performance_decorator
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

fibonacci(10)
print(fibonacci.get_stats())  # {'calls': 177, 'total_time': 0.0001, 'avg_time': 5.6e-07}
```

## Modern Python Decorator Features

### Using `functools.singledispatch` for Method Overloading

```python
from functools import singledispatch

@singledispatch
def process_data(data):
    """Default implementation"""
    raise NotImplementedError(f"Cannot process {type(data)}")

@process_data.register(int)
def _(data):
    return f"Processing integer: {data}"

@process_data.register(str)
def _(data):
    return f"Processing string: {data.upper()}"

@process_data.register(list)
def _(data):
    return f"Processing list of {len(data)} items"

print(process_data(42))      # "Processing integer: 42"
print(process_data("hello")) # "Processing string: HELLO"
print(process_data([1,2,3])) # "Processing list of 3 items"
```

> **Modern Python Philosophy** : Decorators enable elegant solutions to complex problems. They embody Python's principle of "There should be one obvious way to do it" by providing clear, reusable patterns for cross-cutting concerns.

## Summary: The Decorator Mental Model

```
┌─────────────────────────────────────────┐
│              Decorator Ecosystem         │
├─────────────────────────────────────────┤
│                                         │
│ Function Decorator                      │
│ ┌─────────────────────────────────────┐ │
│ │ @decorator                          │ │
│ │ def function():                     │ │
│ │     pass                           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Class Decorator                         │
│ ┌─────────────────────────────────────┐ │
│ │ @decorator                          │ │
│ │ class MyClass:                      │ │
│ │     pass                           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Parameterized Decorator                 │
│ ┌─────────────────────────────────────┐ │
│ │ @decorator(param1, param2)          │ │
│ │ def function():                     │ │
│ │     pass                           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

 **Decorators are Python's way of implementing the Aspect-Oriented Programming paradigm** , allowing you to cleanly separate cross-cutting concerns (logging, timing, authentication, caching) from your core business logic. They make code more readable, maintainable, and follow the DRY (Don't Repeat Yourself) principle.

Understanding decorators deeply gives you access to one of Python's most powerful metaprogramming features, enabling you to write more elegant, reusable, and maintainable code.
