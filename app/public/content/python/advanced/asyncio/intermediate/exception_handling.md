# Exception Handling in Asyncio: From First Principles

## The Foundation: Understanding Exceptions in Asynchronous Context

To understand exception handling in asyncio from first principles, we need to start with the fundamentals of how exceptions flow in asynchronous code compared to synchronous code.

In traditional synchronous Python, exceptions propagate up the call stack immediately when they occur. The program's execution path is linear and predictable, making exception flow easy to follow:

```python
def func_c():
    raise ValueError("Something went wrong")

def func_b():
    func_c()  # If exception happens here, it immediately propagates to func_a

def func_a():
    try:
        func_b()
    except ValueError as e:
        print(f"Caught: {e}")

func_a()  # Prints: Caught: Something went wrong
```

In this synchronous world, exceptions travel up the call stack in a straight line.

But asynchronous code introduces a critical difference: **execution is non-linear**. Coroutines can be paused, resumed, and interleaved. The traditional call stack is replaced by a more complex structure where multiple execution paths can be active simultaneously. This changes how exceptions propagate.

Let's start by seeing how basic exception handling looks in asyncio:

```python
import asyncio

async def func_c():
    raise ValueError("Something went wrong")

async def func_b():
    await func_c()  # Exception propagates up when awaited

async def func_a():
    try:
        await func_b()  # Exception from func_c reaches here
    except ValueError as e:
        print(f"Caught: {e}")

asyncio.run(func_a())  # Prints: Caught: Something went wrong
```

At first glance, this looks similar to synchronous code. But there's a key difference: exceptions in asyncio only propagate when awaited. This creates unique challenges and patterns we'll explore.

## Exception Propagation in Asyncio: The Await Chain

Exception propagation in asyncio follows what I'll call the "await chain" - exceptions travel through the chain of awaited coroutines. This is critically different from synchronous code because exceptions don't propagate until the coroutine is awaited.

Let's see this in action:

```python
import asyncio

async def will_raise():
    await asyncio.sleep(1)
    raise ValueError("Async error occurred")

async def main():
    # Create but don't await - no exception propagation yet
    task = asyncio.create_task(will_raise())
    
    print("Task created but not awaited yet")
    await asyncio.sleep(2)  # Wait long enough for will_raise() to complete and raise
    
    print("Before awaiting task")
    try:
        # NOW the exception will propagate when we await
        await task
    except ValueError as e:
        print(f"Caught exception: {e}")

asyncio.run(main())
```

Output:
```
Task created but not awaited yet
Before awaiting task
Caught exception: Async error occurred
```

This example demonstrates a critical concept: the exception occurred inside the task while it was running independently, but it only propagated to our code when we explicitly awaited the task. Until that point, the exception was stored inside the task, waiting to be observed.

### Exception Storage in Tasks and Futures

When an exception occurs in a coroutine that's wrapped in a Task, the exception is stored within the Task object. It sits there, suspended in time, until someone awaits the task or explicitly checks for exceptions.

We can see this by examining a completed task without awaiting it:

```python
import asyncio

async def demo_exception_storage():
    # Create a task that will raise
    task = asyncio.create_task(async_raiser())
    
    # Wait long enough for the task to complete
    await asyncio.sleep(1)
    
    # Task has completed with an exception
    print(f"Task done: {task.done()}")
    
    # We can check for an exception without awaiting
    print(f"Task has exception: {task.exception() is not None}")
    
    # We can get the exception without raising it
    exc = task.exception()
    print(f"Exception type: {type(exc).__name__}")
    print(f"Exception message: {exc}")
    
    # If we await the task now, it will raise
    try:
        await task
    except Exception as e:
        print(f"Awaiting raised: {e}")

async def async_raiser():
    await asyncio.sleep(0.1)
    raise ValueError("Stored exception")

asyncio.run(demo_exception_storage())
```

Output:
```
Task done: True
Task has exception: True
Exception type: ValueError
Exception message: Stored exception
Awaiting raised: Stored exception
```

This ability to store exceptions is unique to asynchronous programming and creates both challenges and opportunities.

## Exception Handling Patterns in Asyncio

Now that we understand the basic mechanics, let's explore the different patterns for handling exceptions in asyncio code.

### Pattern 1: Direct Try/Except with Await

The simplest pattern mirrors synchronous code:

```python
async def basic_exception_handling():
    try:
        await risky_coroutine()
    except SpecificError as e:
        # Handle specific error
        print(f"Handling specific error: {e}")
    except Exception as e:
        # Handle any other exception
        print(f"Handling unexpected error: {e}")
```

This works well when:
- You're awaiting a single coroutine
- You need to handle exceptions immediately
- The exception handling is localized to this specific operation

### Pattern 2: Task Exception Handling

For concurrent tasks, we need to handle exceptions differently:

```python
async def task_exception_handling():
    # Create multiple tasks
    task1 = asyncio.create_task(risky_coroutine("task1"))
    task2 = asyncio.create_task(risky_coroutine("task2"))
    task3 = asyncio.create_task(risky_coroutine("task3"))
    
    # Approach 1: Handle exceptions individually
    for task in [task1, task2, task3]:
        try:
            await task
        except Exception as e:
            print(f"Task failed: {e}")
    
    # Approach 2: Collect all exceptions
    results = []
    for task in [task1, task2, task3]:
        try:
            result = await task
            results.append(result)
        except Exception as e:
            results.append(None)
            print(f"Task failed with {type(e).__name__}: {e}")
```

