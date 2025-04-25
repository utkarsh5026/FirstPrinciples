# Testing and Debugging Object-Oriented Python Code

Object-oriented programming (OOP) brings many benefits to software development, but it also introduces complexity that requires careful testing and debugging approaches. Let me guide you through a comprehensive exploration of testing and debugging OOP code in Python, starting from first principles.

## I. Understanding the Foundations

### What is OOP?

Object-oriented programming centers around the concept of "objects" - data structures that contain both:

* Data (attributes/properties)
* Behavior (methods/functions)

These objects interact with each other to form complex programs. Before we dive into testing and debugging, let's ensure we understand what makes OOP code different:

```python
# A simple class representing a bank account
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
      
    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        self.balance += amount
        return self.balance
      
    def withdraw(self, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        return self.balance
```

In this example:

* `owner` and `balance` are attributes (data)
* `deposit` and `withdraw` are methods (behavior)
* The class enforces rules like preventing negative withdrawals

### Why Testing OOP Code is Unique

Testing OOP code presents special challenges:

1. **State management** : Objects maintain state that changes over time
2. **Encapsulation** : Objects hide their internal workings
3. **Inheritance** : Methods may be inherited from parent classes
4. **Polymorphism** : Different objects might respond differently to the same method calls
5. **Dependencies** : Objects often depend on other objects

## II. Unit Testing OOP Code

### The Pytest Framework

While Python's built-in `unittest` module works well, `pytest` has become the preferred testing framework due to its simplicity and powerful features.

```python
# Install pytest
# pip install pytest

# test_bank_account.py
import pytest
from bank_account import BankAccount

def test_new_account():
    account = BankAccount("John Doe")
    assert account.owner == "John Doe"
    assert account.balance == 0
  
def test_deposit():
    account = BankAccount("John Doe", 100)
    assert account.deposit(50) == 150
    assert account.balance == 150
  
def test_deposit_negative_amount():
    account = BankAccount("John Doe")
    with pytest.raises(ValueError):
        account.deposit(-50)
```

What's happening here:

* Each test function tests one specific behavior of the `BankAccount` class
* The `test_deposit_negative_amount` function tests that an exception is raised properly
* Each test starts with a fresh object, ensuring tests don't interfere with each other

### Test Fixtures

Test fixtures provide a way to set up preconditions for tests and reuse objects across multiple tests:

```python
import pytest
from bank_account import BankAccount

@pytest.fixture
def empty_account():
    """Returns a new empty bank account for John Doe."""
    return BankAccount("John Doe")

@pytest.fixture
def account_with_balance():
    """Returns a bank account with $100 balance."""
    return BankAccount("Jane Smith", 100)

def test_withdraw(account_with_balance):
    assert account_with_balance.withdraw(50) == 50
    assert account_with_balance.balance == 50
  
def test_withdraw_insufficient_funds(account_with_balance):
    with pytest.raises(ValueError, match="Insufficient funds"):
        account_with_balance.withdraw(200)
```

Benefits of fixtures:

* Reduces code repetition
* Makes tests cleaner and more focused on behavior
* Allows for complex setup that can be reused

### Testing Inheritance

When testing classes with inheritance, you must test both inherited behavior and specialized behavior:

```python
# bank_account.py
class SavingsAccount(BankAccount):
    def __init__(self, owner, balance=0, interest_rate=0.01):
        super().__init__(owner, balance)
        self.interest_rate = interest_rate
      
    def add_interest(self):
        interest = self.balance * self.interest_rate
        self.balance += interest
        return interest

# test_savings_account.py
import pytest
from bank_account import SavingsAccount

def test_inheritance():
    # Test that SavingsAccount inherits BankAccount behavior
    account = SavingsAccount("John Doe", 100)
    assert account.withdraw(50) == 50  # Inherited method
  
def test_specialized_behavior():
    # Test behavior specific to SavingsAccount
    account = SavingsAccount("Jane Smith", 100, interest_rate=0.05)
    interest = account.add_interest()
    assert interest == 5.0
    assert account.balance == 105.0
```

Here we're testing:

1. That inherited methods still work correctly
2. That specialized methods work as expected

## III. Mock Objects and Dependencies

