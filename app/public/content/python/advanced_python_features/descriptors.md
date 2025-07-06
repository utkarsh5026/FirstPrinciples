# Python Descriptors: From First Principles

Let's build up to descriptors by first understanding how Python handles attribute access, then see why descriptors were needed, and finally master their implementation.

## Foundation: How Python Accesses Attributes

Before diving into descriptors, we need to understand Python's attribute lookup mechanism:

```python
class Person:
    def __init__(self, name):
        self.name = name
  
    def greet(self):
        return f"Hello, I'm {self.name}"

# When we do this:
person = Person("Alice")
print(person.name)      # "Alice"
print(person.greet())   # "Hello, I'm Alice"

# Python follows a specific lookup order for attributes
```

```
Attribute Lookup Order (person.name):
│
├─ 1. person.__dict__['name']  ← Instance attributes
├─ 2. type(person).__dict__['name']  ← Class attributes  
├─ 3. Parent classes (MRO)
└─ 4. __getattr__ if defined
```

> **Key Mental Model** : Every dot notation (`obj.attr`) triggers Python's attribute lookup protocol. Understanding this lookup is crucial for descriptors.

## The Problem That Led to Descriptors

Let's say we want to add validation to our `Person` class:

```python
# Non-Pythonic approach: Using getters and setters
class Person:
    def __init__(self, name):
        self._name = name
  
    def get_name(self):
        return self._name
  
    def set_name(self, value):
        if not isinstance(value, str):
            raise TypeError("Name must be a string")
        if len(value) < 1:
            raise ValueError("Name cannot be empty")
        self._name = value

# Clunky usage:
person = Person("Alice")
print(person.get_name())  # Have to remember method names
person.set_name("Bob")    # Not natural attribute access
```

Python's solution was the `property` decorator:

```python
# Better: Using property decorator
class Person:
    def __init__(self, name):
        self._name = name
  
    @property
    def name(self):
        """Getter method"""
        return self._name
  
    @name.setter
    def name(self, value):
        """Setter method with validation"""
        if not isinstance(value, str):
            raise TypeError("Name must be a string")
        if len(value) < 1:
            raise ValueError("Name cannot be empty")
        self._name = value

# Natural usage:
person = Person("Alice")
print(person.name)        # Calls the getter
person.name = "Bob"       # Calls the setter with validation
```

But what if we need this validation pattern across multiple classes and attributes? This is where descriptors shine.

## Understanding the Descriptor Protocol

> **Python Philosophy** : Descriptors are the mechanism behind properties, methods, static methods, class methods, and more. They're Python's way of customizing attribute access.

A descriptor is any object that defines one or more of these special methods:

```python
class Descriptor:
    def __get__(self, instance, owner):
        """Called when the attribute is accessed"""
        pass
  
    def __set__(self, instance, value):
        """Called when the attribute is assigned"""
        pass
  
    def __delete__(self, instance):
        """Called when the attribute is deleted"""
        pass
```

```
Descriptor Types:
│
├─ Data Descriptor: Defines __get__ AND (__set__ OR __delete__)
│   └─ Higher priority in attribute lookup
│
└─ Non-Data Descriptor: Defines only __get__
    └─ Lower priority in attribute lookup
```

## Building Your First Descriptor

Let's create a descriptor that validates string attributes:

```python
class ValidatedString:
    """A descriptor that validates string attributes"""
  
    def __init__(self, min_length=0, max_length=None):
        self.min_length = min_length
        self.max_length = max_length
  
    def __set_name__(self, owner, name):
        """Called when descriptor is assigned to a class attribute"""
        self.name = name
        self.private_name = f'_{name}'
  
    def __get__(self, instance, owner):
        """Called when attribute is accessed"""
        # If called on class, return the descriptor itself
        if instance is None:
            return self
      
        # Return the stored value from instance
        return getattr(instance, self.private_name, None)
  
    def __set__(self, instance, value):
        """Called when attribute is assigned"""
        # Validation logic
        if not isinstance(value, str):
            raise TypeError(f"{self.name} must be a string")
      
        if len(value) < self.min_length:
            raise ValueError(f"{self.name} must be at least {self.min_length} characters")
      
        if self.max_length and len(value) > self.max_length:
            raise ValueError(f"{self.name} cannot exceed {self.max_length} characters")
      
        # Store the validated value
        setattr(instance, self.private_name, value)
  
    def __delete__(self, instance):
        """Called when attribute is deleted"""
        delattr(instance, self.private_name)

# Using our descriptor:
class Person:
    # Descriptor instances as class attributes
    name = ValidatedString(min_length=1, max_length=50)
    email = ValidatedString(min_length=5, max_length=100)
  
    def __init__(self, name, email):
        self.name = name    # Triggers ValidatedString.__set__
        self.email = email  # Triggers ValidatedString.__set__

# Testing the descriptor:
person = Person("Alice", "alice@example.com")
print(person.name)   # Triggers ValidatedString.__get__ → "Alice"

person.name = "Bob"  # Triggers ValidatedString.__set__ with validation
print(person.name)   # "Bob"

# Validation in action:
try:
    person.name = ""  # Triggers validation error
except ValueError as e:
    print(f"Error: {e}")  # Error: name must be at least 1 characters
```

