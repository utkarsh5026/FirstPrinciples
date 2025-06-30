# Bayes' Theorem: The Mathematics of Rational Belief Update

## The Fundamental "Why": The Diagnostic Problem

Imagine you're a detective at a crime scene. You find a muddy footprint. Your suspect claims they were at home all evening, but you know that 90% of people who walked through that muddy area would have similar footprints.

Here's the crucial question: **Given that you found this evidence (muddy footprint), what's the probability your suspect is guilty?**

Most people instinctively want to say "90%" - but that's backwards! You know the probability of the evidence given guilt, but you need the probability of guilt given the evidence.

> **The key insight here is**: Bayes' theorem solves the fundamental problem of "flipping" conditional probabilities. It lets us go from "If the hypothesis is true, how likely is this evidence?" to "Given this evidence, how likely is the hypothesis?"

## The Diagnostic Reversal Problem

### Why We Need to "Flip" Probabilities

In most real-world situations, we observe evidence and want to know about causes. But our knowledge naturally flows the other way - from causes to effects.

**What we naturally know**:
- P(Symptoms | Disease) - "If someone has the flu, they'll likely have a fever"
- P(Evidence | Hypothesis) - "If it rained, the ground will be wet"
- P(Test Result | Condition) - "If the machine is broken, the test will fail"

**What we actually need**:
- P(Disease | Symptoms) - "Given this fever, do I have the flu?"
- P(Hypothesis | Evidence) - "Given wet ground, did it rain?"
- P(Condition | Test Result) - "Given the test failed, is the machine broken?"

> **This is like the difference between a recipe and reverse-engineering a dish. We know how to cook from ingredients to final product, but when we taste something delicious, we want to figure out what ingredients were used.**

### ASCII Visualization: The Direction Problem

```
THE BAYES' THEOREM DIRECTION PROBLEM

NATURAL KNOWLEDGE FLOW (Cause → Effect)
┌─────────────┐    P(E|H)     ┌─────────────┐
│ HYPOTHESIS  │ ───────────▶  │  EVIDENCE   │
│ (Cause)     │    Easy to    │ (Effect)    │
│             │    know       │             │
└─────────────┘               └─────────────┘

PRACTICAL NEED (Effect → Cause)
┌─────────────┐    P(H|E)     ┌─────────────┐
│ HYPOTHESIS  │ ◀─────────────  │  EVIDENCE   │
│ (Cause)     │    Need to    │ (Effect)    │
│             │    calculate  │             │
└─────────────┘               └─────────────┘

BAYES' THEOREM IS THE BRIDGE!
```

> **The fundamental necessity**: Bayes' theorem isn't just a mathematical curiosity - it's the only logically consistent way to update beliefs when you observe evidence. Without it, we'd be stuck knowing how diseases cause symptoms but unable to diagnose from symptoms.

## Deriving Bayes' Theorem: Building from First Principles

### Step 1: Starting with Conditional Probability

We know from conditional probability that:
- **P(A|B) = P(A and B) / P(B)**
- **P(B|A) = P(A and B) / P(A)**

Both equations contain P(A and B), so we can set them equal:
- **P(A|B) × P(B) = P(A and B) = P(B|A) × P(A)**

### Step 2: Solving for the "Flipped" Probability

Rearranging to solve for P(A|B):
**P(A|B) = [P(B|A) × P(A)] / P(B)**

### Step 3: Translating to Hypothesis-Evidence Language

Replacing A with H (hypothesis) and B with E (evidence):

**P(H|E) = [P(E|H) × P(H)] / P(E)**

> **The beautiful logic**: This derivation shows that Bayes' theorem isn't imposed from outside - it emerges inevitably from the basic rules of probability. It's the unique logical way to "flip" conditional probabilities.

### ASCII Visualization: The Algebraic Derivation

```
DERIVING BAYES' THEOREM

STEP 1: Basic conditional probability definitions
P(H|E) = P(H and E) / P(E)
P(E|H) = P(H and E) / P(H)

STEP 2: Both equal P(H and E), so we can connect them
P(H|E) × P(E) = P(H and E) = P(E|H) × P(H)

STEP 3: Solve for what we want
┌─────────────────────────────────────────────┐
│         P(E|H) × P(H)                       │
│ P(H|E) = ───────────────                    │
│             P(E)                            │
└─────────────────────────────────────────────┘
           ▲         ▲        ▲
      Likelihood  Prior   Evidence
```

## The Anatomy of Bayes' Theorem: Understanding Each Component

