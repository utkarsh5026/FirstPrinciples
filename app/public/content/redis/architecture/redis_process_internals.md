# Redis Process Internals: A First Principles Explanation

I'll explain Redis process internals from the ground up, building each concept methodically to give you a comprehensive understanding of how Redis works under the hood.

## 1. What is Redis at its Core?

At its most fundamental level, Redis (Remote Dictionary Server) is an in-memory data structure store that operates as a key-value database. Let's break this down:

 **In-memory** : Unlike traditional databases that store data on disk, Redis keeps its entire dataset in RAM. This is the first critical insight - Redis prioritizes speed by avoiding slow disk I/O operations during normal operation.

 **Data structure store** : Redis isn't just a simple key-value store; it implements various data structures that can be manipulated with specialized commands.

To understand Redis process internals, we need to start with its foundation - a single-threaded event loop model.

## 2. The Event Loop: Redis's Heart

Redis primarily operates on a single-threaded event loop, meaning it processes one command at a time. This design choice might seem counterintuitive in our multi-core world, but it eliminates complex concurrency issues like race conditions and the need for locks.

Let's visualize the event loop:

```c
void main() {
    // Initialize server configuration
    initServerConfig();
  
    // Set up data structures
    initServer();
  
    // The main event loop
    while(!server.shutdown_asap) {
        // Process events (client connections, timers, etc.)
        aeProcessEvents(server.el, AE_ALL_EVENTS|AE_CALL_AFTER_SLEEP);
      
        // Background operations that don't interfere with the main thread
        handleBackgroundOperations();
    }
  
    // Clean up when shutting down
    cleanupAndExit();
}
```

This simplified pseudocode represents Redis's main process. The core is the `aeProcessEvents()` function - this is where Redis spends most of its time, processing incoming commands and responses.

### How the Event Loop Works

When a client connects to Redis, the connection is registered with the event loop. When that client sends a command:

1. The event loop detects the event (data available to read)
2. Redis reads the command from the client socket
3. The command is parsed and executed
4. A response is generated and queued for sending
5. The event loop eventually sends the response back to the client

All of this happens sequentially, one command at a time, which is why Redis is often described as "single-threaded."

## 3. Memory Management

Since Redis is an in-memory database, memory management is critical to its operation.

### Redis Memory Allocator

Redis uses a custom memory allocator called jemalloc (originally) or more recently has options for other allocators. This isn't a random choice - jemalloc is designed to reduce fragmentation, which is crucial for long-running processes that repeatedly allocate and free memory of different sizes.

Let's look at a simplified example of how Redis allocates memory:

```c
void *zmalloc(size_t size) {
    void *ptr = malloc(size + PREFIX_SIZE);
    if (!ptr) oom("zmalloc");
  
    // Keep track of allocated memory
    *((size_t*)ptr) = size;
    update_zmalloc_stat_alloc(size + PREFIX_SIZE);
  
    return (char*)ptr + PREFIX_SIZE;
}
```

This function wraps standard `malloc` but adds important functionality:

* It tracks the size of each allocation (stored in PREFIX_SIZE bytes)
* It updates global statistics on memory usage
* It detects out-of-memory conditions

When memory is freed, Redis also updates these statistics:

```c
void zfree(void *ptr) {
    if (ptr == NULL) return;
  
    // Get original pointer and size
    void *realptr = (char*)ptr - PREFIX_SIZE;
    size_t oldsize = *((size_t*)realptr);
  
    // Update memory usage statistics
    update_zmalloc_stat_free(oldsize + PREFIX_SIZE);
  
    free(realptr);
}
```

### Memory Management Policies

Redis offers several memory policies when it approaches its configured memory limit:

* **noeviction** : Return errors when memory limit is reached
* **allkeys-lru** : Evict less recently used keys
* **volatile-lru** : Evict less recently used keys but only those with an expiration set
* **allkeys-random** : Randomly evict keys
* **volatile-random** : Randomly evict keys with an expiration set
* **volatile-ttl** : Evict keys with shortest time-to-live

