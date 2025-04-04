# Synchronization Primitives in Asyncio: From First Principles

## Understanding Concurrency and Synchronization

To understand synchronization primitives in asyncio from first principles, we must start with a fundamental question: why do we need synchronization at all?

In any concurrent system - whether it uses threads, processes, or asyncio's cooperative multitasking - multiple execution flows can attempt to access shared resources simultaneously. Without coordination, this leads to race conditions, data corruption, and unpredictable behavior.

Synchronization primitives are tools that allow different parts of a concurrent program to coordinate their actions. They help answer questions like:

* When can a task safely access a shared resource?
* How can a task wait for a specific condition before proceeding?
* How can one task signal to others that something important has happened?

In asyncio, these primitives are designed for a cooperative multitasking environment, where tasks voluntarily yield control rather than being preemptively interrupted. This fundamentally changes how synchronization works compared to threaded programming.

## The Nature of Asyncio Concurrency

Before diving into the primitives themselves, we need to understand the unique characteristics of asyncio's concurrency model:

1. **Cooperative Multitasking** : Tasks run until they explicitly yield control using `await`
2. **Single-Threaded Execution** : Despite concurrent appearance, only one task runs at a time
3. **Non-Blocking Design** : Tasks should never block the event loop
4. **Task Switching at Await Points** : Tasks can only be switched at points where `await` is used

These characteristics profoundly influence how synchronization primitives work in asyncio:

* They only need to consider task switches at `await` points
* They don't need to worry about preemption in the middle of operations
* They should never use blocking operations that would freeze the entire event loop

## Asyncio Lock: Mutual Exclusion

The Lock is the most fundamental synchronization primitive, implementing mutual exclusion - ensuring that only one task can access a resource at a time.

### The Core Concept

At its core, an asyncio Lock maintains a binary state: locked or unlocked. When a task acquires a lock that's already locked, it pauses (is suspended) until the lock becomes available.

Let's start with a basic example:

```python
import asyncio

async def protected_resource(lock, task_name):
    print(f"{task_name} wants to access the resource")
  
    async with lock:
        print(f"{task_name} has acquired the lock")
        await asyncio.sleep(1)  # Simulate work with the resource
        print(f"{task_name} is releasing the lock")
  
    print(f"{task_name} released the lock")

async def main():
    # Create a shared lock
    lock = asyncio.Lock()
  
    # Create three tasks that will compete for the lock
    tasks = [
        asyncio.create_task(protected_resource(lock, f"Task {i}"))
        for i in range(3)
    ]
  
    # Wait for all tasks to complete
    await asyncio.gather(*tasks)

asyncio.run(main())
```

This example demonstrates the basic usage of a Lock to protect a shared resource. Each task must acquire the lock before accessing the resource and release it afterward.

### How Asyncio Lock Works Internally

To understand Locks from first principles, let's explore how they might be implemented internally:

```python
class SimpleLock:
    def __init__(self):
        self._locked = False
        self._waiters = []  # Tasks waiting for the lock
  
    async def acquire(self):
        # Fast path: if not locked, acquire immediately
        if not self._locked:
            self._locked = True
            return True
      
        # Slow path: create a Future and add it to waiters
        waiter = asyncio.Future()
        self._waiters.append(waiter)
      
        # Wait until the Future is resolved (when lock is released)
        await waiter
        self._locked = True
        return True
  
    def release(self):
        if not self._locked:
            raise RuntimeError("Lock is not acquired")
      
        self._locked = False
      
        # If there are waiters, wake up the first one
        if self._waiters:
            waiter = self._waiters.pop(0)
            waiter.set_result(True)
```

This simplified implementation shows the essential mechanism:

1. When a lock is acquired, it changes its state to locked
2. If already locked, the requesting task creates a Future and awaits it
3. When the lock is released, it wakes up the next waiting task

The real asyncio implementation is more complex but follows the same principles.

### Lock Context Manager

Asyncio Lock implements the asynchronous context manager protocol (`__aenter__` and `__aexit__`), allowing the convenient `async with` syntax:

```python
async def safe_update(shared_dict, lock, key, value):
    async with lock:
        shared_dict[key] = value
        await asyncio.sleep(0.1)  # Some async operation
```

This is equivalent to:

```python
async def safe_update(shared_dict, lock, key, value):
    await lock.acquire()
    try:
        shared_dict[key] = value
        await asyncio.sleep(0.1)  # Some async operation
    finally:
        lock.release()
```

The context manager ensures the lock is always released, even if an exception occurs.

### Real-World Example: Connection Pool

Let's see how Locks can be used in a more realistic scenario - managing a database connection pool:

```python
import asyncio
import asyncpg

class DatabasePool:
    def __init__(self, max_connections=5, **connect_kwargs):
        self.max_connections = max_connections
        self.connect_kwargs = connect_kwargs
        self.connections = []
        self.available = []
        self.lock = asyncio.Lock()
  
    async def initialize(self):
        async with self.lock:
            for _ in range(self.max_connections):
                conn = await asyncpg.connect(**self.connect_kwargs)
                self.connections.append(conn)
                self.available.append(conn)
  
    async def acquire(self):
        async with self.lock:
            while not self.available:
                # No connections available, wait for one to be released
                release_event = asyncio.Event()
                self._waiting.append(release_event)
              
                # Release the lock while waiting
                self.lock.release()
                try:
                    await release_event.wait()
                finally:
                    # Reacquire the lock
                    await self.lock.acquire()
          
            # Get a connection from the available pool
            conn = self.available.pop()
            return conn
  
    async def release(self, conn):
        async with self.lock:
            self.available.append(conn)
          
            # If anyone is waiting, notify them
            if self._waiting:
                waiter = self._waiting.pop(0)
                waiter.set()
```

This example shows how a Lock can protect access to a shared resource pool, ensuring that connections are safely allocated and returned.

## Asyncio Event: Signaling Between Tasks

While a Lock controls access to a resource, an Event is used for signaling between tasks. It allows one task to notify others that a condition has occurred.

### The Core Concept

An Event maintains a binary state: set or unset. Tasks can wait for the event to be set and can be notified when it happens.

Here's a basic example:

```python
import asyncio

async def waiter(event, name):
    print(f"{name} is waiting for the event")
    await event.wait()
    print(f"{name} was notified, event is set!")

async def setter(event):
    print("Setter: Sleeping for 2 seconds before setting the event")
    await asyncio.sleep(2)
    print("Setter: Setting the event now")
    event.set()

async def main():
    # Create a shared event
    event = asyncio.Event()
  
    # Create tasks
    waiters = [
        asyncio.create_task(waiter(event, f"Waiter {i}"))
        for i in range(3)
    ]
  
    setter_task = asyncio.create_task(setter(event))
  
    # Wait for all tasks to complete
    await asyncio.gather(setter_task, *waiters)

asyncio.run(main())
```

