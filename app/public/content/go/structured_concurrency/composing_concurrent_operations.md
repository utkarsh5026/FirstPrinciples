# Composing Concurrent Operations in Go

Let me explain concurrent operations in Go from first principles, building our understanding step by step with practical examples.

## 1. Understanding Concurrency: The Foundation

Concurrency is about dealing with multiple things at once. It's different from parallelism, which is about *doing* multiple things at once.

Think of concurrency like this: If you're cooking dinner, you might start boiling water for pasta, then chop vegetables while the water heats up, then prepare a sauce while the pasta cooks. You're not doing all these things simultaneously (that would be parallelism), but you're managing multiple tasks that overlap in time.

In computing, concurrency models how we structure a program to handle multiple tasks that may start, run, and complete in overlapping time periods.

## 2. Go's Concurrency Model: Goroutines and Channels

Go's concurrency is built on two fundamental concepts:

### Goroutines

A goroutine is a lightweight thread managed by the Go runtime. Starting a goroutine is as simple as putting the keyword `go` before a function call:

```go
func sayHello() {
    fmt.Println("Hello, concurrency!")
}

func main() {
    // Start a new goroutine
    go sayHello()
  
    // Main continues executing
    fmt.Println("Main function continues...")
  
    // Give the goroutine time to finish
    time.Sleep(100 * time.Millisecond)
}
```

In this example, `sayHello()` runs concurrently with the rest of `main()`. Without the `time.Sleep()`, main might finish before `sayHello()` has a chance to execute, as the program exits when main returns.

### Channels

Channels are the pipes that connect goroutines, allowing them to communicate and synchronize:

```go
func main() {
    // Create a channel
    messages := make(chan string)
  
    // Start a goroutine that sends a message
    go func() {
        messages <- "Hello from another goroutine"
    }()
  
    // Receive the message (this blocks until a message is received)
    msg := <-messages
    fmt.Println(msg)
}
```

This is much more elegant than using `time.Sleep()` - the main goroutine will wait until it receives a message from the channel.

## 3. Composition Patterns: Combining Concurrent Operations

Let's explore how to compose concurrent operations in Go with increasingly sophisticated patterns.

### Pattern 1: Waiting for Multiple Goroutines with WaitGroups

When you need to launch multiple goroutines and wait for all of them to complete, `sync.WaitGroup` is your friend:

```go
func main() {
    var wg sync.WaitGroup
  
    // Launch 5 worker goroutines
    for i := 1; i <= 5; i++ {
        // Increment the WaitGroup counter
        wg.Add(1)
      
        // Launch a worker
        go func(id int) {
            // Ensure we tell the WaitGroup we're done at the end
            defer wg.Done()
          
            // Simulate work
            fmt.Printf("Worker %d starting\n", id)
            time.Sleep(time.Duration(rand.Intn(1000)) * time.Millisecond)
            fmt.Printf("Worker %d done\n", id)
        }(i)
    }
  
    // Wait for all goroutines to finish
    wg.Wait()
    fmt.Println("All workers completed")
}
```

In this pattern:

1. We create a `WaitGroup`
2. For each goroutine, we call `wg.Add(1)` before starting it
3. Each goroutine calls `wg.Done()` when it completes
4. The main goroutine calls `wg.Wait()` to block until all workers are done

### Pattern 2: Fan-Out, Fan-In with Channels

A common pattern is "fan-out, fan-in" where you distribute work across multiple goroutines and then collect their results:

```go
func main() {
    jobs := make(chan int, 100)     // Channel for distributing work
    results := make(chan int, 100)  // Channel for collecting results
  
    // Fan out: Start 3 worker goroutines
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }
  
    // Send 5 jobs
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)  // Close jobs channel to signal no more work
  
    // Fan in: Collect all results
    for a := 1; a <= 5; a++ {
        result := <-results
        fmt.Println("Result:", result)
    }
}

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d processing job %d\n", id, j)
        time.Sleep(time.Duration(rand.Intn(500)) * time.Millisecond)
        results <- j * 2  // Send result back
    }
}
```

This pattern:

1. Creates channels for jobs and results
2. Launches multiple worker goroutines that read from jobs and write to results
3. Sends work through the jobs channel
4. Collects results from the results channel

Notice how we're composing concurrent operations by connecting goroutines with channels.

### Pattern 3: Timeouts and Cancellation with Context

Managing long-running operations often requires adding timeout or cancellation capabilities:

```go
func main() {
    // Create a context with a 2-second timeout
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel() // Ensure resources are cleaned up
  
    // Create a channel to receive the operation result
    resultCh := make(chan string, 1)
  
    // Start the operation in a goroutine
    go func() {
        // Simulate a time-consuming operation
        time.Sleep(3 * time.Second)
        resultCh <- "Operation completed"
    }()
  
    // Wait for the operation or timeout
    select {
    case result := <-resultCh:
        fmt.Println(result)
    case <-ctx.Done():
        fmt.Println("Operation timed out:", ctx.Err())
    }
}
```