### The Four Components and Their Roles

**P(H|E) = [P(E|H) × P(H)] / P(E)**

1. **P(H|E)** - **Posterior**: What we want to know after seeing evidence
2. **P(E|H)** - **Likelihood**: How likely the evidence is if hypothesis is true
3. **P(H)** - **Prior**: What we believed before seeing evidence
4. **P(E)** - **Evidence**: How likely the evidence is overall

> **The intuitive story**: Bayes' theorem says "Your new belief equals how well the hypothesis predicts the evidence, times your old belief, normalized by how surprising the evidence is overall."

### The Intuitive Meaning of Each Component

**Prior P(H)**: Your starting belief before any evidence
- Like your "default assumption"
- Based on background knowledge, base rates, previous experience

**Likelihood P(E|H)**: How well the hypothesis explains the evidence
- "If my hypothesis were true, how likely would I see this evidence?"
- The predictive power of your hypothesis

**Evidence P(E)**: How surprising the evidence is overall
- Acts as a normalizing factor
- Ensures probabilities add up to 1

**Posterior P(H|E)**: Your updated belief after considering evidence
- Your new, more informed belief
- Combines prior knowledge with new information

### ASCII Visualization: The Bayes' Recipe

```
THE BAYES' THEOREM RECIPE

INGREDIENTS:
┌─────────────────────────────────────────────────────────┐
│ Prior P(H)      │ "What I believed before"              │
│ Likelihood P(E|H)│ "How well hypothesis explains evidence│
│ Evidence P(E)   │ "How surprising is this evidence?"    │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
COOKING PROCESS:
┌─────────────────────────────────────────────────────────┐
│ 1. Take your prior belief: P(H)                        │
│ 2. Multiply by how well it explains evidence: P(E|H)   │
│ 3. Normalize by evidence surprisingness: ÷ P(E)        │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
RESULT:
┌─────────────────────────────────────────────────────────┐
│ Posterior P(H|E): "What I believe after seeing evidence│
└─────────────────────────────────────────────────────────┘
```

## Real-World Application 1: Medical Diagnosis

### The Classic Medical Testing Problem

**Scenario**: A rare genetic disease affects 1 in 1,000 people. A test for this disease is 99% accurate (both sensitivity and specificity).

**Question**: If someone tests positive, what's the probability they actually have the disease?

**Most people's intuition**: 99% (the test accuracy)
**Reality**: Much lower due to base rate neglect!

### Step-by-Step Bayes' Analysis

**Given Information**:
- P(Disease) = 0.001 (1 in 1,000 people have it)
- P(Positive Test | Disease) = 0.99 (99% sensitivity)
- P(Negative Test | No Disease) = 0.99 (99% specificity)
- Therefore: P(Positive Test | No Disease) = 0.01 (1% false positive rate)

**What we want**: P(Disease | Positive Test)

**Step 1: Calculate P(Positive Test)**
P(Positive Test) = P(Positive | Disease) × P(Disease) + P(Positive | No Disease) × P(No Disease)
P(Positive Test) = 0.99 × 0.001 + 0.01 × 0.999
P(Positive Test) = 0.00099 + 0.00999 = 0.01098

**Step 2: Apply Bayes' Theorem**
P(Disease | Positive) = [P(Positive | Disease) × P(Disease)] / P(Positive)
P(Disease | Positive) = [0.99 × 0.001] / 0.01098
P(Disease | Positive) = 0.00099 / 0.01098 ≈ 0.09 = **9%**

> **The shocking insight**: Even with a 99% accurate test, a positive result only means a 9% chance of actually having the disease! This is because false positives vastly outnumber true positives when the disease is rare.

### ASCII Visualization: Medical Testing Numbers

```
MEDICAL TESTING WITH BAYES' THEOREM

POPULATION: 100,000 people
┌─────────────────────────────────────────────────────────┐
│                    DISEASE STATUS                       │
│ ┌─────────────────┐  ┌─────────────────────────────────┐ │
│ │  Have Disease   │  │       No Disease                │ │
│ │   100 people    │  │      99,900 people              │ │
│ │   (0.1%)        │  │       (99.9%)                   │ │
│ └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
AFTER TESTING (99% accuracy):
┌─────────────────────────────────────────────────────────┐
│                   TEST RESULTS                          │
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │
│ │    POSITIVE TESTS       │ │    NEGATIVE TESTS       │ │
│ │                         │ │                         │ │
│ │ True Positives:   99    │ │ True Negatives: 98,901  │ │
│ │ False Positives: 999    │ │ False Negatives:    1   │ │
│ │                         │ │                         │ │
│ │ Total Positive: 1,098   │ │ Total Negative: 98,902  │ │
│ └─────────────────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

P(Disease | Positive) = True Positives / Total Positives
                      = 99 / 1,098 = 9%

90% of positive tests are FALSE POSITIVES!
```

