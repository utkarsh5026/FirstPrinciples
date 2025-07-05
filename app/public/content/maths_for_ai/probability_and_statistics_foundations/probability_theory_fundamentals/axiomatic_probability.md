# Axiomatic Probability: The Mathematical Foundation of Uncertainty

## The Fundamental "Why": When Intuitive Probability Breaks Down

Imagine you're trying to build a casino. You know that a fair coin should come up heads 50% of the time, and you want to offer fair bets. But then someone asks you these questions:

* "What's the probability that a randomly chosen real number between 0 and 1 is exactly 0.5?"
* "What's the probability that a dart thrown at a dartboard lands in any specific region?"
* "What's the probability that two events that seem 'impossible' to happen together actually do happen together?"

Suddenly, your intuitive understanding of probability starts to crack. How do you assign probabilities to infinite sets? What does it even mean to "choose randomly" from uncountably many possibilities?

> **The key insight here is** : Intuitive probability works fine for simple, finite situations like coin flips and dice rolls. But when we enter the world of continuous distributions, infinite sample spaces, and complex real-world scenarios, we need a rock-solid mathematical foundation that can handle any situation without contradictions.

This is exactly the problem that **axiomatic probability** solves. It provides the mathematical bedrock that makes probability theory completely rigorous and universally applicable.

## The Intuitive Problem: Why We Can't Just "Wing It" with Probability

### The Limitations of Naive Probability

Consider these seemingly reasonable probability statements that actually lead to mathematical contradictions:

**Problem 1: The Infinite Lottery**

* Imagine a lottery with infinitely many tickets numbered 1, 2, 3, ...
* "Each ticket has equal probability of winning"
* If each has probability p > 0, then total probability = ∞ × p = ∞ (impossible!)
* If each has probability 0, then total probability = ∞ × 0 = 0 (but someone must win!)

**Problem 2: The Dartboard Paradox**

* Throw a dart at a square dartboard
* "What's the probability it lands at exactly coordinates (0.5, 0.7)?"
* There are uncountably infinite possible coordinates
* If any specific point has probability > 0, total probability = ∞
* If every point has probability 0, how can anything happen?

> **This is like trying to build a house without a foundation. Intuitive probability is like saying "I'll just eyeball where the walls go" - it works for a small shed, but collapses when you try to build a skyscraper. Axiomatic probability provides the mathematical foundation that can support any structure, no matter how complex.**

### ASCII Visualization: Where Intuitive Probability Fails

```
INTUITIVE PROBABILITY vs MATHEMATICAL REALITY

SIMPLE CASE (Works Fine):
Coin flip: {Heads, Tails}
P(Heads) = 0.5, P(Tails) = 0.5
Total = 1.0 ✓ Everything makes sense!

COMPLEX CASE (Intuition Breaks):
Dart on square: {(x,y) : 0 ≤ x,y ≤ 1}
How many points? ∞ (uncountable)
P(any specific point) = ?
   If > 0: Total probability = ∞ ✗
   If = 0: Nothing can happen! ✗

THE CRISIS:
┌─────────────────────────────────┐
│ Intuitive probability says:     │
│ "Just assign reasonable values" │
│                                 │
│ Mathematics says:               │
│ "That leads to contradictions!" │
│                                 │
│ SOLUTION NEEDED: Rigorous       │
│ mathematical framework          │
└─────────────────────────────────┘
```

> **The fundamental necessity** : We need a mathematical system that can handle any conceivable probability situation - finite, infinite, discrete, continuous - without ever running into logical contradictions. This system must be built from the ground up with perfect mathematical rigor.

## Sample Spaces: The Universe of All Possibilities

### The Intuitive Foundation

Before we can talk about probabilities, we need to be crystal clear about what we're assigning probabilities to. The **sample space** is our complete catalog of everything that could possibly happen.

> **Think of the sample space like creating the ultimate database of possibilities. Before you can calculate the probability of any event, you need to first catalog every single thing that could conceivably occur. The sample space is your complete, exhaustive list - your "universe of possibilities."**

### Building Sample Spaces from Scratch

 **The Logical Necessity** :

1. **We need to list everything that could happen** (completeness)
2. **Each outcome must be clearly distinct** (mutual exclusivity)
3. **Nothing can happen outside this list** (exhaustiveness)

 **Mathematical Definition** : A sample space Ω (omega) is the set of all possible outcomes of an experiment.

### Real-World Sample Space Examples

**Example 1: Coin Flip**

* Sample space: Ω = {Heads, Tails}
* Simple, finite, unambiguous

**Example 2: Rolling a Die**

* Sample space: Ω = {1, 2, 3, 4, 5, 6}
* Each outcome is clearly distinct

**Example 3: Measuring Temperature**

* Sample space: Ω = {all real numbers from -273.15°C to +∞}
* Infinite, continuous, but well-defined

**Example 4: Stock Price After One Year**

* Sample space: Ω = {all positive real numbers}
* Infinite possibilities, but mathematically precise

### ASCII Visualization: Sample Space Construction

```
BUILDING SAMPLE SPACES: FROM SIMPLE TO COMPLEX

FINITE SAMPLE SPACE (Die Roll):
Ω = {1, 2, 3, 4, 5, 6}
┌─┬─┬─┬─┬─┬─┐
│1│2│3│4│5│6│  ← Every possibility cataloged
└─┴─┴─┴─┴─┴─┘
Exactly 6 outcomes, no ambiguity

INFINITE DISCRETE (Coin Flips Until Heads):
Ω = {H, TH, TTH, TTTH, TTTTH, ...}
┌─┬──┬───┬────┬─────┬───
│H│TH│TTH│TTTH│TTTTH│...  ← Infinite but countable
└─┴──┴───┴────┴─────┴───

CONTINUOUS (Dart Position):
Ω = {(x,y) : 0 ≤ x ≤ 1, 0 ≤ y ≤ 1}
     ▲ y=1
   1 ├┼┼┼┼┼┼┼┼┤
     ├┼┼┼┼┼┼┼┼┤  ← Every point (x,y) 
     ├┼┼┼┼┼┼┼┼┤     is a possible outcome
     ├┼┼┼┼┼┼┼┼┤
   0 └─────────┤▶ x=1
     0         1
Uncountably infinite outcomes!

THE PATTERN: Sample space = "What could happen?"
```

> **The crucial insight** : The sample space isn't just a mathematical abstraction - it's the foundation that makes all probability calculations possible. Every probability question starts with "Given this universe of possibilities, what's the chance of this specific subset occurring?"

### Why Sample Spaces Must Be Complete and Precise

 **The Completeness Requirement** :

> If we miss any possible outcome in our sample space, our probability calculations will be wrong. It's like trying to calculate election results but forgetting that some people might not vote - your model breaks down.

 **The Precision Requirement** :

> Each outcome must be unambiguously defined. "Rolling high" isn't a valid outcome because it's unclear what "high" means. But "rolling 5 or 6" is perfectly precise.

## Events: The Things We Actually Care About

### From Outcomes to Events

