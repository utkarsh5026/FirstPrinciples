# Entity Relationships and Decorators in TypeORM

I'll explain TypeORM's entity relationships and decorators from first principles, building up from the foundations to more complex concepts with clear examples along the way.

## Understanding Entities in TypeORM

Let's start with the most basic concept: what is an entity?

> An entity in TypeORM represents a database table. It's a class that maps to a table, where each property of the class corresponds to a column in the table.

### The Fundamentals of Entities

At its core, a TypeORM entity is a TypeScript class decorated with the `@Entity()` decorator. This tells TypeORM that this class should be registered as a database table.

Here's a simple entity:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

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
}
```

In this example:

* The `@Entity()` decorator marks the class as an entity
* `@PrimaryGeneratedColumn()` creates an auto-incrementing primary key
* `@Column()` marks class properties as table columns

## Decorators: The Building Blocks of TypeORM

Before diving into relationships, let's understand decorators, which are fundamental to how TypeORM works.

> Decorators in TypeORM are special TypeScript features that add metadata to classes and their properties, allowing TypeORM to understand how to map your TypeScript code to database structures.

### Common TypeORM Decorators

1. **Class Decorators** :

* `@Entity()`: Marks a class as a database table
* `@ViewEntity()`: Marks a class as a database view

1. **Property Decorators** :

* `@Column()`: Marks a property as a table column
* `@PrimaryColumn()`: Marks a column as a primary key
* `@PrimaryGeneratedColumn()`: Creates an auto-incremented primary key
* `@CreateDateColumn()`: Automatically sets to the current date when record is created
* `@UpdateDateColumn()`: Automatically updates to current date when record is updated

Let's expand our User entity with some of these decorators:

```typescript
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

Notice how we can pass configuration options to decorators. For example, `@Column({ length: 50 })` specifies the maximum length of the string in the database.

## Entity Relationships: Connecting Data

Now let's explore the core of your question: entity relationships in TypeORM.

> Entity relationships define how different tables (entities) relate to each other in the database. These relationships mirror real-world connections between data and are essential for building well-structured applications.

TypeORM supports all the standard relationship types found in relational databases:

1. One-to-one
2. One-to-many / Many-to-one
3. Many-to-many

Let's explore each with examples.

### 1. One-to-One Relationship

A one-to-one relationship means that one record in table A is associated with exactly one record in table B, and vice versa.

Example: A user has one profile, and a profile belongs to one user.

```typescript
import { 
  Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn 
} from "typeorm";

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}

@Entity()
class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bio: string;

  @Column()
  website: string;
  
  @OneToOne(() => User, user => user.profile)
  user: User;
}
```

In this example:

* The `@OneToOne()` decorator defines the relationship
* `@JoinColumn()` specifies that this side of the relationship contains the foreign key
* The first parameter of `@OneToOne()` is a function returning the related entity class
* The second parameter is a function that returns the property on the related entity that creates the bidirectional relationship

### 2. One-to-Many / Many-to-One Relationship

This is one of the most common relationships:

* One-to-many: One record in table A can be associated with multiple records in table B
* Many-to-one: Multiple records in table B can be associated with one record in table A

These are two sides of the same relationship.

Example: A user can have many photos, but each photo belongs to one user.

```typescript
import { 
  Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne 
} from "typeorm";

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Photo, photo => photo.user)
  photos: Photo[];
}

@Entity()
class Photo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => User, user => user.photos)
  user: User;
}
```

In this example:

* `@OneToMany()` declares that one user can have many photos
* `@ManyToOne()` declares that many photos can belong to one user
* The relationship is bidirectional, meaning we can navigate from users to photos and vice versa

### 3. Many-to-Many Relationship

A many-to-many relationship means that multiple records in table A can be associated with multiple records in table B.

Example: A post can have many tags, and a tag can be applied to many posts.

```typescript
import { 
  Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable 
} from "typeorm";

@Entity()
class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text")
  content: string;

  @ManyToMany(() => Tag, tag => tag.posts)
  @JoinTable()
  tags: Tag[];
}

@Entity()
class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Post, post => post.tags)
  posts: Post[];
}
```

In this example:

* `@ManyToMany()` declares the many-to-many relationship
* `@JoinTable()` is required on one side of the relationship (the owner side) to specify that this entity is responsible for creating the junction table
* The junction table (post_tags in this case) is created automatically by TypeORM