## Real-World Application 2: Spam Email Detection

### The Email Classification Challenge

**Problem**: Build a spam filter using word frequencies.

**Given Data**:
- 60% of emails are spam
- The word "FREE" appears in 80% of spam emails
- The word "FREE" appears in 5% of legitimate emails

**Question**: If an email contains "FREE", what's the probability it's spam?

### Bayes' Analysis for Spam Detection

**Given**:
- P(Spam) = 0.6
- P("FREE" | Spam) = 0.8
- P("FREE" | Not Spam) = 0.05

**Calculate P("FREE")**:
P("FREE") = P("FREE" | Spam) × P(Spam) + P("FREE" | Not Spam) × P(Not Spam)
P("FREE") = 0.8 × 0.6 + 0.05 × 0.4 = 0.48 + 0.02 = 0.5

**Apply Bayes' Theorem**:
P(Spam | "FREE") = [P("FREE" | Spam) × P(Spam)] / P("FREE")
P(Spam | "FREE") = [0.8 × 0.6] / 0.5 = 0.48 / 0.5 = **96%**

> **The practical insight**: Seeing "FREE" dramatically increases spam probability from 60% to 96%. This is why Bayesian spam filters are so effective - they quantify exactly how much each word should update our belief.

### Extending to Multiple Words (Naive Bayes)

For emails with multiple words, we can extend this:

P(Spam | "FREE" and "URGENT") = [P("FREE" and "URGENT" | Spam) × P(Spam)] / P("FREE" and "URGENT")

**Naive assumption**: Words are independent given spam status, so:
P("FREE" and "URGENT" | Spam) = P("FREE" | Spam) × P("URGENT" | Spam)

This creates the famous "Naive Bayes" classifier used throughout machine learning.

## Real-World Application 3: Criminal Justice and DNA Evidence

### The Legal Evidence Problem

**Scenario**: DNA found at crime scene matches suspect's DNA. Lab says "1 in 10 million chance of random match."

**Prosecutor's fallacy**: "Therefore, 99.9999% chance suspect is guilty!"
**Defense attorney's challenge**: "What's the prior probability my client committed this crime?"

### Proper Bayesian Analysis

**Given**:
- P(DNA Match | Guilty) ≈ 1.0 (if guilty, DNA will match)
- P(DNA Match | Innocent) = 1/10,000,000 (random match probability)
- P(Guilty) = ? (This is the key question!)

**For illustration, assume**:
- P(Guilty) = 0.01 (1% prior probability based on other evidence)

**Calculate**:
P(DNA Match) = P(DNA Match | Guilty) × P(Guilty) + P(DNA Match | Innocent) × P(Innocent)
P(DNA Match) = 1.0 × 0.01 + (1/10,000,000) × 0.99 ≈ 0.01

P(Guilty | DNA Match) = [P(DNA Match | Guilty) × P(Guilty)] / P(DNA Match)
P(Guilty | DNA Match) = [1.0 × 0.01] / 0.01 = **100%**

But if P(Guilty) = 0.0001 (much lower prior):
P(Guilty | DNA Match) ≈ **50%**

> **The legal insight**: DNA evidence strength depends critically on the prior probability of guilt. Strong forensic evidence can't overcome extremely low priors. This is why context and other evidence matter enormously in legal reasoning.

## The Philosophy of Bayes: Subjective vs Objective Probability

### The Bayesian Worldview

Bayes' theorem embodies a particular philosophy about probability and learning:

1. **All knowledge is uncertain**: We deal in degrees of belief, not absolute truth
2. **Prior knowledge matters**: We don't start from scratch - we have background beliefs
3. **Evidence updates beliefs**: New information should change our minds rationally
4. **Process is more important than result**: How we reason matters more than our final answer

> **The philosophical insight**: Bayes' theorem is not just a mathematical tool - it's a complete framework for rational thinking under uncertainty. It tells us how a perfectly rational agent should update beliefs when encountering evidence.

### ASCII Visualization: The Bayesian Learning Cycle

