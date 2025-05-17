# Active Record vs Data Mapper in TypeORM

Let me explain the Active Record and Data Mapper patterns in TypeORM from first principles, breaking down these architectural approaches and how they shape your Node.js applications.

## Understanding Object-Relational Mapping (ORM)

Before diving into Active Record and Data Mapper, let's establish what an ORM does:

> An Object-Relational Mapper is a layer that sits between your application code and your database, translating your programming objects to database records and vice versa.

The primary goal of any ORM is to solve the "impedance mismatch" between object-oriented programming languages and relational databases. In JavaScript/TypeScript, we work with objects, while databases work with tables, rows, and columns.

## The Two Fundamental Patterns

TypeORM uniquely supports two architectural patterns for database interaction:

1. **Active Record Pattern**
2. **Data Mapper Pattern**

Let's explore each one from first principles.

## Active Record Pattern

### Core Principles

> In Active Record, your model classes contain both the data and the methods to work with that data. The model "knows" how to save itself to the database, find records, update, and delete.

The concept comes from Martin Fowler's book "Patterns of Enterprise Application Architecture," where he describes it as a pattern where:

> "An object carries both data and behavior. Much of this behavior is centered around a database record."

### How It Works in TypeORM

In TypeORM's Active Record implementation, your entity classes extend a base repository class that provides database operations.

Let's look at a concrete example:

```typescript
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  firstName: string;
  
  @Column()
  lastName: string;
  
  @Column()
  email: string;
  
  // Business logic methods
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

// Usage example
async function createUser() {
  // Create a new user instance
  const user = new User();
  user.firstName = "John";
  user.lastName = "Doe";
  user.email = "john.doe@example.com";
  
  // Save to database using the instance itself
  await user.save();
  
  console.log(`User saved with ID: ${user.id}`);
  
  // Find a user
  const foundUser = await User.findOne({ where: { email: "john.doe@example.com" } });
  console.log(`Found user: ${foundUser.getFullName()}`);
}
```

Notice how in this example:

* The `User` class extends `BaseEntity`, which provides methods like `save()`, `find()`, etc.
* Database operations are called directly on either the class (for static methods like `findOne`) or on instances (for instance methods like `save`).

### Advantages of Active Record

1. **Simplicity** : It's more straightforward and requires less code to get started.
2. **Discoverability** : All methods for manipulating data are on the model itself.
3. **Self-contained** : Each entity knows how to persist itself.

### Disadvantages of Active Record

1. **Tight coupling** : Your domain models are tightly coupled to your database schema.
2. **Testing challenges** : Testing becomes harder because your domain logic is tied to database operations.
3. **Single Responsibility Principle** : Violates SRP by making classes responsible for both business logic and data access.

## Data Mapper Pattern

### Core Principles

> In Data Mapper, your model classes are simple data containers (POJOs - Plain Old JavaScript Objects), and separate "mapper" classes handle database operations. The models have no knowledge of the database.

Again referencing Martin Fowler:

> "A Data Mapper is a layer of software that separates the in-memory objects from the database. Its responsibility is to transfer data between the two and also to isolate them from each other."

### How It Works in TypeORM

With the Data Mapper pattern in TypeORM, you create repositories that are responsible for database operations, while your entities are just data containers.

Let's see an example:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  firstName: string;
  
  @Column()
  lastName: string;
  
  @Column()
  email: string;
  
  // Business logic methods (no database operations)
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

// Usage example
import { Repository, EntityRepository, getRepository } from "typeorm";

@EntityRepository(User)
class UserRepository extends Repository<User> {
  // You can add custom methods here
  findByEmail(email: string) {
    return this.findOne({ where: { email } });
  }
}

async function createUser() {
  // Get the repository
  const userRepository = getRepository(User);
  
  // Create a new user instance
  const user = new User();
  user.firstName = "John";
  user.lastName = "Doe";
  user.email = "john.doe@example.com";
  
  // Save to database using the repository
  await userRepository.save(user);
  
  console.log(`User saved with ID: ${user.id}`);
  
  // Find a user using the repository
  const foundUser = await userRepository.findOne({ where: { email: "john.doe@example.com" } });
  console.log(`Found user: ${foundUser.getFullName()}`);
}
```

Key differences in this example:

* The `User` class does not extend any base class
* Database operations are performed through a separate `UserRepository`
* The entity itself has no knowledge of how to persist itself

### Advantages of Data Mapper

1. **Separation of concerns** : Domain logic is separate from persistence logic.
2. **Testability** : Models can be easily tested without database dependencies.
3. **Flexibility** : Changes to the database schema don't necessarily require changes to your domain models.
4. **Rich domain models** : Your domain models can focus on business logic.

### Disadvantages of Data Mapper

1. **More code** : Requires more code to set up and maintain.
2. **Complexity** : More complex architecture that may be overkill for simple applications.
3. **Learning curve** : More difficult for beginners to understand.

## Practical Comparison

To further illustrate the differences, let's compare how common operations are performed in both patterns:

### Creating and Saving Records

 **Active Record** :

```typescript
// Create and save
const user = new User();
user.firstName = "Jane";
user.lastName = "Smith";
user.email = "jane.smith@example.com";
await user.save();
```

 **Data Mapper** :

```typescript
// Create
const user = new User();
user.firstName = "Jane";
user.lastName = "Smith";
user.email = "jane.smith@example.com";

