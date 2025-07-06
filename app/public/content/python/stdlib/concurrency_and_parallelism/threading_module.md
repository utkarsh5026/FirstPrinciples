# Python Threading: From First Principles to Advanced Concurrency

## Part 1: Fundamental Concepts of Concurrent Execution

Before diving into Python's `threading` module, let's understand why we need threading and what problems it solves.

### What is Threading?

Think of a program as a recipe being followed by a cook. Normally, the cook follows one step at a time:

```
Sequential Execution (Single-threaded):
Cook → Chop vegetables → Boil water → Cook pasta → Serve
Time: ████████████████████████████████████
```

Threading allows multiple "cooks" (threads) to work on different parts simultaneously:

```
Concurrent Execution (Multi-threaded):
Cook 1 → Chop vegetables ████████
Cook 2 → Boil water     ████████████
Cook 3 → Prepare sauce      ████████████
Time:   ████████████████████████████████████
```

### The Core Problem: Blocking Operations

Many operations in programming are **blocking** - they make your program wait:

```python
import time
import requests

# This blocks for 2 seconds - nothing else can happen
def download_file(url):
    print(f"Starting download from {url}")
    time.sleep(2)  # Simulates network delay
    print(f"Finished downloading from {url}")
    return f"Data from {url}"

# Sequential approach - slow!
start_time = time.time()
data1 = download_file("http://api1.com")
data2 = download_file("http://api2.com") 
data3 = download_file("http://api3.com")
total_time = time.time() - start_time
print(f"Total time: {total_time:.2f} seconds")  # ~6 seconds
```

## Part 2: Python's Threading Model and the GIL

### Understanding Python's Global Interpreter Lock (GIL)

> **Critical Python Concept: The GIL**
>
> Python has a Global Interpreter Lock (GIL) that allows only ONE thread to execute Python bytecode at a time. This means:
>
> * Threading in Python is great for I/O-bound tasks (file reading, network requests)
> * Threading is NOT effective for CPU-bound tasks (mathematical calculations)
> * For CPU-bound tasks, use `multiprocessing` instead

```
Python Threading Reality:
Thread 1: ████░░░░████░░░░████░░░░  (waiting for I/O)
Thread 2: ░░░░████░░░░████░░░░████  (executing while Thread 1 waits)
Thread 3: ░░░░░░░░░░░░░░░░████████  (gets turn when others wait)

Legend: ████ = executing, ░░░░ = waiting/blocked
```

## Part 3: Creating and Managing Threads

### Basic Thread Creation

The `threading` module provides several ways to create threads. Let's start with the simplest:

```python
import threading
import time

# Method 1: Function-based threading
def worker_function(name, duration):
    """A simple worker that simulates some work"""
    print(f"Worker {name} starting...")
    time.sleep(duration)  # Simulates work (I/O operation)
    print(f"Worker {name} finished after {duration} seconds")

# Create and start threads
thread1 = threading.Thread(target=worker_function, args=("Alice", 2))
thread2 = threading.Thread(target=worker_function, args=("Bob", 3))

# Start the threads (they run concurrently now)
thread1.start()
thread2.start()

# Wait for both to complete
thread1.join()
thread2.join()

print("All workers finished!")
```

### Class-Based Thread Creation

For more complex scenarios, inherit from `threading.Thread`:

```python
import threading
import time
import random

class WorkerThread(threading.Thread):
    def __init__(self, worker_id, task_list):
        # MUST call parent constructor
        super().__init__()
        self.worker_id = worker_id
        self.task_list = task_list
        self.results = []
  
    def run(self):
        """This method is called when thread.start() is invoked"""
        print(f"Worker {self.worker_id} starting with {len(self.task_list)} tasks")
      
        for task in self.task_list:
            # Simulate processing time
            processing_time = random.uniform(0.5, 2.0)
            time.sleep(processing_time)
          
            result = f"Task '{task}' completed in {processing_time:.2f}s"
            self.results.append(result)
            print(f"Worker {self.worker_id}: {result}")
      
        print(f"Worker {self.worker_id} finished all tasks")

# Create workers with different task loads
worker1 = WorkerThread("Alpha", ["Download file A", "Process data A"])
worker2 = WorkerThread("Beta", ["Download file B", "Process data B", "Upload results"])

# Start both workers
worker1.start()
worker2.start()

# Wait for completion and collect results
worker1.join()
worker2.join()

print("Results from Alpha:", worker1.results)
print("Results from Beta:", worker2.results)
```

