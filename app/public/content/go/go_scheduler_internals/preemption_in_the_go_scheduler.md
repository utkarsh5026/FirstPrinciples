# Go's Preemption in the Scheduler: From First Principles

Preemption in Go's scheduler is a fundamental concept that impacts how concurrent programs behave. Let me explore this topic deeply, starting from the absolute basics and building up to the more complex aspects.

## Understanding Concurrency: The Foundation

Before diving into preemption specifically, we need to understand what concurrency is and how Go approaches it.

In the simplest terms, concurrency means doing multiple things at once. In computing, this doesn't necessarily mean true parallelism (executing multiple tasks simultaneously on different CPU cores), but rather the ability to make progress on multiple tasks, even if the CPU is working on only one at any given moment.

Go implements concurrency primarily through goroutines, which are lightweight threads managed by the Go runtime rather than the operating system.

### What is a Goroutine?

A goroutine is a function that can run concurrently with other functions. Think of it as an extremely lightweight thread. When you prefix a function call with the `go` keyword, you create a new goroutine:

```go
func sayHello() {
    fmt.Println("Hello, world!")
}

// This creates a new goroutine
go sayHello()
// The program continues executing here immediately
```

This code launches `sayHello` in a new goroutine and continues executing the next line without waiting for `sayHello` to complete. The Go runtime manages these goroutines, deciding when each one gets to run.

## The Go Scheduler: Managing Goroutines

The Go scheduler is responsible for distributing goroutines across available OS threads, which in turn run on available CPU cores. This scheduler is a critical component that implements an M:N scheduling model:

* M: OS threads (managed by the OS scheduler)
* P: Processors (logical cores, essentially a resource/context needed to execute Go code)
* G: Goroutines (the actual tasks to be performed)

### Key Components of the Go Scheduler

1. **G (Goroutine)** : A function executing concurrently with other goroutines
2. **M (Machine)** : An OS thread that can execute goroutines
3. **P (Processor)** : A context required to execute goroutines on an M

With this model, Go can run many goroutines on just a few OS threads, making concurrency very efficient.

Here's a simplified diagram of how these components interact:

```
G1 G2 G3 G4 ... (many goroutines)
 │  │  │  │
 ▼  ▼  ▼  ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│   P  │ │   P  │ │   P  │ │   P  │  (limited number of processors)
└──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘
   │        │        │        │
┌──▼───┐ ┌──▼───┐ ┌──▼───┐ ┌──▼───┐
│   M  │ │   M  │ │   M  │ │   M  │  (limited number of OS threads)
└──────┘ └──────┘ └──────┘ └──────┘
```

## Understanding Preemption: The Core Concept

Now that we understand the scheduler components, let's focus on preemption itself.

### What is Preemption?

In its essence, preemption is the ability of a scheduler to interrupt a running task (in our case, a goroutine) to allow another task to run. This interruption happens without the cooperation of the running task.

Without preemption, a task would need to voluntarily yield control back to the scheduler, which can lead to problems if a task never yields or takes too long to yield.

### Why is Preemption Important in Go?

Preemption solves several critical problems:

1. **Fairness** : Ensures all goroutines get a chance to run
2. **Responsiveness** : Prevents a single goroutine from hogging CPU time
3. **Deadlock Prevention** : Helps avoid situations where the system can't make progress

## The Evolution of Preemption in Go

Go's preemption model has evolved significantly over time. Understanding this evolution helps clarify why the current implementation exists.

### Go 1.0-1.13: Cooperative Preemption

In early versions of Go, the scheduler used what's called "cooperative preemption." This means goroutines had to voluntarily yield control at specific points:

1. Channel operations
2. Function calls (because the compiler inserted checks)
3. Memory allocation (when the garbage collector runs)

Here's a simplified example of how this could cause problems:

```go
func infiniteLoop() {
    for {
        // This loop contains no function calls, channel operations,
        // or memory allocations - it will NEVER yield!
        sum := 0
        for i := 0; i < 1_000_000; i++ {
            sum += i
        }
    }
}

func main() {
    go infiniteLoop()  // This will hog the processor
    go fmt.Println("I might never execute!") // This might starve
    time.Sleep(1 * time.Second)
}
```

In this example, `infiniteLoop` might prevent other goroutines from running because it never hits a preemption point.

### Go 1.14+: Non-Cooperative (Asynchronous) Preemption

