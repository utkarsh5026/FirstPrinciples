# Conditional Probability and Independence: The Mathematics of Updated Beliefs

## The Fundamental "Why": When New Information Changes Everything

Imagine you're a doctor. A patient walks into your office with a persistent cough. Without any additional information, you might think: "Could be anything - cold, allergies, infection, maybe something serious."

But then you learn the patient is a 30-year smoker. Suddenly, your assessment completely changes. The probability of lung cancer just jumped dramatically.

Here's the crucial insight: **The probability of an event often depends entirely on what other information we know.**

> **The key insight here is** : Most real-world probabilities aren't fixed numbers - they're conditional on context. When we gain new information, we must mathematically update our beliefs. This is exactly what conditional probability captures - the mathematics of changing your mind based on evidence.

Consider these everyday examples:

* **Weather prediction** : "30% chance of rain" becomes "80% chance of rain given those dark clouds forming"
* **Medical diagnosis** : "1% chance of disease" becomes "15% chance given positive test result"
* **Job interviews** : "10% acceptance rate" becomes "60% acceptance rate given you have relevant experience"

## The Intuitive Problem: Why Simple Probability Isn't Enough

### The Limitation of Unconditional Probability

Think about the probability of someone being over 6 feet tall. In the general population, this might be 15%. But what if I tell you the person plays professional basketball? Now that probability might be 85%!

> **This is like asking "What's the probability of catching fish?" The answer completely depends on WHERE you're fishing. In a stocked pond vs. a parking lot puddle, the probabilities are vastly different. Context changes everything.**

### ASCII Visualization: How Information Changes Probability

```
THE POWER OF CONDITIONAL INFORMATION

UNCONDITIONAL: P(Over 6 feet tall) = 15%
General Population
┌─────────────────────────────────────┐
│ ■■■                                 │  ← 15% over 6 feet
│                                     │
│                                     │
└─────────────────────────────────────┘

CONDITIONAL: P(Over 6 feet tall | Professional Basketball Player) = 85%
Basketball Players Only
┌─────────────────────────────────────┐
│ ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ │  ← 85% over 6 feet
│ ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ │
│ ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ │
└─────────────────────────────────────┘

THE PATTERN: Same characteristic, different contexts, dramatically different probabilities!
```

> **The fundamental necessity** : We need a mathematical framework that allows us to update probabilities when we gain new information. This framework must be logically consistent and provide a systematic way to incorporate evidence.

## Building Intuition: The Natural Logic of Conditional Probability

### The Intuitive Development

Let's think through this step by step. Suppose we want to find the probability of event A happening, given that we know event B has already happened.

 **The Logical Question** : "Out of all the times B happens, what fraction of those times does A also happen?"

> **Imagine you're looking at a parking lot full of cars. You want to know: "What's the probability a car is red, given that it's a sports car?" You would:**
>
> 1. **Focus only on the sports cars** (ignore all other cars)
> 2. **Count how many of those sports cars are red**
> 3. **Calculate the fraction: (red sports cars) / (total sports cars)**

This natural logic leads directly to the mathematical definition.

### ASCII Visualization: The Logical Foundation

```
CONDITIONAL PROBABILITY LOGIC

TOTAL SAMPLE SPACE
┌─────────────────────────────────────────┐
│                                         │
│   ┌─────────────────┐                   │
│   │     Event B     │                   │
│   │  ┌─────────┐    │                   │
│   │  │ A and B │    │                   │
│   │  │(A ∩ B)  │    │                   │
│   │  └─────────┘    │                   │
│   │                 │                   │
│   └─────────────────┘                   │
│                                         │
└─────────────────────────────────────────┘

CONDITIONAL PROBABILITY QUESTION:
"Given that B happened, what's the probability A also happened?"

LOGIC:
- We KNOW B happened, so we only care about the B region
- Within B, we want the fraction where A also occurred
- That fraction is: (A ∩ B) / B

This gives us: P(A|B) = P(A ∩ B) / P(B)
```

## Mathematical Definition: Conditional Probability

### The Formal Definition

 **Conditional Probability** : The probability of event A given that event B has occurred is:

> **P(A|B) = P(A ∩ B) / P(B)** , provided P(B) > 0

### Why This Formula Makes Perfect Sense

Let's break down why this formula is the only logical possibility:

1. **Numerator P(A ∩ B)** : This is the probability that both A and B happen together
2. **Denominator P(B)** : This is the probability that B happens at all
3. **The Ratio** : This gives us the fraction of times A happens within the subset where B happens

> **The intuitive story this equation captures** : "Out of all the scenarios where B occurs, what fraction also have A occurring?" This is exactly what conditional probability measures.

### Step-by-Step Derivation from First Principles

 **Starting Point** : We want to define P(A|B) logically.

 **Step 1** : If we know B has occurred, we're only interested in outcomes where B is true.

 **Step 2** : Among those B-outcomes, we want the fraction where A is also true.

 **Step 3** : In a frequency interpretation:

* Number of times both A and B occur: proportional to P(A ∩ B)
* Number of times B occurs: proportional to P(B)
* Fraction = [times both occur] / [times B occurs] = P(A ∩ B) / P(B)

 **Therefore** : P(A|B) = P(A ∩ B) / P(B) is the unique logical definition.

### Real-World Example: Medical Testing

Let's work through a concrete example to see conditional probability in action.

 **Scenario** :

* Disease affects 1% of population: P(Disease) = 0.01
* Test is 90% accurate for sick people: P(Positive|Disease) = 0.90
* Test has 5% false positive rate: P(Positive|No Disease) = 0.05

 **Question** : If someone tests positive, what's the probability they actually have the disease?

 **Solution Using Conditional Probability** :

```
MEDICAL TESTING EXAMPLE

Population: 10,000 people
├─ Have Disease: 100 people (1%)
│  ├─ Test Positive: 90 people (90% of 100)
│  └─ Test Negative: 10 people (10% of 100)
└─ No Disease: 9,900 people (99%)
   ├─ Test Positive: 495 people (5% of 9,900) ← False positives!
   └─ Test Negative: 9,405 people (95% of 9,900)

TOTAL POSITIVE TESTS: 90 + 495 = 585 people
ACTUALLY HAVE DISEASE: 90 people

P(Disease|Positive) = 90/585 = 0.154 = 15.4%

SHOCKING RESULT: Even with a positive test, only 15.4% chance of having disease!
```

> **The crucial insight** : Even with a 90% accurate test, most positive results are false positives when the disease is rare. This shows why conditional probability is essential for medical decision-making.

## The Multiplication Rule: A Natural Consequence

### Deriving the Multiplication Rule

From the definition P(A|B) = P(A ∩ B) / P(B), we can rearrange to get:

> **P(A ∩ B) = P(A|B) × P(B)**

This is called the  **Multiplication Rule** .

### Why This Makes Intuitive Sense

> **Think of it like this** : "The probability that both A and B happen equals the probability that B happens, multiplied by the probability that A happens given that B has already happened." This mirrors how we naturally think about sequential events.

 **Example** : Probability of drawing two aces from a deck without replacement.

* P(First Ace) = 4/52
* P(Second Ace|First Ace) = 3/51 (only 3 aces left in 51 cards)
* P(Both Aces) = (4/52) × (3/51) = 12/2652 ≈ 0.0045

### ASCII Visualization: The Multiplication Rule

```
MULTIPLICATION RULE VISUALIZATION

Sequential Event Example: Two Card Draws

STEP 1: First Draw
┌─────────────────┐
│ Deck (52 cards) │
│ ■■■■ ← 4 Aces   │  P(First Ace) = 4/52
│ ████████████... │
└─────────────────┘

STEP 2: Second Draw (Given First was Ace)
┌─────────────────┐
│ Deck (51 cards) │
│ ■■■ ← 3 Aces    │  P(Second Ace|First Ace) = 3/51
│ ███████████...  │
└─────────────────┘

MULTIPLICATION:
P(Both Aces) = P(First Ace) × P(Second Ace|First Ace)
             = (4/52) × (3/51)
             = 4×3 / 52×51
             = 12/2652 ≈ 0.45%
```

## Independence: When Information Doesn't Matter

### The Intuitive Concept

Sometimes, knowing that event B occurred gives us no information about whether event A will occur. In this case, we say A and B are  **independent** .

> **Independence means** : "Learning that B happened doesn't change my belief about A happening." Mathematically, this means P(A|B) = P(A).

### Everyday Examples of Independence

* **Coin flips** : Knowing the first flip was heads doesn't change the probability of the second flip being heads
* **Different dice** : The result of one die doesn't affect the other die
* **Unrelated events** : Your height doesn't affect tomorrow's weather