The LRU (Least Recently Used) implementation in Redis is actually an approximation to save memory. Rather than tracking every key access, Redis samples a small subset of keys and evicts the least recently used among that sample.

## 4. Data Structures

Redis's versatility comes from its support for various data structures. Let's examine the key ones from first principles:

### Strings

The simplest data type in Redis is the string. Internally, Redis uses a structure called Simple Dynamic String (SDS) rather than C strings.

```c
struct sdshdr {
    uint32_t len;        // String length
    uint32_t free;       // Free space in buffer
    char buf[];          // Actual string data
};
```

This structure provides several advantages over regular C strings:

* O(1) length operations (no need to scan the entire string)
* Binary safety (can contain any data, including null bytes)
* Reduced memory reallocations by pre-allocating extra space
* No buffer overflow vulnerabilities when appending to strings

For example, when appending to an SDS:

```c
sds sdscatlen(sds s, const void *t, size_t len) {
    struct sdshdr *sh = (void*) (s-(sizeof(struct sdshdr)));
  
    // Check if we need to reallocate
    if (sh->free < len) {
        s = sdsMakeRoomFor(s, len);
        sh = (void*) (s-(sizeof(struct sdshdr)));
    }
  
    // Copy the new data
    memcpy(s+sh->len, t, len);
  
    // Update length and free space
    sh->len += len;
    sh->free -= len;
  
    // Terminate string
    s[sh->len] = '\0';
  
    return s;
}
```

This function intelligently manages memory by:

1. Checking if existing free space is sufficient for the append operation
2. Reallocating with extra space if needed
3. Copying the new data and updating metadata

### Lists

Redis lists are implemented as linked lists, specifically as doubly linked lists. This allows for efficient insertion at both ends (LPUSH and RPUSH operations).

```c
typedef struct listNode {
    struct listNode *prev;
    struct listNode *next;
    void *value;
} listNode;

typedef struct list {
    listNode *head;
    listNode *tail;
    unsigned long len;
    void *(*dup)(void *ptr);
    void (*free)(void *ptr);
    int (*match)(void *ptr, void *key);
} list;
```

This data structure allows O(1) operations for adding or removing elements from the beginning or end of the list, but O(N) for accessing elements in the middle.

### Hash Tables

Hash tables underlie several Redis data structures, most importantly the main dictionary that holds all keys. A Redis hash table looks something like this:

```c
typedef struct dictht {
    dictEntry **table;
    unsigned long size;
    unsigned long sizemask;
    unsigned long used;
} dictht;

typedef struct dictEntry {
    void *key;
    union {
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;
    struct dictEntry *next;
} dictEntry;
```

The hash table contains an array of pointers to dictEntry structures. Each entry contains a key, a value (which can be of different types), and a pointer to the next entry to handle collisions (when different keys hash to the same slot).

Redis uses a technique called incremental rehashing to resize hash tables without blocking:

```c
int dictRehash(dict *d, int n) {
    if (!dictIsRehashing(d)) return 0;
  
    while(n-- && d->ht[0].used != 0) {
        dictEntry *de, *nextde;
      
        // Find the next non-empty bucket
        while(d->rehashidx < d->ht[0].size && 
              d->ht[0].table[d->rehashidx] == NULL) d->rehashidx++;
      
        // Move all entries in this bucket to the new hash table
        de = d->ht[0].table[d->rehashidx];
        while(de) {
            unsigned int h;
          
            nextde = de->next;
          
            // Get index in the new hash table
            h = dictHashKey(d, de->key) & d->ht[1].sizemask;
          
            // Insert at the head of the list
            de->next = d->ht[1].table[h];
            d->ht[1].table[h] = de;
          
            d->ht[0].used--;
            d->ht[1].used++;
          
            de = nextde;
        }
      
        d->ht[0].table[d->rehashidx] = NULL;
        d->rehashidx++;
    }
  
    // Check if rehashing is complete
    if (d->ht[0].used == 0) {
        free(d->ht[0].table);
        d->ht[0] = d->ht[1];
        _dictReset(&d->ht[1]);
        d->rehashidx = -1;
        return 0;
    }
  
    return 1;
}
```

