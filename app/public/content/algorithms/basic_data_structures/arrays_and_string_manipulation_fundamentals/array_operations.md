# Array Operations: The Foundation of Data Structures

Arrays are the most fundamental data structure in computer science, serving as the building blocks for more complex structures. Understanding array operations deeply is crucial for technical interviews, especially at FAANG companies where efficiency and optimization are paramount.

## What is an Array? (First Principles)

> **Core Concept** : An array is a collection of elements stored in contiguous memory locations, where each element can be accessed using an index.

Think of an array like a row of mailboxes in an apartment building. Each mailbox has a unique number (index), and you can directly access any mailbox if you know its number. This direct access property makes arrays incredibly powerful.

### Memory Layout Fundamentals

```python
# When you create an array like this:
arr = [10, 20, 30, 40, 50]

# Memory layout looks like:
# Address: 1000  1004  1008  1012  1016
# Value:   10    20    30    40    50
# Index:   0     1     2     3     4
```

> **Key Insight** : Each element occupies a fixed amount of memory (4 bytes for integers), allowing us to calculate any element's address using: `base_address + (index × element_size)`

## 1. Array Insertion Operations

### Understanding Insertion from First Principles

Insertion means adding a new element to an array. The complexity depends on WHERE we insert:

#### Case 1: Insertion at the End

```python
def insert_at_end(arr, element):
    """
    Insert element at the end of array
    Time Complexity: O(1) - Constant time
    Space Complexity: O(1)
    """
    arr.append(element)  # Python's append is O(1) amortized
    return arr

# Example usage
numbers = [1, 2, 3, 4]
print(f"Before: {numbers}")
insert_at_end(numbers, 5)
print(f"After: {numbers}")
# Output: Before: [1, 2, 3, 4], After: [1, 2, 3, 4, 5]
```

**Why is this O(1)?** We simply place the element at the next available position. No existing elements need to move.

#### Case 2: Insertion at the Beginning

```python
def insert_at_beginning(arr, element):
    """
    Insert element at the beginning
    Time Complexity: O(n) - Linear time
    Space Complexity: O(1)
    """
    # We need to shift ALL existing elements one position right
    arr.insert(0, element)
    return arr

# Manual implementation to show what happens:
def insert_at_beginning_manual(arr, element):
    """
    Manual implementation showing the shifting process
    """
    # Add space for new element
    arr.append(None)
  
    # Shift all elements one position to the right
    for i in range(len(arr) - 1, 0, -1):
        arr[i] = arr[i - 1]
  
    # Insert new element at beginning
    arr[0] = element
    return arr

# Example
numbers = [2, 3, 4, 5]
print(f"Before: {numbers}")
insert_at_beginning(numbers, 1)
print(f"After: {numbers}")
# Output: Before: [2, 3, 4, 5], After: [1, 2, 3, 4, 5]
```

**Why is this O(n)?** We must shift every existing element, and with n elements, we perform n shift operations.

#### Case 3: Insertion at Arbitrary Position

```python
def insert_at_position(arr, element, position):
    """
    Insert element at specific position
    Time Complexity: O(n) in worst case, O(1) best case
    Space Complexity: O(1)
    """
    if position < 0 or position > len(arr):
        raise IndexError("Position out of bounds")
  
    # Shift elements from position onwards to the right
    arr.append(None)  # Make space
  
    for i in range(len(arr) - 1, position, -1):
        arr[i] = arr[i - 1]
  
    # Insert the new element
    arr[position] = element
    return arr

# Example: Insert 99 at position 2
numbers = [10, 20, 30, 40]
print(f"Before: {numbers}")
insert_at_position(numbers, 99, 2)
print(f"After: {numbers}")
# Output: Before: [10, 20, 30, 40], After: [10, 20, 99, 30, 40]
```

> **FAANG Interview Insight** : Interviewers often ask about the trade-offs between different insertion positions. Remember: end insertion is O(1), beginning/middle insertion is O(n) due to shifting.

## 2. Array Deletion Operations

### Understanding Deletion Mechanics

Deletion removes an element and typically requires shifting remaining elements to fill the gap.

#### Case 1: Deletion from End

```python
def delete_from_end(arr):
    """
    Delete last element
    Time Complexity: O(1)
    Space Complexity: O(1)
    """
    if not arr:
        raise IndexError("Cannot delete from empty array")
  
    deleted_element = arr.pop()  # Remove and return last element
    return deleted_element

# Example
numbers = [1, 2, 3, 4, 5]
print(f"Before: {numbers}")
deleted = delete_from_end(numbers)
print(f"After: {numbers}, Deleted: {deleted}")
# Output: Before: [1, 2, 3, 4, 5], After: [1, 2, 3, 4], Deleted: 5
```

