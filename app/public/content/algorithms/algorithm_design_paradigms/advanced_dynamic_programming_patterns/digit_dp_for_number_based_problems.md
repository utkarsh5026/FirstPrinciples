# Digit Dynamic Programming: From First Principles to FAANG Mastery

## Understanding the Foundation: What is Dynamic Programming?

Before diving into Digit DP, let's establish the fundamental principles of Dynamic Programming itself.

> **Core Principle** : Dynamic Programming is a method for solving complex problems by breaking them down into simpler subproblems, solving each subproblem only once, and storing the results to avoid redundant calculations.

Think of DP as a smart way of solving puzzles where you remember the solutions to smaller pieces so you don't have to solve them again.

### The Two Essential Properties:

1. **Optimal Substructure** : The optimal solution contains optimal solutions to subproblems
2. **Overlapping Subproblems** : The same subproblems appear multiple times

## What Makes Number-Based Problems Special?

When working with numbers in competitive programming and interviews, we often need to:

* Count numbers with specific properties in a range [L, R]
* Find numbers satisfying certain digit constraints
* Calculate sums or products based on digit patterns

> **The Challenge** : Iterating through every number in a large range (like 1 to 10^18) is computationally impossible. We need a smarter approach.

This is where Digit DP becomes our powerful tool.

## The Core Concept of Digit DP

Digit DP allows us to solve problems by considering numbers digit by digit, from left to right (most significant to least significant).

> **Key Insight** : Instead of generating actual numbers, we build them digit by digit while maintaining certain states that help us track constraints and properties.

### The State Space

In Digit DP, our state typically consists of:

```
State = (position, tight, [other_constraints])
```

Let me break this down:

* **position** : Which digit position we're currently at (0 to n-1)
* **tight** : Whether we're still bounded by the upper limit
* **other_constraints** : Problem-specific states (sum, remainder, etc.)

## The Standard Digit DP Template

Let's build the template step by step:

```cpp
#include <iostream>
#include <vector>
#include <string>
#include <cstring>
using namespace std;

class DigitDP {
private:
    string num;
    vector<vector<int>> dp;
  
public:
    // Main function to count numbers from 0 to n with given property
    int countNumbers(string n) {
        num = n;
        dp.assign(n.length(), vector<int>(2, -1));
        return solve(0, true);
    }
  
private:
    int solve(int pos, bool tight) {
        // Base case: we've placed all digits
        if (pos == num.length()) {
            return 1; // Found a valid number
        }
      
        // Check if already computed
        if (!tight && dp[pos][0] != -1) {
            return dp[pos][0];
        }
      
        // Determine the limit for current digit
        int limit = tight ? (num[pos] - '0') : 9;
        int result = 0;
      
        // Try all possible digits for current position
        for (int digit = 0; digit <= limit; digit++) {
            bool newTight = tight && (digit == limit);
            result += solve(pos + 1, newTight);
        }
      
        // Store result only if not tight
        if (!tight) {
            dp[pos][0] = result;
        }
      
        return result;
    }
};
```

### Understanding Each Component:

**1. The `tight` flag:**

```cpp
bool newTight = tight && (digit == limit);
```

> This tracks whether we're still constrained by the upper bound. If `tight` is true and we choose the maximum allowed digit, we remain tight for the next position.

**2. Memoization strategy:**

```cpp
if (!tight && dp[pos][0] != -1) {
    return dp[pos][0];
}
```

> We only memoize when `tight` is false because tight states depend on the specific number we're bounded by.

## Step-by-Step Example: Count Numbers ≤ N

Let's trace through counting all numbers from 0 to 123:

```
Number: "123"
Position: 0  1  2
         1  2  3
```

### Execution Tree (Simplified):

