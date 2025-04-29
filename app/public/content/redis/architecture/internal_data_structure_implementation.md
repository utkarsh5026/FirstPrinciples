# Redis Internal Data Structure Implementation

Let me explain how Redis implements its core data structures from first principles. Redis is a popular in-memory database that's known for its high performance and versatility, and understanding its internal implementation reveals many ingenious techniques that make it so efficient.

## Foundation: Dynamic Strings (SDS)

At the very foundation of Redis is its custom string implementation called Simple Dynamic String (SDS). This is crucial to understand before we explore the higher-level data structures.

### Why Not Regular C Strings?

C strings (null-terminated character arrays) have several limitations:

* They require O(n) time to determine length
* They're prone to buffer overflows during modification
* They're not binary-safe (can't contain null bytes)

### The SDS Structure

Redis implements its own string type with this structure:

```c
struct sdshdr {
    int len;      // String length
    int free;     // Free space available
    char buf[];   // Actual string data
}
```

Let's break down how this works:

1. The `len` field stores the string length, allowing O(1) length retrieval
2. The `free` field tracks unused space in the buffer
3. The `buf` field contains the actual string data, still null-terminated for compatibility

Here's a visual example:

```
Memory layout:
+--------+--------+-----------+---+
| len: 5 | free: 3 | "hello"\0\0\0\0 |
+--------+--------+-----------+---+
```

This simple string implementation brings several advantages:

* O(1) length determination
* No buffer overflow risk during concatenation operations
* Binary safety (can store any binary data)
* Reduced memory reallocations through a reuse strategy

### Example: SDS in Action

When you append to an SDS string, here's what happens:

```c
// Example of appending to an SDS
void appendExample(sds s) {
    printf("Before append: '%s', len=%d, free=%d\n", s, sdslen(s), sdsavail(s));
  
    // Append " world" to "hello"
    s = sdscat(s, " world");
  
    printf("After append: '%s', len=%d, free=%d\n", s, sdslen(s), sdsavail(s));
}
```

If we had "hello" with 3 bytes of free space, we could append " world" (6 bytes) by:

1. Checking if free space (3 bytes) is enough for the append (6 bytes)
2. Since it's not, reallocating with the new required size + some extra
3. Copying " world" to the end of "hello"
4. Updating the len and free fields

## Dictionary Implementation (Hash Tables)

Redis dictionaries (used for Redis hashes and the global key space) use hash tables with separate chaining.

### The Core Dictionary Structure

Redis dictionaries consist of multiple levels:

```c
typedef struct dict {
    dictType *type;    // Function pointers for key manipulation
    void *privdata;    // Private data for type functions
    dictht ht[2];      // Two hash tables for rehashing
    int rehashidx;     // Rehashing index (-1 when no rehashing)
    int iterators;     // Number of active iterators
} dict;
```

The actual hash table structure:

```c
typedef struct dictht {
    dictEntry **table;   // Array of pointers to entries
    unsigned long size;  // Hash table size (power of 2)
    unsigned long sizemask; // Size mask (size-1)
    unsigned long used;    // Number of entries
} dictht;
```

And the dictionary entry:

```c
typedef struct dictEntry {
    void *key;           // Key
    union {              // Value can be different types
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;
    struct dictEntry *next; // Pointer to next entry (for collision)
} dictEntry;
```

### Collision Resolution

When multiple keys hash to the same slot, Redis uses separate chaining - each bucket contains a linked list of entries:

```
Hash table buckets:
[0] -> [key1:val1] -> [key5:val5] -> NULL
[1] -> NULL
[2] -> [key2:val2] -> NULL
[3] -> [key3:val3] -> [key6:val6] -> NULL
[4] -> NULL
[5] -> [key4:val4] -> NULL
...
```

### Incremental Rehashing

One of Redis's clever techniques is how it handles rehashing (resizing the hash table):

1. Allocate a new hash table (ht[1]) twice the size of the old one (ht[0])
2. Set rehashidx to 0
3. **Incrementally** move entries from ht[0] to ht[1] during subsequent operations
4. When rehashing is complete, free ht[0] and make ht[1] the new ht[0]

