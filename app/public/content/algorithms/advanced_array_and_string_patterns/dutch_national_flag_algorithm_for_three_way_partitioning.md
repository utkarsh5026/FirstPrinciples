# The Dutch National Flag Algorithm: A Complete Guide for FAANG Interviews

## Understanding the Foundation: What Problem Are We Solving?

> **Core Problem** : Given an array containing only three distinct values (like 0s, 1s, and 2s), how can we sort this array in a single pass using constant extra space?

Let's start from the very beginning. Imagine you have a collection of colored balls - red, white, and blue - scattered randomly. Your goal is to arrange them so all red balls come first, then all white balls, then all blue balls. This is exactly what the Dutch National Flag algorithm solves, named after the three horizontal stripes of the Netherlands flag.

## The Fundamental Insight: Three-Way Partitioning

Before diving into the algorithm, let's understand why this problem is special:

> **Key Insight** : Unlike general sorting which requires O(n log n) time, when we only have three distinct values, we can achieve O(n) time with O(1) space using the principle of partitioning.

The algorithm works by maintaining three regions in the array:

* **Left region** : Contains all 0s (red balls)
* **Middle region** : Contains all 1s (white balls)
* **Right region** : Contains all 2s (blue balls)

## The Three-Pointer Approach: Building Intuition

Let's visualize how we maintain these regions using three pointers:

```
Array: [2, 0, 1, 2, 1, 0]
       ↑           ↑     ↑
      low         mid   high
```

> **The Three Pointers** :
>
> * `low`: Points to the boundary where the next 0 should be placed
> * `mid`: Our current exploration pointer
> * `high`: Points to the boundary where the next 2 should be placed

## Step-by-Step Algorithm Breakdown

### Phase 1: Understanding the Invariants

Before we write any code, let's establish what each pointer represents:

> **Invariant 1** : All elements from index 0 to `low-1` are 0s
> **Invariant 2** : All elements from index `low` to `mid-1` are 1s
>
> **Invariant 3** : All elements from index `high+1` to `n-1` are 2s
> **Invariant 4** : Elements from `mid` to `high` are unexplored

### Phase 2: The Decision Logic

When we encounter different values at the `mid` pointer, here's what we do:

```python
def dutch_flag_algorithm(arr):
    """
    Sorts an array containing only 0s, 1s, and 2s in O(n) time, O(1) space
    """
    # Initialize our three pointers
    low = 0      # Boundary for 0s
    mid = 0      # Current element being examined
    high = len(arr) - 1  # Boundary for 2s
  
    # Continue until we've examined all elements
    while mid <= high:
        if arr[mid] == 0:
            # Found a 0: swap with low boundary and advance both pointers
            arr[low], arr[mid] = arr[mid], arr[low]
            low += 1
            mid += 1
          
        elif arr[mid] == 1:
            # Found a 1: it's already in correct region, just advance mid
            mid += 1
          
        else:  # arr[mid] == 2
            # Found a 2: swap with high boundary, decrease high
            # Don't advance mid because we need to examine the swapped element
            arr[mid], arr[high] = arr[high], arr[mid]
            high -= 1
  
    return arr
```

### Phase 3: Understanding Each Case in Detail

Let me explain why we handle each case differently:

**Case 1: When `arr[mid] == 0`**

```python
# We found a 0, which belongs in the left region
# Swap it with the element at 'low' position
arr[low], arr[mid] = arr[mid], arr[low]
low += 1    # Expand the 0s region
mid += 1    # Move to next element
```

> **Why advance both pointers?** The element we swapped from `low` position is guaranteed to be either 0 or 1 (never 2, because of our invariants), so it's safe to advance `mid`.

**Case 2: When `arr[mid] == 1`**

```python
# 1 is already in the correct region (between low and high)
mid += 1    # Simply move to the next element
```

**Case 3: When `arr[mid] == 2`**

```python
# We found a 2, which belongs in the right region
arr[mid], arr[high] = arr[high], arr[mid]
high -= 1   # Shrink the unexplored region
# Note: We DON'T advance mid here!
```

> **Critical Point** : We don't advance `mid` because the element we just swapped from the `high` position could be 0, 1, or 2. We need to examine it in the next iteration.

## Visual Walkthrough with Example

Let's trace through a complete example:

 **Initial Array** : `[2, 0, 1, 2, 1, 0]`

```
Step 0: [2, 0, 1, 2, 1, 0]
        ↑           ↑     ↑
       low         mid   high
     
arr[mid] = 2, so swap with high and decrease high
```

```
Step 1: [0, 0, 1, 2, 1, 2]
        ↑           ↑  ↑
       low         mid high
     
arr[mid] = 0, so swap with low and advance both
```

