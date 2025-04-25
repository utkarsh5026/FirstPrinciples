# Python Exception Hierarchy and Custom Exceptions

Let's explore Python's exception system from first principles, building our understanding from the ground up with clear examples along the way.

## What Are Exceptions?

At the most fundamental level, exceptions are Python's way of handling errors or unusual conditions that arise during program execution. Instead of immediately crashing when something goes wrong, Python gives us a structured way to identify, communicate, and respond to these problems.

Think of exceptions as messages that say: "Something unexpected happened, and normal execution cannot continue." When an exception occurs, Python creates an exception object containing information about what went wrong, and then "throws" or "raises" this object, interrupting the normal flow of the program.

For example, let's look at a basic division operation:

```python
result = 10 / 0  # This will raise a ZeroDivisionError
```

When Python tries to execute this line, it realizes division by zero is mathematically impossible. Instead of returning a nonsensical value or crashing silently, it raises a ZeroDivisionError exception.

## Exception Handling: Try-Except Blocks

To manage exceptions, Python provides a try-except structure:

```python
try:
    # Code that might cause an exception
    result = 10 / 0
except ZeroDivisionError:
    # Code that executes if the specified exception occurs
    print("You cannot divide by zero!")
    result = None
  
# Program continues here
print(f"The result is {result}")
```

In this example, when the division by zero happens, Python stops normal execution in the try block, jumps to the except block that handles ZeroDivisionError, executes that code, and then continues with the rest of the program. This prevents the entire program from crashing.

## The Exception Hierarchy

Python's exceptions are organized in a hierarchical tree structure, with each exception being a Python class that inherits from other exception classes. This hierarchy allows us to catch specific exceptions or broader categories of exceptions.

At the very top of this hierarchy is the `BaseException` class, from which all exceptions inherit. However, you'll rarely work directly with BaseException. More commonly, you'll interact with `Exception`, which is a direct subclass of BaseException and the parent class for most exceptions you'll encounter and create.

Here's a simplified view of the hierarchy:

```
BaseException
 ├── SystemExit
 ├── KeyboardInterrupt
 ├── GeneratorExit
 └── Exception
      ├── StopIteration
      ├── ArithmeticError
      │    ├── FloatingPointError
      │    ├── OverflowError
      │    └── ZeroDivisionError
      ├── AssertionError
      ├── AttributeError
      ├── BufferError
      ├── EOFError
      ├── ImportError
      │    └── ModuleNotFoundError
      ├── LookupError
      │    ├── IndexError
      │    └── KeyError
      ├── MemoryError
      ├── NameError
      │    └── UnboundLocalError
      ├── OSError (numerous subclasses)
      ├── ReferenceError
      ├── RuntimeError
      │    └── RecursionError
      ├── SyntaxError
      │    └── IndentationError
      ├── SystemError
      ├── TypeError
      ├── ValueError
      │    └── UnicodeError
      └── Warning (various subclasses)
```

Understanding this hierarchy is valuable because it affects how exception handling works. When you specify an exception class in an except clause, it will catch that exception and any of its subclasses.

For example:

```python
try:
    # This could raise IndexError or KeyError
    value = my_list[99]  # IndexError if my_list doesn't have 100 elements
    value = my_dict["nonexistent_key"]  # KeyError if the key doesn't exist
except LookupError:
    # This will catch both IndexError and KeyError since they inherit from LookupError
    print("An error occurred while looking up a value")
```

## Common Built-in Exceptions

Let's examine some of the most frequently encountered exceptions in Python:

1. **SyntaxError** : Raised when the parser encounters invalid syntax.

```python
   # Missing closing parenthesis
   print("Hello, world"
```

1. **TypeError** : Raised when an operation is performed on an object of inappropriate type.

```python
   # Trying to add a number and a string
   result = 42 + "hello"  # Raises TypeError
```

1. **ValueError** : Raised when a function receives an argument of the right type but an inappropriate value.

```python
   # Converting a non-numeric string to an integer
   number = int("hello")  # Raises ValueError
```

1. **NameError** : Raised when a local or global name is not found.

```python
   # Using a variable that hasn't been defined
   print(undefined_variable)  # Raises NameError
```

1. **IndexError** : Raised when a sequence index is out of range.

