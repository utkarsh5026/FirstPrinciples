# Understanding Go Testing with Context from First Principles

I'll explain Go's testing with context from the ground up, building our understanding layer by layer with practical examples along the way.

## 1. What is Context in Go?

Before diving into testing with context, let's understand what context is in Go and why it exists.

At its most fundamental level, context in Go is a way to carry deadlines, cancellation signals, and request-scoped values across API boundaries and between processes. It was created to solve several critical problems in concurrent programming:

1. **Cancellation propagation** : How do you tell all parts of a program that they should stop what they're doing?
2. **Deadline management** : How do you ensure operations don't run longer than allowed?
3. **Request-scoped data** : How do you attach values to a specific operation as it moves through your system?

The `context.Context` interface defines four primary methods:

```go
type Context interface {
    Deadline() (deadline time.Time, ok bool)
    Done() <-chan struct{}
    Err() error
    Value(key interface{}) interface{}
}
```

Let's explore each method:

* `Deadline()` returns when the context will be canceled (if a deadline is set)
* `Done()` returns a channel that's closed when the context is canceled
* `Err()` returns the reason why the context was canceled (if it was)
* `Value()` retrieves values associated with a key from the context

## 2. Testing Fundamentals in Go

Go has a built-in testing framework in the `testing` package. Tests are functions that:

* Are in files whose names end with `_test.go`
* Begin with the word `Test` followed by a capitalized word
* Take a pointer to `testing.T` as their only parameter

A simple example:

```go
// simple_test.go
package mypackage

import "testing"

func TestAddition(t *testing.T) {
    sum := 2 + 3
    expected := 5
    if sum != expected {
        t.Errorf("Expected %d but got %d", expected, sum)
    }
}
```

Running this test is as simple as:

```
go test
```

## 3. Why Testing with Context?

Now, why would we want to combine testing with context? When you're building systems, especially services or applications that deal with:

1. **Network operations** that might time out
2. **Long-running processes** that need cancellation
3. **Request-scoped values** that need to be passed around
4. **Concurrent operations** that might need coordination

Testing these behaviors correctly requires the ability to control timeouts, cancellation, and contextual values, which is exactly what context provides.

## 4. Basic Context Testing Examples

Let's start with a simple function that uses context:

```go
// operations.go
package operations

import (
    "context"
    "errors"
    "time"
)

// ProcessWithTimeout simulates a process that might take too long
func ProcessWithTimeout(ctx context.Context) (string, error) {
    // Simulate work that takes time
    select {
    case <-time.After(200 * time.Millisecond):
        return "Processing complete", nil
    case <-ctx.Done():
        return "", errors.New("processing canceled: " + ctx.Err().Error())
    }
}
```

Now, let's test this function:

```go
// operations_test.go
package operations

import (
    "context"
    "testing"
    "time"
)

func TestProcessWithTimeout(t *testing.T) {
    // Test with sufficient time - should succeed
    t.Run("With sufficient time", func(t *testing.T) {
        // Create a context with a timeout longer than our operation needs
        ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
        defer cancel() // Always remember to cancel to prevent resource leaks
      
        result, err := ProcessWithTimeout(ctx)
      
        if err != nil {
            t.Errorf("Expected no error but got: %v", err)
        }
      
        if result != "Processing complete" {
            t.Errorf("Expected 'Processing complete' but got: %s", result)
        }
    })
  
    // Test with insufficient time - should timeout
    t.Run("With timeout", func(t *testing.T) {
        // Create a context with a timeout shorter than our operation needs
        ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
        defer cancel()
      
        result, err := ProcessWithTimeout(ctx)
      
        if err == nil {
            t.Error("Expected timeout error but got none")
        }
      
        if result != "" {
            t.Errorf("Expected empty result but got: %s", result)
        }
    })
}
```

In this example:

1. We're testing our function with two different contexts
2. One allows sufficient time for the operation to complete
3. The other has a timeout that triggers before completion
4. We verify the behavior in both cases

## 5. Testing Context Values

Context can also carry values. Let's create a function that uses context values:

```go
// auth.go
package auth

import (
    "context"
    "errors"
)

// Key type for context values to avoid collisions
type contextKey string

// Define keys for our context values
const UserIDKey = contextKey("user_id")

// RequireAuthentication checks if a valid user ID exists in the context
func RequireAuthentication(ctx context.Context) (string, error) {
    userID, ok := ctx.Value(UserIDKey).(string)
    if !ok || userID == "" {
        return "", errors.New("authentication required")
    }
    return userID, nil
}
```

