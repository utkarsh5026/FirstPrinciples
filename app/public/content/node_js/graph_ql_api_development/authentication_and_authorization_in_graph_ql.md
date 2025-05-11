# Authentication and Authorization in GraphQL with Node.js

Let me guide you through understanding these fundamental security concepts and how they work specifically in GraphQL applications.

## Starting from First Principles

### What is Authentication?

> **Authentication** is the process of verifying who someone is - it's like showing your ID at the door.

Think of authentication like a museum entrance where you show your ticket. The museum needs to know you're a legitimate visitor before letting you inside. In computer systems, this means verifying a user's identity through credentials like:

* Username and password
* API keys
* JWT tokens
* OAuth tokens

Here's a simple real-world example: When you log into your email, you enter your email and password. The email service checks if these credentials match their records - that's authentication.

### What is Authorization?

> **Authorization** happens after authentication - it's determining what someone is allowed to do.

Once the museum knows who you are (authentication), they might check if your ticket allows access to special exhibitions (authorization). In software terms, authorization determines:

* Which resources you can access
* What actions you can perform
* What data you can view or modify

For example, after logging into your email (authentication), you can read your own emails but not your neighbor's emails (authorization).

## How GraphQL Handles These Concepts

GraphQL operates differently from REST APIs. Instead of multiple endpoints, you have a single endpoint that handles all requests. This creates unique challenges and opportunities for implementing authentication and authorization.

### The GraphQL Context

```javascript
// In GraphQL, we typically handle auth through the "context"
// This is like a shared space where auth info lives

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Extract token from request headers
    const token = req.headers.authorization || '';
  
    // Verify and decode the token
    try {
      const user = verifyToken(token);
      return { user };
    } catch (error) {
      // User is not authenticated
      return { user: null };
    }
  }
});
```

Let me explain what's happening here:

1. **Context Creation** : Every GraphQL operation gets a `context` object that can contain authentication information
2. **Token Extraction** : We look for an authorization header in the incoming request
3. **Verification** : We check if the token is valid and extract user information
4. **Context Setting** : The user information becomes available to all resolvers

## Building Authentication from Scratch

Let's build a complete authentication system step by step:

### Step 1: User Model and Password Hashing

```javascript
// models/User.js
const bcrypt = require('bcrypt');

class User {
  constructor(id, email, password, role = 'USER') {
    this.id = id;
    this.email = email;
    this.passwordHash = this.hashPassword(password);
    this.role = role;
  }
  
  hashPassword(password) {
    // Hash the password with a salt rounds of 10
    // This makes it extremely difficult to reverse-engineer
    return bcrypt.hashSync(password, 10);
  }
  
  checkPassword(password) {
    // Compare the provided password with the stored hash
    return bcrypt.compareSync(password, this.passwordHash);
  }
}
```

> **Why hash passwords?** Storing plain text passwords is like leaving your house key under the doormat - if someone finds your database, all accounts are compromised. Hashing creates a one-way transformation that's nearly impossible to reverse.

### Step 2: Authentication Resolver

```javascript
// resolvers/authResolvers.js
const jwt = require('jsonwebtoken');

const authResolvers = {
  Mutation: {
    login: async (_, { email, password }, context) => {
      // Find user by email
      const user = await findUserByEmail(email);
    
      if (!user) {
        throw new Error('User not found');
      }
    
      // Check if password is correct
      if (!user.checkPassword(password)) {
        throw new Error('Invalid password');
      }
    
      // Create a JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    
      return {
        token,
        user
      };
    }
  }
};
```

This resolver does several important things:

1. **Finds the user** : We search for a user with the provided email
2. **Verifies password** : We check if the provided password matches the stored hash
3. **Creates a token** : If authentication succeeds, we generate a JWT containing user information
4. **Returns token and user** : The client receives both the token (for future requests) and user data

### Step 3: Protected Resolver with Authorization

```javascript
// resolvers/userResolvers.js
const userResolvers = {
  Query: {
    me: (_, __, context) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new Error('You must be logged in');
      }
    
      // Return the authenticated user's data
      return context.user;
    },
  
    allUsers: (_, __, context) => {
      // Check if user is authenticated AND has admin role
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Admin access required');
      }
    
      // Return all users (only admins see this)
      return getAllUsers();
    }
  }
};
```

Here we see two levels of authorization:

1. **Authentication check** : Ensures the user is logged in
2. **Role-based check** : Ensures the user has the right permissions

## Advanced Authorization Patterns

### Field-Level Authorization

