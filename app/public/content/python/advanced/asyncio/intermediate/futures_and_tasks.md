# Futures and Their Relationship to Tasks in Python asyncio

## First Principles: What is a Future?

At its most fundamental level, a Future in asyncio represents a "promise" of a result that will be available at some point in the future. It's a low-level building block for asynchronous programming that serves as a placeholder for a result that hasn't been computed yet.

To understand Futures properly, we need to start from first principles:

1. **Promise of a result** : A Future is essentially a container that will eventually hold either a result or an exception.
2. **State machine** : A Future maintains a state that can be:

* Pending: The operation hasn't completed yet
* Done: The operation has completed (with a result or exception)
* Cancelled: The operation was cancelled before completion

1. **Awaitable interface** : Futures implement the awaitable protocol, which means you can use them with the `await` keyword.
2. **Callback registration** : Futures allow you to register callbacks that will be called when the Future is done.

## Creating and Using Futures

Unlike Tasks, which are typically created from coroutines, Futures are usually created by low-level code or libraries. Most application code doesn't need to create Futures directly. Here's how you might work with them:

```python
import asyncio

async def main():
    # Create a Future
    future = asyncio.Future()
  
    # Set a result later (often done in another coroutine or callback)
    asyncio.create_task(set_future_result(future, "Hello from Future!"))
  
    # Await the Future's result
    result = await future
    print(result)  # "Hello from Future!"

async def set_future_result(future, result, delay=1):
    await asyncio.sleep(delay)  # Simulate some work
    future.set_result(result)  # Resolve the Future
```

In this example, we:

1. Create a Future manually
2. Start a task that will set the Future's result after a delay
3. Await the Future to get its result when it's ready

## The Future Interface

Futures provide several important methods and properties:

```python
async def future_interface_example():
    future = asyncio.Future()
  
    print(future.done())      # False - the Future is pending
    print(future.cancelled()) # False - the Future hasn't been cancelled
  
    # Set a result
    future.set_result("Success!")
  
    print(future.done())      # True - the Future is now done
    print(future.result())    # "Success!" - get the result (would raise if not done)
  
    # Create another Future
    another_future = asyncio.Future()
  
    # Register a callback to be called when the Future is done
    another_future.add_done_callback(lambda f: print(f"Future completed with: {f.result()}"))
  
    # Set the result, which will trigger the callback
    another_future.set_result("Another success!")
```

The key methods of a Future are:

* `set_result(result)`: Sets the Future's result, marking it as done
* `set_exception(exception)`: Sets an exception as the Future's result
* `result()`: Gets the result (raises if not done)
* `exception()`: Gets the exception (if any)
* `add_done_callback(callback)`: Adds a callback to be called when done
* `remove_done_callback(callback)`: Removes a previously added callback
* `cancel()`: Cancels the Future

## Relationship Between Futures and Tasks

Here's where things get really interesting. In asyncio, there's an intimate relationship between Futures and Tasks:

**A Task is a subclass of Future**

This means that every Task is also a Future, but with additional functionality. To understand this relationship in depth:

```python
import asyncio
import inspect

async def explore_task_future_relationship():
    # Create a coroutine
    async def coro():
        await asyncio.sleep(1)
        return "Coroutine completed"
  
    # Create a Task from the coroutine
    task = asyncio.create_task(coro())
  
    # Check inheritance
    print(f"Task inherits from Future: {isinstance(task, asyncio.Future)}")  # True
    print(f"Task's MRO: {inspect.getmro(type(task))}")  # Shows inheritance chain
  
    # We can use task as a Future
    task.add_done_callback(lambda f: print(f"Callback: {f.result()}"))
  
    # Wait for completion
    result = await task
    print(f"Awaited result: {result}")
```

When you run this, you'll see that a Task is indeed a type of Future, which means:

1. Tasks inherit all Future methods and behaviors
2. You can use a Task anywhere a Future is expected
3. Tasks add functionality specific to managing coroutines

### Key Differences Between Tasks and Futures

While a Task is a Future, they have important differences:

1. **Creation and resolution** :

* Futures are typically created empty and resolved manually with `set_result()` or `set_exception()`
* Tasks are created from coroutines and their results are automatically set when the coroutine completes

1. **Execution management** :

* Futures don't manage execution - they're just containers for results
* Tasks actively manage coroutine execution on the event loop

1. **Cancellation behavior** :

* When a Future is cancelled, it's simply marked as cancelled
* When a Task is cancelled, it injects a CancelledError into the coroutine

Let's explore these differences with an example:

```python
async def future_vs_task():
    # Create a Future
    future = asyncio.Future()
  
    # Create a coroutine
    async def coro():
        try:
            await asyncio.sleep(2)
            return "Coroutine result"
        except asyncio.CancelledError:
            print("Coroutine was cancelled")
            raise
  
    # Create a Task from the coroutine
    task = asyncio.create_task(coro())
  
    # Set Future result manually after delay
    asyncio.create_task(set_after_delay(future, "Future result", 1))
  
    # Cancel the Task after a delay
    asyncio.create_task(cancel_after_delay(task, 0.5))
  
    # Wait for both with exception handling
    try:
        future_result = await future
        print(f"Future completed with: {future_result}")
    except asyncio.CancelledError:
        print("Future was cancelled")
  
    try:
        task_result = await task
        print(f"Task completed with: {task_result}")
    except asyncio.CancelledError:
        print("Task was cancelled")

async def set_after_delay(future, result, delay):
    await asyncio.sleep(delay)
    future.set_result(result)

async def cancel_after_delay(awaitable, delay):
    await asyncio.sleep(delay)
    awaitable.cancel()
```

Output:

```
Coroutine was cancelled
Future completed with: Future result
Task was cancelled
```

This example demonstrates:

* The Future is manually resolved with `set_result()`
* The Task automatically resolves when its coroutine completes
* When cancelled, the Task actually injects a CancelledError into the coroutine, while the Future just changes state

## When to Use Futures vs. Tasks

Given their relationship, when should you use Futures versus Tasks?

### Use Tasks when:

1. You need to run a coroutine concurrently
2. You want to manage coroutine execution (start, monitor, cancel)
3. You're working at a high level in your asyncio application

Example of appropriate Task usage:

```python
async def task_based_concurrency():
    # Create multiple tasks to run concurrently
    task1 = asyncio.create_task(process_item("item1"))
    task2 = asyncio.create_task(process_item("item2"))
    task3 = asyncio.create_task(process_item("item3"))
  
    # Wait for all tasks to complete
    results = await asyncio.gather(task1, task2, task3)
    return results

async def process_item(item):
    print(f"Processing {item}")
    await asyncio.sleep(1)  # Simulate work
    return f"Processed {item}"
```

### Use Futures when:

1. You're implementing a low-level primitive or protocol
2. You need a placeholder for a result that will be set by callback-based code
3. You're interfacing with non-asyncio code that needs to signal completion to asyncio code

Example of appropriate Future usage:

```python
import asyncio
import concurrent.futures

async def run_in_thread_pool(func, *args):
    loop = asyncio.get_running_loop()
  
    # Create a Future that will be resolved when the thread completes
    future = loop.create_future()
  
    # Use a thread pool to run CPU-bound work
    with concurrent.futures.ThreadPoolExecutor() as pool:
        def callback(thread_future):
            # When the thread is done, transfer its result to our asyncio Future
            try:
                result = thread_future.result()
                loop.call_soon_threadsafe(future.set_result, result)
            except Exception as exc:
                loop.call_soon_threadsafe(future.set_exception, exc)
      
        # Submit work to thread pool
        thread_future = pool.submit(func, *args)
        thread_future.add_done_callback(callback)
  
    # Await the asyncio Future
    return await future

# Usage example
async def main():
    # A CPU-bound function to run in a thread
    def cpu_bound_work(x):
        result = 0
        for i in range(10**7):
            result += i * x
        return result
  
    # Run in thread pool while keeping event loop responsive
    result = await run_in_thread_pool(cpu_bound_work, 2)
    print(f"Result: {result}")
```

