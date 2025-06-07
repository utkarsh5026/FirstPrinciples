# Stack-Based Problems: Next Greater Element & Histogram Area

## Understanding Stacks from First Principles

Before diving into these classic problems, let's establish the foundational concepts that make stacks so powerful for certain algorithmic patterns.

> **Core Principle** : A stack is a Last-In-First-Out (LIFO) data structure that allows us to temporarily store elements while maintaining a specific order relationship.

Think of a stack like a pile of plates - you can only add or remove plates from the top. This simple constraint creates powerful problem-solving opportunities.

### The Stack's Superpower in Algorithm Design

The magic of stacks lies in their ability to:

* **Defer decisions** until we have more information
* **Maintain order relationships** between elements
* **Process elements in reverse chronological order**

> **Key Insight** : When you need to find relationships between elements where "later" elements can affect "earlier" ones, think stacks.

## The Pattern: Monotonic Stacks

Both problems we'll explore use a **monotonic stack** - a stack that maintains elements in a specific order (either increasing or decreasing).

```
Monotonic Increasing Stack: [1, 3, 5, 7]
Monotonic Decreasing Stack: [9, 6, 4, 2]
```

> **Why Monotonic Stacks Work** : They help us efficiently find the "next" or "previous" element that satisfies a certain condition by eliminating impossible candidates.

---

## Problem 1: Next Greater Element

### The Problem Statement

Given an array, find the next greater element for each element. The next greater element is the first element to the right that is larger than the current element.

```
Input:  [2, 1, 2, 4, 3, 1]
Output: [4, 2, 4, -1, -1, -1]
```

### Building Intuition from First Principles

Let's think about this step by step:

1. **For element 2 (index 0)** : We scan right and find 4 is the first larger element
2. **For element 1 (index 1)** : We scan right and find 2 is the first larger element
3. **For element 2 (index 2)** : We scan right and find 4 is the first larger element

> **Brute Force Insight** : We could solve this with nested loops in O(n²) time, but that's inefficient for large inputs - exactly what FAANG interviews test against.

### The Stack-Based Breakthrough

Here's the key insight that transforms this from O(n²) to O(n):

> **Crucial Realization** : If we're at element A and see a larger element B, then B is the answer for A. But what about elements before A that are smaller than B? B might be their answer too!

Let's trace through our example:

```
Array: [2, 1, 2, 4, 3, 1]
       ↑
   Start here
```

**Step-by-step visualization:**

```
Index 0: Stack [2]
         No greater element seen yet

Index 1: Stack [2, 1] 
         1 < 2, so push 1

Index 2: Current = 2
         2 > 1 (top of stack)
         Pop 1, set result[1] = 2
         2 = 2 (top of stack) 
         Push current 2
         Stack [2, 2]

Index 3: Current = 4
         4 > 2, pop and set result[2] = 4
         4 > 2, pop and set result[0] = 4  
         Stack [4]
```

### Implementation with Detailed Explanation

```python
def next_greater_element(nums):
    """
    Find next greater element for each element in array
  
    Time: O(n) - each element pushed/popped once
    Space: O(n) - stack can hold all elements worst case
    """
    n = len(nums)
    result = [-1] * n  # Initialize with -1 (no greater element)
    stack = []  # Will store indices, not values
  
    # Process each element from left to right
    for i in range(n):
        current = nums[i]
      
        # While stack not empty AND current > element at stack top
        while stack and nums[stack[-1]] < current:
            # Found next greater element for stack top
            prev_index = stack.pop()
            result[prev_index] = current
          
        # Push current index to stack
        stack.append(i)
  
    # Remaining elements in stack have no greater element
    # (result already initialized to -1)
  
    return result
```

> **Why Store Indices Instead of Values?** We need to know which position to update in our result array. Storing indices gives us both the position and access to the value via `nums[index]`.

### Dry Run Example

Let's trace through `[2, 1, 2, 4, 3, 1]`:

```
i=0: current=2, stack=[], push 0
     stack=[0], result=[-1,-1,-1,-1,-1,-1]

i=1: current=1, stack=[0]
     1 < nums[0]=2, no popping
     stack=[0,1], result=[-1,-1,-1,-1,-1,-1]

i=2: current=2, stack=[0,1]  
     2 > nums[1]=1, pop 1, result[1]=2
     2 = nums[0]=2, no more popping
     stack=[0,2], result=[-1,2,-1,-1,-1,-1]

i=3: current=4, stack=[0,2]
     4 > nums[2]=2, pop 2, result[2]=4  
     4 > nums[0]=2, pop 0, result[0]=4
     stack=[3], result=[4,2,4,-1,-1,-1]

i=4: current=3, stack=[3]
     3 < nums[3]=4, no popping
     stack=[3,4], result=[4,2,4,-1,-1,-1]

i=5: current=1, stack=[3,4]
     1 < nums[4]=3, no popping  
     stack=[3,4,5], result=[4,2,4,-1,-1,-1]
```

---

## Problem 2: Largest Rectangle in Histogram

### The Problem Statement

Given heights of bars in a histogram, find the area of the largest rectangle that can be formed.

```
Input:  [2, 1, 5, 6, 2, 3]
Output: 10 (rectangle with height 5 and width 2)
```

### Visualizing the Problem

