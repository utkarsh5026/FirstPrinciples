# Network I/O Patterns in Python: From First Principles

Let me walk you through network I/O patterns by building from fundamental concepts to advanced optimization techniques.

## Part 1: Fundamental Network Communication Concepts

Before diving into Python specifics, let's understand what happens when programs communicate over networks.

### The Basic Network Communication Model

```
Client Program                    Server Program
     |                                  |
     | 1. Create connection request     |
     |--------------------------------->|
     |                                  | 2. Accept connection
     | 3. Send data                     |
     |--------------------------------->|
     |                                  | 4. Process & respond
     | 5. Receive response              |
     |<---------------------------------|
     | 6. Close connection              |
     |--------------------------------->|
```

> **Key Mental Model** : Network communication is like a phone conversation - you dial (connect), talk (send/receive data), and hang up (close connection). Each step has overhead costs.

### The Cost of Network Operations

```python
import time
import socket

def demonstrate_connection_overhead():
    """Show the time cost of creating new connections"""
  
    # Measure time to create a new connection
    start_time = time.time()
  
    # Create a socket (like picking up the phone)
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  
    # Connect to a server (like dialing)
    sock.connect(('httpbin.org', 80))
  
    connection_time = time.time() - start_time
    print(f"Connection setup took: {connection_time:.4f} seconds")
  
    # Send a simple HTTP request
    request = b"GET / HTTP/1.1\r\nHost: httpbin.org\r\n\r\n"
    sock.send(request)
  
    # Receive response
    response = sock.recv(1024)
  
    # Close connection (hang up)
    sock.close()
  
    return connection_time

# This shows why connection reuse matters
demonstrate_connection_overhead()
```

> **Critical Insight** : Connection setup involves multiple network round-trips (TCP handshake, potential TLS negotiation). This overhead becomes significant when making many requests.

## Part 2: Basic Python Networking - The Foundation

### Understanding Python's Socket Layer

```python
import socket
import time

class BasicHttpClient:
    """A minimal HTTP client to understand the fundamentals"""
  
    def __init__(self):
        self.socket = None
  
    def connect(self, host, port=80):
        """Establish a connection - expensive operation"""
        print(f"🔌 Connecting to {host}:{port}")
      
        # Create socket object
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
      
        # Set timeout to avoid hanging forever
        self.socket.settimeout(10)
      
        # Actually connect (this is where the overhead happens)
        start_time = time.time()
        self.socket.connect((host, port))
        connect_time = time.time() - start_time
      
        print(f"✅ Connected in {connect_time:.3f} seconds")
  
    def send_request(self, path="/"):
        """Send HTTP request over existing connection"""
        if not self.socket:
            raise Exception("Must connect first!")
      
        # HTTP/1.1 request format
        request = f"GET {path} HTTP/1.1\r\nHost: httpbin.org\r\n\r\n"
      
        print(f"📤 Sending: {request.strip()}")
        self.socket.send(request.encode())
  
    def receive_response(self):
        """Receive HTTP response"""
        response = self.socket.recv(4096).decode()
        print(f"📥 Received {len(response)} bytes")
        return response
  
    def close(self):
        """Close the connection"""
        if self.socket:
            print("🔌 Closing connection")
            self.socket.close()
            self.socket = None

# Usage example showing the overhead
client = BasicHttpClient()
client.connect('httpbin.org')
client.send_request('/get')
response = client.receive_response()
client.close()
```

### The Problem: Connection Overhead Accumulates

```python
def demonstrate_multiple_requests_overhead():
    """Show how connection overhead multiplies with many requests"""
  
    requests_to_make = 5
    total_connection_time = 0
  
    for i in range(requests_to_make):
        print(f"\n--- Request {i+1} ---")
      
        # Each request creates a NEW connection (inefficient!)
        client = BasicHttpClient()
      
        start_time = time.time()
        client.connect('httpbin.org')
        connection_time = time.time() - start_time
        total_connection_time += connection_time
      
        client.send_request(f'/get?request={i+1}')
        client.receive_response()
        client.close()
  
    print(f"\n📊 Total connection overhead: {total_connection_time:.3f} seconds")
    print(f"💡 Average per connection: {total_connection_time/requests_to_make:.3f} seconds")

demonstrate_multiple_requests_overhead()
```

> **The Core Problem** : Creating a new connection for each request is like hanging up and redialing for every sentence in a conversation. We need smarter patterns.

## Part 3: Connection Pooling - The Solution to Overhead

### Mental Model: Connection Pooling

```
Connection Pool (like a taxi fleet)
┌─────────────────────────────────┐
│ [Conn1] [Conn2] [Conn3] [Conn4] │ ← Available connections
└─────────────────────────────────┘
       ↑              ↓
   Return after    Borrow for
   use             request

Application Requests:
Request A ←→ Conn1  (borrowed)
Request B ←→ Conn2  (borrowed)  
Request C ←→ Conn3  (borrowed)
Request D → waits... (pool full)
```

> **Connection Pool Philosophy** : Instead of creating/destroying connections repeatedly, maintain a "pool" of reusable connections. Like keeping taxi cabs on standby rather than manufacturing new cars for each ride.

### Building a Simple Connection Pool

