# Proving Correctness of Greedy Algorithms: A Deep Dive for FAANG Interviews

## Understanding the Foundation: What Are Greedy Algorithms?

> **Core Principle** : A greedy algorithm makes the locally optimal choice at each step, hoping to find a global optimum.

Let's start from the absolute beginning. Imagine you're standing at the base of a mountain with multiple paths leading upward. A greedy approach would be to always choose the path that seems to go up most steeply at each decision point, without considering the overall journey.

### The Fundamental Question

The critical question that haunts every greedy algorithm is: **"Does making the best local choice always lead to the globally best solution?"**

Unfortunately, the answer is often  **no** . This is why proving correctness becomes absolutely essential, especially in FAANG interviews where you're expected to rigorously justify your approach.

## Why FAANG Companies Care About Proofs

> **Interview Reality** : Simply writing a greedy solution isn't enough. You must convince your interviewer that your approach is mathematically sound.

FAANG interviewers test your ability to:

1. **Think critically** about algorithm design
2. **Communicate mathematical reasoning** clearly
3. **Distinguish** between correct and incorrect greedy approaches
4. **Handle edge cases** with confidence

## The Three Pillars of Greedy Algorithm Correctness

### 1. The Greedy Choice Property

> **Definition** : A globally optimal solution can be arrived at by making locally optimal (greedy) choices.

This means that when you make a greedy choice, you don't need to reconsider it later. Let's understand this with a simple example:

```python
def activity_selection(activities):
    """
    Select maximum number of non-overlapping activities
    activities = [(start, end), ...]
    """
    # Step 1: Sort by end time (greedy choice)
    activities.sort(key=lambda x: x[1])
  
    selected = []
    last_end_time = -1
  
    # Step 2: Always pick activity that ends earliest
    for start, end in activities:
        if start >= last_end_time:  # No overlap
            selected.append((start, end))
            last_end_time = end
  
    return selected

# Example usage
activities = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11)]
result = activity_selection(activities)
print(result)  # [(1, 4), (5, 7), (8, 11)]
```

**Detailed Explanation of the Code:**

* **Line 5** : We sort activities by their end time. This is our greedy choice criterion.
* **Line 7-8** : We initialize our selection list and track the last selected activity's end time.
* **Line 11-14** : For each activity, if it starts after the last selected activity ends, we can safely include it.

**Why this greedy choice works:**
The activity that ends earliest leaves the most room for future activities. This is the key insight that makes the greedy choice optimal.

### 2. Optimal Substructure

> **Definition** : An optimal solution contains optimal solutions to subproblems.

This means that after making a greedy choice, the remaining problem should also have an optimal solution that can be found greedily.

Let's visualize this with the activity selection:

```
Original Problem: Select from activities [A, B, C, D, E]
Greedy Choice: Select A (ends earliest)
Subproblem: Select from remaining activities [C, D, E] (B conflicts with A)

If the subproblem solution is optimal, and our greedy choice was correct,
then the overall solution is optimal.
```

### 3. The Exchange Argument (Most Important for Interviews)

> **The Heart of Greedy Proofs** : Show that any optimal solution can be "exchanged" to match your greedy solution without losing optimality.

This is the technique you'll use most in FAANG interviews. Let's break it down step by step:

## The Exchange Argument: A Detailed Framework

### Step-by-Step Proof Template

```
1. Assume there exists an optimal solution O that differs from greedy solution G
2. Find the first point where O and G differ
3. Show that we can "exchange" O's choice with G's choice
4. Prove that this exchange doesn't worsen the solution
5. Conclude that G is also optimal
```

Let's apply this to a classic problem:

### Example: Fractional Knapsack Problem

```python
def fractional_knapsack(capacity, items):
    """
    items = [(value, weight), ...]
    Returns maximum value that can be obtained
    """
    # Step 1: Calculate value-to-weight ratio for each item
    ratios = []
    for i, (value, weight) in enumerate(items):
        ratios.append((value / weight, value, weight, i))
  
    # Step 2: Sort by ratio in descending order (greedy choice)
    ratios.sort(reverse=True)
  
    total_value = 0
    remaining_capacity = capacity
  
    # Step 3: Take items greedily
    for ratio, value, weight, original_index in ratios:
        if remaining_capacity == 0:
            break
          
        if weight <= remaining_capacity:
            # Take the whole item
            total_value += value
            remaining_capacity -= weight
            print(f"Taking full item {original_index}: value={value}, weight={weight}")
        else:
            # Take fraction of the item
            fraction = remaining_capacity / weight
            total_value += value * fraction
            print(f"Taking {fraction:.2f} of item {original_index}: value={value * fraction:.2f}")
            remaining_capacity = 0
  
    return total_value

# Example
items = [(60, 10), (100, 20), (120, 30)]  # (value, weight)
capacity = 50
result = fractional_knapsack(capacity, items)
print(f"Maximum value: {result}")
```

