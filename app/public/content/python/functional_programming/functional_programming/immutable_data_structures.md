# Immutable Data Structures in Python Functional Programming

Let me take you on a journey through one of the most fundamental concepts in functional programming. We'll start from the very beginning and build our understanding step by step.

## Understanding Mutability: The Foundation

Before we dive into immutable data structures, we need to understand what mutability means at its core. Think of mutability like a piece of clay that you can reshape over and over again.

```python
# Mutable example - we can change the original object
my_list = [1, 2, 3]
print(f"Original: {my_list}")  # [1, 2, 3]

# We modify the same object in memory
my_list.append(4)
print(f"After append: {my_list}")  # [1, 2, 3, 4]

# The object's identity remains the same, but its contents changed
print(f"Same object? {id(my_list)}")  # Same memory address
```

In this example, `my_list` is like a container that we can add or remove things from. The container itself stays the same, but its contents change.

> **Key Insight** : Mutable objects can be changed after creation without creating a new object. This means the object's identity (memory location) stays the same, but its state changes.

Now let's contrast this with immutability:

```python
# Immutable example - we cannot change the original
my_tuple = (1, 2, 3)
print(f"Original: {my_tuple}")  # (1, 2, 3)

# We cannot modify a tuple - this would raise an error:
# my_tuple.append(4)  # AttributeError: 'tuple' object has no attribute 'append'

# Instead, we must create a new tuple
new_tuple = my_tuple + (4,)
print(f"Original unchanged: {my_tuple}")  # (1, 2, 3)
print(f"New tuple: {new_tuple}")  # (1, 2, 3, 4)
print(f"Different objects? {id(my_tuple) != id(new_tuple)}")  # True
```

> **Fundamental Principle** : Immutable objects cannot be changed after creation. Any "modification" operation creates a new object entirely.

## The Philosophy Behind Immutability in Functional Programming

Functional programming is built on mathematical foundations where functions should behave like mathematical functions. In mathematics, when you have a function f(x) = x + 1, calling f(3) always returns 4, no matter how many times you call it or when you call it.

```python
# Mathematical function behavior - pure and predictable
def add_one(x):
    return x + 1

result1 = add_one(5)  # Always 6
result2 = add_one(5)  # Always 6, same input = same output
```

But when we introduce mutable state, we break this mathematical purity:

```python
# Impure function - behavior depends on external mutable state
counter = [0]  # Mutable list acting as counter

def impure_add_one(x):
    counter[0] += 1  # Modifying external state
    return x + counter[0]

result1 = impure_add_one(5)  # Returns 6 (5 + 1)
result2 = impure_add_one(5)  # Returns 7 (5 + 2) - different result!
```

> **Core Principle** : Immutability helps maintain referential transparency - the property that a function call can be replaced with its result value without changing the program's behavior.

## Python's Built-in Immutable Types

Python provides several immutable types that form the foundation of functional programming patterns. Let's explore each one with practical examples.

### Numbers, Strings, and Booleans

These are the simplest immutable types:

```python
# Numbers are immutable
x = 42
original_id = id(x)
x += 1  # This creates a new integer object
print(f"Original ID: {original_id}")
print(f"New ID: {id(x)}")  # Different memory location
print(f"Value: {x}")  # 43

# Strings are immutable
text = "Hello"
original_text_id = id(text)
text += " World"  # Creates a new string object
print(f"Different string object? {id(text) != original_text_id}")  # True
```

> **Important Detail** : Even simple operations like `x += 1` create new objects for immutable types. Python optimizes small integers by caching them, but the principle remains the same.

### Tuples: The Immutable Sequence

Tuples are perhaps the most commonly used immutable collection in Python:

```python
# Creating and working with tuples
coordinates = (10, 20)
print(f"X: {coordinates[0]}, Y: {coordinates[1]}")

# Tuples can hold mixed types
person = ("Alice", 30, True)  # name, age, is_employed
name, age, employed = person  # Tuple unpacking

# Nested tuples for complex data
point_3d = (10, 20, (5, 15))  # x, y, and (z_min, z_max)
x, y, z_range = point_3d
print(f"Z range: {z_range[0]} to {z_range[1]}")
```

Here's a practical example of using tuples to represent immutable data:

```python
# Representing a bank transaction as an immutable tuple
def create_transaction(account_id, amount, transaction_type):
    """Create an immutable transaction record."""
    from datetime import datetime
    return (
        account_id,           # Account identifier
        amount,              # Transaction amount
        transaction_type,    # 'deposit' or 'withdrawal'
        datetime.now(),      # Timestamp
        hash((account_id, amount, transaction_type))  # Transaction ID
    )

# Create some transactions
deposit = create_transaction("ACC123", 100.50, "deposit")
withdrawal = create_transaction("ACC123", 25.00, "withdrawal")

# Once created, these cannot be modified
print(f"Deposit: {deposit}")
# deposit[1] = 200  # This would raise: TypeError: 'tuple' object does not support item assignment
```

### Frozensets: Immutable Collections of Unique Items

Frozensets are the immutable version of sets:

```python
# Creating frozensets
skills = frozenset(['Python', 'JavaScript', 'SQL'])
languages = frozenset(['English', 'Spanish', 'French'])

# Frozensets support set operations
new_skills = skills | frozenset(['React'])  # Union - creates new frozenset
print(f"Original skills: {skills}")
print(f"Extended skills: {new_skills}")

# Practical example: representing user permissions
admin_permissions = frozenset(['read', 'write', 'delete', 'admin'])
user_permissions = frozenset(['read', 'write'])

def has_permission(user_perms, required_perm):
    """Check if user has required permission."""
    return required_perm in user_perms

def grant_permission(user_perms, new_perm):
    """Grant a new permission - returns new frozenset."""
    return user_perms | frozenset([new_perm])

# Usage
print(f"Can delete? {has_permission(user_permissions, 'delete')}")  # False
elevated_perms = grant_permission(user_permissions, 'delete')
print(f"Original unchanged: {user_permissions}")
print(f"New permissions: {elevated_perms}")
```

## Building Custom Immutable Data Structures

While Python's built-in immutable types are useful, real-world applications often need custom data structures. Let's build them from first principles.

### Named Tuples: Structured Immutable Data

Named tuples provide a way to create simple immutable classes:

```python
from collections import namedtuple

# Define an immutable Point class
Point = namedtuple('Point', ['x', 'y'])

# Create instances
origin = Point(0, 0)
center = Point(10, 15)

# Access fields by name or index
print(f"Center X: {center.x}")      # By name
print(f"Center Y: {center[1]}")     # By index

# Immutable - cannot change values
# center.x = 20  # Would raise: AttributeError: can't set attribute

# Create new instances for "modifications"
def move_point(point, dx, dy):
    """Move a point by creating a new Point instance."""
    return Point(point.x + dx, point.y + dy)

new_center = move_point(center, 5, -3)
print(f"Original: {center}")     # Point(x=10, y=15)
print(f"Moved: {new_center}")    # Point(x=15, y=12)
```

Let's create a more complex example with a bank account:

```python
from collections import namedtuple
from typing import List

# Define immutable transaction and account structures
Transaction = namedtuple('Transaction', ['amount', 'description', 'timestamp'])
Account = namedtuple('Account', ['account_id', 'balance', 'transactions'])

def create_account(account_id, initial_balance=0):
    """Create a new account with initial balance."""
    from datetime import datetime
    initial_transaction = Transaction(
        initial_balance, 
        "Initial deposit", 
        datetime.now()
    )
    return Account(account_id, initial_balance, (initial_transaction,))

def add_transaction(account, amount, description):
    """Add a transaction to an account - returns new account."""
    from datetime import datetime
  
    new_transaction = Transaction(amount, description, datetime.now())
    new_balance = account.balance + amount
    new_transactions = account.transactions + (new_transaction,)
  
    return Account(account.account_id, new_balance, new_transactions)

# Usage example
my_account = create_account("ACC001", 1000)
print(f"Initial account: {my_account.balance}")

# Make some transactions
my_account = add_transaction(my_account, -50, "Coffee purchase")
my_account = add_transaction(my_account, 200, "Salary deposit")

print(f"Final balance: {my_account.balance}")
print(f"Transaction count: {len(my_account.transactions)}")
```

> **Design Pattern** : Notice how each "modification" returns a new object rather than changing the existing one. This is the fundamental pattern of working with immutable data.

### Data Classes with Frozen=True

Python 3.7 introduced data classes, which can be made immutable:

```python
from dataclasses import dataclass
from typing import Tuple

@dataclass(frozen=True)
class ImmutablePerson:
    """An immutable person data structure."""
    name: str
    age: int
    email: str
  
    def celebrate_birthday(self):
        """Return a new person with incremented age."""
        # We must create a new instance since this one is frozen
        return ImmutablePerson(self.name, self.age + 1, self.email)
  
    def update_email(self, new_email: str):
        """Return a new person with updated email."""
        return ImmutablePerson(self.name, self.age, new_email)

# Create and use immutable person
alice = ImmutablePerson("Alice Johnson", 28, "alice@email.com")
print(f"Original: {alice}")

# Cannot modify directly
# alice.age = 29  # Would raise: dataclasses.FrozenInstanceError

# Must create new instances for changes
older_alice = alice.celebrate_birthday()
print(f"After birthday: {older_alice}")
print(f"Original unchanged: {alice}")
```

Here's a more sophisticated example with nested immutable structures:

```python
from dataclasses import dataclass
from typing import Tuple, Optional

@dataclass(frozen=True)
class Address:
    """Immutable address structure."""
    street: str
    city: str
    state: str
    zip_code: str

@dataclass(frozen=True)
class Employee:
    """Immutable employee with nested address."""
    employee_id: str
    name: str
    address: Address
    salary: float
  
    def relocate(self, new_address: Address):
        """Create new employee with different address."""
        return Employee(
            self.employee_id,
            self.name,
            new_address,
            self.salary
        )
  
    def give_raise(self, percentage: float):
        """Create new employee with salary increase."""
        new_salary = self.salary * (1 + percentage / 100)
        return Employee(
            self.employee_id,
            self.name,
            self.address,
            new_salary
        )

# Usage
home_address = Address("123 Main St", "Springfield", "IL", "62701")
bob = Employee("EMP001", "Bob Smith", home_address, 50000)

# Move to new address
new_address = Address("456 Oak Ave", "Chicago", "IL", "60601")
relocated_bob = bob.relocate(new_address)

# Give a raise
promoted_bob = relocated_bob.give_raise(10)  # 10% raise

print(f"Original Bob: {bob.salary}, {bob.address.city}")
print(f"Promoted Bob: {promoted_bob.salary}, {promoted_bob.address.city}")
```

## Working with Immutable Collections: Advanced Patterns

### Functional Operations on Immutable Data

When working with immutable data structures, we rely heavily on functional programming operations that create new collections rather than modifying existing ones:

```python
# Starting with an immutable list of transactions
transactions = (
    ("2024-01-01", "Coffee", -4.50),
    ("2024-01-02", "Salary", 2500.00),
    ("2024-01-03", "Groceries", -85.30),
    ("2024-01-04", "Gas", -45.00),
    ("2024-01-05", "Dividend", 15.75)
)

# Filter transactions (creates new tuple)
def filter_transactions(trans_list, predicate):
    """Filter transactions based on predicate function."""
    return tuple(trans for trans in trans_list if predicate(trans))

# Get only expenses (negative amounts)
expenses = filter_transactions(transactions, lambda t: t[2] < 0)
print(f"Expenses: {expenses}")

# Transform transactions (creates new tuple with transformed data)
def transform_transactions(trans_list, transformer):
    """Transform each transaction using transformer function."""
    return tuple(transformer(trans) for trans in trans_list)

# Convert to absolute values for reporting
abs_amounts = transform_transactions(
    transactions, 
    lambda t: (t[0], t[1], abs(t[2]))
)
print(f"Absolute amounts: {abs_amounts}")

# Reduce transactions to total balance
def calculate_balance(trans_list):
    """Calculate total balance from transactions."""
    return sum(trans[2] for trans in trans_list)

total_balance = calculate_balance(transactions)
print(f"Total balance: ${total_balance:.2f}")
```

### Building Immutable Trees and Nested Structures

Tree structures are common in functional programming. Here's how to build them immutably:

```python
from dataclasses import dataclass
from typing import Optional, Tuple

@dataclass(frozen=True)
class TreeNode:
    """Immutable binary tree node."""
    value: int
    left: Optional['TreeNode'] = None
    right: Optional['TreeNode'] = None
  
    def insert(self, new_value: int) -> 'TreeNode':
        """Insert a value, returning a new tree with the value added."""
        if new_value < self.value:
            # Insert to the left
            new_left = self.left.insert(new_value) if self.left else TreeNode(new_value)
            return TreeNode(self.value, new_left, self.right)
        elif new_value > self.value:
            # Insert to the right
            new_right = self.right.insert(new_value) if self.right else TreeNode(new_value)
            return TreeNode(self.value, self.left, new_right)
        else:
            # Value already exists, return unchanged tree
            return self
  
    def contains(self, search_value: int) -> bool:
        """Check if tree contains a value."""
        if search_value == self.value:
            return True
        elif search_value < self.value and self.left:
            return self.left.contains(search_value)
        elif search_value > self.value and self.right:
            return self.right.contains(search_value)
        else:
            return False
  
    def to_list(self) -> Tuple[int, ...]:
        """Convert tree to sorted tuple (in-order traversal)."""
        left_values = self.left.to_list() if self.left else ()
        right_values = self.right.to_list() if self.right else ()
        return left_values + (self.value,) + right_values

# Build a tree immutably
root = TreeNode(10)
tree = root.insert(5).insert(15).insert(3).insert(7).insert(12).insert(18)

print(f"Tree contains 7: {tree.contains(7)}")  # True
print(f"Tree contains 9: {tree.contains(9)}")  # False
print(f"Sorted values: {tree.to_list()}")      # (3, 5, 7, 10, 12, 15, 18)

# Original root is unchanged
print(f"Original root value: {root.value}")
print(f"Original has children: {root.left is not None or root.right is not None}")  # False
```

> **Structural Sharing** : Notice how immutable data structures can share parts of their structure. When we insert into the tree, we only create new nodes along the path of insertion, reusing existing subtrees.

## Immutable Libraries and Tools

Python's ecosystem provides powerful libraries for working with immutable data structures at scale.

### Using `pyrsistent` for Rich Immutable Collections

```python
# Note: This requires 'pip install pyrsistent'
from pyrsistent import pvector, pmap, pset

# Persistent Vector (like an immutable list)
numbers = pvector([1, 2, 3, 4])
new_numbers = numbers.append(5).extend([6, 7])

print(f"Original: {numbers}")      # pvector([1, 2, 3, 4])
print(f"Extended: {new_numbers}")  # pvector([1, 2, 3, 4, 5, 6, 7])

# Persistent Map (like an immutable dictionary)
person = pmap({'name': 'Alice', 'age': 30, 'city': 'New York'})
updated_person = person.set('age', 31).set('city', 'San Francisco')

print(f"Original: {person}")
print(f"Updated: {updated_person}")

# Efficient updates with multiple changes
batch_update = person.update({'age': 32, 'job': 'Engineer'})
print(f"Batch updated: {batch_update}")
```

### Building a Complete Immutable System

Let's create a complete example that demonstrates immutable data structures in a real-world scenario:

```python
from dataclasses import dataclass
from typing import Tuple, Optional
from datetime import datetime

@dataclass(frozen=True)
class Product:
    """Immutable product representation."""
    id: str
    name: str
    price: float
    category: str

@dataclass(frozen=True)
class CartItem:
    """Immutable cart item."""
    product: Product
    quantity: int
  
    @property
    def total_price(self) -> float:
        return self.product.price * self.quantity

@dataclass(frozen=True)
class ShoppingCart:
    """Immutable shopping cart."""
    items: Tuple[CartItem, ...]
    customer_id: str
    created_at: datetime
  
    def add_item(self, product: Product, quantity: int = 1) -> 'ShoppingCart':
        """Add item to cart, returning new cart."""
        # Check if product already exists
        for i, item in enumerate(self.items):
            if item.product.id == product.id:
                # Update existing item quantity
                updated_item = CartItem(product, item.quantity + quantity)
                new_items = self.items[:i] + (updated_item,) + self.items[i+1:]
                return ShoppingCart(new_items, self.customer_id, self.created_at)
      
        # Add new item
        new_item = CartItem(product, quantity)
        new_items = self.items + (new_item,)
        return ShoppingCart(new_items, self.customer_id, self.created_at)
  
    def remove_item(self, product_id: str) -> 'ShoppingCart':
        """Remove item from cart, returning new cart."""
        new_items = tuple(item for item in self.items if item.product.id != product_id)
        return ShoppingCart(new_items, self.customer_id, self.created_at)
  
    def update_quantity(self, product_id: str, new_quantity: int) -> 'ShoppingCart':
        """Update item quantity, returning new cart."""
        if new_quantity <= 0:
            return self.remove_item(product_id)
      
        new_items = tuple(
            CartItem(item.product, new_quantity) if item.product.id == product_id else item
            for item in self.items
        )
        return ShoppingCart(new_items, self.customer_id, self.created_at)
  
    @property
    def total_amount(self) -> float:
        """Calculate total cart amount."""
        return sum(item.total_price for item in self.items)
  
    @property
    def item_count(self) -> int:
        """Get total number of items."""
        return sum(item.quantity for item in self.items)

# Usage example
laptop = Product("LAPTOP001", "Gaming Laptop", 1299.99, "Electronics")
mouse = Product("MOUSE001", "Wireless Mouse", 49.99, "Electronics")
book = Product("BOOK001", "Python Guide", 39.99, "Books")

# Create empty cart
empty_cart = ShoppingCart((), "CUSTOMER123", datetime.now())

# Build cart through immutable operations
cart = (empty_cart
        .add_item(laptop, 1)
        .add_item(mouse, 2)
        .add_item(book, 1))

print(f"Items in cart: {cart.item_count}")
print(f"Total amount: ${cart.total_amount:.2f}")

# Update quantities
updated_cart = cart.update_quantity("MOUSE001", 1)  # Reduce mouse quantity
print(f"After update: ${updated_cart.total_amount:.2f}")

# Original cart unchanged
print(f"Original cart total: ${cart.total_amount:.2f}")
```