### Thread Lifecycle and States

```
Thread Lifecycle:
                 start()
New Thread ─────────────→ Runnable ─────────────→ Running
    │                       ↑                         │
    │                       │ not blocked             │ I/O operation
    │                       │                         ↓
    └─────────────────────────────────────────→ Blocked/Waiting
                                                       │
                                                       │ join()
                                                       ↓
                                                   Terminated
```

## Part 4: Thread Synchronization Primitives

When threads share data, we need synchronization to prevent  **race conditions** .

### The Race Condition Problem

```python
import threading
import time

# Shared resource - DANGEROUS without synchronization!
counter = 0

def increment_counter(name, iterations):
    global counter
    for i in range(iterations):
        # This is NOT atomic! Multiple steps happen:
        # 1. Read current value of counter
        # 2. Add 1 to it  
        # 3. Write back to counter
        temp = counter
        temp += 1
        counter = temp
        print(f"{name}: incremented to {counter}")

# Create threads that modify shared data
thread1 = threading.Thread(target=increment_counter, args=("Thread-1", 5))
thread2 = threading.Thread(target=increment_counter, args=("Thread-2", 5))

thread1.start()
thread2.start()

thread1.join()
thread2.join()

print(f"Final counter value: {counter}")
# Expected: 10, Actual: Could be anything due to race condition!
```

### Locks: The Basic Synchronization Primitive

```python
import threading
import time

# Shared resource with protection
counter = 0
counter_lock = threading.Lock()  # Creates a mutual exclusion lock

def safe_increment_counter(name, iterations):
    global counter
    for i in range(iterations):
        # Acquire lock before accessing shared resource
        with counter_lock:  # Context manager - automatically releases lock
            # Only ONE thread can be in this block at a time
            temp = counter
            temp += 1
            counter = temp
            print(f"{name}: safely incremented to {counter}")
        # Lock is automatically released here
      
        # Simulate other work outside critical section
        time.sleep(0.01)

# Now it's safe!
thread1 = threading.Thread(target=safe_increment_counter, args=("Thread-1", 5))
thread2 = threading.Thread(target=safe_increment_counter, args=("Thread-2", 5))

thread1.start()
thread2.start()

thread1.join()
thread2.join()

print(f"Final counter value: {counter}")  # Will always be 10
```

### Alternative Lock Usage (Manual acquire/release)

```python
# Manual lock management (use context manager instead!)
def manual_lock_example():
    global counter
  
    counter_lock.acquire()  # Get the lock
    try:
        # Critical section
        counter += 1
        print(f"Counter: {counter}")
    finally:
        counter_lock.release()  # MUST release in finally block
  
    # Better approach - use 'with' statement:
    with counter_lock:
        counter += 1
        print(f"Counter: {counter}")
```

## Part 5: Advanced Synchronization Primitives

### RLock (Reentrant Lock)

```python
import threading

# Problem: Regular locks can't be acquired twice by same thread
regular_lock = threading.Lock()
reentrant_lock = threading.RLock()  # Can be acquired multiple times by same thread

def recursive_function(n, lock_type="regular"):
    if lock_type == "regular":
        with regular_lock:  # This will deadlock on recursive calls!
            print(f"Processing {n}")
            if n > 0:
                recursive_function(n-1, "regular")  # DEADLOCK!
    else:
        with reentrant_lock:  # This works fine
            print(f"Processing {n}")
            if n > 0:
                recursive_function(n-1, "reentrant")  # OK!

# Safe recursive call with RLock
threading.Thread(target=recursive_function, args=(3, "reentrant")).start()
```

### Semaphores: Controlling Resource Access