In this example, multiple "waiter" tasks wait for the event to be set, while a "setter" task sets the event after a delay.

### How Asyncio Event Works Internally

To understand Events from first principles, let's explore a simplified implementation:

```python
class SimpleEvent:
    def __init__(self):
        self._value = False
        self._waiters = []
  
    def is_set(self):
        return self._value
  
    def set(self):
        if self._value:
            return
      
        self._value = True
      
        # Notify all waiters
        for waiter in self._waiters:
            if not waiter.done():
                waiter.set_result(True)
      
        # Clear the waiters list
        self._waiters.clear()
  
    def clear(self):
        self._value = False
  
    async def wait(self):
        if self._value:
            # Event is already set
            return True
      
        # Create a Future and add it to the waiters
        waiter = asyncio.Future()
        self._waiters.append(waiter)
      
        # Wait for the Future to be resolved
        await waiter
        return True
```

This simplified implementation shows the key mechanism:

1. The Event maintains a boolean state (_value)
2. When a task calls wait() and the event isn't set, it creates a Future and awaits it
3. When the event is set, all waiting Futures are resolved, triggering waiting tasks to continue

### Real-World Example: Worker Pool with Event-Based Shutdown

Here's a more realistic example of using Events for coordinated shutdown:

```python
import asyncio
import signal

class WorkerPool:
    def __init__(self, num_workers=5):
        self.num_workers = num_workers
        self.queue = asyncio.Queue()
        self.shutdown_event = asyncio.Event()
        self.workers = []
  
    async def worker(self, worker_id):
        print(f"Worker {worker_id} started")
      
        while not self.shutdown_event.is_set():
            try:
                # Try to get a task with a timeout
                task = await asyncio.wait_for(
                    self.queue.get(), 
                    timeout=0.5
                )
              
                # Process the task if the shutdown hasn't been signaled
                if not self.shutdown_event.is_set():
                    print(f"Worker {worker_id} processing task: {task}")
                    await asyncio.sleep(0.5)  # Simulate work
                    self.queue.task_done()
                else:
                    # Put the task back if shutting down
                    await self.queue.put(task)
                    break
                  
            except asyncio.TimeoutError:
                # No task available, check if we should shut down
                if self.shutdown_event.is_set():
                    break
      
        print(f"Worker {worker_id} shutting down")
  
    async def start(self):
        self.workers = [
            asyncio.create_task(self.worker(i))
            for i in range(self.num_workers)
        ]
  
    async def add_task(self, task):
        await self.queue.put(task)
  
    async def shutdown(self):
        print("Shutting down worker pool")
      
        # Signal all workers to shut down
        self.shutdown_event.set()
      
        # Wait for all workers to finish
        if self.workers:
            await asyncio.gather(*self.workers)
            self.workers = []
      
        print("Worker pool shut down complete")

async def main():
    # Create worker pool
    pool = WorkerPool(3)
    await pool.start()
  
    # Add some tasks
    for i in range(10):
        await pool.add_task(f"Task {i}")
  
    # Run for a bit
    await asyncio.sleep(2)
  
    # Shut down cleanly
    await pool.shutdown()

# Run with signal handling
loop = asyncio.get_event_loop()
pool = None

async def shutdown(signal, loop):
    print(f"Received signal {signal.name}...")
    if pool:
        await pool.shutdown()
    loop.stop()

async def run_main():
    global pool
    pool = WorkerPool(3)
    await pool.start()
  
    # Add some tasks
    for i in range(10):
        await pool.add_task(f"Task {i}")
  
    # Run for a bit
    await asyncio.sleep(5)
  
    # Shut down cleanly
    await pool.shutdown()

# Set up signal handlers
if __name__ == "__main__":
    loop = asyncio.get_event_loop()
  
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(
            sig, 
            lambda s=sig: asyncio.create_task(shutdown(s, loop))
        )
  
    try:
        loop.run_until_complete(run_main())
    finally:
        loop.close()
```

This example demonstrates using an Event for coordinated shutdown of a worker pool. When the shutdown event is set, all workers gracefully finish their current task and then exit.

## Asyncio Condition: Complex Synchronization

A Condition combines the functionality of a Lock and an Event, allowing tasks to wait for a condition to be true and to be notified when it becomes true.

### The Core Concept

A Condition provides:

1. Mutual exclusion via an internal lock
2. The ability for tasks to wait for a condition to be true
3. The ability for tasks to notify others when a condition becomes true

Here's a basic example:

```python
import asyncio

async def consumer(condition, buffer, name):
    while True:
        async with condition:
            # Wait until the buffer has items
            while len(buffer) == 0:
                print(f"{name} is waiting for items")
                await condition.wait()
          
            # Consume an item
            item = buffer.pop(0)
            print(f"{name} consumed {item}")
          
            # Notify producers that there's space
            condition.notify()
      
        # Simulate processing time
        await asyncio.sleep(1)

async def producer(condition, buffer, name, max_size):
    counter = 0
    while True:
        async with condition:
            # Wait until there's space in the buffer
            while len(buffer) >= max_size:
                print(f"{name} is waiting for space")
                await condition.wait()
          
            # Produce an item
            item = f"Item {counter}"
            buffer.append(item)
            counter += 1
            print(f"{name} produced {item}")
          
            # Notify consumers that there's an item
            condition.notify()
      
        # Simulate production time
        await asyncio.sleep(0.5)

async def main():
    # Shared condition and buffer
    condition = asyncio.Condition()
    buffer = []
    max_size = 2
  
    # Create tasks
    consumers = [
        asyncio.create_task(consumer(condition, buffer, f"Consumer {i}"))
        for i in range(2)
    ]
  
    producers = [
        asyncio.create_task(producer(condition, buffer, f"Producer {i}", max_size))
        for i in range(3)
    ]
  
    # Let them run for a while
    await asyncio.sleep(10)
  
    # Cancel all tasks
    for task in [*consumers, *producers]:
        task.cancel()
  
    # Wait for tasks to complete with exception handling
    try:
        await asyncio.gather(*consumers, *producers, return_exceptions=True)
    except asyncio.CancelledError:
        pass

asyncio.run(main())
```

This example demonstrates a classic producer-consumer pattern using a Condition.

### How Asyncio Condition Works Internally

To understand Conditions from first principles, let's explore a simplified implementation:

```python
class SimpleCondition:
    def __init__(self, lock=None):
        self._lock = lock or asyncio.Lock()
        self._waiters = []
  
    async def __aenter__(self):
        await self._lock.acquire()
        return self
  
    async def __aexit__(self, exc_type, exc, tb):
        self._lock.release()
  
    async def wait(self):
        if not self._lock._locked:
            raise RuntimeError("Cannot wait on an unlocked condition")
      
        # Create a future for this waiter
        waiter = asyncio.Future()
        self._waiters.append(waiter)
      
        # Release the lock while waiting
        self._lock.release()
        try:
            # Wait for notification
            await waiter
        finally:
            # Reacquire the lock
            await self._lock.acquire()
  
    def notify(self, n=1):
        if not self._lock._locked:
            raise RuntimeError("Cannot notify on an unlocked condition")
      
        idx = 0
        for _ in range(min(n, len(self._waiters))):
            waiter = self._waiters.pop(0)
            if not waiter.done():
                waiter.set_result(None)
                idx += 1
  
    def notify_all(self):
        self.notify(len(self._waiters))
```

This simplified implementation shows the key mechanisms:

1. The Condition wraps a Lock for mutual exclusion
2. The `wait()` method releases the lock and waits for notification
3. When notified, it reacquires the lock before returning
4. The `notify()` and `notify_all()` methods wake up waiting tasks

### Real-World Example: Resource Pool with Maximum Usage

Here's a more realistic example using a Condition to manage a limited pool of resources:

```python
import asyncio
import random

class ResourcePool:
    def __init__(self, resources, max_concurrent=3):
        self.resources = list(resources)
        self.in_use = set()
        self.condition = asyncio.Condition()
        self.max_concurrent = max_concurrent
  
    async def acquire(self):
        async with self.condition:
            # Wait until a resource is available and we're under the concurrent limit
            while (not self.resources or len(self.in_use) >= self.max_concurrent):
                print(f"Waiting for resource (available: {len(self.resources)}, in use: {len(self.in_use)})")
                await self.condition.wait()
          
            # Get a resource
            resource = self.resources.pop()
            self.in_use.add(resource)
            print(f"Acquired resource {resource} (available: {len(self.resources)}, in use: {len(self.in_use)})")
            return resource
  
    async def release(self, resource):
        async with self.condition:
            # Return the resource to the pool
            self.resources.append(resource)
            self.in_use.remove(resource)
            print(f"Released resource {resource} (available: {len(self.resources)}, in use: {len(self.in_use)})")
          
            # Notify waiters
            self.condition.notify()

async def worker(pool, worker_id):
    try:
        while True:
            # Acquire a resource
            resource = await pool.acquire()
          
            try:
                # Use the resource
                print(f"Worker {worker_id} using resource {resource}")
                await asyncio.sleep(random.uniform(0.5, 2.0))
            finally:
                # Always release the resource
                await pool.release(resource)
          
            # Pause before acquiring again
            await asyncio.sleep(random.uniform(0.1, 0.5))
  
    except asyncio.CancelledError:
        print(f"Worker {worker_id} was cancelled")
        raise

async def main():
    # Create a resource pool with 5 resources
    pool = ResourcePool(range(5))
  
    # Create 8 workers (more than resources)
    workers = [
        asyncio.create_task(worker(pool, i))
        for i in range(8)
    ]
  
    # Let them run for a while
    await asyncio.sleep(15)
  
    # Cancel all workers
    for w in workers:
        w.cancel()
  
    # Wait for workers to finish
    await asyncio.gather(*workers, return_exceptions=True)

asyncio.run(main())
```

This example demonstrates using a Condition to manage a pool of resources with a maximum concurrency limit, showing how tasks can wait for resources to become available and notify others when they're done.

## Asyncio Semaphore: Controlling Concurrency

A Semaphore is a synchronization primitive that maintains a counter and allows a specified number of tasks to access a resource concurrently.

### The Core Concept

A Semaphore:

1. Maintains a counter initialized to a specified value
2. Each acquire() decrements the counter
3. Each release() increments the counter
4. If the counter would go below zero on acquire(), the task waits

Here's a basic example:

```python
import asyncio

async def worker(semaphore, worker_id):
    async with semaphore:
        print(f"Worker {worker_id} acquired the semaphore")
        await asyncio.sleep(1)  # Simulate work
        print(f"Worker {worker_id} releasing the semaphore")

async def main():
    # Allow only 3 concurrent workers
    semaphore = asyncio.Semaphore(3)
  
    # Create 10 workers
    workers = [
        asyncio.create_task(worker(semaphore, i))
        for i in range(10)
    ]
  
    # Wait for all workers to complete
    await asyncio.gather(*workers)

asyncio.run(main())
```

This example demonstrates how a Semaphore can limit the number of tasks that can execute a particular section of code simultaneously.

### How Asyncio Semaphore Works Internally

To understand Semaphores from first principles, let's explore a simplified implementation:

```python
class SimpleSemaphore:
    def __init__(self, value=1):
        self._value = value
        self._waiters = []
  
    async def acquire(self):
        # Fast path: if there are available slots, acquire immediately
        if self._value > 0:
            self._value -= 1
            return True
      
        # Slow path: wait for a release
        waiter = asyncio.Future()
        self._waiters.append(waiter)
      
        # Wait until we get notified
        await waiter
        self._value -= 1
        return True
  
    def release(self):
        self._value += 1
      
        # If there are waiters, wake up one
        if self._waiters:
            waiter = self._waiters.pop(0)
            waiter.set_result(True)
  
    async def __aenter__(self):
        await self.acquire()
        return None
  
    async def __aexit__(self, exc_type, exc, tb):
        self.release()
```

This simplified implementation shows the key mechanism:

1. The Semaphore maintains a counter (_value)
2. `acquire()` decrements the counter or waits if it would go below zero
3. `release()` increments the counter and wakes up a waiting task
4. The context manager protocol simplifies usage with `async with`

### Real-World Example: Rate-Limited HTTP Client

Here's a more realistic example using a Semaphore to implement a rate-limited HTTP client:

```python
import asyncio
import aiohttp
import time

class RateLimitedClient:
    def __init__(self, max_concurrent=10, rate_limit=5, time_period=1.0):
        # Limit concurrent requests
        self.concurrency_semaphore = asyncio.Semaphore(max_concurrent)
      
        # Rate limit (requests per time period)
        self.rate_limit = rate_limit
        self.time_period = time_period
        self.request_times = []
        self.rate_lock = asyncio.Lock()
  
    async def _wait_for_rate_limit(self):
        async with self.rate_lock:
            now = time.time()
          
            # Remove request timestamps outside the time window
            self.request_times = [t for t in self.request_times if now - t <= self.time_period]
          
            # If we've hit the rate limit, wait until we can make another request
            if len(self.request_times) >= self.rate_limit:
                oldest = min(self.request_times)
                sleep_time = self.time_period - (now - oldest)
                if sleep_time > 0:
                    print(f"Rate limit reached, waiting {sleep_time:.2f}s")
                    await asyncio.sleep(sleep_time)
          
            # Record this request
            self.request_times.append(time.time())
  
    async def get(self, url, **kwargs):
        # Handle both rate limiting and concurrency limiting
        await self._wait_for_rate_limit()
      
        async with self.concurrency_semaphore:
            print(f"Requesting {url}")
            async with aiohttp.ClientSession() as session:
                async with session.get(url, **kwargs) as response:
                    return await response.text()

async def main():
    # Create a client with max 3 concurrent requests and 5 requests per second
    client = RateLimitedClient(max_concurrent=3, rate_limit=5, time_period=1.0)
  
    # URLs to fetch
    urls = [f"https://httpbin.org/delay/{i*0.2}" for i in range(1, 11)]
  
    # Fetch all URLs concurrently
    tasks = [
        asyncio.create_task(client.get(url))
        for url in urls
    ]
  
    # Wait for all tasks to complete
    results = await asyncio.gather(*tasks)
    print(f"Completed {len(results)} requests")

asyncio.run(main())
```