```python
import threading
import queue
import socket
import time
from contextlib import contextmanager

class SimpleConnectionPool:
    """A basic connection pool implementation"""
  
    def __init__(self, host, port, max_connections=5):
        self.host = host
        self.port = port
        self.max_connections = max_connections
      
        # Queue to store available connections
        self._pool = queue.Queue(maxsize=max_connections)
        self._created_connections = 0
        self._lock = threading.Lock()
      
        print(f"🏊 Created pool for {host}:{port} (max: {max_connections})")
  
    def _create_connection(self):
        """Create a new connection - only called when needed"""
        print(f"🔌 Creating new connection ({self._created_connections + 1}/{self.max_connections})")
      
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        sock.connect((self.host, self.port))
      
        with self._lock:
            self._created_connections += 1
      
        return sock
  
    def get_connection(self, timeout=5):
        """Get a connection from the pool"""
        try:
            # Try to get an existing connection (fast!)
            connection = self._pool.get(timeout=timeout)
            print("♻️  Reusing pooled connection")
            return connection
      
        except queue.Empty:
            # No connections available
            with self._lock:
                if self._created_connections < self.max_connections:
                    # We can create a new one
                    return self._create_connection()
                else:
                    # Pool is full, wait for one to be returned
                    print("⏳ Pool full, waiting for available connection...")
                    return self._pool.get(timeout=timeout)
  
    def return_connection(self, connection):
        """Return a connection to the pool"""
        try:
            # Put connection back in pool for reuse
            self._pool.put(connection, block=False)
            print("✅ Connection returned to pool")
        except queue.Full:
            # Pool is full, close this connection
            print("🗑️  Pool full, closing connection")
            connection.close()
  
    @contextmanager
    def connection(self):
        """Context manager for automatic connection management"""
        conn = self.get_connection()
        try:
            yield conn
        finally:
            self.return_connection(conn)

# Usage example
pool = SimpleConnectionPool('httpbin.org', 80, max_connections=3)

def make_request_with_pool(pool, request_id):
    """Make an HTTP request using the connection pool"""
  
    with pool.connection() as conn:
        # Send request
        request = f"GET /get?id={request_id} HTTP/1.1\r\nHost: httpbin.org\r\n\r\n"
        conn.send(request.encode())
      
        # Receive response
        response = conn.recv(4096)
        print(f"📥 Request {request_id}: Received {len(response)} bytes")

# Test the pool with multiple requests
print("🚀 Making multiple requests with connection pooling:")
for i in range(6):  # More requests than pool size
    make_request_with_pool(pool, i+1)
```

### Comparing Performance: No Pool vs Pool

```python
import time

def benchmark_connection_strategies():
    """Compare performance of different connection strategies"""
  
    num_requests = 10
  
    # Strategy 1: New connection per request (naive)
    print("📊 Testing: New connection per request")
    start_time = time.time()
  
    for i in range(num_requests):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect(('httpbin.org', 80))
        request = f"GET /get?test=new_{i} HTTP/1.1\r\nHost: httpbin.org\r\n\r\n"
        sock.send(request.encode())
        sock.recv(1024)
        sock.close()
  
    new_conn_time = time.time() - start_time
    print(f"⏱️  New connections: {new_conn_time:.3f} seconds")
  
    # Strategy 2: Connection pooling
    print("\n📊 Testing: Connection pooling")
    pool = SimpleConnectionPool('httpbin.org', 80, max_connections=3)
  
    start_time = time.time()
  
    for i in range(num_requests):
        make_request_with_pool(pool, f"pool_{i}")
  
    pool_time = time.time() - start_time
    print(f"⏱️  Connection pool: {pool_time:.3f} seconds")
  
    # Calculate improvement
    improvement = ((new_conn_time - pool_time) / new_conn_time) * 100
    print(f"\n🎯 Performance improvement: {improvement:.1f}%")

# Run the benchmark
benchmark_connection_strategies()
```

> **Key Insight** : Connection pooling typically provides 20-70% performance improvement for applications making multiple requests to the same host.

## Part 4: Persistent Connections - Keep-Alive Protocol

### Understanding HTTP Keep-Alive

```
Without Keep-Alive (HTTP/1.0 style):
Client                           Server
  |----> Connect -----------------> |
  |----> Request 1 ---------------> |
  |<---- Response 1 <-------------- |
  |----> Close -------------------->|
  |----> Connect -----------------> |  (Overhead repeated!)
  |----> Request 2 ---------------> |
  |<---- Response 2 <-------------- |
  |----> Close -------------------->|

With Keep-Alive (HTTP/1.1 style):
Client                           Server
  |----> Connect -----------------> |
  |----> Request 1 ---------------> |
  |<---- Response 1 <-------------- |
  |----> Request 2 ---------------> |  (Same connection!)
  |<---- Response 2 <-------------- |
  |----> Request 3 ---------------> |
  |<---- Response 3 <-------------- |
  |----> Close -------------------->|
```

### Implementing Persistent Connections

