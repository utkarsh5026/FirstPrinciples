# Fractional Knapsack & Job Scheduling: A Deep Dive for FAANG Interviews

## Understanding the Foundation: Greedy Algorithms

Before diving into these specific problems, let's establish the fundamental principle that underlies both solutions.

> **Core Principle** : Greedy algorithms make locally optimal choices at each step, hoping to find a global optimum. They work when the problem has the "greedy choice property" - making the best local choice leads to the best overall solution.

Both Fractional Knapsack and Job Scheduling are classic **greedy algorithm problems** that frequently appear in FAANG interviews because they test your ability to:

* Identify when greedy approach works
* Design optimal sorting strategies
* Implement efficient solutions
* Handle edge cases

---

## Problem 1: Fractional Knapsack

### First Principles Understanding

The Fractional Knapsack problem is fundamentally about **maximizing value under a weight constraint** where we can take fractions of items.

 **Core Question** : *Given items with weights and values, and a knapsack with limited capacity, how do we maximize the total value?*

### The Intuition: Value-to-Weight Ratio

The key insight is that we should prioritize items that give us the  **highest value per unit weight** .

> **Why does this work?** If we have two items - one giving $10 per kg and another giving $5 per kg - we should always take from the first item first, even if we can only take a fraction.

Let's trace through a simple example:

```
Items: [(value, weight)]
Item A: (60, 10)  → ratio = 6.0
Item B: (100, 20) → ratio = 5.0  
Item C: (120, 30) → ratio = 4.0
Knapsack capacity: 50
```

**Step-by-step solution:**

1. Sort by ratio: A(6.0), B(5.0), C(4.0)
2. Take all of A: value = 60, remaining capacity = 40
3. Take all of B: value = 160, remaining capacity = 20
4. Take 2/3 of C: value = 160 + (2/3 × 120) = 240

### Implementation with Detailed Explanation

```python
def fractional_knapsack(items, capacity):
    """
    Solve fractional knapsack using greedy approach
  
    Args:
        items: list of tuples (value, weight)
        capacity: maximum weight capacity
  
    Returns:
        maximum_value: float
    """
    # Step 1: Calculate value-to-weight ratio for each item
    # We store (ratio, value, weight, original_index) for tracking
    ratios = []
    for i, (value, weight) in enumerate(items):
        if weight > 0:  # Avoid division by zero
            ratio = value / weight
            ratios.append((ratio, value, weight, i))
  
    # Step 2: Sort by ratio in descending order
    # This ensures we consider highest value items first
    ratios.sort(reverse=True, key=lambda x: x[0])
  
    total_value = 0
    remaining_capacity = capacity
    result_items = []  # Track what we took for debugging
  
    # Step 3: Greedily select items
    for ratio, value, weight, original_idx in ratios:
        if remaining_capacity >= weight:
            # Take the entire item
            total_value += value
            remaining_capacity -= weight
            result_items.append((original_idx, 1.0))  # 100% of item
        else:
            # Take fraction of the item
            if remaining_capacity > 0:
                fraction = remaining_capacity / weight
                total_value += value * fraction
                result_items.append((original_idx, fraction))
                remaining_capacity = 0
            break  # Knapsack is full
  
    return total_value, result_items

# Example usage
items = [(60, 10), (100, 20), (120, 30)]
capacity = 50

max_value, solution = fractional_knapsack(items, capacity)
print(f"Maximum value: {max_value}")
print(f"Items taken: {solution}")
```

**Code Explanation:**

* **Line 11-16** : We calculate ratios and store additional metadata for tracking
* **Line 19** : Sorting is crucial - Python's `sort()` is O(n log n) using Timsort
* **Line 26-30** : When we can take the full item, we do so immediately
* **Line 32-38** : The fractional part is where this problem differs from 0/1 knapsack

### Visual Representation (Mobile-Optimized)

