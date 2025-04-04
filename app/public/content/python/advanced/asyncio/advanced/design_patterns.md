# Design Patterns for Asyncio Python Applications

I'll explain design patterns for asyncio Python applications from first principles, covering how these patterns evolved from traditional synchronous approaches to handle the unique challenges of asynchronous programming.

## First Principles: What is Asyncio?

Asyncio is Python's built-in library for writing concurrent code using the `async`/`await` syntax. To understand why we need special design patterns for asyncio, we first need to understand how asyncio fundamentally changes program execution.

In traditional synchronous code, operations happen one after another:

```python
def make_breakfast():
    boil_water()  # Wait until water boils
    brew_coffee()  # Wait until coffee brews
    toast_bread()  # Wait until bread toasts
    return "Breakfast is ready!"
```

Each function blocks execution until it completes, which is inefficient when operations involve waiting (like network requests or file I/O).

Asyncio allows a program to do other work while waiting:

```python
async def make_breakfast_async():
    water_task = asyncio.create_task(boil_water_async())
    coffee_task = asyncio.create_task(brew_coffee_async())
    toast_task = asyncio.create_task(toast_bread_async())
  
    # All three tasks are now running concurrently
    await water_task
    await coffee_task
    await toast_task
    return "Breakfast is ready!"
```

This fundamental shift from sequential to concurrent execution necessitates new design patterns.

## Pattern 1: Task Creation and Management

### The Problem

Managing many concurrent tasks can quickly become complex and error-prone.

### The Pattern

Create a consistent approach to task creation, tracking, and cancellation.

### Example Implementation

```python
import asyncio
from typing import Dict, Any, Coroutine

class TaskManager:
    def __init__(self):
        self.tasks: Dict[str, asyncio.Task] = {}
  
    def create_task(self, name: str, coro: Coroutine) -> asyncio.Task:
        """Create and store a named task."""
        task = asyncio.create_task(coro)
        self.tasks[name] = task
        # Set callback to clean up when task is done
        task.add_done_callback(lambda t: self.tasks.pop(name, None))
        return task
  
    def cancel_task(self, name: str) -> bool:
        """Cancel a task by name."""
        if name in self.tasks:
            self.tasks[name].cancel()
            return True
        return False
  
    async def wait_for_task(self, name: str) -> Any:
        """Wait for a specific task to complete."""
        if name in self.tasks:
            return await self.tasks[name]
        raise KeyError(f"No task named {name}")
  
    async def wait_all(self) -> None:
        """Wait for all tasks to complete."""
        if self.tasks:
            await asyncio.gather(*self.tasks.values())
```

### Usage Example

```python
async def main():
    tm = TaskManager()
  
    # Start multiple tasks
    tm.create_task("data_fetch", fetch_data())
    tm.create_task("calculation", perform_calculation())
  
    # Later, we can check on specific tasks
    try:
        result = await tm.wait_for_task("data_fetch")
        print(f"Data fetch completed with result: {result}")
    except Exception as e:
        print(f"Data fetch failed: {e}")
  
    # Or cancel tasks if needed
    tm.cancel_task("calculation")
  
    # Wait for remaining tasks
    await tm.wait_all()
```

This pattern provides structure for creating, tracking, and managing asynchronous tasks, which is essential for maintaining control in complex asyncio applications.

## Pattern 2: Asynchronous Context Managers

### The Problem

Resource management is challenging in asynchronous code because traditional context managers (`with` statements) don't support asynchronous setup and teardown.

### The Pattern

Use asynchronous context managers (`async with`) to handle resources that require asynchronous acquisition or release.

### Example Implementation

```python
import asyncio
from types import TracebackType
from typing import Optional, Type

class AsyncResourceManager:
    def __init__(self, resource_id: str):
        self.resource_id = resource_id
        self.resource = None
  
    async def __aenter__(self):
        """Asynchronously acquire the resource."""
        print(f"Acquiring resource {self.resource_id}...")
        # Simulate async resource acquisition
        await asyncio.sleep(0.5)
        self.resource = f"Resource-{self.resource_id}"
        print(f"Resource {self.resource_id} acquired")
        return self.resource
  
    async def __aexit__(
        self, 
        exc_type: Optional[Type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType]
    ) -> None:
        """Asynchronously release the resource."""
        if self.resource:
            print(f"Releasing resource {self.resource_id}...")
            # Simulate async resource release
            await asyncio.sleep(0.3)
            self.resource = None
            print(f"Resource {self.resource_id} released")
```

### Usage Example

```python
async def process_data():
    async with AsyncResourceManager("database") as db:
        # Resource is guaranteed to be acquired here
        print(f"Processing with {db}")
        await asyncio.sleep(1)  # Simulate processing
        print("Processing complete")
    # Resource is guaranteed to be released here, even if an exception occurs
```

This pattern ensures proper asynchronous resource management, addressing cleanup needs that would otherwise be difficult in asynchronous code.

## Pattern 3: Producer-Consumer with Queues

### The Problem

Coordinating work between multiple producers and consumers is challenging in asynchronous environments.

### The Pattern

Use asyncio's `Queue` class to safely coordinate between asynchronous producers and consumers.

### Example Implementation