```python
import socket
import time

class PersistentHttpClient:
    """HTTP client that maintains persistent connections"""
  
    def __init__(self, host, port=80, keep_alive_timeout=30):
        self.host = host
        self.port = port
        self.keep_alive_timeout = keep_alive_timeout
        self.connection = None
        self.last_used = None
      
        print(f"🔗 Created persistent client for {host}:{port}")
  
    def _is_connection_valid(self):
        """Check if current connection is still valid"""
        if not self.connection:
            return False
      
        # Check if connection has timed out
        if self.last_used and (time.time() - self.last_used) > self.keep_alive_timeout:
            print("⏰ Connection timed out")
            self._close_connection()
            return False
      
        # You could add more checks here (like sending a ping)
        return True
  
    def _create_connection(self):
        """Create a new persistent connection"""
        print(f"🔌 Creating persistent connection to {self.host}:{self.port}")
      
        self.connection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.connection.settimeout(10)
        self.connection.connect((self.host, self.port))
        self.last_used = time.time()
  
    def _close_connection(self):
        """Close the current connection"""
        if self.connection:
            print("🔌 Closing persistent connection")
            self.connection.close()
            self.connection = None
            self.last_used = None
  
    def make_request(self, path="/", method="GET"):
        """Make an HTTP request using persistent connection"""
      
        # Ensure we have a valid connection
        if not self._is_connection_valid():
            self._create_connection()
      
        # HTTP/1.1 with Connection: keep-alive header
        request = (
            f"{method} {path} HTTP/1.1\r\n"
            f"Host: {self.host}\r\n"
            f"Connection: keep-alive\r\n"  # This tells server to keep connection open
            f"Keep-Alive: timeout={self.keep_alive_timeout}\r\n"
            f"\r\n"
        )
      
        print(f"📤 Sending request to {path}")
      
        try:
            # Send request
            self.connection.send(request.encode())
          
            # Receive response
            response = self.connection.recv(4096)
            self.last_used = time.time()
          
            print(f"📥 Received {len(response)} bytes")
            return response.decode()
      
        except (socket.error, socket.timeout) as e:
            print(f"❌ Connection error: {e}")
            self._close_connection()
            raise
  
    def close(self):
        """Explicitly close the persistent connection"""
        self._close_connection()

# Demonstrate persistent connections
client = PersistentHttpClient('httpbin.org')

print("🚀 Making multiple requests with same connection:")
for i in range(5):
    response = client.make_request(f'/get?request={i+1}')
    print(f"✅ Request {i+1} completed\n")
    time.sleep(1)  # Small delay between requests

client.close()
```

### Connection State Management

```python
from enum import Enum
import threading

class ConnectionState(Enum):
    """Possible states of a connection"""
    DISCONNECTED = "disconnected"
    CONNECTING = "connecting" 
    CONNECTED = "connected"
    ERROR = "error"
    CLOSING = "closing"

class ManagedConnection:
    """A connection with proper state management"""
  
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.socket = None
        self.state = ConnectionState.DISCONNECTED
        self.lock = threading.Lock()
        self.error_count = 0
        self.max_errors = 3
  
    def connect(self):
        """Connect with proper state management"""
        with self.lock:
            if self.state == ConnectionState.CONNECTED:
                return True  # Already connected
          
            if self.state == ConnectionState.CONNECTING:
                return False  # Connection in progress
          
            try:
                self.state = ConnectionState.CONNECTING
                print(f"🔄 Connecting to {self.host}:{self.port}")
              
                self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.socket.settimeout(10)
                self.socket.connect((self.host, self.port))
              
                self.state = ConnectionState.CONNECTED
                self.error_count = 0  # Reset error count on successful connection
              
                print(f"✅ Connected to {self.host}:{self.port}")
                return True
              
            except Exception as e:
                self.state = ConnectionState.ERROR
                self.error_count += 1
              
                print(f"❌ Connection failed: {e}")
              
                if self.error_count >= self.max_errors:
                    print(f"🚫 Max errors ({self.max_errors}) reached")
              
                return False
  
    def is_healthy(self):
        """Check if connection is healthy"""
        with self.lock:
            return (self.state == ConnectionState.CONNECTED and 
                   self.error_count < self.max_errors)
  
    def send_data(self, data):
        """Send data with error handling"""
        if not self.is_healthy():
            if not self.connect():
                raise Exception("Cannot establish connection")
      
        try:
            self.socket.send(data)
            return True
        except Exception as e:
            print(f"❌ Send error: {e}")
            self.state = ConnectionState.ERROR
            self.error_count += 1
            return False
  
    def close(self):
        """Close connection gracefully"""
        with self.lock:
            if self.socket:
                self.state = ConnectionState.CLOSING
                self.socket.close()
                self.socket = None
                self.state = ConnectionState.DISCONNECTED
                print("🔌 Connection closed")

# Usage example
conn = ManagedConnection('httpbin.org', 80)
conn.connect()
print(f"Connection healthy: {conn.is_healthy()}")
conn.close()
```

## Part 5: Real-World Connection Pooling with urllib3

### Using Production-Ready Connection Pooling

