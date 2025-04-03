# Detailed Context Manager Use Cases: Visualizing the Inner Workings

Let's explore practical, detailed use cases of context managers that will help you visualize exactly how they work internally. For each example, I'll explain the internal mechanism and provide clear visualizations of what's happening behind the scenes.

## 1. File Operations with Automatic Cleanup

Let's start with the most common use case: file handling.

```python
with open("example.txt", "w") as file:
    file.write("Hello, World!")
# File is automatically closed here
```

### What Happens Internally:

1. `open("example.txt", "w")` creates a file object
2. Python calls the file object's `__enter__()` method
3. The file object is assigned to the variable `file`
4. The indented code block executes
5. When the block completes, Python calls the file object's `__exit__()` method
6. The `__exit__()` method closes the file

### Visualization of Internal Flow:

```
Program execution:
┌─────────────────────────────────────────────────────┐
│                                                     │
│  file_obj = open("example.txt", "w")  # Create obj  │
│                                                     │
│  file = file_obj.__enter__()  # Setup resource      │
│                                                     │
│  try:                                               │
│      file.write("Hello, World!")  # Use resource    │
│  finally:                                           │
│      file_obj.__exit__(None, None, None)  # Cleanup │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Let's implement our own simplified version to see the mechanics:

```python
class FileManager:
    def __init__(self, filename, mode):
        self.filename = filename
        self.mode = mode
        self.file = None
        print(f"FileManager created for {filename}")
    
    def __enter__(self):
        print(f"Opening file {self.filename}")
        self.file = open(self.filename, self.mode)
        return self.file  # This value is bound to the as-variable
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Closing file {self.filename}")
        if self.file:
            self.file.close()
        print(f"File closed: {self.file.closed}")
        return False  # Propagate exceptions

# Usage
with FileManager("test.txt", "w") as file:
    print("Writing to file")
    file.write("Testing context managers")
    print("Write operation completed")

print("Outside context manager")
```

Output:
```
FileManager created for test.txt
Opening file test.txt
Writing to file
Write operation completed
Closing file test.txt
File closed: True
Outside context manager
```

## 2. Database Connection Management

Database connections are valuable resources that should be properly managed:

```python
import sqlite3

class DatabaseConnection:
    def __init__(self, db_path):
        self.db_path = db_path
        self.connection = None
        print(f"DatabaseConnection object created for {db_path}")
    
    def __enter__(self):
        print(f"Establishing connection to {self.db_path}")
        self.connection = sqlite3.connect(self.db_path)
        return self.connection
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Closing connection to {self.db_path}")
        if exc_type is not None:
            print(f"Exception occurred: {exc_type.__name__}: {exc_val}")
            # Rollback on error
            if self.connection:
                self.connection.rollback()
                print("Transaction rolled back")
        else:
            # Commit if successful
            if self.connection:
                self.connection.commit()
                print("Transaction committed")
        
        # Close in either case
        if self.connection:
            self.connection.close()
            print("Connection closed")
        
        # Let the exception propagate (return False)
        return False

# Usage with successful execution
with DatabaseConnection("example.db") as conn:
    cursor = conn.cursor()
    print("Creating a table")
    cursor.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)")
    print("Inserting data")
    cursor.execute("INSERT INTO users (name) VALUES (?)", ("Alice",))
    print("Database operations completed successfully")

print("Outside first context manager")

# Usage with an error
try:
    with DatabaseConnection("example.db") as conn:
        cursor = conn.cursor()
        print("Attempting bad SQL")
        cursor.execute("INSERT INTO non_existent_table VALUES (1)")
        print("This won't execute due to the error above")
except Exception as e:
    print(f"Exception caught: {e}")

print("Program continues after handling the exception")
```

### Internal Mechanism Visualization:

```
For successful case:
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  conn_manager = DatabaseConnection("example.db")           │
│                                                            │
│  conn = conn_manager.__enter__()  # Open DB connection     │
│                                                            │
│  try:                                                      │
│      # Execute SQL operations                              │
│      cursor = conn.cursor()                                │
│      cursor.execute(...)                                   │
│  finally:                                                  │
│      # No exception, so commit transaction                 │
│      conn_manager.__exit__(None, None, None)               │
│      # Inside __exit__: conn.commit() then conn.close()    │
│                                                            │
└────────────────────────────────────────────────────────────┘

For error case:
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  conn_manager = DatabaseConnection("example.db")           │
│                                                            │
│  conn = conn_manager.__enter__()  # Open DB connection     │
│                                                            │
│  try:                                                      │
│      # Execute SQL operations                              │
│      cursor.execute("INSERT INTO non_existent_table...")   │
│      # Exception raises here                               │
│  finally:                                                  │
│      # Exception info is passed to __exit__                │
│      conn_manager.__exit__(sqlite3.OperationalError,       │
│                           exc_val, exc_tb)                 │
│      # Inside __exit__: conn.rollback() then conn.close()  │
│      # __exit__ returns False, so exception propagates     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 3. Resource Locking in Multi-threaded Applications

Context managers are perfect for managing locks in concurrent code:

```python
import threading
import time
import random

class LockManager:
    def __init__(self, lock, resource_name):
        self.lock = lock
        self.resource_name = resource_name
        print(f"LockManager created for {resource_name}")
    
    def __enter__(self):
        print(f"Attempting to acquire lock for {self.resource_name}...")
        self.lock.acquire()
        print(f"Lock acquired for {self.resource_name}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Releasing lock for {self.resource_name}")
        self.lock.release()
        print(f"Lock released for {self.resource_name}")
        return False  # Propagate exceptions

# Shared resource
shared_counter = 0
counter_lock = threading.Lock()

def worker(worker_id):
    global shared_counter
    
    # Simulate some work before accessing shared resource
    time.sleep(random.random() * 0.2)
    
    with LockManager(counter_lock, f"counter-worker-{worker_id}"):
        # Critical section - only one thread can be here at a time
        current = shared_counter
        time.sleep(0.1)  # Simulate some processing time
        shared_counter = current + 1
        print(f"Worker {worker_id} incremented counter to {shared_counter}")

# Create and start multiple threads
threads = []
for i in range(5):
    thread = threading.Thread(target=worker, args=(i,))
    threads.append(thread)
    thread.start()

# Wait for all threads to complete
for thread in threads:
    thread.join()

print(f"Final counter value: {shared_counter}")
```

### Internal Mechanism Visualization (for one thread):

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  lock_manager = LockManager(counter_lock, "counter-1")     │
│                                                            │
│  lock_manager.__enter__()  # Calls lock.acquire()          │
│  # Thread blocks here until lock is acquired               │
│                                                            │
│  try:                                                      │
│      # Critical section - shared resource operations       │
│      current = shared_counter                              │
│      shared_counter = current + 1                          │
│  finally:                                                  │
│      lock_manager.__exit__(None, None, None)               │
│      # Inside __exit__: lock.release()                     │
│      # Other waiting threads can now acquire the lock      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 4. Temporary Environment Changes

Let's create a context manager for temporarily modifying environment settings:

```python
import os
from contextlib import contextmanager

@contextmanager
def temporary_env(**env_vars):
    """Temporarily set environment variables and restore original values."""
    # Store original environment variables
    original_env = {}
    for key, value in env_vars.items():
        if key in os.environ:
            original_env[key] = os.environ[key]
        else:
            original_env[key] = None
    
    print(f"Saving original environment variables: {original_env}")
    
    # Set temporary environment variables
    for key, value in env_vars.items():
        print(f"Setting {key}={value}")
        os.environ[key] = value
    
    try:
        # The yield statement is where execution is passed back to the with-block
        print("Entering context - environment modified")
        yield
        print("Exiting context normally - will restore environment")
    except Exception as e:
        print(f"Exception occurred: {type(e).__name__}: {e}")
        # Re-raise the exception after cleanup
        raise
    finally:
        # Restore original environment
        for key, value in original_env.items():
            if value is None:
                print(f"Removing {key} from environment")
                if key in os.environ:
                    del os.environ[key]
            else:
                print(f"Restoring {key}={value}")
                os.environ[key] = value
        
        print("Environment restored to original state")

# Usage
print(f"DEBUG before: {os.environ.get('DEBUG', 'not set')}")
print(f"DATABASE_URL before: {os.environ.get('DATABASE_URL', 'not set')}")

with temporary_env(DEBUG="1", DATABASE_URL="sqlite:///test.db"):
    print(f"Inside context: DEBUG={os.environ.get('DEBUG')}")
    print(f"Inside context: DATABASE_URL={os.environ.get('DATABASE_URL')}")
    
print(f"DEBUG after: {os.environ.get('DEBUG', 'not set')}")
print(f"DATABASE_URL after: {os.environ.get('DATABASE_URL', 'not set')}")
```