## Benefits and Trade-offs of Immutable Data Structures

### Benefits That Transform Your Code

> **Predictability and Debugging** : When data cannot change unexpectedly, debugging becomes much easier. You know that once a value is created, it stays the same throughout its lifetime.

```python
# With mutable data - hard to track changes
user_scores = [85, 92, 78]
def process_scores(scores):
    # This function might modify the input
    scores.append(95)  # Surprise side effect!
    return sum(scores) / len(scores)

average = process_scores(user_scores)
print(f"Scores after processing: {user_scores}")  # Modified unexpectedly!

# With immutable data - predictable behavior
user_scores_immutable = (85, 92, 78)
def process_scores_immutable(scores):
    # Cannot modify input, must be explicit about changes
    extended_scores = scores + (95,)
    return sum(extended_scores) / len(extended_scores)

average = process_scores_immutable(user_scores_immutable)
print(f"Original scores unchanged: {user_scores_immutable}")  # Guaranteed unchanged
```

> **Thread Safety** : Immutable objects are inherently thread-safe since no thread can modify them.

### Performance Considerations

While immutable data structures offer many benefits, they do come with performance trade-offs:

```python
# Demonstrating the copy cost
import time

# Mutable approach - efficient for many modifications
def mutable_approach():
    result = []
    for i in range(10000):
        result.append(i)
    return result

# Immutable approach - less efficient for many sequential modifications
def immutable_approach():
    result = ()
    for i in range(10000):
        result = result + (i,)  # Creates new tuple each time
    return result

# Time both approaches
start = time.time()
mutable_result = mutable_approach()
mutable_time = time.time() - start

start = time.time()
immutable_result = immutable_approach()
immutable_time = time.time() - start

print(f"Mutable approach: {mutable_time:.4f} seconds")
print(f"Immutable approach: {immutable_time:.4f} seconds")
```

> **Performance Insight** : The immutable approach is much slower for building large collections incrementally. This is why functional languages often provide persistent data structures that share structure efficiently.

### When to Use Immutable Data Structures

Use immutable data structures when:

1. **Data represents values rather than entities** : Configuration settings, mathematical coordinates, or any data that conceptually shouldn't change.
2. **You need predictable behavior** : When functions should not have side effects and you want to guarantee that input data remains unchanged.
3. **Working with concurrent code** : When multiple threads need to access the same data safely.
4. **Building functional pipelines** : When chaining operations where each step produces a new version of the data.

```python
# Perfect use case: configuration processing pipeline
@dataclass(frozen=True)
class Config:
    database_url: str
    debug_mode: bool
    max_connections: int
  
    def enable_debug(self):
        return Config(self.database_url, True, self.max_connections)
  
    def set_max_connections(self, count):
        return Config(self.database_url, self.debug_mode, count)

# Configuration pipeline
base_config = Config("postgresql://localhost/mydb", False, 10)
dev_config = (base_config
              .enable_debug()
              .set_max_connections(5))

print(f"Production config: {base_config}")
print(f"Development config: {dev_config}")
```

Understanding immutable data structures from these first principles gives you a powerful tool for writing more predictable, maintainable, and safer code. While they require a shift in thinking from the traditional mutable approach, the benefits in code reliability and reasoning are substantial, especially as your programs grow in complexity.

The key is to start small, practice with simple examples like we've covered, and gradually apply these concepts to larger systems. Remember that immutability is not about making programming harder—it's about making the hard parts of programming more manageable.
