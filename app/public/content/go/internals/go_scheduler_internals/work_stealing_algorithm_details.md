# Go's Work Stealing Algorithm: A First Principles Explanation

Work stealing is a fundamental scheduling algorithm used in Go's runtime to efficiently manage goroutines across multiple processor threads. Let me explain this concept from first principles, building up our understanding step by step.

## The Problem: Concurrent Execution

To understand work stealing, we first need to understand the problem it solves. When we run a Go program with multiple goroutines, we face a fundamental challenge: how do we distribute these goroutines efficiently across the available CPU cores?

Consider this simple scenario: You have a computer with 4 CPU cores, and your Go program creates 100 goroutines. How should the Go runtime distribute these goroutines to maximize CPU utilization and minimize idle time?

## Core Concepts

Before diving into work stealing specifically, let's establish some foundational concepts:

### 1. Goroutines

Goroutines are lightweight threads managed by the Go runtime rather than the operating system. They are much cheaper to create and destroy than OS threads.

```go
// Creating a goroutine
go func() {
    // Some work here
    fmt.Println("I'm a goroutine!")
}()
```

In this example, we're creating a goroutine that executes the anonymous function. The Go runtime is responsible for scheduling this goroutine to run on an available OS thread.

### 2. OS Threads vs. Goroutines

OS threads are managed by the operating system and are relatively heavyweight. Each thread typically requires:

* Fixed, large stack (often several MB)
* Significant creation/destruction cost
* OS-managed scheduling

Goroutines, in contrast, are:

* Extremely lightweight (initial stack of just 2KB in modern Go)
* Inexpensive to create (thousands or millions are practical)
* Scheduled by Go's runtime, not the OS

### 3. Go's M:P:G Scheduler Model

Go uses what's called an M:P:G scheduler model:

* M: Machine (OS thread)
* P: Processor (logical processor, scheduler context)
* G: Goroutine

This is crucial to understand before diving into work stealing:

```go
// Conceptual representation - not actual Go code
type M struct {  // OS Thread
    p           *P      // Current P being used
    spinning    bool    // Is this thread spinning looking for work?
    // ...other fields
}

type P struct {  // Processor 
    localQueue  []*G    // Local queue of goroutines
    // ...other fields
}

type G struct {  // Goroutine
    stack       []byte  // Goroutine's stack
    pc          uintptr // Program counter
    // ...other fields
}
```

In this conceptual model:

* M (OS thread) executes goroutines
* P (processor) maintains a local queue of runnable goroutines
* G (goroutine) contains the actual work to be done

By default, Go creates as many P's as there are CPU cores available (controlled by GOMAXPROCS).

## Work Stealing Algorithm: First Principles

Now that we understand the foundation, let's explore the work stealing algorithm from first principles.

### The Basic Problem

Imagine we have 4 P's (logical processors), each with its own local queue of goroutines. What happens if one P finishes all its goroutines while others still have lots of work?

Without work stealing, we'd have:

* Processor 1: Idle (no work)
* Processor 2: 10 goroutines waiting
* Processor 3: 15 goroutines waiting
* Processor 4: 20 goroutines waiting

This is inefficient! Some processors are sitting idle while others are overloaded.

### The Solution: Work Stealing

The fundamental principle of work stealing is simple:
**When a processor runs out of work, it should "steal" work from other busy processors rather than remaining idle.**

Here's how it works in Go:

1. When a P's local queue is empty, its M (OS thread) looks for work elsewhere
2. It attempts to steal goroutines from other P's queues
3. It typically steals from the "end" of another P's queue (the opposite end from where the owner P takes work)

Let's explore this process step by step.

### The Work Stealing Process in Detail

When a processor P becomes idle, it follows this sequence:

1. **Check local queue** : First, it checks if any goroutines remain in its local queue
2. **Check global queue** : If local queue is empty, it checks the global run queue
3. **Check network pollers** : If still no work, check for network pollers with ready goroutines
4. **Attempt to steal work** : If still no work, try to steal from other processors