Now, let's test this function:

```go
// auth_test.go
package auth

import (
    "context"
    "testing"
)

func TestRequireAuthentication(t *testing.T) {
    // Test with authenticated context
    t.Run("With authenticated user", func(t *testing.T) {
        // Create a context with a user ID
        ctx := context.WithValue(context.Background(), UserIDKey, "user-123")
      
        userID, err := RequireAuthentication(ctx)
      
        if err != nil {
            t.Errorf("Expected no error but got: %v", err)
        }
      
        if userID != "user-123" {
            t.Errorf("Expected user-123 but got: %s", userID)
        }
    })
  
    // Test with unauthenticated context
    t.Run("Without authenticated user", func(t *testing.T) {
        // Create a context without a user ID
        ctx := context.Background()
      
        userID, err := RequireAuthentication(ctx)
      
        if err == nil {
            t.Error("Expected authentication error but got none")
        }
      
        if userID != "" {
            t.Errorf("Expected empty user ID but got: %s", userID)
        }
    })
}
```

In this test, we're:

1. Creating a context with an authenticated user value
2. Creating a context without authentication
3. Verifying our function behaves correctly in both cases

## 6. Testing Cancellation Propagation

A key feature of context is cancellation propagation. Let's test that:

```go
// worker.go
package worker

import (
    "context"
    "time"
)

// DoWork simulates a long-running job that can be canceled
func DoWork(ctx context.Context, jobs []string) []string {
    results := []string{}
  
    for _, job := range jobs {
        select {
        case <-ctx.Done():
            // Context was canceled, stop processing more jobs
            return results
        default:
            // Process this job
            time.Sleep(50 * time.Millisecond) // Simulate work
            results = append(results, "Processed: "+job)
        }
    }
  
    return results
}
```

Now, let's test this function:

```go
// worker_test.go
package worker

import (
    "context"
    "testing"
    "time"
)

func TestDoWork(t *testing.T) {
    jobs := []string{"job1", "job2", "job3", "job4", "job5"}
  
    // Test with no cancellation - should process all jobs
    t.Run("Without cancellation", func(t *testing.T) {
        ctx := context.Background()
        results := DoWork(ctx, jobs)
      
        if len(results) != len(jobs) {
            t.Errorf("Expected %d results but got %d", len(jobs), len(results))
        }
    })
  
    // Test with cancellation - should process only some jobs
    t.Run("With cancellation", func(t *testing.T) {
        // Create a context that we'll cancel manually
        ctx, cancel := context.WithCancel(context.Background())
      
        // Start the work in a goroutine
        resultChan := make(chan []string)
        go func() {
            resultChan <- DoWork(ctx, jobs)
        }()
      
        // Wait a bit and then cancel the context
        time.Sleep(125 * time.Millisecond) // Should allow ~2 jobs to complete
        cancel()
      
        // Get the results
        results := <-resultChan
      
        // We expect some but not all jobs to be processed
        if len(results) == 0 {
            t.Error("Expected some results but got none")
        }
      
        if len(results) == len(jobs) {
            t.Error("Expected partial results but all jobs were processed")
        }
    })
}
```

In this example:

1. We have a worker that processes jobs sequentially
2. We test the full execution without cancellation
3. We test partial execution with a manual cancellation
4. We verify that cancellation stops the processing early

## 7. Testing with Context in HTTP Handlers

A common use case for context in Go is with HTTP handlers. Let's create a handler that uses context:

```go
// handlers.go
package handlers

import (
    "context"
    "encoding/json"
    "net/http"
    "time"
)

// UserKey is the context key for the user ID
type contextKey string
const UserKey = contextKey("user")

// GetUserData simulates retrieving user data with a possible timeout
func GetUserData(ctx context.Context, userID string) (map[string]string, error) {
    // Create a database query that respects our context
    dbCtx, cancel := context.WithTimeout(ctx, 200*time.Millisecond)
    defer cancel()
  
    // Simulate a database query
    select {
    case <-time.After(150 * time.Millisecond):
        // Query completed
        return map[string]string{
            "id": userID,
            "name": "John Doe",
            "email": "john@example.com",
        }, nil
    case <-dbCtx.Done():
        // Query timed out or was canceled
        return nil, dbCtx.Err()
    }
}

// UserHandler serves user data
func UserHandler(w http.ResponseWriter, r *http.Request) {
    // Extract user ID from request
    userID := r.URL.Query().Get("id")
    if userID == "" {
        http.Error(w, "Missing user ID", http.StatusBadRequest)
        return
    }
  
    // Use the request's context for our database query
    userData, err := GetUserData(r.Context(), userID)
    if err != nil {
        http.Error(w, "Failed to get user data: "+err.Error(), http.StatusInternalServerError)
        return
    }
  
    // Return the user data as JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(userData)
}
```

