# Python Hashlib Module: Cryptographic Hashing and Data Integrity

## Part 1: Understanding Hashing from First Principles

### What is Hashing?

Before diving into Python's `hashlib`, let's understand what hashing fundamentally means in computer science.

Imagine you have a massive library with millions of books. Instead of searching through every book to find one specific title, you create a card catalog system. Each book gets a unique catalog number that tells you exactly where to find it. **Hashing** is like creating these catalog numbers, but for digital data.

```
Original Data → Hash Function → Fixed-Size Output (Hash)
"Hello World" → SHA-256 → "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
```

> **Key Mental Model** : A hash function is like a digital fingerprint generator. Just as every person has unique fingerprints, every piece of data can have a unique hash. The hash is always the same length regardless of input size, and tiny changes in input create completely different hashes.

### Why Do We Need Cryptographic Hashing?

Let's explore the fundamental problems that cryptographic hashing solves:

#### 1. Data Integrity Verification

```python
# Imagine downloading a large file from the internet
# How do you know it wasn't corrupted during transfer?

original_file_hash = "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
downloaded_file_hash = calculate_hash(downloaded_file)

if original_file_hash == downloaded_file_hash:
    print("File is intact and uncorrupted")
else:
    print("File was corrupted during download!")
```

#### 2. Password Security

```python
# Instead of storing actual passwords (dangerous!):
stored_password = "secret123"  # ❌ Terrible idea!

# We store password hashes:
stored_hash = hash_function("secret123")  # ✅ Much safer
```

#### 3. Digital Signatures and Authentication

```python
# Proving data came from a specific source without revealing the source
message = "Transfer $100 to Alice"
sender_signature = hash_with_private_key(message)
# Receiver can verify authenticity without seeing private key
```

## Part 2: Python's Hashlib Module Architecture

### The Python Philosophy Behind Hashlib

> **Python's Design Principle** : "Batteries included" - Python provides a comprehensive, easy-to-use interface for cryptographic operations while maintaining security best practices.

Python's `hashlib` module follows these design principles:

1. **Uniform Interface** : All hash algorithms work the same way
2. **Security by Default** : Includes strong, modern algorithms
3. **Flexibility** : Supports both streaming and one-shot hashing
4. **Extensibility** : Can use system-provided implementations when available

### Basic Hashlib Usage Pattern

```python
import hashlib

# The fundamental pattern for ALL hashlib operations:
# 1. Create a hash object
# 2. Feed it data (can be done incrementally)
# 3. Get the final hash

# Method 1: One-shot hashing
data = b"Hello, World!"
hash_value = hashlib.sha256(data).hexdigest()
print(f"SHA-256: {hash_value}")

# Method 2: Incremental hashing (for large data)
hash_obj = hashlib.sha256()    # 1. Create hash object
hash_obj.update(b"Hello, ")    # 2. Feed data piece by piece
hash_obj.update(b"World!")     # 2. Continue feeding data
final_hash = hash_obj.hexdigest()  # 3. Get final result
print(f"Same result: {final_hash}")
```

## Part 3: Understanding Hash Algorithms

### Common Hash Algorithms in Hashlib

```python
import hashlib

# Let's explore different algorithms with the same input
test_data = b"Python is awesome!"

print("Available algorithms:", hashlib.algorithms_available)
print("\nGuaranteed algorithms:", hashlib.algorithms_guaranteed)
```

#### Algorithm Comparison

```python
def compare_hash_algorithms(data):
    """Compare different hash algorithms on the same data"""
    algorithms = ['md5', 'sha1', 'sha256', 'sha512', 'blake2b']
  
    print(f"Input: {data.decode()}")
    print("-" * 80)
  
    for algo in algorithms:
        try:
            hasher = hashlib.new(algo)
            hasher.update(data)
            hash_result = hasher.hexdigest()
            hash_length = len(hash_result)
          
            print(f"{algo.upper():>8}: {hash_result} (length: {hash_length})")
        except ValueError:
            print(f"{algo.upper():>8}: Not available")

# Compare algorithms
compare_hash_algorithms(b"Hello, Cryptography!")
```

> **Security Note** : MD5 and SHA-1 are cryptographically broken and should only be used for non-security purposes like checksums. Use SHA-256 or newer for security-critical applications.

### Mobile-Optimized Algorithm Comparison

