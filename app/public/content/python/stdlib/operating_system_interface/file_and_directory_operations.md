# File and Directory Operations in Python: From First Principles

## Understanding Files and Directories at the Foundation Level

Before diving into Python code, let's establish what we're actually working with:

> **Mental Model** : Think of your computer's storage as a giant filing cabinet. Files are individual documents, and directories (folders) are drawers or sections that organize those documents. The operating system manages this filing system, and Python provides tools to interact with it safely.

```
Computer Storage (Simplified View)
│
├── Root Directory (/ on Unix, C:\ on Windows)
│   ├── home/
│   │   ├── user/
│   │   │   ├── documents/
│   │   │   │   ├── file1.txt
│   │   │   │   └── file2.py
│   │   │   └── downloads/
│   │   └── another_user/
│   └── system_files/
```

## The Evolution of File Handling in Python

Python provides multiple ways to work with files, reflecting its evolution:

1. **Built-in `open()` function** - Basic file operations
2. **`os` module** - Operating system interface (older approach)
3. **`pathlib` module** - Modern, object-oriented approach (Python 3.4+)
4. **`shutil` module** - High-level file operations

Let's explore each, understanding why each exists and when to use them.

## 1. Basic File Operations: The `open()` Function

### Reading Files: Step by Step

```python
# First principle: Files must be opened before reading
# The operating system needs to prepare the file for access

# Basic approach (not recommended for production)
file = open('example.txt', 'r')  # 'r' means read mode
content = file.read()            # Read entire file into memory
file.close()                     # CRITICAL: Always close files
print(content)

# Problem: If an error occurs, file might not close!
```

### The Pythonic Way: Context Managers

```python
# Using 'with' statement - automatically handles file closing
with open('example.txt', 'r') as file:
    content = file.read()
    # File automatically closes when leaving this block
    # Even if an error occurs!

print(content)

# Why this works: 'with' implements the context manager protocol
# It calls file.__enter__() when entering, file.__exit__() when leaving
```

> **Python Philosophy** : "Explicit is better than implicit" - The `with` statement makes resource management explicit and automatic. This is a core example of Python's design philosophy prioritizing both clarity and safety.

### Different Reading Methods

```python
# Create a sample file first
with open('sample.txt', 'w') as f:
    f.write("Line 1\nLine 2\nLine 3\n")

# Method 1: Read entire file (good for small files)
with open('sample.txt', 'r') as f:
    content = f.read()  # Returns one big string
    print(repr(content))  # "Line 1\nLine 2\nLine 3\n"

# Method 2: Read line by line (memory efficient for large files)
with open('sample.txt', 'r') as f:
    for line in f:  # f is iterable!
        print(repr(line))  # Each line includes \n character

# Method 3: Read all lines into a list
with open('sample.txt', 'r') as f:
    lines = f.readlines()  # Returns ['Line 1\n', 'Line 2\n', 'Line 3\n']
    print(lines)

# Method 4: Read one line at a time
with open('sample.txt', 'r') as f:
    first_line = f.readline()  # "Line 1\n"
    second_line = f.readline() # "Line 2\n"
```

### Writing Files Safely

```python
# Writing modes
# 'w' - Write (overwrites existing file!)
# 'a' - Append (adds to end of file)
# 'x' - Exclusive creation (fails if file exists)

# Dangerous: Overwrites without warning
with open('important_data.txt', 'w') as f:
    f.write("This replaces everything!")

# Safer: Check if file exists first
import os

filename = 'important_data.txt'
if os.path.exists(filename):
    response = input(f"File {filename} exists. Overwrite? (y/n): ")
    if response.lower() != 'y':
        print("Operation cancelled")
        exit()

with open(filename, 'w') as f:
    f.write("New content")

# Safest: Use exclusive creation mode
try:
    with open('new_file.txt', 'x') as f:  # 'x' fails if file exists
        f.write("This only works if file doesn't exist")
except FileExistsError:
    print("File already exists!")
```

## 2. Directory Operations: The `os` Module

### Understanding the Operating System Interface

```python
import os

# Get current working directory
current_dir = os.getcwd()
print(f"Currently in: {current_dir}")

# List directory contents
contents = os.listdir('.')  # '.' means current directory
print(f"Contents: {contents}")

# Check if path exists and what type it is
path = 'some_file.txt'
print(f"Exists: {os.path.exists(path)}")
print(f"Is file: {os.path.isfile(path)}")
print(f"Is directory: {os.path.isdir(path)}")
```

### Creating Directories Safely

