# Stack Applications in FAANG Interviews: Expression Evaluation & Parentheses Matching

Let me take you on a comprehensive journey through two of the most fundamental stack applications that appear frequently in FAANG interviews. We'll build everything from first principles, ensuring you understand not just *how* these algorithms work, but *why* they work.

## Understanding the Stack: The Foundation

Before we dive into applications, let's establish what a stack truly is at its core.

> **A stack is a Last-In-First-Out (LIFO) data structure that mimics a real-world stack of plates. You can only add (push) or remove (pop) elements from the top.**

Think of it like this: imagine you're washing dishes and stacking clean plates. The last plate you place on top is the first one you'll take when you need a plate. This natural behavior is exactly how a stack operates.

### The Stack's Core Operations

```python
class Stack:
    def __init__(self):
        self.items = []  # Using Python list as underlying storage
  
    def push(self, item):
        """Add an item to the top of the stack"""
        self.items.append(item)
  
    def pop(self):
        """Remove and return the top item"""
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items.pop()
  
    def peek(self):
        """Look at the top item without removing it"""
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items[-1]
  
    def is_empty(self):
        """Check if stack has no elements"""
        return len(self.items) == 0
  
    def size(self):
        """Return number of elements in stack"""
        return len(self.items)
```

Let's trace through a simple example to see the stack in action:

```python
# Create a new stack
stack = Stack()

# Push some elements
stack.push(10)    # Stack: [10]
stack.push(20)    # Stack: [10, 20]
stack.push(30)    # Stack: [10, 20, 30]

print(stack.peek())  # Output: 30 (top element)
print(stack.pop())   # Output: 30, Stack becomes: [10, 20]
print(stack.pop())   # Output: 20, Stack becomes: [10]
```

> **Why is LIFO behavior so powerful?** The stack naturally "remembers" the most recent information while temporarily "forgetting" older information. This makes it perfect for scenarios where we need to process things in reverse order or handle nested structures.

## Application 1: Parentheses Matching - The Gateway Problem

Parentheses matching is often the first stack problem students encounter, and for good reason. It perfectly demonstrates why stacks are the ideal data structure for handling nested, hierarchical problems.

### The Problem Statement

Given a string containing various types of brackets `()`, `[]`, `{}`, determine if they are properly matched and balanced.

**Examples:**

* `"()"` → Valid
* `"()[]{}"` → Valid
* `"([{}])"` → Valid
* `"([)]"` → Invalid (improper nesting)
* `"((("` → Invalid (unmatched opening)

### Why Does This Problem Scream "Stack"?

Let's think about how you naturally solve this problem in your head:

1. When you see an opening bracket, you mentally "remember" it
2. When you see a closing bracket, you check if it matches the most recent unmatched opening bracket
3. If they match, you "forget" that pair and continue
4. If they don't match, or if there's no opening bracket to match with, it's invalid

This is exactly LIFO behavior! The "most recent unmatched opening bracket" is always at the top of our mental stack.

### Step-by-Step Algorithm Development

Let's build the solution incrementally:

```python
def is_valid_parentheses(s):
    """
    Check if parentheses are balanced using a stack approach.
  
    The key insight: Every closing bracket must match the most recent
    unmatched opening bracket (LIFO behavior).
    """
    # Create our stack to track unmatched opening brackets
    stack = []
  
    # Define what each closing bracket should match with
    bracket_map = {
        ')': '(',
        ']': '[', 
        '}': '{'
    }
  
    # Process each character in the string
    for char in s:
        if char in bracket_map:  # It's a closing bracket
            # Check if we have a matching opening bracket at the top
            if not stack or stack[-1] != bracket_map[char]:
                return False
            stack.pop()  # Remove the matched opening bracket
        else:  # It's an opening bracket (or other character)
            stack.append(char)
  
    # Valid only if all brackets were matched (stack is empty)
    return len(stack) == 0
```

Let's trace through this algorithm with the example `"([{}])"`:

```
Step-by-step execution:

1. char = '(' → opening bracket → stack = ['(']
2. char = '[' → opening bracket → stack = ['(', '[']  
3. char = '{' → opening bracket → stack = ['(', '[', '{']
4. char = '}' → closing bracket, matches '{' → stack = ['(', '[']
5. char = ']' → closing bracket, matches '[' → stack = ['(']
6. char = ')' → closing bracket, matches '(' → stack = []

Final stack is empty → return True (valid)
```

Now let's see what happens with an invalid example `"([)]"`:

```
Step-by-step execution:

1. char = '(' → opening bracket → stack = ['(']
2. char = '[' → opening bracket → stack = ['(', '[']
3. char = ')' → closing bracket, should match '(' but top is '[' → return False
```

> **The key insight here is that the stack maintains the "context" of nested brackets. Each opening bracket creates a new context that must be properly closed before we can return to the previous context.**

### Visual Representation

Here's how the stack evolves for a valid nested structure:

```
Input: "([{}])"

Step 1: '('     Step 2: '['     Step 3: '{'
┌─────┐        ┌─────┐         ┌─────┐
│     │        │     │         │  {  │
│     │        │  [  │         │  [  │  
│  (  │        │  (  │         │  (  │
└─────┘        └─────┘         └─────┘

Step 4: '}'    Step 5: ']'     Step 6: ')'
┌─────┐        ┌─────┐         ┌─────┐
│     │        │     │         │     │
│  [  │        │     │         │     │
│  (  │        │  (  │         │     │
└─────┘        └─────┘         └─────┘
```

## Application 2: Expression Evaluation - The Complete Picture

Expression evaluation represents a more sophisticated application of stacks. Here, we'll explore both **infix to postfix conversion** and **postfix evaluation** - two problems that frequently appear in FAANG interviews.

### Understanding the Problem Landscape

When we write mathematical expressions, we typically use  **infix notation** : `3 + 4 * 2`. However, this notation has ambiguity issues that require precedence rules and parentheses.

**Postfix notation** (also called Reverse Polish Notation) eliminates this ambiguity: `3 4 2 * +`. In postfix:

* Operands come first
* Operators come after their operands
* No parentheses are needed
* Evaluation is strictly left-to-right

> **Why is postfix notation revolutionary for computers?** It eliminates the need for precedence rules and parentheses, making expression evaluation a simple stack-based process.

### Part 1: Infix to Postfix Conversion

This is where we transform human-readable math expressions into computer-friendly format.

#### The Shunting Yard Algorithm

Developed by Edsger Dijkstra, this algorithm uses a stack to handle operators and parentheses:

```python
def infix_to_postfix(expression):
    """
    Convert infix expression to postfix using Shunting Yard algorithm.
  
    Key principles:
    1. Operands go directly to output
    2. Operators go to stack, but with precedence rules
    3. Higher precedence operators "push out" lower precedence ones
    4. Parentheses create temporary highest precedence contexts
    """
  
    # Define operator precedence (higher number = higher precedence)
    precedence = {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}
  
    # Right associative operators (only ^ in our case)
    right_associative = {'^'}
  
    output = []        # Our result (postfix expression)
    operator_stack = []  # Stack for operators and parentheses
  
    # Process each token in the infix expression
    i = 0
    while i < len(expression):
        char = expression[i]
      
        if char.isdigit():
            # Handle multi-digit numbers
            num = ''
            while i < len(expression) and expression[i].isdigit():
                num += expression[i]
                i += 1
            output.append(num)
            i -= 1  # Adjust for the outer loop increment
          
        elif char in precedence:
            # It's an operator
            while (operator_stack and 
                   operator_stack[-1] != '(' and
                   operator_stack[-1] in precedence and
                   (precedence[operator_stack[-1]] > precedence[char] or
                    (precedence[operator_stack[-1]] == precedence[char] and 
                     char not in right_associative))):
                output.append(operator_stack.pop())
            operator_stack.append(char)
          
        elif char == '(':
            # Opening parenthesis - push to stack
            operator_stack.append(char)
          
        elif char == ')':
            # Closing parenthesis - pop until matching opening
            while operator_stack and operator_stack[-1] != '(':
                output.append(operator_stack.pop())
            operator_stack.pop()  # Remove the '('
          
        # Skip spaces and other characters
        i += 1
  
    # Pop remaining operators from stack
    while operator_stack:
        output.append(operator_stack.pop())
  
    return ' '.join(output)
```

Let's trace through the conversion of `"3 + 4 * 2"`:

```
Processing "3 + 4 * 2":

Step 1: char='3' → operand → output=['3'], stack=[]
Step 2: char='+' → operator → output=['3'], stack=['+']
Step 3: char='4' → operand → output=['3','4'], stack=['+']
Step 4: char='*' → operator, higher precedence than '+' 
        → output=['3','4'], stack=['+','*']
Step 5: char='2' → operand → output=['3','4','2'], stack=['+','*']
Step 6: End of input → pop all operators
        → output=['3','4','2','*','+'], stack=[]

Result: "3 4 2 * +"
```

> **The magic happens in step 4:** When we encounter `*`, we don't immediately pop `+` because `*` has higher precedence. This ensures that `4 * 2` is evaluated before adding to `3`.

### Part 2: Postfix Expression Evaluation

Once we have a postfix expression, evaluation becomes beautifully simple:

```python
def evaluate_postfix(postfix_expr):
    """
    Evaluate a postfix expression using a stack.
  
    The algorithm is elegantly simple:
    1. Scan from left to right
    2. If operand, push to stack
    3. If operator, pop two operands, compute, push result
    """
  
    stack = []
    tokens = postfix_expr.split()
  
    for token in tokens:
        if token.isdigit():
            # It's an operand - push to stack
            stack.append(int(token))
        else:
            # It's an operator - pop two operands and compute
            if len(stack) < 2:
                raise ValueError("Invalid postfix expression")
          
            # Note: order matters! Second popped is first operand
            operand2 = stack.pop()
            operand1 = stack.pop()
          
            if token == '+':
                result = operand1 + operand2
            elif token == '-':
                result = operand1 - operand2
            elif token == '*':
                result = operand1 * operand2
            elif token == '/':
                result = operand1 / operand2
            else:
                raise ValueError(f"Unknown operator: {token}")
          
            stack.append(result)
  
    # Final result should be the only item left in stack
    if len(stack) != 1:
        raise ValueError("Invalid postfix expression")
  
    return stack[0]
```

