# Probability Trees and Systematic Calculation Methods: Organizing Complex Uncertainty

## The Fundamental "Why": The Complexity Problem

Imagine you're planning a picnic. The weather might be sunny or rainy. If it's sunny, you might go to the park or the beach. If you go to the park, you might play frisbee or have a barbecue. Each decision depends on what happened before, and each step has its own probabilities.

Now try to calculate: "What's the probability I end up playing frisbee?" 

Your brain probably feels overwhelmed. When probability problems involve multiple steps, dependencies, and branching paths, our intuition breaks down. We need **systematic methods** to navigate this complexity without getting lost.

> **The key insight here is**: Complex probability isn't just about harder math - it's about organizing our thinking. Probability trees and systematic methods are like GPS for navigating through multi-step uncertainty.

## The Mental Chaos of Complex Probability

### Why Our Intuition Fails

Consider this seemingly simple problem:

**Problem**: A bag contains 3 red balls and 2 blue balls. You draw 2 balls without replacement. What's the probability both are red?

**Intuitive attempt**: "3 out of 5 are red, so maybe (3/5) × (3/5) = 9/25?"

**Reality**: This ignores that the second draw depends on the first. The correct systematic approach reveals the answer is actually 6/20 = 3/10.

> **This is like trying to navigate a city by remembering "turn left at the big tree, then right after the red house." It works for simple routes, but for complex journeys, you need a map and systematic navigation.**

### ASCII Visualization: The Complexity Explosion

```
SIMPLE PROBLEM (1 step)
     Start ──→ Outcome
     Easy to track mentally

MEDIUM PROBLEM (2 steps)  
     Start ──→ Choice1 ──→ Final
                   ├──→ Final
                   └──→ Final
     Still manageable

COMPLEX PROBLEM (3+ steps)
     Start ──→ A ──→ A1 ──→ A1a
               │    ├──→ A1b
               │    └──→ A1c
               ├──→ A2 ──→ A2a
               │    ├──→ A2b
               │    └──→ A2c
               └──→ B ──→ B1a
                    ├──→ B1b
                    └──→ B1c
     Mental overload! Need systematic approach
```

> **The fundamental necessity**: Complex probability problems require external cognitive tools. We can't hold all the branches, dependencies, and calculations in our heads simultaneously. Probability trees externalize this complexity, making it manageable.

## Probability Trees: The Visual Solution

### The Core Concept

A **probability tree** is a visual diagram that maps out all possible sequences of events, showing:
- Each possible outcome at each stage
- The probability of each transition
- The complete path probabilities to final outcomes

> **Think of a probability tree like a family tree, but instead of showing ancestry, it shows the "genealogy" of random events - how each outcome gives birth to the next set of possibilities.**

### The Anatomy of a Probability Tree

Every probability tree has these essential components:

1. **Root**: Starting point (initial state)
2. **Branches**: Possible outcomes at each stage
3. **Branch probabilities**: P(outcome | current state)
4. **Nodes**: Points where new possibilities branch out
5. **Leaves**: Final outcomes
6. **Path probabilities**: Product of all branch probabilities along a path

### ASCII Visualization: Basic Tree Structure

```
BASIC PROBABILITY TREE ANATOMY

                   Branch probability
                        ↓
     Root ──────0.6────→ A ──────0.3────→ A∩C
      │                 │
      │                 └──0.7────→ A∩D
      │                      ↑
      └────0.4────→ B         └─ Branch probability
                   │
                   ├──0.8────→ B∩C
                   │
                   └──0.2────→ B∩D
                        
Path probability = Product of branch probabilities
P(A∩C) = 0.6 × 0.3 = 0.18
P(A∩D) = 0.6 × 0.7 = 0.42
P(B∩C) = 0.4 × 0.8 = 0.32
P(B∩D) = 0.4 × 0.2 = 0.08

Check: 0.18 + 0.42 + 0.32 + 0.08 = 1.00 ✓
```

## Building Probability Trees: The Systematic Process

### Step-by-Step Construction Method

**Step 1: Identify the sequence of events**
- What happens first, second, third?
- What are the decision points or random events?

**Step 2: Determine all possible outcomes at each stage**
- List every possibility at each branching point
- Ensure outcomes are mutually exclusive and exhaustive

**Step 3: Calculate branch probabilities**
- Use conditional probability: P(outcome | previous events)
- Ensure probabilities from each node sum to 1

**Step 4: Calculate path probabilities**
- Multiply probabilities along each complete path
- Use the multiplication rule for dependent events

**Step 5: Answer the question**
- Add path probabilities for all paths leading to the desired event

### Example 1: Drawing Without Replacement

**Problem**: Bag with 3 red, 2 blue balls. Draw 2 without replacement. Find P(both red).

**Step 1: Event sequence**
- First draw, then second draw

**Step 2: Possible outcomes**
- First draw: Red or Blue
- Second draw: Red or Blue (but depends on first)

**Step 3: Branch probabilities**
- First draw: P(Red₁) = 3/5, P(Blue₁) = 2/5
- Second draw depends on first:
  - If Red₁: P(Red₂|Red₁) = 2/4, P(Blue₂|Red₁) = 2/4
  - If Blue₁: P(Red₂|Blue₁) = 3/4, P(Blue₂|Blue₁) = 1/4

### ASCII Visualization: Complete Drawing Tree