This example demonstrates using a Semaphore to limit concurrency while also implementing rate limiting with a separate mechanism.

## Asyncio BoundedSemaphore: Preventing Misuse

A BoundedSemaphore is a variant of Semaphore that raises an exception if the semaphore's value would exceed its initial value.

### The Core Concept

A BoundedSemaphore:

1. Works just like a regular Semaphore
2. Tracks the initial value
3. Raises ValueError if release() would cause the counter to exceed the initial value

Here's a basic example:

```python
import asyncio

async def main():
    # Create a bounded semaphore with initial value 2
    semaphore = asyncio.BoundedSemaphore(2)
  
    # Acquire twice (allowed)
    await semaphore.acquire()
    await semaphore.acquire()
  
    # Release twice (allowed)
    semaphore.release()
    semaphore.release()
  
    try:
        # Release again (this would exceed the initial value)
        semaphore.release()
        print("This should not be printed")
    except ValueError as e:
        print(f"Error: {e}")

asyncio.run(main())
```

This example demonstrates how BoundedSemaphore helps catch programming errors by preventing the semaphore from being released more times than it was acquired.

## Asyncio Barrier: Coordinated Start

While not part of the standard asyncio library, a Barrier is a synchronization primitive that allows multiple tasks to wait for each other to reach a certain point before continuing.

### Custom Barrier Implementation

Here's how we can implement a Barrier in asyncio:

```python
import asyncio

class Barrier:
    def __init__(self, parties):
        self.parties = parties
        self.waiting = 0
        self.condition = asyncio.Condition()
        self.generation = 0
  
    async def wait(self):
        async with self.condition:
            generation = self.generation
            self.waiting += 1
          
            if self.waiting == self.parties:
                # Last task to arrive, wake everyone up
                self.waiting = 0
                self.generation += 1
                self.condition.notify_all()
            else:
                # Wait for the last task
                while self.generation == generation and self.waiting < self.parties:
                    await self.condition.wait()
          
            return self.generation

async def worker(barrier, worker_id):
    print(f"Worker {worker_id} starting")
  
    # Simulate different preparation times
    await asyncio.sleep(worker_id * 0.2)
    print(f"Worker {worker_id} ready, waiting at barrier")
  
    # Wait at the barrier
    generation = await barrier.wait()
  
    print(f"Worker {worker_id} passed barrier (generation {generation})")
  
    # Continue with synchronized work
    await asyncio.sleep(0.5)
    print(f"Worker {worker_id} completed")

async def main():
    # Create a barrier for 5 workers
    barrier = Barrier(5)
  
    # Create workers
    workers = [
        asyncio.create_task(worker(barrier, i))
        for i in range(5)
    ]
  
    # Wait for all workers to complete
    await asyncio.gather(*workers)

asyncio.run(main())
```

This example demonstrates how a Barrier can be used to synchronize multiple tasks, ensuring they all reach a certain point before any continue.

## Asyncio Queue: Producer-Consumer Patterns

While not strictly a synchronization primitive, the asyncio Queue is a powerful tool for coordinating work between tasks. It internally uses synchronization primitives for thread safety.

### The Core Concept

An asyncio Queue:

1. Allows tasks to put items into a queue
2. Allows tasks to get items from the queue
3. Can optionally have a maximum size
4. Provides methods to wait for completion or for the queue to be empty

Here's a basic example:

```python
import asyncio
import random

async def producer(queue, producer_id):
    for i in range(5):
        item = f"P{producer_id}-{i}"
      
        # Put an item in the queue
        await queue.put(item)
        print(f"Producer {producer_id} put {item}")
      
        # Simulate variable production time
        await asyncio.sleep(random.uniform(0.1, 0.5))
  
    print(f"Producer {producer_id} finished")

async def consumer(queue, consumer_id):
    while True:
        # Get an item from the queue
        item = await queue.get()
      
        if item is None:
            # None is a signal to stop
            print(f"Consumer {consumer_id} received stop signal")
            queue.task_done()
            break
      
        print(f"Consumer {consumer_id} got {item}")
      
        # Simulate processing time
        await asyncio.sleep(random.uniform(0.2, 0.8))
      
        # Mark the item as done
        queue.task_done()
  
    print(f"Consumer {consumer_id} finished")

async def main():
    # Create a queue with max size 5
    queue = asyncio.Queue(maxsize=5)
  
    # Create producers
    producers = [
        asyncio.create_task(producer(queue, i))
        for i in range(3)
    ]
  
    # Create consumers
    consumers = [
        asyncio.create_task(consumer(queue, i))
        for i in range(2)
    ]
  
    # Wait for producers to finish
    await asyncio.gather(*producers)
  
    # Wait for all produced items to be processed
    await queue.join()
  
    # Send stop signals to consumers
    for _ in range(len(consumers)):
        await queue.put(None)
  
    # Wait for consumers to finish
    await asyncio.gather(*consumers)

asyncio.run(main())
```

This example demonstrates a classic producer-consumer pattern using an asyncio Queue, showing how it can be used for coordination between tasks.

### Real-World Example: Web Crawler

Here's a more realistic example of using a Queue for a simple web crawler:


# Synchronization Primitives in Asyncio (continued)

## Asyncio Queue: Producer-Consumer Patterns (continued)

Let's continue with our web crawler example to see how a Queue can be used for coordination in a more complex scenario:

```python
import asyncio
import aiohttp
from urllib.parse import urljoin, urlparse
import re

class Crawler:
    def __init__(self, start_url, max_depth=2, max_concurrent=5):
        self.start_url = start_url
        self.max_depth = max_depth
        self.visited = set()
        self.queue = asyncio.Queue()
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.session = None
    
    async def initialize(self):
        # Create a shared session for all requests
        self.session = aiohttp.ClientSession()
        
        # Add the initial URL to the queue
        parsed = urlparse(self.start_url)
        self.base_domain = f"{parsed.scheme}://{parsed.netloc}"
        
        # Start with depth 0
        await self.queue.put((self.start_url, 0))
    
    async def close(self):
        # Close the session
        if self.session:
            await self.session.close()
    
    async def crawl(self):
        # Start worker tasks
        workers = [
            asyncio.create_task(self.worker())
            for _ in range(5)
        ]
        
        # Wait for all workers to complete
        await self.queue.join()
        
        # Cancel all workers
        for worker in workers:
            worker.cancel()
        
        # Wait for workers to be cancelled
        await asyncio.gather(*workers, return_exceptions=True)
    
    async def worker(self):
        try:
            while True:
                # Get a URL from the queue
                url, depth = await self.queue.get()
                
                try:
                    # Process the URL
                    await self.process_url(url, depth)
                finally:
                    # Mark the URL as done
                    self.queue.task_done()
        except asyncio.CancelledError:
            # Worker was cancelled, exit gracefully
            return
    
    async def process_url(self, url, depth):
        # Skip if already visited
        if url in self.visited:
            return
        
        # Mark as visited
        self.visited.add(url)
        
        print(f"Crawling {url} (depth {depth})")
        
        # Limit concurrent requests with semaphore
        async with self.semaphore:
            try:
                # Get the page content
                async with self.session.get(url, timeout=10) as response:
                    if response.status != 200:
                        print(f"Error: {url} returned status code {response.status}")
                        return
                    
                    # Get the content type
                    content_type = response.headers.get('content-type', '')
                    if 'text/html' not in content_type:
                        print(f"Skipping non-HTML URL: {url}")
                        return
                    
                    # Get the page content
                    html = await response.text()
                    
                    # Extract links if not at max depth
                    if depth < self.max_depth:
                        self.extract_links(url, html, depth + 1)
            
            except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                print(f"Error fetching {url}: {e}")
    
    def extract_links(self, url, html, new_depth):
        # Simple regex to find links
        link_pattern = re.compile(r'href=["\'](.*?)["\']', re.IGNORECASE)
        
        # Find all links
        for match in link_pattern.finditer(html):
            link = match.group(1)
            
            # Convert to absolute URL
            absolute_url = urljoin(url, link)
            parsed = urlparse(absolute_url)
            
            # Skip fragments, queries, and non-HTTP(S) URLs
            if not parsed.scheme or not parsed.netloc or parsed.fragment:
                continue
            
            # Only follow links to the same domain
            if parsed.netloc != urlparse(self.base_domain).netloc:
                continue
            
            # Normalize the URL
            normalized_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            if normalized_url.endswith('/'):
                normalized_url = normalized_url[:-1]
            
            # Add to queue if not visited
            if normalized_url not in self.visited:
                asyncio.create_task(self.queue.put((normalized_url, new_depth)))

async def main():
    # Create and run a crawler
    crawler = Crawler("https://example.com", max_depth=2, max_concurrent=3)
    
    try:
        await crawler.initialize()
        await crawler.crawl()
        print(f"Crawled {len(crawler.visited)} URLs")
    finally:
        # Ensure the session is closed
        await crawler.close()

asyncio.run(main())
```

This example demonstrates using a Queue for work distribution in a web crawler, combined with a Semaphore to limit concurrent requests. The crawler:

1. Starts with an initial URL and enqueues it
2. Workers dequeue URLs and process them
3. New URLs are discovered and enqueued
4. The process continues until the queue is empty
5. Proper synchronization ensures controlled resource usage

## Custom Synchronization Primitives

Sometimes the built-in primitives don't exactly match our needs. Let's explore how to create custom synchronization primitives for specific use cases.

### Read-Write Lock

A Read-Write Lock allows multiple readers or a single writer, but not both simultaneously. This is useful for resources that are often read but occasionally written:

```python
import asyncio

class ReadWriteLock:
    def __init__(self):
        # Main lock to protect internal state
        self._lock = asyncio.Lock()
        # Condition for coordinating readers and writers
        self._condition = asyncio.Condition(self._lock)
        # Counters for tracking state
        self._readers = 0
        self._writers = 0
        self._waiting_writers = 0
    
    async def acquire_read(self):
        async with self._condition:
            # If there are writers, wait
            while self._writers > 0 or self._waiting_writers > 0:
                await self._condition.wait()
            
            # Increment readers count
            self._readers += 1
    
    async def release_read(self):
        async with self._condition:
            # Decrement readers count
            self._readers -= 1
            
            # If no more readers, notify writers
            if self._readers == 0:
                self._condition.notify_all()
    
    async def acquire_write(self):
        async with self._condition:
            # Increment waiting writers count
            self._waiting_writers += 1
            
            # Wait until no readers or writers
            while self._readers > 0 or self._writers > 0:
                await self._condition.wait()
            
            # Decrease waiting writers and increase active writers
            self._waiting_writers -= 1
            self._writers += 1
    
    async def release_write(self):
        async with self._condition:
            # Decrement writers count
            self._writers -= 1
            
            # Notify all waiters
            self._condition.notify_all()
    
    async def __aenter__(self):
        await self.acquire_write()
        return self
    
    async def __aexit__(self, exc_type, exc, tb):
        await self.release_write()

class ReadContextManager:
    def __init__(self, lock):
        self.lock = lock
    
    async def __aenter__(self):
        await self.lock.acquire_read()
        return self
    
    async def __aexit__(self, exc_type, exc, tb):
        await self.lock.release_read()

class WriteContextManager:
    def __init__(self, lock):
        self.lock = lock
    
    async def __aenter__(self):
        await self.lock.acquire_write()
        return self
    
    async def __aexit__(self, exc_type, exc, tb):
        await self.lock.release_write()

class ReadWriteLockWrapper:
    def __init__(self):
        self._lock = ReadWriteLock()
    
    def reader(self):
        return ReadContextManager(self._lock)
    
    def writer(self):
        return WriteContextManager(self._lock)
```

Now let's see how we would use this Read-Write Lock:

```python
import asyncio
import random

async def reader(lock, shared_data, reader_id):
    for _ in range(5):
        # Acquire read lock
        async with lock.reader():
            # Read shared data
            value = shared_data["value"]
            print(f"Reader {reader_id} read value: {value}")
        
        # Simulate time between reads
        await asyncio.sleep(random.uniform(0.1, 0.5))

async def writer(lock, shared_data, writer_id):
    for i in range(3):
        # Simulate preparation time
        await asyncio.sleep(random.uniform(0.5, 1.0))
        
        # Acquire write lock
        async with lock.writer():
            # Update shared data
            new_value = writer_id * 100 + i
            shared_data["value"] = new_value
            print(f"Writer {writer_id} wrote value: {new_value}")

async def main():
    # Create a read-write lock
    lock = ReadWriteLockWrapper()
    
    # Shared data
    shared_data = {"value": 0}
    
    # Create readers and writers
    readers = [
        asyncio.create_task(reader(lock, shared_data, i))
        for i in range(5)
    ]
    
    writers = [
        asyncio.create_task(writer(lock, shared_data, i))
        for i in range(2)
    ]
    
    # Wait for all tasks to complete
    await asyncio.gather(*readers, *writers)

asyncio.run(main())
```