Now, let's test this handler:

```go
// handlers_test.go
package handlers

import (
    "context"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    "time"
)

func TestUserHandler(t *testing.T) {
    // Test with normal context - should succeed
    t.Run("Normal request", func(t *testing.T) {
        // Create a test request with a user ID
        req, err := http.NewRequest("GET", "/user?id=123", nil)
        if err != nil {
            t.Fatal(err)
        }
      
        // Create a ResponseRecorder to record the response
        rr := httptest.NewRecorder()
      
        // Call the handler
        UserHandler(rr, req)
      
        // Check the status code
        if status := rr.Code; status != http.StatusOK {
            t.Errorf("Expected status %d but got %d", http.StatusOK, status)
        }
      
        // Check the response body
        var userData map[string]string
        if err := json.Unmarshal(rr.Body.Bytes(), &userData); err != nil {
            t.Fatal(err)
        }
      
        if userData["id"] != "123" {
            t.Errorf("Expected user ID 123 but got %s", userData["id"])
        }
    })
  
    // Test with a context that times out quickly
    t.Run("Context timeout", func(t *testing.T) {
        // Create a test request with a user ID
        req, err := http.NewRequest("GET", "/user?id=123", nil)
        if err != nil {
            t.Fatal(err)
        }
      
        // Add a context with a short timeout
        ctx, cancel := context.WithTimeout(req.Context(), 50*time.Millisecond)
        defer cancel()
        req = req.WithContext(ctx)
      
        // Create a ResponseRecorder to record the response
        rr := httptest.NewRecorder()
      
        // Call the handler
        UserHandler(rr, req)
      
        // Check the status code - should be an error
        if status := rr.Code; status != http.StatusInternalServerError {
            t.Errorf("Expected status %d but got %d", http.StatusInternalServerError, status)
        }
    })
}
```

In this test:

1. We create an HTTP handler that uses context for timeouts
2. We test with a normal request that should succeed
3. We test with a request that has a short timeout
4. We verify correct behavior in both cases

## 8. Table-Driven Tests with Context

Go developers often use table-driven tests. Here's how to combine them with context:

```go
// calculator.go
package calculator

import (
    "context"
    "errors"
    "time"
)

// Calculate does a "complex" calculation that might take time
func Calculate(ctx context.Context, a, b int, op string) (int, error) {
    // Simulate complex calculation
    select {
    case <-time.After(100 * time.Millisecond):
        switch op {
        case "add":
            return a + b, nil
        case "subtract":
            return a - b, nil
        case "multiply":
            return a * b, nil
        case "divide":
            if b == 0 {
                return 0, errors.New("division by zero")
            }
            return a / b, nil
        default:
            return 0, errors.New("unknown operation")
        }
    case <-ctx.Done():
        return 0, ctx.Err()
    }
}
```

Now, let's use table-driven tests:

```go
// calculator_test.go
package calculator

import (
    "context"
    "testing"
    "time"
)

func TestCalculate(t *testing.T) {
    // Define test cases
    tests := []struct {
        name       string
        a, b       int
        op         string
        timeout    time.Duration
        wantResult int
        wantErr    bool
    }{
        {
            name:       "Addition with enough time",
            a:          5, 
            b:          3,
            op:         "add",
            timeout:    200 * time.Millisecond,
            wantResult: 8,
            wantErr:    false,
        },
        {
            name:       "Subtraction with enough time",
            a:          5,
            b:          3,
            op:         "subtract",
            timeout:    200 * time.Millisecond,
            wantResult: 2,
            wantErr:    false,
        },
        {
            name:       "Multiplication with timeout",
            a:          5,
            b:          3,
            op:         "multiply",
            timeout:    50 * time.Millisecond, // Not enough time
            wantResult: 0,
            wantErr:    true,
        },
        {
            name:       "Division by zero",
            a:          5,
            b:          0,
            op:         "divide",
            timeout:    200 * time.Millisecond,
            wantResult: 0,
            wantErr:    true,
        },
    }
  
    // Run test cases
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Create context with the specified timeout
            ctx, cancel := context.WithTimeout(context.Background(), tt.timeout)
            defer cancel()
          
            // Perform calculation
            result, err := Calculate(ctx, tt.a, tt.b, tt.op)
          
            // Check error
            if (err != nil) != tt.wantErr {
                t.Errorf("Calculate() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
          
            // If no error, check result
            if err == nil && result != tt.wantResult {
                t.Errorf("Calculate() = %v, want %v", result, tt.wantResult)
            }
        })
    }
}
```

