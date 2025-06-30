# Combinatorics: The Mathematics of Systematic Counting

## The Fundamental "Why": When Counting Becomes Complex

Imagine you're planning a dinner party for 6 friends. You have 6 seats around a table. In how many different ways can you arrange your friends?

Your first instinct might be to start listing: "Alice next to Bob, then Carol..." But you quickly realize this would take forever. There are actually 720 different arrangements! 

Or consider this: Your phone has a 4-digit passcode. How many possible passcodes exist? If you tried to list them all (0000, 0001, 0002...), you'd be writing for days.

> **The key insight here is**: When the number of possibilities grows large, intuitive counting fails. We need systematic mathematical methods to count efficiently and accurately. This is the heart of combinatorics.

## The Intuitive Problem: Overwhelmed by Possibilities

### Why Our Intuition Breaks Down

Consider these increasingly complex counting problems:

**Easy**: How many ways to arrange 2 books? 
- Book A first, then B: AB
- Book B first, then A: BA
- Answer: 2 ways

**Medium**: How many ways to arrange 3 books?
- ABC, ACB, BAC, BCA, CAB, CBA
- Answer: 6 ways (still manageable to list)

**Hard**: How many ways to arrange 10 books?
- Answer: 3,628,800 ways (impossible to list!)

> **This is like asking "How many different routes exist through a complex city?" For simple cases, you can visualize all possibilities. But as complexity grows, you need systematic navigation principles rather than mental enumeration.**

### ASCII Visualization: The Explosion of Possibilities

```
COUNTING COMPLEXITY EXPLOSION

2 items: A,B
┌─────────────┐
│ AB    BA    │  ← 2 arrangements
└─────────────┘

3 items: A,B,C  
┌─────────────────────────────────┐
│ ABC  ACB  BAC  BCA  CAB  CBA    │  ← 6 arrangements
└─────────────────────────────────┘

4 items: A,B,C,D
┌───────────────────────────────────────────────┐
│ ABCD ABDC ACBD ACDB ADBC ADCB                 │
│ BACD BADC BCAD BCDA BDAC BDCA                 │  ← 24 arrangements
│ CABD CADB CBAD CBDA CDAB CDBA                 │
│ DABC DACB DBAC DBCA DCAB DCBA                 │
└───────────────────────────────────────────────┘

10 items: 3,628,800 arrangements 
(Would fill thousands of pages!)

THE PATTERN: n items → n! arrangements
We need formulas, not enumeration!
```

> **The fundamental necessity**: Complex counting requires mathematical principles, not brute force enumeration. Combinatorics provides these systematic tools.

## The Foundation: Basic Counting Principles

### The Multiplication Principle (Fundamental Counting Rule)

**If you can do one thing in m ways and another thing in n ways, you can do both things in m × n ways.**

This simple principle is the foundation of all combinatorics.

**Example**: Choosing an outfit
- 5 shirts, 3 pants
- Total outfits = 5 × 3 = 15

**Example**: License plates  
- First position: 26 letters
- Second position: 26 letters  
- Third position: 10 digits
- Total combinations = 26 × 26 × 10 = 6,760

### ASCII Visualization: Multiplication Principle

```
MULTIPLICATION PRINCIPLE IN ACTION

OUTFIT CHOICE
Shirts: S1, S2, S3, S4, S5
Pants:  P1, P2, P3

DECISION TREE:
         S1 ─┬─ P1 → (S1,P1)
              ├─ P2 → (S1,P2)  
              └─ P3 → (S1,P3)
         S2 ─┬─ P1 → (S2,P1)
              ├─ P2 → (S2,P2)
              └─ P3 → (S2,P3)
         S3 ─┬─ P1 → (S3,P1)
              ├─ P2 → (S3,P2)
              └─ P3 → (S3,P3)
         S4 ─┬─ P1 → (S4,P1)
              ├─ P2 → (S4,P2)
              └─ P3 → (S4,P3)
         S5 ─┬─ P1 → (S5,P1)
              ├─ P2 → (S5,P2)
              └─ P3 → (S5,P3)

Total: 5 × 3 = 15 outfits
```

## Permutations: When Order Matters

### The Intuitive Definition

A **permutation** is an arrangement of objects where **order matters**. Different orders count as different permutations.

**Key questions for permutations**:
- "In how many ways can we arrange these items?"
- "How many different orderings are possible?"
- "What if we line them up - how many different lines?"

> **Think of permutations like arranging people in a line for a photo. Alice-Bob-Carol is different from Bob-Alice-Carol because their positions matter.**

### Building the Permutation Formula

**Problem**: How many ways to arrange n distinct objects?

**Step-by-step reasoning**:
- First position: n choices
- Second position: (n-1) choices (one already used)
- Third position: (n-2) choices (two already used)
- ...
- Last position: 1 choice (only one left)

**Total arrangements = n × (n-1) × (n-2) × ... × 1 = n!**

### ASCII Visualization: Building Permutations

```
PERMUTATION CONSTRUCTION (3 people: A, B, C)

POSITION:     1st     2nd     3rd     RESULT
              │       │       │
Choice 1:     A   →   B   →   C   →   ABC
                      │       │
                      C   →   B   →   ACB
              │       │       │
Choice 2:     B   →   A   →   C   →   BAC
                      │       │
                      C   →   A   →   BCA
              │       │       │
Choice 3:     C   →   A   →   B   →   CAB
                      │       │
                      B   →   A   →   CBA

COUNTING:
1st position: 3 choices (A, B, or C)
2nd position: 2 choices (remaining 2)
3rd position: 1 choice (last remaining)

Total: 3 × 2 × 1 = 6 permutations
```