```
DRAWING WITHOUT REPLACEMENT TREE

                 First Draw        Second Draw
                     │                │
    Start ────3/5───→ Red₁ ────2/4───→ Red₁∩Red₂
      │               │
      │               └────2/4───→ Red₁∩Blue₂
      │
      └────2/5───→ Blue₁ ───3/4───→ Blue₁∩Red₂
                     │
                     └────1/4───→ Blue₁∩Blue₂

PATH PROBABILITIES:
P(Red₁∩Red₂) = (3/5) × (2/4) = 6/20 = 3/10
P(Red₁∩Blue₂) = (3/5) × (2/4) = 6/20 = 3/10  
P(Blue₁∩Red₂) = (2/5) × (3/4) = 6/20 = 3/10
P(Blue₁∩Blue₂) = (2/5) × (1/4) = 2/20 = 1/10

Check: 3/10 + 3/10 + 3/10 + 1/10 = 10/10 = 1 ✓

ANSWER: P(both red) = 3/10 = 0.3
```

> **The beautiful logic**: The tree forces us to consider every possibility systematically. We can't miss cases or double-count because the visual structure keeps us organized.

## Advanced Tree Applications

### Example 2: Medical Testing with Multiple Tests

**Problem**: Disease affects 1% of population. Test A has 90% sensitivity, 95% specificity. Test B has 95% sensitivity, 90% specificity. If someone tests positive on both tests, what's the probability they have the disease?

This is a complex Bayesian problem that becomes manageable with trees.

### ASCII Visualization: Medical Testing Tree

```
MEDICAL TESTING TREE (Simplified - showing key paths)

                Disease Status    Test A      Test B
                     │            │           │
    Start ────0.01──→ Disease ───0.9──→ +A ───0.95──→ Disease∩+A∩+B
      │               │          │
      │               │          └─0.05──→ Disease∩+A∩-B
      │               │
      │               └────0.1──→ -A ───0.95──→ Disease∩-A∩+B
      │                          │
      │                          └─0.05──→ Disease∩-A∩-B
      │
      └────0.99──→ No Disease ──0.05──→ +A ───0.1──→ NoDisease∩+A∩+B
                     │           │
                     │           └─0.9──→ NoDisease∩+A∩-B
                     │
                     └────0.95──→ -A ───0.1──→ NoDisease∩-A∩+B
                                  │
                                  └─0.9──→ NoDisease∩-A∩-B

PATHS WITH BOTH TESTS POSITIVE:
P(Disease∩+A∩+B) = 0.01 × 0.9 × 0.95 = 0.00855
P(NoDisease∩+A∩+B) = 0.99 × 0.05 × 0.1 = 0.00495

P(Disease | +A∩+B) = 0.00855 / (0.00855 + 0.00495) = 63.3%
```

> **The power of systematic approach**: Without the tree, this problem seems impossibly complex. With the tree, we systematically account for every pathway and apply Bayes' theorem naturally.

### Example 3: Sequential Decision Making

**Problem**: Investment strategy with market conditions.

- Market can be Bull (60%) or Bear (40%)
- In Bull market: Stock A has 70% chance of gain, Stock B has 80% chance
- In Bear market: Stock A has 30% chance of gain, Stock B has 20% chance
- You can only choose one stock. Which gives higher probability of gain?

### ASCII Visualization: Investment Decision Tree

```
INVESTMENT DECISION TREE

              Market     Stock Choice    Outcome
                │            │           │
    Start ───0.6──→ Bull ───A──→ A ───0.7──→ Bull∩A∩Gain
      │            │      │      │
      │            │      │      └─0.3──→ Bull∩A∩Loss
      │            │      │
      │            │      └───B──→ B ───0.8──→ Bull∩B∩Gain
      │            │             │
      │            │             └─0.2──→ Bull∩B∩Loss
      │            │
      └─────0.4──→ Bear ──A──→ A ───0.3──→ Bear∩A∩Gain
                   │      │      │
                   │      │      └─0.7──→ Bear∩A∩Loss
                   │      │
                   │      └───B──→ B ───0.2──→ Bear∩B∩Gain
                   │             │
                   │             └─0.8──→ Bear∩B∩Loss

STOCK A GAIN PROBABILITY:
P(A Gain) = P(Bull)×P(Gain|Bull,A) + P(Bear)×P(Gain|Bear,A)
          = 0.6 × 0.7 + 0.4 × 0.3 = 0.42 + 0.12 = 0.54

STOCK B GAIN PROBABILITY:  
P(B Gain) = P(Bull)×P(Gain|Bull,B) + P(Bear)×P(Gain|Bear,B)
          = 0.6 × 0.8 + 0.4 × 0.2 = 0.48 + 0.08 = 0.56

DECISION: Choose Stock B (56% > 54%)
```

## Alternative Systematic Methods

### Method 1: Probability Tables

For problems with clear stages, create systematic tables:

**Example**: Three coin flips, find P(exactly 2 heads)

```
SYSTEMATIC ENUMERATION TABLE
Flip1 | Flip2 | Flip3 | Heads | Probability
------|-------|-------|-------|------------
  H   |   H   |   H   |   3   |   1/8
  H   |   H   |   T   |   2   |   1/8     ←
  H   |   T   |   H   |   2   |   1/8     ←
  H   |   T   |   T   |   1   |   1/8
  T   |   H   |   H   |   2   |   1/8     ←
  T   |   H   |   T   |   1   |   1/8
  T   |   T   |   H   |   1   |   1/8
  T   |   T   |   T   |   0   |   1/8

P(exactly 2 heads) = 3/8
```

### Method 2: Conditional Probability Chains

Break complex problems into conditional steps:

P(A ∩ B ∩ C) = P(A) × P(B|A) × P(C|A∩B)

**Example**: Drawing 3 aces from deck without replacement

P(3 aces) = P(Ace₁) × P(Ace₂|Ace₁) × P(Ace₃|Ace₁∩Ace₂)
          = (4/52) × (3/51) × (2/50)
          = 24/132,600

