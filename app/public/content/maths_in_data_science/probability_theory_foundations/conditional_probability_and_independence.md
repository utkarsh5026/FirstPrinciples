# Conditional Probability and Independence: How Information Changes Everything

## The Fundamental "Why": Information Transforms Uncertainty

Imagine you're rushing to catch a flight. You know that 80% of flights depart on time. But then you see storm clouds gathering. Suddenly, that 80% doesn't feel right anymore, does it? The storm clouds are **information** that changes the probability.

This is the heart of conditional probability: **information changes what we should believe.**

> **The key insight here is**: Most real-world probability questions aren't just "What's the chance of X?" but rather "What's the chance of X, given that I know Y?" Information is everything in probability.

## The Information Problem: Why Simple Probability Isn't Enough

### The Scenario That Breaks Simple Probability

Consider this situation:
- 30% of people in a city own a car
- You meet someone outside a luxury car dealership
- Question: What's the probability they own a car?

If you answer "30%," you're ignoring crucial information! Being at a luxury car dealership dramatically changes the likelihood.

> **This is like asking "What's the chance someone is hungry?" The answer completely depends on whether you're asking about someone leaving a restaurant or someone who hasn't eaten in 12 hours.**

### ASCII Visualization: How Information Narrows Possibilities

```
WITHOUT INFORMATION: All possibilities equal
┌─────────────────────────────────────────────────────────┐
│ ENTIRE POPULATION                                       │
│ ░░░░░░░▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░ = No car (70%)    ▓ = Has car (30%)                  │
│ P(Car) = 30%                                           │
└─────────────────────────────────────────────────────────┘

WITH INFORMATION: "At luxury car dealership"
┌─────────────────────────────────────────────────────────┐
│ PEOPLE AT DEALERSHIP ONLY                               │
│ ░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ░ = No car (5%)     ▓ = Has car (95%)                  │
│ P(Car | At dealership) = 95%                           │
└─────────────────────────────────────────────────────────┘
```

> **The fundamental necessity**: Simple probability assumes we know nothing except the overall population. But in real life, we always have some information that should update our beliefs.

## Conditional Probability: The Mathematical Framework

### The Intuitive Definition First

**Conditional Probability P(A|B)**: The probability of event A happening, given that we know event B has happened.

Read as: "P of A given B"

> **Think of conditional probability as shrinking your universe of possibilities. Instead of considering all possible outcomes, you only consider the outcomes where B is true, then ask what fraction of those also have A true.**

### Building the Formula from Intuition

Let's derive the formula by thinking step by step:

1. **Original question**: Out of everyone, what fraction has property A?
2. **Conditional question**: Out of people with property B, what fraction also has property A?

To answer the conditional question:
- Count people who have BOTH A and B
- Divide by people who have B

This gives us: **P(A|B) = P(A and B) / P(B)**

### ASCII Visualization: The Conditional Probability Derivation

```
DERIVING CONDITIONAL PROBABILITY

SAMPLE SPACE: 100 people
┌─────────────────────────────────────────────────────────┐
│                    Event B                              │
│  ┌─────────────────────────────────────────────┐       │
│  │     Event A                                 │       │
│  │  ┌─────────────────┐                       │       │
│  │  │                 │                       │       │
│  │  │   A and B       │   B but not A         │       │
│  │  │   (15 people)   │   (25 people)         │       │
│  │  │                 │                       │       │
│  │  └─────────────────┘                       │       │
│  └─────────────────────────────────────────────┘       │
│              A but not B (10 people)                   │
│                                                         │
│         Neither A nor B (50 people)                    │
└─────────────────────────────────────────────────────────┘

P(A|B) = People with BOTH A and B / People with B
       = 15 / (15 + 25) = 15/40 = 0.375

This equals: P(A and B) / P(B) = (15/100) / (40/100) = 15/40
```

> **The beautiful logic**: Conditional probability is just changing your denominator. Instead of "out of everyone," it's "out of everyone in group B."

## Real-World Examples: Building Deep Intuition

### Example 1: Medical Testing