```
Hash Strength & Speed Comparison:
┌─────────────────────────────────┐
│ MD5 (128-bit)                   │
│ ├─ Fastest                      │
│ ├─ Cryptographically broken     │
│ └─ Use only for checksums       │
├─────────────────────────────────┤
│ SHA-1 (160-bit)                 │
│ ├─ Fast                         │
│ ├─ Cryptographically broken     │
│ └─ Legacy systems only          │
├─────────────────────────────────┤
│ SHA-256 (256-bit)               │
│ ├─ Good speed                   │
│ ├─ Cryptographically secure     │
│ └─ Current standard ⭐          │
├─────────────────────────────────┤
│ SHA-512 (512-bit)               │
│ ├─ Slower but more secure       │
│ ├─ Better for large data        │
│ └─ Future-proof                 │
├─────────────────────────────────┤
│ BLAKE2b (variable)              │
│ ├─ Fastest secure algorithm     │
│ ├─ Modern design               │
│ └─ Best choice for new projects │
└─────────────────────────────────┘
```

## Part 4: Practical Applications and Patterns

### File Integrity Checking

```python
import hashlib
import os

def calculate_file_hash(filepath, algorithm='sha256', chunk_size=8192):
    """
    Calculate hash of a file using streaming approach.
    Perfect for large files that don't fit in memory.
    """
    hash_obj = hashlib.new(algorithm)
  
    try:
        with open(filepath, 'rb') as file:
            # Read file in chunks to handle large files efficiently
            while chunk := file.read(chunk_size):
                hash_obj.update(chunk)
        return hash_obj.hexdigest()
    except FileNotFoundError:
        return None

def verify_file_integrity(filepath, expected_hash, algorithm='sha256'):
    """Verify if a file matches expected hash"""
    actual_hash = calculate_file_hash(filepath, algorithm)
  
    if actual_hash is None:
        return False, "File not found"
  
    if actual_hash == expected_hash.lower():
        return True, "File integrity verified"
    else:
        return False, f"Hash mismatch: {actual_hash} != {expected_hash}"

# Example usage
# file_hash = calculate_file_hash("important_document.pdf")
# is_valid, message = verify_file_integrity("downloaded_file.pdf", file_hash)
# print(f"Verification: {message}")
```

### Password Hashing (Basic Concept)

```python
import hashlib
import secrets

def simple_password_hash(password):
    """
    ⚠️  WARNING: This is for educational purposes only!
    Real password hashing should use bcrypt, scrypt, or Argon2
    """
    # Convert string to bytes
    password_bytes = password.encode('utf-8')
  
    # Add salt to prevent rainbow table attacks
    salt = secrets.token_bytes(32)  # 32 random bytes
  
    # Combine password and salt
    salted_password = salt + password_bytes
  
    # Hash the salted password
    hash_obj = hashlib.sha256(salted_password)
    password_hash = hash_obj.digest()
  
    # Return salt + hash (both needed for verification)
    return salt + password_hash

def verify_password(password, stored_hash):
    """Verify password against stored hash"""
    # Extract salt (first 32 bytes) and hash (remaining bytes)
    salt = stored_hash[:32]
    original_hash = stored_hash[32:]
  
    # Hash the provided password with the same salt
    password_bytes = password.encode('utf-8')
    salted_password = salt + password_bytes
    new_hash = hashlib.sha256(salted_password).digest()
  
    # Compare hashes
    return new_hash == original_hash

# Example (don't use for real passwords!)
# stored = simple_password_hash("my_secret_password")
# is_valid = verify_password("my_secret_password", stored)
```

> **Security Warning** : The above example is for educational purposes only. Real applications should use specialized password hashing libraries like `bcrypt`, `scrypt`, or `Argon2` that include built-in protection against timing attacks and are designed to be computationally expensive.

### Data Fingerprinting

```python
import hashlib
import json

class DataFingerprint:
    """Create consistent fingerprints for Python data structures"""
  
    @staticmethod
    def normalize_data(data):
        """Convert data to a consistent, hashable format"""
        if isinstance(data, dict):
            # Sort dictionary keys for consistent ordering
            return json.dumps(data, sort_keys=True, separators=(',', ':'))
        elif isinstance(data, (list, tuple)):
            # Convert to JSON array
            return json.dumps(data, separators=(',', ':'))
        elif isinstance(data, str):
            return data
        else:
            return str(data)
  
    @staticmethod
    def fingerprint(data, algorithm='sha256'):
        """Generate fingerprint for any Python data structure"""
        normalized = DataFingerprint.normalize_data(data)
        hash_obj = hashlib.new(algorithm)
        hash_obj.update(normalized.encode('utf-8'))
        return hash_obj.hexdigest()

# Example usage
data1 = {"name": "Alice", "age": 30, "city": "New York"}
data2 = {"age": 30, "city": "New York", "name": "Alice"}  # Different order
data3 = {"name": "Alice", "age": 31, "city": "New York"}  # Different value

print(f"Data1 fingerprint: {DataFingerprint.fingerprint(data1)}")
print(f"Data2 fingerprint: {DataFingerprint.fingerprint(data2)}")
print(f"Data3 fingerprint: {DataFingerprint.fingerprint(data3)}")

print(f"Data1 == Data2: {DataFingerprint.fingerprint(data1) == DataFingerprint.fingerprint(data2)}")
print(f"Data1 == Data3: {DataFingerprint.fingerprint(data1) == DataFingerprint.fingerprint(data3)}")
```

