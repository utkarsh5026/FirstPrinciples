# Queue-Based Communication in Python: From First Principles

## 1. Foundation: Understanding Concurrent Execution

Before diving into queues, let's establish why we need them by understanding concurrent programming fundamentals.

### What is Concurrent Programming?

Concurrent programming means having multiple "flows of execution" running simultaneously or appearing to run simultaneously. Think of it like multiple workers in a kitchen - they need to coordinate to avoid chaos.

```python
# Sequential execution (one task after another)
def sequential_cooking():
    chop_vegetables()    # Worker waits for this to finish
    boil_water()        # Then does this
    cook_pasta()        # Finally this
  
# Concurrent execution (multiple tasks happening)
def concurrent_cooking():
    # Multiple workers can do these simultaneously
    worker1_thread = Thread(target=chop_vegetables)
    worker2_thread = Thread(target=boil_water) 
    worker3_thread = Thread(target=cook_pasta)
```

### The Fundamental Problem: Shared Data

When multiple execution contexts (threads or processes) access shared data, we get  **race conditions** :

```python
# DANGEROUS: Race condition example
shared_counter = 0

def increment_counter():
    global shared_counter
    # This looks atomic but isn't!
    # Step 1: Read current value
    # Step 2: Add 1 to it  
    # Step 3: Write back result
    shared_counter += 1

# If two threads run this simultaneously:
# Thread A reads 0, Thread B reads 0
# Thread A calculates 1, Thread B calculates 1  
# Thread A writes 1, Thread B writes 1
# Result: 1 instead of expected 2!
```

> **Key Mental Model** : Concurrent access to shared mutable data creates unpredictable behavior. We need coordination mechanisms.

## 2. Enter Queues: The Coordination Solution

### What is a Queue?

A queue is a **First-In-First-Out (FILO)** data structure - like a line at a coffee shop:

```
Queue Visualization:
[Front] ← item4 ← item3 ← item2 ← item1 [Back]
         ↑                           ↑
      (dequeue)                  (enqueue)
```

### Why Queues Solve Coordination Problems

Queues provide **controlled access** to shared data through two key properties:

1. **Atomic operations** : Put and get operations are indivisible
2. **Thread/process safety** : Built-in locking mechanisms

```python
# Instead of direct shared data access:
shared_data = []  # DANGEROUS with multiple threads

# Use a queue for safe communication:
from queue import Queue
safe_queue = Queue()  # SAFE with multiple threads
```

## 3. Thread-Safe Queues: The `queue` Module

### Basic Queue Operations

```python
import queue
import threading
import time

# Create a thread-safe queue
q = queue.Queue(maxsize=0)  # maxsize=0 means unlimited

# Producer function - puts items in queue
def producer(name, q):
    for i in range(5):
        item = f"item_{i}_from_{name}"
        q.put(item)  # Thread-safe insertion
        print(f"Producer {name} added: {item}")
        time.sleep(0.1)  # Simulate work

# Consumer function - gets items from queue  
def consumer(name, q):
    while True:
        try:
            # get() with timeout to avoid infinite blocking
            item = q.get(timeout=1)  # Thread-safe removal
            print(f"Consumer {name} got: {item}")
            q.task_done()  # Signal that task is complete
        except queue.Empty:
            print(f"Consumer {name} timed out - queue empty")
            break

# Create threads
producer_thread = threading.Thread(target=producer, args=("P1", q))
consumer_thread = threading.Thread(target=consumer, args=("C1", q))

# Start threads
producer_thread.start()
consumer_thread.start()

# Wait for completion
producer_thread.join()
consumer_thread.join()
```

### Queue Types and Their Use Cases

```python
import queue

# 1. FIFO Queue (First In, First Out) - Default
fifo_q = queue.Queue()
fifo_q.put("first")
fifo_q.put("second") 
print(fifo_q.get())  # Output: "first"

# 2. LIFO Queue (Last In, First Out) - Stack behavior
lifo_q = queue.LifoQueue()
lifo_q.put("first")
lifo_q.put("second")
print(lifo_q.get())  # Output: "second"

# 3. Priority Queue - Items with lower numbers have higher priority
prio_q = queue.PriorityQueue()
prio_q.put((3, "low priority"))
prio_q.put((1, "high priority"))
prio_q.put((2, "medium priority"))

print(prio_q.get())  # Output: (1, "high priority")
print(prio_q.get())  # Output: (2, "medium priority")
print(prio_q.get())  # Output: (3, "low priority")
```