```python
import threading
import time
import random

# Limit concurrent access to a resource (e.g., database connections)
# Semaphore allows N threads to access resource simultaneously
connection_pool = threading.Semaphore(3)  # Max 3 concurrent connections

def database_worker(worker_id):
    print(f"Worker {worker_id} requesting database connection...")
  
    with connection_pool:  # Acquire one connection from pool
        print(f"Worker {worker_id} got database connection!")
      
        # Simulate database work
        work_time = random.uniform(1, 3)
        time.sleep(work_time)
      
        print(f"Worker {worker_id} releasing database connection after {work_time:.2f}s")
    # Connection automatically returned to pool

# Create many workers - only 3 can access DB simultaneously
workers = []
for i in range(8):
    worker = threading.Thread(target=database_worker, args=(i,))
    workers.append(worker)
    worker.start()

# Wait for all workers
for worker in workers:
    worker.join()
```

### Condition Variables: Complex Coordination

```python
import threading
import time
import random
from collections import deque

# Producer-Consumer pattern with Condition
class ProducerConsumer:
    def __init__(self, max_items=5):
        self.buffer = deque()
        self.max_items = max_items
        self.condition = threading.Condition()  # Combines lock + notification
  
    def produce(self, producer_id):
        for i in range(3):
            item = f"Item-{producer_id}-{i}"
          
            with self.condition:
                # Wait while buffer is full
                while len(self.buffer) >= self.max_items:
                    print(f"Producer {producer_id} waiting - buffer full")
                    self.condition.wait()  # Release lock and wait for notification
              
                # Produce item
                self.buffer.append(item)
                print(f"Producer {producer_id} produced {item} (buffer: {len(self.buffer)})")
              
                # Notify waiting consumers
                self.condition.notify_all()
          
            time.sleep(random.uniform(0.5, 1.5))
  
    def consume(self, consumer_id):
        for i in range(2):
            with self.condition:
                # Wait while buffer is empty
                while len(self.buffer) == 0:
                    print(f"Consumer {consumer_id} waiting - buffer empty")
                    self.condition.wait()  # Release lock and wait for notification
              
                # Consume item
                item = self.buffer.popleft()
                print(f"Consumer {consumer_id} consumed {item} (buffer: {len(self.buffer)})")
              
                # Notify waiting producers
                self.condition.notify_all()
          
            time.sleep(random.uniform(1.0, 2.0))

# Demonstrate producer-consumer
pc = ProducerConsumer()

# Create producers and consumers
producers = [threading.Thread(target=pc.produce, args=(i,)) for i in range(2)]
consumers = [threading.Thread(target=pc.consume, args=(i,)) for i in range(3)]

# Start all threads
for p in producers + consumers:
    p.start()

# Wait for completion
for p in producers + consumers:
    p.join()
```

## Part 6: Thread-Safe Data Structures

### Using Queue for Safe Communication

```python
import threading
import queue
import time
import random

# Thread-safe queue for communication between threads
task_queue = queue.Queue(maxsize=10)  # Bounded queue
result_queue = queue.Queue()

def producer(producer_id, num_tasks):
    """Produces tasks and puts them in queue"""
    for i in range(num_tasks):
        task = f"Task-{producer_id}-{i}"
      
        try:
            # Put task in queue (blocks if queue is full)
            task_queue.put(task, timeout=5)
            print(f"Producer {producer_id} added {task}")
            time.sleep(random.uniform(0.1, 0.5))
        except queue.Full:
            print(f"Producer {producer_id} timed out - queue full")
  
    # Signal end of production
    task_queue.put(None)  # Sentinel value

def worker(worker_id):
    """Processes tasks from queue"""
    while True:
        try:
            # Get task from queue (blocks if queue is empty)
            task = task_queue.get(timeout=2)
          
            if task is None:  # Sentinel - stop working
                task_queue.put(None)  # Pass sentinel to other workers
                break
          
            # Process task
            print(f"Worker {worker_id} processing {task}")
            time.sleep(random.uniform(0.5, 1.5))
          
            # Store result
            result = f"{task} completed by Worker-{worker_id}"
            result_queue.put(result)
          
            # Mark task as done
            task_queue.task_done()
          
        except queue.Empty:
            print(f"Worker {worker_id} timed out waiting for tasks")
            break

# Create and start threads
producer_thread = threading.Thread(target=producer, args=(1, 8))
worker_threads = [threading.Thread(target=worker, args=(i,)) for i in range(3)]

producer_thread.start()
for w in worker_threads:
    w.start()

# Wait for all tasks to be completed
producer_thread.join()
task_queue.join()  # Wait until all tasks are processed

# Collect results
results = []
while not result_queue.empty():
    results.append(result_queue.get())

print(f"Collected {len(results)} results:")
for result in results:
    print(f"  {result}")
```