## Part 5: Advanced Hashlib Features

### BLAKE2 - Modern High-Performance Hashing

```python
import hashlib

# BLAKE2b - faster than SHA-256, more secure than MD5
def demonstrate_blake2_features():
    """BLAKE2 offers unique features not available in SHA algorithms"""
  
    data = b"Python hashlib demonstration"
  
    # 1. Variable output length
    short_hash = hashlib.blake2b(data, digest_size=16).hexdigest()
    long_hash = hashlib.blake2b(data, digest_size=64).hexdigest()
  
    print(f"BLAKE2b-128: {short_hash} (length: {len(short_hash)})")
    print(f"BLAKE2b-512: {long_hash} (length: {len(long_hash)})")
  
    # 2. Keyed hashing (like HMAC)
    key = b"my_secret_key"
    keyed_hash = hashlib.blake2b(data, key=key).hexdigest()
    print(f"Keyed BLAKE2b: {keyed_hash}")
  
    # 3. Personalization parameter
    personal = b"MyApp2024"
    personalized_hash = hashlib.blake2b(data, person=personal).hexdigest()
    print(f"Personalized: {personalized_hash}")
  
    # 4. Salt parameter
    salt = b"random_salt_value123"
    salted_hash = hashlib.blake2b(data, salt=salt).hexdigest()
    print(f"Salted: {salted_hash}")

demonstrate_blake2_features()
```

### Hash-Based Message Authentication Code (HMAC)

```python
import hashlib
import hmac

def secure_message_authentication():
    """Demonstrate HMAC for message authentication"""
  
    # Shared secret key between sender and receiver
    secret_key = b"shared_secret_key_2024"
    message = b"Transfer $500 to account 12345"
  
    # Sender creates HMAC
    mac = hmac.new(secret_key, message, hashlib.sha256)
    message_mac = mac.hexdigest()
  
    print(f"Message: {message.decode()}")
    print(f"HMAC: {message_mac}")
  
    # Receiver verifies HMAC
    def verify_message(msg, received_mac, key):
        expected_mac = hmac.new(key, msg, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected_mac, received_mac)
  
    # Test verification
    is_authentic = verify_message(message, message_mac, secret_key)
    print(f"Message authentic: {is_authentic}")
  
    # Test with tampered message
    tampered_message = b"Transfer $5000 to account 12345"  # Amount changed!
    is_authentic_tampered = verify_message(tampered_message, message_mac, secret_key)
    print(f"Tampered message authentic: {is_authentic_tampered}")

secure_message_authentication()
```

> **Security Best Practice** : Always use `hmac.compare_digest()` for comparing hashes/MACs to prevent timing attacks. Never use `==` for security-critical comparisons.

### Memory-Efficient Large File Processing

```python
import hashlib
import time
from contextlib import contextmanager

@contextmanager
def hash_timer(algorithm_name):
    """Context manager to time hash operations"""
    start = time.time()
    yield
    end = time.time()
    print(f"{algorithm_name} took {end - start:.4f} seconds")

def hash_large_file_efficiently(filepath, algorithms=None):
    """
    Hash a large file with multiple algorithms simultaneously.
    Memory-efficient approach that reads the file only once.
    """
    if algorithms is None:
        algorithms = ['md5', 'sha256', 'blake2b']
  
    # Create hash objects for all algorithms
    hashers = {algo: hashlib.new(algo) for algo in algorithms}
  
    chunk_size = 64 * 1024  # 64KB chunks - good balance of memory/speed
    total_bytes = 0
  
    try:
        with open(filepath, 'rb') as file:
            with hash_timer("Multi-algorithm hashing"):
                while chunk := file.read(chunk_size):
                    total_bytes += len(chunk)
                    # Update all hash objects with the same chunk
                    for hasher in hashers.values():
                        hasher.update(chunk)
      
        # Return results
        results = {
            'file_size': total_bytes,
            'hashes': {algo: hasher.hexdigest() for algo, hasher in hashers.items()}
        }
      
        return results
      
    except FileNotFoundError:
        return None

def create_test_file(filename, size_mb=10):
    """Create a test file of specified size"""
    with open(filename, 'wb') as f:
        # Write random data
        import os
        for _ in range(size_mb):
            f.write(os.urandom(1024 * 1024))  # 1MB of random data

# Example usage (uncomment to test with actual files)
# create_test_file("test_large_file.bin", 50)  # 50MB test file
# results = hash_large_file_efficiently("test_large_file.bin")
# if results:
#     print(f"File size: {results['file_size']:,} bytes")
#     for algo, hash_value in results['hashes'].items():
#         print(f"{algo.upper()}: {hash_value}")
```