```python
import asyncio
import random
from typing import List

async def producer(queue: asyncio.Queue, producer_id: int, items: int):
    """Produces items and puts them in the queue."""
    for i in range(items):
        item = f"Item-{producer_id}-{i}"
        # Simulate production time
        await asyncio.sleep(random.uniform(0.1, 0.5))
        await queue.put(item)
        print(f"Producer {producer_id} produced {item}")
  
    # Signal this producer is done
    await queue.put(None)
    print(f"Producer {producer_id} finished")

async def consumer(queue: asyncio.Queue, consumer_id: int, producers_count: int):
    """Consumes items from the queue until all producers are done."""
    producers_done = 0
  
    while producers_done < producers_count:
        # Wait for an item from the queue
        item = await queue.get()
      
        if item is None:
            # A producer has finished
            producers_done += 1
            queue.task_done()
            continue
      
        # Simulate processing time
        await asyncio.sleep(random.uniform(0.2, 0.7))
        print(f"Consumer {consumer_id} processed {item}")
        queue.task_done()
  
    print(f"Consumer {consumer_id} finished")
```

### Usage Example

```python
async def main():
    # Create a bounded queue to prevent memory issues
    queue = asyncio.Queue(maxsize=10)
  
    # Set up producers and consumers
    num_producers = 3
    num_consumers = 2
    items_per_producer = 5
  
    # Start producers
    producer_tasks = [
        asyncio.create_task(producer(queue, i, items_per_producer))
        for i in range(num_producers)
    ]
  
    # Start consumers
    consumer_tasks = [
        asyncio.create_task(consumer(queue, i, num_producers))
        for i in range(num_consumers)
    ]
  
    # Wait for all producers to finish
    await asyncio.gather(*producer_tasks)
  
    # Wait for all consumers to finish
    await asyncio.gather(*consumer_tasks)
  
    # Ensure the queue is empty
    await queue.join()
  
    print("All producers and consumers have finished")
```

This pattern effectively manages the flow of data between asynchronous producers and consumers, providing controlled concurrency and preventing issues like queue overflow or deadlocks.

## Pattern 4: Event-Driven Architecture

### The Problem

Many asynchronous applications need to respond to events that can occur at any time and in any order.

### The Pattern

Implement an event system where components can publish events and subscribe to event types they're interested in.

### Example Implementation

```python
import asyncio
from typing import Dict, List, Any, Callable, Awaitable

# Type for event handlers
EventHandler = Callable[[Any], Awaitable[None]]

class EventBus:
    def __init__(self):
        self.subscribers: Dict[str, List[EventHandler]] = {}
  
    def subscribe(self, event_type: str, handler: EventHandler) -> None:
        """Subscribe a handler to an event type."""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)
  
    def unsubscribe(self, event_type: str, handler: EventHandler) -> bool:
        """Unsubscribe a handler from an event type."""
        if event_type in self.subscribers and handler in self.subscribers[event_type]:
            self.subscribers[event_type].remove(handler)
            return True
        return False
  
    async def publish(self, event_type: str, data: Any = None) -> None:
        """Publish an event to all subscribers."""
        if event_type not in self.subscribers:
            return
      
        # Create tasks for all handlers
        tasks = [
            asyncio.create_task(handler(data))
            for handler in self.subscribers[event_type]
        ]
      
        # Wait for all handlers to complete
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
```

### Usage Example

```python
# Event handlers
async def log_user_login(user_data):
    await asyncio.sleep(0.1)  # Simulate logging
    print(f"LOGGED: User login - {user_data['username']}")

async def send_welcome_notification(user_data):
    await asyncio.sleep(0.3)  # Simulate notification sending
    print(f"NOTIFICATION: Welcome back, {user_data['username']}!")

async def update_last_login(user_data):
    await asyncio.sleep(0.2)  # Simulate database update
    print(f"DATABASE: Updated last login for {user_data['username']}")

async def main():
    # Create an event bus
    event_bus = EventBus()
  
    # Register event handlers
    event_bus.subscribe("user_login", log_user_login)
    event_bus.subscribe("user_login", send_welcome_notification)
    event_bus.subscribe("user_login", update_last_login)
  
    # Simulate a user login
    user = {"username": "alice", "user_id": 42}
    print("User logging in...")
    await event_bus.publish("user_login", user)
  
    # Event handlers will run concurrently
```

This pattern decouples components in your application, allowing them to communicate without direct dependencies. It's especially useful in asyncio applications where different parts need to respond to the same events independently.

## Pattern 5: Circuit Breaker

### The Problem

External services can fail or become slow, and naive retry mechanisms can make things worse.

### The Pattern

Implement a circuit breaker that prevents repeated calls to failing services, allowing them time to recover.

### Example Implementation

```python
import asyncio
import time
from enum import Enum, auto
from typing import Callable, Any, Awaitable, Optional

class CircuitState(Enum):
    CLOSED = auto()    # Normal operation - requests allowed
    OPEN = auto()      # Service appears down - requests blocked
    HALF_OPEN = auto() # Testing if service recovered

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 30.0,
        timeout: float = 10.0
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.timeout = timeout
      
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0
  
    async def call(
        self, 
        func: Callable[..., Awaitable[Any]], 
        *args: Any, 
        **kwargs: Any
    ) -> Any:
        """Call the protected function with circuit breaker logic."""
        if self.state == CircuitState.OPEN:
            # Check if recovery timeout has elapsed
            if time.time() - self.last_failure_time >= self.recovery_timeout:
                # Move to half-open state and allow a test request
                self.state = CircuitState.HALF_OPEN
                print("Circuit half-open, testing service...")
            else:
                # Circuit is open and timeout hasn't elapsed
                raise Exception("Circuit breaker is open - service unavailable")
      
        try:
            # Call the function with a timeout
            result = await asyncio.wait_for(func(*args, **kwargs), timeout=self.timeout)
          
            # If we're in half-open state and the call succeeded, reset the breaker
            if self.state == CircuitState.HALF_OPEN:
                self.reset()
                print("Service recovered, circuit closed")
          
            return result
          
        except Exception as e:
            # Record the failure
            self.failure_count += 1
            self.last_failure_time = time.time()
          
            # Check if we need to open the circuit
            if (self.state == CircuitState.CLOSED and 
                self.failure_count >= self.failure_threshold):
                self.state = CircuitState.OPEN
                print(f"Too many failures ({self.failure_count}), circuit opened")
          
            # Re-raise the exception
            raise
  
    def reset(self) -> None:
        """Reset the circuit breaker to its initial state."""
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = 0
```