```
THE BAYESIAN LEARNING CYCLE

STEP 1: Start with Prior
┌─────────────────────────────────────────┐
│ Initial Belief: P(H)                    │
│ Based on background knowledge           │
└─────────────────────────────────────────┘
                    │
                    ▼
STEP 2: Observe Evidence
┌─────────────────────────────────────────┐
│ New Data: E                             │
│ Something we can observe/measure        │
└─────────────────────────────────────────┘
                    │
                    ▼
STEP 3: Calculate Likelihood  
┌─────────────────────────────────────────┐
│ P(E|H): How well does H explain E?      │
│ The predictive power of our hypothesis  │
└─────────────────────────────────────────┘
                    │
                    ▼
STEP 4: Update to Posterior
┌─────────────────────────────────────────┐
│ New Belief: P(H|E)                      │
│ Rational combination of prior + evidence│
└─────────────────────────────────────────┘
                    │
                    ▼
STEP 5: Posterior becomes new Prior
┌─────────────────────────────────────────┐
│ Ready for next piece of evidence        │
│ Learning is iterative and cumulative    │
└─────────────────────────────────────────┘
```

## Common Misconceptions and Pitfalls

### Misconception 1: Confusing P(A|B) with P(B|A)

**The Prosecutor's Fallacy**: Thinking P(Evidence | Innocent) = P(Innocent | Evidence)

**Example**: "Only 1 in 10 million innocent people would have matching DNA, so there's only a 1 in 10 million chance the defendant is innocent."

**Reality**: These are completely different probabilities that can be wildly different!

### Misconception 2: Ignoring Prior Probabilities

**Base Rate Neglect**: Focusing only on test accuracy while ignoring how common the condition is.

**Example**: Believing a rare disease test with 99% accuracy means 99% chance of having the disease when testing positive.

### Misconception 3: Assuming "Naive" Independence

**Real-world correlation**: The "naive" in Naive Bayes assumes features are independent, but real features often correlate.

**Example**: In spam detection, "FREE" and "MONEY" often appear together, violating independence assumptions.

### ASCII Visualization: Common Pitfalls

```
COMMON BAYES' THEOREM PITFALLS

PITFALL 1: Prosecutor's Fallacy
┌─────────────────────────────────────────┐
│ WRONG: P(E|H) = P(H|E)                  │
│ "Match probability = Guilt probability" │
│                                         │
│ RIGHT: Must use full Bayes formula     │
│ P(H|E) = P(E|H) × P(H) / P(E)          │
└─────────────────────────────────────────┘

PITFALL 2: Base Rate Neglect  
┌─────────────────────────────────────────┐
│ WRONG: Ignore P(H) (prior)              │
│ "Test is 99% accurate, so 99% chance"   │
│                                         │
│ RIGHT: Prior probability matters hugely │
│ Rare conditions → mostly false positives│
└─────────────────────────────────────────┘

PITFALL 3: Independence Assumptions
┌─────────────────────────────────────────┐
│ WRONG: Assume all evidence independent  │
│ P(E1,E2|H) = P(E1|H) × P(E2|H)          │
│                                         │
│ RIGHT: Account for correlations         │
│ Real features often depend on each other│
└─────────────────────────────────────────┘
```

## Advanced Applications: Machine Learning and AI

### Bayesian Networks

Bayes' theorem extends to complex networks where multiple variables influence each other:

**Medical Diagnosis Network**:
- Symptoms depend on diseases
- Diseases depend on risk factors
- Test results depend on diseases
- Everything interconnected through conditional probabilities

### Bayesian Machine Learning

**Key Principle**: Instead of finding the "best" model, maintain probability distributions over all possible models.

**Advantages**:
- Quantifies uncertainty in predictions
- Naturally handles overfitting
- Incorporates prior knowledge
- Updates beliefs as more data arrives

> **The AI insight**: Modern AI increasingly uses Bayesian methods because they provide principled ways to handle uncertainty, combine different types of evidence, and update beliefs as new data arrives. Bayes' theorem is the mathematical foundation of rational artificial intelligence.

## Simple Code Examples

