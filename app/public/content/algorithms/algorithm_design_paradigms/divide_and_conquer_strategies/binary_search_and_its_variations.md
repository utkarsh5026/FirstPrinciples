# Binary Search: From First Principles to FAANG Mastery

## Understanding the Foundation: What is Binary Search?

> **Core Principle** : Binary search is a divide-and-conquer algorithm that efficiently finds a target value in a **sorted** array by repeatedly eliminating half of the search space.

Let's start from the absolute beginning. Imagine you're looking for a word in a physical dictionary. You don't start from page 1 and flip through every page - instead, you open somewhere in the middle. If the word you're looking for comes alphabetically before what you see, you know it's in the left half. If it comes after, it's in the right half. You've just eliminated half the dictionary with one look!

This intuitive approach is exactly what binary search does, but in a systematic, algorithmic way.

### The Mathematical Foundation

Binary search works because of these fundamental principles:

1. **Sorted Data Requirement** : The array must be sorted
2. **Logarithmic Reduction** : Each comparison eliminates exactly half the remaining elements
3. **Time Complexity** : O(log n) - where n is the number of elements

> **Why O(log n)?** In the worst case, we need to divide the array in half log₂(n) times until we have only one element left. For an array of 1,000,000 elements, we need at most 20 comparisons!

## Building Binary Search Step by Step

### Step 1: The Basic Structure

Let's understand the core components:

```python
def binary_search(arr, target):
    left = 0                    # Left boundary
    right = len(arr) - 1        # Right boundary
  
    while left <= right:        # Continue while search space exists
        mid = left + (right - left) // 2    # Find middle point
      
        if arr[mid] == target:
            return mid          # Found the target
        elif arr[mid] < target:
            left = mid + 1      # Target is in right half
        else:
            right = mid - 1     # Target is in left half
  
    return -1                   # Target not found
```

**Detailed Code Explanation:**

* `left = 0, right = len(arr) - 1`: We define our search boundaries. Initially, we search the entire array.
* `mid = left + (right - left) // 2`: This prevents integer overflow that could occur with `(left + right) // 2` in languages with fixed integer sizes.
* The while loop continues as long as `left <= right`, meaning there's still a valid search space.
* We compare `arr[mid]` with our target and adjust boundaries accordingly.

### Step 2: Visualizing the Process

Let's trace through an example with the array `[1, 3, 5, 7, 9, 11, 13, 15]` searching for target `7`:

```
Initial: [1, 3, 5, 7, 9, 11, 13, 15]
         left=0, right=7, mid=3
         arr[3] = 7 = target ✓ Found!
```

For a more complex example, searching for `11`:

```
Step 1: [1, 3, 5, 7, 9, 11, 13, 15]
        left=0, right=7, mid=3
        arr[3] = 7 < 11, so left = mid + 1 = 4

Step 2: [_, _, _, _, 9, 11, 13, 15]
        left=4, right=7, mid=5
        arr[5] = 11 = target ✓ Found!
```

> **Key Insight** : Notice how we eliminated half the array with each comparison, making the search incredibly efficient.

## The Critical Template Pattern for FAANG Interviews

### The Universal Binary Search Template

Most FAANG binary search problems follow this template:

```python
def binary_search_template(arr, target):
    left, right = 0, len(arr) - 1
  
    while left <= right:
        mid = left + (right - left) // 2
      
        if condition_met(arr, mid, target):
            return mid  # or record answer and continue searching
        elif should_search_right(arr, mid, target):
            left = mid + 1
        else:
            right = mid - 1
  
    return -1  # or appropriate default value
```

**Why This Template is Powerful:**

* `condition_met()`: Defines what we're looking for
* `should_search_right()`: Determines which half to search next
* The boundaries (`left <= right`) ensure we don't miss any elements

## Essential Variations for FAANG Interviews

### 1. Find First Occurrence (Left Boundary)

> **Problem** : In a sorted array with duplicates, find the **first** occurrence of the target.