This function:

1. Moves entries from the old hash table to a new one, a few at a time
2. Each time it's called, it moves a small number of keys
3. This distributes the rehashing work across many commands, avoiding large latency spikes

## 5. Persistence Mechanisms

Although Redis is primarily an in-memory database, it needs persistence to survive restarts. It offers two main persistence mechanisms:

### RDB (Redis Database Backup)

RDB creates point-in-time snapshots of the dataset. Here's how it works:

1. Redis forks a child process
2. The child process writes the entire dataset to a temporary file
3. When complete, the child replaces the old RDB file with the new one
4. The parent process continues serving clients throughout this process

The forking step is crucial - it utilizes the copy-on-write mechanism of modern operating systems. Initially, the parent and child share the same memory pages. Only when the parent modifies data do the affected pages get duplicated.

```c
int rdbSave(char *filename) {
    FILE *fp;
    char tmpfile[256];
    pid_t childpid;
  
    // Create temporary filename
    snprintf(tmpfile, 256, "temp-%d.rdb", (int) getpid());
  
    // Fork a child process
    if ((childpid = fork()) == 0) {
        // Child process
      
        // Open the temporary file
        fp = fopen(tmpfile, "w");
        if (!fp) {
            exit(1);
        }
      
        // Save dataset to file
        if (saveDatasetToFile(fp) == REDIS_OK) {
            // Successfully saved, replace the old file
            if (rename(tmpfile, filename) == -1) {
                exit(1);
            }
            exit(0);
        } else {
            // Error saving dataset
            exit(1);
        }
    } else {
        // Parent process
        // Wait for child to complete
        int status;
        waitpid(childpid, &status, 0);
      
        return (WEXITSTATUS(status) == 0) ? REDIS_OK : REDIS_ERR;
    }
  
    return REDIS_OK;
}
```

### AOF (Append Only File)

AOF works differently, logging every write operation that changes the dataset:

1. Every command that modifies data is logged to the AOF file
2. The file can be configured to fsync after every command, every second, or let the OS decide
3. When the AOF gets too large, Redis can automatically rewrite it to make it smaller

```c
void feedAppendOnlyFile(struct redisCommand *cmd, int dictid, robj **argv, int argc) {
    sds buf = sdsempty();
  
    // Construct the command in the Redis protocol format
    buf = catAppendOnlyGenericCommand(buf, argc, argv);
  
    // Append to the AOF buffer
    server.aof_buf = sdscatlen(server.aof_buf, buf, sdslen(buf));
  
    // Free the temporary buffer
    sdsfree(buf);
}
```

The AOF rewrite process is similar to RDB - it forks a child process that creates a new AOF from the current dataset. Additionally, any new commands that arrive during this process are both executed and appended to a temporary buffer, which is then merged with the new AOF file when the child completes.

## 6. Master-Replica Replication

Redis supports master-replica replication where one Redis instance (the master) sends updates to multiple replicas:

1. Replicas connect to the master
2. Initial synchronization occurs (full or partial)
3. The master sends all write commands to connected replicas

Here's a simplified view of how a replica initiates replication:

```c
void replicationCacheMaster(client *c) {
    server.master = createClient(NULL);
  
    // Copy socket information
    server.master->fd = c->fd;
    c->fd = -1;
  
    // Copy authentication info and other state
    server.master->flags |= CLIENT_MASTER;
  
    // Start sending periodic PING commands
    server.master->repl_ping_time = server.unixtime;
  
    // Begin the actual replication process
    replicationStartInitialSync();
}
```

