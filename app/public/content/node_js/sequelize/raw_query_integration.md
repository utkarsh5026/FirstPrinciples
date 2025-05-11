## Understanding the Foundation: What Are Raw Queries?

> Raw queries in Sequelize offer a powerful way to execute SQL statements directly against your database, bypassing the ORM layer entirely.

Let me walk you through raw query integration in Sequelize from the very beginning, building from first principles to advanced implementations.

At its core, a raw query is exactly what it sounds like - a SQL query written in plain SQL that gets executed directly against your database. Think of it as speaking directly to your database in its native language, rather than using Sequelize's model-based abstraction layer.



Imagine you have a library management system. With regular Sequelize models, you might write:

```javascript
// Model-based approach
const books = await Book.findAll({
  where: {
    published_year: 2024
  }
});
```

With raw queries, you'd write the actual SQL:

```javascript
// Raw query approach
const books = await sequelize.query(
  'SELECT * FROM books WHERE published_year = 2024',
  { type: QueryTypes.SELECT }
);
```

## Why Use Raw Queries?

Before diving into implementation, let's understand when and why you'd choose raw queries:

1. **Complex SQL Operations** : Some SQL operations are difficult or impossible to express through Sequelize's query builder
2. **Performance Optimization** : Direct SQL can sometimes be more performant
3. **Database-Specific Features** : Accessing features specific to your database engine
4. **Legacy Code Integration** : Working with existing SQL queries

## Setting Up the Foundation

First, let's establish our basic setup. Here's how you import and initialize the necessary components:

```javascript
// Import necessary modules
const { Sequelize, QueryTypes } = require('sequelize');

// Initialize Sequelize instance
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'postgres', // Or 'mysql', 'sqlite', etc.
});

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
```

## Basic Raw Query Structure

The fundamental syntax for raw queries in Sequelize follows this pattern:

```javascript
sequelize.query(sqlStatement, options)
```

Let's break this down with a simple example:

```javascript
async function simpleFetch() {
  // Execute a basic SELECT query
  const users = await sequelize.query(
    'SELECT id, username, email FROM users',
    { type: QueryTypes.SELECT }
  );
  
  console.log(users);
  // Output: [{ id: 1, username: 'john_doe', email: 'john@email.com' }, ...]
}
```

> The `QueryTypes.SELECT` option tells Sequelize to expect an array of objects as the result.

## Understanding Query Types

Sequelize provides several query types to properly handle different SQL operations:

```javascript
const { QueryTypes } = require('sequelize');

// Different query types
const queryTypes = {
  // For SELECT statements
  SELECT: QueryTypes.SELECT,
  
  // For INSERT statements  
  INSERT: QueryTypes.INSERT,
  
  // For UPDATE statements
  UPDATE: QueryTypes.UPDATE,
  
  // For DELETE statements
  DELETE: QueryTypes.DELETE,
  
  // For CREATE/DROP TABLE, etc.
  RAW: QueryTypes.RAW
};
```

Here's how each type works in practice:

```javascript
// SELECT example
const users = await sequelize.query(
  'SELECT * FROM users WHERE active = 1',
  { type: QueryTypes.SELECT }
);

// INSERT example
const [results, metadata] = await sequelize.query(
  "INSERT INTO users (username, email) VALUES ('jane_doe', 'jane@email.com')",
  { type: QueryTypes.INSERT }
);

// UPDATE example
const [results, metadata] = await sequelize.query(
  "UPDATE users SET last_login = NOW() WHERE id = 1",
  { type: QueryTypes.UPDATE }
);

// DELETE example
const [results, metadata] = await sequelize.query(
  'DELETE FROM users WHERE active = 0',
  { type: QueryTypes.DELETE }
);
```

## Parameter Binding: Keeping Your Queries Safe

> Parameter binding is crucial for preventing SQL injection attacks and handling dynamic values safely.

Sequelize offers two parameter binding styles:

### 1. Named Parameters

```javascript
async function findUserByEmail(email) {
  const users = await sequelize.query(
    'SELECT * FROM users WHERE email = :email',
    {
      replacements: { email: email },
      type: QueryTypes.SELECT
    }
  );
  
  return users;
}

// Usage
const user = await findUserByEmail('john@email.com');
```

### 2. Positional Parameters