This Read-Write Lock implementation prioritizes writers over readers. When a writer is waiting, new readers will be blocked until the writer gets its turn. This prevents writer starvation in read-heavy scenarios.

### Counting Latch

A Counting Latch is a synchronization primitive that allows one or more tasks to wait until a set of operations completes:

```python
import asyncio

class CountDownLatch:
    def __init__(self, count):
        if count < 0:
            raise ValueError("count cannot be negative")
        self._count = count
        self._condition = asyncio.Condition()
    
    async def count_down(self):
        async with self._condition:
            if self._count > 0:
                self._count -= 1
                if self._count == 0:
                    # Wake up all waiters
                    self._condition.notify_all()
    
    async def wait(self):
        async with self._condition:
            while self._count > 0:
                await self._condition.wait()

async def worker(latch, worker_id):
    # Simulate work
    work_time = 0.2 * (worker_id + 1)
    print(f"Worker {worker_id} starting, will take {work_time:.1f}s")
    await asyncio.sleep(work_time)
    
    print(f"Worker {worker_id} completed, counting down latch")
    await latch.count_down()

async def coordinator(latch):
    print("Coordinator waiting for all workers to complete")
    await latch.wait()
    print("All workers completed, coordinator proceeding")

async def main():
    # Create a latch for 5 workers
    latch = CountDownLatch(5)
    
    # Create worker tasks
    workers = [
        asyncio.create_task(worker(latch, i))
        for i in range(5)
    ]
    
    # Create coordinator task
    coordinator_task = asyncio.create_task(coordinator(latch))
    
    # Wait for all tasks to complete
    await asyncio.gather(*workers, coordinator_task)

asyncio.run(main())
```

This CountDownLatch is useful for coordinating multiple tasks that need to complete before another task can proceed. It's a one-time synchronization point.

## Atomic Operations and Thread Safety

Asyncio runs in a single thread by default, which means that many operations that would require synchronization in a multi-threaded environment don't need it in asyncio. However, it's important to understand when synchronization is still needed:

### When Synchronization Is Needed in Asyncio

1. **Protecting Critical Sections**: Even though asyncio tasks don't preempt each other, they can still interleave at `await` points. If a critical section of code spans multiple `await` points, it still needs protection.

2. **Coordinating Task Execution Order**: Synchronization primitives help control the order in which tasks execute, especially when they depend on each other.

3. **Integration with Threads**: When asyncio code interacts with threaded code, proper synchronization is essential.

4. **Preventing Race Conditions**: Even in single-threaded asyncio, race conditions can occur when multiple tasks access shared mutable state.

Let's see an example of a race condition in asyncio and how to prevent it:

```python
import asyncio

# Shared counter without synchronization
class UnsafeCounter:
    def __init__(self):
        self.value = 0
    
    async def increment(self):
        # This operation is not atomic if it spans an await point
        current = self.value
        await asyncio.sleep(0.01)  # Simulate I/O
        self.value = current + 1

# Shared counter with synchronization
class SafeCounter:
    def __init__(self):
        self.value = 0
        self.lock = asyncio.Lock()
    
    async def increment(self):
        async with self.lock:
            current = self.value
            await asyncio.sleep(0.01)  # Simulate I/O
            self.value = current + 1

async def increment_counter(counter, times):
    for _ in range(times):
        await counter.increment()

async def main():
    # Test unsafe counter
    unsafe = UnsafeCounter()
    tasks = [
        asyncio.create_task(increment_counter(unsafe, 100))
        for _ in range(5)
    ]
    await asyncio.gather(*tasks)
    print(f"Unsafe counter final value: {unsafe.value} (expected: 500)")
    
    # Test safe counter
    safe = SafeCounter()
    tasks = [
        asyncio.create_task(increment_counter(safe, 100))
        for _ in range(5)
    ]
    await asyncio.gather(*tasks)
    print(f"Safe counter final value: {safe.value} (expected: 500)")

asyncio.run(main())
```

This example demonstrates how operations that span `await` points can lead to race conditions, even in single-threaded asyncio code. The `SafeCounter` protects its critical section with a Lock, ensuring consistent results.

## Working with Threads and Processes

When asyncio code interacts with threads or processes, special care is needed for synchronization:

### Thread Safety with Asyncio

```python
import asyncio
import threading
import time

class ThreadSafeCounter:
    def __init__(self):
        self.value = 0
        self.lock = threading.Lock()
        self.event = asyncio.Event()
    
    def increment_in_thread(self, amount):
        with self.lock:
            self.value += amount
        
        # Notify waiting asyncio tasks
        asyncio.run_coroutine_threadsafe(self.notify(), asyncio.get_event_loop())
    
    async def wait_for_update(self):
        await self.event.wait()
        self.event.clear()
    
    async def notify(self):
        self.event.set()

async def main():
    counter = ThreadSafeCounter()
    
    # Start a separate thread to update the counter
    def thread_function():
        for i in range(5):
            time.sleep(1)
            print(f"Thread incrementing counter by {i+1}")
            counter.increment_in_thread(i+1)
    
    thread = threading.Thread(target=thread_function)
    thread.start()
    
    # Wait for updates from the thread
    for _ in range(5):
        await counter.wait_for_update()
        print(f"Counter value updated to: {counter.value}")
    
    # Wait for the thread to complete
    thread.join()

asyncio.run(main())
```

This example shows how to safely coordinate between a background thread and asyncio tasks. The `threading.Lock` protects the counter value, while the `asyncio.Event` allows the asyncio task to wait for updates.

### Running Blocking Code in Thread Pools

Asyncio provides the `run_in_executor` method to run blocking code in a thread or process pool without blocking the event loop:

```python
import asyncio
import concurrent.futures
import time

def blocking_operation(x):
    # Simulate a CPU-bound or blocking I/O operation
    time.sleep(1)
    return x * 2

async def main():
    # Create a thread pool
    executor = concurrent.futures.ThreadPoolExecutor(max_workers=5)
    
    # Run multiple operations concurrently in the thread pool
    loop = asyncio.get_running_loop()
    tasks = [
        loop.run_in_executor(executor, blocking_operation, i)
        for i in range(10)
    ]
    
    # Wait for all operations to complete
    results = await asyncio.gather(*tasks)
    print(f"Results: {results}")
    
    # Clean up
    executor.shutdown()

asyncio.run(main())
```

