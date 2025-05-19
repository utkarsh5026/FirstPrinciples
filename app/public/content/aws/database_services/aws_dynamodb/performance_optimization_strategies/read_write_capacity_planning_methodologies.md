# DynamoDB Read/Write Capacity Planning: A First Principles Approach

I'll explain DynamoDB capacity planning from first principles, helping you understand not just how to implement it, but why it works the way it does and the fundamental concepts behind it.

## The Foundational Concept: What is Capacity in DynamoDB?

At its core, DynamoDB capacity refers to the computing resources Amazon allocates to process your database operations. Think of capacity as the "muscle power" available to handle your database requests.

> Capacity in DynamoDB is fundamentally about throughput - how many operations your database can perform per second. This is the essential building block that determines everything else about how you'll scale your database.

DynamoDB offers two capacity modes:

1. **Provisioned Capacity Mode** - You explicitly specify how much read and write throughput you need
2. **On-Demand Capacity Mode** - AWS automatically allocates capacity based on your actual usage

Let's start by understanding the units of capacity measurement.

## The Units of Measurement: Understanding Read and Write Capacity Units

### Read Capacity Units (RCUs)

One RCU represents the ability to perform:

* One strongly consistent read per second for an item up to 4 KB in size
* OR two eventually consistent reads per second for items up to 4 KB in size

> Think of an RCU as a worker who can either carefully read one document with perfect accuracy (strongly consistent) or quickly skim through two documents with possible small errors (eventually consistent).

If your item is larger than 4 KB, you'll need additional RCUs. For example:

* A 9 KB item requires 3 RCUs for strongly consistent reads (⌈9/4⌉ = 3)
* The same 9 KB item requires 2 RCUs for eventually consistent reads (⌈9/4⌉ ÷ 2 = 1.5, rounded up to 2)

### Write Capacity Units (WCUs)

One WCU represents the ability to perform:

* One write per second for an item up to 1 KB in size

> Imagine a WCU as a worker who can write one 1 KB document per second. If the document is bigger, they need help from other workers.

If your item is larger than 1 KB, you'll need additional WCUs. For example:

* A 3.5 KB item requires 4 WCUs (⌈3.5/1⌉ = 4)

Let's see a practical example to make this concrete:

```javascript
// An example item in DynamoDB (approximately 250 bytes)
const userProfile = {
  userId: "user123",           // 8 bytes
  name: "Jane Smith",          // 10 bytes
  email: "jane@example.com",   // 16 bytes
  accountType: "premium",      // 7 bytes
  createdAt: 1620000000000,    // 8 bytes
  lastLogin: 1650000000000,    // 8 bytes
  preferences: {               // nested object
    theme: "dark",             // 4 bytes
    notifications: true,       // 1 byte
    language: "en-US"          // 5 bytes
  }
  // DynamoDB also adds overhead for attribute names and data types
};

// Reading this item would consume:
// - Strongly consistent read: 1 RCU (item < 4KB)
// - Eventually consistent read: 0.5 RCU (rounded up to 1)

// Writing this item would consume:
// - 1 WCU (item < 1KB)
```

## Provisioned Capacity Mode: Planning Your Resources

When you use provisioned capacity, you're making a specific commitment about how much throughput your application needs. This is like reserving a specific number of workers for your database operations.

### Step 1: Analyze Your Access Patterns

The first step in capacity planning is understanding your access patterns:

> Before you can determine how many RCUs and WCUs you need, you must understand how your application will use the database. This is the foundation of all good capacity planning.

Ask yourself these questions:

* What are the read/write ratios?
* Are reads mostly consistent or eventually consistent?
* What is the size of items being read/written?
* What are the peak and average load times?

### Step 2: Calculate Required Capacity

Based on your analysis, calculate the required capacity using these formulas:

**For reads:**

```
Required RCUs = (Number of reads per second) × (Item size in KB ÷ 4, rounded up) × (1 for strongly consistent, 0.5 for eventually consistent)
```

**For writes:**

```
Required WCUs = (Number of writes per second) × (Item size in KB, rounded up)
```

Let's work through an example:

```javascript
// Scenario: A social media application
// - 100 user profile reads per second (eventually consistent)
// - 10 user profile updates per second
// - User profile size: 3 KB

// Calculate required RCUs
const profileReadsPerSecond = 100;
const profileSizeKB = 3;
const readConsistency = 0.5; // 0.5 for eventually consistent

const requiredRCUs = profileReadsPerSecond * Math.ceil(profileSizeKB / 4) * readConsistency;
console.log(`Required RCUs: ${Math.ceil(requiredRCUs)}`);
// Required RCUs: 50 (because (100 * 1 * 0.5) = 50)

// Calculate required WCUs
const profileWritesPerSecond = 10;
const requiredWCUs = profileWritesPerSecond * Math.ceil(profileSizeKB / 1);
console.log(`Required WCUs: ${requiredWCUs}`);
// Required WCUs: 30 (because (10 * 3) = 30)
```

### Step 3: Consider Spikes and Growth

Always add a buffer for unexpected spikes and future growth:

```javascript
// Add a 20% buffer for unexpected traffic spikes and growth
const bufferFactor = 1.2;

const finalRCUs = Math.ceil(requiredRCUs * bufferFactor);
const finalWCUs = Math.ceil(requiredWCUs * bufferFactor);

console.log(`Provisioned RCUs (with buffer): ${finalRCUs}`);
console.log(`Provisioned WCUs (with buffer): ${finalWCUs}`);
// Provisioned RCUs (with buffer): 60
// Provisioned WCUs (with buffer): 36
```

## Understanding Throttling: The Consequence of Insufficient Capacity

When you exceed your provisioned capacity, DynamoDB will throttle (reject) the excess requests. This is like having workers turn away extra work because they're already at maximum capacity.

> Throttling is DynamoDB's way of protecting itself from being overwhelmed. When it occurs, your application will receive a `ProvisionedThroughputExceededException`. This is a signal that you need to either provision more capacity or implement better retry strategies.

Here's an example of handling throttling in your application:

```javascript
// Example: Handling throttling with exponential backoff
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getItemWithRetry(params, maxRetries = 3) {
  let retries = 0;
  
  while (true) {
    try {
      // Attempt to get the item
      const result = await dynamoDB.get(params).promise();
      return result.Item;
    } catch (error) {
      // Check if the error is due to throttling
      if (error.code === 'ProvisionedThroughputExceededException') {
        if (retries >= maxRetries) {
          console.error('Max retries reached. Could not get item due to throttling.');
          throw error;
        }
      
        // Calculate exponential backoff time (with jitter for distributed systems)
        const backoffTime = Math.random() * (Math.pow(2, retries) * 100);
        console.log(`Request throttled. Retrying in ${backoffTime.toFixed(0)}ms...`);
      
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        retries++;
      } else {
        // If it's a different error, throw it
        throw error;
      }
    }
  }
}

// Usage
const params = {
  TableName: 'UserProfiles',
  Key: { userId: 'user123' }
};

getItemWithRetry(params)
  .then(item => console.log('Retrieved item:', item))
  .catch(error => console.error('Error:', error));
```

## Auto Scaling: Adapting to Changing Demands

DynamoDB Auto Scaling automatically adjusts your provisioned capacity based on actual usage patterns. This is like having the ability to hire or dismiss workers based on how busy your database is.

> Auto Scaling bridges the gap between provisioned and on-demand modes. It gives you the cost efficiency of provisioned capacity with some of the flexibility of on-demand capacity.

Here's how you might set up Auto Scaling:

```javascript
// AWS CloudFormation template snippet showing Auto Scaling configuration
{
  "Resources": {
    "UserProfilesTable": {
      "Type": "AWS::DynamoDB::Table",
      "Properties": {
        "TableName": "UserProfiles",
        "AttributeDefinitions": [
          { "AttributeName": "userId", "AttributeType": "S" }
        ],
        "KeySchema": [
          { "AttributeName": "userId", "KeyType": "HASH" }
        ],
        "BillingMode": "PROVISIONED",
        "ProvisionedThroughput": {
          "ReadCapacityUnits": 5,
          "WriteCapacityUnits": 5
        }
      }
    },
    "ReadScalingPolicy": {
      "Type": "AWS::ApplicationAutoScaling::ScalingPolicy",
      "Properties": {
        "PolicyName": "ReadAutoScalingPolicy",
        "PolicyType": "TargetTrackingScaling",
        "ScalingTargetId": { "Ref": "ReadScalingTarget" },
        "TargetTrackingScalingPolicyConfiguration": {
          "TargetValue": 70.0,
          "PredefinedMetricSpecification": {
            "PredefinedMetricType": "DynamoDBReadCapacityUtilization"
          }
        }
      }
    },
    "ReadScalingTarget": {
      "Type": "AWS::ApplicationAutoScaling::ScalableTarget",
      "Properties": {
        "MaxCapacity": 100,
        "MinCapacity": 5,
        "ResourceId": {
          "Fn::Join": [
            "/",
            ["table", { "Ref": "UserProfilesTable" }]
          ]
        },
        "ScalableDimension": "dynamodb:table:ReadCapacityUnits",
        "ServiceNamespace": "dynamodb"
      }
    }
    // Similar configuration for write capacity...
  }
}
```