### Advanced Queue Features

```python
import queue
import threading

# Queue with size limit
limited_q = queue.Queue(maxsize=2)

def demonstrate_blocking():
    # These will succeed
    limited_q.put("item1")
    limited_q.put("item2")
  
    try:
        # This will block indefinitely if queue is full
        limited_q.put("item3", block=True, timeout=2)
    except queue.Full:
        print("Queue is full - couldn't add item3")
  
    # Non-blocking put
    try:
        limited_q.put_nowait("item4")
    except queue.Full:
        print("Queue full - put_nowait failed")

# Queue coordination with task_done() and join()
work_q = queue.Queue()

def worker():
    while True:
        item = work_q.get()
        if item is None:  # Poison pill to stop worker
            break
        print(f"Processing {item}")
        time.sleep(1)  # Simulate work
        work_q.task_done()  # Mark task as done

# Start worker thread
worker_thread = threading.Thread(target=worker)
worker_thread.start()

# Add work items
for i in range(3):
    work_q.put(f"task_{i}")

# Wait for all tasks to complete
work_q.join()  # Blocks until all task_done() called

# Stop worker
work_q.put(None)  # Poison pill
worker_thread.join()
```

## 4. Process-Safe Queues: The `multiprocessing` Module

### Why Processes Need Different Queues

Threads share memory space, but processes have  **separate memory spaces** :

```
Thread Model:
┌─────────────────────────────────┐
│        Shared Memory Space      │
│  ┌─────────┐    ┌─────────┐    │
│  │Thread 1 │    │Thread 2 │    │  
│  └─────────┘    └─────────┘    │
└─────────────────────────────────┘

Process Model:
┌───────────────┐    ┌───────────────┐
│   Process 1   │    │   Process 2   │
│ ┌───────────┐ │    │ ┌───────────┐ │
│ │  Memory   │ │    │ │  Memory   │ │
│ └───────────┘ │    │ └───────────┘ │
└───────────────┘    └───────────────┘
        │                    │
        └────── IPC ─────────┘
     (Inter-Process Communication)
```

### Basic Multiprocessing Queue

```python
import multiprocessing as mp
import time

def producer_process(q, name):
    """Producer that runs in separate process"""
    for i in range(3):
        item = f"item_{i}_from_{name}"
        q.put(item)  # Process-safe insertion
        print(f"Process {name} produced: {item}")
        time.sleep(0.5)

def consumer_process(q, name):
    """Consumer that runs in separate process"""
    while True:
        try:
            item = q.get(timeout=2)  # Process-safe removal
            print(f"Process {name} consumed: {item}")
            time.sleep(0.3)
        except:  # Queue empty or timeout
            print(f"Consumer {name} finished")
            break

if __name__ == "__main__":  # Required for multiprocessing
    # Create process-safe queue
    process_queue = mp.Queue()
  
    # Create processes
    p1 = mp.Process(target=producer_process, args=(process_queue, "Producer1"))
    p2 = mp.Process(target=producer_process, args=(process_queue, "Producer2"))
    c1 = mp.Process(target=consumer_process, args=(process_queue, "Consumer1"))
  
    # Start processes
    p1.start()
    p2.start()
    c1.start()
  
    # Wait for completion
    p1.join()
    p2.join()
    c1.join()
  
    print("All processes completed")
```

### Manager Queues for Complex Objects

```python
import multiprocessing as mp

def worker_with_manager(shared_queue, shared_dict, worker_id):
    """Worker that uses manager for shared objects"""
    while True:
        try:
            task = shared_queue.get(timeout=1)
            result = task ** 2  # Square the number
          
            # Store result in shared dictionary
            shared_dict[f"worker_{worker_id}_result"] = result
            print(f"Worker {worker_id}: {task}² = {result}")
          
        except:
            break

if __name__ == "__main__":
    # Manager allows sharing complex objects between processes
    with mp.Manager() as manager:
        # Create managed queue and dictionary
        managed_queue = manager.Queue()
        managed_dict = manager.dict()
      
        # Add tasks to queue
        for i in range(5):
            managed_queue.put(i + 1)
      
        # Create worker processes
        processes = []
        for worker_id in range(2):
            p = mp.Process(
                target=worker_with_manager, 
                args=(managed_queue, managed_dict, worker_id)
            )
            processes.append(p)
            p.start()
      
        # Wait for workers to finish
        for p in processes:
            p.join()
      
        # Print shared results
        print("Final results:", dict(managed_dict))
```

