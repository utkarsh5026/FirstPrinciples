# Performance Characteristics: Lambda vs Anonymous Classes in Java

Let me explain the performance implications of lambdas versus anonymous classes from the ground up, starting with how the JVM handles these constructs fundamentally.

## Foundation: What Happens Under the Hood

### Anonymous Classes - The Traditional Approach

Before lambdas existed (pre-Java 8), anonymous classes were the primary way to create inline implementations:

```java
// Anonymous class example
Runnable task = new Runnable() {
    @Override
    public void run() {
        System.out.println("Running task");
    }
};
```

**Compilation Process:**

```
Source: MyClass.java
    ↓ javac compilation
Bytecode: MyClass.class + MyClass$1.class
```

When you compile this code, the Java compiler generates:

1. Your main class file (`MyClass.class`)
2. A separate class file for the anonymous class (`MyClass$1.class`)

### Lambda Expressions - The Modern Approach

```java
// Lambda expression equivalent
Runnable task = () -> System.out.println("Running task");
```

**Compilation Process:**

```
Source: MyClass.java
    ↓ javac compilation + invokedynamic
Bytecode: MyClass.class (contains lambda factory method)
```

> **Key Insight** : Lambdas don't generate separate class files at compile time. Instead, they use a dynamic mechanism that creates implementations at runtime when first invoked.

## Deep Dive: Runtime Behavior and Memory Allocation

### Anonymous Classes: Static Class Generation## JVM Optimizations: The invokedynamic Revolution

### How Lambdas Use invokedynamic

> **Core Principle** : Lambdas leverage `invokedynamic` bytecode instruction, which allows the JVM to defer the decision of how to implement the lambda until runtime, enabling sophisticated optimizations.

```
Traditional Method Call:
invokevirtual #2  // Fixed target at compile time

Lambda Method Call:
invokedynamic #3  // Target determined at runtime by bootstrap method
```

**Vertical ASCII Diagram: Lambda Creation Process**

```
Source Code: () -> doSomething()
         ↓
   Compile Time:
   - Generate bootstrap method
   - Create invokedynamic instruction
   - No separate class file
         ↓
   First Runtime Call:
   - Bootstrap method executed
   - LambdaMetafactory creates implementation
   - CallSite cached for future use
         ↓
   Subsequent Calls:
   - Use cached CallSite
   - Direct method invocation
   - No object allocation (for stateless)
```

### Key Optimization Strategies