### Internal Generator-based Context Manager Flow:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  # Create generator and advance to first yield               │
│  gen = temporary_env.__wrapped__(DEBUG="1", DATABASE_URL=...)│
│                                                              │
│  try:                                                        │
│      # Execute generator up to yield (setup code)            │
│      # 1. Save original environment variables                │
│      # 2. Set new environment variables                      │
│      next(gen)  # Advance to the yield statement            │
│                                                              │
│      # Execute with-block body                               │
│      print(f"Inside context: DEBUG={os.environ.get('DEBUG')}")│
│                                                              │
│  except Exception as e:                                      │
│      # If exception in with-block, send it to generator      │
│      gen.throw(type(e), e, e.__traceback__)                  │
│  else:                                                       │
│      # No exception, just resume generator                   │
│      try:                                                    │
│          next(gen)  # Resume after yield (cleanup code)      │
│      except StopIteration:                                   │
│          pass  # Generator completed normally                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 5. Redirecting Standard Output

Let's create a context manager to temporarily redirect standard output:

```python
import sys
from io import StringIO
from contextlib import contextmanager

@contextmanager
def redirect_stdout(new_target):
    """Temporarily redirect standard output to new_target."""
    # Save reference to original stdout
    old_stdout = sys.stdout
    print(f"Redirecting stdout from {old_stdout} to {new_target}")
    
    # Replace stdout with new target
    sys.stdout = new_target
    
    try:
        print("This message goes to the redirected target")
        yield  # Execution returns to the with-block
        print("This also goes to the redirected target")
    finally:
        # Restore stdout to original target
        print("About to restore stdout to original")
        sys.stdout = old_stdout
        print(f"Stdout restored to {sys.stdout}")

# Usage: Capture print output to a string
captured_output = StringIO()
print("This goes to the normal stdout")

with redirect_stdout(captured_output):
    print("This is redirected to StringIO")
    print("More text being captured")

print("Back to normal stdout")

# Get the captured output
captured_value = captured_output.getvalue()
print(f"Captured output: {captured_value!r}")
```

### Internal Execution Flow:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  captured_output = StringIO()                             │
│                                                           │
│  # Setup phase                                            │
│  old_stdout = sys.stdout                                  │
│  sys.stdout = captured_output                             │
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      print("This is redirected to StringIO")              │
│      print("More text being captured")                    │
│      # All print calls write to captured_output           │
│  finally:                                                 │
│      # Cleanup phase                                      │
│      sys.stdout = old_stdout                              │
│      # Print calls now write to original stdout again     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 6. Timing Code Execution

A context manager for benchmarking code execution:

```python
import time
from contextlib import contextmanager

@contextmanager
def timing_block(name="Operation"):
    """Measure execution time of a code block."""
    # Setup: Record start time
    start_time = time.time()
    print(f"[{name}] Starting at {start_time:.6f}")
    
    # Track whether exception occurred
    exception_occurred = False
    exc_info = None
    
    try:
        # Return control to the with-block
        yield 
    except Exception as e:
        # Capture exception info
        exception_occurred = True
        exc_info = (type(e), e, e.__traceback__)
        print(f"[{name}] Exception occurred: {type(e).__name__}: {e}")
        # Don't suppress the exception
        raise
    finally:
        # Cleanup: Calculate elapsed time
        end_time = time.time()
        elapsed = end_time - start_time
        
        if exception_occurred:
            status = "failed"
        else:
            status = "completed"
        
        print(f"[{name}] {status} in {elapsed:.6f} seconds")

# Usage: Successful execution
with timing_block("Successful operation"):
    # Simulate some work
    total = 0
    for i in range(1000000):
        total += i
    print(f"Computation result: {total}")

# Usage: With exception
try:
    with timing_block("Failing operation"):
        print("About to divide by zero...")
        result = 1 / 0
        print("This won't execute")
except ZeroDivisionError:
    print("Caught zero division error outside the context manager")
```

### Internal Generator Flow:

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  # Initialize generator                                    │
│  gen = timing_block.__wrapped__("Successful operation")    │
│                                                            │
│  try:                                                      │
│      # Setup phase - record start time                     │
│      next(gen)  # Advance to yield                         │
│                                                            │
│      # With-block execution                                │
│      total = 0                                             │
│      for i in range(1000000):                              │
│          total += i                                        │
│                                                            │
│  except Exception as e:                                    │
│      # If exception in with-block, pass it to generator    │
│      gen.throw(type(e), e, e.__traceback__)                │
│  else:                                                     │
│      # Normal completion, resume generator                 │
│      try:                                                  │
│          next(gen)  # Continue after yield                 │
│      except StopIteration:                                 │
│          pass                                              │
│  finally:                                                  │
│      # This is implicit in contextlib.contextmanager       │
│      # It ensures the generator completes                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 7. Transaction Management

Let's create a context manager for database transactions:

```python
import sqlite3

class TransactionManager:
    def __init__(self, connection):
        self.connection = connection
        print("Transaction manager created")
    
    def __enter__(self):
        print("Beginning transaction")
        # SQLite automatically begins a transaction on first query
        # but we'll make it explicit with a savepoint
        self.cursor = self.connection.cursor()
        self.cursor.execute("SAVEPOINT transaction_savepoint")
        return self.cursor
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            print(f"Error occurred: {exc_type.__name__}: {exc_val}")
            print("Rolling back transaction")
            self.cursor.execute("ROLLBACK TO SAVEPOINT transaction_savepoint")
            self.connection.rollback()
        else:
            print("No errors, committing transaction")
            self.cursor.execute("RELEASE SAVEPOINT transaction_savepoint")
            self.connection.commit()
        
        self.cursor.close()
        print("Transaction completed")
        return False  # Let exceptions propagate

# Create database connection
conn = sqlite3.connect(":memory:")

# Set up the database
with conn:
    conn.execute("CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT, balance REAL)")
    conn.execute("INSERT INTO accounts (name, balance) VALUES (?, ?)", ("Alice", 1000.0))
    conn.execute("INSERT INTO accounts (name, balance) VALUES (?, ?)", ("Bob", 500.0))

# Successful transaction
with TransactionManager(conn) as cursor:
    print("Transferring money from Alice to Bob")
    cursor.execute("UPDATE accounts SET balance = balance - 100.0 WHERE name = ?", ("Alice",))
    cursor.execute("UPDATE accounts SET balance = balance + 100.0 WHERE name = ?", ("Bob",))
    print("Transfer completed successfully")

# Print current balances
with conn:
    cursor = conn.cursor()
    cursor.execute("SELECT name, balance FROM accounts")
    for name, balance in cursor:
        print(f"{name}'s balance: ${balance:.2f}")

# Failed transaction
try:
    with TransactionManager(conn) as cursor:
        print("Attempting invalid operation")
        cursor.execute("UPDATE accounts SET balance = balance - 100.0 WHERE name = ?", ("Alice",))
        print("Now attempting to update non-existent table")
        cursor.execute("UPDATE non_existent_table SET value = 100")
except sqlite3.OperationalError as e:
    print(f"Caught exception: {e}")

# Verify that Alice's balance wasn't changed by the failed transaction
with conn:
    cursor = conn.cursor()
    cursor.execute("SELECT balance FROM accounts WHERE name = ?", ("Alice",))
    alice_balance = cursor.fetchone()[0]
    print(f"Alice's balance after failed transaction: ${alice_balance:.2f}")
```

### Internal Flow Visualization:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  tm = TransactionManager(conn)                            │
│                                                           │
│  cursor = tm.__enter__()  # Begin transaction             │
│                                                           │
│  try:                                                     │
│      # Execute database operations                        │
│      cursor.execute("UPDATE accounts SET ...")            │
│      cursor.execute("UPDATE accounts SET ...")            │
│  except Exception as e:                                   │
│      # An error occurred                                  │
│      tm.__exit__(type(e), e, e.__traceback__)             │
│      # Inside __exit__: ROLLBACK                          │
│      raise  # Re-raise the exception                      │
│  else:                                                    │
│      # No exceptions                                      │
│      tm.__exit__(None, None, None)                        │
│      # Inside __exit__: COMMIT                            │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 8. Temporary File Management

Context managers are great for temporary file handling:

```python
import os
import tempfile
from contextlib import contextmanager

@contextmanager
def temporary_file(content=None, suffix=".txt"):
    """Create a temporary file that is automatically deleted after use."""
    # Create a temporary file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    file_path = temp_file.name
    
    print(f"Created temporary file at {file_path}")
    
    try:
        # Write initial content if provided
        if content is not None:
            print(f"Writing initial content: {content}")
            temp_file.write(content.encode('utf-8'))
            temp_file.flush()
        
        # Close the file so it can be reopened by the user
        temp_file.close()
        
        print("Yielding temporary file path to context")
        yield file_path
        
        print("Context completed, checking file contents:")
        # Read the file contents after the context for demonstration
        try:
            with open(file_path, 'r') as f:
                content = f.read()
                print(f"Final file contents: {content}")
        except Exception as e:
            print(f"Error reading file: {e}")
    
    finally:
        # Clean up by removing the temporary file
        print(f"Removing temporary file {file_path}")
        try:
            os.unlink(file_path)
            print("File successfully removed")
        except Exception as e:
            print(f"Error removing file: {e}")

# Usage
with temporary_file("Initial data\n") as filepath:
    print(f"In context, file path is {filepath}")
    
    # Append some data to the file
    with open(filepath, 'a') as f:
        f.write("Additional data appended during context\n")
    
    print("File modified within context")

print("Context completed, file should be removed")

# Try to access the file after context
try:
    with open(filepath, 'r') as f:
        print("This should not execute")
except FileNotFoundError:
    print("Confirmed: File was properly deleted")
```

### Internal Execution Flow:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase                                            │
│  temp_file = tempfile.NamedTemporaryFile(...)             │
│  file_path = temp_file.name                               │
│  temp_file.write(content.encode('utf-8'))                 │
│  temp_file.close()                                        │
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      yield file_path  # Pass filepath to with-block       │
│                                                           │
│      # User operations on the file                        │
│      with open(filepath, 'a') as f:                       │
│          f.write("Additional data...")                    │
│                                                           │
│  finally:                                                 │
│      # Cleanup phase                                      │
│      os.unlink(file_path)  # Delete the temporary file    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 9. Dynamic Context Manager Stacking

Let's see how `ExitStack` works for managing multiple context managers:

```python
from contextlib import ExitStack
import contextlib

class LoggingContextManager:
    def __init__(self, name):
        self.name = name
        print(f"Created {self.name}")
    
    def __enter__(self):
        print(f"Entering {self.name}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"Exiting {self.name}")
        if exc_type:
            print(f"  with exception {exc_type.__name__}: {exc_val}")
        return False  # Don't suppress exceptions

def demonstrate_exit_stack():
    print("\nDemonstrating ExitStack with dynamic context managers:")
    
    # Create a list of context managers
    managers = [
        LoggingContextManager(f"Manager-{i}")
        for i in range(1, 4)
    ]
    
    # Decide at runtime which managers to use
    active_managers = []
    
    with ExitStack() as stack:
        print("ExitStack created")
        
        for i, manager in enumerate(managers):
            # Skip the middle manager
            if i == 1:
                print(f"Skipping {manager.name}")
                continue
                
            # Enter this context manager and add it to ExitStack
            cm = stack.enter_context(manager)
            active_managers.append(cm)
        
        print(f"Active managers: {[m.name for m in active_managers]}")
        
        # Optionally pop a context manager (it will be exited immediately)
        if active_managers:
            print("Popping a manager from the stack early")
            callback = stack.pop_all()
            print("All managers popped, now using callback to exit them")
            
            # We can later use the callback to exit all popped managers
            # For now, let's push one back to demonstrate
            print("Pushing Manager-1 back onto stack")
            with callback:
                print("Inside callback context")
            
            print("Callback context exited")
        
        print("End of ExitStack block")
    
    print("All context managers exited")

# Run the demonstration
demonstrate_exit_stack()
```

### Internal Mechanism of ExitStack:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  stack = ExitStack()                                      │
│  stack.__enter__()  # Just returns self                   │
│                                                           │
│  # For each context manager added:                        │
│  cm1 = Manager1()                                         │
│  cm1_value = cm1.__enter__()                              │
│  stack._exit_callbacks.append(                            │
│      lambda: cm1.__exit__(exc_type, exc_val, exc_tb)      │
│  )                                                        │
│                                                           │
│  cm3 = Manager3()                                         │
│  cm3_value = cm3.__enter__()                              │
│  stack._exit_callbacks.append(                            │
│      lambda: cm3.__exit__(exc_type, exc_val, exc_tb)      │
│  )                                                        │
│                                                           │
│  # Later when ExitStack.__exit__ is called:               │
│  # Call each exit callback in reverse order:              │
│  cm3.__exit__(exc_type, exc_val, exc_tb)                  │
│  cm1.__exit__(exc_type, exc_val, exc_tb)                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 10. State Restoration Pattern

Let's create a context manager for temporarily modifying an object's attributes:

```python
from contextlib import contextmanager

class StateTracker:
    def __init__(self, name="StateTracker"):
        self.name = name
        self.counter = 0
        self.active = False
        self.settings = {"debug": False, "retry_count": 3}
        print(f"StateTracker '{name}' initialized with defaults")
    
    def display_state(self):
        print(f"StateTracker '{self.name}' state:")
        print(f"  counter: {self.counter}")
        print(f"  active: {self.active}")
        print(f"  settings: {self.settings}")

@contextmanager
def modified_state(tracker, **kwargs):
    """Temporarily modify object attributes."""
    # Store original attribute values
    originals = {}
    
    print(f"Saving original state of '{tracker.name}'")
    
    # Get and modify each attribute
    for attr_name, new_value in kwargs.items():
        if hasattr(tracker, attr_name):
            # Save original value
            original_value = getattr(tracker, attr_name)
            originals[attr_name] = original_value
            
            # Set new value
            print(f"  Setting {attr_name}: {original_value} -> {new_value}")
            setattr(tracker, attr_name, new_value)
        else:
            print(f"  Warning: {attr_name} not found, skipping")
    
    try:
        print("Yielding control with modified state")
        yield tracker
        print("Context completed normally")
    finally:
        print(f"Restoring original state of '{tracker.name}'")
        
        # Restore original values
        for attr_name, original_value in originals.items():
            current = getattr(tracker, attr_name)
            print(f"  Restoring {attr_name}: {current} -> {original_value}")
            setattr(tracker, attr_name, original_value)

# Demo
tracker = StateTracker("demo-tracker")
print("\nInitial state:")
tracker.display_state()

print("\nEntering context with modified state:")
with modified_state(tracker, 
                   counter=100, 
                   active=True,
                   settings={"debug": True, "retry_count": 5, "timeout": 30}):
    print("\nInside context, modified state:")
    tracker.display_state()
    
    # Further modify state within context
    print("\nFurther modifying state within context:")
    tracker.counter += 10
    tracker.display_state()

print("\nAfter context, restored state:")
tracker.display_state()
```

### Internal Flow:


```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase                                            │
│  originals = {}                                           │
│  for attr_name, new_value in kwargs.items():              │
│      original_value = getattr(tracker, attr_name)         │
│      originals[attr_name] = original_value                │
│      setattr(tracker, attr_name, new_value)               │
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      yield tracker                                        │
│                                                           │
│      # Within context: tracker.counter += 10              │
│      # Note: this modification is still within context    │
│      # but isn't tracked in our originals dictionary      │
│                                                           │
│  finally:                                                 │
│      # Cleanup phase                                      │
│      for attr_name, original_value in originals.items():  │
│          setattr(tracker, attr_name, original_value)      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 12. HTTP Request Mocking for Testing

Let's create a context manager for mocking HTTP requests during testing:

```python
import requests
from unittest.mock import patch
from contextlib import contextmanager

@contextmanager
def mock_http_response(url_pattern, mock_response, status_code=200):
    """
    Context manager for mocking HTTP responses.
    
    Args:
        url_pattern: String or regex pattern to match against request URLs
        mock_response: Content to return in the mock response
        status_code: HTTP status code to return (default: 200)
    """
    original_get = requests.get
    
    # Create our mock response object
    class MockResponse:
        def __init__(self, content, status):
            self.content = content
            self.text = content if isinstance(content, str) else content.decode('utf-8')
            self.status_code = status
        
        def json(self):
            import json
            return json.loads(self.text)
    
    # Replace the real requests.get with our mock version
    def mock_get(url, *args, **kwargs):
        print(f"Intercepted HTTP GET request to: {url}")
        
        if url_pattern in url:
            print(f"  URL matches pattern '{url_pattern}', returning mock response")
            return MockResponse(mock_response, status_code)
        else:
            print(f"  URL does not match pattern, calling original requests.get")
            return original_get(url, *args, **kwargs)
    
    # Apply the patch
    print(f"Setting up HTTP request mocking for URLs containing '{url_pattern}'")
    with patch('requests.get', side_effect=mock_get) as mock_obj:
        print("Mock patch applied")
        try:
            yield mock_obj
            print("Context completed normally")
        except Exception as e:
            print(f"Exception in context: {type(e).__name__}: {e}")
            raise
        finally:
            print("Removing HTTP request mock")
    
    print("HTTP request mocking removed, original behavior restored")

