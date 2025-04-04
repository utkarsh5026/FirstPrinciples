# Timeouts and Waiting in Asyncio: From First Principles

## Understanding Timeouts and Waiting in Asynchronous Programming

At its core, asynchronous programming is all about managing time. When a task needs to wait for something — whether it's a network response, file I/O, or just a simple delay — we want to handle that waiting efficiently without blocking the entire program. This is why timeouts and waiting mechanisms are fundamental components of any asynchronous framework, including Python's asyncio.

To understand timeouts and waiting from first principles, we need to start with the fundamental question: how do we represent and manage the passage of time in an asynchronous system?

## The Nature of Time in Asyncio

In a synchronous program, when you call `time.sleep(5)`, the entire program pauses for 5 seconds. But in asyncio, we need a different model. When a coroutine calls `await asyncio.sleep(5)`, it's telling the event loop: "Pause my execution, let other tasks run, and wake me up in 5 seconds."

This cooperative approach to managing time is at the heart of asyncio. The event loop maintains a schedule of tasks and their wake-up times, allowing it to efficiently switch between tasks and utilize time that would otherwise be spent waiting.

### Event Loop and Timeouts

The asyncio event loop includes a clock or timer that keeps track of when tasks should be resumed. When you call `asyncio.sleep(5)`, the event loop registers a callback to be executed after 5 seconds. This is implemented using efficient system-level polling mechanisms (like `select`, `epoll`, or `kqueue` depending on the platform).

```python
import asyncio

async def demonstrate_basic_waiting():
    print("Starting")
  
    # This doesn't block other tasks - it yields control to the event loop
    await asyncio.sleep(2)
  
    print("After 2 seconds")

async def main():
    # Run two waiting tasks concurrently
    await asyncio.gather(
        demonstrate_basic_waiting(),
        demonstrate_basic_waiting()
    )

asyncio.run(main())
```

In this simple example, both coroutines run concurrently. When the first one hits `await asyncio.sleep(2)`, it yields control to the event loop, which can then run the second coroutine until it also hits its `await asyncio.sleep(2)`. After 2 seconds, both coroutines are resumed and complete their execution.

## Basic Waiting Mechanisms in Asyncio

Before diving into timeouts, let's explore the fundamental waiting mechanisms in asyncio:

### asyncio.sleep()

The most basic form of waiting in asyncio is `asyncio.sleep()`:

```python
import asyncio

async def wait_and_print(delay, message):
    await asyncio.sleep(delay)
    print(message)

async def main():
    # Start three waiting tasks with different delays
    task1 = asyncio.create_task(wait_and_print(1, "Task 1 after 1s"))
    task2 = asyncio.create_task(wait_and_print(2, "Task 2 after 2s"))
    task3 = asyncio.create_task(wait_and_print(3, "Task 3 after 3s"))
  
    # Wait for all tasks to complete
    await asyncio.gather(task1, task2, task3)

asyncio.run(main())
```

`asyncio.sleep()` is more than just a way to pause execution — it's a fundamental building block for implementing timeouts and more complex waiting patterns.

### Future.result() with Timeout

A lower-level way to implement timeouts is using the `result()` method of a Future with a timeout parameter:

```python
import asyncio

async def slow_operation():
    await asyncio.sleep(5)
    return "Operation completed"

async def main():
    # Create a task
    task = asyncio.create_task(slow_operation())
  
    try:
        # Try to get the result with a 2-second timeout
        result = await asyncio.wait_for(task, timeout=2)
        print(result)
    except asyncio.TimeoutError:
        print("Operation timed out")
        # Note: task is automatically cancelled on timeout
  
    # Check task status
    print(f"Task cancelled: {task.cancelled()}")

asyncio.run(main())
```

This example demonstrates a key aspect of timeouts in asyncio: when a timeout occurs, the associated task is typically cancelled.

## Core Timeout Functions in Asyncio

Asyncio provides several core functions for implementing timeouts and waiting behavior:

### asyncio.wait_for()

This is the primary function for implementing timeouts in asyncio:

```python
import asyncio

async def example_wait_for():
    try:
        # Wait for a coroutine with a timeout
        result = await asyncio.wait_for(
            asyncio.sleep(10), 
            timeout=2
        )
        print("This won't be reached")
    except asyncio.TimeoutError:
        print("The operation timed out after 2 seconds")

asyncio.run(example_wait_for())
```

Key characteristics of `wait_for()`:

1. It takes a coroutine or task and a timeout value in seconds
2. If the operation completes within the timeout, it returns the result
3. If the timeout expires, it cancels the operation and raises `asyncio.TimeoutError`
4. The cancellation is propagated to the coroutine, allowing it to clean up resources

### How wait_for() Works Internally

To understand `wait_for()` better, let's look at a simplified implementation:

```python
async def simplified_wait_for(awaitable, timeout):
    if timeout is None:
        return await awaitable
  
    # Create a task for the awaitable
    task = asyncio.create_task(awaitable)
  
    # Create a future for the timeout
    timeout_future = asyncio.create_task(asyncio.sleep(timeout))
  
    # Wait for either the task to complete or the timeout to expire
    done, pending = await asyncio.wait(
        {task, timeout_future},
        return_when=asyncio.FIRST_COMPLETED
    )
  
    # If the timeout_future is done first, the operation timed out
    if timeout_future in done:
        # Cancel the original task
        task.cancel()
        # Wait for the task to process the cancellation
        try:
            await task
        except asyncio.CancelledError:
            pass
        # Raise TimeoutError
        raise asyncio.TimeoutError()
  
    # Otherwise, cancel the timeout and return the result
    timeout_future.cancel()
    return await task
```

This simplified implementation illustrates the key aspects:

1. It creates a task for the awaitable operation
2. It creates a "timeout task" using `asyncio.sleep()`
3. It waits for either to complete using `asyncio.wait()`
4. If the timeout task completes first, it cancels the main task
5. If the main task completes first, it cancels the timeout task

### asyncio.wait()

While `wait_for()` handles a single awaitable with a timeout, `wait()` allows waiting for multiple awaitables with more control:

```python
import asyncio

async def example_wait():
    # Create some tasks
    tasks = [
        asyncio.create_task(asyncio.sleep(1)),
        asyncio.create_task(asyncio.sleep(2)),
        asyncio.create_task(asyncio.sleep(3))
    ]
  
    # Wait with a timeout
    done, pending = await asyncio.wait(
        tasks,
        timeout=1.5,
        return_when=asyncio.FIRST_COMPLETED
    )
  
    print(f"Completed tasks: {len(done)}")
    print(f"Pending tasks: {len(pending)}")
  
    # Cancel any pending tasks
    for task in pending:
        task.cancel()

asyncio.run(example_wait())
```