In this configuration:

* We start with 5 RCUs
* Auto Scaling can increase this up to 100 RCUs
* The target utilization is 70% (scaling starts when utilization exceeds this threshold)

## On-Demand Capacity Mode: Pay-Per-Request

On-Demand mode eliminates the need to plan capacity in advance. You pay per request, and AWS automatically scales to accommodate your traffic. This is like having an unlimited pool of workers, but paying a premium for each task they complete.

> On-Demand mode is perfect for unpredictable workloads or when you don't want to manage capacity planning. You trade higher per-request costs for simplicity and automatic scaling.

Here's a simple comparison of how you might create a table in each mode:

```javascript
// Provisioned capacity mode
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB();

const provisionedTableParams = {
  TableName: 'UserProfiles',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' }
  ],
  BillingMode: 'PROVISIONED',
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

// On-demand capacity mode
const onDemandTableParams = {
  TableName: 'UserProfilesOnDemand',
  KeySchema: [
    { AttributeName: 'userId', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' }
  ],
  BillingMode: 'PAY_PER_REQUEST'
  // No ProvisionedThroughput needed with PAY_PER_REQUEST
};

// Create the tables
dynamodb.createTable(provisionedTableParams).promise()
  .then(() => console.log('Provisioned mode table created'))
  .catch(err => console.error('Error creating provisioned table:', err));

dynamodb.createTable(onDemandTableParams).promise()
  .then(() => console.log('On-demand mode table created'))
  .catch(err => console.error('Error creating on-demand table:', err));
```

## Advanced Concepts: Burst Capacity and Reserved Capacity

### Burst Capacity

DynamoDB provides burst capacity to handle temporary spikes in traffic. This is like having reserve workers who can step in during rush hour.

> Burst capacity is unused capacity from the previous 300 seconds (5 minutes) that DynamoDB makes available for short bursts of activity. It's a temporary buffer, not a permanent increase in capacity.

For example, if you provision 100 RCUs but only use 50 RCUs for several minutes, you'll accumulate burst capacity that can be used to handle a sudden spike up to 100 RCUs above your provisioned capacity (so up to 200 RCUs in total).

### Reserved Capacity

For stable, predictable workloads, you can purchase reserved capacity in advance at a discounted rate. This is like signing a long-term contract with workers at a lower hourly rate.

Reserved capacity is purchased for a specific region and can be applied to provisioned capacity tables in that region.

## Monitoring and Optimization: The Continuous Process

Capacity planning isn't a one-time activity but a continuous process of monitoring and optimization.

> Proper monitoring is like having a dashboard for your database's health and performance. It helps you detect issues before they become critical and identifies opportunities for optimization.

Here's a simple script to retrieve key metrics for a DynamoDB table:

```javascript
// Monitoring DynamoDB metrics using AWS CloudWatch
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

async function getTableMetrics(tableName, periodMinutes = 60) {
  const endTime = new Date();
  const startTime = new Date(endTime - periodMinutes * 60 * 1000);
  
  const metricNames = [
    'ConsumedReadCapacityUnits',
    'ConsumedWriteCapacityUnits',
    'ProvisionedReadCapacityUnits',
    'ProvisionedWriteCapacityUnits',
    'ReadThrottleEvents',
    'WriteThrottleEvents'
  ];
  
  const results = {};
  
  for (const metricName of metricNames) {
    const params = {
      MetricName: metricName,
      Namespace: 'AWS/DynamoDB',
      Period: 300, // 5 minutes
      StartTime: startTime,
      EndTime: endTime,
      Statistics: ['Average', 'Maximum'],
      Dimensions: [
        {
          Name: 'TableName',
          Value: tableName
        }
      ]
    };
  
    const data = await cloudwatch.getMetricStatistics(params).promise();
    results[metricName] = data.Datapoints.sort((a, b) => a.Timestamp - b.Timestamp);
  }
  
  return results;
}

// Usage
getTableMetrics('UserProfiles')
  .then(metrics => {
    // Calculate utilization percentages
    const latestReadCapacity = metrics.ProvisionedReadCapacityUnits
      .slice(-1)[0]?.Average || 0;
    const latestReadConsumption = metrics.ConsumedReadCapacityUnits
      .slice(-1)[0]?.Average || 0;
  
    const readUtilization = (latestReadConsumption / latestReadCapacity) * 100;
  
    console.log(`Read capacity utilization: ${readUtilization.toFixed(2)}%`);
    console.log(`Read throttle events: ${metrics.ReadThrottleEvents.length}`);
  
    // Similar calculations for write capacity...
  })
  .catch(error => console.error('Error fetching metrics:', error));
```