## Part 6: Common Pitfalls and Best Practices

### Understanding Bytes vs Strings

```python
import hashlib

def demonstrate_common_mistakes():
    """Show common mistakes and their solutions"""
  
    # ❌ MISTAKE 1: Using strings instead of bytes
    try:
        hasher = hashlib.sha256()
        hasher.update("Hello World")  # This will fail!
    except TypeError as e:
        print(f"Error: {e}")
        print("Solution: Always use bytes with hashlib")
      
        # ✅ CORRECT: Convert string to bytes
        hasher = hashlib.sha256()
        hasher.update("Hello World".encode('utf-8'))
        print(f"Correct hash: {hasher.hexdigest()}")
  
    # ❌ MISTAKE 2: Inconsistent encoding
    text = "Héllo Wörld"  # Text with unicode characters
  
    hash1 = hashlib.sha256(text.encode('utf-8')).hexdigest()
    hash2 = hashlib.sha256(text.encode('latin1')).hexdigest()
  
    print(f"\nSame text, different encodings:")
    print(f"UTF-8:   {hash1}")
    print(f"Latin-1: {hash2}")
    print(f"Same hash? {hash1 == hash2}")
  
    # ✅ SOLUTION: Always use UTF-8 encoding consistently
    print("\n✅ Always use UTF-8 encoding for text")

demonstrate_common_mistakes()
```

### Security Considerations

```python
import hashlib
import secrets
import time

def timing_attack_demonstration():
    """
    Demonstrate why you should use secure comparison functions
    """
    correct_hash = "a" * 64  # Simulated correct hash
  
    def insecure_compare(hash1, hash2):
        """❌ Vulnerable to timing attacks"""
        return hash1 == hash2
  
    def secure_compare(hash1, hash2):
        """✅ Constant-time comparison"""
        return secrets.compare_digest(hash1, hash2)
  
    # Test with different wrong hashes
    wrong_hash_early = "b" + "a" * 63   # Wrong at position 0
    wrong_hash_late = "a" * 63 + "b"    # Wrong at position 63
  
    print("Timing Attack Demonstration:")
    print("(In real scenarios, timing differences are measurable)")
  
    # The insecure comparison might return faster for early mismatches
    print(f"Early mismatch:  {insecure_compare(correct_hash, wrong_hash_early)}")
    print(f"Late mismatch:   {insecure_compare(correct_hash, wrong_hash_late)}")
  
    # Secure comparison takes same time regardless
    print(f"Secure early:    {secure_compare(correct_hash, wrong_hash_early)}")
    print(f"Secure late:     {secure_compare(correct_hash, wrong_hash_late)}")

timing_attack_demonstration()
```

> **Critical Security Rule** : Never use `==` to compare hashes in security-critical code. Always use `secrets.compare_digest()` or `hmac.compare_digest()` to prevent timing attacks.

### Memory Management with Large Data

```python
import hashlib
import sys

def demonstrate_memory_efficient_hashing():
    """Show memory-efficient vs memory-intensive approaches"""
  
    # ❌ MEMORY-INTENSIVE: Loading entire file into memory
    def hash_file_bad(filepath):
        """Don't do this with large files!"""
        try:
            with open(filepath, 'rb') as f:
                entire_file = f.read()  # Loads entire file into RAM!
                return hashlib.sha256(entire_file).hexdigest()
        except MemoryError:
            return "File too large for available memory!"
  
    # ✅ MEMORY-EFFICIENT: Streaming approach
    def hash_file_good(filepath, chunk_size=8192):
        """Memory-efficient streaming hash"""
        hasher = hashlib.sha256()
        try:
            with open(filepath, 'rb') as f:
                while chunk := f.read(chunk_size):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except FileNotFoundError:
            return None
  
    print("Memory-Efficient Hashing Guidelines:")
    print("✅ Use streaming with update() for large files")
    print("✅ Choose appropriate chunk sizes (4KB-64KB typically)")
    print("✅ Process data incrementally when possible")
    print("❌ Never load entire large files into memory")

demonstrate_memory_efficient_hashing()
```

## Part 7: Real-World Integration Patterns

### Building a File Integrity Manager

