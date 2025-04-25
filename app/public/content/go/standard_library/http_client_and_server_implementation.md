# Understanding Golang HTTP Client and Server Implementation from First Principles

I'll explain HTTP clients and servers in Go from fundamental concepts, building up gradually with clear examples. Let's start with the very basics and work our way up.

## 1. What is HTTP?

HTTP (Hypertext Transfer Protocol) is the foundation of data communication on the web. At its core, HTTP is a request-response protocol:

1. A client sends a request to a server
2. The server processes that request
3. The server returns a response to the client

Think of it like a conversation:

* Client: "May I please have the webpage at /index.html?" (request)
* Server: "Yes, here it is: [content]" (response)

## 2. Go's net/http Package

Go's standard library provides the `net/http` package, which contains the tools needed to build both HTTP clients and servers. This package abstracts away many low-level networking details while still giving you control when needed.

## 3. Building an HTTP Client in Go

### 3.1 Basic HTTP GET Request

Let's start with the simplest possible HTTP client request:

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    // Create a GET request to example.com
    resp, err := http.Get("https://example.com")
    if err != nil {
        fmt.Println("Error making request:", err)
        return
    }
    // Always close the response body when done
    defer resp.Body.Close()

    // Read the response body
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        fmt.Println("Error reading response:", err)
        return
    }

    // Print the status code and response body
    fmt.Println("Status:", resp.Status)
    fmt.Println("Body:", string(body[:100]), "...") // Just show first 100 chars
}
```

In this example:

1. `http.Get()` makes a GET request to example.com
2. We check if there was an error making the request
3. We defer closing the response body (important to prevent resource leaks)
4. We read the entire response body
5. We print the status code and part of the body

But what's happening underneath? The `http.Get` function is actually a convenient wrapper around creating a request, using a default HTTP client, and sending that request. Let's look at a more explicit version:

### 3.2 Creating Custom Requests

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    // Create a new request
    req, err := http.NewRequest("GET", "https://example.com", nil)
    if err != nil {
        fmt.Println("Error creating request:", err)
        return
    }

    // Add a custom header
    req.Header.Add("User-Agent", "My Custom Go Client")

    // Create an HTTP client
    client := &http.Client{}

    // Send the request
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error making request:", err)
        return
    }
    defer resp.Body.Close()

    // Read and print response
    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Printf("Status: %s\nBody: %s...\n", resp.Status, string(body[:100]))
}
```

This more detailed approach gives us greater control:

1. We create a request explicitly with `http.NewRequest()`
2. We add custom headers to the request
3. We create our own HTTP client instance
4. We use the client to send our request with `client.Do()`

### 3.3 Working with Different HTTP Methods

HTTP has several methods (GET, POST, PUT, DELETE, etc.). Here's how to make a POST request with data:

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    // Data to send in the request
    data := map[string]string{
        "name": "John Doe",
        "email": "john@example.com",
    }
  
    // Convert data to JSON
    jsonData, err := json.Marshal(data)
    if err != nil {
        fmt.Println("Error marshaling JSON:", err)
        return
    }
  
    // Create a POST request with the JSON data
    req, err := http.NewRequest("POST", "https://httpbin.org/post", bytes.NewBuffer(jsonData))
    if err != nil {
        fmt.Println("Error creating request:", err)
        return
    }
  
    // Set content type header
    req.Header.Set("Content-Type", "application/json")
  
    // Create client and send request
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error making request:", err)
        return
    }
    defer resp.Body.Close()
  
    // Read and print response
    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println("Response:", string(body))
}
```

In this example:

1. We create a map with our data
2. We convert it to JSON using `json.Marshal()`
3. We create a new POST request with the JSON data
4. We set the Content-Type header to indicate we're sending JSON
5. We send the request and process the response

### 3.4 Customizing the HTTP Client

The default HTTP client works for many cases, but sometimes you need more control:

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "time"
)

func main() {
    // Create a custom HTTP client with specific timeout and transport settings
    client := &http.Client{
        Timeout: 10 * time.Second,
        Transport: &http.Transport{
            MaxIdleConns:        10,
            IdleConnTimeout:     30 * time.Second,
            DisableCompression:  true,
        },
    }
  
    // Make a request with the custom client
    resp, err := client.Get("https://example.com")
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    defer resp.Body.Close()
  
    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Printf("Status: %s\nBody length: %d\n", resp.Status, len(body))
}
```

This customization allows:

1. Setting a timeout for the entire request
2. Configuring connection pooling with `MaxIdleConns`
3. Setting how long idle connections remain open
4. Disabling automatic compression

## 4. Building an HTTP Server in Go

Now that we understand the client side, let's build servers that can handle HTTP requests.

### 4.1 Simple HTTP Server

Here's the simplest possible HTTP server in Go:

```go
package main

import (
    "fmt"
    "net/http"
)

// Handler function
func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
}

func main() {
    // Register the handler function for the /hello path
    http.HandleFunc("/hello", helloHandler)
  
    // Start the server on port 8080
    fmt.Println("Server starting on port 8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```

What's happening here:

1. We define a handler function `helloHandler` that takes a `ResponseWriter` and a `Request`
2. The `ResponseWriter` is how we send data back to the client
3. We register our handler function to respond to requests at the "/hello" path
4. We start the server on port 8080 with `http.ListenAndServe()`

To test this, run the program and visit `http://localhost:8080/hello` in your browser.

### 4.2 Multiple Routes and HTTP Methods

Let's expand our server to handle different routes and HTTP methods:

```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

// User represents a user in our system
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

// Handler for the root path
func homeHandler(w http.ResponseWriter, r *http.Request) {
    // Only allow GET requests to this endpoint
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
  
    fmt.Fprintf(w, "Welcome to our API!")
}

// Handler for the /users path
func usersHandler(w http.ResponseWriter, r *http.Request) {
    // Handle different HTTP methods
    switch r.Method {
    case http.MethodGet:
        // Return a list of users
        users := []User{
            {ID: 1, Name: "Alice"},
            {ID: 2, Name: "Bob"},
        }
      
        // Set content type header
        w.Header().Set("Content-Type", "application/json")
      
        // Encode users as JSON and send response
        json.NewEncoder(w).Encode(users)
      
    case http.MethodPost:
        // Create a new user
        var newUser User
      
        // Try to decode the request body into the User struct
        err := json.NewDecoder(r.Body).Decode(&newUser)
        if err != nil {
            http.Error(w, "Bad request", http.StatusBadRequest)
            return
        }
      
        // In a real app, we would save the user to a database here
      
        // Return the created user
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(newUser)
      
    default:
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
    }
}

func main() {
    // Register handlers
    http.HandleFunc("/", homeHandler)
    http.HandleFunc("/users", usersHandler)
  
    // Start server
    fmt.Println("Server starting on :8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```

This server demonstrates:

1. Handling different HTTP methods (GET, POST)
2. Returning JSON responses with proper content type headers
3. Parsing JSON request bodies
4. Setting HTTP status codes
5. Basic input validation

### 4.3 Using ServeMux for Routing

Go's `http.ServeMux` is a HTTP request multiplexer - it matches the URL of incoming requests against registered patterns and calls the handler for the matching pattern.

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    // Create a new ServeMux
    mux := http.NewServeMux()
  
    // Register handlers with the mux
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // This handler is called for the root path and any path not handled elsewhere
        if r.URL.Path != "/" {
            http.NotFound(w, r)
            return
        }
        fmt.Fprintf(w, "Welcome to the home page!")
    })
  
    mux.HandleFunc("/about", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "This is the about page.")
    })
  
    mux.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
        // This handler is called for any path starting with /api/
        fmt.Fprintf(w, "API endpoint: %s", r.URL.Path)
    })
  
    // Start server with our custom mux
    fmt.Println("Server starting on :8080...")
    err := http.ListenAndServe(":8080", mux)
    if err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```

This approach demonstrates:

1. Creating an explicit `ServeMux` (rather than using the default one)
2. Registering handlers with specific paths
3. Using path prefixes with trailing slashes to match subroutes
4. Handling the 404 Not Found case explicitly

### 4.4 Creating Custom Server Configuration

For more control over server behavior:

```go
package main

import (
    "context"
    "fmt"
    "net/http"
    "os"
    "os/signal"
    "time"
)

func main() {
    // Create a mux for routing
    mux := http.NewServeMux()
  
    // Register handlers
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello from custom configured server!")
    })
  
    // Create a custom server
    server := &http.Server{
        Addr:         ":8080",
        Handler:      mux,
        ReadTimeout:  5 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  15 * time.Second,
    }
  
    // Start the server in a goroutine
    go func() {
        fmt.Println("Server starting on :8080...")
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            fmt.Printf("Error starting server: %v\n", err)
            os.Exit(1)
        }
    }()
  
    // Set up graceful shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, os.Interrupt)
  
    // Block until we receive a signal
    <-quit
    fmt.Println("Shutting down server...")
  
    // Create a context with timeout for shutdown
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
  
    // Attempt graceful shutdown
    if err := server.Shutdown(ctx); err != nil {
        fmt.Printf("Server forced to shutdown: %v\n", err)
    }
  
    fmt.Println("Server exited properly")
}
```

This demonstrates:

1. Creating a custom `http.Server` with specific timeouts
2. Starting the server in a goroutine
3. Implementing graceful shutdown with signal handling
4. Using context with timeout for controlled shutdown

### 4.5 Middleware Pattern

Middleware functions allow you to wrap HTTP handlers to add functionality like logging, authentication, or CORS:

```go
package main

import (
    "fmt"
    "log"
    "net/http"
    "time"
)

// Middleware function for logging requests
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Log information before handling the request
        startTime := time.Now()
        log.Printf("Started %s %s", r.Method, r.URL.Path)
      
        // Call the next handler
        next.ServeHTTP(w, r)
      
        // Log information after the request is handled
        log.Printf("Completed %s %s in %v", r.Method, r.URL.Path, time.Since(startTime))
    })
}

// Middleware for basic authentication
func basicAuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Get username and password from request
        username, password, ok := r.BasicAuth()
      
        // Check if credentials are valid
        if !ok || username != "admin" || password != "password" {
            w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
            http.Error(w, "Unauthorized", http.StatusUnauthorized)
            return
        }
      
        // Call the next handler
        next.ServeHTTP(w, r)
    })
}

// Our actual handler
func helloHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, authenticated user!")
}