### Partial Permutations (Permutations of r objects from n)

**Problem**: Choose and arrange r objects from n total objects.

**Formula**: P(n,r) = n!/(n-r)!

**Example**: Choose 3 people from 5 to form a line
- First position: 5 choices
- Second position: 4 choices
- Third position: 3 choices
- Total: 5 × 4 × 3 = 60

**Using formula**: P(5,3) = 5!/(5-3)! = 5!/2! = 120/2 = 60 ✓

### Real-World Permutation Examples

**Example 1**: Race finishing order
- 8 runners in a race
- How many possible finishing orders?
- Answer: 8! = 40,320

**Example 2**: Seating arrangement
- 6 people around a circular table
- How many arrangements? (6-1)! = 5! = 120
- (One person fixed to break rotational symmetry)

**Example 3**: Password creation
- 4-character password using letters A-Z (no repeats)
- Answer: P(26,4) = 26 × 25 × 24 × 23 = 358,800

## Combinations: When Order Doesn't Matter

### The Intuitive Definition

A **combination** is a selection of objects where **order doesn't matter**. Different orders of the same items count as the same combination.

**Key questions for combinations**:
- "In how many ways can we choose these items?"
- "How many different groups can we form?"
- "What if we just want to select, not arrange?"

> **Think of combinations like choosing team members. Whether you pick Alice first or Bob first doesn't matter - the team {Alice, Bob, Carol} is the same regardless of the order you selected them.**

### The Relationship Between Permutations and Combinations

**Key insight**: Each combination can be arranged in multiple ways (permutations).

**Example**: Choosing 3 people from {A,B,C,D,E} for a committee
- One combination: {A,B,C}
- This combination can be arranged in 3! = 6 ways: ABC, ACB, BAC, BCA, CAB, CBA
- But for a committee, all these arrangements represent the same group!

**Therefore**: Combinations = Permutations ÷ (Ways to arrange the chosen items)

### ASCII Visualization: Permutations vs Combinations

```
PERMUTATIONS vs COMBINATIONS

CHOOSING 2 PEOPLE FROM {A, B, C}

PERMUTATIONS (Order matters):
Position:  1st  2nd
           A    B   → AB
           A    C   → AC  
           B    A   → BA
           B    C   → BC
           C    A   → CA
           C    B   → CB
Total: 6 permutations

COMBINATIONS (Order doesn't matter):
Groups chosen:
           {A, B}  ← AB and BA are the same group
           {A, C}  ← AC and CA are the same group  
           {B, C}  ← BC and CB are the same group
Total: 3 combinations

RELATIONSHIP:
Permutations = Combinations × Arrangements of chosen items
6 = 3 × 2!
```

### The Combination Formula

**Formula**: C(n,r) = n! / (r!(n-r)!)

**Alternative notation**: "n choose r" = (n r)

**Derivation**:
1. Total permutations of r from n: P(n,r) = n!/(n-r)!
2. Each combination counted r! times (arrangements of r items)
3. True combinations: P(n,r)/r! = n!/(r!(n-r)!)

### Combination Examples with Step-by-Step Calculation

**Example 1**: Choosing 3 students from 8 for a committee

C(8,3) = 8!/(3!(8-3)!) = 8!/(3!×5!) = (8×7×6)/(3×2×1) = 336/6 = 56

**Example 2**: Selecting 2 toppings from 10 for pizza

C(10,2) = 10!/(2!(10-2)!) = 10!/(2!×8!) = (10×9)/(2×1) = 90/2 = 45

**Example 3**: Forming a 5-person team from 12 people

C(12,5) = 12!/(5!×7!) = (12×11×10×9×8)/(5×4×3×2×1) = 95,040/120 = 792

## Key Differences: Permutations vs Combinations

### The Decision Framework

**Ask yourself**: "Does the order of selection/arrangement matter?"

**If YES → Use Permutations**:
- Arranging people in a line
- Assigning specific roles/positions
- Creating passwords where order matters
- Race finishing positions

**If NO → Use Combinations**:
- Selecting team members
- Choosing items from a menu
- Forming committees
- Selecting lottery numbers

### ASCII Visualization: Decision Framework

```
PERMUTATION vs COMBINATION DECISION TREE

START: Need to count arrangements/selections
           │
           ▼
    Does ORDER matter?
           │
     ┌─────┴─────┐
     │           │
    YES         NO
     │           │
     ▼           ▼
PERMUTATIONS  COMBINATIONS
P(n,r) = n!   C(n,r) = n!
        ───           ─────
       (n-r)!        r!(n-r)!

EXAMPLES:
Permutations:         Combinations:
• Race positions      • Team selection
• Seating order      • Pizza toppings  
• Password digits    • Committee members
• Course schedule    • Card hands
```

### Common Real-World Scenarios

**Permutation Scenarios**:
```
SITUATION: Assigning roles in a play
QUESTION: "How many ways to assign 3 roles to 8 actors?"
ANALYSIS: Different roles = order matters
ANSWER: P(8,3) = 8×7×6 = 336

SITUATION: Creating a 4-digit PIN
QUESTION: "How many PINs possible with digits 0-9?"
ANALYSIS: Position matters (1234 ≠ 4321)
ANSWER: P(10,4) = 10×9×8×7 = 5,040 (no repeats)
       OR: 10⁴ = 10,000 (with repeats)
```