```javascript
async function findUsersByStatus(status, limit) {
  const users = await sequelize.query(
    'SELECT * FROM users WHERE status = ? LIMIT ?',
    {
      replacements: [status, limit],
      type: QueryTypes.SELECT
    }
  );
  
  return users;
}

// Usage
const activeUsers = await findUsersByStatus('active', 10);
```

Let's see a more complex example combining multiple parameters:

```javascript
async function findUsersWithPagination(status, offset, limit) {
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      COUNT(p.id) as post_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    WHERE u.status = :status
    GROUP BY u.id
    LIMIT :limit OFFSET :offset
  `;
  
  const users = await sequelize.query(query, {
    replacements: {
      status: status,
      offset: offset,
      limit: limit
    },
    type: QueryTypes.SELECT
  });
  
  return users;
}
```

## Model Integration with Raw Queries

You can integrate raw queries with your Sequelize models to get the best of both worlds:

```javascript
// Define a User model
const User = sequelize.define('User', {
  username: Sequelize.STRING,
  email: Sequelize.STRING,
  status: Sequelize.STRING
});

// Use the model with raw queries
async function findActiveUsersWithModels() {
  const users = await sequelize.query(
    'SELECT * FROM users WHERE status = :status',
    {
      replacements: { status: 'active' },
      model: User,
      mapToModel: true
    }
  );
  
  // Now users is an array of User model instances
  users.forEach(user => {
    console.log(user.username); // Access model methods and properties
    console.log(user.get('email')); // Use model methods
  });
}
```

## Handling Transactions with Raw Queries

> Transactions ensure data consistency by grouping multiple operations into an atomic unit.

Here's how to use transactions with raw queries:

```javascript
async function transferFunds(fromUserId, toUserId, amount) {
  const t = await sequelize.transaction();
  
  try {
    // Deduct from sender
    await sequelize.query(
      'UPDATE accounts SET balance = balance - :amount WHERE user_id = :userId',
      {
        replacements: { amount, userId: fromUserId },
        type: QueryTypes.UPDATE,
        transaction: t
      }
    );
  
    // Add to receiver
    await sequelize.query(
      'UPDATE accounts SET balance = balance + :amount WHERE user_id = :userId',
      {
        replacements: { amount, userId: toUserId },
        type: QueryTypes.UPDATE,
        transaction: t
      }
    );
  
    // Commit the transaction
    await t.commit();
    console.log('Transfer successful');
  
  } catch (error) {
    // Rollback on error
    await t.rollback();
    console.error('Transfer failed:', error);
    throw error;
  }
}
```

## Advanced Query Patterns

### 1. Complex Joins with Aggregations

```javascript
async function getUserStatistics() {
  const stats = await sequelize.query(`
    SELECT 
      u.id as user_id,
      u.username,
      COUNT(DISTINCT p.id) as total_posts,
      COUNT(DISTINCT c.id) as total_comments,
      AVG(p.likes) as avg_post_likes,
      MAX(p.created_at) as last_post_date
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    WHERE u.status = 'active'
    GROUP BY u.id, u.username
    HAVING COUNT(p.id) > 0
    ORDER BY total_posts DESC, avg_post_likes DESC
    LIMIT 10
  `, {
    type: QueryTypes.SELECT
  });
  
  return stats;
}
```

### 2. Conditional Logic in Queries

```javascript
async function searchUsers(criteria) {
  let query = 'SELECT * FROM users WHERE 1=1';
  const replacements = {};
  
  if (criteria.username) {
    query += ' AND username LIKE :username';
    replacements.username = `%${criteria.username}%`;
  }
  
  if (criteria.email) {
    query += ' AND email = :email';
    replacements.email = criteria.email;
  }
  
  if (criteria.status) {
    query += ' AND status = :status';
    replacements.status = criteria.status;
  }
  
  if (criteria.createdAfter) {
    query += ' AND created_at > :createdAfter';
    replacements.createdAfter = criteria.createdAfter;
  }
  
  // Add ordering and pagination
  query += ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset';
  replacements.limit = criteria.limit || 20;
  replacements.offset = criteria.offset || 0;
  
  const users = await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT
  });
  
  return users;
}
```

### 3. Bulk Operations

```javascript
async function bulkInsertUsers(users) {
  // Generate the VALUES clause dynamically
  const values = users.map((_, index) => 
    `(:username${index}, :email${index}, :status${index})`
  ).join(', ');
  
  const query = `
    INSERT INTO users (username, email, status)
    VALUES ${values}
    RETURNING id, username, email
  `;
  
  // Build replacements object
  const replacements = {};
  users.forEach((user, index) => {
    replacements[`username${index}`] = user.username;
    replacements[`email${index}`] = user.email;
    replacements[`status${index}`] = user.status || 'active';
  });
  
  const [results] = await sequelize.query(query, {
    replacements,
    type: QueryTypes.INSERT
  });
  
  return results;
}