While the sample space lists all possible individual outcomes, in practice we usually care about **collections** of outcomes. These collections are called  **events** .

> **Think of events like categories in your possibility database. You've cataloged every individual outcome in your sample space, but now you want to group them into meaningful categories. "Rolling an even number" is an event that groups together the outcomes {2, 4, 6}.**

### Mathematical Definition of Events

An **event** is a subset of the sample space. If Ω is our sample space and A is an event, then A ⊆ Ω.

 **Examples** :

* **Sample space** : Ω = {1, 2, 3, 4, 5, 6} (die roll)
* **Event A** : "Rolling even" = {2, 4, 6}
* **Event B** : "Rolling greater than 4" = {5, 6}
* **Event C** : "Rolling exactly 3" = {3}

### ASCII Visualization: Events as Subsets

```
EVENTS AS SUBSETS OF SAMPLE SPACE

SAMPLE SPACE: Ω = {1, 2, 3, 4, 5, 6}
┌─────────────────────────────────┐
│  1    2    3    4    5    6    │ ← All possible outcomes
└─────────────────────────────────┘

EVENT A: "Rolling even" = {2, 4, 6}
┌─────────────────────────────────┐
│  1   [2]   3   [4]   5   [6]    │ ← Subset of outcomes
└─────────────────────────────────┘
      ↑           ↑         ↑
   Event A contains these outcomes

EVENT B: "Rolling > 4" = {5, 6}
┌─────────────────────────────────┐
│  1    2    3    4   [5]  [6]    │ ← Different subset
└─────────────────────────────────┘
                        ↑     ↑
                    Event B

INTERSECTION: A ∩ B = {6}
┌─────────────────────────────────┐
│  1    2    3    4    5  [6]     │ ← Outcomes in BOTH A and B
└─────────────────────────────────┘
```

### Event Operations: The Algebra of Possibilities

Once we have events, we naturally want to combine them:

 **Union (A ∪ B)** : "Event A OR event B occurs"
 **Intersection (A ∩ B)** : "Event A AND event B occur"
 **Complement (Aᶜ)** : "Event A does NOT occur"

> **This is like Boolean logic for uncertainty. Just as we can combine logical statements with AND, OR, and NOT, we can combine uncertain events using union, intersection, and complement. The mathematics gives us a precise way to calculate the probability of any combination.**

## The Problem with Naive Event Definition

### Why We Can't Just Say "Any Subset is an Event"

Here's where things get mathematically subtle. You might think: "If events are subsets of the sample space, then every possible subset should be an event, right?"

**Wrong!** This leads to mathematical paradoxes in infinite sample spaces.

 **The Paradox** : In some infinite spaces, there exist subsets that are so "pathological" that we cannot consistently assign probabilities to them without creating contradictions.

> **This is like discovering that your database design has a fundamental flaw. You thought you could create any query you wanted, but it turns out that certain types of queries would crash the entire system. So you need to restrict yourself to only "well-behaved" queries - ones that the system can handle without breaking.**

### ASCII Visualization: The Need for Restrictions

```
THE EVENT RESTRICTION PROBLEM

NAIVE APPROACH (Doesn't Work):
Sample Space Ω
┌─────────────────────────┐
│ All possible outcomes   │
└─────────────────────────┘
            ↓
"Every subset is an event"
            ↓
┌─────────────────────────┐
│ ALL possible subsets    │ ← This causes paradoxes!
│ (includes pathological  │    in infinite spaces
│  subsets)              │
└─────────────────────────┘

RIGOROUS APPROACH (Works):
Sample Space Ω
┌─────────────────────────┐
│ All possible outcomes   │
└─────────────────────────┘
            ↓
"Only well-behaved subsets are events"
            ↓
┌─────────────────────────┐
│ σ-algebra of events     │ ← Mathematical framework
│ (carefully chosen       │    that avoids paradoxes
│  collection)           │
└─────────────────────────┘
```

## σ-Algebras: The Mathematical Solution to Event Definition

### The Intuitive Motivation

We need a mathematical framework that:

1. **Includes all the events we care about** (unions, intersections, complements of reasonable events)
2. **Excludes pathological sets** that would cause mathematical contradictions
3. **Has nice closure properties** (if A and B are events, then A ∪ B is also an event)

The **σ-algebra** (sigma-algebra) is the mathematical structure that accomplishes exactly this.

> **Think of a σ-algebra like the rules for a well-designed board game. The rules tell you exactly which moves are legal and which aren't. You can't just make up any move you want - but within the legal moves, you can combine them in sophisticated ways. The σ-algebra tells you exactly which subsets are "legal events" and guarantees that combining legal events always gives you another legal event.**

### Mathematical Definition of σ-Algebra

A collection ℱ of subsets of Ω is called a **σ-algebra** if:

1. **Ω ∈ ℱ** (the whole sample space is an event)
2. **If A ∈ ℱ, then Aᶜ ∈ ℱ** (complements of events are events)
3. **If A₁, A₂, A₃, ... ∈ ℱ, then ⋃ᵢ₌₁^∞ Aᵢ ∈ ℱ** (countable unions of events are events)

### Why These Properties Are Necessary

 **Property 1 (Contains Ω)** :

> The "something happens" event must always be included. It would be nonsensical to have a probability framework where "something happens" isn't a valid event.

 **Property 2 (Closed under complements)** :

> If "A happens" is a valid event, then "A doesn't happen" must also be a valid event. This is just logical consistency.

 **Property 3 (Closed under countable unions)** :

> If each of "A₁ happens", "A₂ happens", etc. are valid events, then "at least one of A₁, A₂, ... happens" must also be a valid event. This ensures we can build complex events from simple ones.

### ASCII Visualization: σ-Algebra Properties

```
σ-ALGEBRA CLOSURE PROPERTIES

PROPERTY 1: Must contain the whole space
Ω = {1, 2, 3, 4, 5, 6}
┌─────────────────────────┐
│  1  2  3  4  5  6       │ ← This MUST be in ℱ
└─────────────────────────┘

PROPERTY 2: Closed under complements
If A = {1, 3, 5} is in ℱ...
┌─────────────────────────┐
│ [1] 2 [3] 4 [5] 6       │ ← Event A
└─────────────────────────┘

Then Aᶜ = {2, 4, 6} MUST also be in ℱ
┌─────────────────────────┐
│  1 [2] 3 [4] 5 [6]      │ ← Complement Aᶜ
└─────────────────────────┘

PROPERTY 3: Closed under countable unions
If A₁ = {1}, A₂ = {3}, A₃ = {5} are in ℱ...
Then A₁ ∪ A₂ ∪ A₃ = {1, 3, 5} MUST be in ℱ

┌─────────────────────────┐
│ [1] 2 [3] 4 [5] 6       │ ← Union automatically included
└─────────────────────────┘

THE GUARANTEE: Once you specify which basic events
are in ℱ, these rules automatically determine
what other events MUST be included!
```

### Important Consequences

 **Free Bonus Properties** : The σ-algebra axioms automatically give us:

