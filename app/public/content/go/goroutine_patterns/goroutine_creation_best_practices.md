# Goroutine Creation Best Practices

I'll explain goroutines from first principles and provide best practices for creating and managing them effectively. Let's build a comprehensive understanding of this crucial Go concurrency feature.

## What Is a Goroutine? First Principles

At its most fundamental level, a goroutine is Go's lightweight implementation of a concurrent execution path. To truly understand goroutines, we need to first understand what concurrency means.

Concurrency refers to the ability to handle multiple tasks at once, but not necessarily simultaneously. It's different from parallelism:

* **Concurrency** : Dealing with multiple things at once (like a juggler with multiple balls)
* **Parallelism** : Doing multiple things at the exact same time (like multiple jugglers each with their own ball)

Goroutines are the building blocks that enable concurrency in Go. They're essentially functions that can run concurrently with other functions. What makes them special is that they're incredibly lightweight compared to traditional threads:

* A regular OS thread might consume megabytes of memory
* A goroutine starts with just 2KB of stack space (which can grow and shrink as needed)

This lightweight nature means you can create thousands or even millions of goroutines without overwhelming system resources.

## How Goroutines Work

When you create a goroutine, you're not directly creating an OS thread. Instead, the Go runtime manages a pool of OS threads and schedules goroutines onto these threads. This abstraction layer is what makes goroutines so efficient.

Let's see a basic example:

```go
package main

import (
    "fmt"
    "time"
)

func sayHello() {
    fmt.Println("Hello from goroutine!")
}

func main() {
    // Create a new goroutine
    go sayHello()
  
    // Give the goroutine time to execute before main exits
    time.Sleep(100 * time.Millisecond)
    fmt.Println("Main function")
}
```

In this example, `go sayHello()` launches a new goroutine. The `go` keyword tells the Go runtime to execute this function concurrently. The main function continues executing while the goroutine runs independently.

## Best Practices for Goroutine Creation

Now that we understand what goroutines are, let's explore the best practices for creating them.

### 1. Always Ensure Proper Goroutine Termination

One of the most common mistakes is creating goroutines that never terminate, causing memory leaks.

**Bad practice:**

```go
func processData(data []int) {
    go func() {
        // This goroutine might never finish if the main function exits
        for _, item := range data {
            processItem(item)
        }
    }()
    // No mechanism to wait for goroutine completion
}
```

**Good practice:**

```go
func processData(data []int, wg *sync.WaitGroup) {
    wg.Add(1)
    go func() {
        defer wg.Done()
        for _, item := range data {
            processItem(item)
        }
    }()
    // Later, caller can use wg.Wait() to ensure completion
}
```

In the good example, we use a `sync.WaitGroup` to track goroutine completion. This ensures we know when all goroutines are done, preventing resource leaks.

### 2. Use Context for Cancellation and Timeouts

Goroutines should be controllable from the outside. The `context` package provides an elegant way to handle cancellation, timeouts, and passing request-scoped values.

```go
func processWithTimeout(ctx context.Context, data []int) error {
    resultChan := make(chan int, 1)
  
    go func() {
        result := 0
        for _, item := range data {
            select {
            case <-ctx.Done():
                // Context was canceled, exit early
                return
            default:
                result += process(item)
            }
        }
        resultChan <- result
    }()
  
    select {
    case result := <-resultChan:
        return result, nil
    case <-ctx.Done():
        return 0, ctx.Err() // Return context's error (timeout or cancellation)
    }
}
```

In this example, the goroutine regularly checks if its context has been canceled. This allows the parent function to control the goroutine's lifetime by canceling the context.

### 3. Avoid Goroutine Leaks with Proper Channel Handling

Channel operations can block goroutines indefinitely if not handled properly. Always ensure there's a way for goroutines to exit even if channel operations can't complete.

**Bad practice:**

```go
func processRequests(requests chan Request) {
    for _, req := range getRequests() {
        go func(r Request) {
            // If this channel becomes full and no one reads from it,
            // this goroutine will be blocked forever
            requests <- r
        }(req)
    }
}
```

**Good practice:**

```go
func processRequests(requests chan Request, ctx context.Context) {
    for _, req := range getRequests() {
        go func(r Request) {
            select {
            case requests <- r:
                // Request sent successfully
            case <-ctx.Done():
                // Context canceled, exit without blocking
                return
            case <-time.After(5 * time.Second):
                // Timeout, don't block forever
                log.Println("Failed to send request, timeout")
                return
            }
        }(req)
    }
}
```

