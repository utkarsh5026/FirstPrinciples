# Work Distribution Patterns in Python: From First Principles

Let me build up to work distribution patterns by starting with fundamental concepts that make distributed computing necessary and meaningful.

## Why We Need Work Distribution

At its core, programming is about  **transforming data through computation** . When we have:

* Large amounts of data to process
* Complex computations that take time
* Multiple tasks that can run independently
* Need for fault tolerance and scalability

We run into the fundamental limitation:  **a single process on a single machine can only do one thing at a time** .

```python
# Sequential processing - fundamental limitation
def process_large_dataset(data):
    results = []
    for item in data:  # One item at a time
        result = expensive_computation(item)  # Could take seconds
        results.append(result)
    return results

# Problem: 1000 items × 2 seconds each = 33+ minutes!
large_data = range(1000)
start_time = time.time()
results = process_large_dataset(large_data)
print(f"Took {time.time() - start_time} seconds")
```

> **Fundamental Principle** : Work distribution is about breaking sequential bottlenecks by utilizing multiple computational resources simultaneously.

## Building Blocks: From Sequential to Parallel

### 1. Understanding Python's Execution Model

Python's execution happens in the  **interpreter** , which processes your code line by line:

```
Your Code → Python Interpreter → CPU Instructions → Results
     ↓
Single-threaded by default (GIL - Global Interpreter Lock)
```

```python
# This demonstrates Python's sequential nature
import time

def demonstrate_sequential_execution():
    print("Task 1 starting...")
    time.sleep(2)  # Simulate work
    print("Task 1 complete")
  
    print("Task 2 starting...")
    time.sleep(2)  # Simulate work  
    print("Task 2 complete")

# Output shows tasks run one after another
demonstrate_sequential_execution()
```

> **Key Insight** : Python's Global Interpreter Lock (GIL) means only one thread can execute Python bytecode at a time, making true parallelism impossible with threads for CPU-bound tasks.

### 2. Introducing Concurrency Concepts

**Concurrency** vs  **Parallelism** :

* **Concurrency** : Managing multiple tasks at once (juggling)
* **Parallelism** : Actually doing multiple tasks simultaneously (multiple workers)

```python
import asyncio
import time

# Concurrent approach - tasks yield control during waiting
async def concurrent_task(name, duration):
    print(f"Task {name} starting...")
    await asyncio.sleep(duration)  # Non-blocking wait
    print(f"Task {name} complete")
    return f"Result from {name}"

async def demonstrate_concurrency():
    # Tasks run concurrently, not sequentially
    tasks = [
        concurrent_task("A", 2),
        concurrent_task("B", 2),
        concurrent_task("C", 2)
    ]
  
    start_time = time.time()
    results = await asyncio.gather(*tasks)  # Run concurrently
    duration = time.time() - start_time
  
    print(f"All tasks completed in {duration:.2f} seconds")
    return results

# asyncio.run(demonstrate_concurrency())
# Output: All tasks complete in ~2 seconds, not 6!
```

### 3. True Parallelism with Multiprocessing

For CPU-bound work, we need separate processes:

```python
import multiprocessing as mp
import time

def cpu_intensive_task(n):
    """Simulate CPU-intensive work"""
    total = 0
    for i in range(n * 1000000):
        total += i
    return total

def compare_approaches():
    numbers = [100, 200, 300, 400]
  
    # Sequential approach
    start_time = time.time()
    sequential_results = [cpu_intensive_task(n) for n in numbers]
    sequential_time = time.time() - start_time
  
    # Parallel approach
    start_time = time.time()
    with mp.Pool() as pool:
        parallel_results = pool.map(cpu_intensive_task, numbers)
    parallel_time = time.time() - start_time
  
    print(f"Sequential: {sequential_time:.2f}s")
    print(f"Parallel: {parallel_time:.2f}s")
    print(f"Speedup: {sequential_time/parallel_time:.2f}x")

# compare_approaches()
```

## Map-Reduce: The Foundation Pattern

Map-Reduce breaks complex data processing into two fundamental operations:

> **Map-Reduce Philosophy** :
>
> * **Map** : Transform each piece of data independently
> * **Reduce** : Combine transformed pieces into final result
> * **Key insight** : If transformations are independent, they can run in parallel

### Basic Map-Reduce Implementation

```python
from functools import reduce
import multiprocessing as mp

def basic_map_reduce_sequential(data, map_func, reduce_func):
    """Sequential map-reduce for understanding"""
    # Map phase: transform each item
    mapped_data = [map_func(item) for item in data]
  
    # Reduce phase: combine all results
    result = reduce(reduce_func, mapped_data)
    return result

# Example: Calculate sum of squares
numbers = [1, 2, 3, 4, 5]

def square(x):
    return x * x

def add(x, y):
    return x + y

result = basic_map_reduce_sequential(numbers, square, add)
print(f"Sum of squares: {result}")  # 1 + 4 + 9 + 16 + 25 = 55
```