```python
import os

# Basic directory creation
directory_name = 'new_folder'

# Unsafe way - crashes if directory exists
try:
    os.mkdir(directory_name)
    print(f"Created {directory_name}")
except FileExistsError:
    print(f"{directory_name} already exists")

# Safe way - only create if it doesn't exist
if not os.path.exists(directory_name):
    os.mkdir(directory_name)
    print(f"Created {directory_name}")
else:
    print(f"{directory_name} already exists")

# Creating nested directories
nested_path = 'parent/child/grandchild'

# os.mkdir() can't create parent directories
# os.makedirs() can create the entire path
try:
    os.makedirs(nested_path)
    print(f"Created nested structure: {nested_path}")
except FileExistsError:
    print(f"Path {nested_path} already exists")

# Most Pythonic: Use exist_ok parameter
os.makedirs(nested_path, exist_ok=True)
# This succeeds whether the path exists or not
```

### Working with Paths Safely

```python
import os

# Problem: Hard-coded path separators don't work across platforms
# Windows uses \, Unix uses /
bad_path = "folder/subfolder/file.txt"  # Won't work on Windows

# Solution: Use os.path.join()
good_path = os.path.join("folder", "subfolder", "file.txt")
print(f"Cross-platform path: {good_path}")

# Building paths step by step
base_dir = os.getcwd()
project_folder = os.path.join(base_dir, "my_project")
data_folder = os.path.join(project_folder, "data")
config_file = os.path.join(project_folder, "config.json")

print(f"Project folder: {project_folder}")
print(f"Data folder: {data_folder}")
print(f"Config file: {config_file}")
```

## 3. The Modern Approach: `pathlib`

### Why pathlib Exists

> **Design Philosophy** : The `pathlib` module represents Python's evolution toward more object-oriented, readable code. Instead of treating paths as strings with functions to manipulate them, pathlib treats paths as objects with methods.

```python
from pathlib import Path

# Old way (os.path)
import os
old_path = os.path.join(os.getcwd(), "data", "file.txt")
old_exists = os.path.exists(old_path)
old_parent = os.path.dirname(old_path)

# New way (pathlib) - more readable and intuitive
new_path = Path.cwd() / "data" / "file.txt"  # / operator joins paths!
new_exists = new_path.exists()
new_parent = new_path.parent

print(f"Old: {old_path}, exists: {old_exists}")
print(f"New: {new_path}, exists: {new_exists}")
```

### pathlib in Action

```python
from pathlib import Path

# Creating Path objects
current_dir = Path.cwd()
home_dir = Path.home()
project_dir = Path("my_project")

print(f"Current: {current_dir}")
print(f"Home: {home_dir}")

# Path operations are method calls
data_file = project_dir / "data" / "results.csv"

# Check properties
print(f"File name: {data_file.name}")        # "results.csv"
print(f"Stem (no extension): {data_file.stem}")  # "results"
print(f"Extension: {data_file.suffix}")      # ".csv"
print(f"Parent directory: {data_file.parent}") # my_project/data
print(f"All parents: {list(data_file.parents)}")

# Check existence and type
print(f"Exists: {data_file.exists()}")
print(f"Is file: {data_file.is_file()}")
print(f"Is directory: {data_file.is_dir()}")
```

### Creating Files and Directories with pathlib

```python
from pathlib import Path

# Create a project structure
project = Path("my_project")
data_dir = project / "data"
output_dir = project / "output"
config_file = project / "config.json"

# Create directories (exist_ok=True means no error if exists)
data_dir.mkdir(parents=True, exist_ok=True)
output_dir.mkdir(parents=True, exist_ok=True)

print(f"Created: {data_dir}")
print(f"Created: {output_dir}")

# Create a file
config_content = '{"debug": true, "version": "1.0"}'
config_file.write_text(config_content)
print(f"Created config file with content")

# Read the file back
content = config_file.read_text()
print(f"Config content: {content}")

# List directory contents
print("\nProject structure:")
for item in project.rglob("*"):  # rglob recursively finds all items
    indent = "  " * (len(item.parts) - len(project.parts))
    print(f"{indent}{item.name}")
```

## 4. High-Level Operations: `shutil`

### Moving and Copying Files Safely