### Mathematical Definition of Independence

 **Events A and B are independent if and only if** :

> **P(A|B) = P(A)** (equivalently, P(B|A) = P(B))

This leads to the  **Independence Multiplication Rule** :

> **If A and B are independent, then P(A ∩ B) = P(A) × P(B)**

### Why This Definition Makes Perfect Sense

If knowing B doesn't change the probability of A, then:

* P(A|B) = P(A)
* Substituting into P(A ∩ B) = P(A|B) × P(B):
* P(A ∩ B) = P(A) × P(B)

> **The beautiful logic** : Independence means the events don't influence each other, so their joint probability is simply the product of their individual probabilities.

### ASCII Visualization: Independence vs Dependence

```
INDEPENDENCE VS DEPENDENCE

INDEPENDENT EVENTS (Coin Flips)
First Flip: H or T (50% each)
Second Flip: H or T (50% each, regardless of first)

┌─────────────────┐    ┌─────────────────┐
│ First: 50% H    │    │ Second: 50% H   │
│        50% T    │ ×──│         50% T   │
└─────────────────┘    └─────────────────┘
   No influence!

P(H,H) = 0.5 × 0.5 = 0.25 ✓

DEPENDENT EVENTS (Cards Without Replacement)
First Card: Ace (4/52)
Second Card: Ace depends on first result

If First = Ace:     If First ≠ Ace:
┌─────────────────┐ ┌─────────────────┐
│ Second: 3/51    │ │ Second: 4/51    │
│         Ace     │ │         Ace     │
└─────────────────┘ └─────────────────┘
   Information matters!

P(Ace,Ace) = (4/52) × (3/51) ≠ (4/52) × (4/52)
```

## Bayes' Theorem: The Mathematics of Updating Beliefs

### The Fundamental Question

Bayes' Theorem answers this crucial question: **"If we observe some evidence, how should we update our beliefs about the underlying cause?"**

> **This is like being a detective** : You find fingerprints at a crime scene (evidence). You want to know: "Given these fingerprints, what's the probability this specific person committed the crime?" Bayes' Theorem provides the mathematical framework for this kind of reasoning.

### Deriving Bayes' Theorem from First Principles

Let's build Bayes' Theorem step by step, starting from the basic definition of conditional probability.

 **Step 1** : Start with the definition of conditional probability in both directions:

* P(A|B) = P(A ∩ B) / P(B)
* P(B|A) = P(A ∩ B) / P(A)

 **Step 2** : Notice that both formulas have P(A ∩ B) in the numerator, so:
P(A ∩ B) = P(A|B) × P(B) = P(B|A) × P(A)

 **Step 3** : Therefore: P(A|B) × P(B) = P(B|A) × P(A)

 **Step 4** : Solve for P(A|B):

> **P(A|B) = [P(B|A) × P(A)] / P(B)**

This is  **Bayes' Theorem** !

### The Complete Form: Bayes' Theorem with Law of Total Probability

Often, we don't know P(B) directly, but we can calculate it using the  **Law of Total Probability** .

If A₁, A₂, ..., Aₙ form a partition of the sample space, then:

**P(B) = P(B|A₁)P(A₁) + P(B|A₂)P(A₂) + ... + P(B|Aₙ)P(Aₙ)**

Substituting this into Bayes' Theorem:

> **P(Aᵢ|B) = [P(B|Aᵢ) × P(Aᵢ)] / [∑ⱼ P(B|Aⱼ) × P(Aⱼ)]**

### ASCII Visualization: Bayes' Theorem Logic

```
BAYES' THEOREM: FROM CAUSE TO EFFECT, THEN BACK

FORWARD REASONING (What we usually know):
Cause → Effect
"If disease, then probably positive test"
P(Positive Test | Disease) = 90%

BACKWARD REASONING (What we want to know):
Effect → Cause  
"If positive test, then what probability of disease?"
P(Disease | Positive Test) = ?

BAYES' THEOREM BRIDGES THE GAP:

         Known              Known            Calculated
         ↓                  ↓                ↓
P(Disease|Positive) = P(Positive|Disease) × P(Disease) / P(Positive)
         ↑
    What we want

THE INTUITION: Bayes flips the conditional probability
```

### Real-World Bayes' Theorem Example: Email Spam Detection

Let's work through a complete example to see Bayes' Theorem in action.

 **Scenario** : Email spam detection system

