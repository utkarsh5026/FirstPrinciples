# Python Property Decorators: From First Principles

Let's start by understanding what properties are and why they exist, building from fundamental programming concepts to advanced Python patterns.

## Understanding the Problem: Direct Attribute Access

First, let's understand how Python normally handles attributes and why we might need more control:

```python
# Basic class with direct attribute access
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius  # Direct attribute assignment
        self.fahrenheit = (celsius * 9/5) + 32  # Calculated value

# Using the class
temp = Temperature(25)
print(f"Celsius: {temp.celsius}")      # 25
print(f"Fahrenheit: {temp.fahrenheit}")  # 77.0

# Problem: What happens when we change celsius?
temp.celsius = 30
print(f"Celsius: {temp.celsius}")      # 30
print(f"Fahrenheit: {temp.fahrenheit}")  # Still 77.0! 😱
```

 **The Problem** : When we change `celsius`, `fahrenheit` becomes stale. The calculated value doesn't update automatically.

## Mental Model: Attributes vs Properties

```
Normal Attribute Access:
object.attribute --> Direct memory access
    ↓
Value retrieved/set immediately

Property Access:
object.property --> Method call disguised as attribute access
    ↓
Custom logic executed
    ↓
Value computed/validated/retrieved
```

> **Key Insight** : Properties let us run custom code when accessing attributes, while maintaining the simple `obj.attr` syntax that users expect.

## Solution 1: Using Methods (The Verbose Way)

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius  # Private attribute (by convention)
  
    def get_celsius(self):
        """Getter method"""
        return self._celsius
  
    def set_celsius(self, value):
        """Setter method with validation"""
        if value < -273.15:
            raise ValueError("Temperature cannot be below absolute zero!")
        self._celsius = value
  
    def get_fahrenheit(self):
        """Computed property - always fresh"""
        return (self._celsius * 9/5) + 32

# Usage - verbose but explicit
temp = Temperature(25)
print(temp.get_celsius())      # 25
print(temp.get_fahrenheit())   # 77.0

temp.set_celsius(30)
print(temp.get_celsius())      # 30
print(temp.get_fahrenheit())   # 86.0 - Updated!
```

 **Problems with this approach** :

* Verbose: `temp.get_celsius()` instead of `temp.celsius`
* Breaks the natural attribute access pattern
* Users must remember which are methods vs attributes

## Solution 2: Properties - The Pythonic Way

Properties solve this by making method calls look like attribute access:

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius  # Store the actual value
  
    @property
    def celsius(self):
        """Getter: Called when accessing temp.celsius"""
        print("Getting celsius...")  # Debug output
        return self._celsius
  
    @celsius.setter
    def celsius(self, value):
        """Setter: Called when assigning temp.celsius = value"""
        print(f"Setting celsius to {value}...")  # Debug output
        if value < -273.15:
            raise ValueError("Temperature cannot be below absolute zero!")
        self._celsius = value
  
    @property
    def fahrenheit(self):
        """Computed property - no setter needed"""
        print("Computing fahrenheit...")  # Debug output
        return (self._celsius * 9/5) + 32

# Usage - looks like normal attribute access!
temp = Temperature(25)
print(temp.celsius)      # Getting celsius... → 25
print(temp.fahrenheit)   # Computing fahrenheit... → 77.0

temp.celsius = 30        # Setting celsius to 30...
print(temp.celsius)      # Getting celsius... → 30
print(temp.fahrenheit)   # Computing fahrenheit... → 86.0
```

## How @property Works Under the Hood

Let's understand what the `@property` decorator actually does:

```python
# What @property actually creates
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius
  
    # This is what @property does behind the scenes:
    def _get_celsius(self):
        return self._celsius
  
    def _set_celsius(self, value):
        if value < -273.15:
            raise ValueError("Temperature cannot be below absolute zero!")
        self._celsius = value
  
    # property() function creates a descriptor object
    celsius = property(_get_celsius, _set_celsius)

# The decorator syntax is just syntactic sugar:
# @property
# def celsius(self): ...
# 
# Is equivalent to:
# def celsius(self): ...
# celsius = property(celsius)
```

> **Property Descriptor Pattern** : Properties are implemented using Python's descriptor protocol. When you access `obj.attr`, Python checks if `attr` is a descriptor and calls its `__get__` method instead of returning the value directly.

