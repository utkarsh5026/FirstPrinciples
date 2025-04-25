# Migration Strategies Toward Structured Concurrency in Go

I'll explain how to migrate from traditional concurrency patterns to structured concurrency in Go, starting from the most fundamental principles. This is an important evolution in how we manage concurrent code to make it safer and more maintainable.

## What is Concurrency?

Before diving into structured concurrency, let's understand what concurrency itself means. At its core, concurrency is about dealing with multiple things at once. However, this doesn't necessarily mean doing multiple things simultaneously (which would be parallelism), but rather managing multiple tasks that may overlap in time.

In computing terms, concurrency allows a program to make progress on multiple tasks without waiting for each one to complete before starting the next. This is particularly valuable when:

1. Tasks involve waiting (like network requests or file I/O)
2. You want to take advantage of multiple CPU cores
3. You need to handle multiple independent events

## Traditional Go Concurrency

Go's concurrency model is built around two core concepts: goroutines and channels.

### Goroutines

A goroutine is a lightweight thread managed by the Go runtime. Creating a goroutine is as simple as placing the `go` keyword before a function call:

```go
func main() {
    // Start a goroutine
    go sayHello()
  
    // Continue execution in the main goroutine
    fmt.Println("Main function continues...")
  
    // Wait to see the output from the goroutine
    time.Sleep(100 * time.Millisecond)
}

func sayHello() {
    fmt.Println("Hello from goroutine!")
}
```

In this example, the `sayHello` function runs concurrently with the main function. This is simple to write but has a fundamental issue: the `time.Sleep` is an arbitrary way to wait for the goroutine to complete.

### Channels

Channels provide a way for goroutines to communicate and synchronize:

```go
func main() {
    // Create a channel
    done := make(chan bool)
  
    // Start a goroutine
    go func() {
        fmt.Println("Working in goroutine...")
        // Signal that we're done
        done <- true
    }()
  
    // Wait for the goroutine to finish
    <-done
    fmt.Println("Main function continues after goroutine completes")
}
```

This is better than using `time.Sleep()` because we're explicitly waiting for the goroutine to signal completion. However, this pattern still has issues when dealing with multiple goroutines or error handling.

### WaitGroups

For multiple goroutines, we often use WaitGroups:

```go
func main() {
    var wg sync.WaitGroup
  
    // Launch 3 goroutines
    for i := 0; i < 3; i++ {
        wg.Add(1) // Increment the counter
      
        go func(id int) {
            defer wg.Done() // Decrement counter when goroutine completes
            fmt.Printf("Goroutine %d working...\n", id)
        }(i)
    }
  
    // Wait for all goroutines to complete
    wg.Wait()
    fmt.Println("All goroutines have completed")
}
```

This pattern works but requires careful management of the counter. Forgetting to call `wg.Done()` will cause your program to hang indefinitely.

## The Problem with Traditional Concurrency

The traditional patterns have several weaknesses:

1. **Unclear Lifetimes** : The lifetime of a goroutine is not tied to any lexical scope, making it hard to reason about when they start and finish.
2. **Error Propagation** : Errors that occur in goroutines are often lost unless you explicitly design a way to capture and report them.
3. **Resource Leaks** : If a goroutine is abandoned (e.g., due to early return), it might keep running indefinitely, leading to resource leaks.
4. **Complex Cancellation** : Implementing cancellation requires passing around context objects and checking them explicitly.

Let's look at an example of these issues:

```go
func fetchUserData(userIDs []int) ([]UserData, error) {
    results := make([]UserData, len(userIDs))
    var wg sync.WaitGroup
  
    for i, id := range userIDs {
        wg.Add(1)
        go func(i, id int) {
            defer wg.Done()
            // If this API call fails, the error is lost
            data, err := fetchAPI(id)
            if err == nil {
                results[i] = data
            }
            // What happens with the error?
        }(i, id)
    }
  
    wg.Wait()
    return results, nil // We're always returning nil for the error!
}
```

