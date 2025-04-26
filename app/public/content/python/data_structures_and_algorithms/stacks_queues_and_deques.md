# Python Data Structures: Stacks, Queues, and Deques

I'll explain these fundamental data structures from first principles, showing you both their conceptual foundations and practical implementations in Python.

## 1. Stack - The LIFO Structure

### First Principles of Stacks

A stack is a collection where items are added and removed from the same end, following the Last-In-First-Out (LIFO) principle. Think about a stack of plates in a cafeteria - you add and remove plates from the top.

The core operations of a stack are:

* **Push** : Add an item to the top
* **Pop** : Remove and return the item from the top
* **Peek/Top** : View the top item without removing it
* **isEmpty** : Check if the stack contains any items

### Real-World Stack Examples

1. The call stack in programming languages
2. The undo functionality in text editors
3. Browser history (back button navigation)
4. Syntax parsing for balanced parentheses

### Python Implementation of a Stack

There are multiple ways to implement a stack in Python:

#### Using a List

```python
class Stack:
    def __init__(self):
        self.items = []
  
    def push(self, item):
        self.items.append(item)  # Add to the end of list
  
    def pop(self):
        if not self.is_empty():
            return self.items.pop()  # Remove from the end
        return None
  
    def peek(self):
        if not self.is_empty():
            return self.items[-1]  # Look at the last item
        return None
  
    def is_empty(self):
        return len(self.items) == 0
  
    def size(self):
        return len(self.items)
```

This implementation uses Python's built-in list, with `.append()` for push and `.pop()` for pop operations. Since both operations work on the end of the list, they are O(1) - constant time operations.

#### Stack Example Usage

```python
def check_balanced_parentheses(expression):
    stack = Stack()
  
    # Define matching pairs
    pairs = {')': '(', '}': '{', ']': '['}
  
    for char in expression:
        # If opening bracket, push to stack
        if char in '({[':
            stack.push(char)
        # If closing bracket, check if matches the top of stack
        elif char in ')}]':
            if stack.is_empty() or stack.pop() != pairs[char]:
                return False
  
    # If stack is empty, all brackets were matched
    return stack.is_empty()

# Test the function
print(check_balanced_parentheses("((1+2)*(3-4))"))  # True
print(check_balanced_parentheses("{[()]}"))         # True
print(check_balanced_parentheses("({)}"))           # False
```

This example checks if parentheses in an expression are balanced using a stack. When we see an opening bracket, we push it onto the stack. When we see a closing bracket, we check if it matches the most recent opening bracket (which will be at the top of our stack).

## 2. Queue - The FIFO Structure

### First Principles of Queues

A queue is a collection where items are added at one end and removed from the other, following the First-In-First-Out (FIFO) principle. This mirrors a real-world line of people waiting - the first person to join the line is the first one served.

The core operations of a queue are:

* **Enqueue** : Add an item to the back of the queue
* **Dequeue** : Remove and return the item from the front of the queue
* **Front** : View the front item without removing it
* **isEmpty** : Check if the queue contains any items

### Real-World Queue Examples

1. Print job queues
2. Operating system process scheduling
3. Customer service queues
4. Breadth-first search algorithm in graph traversal
5. Message queues in distributed systems

### Python Implementation of a Queue

#### Using a List

```python
class Queue:
    def __init__(self):
        self.items = []
  
    def enqueue(self, item):
        self.items.append(item)  # Add to the end
  
    def dequeue(self):
        if not self.is_empty():
            return self.items.pop(0)  # Remove from the front
        return None
  
    def front(self):
        if not self.is_empty():
            return self.items[0]  # Look at the first item
        return None
  
    def is_empty(self):
        return len(self.items) == 0
  
    def size(self):
        return len(self.items)
```

Notice a key difference from our stack implementation: `dequeue()` uses `pop(0)` to remove from the beginning of the list. This is O(n) time complexity since all remaining elements must be shifted.

#### Using collections.deque (More Efficient)

```python
from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
  
    def enqueue(self, item):
        self.items.append(item)  # Add to the right end
  
    def dequeue(self):
        if not self.is_empty():
            return self.items.popleft()  # Remove from the left end
        return None
  
    def front(self):
        if not self.is_empty():
            return self.items[0]
        return None
  
    def is_empty(self):
        return len(self.items) == 0
  
    def size(self):
        return len(self.items)
```

The `collections.deque` class provides O(1) operations for both ends, which makes it more efficient than a list for queue operations.

#### Queue Example Usage

```python
def simulate_hot_potato(names, num):
    """Simulate the Hot Potato game - after num passes, the person holding
    the potato is eliminated. Returns the winner."""
    queue = Queue()
  
    # Everyone joins the circle
    for name in names:
        queue.enqueue(name)
  
    # Pass the potato until one person remains
    while queue.size() > 1:
        # Pass the potato 'num' times
        for _ in range(num):
            # The person at the front gets the potato and goes to the back
            queue.enqueue(queue.dequeue())
      
        # After 'num' passes, the person with the potato is eliminated
        eliminated = queue.dequeue()
        print(f"{eliminated} is eliminated!")
  
    # Return the winner
    return queue.dequeue()

# Test the function
players = ["Alice", "Bob", "Charlie", "David", "Eve"]
winner = simulate_hot_potato(players, 3)
print(f"Winner is {winner}")
```

