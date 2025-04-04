# Running Your First Async Program: From First Principles to Practical Implementation

## Understanding the Need for Asynchronous Programming

Let's begin by understanding why we need asynchronous programming in the first place. Consider how we typically interact with the world around us.

When you're cooking dinner, you don't stand motionless watching the water boil. Instead, you might chop vegetables while waiting. In computer terms, you're not "blocking" on the water boiling operation - you're able to make progress on other tasks.

Traditional (synchronous) programming doesn't work this way. If a Python program needs to fetch data from a server, the entire program waits - doing nothing - until that operation completes. This is incredibly inefficient, similar to staring at a pot of water until it boils while the vegetables sit unchopped.

Asynchronous programming solves this problem by allowing your code to continue executing while waiting for operations to complete. It's particularly valuable for I/O-bound applications that spend most of their time waiting for:

* Network requests (API calls, web scraping)
* File operations (reading/writing files)
* Database queries
* User input

## The Evolution of Async Programming in Python

Python's journey to modern async programming has been evolutionary:

1. **Callbacks** : Early async code used callbacks, where you provide a function to be executed when an operation completes.
2. **Generators** : Python enhanced generators with `yield from` (PEP 380), allowing generators to delegate to sub-generators.
3. **Coroutines** : Python 3.4 introduced the asyncio library with coroutines based on generators.
4. **async/await** : Python 3.5 introduced native coroutines with the `async` and `await` syntax (PEP 492), making async code more readable.

Modern Python async code uses the `async`/`await` syntax, which is what we'll focus on.

## The Conceptual Foundation: Event Loop, Coroutines, and Tasks

Before writing our first program, let's understand the key components:

### The Event Loop

The event loop is the central execution mechanism for async programs. Think of it as a conductor in an orchestra, deciding which sections play when. The event loop:

1. Maintains a queue of tasks to be executed
2. Knows which tasks are ready to run
3. Decides which task to execute next
4. Handles the scheduling of delayed tasks

When a task needs to wait for something (like a network response), it yields control back to the event loop, which can run other tasks in the meantime.

### Coroutines

A coroutine is a special function that can pause execution and yield control back to the event loop. It's defined using the `async def` syntax:

```python
async def my_coroutine():
    # This is a coroutine
    pass
```

The key difference between a regular function and a coroutine is that a coroutine can contain `await` expressions, which temporarily pause the coroutine's execution.

### Tasks

A task is a wrapper around a coroutine that schedules it to run on the event loop. When you create a task from a coroutine, it's scheduled to run as soon as possible.

## Setting Up Your Environment

Before we write our first async program, make sure you have:

1. **Python 3.7+** : While asyncio is available from Python 3.4, the more modern versions provide better syntax and functionality.
2. **A text editor or IDE** : Any editor will work, but ones with good Python support (like VS Code, PyCharm, or Sublime Text) will make your life easier.

No external packages are needed for basic asyncio functionality - it's part of the Python standard library.

## Your First Async Program: Hello, Async World!

Let's start with the simplest possible async program:

```python
import asyncio

async def hello_world():
    print("Hello")
    await asyncio.sleep(1)  # Pause for 1 second
    print("World")

# Run the coroutine
asyncio.run(hello_world())
```

Let's break this down:

1. We import the `asyncio` module, which provides the infrastructure for writing async code.
2. We define a coroutine called `hello_world` using `async def`.
3. Inside the coroutine, we print "Hello", then pause for 1 second using `await asyncio.sleep(1)`, then print "World".
4. We run the coroutine using `asyncio.run()`, which takes care of creating an event loop, running the coroutine, and closing the loop when done.

When you run this program, you'll see:

```
Hello
# 1 second pause
World
```

While this example doesn't showcase the full power of async programming (since we're only running one coroutine), it demonstrates the basic structure.

## The Anatomy of an Async Function

Let's look more closely at our coroutine:

```python
async def hello_world():
    print("Hello")
    await asyncio.sleep(1)
    print("World")
```

The `async def` syntax defines this as a coroutine function. When called, it doesn't execute immediately but returns a coroutine object.

The `await` keyword is used to pause the execution of the coroutine until the awaited operation (in this case, `asyncio.sleep(1)`) completes. During this pause, the event loop can run other coroutines.