In this example:

1. We define a table of test cases with different inputs and timeouts
2. Each case runs with its own context and timeout
3. We verify the results against expected outcomes

## 9. Testing Middleware with Context

Middleware often uses context to pass values down the request chain. Let's test that:

```go
// middleware.go
package middleware

import (
    "context"
    "net/http"
)

// Key type for context values
type contextKey string

// Define keys
const RequestIDKey = contextKey("request_id")

// RequestIDMiddleware adds a request ID to the context
func RequestIDMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Get request ID from header or generate one
        requestID := r.Header.Get("X-Request-ID")
        if requestID == "" {
            requestID = "generated-id-12345" // In real code, generate a UUID
        }
      
        // Create a new context with the request ID
        ctx := context.WithValue(r.Context(), RequestIDKey, requestID)
      
        // Call the next handler with the updated context
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

// GetRequestID extracts the request ID from the context
func GetRequestID(ctx context.Context) string {
    requestID, _ := ctx.Value(RequestIDKey).(string)
    return requestID
}
```

Now, let's test this middleware:

```go
// middleware_test.go
package middleware

import (
    "context"
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestRequestIDMiddleware(t *testing.T) {
    // Test with provided request ID
    t.Run("With header", func(t *testing.T) {
        // Create a request with a request ID header
        req, err := http.NewRequest("GET", "/", nil)
        if err != nil {
            t.Fatal(err)
        }
        req.Header.Set("X-Request-ID", "test-id-123")
      
        // Create a response recorder
        rr := httptest.NewRecorder()
      
        // Create a handler that checks the context
        var requestIDFromContext string
        handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            requestIDFromContext = GetRequestID(r.Context())
            w.WriteHeader(http.StatusOK)
        })
      
        // Apply our middleware to the handler
        middlewareHandler := RequestIDMiddleware(handler)
      
        // Call the handler
        middlewareHandler.ServeHTTP(rr, req)
      
        // Check the context value was set correctly
        if requestIDFromContext != "test-id-123" {
            t.Errorf("Expected request ID test-id-123 but got %s", requestIDFromContext)
        }
    })
  
    // Test without provided request ID
    t.Run("Without header", func(t *testing.T) {
        // Create a request without a request ID header
        req, err := http.NewRequest("GET", "/", nil)
        if err != nil {
            t.Fatal(err)
        }
      
        // Create a response recorder
        rr := httptest.NewRecorder()
      
        // Create a handler that checks the context
        var requestIDFromContext string
        handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            requestIDFromContext = GetRequestID(r.Context())
            w.WriteHeader(http.StatusOK)
        })
      
        // Apply our middleware to the handler
        middlewareHandler := RequestIDMiddleware(handler)
      
        // Call the handler
        middlewareHandler.ServeHTTP(rr, req)
      
        // Check that a request ID was generated
        if requestIDFromContext == "" {
            t.Error("Expected a generated request ID but got none")
        }
    })
}
```

In this test:

1. We create middleware that adds a value to the request context
2. We test with a provided request ID header
3. We test without a header to ensure one is generated
4. We verify the context is updated correctly in both cases

## 10. Testing Context with Mocks and Interfaces

In real-world applications, we often use interfaces and mocks. Let's see how to test with context in this scenario:

```go
// database.go
package database

import (
    "context"
    "errors"
)

// User represents a user in our system
type User struct {
    ID    string
    Name  string
    Email string
}

// Repository defines database operations
type Repository interface {
    GetUser(ctx context.Context, id string) (*User, error)
    SaveUser(ctx context.Context, user *User) error
}

// UserService provides user operations
type UserService struct {
    repo Repository
}

// NewUserService creates a new user service
func NewUserService(repo Repository) *UserService {
    return &UserService{repo: repo}
}

// GetUser retrieves a user by ID
func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    // Check if context is already canceled
    if ctx.Err() != nil {
        return nil, ctx.Err()
    }
  
    // Get user from repository
    user, err := s.repo.GetUser(ctx, id)
    if err != nil {
        return nil, err
    }
  
    return user, nil
}

// CreateUser creates a new user
func (s *UserService) CreateUser(ctx context.Context, name, email string) (*User, error) {
    // Check if context is already canceled
    if ctx.Err() != nil {
        return nil, ctx.Err()
    }
  
    // Create user
    user := &User{
        ID:    "user-" + name, // In real code, generate a UUID
        Name:  name,
        Email: email,
    }
  
    // Save user to repository
    if err := s.repo.SaveUser(ctx, user); err != nil {
        return nil, err
    }
  
    return user, nil
}
```