## 5. Queue Patterns and Best Practices

### Producer-Consumer Pattern

> **The Producer-Consumer Pattern** : One or more producers generate data and put it in a queue, while one or more consumers take data from the queue and process it. This decouples production from consumption.

```python
import queue
import threading
import random
import time

class ProducerConsumerExample:
    def __init__(self, queue_size=5):
        self.q = queue.Queue(maxsize=queue_size)
        self.running = True
  
    def producer(self, producer_id):
        """Produces items at random intervals"""
        while self.running:
            item = f"data_{producer_id}_{random.randint(1, 100)}"
            try:
                self.q.put(item, timeout=1)
                print(f"📦 Producer {producer_id} created: {item}")
                time.sleep(random.uniform(0.5, 2.0))
            except queue.Full:
                print(f"⚠️ Producer {producer_id}: Queue full!")
  
    def consumer(self, consumer_id):
        """Consumes items and processes them"""
        while self.running:
            try:
                item = self.q.get(timeout=1)
                # Simulate processing time
                processing_time = random.uniform(0.1, 1.0)
                time.sleep(processing_time)
                print(f"✅ Consumer {consumer_id} processed: {item}")
                self.q.task_done()
            except queue.Empty:
                print(f"⏳ Consumer {consumer_id}: Nothing to consume")
  
    def run_simulation(self, num_producers=2, num_consumers=2, duration=10):
        """Run the producer-consumer simulation"""
        threads = []
      
        # Start producers
        for i in range(num_producers):
            t = threading.Thread(target=self.producer, args=(i,))
            t.daemon = True  # Dies when main thread dies
            threads.append(t)
            t.start()
      
        # Start consumers  
        for i in range(num_consumers):
            t = threading.Thread(target=self.consumer, args=(i,))
            t.daemon = True
            threads.append(t)
            t.start()
      
        # Let simulation run
        time.sleep(duration)
        self.running = False
      
        print(f"Simulation ended. Queue size: {self.q.qsize()}")

# Run the simulation
if __name__ == "__main__":
    sim = ProducerConsumerExample()
    sim.run_simulation(duration=5)
```

### Work Distribution Pattern

```python
import threading
import queue
import time

def work_distribution_example():
    """Distribute work items among multiple workers"""
  
    # Create work queue
    work_queue = queue.Queue()
    results_queue = queue.Queue()
  
    # Add work items
    work_items = [f"task_{i}" for i in range(10)]
    for item in work_items:
        work_queue.put(item)
  
    def worker(worker_id):
        """Worker function that processes tasks"""
        while True:
            try:
                task = work_queue.get(timeout=1)
                # Simulate work
                result = f"Result of {task} by worker {worker_id}"
                time.sleep(0.5)  # Simulate processing time
              
                results_queue.put(result)
                work_queue.task_done()
                print(f"Worker {worker_id} completed {task}")
              
            except queue.Empty:
                print(f"Worker {worker_id} finished - no more work")
                break
  
    # Start workers
    workers = []
    for i in range(3):
        t = threading.Thread(target=worker, args=(i,))
        workers.append(t)
        t.start()
  
    # Wait for all work to complete
    work_queue.join()
  
    # Collect results
    results = []
    while not results_queue.empty():
        results.append(results_queue.get())
  
    print(f"All work completed. Results: {len(results)} items")
    return results

# Run example
results = work_distribution_example()
```

## 6. Common Pitfalls and Solutions

### Pitfall 1: Deadlocks with Multiple Queues