This prevents blocking operations during rehashing.

```c
// Simplified rehashing step example
int dictRehash(dict *d, int n) {
    if (!dictIsRehashing(d)) return 0;
  
    while(n-- && d->ht[0].used != 0) {
        dictEntry *de, *nextde;
      
        // Find the next non-empty bucket
        while(d->ht[0].table[d->rehashidx] == NULL) d->rehashidx++;
      
        // Move all entries in this bucket to new ht
        de = d->ht[0].table[d->rehashidx];
        while(de) {
            unsigned int h;
            nextde = de->next;
          
            // Calculate new hash slot
            h = dictHashKey(d, de->key) & d->ht[1].sizemask;
          
            // Move entry to new hash table
            de->next = d->ht[1].table[h];
            d->ht[1].table[h] = de;
            d->ht[0].used--;
            d->ht[1].used++;
          
            de = nextde;
        }
      
        // Clear the slot in the old table
        d->ht[0].table[d->rehashidx] = NULL;
        d->rehashidx++;
    }
  
    // Check if rehashing is complete
    if (d->ht[0].used == 0) {
        free(d->ht[0].table);
        d->ht[0] = d->ht[1];
        resetHashTable(&d->ht[1]);
        d->rehashidx = -1;
        return 0;
    }
  
    return 1;
}
```

## Lists: From Linked Lists to QuickLists

Redis lists evolved over time, starting with linked lists, then ziplist (compressed list), and finally to quicklist (a hybrid approach).

### Original Linked List Implementation

Initial Redis versions used a simple doubly-linked list:

```c
typedef struct list {
    listNode *head;
    listNode *tail;
    unsigned long len;
    void *(*dup)(void *ptr);
    void (*free)(void *ptr);
    int (*match)(void *ptr, void *key);
} list;

typedef struct listNode {
    struct listNode *prev;
    struct listNode *next;
    void *value;
} listNode;
```

This provided O(1) push/pop operations but was memory-intensive due to pointers.

### Ziplist: Compact Memory Layout

To solve memory efficiency issues, Redis introduced ziplists - compact, array-like structures that store small lists without pointers:

```
Memory layout:
+--------+--------+---------+-------+-------+---------+--------+
| ZIPLIST| ZIPLIST| ENTRY1  |ENTRY2 |ENTRY3 | ... |ZIPLIST|
| BYTES  | TAIL   | ENCODING|VALUE  |ENCODING|VALUE | END   |
+--------+--------+---------+-------+-------+---------+--------+
```

Each entry in a ziplist is encoded with a special format:

1. A length field (variable size)
2. An optional previous entry length (for backward traversal)
3. The actual data

Ziplist example to store ["hello", "world"]:

```
+-------+-------+-------+-------+-------+-------+-------+
| header| prev  | enc   | "hello"| prev  | enc   | "world"|
| info  | size  | type  |       | size  | type  |       |
+-------+-------+-------+-------+-------+-------+-------+
```

The benefit: dramatic memory savings but with a trade-off of O(n) operations for random access.

### QuickList: Best of Both Worlds

Finally, Redis evolved to QuickList, which combines the benefits of both approaches:

```c
typedef struct quicklist {
    quicklistNode *head;
    quicklistNode *tail;
    unsigned long count;     // Total element count
    unsigned long len;       // Number of quicklistNodes
    int fill : 16;           // Fill factor for ziplist size
    unsigned int compress : 16; // Compression depth
} quicklist;

typedef struct quicklistNode {
    struct quicklistNode *prev;
    struct quicklistNode *next;
    unsigned char *zl;       // Ziplist for this node
    unsigned int sz;         // Ziplist size in bytes
    unsigned int count : 16; // Count of items in ziplist
    unsigned int encoding : 2; // RAW or LZF compression
    unsigned int container : 2; // ZIPLIST or LINKEDLIST
    unsigned int recompress : 1; // Was this node prev compressed?
    unsigned int attempted_compress : 1; // Attempted compression?
    unsigned int extra : 10; // Extra unused bits
} quicklistNode;
```