### Different Queue Types

```python
import queue
import threading

# Different queue behaviors
fifo_queue = queue.Queue()        # First In, First Out
lifo_queue = queue.LifoQueue()    # Last In, First Out (stack)
priority_queue = queue.PriorityQueue()  # Priority-based

# Priority queue example
def priority_worker():
    # Add items with priorities (lower number = higher priority)
    priority_queue.put((1, "High priority task"))
    priority_queue.put((3, "Low priority task"))
    priority_queue.put((2, "Medium priority task"))
  
    # Items come out in priority order
    while not priority_queue.empty():
        priority, task = priority_queue.get()
        print(f"Processing: {task} (priority: {priority})")

threading.Thread(target=priority_worker).start()
```

## Part 7: Advanced Patterns and Best Practices

### Thread Pool Pattern

```python
import threading
import queue
import time

class ThreadPool:
    def __init__(self, num_threads=4):
        self.task_queue = queue.Queue()
        self.threads = []
        self.shutdown = False
      
        # Create worker threads
        for i in range(num_threads):
            thread = threading.Thread(target=self._worker, args=(i,))
            thread.daemon = True  # Dies when main thread dies
            thread.start()
            self.threads.append(thread)
  
    def _worker(self, worker_id):
        """Worker thread that processes tasks from queue"""
        while not self.shutdown:
            try:
                # Get task with timeout
                task_func, args, kwargs = self.task_queue.get(timeout=1)
              
                print(f"Worker {worker_id} executing task")
                result = task_func(*args, **kwargs)
                print(f"Worker {worker_id} completed task with result: {result}")
              
                self.task_queue.task_done()
              
            except queue.Empty:
                continue  # Check shutdown flag
            except Exception as e:
                print(f"Worker {worker_id} error: {e}")
  
    def submit(self, func, *args, **kwargs):
        """Submit a task to the thread pool"""
        if not self.shutdown:
            self.task_queue.put((func, args, kwargs))
  
    def shutdown_pool(self):
        """Gracefully shutdown the thread pool"""
        self.task_queue.join()  # Wait for all tasks to complete
        self.shutdown = True
      
        # Wait for all worker threads to finish
        for thread in self.threads:
            thread.join()

# Example task function
def compute_square(number):
    time.sleep(0.5)  # Simulate work
    return number ** 2

# Use the thread pool
pool = ThreadPool(num_threads=3)

# Submit multiple tasks
for i in range(10):
    pool.submit(compute_square, i)

print("All tasks submitted, waiting for completion...")
pool.shutdown_pool()
print("Thread pool shutdown complete")
```

### Using concurrent.futures (Modern Approach)

```python
import concurrent.futures
import time
import requests

def fetch_url(url):
    """Simulate fetching data from a URL"""
    print(f"Fetching {url}")
    time.sleep(1)  # Simulate network delay
    return f"Data from {url}"

# Modern threading with ThreadPoolExecutor
urls = [
    "http://api1.com",
    "http://api2.com", 
    "http://api3.com",
    "http://api4.com"
]

# Method 1: Using context manager (recommended)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    # Submit all tasks
    future_to_url = {executor.submit(fetch_url, url): url for url in urls}
  
    # Collect results as they complete
    for future in concurrent.futures.as_completed(future_to_url):
        url = future_to_url[future]
        try:
            result = future.result()
            print(f"Completed {url}: {result}")
        except Exception as exc:
            print(f"Error fetching {url}: {exc}")

# Method 2: Using map (simpler for identical operations)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(fetch_url, urls))
    for url, result in zip(urls, results):
        print(f"{url} -> {result}")
```