```python
import urllib3
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Create a PoolManager (this is the "right way" to do HTTP in Python)
http = urllib3.PoolManager(
    num_pools=10,        # Number of connection pools to cache
    maxsize=20,          # Maximum number of connections per pool
    timeout=30,          # Connection timeout
    retries=urllib3.util.Retry(
        total=3,
        backoff_factor=0.3,
        status_forcelist=[500, 502, 503, 504]
    )
)

def demonstrate_urllib3_pooling():
    """Show how urllib3 handles connection pooling automatically"""
  
    urls = [
        'http://httpbin.org/delay/1',
        'http://httpbin.org/get?param=1',
        'http://httpbin.org/get?param=2', 
        'http://httpbin.org/json',
        'http://httpbin.org/user-agent'
    ]
  
    # Sequential requests (will reuse connections automatically)
    print("📊 Sequential requests with automatic pooling:")
    start_time = time.time()
  
    for i, url in enumerate(urls):
        print(f"🔄 Request {i+1}: {url}")
        response = http.request('GET', url)
        print(f"✅ Status: {response.status}, Length: {len(response.data)}")
  
    sequential_time = time.time() - start_time
    print(f"⏱️  Sequential time: {sequential_time:.3f} seconds")
  
    # Concurrent requests (multiple connections from pool)
    print("\n📊 Concurrent requests with connection pooling:")
    start_time = time.time()
  
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Submit all requests concurrently
        future_to_url = {
            executor.submit(http.request, 'GET', url): url 
            for url in urls
        }
      
        # Collect results as they complete
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                response = future.result()
                print(f"✅ {url}: Status {response.status}")
            except Exception as e:
                print(f"❌ {url}: Error {e}")
  
    concurrent_time = time.time() - start_time
    print(f"⏱️  Concurrent time: {concurrent_time:.3f} seconds")
  
    speedup = sequential_time / concurrent_time
    print(f"🚀 Speedup: {speedup:.2f}x")

demonstrate_urllib3_pooling()
```

### Advanced Pool Configuration

```python
import urllib3
from urllib3.util import connection

def create_optimized_pool():
    """Create a connection pool optimized for specific use cases"""
  
    # Custom pool for high-throughput applications
    pool = urllib3.HTTPSConnectionPool(
        'api.github.com',
        port=443,
        maxsize=50,              # Large pool for high concurrency
        block=True,              # Block when pool is full (don't fail)
        timeout=urllib3.Timeout(
            connect=10,          # Time to establish connection
            read=30              # Time to read response
        ),
        retries=urllib3.util.Retry(
            total=5,
            connect=3,           # Retry connection failures
            read=2,              # Retry read failures  
            backoff_factor=0.5,  # Wait time between retries
            status_forcelist=[429, 500, 502, 503, 504]
        ),
        headers={
            'User-Agent': 'MyApp/1.0',
            'Accept': 'application/json'
        }
    )
  
    return pool

# Example: API client with optimized pooling
class GitHubAPIClient:
    """GitHub API client with optimized connection pooling"""
  
    def __init__(self, token=None):
        self.pool = create_optimized_pool()
        self.headers = {}
      
        if token:
            self.headers['Authorization'] = f'token {token}'
  
    def get_user(self, username):
        """Get user information"""
        response = self.pool.request(
            'GET', 
            f'/users/{username}',
            headers=self.headers
        )
        return response.json() if response.status == 200 else None
  
    def get_repos(self, username, per_page=30):
        """Get user repositories"""
        response = self.pool.request(
            'GET',
            f'/users/{username}/repos',
            fields={'per_page': per_page},
            headers=self.headers
        )
        return response.json() if response.status == 200 else []
  
    def close(self):
        """Close all connections in pool"""
        self.pool.clear()

# Usage
client = GitHubAPIClient()
user_info = client.get_user('octocat')
print(f"User: {user_info.get('name')} ({user_info.get('public_repos')} repos)")
client.close()
```

## Part 6: Network Protocol Optimization

### Understanding Protocol-Level Optimizations

> **Protocol Stack Optimization** : Network performance isn't just about connections - it's about optimizing every layer of the protocol stack.

```
Application Layer    ← HTTP/2, gRPC, WebSockets
Transport Layer      ← TCP tuning, connection pooling  
Network Layer        ← IP routing, DNS caching
Physical Layer       ← Network hardware, bandwidth
```

### HTTP/2 and Multiplexing

```python
import httpx  # Modern HTTP client with HTTP/2 support
import asyncio
import time

async def demonstrate_http2_benefits():
    """Show benefits of HTTP/2 multiplexing over HTTP/1.1"""
  
    urls = [
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1', 
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1'
    ]
  
    # HTTP/1.1 client (limited by connection count)
    print("📊 HTTP/1.1 with connection pooling:")
    start_time = time.time()
  
    async with httpx.AsyncClient(http2=False, limits=httpx.Limits(max_connections=2)) as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
      
    http1_time = time.time() - start_time
    print(f"⏱️  HTTP/1.1 time: {http1_time:.3f} seconds")
  
    # HTTP/2 client (can multiplex over single connection)
    print("\n📊 HTTP/2 with multiplexing:")
    start_time = time.time()
  
    async with httpx.AsyncClient(http2=True) as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
  
    http2_time = time.time() - start_time
    print(f"⏱️  HTTP/2 time: {http2_time:.3f} seconds")
  
    improvement = ((http1_time - http2_time) / http1_time) * 100
    print(f"🚀 HTTP/2 improvement: {improvement:.1f}%")

# Run the comparison
asyncio.run(demonstrate_http2_benefits())
```

### DNS Caching and Resolution Optimization

