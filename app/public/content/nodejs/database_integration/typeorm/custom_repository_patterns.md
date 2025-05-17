# Understanding Repository Patterns in TypeORM with Node.js

I'll explain the repository pattern in TypeORM from first principles, diving deep into how it works and how to implement custom repositories for your Node.js applications.

## First Principles: What is a Repository Pattern?

> The repository pattern is a design pattern that creates an abstraction layer between your data access code and your business logic. It acts as a collection of domain objects in memory, providing a way to access your data without exposing the details of how that data is stored or retrieved.

The repository pattern emerged from Domain-Driven Design (DDD) principles. At its core, it serves to:

1. Centralize data access logic
2. Provide a clean API for working with your application data
3. Make your code more testable by allowing repository implementations to be mocked
4. Decouple your business logic from the data access infrastructure

## The Problem the Repository Pattern Solves

Imagine developing a Node.js application without any structure for data access. You might end up with:

* Database queries scattered throughout your code
* Business logic mixed with database operations
* Difficulty testing components that rely on database access
* Challenges when switching databases or data access strategies

The repository pattern addresses these issues by creating a clean separation of concerns.

## TypeORM Repositories: The Foundation

TypeORM is an Object-Relational Mapping (ORM) library for TypeScript and JavaScript that runs in Node.js. It provides built-in repository support.

### Basic TypeORM Repository

TypeORM gives you repositories out of the box. Let's see how they work with a simple example:

```typescript
// Entity definition
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    @Column()
    email: string;
}
```

This defines a User entity. TypeORM automatically creates a repository for it:

```typescript
// Using the built-in repository
import { getRepository } from "typeorm";
import { User } from "./entity/User";

async function getUserById(id: number): Promise<User | null> {
    const userRepository = getRepository(User);
    return await userRepository.findOne({ where: { id } });
}
```

The built-in repository provides methods like `find`, `findOne`, `save`, `update`, `delete`, etc. But what if you need custom behavior?

## Custom Repository Patterns in TypeORM

Now let's dive into implementing custom repositories. There are several approaches:

### 1. Extending the Repository Class

> By extending TypeORM's Repository class, you can add custom methods while retaining all the built-in functionality.

```typescript
// user.repository.ts
import { EntityRepository, Repository } from "typeorm";
import { User } from "./entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    // Custom method to find users by email
    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ where: { email } });
    }
  
    // Custom method to find active users
    async findActiveUsers(): Promise<User[]> {
        return this.find({
            where: { isActive: true },
            order: { lastName: "ASC", firstName: "ASC" }
        });
    }
}
```

To use this custom repository:

```typescript
// In a service file
import { getCustomRepository } from "typeorm";
import { UserRepository } from "./user.repository";

async function getActiveUserEmails(): Promise<string[]> {
    const userRepository = getCustomRepository(UserRepository);
    const activeUsers = await userRepository.findActiveUsers();
    return activeUsers.map(user => user.email);
}
```

### 2. Abstract Repository Pattern

For more flexibility, you can create an abstract repository interface and implement it:

```typescript
// base.repository.interface.ts
export interface IBaseRepository<T> {
    getAll(): Promise<T[]>;
    getById(id: number): Promise<T | null>;
    create(item: T): Promise<T>;
    update(id: number, item: T): Promise<T>;
    delete(id: number): Promise<boolean>;
}

// user.repository.interface.ts
import { IBaseRepository } from "./base.repository.interface";
import { User } from "./entity/User";

export interface IUserRepository extends IBaseRepository<User> {
    findByEmail(email: string): Promise<User | null>;
    findActiveUsers(): Promise<User[]>;
}

// user.repository.ts
import { Repository, EntityRepository } from "typeorm";
import { User } from "./entity/User";
import { IUserRepository } from "./user.repository.interface";

@EntityRepository(User)
export class UserRepository extends Repository<User> implements IUserRepository {
    async getAll(): Promise<User[]> {
        return this.find();
    }
  
    async getById(id: number): Promise<User | null> {
        return this.findOne({ where: { id } });
    }
  
    async create(user: User): Promise<User> {
        return this.save(user);
    }
  
    async update(id: number, user: User): Promise<User> {
        await this.update(id, user);
        return this.getById(id) as Promise<User>;
    }
  
    async delete(id: number): Promise<boolean> {
        const result = await this.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
  
    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ where: { email } });
    }
  
    async findActiveUsers(): Promise<User[]> {
        return this.find({ where: { isActive: true } });
    }
}
```

