# Probability Mass Functions and Probability Density Functions: Mapping Probability Across Outcomes

## The Fundamental "Why": The Distribution Problem

Imagine you're a teacher grading exams. You could simply report the class average, but that tells an incomplete story. A class where everyone gets 85% is very different from a class where half get 100% and half get 70%, even though both average 85%.

What you really need is a **complete picture of how probability is distributed** across all possible outcomes. This is exactly what probability mass functions (PMFs) and probability density functions (PDFs) provide.

> **The key insight here is**: Knowing that "something will happen" isn't enough. We need to know HOW LIKELY each specific outcome is. PMFs and PDFs are the mathematical tools that paint the complete probability picture.

## The Discrete vs Continuous Divide

### Why This Distinction Matters

Before diving into PMFs and PDFs, we must understand a fundamental split in the probability universe:

**Discrete outcomes**: You can count them on your fingers (even if you need a lot of fingers)
- Rolling a die: {1, 2, 3, 4, 5, 6}
- Number of customers in a store: {0, 1, 2, 3, ...}
- Coin flips: {Heads, Tails}

**Continuous outcomes**: They form an unbroken spectrum
- Height of a person: any value between, say, 4 feet and 8 feet
- Temperature: any real number within a range
- Time until next earthquake: any positive real number

> **This distinction is like the difference between a staircase and a ramp. On a staircase, you can only stand on specific steps (discrete). On a ramp, you can stand anywhere along the incline (continuous).**

### ASCII Visualization: Discrete vs Continuous

```
DISCRETE OUTCOMES (Like a staircase)
     ▲ Probability
     │
0.4  │    ■
     │    ■
0.3  │    ■     ■
     │    ■     ■
0.2  │    ■     ■     ■
     │    ■     ■     ■
0.1  │    ■     ■     ■     ■
     │    ■     ■     ■     ■
   0 └────■─────■─────■─────■─────▶ Outcome
          1     2     3     4

CONTINUOUS OUTCOMES (Like a smooth curve)
     ▲ Probability Density
     │      ╭─╮
     │    ╭─╯   ╰─╮
     │  ╭─╯       ╰─╮
     │╭─╯           ╰─╮
   0 └─────────────────────────────▶ Outcome
     0    1    2    3    4    5
```

> **The crucial difference**: In discrete cases, we can talk about the probability of exactly one outcome. In continuous cases, the probability of any exact value is essentially zero - we must talk about probability over intervals.

## Probability Mass Functions (PMFs): Discrete Probability Maps

### The Intuitive Definition

A **Probability Mass Function (PMF)** tells you the probability of each specific outcome in a discrete sample space.

**PMF Definition**: For a discrete random variable X, the PMF is:
**P(X = x) = probability that X equals exactly x**

> **Think of a PMF as a probability budget allocation. You have exactly 1.0 units of probability to distribute among all possible outcomes, and the PMF tells you how much "probability mass" sits on each outcome.**

### Building PMF Intuition with Examples

**Example 1: Fair Die**
- Sample space: {1, 2, 3, 4, 5, 6}
- PMF: P(X = k) = 1/6 for k ∈ {1, 2, 3, 4, 5, 6}

**Example 2: Unfair Coin** 
- Sample space: {Heads, Tails}
- PMF: P(X = Heads) = 0.7, P(X = Tails) = 0.3

**Example 3: Number of Heads in 3 Coin Flips**
- Sample space: {0, 1, 2, 3}
- PMF: P(X = 0) = 1/8, P(X = 1) = 3/8, P(X = 2) = 3/8, P(X = 3) = 1/8

### ASCII Visualization: PMF Examples

```
FAIR DIE PMF
P(X = x) ▲
         │
    1/6  ├ ■     ■     ■     ■     ■     ■
         │ ■     ■     ■     ■     ■     ■
         │ ■     ■     ■     ■     ■     ■
       0 └─■─────■─────■─────■─────■─────■──▶ x
           1     2     3     4     5     6

UNFAIR COIN PMF  
P(X = x) ▲
         │
    0.7  ├ ■
         │ ■
         │ ■
         │ ■
    0.3  ├ ■           ■
         │ ■           ■
         │ ■           ■
       0 └─■───────────■─────────────────────▶ x
           H           T

NUMBER OF HEADS IN 3 FLIPS
P(X = x) ▲
         │
    3/8  ├           ■           ■
         │           ■           ■
         │           ■           ■
         │           ■           ■
    1/8  ├ ■         ■           ■         ■
         │ ■         ■           ■         ■
       0 └─■─────────■───────────■─────────■──▶ x
           0         1           2         3
```