This pattern works well when:
- You're running multiple independent tasks
- You want to handle exceptions for each task separately
- You need to continue processing other tasks even if some fail

### Pattern 3: Using asyncio.gather() with return_exceptions

The `asyncio.gather()` function has a powerful feature for handling exceptions in multiple tasks:

```python
async def gather_exception_handling():
    try:
        # With return_exceptions=True, exceptions are returned instead of raised
        results = await asyncio.gather(
            risky_coroutine("task1"),
            risky_coroutine("task2"),
            risky_coroutine("task3"),
            return_exceptions=True
        )
        
        # Process results and exceptions
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"Task {i} failed with {type(result).__name__}: {result}")
            else:
                print(f"Task {i} succeeded with result: {result}")
                
    except Exception as e:
        # This only happens if gather itself fails, not if tasks fail
        print(f"Gather operation failed: {e}")
```

This pattern is ideal when:
- You need to run multiple coroutines concurrently
- You want to collect all results and exceptions together
- You want to process results only after all tasks have completed

If we set `return_exceptions=False` (the default), then any exception in any task will immediately propagate out of the `gather()` call, cancelling pending awaitables.

### Pattern 4: Using asyncio.wait() with Different Return Conditions

For more control over concurrent tasks, `asyncio.wait()` provides powerful options:

```python
async def wait_exception_handling():
    # Create tasks
    tasks = [
        asyncio.create_task(risky_coroutine("task1")),
        asyncio.create_task(risky_coroutine("task2")),
        asyncio.create_task(risky_coroutine("task3")),
    ]
    
    # Wait for first exception or all tasks to complete
    done, pending = await asyncio.wait(
        tasks,
        return_when=asyncio.FIRST_EXCEPTION
    )
    
    # Check if any task raised an exception
    for task in done:
        if task.exception() is not None:
            print(f"Task failed with: {task.exception()}")
            
            # Cancel all pending tasks
            for pending_task in pending:
                pending_task.cancel()
            
            # Wait for cancelled tasks
            if pending:
                await asyncio.wait(pending)
            
            break
    
    # Process results from successful tasks
    for task in done:
        if task.exception() is None:
            result = task.result()
            print(f"Task succeeded with: {result}")
```

This pattern works well when:
- You want precise control over task execution
- You need specific behaviors like stopping at the first exception
- You want to make decisions based on task success/failure

### Pattern 5: Exception Handling with asyncio.TaskGroup (Python 3.11+)

Python 3.11 introduced `TaskGroup` as a context manager that makes handling exceptions in groups of tasks more structured:

```python
async def task_group_exception_handling():
    try:
        async with asyncio.TaskGroup() as tg:
            # Create tasks within the group
            task1 = tg.create_task(risky_coroutine("task1"))
            task2 = tg.create_task(risky_coroutine("task2"))
            task3 = tg.create_task(risky_coroutine("task3"))
            
        # If we reach here, all tasks completed successfully
        # or were cancelled when an exception occurred
        print("All tasks completed or were cancelled")
        
        # Process successful results
        for task in [task1, task2, task3]:
            if not task.cancelled() and task.exception() is None:
                result = task.result()
                print(f"Task result: {result}")
                
    except ExceptionGroup as eg:
        # TaskGroup collects exceptions into an ExceptionGroup
        print(f"Some tasks failed with {len(eg.exceptions)} exceptions:")
        for i, exc in enumerate(eg.exceptions):
            print(f"  Exception {i}: {type(exc).__name__}: {exc}")
```

This pattern is ideal when:
- You need structured concurrency (proper task cancellation and cleanup)
- You want exceptions grouped together
- You're using Python 3.11 or later

## Understanding ExceptionGroup and except*

Python 3.11 introduced `ExceptionGroup` and the new `except*` syntax to handle multiple exceptions at once, which is especially useful in asyncio:

```python
async def exception_group_handling():
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(raise_value_error())
            tg.create_task(raise_type_error())
            tg.create_task(raise_runtime_error())
    except* ValueError as eg:
        # Handle all ValueError instances from the group
        print(f"Caught ValueError: {eg.exceptions}")
    except* TypeError as eg:
        # Handle all TypeError instances from the group
        print(f"Caught TypeError: {eg.exceptions}")
    except* Exception as eg:
        # Handle any other exceptions
        print(f"Caught other exceptions: {eg.exceptions}")

async def raise_value_error():
    await asyncio.sleep(0.1)
    raise ValueError("Bad value")

async def raise_type_error():
    await asyncio.sleep(0.1)
    raise TypeError("Bad type")
    
async def raise_runtime_error():
    await asyncio.sleep(0.1)
    raise RuntimeError("Runtime problem")
```

The `except*` syntax allows you to handle specific exception types from an `ExceptionGroup`, which is perfect for handling different errors from multiple concurrent tasks.

## Exception Flow in Tasks: A Deep Dive

To truly understand exceptions in asyncio, we need to trace their path from occurrence to handling:

1. **Exception occurs** in a coroutine
2. If the coroutine is **directly awaited**, the exception propagates immediately
3. If the coroutine is running as a **Task**:
   - The exception is captured and stored in the Task
   - The Task is marked as done
   - The exception waits to be observed
4. The exception is **observed** when:
   - Someone awaits the Task
   - Someone calls task.result() or task.exception()
   - The Task is part of a structured construct (gather, wait, TaskGroup)

Let's trace this with a detailed example:

```python
import asyncio
import traceback
import sys

async def deep_dive_exception_flow():
    # Create a task
    task = asyncio.create_task(nested_coroutine())
    print("1. Task created")
    
    # Wait enough time for the exception to occur within the task
    await asyncio.sleep(0.5)
    print("2. Sleep completed, task should have failed by now")
    
    # Examine the task state
    print(f"3. Task done: {task.done()}")
    
    # Check if the task has an exception
    if task.done():
        print("4. Task has an exception:", task.exception() is not None)
        
        # Get the traceback without raising
        if task.exception() is not None:
            print("5. Exception traceback:")
            tb = task._exception.__traceback__
            traceback.print_tb(tb)
            print(f"6. Exception type: {type(task.exception()).__name__}")
            print(f"7. Exception message: {task.exception()}")
    
    # Now we'll actually raise the exception by awaiting
    print("8. About to await the failed task")
    try:
        await task
    except Exception as e:
        print(f"9. Exception raised during await: {type(e).__name__}: {e}")
        print("10. Current traceback:")
        traceback.print_exc(file=sys.stdout)

async def nested_coroutine():
    print("A. Starting nested_coroutine")
    try:
        await inner_coroutine()
    except Exception as e:
        print(f"E. Exception caught in nested_coroutine: {e}")
        # Re-raise to propagate to the task
        raise

async def inner_coroutine():
    print("B. Starting inner_coroutine")
    await asyncio.sleep(0.1)
    print("C. About to raise exception")
    raise ValueError("Intentional error for demonstration")
    print("D. This will never be reached")

asyncio.run(deep_dive_exception_flow())
```

This example shows the complete lifecycle of an exception in a task, from its occurrence to storage and finally observation.

## Handling Concurrent Exceptions: Advanced Patterns

When running multiple coroutines concurrently, you may need to handle exceptions in sophisticated ways. Here are some advanced patterns:

### Pattern: Fail-Fast with Exception Aggregation

```python
async def fail_fast_with_aggregation():
    tasks = [
        asyncio.create_task(risky_coroutine(f"task{i}"))
        for i in range(10)
    ]
    
    # First, wait for any exception
    done, pending = await asyncio.wait(
        tasks, 
        return_when=asyncio.FIRST_EXCEPTION
    )
    
    # Check if any task failed
    failed_task = None
    for task in done:
        if task.exception() is not None:
            failed_task = task
            break
    
    if failed_task:
        # Cancel all pending tasks
        for task in pending:
            task.cancel()
        
        # Wait for cancellations to complete
        if pending:
            await asyncio.wait(pending)
        
        # Find any other exceptions that may have occurred
        all_exceptions = []
        for task in done:
            if task.exception() is not None:
                all_exceptions.append(task.exception())
        
        # If multiple exceptions, create an ExceptionGroup
        if len(all_exceptions) > 1:
            raise ExceptionGroup("Multiple tasks failed", all_exceptions)
        else:
            # Re-raise the single exception
            raise failed_task.exception()
    
    # All tasks completed successfully
    return [task.result() for task in tasks]
```

This pattern is useful when:
- You want to stop as soon as any task fails
- You want to collect all exceptions that might have occurred
- You need to ensure all tasks are properly cleaned up

### Pattern: Graceful Degradation

```python
async def graceful_degradation():
    tasks = [
        asyncio.create_task(risky_coroutine(f"critical-{i}"))
        for i in range(3)
    ] + [
        asyncio.create_task(risky_coroutine(f"non-critical-{i}"))
        for i in range(5)
    ]
    
    # Track which tasks are critical
    critical_tasks = tasks[:3]
    non_critical_tasks = tasks[3:]
    
    # Wait for all tasks to complete
    done, _ = await asyncio.wait(tasks)
    
    # Check for critical failures
    critical_failures = []
    for task in critical_tasks:
        if task.exception() is not None:
            critical_failures.append((task, task.exception()))
    
    # If critical tasks failed, handle specially
    if critical_failures:
        print(f"{len(critical_failures)} critical tasks failed")
        for task, exc in critical_failures:
            print(f"  - {task.get_name()}: {type(exc).__name__}: {exc}")
        raise ExceptionGroup(
            "Critical tasks failed", 
            [exc for _, exc in critical_failures]
        )
    
    # Count non-critical failures, but don't raise
    non_critical_failures = 0
    for task in non_critical_tasks:
        if task.exception() is not None:
            non_critical_failures += 1
            print(f"Non-critical failure in {task.get_name()}: {task.exception()}")
    
    # Return results with status
    return {
        "completed": len(done),
        "successful": len(done) - non_critical_failures - len(critical_failures),
        "non_critical_failures": non_critical_failures,
        "results": [
            task.result() for task in done 
            if task.exception() is None
        ]
    }
```

