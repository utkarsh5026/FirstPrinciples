# Python Descriptors: Understanding the Magic Behind Attribute Access

> **Descriptors are the foundation of Python's object-oriented features. They control how attributes are accessed, modified, and deleted, forming the backbone of properties, methods, and many built-in functionalities.**

Let's embark on a journey to understand descriptors from the ground up, starting with the most fundamental concepts and building toward their sophisticated applications.

## What Are Descriptors? The First Principle

To understand descriptors, we must first understand how Python handles attribute access. When you write `obj.attr`, Python doesn't simply retrieve a value from a dictionary. Instead, it follows a complex protocol that can be customized through descriptors.

A descriptor is any object that implements one or more of these special methods:

* `__get__(self, obj, objtype=None)` - Controls attribute retrieval
* `__set__(self, obj, value)` - Controls attribute assignment
* `__delete__(self, obj)` - Controls attribute deletion

Think of descriptors as gatekeepers that intercept and customize how attributes behave when accessed, modified, or deleted.

## The Descriptor Protocol: How Python Finds Attributes

Before diving into creating descriptors, let's understand Python's attribute lookup mechanism. When you access `obj.attr`, Python follows this sequence:

1. **Data descriptors** from the class hierarchy (highest priority)
2. **Instance dictionary** (`obj.__dict__`)
3. **Non-data descriptors** and other class attributes
4. **Raise AttributeError** if nothing is found

> **Data descriptors** implement both `__get__` and `__set__` methods, while **non-data descriptors** implement only `__get__`.

Let's see this in action with a simple example:

```python
class SimpleDescriptor:
    def __get__(self, obj, objtype=None):
        print(f"Getting attribute from {obj} of type {objtype}")
        return "descriptor value"

class MyClass:
    attr = SimpleDescriptor()  # This is a descriptor

# Create an instance and access the attribute
obj = MyClass()
print(obj.attr)  # This triggers the descriptor's __get__ method
```

In this example, when we access `obj.attr`, Python recognizes that `attr` is a descriptor and calls its `__get__` method instead of returning the descriptor object itself.

## Building Your First Descriptor: A Temperature Converter

Let's create a practical descriptor that automatically converts temperature values:

```python
class TemperatureDescriptor:
    def __init__(self, name):
        # Store the name to identify this descriptor
        self.name = name
  
    def __get__(self, obj, objtype=None):
        # If accessed from class, return the descriptor itself
        if obj is None:
            return self
        # Return the stored value from the instance
        return getattr(obj, f'_{self.name}', 0)
  
    def __set__(self, obj, value):
        # Validate the temperature value
        if not isinstance(value, (int, float)):
            raise TypeError("Temperature must be a number")
        if value < -273.15:  # Absolute zero in Celsius
            raise ValueError("Temperature cannot be below absolute zero")
      
        # Store the value in the instance with a private name
        setattr(obj, f'_{self.name}', value)
        print(f"Temperature set to {value}°C")

class Thermometer:
    # Create a descriptor for temperature
    celsius = TemperatureDescriptor('celsius')
  
    def __init__(self, temp=0):
        self.celsius = temp  # This uses our descriptor
  
    @property
    def fahrenheit(self):
        # Convert celsius to fahrenheit
        return (self.celsius * 9/5) + 32

# Using our temperature descriptor
thermo = Thermometer(25)
print(f"Temperature: {thermo.celsius}°C")  # Uses __get__
print(f"In Fahrenheit: {thermo.fahrenheit:.1f}°F")

# The descriptor validates our input
try:
    thermo.celsius = -300  # This will raise an exception
except ValueError as e:
    print(f"Error: {e}")
```

This example demonstrates how descriptors can validate data and provide a clean interface for attribute access.

## Data vs Non-Data Descriptors: Understanding the Hierarchy

The distinction between data and non-data descriptors is crucial for understanding Python's attribute lookup:

```python
class DataDescriptor:
    """Implements both __get__ and __set__ - higher priority"""
    def __get__(self, obj, objtype=None):
        return "data descriptor value"
  
    def __set__(self, obj, value):
        print(f"Data descriptor received: {value}")

class NonDataDescriptor:
    """Implements only __get__ - lower priority"""
    def __get__(self, obj, objtype=None):
        return "non-data descriptor value"

class TestClass:
    data_desc = DataDescriptor()
    non_data_desc = NonDataDescriptor()

obj = TestClass()

# Data descriptor takes precedence over instance attributes
obj.__dict__['data_desc'] = "instance value"
print(obj.data_desc)  # Still prints: "data descriptor value"

# Non-data descriptor is overridden by instance attributes
obj.__dict__['non_data_desc'] = "instance value"
print(obj.non_data_desc)  # Prints: "instance value"
```

> **This hierarchy explains why properties (data descriptors) always take precedence over instance attributes, while methods (non-data descriptors) can be overridden.**

## Advanced Descriptor: Typed Attributes with Validation

Let's create a more sophisticated descriptor system for type validation:

```python
class TypedDescriptor:
    def __init__(self, name, expected_type, validator=None):
        self.name = name
        self.expected_type = expected_type
        self.validator = validator
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, f'_{self.name}', None)
  
    def __set__(self, obj, value):
        # Type checking
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.name} must be of type {self.expected_type.__name__}, "
                f"got {type(value).__name__}"
            )
      
        # Custom validation if provided
        if self.validator and not self.validator(value):
            raise ValueError(f"Invalid value for {self.name}: {value}")
      
        setattr(obj, f'_{self.name}', value)
  
    def __delete__(self, obj):
        try:
            delattr(obj, f'_{self.name}')
        except AttributeError:
            raise AttributeError(f"'{self.name}' not set")

# Validator functions
def positive_validator(value):
    return value > 0

def email_validator(value):
    return '@' in value and '.' in value

class Person:
    # Different typed descriptors with validation
    name = TypedDescriptor('name', str)
    age = TypedDescriptor('age', int, positive_validator)
    email = TypedDescriptor('email', str, email_validator)
  
    def __init__(self, name, age, email):
        self.name = name
        self.age = age
        self.email = email

# Using our typed descriptors
person = Person("Alice", 30, "alice@example.com")
print(f"Person: {person.name}, {person.age}, {person.email}")

# Validation in action
try:
    person.age = -5  # Will raise ValueError
except ValueError as e:
    print(f"Validation error: {e}")

try:
    person.email = "invalid-email"  # Will raise ValueError
except ValueError as e:
    print(f"Validation error: {e}")
```

## Understanding How Properties Work: Descriptors Under the Hood

Properties are actually descriptors in disguise. Let's understand how they work by implementing our own version:

```python
class MyProperty:
    """A simplified version of Python's built-in property"""
  
    def __init__(self, fget=None, fset=None, fdel=None, doc=None):
        self.fget = fget  # Getter function
        self.fset = fset  # Setter function
        self.fdel = fdel  # Deleter function
        self.__doc__ = doc
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        if self.fget is None:
            raise AttributeError("unreadable attribute")
        return self.fget(obj)
  
    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError("can't set attribute")
        self.fset(obj, value)
  
    def __delete__(self, obj):
        if self.fdel is None:
            raise AttributeError("can't delete attribute")
        self.fdel(obj)
  
    def setter(self, fset):
        """Decorator to set the setter function"""
        return type(self)(self.fget, fset, self.fdel, self.__doc__)
  
    def deleter(self, fdel):
        """Decorator to set the deleter function"""
        return type(self)(self.fget, self.fset, fdel, self.__doc__)

class Circle:
    def __init__(self, radius):
        self._radius = radius
  
    @MyProperty
    def radius(self):
        """Get the radius of the circle"""
        return self._radius
  
    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value
  
    @MyProperty
    def area(self):
        """Calculate the area of the circle"""
        return 3.14159 * self._radius ** 2

# Using our custom property
circle = Circle(5)
print(f"Radius: {circle.radius}")
print(f"Area: {circle.area:.2f}")

circle.radius = 10
print(f"New area: {circle.area:.2f}")
```

> **This example shows that properties are simply a convenient way to create descriptors with getter, setter, and deleter functions.**