```
solve(0, tight=true)
├── digit=0: solve(1, tight=false)
│   ├── digit=0: solve(2, tight=false) → ... → 1
│   ├── digit=1: solve(2, tight=false) → ... → 1
│   └── ... (all digits 0-9)
├── digit=1: solve(1, tight=true)
│   ├── digit=0: solve(2, tight=false) → ... → 1
│   ├── digit=1: solve(2, tight=false) → ... → 1
│   ├── digit=2: solve(2, tight=true)
│   │   ├── digit=0: solve(3, tight=false) → 1
│   │   ├── digit=1: solve(3, tight=false) → 1
│   │   ├── digit=2: solve(3, tight=false) → 1
│   │   └── digit=3: solve(3, tight=true) → 1
│   └── ...
```

## Real FAANG Problem: Count Numbers with Even Sum of Digits

Let's solve a practical problem step by step:

> **Problem** : Count numbers in range [L, R] where the sum of digits is even.

```cpp
class EvenDigitSum {
private:
    string num;
    vector<vector<vector<int>>> dp;
  
public:
    int countEvenSum(string n) {
        num = n;
        // dp[pos][tight][sum_parity]
        dp.assign(n.length(), vector<vector<int>>(2, vector<int>(2, -1)));
        return solve(0, true, 0);
    }
  
private:
    int solve(int pos, bool tight, int sumParity) {
        // Base case
        if (pos == num.length()) {
            return (sumParity == 0) ? 1 : 0; // Even sum
        }
      
        // Memoization
        if (!tight && dp[pos][0][sumParity] != -1) {
            return dp[pos][0][sumParity];
        }
      
        int limit = tight ? (num[pos] - '0') : 9;
        int result = 0;
      
        for (int digit = 0; digit <= limit; digit++) {
            bool newTight = tight && (digit == limit);
            int newSumParity = (sumParity + digit) % 2;
            result += solve(pos + 1, newTight, newSumParity);
        }
      
        if (!tight) {
            dp[pos][0][sumParity] = result;
        }
      
        return result;
    }
};
```

### Key Additions Explained:

**1. Sum Parity Tracking:**

```cpp
int newSumParity = (sumParity + digit) % 2;
```

> We track whether the current sum of digits is even (0) or odd (1) using modulo 2.

**2. Enhanced State Space:**

```cpp
vector<vector<vector<int>>> dp;
// dp[position][tight][sum_parity]
```

> Our DP table now includes the sum parity as a dimension.

**3. Base Case Condition:**

```cpp
return (sumParity == 0) ? 1 : 0;
```

> We only count numbers where the final sum parity is even (0).

## Handling Range Queries [L, R]

To count numbers in a range [L, R], we use the principle:

> **Count(L, R) = Count(0, R) - Count(0, L-1)**

```cpp
int countInRange(string L, string R) {
    int countR = countNumbers(R);
    string LMinus1 = subtractOne(L);
    int countL = countNumbers(LMinus1);
    return countR - countL;
}

string subtractOne(string num) {
    // Implementation to subtract 1 from string number
    int i = num.length() - 1;
    while (i >= 0 && num[i] == '0') {
        num[i] = '9';
        i--;
    }
    if (i >= 0) {
        num[i]--;
    }
    // Handle leading zeros
    int start = 0;
    while (start < num.length() && num[start] == '0') {
        start++;
    }
    return start == num.length() ? "0" : num.substr(start);
}
```

## Advanced Pattern: Numbers Divisible by K

Let's tackle a more complex problem:

> **Problem** : Count numbers in [L, R] that are divisible by K and have digit sum divisible by M.