Now, let's create a mock and test our service:

```go
// database_test.go
package database

import (
    "context"
    "errors"
    "testing"
    "time"
)

// MockRepository is a mock implementation of Repository
type MockRepository struct {
    users map[string]*User
    delay time.Duration // Simulate database delay
}

// NewMockRepository creates a new mock repository
func NewMockRepository(delay time.Duration) *MockRepository {
    return &MockRepository{
        users: make(map[string]*User),
        delay: delay,
    }
}

// GetUser retrieves a user by ID
func (m *MockRepository) GetUser(ctx context.Context, id string) (*User, error) {
    // Simulate database delay
    select {
    case <-time.After(m.delay):
        // Database operation completed
        user, found := m.users[id]
        if !found {
            return nil, errors.New("user not found")
        }
        return user, nil
    case <-ctx.Done():
        // Context was canceled
        return nil, ctx.Err()
    }
}

// SaveUser saves a user
func (m *MockRepository) SaveUser(ctx context.Context, user *User) error {
    // Simulate database delay
    select {
    case <-time.After(m.delay):
        // Database operation completed
        m.users[user.ID] = user
        return nil
    case <-ctx.Done():
        // Context was canceled
        return ctx.Err()
    }
}

func TestUserService(t *testing.T) {
    // Test Get and Create operations
    t.Run("Normal operations", func(t *testing.T) {
        // Create a mock repository with a small delay
        repo := NewMockRepository(50 * time.Millisecond)
        service := NewUserService(repo)
      
        // Create a context with sufficient timeout
        ctx, cancel := context.WithTimeout(context.Background(), 500*time.Millisecond)
        defer cancel()
      
        // Create a user
        user, err := service.CreateUser(ctx, "john", "john@example.com")
        if err != nil {
            t.Fatalf("Failed to create user: %v", err)
        }
      
        // Get the user
        retrievedUser, err := service.GetUser(ctx, user.ID)
        if err != nil {
            t.Fatalf("Failed to get user: %v", err)
        }
      
        // Check user data
        if retrievedUser.Name != "john" {
            t.Errorf("Expected name john but got %s", retrievedUser.Name)
        }
    })
  
    // Test with a context that expires quickly
    t.Run("Context timeout", func(t *testing.T) {
        // Create a mock repository with a large delay
        repo := NewMockRepository(200 * time.Millisecond)
        service := NewUserService(repo)
      
        // Create a context with insufficient timeout
        ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
        defer cancel()
      
        // Try to create a user - should timeout
        _, err := service.CreateUser(ctx, "john", "john@example.com")
        if err == nil {
            t.Fatal("Expected timeout error but got none")
        }
    })
  
    // Test with canceled context
    t.Run("Context canceled", func(t *testing.T) {
        // Create a mock repository
        repo := NewMockRepository(100 * time.Millisecond)
        service := NewUserService(repo)
      
        // Create a context that we'll cancel manually
        ctx, cancel := context.WithCancel(context.Background())
      
        // Cancel the context immediately
        cancel()
      
        // Try to get a user - should fail
        _, err := service.GetUser(ctx, "any-id")
        if err == nil {
            t.Fatal("Expected context canceled error but got none")
        }
    })
}
```

In this example:

1. We define a service that uses a repository interface
2. We create a mock implementation that respects context
3. We test normal operations, timeouts, and cancellation
4. We verify correct behavior in all cases

## Conclusion

Testing with context in Go involves understanding several key concepts:

1. **Context fundamentals** : Deadline, cancellation, and values
2. **Testing basics** : Go's testing package and patterns
3. **Context creation** : Background, WithCancel, WithTimeout, WithValue
4. **Context propagation** : Passing context through function calls
5. **Testing patterns** : Table-driven tests, mocks, HTTP handlers

By testing with context, you ensure your application correctly handles timeouts, cancellation, and request-scoped values, leading to more robust and reliable code.

Remember these key principles:

* Always pass context as the first parameter
* Always check for context cancellation in long-running operations
* Always cancel contexts when done to prevent resource leaks
* Use context values sparingly and only for request-scoped data

With these principles and examples, you should now have a solid understanding of how to test Go code that uses context.