func main() {
    // Create handler with middleware chain
    // Order matters: requests flow through middleware from outside to inside
    handler := loggingMiddleware(basicAuthMiddleware(http.HandlerFunc(helloHandler)))
  
    // Register the handler
    http.Handle("/hello", handler)
  
    // Start server
    fmt.Println("Server starting on :8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```

This demonstrates:

1. Creating middleware functions that wrap handlers
2. Chaining multiple middleware together
3. Using middleware for logging and authentication
4. How requests flow through the middleware chain

## 5. Understanding HTTP Request and Response in Detail

Let's look more closely at the `http.Request` and `http.ResponseWriter` types:

### 5.1 `http.Request` Structure

The `http.Request` type represents an HTTP request received by a server or to be sent by a client. Here's what it contains:

```go
package main

import (
    "fmt"
    "net/http"
    "net/http/httputil"
)

func requestDumpHandler(w http.ResponseWriter, r *http.Request) {
    // Dump the full request to a string
    dump, err := httputil.DumpRequest(r, true)
    if err != nil {
        http.Error(w, "Error processing request", http.StatusInternalServerError)
        return
    }
  
    // Print the request details
    fmt.Println(string(dump))
  
    // Access common request fields
    fmt.Println("\nCommon Request Fields:")
    fmt.Printf("Method: %s\n", r.Method)
    fmt.Printf("URL: %s\n", r.URL)
    fmt.Printf("Protocol: %s\n", r.Proto)
    fmt.Printf("Host: %s\n", r.Host)
    fmt.Printf("Remote Address: %s\n", r.RemoteAddr)
  
    // Get a specific header
    userAgent := r.Header.Get("User-Agent")
    fmt.Printf("User-Agent: %s\n", userAgent)
  
    // Get URL query parameters
    queryParam := r.URL.Query().Get("param")
    fmt.Printf("Query parameter 'param': %s\n", queryParam)
  
    // Send a simple response
    fmt.Fprintf(w, "Request received and processed")
}

func main() {
    http.HandleFunc("/", requestDumpHandler)
  
    fmt.Println("Server starting on :8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```

Key parts of the request:

* Method: GET, POST, PUT, DELETE, etc.
* URL: The requested URL path and query parameters
* Header: HTTP headers as key-value pairs
* Body: The request body (for POST, PUT, etc.)
* Form and PostForm: Parsed form data
* RemoteAddr: The client's IP address

### 5.2 `http.ResponseWriter` Interface

The `http.ResponseWriter` interface is used by an HTTP handler to construct an HTTP response:

```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

func responseHandler(w http.ResponseWriter, r *http.Request) {
    // Set response headers
    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("X-Custom-Header", "Custom Value")
  
    // Set HTTP status code
    // Note: Must be called after setting headers but before writing body
    w.WriteHeader(http.StatusOK)
  
    // Create response data
    response := map[string]interface{}{
        "message": "Success",
        "status": 200,
        "data": map[string]string{
            "name": "Example Response",
            "type": "JSON",
        },
    }
  
    // Write JSON response
    json.NewEncoder(w).Encode(response)
}

func main() {
    http.HandleFunc("/", responseHandler)
  
    fmt.Println("Server starting on :8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```

The key operations with ResponseWriter:

1. Setting response headers with `w.Header().Set()`
2. Setting the status code with `w.WriteHeader()`
3. Writing the response body with `w.Write()` or helper functions like `json.NewEncoder(w).Encode()`

Note the order is important:

* Set headers first
* Set status code next
* Write body last

## 6. Advanced Topics

### 6.1 Serving Static Files

Go makes it easy to serve static files:

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    // Create a file server handler
    fileServer := http.FileServer(http.Dir("./static"))
  
    // Register the file server to handle requests to /static/
    // Note: The http.StripPrefix is necessary because the file server
    // serves from the root of the provided directory
    http.Handle("/static/", http.StripPrefix("/static/", fileServer))
  
    // Regular handler for the homepage
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path != "/" {
            http.NotFound(w, r)
            return
        }
        fmt.Fprintf(w, "Welcome! Static files are served at /static/")
    })
  
    fmt.Println("Server starting on :8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```

With this setup:

1. Files in the `./static` directory will be served at `/static/` URLs
2. `http.StripPrefix` removes the `/static/` prefix before looking up the file
3. The file server automatically handles file types, directory listings, and 404s

### 6.2 HTTPS Server

For secure communication, you can use TLS/SSL:

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, HTTPS World!")
    })
  
    fmt.Println("HTTPS server starting on :8443...")
  
    // ListenAndServeTLS requires a certificate and key file
    err := http.ListenAndServeTLS(":8443", "server.crt", "server.key", nil)
    if err != nil {
        fmt.Println("Error starting HTTPS server:", err)
    }
}
```

To use this code:

1. You need a TLS certificate and private key (server.crt and server.key)
2. For development, you can generate self-signed certificates with tools like OpenSSL
3. For production, use a certificate from a trusted authority like Let's Encrypt

### 6.3 Working with Cookies

Cookies allow the server to store data on the client:

```go
package main

import (
    "fmt"
    "net/http"
    "time"
)

func cookieHandler(w http.ResponseWriter, r *http.Request) {
    // Check if user already has a visit cookie
    cookie, err := r.Cookie("lastVisit")
  
    if err == http.ErrNoCookie {
        // First visit, set a welcome message
        fmt.Fprintf(w, "Welcome to our website for the first time!")
    } else {
        // Returning visitor
        fmt.Fprintf(w, "Welcome back! Your last visit was: %s", cookie.Value)
    }
  
    // Set/update the cookie with current time
    newCookie := http.Cookie{
        Name:    "lastVisit",
        Value:   time.Now().Format(time.RFC1123),
        Expires: time.Now().Add(365 * 24 * time.Hour), // 1 year
        Path:    "/",
        // Secure:   true,  // Requires HTTPS
        // HttpOnly: true,  // Not accessible via JavaScript
    }
  
    http.SetCookie(w, &newCookie)
}