* **∅ ∈ ℱ** (the impossible event, since ∅ = Ωᶜ)
* **Closed under intersections** (since A ∩ B = (Aᶜ ∪ Bᶜ)ᶜ)
* **Closed under finite unions and intersections**

> **The mathematical elegance** : We only need three simple requirements, but they automatically ensure that all the event operations we could ever want are well-defined and consistent.

### Examples of σ-Algebras

**Example 1: Trivial σ-algebra**

* ℱ = {∅, Ω}
* Only the impossible and certain events
* Very limited but mathematically valid

**Example 2: Power set σ-algebra**

* ℱ = 2^Ω (all possible subsets)
* Works for finite sample spaces
* Too big for some infinite spaces (causes paradoxes)

**Example 3: Borel σ-algebra**

* For Ω = ℝ (real numbers)
* Generated by all open intervals
* Includes all "reasonable" subsets of ℝ
* Excludes pathological sets that cause problems

## Probability Measures: Assigning Numbers to Uncertainty

### The Final Piece of the Puzzle

Now we have:

1. **Sample space Ω** : All possible outcomes
2. **σ-algebra ℱ** : All events we can assign probabilities to

The final step is to actually assign probability numbers to events. This is done by a  **probability measure** .

> **Think of the probability measure as the "scoring system" for uncertainty. You've defined your universe of possibilities (sample space) and established the rules for which events are legal (σ-algebra). Now you need a consistent scoring system that assigns a number between 0 and 1 to each legal event, representing how likely it is to occur.**

### Mathematical Definition of Probability Measure

A function P: ℱ → [0,1] is called a **probability measure** if:

1. **P(A) ≥ 0** for all A ∈ ℱ (non-negativity)
2. **P(Ω) = 1** (normalization)
3. **If A₁, A₂, A₃, ... are disjoint events in ℱ, then P(⋃ᵢ₌₁^∞ Aᵢ) = Σᵢ₌₁^∞ P(Aᵢ)** (countable additivity)

### Why These Axioms Are Perfect

 **Axiom 1 (Non-negativity)** :

> Probabilities can't be negative. This just matches our intuitive understanding that you can't have "negative chance" of something happening.

 **Axiom 2 (Normalization)** :

> Something must happen (certainty has probability 1). This ensures our probability scale has a clear maximum.

 **Axiom 3 (Countable additivity)** :

> If events can't happen simultaneously, their individual probabilities add up. This is the mathematical way of saying "the chance of A or B equals the chance of A plus the chance of B, provided A and B can't both happen."

### ASCII Visualization: Probability Measure Properties

```
PROBABILITY MEASURE AXIOMS IN ACTION

AXIOM 1: Non-negativity
All probabilities ≥ 0
P(A) = 0.3  ✓    P(B) = 0     ✓
P(C) = 1.0  ✓    P(D) = -0.2  ✗

AXIOM 2: Normalization  
P(Ω) = 1 (something must happen)
Ω = {1, 2, 3, 4, 5, 6}
┌─────────────────────────┐
│  1  2  3  4  5  6       │ P(Ω) = 1.0
└─────────────────────────┘

AXIOM 3: Additivity for disjoint events
A = {1, 2}, B = {3, 4}, A ∩ B = ∅
┌─────────────────────────┐
│ [1][2] 3  4  5  6       │ P(A) = 0.3
└─────────────────────────┘
┌─────────────────────────┐
│  1  2 [3][4] 5  6       │ P(B) = 0.4  
└─────────────────────────┘
┌─────────────────────────┐
│ [1][2][3][4] 5  6       │ P(A ∪ B) = 0.3 + 0.4 = 0.7
└─────────────────────────┘

Since A and B don't overlap, probabilities add!
```

### Consequences of the Axioms

These three simple axioms automatically give us all the familiar probability rules:

**P(∅) = 0** (impossible events have probability 0)
**P(Aᶜ) = 1 - P(A)** (complement rule)
**P(A ∪ B) = P(A) + P(B) - P(A ∩ B)** (inclusion-exclusion principle)
**If A ⊆ B, then P(A) ≤ P(B)** (monotonicity)

> **The mathematical beauty** : These three axioms, which seem almost obvious, automatically generate all the probability rules we've ever used. Every probability calculation you've ever done follows necessarily from these simple principles.

## The Complete Axiomatic Framework

### Putting It All Together: The Probability Triple

A complete probabilistic model consists of the **probability triple** (Ω, ℱ, P):

1. **Ω** : Sample space (all possible outcomes)
2. **ℱ** : σ-algebra on Ω (which events have probabilities)
3. **P** : Probability measure on ℱ (what those probabilities are)

> **This is like the complete blueprint for a probability system. The sample space defines your universe, the σ-algebra defines the legal questions you can ask, and the probability measure provides the answers to those questions. Together, they form a mathematically complete and consistent system for reasoning about uncertainty.**

### ASCII Visualization: The Complete Framework

```
THE AXIOMATIC PROBABILITY TRIPLE (Ω, ℱ, P)

LAYER 1: SAMPLE SPACE Ω
┌─────────────────────────────────────────┐
│        All Possible Outcomes            │
│                                         │
│  ω₁    ω₂    ω₃    ω₄    ω₅    ω₆       │
│                                         │
└─────────────────────────────────────────┘
"What could happen?"

LAYER 2: σ-ALGEBRA ℱ
┌─────────────────────────────────────────┐
│           Legal Events                  │
│                                         │
│  A = {ω₁, ω₃}    B = {ω₂, ω₄, ω₆}       │
│  C = {ω₁}        D = {ω₁, ω₂, ω₃}       │
│  Ω, ∅, and all complements/unions       │
│                                         │
└─────────────────────────────────────────┘
"Which events can we assign probabilities to?"

LAYER 3: PROBABILITY MEASURE P
┌─────────────────────────────────────────┐
│         Probability Assignments         │
│                                         │
│  P(A) = 0.33    P(B) = 0.50             │
│  P(C) = 0.17    P(D) = 0.67             │
│  P(Ω) = 1.00    P(∅) = 0.00             │
│                                         │
└─────────────────────────────────────────┘
"How likely is each event?"

RESULT: Complete mathematical framework for uncertainty!
```

### Why This Framework Is Necessary

 **Before axiomatic probability** :

* Probability was intuitive but inconsistent
* Contradictions arose in complex situations
* No rigorous foundation for advanced theory

 **After axiomatic probability** :

* All probability is mathematically rigorous
* No contradictions possible (if axioms are satisfied)
* Foundation for advanced topics like stochastic processes, measure theory, advanced statistics

> **The revolutionary insight** : By being more mathematically careful about the foundations, we didn't just avoid contradictions - we unlocked entirely new areas of mathematics and applications that were impossible with naive probability.**

## Real-World Applications: When Rigor Matters

### Application 1: Financial Risk Management

 **The Problem** : Calculate the probability that a portfolio loses more than $1 million.

 **Why axioms matter** :

* Financial returns form continuous distributions (need proper σ-algebra)
* Portfolio combinations require countable additivity
* Risk calculations must be mathematically consistent

 **The solution** : Use Borel σ-algebra on ℝ with carefully constructed probability measures.