```python
def find_first_occurrence(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
  
    while left <= right:
        mid = left + (right - left) // 2
      
        if arr[mid] == target:
            result = mid        # Record potential answer
            right = mid - 1     # Continue searching left for first occurrence
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
  
    return result
```

 **Critical Insight** : When we find the target, we don't immediately return. Instead, we record the index and continue searching in the left half to find an earlier occurrence.

**Example Trace** with array `[1, 2, 2, 2, 3, 4, 5]` searching for `2`:

```
Step 1: mid=3, arr[3]=2 (found!)
        result=3, continue searching left (right=mid-1=2)

Step 2: left=0, right=2, mid=1
        arr[1]=2 (found again!)
        result=1, continue searching left (right=mid-1=0)

Step 3: left=0, right=0, mid=0
        arr[0]=1 < 2, so left=mid+1=1
      
Now left > right, exit loop
Return result=1 (first occurrence)
```

### 2. Find Last Occurrence (Right Boundary)

```python
def find_last_occurrence(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
  
    while left <= right:
        mid = left + (right - left) // 2
      
        if arr[mid] == target:
            result = mid        # Record potential answer
            left = mid + 1      # Continue searching right for last occurrence
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
  
    return result
```

 **Key Difference** : When we find the target, we search in the right half (`left = mid + 1`) to find a later occurrence.

### 3. Search in Rotated Sorted Array (Classic FAANG Problem)

> **Problem** : A sorted array has been rotated at some pivot. Find the target element.

Example: `[4, 5, 6, 7, 0, 1, 2]` (rotated version of `[0, 1, 2, 4, 5, 6, 7]`)

```python
def search_rotated_array(nums, target):
    left, right = 0, len(nums) - 1
  
    while left <= right:
        mid = left + (right - left) // 2
      
        if nums[mid] == target:
            return mid
      
        # Determine which half is sorted
        if nums[left] <= nums[mid]:  # Left half is sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1      # Target in left half
            else:
                left = mid + 1       # Target in right half
        else:  # Right half is sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1       # Target in right half
            else:
                right = mid - 1      # Target in left half
  
    return -1
```

 **Deep Explanation** :

* In a rotated array, one half is always sorted
* We first identify which half is sorted by comparing `nums[left]` with `nums[mid]`
* Then we check if our target lies within the sorted half's range
* If yes, we search that half; otherwise, we search the other half

**Visual Example** with `[4, 5, 6, 7, 0, 1, 2]`, target `0`:

```
Step 1: left=0, right=6, mid=3
        nums[3]=7, nums[0]=4
        4 <= 7, so left half [4,5,6,7] is sorted
        Is 0 in range [4,7)? No
        Search right half: left=4

Step 2: left=4, right=6, mid=5
        nums[5]=1, nums[4]=0
        0 > 1? No, so right half [1,2] is sorted
        Is 0 in range (1,2]? No
        Search left half: right=4

Step 3: left=4, right=4, mid=4
        nums[4]=0 = target ✓ Found!
```

### 4. Find Peak Element

> **Problem** : Find any peak element in an array where `arr[i] > arr[i-1]` and `arr[i] > arr[i+1]`.

```python
def find_peak_element(nums):
    left, right = 0, len(nums) - 1
  
    while left < right:
        mid = left + (right - left) // 2
      
        if nums[mid] > nums[mid + 1]:
            # Peak is on the left side (including mid)
            right = mid
        else:
            # Peak is on the right side
            left = mid + 1
  
    return left  # left == right, pointing to peak
```

 **Key Insight** : We're not searching for a specific value, but for a position that satisfies the peak condition. The algorithm works because:

* If `nums[mid] > nums[mid + 1]`, there must be a peak on the left side
* If `nums[mid] < nums[mid + 1]`, there must be a peak on the right side

### 5. Search in 2D Matrix

> **Problem** : Search for a target in a 2D matrix where each row and column is sorted.

