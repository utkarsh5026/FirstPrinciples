# HTTP Performance in Python: From First Principles

Let me build this explanation from the ground up, starting with fundamental networking concepts and progressing to advanced Python HTTP performance techniques.

## Foundation: Understanding HTTP and Network Performance

### What is HTTP and Why Performance Matters

HTTP (HyperText Transfer Protocol) is a request-response protocol. Every time your Python program needs data from a web server, it must:

1. **Establish a connection** (TCP handshake)
2. **Send a request** (headers + optional body)
3. **Wait for response** (network latency + server processing)
4. **Receive data** (potentially large payloads)
5. **Close connection** (or keep it open)

```
Client                    Server
  |                         |
  |--- TCP Handshake ------>|  (3 round trips)
  |--- HTTP Request ------->|  (1 round trip)
  |                         |  (Server processing time)
  |<---- HTTP Response -----|  (1+ round trips for data)
  |--- Connection Close --->|  (Optional)
```

> **Key Mental Model** : Each HTTP request is expensive because of the overhead. The goal of performance optimization is to minimize this overhead through connection reuse, parallelization, and efficient data transfer.

## Core Performance Concepts

### 1. Connection Overhead Problem

Let's start with a basic example to understand the performance problem:

```python
import requests
import time

# Inefficient: Creates new connection for each request
def slow_multiple_requests():
    urls = [
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1', 
        'https://httpbin.org/delay/1'
    ]
  
    start = time.time()
    for url in urls:
        # Each request creates NEW TCP connection
        response = requests.get(url)
        print(f"Status: {response.status_code}")
  
    print(f"Total time: {time.time() - start:.2f}s")
    # Expected: ~6-9 seconds (3 requests + connection overhead)

slow_multiple_requests()
```

 **Problem** : Each `requests.get()` creates a new TCP connection, which involves:

* DNS lookup (if not cached)
* TCP handshake (3 round trips)
* TLS handshake (2-3 additional round trips for HTTPS)

## Solution 1: HTTP Keep-Alive and Connection Pooling

### Understanding Keep-Alive

HTTP Keep-Alive allows multiple requests to reuse the same TCP connection:

```python
import requests
import time

# Efficient: Reuse connections with Session
def fast_multiple_requests():
    urls = [
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1', 
        'https://httpbin.org/delay/1'
    ]
  
    start = time.time()
  
    # Session maintains connection pool
    with requests.Session() as session:
        for url in urls:
            # Reuses existing connection to same host
            response = session.get(url)
            print(f"Status: {response.status_code}")
  
    print(f"Total time: {time.time() - start:.2f}s")
    # Expected: ~3-4 seconds (much faster!)

fast_multiple_requests()
```

### Deep Dive: How Connection Pooling Works

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configure connection pooling explicitly
def advanced_connection_pooling():
    session = requests.Session()
  
    # Create custom adapter with connection pool settings
    adapter = HTTPAdapter(
        pool_connections=10,     # Number of connection pools
        pool_maxsize=20,         # Max connections per pool
        max_retries=Retry(
            total=3,
            backoff_factor=0.3,
            status_forcelist=[500, 502, 503, 504]
        )
    )
  
    # Mount adapter for both HTTP and HTTPS
    session.mount('http://', adapter)
    session.mount('https://', adapter)
  
    return session

# Usage
session = advanced_connection_pooling()
```

> **Connection Pool Mental Model** : Think of a connection pool as a parking garage. Instead of building a new garage (connection) every time you visit a store (make a request), you park in an existing garage and reuse it for multiple trips to the same area (host).

### Visualizing Connection Reuse

```
Without Keep-Alive:
Request 1: [Connect] → [Request] → [Response] → [Close]
Request 2: [Connect] → [Request] → [Response] → [Close]
Request 3: [Connect] → [Request] → [Response] → [Close]