### Usage Example

```python
# Simulate an unreliable service
async def unreliable_service(succeed: bool = True):
    await asyncio.sleep(0.5)  # Simulate service delay
    if not succeed:
        print("Service failed!")
        raise Exception("Service error")
    print("Service succeeded!")
    return "Service data"

async def main():
    # Create a circuit breaker
    breaker = CircuitBreaker(
        failure_threshold=3,  # Open after 3 failures
        recovery_timeout=5.0,  # Try again after 5 seconds
        timeout=1.0            # Timeout after 1 second
    )
  
    # Demonstrate circuit behavior
    for i in range(10):
        # Alternate between success and failure, then fail consistently
        should_succeed = (i < 4 and i % 2 == 0)
      
        try:
            print(f"\nAttempt {i+1}:")
            result = await breaker.call(unreliable_service, should_succeed)
            print(f"Result: {result}")
        except Exception as e:
            print(f"Error: {e}")
      
        # Pause between attempts
        await asyncio.sleep(1)
```

This pattern protects your application from cascading failures when external services experience problems, allowing them time to recover without overwhelming them with requests.

## Pattern 6: Asynchronous Iterator and Generator Pattern

### The Problem

Processing large datasets or continuous streams of data can strain memory resources if done all at once.

### The Pattern

Use asynchronous iterators and generators to process data incrementally and asynchronously.

### Example Implementation

```python
import asyncio
from typing import AsyncIterator, List, Any

class DataSource:
    """A mock data source that produces data asynchronously."""
  
    def __init__(self, items_count: int = 10, chunk_size: int = 3):
        self.items_count = items_count
        self.chunk_size = chunk_size
  
    async def fetch_data_chunk(self, start: int, size: int) -> List[Any]:
        """Simulate fetching a chunk of data asynchronously."""
        await asyncio.sleep(0.5)  # Simulate network delay
      
        end = min(start + size, self.items_count)
        return [f"Data-{i}" for i in range(start, end)]
  
    async def __aiter__(self) -> AsyncIterator[Any]:
        """Make this class an asynchronous iterator."""
        for start in range(0, self.items_count, self.chunk_size):
            chunk = await self.fetch_data_chunk(start, self.chunk_size)
            for item in chunk:
                yield item

async def data_processor(data_source: DataSource) -> List[str]:
    """Process data from an asynchronous iterator."""
    results = []
  
    # Process items one by one as they become available
    async for item in data_source:
        # Simulate processing each item
        await asyncio.sleep(0.1)
        processed = f"Processed-{item}"
        results.append(processed)
        print(f"Processed: {item} -> {processed}")
  
    return results
```

### Usage Example

```python
async def main():
    # Create a data source
    data_source = DataSource(items_count=10, chunk_size=3)
  
    # Process the data incrementally
    print("Starting data processing...")
    results = await data_processor(data_source)
  
    print(f"\nAll processing complete. Results: {results}")
```

This pattern allows your application to work with large datasets without loading everything into memory at once, and it naturally integrates with asyncio's event loop for efficient I/O operations.

## Pattern 7: Task Throttling and Rate Limiting

### The Problem

Running too many concurrent tasks can overwhelm system resources or exceed API rate limits.

### The Pattern

Implement throttling mechanisms to limit the number of concurrent tasks and control request rates.

### Example Implementation

```python
import asyncio
import time
from typing import List, Callable, Awaitable, Any, TypeVar

T = TypeVar('T')

class TaskThrottler:
    def __init__(self, max_concurrency: int = 5, rate_limit: int = 10, time_period: float = 1.0):
        """
        Initialize a task throttler.
      
        Args:
            max_concurrency: Maximum number of tasks to run concurrently
            rate_limit: Maximum number of tasks to start in time_period
            time_period: Time period in seconds for rate limiting
        """
        self.max_concurrency = max_concurrency
        self.rate_limit = rate_limit
        self.time_period = time_period
      
        self.semaphore = asyncio.Semaphore(max_concurrency)
        self.task_times: List[float] = []
  
    async def _rate_limit(self) -> None:
        """Enforce the rate limit by delaying if necessary."""
        now = time.time()
      
        # Remove timestamps older than our time period
        self.task_times = [t for t in self.task_times if now - t <= self.time_period]
      
        # If we've hit our rate limit, wait until we can run again
        if len(self.task_times) >= self.rate_limit:
            # Calculate how long to wait
            oldest = min(self.task_times)
            wait_time = self.time_period - (now - oldest)
            if wait_time > 0:
                print(f"Rate limit reached. Waiting {wait_time:.2f} seconds...")
                await asyncio.sleep(wait_time)
      
        # Record this task's start time
        self.task_times.append(time.time())
  
    async def run(self, func: Callable[..., Awaitable[T]], *args: Any, **kwargs: Any) -> T:
        """Run a task with throttling applied."""
        # Apply rate limiting first
        await self._rate_limit()
      
        # Then apply concurrency limiting
        async with self.semaphore:
            print(f"Running task with args: {args}")
            return await func(*args, **kwargs)
  
    async def gather(self, tasks: List[Callable[[], Awaitable[T]]]) -> List[T]:
        """Run multiple tasks with throttling."""
        return await asyncio.gather(*(self.run(task) for task in tasks))
```