```python
#!/usr/bin/env python3
"""
File Integrity Manager - A practical application of hashlib
Demonstrates real-world usage patterns for file verification and monitoring.
"""

import hashlib
import json
import os
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple

class FileIntegrityManager:
    """
    A comprehensive file integrity management system using hashlib.
    Tracks file changes, verifies integrity, and maintains hash databases.
    """
    
    def __init__(self, database_path: str = "integrity_database.json", 
                 default_algorithm: str = "sha256"):
        """
        Initialize the File Integrity Manager.
        
        Args:
            database_path: Path to store the integrity database
            default_algorithm: Default hash algorithm to use
        """
        self.database_path = Path(database_path)
        self.default_algorithm = default_algorithm
        self.database = self._load_database()
        
    def _load_database(self) -> Dict:
        """Load existing integrity database or create new one."""
        try:
            with open(self.database_path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {
                "created": datetime.now().isoformat(),
                "algorithm": self.default_algorithm,
                "files": {}
            }
    
    def _save_database(self) -> None:
        """Save the integrity database to disk."""
        self.database["last_updated"] = datetime.now().isoformat()
        with open(self.database_path, 'w') as f:
            json.dump(self.database, f, indent=2)
    
    def calculate_file_hash(self, filepath: Path, 
                          algorithm: Optional[str] = None,
                          chunk_size: int = 8192) -> Optional[str]:
        """
        Calculate hash of a file using streaming approach.
        
        Args:
            filepath: Path to the file
            algorithm: Hash algorithm to use (defaults to instance default)
            chunk_size: Size of chunks to read (for memory efficiency)
            
        Returns:
            Hex digest of the file hash, or None if file not found
        """
        if algorithm is None:
            algorithm = self.default_algorithm
            
        try:
            hasher = hashlib.new(algorithm)
            with open(filepath, 'rb') as f:
                while chunk := f.read(chunk_size):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except (FileNotFoundError, PermissionError, OSError):
            return None
    
    def add_file(self, filepath: str) -> bool:
        """
        Add a file to the integrity database.
        
        Args:
            filepath: Path to the file to add
            
        Returns:
            True if file was successfully added, False otherwise
        """
        path = Path(filepath).resolve()
        
        if not path.exists():
            print(f"Error: File {path} does not exist")
            return False
        
        if not path.is_file():
            print(f"Error: {path} is not a file")
            return False
        
        file_hash = self.calculate_file_hash(path)
        if file_hash is None:
            print(f"Error: Could not calculate hash for {path}")
            return False
        
        # Store file information
        file_key = str(path)
        self.database["files"][file_key] = {
            "hash": file_hash,
            "size": path.stat().st_size,
            "added": datetime.now().isoformat(),
            "last_verified": datetime.now().isoformat(),
            "algorithm": self.default_algorithm
        }
        
        self._save_database()
        print(f"✅ Added {path} to integrity database")
        print(f"   Hash: {file_hash}")
        return True
    
    def verify_file(self, filepath: str) -> Tuple[bool, str]:
        """
        Verify the integrity of a file against stored hash.
        
        Args:
            filepath: Path to the file to verify
            
        Returns:
            Tuple of (is_valid, message)
        """
        path = Path(filepath).resolve()
        file_key = str(path)
        
        if file_key not in self.database["files"]:
            return False, f"File {path} not found in integrity database"
        
        stored_info = self.database["files"][file_key]
        stored_hash = stored_info["hash"]
        algorithm = stored_info.get("algorithm", self.default_algorithm)
        
        if not path.exists():
            return False, f"File {path} no longer exists"
        
        current_hash = self.calculate_file_hash(path, algorithm)
        if current_hash is None:
            return False, f"Could not calculate current hash for {path}"
        
        # Update last verified time
        self.database["files"][file_key]["last_verified"] = datetime.now().isoformat()
        self._save_database()
        
        if current_hash == stored_hash:
            return True, f"✅ File integrity verified: {path}"
        else:
            return False, f"❌ File integrity FAILED: {path}\n" \
                         f"   Expected: {stored_hash}\n" \
                         f"   Current:  {current_hash}"
    
    def verify_all_files(self) -> Dict[str, bool]:
        """
        Verify integrity of all files in the database.
        
        Returns:
            Dictionary mapping file paths to verification results
        """
        results = {}
        print(f"Verifying {len(self.database['files'])} files...")
        print("-" * 60)
        
        for file_path in self.database["files"]:
            is_valid, message = self.verify_file(file_path)
            results[file_path] = is_valid
            print(message)
        
        # Summary
        valid_count = sum(results.values())
        total_count = len(results)
        print("-" * 60)
        print(f"Summary: {valid_count}/{total_count} files passed verification")
        
        return results
    
    def remove_file(self, filepath: str) -> bool:
        """
        Remove a file from the integrity database.
        
        Args:
            filepath: Path to the file to remove
            
        Returns:
            True if file was removed, False if not found
        """
        path = Path(filepath).resolve()
        file_key = str(path)
        
        if file_key in self.database["files"]:
            del self.database["files"][file_key]
            self._save_database()
            print(f"✅ Removed {path} from integrity database")
            return True
        else:
            print(f"❌ File {path} not found in integrity database")
            return False
    
    def list_files(self) -> None:
        """Display all files in the integrity database."""
        files = self.database["files"]
        
        if not files:
            print("No files in integrity database")
            return
        
        print(f"Integrity Database ({len(files)} files):")
        print("=" * 80)
        
        for file_path, info in files.items():
            print(f"📁 {file_path}")
            print(f"   Hash: {info['hash']}")
            print(f"   Size: {info['size']:,} bytes")
            print(f"   Added: {info['added']}")
            print(f"   Last Verified: {info.get('last_verified', 'Never')}")
            print(f"   Algorithm: {info.get('algorithm', 'Unknown')}")
            print()
    
    def get_statistics(self) -> Dict:
        """Get statistics about the integrity database."""
        files = self.database["files"]
        
        if not files:
            return {"total_files": 0}
        
        total_size = sum(info["size"] for info in files.values())
        algorithms_used = set(info.get("algorithm", "Unknown") for info in files.values())
        
        return {
            "total_files": len(files),
            "total_size": total_size,
            "algorithms_used": list(algorithms_used),
            "database_created": self.database.get("created"),
            "last_updated": self.database.get("last_updated")
        }


def demonstrate_file_integrity_manager():
    """Demonstrate the File Integrity Manager with example usage."""
    
    print("File Integrity Manager Demonstration")
    print("=" * 50)
    
    # Create manager instance
    fim = FileIntegrityManager("demo_integrity.json")
    
    # Create some test files
    test_files = ["test_file1.txt", "test_file2.txt"]
    
    print("\n1. Creating test files...")
    for filename in test_files:
        with open(filename, 'w') as f:
            f.write(f"This is test content for {filename}\n")
            f.write(f"Created at {datetime.now()}\n")
        print(f"   Created {filename}")
    
    print("\n2. Adding files to integrity database...")
    for filename in test_files:
        fim.add_file(filename)
    
    print("\n3. Listing all tracked files...")
    fim.list_files()
    
    print("\n4. Verifying all files (should pass)...")
    fim.verify_all_files()
    
    print("\n5. Modifying a file to simulate corruption...")
    with open(test_files[0], 'a') as f:
        f.write("This line was added later - simulating file corruption\n")
    print(f"   Modified {test_files[0]}")
    
    print("\n6. Verifying all files again (should detect corruption)...")
    fim.verify_all_files()
    
    print("\n7. Database statistics...")
    stats = fim.get_statistics()
    for key, value in stats.items():
        print(f"   {key}: {value}")
    
    # Cleanup
    print("\n8. Cleaning up test files...")
    for filename in test_files + ["demo_integrity.json"]:
        try:
            os.unlink(filename)
            print(f"   Removed {filename}")
        except FileNotFoundError:
            pass


if __name__ == "__main__":
    demonstrate_file_integrity_manager()
```