### Why Mocking Matters in OOP

Objects rarely exist in isolation; they interact with other objects, databases, APIs, etc. Mocking helps isolate the component you're testing:

```python
# customer.py
class Customer:
    def __init__(self, name, email):
        self.name = name
        self.email = email

# notification.py
class EmailService:
    def send_email(self, to_address, subject, body):
        # Connect to SMTP server, send email, etc.
        # (actual implementation would be more complex)
        pass

# account_manager.py
class AccountManager:
    def __init__(self, email_service):
        self.email_service = email_service
  
    def create_account(self, customer):
        # Create account logic here
      
        # Send welcome email
        self.email_service.send_email(
            customer.email,
            "Welcome to our bank!",
            f"Dear {customer.name}, thank you for opening an account."
        )
        return True
```

Testing `AccountManager.create_account()` without mocking would send real emails during tests – not good!

### Using unittest.mock

Python's `unittest.mock` module provides tools for replacing real objects with mock objects:

```python
import unittest
from unittest.mock import Mock, MagicMock
from customer import Customer
from account_manager import AccountManager

def test_create_account():
    # Create a mock email service
    mock_email_service = Mock()
  
    # Create the system under test
    account_manager = AccountManager(mock_email_service)
  
    # Create a customer
    customer = Customer("John Doe", "john@example.com")
  
    # Call the method we're testing
    result = account_manager.create_account(customer)
  
    # Assert the method returned True
    assert result is True
  
    # Verify the email service was called with the right arguments
    mock_email_service.send_email.assert_called_once_with(
        "john@example.com",
        "Welcome to our bank!",
        "Dear John Doe, thank you for opening an account."
    )
```

Key concepts demonstrated:

* We created a mock `EmailService` object
* The mock records all method calls made to it
* We can verify the correct methods were called with correct arguments
* Our test doesn't send actual emails

### Testing Method Calls with Pytest-Mock

The `pytest-mock` plugin provides a fixture for easier mocking:

```python
# pip install pytest-mock

def test_create_account_with_pytest_mock(mocker):
    # Create mock email service
    mock_email_service = mocker.Mock()
  
    # Create the system under test
    account_manager = AccountManager(mock_email_service)
  
    # Create a customer
    customer = Customer("John Doe", "john@example.com")
  
    # Call the method we're testing
    result = account_manager.create_account(customer)
  
    # Assert the email was sent correctly
    mock_email_service.send_email.assert_called_once()
  
    # Get the arguments from the call
    call_args = mock_email_service.send_email.call_args
    assert call_args[0][0] == "john@example.com"  # First arg
    assert "Welcome" in call_args[0][1]  # Second arg (subject)
    assert "John Doe" in call_args[0][2]  # Third arg (body)
```

The `mocker` fixture simplifies creating and using mocks within pytest.

## IV. Test-Driven Development for OOP

### The TDD Cycle for OOP

Test-driven development follows a "Red-Green-Refactor" cycle:

1. Write a failing test for a new feature or behavior
2. Write the minimal code to make the test pass
3. Refactor both code and tests for clarity and efficiency

Let's see this in action by developing a `Transaction` class for our banking system:

```python
# First, write a failing test (RED)
def test_transaction_creation():
    transaction = Transaction(
        account_id="ACC123",
        amount=100,
        transaction_type="deposit"
    )
    assert transaction.account_id == "ACC123"
    assert transaction.amount == 100
    assert transaction.transaction_type == "deposit"
    assert transaction.timestamp is not None  # Ensures timestamp is set
```

The test will fail because the `Transaction` class doesn't exist yet. Next, we implement just enough code to make the test pass:

```python
# transaction.py (GREEN)
from datetime import datetime

class Transaction:
    def __init__(self, account_id, amount, transaction_type):
        self.account_id = account_id
        self.amount = amount
        self.transaction_type = transaction_type
        self.timestamp = datetime.now()
```

Now our test passes. We might then refactor to make the code better:

```python
# transaction.py (REFACTOR)
from datetime import datetime

class Transaction:
    VALID_TYPES = ["deposit", "withdrawal", "transfer"]
  
    def __init__(self, account_id, amount, transaction_type):
        if transaction_type not in self.VALID_TYPES:
            raise ValueError(f"Invalid transaction type. Must be one of {self.VALID_TYPES}")
      
        self.account_id = account_id
        self.amount = amount
        self.transaction_type = transaction_type
        self.timestamp = datetime.now()
```

This adds input validation. Now we need to update our tests to cover this behavior:

```python
def test_invalid_transaction_type():
    with pytest.raises(ValueError):
        Transaction(
            account_id="ACC123",
            amount=100,
            transaction_type="invalid_type"
        )
```

TDD ensures our objects behave correctly from the start and provides a safety net when making changes.

## V. Debugging OOP Code

### Common OOP Bugs

OOP code tends to have specific types of bugs:

1. **State-related bugs** : Object state doesn't update as expected
2. **Inheritance bugs** : Methods behave unexpectedly due to inheritance
3. **Dependency bugs** : Objects interact incorrectly with dependencies
4. **Initialization bugs** : Objects aren't properly initialized

### Using pdb - The Python Debugger

The Python Debugger (pdb) is a powerful tool for inspecting code during execution:

```python
import pdb

def debug_account():
    account = BankAccount("John", 100)
    pdb.set_trace()  # Execution stops here
    account.withdraw(50)
    account.deposit(25)
    return account.balance

# When run, this opens an interactive debugger
```

Common pdb commands:

* `n` (next): Execute the current line and move to the next
* `s` (step): Step into a function call
* `c` (continue): Continue execution until next breakpoint
* `p variable_name`: Print the value of a variable
* `pp object.__dict__`: Pretty-print an object's attributes

### Better Debugging with ipdb

The `ipdb` package enhances the standard debugger with IPython features:

```python
# pip install ipdb

import ipdb

def debug_complex_operation():
    account1 = BankAccount("John", 100)
    account2 = BankAccount("Jane", 200)
    ipdb.set_trace()
    # Transfer logic here
    amount = 50
    account1.withdraw(amount)
    account2.deposit(amount)
```

This gives you tab completion, syntax highlighting, and better inspection tools.

### Effective Print Debugging

Despite advanced tools, strategic print statements remain valuable:

```python
class BankAccount:
    # ...
  
    def withdraw(self, amount):
        print(f"Withdrawing {amount} from account with balance {self.balance}")
        if amount <= 0:
            print(f"Invalid withdrawal amount: {amount}")
            raise ValueError("Amount must be positive")
        if amount > self.balance:
            print(f"Insufficient funds: {amount} > {self.balance}")
            raise ValueError("Insufficient funds")
        self.balance -= amount
        print(f"New balance: {self.balance}")
        return self.balance
```

### Using Python's Logging Module

For more sophisticated debugging, logging is better than print statements:

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger('banking')

class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        logger.info(f"Created account for {owner} with ${balance}")
      
    def withdraw(self, amount):
        logger.debug(f"Attempting to withdraw ${amount}")
        if amount <= 0:
            logger.warning(f"Invalid withdrawal amount: ${amount}")
            raise ValueError("Amount must be positive")
        if amount > self.balance:
            logger.warning(f"Insufficient funds: ${amount} > ${self.balance}")
            raise ValueError("Insufficient funds")
        self.balance -= amount
        logger.info(f"Withdrew ${amount}, new balance: ${self.balance}")
        return self.balance
```

Benefits of logging:

* Can be configured to different levels (DEBUG, INFO, WARNING, ERROR)
* Can include timestamps and context
* Can be directed to files instead of the console
* Can be turned on/off without changing code

## VI. Testing Strategies for Complex OOP Systems

### Integration Testing

Integration tests verify that different objects work together correctly:

```python
def test_transfer_between_accounts():
    # Set up the test
    source = BankAccount("John", 100)
    destination = BankAccount("Jane", 50)
  
    # Create a transaction service that operates on accounts
    transaction_service = TransactionService()
  
    # Execute the transfer
    transaction_service.transfer(source, destination, 30)
  
    # Verify both accounts have the correct balance
    assert source.balance == 70
    assert destination.balance == 80
