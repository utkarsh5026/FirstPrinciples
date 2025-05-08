# Resource Naming and URI Structure Design in Node.js: A First Principles Approach

When building web applications with Node.js, one of the most fundamental aspects of your architecture is how you name and structure your resources and URIs (Uniform Resource Identifiers). This forms the foundation of your API design and significantly impacts the usability, maintainability, and scalability of your application.

## Understanding Resources and URIs from First Principles

### What is a Resource?

> A resource is any discrete entity or concept that can be identified, named, addressed, handled, and manipulated in some way on the web.

Resources can be:

* Physical objects (a product, a person)
* Virtual objects (a user account, a shopping cart)
* Abstract concepts (a service, a relationship between entities)
* Collections of other resources (all users, all products in a category)

### What is a URI?

> A URI (Uniform Resource Identifier) is a string of characters that identifies a resource on the network.

URIs provide a way to locate and interact with resources. They are the addresses that clients use to find and manipulate resources on your server.

The most common type of URI we work with is the URL (Uniform Resource Locator), which is a subset of URI that includes the network location.

## The Anatomy of a URI

Let's break down a typical URI:

```
https://api.example.com/v1/users/123/orders?status=pending#details
```

This can be decomposed into:

* Scheme: `https://`
* Authority: `api.example.com`
* Path: `/v1/users/123/orders`
* Query: `?status=pending`
* Fragment: `#details`

In Node.js applications, we primarily focus on designing the path and query components, as these are what our routing logic will handle.

## Principles of Good Resource Naming

### 1. Use Nouns, Not Verbs

Resources should be named with nouns representing the entities, not verbs representing actions.

> Think about *what* the resource is, not *what* you do with it.

Poor:

```
/getUsers
/createOrder
/deleteProduct/123
```

Better:

```
/users
/orders
/products/123
```

The HTTP methods (GET, POST, PUT, DELETE) already convey the action, so there's no need to include verbs in your resource names.

### 2. Use Plural Nouns for Collections

For consistency, use plural nouns for collection resources.

```
/users      (represents all users)
/users/123  (represents a specific user)
/products   (represents all products)
```

### 3. Use Resource Hierarchies for Related Resources

When resources are related, represent this in the URI structure.

```
/users/123/orders     (all orders for user 123)
/orders/456/items     (all line items in order 456)
```

This creates a logical hierarchy that's intuitive to understand and navigate.

## Implementing Resource URIs in Node.js

Let's see how we can implement these principles in a Node.js application using Express.js, which is one of the most popular web frameworks for Node.js.

### Basic Express.js Router Setup

Here's how to set up routes for a simple user resource:

```javascript
const express = require('express');
const router = express.Router();

// GET all users
router.get('/users', (req, res) => {
  // Logic to fetch all users
  res.send('List of all users');
});

// GET a specific user
router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  // Logic to fetch user with ID
  res.send(`Details for user ${userId}`);
});

// POST a new user
router.post('/users', (req, res) => {
  // Logic to create a new user
  res.status(201).send('User created');
});

// PUT to update a user
router.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  // Logic to update user with ID
  res.send(`User ${userId} updated`);
});

// DELETE a user
router.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  // Logic to delete user with ID
  res.send(`User ${userId} deleted`);
});

module.exports = router;
```

This code establishes five endpoints that follow RESTful principles:

* `GET /users` - Retrieve all users
* `GET /users/:id` - Retrieve a specific user
* `POST /users` - Create a new user
* `PUT /users/:id` - Update a specific user
* `DELETE /users/:id` - Delete a specific user

The `:id` in the routes is a route parameter that Express automatically extracts and makes available in the `req.params` object.

### Implementing Resource Hierarchies

Let's expand our example to include orders that belong to users:

```javascript
// Get all orders for a specific user
router.get('/users/:userId/orders', (req, res) => {
  const userId = req.params.userId;
  // Logic to fetch all orders for this user
  res.send(`All orders for user ${userId}`);
});

// Get a specific order for a specific user
router.get('/users/:userId/orders/:orderId', (req, res) => {
  const userId = req.params.userId;
  const orderId = req.params.orderId;
  // Logic to fetch the specific order
  res.send(`Order ${orderId} for user ${userId}`);
});

// Create a new order for a specific user
router.post('/users/:userId/orders', (req, res) => {
  const userId = req.params.userId;
  // Logic to create a new order for this user
  res.status(201).send(`Created new order for user ${userId}`);
});
```

This implementation respects the resource hierarchy by nesting orders under users, making it clear that these orders belong to specific users.

## Versioning Your API

API versioning is a crucial aspect of URI design that allows you to evolve your API without breaking existing clients.

### Approach 1: URI Path Versioning

This is the most common approach, where the version is included in the URI path:

```
/v1/users
/v2/users
```

Implementation in Express:

```javascript
// Version 1 routes
const v1Router = express.Router();
v1Router.get('/users', v1UserController.getAll);
app.use('/v1', v1Router);

// Version 2 routes
const v2Router = express.Router();
v2Router.get('/users', v2UserController.getAll);
app.use('/v2', v2Router);
```

### Approach 2: Query Parameter Versioning

Version is specified as a query parameter:

```
/users?version=1
/users?version=2
```

Implementation:

```javascript
router.get('/users', (req, res) => {
  const version = req.query.version || '1'; // Default to version 1
  
  if (version === '1') {
    // Version 1 logic
  } else if (version === '2') {
    // Version 2 logic
  } else {
    res.status(400).send('Unsupported API version');
  }
});
```

### Approach 3: Header Versioning

Version is specified in a custom HTTP header:

```
Accept-Version: 1
```

Implementation:

```javascript
router.get('/users', (req, res) => {
  const version = req.header('Accept-Version') || '1';
  
  if (version === '1') {
    // Version 1 logic
  } else if (version === '2') {
    // Version 2 logic
  } else {
    res.status(400).send('Unsupported API version');
  }
});
```

## Query Parameters for Filtering, Sorting, and Pagination

Query parameters should be used for operations that filter, sort, or paginate resources, rather than changing the resource's identity.

### Filtering

```
/products?category=electronics
/users?status=active
```

Implementation:

```javascript
router.get('/products', (req, res) => {
  const category = req.query.category;
  
  // If a category is provided, filter products
  if (category) {
    // Logic to filter products by category
    return res.send(`Products in category: ${category}`);
  }
  
  // Otherwise, return all products
  res.send('All products');
});
```

### Sorting

```
/products?sort=price_asc
/users?sort=name_desc
```

Implementation:

```javascript
router.get('/products', (req, res) => {
  const sort = req.query.sort;
  
  if (sort === 'price_asc') {
    // Logic to sort products by price ascending
  } else if (sort === 'price_desc') {
    // Logic to sort products by price descending
  }
  
  res.send('Sorted products');
});
```

### Pagination

```
/products?page=2&limit=20
```

Implementation:

```javascript
router.get('/products', (req, res) => {
  // Default to page 1 with 10 items per page
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  // Calculate the starting index
  const startIndex = (page - 1) * limit;
  
  // Logic to retrieve products with pagination
  res.send(`Products ${startIndex + 1}-${startIndex + limit}`);
});
```

## Advanced Concepts in URI Design

### 1. HATEOAS (Hypermedia as the Engine of Application State)

HATEOAS is a constraint of REST that suggests including links in the response that tell the client what they can do next.

Example response:

```javascript
router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Fetch user data
  const userData = { id: userId, name: 'John Doe' };
  
  // Add hypermedia links
  userData._links = {
    self: { href: `/users/${userId}` },
    orders: { href: `/users/${userId}/orders` },
    update: { href: `/users/${userId}`, method: 'PUT' },
    delete: { href: `/users/${userId}`, method: 'DELETE' }
  };
  
  res.json(userData);
});
```