#### Case 2: Deletion from Beginning

```python
def delete_from_beginning(arr):
    """
    Delete first element
    Time Complexity: O(n) - Must shift all remaining elements
    Space Complexity: O(1)
    """
    if not arr:
        raise IndexError("Cannot delete from empty array")
  
    deleted_element = arr[0]
  
    # Shift all elements one position left
    for i in range(len(arr) - 1):
        arr[i] = arr[i + 1]
  
    arr.pop()  # Remove the duplicate last element
    return deleted_element

# Example
numbers = [1, 2, 3, 4, 5]
print(f"Before: {numbers}")
deleted = delete_from_beginning(numbers)
print(f"After: {numbers}, Deleted: {deleted}")
# Output: Before: [1, 2, 3, 4, 5], After: [2, 3, 4, 5], Deleted: 1
```

#### Case 3: Deletion by Value

```python
def delete_by_value(arr, target):
    """
    Delete first occurrence of target value
    Time Complexity: O(n) - Search + potential shifting
    Space Complexity: O(1)
    """
    try:
        index = arr.index(target)  # O(n) to find
        deleted_element = arr[index]
      
        # Shift elements left to fill the gap
        for i in range(index, len(arr) - 1):
            arr[i] = arr[i + 1]
      
        arr.pop()  # Remove duplicate last element
        return deleted_element
  
    except ValueError:
        raise ValueError(f"Element {target} not found in array")

# Example
numbers = [10, 20, 30, 40, 50]
print(f"Before: {numbers}")
deleted = delete_by_value(numbers, 30)
print(f"After: {numbers}, Deleted: {deleted}")
# Output: Before: [10, 20, 30, 40, 50], After: [10, 20, 40, 50], Deleted: 30
```

> **Memory Management Note** : In languages like C++, you'd need to manually manage memory. Python handles this automatically, but understanding the underlying mechanics is crucial for interviews.

## 3. Array Searching Operations

### Linear Search: The Foundation

```python
def linear_search(arr, target):
    """
    Search for target element using linear search
    Time Complexity: O(n) - Check each element once
    Space Complexity: O(1) - Only use constant extra space
    """
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # Return index where element is found
  
    return -1  # Element not found

# Enhanced version with detailed tracking
def linear_search_detailed(arr, target):
    """
    Linear search with step-by-step tracking
    """
    comparisons = 0
  
    print(f"Searching for {target} in {arr}")
  
    for i in range(len(arr)):
        comparisons += 1
        print(f"Step {comparisons}: Checking arr[{i}] = {arr[i]}")
      
        if arr[i] == target:
            print(f"Found {target} at index {i} after {comparisons} comparisons")
            return i
  
    print(f"Element {target} not found after {comparisons} comparisons")
    return -1

# Example
numbers = [64, 34, 25, 12, 22, 11, 90]
result = linear_search_detailed(numbers, 22)
```

### Binary Search: Divide and Conquer

> **Prerequisites** : Array must be sorted for binary search to work.

```python
def binary_search(arr, target):
    """
    Binary search on sorted array
    Time Complexity: O(log n) - Divide search space in half each time
    Space Complexity: O(1) - Iterative version
    """
    left = 0
    right = len(arr) - 1
  
    while left <= right:
        mid = left + (right - left) // 2  # Avoid overflow
      
        print(f"Searching range [{left}, {right}], mid = {mid}, value = {arr[mid]}")
      
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1  # Search right half
        else:
            right = mid - 1  # Search left half
  
    return -1

# Example with sorted array
sorted_numbers = [11, 12, 22, 25, 34, 64, 90]
print(f"Array: {sorted_numbers}")
result = binary_search(sorted_numbers, 25)
print(f"Found at index: {result}")
```

**Why is Binary Search O(log n)?**

* Each comparison eliminates half the remaining elements
* With n elements, we can divide by 2 at most log₂(n) times
* Example: 1000 elements → max 10 comparisons (2¹⁰ = 1024)

## 4. Array Traversal Operations

### Basic Traversal Patterns

```python
def simple_traversal(arr):
    """
    Basic forward traversal
    Time Complexity: O(n) - Visit each element once
    Space Complexity: O(1)
    """
    print("Forward traversal:")
    for i in range(len(arr)):
        print(f"Index {i}: {arr[i]}")

def reverse_traversal(arr):
    """
    Backward traversal
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    print("Reverse traversal:")
    for i in range(len(arr) - 1, -1, -1):
        print(f"Index {i}: {arr[i]}")

# Example
data = [10, 20, 30, 40, 50]
simple_traversal(data)
reverse_traversal(data)
```

