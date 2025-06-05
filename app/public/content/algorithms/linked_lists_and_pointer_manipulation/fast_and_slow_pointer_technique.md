# Floyd's Cycle Detection Algorithm: The Two-Pointer Technique

Let me take you on a journey through one of the most elegant algorithms in computer science, building from the ground up to understand why this technique is so powerful and frequently tested in FAANG interviews.

## Chapter 1: Understanding the Foundation - Linked Lists

Before we dive into cycle detection, let's establish our foundation. A **linked list** is a linear data structure where elements (nodes) are stored in sequence, but unlike arrays, they're not stored in contiguous memory locations.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val      # Data stored in the node
        self.next = next    # Reference to the next node
```

> **Core Principle** : Each node contains data and a reference (pointer) to the next node. The last node points to `None`, indicating the end of the list.

Here's how a simple linked list looks:

```
Node 1 → Node 2 → Node 3 → Node 4 → None
[1]      [2]      [3]      [4]
```

## Chapter 2: The Problem - What is a Cycle?

A cycle in a linked list occurs when a node's `next` pointer points back to a previously visited node, creating a loop. This breaks the fundamental assumption that linked lists are linear and finite.

```
Normal List:    1 → 2 → 3 → 4 → None

Cyclic List:    1 → 2 → 3 → 4
                    ↑       ↓
                    └───────┘
```

> **Critical Issue** : In a cyclic linked list, if you try to traverse from start to end, you'll get stuck in an infinite loop because there's no `None` pointer to terminate the traversal.

## Chapter 3: Why Do We Need Cycle Detection?

### Real-world Applications:

1. **Memory Management** : Preventing infinite loops in garbage collection
2. **Data Validation** : Ensuring data structures are properly formed
3. **Algorithm Correctness** : Many algorithms assume acyclic structures
4. **System Design** : Detecting circular dependencies

### The Naive Approach and Its Problems

```python
def has_cycle_naive(head):
    visited = set()
    current = head
  
    while current:
        if current in visited:
            return True
        visited.add(current)
        current = current.next
  
    return False
```

**Analysis of the naive approach:**

* **Time Complexity** : O(n) - we visit each node once
* **Space Complexity** : O(n) - we store all visited nodes
* **Problem** : Uses extra space proportional to input size

> **The Challenge** : Can we detect cycles without using extra space? This is where Floyd's algorithm shines.

## Chapter 4: Floyd's Cycle Detection - The Tortoise and Hare

Floyd's algorithm uses two pointers moving at different speeds - like Aesop's fable of the tortoise and hare.

### The Core Insight

> **Fundamental Principle** : If there's a cycle, a faster pointer will eventually "lap" a slower pointer within the cycle, just like a faster runner on a circular track will eventually catch up to a slower runner.

### The Algorithm Steps:

1. **Initialize two pointers** : `slow` (tortoise) and `fast` (hare)
2. **Move at different speeds** : `slow` moves 1 step, `fast` moves 2 steps
3. **Check for meeting** : If they meet, there's a cycle
4. **Check for termination** : If `fast` reaches `None`, no cycle exists

## Chapter 5: Implementation with Detailed Explanation

```python
def has_cycle(head):
    """
    Detect if a linked list has a cycle using Floyd's algorithm
  
    Args:
        head: ListNode - The head of the linked list
  
    Returns:
        bool - True if cycle exists, False otherwise
    """
    # Edge case: empty list or single node without cycle
    if not head or not head.next:
        return False
  
    # Initialize two pointers
    slow = head      # Tortoise: moves 1 step at a time
    fast = head      # Hare: moves 2 steps at a time
  
    # Continue until fast pointer reaches end or they meet
    while fast and fast.next:
        # Move pointers at their respective speeds
        slow = slow.next        # Tortoise moves 1 step
        fast = fast.next.next   # Hare moves 2 steps
      
        # If they meet, we found a cycle
        if slow == fast:
            return True
  
    # Fast pointer reached end - no cycle
    return False
```

**Line-by-line explanation:**

1. **Edge case handling** : If list is empty or has only one node, no cycle is possible
2. **Pointer initialization** : Both start at head
3. **Loop condition** : Continue while fast can take 2 steps
4. **Movement** : Slow moves 1, fast moves 2 positions
5. **Cycle detection** : If pointers meet, cycle exists
6. **Termination** : If fast reaches end, no cycle

### Visualization of the Algorithm

```
Step 1: Initialize
slow ↓
fast ↓
1 → 2 → 3 → 4 → 5
             ↑   ↓
             └───┘

