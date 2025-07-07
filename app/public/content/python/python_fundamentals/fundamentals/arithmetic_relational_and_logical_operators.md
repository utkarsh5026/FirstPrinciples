# Python Operators: Arithmetic, Relational, and Logical

I'll explain these fundamental Python operators from first principles, with clear examples to illustrate each concept in detail.

## What Are Operators?

Let's start with the absolute basics. In programming, operators are special symbols that tell the computer to perform specific operations on values (called operands). They're the fundamental building blocks of any computation, allowing us to manipulate data in meaningful ways.

> Think of operators as verbs in a language. Just as verbs allow us to express actions in human languages ("run," "eat," "think"), operators allow us to express operations in programming languages.

## 1. Arithmetic Operators

Arithmetic operators perform mathematical operations on numeric values—just like the operations you'd perform with a calculator.

### Addition (+)

The addition operator adds two values together.

```python
# Basic addition
sum = 5 + 3
print(sum)  # Outputs: 8

# Addition with variables
x = 10
y = 20
result = x + y
print(result)  # Outputs: 30

# Adding different numeric types
integer_value = 5
float_value = 3.7
combined = integer_value + float_value
print(combined)  # Outputs: 8.7 (note that the result is a float)
```

When working with addition, Python follows mathematical precedence rules (operations in parentheses first, then multiplication/division, then addition/subtraction).

The addition operator isn't limited to numbers. It can also join strings or concatenate lists:

```python
# String concatenation
first_name = "John"
last_name = "Doe"
full_name = first_name + " " + last_name
print(full_name)  # Outputs: "John Doe"

# List concatenation
list1 = [1, 2, 3]
list2 = [4, 5, 6]
combined_list = list1 + list2
print(combined_list)  # Outputs: [1, 2, 3, 4, 5, 6]
```

### Subtraction (-)

The subtraction operator subtracts the right operand from the left operand.

```python
# Basic subtraction
difference = 10 - 3
print(difference)  # Outputs: 7

# Subtraction with variables
budget = 100
expenses = 75
remaining = budget - expenses
print(remaining)  # Outputs: 25

# Negative numbers
negative_result = 5 - 10
print(negative_result)  # Outputs: -5
```

The subtraction operator can also be used to negate a value:

```python
x = 5
negative_x = -x
print(negative_x)  # Outputs: -5
```

### Multiplication (*)

The multiplication operator multiplies two values.

```python
# Basic multiplication
product = 4 * 5
print(product)  # Outputs: 20

# Multiplication with variables
price = 9.99
quantity = 3
total_cost = price * quantity
print(total_cost)  # Outputs: 29.97

# Multiplying integers and floats
result = 5 * 2.5
print(result)  # Outputs: 12.5
```

The multiplication operator has a special behavior with strings and lists—it repeats them:

```python
# Repeating a string
repeated_text = "abc" * 3
print(repeated_text)  # Outputs: "abcabcabc"

# Repeating a list
repeated_list = [1, 2] * 3
print(repeated_list)  # Outputs: [1, 2, 1, 2, 1, 2]
```

### Division (/)

The division operator divides the left operand by the right operand.

```python
# Basic division
quotient = 15 / 3
print(quotient)  # Outputs: 5.0 (note: always returns a float)

# Division with variables
total_pizza = 8
people = 4
slices_per_person = total_pizza / people
print(slices_per_person)  # Outputs: 2.0

# Division resulting in a decimal
result = 10 / 3
print(result)  # Outputs: 3.3333333333333335
```

> An important point: In Python 3, division with the / operator always returns a float, even if the division results in a whole number. This differs from some other languages.

### Floor Division (//)

The floor division operator divides and rounds down to the nearest integer.

```python
# Basic floor division
floor_result = 15 // 4
print(floor_result)  # Outputs: 3 (15 ÷ 4 = 3.75, rounded down to 3)

# Floor division with variables
budget = 100
item_price = 30
items_purchasable = budget // item_price
print(items_purchasable)  # Outputs: 3 (can buy 3 complete items)

# Floor division with negative numbers
negative_result = -10 // 3
print(negative_result)  # Outputs: -4 (rounds down, not toward zero)
```

Floor division is particularly useful when you need to know how many whole units you can have (like the number of complete items you can buy with a budget).

### Modulus (%)

The modulus operator returns the remainder of a division.