**Scenario**: A rare disease affects 1% of the population. A test is 95% accurate.
- P(Disease) = 0.01
- P(Positive Test | Disease) = 0.95
- P(Negative Test | No Disease) = 0.95

**Question**: If someone tests positive, what's the probability they have the disease?

**Intuitive thinking**:
- Most people would guess 95% (the test accuracy)
- But this ignores the base rate!

**Step-by-step reasoning**:
```
In 10,000 people:
- 100 have the disease (1%)
- 9,900 don't have the disease

Among the 100 with disease:
- 95 test positive (95% accuracy)
- 5 test negative (5% false negatives)

Among the 9,900 without disease:
- 495 test positive (5% false positives)
- 9,405 test negative (95% accuracy)

Total positive tests: 95 + 495 = 590
Actually have disease: 95

P(Disease | Positive Test) = 95/590 ≈ 0.16 = 16%
```

> **The shocking insight**: Even with a highly accurate test, most positive results are false positives when the disease is rare! This is why understanding conditional probability can be literally life-and-death important in medicine.

### Example 2: Weather Prediction

**Scenario**: Understanding how weather forecasts work
- P(Rain tomorrow) = 0.3 (overall probability)
- P(Rain tomorrow | Dark clouds today) = 0.8
- P(Rain tomorrow | Clear skies today) = 0.1

**The intuition**: Weather forecasters don't just look at general statistics. They condition their predictions on current observations.

### ASCII Visualization: Weather Conditioning

```
WEATHER PREDICTION PROCESS

STEP 1: Base rate (no additional information)
┌─────────────────────────────────────────┐
│ Tomorrow's weather possibilities        │
│ ▓▓▓░░░░░░░                             │
│ ▓ = Rain (30%)  ░ = No rain (70%)      │
│ P(Rain) = 0.3                          │
└─────────────────────────────────────────┘

STEP 2: Observe dark clouds today
┌─────────────────────────────────────────┐
│ Subset: Days with dark clouds           │
│ ▓▓▓▓▓▓▓▓░░                             │
│ ▓ = Rain (80%)  ░ = No rain (20%)      │
│ P(Rain | Dark clouds) = 0.8            │
└─────────────────────────────────────────┘

STEP 3: Alternative - observe clear skies
┌─────────────────────────────────────────┐
│ Subset: Days with clear skies           │
│ ▓░░░░░░░░░                             │
│ ▓ = Rain (10%)  ░ = No rain (90%)      │
│ P(Rain | Clear skies) = 0.1            │
└─────────────────────────────────────────┘
```

## Independence: When Information Doesn't Matter

### The Intuitive Concept of Independence

Two events are **independent** when knowing about one doesn't change the probability of the other.

> **Independence is like saying**: "These two things are so unrelated that learning about one tells you absolutely nothing about the other."

**Mathematical Definition**: 
Events A and B are independent if P(A|B) = P(A)

**Alternative formulation**: 
A and B are independent if P(A and B) = P(A) × P(B)

### Examples of Independence and Dependence

**Independent Events**:
- Coin flip result and tomorrow's weather
- Your height and your favorite color
- Lottery numbers in different drawings

**Dependent Events**:
- Your education level and your income
- Today's weather and tomorrow's weather
- Having a cold and having a cough

### ASCII Visualization: Independence vs Dependence

```
INDEPENDENCE: Information doesn't change probabilities

EVENT A: Coin lands heads (50%)
EVENT B: Die shows even number (50%)

WITHOUT KNOWING B          KNOWING B
┌─────────────────┐      ┌─────────────────┐
│ P(A) = 0.5      │      │ P(A|B) = 0.5    │
│ ░░░░░▓▓▓▓▓      │  =   │ ░░░░░▓▓▓▓▓      │
│                 │      │                 │
└─────────────────┘      └─────────────────┘
Learning B doesn't change probability of A

DEPENDENCE: Information changes probabilities

EVENT A: Person is tall (20%)
EVENT B: Person plays basketball (5%)

WITHOUT KNOWING B          KNOWING B
┌─────────────────┐      ┌─────────────────┐
│ P(A) = 0.2      │      │ P(A|B) = 0.7    │
│ ░░░░░░░░▓▓      │  ≠   │ ░░░▓▓▓▓▓▓▓      │
│                 │      │                 │
└─────────────────┘      └─────────────────┘
Learning B dramatically changes probability of A
```