Step 2: Move pointers
    slow ↓
        fast ↓
1 → 2 → 3 → 4 → 5
             ↑   ↓
             └───┘

Step 3: Continue moving
        slow ↓
            fast ↓
1 → 2 → 3 → 4 → 5
             ↑   ↓
             └───┘

Step 4: Pointers meet!
            slow ↓
            fast ↓
1 → 2 → 3 → 4 → 5
             ↑   ↓
             └───┘
```

## Chapter 6: Mathematical Proof - Why Does This Work?

Let's prove mathematically why Floyd's algorithm always works.

### Setup:

* Let the cycle start at position `k` from the head
* Let the cycle length be `c`
* When slow pointer enters the cycle, fast pointer is somewhere inside

### The Mathematics:

> **Key Insight** : At any moment when slow pointer has moved `n` steps, fast pointer has moved `2n` steps.

When slow pointer enters the cycle (after `k` steps):

* Slow pointer position: `k` (start of cycle)
* Fast pointer position: `k + (k mod c)` (somewhere in the cycle)

 **Distance between them in the cycle** : `(k mod c)`

 **Relative speed** : Fast gains 1 position per step on slow

 **Time to meet** : They meet after `c - (k mod c)` additional steps

> **Conclusion** : Since the relative speed is constant and they're in a closed loop, they must eventually meet.

### Example Calculation:

```
List: 1 → 2 → 3 → 4 → 5
              ↑       ↓
              └───────┘

k = 2 (cycle starts at node 3)
c = 3 (cycle length is 3)

When slow enters cycle:
- Slow at position 3
- Fast at position 3 + (2 mod 3) = 3 + 2 = 5

Distance between them: 2
They meet after: 3 - 2 = 1 step
```

## Chapter 7: Extended Version - Finding Cycle Start

Once we detect a cycle, we often need to find where it begins:

```python
def detect_cycle_start(head):
    """
    Find the node where cycle begins
  
    Returns:
        ListNode - The node where cycle starts, or None if no cycle
    """
    if not head or not head.next:
        return None
  
    # Phase 1: Detect cycle using Floyd's algorithm
    slow = fast = head
  
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
      
        if slow == fast:
            break
    else:
        return None  # No cycle found
  
    # Phase 2: Find cycle start
    # Move one pointer back to head
    start = head
  
    # Move both pointers at same speed until they meet
    while start != slow:
        start = start.next
        slow = slow.next
  
    return start  # This is where cycle begins
```

**Why this works:**

* Distance from head to cycle start: `k`
* Distance from meeting point to cycle start: `k` (mathematical property)
* Moving one pointer to head and advancing both at same speed makes them meet at cycle start

## Chapter 8: Complete Implementation with All Features

```python
class CycleDetector:
    def __init__(self):
        self.cycle_start = None
        self.cycle_length = 0
  
    def analyze_list(self, head):
        """
        Complete analysis of linked list for cycles
      
        Returns:
            dict: Contains has_cycle, cycle_start, cycle_length
        """
        result = {
            'has_cycle': False,
            'cycle_start': None,
            'cycle_length': 0
        }
      
        if not head or not head.next:
            return result
      
        # Phase 1: Detect cycle
        meeting_point = self._detect_cycle(head)
        if not meeting_point:
            return result
      
        result['has_cycle'] = True
      
        # Phase 2: Find cycle start
        result['cycle_start'] = self._find_cycle_start(head, meeting_point)
      
        # Phase 3: Calculate cycle length
        result['cycle_length'] = self._calculate_cycle_length(meeting_point)
      
        return result
  
    def _detect_cycle(self, head):
        """Returns meeting point if cycle exists, None otherwise"""
        slow = fast = head
      
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
          
            if slow == fast:
                return slow
      
        return None
  
    def _find_cycle_start(self, head, meeting_point):
        """Find where cycle begins"""
        start = head
      
        while start != meeting_point:
            start = start.next
            meeting_point = meeting_point.next
      
        return start
  
    def _calculate_cycle_length(self, meeting_point):
        """Calculate the length of the cycle"""
        current = meeting_point.next
        length = 1
      
        while current != meeting_point:
            current = current.next
            length += 1
      
        return length