```python
# Basic modulus
remainder = 17 % 5
print(remainder)  # Outputs: 2 (17 ÷ 5 = 3 with remainder 2)

# Modulus with variables
seconds = 125
minutes = seconds // 60  # How many complete minutes
remaining_seconds = seconds % 60  # Remaining seconds
print(f"{minutes} minutes and {remaining_seconds} seconds")  # Outputs: "2 minutes and 5 seconds"

# Checking if a number is even or odd
number = 15
is_even = number % 2 == 0
print(f"Is {number} even? {is_even}")  # Outputs: "Is 15 even? False"
```

The modulus operator is incredibly useful for:

* Time calculations (converting seconds to minutes and seconds)
* Checking if numbers are even/odd
* Creating circular patterns (wrapping around when reaching a limit)

### Exponentiation (**)

The exponentiation operator raises the left operand to the power of the right operand.

```python
# Basic exponentiation
squared = 5 ** 2
print(squared)  # Outputs: 25 (5 raised to the power of 2)

# Exponentiation with variables
base = 2
exponent = 8
result = base ** exponent
print(result)  # Outputs: 256 (2 raised to the power of 8)

# Fractional exponents for roots
square_root = 16 ** 0.5
print(square_root)  # Outputs: 4.0 (square root of 16)
```

> Using fractional exponents is an elegant way to calculate roots. For example, x ** 0.5 gives the square root of x, and x ** (1/3) gives the cube root.

## 2. Relational Operators

Relational operators compare values and return a Boolean result (True or False). These are the foundation of decision-making in programming.

### Equal to (==)

Checks if two values are equal.

```python
# Basic equality check
is_equal = 5 == 5
print(is_equal)  # Outputs: True

# Comparing variables
x = 10
y = 10
z = 11
print(x == y)  # Outputs: True
print(x == z)  # Outputs: False

# Comparing different types
print(5 == 5.0)  # Outputs: True (values are equal, types don't matter)
print("5" == 5)  # Outputs: False (string and integer are never equal)
```

> A common mistake is confusing the assignment operator (=) with the equality operator (==). Remember: = assigns a value, == checks equality.

### Not equal to (!=)

Checks if two values are not equal.

```python
# Basic inequality check
is_not_equal = 5 != 7
print(is_not_equal)  # Outputs: True (they are indeed not equal)

# Comparing variables
x = "apple"
y = "orange"
print(x != y)  # Outputs: True (they are different)

# Comparing same values
a = 100
b = 100
print(a != b)  # Outputs: False (they are equal, so not unequal)
```

### Greater than (>)

Checks if the left operand is greater than the right operand.

```python
# Basic greater than check
is_greater = 10 > 5
print(is_greater)  # Outputs: True

# Comparing variables
temperature = 32
freezing_point = 0
print(temperature > freezing_point)  # Outputs: True (32 is greater than 0)

# Comparing strings (uses alphabetical order)
print("zebra" > "aardvark")  # Outputs: True (z comes after a in alphabet)
```

When comparing strings, Python uses lexicographical comparison, which is based on the Unicode values of characters.

### Less than (<)

Checks if the left operand is less than the right operand.

```python
# Basic less than check
is_less = 3 < 7
print(is_less)  # Outputs: True

# Comparing variables
current_score = 85
high_score = 95
print(current_score < high_score)  # Outputs: True (85 is less than 95)

# Comparing equal values
print(5 < 5)  # Outputs: False (5 is equal to 5, not less than)
```

### Greater than or equal to (>=)

Checks if the left operand is greater than or equal to the right operand.

```python
# Basic greater than or equal check
is_greater_or_equal = 10 >= 10
print(is_greater_or_equal)  # Outputs: True (they are equal)

# Comparing variables
age = 18
legal_age = 18
print(age >= legal_age)  # Outputs: True (equal, so requirement met)

# Another example
print(25 >= 20)  # Outputs: True (greater than)
print(15 >= 20)  # Outputs: False (neither greater nor equal)
```

### Less than or equal to (<=)

Checks if the left operand is less than or equal to the right operand.

```python
# Basic less than or equal check
is_less_or_equal = 5 <= 10
print(is_less_or_equal)  # Outputs: True (5 is less than 10)

# Comparing variables
water_level = 50
max_capacity = 50
print(water_level <= max_capacity)  # Outputs: True (equal, so within capacity)

# Another example
print(15 <= 10)  # Outputs: False (neither less nor equal)
```

