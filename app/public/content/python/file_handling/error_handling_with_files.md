# Error Handling with Files: From First Principles

## Understanding Errors in Programming

Before diving into file-specific errors, let's understand what errors (called **exceptions** in Python) actually are:

> **Mental Model** : Think of exceptions as Python's way of saying "Something unexpected happened that I can't handle automatically. I need you, the programmer, to tell me what to do."

```python
# Without error handling - program crashes
def bad_file_reader():
    file = open("nonexistent.txt", "r")  # This will crash!
    content = file.read()
    return content

# With error handling - program continues gracefully
def good_file_reader():
    try:
        file = open("nonexistent.txt", "r")
        content = file.read()
        return content
    except FileNotFoundError:
        print("File doesn't exist!")
        return None
```

## Why File Operations Are Error-Prone

File operations involve interacting with the operating system and disk storage, which introduces many potential failure points:

```
Your Python Program
        ↓
Operating System
        ↓
File System
        ↓
Physical Storage (Hard Drive/SSD)
```

At each level, things can go wrong:

* File might not exist
* You might not have permission
* Disk might be full
* Hardware might fail
* Network drive might be disconnected

## Basic Exception Handling Syntax

```python
# Basic try-except structure
try:
    # Code that might fail
    risky_operation()
except SpecificError:
    # Handle the specific error
    handle_error()
```

Let's see this in action with file operations:

```python
# Example 1: Basic file reading with error handling
def read_file_basic(filename):
    try:
        # Attempt to open and read file
        with open(filename, 'r') as file:
            content = file.read()
            print(f"Successfully read {len(content)} characters")
            return content
    except FileNotFoundError:
        print(f"Error: '{filename}' was not found")
        return None

# Test it
content = read_file_basic("existing_file.txt")    # Works if file exists
content = read_file_basic("missing_file.txt")     # Handles error gracefully
```

## FileNotFoundError: Deep Dive

`FileNotFoundError` is raised when Python tries to access a file that doesn't exist at the specified path.

> **Common Causes** :
>
> * Typo in filename
> * File is in a different directory
> * File was deleted or moved
> * Case sensitivity issues (important on Linux/Mac)

```python
import os

def demonstrate_file_not_found():
    print("Current working directory:", os.getcwd())
    print("Files in current directory:", os.listdir("."))
  
    # These will likely cause FileNotFoundError
    problematic_files = [
        "nonexistent.txt",           # File doesn't exist
        "EXISTING.txt",              # Wrong case (if file is existing.txt)
        "/wrong/path/file.txt",      # Wrong directory
        "file with spaces.txt"       # Might exist but hard to type correctly
    ]
  
    for filename in problematic_files:
        try:
            with open(filename, 'r') as file:
                print(f"✓ Successfully opened {filename}")
        except FileNotFoundError as e:
            print(f"✗ Could not find: {filename}")
            print(f"  Full error: {e}")
```

### Handling FileNotFoundError Gracefully

```python
def robust_file_reader(filename, default_content=""):
    """
    Reads a file with multiple fallback strategies
    """
    try:
        with open(filename, 'r') as file:
            return file.read()
  
    except FileNotFoundError:
        print(f"File '{filename}' not found. Trying alternatives...")
      
        # Strategy 1: Try common alternative locations
        alternative_paths = [
            f"data/{filename}",
            f"files/{filename}",
            f"../{filename}"
        ]
      
        for alt_path in alternative_paths:
            try:
                with open(alt_path, 'r') as file:
                    print(f"Found file at: {alt_path}")
                    return file.read()
            except FileNotFoundError:
                continue
      
        # Strategy 2: Create the file with default content
        print(f"Creating new file '{filename}' with default content")
        with open(filename, 'w') as file:
            file.write(default_content)
        return default_content

# Usage examples
content = robust_file_reader("config.txt", "# Default configuration\n")
```

## PermissionError: Understanding Access Rights

`PermissionError` occurs when you don't have the necessary permissions to perform the requested file operation.

> **Permission Types** :
>
> * **Read** : Can view file contents
> * **Write** : Can modify file contents
> * **Execute** : Can run file as a program

