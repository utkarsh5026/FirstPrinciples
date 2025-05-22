# Data Compression and Archiving in Python: A Complete Guide from First Principles

## Understanding Compression: The Foundation

Before we dive into Python's tools, let's understand what compression actually means at its core. Imagine you have a library with thousands of books, but your bookshelf can only hold a fraction of them. Compression is like finding clever ways to represent the same information using less space.

> **Core Principle** : Compression works by identifying and eliminating redundancy in data. Just like how we might say "LOL" instead of "Laughing Out Loud," compression finds patterns and represents them more efficiently.

### The Two Fundamental Types of Compression

**Lossless Compression** is like organizing your bookshelf more efficiently - you can get back exactly what you started with. Think of it as folding clothes neatly instead of throwing them in a pile.

**Lossy Compression** is like summarizing a book - you lose some details but keep the essential meaning. This is common in images (JPEG) and audio (MP3), but we'll focus on lossless compression for general data.

### How Compression Algorithms Think

Let's understand this with a simple example. Consider this text:

```
"AAAAAABBBBCCCCCCCC"
```

Instead of storing 18 characters, we could represent this as:

```
"6A4B8C"
```

This is called **Run-Length Encoding** - one of the simplest compression techniques. We've reduced 18 characters to 6!

> **Key Insight** : All compression algorithms look for patterns and redundancy, but they use different strategies to find and represent these patterns.

## Python's Compression Ecosystem: The Big Picture

Python's standard library provides several compression modules, each designed for different purposes:

```
Data Compression & Archiving Landscape
├── Low-level Compression
│   ├── zlib (deflate algorithm)
│   ├── gzip (gzip format)
│   ├── bz2 (bzip2 algorithm)
│   └── lzma (LZMA/XZ algorithm)
└── High-level Archiving
    ├── zipfile (ZIP archives)
    ├── tarfile (TAR archives)
    └── shutil (convenience functions)
```

## Chapter 1: The Foundation - zlib Module

The `zlib` module implements the deflate compression algorithm, which forms the foundation for many other compression formats. Think of it as the engine that powers compression.

### Understanding the Deflate Algorithm

The deflate algorithm combines two techniques:

1. **LZ77** : Finds repeated sequences and replaces them with references
2. **Huffman Coding** : Assigns shorter codes to more frequent characters

Let's see this in action:

```python
import zlib

# Our sample data - notice the repetition
original_data = b"Hello World! Hello Python! Hello Compression! Hello Everyone!"
print(f"Original size: {len(original_data)} bytes")
print(f"Original data: {original_data}")

# Compress the data
compressed_data = zlib.compress(original_data)
print(f"Compressed size: {len(compressed_data)} bytes")
print(f"Compression ratio: {len(original_data)/len(compressed_data):.2f}:1")

# Decompress to verify
decompressed_data = zlib.decompress(compressed_data)
print(f"Data integrity check: {original_data == decompressed_data}")
```

**What's happening here?**

* The algorithm notices "Hello" appears multiple times
* Instead of storing "Hello" four times, it stores it once and uses references
* The more repetition in your data, the better the compression ratio

### Controlling Compression Levels

```python
import zlib

data = b"This is a test string with some repetitive content. " * 100

# Test different compression levels (1-9)
for level in [1, 6, 9]:
    compressed = zlib.compress(data, level)
    print(f"Level {level}: {len(compressed)} bytes")
```

> **Trade-off Principle** : Higher compression levels (like 9) produce smaller files but take more time and CPU power. Level 6 is usually the sweet spot for balanced compression and speed.

### Advanced zlib: Streaming Compression

For large files that don't fit in memory, we use streaming compression:

```python
import zlib

def compress_large_data(input_data, chunk_size=1024):
    """
    Compress data in chunks - useful for large files
    """
    # Create a compression object
    compressor = zlib.compressobj(level=6)
    compressed_chunks = []
  
    # Process data in chunks
    for i in range(0, len(input_data), chunk_size):
        chunk = input_data[i:i + chunk_size]
        # Compress this chunk
        compressed_chunk = compressor.compress(chunk)
        if compressed_chunk:  # Only add if there's output
            compressed_chunks.append(compressed_chunk)
  
    # Flush any remaining data
    final_chunk = compressor.flush()
    if final_chunk:
        compressed_chunks.append(final_chunk)
  
    return b''.join(compressed_chunks)

# Example usage
large_data = b"Sample data chunk. " * 1000
compressed = compress_large_data(large_data)
print(f"Original: {len(large_data)}, Compressed: {len(compressed)}")
```

**Why streaming matters:**

* Memory efficiency: You don't need to load entire files into memory
* Real-time processing: You can compress data as it arrives
* Network applications: Perfect for compressing data streams

## Chapter 2: The Familiar Friend - gzip Module

The `gzip` module wraps the zlib deflate algorithm in the popular gzip format. Think of zlib as the compression engine and gzip as the standardized packaging around it.

### Understanding the gzip Format Structure

```
gzip File Structure:
┌─────────────────┐
│   Header        │ ← Magic numbers, timestamps, etc.
├─────────────────┤
│ Compressed Data │ ← Your actual data (using deflate)
├─────────────────┤
│   Footer        │ ← CRC32 checksum, original size
└─────────────────┘
```

### Basic gzip Operations

```python
import gzip
import os

# Sample data to compress
text_data = """
This is a sample text file with multiple lines.
It contains various words and sentences.
The repetition of common words like 'the', 'and', 'is'
helps demonstrate compression effectiveness.
""" * 50

# Method 1: Simple compression/decompression
def simple_gzip_example():
    # Convert string to bytes
    data_bytes = text_data.encode('utf-8')
  
    # Compress
    compressed = gzip.compress(data_bytes)
    print(f"Original size: {len(data_bytes)} bytes")
    print(f"Compressed size: {len(compressed)} bytes")
    print(f"Space saved: {(1 - len(compressed)/len(data_bytes))*100:.1f}%")
  
    # Decompress
    decompressed = gzip.decompress(compressed)
    original_text = decompressed.decode('utf-8')
    print(f"Integrity check: {text_data == original_text}")

simple_gzip_example()
```

### File-based gzip Operations

```python
import gzip

def demonstrate_file_compression():
    """
    Show how to work with gzip files directly
    """
    filename = "sample.txt"
    compressed_filename = "sample.txt.gz"
  
    # Create a sample file
    with open(filename, 'w') as f:
        f.write("Hello World! " * 1000)
  
    # Compress file to .gz format
    with open(filename, 'rb') as f_in:
        with gzip.open(compressed_filename, 'wb') as f_out:
            # Copy data while compressing
            f_out.writelines(f_in)
  
    # Check file sizes
    original_size = os.path.getsize(filename)
    compressed_size = os.path.getsize(compressed_filename)
  
    print(f"Original file: {original_size} bytes")
    print(f"Compressed file: {compressed_size} bytes")
    print(f"Compression ratio: {original_size/compressed_size:.2f}:1")
  
    # Read from compressed file
    with gzip.open(compressed_filename, 'rt') as f:
        content = f.read()
        print(f"First 50 characters: {content[:50]}...")
  
    # Clean up
    os.remove(filename)
    os.remove(compressed_filename)

demonstrate_file_compression()
```

**Key Points:**

* `gzip.open()` works like regular `open()` but handles compression automatically
* Use `'rb'/'wb'` for binary mode, `'rt'/'wt'` for text mode
* The `.gz` extension is a convention, not a requirement

## Chapter 3: The Powerhouse - bz2 Module

The `bz2` module implements the Burrows-Wheeler block-sorting compression algorithm. It typically achieves better compression ratios than gzip but at the cost of speed.

### Understanding bzip2's Approach

bzip2 uses a sophisticated three-stage process:

1. **Burrows-Wheeler Transform** : Rearranges characters to group similar ones together
2. **Move-to-Front Transform** : Converts the rearranged data to numbers
3. **Huffman Coding** : Compresses the numbers using variable-length codes

