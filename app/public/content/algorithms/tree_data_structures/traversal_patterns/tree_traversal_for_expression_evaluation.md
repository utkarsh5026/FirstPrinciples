# Tree Traversal for Expression Evaluation: A Complete FAANG Interview Guide

## Foundation: Understanding the Building Blocks

Before diving into tree traversal for expression evaluation, let's establish the fundamental concepts from first principles.

### What is an Expression?

> **Core Concept** : An expression is a combination of operands (numbers, variables) and operators (+, -, *, /) that can be evaluated to produce a result.

Consider this simple mathematical expression: `3 + 4 * 2`

In our daily life, we evaluate this using operator precedence rules:

* First: `4 * 2 = 8`
* Then: `3 + 8 = 11`

But how does a computer understand and evaluate such expressions? This is where **expression trees** come into play.

### Why Trees for Expressions?

Trees provide a natural way to represent the hierarchical structure of mathematical expressions, where:

* **Leaf nodes** contain operands (numbers/variables)
* **Internal nodes** contain operators
* **Tree structure** naturally encodes operator precedence and associativity

## Expression Tree Fundamentals

### Building an Expression Tree

Let's construct an expression tree for `3 + 4 * 2` step by step:

```
Step 1: Identify precedence
   * has higher precedence than +

Step 2: Build tree bottom-up
        +
       / \
      3   *
         / \
        4   2
```

Here's how we can represent this in code:

```python
class TreeNode:
    def __init__(self, value):
        self.value = value      # The operator or operand
        self.left = None        # Left child
        self.right = None       # Right child
        self.is_operator = value in "+-*/"  # Check if node is operator

# Building our expression tree for "3 + 4 * 2"
def build_sample_tree():
    # Create the root node with '+' operator
    root = TreeNode('+')
  
    # Left subtree is just the operand '3'
    root.left = TreeNode('3')
  
    # Right subtree is the '*' operation
    root.right = TreeNode('*')
    root.right.left = TreeNode('4')
    root.right.right = TreeNode('2')
  
    return root
```

**Code Explanation:**

* `TreeNode` class represents each node in our expression tree
* `value` stores either an operator (+, -, *, /) or an operand (number)
* `is_operator` helps us distinguish between operators and operands during traversal
* The tree structure naturally represents that multiplication should be evaluated before addition

## The Three Fundamental Traversals

### 1. Inorder Traversal (Left → Root → Right)

> **Key Insight** : Inorder traversal of an expression tree gives us the **infix notation** - the way we naturally write mathematical expressions.

```python
def inorder_traversal(node, result):
    """
    Performs inorder traversal and builds infix expression
    Time Complexity: O(n) where n is number of nodes
    Space Complexity: O(h) where h is height of tree (recursion stack)
    """
    if node is None:
        return
  
    # If current node is an operator, add opening parenthesis
    if node.is_operator:
        result.append('(')
  
    # Traverse left subtree first
    inorder_traversal(node.left, result)
  
    # Visit current node (add operator/operand to result)
    result.append(node.value)
  
    # Traverse right subtree
    inorder_traversal(node.right, result)
  
    # If current node is an operator, add closing parenthesis
    if node.is_operator:
        result.append(')')

# Example usage
root = build_sample_tree()
result = []
inorder_traversal(root, result)
print(''.join(result))  # Output: ((3)+(4*2))
```

**Detailed Code Analysis:**

* We traverse the left subtree completely before visiting the current node
* Then we visit the current node (add its value to result)
* Finally, we traverse the right subtree
* Parentheses are added around operators to maintain precedence clarity
* The recursion naturally handles the tree structure

### 2. Preorder Traversal (Root → Left → Right)

> **Key Insight** : Preorder traversal gives us **prefix notation** (Polish notation), where operators come before their operands.

```python
def preorder_traversal(node, result):
    """
    Performs preorder traversal and builds prefix expression
    Useful for building expression trees from prefix notation
    """
    if node is None:
        return
  
    # Visit current node first
    result.append(node.value)
  
    # Then traverse left subtree
    preorder_traversal(node.left, result)
  
    # Finally traverse right subtree
    preorder_traversal(node.right, result)

# Example usage
root = build_sample_tree()
result = []
preorder_traversal(root, result)
print(' '.join(result))  # Output: + 3 * 4 2
```

**Why Prefix is Useful:**

* No need for parentheses or precedence rules
* Easy to evaluate using a stack
* Natural for recursive evaluation

### 3. Postorder Traversal (Left → Right → Root)

> **Key Insight** : Postorder traversal gives us **postfix notation** (Reverse Polish notation), which is ideal for evaluation because we encounter operands before their operators.