## Descriptor-Based Caching: Implementing Lazy Evaluation

Descriptors are perfect for implementing caching mechanisms. Here's a descriptor that computes expensive operations only once:

```python
import time
import functools

class CachedProperty:
    """A descriptor that caches the result of expensive computations"""
  
    def __init__(self, func):
        self.func = func
        self.name = func.__name__
        self.__doc__ = func.__doc__
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
      
        # Check if we've already cached the result
        cache_name = f'_cached_{self.name}'
        if hasattr(obj, cache_name):
            print(f"Returning cached value for {self.name}")
            return getattr(obj, cache_name)
      
        # Compute and cache the result
        print(f"Computing {self.name}...")
        result = self.func(obj)
        setattr(obj, cache_name, result)
        return result
  
    def __set__(self, obj, value):
        # Allow manual override of cached value
        cache_name = f'_cached_{self.name}'
        setattr(obj, cache_name, value)
  
    def __delete__(self, obj):
        # Clear the cache
        cache_name = f'_cached_{self.name}'
        try:
            delattr(obj, cache_name)
        except AttributeError:
            pass

class DataProcessor:
    def __init__(self, data):
        self.data = data
  
    @CachedProperty
    def expensive_calculation(self):
        """Simulate an expensive calculation"""
        time.sleep(1)  # Simulate processing time
        return sum(x**2 for x in self.data)
  
    @CachedProperty
    def statistics(self):
        """Calculate various statistics"""
        time.sleep(0.5)  # Another expensive operation
        return {
            'mean': sum(self.data) / len(self.data),
            'max': max(self.data),
            'min': min(self.data)
        }

# Using cached properties
processor = DataProcessor([1, 2, 3, 4, 5])

# First access - computation happens
result1 = processor.expensive_calculation
print(f"Result: {result1}")

# Second access - uses cached value
result2 = processor.expensive_calculation
print(f"Result: {result2}")

# Statistics are also cached
stats = processor.statistics
print(f"Statistics: {stats}")
```

## Method Descriptors: How Functions Become Bound Methods

Functions in Python classes are actually descriptors. This is how they transform into bound methods:

```python
class MethodDescriptor:
    """Simplified version of how Python functions work as descriptors"""
  
    def __init__(self, func):
        self.func = func
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self.func  # Unbound function
        # Return a bound method
        return BoundMethod(obj, self.func)

class BoundMethod:
    """Represents a method bound to an instance"""
  
    def __init__(self, instance, func):
        self.instance = instance
        self.func = func
  
    def __call__(self, *args, **kwargs):
        # Call the function with the instance as first argument
        return self.func(self.instance, *args, **kwargs)

class MyClass:
    def __init__(self, value):
        self.value = value
  
    # This function is actually a descriptor
    method = MethodDescriptor(lambda self, x: self.value + x)

obj = MyClass(10)
print(obj.method(5))  # Calls the bound method: 10 + 5 = 15

# Accessing from class returns unbound function
print(MyClass.method)  # <function <lambda> at ...>
```

> **This mechanism is why `self` is automatically passed to instance methods - the descriptor protocol handles the binding.**

## Practical Application: Database Field Descriptors

Let's create a realistic example of descriptors for a simple ORM-like system:

```python
class Field:
    """Base class for database field descriptors"""
  
    def __init__(self, name=None, required=False, default=None):
        self.name = name
        self.required = required
        self.default = default
  
    def __set_name__(self, owner, name):
        # Called when the descriptor is assigned to a class attribute
        if self.name is None:
            self.name = name
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, f'_{self.name}', self.default)
  
    def __set__(self, obj, value):
        if self.required and value is None:
            raise ValueError(f"{self.name} is required")
      
        self.validate(value)
        setattr(obj, f'_{self.name}', value)
  
    def validate(self, value):
        """Override in subclasses for specific validation"""
        pass

class StringField(Field):
    def __init__(self, max_length=None, **kwargs):
        super().__init__(**kwargs)
        self.max_length = max_length
  
    def validate(self, value):
        if value is not None and not isinstance(value, str):
            raise TypeError(f"{self.name} must be a string")
        if self.max_length and len(value) > self.max_length:
            raise ValueError(f"{self.name} exceeds maximum length of {self.max_length}")

class IntegerField(Field):
    def __init__(self, min_value=None, max_value=None, **kwargs):
        super().__init__(**kwargs)
        self.min_value = min_value
        self.max_value = max_value
  
    def validate(self, value):
        if value is not None and not isinstance(value, int):
            raise TypeError(f"{self.name} must be an integer")
        if self.min_value is not None and value < self.min_value:
            raise ValueError(f"{self.name} must be at least {self.min_value}")
        if self.max_value is not None and value > self.max_value:
            raise ValueError(f"{self.name} must be at most {self.max_value}")

# Model using field descriptors
class User:
    username = StringField(max_length=50, required=True)
    email = StringField(required=True)
    age = IntegerField(min_value=0, max_value=150)
  
    def __init__(self, username, email, age=None):
        self.username = username
        self.email = email
        self.age = age
  
    def __repr__(self):
        return f"User(username='{self.username}', email='{self.email}', age={self.age})"

# Using our ORM-like model
user = User("alice", "alice@example.com", 25)
print(user)

# Field validation in action
try:
    user.age = -5  # Will raise ValueError
except ValueError as e:
    print(f"Validation error: {e}")

try:
    user.username = "x" * 60  # Will raise ValueError (too long)
except ValueError as e:
    print(f"Validation error: {e}")
```

## The `__set_name__` Method: Modern Descriptor Enhancement

Python 3.6 introduced the `__set_name__` method, which is automatically called when a descriptor is assigned to a class attribute:

```python
class AutoNamedDescriptor:
    def __init__(self, default=None):
        self.default = default
        self.name = None  # Will be set automatically
  
    def __set_name__(self, owner, name):
        """Called automatically when assigned to a class"""
        self.name = name
        print(f"Descriptor assigned to attribute '{name}' of class '{owner.__name__}'")
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return getattr(obj, f'_{self.name}', self.default)
  
    def __set__(self, obj, value):
        setattr(obj, f'_{self.name}', value)

class MyClass:
    # The descriptor automatically knows its name
    attribute1 = AutoNamedDescriptor("default1")
    attribute2 = AutoNamedDescriptor("default2")
```

> **The `__set_name__` method eliminates the need to manually pass attribute names to descriptors, making them more convenient to use.**

## Performance Considerations and Best Practices

When using descriptors, keep these performance and design considerations in mind:

```python
class OptimizedDescriptor:
    """An example of an optimized descriptor implementation"""
  
    def __init__(self, name=None, validator=None):
        self.name = name
        self.validator = validator
        # Pre-compute the internal attribute name
        self._internal_name = f'_{name}' if name else None
  
    def __set_name__(self, owner, name):
        if self.name is None:
            self.name = name
            self._internal_name = f'_{name}'
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
      
        # Use __dict__ directly for better performance
        try:
            return obj.__dict__[self._internal_name]
        except KeyError:
            raise AttributeError(f"'{objtype.__name__}' object has no attribute '{self.name}'")
  
    def __set__(self, obj, value):
        if self.validator:
            if not self.validator(value):
                raise ValueError(f"Invalid value for {self.name}")
      
        # Direct dictionary access is faster than setattr
        obj.__dict__[self._internal_name] = value

# Usage example with performance-conscious design
class PerformantClass:
    value = OptimizedDescriptor(validator=lambda x: isinstance(x, (int, float)))
```

Descriptors are fundamental to understanding Python's object model. They power properties, methods, class methods, static methods, and many other features. By mastering descriptors, you gain deep insight into how Python's attribute access system works and can create powerful, reusable components for your applications.

> **Remember: Descriptors are called every time an attribute is accessed. Design them carefully to avoid performance bottlenecks, and always consider whether a simple property or instance variable might be sufficient for your use case.**

The journey through descriptors reveals the elegant design of Python's object system, where seemingly simple attribute access is actually a sophisticated protocol that can be customized and extended in powerful ways.
