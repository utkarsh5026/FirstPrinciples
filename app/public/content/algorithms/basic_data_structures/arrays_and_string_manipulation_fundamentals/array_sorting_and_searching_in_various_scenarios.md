# Array Sorting and Searching: A Complete Guide for FAANG Interviews

> **Understanding arrays and their manipulation through sorting and searching is fundamental to computer science. These operations form the backbone of countless algorithms and are essential for solving complex problems efficiently.**

Let's embark on a journey from the very basics to advanced techniques, building our understanding step by step.

## What Are Arrays? (First Principles)

Before diving into sorting and searching, let's understand what arrays actually are at the most fundamental level.

> **An array is a collection of elements stored in contiguous memory locations, where each element can be accessed using an index.**

Think of an array like a row of mailboxes in an apartment building:

```
Index:  [0] [1] [2] [3] [4]
Array:  [5] [2] [8] [1] [9]
Memory: 100 104 108 112 116
```

Each mailbox (memory location) has:

* An **address** (memory location)
* A **number** (index)
* **Contents** (the actual data)

**Why This Matters for Sorting and Searching:**

* **Random Access** : We can jump directly to any element in O(1) time
* **Contiguous Memory** : Elements are stored next to each other, enabling cache-friendly operations
* **Fixed Size** : Traditional arrays have a predetermined size

---

## The Fundamental Problem: Why Do We Sort?

> **Sorting transforms chaos into order, making data easier to search, analyze, and process.**

 **Real-world analogy** : Imagine you have 1000 books scattered randomly. Finding a specific book would take forever. But if they're arranged alphabetically, you can find any book quickly using techniques like binary search.

**Key Benefits of Sorting:**

1. **Faster Searching** : Sorted arrays enable binary search (O(log n) vs O(n))
2. **Pattern Recognition** : Sorted data reveals trends and patterns
3. **Duplicate Detection** : Adjacent duplicates are easy to spot
4. **Range Queries** : Finding elements within a range becomes efficient

---

## Sorting Algorithms: From Simple to Sophisticated

Let's explore sorting algorithms by building complexity gradually, understanding the core principles behind each.

### 1. Bubble Sort: The Gentle Giant

> **Bubble Sort works by repeatedly comparing adjacent elements and swapping them if they're in the wrong order. Like bubbles rising to the surface, larger elements "bubble up" to their correct positions.**

**The Core Principle:**

```
Pass 1: Compare each pair, swap if needed
Pass 2: Repeat, but ignore the last element (it's sorted)
Pass 3: Repeat, ignore last two elements
...continue until no swaps needed
```

**Visual Representation:**

```
Initial: [64, 34, 25, 12, 22, 11, 90]

Pass 1:
64,34 → swap → [34, 64, 25, 12, 22, 11, 90]
64,25 → swap → [34, 25, 64, 12, 22, 11, 90]
64,12 → swap → [34, 25, 12, 64, 22, 11, 90]
64,22 → swap → [34, 25, 12, 22, 64, 11, 90]
64,11 → swap → [34, 25, 12, 22, 11, 64, 90]
64,90 → no swap → [34, 25, 12, 22, 11, 64, 90]
```

**Implementation with Detailed Explanation:**

```python
def bubble_sort(arr):
    n = len(arr)
  
    # We need at most n-1 passes to sort n elements
    for i in range(n - 1):
      
        # Flag to track if any swaps occurred in this pass
        swapped = False
      
        # In each pass, the largest unsorted element "bubbles up"
        # So we can ignore the last i elements (they're already sorted)
        for j in range(0, n - i - 1):
          
            # Compare adjacent elements
            if arr[j] > arr[j + 1]:
                # Swap if they're in wrong order
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
      
        # If no swaps occurred, array is already sorted
        if not swapped:
            break
  
    return arr

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
print("Original:", numbers)
sorted_numbers = bubble_sort(numbers.copy())
print("Sorted:", sorted_numbers)
```

**What's happening in this code:**

* **Outer loop (i)** : Controls the number of passes
* **Inner loop (j)** : Compares adjacent elements
* **Swapped flag** : Optimization to stop early if array becomes sorted
* **Range logic** : `n - i - 1` because after each pass, one more element is in its final position

**Time Complexity Analysis:**

* **Best Case** : O(n) - Array already sorted, only one pass needed
* **Average Case** : O(n²) - Random order
* **Worst Case** : O(n²) - Array sorted in reverse order

### 2. Selection Sort: Finding the Minimum

> **Selection Sort works by repeatedly finding the minimum element from the unsorted portion and placing it at the beginning.**

**The Core Principle:**

