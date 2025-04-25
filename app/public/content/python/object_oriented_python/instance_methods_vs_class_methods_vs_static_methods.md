# Python Methods: Instance, Class, and Static Methods From First Principles

Methods are the heart of object-oriented programming in Python, allowing us to define behavior for our objects. Let's explore the three fundamental types of methods in Python - instance methods, class methods, and static methods - building our understanding from first principles.

## Foundation: What Is a Method?

At its core, a method is simply a function that is associated with a class. While regular functions exist independently, methods are defined within a class and operate on data related to that class.

## Instance Methods: The Default Behavior

Instance methods are the most common type of method in Python. They operate on individual instances (objects) of a class.

### Key Characteristics of Instance Methods

1. They automatically receive the instance itself as their first parameter, conventionally named `self`.
2. They can access and modify instance attributes using `self`.
3. They can also access class attributes.

### Example of Instance Methods

Let's imagine we're building a simple banking application:

```python
class BankAccount:
    # Class attribute
    bank_name = "First Principles Bank"
  
    def __init__(self, owner, balance=0):
        # Instance attributes
        self.owner = owner
        self.balance = balance
  
    # Instance method
    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            return f"Deposited ${amount}. New balance: ${self.balance}"
        return "Amount must be positive"
  
    # Another instance method
    def withdraw(self, amount):
        if amount > 0 and amount <= self.balance:
            self.balance -= amount
            return f"Withdrew ${amount}. New balance: ${self.balance}"
        return "Invalid withdrawal amount"
```

Let's see how we would use these instance methods:

```python
# Creating an instance of BankAccount
alice_account = BankAccount("Alice", 1000)

# Calling instance methods
print(alice_account.deposit(500))  # Output: Deposited $500. New balance: $1500
print(alice_account.withdraw(200)) # Output: Withdrew $200. New balance: $1300
```

When we call `alice_account.deposit(500)`, Python automatically passes `alice_account` as the `self` parameter. The actual function call becomes `BankAccount.deposit(alice_account, 500)` behind the scenes.

### How Instance Methods Work Under the Hood

When you call `alice_account.deposit(500)`, Python transforms this into `BankAccount.deposit(alice_account, 500)`. The instance (`alice_account`) becomes the `self` parameter in the method. This is why instance methods always have `self` as their first parameter.

## Class Methods: Operating on the Class

Class methods operate on the class itself rather than instances of the class.

### Key Characteristics of Class Methods

1. They receive the class itself as their first parameter, conventionally named `cls`.
2. They are defined using the `@classmethod` decorator.
3. They can access and modify class attributes but not instance attributes directly.
4. They can be called on either the class or an instance of the class.

### Example of Class Methods

Extending our `BankAccount` class:

```python
class BankAccount:
    # Class attribute
    bank_name = "First Principles Bank"
    accounts_created = 0  # Track how many accounts have been created
  
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        BankAccount.accounts_created += 1
  
    # Instance method (as before)
    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            return f"Deposited ${amount}. New balance: ${self.balance}"
        return "Amount must be positive"
  
    # Class method
    @classmethod
    def get_bank_info(cls):
        return f"{cls.bank_name} has created {cls.accounts_created} accounts"
  
    # Class method as an alternative constructor
    @classmethod
    def create_joint_account(cls, owner1, owner2, initial_balance=0):
        joint_name = f"{owner1} & {owner2}"
        return cls(joint_name, initial_balance)
```

Using class methods:

```python
# Using a class method without creating an instance
print(BankAccount.get_bank_info())  # Output: First Principles Bank has created 0 accounts

# Creating some accounts
alice_account = BankAccount("Alice", 1000)
bob_account = BankAccount("Bob", 500)

# Using the class method again
print(BankAccount.get_bank_info())  # Output: First Principles Bank has created 2 accounts

# Using a class method as an alternative constructor
joint_account = BankAccount.create_joint_account("Alice", "Bob", 2000)
print(joint_account.owner)  # Output: Alice & Bob
print(joint_account.balance)  # Output: 2000

# Class methods can also be called on instances
print(alice_account.get_bank_info())  # This also works!
```

### Why Use Class Methods?

Class methods are particularly useful for:

1. Creating alternative constructors (like `create_joint_account` above)
2. Implementing factory methods that return class instances
3. Accessing and modifying class state that applies to all instances
4. Implementing methods that need to work even when no instances exist