> **The Trade-off** : bzip2 typically compresses 10-15% better than gzip but takes 3-4 times longer. Choose based on whether file size or speed is more important.

```python
import bz2
import time

def compare_compression_methods():
    """
    Compare gzip vs bzip2 compression
    """
    # Create test data with lots of repetition
    test_data = ("Python is awesome! " * 100 + 
                "Data compression saves space. " * 100 + 
                "bzip2 vs gzip comparison. " * 100).encode('utf-8')
  
    print(f"Original data size: {len(test_data)} bytes")
  
    # Test gzip compression
    start_time = time.time()
    gzip_compressed = gzip.compress(test_data)
    gzip_time = time.time() - start_time
  
    # Test bzip2 compression
    start_time = time.time()
    bz2_compressed = bz2.compress(test_data)
    bz2_time = time.time() - start_time
  
    print("\nCompression Results:")
    print(f"gzip: {len(gzip_compressed)} bytes ({gzip_time:.4f}s)")
    print(f"bz2:  {len(bz2_compressed)} bytes ({bz2_time:.4f}s)")
  
    print(f"\nSpace savings:")
    print(f"gzip: {(1-len(gzip_compressed)/len(test_data))*100:.1f}%")
    print(f"bz2:  {(1-len(bz2_compressed)/len(test_data))*100:.1f}%")

compare_compression_methods()
```

### Working with bzip2 Files

```python
import bz2

def bzip2_file_operations():
    """
    Demonstrate bzip2 file handling
    """
    # Create sample data
    sample_data = "This is sample data for bzip2 compression.\n" * 500
  
    # Write compressed file
    with bz2.open('sample.txt.bz2', 'wt') as f:
        f.write(sample_data)
  
    # Read compressed file
    with bz2.open('sample.txt.bz2', 'rt') as f:
        read_data = f.read()
  
    print(f"Data integrity: {sample_data == read_data}")
    print(f"File size: {os.path.getsize('sample.txt.bz2')} bytes")
  
    # Clean up
    os.remove('sample.txt.bz2')

bzip2_file_operations()
```

## Chapter 4: The Modern Choice - lzma Module

The `lzma` module provides access to the LZMA (Lempel-Ziv-Markov chain Algorithm) compression, which powers the 7z and XZ formats. It often provides the best compression ratios among the standard library options.

### Understanding LZMA's Strength

LZMA uses a dictionary-based compression with sophisticated probability modeling:

> **LZMA's Advantage** : It can achieve compression ratios 20-30% better than bzip2, making it ideal when minimizing file size is critical (like software distribution).

```python
import lzma
import json

def demonstrate_lzma():
    """
    Show LZMA compression with realistic data
    """
    # Create structured data (like JSON config files)
    config_data = {
        "users": [
            {"name": f"user_{i}", "email": f"user_{i}@example.com", 
             "settings": {"theme": "dark", "notifications": True}}
            for i in range(1000)
        ],
        "system": {
            "version": "1.0.0",
            "features": ["compression", "encryption", "backup"] * 100
        }
    }
  
    # Convert to JSON string then bytes
    json_string = json.dumps(config_data, indent=2)
    original_data = json_string.encode('utf-8')
  
    print(f"Original JSON size: {len(original_data)} bytes")
  
    # Compare compression methods
    methods = {
        'gzip': gzip.compress,
        'bz2': bz2.compress,
        'lzma': lzma.compress
    }
  
    for name, compress_func in methods.items():
        compressed = compress_func(original_data)
        ratio = len(original_data) / len(compressed)
        saving = (1 - len(compressed) / len(original_data)) * 100
        print(f"{name:4}: {len(compressed):5} bytes (ratio: {ratio:.1f}:1, saving: {saving:.1f}%)")

demonstrate_lzma()
```

### LZMA Preset Levels

```python
import lzma

def explore_lzma_presets():
    """
    Demonstrate different LZMA compression presets
    """
    data = b"Sample text for compression testing. " * 1000
  
    print("LZMA Preset Comparison:")
    print("Preset | Size (bytes) | Ratio")
    print("-------|--------------|------")
  
    for preset in [0, 1, 6, 9]:
        compressed = lzma.compress(data, preset=preset)
        ratio = len(data) / len(compressed)
        print(f"   {preset}   |    {len(compressed):6}    | {ratio:.1f}:1")

explore_lzma_presets()
```

