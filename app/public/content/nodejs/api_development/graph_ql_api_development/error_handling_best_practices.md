# GraphQL Error Handling Best Practices in Node.js

Let me take you on a comprehensive journey through GraphQL error handling, starting from the very basics and building up to sophisticated patterns. Think of this as learning a new language - we'll start with the alphabet and work our way up to writing eloquent prose.

## Understanding Errors from First Principles

Before we dive into GraphQL specifics, let's understand what an error really is in the context of software applications:

> **An error represents an unexpected deviation from the normal flow of execution in your program.**

Think of your application as a factory assembly line:

* Normal flow: Raw materials → Processing → Finished product
* Error flow: Raw materials → Processing → Something breaks → Recovery or failure

In the digital world, errors fall into two main categories:

1. **Operational Errors** : Expected problems that can happen (network failures, invalid user input)
2. **Programming Errors** : Bugs in our code (null reference, syntax errors)

## The Nature of GraphQL and Errors

GraphQL has a unique relationship with errors compared to REST APIs. Here's the fundamental difference:

> **In REST: HTTP status codes tell you if something went wrong**
>
> **In GraphQL: HTTP response is always 200 OK, but the response body contains error information**

This is because GraphQL requests can partially succeed or fail. Imagine ordering a pizza with multiple toppings:

* REST: Either you get the whole pizza or none at all
* GraphQL: You might get the pizza with some toppings missing, and the response tells you which ones failed

## GraphQL Error Structure

GraphQL errors follow a specific structure defined in the specification:

```json
{
  "errors": [
    {
      "message": "Cannot query field 'invalidField' on type 'User'",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["user", "invalidField"],
      "extensions": {
        "code": "GRAPHQL_VALIDATION_FAILED",
        "exception": {
          "stacktrace": ["Error: ...", "..."]
        }
      }
    }
  ],
  "data": {
    "user": {
      "name": "John Doe"
    }
  }
}
```

## Building Error Handling from the Ground Up

Let's start with the simplest GraphQL server in Node.js and evolve it step by step:

### Step 1: Basic Error Throwing

```javascript
// resolvers.js
const resolvers = {
  Query: {
    getUser: (parent, { id }) => {
      // Basic error throwing - not recommended for production
      if (!id) {
        throw new Error('User ID is required');
      }
    
      // Simulate database lookup
      const user = database.findUser(id);
      if (!user) {
        throw new Error('User not found');
      }
    
      return user;
    }
  }
};
```

**What happens here?**

1. When an error is thrown, GraphQL catches it
2. The error message becomes part of the response
3. The execution continues for other fields

### Step 2: Creating Custom Error Classes

```javascript
// errors.js - Building custom error types from scratch
class AppError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  
    // Capture stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}
```

**Understanding the inheritance chain:**

* `Error` (JavaScript built-in) → `AppError` (our base) → `ValidationError` (specific type)
* Each level adds more specific information
* `captureStackTrace` helps with debugging by preserving the call stack

### Step 3: Using Custom Errors in Resolvers

```javascript
// resolvers.js - Using our custom errors
const resolvers = {
  Query: {
    getUser: async (parent, { id }, context) => {
      // Validate input
      if (!id) {
        throw new ValidationError('User ID is required', 'id');
      }
    
      // Check authentication
      if (!context.user) {
        throw new AuthenticationError();
      }
    
      // Attempt to find user
      const user = await database.findUser(id);
      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }
    
      return user;
    }
  }
};
```

### Step 4: Formatting Errors for the Client

Apollo Server provides a way to format errors before sending them to the client:

```javascript
// server.js - Error formatting
const { ApolloServer, AuthenticationError } = require('apollo-server');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Extract user from token if present
    const token = req.headers.authorization;
    const user = authenticateUser(token);
    return { user };
  },
  formatError: (error) => {
    // Don't leak sensitive information in production
    if (process.env.NODE_ENV === 'production') {
      // Only show specific error details for known errors
      if (error.extensions.code === 'INTERNAL_SERVER_ERROR') {
        return new Error('An unexpected error occurred');
      }
    }
  
    // Add custom error metadata
    const formattedError = {
      message: error.message,
      code: error.extensions.code,
      path: error.path,
      locations: error.locations,
    };
  
    // Add debug info in development
    if (process.env.NODE_ENV === 'development') {
      formattedError.stackTrace = error.extensions.exception?.stacktrace;
    }
  
    return formattedError;
  }
});
```

## Advanced Error Handling Patterns

### Pattern 1: Error Boundary Wrapper

Create a utility to wrap resolver functions with error handling:

```javascript
// utils/errorBoundary.js
const withErrorHandler = (resolver) => {
  return async (parent, args, context, info) => {
    try {
      return await resolver(parent, args, context, info);
    } catch (error) {
      // Log the error (could be to Sentry, CloudWatch, etc.)
      console.error('Resolver error:', {
        resolver: info.fieldName,
        error: error.message,
        stack: error.stack,
        args
      });
    
      // Re-throw with additional context
      if (error instanceof AppError) {
        throw error;
      }
    
      // Convert unknown errors to internal server errors
      throw new AppError(
        'An unexpected error occurred',
        'INTERNAL_SERVER_ERROR',
        500
      );
    }
  };
};

// Usage in resolvers
const resolvers = {
  Query: {
    getUser: withErrorHandler(async (parent, { id }, context) => {
      // Your resolver logic here
      const user = await database.findUser(id);
      return user;
    })
  }
};
```

### Pattern 2: Field-Level Error Handling

Sometimes you want to handle errors for specific fields without affecting the entire query:

```javascript
// Using unions for error handling
// schema.graphql
type Query {
  getUser(id: ID!): UserResult!
}

union UserResult = User | Error

type User {
  id: ID!
  name: String!
  email: String!
}

type Error {
  message: String!
  code: String!
}

// resolvers.js
const resolvers = {
  Query: {
    getUser: async (parent, { id }) => {
      try {
        const user = await database.findUser(id);
        if (!user) {
          return {
            __typename: 'Error',
            message: 'User not found',
            code: 'NOT_FOUND'
          };
        }
        return { __typename: 'User', ...user };
      } catch (error) {
        return {
          __typename: 'Error',
          message: error.message,
          code: 'INTERNAL_ERROR'
        };
      }
    }
  },
  UserResult: {
    __resolveType(obj) {
      if (obj.__typename) {
        return obj.__typename;
      }
      return null;
    }
  }
};
```

### Pattern 3: Partial Success with Error Arrays

For operations that might partially succeed:

```javascript
// schema.graphql
type Mutation {
  bulkCreateUsers(users: [UserInput!]!): BulkCreateResult!
}

type BulkCreateResult {
  successful: [User!]!
  failed: [FailedUser!]!
  totalCount: Int!
  successCount: Int!
  failureCount: Int!
}

type FailedUser {
  input: UserInput!
  error: Error!
}

// resolvers.js
const resolvers = {
  Mutation: {
    bulkCreateUsers: async (parent, { users }) => {
      const successful = [];
      const failed = [];
    
      for (const userInput of users) {
        try {
          const createdUser = await database.createUser(userInput);
          successful.push(createdUser);
        } catch (error) {
          failed.push({
            input: userInput,
            error: {
              message: error.message,
              code: error.code || 'UNKNOWN_ERROR'
            }
          });
        }
      }
    
      return {
        successful,
        failed,
        totalCount: users.length,
        successCount: successful.length,
        failureCount: failed.length
      };
    }
  }
};
```

## Error Handling Best Practices Summary

Let me consolidate the key principles we've learned:

> **1. Always Be Specific**
>
> Create custom error classes for different scenarios. This helps both debugging and client-side error handling.

> **2. Never Expose Internal Details**
>
> In production, sanitize error messages and stack traces. Attackers can use this information maliciously.

> **3. Provide Context**
>
> Include relevant information like field names, operation types, and error codes in your errors.

> **4. Log Everything**
>
> Create comprehensive logging for all errors, including stack traces, request context, and user information.

> **5. Handle Partial Failures Gracefully**
>
> Some operations might partially succeed. Design your schema to express these nuanced states.

Here's a terminal-optimized view of the error handling flow:

```
┌─────────────────────┐
│   GraphQL Query     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│    Resolver         │
│   (with try/catch)  │
└─────────────────────┘
         │
         ▼        ╔════════════════╗
    Success? ─────╣ Error Occurs   ║
         │        ╚════════════════╝
         │                 │
         ▼                 ▼
┌─────────────────────┐    ┌──────────────────┐
│   Return Data       │    │  Custom Error    │
└─────────────────────┘    │   - Code         │
                          │   - Message      │
                          │   - Extensions   │
                          └──────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  formatError()   │
                          │  - Sanitize      │
                          │  - Add context   │
                          │  - Log           │
                          └──────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ Client Response  │
                          │ {                │
                          │   "errors": [...] │
                          │   "data": ...     │
                          │ }                │
                          └──────────────────┘
```

## Testing Error Scenarios

Don't forget to test your error handling:

```javascript
// tests/errorHandling.test.js
describe('GraphQL Error Handling', () => {
  it('should return validation error for missing user ID', async () => {
    const query = `
      query GetUser {
        getUser {
          id
          name
        }
      }
    `;
  
    const response = await request(app)
      .post('/graphql')
      .send({ query });
  
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].extensions.code).toBe('VALIDATION_ERROR');
    expect(response.body.errors[0].message).toContain('User ID is required');
  });
  
  it('should handle authentication errors', async () => {
    const query = `
      query GetPrivateData {
        getPrivateData {
          secret
        }
      }
    `;
  
    const response = await request(app)
      .post('/graphql')
      .send({ query });
  
    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
  });
});
```

By implementing these patterns systematically, you'll create a robust error handling system that provides clear feedback to developers while protecting your application from potential security vulnerabilities. Remember, good error handling is like a safety net - it should be strong enough to catch problems but invisible when everything works correctly.
