# Concurrent.futures: High-Level Threading and Multiprocessing from First Principles

Let's build up to `concurrent.futures` by first understanding the fundamental problems it solves and the concepts it's built upon.

## 1. First Principles: What is Concurrency?

Before diving into Python's `concurrent.futures`, we need to understand what concurrency means and why we need it.

**Concurrency** is about dealing with multiple tasks at the same time, but not necessarily executing them simultaneously. Think of it like a chef managing multiple dishes:

```
Sequential Cooking (No Concurrency):
Cook pasta → Wait for pasta → Cook sauce → Wait for sauce → Serve

Concurrent Cooking:
Start pasta → While pasta cooks, start sauce → Check both periodically → Serve when both ready
```

> **Key Mental Model** : Concurrency is about *structure* - organizing your program to handle multiple tasks. Parallelism is about *execution* - actually running multiple tasks simultaneously on multiple CPU cores.

### Why Do We Need Concurrency?

```python
import time

# Sequential approach - blocking and slow
def download_file_sequential():
    """Simulate downloading 3 files one after another"""
    files = ['file1.txt', 'file2.txt', 'file3.txt']
    results = []
  
    for file in files:
        print(f"Starting download of {file}")
        time.sleep(2)  # Simulate network delay
        print(f"Finished downloading {file}")
        results.append(f"Content of {file}")
  
    return results

# This takes 6 seconds total - very inefficient!
start = time.time()
results = download_file_sequential()
print(f"Total time: {time.time() - start:.2f} seconds")
```

The problem: We're waiting idle for each network request to complete before starting the next one. This is wasteful because the CPU isn't doing any work during those waits.

## 2. Python's Built-in Concurrency Challenges

Python has several ways to handle concurrency, but they each have drawbacks:

### The Threading Problem

```python
import threading
import time

# Traditional threading approach - complex and error-prone
def download_file(filename, results, index):
    """Download a file and store result"""
    print(f"Starting download of {filename}")
    time.sleep(2)  # Simulate network delay
    results[index] = f"Content of {filename}"
    print(f"Finished downloading {filename}")

def download_with_threads():
    """Using raw threading - notice the complexity"""
    files = ['file1.txt', 'file2.txt', 'file3.txt']
    results = [None] * len(files)  # Pre-allocate results list
    threads = []
  
    # Create and start threads
    for i, file in enumerate(files):
        thread = threading.Thread(target=download_file, args=(file, results, i))
        threads.append(thread)
        thread.start()
  
    # Wait for all threads to complete
    for thread in threads:
        thread.join()
  
    return results

# This is faster but more complex
start = time.time()
results = download_with_threads()
print(f"Total time: {time.time() - start:.2f} seconds")
print(f"Results: {results}")
```

**Problems with raw threading:**

* Manual thread management
* Complex synchronization
* Hard to handle errors
* Difficult to get return values
* Easy to create race conditions

### The Global Interpreter Lock (GIL)

> **Critical Understanding** : Python's GIL prevents true parallelism for CPU-bound tasks in threads. Only one thread can execute Python bytecode at a time. However, threads are still useful for I/O-bound tasks because the GIL is released during I/O operations.

```
GIL Behavior:
Thread 1: [CPU work] ----[I/O wait]----[CPU work]
Thread 2:           [CPU work]----[I/O wait]----[CPU work]
                         ↑              ↑
                    GIL released   GIL released
```

## 3. Enter concurrent.futures: The Solution

`concurrent.futures` provides a high-level interface that abstracts away the complexity of thread and process management while giving you the benefits of concurrency.

> **Python Philosophy** : "Simple is better than complex" - concurrent.futures embodies this by providing a clean, consistent interface for both threading and multiprocessing.

### The Core Abstraction: Executors and Futures

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def download_file(filename):
    """Simple function that returns a value - much cleaner!"""
    print(f"Starting download of {filename}")
    time.sleep(2)  # Simulate network delay
    print(f"Finished downloading {filename}")
    return f"Content of {filename}"

def download_with_executor():
    """Using concurrent.futures - clean and simple"""
    files = ['file1.txt', 'file2.txt', 'file3.txt']
  
    # Create a pool of worker threads
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Submit all tasks and get Future objects
        futures = [executor.submit(download_file, file) for file in files]
      
        # Collect results as they complete
        results = [future.result() for future in futures]
  
    return results

