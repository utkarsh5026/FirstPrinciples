# SQLite3 Module: From Database Fundamentals to Python Integration

## Understanding Databases from First Principles

Before diving into Python's sqlite3 module, let's establish what databases are and why they matter in programming.

### What is Data Persistence?

In programming, we constantly work with data - user input, calculations, configurations. But by default, this data exists only in memory and disappears when your program ends.

```python
# This data disappears when the program ends
user_name = "Alice"
user_age = 25
user_scores = [85, 92, 78]

print(f"{user_name} is {user_age} years old")
# When program terminates, all this data is lost
```

**Data persistence** means storing data so it survives beyond program execution. You need this for:

* Saving user preferences
* Storing application data
* Keeping historical records
* Sharing data between program runs

### Simple vs. Database Storage

You could save data to text files:

```python
# Simple file storage (not ideal for complex data)
with open("user_data.txt", "w") as f:
    f.write(f"Alice,25,85,92,78\n")
    f.write(f"Bob,30,90,88,95\n")

# Reading requires parsing
with open("user_data.txt", "r") as f:
    for line in f:
        name, age, *scores = line.strip().split(",")
        print(f"{name}: {scores}")
```

But this approach has problems:

* **No structure** : Hard to query specific data
* **No relationships** : Can't easily link related information
* **No concurrent access** : Multiple programs can't safely use the same file
* **No data integrity** : Easy to corrupt or lose data

> **Why Databases Exist** : Databases solve these problems by providing structured, reliable, searchable data storage with support for concurrent access and data integrity.

## What is SQLite?

SQLite is a special type of database called an  **embedded database** :

```
Traditional Database Server          SQLite Embedded Database
┌─────────────────────┐             ┌─────────────────────┐
│   Database Server   │             │   Your Python App   │
│   (separate process)│             │                     │
│                     │    ←→       │  ┌───────────────┐  │
│   Your Python App   │             │  │ SQLite Engine │  │
│   (client)          │             │  │ (library)     │  │
└─────────────────────┘             │  └───────────────┘  │
                                    │  ┌───────────────┐  │
Network connection required         │  │ Database File │  │
Separate installation needed        │  │ (.db file)    │  │
                                    │  └───────────────┘  │
                                    └─────────────────────┘
```

> **SQLite Philosophy** : "SQLite is not a replacement for enterprise database engines. SQLite is a replacement for fopen()." - It's designed to be a better way to store application data than plain files.

## Understanding SQL Before Python Integration

SQLite uses SQL (Structured Query Language). Let's understand SQL fundamentals:

### Core SQL Concepts

 **Tables** : Data organized in rows and columns

```sql
-- A table structure
Users Table:
┌────┬──────────┬─────┬───────────┐
│ id │   name   │ age │   email   │
├────┼──────────┼─────┼───────────┤
│ 1  │  Alice   │ 25  │ alice@... │
│ 2  │  Bob     │ 30  │ bob@...   │
└────┴──────────┴─────┴───────────┘
```

 **Basic SQL Operations** :

* `CREATE TABLE`: Define table structure
* `INSERT`: Add new data
* `SELECT`: Query/retrieve data
* `UPDATE`: Modify existing data
* `DELETE`: Remove data

## Python's sqlite3 Module: Architecture and Design

Python's sqlite3 module provides a Python interface to SQLite databases:

```python
import sqlite3

# The sqlite3 module provides these key components:
# 1. Connection objects - represent a database
# 2. Cursor objects - execute SQL commands
# 3. Row objects - represent query results
# 4. Exception classes - handle database errors
```

### Connection and Cursor Pattern

```python
# Basic connection pattern
connection = sqlite3.connect('example.db')  # Connection object
cursor = connection.cursor()                # Cursor object
cursor.execute('SELECT * FROM users')      # Execute SQL
results = cursor.fetchall()                # Get results
connection.close()                         # Clean up
```

> **Design Pattern** : The connection/cursor pattern separates database management (connection) from SQL execution (cursor). This allows multiple cursors per connection and better resource management.

## Building Your First Database Application

Let's progressively build a complete example, explaining each concept:

### Step 1: Creating and Connecting to a Database

```python
import sqlite3

# Create/connect to database (file created if doesn't exist)
conn = sqlite3.connect('learning.db')
print("Database connection established")

# Always close connections (we'll improve this later)
conn.close()
```