Key characteristics of `wait()`:

1. It takes a collection of awaitables and various control parameters
2. It returns a tuple of sets: (done, pending)
3. It provides fine-grained control with the `return_when` parameter:
   * `FIRST_COMPLETED`: Return when any awaitable completes or fails
   * `FIRST_EXCEPTION`: Return when any awaitable raises an exception
   * `ALL_COMPLETED`: Return when all awaitables are done
4. Unlike `wait_for()`, it doesn't automatically cancel pending tasks on timeout

### asyncio.timeout() (Python 3.11+)

Python 3.11 introduced a new context manager for timeouts:

```python
import asyncio

async def example_timeout_context():
    try:
        # Set a timeout for the block
        async with asyncio.timeout(1):
            await asyncio.sleep(2)
            print("This won't be reached")
    except asyncio.TimeoutError:
        print("The operation timed out")

    # Resetting a timeout
    try:
        # Create a reusable timeout context
        async with asyncio.timeout(10) as timeout:
            # Do some work
            await asyncio.sleep(1)
            print("First part completed")
          
            # Reset the timeout
            timeout.reschedule(2)
          
            # This will time out
            await asyncio.sleep(3)
            print("This won't be reached")
    except asyncio.TimeoutError:
        print("The operation timed out after reset")

# For Python 3.11+
# asyncio.run(example_timeout_context())
```

This context manager provides a cleaner way to apply timeouts to blocks of code, with the ability to reschedule the timeout.

### asyncio.wait_for() vs. asyncio.wait()

These functions serve similar purposes but have important differences:

1. **Scope** : `wait_for()` handles a single awaitable, while `wait()` handles multiple
2. **Behavior on timeout** : `wait_for()` cancels the awaitable on timeout, while `wait()` just returns whatever completed
3. **Return value** : `wait_for()` returns the awaitable's result (or raises TimeoutError), while `wait()` returns sets of done and pending tasks
4. **Flexibility** : `wait()` offers more control with the `return_when` parameter

## Implementing Timeouts in Real-World Scenarios

Let's explore how to use these timeout mechanisms in practical scenarios:

### HTTP Client with Timeouts

```python
import asyncio
import aiohttp

async def fetch_with_timeout(url, timeout=10):
    try:
        async with aiohttp.ClientSession() as session:
            # Apply timeout to the entire operation
            async with asyncio.timeout(timeout):
                async with session.get(url) as response:
                    return await response.text()
    except asyncio.TimeoutError:
        print(f"Request to {url} timed out after {timeout}s")
        return None
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

async def main():
    # Fetch with different timeouts
    fast_result = await fetch_with_timeout("https://example.com", timeout=5)
    slow_result = await fetch_with_timeout("https://httpbin.org/delay/3", timeout=2)
  
    print(f"Fast result: {fast_result is not None}")
    print(f"Slow result: {slow_result is not None}")

# asyncio.run(main())  # Ensure aiohttp is installed
```

This example shows how to apply a timeout to an HTTP request. If the request takes too long, the timeout will cancel it and allow the program to continue.

### Layered Timeouts

Sometimes you need different timeouts for different operations within a single function:

```python
import asyncio

async def process_with_layered_timeouts(data_url, process_timeout=30):
    # Overall timeout for the entire operation
    try:
        async with asyncio.timeout(process_timeout):
            # Timeout for the fetch operation (10s)
            try:
                data = await asyncio.wait_for(fetch_data(data_url), timeout=10)
            except asyncio.TimeoutError:
                print("Fetch operation timed out, using cached data")
                data = get_cached_data()
          
            # Timeout for the processing (15s)
            try:
                result = await asyncio.wait_for(process_data(data), timeout=15)
                return result
            except asyncio.TimeoutError:
                print("Processing timed out, returning partial result")
                return get_partial_result(data)
    except asyncio.TimeoutError:
        print(f"Overall operation timed out after {process_timeout}s")
        return None

async def fetch_data(url):
    # Simulate network fetch
    await asyncio.sleep(5)
    return {"data": "sample"}

async def process_data(data):
    # Simulate processing
    await asyncio.sleep(7)
    return {"processed": data["data"]}

def get_cached_data():
    return {"data": "cached"}

def get_partial_result(data):
    return {"partial": data["data"]}

async def main():
    result = await process_with_layered_timeouts("https://example.com")
    print(f"Result: {result}")

asyncio.run(main())
```

This example demonstrates layering timeouts at different levels:

1. An overall timeout for the entire operation
2. A smaller timeout for the fetch operation
3. Another timeout for the processing step

This approach allows for more nuanced error handling, falling back to alternative strategies when specific steps time out.

### Timeouts with Resource Cleanup

When a timeout occurs and a task is cancelled, it's important to ensure that resources are properly cleaned up:

```python
import asyncio

class ResourceManager:
    async def acquire(self):
        print("Acquiring resource...")
        await asyncio.sleep(0.5)
        print("Resource acquired")
        return self
  
    async def release(self):
        print("Releasing resource...")
        await asyncio.sleep(0.5)
        print("Resource released")

async def use_resource_with_timeout(timeout):
    manager = ResourceManager()
    resource = None
  
    try:
        # Apply timeout to the operation
        async with asyncio.timeout(timeout):
            # Acquire the resource
            resource = await manager.acquire()
          
            # Use the resource (slow operation)
            print("Using resource...")
            await asyncio.sleep(5)
            print("Resource usage completed")
    except asyncio.TimeoutError:
        print(f"Operation timed out after {timeout}s")
    finally:
        # Ensure resource is released even on timeout
        if resource:
            await resource.release()

async def main():
    # This will time out
    await use_resource_with_timeout(2)
    print("\n---\n")
    # This won't time out
    await use_resource_with_timeout(10)

asyncio.run(main())
```

This example demonstrates a key pattern for handling resources with timeouts:

1. Acquire the resource within the timeout context
2. Use a `finally` block to ensure cleanup happens regardless of timeout
3. Check if the resource was acquired before attempting to release it

## Advanced Timeout Patterns

Beyond the basic timeout functions, there are several advanced patterns for handling timeouts in asyncio:

### Graceful Cancellation with Timeouts

When a timeout occurs and a task is cancelled, we can make the cancellation more graceful by catching `CancelledError` and performing cleanup:

```python
import asyncio

async def operation_with_graceful_cancellation():
    try:
        print("Starting operation")
      
        # Main work
        for i in range(10):
            try:
                print(f"Step {i}")
                await asyncio.sleep(1)
            except asyncio.CancelledError:
                print(f"Cancellation detected during step {i}")
                # Do step-specific cleanup
                print(f"Cleaning up step {i}")
                # Then re-raise to propagate the cancellation
                raise
      
        print("Operation completed")
        return "Success"
    except asyncio.CancelledError:
        print("Operation was cancelled, cleaning up")
        # Perform final cleanup
        await asyncio.sleep(0.1)  # Simulate cleanup
        print("Cleanup completed")
        # Re-raise to acknowledge the cancellation
        raise
    except Exception as e:
        print(f"Operation failed: {e}")
        raise

async def main():
    try:
        # Apply a timeout
        result = await asyncio.wait_for(
            operation_with_graceful_cancellation(),
            timeout=3
        )
        print(f"Result: {result}")
    except asyncio.TimeoutError:
        print("Operation timed out")

asyncio.run(main())
```

This pattern allows for clean resource management even when timeouts occur, by:

1. Catching `CancelledError` at different levels
2. Performing appropriate cleanup at each level
3. Re-raising the exception to acknowledge the cancellation

### Progressive Timeouts

For operations that might take varying amounts of time, we can implement progressive timeouts that adapt based on progress:

```python
import asyncio

async def operation_with_progressive_timeout(items):
    results = []
  
    # Set initial timeout
    timeout_per_item = 2
    remaining_items = len(items)
  
    # Process each item with a timeout based on remaining work
    for i, item in enumerate(items):
        remaining_time = timeout_per_item * remaining_items
        print(f"Processing item {i}, timeout: {remaining_time}s")
      
        try:
            # Process with timeout
            async with asyncio.timeout(remaining_time):
                result = await process_item(item)
                results.append(result)
        except asyncio.TimeoutError:
            print(f"Timeout processing item {i}")
            # Skip this item and adjust timeout for remaining items
            timeout_per_item *= 0.8  # Reduce timeout for remaining items
      
        remaining_items -= 1
  
    return results

async def process_item(item):
    # Simulate processing with variable duration
    await asyncio.sleep(item)
    return f"Processed {item}"

async def main():
    items = [1, 3, 2, 4, 1]
    results = await operation_with_progressive_timeout(items)
    print(f"Completed processing {len(results)} of {len(items)} items")
    print(f"Results: {results}")

asyncio.run(main())
```

This pattern adjusts the timeout based on the remaining work and progress made, allowing for more adaptive timeout behavior.

### Timeout with Fallback

Instead of failing when a timeout occurs, we can provide fallback functionality:

```python
import asyncio
import random

async def primary_operation():
    # Simulate primary operation with random duration
    duration = random.uniform(1, 5)
    print(f"Primary operation running (will take {duration:.1f}s)")
    await asyncio.sleep(duration)
    return "Primary result"

async def fallback_operation():
    # Simulate fallback operation (faster and more reliable)
    print("Fallback operation running")
    await asyncio.sleep(0.5)
    return "Fallback result"

async def operation_with_fallback(timeout=2):
    try:
        # Try the primary operation with a timeout
        result = await asyncio.wait_for(primary_operation(), timeout=timeout)
        print("Primary operation succeeded")
        return result
    except asyncio.TimeoutError:
        print(f"Primary operation timed out after {timeout}s, using fallback")
        # Fall back to the alternative operation
        return await fallback_operation()

async def main():
    for _ in range(5):
        result = await operation_with_fallback()
        print(f"Result: {result}\n")

asyncio.run(main())
```

This pattern provides resilience by offering an alternative when the primary operation times out, which is useful for systems that need to maintain responsiveness even when operations take longer than expected.

## Creating Custom Waiting and Timeout Mechanisms

Sometimes the built-in timeout functions don't exactly match our needs. Let's explore how to build custom waiting and timeout mechanisms:

### Timeout with Progress Updates

This pattern allows monitoring progress during a long-running operation with a timeout:

```python
import asyncio

async def operation_with_progress_updates(steps=10, step_time=0.5):
    for i in range(steps):
        # Simulate work
        await asyncio.sleep(step_time)
      
        # Report progress
        progress = (i + 1) / steps * 100
        print(f"Progress: {progress:.1f}%")
      
        # Allow for cancellation check
        await asyncio.sleep(0)
  
    return "Operation completed"

async def run_with_timeout_and_progress(coroutine, timeout, progress_interval=0.5):
    # Create a task for the coroutine
    task = asyncio.create_task(coroutine)
  
    # Start time
    start_time = asyncio.get_event_loop().time()
  
    # Monitor progress with timeout
    while not task.done():
        # Check if timeout has been exceeded
        elapsed = asyncio.get_event_loop().time() - start_time
        if elapsed >= timeout:
            # Cancel the task
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass
            raise asyncio.TimeoutError(f"Operation timed out after {elapsed:.1f}s")
      
        # Wait a small interval while allowing for task completion
        try:
            await asyncio.wait_for(asyncio.shield(task), timeout=progress_interval)
            # If we get here, the task completed
            break
        except asyncio.TimeoutError:
            # This is just the progress interval timeout, not the operation timeout
            remaining = timeout - elapsed
            print(f"Elapsed: {elapsed:.1f}s, Remaining: {remaining:.1f}s")
  
    # Get the result (will raise any exception from the task)
    return await task

async def main():
    try:
        # Run an operation with progress monitoring and timeout
        result = await run_with_timeout_and_progress(
            operation_with_progress_updates(steps=10, step_time=0.5),
            timeout=7  # Should complete in 5s, so this won't time out
        )
        print(f"Success: {result}")
    except asyncio.TimeoutError as e:
        print(f"Timed out: {e}")
  
    print("\n---\n")
  
    try:
        # This should time out
        result = await run_with_timeout_and_progress(
            operation_with_progress_updates(steps=10, step_time=0.5),
            timeout=3  # Should take 5s, so this will time out
        )
        print(f"Success: {result}")
    except asyncio.TimeoutError as e:
        print(f"Timed out: {e}")

asyncio.run(main())
```

This custom pattern provides detailed progress monitoring during the timeout period, giving more insight into the operation's status.

### Exponential Backoff with Timeouts

For retrying operations, we can combine timeouts with exponential backoff:

```python
import asyncio
import random

async def unreliable_operation():
    # Simulate an unreliable operation that sometimes fails or hangs
    if random.random() < 0.3:
        print("Operation failed immediately")
        raise RuntimeError("Operation failed")
  
    if random.random() < 0.5:
        # Simulate a hanging operation
        print("Operation hanging...")
        await asyncio.sleep(10)
        return "This won't be reached due to timeout"
  
    # Simulate successful operation
    await asyncio.sleep(0.5)
    print("Operation succeeded")
    return "Success"

async def retry_with_backoff(operation, max_retries=5, base_timeout=1):
    retries = 0
    last_exception = None
  
    while retries <= max_retries:
        # Calculate timeout with exponential backoff
        timeout = base_timeout * (2 ** retries)
      
        try:
            print(f"Attempt {retries + 1} with timeout {timeout:.1f}s")
          
            # Try the operation with timeout
            return await asyncio.wait_for(operation(), timeout=timeout)
      
        except asyncio.TimeoutError:
            print(f"Timeout on attempt {retries + 1}")
            last_exception = asyncio.TimeoutError(f"Operation timed out after {timeout}s")
      
        except Exception as e:
            print(f"Error on attempt {retries + 1}: {e}")
            last_exception = e
      
        # Increment retry counter
        retries += 1
      
        # Add jitter to avoid thundering herd
        jitter = random.uniform(0, 0.5 * timeout)
        await asyncio.sleep(timeout / 2 + jitter)
  
    # If we get here, all retries failed
    raise last_exception

async def main():
    try:
        result = await retry_with_backoff(unreliable_operation)
        print(f"Final result: {result}")
    except Exception as e:
        print(f"All retries failed: {e}")

asyncio.run(main())
```

This pattern combines timeouts with exponential backoff and jitter, providing a robust mechanism for retrying unreliable operations.

## Timeouts and Waiting in Task Groups

Python 3.11 introduced TaskGroup, which provides structured concurrency with implicit cancellation. Here's how to combine it with timeouts:

```python
import asyncio

async def worker(name, duration):
    try:
        print(f"{name} starting")
        await asyncio.sleep(duration)
        print(f"{name} completed")
        return f"{name} result"
    except asyncio.CancelledError:
        print(f"{name} was cancelled")
        raise

async def main_with_taskgroup():
    try:
        # Set an overall timeout
        async with asyncio.timeout(2):
            # Create a task group
            async with asyncio.TaskGroup() as tg:
                task1 = tg.create_task(worker("Task 1", 1))
                task2 = tg.create_task(worker("Task 2", 3))
                task3 = tg.create_task(worker("Task 3", 5))
              
                print("All tasks started")
      
        print("All tasks completed or cancelled")
    except asyncio.TimeoutError:
        print("Operation timed out, all tasks were cancelled")
  
    # Check results of completed tasks
    for task in [task1, task2, task3]:
        if not task.cancelled():
            try:
                result = task.result()
                print(f"Got result: {result}")
            except Exception as e:
                print(f"Task raised: {e}")

# For Python 3.11+
# asyncio.run(main_with_taskgroup())
```

This example shows how TaskGroup automatically handles cancellation propagation when a timeout occurs, making it easier to write clean code with proper resource management.

## Common Pitfalls and Best Practices

Based on our deep dive into timeouts and waiting, here are some common pitfalls to avoid and best practices to follow:

### Pitfall 1: Not Handling Cancellation

When a timeout occurs, the awaitable is cancelled. If you don't handle cancellation properly, resources might not be cleaned up:

```python
# BAD: Resources might not be cleaned up on timeout
async def bad_resource_handling():
    resource = await acquire_resource()
  
    # If timeout occurs during use_resource, release won't happen
    result = await use_resource(resource)
  
    await release_resource(resource)
    return result

# GOOD: Ensure resources are cleaned up on timeout
async def good_resource_handling():
    resource = await acquire_resource()
    try:
        result = await use_resource(resource)
        return result
    finally:
        # This will run even if a timeout cancels the operation
        await release_resource(resource)
```

Always use `try/finally` to ensure proper resource cleanup, even if timeouts cause cancellation.

### Pitfall 2: Ignoring Cancel Signals

If your code catches and ignores `CancelledError` without re-raising it, it can lead to "zombie tasks" that keep running despite timeouts:

```python
# BAD: Ignoring cancellation
async def bad_cancellation_handling():
    try:
        while True:
            await asyncio.sleep(1)
            print("Still running...")
    except asyncio.CancelledError:
        print("Cancelled, but ignoring it!")
        # Not re-raising, so the task keeps running
        while True:
            await asyncio.sleep(1)
            print("Zombie task!")

# GOOD: Properly acknowledging cancellation
async def good_cancellation_handling():
    try:
        while True:
            await asyncio.sleep(1)
            print("Still running...")
    except asyncio.CancelledError:
        print("Cancelled, cleaning up...")
        # Do cleanup here
        raise  # Re-raise to acknowledge cancellation
```

Always re-raise `CancelledError` after handling it to properly acknowledge cancellation.

### Pitfall 3: Deadlocks from Incorrectly Nested Timeouts

Nested timeouts can lead to confusion or deadlocks if not managed carefully:

```python
# BAD: Confusing timeout behavior
async def confusing_nested_timeouts():
    try:
        # Outer timeout
        async with asyncio.timeout(5):
            # Inner timeout (longer than outer)
            async with asyncio.timeout(10):
                await asyncio.sleep(7)
    except asyncio.TimeoutError:
        print("Which timeout was triggered?")

# GOOD: Clear timeout nesting
async def clear_nested_timeouts():
    try:
        # Outer timeout
        async with asyncio.timeout(5) as outer_timeout:
            try:
                # Inner timeout (shorter than outer)
                async with asyncio.timeout(2) as inner_timeout:
                    await asyncio.sleep(3)
            except asyncio.TimeoutError:
                print("Inner timeout triggered after 2s")
    except asyncio.TimeoutError:
        print("Outer timeout triggered after 5s")
```

When nesting timeouts, make the inner timeout shorter than the outer timeout for clear, predictable behavior.

### Best Practice 1: Choose the Right Level of Granularity

Apply timeouts at the right level of granularity for your application:

```python
# Fine-grained timeouts
async def fine_grained_approach():
    try:
        data = await asyncio.wait_for(fetch_data(), timeout=5)
        processed = await asyncio.wait_for(process_data(data), timeout=10)
        return await asyncio.wait_for(store_result(processed), timeout=3)
    except asyncio.TimeoutError as e:
        # Hard to know which operation timed out
        print(f"Some operation timed out: {e}")

# Balanced approach
async def balanced_approach():
    try:
        # Fetch with timeout
        data = await asyncio.wait_for(fetch_data(), timeout=5)
    except asyncio.TimeoutError:
        print("Fetch timed out")
        return None
  
    try:
        # Process and store with a combined timeout
        async with asyncio.timeout(13):
            processed = await process_data(data)
            return await store_result(processed)
    except asyncio.TimeoutError:
        print("Processing or storing timed out")
        return None
```