```python
def postorder_traversal(node, result):
    """
    Performs postorder traversal and builds postfix expression
    This is the most efficient for evaluation
    """
    if node is None:
        return
  
    # Traverse left subtree first
    postorder_traversal(node.left, result)
  
    # Then traverse right subtree
    postorder_traversal(node.right, result)
  
    # Visit current node last
    result.append(node.value)

# Example usage
root = build_sample_tree()
result = []
postorder_traversal(root, result)
print(' '.join(result))  # Output: 3 4 2 * +
```

## Expression Evaluation Using Tree Traversal

### Method 1: Direct Tree Evaluation (Postorder-based)

```python
def evaluate_expression_tree(node):
    """
    Evaluates expression tree using postorder logic
    Time Complexity: O(n)
    Space Complexity: O(h) for recursion stack
    """
    # Base case: if it's a leaf node (operand)
    if not node.is_operator:
        return float(node.value)
  
    # Recursive case: evaluate left and right subtrees first
    left_value = evaluate_expression_tree(node.left)
    right_value = evaluate_expression_tree(node.right)
  
    # Then apply the operator at current node
    if node.value == '+':
        return left_value + right_value
    elif node.value == '-':
        return left_value - right_value
    elif node.value == '*':
        return left_value * right_value
    elif node.value == '/':
        if right_value == 0:
            raise ValueError("Division by zero")
        return left_value / right_value

# Example usage
root = build_sample_tree()
result = evaluate_expression_tree(root)
print(f"Result: {result}")  # Output: Result: 11.0
```

**Step-by-step Evaluation for `3 + 4 * 2`:**

1. Start at root (+)
2. Evaluate left subtree: returns 3
3. Evaluate right subtree (*):
   * Left of * returns 4
   * Right of * returns 2
   * Apply *: 4 * 2 = 8
4. Apply +: 3 + 8 = 11

### Method 2: Stack-based Evaluation from Postfix

```python
def evaluate_postfix(expression):
    """
    Evaluates postfix expression using stack
    This simulates what happens during postorder traversal
    """
    stack = []
  
    for token in expression:
        if token not in "+-*/":
            # It's an operand, push to stack
            stack.append(float(token))
        else:
            # It's an operator, pop two operands
            if len(stack) < 2:
                raise ValueError("Invalid expression")
          
            right = stack.pop()  # Second operand
            left = stack.pop()   # First operand
          
            # Apply operator and push result back
            if token == '+':
                result = left + right
            elif token == '-':
                result = left - right
            elif token == '*':
                result = left * right
            elif token == '/':
                if right == 0:
                    raise ValueError("Division by zero")
                result = left / right
          
            stack.append(result)
  
    if len(stack) != 1:
        raise ValueError("Invalid expression")
  
    return stack[0]

# Convert our tree to postfix and evaluate
root = build_sample_tree()
postfix = []
postorder_traversal(root, postfix)
result = evaluate_postfix(postfix)
print(f"Result: {result}")  # Output: Result: 11.0
```

## Advanced Example: Complex Expression Tree

Let's work with a more complex expression: `(a + b) * (c - d) / e`

```
Tree structure:
        /
       / \
      *   e
     / \
    +   -
   / \ / \
  a  b c  d
```

```python
def build_complex_tree():
    """
    Builds tree for expression: (a + b) * (c - d) / e
    """
    # Root is division
    root = TreeNode('/')
    root.right = TreeNode('e')
  
    # Left subtree is multiplication
    root.left = TreeNode('*')
  
    # Left of multiplication is addition
    root.left.left = TreeNode('+')
    root.left.left.left = TreeNode('a')
    root.left.left.right = TreeNode('b')
  
    # Right of multiplication is subtraction
    root.left.right = TreeNode('-')
    root.left.right.left = TreeNode('c')
    root.left.right.right = TreeNode('d')
  
    return root

# Test all three traversals
complex_root = build_complex_tree()

# Inorder (infix)
infix = []
inorder_traversal(complex_root, infix)
print("Infix:", ''.join(infix))

# Preorder (prefix)
prefix = []
preorder_traversal(complex_root, prefix)
print("Prefix:", ' '.join(prefix))

# Postorder (postfix)
postfix = []
postorder_traversal(complex_root, postfix)
print("Postfix:", ' '.join(postfix))
```

## FAANG Interview Perspectives

### What Interviewers Look For

> **Critical Success Factors** : Understanding of tree traversal algorithms, ability to connect mathematical concepts with programming, and efficient problem-solving approach.

### Common Interview Questions

**Question 1: Basic Expression Evaluation**

```python
def solve_basic_evaluation(root):
    """
    Given an expression tree, return its evaluation
    Focus: Correct traversal choice and implementation
    """
    # Use postorder logic for natural evaluation
    if not root:
        return 0
  
    if not root.is_operator:
        return int(root.value)
  
    left_val = solve_basic_evaluation(root.left)
    right_val = solve_basic_evaluation(root.right)
  
    # Apply operator
    ops = {
        '+': lambda x, y: x + y,
        '-': lambda x, y: x - y,
        '*': lambda x, y: x * y,
        '/': lambda x, y: x // y if y != 0 else 0
    }
  
    return ops[root.value](left_val, right_val)
```