### The Deep Logic of Independence

> **Why independence matters**: Independence is the mathematical way of saying "these events live in separate worlds." When events are independent, you can analyze them separately and multiply probabilities. When they're dependent, you must consider their interaction.

### Testing for Independence: Three Equivalent Conditions

Events A and B are independent if ANY of these is true:
1. **P(A|B) = P(A)** (knowing B doesn't change A's probability)
2. **P(B|A) = P(B)** (knowing A doesn't change B's probability)  
3. **P(A and B) = P(A) × P(B)** (joint probability equals product)

## Common Misconceptions and Pitfalls

### Misconception 1: "Mutually Exclusive" = "Independent"

**Wrong!** These are opposite concepts:
- **Mutually exclusive**: If A happens, B cannot happen (P(A and B) = 0)
- **Independent**: A and B don't influence each other

> **The key distinction**: Mutually exclusive events are maximally dependent! Knowing one happened tells you the other definitely didn't happen.

### ASCII Visualization: Mutual Exclusion vs Independence

```
MUTUALLY EXCLUSIVE (Maximally Dependent!)
┌─────────────────────────────────────────┐
│ Event A    │    Event B                 │
│ {1,2,3}    │    {4,5,6}                 │
│            │                            │
│ If A happens, B cannot happen           │
│ P(B|A) = 0 ≠ P(B)                      │
│ These are DEPENDENT, not independent!   │
└─────────────────────────────────────────┘

INDEPENDENT EVENTS
┌─────────────────────────────────────────┐
│     Event A: {2,4,6}                    │
│       ╭──────────╮                      │
│   ╭───│──╮   ╭───│───╮                  │
│   │   │  │   │   │   │                  │
│   │ 2 │4 │   │ 4 │ 6 │  Event B: {4,5,6}│
│   │   │  │   │   │   │                  │
│   ╰───│──╯   ╰───│───╯                  │
│       ╰──────────╯                      │
│ Events can overlap and still be         │
│ independent if P(A∩B) = P(A)×P(B)      │
└─────────────────────────────────────────┘
```

### Misconception 2: "Small Correlation" = "Independence"

Just because correlation is small doesn't mean events are independent. Independence requires **zero** correlation.

### Misconception 3: Confusing P(A|B) and P(B|A)

These are usually very different!
- P(Disease|Positive Test) ≠ P(Positive Test|Disease)
- P(Tall|Basketball Player) ≠ P(Basketball Player|Tall)

## The Chain Rule: Connecting Complex Events

For multiple events, we can chain conditional probabilities:

**P(A and B and C) = P(A) × P(B|A) × P(C|A and B)**

> **This is like a story unfolding**: First A happens with probability P(A). Given that A happened, B happens with probability P(B|A). Given that both A and B happened, C happens with probability P(C|A and B).

### Example: Drawing Cards Without Replacement

Drawing three cards from a deck without replacement:
- P(1st card is Ace) = 4/52
- P(2nd card is Ace | 1st was Ace) = 3/51
- P(3rd card is Ace | first two were Aces) = 2/50

P(All three Aces) = (4/52) × (3/51) × (2/50) = 24/132,600 ≈ 0.000181

### ASCII Visualization: Chain Rule in Action

```
DRAWING THREE ACES WITHOUT REPLACEMENT

INITIAL STATE: 52 cards, 4 aces
┌─────────────────────────────────────────────────────────┐
│ ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ P(1st Ace) = 4/52                                      │
└─────────────────────────────────────────────────────────┘
                    │ Draw 1st Ace
                    ▼
AFTER 1ST ACE: 51 cards, 3 aces
┌─────────────────────────────────────────────────────────┐
│ ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ P(2nd Ace | 1st Ace) = 3/51                           │
└─────────────────────────────────────────────────────────┘
                    │ Draw 2nd Ace
                    ▼
AFTER 2ND ACE: 50 cards, 2 aces
┌─────────────────────────────────────────────────────────┐
│ ▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ P(3rd Ace | first two Aces) = 2/50                    │
└─────────────────────────────────────────────────────────┘

Total: (4/52) × (3/51) × (2/50) = 0.000181
```

