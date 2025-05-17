
# Understanding Embedded Entities and Soft Deletes in TypeORM

## First Principles: What is TypeORM?

Before diving into embedded entities and soft deletes, let's establish what TypeORM is at its core.

TypeORM is an Object-Relational Mapping (ORM) library for TypeScript and JavaScript that helps bridge the gap between object-oriented programming and relational databases. It allows you to:

1. Define your database schema using TypeScript classes
2. Interact with your database using objects instead of SQL queries
3. Focus on business logic rather than database operations

> The fundamental concept of an ORM is to map database tables to classes and database records to objects, making data persistence feel natural in an object-oriented programming environment.

## Embedded Entities: Core Concept

### What Are Embedded Entities?

At the most basic level, embedded entities in TypeORM represent complex value objects that don't have their own identity or separate database table, but are stored as part of another entity.

> Think of an embedded entity as a reusable group of related fields that can be included in multiple entity classes without needing its own database table.

### The Problem Embedded Entities Solve

To understand why embedded entities are useful, consider a real-world modeling challenge:

Imagine you have a `User` entity with address information: street, city, state, zip code, and country. Later, you realize you need to store addresses for both shipping and billing in your `Order` entity as well.

Without embedded entities, you would have two options:

1. Duplicate all address fields in both entities (leading to code duplication)
2. Create a separate `Address` entity with its own table (requiring joins for simple queries)

Embedded entities provide a third, elegant solution: define the address structure once and embed it wherever needed.

### Creating an Embedded Entity

Let's create an example of an embedded entity:

```typescript
// Address.ts - The embedded entity
import { Column } from "typeorm";

export class Address {
    @Column({ length: 100 })
    street: string;
  
    @Column({ length: 50 })
    city: string;
  
    @Column({ length: 2 })
    state: string;
  
    @Column({ length: 10 })
    zipCode: string;
  
    @Column({ length: 50, nullable: true })
    country: string = "USA";
}
```

This `Address` class doesn't have `@Entity()` decoration because it won't be a table itself. Instead, it's a reusable structure that can be embedded in other entities.

### Using the Embedded Entity

Now let's use this embedded entity in a `User` entity:

```typescript
// User.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Address } from "./Address";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    @Column(() => Address) // Embedding the Address entity
    address: Address;
}
```

When you look at your database schema, you'll see that the `User` table contains all the address columns directly, with column names like `street`, `city`, etc.

### Prefix for Embedded Entities

For better organization, you might want to add a prefix to the embedded columns:

```typescript
// User.ts with prefix
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Address } from "./Address";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    @Column(() => Address, { prefix: "home" }) // Adding a prefix
    homeAddress: Address;
  
    @Column(() => Address, { prefix: "work" }) // Another embedding with different prefix
    workAddress: Address;
}
```

With this approach, your database will have columns like `home_street`, `home_city`, `work_street`, `work_city`, etc.

### Using Embedded Entities in Practice

Here's how you would work with an entity that has embedded fields:

```typescript
// Creating a new user with embedded address
const user = new User();
user.firstName = "John";
user.lastName = "Doe";

// Initialize the embedded entity
user.address = new Address();
user.address.street = "123 Main St";
user.address.city = "Boston";
user.address.state = "MA";
user.address.zipCode = "02108";

// Save the entity
await userRepository.save(user);
```

### Benefits of Embedded Entities

1. **Code Reusability** : Define the structure once, use it in multiple entities
2. **Cleaner Domain Model** : Group related fields together
3. **Simpler Queries** : No need for joins to get related data
4. **Consistency** : Ensure the same structure is used across entities

## Soft Deletes: Core Concept

### What Are Soft Deletes?

Soft deletes are a pattern where records are marked as "deleted" in the database but aren't actually removed from the table. This is typically implemented by adding a flag or timestamp field to indicate when a record was deleted.

> Instead of permanently removing data with a DELETE operation, soft deletes simply mark rows as deleted by setting a flag or timestamp. This preserves the data for potential recovery or audit purposes.

### The Problem Soft Deletes Solve

Soft deletes address several real-world issues:

1. **Data Recovery** : Accidentally deleted data can be restored
2. **Audit Trail** : You maintain a history of deleted records
3. **Referential Integrity** : Other records that reference the "deleted" data can still function
4. **Compliance** : Some industries require maintaining deleted data for compliance reasons

### Implementing Soft Deletes in TypeORM

TypeORM provides built-in support for soft deletes through the `@DeleteDateColumn()` decorator:

```typescript
// User.ts with soft delete
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    @DeleteDateColumn()
    deletedAt: Date;
}
```

The `deletedAt` column will be `null` for active records and contain a timestamp for "deleted" records.

### How Soft Deletes Work in TypeORM

When you use the `@DeleteDateColumn()` decorator, TypeORM automatically changes the behavior of several methods:

1. **find operations** : Only return non-deleted entities (where deletedAt is null)
2. **remove/delete operations** : Update the deletedAt column instead of deleting the row

Let's look at examples of how this works:

```typescript
// Finding users (only returns non-deleted users)
const users = await userRepository.find();

// Soft-deleting a user (sets deletedAt to current time)
await userRepository.softRemove(user);
// OR
await userRepository.softDelete(userId);

// Restoring a soft-deleted user
await userRepository.restore(userId);

// Force-finding all users including deleted ones
const allUsers = await userRepository.find({
    withDeleted: true
});

// Finding only deleted users
const deletedUsers = await userRepository.find({
    withDeleted: true,
    where: {
        deletedAt: Not(IsNull())
    }
});
```

### Difference Between softRemove and softDelete

TypeORM offers two ways to perform soft deletes:

```typescript
// softRemove works with entity instances and can handle relations
await userRepository.softRemove(user);

// softDelete works with criteria and is more efficient for bulk operations
await userRepository.softDelete({ id: 1 });
// OR
await userRepository.softDelete([1, 2, 3]);
```

The key differences are:

* `softRemove` works with entity instances and handles relations properly
* `softDelete` works with IDs or criteria and is more efficient for bulk operations

### Adding Soft Delete to Existing Repository Operations

To ensure consistent behavior, you might want to extend TypeORM's standard repository with soft delete capabilities:

```typescript
// user.repository.ts
import { EntityRepository, Repository } from "typeorm";
import { User } from "./User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async findActive(): Promise<User[]> {
        return this.find(); // Already excludes soft-deleted records
    }
  
    async findAll(): Promise<User[]> {
        return this.find({ withDeleted: true }); // Includes soft-deleted records
    }
  
    async findDeleted(): Promise<User[]> {
        return this.find({ 
            withDeleted: true,
            where: { deletedAt: Not(IsNull()) }
        });
    }
}
```

### Practical Example: User Management System

Let's implement a complete example of a user management system with soft deletes:

```typescript
// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from "typeorm";
import { Address } from "./address.embedded";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    @Column(() => Address, { prefix: "home" })
    homeAddress: Address;
  
    @DeleteDateColumn()
    deletedAt: Date;
  
    // Helper method to check if user is deleted
    isDeleted(): boolean {
        return this.deletedAt !== null;
    }
}

// user.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}
  
    async findAll(includeDeleted = false): Promise<User[]> {
        return this.userRepository.find({ withDeleted: includeDeleted });
    }
  
    async findOne(id: number, includeDeleted = false): Promise<User> {
        return this.userRepository.findOne({ 
            where: { id },
            withDeleted: includeDeleted 
        });
    }
  
    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }
  
    async update(id: number, userData: Partial<User>): Promise<User> {
        await this.userRepository.update(id, userData);
        return this.findOne(id);
    }
  
    async remove(id: number): Promise<void> {
        await this.userRepository.softDelete(id);
    }
  
    async restore(id: number): Promise<User> {
        await this.userRepository.restore(id);
        return this.findOne(id);
    }
  
    async permanentlyDelete(id: number): Promise<void> {
        // Use with caution - this bypasses soft delete
        await this.userRepository.delete(id);
    }
}
```

## Advanced Concepts and Best Practices

### Combining Embedded Entities and Soft Deletes