It's important to understand that `await` can only be used inside an `async def` function. If you try to use it in a regular function, you'll get a syntax error.

## Running Multiple Coroutines Concurrently

The real power of async programming comes from running multiple coroutines concurrently. Let's modify our example to run multiple coroutines:

```python
import asyncio
import time

async def say(delay, message):
    await asyncio.sleep(delay)
    print(message)

async def main():
    start_time = time.time()
  
    # These will run concurrently:
    await asyncio.gather(
        say(1, "Hello"),
        say(2, "World"),
        say(3, "from"),
        say(4, "asyncio!")
    )
  
    end_time = time.time()
    print(f"Total execution time: {end_time - start_time:.2f} seconds")

# Run the main coroutine
asyncio.run(main())
```

When you run this program, you'll see:

```
Hello       # After 1 second
World       # After 2 seconds
from        # After 3 seconds
asyncio!    # After 4 seconds
Total execution time: 4.00 seconds
```

Notice that the total execution time is about 4 seconds, not 10 seconds (1+2+3+4). This is because the coroutines run concurrently, not sequentially.

Let's break down the new concepts:

1. `asyncio.gather()` runs multiple coroutines concurrently and waits for all of them to complete. It returns a list of their results in the same order.
2. We've created a `main()` coroutine that orchestrates the execution of our other coroutines. This is a common pattern in async Python programs.

## Understanding the Execution Flow: The Event Loop in Action

To better understand how the event loop works, let's modify our example to include print statements showing when each coroutine starts and finishes:

```python
import asyncio
import time

async def task(name, delay):
    print(f"{time.time():.2f}: {name} starting, will sleep for {delay} seconds")
    await asyncio.sleep(delay)
    print(f"{time.time():.2f}: {name} finished after {delay} seconds")
    return f"{name} result"

async def main():
    start_time = time.time()
    print(f"{start_time:.2f}: Main starting")
  
    results = await asyncio.gather(
        task("Task 1", 2),
        task("Task 2", 1),
        task("Task 3", 3)
    )
  
    end_time = time.time()
    print(f"{end_time:.2f}: Main finished, total time: {end_time - start_time:.2f} seconds")
    print(f"Results: {results}")

asyncio.run(main())
```

When you run this, you'll see output like:

```
1649267100.23: Main starting
1649267100.23: Task 1 starting, will sleep for 2 seconds
1649267100.23: Task 2 starting, will sleep for 1 seconds
1649267100.23: Task 3 starting, will sleep for 3 seconds
1649267101.24: Task 2 finished after 1 seconds
1649267102.24: Task 1 finished after 2 seconds
1649267103.24: Task 3 finished after 3 seconds
1649267103.24: Main finished, total time: 3.01 seconds
Results: ['Task 1 result', 'Task 2 result', 'Task 3 result']
```

Here's what's happening:

1. All three tasks start almost simultaneously
2. Task 2 finishes first (after 1 second)
3. Task 1 finishes next (after 2 seconds)
4. Task 3 finishes last (after 3 seconds)
5. `asyncio.gather()` collects all the results and returns them in the same order as the tasks were passed in (not in the order they completed)

This illustrates how the event loop allows multiple coroutines to run concurrently, making progress independently.

## A Real-World Example: Making HTTP Requests

Let's build a more practical example that demonstrates the power of async programming: fetching multiple URLs concurrently.

For HTTP requests, we'll use the `aiohttp` library, which is designed for async HTTP requests. First, install it:

```bash
pip install aiohttp
```

Now, let's write a program that fetches multiple URLs concurrently:

```python
import asyncio
import aiohttp
import time

async def fetch_url(session, url):
    start_time = time.time()
    print(f"Starting to fetch {url}")
  
    async with session.get(url) as response:
        html = await response.text()
        elapsed = time.time() - start_time
        print(f"Fetched {url} ({len(html)} bytes) in {elapsed:.2f} seconds")
        return html

async def main():
    urls = [
        "https://www.example.com",
        "https://www.python.org",
        "https://www.github.com"
    ]
  
    start_time = time.time()
  
    # Using a client session for connection pooling
    async with aiohttp.ClientSession() as session:
        # Create a list of coroutines
        tasks = [fetch_url(session, url) for url in urls]
      
        # Run the coroutines concurrently
        results = await asyncio.gather(*tasks)
      
        # Print a summary
        total_bytes = sum(len(result) for result in results)
        elapsed = time.time() - start_time
        print(f"Fetched {len(urls)} URLs with {total_bytes} total bytes in {elapsed:.2f} seconds")

asyncio.run(main())
```