### Method 3: Complement and Union Rules

For complex events, use:
- **Complement**: P(A) = 1 - P(A^c)
- **Union**: P(A ∪ B) = P(A) + P(B) - P(A ∩ B)

**Example**: At least one head in 3 coin flips

P(at least 1 head) = 1 - P(no heads) = 1 - (1/2)³ = 1 - 1/8 = 7/8

## Common Pitfalls and Solutions

### Pitfall 1: Forgetting Conditional Dependencies

**Wrong approach**: Treating dependent events as independent

```
INCORRECT TREE (Independence assumption)
    Start ──0.5──→ H₁ ──0.5──→ H₁∩H₂  (Wrong!)
      │            │
      │            └─0.5──→ H₁∩T₂
      │
      └──0.5──→ T₁ ──0.5──→ T₁∩H₂
                 │
                 └─0.5──→ T₁∩T₂
```

**Correct approach**: Account for changing conditions

```
CORRECT TREE (With replacement vs without)
              With Replacement    Without Replacement
    Start ──0.5──→ H₁ ──0.5──→ ... | Start ──3/5──→ R₁ ──2/4──→ ...
```

> **Solution**: Always ask "Does this outcome change the conditions for the next step?"

### Pitfall 2: Incomplete Branch Enumeration

**Wrong**: Missing possible outcomes

**Right**: Systematic enumeration ensuring all branches from each node sum to 1

### Pitfall 3: Misunderstanding the Question

**Example**: "Find probability of at least one success"

**Wrong interpretation**: Calculate P(exactly one success)
**Right interpretation**: Calculate 1 - P(no successes) or sum all paths with ≥1 success

## Advanced Tree Techniques

### Technique 1: Pruning

For very large trees, eliminate impossible or irrelevant branches early:

```
PRUNED TREE (Eliminating impossible paths)
    Start ──→ Pass Test 1 ──→ Eligible for Test 2
      │                      │
      │                      ├──→ Pass Test 2 ──→ Success
      │                      │
      │                      └──→ Fail Test 2 ──→ Failure
      │
      └──→ Fail Test 1 ──→ Ineligible (PRUNE - no need to continue)
```

### Technique 2: Backward Induction

Start from desired outcomes and work backward:

```
BACKWARD TREE (Working from goal)
Goal: Win Championship
 ↑
Win Final Game (Need this)
 ↑  
Reach Final (Need this first)
 ↑
Win Semifinals (Need this first)
```

### Technique 3: Symmetry Recognition

Use symmetry to reduce calculation complexity:

```
SYMMETRIC TREE (Coin flips)
Due to symmetry:
P(HHT) = P(HTH) = P(THH) = P(HTT) = P(THT) = P(TTH)
Calculate one, multiply by count
```