## Simple Code Examples

```python
import random
import numpy as np
from collections import defaultdict, Counter

# 1. CONDITIONAL PROBABILITY CALCULATOR
class ConditionalProbability:
    """Calculate conditional probabilities from data or definitions"""
    
    def __init__(self):
        self.data = []
        self.events = {}
    
    def add_observation(self, **kwargs):
        """Add an observation with multiple attributes"""
        self.data.append(kwargs)
    
    def define_event(self, name, condition):
        """Define an event as a condition function"""
        self.events[name] = condition
    
    def calculate_probability(self, event_name):
        """Calculate P(A) - unconditional probability"""
        if event_name not in self.events:
            return 0
        
        condition = self.events[event_name]
        satisfying = sum(1 for obs in self.data if condition(obs))
        return satisfying / len(self.data) if self.data else 0
    
    def calculate_conditional(self, event_a, event_b):
        """Calculate P(A|B) - probability of A given B"""
        if event_a not in self.events or event_b not in self.events:
            return 0
        
        condition_a = self.events[event_a]
        condition_b = self.events[event_b]
        
        # Count observations where B is true
        b_true = [obs for obs in self.data if condition_b(obs)]
        if not b_true:
            return 0
        
        # Among those, count where A is also true
        both_true = sum(1 for obs in b_true if condition_a(obs))
        
        return both_true / len(b_true)
    
    def calculate_joint(self, event_a, event_b):
        """Calculate P(A and B) - joint probability"""
        if event_a not in self.events or event_b not in self.events:
            return 0
        
        condition_a = self.events[event_a]
        condition_b = self.events[event_b]
        
        both_true = sum(1 for obs in self.data 
                       if condition_a(obs) and condition_b(obs))
        return both_true / len(self.data) if self.data else 0


# 2. MEDICAL TESTING EXAMPLE
def medical_testing_example():
    """Demonstrate the counter-intuitive nature of medical testing"""
    
    print("MEDICAL TESTING EXAMPLE")
    print("=" * 40)
    print("Disease prevalence: 1%")
    print("Test accuracy: 95%")
    print()
    
    # Simulate a population
    population_size = 10000
    disease_rate = 0.01
    test_accuracy = 0.95
    
    prob_calc = ConditionalProbability()
    
    # Generate population data
    for i in range(population_size):
        # Determine if person has disease
        has_disease = random.random() < disease_rate
        
        # Determine test result based on disease status
        if has_disease:
            # True positive with probability = test_accuracy
            test_positive = random.random() < test_accuracy
        else:
            # False positive with probability = (1 - test_accuracy)
            test_positive = random.random() < (1 - test_accuracy)
        
        prob_calc.add_observation(
            has_disease=has_disease,
            test_positive=test_positive
        )
    
    # Define events
    prob_calc.define_event("disease", lambda x: x["has_disease"])
    prob_calc.define_event("positive_test", lambda x: x["test_positive"])
    
    # Calculate probabilities
    p_disease = prob_calc.calculate_probability("disease")
    p_positive = prob_calc.calculate_probability("positive_test")
    p_disease_given_positive = prob_calc.calculate_conditional("disease", "positive_test")
    p_positive_given_disease = prob_calc.calculate_conditional("positive_test", "disease")
    
    print(f"P(Disease) = {p_disease:.3f}")
    print(f"P(Positive Test) = {p_positive:.3f}")
    print(f"P(Disease | Positive Test) = {p_disease_given_positive:.3f}")
    print(f"P(Positive Test | Disease) = {p_positive_given_disease:.3f}")
    print()
    print("Key insight: Even with 95% accuracy, most positive")
    print("tests are false positives when disease is rare!")


# 3. INDEPENDENCE TESTING
class IndependenceTest:
    """Test whether two events are independent"""
    
    def __init__(self, prob_calc):
        self.prob_calc = prob_calc
    
    def test_independence(self, event_a, event_b, tolerance=0.01):
        """Test if events A and B are independent"""
        
        # Calculate required probabilities
        p_a = self.prob_calc.calculate_probability(event_a)
        p_b = self.prob_calc.calculate_probability(event_b)
        p_a_given_b = self.prob_calc.calculate_conditional(event_a, event_b)
        p_b_given_a = self.prob_calc.calculate_conditional(event_b, event_a)
        p_ab = self.prob_calc.calculate_joint(event_a, event_b)
        
        # Test independence conditions
        condition1 = abs(p_a_given_b - p_a) < tolerance  # P(A|B) ≈ P(A)
        condition2 = abs(p_b_given_a - p_b) < tolerance  # P(B|A) ≈ P(B)
        condition3 = abs(p_ab - (p_a * p_b)) < tolerance  # P(A∩B) ≈ P(A)×P(B)
        
        independent = condition1 and condition2 and condition3
        
        return {
            'independent': independent,
            'p_a': p_a,
            'p_b': p_b,
            'p_a_given_b': p_a_given_b,
            'p_b_given_a': p_b_given_a,
            'p_ab': p_ab,
            'p_a_times_p_b': p_a * p_b,
            'conditions': [condition1, condition2, condition3]
        }


# 4. INDEPENDENCE EXAMPLES
def independence_examples():
    """Demonstrate independent vs dependent events"""
    
    print("\nINDEPENDENCE EXAMPLES")
    print("=" * 40)
    
    # Example 1: Independent events (coin flips and die rolls)
    print("\n1. INDEPENDENT EVENTS: Coin flips vs Die rolls")
    print("-" * 50)
    
    prob_calc1 = ConditionalProbability()
    
    # Generate independent data
    for _ in range(1000):
        coin = random.choice(['H', 'T'])
        die = random.randint(1, 6)
        
        prob_calc1.add_observation(
            heads=coin == 'H',
            even_die=die % 2 == 0
        )
    
    prob_calc1.define_event("heads", lambda x: x["heads"])
    prob_calc1.define_event("even_die", lambda x: x["even_die"])
    
    independence_test1 = IndependenceTest(prob_calc1)
    result1 = independence_test1.test_independence("heads", "even_die")
    
    print(f"P(Heads) = {result1['p_a']:.3f}")
    print(f"P(Even Die) = {result1['p_b']:.3f}")
    print(f"P(Heads | Even Die) = {result1['p_a_given_b']:.3f}")
    print(f"P(Heads ∩ Even Die) = {result1['p_ab']:.3f}")
    print(f"P(Heads) × P(Even Die) = {result1['p_a_times_p_b']:.3f}")
    print(f"Independent? {result1['independent']}")
    
    # Example 2: Dependent events (height and basketball)
    print("\n2. DEPENDENT EVENTS: Height vs Basketball playing")
    print("-" * 50)
    
    prob_calc2 = ConditionalProbability()
    
    # Generate dependent data (tall people more likely to play basketball)
    for _ in range(1000):
        is_tall = random.random() < 0.2  # 20% are tall
        
        if is_tall:
            plays_basketball = random.random() < 0.4  # 40% of tall people play
        else:
            plays_basketball = random.random() < 0.02  # 2% of short people play
        
        prob_calc2.add_observation(
            tall=is_tall,
            basketball=plays_basketball
        )
    
    prob_calc2.define_event("tall", lambda x: x["tall"])
    prob_calc2.define_event("basketball", lambda x: x["basketball"])
    
    independence_test2 = IndependenceTest(prob_calc2)
    result2 = independence_test2.test_independence("tall", "basketball")
    
    print(f"P(Tall) = {result2['p_a']:.3f}")
    print(f"P(Basketball) = {result2['p_b']:.3f}")
    print(f"P(Tall | Basketball) = {result2['p_a_given_b']:.3f}")
    print(f"P(Tall ∩ Basketball) = {result2['p_ab']:.3f}")
    print(f"P(Tall) × P(Basketball) = {result2['p_a_times_p_b']:.3f}")
    print(f"Independent? {result2['independent']}")


# 5. CHAIN RULE DEMONSTRATION
def chain_rule_example():
    """Demonstrate the chain rule with card drawing"""
    
    print("\nCHAIN RULE EXAMPLE: Drawing Aces without replacement")
    print("=" * 60)
    
    # Simulate drawing 3 cards without replacement
    def draw_three_aces_simulation(n_trials=10000):
        successes = 0
        
        for _ in range(n_trials):
            # Create deck (4 aces out of 52 cards)
            deck = ['A'] * 4 + ['X'] * 48
            random.shuffle(deck)
            
            # Draw three cards
            if deck[0] == 'A' and deck[1] == 'A' and deck[2] == 'A':
                successes += 1
        
        return successes / n_trials
    
    # Theoretical calculation using chain rule
    theoretical = (4/52) * (3/51) * (2/50)
    
    # Simulation
    simulated = draw_three_aces_simulation()
    
    print("Theoretical (Chain Rule):")
    print(f"P(1st Ace) = 4/52 = {4/52:.6f}")
    print(f"P(2nd Ace | 1st Ace) = 3/51 = {3/51:.6f}")
    print(f"P(3rd Ace | first two Aces) = 2/50 = {2/50:.6f}")
    print(f"P(All three Aces) = {theoretical:.6f}")
    print()
    print(f"Simulation result: {simulated:.6f}")
    print(f"Difference: {abs(theoretical - simulated):.6f}")


# 6. BAYES' THEOREM DEMONSTRATION
def bayes_theorem_example():
    """Demonstrate Bayes' theorem for updating beliefs"""
    
    print("\nBAYES' THEOREM: Updating beliefs with new evidence")
    print("=" * 55)
    
    # Problem: Email spam detection
    # P(Spam) = 0.3 (30% of emails are spam)
    # P(Contains "FREE" | Spam) = 0.8 (80% of spam contains "FREE")
    # P(Contains "FREE" | Not Spam) = 0.1 (10% of non-spam contains "FREE")
    # Question: P(Spam | Contains "FREE") = ?
    
    prob_calc = ConditionalProbability()
    
    # Generate email data
    for _ in range(10000):
        is_spam = random.random() < 0.3  # 30% spam rate
        
        if is_spam:
            contains_free = random.random() < 0.8  # 80% of spam has "FREE"
        else:
            contains_free = random.random() < 0.1  # 10% of non-spam has "FREE"
        
        prob_calc.add_observation(
            spam=is_spam,
            contains_free=contains_free
        )
    
    prob_calc.define_event("spam", lambda x: x["spam"])
    prob_calc.define_event("free", lambda x: x["contains_free"])
    
    # Calculate probabilities
    p_spam = prob_calc.calculate_probability("spam")
    p_free_given_spam = prob_calc.calculate_conditional("free", "spam")
    p_free_given_not_spam = prob_calc.calculate_conditional("free", "not_spam")
    p_spam_given_free = prob_calc.calculate_conditional("spam", "free")
    
    # Add not_spam event for cleaner calculation
    prob_calc.define_event("not_spam", lambda x: not x["spam"])
    p_free_given_not_spam = prob_calc.calculate_conditional("free", "not_spam")
    
    print("Prior probabilities:")
    print(f"P(Spam) = {p_spam:.3f}")
    print(f"P(Not Spam) = {1 - p_spam:.3f}")
    print()
    print("Likelihoods:")
    print(f"P(Contains 'FREE' | Spam) = {p_free_given_spam:.3f}")
    print(f"P(Contains 'FREE' | Not Spam) = {p_free_given_not_spam:.3f}")
    print()
    print("Posterior (after seeing 'FREE'):")
    print(f"P(Spam | Contains 'FREE') = {p_spam_given_free:.3f}")
    print()
    print("Interpretation: Seeing 'FREE' dramatically increases")
    print("the probability that an email is spam!")


# Run all examples
if __name__ == "__main__":
    medical_testing_example()
    independence_examples()
    chain_rule_example()
    bayes_theorem_example()
```