# Usage example
def fetch_user_data(user_id):
    """Function that makes HTTP requests to fetch user data."""
    url = f"https://api.example.com/users/{user_id}"
    print(f"Fetching user data from {url}")
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"Failed with status code {response.status_code}"}

# Demo
print("First, fetch without mocking (this would normally make a real HTTP request):")
try:
    # This would make a real request if uncommented
    # data = fetch_user_data(123)
    # print(f"Fetched data: {data}")
    print("(Real request skipped for demo purposes)")
except Exception as e:
    print(f"Error making request: {e}")

print("\nNow, with HTTP mocking:")
with mock_http_response(
    "api.example.com/users/123", 
    '{"id": 123, "name": "Test User", "email": "test@example.com"}'
):
    # This request will be intercepted and mocked
    data = fetch_user_data(123)
    print(f"Fetched data: {data}")
    
    # This request doesn't match our pattern, so it would go through normally
    # (Commented out to avoid making real requests during demo)
    # other_data = fetch_user_data(456)
    # print(f"Other data: {other_data}")

print("\nAfter context, requests would go to real API again")
```

### Internal Mechanism Visualization:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase                                            │
│  original_get = requests.get                              │
│  # Create mock_get function closure over original_get     │
│                                                           │
│  # Enter patch context manager (nested)                   │
│  mock_obj = patch('requests.get', side_effect=mock_get)   │
│  mock_obj.__enter__()                                     │
│  # Now requests.get is replaced with mock_get             │
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      yield mock_obj                                       │
│                                                           │
│      # Inside with-block:                                 │
│      # Call to fetch_user_data() ->                       │
│      #   calls requests.get() ->                          │
│      #     actually calls our mock_get() ->               │
│      #       sees URL pattern match ->                    │
│      #         returns MockResponse without real HTTP call│
│                                                           │
│  finally:                                                 │
│      # Cleanup phase                                      │
│      mock_obj.__exit__(...)                               │
│      # patch.__exit__ restores requests.get to original   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 13. Temporary Configuration Override

Context managers are useful for temporarily modifying application configuration:

```python
class AppConfig:
    def __init__(self):
        self._config = {
            'debug': False,
            'timeout': 30,
            'cache_enabled': True,
            'max_connections': 100,
            'log_level': 'INFO'
        }
    
    def get(self, key, default=None):
        return self._config.get(key, default)
    
    def set(self, key, value):
        self._config[key] = value
    
    def __str__(self):
        import pprint
        return f"AppConfig:\n{pprint.pformat(self._config)}"

class ConfigContext:
    def __init__(self, config, **overrides):
        self.config = config
        self.overrides = overrides
        self.old_values = {}
        print(f"ConfigContext created with overrides: {overrides}")
    
    def __enter__(self):
        print("Applying configuration overrides:")
        for key, new_value in self.overrides.items():
            # Save original value
            self.old_values[key] = self.config.get(key)
            
            # Apply override
            print(f"  {key}: {self.old_values[key]} -> {new_value}")
            self.config.set(key, new_value)
        
        return self.config
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Restoring original configuration:")
        for key, old_value in self.old_values.items():
            current = self.config.get(key)
            print(f"  {key}: {current} -> {old_value}")
            self.config.set(key, old_value)
        
        if exc_type:
            print(f"Exception occurred: {exc_type.__name__}: {exc_val}")
        
        return False  # Don't suppress exceptions

# Create application configuration
app_config = AppConfig()
print(f"Initial configuration:\n{app_config}")

# Use configuration context for temporary changes
print("\nEntering debug configuration context:")
with ConfigContext(app_config, debug=True, log_level='DEBUG', timeout=60):
    print(f"\nConfiguration in debug context:\n{app_config}")
    
    # Simulate operations with debug config
    print(f"Debug mode: {app_config.get('debug')}")
    print(f"Log level: {app_config.get('log_level')}")
    
    # Perform application operations...

print(f"\nConfiguration after context (should be restored):\n{app_config}")

# Another example: performance-optimized configuration
print("\nEntering performance configuration context:")
with ConfigContext(app_config, 
                  cache_enabled=True, 
                  max_connections=500,
                  timeout=10):
    print(f"\nConfiguration in performance context:\n{app_config}")
    
    # Simulate operations with performance config
    print(f"Max connections: {app_config.get('max_connections')}")
    print(f"Timeout: {app_config.get('timeout')}s")
    
    # Perform application operations...

print(f"\nFinal configuration (should be restored):\n{app_config}")
```

### Internal Mechanism Visualization:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase                                            │
│  context = ConfigContext(app_config, debug=True, ...)     │
│                                                           │
│  # __enter__ execution                                    │
│  for key, new_value in self.overrides.items():            │
│      self.old_values[key] = self.config.get(key)          │
│      self.config.set(key, new_value)                      │
│                                                           │
│  # With-block execution                                   │
│  # App code uses the modified configuration               │
│  print(f"Debug mode: {app_config.get('debug')}")          │
│  # Returns True instead of the original False             │
│                                                           │
│  # __exit__ execution (cleanup)                           │
│  for key, old_value in self.old_values.items():           │
│      self.config.set(key, old_value)                      │
│  # Configuration is restored to original values           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 14. Temporary Working Directory

Let's create a context manager for temporarily changing the working directory:

```python
import os
from contextlib import contextmanager

@contextmanager
def working_directory(path):
    """
    Context manager for temporarily changing the working directory.
    
    Args:
        path: Directory to change to temporarily
    """
    # Get absolute path to ensure we can return regardless of path structure
    path = os.path.abspath(path)
    original_dir = os.getcwd()
    
    print(f"Current directory: {original_dir}")
    print(f"Changing to: {path}")
    
    # Change to the new directory
    try:
        os.chdir(path)
        print(f"Working directory is now: {os.getcwd()}")
        
        yield
        
        print(f"Context completed, working directory is: {os.getcwd()}")
    finally:
        # Always restore the original directory
        print(f"Changing back to: {original_dir}")
        os.chdir(original_dir)
        print(f"Working directory restored to: {os.getcwd()}")

# Demo
print("Demonstrating working directory context manager:\n")

# Create a temporary directory for testing
import tempfile
temp_dir = tempfile.mkdtemp()
print(f"Created temporary directory: {temp_dir}")

try:
    # List files in current directory
    print(f"\nFiles in current directory: {os.listdir('.')[:5]}")
    
    # Use the context manager to change directory
    print("\nEntering working directory context:")
    with working_directory(temp_dir):
        # Create a file in the temporary directory
        with open("test_file.txt", "w") as f:
            f.write("This file is created in the temporary directory")
        
        # List files in the temporary directory
        print(f"Files in temp directory: {os.listdir('.')}")
        
        # Try to access a file in the original directory
        # This would likely fail or access a different file
        try:
            with open("a_file_from_original_dir.txt", "r") as f:
                print("Found file from original directory (unexpected)")
        except FileNotFoundError:
            print("Could not access file from original directory (expected)")
    
    # After context, we should be back in the original directory
    print(f"\nFiles in current directory after context: {os.listdir('.')[:5]}")
    
    # Check if we can see the file in the temp directory from here
    temp_files = os.listdir(temp_dir)
    print(f"Files in temp directory, viewed from original dir: {temp_files}")

finally:
    # Clean up
    import shutil
    print(f"\nRemoving temporary directory: {temp_dir}")
    shutil.rmtree(temp_dir)
```

### Internal Flow Visualization:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase                                            │
│  original_dir = os.getcwd()  # Remember original          │
│  os.chdir(path)  # Change to new directory                │
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      yield                                                │
│                                                           │
│      # Inside context: All file operations use new path   │
│      # e.g., open("test_file.txt", "w")                   │
│      # actually opens /temp_dir/test_file.txt             │
│                                                           │
│  finally:                                                 │
│      # Cleanup phase - ALWAYS executed                    │
│      os.chdir(original_dir)  # Restore original directory │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 15. Database Connection Pool

Let's create a connection pool context manager for database operations:

```python
import sqlite3
import time
import random
import threading

