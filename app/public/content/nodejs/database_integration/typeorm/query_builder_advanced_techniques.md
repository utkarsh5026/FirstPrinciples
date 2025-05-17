# Query Builder Advanced Techniques in TypeORM

I'll explain TypeORM's Query Builder from first principles, exploring advanced techniques that help you construct powerful, flexible database queries in Node.js applications.

> The Query Builder is one of TypeORM's most powerful features - a fluent API that allows you to build SQL queries using method chaining in a way that's both type-safe and intuitive.

## First Principles: What is a Query Builder?

At its core, a Query Builder is a programming pattern that allows you to construct database queries programmatically rather than writing raw SQL strings. This approach offers several fundamental advantages:

1. **Type safety** - Your IDE can provide autocompletion and catch errors at compile time
2. **Query composition** - Build queries incrementally based on conditions
3. **SQL injection prevention** - Parameters are automatically sanitized
4. **Database agnosticism** - The same code can work across different database systems

In TypeORM, the Query Builder is implemented as a chain of methods that progressively build a SQL query, which is finally executed when you call one of the execution methods like `getOne()`, `getMany()`, or `execute()`.

## Setting Up TypeORM for Query Builder

Before diving into advanced techniques, let's ensure we have TypeORM properly set up:

```typescript
// First, install required packages
// npm install typeorm reflect-metadata @types/node pg

// Import necessary modules
import "reflect-metadata";
import { createConnection, Connection } from "typeorm";

// Define an entity
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
    age: number;
}

// Create a connection
createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "test",
    entities: [User],
    synchronize: true
}).then(connection => {
    // We'll use this connection for our examples
    console.log("Connected to database");
}).catch(error => console.log("Error: ", error));
```

This example sets up a connection to a PostgreSQL database with a simple User entity. The `synchronize: true` option automatically creates the database schema based on our entity definitions (only use this in development).

## Basic Query Builder Usage

Let's start with a simple example and build up to more advanced techniques:

```typescript
// Get the repository for the User entity
const userRepository = connection.getRepository(User);

// Create a query builder instance
const queryBuilder = userRepository.createQueryBuilder("user");

// Build and execute a simple query
const youngUsers = await queryBuilder
    .where("user.age < :age", { age: 30 })
    .getMany();

console.log(youngUsers);
```

Here, `"user"` is an alias for the User table. The alias helps us reference the table in our query conditions, especially when dealing with joins.

## Advanced Technique 1: Complex Conditions and Logical Operators

Let's explore how to build more complex WHERE conditions:

```typescript
const users = await userRepository
    .createQueryBuilder("user")
    .where("(user.firstName = :firstName OR user.lastName = :lastName)", 
           { firstName: "John", lastName: "Doe" })
    .andWhere("user.age > :minAge", { minAge: 18 })
    .getMany();
```

This query finds users who either have the first name "John" or last name "Doe", AND are over 18 years old.

We can also use the `Brackets` class for more complex logical grouping:

```typescript
import { Brackets } from "typeorm";

const users = await userRepository
    .createQueryBuilder("user")
    .where("user.age > :minAge", { minAge: 18 })
    .andWhere(new Brackets(qb => {
        qb.where("user.firstName = :firstName", { firstName: "John" })
          .orWhere("user.lastName = :lastName", { lastName: "Doe" });
    }))
    .getMany();
```

This produces SQL equivalent to: `WHERE user.age > 18 AND (user.firstName = 'John' OR user.lastName = 'Doe')`.

## Advanced Technique 2: Working with Joins

Joins are crucial for querying related data. Let's assume we have two related entities:

```typescript
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

Now, let's perform different types of joins:

```typescript
// Inner join
const usersWithPhotos = await userRepository
    .createQueryBuilder("user")
    .innerJoinAndSelect("user.photos", "photo")
    .getMany();

// Left join
const allUsersWithOptionalPhotos = await userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .getMany();

// Conditional join
const usersWithLargePhotos = await userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo", "photo.size > :size", { size: 1000 })
    .getMany();
```

In these examples:

* `innerJoinAndSelect` means "only include users who have photos"
* `leftJoinAndSelect` means "include all users, even those without photos"
* The third example adds a condition to the join, only selecting photos larger than 1000KB

The `AndSelect` part means we're not just joining the tables but also selecting the data from the joined table.

## Advanced Technique 3: Subqueries

Subqueries allow for powerful nested queries:

```typescript
// Find users who have at least one photo
const usersWithPhotos = await userRepository
    .createQueryBuilder("user")
    .where(qb => {
        const subQuery = qb
            .subQuery()
            .select("photo.userId")
            .from(Photo, "photo")
            .where("photo.isPublished = :isPublished")
            .getQuery();
        return "user.id IN " + subQuery;
    })
    .setParameter("isPublished", true)
    .getMany();