**What happens here:**

* If 'learning.db' doesn't exist, SQLite creates it
* If it exists, SQLite opens it
* The connection object represents your link to the database

### Step 2: Creating Tables (Database Schema)

```python
import sqlite3

conn = sqlite3.connect('learning.db')
cursor = conn.cursor()

# Create a table with specific column types
cursor.execute('''
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER,
        grade REAL,
        enrollment_date TEXT
    )
''')

# Save changes to database
conn.commit()
conn.close()
```

**Understanding the SQL:**

* `IF NOT EXISTS`: Only create if table doesn't already exist
* `INTEGER PRIMARY KEY AUTOINCREMENT`: Auto-generating unique ID
* `TEXT NOT NULL`: Text field that cannot be empty
* `REAL`: Floating-point numbers
* `commit()`: Actually saves changes to disk

### Step 3: Inserting Data (Multiple Approaches)

```python
import sqlite3
from datetime import date

conn = sqlite3.connect('learning.db')
cursor = conn.cursor()

# Method 1: Direct insertion (avoid - security risk)
name = "Alice"
cursor.execute(f"INSERT INTO students (name, age, grade, enrollment_date) VALUES ('{name}', 20, 85.5, '{date.today()}')")

# Method 2: Parameter substitution (RECOMMENDED)
student_data = ("Bob", 22, 92.0, str(date.today()))
cursor.execute("INSERT INTO students (name, age, grade, enrollment_date) VALUES (?, ?, ?, ?)", student_data)

# Method 3: Named parameters (most readable)
cursor.execute("""
    INSERT INTO students (name, age, grade, enrollment_date) 
    VALUES (:name, :age, :grade, :date)
""", {
    'name': 'Charlie',
    'age': 19,
    'grade': 88.0,
    'date': str(date.today())
})

# Method 4: Bulk insertion
students = [
    ("Diana", 21, 95.5, str(date.today())),
    ("Eve", 20, 87.0, str(date.today())),
    ("Frank", 23, 91.5, str(date.today()))
]
cursor.executemany("INSERT INTO students (name, age, grade, enrollment_date) VALUES (?, ?, ?, ?)", students)

conn.commit()
conn.close()
```

> **Critical Security Note** : Never use string formatting for SQL queries (Method 1). This creates SQL injection vulnerabilities. Always use parameter substitution (Methods 2-4).

### Step 4: Querying Data (Reading from Database)

```python
import sqlite3

conn = sqlite3.connect('learning.db')
cursor = conn.cursor()

# Basic query - get all data
cursor.execute("SELECT * FROM students")
all_students = cursor.fetchall()
print("All students:", all_students)

# Specific columns
cursor.execute("SELECT name, grade FROM students")
names_grades = cursor.fetchall()
print("Names and grades:", names_grades)

# Conditional queries
cursor.execute("SELECT * FROM students WHERE grade > ?", (90,))
high_performers = cursor.fetchall()
print("High performers:", high_performers)

# Ordering results
cursor.execute("SELECT * FROM students ORDER BY grade DESC")
sorted_by_grade = cursor.fetchall()
print("Sorted by grade:", sorted_by_grade)

conn.close()
```

**Different fetch methods:**

```python
conn = sqlite3.connect('learning.db')
cursor = conn.cursor()

cursor.execute("SELECT * FROM students")

# fetchone() - gets next single row
first_student = cursor.fetchone()
print("First student:", first_student)

# fetchmany(size) - gets specified number of rows
some_students = cursor.fetchmany(3)
print("Next 3 students:", some_students)

# fetchall() - gets all remaining rows
remaining_students = cursor.fetchall()
print("All remaining:", remaining_students)

conn.close()
```

## Advanced Concepts: Making Results More Pythonic

### Row Factories: Better Data Access

By default, SQLite returns tuples. We can improve this:

```python
import sqlite3

# Default behavior - tuples
conn = sqlite3.connect('learning.db')
cursor = conn.cursor()
cursor.execute("SELECT name, age, grade FROM students LIMIT 1")
result = cursor.fetchone()
print("Tuple result:", result)  # ('Alice', 20, 85.5)
print("Accessing by index:", result[0])  # Alice

# Improved: Row factory for dictionary-like access
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT name, age, grade FROM students LIMIT 1")
result = cursor.fetchone()
print("Row result:", result)
print("Accessing by name:", result['name'])  # Alice
print("Accessing by index still works:", result[0])  # Alice

# Can iterate over column names
for key in result.keys():
    print(f"{key}: {result[key]}")

conn.close()
```

### Custom Row Factory

```python
import sqlite3

def dict_factory(cursor, row):
    """Convert row to dictionary"""
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

def student_factory(cursor, row):
    """Convert row to custom Student object"""
    class Student:
        def __init__(self, id, name, age, grade, enrollment_date):
            self.id = id
            self.name = name
            self.age = age
            self.grade = grade
            self.enrollment_date = enrollment_date
      
        def __repr__(self):
            return f"Student(name='{self.name}', grade={self.grade})"
  
    return Student(*row)

# Using custom factory
conn = sqlite3.connect('learning.db')
conn.row_factory = student_factory
cursor = conn.cursor()

cursor.execute("SELECT * FROM students LIMIT 2")
students = cursor.fetchall()
for student in students:
    print(f"{student.name} has grade {student.grade}")

conn.close()
```

## Error Handling and Transactions

### Understanding Database Transactions

```python
import sqlite3

# Without transaction control (dangerous)
def bad_transfer_example():
    conn = sqlite3.connect('banking.db')
    cursor = conn.cursor()
  
    # If this succeeds but next fails, money disappears!
    cursor.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
    cursor.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
  
    conn.commit()
    conn.close()

# With proper transaction control
def safe_transfer_example():
    conn = sqlite3.connect('banking.db')
    cursor = conn.cursor()
  
    try:
        # Start transaction (implicit)
        cursor.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
        cursor.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
      
        # Only commit if both succeed
        conn.commit()
        print("Transfer successful")
      
    except sqlite3.Error as e:
        # If anything fails, rollback
        conn.rollback()
        print(f"Transfer failed: {e}")
      
    finally:
        conn.close()
```

> **Transaction Principle** : Either all operations in a transaction succeed, or none do. This ensures data consistency.

### Comprehensive Error Handling

```python
import sqlite3

def robust_database_operation():
    conn = None
    try:
        conn = sqlite3.connect('learning.db')
        cursor = conn.cursor()
      
        # Attempt operation
        cursor.execute("INSERT INTO students (name, age, grade) VALUES (?, ?, ?)", 
                      ("Test Student", 25, 95.0))
        conn.commit()
      
    except sqlite3.IntegrityError as e:
        print(f"Data integrity error: {e}")
        # Handle constraint violations (duplicate keys, etc.)
      
    except sqlite3.OperationalError as e:
        print(f"Operational error: {e}")
        # Handle locked database, syntax errors, etc.
      
    except sqlite3.DatabaseError as e:
        print(f"Database error: {e}")
        # General database errors
      
    except Exception as e:
        print(f"Unexpected error: {e}")
      
    finally:
        if conn:
            conn.close()
```

## Context Managers: The Pythonic Way

```python
import sqlite3
from contextlib import contextmanager

# Basic context manager usage
def pythonic_database_access():
    with sqlite3.connect('learning.db') as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM students")
        count = cursor.fetchone()[0]
        print(f"Total students: {count}")
    # Connection automatically closed, even if error occurs

# Custom context manager for cursor
@contextmanager
def get_db_cursor(db_name):
    conn = sqlite3.connect(db_name)
    try:
        yield conn.cursor()
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

# Usage of custom context manager
def using_custom_context_manager():
    with get_db_cursor('learning.db') as cursor:
        cursor.execute("INSERT INTO students (name, age) VALUES (?, ?)", 
                      ("Context Student", 24))
        # Automatic commit and cleanup
```

> **Pythonic Principle** : Use context managers (`with` statement) for resource management. They ensure proper cleanup even when errors occur.

## Building a Complete Database Class

Let's create a reusable database interface:

```python
import sqlite3
from contextlib import contextmanager
from typing import List, Dict, Any, Optional

class StudentDatabase:
    """A complete database interface for student management"""
  
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._initialize_database()
  
    def _initialize_database(self):
        """Create tables if they don't exist"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    age INTEGER,
                    grade REAL,
                    enrollment_date TEXT,
                    UNIQUE(name)
                )
            ''')
            conn.commit()
  
    @contextmanager
    def _get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable dict-like access
        try:
            yield conn
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()
  
    def add_student(self, name: str, age: int, grade: float, 
                   enrollment_date: str) -> bool:
        """Add a new student to the database"""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO students (name, age, grade, enrollment_date)
                    VALUES (?, ?, ?, ?)
                """, (name, age, grade, enrollment_date))
                conn.commit()
                return True
        except sqlite3.IntegrityError:
            print(f"Student '{name}' already exists")
            return False
  
    def get_student(self, student_id: int) -> Optional[Dict]:
        """Get a student by ID"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
  
    def get_all_students(self) -> List[Dict]:
        """Get all students"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM students ORDER BY name")
            return [dict(row) for row in cursor.fetchall()]
  
    def update_grade(self, student_id: int, new_grade: float) -> bool:
        """Update a student's grade"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE students SET grade = ? WHERE id = ?
            """, (new_grade, student_id))
            conn.commit()
            return cursor.rowcount > 0
  
    def delete_student(self, student_id: int) -> bool:
        """Delete a student"""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
            conn.commit()
            return cursor.rowcount > 0
  
    def search_students(self, **criteria) -> List[Dict]:
        """Search students by various criteria"""
        conditions = []
        values = []
      
        for field, value in criteria.items():
            if field in ['name', 'age', 'grade', 'enrollment_date']:
                conditions.append(f"{field} = ?")
                values.append(value)
      
        if not conditions:
            return self.get_all_students()
      
        query = f"SELECT * FROM students WHERE {' AND '.join(conditions)}"
      
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, values)
            return [dict(row) for row in cursor.fetchall()]

# Usage example
if __name__ == "__main__":
    db = StudentDatabase('students.db')
  
    # Add students
    db.add_student("Alice Johnson", 20, 85.5, "2024-01-15")
    db.add_student("Bob Smith", 22, 92.0, "2024-01-16")
  
    # Query students
    all_students = db.get_all_students()
    print("All students:", all_students)
  
    # Search
    high_performers = db.search_students(grade=92.0)
    print("High performers:", high_performers)
  
    # Update
    if db.update_grade(1, 87.0):
        print("Grade updated successfully")
```

## Advanced Features and Optimizations

### Indexes for Query Performance

```python
import sqlite3
import time

def demonstrate_indexes():
    conn = sqlite3.connect(':memory:')  # In-memory database
    cursor = conn.cursor()
  
    # Create table
    cursor.execute('''
        CREATE TABLE large_table (
            id INTEGER PRIMARY KEY,
            email TEXT,
            score INTEGER
        )
    ''')
  
    # Insert lots of data
    data = [(i, f"user{i}@example.com", i % 100) for i in range(100000)]
    cursor.executemany("INSERT INTO large_table VALUES (?, ?, ?)", data)
  
    # Query without index
    start_time = time.time()
    cursor.execute("SELECT * FROM large_table WHERE email = 'user50000@example.com'")
    result = cursor.fetchone()
    no_index_time = time.time() - start_time
  
    # Create index
    cursor.execute("CREATE INDEX idx_email ON large_table(email)")
  
    # Query with index
    start_time = time.time()
    cursor.execute("SELECT * FROM large_table WHERE email = 'user50000@example.com'")
    result = cursor.fetchone()
    with_index_time = time.time() - start_time
  
    print(f"Without index: {no_index_time:.4f} seconds")
    print(f"With index: {with_index_time:.4f} seconds")
    print(f"Speedup: {no_index_time / with_index_time:.1f}x")
  
    conn.close()

demonstrate_indexes()
```

### Working with JSON Data

```python
import sqlite3
import json

def json_data_example():
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
  
    # Table with JSON column
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT,
            preferences TEXT  -- Will store JSON
        )
    ''')
  
    # Insert data with JSON
    user_prefs = {
        "theme": "dark",
        "notifications": True,
        "languages": ["python", "javascript"]
    }
  
    cursor.execute("INSERT INTO users (name, preferences) VALUES (?, ?)",
                  ("Alice", json.dumps(user_prefs)))
  
    # Query and parse JSON
    cursor.execute("SELECT name, preferences FROM users WHERE id = 1")
    name, prefs_json = cursor.fetchone()
    preferences = json.loads(prefs_json)
  
    print(f"User: {name}")
    print(f"Theme: {preferences['theme']}")
    print(f"Languages: {preferences['languages']}")
  
    conn.close()

json_data_example()
```

