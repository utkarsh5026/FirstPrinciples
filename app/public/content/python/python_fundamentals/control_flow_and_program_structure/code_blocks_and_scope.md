# Code Blocks and Scope: Understanding Python's Variable Visibility

Let's start from the very beginning and build up to Python's sophisticated scope system.

## What is "Scope" and Why Does It Matter?

Before we dive into Python specifics, let's understand the fundamental problem that "scope" solves:

Imagine you're writing a large program with thousands of lines of code. You want to use a variable called `count` in multiple places. Without scope rules, every `count` variable would interfere with every other `count` variable - chaos!

```python
# Without proper scope (this would be a nightmare):
count = 0  # Which count is this?
def process_data():
    count = 10  # Does this change the first count?
    # ... more code ...
    count = count + 1  # Which count are we modifying?
```

**Scope** is the programming concept that determines  **where in your code a variable can be "seen" and modified** . It's like having different rooms in a house - what happens in the kitchen doesn't automatically affect what's in the bedroom.

## Python's Approach: The LEGB Rule

Python solves the scope problem with a clear hierarchy called the  **LEGB Rule** :

> **L**ocal → **E**nclosing → **G**lobal → **B**uilt-in
>
> When Python looks for a variable, it searches in this exact order and stops at the first match it finds.

Let's build this understanding step by step.

## 1. Local Scope: The Function's Private Space

**Local scope** is the most immediate, private space where a function keeps its variables.

```python
def calculate_tax(income):
    # These variables exist ONLY inside this function
    tax_rate = 0.25  # Local variable
    tax_owed = income * tax_rate  # Local variable
  
    print(f"Income: {income}")  # income is also local (parameter)
    print(f"Tax rate: {tax_rate}")
    print(f"Tax owed: {tax_owed}")
  
    return tax_owed

# Try to access local variables from outside - this will fail!
calculate_tax(50000)
# print(tax_rate)  # NameError: name 'tax_rate' is not defined
```

### Visual Representation:

```
Global Space
│
├── calculate_tax (function object)
│
└── When calculate_tax() runs:
    │
    ┌─────────────────────────┐
    │   Local Scope Box       │
    │   ┌─────────────────┐   │
    │   │ income = 50000  │   │
    │   │ tax_rate = 0.25 │   │
    │   │ tax_owed = 12500│   │
    │   └─────────────────┘   │
    └─────────────────────────┘
```

> **Key Mental Model** : Each function call creates a new, temporary "box" that gets destroyed when the function finishes. Variables inside this box are invisible to the outside world.

## 2. Global Scope: The Module's Shared Space

**Global scope** contains variables that can be accessed from anywhere in your Python file (module).

```python
# Global variables - available everywhere in this file
company_name = "Tech Solutions Inc"
employee_count = 150

def hire_employee(new_employee_name):
    # Local variable
    welcome_message = f"Welcome to {company_name}, {new_employee_name}!"
  
    # We can READ global variables easily
    print(f"We now have {employee_count} employees")
  
    return welcome_message

def print_company_info():
    # Different function, same global access
    print(f"Company: {company_name}")
    print(f"Size: {employee_count} employees")

# Both functions can access the global variables
hire_employee("Alice")
print_company_info()
```

### Modifying Global Variables: The `global` Keyword

Here's a crucial point that trips up many beginners:

```python
counter = 0  # Global variable

def increment_wrong():
    # This creates a NEW local variable, doesn't modify global!
    counter = counter + 1  # UnboundLocalError!

def increment_right():
    global counter  # Tell Python: "I want the global counter"
    counter = counter + 1  # Now this works!

# This demonstrates the difference:
print(f"Initial counter: {counter}")

# increment_wrong()  # This would crash!

increment_right()
print(f"After increment: {counter}")  # Shows 1
```

> **Common Pitfall** : If you assign to a variable name inside a function, Python assumes you want a local variable UNLESS you use the `global` keyword. This is a safety feature to prevent accidental global modifications.

## 3. The LEGB Rule in Action

Let's see all levels working together:

```python
# BUILT-IN: Python's pre-defined functions (like len, print, etc.)
# These are always available

# GLOBAL level
company_name = "Global Corp"  # Global variable
employee_id = 1001

def create_department(dept_name):
    # ENCLOSING level starts here
    department_budget = 100000  # Enclosing variable
    employee_id = 2001  # This shadows the global employee_id
  
    def hire_employee(name, salary):
        # LOCAL level - innermost function
        employee_record = f"{name} (ID: {employee_id})"  # Uses enclosing employee_id
        remaining_budget = department_budget - salary    # Uses enclosing variable
      
        # Can access global company_name
        full_record = f"{company_name} - {dept_name}: {employee_record}"
      
        print(f"Hired: {full_record}")
        print(f"Salary: ${salary}")
        print(f"Remaining budget: ${remaining_budget}")
      
        return employee_record
  
    return hire_employee  # Return the inner function

# Create a hiring function for the Engineering department
engineering_hiring = create_department("Engineering")

# Use it to hire someone
engineering_hiring("Bob Smith", 75000)
```

### LEGB Search Visualization:

```
When Python looks for 'employee_id' in hire_employee():

Step 1: LOCAL scope
        ┌─────────────────────────┐
        │ hire_employee()         │
        │ ┌─────────────────────┐ │
        │ │ employee_record = ? │ │  ← 'employee_id' not found here
        │ │ remaining_budget = ?│ │
        │ └─────────────────────┘ │
        └─────────────────────────┘
                    ↓
Step 2: ENCLOSING scope  
        ┌─────────────────────────┐
        │ create_department()     │
        │ ┌─────────────────────┐ │
        │ │ employee_id = 2001  │ │  ← FOUND! Use this value
        │ │ department_budget=? │ │
        │ └─────────────────────┘ │
        └─────────────────────────┘
                    ↓
Step 3: GLOBAL scope (skipped - already found)
Step 4: BUILT-IN scope (skipped - already found)
```

## 4. Enclosing Scope: Nested Functions and Closures

The **enclosing scope** becomes important when you have functions inside functions:

```python
def create_multiplier(factor):
    # This is enclosing scope for the inner function
  
    def multiply(number):
        # Local scope - can access 'factor' from enclosing scope
        result = number * factor  # 'factor' comes from outer function
        return result
  
    return multiply  # Return the function itself, not the result

# Create specialized multiplier functions
double = create_multiplier(2)
triple = create_multiplier(3)

# These functions "remember" their factor values!
print(double(5))   # 10 (5 * 2)
print(triple(5))   # 15 (5 * 3)
```

> **This is called a "closure"** - the inner function "closes over" variables from its enclosing scope, keeping them alive even after the outer function finishes.

## 5. Built-in Scope: Python's Foundation

Built-in scope contains Python's pre-defined functions and constants:

```python
# These are all in built-in scope - always available:
numbers = [1, 2, 3, 4, 5]
print(len(numbers))    # len() is built-in
print(max(numbers))    # max() is built-in
print(sum(numbers))    # sum() is built-in

# You can override built-ins (but shouldn't!)
def len(sequence):  # Bad idea - shadows built-in len()
    return "I broke len()!"

print(len([1, 2, 3]))  # Now prints "I broke len()!"

# To fix this, you need to delete your local definition
del len
print(len([1, 2, 3]))  # Back to normal: prints 3
```

## Common Scope Pitfalls and Solutions

### Pitfall 1: Late Binding in Loops

```python
# Problem: All functions reference the same variable
functions = []
for i in range(3):
    functions.append(lambda: i)  # All lambdas will use final value of i

# All functions return 2 (the final value of i)
for func in functions:
    print(func())  # Prints: 2, 2, 2

# Solution 1: Use default parameter to capture current value
functions = []
for i in range(3):
    functions.append(lambda x=i: x)  # Capture i's current value

for func in functions:
    print(func())  # Prints: 0, 1, 2

# Solution 2: Use a closure factory
def make_function(value):
    return lambda: value

functions = []
for i in range(3):
    functions.append(make_function(i))

for func in functions:
    print(func())  # Prints: 0, 1, 2
```

### Pitfall 2: Mutable Default Arguments

```python
# Problem: Mutable defaults are shared between calls
def add_item(item, shopping_list=[]):  # Dangerous!
    shopping_list.append(item)
    return shopping_list

# Each call modifies the same list!
list1 = add_item("apples")      # ["apples"]
list2 = add_item("bananas")     # ["apples", "bananas"] - Oops!

# Solution: Use None and create new list each time
def add_item(item, shopping_list=None):
    if shopping_list is None:
        shopping_list = []  # Create new list each call
    shopping_list.append(item)
    return shopping_list

list1 = add_item("apples")      # ["apples"]
list2 = add_item("bananas")     # ["bananas"] - Correct!
```

## Practical Applications

### 1. Configuration Management

```python
# Global configuration
DATABASE_URL = "postgresql://localhost/myapp"
DEBUG_MODE = True

def get_db_connection():
    global DATABASE_URL  # Access configuration
    # ... connection logic using DATABASE_URL
    pass

def toggle_debug():
    global DEBUG_MODE
    DEBUG_MODE = not DEBUG_MODE
    print(f"Debug mode: {'ON' if DEBUG_MODE else 'OFF'}")
```

### 2. Factory Functions with State

```python
def create_bank_account(initial_balance):
    balance = initial_balance  # Enclosing scope
  
    def deposit(amount):
        nonlocal balance  # Modify enclosing variable
        balance += amount
        return balance
  
    def withdraw(amount):
        nonlocal balance
        if amount <= balance:
            balance -= amount
            return balance
        else:
            print("Insufficient funds!")
            return balance
  
    def get_balance():
        return balance
  
    # Return a dictionary of functions that share state
    return {
        'deposit': deposit,
        'withdraw': withdraw,
        'balance': get_balance
    }

# Create account instances
alice_account = create_bank_account(1000)
bob_account = create_bank_account(500)

# Each account has its own balance state
print(alice_account['balance']())  # 1000
alice_account['deposit'](200)
print(alice_account['balance']())  # 1200

print(bob_account['balance']())    # 500 (unaffected by Alice's transactions)
```

> **Key Takeaway** : Understanding scope is essential for writing maintainable Python code. It helps you organize your variables logically, avoid naming conflicts, and create powerful patterns like closures and factories.

The LEGB rule provides a predictable way to understand where Python will find your variables, making your code behavior more predictable and debugging much easier!