### Distributed Map-Reduce with Multiprocessing

```python
import multiprocessing as mp
from functools import reduce
import time

class MapReduceProcessor:
    def __init__(self, num_workers=None):
        self.num_workers = num_workers or mp.cpu_count()
  
    def map_reduce(self, data, map_func, reduce_func):
        """Distributed map-reduce implementation"""
    
        # Step 1: Distribute map operations across processes
        with mp.Pool(self.num_workers) as pool:
            print(f"Mapping across {self.num_workers} processes...")
            mapped_results = pool.map(map_func, data)
    
        # Step 2: Reduce results sequentially
        # (In practice, this could also be distributed for very large datasets)
        print("Reducing results...")
        final_result = reduce(reduce_func, mapped_results)
    
        return final_result

# Example: Process large dataset
def expensive_calculation(n):
    """Simulate expensive computation"""
    time.sleep(0.1)  # Simulate processing time
    return n * n + 2 * n + 1

def combine_results(x, y):
    return x + y

# Test with larger dataset
large_dataset = list(range(20))
processor = MapReduceProcessor()

start_time = time.time()
result = processor.map_reduce(large_dataset, expensive_calculation, combine_results)
duration = time.time() - start_time

print(f"Result: {result}")
print(f"Processed in {duration:.2f} seconds")
```

### Advanced Map-Reduce with Chunking

For very large datasets, we need to chunk data efficiently:

```python
import multiprocessing as mp
from functools import reduce
import math

class AdvancedMapReduce:
    def __init__(self, num_workers=None, chunk_size=None):
        self.num_workers = num_workers or mp.cpu_count()
        self.chunk_size = chunk_size
  
    def _chunk_data(self, data, chunk_size):
        """Split data into chunks for processing"""
        for i in range(0, len(data), chunk_size):
            yield data[i:i + chunk_size]
  
    def _process_chunk(self, chunk_and_map_func):
        """Process a chunk of data with map function"""
        chunk, map_func = chunk_and_map_func
        return [map_func(item) for item in chunk]
  
    def map_reduce(self, data, map_func, reduce_func):
        """Advanced map-reduce with automatic chunking"""
    
        # Calculate optimal chunk size if not provided
        if self.chunk_size is None:
            self.chunk_size = max(1, len(data) // (self.num_workers * 4))
    
        print(f"Processing {len(data)} items in chunks of {self.chunk_size}")
    
        # Create chunks
        chunks = list(self._chunk_data(data, self.chunk_size))
        chunk_args = [(chunk, map_func) for chunk in chunks]
    
        # Map phase: process chunks in parallel
        with mp.Pool(self.num_workers) as pool:
            chunk_results = pool.map(self._process_chunk, chunk_args)
    
        # Flatten results from all chunks
        all_mapped_results = []
        for chunk_result in chunk_results:
            all_mapped_results.extend(chunk_result)
    
        # Reduce phase
        return reduce(reduce_func, all_mapped_results)

# Example with very large dataset
def process_number(n):
    # Simulate complex calculation
    result = 0
    for i in range(100):  # More intensive calculation
        result += n * i
    return result

# Test with large dataset
large_data = list(range(1000))
advanced_processor = AdvancedMapReduce(chunk_size=50)

start_time = time.time()
result = advanced_processor.map_reduce(large_data, process_number, lambda x, y: x + y)
duration = time.time() - start_time

print(f"Processed {len(large_data)} items in {duration:.2f} seconds")
```

## Task Queuing: Managing Work Distribution

Task queues solve the problem of **asynchronous work distribution** - separating task creation from task execution.

> **Task Queue Mental Model** :
>
> ```
> Producer → [Queue] → Consumer
> (Creates   (Stores   (Processes
>  tasks)     tasks)    tasks)
> ```

### Basic Queue Implementation