```java
import java.util.function.Predicate;
import java.util.function.Function;
import java.util.function.Supplier;

public class JVMOptimizationDemo {
    
    /**
     * Demonstrates stateless lambda optimization - JVM can reuse instances
     */
    public static void statelessOptimization() {
        System.out.println("=== Stateless Lambda Optimization ===");
        
        // These stateless lambdas may be cached and reused by the JVM
        Predicate<String> isEmpty1 = String::isEmpty;
        Predicate<String> isEmpty2 = String::isEmpty;
        Predicate<String> isEmpty3 = s -> s.isEmpty(); // Functionally identical
        
        System.out.println("Method reference 1: " + System.identityHashCode(isEmpty1));
        System.out.println("Method reference 2: " + System.identityHashCode(isEmpty2));
        System.out.println("Lambda expression: " + System.identityHashCode(isEmpty3));
        
        // Test if they're the same instance (JVM optimization)
        System.out.println("Same instance (method refs)? " + (isEmpty1 == isEmpty2));
        System.out.println("Same instance (method vs lambda)? " + (isEmpty1 == isEmpty3));
    }
    
    /**
     * Demonstrates how capturing variables affects optimization
     */
    public static void capturingVariableOptimization() {
        System.out.println("\n=== Variable Capture Impact ===");
        
        String prefix = "Hello, ";
        
        // Capturing lambda - creates new instance each time
        Function<String, String> greeter1 = name -> prefix + name;
        Function<String, String> greeter2 = name -> prefix + name;
        
        System.out.println("Capturing lambda 1: " + System.identityHashCode(greeter1));
        System.out.println("Capturing lambda 2: " + System.identityHashCode(greeter2));
        System.out.println("Same instance? " + (greeter1 == greeter2));
        
        // Non-capturing equivalent
        Function<String, String> pureGreeter1 = name -> "Hello, " + name;
        Function<String, String> pureGreeter2 = name -> "Hello, " + name;
        
        System.out.println("Non-capturing 1: " + System.identityHashCode(pureGreeter1));
        System.out.println("Non-capturing 2: " + System.identityHashCode(pureGreeter2));
        System.out.println("Same instance? " + (pureGreeter1 == pureGreeter2));
    }
    
    /**
     * Shows the performance impact of different lambda types
     */
    public static void performanceImpactAnalysis() {
        System.out.println("\n=== Performance Impact Analysis ===");
        
        final int iterations = 10_000_000;
        String capturedVar = "captured";
        
        // Warm up
        for (int i = 0; i < 100_000; i++) {
            Supplier<String> warm1 = () -> "constant";
            Supplier<String> warm2 = () -> capturedVar;
            warm1.get();
            warm2.get();
        }
        
        // Test 1: Non-capturing lambda (optimizable)
        long start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            Supplier<String> supplier = () -> "constant";
            supplier.get();
        }
        long nonCapturingTime = System.nanoTime() - start;
        
        // Test 2: Capturing lambda (less optimizable)
        start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            Supplier<String> supplier = () -> capturedVar;
            supplier.get();
        }
        long capturingTime = System.nanoTime() - start;
        
        // Test 3: Anonymous class for comparison
        start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            Supplier<String> supplier = new Supplier<String>() {
                @Override
                public String get() {
                    return capturedVar;
                }
            };
            supplier.get();
        }
        long anonymousTime = System.nanoTime() - start;
        
        System.out.printf("Non-capturing lambda: %.2f ms%n", nonCapturingTime / 1_000_000.0);
        System.out.printf("Capturing lambda: %.2f ms%n", capturingTime / 1_000_000.0);
        System.out.printf("Anonymous class: %.2f ms%n", anonymousTime / 1_000_000.0);
        
        System.out.printf("Capturing vs non-capturing: %.2fx slower%n", 
                         (double) capturingTime / nonCapturingTime);
        System.out.printf("Anonymous vs capturing lambda: %.2fx slower%n", 
                         (double) anonymousTime / capturingTime);
    }
    
    /**
     * Demonstrates method reference optimization
     */
    public static void methodReferenceOptimization() {
        System.out.println("\n=== Method Reference Optimization ===");
        
        // Method references are often more optimizable than lambda expressions
        Function<String, Integer> methodRef = String::length;
        Function<String, Integer> lambdaExpr = s -> s.length();
        
        final int iterations = 10_000_000;
        String testString = "Hello, World!";
        
        // Warm up
        for (int i = 0; i < 100_000; i++) {
            methodRef.apply(testString);
            lambdaExpr.apply(testString);
        }
        
        // Test method reference
        long start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            methodRef.apply(testString);
        }
        long methodRefTime = System.nanoTime() - start;
        
        // Test lambda expression
        start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            lambdaExpr.apply(testString);
        }
        long lambdaExprTime = System.nanoTime() - start;
        
        System.out.printf("Method reference: %.2f ms%n", methodRefTime / 1_000_000.0);
        System.out.printf("Lambda expression: %.2f ms%n", lambdaExprTime / 1_000_000.0);
        System.out.printf("Performance ratio: %.2fx%n", 
                         (double) lambdaExprTime / methodRefTime);
    }
    
    public static void main(String[] args) {
        statelessOptimization();
        capturingVariableOptimization();
        performanceImpactAnalysis();
        methodReferenceOptimization();
    }
}
```

## Memory Implications: Deep Analysis

### Stack vs Heap Allocation Patterns

> **Fundamental Difference** : Anonymous classes always create heap objects, while stateless lambdas can be optimized to avoid object allocation entirely through caching and direct method invocation.

**Memory Allocation Diagram:**