```go
// Simplified pseudocode for the work stealing algorithm
func findRunnable() *G {
    // 1. Check local run queue
    if g := p.localQueue.pop(); g != nil {
        return g
    }
  
    // 2. Check global queue
    if g := globalQueue.pop(); g != nil {
        return g
    }
  
    // 3. Check network poller
    if g := netpoller(); g != nil {
        return g
    }
  
    // 4. Try to steal from other Ps
    for i := 0; i < len(allPs); i++ {
        otherP := allPs[randomIndex]
        if g := stealWork(otherP); g != nil {
            return g
        }
    }
  
    // No work found
    return nil
}
```

This pseudocode demonstrates the search order when looking for work.

### Work Stealing Strategy: The Details

The actual work stealing strategy has several interesting nuances:

1. **Random stealing** : The idle P chooses another P at random to steal from, rather than checking them in order. This helps avoid contention.
2. **Batch stealing** : Instead of stealing a single goroutine, Go typically steals half of the victim P's queue. This amortizes the cost of stealing and reduces the likelihood of needing to steal again soon.
3. **End stealing** : A P steals from the opposite end of the queue than the victim P uses for its own consumption. This minimizes contention.

Let's look at a simplified example of the stealing logic:

```go
// Simplified work stealing logic
func stealWork(victim *P) *G {
    // Lock the victim's queue to prevent concurrent access
    victim.lock()
    defer victim.unlock()
  
    // Get half the goroutines from the victim's queue
    n := len(victim.localQueue) / 2
    if n == 0 {
        return nil // Nothing to steal
    }
  
    stolen := make([]*G, n)
    // Steal from the end of the queue
    for i := 0; i < n; i++ {
        stolen[i] = victim.localQueue.popLast()
    }
  
    // Return one goroutine to run immediately
    // and put the rest in our local queue
    g := stolen[0]
    for i := 1; i < n; i++ {
        p.localQueue.push(stolen[i])
    }
  
    return g
}
```

This pseudocode demonstrates how a P steals multiple goroutines at once and immediately begins executing one while storing the others in its local queue.

## Work Stealing in Action: An Example

Let's walk through a concrete example to see how work stealing works in practice.

Imagine we have a 4-core machine running a Go program with the following state:

* P1: Empty queue (just finished all work)
* P2: 8 goroutines in queue
* P3: 4 goroutines in queue
* P4: 10 goroutines in queue

Here's what happens:

1. P1 finds its local queue empty
2. P1 checks the global queue, but it's also empty
3. P1 checks network pollers, but finds no ready goroutines
4. P1 decides to steal work and randomly selects P4
5. P1 steals 5 goroutines (half of P4's 10)
6. P1 immediately executes one of the stolen goroutines
7. P1 adds the other 4 stolen goroutines to its local queue

After this stealing:

* P1: 4 goroutines in queue (running 1)
* P2: 8 goroutines in queue
* P3: 4 goroutines in queue
* P4: 5 goroutines in queue

The load is now more balanced, and all processors are doing useful work!

## Real-world Complexities

The actual implementation in Go's runtime has additional complexities:

### 1. Spinning Threads

When an M (OS thread) can't find work immediately, it doesn't immediately go to sleep. Instead, it enters a "spinning" state where it actively looks for work for a short time before sleeping.

```go
// Simplified spinning logic
func findRunnable() *G {
    // Try to find work without spinning first
    if g := tryFindRunnable(); g != nil {
        return g
    }
  
    // Start spinning
    m.spinning = true
  
    // More aggressive work searching while spinning
    for i := 0; i < spinningIterations; i++ {
        if g := tryFindRunnable(); g != nil {
            m.spinning = false
            return g
        }
        // Yield to give other threads a chance
        procyield(10)
    }
  
    // Still no work after spinning, prepare to sleep
    m.spinning = false
    return nil
}
```

This spinning behavior improves performance by avoiding the cost of putting a thread to sleep and waking it up if work becomes available quickly.

### 2. Global Queue Balancing

In addition to stealing from other P's, Go periodically moves goroutines between local queues and the global queue to ensure fairness.

```go
// When a P's local queue gets too large
func checkLocalQueueBalance() {
    if len(p.localQueue) > localQueueCap/2 {
        // Move some goroutines to the global queue
        n := len(p.localQueue) / 2
        for i := 0; i < n; i++ {
            g := p.localQueue.pop()
            globalQueue.push(g)
        }
    }
}
```

This prevents a scenario where one P hoards too many goroutines while others are starving.

### 3. Stealing Priorities

Go's work stealing algorithm actually tries several sources of work in a specific order:

1. Local run queue
2. Global run queue (taking half, at most 257)
3. Network pollers
4. Stealing from other P's local queues
5. Global run queue again (if still not empty)

This prioritization helps maintain locality while ensuring all work eventually gets processed.

## Performance Implications

Work stealing has profound implications for Go's performance:

1. **Improved CPU utilization** : By ensuring all processor cores have work to do, work stealing maximizes hardware utilization.
2. **Dynamic load balancing** : The system automatically adapts to uneven workloads without requiring developer intervention.
3. **Reduced contention** : By using local queues for most scheduling operations, Go minimizes the need for global locks.

## Practical Example: Parallel Computing

Let's consider a practical example. Suppose we're implementing parallel computation on a slice:

```go
func parallelProcess(data []int) []int {
    result := make([]int, len(data))
  
    // Create a wait group to synchronize goroutines
    var wg sync.WaitGroup
    wg.Add(len(data))
  
    // Process each item in parallel
    for i, item := range data {
        // Launch a goroutine for each item
        go func(i, val int) {
            defer wg.Done()
            // Expensive computation
            result[i] = expensiveComputation(val)
        }(i, item)
    }
  
    // Wait for all goroutines to complete
    wg.Wait()
    return result
}

func expensiveComputation(val int) int {
    // Simulate complex work
    time.Sleep(time.Millisecond * time.Duration(rand.Intn(100)))
    return val * val
}
```

In this example, we're creating many goroutines that may have different execution times. Without work stealing, if some goroutines take much longer than others, we'd end up with some processors idle while others are still busy. Work stealing ensures that as processors finish their assigned goroutines, they steal work from processors that still have a backlog, keeping all cores busy until the entire job is done.

## Visualizing Work Stealing

To better understand work stealing, let's visualize it:

1. **Initial state** : Each P has some goroutines in its local queue
   P1: [G1, G2, G3]
   P2: [G4, G5]
   P3: [G6, G7, G8, G9]
   P4: [G10, G11]
2. **After P2 completes its goroutines** :
   P2 is now idle and looks for work to steal. It randomly selects P3 and steals half of its goroutines.
   P1: [G1, G2, G3]
   P2: [G8, G9] (stolen from P3)
   P3: [G6, G7]
   P4: [G10, G11]
3. **After P1 completes its goroutines** :
   P1 is now idle and looks for work to steal. It randomly selects P4.
   P1: [G11] (stolen from P4)
   P2: [G8, G9]
   P3: [G6, G7]
   P4: [G10]

This dynamic rebalancing continues until all work is complete, ensuring efficient processor utilization throughout.

## Common Misconceptions

There are several common misconceptions about Go's work stealing scheduler:

1. **Goroutines are OS threads** : No, goroutines are much lighter weight and managed by Go's runtime, not the OS.
2. **One goroutine per core** : No, Go can efficiently manage thousands or millions of goroutines across a small number of OS threads.
3. **Work stealing causes high overhead** : Actually, the design is quite efficient. Stealing happens relatively infrequently compared to normal scheduling operations.
4. **GOMAXPROCS should match available cores** : This is generally true, but in some I/O-bound applications, setting it higher might improve performance.

## Conclusion

Go's work stealing algorithm is a sophisticated scheduling mechanism that enables efficient execution of concurrent programs. By dynamically balancing work across processors, it ensures maximum utilization of available CPU resources while minimizing contention.

Understanding this algorithm helps Go developers write more efficient concurrent code by:

1. Creating an appropriate number of goroutines (not too few, not too many)
2. Structuring work to enable effective stealing (neither too fine-grained nor too coarse-grained)
3. Avoiding patterns that cause excessive synchronization or contention

The beauty of Go's work stealing scheduler is that it mostly "just works" without developer intervention, allowing Go programmers to focus on expressing concurrency naturally rather than micromanaging thread allocation.
