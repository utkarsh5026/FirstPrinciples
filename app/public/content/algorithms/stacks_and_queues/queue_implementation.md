# Queue Implementation: From First Principles to FAANG Interview Mastery

## Understanding Queues from First Principles

> **Core Principle** : A Queue is a linear data structure that follows the **FIFO (First In, First Out)** principle - the first element added is the first one to be removed.

Think of a queue like a line of people waiting at a coffee shop. The person who arrives first gets served first, and new people join at the back of the line. This is exactly how a queue data structure works.

### Real-World Queue Examples

**Physical Examples:**

* People waiting in line at a bank
* Cars waiting at a traffic light
* Print jobs waiting to be processed
* Customers calling customer service

**Computer Science Examples:**

* Process scheduling in operating systems
* Breadth-First Search (BFS) algorithm
* Handling requests in web servers
* Buffer for streaming data

## Core Queue Operations

> **Essential Operations** : Every queue must support these fundamental operations to maintain its FIFO nature.

**Primary Operations:**

1. **Enqueue** : Add an element to the rear/back of the queue
2. **Dequeue** : Remove an element from the front of the queue
3. **Front/Peek** : View the front element without removing it
4. **IsEmpty** : Check if the queue is empty
5. **Size** : Get the number of elements in the queue

Let's visualize this with a simple example:

```
Initial Queue: []

Enqueue(10): [10]
Enqueue(20): [10, 20]
Enqueue(30): [10, 20, 30]

Dequeue(): Returns 10, Queue becomes [20, 30]
Dequeue(): Returns 20, Queue becomes [30]
Front(): Returns 30 (without removing)
```

## Array-Based Queue Implementation

### The Foundation: Understanding Array-Based Approach

An array-based queue uses a fixed-size array as the underlying storage mechanism. We maintain two pointers:

* **Front pointer** : Points to the first element
* **Rear pointer** : Points to the position where the next element will be inserted

### Naive Array Implementation

Let's start with a basic approach to understand the concept:

```python
class SimpleArrayQueue:
    def __init__(self, capacity):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = 0
        self.rear = -1
        self.size = 0
  
    def enqueue(self, item):
        if self.size == self.capacity:
            raise Exception("Queue is full")
      
        self.rear += 1
        self.queue[self.rear] = item
        self.size += 1
  
    def dequeue(self):
        if self.size == 0:
            raise Exception("Queue is empty")
      
        item = self.queue[self.front]
        self.queue[self.front] = None  # Optional: clear reference
        self.front += 1
        self.size -= 1
        return item
```

**Code Explanation:**

* `__init__`: Creates an array of fixed capacity and initializes pointers
* `enqueue`: Increments rear pointer and adds element at that position
* `dequeue`: Retrieves element at front pointer and increments front pointer
* We track `size` separately to easily check empty/full conditions

**Problem with Naive Approach:**
This implementation has a critical flaw - it wastes space! Once we dequeue elements, the front part of the array becomes unusable.

```
After several enqueue/dequeue operations:
[None, None, None, 40, 50, 60]
                   ^          ^
                 front      rear
```

### Circular Array Queue: The Optimal Solution

> **Key Insight** : Use modular arithmetic to wrap around the array, treating it as a circular buffer.

```python
class CircularArrayQueue:
    def __init__(self, capacity):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = 0
        self.rear = -1
        self.size = 0
  
    def enqueue(self, item):
        if self.is_full():
            raise Exception("Queue is full")
      
        # Circular increment: wrap around using modulo
        self.rear = (self.rear + 1) % self.capacity
        self.queue[self.rear] = item
        self.size += 1
  
    def dequeue(self):
        if self.is_empty():
            raise Exception("Queue is empty")
      
        item = self.queue[self.front]
        self.queue[self.front] = None
        # Circular increment for front pointer
        self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return item
  
    def peek(self):
        if self.is_empty():
            raise Exception("Queue is empty")
        return self.queue[self.front]
  
    def is_empty(self):
        return self.size == 0
  
    def is_full(self):
        return self.size == self.capacity
```

**Detailed Code Explanation:**

1. **Circular Increment** : `(self.rear + 1) % self.capacity`

