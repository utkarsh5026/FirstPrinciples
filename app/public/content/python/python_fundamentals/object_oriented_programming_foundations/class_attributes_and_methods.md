# Class Attributes and Methods: Understanding Shared State in Python

Let me build this concept from the ground up, starting with how Python handles data at different levels of organization.

## Fundamental Concept: Instance vs Class Storage

When you create objects in Python, data can exist at two different levels:

```
Class Level     ┌─────────────────────┐
(Shared)        │    BankAccount      │  ← All instances share this
                │  interest_rate=0.02 │
                └─────────────────────┘
                          │
                ┌─────────┼─────────┐
Instance Level  │         │         │
(Individual)    │ acc1    │  acc2   │  ← Each has its own
                │balance  │ balance │
                │ =100    │ =500    │
                └─────────┴─────────┘
```

Let's start with a basic example to see this in action:

```python
class BankAccount:
    # CLASS ATTRIBUTE - shared by ALL instances
    interest_rate = 0.02  # 2% interest rate for all accounts
  
    def __init__(self, initial_balance):
        # INSTANCE ATTRIBUTE - unique to each instance
        self.balance = initial_balance

# Create instances
account1 = BankAccount(100)
account2 = BankAccount(500)

# Each instance has its own balance
print(f"Account 1: ${account1.balance}")  # Account 1: $100
print(f"Account 2: ${account2.balance}")  # Account 2: $500

# But they share the same interest rate
print(f"Account 1 rate: {account1.interest_rate}")  # 0.02
print(f"Account 2 rate: {account2.interest_rate}")  # 0.02

# Changing the class attribute affects ALL instances
BankAccount.interest_rate = 0.03
print(f"Account 1 rate: {account1.interest_rate}")  # 0.03
print(f"Account 2 rate: {account2.interest_rate}")  # 0.03
```

> **Key Mental Model** : Class attributes are like "global settings" for all instances of that class. They exist in the class's namespace, not in individual instances.

## How Python Resolves Attribute Access

When you access `account1.interest_rate`, Python follows this search order:

```
1. Look in instance dictionary  ← instance.__dict__
2. Look in class dictionary     ← Class.__dict__
3. Look in parent classes      ← inheritance chain
4. Raise AttributeError        ← if not found anywhere
```

Let's see this in action:

```python
class Counter:
    count = 0  # Class attribute
  
    def __init__(self, name):
        self.name = name  # Instance attribute

counter1 = Counter("First")

# Inspect the namespaces
print("Instance namespace:", counter1.__dict__)  # {'name': 'First'}
print("Class namespace:", Counter.__dict__)      # Contains 'count': 0

# Access follows the search order
print(counter1.count)  # Found in class → 0
print(counter1.name)   # Found in instance → "First"

# Common pitfall: assignment creates instance attribute!
counter1.count = 5     # Creates NEW instance attribute
print(counter1.count)  # Now found in instance → 5
print(Counter.count)   # Class attribute unchanged → 0
```

> **Common Gotcha** : Assigning to `instance.class_attribute` doesn't modify the class attribute—it creates a new instance attribute that shadows the class one!

## Tracking Shared State Properly

Here's how to correctly use class attributes for shared state:

```python
class User:
    total_users = 0      # Track total number of users
    active_users = []    # DANGER: Mutable class attribute!
  
    def __init__(self, username):
        self.username = username
        User.total_users += 1  # Modify class attribute correctly
        User.active_users.append(username)  # Dangerous!

# The problem with mutable class attributes
user1 = User("alice")
user2 = User("bob")

print(f"Total users: {User.total_users}")    # 2 ✓
print(f"Active users: {User.active_users}")  # ['alice', 'bob']

# All instances share the SAME list object!
print(user1.active_users)  # ['alice', 'bob'] - Wrong!
print(user2.active_users)  # ['alice', 'bob'] - Wrong!
```

**Safe approach for mutable shared state:**