```python
import itertools
from collections import defaultdict
from fractions import Fraction
import matplotlib.pyplot as plt
import numpy as np

# 1. PROBABILITY TREE NODE CLASS
class ProbabilityNode:
    """Represents a node in a probability tree"""
    
    def __init__(self, name, probability=1.0, parent=None):
        self.name = name
        self.probability = probability  # Probability of reaching this node from parent
        self.parent = parent
        self.children = []
        self.path_probability = None
    
    def add_child(self, child_name, child_probability):
        """Add a child node with given probability"""
        child = ProbabilityNode(child_name, child_probability, self)
        self.children.append(child)
        return child
    
    def calculate_path_probability(self):
        """Calculate probability of reaching this node from root"""
        if self.parent is None:
            self.path_probability = 1.0
        else:
            if self.parent.path_probability is None:
                self.parent.calculate_path_probability()
            self.path_probability = self.parent.path_probability * self.probability
        return self.path_probability
    
    def get_path(self):
        """Get the complete path from root to this node"""
        if self.parent is None:
            return [self.name]
        return self.parent.get_path() + [self.name]
    
    def is_leaf(self):
        """Check if this is a leaf node (no children)"""
        return len(self.children) == 0


# 2. PROBABILITY TREE CLASS
class ProbabilityTree:
    """Complete probability tree implementation"""
    
    def __init__(self, root_name="Start"):
        self.root = ProbabilityNode(root_name)
    
    def get_all_paths(self):
        """Get all paths from root to leaves with their probabilities"""
        paths = []
        self._collect_paths(self.root, paths)
        return paths
    
    def _collect_paths(self, node, paths):
        """Recursively collect all paths to leaves"""
        if node.is_leaf():
            path_prob = node.calculate_path_probability()
            paths.append((node.get_path(), path_prob))
        else:
            for child in node.children:
                self._collect_paths(child, paths)
    
    def calculate_event_probability(self, event_condition):
        """Calculate probability of event defined by condition function"""
        paths = self.get_all_paths()
        total_prob = 0.0
        
        for path, prob in paths:
            if event_condition(path):
                total_prob += prob
        
        return total_prob
    
    def verify_tree(self):
        """Verify that probabilities from each node sum to 1"""
        return self._verify_node(self.root)
    
    def _verify_node(self, node):
        """Recursively verify node probability constraints"""
        if node.is_leaf():
            return True
        
        # Check that children probabilities sum to 1
        child_prob_sum = sum(child.probability for child in node.children)
        if abs(child_prob_sum - 1.0) > 1e-10:
            print(f"Error at node {node.name}: child probabilities sum to {child_prob_sum}")
            return False
        
        # Recursively check children
        return all(self._verify_node(child) for child in node.children)
    
    def print_tree(self, max_depth=None):
        """Print the tree structure"""
        print(f"Probability Tree Structure:")
        self._print_node(self.root, 0, max_depth)
    
    def _print_node(self, node, depth, max_depth):
        """Recursively print tree structure"""
        if max_depth is not None and depth > max_depth:
            return
        
        indent = "  " * depth
        prob_str = f" (p={node.probability:.3f})" if node.parent else ""
        print(f"{indent}{node.name}{prob_str}")
        
        for child in node.children:
            self._print_node(child, depth + 1, max_depth)
    
    def print_all_outcomes(self):
        """Print all possible outcomes with their probabilities"""
        paths = self.get_all_paths()
        print(f"\nAll Possible Outcomes:")
        print("-" * 50)
        
        total_prob = 0
        for path, prob in paths:
            path_str = " → ".join(path[1:])  # Skip root
            print(f"{path_str}: {prob:.4f}")
            total_prob += prob
        
        print("-" * 50)
        print(f"Total probability: {total_prob:.4f}")
        if abs(total_prob - 1.0) < 1e-10:
            print("✓ Probabilities sum to 1")
        else:
            print("✗ Error: Probabilities don't sum to 1")


# 3. EXAMPLE 1: DRAWING WITHOUT REPLACEMENT
def drawing_without_replacement_example():
    """Classic example: Drawing balls without replacement"""
    
    print("EXAMPLE 1: DRAWING WITHOUT REPLACEMENT")
    print("=" * 50)
    print("Bag with 3 red balls, 2 blue balls")
    print("Draw 2 balls without replacement")
    print("Find probability both balls are red")
    
    # Build the tree
    tree = ProbabilityTree("Start")
    
    # First draw
    red1 = tree.root.add_child("Red₁", 3/5)
    blue1 = tree.root.add_child("Blue₁", 2/5)
    
    # Second draw (conditional on first)
    red1.add_child("Red₁→Red₂", 2/4)  # 2 red left out of 4 total
    red1.add_child("Red₁→Blue₂", 2/4)  # 2 blue left out of 4 total
    
    blue1.add_child("Blue₁→Red₂", 3/4)  # 3 red left out of 4 total  
    blue1.add_child("Blue₁→Blue₂", 1/4)  # 1 blue left out of 4 total
    
    # Print tree structure
    tree.print_tree()
    tree.print_all_outcomes()
    
    # Calculate P(both red)
    def both_red(path):
        return "Red₁" in path and "Red₁→Red₂" in path
    
    prob_both_red = tree.calculate_event_probability(both_red)
    print(f"\nP(both red) = {prob_both_red:.4f} = {Fraction(prob_both_red).limit_denominator()}")
    
    # Verify with direct calculation
    direct_calc = (3/5) * (2/4)
    print(f"Direct calculation: (3/5) × (2/4) = {direct_calc:.4f}")
    print(f"Match: {abs(prob_both_red - direct_calc) < 1e-10}")


# 4. EXAMPLE 2: MEDICAL TESTING
def medical_testing_example():
    """Complex medical testing with two tests"""
    
    print("\n\nEXAMPLE 2: MEDICAL TESTING")
    print("=" * 35)
    print("Disease prevalence: 1%")
    print("Test A: 90% sensitivity, 95% specificity")  
    print("Test B: 95% sensitivity, 90% specificity")
    print("Find P(disease | both tests positive)")
    
    tree = ProbabilityTree("Population")
    
    # Disease status
    disease = tree.root.add_child("Disease", 0.01)
    no_disease = tree.root.add_child("No Disease", 0.99)
    
    # Test A results
    disease_testA_pos = disease.add_child("Disease→TestA+", 0.90)
    disease_testA_neg = disease.add_child("Disease→TestA-", 0.10)
    
    no_disease_testA_pos = no_disease.add_child("NoDisease→TestA+", 0.05)
    no_disease_testA_neg = no_disease.add_child("NoDisease→TestA-", 0.95)
    
    # Test B results (conditional on disease status, assuming independence given disease)
    disease_testA_pos.add_child("Disease→TestA+→TestB+", 0.95)
    disease_testA_pos.add_child("Disease→TestA+→TestB-", 0.05)
    
    disease_testA_neg.add_child("Disease→TestA-→TestB+", 0.95)
    disease_testA_neg.add_child("Disease→TestA-→TestB-", 0.05)
    
    no_disease_testA_pos.add_child("NoDisease→TestA+→TestB+", 0.10)
    no_disease_testA_pos.add_child("NoDisease→TestA+→TestB-", 0.90)
    
    no_disease_testA_neg.add_child("NoDisease→TestA-→TestB+", 0.10)
    no_disease_testA_neg.add_child("NoDisease→TestA-→TestB-", 0.90)
    
    # Calculate P(disease AND both tests positive)
    def disease_and_both_positive(path):
        return ("Disease" in path and 
                "TestA+" in path[-1] and 
                "TestB+" in path[-1])
    
    # Calculate P(both tests positive)
    def both_positive(path):
        return "TestA+" in path[-1] and "TestB+" in path[-1]
    
    prob_disease_and_both_pos = tree.calculate_event_probability(disease_and_both_positive)
    prob_both_pos = tree.calculate_event_probability(both_positive)
    
    # Calculate conditional probability using Bayes
    prob_disease_given_both_pos = prob_disease_and_both_pos / prob_both_pos
    
    print(f"\nResults:")
    print(f"P(Disease ∩ Both+) = {prob_disease_and_both_pos:.6f}")
    print(f"P(Both+) = {prob_both_pos:.6f}")
    print(f"P(Disease | Both+) = {prob_disease_given_both_pos:.4f} = {prob_disease_given_both_pos:.1%}")
    
    print(f"\nInterpretation: Even with two positive tests,")
    print(f"there's only a {prob_disease_given_both_pos:.1%} chance of having the disease!")
    print(f"This demonstrates the power of base rate effects.")


# 5. EXAMPLE 3: GAME STRATEGY
def game_strategy_example():
    """Game theory example with strategic decisions"""
    
    print("\n\nEXAMPLE 3: GAME STRATEGY")
    print("=" * 30)
    print("Two-stage game:")
    print("Stage 1: Choose strategy A (60% chance) or B (40% chance)")
    print("Stage 2: Opponent responds, affecting your payoff")
    print("Find expected payoff for each strategy")
    
    # Strategy A tree
    tree_A = ProbabilityTree("Strategy A")
    
    # Opponent responses to Strategy A
    opp_cooperate_A = tree_A.root.add_child("Opponent Cooperates", 0.7)
    opp_defect_A = tree_A.root.add_child("Opponent Defects", 0.3)
    
    # Payoffs (simplified - using expected values)
    opp_cooperate_A.add_child("High Payoff (+10)", 1.0)
    opp_defect_A.add_child("Low Payoff (-2)", 1.0)
    
    # Strategy B tree  
    tree_B = ProbabilityTree("Strategy B")
    
    # Opponent responses to Strategy B
    opp_cooperate_B = tree_B.root.add_child("Opponent Cooperates", 0.4)
    opp_defect_B = tree_B.root.add_child("Opponent Defects", 0.6)
    
    # Payoffs
    opp_cooperate_B.add_child("Medium Payoff (+6)", 1.0)
    opp_defect_B.add_child("Safe Payoff (+3)", 1.0)
    
    print("\nStrategy A outcomes:")
    tree_A.print_all_outcomes()
    
    print("\nStrategy B outcomes:")
    tree_B.print_all_outcomes()
    
    # Calculate expected payoffs
    def extract_payoff(path):
        last_node = path[-1]
        if "High Payoff (+10)" in last_node:
            return 10
        elif "Low Payoff (-2)" in last_node:
            return -2
        elif "Medium Payoff (+6)" in last_node:
            return 6
        elif "Safe Payoff (+3)" in last_node:
            return 3
        return 0
    
    # Expected payoff for Strategy A
    paths_A = tree_A.get_all_paths()
    expected_A = sum(extract_payoff(path) * prob for path, prob in paths_A)
    
    # Expected payoff for Strategy B
    paths_B = tree_B.get_all_paths()
    expected_B = sum(extract_payoff(path) * prob for path, prob in paths_B)
    
    print(f"\nExpected Payoffs:")
    print(f"Strategy A: {expected_A:.2f}")
    print(f"Strategy B: {expected_B:.2f}")
    
    if expected_A > expected_B:
        print(f"Recommendation: Choose Strategy A")
    else:
        print(f"Recommendation: Choose Strategy B")


# 6. SYSTEMATIC ENUMERATION METHOD
class SystematicEnumerator:
    """Alternative systematic method using enumeration"""
    
    def __init__(self):
        self.outcomes = []
    
    def enumerate_sequences(self, stages, outcome_func, probability_func):
        """Systematically enumerate all possible sequences"""
        
        def generate_sequences(current_sequence, stage):
            if stage >= len(stages):
                # Complete sequence
                outcome = outcome_func(current_sequence)
                prob = probability_func(current_sequence)
                self.outcomes.append((current_sequence.copy(), outcome, prob))
                return
            
            # Try all possibilities at current stage
            for option in stages[stage]:
                current_sequence.append(option)
                generate_sequences(current_sequence, stage + 1)
                current_sequence.pop()
        
        self.outcomes = []
        generate_sequences([], 0)
        return self.outcomes
    
    def calculate_event_probability(self, event_condition):
        """Calculate probability of events satisfying condition"""
        total_prob = 0.0
        for sequence, outcome, prob in self.outcomes:
            if event_condition(sequence, outcome):
                total_prob += prob
        return total_prob
    
    def print_enumeration(self):
        """Print all enumerated outcomes"""
        print("Systematic Enumeration Results:")
        print("-" * 40)
        
        total_prob = 0
        for sequence, outcome, prob in self.outcomes:
            seq_str = "→".join(map(str, sequence))
            print(f"{seq_str}: {outcome}, P = {prob:.4f}")
            total_prob += prob
        
        print("-" * 40)
        print(f"Total probability: {total_prob:.4f}")


# 7. EXAMPLE 4: COIN FLIPS WITH ENUMERATION
def coin_flip_enumeration_example():
    """Demonstrate systematic enumeration with coin flips"""
    
    print("\n\nEXAMPLE 4: SYSTEMATIC ENUMERATION")
    print("=" * 40)
    print("Three coin flips: Find P(exactly 2 heads)")
    
    enumerator = SystematicEnumerator()
    
    # Define stages and outcomes
    stages = [["H", "T"], ["H", "T"], ["H", "T"]]  # Three coin flips
    
    def count_heads(sequence):
        return sequence.count("H")
    
    def sequence_probability(sequence):
        return (0.5) ** len(sequence)  # Each flip is 0.5
    
    # Enumerate all sequences
    outcomes = enumerator.enumerate_sequences(stages, count_heads, sequence_probability)
    enumerator.print_enumeration()
    
    # Calculate P(exactly 2 heads)
    def exactly_two_heads(sequence, outcome):
        return outcome == 2
    
    prob_two_heads = enumerator.calculate_event_probability(exactly_two_heads)
    print(f"\nP(exactly 2 heads) = {prob_two_heads:.4f} = {Fraction(prob_two_heads).limit_denominator()}")


# 8. COMPARISON OF METHODS
def method_comparison():
    """Compare different systematic methods on the same problem"""
    
    print("\n\nMETHOD COMPARISON")
    print("=" * 25)
    print("Problem: Draw 2 cards from deck without replacement")
    print("Find P(both aces)")
    
    # Method 1: Probability Tree
    print("\nMETHOD 1: Probability Tree")
    tree = ProbabilityTree("Deck")
    
    ace1 = tree.root.add_child("Ace₁", 4/52)
    non_ace1 = tree.root.add_child("NonAce₁", 48/52)
    
    ace1.add_child("Ace₁→Ace₂", 3/51)
    ace1.add_child("Ace₁→NonAce₂", 48/51)
    
    non_ace1.add_child("NonAce₁→Ace₂", 4/51)
    non_ace1.add_child("NonAce₁→NonAce₂", 47/51)
    
    def both_aces_tree(path):
        return "Ace₁" in path and "Ace₁→Ace₂" in path
    
    prob_tree = tree.calculate_event_probability(both_aces_tree)
    
    # Method 2: Direct calculation
    print("\nMETHOD 2: Direct Calculation")
    prob_direct = (4/52) * (3/51)
    
    # Method 3: Combinatorial
    print("\nMETHOD 3: Combinatorial")
    from math import comb
    prob_combinatorial = comb(4, 2) / comb(52, 2)
    
    print(f"\nResults:")
    print(f"Tree method:          {prob_tree:.6f}")
    print(f"Direct calculation:   {prob_direct:.6f}")
    print(f"Combinatorial:        {prob_combinatorial:.6f}")
    print(f"All methods match:    {abs(prob_tree - prob_direct) < 1e-10 and abs(prob_direct - prob_combinatorial) < 1e-10}")


# 9. RUN ALL EXAMPLES
def run_all_examples():
    """Execute all probability tree examples"""
    
    print("PROBABILITY TREES AND SYSTEMATIC METHODS")
    print("=" * 55)
    print("Complete demonstration of systematic probability calculation")
    
    drawing_without_replacement_example()
    medical_testing_example()
    game_strategy_example()
    coin_flip_enumeration_example()
    method_comparison()
    
    print("\n" + "=" * 55)
    print("KEY INSIGHTS:")
    print("1. Trees organize complex probability problems systematically")
    print("2. Each branch represents conditional probability")
    print("3. Path probability = product of branch probabilities")
    print("4. Multiple systematic methods can solve same problem")
    print("5. Trees prevent errors and ensure completeness")
    print("6. Visual structure makes complex problems manageable")
    print("\nProbability trees transform complex uncertainty")
    print("into systematic, visual, and reliable calculations!")


# Execute all examples
if __name__ == "__main__":
    run_all_examples()
```


