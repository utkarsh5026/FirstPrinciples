# Priority Queues: From First Principles to FAANG Interview Mastery

## What is a Priority Queue? Understanding the Core Concept

Let's start from the absolute beginning. Imagine you're managing a hospital emergency room. Patients arrive continuously, but they can't all be treated in the order they arrive. A person with a heart attack needs immediate attention, while someone with a minor cut can wait. This is exactly what a priority queue does - it manages elements where  **order matters based on priority, not arrival time** .

> **Core Principle** : A priority queue is an abstract data type where each element has an associated priority. Elements are served based on their priority rather than their insertion order.

## Building Intuition: Real-World Analogies

### The Airport Boarding Example

Consider airplane boarding:

* First Class (Priority 1) - boards first
* Business Class (Priority 2) - boards second
* Economy (Priority 3) - boards last

Even if an Economy passenger arrives at the gate before a First Class passenger, the First Class passenger boards first due to higher priority.

```
Arrival Order: Economy → Business → First Class
Boarding Order: First Class → Business → Economy
```

## First Principles: How Does a Priority Queue Actually Work?

### The Naive Approach vs. Efficient Implementation

 **Naive Approach** : Use a simple array and scan for highest priority

* Insert: O(1) - just append
* Extract max: O(n) - scan entire array

 **Efficient Approach** : Use a **Binary Heap**

* Insert: O(log n)
* Extract max: O(log n)

> **Why Binary Heap?** A binary heap maintains the heap property efficiently while providing logarithmic operations, making it perfect for priority queue implementation.

## Understanding Binary Heaps: The Engine Behind Priority Queues

### Heap Property Explained

A **max heap** follows this rule:

> **Heap Property** : Every parent node has a value greater than or equal to its children.

Let's visualize this with a simple example:

```
       90
      /  \
    80    70
   / \    /
  50 60  40
```

### Array Representation: The Magic Behind the Structure

Binary heaps are stored in arrays using a brilliant mathematical relationship:

> **Key Insight** : For any element at index `i`:
>
> * Left child: `2*i + 1`
> * Right child: `2*i + 2`
> * Parent: `(i-1)/2`

```
Array: [90, 80, 70, 50, 60, 40]
Index:  0   1   2   3   4   5

Element 80 (index 1):
- Left child: 2*1+1 = 3 → element 50
- Right child: 2*1+2 = 4 → element 60
- Parent: (1-1)/2 = 0 → element 90
```

## Core Operations: Step-by-Step Implementation

### 1. Insertion (Bubble Up)

When we insert a new element, we:

1. Add it at the end of the array
2. "Bubble up" by comparing with parent
3. Swap if child > parent
4. Repeat until heap property is satisfied

```python
def insert(heap, value):
    """
    Insert a value into the max heap
    Time Complexity: O(log n)
    """
    # Step 1: Add value to end of heap
    heap.append(value)
  
    # Step 2: Bubble up to maintain heap property
    current_index = len(heap) - 1
  
    while current_index > 0:
        parent_index = (current_index - 1) // 2
      
        # If parent is already greater, heap property satisfied
        if heap[parent_index] >= heap[current_index]:
            break
          
        # Swap with parent and move up
        heap[parent_index], heap[current_index] = heap[current_index], heap[parent_index]
        current_index = parent_index
```

 **Example Walkthrough** :

```
Initial heap: [90, 80, 70, 50, 60, 40]
Insert 85:

Step 1: [90, 80, 70, 50, 60, 40, 85]
Step 2: Compare 85 with parent 70 → 85 > 70, swap
        [90, 80, 85, 50, 60, 40, 70]
Step 3: Compare 85 with parent 90 → 85 < 90, stop
```

### 2. Extract Maximum (Bubble Down)

Extracting the maximum involves:

1. Remove root (maximum element)
2. Move last element to root
3. "Bubble down" by comparing with children
4. Swap with larger child if necessary

```python
def extract_max(heap):
    """
    Extract maximum element from max heap
    Time Complexity: O(log n)
    """
    if not heap:
        return None
      
    # Step 1: Store max value to return
    max_value = heap[0]
  
    # Step 2: Move last element to root
    heap[0] = heap[-1]
    heap.pop()
  
    # Step 3: Bubble down to restore heap property
    current_index = 0
  
    while True:
        left_child = 2 * current_index + 1
        right_child = 2 * current_index + 2
        largest = current_index
      
        # Find largest among current, left child, right child
        if (left_child < len(heap) and 
            heap[left_child] > heap[largest]):
            largest = left_child
          
        if (right_child < len(heap) and 
            heap[right_child] > heap[largest]):
            largest = right_child
      
        # If current is largest, heap property satisfied
        if largest == current_index:
            break
          
        # Swap with larger child and continue
        heap[current_index], heap[largest] = heap[largest], heap[current_index]
        current_index = largest
  
    return max_value
```