```python
# DANGEROUS: Can cause deadlock
def dangerous_multi_queue():
    q1 = queue.Queue(maxsize=1)
    q2 = queue.Queue(maxsize=1)
  
    def worker1():
        q1.put("data")  # This might block
        item = q2.get()  # Waiting for worker2
  
    def worker2():
        q2.put("data")  # This might block  
        item = q1.get()  # Waiting for worker1
  
    # Both workers can block waiting for each other!

# SAFE: Use timeouts and proper error handling
def safe_multi_queue():
    q1 = queue.Queue(maxsize=1)
    q2 = queue.Queue(maxsize=1)
  
    def worker1():
        try:
            q1.put("data", timeout=5)
            item = q2.get(timeout=5)
        except queue.Full:
            print("Worker1: Could not put data")
        except queue.Empty:
            print("Worker1: Could not get data")
  
    def worker2():
        try:
            q2.put("data", timeout=5)
            item = q1.get(timeout=5)
        except queue.Full:
            print("Worker2: Could not put data")
        except queue.Empty:
            print("Worker2: Could not get data")
```

### Pitfall 2: Memory Leaks with Large Queues

```python
# PROBLEMATIC: Unbounded queue can consume all memory
def memory_leak_example():
    unbounded_queue = queue.Queue()  # No size limit
  
    def fast_producer():
        i = 0
        while True:
            unbounded_queue.put(f"large_data_object_{i}" * 1000)
            i += 1
            # If consumer is slower, queue grows indefinitely!

# BETTER: Use bounded queues and monitoring
def memory_safe_example():
    bounded_queue = queue.Queue(maxsize=100)  # Limit size
  
    def monitored_producer():
        i = 0
        while True:
            try:
                bounded_queue.put(f"data_{i}", timeout=1)
                i += 1
            except queue.Full:
                print(f"Queue full! Size: {bounded_queue.qsize()}")
                time.sleep(0.1)  # Back off
```

### Pitfall 3: Process vs Thread Queue Confusion

```python
# WRONG: Using thread queue with processes
import multiprocessing as mp
import queue  # This won't work with processes!

def broken_process_example():
    thread_queue = queue.Queue()  # Thread-safe only!
  
    def process_worker():
        # This will fail - processes can't share thread queues
        thread_queue.put("data")
  
    p = mp.Process(target=process_worker)
    p.start()  # Will cause an error

# CORRECT: Use multiprocessing.Queue for processes
def working_process_example():
    process_queue = mp.Queue()  # Process-safe
  
    def process_worker():
        process_queue.put("data")  # This works
  
    p = mp.Process(target=process_worker)
    p.start()
    p.join()
```

## 7. Performance Considerations and Alternatives

### When to Use Each Queue Type

```python
import time
import queue
import multiprocessing as mp
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def performance_comparison():
    """Compare different approaches for CPU vs I/O bound tasks"""
  
    # I/O bound task (network request simulation)
    def io_bound_task(item):
        time.sleep(0.1)  # Simulate network delay
        return f"processed_{item}"
  
    # CPU bound task (computation)
    def cpu_bound_task(item):
        # Simulate CPU intensive work
        result = sum(i * i for i in range(item * 1000))
        return result
  
    data = list(range(20))
  
    # For I/O bound: Threads with queue work well
    print("I/O bound with threads:")
    start = time.time()
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(io_bound_task, data))
    print(f"Time: {time.time() - start:.2f}s")
  
    # For CPU bound: Processes work better
    print("CPU bound with processes:")
    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(cpu_bound_task, data))
    print(f"Time: {time.time() - start:.2f}s")

# Run comparison
performance_comparison()
```

> **Key Principle** : Use thread-based queues for I/O bound tasks (file operations, network requests). Use process-based queues for CPU-bound tasks (mathematical computations, data processing).

### Alternative: `asyncio` Queues for Async Programming

```python
import asyncio

async def async_queue_example():
    """Modern async approach using asyncio queues"""
  
    # Create async queue
    async_queue = asyncio.Queue(maxsize=5)
  
    async def async_producer():
        for i in range(5):
            await async_queue.put(f"async_item_{i}")
            print(f"Produced async_item_{i}")
            await asyncio.sleep(0.1)
  
    async def async_consumer():
        while True:
            try:
                item = await asyncio.wait_for(async_queue.get(), timeout=1.0)
                print(f"Consumed {item}")
                async_queue.task_done()
                await asyncio.sleep(0.2)
            except asyncio.TimeoutError:
                print("Consumer timeout - finishing")
                break
  
    # Run producer and consumer concurrently
    await asyncio.gather(
        async_producer(),
        async_consumer()
    )

# Run async example
asyncio.run(async_queue_example())
```