> **Preset Guide** :
>
> * 0-2: Fast compression, larger files
> * 3-5: Balanced compression and speed
> * 6-9: Maximum compression, slower speed

## Chapter 5: Archive Management - zipfile Module

The `zipfile` module handles ZIP archives, which can contain multiple files and directories. Unlike the compression modules we've seen, ZIP is primarily an archiving format that can use various compression methods.

### Understanding ZIP Archive Structure

```
ZIP Archive Structure:
├── File 1 (compressed)
├── File 2 (compressed)  
├── Directory/
│   ├── File 3 (compressed)
│   └── File 4 (stored)
└── Central Directory (metadata)
```

### Creating ZIP Archives

```python
import zipfile
import os
import tempfile

def create_sample_files():
    """
    Create sample files for archiving demonstration
    """
    files_data = {
        'readme.txt': 'This is a readme file with installation instructions.',
        'config.json': '{"setting1": "value1", "setting2": "value2"}',
        'data.csv': 'name,age,city\nJohn,25,NYC\nJane,30,LA\nBob,35,Chicago',
        'large_file.txt': 'Large content data. ' * 1000
    }
  
    for filename, content in files_data.items():
        with open(filename, 'w') as f:
            f.write(content)
  
    return list(files_data.keys())

def demonstrate_zip_creation():
    """
    Show how to create and manipulate ZIP archives
    """
    # Create sample files
    filenames = create_sample_files()
  
    # Create ZIP archive with different compression methods
    with zipfile.ZipFile('sample_archive.zip', 'w') as zipf:
        for filename in filenames:
            # Add file with compression
            zipf.write(filename, compress_type=zipfile.ZIP_DEFLATED)
            print(f"Added {filename} to archive")
  
    # Check archive contents
    with zipfile.ZipFile('sample_archive.zip', 'r') as zipf:
        print("\nArchive contents:")
        for info in zipf.infolist():
            original_size = info.file_size
            compressed_size = info.compress_size
            if original_size > 0:
                ratio = compressed_size / original_size * 100
                print(f"{info.filename}: {original_size} → {compressed_size} bytes ({ratio:.1f}%)")
  
    # Extract specific file
    with zipfile.ZipFile('sample_archive.zip', 'r') as zipf:
        with zipf.open('config.json') as f:
            content = f.read().decode('utf-8')
            print(f"\nExtracted config.json content: {content}")
  
    # Clean up
    for filename in filenames:
        os.remove(filename)
    os.remove('sample_archive.zip')

demonstrate_zip_creation()
```

### Advanced ZIP Operations

```python
def advanced_zip_operations():
    """
    Demonstrate advanced ZIP archive features
    """
    # Create a directory structure
    os.makedirs('project/src', exist_ok=True)
    os.makedirs('project/docs', exist_ok=True)
  
    # Create files in different directories
    files = {
        'project/main.py': 'print("Hello, World!")',
        'project/src/utils.py': 'def helper_function(): pass',
        'project/docs/README.md': '# Project Documentation\n\nThis is a sample project.',
        'project/config.ini': '[settings]\ndebug=true\nport=8080'
    }
  
    for filepath, content in files.items():
        with open(filepath, 'w') as f:
            f.write(content)
  
    # Create archive preserving directory structure
    with zipfile.ZipFile('project_backup.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files_list in os.walk('project'):
            for file in files_list:
                file_path = os.path.join(root, file)
                # Add file with its full path
                zipf.write(file_path)
  
    # Extract entire archive
    with zipfile.ZipFile('project_backup.zip', 'r') as zipf:
        zipf.extractall('extracted_project')
  
    print("Archive created and extracted successfully!")
  
    # Clean up
    import shutil
    shutil.rmtree('project')
    shutil.rmtree('extracted_project')
    os.remove('project_backup.zip')

advanced_zip_operations()
```