## Advanced Relationship Configurations

Now that we understand the basics, let's explore some more advanced configurations.

### Cascades

> Cascades determine what happens to related entities when you perform operations on the main entity.

For example, if you delete a user, what should happen to their profile?

```typescript
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToOne(() => Profile, profile => profile.user, {
    cascade: true // Will save/update/remove the profile when the user is saved/updated/removed
  })
  @JoinColumn()
  profile: Profile;
}
```

Cascade options include:

* `true`: Enables all cascades
* `["insert"]`: Only cascades on insert
* `["update"]`: Only cascades on update
* `["remove"]`: Only cascades on remove
* `["soft-remove"]`: Only cascades on soft remove
* `["recover"]`: Only cascades on recover

### Eager and Lazy Relations

TypeORM allows you to control how relationships are loaded:

```typescript
@Entity()
class User {
  // ...

  @OneToMany(() => Photo, photo => photo.user, {
    eager: true // Photos will be loaded automatically with the user
  })
  photos: Photo[];
}
```

With `eager: true`, whenever you load a user, their photos are loaded automatically. Without this option, you would need to use relations in your find options:

```typescript
const usersWithPhotos = await userRepository.find({ relations: ["photos"] });
```

Alternatively, you can use lazy relations which return promises:

```typescript
@Entity()
class User {
  // ...

  @OneToMany(() => Photo, photo => photo.user, {
    lazy: true
  })
  photos: Promise<Photo[]>;
}

// Later in your code
const user = await userRepository.findOne(1);
const photos = await user.photos; // Photos are loaded only when accessed
```

### Relation Options

TypeORM provides many options for configuring relationships:

```typescript
@ManyToOne(() => User, user => user.photos, {
  nullable: false, // The database column will not allow nulls
  onDelete: "CASCADE", // SQL ON DELETE behavior
  eager: true, // Always load this relation
  createForeignKeyConstraints: true // Create foreign key constraints in the database
})
user: User;
```

## Advanced Decorators for Relationships

Let's explore some additional decorators and configurations:

### JoinColumn Options

The `@JoinColumn()` decorator allows detailed configuration of the foreign key column:

```typescript
@Entity()
class User {
  // ...

  @OneToOne(() => Profile)
  @JoinColumn({
    name: "profile_id", // Custom name for the foreign key column
    referencedColumnName: "id" // The column name being referenced in the Profile entity
  })
  profile: Profile;
}
```

### Custom Join Tables

For many-to-many relationships, you can customize the join table:

```typescript
@Entity()
class Post {
  // ...

  @ManyToMany(() => Tag)
  @JoinTable({
    name: "post_tags", // Custom name for the join table
    joinColumn: {
      name: "post_id", // Custom name for the column that holds the Post id
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "tag_id", // Custom name for the column that holds the Tag id
      referencedColumnName: "id"
    }
  })
  tags: Tag[];
}
```

## Custom Entity Decorators

TypeORM allows you to create custom decorators for common patterns:

```typescript
import { Column, ColumnOptions } from "typeorm";

// Creating a custom decorator
export function TextColumn(options?: ColumnOptions): PropertyDecorator {
  return Column({
    type: "text",
    ...options
  });
}

// Using the custom decorator in an entity
@Entity()
class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @TextColumn() // Using our custom decorator
  content: string;
}
```

## Practical Example: Building a Blog System

