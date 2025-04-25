# Custom Context Implementations in Go

I'll explain Go's custom context implementations from first principles, starting with the fundamentals and building up to more advanced concepts with practical examples.

## Understanding Context in Go - The Foundation

At its core, a context in Go is a way to carry deadlines, cancellation signals, and request-scoped values across API boundaries and between processes. Before we dive into custom implementations, let's understand what a context actually is.

### The Context Interface

The context package defines a simple interface:

```go
type Context interface {
    Deadline() (deadline time.Time, ok bool)
    Done() <-chan struct{}
    Err() error
    Value(key any) any
}
```

Each method serves a specific purpose:

* `Deadline()`: Returns when the context will be canceled, if a deadline is set
* `Done()`: Returns a channel that's closed when the context is canceled
* `Err()`: Returns nil if Done hasn't been closed, otherwise returns the reason why the context was canceled
* `Value(key any)`: Returns the value associated with the key, or nil if none

### Why Context Matters

Imagine you're making an HTTP request to a service. If the user abandons the request, you want to cancel all downstream operations to avoid wasting resources. Context provides this exact functionality.

## Built-in Context Types

Before creating custom implementations, it's important to understand the built-in types:

* `context.Background()`: A root context, never canceled
* `context.TODO()`: Similar to Background but signals that you intend to add context functionality later
* `context.WithCancel(parent)`: Creates a cancellable child context
* `context.WithDeadline(parent, time)`: Creates a context that cancels at a specific time
* `context.WithTimeout(parent, duration)`: Creates a context that cancels after a duration
* `context.WithValue(parent, key, value)`: Creates a context with a key-value pair

Let's see a simple example of using built-in contexts:

```go
func fetchData(ctx context.Context) ([]byte, error) {
    // Create an HTTP request
    req, err := http.NewRequestWithContext(ctx, "GET", "https://api.example.com/data", nil)
    if err != nil {
        return nil, err
    }
  
    // Send the request
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
  
    // Read the response
    return ioutil.ReadAll(resp.Body)
}

func main() {
    // Create a context with a 2-second timeout
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel() // Always call cancel to release resources
  
    data, err := fetchData(ctx)
    if err != nil {
        log.Fatalf("Failed to fetch data: %v", err)
    }
    fmt.Println("Fetched", len(data), "bytes")
}
```

In this example, if the API call takes longer than 2 seconds, the context will be canceled, and the request will be aborted.

## Creating Custom Context Implementations - The Heart of Our Topic

Now, let's dive into creating custom context implementations. Why would you want to do this?

1. To add specialized behavior not available in standard contexts
2. To extend context functionality for specific use cases
3. To integrate with existing systems or frameworks

### The Embedding Pattern

The most common approach to implementing a custom context is by embedding an existing context:

```go
type customContext struct {
    context.Context
    // Additional fields here
}
```

This pattern leverages Go's embedding feature, where the `customContext` automatically implements the Context interface by delegating to the embedded context.

### Example 1: A Logging Context

Let's create a context that logs when it's canceled:

```go
type loggingContext struct {
    context.Context
    description string
    logger      *log.Logger
}

// Override the Done method to add logging
func (c *loggingContext) Done() <-chan struct{} {
    done := c.Context.Done()
  
    // Create a new channel
    ch := make(chan struct{})
  
    // Monitor the parent's Done channel
    go func() {
        select {
        case <-done:
            c.logger.Printf("Context %q was canceled", c.description)
            close(ch) // Close our channel when parent's is closed
        }
    }()
  
    return ch
}

// Create a new logging context
func WithLogging(parent context.Context, description string, logger *log.Logger) context.Context {
    return &loggingContext{
        Context:     parent,
        description: description,
        logger:      logger,
    }
}
```

This custom context will log a message when it's canceled. Let's see how to use it:

```go
func main() {
    logger := log.New(os.Stdout, "", log.LstdFlags)
  
    // Create a context with cancellation
    ctx, cancel := context.WithCancel(context.Background())
  
    // Wrap it with our logging context
    loggingCtx := WithLogging(ctx, "main-operation", logger)
  
    // Start a goroutine that will be canceled
    go func() {
        <-loggingCtx.Done()
        fmt.Println("Worker stopped")
    }()
  
    // Wait a bit then cancel
    time.Sleep(1 * time.Second)
    cancel()
  
    // Wait to see the log
    time.Sleep(100 * time.Millisecond)
}
```

When executed, this program will print:

```
2025/04/25 12:34:56 Context "main-operation" was canceled
Worker stopped
```

### Example 2: A Metrics Context

Let's create a context that measures the time between creation and cancellation:

```go
type metricsContext struct {
    context.Context
    name      string
    startTime time.Time
    metrics   *MetricsCollector
}

// MetricsCollector is a simple interface for collecting metrics
type MetricsCollector interface {
    RecordDuration(name string, duration time.Duration)
}

// Override Done to record metrics when canceled
func (c *metricsContext) Done() <-chan struct{} {
    done := c.Context.Done()
  
    // Create a new channel
    ch := make(chan struct{})
  
    // Monitor the parent's Done channel
    go func() {
        <-done
        duration := time.Since(c.startTime)
        c.metrics.RecordDuration(c.name, duration)
        close(ch)
    }()
  
    return ch
}

// Create a new metrics context
func WithMetrics(parent context.Context, name string, metrics *MetricsCollector) context.Context {
    return &metricsContext{
        Context:   parent,
        name:      name,
        startTime: time.Now(),
        metrics:   metrics,
    }
}
```