// Save using repository
const userRepository = getRepository(User);
await userRepository.save(user);
```

### Finding Records

 **Active Record** :

```typescript
// Find all users
const allUsers = await User.find();

// Find one user by id
const user = await User.findOne({ where: { id: 1 } });

// Find with conditions
const janeUsers = await User.find({ where: { firstName: "Jane" } });
```

 **Data Mapper** :

```typescript
const userRepository = getRepository(User);

// Find all users
const allUsers = await userRepository.find();

// Find one user by id
const user = await userRepository.findOne({ where: { id: 1 } });

// Find with conditions
const janeUsers = await userRepository.find({ where: { firstName: "Jane" } });
```

### Updating Records

 **Active Record** :

```typescript
// Find, update and save
const user = await User.findOne({ where: { id: 1 } });
user.firstName = "John";
await user.save();

// Update many records
await User.update({ firstName: "Jane" }, { firstName: "Jenny" });
```

 **Data Mapper** :

```typescript
const userRepository = getRepository(User);

// Find, update and save
const user = await userRepository.findOne({ where: { id: 1 } });
user.firstName = "John";
await userRepository.save(user);

// Update many records
await userRepository.update({ firstName: "Jane" }, { firstName: "Jenny" });
```

### Deleting Records

 **Active Record** :

```typescript
// Find and remove
const user = await User.findOne({ where: { id: 1 } });
await user.remove();

// Remove many records
await User.delete({ firstName: "Jane" });
```

 **Data Mapper** :

```typescript
const userRepository = getRepository(User);

// Find and remove
const user = await userRepository.findOne({ where: { id: 1 } });
await userRepository.remove(user);

// Remove many records
await userRepository.delete({ firstName: "Jane" });
```

## Setting Up TypeORM for Each Pattern

TypeORM is unique in that it supports both patterns. The choice is made when you initialize your application.

### Active Record Setup

```typescript
import { createConnection } from "typeorm";
import { User } from "./entity/User";

async function setupConnection() {
  await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "typeorm_test",
    entities: [User],
    synchronize: true
  });
  
  console.log("Connection established");
}
```

### Data Mapper Setup

The connection setup is the same, but the way you interact with your entities changes, as shown in the examples above.

## When to Use Each Pattern

### Choose Active Record When:

1. **Building a small to medium application** with simple domain logic
2. **Rapid development** is the priority
3. Your project **doesn't require complex domain modeling**
4. You're building a **prototype or MVP**
5. You have **limited experience with more complex architectural patterns**

### Choose Data Mapper When:

1. **Building a large, complex application** with rich domain logic
2. **Testability** is a high priority
3. You need to **maintain a clear separation of concerns**
4. Your project requires **complex domain modeling**
5. You want to **follow DDD (Domain-Driven Design)** principles
6. Your application will likely **evolve significantly over time**

## Transitioning Between Patterns

It's worth noting that transitioning from Active Record to Data Mapper is much harder than going the other way around. This is because:

1. Active Record couples your domain models to database operations
2. Separating these concerns later requires significant refactoring

If you're unsure which pattern to use, and your application might grow complex over time, it's often safer to start with Data Mapper.

## Real-World Example: User Authentication

Let's walk through a more complete example of implementing user authentication with both patterns.

### Active Record Implementation

```typescript
// user.entity.ts
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ unique: true })
  email: string;
  
  @Column()
  password: string;
  
  @Column()
  name: string;
  
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
  
  generateJwtToken(): string {
    return jwt.sign(
      { id: this.id, email: this.email },
      "your-secret-key",
      { expiresIn: "1d" }
    );
  }
  
  static async register(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists");
    }
  
    // Create new user
    const user = new User();
    user.email = email;
    user.password = password; // Will be hashed by @BeforeInsert
    user.name = name;
  
    await user.save();
    return user;
  }
  
  static async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }
  
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new Error("Invalid password");
    }
  
    return {
      user,
      token: user.generateJwtToken()
    };
  }
}

// Usage example
async function authExample() {
  try {
    // Register a new user
    const user = await User.register(
      "user@example.com",
      "password123",
      "John Doe"
    );
  
    console.log(`User registered: ${user.name}`);
  
    // Login
    const { user: loggedInUser, token } = await User.login(
      "user@example.com",
      "password123"
    );
  
    console.log(`User logged in: ${loggedInUser.name}`);
    console.log(`Token: ${token}`);
  } catch (error) {
    console.error(error.message);
  }
}
```

### Data Mapper Implementation

```typescript
// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import * as bcrypt from "bcrypt";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ unique: true })
  email: string;
  
  @Column()
  password: string;
  
  @Column()
  name: string;
  
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