```python
import queue
import threading
import time
import random

class SimpleTaskQueue:
    def __init__(self, num_workers=3):
        self.task_queue = queue.Queue()
        self.result_queue = queue.Queue()
        self.num_workers = num_workers
        self.workers = []
        self.shutdown_flag = threading.Event()
  
    def worker(self, worker_id):
        """Worker function that processes tasks"""
        print(f"Worker {worker_id} started")
    
        while not self.shutdown_flag.is_set():
            try:
                # Get task with timeout to allow periodic shutdown checks
                task_func, args, kwargs = self.task_queue.get(timeout=1)
            
                print(f"Worker {worker_id} processing task")
            
                # Execute task
                try:
                    result = task_func(*args, **kwargs)
                    self.result_queue.put(('success', result))
                except Exception as e:
                    self.result_queue.put(('error', str(e)))
            
                # Mark task as done
                self.task_queue.task_done()
            
            except queue.Empty:
                continue  # Timeout occurred, check shutdown flag
  
    def start(self):
        """Start worker threads"""
        for i in range(self.num_workers):
            worker_thread = threading.Thread(target=self.worker, args=(i,))
            worker_thread.daemon = True
            worker_thread.start()
            self.workers.append(worker_thread)
  
    def add_task(self, func, *args, **kwargs):
        """Add a task to the queue"""
        self.task_queue.put((func, args, kwargs))
  
    def get_results(self, num_results):
        """Get specified number of results"""
        results = []
        for _ in range(num_results):
            status, result = self.result_queue.get()
            results.append((status, result))
        return results
  
    def shutdown(self):
        """Shutdown the queue system"""
        # Wait for all tasks to complete
        self.task_queue.join()
    
        # Signal workers to shutdown
        self.shutdown_flag.set()
    
        # Wait for workers to finish
        for worker in self.workers:
            worker.join()

# Example usage
def simulate_work(task_id, duration):
    """Simulate some work"""
    time.sleep(duration)
    return f"Task {task_id} completed after {duration}s"

# Test the queue system
task_queue = SimpleTaskQueue(num_workers=3)
task_queue.start()

# Add tasks
tasks_to_add = 10
for i in range(tasks_to_add):
    duration = random.uniform(0.5, 2.0)
    task_queue.add_task(simulate_work, i, duration)

print(f"Added {tasks_to_add} tasks to queue")

# Get results
results = task_queue.get_results(tasks_to_add)
for status, result in results:
    print(f"{status}: {result}")

task_queue.shutdown()
```

### Advanced Task Queue with Priorities and Retry Logic

```python
import heapq
import threading
import time
import random
from dataclasses import dataclass, field
from typing import Any, Callable
import traceback

@dataclass
class Task:
    priority: int  # Lower number = higher priority
    func: Callable
    args: tuple
    kwargs: dict
    task_id: str
    max_retries: int = 3
    current_attempts: int = 0
    created_at: float = field(default_factory=time.time)
  
    def __lt__(self, other):
        # For heapq comparison
        return self.priority < other.priority

class AdvancedTaskQueue:
    def __init__(self, num_workers=3):
        self.task_heap = []
        self.task_lock = threading.Lock()
        self.result_queue = queue.Queue()
        self.num_workers = num_workers
        self.workers = []
        self.shutdown_flag = threading.Event()
        self.stats = {
            'tasks_completed': 0,
            'tasks_failed': 0,
            'tasks_retried': 0
        }
  
    def worker(self, worker_id):
        """Enhanced worker with retry logic"""
        print(f"Worker {worker_id} started")
    
        while not self.shutdown_flag.is_set():
            task = None
        
            # Get highest priority task
            with self.task_lock:
                if self.task_heap:
                    task = heapq.heappop(self.task_heap)
        
            if task is None:
                time.sleep(0.1)  # No tasks available
                continue
        
            print(f"Worker {worker_id} processing task {task.task_id} "
                  f"(priority {task.priority}, attempt {task.current_attempts + 1})")
        
            try:
                # Execute task
                result = task.func(*task.args, **task.kwargs)
                self.result_queue.put(('success', task.task_id, result))
                self.stats['tasks_completed'] += 1
            
            except Exception as e:
                task.current_attempts += 1
            
                if task.current_attempts < task.max_retries:
                    # Retry with exponential backoff
                    delay = 2 ** task.current_attempts
                    print(f"Task {task.task_id} failed, retrying in {delay}s")
                
                    # Schedule retry (with lower priority)
                    time.sleep(delay)
                    task.priority += 10  # Lower priority for retries
                
                    with self.task_lock:
                        heapq.heappush(self.task_heap, task)
                
                    self.stats['tasks_retried'] += 1
                else:
                    # Max retries exceeded
                    error_msg = f"Task failed after {task.max_retries} attempts: {str(e)}"
                    self.result_queue.put(('error', task.task_id, error_msg))
                    self.stats['tasks_failed'] += 1
  
    def start(self):
        """Start worker threads"""
        for i in range(self.num_workers):
            worker_thread = threading.Thread(target=self.worker, args=(i,))
            worker_thread.daemon = True
            worker_thread.start()
            self.workers.append(worker_thread)
  
    def add_task(self, func, *args, priority=5, task_id=None, max_retries=3, **kwargs):
        """Add a prioritized task with retry capability"""
        if task_id is None:
            task_id = f"task_{int(time.time() * 1000000)}"
    
        task = Task(
            priority=priority,
            func=func,
            args=args,
            kwargs=kwargs,
            task_id=task_id,
            max_retries=max_retries
        )
    
        with self.task_lock:
            heapq.heappush(self.task_heap, task)
  
    def get_stats(self):
        """Get queue statistics"""
        with self.task_lock:
            pending_tasks = len(self.task_heap)
    
        return {
            **self.stats,
            'pending_tasks': pending_tasks
        }

# Example with different priorities and failure scenarios
def reliable_task(task_id, duration):
    time.sleep(duration)
    return f"Reliable task {task_id} completed"

def unreliable_task(task_id, failure_rate=0.7):
    if random.random() < failure_rate:
        raise Exception(f"Task {task_id} randomly failed")
    return f"Unreliable task {task_id} succeeded"

# Test advanced queue
advanced_queue = AdvancedTaskQueue(num_workers=2)
advanced_queue.start()

# Add high priority reliable tasks
for i in range(3):
    advanced_queue.add_task(
        reliable_task, f"high_{i}", 0.5,
        priority=1, task_id=f"high_priority_{i}"
    )

# Add low priority reliable tasks  
for i in range(3):
    advanced_queue.add_task(
        reliable_task, f"low_{i}", 0.5,
        priority=10, task_id=f"low_priority_{i}"
    )

# Add unreliable tasks that might need retries
for i in range(3):
    advanced_queue.add_task(
        unreliable_task, f"unreliable_{i}",
        priority=5, task_id=f"unreliable_{i}", max_retries=3
    )

# Monitor progress
total_tasks = 9
time.sleep(1)

while True:
    stats = advanced_queue.get_stats()
    print(f"Stats: {stats}")
  
    if stats['tasks_completed'] + stats['tasks_failed'] >= total_tasks:
        break
  
    time.sleep(2)

advanced_queue.shutdown()
```

