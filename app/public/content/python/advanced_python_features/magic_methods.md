# Magic Methods (Dunder Methods): Python's Secret Sauce for Elegant Object Behavior

## What Are Magic Methods and Why Do They Exist?

Magic methods (also called "dunder methods" for their double underscores) are Python's way of letting you define how your objects behave with built-in operations. They're the bridge between your custom classes and Python's fundamental operations.

> **Core Philosophy** : Magic methods embody Python's principle that "there should be one obvious way to do it." Instead of having separate methods like `obj.add(other)` and `obj.equals(other)`, Python uses magic methods so you can write `obj + other` and `obj == other` naturally.

Let's start with the fundamental concept:

```python
# Without magic methods - awkward and non-Pythonic
class BadVector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
  
    def add_vector(self, other):
        return BadVector(self.x + other.x, self.y + other.y)
  
    def display(self):
        return f"({self.x}, {self.y})"

# Usage feels unnatural
v1 = BadVector(1, 2)
v2 = BadVector(3, 4)
result = v1.add_vector(v2)  # Clunky!
print(result.display())     # More clunkiness!
```

```python
# With magic methods - natural and Pythonic
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
  
    def __add__(self, other):       # Magic method for +
        return Vector(self.x + other.x, self.y + other.y)
  
    def __str__(self):              # Magic method for str()
        return f"({self.x}, {self.y})"

# Usage feels natural - just like built-in types!
v1 = Vector(1, 2)
v2 = Vector(3, 4)
result = v1 + v2      # Natural and intuitive!
print(result)         # Clean and simple!
# Output: (4, 6)
```

## How Python's Object Model Uses Magic Methods

Understanding how Python calls magic methods is crucial. Here's the flow:

```
Operation Requested
        ↓
Python checks for magic method
        ↓
Calls the magic method
        ↓
Returns result
```

```python
# When you write: obj + other
# Python actually does: obj.__add__(other)

class DebugVector:
    def __init__(self, x, y):
        self.x = x
        self.y = y
  
    def __add__(self, other):
        print(f"__add__ called: {self} + {other}")
        return DebugVector(self.x + other.x, self.y + other.y)
  
    def __str__(self):
        return f"Vector({self.x}, {self.y})"

v1 = DebugVector(1, 2)
v2 = DebugVector(3, 4)

# These are equivalent:
result1 = v1 + v2              # Pythonic way
result2 = v1.__add__(v2)       # What Python actually calls

# Both output: __add__ called: Vector(1, 2) + Vector(3, 4)
```

> **Key Insight** : Magic methods are Python's protocol for making your objects behave like built-in types. They're not called directly in normal code - Python calls them automatically when you use operators, built-in functions, or other language constructs.

## Categories of Magic Methods

### 1. Object Creation and Representation

These control how objects are created and displayed:

```python
class Person:
    def __init__(self, name, age):
        """Constructor - called when creating object"""
        print(f"Creating Person: {name}")
        self.name = name
        self.age = age
  
    def __str__(self):
        """Human-readable string - called by str() and print()"""
        return f"{self.name} (age {self.age})"
  
    def __repr__(self):
        """Developer representation - called by repr() and in REPL"""
        return f"Person('{self.name}', {self.age})"
  
    def __del__(self):
        """Destructor - called when object is garbage collected"""
        print(f"Goodbye {self.name}")

# Let's see them in action:
person = Person("Alice", 30)  # Calls __init__
# Output: Creating Person: Alice

print(person)                 # Calls __str__
# Output: Alice (age 30)

repr(person)                  # Calls __repr__
# Output: Person('Alice', 30)

# When person goes out of scope, __del__ is called
```

> **Best Practice** : Always implement `__repr__` for debugging. Implement `__str__` for user-facing output. A good `__repr__` should be unambiguous and ideally allow you to recreate the object.

### 2. Arithmetic Operators

These make your objects work with mathematical operations:

```python
class Money:
    def __init__(self, amount, currency="USD"):
        self.amount = amount
        self.currency = currency
  
    def __add__(self, other):
        """Addition: money1 + money2"""
        if isinstance(other, Money):
            if self.currency != other.currency:
                raise ValueError("Cannot add different currencies")
            return Money(self.amount + other.amount, self.currency)
        # Handle adding numbers
        return Money(self.amount + other, self.currency)
  
    def __sub__(self, other):
        """Subtraction: money1 - money2"""
        if isinstance(other, Money):
            if self.currency != other.currency:
                raise ValueError("Cannot subtract different currencies")
            return Money(self.amount - other.amount, self.currency)
        return Money(self.amount - other, self.currency)
  
    def __mul__(self, other):
        """Multiplication: money * number"""
        if isinstance(other, (int, float)):
            return Money(self.amount * other, self.currency)
        raise TypeError("Can only multiply money by numbers")
  
    def __truediv__(self, other):
        """Division: money / number"""
        if isinstance(other, (int, float)):
            return Money(self.amount / other, self.currency)
        raise TypeError("Can only divide money by numbers")
  
    def __str__(self):
        return f"${self.amount:.2f} {self.currency}"

# Natural usage:
price = Money(100, "USD")
tax = Money(8.50, "USD")
total = price + tax           # Calls __add__
print(total)                  # Output: $108.50 USD

discounted = total * 0.9      # Calls __mul__
print(discounted)             # Output: $97.65 USD

per_person = total / 4        # Calls __truediv__
print(per_person)             # Output: $27.13 USD
```