This example:

1. Creates a context with a timeout
2. Launches a goroutine to perform work
3. Uses a `select` statement to wait for either the result or the timeout
4. Properly handles the timeout case

Running this will print "Operation timed out: context deadline exceeded" because our operation takes 3 seconds but we only wait for 2.

### Pattern 4: Combining Multiple Channel Operations with Select

The `select` statement is Go's way of letting you wait on multiple channel operations:

```go
func main() {
    ch1 := make(chan string)
    ch2 := make(chan string)
  
    // Send on ch1 after 1 second
    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- "Message from channel 1"
    }()
  
    // Send on ch2 after 2 seconds
    go func() {
        time.Sleep(2 * time.Second)
        ch2 <- "Message from channel 2"
    }()
  
    // Wait for messages from both channels
    for i := 0; i < 2; i++ {
        select {
        case msg1 := <-ch1:
            fmt.Println(msg1)
        case msg2 := <-ch2:
            fmt.Println(msg2)
        }
    }
}
```

This code:

1. Creates two channels
2. Launches goroutines to send messages on each channel after different delays
3. Uses a `select` statement to wait for messages from either channel
4. Whichever channel is ready first will have its case executed

This pattern allows you to compose concurrent operations that might complete in any order.

## 4. Advanced Composition: Error Handling

Error handling in concurrent Go code requires careful consideration:

```go
func main() {
    // Create channels for results and errors
    results := make(chan int)
    errors := make(chan error)
  
    // Launch a worker that might return an error
    go func() {
        // Simulate work that might fail
        if rand.Intn(2) == 0 {
            results <- 42  // Success
        } else {
            errors <- fmt.Errorf("something went wrong")  // Failure
        }
    }()
  
    // Wait for either a result or an error
    select {
    case result := <-results:
        fmt.Println("Success:", result)
    case err := <-errors:
        fmt.Println("Error:", err)
    }
}
```

This pattern uses separate channels for results and errors, allowing clear separation of the success and failure paths.

## 5. Pipeline Pattern: Chaining Concurrent Operations

Pipelines are a powerful way to compose concurrent operations, with each stage taking input from the previous stage:

```go
func main() {
    // Source: generate numbers
    source := func() <-chan int {
        out := make(chan int)
        go func() {
            defer close(out)
            for i := 1; i <= 5; i++ {
                out <- i
            }
        }()
        return out
    }
  
    // Stage 1: square the numbers
    square := func(in <-chan int) <-chan int {
        out := make(chan int)
        go func() {
            defer close(out)
            for n := range in {
                out <- n * n
            }
        }()
        return out
    }
  
    // Stage 2: filter out odd numbers
    filter := func(in <-chan int) <-chan int {
        out := make(chan int)
        go func() {
            defer close(out)
            for n := range in {
                if n%2 == 0 {  // Only send even numbers
                    out <- n
                }
            }
        }()
        return out
    }
  
    // Connect the pipeline
    numbers := source()
    squares := square(numbers)
    evens := filter(squares)
  
    // Consume the output
    for n := range evens {
        fmt.Println(n)  // Will print 4, 16
    }
}
```

This pipeline:

1. Generates numbers 1 through 5
2. Squares each number
3. Filters out odd numbers
4. Prints the remaining values (4 and 16)

Each stage is its own concurrent operation, processing data as it becomes available.

## 6. Throttling and Rate Limiting

Sometimes you need to limit how many operations run concurrently:

```go
func main() {
    // Create a buffered channel as a semaphore
    const maxConcurrent = 3
    semaphore := make(chan struct{}, maxConcurrent)
  
    // Create a wait group to wait for all work to finish
    var wg sync.WaitGroup
  
    // Launch 10 tasks but only 3 will run at a time
    for i := 1; i <= 10; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
          
            // Acquire a token from the semaphore
            semaphore <- struct{}{}
            fmt.Printf("Task %d starting\n", id)
          
            // Simulate work
            time.Sleep(time.Duration(rand.Intn(1000)) * time.Millisecond)
          
            fmt.Printf("Task %d completed\n", id)
            // Release the token
            <-semaphore
        }(i)
    }
  
    wg.Wait()
    fmt.Println("All tasks completed")
}
```

This pattern:

1. Creates a buffered channel with capacity equal to max concurrent operations
2. Each goroutine tries to send to this channel before starting work (blocking if at capacity)
3. After completing work, the goroutine receives from the channel, allowing another goroutine to proceed
4. This effectively limits concurrency to the channel's capacity

## 7. Worker Pools: Reusing Goroutines

For efficient handling of many small tasks, worker pools allow you to reuse goroutines:

```go
func main() {
    const numWorkers = 3
    jobs := make(chan int, 10)
    results := make(chan int, 10)
  
    // Start worker pool
    for w := 1; w <= numWorkers; w++ {
        go worker(w, jobs, results)
    }
  
    // Send jobs
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)
  
    // Collect results
    for a := 1; a <= 9; a++ {
        <-results
    }
}

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d started job %d\n", id, j)
        time.Sleep(time.Duration(rand.Intn(500)) * time.Millisecond)
        fmt.Printf("Worker %d finished job %d\n", id, j)
        results <- j
    }
}
```

