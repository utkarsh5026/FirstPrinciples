# Rate Limiting in Go: From First Principles

Rate limiting is a crucial technique in software engineering that controls the frequency of operations, particularly in distributed systems and APIs. I'll explain Go's rate limiting implementations thoroughly, starting from the most fundamental concepts and building up to practical implementations.

## Understanding Rate Limiting: The Core Concept

At its essence, rate limiting is about controlling how frequently an operation can occur. Imagine a water faucet with a flow regulator - you can control how much water flows through per minute. Similarly, rate limiting controls how many requests or operations can flow through a system in a given time period.

### Why Rate Limiting Matters

Rate limiting serves several important purposes:
- Prevents resource exhaustion from too many concurrent requests
- Protects services from denial-of-service attacks (intentional or accidental)
- Ensures fair usage among different clients
- Helps maintain service quality under heavy load
- Enforces usage policies (like API quotas)

Let's first understand the fundamental algorithms that power rate limiting before we look at Go's implementations.

## Rate Limiting Algorithms: The Building Blocks

### 1. Token Bucket Algorithm

Imagine a bucket that holds tokens. The bucket has a fixed capacity, and tokens are added at a steady rate. Each operation consumes one token. If the bucket is empty, the operation must wait or be rejected.

Here's a simple conceptual model:

```go
type TokenBucket struct {
    capacity     int       // Maximum tokens the bucket can hold
    tokens       int       // Current token count
    refillRate   int       // Tokens added per second
    lastRefillTime time.Time // Last time tokens were added
}

func (tb *TokenBucket) Allow() bool {
    tb.refill()
    if tb.tokens > 0 {
        tb.tokens--
        return true
    }
    return false
}

func (tb *TokenBucket) refill() {
    now := time.Now()
    elapsed := now.Sub(tb.lastRefillTime).Seconds()
    newTokens := int(elapsed * float64(tb.refillRate))
    
    if newTokens > 0 {
        tb.tokens = min(tb.capacity, tb.tokens + newTokens)
        tb.lastRefillTime = now
    }
}
```

In this example, we're managing a bucket of tokens that refills at a consistent rate. When a request comes in, we check if we have enough tokens; if yes, we allow the request and consume a token. If not, we deny the request.

### 2. Leaky Bucket Algorithm

Similar to the token bucket, but works in reverse: imagine a bucket with a hole at the bottom. Water (requests) pours in at variable rates, but leaks out at a constant rate. If the bucket overflows, new requests are rejected.

```go
type LeakyBucket struct {
    capacity   int       // Bucket capacity
    water      int       // Current water level
    leakRate   int       // Units that leak per second
    lastLeakTime time.Time // Last time water leaked
}

func (lb *LeakyBucket) Allow() bool {
    lb.leak()
    if lb.water < lb.capacity {
        lb.water++
        return true
    }
    return false
}

func (lb *LeakyBucket) leak() {
    now := time.Now()
    elapsed := now.Sub(lb.lastLeakTime).Seconds()
    leakedWater := int(elapsed * float64(lb.leakRate))
    
    if leakedWater > 0 {
        lb.water = max(0, lb.water - leakedWater)
        lb.lastLeakTime = now
    }
}
```

In this example, the bucket leaks at a constant rate, analogous to processing requests at a consistent throughput.

### 3. Fixed Window Counter

Divide time into fixed windows (e.g., 1-minute intervals) and count requests in each window. Once the count exceeds the limit, reject additional requests until the next window.

```go
type FixedWindowCounter struct {
    limit       int       // Maximum requests per window
    count       int       // Current count in this window
    windowSize  time.Duration // Window size (e.g., 1 minute)
    windowStart time.Time // Start time of current window
}

func (fw *FixedWindowCounter) Allow() bool {
    now := time.Now()
    
    // Check if we've moved to a new window
    if now.Sub(fw.windowStart) >= fw.windowSize {
        fw.count = 0
        fw.windowStart = now
    }
    
    if fw.count < fw.limit {
        fw.count++
        return true
    }
    return false
}
```

This approach is simple but can lead to burst traffic at window boundaries.

### 4. Sliding Window Log

Instead of fixed windows, maintain a log of timestamps for each request. Count only the requests within the sliding time window.

```go
type SlidingWindowLog struct {
    limit        int           // Maximum requests per window
    windowSize   time.Duration // Window size (e.g., 1 minute)
    requestLog   []time.Time   // Log of request timestamps
}

func (sw *SlidingWindowLog) Allow() bool {
    now := time.Now()
    cutoff := now.Add(-sw.windowSize)
    
    // Remove expired entries
    i := 0
    for i < len(sw.requestLog) && sw.requestLog[i].Before(cutoff) {
        i++
    }
    sw.requestLog = sw.requestLog[i:]
    
    // Check if we can allow the request
    if len(sw.requestLog) < sw.limit {
        sw.requestLog = append(sw.requestLog, now)
        return true
    }
    return false
}
```

This approach is more accurate but can be memory-intensive for high-traffic services.

### 5. Sliding Window Counter

A hybrid approach that combines the efficiency of fixed windows with the accuracy of sliding windows.

```go
type SlidingWindowCounter struct {
    limit         int       // Maximum requests per window
    currentCount  int       // Count in current window
    previousCount int       // Count in previous window
    windowSize    time.Duration // Window size (e.g., 1 minute)
    windowStart   time.Time // Start time of current window
}

func (sw *SlidingWindowCounter) Allow() bool {
    now := time.Now()
    elapsed := now.Sub(sw.windowStart)
    
    // Check if we've moved to a new window
    if elapsed >= sw.windowSize {
        sw.previousCount = sw.currentCount
        sw.currentCount = 0
        sw.windowStart = now
        elapsed = 0
    }
    
    // Calculate the rolling rate based on the position in the window
    weight := float64(sw.windowSize - elapsed) / float64(sw.windowSize)
    weightedCount := int(float64(sw.previousCount) * weight) + sw.currentCount
    
    if weightedCount < sw.limit {
        sw.currentCount++
        return true
    }
    return false
}
```

