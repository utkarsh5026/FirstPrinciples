# AWS DynamoDB Read/Write Capacity Units: From First Principles

I'll explain DynamoDB's capacity units from the ground up, starting with the fundamental concepts and gradually building toward the complete implementation details.

> Understanding DynamoDB's capacity model requires first understanding how databases handle resources, how AWS abstracts hardware, and how billing models align with actual resource consumption.

## The Fundamental Problem: Resource Allocation

At its core, the concept of capacity units addresses a fundamental problem in computing: how do we allocate finite resources (CPU, memory, disk I/O) efficiently among many users?

Traditional databases run on dedicated servers where resources are fixed. Cloud databases like DynamoDB need a different approach - they must:

1. Scale dynamically with demand
2. Share resources efficiently across thousands of customers
3. Provide predictable performance
4. Bill fairly based on actual usage

## What Are Capacity Units?

Capacity units are DynamoDB's abstraction for resource allocation. They represent the computational resources needed to perform database operations:

* **Read Capacity Units (RCUs)** : Resources needed for read operations
* **Write Capacity Units (WCUs)** : Resources needed for write operations

Let's understand why AWS created this abstraction rather than directly charging for CPU or memory.

### The Hardware Reality

Behind the scenes, DynamoDB runs on a massive distributed system with:

* Storage nodes (holding data)
* Request routers (directing traffic)
* Metadata management systems
* Partitioning systems (splitting data across nodes)

When you perform an operation, it consumes:

* CPU cycles for processing
* Network bandwidth for transmitting
* I/O operations for disk access
* Memory for caching

Rather than expose these complex details, AWS simplified it into capacity units.

## The Mathematics of Capacity Units

### Write Capacity Units (WCUs)

> 1 WCU = resources needed to write 1 item up to 1 KB in size per second

This means if you want to write:

* One 500-byte item per second → 1 WCU
* One 1.5 KB item per second → 2 WCUs (rounded up)
* Five 1 KB items per second → 5 WCUs

Let's understand with examples:

**Example 1:** You have a table with 10 WCUs

```
Items to write per second:
- 5 items of 512 bytes each
- Each item requires 1 WCU (rounded up from 512 bytes)
- Total requirement: 5 WCUs
- Status: Within capacity (10 > 5)
```

**Example 2:** You have a table with 10 WCUs

```
Items to write per second:
- 3 items of 3 KB each
- Each item requires 3 WCUs (3 KB / 1 KB ceiling)
- Total requirement: 9 WCUs
- Status: Within capacity (10 > 9)
```

**Example 3:** You have a table with 10 WCUs

```
Items to write per second:
- 6 items of 2 KB each
- Each item requires 2 WCUs (2 KB / 1 KB ceiling)
- Total requirement: 12 WCUs
- Status: Exceeds capacity (10 < 12)
- Result: Throttling or consuming burst capacity
```

### Read Capacity Units (RCUs)

Read capacity is slightly more complex:

> 1 RCU = resources needed to perform either:
>
> * 1 strongly consistent read up to 4 KB in size per second
> * 2 eventually consistent reads up to 4 KB in size per second

This reflects the underlying architecture where:

* **Eventually consistent reads** (the default) use less resources because they might return slightly outdated data from any available replica
* **Strongly consistent reads** use more resources because they must contact the primary copy to ensure up-to-date data

Let's see examples:

**Example 1:** You have a table with 10 RCUs, using eventually consistent reads

```
Items to read per second:
- 15 items of 2 KB each (eventually consistent)
- Each item requires 0.5 RCUs (2 KB / 4 KB, then halved for eventual consistency)
- Total requirement: 7.5 RCUs
- Status: Within capacity (10 > 7.5)
```

**Example 2:** You have a table with 10 RCUs, using strongly consistent reads

```
Items to read per second:
- 8 items of 3 KB each (strongly consistent)
- Each item requires 1 RCU (3 KB / 4 KB ceiling)
- Total requirement: 8 RCUs
- Status: Within capacity (10 > 8)
```

**Example 3:** You have a table with 10 RCUs, mixed read types

```
Items to read per second:
- 4 items of 6 KB each (strongly consistent)
- 8 items of 2 KB each (eventually consistent)

For strongly consistent:
- Each 6 KB item requires 2 RCUs (6 KB / 4 KB ceiling)
- Subtotal: 8 RCUs

For eventually consistent:
- Each 2 KB item requires 0.5 RCUs
- Subtotal: 4 RCUs

Total requirement: 12 RCUs
Status: Exceeds capacity (10 < 12)
Result: Throttling or consuming burst capacity
```

## Implementation Details: Behind the Scenes

Let's explore how DynamoDB actually implements capacity units at a technical level.