start = time.time()
results = download_with_executor()
print(f"Total time: {time.time() - start:.2f} seconds")
print(f"Results: {results}")
```

**Key Improvements:**

* No manual thread management
* Clean resource cleanup with context managers
* Easy to get return values
* Built-in error handling
* Same interface for both threading and multiprocessing

## 4. Understanding ThreadPoolExecutor

### Basic Concepts

A **thread pool** is a collection of pre-created threads that wait for tasks to be assigned to them. This avoids the overhead of creating and destroying threads for each task.

```
Thread Pool Visualization:
┌─────────────────┐    ┌──────┐    ┌──────────────┐
│   Task Queue    │───▶│Worker│───▶│   Results    │
│ [task1, task2,  │    │Thread│    │ [result1,    │
│  task3, task4]  │    │  1   │    │  result2,...]│
└─────────────────┘    └──────┘    └──────────────┘
                       ┌──────┐
                       │Worker│
                       │Thread│
                       │  2   │
                       └──────┘
                       ┌──────┐
                       │Worker│
                       │Thread│
                       │  3   │
                       └──────┘
```

### ThreadPoolExecutor Deep Dive

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import random

def simulate_api_call(api_name, delay=None):
    """Simulate calling different APIs with varying response times"""
    if delay is None:
        delay = random.uniform(1, 3)  # Random delay between 1-3 seconds
  
    print(f"📡 Starting API call to {api_name}")
    time.sleep(delay)
    print(f"✅ Completed API call to {api_name}")
  
    return {
        'api': api_name,
        'response_time': delay,
        'data': f"Data from {api_name}",
        'status': 'success'
    }

# Example 1: Basic usage with submit()
print("=== Example 1: Basic ThreadPoolExecutor Usage ===")
def basic_threadpool_example():
    apis = ['UserAPI', 'PaymentAPI', 'NotificationAPI', 'AnalyticsAPI']
  
    # Create executor with specific number of workers
    with ThreadPoolExecutor(max_workers=2) as executor:
        print(f"🚀 Starting {len(apis)} API calls with 2 worker threads")
      
        # Submit tasks and collect Future objects
        future_to_api = {
            executor.submit(simulate_api_call, api): api 
            for api in apis
        }
      
        # Process results as they complete
        for future in as_completed(future_to_api):
            api_name = future_to_api[future]
            try:
                result = future.result()  # This blocks until the future completes
                print(f"📊 {api_name} returned: {result['status']} in {result['response_time']:.2f}s")
            except Exception as exc:
                print(f"❌ {api_name} generated an exception: {exc}")

start = time.time()
basic_threadpool_example()
print(f"⏱️  Total execution time: {time.time() - start:.2f} seconds\n")
```

### Alternative Patterns with map()

```python
# Example 2: Using map() for simpler cases
print("=== Example 2: Using executor.map() ===")
def map_example():
    apis = ['UserAPI', 'PaymentAPI', 'NotificationAPI']
  
    with ThreadPoolExecutor(max_workers=3) as executor:
        # map() is simpler when you don't need individual Future objects
        results = list(executor.map(simulate_api_call, apis))
      
        for result in results:
            print(f"📊 {result['api']} completed in {result['response_time']:.2f}s")
      
        return results

start = time.time()
results = map_example()
print(f"⏱️  Total execution time: {time.time() - start:.2f} seconds\n")
```

### Handling Errors and Timeouts

```python
# Example 3: Error handling and timeouts
print("=== Example 3: Error Handling and Timeouts ===")

def unreliable_api_call(api_name):
    """Simulate an API that might fail"""
    delay = random.uniform(0.5, 4)  # Random delay, sometimes over 3 seconds
  
    print(f"📡 Starting {api_name} (will take {delay:.2f}s)")
    time.sleep(delay)
  
    # Simulate occasional failures
    if random.random() < 0.3:  # 30% chance of failure
        raise Exception(f"{api_name} service temporarily unavailable")
  
    return f"Success from {api_name}"

def robust_api_calls():
    apis = ['ReliableAPI', 'UnreliableAPI', 'SlowAPI', 'FastAPI']
  
    with ThreadPoolExecutor(max_workers=4) as executor:
        # Submit all tasks
        future_to_api = {
            executor.submit(unreliable_api_call, api): api 
            for api in apis
        }
      
        results = {}
      
        for future in as_completed(future_to_api, timeout=5):  # 5-second timeout
            api_name = future_to_api[future]
          
            try:
                # Wait for result with a per-task timeout
                result = future.result(timeout=3)  # 3-second timeout per task
                results[api_name] = {'status': 'success', 'data': result}
                print(f"✅ {api_name}: {result}")
              
            except TimeoutError:
                results[api_name] = {'status': 'timeout', 'error': 'Task timed out'}
                print(f"⏰ {api_name}: Timed out")
              
            except Exception as exc:
                results[api_name] = {'status': 'error', 'error': str(exc)}
                print(f"❌ {api_name}: {exc}")
      
        return results

start = time.time()
results = robust_api_calls()
print(f"⏱️  Total execution time: {time.time() - start:.2f} seconds")
print(f"📊 Final results: {results}\n")
```