This approach allows clients to discover available actions dynamically, making your API more self-documenting and easier to navigate.

### 2. Content Negotiation

Content negotiation allows clients to specify the format they want the response in.

Implementation using Express:

```javascript
router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const userData = { id: userId, name: 'John Doe' };
  
  // Respond with different formats based on Accept header
  res.format({
    'application/json': function() {
      res.json(userData);
    },
    'application/xml': function() {
      // Convert to XML and send
      const xml = `<user><id>${userData.id}</id><name>${userData.name}</name></user>`;
      res.type('application/xml').send(xml);
    },
    default: function() {
      // Default to JSON
      res.json(userData);
    }
  });
});
```

### 3. Using HTTP Status Codes Appropriately

The HTTP status code is an essential part of resource interaction. Here's how to use them in Express:

```javascript
router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Check if user exists (in a real app, this would query a database)
  const userExists = checkIfUserExists(userId);
  
  if (!userExists) {
    // 404 Not Found - The resource doesn't exist
    return res.status(404).send(`User ${userId} not found`);
  }
  
  // 200 OK - The request succeeded
  res.status(200).json({ id: userId, name: 'John Doe' });
});

router.post('/users', (req, res) => {
  // Validate request data
  if (!req.body.name) {
    // 400 Bad Request - The request couldn't be understood
    return res.status(400).send('Name is required');
  }
  
  // Create user (in a real app, this would save to a database)
  const newUserId = createUser(req.body);
  
  // 201 Created - A new resource was created
  res.status(201).json({ 
    id: newUserId, 
    name: req.body.name,
    _links: {
      self: { href: `/users/${newUserId}` }
    }
  });
});
```

## Practical Example: Building a RESTful Blog API

Let's put everything together in a more comprehensive example of a blog API:

```javascript
const express = require('express');
const app = express();
const port = 3000;

// Middleware for parsing JSON bodies
app.use(express.json());

// API Version 1 Router
const v1Router = express.Router();

// Posts Resource
v1Router.get('/posts', (req, res) => {
  // Extract query parameters for filtering, sorting, and pagination
  const { author, category, sort, page = 1, limit = 10 } = req.query;
  
  // Logic to fetch posts with filters, sorting, and pagination
  const posts = []; // This would be fetched from database
  
  // Return posts with HATEOAS links
  res.json({
    data: posts,
    _links: {
      self: { href: '/v1/posts' },
      next: { href: `/v1/posts?page=${parseInt(page) + 1}&limit=${limit}` }
    },
    _meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 100 // Total would be from database
    }
  });
});

v1Router.post('/posts', (req, res) => {
  // Validate request
  if (!req.body.title || !req.body.content) {
    return res.status(400).json({ 
      error: 'Title and content are required'
    });
  }
  
  // Logic to create post
  const newPostId = '123'; // This would be generated
  
  // Return created post with 201 status
  res.status(201).json({
    id: newPostId,
    title: req.body.title,
    content: req.body.content,
    createdAt: new Date().toISOString(),
    _links: {
      self: { href: `/v1/posts/${newPostId}` },
      comments: { href: `/v1/posts/${newPostId}/comments` }
    }
  });
});

v1Router.get('/posts/:id', (req, res) => {
  const postId = req.params.id;
  
  // Logic to fetch post
  const post = { id: postId, title: 'Sample Post', content: 'Content...' };
  
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  
  res.json({
    ...post,
    _links: {
      self: { href: `/v1/posts/${postId}` },
      comments: { href: `/v1/posts/${postId}/comments` },
      update: { href: `/v1/posts/${postId}`, method: 'PUT' },
      delete: { href: `/v1/posts/${postId}`, method: 'DELETE' }
    }
  });
});

// Comments as a nested resource
v1Router.get('/posts/:postId/comments', (req, res) => {
  const postId = req.params.postId;
  const { page = 1, limit = 10 } = req.query;
  
  // Logic to fetch comments for post
  const comments = []; // This would be fetched from database
  
  res.json({
    data: comments,
    _links: {
      self: { href: `/v1/posts/${postId}/comments` },
      post: { href: `/v1/posts/${postId}` }
    },
    _meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: 50 // Total would be from database
    }
  });
});

v1Router.post('/posts/:postId/comments', (req, res) => {
  const postId = req.params.postId;
  
  // Validate request
  if (!req.body.content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  
  // Logic to create comment
  const newCommentId = '456'; // This would be generated
  
  res.status(201).json({
    id: newCommentId,
    postId: postId,
    content: req.body.content,
    createdAt: new Date().toISOString(),
    _links: {
      self: { href: `/v1/posts/${postId}/comments/${newCommentId}` },
      post: { href: `/v1/posts/${postId}` }
    }
  });
});

// Mount the v1 router
app.use('/v1', v1Router);

// Start the server
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
```