Find the right balance between too many fine-grained timeouts and too few coarse-grained ones.

### Best Practice 2: Set Realistic Timeouts

Timeouts should be based on realistic expectations of how long operations should take:

```python
import time

async def set_realistic_timeouts(api_url):
    # Calculate timeout based on historical performance
    avg_response_time = get_average_response_time(api_url)
  
    # Set timeout to average + 3 standard deviations
    std_dev = get_response_time_std_dev(api_url)
    timeout = avg_response_time + (3 * std_dev)
  
    # Add buffer for network jitter
    timeout += 1
  
    # Ensure minimum and maximum bounds
    timeout = max(timeout, 1)  # At least 1 second
    timeout = min(timeout, 30)  # At most 30 seconds
  
    print(f"Setting timeout of {timeout:.2f}s for {api_url}")
  
    try:
        return await asyncio.wait_for(fetch_from_api(api_url), timeout=timeout)
    except asyncio.TimeoutError:
        print(f"Request to {api_url} timed out after {timeout:.2f}s")
        return None

# Simulation of these functions
def get_average_response_time(url):
    # In a real system, this would fetch from monitoring data
    return 0.5 if "fast" in url else 2.5


def get_average_response_time(url):
    # In a real system, this would fetch from monitoring data
    return 0.5 if "fast" in url else 2.5

def get_response_time_std_dev(url):
    # In a real system, this would be calculated from actual data
    return 0.2 if "stable" in url else 0.8

async def fetch_from_api(url):
    # Simulate network request with variable time
    base_time = 0.3 if "fast" in url else 1.5
    jitter = 0.5 if "unstable" in url else 0.2
    await asyncio.sleep(base_time + (random.random() * jitter))
    return {"data": "result"}

async def main():
    urls = [
        "https://fast-stable-api.example.com/data",
        "https://fast-unstable-api.example.com/data",
        "https://slow-stable-api.example.com/data",
        "https://slow-unstable-api.example.com/data"
    ]
    
    for url in urls:
        result = await set_realistic_timeouts(url)
        print(f"Result for {url}: {result is not None}\n")

# asyncio.run(main())
```

This pattern adjusts timeouts based on actual performance data, making them more realistic and adaptive to changing conditions. Smart timeout strategies consider:

1. Historical performance of the system
2. Variability in response times
3. Network conditions and jitter
4. The criticality of the operation
5. Available fallback options

### Best Practice 3: Add Monitoring and Logging for Timeouts

Timeouts are important signals about system performance and should be monitored:

```python
import asyncio
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('timeout_monitor')

async def monitored_operation(operation_name, coro, timeout):
    start_time = time.time()
    operation_id = f"{operation_name}-{int(start_time * 1000)}"
    
    logger.info(f"Starting {operation_name} (ID: {operation_id}) with timeout {timeout}s")
    
    try:
        # Run with timeout
        result = await asyncio.wait_for(coro, timeout=timeout)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log success with timing information
        logger.info(f"Completed {operation_name} (ID: {operation_id}) in {duration:.3f}s")
        
        # Warning if it took more than 80% of the timeout
        if duration > timeout * 0.8:
            logger.warning(f"{operation_name} (ID: {operation_id}) took {duration:.3f}s, which is over 80% of timeout ({timeout}s)")
        
        return result
    
    except asyncio.TimeoutError:
        # Calculate duration at timeout
        duration = time.time() - start_time
        
        # Log timeout with details
        logger.error(f"Timeout in {operation_name} (ID: {operation_id}) after {duration:.3f}s (limit: {timeout}s)")
        
        # In a real system, increment a metric counter for monitoring
        # timeout_counter.increment(operation_name)
        
        raise

async def demo_operation(name, duration):
    await asyncio.sleep(duration)
    return f"Result from {name}"

async def main():
    # Successful operation
    try:
        result = await monitored_operation("fast_operation", demo_operation("fast", 1), timeout=2)
        print(f"Fast operation result: {result}")
    except asyncio.TimeoutError:
        print("Fast operation timed out (shouldn't happen)")
    
    # Operation that takes more than 80% of the timeout
    try:
        result = await monitored_operation("close_operation", demo_operation("close", 1.7), timeout=2)
        print(f"Close operation result: {result}")
    except asyncio.TimeoutError:
        print("Close operation timed out (shouldn't happen)")
    
    # Operation that times out
    try:
        result = await monitored_operation("slow_operation", demo_operation("slow", 3), timeout=2)
        print(f"Slow operation result: {result}")
    except asyncio.TimeoutError:
        print("Slow operation timed out (expected)")

asyncio.run(main())
```

This pattern provides detailed monitoring of timed operations, helping to identify performance issues before they become critical. Good timeout monitoring includes:

1. Logging both successful completions and timeouts
2. Recording timing information even for successful operations
3. Warning about operations that come close to timing out
4. Tracking timeout patterns over time
5. Adjusting timeouts based on observed performance

## Advanced Waiting Patterns

Beyond simple timeouts, asyncio supports more sophisticated waiting patterns:

### Event-Based Waiting

Sometimes we need to wait for a specific event rather than a fixed time:

```python
import asyncio

async def wait_for_event():
    # Create an event
    event = asyncio.Event()
    
    # Start a background task to set the event
    asyncio.create_task(set_event_after_delay(event, 3))
    
    print("Waiting for event...")
    
    # Wait for the event with a timeout
    try:
        await asyncio.wait_for(event.wait(), timeout=5)
        print("Event was set!")
    except asyncio.TimeoutError:
        print("Timed out waiting for event")

async def set_event_after_delay(event, delay):
    await asyncio.sleep(delay)
    print(f"Setting event after {delay}s")
    event.set()

asyncio.run(wait_for_event())
```

Events provide a flexible way to coordinate between tasks without fixed timeouts. They're ideal when the timing depends on the completion of other operations rather than wall-clock time.

### Condition-Based Waiting

For more complex coordination, we can use Conditions:

```python
import asyncio

async def wait_for_condition(condition, predicate):
    async with condition:
        # Wait until the predicate is true
        await condition.wait_for(predicate)
        print("Condition is now true")

async def update_state_periodically(condition, shared_state):
    for i in range(5):
        # Simulate work
        await asyncio.sleep(1)
        
        # Update shared state
        async with condition:
            shared_state["count"] += 1
            print(f"Updated count to {shared_state['count']}")
            
            # Notify waiters
            condition.notify_all()

async def main():
    # Shared state
    shared_state = {"count": 0}
    
    # Condition for coordinating
    condition = asyncio.Condition()
    
    # Create tasks
    waiter1 = asyncio.create_task(
        wait_for_condition(condition, lambda: shared_state["count"] >= 2)
    )
    waiter2 = asyncio.create_task(
        wait_for_condition(condition, lambda: shared_state["count"] >= 4)
    )
    updater = asyncio.create_task(
        update_state_periodically(condition, shared_state)
    )
    
    # Wait for all tasks
    await asyncio.gather(waiter1, waiter2, updater)

asyncio.run(main())
```

