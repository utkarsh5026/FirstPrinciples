# Greedy Algorithms: From First Principles to FAANG Mastery

## Understanding the Foundation: What is a Greedy Algorithm?

> **Core Principle** : A greedy algorithm makes the locally optimal choice at each step, hoping to find a global optimum. It never reconsiders its choices once made.

Let's start from the absolute beginning. Imagine you're collecting coins scattered on a path, and you can only move forward. A greedy approach would be to pick up the largest coin you can see at each step, without worrying about what coins might be ahead.

 **The Greedy Choice Property** : At each decision point, we make the choice that looks best right now, without considering the overall problem.

**Key Characteristics:**

* Makes one choice at a time
* Never backtracks or reconsiders previous decisions
* Often (but not always) leads to optimal solutions
* Generally faster than dynamic programming approaches

## The Anatomy of Greedy Problems

> **Recognition Pattern** : Greedy problems typically involve optimization (finding minimum/maximum) and have the property that local optimal choices lead to global optimum.

### When Greedy Works:

1. **Optimal Substructure** : The optimal solution contains optimal solutions to subproblems
2. **Greedy Choice Property** : A global optimum can be reached by making locally optimal choices

### When Greedy Fails:

Consider the coin change problem with denominations [1, 3, 4] and target 6:

* Greedy: 4 + 1 + 1 = 3 coins
* Optimal: 3 + 3 = 2 coins

## Common Greedy Algorithm Patterns in FAANG Interviews

### Pattern 1: Activity Selection / Interval Scheduling

> **Core Insight** : When dealing with intervals, sorting by end time and greedily selecting non-overlapping intervals often yields optimal results.

 **Problem** : Given n activities with start and end times, select maximum number of non-overlapping activities.

```python
def activity_selection(activities):
    """
    Select maximum number of non-overlapping activities
  
    Time Complexity: O(n log n) due to sorting
    Space Complexity: O(1) excluding input
    """
    # Sort by end time - this is the greedy choice
    # Why end time? We want to finish earliest to leave
    # maximum room for future activities
    activities.sort(key=lambda x: x[1])
  
    selected = []
    last_end_time = 0
  
    for start, end in activities:
        # If current activity starts after last selected ends
        if start >= last_end_time:
            selected.append((start, end))
            last_end_time = end
          
    return selected

# Example usage
activities = [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)]
result = activity_selection(activities)
print(f"Selected activities: {result}")
# Output: [(1, 4), (5, 7), (8, 9)]
```

**Detailed Explanation:**

* We sort by end time because finishing early gives us maximum opportunity for future selections
* The greedy choice is: "Always pick the activity that finishes earliest among remaining activities"
* This works because if we have an optimal solution that doesn't include the earliest-finishing activity, we can always replace one activity with it without making the solution worse

### Pattern 2: Fractional Knapsack

> **Core Insight** : When items can be broken into fractions, prioritize by value-to-weight ratio to maximize total value.

```python
def fractional_knapsack(capacity, items):
    """
    Solve fractional knapsack using greedy approach
  
    items: list of (value, weight) tuples
    capacity: maximum weight knapsack can hold
    """
    # Calculate value-to-weight ratio for each item
    # This is our greedy criterion
    items_with_ratio = []
    for i, (value, weight) in enumerate(items):
        ratio = value / weight if weight > 0 else 0
        items_with_ratio.append((ratio, value, weight, i))
  
    # Sort by ratio in descending order
    # Greedy choice: always take item with highest value/weight ratio
    items_with_ratio.sort(reverse=True)
  
    total_value = 0
    remaining_capacity = capacity
    selected_items = []
  
    for ratio, value, weight, original_index in items_with_ratio:
        if remaining_capacity == 0:
            break
          
        if weight <= remaining_capacity:
            # Take entire item
            total_value += value
            remaining_capacity -= weight
            selected_items.append((original_index, 1.0))  # 100% of item
        else:
            # Take fraction of item
            fraction = remaining_capacity / weight
            total_value += value * fraction
            selected_items.append((original_index, fraction))
            remaining_capacity = 0
  
    return total_value, selected_items

# Example
items = [(60, 10), (100, 20), (120, 30)]  # (value, weight)
capacity = 50
max_value, selection = fractional_knapsack(capacity, items)
print(f"Maximum value: {max_value}")
print(f"Item selection: {selection}")
```

**Why This Works:**

* The value-to-weight ratio represents "efficiency" of each item
* Taking the most efficient items first maximizes total value
* Unlike 0/1 knapsack, we can take fractions, making greedy optimal

### Pattern 3: Minimum Spanning Tree (MST)

> **Fundamental Concept** : Connect all vertices with minimum total edge weight without forming cycles.

Here's Kruskal's algorithm - a classic greedy approach:

```python
class UnionFind:
    """
    Union-Find data structure for cycle detection
    Essential for Kruskal's algorithm
    """
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
  
    def find(self, x):
        # Path compression optimization
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
  
    def union(self, x, y):
        # Union by rank optimization
        px, py = self.find(x), self.find(y)
        if px == py:
            return False  # Already connected
      
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
    edges: list of (weight, u, v) tuples
    """
    # Greedy choice: always pick the lightest edge that doesn't create cycle
    edges.sort()  # Sort by weight
  
    uf = UnionFind(n)
    mst = []
    total_weight = 0
  
    for weight, u, v in edges:
        # If adding this edge doesn't create cycle
        if uf.union(u, v):
            mst.append((u, v, weight))
            total_weight += weight
          
            # MST has exactly n-1 edges
            if len(mst) == n - 1:
                break
  
    return mst, total_weight

# Example usage
edges = [(4, 0, 1), (8, 0, 2), (3, 1, 2), (5, 1, 3), (6, 2, 3)]
mst, weight = kruskal_mst(4, edges)
print(f"MST edges: {mst}")
print(f"Total weight: {weight}")
```

**The Greedy Logic:**

* Always choose the smallest weight edge that doesn't create a cycle
* This works because any cycle would contain a heavier edge that we can remove
* Union-Find efficiently detects cycles in nearly constant time

### Pattern 4: Huffman Coding (Priority Queue Pattern)

> **Information Theory Application** : Assign shorter codes to more frequent characters to minimize total encoding length.

```python
import heapq
from collections import defaultdict

class HuffmanNode:
    def __init__(self, char=None, freq=0, left=None, right=None):
        self.char = char
        self.freq = freq
        self.left = left
        self.right = right
  
    def __lt__(self, other):
        # For heap comparison
        return self.freq < other.freq

def build_huffman_tree(text):
    """
    Build Huffman tree using greedy approach
    Greedy choice: always merge two least frequent nodes
    """
    # Count character frequencies
    freq_map = defaultdict(int)
    for char in text:
        freq_map[char] += 1
  
    # Create leaf nodes and add to min-heap
    heap = []
    for char, freq in freq_map.items():
        node = HuffmanNode(char, freq)
        heapq.heappush(heap, node)
  
    # Build tree bottom-up
    while len(heap) > 1:
        # Greedy choice: take two nodes with minimum frequency
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
      
        # Create internal node
        merged = HuffmanNode(
            freq=left.freq + right.freq,
            left=left,
            right=right
        )
      
        heapq.heappush(heap, merged)
  
    return heap[0] if heap else None

def generate_codes(root):
    """Generate Huffman codes from tree"""
    if not root:
        return {}
  
    codes = {}
  
    def dfs(node, code):
        if node.char is not None:  # Leaf node
            codes[node.char] = code or "0"  # Handle single character case
            return
      
        if node.left:
            dfs(node.left, code + "0")
        if node.right:
            dfs(node.right, code + "1")
  
    dfs(root, "")
    return codes

# Example usage
text = "hello world"
root = build_huffman_tree(text)
codes = generate_codes(root)

print("Character codes:")
for char, code in sorted(codes.items()):
    print(f"'{char}': {code}")
```

**Why Greedy Works Here:**

* Always combining the two least frequent nodes minimizes the total encoding length
* More frequent characters end up closer to root (shorter codes)
* Less frequent characters get longer codes, but they're used less often

## Advanced FAANG Interview Patterns

### Pattern 5: Gas Station Problem

> **Circular Array Insight** : Find starting position for a circular journey where you never run out of fuel.

```python
def can_complete_circuit(gas, cost):
    """
    Determine if we can complete the circuit and find starting point
  
    Key insight: If total gas >= total cost, solution exists
    Greedy choice: Start from station where we first go positive
    """
    total_gas = sum(gas)
    total_cost = sum(cost)
  
    # If total gas < total cost, impossible
    if total_gas < total_cost:
        return -1
  
    current_gas = 0
    start_station = 0
  
    for i in range(len(gas)):
        current_gas += gas[i] - cost[i]
      
        # If we can't reach next station
        if current_gas < 0:
            # Greedy choice: try starting from next station
            start_station = i + 1
            current_gas = 0
  
    return start_station

# Example
gas = [1, 2, 3, 4, 5]
cost = [3, 4, 5, 1, 2]
result = can_complete_circuit(gas, cost)
print(f"Start from station: {result}")
```

**The Greedy Insight:**

* If we can't reach station `i+1` from station `j`, then we can't reach `i+1` from any station between `j` and `i`
* So we greedily skip to station `i+1` as our next candidate

### Pattern 6: Meeting Rooms II (Minimum Conference Rooms)

> **Interval Management** : Use greedy approach with priority queue to track ongoing meetings.