## Part 8: Common Pitfalls and Solutions

### Deadlock Prevention

> **Critical Pitfall: Deadlocks**
>
> A deadlock occurs when two or more threads wait for each other indefinitely.
> Always acquire locks in the same order across all threads!

```python
import threading
import time

# Two locks that can cause deadlock
lock_a = threading.Lock()
lock_b = threading.Lock()

def task_1():
    print("Task 1: Acquiring lock A")
    with lock_a:
        print("Task 1: Got lock A, waiting...")
        time.sleep(0.1)
      
        print("Task 1: Acquiring lock B")
        with lock_b:  # This can deadlock!
            print("Task 1: Got both locks")

def task_2():
    print("Task 2: Acquiring lock B")
    with lock_b:
        print("Task 2: Got lock B, waiting...")
        time.sleep(0.1)
      
        print("Task 2: Acquiring lock A")
        with lock_a:  # This can deadlock!
            print("Task 2: Got both locks")

# SOLUTION: Always acquire locks in same order
def safe_task_1():
    with lock_a:  # Always acquire A first
        with lock_b:  # Then B
            print("Safe task 1: Got both locks")

def safe_task_2():
    with lock_a:  # Always acquire A first  
        with lock_b:  # Then B
            print("Safe task 2: Got both locks")
```

### Thread-Local Storage

```python
import threading
import time
import random

# Thread-local storage - each thread has its own copy
thread_local_data = threading.local()

def initialize_worker(worker_id):
    """Initialize thread-local data"""
    thread_local_data.worker_id = worker_id
    thread_local_data.request_count = 0
    thread_local_data.start_time = time.time()

def do_work():
    """Access thread-local data safely"""
    thread_local_data.request_count += 1
    elapsed = time.time() - thread_local_data.start_time
  
    print(f"Worker {thread_local_data.worker_id}: "
          f"Request #{thread_local_data.request_count} "
          f"at {elapsed:.2f}s")
  
    time.sleep(random.uniform(0.1, 0.5))

def worker_main(worker_id):
    initialize_worker(worker_id)
  
    for _ in range(5):
        do_work()

# Each thread has its own thread_local_data
threads = []
for i in range(3):
    thread = threading.Thread(target=worker_main, args=(i,))
    threads.append(thread)
    thread.start()

for thread in threads:
    thread.join()
```

## Part 9: Real-World Applications

### Web Scraper with Threading

```python
import threading
import requests
import time
from urllib.parse import urljoin, urlparse
import queue

class WebScraper:
    def __init__(self, num_workers=5):
        self.url_queue = queue.Queue()
        self.results = queue.Queue()
        self.visited = set()
        self.visited_lock = threading.Lock()
        self.num_workers = num_workers
      
    def add_url(self, url):
        """Add URL to be scraped"""
        self.url_queue.put(url)
  
    def worker(self, worker_id):
        """Worker thread that scrapes URLs"""
        while True:
            try:
                url = self.url_queue.get(timeout=5)
              
                # Check if already visited
                with self.visited_lock:
                    if url in self.visited:
                        self.url_queue.task_done()
                        continue
                    self.visited.add(url)
              
                # Scrape the URL
                try:
                    print(f"Worker {worker_id} scraping: {url}")
                    response = requests.get(url, timeout=10)
                  
                    result = {
                        'url': url,
                        'status_code': response.status_code,
                        'title': self._extract_title(response.text),
                        'size': len(response.content)
                    }
                  
                    self.results.put(result)
                    print(f"Worker {worker_id} completed: {url}")
                  
                except requests.RequestException as e:
                    print(f"Worker {worker_id} error scraping {url}: {e}")
              
                self.url_queue.task_done()
              
            except queue.Empty:
                break  # No more URLs to process
  
    def _extract_title(self, html):
        """Simple title extraction"""
        try:
            start = html.find('<title>') + 7
            end = html.find('</title>')
            return html[start:end] if start > 6 and end > start else "No title"
        except:
            return "Error extracting title"
  
    def scrape(self, urls):
        """Start scraping with multiple workers"""
        # Add all URLs to queue
        for url in urls:
            self.add_url(url)
      
        # Start worker threads
        workers = []
        for i in range(self.num_workers):
            worker = threading.Thread(target=self.worker, args=(i,))
            worker.daemon = True
            worker.start()
            workers.append(worker)
      
        # Wait for all URLs to be processed
        self.url_queue.join()
      
        # Collect results
        results = []
        while not self.results.empty():
            results.append(self.results.get())
      
        return results

# Example usage
if __name__ == "__main__":
    scraper = WebScraper(num_workers=3)
  
    urls = [
        "https://httpbin.org/delay/1",
        "https://httpbin.org/delay/2", 
        "https://httpbin.org/html",
        "https://httpbin.org/json"
    ]
  
    start_time = time.time()
    results = scraper.scrape(urls)
    end_time = time.time()
  
    print(f"\nScraping completed in {end_time - start_time:.2f} seconds")
    print(f"Scraped {len(results)} URLs:")
  
    for result in results:
        print(f"  {result['url']}: {result['status_code']} - {result['title']}")
```