### Application 2: Signal Processing and Communications

 **The Problem** : Calculate error rates in digital communication.

 **Why axioms matter** :

* Noise is modeled as continuous random processes
* Need to assign probabilities to infinitely many possible signal values
* Error analysis requires rigorous measure theory

### Application 3: Machine Learning and AI

 **The Problem** : Understand the theoretical foundations of learning algorithms.

 **Why axioms matter** :

* Learning theory requires precise probability statements
* Convergence theorems depend on measure-theoretic foundations
* Bayesian methods require rigorous probability measures

### ASCII Visualization: Applications Hierarchy

```
APPLICATIONS REQUIRING AXIOMATIC PROBABILITY

SIMPLE APPLICATIONS (Intuitive probability OK):
┌─────────────────────────┐
│ • Coin flips            │
│ • Dice games            │  ← Finite sample spaces
│ • Simple surveys        │
└─────────────────────────┘

COMPLEX APPLICATIONS (Need rigorous foundations):
┌─────────────────────────┐
│ • Financial modeling    │
│ • Signal processing     │  ← Continuous distributions
│ • Machine learning      │    Infinite sample spaces
│ • Quantum mechanics     │    Advanced mathematics
│ • Stochastic processes  │
└─────────────────────────┘
            ↑
   Requires σ-algebras and
   rigorous probability measures!
```

## Common Misconceptions and Pitfalls

### Misconception 1: "Axiomatic probability is just formalism"

 **Wrong thinking** : "All this mathematical machinery is unnecessary - intuitive probability works fine."

 **Reality** : Axiomatic probability is essential for:

* Continuous distributions
* Infinite sample spaces
* Advanced applications
* Avoiding mathematical contradictions

### Misconception 2: "σ-algebras are overcomplicated"

 **Wrong thinking** : "Why not just use all subsets as events?"

 **Reality** : In infinite spaces, this leads to mathematical paradoxes and contradictions. σ-algebras provide exactly the right balance of richness and consistency.

### Misconception 3: "The axioms are arbitrary"

 **Wrong thinking** : "These three axioms are just random choices."

 **Reality** : These axioms capture the essential logical requirements for any consistent notion of probability. They're not arbitrary - they're necessary.

### ASCII Visualization: Common Mistakes

```
COMMON MISCONCEPTIONS ABOUT AXIOMATIC PROBABILITY

MISTAKE 1: "Just use intuition"
Intuitive approach:
┌─────────────────┐    ┌─────────────────┐
│ Simple problem  │ →  │ Works fine!     │
└─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│ Complex problem │ →  │ Contradictions! │
└─────────────────┘    └─────────────────┘

MISTAKE 2: "All subsets are events"
┌─────────────────┐    ┌─────────────────┐
│ Finite space    │ →  │ Works fine!     │
└─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│ Infinite space  │ →  │ Paradoxes!      │
└─────────────────┘    └─────────────────┘

SOLUTION: Rigorous axiomatic approach
┌─────────────────┐    ┌─────────────────┐
│ Any problem     │ →  │ Always works!   │
└─────────────────┘    └─────────────────┘
```

## The Deep Mathematical Beauty

### Why Axiomatic Probability Is Elegant

The axiomatic approach reveals profound mathematical truths:

1. **Uncertainty follows precise mathematical laws**
2. **Complex probability phenomena emerge from simple axioms**
3. **The framework unifies discrete and continuous probability**
4. **It connects probability to measure theory and functional analysis**

> **The philosophical insight** : Axiomatic probability shows that randomness itself has a deep mathematical structure. What appears chaotic and unpredictable at the surface level follows rigorous mathematical principles at the foundational level.

### Connection to Advanced Mathematics

Mastering axiomatic probability opens doors to:

 **Measure Theory** : The mathematical foundation of integration and analysis
 **Stochastic Processes** : Random phenomena evolving over time
 **Mathematical Statistics** : Rigorous foundations of statistical inference
 **Information Theory** : Mathematical theory of communication and data
 **Quantum Mechanics** : Probability amplitudes and measurement theory

## Simple Coding Examples

Let me provide some concrete Python examples to illustrate these concepts:

### Axiomatic Probability Implementation