This approach balances accuracy and efficiency.

## Go's Standard Library: time/rate Package

Go's standard library provides a robust rate limiter implementation in the `time/rate` package. This implementation is based on the token bucket algorithm we discussed earlier.

Let's explore it step by step:

### Basic Usage with `time/rate`

```go
package main

import (
    "context"
    "fmt"
    "time"
    "golang.org/x/time/rate"
)

func main() {
    // Create a limiter that allows 2 events per second with a burst of 5
    limiter := rate.NewLimiter(rate.Limit(2), 5)
    
    for i := 0; i < 10; i++ {
        // Check if we can proceed
        if limiter.Allow() {
            fmt.Println("Request allowed:", i)
        } else {
            fmt.Println("Request denied:", i)
        }
        time.Sleep(200 * time.Millisecond)
    }
}
```

In this example:
- We create a limiter with a rate of 2 requests per second
- The burst parameter (5) allows up to 5 requests to happen in quick succession
- `Allow()` returns true if a request can proceed, false otherwise

The `rate.Limit(2)` creates a limit of 2 events per second. This is a key concept in the package - it defines the rate at which tokens are added to the bucket.

### Wait Instead of Deny with `Wait` and `WaitN`

Often, instead of denying requests outright, you might want to wait until a request can proceed:

```go
package main

import (
    "context"
    "fmt"
    "time"
    "golang.org/x/time/rate"
)

func main() {
    // Create a limiter that allows 1 event per second with a burst of 3
    limiter := rate.NewLimiter(rate.Limit(1), 3)
    
    for i := 0; i < 5; i++ {
        // Wait until we can proceed
        ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
        defer cancel()
        
        fmt.Println("Attempting request:", i, "at", time.Now().Format("15:04:05.000"))
        
        err := limiter.Wait(ctx)
        if err != nil {
            fmt.Println("Timed out waiting for permission:", i)
        } else {
            fmt.Println("Request allowed:", i, "at", time.Now().Format("15:04:05.000"))
            // Simulate work
            time.Sleep(100 * time.Millisecond)
        }
    }
}
```

In this example:
- We use `Wait()` instead of `Allow()`
- `Wait()` blocks until a token becomes available or the context is canceled
- We set a timeout of 2 seconds for waiting
- The output will show requests being spaced out according to the rate limit

The `Wait` method is particularly useful in scenarios where it's better to delay processing rather than denying it entirely.

### Reserving Tokens with `Reserve` and `ReserveN`

Sometimes you want to know how long you'll need to wait before proceeding:

```go
package main

import (
    "fmt"
    "time"
    "golang.org/x/time/rate"
)

func main() {
    // Create a limiter that allows 0.5 events per second (1 every 2 seconds)
    limiter := rate.NewLimiter(rate.Limit(0.5), 1)
    
    for i := 0; i < 5; i++ {
        // Reserve a token
        r := limiter.Reserve()
        
        if !r.OK() {
            fmt.Println("Cannot reserve token:", i)
            continue
        }
        
        // Calculate wait time
        waitTime := r.Delay()
        fmt.Printf("Request: %d, Need to wait: %v\n", i, waitTime)
        
        // Actually wait
        time.Sleep(waitTime)
        fmt.Printf("Request: %d, Executing at: %v\n", i, time.Now().Format("15:04:05.000"))
        
        // Simulate work
        time.Sleep(100 * time.Millisecond)
    }
}
```

This approach:
- Reserves a token without actually waiting
- Returns information about how long the caller needs to wait
- Allows for more flexible handling of rate limiting

### Custom Time Sources for Testing

For testing rate limiters, it's often useful to control time:

```go
package main

import (
    "fmt"
    "time"
    "golang.org/x/time/rate"
)

// A simple time source that can be manually advanced
type testTimeSource struct {
    now time.Time
}

func (ts *testTimeSource) Now() time.Time {
    return ts.now
}

func main() {
    // Create a test time source
    ts := &testTimeSource{now: time.Date(2023, 1, 1, 12, 0, 0, 0, time.UTC)}
    
    // Create a limiter with our time source
    limiter := rate.NewLimiter(rate.Limit(1), 1)
    limiter.SetLimit(rate.Limit(1)) // 1 token per second
    
    // First request should be allowed
    fmt.Println("Request 1 allowed:", limiter.AllowN(ts.Now(), 1))
    
    // Second immediate request should be denied (burst is 1)
    fmt.Println("Request 2 allowed:", limiter.AllowN(ts.Now(), 1))
    
    // Advance time by 1 second
    ts.now = ts.now.Add(1 * time.Second)
    
    // Now should be allowed again
    fmt.Println("Request 3 allowed:", limiter.AllowN(ts.Now(), 1))
}
```

This pattern is useful for deterministic testing of rate limiting behavior.

## Practical Applications of Rate Limiters in Go

Now that we understand the basics, let's look at how to apply rate limiting in real-world scenarios.

### HTTP Middleware for API Rate Limiting

A common use case is to rate limit HTTP API endpoints:

```go
package main

import (
    "net/http"
    "sync"
    "golang.org/x/time/rate"
)

// Simple in-memory store for rate limiters
type RateLimiterStore struct {
    limiters map[string]*rate.Limiter
    mu       sync.Mutex
}

func NewRateLimiterStore() *RateLimiterStore {
    return &RateLimiterStore{
        limiters: make(map[string]*rate.Limiter),
    }
}

// GetLimiter retrieves or creates a rate limiter for the given key
func (s *RateLimiterStore) GetLimiter(key string) *rate.Limiter {
    s.mu.Lock()
    defer s.mu.Unlock()
    
    limiter, exists := s.limiters[key]
    if !exists {
        // Create a new limiter: 5 requests per second with burst of 10
        limiter = rate.NewLimiter(rate.Limit(5), 10)
        s.limiters[key] = limiter
    }
    
    return limiter
}

// RateLimitMiddleware is an HTTP middleware for rate limiting
func RateLimitMiddleware(store *RateLimiterStore) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Use IP address as the rate limiting key
            limiterKey := r.RemoteAddr
            
            // Get the limiter for this IP
            limiter := store.GetLimiter(limiterKey)
            
            // Check if request is allowed
            if !limiter.Allow() {
                http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
                return
            }
            
            // Continue to the next handler
            next.ServeHTTP(w, r)
        })
    }
}

func main() {
    // Create a rate limiter store
    store := NewRateLimiterStore()
    
    // Create a simple handler
    helloHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello, World!"))
    })
    
    // Apply the rate limiting middleware
    http.Handle("/hello", RateLimitMiddleware(store)(helloHandler))
    
    // Start the server
    http.ListenAndServe(":8080", nil)
}
```

This HTTP middleware:
- Creates a rate limiter for each unique IP address
- Limits requests to 5 per second with a burst of 10
- Returns HTTP 429 (Too Many Requests) when the limit is exceeded

### Distributing Rate Limits Across Multiple Instances

For distributed systems, you might need to share rate limit state across multiple instances, possibly using Redis:

```go
package main

import (
    "context"
    "fmt"
    "time"
    
    "github.com/go-redis/redis/v8"
)

// RedisCellRateLimiter uses Redis Cell module for rate limiting
type RedisCellRateLimiter struct {
    client         *redis.Client
    keyPrefix      string
    requestsPerSec int
    burstSize      int
}

func NewRedisCellRateLimiter(client *redis.Client, keyPrefix string, rps, burst int) *RedisCellRateLimiter {
    return &RedisCellRateLimiter{
        client:         client,
        keyPrefix:      keyPrefix,
        requestsPerSec: rps,
        burstSize:      burst,
    }
}

// Allow checks if a request is allowed for the given key
func (r *RedisCellRateLimiter) Allow(ctx context.Context, key string) (bool, error) {
    // Construct the full key
    fullKey := fmt.Sprintf("%s:%s", r.keyPrefix, key)
    
    // Using Redis Cell's CL.THROTTLE command
    // Format: CL.THROTTLE key max_burst count_per_period period [quantity]
    res, err := r.client.Do(ctx, "CL.THROTTLE", 
        fullKey,                  // Key to rate limit
        r.burstSize,              // Maximum burst
        r.requestsPerSec,         // Count per period
        1,                        // Period in seconds
        1,                        // Quantity (default 1)
    ).Result()
    
    if err != nil {
        return false, err
    }
    
    // Parse the response
    // Redis Cell returns: [isAllowed, totalAllowed, remainingAllowed, secondsToWait, retryAfterMicros]
    values, ok := res.([]interface{})
    if !ok || len(values) < 1 {
        return false, fmt.Errorf("invalid response format")
    }
    
    isAllowed, ok := values[0].(int64)
    if !ok {
        return false, fmt.Errorf("invalid response format for isAllowed")
    }
    
    // 0 means allowed, 1 means denied
    return isAllowed == 0, nil
}

func main() {
    // Create Redis client
    rdb := redis.NewClient(&redis.Options{
        Addr: "localhost:6379",
    })
    
    // Create rate limiter with 10 requests per second and burst of 20
    limiter := NewRedisCellRateLimiter(rdb, "api:ratelimit", 10, 20)
    
    // Example usage
    ctx := context.Background()
    for i := 0; i < 25; i++ {
        allowed, err := limiter.Allow(ctx, "user:123")
        if err != nil {
            fmt.Printf("Error: %v\n", err)
            continue
        }
        
        if allowed {
            fmt.Println("Request allowed:", i)
        } else {
            fmt.Println("Request denied:", i)
        }
        
        time.Sleep(50 * time.Millisecond)
    }
}
```

This example uses Redis Cell, a Redis module specifically designed for rate limiting. This approach:
- Works across multiple instances of your application
- Uses a sliding window approach
- Provides detailed information about remaining capacity and retry times

Note: This requires Redis with the Cell module installed.

### Per-User Rate Limiting

Different users might have different rate limits based on their subscription tier:

```go
package main

import (
    "net/http"
    "sync"
    "golang.org/x/time/rate"
)

// UserTier defines different rate limit tiers
type UserTier string

const (
    FreeTier     UserTier = "free"
    PremiumTier  UserTier = "premium"
    UnlimitedTier UserTier = "unlimited"
)

// TierLimits defines the rate limits for each tier
var TierLimits = map[UserTier]struct {
    RPS   rate.Limit // Requests per second
    Burst int        // Maximum burst
}{
    FreeTier:     {rate.Limit(1), 5},     // 1 req/s, burst of 5
    PremiumTier:  {rate.Limit(10), 20},   // 10 req/s, burst of 20
    UnlimitedTier: {rate.Inf, 0},         // Unlimited
}

// UserRateLimiter manages rate limiters for different users
type UserRateLimiter struct {
    limiters map[string]*rate.Limiter
    tiers    map[string]UserTier
    mu       sync.Mutex
}

func NewUserRateLimiter() *UserRateLimiter {
    return &UserRateLimiter{
        limiters: make(map[string]*rate.Limiter),
        tiers:    make(map[string]UserTier),
    }
}

// GetLimiter gets or creates a limiter for a user
func (u *UserRateLimiter) GetLimiter(userID string) *rate.Limiter {
    u.mu.Lock()
    defer u.mu.Unlock()
    
    limiter, exists := u.limiters[userID]
    if !exists {
        // Get the user tier or default to free
        tier, exists := u.tiers[userID]
        if !exists {
            tier = FreeTier
        }
        
        // Get limits for this tier
        limits := TierLimits[tier]
        
        // Create limiter
        limiter = rate.NewLimiter(limits.RPS, limits.Burst)
        u.limiters[userID] = limiter
    }
    
    return limiter
}

// SetUserTier sets a user's tier
func (u *UserRateLimiter) SetUserTier(userID string, tier UserTier) {
    u.mu.Lock()
    defer u.mu.Unlock()
    
    u.tiers[userID] = tier
    
    // If limiter exists, update it
    if limiter, exists := u.limiters[userID]; exists {
        limits := TierLimits[tier]
        limiter.SetLimit(limits.RPS)
        limiter.SetBurst(limits.Burst)
    }
}

// RateLimitMiddleware applies per-user rate limiting
func RateLimitMiddleware(limiter *UserRateLimiter) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Get user ID from request (e.g., from auth token)
            userID := getUserID(r) // Implement this function based on your auth system
            
            // Get the limiter for this user
            userLimiter := limiter.GetLimiter(userID)
            
            // Check if request is allowed
            if !userLimiter.Allow() {
                http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
                return
            }
            
            // Continue to the next handler
            next.ServeHTTP(w, r)
        })
    }
}

// Mock function to get user ID from request
func getUserID(r *http.Request) string {
    // In a real app, you'd extract this from JWT, session, etc.
    return r.Header.Get("X-User-ID")
}

func main() {
    // Create a user rate limiter
    userLimiter := NewUserRateLimiter()
    
    // Set some user tiers
    userLimiter.SetUserTier("user1", FreeTier)
    userLimiter.SetUserTier("user2", PremiumTier)
    userLimiter.SetUserTier("user3", UnlimitedTier)
    
    // Create a simple handler
    helloHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello, World!"))
    })
    
    // Apply the rate limiting middleware
    http.Handle("/api", RateLimitMiddleware(userLimiter)(helloHandler))
    
    // Start the server
    http.ListenAndServe(":8080", nil)
}
```

This approach:
- Defines different tiers with different rate limits
- Allows dynamic updating of a user's tier
- Applies appropriate limits based on the user's tier

### Client-Side Rate Limiting

Sometimes you need to limit the rate at which your application calls external services:

```go
package main

import (
    "context"
    "fmt"
    "time"
    "golang.org/x/time/rate"
)

// RateLimitedClient wraps an API client with rate limiting
type RateLimitedClient struct {
    limiter *rate.Limiter
    client  APIClient
}

// APIClient is an interface for any API client
type APIClient interface {
    Call(ctx context.Context, request string) (string, error)
}

// NewRateLimitedClient creates a new rate-limited client
func NewRateLimitedClient(client APIClient, rps rate.Limit, burst int) *RateLimitedClient {
    return &RateLimitedClient{
        limiter: rate.NewLimiter(rps, burst),
        client:  client,
    }
}

// Call calls the underlying API client while respecting rate limits
func (r *RateLimitedClient) Call(ctx context.Context, request string) (string, error) {
    // Wait for permission to proceed
    if err := r.limiter.Wait(ctx); err != nil {
        return "", fmt.Errorf("rate limit exceeded: %w", err)
    }
    
    // Make the actual API call
    return r.client.Call(ctx, request)
}

// MockAPIClient is a simple implementation of APIClient for demonstration
type MockAPIClient struct{}

func (m *MockAPIClient) Call(ctx context.Context, request string) (string, error) {
    fmt.Println("API call:", request, "at", time.Now().Format("15:04:05.000"))
    // Simulate API processing time
    time.Sleep(100 * time.Millisecond)
    return "Response for " + request, nil
}

func main() {
    // Create a mock API client
    apiClient := &MockAPIClient{}
    
    // Wrap it with rate limiting - 2 requests per second
    rateLimitedClient := NewRateLimitedClient(apiClient, rate.Limit(2), 1)
    
    // Make a series of calls
    ctx := context.Background()
    for i := 0; i < 10; i++ {
        startTime := time.Now()
        request := fmt.Sprintf("Request-%d", i)
        
        response, err := rateLimitedClient.Call(ctx, request)
        if err != nil {
            fmt.Printf("Error: %v\n", err)
            continue
        }
        
        elapsed := time.Since(startTime)
        fmt.Printf("Call %d completed in %v: %s\n", i, elapsed, response)
    }
}
```

This pattern:
- Wraps an API client with rate limiting logic
- Ensures that calls to external services don't exceed limits
- Provides a clean abstraction for rate-limited operations

## Performance Considerations

Rate limiting in Go has some important performance considerations:

### Memory Usage

The memory footprint of different rate limiting approaches varies:
- Sliding window logs store timestamps for each request, potentially using significant memory for high-traffic services
- Token bucket and leaky bucket implementations are more memory-efficient

### Time Complexity

The computational complexity of checking rate limits also varies:
- Fixed window: O(1)
- Token bucket: O(1)
- Leaky bucket: O(1)
- Sliding window log: O(n) where n is the number of requests in the window
- Sliding window counter: O(1)

### Synchronized Access

Most rate limiters need synchronized access to shared state:
- Using mutexes can create contention points
- Consider using atomic operations for simple counters
- Use per-client limiters to reduce contention

Here's an example of a more efficient limiter using atomic operations:

```go
package main

import (
    "fmt"
    "sync/atomic"
    "time"
)

// AtomicRateLimiter uses atomic operations for simpler rate limiting
type AtomicRateLimiter struct {
    count       int64
    lastReset   int64
    windowSize  int64 // Window size in nanoseconds
    limit       int64
}

func NewAtomicRateLimiter(limit int, windowSize time.Duration) *AtomicRateLimiter {
    return &AtomicRateLimiter{
        count:      0,
        lastReset:  time.Now().UnixNano(),
        windowSize: int64(windowSize),
        limit:      int64(limit),
    }
}

func (a *AtomicRateLimiter) Allow() bool {
    now := time.Now().UnixNano()
    lastResetTime := atomic.LoadInt64(&a.lastReset)
    
    // Check if we need to reset the window
    if now - lastResetTime > a.windowSize {
        atomic.StoreInt64(&a.lastReset, now)
        atomic.StoreInt64(&a.count, 0)
    }
    
    // Try to increment the counter
    newCount := atomic.AddInt64(&a.count, 1)
    
    // If we're over the limit, decrement and return false
    if newCount > a.limit {
        atomic.AddInt64(&a.count, -1)
        return false
    }
    
    return true
}

func main() {
    // Create a limiter allowing 5 requests per second
    limiter := NewAtomicRateLimiter(5, time.Second)
    
    // Test the limiter
    for i := 0; i < 10; i++ {
        if limiter.Allow() {
            fmt.Println("Request allowed:", i)
        } else {
            fmt.Println("Request denied:", i)
        }
        time.Sleep(150 * time.Millisecond)
    }
}
```

This implementation:
- Uses atomic operations instead of locks
- Implements a fixed window approach for simplicity
- Has better performance characteristics under high concurrency

## Advanced Concepts: Adaptive Rate Limiting

Sometimes a static rate limit isn't enough. Adaptive rate limiting adjusts limits based on system conditions:

```go
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
    "golang.org/x/time/rate"
)

// AdaptiveRateLimiter adjusts limits based on system load
type AdaptiveRateLimiter struct {
    limiter     *rate.Limiter
    mu          sync.Mutex
    baseLimit   rate.Limit
    baseBurst   int
    currentLoad float64 // 0.0 to 1.0
}

func NewAdaptiveRateLimiter(baseLimit rate.Limit, baseBurst int) *AdaptiveRateLimiter {
    arl := &AdaptiveRateLimiter{
        baseLimit: baseLimit,
        baseBurst: baseBurst,
        limiter:   rate.NewLimiter(baseLimit, baseBurst),
    }
    
    // Start a goroutine to periodically adjust limits
    go arl.adjustLimitsLoop()
    
    return arl
}

// UpdateLoad sets the current system load
func (a *AdaptiveRateLimiter) UpdateLoad(load float64) {
    a.mu.Lock()
    defer a.mu.Unlock()
    
    if load < 0 {
        load = 0
    } else if load > 1 {
        load = 1
    }
    
    a.currentLoad = load
}

// adjustLimitsLoop periodically adjusts rate limits based on load
func (a *AdaptiveRateLimiter) adjustLimitsLoop() {
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()
    
    for range ticker.C {
        a.mu.Lock()
        
        // Calculate new limit based on load
        // As load increases, limit decreases
        loadFactor := 1.0 - a.currentLoad
        newLimit := a.baseLimit * rate.Limit(loadFactor)
        newBurst := int(float64(a.baseBurst) * loadFactor)
        
        // Ensure minimum values
        if newLimit < 1 {
            newLimit = 1
        }
        
        if newBurst < 1 {
            newBurst = 1
        }
        
        // Update the limiter
        a.limiter.SetLimit(newLimit)
        a.limiter.SetBurst(newBurst)
        
        fmt.Printf("Adjusted rate limits - Load: %.2f, New limit: %.2f/s, New burst: %d\n", 
            a.currentLoad, float64(newLimit), newBurst)
        
        a.mu.Unlock()
    }
}

// Allow checks if a request is allowed
func (a *AdaptiveRateLimiter) Allow() bool {
    return a.limiter.Allow()
}

// Wait waits until a request is allowed
func (a *AdaptiveRateLimiter) Wait(ctx context.Context) error {
    return a.limiter.Wait(ctx)
}

func main() {
    // Create an adaptive limiter with base rate of 10 req/s and burst of 20
    limiter := NewAdaptiveRateLimiter(rate.Limit(10), 20)
    
    // Simulate changing load over time
    go func() {
        loads := []float64{0.1, 0.3, 0.5, 0.8, 0.9, 0.7, 0.4, 0.2}
        for _, load := range loads {
            time.Sleep(6 * time.Second)
            fmt.Printf("Setting system load to %.2f\n", load)
            limiter.UpdateLoad(load)
        }
    }()
    
    // Test the limiter
    for i := 0; i < 100; i++ {
        if limiter.Allow() {
            fmt.Printf("Request %d allowed at %s\n", i, time.Now().Format("15:04:05"))
        } else {
            fmt.Printf("Request %d denied at %s\n", i, time.Now().Format("15:04:05"))
        }
        
        time.Sleep(100 * time.Millisecond)
    }
}
```

This adaptive approach:
- Adjusts rate limits based on system load
- Reduces limits when the system is under heavy load
- Increases limits when the system has more capacity
- Ensures a minimum throughput even under extreme load

### Load-based automatic scaling

A more sophisticated approach might determine load automatically based on system metrics:

```go
package main

import (
    "fmt"
    "runtime"
    "sync"
    "time"
    "golang.org/x/time/rate"
)

// SystemMetrics collects system metrics
type SystemMetrics struct {
    cpuUsage    float64
    memoryUsage float64
    latency     time.Duration
    mu          sync.Mutex
}

func NewSystemMetrics() *SystemMetrics {
    sm := &SystemMetrics{}
    
    // Start a goroutine to collect metrics
    go sm.collectMetrics()
    
    return sm
}

// collectMetrics periodically collects system metrics
func (sm *SystemMetrics) collectMetrics() {
    ticker := time.NewTicker(1 * time.Second)
    defer ticker.Stop()
    
    var memStats runtime.MemStats
    
    for range ticker.C {
        // Collect CPU usage (this is a simplified simulation)
        // In a real system, you'd measure actual CPU time
        cpuUsage := float64(runtime.NumGoroutine()) / 1000.0
        if cpuUsage > 1.0 {
            cpuUsage = 1.0
        }
        
        // Collect memory usage
        runtime.ReadMemStats(&memStats)
        memoryUsage := float64(memStats.Alloc) / float64(memStats.Sys)
        
        sm.mu.Lock()
        sm.cpuUsage = cpuUsage
        sm.memoryUsage = memoryUsage
        sm.mu.Unlock()
        
        fmt.Printf("System metrics - CPU: %.2f, Memory: %.2f\n", cpuUsage, memoryUsage)
    }
}

// GetLoad calculates a combined load factor
func (sm *SystemMetrics) GetLoad() float64 {
    sm.mu.Lock()
    defer sm.mu.Unlock()
    
    // Weight CPU more heavily than memory
    return 0.7*sm.cpuUsage + 0.3*sm.memoryUsage
}

// UpdateLatency updates the request latency metric
func (sm *SystemMetrics) UpdateLatency(latency time.Duration) {
    sm.mu.Lock()
    defer sm.mu.Unlock()
    
    // Simple exponential moving average with alpha=0.2
    if sm.latency == 0 {
        sm.latency = latency
    } else {
        sm.latency = time.Duration(0.8*float64(sm.latency) + 0.2*float64(latency))
    }
    
    fmt.Printf("Updated request latency: %v\n", sm.latency)
}

// AutoScalingRateLimiter adjusts limits based on system metrics
type AutoScalingRateLimiter struct {
    limiter      *rate.Limiter
    metrics      *SystemMetrics
    baseLimit    rate.Limit
    baseBurst    int
    mu           sync.Mutex
}

func NewAutoScalingRateLimiter(baseLimit rate.Limit, baseBurst int) *AutoScalingRateLimiter {
    metrics := NewSystemMetrics()
    
    arl := &AutoScalingRateLimiter{
        limiter:   rate.NewLimiter(baseLimit, baseBurst),
        metrics:   metrics,
        baseLimit: baseLimit,
        baseBurst: baseBurst,
    }
    
    // Start a goroutine to periodically adjust limits
    go arl.adjustLimitsLoop()
    
    return arl
}

// adjustLimitsLoop periodically adjusts rate limits based on system metrics
func (arl *AutoScalingRateLimiter) adjustLimitsLoop() {
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()
    
    for range ticker.C {
        // Get current system load
        load := arl.metrics.GetLoad()
        
        arl.mu.Lock()
        
        // Calculate new limit based on load
        // As load increases, limit decreases
        loadFactor := 1.0 - load
        if loadFactor < 0.1 {
            loadFactor = 0.1  // Never reduce below 10% of base capacity
        }
        
        newLimit := arl.baseLimit * rate.Limit(loadFactor)
        newBurst := int(float64(arl.baseBurst) * loadFactor)
        
        // Ensure minimum values
        if newLimit < 1 {
            newLimit = 1
        }
        if newBurst < 1 {
            newBurst = 1
        }
        
        // Update the limiter
        arl.limiter.SetLimit(newLimit)
        arl.limiter.SetBurst(newBurst)
        
        fmt.Printf("Auto-adjusted rate limits - Load: %.2f, New limit: %.2f/s, New burst: %d\n", 
            load, float64(newLimit), newBurst)
        
        arl.mu.Unlock()
    }
}

// Allow checks if a request is allowed and updates metrics
func (arl *AutoScalingRateLimiter) Allow() bool {
    start := time.Now()
    result := arl.limiter.Allow()
    latency := time.Since(start)
    
    // Update latency metric
    arl.metrics.UpdateLatency(latency)
    
    return result
}

func main() {
    // Create an auto-scaling limiter with base rate of 100 req/s
    limiter := NewAutoScalingRateLimiter(rate.Limit(100), 20)
    
    // Simulate a workload that changes over time
    for i := 0; i < 100; i++ {
        // Create more goroutines to simulate increased load
        if i > 50 && i < 80 {
            for j := 0; j < 10; j++ {
                go func() {
                    time.Sleep(500 * time.Millisecond)
                }()
            }
        }
        
        if limiter.Allow() {
            fmt.Printf("Request %d allowed at %s\n", i, time.Now().Format("15:04:05"))
        } else {
            fmt.Printf("Request %d denied at %s\n", i, time.Now().Format("15:04:05"))
        }
        
        time.Sleep(10 * time.Millisecond)
    }
}
```

This auto-scaling approach:
- Collects real system metrics (CPU, memory, request latency)
- Automatically adjusts rate limits based on current load
- Uses a weighted approach to combine different metrics
- Ensures minimum throughput levels
- Updates metrics based on actual request processing

## Advanced Patterns: Rate Limiting by Multiple Dimensions

Sometimes you need to rate limit across multiple dimensions simultaneously. For example, limiting by user, by IP, and by API endpoint:

```go
package main

import (
    "fmt"
    "net/http"
    "sync"
    "golang.org/x/time/rate"
)

// MultiDimensionalRateLimiter implements rate limiting across multiple dimensions
type MultiDimensionalRateLimiter struct {
    // Map of dimension name to map of key to limiter
    dimensions map[string]map[string]*rate.Limiter
    config     map[string]struct {
        limit rate.Limit
        burst int
    }
    mu         sync.Mutex
}

func NewMultiDimensionalRateLimiter() *MultiDimensionalRateLimiter {
    mdrl := &MultiDimensionalRateLimiter{
        dimensions: make(map[string]map[string]*rate.Limiter),
        config: map[string]struct {
            limit rate.Limit
            burst int
        }{
            "ip":      {rate.Limit(10), 20},  // 10 req/s per IP
            "user":    {rate.Limit(5), 10},   // 5 req/s per user
            "endpoint": {rate.Limit(100), 200}, // 100 req/s per endpoint
        },
    }
    
    // Initialize maps for each dimension
    for dim := range mdrl.config {
        mdrl.dimensions[dim] = make(map[string]*rate.Limiter)
    }
    
    return mdrl
}

// getLimiter gets or creates a limiter for a specific dimension and key
func (m *MultiDimensionalRateLimiter) getLimiter(dimension, key string) *rate.Limiter {
    m.mu.Lock()
    defer m.mu.Unlock()
    
    // Check if dimension exists
    if _, exists := m.dimensions[dimension]; !exists {
        return nil // Invalid dimension
    }
    
    // Check if limiter for this key exists
    if limiter, exists := m.dimensions[dimension][key]; exists {
        return limiter
    }
    
    // Create new limiter with config for this dimension
    config := m.config[dimension]
    limiter := rate.NewLimiter(config.limit, config.burst)
    m.dimensions[dimension][key] = limiter
    
    return limiter
}

// Allow checks if a request is allowed across all dimensions
func (m *MultiDimensionalRateLimiter) Allow(ip, userID, endpoint string) bool {
    // Check each dimension
    dimensionsData := map[string]string{
        "ip":       ip,
        "user":     userID,
        "endpoint": endpoint,
    }
    
    for dim, key := range dimensionsData {
        // Skip empty keys
        if key == "" {
            continue
        }
        
        limiter := m.getLimiter(dim, key)
        if limiter == nil {
            continue // Skip invalid dimensions
        }
        
        if !limiter.Allow() {
            fmt.Printf("Rate limit exceeded for dimension %s, key %s\n", dim, key)
            return false
        }
    }
    
    return true
}

// Middleware for HTTP
func MultiDimensionalRateLimitMiddleware(limiter *MultiDimensionalRateLimiter) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Extract dimensions from request
            ip := r.RemoteAddr
            userID := r.Header.Get("X-User-ID") // Assuming auth is handled elsewhere
            endpoint := r.URL.Path
            
            // Check rate limits
            if !limiter.Allow(ip, userID, endpoint) {
                http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
                return
            }
            
            // Continue to the next handler
            next.ServeHTTP(w, r)
        })
    }
}

func main() {
    // Create a multi-dimensional rate limiter
    limiter := NewMultiDimensionalRateLimiter()
    
    // Create a simple handler
    helloHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello, World!"))
    })
    
    // Apply the rate limiting middleware
    http.Handle("/api", MultiDimensionalRateLimitMiddleware(limiter)(helloHandler))
    
    // Start the server
    http.ListenAndServe(":8080", nil)
}
```

This multi-dimensional approach:
- Limits requests across multiple dimensions simultaneously
- Has different limits for different dimensions
- Rejects requests if any dimension's limit is exceeded
- Provides clear feedback about which dimension caused the limit to be exceeded

## Hierarchical Rate Limiting

Sometimes you need rate limits at multiple levels of granularity:

```go
package main

import (
    "fmt"
    "net/http"
    "sync"
    "golang.org/x/time/rate"
)

// HierarchicalRateLimiter implements rate limiting at multiple levels
type HierarchicalRateLimiter struct {
    // Global limiter
    globalLimiter *rate.Limiter
    
    // Service-level limiters
    serviceLimiters map[string]*rate.Limiter
    serviceConfig   struct {
        limit rate.Limit
        burst int
    }
    
    // User-level limiters within services
    userLimiters map[string]map[string]*rate.Limiter
    userConfig   struct {
        limit rate.Limit
        burst int
    }
    
    mu sync.Mutex
}

func NewHierarchicalRateLimiter(
    globalLimit rate.Limit, globalBurst int,
    serviceLimit rate.Limit, serviceBurst int,
    userLimit rate.Limit, userBurst int,
) *HierarchicalRateLimiter {
    return &HierarchicalRateLimiter{
        globalLimiter: rate.NewLimiter(globalLimit, globalBurst),
        serviceLimiters: make(map[string]*rate.Limiter),
        serviceConfig: struct {
            limit rate.Limit
            burst int
        }{
            limit: serviceLimit,
            burst: serviceBurst,
        },
        userLimiters: make(map[string]map[string]*rate.Limiter),
        userConfig: struct {
            limit rate.Limit
            burst int
        }{
            limit: userLimit,
            burst: userBurst,
        },
    }
}

// getServiceLimiter gets or creates a limiter for a service
func (h *HierarchicalRateLimiter) getServiceLimiter(service string) *rate.Limiter {
    h.mu.Lock()
    defer h.mu.Unlock()
    
    if limiter, exists := h.serviceLimiters[service]; exists {
        return limiter
    }
    
    limiter := rate.NewLimiter(h.serviceConfig.limit, h.serviceConfig.burst)
    h.serviceLimiters[service] = limiter
    return limiter
}

// getUserLimiter gets or creates a limiter for a user within a service
func (h *HierarchicalRateLimiter) getUserLimiter(service, userID string) *rate.Limiter {
    h.mu.Lock()
    defer h.mu.Unlock()
    
    // Create service map if it doesn't exist
    if _, exists := h.userLimiters[service]; !exists {
        h.userLimiters[service] = make(map[string]*rate.Limiter)
    }
    
    // Check if user limiter exists
    if limiter, exists := h.userLimiters[service][userID]; exists {
        return limiter
    }
    
    // Create new user limiter
    limiter := rate.NewLimiter(h.userConfig.limit, h.userConfig.burst)
    h.userLimiters[service][userID] = limiter
    return limiter
}

// Allow checks if a request is allowed through all hierarchy levels
func (h *HierarchicalRateLimiter) Allow(service, userID string) (bool, string) {
    // Check global limit first
    if !h.globalLimiter.Allow() {
        return false, "global limit exceeded"
    }
    
    // Check service limit
    serviceLimiter := h.getServiceLimiter(service)
    if !serviceLimiter.Allow() {
        return false, fmt.Sprintf("service limit exceeded for %s", service)
    }
    
    // Check user limit if userID is provided
    if userID != "" {
        userLimiter := h.getUserLimiter(service, userID)
        if !userLimiter.Allow() {
            return false, fmt.Sprintf("user limit exceeded for user %s in service %s", userID, service)
        }
    }
    
    return true, ""
}

// Middleware for HTTP
func HierarchicalRateLimitMiddleware(limiter *HierarchicalRateLimiter) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Extract service and user from request
            service := r.URL.Path
            userID := r.Header.Get("X-User-ID")
            
            // Check rate limits
            allowed, reason := limiter.Allow(service, userID)
            if !allowed {
                http.Error(w, fmt.Sprintf("Too Many Requests: %s", reason), http.StatusTooManyRequests)
                return
            }
            
            // Continue to the next handler
            next.ServeHTTP(w, r)
        })
    }
}

func main() {
    // Create hierarchical rate limiter with:
    // - 1000 req/s global limit
    // - 100 req/s per service
    // - 10 req/s per user per service
    limiter := NewHierarchicalRateLimiter(
        rate.Limit(1000), 2000, // Global
        rate.Limit(100), 200,   // Service
        rate.Limit(10), 20,     // User
    )
    
    // Create a simple handler
    helloHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("Hello, World!"))
    })
    
    // Apply the rate limiting middleware
    http.Handle("/api/", HierarchicalRateLimitMiddleware(limiter)(helloHandler))
    
    // Start the server
    http.ListenAndServe(":8080", nil)
}
```