```

## Chapter 9: FAANG Interview Perspective

### Common Interview Questions:

1. **Basic Detection** : "Detect if linked list has cycle"
2. **Cycle Start** : "Find where cycle begins"
3. **Cycle Length** : "Calculate cycle length"
4. **Remove Cycle** : "Remove cycle from linked list"

### What Interviewers Look For:

> **Technical Skills** :
>
> * Understanding of pointer manipulation
> * Space-time complexity analysis
> * Edge case handling

> **Problem-Solving Approach** :
>
> * Starting with brute force, then optimizing
> * Explaining the intuition behind the algorithm
> * Handling edge cases systematically

### Time and Space Complexity Analysis:

```python
# Floyd's Cycle Detection
# Time Complexity: O(n)
#   - In worst case, we visit each node at most twice
#   - Fast pointer moves at most 2n steps
#   - Slow pointer moves at most n steps

# Space Complexity: O(1)
#   - Only using two pointer variables
#   - No additional data structures needed

# Compare with naive approach:
# Naive: O(n) time, O(n) space
# Floyd's: O(n) time, O(1) space
```

## Chapter 10: Common Variations and Edge Cases

### Edge Cases to Handle:

```python
def robust_cycle_detection(head):
    """
    Handles all edge cases for cycle detection
    """
    # Case 1: Empty list
    if not head:
        return False
  
    # Case 2: Single node pointing to itself
    if head.next == head:
        return True
  
    # Case 3: Single node pointing to None
    if not head.next:
        return False
  
    # Case 4: Two nodes forming cycle
    if head.next.next == head:
        return True
  
    # General case: Use Floyd's algorithm
    slow = fast = head
  
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
      
        if slow == fast:
            return True
  
    return False
```

### Interview Follow-up Questions:

1. **"What if we need to count nodes in the cycle?"**
2. **"Can you modify this for doubly linked lists?"**
3. **"How would you remove the cycle?"**

> **Pro Tip** : Always discuss these variations to show deeper understanding.

## Chapter 11: Practice Problems for FAANG Preparation

### Problem 1: Remove Cycle

```python
def remove_cycle(head):
    """
    Remove cycle from linked list if it exists
    """
    if not has_cycle(head):
        return head
  
    # Find cycle start
    cycle_start = detect_cycle_start(head)
  
    # Find node just before cycle start
    current = cycle_start
    while current.next != cycle_start:
        current = current.next
  
    # Break the cycle
    current.next = None
  
    return head
```

### Problem 2: Intersection with Cycle

```python
def intersect_with_cycle(head1, head2):
    """
    Find if two linked lists intersect, considering cycles
    """
    # Check if both have cycles
    cycle1 = detect_cycle_start(head1)
    cycle2 = detect_cycle_start(head2)
  
    # Case 1: Neither has cycle
    if not cycle1 and not cycle2:
        return find_intersection_no_cycle(head1, head2)
  
    # Case 2: One has cycle, other doesn't
    if bool(cycle1) != bool(cycle2):
        return None
  
    # Case 3: Both have cycles
    return find_intersection_with_cycles(head1, head2, cycle1, cycle2)
```

## Chapter 12: Key Takeaways for Success

> **Essential Points to Remember** :
>
> 1. **Two-pointer technique is about relative motion**
> 2. **Floyd's algorithm is optimal: O(n) time, O(1) space**
> 3. **The mathematical proof relies on modular arithmetic**
> 4. **Always handle edge cases first**
> 5. **Practice variations to deepen understanding**

### Final Implementation Template:

```python
def floyd_cycle_detection_template(head):
    """
    Template for Floyd's cycle detection in interviews
    """
    # Step 1: Handle edge cases
    if not head or not head.next:
        return False
  
    # Step 2: Initialize pointers
    slow = fast = head
  
    # Step 3: Move pointers until they meet or fast reaches end
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
      
        if slow == fast:
            return True
  
    # Step 4: No cycle found
    return False
```

This algorithm represents a perfect blend of mathematical elegance and practical efficiency. In FAANG interviews, demonstrating understanding of both the intuition and the mathematical foundation will set you apart. The key is not just memorizing the code, but truly understanding why it works and being able to explain it clearly under pressure.

Remember: **the tortoise and hare will always meet if they're running on a circular track** - this simple insight leads to one of the most beautiful algorithms in computer science.