```python
import socket
import time
from functools import lru_cache

class DNSCache:
    """Simple DNS resolution cache to avoid repeated lookups"""
  
    def __init__(self, cache_size=128, ttl=300):
        self.cache = {}
        self.cache_times = {}
        self.ttl = ttl  # Time to live in seconds
      
    def resolve(self, hostname):
        """Resolve hostname with caching"""
        current_time = time.time()
      
        # Check if we have a cached result
        if hostname in self.cache:
            cache_time = self.cache_times[hostname]
            if current_time - cache_time < self.ttl:
                print(f"🎯 DNS cache hit for {hostname}")
                return self.cache[hostname]
            else:
                print(f"⏰ DNS cache expired for {hostname}")
                del self.cache[hostname]
                del self.cache_times[hostname]
      
        # Perform actual DNS lookup
        print(f"🔍 DNS lookup for {hostname}")
        start_time = time.time()
      
        try:
            ip_address = socket.gethostbyname(hostname)
            lookup_time = time.time() - start_time
          
            # Cache the result
            self.cache[hostname] = ip_address
            self.cache_times[hostname] = current_time
          
            print(f"✅ Resolved {hostname} → {ip_address} ({lookup_time:.3f}s)")
            return ip_address
          
        except socket.gaierror as e:
            print(f"❌ DNS lookup failed for {hostname}: {e}")
            raise

# Demonstrate DNS caching benefits
dns_cache = DNSCache()

hostnames = ['httpbin.org', 'api.github.com', 'httpbin.org', 'docs.python.org', 'httpbin.org']

print("📊 DNS resolution with caching:")
for hostname in hostnames:
    ip = dns_cache.resolve(hostname)
    time.sleep(0.5)  # Small delay to show caching effect
```

### TCP Socket Optimization

```python
import socket

def create_optimized_socket(host, port):
    """Create a TCP socket with performance optimizations"""
  
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  
    # Enable TCP_NODELAY to reduce latency (disable Nagle's algorithm)
    # Good for applications sending small, frequent messages
    sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
  
    # Set socket buffer sizes for high-throughput applications
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 65536)  # 64KB receive buffer
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, 65536)  # 64KB send buffer
  
    # Enable keepalive to detect dead connections
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
  
    # Platform-specific keepalive settings (Linux)
    try:
        sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPIDLE, 600)    # Start after 10 min
        sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPINTVL, 60)    # Probe every 1 min  
        sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPCNT, 3)       # Give up after 3 probes
    except AttributeError:
        # Not all platforms support these options
        pass
  
    # Set timeouts
    sock.settimeout(30)  # 30 second timeout
  
    print(f"🔧 Created optimized socket for {host}:{port}")
    return sock

def demonstrate_socket_options():
    """Show the impact of socket optimizations"""
  
    # Create optimized socket
    opt_sock = create_optimized_socket('httpbin.org', 80)
    opt_sock.connect(('httpbin.org', 80))
  
    # Check applied settings
    tcp_nodelay = opt_sock.getsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY)
    rcv_buf = opt_sock.getsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF)
    snd_buf = opt_sock.getsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF)
    keepalive = opt_sock.getsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE)
  
    print(f"📊 Socket Configuration:")
    print(f"   TCP_NODELAY: {bool(tcp_nodelay)}")
    print(f"   Receive Buffer: {rcv_buf} bytes")
    print(f"   Send Buffer: {snd_buf} bytes") 
    print(f"   Keepalive: {bool(keepalive)}")
  
    opt_sock.close()

demonstrate_socket_options()
```

## Part 7: Advanced Patterns and Best Practices

### Circuit Breaker Pattern

```python
import time
import random
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, rejecting requests
    HALF_OPEN = "half_open" # Testing if service recovered

class CircuitBreaker:
    """Circuit breaker pattern for network resilience"""
  
    def __init__(self, failure_threshold=5, timeout=60, expected_exception=Exception):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.expected_exception = expected_exception
      
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
      
        print(f"🔌 Circuit breaker initialized (threshold: {failure_threshold}, timeout: {timeout}s)")
  
    def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection"""
      
        if self.state == CircuitState.OPEN:
            # Check if timeout period has passed
            if time.time() - self.last_failure_time >= self.timeout:
                self.state = CircuitState.HALF_OPEN
                print("🔄 Circuit breaker: OPEN → HALF_OPEN (testing)")
            else:
                print("🚫 Circuit breaker OPEN - request rejected")
                raise Exception("Circuit breaker is OPEN")
      
        try:
            # Execute the actual function
            result = func(*args, **kwargs)
          
            # Success! Reset failure count
            if self.state == CircuitState.HALF_OPEN:
                print("✅ Circuit breaker: HALF_OPEN → CLOSED (service recovered)")
                self.state = CircuitState.CLOSED
                self.failure_count = 0
          
            return result
          
        except self.expected_exception as e:
            # Handle expected failures
            self.failure_count += 1
            self.last_failure_time = time.time()
          
            print(f"❌ Failure {self.failure_count}/{self.failure_threshold}: {e}")
          
            if self.failure_count >= self.failure_threshold:
                self.state = CircuitState.OPEN
                print(f"🔴 Circuit breaker: CLOSED → OPEN (too many failures)")
          
            raise

# Simulate unreliable network service
def unreliable_api_call(request_id):
    """Simulate an API that fails randomly"""
    if random.random() < 0.6:  # 60% failure rate
        raise Exception(f"Network timeout for request {request_id}")
    return f"Success: Response for request {request_id}"

# Test circuit breaker
circuit_breaker = CircuitBreaker(failure_threshold=3, timeout=10)

print("🧪 Testing circuit breaker pattern:")
for i in range(10):
    try:
        result = circuit_breaker.call(unreliable_api_call, i+1)
        print(f"✅ {result}")
    except Exception as e:
        print(f"❌ Request {i+1} failed: {e}")
  
    time.sleep(1)
```

### Retry with Exponential Backoff