### Usage Example

```python
async def mock_api_call(item_id: int) -> dict:
    """Simulate an API call that takes some time."""
    print(f"API call for item {item_id} started")
    await asyncio.sleep(1)  # Simulate API delay
    print(f"API call for item {item_id} completed")
    return {"id": item_id, "data": f"Result-{item_id}"}

async def main():
    # Create a throttler with max 3 concurrent tasks and 5 tasks per second
    throttler = TaskThrottler(max_concurrency=3, rate_limit=5, time_period=1.0)
  
    # Create a list of tasks to run
    item_ids = list(range(15))
  
    # Run all tasks with throttling
    print(f"Starting {len(item_ids)} API calls with throttling...")
  
    # Method 1: Run tasks one by one
    results = []
    for item_id in item_ids:
        result = await throttler.run(mock_api_call, item_id)
        results.append(result)
  
    # Method 2: Prepare task functions and run in batches
    # task_funcs = [lambda id=i: mock_api_call(id) for i in item_ids]
    # results = await throttler.gather(task_funcs)
  
    print(f"All API calls completed. Results count: {len(results)}")
```

This pattern prevents your application from overwhelming external services or consuming too many resources, while still maintaining efficient concurrency.

## Pattern 8: Timeouts and Cancellation

### The Problem

Asynchronous operations can hang indefinitely, and tasks need to be cancelled gracefully.

### The Pattern

Implement consistent timeout and cancellation handling for asynchronous operations.

### Example Implementation

```python
import asyncio
from typing import TypeVar, Awaitable, Optional, Dict, Any

T = TypeVar('T')

async def with_timeout(
    coro: Awaitable[T],
    timeout: float,
    timeout_result: Optional[T] = None,
    cancel_on_timeout: bool = True
) -> T:
    """
    Execute a coroutine with a timeout.
  
    Args:
        coro: Coroutine to execute
        timeout: Timeout in seconds
        timeout_result: Value to return if timeout occurs (if not None)
        cancel_on_timeout: Whether to cancel the task on timeout
      
    Returns:
        Result of coroutine or timeout_result if timeout occurs
      
    Raises:
        asyncio.TimeoutError: If timeout occurs and timeout_result is None
    """
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        if timeout_result is not None:
            return timeout_result
        raise

class GracefulCancellation:
    """Context manager for graceful cancellation of tasks."""
  
    def __init__(self):
        self.tasks: Dict[asyncio.Task, str] = {}
  
    async def __aenter__(self):
        return self
  
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type is asyncio.CancelledError:
            # Our containing task was cancelled, so cancel all child tasks
            self.cancel_all()
            # Wait for all tasks to complete cancellation
            if self.tasks:
                await asyncio.gather(*self.tasks, return_exceptions=True)
            # Don't suppress the CancelledError
            return False
        return False
  
    def create_task(self, coro: Awaitable[Any], name: str = None) -> asyncio.Task:
        """Create a task and track it for cancellation."""
        task = asyncio.create_task(coro)
        self.tasks[task] = name or "unnamed"
        # Set callback to clean up completed tasks
        task.add_done_callback(self._task_done)
        return task
  
    def _task_done(self, task: asyncio.Task) -> None:
        """Remove completed task from tracking."""
        self.tasks.pop(task, None)
  
    def cancel_all(self) -> None:
        """Cancel all tracked tasks."""
        for task, name in list(self.tasks.items()):
            print(f"Cancelling task: {name}")
            task.cancel()
```

### Usage Example

```python
async def potentially_slow_operation(duration: float) -> str:
    """Simulate an operation that might take too long."""
    print(f"Starting operation that takes {duration} seconds")
    try:
        await asyncio.sleep(duration)
        print("Operation completed successfully")
        return "Operation result"
    except asyncio.CancelledError:
        print("Operation was cancelled, doing cleanup...")
        # Simulate cleanup
        await asyncio.sleep(0.1)
        print("Cleanup completed")
        raise  # Re-raise to propagate cancellation

async def main():
    # Example 1: With timeout
    print("\nExample 1: With timeout")
    try:
        # This will timeout
        result = await with_timeout(
            potentially_slow_operation(5.0),
            timeout=2.0,
            timeout_result="Default result due to timeout"
        )
        print(f"Result: {result}")
    except asyncio.TimeoutError:
        print("Operation timed out without a default result")
  
    # Example 2: Graceful cancellation
    print("\nExample 2: Graceful cancellation")
    async with GracefulCancellation() as manager:
        # Start a few tasks
        manager.create_task(potentially_slow_operation(3.0), "task1")
        manager.create_task(potentially_slow_operation(4.0), "task2")
      
        # Wait a bit, then cancel everything
        await asyncio.sleep(1.0)
        print("Main task decides to cancel everything")
        manager.cancel_all()
      
        # Wait for cancellation cleanup to complete
        await asyncio.sleep(0.2)
  
    print("\nAll examples completed")
```