Starting with Go 1.14 (released in February 2020), Go introduced non-cooperative preemption. This was a significant change that allowed the scheduler to interrupt goroutines even if they don't cooperate.

## How Does Modern Go Preemption Work?

Modern Go preemption works through a combination of techniques:

### 1. Signal-based Preemption

The Go runtime uses OS signals (specifically SIGURG on Unix-like systems) to interrupt goroutines. Here's how it works:

1. The scheduler decides a goroutine has run for too long (currently about 10ms)
2. The runtime sends a signal to the OS thread running that goroutine
3. The signal handler safely pauses the goroutine at an appropriate point
4. The goroutine is placed back in the scheduler queue
5. Another goroutine gets to run

Let's see a conceptual example of how this works:

```go
// In Go 1.14+, this no longer blocks other goroutines indefinitely
func cpuIntensiveTask() {
    for {
        // Even though this has no yield points,
        // the Go scheduler can now preempt it
        sum := 0
        for i := 0; i < 1_000_000_000; i++ {
            sum += i
        }
    }
}

func main() {
    go cpuIntensiveTask()  
    go fmt.Println("I can now run reliably!") // This will get to execute
    time.Sleep(1 * time.Second)
}
```

### 2. Safe Points for Preemption

Go can't preempt a goroutine at just any instruction. It needs to ensure the goroutine is in a state where it's safe to pause it. These safe points include:

* Function prologue (beginning of a function)
* Loop back-edges (end of loop iterations)
* Certain memory operations

### 3. Stack Scanning

When a goroutine is preempted, the Go runtime needs to preserve its entire state, including its stack. This means scanning the stack to find all pointers and ensuring they're properly tracked for garbage collection.

## Practical Implications of Go's Preemption Model

Understanding Go's preemption has practical implications for writing efficient and correct concurrent programs:

### 1. Long-Running Loops Are Now Safer

With non-cooperative preemption, you don't need to worry as much about long-running loops blocking the scheduler. However, it's still a good practice to yield occasionally:

```go
func betterLongRunningTask(ctx context.Context) {
    for {
        // Do some work
      
        // Periodically check if we should stop
        select {
        case <-ctx.Done():
            return
        default:
            // Continue working
        }
    }
}
```

### 2. Synchronization Is Still Necessary

Preemption doesn't eliminate the need for proper synchronization. If multiple goroutines access shared data, you still need mutexes, channels, or other synchronization mechanisms:

```go
var counter int
var mu sync.Mutex

func incrementCounter() {
    mu.Lock()
    counter++
    mu.Unlock()
}
```

### 3. Understanding STW (Stop-The-World) Events

Despite preemption improvements, there are still moments when the Go runtime needs to stop all goroutines temporarily, particularly during certain garbage collection phases. These are called STW (Stop-The-World) events.

## Practical Examples: Seeing Preemption in Action

Let's look at some concrete examples that demonstrate Go's preemption:

### Example 1: CPU-Bound Task with Modern Preemption

```go
package main

import (
    "fmt"
    "runtime"
    "time"
)

func cpuIntensiveTask() {
    count := 0
    for {
        count++
        if count%1000000000 == 0 {
            fmt.Printf("Heavy task reached %d\n", count)
        }
    }
}

func periodicPrint() {
    count := 0
    for {
        count++
        fmt.Printf("Periodic task: %d\n", count)
        time.Sleep(100 * time.Millisecond)
    }
}

func main() {
    // Use only one CPU to make scheduling more obvious
    runtime.GOMAXPROCS(1)
  
    // Start a CPU-intensive task
    go cpuIntensiveTask()
  
    // Start a periodic printing task
    go periodicPrint()
  
    // Let the program run for 2 seconds
    time.Sleep(2 * time.Second)
}
```

With modern preemption, both goroutines will get CPU time, and you'll see output from both tasks interleaved.

### Example 2: Demonstrating Preemption Fairness

```go
package main

import (
    "fmt"
    "runtime"
    "time"
)

func worker(id int) {
    count := 0
    lastTime := time.Now()
  
    for {
        count++
      
        // Every 500ms of work, print stats
        if count%10000000 == 0 {
            now := time.Now()
            elapsed := now.Sub(lastTime)
            fmt.Printf("Worker %d: processed %d iterations in %v\n", 
                       id, count, elapsed)
            lastTime = now
        }
    }
}

func main() {
    // Use only one CPU
    runtime.GOMAXPROCS(1)
  
    // Start 3 worker goroutines
    for i := 1; i <= 3; i++ {
        go worker(i)
    }
  
    // Let them run for 5 seconds
    time.Sleep(5 * time.Second)
}
```

