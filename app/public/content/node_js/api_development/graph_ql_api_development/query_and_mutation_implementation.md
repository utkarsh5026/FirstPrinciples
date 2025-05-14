
# Understanding GraphQL from First Principles

Before we dive into queries and mutations, let's understand what GraphQL fundamentally is.

> GraphQL is a query language for APIs and a runtime for executing those queries. Unlike REST, where you make requests to different endpoints, GraphQL provides a single endpoint where you specify exactly what data you need.

Think of GraphQL like ordering food at a restaurant. Instead of ordering pre-set meals (like REST endpoints), you can customize your order by picking specific ingredients (data fields) you want.

```
REST Approach:
GET /users/1        -> Get entire user object
GET /users/1/posts  -> Get all posts separately

GraphQL Approach:
query {
  user(id: 1) {
    name
    email
    posts {
      title
    }
  }
}
```

## Queries vs Mutations: The Reading and Writing Operations

In GraphQL, we have two main types of operations:

> Queries are for reading data (like SQL SELECT)
> Mutations are for modifying data (like SQL INSERT, UPDATE, DELETE)

Think of it like a library:

* **Query** : "Can I see this book?" (reading)
* **Mutation** : "Can I borrow/return this book?" (modifying)

# Setting Up a GraphQL Server in Node.js

Let's start by setting up a basic GraphQL server using Apollo Server, one of the most popular GraphQL implementations for Node.js.

```javascript
// app.js
const { ApolloServer, gql } = require('apollo-server');

// Define your data schema
const typeDefs = gql`
  # This defines the shape of a User object
  type User {
    id: ID!
    name: String!
    email: String!
  }

  # Define what queries are available
  type Query {
    users: [User!]!
    user(id: ID!): User
  }
`;

// Start the server
const server = new ApolloServer({ typeDefs });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
```

> The `typeDefs` define the schema - it's like creating a blueprint for what data looks like and what operations are possible.

# Implementing Queries

Now let's implement actual query resolvers. Resolvers are functions that tell GraphQL how to fetch the data.

```javascript
// Basic query implementation
const users = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' }
];

const resolvers = {
  Query: {
    // Resolver to get all users
    users: () => users,
  
    // Resolver to get a single user by ID
    user: (parent, args) => {
      // Find user by the ID provided in the query
      return users.find(user => user.id === args.id);
    }
  }
};

// Update the server to include resolvers
const server = new ApolloServer({ 
  typeDefs, 
  resolvers 
});
```

Let's see how these queries work:

```graphql
# Get all users
query {
  users {
    id
    name
    email
  }
}

# Get a specific user
query {
  user(id: "1") {
    name
    email
  }
}
```

> Notice how in the second query, we only ask for `name` and `email`, not `id`. This is the power of GraphQL - you get exactly what you request.

## Adding Database Integration

Let's make our queries more realistic by connecting to a database. Here's an example using MongoDB:

```javascript
// database.js
const mongoose = require('mongoose');

// Define the User model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
```

```javascript
// app.js with database resolvers
const { User } = require('./database');

const resolvers = {
  Query: {
    // Get all users from database
    users: async () => {
      try {
        // MongoDB find operation
        return await User.find();
      } catch (error) {
        throw new Error('Failed to fetch users');
      }
    },
  
    // Get user by ID from database
    user: async (parent, args) => {
      try {
        // MongoDB findById operation
        return await User.findById(args.id);
      } catch (error) {
        throw new Error('User not found');
      }
    }
  }
};
```

# Implementing Mutations

Now let's add the ability to create, update, and delete users. First, we need to update our schema:

```javascript
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
  }

  # Input type for creating/updating users
  input UserInput {
    name: String!
    email: String!
    age: Int
  }

  # Define mutations
  type Mutation {
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): Boolean!
  }
`;
```

> Input types are special types used for arguments. They ensure type safety when passing data to mutations.

Now let's implement the mutation resolvers:

```javascript
const resolvers = {
  Query: {
    // ... previous query resolvers
  },
  
  Mutation: {
    // Create a new user
    createUser: async (parent, { input }) => {
      try {
        // Create new user with input data
        const user = new User(input);
      
        // Save to database
        await user.save();
      
        // Return the created user
        return user;
      } catch (error) {
        throw new Error('Failed to create user');
      }
    },
  
    // Update an existing user
    updateUser: async (parent, { id, input }) => {
      try {
        // Find and update the user
        const user = await User.findByIdAndUpdate(
          id,
          input,
          { new: true } // Return the updated document
        );
      
        if (!user) {
          throw new Error('User not found');
        }
      
        return user;
      } catch (error) {
        throw new Error('Failed to update user');
      }
    },
  
    // Delete a user
    deleteUser: async (parent, { id }) => {
      try {
        // Find and delete the user
        const result = await User.findByIdAndDelete(id);
      
        // Return true if successful, false if user not found
        return !!result;
      } catch (error) {
        throw new Error('Failed to delete user');
      }
    }
  }
};
```

Here's how you would use these mutations:

```graphql
# Create a new user
mutation {
  createUser(input: {
    name: "Charlie"
    email: "charlie@example.com"
    age: 30
  }) {
    id
    name
    email
  }
}