## 5. Understanding ProcessPoolExecutor

While `ThreadPoolExecutor` is great for I/O-bound tasks, `ProcessPoolExecutor` is designed for CPU-bound tasks that can benefit from true parallelism.

> **Key Difference** : Processes have separate memory spaces and aren't affected by the GIL. Each process runs independently with its own Python interpreter.

### When to Use ProcessPoolExecutor

```python
from concurrent.futures import ProcessPoolExecutor
import time
import math

def cpu_intensive_task(n):
    """A CPU-bound task - calculating prime numbers"""
    def is_prime(num):
        if num < 2:
            return False
        for i in range(2, int(math.sqrt(num)) + 1):
            if num % i == 0:
                return False
        return True
  
    print(f"🔢 Finding primes up to {n}")
    primes = [i for i in range(2, n) if is_prime(i)]
    print(f"✅ Found {len(primes)} primes up to {n}")
    return len(primes)

# Compare threading vs multiprocessing for CPU-bound tasks
def compare_threading_vs_multiprocessing():
    numbers = [10000, 10000, 10000, 10000]  # Four identical CPU-intensive tasks
  
    print("=== Threading (limited by GIL) ===")
    start = time.time()
    with ThreadPoolExecutor(max_workers=4) as executor:
        thread_results = list(executor.map(cpu_intensive_task, numbers))
    thread_time = time.time() - start
    print(f"⏱️  Threading time: {thread_time:.2f} seconds")
  
    print("\n=== Multiprocessing (true parallelism) ===")
    start = time.time()
    with ProcessPoolExecutor(max_workers=4) as executor:
        process_results = list(executor.map(cpu_intensive_task, numbers))
    process_time = time.time() - start
    print(f"⏱️  Multiprocessing time: {process_time:.2f} seconds")
  
    print(f"\n📊 Speedup with multiprocessing: {thread_time/process_time:.2f}x")

compare_threading_vs_multiprocessing()
```

### Process Communication and Limitations

```python
# Example: Understanding process limitations
print("\n=== Process Communication Limitations ===")

# This works fine
def simple_calculation(x):
    return x * x

# This won't work with ProcessPoolExecutor
def problematic_function(data):
    # Can't access global variables from other processes
    # global_variable = "This won't work"
  
    # Can't access class instances that aren't picklable
    # some_object.method()  # This would fail
  
    return data * 2

def demonstrate_process_limitations():
    data = [1, 2, 3, 4, 5]
  
    with ProcessPoolExecutor(max_workers=2) as executor:
        # This works - simple function with basic data types
        results = list(executor.map(simple_calculation, data))
        print(f"✅ Simple calculation results: {results}")
      
        # This also works - function uses only passed parameters
        results2 = list(executor.map(problematic_function, data))
        print(f"✅ Data processing results: {results2}")

demonstrate_process_limitations()
```

> **Process Limitations** : Functions used with ProcessPoolExecutor must be picklable (serializable). This means:
>
> * No lambda functions
> * No nested functions
> * No access to global variables from the main process
> * Objects must be picklable

## 6. Understanding Future Objects

A **Future** represents a computation that hasn't completed yet. It's a placeholder for a result that will be available later.