This pattern ensures your application handles timeouts and cancellations consistently, preventing resource leaks and ensuring proper cleanup.

## Pattern 9: Dependency Injection for Asyncio Components

### The Problem

Testing asynchronous code is challenging, especially when components have direct dependencies on other asynchronous services.

### The Pattern

Use dependency injection to provide mock implementations for testing and flexibility in component composition.

### Example Implementation

```python
import asyncio
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

# Abstract interfaces
class DataStorage(ABC):
    @abstractmethod
    async def save(self, key: str, data: Any) -> None:
        pass
  
    @abstractmethod
    async def load(self, key: str) -> Optional[Any]:
        pass

class NotificationService(ABC):
    @abstractmethod
    async def send_notification(self, user_id: str, message: str) -> bool:
        pass

# Concrete implementations
class RedisStorage(DataStorage):
    async def save(self, key: str, data: Any) -> None:
        print(f"Redis: Saving {data} to {key}")
        await asyncio.sleep(0.1)  # Simulate Redis operation
  
    async def load(self, key: str) -> Optional[Any]:
        print(f"Redis: Loading from {key}")
        await asyncio.sleep(0.1)  # Simulate Redis operation
        return {"sample": "data", "key": key}

class EmailNotifier(NotificationService):
    async def send_notification(self, user_id: str, message: str) -> bool:
        print(f"Email: Sending '{message}' to user {user_id}")
        await asyncio.sleep(0.2)  # Simulate email sending
        return True

# Class using dependencies
class UserService:
    def __init__(
        self, 
        storage: DataStorage,
        notifier: NotificationService
    ):
        self.storage = storage
        self.notifier = notifier
  
    async def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> bool:
        """Update a user's profile and notify them."""
        try:
            # Store the updated profile
            await self.storage.save(f"user:{user_id}:profile", profile_data)
          
            # Notify the user
            await self.notifier.send_notification(
                user_id,
                f"Your profile has been updated with {len(profile_data)} fields."
            )
          
            return True
        except Exception as e:
            print(f"Error updating profile: {e}")
            return False
```

### Usage Example

```python
# Mock implementations for testing
class MockStorage(DataStorage):
    def __init__(self):
        self.data = {}
  
    async def save(self, key: str, data: Any) -> None:
        print(f"Mock: Saving {data} to {key}")
        self.data[key] = data
  
    async def load(self, key: str) -> Optional[Any]:
        print(f"Mock: Loading from {key}")
        return self.data.get(key)

class MockNotifier(NotificationService):
    def __init__(self):
        self.notifications = []
  
    async def send_notification(self, user_id: str, message: str) -> bool:
        print(f"Mock: Recording notification to {user_id}: {message}")
        self.notifications.append((user_id, message))
        return True

async def main():
    # Example 1: Production setup
    print("Example 1: Production setup")
    real_service = UserService(
        storage=RedisStorage(),
        notifier=EmailNotifier()
    )
  
    await real_service.update_user_profile(
        "user123",
        {"name": "Alice", "email": "alice@example.com"}
    )
  
    # Example 2: Testing setup
    print("\nExample 2: Testing setup")
    mock_storage = MockStorage()
    mock_notifier = MockNotifier()
  
    test_service = UserService(
        storage=mock_storage,
        notifier=mock_notifier
    )
  
    await test_service.update_user_profile(
        "test_user",
        {"name": "Test User", "email": "test@example.com"}
    )
  
    # Verify the results
    print("\nTest Verification:")
    print(f"Storage contains: {mock_storage.data}")
    print(f"Notifications sent: {mock_notifier.notifications}")
```

This pattern makes your asyncio components more testable and loosely coupled, allowing for easier testing and flexibility in component composition.

## Pattern 10: Structured Concurrency

### The Problem

Managing the lifetime and scope of related asynchronous tasks can be error-prone, leading to "forgotten" tasks or resource leaks.

### The Pattern

Use structured concurrency to ensure that related tasks share the same lifecycle and that parent tasks don't complete until all child tasks are done.

### Example Implementation

```python
import asyncio
import contextlib
from typing import AsyncIterator, List, Callable, Awaitable, TypeVar, Any

T = TypeVar('T')

@contextlib.asynccontextmanager
async def task_group() -> AsyncIterator[List[asyncio.Task]]:
    """
    A context manager that ensures all tasks started within it complete before exiting.
  
    Yields:
        A list to which tasks can be appended
    """
    tasks: List[asyncio.Task] = []
    try:
        yield tasks
        # Wait for all tasks to complete, if there are any
        if tasks:
            await asyncio.gather(*tasks)
    finally:
        # Cancel any remaining tasks
        for task in tasks:
            if not task.done():
                task.cancel()
    
        # Wait for cancellations to complete
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

async def run_concurrently(
    funcs: List[Callable[..., Awaitable[T]]],
    *args: Any,
    **kwargs: Any
) -> List[T]:
    """
    Run a list of functions concurrently within a task group.
    
    Args:
        funcs: List of async functions to run
        *args, **kwargs: Arguments to pass to each function
    
    Returns:
        List of results from the functions
    """
    results: List[T] = [None] * len(funcs)  # Pre-allocate result slots
    
    async def run_task(index: int, func: Callable[..., Awaitable[T]]) -> None:
        """Run a task and store its result at the correct index."""
        results[index] = await func(*args, **kwargs)
    
    async with task_group() as tasks:
        # Create a task for each function
        for i, func in enumerate(funcs):
            tasks.append(asyncio.create_task(run_task(i, func)))
    
    return results
```