```python
   my_list = [1, 2, 3]
   print(my_list[10])  # Raises IndexError
```

1. **KeyError** : Raised when a dictionary key is not found.

```python
   my_dict = {"a": 1, "b": 2}
   print(my_dict["c"])  # Raises KeyError
```

1. **FileNotFoundError** : Raised when a file or directory is requested but doesn't exist.

```python
   with open("nonexistent_file.txt", "r") as file:
       content = file.read()  # Raises FileNotFoundError
```

1. **ZeroDivisionError** : Raised when division or modulo by zero is performed.

```python
   result = 10 / 0  # Raises ZeroDivisionError
```

1. **AttributeError** : Raised when an attribute reference or assignment fails.

```python
   number = 42
   number.append(1)  # Raises AttributeError since int objects don't have append method
```

1. **ImportError** : Raised when an import statement fails.

```python
   import non_existent_module  # Raises ImportError
```

## Creating Custom Exceptions

When building complex applications, you often need to signal application-specific error conditions. Python allows you to create custom exceptions tailored to your needs.

### Basic Custom Exception

The simplest way to create a custom exception is to define a new class that inherits from Exception:

```python
class MyCustomError(Exception):
    pass

# Using the custom exception
def check_positive(number):
    if number < 0:
        raise MyCustomError("Number must be positive")
    return number

try:
    check_positive(-5)
except MyCustomError as e:
    print(f"Error occurred: {e}")
```

In this example, we create a simple custom exception called `MyCustomError`. When `check_positive` receives a negative number, it raises our custom exception. The exception message "Number must be positive" becomes part of the exception object and can be accessed as shown.

### Custom Exception with Additional Functionality

Custom exceptions can include additional attributes and methods to provide more context about the error:

```python
class ValueTooLargeError(Exception):
    def __init__(self, value, max_value):
        self.value = value
        self.max_value = max_value
        self.message = f"Value {value} exceeds maximum allowed value of {max_value}"
        super().__init__(self.message)
  
    def get_overage(self):
        """Return how much the value exceeds the maximum"""
        return self.value - self.max_value

def process_value(value, max_allowed=100):
    if value > max_allowed:
        raise ValueTooLargeError(value, max_allowed)
    print(f"Processing value: {value}")

try:
    process_value(150)
except ValueTooLargeError as e:
    print(f"Error: {e}")
    print(f"Value exceeds maximum by: {e.get_overage()}")
```

In this example:

1. We create `ValueTooLargeError` with a custom constructor that accepts the problematic value and the maximum allowed value
2. We store these values as attributes and create a descriptive message
3. We include a utility method `get_overage()` to calculate how much the value exceeds the maximum
4. When catching the exception, we can access both the message and the additional method

### Creating an Exception Hierarchy

Just as Python's built-in exceptions form a hierarchy, you can create your own hierarchy of custom exceptions. This allows for more granular exception handling:

```python
class DatabaseError(Exception):
    """Base class for all database-related errors"""
    pass

class ConnectionError(DatabaseError):
    """Raised when a database connection fails"""
    pass

class QueryError(DatabaseError):
    """Raised when a database query fails"""
    def __init__(self, query, message):
        self.query = query
        self.message = message
        super().__init__(f"Query failed: {message}, Query: {query}")

def execute_query(query):
    # Simulate database operations
    if "SELECT" not in query.upper():
        raise QueryError(query, "Only SELECT queries are supported")
    if "connection" not in globals():
        raise ConnectionError("Database connection not established")
    print(f"Executing query: {query}")

try:
    execute_query("INSERT INTO users VALUES ('John', 'Doe')")
except QueryError as e:
    print(f"Query problem: {e}")
    print(f"Problematic query: {e.query}")
except ConnectionError as e:
    print(f"Connection problem: {e}")
except DatabaseError as e:
    print(f"General database problem: {e}")
```

In this example:

1. We create a base `DatabaseError` class for all database-related errors
2. We create two specific subclasses: `ConnectionError` and `QueryError`
3. The `QueryError` class includes additional context (the problematic query)
4. Our `except` blocks are arranged from most specific to most general

This approach allows you to handle different types of database errors differently or catch all database errors with a single except block.