* 60% of emails are spam: P(Spam) = 0.6
* 40% of emails are legitimate: P(Legitimate) = 0.4
* Word "FREE" appears in 80% of spam emails: P("FREE"|Spam) = 0.8
* Word "FREE" appears in 5% of legitimate emails: P("FREE"|Legitimate) = 0.05

 **Question** : If an email contains "FREE", what's the probability it's spam?

 **Solution Using Bayes' Theorem** :

 **Step 1** : Identify what we want: P(Spam|"FREE")

 **Step 2** : Apply Bayes' Theorem:
P(Spam|"FREE") = [P("FREE"|Spam) × P(Spam)] / P("FREE")

 **Step 3** : Calculate P("FREE") using Law of Total Probability:
P("FREE") = P("FREE"|Spam) × P(Spam) + P("FREE"|Legitimate) × P(Legitimate)
P("FREE") = 0.8 × 0.6 + 0.05 × 0.4 = 0.48 + 0.02 = 0.5

 **Step 4** : Calculate final answer:
P(Spam|"FREE") = (0.8 × 0.6) / 0.5 = 0.48 / 0.5 = 0.96 = 96%

### ASCII Visualization: Spam Detection Example

```
BAYES' THEOREM: SPAM DETECTION

POPULATION: 1000 emails
├─ Spam: 600 emails (60%)
│  ├─ Contains "FREE": 480 emails (80% of 600)
│  └─ No "FREE": 120 emails (20% of 600)
└─ Legitimate: 400 emails (40%)
   ├─ Contains "FREE": 20 emails (5% of 400)
   └─ No "FREE": 380 emails (95% of 400)

EMAILS WITH "FREE": 480 + 20 = 500 total
SPAM WITH "FREE": 480 emails

P(Spam | "FREE") = 480/500 = 96%

INTERPRETATION: If email contains "FREE", 96% chance it's spam!
```

> **The power of Bayes' Theorem** : It allows us to work backwards from evidence to causes, which is exactly what we need for classification, diagnosis, and decision-making under uncertainty.

## Common Misconceptions and Pitfalls

### Misconception 1: The Prosecutor's Fallacy

 **Wrong thinking** : P(Evidence|Innocent) = P(Innocent|Evidence)

 **Reality** : These are completely different probabilities!

 **Example** :

* P(DNA Match|Innocent) = 1 in 1,000,000 (very rare)
* P(Innocent|DNA Match) depends on many other factors via Bayes' Theorem

### Misconception 2: Ignoring Base Rates

 **Wrong thinking** : Focusing only on test accuracy, ignoring how rare the condition is.

 **Reality** : Base rates (prior probabilities) dramatically affect conclusions.

> **The medical testing paradox** : A 99% accurate test for a disease that affects 0.1% of the population will give mostly false positives. The rarity of the disease makes even accurate tests unreliable for individual diagnosis.

### ASCII Visualization: Base Rate Neglect

```
THE BASE RATE FALLACY

RARE DISEASE SCENARIO
Disease Rate: 0.1% (1 in 1000)
Test Accuracy: 99%

Population: 100,000 people
├─ Have Disease: 100 people (0.1%)
│  ├─ Test Positive: 99 people (99%)
│  └─ Test Negative: 1 person (1%)
└─ No Disease: 99,900 people (99.9%)
   ├─ Test Positive: 999 people (1% false positive)
   └─ Test Negative: 98,901 people (99%)

TOTAL POSITIVE TESTS: 99 + 999 = 1,098
ACTUALLY HAVE DISEASE: 99

P(Disease|Positive) = 99/1,098 = 9%

SHOCKING: With 99% accurate test, positive result only 9% likely to be true!
Base rate matters enormously!
```

### Misconception 3: Confusing Independence with Mutual Exclusivity

 **Wrong thinking** : If events can't happen together, they're independent.

 **Reality** : Mutually exclusive events are maximally dependent!

* **Mutually Exclusive** : P(A ∩ B) = 0, but P(A|B) = 0 ≠ P(A)
* **Independent** : P(A ∩ B) = P(A) × P(B), and P(A|B) = P(A)

## Real-World Applications: Where Conditional Probability Rules

### Application 1: Machine Learning Classification

 **The Problem** : Classify emails as spam or not spam based on words they contain.

 **The Solution** : Use Bayes' Theorem to calculate:
P(Spam|Words) ∝ P(Words|Spam) × P(Spam)

 **Naive Bayes Classifier** : Assumes words are independent given the class:
P(Words|Spam) = P(Word₁|Spam) × P(Word₂|Spam) × ... × P(Wordₙ|Spam)

### Application 2: Medical Diagnosis

 **The Problem** : Diagnose diseases based on symptoms and test results.

 **The Solution** : Use Bayes' Theorem to update probabilities:

* Start with base rate of disease: P(Disease)
* Update based on symptoms: P(Disease|Symptoms)
* Update further with test results: P(Disease|Symptoms, Test)

### Application 3: Financial Risk Assessment

 **The Problem** : Assess probability of loan default based on applicant characteristics.

 **The Solution** : Use conditional probability to model:
P(Default|Credit Score, Income, Employment History, etc.)

### ASCII Visualization: Machine Learning Application

```
NAIVE BAYES CLASSIFIER

EMAIL CLASSIFICATION BASED ON WORDS

TRAINING DATA:
Spam emails: "FREE", "MONEY", "CLICK"
Ham emails: "MEETING", "REPORT", "SCHEDULE"

NEW EMAIL: "FREE MONEY CLICK"

CALCULATION:
P(Spam|"FREE MONEY CLICK") = 
    P("FREE"|Spam) × P("MONEY"|Spam) × P("CLICK"|Spam) × P(Spam)
    ─────────────────────────────────────────────────────────────
    P("FREE MONEY CLICK")

If words strongly associated with spam → High P(Spam|Words)
If words neutral or associated with ham → Low P(Spam|Words)

DECISION: Classify as class with higher posterior probability
```

## The Philosophical Implications

### The Bayesian vs Frequentist Debate

Conditional probability and Bayes' Theorem lead to profound questions about the nature of probability itself:

 **Frequentist View** : Probability represents long-run frequencies of events.
 **Bayesian View** : Probability represents degrees of belief that can be updated with evidence.

> **The deep insight** : Bayes' Theorem suggests that probability is not just about counting outcomes, but about systematically updating our beliefs when we gain new information. This has revolutionized fields from artificial intelligence to philosophy of science.

### The Mathematics of Scientific Method

Bayes' Theorem provides a mathematical framework for the scientific method:

1. **Prior** : Start with initial hypothesis probability
2. **Likelihood** : Calculate how well evidence fits hypothesis
3. **Posterior** : Update hypothesis probability based on evidence

> **The scientific revolution** : Bayes' Theorem formalizes how science should work - hypotheses should be updated based on evidence, with the strength of update depending on how well the evidence fits different hypotheses.

## Simple Coding Examples

Let's implement these concepts to solidify understanding:

### Example 1: Basic Conditional Probability Calculator

```python
def conditional_probability(prob_a_and_b, prob_b):
    """
    Calculate P(A|B) = P(A ∩ B) / P(B)
    """
    if prob_b == 0:
        return "Undefined - P(B) cannot be zero"
  
    return prob_a_and_b / prob_b

# Medical testing example
prob_disease_and_positive = 0.009  # P(Disease ∩ Positive Test)
prob_positive = 0.058              # P(Positive Test)

prob_disease_given_positive = conditional_probability(
    prob_disease_and_positive, 
    prob_positive
)

print(f"P(Disease|Positive Test) = {prob_disease_given_positive:.3f}")
# Output: P(Disease|Positive Test) = 0.155
```

### Example 2: Independence Checker

```python
def check_independence(prob_a, prob_b, prob_a_and_b):
    """
    Check if events A and B are independent
    Independence: P(A ∩ B) = P(A) × P(B)
    """
    expected_if_independent = prob_a * prob_b
    difference = abs(prob_a_and_b - expected_if_independent)
  
    is_independent = difference < 0.001  # Small tolerance for floating point
  
    return {
        'independent': is_independent,
        'expected_if_independent': expected_if_independent,
        'actual_joint_probability': prob_a_and_b,
        'difference': difference
    }

# Example: Two dice rolls
prob_first_six = 1/6
prob_second_six = 1/6
prob_both_six = 1/36

result = check_independence(prob_first_six, prob_second_six, prob_both_six)
print(f"Are dice rolls independent? {result['independent']}")
print(f"Expected if independent: {result['expected_if_independent']:.4f}")
print(f"Actual joint probability: {result['actual_joint_probability']:.4f}")
```

### Example 3: Bayes' Theorem Calculator

