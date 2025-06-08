# Dynamic Programming with Bitmasks: Mastering Subset and Permutation Problems

Let me take you on a journey through one of the most elegant and powerful techniques in competitive programming and FAANG interviews:  **Dynamic Programming with Bitmasks** .

## Understanding Bitmasks from First Principles

Before we dive into DP, let's understand what a bitmask actually represents.

### What is a Bitmask?

> **A bitmask is simply a sequence of bits (0s and 1s) that we use to represent the state of a set of items.**

Think of it as a light switch panel in your house:

* Each switch (bit) can be ON (1) or OFF (0)
* The entire panel (bitmask) tells us which lights are currently on

```
House with 4 rooms:
Kitchen  Living  Bedroom  Bathroom
   1        0       1        0
```

In this example, the kitchen and bedroom lights are on, represented by the bitmask `1010`.

### Why Use Bitmasks in Programming?

Let's say we have a set of 4 elements: `{A, B, C, D}`. We can represent any subset using a 4-bit number:

```
Subset {}        → 0000 (binary) → 0  (decimal)
Subset {A}       → 0001 (binary) → 1  (decimal)
Subset {B}       → 0010 (binary) → 2  (decimal)
Subset {A,B}     → 0011 (binary) → 3  (decimal)
Subset {C}       → 0100 (binary) → 4  (decimal)
...
Subset {A,B,C,D} → 1111 (binary) → 15 (decimal)
```

> **Key Insight: With n elements, we can represent all 2^n possible subsets using integers from 0 to 2^n - 1.**

## Basic Bitmask Operations

Let's master the fundamental operations:

```cpp
int n = 4; // number of elements

// Check if i-th bit is set (element i is in subset)
bool isSet(int mask, int i) {
    return (mask & (1 << i)) != 0;
}

// Set i-th bit (add element i to subset)
int setBit(int mask, int i) {
    return mask | (1 << i);
}

// Clear i-th bit (remove element i from subset)
int clearBit(int mask, int i) {
    return mask & (~(1 << i));
}

// Toggle i-th bit
int toggleBit(int mask, int i) {
    return mask ^ (1 << i);
}
```

Let me explain each operation:

 **`1 << i`** : This creates a number with only the i-th bit set. For i=2, this gives us `0100`.

 **`mask & (1 << i)`** : The AND operation checks if the i-th bit is set in our mask.

 **`mask | (1 << i)`** : The OR operation sets the i-th bit to 1.

 **`mask & (~(1 << i))`** : The AND with complement clears the i-th bit.

## Dynamic Programming with Bitmasks: The Core Concept

> **The key idea is to use the bitmask as a state in our DP, where each bit represents whether we've used/visited/included a particular element.**

The general pattern is:

```
dp[mask] = optimal value when we've processed elements represented by mask
```

## Subset Problems with Bitmask DP

Let's start with a classic example:  **Subset Sum with All Subsets** .

### Problem: Count Subsets with Given Sum

 **Problem** : Given an array of n integers, count how many subsets have sum equal to target.

Let's think step by step:

1. **State Definition** : `dp[mask][sum]` = number of ways to achieve `sum` using elements in `mask`
2. **Base Case** : `dp[0][0] = 1` (empty subset has sum 0)
3. **Transition** : For each subset, we either include the next element or don't

```cpp
#include <vector>
#include <iostream>
using namespace std;

int countSubsetsWithSum(vector<int>& arr, int target) {
    int n = arr.size();
  
    // dp[mask] = number of ways to achieve target using elements in mask
    vector<int> dp(1 << n, 0);
  
    // Try all possible subsets
    for (int mask = 0; mask < (1 << n); mask++) {
        int currentSum = 0;
      
        // Calculate sum of current subset
        for (int i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                currentSum += arr[i];
            }
        }
      
        // If sum equals target, we found a valid subset
        if (currentSum == target) {
            dp[mask] = 1;
        }
    }
  
    // Count all valid subsets
    int result = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        result += dp[mask];
    }
  
    return result;
}
```

 **Code Explanation** :

