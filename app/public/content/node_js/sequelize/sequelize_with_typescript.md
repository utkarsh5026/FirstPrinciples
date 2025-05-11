# Sequelize with TypeScript: A Complete Guide from First Principles

Let me walk you through Sequelize with TypeScript, starting from the very basics and building up to more advanced concepts. Think of this as your comprehensive journey into the world of Object-Relational Mapping (ORM) with TypeScript.

## What is Sequelize? (Starting from the Beginning)

Before we dive into Sequelize specifically, let's understand what an ORM is:

> **Object-Relational Mapping (ORM)** is a programming technique that lets you interact with databases using object-oriented concepts instead of raw SQL queries. Think of it as a translator between your code (objects) and your database (tables).

Imagine you're organizing books in a library:

* Without ORM: You'd have to manually handle SQL like `INSERT INTO books (title, author) VALUES ('1984', 'George Orwell')`
* With ORM: You'd create a Book object and call something like `book.save()`

Sequelize is one of the most popular ORMs for Node.js, and it provides:

* **Database abstraction** : Works with multiple database types (PostgreSQL, MySQL, SQLite, etc.)
* **Model definition** : Create database schemas as JavaScript/TypeScript classes
* **Relationship management** : Handle foreign keys and associations easily
* **Query building** : Generate SQL without writing it manually
* **Migration support** : Manage database schema changes over time

## Why Use Sequelize with TypeScript?

TypeScript adds type safety to Sequelize, which means:

1. **Compile-time error detection** : Catch bugs before they reach production
2. **Better IDE support** : Autocompletion and inline documentation
3. **Self-documenting code** : Types serve as built-in documentation
4. **Refactoring confidence** : Rename properties and methods safely

Let's see a simple comparison:

```javascript
// JavaScript (vanilla Sequelize)
const user = await User.findByPk(1);
user.naem = 'John'; // Typo won't be caught until runtime
```

```typescript
// TypeScript
const user = await User.findByPk(1);
user.naem = 'John'; // TypeScript error immediately!
//   ^^^^ Property 'naem' does not exist
```

## Setting Up Sequelize with TypeScript

Let's start with a clean project. First, install the necessary dependencies:

```bash
npm init -y
npm install sequelize sequelize-typescript typescript @types/node
npm install sqlite3  # or your preferred database driver
npm install -D @types/sequelize
```