For initial synchronization, the master typically sends an RDB file to the replica. After that, all commands that modify data are sent in real-time.

## 7. The Command Execution Flow

Now let's trace through how Redis executes a command from beginning to end:

1. **Reading the command** : The event loop detects that data is available on a client socket

```c
   void readQueryFromClient(aeEventLoop *el, int fd, void *privdata, int mask) {
       client *c = (client*) privdata;
       char buf[PROTO_IOBUF_LEN];
       int nread;
     
       // Read data from client
       nread = read(fd, buf, sizeof(buf));
       if (nread <= 0) {
           // Handle connection closed or error
           return;
       }
     
       // Feed data to the Redis protocol parser
       if (processInputBuffer(c) != REDIS_OK) {
           // Handle protocol error
           return;
       }
     
       // If a complete command was received, process it
       if (c->flags & CLIENT_PENDING_COMMAND) {
           processCommand(c);
       }
   }
```

1. **Parsing the command** : Redis uses the RESP (Redis Serialization Protocol) to parse commands
2. **Command lookup** : Redis looks up the command in its command table

```c
   int processCommand(client *c) {
       // Get the command
       c->cmd = lookupCommand(c->argv[0]->ptr);
     
       // Verify the command exists
       if (!c->cmd) {
           addReplyErrorFormat(c, "unknown command '%s'", c->argv[0]->ptr);
           return REDIS_OK;
       }
     
       // Check if the client is authenticated if needed
       if (server.requirepass && !c->authenticated && c->cmd->proc != authCommand) {
           addReplyError(c, "NOAUTH Authentication required.");
           return REDIS_OK;
       }
     
       // Execute the command
       call(c, CMD_CALL_FULL);
       return REDIS_OK;
   }
```

1. **Command execution** : The specific function for the command is called

```c
   void call(client *c, int flags) {
       // Record command start time for stats
       long long start = ustime();
     
       // Actually call the command implementation
       c->cmd->proc(c);
     
       // Update statistics
       updateCommandStats(c->cmd, ustime() - start);
     
       // Propagate the command to replicas and AOF if needed
       if (flags & CMD_CALL_PROPAGATE) {
           propagate(c->cmd, c->db->id, c->argv, c->argc, flags);
       }
   }
```

1. **Response generation** : The command function generates a response

```c
   void getCommand(client *c) {
       robj *o;
     
       // Look up the key
       if ((o = lookupKeyReadOrReply(c, c->argv[1], shared.nullbulk)) == NULL) {
           return;
       }
     
       // Check that it's a string
       if (o->type != REDIS_STRING) {
           addReply(c, shared.wrongtypeerr);
           return;
       }
     
       // Send the string value back to the client
       addReplyBulk(c, o);
   }
```

1. **Response queuing** : The response is queued for sending back to the client

```c
   void addReplyBulk(client *c, robj *obj) {
       // Add the bulk header ($<length>\r\n)
       addReplyBulkLen(c, obj);
     
       // Add the actual data
       addReplyBulk(c, obj);
     
       // Add the final \r\n
       addReply(c, shared.crlf);
   }
```

1. **Response sending** : The event loop eventually sends the response back to the client

## 8. Transactions in Redis

Redis transactions allow executing multiple commands in a sequence, with two important guarantees:

* Commands in a transaction are executed sequentially
* Either all or none of the commands are processed

Here's how transactions work internally:

1. Client sends MULTI to start a transaction
2. Redis marks the client as being in a transaction state
3. Subsequent commands are queued rather than executed
4. When the client sends EXEC, Redis executes all queued commands
5. DISCARD aborts the transaction