```python
import time
import random
import math

class RetryManager:
    """Intelligent retry manager with exponential backoff"""
  
    def __init__(self, max_retries=3, base_delay=1, max_delay=60, backoff_factor=2):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.backoff_factor = backoff_factor
  
    def execute_with_retry(self, func, *args, **kwargs):
        """Execute function with intelligent retry logic"""
      
        for attempt in range(self.max_retries + 1):
            try:
                print(f"🔄 Attempt {attempt + 1}/{self.max_retries + 1}")
                result = func(*args, **kwargs)
              
                if attempt > 0:
                    print(f"✅ Success after {attempt + 1} attempts")
              
                return result
              
            except Exception as e:
                if attempt == self.max_retries:
                    print(f"❌ Final failure after {attempt + 1} attempts: {e}")
                    raise
              
                # Calculate delay with exponential backoff + jitter
                delay = min(
                    self.base_delay * (self.backoff_factor ** attempt),
                    self.max_delay
                )
              
                # Add jitter to prevent thundering herd
                jitter = random.uniform(0, 0.1) * delay
                total_delay = delay + jitter
              
                print(f"⏰ Retry in {total_delay:.2f} seconds (attempt {attempt + 1} failed: {e})")
                time.sleep(total_delay)

# Example: Retry manager with different strategies
def demonstrate_retry_strategies():
    """Compare different retry strategies"""
  
    def flaky_service(success_rate=0.3):
        """Simulate a flaky service"""
        if random.random() < success_rate:
            return "Service response: OK"
        else:
            raise Exception("Service temporarily unavailable")
  
    # Strategy 1: Simple retry (not recommended)
    print("📊 Simple retry strategy:")
    simple_retry = RetryManager(max_retries=3, base_delay=1, backoff_factor=1)  # Fixed delay
  
    try:
        result = simple_retry.execute_with_retry(flaky_service, 0.4)
        print(f"Result: {result}")
    except Exception as e:
        print(f"Failed: {e}")
  
    print("\n" + "="*50 + "\n")
  
    # Strategy 2: Exponential backoff (recommended)
    print("📊 Exponential backoff strategy:")
    exp_retry = RetryManager(max_retries=3, base_delay=1, backoff_factor=2)  # Exponential
  
    try:
        result = exp_retry.execute_with_retry(flaky_service, 0.4)
        print(f"Result: {result}")
    except Exception as e:
        print(f"Failed: {e}")

demonstrate_retry_strategies()
```

### Production-Ready HTTP Client

```python
import httpx
import asyncio
from typing import Optional, Dict, Any
import logging

class ProductionHTTPClient:
    """Production-ready HTTP client with all optimizations"""
  
    def __init__(
        self, 
        base_url: str = "",
        timeout: int = 30,
        max_connections: int = 100,
        max_keepalive: int = 20,
        retries: int = 3,
        enable_http2: bool = True
    ):
        # Configure connection limits
        limits = httpx.Limits(
            max_connections=max_connections,
            max_keepalive_connections=max_keepalive
        )
      
        # Configure timeouts  
        timeout_config = httpx.Timeout(
            connect=10.0,  # Connection timeout
            read=timeout,  # Read timeout
            write=10.0,    # Write timeout
            pool=5.0       # Pool acquisition timeout
        )
      
        # Configure retries
        transport = httpx.AsyncHTTPTransport(
            limits=limits,
            http2=enable_http2,
            retries=retries
        )
      
        self.client = httpx.AsyncClient(
            base_url=base_url,
            timeout=timeout_config,
            transport=transport,
            headers={
                'User-Agent': 'ProductionApp/1.0',
                'Accept': 'application/json',
                'Connection': 'keep-alive'
            }
        )
      
        # Setup logging
        self.logger = logging.getLogger(__name__)
      
        print(f"🚀 Production HTTP client initialized:")
        print(f"   Base URL: {base_url}")
        print(f"   Max connections: {max_connections}")
        print(f"   Keep-alive connections: {max_keepalive}")
        print(f"   HTTP/2 enabled: {enable_http2}")
        print(f"   Timeout: {timeout}s")
        print(f"   Retries: {retries}")
  
    async def get(self, url: str, **kwargs) -> Optional[Dict[Any, Any]]:
        """GET request with error handling"""
        try:
            self.logger.info(f"GET {url}")
            response = await self.client.get(url, **kwargs)
            response.raise_for_status()
          
            return response.json()
          
        except httpx.TimeoutException:
            self.logger.error(f"Timeout for GET {url}")
            return None
          
        except httpx.HTTPStatusError as e:
            self.logger.error(f"HTTP {e.response.status_code} for GET {url}")
            return None
          
        except Exception as e:
            self.logger.error(f"Unexpected error for GET {url}: {e}")
            return None
  
    async def post(self, url: str, data: Dict = None, **kwargs) -> Optional[Dict[Any, Any]]:
        """POST request with error handling"""
        try:
            self.logger.info(f"POST {url}")
            response = await self.client.post(url, json=data, **kwargs)
            response.raise_for_status()
          
            return response.json()
          
        except httpx.TimeoutException:
            self.logger.error(f"Timeout for POST {url}")
            return None
          
        except httpx.HTTPStatusError as e:
            self.logger.error(f"HTTP {e.response.status_code} for POST {url}")
            return None
          
        except Exception as e:
            self.logger.error(f"Unexpected error for POST {url}: {e}")
            return None
  
    async def batch_get(self, urls: list) -> list:
        """Perform multiple GET requests concurrently"""
        self.logger.info(f"Batch GET: {len(urls)} URLs")
      
        tasks = [self.get(url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
      
        return results
  
    async def close(self):
        """Close the HTTP client and all connections"""
        await self.client.aclose()
        self.logger.info("HTTP client closed")
  
    async def __aenter__(self):
        return self
  
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

# Usage example
async def demonstrate_production_client():
    """Demonstrate the production HTTP client"""
  
    async with ProductionHTTPClient(
        base_url="https://httpbin.org",
        max_connections=50,
        enable_http2=True
    ) as client:
      
        # Single request
        user_data = await client.get("/get?user=123")
        print(f"Single request result: {user_data is not None}")
      
        # Batch requests
        urls = [f"/get?id={i}" for i in range(5)]
        batch_results = await client.batch_get(urls)
      
        successful_requests = sum(1 for result in batch_results if result is not None)
        print(f"Batch requests: {successful_requests}/{len(urls)} successful")

# Run the demonstration
asyncio.run(demonstrate_production_client())
```

