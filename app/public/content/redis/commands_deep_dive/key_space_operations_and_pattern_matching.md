# Redis Key Space Operations and Pattern Matching from First Principles

I'll explain Redis key space operations and pattern matching from the ground up, building our understanding step by step with clear examples along the way.

## 1. What is the Redis Key Space?

At its most fundamental level, Redis is a key-value store. This means that every piece of data in Redis is associated with a key (a unique identifier) that allows you to access that data.

The collection of all keys in a Redis database is called the "key space." Think of it as the universe of all possible keys, with your actual keys being stars scattered throughout this universe.

### Key Characteristics

Redis keys:

* Are binary safe (can contain any binary sequence)
* Have a maximum size of 512MB (though using very long keys is not recommended)
* Are case-sensitive ("user:1" and "User:1" are different keys)
* Can use any structure as long as it's a string (though conventions exist)

### A Simple Visualization

Imagine your Redis database as a giant dictionary or map:

```
KEY SPACE
┌─────────────┬────────────────────┐
│ user:1000   │ {name: "John", …}  │
├─────────────┼────────────────────┤
│ product:45  │ {title: "Chair", …}│
├─────────────┼────────────────────┤
│ counter:web │ 42                 │
└─────────────┴────────────────────┘
```

## 2. Key Naming Conventions

Before discussing operations, let's understand common conventions for naming keys in Redis:

1. **Object-type:id** - Example: `user:1000`, `product:45`
2. **Object-type🆔field** - Example: `user:1000:email`, `product:45:price`
3. **Action:entity:id** - Example: `like:post:123`, `view:article:789`

These conventions make keys more readable and organized, especially in large systems.

## 3. Basic Key Space Operations

Let's explore fundamental operations for working with the Redis key space:

### Determining if a Key Exists

The `EXISTS` command checks if a key exists in the database:

```
EXISTS user:1000
```

This returns 1 if the key exists and 0 if it doesn't. If you check multiple keys, it returns the count of existing keys.

Example:

```
> SET user:1000 "John Smith"
OK
> EXISTS user:1000
(integer) 1
> EXISTS user:1001
(integer) 0
> EXISTS user:1000 user:1001 user:1002
(integer) 1
```

In this example, only `user:1000` exists, so when checking multiple keys, Redis returns 1.

### Deleting Keys

The `DEL` command removes one or more keys:

```
DEL user:1000
```

This returns the number of keys actually deleted (keys that existed and were removed).

Example:

```
> SET user:1000 "John Smith"
OK
> SET user:1001 "Jane Doe"
OK
> DEL user:1000 user:1001 user:1002
(integer) 2
```

In this case, we tried to delete three keys, but only two existed and were deleted, so Redis returns 2.

### Determining Key Type

The `TYPE` command returns the data type stored at a key:

```
TYPE user:1000
```

Example:

```
> SET counter 42
OK
> LPUSH mylist "item1"
(integer) 1
> HSET user:1000 name "John" age 30
(integer) 2
> TYPE counter
string
> TYPE mylist
list
> TYPE user:1000
hash
```

The possible return values are: string, list, set, zset (sorted set), hash, stream, or none (if key doesn't exist).

### Setting Key Expiration

Redis allows you to set a time-to-live (TTL) for keys:

```
EXPIRE user:1000 60  # Expire in 60 seconds
```

Example:

```
> SET session:user:1000 "data"
OK
> EXPIRE session:user:1000 30
(integer) 1
> TTL session:user:1000
(integer) 28
# After waiting...
> TTL session:user:1000
(integer) -2  # Key has expired and been deleted
```

You can also set a key with expiration in one command:

```
> SETEX session:user:1000 30 "session data"
OK
```

### Checking Remaining Time-to-Live

The `TTL` command returns the remaining time-to-live for a key in seconds:

```
TTL user:1000
```

Returns:

* A positive integer: remaining seconds
* -1: key exists but has no expiration set
* -2: key doesn't exist

Example:

```
> SET permanent:key "value"
OK
> SET temporary:key "value"
OK
> EXPIRE temporary:key 60
(integer) 1
> TTL permanent:key
(integer) -1  # Exists but no expiration
> TTL temporary:key
(integer) 58  # 58 seconds remaining
> TTL nonexistent:key
(integer) -2  # Doesn't exist
```

## 4. Pattern Matching and Key Scanning

Now let's dive into one of the most powerful aspects of Redis key space operations: pattern matching.

### The KEYS Command

The `KEYS` command lets you search for keys matching a pattern:

```
KEYS user:*
```

This will return all keys that start with "user:".

Example:

```
> SET user:1000 "John"
OK
> SET user:1001 "Jane"
OK
> SET product:45 "Chair"
OK
> KEYS user:*
1) "user:1000"
2) "user:1001"
```

 **Important warning** : While `KEYS` is useful for debugging, it should **not** be used in production environments with large datasets because it blocks the server while it scans all keys.

### Pattern Matching Syntax

Redis uses glob-style pattern matching with special characters:

* `*` - Matches any sequence of characters
* `?` - Matches any single character
* `[abc]` - Matches any single character in the brackets
* `[^abc]` - Matches any single character not in the brackets
* `[a-z]` - Matches any single character in the range
* `\` - Escapes the next character

Let's see examples of each:

```
> KEYS user:*      # All keys starting with "user:"
> KEYS user:10?0   # Matches user:1000, user:1010, user:1020, etc.
> KEYS user:100[0-9] # Matches user:1000 through user:1009
> KEYS user:[13]000  # Matches user:1000 and user:3000
> KEYS user:[^2]000  # Matches any user:X000 where X is not 2
> KEYS user:\*      # Matches the literal key "user:*"
```

Example in action:

```
> SET user:1000 "John"
OK
> SET user:1001 "Jane"
OK
> SET user:2000 "Bob"
OK
> SET user:3000 "Alice"
OK
> KEYS user:?000
1) "user:1000"
2) "user:2000"
3) "user:3000"
> KEYS user:[13]000
1) "user:1000"
2) "user:3000"
```

### The SCAN Command

As mentioned, `KEYS` blocks the Redis server, which can cause problems in production. The `SCAN` command provides a safer alternative:

```
SCAN 0 MATCH user:* COUNT 10
```

The `SCAN` command returns two items:

1. A cursor position for the next scan
2. A list of keys found in this iteration

Example:

```
> SCAN 0 MATCH user:* COUNT 10
1) "24"  # Cursor for next iteration
2) 1) "user:1000"
   2) "user:1001"

