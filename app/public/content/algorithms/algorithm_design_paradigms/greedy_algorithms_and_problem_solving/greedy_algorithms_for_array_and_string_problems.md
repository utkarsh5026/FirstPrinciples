# Greedy Algorithms: From First Principles to FAANG Success

## Understanding Greedy Algorithms at Their Core

Let's begin our journey by understanding what a greedy algorithm truly is, building from the ground up.

> **First Principle** : A greedy algorithm makes the locally optimal choice at each step, hoping that these local choices will lead to a globally optimal solution.

Imagine you're climbing a mountain and at each fork in the path, you always choose the route that goes upward most steeply at that moment. This is exactly how greedy algorithms work - they make the best immediate decision without considering the long-term consequences.

### The Mathematical Foundation

The greedy approach works on problems that exhibit two key properties:

> **Greedy Choice Property** : A globally optimal solution can be reached by making a locally optimal choice at each step.

> **Optimal Substructure** : An optimal solution to the problem contains optimal solutions to subproblems.

Let's visualize this concept:

```
Problem: Find maximum sum
Array: [1, 3, 2, 4, 1]

Step 1: Choose 1 (only option)
Step 2: Choose 3 (locally best)
Step 3: Skip 2 (can't take adjacent)
Step 4: Choose 4 (locally best)
Step 5: Skip 1 (can't take adjacent)

Result: 1 + 3 + 4 = 8
```

## When Greedy Algorithms Work (And When They Don't)

Understanding when to apply greedy algorithms is crucial for FAANG interviews. Let's explore this with concrete examples.

### Example 1: Activity Selection Problem

```python
def activity_selection(activities):
    """
    Select maximum number of non-overlapping activities
    activities: list of (start_time, end_time) tuples
    """
    # Step 1: Sort by end time (greedy choice)
    activities.sort(key=lambda x: x[1])
  
    selected = []
    last_end_time = 0
  
    # Step 2: Greedily select activities
    for start, end in activities:
        if start >= last_end_time:  # No overlap
            selected.append((start, end))
            last_end_time = end
  
    return selected

# Example usage
activities = [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)]
result = activity_selection(activities)
print(f"Selected activities: {result}")
# Output: [(1, 4), (5, 7), (8, 9)]
```

**Detailed Code Explanation:**

1. **Sorting Strategy** : We sort by end time because finishing early gives us more opportunities for future activities
2. **Greedy Choice** : Always pick the activity that ends earliest among remaining options
3. **Local Optimality** : Each choice maximizes remaining time for future activities
4. **Global Optimality** : This leads to the maximum number of activities possible

### Why This Works vs. Why Some Greedy Approaches Fail

> **Success Case** : Activity selection works because earlier finish times never conflict with the optimal solution.

> **Failure Case** : Consider the fractional knapsack vs. 0/1 knapsack problem.

```python
# Fractional Knapsack - Greedy WORKS
def fractional_knapsack(items, capacity):
    """
    items: list of (value, weight) tuples
    capacity: maximum weight
    """
    # Sort by value-to-weight ratio (greedy choice)
    items.sort(key=lambda x: x[0]/x[1], reverse=True)
  
    total_value = 0
    current_weight = 0
  
    for value, weight in items:
        if current_weight + weight <= capacity:
            # Take entire item
            total_value += value
            current_weight += weight
        else:
            # Take fraction of item
            remaining_capacity = capacity - current_weight
            fraction = remaining_capacity / weight
            total_value += value * fraction
            break
  
    return total_value

# 0/1 Knapsack - Greedy FAILS, needs Dynamic Programming
```

**Why the difference?** In fractional knapsack, we can take parts of items, so the greedy choice (highest value/weight ratio) always leads to optimal solution. In 0/1 knapsack, we must take complete items, making greedy suboptimal.

## Core Greedy Patterns for Arrays

### Pattern 1: Interval Problems

These problems involve scheduling, merging, or selecting from intervals.

```python
def merge_intervals(intervals):
    """
    Merge overlapping intervals
    intervals: list of [start, end] lists
    """
    if not intervals:
        return []
  
    # Sort by start time
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
  
    for current in intervals[1:]:
        last_merged = merged[-1]
      
        if current[0] <= last_merged[1]:  # Overlap detected
            # Merge by extending the end time
            last_merged[1] = max(last_merged[1], current[1])
        else:
            # No overlap, add new interval
            merged.append(current)
  
    return merged

# Example
intervals = [[1,3], [2,6], [8,10], [15,18]]
result = merge_intervals(intervals)
print(f"Merged: {result}")  # [[1,6], [8,10], [15,18]]
```

**Step-by-step breakdown:**

1. **Sorting** : We sort by start time to process intervals in order
2. **Greedy Decision** : For each interval, decide whether to merge with the previous one
3. **Merging Logic** : If current start ≤ previous end, they overlap
4. **Extension** : When merging, take the maximum end time

### Pattern 2: Two-Pointer Greedy