### How Class Methods Work Under the Hood

When you define a method with `@classmethod`, Python modifies how the method is called. For a call like `BankAccount.get_bank_info()`, Python passes the class `BankAccount` as the first parameter. Even when called on an instance like `alice_account.get_bank_info()`, Python still passes the class, not the instance.

## Static Methods: Independent Functions Within a Class

Static methods are functions defined in a class that don't operate on the class or its instances.

### Key Characteristics of Static Methods

1. They don't receive any automatic first parameter (no `self` or `cls`).
2. They are defined using the `@staticmethod` decorator.
3. They cannot access or modify class or instance attributes directly.
4. They can be called on either the class or an instance of the class.

### Example of Static Methods

Let's extend our banking example:

```python
class BankAccount:
    # Previous code remains the same...
  
    # Static method
    @staticmethod
    def validate_amount(amount):
        return amount > 0
  
    # Now we can use our static method in our instance methods
    def deposit(self, amount):
        if BankAccount.validate_amount(amount):
            self.balance += amount
            return f"Deposited ${amount}. New balance: ${self.balance}"
        return "Amount must be positive"
  
    def withdraw(self, amount):
        if BankAccount.validate_amount(amount) and amount <= self.balance:
            self.balance -= amount
            return f"Withdrew ${amount}. New balance: ${self.balance}"
        return "Invalid withdrawal amount"
  
    # Another static method that performs a utility function
    @staticmethod
    def convert_currency(amount, exchange_rate):
        return amount * exchange_rate
```

Using static methods:

```python
# Using static method directly on the class
valid = BankAccount.validate_amount(500)
print(valid)  # Output: True

invalid = BankAccount.validate_amount(-50)
print(invalid)  # Output: False

# Static methods can also be called on instances
alice_account = BankAccount("Alice", 1000)
print(alice_account.validate_amount(100))  # Output: True

# Using the currency conversion static method
usd_amount = 100
usd_to_eur_rate = 0.85
eur_amount = BankAccount.convert_currency(usd_amount, usd_to_eur_rate)
print(f"${usd_amount} is €{eur_amount}")  # Output: $100 is €85.0
```

### Why Use Static Methods?

Static methods are useful for:

1. Utility functions related to the class but not dependent on class or instance state
2. Helper methods that don't need access to class or instance attributes
3. Organizing code that conceptually belongs to the class but operates independently

### How Static Methods Work Under the Hood

Static methods are essentially regular functions that are namespaced within a class. When you call a static method, Python doesn't pass any implicit first argument. This is why they can't access class or instance attributes directly—they don't have a reference to either.

## Comparing the Three Method Types

Let's create a comprehensive example that uses all three method types to clearly show their differences:

```python
class Temperature:
    # Class attribute
    scales = {"celsius", "fahrenheit", "kelvin"}
  
    def __init__(self, value, scale="celsius"):
        if scale.lower() not in Temperature.scales:
            raise ValueError(f"Scale must be one of {Temperature.scales}")
      
        self.value = value
        self.scale = scale.lower()
  
    # Instance method - operates on the specific temperature instance
    def convert_to(self, target_scale):
        """Convert this temperature instance to another scale"""
        if target_scale.lower() == self.scale:
            return self.value
      
        # First convert to celsius as a middle ground
        celsius_value = self.value
        if self.scale == "fahrenheit":
            celsius_value = (self.value - 32) * 5/9
        elif self.scale == "kelvin":
            celsius_value = self.value - 273.15
          
        # Then convert from celsius to the target scale
        if target_scale.lower() == "celsius":
            return celsius_value
        elif target_scale.lower() == "fahrenheit":
            return (celsius_value * 9/5) + 32
        elif target_scale.lower() == "kelvin":
            return celsius_value + 273.15
  
    # Class method - operates on the class itself
    @classmethod
    def add_scale(cls, new_scale):
        """Add a new temperature scale to the class"""
        if new_scale.lower() not in cls.scales:
            cls.scales.add(new_scale.lower())
            return f"Added {new_scale} to available scales"
        return f"{new_scale} is already an available scale"
  
    # Static method - independent utility function
    @staticmethod
    def is_freezing(celsius_value):
        """Check if a temperature in Celsius is at or below freezing"""
        return celsius_value <= 0
```

Using all three types of methods:

```python
# Creating instances
room_temp = Temperature(21)  # 21°C
body_temp = Temperature(98.6, "fahrenheit")

# Using an instance method
celsius_body_temp = body_temp.convert_to("celsius")
print(f"Body temperature: {celsius_body_temp:.1f}°C")  # Output: Body temperature: 37.0°C

# Using a class method
print(Temperature.scales)  # Output: {'celsius', 'fahrenheit', 'kelvin'}
Temperature.add_scale("rankine")
print(Temperature.scales)  # Output: {'celsius', 'fahrenheit', 'kelvin', 'rankine'}

# Class methods can be called from instances too
room_temp.add_scale("réaumur")
print(Temperature.scales)  # Output: {'celsius', 'fahrenheit', 'kelvin', 'rankine', 'réaumur'}

# Using a static method
winter_temp = Temperature(0)
print(f"Is freezing? {Temperature.is_freezing(winter_temp.value)}")  # Output: Is freezing? True

# Static methods can be called from instances too
summer_temp = Temperature(30)
print(f"Is freezing? {summer_temp.is_freezing(summer_temp.value)}")  # Output: Is freezing? False
```

## Method Access Abilities: At a Glance

To summarize what each method type can access:

| Method Type     | Class State | Instance State | No State |
| --------------- | ----------- | -------------- | -------- |
| Instance Method | Yes         | Yes            | Yes      |
| Class Method    | Yes         | No             | Yes      |
| Static Method   | No          | No             | Yes      |

## When to Use Each Method Type

### Use Instance Methods When:

* You need to access or modify instance attributes
* The functionality depends on the specific instance's state
* The behavior is specific to each object

### Use Class Methods When:

* You need to access or modify class attributes
* You want to create alternative constructors
* The functionality is related to the class but not to specific instances
* You need to implement methods that work without instances

### Use Static Methods When:

* You need a utility function related to the class's purpose
* The functionality doesn't depend on class or instance state
* You want to namespace a function within a class for organizational purposes

## Practical Applications

Let's see a real-world example that combines all three method types:

```python
class Date:
    # Class attribute
    days_in_month = {
        1: 31, 2: 28, 3: 31, 4: 30, 5: 31, 6: 30,
        7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
    }
  
    def __init__(self, day, month, year):
        self.day = day
        self.month = month
        self.year = year
  
    # Instance method
    def is_valid(self):
        # Check if month is valid
        if not 1 <= self.month <= 12:
            return False
      
        # Check if year is valid (assuming we support years from 1)
        if self.year < 1:
            return False
      
        # Check if day is valid
        max_days = self.days_in_month[self.month]
        # February in a leap year has 29 days
        if self.month == 2 and Date.is_leap_year(self.year):
            max_days = 29
          
        return 1 <= self.day <= max_days
  
    # Class method - alternative constructor
    @classmethod
    def from_string(cls, date_string):
        """Create a Date object from a string in DD-MM-YYYY format"""
        day, month, year = map(int, date_string.split('-'))
        return cls(day, month, year)
  
    # Static method - utility function
    @staticmethod
    def is_leap_year(year):
        """Determine if a year is a leap year"""
        return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
```

Using our `Date` class:

```python
# Using the regular constructor (instance method)
birthday = Date(15, 3, 1990)
print(birthday.is_valid())  # Output: True

# Using the class method as an alternative constructor
today = Date.from_string("25-4-2025")
print(today.is_valid())  # Output: True

# Using the static method directly
print(Date.is_leap_year(2024))  # Output: True
print(Date.is_leap_year(2025))  # Output: False

# Invalid date
invalid_date = Date(31, 2, 2025)  # February never has 31 days
print(invalid_date.is_valid())  # Output: False

# Date with February 29 in a leap year
leap_date = Date(29, 2, 2024)
print(leap_date.is_valid())  # Output: True

# Date with February 29 in a non-leap year
non_leap_date = Date(29, 2, 2025)
print(non_leap_date.is_valid())  # Output: False
```

## Conclusion

Python's method types provide powerful tools for organizing code in object-oriented programs:

1. **Instance methods** work with individual object data and behavior.
2. **Class methods** work with class-wide data and behavior.
3. **Static methods** provide related utility functions.

Understanding when to use each type helps create cleaner, more maintainable code. The choice depends on what data the method needs to access:

* Need instance data? Use an instance method.
* Need only class data? Use a class method.
* Need neither? Use a static method.

By mastering these three method types, you'll write more elegant and effective Python code that follows object-oriented principles.