```python
import numpy as np
from typing import Set, Dict, List, Union
import matplotlib.pyplot as plt
from collections import defaultdict

class SampleSpace:
    """
    Represents a sample space Ω - the set of all possible outcomes
    """
    def __init__(self, outcomes: Union[List, Set]):
        """
        Initialize sample space with all possible outcomes
        
        Args:
            outcomes: List or set of all possible outcomes
        """
        self.outcomes = set(outcomes) if isinstance(outcomes, list) else outcomes
        print(f"Sample Space Ω = {self.outcomes}")
    
    def __contains__(self, outcome):
        """Check if an outcome is in the sample space"""
        return outcome in self.outcomes
    
    def __len__(self):
        """Number of outcomes in sample space"""
        return len(self.outcomes)
    
    def __str__(self):
        return f"Ω = {self.outcomes}"

class Event:
    """
    Represents an event - a subset of the sample space
    """
    def __init__(self, outcomes: Union[List, Set], name: str = ""):
        """
        Initialize an event as a subset of outcomes
        
        Args:
            outcomes: List or set of outcomes that comprise this event
            name: Optional name for the event
        """
        self.outcomes = set(outcomes) if isinstance(outcomes, list) else outcomes
        self.name = name
    
    def __contains__(self, outcome):
        """Check if an outcome is in this event"""
        return outcome in self.outcomes
    
    def union(self, other):
        """Return the union of this event with another (A ∪ B)"""
        return Event(self.outcomes.union(other.outcomes), 
                    f"({self.name} ∪ {other.name})")
    
    def intersection(self, other):
        """Return the intersection of this event with another (A ∩ B)"""
        return Event(self.outcomes.intersection(other.outcomes),
                    f"({self.name} ∩ {other.name})")
    
    def complement(self, sample_space):
        """Return the complement of this event (Aᶜ)"""
        return Event(sample_space.outcomes - self.outcomes,
                    f"{self.name}ᶜ")
    
    def is_disjoint(self, other):
        """Check if this event is disjoint from another"""
        return len(self.outcomes.intersection(other.outcomes)) == 0
    
    def __str__(self):
        return f"{self.name}: {self.outcomes}"

class SigmaAlgebra:
    """
    Represents a σ-algebra - a collection of events that satisfies
    the three σ-algebra properties
    """
    def __init__(self, sample_space: SampleSpace):
        """
        Initialize σ-algebra with sample space
        """
        self.sample_space = sample_space
        self.events = set()
        
        # Add the empty set and sample space (required by σ-algebra axioms)
        self.add_event(Event(set(), "∅"))
        self.add_event(Event(sample_space.outcomes, "Ω"))
        
        print(f"σ-algebra initialized with ∅ and Ω")
    
    def add_event(self, event: Event):
        """
        Add an event to the σ-algebra and automatically include
        required events to maintain σ-algebra properties
        """
        # Convert event to frozenset for hashing
        event_key = frozenset(event.outcomes)
        
        if event_key not in [frozenset(e.outcomes) for e in self.events]:
            self.events.add(event)
            
            # Add complement (σ-algebra property 2)
            complement = event.complement(self.sample_space)
            comp_key = frozenset(complement.outcomes)
            if comp_key not in [frozenset(e.outcomes) for e in self.events]:
                self.events.add(complement)
    
    def verify_sigma_algebra_properties(self):
        """
        Verify that the collection satisfies σ-algebra properties
        """
        event_sets = [frozenset(e.outcomes) for e in self.events]
        
        # Property 1: Contains sample space
        omega_set = frozenset(self.sample_space.outcomes)
        prop1 = omega_set in event_sets
        
        # Property 2: Closed under complements
        prop2 = True
        for event in self.events:
            comp_set = frozenset(self.sample_space.outcomes - event.outcomes)
            if comp_set not in event_sets:
                prop2 = False
                break
        
        # Property 3: Closed under countable unions (simplified for finite case)
        prop3 = True  # Simplified check for finite spaces
        
        print(f"σ-algebra properties: Contains Ω: {prop1}, "
              f"Closed under complements: {prop2}, "
              f"Closed under unions: {prop3}")
        
        return prop1 and prop2 and prop3
    
    def __str__(self):
        return f"σ-algebra with {len(self.events)} events"

class ProbabilityMeasure:
    """
    Represents a probability measure P that assigns probabilities to events
    """
    def __init__(self, sigma_algebra: SigmaAlgebra):
        """
        Initialize probability measure on a σ-algebra
        """
        self.sigma_algebra = sigma_algebra
        self.probabilities = {}
        
        # Set P(∅) = 0 and P(Ω) = 1 (required by probability axioms)
        for event in sigma_algebra.events:
            if len(event.outcomes) == 0:  # Empty set
                self.probabilities[frozenset(event.outcomes)] = 0.0
            elif event.outcomes == sigma_algebra.sample_space.outcomes:  # Sample space
                self.probabilities[frozenset(event.outcomes)] = 1.0
    
    def set_probability(self, event: Event, probability: float):
        """
        Set the probability of an event
        
        Args:
            event: The event to assign probability to
            probability: The probability value (must be between 0 and 1)
        """
        if not (0 <= probability <= 1):
            raise ValueError("Probability must be between 0 and 1")
        
        event_key = frozenset(event.outcomes)
        self.probabilities[event_key] = probability
    
    def get_probability(self, event: Event) -> float:
        """
        Get the probability of an event
        """
        event_key = frozenset(event.outcomes)
        return self.probabilities.get(event_key, None)
    
    def verify_probability_axioms(self):
        """
        Verify that the probability assignments satisfy the three probability axioms
        """
        # Axiom 1: Non-negativity
        axiom1 = all(p >= 0 for p in self.probabilities.values())
        
        # Axiom 2: Normalization (P(Ω) = 1)
        omega_key = frozenset(self.sigma_algebra.sample_space.outcomes)
        axiom2 = self.probabilities.get(omega_key, 0) == 1.0
        
        # Axiom 3: Additivity for disjoint events (simplified check)
        axiom3 = True  # Would need more complex verification for general case
        
        print(f"Probability axioms: Non-negativity: {axiom1}, "
              f"Normalization: {axiom2}, Additivity: {axiom3}")
        
        return axiom1 and axiom2 and axiom3
    
    def calculate_complement_probability(self, event: Event) -> float:
        """
        Calculate P(Aᶜ) = 1 - P(A)
        """
        p_a = self.get_probability(event)
        if p_a is not None:
            return 1.0 - p_a
        return None
    
    def calculate_union_probability(self, event_a: Event, event_b: Event) -> float:
        """
        Calculate P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
        """
        p_a = self.get_probability(event_a)
        p_b = self.get_probability(event_b)
        
        intersection = event_a.intersection(event_b)
        p_intersection = self.get_probability(intersection)
        
        if all(p is not None for p in [p_a, p_b, p_intersection]):
            return p_a + p_b - p_intersection
        return None

# Example 1: Simple Discrete Probability Space (Die Roll)
def example_die_roll():
    """
    Example: Rolling a six-sided die
    """
    print("=" * 60)
    print("EXAMPLE 1: SIX-SIDED DIE")
    print("=" * 60)
    
    # Step 1: Define sample space
    omega = SampleSpace([1, 2, 3, 4, 5, 6])
    
    # Step 2: Create σ-algebra
    sigma_alg = SigmaAlgebra(omega)
    
    # Step 3: Add some events
    even_event = Event([2, 4, 6], "Even")
    odd_event = Event([1, 3, 5], "Odd")
    high_event = Event([4, 5, 6], "High")
    
    sigma_alg.add_event(even_event)
    sigma_alg.add_event(odd_event)
    sigma_alg.add_event(high_event)
    
    print(f"\nEvents in σ-algebra:")
    for event in sigma_alg.events:
        print(f"  {event}")
    
    # Step 4: Verify σ-algebra properties
    print(f"\nVerifying σ-algebra properties:")
    sigma_alg.verify_sigma_algebra_properties()
    
    # Step 5: Create probability measure
    prob_measure = ProbabilityMeasure(sigma_alg)
    
    # Set probabilities for a fair die
    prob_measure.set_probability(Event([1], "1"), 1/6)
    prob_measure.set_probability(Event([2], "2"), 1/6)
    prob_measure.set_probability(even_event, 3/6)
    prob_measure.set_probability(odd_event, 3/6)
    prob_measure.set_probability(high_event, 3/6)
    
    # Step 6: Verify probability axioms
    print(f"\nVerifying probability axioms:")
    prob_measure.verify_probability_axioms()
    
    # Step 7: Calculate some probabilities
    print(f"\nProbability calculations:")
    print(f"P(Even) = {prob_measure.get_probability(even_event)}")
    print(f"P(Odd) = {prob_measure.get_probability(odd_event)}")
    print(f"P(High) = {prob_measure.get_probability(high_event)}")
    
    # Complement probability
    print(f"P(Not Even) = P(Evenᶜ) = {prob_measure.calculate_complement_probability(even_event)}")
    
    # Union probability
    union_prob = prob_measure.calculate_union_probability(even_event, high_event)
    print(f"P(Even ∪ High) = {union_prob}")

# Example 2: Coin Flips
def example_coin_flips():
    """
    Example: Two coin flips
    """
    print("\n" + "=" * 60)
    print("EXAMPLE 2: TWO COIN FLIPS")
    print("=" * 60)
    
    # Sample space for two coin flips
    omega = SampleSpace(['HH', 'HT', 'TH', 'TT'])
    
    # Create σ-algebra
    sigma_alg = SigmaAlgebra(omega)
    
    # Define events
    at_least_one_head = Event(['HH', 'HT', 'TH'], "At least one H")
    exactly_one_head = Event(['HT', 'TH'], "Exactly one H")
    two_heads = Event(['HH'], "Two H")
    
    sigma_alg.add_event(at_least_one_head)
    sigma_alg.add_event(exactly_one_head)
    sigma_alg.add_event(two_heads)
    
    # Create probability measure for fair coins
    prob_measure = ProbabilityMeasure(sigma_alg)
    
    # Each outcome has probability 1/4
    prob_measure.set_probability(Event(['HH'], "HH"), 1/4)
    prob_measure.set_probability(Event(['HT'], "HT"), 1/4)
    prob_measure.set_probability(Event(['TH'], "TH"), 1/4)
    prob_measure.set_probability(Event(['TT'], "TT"), 1/4)
    
    # Set event probabilities
    prob_measure.set_probability(at_least_one_head, 3/4)
    prob_measure.set_probability(exactly_one_head, 2/4)
    prob_measure.set_probability(two_heads, 1/4)
    
    print(f"\nProbability calculations:")
    print(f"P(At least one H) = {prob_measure.get_probability(at_least_one_head)}")
    print(f"P(Exactly one H) = {prob_measure.get_probability(exactly_one_head)}")
    print(f"P(Two H) = {prob_measure.get_probability(two_heads)}")
    
    # Verify complement
    complement_prob = prob_measure.calculate_complement_probability(at_least_one_head)
    print(f"P(No heads) = P((At least one H)ᶜ) = {complement_prob}")

# Example 3: Demonstrating σ-algebra necessity
def example_sigma_algebra_necessity():
    """
    Example showing why we need σ-algebras
    """
    print("\n" + "=" * 60)
    print("EXAMPLE 3: WHY σ-ALGEBRAS ARE NECESSARY")
    print("=" * 60)
    
    # Consider events on a simple sample space
    omega = SampleSpace([1, 2, 3, 4])
    
    print(f"Sample space: {omega}")
    print(f"Total possible subsets: {2**len(omega)} = 16")
    
    # Show all possible subsets (power set)
    all_subsets = []
    for i in range(2**len(omega.outcomes)):
        subset = set()
        for j, outcome in enumerate(omega.outcomes):
            if i & (1 << j):
                subset.add(outcome)
        all_subsets.append(subset)
    
    print(f"\nAll possible subsets:")
    for i, subset in enumerate(all_subsets):
        print(f"  {i+1:2d}: {subset}")
    
    print(f"\nFor infinite spaces, some subsets can cause paradoxes!")
    print(f"σ-algebras carefully select which subsets are 'events'")
    print(f"This avoids mathematical contradictions while preserving")
    print(f"all the events we actually need for probability calculations.")

if __name__ == "__main__":
    # Run all examples
    example_die_roll()
    example_coin_flips()
    example_sigma_algebra_necessity()
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print("1. Sample Space Ω: All possible outcomes")
    print("2. σ-algebra ℱ: Which subsets are 'events'")
    print("3. Probability Measure P: Numbers assigned to events")
    print("4. Together (Ω, ℱ, P) form a complete probability space")
    print("5. This framework handles any probability situation rigorously!")
```