This pattern works well when:
- You have tasks with different levels of importance
- You want to handle critical failures differently from non-critical ones
- You can continue with partial success

## Exception Handling with Timeouts and Cancellation

Timeouts and cancellation add another layer of complexity to exception handling in asyncio:

### Timeout Exception Handling

```python
async def timeout_exception_handling():
    try:
        # Try to run with a timeout
        result = await asyncio.wait_for(
            long_running_coroutine(),
            timeout=1.0
        )
        return result
    except asyncio.TimeoutError:
        print("Operation timed out")
        # Handle timeout case
        return default_value()
```

The `wait_for()` function will raise `asyncio.TimeoutError` if the coroutine doesn't complete within the specified time. Under the hood, it cancels the task when the timeout occurs.

### Cancellation Exception Handling

Cancellation is a special type of exception in asyncio. When a task is cancelled, `asyncio.CancelledError` is raised inside the coroutine:

```python
async def cancellation_aware_coroutine():
    try:
        while True:
            print("Working...")
            await asyncio.sleep(0.5)
    except asyncio.CancelledError:
        print("Cancellation detected, cleaning up...")
        # Do cleanup work here
        await cleanup_resources()
        # Re-raise to acknowledge the cancellation
        raise
```

This pattern ensures that resources are properly cleaned up when a task is cancelled.

### Combining Cancellation and Regular Exception Handling

Things get more complex when you need to handle both cancellation and other exceptions:

```python
async def robust_coroutine():
    resources = None
    try:
        # Acquire resources
        resources = await acquire_resources()
        
        # Main work
        while True:
            try:
                result = await process_next_item(resources)
                await store_result(result)
            except ProcessingError as e:
                # Handle specific errors without stopping
                await log_error(e)
                continue
    except asyncio.CancelledError:
        print("Task was cancelled")
        # Must clean up and re-raise
        raise
    except Exception as e:
        # Handle other exceptions
        print(f"Error occurred: {e}")
        await log_exception(e)
        raise  # Re-raise after logging
    finally:
        # Always clean up resources
        if resources is not None:
            await release_resources(resources)
```

This pattern ensures that resources are released regardless of whether the task completed normally, was cancelled, or raised an exception.

## Handling Exceptions in Different Asyncio Constructs

Let's look at exception handling in various asyncio constructs:

### Exception Handling in asyncio.shield()

The `shield()` function protects a coroutine from cancellation. However, exceptions still propagate normally:

```python
async def shield_exception_handling():
    try:
        # Shield from cancellation, but exceptions still propagate
        result = await asyncio.shield(potentially_raising_coroutine())
        return result
    except SpecificError as e:
        # This will still catch exceptions from the coroutine
        print(f"Caught exception despite shield: {e}")
```

### Exception Handling with asyncio.as_completed()

The `as_completed()` function allows processing tasks as they complete:

```python
async def as_completed_exception_handling():
    # Create tasks
    coroutines = [risky_coroutine(f"task{i}") for i in range(5)]
    
    successful = []
    failed = []
    
    # Process as they complete
    for future in asyncio.as_completed(coroutines):
        try:
            result = await future
            successful.append(result)
        except Exception as e:
            failed.append(e)
            print(f"Task failed with: {e}")
    
    print(f"Successful: {len(successful)}, Failed: {len(failed)}")
    return successful, failed
```

This pattern allows graceful handling of exceptions while processing results as soon as they're available.

### Exception Handling with asyncio.gather() and return_exceptions=True

Let's look deeper at how `gather()` handles exceptions:

```python
async def gather_detailed_example():
    # Define coroutines that succeed or fail
    async def succeed(value):
        await asyncio.sleep(0.1)
        return value
    
    async def fail(error_msg):
        await asyncio.sleep(0.1)
        raise ValueError(error_msg)
    
    # Run with return_exceptions=True
    results = await asyncio.gather(
        succeed("A"),
        fail("Error 1"),
        succeed("B"),
        fail("Error 2"),
        return_exceptions=True
    )
    
    # Process mixed results and exceptions
    values = []
    errors = []
    
    for result in results:
        if isinstance(result, Exception):
            errors.append(result)
        else:
            values.append(result)
    
    print(f"Values: {values}")
    print(f"Errors: {[str(err) for err in errors]}")
    
    # You can still raise the exceptions if needed
    if errors:
        if len(errors) == 1:
            raise errors[0]
        else:
            raise ExceptionGroup("Multiple errors occurred", errors)
```

This pattern gives you complete control over how exceptions are handled after all tasks have completed.

## Real-World Exception Handling Patterns

Let's look at some practical patterns for exception handling in real-world asyncio applications:

### Pattern: Retry with Exponential Backoff

```python
import random

async def with_exponential_backoff(coro, max_retries=3, base_delay=1):
    retries = 0
    while True:
        try:
            return await coro
        except (ConnectionError, TimeoutError) as e:
            retries += 1
            if retries > max_retries:
                raise
            
            # Calculate backoff delay with jitter
            delay = base_delay * (2 ** (retries - 1))
            jitter = random.uniform(0, 0.1 * delay)
            total_delay = delay + jitter
            
            print(f"Attempt {retries} failed with {type(e).__name__}: {e}")
            print(f"Retrying in {total_delay:.2f} seconds...")
            
            await asyncio.sleep(total_delay)
```