You can combine both features for powerful data modeling:

```typescript
// Product.ts
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from "typeorm";
import { Dimensions } from "./dimensions.embedded";
import { Pricing } from "./pricing.embedded";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
  
    @Column(() => Dimensions)
    dimensions: Dimensions;
  
    @Column(() => Pricing)
    pricing: Pricing;
  
    @DeleteDateColumn()
    deletedAt: Date;
}
```

### Inherited Embedded Entities

You can create hierarchies of embedded entities:

```typescript
// Location.ts - Base embedded entity
export class Location {
    @Column({ type: 'decimal', precision: 10, scale: 8 })
    latitude: number;
  
    @Column({ type: 'decimal', precision: 11, scale: 8 })
    longitude: number;
}

// DetailedAddress.ts - Extended embedded entity
import { Column } from "typeorm";
import { Location } from "./Location";

export class DetailedAddress extends Location {
    @Column({ length: 100 })
    street: string;
  
    @Column({ length: 50 })
    city: string;
  
    // ... other address fields
}
```

### Custom Delete Behavior

You can customize how soft deletes work by adding hooks:

```typescript
// User.ts with custom delete behavior
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, BeforeSoftRemove } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    @Column({ default: 0 })
    deleteCount: number;
  
    @DeleteDateColumn()
    deletedAt: Date;
  
    @BeforeSoftRemove()
    incrementDeleteCount() {
        this.deleteCount += 1;
    }
}
```

### Querying Considerations with Embedded Entities

When querying entities with embedded properties, you need to use a slightly different approach:

```typescript
// Finding users with specific embedded properties
const users = await userRepository.find({
    where: {
        // For embedded entities without prefix
        "address.city": "Boston",
      
        // OR for embedded entities with prefix
        "home_city": "Boston"
    }
});
```

### Performance Considerations for Soft Deletes

Soft deletes can impact performance in large tables:

1. **Indexes** : Add an index to the `deletedAt` column
2. **Partitioning** : Consider partitioning tables by delete status
3. **Archiving** : Move very old soft-deleted records to archive tables

```typescript
// Adding an index to the deletedAt column
@Entity()
export class User {
    // ...other fields
  
    @DeleteDateColumn()
    @Index()
    deletedAt: Date;
}
```

## Common Patterns and Anti-patterns

### Patterns: Best Practices

1. **Common Base Entity** : Create a base entity with common fields including soft delete:

```typescript
// BaseEntity.ts
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

export abstract class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
}

// Using the base entity
@Entity()
export class User extends BaseEntity {
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    // Other fields
}
```

2. **Value Objects as Embedded Entities** : Use embedded entities for true value objects (objects defined by their attributes, not identity):

```typescript
// Money.ts - A value object as embedded entity
import { Column } from "typeorm";

export class Money {
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;
  
    @Column({ length: 3 })
    currency: string;
  
    toString() {
        return `${this.amount} ${this.currency}`;
    }
}
```

### Anti-patterns: What to Avoid

1. **Too Many Embedded Entities** : Don't overuse embedding for complex relationships that should be separate entities
2. **Missing Indexes on Soft Delete Columns** : Always add indexes to columns used in WHERE clauses
3. **Not Handling Cascading Deletes** : Consider what should happen to related entities when the parent is soft-deleted

```typescript
// Don't do this - cascading soft deletes must be handled manually
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @DeleteDateColumn()
    deletedAt: Date;
  
    @OneToMany(() => Order, order => order.user)
    orders: Order[];
    // No automatic cascading of soft deletes to orders
}
```

## Conclusion

Embedded entities and soft deletes are powerful patterns in TypeORM that help you create more maintainable and robust applications:

* **Embedded Entities** give you code reuse and clean domain modeling without the overhead of separate tables
* **Soft Deletes** provide data safety and audit capabilities while maintaining referential integrity

When used together, they create a powerful foundation for enterprise-level applications with complex data models that need to maintain history and recoverability.

By understanding these patterns from first principles, you can better architect your Node.js applications to be more maintainable, efficient, and resilient to the real-world challenges of data management.