### Practical Application of Relational Operators

Relational operators are most commonly used in conditional statements to make decisions:

```python
# Example: Simple grading system
score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Your grade is: {grade}")  # Outputs: "Your grade is: B"
```

## 3. Logical Operators

Logical operators combine multiple conditions and return Boolean results. They're essential for complex decision-making.

### AND (and)

Returns `True` if both conditions are `True`, otherwise returns `False`.

```python
# Basic AND operation
result = True and True
print(result)  # Outputs: True

result = True and False
print(result)  # Outputs: False

# Using with variables
age = 25
income = 50000
is_eligible = age > 18 and income > 30000
print(is_eligible)  # Outputs: True (both conditions are true)

# Complex example
has_license = True
is_sober = False
can_drive = has_license and is_sober
print(can_drive)  # Outputs: False (one condition is false)
```

> The `and` operator short-circuits: if the first condition is `False`, Python doesn't evaluate the second condition because the overall result must be `False`.

### OR (or)

Returns `True` if at least one condition is `True`, returns `False` only if all conditions are `False`.

```python
# Basic OR operation
result = True or False
print(result)  # Outputs: True

result = False or False
print(result)  # Outputs: False

# Using with variables
is_weekend = True
is_holiday = False
day_off = is_weekend or is_holiday
print(day_off)  # Outputs: True (at least one condition is true)

# Complex example
cash = 0
credit = 100
can_purchase = cash > 0 or credit > 0
print(can_purchase)  # Outputs: True (credit > 0 is true)
```

> Like `and`, the `or` operator also short-circuits: if the first condition is `True`, Python doesn't evaluate the second condition because the overall result must be `True`.

### NOT (not)

Inverts a Boolean value: `True` becomes `False`, and `False` becomes `True`.

```python
# Basic NOT operation
result = not True
print(result)  # Outputs: False

result = not False
print(result)  # Outputs: True

# Using with variables
is_raining = True
is_not_raining = not is_raining
print(is_not_raining)  # Outputs: False

# Complex example
is_working_day = True
is_weekend = not is_working_day
print(is_weekend)  # Outputs: False
```

### Truth Table

Understanding logical operators is easier with a truth table:

| A     | B     | A and B | A or B | not A |
| ----- | ----- | ------- | ------ | ----- |
| True  | True  | True    | True   | False |
| True  | False | False   | True   | False |
| False | True  | False   | True   | True  |
| False | False | False   | False  | True  |

### Combining Logical Operators

You can combine logical operators to create complex conditions:

```python
# Complex logical condition
age = 25
income = 50000
credit_score = 700
debt = 5000

loan_eligible = (age > 18 and income > 30000) and (credit_score > 650 or debt < 10000)
print(loan_eligible)  # Outputs: True

# Breaking down the condition:
# (age > 18 and income > 30000) evaluates to (True and True) which is True
# (credit_score > 650 or debt < 10000) evaluates to (True or True) which is True
# True and True evaluates to True
```

> When combining logical operators, use parentheses to clarify the order of operations and make your code more readable. Without parentheses, `and` has higher precedence than `or`.

### Using Logical Operators with Non-Boolean Values

In Python, logical operators don't just work with Boolean values; they can be used with any values. Python considers the following values to be "falsy":

* `False`
* `None`
* Zero (`0`, `0.0`, `0j`)
* Empty sequences (`''`, `()`, `[]`, `{}`, `set()`)
* Objects that implement `__bool__()` or `__len__()` that return `0` or `False`

All other values are considered "truthy."

```python
# Using non-Boolean values with logical operators
print(0 and 1)  # Outputs: 0 (first value is falsy, so returns it)
print(1 and 2)  # Outputs: 2 (both are truthy, returns the last evaluated value)
print(0 or 1)   # Outputs: 1 (first is falsy, so evaluates and returns the second)
print("" or "Hello")  # Outputs: "Hello" (empty string is falsy)

# Practical example: default values
user_name = ""
display_name = user_name or "Guest"
print(display_name)  # Outputs: "Guest" (since user_name is empty)
```

This behavior makes logical operators useful for conditional assignments and providing default values.

## Combining Different Types of Operators

In real-world Python programming, you'll often combine arithmetic, relational, and logical operators to solve complex problems.