```

This test ensures that the `TransactionService` correctly modifies both accounts.

### Behavior-Driven Development (BDD)

BDD extends TDD by focusing on business requirements using natural language. The `pytest-bdd` plugin enables this:

```python
# features/account_transfer.feature
Feature: Account Transfers
  As a bank customer
  I want to transfer money between accounts
  So that I can manage my finances
  
  Scenario: Successful transfer between accounts
    Given I have an account with balance $100
    And another account with balance $50
    When I transfer $30 from the first to the second account
    Then the first account should have $70
    And the second account should have $80
```

```python
# test_transfer_bdd.py
from pytest_bdd import scenario, given, when, then
from banking import BankAccount, TransactionService

@scenario('features/account_transfer.feature', 'Successful transfer between accounts')
def test_transfer():
    pass

@given("I have an account with balance $100")
def first_account():
    return BankAccount("John", 100)

@given("another account with balance $50")
def second_account():
    return BankAccount("Jane", 50)

@when("I transfer $30 from the first to the second account")
def perform_transfer(first_account, second_account):
    service = TransactionService()
    service.transfer(first_account, second_account, 30)

@then("the first account should have $70")
def check_first_balance(first_account):
    assert first_account.balance == 70

@then("the second account should have $80")
def check_second_balance(second_account):
    assert second_account.balance == 80
```

BDD connects tests directly to requirements, making them accessible to non-programmers.

## VII. Advanced Testing Techniques

### Property-Based Testing

Property-based testing generates random inputs to find edge cases:

```python
# pip install hypothesis

from hypothesis import given, strategies as st

@given(owner=st.text(min_size=1), balance=st.integers(min_value=0, max_value=1000000))
def test_bank_account_properties(owner, balance):
    account = BankAccount(owner, balance)
  
    # Property 1: Depositing and withdrawing the same amount should result in the original balance
    original_balance = account.balance
    amount = min(100, account.balance)  # Ensure we can withdraw this amount
  
    if amount > 0:  # Skip test if amount would be 0
        account.deposit(amount)
        account.withdraw(amount)
        assert account.balance == original_balance
  
    # Property 2: Balance should never go negative after valid operations
    assert account.balance >= 0
```

Instead of testing specific scenarios, we test properties that should always hold true, with many random inputs.

### Testing Design Patterns

Design patterns need specific testing approaches. For example, testing a Singleton pattern:

```python
class DatabaseConnection:
    _instance = None
  
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance
  
    def initialize(self):
        self.connected = False
      
    def connect(self):
        # Connection logic here
        self.connected = True
      
    def disconnect(self):
        # Disconnection logic here
        self.connected = False

def test_singleton_pattern():
    # Get first instance
    db1 = DatabaseConnection()
    db1.connect()
    assert db1.connected is True
  
    # Get second instance - should be the same object
    db2 = DatabaseConnection()
    assert db2 is db1  # Both variables reference the same object
    assert db2.connected is True  # State is preserved
  
    # Changing one affects the other
    db1.disconnect()
    assert db2.connected is False
```

This test verifies the singleton guarantees that only one instance exists and state is shared.

## VIII. Debugging Complex OOP Systems

### Visualizing Object Relationships

For complex systems, visualizing object relationships helps:

```python
# pip install objgraph

import objgraph

def debug_relationships():
    account = BankAccount("John", 100)
    transaction_service = TransactionService()
    transaction_service.register_account(account)
  
    # Visualize connections between objects
    objgraph.show_refs([account, transaction_service], 
                       filename='account_relationships.png')
```

This creates a graphical representation of how objects reference each other.

### Memory Profiling

Memory leaks are common in complex OOP systems. The `memory_profiler` helps identify them:

```python
# pip install memory_profiler

@profile
def test_memory_usage():
    accounts = []
    for i in range(1000):
        # Create accounts and perform operations
        account = BankAccount(f"Customer {i}", i * 100)
        account.deposit(50)
        account.withdraw(25)
        accounts.append(account)
  
    # Clear unused accounts
    accounts = accounts[:10]
  
    # More operations here