```python
def container_with_most_water(height):
    """
    Find two lines that form container with most water
    height: list of integers representing line heights
    """
    left, right = 0, len(height) - 1
    max_area = 0
  
    while left < right:
        # Calculate current area
        width = right - left
        current_height = min(height[left], height[right])
        current_area = width * current_height
        max_area = max(max_area, current_area)
      
        # Greedy choice: move the shorter line
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
  
    return max_area

# Example
heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
result = container_with_most_water(heights)
print(f"Max water: {result}")  # Output: 49
```

**Why this greedy choice works:**

* Moving the taller line can never increase area (width decreases, height stays same or decreases)
* Moving the shorter line might increase area (height could increase)
* This ensures we explore all potentially optimal solutions

## Core Greedy Patterns for Strings

### Pattern 1: Character Frequency and Arrangement

```python
def reorganize_string(s):
    """
    Rearrange string so no two adjacent characters are same
    """
    from collections import Counter
    import heapq
  
    # Count character frequencies
    char_count = Counter(s)
  
    # Create max heap (use negative values for max heap)
    heap = [(-count, char) for char, count in char_count.items()]
    heapq.heapify(heap)
  
    result = []
    prev_char, prev_count = None, 0
  
    while heap:
        # Get most frequent character
        count, char = heapq.heappop(heap)
        result.append(char)
      
        # Add back previous character if it still has count
        if prev_count < 0:
            heapq.heappush(heap, (prev_count, prev_char))
      
        # Update previous character info
        prev_char, prev_count = char, count + 1  # +1 because count is negative
  
    # Check if we used all characters
    return ''.join(result) if len(result) == len(s) else ""

# Example
s = "aab"
result = reorganize_string(s)
print(f"Reorganized: {result}")  # Output: "aba"
```

**Greedy Strategy Explained:**

1. **Priority** : Always pick the most frequent remaining character
2. **Constraint** : Don't pick the same character consecutively
3. **Optimal Substructure** : Best local choice leads to global solution

### Pattern 2: Parentheses and Bracket Problems

```python
def min_add_to_make_valid(s):
    """
    Minimum additions to make parentheses string valid
    """
    open_needed = 0    # Opening brackets needed
    close_needed = 0   # Closing brackets needed
  
    for char in s:
        if char == '(':
            open_needed += 1
        elif char == ')':
            if open_needed > 0:
                open_needed -= 1  # Match found
            else:
                close_needed += 1  # Unmatched closing bracket
  
    return open_needed + close_needed

# Example
s = "(()"
result = min_add_to_make_valid(s)
print(f"Minimum additions: {result}")  # Output: 1
```

**Greedy Logic:**

* **Match greedily** : As soon as we see ')' and have unmatched '(', match them
* **Count unmatched** : Keep track of unmatched opening and closing brackets
* **Optimal** : This greedy matching minimizes total additions needed

## Advanced Greedy Techniques for FAANG Interviews

### Gas Station Problem - Circular Array Greedy

```python
def can_complete_circuit(gas, cost):
    """
    Determine if we can complete circular tour
    gas: gas available at each station
    cost: gas needed to reach next station
    """
    total_tank = 0
    current_tank = 0
    start_position = 0
  
    for i in range(len(gas)):
        total_tank += gas[i] - cost[i]
        current_tank += gas[i] - cost[i]
      
        # If current tank becomes negative, reset
        if current_tank < 0:
            start_position = i + 1
            current_tank = 0
  
    # Can complete circuit if total gas >= total cost
    return start_position if total_tank >= 0 else -1

# Example
gas = [1, 2, 3, 4, 5]
cost = [3, 4, 5, 1, 2]
result = can_complete_circuit(gas, cost)
print(f"Start position: {result}")  # Output: 3
```

**Deep Dive into the Algorithm:**

1. **Key Insight** : If we can't reach station `i+1` from any station `0` to `i`, then station `i+1` is our next candidate starting point
2. **Mathematical Proof** : If `total_tank ≥ 0`, a solution exists. The greedy choice finds the correct starting position.
3. **Why Greedy Works** :

* If we fail at position `j` starting from position `i`, starting from any position between `i` and `j` will also fail
* Therefore, the next valid starting position is `j+1`

### Jump Game - Greedy Range Extension

```python
def can_jump(nums):
    """
    Determine if we can reach the last index
    nums: maximum jump length from each position
    """
    farthest = 0
  
    for i in range(len(nums)):
        # If current position is unreachable
        if i > farthest:
            return False
      
        # Update farthest reachable position
        farthest = max(farthest, i + nums[i])
      
        # Early termination if we can reach the end
        if farthest >= len(nums) - 1:
            return True
  
    return farthest >= len(nums) - 1

def jump_game_min_jumps(nums):
    """
    Find minimum number of jumps to reach end
    """
    if len(nums) <= 1:
        return 0
  
    jumps = 0
    current_end = 0
    farthest = 0
  
    # Don't need to jump from last position
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
      
        # If reached end of current jump range
        if i == current_end:
            jumps += 1
            current_end = farthest
  
    return jumps

# Examples
nums1 = [2, 3, 1, 1, 4]
print(f"Can jump: {can_jump(nums1)}")  # True
print(f"Min jumps: {jump_game_min_jumps(nums1)}")  # 2
```

