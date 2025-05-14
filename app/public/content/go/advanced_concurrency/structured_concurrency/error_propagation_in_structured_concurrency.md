# Error Propagation in Structured Concurrency in Go

I'll explain Go's error propagation in structured concurrency from first principles, using clear examples to illustrate the concepts step by step.

## First Principles: Understanding Errors in Go

At its core, Go has a simple but powerful approach to error handling. Unlike languages that use exceptions, Go treats errors as values that functions can return. This approach stems from Go's design philosophy of explicitness and simplicity.

### The Basic Error Interface

In Go, an error is any type that implements the built-in `error` interface:

```go
type error interface {
    Error() string
}
```

This interface requires only a single method: `Error()`, which returns a string describing the error. This simplicity is intentional and powerful - any type that can describe itself as a string can be an error in Go.

Let's create a simple custom error to understand this better:

```go
type DivisionError struct {
    dividend int
    divisor  int
}

func (e *DivisionError) Error() string {
    return fmt.Sprintf("cannot divide %d by %d", e.dividend, e.divisor)
}

func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, &DivisionError{a, b}
    }
    return a / b, nil
}
```

In this example, I've created a custom `DivisionError` type that implements the `error` interface. The `divide` function returns this error when attempting to divide by zero.

## Error Propagation: The Fundamental Pattern

Error propagation in Go follows a common pattern: when a function encounters an error, it typically returns that error to its caller. This creates a chain of responsibility where errors bubble up through the call stack until they reach a point where they can be handled appropriately.

Here's a basic example of error propagation:

```go
func readConfig() (Config, error) {
    data, err := readFile("config.json")
    if err != nil {
        return Config{}, err  // Propagate the error upward
    }
  
    var config Config
    err = json.Unmarshal(data, &config)
    if err != nil {
        return Config{}, err  // Propagate the error upward
    }
  
    return config, nil
}
```

In this example, if either `readFile` or `json.Unmarshal` returns an error, `readConfig` immediately returns that error to its caller. This pattern is so common in Go that it's often called "early return" or the "if err != nil" pattern.

## Structured Concurrency in Go

Now, let's understand what structured concurrency means. At its core, structured concurrency ensures that:

1. The lifetime of a concurrent task is bound to a scope in the code
2. When the scope exits, all concurrent tasks launched within it are guaranteed to be completed
3. Errors from concurrent tasks are properly propagated and handled

Go's concurrency is built around goroutines (lightweight threads) and channels (communication pipes between goroutines). The standard library provides primitives like `sync.WaitGroup` for synchronization, but these don't handle error propagation directly.

Let's build our understanding of error propagation in concurrent Go code.

### Basic Concurrency without Proper Error Handling

First, let's look at a naive approach that doesn't handle errors well:

```go
func processItems(items []string) {
    var wg sync.WaitGroup
  
    for _, item := range items {
        wg.Add(1)
        go func(item string) {
            defer wg.Done()
            err := processItem(item)
            if err != nil {
                fmt.Println("Error:", err)  // Error is lost!
            }
        }(item)
    }
  
    wg.Wait()
}
```

The problem here is that errors occurring in goroutines are simply printed and then lost. The main function has no way to know if any errors occurred.

## Error Propagation in Concurrent Code

To properly propagate errors from goroutines, we need a mechanism to collect and return them. Here are several approaches, starting from basic to more sophisticated:

### Using Channels for Error Collection

```go
func processItems(items []string) error {
    errChan := make(chan error, len(items))  // Buffered channel to avoid goroutine leaks
  
    var wg sync.WaitGroup
    for _, item := range items {
        wg.Add(1)
        go func(item string) {
            defer wg.Done()
            err := processItem(item)
            if err != nil {
                errChan <- err
            }
        }(item)
    }
  
    // Wait for all goroutines to finish
    wg.Wait()
    close(errChan)
  
    // Check if any errors occurred
    for err := range errChan {
        return err  // Return the first error encountered
    }
  
    return nil
}
```