* We iterate through all possible masks from `0` to `2^n - 1`
* For each mask, we calculate the sum of elements in that subset
* If the sum equals our target, we mark this subset as valid
* Finally, we count all valid subsets

### Optimized Approach: Building Subsets Incrementally

```cpp
int countSubsetsOptimized(vector<int>& arr, int target) {
    int n = arr.size();
  
    // dp[mask] = set of all possible sums using elements in mask
    vector<vector<bool>> dp(1 << n, vector<bool>(target + 1, false));
  
    // Base case: empty subset has sum 0
    dp[0][0] = true;
  
    // Build subsets incrementally
    for (int i = 0; i < n; i++) {
        for (int mask = 0; mask < (1 << i); mask++) {
            for (int sum = 0; sum <= target; sum++) {
                if (dp[mask][sum]) {
                    // Don't include arr[i]
                    dp[mask][sum] = true;
                  
                    // Include arr[i] if possible
                    if (sum + arr[i] <= target) {
                        dp[mask | (1 << i)][sum + arr[i]] = true;
                    }
                }
            }
        }
    }
  
    // Count subsets with target sum
    int result = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[mask][target]) result++;
    }
  
    return result;
}
```

> **This approach builds subsets incrementally, considering each element one by one and updating our DP state accordingly.**

## Permutation Problems with Bitmask DP

Now let's tackle permutation problems, where the order matters and we need to visit all elements exactly once.

### Problem: Traveling Salesman Problem (TSP)

 **Problem** : Given n cities and distances between them, find the shortest path that visits all cities exactly once and returns to the starting city.

> **This is the classic application of bitmask DP for permutation problems.**

 **State Definition** : `dp[mask][i]` = minimum cost to visit all cities in `mask` and end at city `i`

```cpp
#include <vector>
#include <climits>
#include <algorithm>
using namespace std;

int tsp(vector<vector<int>>& dist) {
    int n = dist.size();
  
    // dp[mask][i] = min cost to visit cities in mask and end at city i
    vector<vector<int>> dp(1 << n, vector<int>(n, INT_MAX));
  
    // Base case: start at city 0
    dp[1][0] = 0; // mask = 1 means only city 0 is visited
  
    // Iterate through all possible masks
    for (int mask = 0; mask < (1 << n); mask++) {
        for (int u = 0; u < n; u++) {
            // If city u is not in current mask, skip
            if (!(mask & (1 << u))) continue;
          
            // If we can't reach city u, skip
            if (dp[mask][u] == INT_MAX) continue;
          
            // Try to extend path to unvisited cities
            for (int v = 0; v < n; v++) {
                // If city v is already visited, skip
                if (mask & (1 << v)) continue;
              
                // Create new mask with city v included
                int newMask = mask | (1 << v);
              
                // Update minimum cost
                dp[newMask][v] = min(dp[newMask][v], 
                                   dp[mask][u] + dist[u][v]);
            }
        }
    }
  
    // Find minimum cost to visit all cities and return to start
    int result = INT_MAX;
    int finalMask = (1 << n) - 1; // all cities visited
  
    for (int i = 1; i < n; i++) {
        if (dp[finalMask][i] != INT_MAX) {
            result = min(result, dp[finalMask][i] + dist[i][0]);
        }
    }
  
    return result;
}
```

 **Detailed Code Explanation** :

1. **Initialization** : We create a 2D DP table where `dp[mask][i]` represents the minimum cost to visit all cities in the bitmask and end at city `i`.
2. **Base Case** : `dp[1][0] = 0` means we start at city 0 with cost 0. The mask `1` in binary is `0001`, indicating only city 0 is visited.
3. **State Transition** :

* For each current mask and ending city `u`
* We try to extend our path to each unvisited city `v`
* The new mask becomes `mask | (1 << v)` (adding city v)
* We update the minimum cost to reach this new state

