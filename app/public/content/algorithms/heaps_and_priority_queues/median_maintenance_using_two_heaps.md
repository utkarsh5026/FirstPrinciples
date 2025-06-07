# Median Maintenance Using Two Heaps: A Deep Dive from First Principles

Let me take you through one of the most elegant and frequently asked data structure problems in FAANG interviews. We'll build this understanding step by step, starting from the very basics.

## Understanding the Fundamentals

### What is a Median?

> **Core Concept** : The median is the middle value in a sorted list of numbers. For an odd number of elements, it's the exact middle. For an even number, it's the average of the two middle elements.

Let's visualize this:

```
Odd case:  [1, 3, 5, 7, 9] → median = 5
Even case: [1, 3, 5, 7]    → median = (3 + 5)/2 = 4
```

### The Dynamic Median Problem

In interviews, you're typically asked: *"Given a stream of integers, find the median after each insertion."*

The naive approach would be to sort the array after each insertion, giving us O(n log n) per insertion. But we can do much better!

## Why Two Heaps? The Intuitive Approach

> **Key Insight** : If we can keep the smaller half and larger half of our numbers organized separately, finding the median becomes trivial.

Think of it like this: imagine you're organizing people by height in two groups:

* **Left group** : Shorter half (organized with tallest person at the front)
* **Right group** : Taller half (organized with shortest person at the front)

The median will always be either:

1. The tallest person in the left group (if left has more people)
2. The shortest person in the right group (if right has more people)
3. The average of both front people (if equal sizes)

## Heap Fundamentals

### What is a Heap?

> **Definition** : A heap is a complete binary tree that maintains the heap property - parent nodes are either greater than (max heap) or less than (min heap) their children.

**Max Heap Properties:**

* Root is the largest element
* Every parent ≥ its children
* Insertion/deletion: O(log n)
* Peek maximum: O(1)

**Min Heap Properties:**

* Root is the smallest element
* Every parent ≤ its children
* Same time complexities as max heap

```
Max Heap Example:        Min Heap Example:
       10                       1
      /  \                     / \
     8    9                   3   2
    / \   /                  / \
   4   7 5                  8   6
```

## The Two-Heap Strategy

### Design Philosophy

> **Strategy** : Use a max heap for the smaller half and a min heap for the larger half of our numbers.

**Why this works:**

* Max heap's root = largest of smaller numbers
* Min heap's root = smallest of larger numbers
* These roots are always closest to the median position

### Heap Configuration

```
Numbers: [1, 3, 5, 7, 9, 11]

Max Heap (smaller half):    Min Heap (larger half):
      5                           7
     / \                         / \
    3   1                       9   11
  
Median = (5 + 7) / 2 = 6
```

## Implementation: Step by Step

Let's implement this solution with detailed explanations:

```python
import heapq

class MedianFinder:
    def __init__(self):
        # Max heap for smaller half (we'll negate values since Python has min heap)
        self.max_heap = []  # smaller half
        # Min heap for larger half
        self.min_heap = []  # larger half
```

> **Implementation Note** : Python's `heapq` only provides min heap. For max heap functionality, we store negative values.

### Adding Numbers: The Core Algorithm

```python
def add_number(self, num):
    # Step 1: Decide which heap to add to initially
    if not self.max_heap or num <= -self.max_heap[0]:
        # Add to max heap (smaller half)
        heapq.heappush(self.max_heap, -num)
    else:
        # Add to min heap (larger half)  
        heapq.heappush(self.min_heap, num)
  
    # Step 2: Balance the heaps
    self._balance_heaps()
```

**Let me explain each step:**

1. **Initial Placement** : We compare with the max heap's root (largest of smaller numbers). If our number is smaller or equal, it belongs in the smaller half.
2. **Balancing** : After insertion, we might have uneven heaps. We need to maintain the property that heap sizes differ by at most 1.

### The Balancing Logic

```python
def _balance_heaps(self):
    # If max heap has more than 1 extra element
    if len(self.max_heap) > len(self.min_heap) + 1:
        # Move largest from smaller half to larger half
        largest_small = -heapq.heappop(self.max_heap)
        heapq.heappush(self.min_heap, largest_small)
  
    # If min heap has more than 1 extra element  
    elif len(self.min_heap) > len(self.max_heap) + 1:
        # Move smallest from larger half to smaller half
        smallest_large = heapq.heappop(self.min_heap)
        heapq.heappush(self.max_heap, -smallest_large)
```

> **Balancing Rule** : The difference in heap sizes should never exceed 1. This ensures we can always find the median in O(1) time.

### Finding the Median

```python
def find_median(self):
    if len(self.max_heap) == len(self.min_heap):
        # Even total count - average of two middle elements
        if len(self.max_heap) == 0:  # Empty case
            return 0
        return (-self.max_heap[0] + self.min_heap[0]) / 2.0
  
    elif len(self.max_heap) > len(self.min_heap):
        # Odd total count - max heap has the median
        return float(-self.max_heap[0])
  
    else:
        # Odd total count - min heap has the median
        return float(self.min_heap[0])
```