In this code, errors from the API calls are completely lost, and there's no easy way to propagate them to the caller.

## What is Structured Concurrency?

Structured concurrency is a paradigm that ties the lifetime of concurrent tasks to a lexical block of code. The core principles are:

1. **Lexical Scope** : Concurrent tasks must complete before their containing block finishes.
2. **Error Propagation** : Errors from concurrent tasks are propagated to the caller.
3. **Automatic Cancellation** : When one task fails or when leaving the scope, remaining tasks are automatically cancelled.
4. **Resource Management** : Resources are properly cleaned up when tasks complete.

## Implementing Structured Concurrency in Go

Go doesn't have built-in support for structured concurrency yet, but we can implement patterns that capture its essence. Let's explore these patterns, starting with the simplest approaches and evolving toward more structured solutions.

### Step 1: Using errgroup for Basic Structured Concurrency

The `golang.org/x/sync/errgroup` package provides a good starting point:

```go
import (
    "context"
    "fmt"
    "golang.org/x/sync/errgroup"
)

func fetchUserData(ctx context.Context, userIDs []int) ([]UserData, error) {
    // Create an errgroup with the parent context
    g, ctx := errgroup.WithContext(ctx)
  
    // Create a slice to hold results
    results := make([]UserData, len(userIDs))
  
    // Launch a goroutine for each userID
    for i, id := range userIDs {
        i, id := i, id // Create local variables to avoid closure issues
      
        g.Go(func() error {
            // Check if the context has been cancelled
            if ctx.Err() != nil {
                return ctx.Err()
            }
          
            data, err := fetchAPI(ctx, id)
            if err != nil {
                return fmt.Errorf("failed to fetch user %d: %w", id, err)
            }
          
            results[i] = data
            return nil
        })
    }
  
    // Wait for all goroutines to complete or for an error
    if err := g.Wait(); err != nil {
        return nil, err // Return the first error that occurred
    }
  
    return results, nil
}
```

This approach gives us several benefits:

* The first error encountered cancels the context, signaling other goroutines to stop.
* We properly propagate errors back to the caller.
* All goroutines are guaranteed to finish before `fetchUserData` returns.

### Step 2: Creating a Task Group Pattern

Let's create a more structured approach with a custom task group pattern:

```go
// TaskResult holds the result of a task along with any error
type TaskResult[T any] struct {
    Value T
    Err   error
    Index int
}

// TaskGroup manages a group of concurrent tasks
type TaskGroup[T any] struct {
    ctx     context.Context
    cancel  context.CancelFunc
    wg      sync.WaitGroup
    results []TaskResult[T]
    mu      sync.Mutex
}

// NewTaskGroup creates a new TaskGroup
func NewTaskGroup[T any](ctx context.Context, size int) *TaskGroup[T] {
    ctx, cancel := context.WithCancel(ctx)
    return &TaskGroup[T]{
        ctx:     ctx,
        cancel:  cancel,
        results: make([]TaskResult[T], size),
    }
}

// Go starts a new task
func (g *TaskGroup[T]) Go(index int, fn func(context.Context) (T, error)) {
    g.wg.Add(1)
  
    go func() {
        defer g.wg.Done()
      
        // Run the task with the context
        value, err := fn(g.ctx)
      
        // Store the result
        g.mu.Lock()
        g.results[index] = TaskResult[T]{Value: value, Err: err, Index: index}
        g.mu.Unlock()
      
        // If there was an error, cancel other tasks
        if err != nil {
            g.cancel()
        }
    }()
}

// Wait waits for all tasks to complete and returns all results
func (g *TaskGroup[T]) Wait() []TaskResult[T] {
    g.wg.Wait()
    g.cancel() // Ensure context is cancelled even on success
    return g.results
}
```

Now we can use this pattern for our user data fetching:

```go
func fetchUserData(ctx context.Context, userIDs []int) ([]UserData, error) {
    // Create a task group
    group := NewTaskGroup[UserData](ctx, len(userIDs))
  
    // Start tasks for each user ID
    for i, id := range userIDs {
        i, id := i, id // Local variables to avoid closure issues
      
        group.Go(i, func(ctx context.Context) (UserData, error) {
            return fetchAPI(ctx, id)
        })
    }
  
    // Wait for all tasks and collect results
    results := group.Wait()
  
    // Process results
    userData := make([]UserData, len(userIDs))
    for _, res := range results {
        if res.Err != nil {
            return nil, fmt.Errorf("failed to fetch user at index %d: %w", 
                res.Index, res.Err)
        }
        userData[res.Index] = res.Value
    }
  
    return userData, nil
}
```

This pattern gives us more control over how results are collected and errors are handled.

### Step 3: Moving Toward Go's Upcoming Features

Go 1.21 introduced the `Go` function in `x/sync/errgroup` which is a step toward better structured concurrency. In newer Go versions, we can expect more features that support structured concurrency patterns.

Here's how we might use a future Go with structured concurrency features (this is conceptual):

```go
// This is conceptual code based on potential future Go features
func fetchUserData(ctx context.Context, userIDs []int) ([]UserData, error) {
    results := make([]UserData, len(userIDs))
  
    // Using a hypothetical structured concurrency API
    return go.WithGroup(ctx, func(group *go.Group) error {
        for i, id := range userIDs {
            i, id := i, id
          
            group.Go(func(ctx context.Context) error {
                data, err := fetchAPI(ctx, id)
                if err != nil {
                    return err
                }
                results[i] = data
                return nil
            })
        }
        return nil
    }).Then(func() ([]UserData, error) {
        return results, nil
    })
}
```

## Practical Migration Strategies

Now that we understand the concepts, let's discuss practical strategies for migrating existing Go code to structured concurrency patterns:

### Strategy 1: Identify Concurrency Boundaries

The first step is to identify where concurrency happens in your codebase:

1. Look for `go` keywords launching goroutines
2. Identify WaitGroup usage
3. Find channel-based synchronization patterns

For example, if you find code like this:

```go
func processItems(items []Item) {
    var wg sync.WaitGroup
    for _, item := range items {
        wg.Add(1)
        go func(item Item) {
            defer wg.Done()
            processItem(item)
        }(item)
    }
    wg.Wait()
}
```

This is a candidate for migration to structured concurrency.

### Strategy 2: Introduce Context for Cancellation

Add context parameters to functions that involve concurrency:

```go
func processItems(ctx context.Context, items []Item) {
    var wg sync.WaitGroup
    for _, item := range items {
        wg.Add(1)
        go func(item Item) {
            defer wg.Done()
            select {
            case <-ctx.Done():
                return
            default:
                processItem(ctx, item)
            }
        }(item)
    }
    wg.Wait()
}
```

### Strategy 3: Replace WaitGroups with errgroup

Replace traditional WaitGroups with errgroup for better error handling:

```go
func processItems(ctx context.Context, items []Item) error {
    g, ctx := errgroup.WithContext(ctx)
  
    for _, item := range items {
        item := item // Create local variable 
        g.Go(func() error {
            return processItem(ctx, item)
        })
    }
  
    return g.Wait()
}
```

### Strategy 4: Introduce Result Collection

Add structured result collection:

```go
func processItems(ctx context.Context, items []Item) ([]Result, error) {
    g, ctx := errgroup.WithContext(ctx)
    results := make([]Result, len(items))
  
    for i, item := range items {
        i, item := i, item
        g.Go(func() error {
            result, err := processItem(ctx, item)
            if err != nil {
                return err
            }
            results[i] = result
            return nil
        })
    }
  
    if err := g.Wait(); err != nil {
        return nil, err
    }
  
    return results, nil
}
```

### Strategy 5: Create Bounded Concurrency

Add bounded concurrency to limit resource usage:

```go
func processItems(ctx context.Context, items []Item, concurrency int) ([]Result, error) {
    g, ctx := errgroup.WithContext(ctx)
    g.SetLimit(concurrency) // Set maximum number of concurrent goroutines
  
    results := make([]Result, len(items))
  
    for i, item := range items {
        i, item := i, item
        g.Go(func() error {
            result, err := processItem(ctx, item)
            if err != nil {
                return err
            }
            results[i] = result
            return nil
        })
    }
  
    if err := g.Wait(); err != nil {
        return nil, err
    }
  
    return results, nil
}
```

### Strategy 6: Create Higher-Level Abstractions

As you migrate more code, create higher-level abstractions that encapsulate structured concurrency patterns:

```go
// ConcurrentMapper applies a function concurrently to each item in a slice
func ConcurrentMapper[T any, R any](
    ctx context.Context, 
    items []T, 
    concurrency int,
    fn func(context.Context, T) (R, error),
) ([]R, error) {
    g, ctx := errgroup.WithContext(ctx)
    if concurrency > 0 {
        g.SetLimit(concurrency)
    }
  
    results := make([]R, len(items))
  
    for i, item := range items {
        i, item := i, item
        g.Go(func() error {
            result, err := fn(ctx, item)
            if err != nil {
                return err
            }
            results[i] = result
            return nil
        })
    }
  
    if err := g.Wait(); err != nil {
        return nil, err
    }
  
    return results, nil
}
```

This can then be used like:

```go
func processItems(ctx context.Context, items []Item, concurrency int) ([]Result, error) {
    return ConcurrentMapper(ctx, items, concurrency, processItem)
}
```

## Real-World Examples

Let's look at a more complete example of migrating traditional Go concurrency to structured concurrency in a web scraper:

### Before: Traditional Concurrency

```go
func scrapeWebsites(urls []string) []ScrapingResult {
    var wg sync.WaitGroup
    results := make([]ScrapingResult, len(urls))
  
    for i, url := range urls {
        wg.Add(1)
        go func(i int, url string) {
            defer wg.Done()
          
            client := &http.Client{Timeout: 10 * time.Second}
            resp, err := client.Get(url)
          
            if err != nil {
                results[i] = ScrapingResult{URL: url, Error: err.Error()}
                return
            }
            defer resp.Body.Close()
          
            body, err := ioutil.ReadAll(resp.Body)
            if err != nil {
                results[i] = ScrapingResult{URL: url, Error: err.Error()}
                return
            }
          
            // Process the body
            title := extractTitle(body)
            results[i] = ScrapingResult{
                URL:   url,
                Title: title,
                Size:  len(body),
            }
        }(i, url)
    }
  
    wg.Wait()
    return results
}
```

Problems with this code:

* No way to cancel in-progress requests if one fails
* If the function needs to return early, goroutines continue running
* No proper error handling or propagation

### After: Structured Concurrency

```go
func scrapeWebsites(ctx context.Context, urls []string) ([]ScrapingResult, error) {
    // Create a new errgroup with a derived context
    g, ctx := errgroup.WithContext(ctx)
  
    // Limit concurrency to avoid overwhelming servers
    g.SetLimit(10)
  
    // Create a channel to collect results
    resultsChan := make(chan ScrapingResult, len(urls))
  
    // Launch a goroutine for each URL
    for _, url := range urls {
        url := url // Create a local copy for the closure
      
        g.Go(func() error {
            // Create a new client with the context
            client := &http.Client{Timeout: 10 * time.Second}
            req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
            if err != nil {
                return fmt.Errorf("failed to create request for %s: %w", url, err)
            }
          
            resp, err := client.Do(req)
            if err != nil {
                resultsChan <- ScrapingResult{URL: url, Error: err.Error()}
                return nil // Don't propagate this error, it's captured in the result
            }
            defer resp.Body.Close()
          
            body, err := io.ReadAll(resp.Body)
            if err != nil {
                resultsChan <- ScrapingResult{URL: url, Error: err.Error()}
                return nil
            }
          
            // Process the body
            title := extractTitle(body)
            resultsChan <- ScrapingResult{
                URL:   url,
                Title: title,
                Size:  len(body),
            }
          
            return nil
        })
    }
  
    // Wait for all goroutines in a separate goroutine
    go func() {
        g.Wait()
        close(resultsChan)
    }()
  
    // Collect results
    var results []ScrapingResult
    for result := range resultsChan {
        results = append(results, result)
    }
  
    // Check if there was a context error
    if ctx.Err() != nil {
        return results, ctx.Err()
    }
  
    return results, nil
}
```