```python
import heapq

def min_meeting_rooms(intervals):
    """
    Find minimum number of conference rooms needed
  
    Greedy approach: Always assign meeting to room that frees up earliest
    """
    if not intervals:
        return 0
  
    # Sort meetings by start time
    intervals.sort(key=lambda x: x[0])
  
    # Min-heap to track room end times
    # Heap contains end times of ongoing meetings
    rooms = []
  
    for start, end in intervals:
        # If a room is free (earliest end time <= current start)
        if rooms and rooms[0] <= start:
            heapq.heappop(rooms)  # Free up the room
      
        # Assign current meeting to a room
        heapq.heappush(rooms, end)
  
    return len(rooms)

# Example
meetings = [(0, 30), (5, 10), (15, 20)]
rooms_needed = min_meeting_rooms(meetings)
print(f"Minimum rooms needed: {rooms_needed}")
```

**Greedy Strategy Breakdown:**

```
Time:     0    5    10   15   20   30
Meeting1: [--------------------]
Meeting2:      [----]
Meeting3:           [----]

Room allocation:
- Room 1: Meeting1 (0-30)
- Room 2: Meeting2 (5-10), then Meeting3 (15-20)
```

The algorithm greedily assigns each meeting to the room that becomes available earliest.

## Problem-Solving Framework for FAANG Interviews

> **Recognition Checklist** : How to identify when to use greedy algorithms in interviews.

### Step 1: Problem Analysis

```
Ask yourself:
1. Does the problem ask for optimal solution (min/max)?
2. Can I make locally optimal choices?
3. Do local optimal choices lead to global optimum?
4. Is there a natural ordering/sorting strategy?
```

### Step 2: Greedy Strategy Identification

**Common Sorting Strategies:**

* **Intervals** : Sort by end time (activity selection)
* **Tasks** : Sort by deadline or priority
* **Items** : Sort by value/weight ratio
* **Edges** : Sort by weight (MST)

### Step 3: Implementation Template

```python
def greedy_solution(input_data):
    # Step 1: Sort input according to greedy criterion
    sorted_data = sorted(input_data, key=greedy_criterion)
  
    # Step 2: Initialize result structure
    result = []
  
    # Step 3: Iterate and make greedy choices
    for item in sorted_data:
        if is_valid_choice(item, result):
            result.append(item)
            update_state(item)
  
    return result
```

## Practice Problems Roadmap

> **Progressive Difficulty** : Start with these problems to master greedy thinking.

### Beginner Level:

1. **Maximum Subarray** (Kadane's Algorithm)
2. **Best Time to Buy and Sell Stock**
3. **Remove Duplicate Letters**

### Intermediate Level:

1. **Jump Game II** (Minimum jumps)
2. **Partition Labels**
3. **Queue Reconstruction by Height**

### Advanced Level:

1. **Merge Intervals** variations
2. **Task Scheduler**
3. **Minimum Number of Arrows to Burst Balloons**

### Example: Jump Game II (Detailed Walkthrough)

```python
def jump_game_ii(nums):
    """
    Find minimum number of jumps to reach end
  
    Greedy insight: At each step, jump to position that 
    gives maximum reach for next jump
    """
    if len(nums) <= 1:
        return 0
  
    jumps = 0
    current_reach = 0  # Farthest we can reach with current jumps
    next_reach = 0     # Farthest we can reach with one more jump
  
    for i in range(len(nums) - 1):
        # Update maximum reach with one more jump
        next_reach = max(next_reach, i + nums[i])
      
        # If we've explored all positions reachable with current jumps
        if i == current_reach:
            jumps += 1
            current_reach = next_reach
          
            # Early termination if we can reach the end
            if current_reach >= len(nums) - 1:
                break
  
    return jumps

# Example trace for [2,3,1,1,4]:
# i=0: next_reach=2, i==current_reach(0), jumps=1, current_reach=2
# i=1: next_reach=4, i<current_reach(2)
# i=2: next_reach=4, i==current_reach(2), jumps=2, current_reach=4
# Result: 2 jumps
```

**Visual Representation:**

```
Array: [2, 3, 1, 1, 4]
Index:  0  1  2  3  4

Jump 1: From index 0, can reach indices 1,2
Jump 2: From indices 1,2 can reach index 4

Greedy choice: Always extend reach as far as possible
```

## Key Takeaways for FAANG Success

> **Interview Strategy** : Master these concepts to excel in algorithm interviews.

1. **Pattern Recognition** : Learn to quickly identify greedy problems
2. **Proof Thinking** : Always consider why greedy works for the specific problem
3. **Edge Cases** : Consider when greedy might fail
4. **Time Complexity** : Greedy algorithms are often O(n log n) due to sorting
5. **Alternative Approaches** : Know when DP or other methods might be better

**Common Interview Questions:**

* "Why does this greedy approach work?"
* "Can you prove the greedy choice is optimal?"
* "What if we used a different sorting criterion?"
* "What's the time and space complexity?"

The mastery of greedy algorithms lies not just in memorizing patterns, but in developing the intuition to recognize when local optimal choices lead to global optimum. This mathematical insight, combined with strong implementation skills, will serve you well in any technical interview setting.