> **Best Practice** : When creating archives, always use `zipfile.ZIP_DEFLATED` for compression unless you have a specific reason to store files uncompressed.

## Chapter 6: Unix Heritage - tarfile Module

The `tarfile` module handles TAR (Tape Archive) files, which originated in Unix systems. TAR files can be uncompressed or compressed with gzip, bzip2, or xz.

### Understanding TAR vs ZIP

 **TAR Philosophy** : Originally designed for sequential tape storage

* Stores files one after another
* Preserves Unix file permissions and ownership
* Can be compressed as a whole unit

 **ZIP Philosophy** : Designed for random access

* Each file compressed individually
* Better for extracting single files
* More common on Windows systems

### Working with TAR Archives

```python
import tarfile
import os

def demonstrate_tar_operations():
    """
    Show comprehensive TAR archive operations
    """
    # Create sample directory structure
    os.makedirs('sample_project/src', exist_ok=True)
    os.makedirs('sample_project/tests', exist_ok=True)
  
    files_content = {
        'sample_project/main.py': 'if __name__ == "__main__":\n    print("Hello TAR!")',
        'sample_project/src/module.py': 'class SampleClass:\n    pass',
        'sample_project/tests/test_main.py': 'def test_sample():\n    assert True',
        'sample_project/README.md': '# Sample Project\n\nThis is for TAR demonstration.'
    }
  
    # Create the files
    for filepath, content in files_content.items():
        with open(filepath, 'w') as f:
            f.write(content)
  
    # Create different types of TAR archives
    archive_types = {
        'uncompressed.tar': 'w',
        'gzip_compressed.tar.gz': 'w:gz',
        'bzip2_compressed.tar.bz2': 'w:bz2',
        'xz_compressed.tar.xz': 'w:xz'
    }
  
    print("Creating TAR archives with different compression:")
  
    for archive_name, mode in archive_types.items():
        with tarfile.open(archive_name, mode) as tar:
            tar.add('sample_project', recursive=True)
      
        size = os.path.getsize(archive_name)
        print(f"{archive_name}: {size} bytes")
  
    # Demonstrate reading TAR archive
    print("\nContents of gzip compressed archive:")
    with tarfile.open('gzip_compressed.tar.gz', 'r:gz') as tar:
        for member in tar.getmembers():
            if member.isfile():
                print(f"File: {member.name} ({member.size} bytes)")
            elif member.isdir():
                print(f"Directory: {member.name}")
  
    # Extract specific file
    with tarfile.open('gzip_compressed.tar.gz', 'r:gz') as tar:
        # Extract just the main.py file
        main_py = tar.extractfile('sample_project/main.py')
        if main_py:
            content = main_py.read().decode('utf-8')
            print(f"\nExtracted main.py content:\n{content}")
  
    # Clean up
    import shutil
    shutil.rmtree('sample_project')
    for archive_name in archive_types.keys():
        os.remove(archive_name)

demonstrate_tar_operations()
```

### TAR Archive Filtering and Security

```python
def secure_tar_extraction():
    """
    Demonstrate safe TAR extraction practices
    """
    def safe_extract(tar, path=".", members=None):
        """
        Safely extract TAR archive, preventing directory traversal attacks
        """
        for member in tar.getmembers():
            # Check for directory traversal attempts
            if os.path.isabs(member.name) or ".." in member.name:
                print(f"Skipping potentially dangerous path: {member.name}")
                continue
          
            # Check file size to prevent zip bombs
            if member.size > 100 * 1024 * 1024:  # 100MB limit
                print(f"Skipping large file: {member.name} ({member.size} bytes)")
                continue
          
            print(f"Extracting safe file: {member.name}")
      
        return tar.extractall(path, members)
  
    # This function shows the concept - use tar.extractall() carefully in production
    print("Always validate TAR contents before extraction in production!")

secure_tar_extraction()
```

> **Security Warning** : Always validate TAR archive contents before extraction. Malicious archives can contain files with dangerous paths like `../../../etc/passwd`.

## Chapter 7: High-Level Convenience - shutil Module