This example simulates the Hot Potato game. We use a queue to represent players in a circle. We continuously "pass the potato" by moving the front person to the back of the queue. After a certain number of passes, we eliminate the person holding the potato.

## 3. Deque - The Double-Ended Queue

### First Principles of Deques

A deque (pronounced "deck") is a double-ended queue that allows insertion and removal from both ends. It combines the capabilities of both stacks and queues.

The core operations of a deque are:

* **add_front** : Add an item to the front
* **add_rear** : Add an item to the back
* **remove_front** : Remove and return the front item
* **remove_rear** : Remove and return the rear item
* **isEmpty** : Check if the deque contains any items

### Real-World Deque Examples

1. Undo/redo functionality (where both operations are available)
2. Task scheduling with priority override
3. Browser navigation (both back and forward buttons)
4. Palindrome checking
5. Sliding window problems in algorithms

### Python Implementation of a Deque

#### Using collections.deque

```python
from collections import deque

class Deque:
    def __init__(self):
        self.items = deque()
  
    def add_front(self, item):
        self.items.appendleft(item)
  
    def add_rear(self, item):
        self.items.append(item)
  
    def remove_front(self):
        if not self.is_empty():
            return self.items.popleft()
        return None
  
    def remove_rear(self):
        if not self.is_empty():
            return self.items.pop()
        return None
  
    def peek_front(self):
        if not self.is_empty():
            return self.items[0]
        return None
  
    def peek_rear(self):
        if not self.is_empty():
            return self.items[-1]
        return None
  
    def is_empty(self):
        return len(self.items) == 0
  
    def size(self):
        return len(self.items)
```

Python's `collections.deque` is perfect for implementing a deque as it provides O(1) operations for both ends.

#### Custom Implementation

```python
class Deque:
    def __init__(self):
        self.items = []
  
    def add_front(self, item):
        self.items.insert(0, item)  # Insert at beginning
  
    def add_rear(self, item):
        self.items.append(item)  # Add to end
  
    def remove_front(self):
        if not self.is_empty():
            return self.items.pop(0)
        return None
  
    def remove_rear(self):
        if not self.is_empty():
            return self.items.pop()
        return None
  
    def peek_front(self):
        if not self.is_empty():
            return self.items[0]
        return None
  
    def peek_rear(self):
        if not self.is_empty():
            return self.items[-1]
        return None
  
    def is_empty(self):
        return len(self.items) == 0
  
    def size(self):
        return len(self.items)
```

Note that this list-based implementation has O(n) performance for operations on the front (`add_front` and `remove_front`), which is less efficient than using `collections.deque`.

#### Deque Example Usage

```python
def check_palindrome(text):
    """Check if a string is a palindrome using a deque."""
    # Normalize text: lowercase and remove non-alphanumeric
    cleaned_text = ''.join(char.lower() for char in text if char.isalnum())
  
    # Use a deque to compare characters from both ends
    char_deque = Deque()
  
    # Add all characters to the deque
    for char in cleaned_text:
        char_deque.add_rear(char)
  
    # Check if it's a palindrome
    while char_deque.size() > 1:
        # Remove characters from both ends and compare
        if char_deque.remove_front() != char_deque.remove_rear():
            return False
  
    return True

# Test the function
print(check_palindrome("radar"))          # True
print(check_palindrome("A man, a plan, a canal: Panama"))  # True
print(check_palindrome("hello"))          # False
```

This example uses a deque to check if a string is a palindrome. We add all characters to the deque and then compare characters from both ends simultaneously.

## Comparison of Stack, Queue, and Deque

| Operation       | Stack           | Queue                | Deque                                 |
| --------------- | --------------- | -------------------- | ------------------------------------- |
| Add             | End only (push) | End only (enqueue)   | Both ends (add_front, add_rear)       |
| Remove          | End only (pop)  | Front only (dequeue) | Both ends (remove_front, remove_rear) |
| Principle       | LIFO            | FIFO                 | Both LIFO and FIFO                    |
| Time Complexity | O(1)            | O(1)*                | O(1)*                                 |

*When using collections.deque for implementation

## Built-in Python Implementations

Python provides built-in collections that can be used directly:

```python
# Using list as a stack
stack = []
stack.append(1)     # Push
stack.append(2)     # Push
top_value = stack.pop()  # Pop (returns 2)

# Using collections.deque as a queue
from collections import deque
queue = deque()
queue.append(1)     # Enqueue
queue.append(2)     # Enqueue
front_value = queue.popleft()  # Dequeue (returns 1)

# Using collections.deque as a deque
deque_example = deque()
deque_example.append(1)      # Add to right
deque_example.appendleft(0)  # Add to left
right_value = deque_example.pop()      # Remove from right (returns 1)
left_value = deque_example.popleft()   # Remove from left (returns 0)
```

## Choosing the Right Data Structure

* Use a **stack** when you need LIFO behavior: parsing expressions, backtracking algorithms, undo functionality
* Use a **queue** when you need FIFO behavior: task scheduling, breadth-first search, request handling
* Use a **deque** when you need flexibility to work from both ends: sliding window problems, palindrome checking, work stealing algorithms

Each of these data structures has unique properties that make them suitable for different problems. Understanding their first principles will help you choose the right one for each situation.