```
Anonymous Class Creation:
Stack Frame
├── Local variable reference ──┐
└── Method call overhead       │
                               │
Heap Memory                    │
├── Anonymous$1 class object  ←┘
├── Method table pointer
├── Field storage (if capturing)
└── GC metadata

Lambda Expression (Stateless):
Stack Frame
├── Cached lambda reference ──┐
└── Direct method call        │
                              │
Heap Memory (Potentially)     │
├── Singleton lambda object  ←┘ (may be cached)
└── Minimal GC overhead

Lambda Expression (Capturing):
Stack Frame
├── Local variable reference ──┐
├── Captured variable copies   │
└── Method call overhead       │
                               │
Heap Memory                    │
├── Lambda instance object  ───┘
├── Captured variable storage
└── GC metadata
```

### Garbage Collection Impact

```java
import java.util.function.Predicate;
import java.util.function.Function;
import java.util.function.Supplier;

public class JVMOptimizationDemo {
    
    /**
     * Demonstrates stateless lambda optimization - JVM can reuse instances
     */
    public static void statelessOptimization() {
        System.out.println("=== Stateless Lambda Optimization ===");
        
        // These stateless lambdas may be cached and reused by the JVM
        Predicate<String> isEmpty1 = String::isEmpty;
        Predicate<String> isEmpty2 = String::isEmpty;
        Predicate<String> isEmpty3 = s -> s.isEmpty(); // Functionally identical
        
        System.out.println("Method reference 1: " + System.identityHashCode(isEmpty1));
        System.out.println("Method reference 2: " + System.identityHashCode(isEmpty2));
        System.out.println("Lambda expression: " + System.identityHashCode(isEmpty3));
        
        // Test if they're the same instance (JVM optimization)
        System.out.println("Same instance (method refs)? " + (isEmpty1 == isEmpty2));
        System.out.println("Same instance (method vs lambda)? " + (isEmpty1 == isEmpty3));
    }
    
    /**
     * Demonstrates how capturing variables affects optimization
     */
    public static void capturingVariableOptimization() {
        System.out.println("\n=== Variable Capture Impact ===");
        
        String prefix = "Hello, ";
        
        // Capturing lambda - creates new instance each time
        Function<String, String> greeter1 = name -> prefix + name;
        Function<String, String> greeter2 = name -> prefix + name;
        
        System.out.println("Capturing lambda 1: " + System.identityHashCode(greeter1));
        System.out.println("Capturing lambda 2: " + System.identityHashCode(greeter2));
        System.out.println("Same instance? " + (greeter1 == greeter2));
        
        // Non-capturing equivalent
        Function<String, String> pureGreeter1 = name -> "Hello, " + name;
        Function<String, String> pureGreeter2 = name -> "Hello, " + name;
        
        System.out.println("Non-capturing 1: " + System.identityHashCode(pureGreeter1));
        System.out.println("Non-capturing 2: " + System.identityHashCode(pureGreeter2));
        System.out.println("Same instance? " + (pureGreeter1 == pureGreeter2));
    }
    
    /**
     * Shows the performance impact of different lambda types
     */
    public static void performanceImpactAnalysis() {
        System.out.println("\n=== Performance Impact Analysis ===");
        
        final int iterations = 10_000_000;
        String capturedVar = "captured";
        
        // Warm up
        for (int i = 0; i < 100_000; i++) {
            Supplier<String> warm1 = () -> "constant";
            Supplier<String> warm2 = () -> capturedVar;
            warm1.get();
            warm2.get();
        }
        
        // Test 1: Non-capturing lambda (optimizable)
        long start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            Supplier<String> supplier = () -> "constant";
            supplier.get();
        }
        long nonCapturingTime = System.nanoTime() - start;
        
        // Test 2: Capturing lambda (less optimizable)
        start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            Supplier<String> supplier = () -> capturedVar;
            supplier.get();
        }
        long capturingTime = System.nanoTime() - start;
        
        // Test 3: Anonymous class for comparison
        start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            Supplier<String> supplier = new Supplier<String>() {
                @Override
                public String get() {
                    return capturedVar;
                }
            };
            supplier.get();
        }
        long anonymousTime = System.nanoTime() - start;
        
        System.out.printf("Non-capturing lambda: %.2f ms%n", nonCapturingTime / 1_000_000.0);
        System.out.printf("Capturing lambda: %.2f ms%n", capturingTime / 1_000_000.0);
        System.out.printf("Anonymous class: %.2f ms%n", anonymousTime / 1_000_000.0);
        
        System.out.printf("Capturing vs non-capturing: %.2fx slower%n", 
                         (double) capturingTime / nonCapturingTime);
        System.out.printf("Anonymous vs capturing lambda: %.2fx slower%n", 
                         (double) anonymousTime / capturingTime);
    }
    
    /**
     * Demonstrates method reference optimization
     */
    public static void methodReferenceOptimization() {
        System.out.println("\n=== Method Reference Optimization ===");
        
        // Method references are often more optimizable than lambda expressions
        Function<String, Integer> methodRef = String::length;
        Function<String, Integer> lambdaExpr = s -> s.length();
        
        final int iterations = 10_000_000;
        String testString = "Hello, World!";
        
        // Warm up
        for (int i = 0; i < 100_000; i++) {
            methodRef.apply(testString);
            lambdaExpr.apply(testString);
        }
        
        // Test method reference
        long start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            methodRef.apply(testString);
        }
        long methodRefTime = System.nanoTime() - start;
        
        // Test lambda expression
        start = System.nanoTime();
        for (int i = 0; i < iterations; i++) {
            lambdaExpr.apply(testString);
        }
        long lambdaExprTime = System.nanoTime() - start;
        
        System.out.printf("Method reference: %.2f ms%n", methodRefTime / 1_000_000.0);
        System.out.printf("Lambda expression: %.2f ms%n", lambdaExprTime / 1_000_000.0);
        System.out.printf("Performance ratio: %.2fx%n", 
                         (double) lambdaExprTime / methodRefTime);
    }
    
    public static void main(String[] args) {
        statelessOptimization();
        capturingVariableOptimization();
        performanceImpactAnalysis();
        methodReferenceOptimization();
    }
}
```