This pattern allows integrating blocking code with asyncio without blocking the event loop, effectively combining the benefits of threading and asyncio.

## Advanced Patterns for Synchronization in Asyncio

Let's explore some advanced patterns for synchronization in asyncio applications:

### Priority Queue

A priority queue can be implemented to process tasks in order of importance:

```python
import asyncio
import heapq

class PriorityQueue:
    def __init__(self):
        self._queue = []
        self._counter = 0
        self._lock = asyncio.Lock()
        self._not_empty = asyncio.Condition(self._lock)
    
    async def put(self, item, priority=0):
        async with self._lock:
            # Use counter to break ties and ensure FIFO within same priority
            count = self._counter
            self._counter += 1
            
            # Add to heap (priority, count, item)
            heapq.heappush(self._queue, (priority, count, item))
            
            # Notify waiters
            self._not_empty.notify()
    
    async def get(self):
        async with self._not_empty:
            while not self._queue:
                await self._not_empty.wait()
            
            # Get the highest priority item
            priority, count, item = heapq.heappop(self._queue)
            return item

async def worker(queue, worker_id):
    while True:
        # Get an item from the queue
        item = await queue.get()
        
        if item is None:
            # None is a signal to exit
            print(f"Worker {worker_id} shutting down")
            break
        
        # Process the item
        priority, task_id = item
        print(f"Worker {worker_id} processing task {task_id} with priority {priority}")
        
        # Simulate processing time
        await asyncio.sleep(0.5)

async def main():
    # Create a priority queue
    queue = PriorityQueue()
    
    # Create workers
    workers = [
        asyncio.create_task(worker(queue, i))
        for i in range(3)
    ]
    
    # Add tasks with different priorities
    tasks = [
        (3, "High priority 1"),
        (1, "Low priority 1"),
        (2, "Medium priority 1"),
        (3, "High priority 2"),
        (1, "Low priority 2"),
        (2, "Medium priority 2"),
    ]
    
    # Put tasks in the queue
    for priority, task_id in tasks:
        await queue.put((priority, task_id))
    
    # Let workers process for a while
    await asyncio.sleep(5)
    
    # Signal workers to exit
    for _ in range(len(workers)):
        await queue.put(None)
    
    # Wait for workers to complete
    await asyncio.gather(*workers)

asyncio.run(main())
```

This example demonstrates a priority queue that allows tasks to be processed in order of importance, with a custom implementation based on asyncio synchronization primitives.

### Task Limiting and Load Balancing

Here's a pattern for limiting the number of concurrent tasks and balancing load across workers:

```python
import asyncio
import random

class TaskLimiter:
    def __init__(self, max_concurrent=5, max_pending=10):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.pending = asyncio.Queue(maxsize=max_pending)
        self.workers = []
    
    async def add_task(self, coro):
        # Add the coroutine to the pending queue
        await self.pending.put(coro)
    
    async def worker(self, worker_id):
        try:
            while True:
                # Get a coroutine from the pending queue
                coro = await self.pending.get()
                
                # Execute the coroutine with the semaphore
                async with self.semaphore:
                    print(f"Worker {worker_id} executing task")
                    await coro
                
                # Mark as done
                self.pending.task_done()
        except asyncio.CancelledError:
            print(f"Worker {worker_id} cancelled")
            raise
    
    async def start(self, num_workers=3):
        # Start workers
        self.workers = [
            asyncio.create_task(self.worker(i))
            for i in range(num_workers)
        ]
    
    async def join(self):
        # Wait for all pending tasks to complete
        await self.pending.join()
    
    async def shutdown(self):
        # Cancel all workers
        for worker in self.workers:
            worker.cancel()
        
        # Wait for cancellation to complete
        if self.workers:
            await asyncio.gather(*self.workers, return_exceptions=True)
            self.workers.clear()

async def sample_task(task_id):
    duration = random.uniform(0.5, 2.0)
    print(f"Task {task_id} running (will take {duration:.2f}s)")
    await asyncio.sleep(duration)
    print(f"Task {task_id} completed")

async def main():
    # Create a task limiter
    limiter = TaskLimiter(max_concurrent=3, max_pending=5)
    
    # Start the workers
    await limiter.start(num_workers=2)
    
    # Add tasks
    for i in range(10):
        await limiter.add_task(sample_task(i))
        print(f"Added task {i} to limiter")
    
    # Wait for all tasks to complete
    print("Waiting for all tasks to complete")
    await limiter.join()
    
    # Shut down
    await limiter.shutdown()
    print("All tasks completed, limiter shut down")

asyncio.run(main())
```

This pattern allows limiting both the number of concurrently executing tasks and the number of pending tasks, providing backpressure to prevent resource exhaustion.

### Circuit Breaker Pattern

The circuit breaker pattern prevents cascading failures by failing fast when a service is unhealthy:

```python
import asyncio
import random
import time

class CircuitBreaker:
    def __init__(self, failure_threshold=5, reset_timeout=30):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.state = "closed"  # closed, open, half-open
        self.last_failure_time = 0
        self.lock = asyncio.Lock()
    
    async def execute(self, coro):
        async with self.lock:
            current_time = time.time()
            
            # Check if circuit should attempt reset
            if self.state == "open":
                if current_time - self.last_failure_time >= self.reset_timeout:
                    print("Circuit breaker: half-open")
                    self.state = "half-open"
            
            # Don't allow calls when circuit is open
            if self.state == "open":
                raise CircuitBreakerOpenError("Circuit is open, call rejected")
        
        try:
            # Execute the coroutine
            result = await coro
            
            # Success: reset the circuit if it was half-open
            async with self.lock:
                if self.state == "half-open":
                    print("Circuit breaker: closed after success")
                    self.state = "closed"
                    self.failure_count = 0
            
            return result
            
        except Exception as e:
            # Failure: update circuit state
            async with self.lock:
                self.failure_count += 1
                self.last_failure_time = time.time()
                
                # Check if we need to open the circuit
                if self.state == "closed" and self.failure_count >= self.failure_threshold:
                    print(f"Circuit breaker: opened after {self.failure_count} failures")
                    self.state = "open"
                elif self.state == "half-open":
                    print("Circuit breaker: reopened after test failure")
                    self.state = "open"
            
            # Re-raise the original exception
            raise

class CircuitBreakerOpenError(Exception):
    pass

async def unreliable_service(fail_rate=0.7):
    # Simulate an unreliable service
    await asyncio.sleep(0.1)
    
    # Randomly fail based on fail_rate
    if random.random() < fail_rate:
        raise RuntimeError("Service failed")
    
    return "Service response"

async def main():
    # Create a circuit breaker
    breaker = CircuitBreaker(failure_threshold=3, reset_timeout=5)
    
    # Try to call the service multiple times
    for i in range(20):
        try:
            result = await breaker.execute(unreliable_service())
            print(f"Call {i}: Success, result = {result}")
        except CircuitBreakerOpenError as e:
            print(f"Call {i}: Circuit open, fast failing")
        except Exception as e:
            print(f"Call {i}: Service error: {e}")
        
        # Pause between calls
        await asyncio.sleep(1)

asyncio.run(main())
```