class DatabaseConnectionPool:
    def __init__(self, db_path, max_connections=5):
        self.db_path = db_path
        self.max_connections = max_connections
        self.available_connections = []
        self.in_use_connections = set()
        self.lock = threading.RLock()
        print(f"Connection pool created for {db_path} with max {max_connections} connections")
    
    def _create_connection(self):
        """Create a new database connection."""
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row  # Use Row factory for better row access
        conn_id = id(connection)
        print(f"Created new connection {conn_id}")
        return connection
    
    def get_connection(self):
        """Get a connection from the pool or create a new one."""
        with self.lock:
            if self.available_connections:
                connection = self.available_connections.pop()
                conn_id = id(connection)
                print(f"Reusing connection {conn_id} from pool")
            elif len(self.in_use_connections) < self.max_connections:
                connection = self._create_connection()
            else:
                print("Maximum connections reached, waiting...")
                while not self.available_connections:
                    self.lock.release()
                    time.sleep(0.1)
                    self.lock.acquire()
                connection = self.available_connections.pop()
                conn_id = id(connection)
                print(f"Got connection {conn_id} after waiting")
            
            self.in_use_connections.add(connection)
            return connection
    
    def return_connection(self, connection):
        """Return a connection to the pool."""
        with self.lock:
            if connection in self.in_use_connections:
                self.in_use_connections.remove(connection)
                self.available_connections.append(connection)
                conn_id = id(connection)
                print(f"Connection {conn_id} returned to pool")
            else:
                print("Warning: Returning a connection not from this pool")
    
    @contextmanager
    def connection(self):
        """Context manager for acquiring and releasing connections."""
        connection = self.get_connection()
        conn_id = id(connection)
        print(f"Connection {conn_id} acquired via context manager")
        
        try:
            yield connection
            # Commit if no errors occurred
            connection.commit()
            print(f"Transaction on connection {conn_id} committed")
        except Exception as e:
            # Rollback on error
            connection.rollback()
            print(f"Error occurred, rolling back transaction on connection {conn_id}")
            print(f"Exception: {type(e).__name__}: {e}")
            raise
        finally:
            # Always return the connection to the pool
            self.return_connection(connection)
            print(f"Connection {conn_id} released via context manager")

# Create a database and initialize it
db_path = ":memory:"  # In-memory database for demo
pool = DatabaseConnectionPool(db_path, max_connections=3)