```python
import numpy as np
import matplotlib.pyplot as plt
from collections import defaultdict, Counter
import random

# 1. BASIC BAYES' THEOREM CALCULATOR
class BayesCalculator:
    """A simple calculator for Bayes' theorem problems"""
    
    def __init__(self):
        self.scenarios = {}
    
    def add_scenario(self, name, prior, likelihood_true, likelihood_false):
        """Add a Bayesian scenario
        
        Args:
            name: Scenario name
            prior: P(H) - prior probability of hypothesis
            likelihood_true: P(E|H) - probability of evidence given hypothesis true
            likelihood_false: P(E|not H) - probability of evidence given hypothesis false
        """
        self.scenarios[name] = {
            'prior': prior,
            'likelihood_true': likelihood_true,
            'likelihood_false': likelihood_false
        }
    
    def calculate_posterior(self, scenario_name):
        """Calculate P(H|E) using Bayes' theorem"""
        if scenario_name not in self.scenarios:
            return None
        
        s = self.scenarios[scenario_name]
        prior = s['prior']
        likelihood_true = s['likelihood_true']
        likelihood_false = s['likelihood_false']
        
        # Calculate P(E) = P(E|H)P(H) + P(E|not H)P(not H)
        evidence_prob = (likelihood_true * prior + 
                        likelihood_false * (1 - prior))
        
        # Calculate P(H|E) = P(E|H)P(H) / P(E)
        posterior = (likelihood_true * prior) / evidence_prob
        
        return {
            'prior': prior,
            'likelihood_true': likelihood_true,
            'likelihood_false': likelihood_false,
            'evidence_prob': evidence_prob,
            'posterior': posterior
        }
    
    def print_analysis(self, scenario_name):
        """Print detailed Bayesian analysis"""
        result = self.calculate_posterior(scenario_name)
        if not result:
            print(f"Scenario '{scenario_name}' not found")
            return
        
        print(f"\nBAYESIAN ANALYSIS: {scenario_name}")
        print("=" * 50)
        print(f"Prior P(H):              {result['prior']:.4f}")
        print(f"Likelihood P(E|H):       {result['likelihood_true']:.4f}")
        print(f"Likelihood P(E|not H):   {result['likelihood_false']:.4f}")
        print(f"Evidence P(E):           {result['evidence_prob']:.4f}")
        print(f"Posterior P(H|E):        {result['posterior']:.4f}")
        print()
        print(f"The evidence changes belief from {result['prior']:.1%} to {result['posterior']:.1%}")
        
        if result['posterior'] > result['prior']:
            print("✓ Evidence SUPPORTS the hypothesis")
        else:
            print("✗ Evidence WEAKENS the hypothesis")


# 2. MEDICAL TESTING EXAMPLE
def medical_testing_example():
    """Demonstrate medical testing with Bayes' theorem"""
    
    print("MEDICAL TESTING EXAMPLE")
    print("=" * 40)
    print("Scenario: Rare disease (1 in 1000), 99% accurate test")
    
    calc = BayesCalculator()
    
    # Add medical testing scenario
    calc.add_scenario(
        name="Rare Disease Test",
        prior=0.001,           # 1 in 1000 have disease
        likelihood_true=0.99,  # 99% sensitivity (true positive rate)
        likelihood_false=0.01  # 1% false positive rate
    )
    
    calc.print_analysis("Rare Disease Test")
    
    # Demonstrate the counter-intuitive result
    result = calc.calculate_posterior("Rare Disease Test")
    print(f"SHOCKING RESULT:")
    print(f"Even with 99% test accuracy, positive result only indicates")
    print(f"{result['posterior']:.1%} chance of actually having the disease!")
    print()
    print("This happens because false positives vastly outnumber true positives")
    print("when the disease is rare (base rate effect).")


# 3. SPAM DETECTION EXAMPLE
class SpamDetector:
    """Bayesian spam detector using word frequencies"""
    
    def __init__(self):
        self.spam_word_counts = defaultdict(int)
        self.ham_word_counts = defaultdict(int)
        self.spam_total = 0
        self.ham_total = 0
        self.vocabulary = set()
    
    def train(self, emails, labels):
        """Train the spam detector on labeled emails
        
        Args:
            emails: List of email texts
            labels: List of labels ('spam' or 'ham')
        """
        for email, label in zip(emails, labels):
            words = email.lower().split()
            
            if label == 'spam':
                self.spam_total += 1
                for word in words:
                    self.spam_word_counts[word] += 1
                    self.vocabulary.add(word)
            else:
                self.ham_total += 1
                for word in words:
                    self.ham_word_counts[word] += 1
                    self.vocabulary.add(word)
    
    def word_probability(self, word, is_spam, smoothing=1):
        """Calculate P(word | spam) or P(word | ham) with Laplace smoothing"""
        if is_spam:
            word_count = self.spam_word_counts[word]
            total_words = sum(self.spam_word_counts.values())
        else:
            word_count = self.ham_word_counts[word]
            total_words = sum(self.ham_word_counts.values())
        
        # Laplace smoothing to handle unseen words
        return (word_count + smoothing) / (total_words + len(self.vocabulary) * smoothing)
    
    def classify(self, email):
        """Classify email as spam or ham using Naive Bayes"""
        words = email.lower().split()
        
        # Prior probabilities
        prior_spam = self.spam_total / (self.spam_total + self.ham_total)
        prior_ham = self.ham_total / (self.spam_total + self.ham_total)
        
        # Calculate log probabilities to avoid underflow
        log_prob_spam = np.log(prior_spam)
        log_prob_ham = np.log(prior_ham)
        
        for word in words:
            if word in self.vocabulary:
                log_prob_spam += np.log(self.word_probability(word, True))
                log_prob_ham += np.log(self.word_probability(word, False))
        
        # Convert back to probabilities
        if log_prob_spam > log_prob_ham:
            spam_probability = 1 / (1 + np.exp(log_prob_ham - log_prob_spam))
        else:
            spam_probability = np.exp(log_prob_spam - log_prob_ham) / (1 + np.exp(log_prob_spam - log_prob_ham))
        
        return {
            'spam_probability': spam_probability,
            'ham_probability': 1 - spam_probability,
            'classification': 'spam' if spam_probability > 0.5 else 'ham',
            'confidence': max(spam_probability, 1 - spam_probability)
        }


def spam_detection_demo():
    """Demonstrate Bayesian spam detection"""
    
    print("\nSPAM DETECTION EXAMPLE")
    print("=" * 40)
    
    # Create training data
    spam_emails = [
        "free money now click here",
        "urgent action required send money",
        "congratulations you won million dollars",
        "free trial offer limited time",
        "make money fast easy way"
    ]
    
    ham_emails = [
        "meeting scheduled for tomorrow morning",
        "project deadline next week please review",
        "lunch plans for friday",
        "quarterly report attached for review",
        "family dinner this weekend"
    ]
    
    # Prepare training data
    emails = spam_emails + ham_emails
    labels = ['spam'] * len(spam_emails) + ['ham'] * len(ham_emails)
    
    # Train detector
    detector = SpamDetector()
    detector.train(emails, labels)
    
    # Test on new emails
    test_emails = [
        "free money offer click now",  # Should be spam
        "project meeting tomorrow",     # Should be ham
        "urgent free trial money"       # Should be spam
    ]
    
    print("Training complete. Testing on new emails:")
    print()
    
    for email in test_emails:
        result = detector.classify(email)
        print(f"Email: '{email}'")
        print(f"Classification: {result['classification']}")
        print(f"Spam probability: {result['spam_probability']:.3f}")
        print(f"Confidence: {result['confidence']:.3f}")
        print("-" * 40)


# 4. DNA EVIDENCE EXAMPLE
def dna_evidence_example():
    """Demonstrate DNA evidence analysis using Bayes' theorem"""
    
    print("\nDNA EVIDENCE EXAMPLE")
    print("=" * 40)
    
    calc = BayesCalculator()
    
    # Scenario 1: High prior probability (other evidence suggests guilt)
    calc.add_scenario(
        name="DNA High Prior",
        prior=0.8,              # 80% prior probability of guilt
        likelihood_true=1.0,    # If guilty, DNA will match
        likelihood_false=1e-7   # 1 in 10 million random match
    )
    
    # Scenario 2: Low prior probability (weak other evidence)
    calc.add_scenario(
        name="DNA Low Prior", 
        prior=0.001,            # 0.1% prior probability of guilt
        likelihood_true=1.0,    # If guilty, DNA will match
        likelihood_false=1e-7   # 1 in 10 million random match
    )
    
    print("DNA match: 1 in 10 million random match probability")
    print()
    
    print("SCENARIO 1: Strong other evidence (80% prior guilt probability)")
    calc.print_analysis("DNA High Prior")
    
    print("SCENARIO 2: Weak other evidence (0.1% prior guilt probability)")
    calc.print_analysis("DNA Low Prior")
    
    print("KEY INSIGHT: DNA evidence strength depends heavily on prior probability!")
    print("The same DNA evidence leads to very different conclusions")
    print("depending on other evidence in the case.")


# 5. ITERATIVE BELIEF UPDATING
class IterativeBayesUpdater:
    """Demonstrate how beliefs update iteratively with new evidence"""
    
    def __init__(self, initial_belief):
        self.belief_history = [initial_belief]
        self.evidence_history = []
    
    def update_belief(self, evidence_name, likelihood_true, likelihood_false):
        """Update belief based on new evidence"""
        current_belief = self.belief_history[-1]
        
        # Calculate new belief using Bayes' theorem
        evidence_prob = (likelihood_true * current_belief + 
                        likelihood_false * (1 - current_belief))
        
        new_belief = (likelihood_true * current_belief) / evidence_prob
        
        self.belief_history.append(new_belief)
        self.evidence_history.append({
            'name': evidence_name,
            'likelihood_true': likelihood_true,
            'likelihood_false': likelihood_false,
            'prior': current_belief,
            'posterior': new_belief
        })
        
        return new_belief
    
    def print_history(self):
        """Print the complete belief updating history"""
        print("\nBELIEF UPDATING HISTORY")
        print("=" * 50)
        print(f"Initial belief: {self.belief_history[0]:.3f}")
        print()
        
        for i, evidence in enumerate(self.evidence_history):
            print(f"Evidence {i+1}: {evidence['name']}")
            print(f"  Prior:     {evidence['prior']:.3f}")
            print(f"  Posterior: {evidence['posterior']:.3f}")
            change = evidence['posterior'] - evidence['prior']
            direction = "increased" if change > 0 else "decreased"
            print(f"  Change:    {direction} by {abs(change):.3f}")
            print()


def iterative_updating_demo():
    """Demonstrate iterative belief updating"""
    
    print("\nITERATIVE BELIEF UPDATING EXAMPLE")
    print("=" * 45)
    print("Scenario: Is a coin fair? Starting belief: 50% chance it's fair")
    
    updater = IterativeBayesUpdater(initial_belief=0.5)
    
    # Simulate evidence from coin flips
    # Evidence 1: Get 7 heads out of 10 flips
    updater.update_belief(
        "7 heads in 10 flips",
        likelihood_true=0.117,   # Probability under fair coin (binomial)
        likelihood_false=0.267   # Probability under biased coin (p=0.7)
    )
    
    # Evidence 2: Get 8 heads out of next 10 flips  
    updater.update_belief(
        "8 heads in next 10 flips",
        likelihood_true=0.044,   # Probability under fair coin
        likelihood_false=0.233   # Probability under biased coin
    )
    
    # Evidence 3: Get 6 heads out of next 10 flips
    updater.update_belief(
        "6 heads in next 10 flips", 
        likelihood_true=0.205,   # Probability under fair coin
        likelihood_false=0.200   # Probability under biased coin
    )
    
    updater.print_history()
    
    final_belief = updater.belief_history[-1]
    print(f"Final belief after all evidence: {final_belief:.3f}")
    print(f"The coin is probably {'fair' if final_belief > 0.5 else 'biased'}")


# 6. COMPREHENSIVE EXAMPLE RUNNER
def run_all_examples():
    """Run all Bayes' theorem examples"""
    
    print("BAYES' THEOREM: COMPREHENSIVE EXAMPLES")
    print("=" * 60)
    
    # Run all examples
    medical_testing_example()
    spam_detection_demo()
    dna_evidence_example()
    iterative_updating_demo()
    
    print("\n" + "=" * 60)
    print("SUMMARY OF KEY INSIGHTS:")
    print("1. Medical testing: Rare conditions mostly yield false positives")
    print("2. Spam detection: Bayesian methods excel at text classification")
    print("3. Legal evidence: Prior probability critically affects conclusions")
    print("4. Iterative updating: Beliefs evolve rationally with new evidence")
    print("\nBayes' theorem provides the mathematical foundation for")
    print("rational reasoning under uncertainty in all these domains!")


# Run the examples
if __name__ == "__main__":
    run_all_examples()
```