```python
import os
import stat

def demonstrate_permissions():
    # Create a test file
    test_file = "permission_test.txt"
    with open(test_file, 'w') as f:
        f.write("Test content")
  
    # Make file read-only (remove write permission)
    current_permissions = os.stat(test_file).st_mode
    os.chmod(test_file, stat.S_IREAD)  # Read-only
  
    try:
        # Try to write to read-only file
        with open(test_file, 'w') as f:
            f.write("This will fail!")
    except PermissionError as e:
        print(f"Permission denied: {e}")
  
    # Restore original permissions
    os.chmod(test_file, current_permissions)
    os.remove(test_file)  # Clean up
```

### Handling PermissionError

```python
def safe_file_writer(filename, content, backup_location=None):
    """
    Writes to a file with permission error handling
    """
    try:
        with open(filename, 'w') as file:
            file.write(content)
            print(f"✓ Successfully wrote to {filename}")
            return True
  
    except PermissionError:
        print(f"✗ Permission denied for {filename}")
      
        # Strategy 1: Try backup location
        if backup_location:
            try:
                with open(backup_location, 'w') as file:
                    file.write(content)
                    print(f"✓ Wrote to backup location: {backup_location}")
                    return True
            except PermissionError:
                print(f"✗ Backup location also denied: {backup_location}")
      
        # Strategy 2: Try user's home directory
        import os
        home_backup = os.path.expanduser(f"~/{os.path.basename(filename)}")
        try:
            with open(home_backup, 'w') as file:
                file.write(content)
                print(f"✓ Wrote to home directory: {home_backup}")
                return True
        except PermissionError:
            print("✗ Even home directory is not writable")
            return False

# Usage
success = safe_file_writer(
    "/system/protected_file.txt",  # Likely to fail
    "Important data",
    backup_location="backup_file.txt"
)
```

## Comprehensive Error Handling Pattern

Here's a robust pattern that handles multiple types of file errors:

```python
import os
import errno
from pathlib import Path

def bulletproof_file_operation(filename, operation="read", content=None):
    """
    Performs file operations with comprehensive error handling
  
    Args:
        filename: Path to file
        operation: 'read', 'write', or 'append'
        content: Content to write (for write/append operations)
  
    Returns:
        tuple: (success: bool, result: str or None, error_msg: str or None)
    """
  
    try:
        # Ensure directory exists for write operations
        if operation in ['write', 'append']:
            Path(filename).parent.mkdir(parents=True, exist_ok=True)
      
        # Perform the requested operation
        if operation == 'read':
            with open(filename, 'r', encoding='utf-8') as file:
                result = file.read()
                return True, result, None
      
        elif operation == 'write':
            with open(filename, 'w', encoding='utf-8') as file:
                file.write(content or "")
                return True, f"Wrote {len(content or '')} characters", None
      
        elif operation == 'append':
            with open(filename, 'a', encoding='utf-8') as file:
                file.write(content or "")
                return True, f"Appended {len(content or '')} characters", None
      
        else:
            return False, None, f"Unknown operation: {operation}"
  
    # Handle specific file-related errors
    except FileNotFoundError:
        error_msg = f"File not found: {filename}"
        if operation == 'read':
            error_msg += "\nSuggestions:"
            error_msg += f"\n- Check if file exists: {os.path.exists(filename)}"
            error_msg += f"\n- Current directory: {os.getcwd()}"
            error_msg += f"\n- Files in current dir: {os.listdir('.')[:5]}..."
        return False, None, error_msg
  
    except PermissionError:
        error_msg = f"Permission denied: {filename}"
        error_msg += f"\n- File permissions: {oct(os.stat(filename).st_mode)[-3:] if os.path.exists(filename) else 'N/A'}"
        error_msg += f"\n- You are user: {os.getlogin() if hasattr(os, 'getlogin') else 'Unknown'}"
        return False, None, error_msg
  
    except IsADirectoryError:
        return False, None, f"'{filename}' is a directory, not a file"
  
    except OSError as e:
        # Handle various OS-level errors
        if e.errno == errno.ENOSPC:
            return False, None, "No space left on device"
        elif e.errno == errno.ENAMETOOLONG:
            return False, None, "Filename too long"
        elif e.errno == errno.ELOOP:
            return False, None, "Too many symbolic links"
        else:
            return False, None, f"OS Error: {e}"
  
    except UnicodeError as e:
        return False, None, f"Text encoding error: {e}"
  
    except Exception as e:
        # Catch-all for unexpected errors
        return False, None, f"Unexpected error: {type(e).__name__}: {e}"

# Demonstration of comprehensive error handling
def demo_comprehensive_handling():
    test_cases = [
        ("existing_file.txt", "read", None),
        ("new_file.txt", "write", "Hello, World!"),
        ("/root/protected.txt", "write", "This will fail"),
        ("nonexistent.txt", "read", None),
        (".", "read", None),  # Directory instead of file
    ]
  
    for filename, operation, content in test_cases:
        print(f"\nTesting: {operation} on '{filename}'")
        print("-" * 40)
      
        success, result, error = bulletproof_file_operation(
            filename, operation, content
        )
      
        if success:
            print(f"✓ Success: {result}")
        else:
            print(f"✗ Failed: {error}")
```