Let's integrate all these concepts into a practical example of a simple blog system:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable
} from "typeorm";

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Won't be selected by default for security
  password: string;

  @OneToMany(() => Post, post => post.author)
  posts: Post[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text")
  content: string;

  @ManyToOne(() => User, user => user.posts, {
    nullable: false, // A post must have an author
    onDelete: "CASCADE" // If a user is deleted, delete their posts
  })
  author: User;

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @ManyToMany(() => Category, category => category.posts)
  @JoinTable()
  categories: Category[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  content: string;

  @ManyToOne(() => User, user => user.comments, {
    nullable: false,
    onDelete: "CASCADE"
  })
  author: User;

  @ManyToOne(() => Post, post => post.comments, {
    nullable: false,
    onDelete: "CASCADE"
  })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity()
class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column("text", { nullable: true })
  description: string;

  @ManyToMany(() => Post, post => post.categories)
  posts: Post[];
}
```

This example demonstrates:

* One-to-many relationships (User-to-Posts, User-to-Comments, Post-to-Comments)
* Many-to-many relationship (Posts-to-Categories)
* Various column types and constraints
* Cascade delete configurations
* Timestamp columns for tracking creation and updates

## Using the Entities and Relationships

Now let's see how to use these entities and relationships in your application:

### Creating Related Entities

```typescript
import { getRepository } from "typeorm";

// Creating a user and their posts in one operation
async function createUserWithPosts() {
  const userRepository = getRepository(User);
  
  const user = new User();
  user.fullName = "John Doe";
  user.email = "john@example.com";
  user.password = "hashedPassword"; // You would hash this in real code
  
  // Create posts for this user
  user.posts = [
    { title: "My First Post", content: "Hello world!" },
    { title: "Another Post", content: "TypeORM is great!" }
  ];
  
  // Save the user and their posts (cascade is enabled by default)
  await userRepository.save(user);
}
```

### Querying Related Entities

```typescript
async function getUserWithPosts(userId: number) {
  const userRepository = getRepository(User);
  
  // Find a user and load their posts
  const user = await userRepository.findOne(userId, {
    relations: ["posts"] // Specify which relations to load
  });
  
  return user;
}

async function getPostsWithAuthorAndComments() {
  const postRepository = getRepository(Post);
  
  // Load posts with nested relations
  const posts = await postRepository.find({
    relations: ["author", "comments", "comments.author", "categories"]
  });
  
  return posts;
}
```

### Using QueryBuilder for Complex Queries

For more complex queries, TypeORM provides a powerful QueryBuilder:

```typescript
async function getPostsByCategory(categoryName: string) {
  const postRepository = getRepository(Post);
  
  const posts = await postRepository
    .createQueryBuilder("post")
    .innerJoinAndSelect("post.categories", "category")
    .innerJoinAndSelect("post.author", "author")
    .where("category.name = :name", { name: categoryName })
    .orderBy("post.createdAt", "DESC")
    .getMany();
  
  return posts;
}
```

## Common Pitfalls and Best Practices

### 1. Circular Dependencies

When entities reference each other, it can create circular dependencies. Use TypeORM's function syntax to avoid issues:

```typescript
// Instead of this (can cause issues):
import { User } from "./User";

// Do this:
@ManyToOne(() => User, user => user.posts)
author: User;
```

### 2. Avoid Excessive Eager Loading

Eager loading can lead to performance issues if not used carefully:

```typescript
// This might load too much data at once
@ManyToMany(() => Tag, { eager: true })
@ManyToMany(() => Category, { eager: true })
```

Instead, be specific about which relations you need when querying:

```typescript
const posts = await postRepository.find({
  relations: ["categories"] // Only load what you need
});
```

### 3. Use Transaction for Complex Operations

When working with multiple related entities, use transactions to ensure data consistency:

```typescript
import { getConnection } from "typeorm";

async function createPostWithComments(postData, commentData) {
  await getConnection().transaction(async transactionalEntityManager => {
    // Create and save post
    const post = new Post();
    post.title = postData.title;
    post.content = postData.content;
    post.author = postData.author;
  
    await transactionalEntityManager.save(post);
  
    // Create and save comments
    const comments = commentData.map(data => {
      const comment = new Comment();
      comment.content = data.content;
      comment.author = data.author;
      comment.post = post;
      return comment;
    });
  
    await transactionalEntityManager.save(comments);
  });
}
```

## Conclusion

TypeORM's entity relationships and decorators provide a powerful way to model your database structure with TypeScript. By understanding the fundamentals of entities, decorators, and relationships types, you can create complex data models that accurately represent your application's domain.

The key points to remember are:

1. **Entities** are TypeScript classes decorated with `@Entity()` that map to database tables
2. **Decorators** add metadata to your classes and properties, telling TypeORM how to map them to the database
3. **Relationships** (`@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`) define how entities are connected
4. TypeORM provides many options for customizing these relationships, such as cascades, eager loading, and custom join columns

By mastering these concepts, you can build robust, type-safe applications with clean, maintainable code that accurately reflects your data model.