> SCAN 24 MATCH user:* COUNT 10
1) "0"  # 0 indicates scan completed
2) 1) "user:2000"
   2) "user:3000"
```

The `COUNT` argument is a hint for Redis about how many keys to scan in one iteration, but it doesn't guarantee that number of results.

Let's write a simple Redis client code example in Python to demonstrate using `SCAN`:

```python
import redis

r = redis.Redis(host='localhost', port=6379, db=0)

# Add some test keys
for i in range(100):
    r.set(f"user:{i}", f"User {i}")
    r.set(f"product:{i}", f"Product {i}")

# Scan for all user keys using SCAN
cursor = 0
all_user_keys = []

while True:
    cursor, keys = r.scan(cursor=cursor, match="user:*", count=15)
    all_user_keys.extend([key.decode('utf-8') for key in keys])
  
    # If cursor is 0, scan is complete
    if cursor == 0:
        break

print(f"Found {len(all_user_keys)} user keys")
print("Sample keys:", all_user_keys[:5])
```

In this code:

1. We connect to Redis and add some test keys
2. We use SCAN with cursor to iterate through the key space
3. We collect all keys matching our pattern
4. We continue until the cursor returns to 0

This approach is production-safe because it doesn't block the Redis server.

## 5. Practical Applications of Pattern Matching

Let's explore some real-world applications of Redis key space operations and pattern matching:

### Namespacing and Multi-tenancy

In multi-tenant applications, you can prefix keys with tenant IDs:

```
tenant:1:users:1000
tenant:2:users:1000
```

To get all data for tenant 1:

```
KEYS tenant:1:*
```

Or with SCAN (safer):

```python
def get_tenant_keys(tenant_id, pattern="*"):
    cursor = 0
    all_keys = []
  
    while True:
        cursor, keys = r.scan(cursor=cursor, match=f"tenant:{tenant_id}:{pattern}", count=100)
        all_keys.extend([key.decode('utf-8') for key in keys])
      
        if cursor == 0:
            break
          
    return all_keys
```

### Session Management

For web applications handling sessions:

```
# Set session with 30-minute expiration
r.setex(f"session:{session_id}", 1800, session_data)

# Find all sessions for a specific user
user_sessions = []
cursor = 0
while True:
    cursor, keys = r.scan(cursor=cursor, match=f"session:*:user:{user_id}", count=100)
    user_sessions.extend(keys)
    if cursor == 0:
        break
```

### Bulk Operations on Matching Keys

You can perform operations on sets of keys matching patterns:

```python
# Delete all temporary keys
def delete_temp_keys():
    cursor = 0
    deleted_count = 0
  
    while True:
        cursor, keys = r.scan(cursor=cursor, match="temp:*", count=100)
        if keys:
            deleted_count += r.delete(*keys)
      
        if cursor == 0:
            break
          
    return deleted_count