func main() {
    http.HandleFunc("/", cookieHandler)
  
    fmt.Println("Server starting on :8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```

This example:

1. Checks if the visitor has a cookie named "lastVisit"
2. Displays different messages for new and returning visitors
3. Sets/updates the cookie with the current time
4. Configures cookie properties like expiration and path

### 6.4 WebSockets Support

For real-time, bidirectional communication, you can add WebSockets to your Go server using the `gorilla/websocket` package:

```go
package main

import (
    "fmt"
    "log"
    "net/http"
  
    "github.com/gorilla/websocket"
)

// Configure the upgrader
var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    // Allow all origins for development
    CheckOrigin: func(r *http.Request) bool { return true },
}

// WebSocket handler
func websocketHandler(w http.ResponseWriter, r *http.Request) {
    // Upgrade HTTP connection to WebSocket
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println("Error upgrading to WebSocket:", err)
        return
    }
    defer conn.Close()
  
    log.Println("Client connected")
  
    // WebSocket message handling loop
    for {
        // Read message from client
        messageType, message, err := conn.ReadMessage()
        if err != nil {
            log.Println("Error reading message:", err)
            break
        }
      
        // Log received message
        log.Printf("Received: %s", message)
      
        // Echo the message back to the client
        err = conn.WriteMessage(messageType, message)
        if err != nil {
            log.Println("Error writing message:", err)
            break
        }
    }
}

func main() {
    // Serve HTML page with WebSocket client
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, "websocket.html")
    })
  
    // Handle WebSocket connections
    http.HandleFunc("/ws", websocketHandler)
  
    fmt.Println("Server starting on :8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        log.Fatal("Error starting server:", err)
    }
}
```

In this example:

1. We use the gorilla/websocket package to upgrade HTTP connections to WebSockets
2. We handle incoming messages in a loop
3. We echo received messages back to the client
4. We properly handle connection closing and errors

## 7. Best Practices for HTTP Servers in Go

### 7.1 Error Handling

```go
package main

import (
    "errors"
    "fmt"
    "log"
    "net/http"
)

// Custom error types
type NotFoundError struct {
    Resource string
}

func (e NotFoundError) Error() string {
    return fmt.Sprintf("Resource not found: %s", e.Resource)
}

// Business logic function that may return errors
func getUserData(userID string) (map[string]string, error) {
    if userID == "" {
        return nil, errors.New("missing userID parameter")
    }
  
    if userID == "123" {
        return map[string]string{
            "id":   "123",
            "name": "Alice",
        }, nil
    }
  
    // User not found
    return nil, NotFoundError{Resource: "user:" + userID}
}

// HTTP handler with proper error handling
func userHandler(w http.ResponseWriter, r *http.Request) {
    // Get user ID from query parameter
    userID := r.URL.Query().Get("id")
  
    // Get user data
    userData, err := getUserData(userID)
  
    // Handle different types of errors
    if err != nil {
        switch e := err.(type) {
        case NotFoundError:
            http.Error(w, e.Error(), http.StatusNotFound)
        default:
            // Log unexpected errors
            log.Printf("Error getting user data: %v", err)
            http.Error(w, "Internal server error", http.StatusInternalServerError)
        }
        return
    }
  
    // Success response
    fmt.Fprintf(w, "User data: %v", userData)
}

func main() {
    http.HandleFunc("/user", userHandler)
  
    fmt.Println("Server starting on :8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        log.Fatal("Error starting server:", err)
    }
}
```

This demonstrates:

1. Using custom error types for different error scenarios
2. Mapping errors to appropriate HTTP status codes
3. Logging internal errors for debugging
4. Providing appropriate error messages to clients

### 7.2 Timeout Handling

```go
package main

import (
    "context"
    "fmt"
    "net/http"
    "time"
)

func slowHandler(w http.ResponseWriter, r *http.Request) {
    // Get the context from the request
    ctx := r.Context()
  
    // Create a channel to signal completion
    resultCh := make(chan string, 1)
  
    // Start a goroutine for the "slow" operation
    go func() {
        // Simulate a time-consuming operation
        time.Sleep(5 * time.Second)
        resultCh <- "Operation completed successfully!"
    }()
  
    // Wait for either completion or context cancellation
    select {
    case result := <-resultCh:
        // Operation completed successfully
        fmt.Fprint(w, result)
    case <-ctx.Done():
        // Context was canceled (timeout or client disconnection)
        fmt.Println("Request canceled:", ctx.Err())
        return
    }
}

func main() {
    // Create a custom server with timeouts
    server := &http.Server{
        Addr:              ":8080",
        ReadTimeout:       5 * time.Second,
        ReadHeaderTimeout: 2 * time.Second,
        WriteTimeout:      10 * time.Second,
        IdleTimeout:       120 * time.Second,
        Handler:           nil, // Use default ServeMux
    }
  
    // Register a handler for the slow operation
    http.HandleFunc("/slow", slowHandler)
  
    fmt.Println("Server starting on :8080...")
    err := server.ListenAndServe()
    if err != nil {
        fmt.Println("Error starting server:", err)
    }
}
```

This example:

1. Sets appropriate timeouts on the server to prevent resource exhaustion
2. Uses context to handle request cancellation gracefully
3. Demonstrates how to perform long-running operations safely


## 8. Testing HTTP Servers and Clients in Go

### 8.1 Testing HTTP Handlers

Let's complete the HTTP handler testing example:

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "net/http/httptest"
    "testing"
)

// Handler to test
func greetingHandler(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    if name == "" {
        name = "Guest"
    }
    
    fmt.Fprintf(w, "Hello, %s!", name)
}

// Test function
func TestGreetingHandler(t *testing.T) {
    // Create a request to pass to our handler
    req, err := http.NewRequest("GET", "/greeting?name=Alice", nil)
    if err != nil {
        t.Fatal(err)
    }
    
    // Create a ResponseRecorder to record the response
    rr := httptest.NewRecorder()
    
    // Create an HTTP handler from our handler function
    handler := http.HandlerFunc(greetingHandler)
    
    // Serve the HTTP request to our handler
    handler.ServeHTTP(rr, req)
    
    // Check the status code
    if status := rr.Code; status != http.StatusOK {
        t.Errorf("handler returned wrong status code: got %v want %v",
            status, http.StatusOK)
    }
    
    // Check the response body
    expected := "Hello, Alice!"
    if rr.Body.String() != expected {
        t.Errorf("handler returned unexpected body: got %v want %v",
            rr.Body.String(), expected)
    }
}
```

Key elements in this test:
1. `httptest.NewRecorder()` creates a response recorder that implements `http.ResponseWriter`
2. We convert our handler function to an `http.Handler` using `http.HandlerFunc`
3. We call `ServeHTTP` directly to simulate an HTTP request
4. We check both the status code and response body against expected values

Let's also test the default case:

```go
func TestGreetingHandlerDefaultName(t *testing.T) {
    // Create a request with no name parameter
    req, err := http.NewRequest("GET", "/greeting", nil)
    if err != nil {
        t.Fatal(err)
    }
    
    // Create a ResponseRecorder
    rr := httptest.NewRecorder()
    handler := http.HandlerFunc(greetingHandler)
    
    // Serve the request
    handler.ServeHTTP(rr, req)
    
    // Check status code
    if status := rr.Code; status != http.StatusOK {
        t.Errorf("handler returned wrong status code: got %v want %v",
            status, http.StatusOK)
    }
    
    // Check response body
    expected := "Hello, Guest!"
    if rr.Body.String() != expected {
        t.Errorf("handler returned unexpected body: got %v want %v",
            rr.Body.String(), expected)
    }
}
```

### 8.2 Testing HTTP Servers

For more comprehensive testing, we can start a test server:

```go
package main

import (
    "encoding/json"
    "io/ioutil"
    "net/http"
    "net/http/httptest"
    "testing"
)

// API handler that returns JSON
func apiHandler(w http.ResponseWriter, r *http.Request) {
    // Set content type
    w.Header().Set("Content-Type", "application/json")
    
    // Create response data
    response := map[string]string{
        "status": "success",
        "message": "API is working",
    }
    
    // Convert to JSON and send
    json.NewEncoder(w).Encode(response)
}

// Test function
func TestAPIServer(t *testing.T) {
    // Create a test server
    server := httptest.NewServer(http.HandlerFunc(apiHandler))
    defer server.Close() // Clean up when done
    
    // Make a request to our test server
    resp, err := http.Get(server.URL)
    if err != nil {
        t.Fatalf("Error making request to server: %v", err)
    }
    defer resp.Body.Close()
    
    // Check status code
    if resp.StatusCode != http.StatusOK {
        t.Errorf("Unexpected status code: got %v want %v",
            resp.StatusCode, http.StatusOK)
    }
    
    // Check content type
    contentType := resp.Header.Get("Content-Type")
    expectedType := "application/json"
    if contentType != expectedType {
        t.Errorf("Unexpected content type: got %v want %v",
            contentType, expectedType)
    }
    
    // Read response body
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        t.Fatalf("Error reading response body: %v", err)
    }
    
    // Parse JSON
    var data map[string]string
    err = json.Unmarshal(body, &data)
    if err != nil {
        t.Fatalf("Error parsing JSON: %v", err)
    }
    
    // Check response values
    if data["status"] != "success" {
        t.Errorf("Unexpected status: got %v want %v",
            data["status"], "success")
    }
    
    if data["message"] != "API is working" {
        t.Errorf("Unexpected message: got %v want %v",
            data["message"], "API is working")
    }
}
```

This approach:
1. Uses `httptest.NewServer` to create a temporary server for testing
2. Makes a real HTTP request to the test server
3. Validates the response's status code, headers, and body content
4. Cleans up the server when the test is done

### 8.3 Testing HTTP Clients

We can also test HTTP clients by creating a test server with predefined responses:

```go
package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "net/http/httptest"
    "testing"
)

