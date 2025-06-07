# Stack Implementation: A Complete Guide from First Principles

Let's embark on a journey to understand one of the most fundamental data structures in computer science - the  **Stack** . We'll build this understanding from the ground up, exploring every detail that matters for both conceptual clarity and FAANG interview success.

## Understanding Stacks from First Principles

> **What is a Stack?**
> A stack is a linear data structure that follows the **Last In, First Out (LIFO)** principle. Think of it as a collection of elements where you can only add or remove items from one end, called the "top" of the stack.

### Real-World Analogies

To truly grasp this concept, let's consider some everyday examples:

**1. Stack of Plates in a Cafeteria**

```
    [Plate 4] ← Top (last added, first to be removed)
    [Plate 3]
    [Plate 2] 
    [Plate 1] ← Bottom (first added, last to be removed)
```

**2. Browser History**

```
    [Current Page] ← Most recent
    [Previous Page]
    [Home Page] ← Starting point
```

> **Core Insight:** In both examples, the most recently added item is the first one to be accessed or removed. This is the essence of LIFO behavior.

## Fundamental Stack Operations

Every stack implementation must support these essential operations:

### Primary Operations

* **Push** : Add an element to the top of the stack
* **Pop** : Remove and return the top element from the stack
* **Peek/Top** : View the top element without removing it
* **isEmpty** : Check if the stack is empty

### Additional Operations

* **Size** : Get the number of elements in the stack
* **isFull** : Check if the stack is full (relevant for fixed-size implementations)

Let's visualize how these operations work:

```
Initial State: Empty Stack
[]

After push(10):
[10] ← top

After push(20):
[20] ← top
[10]

After push(30):
[30] ← top
[20]
[10]

After pop() → returns 30:
[20] ← top
[10]

After peek() → returns 20 (without removing):
[20] ← top
[10]
```

## Implementation 1: Array-Based Stack

Let's implement a stack using arrays, understanding every line of code and design decision.

```python
class ArrayStack:
    def __init__(self, capacity=100):
        """
        Initialize an empty stack with fixed capacity.
      
        Why we need capacity:
        - Arrays have fixed size in many languages
        - Prevents stack overflow in memory-constrained environments
        - Common in embedded systems and interview scenarios
        """
        self.capacity = capacity
        self.stack = [None] * capacity  # Pre-allocate array
        self.top_index = -1  # Points to the top element
      
    def is_empty(self):
        """
        Check if stack is empty.
      
        Time: O(1) - Just checking a single variable
        Space: O(1) - No extra space needed
        """
        return self.top_index == -1
      
    def is_full(self):
        """
        Check if stack has reached maximum capacity.
      
        Time: O(1)
        Space: O(1)
        """
        return self.top_index == self.capacity - 1
      
    def push(self, data):
        """
        Add element to top of stack.
      
        Process:
        1. Check if stack is full
        2. Increment top_index
        3. Insert element at new top position
        """
        if self.is_full():
            raise OverflowError("Stack is full")
          
        self.top_index += 1
        self.stack[self.top_index] = data
      
    def pop(self):
        """
        Remove and return top element.
      
        Process:
        1. Check if stack is empty
        2. Get the top element
        3. Decrement top_index (logically removes element)
        4. Return the element
        """
        if self.is_empty():
            raise IndexError("Stack is empty")
          
        data = self.stack[self.top_index]
        self.stack[self.top_index] = None  # Optional: clear reference
        self.top_index -= 1
        return data
      
    def peek(self):
        """
        View top element without removing it.
        """
        if self.is_empty():
            raise IndexError("Stack is empty")
          
        return self.stack[self.top_index]
      
    def size(self):
        """
        Return number of elements in stack.
        """
        return self.top_index + 1
```

### Let's Trace Through an Example

```python
# Create a stack with capacity 5
stack = ArrayStack(5)

# Step 1: Push elements
stack.push(10)
# Internal state: stack = [10, None, None, None, None], top_index = 0

stack.push(20)
# Internal state: stack = [10, 20, None, None, None], top_index = 1

stack.push(30)
# Internal state: stack = [10, 20, 30, None, None], top_index = 2

# Step 2: Peek operation
top_element = stack.peek()  # Returns 30
# Internal state unchanged: top_index = 2

# Step 3: Pop operations
popped = stack.pop()  # Returns 30
# Internal state: stack = [10, 20, None, None, None], top_index = 1

popped = stack.pop()  # Returns 20
# Internal state: stack = [10, None, None, None, None], top_index = 0
```