Improvements:

* Context-aware: The function respects cancellation signals.
* Limited concurrency: We don't overwhelm servers.
* Proper resource cleanup: HTTP requests get cancelled if context is cancelled.
* Error handling: Errors are properly captured and reported.

## Common Pitfalls During Migration

As you migrate to structured concurrency, watch out for these common pitfalls:

### 1. Context Propagation

Make sure to pass the context derived from the errgroup to all function calls:

```go
// Incorrect
g.Go(func() error {
    // Using the original context, not the derived one
    return processItem(originalCtx, item)
})

// Correct
g.Go(func() error {
    // Using the context derived from errgroup
    return processItem(ctx, item)
})
```

### 2. Goroutine Leaks

Ensure all goroutines eventually terminate:

```go
// Incorrect - potential leak
go func() {
    for {
        select {
        case data <- ch:
            processData(data)
            // Missing context check!
        }
    }
}()

// Correct
go func() {
    for {
        select {
        case data <- ch:
            processData(data)
        case <-ctx.Done():
            return
        }
    }
}()
```

### 3. Error Handling in errgroup

Remember that errgroup only returns the first error encountered. If you need all errors, collect them separately:

```go
type result struct {
    data interface{}
    err  error
    idx  int
}

func processAll(ctx context.Context, items []Item) ([]Result, []error) {
    g, ctx := errgroup.WithContext(ctx)
    results := make([]Result, len(items))
    errChan := make(chan error, len(items))
  
    for i, item := range items {
        i, item := i, item
        g.Go(func() error {
            result, err := processItem(ctx, item)
            if err != nil {
                errChan <- fmt.Errorf("item %d: %w", i, err)
                return nil // Don't propagate through errgroup
            }
            results[i] = result
            return nil
        })
    }
  
    g.Wait()
    close(errChan)
  
    var errors []error
    for err := range errChan {
        errors = append(errors, err)
    }
  
    return results, errors
}
```

### 4. Forgetting Local Variables in Loops

Always create local variables for loop variables used in closures:

```go
// Incorrect - all goroutines will see the last value of i and item
for i, item := range items {
    g.Go(func() error {
        return processItem(ctx, item, i)
    })
}

// Correct - each goroutine gets its own copy
for i, item := range items {
    i, item := i, item // Create local variables
    g.Go(func() error {
        return processItem(ctx, item, i)
    })
}
```

## Looking Ahead: Go's Future with Structured Concurrency

The Go team has expressed interest in improving structured concurrency support. Future versions of Go might include:

1. First-class structured concurrency constructs
2. Better tools for managing goroutine lifetimes
3. Improved error handling in concurrent code
4. More sophisticated cancellation mechanisms

As these features are developed, the migration strategies discussed here will help you prepare your codebase for these improvements.

## Conclusion

Migrating to structured concurrency in Go offers significant benefits:

1. **Better Error Handling** : Errors from concurrent tasks are properly propagated.
2. **Cleaner Resource Management** : Resources are automatically cleaned up.
3. **Improved Code Structure** : Concurrent tasks are tied to lexical scope.
4. **Safer Cancellation** : Tasks are automatically cancelled when needed.

The migration process is incremental:

1. Identify concurrency boundaries
2. Introduce context for cancellation
3. Replace WaitGroups with errgroup
4. Add structured result collection
5. Implement bounded concurrency
6. Create higher-level abstractions

By following these strategies, you can make your Go code more maintainable, safer, and better aligned with the future direction of concurrency in Go.
