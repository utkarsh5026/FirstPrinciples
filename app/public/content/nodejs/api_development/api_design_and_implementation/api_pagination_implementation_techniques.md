# API Pagination in Node.js: A First Principles Guide

When building APIs, one of the most fundamental challenges is handling large sets of data efficiently. Let's explore pagination from the ground up, understanding not just how to implement it in Node.js, but why it exists in the first place.

> The essence of pagination is breaking large datasets into manageable chunks that can be transferred and processed efficiently, improving both system performance and user experience.

## Understanding API Pagination From First Principles

### What Is Pagination and Why Do We Need It?

At its core, pagination is a solution to a fundamental computing constraint: limited resources. When dealing with data, we face several natural limitations:

1. **Network bandwidth** - Transferring large amounts of data consumes bandwidth
2. **Memory constraints** - Both servers and clients have finite memory
3. **Processing time** - Rendering or processing large datasets takes significant time
4. **User experience** - Humans can only process and comprehend a limited amount of information at once

Imagine a database with 10,000 user records. Consider what would happen if we tried to return all records in a single API response:

* The server would need to fetch all 10,000 records from the database
* The complete dataset would need to be held in memory
* The entire payload would need to be transmitted over the network
* The client would need to process all 10,000 records at once

This approach quickly becomes impractical as data grows. Pagination solves this by breaking data into smaller, more manageable "pages."

### The Mathematics of Pagination

At a mathematical level, pagination follows a simple formula:

> **Pages = ⌈Total Items ÷ Items Per Page⌉**

This ceiling function ensures we have enough pages to contain all items, even if the last page is partially filled.

For example, with 1,003 items and 100 items per page:

* Pages = ⌈1,003 ÷ 100⌉ = ⌈10.03⌉ = 11 pages

## Fundamental Pagination Techniques

There are several core approaches to implementing pagination. Let's explore each from first principles.

### 1. Offset-Based Pagination

This is the most intuitive form of pagination, directly mapping to the concept of "pages" in a book.

> **Offset-based pagination** uses two parameters: a page number (or skip/offset count) and a page size (limit), to determine which subset of data to return.

#### How It Works

1. Client requests a specific page number and page size
2. Server calculates how many items to skip: `skip = (page - 1) * limit`
3. Server fetches `limit` items after skipping the calculated number

Let's implement a basic offset-based pagination API in Express:

```javascript
const express = require('express');
const app = express();

// Mock database with 1000 users
const users = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`
}));