Worker pools efficiently manage a large number of tasks with a fixed number of goroutines, providing better resource utilization.

## 8. Practical Application: Building a Concurrent Web Crawler

Let's put these concepts together in a practical example - a simple concurrent web crawler:

```go
func main() {
    // URLs to crawl
    urls := []string{
        "https://golang.org",
        "https://google.com",
        "https://github.com",
        "https://stackoverflow.com",
        "https://medium.com",
    }
  
    // Create channels
    results := make(chan string)
    var wg sync.WaitGroup
  
    // Set a limit on concurrent requests
    semaphore := make(chan struct{}, 2)
  
    // Launch crawler for each URL
    for _, url := range urls {
        wg.Add(1)
        go func(url string) {
            defer wg.Done()
          
            // Limit concurrency
            semaphore <- struct{}{}
            defer func() { <-semaphore }()
          
            // Perform the request with timeout
            ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
            defer cancel()
          
            req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
            resp, err := http.DefaultClient.Do(req)
          
            if err != nil {
                results <- fmt.Sprintf("Error fetching %s: %v", url, err)
                return
            }
            defer resp.Body.Close()
          
            // Read the first 100 bytes of the body
            body := make([]byte, 100)
            _, err = resp.Body.Read(body)
          
            results <- fmt.Sprintf("Fetched %s: status %d", url, resp.StatusCode)
        }(url)
    }
  
    // Close the results channel when all workers are done
    go func() {
        wg.Wait()
        close(results)
    }()
  
    // Collect and print results
    for result := range results {
        fmt.Println(result)
    }
}
```

This crawler:

1. Creates a semaphore to limit concurrent requests
2. Uses contexts for timeouts
3. Launches a goroutine for each URL
4. Collects results through a channel
5. Uses a WaitGroup to know when all requests are done

It integrates multiple concurrent patterns we've explored.

## 9. Best Practices for Composing Concurrent Operations

When composing concurrent operations in Go, follow these principles:

1. **Keep It Simple** : Start with the simplest approach that works. Add complexity only when needed.
2. **Always Close Channels** : The producer should close channels when no more values will be sent.
3. **Prevent Goroutine Leaks** : Ensure every goroutine has a way to exit. Use contexts for cancellation.
4. **Handle Errors Properly** : Propagate errors through channels or return them in aggregated results.
5. **Use Select with Default** : When appropriate, include a default case in select statements to make them non-blocking.

```go
   select {
   case msg := <-messageCh:
       fmt.Println("Received:", msg)
   default:
       fmt.Println("No message available")
   }
```

1. **Consider Buffered Channels** : Use them to decouple producers and consumers when appropriate.
2. **Avoid Sharing Memory** : Follow Go's philosophy: "Don't communicate by sharing memory; share memory by communicating."

## 10. Common Pitfalls and How to Avoid Them

### Race Conditions

When multiple goroutines access the same data and at least one modifies it:

```go
// BAD: Race condition
counter := 0
var wg sync.WaitGroup

for i := 0; i < 1000; i++ {
    wg.Add(1)
    go func() {
        defer wg.Done()
        counter++ // Race condition here!
    }()
}

wg.Wait()
fmt.Println("Counter:", counter) // Result is unpredictable
```

Solution: Use a mutex to protect shared data:

```go
// GOOD: Using mutex
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
fmt.Println("Counter:", counter) // Reliable result: 1000
```

### Goroutine Leaks

Goroutines that never terminate waste resources:

```go
// BAD: Goroutine leak
func main() {
    ch := make(chan int)
  
    go func() {
        val := <-ch
        fmt.Println("Received:", val)
    }()
  
    // If we never send to ch, the goroutine is stuck forever
    fmt.Println("Done!")
}
```

Solution: Use contexts for cancellation or ensure channels are properly closed:

```go
// GOOD: Using context for cancellation
func main() {
    ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
    defer cancel()
  
    ch := make(chan int)
  
    go func() {
        select {
        case val := <-ch:
            fmt.Println("Received:", val)
        case <-ctx.Done():
            fmt.Println("Operation cancelled:", ctx.Err())
            return
        }
    }()
  
    fmt.Println("Done!")
    // Even if we never send to ch, the goroutine will exit after 1 second
}
```

## Conclusion

Concurrent programming in Go is built on goroutines and channels. By composing these primitives using the patterns we've explored, you can build sophisticated concurrent systems that are both efficient and maintainable.

The key to mastering concurrent Go is understanding these patterns and knowing which one to apply in each situation. Practice with simple examples first, then gradually incorporate these patterns into more complex systems.

Remember that concurrency adds complexity, so always start with the simplest solution and add concurrency only when it provides clear benefits. With these principles and patterns, you'll be well-equipped to tackle concurrent programming challenges in Go.