### 3. Comparison Operators

These enable sorting and comparison:

```python
class Student:
    def __init__(self, name, grade):
        self.name = name
        self.grade = grade
  
    def __eq__(self, other):
        """Equality: student1 == student2"""
        if not isinstance(other, Student):
            return False
        return self.name == other.name and self.grade == other.grade
  
    def __lt__(self, other):
        """Less than: student1 < student2"""
        if not isinstance(other, Student):
            return NotImplemented
        return self.grade < other.grade
  
    def __le__(self, other):
        """Less than or equal: student1 <= student2"""
        return self < other or self == other
  
    def __gt__(self, other):
        """Greater than: student1 > student2"""
        if not isinstance(other, Student):
            return NotImplemented
        return self.grade > other.grade
  
    def __ge__(self, other):
        """Greater than or equal: student1 >= student2"""
        return self > other or self == other
  
    def __ne__(self, other):
        """Not equal: student1 != student2"""
        return not self == other
  
    def __str__(self):
        return f"{self.name}: {self.grade}%"

# Create students
alice = Student("Alice", 95)
bob = Student("Bob", 87)
charlie = Student("Charlie", 95)

# Comparison operators work naturally:
print(alice > bob)        # True - calls __gt__
print(alice == charlie)   # False - calls __eq__ (different names)
print(alice >= charlie)   # True - calls __ge__

# Sorting works automatically:
students = [bob, alice, charlie]
students.sort()           # Uses __lt__ for comparison
for student in students:
    print(student)
# Output:
# Bob: 87%
# Alice: 95%
# Charlie: 95%
```

> **Tip** : You often only need to implement `__eq__` and `__lt__`. Python can derive the others, or you can use the `@functools.total_ordering` decorator to automatically generate the missing comparison methods.

### 4. Container-Like Behavior

These make your objects behave like lists, dictionaries, or other containers:

```python
class GradeBook:
    def __init__(self):
        self.grades = {}
  
    def __setitem__(self, student, grade):
        """Set grade: gradebook[student] = grade"""
        self.grades[student] = grade
  
    def __getitem__(self, student):
        """Get grade: grade = gradebook[student]"""
        if student not in self.grades:
            raise KeyError(f"No grade for {student}")
        return self.grades[student]
  
    def __delitem__(self, student):
        """Delete grade: del gradebook[student]"""
        if student not in self.grades:
            raise KeyError(f"No grade for {student}")
        del self.grades[student]
  
    def __contains__(self, student):
        """Check membership: student in gradebook"""
        return student in self.grades
  
    def __len__(self):
        """Length: len(gradebook)"""
        return len(self.grades)
  
    def __iter__(self):
        """Iteration: for student in gradebook"""
        return iter(self.grades)
  
    def __str__(self):
        return f"GradeBook with {len(self)} students"

# Usage like a built-in container:
grades = GradeBook()

# Assignment works like a dictionary
grades["Alice"] = 95        # Calls __setitem__
grades["Bob"] = 87          # Calls __setitem__

# Access works like a dictionary
print(grades["Alice"])      # Calls __getitem__ -> 95

# Membership testing
print("Alice" in grades)    # Calls __contains__ -> True
print("Charlie" in grades)  # Calls __contains__ -> False

# Length
print(len(grades))          # Calls __len__ -> 2

# Iteration
for student in grades:      # Calls __iter__
    grade = grades[student]  # Calls __getitem__
    print(f"{student}: {grade}")

# Deletion
del grades["Bob"]           # Calls __delitem__
```

### 5. Callable Objects

Make your objects behave like functions:

```python
class Multiplier:
    def __init__(self, factor):
        self.factor = factor
  
    def __call__(self, value):
        """Make object callable: multiplier(value)"""
        return value * self.factor
  
    def __str__(self):
        return f"Multiplier(×{self.factor})"

# Create callable objects
double = Multiplier(2)
triple = Multiplier(3)

# Use them like functions!
print(double(5))      # Calls __call__ -> 10
print(triple(4))      # Calls __call__ -> 12

# They're still objects with attributes
print(double.factor)  # 2
print(double)         # Multiplier(×2)

# Useful for creating function-like objects with state
numbers = [1, 2, 3, 4, 5]
doubled = list(map(double, numbers))  # [2, 4, 6, 8, 10]
```