The `shutil` module provides high-level file operations, including convenient functions for creating archives without dealing with low-level details.

### Simple Archive Creation

```python
import shutil
import os

def demonstrate_shutil_archiving():
    """
    Show shutil's convenient archiving functions
    """
    # Create a sample directory structure
    os.makedirs('sample_data/documents', exist_ok=True)
    os.makedirs('sample_data/images', exist_ok=True)
  
    files = {
        'sample_data/README.txt': 'This is a sample project',
        'sample_data/documents/report.txt': 'Annual report content',
        'sample_data/images/photo.txt': 'Image placeholder'
    }
  
    for filepath, content in files.items():
        with open(filepath, 'w') as f:
            f.write(content)
  
    # Create archives using shutil
    formats = ['zip', 'tar', 'gztar', 'bztar', 'xztar']
  
    print("Creating archives with shutil:")
    for fmt in formats:
        try:
            archive_name = shutil.make_archive(
                base_name=f'backup_{fmt}',
                format=fmt,
                root_dir='sample_data'
            )
            size = os.path.getsize(archive_name)
            print(f"{fmt:6}: {archive_name} ({size} bytes)")
        except Exception as e:
            print(f"{fmt:6}: Error - {e}")
  
    # Extract archive
    shutil.unpack_archive('backup_zip.zip', 'extracted_zip')
    print("\nExtracted zip archive to 'extracted_zip' directory")
  
    # List supported formats
    print("\nSupported archive formats:")
    for fmt, description in shutil.get_archive_formats():
        print(f"  {fmt}: {description}")
  
    # Clean up
    import glob
    shutil.rmtree('sample_data')
    shutil.rmtree('extracted_zip')
    for archive_file in glob.glob('backup_*'):
        os.remove(archive_file)

demonstrate_shutil_archiving()
```

## Chapter 8: Practical Applications and Best Practices

### Choosing the Right Compression Method

```python
def compression_decision_helper():
    """
    Help decide which compression method to use
    """
    scenarios = {
        "Web assets (CSS, JS)": "gzip - Fast decompression for real-time serving",
        "Software distribution": "lzma/xz - Best compression ratio",
        "Log files": "gzip - Good balance of speed and compression",
        "Database backups": "bzip2 or lzma - Prioritize compression ratio",
        "Streaming data": "zlib - Low latency, controllable memory usage",
        "Multiple files": "ZIP or TAR.gz - Archive multiple files together"
    }
  
    print("Compression Method Selection Guide:")
    print("=" * 50)
    for scenario, recommendation in scenarios.items():
        print(f"\n{scenario}:")
        print(f"  → {recommendation}")

compression_decision_helper()
```

### Building a Universal Compression Utility