```python
# Example: Calculating a discount
price = 100
quantity = 5
is_member = True

# Calculate total with potential discount
subtotal = price * quantity  # Arithmetic: multiplication
is_bulk_order = quantity >= 5  # Relational: greater than or equal
gets_discount = is_member or is_bulk_order  # Logical: OR

# Apply discount if conditions met
if gets_discount:
    discount_rate = 0.1
    discount_amount = subtotal * discount_rate  # Arithmetic again
    final_total = subtotal - discount_amount  # More arithmetic
else:
    final_total = subtotal

print(f"Final total: ${final_total}")  # Outputs: "Final total: $450.0"
```

## Operator Precedence

When an expression contains multiple operators, Python follows a specific order of operations (precedence):

1. Parentheses `()`
2. Exponentiation `**`
3. Unary operators `+x`, `-x`, `~x`
4. Multiplication, Division, Floor Division, Modulus `*`, `/`, `//`, `%`
5. Addition, Subtraction `+`, `-`
6. Bitwise shifts `<<`, `>>`
7. Bitwise AND `&`
8. Bitwise XOR `^`
9. Bitwise OR `|`
10. Comparisons `==`, `!=`, `>`, `>=`, `<`, `<=`
11. Logical NOT `not`
12. Logical AND `and`
13. Logical OR `or`

```python
# Example demonstrating operator precedence
result = 2 + 3 * 4  # Multiplication happens before addition
print(result)  # Outputs: 14 (not 20)

# Using parentheses to change precedence
result = (2 + 3) * 4  # Now addition happens first
print(result)  # Outputs: 20

# Complex example
x = 5
y = 10
z = 2
result = x + y * z > x * (y + z) and not x == y
# Breaking it down:
# x + y * z = 5 + 10 * 2 = 5 + 20 = 25
# x * (y + z) = 5 * (10 + 2) = 5 * 12 = 60
# 25 > 60 = False
# not x == y = not (5 == 10) = not False = True
# False and True = False
print(result)  # Outputs: False
```

> When in doubt about operator precedence, use parentheses to make your intentions clear. It makes the code more readable and prevents errors.

## Practical Applications

Let's see some real-world applications that combine these operators:

### Example 1: Tax Calculator

```python
# Calculate income tax based on income brackets
income = 75000
dependent_count = 2

# Deduction per dependent
dependent_deduction = 2000
taxable_income = income - (dependent_count * dependent_deduction)

# Tax brackets (simplified)
tax_rate = 0
if taxable_income <= 10000:
    tax_rate = 0.1
elif taxable_income <= 50000:
    tax_rate = 0.2
else:
    tax_rate = 0.3

# Calculate tax
tax = taxable_income * tax_rate

print(f"Taxable income: ${taxable_income}")
print(f"Tax rate: {tax_rate * 100}%")
print(f"Tax owed: ${tax}")
```

### Example 2: Password Validator

```python
# Check if a password meets security requirements
password = "Secure123!"

# Requirements
min_length = 8
has_uppercase = False
has_lowercase = False
has_digit = False
has_special = False

# Check length
is_long_enough = len(password) >= min_length

# Check character types
for char in password:
    if char.isupper():
        has_uppercase = True
    elif char.islower():
        has_lowercase = True
    elif char.isdigit():
        has_digit = True
    else:
        has_special = True

# Validate all requirements
is_valid = (is_long_enough and has_uppercase and 
            has_lowercase and has_digit and has_special)

# Report results
print(f"Password length check: {is_long_enough}")
print(f"Has uppercase: {has_uppercase}")
print(f"Has lowercase: {has_lowercase}")
print(f"Has digit: {has_digit}")
print(f"Has special character: {has_special}")
print(f"Password is valid: {is_valid}")
```

## Summary

> Python operators form the foundation of all computation in the language, allowing us to manipulate data and make decisions.

* **Arithmetic operators** (`+`, `-`, `*`, `/`, `//`, `%`, `**`) perform mathematical calculations.
* **Relational operators** (`==`, `!=`, `>`, `<`, `>=`, `<=`) compare values and return Boolean results.
* **Logical operators** (`and`, `or`, `not`) combine conditions and also return Boolean results.

Understanding these operators thoroughly allows you to write more efficient and expressive Python code. As you continue your Python journey, you'll naturally combine these operators in increasingly sophisticated ways to solve complex problems.

The key is to practice using them in different contexts until their behavior becomes second nature. Remember that you can always use parentheses to clarify your intentions when combining multiple operators.