```
Step 1: Find minimum in entire array, swap with first element
Step 2: Find minimum in remaining array, swap with second element
Step 3: Continue until array is sorted
```

**Implementation:**

```python
def selection_sort(arr):
    n = len(arr)
  
    # Move boundary of unsorted subarray one position at a time
    for i in range(n):
      
        # Find the minimum element in remaining unsorted array
        min_idx = i
      
        # Check each element after position i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
      
        # Swap the found minimum element with the first element
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
          
        print(f"After pass {i + 1}: {arr}")
  
    return arr

# Example usage
numbers = [64, 25, 12, 22, 11, 90]
print("Selection Sort Process:")
selection_sort(numbers.copy())
```

 **Key Insight** : Selection sort makes exactly n-1 swaps (minimum possible), but requires O(n²) comparisons.

### 3. Insertion Sort: Building Sorted Portions

> **Insertion Sort builds the final sorted array one element at a time, like sorting playing cards in your hand.**

**The Mental Model:**
Imagine sorting a hand of cards:

1. Pick up one card at a time
2. Insert it into its correct position among the cards you've already sorted
3. Repeat until all cards are sorted

**Implementation:**

```python
def insertion_sort(arr):
    # Start from the second element (index 1)
    # First element is considered "sorted"
    for i in range(1, len(arr)):
      
        # Current element to be inserted
        key = arr[i]
      
        # Move elements that are greater than key
        # one position ahead of their current position
        j = i - 1
      
        # Shift elements to the right to make space for key
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
      
        # Place key at its correct position
        arr[j + 1] = key
      
        print(f"After inserting {key}: {arr}")
  
    return arr

# Example usage
numbers = [12, 11, 13, 5, 6]
print("Insertion Sort Process:")
insertion_sort(numbers.copy())
```

**Step-by-step breakdown:**

```
Initial: [12, 11, 13, 5, 6]

i=1, key=11:
  Compare 11 with 12 → 11 < 12, so shift 12 right
  Insert 11 at position 0
  Result: [11, 12, 13, 5, 6]

i=2, key=13:
  Compare 13 with 12 → 13 > 12, no shift needed
  Result: [11, 12, 13, 5, 6]

i=3, key=5:
  Compare 5 with 13 → shift 13 right
  Compare 5 with 12 → shift 12 right  
  Compare 5 with 11 → shift 11 right
  Insert 5 at position 0
  Result: [5, 11, 12, 13, 6]
```

**When to use Insertion Sort:**

* Small datasets (< 50 elements)
* Nearly sorted arrays (best case O(n))
* Online algorithms (sorting as data arrives)

---

## Advanced Sorting: Divide and Conquer

### 4. Merge Sort: The Divide and Conquer Master

> **Merge Sort follows the divide-and-conquer paradigm: divide the problem into smaller subproblems, solve them independently, then combine the solutions.**

**The Three-Step Process:**

1. **Divide** : Split array into two halves
2. **Conquer** : Recursively sort both halves
3. **Combine** : Merge the sorted halves

**Visual Breakdown:**

```
                [38, 27, 43, 3, 9, 82, 10]
                         /             \
               [38, 27, 43, 3]         [9, 82, 10]
                 /        \             /        \
           [38, 27]    [43, 3]    [9, 82]     [10]
            /    \      /    \      /    \
         [38]   [27]  [43]  [3]   [9]   [82]   [10]
           \     /     \     /     \     /       |
           [27, 38]    [3, 43]    [9, 82]     [10]
              \          /          \          /
              [3, 27, 38, 43]      [9, 10, 82]
                     \                  /
                    [3, 9, 10, 27, 38, 43, 82]
```

**Implementation:**

```python
def merge_sort(arr):
    # Base case: arrays with 0 or 1 element are already sorted
    if len(arr) <= 1:
        return arr
  
    # Divide: find the middle point
    mid = len(arr) // 2
  
    # Conquer: recursively sort both halves
    left_half = merge_sort(arr[:mid])
    right_half = merge_sort(arr[mid:])
  
    # Combine: merge the sorted halves
    return merge(left_half, right_half)

def merge(left, right):
    """Merge two sorted arrays into one sorted array"""
    result = []
    i = j = 0
  
    # Compare elements from both arrays and add smaller one to result
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
  
    # Add remaining elements (if any)
    while i < len(left):
        result.append(left[i])
        i += 1
  
    while j < len(right):
        result.append(right[j])
        j += 1
  
    return result

# Example usage
numbers = [38, 27, 43, 3, 9, 82, 10]
print("Original:", numbers)
sorted_numbers = merge_sort(numbers)
print("Sorted:", sorted_numbers)
```