## Best Practices for Custom Exceptions

When creating and using custom exceptions, keep these guidelines in mind:

1. **Name exceptions with an "Error" suffix** : This makes their purpose clear (e.g., `ValueTooLargeError` not just `ValueTooLarge`).
2. **Inherit from appropriate exception classes** : If your custom exception is similar to a built-in exception, consider inheriting from that specific exception rather than the generic Exception class.

```python
# Instead of this:
class NegativeValueError(Exception):
    pass

# Consider this:
class NegativeValueError(ValueError):
    pass
```

3. **Include meaningful error messages** : Make sure your exception messages clearly explain what went wrong.
4. **Add context through additional attributes** : Store relevant values that will help diagnose and handle the error.
5. **Create exception hierarchies** : Group related exceptions under a common base class to allow catching categories of exceptions.
6. **Document your exceptions** : Include docstrings explaining when and why each exception might be raised.

```python
class InsufficientFundsError(Exception):
    """Raised when an attempt is made to withdraw more money than is available.
  
    Attributes:
        requested -- amount requested for withdrawal
        available -- amount available in the account
    """
    def __init__(self, requested, available):
        self.requested = requested
        self.available = available
        self.message = f"Cannot withdraw ${requested:.2f}, only ${available:.2f} available"
        super().__init__(self.message)
```

## Advanced Exception Handling

Beyond the basics, Python offers several advanced features for exception handling:

### Multiple Exception Types

You can catch multiple exception types in a single except clause:

```python
try:
    number = int(input("Enter a number: "))
    result = 100 / number
except (ValueError, ZeroDivisionError) as e:
    print(f"Error: {e}")
```

### Multiple Except Blocks

You can have multiple except blocks to handle different exceptions differently:

```python
try:
    number = int(input("Enter a number: "))
    result = 100 / number
    print(f"Result: {result}")
except ValueError:
    print("That's not a valid number!")
except ZeroDivisionError:
    print("You cannot divide by zero!")
```

### The Else Clause

The `else` clause executes when no exception occurs in the try block:

```python
try:
    number = int(input("Enter a number: "))
    result = 100 / number
except ValueError:
    print("That's not a valid number!")
except ZeroDivisionError:
    print("You cannot divide by zero!")
else:
    # This only runs if no exception occurred
    print(f"The result is {result}")
```

### The Finally Clause

The `finally` clause always executes, whether an exception occurred or not:

```python
file = None
try:
    file = open("data.txt", "r")
    content = file.read()
except FileNotFoundError:
    print("The file does not exist")
finally:
    # This always runs, ensuring the file gets closed
    if file:
        file.close()
        print("File closed")
```

This is especially useful for resource cleanup (like closing files or database connections).

### Re-raising Exceptions

Sometimes you want to catch an exception, do something (like logging), and then let the exception continue up the call stack:

```python
def process_data(data):
    try:
        result = analyze_data(data)
        return result
    except Exception as e:
        print(f"An error occurred: {e}")
        # Re-raise the exception after logging
        raise
```

### Chaining Exceptions

You can catch one exception and raise a different one while preserving the original exception information:

```python
def fetch_data(user_id):
    try:
        # Attempt to fetch data from database
        return database.get_user(user_id)
    except DatabaseError as original_error:
        # Raise a more application-specific error
        raise UserDataError(f"Failed to fetch data for user {user_id}") from original_error
```

The `from` keyword creates an exception chain, storing the original exception as the `__cause__` attribute of the new exception.

## A Real-World Example

Let's tie all this together with a more complete example. Imagine we're building a banking application:

```python
class BankException(Exception):
    """Base class for all banking-related exceptions"""
    pass

class InsufficientFundsError(BankException):
    """Raised when trying to withdraw more money than available"""
    def __init__(self, account_id, requested, available):
        self.account_id = account_id
        self.requested = requested
        self.available = available
        self.message = f"Account {account_id}: Cannot withdraw ${requested:.2f}, only ${available:.2f} available"
        super().__init__(self.message)
  
    def get_shortfall(self):
        """Return the amount by which the request exceeds available funds"""
        return self.requested - self.available

class AccountNotFoundError(BankException):
    """Raised when referencing a non-existent account"""
    def __init__(self, account_id):
        self.account_id = account_id
        self.message = f"Account {account_id} does not exist"
        super().__init__(self.message)

class AccountFrozenError(BankException):
    """Raised when attempting operations on a frozen account"""
    def __init__(self, account_id, reason=None):
        self.account_id = account_id
        self.reason = reason
        message = f"Account {account_id} is frozen"
        if reason:
            message += f": {reason}"
        self.message = message
        super().__init__(self.message)

class Bank:
    def __init__(self):
        # Simple in-memory "database" of accounts
        self.accounts = {}
        self.frozen_accounts = set()
  
    def create_account(self, account_id, initial_balance=0):
        if account_id in self.accounts:
            raise ValueError(f"Account {account_id} already exists")
        self.accounts[account_id] = initial_balance
        return account_id
  
    def get_balance(self, account_id):
        self._validate_account(account_id)
        return self.accounts[account_id]
  
    def deposit(self, account_id, amount):
        self._validate_account(account_id)
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self.accounts[account_id] += amount
        return self.accounts[account_id]
  
    def withdraw(self, account_id, amount):
        self._validate_account(account_id)
        if amount <= 0:
            raise ValueError("Withdrawal amount must be positive")
      
        available = self.accounts[account_id]
        if amount > available:
            raise InsufficientFundsError(account_id, amount, available)
      
        self.accounts[account_id] -= amount
        return self.accounts[account_id]
  
    def freeze_account(self, account_id, reason=None):
        self._validate_account_exists(account_id)
        self.frozen_accounts.add(account_id)
  
    def unfreeze_account(self, account_id):
        self._validate_account_exists(account_id)
        if account_id in self.frozen_accounts:
            self.frozen_accounts.remove(account_id)
  
    def _validate_account(self, account_id):
        """Validate that an account exists and is not frozen"""
        self._validate_account_exists(account_id)
        if account_id in self.frozen_accounts:
            raise AccountFrozenError(account_id)
  
    def _validate_account_exists(self, account_id):
        """Validate that an account exists"""
        if account_id not in self.accounts:
            raise AccountNotFoundError(account_id)

# Using our bank and custom exceptions
def main():
    bank = Bank()
  
    try:
        # Create some accounts
        bank.create_account("Alice", 1000)
        bank.create_account("Bob", 500)
      
        # Perform operations
        print(f"Alice's balance: ${bank.get_balance('Alice'):.2f}")
        bank.deposit("Alice", 200)
        print(f"Alice's balance after deposit: ${bank.get_balance('Alice'):.2f}")
      
        try:
            # Try withdrawing too much
            bank.withdraw("Bob", 700)
        except InsufficientFundsError as e:
            print(f"Error: {e}")
            print(f"Shortfall: ${e.get_shortfall():.2f}")
            # Maybe suggest an overdraft
            if e.get_shortfall() < 300:
                print("Consider applying for overdraft protection")
      
        # Freeze an account
        bank.freeze_account("Alice", "Suspicious activity")
      
        try:
            # Try operating on a frozen account
            bank.withdraw("Alice", 50)
        except AccountFrozenError as e:
            print(f"Error: {e}")
      
        # Try accessing a non-existent account
        bank.get_balance("Charlie")
      
    except AccountNotFoundError as e:
        print(f"Account error: {e}")
    except BankException as e:
        print(f"Banking operation failed: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
```

This example demonstrates:

1. A hierarchy of custom exceptions for banking operations
2. Exception classes with additional context and utility methods
3. Proper exception handling at different levels of specificity
4. Clean separation of concerns between business logic and error handling

## Conclusion

Python's exception system is a powerful tool for handling errors and exceptional conditions in your code. By understanding the built-in exception hierarchy and creating your own custom exceptions, you can build robust applications that gracefully handle errors and provide meaningful feedback.

The key principles to remember are:

1. Exceptions are Python objects organized in a hierarchical structure
2. Custom exceptions should inherit from Exception or appropriate subclasses
3. Exception handling allows your code to respond to errors without crashing
4. Custom exceptions can carry additional context about the error
5. Well-designed exception hierarchies make error handling cleaner and more precise

By applying these principles, you can write code that's not only more robust but also more maintainable and easier to debug.