## Part 8: Performance Monitoring and Debugging

### Connection Pool Monitoring

```python
import threading
import time
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class ConnectionStats:
    """Statistics for connection pool monitoring"""
    total_connections_created: int = 0
    active_connections: int = 0
    idle_connections: int = 0
    requests_served: int = 0
    connection_errors: int = 0
    average_response_time: float = 0.0
    pool_exhaustions: int = 0

class MonitoredConnectionPool:
    """Connection pool with comprehensive monitoring"""
  
    def __init__(self, host, port, max_size=10):
        self.host = host
        self.port = port
        self.max_size = max_size
        self.connections = []
        self.stats = ConnectionStats()
        self.lock = threading.Lock()
        self.response_times = []
      
        print(f"📊 Monitored pool created for {host}:{port} (max: {max_size})")
  
    def get_connection(self):
        """Get connection with monitoring"""
        with self.lock:
            if self.connections:
                # Reuse existing connection
                conn = self.connections.pop()
                self.stats.active_connections += 1
                self.stats.idle_connections -= 1
                return conn
          
            elif self.stats.total_connections_created < self.max_size:
                # Create new connection
                conn = self._create_new_connection()
                self.stats.total_connections_created += 1
                self.stats.active_connections += 1
                return conn
          
            else:
                # Pool exhausted
                self.stats.pool_exhaustions += 1
                print("⚠️  Pool exhausted - waiting for available connection")
                raise Exception("Connection pool exhausted")
  
    def _create_new_connection(self):
        """Create new connection (mocked for demo)"""
        print(f"🔌 Creating connection #{self.stats.total_connections_created + 1}")
        # In real implementation, this would create actual socket connection
        return f"Connection-{self.stats.total_connections_created + 1}"
  
    def return_connection(self, conn, response_time=None):
        """Return connection to pool with monitoring"""
        with self.lock:
            self.connections.append(conn)
            self.stats.active_connections -= 1
            self.stats.idle_connections += 1
            self.stats.requests_served += 1
          
            if response_time:
                self.response_times.append(response_time)
                # Keep only last 100 response times for average calculation
                if len(self.response_times) > 100:
                    self.response_times.pop(0)
              
                self.stats.average_response_time = sum(self.response_times) / len(self.response_times)
  
    def record_error(self):
        """Record connection error"""
        with self.lock:
            self.stats.connection_errors += 1
  
    def get_stats(self) -> Dict:
        """Get current pool statistics"""
        with self.lock:
            return {
                'total_created': self.stats.total_connections_created,
                'active': self.stats.active_connections,
                'idle': self.stats.idle_connections,
                'requests_served': self.stats.requests_served,
                'errors': self.stats.connection_errors,
                'avg_response_time': f"{self.stats.average_response_time:.3f}s",
                'pool_exhaustions': self.stats.pool_exhaustions,
                'pool_utilization': f"{(self.stats.active_connections / self.max_size) * 100:.1f}%"
            }
  
    def print_stats(self):
        """Print formatted statistics"""
        stats = self.get_stats()
        print("\n📊 Connection Pool Statistics:")
        for key, value in stats.items():
            print(f"   {key.replace('_', ' ').title()}: {value}")

# Demonstrate monitoring
pool = MonitoredConnectionPool('api.example.com', 443, max_size=5)

# Simulate requests with monitoring
for i in range(10):
    try:
        # Get connection
        conn = pool.get_connection()
      
        # Simulate request processing
        processing_time = 0.1 + (i * 0.02)  # Variable response times
        time.sleep(processing_time)
      
        # Return connection
        pool.return_connection(conn, processing_time)
      
        if i % 3 == 0:  # Print stats every few requests
            pool.print_stats()
      
    except Exception as e:
        pool.record_error()
        print(f"❌ Request {i+1} failed: {e}")

# Final statistics
pool.print_stats()
```

> **Production Monitoring** : In production systems, connection pool metrics should be exported to monitoring systems like Prometheus, DataDog, or CloudWatch for alerting and analysis.

### Network Latency Analysis