## Additional Quick Examples

```python
# Quick and Simple Bayes' Theorem Examples

def simple_bayes(prior, likelihood_true, likelihood_false):
    """Simple Bayes' theorem calculator"""
    # P(E) = P(E|H)P(H) + P(E|¬H)P(¬H)
    evidence = likelihood_true * prior + likelihood_false * (1 - prior)
    
    # P(H|E) = P(E|H)P(H) / P(E)
    posterior = (likelihood_true * prior) / evidence
    
    return posterior

# Example 1: Weather prediction
print("EXAMPLE 1: Weather Prediction")
print("-" * 30)
print("Prior: 30% chance of rain tomorrow")
print("Evidence: Dark clouds observed (80% accurate predictor)")
print("If no rain planned: only 10% chance of dark clouds")

weather_posterior = simple_bayes(
    prior=0.3,           # 30% base chance of rain
    likelihood_true=0.8, # 80% chance of clouds if rain
    likelihood_false=0.1 # 10% chance of clouds if no rain
)

print(f"Updated probability of rain: {weather_posterior:.1%}")
print()

# Example 2: Broken machine
print("EXAMPLE 2: Machine Diagnosis")
print("-" * 30)
print("Prior: 5% chance machine is broken")
print("Evidence: Warning light is on")
print("Broken machine: 90% chance of warning")
print("Working machine: 2% chance of false alarm")

machine_posterior = simple_bayes(
    prior=0.05,          # 5% base rate of broken machines
    likelihood_true=0.9, # 90% chance of warning if broken
    likelihood_false=0.02 # 2% false alarm rate
)

print(f"Probability machine is broken: {machine_posterior:.1%}")
print()

# Example 3: Student cheating
print("EXAMPLE 3: Academic Integrity")
print("-" * 30)
print("Prior: 1% of students cheat on exams")
print("Evidence: Very similar answers to neighbor")
print("If cheating: 95% chance of similar answers")
print("If not cheating: 5% chance of similar answers")

cheating_posterior = simple_bayes(
    prior=0.01,          # 1% base rate of cheating
    likelihood_true=0.95, # 95% chance of similarity if cheating
    likelihood_false=0.05 # 5% chance of similarity by coincidence
)

print(f"Probability student cheated: {cheating_posterior:.1%}")
print()

print("KEY INSIGHT: Notice how rare events (broken machine, cheating)")
print("remain relatively unlikely even with strong evidence!")
print("This is the power of Bayes' theorem - it properly weighs")
print("base rates against evidence strength.")
```