```python
from concurrent.futures import ThreadPoolExecutor
import time

def long_running_task(task_id, duration):
    """A task that takes some time to complete"""
    print(f"🚀 Task {task_id} starting (will take {duration}s)")
    time.sleep(duration)
    result = f"Task {task_id} completed after {duration}s"
    print(f"✅ {result}")
    return result

def demonstrate_future_methods():
    """Explore different methods available on Future objects"""
  
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Submit tasks and get Future objects
        future1 = executor.submit(long_running_task, 1, 2)
        future2 = executor.submit(long_running_task, 2, 1)
        future3 = executor.submit(long_running_task, 3, 3)
      
        futures = [future1, future2, future3]
      
        # Check future states
        print("\n=== Checking Future States ===")
        for i, future in enumerate(futures, 1):
            print(f"Future {i} - Running: {future.running()}, Done: {future.done()}")
      
        time.sleep(0.5)  # Let some tasks start
      
        print("\nAfter 0.5 seconds:")
        for i, future in enumerate(futures, 1):
            print(f"Future {i} - Running: {future.running()}, Done: {future.done()}")
      
        # Get results with different approaches
        print("\n=== Getting Results ===")
      
        # Approach 1: result() with timeout
        try:
            result2 = future2.result(timeout=2)  # Should complete quickly
            print(f"📊 Got result with timeout: {result2}")
        except TimeoutError:
            print("⏰ Task 2 timed out")
      
        # Approach 2: Check if done before getting result
        if future2.done():
            print(f"📊 Task 2 was already done: {future2.result()}")
      
        # Approach 3: Block until all complete
        print("⏳ Waiting for all tasks to complete...")
        for i, future in enumerate(futures, 1):
            result = future.result()  # Blocks until complete
            print(f"📊 Final result {i}: {result}")

demonstrate_future_methods()
```

### Cancelling Futures

```python
def demonstrate_future_cancellation():
    """Show how to cancel futures before they start executing"""
  
    print("\n=== Future Cancellation ===")
  
    with ThreadPoolExecutor(max_workers=1) as executor:  # Only 1 worker
        # Submit multiple tasks - only one can run at a time
        future1 = executor.submit(long_running_task, 1, 1)
        future2 = executor.submit(long_running_task, 2, 1)
        future3 = executor.submit(long_running_task, 3, 1)
      
        # Try to cancel the third task before it starts
        time.sleep(0.1)  # Give first task time to start
      
        cancelled = future3.cancel()
        print(f"🚫 Attempted to cancel task 3: {'Success' if cancelled else 'Failed'}")
        print(f"   Task 3 cancelled: {future3.cancelled()}")
        print(f"   Task 3 running: {future3.running()}")
      
        # Wait for remaining tasks
        for i, future in enumerate([future1, future2, future3], 1):
            if not future.cancelled():
                try:
                    result = future.result()
                    print(f"📊 Task {i} result: {result}")
                except Exception as e:
                    print(f"❌ Task {i} error: {e}")
            else:
                print(f"🚫 Task {i} was cancelled")

demonstrate_future_cancellation()
```

## 7. Advanced Patterns and Best Practices

### Pattern 1: Producer-Consumer with Futures

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import random
from collections import deque

def data_producer(producer_id, num_items):
    """Simulate producing data items"""
    items = []
    for i in range(num_items):
        # Simulate work to produce each item
        time.sleep(random.uniform(0.1, 0.3))
        item = f"item_{producer_id}_{i}"
        items.append(item)
        print(f"📦 Producer {producer_id} created {item}")
  
    return items

def data_processor(items):
    """Process a batch of items"""
    processor_id = random.randint(1000, 9999)
    print(f"🔄 Processor {processor_id} starting batch of {len(items)} items")
  
    # Simulate processing time
    time.sleep(random.uniform(0.5, 1.5))
  
    processed = [f"processed_{item}" for item in items]
    print(f"✅ Processor {processor_id} completed batch")
    return processed

def producer_consumer_pattern():
    """Demonstrate a producer-consumer pattern with futures"""
    print("\n=== Producer-Consumer Pattern ===")
  
    # Stage 1: Produce data concurrently
    with ThreadPoolExecutor(max_workers=3) as producer_executor:
        # Start multiple producers
        producer_futures = [
            producer_executor.submit(data_producer, i, 3)
            for i in range(1, 4)  # 3 producers, each making 3 items
        ]
      
        # Collect all produced items
        all_items = []
        for future in as_completed(producer_futures):
            items = future.result()
            all_items.extend(items)
  
    print(f"📊 Total items produced: {len(all_items)}")
  
    # Stage 2: Process data in batches concurrently
    batch_size = 3
    batches = [all_items[i:i+batch_size] for i in range(0, len(all_items), batch_size)]
  
    with ThreadPoolExecutor(max_workers=2) as processor_executor:
        processor_futures = [
            processor_executor.submit(data_processor, batch)
            for batch in batches
        ]
      
        # Collect processed results
        final_results = []
        for future in as_completed(processor_futures):
            processed_batch = future.result()
            final_results.extend(processed_batch)
  
    print(f"📊 Total items processed: {len(final_results)}")
    return final_results