```
Capacity: 50kg
┌─────────────────┐
│  Step 1: Sort   │
│  by ratio       │
├─────────────────┤
│ A: 60/10 = 6.0  │
│ B: 100/20 = 5.0 │
│ C: 120/30 = 4.0 │
└─────────────────┘
        ↓
┌─────────────────┐
│  Step 2: Fill   │
│  knapsack       │
├─────────────────┤
│ Take A: 10kg    │
│ Remaining: 40kg │
├─────────────────┤
│ Take B: 20kg    │
│ Remaining: 20kg │
├─────────────────┤
│ Take 2/3 of C   │
│ (20kg of 30kg)  │
│ Remaining: 0kg  │
└─────────────────┘
```

---

## Problem 2: Job Scheduling (Activity Selection)

### First Principles Understanding

Job Scheduling is about **selecting the maximum number of non-overlapping activities** from a given set.

> **Core Insight** : To maximize the number of jobs, we should always pick the job that finishes earliest among all available jobs. This leaves maximum room for future jobs.

### Why "Earliest Finish Time" Strategy Works

Consider this intuitive explanation: If you're scheduling meetings in a day, picking meetings that end early gives you more time slots for additional meetings later.

**Mathematical Proof Sketch:**

1. Let OPT be an optimal solution
2. Let our greedy solution be G
3. If G ≠ OPT, we can show G is at least as good as OPT
4. The earliest finishing job in OPT can be replaced by our greedy choice without making the solution worse

### Example Walkthrough

```
Jobs: [(start, end)]
Job A: (1, 4)
Job B: (3, 5) 
Job C: (0, 6)
Job D: (5, 7)
Job E: (8, 9)
Job F: (5, 9)
```

**Step-by-step solution:**

1. Sort by end time: A(4), B(5), C(6), D(7), E(9), F(9)
2. Select A (ends at 4)
3. Skip B (starts at 3, conflicts with A)
4. Skip C (starts at 0, conflicts with A)
5. Select D (starts at 5, no conflict)
6. Select E (starts at 8, no conflict)

Result: Jobs A, D, E (3 jobs total)

### Implementation with Detailed Explanation

```python
def job_scheduling(jobs):
    """
    Solve job scheduling using greedy approach
  
    Args:
        jobs: list of tuples (start_time, end_time, job_id)
  
    Returns:
        selected_jobs: list of selected job indices
        max_jobs: number of jobs selected
    """
    if not jobs:
        return [], 0
  
    # Step 1: Sort jobs by their ending time
    # This is the key insight - earliest finish time first
    indexed_jobs = [(start, end, i) for i, (start, end) in enumerate(jobs)]
    indexed_jobs.sort(key=lambda x: x[1])  # Sort by end time
  
    selected_jobs = []
    last_end_time = float('-inf')
  
    # Step 2: Greedily select non-conflicting jobs
    for start, end, job_id in indexed_jobs:
        # Check if current job conflicts with last selected job
        if start >= last_end_time:
            # No conflict - we can select this job
            selected_jobs.append(job_id)
            last_end_time = end
            print(f"Selected job {job_id}: ({start}, {end})")
        else:
            print(f"Skipped job {job_id}: ({start}, {end}) - conflicts")
  
    return selected_jobs, len(selected_jobs)

# Enhanced version with job weights (for maximum value instead of count)
def weighted_job_scheduling(jobs):
    """
    Solve weighted job scheduling using dynamic programming
    (This is more complex than the greedy approach)
    """
    if not jobs:
        return 0, []
  
    # Sort by end time
    jobs_with_index = [(start, end, weight, i) 
                       for i, (start, end, weight) in enumerate(jobs)]
    jobs_with_index.sort(key=lambda x: x[1])
  
    n = len(jobs_with_index)
    dp = [0] * n  # dp[i] = maximum weight ending at or before job i
    parent = [-1] * n  # For tracking solution
  
    # Fill dp array
    for i in range(n):
        start_i, end_i, weight_i, orig_i = jobs_with_index[i]
      
        # Option 1: Don't take current job
        not_take = dp[i-1] if i > 0 else 0
      
        # Option 2: Take current job
        take = weight_i
        # Find latest job that doesn't conflict
        for j in range(i-1, -1, -1):
            if jobs_with_index[j][1] <= start_i:
                take += dp[j]
                break
      
        if take > not_take:
            dp[i] = take
            parent[i] = i  # Mark that we took this job
        else:
            dp[i] = not_take
            parent[i] = parent[i-1] if i > 0 else -1
  
    return dp[n-1], parent

# Example usage
jobs = [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)]
selected, count = job_scheduling(jobs)
print(f"Maximum jobs: {count}")
print(f"Selected job indices: {selected}")
```