Here are practical implementations demonstrating conditional probability and independence:## Additional Simple Examples

Here are some quick demonstrations of key concepts:

```python
# Quick conditional probability examples
def simple_examples():
    """Simple, intuitive examples of conditional probability"""
    
    print("SIMPLE CONDITIONAL PROBABILITY EXAMPLES")
    print("=" * 45)
    
    # Example 1: Weather and outdoor events
    print("\n1. Weather and Picnic Planning")
    print("-" * 30)
    
    # Simple probabilities
    p_rain = 0.3                    # 30% chance of rain
    p_picnic_if_sunny = 0.9         # 90% chance of picnic if sunny
    p_picnic_if_rainy = 0.1         # 10% chance of picnic if rainy
    
    print(f"P(Rain) = {p_rain}")
    print(f"P(Picnic | Sunny) = {p_picnic_if_sunny}")
    print(f"P(Picnic | Rainy) = {p_picnic_if_rainy}")
    
    # Calculate overall probability of picnic
    p_sunny = 1 - p_rain
    p_picnic = (p_picnic_if_sunny * p_sunny) + (p_picnic_if_rainy * p_rain)
    
    print(f"P(Picnic overall) = {p_picnic:.2f}")
    print("Notice how weather information changes picnic probability!")

# Independence check function
def check_independence_simple():
    """Simple independence check"""
    
    # Two coin flips - should be independent
    outcomes = []
    for flip1 in ['H', 'T']:
        for flip2 in ['H', 'T']:
            outcomes.append((flip1, flip2))
    
    # Calculate probabilities
    p_first_heads = 0.5
    p_second_heads = 0.5
    p_both_heads = 0.25
    
    # Check independence: P(A and B) = P(A) × P(B)
    independent = p_both_heads == p_first_heads * p_second_heads
    
    print(f"\nCoin flip independence check:")
    print(f"P(1st heads) × P(2nd heads) = {p_first_heads * p_second_heads}")
    print(f"P(both heads) = {p_both_heads}")
    print(f"Independent? {independent}")

simple_examples()
check_independence_simple()
```