## 8. Real-World Application Example

Here's a complete example showing how queues enable building a robust web scraper:## Summary: The Power of Queue-Based Communication

```python
"""
Web Scraper Example: Queue-Based Architecture
============================================

This example demonstrates how queues enable building scalable, 
fault-tolerant systems by decoupling different components.

Architecture:
- URL Queue: Stores URLs to be scraped
- Data Queue: Stores scraped data waiting to be processed  
- Result Queue: Stores final processed results
- Error Queue: Stores failed operations for retry
"""

import queue
import threading
import requests
import time
import json
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional

class WebScraperWithQueues:
    """
    A web scraper that uses multiple queues to coordinate different tasks:
    - URL fetching (I/O bound) 
    - Data processing (CPU bound)
    - Result storage (I/O bound)
    - Error handling and retries
    """
    
    def __init__(self, max_workers: int = 3):
        # Different queues for different stages
        self.url_queue = queue.Queue()          # URLs to scrape
        self.data_queue = queue.Queue()         # Raw scraped data  
        self.result_queue = queue.Queue()       # Processed results
        self.error_queue = queue.Queue()        # Failed operations
        
        self.max_workers = max_workers
        self.running = True
        self.stats = {
            'urls_processed': 0,
            'data_processed': 0, 
            'errors': 0,
            'results': 0
        }
    
    def url_fetcher(self, worker_id: int):
        """
        Worker that fetches URLs from url_queue and puts response data 
        into data_queue. This is I/O bound work.
        """
        session = requests.Session()  # Reuse connections
        session.headers.update({'User-Agent': 'Educational-Scraper'})
        
        while self.running:
            try:
                url = self.url_queue.get(timeout=1)
                print(f"🌐 Fetcher {worker_id}: Getting {url}")
                
                try:
                    response = session.get(url, timeout=10)
                    response.raise_for_status()
                    
                    # Put raw data into processing queue
                    self.data_queue.put({
                        'url': url,
                        'status_code': response.status_code,
                        'content': response.text,
                        'headers': dict(response.headers)
                    })
                    
                    self.stats['urls_processed'] += 1
                    print(f"✅ Fetcher {worker_id}: Success for {url}")
                    
                except requests.RequestException as e:
                    # Put error in error queue for potential retry
                    self.error_queue.put({
                        'type': 'fetch_error',
                        'url': url,
                        'error': str(e),
                        'timestamp': time.time()
                    })
                    self.stats['errors'] += 1
                    print(f"❌ Fetcher {worker_id}: Error for {url}: {e}")
                
                finally:
                    self.url_queue.task_done()
                    
            except queue.Empty:
                continue
            except Exception as e:
                print(f"💥 Fetcher {worker_id}: Unexpected error: {e}")
    
    def data_processor(self, worker_id: int):
        """
        Worker that processes raw data from data_queue and puts 
        results into result_queue. This could be CPU bound work.
        """
        while self.running:
            try:
                raw_data = self.data_queue.get(timeout=1)
                print(f"⚙️ Processor {worker_id}: Processing {raw_data['url']}")
                
                try:
                    # Simulate data processing (extract title, word count, etc.)
                    content = raw_data['content']
                    processed_result = {
                        'url': raw_data['url'],
                        'title': self._extract_title(content),
                        'word_count': len(content.split()),
                        'content_length': len(content),
                        'status_code': raw_data['status_code'],
                        'processed_at': time.time()
                    }
                    
                    # Put processed data into results queue
                    self.result_queue.put(processed_result)
                    self.stats['data_processed'] += 1
                    print(f"✅ Processor {worker_id}: Processed {raw_data['url']}")
                    
                except Exception as e:
                    # Handle processing errors
                    self.error_queue.put({
                        'type': 'processing_error', 
                        'url': raw_data['url'],
                        'error': str(e),
                        'timestamp': time.time()
                    })
                    self.stats['errors'] += 1
                    print(f"❌ Processor {worker_id}: Error processing {raw_data['url']}: {e}")
                
                finally:
                    self.data_queue.task_done()
                    
            except queue.Empty:
                continue
            except Exception as e:
                print(f"💥 Processor {worker_id}: Unexpected error: {e}")
    
    def result_saver(self, worker_id: int):
        """
        Worker that saves results from result_queue to storage.
        This is I/O bound work.
        """
        results = []  # In real app, this might be a database
        
        while self.running:
            try:
                result = self.result_queue.get(timeout=1)
                print(f"💾 Saver {worker_id}: Saving result for {result['url']}")
                
                # Simulate saving (could be database, file, API call, etc.)
                results.append(result)
                self.stats['results'] += 1
                
                # Periodic batch save simulation
                if len(results) >= 5:
                    print(f"💾 Saver {worker_id}: Batch saving {len(results)} results")
                    self._save_batch(results)
                    results.clear()
                
                self.result_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                print(f"💥 Saver {worker_id}: Error: {e}")
        
        # Save any remaining results
        if results:
            self._save_batch(results)
    
    def error_handler(self):
        """
        Worker that handles errors and implements retry logic.
        """
        retry_counts = {}  # Track retry attempts per URL
        
        while self.running:
            try:
                error_info = self.error_queue.get(timeout=1)
                url = error_info.get('url', 'unknown')
                error_type = error_info.get('type', 'unknown')
                
                print(f"🔧 Error Handler: Processing {error_type} for {url}")
                
                # Implement retry logic
                retry_count = retry_counts.get(url, 0)
                if retry_count < 3:  # Max 3 retries
                    retry_counts[url] = retry_count + 1
                    print(f"🔄 Retrying {url} (attempt {retry_count + 1})")
                    
                    # Re-queue for retry after delay
                    time.sleep(2 ** retry_count)  # Exponential backoff
                    if error_type == 'fetch_error':
                        self.url_queue.put(url)
                else:
                    print(f"⚠️ Max retries exceeded for {url}")
                
                self.error_queue.task_done()
                
            except queue.Empty:
                continue
    
    def start_scraping(self, urls: List[str], duration: int = 30):
        """
        Start the scraping process with all worker threads.
        """
        print(f"🚀 Starting scraper with {len(urls)} URLs")
        
        # Add URLs to queue
        for url in urls:
            self.url_queue.put(url)
        
        # Start worker threads
        threads = []
        
        # URL fetchers (I/O bound - can have more workers)
        for i in range(self.max_workers):
            t = threading.Thread(target=self.url_fetcher, args=(i,))
            t.daemon = True
            threads.append(t)
            t.start()
        
        # Data processors (CPU bound - fewer workers)
        for i in range(max(1, self.max_workers // 2)):
            t = threading.Thread(target=self.data_processor, args=(i,))
            t.daemon = True
            threads.append(t)
            t.start()
        
        # Result saver (I/O bound - single worker usually sufficient)
        t = threading.Thread(target=self.result_saver, args=(0,))
        t.daemon = True
        threads.append(t)
        t.start()
        
        # Error handler (single worker)
        t = threading.Thread(target=self.error_handler)
        t.daemon = True
        threads.append(t)
        t.start()
        
        # Monitor progress
        start_time = time.time()
        while time.time() - start_time < duration:
            time.sleep(5)
            self._print_stats()
            
            # Check if all work is done
            if (self.url_queue.empty() and 
                self.data_queue.empty() and 
                self.result_queue.empty()):
                print("🎉 All work completed!")
                break
        
        # Shutdown
        print("🛑 Shutting down...")
        self.running = False
        
        # Wait for queues to empty
        self.url_queue.join()
        self.data_queue.join() 
        self.result_queue.join()
        
        self._print_final_stats()
    
    def _extract_title(self, html_content: str) -> str:
        """Simple title extraction (in real app, use proper HTML parser)"""
        try:
            start = html_content.find('<title>')
            end = html_content.find('</title>')
            if start != -1 and end != -1:
                return html_content[start+7:end].strip()
        except:
            pass
        return "No title found"
    
    def _save_batch(self, results: List[Dict]):
        """Simulate batch saving results"""
        # In real app: database insert, file write, API call, etc.
        print(f"💾 Saved batch of {len(results)} results")
        time.sleep(0.1)  # Simulate I/O delay
    
    def _print_stats(self):
        """Print current statistics"""
        print(f"📊 Stats: URLs: {self.stats['urls_processed']}, "
              f"Processed: {self.stats['data_processed']}, "
              f"Results: {self.stats['results']}, "
              f"Errors: {self.stats['errors']}")
        print(f"📊 Queue sizes: URLs: {self.url_queue.qsize()}, "
              f"Data: {self.data_queue.qsize()}, "
              f"Results: {self.result_queue.qsize()}, "
              f"Errors: {self.error_queue.qsize()}")
    
    def _print_final_stats(self):
        """Print final statistics"""
        print("\n🏁 Final Statistics:")
        for key, value in self.stats.items():
            print(f"   {key}: {value}")


# Example usage
if __name__ == "__main__":
    # Example URLs (use real URLs in practice)
    test_urls = [
        "https://httpbin.org/delay/1",  # Simulates slow response
        "https://httpbin.org/status/200",  # Always succeeds
        "https://httpbin.org/status/404",  # Will cause error  
        "https://httpbin.org/html",  # Returns HTML
        "https://httpbin.org/json",  # Returns JSON
    ]
    
    # Create and run scraper
    scraper = WebScraperWithQueues(max_workers=3)
    scraper.start_scraping(test_urls, duration=20)
    
    print("\n✨ Scraping demonstration completed!")
    print("\nKey Queue Benefits Demonstrated:")
    print("- Decoupling: Each component works independently")
    print("- Fault tolerance: Errors don't crash the system") 
    print("- Scalability: Easy to add more workers")
    print("- Backpressure: Bounded queues prevent memory issues")
    print("- Monitoring: Queue sizes show system health")
```