This pattern is crucial for network operations that might fail transiently.

### Pattern: Circuit Breaker

```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, reset_timeout=30):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.state = "closed"  # closed, open, half-open
        self.last_failure_time = 0
    
    async def call(self, coro):
        current_time = asyncio.get_event_loop().time()
        
        # Check if circuit should attempt reset
        if self.state == "open":
            if current_time - self.last_failure_time >= self.reset_timeout:
                self.state = "half-open"
                print("Circuit breaker: half-open")
        
        # Don't allow calls when circuit is open
        if self.state == "open":
            raise CircuitBreakerError("Circuit is open, call rejected")
        
        try:
            result = await coro
            
            # Success in half-open state resets the circuit
            if self.state == "half-open":
                self.failure_count = 0
                self.state = "closed"
                print("Circuit breaker: closed")
                
            return result
            
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = current_time
            
            # Check if we need to open the circuit
            if self.state == "closed" and self.failure_count >= self.failure_threshold:
                self.state = "open"
                print(f"Circuit breaker: opened after {self.failure_count} failures")
            
            raise
```

The circuit breaker pattern prevents cascading failures by failing fast when a service is unhealthy.

### Pattern: Graceful Shutdown with Exception Handling

```python
import signal

async def graceful_shutdown_server():
    # Create a shutdown event
    shutdown_event = asyncio.Event()
    
    # Set up signal handlers
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(
            sig, 
            lambda: asyncio.create_task(shutdown(shutdown_event))
        )
    
    # Start server tasks
    server_task = asyncio.create_task(run_server(shutdown_event))
    cleanup_task = asyncio.create_task(periodic_cleanup(shutdown_event))
    
    try:
        # Run until shutdown is requested
        await shutdown_event.wait()
        
        # Cancel all tasks
        server_task.cancel()
        cleanup_task.cancel()
        
        # Wait for tasks to complete with exception handling
        done, pending = await asyncio.wait(
            [server_task, cleanup_task],
            return_when=asyncio.ALL_COMPLETED
        )
        
        # Check for exceptions other than CancelledError
        for task in done:
            if task.cancelled():
                continue
            
            if task.exception() is not None:
                exc = task.exception()
                if not isinstance(exc, asyncio.CancelledError):
                    print(f"Task failed during shutdown: {exc}")
        
        print("Server shut down successfully")
        
    except Exception as e:
        print(f"Error during shutdown: {e}")
        # Ensure tasks are cancelled
        for task in [server_task, cleanup_task]:
            if not task.done():
                task.cancel()

async def shutdown(event):
    print("Shutdown initiated")
    event.set()

async def run_server(shutdown_event):
    try:
        while not shutdown_event.is_set():
            print("Server running...")
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        print("Server shutting down...")
        # Cleanup code
        await asyncio.sleep(0.5)  # Simulate cleanup
        print("Server resources released")
        raise
    except Exception as e:
        print(f"Server error: {e}")
        shutdown_event.set()  # Trigger shutdown on error
        raise

async def periodic_cleanup(shutdown_event):
    try:
        while not shutdown_event.is_set():
            await asyncio.sleep(3)
            print("Running periodic cleanup")
    except asyncio.CancelledError:
        print("Cleanup task shutting down...")
        raise
```

This pattern ensures proper cleanup when shutting down a server, handling both graceful shutdown signals and unexpected exceptions.

## Debugging Exception Handling in Asyncio

Debugging asynchronous exception handling can be challenging. Here are some techniques:

### 1. Using Debug Mode

```python
async def with_debug_mode():
    # Enable debug mode
    asyncio.get_event_loop().set_debug(True)
    
    # Create a task
    task = asyncio.create_task(will_raise())
    
    # Wait for it to complete
    await asyncio.sleep(1)
    
    # Task has raised but we haven't observed it
    # Debug mode will warn about this
    await asyncio.sleep(1)

async def will_raise():
    await asyncio.sleep(0.5)
    raise ValueError("Debug this")
```

Running with debug mode will warn about unhandled exceptions in tasks.

### 2. Custom Exception Handler

```python
import traceback

def custom_exception_handler(loop, context):
    # Extract exception and message
    exception = context.get("exception")
    message = context.get("message")
    
    # Get detailed info
    task = context.get("task")
    future = context.get("future")
    handle = context.get("handle")
    protocol = context.get("protocol")
    transport = context.get("transport")
    socket = context.get("socket")
    
    print(f"Asyncio caught an unhandled exception:")
    print(f"Message: {message}")
    
    if exception is not None:
        print(f"Exception: {type(exception).__name__}: {exception}")
        traceback.print_exception(
            type(exception), exception, exception.__traceback__
        )
    
    if task is not None:
        print(f"In task: {task.get_name()}")
    
    # Log or handle specific error types
    if isinstance(exception, ConnectionError):
        print("This is a connection error - maybe retry?")
    
    # Example of restarting a task
    if task is not None and isinstance(exception, RecoverableError):
        print("Restarting failed task...")
        asyncio.create_task(task.get_coro())

async def setup_custom_handler():
    loop = asyncio.get_running_loop()
    loop.set_exception_handler(custom_exception_handler)
    
    # Now any unhandled exception will go to our handler
    task = asyncio.create_task(will_raise())
    
    # Wait without handling the exception
    await asyncio.sleep(2)
```