**Code Explanation:**

* **Line 13** : Sorting by end time is O(n log n) but crucial for correctness
* **Line 20** : The greedy choice - if start time ≥ last end time, no overlap exists
* **Line 24** : We update `last_end_time` to track the latest commitment
* **Lines 31-54** : The weighted version uses DP because greedy doesn't work for weighted jobs

### Visual Timeline (Mobile-Optimized)

```
Time:  0  1  2  3  4  5  6  7  8  9
       ├──┼──┼──┼──┼──┼──┼──┼──┼──┤
Job A:    ■──■──■──■
Job B:          ■──■──■
Job C: ■──■──■──■──■──■
Job D:                ■──■──■
Job E:                      ■──■
Job F:                ■──■──■──■──■

Selected (✓):
Job A:    ✓──✓──✓──✓
Job D:                ✓──✓──✓
Job E:                      ✓──✓

Conflicts (✗):
Job B:          ✗ (overlaps A)
Job C: ✗ (overlaps A)
Job F:                ✗ (overlaps D)
```

---

## Key Differences and When to Use Each

### Fractional vs 0/1 Problems

> **Critical Distinction** : Fractional Knapsack uses greedy because we can take fractions. The 0/1 Knapsack requires dynamic programming because the greedy approach fails when we can't break items.

| Aspect                     | Fractional Knapsack        | Job Scheduling       |
| -------------------------- | -------------------------- | -------------------- |
| **Objective**        | Maximize value             | Maximize count       |
| **Constraint**       | Weight limit               | No time overlap      |
| **Greedy Strategy**  | Highest value/weight ratio | Earliest finish time |
| **Time Complexity**  | O(n log n)                 | O(n log n)           |
| **Space Complexity** | O(1)                       | O(1)                 |

### Common Interview Variations

**Fractional Knapsack Variations:**

```python
# Variation 1: Return the actual fractions taken
def knapsack_with_fractions(items, capacity):
    # Similar to above but return detailed breakdown
    pass

# Variation 2: Multiple knapsacks
def multiple_knapsacks(items, capacities):
    # Distribute items across multiple knapsacks
    pass
```

**Job Scheduling Variations:**

```python
# Variation 1: Jobs with different values
def weighted_job_scheduling_greedy(jobs):
    # Won't work with greedy - need DP!
    pass

# Variation 2: Minimum rooms needed
def minimum_meeting_rooms(intervals):
    # Different problem - use heap/priority queue
    pass
```

---

## FAANG Interview Tips

### Problem Recognition Patterns

> **Fractional Knapsack Signals** : "maximize value", "knapsack", "can take fractions", "portions allowed"

> **Job Scheduling Signals** : "maximum activities", "non-overlapping", "schedule meetings", "activity selection"

### Common Mistakes to Avoid

1. **Wrong Sorting Strategy** :

* Fractional: Don't sort by value or weight alone
* Job Scheduling: Don't sort by start time or duration

1. **Edge Cases** :

```python
   # Always handle these cases
   if not items or capacity <= 0:
       return 0

   if not jobs:
       return []
```

1. **Integer Overflow** : In large inputs, use appropriate data types

### Optimization Techniques

```python
# Space optimization for job scheduling
def optimized_job_scheduling(jobs):
    """
    Use only necessary variables instead of storing all intermediate results
    """
    jobs.sort(key=lambda x: x[1])  # Sort by end time
  
    count = 0
    last_end = float('-inf')
  
    for start, end in jobs:
        if start >= last_end:
            count += 1
            last_end = end
  
    return count
```

### Practice Problems for FAANG

> **Essential Practice** : LeetCode 435 (Non-overlapping Intervals), 452 (Minimum Arrows), 646 (Maximum Length of Pair Chain)

Both problems showcase the power of greedy algorithms when the problem structure allows for locally optimal choices to lead to globally optimal solutions. The key is recognizing when this property holds and implementing the correct greedy strategy.