Here are some simple demonstrations to solidify understanding:## The Universal Insight: Bayes as the Logic of Science

### Why Bayes' Theorem Is Fundamental to Human Knowledge

Bayes' theorem isn't just a mathematical formula - it's the mathematical description of how rational learning works. Every time we:
- Update our beliefs based on new evidence
- Revise theories when experiments don't match predictions  
- Change our minds when presented with compelling arguments
- Diagnose problems by observing symptoms

We're following Bayesian logic, whether we realize it or not.

> **The meta-insight**: Bayes' theorem captures the essence of the scientific method itself. Science progresses by proposing hypotheses (priors), testing predictions (likelihoods), observing results (evidence), and updating theories (posteriors). This isn't coincidence - it's the mathematical description of rational thought.

### ASCII Visualization: The Scientific Method as Bayes' Theorem

```
THE SCIENTIFIC METHOD = BAYESIAN REASONING

SCIENTIFIC PROCESS              BAYESIAN COMPONENTS
┌─────────────────────┐        ┌─────────────────────┐
│ 1. Form Hypothesis  │   ≡    │ Prior P(H)          │
│    Based on existing│        │ Background knowledge│
│    knowledge        │        │                     │
└─────────────────────┘        └─────────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐        ┌─────────────────────┐
│ 2. Make Predictions │   ≡    │ Likelihood P(E|H)   │
│    What should we   │        │ If hypothesis true, │
│    observe if true? │        │ what would we see?  │
└─────────────────────┘        └─────────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐        ┌─────────────────────┐
│ 3. Conduct Experiment│   ≡    │ Evidence P(E)       │
│    Observe what     │        │ What we actually    │
│    actually happens │        │ observed            │
└─────────────────────┘        └─────────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────────┐        ┌─────────────────────┐
│ 4. Update Theory    │   ≡    │ Posterior P(H|E)    │
│    Revise beliefs   │        │ Updated belief in   │
│    based on results │        │ hypothesis          │
└─────────────────────┘        └─────────────────────┘
```

### The Philosophical Revolution

Bayes' theorem represents a fundamental shift in how we think about knowledge:

**Pre-Bayesian thinking**: "Is this hypothesis true or false?"
**Bayesian thinking**: "How confident should I be in this hypothesis given the available evidence?"

> **The profound insight**: Bayes' theorem shows that all knowledge is probabilistic and all learning is updating. There are no absolute truths, only degrees of belief that should change rationally as evidence accumulates.

This Bayesian worldview has revolutionized fields from artificial intelligence to medical diagnosis to legal reasoning. It provides a principled framework for making decisions under uncertainty - which is essentially every important decision we face.

**Final insight**: Master Bayes' theorem, and you master the mathematical foundation of rational thought itself. Every algorithm in machine learning, every diagnostic tool in medicine, every scientific breakthrough follows Bayesian logic. It's not just a theorem - it's the mathematics of intelligence.