```python
class User:
    total_users = 0
    _active_users = []  # Private class attribute
  
    def __init__(self, username):
        self.username = username
        User.total_users += 1
        User._active_users.append(username)
  
    @classmethod
    def get_active_users(cls):
        """Safe way to access mutable class data"""
        return cls._active_users.copy()  # Return a copy
  
    @classmethod
    def clear_users(cls):
        """Safe way to modify class state"""
        cls._active_users.clear()
        cls.total_users = 0
```

## Class Methods: Operating on Class State

Regular methods work on individual instances. Class methods work on the class itself:

```python
class DatabaseConnection:
    _instance_count = 0
    _max_connections = 5
  
    def __init__(self, database_name):
        if DatabaseConnection._instance_count >= DatabaseConnection._max_connections:
            raise Exception("Too many connections!")
      
        self.database_name = database_name
        DatabaseConnection._instance_count += 1
  
    @classmethod
    def get_connection_count(cls):
        """Class method - works with class state"""
        return cls._instance_count
  
    @classmethod  
    def set_max_connections(cls, max_conn):
        """Class method - modifies class configuration"""
        cls._max_connections = max_conn
  
    @classmethod
    def create_admin_connection(cls):
        """Alternative constructor using class method"""
        return cls("admin_db")
  
    def __del__(self):
        """Cleanup when instance is destroyed"""
        DatabaseConnection._instance_count -= 1

# Usage examples
conn1 = DatabaseConnection("users_db")
conn2 = DatabaseConnection("products_db")

print(f"Connections: {DatabaseConnection.get_connection_count()}")  # 2

# Use class method as alternative constructor
admin_conn = DatabaseConnection.create_admin_connection()
print(f"Admin DB: {admin_conn.database_name}")  # admin_db

# Modify class-level configuration
DatabaseConnection.set_max_connections(10)
```

> **Key Insight** : `@classmethod` receives the class itself as the first argument (conventionally named `cls`), not an instance. This allows it to work with class attributes and create new instances.

## When to Use Class-Level Features

### 1. **Configuration and Constants**

```python
class APIClient:
    BASE_URL = "https://api.example.com"  # Shared configuration
    TIMEOUT = 30
    API_VERSION = "v2"
  
    def __init__(self, api_key):
        self.api_key = api_key
        self.session_url = f"{self.BASE_URL}/{self.API_VERSION}"
```

### 2. **Tracking Global State**

```python
class GameCharacter:
    total_characters = 0
    characters_by_class = {}
  
    def __init__(self, name, character_class):
        self.name = name
        self.character_class = character_class
      
        # Update class-level tracking
        GameCharacter.total_characters += 1
      
        if character_class not in GameCharacter.characters_by_class:
            GameCharacter.characters_by_class[character_class] = 0
        GameCharacter.characters_by_class[character_class] += 1
  
    @classmethod
    def get_stats(cls):
        return {
            'total': cls.total_characters,
            'by_class': cls.characters_by_class.copy()
        }
```

### 3. **Alternative Constructors**

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
  
    @classmethod
    def from_birth_year(cls, name, birth_year):
        """Alternative constructor from birth year"""
        current_year = 2024
        age = current_year - birth_year
        return cls(name, age)  # cls refers to the class
  
    @classmethod
    def from_string(cls, person_string):
        """Alternative constructor from formatted string"""
        name, age_str = person_string.split('-')
        return cls(name, int(age_str))

# Multiple ways to create Person objects
person1 = Person("Alice", 30)                    # Standard constructor
person2 = Person.from_birth_year("Bob", 1990)    # From birth year
person3 = Person.from_string("Charlie-25")       # From string
```

### 4. **Factory Methods and Validation**

```python
class Rectangle:
    def __init__(self, width, height):
        if width <= 0 or height <= 0:
            raise ValueError("Dimensions must be positive")
        self.width = width
        self.height = height
  
    @classmethod
    def square(cls, side):
        """Factory method for creating squares"""
        return cls(side, side)
  
    @classmethod
    def from_area_and_ratio(cls, area, width_height_ratio):
        """Complex factory method with calculations"""
        import math
        height = math.sqrt(area / width_height_ratio)
        width = area / height
        return cls(width, height)
  
    def area(self):
        return self.width * self.height