## Load Balancing: Distributing Work Efficiently

Load balancing ensures work is distributed optimally across available resources.

> **Load Balancing Principles** :
>
> * **Even distribution** : Prevent bottlenecks
> * **Health monitoring** : Route around failures
> * **Adaptive routing** : Respond to changing conditions
> * **Graceful degradation** : Handle overload scenarios

### Round-Robin Load Balancer

```python
import threading
import time
import random
from typing import List, Callable, Any
import queue

class Worker:
    def __init__(self, worker_id: str, processing_func: Callable):
        self.worker_id = worker_id
        self.processing_func = processing_func
        self.task_queue = queue.Queue()
        self.is_healthy = True
        self.current_load = 0
        self.total_processed = 0
        self.total_errors = 0
        self.thread = None
        self.shutdown_flag = threading.Event()
  
    def start(self):
        """Start the worker thread"""
        self.thread = threading.Thread(target=self._worker_loop)
        self.thread.daemon = True
        self.thread.start()
  
    def _worker_loop(self):
        """Main worker processing loop"""
        while not self.shutdown_flag.is_set():
            try:
                task = self.task_queue.get(timeout=1)
                self.current_load += 1
            
                try:
                    # Process the task
                    result = self.processing_func(task)
                    self.total_processed += 1
                    print(f"Worker {self.worker_id} completed task: {result}")
                
                except Exception as e:
                    self.total_errors += 1
                    self.is_healthy = self.total_errors / max(1, self.total_processed) < 0.5
                    print(f"Worker {self.worker_id} error: {e}")
            
                finally:
                    self.current_load -= 1
                    self.task_queue.task_done()
                
            except queue.Empty:
                continue
  
    def add_task(self, task):
        """Add a task to this worker's queue"""
        self.task_queue.put(task)
  
    def get_load(self):
        """Get current load metrics"""
        return {
            'current_load': self.current_load,
            'queue_size': self.task_queue.qsize(),
            'total_processed': self.total_processed,
            'error_rate': self.total_errors / max(1, self.total_processed),
            'is_healthy': self.is_healthy
        }
  
    def shutdown(self):
        """Shutdown the worker"""
        self.shutdown_flag.set()
        if self.thread:
            self.thread.join()

class RoundRobinLoadBalancer:
    def __init__(self, workers: List[Worker]):
        self.workers = workers
        self.current_worker_index = 0
        self.lock = threading.Lock()
    
        # Start all workers
        for worker in self.workers:
            worker.start()
  
    def distribute_task(self, task):
        """Distribute task using round-robin algorithm"""
        with self.lock:
            # Find next healthy worker
            attempts = 0
            while attempts < len(self.workers):
                worker = self.workers[self.current_worker_index]
                self.current_worker_index = (self.current_worker_index + 1) % len(self.workers)
            
                if worker.is_healthy:
                    worker.add_task(task)
                    print(f"Task assigned to worker {worker.worker_id}")
                    return
            
                attempts += 1
        
            # No healthy workers found
            raise Exception("No healthy workers available")
  
    def get_cluster_stats(self):
        """Get statistics for all workers"""
        stats = {}
        for worker in self.workers:
            stats[worker.worker_id] = worker.get_load()
        return stats

# Example worker functions
def fast_worker_func(task):
    """Simulate fast worker"""
    time.sleep(random.uniform(0.1, 0.3))
    return f"Fast processing: {task}"

def slow_worker_func(task):
    """Simulate slow worker"""
    time.sleep(random.uniform(0.5, 1.0))
    return f"Slow processing: {task}"

def unreliable_worker_func(task):
    """Simulate unreliable worker"""
    if random.random() < 0.3:  # 30% failure rate
        raise Exception("Worker failure")
    time.sleep(random.uniform(0.2, 0.5))
    return f"Unreliable processing: {task}"

# Test round-robin load balancing
workers = [
    Worker("fast_worker_1", fast_worker_func),
    Worker("fast_worker_2", fast_worker_func),
    Worker("slow_worker", slow_worker_func),
    Worker("unreliable_worker", unreliable_worker_func)
]

load_balancer = RoundRobinLoadBalancer(workers)

# Distribute tasks
for i in range(12):
    try:
        load_balancer.distribute_task(f"task_{i}")
        time.sleep(0.1)  # Small delay between task submissions
    except Exception as e:
        print(f"Failed to distribute task {i}: {e}")

# Monitor for a while
time.sleep(3)

# Print final statistics
print("\nFinal Cluster Statistics:")
stats = load_balancer.get_cluster_stats()
for worker_id, worker_stats in stats.items():
    print(f"{worker_id}: {worker_stats}")

# Shutdown
for worker in workers:
    worker.shutdown()
```