### Database Schema Migrations

```python
import sqlite3

class DatabaseMigrator:
    """Handle database schema changes over time"""
  
    def __init__(self, db_path):
        self.db_path = db_path
        self._ensure_version_table()
  
    def _ensure_version_table(self):
        """Create version tracking table"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER PRIMARY KEY
            )
        ''')
        # Insert initial version if empty
        cursor.execute("SELECT COUNT(*) FROM schema_version")
        if cursor.fetchone()[0] == 0:
            cursor.execute("INSERT INTO schema_version (version) VALUES (0)")
        conn.commit()
        conn.close()
  
    def get_current_version(self):
        """Get current schema version"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT MAX(version) FROM schema_version")
        version = cursor.fetchone()[0]
        conn.close()
        return version or 0
  
    def migrate_to_version_1(self, conn):
        """Add email column to students table"""
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE students ADD COLUMN email TEXT")
        cursor.execute("UPDATE schema_version SET version = 1")
  
    def migrate_to_version_2(self, conn):
        """Add index on student names"""
        cursor = conn.cursor()
        cursor.execute("CREATE INDEX idx_student_name ON students(name)")
        cursor.execute("UPDATE schema_version SET version = 2")
  
    def migrate(self):
        """Run all necessary migrations"""
        current_version = self.get_current_version()
        migrations = {
            1: self.migrate_to_version_1,
            2: self.migrate_to_version_2,
        }
      
        conn = sqlite3.connect(self.db_path)
        try:
            for version, migration_func in migrations.items():
                if current_version < version:
                    print(f"Migrating to version {version}")
                    migration_func(conn)
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

# Usage
migrator = DatabaseMigrator('students.db')
migrator.migrate()
```

## Common Pitfalls and Best Practices

### Memory Management and Connection Pooling

```python
import sqlite3
from concurrent.futures import ThreadPoolExecutor
import threading

# WRONG: Creating many connections
def bad_concurrent_access():
    def worker(worker_id):
        # Each thread creates its own connection (expensive)
        conn = sqlite3.connect('data.db')
        cursor = conn.cursor()
        cursor.execute("INSERT INTO logs (message) VALUES (?)", 
                      (f"Worker {worker_id}",))
        conn.commit()
        conn.close()
  
    with ThreadPoolExecutor(max_workers=100) as executor:
        futures = [executor.submit(worker, i) for i in range(100)]

# BETTER: Connection per thread with thread-local storage
thread_local = threading.local()

def get_connection():
    if not hasattr(thread_local, 'connection'):
        thread_local.connection = sqlite3.connect('data.db')
    return thread_local.connection

def better_concurrent_access():
    def worker(worker_id):
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO logs (message) VALUES (?)", 
                      (f"Worker {worker_id}",))
        conn.commit()
  
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(worker, i) for i in range(100)]
```

### SQL Injection Prevention

```python
import sqlite3

def demonstrate_sql_injection():
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
  
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            password TEXT
        )
    ''')
  
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)",
                  ("admin", "secret123"))
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)",
                  ("user", "password"))
  
    # DANGEROUS: SQL Injection vulnerability
    def vulnerable_login(username, password):
        query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
        print(f"Query: {query}")
        cursor.execute(query)
        return cursor.fetchone()
  
    # SAFE: Parameterized query
    def safe_login(username, password):
        cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?",
                      (username, password))
        return cursor.fetchone()
  
    # Normal usage
    print("Normal login:", safe_login("admin", "secret123"))
  
    # Injection attempt
    malicious_input = "admin'; DROP TABLE users; --"
    try:
        print("Vulnerable result:", vulnerable_login(malicious_input, "anything"))
    except:
        print("Query failed (database might be damaged)")
  
    print("Safe result:", safe_login(malicious_input, "anything"))
  
    conn.close()

demonstrate_sql_injection()
```

> **Security Rule** : Never concatenate user input directly into SQL strings. Always use parameter substitution (?, :name) or prepared statements.