```python
def search_matrix_2d(matrix, target):
    if not matrix or not matrix[0]:
        return False
  
    rows, cols = len(matrix), len(matrix[0])
    row, col = 0, cols - 1  # Start from top-right corner
  
    while row < rows and col >= 0:
        current = matrix[row][col]
      
        if current == target:
            return True
        elif current > target:
            col -= 1  # Move left (smaller values)
        else:
            row += 1  # Move down (larger values)
  
    return False
```

 **Strategy Explanation** : Starting from the top-right corner is crucial because:

* If current > target: we can eliminate the entire column (move left)
* If current < target: we can eliminate the entire row (move down)
* This gives us O(m + n) time complexity instead of O(m × n)

## Advanced Binary Search Patterns

### Binary Search on Answer Space

> **Concept** : Sometimes we binary search on the possible answers rather than array indices.

 **Example Problem** : "Find the minimum speed to eat all bananas within H hours"

```python
def min_eating_speed(piles, h):
    def can_finish(speed):
        hours = 0
        for pile in piles:
            hours += (pile + speed - 1) // speed  # Ceiling division
        return hours <= h
  
    left, right = 1, max(piles)
  
    while left < right:
        mid = left + (right - left) // 2
      
        if can_finish(mid):
            right = mid  # Try slower speed
        else:
            left = mid + 1  # Need faster speed
  
    return left
```

 **Pattern Recognition** :

* We're searching for the minimum value that satisfies a condition
* The search space is the range of possible answers (1 to max(piles))
* We use a helper function to check if a candidate answer works

## Common Pitfalls and How to Avoid Them

### 1. Integer Overflow

> **Problem** : `(left + right) // 2` can overflow in some languages

 **Solution** : Always use `left + (right - left) // 2`

### 2. Infinite Loops

> **Problem** : Wrong boundary updates can cause infinite loops

 **Example of Wrong Code** :

```python
# WRONG - Can cause infinite loop
while left < right:
    mid = left + (right - left) // 2
    if condition:
        left = mid  # Should be mid + 1
    else:
        right = mid - 1
```

 **Correct Approach** : Be careful with boundary updates, especially when `left < right` vs `left <= right`.

### 3. Off-by-One Errors

> **Key Rule** : Always think about whether your target could be at the boundary positions.

```python
# For finding exact match
while left <= right:  # Include equality

# For finding boundary/condition
while left < right:   # Exclude equality
```

## Interview Strategy and Tips

### Template Selection Guide

> **Choose your template based on the problem type:**

1. **Exact Match** : Use `left <= right` and return immediately when found
2. **First/Last Occurrence** : Use `left <= right` and continue searching after finding
3. **Condition-based** : Use `left < right` and binary search on answer space

### Problem Recognition Patterns

**Binary Search is likely the solution when you see:**

* Sorted array or rotated sorted array
* "Find the first/last occurrence"
* "Find minimum/maximum value that satisfies condition"
* O(log n) time complexity requirement
* Search space that can be divided in half

### Code Interview Best Practices

```python
def binary_search_interview_template(arr, target):
    # Always clarify edge cases first
    if not arr:
        return -1
  
    left, right = 0, len(arr) - 1
  
    while left <= right:
        # Explain why you use this mid calculation
        mid = left + (right - left) // 2
      
        # Walk through your logic step by step
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            # Explain: target must be in right half
            left = mid + 1
        else:
            # Explain: target must be in left half
            right = mid - 1
  
    return -1
```

> **Interview Tip** : Always trace through a simple example with the interviewer to demonstrate your understanding!

## Complexity Analysis Deep Dive

### Time Complexity Breakdown

* **Best Case** : O(1) - target is at the middle
* **Average Case** : O(log n) - target requires log n comparisons
* **Worst Case** : O(log n) - target is not found or at boundary

### Space Complexity

* **Iterative** : O(1) - only using a few variables
* **Recursive** : O(log n) - due to call stack depth

> **Why Binary Search is Powerful** : For a million-element array, linear search might need 1,000,000 comparisons, but binary search needs at most 20!

This comprehensive understanding of binary search and its variations will serve you well in FAANG interviews. The key is recognizing the pattern, choosing the right template, and implementing it correctly with proper boundary handling.