```

## 6. Advanced Pattern Techniques

### Finding Intersections Between Patterns

Sometimes you need to find keys that match multiple patterns:

```python
def find_keys_matching_all_patterns(patterns):
    # Get the first pattern's results
    cursor = 0
    result_keys = set()
    first_pattern = patterns[0]
  
    # Scan for the first pattern
    while True:
        cursor, keys = r.scan(cursor=cursor, match=first_pattern, count=100)
        result_keys.update([key.decode('utf-8') for key in keys])
        if cursor == 0:
            break
  
    # For each additional pattern, filter the results
    for pattern in patterns[1:]:
        cursor = 0
        pattern_keys = set()
      
        while True:
            cursor, keys = r.scan(cursor=cursor, match=pattern, count=100)
            pattern_keys.update([key.decode('utf-8') for key in keys])
            if cursor == 0:
                break
      
        # Keep only keys that match both sets
        result_keys = result_keys.intersection(pattern_keys)
  
    return result_keys
```

Example usage:

```python
# Find active sessions for a specific user
active_sessions = find_keys_matching_all_patterns([
    "session:*",         # All sessions
    "*:user:1000:*"      # For user 1000
])
```

### Implementing Hierarchical Structures

Using pattern matching, you can implement hierarchy-like structures:

```
# Company hierarchy represented as Redis keys
company:dept:engineering:team:backend:member:1000
company:dept:engineering:team:frontend:member:1001
company:dept:marketing:team:content:member:2000
```

To find all members of the engineering department:

```
SCAN 0 MATCH company:dept:engineering:*:member:* COUNT 100
```

To find all teams in the marketing department:

```
SCAN 0 MATCH company:dept:marketing:team:* COUNT 100
```

## 7. Performance Considerations

When working with key space operations, keep these performance tips in mind:

1. **Avoid KEYS in production** : Always prefer SCAN for large datasets
2. **Be specific with patterns** : The more specific your pattern, the faster the scan

```
   # Less efficient
   SCAN 0 MATCH *user* COUNT 100

   # More efficient
   SCAN 0 MATCH user:* COUNT 100
```

1. **Use appropriate COUNT values** : For most applications, values between 100-1000 work well
2. **Consider key distribution** : If using Redis Cluster, keys with the same hash slot can be found more efficiently
3. **Watch memory usage** : Returning very large key sets can consume significant memory

Let's demonstrate pattern efficiency:

```python
import redis
import time

r = redis.Redis(host='localhost', port=6379, db=0)

# Test different pattern specificity
def test_pattern_performance(pattern, description):
    start_time = time.time()
    cursor = 0
    key_count = 0
  
    while True:
        cursor, keys = r.scan(cursor=cursor, match=pattern, count=100)
        key_count += len(keys)
        if cursor == 0:
            break
  
    duration = time.time() - start_time
    print(f"{description}: Found {key_count} keys in {duration:.6f} seconds")

# Run tests
test_pattern_performance("*", "All keys (least specific)")
test_pattern_performance("user:*", "User keys (more specific)")
test_pattern_performance("user:10*", "User 10* keys (most specific)")
```

## 8. Combining with Other Redis Features

### Using Transactions with Pattern Operations

You can use Redis transactions (MULTI/EXEC) with pattern operations:

```python
def rename_keys_in_transaction(pattern, new_prefix, old_prefix):
    pipe = r.pipeline(transaction=True)
  
    # First, find all matching keys
    cursor = 0
    while True:
        cursor, keys = r.scan(cursor=cursor, match=pattern, count=100)
      
        # Queue the rename operations in the transaction
        for key in keys:
            old_key = key.decode('utf-8')
            if old_key.startswith(old_prefix):
                new_key = old_key.replace(old_prefix, new_prefix, 1)
                pipe.rename(old_key, new_key)
      
        if cursor == 0:
            break
  
    # Execute all renames in a single transaction
    results = pipe.execute()
    return len(results)
```

This function renames all keys matching a pattern atomically in a transaction.

### Combining with Pub/Sub

Pattern matching works with Pub/Sub as well:

```python
def notify_key_expiration(prefix):
    # Configure Redis to notify on key expiration
    r.config_set('notify-keyspace-events', 'Ex')
  
    # Subscribe to expiration events for keys with the prefix
    pubsub = r.pubsub()
    pubsub.psubscribe(f"__keyevent@0__:expired")
  
    print(f"Listening for expirations...")
    for message in pubsub.listen():
        if message['type'] == 'pmessage':
            expired_key = message['data'].decode('utf-8')
            if expired_key.startswith(prefix):
                print(f"Key expired: {expired_key}")
```

This code listens for any key expirations and notifies you when a key with your prefix expires.

## 9. Practical Example: Session Management System

Let's put everything together in a comprehensive example - a Redis-based session management system:

```python
import redis
import json
import time
import uuid