## Real-World Applications and Patterns

### Configuration Management

```python
import sqlite3
import json
from datetime import datetime

class ConfigManager:
    """Manage application configuration with history tracking"""
  
    def __init__(self, db_path):
        self.db_path = db_path
        self._setup_tables()
  
    def _setup_tables(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS config (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updated_at TEXT
                )
            ''')
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS config_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT,
                    old_value TEXT,
                    new_value TEXT,
                    changed_at TEXT
                )
            ''')
  
    def set_config(self, key: str, value: any):
        """Set configuration value with history tracking"""
        json_value = json.dumps(value)
        now = datetime.now().isoformat()
      
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
          
            # Get old value for history
            cursor.execute("SELECT value FROM config WHERE key = ?", (key,))
            result = cursor.fetchone()
            old_value = result[0] if result else None
          
            # Update/insert new value
            cursor.execute("""
                INSERT OR REPLACE INTO config (key, value, updated_at)
                VALUES (?, ?, ?)
            """, (key, json_value, now))
          
            # Record history
            if old_value != json_value:
                cursor.execute("""
                    INSERT INTO config_history (key, old_value, new_value, changed_at)
                    VALUES (?, ?, ?, ?)
                """, (key, old_value, json_value, now))
  
    def get_config(self, key: str, default=None):
        """Get configuration value"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM config WHERE key = ?", (key,))
            result = cursor.fetchone()
            if result:
                return json.loads(result[0])
            return default
  
    def get_config_history(self, key: str):
        """Get change history for a configuration key"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM config_history 
                WHERE key = ? 
                ORDER BY changed_at DESC
            """, (key,))
            return [dict(row) for row in cursor.fetchall()]

# Usage example
config = ConfigManager('app_config.db')

config.set_config('database_url', 'sqlite:///production.db')
config.set_config('debug_mode', False)
config.set_config('max_connections', 100)

print("Database URL:", config.get_config('database_url'))
print("Debug mode:", config.get_config('debug_mode'))

# Later, change configuration
config.set_config('debug_mode', True)
config.set_config('max_connections', 200)

# View history
history = config.get_config_history('debug_mode')
print("Debug mode history:", history)
```

### Data Analytics with SQLite