Conditions allow tasks to wait until a specific state is reached, rather than waiting for a fixed time or a simple event. This is useful for complex coordination between tasks.

### Waiting for First Result with Timeout

Sometimes we want to wait for the first of several operations to complete, with a timeout:

```python
import asyncio
import random

async def fetch_with_random_delay(url):
    # Simulate a request with random delay
    delay = random.uniform(1, 5)
    print(f"Fetching {url} (will take {delay:.1f}s)")
    await asyncio.sleep(delay)
    return f"Result from {url}"

async def fetch_from_fastest_source(urls, timeout=3):
    # Create tasks for all URLs
    tasks = [asyncio.create_task(fetch_with_random_delay(url)) for url in urls]
    
    try:
        # Wait for the first task to complete or timeout
        done, pending = await asyncio.wait(
            tasks, 
            timeout=timeout,
            return_when=asyncio.FIRST_COMPLETED
        )
        
        # Cancel pending tasks
        for task in pending:
            task.cancel()
        
        # Check if any task completed
        if done:
            # Get result from the first completed task
            first_completed = done.pop()
            result = await first_completed
            print(f"Got result from fastest source: {result}")
            return result
        else:
            # Timeout with no completions
            print(f"All sources timed out after {timeout}s")
            return None
            
    finally:
        # Ensure all pending tasks are properly cancelled
        for task in tasks:
            if not task.done():
                task.cancel()
        
        # Wait for cancellations to complete
        await asyncio.gather(*tasks, return_exceptions=True)

async def main():
    urls = [
        "https://api1.example.com/data",
        "https://api2.example.com/data",
        "https://api3.example.com/data",
    ]
    
    result = await fetch_from_fastest_source(urls, timeout=2.5)
    if result:
        print(f"Final result: {result}")
    else:
        print("No result received in time")

asyncio.run(main())
```

This pattern combines both waiting for the first result and a timeout, allowing us to get the fastest response while not waiting too long. It's useful for:

1. Redundant requests to improve reliability
2. Multi-region deployments where the fastest region can vary
3. Competitive requests to different services that provide similar functionality

### Staggered Timeouts for Graceful Degradation

For complex operations, we can implement staggered timeouts to gracefully degrade functionality:

```python
import asyncio
import time

async def fetch_full_data(product_id):
    # Simulate a comprehensive data fetch
    print("Fetching full product data...")
    await asyncio.sleep(3)
    return {
        "id": product_id,
        "name": "Deluxe Widget",
        "price": 49.99,
        "description": "A high-quality widget with many features",
        "specifications": {"weight": "1.2kg", "dimensions": "10x15x2cm"},
        "reviews": ["Great product!", "Works well", "Highly recommended"],
        "related_items": [101, 102, 103]
    }

async def fetch_basic_data(product_id):
    # Simulate a faster, basic data fetch
    print("Fetching basic product data...")
    await asyncio.sleep(1)
    return {
        "id": product_id,
        "name": "Deluxe Widget",
        "price": 49.99,
        "description": "A high-quality widget with many features"
    }

async def fetch_minimal_data(product_id):
    # Simulate a very fast, minimal data fetch
    print("Fetching minimal product data...")
    await asyncio.sleep(0.2)
    return {
        "id": product_id,
        "name": "Deluxe Widget",
        "price": 49.99
    }

async def get_product_with_graceful_degradation(product_id, max_wait=2):
    start_time = time.time()
    result = None
    
    # Try to get the full data within the max wait time
    try:
        full_data_task = asyncio.create_task(fetch_full_data(product_id))
        result = await asyncio.wait_for(full_data_task, timeout=max_wait)
        print("Using full data")
        return result
    except asyncio.TimeoutError:
        print("Full data timed out")
        # Continue with degraded options
    
    # Calculate remaining time
    elapsed = time.time() - start_time
    remaining = max(0, max_wait - elapsed)
    
    # Try to get basic data with remaining time
    if remaining > 0.5:  # Only if we have enough time for basic data
        try:
            basic_data_task = asyncio.create_task(fetch_basic_data(product_id))
            result = await asyncio.wait_for(basic_data_task, timeout=remaining)
            print("Using basic data")
            return result
        except asyncio.TimeoutError:
            print("Basic data timed out")
    else:
        print("Not enough time for basic data")
    
    # Calculate remaining time again
    elapsed = time.time() - start_time
    remaining = max(0, max_wait - elapsed)
    
    # Fall back to minimal data with any remaining time
    if remaining > 0:
        try:
            minimal_data_task = asyncio.create_task(fetch_minimal_data(product_id))
            result = await asyncio.wait_for(minimal_data_task, timeout=remaining)
            print("Using minimal data")
            return result
        except asyncio.TimeoutError:
            print("Minimal data timed out")
    
    # If everything timed out, return an error placeholder
    if result is None:
        print("All data fetches timed out")
        return {"id": product_id, "error": "Data unavailable"}

async def main():
    for max_wait in [0.5, 1.5, 3.5]:
        print(f"\nTrying with max_wait={max_wait}s")
        result = await get_product_with_graceful_degradation(100, max_wait=max_wait)
        print(f"Final result: {result}")

asyncio.run(main())
```

This pattern provides graceful degradation of functionality based on available time, ensuring that users get at least some data rather than nothing at all. It's particularly useful for:

1. User-facing applications where responsiveness is critical
2. Systems that can provide different levels of detail based on available time
3. High-availability services that must provide some response within SLA limits

## Time and Timing in Asyncio Tasks

Understanding how time works in asyncio is essential for effective timeout and waiting implementations:

### Task Timing and Profiling

We can measure and profile the execution time of asyncio tasks:

```python
import asyncio
import time
import functools

def async_timed():
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            print(f"Starting {func.__name__} with args {args}, kwargs {kwargs}")
            start = time.time()
            try:
                return await func(*args, **kwargs)
            finally:
                end = time.time()
                elapsed = end - start
                print(f"{func.__name__} completed in {elapsed:.4f} seconds")
        return wrapper
    return decorator

@async_timed()
async def fetch_data(delay):
    await asyncio.sleep(delay)
    return {"data": "result"}

@async_timed()
async def process_data(data, delay):
    await asyncio.sleep(delay)
    return {"processed": data["data"]}

@async_timed()
async def complex_operation():
    data = await fetch_data(1.0)
    result = await process_data(data, 0.5)
    return result

asyncio.run(complex_operation())
```