## Quick Reference Examples

Here are some simple examples to reinforce the concepts:

```python
# Quick Reference Examples for Probability Trees

def simple_weather_example():
    """Simple weather prediction tree"""
    
    print("SIMPLE EXAMPLE: Weather Prediction")
    print("=" * 40)
    print("Tomorrow can be Sunny (70%) or Rainy (30%)")
    print("If sunny: 90% chance of picnic")
    print("If rainy: 20% chance of picnic")
    print("Find: P(picnic tomorrow)")
    
    # Manual tree calculation
    p_sunny = 0.7
    p_rainy = 0.3
    p_picnic_given_sunny = 0.9
    p_picnic_given_rainy = 0.2
    
    # Tree paths to picnic
    p_sunny_and_picnic = p_sunny * p_picnic_given_sunny
    p_rainy_and_picnic = p_rainy * p_picnic_given_rainy
    
    # Total probability of picnic
    p_picnic = p_sunny_and_picnic + p_rainy_and_picnic
    
    print(f"\nTree Calculation:")
    print(f"P(Sunny ∩ Picnic) = {p_sunny} × {p_picnic_given_sunny} = {p_sunny_and_picnic}")
    print(f"P(Rainy ∩ Picnic) = {p_rainy} × {p_picnic_given_rainy} = {p_rainy_and_picnic}")
    print(f"P(Picnic) = {p_sunny_and_picnic} + {p_rainy_and_picnic} = {p_picnic}")
    print(f"\nAnswer: {p_picnic:.1%} chance of picnic tomorrow")


def simple_cards_example():
    """Simple card drawing example"""
    
    print("\n\nSIMPLE EXAMPLE: Card Drawing")
    print("=" * 35)
    print("Draw 2 cards from standard deck WITH replacement")
    print("Find: P(both are hearts)")
    
    # With replacement - independent events
    p_heart_first = 13/52  # 13 hearts out of 52 cards
    p_heart_second = 13/52  # Same, since we replace the first card
    
    p_both_hearts = p_heart_first * p_heart_second
    
    print(f"\nTree Calculation (with replacement):")
    print(f"P(Heart₁) = 13/52 = {p_heart_first:.4f}")
    print(f"P(Heart₂|Heart₁) = 13/52 = {p_heart_second:.4f}")
    print(f"P(Both Hearts) = {p_heart_first:.4f} × {p_heart_second:.4f} = {p_both_hearts:.4f}")
    
    # Compare with WITHOUT replacement
    p_heart_second_no_replace = 12/51  # 12 hearts left out of 51 cards
    p_both_hearts_no_replace = p_heart_first * p_heart_second_no_replace
    
    print(f"\nComparison WITHOUT replacement:")
    print(f"P(Heart₂|Heart₁) = 12/51 = {p_heart_second_no_replace:.4f}")
    print(f"P(Both Hearts) = {p_heart_first:.4f} × {p_heart_second_no_replace:.4f} = {p_both_hearts_no_replace:.4f}")
    print(f"\nReplacement makes probability {'higher' if p_both_hearts > p_both_hearts_no_replace else 'lower'}")


def simple_test_example():
    """Simple test accuracy example"""
    
    print("\n\nSIMPLE EXAMPLE: Test Accuracy")
    print("=" * 30)
    print("Disease affects 5% of population")
    print("Test is 95% accurate (both sensitivity and specificity)")
    print("Find: P(disease | positive test)")
    
    # Given information
    p_disease = 0.05
    p_no_disease = 0.95
    p_pos_given_disease = 0.95  # Sensitivity
    p_neg_given_no_disease = 0.95  # Specificity
    p_pos_given_no_disease = 0.05  # False positive rate
    
    # Calculate using tree logic
    p_disease_and_pos = p_disease * p_pos_given_disease
    p_no_disease_and_pos = p_no_disease * p_pos_given_no_disease
    p_positive = p_disease_and_pos + p_no_disease_and_pos
    
    # Bayes' theorem
    p_disease_given_pos = p_disease_and_pos / p_positive
    
    print(f"\nTree Calculation:")
    print(f"P(Disease ∩ Positive) = {p_disease} × {p_pos_given_disease} = {p_disease_and_pos:.4f}")
    print(f"P(No Disease ∩ Positive) = {p_no_disease} × {p_pos_given_no_disease} = {p_no_disease_and_pos:.4f}")
    print(f"P(Positive) = {p_disease_and_pos:.4f} + {p_no_disease_and_pos:.4f} = {p_positive:.4f}")
    print(f"\nP(Disease | Positive) = {p_disease_and_pos:.4f} / {p_positive:.4f} = {p_disease_given_pos:.4f}")
    print(f"\nAnswer: {p_disease_given_pos:.1%} chance of disease given positive test")
    print(f"Counter-intuitive: Despite 95% test accuracy, most positives are false!")


def tree_vs_formula_comparison():
    """Compare tree method with direct formula application"""
    
    print("\n\nTREE vs FORMULA COMPARISON")
    print("=" * 35)
    print("Problem: Three independent coin flips")
    print("Find: P(at least 2 heads)")
    
    # Method 1: Tree enumeration
    print("\nMETHOD 1: Tree Enumeration")
    outcomes = []
    
    for flip1 in ['H', 'T']:
        for flip2 in ['H', 'T']:
            for flip3 in ['H', 'T']:
                sequence = flip1 + flip2 + flip3
                heads = sequence.count('H')
                probability = (0.5) ** 3  # Each sequence equally likely
                outcomes.append((sequence, heads, probability))
    
    # Count sequences with at least 2 heads
    at_least_2_heads = [seq for seq, heads, prob in outcomes if heads >= 2]
    p_at_least_2 = len(at_least_2_heads) * (0.5 ** 3)
    
    print("All sequences:")
    for seq, heads, prob in outcomes:
        marker = " ✓" if heads >= 2 else ""
        print(f"  {seq}: {heads} heads, P = {prob:.3f}{marker}")
    
    print(f"\nSequences with ≥2 heads: {len(at_least_2_heads)}")
    print(f"P(≥2 heads) = {len(at_least_2_heads)}/8 = {p_at_least_2:.3f}")
    
    # Method 2: Complement rule
    print("\nMETHOD 2: Complement Rule")
    p_0_heads = (0.5) ** 3  # TTT
    p_1_head = 3 * (0.5) ** 3  # HTT, THT, TTH
    p_less_than_2 = p_0_heads + p_1_head
    p_at_least_2_complement = 1 - p_less_than_2
    
    print(f"P(0 heads) = {p_0_heads:.3f}")
    print(f"P(1 head) = {p_1_head:.3f}")
    print(f"P(<2 heads) = {p_less_than_2:.3f}")
    print(f"P(≥2 heads) = 1 - {p_less_than_2:.3f} = {p_at_least_2_complement:.3f}")
    
    # Method 3: Binomial formula
    print("\nMETHOD 3: Binomial Formula")
    from math import comb
    n, p = 3, 0.5
    p_exactly_2 = comb(3, 2) * (p ** 2) * ((1-p) ** 1)
    p_exactly_3 = comb(3, 3) * (p ** 3) * ((1-p) ** 0)
    p_at_least_2_binomial = p_exactly_2 + p_exactly_3
    
    print(f"P(exactly 2) = C(3,2) × 0.5² × 0.5¹ = {p_exactly_2:.3f}")
    print(f"P(exactly 3) = C(3,3) × 0.5³ × 0.5⁰ = {p_exactly_3:.3f}")
    print(f"P(≥2 heads) = {p_exactly_2:.3f} + {p_exactly_3:.3f} = {p_at_least_2_binomial:.3f}")
    
    print(f"\nAll methods agree: {p_at_least_2:.3f}")


def when_to_use_trees():
    """Guidelines for when to use probability trees"""
    
    print("\n\nWHEN TO USE PROBABILITY TREES")
    print("=" * 35)
    
    print("✅ USE TREES WHEN:")
    print("  • Sequential events with dependencies")
    print("  • Complex conditional probabilities")
    print("  • Multiple decision points")
    print("  • Need to see all possible outcomes")
    print("  • Problem has clear stages/steps")
    print("  • Want to avoid calculation errors")
    
    print("\n❌ CONSIDER ALTERNATIVES WHEN:")
    print("  • Simple independent events")
    print("  • Large number of stages (tree becomes huge)")
    print("  • Standard probability distributions apply")
    print("  • Symmetry allows shortcuts")
    print("  • Direct formulas are available")
    
    print("\n🔧 TREE ALTERNATIVES:")
    print("  • Multiplication rule: P(A∩B∩C) = P(A)×P(B|A)×P(C|A∩B)")
    print("  • Complement rule: P(A) = 1 - P(A')")
    print("  • Addition rule: P(A∪B) = P(A) + P(B) - P(A∩B)")
    print("  • Binomial formula: P(X=k) = C(n,k)×p^k×(1-p)^(n-k)")
    print("  • Bayes' theorem: P(H|E) = P(E|H)×P(H)/P(E)")


def run_quick_examples():
    """Run all quick reference examples"""
    
    print("PROBABILITY TREES: QUICK REFERENCE EXAMPLES")
    print("=" * 50)
    
    simple_weather_example()
    simple_cards_example()
    simple_test_example()
    tree_vs_formula_comparison()
    when_to_use_trees()
    
    print("\n" + "=" * 50)
    print("QUICK TAKEAWAYS:")
    print("• Trees organize complex multi-step problems")
    print("• Each branch = conditional probability")
    print("• Path probability = multiply along branches")
    print("• Event probability = sum relevant paths")
    print("• Visual structure prevents errors")
    print("• Multiple methods can solve same problem")


if __name__ == "__main__":
    run_quick_examples()
```

