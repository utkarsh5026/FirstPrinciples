# Understanding NoSQL Injection Prevention in Node.js

Let me walk you through the complete journey of understanding and preventing NoSQL injection attacks, starting from the very beginning.

## What is NoSQL? (First Principles)

To understand NoSQL injection, we first need to understand what NoSQL is. Think of NoSQL as the "non-traditional" database:

> **Core Concept** : NoSQL stands for "Not Only SQL" and represents databases that break away from the traditional table-based relational database model.

Imagine you're organizing your books. Traditional SQL databases are like organizing them in a library with specific shelves, rows, and catalog numbers. NoSQL databases are like having different ways to organize - maybe by color, size, or just throwing them in different rooms based on vibes!

The most common NoSQL databases include:

* MongoDB (document-based)
* Redis (key-value)
* Cassandra (column-family)
* Neo4j (graph-based)

## What is Injection? (Building the Foundation)

An injection attack is like someone sneaking their own rules into your conversation. Imagine you're at a restaurant and the waiter asks "What would you like to order?" You say "I'll have the pasta," but someone else whispers additional instructions: "...and make everything in the kitchen free!"

> **Key Principle** : Injection happens when untrusted data is sent as part of a command or query, allowing attackers to change the intended behavior.

Let's look at a simple example in MongoDB (the most common NoSQL database):

```javascript
// Dangerous code - DON'T DO THIS!
const userInput = req.body.username;
const query = { username: userInput };
db.collection('users').findOne(query);
```

This looks innocent, but what if `userInput` is not just a string?

## Understanding NoSQL Injection

NoSQL injection is different from SQL injection because NoSQL databases use different query languages. Let's break this down:

### MongoDB Query Structure

MongoDB uses JSON-like syntax for queries. Here's a simple query:

```javascript
// Normal query
{ username: "john", password: "secret123" }

// This translates to: Find a user where username is "john" AND password is "secret123"
```

### The Attack Vector

The attack happens when we let users control not just the values, but the structure of our queries:

```javascript
// Vulnerable code
const userInput = JSON.parse(req.body.userInput);
const query = { username: userInput };
```

If an attacker sends:

```json
{
  "$ne": "nonexistent"
}
```

The query becomes:

```javascript
{ username: { "$ne": "nonexistent" } }
// This means: Find a user where username is NOT "nonexistent" 
// This would return the first user in the database!
```

## Real-World Attack Examples

Let's see how these attacks work in practice:

### Example 1: Authentication Bypass

```javascript
// Vulnerable login function
async function login(req, res) {
  const { username, password } = req.body;
  
  // VULNERABLE: Direct user input in query
  const user = await db.collection('users').findOne({
    username: username,
    password: password
  });
  
  if (user) {
    // User authenticated!
    return res.json({ success: true });
  }
}
```

An attacker could send:

```json
{
  "username": {"$ne": null},
  "password": {"$ne": null}
}
```

This query means "find a user where username is not null AND password is not null," which would return the first user and bypass authentication!

### Example 2: Data Extraction

```javascript
// Vulnerable search function
async function searchUsers(req, res) {
  const searchTerm = req.query.search;
  
  // VULNERABLE: User input directly in regex
  const users = await db.collection('users').find({
    email: new RegExp(searchTerm, 'i')
  }).toArray();
  
  res.json(users);
}
```

An attacker could send:

```
/search?search=.* 
```

The `.*` regex matches everything, exposing all user emails!

## Prevention Strategies: Building Secure Defenses

Now that we understand the threats, let's build proper defenses:

### 1. Input Validation and Sanitization

> **Golden Rule** : Never trust user input. Always validate and sanitize before using it in queries.

```javascript
function sanitizeUserInput(input) {
  // Remove MongoDB operators
  if (typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // Remove keys starting with $
      if (!key.startsWith('$')) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  return input;
}

// Usage
const cleanInput = sanitizeUserInput(req.body);
```

### 2. Type Checking

Always ensure your inputs are the expected type:

```javascript
function validateLoginInput(username, password) {
  // Ensure both are strings
  if (typeof username !== 'string' || typeof password !== 'string') {
    throw new Error('Invalid input types');
  }
  
  // Additional validation
  if (!username || !password) {
    throw new Error('Username and password required');
  }
  
  return { username, password };
}

// Usage
try {
  const { username, password } = validateLoginInput(
    req.body.username, 
    req.body.password
  );
  
  // Now safe to use in query
  const user = await db.collection('users').findOne({
    username,
    password: hashPassword(password)
  });
} catch (error) {
  res.status(400).json({ error: error.message });
}
```

### 3. Using Schema Validation

Implement schemas to define exactly what your data should look like:

```javascript
const Joi = require('joi');

const userLoginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

async function login(req, res) {
  // Validate against schema
  const { error, value } = userLoginSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  // Now value is guaranteed to be clean
  const { username, password } = value;
  
  const user = await db.collection('users').findOne({
    username,
    password: hashPassword(password)
  });
  
  if (user) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}
```

### 4. Parameterized Queries and White-listing

Create a query builder that only allows safe operations:

```javascript
class SafeQueryBuilder {
  constructor() {
    this.allowedFields = ['username', 'email', 'status'];
    this.query = {};
  }
  
  where(field, value) {
    // Only allow whitelisted fields
    if (!this.allowedFields.includes(field)) {
      throw new Error(`Field ${field} not allowed`);
    }
  
    // Ensure value is not an object (no MongoDB operators)
    if (typeof value === 'object') {
      throw new Error('Complex query operators not allowed');
    }
  
    this.query[field] = value;
    return this;
  }
  
  build() {
    return this.query;
  }
}

// Usage
const query = new SafeQueryBuilder()
  .where('username', req.body.username)
  .where('status', 'active')
  .build();

const user = await db.collection('users').findOne(query);
```

## Advanced Protection Techniques

### 1. Using MongoDB's New Features

Modern MongoDB versions offer built-in protection:

```javascript
// Use MongoDB's $expr for safer queries
const user = await db.collection('users').findOne({
  $and: [
    { username: req.body.username },
    { password: hashedPassword }
  ]
});
```

### 2. Implement Rate Limiting

Prevent brute force attacks by limiting request rates:

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

app.post('/login', loginLimiter, login);
```

### 3. Logging and Monitoring

Always log suspicious queries:

```javascript
function logSuspiciousQuery(query, userInfo) {
  const suspicious = JSON.stringify(query).includes('$') || 
                    typeof query === 'object' && 
                    Object.keys(query).some(key => key.startsWith('$'));
  
  if (suspicious) {
    console.warn('Suspicious query detected:', {
      query,
      user: userInfo,
      timestamp: new Date().toISOString(),
      ip: userInfo.ip
    });
  }
}
```

## Complete Secure Implementation Example

Here's a complete example bringing everything together:

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(express.json());

// Schema for validation
const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

// Safe query builder
class UserQueryBuilder {
  constructor() {
    this.query = {};
  }
  
  byUsername(username) {
    if (typeof username !== 'string') {
      throw new Error('Username must be a string');
    }
    this.query.username = username;
    return this;
  }
  
  byStatus(status) {
    const allowedStatuses = ['active', 'inactive', 'pending'];
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    this.query.status = status;
    return this;
  }
  
  build() {
    return this.query;
  }
}

// Secure login endpoint
app.post('/login', async (req, res) => {
  try {
    // 1. Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  
    const { username, password } = value;
  
    // 2. Build safe query
    const query = new UserQueryBuilder()
      .byUsername(username)
      .byStatus('active')
      .build();
  
    // 3. Find user
    const user = await db.collection('users').findOne(query);
  
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  
    // 4. Verify password
    const validPassword = await bcrypt.compare(password, user.password);
  
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  
    // 5. Success
    res.json({ 
      success: true, 
      userId: user._id 
    });
  
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Testing Your Security

Always test your security measures:

```javascript
// Test helper function
async function testNoSQLInjection() {
  const maliciousInputs = [
    { username: { "$ne": null }, password: { "$ne": null } },
    { username: { "$gt": "" }, password: { "$gt": "" } },
    { username: "admin", password: { "$regex": ".*" } },
    { username: { "$where": "this.username" }, password: "anything" }
  ];
  
  for (const input of maliciousInputs) {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
    
      console.log('Test result:', {
        input,
        status: response.status,
        success: response.status === 200
      });
    
      // This should always fail in a secure implementation
      if (response.status === 200) {
        console.error('SECURITY VULNERABILITY DETECTED!');
      }
    } catch (error) {
      console.log('Test failed (expected for malicious input):', error.message);
    }
  }
}
```

## Summary: Your Defense Checklist

> **Remember These Key Points** :
>
> 1. **Never trust user input** - Always validate, sanitize, and type-check
> 2. **Use schema validation** - Define exactly what data you expect
> 3. **Build safe queries** - Use query builders or parameterized queries
> 4. **Whitelist operations** - Only allow specific fields and operations
> 5. **Hash passwords** - Never store plain text passwords
> 6. **Monitor and log** - Track suspicious activity
> 7. **Test regularly** - Verify your security measures work

By following these principles and implementing these techniques, you'll create a robust defense against NoSQL injection attacks in your Node.js applications. Remember, security is an ongoing process - stay updated with the latest threats and best practices!