## Performance Best Practices and Decision Framework

### When to Choose Lambdas

> **Performance Rule** : Use lambdas when you need functional interfaces and can avoid variable capture. The JVM's optimization of stateless lambdas can eliminate object allocation entirely.

```java
// GOOD: Stateless lambda - highly optimized
list.stream()
    .filter(String::isEmpty)           // Method reference - best performance
    .map(s -> s.toUpperCase())         // Simple transformation
    .collect(Collectors.toList());

// AVOID: Capturing expensive objects
ExpensiveObject expensive = new ExpensiveObject();
list.stream()
    .filter(item -> expensive.isValid(item))  // Captures expensive object
    .collect(Collectors.toList());
```

### When Anonymous Classes Might Be Better

> **Trade-off Insight** : Anonymous classes offer more predictable performance characteristics and are better for complex state management, even though they have higher baseline costs.## Summary: Performance Characteristics Deep Dive

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.Predicate;
import java.util.function.Function;

public class PerformanceGuidelines {
    
    /**
     * Demonstrates optimal lambda usage patterns for performance
     */
    public static void optimalLambdaPatterns() {
        System.out.println("=== Optimal Lambda Performance Patterns ===");
        
        // Pattern 1: Use method references when possible
        // BEST: Direct method reference
        Predicate<String> isEmpty = String::isEmpty;
        
        // GOOD: Simple lambda expression
        Predicate<String> isShort = s -> s.length() < 5;
        
        // AVOID: Complex lambda with capture
        String prefix = "PREFIX_";
        Predicate<String> hasPrefix = s -> s.startsWith(prefix) && s.length() > 10;
        
        System.out.println("Method reference class: " + isEmpty.getClass().getSimpleName());
        System.out.println("Simple lambda class: " + isShort.getClass().getSimpleName());
        System.out.println("Complex lambda class: " + hasPrefix.getClass().getSimpleName());
    }
    
    /**
     * Shows when anonymous classes provide better performance characteristics
     */
    public static void whenToUseAnonymousClasses() {
        System.out.println("\n=== When Anonymous Classes Excel ===");
        
        // Scenario 1: Complex state management
        // Anonymous class is better here due to clear state encapsulation
        Runnable complexTask = new Runnable() {
            private int executionCount = 0;
            private long lastExecutionTime = 0;
            
            @Override
            public void run() {
                long currentTime = System.currentTimeMillis();
                if (currentTime - lastExecutionTime > 1000) {
                    System.out.println("Complex task executed " + (++executionCount) + " times");
                    lastExecutionTime = currentTime;
                }
            }
        };
        
        // Scenario 2: When you need multiple method implementations
        // (Not possible with lambdas - they only implement single abstract methods)
        
        // Scenario 3: Performance-critical hot paths with predictable behavior
        // Anonymous classes have consistent allocation patterns
        
        complexTask.run();
    }
    