Create a basic TypeScript configuration (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "lib": ["ES2018"],
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

> **Important** : Notice the `experimentalDecorators` and `emitDecoratorMetadata` options. These are crucial for Sequelize TypeScript decorators to work properly.

Now, let's create a database connection file (`src/database.ts`):

```typescript
// src/database.ts
import { Sequelize } from 'sequelize-typescript';

// Create Sequelize instance
const sequelize = new Sequelize({
  database: 'my_app',
  dialect: 'sqlite',
  storage: ':memory:', // Or './database.sqlite' for persistent storage
  models: [], // We'll add models here later
  logging: console.log, // See SQL queries in console
});

export default sequelize;
```

This creates our database connection. Let's break it down:

* `database`: The name of our database
* `dialect`: Which database system we're using
* `storage`: Where SQLite stores its data (in memory means it's temporary)
* `models`: Array of model classes (empty for now)
* `logging`: Whether to show SQL queries in console

## Creating Your First Model

Let's create a simple User model. In Sequelize TypeScript, models are classes decorated with special decorators:

```typescript
// src/models/User.ts
import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  PrimaryKey, 
  AutoIncrement,
  AllowNull,
  Unique
} from 'sequelize-typescript';

@Table({
  tableName: 'users',
  timestamps: true, // Adds createdAt and updatedAt
})
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  firstName!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  lastName!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  password!: string;

  // Virtual field (computed property)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

Let's understand each decorator:

* `@Table`: Defines this class as a database table
  * `tableName`: The actual table name in the database
  * `timestamps`: Automatically adds `createdAt` and `updatedAt` columns
* `@Column`: Defines a database column
  * `DataType.STRING`: SQL VARCHAR type
  * `DataType.INTEGER`: SQL INTEGER type
* `@PrimaryKey`: Makes this column the primary key
* `@AutoIncrement`: Auto-generates incremental values
* `@AllowNull(false)`: Makes the column required (NOT NULL)
* `@Unique`: Ensures all values are unique

> **The `!` (non-null assertion)** : In TypeScript, we use `!` to tell the compiler "trust me, this will be defined." With Sequelize, these properties get initialized by the ORM itself.

Now, let's register this model with our database:

```typescript
// src/database.ts
import { Sequelize } from 'sequelize-typescript';
import { User } from './models/User';

const sequelize = new Sequelize({
  database: 'my_app',
  dialect: 'sqlite',
  storage: ':memory:',
  models: [User], // Add our User model here
  logging: console.log,
});

export default sequelize;
```

## Basic CRUD Operations

Let's create a simple script to demonstrate basic Create, Read, Update, and Delete operations:

```typescript
// src/crud-demo.ts
import sequelize from './database';
import { User } from './models/User';

async function runCrudDemo() {
  try {
    // Sync the database (creates tables if they don't exist)
    await sequelize.sync({ force: true }); // force: true drops existing tables
  
    // CREATE
    const user1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'secret123'
    });
  
    console.log('Created user:', user1.toJSON());
    console.log('Full name:', user1.fullName); // Using our getter
  
    // READ
    // Find by primary key
    const foundUser = await User.findByPk(1);
  
    // Find one by criteria
    const userByEmail = await User.findOne({
      where: { email: 'john@example.com' }
    });
  
    // Find all users
    const allUsers = await User.findAll();
    console.log('All users:', allUsers.length);
  
    // UPDATE
    if (foundUser) {
      foundUser.firstName = 'Jane';
      await foundUser.save();
      console.log('Updated user:', foundUser.toJSON());
    }
  
    // DELETE
    if (userByEmail) {
      await userByEmail.destroy();
      console.log('User deleted');
    }
  
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

runCrudDemo();
```

Let's understand each operation:

 **CREATE** : `User.create()` creates a new record in the database. Sequelize validates the data, generates SQL, and returns a model instance.

 **READ** : Multiple methods for finding records:

* `findByPk()`: Find by primary key
* `findOne()`: Find a single record matching criteria
* `findAll()`: Get all records (with optional filtering)

 **UPDATE** : Load the record, modify properties, then call `save()`. Sequelize generates the appropriate UPDATE SQL.

 **DELETE** : Call `destroy()` on a model instance to delete it from the database.

## Advanced Querying

Sequelize offers powerful querying capabilities. Let's explore some advanced examples:

```typescript
// src/advanced-queries.ts
import { Op } from 'sequelize';
import { User } from './models/User';

async function advancedQueries() {
  // WHERE clauses with operators
  const johnUsers = await User.findAll({
    where: {
      firstName: 'John', // Exact match
      lastName: {
        [Op.like]: '%Doe%' // LIKE operator for partial match
      },
      createdAt: {
        [Op.gte]: new Date('2024-01-01') // Greater than or equal
      }
    }
  });
  
  // Ordering results
  const sortedUsers = await User.findAll({
    order: [
      ['lastName', 'ASC'],  // Sort by lastName ascending
      ['firstName', 'DESC'] // Then by firstName descending
    ]
  });
  
  // Pagination with limit and offset
  const page2Users = await User.findAll({
    limit: 10,    // Number of results
    offset: 20,   // Skip first 20 results
    order: [['id', 'ASC']]
  });
  
  // Selecting specific fields
  const emailOnly = await User.findAll({
    attributes: ['email'], // Only fetch email field
    where: {
      lastName: 'Smith'
    }
  });
  
  // Count records
  const userCount = await User.count({
    where: {
      email: {
        [Op.endsWith]: '@example.com'
      }
    }
  });
  
  console.log('Found users:', johnUsers.length);
  console.log('Total users with @example.com:', userCount);
}
```

> **The `Op` object** : Sequelize provides various operators like `Op.like`, `Op.gt`, `Op.or`, etc. These let you build complex SQL WHERE clauses without writing raw SQL.

## Understanding Associations

Associations define relationships between tables. Let's create a blog system with Users and Posts:

```typescript
// src/models/Post.ts
import { 
  Table, 
  Column, 
  Model, 
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  PrimaryKey,
  AutoIncrement
} from 'sequelize-typescript';
import { User } from './User';

@Table({
  tableName: 'posts',
  timestamps: true,
})
export class Post extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  title!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  content!: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;

  // Define the association
  @BelongsTo(() => User)
  author!: User;
}
```

Now, update the User model to include the reverse association:

```typescript
// Add to User.ts
import { HasMany } from 'sequelize-typescript';
import { Post } from './Post';

// Inside the User class:
@HasMany(() => Post)
posts!: Post[];
```

Let's understand the association types:

1. **BelongsTo** : The foreign key is in this model (Post has userId)
2. **HasMany** : One model can have multiple instances of another
3. **HasOne** : One-to-one relationship
4. **BelongsToMany** : Many-to-many relationship (requires junction table)

Working with associations:

```typescript
// src/association-demo.ts
import sequelize from './database';
import { User } from './models/User';
import { Post } from './models/Post';

async function associationDemo() {
  await sequelize.sync({ force: true });
  
  // Create a user
  const user = await User.create({
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com',
    password: 'password123'
  });
  
  // Create posts for the user
  const post1 = await Post.create({
    title: 'My First Blog Post',
    content: 'Hello, world!',
    userId: user.id
  });
  
  // Alternative way using associations
  const post2 = await user.createPost({
    title: 'My Second Post',
    content: 'This is getting easier!'
  });
  
  // Eager loading - fetch user with their posts
  const userWithPosts = await User.findOne({
    where: { id: user.id },
    include: [Post] // Include associated posts
  });
  
  console.log('User with posts:', userWithPosts?.posts?.length);
  
  // Lazy loading - fetch posts separately
  const posts = await user.getPosts();
  console.log('User posts count:', posts.length);
  
  // Access the author of a post
  const postWithAuthor = await Post.findOne({
    where: { id: post1.id },
    include: [User]
  });
  
  console.log('Post author:', postWithAuthor?.author?.fullName);
}
```

## Many-to-Many Relationships

Let's add tags to our blog system with a many-to-many relationship:

```typescript
// src/models/Tag.ts
import { 
  Table, 
  Column, 
  Model, 
  DataType,
  BelongsToMany
} from 'sequelize-typescript';
import { Post } from './Post';
import { PostTag } from './PostTag';

@Table({
  tableName: 'tags',
  timestamps: true,
})
export class Tag extends Model {
  @Column(DataType.STRING)
  name!: string;

  @BelongsToMany(() => Post, () => PostTag)
  posts!: Post[];
}
```

```typescript
// src/models/PostTag.ts (Junction table)
import { 
  Table, 
  Column, 
  Model, 
  ForeignKey,
  DataType
} from 'sequelize-typescript';
import { Post } from './Post';
import { Tag } from './Tag';

@Table({
  tableName: 'post_tags',
  timestamps: false,
})
export class PostTag extends Model {
  @ForeignKey(() => Post)
  @Column(DataType.INTEGER)
  postId!: number;

  @ForeignKey(() => Tag)
  @Column(DataType.INTEGER)
  tagId!: number;
}
```

Update Post model:

```typescript
// Add to Post.ts
@BelongsToMany(() => Tag, () => PostTag)
tags!: Tag[];
```

Working with many-to-many:

```typescript
async function manyToManyDemo() {
  // Create tags
  const jsTag = await Tag.create({ name: 'JavaScript' });
  const tsTag = await Tag.create({ name: 'TypeScript' });
  
  // Create a post
  const post = await Post.create({
    title: 'Learning TypeScript ORM',
    content: 'Sequelize with TypeScript is awesome!',
    userId: 1
  });
  
  // Add tags to post
  await post.addTags([jsTag, tsTag]);
  
  // Find posts with specific tags
  const jsPost = await Post.findAll({
    include: [{
      model: Tag,
      where: { name: 'JavaScript' }
    }]
  });
  
  console.log('JavaScript posts:', jsPost.length);
}
```

## Database Migrations

Migrations help manage database schema changes over time. Install sequelize-cli:

```bash
npm install -D sequelize-cli
```

Create a `.sequelizerc` file to configure paths:

```javascript
// .sequelizerc
const path = require('path');

module.exports = {
  'config': path.resolve('config', 'database.ts'),
  'models-path': path.resolve('src', 'models'),
  'seeders-path': path.resolve('src', 'seeders'),
  'migrations-path': path.resolve('src', 'migrations')
};
```

Generate a migration:

```bash
npx sequelize-cli migration:generate --name add-phone-to-users
```

This creates a migration file:

```typescript
// src/migrations/add-phone-to-users.ts
import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  await queryInterface.addColumn('users', 'phone', {
    type: DataTypes.STRING,
    allowNull: true,
  });
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.removeColumn('users', 'phone');
};
```

Run migrations:

```bash
npx sequelize-cli db:migrate
```

> **Migrations are vital for team development** : They ensure everyone's database schema stays in sync and provide a way to rollback changes if needed.

## TypeScript Best Practices with Sequelize

1. **Use Interfaces for Type Safety** :

```typescript
// src/types/UserAttributes.ts
export interface UserAttributes {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UserCreationAttributes 
  extends Omit<UserAttributes, 'id'> {}
```

Update the User model:

```typescript
// In User.ts
export class User extends Model<UserAttributes, UserCreationAttributes> {
  // ... existing code
}
```

2. **Create Repository Pattern** :

```typescript
// src/repositories/UserRepository.ts
import { User } from '../models/User';
import { UserCreationAttributes } from '../types/UserAttributes';

export class UserRepository {
  async createUser(userData: UserCreationAttributes): Promise<User> {
    return User.create(userData);
  }
  