app.get('/api/users', (req, res) => {
  // Get pagination parameters with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Calculate offset
  const offset = (page - 1) * limit;
  
  // Get paginated data
  const paginatedUsers = users.slice(offset, offset + limit);
  
  // Return response with pagination metadata
  res.json({
    data: paginatedUsers,
    pagination: {
      total: users.length,
      pages: Math.ceil(users.length / limit),
      currentPage: page,
      pageSize: limit
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this example:

* We parse the `page` and `limit` parameters from the request query
* We calculate the `offset` based on the page number and limit
* We use `slice()` to get the requested subset of users
* We return not just the data, but also pagination metadata

#### Limitations of Offset-Based Pagination

Despite its simplicity, offset-based pagination has significant drawbacks:

* **Performance degradation** : As the offset increases, database performance decreases because the database must scan through all skipped rows
* **Inconsistency with changing data** : If items are added or removed between requests, pages can shift, causing items to be skipped or shown twice

### 2. Cursor-Based Pagination

To overcome the limitations of offset-based pagination, cursor-based pagination was developed.

> **Cursor-based pagination** uses a pointer (cursor) to a specific item in the dataset as a reference point for fetching the next set of results.

#### How It Works

1. Server returns a batch of sorted items along with a cursor that points to the last item
2. Client includes this cursor in the next request
3. Server retrieves items that come after the cursor position

Let's implement a basic cursor-based pagination API:

```javascript
const express = require('express');
const app = express();

// Mock database with 1000 users (sorted by id)
const users = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
}));

// Sort users by creation date (newest first)
users.sort((a, b) => b.createdAt - a.createdAt);

app.get('/api/users', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const cursor = req.query.cursor;
  
  let startIndex = 0;
  
  // If cursor is provided, find the index after the cursor
  if (cursor) {
    const cursorIndex = users.findIndex(user => user.id.toString() === cursor);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }
  
  // Get paginated data
  const paginatedUsers = users.slice(startIndex, startIndex + limit);
  
  // Get new cursor (id of last item)
  const nextCursor = paginatedUsers.length > 0 
    ? paginatedUsers[paginatedUsers.length - 1].id.toString()
    : null;
  
  // Return response with pagination metadata
  res.json({
    data: paginatedUsers,
    pagination: {
      nextCursor: nextCursor,
      hasMore: startIndex + limit < users.length
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this example:

* We use the user ID as our cursor
* If a cursor is provided, we find its position and start from the next item
* We return a new cursor (the ID of the last item in the current page)

#### Benefits of Cursor-Based Pagination

* **Consistent results** : Even if data changes between requests, pagination remains stable
* **Better performance** : No need to count skipped rows
* **Natural for real-time data** : Works well with continuously updating data

### 3. Keyset Pagination

Keyset pagination (also known as "seek method") is a refinement of cursor-based pagination that's optimized for database queries.

> **Keyset pagination** uses the values of the sorted columns themselves as the pagination cursor, creating efficient queries that can leverage database indexes.

Let's implement keyset pagination with a SQL database using the `mysql2` package:

```javascript
const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

// Create database connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test_db'
});

app.get('/api/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const lastId = req.query.lastId;
    const lastCreatedAt = req.query.lastCreatedAt;
  
    let query;
    let params;
  
    // Build query based on cursor values
    if (lastId && lastCreatedAt) {
      // Use keyset pagination
      query = `
        SELECT * FROM users 
        WHERE (created_at < ?) OR (created_at = ? AND id > ?) 
        ORDER BY created_at DESC, id ASC 
        LIMIT ?
      `;
      params = [lastCreatedAt, lastCreatedAt, lastId, limit];
    } else {
      // First page
      query = `
        SELECT * FROM users 
        ORDER BY created_at DESC, id ASC 
        LIMIT ?
      `;
      params = [limit];
    }
  
    // Execute query
    const [rows] = await pool.execute(query, params);
  
    // Calculate next cursor
    const nextCursor = rows.length > 0 ? {
      lastId: rows[rows.length - 1].id,
      lastCreatedAt: rows[rows.length - 1].created_at
    } : null;
  
    // Check if more results exist
    let hasMore = false;
    if (rows.length === limit) {
      const [moreResults] = await pool.execute(
        `SELECT 1 FROM users 
         WHERE (created_at < ?) OR (created_at = ? AND id > ?) 
         LIMIT 1`,
        [nextCursor.lastCreatedAt, nextCursor.lastCreatedAt, nextCursor.lastId]
      );
      hasMore = moreResults.length > 0;
    }
  
    // Return response
    res.json({
      data: rows,
      pagination: {
        nextCursor: nextCursor,
        hasMore: hasMore
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this example:

* We use a composite cursor based on both `created_at` and `id` columns
* We craft SQL conditions that can efficiently use database indexes
* We check if more results exist by doing a small additional query

The SQL condition `WHERE (created_at < ?) OR (created_at = ? AND id > ?)` is crucial for keyset pagination. It:

1. Gets records with an earlier creation date than the cursor
2. OR gets records with the same creation date but a higher ID

This approach works with any ordered columns, not just dates and IDs.

## Practical Implementation in Node.js with Popular Databases

Let's explore practical implementations with commonly used databases in Node.js applications.

### MongoDB Pagination

MongoDB has built-in methods for pagination. Here's how to implement both offset-based and cursor-based pagination:

#### Offset-Based Pagination in MongoDB

```javascript
const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let usersCollection;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    const database = client.db('test_db');
    usersCollection = database.collection('users');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

connectToMongo();

app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  
    // Get paginated data
    const users = await usersCollection.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  
    // Get total count for pagination metadata
    const total = await usersCollection.countDocuments();
  
    res.json({
      data: users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this MongoDB example:

* We use the `.skip()` and `.limit()` methods to implement offset-based pagination
* We use `.countDocuments()` to get the total number of items for pagination metadata

#### Cursor-Based Pagination in MongoDB

```javascript
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();

// MongoDB connection setup (same as before)
// ...

app.get('/api/users', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursorId = req.query.cursor;
  
    // Build query
    let query = {};
    if (cursorId) {
      // Convert string cursor to ObjectId
      const cursorObjectId = new ObjectId(cursorId);
      query = { _id: { $lt: cursorObjectId } };
    }
  
    // Get paginated data
    const users = await usersCollection.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1) // Get one extra to check if more results exist
      .toArray();
  
    // Determine if more results exist
    const hasMore = users.length > limit;
  
    // Remove the extra item if it exists
    if (hasMore) {
      users.pop();
    }
  
    // Get new cursor (ID of last item)
    const nextCursor = users.length > 0 
      ? users[users.length - 1]._id.toString()
      : null;
  
    res.json({
      data: users,
      pagination: {
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

In this MongoDB cursor example:

* We use MongoDB's `_id` field as our cursor, which is automatically indexed
* We query documents with an ID less than the cursor ID
* We request one extra item to determine if more results exist beyond our limit

### Sequelize (SQL) Pagination

If you're using Sequelize ORM with a SQL database, here's how to implement pagination:

```javascript
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();

// Set up Sequelize
const sequelize = new Sequelize('test_db', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

// Define User model
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  createdAt: {
    type: DataTypes.DATE
  }
});

// Sync model with database
sequelize.sync();

// Offset-based pagination endpoint
app.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    // Query with pagination
    const { count, rows } = await User.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  
    res.json({
      data: rows,
      pagination: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cursor-based pagination endpoint
app.get('/api/users/cursor', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor;
  
    let whereClause = {};
  
    if (cursor) {
      const [cursorTimestamp, cursorId] = cursor.split('_');
      whereClause = {
        [Sequelize.Op.or]: [
          { createdAt: { [Sequelize.Op.lt]: new Date(parseInt(cursorTimestamp)) } },
          {
            createdAt: new Date(parseInt(cursorTimestamp)),
            id: { [Sequelize.Op.gt]: parseInt(cursorId) }
          }
        ]
      };
    }
  
    // Query with cursor pagination
    const users = await User.findAll({
      where: whereClause,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'ASC']
      ],
      limit: limit + 1 // Get one extra to check if more results exist
    });
  
    // Determine if more results exist
    const hasMore = users.length > limit;
  
    // Remove the extra item if it exists
    if (hasMore) {
      users.pop();
    }
  
    // Get new cursor
    const nextCursor = users.length > 0 
      ? `${users[users.length - 1].createdAt.getTime()}_${users[users.length - 1].id}`
      : null;
  
    res.json({
      data: users,
      pagination: {
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

This implementation demonstrates both approaches with Sequelize:

* For offset-based pagination, we use Sequelize's built-in `findAndCountAll()` method with `limit` and `offset` parameters
* For cursor-based pagination, we craft a more complex `where` clause using Sequelize operators

## Advanced Pagination Concepts

### Handling Edge Cases

Real-world pagination implementations must handle various edge cases:

#### 1. Empty Results

Always check if there are results before attempting to generate a cursor:

```javascript
const nextCursor = results.length > 0 
  ? generateCursor(results[results.length - 1]) 
  : null;
```

#### 2. Invalid Cursor

Validate and handle invalid cursors gracefully:

```javascript
app.get('/api/users', async (req, res) => {
  try {
    const cursor = req.query.cursor;
  
    if (cursor) {
      try {
        // Validate cursor (e.g., decode, check signature, etc.)
        const decodedCursor = validateAndDecodeCursor(cursor);
        // Continue with pagination...
      } catch (cursorError) {
        // Invalid cursor, return first page instead
        return res.status(400).json({ 
          error: 'Invalid cursor', 
          message: 'Returning first page of results' 
        });
      }
    }
  
    // Continue with normal pagination logic...
  } catch (error) {
    // Handle other errors...
  }
});
```

#### 3. Deleted Resources

For cursor-based pagination, handle the case where the cursor item no longer exists:

```javascript
// If the cursor item doesn't exist, find the closest match
if (cursorItem === null) {
  query = {
    createdAt: { $lt: cursorTimestamp }
  };
  // Continue with modified query...
}
```

### Performance Optimization

Pagination can be optimized in several ways:

#### 1. Using Compound Indexes

For cursor-based and keyset pagination, create compound indexes on the columns used for sorting and filtering:

```javascript
// MongoDB example
db.users.createIndex({ createdAt: -1, _id: 1 });

// SQL example
CREATE INDEX idx_users_created_id ON users (created_at DESC, id ASC);
```

These indexes dramatically improve query performance by allowing the database to efficiently locate the starting point for each page.

#### 2. Projecting Only Needed Fields

Retrieve only the fields you need to reduce data transfer:

```javascript
// MongoDB example
const users = await usersCollection.find(query, {
  projection: { name: 1, email: 1, createdAt: 1 }
})
.sort({ createdAt: -1 })
.limit(limit)
.toArray();
```

#### 3. Cursor Encoding and Security

For cursor-based pagination, consider encoding and signing cursors to prevent tampering:

```javascript
// Encode cursor
function encodeCursor(cursorData) {
  const jsonString = JSON.stringify(cursorData);
  return Buffer.from(jsonString).toString('base64');
}

// Decode cursor
function decodeCursor(cursor) {
  try {
    const jsonString = Buffer.from(cursor, 'base64').toString();
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid cursor');
  }
}
```

For production applications, consider adding a signature with a secret key to prevent cursor tampering.

## Standardizing Pagination Response Format

Consistent API responses make client-side implementation easier. Let's define a standard pagination response format:

```javascript
// Example standard response format
{
  "data": [...],        // Array of items for the current page
  "pagination": {
    // For offset-based pagination
    "total": 100,       // Total number of items
    "pages": 10,        // Total number of pages
    "currentPage": 1,   // Current page number
    "pageSize": 10,     // Items per page
  
    // For cursor-based pagination
    "nextCursor": "abc123", // Cursor for the next page
    "prevCursor": "xyz789", // Cursor for the previous page (if applicable)
    "hasMore": true     // Whether more items exist
  },
  "links": {
    "self": "/api/users?page=1&limit=10",
    "next": "/api/users?page=2&limit=10",
    "prev": null,
    "first": "/api/users?page=1&limit=10",
    "last": "/api/users?page=10&limit=10"
  }
}
```

This format follows REST conventions and includes HATEOAS (Hypermedia as the Engine of Application State) links, making API navigation intuitive.

## Building a Reusable Pagination Middleware

Let's create a reusable Express middleware for pagination:

```javascript
// pagination.js - Reusable pagination middleware

/**
 * Creates pagination middleware for Express
 * @param {Object} options - Pagination options
 * @returns {Function} Express middleware
 */
function paginationMiddleware(options = {}) {
  const defaultOptions = {
    defaultLimit: 10,
    maxLimit: 100,
    type: 'offset' // or 'cursor'
  };
  
  const config = { ...defaultOptions, ...options };
  
  return (req, res, next) => {
    // Parse pagination parameters
    if (config.type === 'offset') {
      // Offset-based pagination
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(
        parseInt(req.query.limit) || config.defaultLimit,
        config.maxLimit
      );
      const offset = (page - 1) * limit;
    
      // Add pagination info to request object
      req.pagination = {
        page,
        limit,
        offset,
        type: 'offset'
      };
    
      // Add link generator function
      req.pagination.generateLinks = (baseUrl, total) => {
        const pages = Math.ceil(total / limit);
        return {
          self: `${baseUrl}?page=${page}&limit=${limit}`,
          next: page < pages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
          prev: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
          first: `${baseUrl}?page=1&limit=${limit}`,
          last: `${baseUrl}?page=${pages}&limit=${limit}`
        };
      };
    } else {
      // Cursor-based pagination
      const cursor = req.query.cursor;
      const limit = Math.min(
        parseInt(req.query.limit) || config.defaultLimit,
        config.maxLimit
      );
    
      // Add pagination info to request object
      req.pagination = {
        cursor,
        limit,
        type: 'cursor'
      };
    
      // Add link generator function
      req.pagination.generateLinks = (baseUrl, nextCursor, prevCursor) => {
        return {
          self: cursor ? `${baseUrl}?cursor=${cursor}&limit=${limit}` : `${baseUrl}?limit=${limit}`,
          next: nextCursor ? `${baseUrl}?cursor=${nextCursor}&limit=${limit}` : null,
          prev: prevCursor ? `${baseUrl}?cursor=${prevCursor}&limit=${limit}` : null,
          first: `${baseUrl}?limit=${limit}`
        };
      };
    }
  
    next();
  };
}

module.exports = paginationMiddleware;
```

And here's how to use it:

```javascript
const express = require('express');
const paginationMiddleware = require('./pagination');
const app = express();

// Apply pagination middleware
app.use('/api/users', paginationMiddleware({
  defaultLimit: 20,
  maxLimit: 50
}));

app.get('/api/users', async (req, res) => {
  try {
    // Get pagination parameters from middleware
    const { page, limit, offset, type, generateLinks } = req.pagination;
  
    // Use pagination parameters in your database query
    if (type === 'offset') {
      // Offset-based pagination query
      const { count, rows } = await User.findAndCountAll({
        limit,
        offset
      });
    
      // Generate pagination links
      const links = generateLinks('/api/users', count);
    
      res.json({
        data: rows,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: page,
          pageSize: limit
        },
        links
      });
    } else {
      // Cursor-based pagination query
      // ...
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

This middleware:

* Parses and validates pagination parameters
* Enforces limits on page size
* Provides helper functions for generating pagination links
* Supports both offset-based and cursor-based pagination

## Real-Time Pagination with WebSockets

For dynamic applications, you can combine pagination with WebSockets to provide real-time updates:

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB setup
// ...

// Track active cursors by client
const activeClients = new Map();

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('watchCollection', async (params) => {
    const { collection, limit, cursor } = params;
  
    // Store client cursor information
    activeClients.set(socket.id, { collection, cursor, limit });
  
    // Send initial data
    await sendPaginatedData(socket, collection, cursor, limit);
  
    // Set up change stream
    const changeStream = usersCollection.watch();
  
    changeStream.on('change', async () => {
      // Collection has changed, re-send updated data
      const clientInfo = activeClients.get(socket.id);
      if (clientInfo) {
        await sendPaginatedData(
          socket, 
          clientInfo.collection,
          clientInfo.cursor,
          clientInfo.limit
        );
      }
    });
  
    socket.on('disconnect', () => {
      activeClients.delete(socket.id);
      changeStream.close();
    });
  });
  
  socket.on('updateCursor', (newCursor) => {
    const clientInfo = activeClients.get(socket.id);
    if (clientInfo) {
      activeClients.set(socket.id, { 
        ...clientInfo,
        cursor: newCursor
      });
    
      // Send updated data with new cursor
      sendPaginatedData(
        socket, 
        clientInfo.collection,
        newCursor,
        clientInfo.limit
      );
    }
  });
});

async function sendPaginatedData(socket, collection, cursor, limit) {
  try {
    // Query with cursor pagination (similar to previous examples)
    // ...
  
    socket.emit('paginatedData', {
      data: results,
      pagination: {
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    socket.emit('error', { message: 'Error fetching data' });
  }
}

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

This implementation:

* Sets up a WebSocket connection with Socket.IO
* Allows clients to "watch" a collection with pagination parameters
* Uses MongoDB change streams to detect database changes
* Re-sends paginated data when the collection changes
* Allows clients to update their cursor position

## Best Practices for API Pagination

### 1. Documentation

Always document your pagination approach clearly:

```javascript
/**
 * @api {get} /api/users Get Users
 * @apiName GetUsers
 * @apiGroup User
 *
 * @apiParam {Number} [page=1] Page number for offset-based pagination
 * @apiParam {Number} [limit=10] Number of items per page (max 100)
 * @apiParam {String} [cursor] Cursor for cursor-based pagination
 *
 * @apiSuccess {Object[]} data Array of user objects
 * @apiSuccess {Object} pagination Pagination metadata
 * @apiSuccess {Number} pagination.total Total number of items (offset-based only)
 * @apiSuccess {Number} pagination.pages Total number of pages (offset-based only)
 * @apiSuccess {Number} pagination.currentPage Current page number (offset-based only)
 * @apiSuccess {String} pagination.nextCursor Cursor for next page (cursor-based only)
 * @apiSuccess {Boolean} pagination.hasMore Whether more items exist (cursor-based only)
 */
```

### 2. Error Handling

Implement robust error handling for pagination parameters:

```javascript
app.get('/api/users', (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
  
    // Validate parameters
    if (page < 1) {
      return res.status(400).json({ 
        error: 'Invalid page number',
        message: 'Page number must be greater than 0'
      });
    }
  
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'Invalid limit',
        message: 'Limit must be between 1 and 100'
      });
    }
  
    // Continue with valid parameters...
  } catch (error) {
    // Handle other errors...
  }
});
```

### 3. Caching

Implement caching for paginated results to improve performance:

```javascript
const express = require('express');
const NodeCache = require('node-cache');
const app = express();

// Create cache with 5-minute TTL
const cache = new NodeCache({ stdTTL: 300 });

app.get('/api/users', async (req, res) => {
  try {
    // Generate cache key from query parameters
    const cacheKey = `users_${JSON.stringify(req.query)}`;
  
    // Check if result is in cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
  
    // Fetch data from database
    // ...
  
    // Store result in cache
    cache.set(cacheKey, result);
  
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

> Caching paginated results can dramatically reduce database load, but be careful with cache invalidation when data changes.

## Pagination in GraphQL APIs

If you're using GraphQL instead of REST, pagination is typically implemented using the Connections specification from Relay:

```javascript
const { ApolloServer, gql } = require('apollo-server');

// Define GraphQL schema with Relay-style connections
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }
  
  type UserEdge {
    cursor: String!
    node: User!
  }
  
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
  
  type UserConnection {
    edges: [UserEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }
  
  type Query {
    users(first: Int, after: String, last: Int, before: String): UserConnection!
  }
`;

// Implement resolvers
const resolvers = {
  Query: {
    users: async (_, args) => {
      const { first, after, last, before } = args;
    
      // Implement cursor-based pagination logic
      // ...
    
      return {
        edges: results.map(user => ({
          cursor: encodeCursor(user),
          node: user
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage,
          startCursor: results.length > 0 ? encodeCursor(results[0]) : null,
          endCursor: results.length > 0 ? encodeCursor(results[results.length - 1]) : null
        },
        totalCount
      };
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`GraphQL server running at ${url}`);
});
```

The GraphQL Connections specification provides a standard way to paginate data in GraphQL APIs, with:

* `edges` containing cursor information with each item
* `pageInfo` providing navigation metadata
* Support for both forward and backward pagination

## Summary

> Pagination is a fundamental pattern for API design that addresses core constraints in data transfer, processing, and display. The choice of pagination strategy depends on your specific requirements for performance, consistency, and user experience.

From first principles, we've explored:

1. **Why pagination exists** : To handle resource constraints and improve performance
2. **Core pagination techniques** :

* Offset-based pagination (simple but with performance issues at scale)
* Cursor-based pagination (better for large datasets and real-time data)
* Keyset pagination (database-optimized cursors)

1. **Implementation patterns in Node.js** :

* Express.js endpoint implementation
* MongoDB integration
* SQL/Sequelize integration
* Reusable middleware

1. **Advanced concepts** :

* Edge case handling
* Performance optimization
* Real-time pagination with WebSockets
* GraphQL pagination

By understanding pagination from first principles, you can make informed decisions about the right approach for your specific application requirements, ensuring your APIs remain performant and user-friendly even as your data scales.