```python
import shutil
from pathlib import Path

# Create test files
source_dir = Path("source")
dest_dir = Path("destination")
source_dir.mkdir(exist_ok=True)
dest_dir.mkdir(exist_ok=True)

test_file = source_dir / "test.txt"
test_file.write_text("This is test content")

# Copy file (preserves original)
try:
    copied_file = dest_dir / "test_copy.txt"
    shutil.copy2(test_file, copied_file)  # copy2 preserves metadata
    print(f"Copied {test_file} to {copied_file}")
except IOError as e:
    print(f"Copy failed: {e}")

# Move file (removes original)
try:
    moved_file = dest_dir / "test_moved.txt"
    shutil.move(test_file, moved_file)
    print(f"Moved {test_file} to {moved_file}")
except IOError as e:
    print(f"Move failed: {e}")

# Copy entire directory tree
source_tree = Path("source_tree")
dest_tree = Path("dest_tree")

# Create a source tree
(source_tree / "subdir").mkdir(parents=True, exist_ok=True)
(source_tree / "file1.txt").write_text("Content 1")
(source_tree / "subdir" / "file2.txt").write_text("Content 2")

# Copy the entire tree
try:
    shutil.copytree(source_tree, dest_tree, dirs_exist_ok=True)
    print(f"Copied entire tree from {source_tree} to {dest_tree}")
except Exception as e:
    print(f"Tree copy failed: {e}")
```

### Deleting Files and Directories Safely

```python
import shutil
from pathlib import Path

# Create test structure
test_dir = Path("test_deletion")
test_dir.mkdir(exist_ok=True)
(test_dir / "file1.txt").write_text("content")
(test_dir / "subdir").mkdir(exist_ok=True)
(test_dir / "subdir" / "file2.txt").write_text("content")

print("Before deletion:")
for item in test_dir.rglob("*"):
    print(f"  {item}")

# Delete individual file
file_to_delete = test_dir / "file1.txt"
if file_to_delete.exists():
    file_to_delete.unlink()  # unlink() deletes files
    print(f"Deleted {file_to_delete}")

# Delete empty directory
empty_dir = test_dir / "empty"
empty_dir.mkdir(exist_ok=True)
empty_dir.rmdir()  # rmdir() only works on empty directories
print(f"Deleted empty directory")

# Delete directory with contents (DANGEROUS!)
if test_dir.exists():
    shutil.rmtree(test_dir)  # Deletes everything recursively!
    print(f"Deleted entire tree: {test_dir}")
```

> **Safety Warning** : `shutil.rmtree()` permanently deletes files and directories. There's no "recycle bin" recovery. Always double-check your paths and consider implementing backups or confirmation prompts.

## 5. Error Handling and Safety Patterns

### Comprehensive Error Handling

```python
from pathlib import Path
import shutil
import json

def safe_file_operation(source_path, dest_path, operation="copy"):
    """
    Safely perform file operations with comprehensive error handling
    """
    source = Path(source_path)
    dest = Path(dest_path)
  
    # Pre-flight checks
    if not source.exists():
        raise FileNotFoundError(f"Source path does not exist: {source}")
  
    if not source.is_file():
        raise ValueError(f"Source is not a file: {source}")
  
    # Check destination directory exists
    dest.parent.mkdir(parents=True, exist_ok=True)
  
    # Check for overwrite
    if dest.exists():
        response = input(f"Destination {dest} exists. Overwrite? (y/n): ")
        if response.lower() != 'y':
            print("Operation cancelled")
            return False
  
    try:
        if operation == "copy":
            shutil.copy2(source, dest)
            print(f"Successfully copied {source} to {dest}")
        elif operation == "move":
            shutil.move(source, dest)
            print(f"Successfully moved {source} to {dest}")
        else:
            raise ValueError(f"Unknown operation: {operation}")
      
        return True
      
    except PermissionError:
        print(f"Permission denied. Check file permissions.")
        return False
    except OSError as e:
        print(f"Operating system error: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

# Usage example
try:
    # Create test file
    test_file = Path("test.txt")
    test_file.write_text("Test content")
  
    # Safe copy operation
    success = safe_file_operation("test.txt", "backup/test_backup.txt", "copy")
    if success:
        print("File operation completed successfully")
      
except Exception as e:
    print(f"Error in main: {e}")
```

### Creating a Safe File Manager Class