```python
import sqlite3
import csv
from datetime import datetime, timedelta
import random

class SalesAnalytics:
    """Example of using SQLite for data analytics"""
  
    def __init__(self, db_path):
        self.db_path = db_path
        self._setup_tables()
        self._generate_sample_data()
  
    def _setup_tables(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sales (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER,
                    product_name TEXT,
                    category TEXT,
                    sale_date TEXT,
                    quantity INTEGER,
                    unit_price REAL,
                    total_amount REAL
                )
            ''')
          
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_sale_date ON sales(sale_date)
            ''')
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_category ON sales(category)
            ''')
  
    def _generate_sample_data(self):
        """Generate sample sales data"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
          
            # Check if data already exists
            cursor.execute("SELECT COUNT(*) FROM sales")
            if cursor.fetchone()[0] > 0:
                return
          
            products = [
                (1, "Laptop Pro", "Electronics"),
                (2, "Wireless Mouse", "Electronics"),
                (3, "Office Chair", "Furniture"),
                (4, "Standing Desk", "Furniture"),
                (5, "Coffee Mug", "Kitchen"),
                (6, "Water Bottle", "Kitchen")
            ]
          
            sales_data = []
            base_date = datetime.now() - timedelta(days=365)
          
            for day in range(365):
                current_date = (base_date + timedelta(days=day)).date()
                daily_sales = random.randint(5, 20)
              
                for _ in range(daily_sales):
                    product_id, product_name, category = random.choice(products)
                    quantity = random.randint(1, 5)
                    unit_price = random.uniform(10, 1000)
                    total_amount = quantity * unit_price
                  
                    sales_data.append((
                        product_id, product_name, category,
                        current_date.isoformat(), quantity,
                        unit_price, total_amount
                    ))
          
            cursor.executemany("""
                INSERT INTO sales (product_id, product_name, category, sale_date, 
                                 quantity, unit_price, total_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, sales_data)
  
    def monthly_sales_report(self):
        """Generate monthly sales summary"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
          
            cursor.execute("""
                SELECT 
                    strftime('%Y-%m', sale_date) as month,
                    COUNT(*) as total_transactions,
                    SUM(quantity) as total_items_sold,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as avg_transaction_value
                FROM sales
                GROUP BY strftime('%Y-%m', sale_date)
                ORDER BY month DESC
                LIMIT 12
            """)
          
            return [dict(row) for row in cursor.fetchall()]
  
    def category_performance(self):
        """Analyze performance by category"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
          
            cursor.execute("""
                SELECT 
                    category,
                    COUNT(*) as transaction_count,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as avg_revenue_per_transaction,
                    SUM(quantity) as total_quantity
                FROM sales
                GROUP BY category
                ORDER BY total_revenue DESC
            """)
          
            return [dict(row) for row in cursor.fetchall()]
  
    def top_products(self, limit=10):
        """Find top-selling products"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
          
            cursor.execute("""
                SELECT 
                    product_name,
                    category,
                    COUNT(*) as times_sold,
                    SUM(quantity) as total_quantity,
                    SUM(total_amount) as total_revenue
                FROM sales
                GROUP BY product_id, product_name, category
                ORDER BY total_revenue DESC
                LIMIT ?
            """, (limit,))
          
            return [dict(row) for row in cursor.fetchall()]
  
    def daily_sales_trend(self, days=30):
        """Get daily sales for trend analysis"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
          
            cursor.execute("""
                SELECT 
                    sale_date,
                    COUNT(*) as transaction_count,
                    SUM(total_amount) as daily_revenue
                FROM sales
                WHERE sale_date >= date('now', '-{} days')
                GROUP BY sale_date
                ORDER BY sale_date DESC
            """.format(days))
          
            return [dict(row) for row in cursor.fetchall()]

# Usage example
analytics = SalesAnalytics('sales_analytics.db')

print("Monthly Sales Report:")
monthly_report = analytics.monthly_sales_report()
for month in monthly_report[:3]:  # Show last 3 months
    print(f"  {month['month']}: ${month['total_revenue']:.2f} revenue, "
          f"{month['total_transactions']} transactions")

print("\nCategory Performance:")
category_report = analytics.category_performance()
for category in category_report:
    print(f"  {category['category']}: ${category['total_revenue']:.2f}")

print("\nTop Products:")
top_products = analytics.top_products(5)
for product in top_products:
    print(f"  {product['product_name']}: ${product['total_revenue']:.2f}")
```

## Integration with Other Python Tools

### Pandas Integration

```python
import sqlite3
import pandas as pd

def sqlite_pandas_integration():
    """Demonstrate SQLite with Pandas"""
  
    # Create sample data
    conn = sqlite3.connect(':memory:')
  
    # Create DataFrame
    df = pd.DataFrame({
        'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
        'age': [25, 30, 35, 28],
        'salary': [50000, 60000, 70000, 55000],
        'department': ['Engineering', 'Sales', 'Engineering', 'Marketing']
    })
  
    # Write DataFrame to SQLite
    df.to_sql('employees', conn, index=False, if_exists='replace')
  
    # Read back with SQL query
    query_result = pd.read_sql_query("""
        SELECT department, 
               AVG(salary) as avg_salary,
               COUNT(*) as employee_count
        FROM employees 
        GROUP BY department
    """, conn)
  
    print("Department Analysis:")
    print(query_result)
  
    # Complex analysis combining SQL and Pandas
    high_earners = pd.read_sql_query("""
        SELECT * FROM employees WHERE salary > 55000
    """, conn)
  
    print("\nHigh Earners Analysis:")
    print(high_earners.describe())
  
    conn.close()

sqlite_pandas_integration()
```

### Web Application Integration (Flask Example)

```python
from flask import Flask, request, jsonify
import sqlite3
from contextlib import contextmanager

app = Flask(__name__)
DATABASE = 'api_data.db'

@contextmanager
def get_db():
    """Database connection context manager"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initialize database tables"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

@app.route('/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.get_json()
  
    if not data or 'username' not in data or 'email' not in data:
        return jsonify({'error': 'Username and email required'}), 400
  
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (username, email)
                VALUES (?, ?)
            """, (data['username'], data['email']))
            user_id = cursor.lastrowid
            conn.commit()
          
            return jsonify({
                'id': user_id,
                'username': data['username'],
                'email': data['email']
            }), 201
          
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username or email already exists'}), 409

@app.route('/users', methods=['GET'])
def get_users():
    """Get all users"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
        users = [dict(row) for row in cursor.fetchall()]
        return jsonify(users)

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get specific user"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
      
        if user:
            return jsonify(dict(user))
        return jsonify({'error': 'User not found'}), 404

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
```