This circuit breaker implementation protects against cascading failures by preventing calls to a failing service until it has had time to recover. It uses asyncio synchronization primitives to ensure thread safety.

## Best Practices for Synchronization in Asyncio

Based on our exploration, here are best practices for effective synchronization in asyncio applications:

### 1. Use the Right Primitive for the Job

Different synchronization needs call for different primitives:

- Use a **Lock** for mutual exclusion
- Use an **Event** for signaling between tasks
- Use a **Condition** for complex synchronization logic
- Use a **Semaphore** for controlling access to limited resources
- Use a **Queue** for producer-consumer patterns

Choosing the right primitive for your specific synchronization need leads to cleaner, more efficient code.

### 2. Keep Critical Sections Small

When using locks or other synchronization primitives, keep the protected code section as small as possible:

```python
# Good: Small critical section
async def good_approach(lock, shared_data):
    # Do preparation work outside the lock
    local_data = prepare_data()
    
    # Only acquire the lock for the critical section
    async with lock:
        shared_data.update(local_data)

# Bad: Unnecessarily large critical section
async def bad_approach(lock, shared_data):
    # Holding the lock for the entire operation, including preparation
    async with lock:
        local_data = prepare_data()
        shared_data.update(local_data)
```

This minimizes the time spent holding locks, reducing contention and improving concurrency.

### 3. Avoid Deadlocks with Careful Lock Ordering

When multiple locks are needed, always acquire them in a consistent order to prevent deadlocks:

```python
# Good: Consistent lock ordering
async def transfer(account1, account2, amount):
    # Acquire locks in order of account ID to prevent deadlocks
    first, second = sorted([account1, account2], key=lambda a: a.id)
    
    async with first.lock:
        async with second.lock:
            # Perform the transfer
            account1.balance -= amount
            account2.balance += amount
```

This ensures that no matter what order accounts are passed to the function, the locks will always be acquired in the same order, preventing deadlocks.

### 4. Use Context Managers for Automatic Resource Release

Always use the `async with` syntax when possible to ensure that locks and other resources are properly released, even if exceptions occur:

```python
# Good: Using context manager
async def safe_operation(lock):
    async with lock:
        # Protected code that might raise an exception
        await risky_operation()
    # Lock is automatically released, even if an exception occurred

# Bad: Manual lock management
async def unsafe_operation(lock):
    await lock.acquire()
    try:
        # Protected code that might raise an exception
        await risky_operation()
    finally:
        # Have to remember to release the lock
        lock.release()
```

The context manager approach is more concise and less error-prone.

### 5. Handle Cancellation Properly

Remember that asyncio tasks can be cancelled, which introduces additional complexity for synchronization. Ensure that locks and other resources are properly released when a task is cancelled:

```python
async def cancellation_aware(lock):
    try:
        async with lock:
            # This operation might be cancelled
            await long_running_operation()
    except asyncio.CancelledError:
        # Ensure cleanup is done
        print("Task cancelled, cleaning up")
        # No need to manually release the lock - the context manager handles it
        raise  # Re-raise to propagate the cancellation
```

Proper cancellation handling ensures that resources aren't leaked even when tasks are forcibly terminated.

### 6. Use Higher-Level Abstractions When Possible

Instead of working directly with low-level synchronization primitives, consider using higher-level abstractions:

```python
# Instead of managing semaphores manually:
semaphore = asyncio.Semaphore(10)
tasks = []
for url in urls:
    tasks.append(asyncio.create_task(fetch_with_semaphore(url, semaphore)))
results = await asyncio.gather(*tasks)

# Consider using a task limiter abstraction:
limiter = TaskLimiter(max_concurrent=10)
await limiter.start()
for url in urls:
    await limiter.add_task(fetch(url))
await limiter.join()
await limiter.shutdown()
```

Higher-level abstractions encapsulate the synchronization logic, making your code cleaner and less error-prone.

### 7. Understand Thread Safety in Asyncio

Remember that asyncio is cooperative, not preemptive. This means:

- Operations are atomic unless they contain `await` points
- You only need synchronization for operations that span `await` points
- When interacting with threaded code, you need proper thread synchronization

```python
# This is atomic in asyncio (no awaits inside)
def atomic_operation(self):
    self.counter += 1
    self.counter_squared = self.counter ** 2

# This is not atomic in asyncio (contains await)
async def non_atomic_operation(self):
    self.counter += 1
    await asyncio.sleep(0)  # Could switch to another task here
    self.counter_squared = self.counter ** 2  # Not safe!
```

Understanding this distinction helps you identify where synchronization is actually needed.

## Conclusion

Synchronization primitives in asyncio provide the tools needed to coordinate concurrent tasks and manage shared resources effectively. From our exploration, we've learned:

1. **Locks** provide mutual exclusion, ensuring that only one task can access a resource at a time.

2. **Events** enable signaling between tasks, allowing one task to notify others when a condition has occurred.


3. **Conditions** combine locks and waiting/notification, supporting complex synchronization patterns where tasks need to wait for specific states to occur.

4. **Semaphores** limit concurrent access to resources, allowing a specified number of tasks to proceed simultaneously.

5. **Queues** facilitate producer-consumer patterns, allowing tasks to safely pass data between them.

6. **Custom primitives** can be created for specialized synchronization needs, building on the basic primitives.

7. **Structured patterns** like task limiters, circuit breakers, and priority queues can be built using these primitives to solve real-world concurrency challenges.

The unique nature of asyncio's cooperative multitasking model influences how we think about synchronization:

- Synchronization happens at `await` points, not arbitrarily
- We need synchronization for operations that span `await` points
- Proper synchronization prevents race conditions and ensures correct behavior

When developing asyncio applications, it's essential to carefully consider synchronization needs and use the appropriate primitives to ensure robust, efficient concurrent code.

By mastering these synchronization primitives and patterns, you can write asyncio applications that safely coordinate concurrent tasks, efficiently manage shared resources, and gracefully handle errors and cancellation - all while maintaining the high performance that makes asyncio so valuable.

Remember that synchronization in asyncio is about more than just preventing data corruption; it's about expressing the coordination logic of your application in a clear, maintainable way. The right synchronization primitives and patterns not only make your code correct but also make it more understandable and maintainable over time.