> **Important Design Decision:** We use `top_index = -1` for an empty stack because it makes the logic cleaner. When we push the first element, `top_index` becomes 0, which directly corresponds to the first array position.

## Implementation 2: Linked List-Based Stack

Now let's implement a stack using a linked list, which offers different trade-offs.

```python
class Node:
    """
    Individual node in the linked list.
  
    Why we need this:
    - Each element needs to store data and reference to next element
    - Enables dynamic memory allocation
    - No fixed capacity limitation
    """
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedListStack:
    def __init__(self):
        """
        Initialize empty stack.
      
        Key insight: We maintain a reference to the top node.
        This becomes our entry point for all operations.
        """
        self.top_node = None
        self.stack_size = 0  # Optional: for O(1) size operation
      
    def is_empty(self):
        """
        Check if stack is empty.
      
        Time: O(1)
        Space: O(1)
        """
        return self.top_node is None
      
    def push(self, data):
        """
        Add element to top of stack.
      
        Process:
        1. Create new node with the data
        2. Point new node's next to current top
        3. Update top to point to new node
      
        Why this works:
        - New node becomes the new top
        - Previous top becomes second element
        - Chain of references maintained
        """
        new_node = Node(data)
        new_node.next = self.top_node  # Link to previous top
        self.top_node = new_node       # Update top reference
        self.stack_size += 1
      
    def pop(self):
        """
        Remove and return top element.
      
        Process:
        1. Check if stack is empty
        2. Save data from top node
        3. Update top to point to next node
        4. Return saved data
      
        Memory management:
        - Old top node becomes unreachable
        - Garbage collector will clean it up
        """
        if self.is_empty():
            raise IndexError("Stack is empty")
          
        data = self.top_node.data
        self.top_node = self.top_node.next  # Move top to next node
        self.stack_size -= 1
        return data
      
    def peek(self):
        """
        View top element without removing it.
        """
        if self.is_empty():
            raise IndexError("Stack is empty")
          
        return self.top_node.data
      
    def size(self):
        """
        Return number of elements in stack.
        """
        return self.stack_size
```

### Visualizing Linked List Stack Operations

Let's trace through operations with visual representations:

```
Initial State: Empty Stack
top_node → None

After push(10):
top_node → [10|next] → None

After push(20):
top_node → [20|next] → [10|next] → None

After push(30):
top_node → [30|next] → [20|next] → [10|next] → None

After pop() → returns 30:
top_node → [20|next] → [10|next] → None
(Node with 30 gets garbage collected)

After peek() → returns 20:
top_node → [20|next] → [10|next] → None
(No change in structure)
```

> **Key Insight:** In linked list implementation, the "top" of the stack is actually the head of the linked list. We always insert and remove from the head for O(1) operations.

## Comprehensive Comparison: Array vs Linked List

| Aspect                      | Array Implementation           | Linked List Implementation       |
| --------------------------- | ------------------------------ | -------------------------------- |
| **Memory Usage**      | Continuous memory block        | Scattered memory locations       |
| **Cache Performance** | Better (locality of reference) | Worse (random memory access)     |
| **Memory Overhead**   | Lower (just data)              | Higher (data + pointer per node) |
| **Capacity**          | Fixed (must specify upfront)   | Dynamic (grows as needed)        |
| **Memory Allocation** | All at once                    | On-demand                        |

### Time Complexity Analysis

> **All Core Operations: O(1)**
>
> Both implementations achieve constant time for push, pop, peek, and isEmpty operations. This is crucial for FAANG interviews where efficiency is paramount.

```python
# Time complexity breakdown for both implementations:

# Push: O(1)
# - Array: Just increment index and assign value
# - Linked List: Create node and update references

# Pop: O(1) 
# - Array: Get value and decrement index
# - Linked List: Update top reference and return data

# Peek: O(1)
# - Array: Access element at top_index
# - Linked List: Access data in top_node

# isEmpty: O(1)
# - Array: Check if top_index == -1
# - Linked List: Check if top_node == None
```

### Space Complexity Analysis

```python
# Array Implementation:
# - Space: O(capacity) - fixed allocation regardless of actual usage
# - Example: Stack with capacity 1000 uses memory for 1000 elements
#           even if only 10 elements are stored

# Linked List Implementation:  
# - Space: O(n) where n = number of elements actually stored
# - Example: Stack with 10 elements uses memory for exactly 10 nodes
#           plus their associated pointers
```