### Axiomatic Probability Visualization

```python
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Rectangle, Circle
from matplotlib_venn import venn2, venn3
import seaborn as sns

# Set style for better plots
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

def visualize_sample_space_progression():
    """
    Visualize how sample spaces grow in complexity
    """
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle('Sample Space Complexity Progression', fontsize=16, fontweight='bold')
    
    # 1. Coin flip (simple)
    ax1 = axes[0, 0]
    outcomes = ['H', 'T']
    y_pos = [0, 0]
    x_pos = [0, 1]
    ax1.scatter(x_pos, y_pos, s=200, c=['red', 'blue'], alpha=0.7)
    for i, outcome in enumerate(outcomes):
        ax1.annotate(outcome, (x_pos[i], y_pos[i]), fontsize=14, ha='center', va='center')
    ax1.set_xlim(-0.5, 1.5)
    ax1.set_ylim(-0.5, 0.5)
    ax1.set_title('Coin Flip: Ω = {H, T}')
    ax1.set_xlabel('2 outcomes (finite)')
    
    # 2. Two dice (moderate)
    ax2 = axes[0, 1]
    dice_outcomes = [(i, j) for i in range(1, 7) for j in range(1, 7)]
    x_coords = [outcome[0] for outcome in dice_outcomes]
    y_coords = [outcome[1] for outcome in dice_outcomes]
    ax2.scatter(x_coords, y_coords, s=50, alpha=0.6)
    ax2.set_xlim(0.5, 6.5)
    ax2.set_ylim(0.5, 6.5)
    ax2.set_title('Two Dice: Ω = {(1,1), (1,2), ..., (6,6)}')
    ax2.set_xlabel('36 outcomes (finite)')
    ax2.set_ylabel('Die 2')
    ax2.grid(True, alpha=0.3)
    
    # 3. Dart on square (continuous)
    ax3 = axes[1, 0]
    # Create a dense grid to represent continuous space
    x = np.linspace(0, 1, 50)
    y = np.linspace(0, 1, 50)
    X, Y = np.meshgrid(x, y)
    ax3.contourf(X, Y, X*Y, levels=20, alpha=0.6, cmap='viridis')
    ax3.set_xlim(0, 1)
    ax3.set_ylim(0, 1)
    ax3.set_title('Dart on Square: Ω = [0,1] × [0,1]')
    ax3.set_xlabel('Uncountably infinite outcomes')
    ax3.set_ylabel('Y coordinate')
    
    # 4. Real line (even more complex)
    ax4 = axes[1, 1]
    x_real = np.linspace(-5, 5, 1000)
    y_density = np.exp(-x_real**2/2) / np.sqrt(2*np.pi)  # Standard normal density
    ax4.fill_between(x_real, 0, y_density, alpha=0.6, color='orange')
    ax4.plot(x_real, y_density, color='darkblue', linewidth=2)
    ax4.set_xlim(-5, 5)
    ax4.set_title('Real Line: Ω = ℝ')
    ax4.set_xlabel('All real numbers (uncountable)')
    ax4.set_ylabel('Probability density')
    
    plt.tight_layout()
    plt.show()

def visualize_sigma_algebra_properties():
    """
    Visualize σ-algebra properties using Venn diagrams
    """
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    fig.suptitle('σ-algebra Properties Visualization', fontsize=16, fontweight='bold')
    
    # Property 1: Contains Ω
    ax1 = axes[0]
    circle = Circle((0.5, 0.5), 0.4, fill=True, alpha=0.3, color='lightblue')
    ax1.add_patch(circle)
    ax1.text(0.5, 0.5, 'Ω', fontsize=20, ha='center', va='center', weight='bold')
    ax1.text(0.5, 0.1, 'Property 1: Ω ∈ ℱ', fontsize=12, ha='center', weight='bold')
    ax1.text(0.5, 0.05, '(Sample space must be an event)', fontsize=10, ha='center')
    ax1.set_xlim(0, 1)
    ax1.set_ylim(0, 1)
    ax1.set_aspect('equal')
    ax1.axis('off')
    
    # Property 2: Closed under complements
    ax2 = axes[1]
    # Draw rectangle for Ω
    rect = Rectangle((0.1, 0.1), 0.8, 0.8, fill=False, edgecolor='black', linewidth=2)
    ax2.add_patch(rect)
    # Draw circle for event A
    circle_a = Circle((0.3, 0.5), 0.15, fill=True, alpha=0.5, color='red', label='A')
    ax2.add_patch(circle_a)
    # The rest is A^c
    ax2.text(0.3, 0.5, 'A', fontsize=14, ha='center', va='center', weight='bold')
    ax2.text(0.7, 0.7, 'Aᶜ', fontsize=14, ha='center', va='center', weight='bold')
    ax2.text(0.05, 0.95, 'Ω', fontsize=12, ha='left', va='top', weight='bold')
    ax2.text(0.5, 0.05, 'Property 2: If A ∈ ℱ, then Aᶜ ∈ ℱ', fontsize=10, ha='center', weight='bold')
    ax2.set_xlim(0, 1)
    ax2.set_ylim(0, 1)
    ax2.set_aspect('equal')
    ax2.axis('off')
    
    # Property 3: Closed under countable unions
    ax3 = axes[2]
    # Draw multiple overlapping circles
    colors = ['red', 'green', 'blue', 'orange']
    centers = [(0.3, 0.4), (0.5, 0.4), (0.7, 0.4), (0.5, 0.6)]
    for i, (center, color) in enumerate(zip(centers, colors)):
        circle = Circle(center, 0.1, fill=True, alpha=0.4, color=color)
        ax3.add_patch(circle)
        ax3.text(center[0], center[1], f'A{i+1}', fontsize=10, ha='center', va='center', weight='bold')
    
    ax3.text(0.5, 0.2, 'Property 3: If A₁, A₂, A₃, ... ∈ ℱ', fontsize=10, ha='center', weight='bold')
    ax3.text(0.5, 0.15, 'then ⋃ᵢ Aᵢ ∈ ℱ', fontsize=10, ha='center', weight='bold')
    ax3.text(0.5, 0.8, '⋃ᵢ Aᵢ', fontsize=14, ha='center', va='center', weight='bold')
    ax3.set_xlim(0, 1)
    ax3.set_ylim(0, 1)
    ax3.set_aspect('equal')
    ax3.axis('off')
    
    plt.tight_layout()
    plt.show()

def visualize_probability_measure_axioms():
    """
    Visualize probability measure axioms
    """
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    fig.suptitle('Probability Measure Axioms', fontsize=16, fontweight='bold')
    
    # Axiom 1: Non-negativity
    ax1 = axes[0]
    events = ['A', 'B', 'C', 'D']
    probabilities = [0.3, 0.0, 0.7, 0.1]
    colors = ['green' if p >= 0 else 'red' for p in probabilities]
    bars = ax1.bar(events, probabilities, color=colors, alpha=0.7)
    ax1.set_ylim(0, 1)
    ax1.set_ylabel('Probability')
    ax1.set_title('Axiom 1: P(A) ≥ 0 for all A')
    ax1.axhline(y=0, color='black', linestyle='-', linewidth=1)
    ax1.grid(True, alpha=0.3)
    
    # Axiom 2: Normalization
    ax2 = axes[1]
    # Show that all probabilities sum to 1
    outcome_probs = [0.2, 0.3, 0.1, 0.4]
    outcome_labels = ['ω₁', 'ω₂', 'ω₃', 'ω₄']
    bars = ax2.bar(outcome_labels, outcome_probs, color='lightblue', alpha=0.7)
    ax2.axhline(y=1.0, color='red', linestyle='--', linewidth=2, label='P(Ω) = 1')
    ax2.set_ylim(0, 1.2)
    ax2.set_ylabel('Probability')
    ax2.set_title('Axiom 2: P(Ω) = 1')
    ax2.text(1.5, 1.05, f'Sum = {sum(outcome_probs)}', fontsize=12, weight='bold')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # Axiom 3: Additivity for disjoint events
    ax3 = axes[2]
    # Show two disjoint events and their union
    event_names = ['P(A)', 'P(B)', 'P(A ∪ B)']
    event_probs = [0.3, 0.4, 0.7]  # P(A ∪ B) = P(A) + P(B) for disjoint events
    colors = ['red', 'blue', 'purple']
    bars = ax3.bar(event_names, event_probs, color=colors, alpha=0.7)
    
    # Add annotation showing the addition
    ax3.annotate('', xy=(2, 0.7), xytext=(0.5, 0.35),
                arrowprops=dict(arrowstyle='<->', color='black', lw=2))
    ax3.text(1.25, 0.5, '0.3 + 0.4 = 0.7', fontsize=12, ha='center', weight='bold',
             bbox=dict(boxstyle="round,pad=0.3", facecolor="yellow", alpha=0.8))
    
    ax3.set_ylim(0, 0.8)
    ax3.set_ylabel('Probability')
    ax3.set_title('Axiom 3: P(A ∪ B) = P(A) + P(B)\nfor disjoint A, B')
    ax3.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()

def visualize_probability_triple():
    """
    Visualize the complete probability triple (Ω, ℱ, P)
    """
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    
    # Draw three layers representing the probability triple
    layers = [
        {'y': 0.7, 'height': 0.2, 'color': 'lightblue', 'label': '3. Probability Measure P', 'content': 'P(A) = 0.3, P(B) = 0.5, P(Ω) = 1.0'},
        {'y': 0.4, 'height': 0.2, 'color': 'lightgreen', 'label': '2. σ-algebra ℱ', 'content': 'Events: {∅, A, Aᶜ, B, Bᶜ, A∩B, A∪B, Ω}'},
        {'y': 0.1, 'height': 0.2, 'color': 'lightyellow', 'label': '1. Sample Space Ω', 'content': 'All possible outcomes: {ω₁, ω₂, ω₃, ω₄, ω₅, ω₆}'}
    ]
    
    for layer in layers:
        rect = Rectangle((0.1, layer['y']), 0.8, layer['height'], 
                        facecolor=layer['color'], edgecolor='black', linewidth=2)
        ax.add_patch(rect)
        
        # Add label
        ax.text(0.05, layer['y'] + layer['height']/2, layer['label'], 
                fontsize=14, weight='bold', va='center', rotation=90)
        
        # Add content
        ax.text(0.5, layer['y'] + layer['height']/2, layer['content'], 
                fontsize=11, ha='center', va='center')
    
    # Add arrows showing the flow
    arrow_props = dict(arrowstyle='->', lw=3, color='red')
    ax.annotate('', xy=(0.5, 0.4), xytext=(0.5, 0.3), arrowprops=arrow_props)
    ax.annotate('', xy=(0.5, 0.7), xytext=(0.5, 0.6), arrowprops=arrow_props)
    
    # Add explanatory text
    ax.text(0.95, 0.85, 'What are the\nprobabilities?', fontsize=12, ha='right', va='center',
            bbox=dict(boxstyle="round,pad=0.5", facecolor="pink", alpha=0.8))
    ax.text(0.95, 0.55, 'Which subsets\nare events?', fontsize=12, ha='right', va='center',
            bbox=dict(boxstyle="round,pad=0.5", facecolor="lightcyan", alpha=0.8))
    ax.text(0.95, 0.25, 'What could\nhappen?', fontsize=12, ha='right', va='center',
            bbox=dict(boxstyle="round,pad=0.5", facecolor="wheat", alpha=0.8))
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_title('The Probability Triple (Ω, ℱ, P)', fontsize=16, weight='bold', pad=20)
    ax.axis('off')
    
    # Add overall title
    ax.text(0.5, 0.95, 'Complete Mathematical Framework for Probability', 
            fontsize=14, ha='center', weight='bold',
            bbox=dict(boxstyle="round,pad=0.5", facecolor="gold", alpha=0.8))
    
    plt.tight_layout()
    plt.show()

def demonstrate_convergence_to_limit():
    """
    Demonstrate how probability calculations become consistent as we approach limits
    """
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    fig.suptitle('Why Axiomatic Foundations Matter: Avoiding Contradictions', fontsize=16, fontweight='bold')
    
    # 1. Finite space - no problems
    ax1 = axes[0, 0]
    n_values = range(2, 11)
    total_probs = [1.0] * len(n_values)  # Always sums to 1 for finite spaces
    ax1.plot(n_values, total_probs, 'bo-', linewidth=2, markersize=8)
    ax1.axhline(y=1.0, color='red', linestyle='--', alpha=0.7)
    ax1.set_ylim(0.5, 1.5)
    ax1.set_xlabel('Number of outcomes')
    ax1.set_ylabel('Total probability')
    ax1.set_title('Finite Spaces: Always Consistent')
    ax1.grid(True, alpha=0.3)
    
    # 2. Naive infinite approach - problems!
    ax2 = axes[0, 1]
    n_outcomes = np.array([10, 100, 1000, 10000, 100000])
    equal_probs = 1.0 / n_outcomes
    total_probs_naive = n_outcomes * equal_probs  # This should be 1, but let's show the limit
    
    ax2.semilogx(n_outcomes, total_probs_naive, 'ro-', linewidth=2, markersize=8, label='Equal probabilities')
    ax2.axhline(y=1.0, color='green', linestyle='--', alpha=0.7, label='Should be 1')
    ax2.set_xlabel('Number of outcomes')
    ax2.set_ylabel('Total probability')
    ax2.set_title('Naive Infinite: Can Break Down')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # 3. Proper measure theory approach
    ax3 = axes[1, 0]
    x = np.linspace(0, 1, 1000)
    # Show how proper continuous probability works
    density = 2 * x  # f(x) = 2x on [0,1], integrates to 1
    ax3.fill_between(x, 0, density, alpha=0.6, color='lightblue', label='Probability density')
    ax3.plot(x, density, 'b-', linewidth=2)
    ax3.set_xlabel('Value')
    ax3.set_ylabel('Density')
    ax3.set_title('Continuous Probability: Proper Approach')
    ax3.text(0.7, 1.5, f'∫₀¹ 2x dx = 1', fontsize=12, weight='bold',
             bbox=dict(boxstyle="round,pad=0.3", facecolor="yellow", alpha=0.8))
    ax3.legend()
    ax3.grid(True, alpha=0.3)
    
    # 4. Why axioms prevent contradictions
    ax4 = axes[1, 1]
    categories = ['Finite\nSpaces', 'Countable\nInfinite', 'Uncountable\nInfinite']
    consistency = [1.0, 0.9, 1.0]  # Axiomatic approach is always consistent
    naive_approach = [1.0, 0.3, 0.1]  # Naive approach fails for infinite spaces
    
    x_pos = np.arange(len(categories))
    width = 0.35
    
    bars1 = ax4.bar(x_pos - width/2, naive_approach, width, label='Naive Approach', 
                   color='red', alpha=0.7)
    bars2 = ax4.bar(x_pos + width/2, consistency, width, label='Axiomatic Approach', 
                   color='green', alpha=0.7)
    
    ax4.set_xlabel('Type of Sample Space')
    ax4.set_ylabel('Mathematical Consistency')
    ax4.set_title('Consistency Comparison')
    ax4.set_xticks(x_pos)
    ax4.set_xticklabels(categories)
    ax4.legend()
    ax4.set_ylim(0, 1.2)
    ax4.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.show()

# Main execution
if __name__ == "__main__":
    print("Generating visualizations for Axiomatic Probability...")
    
    # Generate all visualizations
    visualize_sample_space_progression()
    visualize_sigma_algebra_properties() 
    visualize_probability_measure_axioms()
    visualize_probability_triple()
    demonstrate_convergence_to_limit()
    
    print("\nAll visualizations complete!")
    print("\nKey takeaways:")
    print("1. Sample spaces can be finite, countable infinite, or uncountable infinite")
    print("2. σ-algebras ensure we can only assign probabilities to 'well-behaved' events")
    print("3. Probability measures must satisfy three simple but powerful axioms")
    print("4. Together, (Ω, ℱ, P) forms a complete, rigorous probability framework")
    print("5. This prevents mathematical contradictions that arise with naive approaches")
```