### 3. Service Repository Pattern (Modern Approach)

In more recent versions of TypeORM, a common pattern is to create service classes that use the repository:

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common'; // If using NestJS
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/User';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}
  
    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }
  
    async findOne(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }
  
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }
  
    async create(user: Partial<User>): Promise<User> {
        const newUser = this.userRepository.create(user);
        return this.userRepository.save(newUser);
    }
  
    async update(id: number, user: Partial<User>): Promise<User | null> {
        await this.userRepository.update(id, user);
        return this.findOne(id);
    }
  
    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }
}
```

This approach has become popular because it:

* Follows the Single Responsibility Principle
* Makes it easier to inject other dependencies
* Works well with dependency injection frameworks

## Custom Repositories with TypeORM Data Mapper

TypeORM supports both Active Record and Data Mapper patterns. Let's explore the Data Mapper approach:

```typescript
// user.repository.ts
import { EntityRepository, Repository } from "typeorm";
import { User } from "./entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async findWithPosts(userId: number): Promise<User | null> {
        return this.createQueryBuilder("user")
            .leftJoinAndSelect("user.posts", "post")
            .where("user.id = :userId", { userId })
            .getOne();
    }
  
    async getUsersWithActivePosts(): Promise<User[]> {
        return this.createQueryBuilder("user")
            .leftJoinAndSelect("user.posts", "post", "post.isActive = :isActive", { isActive: true })
            .getMany();
    }
}
```

The QueryBuilder API gives you powerful control over queries:

```typescript
// Example of complex query with QueryBuilder
async findUsersByComplexCriteria(criteria: UserSearchCriteria): Promise<User[]> {
    const query = this.createQueryBuilder("user");
  
    if (criteria.name) {
        query.andWhere(
            "(user.firstName LIKE :name OR user.lastName LIKE :name)",
            { name: `%${criteria.name}%` }
        );
    }
  
    if (criteria.email) {
        query.andWhere("user.email = :email", { email: criteria.email });
    }
  
    if (criteria.minAge) {
        query.andWhere("user.age >= :minAge", { minAge: criteria.minAge });
    }
  
    if (criteria.roles && criteria.roles.length > 0) {
        query.andWhere("user.role IN (:...roles)", { roles: criteria.roles });
    }
  
    return query
        .orderBy("user.createdAt", "DESC")
        .skip(criteria.skip || 0)
        .take(criteria.take || 10)
        .getMany();
}
```

## Implementing a Complete Custom Repository Pattern

Let's build a complete example with a real-world implementation:

### Step 1: Define your Entity

```typescript
// src/entities/Post.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title: string;
  
    @Column("text")
    content: string;
  
    @Column({ default: false })
    isPublished: boolean;
  
    @ManyToOne(() => User, user => user.posts)
    author: User;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
```

### Step 2: Create Repository Interface

```typescript
// src/repositories/interfaces/post.repository.interface.ts
import { Post } from "../../entities/Post";

export interface IPostRepository {
    findAll(): Promise<Post[]>;
    findById(id: number): Promise<Post | null>;
    findPublishedPosts(): Promise<Post[]>;
    findPostsByAuthor(authorId: number): Promise<Post[]>;
    createPost(post: Partial<Post>): Promise<Post>;
    updatePost(id: number, post: Partial<Post>): Promise<Post | null>;
    deletePost(id: number): Promise<boolean>;
}
```

### Step 3: Implement the Repository

```typescript
// src/repositories/post.repository.ts
import { EntityRepository, Repository } from "typeorm";
import { Post } from "../entities/Post";
import { IPostRepository } from "./interfaces/post.repository.interface";

@EntityRepository(Post)
export class PostRepository extends Repository<Post> implements IPostRepository {
    async findAll(): Promise<Post[]> {
        return this.find({
            relations: ["author"]
        });
    }
  
    async findById(id: number): Promise<Post | null> {
        return this.findOne({
            where: { id },
            relations: ["author"]
        });
    }
  
    async findPublishedPosts(): Promise<Post[]> {
        return this.find({
            where: { isPublished: true },
            order: { createdAt: "DESC" },
            relations: ["author"]
        });
    }
  