This timing decorator helps us understand the performance characteristics of our async code, which is essential for setting appropriate timeouts. By measuring actual execution times, we can:

1. Set realistic timeouts based on observed performance
2. Identify bottlenecks in our asynchronous operations
3. Monitor changes in performance over time
4. Make data-driven decisions about timeout strategies

### The Event Loop's Time Function

Asyncio's event loop provides a monotonic time function that's more reliable than `time.time()` for measuring durations:

```python
import asyncio
import time

async def compare_time_functions():
    # Get the event loop
    loop = asyncio.get_running_loop()
    
    # Record starting times
    system_start = time.time()
    monotonic_start = time.monotonic()
    loop_start = loop.time()
    
    print(f"System time: {system_start}")
    print(f"Monotonic time: {monotonic_start}")
    print(f"Loop time: {loop_start}")
    
    # Sleep for a bit
    await asyncio.sleep(1)
    
    # Record ending times
    system_end = time.time()
    monotonic_end = time.monotonic()
    loop_end = loop.time()
    
    # Calculate elapsed times
    system_elapsed = system_end - system_start
    monotonic_elapsed = monotonic_end - monotonic_start
    loop_elapsed = loop_end - loop_start
    
    print(f"System elapsed: {system_elapsed:.6f}s")
    print(f"Monotonic elapsed: {monotonic_elapsed:.6f}s")
    print(f"Loop elapsed: {loop_elapsed:.6f}s")

asyncio.run(compare_time_functions())
```

The event loop's `time()` function provides a monotonic clock that is immune to system clock adjustments, making it more reliable for measuring durations in asyncio applications. When implementing custom timeout mechanisms, using `loop.time()` is generally preferable to `time.time()`.

## Real-World Scenarios for Timeouts and Waiting

Let's explore some comprehensive real-world scenarios where timeouts and waiting are critical:

### Distributed System Health Checks

In a microservices architecture, health checks with appropriate timeouts are essential:

```python
import asyncio
import random

class ServiceHealthCheck:
    def __init__(self, service_name, endpoint, timeout=2.0, degraded_threshold=500):
        self.service_name = service_name
        self.endpoint = endpoint
        self.timeout = timeout
        self.degraded_threshold = degraded_threshold  # ms
    
    async def check_health(self):
        try:
            # Simulate health check request with timeout
            start_time = asyncio.get_running_loop().time()
            response = await asyncio.wait_for(self._make_request(), timeout=self.timeout)
            duration_ms = (asyncio.get_running_loop().time() - start_time) * 1000
            
            # Check if the service is degraded based on response time
            if duration_ms > self.degraded_threshold:
                return {
                    "service": self.service_name,
                    "status": "degraded",
                    "response_time_ms": duration_ms,
                    "message": f"Response time ({duration_ms:.1f}ms) exceeds threshold ({self.degraded_threshold}ms)"
                }
            
            # Check response status
            if response.get("status") == "ok":
                return {
                    "service": self.service_name,
                    "status": "healthy",
                    "response_time_ms": duration_ms,
                    "message": "Service is responding normally"
                }
            else:
                return {
                    "service": self.service_name,
                    "status": "unhealthy",
                    "response_time_ms": duration_ms,
                    "message": f"Service reported non-ok status: {response.get('status', 'unknown')}"
                }
        
        except asyncio.TimeoutError:
            return {
                "service": self.service_name,
                "status": "unhealthy",
                "response_time_ms": self.timeout * 1000,
                "message": f"Health check timed out after {self.timeout}s"
            }
        except Exception as e:
            return {
                "service": self.service_name,
                "status": "unhealthy",
                "response_time_ms": None,
                "message": f"Health check failed: {str(e)}"
            }
    
    async def _make_request(self):
        # Simulate request to health check endpoint
        # In a real system, this would use aiohttp or similar
        await asyncio.sleep(random.choice([
            0.1,  # Fast response
            0.6,  # Degraded response
            2.5   # Would time out
        ]))
        
        # Simulate occasional errors
        if random.random() < 0.2:
            return {"status": "error", "message": "Internal server error"}
        
        return {"status": "ok", "version": "1.0.3"}

async def check_system_health(services):
    # Run all health checks concurrently
    health_checks = [service.check_health() for service in services]
    results = await asyncio.gather(*health_checks)
    
    # Analyze overall system health
    system_status = "healthy"
    unhealthy_services = []
    degraded_services = []
    
    for result in results:
        if result["status"] == "unhealthy":
            system_status = "unhealthy"
            unhealthy_services.append(result["service"])
        elif result["status"] == "degraded":
            if system_status == "healthy":
                system_status = "degraded"
            degraded_services.append(result["service"])
    
    return {
        "system_status": system_status,
        "timestamp": time.time(),
        "unhealthy_services": unhealthy_services,
        "degraded_services": degraded_services,
        "service_details": results
    }

async def main():
    # Define services to check
    services = [
        ServiceHealthCheck("auth-service", "https://auth.example.com/health", timeout=1.0),
        ServiceHealthCheck("payment-service", "https://payment.example.com/health", timeout=2.0),
        ServiceHealthCheck("inventory-service", "https://inventory.example.com/health", timeout=1.5),
        ServiceHealthCheck("notification-service", "https://notification.example.com/health", timeout=1.0)
    ]
    
    # Check system health
    health_report = await check_system_health(services)
    
    # Print summary
    print(f"System Status: {health_report['system_status']}")
    
    if health_report["unhealthy_services"]:
        print(f"Unhealthy Services: {', '.join(health_report['unhealthy_services'])}")
    
    if health_report["degraded_services"]:
        print(f"Degraded Services: {', '.join(health_report['degraded_services'])}")
    
    # Print details
    print("\nService Details:")
    for service in health_report["service_details"]:
        print(f"  {service['service']}: {service['status']} - {service['message']}")
        if service["response_time_ms"] is not None:
            print(f"    Response Time: {service['response_time_ms']:.1f}ms")

asyncio.run(main())
```

This example demonstrates a comprehensive health check system with timeouts, showing how to:

1. Set appropriate timeouts for different services
2. Distinguish between slow (degraded) and failed (unhealthy) services
3. Run checks concurrently for efficiency
4. Aggregate results for system-wide status reporting

### Web API with Tiered Caching and Timeouts