# Update a user
mutation {
  updateUser(id: "12345", input: {
    name: "Updated Name"
    email: "updated@example.com"
  }) {
    id
    name
    email
  }
}

# Delete a user
mutation {
  deleteUser(id: "12345")
}
```

# Advanced Query Features

Let's explore some advanced query features that make GraphQL powerful.

## Nested Queries

First, let's add relationships to our schema:

```javascript
// Update schema with relationships
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
  }
`;
```

```javascript
// Implement nested resolvers
const resolvers = {
  Query: {
    // ... previous resolvers
    posts: async () => await Post.find(),
    post: async (parent, { id }) => await Post.findById(id)
  },
  
  // Field-level resolvers
  User: {
    // Resolve posts for a user
    posts: async (user) => {
      // Find all posts by this user
      return await Post.find({ authorId: user.id });
    }
  },
  
  Post: {
    // Resolve author for a post
    author: async (post) => {
      // Find the author of this post
      return await User.findById(post.authorId);
    }
  }
};
```

> Field-level resolvers allow you to define how related data is fetched. This is called when that field is requested in a query.

## Query Arguments and Filtering

Let's add filtering capabilities:

```javascript
const typeDefs = gql`
  type Query {
    users(
      name: String
      email: String
      minAge: Int
      maxAge: Int
    ): [User!]!
  }
`;

const resolvers = {
  Query: {
    users: async (parent, args) => {
      // Build filter object based on arguments
      const filter = {};
    
      if (args.name) {
        // Case-insensitive name search
        filter.name = new RegExp(args.name, 'i');
      }
    
      if (args.email) {
        filter.email = args.email;
      }
    
      if (args.minAge || args.maxAge) {
        filter.age = {};
        if (args.minAge) filter.age.$gte = args.minAge;
        if (args.maxAge) filter.age.$lte = args.maxAge;
      }
    
      // Apply filter to database query
      return await User.find(filter);
    }
  }
};
```

Use it like this:

```graphql
# Find users named "John"
query {
  users(name: "John") {
    id
    name
    email
  }
}

# Find users between 25 and 35 years old
query {
  users(minAge: 25, maxAge: 35) {
    name
    age
  }
}
```

# Error Handling and Validation

Proper error handling is crucial for a robust GraphQL API:

```javascript
const resolvers = {
  Query: {
    user: async (parent, { id }) => {
      // Validate ID format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid user ID format');
      }
    
      const user = await User.findById(id);
    
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
    
      return user;
    }
  },
  
  Mutation: {
    createUser: async (parent, { input }) => {
      // Validate input data
      if (!input.email.includes('@')) {
        throw new Error('Invalid email format');
      }
    
      if (input.age < 0) {
        throw new Error('Age cannot be negative');
      }
    
      // Check if email already exists
      const existingUser = await User.findOne({ email: input.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    
      try {
        const user = new User(input);
        await user.save();
        return user;
      } catch (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
    }
  }
};
```

> GraphQL errors are automatically caught and returned in a standardized format, but throwing meaningful error messages helps clients understand what went wrong.

# Authentication and Authorization

Here's how to add authentication to your GraphQL server:

```javascript
// auth.js
const jwt = require('jsonwebtoken');

const authenticateUser = async (token) => {
  if (!token) {
    return null;
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    // Get user from database
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
};

module.exports = { authenticateUser };
```

```javascript
// Update server with context
const { authenticateUser } = require('./auth');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Extract token from headers
    const token = req.headers.authorization || '';
  
    // Authenticate user
    const user = await authenticateUser(token);
  
    // Add user to context
    return { user };
  }
});
```

```javascript
// Protected resolvers
const resolvers = {
  Query: {
    myProfile: (parent, args, context) => {
      // Check if user is authenticated
      if (!context.user) {
        throw new Error('Authentication required');
      }
    
      // Return current user's profile
      return context.user;
    }
  },
  
  Mutation: {
    updateMyProfile: async (parent, { input }, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }
    
      // Update only the current user's profile
      return await User.findByIdAndUpdate(
        context.user.id,
        input,
        { new: true }
      );
    }
  }
};
```

# Performance Optimization

## Batching and Caching

GraphQL can lead to the N+1 problem. Here's how to solve it using DataLoader:

```javascript
// dataLoaders.js
const DataLoader = require('dataloader');

const batchUsers = async (userIds) => {
  // Fetch all users at once
  const users = await User.find({ _id: { $in: userIds } });
  
  // Return users in the same order as requested IDs
  return userIds.map(id => 
    users.find(user => user.id === id)
  );
};

const createLoaders = () => ({
  userLoader: new DataLoader(batchUsers)
});

module.exports = { createLoaders };
```

```javascript
// Update server with loaders
const { createLoaders } = require('./dataLoaders');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const user = await authenticateUser(req.headers.authorization);
  
    return {
      user,
      loaders: createLoaders() // Add loaders to context
    };
  }
});
```