## Complete Working Example

Let's trace through a complete example:

```python
class MedianFinder:
    def __init__(self):
        self.max_heap = []  # smaller half (negated for max heap behavior)
        self.min_heap = []  # larger half
  
    def add_number(self, num):
        # Decide initial placement
        if not self.max_heap or num <= -self.max_heap[0]:
            heapq.heappush(self.max_heap, -num)
        else:
            heapq.heappush(self.min_heap, num)
      
        # Balance heaps
        if len(self.max_heap) > len(self.min_heap) + 1:
            val = -heapq.heappop(self.max_heap)
            heapq.heappush(self.min_heap, val)
        elif len(self.min_heap) > len(self.max_heap) + 1:
            val = heapq.heappop(self.min_heap)
            heapq.heappush(self.max_heap, -val)
  
    def find_median(self):
        if len(self.max_heap) == len(self.min_heap):
            if len(self.max_heap) == 0:
                return 0
            return (-self.max_heap[0] + self.min_heap[0]) / 2.0
        elif len(self.max_heap) > len(self.min_heap):
            return float(-self.max_heap[0])
        else:
            return float(self.min_heap[0])

# Example usage
median_finder = MedianFinder()
numbers = [5, 15, 1, 3]

for num in numbers:
    median_finder.add_number(num)
    print(f"Added {num}, Median: {median_finder.find_median()}")
```

## Step-by-Step Trace

Let's trace through adding `[5, 15, 1, 3]`:

```
Initial: max_heap=[], min_heap=[]

Add 5:
- Empty max_heap, so add to max_heap: [-5]
- No balancing needed
- Median: 5.0

Add 15:  
- 15 > 5 (root of max_heap), so add to min_heap: [15]
- max_heap=[-5], min_heap=[15]
- Balanced (equal sizes)
- Median: (5 + 15)/2 = 10.0

Add 1:
- 1 <= 5, so add to max_heap: [-5, -1]
- max_heap=[-5, -1], min_heap=[15] 
- max_heap has 1 extra (allowed)
- Median: 5.0 (from max_heap root)

Add 3:
- 3 <= 5, so add to max_heap: [-5, -1, -3]
- max_heap=[-5, -3, -1], min_heap=[15]
- max_heap has 2 extra (too many!)
- Balance: move 5 to min_heap
- max_heap=[-3, -1], min_heap=[5, 15]
- Median: (3 + 5)/2 = 4.0
```

## Complexity Analysis

> **Time Complexity:**
>
> * `add_number()`: O(log n) - heap insertion + potential rebalancing
> * `find_median()`: O(1) - just accessing heap roots
>
> **Space Complexity:** O(n) - storing all numbers in heaps

This is optimal for the dynamic median problem!

## Common Edge Cases and Pitfalls

### Edge Case 1: Empty Stream

```python
def find_median(self):
    if len(self.max_heap) == 0 and len(self.min_heap) == 0:
        return 0  # or raise exception based on requirements
    # ... rest of logic
```

### Edge Case 2: Single Element

```python
# After adding one element, one heap will have size 1, other size 0
# Our logic handles this correctly
```

### Edge Case 3: Duplicate Numbers

Our algorithm handles duplicates naturally - they're just treated as regular numbers.

## Interview Variations

### Variation 1: Find Median of Specific Range

 **Problem** : Find median of last k numbers in the stream.

 **Approach** : Modify to use a sliding window with deque + heaps.

### Variation 2: Weighted Median

 **Problem** : Each number has a weight.

 **Approach** : Track cumulative weights instead of counts.

### Variation 3: Multiple Queries

 **Problem** : Support both insertion and deletion.

 **Approach** : More complex - need to handle deletion from arbitrary positions in heaps.

## Why This Appears in FAANG Interviews

> **Assessment Points:**
>
> 1. **Data Structure Knowledge** : Understanding heaps and their properties
> 2. **Algorithm Design** : Choosing the right approach for dynamic problems
> 3. **Implementation Skills** : Handling edge cases and maintaining invariants
> 4. **Optimization Thinking** : Recognizing when O(n log n) per operation isn't necessary

## Key Takeaways for Interviews

1. **Start with Brute Force** : Mention the O(n log n) sorting approach first
2. **Explain the Insight** : Why two heaps solve this elegantly
3. **Handle Edge Cases** : Empty stream, single element, etc.
4. **Discuss Trade-offs** : Time vs space, when this approach is best
5. **Code Cleanly** : Separate concerns (insertion, balancing, median finding)

> **Pro Tip** : In interviews, always explain your thought process. The interviewer wants to see how you break down complex problems into manageable pieces.

This two-heap approach demonstrates a fundamental principle in algorithm design:  **maintaining useful invariants** . By keeping our data partially organized at all times, we can answer queries efficiently without full reorganization.

The beauty of this solution lies in its simplicity once you understand the core insight - we're essentially maintaining a dynamic partition of our data that always keeps the median elements easily accessible.