    /**
     * Demonstrates performance anti-patterns to avoid
     */
    public static void performanceAntiPatterns() {
        System.out.println("\n=== Performance Anti-Patterns to Avoid ===");
        
        // Anti-pattern 1: Creating lambdas in tight loops
        System.out.println("Creating lambdas in loops (BAD):");
        long start = System.nanoTime();
        for (int i = 0; i < 1_000_000; i++) {
            // BAD: Creates new lambda instance each iteration
            Function<String, String> badLambda = s -> s.toUpperCase();
        }
        long badTime = System.nanoTime() - start;
        
        // Better: Extract lambda outside loop
        System.out.println("Extracting lambda outside loop (GOOD):");
        start = System.nanoTime();
        Function<String, String> goodLambda = s -> s.toUpperCase();
        for (int i = 0; i < 1_000_000; i++) {
            // GOOD: Reuse same lambda instance
            Function<String, String> reusedLambda = goodLambda;
        }
        long goodTime = System.nanoTime() - start;
        
        System.out.printf("Bad pattern: %.2f ms%n", badTime / 1_000_000.0);
        System.out.printf("Good pattern: %.2f ms%n", goodTime / 1_000_000.0);
        System.out.printf("Improvement: %.1fx faster%n", (double) badTime / goodTime);
        
        // Anti-pattern 2: Capturing large objects unnecessarily
        byte[] largeArray = new byte[10_000];
        
        // BAD: Captures entire large array
        Runnable badCapture = () -> System.out.println("Array size: " + largeArray.length);
        
        // GOOD: Extract only needed data
        int arraySize = largeArray.length;
        Runnable goodCapture = () -> System.out.println("Array size: " + arraySize);
        
        System.out.println("Capture patterns demonstrated (check memory usage separately)");
    }
    
    /**
     * Provides a decision framework for lambda vs anonymous class choice
     */
    public static void decisionFramework() {
        System.out.println("\n=== Decision Framework ===");
        
        System.out.println("Choose LAMBDAS when:");
        System.out.println("  ✓ Implementing functional interfaces");
        System.out.println("  ✓ Simple, stateless operations");
        System.out.println("  ✓ Can use method references");
        System.out.println("  ✓ Minimal or no variable capture");
        System.out.println("  ✓ Stream API operations");
        
        System.out.println("\nChoose ANONYMOUS CLASSES when:");
        System.out.println("  ✓ Need multiple method implementations");
        System.out.println("  ✓ Complex state management required");
        System.out.println("  ✓ Need predictable performance characteristics");
        System.out.println("  ✓ Working with non-functional interfaces");
        System.out.println("  ✓ Debugging requires clear class names");
        
        System.out.println("\nPerformance Priorities:");
        System.out.println("  1. Method references (fastest)");
        System.out.println("  2. Stateless lambdas");
        System.out.println("  3. Simple capturing lambdas");
        System.out.println("  4. Anonymous classes");
        System.out.println("  5. Complex capturing lambdas (slowest)");
    }
    
    /**
     * Real-world performance scenario demonstration
     */
    public static void realWorldScenario() {
        System.out.println("\n=== Real-World Performance Scenario ===");
        
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        try {
            // Scenario: Processing tasks with different approaches
            final int taskCount = 100_000;
            
            // Approach 1: Optimal lambda usage
            long start = System.nanoTime();
            for (int i = 0; i < taskCount; i++) {
                final int taskId = i;
                executor.submit(() -> processTask(taskId));
            }
            long lambdaTime = System.nanoTime() - start;
            
            // Approach 2: Anonymous class (for comparison)
            start = System.nanoTime();
            for (int i = 0; i < taskCount; i++) {
                final int taskId = i;
                executor.submit(new Runnable() {
                    @Override
                    public void run() {
                        processTask(taskId);
                    }
                });
            }
            long anonymousTime = System.nanoTime() - start;
            
            System.out.printf("Lambda task submission: %.2f ms%n", lambdaTime / 1_000_000.0);
            System.out.printf("Anonymous task submission: %.2f ms%n", anonymousTime / 1_000_000.0);
            System.out.printf("Lambda advantage: %.1fx faster%n", 
                             (double) anonymousTime / lambdaTime);
            
        } finally {
            executor.shutdown();
        }
    }
    