When you run this program, you'll see that it fetches all three URLs concurrently, significantly faster than if you fetched them sequentially.

Let's explore some key concepts in this example:

1. **Session Context Manager** : `aiohttp.ClientSession()` is used as an async context manager (`async with`), which ensures proper resource cleanup.
2. **Task Creation** : We create a list of coroutines with a list comprehension, then unpack this list into `asyncio.gather()` using the `*` operator.
3. **Nested Awaits** : Inside `fetch_url()`, we await the response object (`await response.text()`). This showcases how awaits can be nested.

## Comparing Synchronous vs. Asynchronous Execution

To truly appreciate the benefits of async programming, let's compare sync and async approaches for the same task:

```python
import asyncio
import aiohttp
import requests
import time

# Synchronous version
def fetch_url_sync(url):
    start_time = time.time()
    print(f"Starting to fetch {url} (sync)")
  
    response = requests.get(url)
    html = response.text
  
    elapsed = time.time() - start_time
    print(f"Fetched {url} ({len(html)} bytes) in {elapsed:.2f} seconds (sync)")
    return html

def main_sync():
    urls = [
        "https://www.example.com",
        "https://www.python.org",
        "https://www.github.com"
    ]
  
    start_time = time.time()
  
    # Fetch URLs sequentially
    results = [fetch_url_sync(url) for url in urls]
  
    total_bytes = sum(len(result) for result in results)
    elapsed = time.time() - start_time
    print(f"Fetched {len(urls)} URLs with {total_bytes} total bytes in {elapsed:.2f} seconds (sync)")

# Asynchronous version
async def fetch_url_async(session, url):
    start_time = time.time()
    print(f"Starting to fetch {url} (async)")
  
    async with session.get(url) as response:
        html = await response.text()
      
        elapsed = time.time() - start_time
        print(f"Fetched {url} ({len(html)} bytes) in {elapsed:.2f} seconds (async)")
        return html

async def main_async():
    urls = [
        "https://www.example.com",
        "https://www.python.org",
        "https://www.github.com"
    ]
  
    start_time = time.time()
  
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url_async(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
  
    total_bytes = sum(len(result) for result in results)
    elapsed = time.time() - start_time
    print(f"Fetched {len(urls)} URLs with {total_bytes} total bytes in {elapsed:.2f} seconds (async)")

# Run both versions for comparison
print("Running synchronous version...")
main_sync()

print("\nRunning asynchronous version...")
asyncio.run(main_async())
```

When you run this program, you'll likely see that the async version is significantly faster. This is because it makes all the HTTP requests concurrently, while the sync version makes them one after another.

## Error Handling in Async Programs

Error handling in async programs uses familiar try/except blocks, but with some important differences:

```python
import asyncio
import aiohttp

async def fetch_url(session, url):
    try:
        async with session.get(url, timeout=2) as response:
            if response.status == 200:
                return await response.text()
            else:
                print(f"Error fetching {url}: HTTP {response.status}")
                return None
    except aiohttp.ClientError as e:
        print(f"Client error fetching {url}: {e}")
        return None
    except asyncio.TimeoutError:
        print(f"Timeout fetching {url}")
        return None
    except Exception as e:
        print(f"Unexpected error fetching {url}: {e}")
        return None

async def main():
    urls = [
        "https://www.example.com",
        "https://www.nonexistent-website-xyz.com",  # This will fail
        "https://www.python.org"
    ]
  
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=False)
  
    # Count successful fetches
    successful = sum(1 for result in results if result is not None)
    print(f"Successfully fetched {successful} out of {len(urls)} URLs")

asyncio.run(main())
```

Key points about error handling:

1. **Local Error Handling** : In `fetch_url()`, we catch exceptions and return `None` to indicate failure.
2. **gather() Error Handling** : By default, if any task in `asyncio.gather()` raises an exception, it propagates and cancels all other tasks. The `return_exceptions=True` parameter changes this behavior to return exceptions as results instead.
3. **Timeout Handling** : We set a timeout for the HTTP request to prevent it from hanging indefinitely.