### Advanced Traversal: Two Pointers Technique

```python
def two_pointer_traversal(arr):
    """
    Two pointers moving towards each other
    Common pattern in FAANG interviews
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    left = 0
    right = len(arr) - 1
  
    print("Two-pointer traversal:")
    while left <= right:
        print(f"Left: arr[{left}] = {arr[left]}, Right: arr[{right}] = {arr[right]}")
      
        if left == right:
            print(f"Pointers meet at index {left}")
            break
          
        left += 1
        right -= 1

# Example: Check if array is palindrome
def is_palindrome(arr):
    """
    Check if array reads same forwards and backwards
    """
    left, right = 0, len(arr) - 1
  
    while left < right:
        if arr[left] != arr[right]:
            return False
        left += 1
        right -= 1
  
    return True

# Test cases
palindrome_array = [1, 2, 3, 2, 1]
normal_array = [1, 2, 3, 4, 5]

print(f"{palindrome_array} is palindrome: {is_palindrome(palindrome_array)}")
print(f"{normal_array} is palindrome: {is_palindrome(normal_array)}")
```

## FAANG Interview Complexity Summary

| Operation        | Best Case | Average Case | Worst Case | Space |
| ---------------- | --------- | ------------ | ---------- | ----- |
| Insert End       | O(1)      | O(1)         | O(1)       | O(1)  |
| Insert Beginning | O(n)      | O(n)         | O(n)       | O(1)  |
| Insert Middle    | O(1)      | O(n)         | O(n)       | O(1)  |
| Delete End       | O(1)      | O(1)         | O(1)       | O(1)  |
| Delete Beginning | O(n)      | O(n)         | O(n)       | O(1)  |
| Delete by Value  | O(1)      | O(n)         | O(n)       | O(1)  |
| Linear Search    | O(1)      | O(n)         | O(n)       | O(1)  |
| Binary Search*   | O(1)      | O(log n)     | O(log n)   | O(1)  |
| Traversal        | O(n)      | O(n)         | O(n)       | O(1)  |

*Binary search requires sorted array

## Common FAANG Interview Patterns

### Pattern 1: Dynamic Array Resizing

```python
class DynamicArray:
    """
    Understanding how dynamic arrays work internally
    (like Python lists, Java ArrayList)
    """
    def __init__(self):
        self.capacity = 2  # Initial capacity
        self.size = 0
        self.data = [None] * self.capacity
  
    def _resize(self):
        """Double the capacity when array is full"""
        print(f"Resizing from {self.capacity} to {self.capacity * 2}")
        old_data = self.data
        self.capacity *= 2
        self.data = [None] * self.capacity
      
        # Copy old data
        for i in range(self.size):
            self.data[i] = old_data[i]
  
    def append(self, element):
        """Add element to end"""
        if self.size >= self.capacity:
            self._resize()
      
        self.data[self.size] = element
        self.size += 1
        print(f"Added {element}, size: {self.size}, capacity: {self.capacity}")

# Example usage
arr = DynamicArray()
for i in range(5):
    arr.append(i)
```

> **Key Interview Insight** : Dynamic arrays use amortized O(1) insertion. While individual insertions might be O(n) during resizing, the average across many insertions is O(1).

### Pattern 2: Sliding Window with Arrays

```python
def max_sum_subarray(arr, k):
    """
    Find maximum sum of any subarray of size k
    Classic sliding window problem
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if len(arr) < k:
        return None
  
    # Calculate sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum
  
    print(f"Initial window sum: {window_sum}")
  
    # Slide the window
    for i in range(k, len(arr)):
        # Remove leftmost element, add rightmost element
        window_sum = window_sum - arr[i - k] + arr[i]
        max_sum = max(max_sum, window_sum)
      
        print(f"Window [{i-k+1}:{i+1}]: sum = {window_sum}")
  
    return max_sum

# Example
numbers = [2, 1, 5, 1, 3, 2]
k = 3
result = max_sum_subarray(numbers, k)
print(f"Maximum sum of subarray of size {k}: {result}")
```

Understanding these array operations deeply forms the foundation for tackling complex algorithmic problems in FAANG interviews. Each operation's time and space complexity directly impacts the efficiency of larger algorithms, making this knowledge essential for technical success.