    private static void processTask(int taskId) {
        // Simulate some work
        int result = taskId * 2;
    }
    
    public static void main(String[] args) {
        optimalLambdaPatterns();
        whenToUseAnonymousClasses();
        performanceAntiPatterns();
        decisionFramework();
        realWorldScenario();
    }
}
```

### Fundamental Performance Differences

> **Core Performance Insight** : The performance advantage of lambdas comes from the JVM's ability to optimize them at runtime through `invokedynamic`, while anonymous classes are constrained by their compile-time class generation approach.

**Performance Hierarchy (Fastest to Slowest):**

```
1. Method References (String::length)
   - JVM can often inline completely
   - No object allocation for stateless cases
   - Minimal bytecode overhead

2. Stateless Lambdas (() -> "constant")
   - May be cached and reused by JVM
   - invokedynamic optimization
   - No variable capture overhead

3. Simple Capturing Lambdas (x -> x + localVar)
   - Object allocation required
   - Still benefits from invokedynamic
   - Minimal capture overhead

4. Anonymous Classes (new Runnable() {...})
   - Always creates new object
   - Separate class file loaded
   - More GC pressure

5. Complex Capturing Lambdas (heavy capture)
   - Worst of both worlds
   - Object allocation + capture overhead
```

### Memory Impact Summary

| Approach         | Object Creation  | GC Pressure | Memory per Instance |
| ---------------- | ---------------- | ----------- | ------------------- |
| Method Reference | Often none       | Minimal     | ~0 bytes (cached)   |
| Stateless Lambda | Cached singleton | Very Low    | ~8-16 bytes         |
| Capturing Lambda | Per invocation   | Medium      | 24-40+ bytes        |
| Anonymous Class  | Per invocation   | High        | 32-48+ bytes        |

### JVM Optimization Mechanisms

> **Advanced Insight** : The JVM applies several layers of optimization to lambdas that aren't available to anonymous classes, including constant folding, method inlining, and escape analysis.

**Optimization Stack:**

```
HotSpot Compiler Optimizations
├── Method Inlining (aggressive for lambdas)
├── Escape Analysis (eliminates allocations)
├── Constant Folding (compile-time evaluation)
└── Dead Code Elimination

invokedynamic Infrastructure
├── Bootstrap Method Caching
├── CallSite Optimization
├── Polymorphic Inline Caching
└── Runtime Type Specialization

Lambda-Specific Optimizations
├── Singleton Instance Caching
├── Capture Variable Optimization
├── Method Handle Specialization
└── Interface Default Method Inlining
```

### Practical Recommendations

**For High-Performance Applications:**

1. **Prefer method references** whenever possible
2. **Avoid capturing variables** in performance-critical code
3. **Extract lambdas from loops** to prevent repeated allocation
4. **Use anonymous classes** for complex state management
5. **Profile your specific use case** - JVM optimizations can vary

**For Enterprise Applications:**

1. **Lambdas for stream operations** - the API is designed for them
2. **Anonymous classes for event listeners** - better debugging and state management
3. **Consider memory pressure** in high-throughput scenarios
4. **Monitor GC behavior** when switching from anonymous classes to lambdas

> **Final Performance Principle** : The choice between lambdas and anonymous classes should primarily be driven by code clarity and maintainability, with performance being a secondary consideration. The JVM's sophisticated optimization capabilities ensure that well-written lambda code will generally perform excellently, while poorly designed code will be slow regardless of the approach chosen.

The performance benefits of lambdas are most pronounced in scenarios involving high-frequency operations, such as stream processing, where the cumulative effect of reduced object allocation and optimized method dispatch becomes significant. For occasional use, the performance difference is negligible compared to the code readability benefits that lambdas provide.
