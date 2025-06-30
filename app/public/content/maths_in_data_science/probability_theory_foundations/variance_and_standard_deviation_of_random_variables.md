# Variance and Standard Deviation: Measuring the Spread of Uncertainty

## The Fundamental "Why": The Inadequacy of Averages

Imagine you're choosing between two jobs:

**Job A**: Salary could be $45,000, $50,000, or $55,000 (each equally likely)
**Job B**: Salary could be $10,000, $50,000, or $90,000 (each equally likely)

Both jobs have the same expected salary: $50,000. But they feel completely different, don't they? Job A offers predictability, while Job B is a wild gamble.

The expected value tells us the "center" of a probability distribution, but it says nothing about how **spread out** the outcomes are around that center.

> **The key insight here is**: Knowing the average isn't enough. We need to quantify uncertainty itself - how much do outcomes typically deviate from what we expect? This is exactly what variance and standard deviation measure.

## The Intuitive Problem: Measuring "Spreadness"

### Why We Need a Measure of Spread

Consider these three scenarios, all with the same expected value of 10:

**Scenario 1**: Always get exactly 10 (no uncertainty)
**Scenario 2**: Get 9, 10, or 11 (low uncertainty)  
**Scenario 3**: Get 0, 10, or 20 (high uncertainty)

We intuitively understand that these are fundamentally different, but how do we quantify that difference mathematically?

> **This is like asking "How bumpy is this road?" Just knowing the average elevation doesn't tell you whether it's a smooth highway or a rocky mountain path. We need a measure of how much the road varies from its average level.**

### ASCII Visualization: Same Mean, Different Spread

```
SAME EXPECTED VALUE, DIFFERENT SPREADS

SCENARIO 1: No Variability
Values: 10, 10, 10
     ▲ Probability
1.0  │  ■
     │  ■
     │  ■
   0 └──■────────────▶ Value
        10
Expected Value = 10, Very predictable

SCENARIO 2: Low Variability  
Values: 9, 10, 11
     ▲ Probability
     │
0.33 │ ■  ■  ■
     │ ■  ■  ■
     │ ■  ■  ■
   0 └─■──■──■──────▶ Value
       9 10 11
Expected Value = 10, Somewhat predictable

SCENARIO 3: High Variability
Values: 0, 10, 20
     ▲ Probability
     │
0.33 │ ■     ■     ■
     │ ■     ■     ■
     │ ■     ■     ■
   0 └─■─────■─────■─▶ Value
       0    10    20
Expected Value = 10, Very unpredictable!
```

> **The fundamental necessity**: Expected value alone is insufficient for decision-making under uncertainty. We need a companion measure that captures how "risky" or "variable" an outcome is likely to be.

## Building Intuition: The Deviation Concept

### First Attempt: Average Deviation

Our first instinct might be to measure how far outcomes typically are from the expected value:

**Average Deviation = E[|X - μ|]**

This seems reasonable, but the absolute value makes it mathematically awkward. Let's try something else.

### Second Attempt: Average of Deviations

What about just averaging the deviations without absolute values?

**E[X - μ] = E[X] - μ = μ - μ = 0**

This always equals zero! Positive and negative deviations cancel out, telling us nothing about spread.

### The Winning Idea: Squared Deviations

The solution is to square the deviations before averaging them:

**Variance = E[(X - μ)²]**

> **Why squaring works**: Squaring eliminates the sign problem (all squared deviations are positive), emphasizes larger deviations more than smaller ones, and creates mathematically convenient properties.

### ASCII Visualization: Why Squaring Works

```
UNDERSTANDING SQUARED DEVIATIONS

Example: X can be 6, 10, or 14 (μ = 10)

Outcome | Deviation | Squared Deviation
--------|-----------|------------------
   6    |   -4      |        16
  10    |    0      |         0  
  14    |   +4      |        16

Average Deviation = (-4 + 0 + 4)/3 = 0  ← Useless!
Average Squared Deviation = (16 + 0 + 16)/3 = 32/3 ≈ 10.67

The variance captures the "typical squared distance from the mean"
```

> **The beautiful logic**: Variance measures the expected squared distance from the mean. It's always non-negative, equals zero only when there's no variability, and increases as outcomes become more spread out.

## Mathematical Definitions: Discrete and Continuous

### Variance for Discrete Random Variables

For a discrete random variable X with expected value μ:

**Var(X) = E[(X - μ)²] = Σ (x - μ)² P(X = x)**

**Alternative formula**: Var(X) = E[X²] - (E[X])²

### Variance for Continuous Random Variables

For a continuous random variable X with expected value μ:

**Var(X) = E[(X - μ)²] = ∫ (x - μ)² f(x) dx**

**Alternative formula**: Var(X) = E[X²] - (E[X])²

### Standard Deviation: Getting Back to Original Units

**Standard Deviation = σ = √Var(X)**

> **Why take the square root**: Variance is in squared units (dollars², inches², etc.), which is hard to interpret. Standard deviation returns to the original units, making it more intuitive.

### ASCII Visualization: Variance vs Standard Deviation Units

```
UNDERSTANDING UNITS

If X = height in inches:
μ = 68 inches
Var(X) = 9 inches²     ← Squared units (hard to interpret)
σ = 3 inches           ← Original units (easy to interpret)

INTERPRETATION:
"Heights typically deviate from the mean by about 3 inches"
Much clearer than:
"The expected squared deviation is 9 square inches"
```

## Working Examples: Building Deep Understanding

### Example 1: Simple Discrete Distribution

**Problem**: X represents the number of customers per hour. X can be 2, 3, or 4, each with probability 1/3.

**Step 1**: Calculate expected value
μ = E[X] = (2)(1/3) + (3)(1/3) + (4)(1/3) = 9/3 = 3

**Step 2**: Calculate variance using definition
Var(X) = E[(X - μ)²]
- When X = 2: (2 - 3)² = 1
- When X = 3: (3 - 3)² = 0  
- When X = 4: (4 - 3)² = 1

Var(X) = (1)(1/3) + (0)(1/3) + (1)(1/3) = 2/3

**Step 3**: Calculate standard deviation
σ = √(2/3) ≈ 0.816

### ASCII Visualization: Simple Discrete Example