```python
import time
import statistics
import matplotlib.pyplot as plt  # For visualization
from typing import List, Tuple

class NetworkLatencyProfiler:
    """Tool for analyzing network latency patterns"""
  
    def __init__(self):
        self.measurements = []
  
    def measure_request(self, func, *args, **kwargs) -> Tuple[any, float]:
        """Measure request latency"""
        start_time = time.perf_counter()
      
        try:
            result = func(*args, **kwargs)
            success = True
        except Exception as e:
            result = e
            success = False
      
        end_time = time.perf_counter()
        latency = end_time - start_time
      
        self.measurements.append({
            'timestamp': start_time,
            'latency': latency,
            'success': success
        })
      
        return result, latency
  
    def analyze_latency(self) -> Dict:
        """Analyze collected latency measurements"""
        if not self.measurements:
            return {}
      
        latencies = [m['latency'] for m in self.measurements if m['success']]
      
        if not latencies:
            return {'error': 'No successful requests to analyze'}
      
        analysis = {
            'count': len(latencies),
            'mean': statistics.mean(latencies),
            'median': statistics.median(latencies),
            'min': min(latencies),
            'max': max(latencies),
            'std_dev': statistics.stdev(latencies) if len(latencies) > 1 else 0,
        }
      
        # Calculate percentiles
        sorted_latencies = sorted(latencies)
        analysis['p95'] = sorted_latencies[int(0.95 * len(sorted_latencies))]
        analysis['p99'] = sorted_latencies[int(0.99 * len(sorted_latencies))]
      
        # Success rate
        total_requests = len(self.measurements)
        successful_requests = len(latencies)
        analysis['success_rate'] = (successful_requests / total_requests) * 100
      
        return analysis
  
    def print_analysis(self):
        """Print formatted latency analysis"""
        analysis = self.analyze_latency()
      
        if 'error' in analysis:
            print(f"❌ {analysis['error']}")
            return
      
        print("\n📊 Network Latency Analysis:")
        print(f"   Total requests: {analysis['count']}")
        print(f"   Success rate: {analysis['success_rate']:.1f}%")
        print(f"   Mean latency: {analysis['mean']*1000:.1f}ms")
        print(f"   Median latency: {analysis['median']*1000:.1f}ms")
        print(f"   Min latency: {analysis['min']*1000:.1f}ms")
        print(f"   Max latency: {analysis['max']*1000:.1f}ms")
        print(f"   95th percentile: {analysis['p95']*1000:.1f}ms")
        print(f"   99th percentile: {analysis['p99']*1000:.1f}ms")
        print(f"   Std deviation: {analysis['std_dev']*1000:.1f}ms")

# Simulate network requests for profiling
def mock_network_request(request_id):
    """Mock network request with variable latency"""
    import random
  
    # Simulate different latency patterns
    base_latency = 0.1  # 100ms base
    random_jitter = random.uniform(0, 0.05)  # Up to 50ms jitter
  
    # Occasionally simulate slow requests
    if random.random() < 0.1:  # 10% chance of slow request
        base_latency += random.uniform(0.5, 1.0)  # Add 500-1000ms
  
    time.sleep(base_latency + random_jitter)
  
    # Occasionally simulate failures
    if random.random() < 0.05:  # 5% failure rate
        raise Exception(f"Network timeout for request {request_id}")
  
    return f"Response {request_id}"

# Profile network requests
profiler = NetworkLatencyProfiler()

print("🔍 Profiling network requests...")
for i in range(20):
    result, latency = profiler.measure_request(mock_network_request, i+1)
  
    if isinstance(result, Exception):
        print(f"❌ Request {i+1}: {result} ({latency*1000:.1f}ms)")
    else:
        print(f"✅ Request {i+1}: Success ({latency*1000:.1f}ms)")

# Analyze results
profiler.print_analysis()
```

## Summary: Key Takeaways

> **The Network I/O Optimization Hierarchy** :
>
> 1. **Connection Reuse** - Avoid connection overhead through pooling
> 2. **Protocol Optimization** - Use HTTP/2, persistent connections, proper headers
> 3. **Error Handling** - Implement circuit breakers, intelligent retries
> 4. **Monitoring** - Track performance metrics and optimize based on data
> 5. **System Tuning** - Optimize TCP settings, DNS caching, buffer sizes

### When to Use Each Pattern:

 **Connection Pooling** : Essential for any application making multiple requests to the same hosts. Provides 20-70% performance improvement.

 **Persistent Connections** : Use for applications with sequential requests or when you control both client and server. Most effective with HTTP/1.1 keep-alive.

 **HTTP/2 Multiplexing** : Best for applications making many concurrent requests to modern servers. Can provide 30-50% improvement over HTTP/1.1.

 **Circuit Breakers** : Critical for distributed systems to prevent cascade failures. Implement when calling external services.

 **Retry with Backoff** : Use for handling transient network errors. Always include jitter to prevent thundering herd problems.

> **Production Checklist** :
> ✅ Use production-grade HTTP libraries (urllib3, httpx, requests-futures)
>
> ✅ Configure appropriate timeouts (connect, read, write)
>
> ✅ Implement connection pooling with proper limits
>
> ✅ Add circuit breakers for external service calls
>
> ✅ Use exponential backoff for retries
>
> ✅ Monitor connection pool metrics
>
> ✅ Profile network latency patterns
>
> ✅ Configure TCP socket options for your use case
>
> ✅ Implement proper error handling and logging
>
> ✅ Test under realistic network conditions

The key insight is that network I/O optimization is about **managing resources efficiently** - connections are expensive to create but cheap to reuse, so the goal is to minimize waste while maximizing throughput and reliability.