### Partitioning and Capacity Distribution

DynamoDB tables are divided into partitions, with each partition having its own allocated capacity.

Here's the key concept:  **the capacity for a table is divided evenly across its partitions** .

For example, if you have:

* A table with 100 WCUs
* 10 partitions
* Each partition gets 10 WCUs

This creates a critical design consideration:  **hot partitions** .

```
Table: UserSessions
Partition key: userId
If most activity comes from a small number of users:
- Their partitions receive most requests
- Other partitions sit idle
- The busy partitions might exhaust their capacity while overall table capacity is underutilized
```

This is why choosing a good partition key is critical - it should distribute writes evenly.

### Capacity Tracking and Enforcement

DynamoDB tracks capacity consumption using internal meters for each partition. Here's a simplified version of how it works:

```javascript
// Simplified pseudocode for DynamoDB capacity tracking
function consumeCapacity(partition, itemSizeKB, operationType, consistencyType) {
  let capacityUsed = 0;
  
  if (operationType === 'WRITE') {
    // Calculate WCUs required
    capacityUsed = Math.ceil(itemSizeKB / 1);
  } else if (operationType === 'READ') {
    // Calculate RCUs required
    let baseCapacity = Math.ceil(itemSizeKB / 4);
    capacityUsed = (consistencyType === 'STRONG') ? baseCapacity : baseCapacity / 2;
  }
  
  // Check if partition has enough capacity
  if (partition.availableCapacity >= capacityUsed) {
    partition.availableCapacity -= capacityUsed;
    return true; // Operation allowed
  } else {
    // Not enough capacity, operation will be throttled
    return false;
  }
}
```

In reality, DynamoDB's implementation is much more sophisticated, but this shows the basic concept.

### Burst Capacity

DynamoDB includes a "burst capacity" feature that allows tables to temporarily exceed their provisioned capacity. This works through a token bucket algorithm:

```javascript
// Simplified representation of DynamoDB's burst capacity mechanism
class PartitionCapacityTracker {
  constructor(provisionedCapacityPerSecond) {
    this.provisionedCapacityPerSecond = provisionedCapacityPerSecond;
    this.maxBurstTokens = provisionedCapacityPerSecond * 300; // 5 minutes worth
    this.currentTokens = this.maxBurstTokens; // Start with full burst capacity
    this.lastUpdated = Date.now();
  }
  
  updateTokens() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastUpdated) / 1000;
    this.lastUpdated = now;
  
    // Add earned tokens based on elapsed time
    const newTokens = elapsedSeconds * this.provisionedCapacityPerSecond;
    this.currentTokens = Math.min(this.maxBurstTokens, this.currentTokens + newTokens);
  }
  
  consumeCapacity(capacityUnits) {
    this.updateTokens();
  
    if (this.currentTokens >= capacityUnits) {
      this.currentTokens -= capacityUnits;
      return true; // Operation allowed
    } else {
      return false; // Operation throttled
    }
  }
}
```

This allows short bursts of activity to succeed even if they exceed the provisioned capacity. Unused capacity accumulates as tokens, up to a maximum of 5 minutes worth.

## Capacity Modes: Provisioned vs On-Demand

DynamoDB offers two capacity modes:

### Provisioned Capacity

In provisioned capacity mode:

* You specify the exact number of RCUs and WCUs
* You're billed for these amounts regardless of actual usage
* If you exceed capacity, requests are throttled (unless Auto Scaling is enabled)

Let's look at how this works:

```javascript
// Simplified provisioned capacity management
function handleRequest(tableConfig, request) {
  const partitionKey = extractPartitionKey(request);
  const partition = getPartitionForKey(partitionKey);
  const itemSizeKB = calculateItemSize(request.item);
  
  // Calculate capacity needed
  let capacityNeeded;
  if (request.type === 'WRITE') {
    capacityNeeded = Math.ceil(itemSizeKB / 1); // WCUs
  } else {
    const baseCapacity = Math.ceil(itemSizeKB / 4);
    capacityNeeded = (request.consistency === 'STRONG') ? baseCapacity : baseCapacity / 2;
  }
  
  // Check if capacity is available
  if (partition.capacityTracker.consumeCapacity(capacityNeeded)) {
    // Process request
    return processRequest(request);
  } else {
    // Throttle request
    throw new ProvisionedThroughputExceededException();
  }
}
```

### On-Demand Capacity

In on-demand mode:

* You don't specify capacity in advance
* DynamoDB automatically scales to your workload
* You pay per request with no minimum capacity

The implementation changes:

```javascript
// Simplified on-demand capacity management
function handleRequest(tableConfig, request) {
  // No capacity checking, just track for billing
  const itemSizeKB = calculateItemSize(request.item);
  
  // Calculate request units for billing
  let requestUnits;
  if (request.type === 'WRITE') {
    requestUnits = Math.ceil(itemSizeKB / 1); // WRUs
  } else {
    const baseUnits = Math.ceil(itemSizeKB / 4);
    requestUnits = (request.consistency === 'STRONG') ? baseUnits : baseUnits / 2;
  }
  
  // Record for billing
  recordRequestForBilling(tableConfig.accountId, requestUnits, request.type);
  
  // Process request (might still be limited by account/service quotas)
  return processRequest(request);
}
```

On-demand mode still has limits, but they scale automatically with your usage patterns.

## Capacity Units in Transactions

DynamoDB transactions (TransactWriteItems, TransactGetItems) have special capacity considerations:

> Transactions consume twice the normal capacity units to account for the additional overhead of maintaining ACID properties.

Here's an example:

```
Transaction for writing 3 items:
- Item 1: 0.5 KB → Normally 1 WCU
- Item 2: 1.2 KB → Normally 2 WCUs
- Item 3: 0.8 KB → Normally 1 WCU

Normal total: 4 WCUs
Transaction total: 8 WCUs (doubled)
```

This reflects the additional work DynamoDB does:

* Validating all operations can succeed
* Preparing and committing the transaction
* Managing the two-phase commit protocol
* Handling potential rollbacks

## The Capacity Unit Calculation Logic

Let's look more precisely at how capacity units are calculated:

### WCU Calculation

```javascript
function calculateWCUs(itemSizeBytes, transactional = false) {
  // Convert to KB and round up to the nearest KB
  const sizeInKB = Math.ceil(itemSizeBytes / 1024);
  
  // Calculate base WCUs needed
  let wcu = sizeInKB;
  
  // Double for transactional writes
  if (transactional) {
    wcu *= 2;
  }
  
  return wcu;
}
```

### RCU Calculation

```javascript
function calculateRCUs(itemSizeBytes, consistencyType, transactional = false) {
  // Convert to KB and round up to the nearest 4KB
  const sizeIn4KB = Math.ceil(itemSizeBytes / (4 * 1024));
  
  // Calculate base RCUs needed
  let rcu = sizeIn4KB;
  
  // Adjust based on consistency model
  if (consistencyType === 'EVENTUAL') {
    rcu /= 2;
  }
  
  // Double for transactional reads
  if (transactional) {
    rcu *= 2;
  }
  
  return rcu;
}
```

## BatchGetItem and BatchWriteItem

Batch operations are more efficient than individual calls but still consume the same total capacity:

```
BatchWriteItem with:
- 10 items of 1 KB each
- Total: 10 WCUs
```

The advantage is that you:

* Reduce network overhead
* Simplify application code
* Potentially improve throughput

## Optimizing for Capacity Units

Understanding how capacity units work allows for optimization:

### Read Optimization Techniques

1. **Use Eventually Consistent Reads** :

```javascript
   // This uses half the RCUs
   const params = {
     TableName: 'MyTable',
     Key: { 'pk': 'item1' },
     ConsistentRead: false  // Default, but explicitly shown
   };
```

1. **Project Only Needed Attributes** :

```javascript
   // This reduces the size of each item retrieved
   const params = {
     TableName: 'MyTable',
     Key: { 'pk': 'item1' },
     ProjectionExpression: 'name, age, status'  // Only get what you need
   };
```

1. **Use Sparse Indexes** :

```javascript
   // Create indexes that only include items with the indexed attribute
   const params = {
     TableName: 'MyTable',
     GlobalSecondaryIndexes: [{
       IndexName: 'ActiveUsersIndex',
       KeySchema: [
         { AttributeName: 'status', KeyType: 'HASH' },
         { AttributeName: 'lastLogin', KeyType: 'RANGE' }
       ],
       Projection: { ProjectionType: 'KEYS_ONLY' },
       ProvisionedThroughput: {
         ReadCapacityUnits: 5,
         WriteCapacityUnits: 5
       }
     }]
   };
   // Only items with 'status' and 'lastLogin' attributes appear in this index
```

### Write Optimization Techniques

1. **Batch Write Operations** :

```javascript
   // Instead of 25 separate PutItem calls, use BatchWriteItem
   const params = {
     RequestItems: {
       'MyTable': [
         { PutRequest: { Item: { pk: 'item1', /* other attributes */ } } },
         { PutRequest: { Item: { pk: 'item2', /* other attributes */ } } },
         // Up to 25 items
       ]
     }
   };
```

1. **Compress Large Attributes** :