results = producer_consumer_pattern()
```

### Pattern 2: Dynamic Task Generation

```python
def recursive_task_processor(task_data, depth=0, max_depth=3):
    """A task that might generate more tasks"""
    task_id = task_data.get('id', 'unknown')
    print(f"{'  ' * depth}🔄 Processing task {task_id} at depth {depth}")
  
    # Simulate processing
    time.sleep(random.uniform(0.2, 0.5))
  
    results = [f"result_from_{task_id}"]
  
    # Sometimes generate subtasks (but not too deep)
    if depth < max_depth and random.random() < 0.5:
        num_subtasks = random.randint(1, 2)
        subtask_data = [
            {'id': f"{task_id}_sub_{i}", 'parent': task_id}
            for i in range(num_subtasks)
        ]
      
        print(f"{'  ' * depth}📋 Task {task_id} generated {num_subtasks} subtasks")
        return {'results': results, 'subtasks': subtask_data}
  
    return {'results': results, 'subtasks': []}

def dynamic_task_processing():
    """Process tasks that can generate more tasks dynamically"""
    print("\n=== Dynamic Task Generation ===")
  
    # Start with initial tasks
    initial_tasks = [{'id': f'root_{i}'} for i in range(3)]
  
    with ThreadPoolExecutor(max_workers=4) as executor:
        # Keep track of active futures and pending tasks
        pending_tasks = deque(initial_tasks)
        active_futures = {}
        all_results = []
      
        # Process tasks until no more remain
        while pending_tasks or active_futures:
            # Submit new tasks if we have capacity and pending tasks
            while len(active_futures) < 4 and pending_tasks:
                task = pending_tasks.popleft()
                future = executor.submit(recursive_task_processor, task)
                active_futures[future] = task
          
            # Check for completed tasks
            if active_futures:
                # Wait for at least one task to complete
                completed_futures = as_completed(active_futures.keys(), timeout=1)
              
                try:
                    for future in completed_futures:
                        task = active_futures.pop(future)
                        result = future.result()
                      
                        # Add results
                        all_results.extend(result['results'])
                      
                        # Add any new subtasks to the queue
                        pending_tasks.extend(result['subtasks'])
                      
                        print(f"✅ Completed task {task['id']}, "
                              f"added {len(result['subtasks'])} new tasks")
                        break  # Process one completion at a time
                      
                except TimeoutError:
                    continue  # No tasks completed yet, continue loop
  
    print(f"📊 All tasks completed. Total results: {len(all_results)}")
    return all_results

results = dynamic_task_processing()
```

## 8. Common Pitfalls and How to Avoid Them

### Pitfall 1: Not Using Context Managers

```python
# ❌ BAD: Manual executor management
def bad_executor_usage():
    executor = ThreadPoolExecutor(max_workers=4)
  
    try:
        future = executor.submit(long_running_task, 1, 1)
        result = future.result()
        return result
    finally:
        executor.shutdown(wait=True)  # Easy to forget!

# ✅ GOOD: Use context managers
def good_executor_usage():
    with ThreadPoolExecutor(max_workers=4) as executor:
        future = executor.submit(long_running_task, 1, 1)
        result = future.result()
        return result
    # Executor automatically cleaned up
```

### Pitfall 2: Blocking the Main Thread Unnecessarily

```python
# ❌ BAD: Getting results immediately (blocking)
def bad_result_handling():
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = []
        for i in range(4):
            future = executor.submit(long_running_task, i, 1)
            result = future.result()  # ❌ Blocks immediately, no concurrency!
            print(f"Got result: {result}")

# ✅ GOOD: Submit all tasks first, then collect results
def good_result_handling():
    with ThreadPoolExecutor(max_workers=4) as executor:
        # Submit all tasks first
        futures = [
            executor.submit(long_running_task, i, 1)
            for i in range(4)
        ]
      
        # Then collect results (can use as_completed for better responsiveness)
        for future in as_completed(futures):
            result = future.result()
            print(f"Got result: {result}")
```

### Pitfall 3: Incorrect Error Handling

```python
def failing_task(task_id):
    """A task that sometimes fails"""
    if task_id == 2:
        raise ValueError(f"Task {task_id} failed!")
    return f"Success from task {task_id}"

# ❌ BAD: Not handling exceptions properly
def bad_error_handling():
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(failing_task, i) for i in range(4)]
      
        # This will raise an exception and stop processing other results
        results = [future.result() for future in futures]  # ❌ Uncaught exception!
        return results