## How Descriptor Lookup Works

```
Descriptor Lookup Priority (obj.attr):
│
├─ 1. Data descriptor from type(obj).__dict__
├─ 2. Instance attribute from obj.__dict__
├─ 3. Non-data descriptor from type(obj).__dict__
├─ 4. Class attribute from type(obj).__dict__
├─ 5. Parent class descriptors/attributes (MRO)
└─ 6. __getattr__ if defined
```

Let's see this in action:

```python
class Demo:
    def __get__(self, instance, owner):
        print(f"Descriptor __get__ called")
        return "from descriptor"

class TestClass:
    attr = Demo()  # Non-data descriptor (only __get__)
  
    def __init__(self):
        self.attr = "from instance"  # Instance attribute

obj = TestClass()
print(obj.attr)  # "from instance" - instance wins over non-data descriptor

# But if we make it a data descriptor:
class DataDemo:
    def __get__(self, instance, owner):
        return "from data descriptor"
  
    def __set__(self, instance, value):
        print(f"Descriptor __set__ called with {value}")

class TestClass2:
    attr = DataDemo()  # Data descriptor
  
    def __init__(self):
        self.attr = "attempt to set"  # This calls DataDemo.__set__

obj2 = TestClass2()
print(obj2.attr)  # "from data descriptor" - data descriptor wins
```

## Understanding Property Implementation

The `property` decorator is actually implemented using descriptors! Here's a simplified version:

```python
class Property:
    """Simplified property implementation using descriptors"""
  
    def __init__(self, fget=None, fset=None, fdel=None, doc=None):
        self.fget = fget
        self.fset = fset
        self.fdel = fdel
        self.__doc__ = doc
  
    def __get__(self, instance, owner):
        if instance is None:
            return self
        if self.fget is None:
            raise AttributeError("unreadable attribute")
        return self.fget(instance)
  
    def __set__(self, instance, value):
        if self.fset is None:
            raise AttributeError("can't set attribute")
        self.fset(instance, value)
  
    def __delete__(self, instance):
        if self.fdel is None:
            raise AttributeError("can't delete attribute")
        self.fdel(instance)
  
    def setter(self, fset):
        """Create a new property with updated setter"""
        return Property(self.fget, fset, self.fdel, self.__doc__)
  
    def deleter(self, fdel):
        """Create a new property with updated deleter"""
        return Property(self.fget, self.fset, fdel, self.__doc__)

# Using our property implementation:
class Circle:
    def __init__(self, radius):
        self._radius = radius
  
    def _get_radius(self):
        return self._radius
  
    def _set_radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value
  
    # Using our Property descriptor
    radius = Property(_get_radius, _set_radius)

circle = Circle(5)
print(circle.radius)  # 5
circle.radius = 10    # Sets with validation
```

## Advanced Descriptor Patterns

### 1. Lazy Properties (Computed Once)

```python
class LazyProperty:
    """Property that computes value once and caches it"""
  
    def __init__(self, func):
        self.func = func
        self.name = func.__name__
  
    def __get__(self, instance, owner):
        if instance is None:
            return self
      
        # Check if value is already cached
        cache_name = f'_cached_{self.name}'
        if hasattr(instance, cache_name):
            return getattr(instance, cache_name)
      
        # Compute and cache the value
        value = self.func(instance)
        setattr(instance, cache_name, value)
        return value

class DataProcessor:
    def __init__(self, data):
        self.data = data
  
    @LazyProperty
    def expensive_calculation(self):
        """This will only be computed once"""
        print("Computing expensive calculation...")
        return sum(x ** 2 for x in self.data)

processor = DataProcessor([1, 2, 3, 4, 5])
print(processor.expensive_calculation)  # Computes: 55
print(processor.expensive_calculation)  # Cached: 55 (no computation)
```

### 2. Type-Validated Descriptor

```python
class TypedAttribute:
    """Descriptor that enforces type checking"""
  
    def __init__(self, expected_type, default=None):
        self.expected_type = expected_type
        self.default = default
  
    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_{name}'
  
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return getattr(instance, self.private_name, self.default)
  
    def __set__(self, instance, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.name} must be of type {self.expected_type.__name__}, "
                f"got {type(value).__name__}"
            )
        setattr(instance, self.private_name, value)

class BankAccount:
    balance = TypedAttribute(float, 0.0)
    account_number = TypedAttribute(str)
    is_active = TypedAttribute(bool, True)
  
    def __init__(self, account_number, initial_balance=0.0):
        self.account_number = account_number
        self.balance = initial_balance

account = BankAccount("12345", 100.0)
print(f"Balance: {account.balance}")  # 100.0

# Type validation:
try:
    account.balance = "invalid"
except TypeError as e:
    print(f"Error: {e}")  # Error: balance must be of type float, got str
```

## Memory and Reference Behavior