```cpp
class DivisibleNumbers {
private:
    string num;
    int K, M;
    vector<vector<vector<vector<int>>>> dp;
  
public:
    int countDivisible(string n, int k, int m) {
        num = n;
        K = k;
        M = m;
        // dp[pos][tight][num_mod_k][sum_mod_m]
        dp.assign(n.length(), 
                 vector<vector<vector<int>>>(2,
                   vector<vector<int>>(K,
                     vector<int>(M, -1))));
        return solve(0, true, 0, 0);
    }
  
private:
    int solve(int pos, bool tight, int numMod, int sumMod) {
        if (pos == num.length()) {
            return (numMod == 0 && sumMod == 0) ? 1 : 0;
        }
      
        if (!tight && dp[pos][0][numMod][sumMod] != -1) {
            return dp[pos][0][numMod][sumMod];
        }
      
        int limit = tight ? (num[pos] - '0') : 9;
        int result = 0;
      
        for (int digit = 0; digit <= limit; digit++) {
            bool newTight = tight && (digit == limit);
            int newNumMod = (numMod * 10 + digit) % K;
            int newSumMod = (sumMod + digit) % M;
          
            result += solve(pos + 1, newTight, newNumMod, newSumMod);
        }
      
        if (!tight) {
            dp[pos][0][numMod][sumMod] = result;
        }
      
        return result;
    }
};
```

### Advanced Concepts Explained:

**1. Number Modulo Tracking:**

```cpp
int newNumMod = (numMod * 10 + digit) % K;
```

> When we append a digit to a number, the new value becomes `(oldValue * 10 + digit)`. We track this modulo K.

**2. Multi-dimensional State:**

```cpp
dp[pos][tight][numMod][sumMod]
```

> We now track both the number's remainder when divided by K and the digit sum's remainder when divided by M.

## Common FAANG Interview Patterns

### Pattern 1: Leading Zeros Handling

Sometimes we need to handle leading zeros specially:

```cpp
int solve(int pos, bool tight, bool started, /* other states */) {
    if (pos == num.length()) {
        return started ? 1 : 0; // Only count if number has started
    }
  
    // ... memoization logic
  
    for (int digit = 0; digit <= limit; digit++) {
        bool newStarted = started || (digit > 0);
        // Continue only if number has meaningful digits
        result += solve(pos + 1, newTight, newStarted, /* other states */);
    }
}
```

### Pattern 2: Digit Constraints

Counting numbers where no digit appears more than X times:

```cpp
int solve(int pos, bool tight, vector<int>& digitCount) {
    // Check if any digit count exceeds limit
    for (int count : digitCount) {
        if (count > maxAllowed) return 0;
    }
  
    // ... rest of logic
  
    for (int digit = 0; digit <= limit; digit++) {
        digitCount[digit]++;
        result += solve(pos + 1, newTight, digitCount);
        digitCount[digit]--; // backtrack
    }
}
```

## FAANG Interview Tips and Optimization

> **Time Complexity** : O(N × 2 × [additional_states]) where N is the number of digits.
> **Space Complexity** : O(N × 2 × [additional_states]) for memoization.

### Key Interview Points:

1. **Always clarify constraints** : Ask about the range of numbers and specific requirements.
2. **Start with the template** : Explain the standard approach before diving into problem-specific modifications.
3. **Explain the tight flag** : This is often the most confusing part for interviewers.
4. **Handle edge cases** : Leading zeros, empty ranges, single-digit numbers.
5. **Optimize space** : Sometimes you can use rolling arrays to reduce space complexity.

### Common Mistakes to Avoid:

```cpp
// WRONG: Memoizing tight states
if (dp[pos][tight] != -1) return dp[pos][tight];

// CORRECT: Only memoize non-tight states
if (!tight && dp[pos][0] != -1) return dp[pos][0];
```

```cpp
// WRONG: Not handling leading zeros
solve(0, true, 0); // This counts numbers like "007"

// CORRECT: Use started flag
solve(0, true, false, 0); // Track if number has started
```

## Practice Problems for Mastery

1. **Beginner** : Count numbers from 1 to N with all even digits
2. **Intermediate** : Count numbers in [L,R] where digit sum equals K
3. **Advanced** : Count numbers divisible by their digit product
4. **Expert** : Count numbers where each digit is greater than the previous digit

> **Final Insight** : Digit DP transforms an exponential search space into a polynomial one by cleverly using the structure of decimal representation and dynamic programming principles.

The beauty of Digit DP lies in its systematic approach to building numbers while maintaining essential constraints, making seemingly impossible counting problems tractable for even the largest ranges commonly seen in FAANG interviews.