In this example, we use a Future as a bridge between the thread pool and asyncio. The Future gives us something we can `await` while the actual work happens in a separate thread.

## Futures in Event Loop Implementation

To gain an even deeper understanding, let's look at how Futures are used in the implementation of the asyncio event loop itself.

When you `await` something in asyncio, the event loop needs to know:

1. When to suspend the current coroutine
2. What conditions should resume the coroutine
3. What result to provide when resuming

Futures provide the mechanism for this coordination. Here's a simplified view of what happens:

```python
# This is an approximation of how the event loop works with Futures
async def simplified_event_loop_example():
    # When you await a Future-like object
    async def coro():
        print("Coroutine: About to await future")
        result = await some_future  # This is where the magic happens
        print(f"Coroutine: Resumed with result: {result}")
  
    # Here's approximately what the event loop does:
    some_future = asyncio.Future()
  
    # Start the coroutine
    coro_obj = coro()
    try:
        # Advance to first await
        coro_obj.send(None)
    except StopIteration:
        pass
  
    print("Event loop: Coroutine is now suspended, waiting for Future")
  
    # Future gets a result (e.g., from I/O completion callback)
    print("Event loop: Setting Future result")
    some_future.set_result("Future is done!")
  
    # Resume the coroutine with the result
    print("Event loop: Resuming coroutine")
    try:
        coro_obj.send(some_future.result())
    except StopIteration as e:
        final_result = e.value
        print(f"Event loop: Coroutine completed with result: {final_result}")
```

This example is heavily simplified, but it illustrates how Futures serve as the coordination point between the event loop and coroutines. When a coroutine awaits a Future, it's telling the event loop: "Suspend me until this Future is done, then resume me with its result."

## Futures in Thread/Process Pools

Asyncio integrates with `concurrent.futures` to allow running blocking code in thread or process pools without blocking the event loop. This integration uses Futures as the bridge:

```python
async def thread_pool_example():
    loop = asyncio.get_running_loop()
  
    with concurrent.futures.ThreadPoolExecutor() as pool:
        # The run_in_executor method creates an asyncio.Future
        # that's linked to a concurrent.futures.Future
        result = await loop.run_in_executor(
            pool,
            time_consuming_function,
            "arg1",
            "arg2"
        )
      
        print(f"Thread result: {result}")

def time_consuming_function(arg1, arg2):
    # This runs in a separate thread
    time.sleep(1)  # Blocking sleep won't block the event loop
    return f"Processed {arg1} and {arg2}"
```

Under the hood, `run_in_executor`:

1. Submits the function to the executor, getting a `concurrent.futures.Future`
2. Creates an asyncio Future that will be resolved when the executor Future completes
3. Returns the asyncio Future, which can be awaited

This pattern is extremely valuable for integrating blocking code with asyncio.

## Custom Awaitables vs. Futures

In Python, any object that implements the `__await__` method can be awaited. While Futures are the primary awaitable in asyncio, you can create custom awaitables:

```python
class CustomAwaitable:
    def __init__(self, result=None, delay=1):
        self.result = result
        self.delay = delay
  
    def __await__(self):
        # Yield control back to the event loop
        yield from asyncio.sleep(self.delay).__await__()
        # Return our result
        return self.result

async def custom_awaitable_example():
    # Can be awaited just like a Future
    result = await CustomAwaitable("Custom result", 2)
    print(result)  # "Custom result" after 2 seconds
```

The difference between a custom awaitable and a Future is that:

1. Futures have a standard interface with methods like `set_result()`, `add_done_callback()`, etc.
2. Futures are integrated with the event loop for cancellation and error handling
3. Futures can be manually resolved from anywhere, not just from within their `__await__` method

For most cases, it's better to use Futures (or Tasks) rather than creating custom awaitables, as the standard implementations provide more functionality and better integration with asyncio.

## Future Chaining and Composition

Futures can be combined and chained to create complex asynchronous workflows:

```python
async def future_composition():
    # Create several Futures
    future1 = asyncio.Future()
    future2 = asyncio.Future()
    future3 = asyncio.Future()
  
    # Setup dependencies between them
    future1.add_done_callback(
        lambda f: future2.set_result(f.result() + " -> Future 2")
    )
  
    future2.add_done_callback(
        lambda f: future3.set_result(f.result() + " -> Future 3")
    )
  
    # Start the chain
    future1.set_result("Future 1")
  
    # Wait for the end of the chain
    result = await future3
    print(result)  # "Future 1 -> Future 2 -> Future 3"
```

This pattern is useful for creating pipelines of asynchronous operations, where each step depends on the previous one.

## Error Handling with Futures

Futures propagate exceptions similarly to regular Python code:

```python
async def future_error_handling():
    # Create a Future that will fail
    future = asyncio.Future()
  
    # Set an exception instead of a result
    future.set_exception(ValueError("Something went wrong"))
  
    try:
        # Awaiting the Future raises the exception
        await future
    except ValueError as e:
        print(f"Caught exception: {e}")

    # Callbacks also receive the exception
    def callback(future):
        try:
            future.result()  # This will raise
        except Exception as e:
            print(f"Callback caught: {e}")
  
    another_future = asyncio.Future()
    another_future.add_done_callback(callback)
    another_future.set_exception(RuntimeError("Another error"))
```

When a Future has an exception set:

1. Awaiting the Future raises that exception
2. Calling `result()` raises that exception
3. The exception is accessible via `exception()`
4. Done callbacks are still called, but they need to handle the exception

## Patterns and Best Practices

### 1. Future Timeout Pattern

```python
async def future_with_timeout(future, timeout):
    try:
        return await asyncio.wait_for(future, timeout)
    except asyncio.TimeoutError:
        print(f"Future timed out after {timeout} seconds")
        # Decide if you want to cancel the original Future
        future.cancel()
        raise
```

### 2. Future Aggregation Pattern

```python
async def aggregate_futures(futures):
    # Wait for all futures to complete
    done, pending = await asyncio.wait(futures)
  
    # Collect results and exceptions
    results = []
    exceptions = []
  
    for future in done:
        try:
            results.append(future.result())
        except Exception as e:
            exceptions.append(e)
  
    return results, exceptions
```

### 3. First-Completed Future Pattern

```python
async def first_completed(futures):
    # Wait for the first Future to complete
    done, pending = await asyncio.wait(
        futures,
        return_when=asyncio.FIRST_COMPLETED
    )
  
    # Cancel all other Futures
    for future in pending:
        future.cancel()
  
    # Get the result of the first completed Future
    return next(iter(done)).result()
```

### 4. Using Futures with Context Managers

```python
class AsyncResource:
    async def __aenter__(self):
        # Acquire the resource
        self.resource = await acquire_resource()
        return self.resource
  
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # Release the resource, even if there was an exception
        await release_resource(self.resource)

async def future_with_context_manager():
    # Create a Future to be resolved from the context
    result_future = asyncio.Future()
  
    async with AsyncResource() as resource:
        # Use the resource to resolve the Future
        await process_with_resource(resource, result_future)
  
    # At this point, the resource has been released,
    # but we can still access the result
    return await result_future
```

## Real-World Examples

### Example 1: HTTP Server with Future-Based Request Handling

