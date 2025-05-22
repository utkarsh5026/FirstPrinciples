# Property Decorators and Descriptors in Python: A Journey from First Principles

Let's embark on a journey to understand two of Python's most elegant yet powerful features. Imagine you're building a house - you need ways to control how people access different rooms and what they can do in those rooms. Property decorators and descriptors serve a similar purpose in Python classes.

## Understanding the Foundation: What Are We Trying to Solve?

Before diving into property decorators and descriptors, let's understand the fundamental problem they solve. In object-oriented programming, we often want to control how attributes are accessed, modified, or computed. This concept is called  **encapsulation** .

> **Core Principle** : Encapsulation allows us to hide the internal implementation details of a class while providing a clean, controlled interface for interacting with the object's data.

Consider this simple example of what happens without proper encapsulation:

```python
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

# Creating and using the class
temp = Temperature(25)
print(temp.celsius)  # 25

# But what if someone does this?
temp.celsius = -500  # This is physically impossible!
print(temp.celsius)  # -500 (invalid temperature)
```

Here we see the problem: anyone can set any value to `celsius`, even impossible ones. We need a way to add validation and control.

## Property Decorators: The Elegant Solution

Property decorators provide a Pythonic way to create managed attributes. Think of them as intelligent gatekeepers for your class attributes.

### The `@property` Decorator: Creating Computed Attributes

The `@property` decorator transforms a method into an attribute that can be accessed like a normal variable but is actually computed each time.

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius  # Private attribute (by convention)
  
    @property
    def radius(self):
        """Getter method for radius"""
        return self._radius
  
    @property
    def area(self):
        """Computed property for area"""
        return 3.14159 * self._radius ** 2
  
    @property
    def diameter(self):
        """Computed property for diameter"""
        return 2 * self._radius

# Usage example
circle = Circle(5)
print(circle.radius)    # 5 (accessing like an attribute)
print(circle.area)      # 78.53975 (computed each time)
print(circle.diameter)  # 10 (computed each time)
```

**What's happening here?**

* We use `_radius` (with underscore) to indicate it's a private attribute
* The `@property` decorator makes methods accessible like attributes
* `area` and `diameter` are computed properties - they calculate values based on the current radius

> **Key Insight** : Properties allow you to start with simple attributes and later add computation or validation without changing how users interact with your class.

### Adding Validation with Setters

Properties become truly powerful when combined with setters for validation:

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius
  
    @property
    def celsius(self):
        """Get temperature in Celsius"""
        return self._celsius
  
    @celsius.setter
    def celsius(self, value):
        """Set temperature with validation"""
        if value < -273.15:
            raise ValueError("Temperature cannot be below absolute zero!")
        self._celsius = value
  
    @property
    def fahrenheit(self):
        """Get temperature in Fahrenheit"""
        return (self._celsius * 9/5) + 32
  
    @fahrenheit.setter
    def fahrenheit(self, value):
        """Set temperature via Fahrenheit"""
        if value < -459.67:  # Absolute zero in Fahrenheit
            raise ValueError("Temperature cannot be below absolute zero!")
        self._celsius = (value - 32) * 5/9

# Usage with validation
temp = Temperature(25)
print(temp.celsius)     # 25
print(temp.fahrenheit)  # 77.0

temp.celsius = 30       # Works fine
print(temp.fahrenheit)  # 86.0

temp.fahrenheit = 100   # Sets celsius internally
print(temp.celsius)     # 37.77777777777778

# This will raise an error:
# temp.celsius = -300   # ValueError: Temperature cannot be below absolute zero!
```

**Breaking down the setter pattern:**

1. `@property` creates the getter method
2. `@celsius.setter` creates the setter method for the same property
3. The setter receives the new value and can validate it before storing
4. Both properties maintain consistency with each other

### The Complete Property Pattern: Getter, Setter, and Deleter

```python
class BankAccount:
    def __init__(self, initial_balance=0):
        self._balance = initial_balance
        self._transaction_history = []
  
    @property
    def balance(self):
        """Get current balance"""
        return self._balance
  
    @balance.setter
    def balance(self, amount):
        """Set balance with logging"""
        if amount < 0:
            raise ValueError("Balance cannot be negative")
      
        old_balance = self._balance
        self._balance = amount
        self._transaction_history.append(
            f"Balance changed from {old_balance} to {amount}"
        )
  
    @balance.deleter
    def balance(self):
        """Delete balance (close account)"""
        self._transaction_history.append("Account closed")
        self._balance = 0
  
    @property
    def history(self):
        """Get transaction history"""
        return self._transaction_history.copy()

# Usage example
account = BankAccount(100)
print(account.balance)    # 100

account.balance = 150     # Triggers setter
print(account.history)    # ['Balance changed from 100 to 150']

del account.balance       # Triggers deleter
print(account.balance)    # 0
print(account.history)    # ['Balance changed from 100 to 150', 'Account closed']
```