**Combination Scenarios**:
```
SITUATION: Selecting ice cream flavors  
QUESTION: "Choose 3 flavors from 15 available"
ANALYSIS: Order of selection doesn't matter
ANSWER: C(15,3) = 15×14×13/(3×2×1) = 455

SITUATION: Choosing starting lineup
QUESTION: "Select 5 players from 12 for basketball"
ANALYSIS: All 5 play equally (no specific positions)
ANSWER: C(12,5) = 792
```

## Advanced Counting Principles

### The Addition Principle

**If events are mutually exclusive, add their counts.**

**Example**: Choosing a dessert
- 3 types of cake OR 4 types of ice cream
- Total choices = 3 + 4 = 7

### The Inclusion-Exclusion Principle

**For overlapping events**: |A ∪ B| = |A| + |B| - |A ∩ B|

**Example**: Students taking math or science
- 20 take math, 15 take science, 8 take both
- Taking at least one: 20 + 15 - 8 = 27

### Permutations with Repetition

**When some objects are identical**: n!/(n₁! × n₂! × ... × nₖ!)

**Example**: Arranging letters in MISSISSIPPI
- 11 letters total: M(1), I(4), S(4), P(2)
- Arrangements = 11!/(1!×4!×4!×2!) = 34,650

### ASCII Visualization: Advanced Principles

```
INCLUSION-EXCLUSION PRINCIPLE

STUDENTS IN COURSES
┌─────────────────────────────────────┐
│              Math (20)              │
│  ┌─────────────────────┐            │
│  │        12           │     8      │
│  │                     │            │
│  │        Both         │     5      │
│  │         (8)         │            │
│  │                     │            │
│  └─────────────────────┘            │
│           Science (15)              │
└─────────────────────────────────────┘

COUNTING:
Math only: 20 - 8 = 12
Science only: 15 - 8 = 7  
Both: 8
Total taking at least one: 12 + 7 + 8 = 27
OR: 20 + 15 - 8 = 27 (inclusion-exclusion)
```

## Real-World Applications and Problem-Solving

### Application 1: Probability and Gambling

**Problem**: Poker hand probabilities

**5-card hand from 52-card deck**:
- Total possible hands: C(52,5) = 2,598,960
- Royal flush hands: 4 (one per suit)
- Probability of royal flush: 4/2,598,960 ≈ 0.000154%

### Application 2: Computer Science

**Problem**: Algorithm complexity

**Sorting algorithms**:
- Bubble sort compares C(n,2) = n(n-1)/2 pairs
- For 1000 items: C(1000,2) = 499,500 comparisons

**Binary search**:
- Eliminates half the possibilities each step
- Search 1,000,000 items in ⌈log₂(1,000,000)⌉ = 20 steps

### Application 3: Business and Marketing

**Problem**: A/B testing combinations

**Website design testing**:
- 5 different headers, 4 button colors, 3 layouts
- Total combinations to test: 5 × 4 × 3 = 60
- If testing all pairs of combinations: C(60,2) = 1,770 comparisons

### Application 4: Genetics and Biology

**Problem**: DNA sequence combinations

**Genetic code**:
- 4 DNA bases (A,T,G,C)
- 3-base codons: 4³ = 64 possible codons
- 20 amino acids + stop signals (redundancy in genetic code)

## Common Pitfalls and How to Avoid Them

### Pitfall 1: Confusing Permutations and Combinations

**Wrong approach**: Using permutations when order doesn't matter