**Question 2: Convert Infix to Postfix using Trees**

```python
def infix_to_postfix_via_tree(infix_expr):
    """
    Convert infix expression to postfix using expression tree
    This demonstrates understanding of tree construction + traversal
    """
    # Step 1: Build expression tree from infix
    tree = build_expression_tree(infix_expr)
  
    # Step 2: Get postfix via postorder traversal
    result = []
    postorder_traversal(tree, result)
  
    return result
```

### Time and Space Complexity Analysis

> **Interview Tip** : Always analyze complexity for both time and space, considering the recursion stack.

| Operation         | Time Complexity | Space Complexity | Notes                                |
| ----------------- | --------------- | ---------------- | ------------------------------------ |
| Tree Construction | O(n)            | O(n)             | Where n is expression length         |
| Any Traversal     | O(n)            | O(h)             | h is tree height, O(log n) best case |
| Evaluation        | O(n)            | O(h)             | Single pass through tree             |

### Mobile-Optimized Algorithm Visualization

```
Postorder Evaluation Steps for 3 + 4 * 2:

Step 1: Visit leftmost leaf
   +
  /│\
 3 │ *
   │/ \
   4   2
   ↑
 start here

Step 2: Continue postorder
   +
  /│\
 ✓ │ *
   │/ \
   4   2
   ↑
 return 3

Step 3: Go to multiplication
   +
  /│\
 ✓ │ *
   │/ \
   ✓   ✓
   ↑
 4*2=8, return 8

Step 4: Apply root operation
   ✓
  /│\
 3 │ 8
   │
   ↑
 3+8=11, return 11
```

## Practice Problems for FAANG Interviews

### Problem 1: Expression Tree with Variables

```python
def evaluate_with_variables(root, variables):
    """
    Evaluate expression tree where leaves can be variables
    variables: dict mapping variable names to values
    """
    if not root:
        return 0
  
    # Base case: leaf node
    if not root.is_operator:
        if root.value.isdigit():
            return int(root.value)
        else:
            # It's a variable
            return variables.get(root.value, 0)
  
    # Recursive case: apply operator
    left_val = evaluate_with_variables(root.left, variables)
    right_val = evaluate_with_variables(root.right, variables)
  
    operators = {
        '+': left_val + right_val,
        '-': left_val - right_val,
        '*': left_val * right_val,
        '/': left_val // right_val if right_val != 0 else 0
    }
  
    return operators[root.value]

# Example usage
variables = {'a': 5, 'b': 3, 'c': 8, 'd': 2, 'e': 2}
result = evaluate_with_variables(complex_root, variables)
print(f"Result with variables: {result}")
```

### Problem 2: Iterative Traversal (Space-Optimized)

```python
def iterative_postorder_evaluation(root):
    """
    Evaluate expression tree using iterative postorder traversal
    More space-efficient for very deep trees
    """
    if not root:
        return 0
  
    stack = []
    values = {}  # Store computed values for each node
    last_visited = None
    current = root
  
    while stack or current:
        # Go to leftmost node
        if current:
            stack.append(current)
            current = current.left
        else:
            # Peek at stack top
            peek_node = stack[-1]
          
            # If right child exists and hasn't been processed
            if peek_node.right and last_visited != peek_node.right:
                current = peek_node.right
            else:
                # Process current node
                if not peek_node.is_operator:
                    values[peek_node] = int(peek_node.value)
                else:
                    left_val = values[peek_node.left]
                    right_val = values[peek_node.right]
                  
                    if peek_node.value == '+':
                        values[peek_node] = left_val + right_val
                    elif peek_node.value == '-':
                        values[peek_node] = left_val - right_val
                    elif peek_node.value == '*':
                        values[peek_node] = left_val * right_val
                    elif peek_node.value == '/':
                        values[peek_node] = left_val // right_val
              
                last_visited = stack.pop()
  
    return values[root]
```

## Key Takeaways for FAANG Success

> **Essential Understanding** : Tree traversal for expression evaluation is fundamentally about choosing the right traversal order to match the mathematical operation you want to perform.

**The Three Golden Rules:**

1. **Postorder** for evaluation (operands before operators)
2. **Inorder** for readable infix expressions
3. **Preorder** for prefix notation and tree reconstruction

**Interview Success Tips:**

* Always explain your traversal choice and why it's optimal
* Handle edge cases (division by zero, null nodes, invalid expressions)
* Discuss both recursive and iterative approaches
* Analyze time/space complexity clearly
* Practice with variable expressions, not just constants

This comprehensive understanding of tree traversal for expression evaluation will serve you well in FAANG interviews, where the combination of mathematical insight and algorithmic thinking is highly valued.