A custom exception handler gives you control over how unhandled exceptions are logged and processed.

### 3. Task Factory with Better Names

```python
def named_task_factory(loop, coro):
    # Get the coroutine's name
    task_name = coro.__qualname__
    
    # Create a task with explicit name
    task = asyncio.Task(coro, loop=loop, name=task_name)
    return task


async def setup_named_tasks():
    loop = asyncio.get_running_loop()
    loop.set_task_factory(named_task_factory)
    
    # Now all tasks will have better names in tracebacks
    task1 = asyncio.create_task(coroutine_a())
    task2 = asyncio.create_task(coroutine_b())
    
    # Wait for them
    try:
        await asyncio.gather(task1, task2)
    except Exception as e:
        print(f"Error in {e.__traceback__.tb_frame.f_code.co_name}")
```

With better task names, debugging becomes easier as exception tracebacks will show meaningful function names.

## Exception Context Loss in Asyncio

One challenge with asyncio is that exception context can sometimes be lost. Let's understand this problem and how to solve it:

### The Problem: Lost Exception Context

```python
async def demonstate_context_loss():
    try:
        await problematic_operation()
    except Exception as e:
        print(f"Caught: {e}")
        # The original context might be lost here
        raise RuntimeError("Something went wrong") from e

async def problematic_operation():
    # This function will raise an exception
    data = {"key": [1, 2, 3]}
    # This will raise KeyError
    return data["missing_key"]
```

In synchronous code, Python preserves the exception context using `from e` syntax. But in asyncio, this context can be lost when exceptions cross task boundaries.

### Solution: Preserving Exception Context

```python
import traceback
import sys

async def preserve_exception_context():
    task = asyncio.create_task(problematic_operation())
    
    try:
        await task
    except Exception as e:
        # Capture the full exception info
        exc_type, exc_value, exc_traceback = sys.exc_info()
        
        # Store the original traceback
        original_traceback = ''.join(traceback.format_exception(
            exc_type, exc_value, exc_traceback
        ))
        
        print("Original traceback:")
        print(original_traceback)
        
        # Re-raise with context
        try:
            raise RuntimeError("Wrapped error") from e
        except Exception as wrapped:
            # The new exception has the original as its context
            new_traceback = ''.join(traceback.format_exception(
                type(wrapped), wrapped, wrapped.__traceback__
            ))
            
            print("New traceback with context:")
            print(new_traceback)
            
            # Re-raise
            raise
```

By explicitly capturing and preserving the exception context, we can ensure that the original error information is not lost, making debugging easier.

## Exception Handling with Structured Concurrency

Structured concurrency, introduced in Python 3.11 with `asyncio.TaskGroup`, provides a more organized approach to exception handling:

```python
async def structured_exception_handling():
    try:
        async with asyncio.TaskGroup() as tg:
            tg.create_task(risky_operation("task1"))
            tg.create_task(risky_operation("task2"))
            tg.create_task(risky_operation("task3"))
            
        print("All tasks completed successfully")
        
    except* ValueError as eg:
        # Handle all ValueError exceptions
        print(f"Value errors: {len(eg.exceptions)}")
        for i, exc in enumerate(eg.exceptions):
            print(f"  {i+1}. {exc}")
            
    except* TypeError as eg:
        # Handle all TypeError exceptions
        print(f"Type errors: {len(eg.exceptions)}")
        for i, exc in enumerate(eg.exceptions):
            print(f"  {i+1}. {exc}")
            
    except* Exception as eg:
        # Handle all other exceptions
        print(f"Other errors: {len(eg.exceptions)}")
        for i, exc in enumerate(eg.exceptions):
            print(f"  {i+1}. {type(exc).__name__}: {exc}")
```

The key advantages of structured concurrency for exception handling are:

1. **Automatic propagation**: Exceptions from child tasks automatically propagate to the parent scope
2. **Grouped exceptions**: Multiple exceptions are collected into an `ExceptionGroup`
3. **Clean semantics**: The context manager ensures proper cleanup regardless of exceptions
4. **Selective handling**: The `except*` syntax allows handling specific exception types from groups

## Advanced Exception Propagation Patterns

Let's explore some advanced patterns for exception propagation in asyncio applications:

### Controlled Exception Propagation

```python
async def controlled_propagation():
    # Create separate task groups for different components
    try:
        # Database operations
        async with asyncio.TaskGroup() as db_group:
            db_results = []
            for i in range(3):
                task = db_group.create_task(database_operation(f"query{i}"))
                db_results.append(task)
                
        # All database operations succeeded, now process results
        processed_data = [await task for task in db_results]
        
        # API calls with the processed data
        try:
            async with asyncio.TaskGroup() as api_group:
                api_tasks = []
                for data in processed_data:
                    task = api_group.create_task(api_call(data))
                    api_tasks.append(task)
                    
            # All API calls succeeded
            print("All operations completed successfully")
            
        except* ApiError as eg:
            # Handle API errors without failing the whole operation
            print(f"Some API calls failed: {len(eg.exceptions)}")
            # Continue with partial results
            
    except* DatabaseError as eg:
        # Database errors are critical, fail the entire operation
        print("Critical database errors occurred")
        for exc in eg.exceptions:
            print(f"  - {exc}")
        raise SystemError("System cannot function due to database errors") from eg
```