// Usage
const newUsers = [
  { username: 'user1', email: 'user1@email.com' },
  { username: 'user2', email: 'user2@email.com' },
  { username: 'user3', email: 'user3@email.com' }
];

const insertedUsers = await bulkInsertUsers(newUsers);
```

## Error Handling and Debugging

Proper error handling is crucial when working with raw queries:

```javascript
async function executeQueryWithErrorHandling(query, options = {}) {
  try {
    const results = await sequelize.query(query, {
      ...options,
      logging: console.log // Log the actual SQL being executed
    });
  
    return results;
  
  } catch (error) {
    console.error('Query failed:');
    console.error('SQL:', query);
    console.error('Error:', error.message);
  
    // Handle specific database errors
    if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error occurred');
    }
  
    if (error.original) {
      console.error('Original error:', error.original);
    }
  
    throw error;
  }
}
```

## Best Practices and Performance Optimization

> Following best practices ensures your raw queries are maintainable, secure, and performant.

### 1. Query Optimization Techniques

```javascript
// Use indexes effectively
async function findUsersByEmailDomain(domain) {
  // This query benefits from an index on email
  const users = await sequelize.query(`
    SELECT * FROM users 
    WHERE email LIKE :pattern
    AND status = 'active'
    ORDER BY created_at DESC
  `, {
    replacements: { pattern: `%@${domain}` },
    type: QueryTypes.SELECT
  });
  
  return users;
}

// Batch operations for better performance
async function updateMultipleUsers(userIds, newStatus) {
  const placeholders = userIds.map((_, index) => `:id${index}`).join(',');
  const replacements = {};
  
  userIds.forEach((id, index) => {
    replacements[`id${index}`] = id;
  });
  replacements.newStatus = newStatus;
  
  const query = `
    UPDATE users 
    SET status = :newStatus, updated_at = NOW()
    WHERE id IN (${placeholders})
  `;
  
  await sequelize.query(query, {
    replacements,
    type: QueryTypes.UPDATE
  });
}
```

### 2. Query Caching

```javascript
// Simple in-memory cache for frequently used queries
const queryCache = new Map();

async function cachedQuery(key, query, options, ttl = 300000) {
  // Check if result is cached and not expired
  if (queryCache.has(key)) {
    const { result, expiry } = queryCache.get(key);
    if (Date.now() < expiry) {
      return result;
    }
  }
  
  // Execute query if not cached or expired
  const result = await sequelize.query(query, options);
  
  // Cache the result
  queryCache.set(key, {
    result,
    expiry: Date.now() + ttl
  });
  
  return result;
}

// Usage
const popularPosts = await cachedQuery(
  'popular_posts',
  'SELECT * FROM posts WHERE likes > 100 ORDER BY likes DESC LIMIT 10',
  { type: QueryTypes.SELECT },
  600000 // 10 minutes TTL
);
```

## Integration with Sequelize Migrations

You can also use raw queries in Sequelize migrations:

```javascript
// migrations/add-user-statistics-view.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE VIEW user_statistics AS
      SELECT 
        u.id as user_id,
        u.username,
        COUNT(p.id) as post_count,
        AVG(p.likes) as avg_likes
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id, u.username
    `);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS user_statistics');
  }
};
```

## Real-World Example: Analytics Dashboard

Let's put it all together with a comprehensive example of an analytics dashboard:

```javascript
class AnalyticsDashboard {
  constructor(sequelize) {
    this.sequelize = sequelize;
  }
  
  async getDashboardData(timeRange = '30 days') {
    const transaction = await this.sequelize.transaction();
  
    try {
      // Define date range
      const endDate = new Date();
      const startDate = new Date(endDate - this.getTimeRangeInMs(timeRange));
    
      // Multiple queries for different metrics
      const [
        userGrowth,
        postMetrics,
        engagementMetrics,
        topContributors
      ] = await Promise.all([
        this.getUserGrowth(startDate, endDate, transaction),
        this.getPostMetrics(startDate, endDate, transaction),
        this.getEngagementMetrics(startDate, endDate, transaction),
        this.getTopContributors(startDate, endDate, transaction)
      ]);
    
      await transaction.commit();
    
      return {
        period: { start: startDate, end: endDate },
        userGrowth,
        postMetrics,
        engagementMetrics,
        topContributors
      };
    
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  async getUserGrowth(startDate, endDate, transaction) {
    return await this.sequelize.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) as cumulative_users
      FROM users
      WHERE created_at BETWEEN :startDate AND :endDate
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
      transaction
    });
  }
  
  async getPostMetrics(startDate, endDate, transaction) {
    return await this.sequelize.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as total_posts,
        AVG(likes) as avg_likes,
        MAX(likes) as max_likes,
        COUNT(DISTINCT user_id) as unique_posters
      FROM posts
      WHERE created_at BETWEEN :startDate AND :endDate
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date
    `, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
      transaction
    });
  }
  
  async getEngagementMetrics(startDate, endDate, transaction) {
    return await this.sequelize.query(`
      WITH engagement_data AS (
        SELECT 
          p.id as post_id,
          p.created_at as post_date,
          COUNT(DISTINCT c.id) as comment_count,
          COUNT(DISTINCT l.user_id) as like_count,
          COUNT(DISTINCT s.user_id) as share_count
        FROM posts p
        LEFT JOIN comments c ON p.id = c.post_id
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN shares s ON p.id = s.post_id
        WHERE p.created_at BETWEEN :startDate AND :endDate
        GROUP BY p.id, p.created_at
      )
      SELECT 
        DATE_TRUNC('day', post_date) as date,
        AVG(comment_count) as avg_comments_per_post,
        AVG(like_count) as avg_likes_per_post,
        AVG(share_count) as avg_shares_per_post,
        AVG(comment_count + like_count + share_count) as avg_total_engagement
      FROM engagement_data
      GROUP BY DATE_TRUNC('day', post_date)
      ORDER BY date
    `, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
      transaction
    });
  }
  
  async getTopContributors(startDate, endDate, transaction) {
    return await this.sequelize.query(`
      SELECT 
        u.id,
        u.username,
        COUNT(DISTINCT p.id) as post_count,
        COUNT(DISTINCT c.id) as comment_count,
        SUM(p.likes) as total_likes_received,
        AVG(p.likes) as avg_likes_per_post
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id 
        AND p.created_at BETWEEN :startDate AND :endDate
      LEFT JOIN comments c ON u.id = c.user_id 
        AND c.created_at BETWEEN :startDate AND :endDate
      WHERE u.status = 'active'
      GROUP BY u.id, u.username
      HAVING COUNT(DISTINCT p.id) > 0 OR COUNT(DISTINCT c.id) > 0
      ORDER BY (
        post_count * 3 + 
        comment_count * 1 + 
        total_likes_received * 0.1
      ) DESC
      LIMIT 20
    `, {
      replacements: { startDate, endDate },
      type: QueryTypes.SELECT,
      transaction
    });
  }
  
  getTimeRangeInMs(range) {
    switch (range) {
      case '7 days': return 7 * 24 * 60 * 60 * 1000;
      case '30 days': return 30 * 24 * 60 * 60 * 1000;
      case '90 days': return 90 * 24 * 60 * 60 * 1000;
      case '1 year': return 365 * 24 * 60 * 60 * 1000;
      default: return 30 * 24 * 60 * 60 * 1000;
    }
  }
}

// Usage
const dashboard = new AnalyticsDashboard(sequelize);
const metrics = await dashboard.getDashboardData('30 days');
```

## Summary

Raw queries in Sequelize provide the flexibility to execute complex SQL operations while still benefiting from Sequelize's connection management and parameter binding. Key points to remember:

1. Always use parameter binding to prevent SQL injection
2. Choose the appropriate QueryType for your operation
3. Consider using transactions for related operations
4. Implement proper error handling and logging
5. Cache frequently accessed data when possible
6. Use raw queries when you need features beyond Sequelize's ORM capabilities

> Raw queries are a powerful tool in your Sequelize toolkit. Use them wisely when you need the full power of SQL, but remember that with great power comes great responsibility for security and performance optimization.

The examples provided demonstrate everything from basic SELECT statements to complex analytics queries, giving you a comprehensive foundation for implementing raw queries in your applications.