* When rear reaches the end of array, it wraps to index 0
* Example: If capacity is 5 and rear is 4, next position is (4+1)%5 = 0

1. **Size Tracking** : We maintain a separate `size` variable

* Alternative approaches use different rear initialization or complex pointer comparisons
* This approach is cleaner and less error-prone

1. **Modular Arithmetic** : The key to circular behavior

* Ensures indices always stay within [0, capacity-1] range

### Visualizing Circular Queue Operations

```
Capacity = 5, Initially empty:
[_, _, _, _, _]
 ^
front=0, rear=-1, size=0

After Enqueue(10):
[10, _, _, _, _]
 ^   ^
front=0, rear=0, size=1

After Enqueue(20), Enqueue(30):
[10, 20, 30, _, _]
 ^          ^
front=0, rear=2, size=3

After Dequeue() -> returns 10:
[_, 20, 30, _, _]
    ^      ^
front=1, rear=2, size=2

After Enqueue(40), Enqueue(50), Enqueue(60):
[60, 20, 30, 40, 50]
     ^             ^
front=1, rear=0, size=5 (full!)
```

## Linked List-Based Queue Implementation

### Understanding the Linked List Approach

> **Core Advantage** : Dynamic memory allocation - the queue can grow and shrink as needed without declaring a fixed size upfront.

A linked list queue uses nodes connected by pointers. We maintain references to both the front and rear nodes for efficient operations.

### Node Structure

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
```

**Node Explanation:**

* `data`: Stores the actual value
* `next`: Pointer to the next node in the queue
* Each node only knows about its immediate successor

### Complete Linked List Queue Implementation

```python
class LinkedListQueue:
    def __init__(self):
        self.front = None  # Points to first node
        self.rear = None   # Points to last node
        self.size = 0
  
    def enqueue(self, item):
        new_node = Node(item)
      
        # If queue is empty, new node is both front and rear
        if self.rear is None:
            self.front = self.rear = new_node
        else:
            # Add new node at the end and update rear
            self.rear.next = new_node
            self.rear = new_node
      
        self.size += 1
  
    def dequeue(self):
        if self.is_empty():
            raise Exception("Queue is empty")
      
        # Store the front node's data
        item = self.front.data
      
        # Move front pointer to next node
        self.front = self.front.next
      
        # If queue becomes empty, update rear as well
        if self.front is None:
            self.rear = None
      
        self.size -= 1
        return item
  
    def peek(self):
        if self.is_empty():
            raise Exception("Queue is empty")
        return self.front.data
  
    def is_empty(self):
        return self.front is None
  
    def get_size(self):
        return self.size
```

**Detailed Code Walkthrough:**

1. **Enqueue Process:**
   * Create a new node with the given data
   * If queue is empty: both front and rear point to new node
   * If queue has elements: link the current rear to new node, update rear
2. **Dequeue Process:**
   * Save the front node's data before removing it
   * Move front pointer to the next node
   * Handle edge case: if queue becomes empty, set rear to None too
3. **Memory Management:**
   * In languages with garbage collection (Python, Java), removed nodes are automatically cleaned up
   * In C/C++, you'd need to explicitly delete the removed node

### Visualizing Linked List Queue Operations

```
Initially empty:
front = None, rear = None

After Enqueue(10):
[10] -> None
 ^     
front, rear

After Enqueue(20):
[10] -> [20] -> None
 ^       ^
front   rear

After Enqueue(30):
[10] -> [20] -> [30] -> None
 ^               ^
front           rear

After Dequeue() -> returns 10:
[20] -> [30] -> None
 ^       ^
front   rear

After Dequeue() -> returns 20:
[30] -> None
 ^     