### Essential Properties of PMFs

> **PMF Property 1**: P(X = x) ≥ 0 for all x (probabilities can't be negative)

> **PMF Property 2**: Σ P(X = x) = 1 (all probabilities sum to 1)

> **PMF Property 3**: P(X ∈ A) = Σ P(X = x) for x ∈ A (probability of a set is sum of individual probabilities)

**Why these properties are inevitable**:
1. **Non-negativity**: Negative probability makes no sense
2. **Normalization**: Something must happen, so total probability is 1
3. **Additivity**: For discrete outcomes that can't overlap, probabilities add

## Probability Density Functions (PDFs): Continuous Probability Landscapes

### The Conceptual Challenge

Here's where things get tricky. For continuous random variables, asking "What's P(X = 3.14159...)?" doesn't make sense because there are infinitely many possible values, so each individual probability would be infinitesimally small.

> **The key insight**: For continuous variables, we can't ask about the probability of exact values. Instead, we ask about **probability density** - how "concentrated" probability is in different regions.

### The Intuitive Definition of PDFs

A **Probability Density Function (PDF)** tells you the "density" of probability at each point. Higher density means that outcomes near that point are more likely.

**PDF Interpretation**: 
- **f(x)** = probability density at point x
- **P(a ≤ X ≤ b) = ∫[a to b] f(x) dx** = area under the curve from a to b

> **Think of PDF like population density on a map. A high density doesn't mean more people live at that exact GPS coordinate - it means more people live in that neighborhood. Similarly, high PDF value means higher probability for nearby outcomes.**

### ASCII Visualization: PDF Intuition

```
PDF AS PROBABILITY LANDSCAPE

PROBABILITY DENSITY
      ▲
      │        ╭──╮
      │      ╭─╯  ╰─╮
      │    ╭─╯      ╰─╮
      │  ╭─╯          ╰─╮
      │╭─╯              ╰─╮
    0 └─────────────────────────▶ x
      0   1   2   3   4   5   6

INTERPRETING THE CURVE:
- Peak around x=3: High density, outcomes near 3 are most likely
- Low at extremes: Outcomes near 0 or 6 are less likely
- Total area under curve = 1 (total probability)

PROBABILITY OF INTERVALS:
P(2 ≤ X ≤ 4) = Shaded area under curve
      ▲
      │        ╭──╮
      │      ╭─╯██╰─╮
      │    ╭─╯████████╰─╮
      │  ╭─╯████████████╰─╮
      │╭─╯████████████████╰─╮
    0 └─────────────────────────▶ x
      0   1   2   3   4   5   6
                ↑       ↑
              a=2     b=4
```

### Common PDF Examples

**Example 1: Uniform Distribution**
- All values in [a,b] equally likely
- PDF: f(x) = 1/(b-a) for a ≤ x ≤ b, 0 elsewhere

**Example 2: Normal (Gaussian) Distribution**
- Bell-shaped curve
- PDF: f(x) = (1/√(2πσ²)) × e^(-(x-μ)²/(2σ²))

**Example 3: Exponential Distribution**  
- Models waiting times
- PDF: f(x) = λe^(-λx) for x ≥ 0

### ASCII Visualization: Common PDF Shapes

```
UNIFORM PDF (Rectangle)
f(x) ▲
     │
 1/3 ├■■■■■■■■■■■■■
     │■■■■■■■■■■■■■
     │■■■■■■■■■■■■■
   0 └■■■■■■■■■■■■■────────▶ x
     0           3

NORMAL PDF (Bell Curve)
f(x) ▲
     │      ╭─╮
     │    ╭─╯ ╰─╮
     │  ╭─╯     ╰─╮
     │╭─╯         ╰─╮
   0 └─────────────────▶ x
    -3  -1   0   1   3

EXPONENTIAL PDF (Decay Curve)
f(x) ▲
     │■
     │■╲
     │■ ╲
     │■  ╲
     │■   ╲___
   0 └■─────────────────▶ x
     0   1   2   3   4
```

## Essential Properties of PDFs

> **PDF Property 1**: f(x) ≥ 0 for all x (density can't be negative)

> **PDF Property 2**: ∫[-∞ to ∞] f(x) dx = 1 (total area under curve is 1)

> **PDF Property 3**: P(a ≤ X ≤ b) = ∫[a to b] f(x) dx (probability equals area)

> **PDF Property 4**: P(X = any exact value) = 0 (probability of exact values is zero)

**Why these properties make sense**:
1. **Non-negativity**: Can't have "negative concentration" of probability
2. **Total area = 1**: All probability must be accounted for somewhere
3. **Area = probability**: This is the definition that makes PDFs useful
4. **Exact values have zero probability**: There are infinitely many possibilities

## The Profound Difference: Mass vs Density

### Why the Distinction Matters

The difference between PMF and PDF isn't just technical - it reflects a fundamental difference in the nature of randomness:

**PMF (Discrete)**:
- Probability is concentrated at specific points
- P(X = x) has direct meaning
- Sum probabilities to get totals

**PDF (Continuous)**:
- Probability is spread continuously
- f(x) is density, not probability
- Integrate to get probabilities

> **This is like the difference between counting people in seats (discrete) vs measuring the flow of water in a river (continuous). In the theater, you count individuals. In the river, you measure the rate of flow at each point.**

### ASCII Visualization: Mass vs Density Comparison

```
PMF: PROBABILITY MASS (Discrete)
Each bar represents actual probability
     ▲ P(X = x)
0.3  ├ ■
     │ ■
0.2  ├ ■     ■
     │ ■     ■
0.1  ├ ■     ■     ■
     │ ■     ■     ■
   0 └─■─────■─────■──▶ x
       1     2     3

PDF: PROBABILITY DENSITY (Continuous)  
Height represents density, area represents probability
     ▲ f(x)
     │    ╭─╮
     │  ╭─╯ ╰─╮
     │╭─╯     ╰─╮
   0 └─────────────▶ x
     1    2    3

KEY DIFFERENCES:
PMF: Height = Probability
PDF: Height = Density, Area = Probability
```

## Real-World Applications and Examples

### Application 1: Quality Control (PMF)

**Scenario**: A factory produces light bulbs. Each hour, they inspect a batch and count defective bulbs.

**Random Variable**: X = number of defective bulbs per batch
**Sample Space**: {0, 1, 2, 3, ...} (discrete)
**PMF**: Might follow Poisson distribution

```
DEFECTIVE BULBS PMF
P(X = k) ▲
         │
    0.4  ├ ■
         │ ■
    0.3  ├ ■     ■
         │ ■     ■
    0.2  ├ ■     ■     ■
         │ ■     ■     ■
    0.1  ├ ■     ■     ■     ■
         │ ■     ■     ■     ■
       0 └─■─────■─────■─────■──▶ k
           0     1     2     3

Interpretation:
- 40% chance of 0 defects (most common)
- 30% chance of exactly 1 defect  
- 20% chance of exactly 2 defects
- 10% chance of exactly 3 defects
```

### Application 2: Human Height (PDF)

**Scenario**: Measuring adult heights in a population

**Random Variable**: X = height in inches  
**Sample Space**: [60, 84] (continuous)
**PDF**: Normal distribution with μ = 68, σ = 3

```
HEIGHT PDF
f(x) ▲
     │      ╭─╮
     │    ╭─╯ ╰─╮
     │  ╭─╯     ╰─╮
     │╭─╯         ╰─╮
   0 └─────────────────▶ x (inches)
    60  65  68  71  76

Interpretation:
- Peak at 68 inches (average height)
- Most people between 65-71 inches
- Very few people below 60 or above 76
- P(67 ≤ Height ≤ 69) = area under curve
```

### Application 3: Customer Service (PDF)

**Scenario**: Time between customer service calls

**Random Variable**: X = time until next call (minutes)
**Sample Space**: [0, ∞) (continuous)  
**PDF**: Exponential distribution

```
CALL WAITING TIME PDF
f(x) ▲
     │■
     │■╲
     │■ ╲
     │■  ╲
     │■   ╲____
   0 └■─────────────▶ x (minutes)
     0  2  4  6  8

Interpretation:
- Very likely to get call soon (high density near 0)
- Probability decreases exponentially with time
- P(Wait ≤ 2 minutes) = large area near origin
- P(Wait > 10 minutes) = small tail area
```

## The Cumulative Connection: CDFs

### The Bridge Between PMFs and PDFs

Both PMFs and PDFs connect to **Cumulative Distribution Functions (CDFs)**:

**For Discrete**: F(x) = Σ P(X = k) for all k ≤ x
**For Continuous**: F(x) = ∫[-∞ to x] f(t) dt

> **The CDF is like a running total of probability. It tells you the probability that the random variable is less than or equal to any given value.**

### ASCII Visualization: PMF/PDF to CDF

```
FROM PMF TO CDF (Discrete)
PMF                    CDF (Step Function)
P(X=k) ▲               F(x) ▲
       │                    │ 1.0 ┌─────────
   0.4 ├ ■                  │     │
       │ ■              0.7 ├─────┘
   0.3 ├ ■     ■             │
       │ ■     ■         0.4 ├─────┘
       │ ■     ■             │
     0 └─■─────■──▶ k      0 └─────────▶ x
         1     2               1   2

FROM PDF TO CDF (Continuous)  
PDF                    CDF (Smooth Function)
f(x) ▲                 F(x) ▲
     │   ╭─╮                │      ╭─────
     │ ╭─╯ ╰─╮              │    ╭─╯
     │╱╯     ╰╲             │  ╭─╯
   0 └─────────▶ x        0 └╱─╯─────▶ x
     1   2   3              1  2  3
```

## Working with PMFs and PDFs: Practical Calculations

### For PMFs (Discrete)

**Calculate P(X = k)**: Read directly from PMF
**Calculate P(X ∈ A)**: Sum PMF values for all k in set A
**Calculate E[X]**: Σ k × P(X = k) (expected value)
**Calculate Var(X)**: Σ (k - μ)² × P(X = k) (variance)

### For PDFs (Continuous)

**Calculate P(a ≤ X ≤ b)**: ∫[a to b] f(x) dx
**Calculate E[X]**: ∫[-∞ to ∞] x × f(x) dx (expected value)
**Calculate Var(X)**: ∫[-∞ to ∞] (x - μ)² × f(x) dx (variance)

> **The key difference**: Discrete uses sums, continuous uses integrals. But the underlying logic is identical - weight each outcome by its probability/density.

## Simple Code Examples

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from collections import Counter
import math

# 1. BASIC PMF IMPLEMENTATION
class DiscretePMF:
    """Implementation of Probability Mass Function for discrete random variables"""
    
    def __init__(self, outcomes, probabilities):
        """Initialize PMF with outcomes and their probabilities"""
        if len(outcomes) != len(probabilities):
            raise ValueError("Outcomes and probabilities must have same length")
        
        if abs(sum(probabilities) - 1.0) > 1e-10:
            raise ValueError("Probabilities must sum to 1")
        
        if any(p < 0 for p in probabilities):
            raise ValueError("Probabilities must be non-negative")
        
        self.outcomes = list(outcomes)
        self.probabilities = list(probabilities)
        self.pmf_dict = dict(zip(outcomes, probabilities))
    
    def probability(self, outcome):
        """Get probability of specific outcome"""
        return self.pmf_dict.get(outcome, 0.0)
    
    def probability_range(self, outcome_set):
        """Get probability that outcome is in given set"""
        return sum(self.probability(x) for x in outcome_set)
    
    def expected_value(self):
        """Calculate expected value E[X]"""
        return sum(x * self.probability(x) for x in self.outcomes)
    
    def variance(self):
        """Calculate variance Var(X)"""
        mu = self.expected_value()
        return sum((x - mu)**2 * self.probability(x) for x in self.outcomes)
    
    def plot(self, title="PMF"):
        """Plot the PMF as a bar chart"""
        plt.figure(figsize=(10, 6))
        plt.bar(self.outcomes, self.probabilities, alpha=0.7, edgecolor='black')
        plt.xlabel('Outcome')
        plt.ylabel('Probability P(X = x)')
        plt.title(title)
        plt.grid(True, alpha=0.3)
        
        # Add probability values on top of bars
        for x, p in zip(self.outcomes, self.probabilities):
            plt.text(x, p + 0.01, f'{p:.3f}', ha='center', va='bottom')
        
        plt.tight_layout()
        plt.show()


# 2. BASIC PDF IMPLEMENTATION 
class ContinuousPDF:
    """Implementation for working with Probability Density Functions"""
    
    def __init__(self, pdf_function, domain):
        """Initialize with PDF function and domain"""
        self.pdf_function = pdf_function
        self.domain = domain  # (min, max) tuple
    
    def density(self, x):
        """Get probability density at point x"""
        if self.domain[0] <= x <= self.domain[1]:
            return self.pdf_function(x)
        return 0.0
    
    def probability(self, a, b, n_points=1000):
        """Calculate P(a ≤ X ≤ b) using numerical integration"""
        if a > b:
            return 0.0
        
        # Numerical integration using trapezoidal rule
        x_points = np.linspace(max(a, self.domain[0]), 
                              min(b, self.domain[1]), n_points)
        y_points = [self.density(x) for x in x_points]
        
        # Trapezoidal rule
        dx = (x_points[-1] - x_points[0]) / (n_points - 1)
        integral = dx * (sum(y_points) - 0.5 * (y_points[0] + y_points[-1]))
        return max(0.0, integral)
    
    def expected_value(self, n_points=1000):
        """Calculate expected value E[X] using numerical integration"""
        x_points = np.linspace(self.domain[0], self.domain[1], n_points)
        integrand = [x * self.density(x) for x in x_points]
        
        dx = (self.domain[1] - self.domain[0]) / (n_points - 1)
        return dx * (sum(integrand) - 0.5 * (integrand[0] + integrand[-1]))
    
    def plot(self, title="PDF", n_points=1000):
        """Plot the PDF"""
        x_points = np.linspace(self.domain[0], self.domain[1], n_points)
        y_points = [self.density(x) for x in x_points]
        
        plt.figure(figsize=(10, 6))
        plt.plot(x_points, y_points, linewidth=2, color='blue')
        plt.fill_between(x_points, y_points, alpha=0.3, color='blue')
        plt.xlabel('x')
        plt.ylabel('Probability Density f(x)')
        plt.title(title)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.show()


# 3. REAL WORLD EXAMPLE 1: QUALITY CONTROL (PMF)
def quality_control_example():
    """Demonstrate PMF with defective bulbs example"""
    
    print("QUALITY CONTROL EXAMPLE: Defective Light Bulbs")
    print("=" * 55)
    
    # Create PMF for number of defective bulbs (Poisson-like distribution)
    defects = [0, 1, 2, 3, 4, 5]
    probabilities = [0.4, 0.3, 0.15, 0.08, 0.05, 0.02]
    
    pmf = DiscretePMF(defects, probabilities)
    
    print("PMF for number of defective bulbs per batch:")
    for k in defects:
        print(f"P(X = {k}) = {pmf.probability(k):.3f}")
    
    print(f"\nExpected number of defects: {pmf.expected_value():.2f}")
    print(f"Variance: {pmf.variance():.2f}")
    print(f"Standard deviation: {math.sqrt(pmf.variance()):.2f}")
    
    # Calculate some practical probabilities
    print(f"\nPractical Questions:")
    print(f"P(No defects) = {pmf.probability(0):.3f}")
    print(f"P(At most 2 defects) = {pmf.probability_range([0, 1, 2]):.3f}")
    print(f"P(More than 2 defects) = {pmf.probability_range([3, 4, 5]):.3f}")
    
    # Plot the PMF
    pmf.plot("Quality Control: Number of Defective Bulbs")


# 4. REAL WORLD EXAMPLE 2: HUMAN HEIGHT (PDF)
def height_distribution_example():
    """Demonstrate PDF with human height example"""
    
    print("\nHUMAN HEIGHT EXAMPLE: Normal Distribution")
    print("=" * 45)
    
    # Parameters for height distribution (inches)
    mu = 68  # mean height
    sigma = 3  # standard deviation
    
    # Define normal PDF
    def normal_pdf(x):
        return (1 / (sigma * math.sqrt(2 * math.pi))) * \
               math.exp(-0.5 * ((x - mu) / sigma) ** 2)
    
    # Create PDF object
    height_pdf = ContinuousPDF(normal_pdf, (55, 85))
    
    print(f"Height distribution: Normal(μ={mu}, σ={sigma})")
    print(f"Expected height: {height_pdf.expected_value():.1f} inches")
    
    # Calculate practical probabilities
    print(f"\nPractical Questions:")
    print(f"P(65 ≤ Height ≤ 71) = {height_pdf.probability(65, 71):.3f}")
    print(f"P(Height ≤ 70) = {height_pdf.probability(55, 70):.3f}")
    print(f"P(Height > 72) = {height_pdf.probability(72, 85):.3f}")
    
    # Show probability density at specific points
    print(f"\nProbability densities:")
    for h in [65, 68, 71]:
        print(f"f({h}) = {height_pdf.density(h):.4f}")
    
    print("\nNote: These are densities, not probabilities!")
    print("Probability of exactly 68.000... inches is essentially 0")
    
    # Plot the PDF
    height_pdf.plot("Human Height Distribution (Normal)")


# 5. REAL WORLD EXAMPLE 3: WAITING TIMES (PDF)
def waiting_time_example():
    """Demonstrate PDF with exponential waiting times"""
    
    print("\nWAITING TIME EXAMPLE: Exponential Distribution")
    print("=" * 50)
    
    # Parameter for exponential distribution
    lambda_rate = 0.5  # rate parameter (calls per minute)
    
    # Define exponential PDF
    def exponential_pdf(x):
        if x >= 0:
            return lambda_rate * math.exp(-lambda_rate * x)
        return 0
    
    # Create PDF object
    waiting_pdf = ContinuousPDF(exponential_pdf, (0, 20))
    
    print(f"Waiting time distribution: Exponential(λ={lambda_rate})")
    print(f"Expected waiting time: {waiting_pdf.expected_value():.1f} minutes")
    
    # Calculate practical probabilities
    print(f"\nPractical Questions:")
    print(f"P(Wait ≤ 2 minutes) = {waiting_pdf.probability(0, 2):.3f}")
    print(f"P(Wait > 5 minutes) = {waiting_pdf.probability(5, 20):.3f}")
    print(f"P(2 ≤ Wait ≤ 4 minutes) = {waiting_pdf.probability(2, 4):.3f}")
    
    # Show how density decreases
    print(f"\nProbability densities (showing exponential decay):")
    for t in [0, 1, 2, 5, 10]:
        print(f"f({t}) = {waiting_pdf.density(t):.4f}")
    
    # Plot the PDF
    waiting_pdf.plot("Customer Service Waiting Time (Exponential)")


# 6. COMPARISON: DISCRETE VS CONTINUOUS
def discrete_vs_continuous_comparison():
    """Compare discrete and continuous distributions side by side"""
    
    print("\nDISCRETE vs CONTINUOUS COMPARISON")
    print("=" * 40)
    
    # Discrete: Number of customers per hour
    customers = [0, 1, 2, 3, 4, 5]
    cust_probs = [0.1, 0.2, 0.3, 0.2, 0.15, 0.05]
    discrete_pmf = DiscretePMF(customers, cust_probs)
    
    # Continuous: Customer service time  
    def service_pdf(x):
        if 0 <= x <= 10:
            return 0.1  # Uniform distribution
        return 0
    
    continuous_pdf = ContinuousPDF(service_pdf, (0, 10))
    
    print("DISCRETE: Number of customers per hour")
    print(f"P(Exactly 2 customers) = {discrete_pmf.probability(2):.3f}")
    print(f"P(At most 3 customers) = {discrete_pmf.probability_range([0,1,2,3]):.3f}")
    print(f"Expected customers: {discrete_pmf.expected_value():.2f}")
    
    print("\nCONTINUOUS: Service time per customer (minutes)")
    print(f"P(Exactly 5.0 minutes) = 0.000 (always zero!)")
    print(f"P(Service ≤ 5 minutes) = {continuous_pdf.probability(0, 5):.3f}")
    print(f"Expected service time: {continuous_pdf.expected_value():.2f} minutes")
    
    print("\nKEY DIFFERENCES:")
    print("- Discrete: Can ask about exact values")
    print("- Continuous: Must ask about intervals")
    print("- Discrete: Probabilities sum to 1")
    print("- Continuous: Area under curve equals 1")


# 7. COMMON DISTRIBUTIONS SHOWCASE
def common_distributions_showcase():
    """Showcase common PMFs and PDFs"""
    
    print("\nCOMMON DISTRIBUTIONS SHOWCASE")
    print("=" * 35)
    
    # Binomial PMF (discrete)
    print("\n1. BINOMIAL DISTRIBUTION (Discrete)")
    print("   Scenario: 10 coin flips, probability of heads")
    n, p = 10, 0.3
    outcomes = list(range(n + 1))
    probs = [stats.binom.pmf(k, n, p) for k in outcomes]
    binomial_pmf = DiscretePMF(outcomes, probs)
    print(f"   Expected heads: {binomial_pmf.expected_value():.2f}")
    
    # Normal PDF (continuous)
    print("\n2. NORMAL DISTRIBUTION (Continuous)")
    print("   Scenario: Test scores")
    def normal_pdf(x, mu=75, sigma=10):
        return stats.norm.pdf(x, mu, sigma)
    
    normal_test = ContinuousPDF(lambda x: normal_pdf(x), (40, 110))
    print(f"   Expected score: {normal_test.expected_value():.1f}")
    
    # Poisson PMF (discrete)  
    print("\n3. POISSON DISTRIBUTION (Discrete)")
    print("   Scenario: Customers arriving per hour")
    lambda_rate = 4
    outcomes = list(range(15))  # 0 to 14 customers
    probs = [stats.poisson.pmf(k, lambda_rate) for k in outcomes]
    # Normalize to ensure sum = 1 (truncated distribution)
    probs = [p / sum(probs) for p in probs]
    poisson_pmf = DiscretePMF(outcomes, probs)
    print(f"   Expected customers: {poisson_pmf.expected_value():.2f}")
    
    # Uniform PDF (continuous)
    print("\n4. UNIFORM DISTRIBUTION (Continuous)")
    print("   Scenario: Random number between 0 and 1")
    uniform_pdf = ContinuousPDF(lambda x: 1.0, (0, 1))
    print(f"   Expected value: {uniform_pdf.expected_value():.2f}")
    print(f"   P(0.3 ≤ X ≤ 0.7): {uniform_pdf.probability(0.3, 0.7):.2f}")


# 8. PRACTICAL CALCULATIONS DEMO
def practical_calculations_demo():
    """Demonstrate practical calculations with PMFs and PDFs"""
    
    print("\nPRACTICAL CALCULATIONS DEMO")
    print("=" * 35)
    
    # Create a realistic sales scenario (discrete)
    print("SCENARIO: Daily sales (number of items)")
    sales = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    sales_probs = [0.05, 0.1, 0.15, 0.2, 0.2, 0.15, 0.1, 0.03, 0.02]
    sales_pmf = DiscretePMF(sales, sales_probs)
    
    print(f"Expected daily sales: {sales_pmf.expected_value():.2f} items")
    print(f"Standard deviation: {math.sqrt(sales_pmf.variance()):.2f} items")
    
    # Business questions
    print("\nBusiness Questions:")
    print(f"P(Sell at least 3 items) = {sales_pmf.probability_range([3,4,5,6,7,8]):.3f}")
    print(f"P(Sell exactly 5 items) = {sales_pmf.probability(5):.3f}")
    print(f"P(Sell more than 6 items) = {sales_pmf.probability_range([7,8]):.3f}")
    
    # Monthly projections (Central Limit Theorem preview)
    monthly_expected = 30 * sales_pmf.expected_value()
    monthly_std = math.sqrt(30) * math.sqrt(sales_pmf.variance())
    print(f"\nMonthly projections (30 days):")
    print(f"Expected monthly sales: {monthly_expected:.1f} items")
    print(f"Standard deviation: {monthly_std:.1f} items")


# 9. RUN ALL EXAMPLES
def run_all_examples():
    """Execute all PMF and PDF examples"""
    
    print("PROBABILITY MASS FUNCTIONS AND PROBABILITY DENSITY FUNCTIONS")
    print("=" * 70)
    print("Complete demonstration of discrete and continuous probability distributions")
    
    # Run all examples
    quality_control_example()
    height_distribution_example()
    waiting_time_example()
    discrete_vs_continuous_comparison()
    common_distributions_showcase()
    practical_calculations_demo()
    
    print("\n" + "=" * 70)
    print("SUMMARY OF KEY INSIGHTS:")
    print("1. PMFs: Used for discrete outcomes, probabilities sum to 1")
    print("2. PDFs: Used for continuous outcomes, area under curve = 1")  
    print("3. Discrete: Can find P(X = exact value)")
    print("4. Continuous: Can only find P(a ≤ X ≤ b)")
    print("5. Both: Describe complete probability distributions")
    print("6. Applications: Quality control, measurements, waiting times")
    print("\nPMFs and PDFs are the foundation for understanding")
    print("how probability is distributed across all possible outcomes!")


# Execute all examples
if __name__ == "__main__":
    run_all_examples()
```

## The Meta-Insight: PMFs and PDFs as Probability Maps

### The Universal Pattern

Whether we're dealing with discrete or continuous random variables, PMFs and PDFs serve the same fundamental purpose: **they create a complete map of how probability is distributed across all possible outcomes.**

> **The profound insight**: PMFs and PDFs answer the most fundamental question in probability: "If I know something random will happen, how should I allocate my expectations across all the possibilities?"

### ASCII Visualization: The Complete Probability Landscape

```
THE PROBABILITY LANDSCAPE

DISCRETE WORLD (PMF)          CONTINUOUS WORLD (PDF)
"Probability Islands"         "Probability Terrain"

     ▲ P(X = x)                   ▲ f(x)
     │                            │     ╭─╮
0.3  ├ ■                          │   ╭─╯ ╰─╮
     │ ■                          │ ╭─╯     ╰─╮
0.2  ├ ■     ■                    │╱╯         ╰╲
     │ ■     ■                    └─────────────────▶ x
0.1  ├ ■     ■     ■              0  1  2  3  4  5
     │ ■     ■     ■              
   0 └─■─────■─────■──▶ x         Area under curve = 1
     1     2     3               Each point has density,
                                 intervals have probability
   Each point has probability

COMMON PURPOSE: Map probability across all outcomes
DIFFERENT METHODS: Sum vs Integrate
SAME RESULT: Complete picture of randomness
```

### The Philosophy of Distributional Thinking

PMFs and PDFs represent a profound shift in how we think about uncertainty:

**Pre-distributional thinking**: "What will happen?"
**Distributional thinking**: "What's the complete landscape of possibilities and their likelihoods?"

This shift enables:
- **Risk assessment**: Understanding not just expected outcomes but their variability
- **Decision optimization**: Choosing actions that perform well across the entire distribution
- **Uncertainty quantification**: Expressing exactly how uncertain we are

> **The meta-insight**: PMFs and PDFs don't just describe random variables - they describe how to think systematically about any uncertain situation. They're the mathematical language for expressing the complete structure of uncertainty.

## Applications Beyond Mathematics

### In Science and Engineering
- **Physics**: Quantum mechanics uses PDFs to describe particle positions and momenta
- **Signal processing**: PDFs characterize noise and signal distributions
- **Quality control**: PMFs model defect rates and failure patterns

### In Data Science and AI  
- **Machine learning**: Algorithms often model probability distributions over predictions
- **Natural language processing**: PMFs describe word frequencies and language patterns
- **Computer vision**: PDFs model pixel intensities and image features

### In Finance and Economics
- **Risk management**: PDFs model asset returns and portfolio losses
- **Insurance**: PMFs model claim frequencies and amounts
- **Options pricing**: PDFs describe future stock price distributions

### In Social Sciences
- **Psychology**: PMFs model response patterns in experiments
- **Sociology**: PDFs describe income distributions and social phenomena
- **Political science**: PMFs model voting patterns and election outcomes

> **The universal insight**: Every field that deals with uncertainty - which is essentially every field - uses PMFs and PDFs to make sense of randomness. They're not just mathematical tools; they're fundamental ways of understanding and navigating an uncertain world.

## The Journey Forward

Understanding PMFs and PDFs opens the door to:

1. **Advanced probability theory**: Multiple random variables, transformations, limit theorems
2. **Statistical inference**: Using data to estimate unknown distributions
3. **Bayesian statistics**: Updating probability distributions with new evidence
4. **Machine learning**: Algorithms that learn probability distributions from data
5. **Stochastic processes**: How random variables evolve over time

> **Final insight**: PMFs and PDFs are not endpoints - they're foundations. Master them, and you have the conceptual framework to understand how probability theory connects to statistics, machine learning, physics, economics, and virtually every quantitative field. They're the mathematical language of uncertainty itself.

**The practical takeaway**: Every time you see a histogram, a bell curve, or hear about "data distribution," you're seeing PMFs and PDFs in action. They're everywhere because uncertainty is everywhere, and these functions are our best tools for understanding and working with uncertainty systematically.