**Why Merge Sort is Special:**

* **Stable** : Equal elements maintain their relative order
* **Guaranteed O(n log n)** : Performance doesn't degrade on any input
* **Predictable** : No worst-case scenarios

**Space-Time Trade-off:**

* **Time** : O(n log n) in all cases
* **Space** : O(n) - requires additional memory for merging

### 5. Quick Sort: The Practical Champion

> **Quick Sort uses a "divide and conquer" approach with a clever twist: it partitions the array around a "pivot" element, ensuring all smaller elements are on one side and larger elements on the other.**

**The Partitioning Process:**

```
Choose pivot (let's say last element): [3, 6, 8, 10, 1, 2, 1] → pivot = 1

Partition around pivot:
- Elements ≤ 1 go to left: [1]  
- Elements > 1 go to right: [3, 6, 8, 10, 2]
- Pivot in middle: [1, 1, 3, 6, 8, 10, 2]

Recursively sort left and right subarrays
```

**Implementation:**

```python
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
  
    # Base case: if array has 1 or 0 elements
    if low < high:
      
        # Partition the array and get pivot index
        pivot_index = partition(arr, low, high)
      
        # Recursively sort elements before and after partition
        quick_sort(arr, low, pivot_index - 1)    # Left subarray
        quick_sort(arr, pivot_index + 1, high)   # Right subarray
  
    return arr

def partition(arr, low, high):
    """
    Partition function: rearranges array so that:
    - All elements smaller than pivot are on the left
    - All elements greater than pivot are on the right
    - Returns the final position of pivot
    """
  
    # Choose the rightmost element as pivot
    pivot = arr[high]
  
    # Index of smaller element (indicates right position of pivot)
    i = low - 1
  
    for j in range(low, high):
      
        # If current element is smaller than or equal to pivot
        if arr[j] <= pivot:
            i += 1  # Increment index of smaller element
            arr[i], arr[j] = arr[j], arr[i]  # Swap elements
  
    # Place pivot in its correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
  
    return i + 1  # Return position of pivot

# Example with step-by-step visualization
def quick_sort_verbose(arr, low=0, high=None, depth=0):
    if high is None:
        high = len(arr) - 1
  
    indent = "  " * depth
    print(f"{indent}Sorting subarray: {arr[low:high+1]}")
  
    if low < high:
        pivot_index = partition(arr, low, high)
      
        print(f"{indent}After partition around {arr[pivot_index]}: {arr}")
        print(f"{indent}Pivot at index {pivot_index}")
      
        quick_sort_verbose(arr, low, pivot_index - 1, depth + 1)
        quick_sort_verbose(arr, pivot_index + 1, high, depth + 1)
  
    return arr

# Example usage
numbers = [10, 7, 8, 9, 1, 5]
print("Quick Sort Process:")
quick_sort_verbose(numbers.copy())
```

**Pivot Selection Strategies:**

1. **Last element** (simple but can be worst case for sorted arrays)
2. **Random element** (good average performance)
3. **Median-of-three** (first, middle, last elements)

---

## Searching Algorithms: Finding What You Need

### 1. Linear Search: The Straightforward Approach

> **Linear Search checks every element one by one until it finds the target or reaches the end.**

```python
def linear_search(arr, target):
    """
    Search for target in array by checking each element
    Returns: index of target if found, -1 otherwise
    """
  
    for i in range(len(arr)):
        # Check if current element matches target
        if arr[i] == target:
            return i  # Found! Return the index
          
        # Optional: print search progress
        print(f"Checking index {i}: {arr[i]} != {target}")
  
    return -1  # Not found

# Example usage
numbers = [2, 3, 4, 10, 40]
target = 10

print(f"Searching for {target} in {numbers}")
result = linear_search(numbers, target)

if result != -1:
    print(f"Element found at index {result}")
else:
    print("Element not found")
```

**When to use Linear Search:**