## FAANG Interview Perspective

### When Interviewers Ask About Stacks

> **Common Interview Scenarios:**
>
> 1. "Implement a stack and explain your choice of underlying data structure"
> 2. "Design a stack that supports min/max operations in O(1)"
> 3. "Solve expression evaluation problems"
> 4. "Implement browser history functionality"

### Sample Interview Problem: Valid Parentheses

Let's solve a classic stack problem to demonstrate practical usage:

```python
def is_valid_parentheses(s):
    """
    Check if string has valid parentheses arrangement.
  
    Examples:
    "()" → True
    "()[]{}" → True  
    "(]" → False
    "([)]" → False
  
    Strategy:
    1. Use stack to track opening brackets
    2. For closing brackets, check if they match most recent opening
    3. LIFO nature of stack perfectly matches nesting structure
    """
    stack = []
  
    # Mapping of closing to opening brackets
    bracket_map = {')': '(', '}': '{', ']': '['}
  
    for char in s:
        if char in bracket_map:  # Closing bracket
            if not stack or stack.pop() != bracket_map[char]:
                return False
        else:  # Opening bracket
            stack.append(char)
  
    # Valid if no unmatched opening brackets remain
    return len(stack) == 0

# Let's trace through example "(())"
# char='(' → stack=['(']
# char='(' → stack=['(', '('] 
# char=')' → pop '(' → stack=['(']
# char=')' → pop '(' → stack=[]
# Return True (empty stack)
```

> **Why Stack is Perfect Here:** The nested structure of parentheses naturally follows LIFO - the most recently opened bracket should be the first to close.

### Advanced Stack Problem: Min Stack

```python
class MinStack:
    """
    Stack that supports retrieving minimum element in O(1).
  
    Key insight: Use auxiliary stack to track minimums.
    When we push/pop, we also update our minimum tracking.
    """
  
    def __init__(self):
        self.stack = []
        self.min_stack = []  # Parallel stack for minimums
      
    def push(self, val):
        self.stack.append(val)
      
        # Update minimum stack
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
          
    def pop(self):
        if not self.stack:
            return None
          
        val = self.stack.pop()
      
        # If we're removing current minimum, update min_stack
        if val == self.min_stack[-1]:
            self.min_stack.pop()
          
        return val
      
    def top(self):
        return self.stack[-1] if self.stack else None
      
    def get_min(self):
        return self.min_stack[-1] if self.min_stack else None

# Example usage:
# push(3) → stack=[3], min_stack=[3]
# push(1) → stack=[3,1], min_stack=[3,1] 
# push(2) → stack=[3,1,2], min_stack=[3,1]
# get_min() → returns 1
# pop() → returns 2, stacks: [3,1] and [3,1]
# get_min() → returns 1
```

## Choosing the Right Implementation

### Use Array-Based Stack When:

* **Memory efficiency is critical** (embedded systems)
* **Cache performance matters** (high-frequency operations)
* **Maximum capacity is known** beforehand
* **Implementing in systems programming** languages

### Use Linked List-Based Stack When:

* **Dynamic sizing is required** (unknown capacity)
* **Memory is abundant** but you want to use only what's needed
* **Implementing in garbage-collected** languages
* **Building complex data structures** that need flexibility

> **FAANG Interview Tip:** Always discuss trade-offs explicitly. Interviewers want to see you understand the implications of your design choices, not just the implementation details.

### Code Quality Best Practices

```python
# Good practices for interview coding:

class Stack:
    def __init__(self):
        # Clear, descriptive variable names
        self.elements = []
      
    def push(self, item):
        # Input validation (defensive programming)
        if item is None:
            raise ValueError("Cannot push None to stack")
        self.elements.append(item)
      
    def pop(self):
        # Proper error handling
        if self.is_empty():
            raise IndexError("Cannot pop from empty stack")
        return self.elements.pop()
      
    def is_empty(self):
        # Simple, readable boolean logic
        return len(self.elements) == 0
      
    def __len__(self):
        # Pythonic special methods when appropriate
        return len(self.elements)
      
    def __str__(self):
        # Helpful for debugging during interviews
        return f"Stack({self.elements})"
```

Understanding stacks from these first principles - their LIFO nature, implementation trade-offs, and practical applications - gives you the foundation to tackle any stack-related problem in FAANG interviews. The key is not just knowing how to implement them, but understanding when and why to choose each approach.