This pattern separates concerns and allows different handling strategies for different types of operations.

### Error Tunneling

Sometimes you want to capture exceptions but preserve the original context for later handling:

```python
async def error_tunneling():
    # Create an "error tunnel"
    errors = []
    
    # Run operations, capturing errors
    for i in range(5):
        try:
            result = await risky_operation(f"op{i}")
            # Process successful result
            print(f"Operation {i} succeeded with {result}")
        except Exception as e:
            # Capture error with context
            errors.append({
                "operation": i,
                "error": e,
                "traceback": traceback.format_exc()
            })
            # Continue with next operation
    
    # After all operations, handle errors comprehensively
    if errors:
        print(f"{len(errors)} operations failed:")
        for error in errors:
            print(f"Operation {error['operation']}:")
            print(f"  Error: {error['error']}")
            print(f"  Traceback: \n{error['traceback']}")
        
        # Decide whether to raise based on error severity
        critical_errors = [e for e in errors if is_critical(e["error"])]
        if critical_errors:
            # Raise an exception with all the error information
            raise OperationError(f"{len(critical_errors)} critical errors", errors)
```

This pattern allows operations to continue despite errors, while preserving complete error information for later analysis or reporting.

## Exception Handling in Specific Asyncio Scenarios

Let's look at exception handling in common asyncio usage scenarios:

### Network Operations with Aiohttp

```python
import aiohttp

async def robust_http_operations():
    async with aiohttp.ClientSession() as session:
        try:
            # Attempt the request
            async with session.get("https://example.com/api") as response:
                # Check status code
                response.raise_for_status()
                return await response.json()
                
        except aiohttp.ClientResponseError as e:
            # Server responded with an error status
            if e.status == 429:
                print(f"Rate limited: {e}")
                # Could implement retry logic here
            elif 500 <= e.status < 600:
                print(f"Server error: {e}")
            else:
                print(f"Client error: {e}")
            
        except aiohttp.ClientConnectorError as e:
            # Connection problem
            print(f"Connection failed: {e}")
            
        except aiohttp.ClientError as e:
            # Other client errors
            print(f"Request failed: {e}")
            
        except asyncio.TimeoutError:
            print("Request timed out")
            
        except Exception as e:
            print(f"Unexpected error: {e}")
            
        # Return a default or None in case of any error
        return None
```

This pattern handles the various exception types that can occur during HTTP operations with appropriate responses for each.

### Database Operations with Asyncpg

```python
import asyncpg

async def robust_database_operations():
    try:
        # Connect to database
        conn = await asyncpg.connect(
            user="user", password="password",
            database="database", host="localhost"
        )
        
        try:
            # Start a transaction
            async with conn.transaction():
                # Perform database operations
                result = await conn.fetch("SELECT * FROM users WHERE active = $1", True)
                
                # More operations that need to be in the same transaction
                await conn.execute(
                    "UPDATE users SET last_seen = $1 WHERE id = $2",
                    datetime.now(), 123
                )
                
                return result
                
        except asyncpg.PostgresError as e:
            # Database operation error
            if isinstance(e, asyncpg.UniqueViolationError):
                print(f"Uniqueness constraint violated: {e}")
            elif isinstance(e, asyncpg.ForeignKeyViolationError):
                print(f"Foreign key constraint violated: {e}")
            else:
                print(f"Database error: {e}")
            
            # Return empty result set
            return []
            
        finally:
            # Always close the connection
            await conn.close()
            
    except asyncpg.PostgresConnectionError as e:
        # Connection error
        print(f"Failed to connect to database: {e}")
        return None
```

This pattern shows proper transaction and connection handling with specific handling for different types of database errors.

### Websocket Exception Handling

```python
import aiohttp

async def robust_websocket_client():
    backoff = 1
    max_backoff = 60
    
    while True:
        try:
            # Connect to the WebSocket server
            async with aiohttp.ClientSession() as session:
                async with session.ws_connect("wss://example.com/ws") as ws:
                    print("Connected to WebSocket server")
                    
                    # Reset backoff on successful connection
                    backoff = 1
                    
                    # Process messages
                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            await process_message(msg.data)
                        elif msg.type == aiohttp.WSMsgType.ERROR:
                            print(f"WebSocket error: {ws.exception()}")
                            break
                        elif msg.type == aiohttp.WSMsgType.CLOSE:
                            print("WebSocket closed")
                            break
                    
                    print("WebSocket connection closed, reconnecting...")
        
        except aiohttp.ClientError as e:
            print(f"WebSocket connection error: {e}")
        
        except Exception as e:
            print(f"Unexpected error in WebSocket client: {e}")
        
        # Implement exponential backoff for reconnection
        await asyncio.sleep(backoff)
        backoff = min(backoff * 2, max_backoff)
        print(f"Reconnecting in {backoff} seconds...")
```