* **Unsorted arrays** (no other choice)
* **Small datasets** (overhead of sorting isn't worth it)
* **One-time searches** (not worth sorting for single search)

### 2. Binary Search: The Logarithmic Marvel

> **Binary Search works only on sorted arrays by repeatedly dividing the search space in half, eliminating half of the remaining elements at each step.**

**The Core Logic:**

```
1. Find middle element
2. If middle == target → Found!
3. If target < middle → Search left half
4. If target > middle → Search right half
5. Repeat until found or no elements left
```

**Visual Process:**

```
Array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
Target: 7

Step 1: left=0, right=9, mid=4
        [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
                     ↑
        arr[4] = 9 > 7, search left half

Step 2: left=0, right=3, mid=1  
        [1, 3, 5, 7]
           ↑
        arr[1] = 3 < 7, search right half

Step 3: left=2, right=3, mid=2
        [5, 7]
         ↑
        arr[2] = 5 < 7, search right half

Step 4: left=3, right=3, mid=3
        [7]
         ↑
        arr[3] = 7 == 7, Found!
```

**Implementation:**

```python
def binary_search(arr, target):
    """
    Binary search in sorted array
    Returns: index of target if found, -1 otherwise
    """
  
    left = 0
    right = len(arr) - 1
  
    while left <= right:
      
        # Calculate middle index (avoiding overflow)
        mid = left + (right - left) // 2
      
        print(f"Searching range [{left}, {right}], mid={mid}, value={arr[mid]}")
      
        # Check if target is at mid
        if arr[mid] == target:
            return mid
      
        # If target is smaller, ignore right half
        elif arr[mid] > target:
            right = mid - 1
            print(f"Target {target} < {arr[mid]}, searching left half")
      
        # If target is larger, ignore left half
        else:
            left = mid + 1
            print(f"Target {target} > {arr[mid]}, searching right half")
  
    return -1  # Target not found

# Recursive implementation
def binary_search_recursive(arr, target, left=0, right=None):
    """Recursive version of binary search"""
  
    if right is None:
        right = len(arr) - 1
  
    # Base case: target not found
    if left > right:
        return -1
  
    mid = left + (right - left) // 2
  
    # Base case: target found
    if arr[mid] == target:
        return mid
  
    # Recursive cases
    elif arr[mid] > target:
        return binary_search_recursive(arr, target, left, mid - 1)
    else:
        return binary_search_recursive(arr, target, mid + 1, right)

# Example usage
sorted_numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
target = 7

print(f"Binary search for {target} in {sorted_numbers}")
result = binary_search(sorted_numbers, target)
print(f"Found at index: {result}")
```

**Why Binary Search is Powerful:**

* **Time Complexity** : O(log n) - dramatically faster than linear search
* **Space Complexity** : O(1) iterative, O(log n) recursive
* **Requirement** : Array must be sorted

---

## FAANG Interview Scenarios and Patterns

### Pattern 1: Finding Elements in Rotated Sorted Arrays

> **This is a classic FAANG problem that combines binary search with additional logic to handle the rotation.**

 **Problem** : Search in a rotated sorted array like `[4,5,6,7,0,1,2]`

```python
def search_rotated_array(nums, target):
    """
    Search target in rotated sorted array
    Key insight: At least one half is always properly sorted
    """
  
    left, right = 0, len(nums) - 1
  
    while left <= right:
        mid = left + (right - left) // 2
      
        # Found target
        if nums[mid] == target:
            return mid
      
        # Determine which half is sorted
        if nums[left] <= nums[mid]:  # Left half is sorted
          
            # Check if target is in the sorted left half
            if nums[left] <= target < nums[mid]:
                right = mid - 1  # Search left half
            else:
                left = mid + 1   # Search right half
              
        else:  # Right half is sorted
          
            # Check if target is in the sorted right half
            if nums[mid] < target <= nums[right]:
                left = mid + 1   # Search right half
            else:
                right = mid - 1  # Search left half
  
    return -1

# Example
rotated_array = [4, 5, 6, 7, 0, 1, 2]
print(f"Searching for 0 in {rotated_array}")
print(f"Found at index: {search_rotated_array(rotated_array, 0)}")
```

### Pattern 2: Finding Peak Elements

```python
def find_peak_element(nums):
    """
    Find any peak element (element greater than its neighbors)
    Binary search approach: O(log n)
    """
  
    left, right = 0, len(nums) - 1
  
    while left < right:
        mid = left + (right - left) // 2
      
        # If mid element is smaller than its right neighbor,
        # peak must be on the right side
        if nums[mid] < nums[mid + 1]:
            left = mid + 1
        else:
            # Peak is on the left side (including mid)
            right = mid
  
    return left  # left == right at this point

# Example
mountain = [1, 2, 3, 1]
print(f"Peak element in {mountain} is at index: {find_peak_element(mountain)}")
```

### Pattern 3: Two Pointers with Sorted Arrays

```python
def two_sum_sorted(numbers, target):
    """
    Find two numbers in sorted array that sum to target
    Two pointers approach: O(n)
    """
  
    left, right = 0, len(numbers) - 1
  
    while left < right:
        current_sum = numbers[left] + numbers[right]
      
        if current_sum == target:
            return [left + 1, right + 1]  # 1-indexed result
        elif current_sum < target:
            left += 1   # Need larger sum
        else:
            right -= 1  # Need smaller sum
  
    return []  # No solution found

# Example
sorted_nums = [2, 7, 11, 15]
target = 9
print(f"Two numbers that sum to {target}: {two_sum_sorted(sorted_nums, target)}")
```

---

## Time and Space Complexity Analysis

> **Understanding complexity is crucial for choosing the right algorithm and explaining your decisions in interviews.**

### Sorting Algorithms Comparison

```
Algorithm     | Best Case | Average Case | Worst Case | Space | Stable
------------- | --------- | ------------ | ---------- | ----- | ------
Bubble Sort   | O(n)      | O(n²)        | O(n²)      | O(1)  | Yes
Selection     | O(n²)     | O(n²)        | O(n²)      | O(1)  | No
Insertion     | O(n)      | O(n²)        | O(n²)      | O(1)  | Yes
Merge Sort    | O(n log n)| O(n log n)   | O(n log n) | O(n)  | Yes
Quick Sort    | O(n log n)| O(n log n)   | O(n²)      | O(log n)| No
Heap Sort     | O(n log n)| O(n log n)   | O(n log n) | O(1)  | No
```

### When to Use Which Algorithm

**Small Arrays (n < 50):**

* **Insertion Sort** : Simple, fast for small inputs, adaptive

**General Purpose:**

* **Merge Sort** : Guaranteed O(n log n), stable, good for linked lists
* **Quick Sort** : Average case faster than merge sort, in-place

**Special Cases:**

* **Nearly Sorted** : Insertion sort (O(n) best case)
* **Memory Constrained** : Heap sort (O(1) space)
* **Stability Required** : Merge sort or insertion sort

---

## Advanced Interview Topics

### 1. Dutch National Flag Problem

```python
def sort_colors(nums):
    """
    Sort array with only 0s, 1s, and 2s in-place
    One-pass solution using three pointers
    """
  
    left = 0      # Boundary for 0s
    right = len(nums) - 1  # Boundary for 2s
    current = 0   # Current element being processed
  
    while current <= right:
      
        if nums[current] == 0:
            # Swap with left boundary and move both pointers
            nums[left], nums[current] = nums[current], nums[left]
            left += 1
            current += 1
          
        elif nums[current] == 1:
            # 1 is in correct position, just move current
            current += 1
          
        else:  # nums[current] == 2
            # Swap with right boundary, don't move current
            # (need to check the swapped element)
            nums[current], nums[right] = nums[right], nums[current]
            right -= 1

# Example
colors = [2, 0, 2, 1, 1, 0]
print(f"Before: {colors}")
sort_colors(colors)
print(f"After: {colors}")
```

### 2. Merge K Sorted Arrays

```python
import heapq

def merge_k_sorted_arrays(arrays):
    """
    Merge k sorted arrays using min-heap
    Time: O(n log k), Space: O(k)
    """
  
    min_heap = []
    result = []
  
    # Initialize heap with first element from each array
    for i, array in enumerate(arrays):
        if array:  # Check if array is not empty
            heapq.heappush(min_heap, (array[0], i, 0))
  
    while min_heap:
        value, array_idx, element_idx = heapq.heappop(min_heap)
        result.append(value)
      
        # Add next element from the same array
        if element_idx + 1 < len(arrays[array_idx]):
            next_value = arrays[array_idx][element_idx + 1]
            heapq.heappush(min_heap, (next_value, array_idx, element_idx + 1))
  
    return result

# Example
arrays = [
    [1, 4, 5],
    [1, 3, 4],
    [2, 6]
]
print(f"Merged array: {merge_k_sorted_arrays(arrays)}")
```

---

## Key Takeaways for FAANG Interviews

> **Success in FAANG interviews comes from understanding not just how algorithms work, but when and why to use them.**

**Essential Points to Remember:**

1. **Always discuss time and space complexity** - Interviewers expect this analysis
2. **Consider edge cases:**
   * Empty arrays
   * Single element arrays
   * Duplicate elements
   * Already sorted/reverse sorted arrays
3. **Optimization opportunities:**
   * Early termination conditions
   * Space-time trade-offs
   * Preprocessing for multiple queries
4. **Communication is key:**
   * Explain your thought process
   * Discuss alternative approaches
   * Justify your algorithm choice

**Common Follow-up Questions:**

* "What if the array is too large to fit in memory?"
* "How would you modify this for stability?"
* "Can you optimize for multiple searches?"
* "What if elements are being added/removed frequently?"

Remember: The goal isn't just to solve the problem, but to demonstrate your understanding of algorithmic principles and your ability to make informed design decisions.