## The Broader Significance: Systematic Thinking in Uncertainty

### Why Systematic Methods Matter Beyond Mathematics

Probability trees and systematic calculation methods represent something profound: **the externalization of complex reasoning**. They're not just computational tools - they're cognitive aids that extend our ability to think clearly about uncertainty.

> **The meta-insight**: Probability trees teach us that complex problems become manageable when we break them into systematic, visual structures. This principle applies far beyond probability - it's a general strategy for navigating complexity in any domain.

### The Decision-Making Revolution

These systematic methods have revolutionized decision-making in countless fields:

**Medicine**: Clinical decision trees guide diagnosis and treatment
**Finance**: Decision trees model investment strategies and risk assessment  
**Engineering**: Fault trees analyze system reliability and failure modes
**Business**: Decision trees optimize strategic choices under uncertainty
**AI**: Tree-based algorithms power machine learning and expert systems

### ASCII Visualization: The Systematic Thinking Framework

```
THE SYSTEMATIC APPROACH TO COMPLEX PROBLEMS

UNSTRUCTURED PROBLEM                SYSTEMATIC STRUCTURE
┌─────────────────────┐            ┌──────────────────────┐
│ ??? ← ??? ← ???     │            │ Step3 ← Step2 ← Step1│
│   ↙     ↖   ↑       │     →      │   ↙     ↖   ↑        │
│ ???  →  ??? ← ???   │            │SubA → SubB ← SubC    │
│ ↑  ↗    ↓    ↙      │            │ ↑  ↗    ↓    ↙       │
│???  ← ??? → ???     │            │OutX ← OutY → OutZ    │
└─────────────────────┘            └──────────────────────┘
Mental overload                    Clear pathways
Prone to errors                    Error prevention
Hard to verify                     Easy to check
Difficult to communicate           Simple to explain

THE UNIVERSAL PATTERN:
1. Break complex problems into stages
2. Identify all possibilities at each stage  
3. Map connections systematically
4. Calculate step by step
5. Verify completeness and consistency
```