front, rear
```

## Time and Space Complexity Analysis

> **Performance Comparison** : Understanding when to choose each implementation approach.

### Array-Based Queue Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Enqueue   | O(1)            | O(1)             |
| Dequeue   | O(1)            | O(1)             |
| Peek      | O(1)            | O(1)             |
| IsEmpty   | O(1)            | O(1)             |

 **Overall Space** : O(n) where n is the capacity (fixed)

### Linked List Queue Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Enqueue   | O(1)            | O(1)             |
| Dequeue   | O(1)            | O(1)             |
| Peek      | O(1)            | O(1)             |
| IsEmpty   | O(1)            | O(1)             |

 **Overall Space** : O(m) where m is the actual number of elements

## FAANG Interview Considerations

### When to Use Array vs Linked List Implementation

> **Decision Framework** : Choose based on the specific requirements and constraints of the problem.

**Use Array-Based When:**

* Maximum size is known and reasonable
* Memory usage needs to be predictable
* Cache performance is critical (better locality)
* Need to avoid dynamic memory allocation overhead

**Use Linked List-Based When:**

* Size varies dramatically or is unknown
* Memory is limited and you want to use only what's needed
* No upper bound on queue size
* Flexibility is more important than slight performance overhead

### Common FAANG Interview Variations

**1. Implement Queue using Stacks**

```python
class QueueUsingStacks:
    def __init__(self):
        self.input_stack = []
        self.output_stack = []
  
    def enqueue(self, item):
        self.input_stack.append(item)
  
    def dequeue(self):
        if not self.output_stack:
            # Transfer all elements from input to output
            while self.input_stack:
                self.output_stack.append(self.input_stack.pop())
      
        if not self.output_stack:
            raise Exception("Queue is empty")
      
        return self.output_stack.pop()
```

 **Explanation** : Use two stacks to simulate FIFO behavior. Input stack receives new elements, output stack serves dequeue requests with reversed order.

**2. Circular Queue with Array (LeetCode 622)**
This is exactly our circular array implementation above - a very common interview question!

**3. Design Hit Counter (LeetCode 362)**
Uses queue principles to track events within a time window.

### Interview Tips and Best Practices

> **Success Strategy** : Demonstrate clear thinking process and handle edge cases properly.

**1. Always Ask Clarifying Questions:**

* What's the expected maximum size?
* Are there memory constraints?
* Do we need thread safety?
* What should happen on overflow/underflow?

**2. Start with the Simplest Approach:**

* Begin with basic implementation
* Discuss trade-offs
* Optimize based on requirements

**3. Handle Edge Cases:**

* Empty queue operations
* Full queue operations (for array-based)
* Single element scenarios

**4. Discuss Follow-up Optimizations:**

* Thread safety (add locks/synchronization)
* Generic types (templates in C++, generics in Java)
* Iterator support
* Priority queue extensions

### Code Quality for Interviews

```python
class InterviewReadyQueue:
    """
    Array-based circular queue implementation.
    Suitable for scenarios with known maximum capacity.
    """
  
    def __init__(self, capacity):
        if capacity <= 0:
            raise ValueError("Capacity must be positive")
      
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front = 0
        self.rear = -1
        self.size = 0
  
    def enqueue(self, item):
        """Add item to rear of queue. O(1) time complexity."""
        if self.is_full():
            raise OverflowError("Queue is full")
      
        self.rear = (self.rear + 1) % self.capacity
        self.queue[self.rear] = item
        self.size += 1
  
    def dequeue(self):
        """Remove and return item from front. O(1) time complexity."""
        if self.is_empty():
            raise IndexError("Queue is empty")
      
        item = self.queue[self.front]
        self.queue[self.front] = None  # Help GC
        self.front = (self.front + 1) % self.capacity
        self.size -= 1
        return item
  
    def peek(self):
        """Return front item without removing. O(1) time complexity."""
        if self.is_empty():
            raise IndexError("Queue is empty")
        return self.queue[self.front]
  
    def is_empty(self):
        """Check if queue is empty. O(1) time complexity."""
        return self.size == 0
  
    def is_full(self):
        """Check if queue is full. O(1) time complexity."""
        return self.size == self.capacity
  
    def get_size(self):
        """Return current number of elements. O(1) time complexity."""
        return self.size
```

**Interview Code Quality Points:**

* Clear method documentation with time complexity
* Proper error handling with meaningful exceptions
* Input validation where appropriate
* Helpful comments for complex logic
* Consistent naming conventions

This comprehensive understanding of queue implementation from first principles will prepare you for any FAANG interview scenario involving queues!