// Client function to test
func fetchUserData(client *http.Client, url string) (string, error) {
    resp, err := client.Get(url)
    if err != nil {
        return "", err
    }
    defer resp.Body.Close()
    
    // Check status code
    if resp.StatusCode != http.StatusOK {
        return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
    }
    
    // Read response body
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return "", err
    }
    
    // Parse JSON
    var data map[string]interface{}
    err = json.Unmarshal(body, &data)
    if err != nil {
        return "", err
    }
    
    // Extract username
    username, ok := data["name"].(string)
    if !ok {
        return "", fmt.Errorf("name field not found or not a string")
    }
    
    return username, nil
}

// Test function
func TestFetchUserData(t *testing.T) {
    // Create a test server that returns a predefined response
    server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Set content type
        w.Header().Set("Content-Type", "application/json")
        
        // Return different responses based on path
        if r.URL.Path == "/users/1" {
            w.Write([]byte(`{"id": 1, "name": "Alice"}`))
        } else if r.URL.Path == "/users/2" {
            w.Write([]byte(`{"id": 2, "name": "Bob"}`))
        } else {
            w.WriteHeader(http.StatusNotFound)
            w.Write([]byte(`{"error": "User not found"}`))
        }
    }))
    defer server.Close()
    
    // Create HTTP client
    client := &http.Client{}
    
    // Test case 1: Valid user
    username, err := fetchUserData(client, server.URL+"/users/1")
    if err != nil {
        t.Errorf("Error fetching user 1: %v", err)
    }
    if username != "Alice" {
        t.Errorf("Expected username 'Alice', got '%s'", username)
    }
    
    // Test case 2: Another valid user
    username, err = fetchUserData(client, server.URL+"/users/2") 
    if err != nil {
        t.Errorf("Error fetching user 2: %v", err)
    }
    if username != "Bob" {
        t.Errorf("Expected username 'Bob', got '%s'", username)
    }
    
    // Test case 3: Non-existent user
    _, err = fetchUserData(client, server.URL+"/users/999")
    if err == nil {
        t.Error("Expected error for non-existent user, got nil")
    }
}
```

This test:
1. Creates a test server with custom responses for different paths
2. Tests our client function with different scenarios
3. Verifies the function correctly handles both success and error cases

## 9. Performance Considerations

### 9.1 Connection Pooling

Go's HTTP client automatically uses connection pooling, but you can adjust it:

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "time"
)

func main() {
    // Create a custom transport with connection pooling settings
    transport := &http.Transport{
        MaxIdleConns:        100,              // Maximum idle connections
        MaxIdleConnsPerHost: 10,               // Maximum idle connections per host
        IdleConnTimeout:     90 * time.Second, // How long to keep idle connections
        DisableCompression:  false,            // Enable compression
        DisableKeepAlives:   false,            // Enable keep-alives
    }
    
    // Create client with the custom transport
    client := &http.Client{
        Transport: transport,
        Timeout:   10 * time.Second,
    }
    
    // Make multiple requests to the same host to demonstrate connection reuse
    for i := 0; i < 5; i++ {
        start := time.Now()
        
        resp, err := client.Get("https://example.com")
        if err != nil {
            fmt.Printf("Request %d error: %v\n", i+1, err)
            continue
        }
        
        _, err = ioutil.ReadAll(resp.Body)
        resp.Body.Close() // Always close the body
        
        fmt.Printf("Request %d completed in %v\n", i+1, time.Since(start))
    }
}
```