## Complete Property Pattern: Getter, Setter, and Deleter

```python
class BankAccount:
    def __init__(self, initial_balance=0):
        self._balance = initial_balance
        self._transaction_history = []
  
    @property
    def balance(self):
        """Getter: Return current balance"""
        return self._balance
  
    @balance.setter
    def balance(self, amount):
        """Setter: Update balance with validation"""
        if amount < 0:
            raise ValueError("Balance cannot be negative!")
      
        # Log the transaction
        old_balance = self._balance
        self._balance = amount
        self._transaction_history.append(
            f"Balance changed from ${old_balance:.2f} to ${amount:.2f}"
        )
  
    @balance.deleter
    def balance(self):
        """Deleter: Called when using 'del obj.balance'"""
        print("⚠️  Closing account - balance will be reset to 0")
        self._balance = 0
        self._transaction_history.append("Account closed")
  
    @property
    def transaction_history(self):
        """Read-only property - no setter defined"""
        return self._transaction_history.copy()  # Return copy to prevent modification

# Demonstrating all three operations
account = BankAccount(100)

# Getter
print(f"Current balance: ${account.balance}")  # $100.00

# Setter
account.balance = 150
print(f"New balance: ${account.balance}")      # $150.00

# Deleter
del account.balance
print(f"Final balance: ${account.balance}")    # $0.00

# Read-only property
print("History:", account.transaction_history)
# account.transaction_history = []  # ← This would raise AttributeError!
```

## Advanced Pattern: Lazy Loading with Properties

Properties are excellent for implementing lazy loading - computing expensive values only when needed:

```python
import time
import json

class DataProcessor:
    def __init__(self, filename):
        self.filename = filename
        self._raw_data = None      # Not loaded yet
        self._processed_data = None  # Not computed yet
  
    @property
    def raw_data(self):
        """Lazy loading: Only read file when first accessed"""
        if self._raw_data is None:
            print(f"Loading data from {self.filename}...")
            time.sleep(1)  # Simulate slow file operation
            try:
                with open(self.filename, 'r') as f:
                    self._raw_data = json.load(f)
            except FileNotFoundError:
                # Simulate data for demo
                self._raw_data = [{"id": i, "value": i*2} for i in range(1000)]
        return self._raw_data
  
    @property
    def processed_data(self):
        """Lazy computation: Only process when needed"""
        if self._processed_data is None:
            print("Processing data...")
            time.sleep(0.5)  # Simulate expensive computation
            # Process the raw data (access triggers lazy loading if needed)
            self._processed_data = [
                item["value"] * 2 for item in self.raw_data 
                if item["value"] > 10
            ]
        return self._processed_data
  
    def clear_cache(self):
        """Reset cached values to force recomputation"""
        self._raw_data = None
        self._processed_data = None

# Usage demonstrates lazy loading
processor = DataProcessor("data.json")

print("Creating processor...")          # Instant
print("First access to processed_data:")
result1 = processor.processed_data      # Triggers both loading and processing
print("Second access:")
result2 = processor.processed_data      # Uses cached result - fast!
```

## Property Validation Patterns

Properties are perfect for implementing data validation:

```python
class Person:
    def __init__(self, name, age, email):
        # Use the setters for validation even during initialization
        self.name = name      # Triggers @name.setter
        self.age = age        # Triggers @age.setter  
        self.email = email    # Triggers @email.setter
  
    @property
    def name(self):
        return self._name
  
    @name.setter
    def name(self, value):
        if not isinstance(value, str):
            raise TypeError("Name must be a string")
        if len(value.strip()) == 0:
            raise ValueError("Name cannot be empty")
        self._name = value.strip().title()  # Clean and format
  
    @property
    def age(self):
        return self._age
  
    @age.setter
    def age(self, value):
        if not isinstance(value, int):
            raise TypeError("Age must be an integer")
        if not (0 <= value <= 150):
            raise ValueError("Age must be between 0 and 150")
        self._age = value
  
    @property
    def email(self):
        return self._email
  
    @email.setter
    def email(self, value):
        if "@" not in value or "." not in value.split("@")[-1]:
            raise ValueError("Invalid email format")
        self._email = value.lower()  # Normalize to lowercase
  
    @property
    def display_info(self):
        """Computed property combining other attributes"""
        return f"{self.name} ({self.age}) - {self.email}"

# Validation happens automatically
try:
    person = Person("  john doe  ", 25, "John.Doe@Example.COM")
    print(person.display_info)  # "John Doe (25) - john.doe@example.com"
  
    person.age = 200  # Raises ValueError!
except ValueError as e:
    print(f"Validation error: {e}")
```