### Usage Example

```python
async def fetch_user(user_id: str) -> dict:
    """Simulate fetching user data."""
    print(f"Fetching user {user_id}...")
    await asyncio.sleep(1)
    return {"id": user_id, "name": f"User {user_id}"}

async def fetch_orders(user_id: str) -> list:
    """Simulate fetching user orders."""
    print(f"Fetching orders for user {user_id}...")
    await asyncio.sleep(1.5)
    return [{"order_id": f"{user_id}-001"}, {"order_id": f"{user_id}-002"}]

async def process_user_dashboard(user_id: str) -> dict:
    """Process a user dashboard with structured concurrency."""
    print(f"Building dashboard for user {user_id}")
    
    async with task_group() as tasks:
        # Start concurrent fetch operations
        user_task = asyncio.create_task(fetch_user(user_id))
        orders_task = asyncio.create_task(fetch_orders(user_id))
        
        tasks.append(user_task)
        tasks.append(orders_task)
    
    # Both tasks are guaranteed to be complete here
    user_data = user_task.result()
    orders_data = orders_task.result()
    
    # Combine the results
    dashboard = {
        "user": user_data,
        "recent_orders": orders_data,
        "order_count": len(orders_data)
    }
    
    print(f"Dashboard completed for {user_data['name']}")
    return dashboard

async def main():
    # Example: Using task group
    print("Example: Using task group for structured concurrency")
    dashboard = await process_user_dashboard("123")
    print(f"Dashboard result: {dashboard}")
    
    # Example: Using run_concurrently helper
    print("\nExample: Using run_concurrently helper")
    [user, orders] = await run_concurrently(
        [
            lambda: fetch_user("456"),
            lambda: fetch_orders("456")
        ]
    )
    print(f"Results: User={user}, Orders={orders}")
```

This pattern ensures proper resource management and error propagation in hierarchical task structures, making asyncio applications more robust and easier to reason about.

## Pattern 11: Asynchronous Factory Pattern

### The Problem

Creating objects that require asynchronous initialization is challenging with traditional factory patterns.

### The Pattern

Use asynchronous factory methods to properly initialize objects that require async operations during creation.

### Example Implementation

```python
import asyncio
from typing import Dict, Any, Optional, List, Type, TypeVar

T = TypeVar('T', bound='DatabaseClient')

class DatabaseClient:
    """A database client that requires async initialization."""
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.is_connected = False
        self.db_version: Optional[str] = None
    
    @classmethod
    async def create(cls: Type[T], connection_string: str) -> T:
        """
        Asynchronous factory method to create and initialize a client.
        
        Args:
            connection_string: Database connection string
        
        Returns:
            Initialized database client
        """
        # Create the instance
        instance = cls(connection_string)
        
        # Initialize it asynchronously
        await instance.connect()
        
        return instance
    
    async def connect(self) -> None:
        """Connect to the database."""
        if self.is_connected:
            return
        
        print(f"Connecting to database at {self.connection_string}...")
        await asyncio.sleep(1)  # Simulate connection delay
        
        self.is_connected = True
        self.db_version = "PostgreSQL 14.2"
        print(f"Connected to {self.db_version}")
    
    async def execute_query(self, query: str) -> List[Dict[str, Any]]:
        """Execute a database query."""
        if not self.is_connected:
            raise RuntimeError("Not connected to database")
        
        print(f"Executing query: {query}")
        await asyncio.sleep(0.5)  # Simulate query execution
        
        return [{"result": "example_data", "query": query}]
    
    async def close(self) -> None:
        """Close the database connection."""
        if self.is_connected:
            print("Closing database connection...")
            await asyncio.sleep(0.3)  # Simulate closing connection
            self.is_connected = False
            print("Connection closed")
```

### Usage Example

```python
async def main():
    # Using the async factory pattern
    print("Creating database client...")
    
    # This ensures the client is fully initialized before we get it
    db = await DatabaseClient.create("postgresql://localhost/mydb")
    
    # Now we can use the client
    print(f"DB Version: {db.db_version}")
    results = await db.execute_query("SELECT * FROM users LIMIT 5")
    print(f"Query results: {results}")
    
    # Don't forget to clean up
    await db.close()
```

This pattern ensures objects requiring async initialization are properly set up before use, preventing subtle bugs from incompletely initialized objects.

## Pattern 12: Supervisors and Workers

### The Problem

Managing a pool of worker tasks that can fail independently and need supervision.

### The Pattern

Implement a supervisor that monitors worker tasks, restarting them if they fail and maintaining desired system behavior.

### Example Implementation