Connection pooling benefits:
1. Reduces latency by reusing established connections
2. Saves resources by avoiding the overhead of creating new connections
3. Improves throughput for multiple requests to the same host

### 9.2 Concurrent Requests

For handling many requests concurrently:

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "sync"
    "time"
)

func fetchURL(client *http.Client, url string, wg *sync.WaitGroup, results chan<- string) {
    // Ensure we mark the wait group as done when we finish
    defer wg.Done()
    
    // Make the request
    start := time.Now()
    resp, err := client.Get(url)
    if err != nil {
        results <- fmt.Sprintf("Error fetching %s: %v", url, err)
        return
    }
    defer resp.Body.Close()
    
    // Read response body
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        results <- fmt.Sprintf("Error reading response from %s: %v", url, err)
        return
    }
    
    // Send result
    elapsed := time.Since(start)
    results <- fmt.Sprintf("URL: %s, Status: %s, Size: %d bytes, Time: %v", 
        url, resp.Status, len(body), elapsed)
}

func main() {
    // URLs to fetch
    urls := []string{
        "https://www.google.com",
        "https://www.github.com",
        "https://www.stackoverflow.com",
        "https://www.golang.org",
        "https://www.example.com",
    }
    
    // Create a client with appropriate settings for concurrent requests
    client := &http.Client{
        Timeout: 10 * time.Second,
        Transport: &http.Transport{
            MaxIdleConnsPerHost: 20,
        },
    }
    
    // Create wait group and results channel
    var wg sync.WaitGroup
    results := make(chan string, len(urls))
    
    // Start fetching each URL concurrently
    start := time.Now()
    for _, url := range urls {
        wg.Add(1)
        go fetchURL(client, url, &wg, results)
    }
    
    // Wait for all requests to complete
    go func() {
        wg.Wait()
        close(results)
    }()
    
    // Collect and print results
    for result := range results {
        fmt.Println(result)
    }
    
    fmt.Printf("\nAll requests completed in %v\n", time.Since(start))
}
```

This example:
1. Uses goroutines to make multiple HTTP requests concurrently
2. Uses a wait group to track when all requests are done
3. Uses a channel to collect results from each goroutine
4. Demonstrates how to handle concurrent HTTP requests efficiently

### 9.3 Rate Limiting

To avoid overwhelming servers with too many requests:

```go
package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "sync"
    "time"
)

// Simple rate limiter that allows a certain number of requests per second
type RateLimiter struct {
    interval time.Duration
    tokens   chan struct{}
}

// Create a new rate limiter
func NewRateLimiter(requestsPerSecond int) *RateLimiter {
    limiter := &RateLimiter{
        interval: time.Second / time.Duration(requestsPerSecond),
        tokens:   make(chan struct{}, requestsPerSecond),
    }
    
    // Fill the token bucket
    go limiter.fillBucket()
    
    return limiter
}

// Fill the token bucket at the specified rate
func (r *RateLimiter) fillBucket() {
    ticker := time.NewTicker(r.interval)
    defer ticker.Stop()
    
    for range ticker.C {
        select {
        case r.tokens <- struct{}{}:
            // Token added
        default:
            // Bucket is full, discard token
        }
    }
}