```python
def bayes_theorem(prior, likelihood, evidence):
    """
    Calculate P(A|B) using Bayes' Theorem
    P(A|B) = P(B|A) × P(A) / P(B)
  
    prior: P(A) - prior probability of hypothesis
    likelihood: P(B|A) - probability of evidence given hypothesis
    evidence: P(B) - total probability of evidence
    """
    posterior = (likelihood * prior) / evidence
    return posterior

def calculate_evidence_probability(hypotheses, priors, likelihoods):
    """
    Calculate P(Evidence) using law of total probability
    P(B) = Σ P(B|Ai) × P(Ai)
    """
    evidence_prob = sum(likelihood * prior 
                       for likelihood, prior in zip(likelihoods, priors))
    return evidence_prob

# Email spam detection example
# Hypotheses: Spam, Ham
priors = [0.6, 0.4]  # P(Spam), P(Ham)
likelihoods = [0.8, 0.05]  # P("FREE"|Spam), P("FREE"|Ham)

# Calculate P("FREE")
evidence_prob = calculate_evidence_probability(
    ['spam', 'ham'], priors, likelihoods
)

# Calculate P(Spam|"FREE")
prob_spam_given_free = bayes_theorem(
    prior=priors[0],           # P(Spam)
    likelihood=likelihoods[0], # P("FREE"|Spam)
    evidence=evidence_prob     # P("FREE")
)

print(f"P(Evidence) = {evidence_prob:.3f}")
print(f"P(Spam|'FREE') = {prob_spam_given_free:.3f}")
# Output: P(Spam|'FREE') = 0.960
```

### Example 4: Medical Diagnosis with Multiple Tests

```python
class BayesianDiagnosis:
    def __init__(self, disease_name, base_rate):
        self.disease_name = disease_name
        self.prior = base_rate
        self.current_probability = base_rate
        self.tests_performed = []
  
    def add_test_result(self, test_name, result, sensitivity, specificity):
        """
        Update probability based on test result
        sensitivity: P(Positive|Disease) - true positive rate
        specificity: P(Negative|No Disease) - true negative rate
        """
        if result == 'positive':
            likelihood_disease = sensitivity
            likelihood_no_disease = 1 - specificity
        else:  # negative result
            likelihood_disease = 1 - sensitivity
            likelihood_no_disease = specificity
      
        # Calculate evidence probability
        evidence_prob = (likelihood_disease * self.current_probability + 
                        likelihood_no_disease * (1 - self.current_probability))
      
        # Update using Bayes' theorem
        self.current_probability = (likelihood_disease * self.current_probability) / evidence_prob
      
        self.tests_performed.append({
            'test': test_name,
            'result': result,
            'probability_after': self.current_probability
        })
  
    def get_diagnosis_summary(self):
        return {
            'disease': self.disease_name,
            'initial_probability': self.prior,
            'current_probability': self.current_probability,
            'tests': self.tests_performed
        }

# Example: Diagnosing rare disease
diagnosis = BayesianDiagnosis("Rare Disease", base_rate=0.001)

# Test 1: Blood test (90% sensitive, 95% specific) comes back positive
diagnosis.add_test_result("Blood Test", "positive", 
                         sensitivity=0.90, specificity=0.95)

# Test 2: Imaging (95% sensitive, 98% specific) comes back positive  
diagnosis.add_test_result("Imaging", "positive",
                         sensitivity=0.95, specificity=0.98)

summary = diagnosis.get_diagnosis_summary()
print(f"Disease: {summary['disease']}")
print(f"Initial probability: {summary['initial_probability']:.1%}")
print(f"Final probability: {summary['current_probability']:.1%}")

for test in summary['tests']:
    print(f"After {test['test']} ({test['result']}): {test['probability_after']:.1%}")
```

> **The programming insight** : These examples show how conditional probability and Bayes' theorem are not just theoretical concepts - they're practical tools that power real-world applications from spam filters to medical diagnosis systems. The mathematical principles translate directly into code that can make intelligent decisions under uncertainty.

 **The ultimate takeaway** : Conditional probability and Bayes' theorem provide the mathematical foundation for reasoning under uncertainty. They answer the fundamental question: "How should I update my beliefs when I gain new information?" This framework is essential for everything from scientific reasoning to artificial intelligence, from medical diagnosis to financial risk assessment. In our information-rich world, the ability to systematically update beliefs based on evidence is perhaps the most important mathematical skill for making good decisions.