### Cryptographic Hash Chain Implementation

```python
import hashlib
import json
from datetime import datetime
from typing import List, Dict, Optional

class HashChain:
    """
    Implementation of a cryptographic hash chain (simplified blockchain concept).
    Demonstrates how hashing ensures data integrity across linked records.
    """
  
    def __init__(self):
        self.chain: List[Dict] = []
        self.genesis_block()
  
    def genesis_block(self) -> None:
        """Create the first block in the chain."""
        genesis = {
            "index": 0,
            "timestamp": datetime.now().isoformat(),
            "data": "Genesis Block",
            "previous_hash": "0" * 64,
            "hash": None
        }
        genesis["hash"] = self._calculate_hash(genesis)
        self.chain.append(genesis)
  
    def _calculate_hash(self, block: Dict) -> str:
        """Calculate hash for a block."""
        # Create a copy without the hash field
        block_copy = {k: v for k, v in block.items() if k != "hash"}
      
        # Convert to consistent string representation
        block_string = json.dumps(block_copy, sort_keys=True, separators=(',', ':'))
      
        # Calculate SHA-256 hash
        return hashlib.sha256(block_string.encode('utf-8')).hexdigest()
  
    def add_block(self, data: str) -> Dict:
        """Add a new block to the chain."""
        previous_block = self.chain[-1]
      
        new_block = {
            "index": len(self.chain),
            "timestamp": datetime.now().isoformat(),
            "data": data,
            "previous_hash": previous_block["hash"],
            "hash": None
        }
      
        new_block["hash"] = self._calculate_hash(new_block)
        self.chain.append(new_block)
        return new_block
  
    def verify_chain(self) -> bool:
        """Verify the integrity of the entire chain."""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i-1]
          
            # Verify current block's hash
            if current_block["hash"] != self._calculate_hash(current_block):
                print(f"❌ Block {i} has invalid hash")
                return False
          
            # Verify link to previous block
            if current_block["previous_hash"] != previous_block["hash"]:
                print(f"❌ Block {i} has invalid previous_hash")
                return False
      
        print("✅ Hash chain integrity verified")
        return True
  
    def display_chain(self) -> None:
        """Display the entire chain."""
        print("Hash Chain Contents:")
        print("=" * 80)
      
        for block in self.chain:
            print(f"Block {block['index']}:")
            print(f"  Timestamp: {block['timestamp']}")
            print(f"  Data: {block['data']}")
            print(f"  Previous Hash: {block['previous_hash'][:16]}...")
            print(f"  Hash: {block['hash'][:16]}...")
            print()

# Demonstrate hash chain
def demonstrate_hash_chain():
    """Show how hash chains ensure data integrity."""
  
    print("Cryptographic Hash Chain Demonstration")
    print("=" * 50)
  
    # Create chain
    chain = HashChain()
  
    # Add some blocks
    chain.add_block("Alice transfers 10 coins to Bob")
    chain.add_block("Bob transfers 5 coins to Charlie")
    chain.add_block("Charlie transfers 3 coins to Alice")
  
    print("1. Original chain:")
    chain.display_chain()
  
    print("2. Verifying chain integrity:")
    chain.verify_chain()
  
    print("\n3. Simulating data tampering...")
    # Tamper with a block
    chain.chain[1]["data"] = "Alice transfers 1000 coins to Bob"  # Changed amount!
  
    print("4. Verifying chain after tampering:")
    chain.verify_chain()
  
    print("\n📝 Key Insight: Any change to historical data breaks the hash chain,")
    print("   making tampering immediately detectable!")

demonstrate_hash_chain()
```