// Wait for a token before proceeding
func (r *RateLimiter) Wait() {
    <-r.tokens
}

func main() {
    // Create a rate limiter with 2 requests per second
    limiter := NewRateLimiter(2)
    
    // URLs to fetch
    urls := []string{
        "https://example.com/page1",
        "https://example.com/page2",
        "https://example.com/page3",
        "https://example.com/page4",
        "https://example.com/page5",
    }
    
    // Create HTTP client
    client := &http.Client{
        Timeout: 10 * time.Second,
    }
    
    // Use wait group to wait for all requests
    var wg sync.WaitGroup
    
    // Start time
    start := time.Now()
    
    // Make rate-limited requests
    for i, url := range urls {
        wg.Add(1)
        
        go func(i int, url string) {
            defer wg.Done()
            
            // Wait for rate limiter
            limiter.Wait()
            
            // Log when we start the request
            fmt.Printf("[%v] Starting request %d to %s\n", 
                time.Since(start).Round(time.Millisecond), i+1, url)
            
            // Make request
            resp, err := client.Get(url)
            if err != nil {
                fmt.Printf("Error: %v\n", err)
                return
            }
            defer resp.Body.Close()
            
            // Read response
            _, err = ioutil.ReadAll(resp.Body)
            if err != nil {
                fmt.Printf("Error reading response: %v\n", err)
                return
            }
            
            fmt.Printf("[%v] Completed request %d to %s\n", 
                time.Since(start).Round(time.Millisecond), i+1, url)
        }(i, url)
    }
    
    // Wait for all requests to finish
    wg.Wait()
    
    fmt.Printf("All requests completed in %v\n", time.Since(start))
}
```

This implementation:
1. Creates a token bucket rate limiter that allows N requests per second
2. Demonstrates how to make HTTP requests at a controlled rate
3. Shows how to combine rate limiting with concurrent requests
4. Helps avoid overwhelming APIs or getting rate-limited by servers

## 10. Real-World HTTP Server Design

Here's a more complete example that combines many of the concepts we've covered:

```go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "strconv"
    "sync"
    "time"
)

// Product represents a product in our store
type Product struct {
    ID          int    `json:"id"`
    Name        string `json:"name"`
    Description string `json:"description"`
    Price       float64 `json:"price"`
    CreatedAt   time.Time `json:"created_at"`
}

// ProductStore is our "database" interface
type ProductStore interface {
    GetProduct(id int) (*Product, error)
    GetAllProducts() ([]*Product, error)
    CreateProduct(p *Product) error
    UpdateProduct(p *Product) error
    DeleteProduct(id int) error
}

// MemoryProductStore implements ProductStore using an in-memory map
type MemoryProductStore struct {
    mutex    sync.RWMutex
    products map[int]*Product
    nextID   int
}

// NewMemoryProductStore creates a new in-memory product store
func NewMemoryProductStore() *MemoryProductStore {
    return &MemoryProductStore{
        products: make(map[int]*Product),
        nextID:   1,
    }
}

// GetProduct returns a product by ID
func (s *MemoryProductStore) GetProduct(id int) (*Product, error) {
    s.mutex.RLock()
    defer s.mutex.RUnlock()
    
    product, ok := s.products[id]
    if !ok {
        return nil, fmt.Errorf("product not found: %d", id)
    }
    
    return product, nil
}

// GetAllProducts returns all products
func (s *MemoryProductStore) GetAllProducts() ([]*Product, error) {
    s.mutex.RLock()
    defer s.mutex.RUnlock()
    
    products := make([]*Product, 0, len(s.products))
    for _, product := range s.products {
        products = append(products, product)
    }
    
    return products, nil
}

// CreateProduct adds a new product
func (s *MemoryProductStore) CreateProduct(p *Product) error {
    s.mutex.Lock()
    defer s.mutex.Unlock()
    
    p.ID = s.nextID
    p.CreatedAt = time.Now()
    s.products[p.ID] = p
    s.nextID++
    
    return nil
}

// UpdateProduct updates an existing product
func (s *MemoryProductStore) UpdateProduct(p *Product) error {
    s.mutex.Lock()
    defer s.mutex.Unlock()
    
    _, ok := s.products[p.ID]
    if !ok {
        return fmt.Errorf("product not found: %d", p.ID)
    }
    
    s.products[p.ID] = p
    return nil
}

// DeleteProduct removes a product
func (s *MemoryProductStore) DeleteProduct(id int) error {
    s.mutex.Lock()
    defer s.mutex.Unlock()
    
    _, ok := s.products[id]
    if !ok {
        return fmt.Errorf("product not found: %d", id)
    }
    
    delete(s.products, id)
    return nil
}

// Server handles HTTP requests
type Server struct {
    store  ProductStore
    logger *log.Logger
}

// NewServer creates a new HTTP server
func NewServer(store ProductStore, logger *log.Logger) *Server {
    return &Server{
        store:  store,
        logger: logger,
    }
}

// logRequest logs information about each request
func (s *Server) logRequest(handler http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        
        // Call the original handler
        handler.ServeHTTP(w, r)
        
        s.logger.Printf(
            "%s %s %s %s",
            r.RemoteAddr,
            r.Method,
            r.URL.Path,
            time.Since(start),
        )
    })
}

// handleGetProduct handles GET /products/:id
func (s *Server) handleGetProduct(w http.ResponseWriter, r *http.Request) {
    idStr := r.URL.Path[len("/products/"):]
    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "Invalid product ID", http.StatusBadRequest)
        return
    }
    
    product, err := s.store.GetProduct(id)
    if err != nil {
        http.Error(w, "Product not found", http.StatusNotFound)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(product)
}