## Complete Priority Queue Implementation

```python
class PriorityQueue:
    """
    Max heap based priority queue implementation
    Higher values have higher priority
    """
  
    def __init__(self):
        self.heap = []
  
    def push(self, item, priority):
        """
        Add item with given priority
        We store tuples (priority, item) for comparison
        """
        # Use negative priority for min heap behavior if needed
        self.heap.append((priority, item))
        self._bubble_up(len(self.heap) - 1)
  
    def pop(self):
        """Extract highest priority item"""
        if not self.heap:
            raise IndexError("Priority queue is empty")
          
        # Store result
        result = self.heap[0]
      
        # Move last to first and bubble down
        self.heap[0] = self.heap[-1]
        self.heap.pop()
      
        if self.heap:  # If heap not empty after pop
            self._bubble_down(0)
          
        return result[1]  # Return item, not priority
  
    def _bubble_up(self, index):
        """Restore heap property upward"""
        while index > 0:
            parent = (index - 1) // 2
            if self.heap[parent][0] >= self.heap[index][0]:
                break
            self.heap[parent], self.heap[index] = self.heap[index], self.heap[parent]
            index = parent
  
    def _bubble_down(self, index):
        """Restore heap property downward"""
        while True:
            left = 2 * index + 1
            right = 2 * index + 2
            largest = index
          
            if (left < len(self.heap) and 
                self.heap[left][0] > self.heap[largest][0]):
                largest = left
              
            if (right < len(self.heap) and 
                self.heap[right][0] > self.heap[largest][0]):
                largest = right
          
            if largest == index:
                break
              
            self.heap[index], self.heap[largest] = self.heap[largest], self.heap[index]
            index = largest
```

## FAANG Interview Applications: Where Priority Queues Shine

### 1. **Dijkstra's Shortest Path Algorithm**

Priority queues are essential for finding shortest paths in graphs.

> **Why Priority Queue?** We always want to explore the node with the smallest distance first to guarantee optimal solution.

```python
def dijkstra(graph, start):
    """
    Find shortest paths using priority queue
    graph: adjacency list {node: [(neighbor, weight), ...]}
    """
    import heapq
  
    # Distance from start to each node
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
  
    # Priority queue: (distance, node)
    pq = [(0, start)]
    visited = set()
  
    while pq:
        current_dist, current_node = heapq.heappop(pq)
      
        # Skip if already processed
        if current_node in visited:
            continue
          
        visited.add(current_node)
      
        # Check all neighbors
        for neighbor, weight in graph[current_node]:
            distance = current_dist + weight
          
            # If found shorter path, update
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
  
    return distances
```

 **Why this works** : The priority queue ensures we always process the node with minimum distance first, guaranteeing that when we visit a node, we've found its optimal distance.

### 2. **K Largest/Smallest Elements**

One of the most common FAANG interview patterns.

```python
def find_k_largest(nums, k):
    """
    Find k largest elements using min heap
    Time: O(n log k), Space: O(k)
    """
    import heapq
  
    # Use min heap of size k
    # The root will be the k-th largest element
    heap = []
  
    for num in nums:
        if len(heap) < k:
            heapq.heappush(heap, num)
        elif num > heap[0]:  # num is larger than smallest in heap
            heapq.heapreplace(heap, num)  # Remove smallest, add num
  
    return heap

# Example usage
numbers = [3, 1, 5, 12, 2, 11, 8, 7]
result = find_k_largest(numbers, 3)
print(f"3 largest elements: {sorted(result, reverse=True)}")
# Output: [12, 11, 8]
```

> **Key Insight** : For k largest elements, we use a min heap of size k. The root always contains the k-th largest element, and any element larger than this can potentially be in our final answer.

### 3. **Merge K Sorted Lists**

A classic problem that elegantly demonstrates priority queue usage.

```python
def merge_k_sorted_lists(lists):
    """
    Merge k sorted linked lists using priority queue
    """
    import heapq
  
    # Priority queue to store (value, list_index, node_index)
    pq = []
  
    # Initialize heap with first element of each list
    for i, lst in enumerate(lists):
        if lst:  # If list is not empty
            heapq.heappush(pq, (lst[0], i, 0))
  
    result = []
  
    while pq:
        value, list_idx, node_idx = heapq.heappop(pq)
        result.append(value)
      
        # Add next element from the same list
        if node_idx + 1 < len(lists[list_idx]):
            next_value = lists[list_idx][node_idx + 1]
            heapq.heappush(pq, (next_value, list_idx, node_idx + 1))
  
    return result

# Example
lists = [
    [1, 4, 5],
    [1, 3, 4],
    [2, 6]
]
merged = merge_k_sorted_lists(lists)
print(f"Merged: {merged}")
# Output: [1, 1, 2, 3, 4, 4, 5, 6]
```

 **Algorithm Explanation** :