```javascript
// Field-level authorization allows fine-grained control
// over what data users can see

const postResolvers = {
  Post: {
    // Anyone can see the title
    title: (post) => post.title,
  
    // Only the author can see draft posts
    content: (post, _, context) => {
      if (post.status === 'DRAFT' && post.authorId !== context.user?.id) {
        throw new Error('Cannot view draft posts of other users');
      }
      return post.content;
    },
  
    // Only admins can see edit history
    editHistory: (post, _, context) => {
      if (context.user?.role !== 'ADMIN') {
        return null;
      }
      return post.editHistory;
    }
  }
};
```

This pattern is powerful because:

* Different fields can have different access rules
* Users see only what they're authorized to see
* The logic is centralized and easy to maintain

### Directive-Based Authorization

```javascript
// Define a custom directive for authorization
const authDirective = (requiredRole) => ({
  // This function runs before the resolver
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
  
    field.resolve = function(...args) {
      const context = args[2];
    
      // Check if user meets the role requirement
      if (!context.user || !hasRole(context.user, requiredRole)) {
        throw new Error(`Requires ${requiredRole} role`);
      }
    
      // If authorized, proceed with the original resolver
      return resolve.apply(this, args);
    };
  }
});
```

And in your schema:

```graphql
type Query {
  users: [User] @auth(requires: ADMIN)
  posts: [Post] @auth(requires: USER)
}
```

## Putting It All Together: Complete Auth Flow

Let's trace through a complete authentication and authorization flow:

```
Client                     GraphQL Server
  |                             |
  |  1. Login Request           |
  |  { email, password } ------>|
  |                             |
  |                             |  2. Check credentials
  |                             |     Find user, verify password
  |                             |
  |  3. JWT Token               |
  |  { token: "xyz..." } <------|
  |                             |
  |  4. Authenticated Request   |
  |  Authorization: Bearer xyz  |
  |  query { me { email } } --->|
  |                             |
  |                             |  5. Extract & verify token
  |                             |     Set user in context
  |                             |
  |                             |  6. Execute resolver
  |                             |     Check authorization
  |                             |
  |  7. Data Response           |
  |  { me: { email: ... } } <---|
```

### Creating a Reusable Auth Middleware

```javascript
// middleware/auth.js
const authenticate = (resolver) => {
  return async (parent, args, context, info) => {
    if (!context.user) {
      throw new Error('Authentication required');
    }
  
    return resolver(parent, args, context, info);
  };
};

const authorize = (...allowedRoles) => {
  return (resolver) => {
    return authenticate(async (parent, args, context, info) => {
      if (!allowedRoles.includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }
    
      return resolver(parent, args, context, info);
    });
  };
};

// Usage in resolvers
const protectedResolvers = {
  Query: {
    // Simple authentication check
    profile: authenticate((_, __, context) => {
      return getUserProfile(context.user.id);
    }),
  
    // Role-based authorization
    adminDashboard: authorize('ADMIN', 'SUPER_ADMIN')((_, __, context) => {
      return getAdminDashboard();
    })
  }
};
```

## Best Practices for GraphQL Authentication

> **Always validate on the server** : Never trust client-side validation alone. Always verify authorization on the server for every request.

1. **Use HTTPS** : Encrypt all communication to prevent token interception
2. **Secure token storage** : Store JWT tokens securely (never in localStorage for sensitive apps)
3. **Implement token expiration** : Use short-lived tokens with refresh mechanisms
4. **Validate input** : Sanitize and validate all input to prevent injection attacks
5. **Use proper CORS** : Configure CORS properly to prevent unauthorized access

### Error Handling in Auth

```javascript
// Custom error classes for better error handling
class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.extensions = {
      code: 'UNAUTHENTICATED',
    };
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.extensions = {
      code: 'FORBIDDEN',
    };
  }
}

// Use in resolvers
const secureResolver = (_, __, context) => {
  if (!context.user) {
    throw new AuthenticationError('You must be logged in');
  }
  
  if (context.user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
  
  // Continue with the resolver logic
};
```

## Rate Limiting and Security

```javascript
// Implement rate limiting to prevent abuse
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to login mutation
app.use('/graphql', (req, res, next) => {
  if (req.body.query && req.body.query.includes('login')) {
    authLimiter(req, res, next);
  } else {
    next();
  }
});
```

By understanding these concepts from first principles and seeing how they apply specifically to GraphQL in Node.js, you now have a solid foundation for implementing secure authentication and authorization in your GraphQL applications. Remember that security is an ongoing process - always stay updated with best practices and regularly audit your implementation.