Let's trace through evaluating `"3 4 2 * +"`:

```
Evaluating "3 4 2 * +":

Step 1: token='3' → push → stack=[3]
Step 2: token='4' → push → stack=[3, 4]  
Step 3: token='2' → push → stack=[3, 4, 2]
Step 4: token='*' → pop 2 and 4, compute 4*2=8, push → stack=[3, 8]
Step 5: token='+' → pop 8 and 3, compute 3+8=11, push → stack=[11]

Result: 11
```

### Visual Stack Evolution

```
"3 4 2 * +"

Token: 3      Token: 4      Token: 2      Token: *      Token: +
┌─────┐      ┌─────┐       ┌─────┐       ┌─────┐       ┌─────┐
│     │      │  4  │       │  2  │       │     │       │     │
│     │      │  3  │       │  4  │       │  8  │       │ 11  │
│  3  │      │     │       │  3  │       │  3  │       │     │
└─────┘      └─────┘       └─────┘       └─────┘       └─────┘
```

## Combined Example: Complete Expression Evaluation

Let's put it all together with a complex example:

```python
def evaluate_infix_expression(infix_expr):
    """
    Complete pipeline: infix → postfix → result
    """
    print(f"Original infix: {infix_expr}")
  
    # Step 1: Convert to postfix
    postfix = infix_to_postfix(infix_expr)
    print(f"Postfix form: {postfix}")
  
    # Step 2: Evaluate postfix
    result = evaluate_postfix(postfix)
    print(f"Final result: {result}")
  
    return result

# Test with a complex expression
expression = "3 + 4 * 2 / ( 1 - 5 ) ^ 2"
result = evaluate_infix_expression(expression)
```

> **This two-step process mirrors how calculators and programming language interpreters work internally. The separation of concerns makes the problem much more manageable.**

## FAANG Interview Perspectives and Variations

### Common Interview Variations

**1. Basic Parentheses Matching**

```python
# Leetcode #20: Valid Parentheses
def isValid(s):
    # Standard implementation we covered above
    pass
```

**2. Expression Evaluation with Variables**

```python
# Handle expressions like "a + b * c" with variable substitution
def evaluate_with_variables(expression, variables):
    # Modify our postfix evaluator to handle variable lookup
    pass
```

**3. Calculator Implementation**

```python
# Leetcode #224: Basic Calculator
# Must handle spaces, parentheses, and basic operators in real-time
def calculate(s):
    # Single-pass evaluation using stack
    pass
```

### Performance Analysis

> **Time Complexity:** O(n) for both parentheses matching and expression evaluation, where n is the length of the input string. Each character is processed exactly once.

> **Space Complexity:** O(n) in the worst case for the stack. For parentheses matching, this occurs with expressions like "((((". For expression evaluation, this occurs with expressions having many operands before operators.

### Interview Tips and Common Pitfalls

**1. Handle Edge Cases**

```python
# Empty strings, single characters, malformed expressions
test_cases = ["", "(", ")", "((", "))", "((()))", "()()()"]
```

**2. Operator Precedence Mistakes**

```python
# Remember: *, / have higher precedence than +, -
# ^ (exponentiation) is right-associative: 2^3^2 = 2^(3^2) = 2^9
```

**3. Postfix Evaluation Order**

```python
# When popping for binary operators:
# Second popped is the FIRST operand
operand2 = stack.pop()  # This was pushed later
operand1 = stack.pop()  # This was pushed earlier
result = operand1 operator operand2
```

### Advanced Extensions

For senior-level interviews, you might encounter:

**1. Multi-digit Number Handling**

* Parsing "123 + 456" correctly
* Decimal number support

**2. Function Calls in Expressions**

* Handling "sin(3.14) + cos(0)"
* Nested function calls

**3. Error Handling and Recovery**

* Graceful handling of malformed input
* Meaningful error messages

## Conclusion: The Stack Mindset

> **The key insight for FAANG interviews is recognizing when a problem exhibits nested, hierarchical structure or requires processing in reverse order. These are strong indicators that a stack-based solution will be elegant and efficient.**

Both parentheses matching and expression evaluation demonstrate the stack's power in handling:

* **Nested structures** (brackets within brackets, operations within parentheses)
* **Context preservation** (remembering what we're "inside of")
* **Natural reversal** (most recent context processed first)

Understanding these applications deeply will prepare you not just for these specific problems, but for recognizing the stack pattern in novel situations during your FAANG interviews.