1. **Initialization** : Add the first element from each list to the priority queue
2. **Main Loop** : Always extract the smallest element and add it to result
3. **Replenishment** : When we take an element from a list, add the next element from that same list
4. **Termination** : Continue until all elements are processed

### 4. **Top K Frequent Elements**

Another frequent FAANG interview question combining hashmaps and priority queues.

```python
def top_k_frequent(nums, k):
    """
    Find k most frequent elements
    Time: O(n log k), Space: O(n)
    """
    import heapq
    from collections import Counter
  
    # Count frequencies
    count = Counter(nums)
  
    # Use min heap to keep track of top k frequent elements
    heap = []
  
    for num, freq in count.items():
        if len(heap) < k:
            heapq.heappush(heap, (freq, num))
        elif freq > heap[0][0]:
            heapq.heapreplace(heap, (freq, num))
  
    # Extract elements (they'll be in ascending order of frequency)
    return [num for freq, num in heap]
```

## Advanced Applications and Optimizations

### 1. **Custom Priority Comparisons**

Sometimes we need complex priority logic:

```python
class Task:
    def __init__(self, name, priority, deadline):
        self.name = name
        self.priority = priority
        self.deadline = deadline
  
    def __lt__(self, other):
        """
        Custom comparison for priority queue
        First by priority (higher first), then by deadline (earlier first)
        """
        if self.priority != other.priority:
            return self.priority > other.priority  # Higher priority first
        return self.deadline < other.deadline      # Earlier deadline first

# Usage
import heapq
tasks = []
heapq.heappush(tasks, Task("Email", 2, 5))
heapq.heappush(tasks, Task("Meeting", 3, 3))
heapq.heappush(tasks, Task("Code Review", 3, 1))

# Will prioritize: Meeting or Code Review (both priority 3), 
# but Code Review has earlier deadline
```

### 2. **Memory-Efficient Priority Queue**

For large datasets, we might want to limit memory usage:

```python
class BoundedPriorityQueue:
    """
    Priority queue with maximum size limit
    Automatically removes lowest priority items when full
    """
  
    def __init__(self, max_size):
        self.max_size = max_size
        self.heap = []
  
    def push(self, item, priority):
        if len(self.heap) < self.max_size:
            heapq.heappush(self.heap, (priority, item))
        elif priority > self.heap[0][0]:  # Higher than lowest priority
            heapq.heapreplace(self.heap, (priority, item))
  
    def get_all(self):
        """Return all items sorted by priority (highest first)"""
        return [item for priority, item in sorted(self.heap, reverse=True)]
```

## Time and Space Complexity Analysis

> **Essential Complexities for Interviews:**

| Operation   | Binary Heap | Array (unsorted) | Array (sorted) |
| ----------- | ----------- | ---------------- | -------------- |
| Insert      | O(log n)    | O(1)             | O(n)           |
| Extract Max | O(log n)    | O(n)             | O(1)           |
| Peek Max    | O(1)        | O(n)             | O(1)           |
| Space       | O(n)        | O(n)             | O(n)           |

 **Why Binary Heap Wins** : It provides the best balance between insertion and extraction operations, making it ideal for scenarios where both operations are frequent.

## Common Interview Patterns and Problem-Solving Strategies

### Pattern 1: "K-th Element" Problems

* Use min heap of size k for k largest elements
* Use max heap of size k for k smallest elements
* Key insight: The root contains the boundary element

### Pattern 2: "Merge" Problems

* Multiple sorted streams → priority queue
* Always extract minimum/maximum across all streams
* Replenish from the same stream

### Pattern 3: "Simulation" Problems

* Events with timestamps → priority queue by time
* Process events in chronological order
* Examples: Meeting rooms, CPU scheduling

## Practice Problems for FAANG Interviews

1. **Kth Largest Element in Stream** (Easy)
2. **Meeting Rooms II** (Medium)
3. **Merge k Sorted Lists** (Hard)
4. **Find Median from Data Stream** (Hard)
5. **Smallest Range Covering Elements from K Lists** (Hard)

> **Interview Tip** : Always clarify whether you need k largest or k smallest, and whether to use min heap or max heap. This is a common source of confusion that can derail an otherwise perfect solution.

Priority queues are fundamental to many advanced algorithms and system design problems. Master these concepts, and you'll have a powerful tool for tackling complex FAANG interview questions with confidence and clarity.
