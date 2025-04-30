# Redis and LRU/LFU Cache Policies: From First Principles

I'll explain Redis and its LRU/LFU cache eviction policies from fundamental principles, starting with the basics and building up to the implementation details. Let's begin with understanding what caching is and why it matters.

## What is Caching?

At its most fundamental level, caching is about storing frequently accessed data in a location that provides faster access than the original source. It's a technique used throughout computing to improve performance.

Imagine you're cooking in a kitchen. You could keep all ingredients in the pantry (your main storage), but you'll work much faster if you place the ingredients you use most frequently on the countertop within arm's reach. This is essentially what caching does in computing systems.

## Memory Hierarchy and Why Caching Matters

Computers operate with a memory hierarchy:

* CPU registers (fastest, tiny capacity)
* CPU cache (very fast, small capacity)
* Main memory (RAM) (fast, medium capacity)
* Disk storage (slow, large capacity)
* Network storage (very slow, massive capacity)

Each time we move down this hierarchy, we get more storage capacity but slower access times. The difference in speed can be enormous:

* CPU cache access: nanoseconds
* RAM access: tens to hundreds of nanoseconds
* Disk access: milliseconds (1,000,000+ times slower than cache)
* Network access: tens to hundreds of milliseconds

This is why caching is crucial: it places frequently used data higher in the memory hierarchy, dramatically reducing access times.

## What is Redis?

Redis (Remote Dictionary Server) is an in-memory data structure store that can be used as a database, cache, message broker, and more. At its most basic, Redis works by storing data in memory (RAM) rather than on disk, making it extremely fast.

Redis is fundamentally:

1. In-memory: All data is stored in RAM for incredibly fast access
2. Key-value oriented: Data is accessed via keys
3. Versatile: Supports various data structures like strings, hashes, lists, sets, etc.

Let's visualize Redis with a simple example:

```
Key: "user:1001"  →  Value: "{"name":"John", "email":"john@example.com"}"
Key: "product:53" →  Value: "{"name":"Keyboard", "price":59.99}"
```

When used as a cache, Redis sits between your application and your primary database:

```
Application → Redis Cache → Primary Database
```

The application first checks Redis for data. If found (a "cache hit"), the data is returned immediately. If not found (a "cache miss"), the application retrieves it from the primary database, then usually stores it in Redis for future access.

## The Cache Eviction Problem

Since Redis stores data in memory (RAM), and memory is limited, a fundamental problem emerges: what happens when memory fills up? This is where cache eviction policies come in.

A cache eviction policy determines which items to remove when the cache reaches capacity. It's crucial because the effectiveness of your cache depends significantly on which items you keep and which you discard.

Two popular eviction policies in Redis are:

1. LRU (Least Recently Used)
2. LFU (Least Frequently Used)

Let's understand each from first principles.

## Least Recently Used (LRU) Cache

The LRU policy is based on a simple principle: if you haven't used something recently, you probably won't need it again soon.