**Visualization of Jump Game Strategy:**

```
Array: [2, 3, 1, 1, 4]
Index:  0  1  2  3  4

Jump 1: From index 0, can reach indices 1-2
Jump 2: From index 1, can reach indices 2-4
        From index 2, can reach index 3

Greedy choice: Always extend our reach as far as possible
```

## String Reconstruction Greedy Patterns

### Largest Number Formation

```python
def largest_number(nums):
    """
    Arrange numbers to form largest possible number
    """
    from functools import cmp_to_key
  
    # Convert to strings
    str_nums = [str(num) for num in nums]
  
    # Custom comparator: x+y vs y+x
    def compare(x, y):
        if x + y > y + x:
            return -1  # x should come before y
        elif x + y < y + x:
            return 1   # y should come before x
        else:
            return 0   # Equal
  
    # Sort using custom comparator
    str_nums.sort(key=cmp_to_key(compare))
  
    # Handle edge case: all zeros
    result = ''.join(str_nums)
    return '0' if result[0] == '0' else result

# Example
nums = [3, 30, 34, 5, 9]
result = largest_number(nums)
print(f"Largest number: {result}")  # Output: "9534330"
```

**Why This Greedy Choice Works:**

> **Transitivity Property** : If A should come before B, and B should come before C, then A should come before C in the optimal arrangement.

The comparison `x + y > y + x` ensures that placing `x` before `y` creates a larger number than placing `y` before `x`.

## FAANG Interview Problem-Solving Framework

### Step-by-Step Approach

```
1. Identify the Problem Type
   ├── Scheduling/Intervals → Activity Selection Pattern
   ├── Optimization → Check Greedy Choice Property
   ├── Array Traversal → Two-Pointer or Single Pass
   └── String Arrangement → Character Frequency/Custom Sort

2. Verify Greedy Applicability
   ├── Does local optimal lead to global optimal?
   ├── Can we prove the greedy choice?
   └── Are there counterexamples?

3. Design the Greedy Strategy
   ├── What is the greedy choice at each step?
   ├── How do we maintain problem constraints?
   └── What data structures support our strategy?

4. Implement and Optimize
   ├── Write clean, readable code
   ├── Handle edge cases
   └── Analyze time/space complexity
```

### Common Interview Questions and Solutions

```python
def remove_k_digits(num, k):
    """
    Remove k digits to make smallest possible number
    """
    stack = []
    to_remove = k
  
    for digit in num:
        # Remove larger digits from stack
        while stack and to_remove > 0 and stack[-1] > digit:
            stack.pop()
            to_remove -= 1
        stack.append(digit)
  
    # Remove remaining digits from end
    while to_remove > 0:
        stack.pop()
        to_remove -= 1
  
    # Build result, removing leading zeros
    result = ''.join(stack).lstrip('0')
    return result if result else '0'

# Example
num = "1432219"
k = 3
result = remove_k_digits(num, k)
print(f"Result: {result}")  # Output: "1219"
```

 **Greedy Insight** : Always remove the first digit that is larger than the next digit. This ensures we keep smaller digits in higher positions.

## Common Pitfalls and How to Avoid Them

> **Pitfall 1** : Assuming greedy works without proof
> **Solution** : Always verify the greedy choice property

> **Pitfall 2** : Not considering edge cases
> **Solution** : Test with empty inputs, single elements, and boundary conditions

> **Pitfall 3** : Inefficient implementation
> **Solution** : Choose appropriate data structures (heaps, stacks, sorted containers)

### Practice Problem: Meeting Rooms II

```python
def min_meeting_rooms(intervals):
    """
    Find minimum number of meeting rooms required
    """
    if not intervals:
        return 0
  
    import heapq
  
    # Sort by start time
    intervals.sort(key=lambda x: x[0])
  
    # Min heap to track end times of ongoing meetings
    heap = []
  
    for start, end in intervals:
        # If earliest ending meeting has ended, remove it
        if heap and heap[0] <= start:
            heapq.heappop(heap)
      
        # Add current meeting's end time
        heapq.heappush(heap, end)
  
    return len(heap)

# Example
meetings = [[0,30], [5,10], [15,20]]
result = min_meeting_rooms(meetings)
print(f"Minimum rooms: {result}")  # Output: 2
```

 **Final Thought** : Greedy algorithms are powerful tools in your FAANG interview arsenal. They offer elegant solutions to optimization problems, but require careful analysis to ensure correctness. Master the patterns, understand the underlying principles, and practice recognizing when greedy approaches apply.

The key to success is not just memorizing algorithms, but understanding why they work and when they fail. This deep understanding will help you tackle novel problems with confidence during your interviews.
