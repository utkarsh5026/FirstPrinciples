# Fixed-Size Sliding Window: A Complete Deep Dive

## Understanding the Foundation: What is a Sliding Window?

> **Core Concept** : A sliding window is a computational technique that processes data by examining a "window" of consecutive elements that moves through a collection, maintaining a constant size throughout the traversal.

Let's start from the absolute beginning. Imagine you're looking through a window at a street. You can only see a certain portion of the street at any given time. Now, if you move along the street while keeping the same window size, you're essentially "sliding" your view across the entire street. This is exactly what happens in programming with the sliding window technique.

### The Mathematical Foundation

When we talk about a  **fixed-size sliding window** , we're dealing with these fundamental properties:

> **Window Size (k)** : A constant integer that never changes during our algorithm
>
> **Array/String Length (n)** : The total size of our input data structure
>
> **Number of Windows** : Exactly `(n - k + 1)` possible window positions

Let me show you visually how this works:

```
Array: [1, 2, 3, 4, 5, 6]  (n = 6)
Window Size: k = 3

Window 1: [1, 2, 3] | 4, 5, 6
Window 2:  1 |[2, 3, 4]| 5, 6  
Window 3:  1, 2 |[3, 4, 5]| 6
Window 4:  1, 2, 3 |[4, 5, 6]|

Total windows = 6 - 3 + 1 = 4
```

## Why Fixed-Size Sliding Window Matters in FAANG Interviews

> **Time Complexity Breakthrough** : The sliding window technique transforms what would typically be O(n × k) brute force solutions into elegant O(n) algorithms.

### The Brute Force Problem

Without understanding sliding windows, most candidates approach subarray problems like this:

```python
def brute_force_max_sum(arr, k):
    """
    Find maximum sum of k consecutive elements
    Time: O(n × k) - INEFFICIENT!
    """
    max_sum = float('-inf')
    n = len(arr)
  
    # For each possible starting position
    for i in range(n - k + 1):
        current_sum = 0
        # Calculate sum of k elements starting at i
        for j in range(i, i + k):
            current_sum += arr[j]
        max_sum = max(max_sum, current_sum)
  
    return max_sum

# Example usage
arr = [2, 1, 5, 1, 3, 2]
k = 3
print(brute_force_max_sum(arr, k))  # Output: 9
```

**What's happening here?**

* We examine every possible window starting position
* For each position, we recalculate the entire sum from scratch
* This leads to redundant calculations

> **The Insight** : Notice how we're recalculating overlapping portions repeatedly. When we move from window `[2, 1, 5]` to `[1, 5, 1]`, we're recalculating the sum of `1` and `5` even though we already knew their values.

## The Sliding Window Revelation

The sliding window technique recognizes this pattern:

> **When moving from one window to the next, we can reuse most of our previous calculation by simply removing the leftmost element and adding the new rightmost element.**

### The Core Algorithm Pattern

```python
def sliding_window_template(arr, k):
    """
    Generic sliding window template
    Time: O(n), Space: O(1)
    """
    n = len(arr)
  
    # Step 1: Handle edge case
    if n < k:
        return None
  
    # Step 2: Calculate sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum
  
    # Step 3: Slide the window
    for i in range(k, n):
        # Remove leftmost element, add rightmost element
        window_sum = window_sum - arr[i - k] + arr[i]
        max_sum = max(max_sum, window_sum)
  
    return max_sum
```

**Detailed Breakdown:**

1. **Initialization Phase** : We calculate the sum of the first `k` elements
2. **Sliding Phase** : For each subsequent position, we adjust our sum by:

* Subtracting the element that's leaving the window
* Adding the element that's entering the window

Let me trace through this step by step:

```
Array: [2, 1, 5, 1, 3, 2], k = 3

Initial window: [2, 1, 5]
window_sum = 2 + 1 + 5 = 8
max_sum = 8

i = 3 (arr[3] = 1):
- Remove arr[3-3] = arr[0] = 2
- Add arr[3] = 1  
- window_sum = 8 - 2 + 1 = 7
- Window is now: [1, 5, 1]
- max_sum = max(8, 7) = 8

i = 4 (arr[4] = 3):
- Remove arr[4-3] = arr[1] = 1
- Add arr[4] = 3
- window_sum = 7 - 1 + 3 = 9  
- Window is now: [5, 1, 3]
- max_sum = max(8, 9) = 9

i = 5 (arr[5] = 2):
- Remove arr[5-3] = arr[2] = 5
- Add arr[5] = 2
- window_sum = 9 - 5 + 2 = 6
- Window is now: [1, 3, 2]  
- max_sum = max(9, 6) = 9
```