## Common Patterns and Gotchas

### 1. Read-Only Properties

```python
class Circle:
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
  
    @property
    def area(self):
        """Read-only property - no setter"""
        return 3.14159 * self._radius ** 2
  
    @property
    def diameter(self):
        """Another read-only property"""
        return self._radius * 2

circle = Circle(5)
print(circle.area)        # 78.54 - OK
# circle.area = 100       # AttributeError: can't set attribute
```

### 2. Property Inheritance

```python
class Vehicle:
    def __init__(self, max_speed):
        self._max_speed = max_speed
        self._current_speed = 0
  
    @property
    def speed(self):
        return self._current_speed
  
    @speed.setter  
    def speed(self, value):
        if value < 0:
            raise ValueError("Speed cannot be negative")
        if value > self._max_speed:
            raise ValueError(f"Speed cannot exceed {self._max_speed}")
        self._current_speed = value

class Car(Vehicle):
    @property
    def speed(self):
        """Override getter - add logging"""
        print(f"Current car speed: {self._current_speed} mph")
        return self._current_speed
  
    @speed.setter
    def speed(self, value):
        """Override setter - add additional validation"""
        if value > 200:  # Cars have stricter speed limits
            raise ValueError("Car speed cannot exceed 200 mph")
        # Call parent setter for basic validation
        super(Car, self.__class__).speed.__set__(self, value)

car = Car(180)
car.speed = 60    # Uses overridden setter with extra validation
print(car.speed)  # Uses overridden getter with logging
```

### 3. Common Gotcha: Property Assignment in **init**

```python
# ❌ WRONG: This bypasses the setter
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius  # Direct assignment - no validation!
  
    @property
    def celsius(self):
        return self._celsius
  
    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Too cold!")
        self._celsius = value

# ✅ CORRECT: Use the property even in __init__
class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius  # Uses the setter - validation included!
  
    @property
    def celsius(self):
        return self._celsius
  
    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError("Too cold!")
        self._celsius = value

# The difference:
temp1 = Temperature(-300)  # Wrong version: no error
temp2 = Temperature(-300)  # Correct version: ValueError!
```

> **Best Practice** : Always use the property name (not the private attribute) in `__init__` to ensure validation runs during object creation.

## When to Use Properties vs Methods

```python
# Use Properties for:
class DataContainer:
    @property
    def computed_value(self):
        """Feels like an attribute, cheap to compute"""
        return self._x * 2
  
    @property
    def status(self):
        """Represents current state"""
        return "active" if self._is_running else "inactive"

# Use Methods for:
class DataProcessor:
    def process_data(self):
        """Action/operation - use a verb"""
        return self._perform_expensive_computation()
  
    def save_to_file(self, filename):
        """Action with side effects"""
        with open(filename, 'w') as f:
            f.write(self._data)
```

> **Design Principle** : Properties should feel like attributes (nouns representing state), while methods should feel like actions (verbs performing operations).

## Memory Visualization

```
Object in Memory:
┌─────────────────┐
│ Temperature     │
│ ┌─────────────┐ │
│ │ _celsius: 25│ │  ← Actual data storage
│ └─────────────┘ │
│                 │
│ Properties:     │
│ ┌─────────────┐ │
│ │ celsius     │ │  ← Property descriptor
│ │ (get/set)   │ │     (points to methods)
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │ fahrenheit  │ │  ← Read-only property
│ │ (get only)  │ │     (computed on access)
│ └─────────────┘ │
└─────────────────┘

Access Flow:
temp.celsius → property.__get__() → getter method → return self._celsius
temp.celsius = 30 → property.__set__() → setter method → validation → self._celsius = 30
```

Properties provide a powerful way to control attribute access while maintaining Python's simple, readable syntax. They're essential for creating robust, maintainable classes that can evolve over time without breaking existing code.