```python
import asyncio
import random
import time
from typing import List, Callable, Awaitable, Any, Optional

class WorkerSupervisor:
    """
    A supervisor that manages a pool of worker tasks.
    """
    
    def __init__(
        self,
        worker_factory: Callable[[int], Awaitable[None]],
        worker_count: int = 3,
        max_restarts: int = 5,
        restart_delay: float = 1.0
    ):
        """
        Initialize the supervisor.
        
        Args:
            worker_factory: Function to create a worker task
            worker_count: Number of workers to maintain
            max_restarts: Maximum number of restarts per worker
            restart_delay: Delay between restarts in seconds
        """
        self.worker_factory = worker_factory
        self.worker_count = worker_count
        self.max_restarts = max_restarts
        self.restart_delay = restart_delay
        
        self.workers: List[asyncio.Task] = []
        self.restart_counts: List[int] = [0] * worker_count
        self.running = False
        self.supervisor_task: Optional[asyncio.Task] = None
    
    async def start(self) -> None:
        """Start the supervisor and worker pool."""
        if self.running:
            return
        
        self.running = True
        self.restart_counts = [0] * self.worker_count
        
        # Start the supervisor task
        self.supervisor_task = asyncio.create_task(self._supervise())
        print("Supervisor started")
    
    async def stop(self) -> None:
        """Stop the supervisor and all workers."""
        if not self.running:
            return
        
        self.running = False
        
        # Cancel the supervisor
        if self.supervisor_task:
            self.supervisor_task.cancel()
            try:
                await self.supervisor_task
            except asyncio.CancelledError:
                pass
        
        # Cancel all workers
        for worker in self.workers:
            if not worker.done():
                worker.cancel()
        
        # Wait for workers to cancel
        if self.workers:
            await asyncio.gather(*self.workers, return_exceptions=True)
        
        self.workers = []
        print("Supervisor and workers stopped")
    
    async def _supervise(self) -> None:
        """Main supervision loop."""
        # Start initial workers
        for i in range(self.worker_count):
            self._start_worker(i)
        
        # Supervision loop
        while self.running:
            # Check each worker
            for i, worker in enumerate(self.workers.copy()):
                if worker.done():
                    # Worker has completed or failed
                    try:
                        await worker
                        print(f"Worker {i} completed normally")
                    except asyncio.CancelledError:
                        print(f"Worker {i} was cancelled")
                    except Exception as e:
                        print(f"Worker {i} failed with error: {e}")
                        
                        # Restart the worker if under max_restarts
                        if self.restart_counts[i] < self.max_restarts:
                            self.restart_counts[i] += 1
                            print(f"Restarting worker {i} (attempt {self.restart_counts[i]})")
                            await asyncio.sleep(self.restart_delay)
                            self._start_worker(i)
                        else:
                            print(f"Worker {i} exceeded max restarts")
            
            # Wait before next check
            await asyncio.sleep(0.5)
    
    def _start_worker(self, index: int) -> None:
        """Start a worker at the specified index."""
        if index < len(self.workers):
            # Replace existing worker slot
            self.workers[index] = asyncio.create_task(self.worker_factory(index))
        else:
            # Add new worker
            self.workers.append(asyncio.create_task(self.worker_factory(index)))
```

### Usage Example

```python
async def unreliable_worker(worker_id: int) -> None:
    """A worker that occasionally fails."""
    print(f"Worker {worker_id} started")
    
    # Simulate some work time
    work_time = random.uniform(2.0, 5.0)
    
    try:
        for i in range(int(work_time * 2)):
            print(f"Worker {worker_id} processing task {i}")
            await asyncio.sleep(0.5)
            
            # Randomly fail sometimes
            if random.random() < 0.2:
                raise Exception(f"Worker {worker_id} random failure")
        
        print(f"Worker {worker_id} completed successfully")
    except asyncio.CancelledError:
        print(f"Worker {worker_id} cancelled during operation")
        raise

async def main():
    # Create a supervisor with 3 workers
    supervisor = WorkerSupervisor(
        worker_factory=unreliable_worker,
        worker_count=3,
        max_restarts=3,
        restart_delay=1.0
    )
    
    # Start the supervisor
    await supervisor.start()
    
    # Let it run for a while
    try:
        print("System running, press Ctrl+C to stop...")
        await asyncio.sleep(20)
    except asyncio.CancelledError:
        print("Main task cancelled")
    finally:
        # Stop the supervisor and workers
        await supervisor.stop()
    
    print("System shutdown complete")
```

This pattern creates robust systems that can self-heal when components fail, maintaining desired service levels despite individual component failures.

## Combining Patterns for Real-World Applications

Now that we've explored these patterns individually, let's discuss how they can be combined to create robust asyncio applications.

### Example: Resilient Web Service Client