    async findPostsByAuthor(authorId: number): Promise<Post[]> {
        return this.find({
            where: { author: { id: authorId } },
            order: { createdAt: "DESC" }
        });
    }
  
    async createPost(postData: Partial<Post>): Promise<Post> {
        const post = this.create(postData);
        return this.save(post);
    }
  
    async updatePost(id: number, postData: Partial<Post>): Promise<Post | null> {
        await this.update(id, postData);
        return this.findById(id);
    }
  
    async deletePost(id: number): Promise<boolean> {
        const result = await this.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}
```

### Step 4: Create a Service to Use the Repository

```typescript
// src/services/post.service.ts
import { getCustomRepository } from "typeorm";
import { Post } from "../entities/Post";
import { PostRepository } from "../repositories/post.repository";

export class PostService {
    private postRepository: PostRepository;
  
    constructor() {
        this.postRepository = getCustomRepository(PostRepository);
    }
  
    async getAllPosts(): Promise<Post[]> {
        return this.postRepository.findAll();
    }
  
    async getPostById(id: number): Promise<Post | null> {
        return this.postRepository.findById(id);
    }
  
    async getPublishedPosts(): Promise<Post[]> {
        return this.postRepository.findPublishedPosts();
    }
  
    async getPostsByAuthor(authorId: number): Promise<Post[]> {
        return this.postRepository.findPostsByAuthor(authorId);
    }
  
    async createPost(postData: Partial<Post>): Promise<Post> {
        return this.postRepository.createPost(postData);
    }
  
    async updatePost(id: number, postData: Partial<Post>): Promise<Post | null> {
        return this.postRepository.updatePost(id, postData);
    }
  
    async deletePost(id: number): Promise<boolean> {
        return this.postRepository.deletePost(id);
    }
  
    async publishPost(id: number): Promise<Post | null> {
        return this.postRepository.updatePost(id, { isPublished: true });
    }
  
    async unpublishPost(id: number): Promise<Post | null> {
        return this.postRepository.updatePost(id, { isPublished: false });
    }
}
```

### Step 5: Use the Service in a Controller (Express example)

```typescript
// src/controllers/post.controller.ts
import { Request, Response } from "express";
import { PostService } from "../services/post.service";

export class PostController {
    private postService: PostService;
  
    constructor() {
        this.postService = new PostService();
    }
  
    getAllPosts = async (req: Request, res: Response): Promise<void> => {
        try {
            const posts = await this.postService.getAllPosts();
            res.json(posts);
        } catch (error) {
            res.status(500).json({ message: "Error fetching posts", error });
        }
    };
  
    getPostById = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);
            const post = await this.postService.getPostById(id);
          
            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }
          
            res.json(post);
        } catch (error) {
            res.status(500).json({ message: "Error fetching post", error });
        }
    };
  
    createPost = async (req: Request, res: Response): Promise<void> => {
        try {
            const post = await this.postService.createPost(req.body);
            res.status(201).json(post);
        } catch (error) {
            res.status(500).json({ message: "Error creating post", error });
        }
    };
  
    // Other controller methods...
}
```

## Advanced Custom Repository Techniques

Let's explore some advanced techniques for custom repositories in TypeORM:

### 1. Transaction Management

```typescript
// In a service
import { getConnection, getCustomRepository } from "typeorm";
import { PostRepository } from "./post.repository";
import { UserRepository } from "./user.repository";

async function createPostWithTags(postData, tagNames, authorId) {
    // Get connection and repositories
    const connection = getConnection();
    const postRepository = getCustomRepository(PostRepository);
    const userRepository = getCustomRepository(UserRepository);
  
    // Use a transaction
    return await connection.transaction(async transactionalEntityManager => {
        // Get repositories from transaction manager
        const postRepo = transactionalEntityManager.getCustomRepository(PostRepository);
        const userRepo = transactionalEntityManager.getCustomRepository(UserRepository);
      
        // Find the author
        const author = await userRepo.findOne(authorId);
        if (!author) throw new Error("Author not found");
      
        // Create the post
        const newPost = postRepo.create({
            ...postData,
            author
        });
      
        // Save the post
        const savedPost = await postRepo.save(newPost);
      
        // Process tags (simplified)
        for (const tagName of tagNames) {
            // Process tags within the transaction
            // ...
        }
      
        return savedPost;
    });
}
```

### 2. Soft Delete Pattern

```typescript
// In your entity
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from "typeorm";