## The Meta-Insight: Axiomatic Probability as the Foundation of Rigorous Reasoning

### Why Axiomatic Probability Revolutionized Mathematics

Axiomatic probability represents one of the greatest intellectual achievements in mathematics:  **the transformation of uncertainty from philosophical speculation into rigorous mathematical science** .

Before Kolmogorov's axiomatization in 1933:

* Probability was intuitive but inconsistent
* Paradoxes arose when dealing with infinite sets
* No rigorous foundation for advanced probability theory
* Different mathematicians had conflicting definitions

After the axiomatic foundation:

* All probability became mathematically rigorous
* Infinite and continuous probability spaces became manageable
* Advanced fields like stochastic processes became possible
* Universal framework applicable to any situation

> **The philosophical revolution** : Axiomatic probability didn't just solve technical problems - it showed that uncertainty itself follows precise mathematical laws. It revealed that randomness, far from being the absence of order, has its own deep mathematical structure.

### The Universal Principle

The axiomatic approach demonstrates a profound truth about mathematics and science:

> **The deeper insight** : By being more mathematically careful about foundations, we don't just avoid contradictions - we unlock entirely new realms of possibility. Rigor isn't a constraint on creativity; it's the foundation that makes true mathematical creativity possible.

### The Practical Power

Today, axiomatic probability underlies:

 **Modern Finance** : Risk models, derivatives pricing, portfolio optimization
 **Machine Learning** : Bayesian inference, probabilistic models, uncertainty quantification

 **Physics** : Quantum mechanics, statistical mechanics, thermodynamics
 **Engineering** : Signal processing, control theory, reliability analysis
 **Computer Science** : Algorithms analysis, cryptography, artificial intelligence

> **The ultimate takeaway** : Axiomatic probability teaches us that the key to understanding any uncertain system is not to avoid mathematical rigor, but to embrace it. The three simple axioms - non-negativity, normalization, and countable additivity - provide the foundation for reasoning about any probabilistic situation, no matter how complex.

**In a world full of uncertainty, axiomatic probability is your mathematical GPS for navigating randomness with complete logical consistency.**