### File Processing Pipeline

```python
import threading
import queue
import os
import time
import hashlib

class FileProcessor:
    def __init__(self):
        self.file_queue = queue.Queue()
        self.hash_queue = queue.Queue()
        self.results = []
        self.results_lock = threading.Lock()
  
    def file_finder(self, directory, pattern="*.txt"):
        """Thread that finds files to process"""
        print(f"Scanning directory: {directory}")
      
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith('.txt'):  # Simple pattern matching
                    file_path = os.path.join(root, file)
                    self.file_queue.put(file_path)
                    print(f"Found file: {file_path}")
      
        # Signal end of files
        self.file_queue.put(None)
  
    def file_reader(self, reader_id):
        """Thread that reads files and queues them for hashing"""
        while True:
            file_path = self.file_queue.get()
          
            if file_path is None:
                # Pass sentinel to other readers
                self.file_queue.put(None)
                break
          
            try:
                print(f"Reader {reader_id} reading: {file_path}")
                with open(file_path, 'rb') as f:
                    content = f.read()
              
                self.hash_queue.put((file_path, content))
              
            except IOError as e:
                print(f"Reader {reader_id} error reading {file_path}: {e}")
          
            self.file_queue.task_done()
      
        # Signal end of reading
        self.hash_queue.put((None, None))
  
    def hash_calculator(self, calc_id):
        """Thread that calculates file hashes"""
        while True:
            file_path, content = self.hash_queue.get()
          
            if file_path is None:
                # Pass sentinel to other calculators
                self.hash_queue.put((None, None))
                break
          
            print(f"Calculator {calc_id} hashing: {file_path}")
          
            # Calculate multiple hashes
            md5_hash = hashlib.md5(content).hexdigest()
            sha256_hash = hashlib.sha256(content).hexdigest()
          
            result = {
                'file_path': file_path,
                'size': len(content),
                'md5': md5_hash,
                'sha256': sha256_hash,
                'processed_by': calc_id
            }
          
            # Thread-safe result storage
            with self.results_lock:
                self.results.append(result)
          
            print(f"Calculator {calc_id} completed: {file_path}")
            self.hash_queue.task_done()
  
    def process_directory(self, directory):
        """Process all files in directory using pipeline"""
      
        # Start file finder
        finder = threading.Thread(target=self.file_finder, args=(directory,))
        finder.start()
      
        # Start file readers
        readers = []
        for i in range(2):
            reader = threading.Thread(target=self.file_reader, args=(i,))
            readers.append(reader)
            reader.start()
      
        # Start hash calculators
        calculators = []
        for i in range(3):
            calc = threading.Thread(target=self.hash_calculator, args=(i,))
            calculators.append(calc)
            calc.start()
      
        # Wait for pipeline completion
        finder.join()
        self.file_queue.join()
      
        for reader in readers:
            reader.join()
      
        self.hash_queue.join()
      
        for calc in calculators:
            calc.join()
      
        return self.results

# Example usage (create some test files first)
if __name__ == "__main__":
    # Create test directory and files
    import tempfile
  
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create test files
        for i in range(5):
            file_path = os.path.join(temp_dir, f"test_{i}.txt")
            with open(file_path, 'w') as f:
                f.write(f"Test content for file {i}\n" * 100)
      
        # Process files
        processor = FileProcessor()
        start_time = time.time()
      
        results = processor.process_directory(temp_dir)
      
        end_time = time.time()
      
        print(f"\nProcessed {len(results)} files in {end_time - start_time:.2f} seconds")
        for result in results:
            print(f"File: {os.path.basename(result['file_path'])}")
            print(f"  Size: {result['size']} bytes")
            print(f"  MD5: {result['md5'][:16]}...")
            print(f"  SHA256: {result['sha256'][:16]}...")
```