Imagine your desk can only hold 5 books. Each time you read a book, you place it on top of the pile. When you need to add a new book but the desk is full, you remove the book at the bottom of the pile (the one you haven't touched in the longest time).

### LRU Example

Let's say we have a cache with capacity 3, and we access keys in this order: A, B, C, A, D.

Starting with an empty cache:

1. Access A: Cache = [A]
2. Access B: Cache = [B, A] (B is most recent)
3. Access C: Cache = [C, B, A] (C is most recent)
4. Access A: Cache = [A, C, B] (A is moved to most recent position)
5. Access D: Cache = [D, A, C] (B is evicted as least recently used)

### Simple LRU Implementation in Code

Here's a simplified version of how LRU could be implemented:

```python
class LRUCache:
    def __init__(self, capacity):
        # Initialize the cache with a maximum capacity
        self.capacity = capacity
        # Use OrderedDict to maintain insertion order
        self.cache = OrderedDict()
  
    def get(self, key):
        # If key isn't in cache, return None (cache miss)
        if key not in self.cache:
            return None
      
        # Move the key to the end (most recently used position)
        value = self.cache.pop(key)
        self.cache[key] = value
        return value
  
    def put(self, key, value):
        # If key already exists, remove it first
        if key in self.cache:
            self.cache.pop(key)
      
        # If cache is full, remove the least recently used item (first item)
        elif len(self.cache) >= self.capacity:
            # popitem(last=False) removes the first item (oldest)
            self.cache.popitem(last=False)
      
        # Add the new key-value pair (most recently used)
        self.cache[key] = value
```

This implementation uses an OrderedDict to maintain the order of items. When a key is accessed, it's moved to the end of the OrderedDict, representing the "most recently used" position.

## Least Frequently Used (LFU) Cache

The LFU policy is based on a different principle: items that are accessed frequently are more likely to be accessed again in the future.

Think of your bookshelf where you place the most frequently read books at eye level and the rarely read ones on the bottom shelf. When you need space for a new book, you remove the one you've read the fewest times.

### LFU Example

Let's say we have a cache with capacity 3, and we access keys in this order: A, B, C, A, A, B, D.

Start with an empty cache, and count accesses:

1. Access A: Cache = [A(1)]
2. Access B: Cache = [A(1), B(1)]
3. Access C: Cache = [A(1), B(1), C(1)]
4. Access A: Cache = [A(2), B(1), C(1)] (A's frequency increases)
5. Access A: Cache = [A(3), B(1), C(1)] (A's frequency increases)
6. Access B: Cache = [A(3), B(2), C(1)] (B's frequency increases)
7. Access D: Cache = [A(3), B(2), D(1)] (C is evicted as least frequently used)

### Simple LFU Implementation in Code

Here's a simplified implementation of LFU:

```python
class LFUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}  # key -> value
        self.key_freq = {}  # key -> frequency
        self.freq_keys = defaultdict(OrderedDict)  # frequency -> OrderedDict of keys
        self.min_freq = 0  # Track minimum frequency
  
    def get(self, key):
        if key not in self.cache:
            return None
      
        # Get current frequency and update it
        old_freq = self.key_freq[key]
        new_freq = old_freq + 1
      
        # Update key's frequency
        self.key_freq[key] = new_freq
      
        # Remove key from its current frequency list
        self.freq_keys[old_freq].pop(key)
      
        # If old_freq list is empty and it was the min_freq, increment min_freq
        if not self.freq_keys[old_freq] and old_freq == self.min_freq:
            self.min_freq = new_freq
      
        # Add key to the new frequency list
        self.freq_keys[new_freq][key] = None
      
        return self.cache[key]
  
    def put(self, key, value):
        # Don't allow zero-capacity caches
        if self.capacity == 0:
            return
      
        # If key exists, update its value and frequency
        if key in self.cache:
            self.cache[key] = value
            self.get(key)  # The get method will update frequencies
            return
      
        # If cache is full, evict the least frequent item
        if len(self.cache) >= self.capacity:
            # Get the first key from the min_freq list (least recently used among least frequent)
            evict_key, _ = self.freq_keys[self.min_freq].popitem(last=False)
            del self.cache[evict_key]
            del self.key_freq[evict_key]
      
        # Add the new key with frequency 1
        self.cache[key] = value
        self.key_freq[key] = 1
        self.freq_keys[1][key] = None
        self.min_freq = 1  # New keys start with the lowest possible frequency
```

This implementation is more complex because it needs to track both the frequency of access and, within each frequency group, the order of access (to break ties).

## How Redis Implements LRU and LFU

Redis doesn't implement these policies exactly as shown above but uses approximations for efficiency. Let's look at how Redis actually implements these policies.

### Redis LRU Implementation

Redis doesn't track the exact order of access for all keys, as that would be expensive. Instead, it uses a sampling approach:

1. Redis maintains a 24-bit clock that increments every 1 million operations.
2. When a key is accessed, Redis updates its "last accessed time" to the current clock value.
3. When eviction is needed, Redis samples a small number of keys (configured by the `maxmemory-samples` parameter) and evicts the one with the oldest access time.

This approximation works well in practice while being much more efficient than tracking exact access order.

Example Redis configuration for LRU:

```
maxmemory 100mb
maxmemory-policy allkeys-lru
maxmemory-samples 5
```

The `maxmemory-samples` parameter is crucial: higher values give better approximation of true LRU but use more CPU.

### Redis LFU Implementation

Redis introduced LFU in version 4.0 as an improvement over LRU. Redis's LFU implementation:

1. Uses 8 bits for the counter (frequency) and 16 bits for the decay time
2. Implements a logarithmic counter that gives more weight to recent accesses
3. Includes a decay factor that reduces counters over time, so temporary popularity doesn't permanently affect eviction

Redis LFU has two tuning parameters:

* `lfu-log-factor`: Controls how quickly counter increases (default 10)
* `lfu-decay-time`: Minutes for counter to decay by half when key isn't accessed (default 1)

Example Redis configuration for LFU:

```
maxmemory 100mb
maxmemory-policy allkeys-lfu
maxmemory-samples 5
lfu-log-factor 10
lfu-decay-time 1
```

### Redis Eviction Policy Options

Redis offers several eviction policies, configured with the `maxmemory-policy` directive:

* `noeviction`: Return errors when memory limit is reached
* `allkeys-lru`: Evict any key using LRU
* `volatile-lru`: Evict keys with expiration set using LRU
* `allkeys-random`: Evict random keys
* `volatile-random`: Evict keys with expiration set randomly
* `volatile-ttl`: Evict keys with expiration set, starting with shortest TTL
* `allkeys-lfu`: Evict any key using LFU (Redis 4.0+)
* `volatile-lfu`: Evict keys with expiration set using LFU (Redis 4.0+)

## Implementing a Redis-like LRU/LFU Cache in Code

Let's create a simplified Redis-like cache implementation that supports both LRU and LFU eviction policies:

```python
import time
from collections import defaultdict, OrderedDict

class RedisLikeCache:
    # Eviction policy constants
    LRU = "lru"
    LFU = "lfu"
  
    def __init__(self, capacity=100, policy=LRU, samples=5):
        self.capacity = capacity
        self.policy = policy
        self.samples = samples  # For approximate eviction
      
        # Shared storage
        self.data = {}  # Main data storage: key -> value
      
        # LRU specific structures
        self.lru_clock = 0
        self.lru_access_time = {}  # key -> access time
      
        # LFU specific structures
        self.lfu_counter = {}  # key -> access counter
        self.lfu_decay_time = 1  # Minutes until counter is halved
        self.lfu_last_decay_time = time.time()
  
    def _maybe_decay_counters(self):
        """Decay LFU counters based on elapsed time"""
        now = time.time()
        # Convert decay_time from minutes to seconds
        elapsed_min = (now - self.lfu_last_decay_time) / 60
      
        # If enough time has passed
        if elapsed_min >= self.lfu_decay_time:
            decay_factor = 0.5 ** (elapsed_min / self.lfu_decay_time)
            for key in self.lfu_counter:
                self.lfu_counter[key] *= decay_factor
          
            self.lfu_last_decay_time = now
  
    def _update_lru(self, key):
        """Update LRU metadata for a key"""
        self.lru_clock += 1
        self.lru_access_time[key] = self.lru_clock
  
    def _update_lfu(self, key):
        """Update LFU metadata for a key"""
        self._maybe_decay_counters()
        self.lfu_counter.setdefault(key, 0)
        self.lfu_counter[key] += 1
  
    def _evict(self):
        """Evict a key based on the configured policy"""
        if len(self.data) == 0:
            return
      
        # Select random sample of keys for eviction consideration
        import random
        sample_keys = random.sample(list(self.data.keys()), 
                                   min(self.samples, len(self.data)))
      
        if self.policy == self.LRU:
            # Find key with oldest access time
            evict_key = min(sample_keys, 
                           key=lambda k: self.lru_access_time.get(k, 0))
        else:  # LFU
            # Find key with lowest frequency
            evict_key = min(sample_keys, 
                           key=lambda k: self.lfu_counter.get(k, 0))
      
        # Remove the selected key
        self._remove(evict_key)
  
    def _remove(self, key):
        """Remove a key and its metadata"""
        if key in self.data:
            del self.data[key]
          
            # Clean up metadata
            if key in self.lru_access_time:
                del self.lru_access_time[key]
            if key in self.lfu_counter:
                del self.lfu_counter[key]
  
    def get(self, key):
        """Get a value, updating access metadata"""
        if key not in self.data:
            return None
      
        # Update policy-specific metadata
        if self.policy == self.LRU:
            self._update_lru(key)
        else:  # LFU
            self._update_lfu(key)
      
        return self.data[key]
  
    def set(self, key, value):
        """Set a key-value pair, evicting if necessary"""
        # If key exists, update it
        if key in self.data:
            self.data[key] = value
            # Update access metadata
            if self.policy == self.LRU:
                self._update_lru(key)
            else:  # LFU
                self._update_lfu(key)
            return
      
        # If at capacity, evict
        if len(self.data) >= self.capacity:
            self._evict()
      
        # Add the new item
        self.data[key] = value
      
        # Initialize metadata
        if self.policy == self.LRU:
            self._update_lru(key)
        else:  # LFU
            self._update_lfu(key)
```

This implementation includes:

1. Support for both LRU and LFU policies
2. Sampling approach similar to Redis
3. Counter decay for LFU, similar to Redis
4. Basic get/set operations

Let's demonstrate how to use this cache:

```python
# Create an LRU cache with capacity 5
lru_cache = RedisLikeCache(capacity=5, policy=RedisLikeCache.LRU)

# Add some items
for i in range(1, 6):
    lru_cache.set(f"key{i}", f"value{i}")

# Access key1 to make it most recently used
lru_cache.get("key1")

# Add a new key, should evict key2 (least recently used)
lru_cache.set("key6", "value6")

# Check what's in the cache
print("Keys in LRU cache:", list(lru_cache.data.keys()))

# Create an LFU cache with capacity 5
lfu_cache = RedisLikeCache(capacity=5, policy=RedisLikeCache.LFU)

# Add some items
for i in range(1, 6):
    lfu_cache.set(f"key{i}", f"value{i}")

# Access key1 multiple times to increase its frequency
for _ in range(5):
    lfu_cache.get("key1")

# Access key2 a couple times
for _ in range(2):
    lfu_cache.get("key2")

# Add a new key, should evict key3, key4, or key5 (least frequently used)
lfu_cache.set("key6", "value6")

# Check what's in the cache
print("Keys in LFU cache:", list(lfu_cache.data.keys()))
```

## Practical Considerations for Redis Caching

When implementing Redis as a cache with LRU/LFU policies, consider these practical aspects:

### 1. Memory Configuration

Setting the right `maxmemory` is crucial. Too small, and your cache might evict useful data too quickly. Too large, and you risk memory pressure on your server.

Example Redis configuration:

```
maxmemory 1gb
maxmemory-policy allkeys-lfu
```

### 2. Monitoring Eviction

Redis provides metrics to track eviction activity:

* `evicted_keys`: Total number of keys evicted due to maxmemory
* `keyspace_hits`: Cache hits
* `keyspace_misses`: Cache misses

A high eviction rate might indicate you need more memory or should adjust your policy.

### 3. Key Expiration vs. Eviction

Redis offers two ways to manage cache lifetime:

* **Expiration** : Keys auto-delete after a set time (`EXPIRE` command)
* **Eviction** : Keys are removed when memory is full based on policy

Using both together often makes sense:

```
SET user:profile:1001 "{...}" EX 3600  # Expire after 1 hour
```

### 4. Policy Selection

* Use **LRU** when recency matters most (e.g., session data, user profiles)
* Use **LFU** when frequency patterns are more stable (e.g., product catalogs, configuration data)

### 5. Tuning LFU Parameters

LFU's adaptability comes from its tuning parameters:

* Increase `lfu-log-factor` to count more slowly (range: 0-100)
* Adjust `lfu-decay-time` based on access patterns (minutes, default: 1)

Example configuration tuning:

```
# For slow-changing frequency patterns
lfu-log-factor 20
lfu-decay-time 10
```

## Conclusion

Redis's LRU and LFU cache eviction policies provide powerful tools for managing memory in high-performance applications. From first principles:

1. **Caching** stores frequently accessed data in faster memory to improve performance.
2. **Redis** excels as a cache due to its in-memory nature and versatile data structures.
3. **LRU (Least Recently Used)** evicts items that haven't been accessed in the longest time, optimizing for recency.
4. **LFU (Least Frequently Used)** evicts items that are accessed least often, optimizing for frequency.
5. Redis implements approximations of these algorithms for efficiency, using sampling and, in LFU's case, counter decay.

Understanding the mechanics and tradeoffs of these policies helps in selecting and tuning the right approach for your specific caching needs. The right choice depends on your access patterns, data characteristics, and performance requirements.

Would you like me to go deeper into any specific aspect of Redis caching or the implementation of these eviction policies?