## Example 1: Maximum Sum Subarray of Size K

Let's implement this classic problem with complete explanation:

```python
def max_sum_subarray(arr, k):
    """
    Find the maximum sum of any contiguous subarray of size k.
  
    Args:
        arr: List of integers
        k: Window size (positive integer)
  
    Returns:
        Maximum sum of k consecutive elements
  
    Time: O(n), Space: O(1)
    """
    n = len(arr)
  
    # Edge case: impossible to form window of size k
    if n < k:
        raise ValueError("Array size must be >= window size")
  
    # Calculate sum of first window
    current_sum = 0
    for i in range(k):
        current_sum += arr[i]
  
    # Initialize maximum with first window sum
    max_sum = current_sum
  
    # Slide the window across the remaining array
    for i in range(k, n):
        # Slide window: remove leftmost, add rightmost
        current_sum = current_sum - arr[i - k] + arr[i]
        # Update maximum if current sum is larger
        max_sum = max(max_sum, current_sum)
  
    return max_sum

# Test the function
test_array = [2, 1, 5, 1, 3, 2]
window_size = 3

result = max_sum_subarray(test_array, window_size)
print(f"Maximum sum of {window_size} consecutive elements: {result}")
```

> **Key Insight** : By maintaining a running sum and adjusting it incrementally, we avoid recalculating the entire window sum each time, reducing our time complexity from O(n × k) to O(n).

## Example 2: Average of Subarrays of Size K

This problem extends our understanding by requiring us to compute averages:

```python
def average_of_subarrays(arr, k):
    """
    Find averages of all contiguous subarrays of size k.
  
    Returns a list of averages for each possible window position.
  
    Time: O(n), Space: O(n-k+1) for result storage
    """
    n = len(arr)
  
    if n < k:
        return []
  
    averages = []
  
    # Calculate sum of first window
    window_sum = sum(arr[:k])
    averages.append(window_sum / k)
  
    # Slide window and calculate averages
    for i in range(k, n):
        # Update sum by sliding window
        window_sum = window_sum - arr[i - k] + arr[i]
        # Calculate and store average
        averages.append(window_sum / k)
  
    return averages

# Example usage
arr = [1, 3, 2, 6, -1, 4, 1, 8, 2]
k = 5

averages = average_of_subarrays(arr, k)
print("Averages:", [round(avg, 1) for avg in averages])
# Output: [2.2, 2.8, 2.4, 3.6, 2.8]
```

**Understanding the Output:**

* Window 1: [1, 3, 2, 6, -1] → Sum = 11 → Average = 2.2
* Window 2: [3, 2, 6, -1, 4] → Sum = 14 → Average = 2.8
* And so on...

## Example 3: Smallest Subarray with Given Sum (Fixed Window Variant)

This problem introduces a decision-making component within our sliding window:

```python
def smallest_subarray_with_sum(arr, target_sum):
    """
    Find the length of the smallest contiguous subarray 
    whose sum is greater than or equal to target_sum.
  
    Note: This uses variable-size sliding window, but demonstrates
    the concept for interview preparation.
    """
    n = len(arr)
    min_length = float('inf')
    window_sum = 0
    start = 0
  
    for end in range(n):
        # Expand window by including arr[end]
        window_sum += arr[end]
      
        # Contract window while sum >= target_sum
        while window_sum >= target_sum:
            # Update minimum length
            min_length = min(min_length, end - start + 1)
            # Remove leftmost element
            window_sum -= arr[start]
            start += 1
  
    return min_length if min_length != float('inf') else 0

# Example
arr = [2, 1, 2, 3, 3, 1, 1, 1]
target = 8
result = smallest_subarray_with_sum(arr, target)
print(f"Smallest subarray length with sum >= {target}: {result}")
```

## Example 4: Maximum of All Subarrays of Size K