## Cancellation and Cleanup

In async programs, it's important to properly handle cancellation and cleanup. Let's see how:

```python
import asyncio
import signal
import sys

async def cleanup():
    print("Performing cleanup...")
    await asyncio.sleep(1)  # Simulate cleanup work
    print("Cleanup complete")

async def long_running_task():
    try:
        print("Task started")
        for i in range(10):
            print(f"Working... ({i+1}/10)")
            await asyncio.sleep(1)
        print("Task completed normally")
    except asyncio.CancelledError:
        print("Task was cancelled, performing cleanup...")
        await cleanup()
        raise  # Re-raise to propagate cancellation

async def main():
    task = asyncio.create_task(long_running_task())
  
    # Wait for either the task to complete or for a keyboard interrupt
    try:
        await task
    except asyncio.CancelledError:
        print("Main caught cancellation")
  
    print("Main exiting")

# Set up signal handling for graceful shutdown
loop = asyncio.get_event_loop()

def signal_handler():
    print("Interrupt received, cancelling tasks...")
    for task in asyncio.all_tasks(loop):
        task.cancel()

for sig in (signal.SIGINT, signal.SIGTERM):
    loop.add_signal_handler(sig, signal_handler)

try:
    loop.run_until_complete(main())
finally:
    loop.close()
```

This example demonstrates:

1. **Handling CancelledError** : When a task is cancelled, it raises `asyncio.CancelledError`. We catch this to perform cleanup.
2. **Signal Handling** : We set up handlers for SIGINT (Ctrl+C) and SIGTERM to gracefully cancel tasks.
3. **Task Cancellation** : We use `task.cancel()` to request cancellation of a task.
4. **Re-raising CancelledError** : After cleanup, we re-raise the exception to ensure proper propagation.

## Advanced Concepts for Your First Programs

As you become more comfortable with async programming, here are some advanced concepts to explore:

### 1. Task Groups (Python 3.11+)

Python 3.11 introduced TaskGroups, which provide a cleaner way to manage related tasks:

```python
# Requires Python 3.11+
import asyncio

async def task(name, delay):
    await asyncio.sleep(delay)
    return f"{name} result"

async def main():
    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(task("Task 1", 1))
        task2 = tg.create_task(task("Task 2", 2))
        task3 = tg.create_task(task("Task 3", 3))
  
    # All tasks are guaranteed to be done here
    print(f"Results: {task1.result()}, {task2.result()}, {task3.result()}")

asyncio.run(main())
```

### 2. Handling Slow Operations with Timeouts

You can use timeouts to prevent operations from taking too long:

```python
import asyncio

async def slow_operation():
    print("Slow operation started")
    await asyncio.sleep(5)  # Simulate a slow operation
    return "Slow operation result"

async def main():
    try:
        # Wait for slow_operation(), but only for 2 seconds
        result = await asyncio.wait_for(slow_operation(), timeout=2)
        print(f"Result: {result}")
    except asyncio.TimeoutError:
        print("Operation timed out")

asyncio.run(main())
```

### 3. Running Synchronous Code in a Separate Thread

For operations that are inherently synchronous (like CPU-bound tasks), you can use `run_in_executor`:

```python
import asyncio
import time
import concurrent.futures

def cpu_bound_task(n):
    """A CPU-intensive function that can't be made async"""
    print(f"CPU task starting (n={n})")
    start = time.time()
  
    # Simulate CPU-intensive work
    total = 0
    for i in range(n * 1000000):
        total += i
  
    elapsed = time.time() - start
    print(f"CPU task finished in {elapsed:.2f} seconds (n={n})")
    return total

async def main():
    print("Main started")
    loop = asyncio.get_running_loop()
  
    # Run a CPU-bound task in a thread pool
    with concurrent.futures.ThreadPoolExecutor() as pool:
        # This doesn't block the event loop
        result = await loop.run_in_executor(pool, cpu_bound_task, 10)
        print(f"CPU task result: {result}")
  
    print("Main finished")

asyncio.run(main())
```

### 4. Async Context Managers and Async Iterators