```python
import asyncio
import time
from typing import Any, Dict, Optional, TypeVar, Type

T = TypeVar('T', bound='WebServiceClient')

class WebServiceClient:
    """
    A resilient web service client combining multiple asyncio patterns.
    
    Patterns used:
    1. Asynchronous Factory Pattern
    2. Circuit Breaker Pattern
    3. Timeouts and Cancellation
    4. Task Throttling and Rate Limiting
    """
    
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.initialized = False
        
        # Circuit breaker state
        self.failure_count = 0
        self.circuit_open = False
        self.last_failure_time = 0
        self.failure_threshold = 5
        self.recovery_timeout = 10.0
        
        # Rate limiting
        self.max_requests_per_minute = 30
        self.request_times = []
        
        # Concurrency control
        self.max_concurrent_requests = 5
        self.semaphore = asyncio.Semaphore(self.max_concurrent_requests)
    
    @classmethod
    async def create(cls: Type[T], base_url: str) -> T:
        """Asynchronous factory method."""
        client = cls(base_url)
        await client.initialize()
        return client
    
    async def initialize(self) -> None:
        """Initialize the client."""
        if self.initialized:
            return
        
        print(f"Initializing client for {self.base_url}...")
        # Simulate API call to get service info
        await asyncio.sleep(0.5)
        
        self.initialized = True
        print("Client initialized")
    
    async def _enforce_rate_limit(self) -> None:
        """Enforce the rate limit."""
        now = time.time()
        minute_ago = now - 60
        
        # Remove old request timestamps
        self.request_times = [t for t in self.request_times if t > minute_ago]
        
        # Check if we're over the limit
        if len(self.request_times) >= self.max_requests_per_minute:
            # Calculate wait time
            oldest = self.request_times[0]
            wait_time = 60 - (now - oldest)
            print(f"Rate limit reached, waiting {wait_time:.2f} seconds...")
            await asyncio.sleep(wait_time)
        
        # Record this request
        self.request_times.append(time.time())
    
    async def _check_circuit_breaker(self) -> bool:
        """Check if circuit breaker allows the request."""
        if not self.circuit_open:
            return True
        
        # Check if recovery timeout has elapsed
        now = time.time()
        if now - self.last_failure_time > self.recovery_timeout:
            print("Circuit half-open, allowing test request...")
            return True
        
        print("Circuit open, request blocked")
        return False
    
    async def request(
        self, 
        endpoint: str, 
        timeout: float = 5.0,
        default_result: Any = None
    ) -> Dict[str, Any]:
        """Make a request to the web service with all resilience patterns applied."""
        if not self.initialized:
            raise RuntimeError("Client not initialized")
        
        # Apply rate limiting
        await self._enforce_rate_limit()
        
        # Check circuit breaker
        if not await self._check_circuit_breaker():
            if default_result is not None:
                return default_result
            raise Exception("Circuit breaker open")
        
        # Apply concurrency limiting
        async with self.semaphore:
            url = f"{self.base_url}/{endpoint}"
            print(f"Making request to {url}")
            
            try:
                # Apply timeout
                return await asyncio.wait_for(
                    self._do_request(url), 
                    timeout=timeout
                )
            except asyncio.TimeoutError:
                print(f"Request to {url} timed out after {timeout} seconds")
                self._record_failure()
                if default_result is not None:
                    return default_result
                raise
            except Exception as e:
                print(f"Request to {url} failed: {e}")
                self._record_failure()
                if default_result is not None:
                    return default_result
                raise
    
    async def _do_request(self, url: str) -> Dict[str, Any]:
        """Perform the actual request."""
        # Simulate network call
        await asyncio.sleep(random.uniform(0.1, 0.8))
        
        # Randomly fail sometimes
        if random.random() < 0.3:
            raise Exception("Service unavailable")
        
        # Simulate successful response
        return {"success": True, "data": f"Response from {url}", "timestamp": time.time()}
    
    def _record_failure(self) -> None:
        """Record a failure for circuit breaker logic."""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            print(f"Circuit opened after {self.failure_count} failures")
            self.circuit_open = True
```

### Usage Example

```python
async def main():
    # Create the client
    client = await WebServiceClient.create("https://api.example.com")
    
    # Make multiple requests to demonstrate the patterns
    tasks = []
    for i in range(20):
        tasks.append(
            client.request(
                f"endpoint/{i}",
                timeout=2.0,
                default_result={"success": False, "fallback": True}
            )
        )
    
    # Wait for all requests to complete
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Analyze the results
    success_count = sum(1 for r in results if isinstance(r, dict) and r.get("success") is True)
    fallback_count = sum(1 for r in results if isinstance(r, dict) and r.get("fallback") is True)
    error_count = sum(1 for r in results if isinstance(r, Exception))
    
    print(f"\nResults Summary:")
    print(f"  Successful requests: {success_count}")
    print(f"  Fallback responses: {fallback_count}")
    print(f"  Error responses: {error_count}")
```

## Conclusion: Best Practices for Asyncio Design Patterns

As we've explored these design patterns, several key principles emerge for designing robust asyncio applications:

1. **Explicit Task Management**: Always track and manage tasks explicitly. Untracked tasks can lead to resource leaks and unexpected behavior.

2. **Structured Concurrency**: Group related tasks together and ensure parent tasks don't complete until all child tasks are done, using constructs like `task_group`.

3. **Proper Resource Management**: Use asynchronous context managers (`async with`) to handle resources that require asynchronous cleanup.

4. **Error Handling and Resilience**: Implement patterns like Circuit Breaker and Task Throttling to make your application resilient to failures and overload.

5. **Timeouts and Cancellation**: Always use timeouts for operations that could hang and handle cancellation gracefully.

6. **Dependency Injection**: Design components with injectable dependencies to make testing easier and components more loosely coupled.

7. **Event-Driven Architecture**: Use event systems to decouple components and allow for more flexible interactions.

8. **Incremental Processing**: Use asynchronous iterators and generators to process large datasets incrementally.

9. **Rate Limiting and Backpressure**: Implement mechanisms to control the rate of operations and prevent overwhelming system resources.

10. **Supervision Hierarchies**: Design systems with clear supervision hierarchies to handle component failures and maintain system health.

By applying these patterns and principles, you can create asyncio applications that are robust, maintainable, and efficient. Each pattern addresses specific challenges in asynchronous programming, and combining them allows you to create sophisticated systems that handle concurrency with elegance.

Remember that the true power of asyncio comes not just from its concurrency model, but from how you structure your application to take advantage of it. These design patterns provide battle-tested approaches to common challenges, helping you build applications that are both powerful and reliable.