```
    6
  5 █
  █ █
  █ █   3
2 █ █ 2 █
█ █ █ █ █
█ █ █ █ █ 1
-----------
2 1 5 6 2 3
```

The largest rectangle has height 5 and spans positions 2-3, giving area = 5 × 2 = 10.

### Building the Solution from First Principles

> **Key Insight** : For each bar, if we can find the leftmost and rightmost positions where we can extend a rectangle of that bar's height, we can calculate the maximum area with that bar as the limiting height.

**What determines the boundaries?**

* **Left boundary** : First bar to the left that's shorter than current bar
* **Right boundary** : First bar to the right that's shorter than current bar

This is essentially finding "next smaller element" on both sides!

### The Stack-Based Approach

Instead of finding boundaries for each bar separately, we can cleverly use a stack to process bars and calculate areas when we encounter a "boundary condition."

> **When do we calculate area?** When we find a bar that's shorter than the bar at the top of our stack - this shorter bar acts as a right boundary.

### Implementation with Detailed Explanation

```python
def largest_rectangle_area(heights):
    """
    Find largest rectangle area in histogram
  
    Time: O(n) - each bar pushed/popped once
    Space: O(n) - stack storage
    """
    stack = []  # Stack to store indices
    max_area = 0
  
    # Process each bar
    for i in range(len(heights)):
        # While stack not empty AND current height < stack top height
        while stack and heights[i] < heights[stack[-1]]:
            # Pop the top and calculate area with it as smallest
            height = heights[stack.pop()]
          
            # Width calculation:
            # If stack empty: width = i (from start to current)
            # If stack not empty: width = i - stack[-1] - 1
            width = i if not stack else i - stack[-1] - 1
          
            area = height * width
            max_area = max(max_area, area)
      
        # Push current index
        stack.append(i)
  
    # Process remaining bars in stack
    while stack:
        height = heights[stack.pop()]
        width = len(heights) if not stack else len(heights) - stack[-1] - 1
        area = height * width
        max_area = max(max_area, area)
  
    return max_area
```

### Understanding the Width Calculation

This is the trickiest part. Let's break it down:

> **Width Formula** : When we pop index `j` at position `i`, the width is the distance between the current position `i` and the element just below `j` in the stack.

```
Case 1: Stack becomes empty after popping
Width = i (rectangle extends from start to current position)

Case 2: Stack still has elements  
Width = i - stack[-1] - 1
```

**Why subtract 1?** Because we want the distance between positions, not including the boundaries.

### Detailed Dry Run

Let's trace through `[2, 1, 5, 6, 2, 3]`:

```
i=0: heights[0]=2, stack=[]
     Push 0, stack=[0]

i=1: heights[1]=1, stack=[0]
     1 < heights[0]=2, pop 0
     height=2, width=1, area=2×1=2
     Push 1, stack=[1]

i=2: heights[2]=5, stack=[1] 
     5 > heights[1]=1, push 2
     stack=[1,2]

i=3: heights[3]=6, stack=[1,2]
     6 > heights[2]=5, push 3
     stack=[1,2,3]

i=4: heights[4]=2, stack=[1,2,3]
     2 < heights[3]=6, pop 3
     height=6, width=4-2-1=1, area=6×1=6
   
     2 < heights[2]=5, pop 2  
     height=5, width=4-1-1=2, area=5×2=10 ← Maximum!
   
     2 > heights[1]=1, push 4
     stack=[1,4]

i=5: heights[5]=3, stack=[1,4]
     3 > heights[4]=2, push 5
     stack=[1,4,5]

Final cleanup:
Pop 5: height=3, width=6-4-1=1, area=3×1=3
Pop 4: height=2, width=6-1-1=4, area=2×4=8  
Pop 1: height=1, width=6, area=1×6=6
```

---

## FAANG Interview Perspective

### Why These Problems Matter

> **Pattern Recognition** : These problems test your ability to recognize when a stack-based approach can optimize a seemingly O(n²) solution to O(n).

**What interviewers look for:**

1. **Problem Analysis** : Can you identify the "next/previous greater/smaller" pattern?
2. **Optimization Thinking** : Do you start with brute force then optimize?
3. **Implementation Skills** : Can you handle tricky index manipulations?
4. **Edge Case Handling** : Empty arrays, single elements, all same heights?

### Common Variations You Might Encounter

1. **Next Greater Element II** (circular array)
2. **Daily Temperatures** (days until warmer weather)
3. **Trapping Rain Water** (2D version of histogram)
4. **Maximum Rectangle in Binary Matrix** (extension using histogram)

### Key Insights for Interviews

> **Time Complexity Explanation** : Even though we have nested loops, each element is pushed and popped at most once, making it O(n).

> **Space Complexity** : O(n) for the stack in worst case (strictly increasing sequence).

### Practice Strategy

1. **Master the basic pattern** with Next Greater Element
2. **Understand the width calculation** in Histogram problem
3. **Practice variations** to recognize the pattern quickly
4. **Focus on clean implementation** - these problems have many edge cases

> **Interview Tip** : Always start by explaining your approach before coding. These problems reward clear thinking over fast coding.

The beauty of these stack problems lies in their elegant transformation of what appears to be a quadratic problem into a linear one through clever use of the stack's LIFO property. Mastering these patterns will serve you well across many algorithmic challenges in technical interviews.