```

This example finds all users who have at least one published photo. The subquery selects userIds from the Photo table where `isPublished` is true, and the main query selects users whose IDs are in that result set.

## Advanced Technique 4: Raw Queries and Result Transformations

Sometimes, you need the flexibility of raw SQL combined with TypeORM's features:

```typescript
// Using a raw query within QueryBuilder
const users = await userRepository
    .createQueryBuilder("user")
    .where("LOWER(user.email) = LOWER(:email)", { email: "john@example.com" })
    .getMany();

// Selecting specific fields
const userNames = await userRepository
    .createQueryBuilder("user")
    .select(["user.firstName", "user.lastName"])
    .getMany();

// Using SQL functions
const userStats = await userRepository
    .createQueryBuilder("user")
    .select("COUNT(user.id)", "userCount")
    .addSelect("AVG(user.age)", "averageAge")
    .getRawOne();

console.log(`User count: ${userStats.userCount}, Average age: ${userStats.averageAge}`);
```

The first example uses SQL's `LOWER()` function for case-insensitive email matching. The third example demonstrates how to use aggregate functions like `COUNT()` and `AVG()`.

## Advanced Technique 5: Pagination

Pagination is essential for handling large datasets:

```typescript
// Implementing pagination
const pageSize = 10;
const pageNumber = 2; // second page (1-indexed)

const paginatedUsers = await userRepository
    .createQueryBuilder("user")
    .orderBy("user.id")
    .skip((pageNumber - 1) * pageSize)
    .take(pageSize)
    .getMany();

// Getting total count for pagination metadata
const totalUsers = await userRepository
    .createQueryBuilder("user")
    .getCount();

const totalPages = Math.ceil(totalUsers / pageSize);

console.log(`Showing page ${pageNumber} of ${totalPages}`);
```

This implementation demonstrates:

* `skip()` - Calculates the offset based on page number and size
* `take()` - Limits the number of results (equivalent to LIMIT in SQL)
* Getting the total count for calculating the total number of pages

## Advanced Technique 6: Dynamic Query Building

One of the most powerful aspects of Query Builder is the ability to build queries dynamically based on conditions:

```typescript
// Function to build a query dynamically based on filters
async function findUsers(filters: {
    name?: string,
    minAge?: number,
    maxAge?: number,
    orderBy?: string,
    orderDirection?: 'ASC' | 'DESC'
}) {
    const qb = userRepository.createQueryBuilder("user");
  
    // Add conditions based on provided filters
    if (filters.name) {
        qb.andWhere(
            "user.firstName LIKE :name OR user.lastName LIKE :name", 
            { name: `%${filters.name}%` }
        );
    }
  
    if (filters.minAge !== undefined) {
        qb.andWhere("user.age >= :minAge", { minAge: filters.minAge });
    }
  
    if (filters.maxAge !== undefined) {
        qb.andWhere("user.age <= :maxAge", { maxAge: filters.maxAge });
    }
  
    // Apply ordering if specified
    if (filters.orderBy) {
        const direction = filters.orderDirection || 'ASC';
        qb.orderBy(`user.${filters.orderBy}`, direction);
    }
  
    return qb.getMany();
}

// Usage
const youngJohns = await findUsers({
    name: 'John',
    maxAge: 30,
    orderBy: 'age',
    orderDirection: 'DESC'
});
```

This technique is extremely useful for search functionality or API endpoints where users can filter by various criteria.

## Advanced Technique 7: Transactions

For operations that need to be atomic, TypeORM's Query Builder supports transactions:

```typescript
// Using transaction to ensure both operations succeed or both fail
await connection.transaction(async transactionalEntityManager => {
    // Get a transactional query builder
    const userQb = transactionalEntityManager.createQueryBuilder()
        .update(User)
        .set({ credits: () => "credits - 100" })
        .where("id = :userId", { userId: 1 })
        .returning("*");
  
    const updatedUser = await userQb.execute();
  
    if (updatedUser.raw[0].credits < 0) {
        throw new Error("Insufficient credits");
    }
  
    // Second operation - only happens if first one succeeded
    await transactionalEntityManager.createQueryBuilder()
        .insert()
        .into(Transaction)
        .values({
            userId: 1,
            amount: 100,
            type: "purchase"
        })
        .execute();
});
```

This example demonstrates:

1. Using a transaction to ensure data consistency
2. Getting transactional entity manager for creating query builders
3. Using SQL expressions in updates with the `set()` method
4. Using the `returning()` method to get updated records
5. Conditionally rolling back the transaction by throwing an error

## Advanced Technique 8: Relation Queries and Tree Structures

TypeORM has special methods for working with relations and tree structures:

```typescript
// Loading specific relations
const userWithPhotos = await userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .where("user.id = :id", { id: 1 })
    .getOne();