```python
import asyncio
from http.server import BaseHTTPRequestHandler
from socketserver import TCPServer
import threading
from urllib.parse import parse_qs

# Map to store request Futures by ID
request_futures = {}
request_futures_lock = threading.Lock()

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/request/'):
            # Extract request ID from URL
            request_id = self.path.split('/')[2]
          
            # Create a Future for this request
            loop = asyncio.get_event_loop()
            future = asyncio.run_coroutine_threadsafe(
                self.handle_request(request_id),
                loop
            )
          
            # Store the Future
            with request_futures_lock:
                request_futures[request_id] = future
          
            # Respond immediately
            self.send_response(202)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"Request accepted")
      
        elif self.path.startswith('/response/'):
            # Extract request ID and response from URL
            parts = self.path.split('/')
            request_id = parts[2]
          
            # Get query parameters
            query = parse_qs(self.path.split('?')[-1])
            response_text = query.get('text', [''])[0]
          
            # Resolve the Future for this request
            with request_futures_lock:
                if request_id in request_futures:
                    future = request_futures[request_id]
                    loop = asyncio.get_event_loop()
                    loop.call_soon_threadsafe(
                        lambda: future.set_result(response_text)
                    )
                  
                    self.send_response(200)
                    self.send_header('Content-Type', 'text/plain')
                    self.end_headers()
                    self.wfile.write(b"Response delivered")
                else:
                    self.send_response(404)
                    self.send_header('Content-Type', 'text/plain')
                    self.end_headers()
                    self.wfile.write(b"Request not found")
  
    async def handle_request(self, request_id):
        # This coroutine will be suspended until the Future is resolved
        future = asyncio.Future()
      
        try:
            # Wait for the response (with timeout)
            result = await asyncio.wait_for(future, 300)  # 5 minutes timeout
            print(f"Request {request_id} completed with: {result}")
            return result
        except asyncio.TimeoutError:
            print(f"Request {request_id} timed out")
            return None
        finally:
            with request_futures_lock:
                if request_id in request_futures:
                    del request_futures[request_id]

# Run the HTTP server in a separate thread
def run_server():
    server = TCPServer(('localhost', 8000), RequestHandler)
    server.serve_forever()

threading.Thread(target=run_server, daemon=True).start()

# Asyncio event loop running in the main thread
async def main():
    while True:
        await asyncio.sleep(1)
```

This example demonstrates using Futures to bridge between synchronous HTTP requests and asynchronous processing, allowing long-running requests to be handled without blocking.

### Example 2: Distributed Task Processing with Futures

```python
import asyncio
import uuid
import random

# Simulate a distributed task system
class DistributedTaskSystem:
    def __init__(self):
        self.tasks = {}  # Map task_id -> Future
        self.workers = []  # List of worker coroutines
  
    async def submit_task(self, work_function, *args):
        # Create a unique ID for the task
        task_id = str(uuid.uuid4())
      
        # Create a Future for the result
        future = asyncio.Future()
      
        # Store the task
        self.tasks[task_id] = {
            'future': future,
            'function': work_function,
            'args': args
        }
      
        print(f"Submitted task {task_id}")
        return task_id, future
  
    async def start_worker(self, worker_id):
        print(f"Worker {worker_id} started")
      
        while True:
            # Find an unassigned task
            task_id = None
            task = None
          
            for tid, t in list(self.tasks.items()):
                if 'assigned' not in t:
                    task_id = tid
                    task = t
                    task['assigned'] = worker_id
                    break
          
            if task is None:
                # No tasks available, wait a bit
                await asyncio.sleep(0.1)
                continue
          
            # Process the task
            print(f"Worker {worker_id} processing task {task_id}")
            try:
                # Simulate variable processing time
                await asyncio.sleep(random.uniform(0.5, 2.0))
              
                # Call the task function
                result = await task['function'](*task['args'])
              
                # Set the result on the Future
                task['future'].set_result(result)
                print(f"Worker {worker_id} completed task {task_id}")
            except Exception as e:
                # If there was an error, set it on the Future
                task['future'].set_exception(e)
                print(f"Worker {worker_id} failed on task {task_id}: {e}")
          
            # Remove the completed task
            del self.tasks[task_id]
  
    def start(self, num_workers=3):
        # Start the specified number of workers
        for i in range(num_workers):
            worker = asyncio.create_task(self.start_worker(f"worker-{i}"))
            self.workers.append(worker)

# Example usage
async def example_distributed_tasks():
    system = DistributedTaskSystem()
    system.start(5)  # Start 5 workers
  
    # Define some task functions
    async def compute_task(x, y):
        return x * y
  
    async def slow_task(name):
        await asyncio.sleep(1)
        return f"Slow task {name} completed"
  
    # Submit 10 tasks
    futures = []
    for i in range(10):
        if i % 2 == 0:
            task_id, future = await system.submit_task(compute_task, i, i*2)
        else:
            task_id, future = await system.submit_task(slow_task, f"task-{i}")
        futures.append(future)
  
    # Wait for all tasks to complete
    results = await asyncio.gather(*futures)
  
    print("All tasks completed!")
    for i, result in enumerate(results):
        print(f"Task {i} result: {result}")
```