## Advanced Error Handling Patterns

### Context Managers and Error Handling

```python
class SafeFileHandler:
    """
    Custom context manager that ensures proper file handling
    """
    def __init__(self, filename, mode='r', encoding='utf-8'):
        self.filename = filename
        self.mode = mode
        self.encoding = encoding
        self.file = None
        self.error = None
  
    def __enter__(self):
        try:
            self.file = open(self.filename, self.mode, encoding=self.encoding)
            return self.file
        except (FileNotFoundError, PermissionError, OSError) as e:
            self.error = e
            # Return a null object that handles operations gracefully
            return NullFile()
  
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file:
            self.file.close()
      
        # Return False to propagate any exceptions that occurred in the with block
        return False
  
    def had_error(self):
        return self.error is not None
  
    def get_error(self):
        return self.error

class NullFile:
    """Null object pattern for failed file operations"""
    def read(self): return ""
    def write(self, content): return 0
    def readline(self): return ""
    def readlines(self): return []
    def __iter__(self): return iter([])

# Usage example
def safe_file_processing():
    handler = SafeFileHandler("potentially_missing_file.txt")
  
    with handler as file:
        content = file.read()
        # Process content (will be empty string if file didn't exist)
        processed = content.upper()
  
    if handler.had_error():
        print(f"File operation failed: {handler.get_error()}")
        return None
    else:
        return processed
```

### Retry Logic for Transient Errors

```python
import time
import random

def resilient_file_operation(filename, operation_func, max_retries=3, base_delay=1):
    """
    Performs file operations with exponential backoff retry logic
    """
    for attempt in range(max_retries):
        try:
            return operation_func(filename)
      
        except (OSError, IOError) as e:
            if attempt == max_retries - 1:  # Last attempt
                raise e
          
            # Exponential backoff with jitter
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            print(f"Attempt {attempt + 1} failed: {e}")
            print(f"Retrying in {delay:.2f} seconds...")
            time.sleep(delay)

# Example usage with network files or busy files
def read_busy_file(filename):
    def read_operation(fname):
        with open(fname, 'r') as f:
            return f.read()
  
    try:
        content = resilient_file_operation(filename, read_operation)
        return content
    except Exception as e:
        print(f"Failed after all retries: {e}")
        return None
```

## Best Practices Summary

> **Golden Rules for File Error Handling** :
>
> 1. **Always use context managers** (`with` statements) for file operations
> 2. **Be specific with exception handling** - catch specific exceptions, not generic `Exception`
> 3. **Provide meaningful error messages** with actionable suggestions
> 4. **Have fallback strategies** when possible
> 5. **Log errors appropriately** for debugging
> 6. **Test error conditions** - don't just test the happy path

```python
# ✓ GOOD: Specific, informative error handling
def good_file_reader(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"File '{filename}' not found in {os.getcwd()}")
        return None
    except PermissionError:
        print(f"No permission to read '{filename}'")
        return None
    except UnicodeDecodeError:
        print(f"Cannot decode '{filename}' as UTF-8")
        return None

# ✗ BAD: Generic exception handling
def bad_file_reader(filename):
    try:
        with open(filename, 'r') as file:
            return file.read()
    except Exception:
        print("Something went wrong")  # Not helpful!
        return None
```

This comprehensive approach to file error handling ensures your programs are robust, user-friendly, and maintainable. The key is anticipating what can go wrong and providing graceful ways to handle those situations.