```javascript
   // Before writing to DynamoDB
   const compressedData = gzipSync(JSON.stringify(largeObject));
   const encodedData = compressedData.toString('base64');

   const params = {
     TableName: 'MyTable',
     Item: {
       pk: 'item1',
       compressedAttribute: encodedData  // Much smaller than the original
     }
   };
```

1. **Write to Multiple Tables in Parallel** :

```javascript
   // Perform operations against multiple tables simultaneously
   const promises = [
     dynamoDB.putItem(paramsForTable1).promise(),
     dynamoDB.putItem(paramsForTable2).promise()
   ];

   await Promise.all(promises);
```

## Monitoring and Adjusting Capacity

DynamoDB provides CloudWatch metrics to monitor capacity usage:

```javascript
// Using AWS SDK to fetch capacity metrics
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

const params = {
  MetricName: 'ConsumedWriteCapacityUnits',
  Namespace: 'AWS/DynamoDB',
  Dimensions: [
    {
      Name: 'TableName',
      Value: 'MyTable'
    }
  ],
  StartTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  EndTime: new Date(),
  Period: 300, // 5-minute intervals
  Statistics: ['Sum', 'Average', 'Maximum']
};

cloudwatch.getMetricStatistics(params, (err, data) => {
  if (err) console.error(err);
  else {
    const metrics = data.Datapoints;
    // Analyze metrics and adjust capacity if needed
  }
});
```

You can also use Auto Scaling to automatically adjust capacity:

```javascript
// Define scaling policy with AWS SDK
const applicationAutoScaling = new AWS.ApplicationAutoScaling();

const scalingParams = {
  ResourceId: 'table/MyTable',
  ScalableDimension: 'dynamodb:table:WriteCapacityUnits',
  ServiceNamespace: 'dynamodb',
  TargetTrackingScalingPolicyConfiguration: {
    PredefinedMetricSpecification: {
      PredefinedMetricType: 'DynamoDBWriteCapacityUtilization'
    },
    ScaleOutCooldown: 60, // Wait 60 seconds before scaling out again
    ScaleInCooldown: 60,  // Wait 60 seconds before scaling in again
    TargetValue: 70.0     // Target 70% utilization
  }
};

applicationAutoScaling.putScalingPolicy(scalingParams, (err, data) => {
  if (err) console.error(err);
  else console.log('Auto scaling policy created', data);
});
```

## Real-World Capacity Planning

Let's walk through a real-world capacity planning example:

```
Application: E-commerce site
Operations per second:
- 100 product detail views (read 5 KB items, eventually consistent)
- 10 shopping cart updates (write 2 KB items)
- 2 order placements (transactional writes of 3 KB items)

RCU Calculation:
- Product views: 100 × (5 KB ÷ 4 KB ceiling) × 0.5 = 62.5 RCUs
- (100 operations, 5 KB each, eventually consistent)

WCU Calculation:
- Cart updates: 10 × (2 KB ÷ 1 KB ceiling) = 20 WCUs
- Order placements: 2 × (3 KB ÷ 1 KB ceiling) × 2 = 12 WCUs
  (2 operations, 3 KB each, transactional so doubled)
- Total: 32 WCUs

Final capacity needs:
- At least 63 RCUs
- At least 32 WCUs
- Plus extra for peaks and growth
```

## When Things Go Wrong: Throttling and Retries

When you exceed capacity, DynamoDB returns a throttling exception:

```javascript
try {
  const result = await dynamoDB.getItem(params).promise();
  // Process result
} catch (error) {
  if (error.code === 'ProvisionedThroughputExceededException') {
    // We've been throttled
    console.log('Request throttled due to insufficient capacity');
  
    // Implement exponential backoff
    await sleep(calculateBackoffTime(retryCount));
    retryCount++;
  
    // Then retry
    return getItemWithRetry(params, retryCount);
  } else {
    // Handle other errors
    throw error;
  }
}

function calculateBackoffTime(retryCount) {
  return Math.min(100 * Math.pow(2, retryCount), 30000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

The AWS SDK can handle this automatically with the built-in retry mechanism.

## Conclusion: The Philosophy of Capacity Units

DynamoDB's capacity unit system embodies several core principles:

1. **Predictable Performance** : By reserving capacity, you guarantee performance regardless of other users.
2. **Transparent Billing** : You pay for what you provision, making costs predictable.
3. **Resource Isolation** : Your application is insulated from "noisy neighbors" who might otherwise consume shared resources.
4. **Explicit Trade-offs** : The system forces you to consider the trade-offs between cost, performance, and flexibility.

Understanding capacity units deeply allows you to:

* Design more efficient data models
* Optimize access patterns
* Scale more effectively
* Control costs
* Troubleshoot performance issues

These principles make DynamoDB not just a database but an architectural choice that shapes your entire application design.