```c
void multiCommand(client *c) {
    // Check if already in a transaction
    if (c->flags & CLIENT_MULTI) {
        addReplyError(c, "MULTI calls can not be nested");
        return;
    }
  
    // Mark client as in a transaction
    c->flags |= CLIENT_MULTI;
  
    addReply(c, shared.ok);
}

void queueMultiCommand(client *c) {
    // Create a new command entry
    multiCmd *mc = zmalloc(sizeof(multiCmd));
  
    // Copy command details
    mc->cmd = c->cmd;
    mc->argc = c->argc;
    mc->argv = zmalloc(sizeof(robj*) * c->argc);
  
    // Copy arguments with increased refcount
    for (int j = 0; j < c->argc; j++) {
        mc->argv[j] = c->argv[j];
        incrRefCount(c->argv[j]);
    }
  
    // Add to the queue
    c->mstate.commands = zrealloc(c->mstate.commands,
                                  sizeof(multiCmd) * (c->mstate.count+1));
    c->mstate.commands[c->mstate.count++] = mc;
}
```

## 9. Redis Modules System

Redis 4.0 introduced modules, allowing developers to extend Redis with new commands and data types. The modules API is a C API that modules can use to interact with Redis.

```c
#include "redismodule.h"

// Example Redis module command implementation
int HelloCommand(RedisModuleCtx *ctx, RedisModuleString **argv, int argc) {
    if (argc != 2) {
        return RedisModule_WrongArity(ctx);
    }
  
    // Get the argument as a C string
    size_t len;
    const char *name = RedisModule_StringPtrLen(argv[1], &len);
  
    // Create the reply
    RedisModule_ReplyWithSimpleString(ctx, name);
  
    return REDISMODULE_OK;
}

// Module initialization function
int RedisModule_OnLoad(RedisModuleCtx *ctx, RedisModuleString **argv, int argc) {
    // Register the module with Redis
    if (RedisModule_Init(ctx, "helloworld", 1, REDISMODULE_APIVER_1) == REDISMODULE_ERR) {
        return REDISMODULE_ERR;
    }
  
    // Register the command
    if (RedisModule_CreateCommand(ctx, "hello", HelloCommand, "readonly", 1, 1, 1) == REDISMODULE_ERR) {
        return REDISMODULE_ERR;
    }
  
    return REDISMODULE_OK;
}
```

## 10. Redis Cluster

Redis Cluster provides a way to run a Redis installation where data is automatically sharded across multiple nodes:

1. The keyspace is divided into 16384 hash slots
2. Each node is responsible for a subset of the hash slots
3. A client can connect to any node of the cluster
4. If the key being accessed isn't handled by that node, the client receives a redirection

The key part is the hash slot calculation:

```c
int keyHashSlot(char *key, int keylen) {
    int s, e; // start, end of hashtag
  
    // Look for hash tag {tag} within the key
    for (s = 0; s < keylen; s++) {
        if (key[s] == '{') break;
    }
  
    // No hash tag found, use the whole key
    if (s == keylen) return crc16(key, keylen) & 16383;
  
    // Find the closing brace
    for (e = s+1; e < keylen; e++) {
        if (key[e] == '}') break;
    }
  
    // Invalid hash tag, use the whole key
    if (e == keylen || e == s+1) return crc16(key, keylen) & 16383;
  
    // Use just the tag portion for the hash
    return crc16(key+s+1, e-s-1) & 16383;
}
```

This function ensures that keys with the same hash tag (text between { and }) are assigned to the same hash slot, which is useful for operations like MULTI-key commands that need all involved keys to be on the same node.

## Conclusion

Redis's internals are a masterclass in efficient software design. By building from first principles:

1. **Single-threaded event loop** : Eliminating complex concurrency issues while still handling thousands of operations per second
2. **Efficient memory management** : Custom allocators and policies to make the most of available RAM
3. **Versatile data structures** : Each optimized for specific operations
4. **Multiple persistence options** : Balancing performance with durability
5. **Scalability features** : Replication and clustering for high availability and throughput

Redis achieves remarkable performance by making careful tradeoffs and focusing on the core use cases: fast access to in-memory data structures with optional persistence.

Understanding these internals not only helps you use Redis more effectively but also provides valuable insights into system design principles that apply to many other software systems.