// handleGetAllProducts handles GET /products
func (s *Server) handleGetAllProducts(w http.ResponseWriter, r *http.Request) {
    products, err := s.store.GetAllProducts()
    if err != nil {
        http.Error(w, "Error retrieving products", http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(products)
}

// handleCreateProduct handles POST /products
func (s *Server) handleCreateProduct(w http.ResponseWriter, r *http.Request) {
    var product Product
    
    err := json.NewDecoder(r.Body).Decode(&product)
    if err != nil {
        http.Error(w, "Invalid product data", http.StatusBadRequest)
        return
    }
    
    err = s.store.CreateProduct(&product)
    if err != nil {
        http.Error(w, "Error creating product", http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(product)
}

// handleUpdateProduct handles PUT /products/:id
func (s *Server) handleUpdateProduct(w http.ResponseWriter, r *http.Request) {
    idStr := r.URL.Path[len("/products/"):]
    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "Invalid product ID", http.StatusBadRequest)
        return
    }
    
    var product Product
    err = json.NewDecoder(r.Body).Decode(&product)
    if err != nil {
        http.Error(w, "Invalid product data", http.StatusBadRequest)
        return
    }
    
    product.ID = id
    
    err = s.store.UpdateProduct(&product)
    if err != nil {
        http.Error(w, "Product not found", http.StatusNotFound)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(product)
}

// handleDeleteProduct handles DELETE /products/:id
func (s *Server) handleDeleteProduct(w http.ResponseWriter, r *http.Request) {
    idStr := r.URL.Path[len("/products/"):]
    id, err := strconv.Atoi(idStr)
    if err != nil {
        http.Error(w, "Invalid product ID", http.StatusBadRequest)
        return
    }
    
    err = s.store.DeleteProduct(id)
    if err != nil {
        http.Error(w, "Product not found", http.StatusNotFound)
        return
    }
    
    w.WriteHeader(http.StatusNoContent)
}

// handleProducts routes requests to the appropriate handler based on method
func (s *Server) handleProducts(w http.ResponseWriter, r *http.Request) {
    if r.URL.Path == "/products" {
        switch r.Method {
        case "GET":
            s.handleGetAllProducts(w, r)
        case "POST":
            s.handleCreateProduct(w, r)
        default:
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        }
        return
    }
    
    if len(r.URL.Path) > len("/products/") {
        switch r.Method {
        case "GET":
            s.handleGetProduct(w, r)
        case "PUT":
            s.handleUpdateProduct(w, r)
        case "DELETE":
            s.handleDeleteProduct(w, r)
        default:
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        }
        return
    }
    
    http.NotFound(w, r)
}

// SetupRoutes configures the routing for the server
func (s *Server) SetupRoutes() http.Handler {
    mux := http.NewServeMux()
    
    mux.HandleFunc("/products", s.handleProducts)
    mux.HandleFunc("/products/", s.handleProducts)
    
    // Add logging middleware
    return s.logRequest(mux)
}

func main() {
    // Create logger
    logger := log.New(os.Stdout, "", log.LstdFlags)
    
    // Create product store
    store := NewMemoryProductStore()
    
    // Add some sample products
    store.CreateProduct(&Product{Name: "Laptop", Description: "High-performance laptop", Price: 999.99})
    store.CreateProduct(&Product{Name: "Smartphone", Description: "Latest model", Price: 499.99})
    
    // Create server
    server := NewServer(store, logger)
    
    // Create HTTP server
    httpServer := &http.Server{
        Addr:         ":8080",
        Handler:      server.SetupRoutes(),
        ReadTimeout:  5 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  120 * time.Second,
    }
    
    // Start server in a goroutine
    go func() {
        logger.Println("Server starting on :8080...")
        err := httpServer.ListenAndServe()
        if err != nil && err != http.ErrServerClosed {
            logger.Fatalf("Could not start server: %v", err)
        }
    }()
    
    // Set up graceful shutdown
    stop := make(chan os.Signal, 1)
    signal.Notify(stop, os.Interrupt)
    
    // Wait for interrupt signal
    <-stop
    logger.Println("Shutting down server...")
    
    // Create context with timeout for shutdown
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    
    // Attempt graceful shutdown
    if err := httpServer.Shutdown(ctx); err != nil {
        logger.Fatalf("Server forced to shutdown: %v", err)
    }
    
    logger.Println("Server gracefully stopped")
}
```

This example combines:
1. A RESTful API design for a product store
2. Proper HTTP methods for CRUD operations (GET, POST, PUT, DELETE)
3. Concurrent access control with mutexes
4. Middleware for request logging
5. Graceful shutdown with context
6. Error handling and status codes
7. JSON request/response handling

## 11. Conclusion

Go's HTTP client and server implementation offers a powerful and efficient way to build networked applications. The standard library provides everything needed to create robust HTTP services without external dependencies for the basic functionality.

Key takeaways:
1. Go's `net/http` package provides both client and server functionality
2. HTTP clients can be customized for different needs (timeout, transport settings)
3. HTTP servers in Go are built around the `http.Handler` interface
4. Middleware can be created by wrapping handlers
5. Go's concurrency model works well with HTTP services
6. Testing HTTP code is straightforward with the `httptest` package
7. Performance considerations include connection pooling and concurrency
8. Proper error handling and graceful shutdown are important for robust services

By building on these principles, you can create efficient, reliable HTTP clients and servers in Go that handle everything from simple API calls to complex web applications.