This context will record how long the operation took when it's canceled.

### Example 3: A Tracing Context

Let's implement a more practical example: a context that integrates with distributed tracing:

```go
type tracingContext struct {
    context.Context
    span opentracing.Span
}

// Override Done to finish the span when context is canceled
func (c *tracingContext) Done() <-chan struct{} {
    done := c.Context.Done()
  
    // Create a new channel
    ch := make(chan struct{})
  
    // Monitor the parent's Done channel
    go func() {
        <-done
        if c.Err() != nil {
            c.span.SetTag("error", true)
            c.span.LogFields(
                log.String("event", "error"),
                log.String("message", c.Err().Error()),
            )
        }
        c.span.Finish()
        close(ch)
    }()
  
    return ch
}

// Override Value to provide the span
func (c *tracingContext) Value(key any) any {
    if key == tracingSpanKey {
        return c.span
    }
    return c.Context.Value(key)
}

// Create a new tracing context
func WithTracing(parent context.Context, operationName string) (context.Context, opentracing.Span) {
    span := opentracing.StartSpan(operationName)
    return &tracingContext{
        Context: parent,
        span:    span,
    }, span
}
```

This context integrates with OpenTracing to provide distributed tracing capabilities.

## Challenges and Considerations When Implementing Custom Contexts

Creating custom contexts requires careful consideration of several factors:

### 1. Thread Safety

Context implementations must be thread-safe since they're often used across goroutines. Use synchronization primitives when needed:

```go
type threadSafeContext struct {
    context.Context
    mu      sync.Mutex
    counter int
}

func (c *threadSafeContext) IncrementCounter() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.counter++
    return c.counter
}

func (c *threadSafeContext) GetCounter() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.counter
}
```

### 2. Cancellation Chain

When implementing a custom context, you must ensure that cancellation propagates correctly:

```go
// This is INCORRECT
func (c *badContext) Done() <-chan struct{} {
    // This creates a new channel but doesn't connect it to the parent!
    return make(chan struct{})
}

// This is CORRECT
func (c *goodContext) Done() <-chan struct{} {
    ch := make(chan struct{})
    go func() {
        <-c.Context.Done() // Wait for parent cancellation
        close(ch)          // Propagate the cancellation
    }()
    return ch
}
```

### 3. Memory Leaks

Be cautious about goroutine leaks. Always ensure that goroutines will eventually terminate:

```go
func WithDeadlineSafe(parent context.Context, deadline time.Time) (context.Context, context.CancelFunc) {
    ctx, cancel := context.WithDeadline(parent, deadline)
  
    // This would leak if parent is never canceled and deadline never reaches!
    go func() {
        <-parent.Done()
        // Do something
    }()
  
    // Better approach with multiple exit conditions
    go func() {
        select {
        case <-parent.Done():
            // Parent canceled
        case <-ctx.Done():
            // Our deadline reached or we were canceled
        }
        // Now we can safely exit
    }()
  
    return ctx, cancel
}
```

## Advanced Example: Request-scoped Database Transaction Context

Let's build a more practical example: a context that carries a database transaction:

```go
type txKey struct{}

type TransactionContext struct {
    context.Context
    tx *sql.Tx
}

// Implement Value to provide access to the transaction
func (c *TransactionContext) Value(key any) any {
    if key == (txKey{}) {
        return c.tx
    }
    return c.Context.Value(key)
}

// Create a new transaction context
func WithTransaction(ctx context.Context, db *sql.DB) (*TransactionContext, error) {
    // Start a new transaction
    tx, err := db.BeginTx(ctx, nil)
    if err != nil {
        return nil, err
    }
  
    // Create the context
    txCtx := &TransactionContext{
        Context: ctx,
        tx:      tx,
    }
  
    // Ensure the transaction is rolled back if the context is canceled
    go func() {
        <-ctx.Done()
        tx.Rollback() // Ignore error since context is already done
    }()
  
    return txCtx, nil
}

// Get transaction from context
func GetTransaction(ctx context.Context) (*sql.Tx, bool) {
    tx, ok := ctx.Value(txKey{}).(*sql.Tx)
    return tx, ok
}

// Helper function to commit the transaction
func CommitTransaction(ctx context.Context) error {
    tx, ok := GetTransaction(ctx)
    if !ok {
        return errors.New("no transaction in context")
    }
    return tx.Commit()
}
```

Now we can use this in a web handler:

```go
func handleRequest(w http.ResponseWriter, r *http.Request) {
    // Get the database connection
    db := getDatabase()
  
    // Create a transaction context
    txCtx, err := WithTransaction(r.Context(), db)
    if err != nil {
        http.Error(w, "Failed to start transaction", http.StatusInternalServerError)
        return
    }
  
    // Use the transaction context for the request
    err = processRequest(txCtx)
    if err != nil {
        // Transaction will be rolled back automatically when the function returns
        // because the context will be canceled
        http.Error(w, "Failed to process request", http.StatusInternalServerError)
        return
    }
  
    // Commit the transaction
    if err := CommitTransaction(txCtx); err != nil {
        http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
        return
    }
  
    w.WriteHeader(http.StatusOK)
}

func processRequest(ctx context.Context) error {
    // Get the transaction from the context
    tx, ok := GetTransaction(ctx)
    if !ok {
        return errors.New("no transaction in context")
    }
  
    // Use the transaction
    _, err := tx.ExecContext(ctx, "INSERT INTO logs (message) VALUES (?)", "Request processed")
    return err
}
```

This example demonstrates how a custom context can carry a database transaction through the request lifecycle, ensuring it's properly committed or rolled back.

## Testing Custom Context Implementations

Testing is crucial when implementing custom contexts. Here's an example of how to test our logging context:

```go
func TestLoggingContext(t *testing.T) {
    // Create a buffer to capture log output
    var buf bytes.Buffer
    logger := log.New(&buf, "", 0)
  
    // Create a cancelable context
    ctx, cancel := context.WithCancel(context.Background())
  
    // Wrap it with our logging context
    loggingCtx := WithLogging(ctx, "test-context", logger)
  
    // Start a goroutine that waits for cancellation
    done := make(chan struct{})
    go func() {
        <-loggingCtx.Done()
        close(done)
    }()
  
    // Cancel the context
    cancel()
  
    // Wait for the goroutine to finish
    select {
    case <-done:
        // OK
    case <-time.After(time.Second):
        t.Fatal("Context cancellation not propagated")
    }
  
    // Check the log output
    logOutput := buf.String()
    if !strings.Contains(logOutput, "Context \"test-context\" was canceled") {
        t.Errorf("Expected log message not found, got: %q", logOutput)
    }
}
```

## Best Practices for Custom Context Implementations

Based on the examples and challenges we've discussed, here are some best practices:

1. **Embed the parent context** : Use the embedding pattern to avoid reimplementing methods.
2. **Ensure cancellation propagation** : Make sure cancellation signals propagate correctly from parent to child contexts.
3. **Be careful with goroutines** : Avoid goroutine leaks by handling all termination conditions.
4. **Use value types for context keys** : Custom types as keys prevent key collisions:

```go
type myContextKey struct{}
ctx = context.WithValue(ctx, myContextKey{}, "value")
```

5. **Document behavior** : Clearly document any non-standard behavior in your custom context.
6. **Test thoroughly** : Test your context under various conditions, including cancellation propagation.
7. **Keep it simple** : Only override the methods you need to change; let the embedded context handle the rest.

## Real-world Applications of Custom Contexts

Custom contexts are widely used in production systems for various purposes:

### 1. Request Tracking

A context carrying request IDs for logging and tracing:

```go
type requestContext struct {
    context.Context
    requestID string
}

func (c *requestContext) Value(key any) any {
    if key == requestIDKey {
        return c.requestID
    }
    return c.Context.Value(key)
}

func WithRequestID(parent context.Context, requestID string) context.Context {
    return &requestContext{
        Context:   parent,
        requestID: requestID,
    }
}
```

### 2. Authorization

A context carrying user authentication information:

```go
type authContext struct {
    context.Context
    userID   string
    roles    []string
    isAdmin  bool
}

func (c *authContext) Value(key any) any {
    switch key {
    case userIDKey:
        return c.userID
    case rolesKey:
        return c.roles
    case isAdminKey:
        return c.isAdmin
    default:
        return c.Context.Value(key)
    }
}

func WithAuth(parent context.Context, userID string, roles []string) context.Context {
    isAdmin := false
    for _, role := range roles {
        if role == "admin" {
            isAdmin = true
            break
        }
    }
  
    return &authContext{
        Context: parent,
        userID:  userID,
        roles:   roles,
        isAdmin: isAdmin,
    }
}
```

### 3. Rate Limiting

A context that enforces rate limits:

```go
type rateLimitContext struct {
    context.Context
    limiter *rate.Limiter
}

func (c *rateLimitContext) Err() error {
    if !c.limiter.Allow() {
        return errors.New("rate limit exceeded")
    }
    return c.Context.Err()
}

func WithRateLimit(parent context.Context, rps float64) context.Context {
    return &rateLimitContext{
        Context: parent,
        limiter: rate.NewLimiter(rate.Limit(rps), 1),
    }
}
```

## Conclusion

Custom context implementations in Go provide a powerful way to carry request-scoped data and signals across API boundaries. By understanding the context interface and following best practices, you can create specialized contexts that enhance your application's functionality.

From simple logging contexts to complex transaction management, the flexibility of Go's context system allows for elegant solutions to complex problems. Remember to keep your implementations simple, thread-safe, and well-tested to benefit fully from this powerful pattern.

Would you like me to elaborate on any particular aspect of custom contexts in Go? Perhaps you're interested in more advanced patterns or specific use cases?