  async findUserByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }
  
  async updateUser(
    id: number, 
    updates: Partial<UserCreationAttributes>
  ): Promise<[number, User[]]> {
    return User.update(updates, {
      where: { id },
      returning: true
    });
  }
  
  async deleteUser(id: number): Promise<number> {
    return User.destroy({ where: { id } });
  }
}
```

3. **Use Transaction for Complex Operations** :

```typescript
async function createUserWithPost(
  userData: UserCreationAttributes,
  postData: PostCreationAttributes
): Promise<{ user: User; post: Post }> {
  const transaction = await sequelize.transaction();
  
  try {
    const user = await User.create(userData, { transaction });
    const post = await Post.create({
      ...postData,
      userId: user.id
    }, { transaction });
  
    await transaction.commit();
    return { user, post };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

4. **Environment-specific Configuration** :

```typescript
// src/config/database.ts
import { Dialect } from 'sequelize';

interface DatabaseConfig {
  database: string;
  dialect: Dialect;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  storage?: string;
}

const development: DatabaseConfig = {
  database: 'dev_db',
  dialect: 'sqlite',
  storage: './dev.sqlite'
};

const test: DatabaseConfig = {
  database: 'test_db',
  dialect: 'sqlite',
  storage: ':memory:'
};

const production: DatabaseConfig = {
  database: process.env.DB_NAME!,
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
};

const env = process.env.NODE_ENV || 'development';
const config = { development, test, production }[env];

export default config;
```

## Common Pitfalls and Solutions

1. **Forgetting to sync/migrate** :

* Always run `sequelize.sync()` in development
* Use migrations in production

1. **N+1 Query Problem** :

```typescript
   // Bad - causes N+1 queries
   const users = await User.findAll();
   for (const user of users) {
     console.log(user.posts); // Separate query for each user
   }

   // Good - eager loading
   const users = await User.findAll({
     include: [Post]
   });
```

1. **Not handling TypeScript properly** :

```typescript
   // Bad - losing type safety
   const user: any = await User.findByPk(1);

   // Good - maintaining types
   const user = await User.findByPk(1);
   if (user) {
     // TypeScript knows user exists here
     console.log(user.email);
   }
```

## Testing with Sequelize

```typescript
// src/tests/user.test.ts
import { beforeAll, afterAll, beforeEach, describe, it, expect } from '@jest/globals';
import sequelize from '../database';
import { User } from '../models/User';

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });
  
  afterAll(async () => {
    await sequelize.close();
  });
  
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });
  
  it('should create a user', async () => {
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
  
    expect(user.fullName).toBe('Test User');
    expect(user.email).toBe('test@example.com');
  });
  
  it('should not allow duplicate emails', async () => {
    await User.create({
      firstName: 'First',
      lastName: 'User',
      email: 'duplicate@example.com',
      password: 'password1'
    });
  
    await expect(User.create({
      firstName: 'Second',
      lastName: 'User',
      email: 'duplicate@example.com',
      password: 'password2'
    })).rejects.toThrow();
  });
});
```

## Final Thoughts

Sequelize with TypeScript provides a powerful, type-safe way to interact with databases. The key benefits are:

1. **Type Safety** : Catch errors at compile time
2. **Developer Experience** : Excellent IDE support and autocompletion
3. **Maintainability** : Self-documenting code with types
4. **Flexibility** : Support for multiple databases
5. **Feature Rich** : Migrations, associations, transactions, and more

Remember to:

* Always use migrations for schema changes
* Leverage TypeScript's type system for better models
* Use repositories for cleaner code organization
* Handle associations carefully with proper eager/lazy loading
* Test your models thoroughly

> **Next Steps** : Practice building a complete application with Sequelize and TypeScript. Start with a simple blog or todo app, gradually adding more complex features like user authentication, role-based access, and advanced queries.

Happy coding with Sequelize and TypeScript!