### 6. Context Managers

Enable the `with` statement:

```python
class DatabaseConnection:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.connection = None
  
    def __enter__(self):
        """Called when entering 'with' block"""
        print(f"Connecting to {self.host}:{self.port}")
        self.connection = f"Connected to {self.host}:{self.port}"
        return self  # Return self to be assigned to 'as' variable
  
    def __exit__(self, exc_type, exc_value, traceback):
        """Called when exiting 'with' block"""
        print(f"Closing connection to {self.host}:{self.port}")
        if exc_type is not None:
            print(f"Exception occurred: {exc_value}")
        self.connection = None
        return False  # Don't suppress exceptions
  
    def execute(self, query):
        if not self.connection:
            raise RuntimeError("Not connected to database")
        return f"Executing: {query}"

# Usage with 'with' statement:
with DatabaseConnection("localhost", 5432) as db:
    result = db.execute("SELECT * FROM users")
    print(result)
    # Connection is automatically closed, even if exception occurs

# Output:
# Connecting to localhost:5432
# Executing: SELECT * FROM users
# Closing connection to localhost:5432
```

## Advanced Magic Methods

### Attribute Access Control

```python
class SmartConfig:
    def __init__(self):
        self._data = {}
  
    def __getattr__(self, name):
        """Called when attribute doesn't exist normally"""
        if name.startswith('_'):
            raise AttributeError(f"Private attribute {name} not accessible")
        return self._data.get(name, None)
  
    def __setattr__(self, name, value):
        """Called for all attribute assignments"""
        if name.startswith('_'):
            # Allow private attributes to be set normally
            super().__setattr__(name, value)
        else:
            # Store public attributes in _data
            if not hasattr(self, '_data'):
                super().__setattr__('_data', {})
            self._data[name] = value
  
    def __getattribute__(self, name):
        """Called for ALL attribute access"""
        if name == 'secret':
            raise AttributeError("Secret attribute is forbidden")
        return super().__getattribute__(name)
  
    def __delattr__(self, name):
        """Called when deleting attributes"""
        if name in self._data:
            del self._data[name]
        else:
            super().__delattr__(name)

config = SmartConfig()
config.database_url = "localhost:5432"  # Calls __setattr__
config.api_key = "secret123"            # Calls __setattr__

print(config.database_url)               # Calls __getattr__ -> localhost:5432
print(config.nonexistent)               # Calls __getattr__ -> None

del config.api_key                       # Calls __delattr__
```

### Descriptor Protocol

```python
class ValidatedAttribute:
    def __init__(self, validator, name=None):
        self.validator = validator
        self.name = name
  
    def __set_name__(self, owner, name):
        """Called when descriptor is assigned to class attribute"""
        self.name = name
  
    def __get__(self, instance, owner):
        """Called when accessing the attribute"""
        if instance is None:
            return self
        return instance.__dict__.get(self.name)
  
    def __set__(self, instance, value):
        """Called when setting the attribute"""
        if not self.validator(value):
            raise ValueError(f"Invalid value for {self.name}: {value}")
        instance.__dict__[self.name] = value
  
    def __delete__(self, instance):
        """Called when deleting the attribute"""
        del instance.__dict__[self.name]

class Person:
    # Descriptors for validation
    name = ValidatedAttribute(lambda x: isinstance(x, str) and len(x) > 0)
    age = ValidatedAttribute(lambda x: isinstance(x, int) and 0 <= x <= 150)
  
    def __init__(self, name, age):
        self.name = name  # Calls ValidatedAttribute.__set__
        self.age = age    # Calls ValidatedAttribute.__set__

# Usage with automatic validation:
person = Person("Alice", 30)
print(person.name)  # Calls ValidatedAttribute.__get__ -> Alice

try:
    person.age = -5  # Calls ValidatedAttribute.__set__ -> raises ValueError
except ValueError as e:
    print(e)  # Invalid value for age: -5
```

## Common Pitfalls and Solutions

### 1. Forgetting to Return NotImplemented

```python
# Wrong - breaks reflection
class BadNumber:
    def __init__(self, value):
        self.value = value
  
    def __add__(self, other):
        if isinstance(other, BadNumber):
            return BadNumber(self.value + other.value)
        return None  # Wrong! Should return NotImplemented

# Right - allows reflection
class GoodNumber:
    def __init__(self, value):
        self.value = value
  
    def __add__(self, other):
        if isinstance(other, GoodNumber):
            return GoodNumber(self.value + other.value)
        return NotImplemented  # Correct! Allows other.__radd__ to try
  
    def __radd__(self, other):
        """Reverse addition - called when left operand doesn't support +"""
        if isinstance(other, (int, float)):
            return GoodNumber(other + self.value)
        return NotImplemented

# Test reflection:
num = GoodNumber(5)
result = 3 + num  # Calls int.__add__(3, num), then num.__radd__(3)
print(result.value)  # 8
```