## Part 8: Performance Optimization and Algorithm Selection

### Benchmarking Hash Algorithms

```python
import hashlib
import time
import random
import string

def benchmark_hash_algorithms():
    """Compare performance of different hash algorithms."""
  
    # Generate test data of different sizes
    test_sizes = [1024, 10240, 102400, 1024000]  # 1KB, 10KB, 100KB, 1MB
    algorithms = ['md5', 'sha1', 'sha256', 'sha512', 'blake2b']
  
    print("Hash Algorithm Performance Benchmark")
    print("=" * 60)
  
    for size in test_sizes:
        # Generate random test data
        test_data = ''.join(random.choices(string.ascii_letters + string.digits, k=size))
        test_bytes = test_data.encode('utf-8')
      
        print(f"\nData size: {size:,} bytes")
        print("-" * 40)
      
        results = {}
      
        for algo in algorithms:
            try:
                # Time the hashing operation
                start_time = time.perf_counter()
              
                # Perform multiple iterations for more accurate timing
                iterations = max(1, 1000 // (size // 1024))  # Fewer iterations for larger data
              
                for _ in range(iterations):
                    hasher = hashlib.new(algo)
                    hasher.update(test_bytes)
                    hash_result = hasher.hexdigest()
              
                end_time = time.perf_counter()
                avg_time = (end_time - start_time) / iterations
              
                # Calculate throughput
                throughput = size / avg_time / 1024 / 1024  # MB/s
              
                results[algo] = {
                    'time': avg_time,
                    'throughput': throughput,
                    'hash_length': len(hash_result)
                }
              
                print(f"{algo.upper():>8}: {avg_time*1000:6.2f}ms  "
                      f"{throughput:6.1f} MB/s  "
                      f"({len(hash_result)} chars)")
              
            except ValueError:
                print(f"{algo.upper():>8}: Not available")
      
        # Find fastest algorithm
        if results:
            fastest = min(results.keys(), key=lambda x: results[x]['time'])
            print(f"Fastest: {fastest.upper()} ⭐")

benchmark_hash_algorithms()
```

### Algorithm Selection Guide