// Working with tree structures (assuming User has tree relations)
const userWithDescendants = await userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.children", "children")
    .leftJoinAndSelect("children.children", "grandchildren")
    .where("user.id = :id", { id: 1 })
    .getOne();
```

For deeply nested tree structures, TypeORM provides specialized repositories:

```typescript
// Assuming User entity is decorated with @Tree() and proper tree columns
const treeRepository = connection.getTreeRepository(User);

// Get entire tree starting from a root node
const tree = await treeRepository.findDescendantsTree(rootUser);

// Get all ancestors of a node
const ancestors = await treeRepository.findAncestors(someUser);
```

## Advanced Technique 9: Custom Result Mapping

Sometimes you need to transform query results into custom objects:

```typescript
interface UserSummary {
    fullName: string;
    photoCount: number;
}

const userSummaries = await userRepository
    .createQueryBuilder("user")
    .leftJoin("user.photos", "photo")
    .select("user.firstName || ' ' || user.lastName", "fullName")
    .addSelect("COUNT(photo.id)", "photoCount")
    .groupBy("user.id")
    .getRawMany<UserSummary>();

// Display results
userSummaries.forEach(summary => {
    console.log(`${summary.fullName} has ${summary.photoCount} photos`);
});
```

This query creates a custom projection with concatenated name fields and a count of related photos, directly mapping to our `UserSummary` interface.

## Advanced Technique 10: Soft Deletes and Query Filtering

Let's implement soft delete functionality (marking records as deleted rather than actually removing them):

```typescript
@Entity()
class User {
    // ... other columns

    @Column({ default: false })
    isDeleted: boolean;
}

// Create a function that always filters out "deleted" records
function createSafeQueryBuilder() {
    return userRepository
        .createQueryBuilder("user")
        .where("user.isDeleted = :isDeleted", { isDeleted: false });
}

// Usage
const activeUsers = await createSafeQueryBuilder()
    .andWhere("user.lastLoginDate > :date", { date: new Date(Date.now() - 86400000) })
    .getMany();
```

This pattern ensures your application consistently filters out soft-deleted records.

## Advanced Technique 11: Query Caching

For queries that are expensive but don't change often, TypeORM offers query caching:

```typescript
// Enable query caching for 60 seconds
const users = await userRepository
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .where("user.isActive = :isActive", { isActive: true })
    .cache(60000) // Cache for 60 seconds
    .getMany();
```

To use this feature, you need to configure a cache provider in your TypeORM connection options:

```typescript
createConnection({
    // ... other connection options
    cache: {
        type: "redis",
        options: {
            host: "localhost",
            port: 6379
        },
        duration: 30000 // default duration in milliseconds
    }
});
```

## Advanced Technique 12: Using Query Builder for Data Migration

Query Builder can be powerful for data migrations:

```typescript
// Example: Migrating data between tables
async function migrateUserTitles() {
    const connection = getConnection();
  
    // Step 1: Create a temporary mapping table
    await connection.query(`
        CREATE TEMPORARY TABLE title_mapping (
            old_title TEXT,
            new_title TEXT
        )
    `);
  
    // Step 2: Insert mapping data
    await connection.query(`
        INSERT INTO title_mapping VALUES 
        ('Mr', 'Mr.'),
        ('Mrs', 'Mrs.'),
        ('Ms', 'Ms.'),
        ('Dr', 'Dr.')
    `);
  
    // Step 3: Use QueryBuilder for the update
    const updateResult = await connection
        .createQueryBuilder()
        .update(User)
        .set({
            title: () => `(SELECT new_title FROM title_mapping WHERE old_title = User.title)`
        })
        .where(`title IN (SELECT old_title FROM title_mapping)`)
        .execute();
  
    return updateResult.affected || 0;
}

const migratedCount = await migrateUserTitles();
console.log(`Updated titles for ${migratedCount} users`);
```

This example shows how to combine raw SQL and Query Builder for a complex data migration task.

## Conclusion

TypeORM's Query Builder provides a powerful set of tools for constructing flexible, type-safe database queries in Node.js applications. By mastering these advanced techniques, you can write more efficient, maintainable, and robust data access code.

> Remember that the Query Builder is not just about writing SQL in TypeScript - it's about composing database operations in a way that aligns with your application's domain logic while maintaining type safety and preventing SQL injection.

As you develop your application, you'll likely combine these techniques to solve complex data access problems. The key is understanding the principles behind each approach and knowing when to apply them.