This pattern implements a robust WebSocket client that handles various error conditions and implements reconnection with exponential backoff.

## Exception Handling Best Practices in Asyncio

Based on our deep exploration, here are the best practices for exception handling in asyncio applications:

### 1. Be Explicit About Exception Propagation

```python
async def explicit_propagation():
    try:
        await potentially_raising_operation()
    except SpecificError as e:
        # Handle the specific error
        print(f"Handling specific error: {e}")
    except Exception as e:
        # Either handle or explicitly re-raise
        print(f"Unexpected error: {e}")
        raise  # Explicit re-raise
```

Always be explicit about whether you're handling an exception or propagating it. Don't silently swallow exceptions unless you have a good reason.

### 2. Clean Up Resources Properly

```python
async def proper_resource_cleanup():
    resource = None
    try:
        resource = await acquire_resource()
        return await use_resource(resource)
    except asyncio.CancelledError:
        # Handle cancellation
        print("Operation cancelled")
        raise  # Re-raise to acknowledge cancellation
    finally:
        # Clean up in all cases
        if resource is not None:
            await release_resource(resource)
```

Use `finally` blocks to ensure resource cleanup happens regardless of normal completion, exceptions, or cancellation.

### 3. Use Structured Concurrency Where Possible

```python
async def prefer_structured_concurrency():
    # In Python 3.11+, prefer TaskGroup
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(operation1())
        task2 = tg.create_task(operation2())
        
    # All tasks are guaranteed to be done here,
    # and exceptions have been properly propagated
```

Structured concurrency makes task management and exception handling more straightforward and less error-prone.

### 4. Be Careful with Task Creation and Awaiting

```python
async def careful_task_management():
    # Bad: Creating a task and not storing or awaiting it
    asyncio.create_task(fire_and_forget())  # WRONG!
    
    # Good: Store and await all tasks
    task = asyncio.create_task(important_operation())
    # ... other code ...
    await task  # Make sure to await
    
    # Alternative: Use a task list to track all tasks
    tasks = []
    for i in range(5):
        task = asyncio.create_task(parallel_operation(i))
        tasks.append(task)
    
    # Await all tasks
    results = await asyncio.gather(*tasks)
```

Always keep track of and eventually await all tasks you create to ensure exceptions are properly handled.

### 5. Handle Cancellation Explicitly

```python
async def explicit_cancellation_handling():
    try:
        while True:
            await asyncio.sleep(1)
            await process_item()
    except asyncio.CancelledError:
        # Perform cleanup when cancelled
        print("Task cancelled, cleaning up...")
        await cleanup()
        raise  # Re-raise to acknowledge cancellation
```

Always catch `CancelledError` and perform any necessary cleanup before re-raising it to acknowledge the cancellation.

### 6. Log Unhandled Exceptions

```python
def setup_exception_logging():
    loop = asyncio.get_event_loop()
    
    # The previous exception handler
    old_handler = loop.get_exception_handler()
    
    def exception_handler(loop, context):
        # Log the exception
        exception = context.get("exception")
        if exception:
            logging.error(f"Unhandled exception: {exception}", exc_info=exception)
        elif "message" in context:
            logging.error(f"Unhandled exception: {context['message']}")
        
        # Call the previous handler if it exists
        if old_handler is not None:
            old_handler(loop, context)
    
    # Set our exception handler
    loop.set_exception_handler(exception_handler)
```

Ensure that all unhandled exceptions are logged to help with debugging and monitoring.

### 7. Use Context Managers for Resource Management

```python
class AsyncResource:
    async def __aenter__(self):
        self.resource = await acquire_resource()
        return self.resource
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await release_resource(self.resource)
        # Returning False means exceptions propagate
        return False

async def context_manager_usage():
    try:
        async with AsyncResource() as resource:
            # Use the resource
            result = await use_resource(resource)
            return result
    except ResourceError as e:
        # Handle resource-specific errors
        print(f"Resource error: {e}")
```

Context managers make it easier to ensure proper resource acquisition and release, even when exceptions occur.

## Conclusion

Exception handling in asyncio requires understanding the unique characteristics of asynchronous execution:

1. **Exceptions in asyncio only propagate when awaited**. Until a coroutine or task is awaited, exceptions remain stored and don't affect the program flow.

2. **Task cancellation is a special form of exception**. When a task is cancelled, a `CancelledError` is injected at the next await point, which should be caught and re-raised after any necessary cleanup.

3. **Structured concurrency simplifies exception handling**. Using constructs like `TaskGroup` makes the relationship between tasks clear and ensures proper exception propagation.

4. **Resource cleanup must be done carefully**. Always use `try/finally` blocks or async context managers to ensure resources are released, even if exceptions or cancellations occur.

5. **Different concurrency patterns have different exception handling needs**. Choose the right pattern based on your requirements – whether you need to fail-fast, continue with partial results, or aggregate exceptions.

By following these principles and using the patterns we've explored, you can write robust asyncio code that handles exceptions gracefully, maintains resource integrity, and provides clear information when things go wrong.

Remember that proper exception handling is not just about preventing crashes – it's about creating a robust system that can recover from errors, provide meaningful information to developers, and maintain a good user experience even when unexpected situations arise.