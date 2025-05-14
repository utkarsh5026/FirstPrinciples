# Task Groups in Go: A First Principles Explanation

To understand task groups in Go, we need to build from the most fundamental concepts of concurrent programming and gradually work our way up to how Go implements this pattern.

## The Foundation: Concurrency vs Parallelism

Before diving into task groups, let's understand what problem they solve. Concurrency is about structure - dealing with multiple things at once. Parallelism is about execution - doing multiple things at once.

Go was designed with concurrency as a core principle. When Rob Pike, one of Go's creators, talks about concurrency, he emphasizes that it's a way to structure a program to handle multiple tasks, which may or may not execute in parallel.

## Go's Concurrency Model: Goroutines and Channels

Go implements a concurrency model based on Communicating Sequential Processes (CSP), a formal language for describing patterns of interaction in concurrent systems.

### Goroutines

A goroutine is a lightweight thread managed by the Go runtime. Starting a goroutine is simple:

```go
go myFunction() // This runs myFunction concurrently
```

Goroutines are extremely lightweight - you can easily create thousands of them. They're multiplexed onto OS threads, so when one goroutine blocks (waiting for I/O, for example), Go can schedule another goroutine to run.

### Channels

Channels are the pipes that connect concurrent goroutines. You can send values into channels from one goroutine and receive those values in another goroutine:

```go
ch := make(chan string) // Create a channel for strings

// In one goroutine
go func() {
    ch <- "Hello from another goroutine" // Send a value
}()

// In the main goroutine
message := <-ch // Receive the value
fmt.Println(message)
```

In this example, we create a channel, send a message through it from one goroutine, and receive that message in another. The channel synchronizes the two goroutines - the receiver will wait until a value is available.

## The Challenge: Managing Multiple Goroutines

While goroutines are easy to create, managing them becomes complex:

1. How do you know when all goroutines have completed?
2. How do you handle errors that occur in goroutines?
3. How do you propagate cancellation to all goroutines?

Let's examine a common pattern for waiting for multiple goroutines:

```go
var wg sync.WaitGroup

for i := 0; i < 5; i++ {
    wg.Add(1) // Increment counter before starting goroutine
    go func(id int) {
        defer wg.Done() // Decrement counter when goroutine completes
        fmt.Printf("Worker %d starting\n", id)
        time.Sleep(time.Second) // Simulate work
        fmt.Printf("Worker %d done\n", id)
    }(i)
}

wg.Wait() // Wait for all goroutines to complete
fmt.Println("All workers completed")
```

This pattern works but has limitations:

* Error handling is difficult - there's no built-in way to propagate errors from goroutines
* Cancellation requires additional code with context
* The code becomes repetitive when used frequently

## Enter Task Groups: Simplifying Goroutine Management

The `golang.org/x/sync/errgroup` package introduces the concept of a task group (often called an error group) to solve these problems. It provides a clean abstraction for running multiple tasks concurrently and collecting their results.

Let's understand its core principles:

### Basic Usage of errgroup

```go
import (
    "context"
    "fmt"
    "golang.org/x/sync/errgroup"
)

func main() {
    g, ctx := errgroup.WithContext(context.Background())
  
    // Launch several tasks
    for i := 0; i < 5; i++ {
        id := i  // Create a local variable to avoid closure problems
        g.Go(func() error {
            fmt.Printf("Task %d starting\n", id)
            // Do some work, which might return an error
            if id == 3 {
                return fmt.Errorf("task %d failed", id)
            }
            fmt.Printf("Task %d completed\n", id)
            return nil
        })
    }
  
    // Wait for all tasks and collect errors
    if err := g.Wait(); err != nil {
        fmt.Printf("Error occurred: %v\n", err)
    } else {
        fmt.Println("All tasks completed successfully")
    }
}
```

Let's analyze what's happening here:

1. We create an error group with `errgroup.WithContext()`, which returns both the group and a context
2. For each task, we call `g.Go()` with a function that returns an error
3. Finally, we call `g.Wait()`, which blocks until all tasks complete and returns the first error encountered

The key insight: the error group is managing the wait group pattern for us and collecting errors.

### Understanding Error Handling

The error group returns the first error encountered by any task. If multiple tasks return errors, only the first one is reported. This is a design decision based on the common pattern of stopping work once an error occurs.

```go
g := new(errgroup.Group)

// Launch multiple tasks
g.Go(func() error {
    time.Sleep(100 * time.Millisecond)
    return fmt.Errorf("error from task 1")
})

g.Go(func() error {
    time.Sleep(200 * time.Millisecond)
    return fmt.Errorf("error from task 2")
})

// Wait will return "error from task 1" because it happened first
err := g.Wait()
fmt.Println(err)
```

### Cancellation with Context

One powerful feature of error groups is automatic cancellation. When you create an error group with a context, it creates a derived context that's cancelled as soon as any goroutine returns an error:

```go
g, ctx := errgroup.WithContext(context.Background())

// Launch a task that will fail
g.Go(func() error {
    time.Sleep(100 * time.Millisecond)
    return fmt.Errorf("task failed")
})

// Launch a task that uses the context
g.Go(func() error {
    select {
    case <-time.After(1 * time.Second):
        fmt.Println("This won't print - context will cancel first")
        return nil
    case <-ctx.Done():
        fmt.Println("Task cancelled due to context")
        return ctx.Err()
    }
})

err := g.Wait()
fmt.Println("Error:", err)
```

In this example, when the first task fails after 100ms, the context is cancelled, which causes the second task to exit early rather than waiting the full second.