This example shows a web API with multiple cache layers and appropriate timeouts:

```python
import asyncio
import random
import json

class CacheTier:
    def __init__(self, name, typical_latency, hit_rate=0.8):
        self.name = name
        self.typical_latency = typical_latency
        self.hit_rate = hit_rate
        self._cache = {}  # Simplified cache implementation
    
    async def get(self, key):
        # Simulate cache lookup with typical latency
        await asyncio.sleep(self.typical_latency * random.uniform(0.8, 1.2))
        
        # Simulate cache hit/miss based on hit rate
        if key in self._cache and random.random() < self.hit_rate:
            print(f"Cache HIT in {self.name} for {key}")
            return self._cache[key]
        
        print(f"Cache MISS in {self.name} for {key}")
        return None
    
    async def set(self, key, value, ttl=None):
        # Simulate cache write with latency
        await asyncio.sleep(self.typical_latency * random.uniform(0.5, 1.0))
        self._cache[key] = value
        print(f"Cached in {self.name}: {key}")

class DataAPI:
    def __init__(self):
        # Setup cache tiers from fastest to slowest
        self.l1_cache = CacheTier("L1-Memory", 0.001, hit_rate=0.7)   # In-memory cache, very fast
        self.l2_cache = CacheTier("L2-Redis", 0.03, hit_rate=0.8)     # Redis cache, fast
        self.l3_cache = CacheTier("L3-Disk", 0.2, hit_rate=0.9)       # Disk cache, medium
        
        # Timeouts for each layer
        self.l1_timeout = 0.01
        self.l2_timeout = 0.1
        self.l3_timeout = 0.5
        self.db_timeout = 2.0
    
    async def get_data(self, key):
        start_time = asyncio.get_running_loop().time()
        
        # Try L1 cache with short timeout
        try:
            l1_result = await asyncio.wait_for(
                self.l1_cache.get(key),
                timeout=self.l1_timeout
            )
            if l1_result:
                return l1_result
        except asyncio.TimeoutError:
            print(f"L1 cache timed out for {key}")
        
        # Try L2 cache with short timeout
        try:
            l2_result = await asyncio.wait_for(
                self.l2_cache.get(key),
                timeout=self.l2_timeout
            )
            if l2_result:
                # Cache up to L1 asynchronously without blocking
                asyncio.create_task(self.l1_cache.set(key, l2_result))
                return l2_result
        except asyncio.TimeoutError:
            print(f"L2 cache timed out for {key}")
        
        # Try L3 cache with medium timeout
        try:
            l3_result = await asyncio.wait_for(
                self.l3_cache.get(key),
                timeout=self.l3_timeout
            )
            if l3_result:
                # Cache up to L1 and L2 asynchronously
                asyncio.create_task(self.l1_cache.set(key, l3_result))
                asyncio.create_task(self.l2_cache.set(key, l3_result))
                return l3_result
        except asyncio.TimeoutError:
            print(f"L3 cache timed out for {key}")
        
        # Try database with longer timeout
        try:
            db_result = await asyncio.wait_for(
                self._fetch_from_database(key),
                timeout=self.db_timeout
            )
            
            # Cache in all layers asynchronously
            asyncio.create_task(self.l1_cache.set(key, db_result))
            asyncio.create_task(self.l2_cache.set(key, db_result))
            asyncio.create_task(self.l3_cache.set(key, db_result))
            
            return db_result
        except asyncio.TimeoutError:
            print(f"Database timed out for {key}")
            
            # Return partial or stale data if available
            stale_data = await self._get_stale_data(key)
            if stale_data:
                return {**stale_data, "stale": True}
        
        # If all else fails, return a service unavailable response
        elapsed = asyncio.get_running_loop().time() - start_time
        return {
            "error": "Service temporarily unavailable",
            "elapsed_ms": elapsed * 1000
        }
    
    async def _fetch_from_database(self, key):
        # Simulate database query with variable latency
        print(f"Querying database for {key}")
        await asyncio.sleep(random.uniform(0.5, 2.5))
        
        # Simulate database result
        return {
            "id": key,
            "name": f"Item {key}",
            "description": f"Description for item {key}",
            "price": round(random.uniform(10, 100), 2),
            "timestamp": time.time()
        }
    
    async def _get_stale_data(self, key):
        # Try to get any available data, even if stale
        print(f"Looking for any stale data for {key}")
        
        # Try caches without timeouts
        for cache in [self.l1_cache, self.l2_cache, self.l3_cache]:
            try:
                result = await cache.get(key)
                if result:
                    print(f"Found stale data in {cache.name}")
                    return result
            except Exception:
                pass
        
        return None

async def main():
    api = DataAPI()
    
    # Try getting some data
    keys = ["product-123", "product-456", "product-789"]
    
    for key in keys:
        print(f"\nFetching {key}...")
        result = await api.get_data(key)
        print(f"Result for {key}: {json.dumps(result, indent=2)}")
        
        # Simulate a second request that might hit cache
        print(f"\nFetching {key} again...")
        result = await api.get_data(key)
        print(f"Result for {key} (second request): {json.dumps(result, indent=2)}")

asyncio.run(main())
```

This example demonstrates a sophisticated approach to timeouts in a multi-tiered caching system, showing how to:

1. Set appropriate timeouts for different cache layers
2. Fall back gracefully to slower caches when faster ones time out
3. Populate caches asynchronously without blocking the response
4. Return stale data when all fresh data options time out
5. Provide appropriate error responses when all options fail

## Conclusion

Timeouts and waiting mechanisms are fundamental to building robust asynchronous applications. They help manage the flow of time in your program, ensuring that operations complete within expected timeframes and preventing resources from being tied up indefinitely.

From our deep exploration, we've learned:

1. **Fundamental waiting mechanisms** in asyncio, from simple `sleep()` to complex conditional waiting
2. **Core timeout functions** like `wait_for()`, `wait()`, and the context manager `timeout()`
3. **Advanced patterns** for handling timeouts with fallbacks, retries, and graceful degradation
4. **Best practices** for setting realistic timeouts, proper cancellation handling, and resource cleanup
5. **Real-world scenarios** demonstrating how timeouts integrate into complex systems

Effective timeout management is about balancing responsiveness with reliability. By understanding the principles and patterns we've explored, you can build asyncio applications that respond quickly, handle failures gracefully, and provide the best possible experience to users even when faced with unexpected delays or failures.

Remember that timeouts aren't just error handling mechanisms—they're essential tools for building systems that respect time constraints and deliver consistent performance. By approaching timeouts and waiting as first-class concerns in your design, you'll create more resilient, user-friendly asyncio applications.