```python
from pathlib import Path
import shutil
import json
from datetime import datetime

class SafeFileManager:
    """
    A class that provides safe file and directory operations
    with logging and backup capabilities
    """
  
    def __init__(self, base_path=None, create_backups=True):
        self.base_path = Path(base_path) if base_path else Path.cwd()
        self.create_backups = create_backups
        self.log_file = self.base_path / "file_operations.log"
      
    def _log(self, message):
        """Log operations with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
      
        with open(self.log_file, 'a') as f:
            f.write(log_entry)
        print(message)
  
    def _backup_file(self, file_path):
        """Create a backup of a file before modifying it"""
        if not self.create_backups:
            return None
          
        file_path = Path(file_path)
        if not file_path.exists():
            return None
          
        backup_dir = file_path.parent / "backups"
        backup_dir.mkdir(exist_ok=True)
      
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
        backup_path = backup_dir / backup_name
      
        shutil.copy2(file_path, backup_path)
        self._log(f"Backup created: {backup_path}")
        return backup_path
  
    def safe_write(self, file_path, content, mode='w'):
        """Safely write to a file with backup"""
        file_path = Path(file_path)
      
        # Create backup if file exists
        if file_path.exists():
            self._backup_file(file_path)
      
        # Ensure parent directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)
      
        try:
            with open(file_path, mode) as f:
                f.write(content)
            self._log(f"Successfully wrote to: {file_path}")
            return True
        except Exception as e:
            self._log(f"Failed to write to {file_path}: {e}")
            return False
  
    def safe_delete(self, path, confirm=True):
        """Safely delete files or directories with confirmation"""
        path = Path(path)
      
        if not path.exists():
            self._log(f"Path does not exist: {path}")
            return False
      
        if confirm:
            if path.is_file():
                response = input(f"Delete file {path}? (y/n): ")
            else:
                response = input(f"Delete directory {path} and all contents? (y/n): ")
          
            if response.lower() != 'y':
                self._log("Deletion cancelled by user")
                return False
      
        try:
            if path.is_file():
                path.unlink()
            else:
                shutil.rmtree(path)
          
            self._log(f"Successfully deleted: {path}")
            return True
          
        except Exception as e:
            self._log(f"Failed to delete {path}: {e}")
            return False
  
    def create_project_structure(self, project_name, folders=None):
        """Create a standard project directory structure"""
        if folders is None:
            folders = ['src', 'tests', 'docs', 'data', 'output']
      
        project_path = self.base_path / project_name
      
        try:
            for folder in folders:
                folder_path = project_path / folder
                folder_path.mkdir(parents=True, exist_ok=True)
                self._log(f"Created folder: {folder_path}")
          
            # Create basic files
            readme_path = project_path / "README.md"
            readme_content = f"# {project_name}\n\nProject description here.\n"
            self.safe_write(readme_path, readme_content)
          
            gitignore_path = project_path / ".gitignore"
            gitignore_content = "__pycache__/\n*.pyc\n.env\n"
            self.safe_write(gitignore_path, gitignore_content)
          
            self._log(f"Project structure created: {project_path}")
            return project_path
          
        except Exception as e:
            self._log(f"Failed to create project structure: {e}")
            return None

# Usage example
if __name__ == "__main__":
    # Create file manager
    fm = SafeFileManager(create_backups=True)
  
    # Create a project
    project_path = fm.create_project_structure("my_new_project")
  
    if project_path:
        # Add some content
        config_content = json.dumps({
            "version": "1.0",
            "debug": True,
            "database": {
                "host": "localhost",
                "port": 5432
            }
        }, indent=2)
      
        config_path = project_path / "config.json"
        fm.safe_write(config_path, config_content)
      
        print(f"\nProject created at: {project_path}")
        print("Structure:")
        for item in sorted(project_path.rglob("*")):
            if item.is_file():
                print(f"  📄 {item.relative_to(project_path)}")
            else:
                print(f"  📁 {item.relative_to(project_path)}/")
```

## Key Takeaways and Best Practices

> **The Pythonic Way** :
>
> 1. Always use context managers (`with` statements) for file operations
> 2. Prefer `pathlib` over `os.path` for new code
> 3. Handle errors explicitly - file operations can fail in many ways
> 4. Use `exist_ok=True` parameters to avoid race conditions
> 5. Create backups before destructive operations
> 6. Log important file operations for debugging

> **Common Pitfalls** :
>
> * Forgetting to close files (use `with` statements)
> * Not handling permissions errors
> * Using string concatenation for paths (use `pathlib` or `os.path.join`)
> * Not checking if files/directories exist before operations
> * Using `rmtree()` without confirmation prompts

> **Mental Model for File Safety** : Think of file operations like surgery - you need to:
>
> 1. Prepare (check paths, permissions, backups)
> 2. Operate (perform the actual file operation)
> 3. Verify (confirm operation succeeded)
> 4. Document (log what happened)

This comprehensive approach to file operations demonstrates Python's evolution from simple tools to sophisticated, safe, and maintainable code patterns. The progression from basic `open()` calls to object-oriented `pathlib` usage and finally to custom safety classes shows how Python's design philosophy enables you to build increasingly robust solutions.
