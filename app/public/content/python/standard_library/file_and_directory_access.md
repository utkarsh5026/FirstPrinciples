# File and Directory Access in Python from First Principles

File and directory operations are foundational concepts in programming because they allow our programs to interact with the computer's file system. Let's build an understanding of these concepts from the ground up.

## What is a File System?

At the most fundamental level, a computer stores data in physical storage devices (like hard drives or SSDs). The file system is an abstraction that organizes this storage into a hierarchy of files and directories (folders).

A **file** is a named collection of related data stored on a storage device. It could contain text, images, executable code, or any other type of data.

A **directory** (or folder) is a container that can hold files and other directories, creating a hierarchical structure.

## Files as Streams of Bytes

From a programming perspective, files are essentially streams of bytes. When you open a file in Python, you're creating a connection to this stream of bytes, allowing you to read from it or write to it.

## Python's File and Directory Access Modules

Python's standard library provides several modules for file and directory operations. Let's explore them from first principles:

### 1. `os` Module

The `os` module provides a way to interact with the operating system, including file and directory operations.

```python
import os

# Get current working directory
current_dir = os.getcwd()
print(f"Current directory: {current_dir}")

# List contents of a directory
directory_contents = os.listdir(current_dir)
print(f"Directory contents: {directory_contents}")

# Create a new directory
os.mkdir("new_folder")
print("Created new folder")

# Rename a file or directory
os.rename("new_folder", "renamed_folder")
print("Renamed folder")

# Remove a file
with open("temp_file.txt", "w") as f:
    f.write("This file will be deleted")
os.remove("temp_file.txt")
print("Removed temp_file.txt")

# Remove a directory
os.rmdir("renamed_folder")
print("Removed directory")
```

In this example:

* `os.getcwd()` returns the current working directory (where your Python script is running)
* `os.listdir()` returns a list of all files and directories in the specified path
* `os.mkdir()` creates a new directory
* `os.rename()` renames a file or directory
* `os.remove()` deletes a file
* `os.rmdir()` removes an empty directory

### 2. `os.path` Module

The `os.path` module provides functions for working with file paths in a platform-independent way.

```python
import os.path

# Check if a path exists
file_exists = os.path.exists("example.txt")
print(f"File exists: {file_exists}")

# Create a test file if it doesn't exist
if not file_exists:
    with open("example.txt", "w") as f:
        f.write("Hello, world!")
    print("Created example.txt")

# Get the size of a file in bytes
file_size = os.path.getsize("example.txt")
print(f"File size: {file_size} bytes")

# Split a path into directory and filename
dirname, filename = os.path.split("/path/to/file.txt")
print(f"Directory: {dirname}, Filename: {filename}")

# Join path components
new_path = os.path.join("directory", "subdirectory", "file.txt")
print(f"Joined path: {new_path}")

# Get file extension
base, ext = os.path.splitext("document.pdf")
print(f"Base name: {base}, Extension: {ext}")

# Check if a path is a file or directory
is_file = os.path.isfile("example.txt")
is_dir = os.path.isdir(".")
print(f"Is file: {is_file}, Is directory: {is_dir}")
```

