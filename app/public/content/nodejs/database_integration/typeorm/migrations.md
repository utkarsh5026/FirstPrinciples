# TypeORM Migrations: From First Principles

I'll explain TypeORM migrations from absolute first principles, exploring how database changes are tracked, generated, and executed in a Node.js environment.

> Think of migrations as version control for your database. Just as Git tracks changes to your code, migrations track changes to your database structure.

## What Are Database Migrations?

At the most fundamental level, database migrations are a way to evolve your database schema over time. Instead of making direct changes to your production database (which is error-prone and difficult to replicate), you create "migration files" that describe how to:

1. Make a change to the database structure (the "up" migration)
2. Reverse that change if needed (the "down" migration)

### The Core Problem Migrations Solve

Imagine you're working on a team with three developers:

* Developer A creates a database with a `users` table
* Developer B adds an `email` column to that table
* Developer C adds a `products` table

Without migrations, each developer would need to manually update their local database to match the team's changes. In production, database updates would be manual, risky processes.

> Migrations transform database schema changes from imperative manual tasks ("add this column") to declarative, version-controlled scripts that can be tested, reviewed, and automated.

## TypeORM Migration Fundamentals

TypeORM is an ORM (Object-Relational Mapper) for TypeScript/JavaScript that provides a migration system built on these principles.

### Entities vs. Database Schema

Before diving into migrations, let's understand the relationship between TypeORM entities and your database:

1. **Entities** : TypeScript classes that define your data model using decorators
2. **Database Schema** : The actual structure of your database (tables, columns, constraints)

Here's a simple entity example:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    age: number;
}
```

This entity describes a `User` with `id`, `name`, and `age` fields. TypeORM can automatically create a matching database table.

## The Migration Workflow

The TypeORM migration workflow consists of three main steps:

1. **Generate** a migration file based on entity changes
2. **Create/Modify** the migration file (manually or automatically)
3. **Execute** the migration to update the database schema

Let's explore each step in detail.

### 1. Migration Generation

TypeORM can generate migrations by comparing your current entity definitions to the actual database schema. This involves:

1. Reading your entity definitions
2. Examining your current database schema
3. Generating SQL commands to transform the database to match your entities

#### Setting Up for Migrations

First, you need proper configuration in your `ormconfig.js` or equivalent:

```javascript
module.exports = {
  type: "postgres", // or mysql, sqlite, etc.
  host: "localhost",
  port: 5432,
  username: "test",
  password: "test",
  database: "test",
  synchronize: false, // IMPORTANT: disable synchronize in production
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  cli: {
    migrationsDir: "src/migration"
  }
}
```

> Note: Setting `synchronize: false` is critical for production. When true, TypeORM automatically updates your database schema to match your entities on application startup, which can lead to data loss.

#### Generating a Migration

To generate a migration, you use the TypeORM CLI:

```bash
npx typeorm migration:generate -n CreateUserTable
```

This command:

1. Connects to your database using your TypeORM config
2. Reads your entity definitions
3. Compares them to the actual database schema
4. Creates a migration file with the required SQL

Let's see what a generated migration looks like:

```typescript
import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUserTable1617184655573 implements MigrationInterface {
    name = 'CreateUserTable1617184655573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL, 
                "name" character varying NOT NULL, 
                "age" integer NOT NULL, 
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }
}
```

This migration file contains:

1. A unique class name that includes a timestamp
2. An `up` method with SQL to create the new table
3. A `down` method with SQL to reverse the change (drop the table)

### How Migration Generation Works Internally

To understand migration generation deeply, let's explore what happens behind the scenes:

1. TypeORM creates a temporary database connection
2. It builds a "database model" by reading your entity metadata
3. It compares this model to the actual database schema
4. It calculates the differences (what needs to be added, removed, or altered)
5. It generates SQL statements to transform the database

> The comparison process is similar to how Git calculates diffs between files. TypeORM finds what's different between two states: the "entity state" and the "database state."

### 2. Manual Migration Creation

While generation is convenient, sometimes you'll want to write migrations manually. The command is:

```bash
npx typeorm migration:create -n AddEmailToUser
```

This creates an empty migration file:

```typescript
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEmailToUser1617184700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Write your UP migration code here
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Write your DOWN migration code here
    }
}
```

You would then fill in the SQL commands manually:

```typescript
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEmailToUser1617184700000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" ADD "email" character varying NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "email"
        `);
    }
}
```

### QueryRunner API