```
DISCRETE VARIANCE CALCULATION

X values: 2, 3, 4 (each probability 1/3)
μ = 3

     ▲ Probability
     │
1/3  ├ ■     ■     ■
     │ ■     ■     ■
     │ ■     ■     ■
   0 └─■─────■─────■──▶ X
       2     3     4
       ↑     ↑     ↑
    -1 from μ  0   +1 from μ

Squared deviations: 1, 0, 1
Variance = (1×1/3) + (0×1/3) + (1×1/3) = 2/3
Standard deviation = √(2/3) ≈ 0.816
```

### Example 2: Alternative Formula Verification

Using the same example, let's verify with the alternative formula:

**Var(X) = E[X²] - (E[X])²**

**Step 1**: Calculate E[X²]
E[X²] = (2²)(1/3) + (3²)(1/3) + (4²)(1/3) = (4 + 9 + 16)/3 = 29/3

**Step 2**: Apply formula
Var(X) = E[X²] - (E[X])² = 29/3 - 3² = 29/3 - 9 = 29/3 - 27/3 = 2/3 ✓

> **Why the alternative formula works**: It's algebraically equivalent but often computationally easier, especially when you already know E[X] and can calculate E[X²] directly.

### Example 3: Continuous Distribution

**Problem**: X is uniformly distributed on [0, 6]. Find variance and standard deviation.

**Step 1**: Expected value for uniform distribution
μ = (a + b)/2 = (0 + 6)/2 = 3

**Step 2**: Variance for uniform distribution  
For uniform on [a,b]: Var(X) = (b - a)²/12 = (6 - 0)²/12 = 36/12 = 3

**Step 3**: Standard deviation
σ = √3 ≈ 1.732

**Interpretation**: Values typically deviate from the mean (3) by about 1.732 units.

## Properties of Variance: The Mathematical Rules

### Essential Properties

> **Property 1**: Var(X) ≥ 0 (variance is never negative)

> **Property 2**: Var(X) = 0 if and only if X is constant