Queue-based communication provides a **fundamental building block** for coordinating concurrent operations in Python. Here's when and why to use them:

### Key Mental Models

> **Queues as Coordination Points** : Think of queues as **controlled handoff points** between different parts of your system. They provide thread/process-safe ways to pass data without direct shared memory access.

> **Decoupling Through Queues** : Producers don't need to know about consumers, and vice versa. This makes systems more modular and easier to scale.

```
Without Queues (Tight Coupling):
Producer → Direct Function Call → Consumer
  ↓
High coupling, hard to scale, failure propagation

With Queues (Loose Coupling):  
Producer → Queue → Consumer
  ↓
Low coupling, easy to scale, fault isolation
```

### Decision Tree: Which Queue to Use?

```python
# Decision flowchart for choosing queue type:

def choose_queue_type(use_case):
    if use_case == "single_threaded":
        return "collections.deque or list"
  
    elif use_case == "multi_threaded":
        if "need_priorities":
            return "queue.PriorityQueue()"
        elif "need_lifo_behavior":
            return "queue.LifoQueue()"
        else:
            return "queue.Queue()"  # Most common
  
    elif use_case == "multi_process":
        if "simple_objects":
            return "multiprocessing.Queue()"
        elif "complex_shared_objects":
            return "multiprocessing.Manager().Queue()"
        else:
            return "multiprocessing.Queue()"
  
    elif use_case == "async_programming":
        return "asyncio.Queue()"
  
    else:
        return "Consider other patterns like pub/sub"
```

### Best Practices Summary

> **Size Your Queues Appropriately** : Unbounded queues can consume infinite memory. Bounded queues provide backpressure but can cause blocking.

> **Always Use Timeouts** : Avoid infinite blocking with `get(timeout=X)` and `put(timeout=X)`.

> **Handle the Empty/Full Exceptions** : Robust code always handles `queue.Empty` and `queue.Full` exceptions.

> **Monitor Queue Sizes** : Use `qsize()` to monitor system health and detect bottlenecks.

Queue-based communication transforms chaotic concurrent programming into organized, predictable coordination. By understanding these patterns, you can build robust, scalable Python applications that gracefully handle multiple execution contexts working together.

The web scraper example shows how queues enable building complex systems where different components can fail, retry, and scale independently - the hallmark of production-ready concurrent software.