## The Meta-Insights: Why This All Matters

> **Conditional probability is the bridge between mathematical theory and real-world decision making.** Almost every important decision involves updating beliefs based on new information.

### The Universal Pattern

Whether you're:
- A doctor interpreting test results
- A weather forecaster using satellite data  
- An investor analyzing market conditions
- A student preparing for exams based on practice test performance

You're using conditional probability. The pattern is always:
1. **Start with prior knowledge** (base rates, historical data)
2. **Observe new information** (test results, current conditions)
3. **Update beliefs rationally** (use conditional probability)
4. **Make better decisions** (based on updated probabilities)

### ASCII Visualization: The Universal Decision Framework

```
THE CONDITIONAL PROBABILITY DECISION FRAMEWORK

STEP 1: Prior Knowledge
┌─────────────────────────────────────┐
│ What do I know beforehand?          │
│ • Base rates                        │
│ • Historical patterns               │
│ • General probabilities             │
└─────────────────────────────────────┘
                   │
                   ▼
STEP 2: New Information
┌─────────────────────────────────────┐
│ What have I just observed?          │
│ • Test results                      │
│ • Current conditions                │
│ • New evidence                      │
└─────────────────────────────────────┘
                   │
                   ▼
STEP 3: Conditional Update
┌─────────────────────────────────────┐
│ P(Hypothesis | Evidence)            │
│ = P(Evidence | Hypothesis) × P(H)   │
│   ─────────────────────────────     │
│         P(Evidence)                 │
└─────────────────────────────────────┘
                   │
                   ▼
STEP 4: Better Decision
┌─────────────────────────────────────┐
│ Act on updated probabilities        │
│ • More accurate predictions         │
│ • Better resource allocation        │
│ • Reduced uncertainty               │
└─────────────────────────────────────┘
```

> **Final insight**: Conditional probability and independence aren't just mathematical curiosities - they're the fundamental tools for thinking clearly about uncertainty in a world where information constantly changes what we should believe. Master these concepts, and you'll have the foundation for everything from artificial intelligence to evidence-based medicine to smart financial decisions.

**The practical takeaway**: Every time you hear new information and think "that changes things," you're intuitively doing conditional probability. The mathematics just makes that intuition precise, systematic, and reliable.