This example demonstrates using Futures as the communication mechanism in a distributed task processing system, where tasks are submitted with Futures and workers resolve them as they complete the work.

## Advanced Future Concepts

### 1. Future Unwrapping

When you have nested Futures (a Future that resolves to another Future), asyncio provides automatic unwrapping:

```python
async def nested_futures():
    # Create an outer Future
    outer_future = asyncio.Future()
  
    # Create an inner Future
    inner_future = asyncio.Future()
  
    # Set the inner Future as the result of the outer Future
    outer_future.set_result(inner_future)
  
    # Later, set a result on the inner Future
    asyncio.create_task(set_after_delay(inner_future, "Nested result", 1))
  
    # Await the outer Future - this will automatically unwrap
    # and await the inner Future too
    result = await outer_future
    print(result)  # "Nested result"
```

This unwrapping behavior makes it easier to work with chains of asynchronous operations.

### 2. Future Cancellation Propagation

When a Future is awaited by a Task, cancelling the Task can propagate to the Future:

```python
async def cancellation_propagation():
    # Create a Future
    future = asyncio.Future()
  
    # Create a Task that awaits the Future
    async def waiter():
        try:
            return await future
        except asyncio.CancelledError:
            print("Waiter was cancelled")
            # Cancel the Future too
            future.cancel()
            raise
  
    task = asyncio.create_task(waiter())
  
    # Cancel the Task
    await asyncio.sleep(0.1)
    task.cancel()
  
    try:
        await task
    except asyncio.CancelledError:
        pass
  
    # Check if the Future was also cancelled
    print(f"Future cancelled: {future.cancelled()}")  # True
```

This propagation is important for proper cleanup of resource chains.

### 3. Shield vs. Future Unwrapping

The `asyncio.shield()` function prevents cancellation propagation:

```python
async def shield_example():
    future = asyncio.Future()
  
    async def shielded_waiter():
        try:
            # Shield prevents cancellation from propagating to future
            return await asyncio.shield(future)
        except asyncio.CancelledError:
            print("Shielded waiter was cancelled")
            print(f"But future was not: {not future.cancelled()}")
            raise
  
    task = asyncio.create_task(shielded_waiter())
  
    # Cancel the task
    await asyncio.sleep(0.1)
    task.cancel()
  
    try:
        await task
    except asyncio.CancelledError:
        pass
  
    # Future was not cancelled
    print(f"Future cancelled: {future.cancelled()}")  # False
  
    # We can still resolve and use the Future
    future.set_result("Still usable!")
    print(f"Future result: {future.result()}")
```

## Conclusion

Futures and Tasks form the backbone of asyncio's concurrency model. From our exploration:

1. **Futures are promises of results** that provide a consistent interface for asynchronous operations
2. **Tasks are specialized Futures** that wrap coroutines and manage their execution
3. **Every Task is a Future** , but not every Future is a Task
4. **Futures serve as coordination points** between the event loop and coroutines
5. **Futures enable integration** between asyncio and other concurrency mechanisms

When building asyncio applications:

* Use Tasks for running coroutines concurrently
* Use Futures when you need a placeholder for a result that will be set by callback-based code
* Understand that both implement the awaitable protocol, allowing use with `await`
* Remember that proper cancellation and error handling are critical for robust applications

The relationship between Futures and Tasks is a perfect example of Python's object-oriented design principles: Tasks inherit from Futures to add specialized behavior while maintaining compatibility with the base interface. Understanding this relationship is key to mastering asyncio and building efficient, reliable asynchronous applications.