### 2. Mutable Default Arguments in **init**

```python
# Wrong - dangerous mutable default
class BadContainer:
    def __init__(self, items=[]):  # Dangerous!
        self.items = items

# Right - safe approach
class GoodContainer:
    def __init__(self, items=None):
        self.items = items if items is not None else []
```

### 3. Inconsistent Comparison Methods

```python
# Wrong - inconsistent comparisons
class BadStudent:
    def __init__(self, grade):
        self.grade = grade
  
    def __eq__(self, other):
        return self.grade == other.grade
  
    def __lt__(self, other):
        return self.grade > other.grade  # Wrong! Inconsistent with __eq__

# Right - consistent comparisons
from functools import total_ordering

@total_ordering
class GoodStudent:
    def __init__(self, grade):
        self.grade = grade
  
    def __eq__(self, other):
        return self.grade == other.grade
  
    def __lt__(self, other):
        return self.grade < other.grade  # Consistent!
```

## Real-World Applications

### 1. Custom Data Structures

```python
class Stack:
    """A stack implementation using magic methods"""
  
    def __init__(self):
        self._items = []
  
    def __len__(self):
        return len(self._items)
  
    def __bool__(self):
        """Stack is truthy if not empty"""
        return len(self._items) > 0
  
    def __str__(self):
        return f"Stack({self._items})"
  
    def __lshift__(self, item):
        """Push using << operator"""
        self._items.append(item)
        return self
  
    def __rshift__(self, other):
        """Pop using >> operator"""
        if not self._items:
            raise IndexError("Stack is empty")
        return self._items.pop()

# Natural usage:
stack = Stack()
stack << 1 << 2 << 3  # Push items
print(stack)          # Stack([1, 2, 3])

item = stack >> None  # Pop item
print(f"Popped: {item}")  # Popped: 3
print(f"Remaining: {stack}")  # Remaining: Stack([1, 2])
```

### 2. Configuration Objects

```python
class Config:
    """Configuration object with attribute-style access"""
  
    def __init__(self, **kwargs):
        self._data = kwargs
  
    def __getattr__(self, name):
        if name in self._data:
            value = self._data[name]
            # Recursively convert dicts to Config objects
            if isinstance(value, dict):
                return Config(**value)
            return value
        raise AttributeError(f"No configuration key: {name}")
  
    def __setattr__(self, name, value):
        if name.startswith('_'):
            super().__setattr__(name, value)
        else:
            if not hasattr(self, '_data'):
                super().__setattr__('_data', {})
            self._data[name] = value
  
    def __contains__(self, key):
        return key in self._data
  
    def __str__(self):
        return f"Config({self._data})"

# Usage:
config = Config(
    database={'host': 'localhost', 'port': 5432},
    api={'timeout': 30, 'retries': 3}
)

print(config.database.host)    # localhost
print(config.api.timeout)     # 30
print('database' in config)   # True
```

### 3. Unit Conversion

```python
class Unit:
    """Physical unit with automatic conversion"""
  
    def __init__(self, value, unit_type):
        self.value = value
        self.unit_type = unit_type
  
    def __add__(self, other):
        if not isinstance(other, Unit):
            return NotImplemented
        if self.unit_type != other.unit_type:
            raise ValueError(f"Cannot add {self.unit_type} and {other.unit_type}")
        return Unit(self.value + other.value, self.unit_type)
  
    def __mul__(self, scalar):
        if isinstance(scalar, (int, float)):
            return Unit(self.value * scalar, self.unit_type)
        return NotImplemented
  
    def __rmul__(self, scalar):
        return self * scalar
  
    def __str__(self):
        return f"{self.value} {self.unit_type}"

# Create unit factory functions
def meters(value):
    return Unit(value, "meters")

def seconds(value):
    return Unit(value, "seconds")

# Natural usage:
distance = meters(100)
time = seconds(10)
doubled_distance = 2 * distance  # Works due to __rmul__

print(distance)         # 100 meters
print(doubled_distance) # 200 meters
```

> **Key Takeaway** : Magic methods transform your custom classes from basic data containers into rich, expressive objects that integrate seamlessly with Python's syntax and built-in functions. They're the secret to writing truly Pythonic code that feels natural and intuitive to use.

The power of magic methods lies not just in what they do, but in how they make your code read. Instead of calling methods with obvious names, you can make your objects behave exactly like Python's built-in types, creating a seamless and elegant programming experience.