## Cost Optimization Strategies

Optimizing DynamoDB costs requires understanding the trade-offs between different capacity modes and table designs.

> Cost optimization isn't just about reducing your bill - it's about finding the right balance between cost, performance, and operational overhead.

### Strategy 1: Choose the Right Capacity Mode

```javascript
// Decision logic for choosing capacity mode
function recommendCapacityMode(averageUtilization, variability, throttleEvents) {
  if (variability > 0.5 || throttleEvents > 10) {
    return 'On-Demand mode recommended due to high variability or throttling';
  } else if (averageUtilization < 0.3) {
    return 'Consider reducing provisioned capacity or switching to On-Demand';
  } else {
    return 'Provisioned mode with Auto Scaling is optimal';
  }
}

// Example usage
const recommendation = recommendCapacityMode(0.25, 0.6, 5);
console.log(recommendation);
// Output: "On-Demand mode recommended due to high variability or throttling"
```

### Strategy 2: Implement Table-Level Time-to-Live (TTL)

TTL automatically removes items after a specified timestamp, reducing storage costs and potentially improving query performance.

```javascript
// Adding TTL attribute to items
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

async function createItemWithTTL(userId, expirationDays = 30) {
  // Calculate expiration timestamp (in seconds since epoch)
  const expirationTime = Math.floor(Date.now() / 1000) + (expirationDays * 24 * 60 * 60);
  
  const params = {
    TableName: 'UserSessions',
    Item: {
      userId: userId,
      sessionData: { /* session data */ },
      lastAccessed: new Date().toISOString(),
      expirationTime: expirationTime // TTL attribute
    }
  };
  
  await docClient.put(params).promise();
  console.log(`Item created with TTL set to expire in ${expirationDays} days`);
}

// Configure TTL on a table (this would be done once)
async function enableTTLOnTable(tableName, ttlAttributeName) {
  const dynamodb = new AWS.DynamoDB();
  
  const params = {
    TableName: tableName,
    TimeToLiveSpecification: {
      AttributeName: ttlAttributeName,
      Enabled: true
    }
  };
  
  await dynamodb.updateTimeToLive(params).promise();
  console.log(`TTL enabled on table ${tableName} using attribute ${ttlAttributeName}`);
}
```

## Specific Use Case Examples

Let's look at some common use cases and how to approach capacity planning for each:

### Example 1: Session Storage

Session storage typically has high write rates but predictable patterns:

```javascript
// Session storage capacity planning
const sessionsPerSecond = 1000; // New sessions created per second during peak
const sessionSizeKB = 2; // Average session size
const sessionReadRatio = 5; // For each write, there are 5 reads
const sessionConsistency = 0.5; // Eventually consistent reads are fine

// Calculate required capacity
const sessionWCUs = sessionsPerSecond * Math.ceil(sessionSizeKB / 1);
const sessionRCUs = (sessionsPerSecond * sessionReadRatio) * 
                   Math.ceil(sessionSizeKB / 4) * 
                   sessionConsistency;

console.log(`Session table needs ${sessionWCUs} WCUs and ${Math.ceil(sessionRCUs)} RCUs`);
// Session table needs 2000 WCUs and 1250 RCUs
```

### Example 2: E-commerce Shopping Cart

Shopping carts have spiky traffic patterns, especially during sales events:

```javascript
// E-commerce cart capacity planning with spikes
const normalCartsPerSecond = 50;
const peakCartsPerSecond = 500; // 10x during flash sales
const cartSizeKB = 3;
const cartReadRatio = 20; // High read-to-write ratio

// Calculate normal capacity
const normalWCUs = normalCartsPerSecond * Math.ceil(cartSizeKB / 1);
const normalRCUs = (normalCartsPerSecond * cartReadRatio) * 
                  Math.ceil(cartSizeKB / 4) * 
                  0.5; // Eventually consistent

// Calculate peak capacity
const peakWCUs = peakCartsPerSecond * Math.ceil(cartSizeKB / 1);
const peakRCUs = (peakCartsPerSecond * cartReadRatio) * 
                Math.ceil(cartSizeKB / 4) * 
                0.5;

console.log(`Normal: ${normalWCUs} WCUs and ${Math.ceil(normalRCUs)} RCUs`);
console.log(`Peak: ${peakWCUs} WCUs and ${Math.ceil(peakRCUs)} RCUs`);
console.log('Recommendation: Use on-demand capacity mode or auto-scaling with a high maximum');
// Normal: 150 WCUs and 375 RCUs
// Peak: 1500 WCUs and 3750 RCUs
```