In a QuickList:

1. The overall structure is a linked list
2. Each node contains a ziplist, not a single value
3. This balances memory efficiency with performance

Visual example of a QuickList:

```
QuickList:
[head] -> [Node1] -> [Node2] -> [Node3] -> [tail]
           |          |          |
           v          v          v
        [ziplist1]  [ziplist2]  [ziplist3]
```

This provides efficient memory use while still allowing O(1) operations for push/pop from ends.

## Sets: Hash Tables vs. Intsets

Redis implements sets using either hash tables or a specialized structure called intset.

### Hash Table Implementation

For general sets, Redis uses the dictionary implementation described earlier, with nulls for values:

```
Key: member1, Value: NULL
Key: member2, Value: NULL
Key: member3, Value: NULL
```

Operations like SADD, SISMEMBER, and SREM are O(1) average time.

### Intset: Specialized for Integer Sets

When a set contains only integers, Redis optimizes using a compact intset structure:

```c
typedef struct intset {
    uint32_t encoding;   // Element encoding (16/32/64 bit)
    uint32_t length;     // Number of elements
    int8_t contents[];   // Array of integers
} intset;
```

The encoding field determines the size of each integer:

* INTSET_ENC_INT16: 16-bit integers
* INTSET_ENC_INT32: 32-bit integers
* INTSET_ENC_INT64: 64-bit integers

The contents are always sorted, allowing binary search for O(log n) lookups:

```c
// Example of looking up a value in an intset
uint8_t intsetFind(intset *is, int64_t value) {
    uint32_t i;
  
    // Out of range? Not found.
    if (value < intsetMin(is) || value > intsetMax(is))
        return 0;
      
    // Binary search
    i = intsetSearch(is, value, NULL);
    if (i < intsetLen(is) && intsetGetEncoded(is, i, value->encoding) == value)
        return 1;
    return 0;
}
```

If a value falls outside the current encoding range, Redis upgrades the entire intset:

```c
// Example: When adding a value that exceeds current encoding
intset *intsetUpgradeAndAdd(intset *is, int64_t value) {
    uint8_t curenc = intrev32ifbe(is->encoding);
    uint8_t newenc = _intsetValueEncoding(value);
    int length = intrev32ifbe(is->length);
  
    // Upgrade from curenc to newenc
    // Move all existing elements to new positions
    // Insert the new value
    // ...
}
```

## Sorted Sets: Skip Lists + Hash Tables

Redis sorted sets (ZSETs) are one of the most complex data structures, combining:

1. A hash table for O(1) element lookups
2. A skip list for ordered operations

### Hash Table Component

The hash table maps members to scores:

```
HashMap:
"member1" -> score1
"member2" -> score2
"member3" -> score3
```

### Skip List Component

The skip list provides ordered access:

```c
typedef struct zskiplist {
    struct zskiplistNode *header, *tail;
    unsigned long length;
    int level;
} zskiplist;

typedef struct zskiplistNode {
    sds ele;               // Member
    double score;          // Score
    struct zskiplistNode *backward;  // Previous node
    struct zskiplistLevel {
        struct zskiplistNode *forward; // Next node at this level
        unsigned int span;             // Number of nodes skipped
    } level[];
} zskiplistNode;
```

A skip list is a probabilistic data structure where each node has multiple "levels" of forward pointers:

```
Level 3:  [head] ----------------------------> [node4] -------> [tail]
Level 2:  [head] ------------> [node2] ------> [node4] -------> [tail]
Level 1:  [head] --> [node1] -> [node2] ------> [node4] -------> [tail]
Level 0:  [head] --> [node1] -> [node2] -> [node3] -> [node4] -> [tail]
                     score1    score2     score3     score4
```

This provides O(log n) time for ordered operations like ZRANGE.

## HyperLogLog: Probabilistic Counting

HyperLogLog is a probabilistic algorithm for counting unique elements efficiently:

```c
struct hllhdr {
    char magic[4];      // "HYLL"
    uint8_t encoding;   // HLL_DENSE or HLL_SPARSE
    uint8_t notused[3]; // Reserved
    uint8_t card[8];    // Cached cardinality
    uint8_t registers[]; // The actual registers
};
```

The key concepts:

1. Hash each element to generate a bit pattern
2. Observe the position of the leftmost 1-bit
3. Use statistical methods to estimate cardinality

For example, if we want to count unique visitors to a website:

```
visitor1 hash -> 0010110... (first 1 at position 3)
visitor2 hash -> 0000101... (first 1 at position 4)
visitor3 hash -> 1001010... (first 1 at position 1)
```

The registers would store these "first 1" positions. Then, through mathematical formulas, we can estimate the unique count within about 2% error while using only a tiny fraction of memory compared to storing each element.

## Streams: Radix Tree + Listpacks

Redis Streams (added in Redis 5.0) use a combination of:

1. A radix tree for indexing by ID
2. Listpacks for storing message data

### Listpack Structure

Listpacks are similar to ziplists but with improvements:

```
Memory layout:
+------+-------+-------+-------+-----+------+
| total| num   | entry1| entry2| ... | end  |
| bytes| elems |       |       |     | byte |
+------+-------+-------+-------+-----+------+
```

### Radix Tree for ID Indexing

The radix tree maps stream IDs to listpacks:

```
Radix Tree:
          [root]
         /      \
   [1630000]    [1630001]
      /            \
[1630000000]    [1630001000]
     |              |
  [listpack1]    [listpack2]
```

Each listpack contains a batch of messages with consecutive IDs, making range queries efficient.

## Code Example: Using Redis Data Structures

Let's look at a complete but simplified example of how Redis might process a hash operation:

```c
// Process a HSET command
void hsetCommand(client *c) {
    robj *o;
  
    // Try to get the hash object
    if ((o = lookupKeyWrite(c->db, c->argv[1])) == NULL) {
        // Key doesn't exist, create a new hash
        o = createHashObject();
        dbAdd(c->db, c->argv[1], o);
    } else {
        // Ensure it's a hash
        if (o->type != OBJ_HASH) {
            addReply(c, shared.wrongtypeerr);
            return;
        }
    }
  
    // Get field and value from arguments
    robj *field = c->argv[2];
    robj *value = c->argv[3];
  
    // Try to store the value
    int update = hashTypeSet(o, field, value);
  
    // Send reply
    addReply(c, update ? shared.czero : shared.cone);
  
    // Signal that the key was modified
    signalModifiedKey(c->db, c->argv[1]);
    notifyKeyspaceEvent(NOTIFY_HASH, "hset", c->argv[1], c->db->id);
    server.dirty++; // For replication/persistence
}
```

The `hashTypeSet` function would then handle the actual storage, using either ziplist or dict based on configuration and data size.

## Redis Object System

All these data structures are wrapped in a common object system:

```c
typedef struct redisObject {
    unsigned type:4;      // Type (STRING, LIST, SET, etc.)
    unsigned encoding:4;  // Encoding (how it's stored)
    unsigned lru:24;      // LRU time or LFU counter
    int refcount;         // Reference count for GC
    void *ptr;            // Points to actual data structure
} robj;
```

This allows Redis to:

1. Reference count objects for memory management
2. Select appropriate encodings based on data size
3. Track object usage for eviction policies

## Summary

Redis's extraordinary performance comes from its carefully designed data structures:

1. **SDS (Simple Dynamic String)** : Efficient string handling with length caching
2. **Dictionary** : Hash tables with incremental rehashing
3. **Lists** : QuickList combining linked lists and ziplists for balanced performance
4. **Sets** : Hash tables or intsets depending on content
5. **Sorted Sets** : Skip lists plus hash tables for both ordered and random access
6. **HyperLogLog** : Probabilistic counting with minimal memory usage
7. **Streams** : Radix trees with listpacks for time-series data

Each structure represents careful engineering tradeoffs between:

* Memory efficiency
* Operation performance
* Implementation complexity

Understanding these data structures provides deep insight into efficient in-memory database design principles that can be applied to many different systems.