**Example**: "How many ways to choose 3 books from 10?"
- Wrong: P(10,3) = 720 (assumes order matters)
- Right: C(10,3) = 120 (order doesn't matter for selection)

### Pitfall 2: Forgetting About Restrictions

**Wrong approach**: Ignoring constraints in the problem

**Example**: "Arrange 5 people in a line, but Alice and Bob must be together"
- Wrong: 5! = 120 (ignores constraint)
- Right: Treat Alice-Bob as one unit → 4! × 2! = 48

### Pitfall 3: Double Counting

**Wrong approach**: Counting the same thing multiple ways

**Example**: "Choose 2 people from {A,B,C,D} for a project"
- Wrong thinking: AB, BA, AC, CA, AD, DA, BC, CB, BD, DB, CD, DC = 12
- Right: {A,B}, {A,C}, {A,D}, {B,C}, {B,D}, {C,D} = 6

### ASCII Visualization: Common Mistakes

```
COMMON COMBINATORICS MISTAKES

MISTAKE 1: Wrong formula choice
Problem: "Select 3-person committee from 8 people"
❌ P(8,3) = 336    (order matters - WRONG for committees)
✅ C(8,3) = 56     (order doesn't matter - CORRECT)

MISTAKE 2: Ignoring restrictions  
Problem: "Arrange ABCDE with A and B together"
❌ 5! = 120        (ignores restriction)
✅ 4! × 2! = 48    (treat AB as one unit, arrange internally)

MISTAKE 3: Double counting
Problem: "Choose 2 from {1,2,3}"
❌ 12, 21, 13, 31, 23, 32 = 6    (counts each pair twice)
✅ {1,2}, {1,3}, {2,3} = 3       (each pair counted once)
```

## Advanced Topics and Extensions

### Circular Permutations

**Objects arranged in a circle**: (n-1)! arrangements
- Fix one object to break rotational symmetry
- n people around a table: (n-1)! arrangements

### Derangements

**Permutations where no object is in its original position**
- Formula: D(n) = n! × Σ(-1)ᵏ/k! for k=0 to n
- Example: 4 people, all in wrong seats: D(4) = 9

### Stirling Numbers

**Stirling numbers of the second kind**: S(n,k)
- Ways to partition n objects into k non-empty subsets
- Applications in computer science and combinatorial optimization

### Catalan Numbers

**Count various combinatorial structures**:
- Binary trees with n internal nodes: Cₙ = (2n)!/(n!(n+1)!)
- Ways to parenthesize n+1 factors
- Paths that don't cross diagonal in grid

```python
import math
import itertools
from collections import defaultdict
from fractions import Fraction

# 1. BASIC COMBINATORICS CALCULATOR
class CombinatoricsCalculator:
    """Calculator for permutations, combinations, and counting problems"""
    
    @staticmethod
    def factorial(n):
        """Calculate n! with input validation"""
        if n < 0:
            raise ValueError("Factorial undefined for negative numbers")
        if n == 0 or n == 1:
            return 1
        return math.factorial(n)
    
    @staticmethod
    def permutation(n, r):
        """Calculate P(n,r) = n!/(n-r)! - permutations of r items from n"""
        if r > n or r < 0:
            return 0
        if r == 0:
            return 1
        return math.factorial(n) // math.factorial(n - r)
    
    @staticmethod
    def combination(n, r):
        """Calculate C(n,r) = n!/(r!(n-r)!) - combinations of r items from n"""
        if r > n or r < 0:
            return 0
        if r == 0 or r == n:
            return 1
        # Use symmetry: C(n,r) = C(n,n-r) for efficiency
        r = min(r, n - r)
        
        # Calculate using multiplication to avoid large factorials
        result = 1
        for i in range(r):
            result = result * (n - i) // (i + 1)
        return result
    
    @staticmethod
    def circular_permutation(n):
        """Calculate circular permutations: (n-1)!"""
        if n <= 0:
            return 0
        if n == 1:
            return 1
        return math.factorial(n - 1)
    
    @staticmethod
    def permutation_with_repetition(total, *groups):
        """Calculate permutations with repeated elements: n!/(n1!*n2!*...)"""
        if sum(groups) != total:
            raise ValueError("Group sizes must sum to total")
        
        result = math.factorial(total)
        for group_size in groups:
            result //= math.factorial(group_size)
        return result


# 2. STEP-BY-STEP PROBLEM SOLVER
class CombinatoricsProblemSolver:
    """Solve combinatorics problems with detailed explanations"""
    
    def __init__(self):
        self.calc = CombinatoricsCalculator()
    
    def analyze_problem(self, description, n, r=None, problem_type="auto"):
        """Analyze and solve a combinatorics problem with explanation"""
        print(f"\nPROBLEM ANALYSIS: {description}")
        print("=" * 60)
        
        # Auto-detect problem type if not specified
        if problem_type == "auto":
            if "arrange" in description.lower() or "order" in description.lower():
                problem_type = "permutation"
            elif "choose" in description.lower() or "select" in description.lower():
                problem_type = "combination"
            else:
                problem_type = "unknown"
        
        print(f"Problem type: {problem_type.title()}")
        print(f"Given: n = {n}" + (f", r = {r}" if r is not None else ""))
        
        if problem_type == "permutation":
            self._solve_permutation(n, r)
        elif problem_type == "combination":
            self._solve_combination(n, r)
        elif problem_type == "circular":
            self._solve_circular(n)
        else:
            print("Unable to auto-detect problem type. Please specify.")
    
    def _solve_permutation(self, n, r):
        """Solve permutation problem with explanation"""
        if r is None:
            r = n
            result = self.calc.factorial(n)
            print(f"\nSOLUTION: Arranging all {n} items")
            print(f"Formula: P({n},{n}) = {n}!")
            print(f"Calculation: {n}! = {result}")
        else:
            result = self.calc.permutation(n, r)
            print(f"\nSOLUTION: Arranging {r} items from {n} total")
            print(f"Formula: P({n},{r}) = {n}!/({n}-{r})!")
            print(f"Calculation: {n}!/({n-r})! = {n}!/{n-r}! = {result}")
        
        print(f"\nReasoning:")
        if r is None or r == n:
            print(f"• First position: {n} choices")
            for i in range(1, n):
                print(f"• Position {i+1}: {n-i} choices")
            print(f"• Total: {' × '.join(str(n-i) for i in range(n))} = {result}")
        else:
            print(f"• First position: {n} choices")
            for i in range(1, r):
                print(f"• Position {i+1}: {n-i} choices")
            print(f"• Total: {' × '.join(str(n-i) for i in range(r))} = {result}")
    
    def _solve_combination(self, n, r):
        """Solve combination problem with explanation"""
        result = self.calc.combination(n, r)
        perm_result = self.calc.permutation(n, r)
        r_factorial = self.calc.factorial(r)
        
        print(f"\nSOLUTION: Choosing {r} items from {n} total")
        print(f"Formula: C({n},{r}) = {n}!/({r}!({n}-{r})!)")
        print(f"Calculation: {n}!/({r}!×{n-r}!) = {result}")
        
        print(f"\nReasoning:")
        print(f"• If order mattered: P({n},{r}) = {perm_result} arrangements")
        print(f"• Each selection can be arranged in {r}! = {r_factorial} ways")
        print(f"• Since order doesn't matter: {perm_result}/{r_factorial} = {result}")
    
    def _solve_circular(self, n):
        """Solve circular permutation problem"""
        result = self.calc.circular_permutation(n)
        print(f"\nSOLUTION: Arranging {n} items in a circle")
        print(f"Formula: ({n}-1)!")
        print(f"Calculation: ({n}-1)! = {n-1}! = {result}")
        print(f"\nReasoning:")
        print(f"• Fix one item to break rotational symmetry")
        print(f"• Arrange remaining {n-1} items: ({n-1})! = {result}")


# 3. EXAMPLE 1: SEATING ARRANGEMENTS
def seating_arrangement_example():
    """Detailed example of seating arrangements"""
    
    print("EXAMPLE 1: SEATING ARRANGEMENTS")
    print("=" * 40)
    
    solver = CombinatoricsProblemSolver()
    
    # Linear arrangement
    print("SCENARIO A: 6 friends in a row at movies")
    solver.analyze_problem("Arrange 6 friends in a row", 6, problem_type="permutation")
    
    # Circular arrangement
    print("\n\nSCENARIO B: 6 friends around a circular table")
    solver.analyze_problem("Arrange 6 friends around circular table", 6, problem_type="circular")
    
    # Partial arrangement
    print("\n\nSCENARIO C: Choose 3 friends for front row from 6")
    solver.analyze_problem("Choose and arrange 3 friends for front row", 6, 3, "permutation")
    
    # Comparison
    linear = CombinatoricsCalculator.factorial(6)
    circular = CombinatoricsCalculator.circular_permutation(6)
    partial = CombinatoricsCalculator.permutation(6, 3)
    
    print(f"\n\nCOMPARISON:")
    print(f"Linear arrangement (6 people):     {linear:,}")
    print(f"Circular arrangement (6 people):   {circular:,}")
    print(f"Front row arrangement (3 of 6):    {partial:,}")
    print(f"\nCircular has fewer arrangements because rotations are considered identical")


# 4. EXAMPLE 2: TEAM SELECTION
def team_selection_example():
    """Detailed example of team selection (combinations)"""
    
    print("\n\nEXAMPLE 2: TEAM SELECTION")
    print("=" * 30)
    
    solver = CombinatoricsProblemSolver()
    calc = CombinatoricsCalculator()
    
    # Basic team selection
    print("SCENARIO A: Choose 5 players from 12 for basketball team")
    solver.analyze_problem("Choose 5 players from 12", 12, 5, "combination")
    
    # Multiple teams
    print("\n\nSCENARIO B: Divide 12 players into 2 teams of 5 and 2 reserves")
    team1 = calc.combination(12, 5)
    team2 = calc.combination(7, 5)  # Choose 5 from remaining 7
    reserves = calc.combination(2, 2)  # Remaining 2 are reserves
    
    total_ways = team1 * team2 * reserves
    
    print(f"\nStep-by-step division:")
    print(f"1. Choose Team 1 (5 from 12): C(12,5) = {team1}")
    print(f"2. Choose Team 2 (5 from remaining 7): C(7,5) = {team2}")
    print(f"3. Remaining 2 are reserves: C(2,2) = {reserves}")
    print(f"Total ways: {team1} × {team2} × {reserves} = {total_ways}")
    
    # But wait - teams are indistinguishable!
    print(f"\nHowever, if teams are indistinguishable:")
    print(f"We've double-counted (Team1, Team2) and (Team2, Team1)")
    print(f"Actual ways: {total_ways} ÷ 2 = {total_ways // 2}")


# 5. EXAMPLE 3: PASSWORD GENERATION
def password_example():
    """Example of password generation with different constraints"""
    
    print("\n\nEXAMPLE 3: PASSWORD GENERATION")
    print("=" * 35)
    
    calc = CombinatoricsCalculator()
    
    print("SCENARIO A: 4-character password with letters A-Z (no repeats)")
    letters_no_repeat = calc.permutation(26, 4)
    print(f"Available: 26 letters")
    print(f"Choose and arrange 4: P(26,4) = 26×25×24×23 = {letters_no_repeat:,}")
    
    print(f"\nSCENARIO B: 4-character password with letters A-Z (repeats allowed)")
    letters_with_repeat = 26 ** 4
    print(f"Each position: 26 choices")
    print(f"Total: 26⁴ = {letters_with_repeat:,}")
    
    print(f"\nSCENARIO C: 6-digit PIN (0-9, repeats allowed)")
    pin_possibilities = 10 ** 6
    print(f"Each digit: 10 choices (0-9)")
    print(f"Total: 10⁶ = {pin_possibilities:,}")
    
    print(f"\nSCENARIO D: Mixed password (2 letters + 2 digits, no repeats)")
    letter_part = calc.permutation(26, 2)
    digit_part = calc.permutation(10, 2)
    arrangements = calc.factorial(4)  # Arrange 4 characters
    mixed_total = letter_part * digit_part * arrangements
    
    print(f"Choose 2 letters: P(26,2) = {letter_part}")
    print(f"Choose 2 digits: P(10,2) = {digit_part}")
    print(f"Arrange all 4: 4! = {arrangements}")
    print(f"Total: {letter_part} × {digit_part} × {arrangements} = {mixed_total:,}")
    
    # Security comparison
    print(f"\n\nSECURITY COMPARISON:")
    scenarios = [
        ("4 letters, no repeats", letters_no_repeat),
        ("4 letters, with repeats", letters_with_repeat),
        ("6 digits", pin_possibilities),
        ("2 letters + 2 digits", mixed_total)
    ]
    
    for desc, count in scenarios:
        print(f"{desc:25}: {count:>10,} possibilities")


# 6. EXAMPLE 4: CARD GAMES (POKER HANDS)
def poker_hands_example():
    """Calculate probabilities of different poker hands"""
    
    print("\n\nEXAMPLE 4: POKER HAND PROBABILITIES")
    print("=" * 40)
    
    calc = CombinatoricsCalculator()
    
    # Total possible 5-card hands
    total_hands = calc.combination(52, 5)
    print(f"Total 5-card hands from 52-card deck: C(52,5) = {total_hands:,}")
    
    # Royal flush (A-K-Q-J-10 of same suit)
    royal_flush = 4  # One per suit
    royal_prob = royal_flush / total_hands
    
    print(f"\nROYAL FLUSH:")
    print(f"Count: {royal_flush} (one per suit)")
    print(f"Probability: {royal_flush}/{total_hands:,} = {royal_prob:.2e} = {royal_prob*100:.6f}%")
    
    # Four of a kind (AAAAB)
    four_kind_ranks = 13  # Choose rank for four cards
    four_kind_fifth = 48  # Choose fifth card (not same rank)
    four_of_kind = four_kind_ranks * four_kind_fifth
    four_prob = four_of_kind / total_hands
    
    print(f"\nFOUR OF A KIND:")
    print(f"Choose rank for 4 cards: 13 ways")
    print(f"Choose 5th card: 48 ways (any except same rank)")
    print(f"Count: 13 × 48 = {four_of_kind}")
    print(f"Probability: {four_of_kind}/{total_hands:,} = {four_prob:.5f} = {four_prob*100:.4f}%")
    
    # Full house (AAABB)
    full_house_trips = 13  # Choose rank for three cards
    full_house_pair = 12   # Choose rank for pair (different from trips)
    full_house = full_house_trips * full_house_pair
    full_prob = full_house / total_hands
    
    print(f"\nFULL HOUSE:")
    print(f"Choose rank for 3 cards: 13 ways")
    print(f"Choose rank for 2 cards: 12 ways (must be different)")
    print(f"Count: 13 × 12 = {full_house}")
    print(f"Probability: {full_house}/{total_hands:,} = {full_prob:.5f} = {full_prob*100:.4f}%")
    
    # One pair
    pair_rank = 13                                  # Choose rank for pair
    pair_cards = calc.combination(4, 2)            # Choose 2 from 4 suits
    other_ranks = calc.combination(12, 3)          # Choose 3 other ranks
    other_cards = 4 ** 3                           # Choose suits for other cards
    one_pair = pair_rank * pair_cards * other_ranks * other_cards
    pair_prob = one_pair / total_hands
    
    print(f"\nONE PAIR:")
    print(f"Choose rank for pair: 13 ways")
    print(f"Choose 2 cards from 4 suits: C(4,2) = {pair_cards}")
    print(f"Choose 3 other ranks: C(12,3) = {other_ranks}")
    print(f"Choose suits for other cards: 4³ = {other_cards}")
    print(f"Count: 13 × {pair_cards} × {other_ranks} × {other_cards} = {one_pair:,}")
    print(f"Probability: {one_pair:,}/{total_hands:,} = {pair_prob:.4f} = {pair_prob*100:.2f}%")


# 7. EXAMPLE 5: PERMUTATIONS WITH RESTRICTIONS
def restricted_permutations_example():
    """Examples of permutations with various restrictions"""
    
    print("\n\nEXAMPLE 5: PERMUTATIONS WITH RESTRICTIONS")
    print("=" * 45)
    
    calc = CombinatoricsCalculator()
    
    # Example 1: Adjacent elements must be together
    print("SCENARIO A: Arrange 5 people with Alice and Bob together")
    print("Method: Treat Alice-Bob as single unit")
    
    units_to_arrange = 4  # (Alice-Bob), Carol, David, Eve
    internal_arrangements = 2  # Alice-Bob or Bob-Alice
    restricted_total = calc.factorial(units_to_arrange) * internal_arrangements
    unrestricted_total = calc.factorial(5)
    
    print(f"Treat AB as one unit: 4 units to arrange = 4! = {calc.factorial(4)}")
    print(f"Internal arrangements of AB: 2! = {internal_arrangements}")
    print(f"Total with restriction: {calc.factorial(4)} × {internal_arrangements} = {restricted_total}")
    print(f"Compare to unrestricted: 5! = {unrestricted_total}")
    print(f"Restriction reduces possibilities by {unrestricted_total - restricted_total}")
    
    # Example 2: Certain elements cannot be together
    print(f"\nSCENARIO B: Arrange 5 people with Alice and Bob NOT together")
    print("Method: Total arrangements - arrangements with them together")
    
    not_together = unrestricted_total - restricted_total
    print(f"Total arrangements: 5! = {unrestricted_total}")
    print(f"Arrangements with AB together: {restricted_total}")
    print(f"Arrangements with AB NOT together: {unrestricted_total} - {restricted_total} = {not_together}")
    
    # Example 3: Permutations of letters with repetition
    print(f"\nSCENARIO C: Arrange letters in 'MATHEMATICS'")
    
    # Count letters: M(2), A(2), T(2), H(1), E(1), I(1), C(1), S(1)
    total_letters = 11
    repeated_letters = [2, 2, 2, 1, 1, 1, 1, 1]  # M, A, T, H, E, I, C, S
    
    arrangements = calc.permutation_with_repetition(total_letters, *repeated_letters)
    
    print(f"Letters: M(2), A(2), T(2), H(1), E(1), I(1), C(1), S(1)")
    print(f"Total letters: {total_letters}")
    print(f"Formula: 11!/(2!×2!×2!×1!×1!×1!×1!×1!)")
    print(f"Arrangements: {arrangements:,}")


# 8. PROBLEM TYPE IDENTIFIER
def identify_problem_type():
    """Interactive problem type identification"""
    
    print("\n\nPROBLEM TYPE IDENTIFICATION GUIDE")
    print("=" * 40)
    
    problems = [
        {
            "description": "How many ways to choose 3 books from 10?",
            "type": "Combination",
            "reasoning": "Order of selection doesn't matter",
            "formula": "C(10,3)"
        },
        {
            "description": "How many ways to arrange 8 people in a line?", 
            "type": "Permutation",
            "reasoning": "Order/position matters",
            "formula": "P(8,8) = 8!"
        },
        {
            "description": "How many 4-letter passwords from A-Z (no repeats)?",
            "type": "Permutation", 
            "reasoning": "Order matters, no repetition",
            "formula": "P(26,4)"
        },
        {
            "description": "How many pizza topping combinations (3 from 12)?",
            "type": "Combination",
            "reasoning": "Order of toppings doesn't matter",
            "formula": "C(12,3)"
        },
        {
            "description": "How many ways to seat 6 people around circular table?",
            "type": "Circular Permutation",
            "reasoning": "Circular arrangement, rotations identical",
            "formula": "(6-1)! = 5!"
        }
    ]
    
    for i, problem in enumerate(problems, 1):
        print(f"\nPROBLEM {i}: {problem['description']}")
        print(f"Type: {problem['type']}")
        print(f"Reasoning: {problem['reasoning']}")
        print(f"Formula: {problem['formula']}")


# 9. COMPREHENSIVE CALCULATOR
def comprehensive_combinatorics_demo():
    """Demonstrate all combinatorics concepts"""
    
    print("COMPREHENSIVE COMBINATORICS DEMONSTRATION")
    print("=" * 50)
    
    calc = CombinatoricsCalculator()
    
    # Basic calculations
    print("\nBASIC CALCULATIONS:")
    print(f"5! = {calc.factorial(5)}")
    print(f"P(8,3) = {calc.permutation(8, 3)}")
    print(f"C(10,4) = {calc.combination(10, 4)}")
    print(f"Circular arrangement of 6 items = {calc.circular_permutation(6)}")
    
    # Verification with small examples
    print(f"\nVERIFICATION WITH ENUMERATION:")
    
    # All permutations of ABC
    items = ['A', 'B', 'C']
    all_perms = list(itertools.permutations(items))
    print(f"All permutations of {items}: {len(all_perms)}")
    for perm in all_perms:
        print(f"  {''.join(perm)}")
    print(f"Formula check: 3! = {calc.factorial(3)} ✓")
    
    # All combinations of 2 from ABC
    all_combs = list(itertools.combinations(items, 2))
    print(f"\nAll combinations of 2 from {items}: {len(all_combs)}")
    for comb in all_combs:
        print(f"  {{{','.join(comb)}}}")
    print(f"Formula check: C(3,2) = {calc.combination(3, 2)} ✓")


# 10. RUN ALL EXAMPLES
def run_all_examples():
    """Execute all combinatorics examples"""
    
    print("COMBINATORICS: COMPLETE EXAMPLES")
    print("=" * 45)
    print("Permutations, Combinations, and Counting Principles")
    
    seating_arrangement_example()
    team_selection_example()
    password_example()
    poker_hands_example()
    restricted_permutations_example()
    identify_problem_type()
    comprehensive_combinatorics_demo()
    
    print("\n" + "=" * 45)
    print("KEY INSIGHTS:")
    print("1. Permutations: Order matters - use P(n,r) = n!/(n-r)!")
    print("2. Combinations: Order doesn't matter - use C(n,r) = n!/(r!(n-r)!)")
    print("3. Ask 'Does order matter?' to choose the right formula")
    print("4. Restrictions often require clever problem decomposition")
    print("5. Multiplication principle underlies all counting")
    print("6. Real applications: passwords, games, teams, arrangements")
    print("\nCombinatorics transforms complex counting into")
    print("systematic mathematical calculations!")


# Execute all examples
if __name__ == "__main__":
    run_all_examples()
```

## The Meta-Insight: Combinatorics as the Foundation of Systematic Thinking

### Why Combinatorics Revolutionized Mathematics

Combinatorics represents a profound shift from **intuitive counting to systematic enumeration**. Before these principles, mathematicians could only handle simple cases by listing all possibilities. Combinatorics provided the tools to count the uncountable and analyze the overwhelmingly complex.

> **The meta-insight**: Combinatorics didn't just give us counting formulas - it gave us a systematic way to think about discrete structures and finite processes. It's the mathematical foundation for understanding how choices compound and possibilities explode.

### ASCII Visualization: The Systematic Thinking Revolution

```
BEFORE COMBINATORICS           AFTER COMBINATORICS
┌─────────────────────┐       ┌─────────────────────┐
│ "Let me list them   │       │ "Does order matter? │
│  all..."            │  →    │  Use the right      │
│ 1. ABC              │       │  formula."          │
│ 2. ACB              │       │                     │
│ 3. BAC              │       │ P(n,r) or C(n,r)?   │
│ 4. ...              │       │ Answer: 3,628,800   │
│ (gives up at 100)   │       │                     │
└─────────────────────┘       └─────────────────────┘
Enumeration breaks down        Systematic analysis works
```

### The Universal Pattern

The principles of combinatorics appear everywhere in mathematics and beyond:

**Probability Theory**: Combinatorics provides the foundation for calculating probabilities in discrete spaces
**Computer Science**: Algorithm analysis, data structures, and complexity theory rely heavily on combinatorial arguments
**Graph Theory**: Counting paths, cycles, and network structures
**Number Theory**: Partitions, generating functions, and additive combinatorics
**Optimization**: Discrete optimization problems often reduce to combinatorial analysis

## The Connection to Advanced Mathematics

### Generating Functions
Combinatorial problems often lead to generating functions:
- **Exponential generating functions**: For labeled structures (permutations)
- **Ordinary generating functions**: For unlabeled structures (combinations)
- **Applications**: Solving recurrence relations, asymptotic analysis

### Algebraic Combinatorics
The intersection of algebra and combinatorics:
- **Symmetric functions**: Connections to representation theory
- **Combinatorial species**: Categorical approach to counting
- **Matroids**: Generalizing linear independence

### Probabilistic Methods
Using probability to prove combinatorial results:
- **Random graphs**: Proving existence of structures with desired properties
- **Concentration inequalities**: Showing typical behavior in large systems
- **Lovász Local Lemma**: Proving existence under multiple constraints

## Real-World Impact: Where Combinatorics Changes Everything

### Cryptography and Security
- **Key generation**: Ensuring sufficient key space through combinatorial analysis
- **Protocol design**: Counting attack vectors and defensive strategies
- **Blockchain**: Analyzing consensus mechanisms and fork probabilities

### Operations Research and Logistics
- **Scheduling**: Optimal arrangements of tasks, people, and resources
- **Supply chain**: Counting routing options and inventory configurations
- **Quality control**: Sampling strategies and inspection procedures

### Bioinformatics and Genetics
- **DNA sequencing**: Counting possible sequence arrangements
- **Protein folding**: Analyzing conformational possibilities
- **Population genetics**: Modeling genetic drift and selection

### Machine Learning and AI
- **Feature selection**: Choosing optimal subsets of variables
- **Neural network architecture**: Counting possible connections and structures
- **Ensemble methods**: Combining multiple models systematically

## The Philosophical Implications

### The Principle of Systematic Enumeration

Combinatorics embodies a fundamental principle: **complex systems can be understood by systematically counting their components and arrangements**.

This principle extends far beyond mathematics:
- **Design thinking**: Systematically exploring design possibilities
- **Strategic planning**: Enumerating possible scenarios and responses
- **Scientific method**: Designing experiments to cover all relevant cases

### The Multiplication Principle as Universal Logic

The multiplication principle captures something fundamental about how complexity grows:
- **Independent choices compound multiplicatively**
- **Small increases in options lead to exponential growth in possibilities**
- **Systematic analysis prevents exponential complexity from overwhelming us**

> **The deeper insight**: Combinatorics teaches us that complexity is manageable when we have systematic principles for navigation. It's not just about counting - it's about understanding how discrete structures behave.

## The Skills You've Developed

By mastering combinatorics, you've developed transferable analytical capabilities:

1. **Systematic thinking**: Breaking complex problems into manageable components
2. **Decision frameworks**: Asking the right questions to determine the appropriate approach
3. **Exponential thinking**: Understanding how choices and possibilities compound
4. **Constraint handling**: Dealing with restrictions and special conditions systematically
5. **Verification skills**: Checking results through multiple approaches and small examples

## Looking Forward: Advanced Applications

The combinatorial thinking you've learned leads naturally to:

**Graph Theory**: Networks, trees, and connectivity problems
**Design Theory**: Constructing optimal experimental designs and error-correcting codes
**Enumerative Combinatorics**: Advanced counting techniques and asymptotic analysis
**Algebraic Combinatorics**: Connecting discrete structures with algebraic objects
**Probabilistic Combinatorics**: Using randomness to prove deterministic results
**Computational Combinatorics**: Algorithms for generating and optimizing discrete structures

## The Universal Applications

Every field that involves discrete choices, arrangements, or selections uses combinatorial thinking:

**Business Strategy**: Scenario planning and option analysis
**Software Engineering**: Testing coverage and code structure analysis
**Game Design**: Balancing complexity and player choices
**Urban Planning**: Optimizing layouts and resource allocation
**Social Networks**: Understanding connectivity and influence patterns

> **Final insight**: Combinatorics is not just a mathematical subject - it's a fundamental way of thinking about discrete complexity. In our increasingly digital world, where choices proliferate and possibilities multiply exponentially, combinatorial thinking is essential for navigating complexity systematically.

**The practical takeaway**: Every time you face a situation with multiple options, choices, or arrangements - whether planning a project, designing a system, or analyzing possibilities - ask yourself the fundamental combinatorial questions: "Does order matter? Are there restrictions? How do my choices compound?" This systematic approach will consistently lead to better analysis and clearer thinking.

In a world of exponentially growing possibilities, combinatorics is your mathematical compass for navigating discrete complexity with confidence and precision.