// user.repository.ts
import { EntityRepository, Repository } from "typeorm";
import { User } from "./user.entity";
import * as jwt from "jsonwebtoken";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async register(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await this.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists");
    }
  
    // Create new user
    const user = new User();
    user.email = email;
    user.password = password; // Will be hashed by @BeforeInsert
    user.name = name;
  
    await this.save(user);
    return user;
  }
  
  async login(email: string, password: string) {
    const user = await this.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }
  
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new Error("Invalid password");
    }
  
    return {
      user,
      token: this.generateJwtToken(user)
    };
  }
  
  private generateJwtToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      "your-secret-key",
      { expiresIn: "1d" }
    );
  }
}

// Usage example
import { getCustomRepository } from "typeorm";

async function authExample() {
  try {
    const userRepository = getCustomRepository(UserRepository);
  
    // Register a new user
    const user = await userRepository.register(
      "user@example.com",
      "password123",
      "John Doe"
    );
  
    console.log(`User registered: ${user.name}`);
  
    // Login
    const { user: loggedInUser, token } = await userRepository.login(
      "user@example.com",
      "password123"
    );
  
    console.log(`User logged in: ${loggedInUser.name}`);
    console.log(`Token: ${token}`);
  } catch (error) {
    console.error(error.message);
  }
}
```

## Key Differences in the Example

Looking at the authentication examples:

1. **In Active Record** :

* The User class contains both data and methods for registration/login
* User validation logic is directly inside the entity
* Database operations are called directly on the entity class

1. **In Data Mapper** :

* The User class only contains data and very basic validation
* Business logic for registration/login is in a separate repository
* JWT token generation is handled by the repository, not the entity

## Analyzing the Code Structure

Let's analyze the structure of our code:

### Active Record Structure

```
src/
  entities/
    User.ts  // Contains data AND business logic
  index.ts
```

### Data Mapper Structure

```
src/
  entities/
    User.ts  // Contains only data
  repositories/
    UserRepository.ts  // Contains business logic
  services/
    AuthService.ts  // May contain higher-level logic
  index.ts
```

## Impact on Testing

Let's examine how testing differs between the two patterns:

### Testing Active Record

```typescript
// Difficult to test in isolation because of database dependency
describe('User', () => {
  beforeAll(async () => {
    // Need to set up a real database connection
    await createConnection({
      type: "sqlite",
      database: ":memory:",
      entities: [User],
      synchronize: true,
      dropSchema: true
    });
  });
  
  it('should register a new user', async () => {
    const user = await User.register(
      "test@example.com",
      "password123",
      "Test User"
    );
  
    expect(user.id).toBeDefined();
    expect(user.email).toBe("test@example.com");
    // Can't test password directly because it's hashed
  });
});
```

### Testing Data Mapper

```typescript
// Easier to mock and test in isolation
describe('UserRepository', () => {
  let userRepository: UserRepository;
  
  beforeEach(() => {
    // Can use mock repository
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      // other methods
    } as any;
  });
  
  it('should register a new user', async () => {
    // Setup mocks
    userRepository.findOne.mockResolvedValue(null);
    userRepository.save.mockImplementation(user => {
      user.id = 1;
      return Promise.resolve(user);
    });
  
    const user = await userRepository.register(
      "test@example.com",
      "password123",
      "Test User"
    );
  
    expect(userRepository.findOne).toHaveBeenCalledWith({ 
      where: { email: "test@example.com" } 
    });
    expect(userRepository.save).toHaveBeenCalled();
    expect(user.id).toBe(1);
  });
});
```

## Performance Considerations

In terms of performance, there's generally little difference between the two patterns in TypeORM. Both ultimately translate to similar SQL queries. However:

1. **Active Record** might be slightly faster for simple CRUD operations due to less code execution.
2. **Data Mapper** might be more efficient for complex domain logic, as it allows for more optimized queries through repository methods.

## When TypeORM Breaks These Patterns

It's worth noting that TypeORM doesn't purely implement either pattern—it's a hybrid approach:

1. **Active Record Implementation** : TypeORM's Active Record still separates entities from query builders, unlike traditional Active Record implementations.
2. **Data Mapper Implementation** : TypeORM's Data Mapper allows entities to have some behavior, whereas pure Data Mapper keeps entities as simple data containers.

## Summary: Making Your Decision

When deciding between Active Record and Data Mapper in TypeORM, consider:

> **Active Record**
>
> * Simpler, less code
> * Faster to develop with
> * Better for small projects
> * Easier to learn
> * Tightly couples domain and persistence logic

> **Data Mapper**
>
> * Better separation of concerns
> * More testable
> * Better for complex domain logic
> * Follows SOLID principles
> * Requires more code but enforces better architecture

Remember that TypeORM's flexible approach allows you to start with one pattern and potentially transition to the other as your application grows, though moving from Active Record to Data Mapper is more challenging.

Both patterns are valid architectural choices—the key is understanding the tradeoffs and choosing the one that best fits your project's requirements and your team's expertise.
