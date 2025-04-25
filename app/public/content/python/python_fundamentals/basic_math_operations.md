# Basic Mathematical Operations in Python

Mathematical operations are the foundation of programming, allowing us to perform calculations and manipulate numerical data. I'll explain Python's basic math operations from first principles, starting with the most fundamental concepts and building up to more complex operations.

## Understanding Numbers in Python

Before we dive into operations, let's understand how Python represents numbers:

1. **Integers** (int): Whole numbers without decimal points
2. **Floating-point numbers** (float): Numbers with decimal points
3. **Complex numbers** (complex): Numbers with real and imaginary parts

```python
# Examples of different number types
my_integer = 42
my_float = 3.14159
my_complex = 2 + 3j

print(type(my_integer))  # <class 'int'>
print(type(my_float))    # <class 'float'>
print(type(my_complex))  # <class 'complex'>
```

Each of these numbers behaves differently with mathematical operations. Let's examine the operations themselves.

## Addition (+)

Addition combines two numbers to form their sum. At its core, addition means combining quantities.

```python
# Basic addition
sum_integers = 5 + 3  # Equals 8
sum_floats = 2.5 + 1.3  # Equals 3.8
mixed_sum = 10 + 0.5  # Integer + Float = Float (10.5)

# We can also add variables
a = 7
b = 3
result = a + b  # Equals 10

print(f"Sum of integers: {sum_integers}")
print(f"Sum of floats: {sum_floats}")
print(f"Mixed sum: {mixed_sum}")
print(f"Sum of variables: {result}")
```

Notice how Python automatically converts the result to a float when at least one operand is a float. This is called **type coercion** – Python chooses the most precise type that can represent all values.

## Subtraction (-)

Subtraction finds the difference between two numbers.

```python
# Basic subtraction
difference = 10 - 3  # Equals 7
float_difference = 5.7 - 2.3  # Equals 3.4
negative_result = 5 - 8  # Equals -3

# With variables
x = 15
y = 7
result = x - y  # Equals 8

print(f"Difference: {difference}")
print(f"Float difference: {float_difference}")
print(f"Negative result: {negative_result}")
print(f"Difference of variables: {result}")
```

When the second number is larger than the first, we get a negative number. Python handles negative numbers seamlessly.

## Multiplication (*)

Multiplication represents repeated addition or scaling of one number by another.

```python
# Basic multiplication
product = 4 * 5  # Equals 20
float_product = 2.5 * 3  # Equals 7.5
negative_product = -3 * 4  # Equals -12

# With variables
width = 6
height = 8
area = width * height  # Equals 48

print(f"Product: {product}")
print(f"Float product: {float_product}")
print(f"Negative product: {negative_product}")
print(f"Area calculation: {area}")
```

Multiplication can be thought of as scaling: `2.5 * 3` means "take 2.5 and multiply it 3 times" or scale it by a factor of 3.

## Division (/)

Division finds how many times one number "fits into" another.

```python
# Basic division
quotient = 10 / 2  # Equals 5.0 (note: always returns a float)
float_division = 7 / 2  # Equals 3.5
negative_division = -12 / 4  # Equals -3.0

# Division by variables
total = 100
parts = 4
share = total / parts  # Equals 25.0

print(f"Quotient: {quotient}")
print(f"Float division: {float_division}")
print(f"Negative division: {negative_division}")
print(f"Share calculation: {share}")
```

An important point: in Python 3, division with the `/` operator **always** returns a float, even if the division results in a whole number.

## Integer Division (//)

Integer division (also called floor division) discards the remainder and returns only the whole number part of the quotient.

```python
# Integer division
int_quotient = 10 // 3  # Equals 3 (not 3.333...)
float_int_division = 7.0 // 2  # Equals 3.0 (returns float if inputs include float)
negative_int_division = -7 // 2  # Equals -4 (rounds down, not toward zero)

print(f"Integer quotient: {int_quotient}")
print(f"Float integer division: {float_int_division}")
print(f"Negative integer division: {negative_int_division}")
```

Notice the behavior with negative numbers: `-7 // 2` equals `-4`, not `-3`. This is because floor division rounds down to the nearest integer, not toward zero.

## Modulo Operation (%)

The modulo operation returns the remainder after division.