Async context managers (using `async with`) and async iterators (using `async for`) are powerful features:

```python
import asyncio

# An async context manager
class AsyncResource:
    async def __aenter__(self):
        print("Acquiring resource")
        await asyncio.sleep(1)  # Simulate resource acquisition
        print("Resource acquired")
        return self
  
    async def __aexit__(self, exc_type, exc, tb):
        print("Releasing resource")
        await asyncio.sleep(1)  # Simulate resource release
        print("Resource released")
  
    async def use(self):
        print("Using resource")
        await asyncio.sleep(1)
        return "Resource result"

# An async iterator
async def async_range(start, stop):
    for i in range(start, stop):
        await asyncio.sleep(0.5)  # Simulate some async work
        yield i

async def main():
    # Using an async context manager
    async with AsyncResource() as resource:
        result = await resource.use()
        print(f"Got result: {result}")
  
    # Using an async iterator
    print("Starting async iteration")
    async for i in async_range(1, 5):
        print(f"Got value: {i}")
    print("Finished async iteration")

asyncio.run(main())
```

## Common Pitfalls and How to Avoid Them

As you start writing async programs, watch out for these common pitfalls:

### 1. Forgetting to Await

One of the most common mistakes is forgetting to await a coroutine:

```python
async def main():
    # Wrong - this doesn't execute the coroutine
    asyncio.sleep(1)
  
    # Correct - this executes the coroutine
    await asyncio.sleep(1)
```

### 2. Blocking the Event Loop

The event loop runs in a single thread, so any CPU-intensive or blocking operation will prevent other coroutines from running:

```python
import asyncio
import time

async def blocking_task():
    print("Starting blocking task")
    # This blocks the entire event loop
    time.sleep(5)  # Use 'await asyncio.sleep(5)' instead
    print("Finished blocking task")

async def another_task():
    print("Starting another task")
    await asyncio.sleep(1)
    print("This won't print until the blocking task is done")

async def main():
    await asyncio.gather(blocking_task(), another_task())

asyncio.run(main())
```

### 3. Mixing Sync and Async Code Incorrectly

It's easy to accidentally mix synchronous and asynchronous code:

```python
import asyncio
import aiohttp
import requests  # Synchronous HTTP library

async def fetch_url_wrong(url):
    # Wrong - this blocks the event loop
    response = requests.get(url)
    return response.text

async def fetch_url_right(session, url):
    # Correct - this uses async HTTP requests
    async with session.get(url) as response:
        return await response.text

async def main():
    urls = ["https://www.example.com", "https://www.python.org"]
  
    # Wrong approach (blocks the event loop)
    results_wrong = [await fetch_url_wrong(url) for url in urls]
  
    # Correct approach
    async with aiohttp.ClientSession() as session:
        results_right = await asyncio.gather(
            *[fetch_url_right(session, url) for url in urls]
        )

asyncio.run(main())
```

### 4. Not Cleaning Up Resources

Always make sure to properly clean up resources, especially when using libraries that require explicit cleanup:

```python
import asyncio
import aiohttp

async def main_wrong():
    # Wrong - session is never closed
    session = aiohttp.ClientSession()
    async with session.get("https://www.example.com") as response:
        html = await response.text()
    # Session remains open

async def main_right():
    # Correct - session is automatically closed
    async with aiohttp.ClientSession() as session:
        async with session.get("https://www.example.com") as response:
            html = await response.text()
    # Session is properly closed

asyncio.run(main_right())
```

## Building Your First Complete Async Application

Let's put everything together to build a more complete application: a simple async web scraper that fetches multiple pages concurrently and extracts links.