# Usage
rect1 = Rectangle(10, 5)                              # Direct construction
square = Rectangle.square(7)                          # Factory method
rect2 = Rectangle.from_area_and_ratio(100, 2.0)      # Complex factory
```

## Class Methods vs Static Methods vs Instance Methods

```python
class MathUtils:
    pi = 3.14159  # Class attribute
  
    def __init__(self, precision):
        self.precision = precision  # Instance attribute
  
    def round_number(self, number):
        """Instance method - works with instance data"""
        return round(number, self.precision)
  
    @classmethod
    def get_pi(cls):
        """Class method - works with class data"""
        return cls.pi
  
    @staticmethod
    def add(a, b):
        """Static method - independent utility function"""
        return a + b

# Different ways to call methods
math_util = MathUtils(2)

# Instance method - needs an instance
result1 = math_util.round_number(3.14159)  # Uses instance's precision

# Class method - can call on class or instance
result2 = MathUtils.get_pi()               # Called on class
result3 = math_util.get_pi()               # Called on instance (same result)

# Static method - completely independent
result4 = MathUtils.add(5, 3)              # Called on class
result5 = math_util.add(5, 3)              # Called on instance (same result)
```

> **Design Principle** : Use instance methods for operations on instance data, class methods for operations on class data or alternative constructors, and static methods for utilities that logically belong to the class but don't need class or instance data.

## Real-World Example: Database Model Pattern

Here's how class attributes and methods work together in a practical scenario:

```python
class DatabaseModel:
    """Base class demonstrating class-level features"""
  
    # Class attributes for configuration
    table_name = None  # To be overridden by subclasses
    connection_pool = []
    query_count = 0
  
    def __init__(self, **kwargs):
        # Instance attributes for data
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.id = None  # Will be set when saved
  
    @classmethod
    def connect(cls, connection_string):
        """Class method to manage connections"""
        cls.connection_pool.append(connection_string)
  
    @classmethod
    def find_by_id(cls, record_id):
        """Class method - alternative constructor from database"""
        cls.query_count += 1
        # Simulate database query
        print(f"Querying {cls.table_name} for ID {record_id}")
        # Return new instance with data from database
        return cls(id=record_id, name=f"Record_{record_id}")
  
    @classmethod
    def get_query_stats(cls):
        """Class method to check usage statistics"""
        return {
            'table': cls.table_name,
            'queries': cls.query_count,
            'connections': len(cls.connection_pool)
        }
  
    def save(self):
        """Instance method to save this particular record"""
        self.__class__.query_count += 1  # Access class attribute
        print(f"Saving {self.__class__.table_name} record")
        if not self.id:
            self.id = len(self.__class__.connection_pool) + 1
        return self

class User(DatabaseModel):
    table_name = "users"  # Override class attribute

class Product(DatabaseModel):
    table_name = "products"  # Override class attribute

# Usage demonstrates class vs instance behavior
DatabaseModel.connect("postgres://localhost/mydb")

# Each class tracks its own queries
user = User.find_by_id(123)    # Creates User instance
product = Product.find_by_id(456)  # Creates Product instance

user.save()
product.save()

# Each class maintains separate statistics
print("User stats:", User.get_query_stats())
print("Product stats:", Product.get_query_stats())
```

> **Real-World Application** : This pattern is used in ORMs (Object-Relational Mappers) like Django's models and SQLAlchemy, where class methods handle database operations and class attributes define table configuration.

Class attributes and methods provide a powerful way to share data and behavior across all instances of a class, while still maintaining the flexibility of instance-specific data and methods. The key is understanding when you need shared state versus individual state, and choosing the appropriate level of organization for your data and methods.