The `QueryRunner` object provides methods to execute database operations beyond raw SQL:

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    // Add a column
    await queryRunner.addColumn("user", new TableColumn({
        name: "email",
        type: "varchar",
        isNullable: false
    }));
  
    // Create an index
    await queryRunner.createIndex("user", new TableIndex({
        name: "IDX_USER_EMAIL",
        columnNames: ["email"]
    }));
}
```

This approach is database-agnostic - TypeORM translates these operations to the appropriate SQL for your database.

### 3. Migration Execution

Once you have migration files, you execute them to update your database:

```bash
npx typeorm migration:run
```

This command:

1. Connects to your database
2. Checks which migrations have already been applied (using a migrations table)
3. Runs any pending migrations in chronological order
4. Records each successful migration in the migrations table

Let's look at how this works internally:

#### The Migrations Table

TypeORM automatically creates a `migrations` table (or similar, depending on your configuration) to track which migrations have been run:

```
+---------------+----------------------+
| id            | timestamp            |
+---------------+----------------------+
| CreateUser... | 2023-04-01 12:00:00  |
| AddEmail...   | 2023-04-02 15:30:00  |
+---------------+----------------------+
```

When you run `migration:run`, TypeORM:

1. Checks this table to determine which migrations have already been applied
2. Runs only the new migrations that haven't been recorded yet
3. Adds entries to this table for newly applied migrations

This ensures migrations only run once, even if you execute the command multiple times.

#### Migration Transaction Management

By default, TypeORM wraps each migration in a transaction. This means:

1. If any part of the migration fails, all changes in that migration are rolled back
2. The database remains in a consistent state
3. The migration isn't recorded as "applied"

This transaction behavior can be controlled through the migration options.

## Practical Examples

Let's walk through common scenarios to see how migrations work in practice.

### Example 1: Adding a New Entity

Imagine you're adding a new `Product` entity to your application:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;
  
    @Column()
    description: string;
}
```

To generate a migration:

```bash
npx typeorm migration:generate -n CreateProductTable
```

The generated migration might look like:

```typescript
import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateProductTable1617184755573 implements MigrationInterface {
    name = 'CreateProductTable1617184755573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "product" (
                "id" SERIAL NOT NULL, 
                "name" character varying NOT NULL, 
                "price" numeric(10,2) NOT NULL, 
                "description" character varying NOT NULL, 
                CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
    }
}
```

### Example 2: Adding a Relation

Now let's add a relationship between `User` and `Product`:

```typescript
// In User entity
@OneToMany(() => Product, product => product.owner)
products: Product[];

// In Product entity
@ManyToOne(() => User, user => user.products)
owner: User;
```

Generating a migration:

```bash
npx typeorm migration:generate -n AddUserProductRelation
```

The generated migration might be:

```typescript
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserProductRelation1617184855573 implements MigrationInterface {
    name = 'AddUserProductRelation1617184855573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product" ADD "ownerId" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "product" ADD CONSTRAINT "FK_product_user" 
            FOREIGN KEY ("ownerId") REFERENCES "user"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product" DROP CONSTRAINT "FK_product_user"
        `);
        await queryRunner.query(`
            ALTER TABLE "product" DROP COLUMN "ownerId"
        `);
    }
}
```

### Example 3: Schema Changes Without Entity Changes

Sometimes you need database changes that don't directly reflect in your entities. For example, adding an index for performance:

```bash
npx typeorm migration:create -n AddUserNameIndex
```

Then manually fill in the migration:

```typescript
import {MigrationInterface, QueryRunner, TableIndex} from "typeorm";