```javascript
// Use loader in resolvers
const resolvers = {
  Post: {
    author: async (post, args, { loaders }) => {
      // Use loader instead of direct database call
      return await loaders.userLoader.load(post.authorId);
    }
  }
};
```

> DataLoader automatically batches requests within a single event loop tick and caches results, dramatically improving performance.

# Testing GraphQL Resolvers

Here's how to test your GraphQL resolvers:

```javascript
// resolvers.test.js
const { resolvers } = require('./resolvers');
const { User } = require('./database');

// Mock database module
jest.mock('./database');

describe('User Resolvers', () => {
  describe('Query.users', () => {
    it('should return all users', async () => {
      // Mock database response
      const mockUsers = [
        { id: '1', name: 'Alice', email: 'alice@test.com' },
        { id: '2', name: 'Bob', email: 'bob@test.com' }
      ];
    
      User.find.mockResolvedValue(mockUsers);
    
      // Call resolver
      const result = await resolvers.Query.users();
    
      // Verify result
      expect(result).toEqual(mockUsers);
      expect(User.find).toHaveBeenCalled();
    });
  });
  
  describe('Mutation.createUser', () => {
    it('should create a new user', async () => {
      const input = {
        name: 'Charlie',
        email: 'charlie@test.com',
        age: 30
      };
    
      const mockUser = { id: '3', ...input };
    
      // Mock User constructor and save method
      User.mockImplementation(() => ({
        ...input,
        save: jest.fn().mockResolvedValue(mockUser)
      }));
    
      // Call resolver
      const result = await resolvers.Mutation.createUser(null, { input });
    
      // Verify result
      expect(result).toEqual(mockUser);
    });
  });
});
```

# Complete Example: Blog API

Let's put it all together with a complete blog API:

```javascript
// Complete blog GraphQL server
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  authorId: mongoose.Schema.Types.ObjectId,
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);

// Type definitions
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    published: Boolean!
    createdAt: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  input PostInput {
    title: String!
    content: String!
    published: Boolean
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts(published: Boolean): [Post!]!
    post(id: ID!): Post
    myPosts: [Post!]!
  }

  type Mutation {
    register(input: UserInput!): User!
    createPost(input: PostInput!): Post!
    updatePost(id: ID!, input: PostInput!): Post!
    deletePost(id: ID!): Boolean!
    publishPost(id: ID!): Post!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    users: async () => await User.find(),
    user: async (_, { id }) => await User.findById(id),
    posts: async (_, { published }) => {
      const filter = published !== undefined ? { published } : {};
      return await Post.find(filter).sort({ createdAt: -1 });
    },
    post: async (_, { id }) => await Post.findById(id),
    myPosts: async (_, __, { user }) => {
      if (!user) throw new Error('Authentication required');
      return await Post.find({ authorId: user.id });
    }
  },

  Mutation: {
    register: async (_, { input }) => {
      const user = new User(input);
      await user.save();
      return user;
    },
  
    createPost: async (_, { input }, { user }) => {
      if (!user) throw new Error('Authentication required');
    
      const post = new Post({
        ...input,
        authorId: user.id
      });
    
      await post.save();
      return post;
    },
  
    updatePost: async (_, { id, input }, { user }) => {
      if (!user) throw new Error('Authentication required');
    
      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found');
      if (post.authorId.toString() !== user.id) {
        throw new Error('Not authorized');
      }
    
      Object.assign(post, input);
      await post.save();
      return post;
    },
  
    deletePost: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
    
      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found');
      if (post.authorId.toString() !== user.id) {
        throw new Error('Not authorized');
      }
    
      await post.remove();
      return true;
    },
  
    publishPost: async (_, { id }, { user }) => {
      if (!user) throw new Error('Authentication required');
    
      const post = await Post.findById(id);
      if (!post) throw new Error('Post not found');
      if (post.authorId.toString() !== user.id) {
        throw new Error('Not authorized');
      }
    
      post.published = true;
      await post.save();
      return post;
    }
  },

  User: {
    posts: async (user) => await Post.find({ authorId: user.id })
  },

  Post: {
    author: async (post) => await User.findById(post.authorId)
  }
};

// Create server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Add authentication logic here
    const token = req.headers.authorization || '';
    const user = await authenticateUser(token);
    return { user };
  }
});

// Start server
mongoose.connect('mongodb://localhost:27017/blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});
```

This complete example demonstrates:

* User registration and authentication
* Creating, reading, updating, and deleting posts
* Authorization (users can only modify their own posts)
* Nested queries (getting a user's posts)
* Filtering (getting only published posts)

> Remember: GraphQL is about giving clients exactly what they need while maintaining a clean, type-safe API. Start simple and gradually add complexity as your application grows.

The key to mastering GraphQL is understanding that it's a declarative way to fetch data - clients describe what they want, and your resolvers provide exactly that. This makes your API more flexible and efficient than traditional REST approaches.