# ✅ GOOD: Handle exceptions per task
def good_error_handling():
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(failing_task, i) for i in range(4)]
      
        results = []
        for i, future in enumerate(futures):
            try:
                result = future.result()
                results.append(result)
                print(f"✅ Task {i}: {result}")
            except Exception as e:
                error_msg = f"Task {i} failed: {e}"
                results.append(error_msg)
                print(f"❌ {error_msg}")
      
        return results

print("=== Error Handling Comparison ===")
try:
    print("Bad error handling:")
    bad_error_handling()
except Exception as e:
    print(f"❌ Entire function failed: {e}")

print("\nGood error handling:")
results = good_error_handling()
print(f"📊 All results: {results}")
```

### Pitfall 4: Choosing Wrong Executor Type

```python
# Example showing when to use each executor type
import requests
import json

def io_bound_task(url):
    """I/O-bound: network request"""
    # This should use ThreadPoolExecutor (I/O releases GIL)
    response = requests.get(url, timeout=5)
    return len(response.content)

def cpu_bound_task(n):
    """CPU-bound: computation"""
    # This should use ProcessPoolExecutor (avoids GIL)
    return sum(i * i for i in range(n))

def mixed_workload_example():
    """Demonstrate choosing the right executor for different tasks"""
  
    # I/O-bound tasks: use ThreadPoolExecutor
    urls = [
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/1'
    ]
  
    print("=== I/O-bound tasks with ThreadPoolExecutor ===")
    start = time.time()
    with ThreadPoolExecutor(max_workers=3) as executor:
        try:
            io_results = list(executor.map(io_bound_task, urls))
            print(f"📊 I/O results: {io_results}")
        except Exception as e:
            print(f"❌ I/O tasks failed: {e}")
    print(f"⏱️  I/O tasks time: {time.time() - start:.2f}s")
  
    # CPU-bound tasks: use ProcessPoolExecutor
    numbers = [50000, 50000, 50000]
  
    print("\n=== CPU-bound tasks with ProcessPoolExecutor ===")
    start = time.time()
    with ProcessPoolExecutor(max_workers=3) as executor:
        cpu_results = list(executor.map(cpu_bound_task, numbers))
        print(f"📊 CPU results: {cpu_results}")
    print(f"⏱️  CPU tasks time: {time.time() - start:.2f}s")

# Uncomment to run (requires internet connection):
# mixed_workload_example()
```

## 9. Real-World Application Examples

### Example 1: Web Scraping with Rate Limiting

```python
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin

def fetch_page(url, delay=1):
    """Simulate fetching a web page with rate limiting"""
    print(f"🌐 Fetching {url}")
  
    # Simulate network delay and rate limiting
    time.sleep(delay + random.uniform(0, 0.5))
  
    # Simulate different response scenarios
    if random.random() < 0.1:  # 10% failure rate
        raise Exception(f"Failed to fetch {url}")
  
    # Simulate different page sizes
    page_size = random.randint(1000, 10000)
    content = f"Content from {url} ({page_size} bytes)"
  
    print(f"✅ Successfully fetched {url}")
    return {
        'url': url,
        'content': content,
        'size': page_size,
        'timestamp': time.time()
    }

def web_scraper_example():
    """Example: Scraping multiple pages concurrently with rate limiting"""
    print("\n=== Web Scraping Example ===")
  
    # URLs to scrape
    base_urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
        'https://example.com/page4',
        'https://example.com/page5'
    ]
  
    successful_pages = []
    failed_pages = []
  
    # Use ThreadPoolExecutor with limited workers for rate limiting
    with ThreadPoolExecutor(max_workers=2) as executor:  # Limit to 2 concurrent requests
        # Submit all scraping tasks
        future_to_url = {
            executor.submit(fetch_page, url, 0.5): url 
            for url in base_urls
        }
      
        # Process results as they complete
        for future in as_completed(future_to_url):
            url = future_to_url[future]
          
            try:
                result = future.result(timeout=10)  # 10-second timeout
                successful_pages.append(result)
                print(f"📊 Scraped {url}: {result['size']} bytes")
              
            except Exception as exc:
                failed_pages.append({'url': url, 'error': str(exc)})
                print(f"❌ Failed to scrape {url}: {exc}")
  
    print(f"\n📊 Scraping Summary:")
    print(f"   ✅ Successful: {len(successful_pages)} pages")
    print(f"   ❌ Failed: {len(failed_pages)} pages")
    print(f"   📦 Total data: {sum(p['size'] for p in successful_pages)} bytes")
  
    return successful_pages, failed_pages