In this example, I've created a buffered channel `errChan` to collect errors from goroutines. After all goroutines complete, I check if any errors were sent to the channel and return the first one found.

However, this approach has limitations:

* It only returns the first error encountered
* It doesn't associate errors with the specific tasks that generated them
* It doesn't cancel other goroutines when an error occurs

### Using Context for Cancellation

Let's improve our error handling by using context for cancellation:

```go
func processItems(ctx context.Context, items []string) error {
    ctx, cancel := context.WithCancel(ctx)
    defer cancel()  // Ensure resources are cleaned up
  
    errChan := make(chan error, len(items))
  
    var wg sync.WaitGroup
    for _, item := range items {
        wg.Add(1)
        go func(item string) {
            defer wg.Done()
          
            // Check if context is canceled before processing
            select {
            case <-ctx.Done():
                return
            default:
                err := processItem(ctx, item)
                if err != nil {
                    errChan <- err
                    cancel()  // Cancel other goroutines
                }
            }
        }(item)
    }
  
    go func() {
        wg.Wait()
        close(errChan)
    }()
  
    // Return the first error
    for err := range errChan {
        return err
    }
  
    return ctx.Err()  // Return context error if any
}
```

This approach uses a context to cancel other goroutines when one fails. It's better than our first example, but still only returns the first error.

## Modern Structured Concurrency in Go

Go 1.18 introduced the `golang.org/x/sync/errgroup` package, which provides structured concurrency with error handling. This package is now considered the standard way to handle concurrent error propagation.

Let's see how to use `errgroup`:

```go
import "golang.org/x/sync/errgroup"

func processItems(ctx context.Context, items []string) error {
    g, ctx := errgroup.WithContext(ctx)
  
    for _, item := range items {
        item := item  // Create a new variable for the closure
        g.Go(func() error {
            return processItem(ctx, item)
        })
    }
  
    // Wait for all goroutines to complete and return the first error
    return g.Wait()
}
```

The `errgroup` package handles several concerns for us:

1. It manages the goroutines and waits for them to complete
2. It cancels the context when any goroutine returns an error
3. It returns the first non-nil error from any goroutine

### Collecting All Errors

Sometimes we want to collect all errors, not just the first one. We can modify our approach:

```go
func processItems(ctx context.Context, items []string) []error {
    var mu sync.Mutex
    var errors []error
  
    g, ctx := errgroup.WithContext(ctx)
  
    for _, item := range items {
        item := item
        g.Go(func() error {
            err := processItem(ctx, item)
            if err != nil {
                mu.Lock()
                errors = append(errors, err)
                mu.Unlock()
            }
            return nil  // Don't cancel other goroutines
        })
    }
  
    g.Wait()
    return errors
}
```

This approach collects all errors but doesn't cancel other goroutines when one fails.

## Advanced Error Handling with Semantic Context

In real applications, we often want to include more context with our errors. Go 1.13 introduced error wrapping with `fmt.Errorf` and the `%w` verb:

```go
func processItem(ctx context.Context, item string) error {
    result, err := fetchData(ctx, item)
    if err != nil {
        return fmt.Errorf("fetching data for %s: %w", item, err)
    }
  
    err = processResult(ctx, result)
    if err != nil {
        return fmt.Errorf("processing result for %s: %w", item, err)
    }
  
    return nil
}
```

This wrapping preserves the original error while adding context. The caller can use `errors.Is()` or `errors.As()` to check the error type or unwrap it.

Let's combine this with our concurrent error collection:

```go
func processItems(ctx context.Context, items []string) []error {
    var mu sync.Mutex
    var errors []error
  
    g, ctx := errgroup.WithContext(ctx)
  
    for i, item := range items {
        i, item := i, item
        g.Go(func() error {
            err := processItem(ctx, item)
            if err != nil {
                mu.Lock()
                errors = append(errors, fmt.Errorf("item %d (%s): %w", i, item, err))
                mu.Unlock()
            }
            return nil
        })
    }
  
    g.Wait()
    return errors
}
```

## Go 1.20+ Error Joining

Go 1.20 introduced `errors.Join`, which allows combining multiple errors into a single error value:

```go
func processItems(ctx context.Context, items []string) error {
    var mu sync.Mutex
    var errs []error
  
    g, ctx := errgroup.WithContext(ctx)
  
    for i, item := range items {
        i, item := i, item
        g.Go(func() error {
            err := processItem(ctx, item)
            if err != nil {
                mu.Lock()
                errs = append(errs, fmt.Errorf("processing item %d (%s): %w", i, item, err))
                mu.Unlock()
            }
            return nil
        })
    }
  
    g.Wait()
  
    if len(errs) > 0 {
        return errors.Join(errs...)
    }
    return nil
}
```

This function returns a single error that combines all individual errors. The caller can use `errors.Is()` or `errors.As()` to check if a specific error is in the joined error.

## Practical Example: Parallel File Processing

Let's put everything together in a practical example that processes multiple files concurrently:

```go
func processFiles(ctx context.Context, filePaths []string) error {
    // Create an error group with a derived context
    g, ctx := errgroup.WithContext(ctx)
  
    // Process each file concurrently
    for i, path := range filePaths {
        i, path := i, path // Create new variables for the closure
      
        g.Go(func() error {
            // Check if context is canceled before starting work
            select {
            case <-ctx.Done():
                return ctx.Err()
            default:
            }
          
            // Open the file
            file, err := os.Open(path)
            if err != nil {
                return fmt.Errorf("opening file %s: %w", path, err)
            }
            defer file.Close()
          
            // Process the file content
            data, err := io.ReadAll(file)
            if err != nil {
                return fmt.Errorf("reading file %s: %w", path, err)
            }
          
            // Do something with the data
            err = processData(ctx, data)
            if err != nil {
                return fmt.Errorf("processing data from file %s: %w", path, err)
            }
          
            return nil
        })
    }
  
    // Wait for all goroutines to complete or for an error to occur
    if err := g.Wait(); err != nil {
        return fmt.Errorf("error processing files: %w", err)
    }
  
    return nil
}
```

In this example, I'm using `errgroup` to manage goroutines and propagate errors. The first goroutine to return an error will cause the context to be canceled, which other goroutines can detect and terminate early.

## Best Practices for Error Propagation in Concurrent Go

Based on what we've covered, here are some best practices:

1. **Use `errgroup` for structured concurrency** : It handles goroutine management and error propagation elegantly.
2. **Add context to errors** : Wrap errors with context using `fmt.Errorf` and `%w` to maintain the error chain.
3. **Consider cancellation** : Use context cancellation to stop other goroutines when one fails.
4. **Decide between first-error and all-errors** : Choose whether to stop at the first error or collect all errors based on your application's needs.
5. **Handle resource cleanup** : Use `defer` statements to ensure resources are properly closed, even when errors occur.
6. **Limit concurrency when appropriate** : Consider using a semaphore or worker pool to limit the number of concurrent goroutines if needed.

Example of limiting concurrency:

```go
func processItemsWithLimit(ctx context.Context, items []string, concurrencyLimit int) error {
    g, ctx := errgroup.WithContext(ctx)
    g.SetLimit(concurrencyLimit)  // Available in newer versions of errgroup
  
    for _, item := range items {
        item := item
        g.Go(func() error {
            return processItem(ctx, item)
        })
    }
  
    return g.Wait()
}
```

## Conclusion

Error propagation in Go's structured concurrency is about ensuring that errors from concurrent tasks are properly propagated up the call stack, while also managing the lifecycle of goroutines.

The journey from basic error handling to structured concurrency with error propagation involves:

1. Understanding Go's error handling philosophy and the error interface
2. Learning how to propagate errors up the call stack
3. Using channels and synchronization primitives for basic concurrent error handling
4. Leveraging context for cancellation
5. Adopting structured concurrency with the errgroup package
6. Adding semantic context to errors with wrapping
7. Collecting and joining multiple errors when needed

By following these principles and best practices, you can write Go code that handles errors in concurrent environments correctly and elegantly, making your applications more robust and maintainable.
