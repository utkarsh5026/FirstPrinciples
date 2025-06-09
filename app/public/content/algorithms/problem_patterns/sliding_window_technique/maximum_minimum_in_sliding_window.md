# Maximum/Minimum in Sliding Window: A Complete Guide from First Principles

## What is a Sliding Window?

> **Core Concept** : A sliding window is a technique where we maintain a "window" of elements that slides across an array or string, typically maintaining a fixed size or meeting certain conditions.

Imagine you're looking through a window at a street. As you walk along the street, your view (the window) slides to show different parts of the street. In programming, we do something similar with arrays.

Let's visualize this with a simple example:

```
Array: [1, 3, 2, 5, 4, 7, 6]
Window size: 3

Position 1: [1, 3, 2] 5  4  7  6
Position 2:  1 [3, 2, 5] 4  7  6  
Position 3:  1  3 [2, 5, 4] 7  6
Position 4:  1  3  2 [5, 4, 7] 6
Position 5:  1  3  2  5 [4, 7, 6]
```

## The Maximum/Minimum Problem

> **Problem Statement** : Given an array and a window size k, find the maximum (or minimum) element in each possible window of size k.

This might seem simple at first - just check each window and find the max/min. But there's a catch:  **efficiency** .

### Naive Approach Analysis

```python
def max_in_sliding_window_naive(arr, k):
    """
    Naive approach: For each window, scan all elements to find maximum
    Time Complexity: O(n * k) where n is array length
    """
    result = []
    n = len(arr)
  
    # For each possible window starting position
    for i in range(n - k + 1):
        # Find maximum in current window [i, i+k-1]
        current_max = arr[i]
        for j in range(i + 1, i + k):
            current_max = max(current_max, arr[j])
        result.append(current_max)
  
    return result

# Example usage
arr = [1, 3, 2, 5, 4, 7, 6]
k = 3
print(max_in_sliding_window_naive(arr, k))  # [3, 5, 5, 7, 7]
```

 **Why this is inefficient** : For each of the `(n-k+1)` windows, we scan `k` elements. This gives us O(n×k) time complexity. For large arrays, this becomes prohibitively slow.

> **Key Insight** : We're doing redundant work! When we slide the window, most elements remain the same. We only lose one element from the left and gain one from the right.

## The Deque (Double-Ended Queue) Solution

The optimal solution uses a **deque** (double-ended queue) to maintain potential maximum/minimum candidates efficiently.

### Core Principles of the Deque Approach

> **Principle 1** : We maintain a deque that stores indices (not values) of array elements in a specific order.

> **Principle 2** : For maximum sliding window, the deque maintains indices in decreasing order of their values. For minimum, it's increasing order.

> **Principle 3** : The front of the deque always contains the index of the current window's maximum/minimum.

### Step-by-Step Algorithm Breakdown

Let's implement and explain the maximum sliding window:

```python
from collections import deque

def max_sliding_window(arr, k):
    """
    Optimal solution using deque
    Time Complexity: O(n) - each element is added and removed at most once
    Space Complexity: O(k) - deque can contain at most k elements
    """
    if not arr or k <= 0:
        return []
  
    dq = deque()  # Stores indices
    result = []
  
    for i in range(len(arr)):
        # Step 1: Remove indices that are out of current window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
      
        # Step 2: Remove indices whose values are smaller than current element
        # (they can never be maximum while current element is in window)
        while dq and arr[dq[-1]] < arr[i]:
            dq.pop()
      
        # Step 3: Add current index
        dq.append(i)
      
        # Step 4: The front of deque is our answer for current window
        if i >= k - 1:  # We have a complete window
            result.append(arr[dq[0]])
  
    return result
```

### Detailed Example Walkthrough

Let's trace through `arr = [1, 3, 2, 5, 4, 7, 6]` with `k = 3`:

```
Initial: dq = [], result = []

i=0, arr[0]=1:
  - No elements to remove (dq empty)
  - No smaller elements to remove (dq empty)  
  - Add index 0: dq = [0]
  - Window not complete yet (i < k-1)

i=1, arr[1]=3:
  - No out-of-window indices
  - arr[0]=1 < arr[1]=3, so remove index 0: dq = []
  - Add index 1: dq = [1]
  - Window not complete yet

i=2, arr[2]=2:
  - No out-of-window indices
  - arr[1]=3 > arr[2]=2, so keep index 1
  - Add index 2: dq = [1, 2]
  - Window complete! Maximum = arr[1] = 3
  - result = [3]
```

Continuing this process:

```
Window [1,3,2]: dq=[1,2], max=arr[1]=3
Window [3,2,5]: dq=[3], max=arr[3]=5  
Window [2,5,4]: dq=[3,4], max=arr[3]=5
Window [5,4,7]: dq=[5], max=arr[5]=7
Window [4,7,6]: dq=[5,6], max=arr[5]=7
```

> **Why This Works** : The deque maintains a "monotonic decreasing" property for maximums. Any element smaller than the current element can never be the maximum while the current element exists in the window.

## Implementation for Minimum Sliding Window

```python
def min_sliding_window(arr, k):
    """
    Same logic as maximum, but maintain increasing order in deque
    """
    if not arr or k <= 0:
        return []
  
    dq = deque()
    result = []
  
    for i in range(len(arr)):
        # Remove out-of-window indices
        while dq and dq[0] < i - k + 1:
            dq.popleft()
      
        # For minimum: remove indices whose values are GREATER than current
        while dq and arr[dq[-1]] > arr[i]:
            dq.pop()
      
        dq.append(i)
      
        if i >= k - 1:
            result.append(arr[dq[0]])
  
    return result

# Test both functions
arr = [1, 3, 2, 5, 4, 7, 6]
k = 3
print("Maximum in each window:", max_sliding_window(arr, k))  # [3, 5, 5, 7, 7]
print("Minimum in each window:", min_sliding_window(arr, k))  # [1, 2, 2, 4, 4]
```

## Advanced Variations and FAANG Interview Patterns

### Pattern 1: Sliding Window Maximum with Constraints

```python
def sliding_window_with_condition(arr, k, condition_func):
    """
    Generic sliding window that applies a condition function
    """
    dq = deque()
    result = []
  
    for i in range(len(arr)):
        # Remove out-of-window elements
        while dq and dq[0] < i - k + 1:
            dq.popleft()
      
        # Remove elements that don't satisfy condition relative to current
        while dq and not condition_func(arr[dq[-1]], arr[i]):
            dq.pop()
      
        dq.append(i)
      
        if i >= k - 1:
            result.append(arr[dq[0]])
  
    return result

# Example: Find maximum in each window
max_condition = lambda prev, curr: prev >= curr
print(sliding_window_with_condition([1,3,2,5,4], 3, max_condition))
```

### Pattern 2: Variable Size Windows

```python
def max_in_variable_window(arr, window_sizes):
    """
    Handle windows of different sizes
    """
    result = []
  
    for k in window_sizes:
        if k > len(arr):
            continue
        window_max = max_sliding_window(arr, k)
        result.append(window_max)
  
    return result
```

## Complexity Analysis Deep Dive

> **Time Complexity** : O(n) - Each element is added to and removed from the deque at most once.

> **Space Complexity** : O(k) - The deque stores at most k indices at any time.

**Why O(n) and not O(n×k)?**

Each element in the array:

1. Gets added to the deque exactly once
2. Gets removed from the deque at most once (either due to window sliding or being non-optimal)

Since each element has a constant amount of work done on it, the total time is O(n).

## Common Interview Questions and Variations

### 1. Sliding Window Maximum (LeetCode 239)

```python
# Direct application of our algorithm
def maxSlidingWindow(nums, k):
    return max_sliding_window(nums, k)
```

### 2. Find Maximum in All Subarrays of Size K

```python
# Same as sliding window maximum
def maxInSubarrays(arr, k):
    return max_sliding_window(arr, k)
```

### 3. Minimum Window with Condition

```python
def min_window_with_sum(arr, k, target_sum):
    """
    Find minimum window where sum >= target_sum
    """
    left = 0
    current_sum = 0
    min_length = float('inf')
  
    for right in range(len(arr)):
        current_sum += arr[right]
      
        while current_sum >= target_sum:
            min_length = min(min_length, right - left + 1)
            current_sum -= arr[left]
            left += 1
  
    return min_length if min_length != float('inf') else -1
```

## Key Takeaways for FAANG Interviews

> **Interview Tip 1** : Always start by explaining the naive approach and its limitations before jumping to the optimal solution.

> **Interview Tip 2** : Clearly explain why the deque maintains its properties and how this guarantees correctness.

> **Interview Tip 3** : Be prepared to implement both maximum and minimum versions, and explain the subtle difference.

> **Interview Tip 4** : Practice explaining the time complexity analysis - this is often a follow-up question.

The sliding window maximum/minimum technique is fundamental because it demonstrates several important concepts:

* **Monotonic data structures** (deque maintaining order)
* **Amortized analysis** (why it's O(n) despite nested loops)
* **Space-time tradeoffs** (using O(k) space to achieve O(n) time)

Understanding this technique deeply will help you recognize similar patterns in other problems and demonstrate strong algorithmic thinking in interviews.