# Initialize the database
with pool.connection() as conn:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT,
            email TEXT
        )
    """)
    print("Database initialized with users table")

# Simulate multiple concurrent operations
def perform_database_operation(task_id):
    print(f"Task {task_id} starting")
    try:
        with pool.connection() as conn:
            cursor = conn.cursor()
            
            # Simulate different operations
            if task_id % 3 == 0:
                print(f"Task {task_id} inserting data")
                cursor.execute(
                    "INSERT INTO users (name, email) VALUES (?, ?)",
                    (f"User {task_id}", f"user{task_id}@example.com")
                )
            elif task_id % 3 == 1:
                print(f"Task {task_id} querying data")
                cursor.execute("SELECT * FROM users")
                rows = cursor.fetchall()
                print(f"Task {task_id} found {len(rows)} users")
            else:
                print(f"Task {task_id} updating data")
                cursor.execute(
                    "UPDATE users SET email = ? WHERE id = 1",
                    (f"updated{task_id}@example.com",)
                )
            
            # Simulate some processing time
            time.sleep(random.random() * 0.5)
            
            print(f"Task {task_id} completed database operations")
    except Exception as e:
        print(f"Task {task_id} failed: {e}")

# Run multiple operations sequentially
for i in range(10):
    perform_database_operation(i)

# Verify final state
with pool.connection() as conn:
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    print(f"\nFinal user count: {len(rows)}")
    for row in rows:
        print(f"User {row['id']}: {row['name']} ({row['email']})")
```

### Internal Flow Visualization of One Connection:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase in .connection() context manager           │
│  connection = self.get_connection()                       │
│  # Inside get_connection():                               │
│  #   Check available_connections pool                     │
│  #   If empty and below max, create new connection        │
│  #   If at max, wait for a connection to be returned      │
│  #   Add connection to in_use_connections                 │
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      yield connection                                     │
│                                                           │
│      # User code runs:                                    │
│      # cursor = conn.cursor()                             │
│      # cursor.execute(...)                                │
│                                                           │
│      # If no exception raised:                            │
│      connection.commit()                                  │
│                                                           │
│  except Exception:                                        │
│      # If exception occurred:                             │
│      connection.rollback()                                │
│      raise  # Re-raise the exception                      │
│                                                           │
│  finally:                                                 │
│      # Cleanup phase - ALWAYS executed                    │
│      self.return_connection(connection)                   │
│      # Inside return_connection():                        │
│      #   Remove from in_use_connections                   │
│      #   Add to available_connections pool                │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 16. Logging Context for Tracking Operations

Let's create a context manager for enhanced logging during specific operations:

```python
import logging
import time
import uuid
from contextlib import contextmanager

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(name)s - [%(operation_id)s] - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Add default operation_id to log record
old_factory = logging.getLogRecordFactory()
def record_factory(*args, **kwargs):
    record = old_factory(*args, **kwargs)
    record.operation_id = getattr(logging.getLoggerClass().manager.loggerDict.get('operation_id', None), 'value', 'N/A')
    return record

logging.setLogRecordFactory(record_factory)

@contextmanager
def operation_logging_context(operation_name, logger_name='app', level=logging.INFO):
    """
    Context manager for tracking operations in logs.
    
    Args:
        operation_name: Name of the operation being performed
        logger_name: Name of the logger to use
        level: Logging level for this operation
    """
    logger = logging.getLogger(logger_name)
    operation_id = str(uuid.uuid4())[:8]  # Short ID for readability
    
    # Create a thread-local variable to store operation_id
    class OperationIdHolder:
        value = None
    
    # Store current operation ID
    old_operation_id = getattr(logging.getLoggerClass().manager.loggerDict.get('operation_id', None), 'value', None)
    
    # Set new operation ID
    operation_id_holder = OperationIdHolder()
    operation_id_holder.value = operation_id
    logging.getLoggerClass().manager.loggerDict['operation_id'] = operation_id_holder
    
    start_time = time.time()
    logger.log(level, f"Starting operation: {operation_name}")
    
    try:
        yield logger
        
        # Calculate duration
        duration = time.time() - start_time
        logger.log(level, f"Operation {operation_name} completed successfully in {duration:.3f}s")
    except Exception as e:
        # Log the exception
        duration = time.time() - start_time
        logger.exception(f"Operation {operation_name} failed after {duration:.3f}s: {type(e).__name__}: {e}")
        raise
    finally:
        # Restore previous operation ID or remove it
        if old_operation_id:
            operation_id_holder.value = old_operation_id
        else:
            logging.getLoggerClass().manager.loggerDict.pop('operation_id', None)

# Example usage
def process_user_data(user_id, data):
    """Process user data with operation logging."""
    with operation_logging_context(f"process_user_{user_id}", level=logging.INFO) as logger:
        logger.info(f"Processing data for user {user_id}")
        logger.debug(f"Raw data: {data}")
        
        # Simulate some processing steps
        logger.info("Validating user data")
        time.sleep(0.2)  # Simulate validation
        
        logger.info("Transforming data")
        time.sleep(0.3)  # Simulate transformation
        
        # Nested operation with its own context
        with operation_logging_context("data_persistence", level=logging.DEBUG) as inner_logger:
            inner_logger.info(f"Saving processed data for user {user_id}")
            time.sleep(0.5)  # Simulate database operation
            inner_logger.debug("Data persistence complete")
        
        logger.info(f"All processing completed for user {user_id}")
        return {"user_id": user_id, "processed": True}

# Demonstrate with a successful operation
print("=== Successful Operation ===")
result = process_user_data(123, {"name": "Alice", "email": "alice@example.com"})
print(f"Result: {result}\n")

# Demonstrate with a failing operation
print("=== Failed Operation ===")
try:
    with operation_logging_context("failing_operation") as logger:
        logger.info("About to attempt a risky operation")
        logger.warning("This operation might fail")
        
        # Simulate an error
        time.sleep(0.2)
        raise ValueError("Something went wrong during processing")
except ValueError:
    print("Caught the expected ValueError\n")

# Show that the operation_id is properly restored
print("=== Verify Operation ID Restoration ===")
logging.info("This log should have the default operation_id")
```

### Internal Flow Visualization:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase                                            │
│  operation_id = str(uuid.uuid4())[:8]  # Generate ID      │
│  # Save original operation_id                             │
│  old_operation_id = ...                                   │
│  # Set new operation_id in thread-local storage           │
│  operation_id_holder.value = operation_id                 │
│                                                           │
│  start_time = time.time()                                 │
│  logger.log(level, f"Starting operation: {operation_name}")│
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      yield logger                                         │
│                                                           │
│      # Inside context: All log messages include operation_id│
│      # e.g., logger.info("Processing data")               │
│      # logged as: "[abc123] Processing data"              │
│                                                           │
│      # If no exception:                                   │
│      duration = time.time() - start_time                  │
│      logger.log(level, f"Operation completed in {duration}s")│
│                                                           │
│  except Exception as e:                                   │
│      # If exception:                                      │
│      duration = time.time() - start_time                  │
│      logger.exception(f"Operation failed: {e}")           │
│      raise  # Re-raise the exception                      │
│                                                           │
│  finally:                                                 │
│      # Cleanup phase - ALWAYS executed                    │
│      # Restore previous operation_id                      │
│      if old_operation_id:                                 │
│          operation_id_holder.value = old_operation_id     │
│      else:                                                │
│          # Remove operation_id tracking                   │
│          logging.getLoggerClass().manager.loggerDict.pop( │
│              'operation_id', None)                        │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 17. Temporary Monkey Patching

Let's create a context manager for temporarily monkey patching functions:

```python
from contextlib import contextmanager
import inspect

@contextmanager
def monkey_patch(target_object, attribute_name, new_implementation):
    """
    Temporarily replace a method or attribute with a new implementation.
    
    Args:
        target_object: The object to patch
        attribute_name: The name of the attribute to replace
        new_implementation: The new implementation to use
    """
    # Verify the attribute exists
    if not hasattr(target_object, attribute_name):
        raise AttributeError(f"{target_object} has no attribute {attribute_name}")
    
    # Store the original implementation
    original_attr = getattr(target_object, attribute_name)
    
    original_type = type(original_attr)
    patch_type = type(new_implementation)
    
    print(f"Monkey patching {target_object.__name__}.{attribute_name}")
    print(f"  Original type: {original_type.__name__}")
    print(f"  Replacement type: {patch_type.__name__}")
    
    # Apply the patch
    setattr(target_object, attribute_name, new_implementation)
    print(f"  Patch applied")
    
    try:
        yield
        print("  Context completed normally")
    except Exception as e:
        print(f"  Exception in context: {type(e).__name__}: {e}")
        raise
    finally:
        # Restore the original implementation
        setattr(target_object, attribute_name, original_attr)
        print(f"  Original implementation restored")

# Example class to patch
class Calculator:
    @staticmethod
    def add(a, b):
        """Add two numbers."""
        return a + b
    
    @staticmethod
    def multiply(a, b):
        """Multiply two numbers."""
        return a * b
    
    @staticmethod
    def divide(a, b):
        """Divide a by b."""
        return a / b

# Demo usage
def broken_add(a, b):
    """A deliberately incorrect addition function."""
    print(f"Using broken_add({a}, {b})")
    return a - b  # Wrong implementation!

def advanced_multiply(a, b):
    """An enhanced multiplication function with logging."""
    print(f"Enhanced multiply called with {a} and {b}")
    result = a * b
    print(f"Result: {result}")
    return result

print("Original behavior:")
print(f"Calculator.add(5, 3) = {Calculator.add(5, 3)}")
print(f"Calculator.multiply(5, 3) = {Calculator.multiply(5, 3)}")
print()

print("With monkey patching:")
with monkey_patch(Calculator, 'add', broken_add):
    print(f"Calculator.add(5, 3) = {Calculator.add(5, 3)}")
    # Original multiply still works
    print(f"Calculator.multiply(5, 3) = {Calculator.multiply(5, 3)}")

print("\nAfter first monkey patch:")
print(f"Calculator.add(5, 3) = {Calculator.add(5, 3)}")
print()

print("With another monkey patch:")
with monkey_patch(Calculator, 'multiply', advanced_multiply):
    print(f"Calculator.multiply(5, 3) = {Calculator.multiply(5, 3)}")
    # Original add is still restored
    print(f"Calculator.add(5, 3) = {Calculator.add(5, 3)}")

print("\nAfter all patches:")
print(f"Calculator.add(5, 3) = {Calculator.add(5, 3)}")
print(f"Calculator.multiply(5, 3) = {Calculator.multiply(5, 3)}")

# Example of patching with exception
print("\nMonkey patch with exception:")

try:
    with monkey_patch(Calculator, 'divide', lambda a, b: a / (b - b)):  # Will cause division by zero
        print("About to cause an error...")
        result = Calculator.divide(10, 5)
        print(f"This won't print: {result}")
except ZeroDivisionError as e:
    print(f"Caught expected error: {e}")

print("\nAfter exception, divide should be restored:")
print(f"Calculator.divide(10, 2) = {Calculator.divide(10, 2)}")
```

### Internal Flow Visualization:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase                                            │
│  original_attr = getattr(target_object, attribute_name)   │
│  # Store reference to original Calculator.add method      │
│                                                           │
│  # Apply the patch                                        │
│  setattr(target_object, attribute_name, new_implementation)│
│  # Now Calculator.add points to broken_add function       │
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      yield                                                │
│                                                           │
│      # Inside context: Calls to the patched method        │
│      # use the new implementation                         │
│      # Calculator.add(5, 3) actually calls broken_add(5, 3)│
│                                                           │
│  finally:                                                 │
│      # Cleanup phase - ALWAYS executed                    │
│      setattr(target_object, attribute_name, original_attr)│
│      # Restore Calculator.add to the original method      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 18. Suppressing Specific Warnings

Let's create a context manager for temporarily suppressing specific warnings:

```python
import warnings
from contextlib import contextmanager

@contextmanager
def suppress_warnings(warning_type=Warning, message_pattern=None):
    """
    Context manager to temporarily suppress specific warnings.
    
    Args:
        warning_type: The warning class to suppress (default: all warnings)
        message_pattern: Only suppress warnings with this substring in the message (optional)
    """
    # Define a custom warning filter function
    def custom_warning_filter(message, category, filename, lineno, file=None, line=None):
        # If message_pattern is None or if it's in the warning message
        if message_pattern is None or message_pattern in str(message):
            # Return None to suppress the warning
            return None
        # Return a standard result (filename, lineno, category.__name__, message)
        return filename, lineno, category.__name__, str(message)
    
    # Store the original showwarning function
    original_showwarning = warnings.showwarning
    warning_name = warning_type.__name__
    
    print(f"Suppressing warnings of type: {warning_name}")
    if message_pattern:
        print(f"  with message pattern: '{message_pattern}'")
    
    # Replace with our custom filter
    def custom_showwarning(message, category, filename, lineno, file=None, line=None):
        if issubclass(category, warning_type):
            # Apply our custom filter
            result = custom_warning_filter(message, category, filename, lineno, file, line)
            if result is None:
                # Warning suppressed
                return
        # Not suppressed, use original behavior
        original_showwarning(message, category, filename, lineno, file, line)
    
    # Apply our custom showwarning function
    warnings.showwarning = custom_showwarning
    print("  Warning suppression active")
    
    try:
        yield
        print("  Context completed normally")
    finally:
        # Restore original behavior
        warnings.showwarning = original_showwarning
        print("  Original warning behavior restored")

# Demo
def function_with_warnings():
    """A function that generates various warnings."""
    warnings.warn("This is a general warning", Warning)
    warnings.warn("This is a deprecation warning", DeprecationWarning)
    warnings.warn("This is a user warning about a problem", UserWarning)
    warnings.warn("This is a runtime warning about calculations", RuntimeWarning)

print("Without suppression (all warnings shown):")
with warnings.catch_warnings(record=True) as w:
    # Ensure warnings are always shown
    warnings.simplefilter("always")
    function_with_warnings()
    print(f"  Caught {len(w)} warnings")
    for i, warning in enumerate(w):
        print(f"  {i+1}. {warning.category.__name__}: {warning.message}")

print("\nWith suppression of all warnings:")
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    with suppress_warnings():
        function_with_warnings()
    print(f"  Caught {len(w)} warnings")

print("\nWith suppression of only DeprecationWarning:")
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    with suppress_warnings(DeprecationWarning):
        function_with_warnings()
    print(f"  Caught {len(w)} warnings")
    for i, warning in enumerate(w):
        print(f"  {i+1}. {warning.category.__name__}: {warning.message}")

print("\nWith suppression of warnings containing 'problem':")
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    with suppress_warnings(message_pattern="problem"):
        function_with_warnings()
    print(f"  Caught {len(w)} warnings")
    for i, warning in enumerate(w):
        print(f"  {i+1}. {warning.category.__name__}: {warning.message}")
```

### Internal Flow Visualization:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase                                            │
│  original_showwarning = warnings.showwarning              │
│  # Store reference to original warning display function   │
│                                                           │
│  # Define custom warning filter                           │
│  def custom_showwarning(...):                             │
│      if issubclass(category, warning_type):               │
│          # Apply custom filter for our target warnings    │
│          if message_pattern in str(message):              │
│              return  # Skip showing this warning          │
│      # Otherwise, use original function                   │
│      original_showwarning(...)                            │
│                                                           │
│  # Apply patch                                            │
│  warnings.showwarning = custom_showwarning                │
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      yield                                                │
│                                                           │
│      # Inside context: warnings.warn() calls              │
│      # are filtered through our custom_showwarning        │
│                                                           │
│  finally:                                                 │
│      # Cleanup phase - ALWAYS executed                    │
│      warnings.showwarning = original_showwarning          │
│      # Restore original warning behavior                  │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 19. Retry Logic for Unreliable Operations

Let's create a context manager for retrying operations that might fail temporarily:

```python
import time
import random
from contextlib import contextmanager

class RetryExhausted(Exception):
    """Exception raised when all retry attempts are exhausted."""
    pass

@contextmanager
def retry_context(max_attempts=3, base_delay=1, backoff_factor=2, 
                  exceptions_to_retry=(Exception,), jitter=0.1):
    """
    Context manager that retries a block of code if it raises specified exceptions.
    
    Args:
        max_attempts: Maximum number of attempts (including the first attempt)
        base_delay: Initial delay between retries (in seconds)
        backoff_factor: Multiplier for delay after each retry
        exceptions_to_retry: Tuple of exception types to catch and retry
        jitter: Random factor to avoid thundering herd problem
    
    Raises:
        RetryExhausted: When all retry attempts are exhausted
        Other exceptions: Any exception not in exceptions_to_retry
    """
    exception_names = [e.__name__ for e in exceptions_to_retry]
    print(f"Retry context: max {max_attempts} attempts, retrying: {', '.join(exception_names)}")
    
    attempt = 1
    while True:
        try:
            print(f"Attempt {attempt}/{max_attempts}...")
            yield attempt  # Pass the current attempt number to the with-block
            
            # If we get here, the with-block completed without exceptions
            print(f"Operation succeeded on attempt {attempt}")
            break
            
        except exceptions_to_retry as e:
            # Failed with a retryable exception
            if attempt >= max_attempts:
                print(f"All {max_attempts} retry attempts exhausted")
                print(f"Last error: {type(e).__name__}: {e}")
                raise RetryExhausted(f"Failed after {max_attempts} attempts. Last error: {e}") from e
            
            # Calculate delay with exponential backoff and jitter
            delay = base_delay * (backoff_factor ** (attempt - 1))
            jitter_amount = random.uniform(-jitter * delay, jitter * delay)
            adjusted_delay = delay + jitter_amount
            
            print(f"Attempt {attempt} failed with: {type(e).__name__}: {e}")
            print(f"Retrying in {adjusted_delay:.2f} seconds...")
            
            time.sleep(adjusted_delay)
            attempt += 1
            
        except Exception as e:
            # Failed with a non-retryable exception
            print(f"Non-retryable exception: {type(e).__name__}: {e}")
            raise  # Re-raise the exception

# Example of an unreliable function to demonstrate retries
def unreliable_operation(fail_probability=0.7, fail_permanently=False):
    """An operation that sometimes fails temporarily, sometimes permanently."""
    if fail_permanently and hasattr(unreliable_operation, 'fail_always'):
        print("Operation has been marked to fail permanently")
        raise ValueError("Permanent failure condition")
    
    if random.random() < fail_probability:
        if random.random() < 0.3:  # 30% of failures are non-retryable
            print("Simulating a non-retryable error")
            raise TypeError("Non-retryable error type")
        else:
            print("Simulating a temporary failure")
            raise ConnectionError("Temporary connection error")
    
    # If we get here, the operation succeeded
    print("Operation succeeded!")
    return "Operation result data"

# Demo: Successful retry
print("=== Demonstration 1: Operation That Eventually Succeeds ===")
try:
    with retry_context(max_attempts=5, exceptions_to_retry=(ConnectionError,)) as attempt:
        # Higher probability of success after first attempt
        result = unreliable_operation(fail_probability=0.5 if attempt > 1 else 0.9)
        print(f"Got result: {result}")
except RetryExhausted as e:
    print(f"Retry exhausted: {e}")
except Exception as e:
    print(f"Other exception: {type(e).__name__}: {e}")

# Demo: Non-retryable exception
print("\n=== Demonstration 2: Non-retryable Exception ===")
try:
    with retry_context(max_attempts=5, exceptions_to_retry=(ConnectionError,)) as attempt:
        result = unreliable_operation(fail_probability=0.9)  # High chance of failure
        print(f"Got result: {result}")
except RetryExhausted as e:
    print(f"Retry exhausted: {e}")
except Exception as e:
    print(f"Other exception: {type(e).__name__}: {e}")

# Demo: All retries exhausted
print("\n=== Demonstration 3: All Retries Exhausted ===")
try:
    # Mark the function to always fail
    unreliable_operation.fail_always = True
    
    with retry_context(max_attempts=3, exceptions_to_retry=(ConnectionError, ValueError)) as attempt:
        result = unreliable_operation(fail_permanently=True)
        print(f"Got result: {result}")
except RetryExhausted as e:
    print(f"Retry exhausted: {e}")
except Exception as e:
    print(f"Other exception: {type(e).__name__}: {e}")

# Clean up
if hasattr(unreliable_operation, 'fail_always'):
    delattr(unreliable_operation, 'fail_always')
```

### Internal Flow Visualization:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Outer loop for retry attempts                          │
│  attempt = 1                                              │
│  while True:                                              │
│      try:                                                 │
│          # With-block execution                           │
│          yield attempt  # Pass attempt number to block    │
│                                                           │
│          # Inside context: User code runs                 │
│          # result = unreliable_operation(...)             │
│                                                           │
│          # If no exception, exit retry loop               │
│          break                                            │
│                                                           │
│      except exceptions_to_retry as e:                     │
│          # Check if we've exhausted retries               │
│          if attempt >= max_attempts:                      │
│              raise RetryExhausted(...)                    │
│                                                           │
│          # Calculate delay with backoff and jitter        │
│          delay = base_delay * (backoff_factor**(attempt-1))│
│          time.sleep(delay + jitter)                       │
│                                                           │
│          # Increment attempt counter                      │
│          attempt += 1                                     │
│                                                           │
│      except Exception as e:                               │
│          # Non-retryable exception                        │
│          raise  # Re-raise immediately                    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## 20. Memory Profiling Context

Let's create a context manager for memory profiling:

```python
import gc
import os
import psutil
import time
from contextlib import contextmanager

@contextmanager
def memory_profiler(name="Operation", detailed=False):
    """
    Context manager for measuring memory usage of a code block.
    
    Args:
        name: Name of the operation for logging
        detailed: Whether to collect and display detailed memory stats
    """
    # Get the current process
    process = psutil.Process(os.getpid())
    
    # Force garbage collection before measurement
    gc.collect()
    
    # Initial memory state
    start_memory = process.memory_info().rss
    start_time = time.time()
    
    print(f"[{name}] Starting memory profile")
    print(f"  Initial memory usage: {start_memory / (1024 * 1024):.2f} MB")
    
    if detailed:
        # Get more detailed initial stats
        start_detailed = {
            'gc_objects': len(gc.get_objects()),
            'virtual_memory': psutil.virtual_memory().percent,
            'swap_memory': psutil.swap_memory().percent
        }
        print(f"  GC tracked objects: {start_detailed['gc_objects']}")
        print(f"  System virtual memory usage: {start_detailed['virtual_memory']}%")
        print(f"  System swap usage: {start_detailed['swap_memory']}%")
    
    try:
        # Execute the with-block
        yield
    finally:
        # Final memory state
        # Force garbage collection to ensure fair comparison
        gc.collect()
        
        end_memory = process.memory_info().rss
        end_time = time.time()
        duration = end_time - start_time
        
        memory_diff = end_memory - start_memory
        memory_diff_mb = memory_diff / (1024 * 1024)
        
        print(f"[{name}] Memory profile complete after {duration:.2f} seconds")
        print(f"  Final memory usage: {end_memory / (1024 * 1024):.2f} MB")
        print(f"  Memory change: {memory_diff_mb:+.2f} MB")
        
        if detailed:
            # Get more detailed final stats
            end_detailed = {
                'gc_objects': len(gc.get_objects()),
                'virtual_memory': psutil.virtual_memory().percent,
                'swap_memory': psutil.swap_memory().percent
            }
            
            # Calculate and print differences
            gc_diff = end_detailed['gc_objects'] - start_detailed['gc_objects']
            vm_diff = end_detailed['virtual_memory'] - start_detailed['virtual_memory']
            swap_diff = end_detailed['swap_memory'] - start_detailed['swap_memory']
            
            print(f"  GC tracked objects: {end_detailed['gc_objects']} ({gc_diff:+d})")
            print(f"  System virtual memory usage: {end_detailed['virtual_memory']}% ({vm_diff:+.1f}%)")
            print(f"  System swap usage: {end_detailed['swap_memory']}% ({swap_diff:+.1f}%)")

# Demo with a memory-intensive operation
def memory_intensive_task():
    """Create and manipulate large data structures."""
    print("Starting memory-intensive task...")
    
    # Create a large list
    large_list = [i * 2 for i in range(1000000)]
    print(f"Created list with {len(large_list)} items")
    
    # Create a large dictionary
    large_dict = {i: f"value_{i}" for i in range(500000)}
    print(f"Created dict with {len(large_dict)} items")
    
    # Do some operations
    results = [large_list[i] * 2 for i in range(0, 1000000, 100)]
    print(f"Computed {len(results)} results from list")
    
    # Return to release these variables when function ends
    print("Memory-intensive task complete")
    return sum(results)

# Basic memory profiling
print("\n=== Basic Memory Profiling ===")
with memory_profiler("List Creation"):
    large_list = [i * 3 for i in range(2000000)]
    print(f"List created with {len(large_list)} elements")
    
    # Delete to free memory
    del large_list

# Detailed memory profiling
print("\n=== Detailed Memory Profiling ===")
with memory_profiler("Complex Operations", detailed=True):
    result = memory_intensive_task()
    print(f"Final result: {result}")

# Nested profiling contexts
print("\n=== Nested Memory Profiling ===")
with memory_profiler("Outer Context"):
    # Do some initial work
    outer_data = list(range(100000))
    
    with memory_profiler("Nested Context"):
        # Do some more intensive work
        nested_data = {i: i**2 for i in range(200000)}
        print(f"Created nested dictionary with {len(nested_data)} items")
        
        # Delete to free some memory
        del nested_data
    
    # Do more work after the nested context
    more_data = [i * 3 for i in range(300000)]
    print(f"Created additional list with {len(more_data)} items")
```

### Internal Flow Visualization:

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  # Setup phase                                            │
│  process = psutil.Process(os.getpid())                    │
│  gc.collect()  # Force garbage collection                 │
│                                                           │
│  # Record initial memory state                            │
│  start_memory = process.memory_info().rss                 │
│  start_time = time.time()                                 │
│                                                           │
│  if detailed:                                             │
│      # Collect additional memory metrics                  │
│      start_detailed = {...}                               │
│                                                           │
│  try:                                                     │
│      # With-block execution                               │
│      yield                                                │
│                                                           │
│      # Inside context: Memory-intensive operations        │
│      # large_list = [i * 3 for i in range(2000000)]      │
│                                                           │
│  finally:                                                 │
│      # Cleanup phase - ALWAYS executed                    │
│      gc.collect()  # Force garbage collection again       │
│                                                           │
│      # Record final memory state                          │
│      end_memory = process.memory_info().rss               │
│      end_time = time.time()                               │
│                                                           │
│      # Calculate and log memory differences               │
│      memory_diff = end_memory - start_memory              │
│                                                           │
│      if detailed:                                         │
│          # Calculate detailed metric differences          │
│          end_detailed = {...}                             │
│          # Print detailed comparison                      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

## Key Insights from These Context Manager Use Cases

After exploring these detailed examples, let's distill some key insights about how context managers work internally:

### 1. The Basic Context Manager Lifecycle

Every context manager follows a consistent lifecycle:
- **Setup**: Executed when the `with` statement is encountered (`__enter__` method)
- **Body Execution**: User's code inside the `with` block
- **Cleanup**: Always executed when the block completes, whether normally or with an exception (`__exit__` method)

### 2. The Dual Context Manager Implementation Patterns

We've seen two main implementation patterns:

**Class-based context managers**:
```python
class MyContextManager:
    def __init__(self, ...):
        # Initialize state
    
    def __enter__(self):
        # Setup code
        return resource  # What gets bound to the as-variable
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # Cleanup code
        # Return False to propagate exceptions, True to suppress them
```

**Generator-based context managers** (using `@contextmanager`):
```python
@contextmanager
def my_context_manager(...):
    # Setup code
    try:
        yield resource  # What gets bound to the as-variable
    finally:
        # Cleanup code (always runs)
```

### 3. Exception Handling Flexibility

Context managers give you three options for handling exceptions:
1. **Propagate**: Return `False` from `__exit__` (default)
2. **Suppress**: Return `True` from `__exit__`
3. **Transform**: Catch the exception and raise a different one

### 4. Common Context Manager Use Patterns

The examples show recurring patterns for context managers:
- **Resource Acquisition and Release**: Files, connections, locks
- **Temporary State Changes**: Environment variables, configurations
- **Monitoring and Instrumentation**: Timing, logging, profiling
- **Runtime Behavior Modification**: Mocking, patching, suppression

### 5. Building Complex Behaviors with Context Manager Composition

The examples demonstrate how complex behaviors can be built by:
- **Nesting**: Using context managers inside other context managers
- **ExitStack**: Managing collections of context managers dynamically
- **Reusable Components**: Building a library of context managers for different purposes

## Understanding the Internals: What Actually Happens With `with`

When Python executes a `with` statement like this:

```python
with context_expression as target:
    # with-block body
```

The following steps happen:

1. Evaluate `context_expression` to get a context manager object
2. Call the context manager's `__enter__()` method
3. Bind the return value of `__enter__()` to `target` (if used)
4. Execute the with-block body
5. Call the context manager's `__exit__(exc_type, exc_val, exc_tb)` method:
   - If the block raised an exception, pass the exception info to `__exit__`
   - If the block exited normally, pass `None, None, None` to `__exit__`
6. If `__exit__` returns True, any exception is suppressed
7. If `__exit__` returns False, any exception is re-raised

For generator-based context managers using `@contextmanager`, this happens:

1. Create a generator by calling the decorated function
2. Advance the generator to the `yield` statement (setup code runs)
3. Capture the yielded value as the return value of `__enter__`
4. Execute the with-block body
5. Either:
   - If the block raised an exception, send the exception into the generator using `throw()`
   - If the block exited normally, resume the generator to run cleanup code
6. If the generator re-raises or raises a new exception, it propagates
7. If the generator completes normally, any exception from the with-block is re-raised

## Conclusion: When and How to Use Context Managers

After exploring these detailed use cases, we can conclude:

### When to Use Context Managers

1. **Resource Management**: Whenever you need to ensure proper cleanup of resources
2. **Temporary State Changes**: When making temporary modifications that must be reverted
3. **Entry/Exit Actions**: For operations that require setup before and cleanup after
4. **Cross-Cutting Concerns**: For functionality that applies across different operations (logging, timing, etc.)

### How to Choose Implementation Style

1. **Use class-based context managers when**:
   - You need to maintain complex state
   - You need to create reusable components with multiple methods
   - You want fine-grained control over exception handling

2. **Use generator-based context managers when**:
   - The logic is straightforward (setup-yield-cleanup)
   - You don't need complex state management
   - The implementation is shorter and clearer as a function

### Why Context Managers Are Better Than Alternatives

1. **Compared to manual try/finally**:
   - More concise and readable
   - Less prone to errors or omissions
   - Encourages code reuse

2. **Compared to callbacks**:
   - More Pythonic and aligned with block-structured code
   - Better for maintaining local state and variable scope
   - Easier to reason about execution flow

Context managers are one of Python's most elegant features because they allow you to express resource management in a way that follows the principle of "Resource Acquisition Is Initialization" (RAII) while maintaining Python's clean, readable syntax.

By understanding how context managers work internally and seeing these diverse practical examples, you now have a comprehensive toolkit for solving a wide range of programming challenges using this powerful pattern.