```
Step 2: [0, 0, 1, 2, 1, 2]
           ↑        ↑  ↑
          low      mid high
        
arr[mid] = 1, so just advance mid
```

```
Step 3: [0, 0, 1, 2, 1, 2]
           ↑           ↑ ↑
          low         mid high
        
arr[mid] = 2, so swap with high and decrease high
```

```
Step 4: [0, 0, 1, 1, 2, 2]
           ↑        ↑↑
          low      mid/high
        
mid > high, so we're done!
```

 **Final Result** : `[0, 0, 1, 1, 2, 2]` ✅

## Complete Implementation with Edge Cases

```python
def dutch_national_flag(nums):
    """
    Sort array with 0s, 1s, and 2s using Dutch National Flag algorithm
  
    Args:
        nums: List[int] - Array containing only 0s, 1s, and 2s
      
    Returns:
        None - Sorts the array in-place
      
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if not nums or len(nums) <= 1:
        return nums
  
    # Three pointers for three-way partitioning
    red = 0                 # Next position for 0 (red)
    white = 0               # Current position being examined
    blue = len(nums) - 1    # Next position for 2 (blue)
  
    while white <= blue:
        current_color = nums[white]
      
        if current_color == 0:          # Red ball
            # Place in red section
            nums[red], nums[white] = nums[white], nums[red]
            red += 1
            white += 1
          
        elif current_color == 1:        # White ball
            # Already in correct position
            white += 1
          
        else:  # current_color == 2     # Blue ball
            # Place in blue section
            nums[white], nums[blue] = nums[blue], nums[white]
            blue -= 1
            # Don't increment white - need to check swapped element
  
    return nums
```

## Time and Space Complexity Analysis

> **Time Complexity: O(n)**
>
> * We visit each element at most twice
> * In the worst case, we might swap an element from the end to the beginning
> * Each element gets processed exactly once

> **Space Complexity: O(1)**
>
> * We only use three pointer variables regardless of input size
> * All operations are performed in-place

## FAANG Interview Context and Variations

### Common Interview Variations

**1. Sort Colors (LeetCode 75)**

```python
# Same as Dutch flag - sort array of 0s, 1s, 2s
def sortColors(nums):
    return dutch_national_flag(nums)
```

**2. Partition Array with Three Parts**

```python
def partition_three_way(arr, pivot):
    """Partition array around a pivot value"""
    low = mid = 0
    high = len(arr) - 1
  
    while mid <= high:
        if arr[mid] < pivot:
            arr[low], arr[mid] = arr[mid], arr[low]
            low += 1
            mid += 1
        elif arr[mid] == pivot:
            mid += 1
        else:
            arr[mid], arr[high] = arr[high], arr[mid]
            high -= 1
```

**3. Rainbow Sort (K Colors)**

```python
def rainbow_sort(arr, k):
    """
    Sort array with k different colors (0 to k-1)
    This requires a different approach - counting sort or quicksort-based
    """
    # For k > 3, Dutch flag approach doesn't directly apply
    # Use counting sort for O(n + k) solution
    pass
```

## Advanced Insights for Interview Success

### Key Interview Points to Mention

> **1. Why Three Pointers?**
> Two pointers aren't sufficient because we need to track both boundaries (for 0s and 2s) while exploring the middle region.

> **2. Why Not Advance Mid with Case 3?**
> When we swap with the high pointer, the incoming element is unexplored and could be any of the three values.

> **3. Comparison with Other Approaches**
>
> * Counting Sort: Also O(n) but requires two passes
> * Regular Sorting: O(n log n) time
> * Dutch Flag: Single pass, O(n) time, O(1) space

### Common Mistakes to Avoid

```python
# MISTAKE 1: Advancing mid when swapping with high
if arr[mid] == 2:
    arr[mid], arr[high] = arr[high], arr[mid]
    high -= 1
    mid += 1  # ❌ WRONG! Don't do this
  
# MISTAKE 2: Wrong loop condition
while mid < high:  # ❌ Should be mid <= high

# MISTAKE 3: Not handling edge cases
# Always check for empty arrays or single elements
```

## Practice Problems for Mastery

> **Essential Practice** :
>
> 1. LeetCode 75 - Sort Colors
> 2. LeetCode 215 - Kth Largest Element (use partition logic)
> 3. Custom: Sort array of characters 'R', 'G', 'B'
> 4. Custom: Partition array with negative, zero, positive numbers

The Dutch National Flag algorithm is a beautiful example of how understanding the problem constraints (only three values) allows us to achieve optimal time and space complexity. Master this pattern, and you'll be well-prepared for three-way partitioning problems in your FAANG interviews!