class SessionManager:
    def __init__(self, redis_host='localhost', redis_port=6379, db=0):
        self.redis = redis.Redis(host=redis_host, port=redis_port, db=db)
        self.session_prefix = "session:"
        self.default_ttl = 1800  # 30 minutes
  
    def create_session(self, user_id, data=None, ttl=None):
        """Create a new session for a user"""
        session_id = str(uuid.uuid4())
        key = f"{self.session_prefix}{session_id}"
      
        # Session data structure
        session_data = {
            "user_id": user_id,
            "created_at": int(time.time()),
            "last_access": int(time.time()),
            "data": data or {}
        }
      
        # Store in Redis with expiration
        ttl = ttl or self.default_ttl
        self.redis.setex(key, ttl, json.dumps(session_data))
      
        # Also store a reference by user_id for easy lookup
        self.redis.sadd(f"user:{user_id}:sessions", session_id)
      
        return session_id
  
    def get_session(self, session_id, extend_ttl=True):
        """Get session data and optionally extend its TTL"""
        key = f"{self.session_prefix}{session_id}"
      
        # Get session data
        data = self.redis.get(key)
        if not data:
            return None
      
        session_data = json.loads(data)
      
        # Update last access time
        session_data["last_access"] = int(time.time())
      
        # Extend TTL if requested
        if extend_ttl:
            self.redis.setex(key, self.default_ttl, json.dumps(session_data))
      
        return session_data
  
    def delete_session(self, session_id):
        """Delete a session"""
        key = f"{self.session_prefix}{session_id}"
      
        # Get user_id before deleting
        data = self.redis.get(key)
        if data:
            session_data = json.loads(data)
            user_id = session_data.get("user_id")
          
            # Delete session
            self.redis.delete(key)
          
            # Remove from user's session set
            if user_id:
                self.redis.srem(f"user:{user_id}:sessions", session_id)
          
            return True
      
        return False
  
    def get_user_sessions(self, user_id):
        """Get all sessions for a user"""
        session_ids = self.redis.smembers(f"user:{user_id}:sessions")
        sessions = []
      
        for sid in session_ids:
            sid_str = sid.decode('utf-8')
            session_data = self.get_session(sid_str, extend_ttl=False)
            if session_data:
                sessions.append({
                    "session_id": sid_str,
                    "data": session_data
                })
            else:
                # Clean up if session has expired but reference remains
                self.redis.srem(f"user:{user_id}:sessions", sid_str)
      
        return sessions
  
    def delete_all_user_sessions(self, user_id):
        """Delete all sessions for a user"""
        session_ids = self.redis.smembers(f"user:{user_id}:sessions")
      
        # Use a pipeline for better performance
        pipe = self.redis.pipeline()
      
        for sid in session_ids:
            sid_str = sid.decode('utf-8')
            pipe.delete(f"{self.session_prefix}{sid_str}")
      
        # Also delete the set itself
        pipe.delete(f"user:{user_id}:sessions")
      
        pipe.execute()
      
        return len(session_ids)
  
    def cleanup_expired_sessions(self):
        """Clean up any expired session references"""
        cursor = 0
        cleaned = 0
      
        # Find all user:*:sessions keys
        while True:
            cursor, keys = self.redis.scan(cursor=cursor, match="user:*:sessions", count=100)
          
            for key in keys:
                user_key = key.decode('utf-8')
                session_ids = self.redis.smembers(user_key)
              
                for sid in session_ids:
                    sid_str = sid.decode('utf-8')
                    session_key = f"{self.session_prefix}{sid_str}"
                  
                    # If session doesn't exist, remove from set
                    if not self.redis.exists(session_key):
                        self.redis.srem(user_key, sid_str)
                        cleaned += 1
          
            if cursor == 0:
                break
      
        return cleaned
```

This class demonstrates:

1. Creating sessions with automatic TTL
2. Retrieving and extending sessions
3. Managing user-to-session relationships
4. Cleaning up expired sessions
5. Pattern matching for maintenance operations

## 10. Conclusion

Redis key space operations and pattern matching provide powerful tools for managing data in Redis. Let's summarize the key points:

1. **Key Space Fundamentals** :

* Redis organizes data as key-value pairs in the key space
* Keys should follow naming conventions for better organization
* Basic operations include EXISTS, DEL, TYPE, EXPIRE, and TTL

1. **Pattern Matching** :

* KEYS command for debugging (avoid in production)
* SCAN command for production-safe iteration
* Pattern syntax: *, ?, [chars], [^chars], [range]

1. **Practical Applications** :

* Namespacing and multi-tenancy
* Session management
* Hierarchical data structures
* Bulk operations

1. **Performance Considerations** :

* Avoid KEYS in production
* Be specific with patterns
* Use appropriate COUNT values
* Consider key distribution in Redis Cluster

1. **Advanced Techniques** :

* Finding intersections between patterns
* Combining with transactions
* Integration with Pub/Sub

By mastering these concepts, you can efficiently manage and manipulate data in Redis, taking full advantage of its speed and flexibility.