## Performance Optimization and Best Practices

### Query Optimization

```python
import sqlite3
import time

def optimization_examples():
    """Demonstrate query optimization techniques"""
  
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
  
    # Create test table
    cursor.execute('''
        CREATE TABLE performance_test (
            id INTEGER PRIMARY KEY,
            category TEXT,
            status TEXT,
            score INTEGER,
            created_date TEXT
        )
    ''')
  
    # Insert test data
    import random
    from datetime import datetime, timedelta
  
    categories = ['A', 'B', 'C', 'D', 'E']
    statuses = ['active', 'inactive', 'pending']
  
    test_data = []
    base_date = datetime.now() - timedelta(days=365)
  
    for i in range(100000):
        test_data.append((
            i,
            random.choice(categories),
            random.choice(statuses),
            random.randint(1, 100),
            (base_date + timedelta(days=random.randint(0, 365))).isoformat()
        ))
  
    cursor.executemany("""
        INSERT INTO performance_test VALUES (?, ?, ?, ?, ?)
    """, test_data)
  
    print("Optimization Examples:")
  
    # 1. Without index
    start = time.time()
    cursor.execute("SELECT COUNT(*) FROM performance_test WHERE category = 'A'")
    result = cursor.fetchone()
    no_index_time = time.time() - start
    print(f"1. Without index: {no_index_time:.4f}s, result: {result[0]}")
  
    # 2. With index
    cursor.execute("CREATE INDEX idx_category ON performance_test(category)")
    start = time.time()
    cursor.execute("SELECT COUNT(*) FROM performance_test WHERE category = 'A'")
    result = cursor.fetchone()
    with_index_time = time.time() - start
    print(f"2. With index: {with_index_time:.4f}s, result: {result[0]}")
  
    # 3. Compound conditions
    cursor.execute("CREATE INDEX idx_category_status ON performance_test(category, status)")
    start = time.time()
    cursor.execute("""
        SELECT COUNT(*) FROM performance_test 
        WHERE category = 'A' AND status = 'active'
    """)
    result = cursor.fetchone()
    compound_time = time.time() - start
    print(f"3. Compound index: {compound_time:.4f}s, result: {result[0]}")
  
    # 4. Using EXPLAIN QUERY PLAN
    cursor.execute("EXPLAIN QUERY PLAN SELECT * FROM performance_test WHERE category = 'A'")
    plan = cursor.fetchall()
    print("4. Query plan:")
    for step in plan:
        print(f"   {step}")
  
    conn.close()

optimization_examples()
```

> **Performance Tips** :
>
> * Create indexes on frequently queried columns
> * Use compound indexes for multi-column WHERE clauses
> * Use `EXPLAIN QUERY PLAN` to understand query execution
> * Consider `VACUUM` to reclaim space after deletions

## Summary: SQLite3 as a Complete Data Solution

SQLite3 with Python provides a complete embedded database solution that:

**Strengths:**

* Zero configuration - no server setup required
* ACID compliance - reliable transactions
* Cross-platform - works everywhere Python works
* Excellent performance for read-heavy workloads
* Rich SQL feature set
* Perfect for development, testing, and small to medium applications

**Best Use Cases:**

* Desktop applications
* Mobile app backends
* Prototyping and development
* Data analysis and reporting
* Configuration management
* Caching and temporary storage
* Small to medium web applications

**When to Consider Alternatives:**

* High concurrent write loads
* Multi-user applications with complex permissions
* Distributed systems
* Very large datasets (>100GB)
* Applications requiring stored procedures

> **The Zen of SQLite** : "SQLite is not intended to replace Oracle. It is intended to replace fopen()." - Use SQLite when you need structured, queryable data storage without the complexity of a full database server.

The sqlite3 module exemplifies Python's philosophy of "batteries included" - providing professional-grade database capabilities with minimal setup, making data persistence accessible to every Python developer.