## Part 10: Performance Considerations and Best Practices

### When to Use Threading vs Alternatives

> **Threading Decision Matrix:**
>
> **Use Threading for:**
>
> * I/O-bound tasks (file operations, network requests, database queries)
> * UI applications (keep interface responsive)
> * Producer-consumer scenarios
> * Concurrent access to shared resources
>
> **Don't Use Threading for:**
>
> * CPU-bound mathematical calculations (use `multiprocessing`)
> * Simple sequential tasks
> * When debugging complexity isn't worth the performance gain

### Thread Safety Checklist

```python
# Thread-safe operations (atomic in Python)
x = 1                    # ✓ Safe
x = y                    # ✓ Safe  
list.append(item)        # ✓ Safe
dict[key] = value        # ✓ Safe

# NOT thread-safe operations
x += 1                   # ✗ Not safe (read-modify-write)
list.extend(other_list)  # ✗ Not safe
dict.update(other_dict)  # ✗ Not safe

# Example of making operations thread-safe
import threading

# Unsafe version
def unsafe_increment():
    global counter
    counter += 1  # Read-modify-write - not atomic!

# Safe version
counter_lock = threading.Lock()

def safe_increment():
    global counter
    with counter_lock:
        counter += 1  # Now atomic within lock
```

### Monitoring and Debugging Threads

```python
import threading
import time

def monitor_threads():
    """Utility to monitor active threads"""
    active_threads = threading.active_count()
    current_thread = threading.current_thread()
  
    print(f"Active threads: {active_threads}")
    print(f"Current thread: {current_thread.name}")
    print(f"Main thread: {threading.main_thread().name}")
  
    print("All threads:")
    for thread in threading.enumerate():
        print(f"  - {thread.name}: alive={thread.is_alive()}, daemon={thread.daemon}")

def worker_with_monitoring(worker_id):
    print(f"Worker {worker_id} starting")
    monitor_threads()
  
    time.sleep(2)
  
    print(f"Worker {worker_id} finishing")

# Start some workers and monitor
workers = []
for i in range(3):
    worker = threading.Thread(target=worker_with_monitoring, args=(i,), name=f"Worker-{i}")
    workers.append(worker)
    worker.start()

# Monitor from main thread
time.sleep(1)
print("\n--- From main thread ---")
monitor_threads()

# Wait for completion
for worker in workers:
    worker.join()

print("\n--- After completion ---")
monitor_threads()
```

> **Key Threading Principles:**
>
> 1. **Minimize shared state** - Less sharing = fewer synchronization problems
> 2. **Use high-level primitives** - `queue.Queue`, `concurrent.futures` over raw threading
> 3. **Avoid busy waiting** - Use proper synchronization primitives
> 4. **Handle exceptions** - Threads can die silently without proper error handling
> 5. **Clean shutdown** - Always provide a way to gracefully stop threads
> 6. **Test thoroughly** - Race conditions are hard to reproduce and debug

Threading in Python is powerful for I/O-bound concurrency but requires careful consideration of synchronization, shared state, and the GIL's limitations. The patterns and primitives shown here provide a solid foundation for building robust concurrent applications.