In this example, we've created a RESTful API for a blog with:

* Resource hierarchy (posts and nested comments)
* Query parameters for filtering, sorting, and pagination
* Appropriate HTTP status codes
* HATEOAS links for discoverability
* Versioning via the URI path

## Best Practices for URI Design

### 1. Keep URIs Simple and Intuitive

> URIs should be designed to be memorable, readable, and guessable.

```
Good: /users/123/posts
Bad: /u/123/p
```

### 2. Be Consistent

Use the same patterns and conventions throughout your API.

```
Good: /users/123/posts and /products/456/reviews
Bad: /users/123/posts and /products/456/get-reviews
```

### 3. Use Kebab-Case for Multi-Word Resource Names

Kebab-case (using hyphens) is generally preferred for multi-word resource names as it's easier to read.

```
Good: /blog-posts/123
Bad: /blog_posts/123 or /blogPosts/123
```

### 4. Use Lowercase URIs

URIs should be lowercase to avoid confusion, as the path portion of URIs is case-sensitive.

```
Good: /users/profile-pictures
Bad: /Users/ProfilePictures
```

### 5. Avoid File Extensions

Modern APIs should use content negotiation rather than file extensions.

```
Good: /users/123 (with Accept: application/json header)
Bad: /users/123.json
```

### 6. Use Query Parameters for Optional Arguments

Query parameters should be used for optional filters, sorting, pagination, etc., not for identifying resources.

```
Good: /products?category=electronics&sort=price_asc
Bad: /products/electronics/sort-by-price-asc
```

## Common URI Design Patterns

### 1. Collection/Item Pattern

```
/resources           (collection)
/resources/:id       (specific item)
```

Example:

```
GET /products         (all products)
GET /products/123     (product with ID 123)
```

### 2. Controller Pattern

For operations that don't map cleanly to CRUD operations, you might need action-oriented URIs.

```
/resources/:id/actions/:action
```

Example:

```
POST /orders/123/actions/cancel
POST /users/123/actions/reset-password
```

### 3. Search Pattern

For complex search operations beyond simple filtering.

```
/resources/search
```

Example:

```
POST /products/search
{
  "query": "phone",
  "price": { "min": 100, "max": 500 },
  "brand": ["Apple", "Samsung"]
}
```

Implementation:

```javascript
router.post('/products/search', (req, res) => {
  const { query, price, brand } = req.body;
  
  // Complex search logic here
  
  res.json({
    results: [],
    _meta: {
      count: 0,
      total: 0
    }
  });
});
```

## Conclusion

Resource naming and URI structure design form the foundation of a well-designed Node.js API. By following these principles and patterns, you can create intuitive, consistent, and maintainable APIs that are easy for clients to use and for developers to work with.

Remember the key principles:

* Use nouns, not verbs
* Use plural nouns for collections
* Use hierarchical relationships
* Use HTTP methods to indicate actions
* Use query parameters for filtering, sorting, and pagination
* Be consistent in your naming conventions

With these principles in mind, you'll be well-equipped to design robust and user-friendly APIs in your Node.js applications.