## Descriptors: The Powerful Foundation

Now that we understand property decorators, let's explore descriptors - the underlying mechanism that makes properties possible. Descriptors are the foundation of Python's attribute access system.

> **Fundamental Concept** : A descriptor is any object that implements one or more of the descriptor protocol methods: `__get__`, `__set__`, or `__delete__`.

### Understanding the Descriptor Protocol

```python
class LoggedAttribute:
    def __init__(self, name):
        self.name = name
        self.value = None
  
    def __get__(self, obj, objtype=None):
        """Called when the attribute is accessed"""
        if obj is None:
            return self
        print(f"Getting {self.name}: {self.value}")
        return self.value
  
    def __set__(self, obj, value):
        """Called when the attribute is assigned"""
        print(f"Setting {self.name} to: {value}")
        self.value = value
  
    def __delete__(self, obj):
        """Called when the attribute is deleted"""
        print(f"Deleting {self.name}")
        self.value = None

class MyClass:
    # Creating a descriptor instance as a class attribute
    x = LoggedAttribute("x")
    y = LoggedAttribute("y")

# Usage example
obj = MyClass()
obj.x = 10        # Setting x to: 10
print(obj.x)      # Getting x: 10
                  # 10

obj.y = 20        # Setting y to: 20
print(obj.y)      # Getting y: 20
                  # 20

del obj.x         # Deleting x
```

**How descriptors work:**

1. When you access `obj.x`, Python calls `LoggedAttribute.__get__(descriptor_instance, obj, type(obj))`
2. When you assign `obj.x = value`, Python calls `LoggedAttribute.__set__(descriptor_instance, obj, value)`
3. When you delete `obj.x`, Python calls `LoggedAttribute.__delete__(descriptor_instance, obj)`

### A Practical Descriptor: Type Validation

Let's create a descriptor that validates types:

```python
class TypedAttribute:
    def __init__(self, expected_type, name=None):
        self.expected_type = expected_type
        self.name = name
  
    def __set_name__(self, owner, name):
        """Called when the descriptor is assigned to a class attribute"""
        self.name = name
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        # Use the object's __dict__ to store the actual value
        return obj.__dict__.get(self.name)
  
    def __set__(self, obj, value):
        if not isinstance(value, self.expected_type):
            raise TypeError(
                f"{self.name} must be of type {self.expected_type.__name__}, "
                f"got {type(value).__name__}"
            )
        obj.__dict__[self.name] = value

class Person:
    name = TypedAttribute(str)
    age = TypedAttribute(int)
    height = TypedAttribute(float)
  
    def __init__(self, name, age, height):
        self.name = name
        self.age = age
        self.height = height

# Usage with type checking
person = Person("Alice", 30, 5.6)
print(person.name)    # Alice
print(person.age)     # 30

# These will raise TypeErrors:
# person.age = "thirty"     # TypeError: age must be of type int, got str
# person.height = "tall"    # TypeError: height must be of type float, got str
```

**Key concepts in this descriptor:**

* `__set_name__` is called when the descriptor is assigned to a class attribute
* We store actual values in the object's `__dict__` to avoid sharing between instances
* Type validation happens automatically on every assignment

### Advanced Descriptor: Range Validation

```python
class RangeValidator:
    def __init__(self, min_value=None, max_value=None):
        self.min_value = min_value
        self.max_value = max_value
        self.name = None
  
    def __set_name__(self, owner, name):
        self.name = name
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
  
    def __set__(self, obj, value):
        # Type checking
        if not isinstance(value, (int, float)):
            raise TypeError(f"{self.name} must be a number")
      
        # Range checking
        if self.min_value is not None and value < self.min_value:
            raise ValueError(f"{self.name} must be >= {self.min_value}")
      
        if self.max_value is not None and value > self.max_value:
            raise ValueError(f"{self.name} must be <= {self.max_value}")
      
        obj.__dict__[self.name] = value

class GameCharacter:
    health = RangeValidator(min_value=0, max_value=100)
    level = RangeValidator(min_value=1, max_value=50)
    experience = RangeValidator(min_value=0)
  
    def __init__(self, health=100, level=1, experience=0):
        self.health = health
        self.level = level
        self.experience = experience

# Usage with validation
character = GameCharacter()
character.health = 75     # Works fine
character.level = 10      # Works fine
character.experience = 1500  # Works fine

# These will raise errors:
# character.health = 150    # ValueError: health must be <= 100
# character.level = 0       # ValueError: level must be >= 1
# character.health = -10    # ValueError: health must be >= 0
```

## The Relationship: Properties vs Descriptors

Now let's understand how properties and descriptors relate to each other:

> **Revelation** : Property decorators are actually implemented using descriptors! When you use `@property`, Python creates a descriptor object behind the scenes.