```python
# Modulo examples
remainder = 10 % 3  # Equals 1 (10 = 3*3 + 1)
no_remainder = 8 % 4  # Equals 0 (8 = 4*2 + 0)
float_modulo = 5.5 % 2  # Equals 1.5 (5.5 = 2*2 + 1.5)

# Practical example: checking if a number is even
number = 15
is_even = number % 2 == 0  # False (15 % 2 = 1)

print(f"Remainder: {remainder}")
print(f"No remainder: {no_remainder}")
print(f"Float modulo: {float_modulo}")
print(f"Is 15 even? {is_even}")
```

The modulo operation is particularly useful for tasks like checking if a number is even or odd, or for cycling through values (like in a clock, where 13 hours is 1 o'clock).

## Exponentiation (**)

Exponentiation raises one number to the power of another.

```python
# Exponentiation examples
square = 5 ** 2  # 5² = 25
cube = 2 ** 3  # 2³ = 8
fraction_power = 9 ** 0.5  # Square root of 9 = 3.0
negative_exponent = 2 ** -3  # 2⁻³ = 1/(2³) = 1/8 = 0.125

# Practical example: calculating area of a circle
radius = 3
pi = 3.14159
area = pi * (radius ** 2)  # π * r² = 28.27431

print(f"Square: {square}")
print(f"Cube: {cube}")
print(f"Square root using power: {fraction_power}")
print(f"Negative exponent: {negative_exponent}")
print(f"Circle area: {area}")
```

Exponentiation is incredibly versatile. We can use fractional exponents for roots (like `x ** 0.5` for square root) and negative exponents for reciprocal powers.

## Operator Precedence

When multiple operations appear in an expression, Python follows a specific order of operations (similar to mathematics):

1. Parentheses `()`
2. Exponentiation `**`
3. Positive/negative signs (unary `+`, `-`)
4. Multiplication, division, integer division, modulo `*`, `/`, `//`, `%`
5. Addition and subtraction `+`, `-`

```python
# Order of operations examples
result1 = 2 + 3 * 4  # 3*4 first, then add 2 = 14
result2 = (2 + 3) * 4  # (2+3) first, then multiply by 4 = 20
result3 = 2 ** 3 * 4  # 2³ first, then multiply by 4 = 32
result4 = 20 / 4 / 2  # Division is left-to-right: (20/4)/2 = 5/2 = 2.5

print(f"2 + 3 * 4 = {result1}")
print(f"(2 + 3) * 4 = {result2}")
print(f"2 ** 3 * 4 = {result3}")
print(f"20 / 4 / 2 = {result4}")
```

Understanding operator precedence helps us write correct mathematical expressions without excessive parentheses.

## Combined Assignment Operators

Python provides shorthand operators that combine an operation with assignment:

```python
# Combined operators
x = 10

# Addition and assignment
x += 5  # Same as x = x + 5, now x = 15
print(f"After x += 5: {x}")

# Subtraction and assignment
x -= 3  # Same as x = x - 3, now x = 12
print(f"After x -= 3: {x}")

# Multiplication and assignment
x *= 2  # Same as x = x * 2, now x = 24
print(f"After x *= 2: {x}")

# Division and assignment
x /= 4  # Same as x = x / 4, now x = 6.0 (becomes float)
print(f"After x /= 4: {x}")

# Other combined operators
y = 17
y %= 5  # Same as y = y % 5, now y = 2
print(f"After y %= 5: {y}")

z = 2
z **= 3  # Same as z = z ** 3, now z = 8
print(f"After z **= 3: {z}")
```

These operators make code more concise and often more readable when modifying variables in-place.

## Built-in Math Functions

Python includes several built-in functions for common mathematical operations:

```python
# Built-in math functions
absolute_value = abs(-7.5)  # Equals 7.5
maximum = max(3, 7, 2, 9)  # Equals 9
minimum = min(3, 7, 2, 9)  # Equals 2
rounded_number = round(3.49)  # Equals 3
rounded_precise = round(3.14159, 2)  # Equals 3.14 (rounds to 2 decimal places)

print(f"Absolute value of -7.5: {absolute_value}")
print(f"Maximum of 3, 7, 2, 9: {maximum}")
print(f"Minimum of 3, 7, 2, 9: {minimum}")
print(f"Round 3.49: {rounded_number}")
print(f"Round 3.14159 to 2 places: {rounded_precise}")
```

For more advanced mathematical functions, you'll need the `math` module.

## The Math Module

For more complex operations, Python's `math` module provides a wide range of functions:

```python
import math

# Trigonometric functions (arguments in radians)
sine = math.sin(math.pi / 2)  # sin(90°) = 1.0
cosine = math.cos(0)  # cos(0°) = 1.0

# Logarithmic functions
natural_log = math.log(10)  # ln(10) ≈ 2.302
log_base_10 = math.log10(100)  # log₁₀(100) = 2.0

# Constants
pi_value = math.pi  # π ≈ 3.14159
e_value = math.e  # e ≈ 2.71828

# Other functions
square_root = math.sqrt(16)  # √16 = 4.0
factorial = math.factorial(5)  # 5! = 120

print(f"sin(π/2): {sine}")
print(f"cos(0): {cosine}")
print(f"ln(10): {natural_log}")
print(f"log₁₀(100): {log_base_10}")
print(f"π: {pi_value}")
print(f"e: {e_value}")
print(f"√16: {square_root}")
print(f"5!: {factorial}")
```

The `math` module is part of Python's standard library, so it's always available without additional installation.

## Practical Examples

Let's look at some practical examples that combine these operations:

### Example 1: Temperature Conversion

```python
# Convert Celsius to Fahrenheit
celsius = 25
fahrenheit = (celsius * 9/5) + 32  # Formula: (C × 9/5) + 32
print(f"{celsius}°C is equal to {fahrenheit}°F")
```

In this example, we multiply Celsius by 9/5 (or 1.8) and then add 32, following the standard conversion formula.

### Example 2: Simple Interest Calculation

```python
# Calculate simple interest
principal = 1000  # Initial amount
rate = 0.05  # 5% annual interest rate
time = 3  # 3 years

interest = principal * rate * time
amount = principal + interest

print(f"Principal: ${principal}")
print(f"Interest rate: {rate*100}%")
print(f"Time period: {time} years")
print(f"Interest earned: ${interest}")
print(f"Final amount: ${amount}")
```

Here we're using the simple interest formula: Interest = Principal × Rate × Time.

### Example 3: Calculating a Discount

```python
# Calculate price after discount
original_price = 50
discount_percentage = 20  # 20% discount

discount_amount = original_price * (discount_percentage / 100)
final_price = original_price - discount_amount

print(f"Original price: ${original_price}")
print(f"Discount: {discount_percentage}%")
print(f"Discount amount: ${discount_amount}")
print(f"Final price: ${final_price}")
```

This example shows how to calculate a discounted price by first finding the discount amount and then subtracting it from the original price.

## Common Pitfalls and Tips

### 1. Integer vs. Float Division

Remember that `/` always returns a float, while `//` performs integer division:

```python
result1 = 10 / 5  # Equals 2.0 (float)
result2 = 10 // 5  # Equals 2 (integer)

print(f"10 / 5 = {result1} ({type(result1).__name__})")
print(f"10 // 5 = {result2} ({type(result2).__name__})")
```

### 2. Division by Zero

Dividing by zero causes a runtime error:

```python
# This would cause an error
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Error: Division by zero is not allowed")
```

Always check for potential division by zero in your code.

### 3. Floating-Point Precision

Floating-point numbers can have precision issues due to how they're represented in binary:

```python
# Floating-point precision issue
result = 0.1 + 0.2  # Expected: 0.3, Actual: 0.30000000000000004

print(f"0.1 + 0.2 = {result}")
print(f"Is result exactly 0.3? {result == 0.3}")

# Solution: Use round() for comparison
print(f"Is result ≈ 0.3? {round(result, 10) == round(0.3, 10)}")
```

For financial calculations or when exact precision is needed, consider using the `decimal` module instead of floats.

## Conclusion

Python's mathematical operators provide a robust foundation for numerical computation. From basic arithmetic to more complex functions, understanding these operations is crucial for programming in Python. Remember that these operations follow mathematical principles, with additional features like type coercion to make calculations more intuitive.

As you advance, you might explore other numerical libraries like NumPy, which provides even more powerful mathematical functions and efficient array operations for scientific computing.