successful, failed = web_scraper_example()
```

### Example 2: Data Processing Pipeline

```python
def data_processing_pipeline():
    """Example: Multi-stage data processing pipeline"""
    print("\n=== Data Processing Pipeline ===")
  
    # Simulate raw data
    raw_data = [
        {'id': i, 'value': random.randint(1, 100), 'category': random.choice(['A', 'B', 'C'])}
        for i in range(20)
    ]
  
    def clean_data(data_chunk):
        """Stage 1: Clean and validate data"""
        cleaned = []
        for item in data_chunk:
            # Simulate cleaning work
            time.sleep(0.1)
          
            if item['value'] > 0:  # Simple validation
                cleaned_item = {
                    'id': item['id'],
                    'value': item['value'],
                    'category': item['category'].lower(),
                    'processed_at': time.time()
                }
                cleaned.append(cleaned_item)
      
        print(f"🧹 Cleaned chunk of {len(data_chunk)} items -> {len(cleaned)} valid")
        return cleaned
  
    def enrich_data(data_chunk):
        """Stage 2: Enrich data with additional information"""
        enriched = []
        for item in data_chunk:
            # Simulate enrichment work (e.g., API calls, database lookups)
            time.sleep(0.2)
          
            enriched_item = item.copy()
            enriched_item.update({
                'enriched_value': item['value'] * 1.5,
                'category_score': {'a': 10, 'b': 20, 'c': 30}[item['category']],
                'enriched_at': time.time()
            })
            enriched.append(enriched_item)
      
        print(f"📈 Enriched chunk of {len(data_chunk)} items")
        return enriched
  
    def aggregate_data(data_chunk):
        """Stage 3: Aggregate and summarize data"""
        # Simulate aggregation work
        time.sleep(0.3)
      
        by_category = {}
        for item in data_chunk:
            cat = item['category']
            if cat not in by_category:
                by_category[cat] = {'count': 0, 'total_value': 0, 'avg_score': 0}
          
            by_category[cat]['count'] += 1
            by_category[cat]['total_value'] += item['enriched_value']
            by_category[cat]['avg_score'] = by_category[cat]['total_value'] / by_category[cat]['count']
      
        print(f"📊 Aggregated chunk into {len(by_category)} categories")
        return by_category
  
    # Process data in pipeline stages
    chunk_size = 5
    chunks = [raw_data[i:i+chunk_size] for i in range(0, len(raw_data), chunk_size)]
  
    print(f"🚀 Starting pipeline with {len(chunks)} chunks of data")
  
    # Stage 1: Clean data in parallel
    with ThreadPoolExecutor(max_workers=3) as executor:
        cleaned_chunks = list(executor.map(clean_data, chunks))
  
    # Flatten cleaned data
    cleaned_data = [item for chunk in cleaned_chunks for item in chunk]
    print(f"📊 Stage 1 complete: {len(cleaned_data)} items cleaned")
  
    # Stage 2: Enrich data in parallel
    enriched_chunks = [cleaned_data[i:i+chunk_size] for i in range(0, len(cleaned_data), chunk_size)]
    with ThreadPoolExecutor(max_workers=2) as executor:
        enriched_results = list(executor.map(enrich_data, enriched_chunks))
  
    # Flatten enriched data
    enriched_data = [item for chunk in enriched_results for item in chunk]
    print(f"📊 Stage 2 complete: {len(enriched_data)} items enriched")
  
    # Stage 3: Aggregate data in parallel
    final_chunks = [enriched_data[i:i+chunk_size] for i in range(0, len(enriched_data), chunk_size)]
    with ThreadPoolExecutor(max_workers=2) as executor:
        aggregated_results = list(executor.map(aggregate_data, final_chunks))
  
    # Combine aggregation results
    final_aggregation = {}
    for result in aggregated_results:
        for category, stats in result.items():
            if category not in final_aggregation:
                final_aggregation[category] = {'count': 0, 'total_value': 0}
          
            final_aggregation[category]['count'] += stats['count']
            final_aggregation[category]['total_value'] += stats['total_value'] * stats['count']
  
    # Calculate final averages
    for category in final_aggregation:
        total_count = final_aggregation[category]['count']
        total_value = final_aggregation[category]['total_value']
        final_aggregation[category]['avg_value'] = total_value / total_count if total_count > 0 else 0
  
    print(f"📊 Pipeline complete! Final aggregation by category:")
    for category, stats in final_aggregation.items():
        print(f"   Category {category}: {stats['count']} items, avg value: {stats['avg_value']:.2f}")
  
    return final_aggregation