### The Connection to Other Mathematical Areas

Probability trees connect to many other mathematical concepts:

**Graph Theory**: Trees are special types of graphs with no cycles
**Combinatorics**: Counting paths relates to permutations and combinations
**Calculus**: Continuous probability involves integration over tree-like structures
**Linear Algebra**: Markov chains use matrix methods for tree-like state transitions
**Logic**: Boolean logic trees mirror probability tree structures

### The Philosophical Implications

Systematic probability methods embody important philosophical principles:

**Reductionism**: Complex problems can be broken into simpler parts
**Empiricism**: Systematic enumeration reveals patterns we might miss intuitively
**Rationalism**: Logical structure guides us to correct conclusions
**Pragmatism**: The best method is whatever systematically produces reliable results

> **The deeper insight**: Probability trees aren't just about calculating numbers - they're about developing systematic, reliable ways to reason about uncertainty. They train us to think step-by-step, consider all possibilities, and verify our reasoning.

## The Meta-Skills You've Developed

By mastering probability trees and systematic methods, you've developed transferable skills:

1. **Structural thinking**: Breaking complex problems into manageable pieces
2. **Completeness checking**: Ensuring no possibilities are overlooked
3. **Dependency tracking**: Understanding how events influence each other
4. **Error prevention**: Using systematic approaches to avoid mistakes
5. **Visual reasoning**: Using diagrams to extend cognitive capacity
6. **Verification habits**: Checking that results make sense

> **The ultimate insight**: These aren't just probability skills - they're general-purpose thinking tools for navigating complexity and uncertainty in any domain.

## Looking Forward: Advanced Applications

The systematic thinking you've learned here leads naturally to:

**Markov Chains**: Trees that extend infinitely with state-dependent transitions
**Decision Trees**: Optimizing choices under uncertainty
**Game Theory**: Analyzing strategic interactions with multiple players
**Bayesian Networks**: Complex networks of dependent variables
**Monte Carlo Methods**: Using computation to handle intractable tree calculations
**Machine Learning**: Algorithms that automatically build optimal decision trees

> **Final insight**: Probability trees are a gateway to systematic thinking about uncertainty. Master them, and you have the foundation for tackling complex problems in statistics, machine learning, decision science, and beyond. They're not just mathematical tools - they're thinking tools that will serve you in any field where uncertainty and complexity intersect.

**The practical takeaway**: Every time you face a complex decision with multiple steps and uncertain outcomes, remember the probability tree approach: break it down systematically, map all possibilities, track dependencies, and calculate step by step. This methodical approach will consistently lead to clearer thinking and better decisions.