With Keep-Alive:
[Connect] → [Request 1] → [Response 1] → [Request 2] → [Response 2] → [Request 3] → [Response 3] → [Close]
```

## Solution 2: HTTP/2 Support

### Understanding HTTP/2 Benefits

HTTP/2 introduces several performance improvements:

* **Multiplexing** : Multiple requests over single connection
* **Header compression** : Reduces overhead
* **Server push** : Server can send resources before requested
* **Stream prioritization** : Important requests processed first

```python
import httpx  # Modern HTTP client with HTTP/2 support
import asyncio
import time

# HTTP/2 with multiplexing
async def http2_requests():
    urls = [
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1', 
        'https://httpbin.org/delay/1'
    ]
  
    start = time.time()
  
    # Enable HTTP/2
    async with httpx.AsyncClient(http2=True) as client:
        # All requests can be sent simultaneously over single connection
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
      
        for response in responses:
            print(f"Status: {response.status_code}")
  
    print(f"Total time: {time.time() - start:.2f}s")
    # Expected: ~1-2 seconds (truly parallel!)

# Run the async function
asyncio.run(http2_requests())
```

### HTTP/2 vs HTTP/1.1 Comparison

```python
import httpx
import requests
import asyncio
import time

async def compare_protocols():
    urls = ['https://httpbin.org/delay/0.5'] * 6
  
    # HTTP/1.1 with requests (keep-alive but sequential)
    start = time.time()
    with requests.Session() as session:
        for url in urls:
            response = session.get(url)
    http1_time = time.time() - start
  
    # HTTP/2 with httpx (parallel multiplexing)
    start = time.time()
    async with httpx.AsyncClient(http2=True) as client:
        tasks = [client.get(url) for url in urls]
        await asyncio.gather(*tasks)
    http2_time = time.time() - start
  
    print(f"HTTP/1.1 time: {http1_time:.2f}s")
    print(f"HTTP/2 time: {http2_time:.2f}s")
    print(f"Speedup: {http1_time/http2_time:.1f}x")

asyncio.run(compare_protocols())
```

> **HTTP/2 Mental Model** : HTTP/1.1 is like a single-lane road where cars (requests) must wait in line. HTTP/2 is like a multi-lane highway where multiple cars can travel simultaneously, plus traffic signals are optimized (header compression) and there are express lanes (prioritization).

## Solution 3: Request Batching

### Batching Similar Requests

When you need to make many similar requests, batching can reduce overhead:

```python
import httpx
import asyncio
from typing import List, Dict, Any