> **Property 3**: Var(aX + b) = a²Var(X) (adding constants doesn't change spread; scaling by factor a scales variance by a²)

> **Property 4**: If X and Y are independent: Var(X + Y) = Var(X) + Var(Y)

> **Property 5**: Var(X - Y) = Var(X) + Var(Y) if X and Y are independent (variances add even when subtracting!)

### Why These Properties Make Sense

**Property 1**: Squared deviations are always non-negative
**Property 2**: No deviation means no variability
**Property 3**: Shifting doesn't change spread; scaling changes spread proportionally
**Property 4 & 5**: Independent uncertainties combine additively

### ASCII Visualization: Scaling Property

```
SCALING PROPERTY: Var(aX + b) = a²Var(X)

Original: X has values 1, 2, 3 (Var(X) = 2/3)
     ▲
     │ ■     ■     ■
   0 └─■─────■─────■──▶ X
       1     2     3

Transformed: Y = 2X + 5 has values 7, 9, 11
     ▲
     │      ■     ■     ■  
   0 └──────■─────■─────■──▶ Y
            7     9    11

Var(Y) = 2² × Var(X) = 4 × (2/3) = 8/3

Key insight: Multiplying by 2 makes the spread 4 times larger!
Adding 5 just shifts everything but doesn't change spread.
```

## Real-World Applications and Interpretations

### Application 1: Investment Risk

**Scenario**: Two investment portfolios with same expected return (8%), different risks.

**Portfolio A**: Returns normally distributed with σ = 2%
**Portfolio B**: Returns normally distributed with σ = 8%

**Interpretation**: 
- Portfolio A: About 68% of years will have returns between 6% and 10%
- Portfolio B: About 68% of years will have returns between 0% and 16%

Portfolio B offers the same expected return but much higher risk (variability).

### Application 2: Quality Control

**Scenario**: Manufacturing process produces bolts. Target length = 10.0 cm.

**Current Process**: μ = 10.0 cm, σ = 0.2 cm
**Improved Process**: μ = 10.0 cm, σ = 0.05 cm

**Interpretation**: The improved process has the same average but much less variability, meaning fewer defective parts.

### Application 3: Test Scores

**Scenario**: Two classes take the same exam.

**Class A**: Mean = 75, Standard Deviation = 5
**Class B**: Mean = 75, Standard Deviation = 15

**Interpretation**: 
- Class A has consistent performance (most students near 75)
- Class B has wide spread (some very high, some very low scores)

### ASCII Visualization: Risk Comparison

```
INVESTMENT RISK VISUALIZATION

LOW RISK (σ = 2%)               HIGH RISK (σ = 8%)
Returns around 8%               Returns around 8%

     ▲ Probability                   ▲ Probability  
     │     ╭─╮                       │   ╭─╮
     │   ╭─╯ ╰─╮                     │ ╭─╯   ╰─╮
     │ ╭─╯     ╰─╮                   │╱╯       ╰╲
   0 └─────────────▶ Return        0 └─────────────▶ Return
     2  4  6  8 10 12 14           -8 -4  0  4  8 12 16 20 24

     Predictable returns             Volatile returns
     Lower risk                      Higher risk
```

## The Empirical Rule: Understanding Standard Deviation

### For Normal Distributions

When data follows a normal distribution:
- **68%** of values fall within 1 standard deviation of the mean
- **95%** of values fall within 2 standard deviations of the mean  
- **99.7%** of values fall within 3 standard deviations of the mean

### ASCII Visualization: The Empirical Rule

```
THE EMPIRICAL RULE (Normal Distribution)

                    μ-3σ   μ-2σ   μ-σ  μ    μ+σ   μ+2σ   μ+3σ
                      │     │     │   │     │     │     │
        ▲ Density     │     │     │   │     │     │     │
        │             │     │   ╭─╯   │     ╰─╮   │     │     
        │             │   ╭─╯         │           ╰─╮   │     
        │           ╭─╯               │                 ╰─╮     
      0 └─────────────────────────────│─────────────────────▶ X
                                      μ

                    ├────── 68% ──────┤
                ├─────── 95% ─────────┤  
            ├────────── 99.7% ──────────┤

This is why σ is so useful for interpretation!
```

> **The power of standard deviation**: It provides a universal ruler for measuring how "unusual" an observation is, regardless of the specific distribution (for normal distributions).

## Common Misconceptions and Pitfalls

### Misconception 1: Variance Units

**Wrong thinking**: "Variance is just like standard deviation"
**Reality**: Variance is in squared units, making it less interpretable than standard deviation

### Misconception 2: Variability Direction

**Wrong thinking**: "High variance means values are usually above the mean"
**Reality**: High variance means values are spread out (both above AND below the mean)

### Misconception 3: Independence and Variance

**Wrong thinking**: "Var(X + Y) = Var(X) + Var(Y) always"
**Reality**: This only holds when X and Y are independent

### Misconception 4: Linear Relationships

**Wrong thinking**: "If X doubles, variance doubles"
**Reality**: If X is scaled by factor a, variance scales by a²

### ASCII Visualization: Common Mistakes

```
COMMON VARIANCE MISCONCEPTIONS

MISTAKE 1: Thinking variance = standard deviation
   Var(X) = 16        σ = 4
   These are NOT the same!
   16 square units ≠ 4 units

MISTAKE 2: Thinking high variance means "higher values"
   HIGH VARIANCE = More spread (both directions)
   ▲                              ▲
   │   ╭─╮                        │╭─╮
   │ ╭─╯ ╰─╮                      ╱╯ ╰╲
   └─────────▶                  └─────────▶
   Low variance                 High variance
   (concentrated)               (spread out both ways)

MISTAKE 3: Adding variances when variables aren't independent
   If X and Y are correlated:
   Var(X + Y) ≠ Var(X) + Var(Y)
   Must account for covariance!
```

## Advanced Topics: Covariance and Correlation

### When Variables Aren't Independent

For dependent variables X and Y:
**Var(X + Y) = Var(X) + Var(Y) + 2Cov(X,Y)**

Where **Cov(X,Y) = E[(X - μₓ)(Y - μᵧ)]** is the covariance.

### Correlation Coefficient

**ρ = Cov(X,Y) / (σₓσᵧ)**

- ρ = 1: Perfect positive correlation
- ρ = 0: No linear correlation  
- ρ = -1: Perfect negative correlation

> **The connection**: Variance extends naturally to covariance (measuring how two variables vary together), which leads to correlation (standardized covariance).

## Computational Approaches

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats
from fractions import Fraction
import math

# 1. BASIC VARIANCE CALCULATOR FOR DISCRETE DISTRIBUTIONS
class DiscreteVariance:
    """Calculate variance and standard deviation for discrete random variables"""
    
    def __init__(self, values, probabilities):
        """Initialize with values and their probabilities"""
        if len(values) != len(probabilities):
            raise ValueError("Values and probabilities must have same length")
        
        if abs(sum(probabilities) - 1.0) > 1e-10:
            raise ValueError("Probabilities must sum to 1")
        
        self.values = list(values)
        self.probabilities = list(probabilities)
    
    def expected_value(self):
        """Calculate E[X]"""
        return sum(x * p for x, p in zip(self.values, self.probabilities))
    
    def expected_value_squared(self):
        """Calculate E[X²]"""
        return sum(x**2 * p for x, p in zip(self.values, self.probabilities))
    
    def variance_definition(self):
        """Calculate variance using definition: E[(X - μ)²]"""
        mu = self.expected_value()
        return sum((x - mu)**2 * p for x, p in zip(self.values, self.probabilities))
    
    def variance_alternative(self):
        """Calculate variance using alternative formula: E[X²] - (E[X])²"""
        return self.expected_value_squared() - (self.expected_value())**2
    
    def standard_deviation(self):
        """Calculate standard deviation"""
        return math.sqrt(self.variance_definition())
    
    def print_analysis(self, name="Random Variable"):
        """Print complete variance analysis"""
        mu = self.expected_value()
        var_def = self.variance_definition()
        var_alt = self.variance_alternative()
        std = self.standard_deviation()
        
        print(f"\nVARIANCE ANALYSIS: {name}")
        print("=" * 50)
        
        print("Distribution:")
        for x, p in zip(self.values, self.probabilities):
            print(f"  P(X = {x}) = {p:.4f}")
        
        print(f"\nCalculations:")
        print(f"E[X] = {mu:.4f}")
        print(f"E[X²] = {self.expected_value_squared():.4f}")
        print(f"Var(X) using definition = {var_def:.4f}")
        print(f"Var(X) using formula = {var_alt:.4f}")
        print(f"Standard deviation σ = {std:.4f}")
        
        # Show step-by-step for definition method
        print(f"\nStep-by-step (definition method):")
        total_var = 0
        for x, p in zip(self.values, self.probabilities):
            deviation = x - mu
            squared_dev = deviation**2
            contribution = squared_dev * p
            total_var += contribution
            print(f"  ({x} - {mu:.2f})² × {p:.4f} = {squared_dev:.4f} × {p:.4f} = {contribution:.4f}")
        print(f"  Total variance = {total_var:.4f}")
        
        # Verification
        print(f"\nVerification:")
        print(f"Definition method: {var_def:.6f}")
        print(f"Alternative method: {var_alt:.6f}")
        print(f"Match: {abs(var_def - var_alt) < 1e-10}")


# 2. CONTINUOUS VARIANCE CALCULATOR
class ContinuousVariance:
    """Calculate variance for common continuous distributions"""
    
    @staticmethod
    def uniform(a, b):
        """Variance of uniform distribution on [a, b]"""
        return {
            'mean': (a + b) / 2,
            'variance': (b - a)**2 / 12,
            'std_dev': math.sqrt((b - a)**2 / 12)
        }
    
    @staticmethod
    def normal(mu, sigma):
        """Variance of normal distribution"""
        return {
            'mean': mu,
            'variance': sigma**2,
            'std_dev': sigma
        }
    
    @staticmethod
    def exponential(lambda_rate):
        """Variance of exponential distribution"""
        return {
            'mean': 1 / lambda_rate,
            'variance': 1 / lambda_rate**2,
            'std_dev': 1 / lambda_rate
        }
    
    @staticmethod
    def print_continuous_summary():
        """Print summary of common continuous distributions"""
        print("\nCOMMON CONTINUOUS DISTRIBUTIONS")
        print("=" * 40)
        
        print("1. UNIFORM on [a, b]:")
        print("   Mean = (a + b)/2")
        print("   Variance = (b - a)²/12")
        print("   Std Dev = (b - a)/√12")
        
        print("\n2. NORMAL N(μ, σ²):")
        print("   Mean = μ")
        print("   Variance = σ²")
        print("   Std Dev = σ")
        
        print("\n3. EXPONENTIAL λ:")
        print("   Mean = 1/λ")
        print("   Variance = 1/λ²")
        print("   Std Dev = 1/λ")


# 3. EXAMPLE 1: SIMPLE DISCRETE DISTRIBUTION
def simple_discrete_example():
    """Basic discrete variance example"""
    
    print("EXAMPLE 1: SIMPLE DISCRETE DISTRIBUTION")
    print("=" * 45)
    print("Number of customers per hour: 2, 3, or 4 (each equally likely)")
    
    # Create distribution
    customers = DiscreteVariance([2, 3, 4], [1/3, 1/3, 1/3])
    customers.print_analysis("Customers per Hour")
    
    # Interpretation
    mu = customers.expected_value()
    std = customers.standard_deviation()
    
    print(f"\nINTERPRETATION:")
    print(f"On average, expect {mu:.1f} customers per hour")
    print(f"Typical deviation from average: ±{std:.2f} customers")
    print(f"About 68% of hours will have between {mu-std:.1f} and {mu+std:.1f} customers")


# 4. EXAMPLE 2: INVESTMENT RISK COMPARISON
def investment_risk_example():
    """Compare investment options with different risk profiles"""
    
    print("\n\nEXAMPLE 2: INVESTMENT RISK COMPARISON")
    print("=" * 45)
    
    # Conservative investment
    print("CONSERVATIVE INVESTMENT:")
    print("Returns: 6%, 8%, 10% (probabilities: 0.3, 0.4, 0.3)")
    conservative = DiscreteVariance([6, 8, 10], [0.3, 0.4, 0.3])
    conservative.print_analysis("Conservative Investment")
    
    # Aggressive investment  
    print("\n\nAGGRESSIVE INVESTMENT:")
    print("Returns: -5%, 8%, 25% (probabilities: 0.2, 0.6, 0.2)")
    aggressive = DiscreteVariance([-5, 8, 25], [0.2, 0.6, 0.2])
    aggressive.print_analysis("Aggressive Investment")
    
    # Comparison
    cons_return = conservative.expected_value()
    cons_risk = conservative.standard_deviation()
    agg_return = aggressive.expected_value()
    agg_risk = aggressive.standard_deviation()
    
    print(f"\n\nCOMPARISON:")
    print(f"Conservative: {cons_return:.1f}% return, {cons_risk:.1f}% risk")
    print(f"Aggressive:   {agg_return:.1f}% return, {agg_risk:.1f}% risk")
    
    if cons_return == agg_return:
        print("Same expected return, but aggressive has much higher risk!")
    
    # Risk-adjusted comparison
    cons_sharpe = cons_return / cons_risk if cons_risk > 0 else float('inf')
    agg_sharpe = agg_return / agg_risk if agg_risk > 0 else float('inf')
    
    print(f"\nRisk-adjusted returns (return/risk):")
    print(f"Conservative: {cons_sharpe:.2f}")
    print(f"Aggressive: {agg_sharpe:.2f}")
    print(f"Better choice: {'Conservative' if cons_sharpe > agg_sharpe else 'Aggressive'}")


# 5. EXAMPLE 3: QUALITY CONTROL
def quality_control_example():
    """Quality control with variance analysis"""
    
    print("\n\nEXAMPLE 3: QUALITY CONTROL")
    print("=" * 30)
    
    # Current process
    print("CURRENT MANUFACTURING PROCESS:")
    print("Defects per batch: 0, 1, 2, 3 (probabilities: 0.5, 0.3, 0.15, 0.05)")
    current = DiscreteVariance([0, 1, 2, 3], [0.5, 0.3, 0.15, 0.05])
    current.print_analysis("Current Process")
    
    # Improved process
    print("\n\nIMPROVED MANUFACTURING PROCESS:")
    print("Defects per batch: 0, 1 (probabilities: 0.8, 0.2)")
    improved = DiscreteVariance([0, 1], [0.8, 0.2])
    improved.print_analysis("Improved Process")
    
    # Process comparison
    curr_mean = current.expected_value()
    curr_std = current.standard_deviation()
    imp_mean = improved.expected_value()
    imp_std = improved.standard_deviation()
    
    print(f"\n\nPROCESS COMPARISON:")
    print(f"Current process:  {curr_mean:.2f} ± {curr_std:.2f} defects per batch")
    print(f"Improved process: {imp_mean:.2f} ± {imp_std:.2f} defects per batch")
    
    reduction_mean = ((curr_mean - imp_mean) / curr_mean) * 100
    reduction_std = ((curr_std - imp_std) / curr_std) * 100
    
    print(f"\nImprovements:")
    print(f"Mean defects reduced by {reduction_mean:.1f}%")
    print(f"Variability reduced by {reduction_std:.1f}%")
    print("Lower variability means more predictable quality!")


# 6. VARIANCE PROPERTIES DEMONSTRATION
def variance_properties_demo():
    """Demonstrate key properties of variance"""
    
    print("\n\nVARIANCE PROPERTIES DEMONSTRATION")
    print("=" * 40)
    
    # Original distribution
    original = DiscreteVariance([1, 2, 3], [1/3, 1/3, 1/3])
    
    print("ORIGINAL DISTRIBUTION X:")
    original.print_analysis("X")
    
    # Property: Var(aX + b) = a²Var(X)
    print("\n\nPROPERTY: Var(aX + b) = a²Var(X)")
    
    # Transform: Y = 2X + 5
    transformed_values = [2*x + 5 for x in original.values]
    transformed = DiscreteVariance(transformed_values, original.probabilities)
    
    print("\nTRANSFORMED: Y = 2X + 5")
    transformed.print_analysis("Y = 2X + 5")
    
    # Verify property
    original_var = original.variance_definition()
    transformed_var = transformed.variance_definition()
    predicted_var = 4 * original_var  # a² = 2² = 4
    
    print(f"\nPROPERTY VERIFICATION:")
    print(f"Var(X) = {original_var:.4f}")
    print(f"Var(Y) = Var(2X + 5) = {transformed_var:.4f}")
    print(f"Predicted: 2²×Var(X) = 4×{original_var:.4f} = {predicted_var:.4f}")
    print(f"Property holds: {abs(transformed_var - predicted_var) < 1e-10}")
    
    print(f"\nKey insight: Multiplying by 2 makes variance 4 times larger!")
    print(f"Adding 5 doesn't change variance at all.")


# 7. CONTINUOUS DISTRIBUTION EXAMPLES
def continuous_examples():
    """Examples with continuous distributions"""
    
    print("\n\nCONTINUOUS DISTRIBUTION EXAMPLES")
    print("=" * 40)
    
    # Uniform distribution
    print("UNIFORM DISTRIBUTION [0, 12]:")
    uniform_stats = ContinuousVariance.uniform(0, 12)
    print(f"Mean = {uniform_stats['mean']:.2f}")
    print(f"Variance = {uniform_stats['variance']:.2f}")
    print(f"Standard deviation = {uniform_stats['std_dev']:.2f}")
    print("Interpretation: Values spread evenly from 0 to 12")
    print(f"Typical distance from mean (6): ±{uniform_stats['std_dev']:.2f}")
    
    # Normal distribution
    print("\nNORMAL DISTRIBUTION N(100, 15²):")
    normal_stats = ContinuousVariance.normal(100, 15)
    print(f"Mean = {normal_stats['mean']:.2f}")
    print(f"Variance = {normal_stats['variance']:.2f}")
    print(f"Standard deviation = {normal_stats['std_dev']:.2f}")
    print("Empirical rule applications:")
    print(f"68% of values between {100-15:.0f} and {100+15:.0f}")
    print(f"95% of values between {100-30:.0f} and {100+30:.0f}")
    print(f"99.7% of values between {100-45:.0f} and {100+45:.0f}")
    
    # Exponential distribution
    print("\nEXPONENTIAL DISTRIBUTION λ=0.5:")
    exp_stats = ContinuousVariance.exponential(0.5)
    print(f"Mean = {exp_stats['mean']:.2f}")
    print(f"Variance = {exp_stats['variance']:.2f}")  
    print(f"Standard deviation = {exp_stats['std_dev']:.2f}")
    print("Interpretation: Waiting times with average 2 units")
    print(f"Standard deviation equals the mean (characteristic of exponential)")


# 8. EMPIRICAL RULE DEMONSTRATION
def empirical_rule_demo():
    """Demonstrate the empirical rule with simulation"""
    
    print("\n\nEMPIRICAL RULE DEMONSTRATION")
    print("=" * 35)
    
    # Generate normal data
    np.random.seed(42)
    mu, sigma = 100, 15
    data = np.random.normal(mu, sigma, 10000)
    
    # Calculate empirical percentages
    within_1_sigma = np.sum((data >= mu - sigma) & (data <= mu + sigma)) / len(data)
    within_2_sigma = np.sum((data >= mu - 2*sigma) & (data <= mu + 2*sigma)) / len(data)
    within_3_sigma = np.sum((data >= mu - 3*sigma) & (data <= mu + 3*sigma)) / len(data)
    
    print(f"Generated {len(data)} random values from N({mu}, {sigma}²)")
    print(f"\nEmpirical Rule Check:")
    print(f"Within 1σ ({mu-sigma:.0f} to {mu+sigma:.0f}): {within_1_sigma:.1%} (expected 68%)")
    print(f"Within 2σ ({mu-2*sigma:.0f} to {mu+2*sigma:.0f}): {within_2_sigma:.1%} (expected 95%)")
    print(f"Within 3σ ({mu-3*sigma:.0f} to {mu+3*sigma:.0f}): {within_3_sigma:.1%} (expected 99.7%)")
    
    # Calculate actual sample statistics
    sample_mean = np.mean(data)
    sample_var = np.var(data, ddof=1)  # Sample variance
    sample_std = np.std(data, ddof=1)  # Sample standard deviation
    
    print(f"\nSample Statistics:")
    print(f"Sample mean: {sample_mean:.2f} (population: {mu})")
    print(f"Sample variance: {sample_var:.2f} (population: {sigma**2})")
    print(f"Sample std dev: {sample_std:.2f} (population: {sigma})")


# 9. VARIANCE IN DECISION MAKING
def decision_making_example():
    """Use variance in practical decision making"""
    
    print("\n\nVARIANCE IN DECISION MAKING")
    print("=" * 35)
    
    print("SCENARIO: Choosing between two job offers")
    print("Both have same expected annual bonus, but different risk profiles")
    
    # Job A: Stable company
    job_a = DiscreteVariance([8000, 10000, 12000], [0.2, 0.6, 0.2])
    print("\nJOB A (Stable Company):")
    job_a.print_analysis("Job A Bonus")
    
    # Job B: Startup
    job_b = DiscreteVariance([0, 10000, 30000], [0.3, 0.4, 0.3])
    print("\nJOB B (Startup):")  
    job_b.print_analysis("Job B Bonus")
    
    # Decision analysis
    a_mean, a_std = job_a.expected_value(), job_a.standard_deviation()
    b_mean, b_std = job_b.expected_value(), job_b.standard_deviation()
    
    print(f"\nDECISION ANALYSIS:")
    print(f"Job A: ${a_mean:,.0f} ± ${a_std:,.0f} (coefficient of variation: {a_std/a_mean:.2f})")
    print(f"Job B: ${b_mean:,.0f} ± ${b_std:,.0f} (coefficient of variation: {b_std/b_mean:.2f})")
    
    print(f"\nConsiderations:")
    print(f"- Same expected bonus (${a_mean:,.0f})")
    print(f"- Job A is much more predictable (lower variance)")
    print(f"- Job B has higher upside potential but also risk of no bonus")
    print(f"- Risk-averse people prefer Job A")
    print(f"- Risk-seeking people might prefer Job B")


# 10. RUN ALL EXAMPLES
def run_all_examples():
    """Execute all variance and standard deviation examples"""
    
    print("VARIANCE AND STANDARD DEVIATION: COMPLETE EXAMPLES")
    print("=" * 60)
    print("Understanding the spread and risk in random variables")
    
    # Run all examples
    simple_discrete_example()
    investment_risk_example()
    quality_control_example()
    variance_properties_demo()
    continuous_examples()
    empirical_rule_demo()
    decision_making_example()
    
    # Print summary of common distributions
    ContinuousVariance.print_continuous_summary()
    
    print("\n" + "=" * 60)
    print("KEY INSIGHTS:")
    print("1. Variance measures the 'spread' of a distribution")
    print("2. Standard deviation is more interpretable (same units as data)")
    print("3. Higher variance = more uncertainty/risk")
    print("4. Variance has useful mathematical properties")
    print("5. Normal distributions follow the empirical rule")
    print("6. Variance is crucial for risk assessment and decision making")
    print("\nVariance and standard deviation quantify uncertainty,")
    print("making them essential for data analysis and decision making!")


# Execute all examples
if __name__ == "__main__":
    run_all_examples()
```

## The Meta-Insight: Variance as the Mathematics of Risk

```python
# Simple Examples to Build Intuition for Variance and Standard Deviation

import math

def variance_intuition_builder():
    """Build intuition with very simple examples"""
    
    print("VARIANCE INTUITION BUILDER")
    print("=" * 30)
    
    print("Understanding variance through simple examples:")
    print("All have the same mean (10), but different 'spreadness'")
    
    # Example 1: No variability
    print("\nEXAMPLE 1: No Variability")
    print("Values: 10, 10, 10 (all the same)")
    values1 = [10, 10, 10]
    mean1 = sum(values1) / len(values1)
    deviations1 = [(x - mean1) for x in values1]
    squared_deviations1 = [(x - mean1)**2 for x in values1]
    variance1 = sum(squared_deviations1) / len(squared_deviations1)
    
    print(f"Mean = {mean1}")
    print(f"Deviations from mean: {deviations1}")
    print(f"Squared deviations: {squared_deviations1}")
    print(f"Variance = {variance1}")
    print(f"Standard deviation = {math.sqrt(variance1)}")
    print("→ No spread = zero variance")
    
    # Example 2: Low variability
    print("\nEXAMPLE 2: Low Variability")
    print("Values: 9, 10, 11 (close to mean)")
    values2 = [9, 10, 11]
    mean2 = sum(values2) / len(values2)
    deviations2 = [(x - mean2) for x in values2]
    squared_deviations2 = [(x - mean2)**2 for x in values2]
    variance2 = sum(squared_deviations2) / len(squared_deviations2)
    
    print(f"Mean = {mean2}")
    print(f"Deviations from mean: {deviations2}")
    print(f"Squared deviations: {squared_deviations2}")
    print(f"Variance = {variance2:.2f}")
    print(f"Standard deviation = {math.sqrt(variance2):.2f}")
    print("→ Small spread = low variance")
    
    # Example 3: High variability
    print("\nEXAMPLE 3: High Variability")
    print("Values: 0, 10, 20 (far from mean)")
    values3 = [0, 10, 20]
    mean3 = sum(values3) / len(values3)
    deviations3 = [(x - mean3) for x in values3]
    squared_deviations3 = [(x - mean3)**2 for x in values3]
    variance3 = sum(squared_deviations3) / len(squared_deviations3)
    
    print(f"Mean = {mean3}")
    print(f"Deviations from mean: {deviations3}")
    print(f"Squared deviations: {squared_deviations3}")
    print(f"Variance = {variance3:.2f}")
    print(f"Standard deviation = {math.sqrt(variance3):.2f}")
    print("→ Large spread = high variance")
    
    print(f"\nSUMMARY:")
    print(f"Same mean ({mean1}), different variances:")
    print(f"No spread: σ² = {variance1}, σ = {math.sqrt(variance1)}")
    print(f"Low spread: σ² = {variance2:.2f}, σ = {math.sqrt(variance2):.2f}")
    print(f"High spread: σ² = {variance3:.2f}, σ = {math.sqrt(variance3):.2f}")


def quick_calculation_examples():
    """Quick examples of variance calculations"""
    
    print("\n\nQUICK CALCULATION EXAMPLES")
    print("=" * 30)
    
    # Coin flips
    print("EXAMPLE: Two coin flips, count heads")
    print("Possible outcomes: 0, 1, 2 heads")
    print("Probabilities: 1/4, 2/4, 1/4")
    
    values = [0, 1, 2]
    probs = [1/4, 2/4, 1/4]
    
    # Expected value
    expected = sum(x * p for x, p in zip(values, probs))
    print(f"\nE[X] = (0)(1/4) + (1)(2/4) + (2)(1/4) = {expected}")
    
    # Variance using definition
    variance_def = sum((x - expected)**2 * p for x, p in zip(values, probs))
    print(f"\nVariance (definition method):")
    for x, p in zip(values, probs):
        contribution = (x - expected)**2 * p
        print(f"({x} - {expected})² × {p} = {(x-expected)**2} × {p} = {contribution}")
    print(f"Variance = {variance_def}")
    
    # Variance using alternative formula
    expected_x_squared = sum(x**2 * p for x, p in zip(values, probs))
    variance_alt = expected_x_squared - expected**2
    print(f"\nVariance (alternative method):")
    print(f"E[X²] = (0²)(1/4) + (1²)(2/4) + (2²)(1/4) = {expected_x_squared}")
    print(f"Var(X) = E[X²] - (E[X])² = {expected_x_squared} - {expected}² = {variance_alt}")
    
    print(f"\nStandard deviation = √{variance_def} = {math.sqrt(variance_def):.3f}")


def units_and_interpretation():
    """Understand units and interpretation"""
    
    print("\n\nUNITS AND INTERPRETATION")
    print("=" * 25)
    
    print("If X = height in inches:")
    print("Mean height = 68 inches")
    print("Variance = 9 inches²")
    print("Standard deviation = 3 inches")
    print()
    print("INTERPRETATION:")
    print("✓ 'Heights typically deviate by about 3 inches from the mean'")
    print("✗ 'The variance is 9 inches' (wrong - it's 9 square inches)")
    print()
    print("Why standard deviation is more useful:")
    print("- Same units as original data")
    print("- Easier to interpret practically")
    print("- Can be directly compared to mean")
    print()
    print("If X = income in dollars:")
    print("Mean income = $50,000")
    print("Variance = $100,000,000 (100 million dollars²)")
    print("Standard deviation = $10,000")
    print("→ Standard deviation is much more interpretable!")


def variance_properties_simple():
    """Simple examples of variance properties"""
    
    print("\n\nVARIANCE PROPERTIES (Simple Examples)")
    print("=" * 40)
    
    # Original data
    print("Original data: X = {1, 2, 3} with equal probabilities")
    values = [1, 2, 3]
    probs = [1/3, 1/3, 1/3]
    
    mean_x = sum(x * p for x, p in zip(values, probs))
    var_x = sum((x - mean_x)**2 * p for x, p in zip(values, probs))
    
    print(f"E[X] = {mean_x:.2f}")
    print(f"Var(X) = {var_x:.2f}")
    
    # Property 1: Adding a constant
    print(f"\nProperty: Var(X + c) = Var(X)")
    print("Add 10 to each value: Y = X + 10 = {11, 12, 13}")
    
    values_plus_10 = [x + 10 for x in values]
    mean_y = sum(y * p for y, p in zip(values_plus_10, probs))
    var_y = sum((y - mean_y)**2 * p for y, p in zip(values_plus_10, probs))
    
    print(f"E[Y] = E[X + 10] = {mean_y:.2f}")
    print(f"Var(Y) = Var(X + 10) = {var_y:.2f}")
    print(f"Same variance! Adding constant just shifts, doesn't change spread")
    
    # Property 2: Multiplying by a constant
    print(f"\nProperty: Var(aX) = a²Var(X)")
    print("Multiply each value by 2: Z = 2X = {2, 4, 6}")
    
    values_times_2 = [2 * x for x in values]
    mean_z = sum(z * p for z, p in zip(values_times_2, probs))
    var_z = sum((z - mean_z)**2 * p for z, p in zip(values_times_2, probs))
    
    print(f"E[Z] = E[2X] = {mean_z:.2f}")
    print(f"Var(Z) = Var(2X) = {var_z:.2f}")
    print(f"Predicted: 2² × Var(X) = 4 × {var_x:.2f} = {4 * var_x:.2f}")
    print(f"Matches! Multiplying by 2 makes variance 4 times larger")


def risk_assessment_simple():
    """Simple risk assessment example"""
    
    print("\n\nSIMPLE RISK ASSESSMENT")
    print("=" * 25)
    
    print("Two investment options with same expected return:")
    
    # Safe investment
    print("\nSAFE INVESTMENT:")
    print("Returns: 5%, 7%, 9% (equally likely)")
    safe_returns = [5, 7, 9]
    safe_probs = [1/3, 1/3, 1/3]
    
    safe_mean = sum(r * p for r, p in zip(safe_returns, safe_probs))
    safe_var = sum((r - safe_mean)**2 * p for r, p in zip(safe_returns, safe_probs))
    safe_std = math.sqrt(safe_var)
    
    print(f"Expected return: {safe_mean:.1f}%")
    print(f"Standard deviation: {safe_std:.2f}%")
    
    # Risky investment
    print("\nRISKY INVESTMENT:")
    print("Returns: -5%, 7%, 19% (equally likely)")
    risky_returns = [-5, 7, 19]
    risky_probs = [1/3, 1/3, 1/3]
    
    risky_mean = sum(r * p for r, p in zip(risky_returns, risky_probs))
    risky_var = sum((r - risky_mean)**2 * p for r, p in zip(risky_returns, risky_probs))
    risky_std = math.sqrt(risky_var)
    
    print(f"Expected return: {risky_mean:.1f}%")
    print(f"Standard deviation: {risky_std:.2f}%")
    
    print(f"\nCOMPARISON:")
    print(f"Same expected return ({safe_mean:.1f}%), different risk:")
    print(f"Safe: {safe_std:.1f}% typical deviation")
    print(f"Risky: {risky_std:.1f}% typical deviation")
    print(f"Risky investment has {risky_std/safe_std:.1f}x higher risk!")


def common_mistakes():
    """Common mistakes with variance"""
    
    print("\n\nCOMMON MISTAKES")
    print("=" * 15)
    
    print("MISTAKE 1: Confusing variance and standard deviation")
    print("❌ 'The variance is 4 units'")
    print("✅ 'The variance is 4 square units, standard deviation is 2 units'")
    
    print("\nMISTAKE 2: Wrong interpretation of high variance")
    print("❌ 'High variance means values are usually above the mean'")
    print("✅ 'High variance means values are spread out (both above AND below)'")
    
    print("\nMISTAKE 3: Adding variances incorrectly")
    print("❌ 'Var(X + Y) = Var(X) + Var(Y)' (always)")
    print("✅ 'Var(X + Y) = Var(X) + Var(Y)' (only if X and Y are independent)")
    
    print("\nMISTAKE 4: Wrong scaling property")
    print("❌ 'If I double X, variance doubles'")
    print("✅ 'If I double X, variance quadruples: Var(2X) = 4×Var(X)'")
    
    print("\nMISTAKE 5: Ignoring units")
    print("❌ 'Standard deviation of heights is 9 inches²'")
    print("✅ 'Variance of heights is 9 inches², standard deviation is 3 inches'")


def practical_rule_of_thumb():
    """Practical rules of thumb"""
    
    print("\n\nPRACTICAL RULES OF THUMB")
    print("=" * 25)
    
    print("RULE 1: Coefficient of Variation")
    print("CV = σ/μ (standard deviation / mean)")
    print("Useful for comparing relative variability")
    print("Example: Investment A has σ=5%, μ=10% → CV = 0.5")
    print("         Investment B has σ=3%, μ=5% → CV = 0.6")
    print("Investment A has lower relative risk")
    
    print("\nRULE 2: Empirical Rule (for normal-ish distributions)")
    print("68% of data within μ ± 1σ")
    print("95% of data within μ ± 2σ")
    print("99.7% of data within μ ± 3σ")
    
    print("\nRULE 3: Quick variance estimate")
    print("For roughly normal data:")
    print("σ ≈ (max - min) / 4")
    print("Quick and dirty estimate when you need rough variance")
    
    print("\nRULE 4: Risk assessment")
    print("Higher σ = higher risk/uncertainty")
    print("Risk-averse people prefer lower σ")
    print("Risk-neutral people only care about μ")


def run_simple_examples():
    """Run all simple examples"""
    
    print("VARIANCE AND STANDARD DEVIATION: SIMPLE EXAMPLES")
    print("=" * 55)
    
    variance_intuition_builder()
    quick_calculation_examples()
    units_and_interpretation()
    variance_properties_simple()
    risk_assessment_simple()
    common_mistakes()
    practical_rule_of_thumb()
    
    print("\n" + "=" * 55)
    print("KEY TAKEAWAYS:")
    print("• Variance = average squared distance from mean")
    print("• Standard deviation = √variance (easier to interpret)")
    print("• Higher values = more spread/uncertainty/risk")
    print("• Variance has useful mathematical properties")
    print("• Essential for risk assessment and decision making")
    print("• Always consider both mean AND spread!")


if __name__ == "__main__":
    run_simple_examples()
```

### Why Variance Revolutionized Decision-Making

Variance and standard deviation represent one of the most profound insights in the history of quantitative thinking: **uncertainty itself can be measured and managed systematically**.

Before these concepts, people could only talk about "averages" and make vague statements about "riskiness." Variance gave us the mathematical tools to:

- **Quantify risk precisely**: Instead of "this investment seems risky," we can say "this investment has a standard deviation of 15%"
- **Compare uncertainties**: Which is riskier - Job A or Job B? Variance gives us objective measures
- **Optimize under uncertainty**: Choose the best balance of return and risk
- **Price uncertainty**: Insurance, options, and many financial instruments are priced using variance

### ASCII Visualization: The Decision-Making Revolution

```
BEFORE VARIANCE CONCEPTS          AFTER VARIANCE CONCEPTS
┌─────────────────────────┐      ┌─────────────────────────┐
│ "This seems risky"      │  →   │ "σ = 15%, high risk"    │
│ "Pretty stable"         │      │ "σ = 2%, low risk"      │
│ "Hard to predict"       │      │ "CV = 0.8, very volatile│
│                         │      │                         │
│ Vague, subjective       │      │ Precise, objective      │
│ Can't compare easily    │      │ Easy to compare         │
│ No optimization         │      │ Can optimize            │
│ Gut feeling decisions   │      │ Data-driven decisions   │
└─────────────────────────┘      └─────────────────────────┘
```

### The Universal Pattern

Variance appears everywhere uncertainty exists:

**Physics**: Heisenberg uncertainty principle uses variance concepts
**Engineering**: Signal-to-noise ratio involves variance calculations
**Economics**: Market volatility is measured by variance
**Biology**: Genetic diversity is quantified using variance
**Psychology**: Individual differences are characterized by variance
**Quality Control**: Process variation is monitored through variance

> **The deeper insight**: Variance isn't just a statistical calculation - it's a fundamental way of thinking about and managing uncertainty in any domain where randomness plays a role.

## The Connection to Advanced Topics

Understanding variance opens the door to:

### Portfolio Theory
Modern portfolio theory uses variance to optimize investment portfolios:
- **Risk-return tradeoff**: Higher expected returns usually require accepting higher variance
- **Diversification**: Combining assets can reduce overall portfolio variance
- **Efficient frontier**: The optimal combinations of risk and return

### Quality Control
Statistical process control uses variance to monitor manufacturing:
- **Control charts**: Track when process variance exceeds acceptable limits
- **Six Sigma**: Methodology focused on reducing process variance
- **Capability studies**: Measure how well processes meet specifications

### Machine Learning
Variance plays crucial roles in modern AI:
- **Bias-variance tradeoff**: Fundamental principle in model selection
- **Ensemble methods**: Combine models to reduce prediction variance
- **Regularization**: Techniques to control model variance

### Signal Processing
Variance concepts are essential for understanding signals:
- **Noise**: Random variations characterized by their variance
- **Filtering**: Reducing unwanted variance while preserving signal
- **Information theory**: Channel capacity relates to signal and noise variances

## The Philosophical Implications

### The Quantification of Uncertainty

Variance represents a profound philosophical shift: **uncertainty as a measurable quantity rather than an unknowable mystery**.

**Pre-variance thinking**: "The future is uncertain" (end of analysis)
**Post-variance thinking**: "The future has measurable uncertainty that we can quantify, compare, and optimize around"

### The Risk-Return Paradigm

Variance created the modern framework for thinking about risk and return:
- **No free lunch**: Higher returns generally require accepting higher variance
- **Risk preferences**: People differ in their tolerance for variance
- **Risk management**: Systematic approaches to controlling variance

> **The meta-insight**: Variance didn't just give us a mathematical tool - it gave us a new way of thinking about uncertainty that transformed finance, engineering, science, and decision-making across all domains.

## The Skills You've Developed

By mastering variance and standard deviation, you've developed transferable analytical skills:

1. **Uncertainty quantification**: Measuring and comparing different types of risk
2. **Trade-off analysis**: Balancing expected outcomes against their variability
3. **Process thinking**: Understanding that systems have both central tendencies and spread
4. **Risk assessment**: Systematically evaluating the variability in outcomes
5. **Data interpretation**: Understanding what measures of spread tell us about distributions

## Looking Forward: Advanced Applications

The variance concepts you've learned here lead naturally to:

**Multivariate Statistics**: Covariance, correlation, and multivariate distributions
**Time Series Analysis**: How variance changes over time
**Experimental Design**: Using variance to detect real effects amid noise
**Bayesian Statistics**: Updating beliefs about variance as data arrives
**Stochastic Processes**: How variance evolves in random systems
**Risk Management**: Sophisticated models for measuring and managing risk

> **Final insight**: Variance and standard deviation are not just mathematical concepts - they're fundamental tools for thinking clearly about uncertainty. They transform vague notions of "risk" and "variability" into precise, measurable quantities that can be analyzed, compared, and optimized.

**The practical takeaway**: Every time you face a decision involving uncertainty - which investment to choose, which process to implement, which strategy to pursue - ask yourself not just "What's the expected outcome?" but also "What's the variance?" Understanding both the center and the spread of uncertainty will consistently lead to better decisions.

In a world full of uncertainty, variance and standard deviation are your mathematical GPS for navigating risk intelligently.