```python
def hash_algorithm_selector(use_case: str, security_level: str = "medium", 
                          performance_priority: bool = False) -> str:
    """
    Intelligent algorithm selection based on use case and requirements.
  
    Args:
        use_case: Type of application ("checksum", "password", "signature", "blockchain")
        security_level: Required security ("low", "medium", "high")
        performance_priority: Whether speed is more important than max security
      
    Returns:
        Recommended algorithm name
    """
  
    recommendations = {
        "checksum": {
            "low": "md5" if performance_priority else "sha256",
            "medium": "sha256",
            "high": "sha256"
        },
        "password": {  # Note: Real password hashing should use bcrypt/scrypt/Argon2
            "low": "sha256",
            "medium": "sha512", 
            "high": "sha512"
        },
        "signature": {
            "low": "sha256",
            "medium": "sha256",
            "high": "sha512"
        },
        "blockchain": {
            "low": "sha256",
            "medium": "sha256", 
            "high": "sha256"  # Bitcoin standard
        },
        "general": {
            "low": "blake2b" if performance_priority else "sha256",
            "medium": "sha256",
            "high": "sha512"
        }
    }
  
    category = recommendations.get(use_case, recommendations["general"])
    algorithm = category.get(security_level, "sha256")
  
    return algorithm

# Demonstrate algorithm selection
def demonstrate_algorithm_selection():
    """Show intelligent algorithm selection for different scenarios."""
  
    scenarios = [
        ("File checksum for personal backup", "checksum", "medium", True),
        ("Digital signature for legal document", "signature", "high", False),
        ("User password hashing", "password", "high", False),
        ("Game save file integrity", "checksum", "low", True),
        ("Cryptocurrency mining", "blockchain", "medium", False),
    ]
  
    print("Algorithm Selection Recommendations")
    print("=" * 60)
  
    for description, use_case, security, performance in scenarios:
        recommended = hash_algorithm_selector(use_case, security, performance)
      
        print(f"Scenario: {description}")
        print(f"  Use case: {use_case}")
        print(f"  Security level: {security}")
        print(f"  Performance priority: {performance}")
        print(f"  ✅ Recommended: {recommended.upper()}")
        print()

demonstrate_algorithm_selection()
```

## Part 9: Key Concepts Summary

> **The Zen of Cryptographic Hashing in Python**
>
> * **Deterministic** : Same input always produces same output
> * **Fixed Size** : Output length is constant regardless of input size
> * **Irreversible** : Cannot derive input from hash (one-way function)
> * **Avalanche Effect** : Tiny input changes cause dramatic output changes
> * **Collision Resistant** : Extremely difficult to find two inputs with same hash

### Mental Models for Understanding Hashlib

```
Hashlib Conceptual Architecture:
┌─────────────────────────────────────┐
│ Application Layer                   │
│ ├─ File Integrity                   │
│ ├─ Password Verification            │
│ ├─ Digital Signatures               │
│ └─ Data Fingerprinting              │
├─────────────────────────────────────┤
│ Python Hashlib Interface            │
│ ├─ Uniform API (.update(), .digest)│
│ ├─ Multiple Algorithms              │
│ └─ Memory-Efficient Streaming       │
├─────────────────────────────────────┤
│ Cryptographic Algorithms            │
│ ├─ SHA Family (SHA-256, SHA-512)    │
│ ├─ BLAKE2 (Modern, Fast)            │
│ ├─ MD5 (Legacy, Checksums Only)     │
│ └─ SHA-1 (Legacy, Avoid)            │
├─────────────────────────────────────┤
│ Mathematical Foundation             │
│ ├─ Compression Functions            │
│ ├─ Merkle-Damgård Construction      │
│ └─ Cryptographic Primitives         │
└─────────────────────────────────────┘
```

### Essential Patterns to Remember

```python
# Pattern 1: Basic Hashing (strings to bytes!)
text = "Hello, World!"
hash_value = hashlib.sha256(text.encode('utf-8')).hexdigest()

# Pattern 2: Large File Hashing (streaming)
def hash_file(filepath):
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()

# Pattern 3: Secure Comparison (prevent timing attacks)
import secrets
is_valid = secrets.compare_digest(computed_hash, expected_hash)

# Pattern 4: Multi-Algorithm Processing
hashers = {name: hashlib.new(name) for name in ['sha256', 'blake2b']}
for hasher in hashers.values():
    hasher.update(data)
results = {name: h.hexdigest() for name, h in hashers.items()}
```

### When to Use Each Algorithm

| Algorithm         | Use When                                     | Avoid When                           | Notes                          |
| ----------------- | -------------------------------------------- | ------------------------------------ | ------------------------------ |
| **SHA-256** | Security matters, broad compatibility needed | Performance is critical              | Industry standard, well-tested |
| **BLAKE2b** | New projects, performance + security needed  | Legacy system compatibility required | Fastest secure option          |
| **SHA-512** | Maximum security, large datasets             | Memory/bandwidth constrained         | Slower but more secure         |
| **MD5**     | Non-security checksums only                  | Any security application             | Cryptographically broken       |
| **SHA-1**   | Legacy compatibility only                    | New applications                     | Being phased out               |

The `hashlib` module exemplifies Python's philosophy of providing powerful, secure tools with a simple, consistent interface. Understanding these concepts enables you to build robust applications that maintain data integrity, verify authenticity, and implement security best practices.

Whether you're building file backup systems, implementing user authentication, or creating blockchain applications, hashlib provides the cryptographic foundation you need with Python's characteristic ease of use.