pipeline_results = data_processing_pipeline()
```

## 10. Performance Tuning and Best Practices

> **Key Principle** : "Premature optimization is the root of all evil" - Always measure before optimizing, and choose the right tool for the job.

### Choosing the Right Number of Workers

```python
import os
import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def benchmark_worker_count():
    """Benchmark different worker counts to find optimal configuration"""
    print("\n=== Worker Count Optimization ===")
  
    def io_task():
        """I/O-bound task"""
        time.sleep(0.1)
        return "I/O complete"
  
    def cpu_task():
        """CPU-bound task"""
        return sum(i * i for i in range(10000))
  
    task_counts = [10, 20, 30]
    worker_counts = [1, 2, 4, 8]
  
    print(f"💻 System has {os.cpu_count()} CPU cores")
  
    # Benchmark I/O-bound tasks
    print("\n📡 I/O-bound task benchmarks:")
    for task_count in task_counts:
        print(f"\n  {task_count} I/O tasks:")
        for worker_count in worker_counts:
            start = time.time()
            with ThreadPoolExecutor(max_workers=worker_count) as executor:
                results = list(executor.map(lambda _: io_task(), range(task_count)))
            duration = time.time() - start
            print(f"    {worker_count} workers: {duration:.2f}s")
  
    # Benchmark CPU-bound tasks
    print("\n🔢 CPU-bound task benchmarks:")
    for task_count in [4, 8]:  # Fewer tasks for CPU-bound
        print(f"\n  {task_count} CPU tasks:")
        for worker_count in [1, 2, 4]:  # Limited by CPU cores
            start = time.time()
            with ProcessPoolExecutor(max_workers=worker_count) as executor:
                results = list(executor.map(lambda _: cpu_task(), range(task_count)))
            duration = time.time() - start
            print(f"    {worker_count} workers: {duration:.2f}s")

benchmark_worker_count()
```

### Memory Management and Resource Cleanup

```python
def demonstrate_resource_management():
    """Show proper resource management patterns"""
    print("\n=== Resource Management Best Practices ===")
  
    def resource_intensive_task(task_id):
        """A task that uses significant resources"""
        # Simulate allocating large amounts of memory
        large_data = [random.random() for _ in range(100000)]
      
        # Simulate processing
        time.sleep(0.5)
        result = sum(large_data)
      
        # Explicitly clean up (Python's GC will handle this, but good practice)
        del large_data
      
        return f"Task {task_id}: {result:.2f}"
  
    # ✅ GOOD: Proper resource management
    print("✅ Proper resource management:")
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Context manager ensures proper cleanup
        futures = [
            executor.submit(resource_intensive_task, i)
            for i in range(5)
        ]
      
        for future in as_completed(futures):
            try:
                result = future.result()
                print(f"  {result}")
            except Exception as e:
                print(f"  ❌ Task failed: {e}")
  
    print("  🧹 All resources cleaned up automatically")

demonstrate_resource_management()
```

## Summary: When to Use concurrent.futures

> **Decision Tree for Concurrency in Python:**

```
Is your task I/O-bound (network, file, database)?
├─ Yes → Use ThreadPoolExecutor
│   ├─ Many small tasks → Use executor.map()
│   ├─ Need individual control → Use executor.submit() + as_completed()
│   └─ Need error handling → Use try/except with future.result()
│
└─ Is your task CPU-bound (computation, processing)?
    ├─ Yes → Use ProcessPoolExecutor
    │   ├─ Simple parallel computation → Use executor.map()
    │   ├─ Functions must be picklable
    │   └─ Optimal workers ≈ CPU cores
    │
    └─ Mixed workload → Use appropriate executor for each task type
```

**Key Takeaways:**

1. **concurrent.futures provides a clean, high-level interface** for both threading and multiprocessing
2. **Use ThreadPoolExecutor for I/O-bound tasks** (network requests, file operations)
3. **Use ProcessPoolExecutor for CPU-bound tasks** (computations, data processing)
4. **Always use context managers** (`with` statements) for automatic resource cleanup
5. **Handle exceptions per task** to avoid stopping the entire operation
6. **Choose worker count based on task type** : I/O-bound can have many workers, CPU-bound should match CPU cores
7. **Use as_completed()** for better responsiveness when processing results
8. **Future objects provide powerful control** over task execution and results

The `concurrent.futures` module embodies Python's philosophy of providing simple, elegant solutions to complex problems. It abstracts away the complexity of thread and process management while giving you the full power of concurrent execution.