The `os.path` module is extremely useful because it handles platform-specific path formats. For example, Windows uses backslashes (`\`) in paths, while Unix-like systems use forward slashes (`/`). Using `os.path.join()` ensures your code works on all platforms.

### 3. `pathlib` Module (Python 3.4+)

The `pathlib` module provides an object-oriented approach to file system paths, making code more readable and maintainable.

```python
from pathlib import Path

# Current directory
current_dir = Path.cwd()
print(f"Current directory: {current_dir}")

# Home directory
home_dir = Path.home()
print(f"Home directory: {home_dir}")

# Create a path
file_path = Path("documents") / "report.txt"
print(f"File path: {file_path}")

# Check if a path exists
exists = file_path.exists()
print(f"Path exists: {exists}")

# Create a directory
new_dir = Path("new_directory")
new_dir.mkdir(exist_ok=True)
print(f"Created directory: {new_dir}")

# List all Python files in a directory
python_files = list(Path(".").glob("*.py"))
print(f"Python files: {python_files}")

# Read and write text
text_file = Path("message.txt")
text_file.write_text("Hello from pathlib!")
content = text_file.read_text()
print(f"File content: {content}")

# File properties
print(f"Stem: {text_file.stem}")
print(f"Suffix: {text_file.suffix}")
print(f"Parent directory: {text_file.parent}")
```

`pathlib` is generally preferred in modern Python code because it provides a more intuitive interface for path manipulation. For instance, using the `/` operator to join paths is more readable than calling `os.path.join()`.

## File Operations in Python

Now let's examine the core file operations in Python:

### Opening and Closing Files

The most basic way to work with files is using the built-in `open()` function:

```python
# Open a file for reading (default mode)
file = open("example.txt", "r")
content = file.read()
print(f"File content: {content}")
file.close()  # Always remember to close files!

# Better approach using context manager
with open("example.txt", "r") as file:
    content = file.read()
    print(f"File content: {content}")
# File is automatically closed when the block ends
```

The context manager (using `with`) automatically closes the file when you're done, even if an error occurs. This is the recommended approach.

### File Open Modes

Python provides several modes for opening files:

```python
# Read mode ('r') - default
with open("example.txt", "r") as file:
    content = file.read()
    print(f"Read mode content: {content}")

# Write mode ('w') - creates new file or truncates existing
with open("write_example.txt", "w") as file:
    file.write("This overwrites any existing content")

# Append mode ('a') - adds to end of file
with open("append_example.txt", "a") as file:
    file.write("This adds to the end of the file\n")

# Binary mode ('b') - for non-text files
with open("image.jpg", "rb") as file:
    binary_data = file.read(10)  # Read first 10 bytes
    print(f"Binary data (first 10 bytes): {binary_data}")

# Text mode ('t') - default
with open("example.txt", "rt") as file:
    text = file.read()
    print(f"Text mode content: {text}")

# Combination modes
with open("binary_write.dat", "wb") as file:
    file.write(b"Binary data")  # Note the b prefix for binary string
```

Understanding these modes is crucial:

* `'r'` - Read (default)
* `'w'` - Write (creates new file or truncates existing)
* `'a'` - Append (adds to end of file)
* `'x'` - Exclusive creation (fails if file exists)
* `'b'` - Binary mode
* `'t'` - Text mode (default)

### Reading File Content

Python offers several methods to read file content:

```python
# Create a sample file
with open("reading_example.txt", "w") as f:
    f.write("Line 1\nLine 2\nLine 3\nLine 4\nLine 5")

# Read entire file at once
with open("reading_example.txt", "r") as f:
    content = f.read()
    print(f"Entire file content:\n{content}")

# Read file line by line
with open("reading_example.txt", "r") as f:
    for line in f:
        print(f"Line: {line.strip()}")  # strip() removes trailing newline

# Read specific number of characters
with open("reading_example.txt", "r") as f:
    chunk = f.read(10)  # Read first 10 characters
    print(f"First 10 characters: {chunk}")

# Read all lines into a list
with open("reading_example.txt", "r") as f:
    lines = f.readlines()
    print(f"Lines as list: {lines}")

# Move file pointer
with open("reading_example.txt", "r") as f:
    f.seek(6)  # Move to 7th byte position
    content = f.read()
    print(f"Content from position 6: {content}")
```

The `read()`, `readline()`, and `readlines()` methods give you flexibility in how you process file content.

### Writing to Files

Writing to files is just as straightforward:

```python
# Write strings to a file
with open("write_example.txt", "w") as f:
    f.write("Hello, world!\n")
    f.write("This is line 2.\n")
  
    # Write multiple lines at once
    lines = ["Line 3\n", "Line 4\n", "Line 5\n"]
    f.writelines(lines)

# Verify the content
with open("write_example.txt", "r") as f:
    content = f.read()
    print(f"File content after writing:\n{content}")
```

Remember that `write()` doesn't automatically add newlines, so you need to include them if needed.

## Advanced Directory Operations

Let's explore some more advanced directory operations:

### Walking Directory Trees

The `os.walk()` function lets you traverse a directory tree:

```python
import os

# First, create a sample directory structure
os.makedirs("sample_dir/subdir1", exist_ok=True)
os.makedirs("sample_dir/subdir2", exist_ok=True)

# Create some sample files
with open("sample_dir/file1.txt", "w") as f:
    f.write("File 1 content")
with open("sample_dir/subdir1/file2.txt", "w") as f:
    f.write("File 2 content")
with open("sample_dir/subdir2/file3.txt", "w") as f:
    f.write("File 3 content")

# Walk the directory tree
print("Walking directory tree:")
for root, dirs, files in os.walk("sample_dir"):
    print(f"Current directory: {root}")
    print(f"  Subdirectories: {dirs}")
    print(f"  Files: {files}")
```

In this example:

* `root` is the current directory being visited
* `dirs` is a list of subdirectories in `root`
* `files` is a list of files in `root`

`os.walk()` is extremely useful for operations that need to process all files in a directory structure, like searching for files or calculating directory sizes.

### Getting File Information

```python
import os
import time

# Create a test file
with open("info_test.txt", "w") as f:
    f.write("Testing file information")

# Get file information
file_stat = os.stat("info_test.txt")
print(f"File size: {file_stat.st_size} bytes")
print(f"Last modified: {time.ctime(file_stat.st_mtime)}")
print(f"Last accessed: {time.ctime(file_stat.st_atime)}")
print(f"File mode: {file_stat.st_mode}")
```

The `os.stat()` function returns an object with various file attributes, including size, modification time, and permissions.

### Working with Temporary Files and Directories

The `tempfile` module provides functions for creating temporary files and directories:

```python
import tempfile
import os

# Create a temporary file
with tempfile.NamedTemporaryFile(delete=False) as temp_file:
    temp_file.write(b"Temporary data")
    temp_path = temp_file.name
  
print(f"Temporary file created at: {temp_path}")
print(f"Content: {open(temp_path, 'rb').read()}")
os.unlink(temp_path)  # Delete the temporary file

# Create a temporary directory
temp_dir = tempfile.mkdtemp()
print(f"Temporary directory created at: {temp_dir}")

# Create a file in the temporary directory
with open(os.path.join(temp_dir, "temp.txt"), "w") as f:
    f.write("File in temporary directory")

# Clean up
os.remove(os.path.join(temp_dir, "temp.txt"))
os.rmdir(temp_dir)
```

Temporary files and directories are useful for storing intermediate data that doesn't need to be preserved between program runs.

## Working with File Paths in a Cross-Platform Way

When writing Python code that needs to run on different operating systems, it's important to handle file paths correctly:

### Using `os.path` for Cross-Platform Compatibility

```python
import os.path

# Bad approach (Windows-specific)
bad_path = "directory\\subdirectory\\file.txt"  # Only works on Windows

# Good approach (cross-platform)
good_path = os.path.join("directory", "subdirectory", "file.txt")
print(f"Cross-platform path: {good_path}")

# Normalize a path (resolve . and .. components)
messy_path = os.path.join("dir", "..", "dir2", ".", "file.txt")
normalized_path = os.path.normpath(messy_path)
print(f"Normalized path: {normalized_path}")

# Get absolute path
abs_path = os.path.abspath("relative_file.txt")
print(f"Absolute path: {abs_path}")
```

Using `os.path.join()` ensures that the correct path separator is used for the current operating system.

### Modern Approach with `pathlib`

```python
from pathlib import Path

# Create a cross-platform path
path = Path("directory") / "subdirectory" / "file.txt"
print(f"Path using pathlib: {path}")

# Resolve a path (normalize and make absolute)
messy_path = Path("dir") / ".." / "dir2" / "." / "file.txt"
resolved_path = messy_path.resolve()
print(f"Resolved path: {resolved_path}")

# Create parent directories if they don't exist
nested_path = Path("deeply/nested/directory/structure")
nested_path.mkdir(parents=True, exist_ok=True)
print(f"Created directory structure: {nested_path}")

# Recursive glob pattern matching
root_dir = Path(".")
py_files = list(root_dir.glob("**/*.py"))  # Find all Python files recursively
print(f"Python files found: {py_files}")
```

`pathlib` makes path manipulation more intuitive and less error-prone.

## Practical Example: A File Search Utility

Let's create a practical example that uses many of the concepts we've covered - a simple file search utility:

```python
import os
import fnmatch
from datetime import datetime, timedelta

def search_files(root_dir, name_pattern=None, size_min=None, size_max=None, days=None):
    """
    Search for files matching specific criteria
  
    Parameters:
    - root_dir: Starting directory for search
    - name_pattern: Glob pattern for file names (e.g., "*.txt")
    - size_min: Minimum file size in bytes
    - size_max: Maximum file size in bytes
    - days: Only include files modified in the last X days
  
    Returns: List of matching file paths
    """
    matching_files = []
  
    # Calculate cutoff date if days is specified
    cutoff_date = None
    if days is not None:
        cutoff_date = datetime.now() - timedelta(days=days)
  
    # Walk through directory tree
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            # Check name pattern if specified
            if name_pattern and not fnmatch.fnmatch(filename, name_pattern):
                continue
              
            file_path = os.path.join(dirpath, filename)
          
            # Get file stats
            try:
                file_stat = os.stat(file_path)
            except (PermissionError, FileNotFoundError):
                continue  # Skip files we can't access
              
            # Check file size if specified
            if size_min is not None and file_stat.st_size < size_min:
                continue
            if size_max is not None and file_stat.st_size > size_max:
                continue
              
            # Check modification time if days is specified
            if cutoff_date is not None:
                mod_time = datetime.fromtimestamp(file_stat.st_mtime)
                if mod_time < cutoff_date:
                    continue
                  
            # All criteria passed, add to results
            matching_files.append(file_path)
  
    return matching_files

# Example usage
if __name__ == "__main__":
    # Create some test files
    os.makedirs("search_test/dir1", exist_ok=True)
    os.makedirs("search_test/dir2", exist_ok=True)
  
    with open("search_test/file1.txt", "w") as f:
        f.write("Small text file")
  
    with open("search_test/dir1/file2.log", "w") as f:
        f.write("A" * 10000)  # 10KB log file
  
    with open("search_test/dir2/file3.txt", "w") as f:
        f.write("B" * 5000)  # 5KB text file
  
    # Search for text files
    print("Text files:")
    text_files = search_files("search_test", name_pattern="*.txt")
    for file in text_files:
        print(f"  {file}")
  
    # Search for large files
    print("\nFiles larger than 7KB:")
    large_files = search_files("search_test", size_min=7000)
    for file in large_files:
        print(f"  {file}")
  
    # Search for recently modified files
    print("\nFiles modified in the last day:")
    recent_files = search_files("search_test", days=1)
    for file in recent_files:
        print(f"  {file}")
```

This example demonstrates how to:

1. Recursively walk through directories using `os.walk()`
2. Filter files by name pattern using `fnmatch`
3. Get file information using `os.stat()`
4. Handle file system errors gracefully
5. Apply various filtering criteria to search results

## Examples Using `shutil` for Higher-Level Operations

The `shutil` module provides higher-level file operations like copying and moving files:

```python
import shutil
import os

# Create a test directory structure
os.makedirs("shutil_src/subdir", exist_ok=True)
with open("shutil_src/file1.txt", "w") as f:
    f.write("File 1 content")
with open("shutil_src/subdir/file2.txt", "w") as f:
    f.write("File 2 content")

# Copy a single file
shutil.copy("shutil_src/file1.txt", "file1_copy.txt")
print("Copied file1.txt to file1_copy.txt")

# Copy a file with metadata
shutil.copy2("shutil_src/file1.txt", "file1_copy2.txt")
print("Copied file1.txt with metadata to file1_copy2.txt")

# Copy an entire directory tree
shutil.copytree("shutil_src", "shutil_dest")
print("Copied directory tree shutil_src to shutil_dest")

# Move a file
shutil.move("file1_copy.txt", "moved_file.txt")
print("Moved file1_copy.txt to moved_file.txt")

# Remove an entire directory tree
shutil.rmtree("shutil_dest")
print("Removed directory tree shutil_dest")
```

The `shutil` module is extremely useful for file operations that would otherwise require multiple steps, like copying directory trees.

## Error Handling in File Operations

File operations can fail for many reasons (permissions, disk space, etc.), so proper error handling is crucial:

```python
# Create a test file
with open("error_example.txt", "w") as f:
    f.write("Test content")

# Make the file read-only
os.chmod("error_example.txt", 0o444)

try:
    # Try to write to the read-only file
    with open("error_example.txt", "w") as f:
        f.write("This will fail")
except PermissionError as e:
    print(f"Permission error: {e}")

try:
    # Try to open a non-existent file
    with open("nonexistent_file.txt", "r") as f:
        content = f.read()
except FileNotFoundError as e:
    print(f"File not found: {e}")

try:
    # Try to create a file in a non-existent directory
    with open("nonexistent_dir/file.txt", "w") as f:
        f.write("This will fail")
except FileNotFoundError as e:
    print(f"Directory not found: {e}")

# Make the file writable again so we can clean up
os.chmod("error_example.txt", 0o644)
os.remove("error_example.txt")
```

It's important to handle specific exceptions like `FileNotFoundError`, `PermissionError`, and `IsADirectoryError` to provide appropriate error messages and recovery strategies.

## Conclusion

Python's standard library provides a rich set of tools for file and directory operations, from low-level file I/O to high-level directory operations. Understanding these fundamentals allows you to write robust file handling code for a wide range of applications.

Key takeaways:

1. Use context managers (`with` statements) when working with files to ensure they're properly closed
2. Choose the appropriate module for your needs (`os`, `os.path`, `pathlib`, `shutil`)
3. Handle file system errors gracefully with specific exception handling
4. Use cross-platform path manipulation functions to ensure your code works on all operating systems
5. For modern Python code, prefer `pathlib` over `os.path` for more readable and intuitive path operations

File and directory operations are fundamental skills for any Python programmer, enabling you to create, read, write, and manipulate files and directories in a clean and efficient way.