> **Important Gotcha** : Descriptors are shared among all instances of a class. Be careful about storing instance-specific data.

```python
# WRONG: Storing instance data in descriptor
class BadDescriptor:
    def __init__(self):
        self.value = None  # Shared among ALL instances!
  
    def __get__(self, instance, owner):
        return self.value
  
    def __set__(self, instance, value):
        self.value = value  # All instances share this!

# RIGHT: Storing instance data in the instance
class GoodDescriptor:
    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_{name}'
  
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return getattr(instance, self.private_name, None)
  
    def __set__(self, instance, value):
        setattr(instance, self.private_name, value)
```

```
Memory Layout for Descriptors:
│
Class Object
├─ descriptor_instance (shared)
│   ├─ __get__ method
│   ├─ __set__ method
│   └─ validation logic
│
Instance 1
├─ _private_attr_1 (unique data)
└─ _private_attr_2 (unique data)
│
Instance 2
├─ _private_attr_1 (unique data)
└─ _private_attr_2 (unique data)
```

## Real-World Applications

### 1. Database Field Validation

```python
class DatabaseField:
    """Descriptor for database field validation"""
  
    def __init__(self, field_type, required=True, max_length=None):
        self.field_type = field_type
        self.required = required
        self.max_length = max_length
  
    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_{name}'
  
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return getattr(instance, self.private_name, None)
  
    def __set__(self, instance, value):
        # Required field validation
        if self.required and value is None:
            raise ValueError(f"{self.name} is required")
      
        if value is not None:
            # Type validation
            if not isinstance(value, self.field_type):
                raise TypeError(f"{self.name} must be {self.field_type.__name__}")
          
            # Length validation for strings
            if self.field_type == str and self.max_length:
                if len(value) > self.max_length:
                    raise ValueError(f"{self.name} exceeds maximum length")
      
        setattr(instance, self.private_name, value)

class User:
    username = DatabaseField(str, required=True, max_length=50)
    email = DatabaseField(str, required=True, max_length=100)
    age = DatabaseField(int, required=False)
  
    def __init__(self, username, email, age=None):
        self.username = username
        self.email = email
        self.age = age

user = User("john_doe", "john@example.com", 25)
```

### 2. Unit Conversion Descriptor

```python
class Temperature:
    """Descriptor for temperature with automatic unit conversion"""
  
    def __init__(self, unit='celsius'):
        self.unit = unit.lower()
  
    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_{name}_celsius'  # Store internally as Celsius
  
    def __get__(self, instance, owner):
        if instance is None:
            return self
      
        celsius = getattr(instance, self.private_name, 0)
      
        if self.unit == 'celsius':
            return celsius
        elif self.unit == 'fahrenheit':
            return celsius * 9/5 + 32
        elif self.unit == 'kelvin':
            return celsius + 273.15
  
    def __set__(self, instance, value):
        # Convert to Celsius for storage
        if self.unit == 'celsius':
            celsius = value
        elif self.unit == 'fahrenheit':
            celsius = (value - 32) * 5/9
        elif self.unit == 'kelvin':
            celsius = value - 273.15
        else:
            raise ValueError(f"Unknown unit: {self.unit}")
      
        setattr(instance, self.private_name, celsius)

class WeatherStation:
    temp_celsius = Temperature('celsius')
    temp_fahrenheit = Temperature('fahrenheit')
    temp_kelvin = Temperature('kelvin')

station = WeatherStation()
station.temp_celsius = 25      # Set in Celsius
print(station.temp_fahrenheit) # Get in Fahrenheit: 77.0
print(station.temp_kelvin)     # Get in Kelvin: 298.15
```

## Common Patterns and Best Practices

> **Best Practice** : Use `__set_name__` (Python 3.6+) to automatically get the attribute name instead of manually passing it.

> **Performance Note** : Descriptors add a small overhead to attribute access. Use them when you need the functionality, not for simple attributes.

> **Debugging Tip** : Remember that descriptors are only triggered on class attributes, not instance attributes with the same name (unless it's a data descriptor).

### When to Use Descriptors vs Properties

```python
# Use property for single-attribute validation:
class Person:
    @property
    def age(self):
        return self._age
  
    @age.setter
    def age(self, value):
        if value < 0:
            raise ValueError("Age cannot be negative")
        self._age = value

# Use descriptors for reusable validation patterns:
class PositiveNumber:
    def __set_name__(self, owner, name):
        self.name = name
        self.private_name = f'_{name}'
  
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return getattr(instance, self.private_name, 0)
  
    def __set__(self, instance, value):
        if value < 0:
            raise ValueError(f"{self.name} must be positive")
        setattr(instance, self.private_name, value)

class Rectangle:
    width = PositiveNumber()    # Reusable validation
    height = PositiveNumber()   # Same validation logic
  
    def __init__(self, width, height):
        self.width = width
        self.height = height
```

Descriptors are Python's most powerful feature for customizing attribute access. They're the foundation for properties, methods, and many advanced Python features. While they might seem complex at first, understanding descriptors gives you deep insight into how Python's object model works and enables you to write more elegant, reusable code.