```python
# These two approaches are equivalent:

# Approach 1: Using @property decorator
class Circle1:
    def __init__(self, radius):
        self._radius = radius
  
    @property
    def radius(self):
        return self._radius
  
    @radius.setter
    def radius(self, value):
        if value <= 0:
            raise ValueError("Radius must be positive")
        self._radius = value

# Approach 2: Using property() function directly
class Circle2:
    def __init__(self, radius):
        self._radius = radius
  
    def get_radius(self):
        return self._radius
  
    def set_radius(self, value):
        if value <= 0:
            raise ValueError("Radius must be positive")
        self._radius = value
  
    # Creating the property descriptor manually
    radius = property(get_radius, set_radius)

# Both work identically
c1 = Circle1(5)
c2 = Circle2(5)

print(c1.radius)  # 5
print(c2.radius)  # 5

c1.radius = 10    # Works
c2.radius = 10    # Works
```

## When to Use Each Approach

### Use Property Decorators When:

* You need simple computed attributes
* You want to add validation to existing attributes
* You're working with a single class and don't need reusability
* You want the most readable and Pythonic syntax

```python
class Rectangle:
    def __init__(self, width, height):
        self._width = width
        self._height = height
  
    @property
    def area(self):
        return self._width * self._height
  
    @property
    def width(self):
        return self._width
  
    @width.setter
    def width(self, value):
        if value <= 0:
            raise ValueError("Width must be positive")
        self._width = value
```

### Use Descriptors When:

* You need reusable validation logic across multiple classes
* You want to create custom attribute behavior
* You need complex attribute management
* You're building frameworks or libraries

```python
class PositiveNumber:
    def __init__(self, name=None):
        self.name = name
  
    def __set_name__(self, owner, name):
        self.name = name
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
  
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} must be positive")
        obj.__dict__[self.name] = value

# Now reusable across multiple classes
class Rectangle:
    width = PositiveNumber()
    height = PositiveNumber()
  
    def __init__(self, width, height):
        self.width = width
        self.height = height

class Circle:
    radius = PositiveNumber()
  
    def __init__(self, radius):
        self.radius = radius
```

## Advanced Patterns and Best Practices

### Combining Properties and Descriptors

You can use both in the same class for different purposes:

```python
class SmartAttribute:
    def __init__(self, default_value=None):
        self.default_value = default_value
        self.name = None
  
    def __set_name__(self, owner, name):
        self.name = name
  
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name, self.default_value)
  
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class Product:
    name = SmartAttribute("Unknown Product")
    price = SmartAttribute(0.0)
  
    def __init__(self, name=None, price=None):
        if name is not None:
            self.name = name
        if price is not None:
            self.price = price
  
    @property
    def display_price(self):
        """Computed property using descriptor data"""
        return f"${self.price:.2f}"
  
    @property
    def is_expensive(self):
        """Computed property with business logic"""
        return self.price > 100

# Usage
product = Product("Laptop", 1299.99)
print(product.name)           # Laptop
print(product.display_price)  # $1299.99
print(product.is_expensive)   # True
```

### Memory Considerations and Data Descriptors

Understanding the difference between data and non-data descriptors:

```python
class DataDescriptor:
    """Has both __get__ and __set__ - higher priority"""
    def __get__(self, obj, objtype=None):
        print("DataDescriptor.__get__ called")
        return "data descriptor value"
  
    def __set__(self, obj, value):
        print("DataDescriptor.__set__ called")

class NonDataDescriptor:
    """Has only __get__ - lower priority"""
    def __get__(self, obj, objtype=None):
        print("NonDataDescriptor.__get__ called")
        return "non-data descriptor value"

class Example:
    data_attr = DataDescriptor()
    non_data_attr = NonDataDescriptor()

obj = Example()

# Data descriptor always wins
print(obj.data_attr)        # DataDescriptor.__get__ called
obj.__dict__['data_attr'] = "instance value"
print(obj.data_attr)        # Still calls DataDescriptor.__get__

# Non-data descriptor can be overridden
print(obj.non_data_attr)    # NonDataDescriptor.__get__ called
obj.__dict__['non_data_attr'] = "instance value"
print(obj.non_data_attr)    # "instance value" (instance wins)
```

> **Important Rule** : Data descriptors (with `__set__`) always take precedence over instance attributes, while non-data descriptors (only `__get__`) can be overridden by instance attributes.

Property decorators and descriptors represent Python's elegant approach to controlled attribute access. Properties give you a simple, decorator-based syntax for common cases, while descriptors provide the full power and reusability for complex scenarios. Together, they enable you to create clean, maintainable, and robust object-oriented designs that properly encapsulate data while maintaining Python's philosophy of readable, expressive code.

The key is choosing the right tool for your specific needs: start with properties for simplicity, and move to descriptors when you need reusability and advanced control.