export class AddUserNameIndex1617184955573 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createIndex("user", new TableIndex({
            name: "IDX_USER_NAME",
            columnNames: ["name"]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("user", "IDX_USER_NAME");
    }
}
```

## Advanced Migration Concepts

Now that we understand the basics, let's explore more advanced concepts.

### Running Migrations Programmatically

In some environments, using the CLI isn't practical. You can run migrations programmatically:

```typescript
import { createConnection } from "typeorm";

async function runMigrations() {
    const connection = await createConnection();
    try {
        // Run all pending migrations
        const migrations = await connection.runMigrations();
        console.log(`Ran ${migrations.length} migrations`);
    } finally {
        await connection.close();
    }
}

runMigrations().catch(error => console.error("Migration failed", error));
```

### Reverting Migrations

To revert the most recently applied migration:

```bash
npx typeorm migration:revert
```

This executes the `down` method of the last migration, removing its changes from the database.

### Migration Strategies for Production

For production environments, consider these best practices:

1. **Always review generated migrations** before applying them, especially for complex schema changes
2. **Test migrations thoroughly** in development/staging environments
3. **Back up your database** before running migrations in production
4. **Plan for downtime** or use techniques like database views to maintain backward compatibility

### Custom Migration Tables

You can configure where TypeORM stores migration information:

```javascript
// ormconfig.js
module.exports = {
  // ... other configuration
  migrationsTableName: "custom_migration_table",
}
```

This is useful when:

* You have multiple applications using the same database
* You need to comply with naming conventions
* You're integrating with existing migration systems

## Common Migration Challenges

### 1. Data Migrations

Entity changes often require data transformations. For example, if you split a `fullName` column into `firstName` and `lastName`:

```typescript
import {MigrationInterface, QueryRunner} from "typeorm";

export class SplitUserName1617185055573 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add the new columns
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD "firstName" character varying,
            ADD "lastName" character varying
        `);
      
        // 2. Update data
        await queryRunner.query(`
            UPDATE "user"
            SET "firstName" = SUBSTRING("fullName" FROM 1 FOR POSITION(' ' IN "fullName") - 1),
                "lastName" = SUBSTRING("fullName" FROM POSITION(' ' IN "fullName") + 1)
            WHERE POSITION(' ' IN "fullName") > 0
        `);
      
        // 3. Make new columns NOT NULL
        await queryRunner.query(`
            ALTER TABLE "user" 
            ALTER COLUMN "firstName" SET NOT NULL,
            ALTER COLUMN "lastName" SET NOT NULL
        `);
      
        // 4. Drop the old column
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "fullName"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse the process...
    }
}
```

### 2. Large Table Migrations

For large tables, operations like adding columns can lock the table for the duration. Consider approaches like:

1. Breaking changes into smaller migrations
2. Using techniques specific to your database (like PostgreSQL's `ADD COLUMN IF NOT EXISTS`)
3. Scheduling migrations during low-traffic periods

### 3. Handling Migration Conflicts

When multiple developers create migrations in parallel, conflicts can arise. Best practices include:

1. Pull and merge changes frequently
2. Run migrations after each merge to keep your local database updated
3. Create a new migration if needed after resolving merge conflicts
4. Consider using prefixes or namespaces in migration names

## Integration with Node.js Applications

Let's see how migrations integrate with different Node.js application patterns.

### Using with Express

```typescript
// src/index.ts
import "reflect-metadata";
import express from "express";
import { createConnection } from "typeorm";

async function bootstrap() {
    const connection = await createConnection();
  
    // Run migrations on startup (optional)
    await connection.runMigrations();
  
    const app = express();
    // Configure routes
  
    app.listen(3000, () => {
        console.log("Server running on port 3000");
    });
}

bootstrap().catch(error => console.error("Application failed to start", error));
```

### Using with NestJS

In NestJS, you can integrate TypeORM migrations in your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'test',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      migrationsRun: true, // Automatically run migrations on startup
    }),
  ],
})
export class AppModule {}
```

## Debugging and Troubleshooting Migrations

### Common Issues and Solutions

1. **Migration Generation Returns Empty SQL**
   * Check if entity changes are detected
   * Verify your database connection and entities configuration
   * Try dropping and recreating the database to reset the state
2. **Migration Conflicts**
   * If two developers create migrations with the same timestamp, conflicts can occur
   * Solution: Rename one of the migrations with a different timestamp
3. **Failed Migrations**
   * If a migration fails, you may need to fix the database manually
   * Check for syntax errors in generated SQL
   * Verify that the database user has sufficient permissions

### Debugging Techniques

You can enable logging to see what TypeORM is doing:

```javascript
// ormconfig.js
module.exports = {
  // ... other configuration
  logging: true,
  logger: "advanced-console"
}
```

For deeper inspection, you can log the generated SQL:

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    const sql = `ALTER TABLE "user" ADD "email" character varying NOT NULL`;
    console.log("About to execute:", sql);
    await queryRunner.query(sql);
}
```

## Best Practices for TypeORM Migrations

1. **Never use `synchronize: true` in production**
   * This can lead to data loss
   * Always use migrations for schema changes
2. **Make migrations idempotent when possible**
   * Use `IF NOT EXISTS` clauses
   * Check if objects exist before creating or modifying them
3. **Keep migrations small and focused**
   * One logical change per migration
   * This makes debugging and reverting easier
4. **Version control migrations with your code**
   * Migrations should be committed to your repository
   * This ensures all developers have the same migrations
5. **Use meaningful migration names**
   * Names like `CreateUserTable` or `AddEmailToUser` make the purpose clear
   * Avoid generic names like `Update1` or `Changes`
6. **Always implement the `down` method**
   * Even if you don't plan to revert, having a proper `down` method is good practice
   * It documents how to reverse the change
7. **Automate migration runs in your CI/CD pipeline**
   * Run migrations automatically during deployment
   * Include tests to verify migrations work as expected

## Conclusion

TypeORM migrations provide a powerful way to manage database schema changes in Node.js applications. By understanding the principles behind migration generation and execution, you can confidently evolve your database schema over time while maintaining data integrity.

> Database migrations transform a risky, manual process into a version-controlled, automated workflow that ensures consistency across environments and team members.

From creating your first migration to handling complex schema changes, the concepts we've explored demonstrate how TypeORM's migration system follows the core principles of modern database management: safety, repeatability, and version control.

Would you like me to dive deeper into any particular aspect of TypeORM migrations?