```

Running this with `python -m memory_profiler script.py` shows memory usage line by line.

## IX. Best Practices for OOP Testing and Debugging

### 1. Test at the Right Level

* **Unit tests** : Test individual classes in isolation
* **Integration tests** : Test interactions between classes
* **System tests** : Test the complete system

### 2. Structure Tests Like Your Code

Mirror your package structure in your tests:

```
my_banking_app/
├── banking/
│   ├── __init__.py
│   ├── account.py
│   ├── transaction.py
│   └── service.py
└── tests/
    ├── __init__.py
    ├── test_account.py
    ├── test_transaction.py
    └── test_service.py
```

### 3. Use Test Helpers

Create helper methods for common test operations:

```python
def create_test_accounts(count=1, base_balance=100):
    """Create test accounts with specified balances."""
    return [BankAccount(f"Test User {i}", base_balance * i) 
            for i in range(1, count + 1)]

def verify_transaction_outcome(account, original_balance, expected_change):
    """Verify an account's balance has changed as expected."""
    assert account.balance == original_balance + expected_change
```

### 4. Test Edge Cases

Always test boundary conditions and edge cases:

```python
def test_edge_cases():
    account = BankAccount("Edge Case User", 100)
  
    # Edge case: Withdraw exactly all money
    assert account.withdraw(100) == 0
    assert account.balance == 0
  
    # Edge case: Deposit to empty account
    assert account.deposit(0.01) == 0.01
    assert account.balance == 0.01
  
    # Edge case: Very large numbers
    large_amount = 1_000_000_000
    account.deposit(large_amount)
    assert account.balance == large_amount + 0.01
```

### 5. Use Test Coverage Tools

Code coverage tools show which parts of your code are tested:

```
# pip install pytest-cov

# Run tests with coverage report
pytest --cov=banking tests/
```

This generates a report showing which lines of code were executed during tests.

## X. Practical Example: Testing a Banking System

Let's pull everything together with a more complete example:

```python
# banking/account.py
class Account:
    def __init__(self, account_id, owner_name, balance=0):
        self.account_id = account_id
        self.owner_name = owner_name
        self.balance = balance
        self.is_active = True
        self.transactions = []
  
    def deposit(self, amount):
        if not self.is_active:
            raise ValueError("Account is inactive")
        if amount <= 0:
            raise ValueError("Amount must be positive")
      
        self.balance += amount
        self.transactions.append({
            "type": "deposit",
            "amount": amount,
            "balance_after": self.balance
        })
        return self.balance
  
    def withdraw(self, amount):
        if not self.is_active:
            raise ValueError("Account is inactive")
        if amount <= 0:
            raise ValueError("Amount must be positive")
        if amount > self.balance:
            raise ValueError("Insufficient funds")
      
        self.balance -= amount
        self.transactions.append({
            "type": "withdrawal",
            "amount": amount,
            "balance_after": self.balance
        })
        return self.balance
  
    def deactivate(self):
        if self.balance > 0:
            raise ValueError("Cannot deactivate account with positive balance")
        self.is_active = False
```

```python
# banking/service.py
class AccountService:
    def __init__(self, account_repository):
        self.repository = account_repository
  
    def transfer(self, source_id, destination_id, amount):
        source = self.repository.get_account(source_id)
        destination = self.repository.get_account(destination_id)
      
        if not source or not destination:
            raise ValueError("Both accounts must exist")
      
        # Withdraw from source
        source.withdraw(amount)
      
        try:
            # Deposit to destination
            destination.deposit(amount)
        except Exception as e:
            # Rollback if deposit fails
            source.deposit(amount)
            raise e
      
        # Record the transfer
        source.transactions.append({
            "type": "transfer_out",
            "amount": amount,
            "destination": destination_id
        })
      
        destination.transactions.append({
            "type": "transfer_in",
            "amount": amount,
            "source": source_id
        })
      
        # Save changes
        self.repository.update_account(source)
        self.repository.update_account(destination)
      
        return True
```

Now let's write comprehensive tests for this system:

```python
# tests/test_account.py
import pytest
from banking.account import Account