**Code Explanation:**

* **Lines 5-7** : We calculate the value-to-weight ratio for each item. This ratio represents the "efficiency" of each item.
* **Line 10** : Sorting by ratio ensures we consider the most efficient items first.
* **Lines 16-26** : We greedily take as much of each item as possible, starting with the highest ratio.

### Proving Fractional Knapsack Correctness

> **Exchange Argument in Action** : Let's prove that taking items by highest value-to-weight ratio is optimal.

**Proof by Exchange Argument:**

1. **Assumption** : Suppose there's an optimal solution O that differs from our greedy solution G.
2. **First Difference** : Let item `i` be the first item where O and G differ. In G, we take item `i` (partially or fully), but in O, we take some other item `j` instead.
3. **Key Insight** : Since our greedy algorithm chose item `i` over item `j`, we know that `value[i]/weight[i] ≥ value[j]/weight[j]`.
4. **Exchange Step** : Replace some amount of item `j` in solution O with the same weight of item `i`.
5. **Value Analysis** :

```
   Value gained = (weight_exchanged) × (value[i]/weight[i])
   Value lost = (weight_exchanged) × (value[j]/weight[j])

   Since value[i]/weight[i] ≥ value[j]/weight[j], the exchange doesn't decrease total value.
```

1. **Conclusion** : We can transform O into G without losing value, so G is also optimal.

## Common FAANG Interview Patterns

### Pattern 1: Interval Scheduling Problems

```python
def merge_intervals(intervals):
    """
    Merge overlapping intervals
    intervals = [[start, end], ...]
    """
    if not intervals:
        return []
  
    # Greedy choice: sort by start time
    intervals.sort(key=lambda x: x[0])
  
    merged = [intervals[0]]
  
    for current in intervals[1:]:
        last_merged = merged[-1]
      
        # If current interval overlaps with last merged
        if current[0] <= last_merged[1]:
            # Merge them by extending the end time
            last_merged[1] = max(last_merged[1], current[1])
        else:
            # No overlap, add as new interval
            merged.append(current)
  
    return merged

# Example
intervals = [[1,3], [2,6], [8,10], [15,18]]
result = merge_intervals(intervals)
print(result)  # [[1,6], [8,10], [15,18]]
```

**Why this greedy approach works:**

* By sorting by start time, we ensure we process intervals in chronological order
* At each step, we have complete information to make the optimal merging decision
* The greedy choice (merge if overlap exists) is always correct because delaying the merge never provides better results

### Pattern 2: Minimum Spanning Tree (Kruskal's Algorithm)

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
  
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]
  
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py:
            return False
      
        # Union by rank
        if self.rank[px] < self.rank[py]:
            px, py = py, px
        self.parent[py] = px
        if self.rank[px] == self.rank[py]:
            self.rank[px] += 1
        return True

def kruskal_mst(n, edges):
    """
    Find Minimum Spanning Tree using Kruskal's algorithm
    n: number of vertices
    edges: [(weight, u, v), ...]
    """
    # Greedy choice: sort edges by weight
    edges.sort()
  
    uf = UnionFind(n)
    mst_edges = []
    total_weight = 0
  
    for weight, u, v in edges:
        # If adding this edge doesn't create a cycle
        if uf.union(u, v):
            mst_edges.append((u, v, weight))
            total_weight += weight
          
            # MST complete when we have n-1 edges
            if len(mst_edges) == n - 1:
                break
  
    return mst_edges, total_weight

