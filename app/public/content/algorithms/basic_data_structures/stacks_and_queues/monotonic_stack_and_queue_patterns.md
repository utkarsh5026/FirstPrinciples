# Monotonic Stack and Queue Patterns: A Deep Dive from First Principles

Let me take you on a comprehensive journey through one of the most elegant and powerful patterns in competitive programming and FAANG interviews. We'll build everything from the ground up.

## Foundation: Understanding the Building Blocks

### What is a Stack?

Before we dive into monotonic structures, let's establish the fundamentals. A **stack** is a Last-In-First-Out (LIFO) data structure - imagine a stack of plates where you can only add or remove plates from the top.

```python
# Basic stack operations
stack = []
stack.append(5)    # Push 5
stack.append(3)    # Push 3
stack.append(8)    # Push 8
# Stack now: [5, 3, 8] (8 is at the top)

top_element = stack.pop()  # Remove and get 8
# Stack now: [5, 3]
```

### What is a Queue?

A **queue** follows First-In-First-Out (FIFO) principle - like a line at a coffee shop where the first person in line gets served first.

```python
from collections import deque

queue = deque()
queue.append(5)     # Add to rear
queue.append(3)     # Add to rear  
queue.append(8)     # Add to rear
# Queue: [5, 3, 8] (5 is at front, 8 is at rear)

front_element = queue.popleft()  # Remove from front, gets 5
# Queue: [3, 8]
```

## The "Monotonic" Concept

> **Key Insight** : "Monotonic" means maintaining a specific order - either always increasing or always decreasing. Think of a monotonic sequence like climbing stairs where each step is either higher than the previous (increasing) or lower (decreasing).

A **monotonic stack** maintains elements in either:

* **Monotonic increasing** : Bottom to top elements are in non-decreasing order
* **Monotonic decreasing** : Bottom to top elements are in non-increasing order

## Monotonic Stack: The Core Pattern

### Why Do We Need Monotonic Stacks?

> **The Magic** : Monotonic stacks help us efficiently find the "next greater element," "next smaller element," "previous greater element," or "previous smaller element" for each position in an array.

Let's understand this with a concrete example:

 **Problem** : Given array `[2, 1, 2, 4, 3, 1]`, find the next greater element for each position.

**Brute Force Approach** (O(n²)):

```python
def next_greater_brute_force(arr):
    n = len(arr)
    result = [-1] * n
  
    for i in range(n):
        # For each element, scan to the right
        for j in range(i + 1, n):
            if arr[j] > arr[i]:
                result[i] = arr[j]
                break
  
    return result

# For [2, 1, 2, 4, 3, 1]
# Result: [4, 2, 4, -1, -1, -1]
```

This works but is inefficient. Here's where monotonic stack shines!

### Monotonic Stack Solution (O(n))

```python
def next_greater_element(arr):
    n = len(arr)
    result = [-1] * n
    stack = []  # Will store indices, not values
  
    for i in range(n):
        # While stack is not empty AND 
        # current element is greater than element at stack's top index
        while stack and arr[i] > arr[stack[-1]]:
            index = stack.pop()
            result[index] = arr[i]
      
        stack.append(i)
  
    return result
```

**Let's trace through this step by step:**

```
Array: [2, 1, 2, 4, 3, 1]
Indices: [0, 1, 2, 3, 4, 5]

i=0, arr[0]=2:
  - stack is empty, push 0
  - stack: [0]
  - result: [-1, -1, -1, -1, -1, -1]

i=1, arr[1]=1:
  - 1 < arr[0]=2, so don't pop
  - push 1
  - stack: [0, 1]
  - result: [-1, -1, -1, -1, -1, -1]

i=2, arr[2]=2:
  - 2 > arr[1]=1, so pop 1, result[1] = 2
  - 2 = arr[0]=2, so don't pop 0
  - push 2
  - stack: [0, 2]
  - result: [-1, 2, -1, -1, -1, -1]

i=3, arr[3]=4:
  - 4 > arr[2]=2, so pop 2, result[2] = 4
  - 4 > arr[0]=2, so pop 0, result[0] = 4
  - push 3
  - stack: [3]
  - result: [4, 2, 4, -1, -1, -1]

i=4, arr[4]=3:
  - 3 < arr[3]=4, so don't pop
  - push 4
  - stack: [3, 4]
  - result: [4, 2, 4, -1, -1, -1]

i=5, arr[5]=1:
  - 1 < arr[4]=3, so don't pop
  - push 5
  - stack: [3, 4, 5]
  - result: [4, 2, 4, -1, -1, -1]
```