### Adaptive Load Balancing with Health Monitoring

```python
import threading
import time
import random
from typing import List, Dict, Any
import heapq
from dataclasses import dataclass
import statistics

@dataclass
class WorkerMetrics:
    response_times: List[float]
    error_count: int
    success_count: int
    current_load: int
    last_health_check: float
  
    def get_avg_response_time(self):
        if not self.response_times:
            return 0
        return statistics.mean(self.response_times[-10:])  # Last 10 responses
  
    def get_error_rate(self):
        total = self.error_count + self.success_count
        return self.error_count / max(1, total)
  
    def get_health_score(self):
        """Calculate health score (0-1, higher is better)"""
        error_penalty = 1 - min(0.8, self.get_error_rate() * 2)
        load_penalty = 1 - min(0.5, self.current_load / 10)
        response_penalty = 1 - min(0.5, self.get_avg_response_time() / 2)
    
        return (error_penalty + load_penalty + response_penalty) / 3

class AdaptiveWorker(Worker):
    def __init__(self, worker_id: str, processing_func: Callable, max_capacity: int = 5):
        super().__init__(worker_id, processing_func)
        self.max_capacity = max_capacity
        self.metrics = WorkerMetrics(
            response_times=[],
            error_count=0,
            success_count=0,
            current_load=0,
            last_health_check=time.time()
        )
  
    def _worker_loop(self):
        """Enhanced worker loop with metrics collection"""
        while not self.shutdown_flag.is_set():
            try:
                task = self.task_queue.get(timeout=1)
                self.current_load += 1
                self.metrics.current_load = self.current_load
            
                start_time = time.time()
            
                try:
                    # Process the task
                    result = self.processing_func(task)
                    response_time = time.time() - start_time
                
                    # Update metrics
                    self.metrics.response_times.append(response_time)
                    self.metrics.success_count += 1
                
                    # Keep only recent response times
                    if len(self.metrics.response_times) > 20:
                        self.metrics.response_times = self.metrics.response_times[-20:]
                
                    print(f"Worker {self.worker_id} completed task in {response_time:.2f}s")
                
                except Exception as e:
                    self.metrics.error_count += 1
                    print(f"Worker {self.worker_id} error: {e}")
            
                finally:
                    self.current_load -= 1
                    self.metrics.current_load = self.current_load
                    self.task_queue.task_done()
                
            except queue.Empty:
                continue
  
    def can_accept_task(self):
        """Check if worker can accept more tasks"""
        return (self.current_load < self.max_capacity and 
                self.metrics.get_health_score() > 0.3 and
                self.is_healthy)
  
    def get_load_score(self):
        """Get a score for load balancing decisions (lower is better)"""
        health_score = self.metrics.get_health_score()
        load_ratio = self.current_load / self.max_capacity
        avg_response_time = self.metrics.get_avg_response_time()
    
        # Lower score is better for selection
        return (1 - health_score) + load_ratio + avg_response_time

class AdaptiveLoadBalancer:
    def __init__(self, workers: List[AdaptiveWorker]):
        self.workers = workers
        self.lock = threading.Lock()
        self.health_monitor_thread = None
        self.health_check_interval = 5.0
        self.shutdown_flag = threading.Event()
    
        # Start all workers
        for worker in self.workers:
            worker.start()
    
        # Start health monitoring
        self.start_health_monitoring()
  
    def start_health_monitoring(self):
        """Start background health monitoring"""
        def health_monitor():
            while not self.shutdown_flag.is_set():
                self.update_worker_health()
                time.sleep(self.health_check_interval)
    
        self.health_monitor_thread = threading.Thread(target=health_monitor)
        self.health_monitor_thread.daemon = True
        self.health_monitor_thread.start()
  
    def update_worker_health(self):
        """Update health status of all workers"""
        print("\n--- Health Check ---")
        for worker in self.workers:
            health_score = worker.metrics.get_health_score()
            worker.is_healthy = health_score > 0.3
        
            print(f"Worker {worker.worker_id}: "
                  f"Health={health_score:.2f}, "
                  f"Load={worker.current_load}/{worker.max_capacity}, "
                  f"Errors={worker.metrics.get_error_rate():.2f}")
  
    def distribute_task(self, task):
        """Distribute task using adaptive algorithm"""
        with self.lock:
            # Get available workers with their load scores
            available_workers = [
                (worker.get_load_score(), worker)
                for worker in self.workers
                if worker.can_accept_task()
            ]
        
            if not available_workers:
                raise Exception("No available workers")
        
            # Sort by load score (ascending - lower is better)
            available_workers.sort(key=lambda x: x[0])
        
            # Select best worker
            best_worker = available_workers[0][1]
            best_worker.add_task(task)
        
            print(f"Task assigned to {best_worker.worker_id} "
                  f"(score: {available_workers[0][0]:.2f})")
  
    def get_detailed_stats(self):
        """Get detailed statistics for all workers"""
        stats = {}
        for worker in self.workers:
            stats[worker.worker_id] = {
                'health_score': worker.metrics.get_health_score(),
                'avg_response_time': worker.metrics.get_avg_response_time(),
                'error_rate': worker.metrics.get_error_rate(),
                'current_load': worker.current_load,
                'max_capacity': worker.max_capacity,
                'total_processed': worker.metrics.success_count,
                'is_healthy': worker.is_healthy
            }
        return stats
  
    def shutdown(self):
        """Shutdown the load balancer and all workers"""
        self.shutdown_flag.set()
    
        if self.health_monitor_thread:
            self.health_monitor_thread.join()
    
        for worker in self.workers:
            worker.shutdown()

# Test adaptive load balancing
def variable_performance_worker(task, base_delay=0.3, variance=0.2, failure_rate=0.1):
    """Worker with variable performance characteristics"""
    if random.random() < failure_rate:
        raise Exception("Random failure")
  
    delay = max(0.1, random.gauss(base_delay, variance))
    time.sleep(delay)
    return f"Processed {task} in {delay:.2f}s"

# Create workers with different characteristics
adaptive_workers = [
    AdaptiveWorker("fast_worker", 
                   lambda task: variable_performance_worker(task, 0.2, 0.1, 0.05),
                   max_capacity=8),
    AdaptiveWorker("medium_worker", 
                   lambda task: variable_performance_worker(task, 0.5, 0.2, 0.10),
                   max_capacity=5),
    AdaptiveWorker("slow_worker", 
                   lambda task: variable_performance_worker(task, 1.0, 0.3, 0.15),
                   max_capacity=3),
    AdaptiveWorker("unreliable_worker", 
                   lambda task: variable_performance_worker(task, 0.3, 0.1, 0.30),
                   max_capacity=4)
]

adaptive_balancer = AdaptiveLoadBalancer(adaptive_workers)

# Distribute many tasks to see adaptation in action
print("Distributing tasks...")
for i in range(30):
    try:
        adaptive_balancer.distribute_task(f"adaptive_task_{i}")
        time.sleep(0.2)  # Small delay between submissions
    except Exception as e:
        print(f"Failed to distribute task {i}: {e}")

# Let the system run and adapt
time.sleep(10)

# Print final detailed statistics
print("\n=== Final Adaptive Load Balancer Statistics ===")
final_stats = adaptive_balancer.get_detailed_stats()
for worker_id, stats in final_stats.items():
    print(f"\n{worker_id}:")
    for metric, value in stats.items():
        print(f"  {metric}: {value}")

adaptive_balancer.shutdown()
```