In this example, even though we have only one CPU, all three workers will make progress, demonstrating that the scheduler is preempting them fairly.

## Visualizing the Go Scheduler with Traces

Go provides tools to visualize how goroutines are scheduled, which can help understand preemption in practice:

```go
package main

import (
    "fmt"
    "os"
    "runtime/trace"
    "time"
)

func cpuBound() {
    for i := 0; i < 100000000; i++ {
        // Just burn CPU cycles
    }
    fmt.Println("CPU bound task completed")
}

func main() {
    // Create trace file
    f, err := os.Create("trace.out")
    if err != nil {
        panic(err)
    }
    defer f.Close()
  
    // Start tracing
    err = trace.Start(f)
    if err != nil {
        panic(err)
    }
  
    // Start several CPU-bound goroutines
    for i := 0; i < 4; i++ {
        go cpuBound()
    }
  
    // Wait a bit
    time.Sleep(500 * time.Millisecond)
  
    // Stop tracing
    trace.Stop()
  
    fmt.Println("Trace complete - view with 'go tool trace trace.out'")
}
```

You can analyze the resulting trace file with `go tool trace trace.out` to see exactly how goroutines were scheduled and preempted.

## Advanced Preemption Topics

### 1. Preemption and the Network Poller

Go has a special mechanism called the network poller that handles I/O operations efficiently. When a goroutine performs I/O (like reading from a network socket), it's not technically preempted but rather moved to a waiting state until the I/O completes.

```go
func readFromNetwork(conn net.Conn) {
    buffer := make([]byte, 1024)
  
    // This will not block other goroutines
    // The goroutine is moved off the OS thread while waiting
    n, err := conn.Read(buffer)
  
    // Process data...
}
```

### 2. User-Land Context Switching

Go's preemption is special because it happens entirely in user-space (rather than kernel space). This makes it extremely efficient compared to traditional OS thread preemption.

### 3. Work-Stealing Scheduler

The Go scheduler uses a work-stealing approach. When a processor (P) runs out of goroutines, it tries to steal goroutines from other processors' queues. This balances the load across all available CPUs.

## Common Preemption-Related Issues and Solutions

### 1. Goroutine Starvation

Problem: Despite preemption, some goroutines might still not get enough CPU time.

Solution: Use priority queues or manual yielding with `runtime.Gosched()`:

```go
func yieldingTask() {
    for {
        // Do some work
      
        // Explicitly yield to give other goroutines a chance
        runtime.Gosched()
    }
}
```

### 2. Deadlocks Despite Preemption

Problem: Preemption helps avoid CPU hogging but doesn't prevent logical deadlocks.

Solution: Use proper synchronization and deadlock detection:

```go
// Use channels with timeouts
select {
case result := <-resultChan:
    // Process result
case <-time.After(5 * time.Second):
    // Handle timeout
}
```

## Comparing Go's Preemption with Other Languages

Go's preemption model is unique compared to other languages:

* **Java** : Uses preemptive threading but relies on OS threads
* **JavaScript** : Single-threaded with cooperative concurrency (event loop)
* **Python** : Various models depending on implementation (GIL in CPython)

Go's approach gives it several advantages:

1. More lightweight than Java's thread model
2. More parallelizable than JavaScript's event loop
3. More efficient than Python's GIL-constrained model

## Conclusion

Go's preemption model has evolved from a cooperative approach to a non-cooperative one, making it more robust for concurrent programming. This evolution represents a balance between efficiency and fairness, allowing Go programs to utilize system resources effectively while ensuring that all goroutines get a chance to run.

Understanding how preemption works in Go helps developers write better concurrent code and diagnose issues related to concurrency. While the Go runtime handles much of the complexity automatically, being aware of these mechanisms can inform how you structure your concurrent programs for optimal performance and reliability.

The Go scheduler, with its M:P:G model and non-cooperative preemption, is one of Go's most powerful features, enabling lightweight concurrency that scales effectively across available CPU cores while maintaining the simplicity that Go is known for.