```python
import os
import time
from pathlib import Path

class CompressionUtil:
    """
    A utility class that demonstrates best practices for compression
    """
  
    def __init__(self):
        self.supported_formats = {
            'gz': (gzip.compress, gzip.decompress),
            'bz2': (bz2.compress, bz2.decompress),
            'xz': (lzma.compress, lzma.decompress)
        }
  
    def compress_file(self, input_path, output_path=None, method='gz'):
        """
        Compress a file using specified method
        """
        input_path = Path(input_path)
      
        if output_path is None:
            output_path = input_path.with_suffix(input_path.suffix + f'.{method}')
      
        if method not in self.supported_formats:
            raise ValueError(f"Unsupported method: {method}")
      
        compress_func, _ = self.supported_formats[method]
      
        # Read input file
        with open(input_path, 'rb') as f_in:
            original_data = f_in.read()
      
        # Compress data
        start_time = time.time()
        compressed_data = compress_func(original_data)
        compression_time = time.time() - start_time
      
        # Write compressed file
        with open(output_path, 'wb') as f_out:
            f_out.write(compressed_data)
      
        # Calculate statistics
        original_size = len(original_data)
        compressed_size = len(compressed_data)
        ratio = original_size / compressed_size if compressed_size > 0 else 0
        space_saved = (1 - compressed_size / original_size) * 100
      
        return {
            'input_file': str(input_path),
            'output_file': str(output_path),
            'method': method,
            'original_size': original_size,
            'compressed_size': compressed_size,
            'compression_ratio': ratio,
            'space_saved_percent': space_saved,
            'compression_time': compression_time
        }
  
    def decompress_file(self, input_path, output_path=None):
        """
        Decompress a file by detecting the compression method
        """
        input_path = Path(input_path)
      
        # Detect compression method from extension
        method = input_path.suffix[1:]  # Remove the dot
      
        if method not in self.supported_formats:
            raise ValueError(f"Cannot detect compression method from {input_path}")
      
        if output_path is None:
            output_path = input_path.with_suffix('')  # Remove compression extension
      
        _, decompress_func = self.supported_formats[method]
      
        # Read compressed file
        with open(input_path, 'rb') as f_in:
            compressed_data = f_in.read()
      
        # Decompress data
        original_data = decompress_func(compressed_data)
      
        # Write decompressed file
        with open(output_path, 'wb') as f_out:
            f_out.write(original_data)
      
        return str(output_path)

# Example usage
def demonstrate_compression_utility():
    """
    Show the compression utility in action
    """
    # Create sample file
    sample_content = "This is sample content for compression testing.\n" * 1000
    with open('sample.txt', 'w') as f:
        f.write(sample_content)
  
    # Test compression utility
    util = CompressionUtil()
  
    print("Compression Utility Demo:")
    print("=" * 40)
  
    for method in ['gz', 'bz2', 'xz']:
        result = util.compress_file('sample.txt', method=method)
        print(f"\n{method.upper()} Compression:")
        print(f"  Original: {result['original_size']:,} bytes")
        print(f"  Compressed: {result['compressed_size']:,} bytes")
        print(f"  Ratio: {result['compression_ratio']:.1f}:1")
        print(f"  Space saved: {result['space_saved_percent']:.1f}%")
        print(f"  Time: {result['compression_time']:.4f} seconds")
      
        # Test decompression
        decompressed_file = util.decompress_file(result['output_file'])
        print(f"  Decompressed to: {decompressed_file}")
      
        # Cleanup compressed file
        os.remove(result['output_file'])
        os.remove(decompressed_file)
  
    # Cleanup
    os.remove('sample.txt')

demonstrate_compression_utility()
```

## Final Principles and Recommendations

> **The Golden Rules of Compression:**
>
> 1. **Know Your Data** : Text compresses better than random data. Structured data (JSON, XML) compresses very well.
> 2. **Choose Based on Use Case** :
>
> * Speed matters? Use gzip
> * Size matters most? Use lzma
> * Need multiple files? Use ZIP or TAR
>
> 1. **Consider the Pipeline** : Compression time vs. decompression time vs. file size vs. memory usage
> 2. **Test with Real Data** : Compression ratios vary dramatically based on your actual data patterns

### Memory-Efficient Processing for Large Files

```python
def process_large_file_efficiently(input_file, output_file, chunk_size=8192):
    """
    Process large files without loading everything into memory
    """
    with open(input_file, 'rb') as f_in:
        with gzip.open(output_file, 'wb') as f_out:
            while True:
                chunk = f_in.read(chunk_size)
                if not chunk:
                    break
                f_out.write(chunk)
  
    print(f"Efficiently compressed {input_file} to {output_file}")

# This approach works for files larger than available RAM
```

> **Memory Management** : When dealing with large files, always use streaming/chunked processing rather than loading entire files into memory. Python's compression modules are designed to handle this efficiently.

Understanding data compression and archiving from these first principles gives you the foundation to make informed decisions about which tools to use in different scenarios. Each compression algorithm represents different trade-offs between speed, compression ratio, and memory usage. The Python standard library provides excellent tools for all common compression needs, from simple data compression with zlib to full-featured archive management with zipfile and tarfile.

Remember that compression effectiveness depends heavily on your data characteristics. Text files, logs, and structured data compress very well, while already-compressed data (like JPEG images or MP3 audio) won't benefit much from additional compression. Always test with your actual data to make the best choices for your specific use case.