This is a more complex problem that often appears in FAANG interviews:

```python
from collections import deque

def max_of_subarrays(arr, k):
    """
    Find maximum element in every contiguous subarray of size k.
  
    Uses a deque to efficiently track potential maximums.
    Time: O(n), Space: O(k)
    """
    n = len(arr)
    if n < k:
        return []
  
    # Deque stores indices of array elements
    # Front of deque contains index of largest element
    dq = deque()
    result = []
  
    # Process first window
    for i in range(k):
        # Remove indices of smaller elements from rear
        while dq and arr[i] >= arr[dq[-1]]:
            dq.pop()
        dq.append(i)
  
    # Process remaining elements
    for i in range(k, n):
        # The front of deque contains largest element index
        # of previous window
        result.append(arr[dq[0]])
      
        # Remove indices that are out of current window
        while dq and dq[0] <= i - k:
            dq.popleft()
      
        # Remove indices of smaller elements from rear
        while dq and arr[i] >= arr[dq[-1]]:
            dq.pop()
      
        # Add current element index
        dq.append(i)
  
    # Add maximum of last window
    result.append(arr[dq[0]])
  
    return result

# Example usage
arr = [1, 2, 3, 1, 4, 5, 2, 3, 6]
k = 3
maximums = max_of_subarrays(arr, k)
print("Maximum in each window:", maximums)
# Output: [3, 3, 4, 5, 5, 5, 6]
```

> **Advanced Technique** : This problem requires maintaining a deque (double-ended queue) to efficiently track the maximum element in each window. The deque stores indices in decreasing order of their corresponding array values.

## The Step-by-Step Problem-Solving Framework

When approaching sliding window problems in interviews, follow this systematic approach:

### Step 1: Problem Recognition

Ask yourself:

* Am I looking for something in a contiguous subarray/substring?
* Is there a fixed size mentioned?
* Am I optimizing (maximum, minimum) or calculating (sum, average)?

### Step 2: Template Selection

```python
def sliding_window_framework(data, k):
    # Initialize window
    # Calculate initial state
  
    # Slide window
    for i in range(k, len(data)):
        # Remove leaving element
        # Add entering element  
        # Update result
  
    return result
```

### Step 3: State Management

Identify what you need to track:

* Running sum/product
* Maximum/minimum values
* Count of specific elements
* Hash map for character frequencies

## Common Variations and Patterns

### Pattern 1: Arithmetic Operations

```python
def window_sum_pattern(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
  
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i-k]
        max_sum = max(max_sum, window_sum)
  
    return max_sum
```

### Pattern 2: Frequency Counting

```python
def window_frequency_pattern(s, k):
    from collections import defaultdict
  
    char_count = defaultdict(int)
  
    # Build first window
    for i in range(k):
        char_count[s[i]] += 1
  
    # Process result for first window
  
    # Slide window
    for i in range(k, len(s)):
        # Add new character
        char_count[s[i]] += 1
        # Remove old character
        char_count[s[i-k]] -= 1
        if char_count[s[i-k]] == 0:
            del char_count[s[i-k]]
      
        # Process current window
  
    return result
```

> **Interview Tip** : Always clarify the problem constraints. Ask about edge cases like empty arrays, window size larger than array length, and whether the window size can be zero.

## Time and Space Complexity Analysis

### Time Complexity: O(n)

* We visit each element exactly once
* Each element is added once and removed once
* Window operations are O(1)

### Space Complexity: Varies by Problem

* **Basic sum/average** : O(1) - only storing running sum
* **Maximum tracking** : O(k) - deque size
* **Frequency counting** : O(k) - hash map size

## Practice Problems for FAANG Interviews

> **Essential Problems** : Master these patterns to excel in sliding window questions:

1. **Maximum Sum Subarray of Size K** - Foundation
2. **Average of Subarrays of Size K** - Basic computation
3. **Maximum of All Subarrays of Size K** - Advanced data structures
4. **First Negative in Every Window** - Element properties
5. **Count Occurrences of Anagram** - String patterns

The fixed-size sliding window technique is a fundamental optimization that transforms quadratic solutions into linear ones. By maintaining a running state and updating it incrementally, we achieve remarkable efficiency gains that are highly valued in technical interviews.