# Example
n = 4
edges = [(1, 0, 1), (2, 1, 2), (3, 2, 3), (4, 3, 0), (5, 0, 2)]
mst, weight = kruskal_mst(n, edges)
print(f"MST edges: {mst}, Total weight: {weight}")
```

**Correctness Proof (Cut Property):**

> **Key Insight** : The lightest edge crossing any cut must be in some MST.

The exchange argument here works as follows:

1. Consider any cut that separates the graph into two components
2. The lightest edge crossing this cut must be in the MST
3. If an optimal solution doesn't include this edge, we can exchange it with a heavier edge in the MST without increasing total weight

## How to Approach Greedy Proofs in Interviews

### The Interview Strategy

```
Step 1: Identify the greedy choice
Step 2: State the greedy choice property clearly  
Step 3: Prove using exchange argument
Step 4: Address edge cases
Step 5: Analyze time complexity
```

### Sample Interview Dialogue

> **Interviewer** : "Prove that your greedy algorithm for the coin change problem is correct."

> **Your Response** : "I need to clarify - the greedy approach only works for certain coin systems. For the standard US coin system {1, 5, 10, 25}, it works because it has the 'canonical' property. Let me prove this using the exchange argument..."

```python
def coin_change_greedy(amount, coins):
    """
    Works ONLY for canonical coin systems like [1, 5, 10, 25]
    """
    coins.sort(reverse=True)  # Largest first
    result = []
  
    for coin in coins:
        count = amount // coin
        if count > 0:
            result.extend([coin] * count)
            amount %= coin
          
    return result if amount == 0 else None
```

> **Important Warning** : Always mention when greedy doesn't work! For coins like {1, 3, 4} and amount 6, greedy gives {4, 1, 1} (3 coins) but optimal is {3, 3} (2 coins).

## Advanced Techniques for Complex Proofs

### The Staying Ahead Argument

> **When to Use** : When you need to prove that your greedy solution is always "ahead" of any other solution at every step.

```python
def job_scheduling(jobs):
    """
    Schedule jobs to minimize total completion time
    jobs = [(processing_time, job_id), ...]
    """
    # Greedy choice: sort by processing time (shortest first)
    jobs.sort(key=lambda x: x[0])
  
    schedule = []
    current_time = 0
    total_completion_time = 0
  
    for processing_time, job_id in jobs:
        current_time += processing_time
        total_completion_time += current_time
        schedule.append((job_id, current_time))
      
    return schedule, total_completion_time
```

**Staying Ahead Proof:**
At any point in time, our greedy schedule has completed at least as many jobs as any other schedule, and the total completion time is minimized.

## Common Pitfalls and How to Avoid Them

### Pitfall 1: Assuming Greedy Always Works

```python
# WRONG: This greedy approach doesn't work for all inputs
def coin_change_wrong(amount, coins):
    coins.sort(reverse=True)
    count = 0
    for coin in coins:
        count += amount // coin
        amount %= coin
    return count if amount == 0 else -1

# Test case where it fails:
# coins = [1, 3, 4], amount = 6
# Greedy: 4 + 1 + 1 = 3 coins
# Optimal: 3 + 3 = 2 coins
```

### Pitfall 2: Incomplete Proofs

> **Remember** : You must prove BOTH that your greedy choice leads to an optimal solution AND that it has optimal substructure.

## Mobile-Optimized Algorithm Visualization

```
Activity Selection Timeline:

Time:  0---1---2---3---4---5---6---7---8---9---10---11
       |   |   |   |   |   |   |   |   |   |    |    |

A:     [-----]
B:         [-------]
C:     [---------------]  
D:                 [---]
E:         [------------------]
F:                 [-------]
G:                     [-------]
H:                         [-------]

Greedy Selection:
1. Pick A (ends at 4)
2. Pick D (starts at 5, ends at 7) 
3. Pick H (starts at 8, ends at 11)

Result: 3 activities selected
```

## Key Takeaways for FAANG Interviews

> **Golden Rule** : If you can't prove your greedy algorithm is correct, don't use it!

### Essential Points to Remember:

1. **Always state your greedy choice explicitly**
2. **Use the exchange argument as your primary proof technique**
3. **Mention when greedy doesn't work (shows deep understanding)**
4. **Practice common patterns: intervals, graphs, scheduling**
5. **Be prepared to code the solution AND prove its correctness**

### Final Interview Tip

> **Pro Strategy** : Start by asking "Should I assume this problem has the greedy choice property?" This shows you understand that not all problems can be solved greedily and demonstrates sophisticated algorithmic thinking.

The mastery of greedy algorithm proofs separates good candidates from great ones in FAANG interviews. The ability to rigorously justify your algorithmic choices shows mathematical maturity and deep understanding of algorithm design principles.