## Putting It All Together: Distributed Computing Framework

> **Integration Principle** : Real-world distributed systems combine map-reduce for data processing, task queues for work coordination, and load balancing for resource optimization.

```python
import asyncio
import multiprocessing as mp
import threading
import time
import json
from typing import Any, Callable, Dict, List
from dataclasses import dataclass, asdict
from enum import Enum
import queue

class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"

@dataclass
class DistributedTask:
    task_id: str
    task_type: str  # 'map', 'reduce', or 'single'
    function_name: str
    data: Any
    priority: int = 5
    max_retries: int = 3
    current_attempts: int = 0
    status: TaskStatus = TaskStatus.PENDING
    created_at: float = None
    started_at: float = None
    completed_at: float = None
    result: Any = None
    error: str = None
  
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = time.time()

class DistributedComputingFramework:
    """
    Unified framework combining map-reduce, task queuing, and load balancing
    """
  
    def __init__(self, num_workers=None):
        self.num_workers = num_workers or mp.cpu_count()
        self.task_queue = queue.PriorityQueue()
        self.result_store = {}
        self.function_registry = {}
        self.workers = []
        self.shutdown_flag = threading.Event()
        self.stats = {
            'tasks_submitted': 0,
            'tasks_completed': 0,
            'tasks_failed': 0,
            'active_workers': 0
        }
        self.stats_lock = threading.Lock()
  
    def register_function(self, name: str, func: Callable):
        """Register a function that can be called by workers"""
        self.function_registry[name] = func
  
    def start(self):
        """Start the distributed computing framework"""
        print(f"Starting {self.num_workers} workers...")
    
        for worker_id in range(self.num_workers):
            worker_thread = threading.Thread(
                target=self._worker_loop, 
                args=(worker_id,)
            )
            worker_thread.daemon = True
            worker_thread.start()
            self.workers.append(worker_thread)
    
        with self.stats_lock:
            self.stats['active_workers'] = len(self.workers)
  
    def _worker_loop(self, worker_id):
        """Main worker processing loop"""
        print(f"Worker {worker_id} started")
    
        while not self.shutdown_flag.is_set():
            try:
                # Get task with priority (lower number = higher priority)
                priority, task = self.task_queue.get(timeout=1)
            
                print(f"Worker {worker_id} processing {task.task_id}")
            
                # Update task status
                task.status = TaskStatus.RUNNING
                task.started_at = time.time()
                task.current_attempts += 1
            
                try:
                    # Get the function to execute
                    if task.function_name not in self.function_registry:
                        raise Exception(f"Function {task.function_name} not registered")
                
                    func = self.function_registry[task.function_name]
                
                    # Execute the task
                    result = func(task.data)
                
                    # Task completed successfully
                    task.status = TaskStatus.COMPLETED
                    task.completed_at = time.time()
                    task.result = result
                
                    # Store result
                    self.result_store[task.task_id] = task
                
                    with self.stats_lock:
                        self.stats['tasks_completed'] += 1
                
                    print(f"Worker {worker_id} completed {task.task_id}")
            
                except Exception as e:
                    error_msg = str(e)
                    print(f"Worker {worker_id} error in {task.task_id}: {error_msg}")
                
                    if task.current_attempts < task.max_retries:
                        # Retry the task
                        task.status = TaskStatus.RETRYING
                        retry_delay = 2 ** task.current_attempts
                    
                        print(f"Retrying {task.task_id} in {retry_delay}s")
                    
                        # Re-queue with lower priority and delay
                        threading.Timer(
                            retry_delay,
                            lambda: self.task_queue.put((priority + 10, task))
                        ).start()
                    else:
                        # Max retries exceeded
                        task.status = TaskStatus.FAILED
                        task.completed_at = time.time()
                        task.error = error_msg
                    
                        self.result_store[task.task_id] = task
                    
                        with self.stats_lock:
                            self.stats['tasks_failed'] += 1
            
                self.task_queue.task_done()
            
            except queue.Empty:
                continue
  
    def submit_task(self, task_id: str, function_name: str, data: Any, 
                   task_type: str = 'single', priority: int = 5, 
                   max_retries: int = 3) -> str:
        """Submit a single task"""
        task = DistributedTask(
            task_id=task_id,
            task_type=task_type,
            function_name=function_name,
            data=data,
            priority=priority,
            max_retries=max_retries
        )
    
        self.task_queue.put((priority, task))
    
        with self.stats_lock:
            self.stats['tasks_submitted'] += 1
    
        return task_id
  
    def map_reduce(self, data_chunks: List[Any], map_function: str, 
                  reduce_function: str, job_id: str = None) -> str:
        """Execute a distributed map-reduce job"""
        if job_id is None:
            job_id = f"mapreduce_{int(time.time() * 1000)}"
    
        print(f"Starting map-reduce job {job_id} with {len(data_chunks)} chunks")
    
        # Submit map tasks
        map_task_ids = []
        for i, chunk in enumerate(data_chunks):
            map_task_id = f"{job_id}_map_{i}"
            self.submit_task(
                task_id=map_task_id,
                function_name=map_function,
                data=chunk,
                task_type='map',
                priority=1  # High priority for map tasks
            )
            map_task_ids.append(map_task_id)
    
        # Submit reduce task (will need to wait for map tasks)
        reduce_task_id = f"{job_id}_reduce"
        reduce_task = DistributedTask(
            task_id=reduce_task_id,
            task_type='reduce',
            function_name=reduce_function,
            data={'map_task_ids': map_task_ids, 'job_id': job_id},
            priority=3  # Lower priority, will wait for maps
        )
    
        # Custom reduce logic to wait for map tasks
        def wait_and_reduce():
            # Wait for all map tasks to complete
            while True:
                map_results = []
                all_complete = True
            
                for map_task_id in map_task_ids:
                    if map_task_id in self.result_store:
                        map_task = self.result_store[map_task_id]
                        if map_task.status == TaskStatus.COMPLETED:
                            map_results.append(map_task.result)
                        elif map_task.status == TaskStatus.FAILED:
                            raise Exception(f"Map task {map_task_id} failed: {map_task.error}")
                    else:
                        all_complete = False
                        break
            
                if all_complete:
                    break
            
                time.sleep(0.5)  # Check every 500ms
        
            # Execute reduce function
            reduce_func = self.function_registry[reduce_function]
            return reduce_func(map_results)
    
        # Register the custom reduce logic
        self.function_registry[f"{reduce_task_id}_logic"] = wait_and_reduce
        reduce_task.function_name = f"{reduce_task_id}_logic"
    
        self.task_queue.put((3, reduce_task))
    
        with self.stats_lock:
            self.stats['tasks_submitted'] += 1
    
        return reduce_task_id
  
    def get_result(self, task_id: str, timeout: float = None) -> DistributedTask:
        """Get result of a task, optionally with timeout"""
        start_time = time.time()
    
        while True:
            if task_id in self.result_store:
                return self.result_store[task_id]
        
            if timeout and (time.time() - start_time) > timeout:
                raise TimeoutError(f"Task {task_id} did not complete within {timeout}s")
        
            time.sleep(0.1)
  
    def get_stats(self) -> Dict:
        """Get framework statistics"""
        with self.stats_lock:
            stats = self.stats.copy()
    
        stats['pending_tasks'] = self.task_queue.qsize()
        stats['completed_tasks'] = len([
            task for task in self.result_store.values()
            if task.status == TaskStatus.COMPLETED
        ])
    
        return stats
  
    def shutdown(self, wait_for_completion: bool = True):
        """Shutdown the framework"""
        if wait_for_completion:
            print("Waiting for all tasks to complete...")
            self.task_queue.join()
    
        print("Shutting down workers...")
        self.shutdown_flag.set()
    
        for worker in self.workers:
            worker.join()
    
        print("Framework shutdown complete")

# Example usage of the complete framework
def chunk_processor(chunk):
    """Map function: process a chunk of data"""
    total = 0
    for item in chunk:
        # Simulate complex processing
        total += item ** 2
        time.sleep(0.01)  # Simulate work
    return total

def sum_reducer(results):
    """Reduce function: sum all results"""
    return sum(results)

def single_task_processor(data):
    """Process a single task"""
    result = data['value'] * 2
    time.sleep(data.get('delay', 0.1))
    return result

# Test the complete framework
if __name__ == "__main__":
    framework = DistributedComputingFramework(num_workers=4)
  
    # Register functions
    framework.register_function('chunk_processor', chunk_processor)
    framework.register_function('sum_reducer', sum_reducer)
    framework.register_function('single_task', single_task_processor)
  
    # Start the framework
    framework.start()
  
    # Test 1: Map-Reduce job
    print("=== Testing Map-Reduce ===")
    large_dataset = list(range(100))
    chunks = [large_dataset[i:i+10] for i in range(0, len(large_dataset), 10)]
  
    mapreduce_job_id = framework.map_reduce(
        data_chunks=chunks,
        map_function='chunk_processor',
        reduce_function='sum_reducer',
        job_id='sum_of_squares'
    )
  
    # Test 2: Individual tasks
    print("=== Testing Individual Tasks ===")
    individual_tasks = []
    for i in range(5):
        task_id = framework.submit_task(
            task_id=f"individual_{i}",
            function_name='single_task',
            data={'value': i, 'delay': 0.2},
            priority=2
        )
        individual_tasks.append(task_id)
  
    # Get results
    print("=== Getting Results ===")
  
    # Get map-reduce result
    mapreduce_result = framework.get_result(mapreduce_job_id, timeout=30)
    print(f"Map-Reduce result: {mapreduce_result.result}")
  
    # Get individual task results
    for task_id in individual_tasks:
        result = framework.get_result(task_id, timeout=10)
        print(f"Task {task_id}: {result.result}")
  
    # Print final statistics
    print("\n=== Final Statistics ===")
    final_stats = framework.get_stats()
    for key, value in final_stats.items():
        print(f"{key}: {value}")
  
    framework.shutdown()
```

## Key Takeaways and Best Practices

> **Core Principles for Distributed Work Patterns** :
>
> 1. **Design for Failure** : Always assume tasks can fail and build retry mechanisms
> 2. **Monitor and Adapt** : Continuously monitor performance and adjust load distribution
> 3. **Scale Incrementally** : Start simple, add complexity only when needed
> 4. **Optimize for Bottlenecks** : Identify and eliminate the slowest parts of your pipeline
> 5. **Stateless When Possible** : Make tasks independent to enable easy scaling

 **When to Use Each Pattern** :

* **Map-Reduce** : Large datasets that can be processed in parallel chunks
* **Task Queues** : Asynchronous work that needs to be distributed across workers
* **Load Balancing** : Multiple workers where some may be faster/slower than others
* **Combined Approach** : Complex applications requiring all three patterns

The beauty of these patterns is that they scale from single-machine multiprocessing to distributed systems across thousands of machines, following the same fundamental principles you've learned here.