This hierarchical approach:
- Applies rate limiting at multiple levels (global, service, user)
- Allows for different limits at each level
- Provides clear feedback about which level caused the rejection
- Maintains separation of concerns between different hierarchical levels

## Rate Limiting with Queueing

Sometimes instead of rejecting requests, you might want to queue them:

```go
package main

import (
    "context"
    "fmt"
    "sync"
    "time"
    "golang.org/x/time/rate"
)

// QueuedRateLimiter queues requests instead of rejecting them
type QueuedRateLimiter struct {
    limiter     *rate.Limiter
    queue       chan struct{}
    maxQueueLen int
    queueLen    int
    mu          sync.Mutex
}

func NewQueuedRateLimiter(rps rate.Limit, burst, maxQueueLen int) *QueuedRateLimiter {
    return &QueuedRateLimiter{
        limiter:     rate.NewLimiter(rps, burst),
        queue:       make(chan struct{}, maxQueueLen),
        maxQueueLen: maxQueueLen,
    }
}

// TryEnqueue tries to enqueue a request
func (q *QueuedRateLimiter) TryEnqueue() bool {
    q.mu.Lock()
    defer q.mu.Unlock()
    
    if q.queueLen >= q.maxQueueLen {
        return false
    }
    
    q.queueLen++
    go func() {
        q.queue <- struct{}{}
    }()
    
    return true
}

// Process processes queued requests according to rate limits
func (q *QueuedRateLimiter) Process(ctx context.Context, handler func()) {
    go func() {
        for {
            select {
            case <-ctx.Done():
                return
            case <-q.queue:
                q.mu.Lock()
                q.queueLen--
                q.mu.Unlock()
                
                if err := q.limiter.Wait(ctx); err != nil {
                    fmt.Printf("Error waiting for rate limit: %v\n", err)
                    continue
                }
                
                handler()
            }
        }
    }()
}

// GetQueueLength returns the current queue length
func (q *QueuedRateLimiter) GetQueueLength() int {
    q.mu.Lock()
    defer q.mu.Unlock()
    return q.queueLen
}

func main() {
    // Create a queued rate limiter with:
    // - 2 requests per second
    // - Burst of 1
    // - Maximum queue length of 10
    limiter := NewQueuedRateLimiter(rate.Limit(2), 1, 10)
    
    // Start processing queue
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    
    limiter.Process(ctx, func() {
        fmt.Printf("Processing request at %s\n", time.Now().Format("15:04:05.000"))
    })
    
    // Enqueue requests
    for i := 0; i < 20; i++ {
        if limiter.TryEnqueue() {
            fmt.Printf("Request %d enqueued, queue length: %d\n", i, limiter.GetQueueLength())
        } else {
            fmt.Printf("Request %d rejected, queue full\n", i)
        }
        
        time.Sleep(100 * time.Millisecond)
    }
    
    // Wait for queue to empty
    for limiter.GetQueueLength() > 0 {
        fmt.Printf("Waiting for queue to empty, current length: %d\n", limiter.GetQueueLength())
        time.Sleep(1 * time.Second)
    }
}
```

This queueing approach:
- Enqueues requests instead of rejecting them
- Processes the queue at the configured rate
- Has a maximum queue length to prevent unbounded memory growth
- Provides feedback about queue length

## Conclusion

Rate limiting is a critical technique for building resilient and fair distributed systems in Go. We've explored multiple algorithms and implementation patterns, from the simple token bucket to sophisticated adaptive and hierarchical approaches.

Key takeaways:

1. **Different Algorithms for Different Needs**:
   - Token Bucket: Good for bursty traffic
   - Leaky Bucket: Good for consistent throughput
   - Fixed Window: Simple but can lead to edge spikes
   - Sliding Window: More accurate but more complex

2. **Go's Built-in Solutions**:
   - The `golang.org/x/time/rate` package provides a robust token bucket implementation
   - It offers methods for allowing, waiting, or reserving tokens

3. **Advanced Patterns**:
   - Multi-dimensional limiting
   - Hierarchical limiting
   - Adaptive limiting based on system load
   - Queueing instead of rejecting

4. **Integration Approaches**:
   - HTTP middleware for API rate limiting
   - Client-side limiting for external service calls
   - Distributed limiting with Redis or similar

When implementing rate limiting in Go, consider:
- The specific traffic patterns you expect
- The granularity of control you need
- The performance characteristics required
- Whether you need distributed coordination

By understanding these fundamental concepts and implementation patterns, you can build rate limiting systems that protect your services while providing fair and predictable access to your users.