1. **Final Answer** : We check all ways to end our tour (visiting all cities) and return to the starting city.

## Advanced Pattern: Assignment Problem

Let's explore another classic:  **Optimal Task Assignment** .

### Problem: Assign N Tasks to N People

 **Problem** : Given n people and n tasks, with cost[i][j] representing the cost for person i to do task j, find the minimum cost to assign all tasks such that each person gets exactly one task.

```cpp
int minAssignmentCost(vector<vector<int>>& cost) {
    int n = cost.size();
  
    // dp[mask] = min cost to assign tasks in mask to first popcount(mask) people
    vector<int> dp(1 << n, INT_MAX);
  
    // Base case: no tasks assigned
    dp[0] = 0;
  
    // Iterate through all possible task assignments
    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] == INT_MAX) continue;
      
        // Count how many tasks are already assigned
        int person = __builtin_popcount(mask);
      
        // If all people are assigned, continue
        if (person == n) continue;
      
        // Try assigning each unassigned task to current person
        for (int task = 0; task < n; task++) {
            // If task is already assigned, skip
            if (mask & (1 << task)) continue;
          
            // Assign task to current person
            int newMask = mask | (1 << task);
            dp[newMask] = min(dp[newMask], 
                            dp[mask] + cost[person][task]);
        }
    }
  
    // Return cost of assigning all tasks
    return dp[(1 << n) - 1];
}
```

> **Key Insight** : We use `__builtin_popcount(mask)` to count how many tasks are assigned, which tells us which person we're currently assigning to.

## Common Patterns and Optimizations

### 1. Iterating Through Submasks

Sometimes we need to iterate through all submasks of a given mask:

```cpp
// Iterate through all submasks of mask
for (int submask = mask; submask > 0; submask = (submask - 1) & mask) {
    // Process submask
    cout << "Submask: " << submask << endl;
}
```

 **How it works** :

* `submask - 1` flips all trailing zeros and the rightmost 1
* `& mask` ensures we stay within the original mask

### 2. Memory Optimization for Large States

For problems where we only need the previous layer of DP:

```cpp
// Instead of dp[mask][other_state]
// Use two arrays and alternate between them
vector<int> prev(1 << n), curr(1 << n);

for (int step = 0; step < maxSteps; step++) {
    fill(curr.begin(), curr.end(), INT_MAX);
  
    // Update curr based on prev
    for (int mask = 0; mask < (1 << n); mask++) {
        // Transitions...
    }
  
    // Swap for next iteration
    swap(prev, curr);
}
```

## Interview Tips and Common Pitfalls

> **Important: Bitmask DP is typically used when n ≤ 20, as 2^20 ≈ 1 million states are manageable.**

### Common Mistakes to Avoid:

1. **Off-by-one errors in bit indexing** : Remember that bit positions are 0-indexed.
2. **Integer overflow** : For large costs, use `long long` instead of `int`.
3. **Forgetting base cases** : Always initialize your starting state correctly.
4. **Incorrect mask transitions** : Double-check your bit operations.

### Time and Space Complexity:

```
Time Complexity: O(2^n * n * transitions)
Space Complexity: O(2^n * additional_states)
```

For TSP: `O(2^n * n^2)` time and `O(2^n * n)` space.

## Practice Problems for FAANG Interviews

Here are some problems that frequently appear in technical interviews:

> **1. Shortest Hamiltonian Path** : Find the shortest path visiting all nodes exactly once (similar to TSP but without returning).

> **2. Optimal Team Formation** : Given people with different skills, form teams such that each team has all required skills.

> **3. Maximum Score Assignment** : Assign tasks to maximize total score instead of minimizing cost.

The beauty of bitmask DP lies in its ability to elegantly handle exponential state spaces while providing optimal solutions. Master these patterns, and you'll be well-equipped to tackle complex combinatorial problems in your next FAANG interview!