## Practical Example: Parallel File Processing

Let's apply task groups to a real-world example: processing multiple files concurrently.

```go
func processFiles(filenames []string) error {
    g, ctx := errgroup.WithContext(context.Background())
  
    results := make(chan string, len(filenames))
  
    for _, filename := range filenames {
        filename := filename // Create local variable for closure
      
        g.Go(func() error {
            // Check if context has been cancelled
            select {
            case <-ctx.Done():
                return ctx.Err()
            default:
                // Process continues
            }
          
            data, err := processFile(filename)
            if err != nil {
                return fmt.Errorf("error processing %s: %w", filename, err)
            }
          
            select {
            case results <- data:
                return nil
            case <-ctx.Done():
                return ctx.Err()
            }
        })
    }
  
    // Start a goroutine to close results channel when all tasks complete
    go func() {
        g.Wait()
        close(results)
    }()
  
    // Process results as they arrive
    for result := range results {
        fmt.Println("Got result:", result)
    }
  
    // Check if there were any errors
    return g.Wait()
}

func processFile(filename string) (string, error) {
    // Simulate file processing
    time.Sleep(100 * time.Millisecond)
    return "Processed " + filename, nil
}
```

This example shows how to:

1. Process files concurrently
2. Collect results through a channel
3. Properly handle early termination if any file fails
4. Close the results channel when all tasks complete

## Implementing a Custom Task Group

To understand task groups fully, let's implement a simplified version:

```go
type TaskGroup struct {
    wg     sync.WaitGroup
    errMu  sync.Mutex
    err    error
    ctx    context.Context
    cancel context.CancelFunc
}

func NewTaskGroup() (*TaskGroup, context.Context) {
    ctx, cancel := context.WithCancel(context.Background())
    return &TaskGroup{
        ctx:    ctx,
        cancel: cancel,
    }, ctx
}

func (g *TaskGroup) Go(f func() error) {
    g.wg.Add(1)
  
    go func() {
        defer g.wg.Done()
      
        if err := f(); err != nil {
            g.errMu.Lock()
            if g.err == nil {
                g.err = err
                g.cancel() // Cancel context on first error
            }
            g.errMu.Unlock()
        }
    }()
}

func (g *TaskGroup) Wait() error {
    g.wg.Wait()
    g.cancel() // Ensure context is cancelled when done
    return g.err
}
```

Let's break down what this implementation does:

1. We maintain a wait group to track goroutines
2. We use a mutex to protect access to the error field
3. We store the first error encountered
4. We cancel the context when an error occurs
5. The `Wait` method waits for all goroutines and returns the first error

This simplified implementation captures the core principles of the standard library's errgroup.

## Advanced Pattern: Limited Concurrency

One limitation of the standard errgroup is that it doesn't limit the number of concurrent tasks. For resource-intensive operations, we might want to limit concurrency:

```go
func processWithLimitedConcurrency(items []string, concurrency int) error {
    g, ctx := errgroup.WithContext(context.Background())
  
    // Create a semaphore channel with size equal to max concurrency
    sem := make(chan struct{}, concurrency)
  
    for _, item := range items {
        item := item // Local variable for closure
      
        // Acquire semaphore
        sem <- struct{}{}
      
        g.Go(func() error {
            // Release semaphore when done
            defer func() { <-sem }()
          
            select {
            case <-ctx.Done():
                return ctx.Err()
            default:
                return processItem(item)
            }
        })
    }
  
    return g.Wait()
}

func processItem(item string) error {
    // Process the item
    fmt.Println("Processing", item)
    time.Sleep(100 * time.Millisecond)
    return nil
}
```

This pattern uses a semaphore (implemented as a buffered channel) to limit the number of concurrent goroutines.

## Go 1.18+: sync.Group and Go 1.20+: slog.Group

In more recent versions of Go, there are additional options for task groups:

### sync.Group (experimental)

The Go team has been working on a new `sync.Group` package that would provide similar functionality to errgroup but with more flexibility.

### Go 1.20: slog.Group for structured logging

While not strictly a task group, Go 1.20 introduced `slog.Group` which can be used for grouping related log entries, showing how the group concept extends beyond concurrent tasks.

## When to Use Task Groups

Task groups shine in several scenarios:

1. **Parallel data processing** : When you need to process multiple items independently
2. **Fan-out requests** : When making multiple API or database requests concurrently
3. **Component lifecycle management** : When starting/stopping multiple components
4. **Coordinated workers** : When you need multiple workers that should all stop if one fails

## Best Practices for Task Groups

1. **Always check the error** : The whole point of task groups is error handling, so always check the error returned by `Wait()`
2. **Use context for cancellation** : Pass a parent context to allow external cancellation
3. **Keep tasks independent** : Ideally, tasks should not depend on each other
4. **Be careful with shared state** : If tasks modify shared data, use proper synchronization
5. **Limit concurrency when appropriate** : Use semaphores or worker pools for resource-intensive tasks

## Conclusion

Task groups in Go provide an elegant abstraction for managing concurrent tasks, handling errors, and propagating cancellation. By understanding their principles, you can write clean, efficient concurrent code that's easier to reason about.

The progression from basic goroutines to sync.WaitGroup to errgroup shows Go's evolution in providing higher-level abstractions while maintaining the simplicity and power of its concurrency model.

Starting from first principles of concurrency, we've seen how Go's approach leads naturally to task groups as a solution for coordinating multiple concurrent operations - handling their lifetime, errors, and cancellation in a unified way.