> **Why This Works** : The stack maintains indices in increasing order of their corresponding values. When we find a larger element, it becomes the "next greater element" for all smaller elements we pop from the stack.

## Visual Representation (Mobile-Optimized)

```
Next Greater Element Process:

Array: [2, 1, 2, 4, 3, 1]
       ↓  ↓  ↓  ↓  ↓  ↓
Index: 0  1  2  3  4  5

Step 1: i=0, val=2
Stack: [0]
│ 0(2) │ ← top

Step 2: i=1, val=1  
Stack: [0,1]
│ 1(1) │ ← top
│ 0(2) │

Step 3: i=2, val=2
Stack: [0,2] 
│ 2(2) │ ← top
│ 0(2) │
(popped 1, result[1]=2)

Step 4: i=3, val=4
Stack: [3]
│ 3(4) │ ← top
(popped 2, result[2]=4)
(popped 0, result[0]=4)
```

## Common Monotonic Stack Patterns in FAANG Interviews

### Pattern 1: Next Greater Element (Increasing Stack)

```python
def next_greater_template(arr):
    n = len(arr)
    result = [-1] * n
    stack = []  # monotonic increasing stack (bottom to top)
  
    for i in range(n):
        while stack and arr[i] > arr[stack[-1]]:
            idx = stack.pop()
            result[idx] = arr[i]
        stack.append(i)
  
    return result
```

### Pattern 2: Next Smaller Element (Decreasing Stack)

```python
def next_smaller_template(arr):
    n = len(arr)
    result = [-1] * n
    stack = []  # monotonic decreasing stack
  
    for i in range(n):
        while stack and arr[i] < arr[stack[-1]]:
            idx = stack.pop()
            result[idx] = arr[i]
        stack.append(i)
  
    return result
```

### Pattern 3: Previous Greater Element

```python
def previous_greater_template(arr):
    n = len(arr)
    result = [-1] * n
    stack = []  # monotonic decreasing stack
  
    for i in range(n):
        while stack and arr[stack[-1]] <= arr[i]:
            stack.pop()
      
        if stack:
            result[i] = arr[stack[-1]]
      
        stack.append(i)
  
    return result
```

## Real FAANG Interview Problem: Largest Rectangle in Histogram

> **Problem Statement** : Given an array of integers representing histogram bar heights, find the area of the largest rectangle that can be formed.

 **Example** : `heights = [2, 1, 5, 6, 2, 3]`

```
   6
   █   
 5 █   3
 █ █   █
 █ █ 2 █
 █ █ █ █
 2   █ █
 █ █ █ █
```

 **Answer** : 10 (rectangle with height 5 and width 2)

### Solution Using Monotonic Stack

```python
def largest_rectangle_area(heights):
    stack = []  # Will store indices
    max_area = 0
  
    for i in range(len(heights)):
        # Maintain increasing stack
        while stack and heights[i] < heights[stack[-1]]:
            height = heights[stack.pop()]
          
            # Calculate width
            width = i if not stack else i - stack[-1] - 1
          
            # Update maximum area
            max_area = max(max_area, height * width)
      
        stack.append(i)
  
    # Process remaining elements in stack
    while stack:
        height = heights[stack.pop()]
        width = len(heights) if not stack else len(heights) - stack[-1] - 1
        max_area = max(max_area, height * width)
  
    return max_area
```

**Step-by-step explanation:**

1. **Maintain increasing stack** : We keep indices of bars in increasing order of heights
2. **When we find a smaller bar** : All taller bars in the stack can form rectangles ending at the current position
3. **Calculate width** : For each popped bar, the width is determined by:

* Right boundary: current index
* Left boundary: the bar after the one below it in stack (or 0 if stack becomes empty)

**Tracing through `[2, 1, 5, 6, 2, 3]`:**

```
i=0, h=2: stack=[0]
i=1, h=1: 
  - 1 < heights[0]=2, pop 0
  - height=2, width=1, area=2
  - stack=[1]
i=2, h=5: stack=[1,2]
i=3, h=6: stack=[1,2,3]
i=4, h=2:
  - 2 < heights[3]=6, pop 3
  - height=6, width=1, area=6
  - 2 < heights[2]=5, pop 2  
  - height=5, width=2, area=10 ← maximum!
  - stack=[1,4]
i=5, h=3: stack=[1,4,5]
```

## Monotonic Queue (Deque): Sliding Window Maximum

> **Key Insight** : While monotonic stacks help with "next/previous" relationships, monotonic queues excel at "sliding window" problems where we need to maintain the maximum or minimum in a moving window.

### Problem: Sliding Window Maximum

 **Given** : Array and window size k, find maximum in each window.

 **Example** : `nums = [1,3,-1,-3,5,3,6,7], k = 3`
 **Output** : `[3,3,5,5,6,7]`

```
Window [1,3,-1] → max = 3
Window [3,-1,-3] → max = 3  
Window [-1,-3,5] → max = 5
Window [-3,5,3] → max = 5
Window [5,3,6] → max = 6
Window [3,6,7] → max = 7
```

### Monotonic Deque Solution

```python
from collections import deque

def sliding_window_maximum(nums, k):
    dq = deque()  # Will store indices
    result = []
  
    for i in range(len(nums)):
        # Remove indices outside current window
        while dq and dq[0] <= i - k:
            dq.popleft()
      
        # Maintain decreasing order (largest at front)
        while dq and nums[i] >= nums[dq[-1]]:
            dq.pop()
      
        dq.append(i)
      
        # Add to result when window is complete
        if i >= k - 1:
            result.append(nums[dq[0]])
  
    return result
```

**How it works:**

1. **Decreasing deque** : Front has the largest element's index
2. **Remove outdated indices** : Elements outside current window
3. **Remove smaller elements** : When adding new element, remove all smaller elements from rear (they'll never be maximum while current element is in window)

> **Time Complexity** : O(n) - each element is added and removed at most once
> **Space Complexity** : O(k) - deque stores at most k elements

## Advanced Pattern: Trapping Rain Water

This classic problem beautifully demonstrates monotonic stack usage:

```python
def trap_rain_water(height):
    stack = []
    water_trapped = 0
  
    for i in range(len(height)):
        while stack and height[i] > height[stack[-1]]:
            bottom = stack.pop()
          
            if not stack:
                break
              
            distance = i - stack[-1] - 1
            bounded_height = min(height[i], height[stack[-1]]) - height[bottom]
            water_trapped += distance * bounded_height
      
        stack.append(i)
  
    return water_trapped
```

> **Key Insight** : We use the stack to find "valleys" between taller bars where water can be trapped. The monotonic stack helps us efficiently find the left and right boundaries for each potential water pocket.

## When to Use Each Pattern

> **Monotonic Stack** : Use when you need to find relationships between elements (next/previous greater/smaller). Common in problems involving:
>
> * Next/Previous Greater Element
> * Largest Rectangle problems
> * Trapping Rain Water
> * Daily Temperatures

> **Monotonic Deque** : Use for sliding window problems where you need to maintain maximum/minimum efficiently:
>
> * Sliding Window Maximum/Minimum
> * Shortest Subarray with Sum at Least K
> * Jump Game VI

## Practice Strategy for FAANG Interviews

1. **Master the templates** : Memorize the basic patterns above
2. **Understand the invariant** : What property does your stack/deque maintain?
3. **Trace through examples** : Always dry-run your solution
4. **Edge cases** : Empty arrays, single elements, all increasing/decreasing sequences

The beauty of monotonic structures lies in their ability to reduce O(n²) brute force solutions to elegant O(n) algorithms by maintaining crucial ordering information as we traverse the data.