This improved version provides multiple ways for the goroutine to exit: context cancellation or a timeout, preventing it from blocking indefinitely.

### 4. Limit the Number of Goroutines

Just because goroutines are lightweight doesn't mean you should create unlimited numbers of them. Excessive goroutines can still cause resource exhaustion.

```go
func processItems(items []Item) {
    // Bad: Creates a goroutine for every item with no limit
    for _, item := range items {
        go processItem(item)
    }
}
```

Instead, use worker pools to limit concurrent goroutines:

```go
func processItemsWithPool(items []Item) {
    const maxWorkers = 100
  
    // Create a semaphore channel to limit concurrent goroutines
    semaphore := make(chan struct{}, maxWorkers)
    var wg sync.WaitGroup
  
    for _, item := range items {
        wg.Add(1)
        // Acquire semaphore
        semaphore <- struct{}{}
      
        go func(i Item) {
            defer func() {
                // Release semaphore when done
                <-semaphore
                wg.Done()
            }()
          
            processItem(i)
        }(item)
    }
  
    wg.Wait()
}
```

This example limits the number of concurrent goroutines to `maxWorkers`, preventing resource exhaustion even when processing large amounts of data.

### 5. Handle Panics in Goroutines

When a goroutine panics, it doesn't affect other goroutines or the main program. This can be both a blessing and a curse, as panics might go unnoticed.

```go
func safeGoroutine(wg *sync.WaitGroup) {
    wg.Add(1)
    go func() {
        defer wg.Done()
        defer func() {
            if r := recover(); r != nil {
                log.Printf("Recovered from panic: %v", r)
                // Consider logging the stack trace too
            }
        }()
      
        // Your potentially panicking code here
        riskyOperation()
    }()
}
```

Always include panic recovery in long-running goroutines, especially those that handle user input or external data.

### 6. Prefer Structured Concurrency Patterns

Structured concurrency means organizing goroutines in a way that their lifetimes are nested within their parent's scope. This helps ensure clean goroutine termination.

```go
func processRequest(ctx context.Context, req Request) (Response, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel() // Ensure all child goroutines get canceled
  
    resultChan := make(chan Response, 1)
    errChan := make(chan error, 1)
  
    go func() {
        resp, err := doSomething(ctx, req)
        if err != nil {
            errChan <- err
            return
        }
        resultChan <- resp
    }()
  
    // Wait for result, context cancellation, or timeout
    select {
    case resp := <-resultChan:
        return resp, nil
    case err := <-errChan:
        return Response{}, err
    case <-ctx.Done():
        return Response{}, ctx.Err()
    }
}
```

This pattern ensures that the parent function won't return until all its spawned goroutines have finished or been canceled, creating a clear hierarchy.

### 7. Be Careful with Shared Memory

Goroutines can access the same memory, which can lead to race conditions if not handled properly.

**Bad practice:**

```go
func incrementCounter() {
    counter := 0
    var wg sync.WaitGroup
  
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            counter++ // Race condition!
        }()
    }
    wg.Wait()
    fmt.Println(counter) // Won't reliably be 1000
}
```

**Good practice:**

```go
func incrementCounter() {
    counter := 0
    var wg sync.WaitGroup
    var mu sync.Mutex
  
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            mu.Lock()
            counter++
            mu.Unlock()
        }()
    }
    wg.Wait()
    fmt.Println(counter) // Will be 1000
}
```

Use mutexes or channels to synchronize access to shared memory between goroutines.

### 8. Consider Closures and Variable Capture Carefully

A common mistake is incorrectly capturing loop variables in goroutines.

**Bad practice:**

```go
func processItems(items []string) {
    for _, item := range items {
        go func() {
            // This will likely print the last item multiple times
            fmt.Println(item)
        }()
    }
}
```

**Good practice:**

```go
func processItems(items []string) {
    for _, item := range items {
        // Create a new variable in this scope
        itemCopy := item
        go func() {
            // This correctly prints the intended item
            fmt.Println(itemCopy)
        }()
    }
  
    // Alternatively:
    for _, item := range items {
        go func(i string) {
            // Pass as parameter
            fmt.Println(i)
        }(item)
    }
}
```

Either copy the variable or pass it as a parameter to the goroutine to ensure it captures the correct value.

## Practical Example: A Well-Structured HTTP Server

Let's put all these best practices together in a practical example of an HTTP server that processes requests concurrently:

```go
package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "os/signal"
    "sync"
    "syscall"
    "time"
)

func main() {
    // Create server
    server := &http.Server{
        Addr:    ":8080",
        Handler: http.HandlerFunc(handleRequest),
    }
  
    // Set up graceful shutdown
    done := make(chan struct{})
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
  
    // Run server in a goroutine
    go func() {
        log.Println("Server starting on port 8080")
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
        close(done)
    }()
  
    // Wait for shutdown signal
    <-quit
    log.Println("Server shutting down...")
  
    // Create shutdown context with 30s timeout
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
  
    // Gracefully shut down the server
    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }
  
    // Wait for server goroutine to exit
    <-done
    log.Println("Server exited properly")
}

// Global worker pool to limit concurrent requests
var (
    maxWorkers = 100
    semaphore  = make(chan struct{}, maxWorkers)
    wg         sync.WaitGroup
)

func handleRequest(w http.ResponseWriter, r *http.Request) {
    // Acquire semaphore or reject if at capacity
    select {
    case semaphore <- struct{}{}:
        // Got a slot, continue
    default:
        // No slot available, reject request
        http.Error(w, "Server too busy", http.StatusServiceUnavailable)
        return
    }
  
    wg.Add(1)
  
    // Process request in a goroutine
    go func() {
        defer wg.Done()
        defer func() { <-semaphore }() // Release semaphore when done
        defer func() {
            if err := recover(); err != nil {
                log.Printf("Panic in request handler: %v", err)
                // We can't write to w here as it might have already been sent
            }
        }()
      
        // Create a context with timeout for this request
        ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
        defer cancel()
      
        // Process the request
        result, err := processRequest(ctx, r)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
      
        w.Write([]byte(result))
    }()
}

func processRequest(ctx context.Context, r *http.Request) (string, error) {
    // Simulate work
    select {
    case <-time.After(2 * time.Second):
        return "Request processed successfully", nil
    case <-ctx.Done():
        return "", ctx.Err()
    }
}
```

This example demonstrates several best practices:

* Limiting concurrent goroutines with a semaphore
* Using context for timeouts and cancellation
* Handling panics in goroutines
* Graceful shutdown of the server
* Proper synchronization with wait groups

## Common Pitfalls in Goroutine Creation

To round out our understanding, let's examine common pitfalls to avoid:

### 1. Creating Goroutines in a Library Without Control Mechanisms

If you're writing a library, don't create goroutines that the caller can't control or wait for.

```go
// Bad library design
func Process(data []int) {
    go processInBackground(data) // Caller has no control!
}

// Better library design
func Process(ctx context.Context, data []int) (<-chan Result, error) {
    resultChan := make(chan Result)
  
    go func() {
        defer close(resultChan)
        for _, item := range data {
            select {
            case <-ctx.Done():
                return
            default:
                resultChan <- processItem(item)
            }
        }
    }()
  
    return resultChan, nil
}
```

The second version gives the caller control over cancellation and provides a way to receive results.

### 2. Forgetting That main() Doesn't Wait for Goroutines

When the main function returns, the program exits, regardless of any running goroutines.

```go
func main() {
    go longRunningTask() // Program might exit before this completes
  
    // No wait mechanism
    fmt.Println("Main done")
}
```

Always use synchronization mechanisms like `sync.WaitGroup` or channels to ensure proper completion.

### 3. Creating Complex Goroutine Hierarchies Without Clear Ownership

As systems grow, it becomes harder to track who's responsible for each goroutine. Establish clear ownership patterns.

```go
// Good pattern: Parent context controls child goroutines
func processWorkload(ctx context.Context, workload []Task) error {
    g, gCtx := errgroup.WithContext(ctx)
  
    for _, task := range workload {
        t := task // Capture loop variable correctly
        g.Go(func() error {
            return processTask(gCtx, t)
        })
    }
  
    // Wait for all tasks and collect errors
    return g.Wait()
}
```

The `errgroup` package provides a clean way to handle a group of goroutines with error propagation.

## Conclusion

Goroutines are a powerful feature that makes concurrent programming in Go both efficient and relatively straightforward, but they must be used with care. Following these best practices will help you avoid common pitfalls and build robust concurrent programs:

1. Always ensure proper goroutine termination
2. Use context for cancellation and timeouts
3. Avoid goroutine leaks with proper channel handling
4. Limit the number of concurrent goroutines
5. Handle panics in goroutines
6. Use structured concurrency patterns
7. Synchronize access to shared memory
8. Be careful with closures and variable capture

By adhering to these principles, you'll create Go programs that effectively utilize concurrency while maintaining reliability and resource efficiency. Remember that the goal isn't to create as many goroutines as possible, but to structure your program in a way that achieves the best balance of simplicity, performance, and resource utilization.