## Practical Capacity Planning Methodology

Let me outline a step-by-step methodology you can follow for any DynamoDB table:

### Step 1: Define Access Patterns

Start by creating a table of all operations you'll perform:

```javascript
// Example access pattern documentation
const accessPatterns = [
  {
    operation: 'GetUserProfile',
    type: 'read',
    consistency: 'eventual',
    avgItemSize: 2.5, // KB
    peakQPS: 200, // queries per second
    description: 'Get user profile by userId'
  },
  {
    operation: 'UpdateUserLastLogin',
    type: 'write',
    avgItemSize: 0.5, // KB
    peakQPS: 100,
    description: 'Update user last login timestamp'
  },
  // ... more patterns
];
```

### Step 2: Calculate Capacity for Each Pattern

```javascript
// Calculate capacity for each access pattern
function calculatePatternCapacity(pattern) {
  if (pattern.type === 'read') {
    const consistencyFactor = pattern.consistency === 'strong' ? 1 : 0.5;
    const rcuPerOperation = Math.ceil(pattern.avgItemSize / 4) * consistencyFactor;
    return pattern.peakQPS * rcuPerOperation;
  } else if (pattern.type === 'write') {
    const wcuPerOperation = Math.ceil(pattern.avgItemSize / 1);
    return pattern.peakQPS * wcuPerOperation;
  }
}

const patternCapacities = accessPatterns.map(pattern => {
  return {
    operation: pattern.operation,
    type: pattern.type,
    capacity: calculatePatternCapacity(pattern)
  };
});
```

### Step 3: Aggregate Capacities

```javascript
// Calculate total capacity needed
function calculateTotalCapacity(patternCapacities) {
  const totalRCU = patternCapacities
    .filter(p => p.type === 'read')
    .reduce((sum, p) => sum + p.capacity, 0);
  
  const totalWCU = patternCapacities
    .filter(p => p.type === 'write')
    .reduce((sum, p) => sum + p.capacity, 0);
  
  return { totalRCU, totalWCU };
}

const totalCapacity = calculateTotalCapacity(patternCapacities);
console.log(`Total capacity needed: ${Math.ceil(totalCapacity.totalRCU)} RCUs and ${Math.ceil(totalCapacity.totalWCU)} WCUs`);
```

### Step 4: Add Buffer and Choose Capacity Mode

```javascript
// Add buffer and make recommendation
function makeCapacityRecommendation(totalRCU, totalWCU, variability) {
  const bufferedRCU = Math.ceil(totalRCU * 1.2); // 20% buffer
  const bufferedWCU = Math.ceil(totalWCU * 1.2);
  
  let recommendation;
  if (variability > 0.4) {
    recommendation = 'On-Demand mode due to high variability';
  } else if (totalRCU > 1000 || totalWCU > 1000) {
    recommendation = 'Provisioned mode with Auto Scaling (high volume)';
  } else {
    recommendation = 'Provisioned mode with Auto Scaling (standard)';
  }
  
  return { bufferedRCU, bufferedWCU, recommendation };
}

const variability = 0.3; // How much traffic varies (0-1)
const recommendation = makeCapacityRecommendation(
  totalCapacity.totalRCU, 
  totalCapacity.totalWCU, 
  variability
);

console.log(`Recommended capacity: ${recommendation.bufferedRCU} RCUs and ${recommendation.bufferedWCU} WCUs`);
console.log(`Recommendation: ${recommendation.recommendation}`);
```

## Conclusion: The Art and Science of Capacity Planning

DynamoDB capacity planning is both an art and a science. The science comes from the mathematical formulas and clear specifications we've covered. The art comes from understanding your application's unique patterns and making intelligent trade-offs.

> The best capacity plan is one that evolves with your application, continuously monitored and refined based on real usage data.

Whether you choose provisioned capacity with auto-scaling, on-demand capacity, or a mix of both across different tables, the goal is the same: provide the performance your applications need while optimizing costs. By starting with the first principles we've covered, you'll be well-equipped to make these decisions confidently.