@Entity()
export class Post {
    // ... other columns
  
    @DeleteDateColumn()
    deletedAt: Date;
}

// In your custom repository
@EntityRepository(Post)
export class PostRepository extends Repository<Post> {
    async findAllIncludingDeleted(): Promise<Post[]> {
        return this.createQueryBuilder("post")
            .withDeleted() // Include soft-deleted posts
            .getMany();
    }
  
    async restoreDeletedPost(id: number): Promise<void> {
        await this.restore(id);
    }
}
```

### 3. Repository Factory Pattern

```typescript
// repository.factory.ts
import { Connection, ObjectType, Repository } from "typeorm";

export class RepositoryFactory {
    constructor(private connection: Connection) {}
  
    getRepository<T>(entityClass: ObjectType<T>): Repository<T> {
        return this.connection.getRepository(entityClass);
    }
  
    getCustomRepository<T>(customRepositoryClass: ObjectType<T>): T {
        return this.connection.getCustomRepository(customRepositoryClass);
    }
}

// Using the factory
import { RepositoryFactory } from "./repository.factory";
import { getConnection } from "typeorm";
import { PostRepository } from "./post.repository";

const connection = getConnection();
const repositoryFactory = new RepositoryFactory(connection);

const postRepository = repositoryFactory.getCustomRepository(PostRepository);
```

## Dependency Injection with Custom Repositories

When working with frameworks like NestJS, you can leverage dependency injection:

```typescript
// In a NestJS module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostRepository } from './repositories/post.repository';
import { PostService } from './services/post.service';
import { PostController } from './controllers/post.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Post, PostRepository]),
    ],
    providers: [PostService],
    controllers: [PostController],
    exports: [PostService],
})
export class PostModule {}

// In your service
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostRepository } from './repositories/post.repository';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(PostRepository)
        private postRepository: PostRepository,
    ) {}
  
    // Service methods that use postRepository
}
```

## Testing Custom Repositories

One of the main benefits of the repository pattern is testability:

```typescript
// post.repository.spec.ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostRepository } from './repositories/post.repository';

describe('PostRepository', () => {
    let postRepository: PostRepository;
  
    const mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };
  
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                PostRepository,
                {
                    provide: getRepositoryToken(Post),
                    useValue: mockRepository,
                },
            ],
        }).compile();
      
        postRepository = moduleRef.get<PostRepository>(PostRepository);
    });
  
    it('should find all posts', async () => {
        const expectedResult = [{ id: 1, title: 'Test Post' }];
        mockRepository.find.mockReturnValue(expectedResult);
      
        const result = await postRepository.findAll();
      
        expect(result).toEqual(expectedResult);
        expect(mockRepository.find).toHaveBeenCalledWith({
            relations: ['author']
        });
    });
  
    // More tests...
});
```

## Best Practices for Custom Repository Patterns

1. **Separate Concerns** : Keep your repositories focused on data access, not business logic.
2. **Use Interfaces** : Define interfaces for your repositories to make them easily mockable.
3. **Follow the Repository Naming Convention** : Name methods clearly to communicate their purpose.
4. **Centralize Query Logic** : Put complex queries in your repositories, not in services or controllers.
5. **Handle Database-Specific Logic** : Put any database-specific optimizations in your repositories.
6. **Use TypeORM Features** : Take advantage of TypeORM features like relations, eager loading, and query builders.
7. **Implement Error Handling** : Add proper error handling in your repositories.
8. **Test Your Repositories** : Write comprehensive tests for your repositories.

## Common Pitfalls and How to Avoid Them

1. **Repository Bloat** : Repositories can become too large. Split them if they grow too big.
2. **Circular Dependencies** : Be careful with relations to avoid circular dependency issues.
3. **Performance Issues** : Watch out for N+1 query problems. Use proper relation loading strategies.
4. **Leaky Abstractions** : Don't expose implementation details through your repository API.

## Conclusion

The custom repository pattern in TypeORM provides a powerful way to organize your data access code in Node.js applications. By following the principles and examples outlined in this guide, you can create well-structured, maintainable, and testable applications.

Remember that the repository pattern is about creating a clean separation between your data access code and your business logic. This separation allows you to change your database or data access strategy without affecting the rest of your application.

Would you like me to elaborate on any specific aspect of the custom repository pattern in TypeORM?