```python
import asyncio
import aiohttp
from urllib.parse import urljoin
import re
import time

# Regular expression to find links in HTML
LINK_PATTERN = re.compile(r'href=["\'](https?://[^"\'\s]+)["\']')

async def fetch_url(session, url, max_retries=3):
    """Fetch a URL with retry logic"""
    for attempt in range(max_retries):
        try:
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    html = await response.text()
                    print(f"Successfully fetched {url} ({len(html)} bytes)")
                    return html
                else:
                    print(f"Error fetching {url}: HTTP {response.status}")
                    await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            print(f"Attempt {attempt+1}/{max_retries} failed for {url}: {e}")
            if attempt + 1 < max_retries:
                await asyncio.sleep(1 * (attempt + 1))  # Exponential backoff
  
    print(f"Failed to fetch {url} after {max_retries} attempts")
    return None

async def extract_links(html, base_url):
    """Extract links from HTML content"""
    if not html:
        return []
  
    # Find all links
    matches = LINK_PATTERN.findall(html)
  
    # Normalize URLs
    links = [urljoin(base_url, match) for match in matches]
  
    # Remove duplicates
    links = list(set(links))
  
    print(f"Extracted {len(links)} links from {base_url}")
    return links

async def process_page(session, url, visited=None, max_depth=2, current_depth=0):
    """Process a page: fetch it, extract links, and process those links"""
    if visited is None:
        visited = set()
  
    # Skip if already visited or max depth reached
    if url in visited or current_depth > max_depth:
        return []
  
    visited.add(url)
    results = [url]  # Include the current URL in results
  
    # Fetch the page
    html = await fetch_url(session, url)
    if not html:
        return results
  
    # If we've reached max depth, don't process links further
    if current_depth == max_depth:
        return results
  
    # Extract and process links
    links = await extract_links(html, url)
  
    # Process each link (up to 5 to avoid too many requests)
    tasks = []
    for link in links[:5]:
        if link not in visited:
            task = asyncio.create_task(
                process_page(session, link, visited, max_depth, current_depth + 1)
            )
            tasks.append(task)
  
    # Wait for all link processing to complete
    if tasks:
        link_results = await asyncio.gather(*tasks)
        for result in link_results:
            results.extend(result)
  
    return results

async def main():
    start_url = "https://www.python.org"
    max_depth = 1  # Limit depth to avoid too many requests
  
    start_time = time.time()
  
    # Set up a timeout for the entire operation
    try:
        async with aiohttp.ClientSession() as session:
            # Process the starting URL
            all_urls = await process_page(session, start_url, max_depth=max_depth)
          
            # Remove duplicates and sort
            unique_urls = sorted(set(all_urls))
          
            # Print results
            print("\nResults:")
            print(f"Visited {len(unique_urls)} unique URLs:")
            for i, url in enumerate(unique_urls, 1):
                print(f"{i}. {url}")
    except asyncio.TimeoutError:
        print("Operation timed out")
  
    elapsed = time.time() - start_time
    print(f"\nTotal execution time: {elapsed:.2f} seconds")

# Run the program
asyncio.run(main())
```

This example demonstrates many of the concepts we've covered:

1. **Coroutines and Tasks** : We use coroutines for the main functions and create tasks to process links concurrently.
2. **Error Handling** : We implement retry logic for HTTP requests.
3. **Concurrency Control** : We limit the number of links processed to avoid making too many requests.
4. **Resource Management** : We use context managers to ensure proper cleanup of the HTTP session.
5. **Timeouts** : We set timeouts to prevent operations from hanging.
6. **Depth Control** : We limit the recursion depth to avoid an explosion of requests.

## Conclusion and Next Steps

Congratulations! You've now learned the fundamentals of running your first async program in Python. Let's recap the key points:

1. **Async programming enables concurrency** : It allows your program to make progress on multiple tasks without using multiple threads.
2. **Key components** :

* The event loop manages the execution of coroutines
* Coroutines (defined with `async def`) can be paused and resumed
* Tasks schedule coroutines to run on the event loop
* `await` pauses execution until an awaitable completes

1. **Benefits** :

* Improved performance for I/O-bound applications
* Simplified concurrency compared to threads
* More readable and maintainable code

1. **Best practices** :

* Use async libraries for I/O operations
* Don't block the event loop
* Properly handle errors and cancellation
* Clean up resources

As you continue your async programming journey, here are some next steps to consider:

1. **Explore async libraries** for databases, networking, and other I/O operations
2. **Learn about more advanced asyncio features** like queues, semaphores, and locks
3. **Study patterns for managing concurrency** in larger applications
4. **Consider frameworks** like FastAPI or Quart that are built around asyncio

Remember that async programming is particularly valuable for I/O-bound applications, but may not provide benefits for CPU-bound tasks (where multiprocessing might be more appropriate).

With the foundation you've built here, you're well-equipped to start building real-world async applications in Python. Happy coding!