class TestAccount:
    @pytest.fixture
    def account(self):
        return Account("ACC123", "Test User", 100)
  
    def test_initialization(self):
        account = Account("ACC456", "New User", 50)
        assert account.account_id == "ACC456"
        assert account.owner_name == "New User"
        assert account.balance == 50
        assert account.is_active is True
        assert len(account.transactions) == 0
  
    def test_deposit(self, account):
        # Test basic deposit
        assert account.deposit(50) == 150
        assert account.balance == 150
      
        # Verify transaction was recorded
        assert len(account.transactions) == 1
        assert account.transactions[0]["type"] == "deposit"
        assert account.transactions[0]["amount"] == 50
        assert account.transactions[0]["balance_after"] == 150
  
    def test_deposit_negative(self, account):
        with pytest.raises(ValueError, match="Amount must be positive"):
            account.deposit(-10)
  
    def test_withdraw(self, account):
        # Test basic withdrawal
        assert account.withdraw(30) == 70
        assert account.balance == 70
      
        # Verify transaction was recorded
        assert len(account.transactions) == 1
        assert account.transactions[0]["type"] == "withdrawal"
        assert account.transactions[0]["amount"] == 30
        assert account.transactions[0]["balance_after"] == 70
  
    def test_withdraw_insufficient(self, account):
        with pytest.raises(ValueError, match="Insufficient funds"):
            account.withdraw(200)
  
    def test_deactivate(self, account):
        # Cannot deactivate with balance
        with pytest.raises(ValueError, match="Cannot deactivate account with positive balance"):
            account.deactivate()
      
        # Withdraw all money and then deactivate
        account.withdraw(100)
        account.deactivate()
        assert account.is_active is False
      
        # Cannot deposit to inactive account
        with pytest.raises(ValueError, match="Account is inactive"):
            account.deposit(50)
```

```python
# tests/test_service.py
import pytest
from unittest.mock import Mock
from banking.account import Account
from banking.service import AccountService

class TestAccountService:
    @pytest.fixture
    def mock_repository(self):
        repository = Mock()
      
        # Create mock accounts
        source = Account("SRC001", "Source User", 100)
        destination = Account("DST001", "Destination User", 50)
      
        # Configure repository to return these accounts
        repository.get_account.side_effect = lambda id: {
            "SRC001": source,
            "DST001": destination
        }.get(id)
      
        return repository
  
    @pytest.fixture
    def account_service(self, mock_repository):
        return AccountService(mock_repository)
  
    def test_transfer_success(self, account_service, mock_repository):
        # Perform the transfer
        result = account_service.transfer("SRC001", "DST001", 30)
      
        # Verify the transfer was successful
        assert result is True
      
        # Get the accounts from the repository
        source = mock_repository.get_account("SRC001")
        destination = mock_repository.get_account("DST001")
      
        # Verify balances
        assert source.balance == 70
        assert destination.balance == 80
      
        # Verify transactions were recorded
        assert any(t["type"] == "transfer_out" for t in source.transactions)
        assert any(t["type"] == "transfer_in" for t in destination.transactions)
      
        # Verify repository was updated
        mock_repository.update_account.assert_any_call(source)
        mock_repository.update_account.assert_any_call(destination)
  
    def test_transfer_insufficient_funds(self, account_service):
        # Try to transfer more than available
        with pytest.raises(ValueError, match="Insufficient funds"):
            account_service.transfer("SRC001", "DST001", 200)
  
    def test_transfer_nonexistent_account(self, account_service):
        with pytest.raises(ValueError, match="Both accounts must exist"):
            account_service.transfer("SRC001", "NONEXISTENT", 30)
```

This comprehensive testing approach:

1. Tests each class in isolation (unit tests)
2. Tests the interactions between classes (integration tests)
3. Tests edge cases and error conditions
4. Uses mocks to isolate components
5. Tests transaction integrity

## Conclusion

Testing and debugging OOP code in Python requires a holistic approach. We've covered a wide range of techniques:

1. **Unit testing** with pytest
2. **Mock objects** for isolating components
3. **Test-driven development** for building reliable objects
4. **Debugging tools** like pdb, logging, and memory profilers
5. **Advanced techniques** like property-based testing
6. **Best practices** for structuring and organizing tests

By applying these techniques systematically, you can build robust, maintainable object-oriented Python applications that are easier to debug when issues inevitably arise.

Remember that testing is an investment: time spent writing good tests pays off many times over by preventing bugs, facilitating refactoring, and providing documentation of expected behavior.
