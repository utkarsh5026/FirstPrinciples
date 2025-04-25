# Go Context Propagation: Best Practices from First Principles

Context propagation in Go is a fundamental pattern for managing request lifecycles, cancellation signals, and request-scoped values. I'll explain this concept thoroughly from first principles, focusing on why context exists, how it works, and best practices for using it effectively.

## Understanding Context from First Principles

### What is Context?

At its core, a context in Go represents the scope of a program execution - like a request in a web server or a processing job. The context package provides a way to carry deadlines, cancellation signals, and request-scoped values across API boundaries and between processes.

The `context.Context` type is an interface that defines four methods:

```go
type Context interface {
    Deadline() (deadline time.Time, ok bool)
    Done() <-chan struct{}
    Err() error
    Value(key interface{}) interface{}
}
```

Let's break down what each method means:

* `Deadline()`: Returns when the context will be canceled (if a deadline is set).
* `Done()`: Returns a channel that's closed when the context is canceled.
* `Err()`: Returns why the context was canceled (after `Done()` is closed).
* `Value()`: Returns the value associated with a key in this context.

### Context's Purpose

The context package was designed to solve three specific problems:

1. **Cancellation propagation** : Signaling when operations should stop
2. **Request-scoped data** : Carrying values across API boundaries
3. **Deadline management** : Setting timeouts for operations

## Context Creation and Propagation

### Creating Root Contexts

All contexts start from a root context, which can be created using:

```go
// Empty root context
ctx := context.Background()

// Or for testing/temporary programs
ctx := context.TODO()
```

Let's understand when to use each:

* `Background()`: The most basic root context, used when starting a new independent operation.
* `TODO()`: Placeholder when it's unclear which context to use (often temporary during development).

### Deriving New Contexts

New contexts are derived from existing ones through these functions:

```go
// With cancellation
ctx, cancel := context.WithCancel(parentCtx)

// With timeout
ctx, cancel := context.WithTimeout(parentCtx, 5*time.Second)

// With deadline
ctx, cancel := context.WithDeadline(parentCtx, time.Now().Add(5*time.Second))

// With value
ctx = context.WithValue(parentCtx, key, value)
```

Each derived context inherits properties from its parent but adds new constraints or values.

## Best Practices for Context Propagation

### 1. Pass Context as the First Parameter

Always pass context as the first parameter to functions that need it:

```go
// Good
func ProcessRequest(ctx context.Context, req *Request) (*Response, error) {
    // Implementation
}

// Not recommended
func ProcessRequest(req *Request, ctx context.Context) (*Response, error) {
    // Implementation
}
```

This convention makes code more readable and consistent with standard library practices.

### 2. Don't Store Contexts in Structs

Contexts should flow through your program, not be stored:

```go
// Bad practice
type Service struct {
    ctx context.Context
    // other fields
}

// Good practice
type Service struct {
    // other fields
}

func (s *Service) ProcessTask(ctx context.Context) error {
    // Use the context here
}
```

Storing contexts in structs creates ambiguity about the context's lifecycle.

### 3. Use Context Cancellation Appropriately

Always respect cancellation and check for it in long-running operations:

```go
func LongOperation(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err() // Properly handle cancellation
        default:
            // Do work in small chunks
            err := doSomeWork()
            if err != nil {
                return err
            }
        }
    }
}
```

This pattern ensures your code can be interrupted when the context is canceled.

### 4. Always Call Cancel Functions

When you receive a cancel function, always call it when you're done:

```go
func processWithTimeout() error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel() // Always call cancel, even if the operation succeeds
  
    return callSomeFunction(ctx)
}
```

Using `defer cancel()` ensures resources are released even if the function returns early.

### 5. Use Context Values Judiciously

Context values should be used only for request-scoped data:

```go
// Keys should be unexported to prevent collisions
type requestIDKey struct{}

// Set a value
ctx = context.WithValue(ctx, requestIDKey{}, "req-123")

// Get a value
if reqID, ok := ctx.Value(requestIDKey{}).(string); ok {
    // Use reqID
}
```

Good candidates for context values include:

* Request IDs
* Authentication information
* Request-specific logger instances

Don't use context values for:

* Configuration
* Application state
* Function parameters that could be passed directly

### 6. Propagate Context Through the Call Chain

Contexts should flow through your entire call stack:

```go
func HandleRequest(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
  
    // Add request ID
    ctx = context.WithValue(ctx, requestIDKey{}, generateRequestID())
  
    result, err := processRequest(ctx, r.Body)
    // Handle response...
}

func processRequest(ctx context.Context, body io.Reader) (Result, error) {
    // Check for cancellation
    select {
    case <-ctx.Done():
        return Result{}, ctx.Err()
    default:
        // Continue processing
    }
  
    // Pass context to next layer
    return nextLayer(ctx, body)
}
```

This ensures that cancellation signals and request values are properly propagated.

## Real-World Example: HTTP Server with Context

Let's look at a comprehensive example of good context propagation in an HTTP server:

```go
package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "time"
)

// Key types for context values
type requestIDKey struct{}
type userIDKey struct{}

func main() {
    http.HandleFunc("/api/data", handleRequest)
    log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
    // Get the base context from the request
    ctx := r.Context()
  
    // Generate a request ID and store it in context
    requestID := generateRequestID()
    ctx = context.WithValue(ctx, requestIDKey{}, requestID)
  
    // Log with request ID
    log.Printf("[%s] Request received", requestID)
  
    // Set a timeout for the entire request handling
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel() // Ensure resources are released
  
    // Authenticate user and store user ID in context
    userID, err := authenticateUser(ctx, r)
    if err != nil {
        http.Error(w, "Authentication failed", http.StatusUnauthorized)
        return
    }
    ctx = context.WithValue(ctx, userIDKey{}, userID)
  
    // Process the request with the enriched context
    result, err := processRequest(ctx, r)
    if err != nil {
        if ctx.Err() == context.DeadlineExceeded {
            http.Error(w, "Request timed out", http.StatusGatewayTimeout)
        } else {
            http.Error(w, "Internal error", http.StatusInternalServerError)
        }
        return
    }
  
    // Send response
    fmt.Fprintf(w, "Result: %s", result)
    log.Printf("[%s] Request completed successfully", requestID)
}

func authenticateUser(ctx context.Context, r *http.Request) (string, error) {
    // Check if context is already canceled before doing work
    if err := ctx.Err(); err != nil {
        return "", err
    }
  
    // Simulate authentication process
    token := r.Header.Get("Authorization")
    if token == "" {
        return "", fmt.Errorf("no authorization token")
    }
  
    // In a real application, we might call a service to validate the token
    // This would also pass the context to the service call
    return "user-123", nil
}

func processRequest(ctx context.Context, r *http.Request) (string, error) {
    // Create a database access with shorter timeout
    dbCtx, dbCancel := context.WithTimeout(ctx, 3*time.Second)
    defer dbCancel() // Ensure DB resources are released
  
    // Get values from context
    requestID := ctx.Value(requestIDKey{}).(string)
    userID := ctx.Value(userIDKey{}).(string)
  
    // Simulate database access with context
    data, err := fetchDataFromDB(dbCtx, userID)
    if err != nil {
        log.Printf("[%s] Database error: %v", requestID, err)
        return "", err
    }
  
    // Process the data
    result := processData(data)
  
    return result, nil
}

func fetchDataFromDB(ctx context.Context, userID string) ([]byte, error) {
    // Simulate a database operation that respects context cancellation
    ch := make(chan []byte)
  
    go func() {
        // Simulate work
        time.Sleep(1 * time.Second)
        ch <- []byte("data for " + userID)
    }()
  
    // Wait for either work completion or context cancellation
    select {
    case data := <-ch:
        return data, nil
    case <-ctx.Done():
        return nil, ctx.Err()
    }
}

func processData(data []byte) string {
    // Some data processing logic
    return string(data) + " processed"
}

func generateRequestID() string {
    return fmt.Sprintf("req-%d", time.Now().UnixNano())
}
```

In this example, notice how:

1. Context flows through the entire request handling chain
2. Each function that needs context receives it as first parameter
3. Timeouts are set at appropriate levels (request-level and operation-level)
4. Context values are used for request-specific data
5. Cancellation is properly checked and propagated
6. Cancel functions are always called with `defer`

## Advanced Context Patterns

### Coordinating Multiple Goroutines

Context is excellent for coordinating multiple goroutines:

```go
func processItems(ctx context.Context, items []Item) error {
    g, ctx := errgroup.WithContext(ctx)
  
    for _, item := range items {
        item := item // Create a new variable for each iteration
        g.Go(func() error {
            return processItem(ctx, item)
        })
    }
  
    return g.Wait()
}

func processItem(ctx context.Context, item Item) error {
    select {
    case <-ctx.Done():
        return ctx.Err()
    default:
        // Process the item
        return nil
    }
}
```

This pattern ensures that if any goroutine fails or if the parent context is canceled, all goroutines will be canceled.

### Custom Context Creation

For advanced use cases, you might need to create custom context implementations:

```go
type customContext struct {
    context.Context
    // Additional fields
}

func (c *customContext) Value(key interface{}) interface{} {
    // Special handling for certain keys
    if key == specialKey {
        return c.specialValue
    }
    // Fall back to parent context
    return c.Context.Value(key)
}
```

However, this is rarely needed and should be used sparingly.

## Common Pitfalls and Anti-patterns

### 1. Ignoring the Context Parameter

Never ignore the context parameter:

```go
// Bad: Ignoring the passed context
func processData(ctx context.Context, data []byte) error {
    newCtx := context.Background() // Wrong! Creates a new unrelated context
    return doSomething(newCtx, data)
}

// Good: Using the passed context
func processData(ctx context.Context, data []byte) error {
    return doSomething(ctx, data)
}
```

### 2. Using a Single Global Context

Avoid using a single global context:

```go
// Bad: Using a global context
var globalCtx, globalCancel = context.WithCancel(context.Background())

func handleRequest(w http.ResponseWriter, r *http.Request) {
    // Using the global context instead of request-specific context
    result, err := processRequest(globalCtx, r.Body)
    // ...
}

// Good: Each request gets its own context
func handleRequest(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    result, err := processRequest(ctx, r.Body)
    // ...
}
```

### 3. Passing nil Context

Never pass a nil context:

```go
// Bad: Passing nil context
func foo() {
    processRequest(nil, data) // Never do this
}

// Good: Use context.Background() if you truly have no context
func foo() {
    processRequest(context.Background(), data)
}
```

### 4. Using Context for Function Parameters

Don't use context values for function parameters:

```go
// Bad: Using context to pass functional parameters
func processRequest(ctx context.Context) error {
    config := ctx.Value(configKey{}).(Config)
    return process(config)
}

// Good: Pass parameters explicitly
func processRequest(ctx context.Context, config Config) error {
    return process(config)
}
```

### 5. Not Checking for Context Cancellation

Always check for context cancellation in long-running operations:

```go
// Bad: Not checking for cancellation
func longProcess(ctx context.Context) error {
    for i := 0; i < 1000; i++ {
        // This might continue even if ctx is canceled
        time.Sleep(10 * time.Millisecond)
        doWork()
    }
    return nil
}

// Good: Checking for cancellation
func longProcess(ctx context.Context) error {
    for i := 0; i < 1000; i++ {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
            time.Sleep(10 * time.Millisecond)
            doWork()
        }
    }
    return nil
}
```

## In Summary

Context propagation in Go is a powerful pattern for managing request lifecycles, cancellation signals, and request-scoped values. By following these best practices, you can create more robust, maintainable, and efficient Go applications:

1. Pass context as the first parameter to functions
2. Don't store contexts in structs
3. Use cancellation appropriately and check for it in long-running operations
4. Always call cancel functions when you're done
5. Use context values judiciously and only for request-scoped data
6. Propagate context through the entire call chain
7. Be careful with context deadlines and timeouts

Remember that context is designed to flow through your program, carrying crucial cancellation signals and request-scoped values. By keeping these principles in mind, you'll build Go applications that are more resilient and maintainable.
