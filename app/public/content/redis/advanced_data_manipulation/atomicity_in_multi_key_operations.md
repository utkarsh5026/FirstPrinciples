
# Redis Atomicity in Multi-Key Operations: A First Principles Explanation

To understand Redis atomicity in multi-key operations, we need to build our understanding from the ground up. Let's start with the most fundamental concepts and work our way toward the specific challenges and solutions in Redis.

## What is Atomicity?

At its most basic level, atomicity refers to an operation that either completes entirely or doesn't happen at all—there's no in-between state. The term comes from the Greek word "atomos," meaning indivisible. In computing, an atomic operation cannot be interrupted midway.

Think of atomicity like flipping a light switch—the light is either on or off, never stuck halfway. When we apply this concept to databases like Redis, it means that when we execute a command or a series of commands, they either all succeed or all fail together, leaving the database in a consistent state.

### Example: Understanding Basic Atomicity

Imagine you have $1000 in your bank account and want to transfer $500 to a friend. This involves two operations:

1. Deduct $500 from your account
2. Add $500 to your friend's account

If only the first operation completes but the second fails, you lose $500 and your friend gets nothing—clearly problematic! An atomic operation ensures both steps complete successfully or neither happens.

## Redis as a Key-Value Store

Redis is fundamentally a key-value store that operates in memory, which gives it exceptional speed. Each piece of data in Redis is associated with a key that you use to access it.

### Example: Basic Redis Operations

Let's see some basic Redis operations:

```redis
SET user:1:name "Alice"    # Stores the value "Alice" with key "user:1:name"
GET user:1:name            # Returns "Alice"
```

The SET operation above is inherently atomic—it either completely succeeds or fails.

## The Challenge of Multi-Key Operations

While single key operations in Redis are automatically atomic, things get more complicated when you need to operate on multiple keys at once.

Imagine you're building a simple inventory system:

```redis
SET product:1:stock 10     # Product 1 has 10 items in stock
SET product:2:stock 5      # Product 2 has 5 items in stock
```

Now, what if you want to atomically move 3 items from product 1 to product 2?

```redis
DECR product:1:stock 3     # Decrease product 1 stock
INCR product:2:stock 3     # Increase product 2 stock
```

If the system crashes between these two commands, you'd lose 3 items from inventory—they'd disappear from product 1 but never get added to product 2!

## Redis Solutions for Multi-Key Atomicity

Redis provides several mechanisms to ensure atomicity across multiple keys:

### 1. Transactions with MULTI/EXEC/DISCARD

Redis transactions allow you to execute multiple commands as a single unit:

```redis
MULTI                      # Begin transaction
DECR product:1:stock 3     # Queued command
INCR product:2:stock 3     # Queued command
EXEC                       # Execute all queued commands atomically
```

Here's what happens:

* MULTI signals the start of a transaction
* Commands are queued (not executed yet)
* EXEC executes all queued commands as one atomic unit
* If the server crashes before EXEC, no commands are executed
* If it crashes during EXEC, either all or none of the commands are executed

This ensures your inventory transfer either completes fully or doesn't happen at all.

### Example: Bank Transfer in Redis

Let's implement that bank transfer example:

```redis
MULTI
DECRBY account:your:balance 500
INCRBY account:friend:balance 500
EXEC
```

All commands between MULTI and EXEC are guaranteed to execute without other clients' commands interrupting them, preserving atomicity.

### 2. Lua Scripting

Redis allows execution of Lua scripts, which are inherently atomic:

```redis
EVAL "
    local stock1 = redis.call('GET', 'product:1:stock')
    if tonumber(stock1) >= 3 then
        redis.call('DECRBY', 'product:1:stock', 3)
        redis.call('INCRBY', 'product:2:stock', 3)
        return 1
    else
        return 0
    end
" 0
```

This script:

1. Checks if product 1 has enough stock
2. If yes, it decreases product 1's stock and increases product 2's stock
3. Returns 1 for success or 0 for failure

The entire script executes atomically—no other Redis commands can run in between these operations.

### Why Use Lua Scripts?

Lua scripts are powerful because they can:

* Perform conditional logic (if/else)
* Access multiple keys
* Return custom results
* Execute completely atomically

### Example: More Complex Inventory Management

Let's expand our example to handle a shopping cart checkout:

```redis
EVAL "
    -- Check if all products have enough stock
    local cart = cjson.decode(ARGV[1])
    for productId, quantity in pairs(cart) do
        local stock = tonumber(redis.call('GET', 'product:' .. productId .. ':stock'))
        if stock < quantity then
            return 'Product ' .. productId .. ' has insufficient stock'
        end
    end
  
    -- Update stock for all products
    for productId, quantity in pairs(cart) do
        redis.call('DECRBY', 'product:' .. productId .. ':stock', quantity)
    end
  
    return 'Success'
" 0 '{"1": 2, "2": 1}'
```

This script ensures that either all product stocks are updated or none are, maintaining database consistency.

## Understanding the Limitations

While Redis provides tools for atomic operations, they have limitations:

### 1. Watch Command and Optimistic Locking

MULTI/EXEC doesn't provide isolation by default. Other clients can modify keys while your transaction is being queued. To address this, Redis provides the WATCH command:

```redis
WATCH product:1:stock      # Watch this key for changes
val = GET product:1:stock  # Read current value
                           # (Perform client-side logic)
MULTI
DECRBY product:1:stock 3
INCRBY product:2:stock 3
EXEC                       # This will fail if product:1:stock changed
```

If another client modifies a WATCHed key before EXEC is called, the transaction aborts. This is called optimistic locking.

### Example: Inventory Check with WATCH

Let's say we only want to transfer items if there are at least 3 in stock:

```redis
WATCH product:1:stock
current_stock = GET product:1:stock

if (current_stock >= 3) {
    MULTI
    DECRBY product:1:stock 3
    INCRBY product:2:stock 3
    result = EXEC
  
    if (result == nil) {
        print("Transaction failed, someone modified the stock")
    }
} else {
    DISCARD  # Cancel the transaction
    print("Not enough stock")
}
```

### 2. Transactions Don't Support Rollback

Unlike traditional databases, Redis doesn't support automatic rollbacks. If a command in a transaction fails due to a programming error, other commands will still execute:

```redis
MULTI
SET key1 "value1"
SYNTAX ERROR         # This command has an error
SET key2 "value2"
EXEC
```

After EXEC, key1 will have "value1" despite the error in the second command. This is by design—Redis prioritizes performance over complex transaction semantics.

## Redis Cluster and Multi-Key Atomicity

In a Redis Cluster, there's an additional challenge: keys might be stored on different nodes (servers). Redis Cluster has a restriction that all keys in a MULTI/EXEC block or Lua script must be in the same hash slot.

### Hash Slots in Redis Cluster

Redis Cluster divides the key space into 16,384 hash slots. Keys are assigned to slots based on their hash value:

```
slot = CRC16(key) % 16384
```

### Using Hash Tags for Multi-Key Operations

To ensure multiple keys are in the same slot, you can use hash tags:

```redis
SET {user:1}:name "Alice"    # Both keys will be in the same slot
SET {user:1}:email "alice@example.com"  # because they share {user:1}
```

Redis only hashes the part within the first { and } braces when calculating the slot.

### Example: Multi-Key Operations in a Cluster

Let's modify our inventory example for a Redis Cluster:

```redis
MULTI
DECRBY {inventory}:product:1:stock 3
INCRBY {inventory}:product:2:stock 3
EXEC
```

By using the hash tag {inventory}, we ensure both keys are assigned to the same hash slot and node, allowing the atomic transaction.

## Practical Patterns for Multi-Key Atomicity

Let's explore some practical patterns for handling multi-key operations atomically:

### Pattern 1: Denormalization (Combining Data)

Instead of using separate keys, store related data together:

```redis
HSET product:1 name "Laptop" price 999 stock 10
HSET product:2 name "Phone" price 699 stock 5
```

Now if you need to atomically update multiple fields, it's a single key operation:

```redis
HSET product:1 price 899 stock 8
```

### Pattern 2: Using Redis Data Structures

Redis data structures like lists, sets, and sorted sets can help you organize data to minimize multi-key operations:

```redis
# Instead of separate keys for each item in a cart
SADD cart:user:123 "product:1:2" "product:2:1"  # Format: product:id:quantity
```

### Example: Shopping Cart with a Hash

```redis
# Add products to cart
HSET cart:user:123 product:1 2  # 2 units of product 1
HSET cart:user:123 product:2 1  # 1 unit of product 2

# Checkout with Lua script
EVAL "
    local userId = ARGV[1]
    local cartKey = 'cart:user:' .. userId
  
    -- Get all items in cart
    local items = redis.call('HGETALL', cartKey)
  
    -- Items come as [key1, value1, key2, value2, ...]
    for i = 1, #items, 2 do
        local productKey = items[i]
        local quantity = tonumber(items[i+1])
      
        -- Extract product ID from the key
        local productId = string.match(productKey, 'product:(%d+)')
      
        -- Check and update stock
        local stockKey = 'product:' .. productId .. ':stock'
        local currentStock = tonumber(redis.call('GET', stockKey))
      
        if currentStock < quantity then
            return 'Insufficient stock for product ' .. productId
        end
      
        redis.call('DECRBY', stockKey, quantity)
    end
  
    -- Clear the cart after successful checkout
    redis.call('DEL', cartKey)
    return 'Checkout completed successfully'
" 0 123
```

## Conclusion

Redis atomicity in multi-key operations requires careful consideration:

1. Single commands on single keys are atomic by default
2. For multi-key operations, use:
   * MULTI/EXEC transactions (with WATCH for optimistic locking)
   * Lua scripts for more complex logic
   * Hash tags in a Redis Cluster environment
3. Design strategies to minimize the need for multi-key atomicity:
   * Denormalize data where appropriate
   * Use Redis data structures to group related data
   * Consider application-level solutions for complex scenarios

Understanding these principles allows you to design Redis systems that maintain data consistency even when operating on multiple keys simultaneously.

Remember that Redis prioritizes performance and simplicity over complex transaction semantics. Its approach to atomicity reflects this philosophy—providing enough guarantees for most use cases while maintaining its blazing speed and simplicity.