class HTTPBatcher:
    def __init__(self, max_batch_size: int = 10, max_concurrent: int = 5):
        self.max_batch_size = max_batch_size
        self.max_concurrent = max_concurrent
        self.client = httpx.AsyncClient(http2=True)
  
    async def batch_get_requests(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Process URLs in concurrent batches"""
        results = []
      
        # Split URLs into batches
        for i in range(0, len(urls), self.max_batch_size):
            batch = urls[i:i + self.max_batch_size]
          
            # Process batch concurrently
            semaphore = asyncio.Semaphore(self.max_concurrent)
          
            async def fetch_with_semaphore(url):
                async with semaphore:  # Limit concurrent requests
                    try:
                        response = await self.client.get(url)
                        return {
                            'url': url,
                            'status': response.status_code,
                            'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                        }
                    except Exception as e:
                        return {'url': url, 'error': str(e)}
          
            # Execute batch
            batch_results = await asyncio.gather(
                *[fetch_with_semaphore(url) for url in batch]
            )
            results.extend(batch_results)
      
        return results
  
    async def close(self):
        await self.client.aclose()

# Usage example
async def batch_api_calls():
    # Simulate calling an API with different parameters
    base_url = "https://httpbin.org/delay/0.2"
    urls = [f"{base_url}?id={i}" for i in range(20)]
  
    batcher = HTTPBatcher(max_batch_size=5, max_concurrent=3)
  
    start = time.time()
    results = await batcher.batch_get_requests(urls)
    end = time.time()
  
    print(f"Processed {len(results)} requests in {end-start:.2f}s")
    print(f"Success rate: {sum(1 for r in results if 'error' not in r)}/{len(results)}")
  
    await batcher.close()

# asyncio.run(batch_api_calls())
```

### Smart Batching with Rate Limiting

```python
import asyncio
import time
from collections import deque

class RateLimitedBatcher:
    def __init__(self, requests_per_second: float = 10):
        self.requests_per_second = requests_per_second
        self.request_times = deque()
        self.client = httpx.AsyncClient()
  
    async def rate_limited_request(self, url: str):
        """Make request while respecting rate limits"""
        now = time.time()
      
        # Remove old requests (older than 1 second)
        while self.request_times and self.request_times[0] < now - 1:
            self.request_times.popleft()
      
        # Wait if we've hit the rate limit
        if len(self.request_times) >= self.requests_per_second:
            sleep_time = 1 - (now - self.request_times[0])
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
      
        # Record this request time
        self.request_times.append(time.time())
      
        # Make the request
        return await self.client.get(url)

# Example usage with API that has rate limits
async def rate_limited_example():
    batcher = RateLimitedBatcher(requests_per_second=5)  # 5 requests per second max
  
    urls = [f"https://httpbin.org/delay/0.1?id={i}" for i in range(15)]
  
    start = time.time()
    tasks = [batcher.rate_limited_request(url) for url in urls]
    responses = await asyncio.gather(*tasks)
    end = time.time()
  
    print(f"Made {len(responses)} requests in {end-start:.2f}s")
    print(f"Rate: {len(responses)/(end-start):.1f} requests/second")
```

## Solution 4: Response Streaming

### Understanding Streaming Benefits

For large responses, streaming prevents memory issues and enables processing data as it arrives:

```python
import requests
import json

# Non-streaming: Loads entire response into memory
def download_large_file_bad():
    url = "https://httpbin.org/stream/1000"  # 1000 lines of JSON
  
    response = requests.get(url)  # Loads ALL data into memory
    data = response.text
  
    # Problem: What if this was a 1GB file?
    print(f"Downloaded {len(data)} characters")

# Streaming: Process data chunk by chunk
def download_large_file_good():
    url = "https://httpbin.org/stream/1000"
  
    with requests.get(url, stream=True) as response:
        response.raise_for_status()
      
        processed_lines = 0
        for line in response.iter_lines():
            if line:  # Skip empty lines
                # Process each JSON line as it arrives
                data = json.loads(line)
                processed_lines += 1
              
                # You could save to database, transform, etc.
                if processed_lines % 100 == 0:
                    print(f"Processed {processed_lines} lines...")
      
        print(f"Total processed: {processed_lines} lines")

download_large_file_good()
```

### Advanced Streaming with Async

```python
import httpx
import asyncio
import json

async def stream_and_process():
    url = "https://httpbin.org/stream/500"
  
    async with httpx.AsyncClient() as client:
        async with client.stream('GET', url) as response:
            response.raise_for_status()
          
            buffer = ""
            processed = 0
          
            # Stream response chunk by chunk
            async for chunk in response.aiter_bytes(chunk_size=1024):
                buffer += chunk.decode('utf-8')
              
                # Process complete lines
                while '\n' in buffer:
                    line, buffer = buffer.split('\n', 1)
                    if line.strip():
                        try:
                            data = json.loads(line)
                            processed += 1
                          
                            # Simulate processing (could be async database write)
                            if processed % 50 == 0:
                                print(f"Processed {processed} items...")
                                await asyncio.sleep(0.01)  # Simulate async work
                      
                        except json.JSONDecodeError:
                            continue
          
            print(f"Streaming complete: {processed} items processed")

# asyncio.run(stream_and_process())
```

### Streaming for File Downloads

```python
import httpx
import asyncio
from pathlib import Path

async def download_file_with_progress(url: str, filename: str):
    """Download large file with progress tracking"""
  
    async with httpx.AsyncClient() as client:
        async with client.stream('GET', url) as response:
            response.raise_for_status()
          
            total_size = int(response.headers.get('content-length', 0))
            downloaded = 0
          
            with open(filename, 'wb') as file:
                async for chunk in response.aiter_bytes(chunk_size=8192):
                    file.write(chunk)
                    downloaded += len(chunk)
                  
                    # Show progress
                    if total_size > 0:
                        percent = (downloaded / total_size) * 100
                        print(f"\rDownloading: {percent:.1f}% ({downloaded}/{total_size} bytes)", end="")
                    else:
                        print(f"\rDownloaded: {downloaded} bytes", end="")
          
            print(f"\nDownload complete: {filename}")

# Example usage
# asyncio.run(download_file_with_progress(
#     "https://httpbin.org/bytes/1000000", 
#     "large_file.bin"
# ))
```

## Putting It All Together: High-Performance HTTP Client

Here's a comprehensive example combining all techniques:

```python
import httpx
import asyncio
import time
import json
from typing import List, Dict, Any, Optional, Union
from dataclasses import dataclass
from collections import deque
import logging

@dataclass
class RequestConfig:
    """Configuration for HTTP requests"""
    max_concurrent: int = 10
    requests_per_second: float = 20
    timeout: float = 30
    max_retries: int = 3
    backoff_factor: float = 0.5
    http2: bool = True
    
class HighPerformanceHTTPClient:
    """
    A high-performance HTTP client that combines:
    - HTTP/2 support with multiplexing
    - Connection pooling and keep-alive
    - Request batching and rate limiting
    - Response streaming
    - Automatic retries with exponential backoff
    """
    
    def __init__(self, config: RequestConfig = None):
        self.config = config or RequestConfig()
        self.client = None
        self.request_times = deque()
        self.semaphore = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()
    
    async def start(self):
        """Initialize the HTTP client"""
        # Configure HTTP client with optimizations
        limits = httpx.Limits(
            max_keepalive_connections=20,
            max_connections=100,
            keepalive_expiry=30.0
        )
        
        timeout = httpx.Timeout(
            timeout=self.config.timeout,
            connect=10.0,
            read=self.config.timeout,
            write=10.0,
            pool=5.0
        )
        
        self.client = httpx.AsyncClient(
            http2=self.config.http2,
            limits=limits,
            timeout=timeout,
            follow_redirects=True
        )
        
        # Semaphore for controlling concurrency
        self.semaphore = asyncio.Semaphore(self.config.max_concurrent)
    
    async def close(self):
        """Clean up resources"""
        if self.client:
            await self.client.aclose()
    
    async def _rate_limit(self):
        """Implement rate limiting"""
        if self.config.requests_per_second <= 0:
            return
        
        now = time.time()
        
        # Remove old requests (older than 1 second)
        while self.request_times and self.request_times[0] < now - 1:
            self.request_times.popleft()
        
        # Wait if we've hit the rate limit
        if len(self.request_times) >= self.config.requests_per_second:
            sleep_time = 1 - (now - self.request_times[0])
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
        
        # Record this request time
        self.request_times.append(time.time())
    
    async def _make_request_with_retry(self, method: str, url: str, **kwargs) -> httpx.Response:
        """Make request with exponential backoff retry"""
        last_exception = None
        
        for attempt in range(self.config.max_retries + 1):
            try:
                async with self.semaphore:  # Rate limiting
                    await self._rate_limit()
                    response = await self.client.request(method, url, **kwargs)
                    
                    # Check if we should retry based on status code
                    if response.status_code >= 500 or response.status_code == 429:
                        if attempt < self.config.max_retries:
                            wait_time = self.config.backoff_factor * (2 ** attempt)
                            await asyncio.sleep(wait_time)
                            continue
                    
                    return response
                    
            except (httpx.RequestError, httpx.TimeoutException) as e:
                last_exception = e
                if attempt < self.config.max_retries:
                    wait_time = self.config.backoff_factor * (2 ** attempt)
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    raise
        
        raise last_exception
    
    async def get(self, url: str, **kwargs) -> httpx.Response:
        """GET request with all optimizations"""
        return await self._make_request_with_retry('GET', url, **kwargs)
    
    async def post(self, url: str, **kwargs) -> httpx.Response:
        """POST request with all optimizations"""
        return await self._make_request_with_retry('POST', url, **kwargs)
    
    async def batch_get(self, urls: List[str], **kwargs) -> List[Dict[str, Any]]:
        """Batch GET requests with error handling"""
        async def fetch_one(url: str) -> Dict[str, Any]:
            try:
                response = await self.get(url, **kwargs)
                return {
                    'url': url,
                    'status_code': response.status_code,
                    'headers': dict(response.headers),
                    'content': response.content,
                    'success': True
                }
            except Exception as e:
                return {
                    'url': url,
                    'error': str(e),
                    'success': False
                }
        
        # Execute all requests concurrently
        tasks = [fetch_one(url) for url in urls]
        return await asyncio.gather(*tasks)
    
    async def stream_download(self, url: str, chunk_size: int = 8192) -> AsyncIterator[bytes]:
        """Stream download with chunked reading"""
        async with self.semaphore:
            await self._rate_limit()
            
            async with self.client.stream('GET', url) as response:
                response.raise_for_status()
                
                async for chunk in response.aiter_bytes(chunk_size=chunk_size):
                    yield chunk
    
    async def download_file(self, url: str, filename: str, show_progress: bool = True) -> Dict[str, Any]:
        """Download file with progress tracking"""
        try:
            downloaded = 0
            start_time = time.time()
            
            with open(filename, 'wb') as file:
                async for chunk in self.stream_download(url):
                    file.write(chunk)
                    downloaded += len(chunk)
                    
                    if show_progress and downloaded % (1024 * 1024) == 0:  # Every MB
                        elapsed = time.time() - start_time
                        speed = downloaded / elapsed / 1024 / 1024  # MB/s
                        print(f"\rDownloaded: {downloaded/1024/1024:.1f} MB, Speed: {speed:.1f} MB/s", end="")
            
            elapsed = time.time() - start_time
            return {
                'filename': filename,
                'size': downloaded,
                'duration': elapsed,
                'speed_mbps': downloaded / elapsed / 1024 / 1024,
                'success': True
            }
            
        except Exception as e:
            return {
                'filename': filename,
                'error': str(e),
                'success': False
            }

# Example usage combining all features
async def comprehensive_example():
    """Demonstrate all HTTP performance features"""
    
    config = RequestConfig(
        max_concurrent=15,
        requests_per_second=25,
        timeout=20,
        max_retries=3,
        http2=True
    )
    
    async with HighPerformanceHTTPClient(config) as client:
        
        # 1. Batch requests with error handling
        print("1. Testing batch requests...")
        urls = [f"https://httpbin.org/delay/{i%3}" for i in range(10)]
        
        start = time.time()
        results = await client.batch_get(urls)
        batch_time = time.time() - start
        
        successful = sum(1 for r in results if r['success'])
        print(f"   Completed {successful}/{len(urls)} requests in {batch_time:.2f}s")
        
        # 2. Single optimized request
        print("\n2. Testing single request with retries...")
        response = await client.get("https://httpbin.org/status/200")
        print(f"   Status: {response.status_code}")
        
        # 3. JSON API interaction
        print("\n3. Testing JSON API...")
        json_response = await client.post(
            "https://httpbin.org/post",
            json={"test": "data", "performance": "optimized"}
        )
        data = json_response.json()
        print(f"   Echo response received: {len(str(data))} characters")
        
        # 4. Streaming download simulation
        print("\n4. Testing streaming...")
        stream_url = "https://httpbin.org/stream/100"
        
        lines_processed = 0
        async for chunk in client.stream_download(stream_url, chunk_size=1024):
            lines_processed += chunk.decode().count('\n')
        
        print(f"   Streamed and processed {lines_processed} lines")
        
        print(f"\nTotal demonstration completed successfully!")

# Performance comparison function
async def compare_approaches():
    """Compare different HTTP approaches for performance"""
    
    urls = [f"https://httpbin.org/delay/0.2" for _ in range(10)]
    
    # Method 1: Basic requests (no session)
    print("Testing basic requests (worst case)...")
    import requests
    start = time.time()
    for url in urls:
        response = requests.get(url)
    basic_time = time.time() - start
    
    # Method 2: Requests with session (better)
    print("Testing requests with session...")
    start = time.time()
    with requests.Session() as session:
        for url in urls:
            response = session.get(url)
    session_time = time.time() - start
    
    # Method 3: Our optimized client (best)
    print("Testing optimized HTTP client...")
    config = RequestConfig(max_concurrent=10, http2=True)
    async with HighPerformanceHTTPClient(config) as client:
        start = time.time()
        results = await client.batch_get(urls)
        optimized_time = time.time() - start
    
    print(f"\nPerformance Comparison:")
    print(f"Basic requests: {basic_time:.2f}s")
    print(f"Session reuse:  {session_time:.2f}s ({basic_time/session_time:.1f}x faster)")
    print(f"Optimized:      {optimized_time:.2f}s ({basic_time/optimized_time:.1f}x faster)")

if __name__ == "__main__":
    # Run the comprehensive example
    asyncio.run(comprehensive_example())
    
    # Uncomment to run performance comparison
    # asyncio.run(compare_approaches())
```

## Key Performance Principles and Best Practices

> **The Hierarchy of HTTP Performance Optimization** :
>
> 1. **Connection reuse** (biggest impact) - Use sessions/connection pools
> 2. **Concurrency** (second biggest) - Make requests in parallel when possible
> 3. **Protocol efficiency** (significant) - Use HTTP/2 when available
> 4. **Request batching** (context-dependent) - Group similar operations
> 5. **Streaming** (memory-critical) - For large responses
> 6. **Caching** (application-level) - Store responses when appropriate

### When to Use Each Technique

```python
# Decision Tree for HTTP Performance Optimization

def choose_http_strategy(scenario):
    """
    Guide for choosing the right HTTP performance strategy
    """
    strategies = {
        "single_request": "Use requests.Session() for basic optimization",
        "few_requests_same_host": "Use requests.Session() with keep-alive",
        "many_requests_parallel": "Use httpx.AsyncClient with HTTP/2",
        "rate_limited_api": "Add semaphore + rate limiting",
        "large_responses": "Use streaming with .iter_content() or .aiter_bytes()",
        "file_downloads": "Combine streaming + progress tracking",
        "unreliable_network": "Add retries with exponential backoff",
        "high_throughput": "Use all techniques: HTTP/2 + batching + connection pools"
    }
  
    return strategies.get(scenario, "Start with Session, add optimizations as needed")

# Real-world scenarios
scenarios = [
    "Calling REST API 100 times",           # → Use async batching
    "Downloading 1GB file",                 # → Use streaming
    "Scraping 1000 web pages",             # → HTTP/2 + rate limiting + retries
    "Real-time data feed",                  # → Streaming + keep-alive
    "Microservice communication"           # → Connection pooling + HTTP/2
]

for scenario in scenarios:
    print(f"{scenario}: {choose_http_strategy(scenario.split()[0])}")
```

### Memory Management and Resource Cleanup

```python
import asyncio
import httpx
from contextlib import asynccontextmanager

# Always use context managers for resource cleanup
@asynccontextmanager
async def http_client_manager(config):
    """Properly manage HTTP client lifecycle"""
    client = httpx.AsyncClient(
        http2=config.get('http2', True),
        limits=httpx.Limits(max_connections=100),
        timeout=httpx.Timeout(30.0)
    )
  
    try:
        yield client
    finally:
        # Ensures connections are properly closed
        await client.aclose()

# Usage
async def safe_http_operations():
    config = {'http2': True, 'max_concurrent': 10}
  
    async with http_client_manager(config) as client:
        # All HTTP operations here
        response = await client.get("https://httpbin.org/json")
        return response.json()
    # Client automatically cleaned up here

# For long-running applications
class HTTPClientPool:
    """Singleton pattern for shared HTTP client"""
    _instance = None
  
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.client = None
        return cls._instance
  
    async def get_client(self):
        if self.client is None:
            self.client = httpx.AsyncClient(
                http2=True,
                limits=httpx.Limits(
                    max_keepalive_connections=20,
                    max_connections=100
                )
            )
        return self.client
  
    async def close(self):
        if self.client:
            await self.client.aclose()
            self.client = None

# Usage in web applications
pool = HTTPClientPool()

async def api_call():
    client = await pool.get_client()
    return await client.get("https://api.example.com/data")

# Don't forget to close on application shutdown
# await pool.close()
```

### Error Handling and Monitoring

```python
import asyncio
import httpx
import logging
from typing import Dict, Any
from dataclasses import dataclass, field
from collections import defaultdict
import time

@dataclass
class HTTPMetrics:
    """Track HTTP performance metrics"""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    total_time: float = 0.0
    response_times: list = field(default_factory=list)
    status_codes: Dict[int, int] = field(default_factory=lambda: defaultdict(int))
    errors: Dict[str, int] = field(default_factory=lambda: defaultdict(int))
  
    def add_request(self, response_time: float, status_code: int = None, error: str = None):
        self.total_requests += 1
        self.total_time += response_time
        self.response_times.append(response_time)
      
        if error:
            self.failed_requests += 1
            self.errors[error] += 1
        else:
            self.successful_requests += 1
            self.status_codes[status_code] += 1
  
    def get_stats(self) -> Dict[str, Any]:
        if not self.response_times:
            return {"no_data": True}
      
        response_times = sorted(self.response_times)
        n = len(response_times)
      
        return {
            "total_requests": self.total_requests,
            "success_rate": self.successful_requests / self.total_requests * 100,
            "avg_response_time": sum(response_times) / n,
            "median_response_time": response_times[n // 2],
            "p95_response_time": response_times[int(n * 0.95)],
            "requests_per_second": self.total_requests / self.total_time if self.total_time > 0 else 0,
            "status_code_distribution": dict(self.status_codes),
            "error_distribution": dict(self.errors)
        }

class MonitoredHTTPClient:
    """HTTP client with built-in monitoring and error handling"""
  
    def __init__(self):
        self.client = httpx.AsyncClient(http2=True)
        self.metrics = HTTPMetrics()
        self.logger = logging.getLogger(__name__)
  
    async def request_with_monitoring(self, method: str, url: str, **kwargs) -> httpx.Response:
        """Make request with automatic monitoring"""
        start_time = time.time()
      
        try:
            response = await self.client.request(method, url, **kwargs)
            response_time = time.time() - start_time
          
            # Log based on response
            if response.status_code >= 400:
                self.logger.warning(f"{method} {url} -> {response.status_code} ({response_time:.2f}s)")
            else:
                self.logger.debug(f"{method} {url} -> {response.status_code} ({response_time:.2f}s)")
          
            self.metrics.add_request(response_time, response.status_code)
            return response
          
        except Exception as e:
            response_time = time.time() - start_time
            error_type = type(e).__name__
          
            self.logger.error(f"{method} {url} -> ERROR: {error_type} ({response_time:.2f}s)")
            self.metrics.add_request(response_time, error=error_type)
            raise
  
    async def get(self, url: str, **kwargs) -> httpx.Response:
        return await self.request_with_monitoring('GET', url, **kwargs)
  
    def print_stats(self):
        """Print performance statistics"""
        stats = self.metrics.get_stats()
      
        if stats.get("no_data"):
            print("No requests made yet")
            return
      
        print("\n📊 HTTP Performance Statistics:")
        print(f"   Total requests: {stats['total_requests']}")
        print(f"   Success rate: {stats['success_rate']:.1f}%")
        print(f"   Avg response time: {stats['avg_response_time']:.3f}s")
        print(f"   Median response time: {stats['median_response_time']:.3f}s")
        print(f"   95th percentile: {stats['p95_response_time']:.3f}s")
        print(f"   Requests/second: {stats['requests_per_second']:.1f}")
      
        if stats['status_code_distribution']:
            print(f"   Status codes: {stats['status_code_distribution']}")
      
        if stats['error_distribution']:
            print(f"   Errors: {stats['error_distribution']}")
  
    async def close(self):
        await self.client.aclose()

# Example usage with monitoring
async def monitored_example():
    client = MonitoredHTTPClient()
  
    # Make various requests to test
    urls = [
        "https://httpbin.org/status/200",
        "https://httpbin.org/status/404", 
        "https://httpbin.org/delay/1",
        "https://httpbin.org/status/500",
        "https://httpbin.org/json"
    ]
  
    try:
        for url in urls:
            try:
                response = await client.get(url)
                print(f"✓ {url} -> {response.status_code}")
            except Exception as e:
                print(f"✗ {url} -> {type(e).__name__}")
  
    finally:
        client.print_stats()
        await client.close()

# asyncio.run(monitored_example())
```

## Advanced Topics and Edge Cases

### Handling Different Content Types

```python
async def handle_different_responses():
    """Show how to efficiently handle different response types"""
  
    async with httpx.AsyncClient() as client:
      
        # JSON responses (most common in APIs)
        json_response = await client.get("https://httpbin.org/json")
        data = json_response.json()  # Automatically parsed
      
        # Large text responses (streaming)
        text_url = "https://httpbin.org/stream/1000"
        async with client.stream('GET', text_url) as response:
            text_data = ""
            async for chunk in response.aiter_text():
                text_data += chunk
                # Process incrementally to avoid memory issues
      
        # Binary data (files, images)
        binary_url = "https://httpbin.org/bytes/1024"
        binary_response = await client.get(binary_url)
        binary_data = binary_response.content  # Raw bytes
      
        # Compressed responses (automatic handling)
        compressed_url = "https://httpbin.org/gzip"
        compressed_response = await client.get(compressed_url)
        # httpx automatically decompresses gzip/deflate
      
        return {
            'json_size': len(str(data)),
            'text_size': len(text_data),
            'binary_size': len(binary_data),
            'compressed_data': compressed_response.json()
        }
```

### WebSocket Performance (Bonus)

```python
import websockets
import asyncio
import json

async def websocket_performance_example():
    """WebSockets for real-time, persistent connections"""
  
    # WebSockets eliminate HTTP overhead for real-time communication
    uri = "wss://echo.websocket.org"
  
    async with websockets.connect(uri) as websocket:
        # Send multiple messages without reconnection overhead
        for i in range(10):
            message = json.dumps({"id": i, "data": f"Message {i}"})
            await websocket.send(message)
          
            response = await websocket.recv()
            print(f"Echo: {response}")
      
        # Much more efficient than 10 HTTP requests for real-time data

# Use WebSockets when you need:
# - Real-time bidirectional communication
# - Many small messages
# - Low latency requirements
# - Persistent connection benefits outweigh HTTP simplicity
```

## Summary and Performance Checklist

> **HTTP Performance Optimization Checklist** :
>
> ✅ **Always use connection pooling** (requests.Session or httpx.AsyncClient)
>
> ✅ **Enable HTTP/2** when possible for multiplexing benefits
>
> ✅ **Use async/await** for I/O-bound operations
>
> ✅ **Implement rate limiting** to respect API limits
>
> ✅ **Add retry logic** with exponential backoff
>
> ✅ **Stream large responses** to manage memory
>
> ✅ **Monitor and measure** your actual performance
>
> ✅ **Handle errors gracefully** with proper logging
>
> ✅ **Clean up resources** with context managers
>
> ✅ **Choose the right tool** for your specific use case

### Performance Mental Models

 **Connection Pooling** : Think of it as a rental car service. Instead of buying a new car (creating a connection) for each trip (request), you rent from a shared fleet (pool) and return it when done.

 **HTTP/2 Multiplexing** : Like multiple phone conversations on a single phone line versus needing separate lines for each conversation.

 **Streaming** : Reading a book page by page versus trying to memorize the entire book at once.

 **Rate Limiting** : Following traffic lights - respecting the pace that the server (traffic system) can handle.

The key insight is that **HTTP performance is about minimizing overhead and maximizing parallelism** while respecting the constraints of the network, the server, and your own resources. Start with simple optimizations (connection reuse) and add complexity (HTTP/2, streaming, batching) only as needed for your specific use case.
