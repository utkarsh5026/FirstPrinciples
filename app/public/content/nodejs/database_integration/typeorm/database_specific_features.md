# Database-Specific Features in TypeORM for Node.js

I'll explain how to leverage database-specific features in TypeORM from first principles. TypeORM is an Object-Relational Mapping (ORM) library that bridges the gap between Node.js applications and databases, but it also allows you to tap into the unique capabilities of specific database systems.

## Understanding the Foundation

> At its core, TypeORM attempts to abstract away database differences, allowing developers to write code that works across different database engines. However, sometimes we need to use features specific to a particular database to optimize performance or leverage unique capabilities.

### The ORM Concept

An ORM maps your application objects to database tables and provides an API to interact with your database without writing raw SQL. This creates a layer of abstraction:

```
Application Objects (JavaScript/TypeScript) <--> ORM <--> Database (MySQL, PostgreSQL, etc.)
```

TypeORM supports multiple database systems including:

* PostgreSQL
* MySQL/MariaDB
* SQLite
* Microsoft SQL Server
* Oracle
* MongoDB

Each of these database systems has unique features not present in others. Let's explore how to access these features in TypeORM.

## 1. Database-Specific Connection Options

When establishing a connection to your database, TypeORM allows you to specify database-specific options:

```typescript
import { createConnection } from "typeorm";

// PostgreSQL-specific connection
await createConnection({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "user",
  password: "password",
  database: "mydb",
  // PostgreSQL-specific options
  ssl: true,
  schema: "public",
  replication: {
    master: {
      host: "master.example.com",
      port: 5432,
      username: "user",
      password: "password",
      database: "db"
    },
    slaves: [{
      host: "slave1.example.com",
      port: 5432,
      username: "user",
      password: "password",
      database: "db"
    }]
  }
});
```

In this example, `schema` and `replication` configurations are specific to PostgreSQL. Each database type will have its own set of available options.

## 2. Raw Queries for Database-Specific SQL

When you need to use database-specific SQL features, TypeORM allows you to execute raw queries:

```typescript
// Using the query runner
const queryRunner = connection.createQueryRunner();
const result = await queryRunner.query(`
  /* PostgreSQL-specific query using JSONB */
  SELECT * FROM users 
  WHERE user_data @> '{"preferences": {"theme": "dark"}}';
`);
```

This gives you the freedom to write any SQL that your specific database supports.

## 3. Database-Specific Column Types

TypeORM supports database-specific column types:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class Product {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column("varchar", { length: 200 })
  name: string;
  
  // PostgreSQL-specific JSON type
  @Column("jsonb")
  metadata: any;
  
  // MySQL-specific ENUM type
  @Column({
    type: "enum",
    enum: ["available", "out_of_stock", "discontinued"],
    default: "available"
  })
  status: string;
}
```

In this example:

* The `jsonb` type is PostgreSQL-specific and allows efficient JSON storage and querying
* The `enum` as implemented is MySQL-specific (though other databases support similar features)

## 4. Database-Specific Query Builders

TypeORM's query builder can incorporate database-specific features:

```typescript
// PostgreSQL-specific full-text search
const products = await connection
  .getRepository(Product)
  .createQueryBuilder("product")
  .where("to_tsvector(product.description) @@ to_tsquery(:query)", { 
    query: 'organic & food' 
  })
  .getMany();
```

This example uses PostgreSQL's text search capabilities, which wouldn't work on other database systems.

## 5. Database-Specific Indices

You can create database-specific indices:

```typescript
import { Entity, Index, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
// PostgreSQL-specific GIN index for JSONB
@Index("IDX_PRODUCT_METADATA", { synchronize: false })
class Product {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column("varchar")
  name: string;
  
  @Column("jsonb")
  metadata: any;
}
```

Then in a migration, you can create the database-specific index:

```typescript
await queryRunner.query(`
  CREATE INDEX "IDX_PRODUCT_METADATA" ON "product" USING GIN ("metadata");
`);
```

The GIN (Generalized Inverted Index) is specific to PostgreSQL and is optimized for JSONB columns.

## 6. Database-Specific Functions via Custom Repositories

You can leverage database-specific functions through custom repositories:

```typescript
import { EntityRepository, Repository } from "typeorm";
import { Product } from "./entity/Product";

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
  // PostgreSQL-specific array operations
  async findByTags(tags: string[]): Promise<Product[]> {
    return this.createQueryBuilder("product")
      .where("product.tags && :tags", { tags })
      .getMany();
  }
  
  // MySQL-specific full-text search
  async fullTextSearch(searchTerm: string): Promise<Product[]> {
    if (this.manager.connection.options.type === "mysql") {
      return this.createQueryBuilder("product")
        .where("MATCH(product.name, product.description) AGAINST(:search IN BOOLEAN MODE)", {
          search: searchTerm
        })
        .getMany();
    }
  
    // Fallback for other databases
    return this.createQueryBuilder("product")
      .where("product.name LIKE :search OR product.description LIKE :search", {
        search: `%${searchTerm}%`
      })
      .getMany();
  }
}
```

In this example:

* `findByTags` uses PostgreSQL's array operators (`&&` represents array overlap)
* `fullTextSearch` uses MySQL's full-text search capabilities

## 7. Database-Specific Migrations

Migrations can include database-specific SQL:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductSearchIndex1625012345678 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check database type
    if (queryRunner.connection.options.type === "postgres") {
      // PostgreSQL-specific - Create a function for search
      await queryRunner.query(`
        CREATE FUNCTION product_search_trigger() RETURNS trigger AS $$
        BEGIN
          NEW.search_vector = to_tsvector('english', NEW.name || ' ' || NEW.description);
          RETURN NEW;
        END
        $$ LANGUAGE plpgsql;
      `);
    
      // Create trigger
      await queryRunner.query(`
        CREATE TRIGGER product_search_update
        BEFORE INSERT OR UPDATE ON product
        FOR EACH ROW EXECUTE PROCEDURE product_search_trigger();
      `);
    } else if (queryRunner.connection.options.type === "mysql") {
      // MySQL-specific - Create fulltext index
      await queryRunner.query(`
        ALTER TABLE product 
        ADD FULLTEXT INDEX IDX_PRODUCT_SEARCH (name, description);
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reversing the changes based on database type
    if (queryRunner.connection.options.type === "postgres") {
      await queryRunner.query(`DROP TRIGGER product_search_update ON product;`);
      await queryRunner.query(`DROP FUNCTION product_search_trigger();`);
    } else if (queryRunner.connection.options.type === "mysql") {
      await queryRunner.query(`ALTER TABLE product DROP INDEX IDX_PRODUCT_SEARCH;`);
    }
  }
}
```

This migration creates a search feature in a database-specific way - a trigger and function in PostgreSQL or a fulltext index in MySQL.

## 8. Database-Specific Transaction Isolation Levels

Different databases support different transaction isolation levels. TypeORM allows you to specify these:

```typescript
// Start transaction with database-specific isolation level
await connection.transaction({
  isolationLevel: "SERIALIZABLE" // PostgreSQL, MySQL support this
}, async transactionalEntityManager => {
  // Execute operations within this transaction
  await transactionalEntityManager.save(user);
  await transactionalEntityManager.save(photo);
});
```

The available isolation levels depend on the database being used. Common levels include:

* READ UNCOMMITTED
* READ COMMITTED
* REPEATABLE READ
* SERIALIZABLE

## 9. Database-Specific Locking Strategies

TypeORM supports database-specific row locking mechanisms:

```typescript
// PostgreSQL and MySQL support pessimistic locking
const user = await connection
  .getRepository(User)
  .createQueryBuilder("user")
  .setLock("pessimistic_write") // Database-specific locking
  .where("user.id = :id", { id: 1 })
  .getOne();

// In PostgreSQL, you can also use FOR SHARE specifically
const product = await connection
  .getRepository(Product)
  .createQueryBuilder("product")
  .setLock("for_share")
  .where("product.id = :id", { id: 1 })
  .getOne();
```

The available lock types vary by database:

* `pessimistic_read` translates to `FOR SHARE` in PostgreSQL/MySQL
* `pessimistic_write` translates to `FOR UPDATE` in PostgreSQL/MySQL
* `for_no_key_update` is PostgreSQL-specific
* `for_key_share` is PostgreSQL-specific

## 10. Using PostgreSQL-Specific JSON Operations

PostgreSQL has powerful JSON/JSONB operations that TypeORM can leverage:

```typescript
import { getRepository } from "typeorm";
import { Product } from "./entity/Product";

async function findProductsByFeature() {
  const productRepo = getRepository(Product);
  
  // Using PostgreSQL JSONB containment operator @>
  return await productRepo
    .createQueryBuilder("product")
    .where("product.features @> :features", { 
      features: JSON.stringify({ waterproof: true }) 
    })
    .getMany();
}

async function findProductsByNestedProperty() {
  const productRepo = getRepository(Product);
  
  // Using PostgreSQL JSON path extraction operator ->
  return await productRepo
    .createQueryBuilder("product")
    .where("product.metadata -> 'dimensions' ->> 'height' = :height", { 
      height: '10' 
    })
    .getMany();
}
```

This example demonstrates PostgreSQL-specific JSON path navigation and query operators:

* `@>` is the containment operator
* `->` extracts a JSON object
* `->>` extracts a JSON value as text

## 11. Database-Specific Functions

You can leverage database-specific functions in your queries:

```typescript
// MySQL-specific string functions
const users = await connection
  .getRepository(User)
  .createQueryBuilder("user")
  .where("CONCAT(user.firstName, ' ', user.lastName) = :fullName", {
    fullName: "John Doe"
  })
  .getMany();

// PostgreSQL-specific array functions
const products = await connection
  .getRepository(Product)
  .createQueryBuilder("product")
  .where("array_length(product.categories, 1) > :count", { count: 2 })
  .getMany();
```

These queries use functions that are specific to MySQL and PostgreSQL respectively.

## 12. Database-Specific Subscribers and Listeners

You can implement custom behavior for database-specific events:

```typescript
import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { Product } from "./entity/Product";

@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {
  listenTo() {
    return Product;
  }

  async beforeInsert(event: InsertEvent<Product>) {
    // PostgreSQL-specific tsvector generation for full-text search
    if (event.connection.options.type === "postgres") {
      await event.manager.query(`
        SELECT setweight(to_tsvector('english', $1), 'A') || 
               setweight(to_tsvector('english', $2), 'B') as search_vector
      `, [event.entity.name, event.entity.description])
      .then(result => {
        event.entity.searchVector = result[0].search_vector;
      });
    }
  }
}
```

This subscriber generates a weighted tsvector in PostgreSQL before inserting a product, enabling better full-text search.

## Practical Application: Building a Database-Specific Query Builder

Let's create a more complex example showing how to build a versatile search function that uses database-specific optimizations:

```typescript
import { Connection, SelectQueryBuilder } from "typeorm";
import { Product } from "./entity/Product";

class ProductSearchService {
  constructor(private connection: Connection) {}
  
  /**
   * Search for products using database-specific optimizations
   */
  async search(term: string, filters: any = {}): Promise<Product[]> {
    const queryBuilder = this.connection
      .getRepository(Product)
      .createQueryBuilder("product");
  
    // Apply database-specific search optimization
    this.applySearchTerm(queryBuilder, term);
  
    // Apply common filters
    if (filters.category) {
      queryBuilder.andWhere("product.category = :category", { 
        category: filters.category 
      });
    }
  
    if (filters.minPrice) {
      queryBuilder.andWhere("product.price >= :minPrice", { 
        minPrice: filters.minPrice 
      });
    }
  
    return queryBuilder.getMany();
  }
  
  /**
   * Apply database-specific search optimization
   */
  private applySearchTerm(
    queryBuilder: SelectQueryBuilder<Product>, 
    term: string
  ): void {
    const dbType = this.connection.options.type;
  
    if (!term) return;
  
    switch (dbType) {
      case "postgres":
        // PostgreSQL - Use full text search with tsvector
        queryBuilder.where(
          "product.search_vector @@ plainto_tsquery(:term)",
          { term }
        );
        // Order by rank
        queryBuilder.orderBy(
          "ts_rank(product.search_vector, plainto_tsquery(:term))",
          "DESC"
        );
        break;
      
      case "mysql":
        // MySQL - Use FULLTEXT search
        queryBuilder.where(
          "MATCH(product.name, product.description) AGAINST(:term IN BOOLEAN MODE)",
          { term: `${term}*` }
        );
        break;
      
      case "sqlite":
        // SQLite - Use FTS5 virtual table if available, otherwise fallback
        // Note: This assumes you've set up an FTS5 virtual table
        try {
          queryBuilder.where(
            `product.id IN (SELECT rowid FROM product_fts WHERE product_fts MATCH :term)`,
            { term: `${term}*` }
          );
        } catch (e) {
          // Fallback to LIKE for SQLite if FTS is not set up
          queryBuilder.where(
            "(product.name LIKE :term OR product.description LIKE :term)",
            { term: `%${term}%` }
          );
        }
        break;
      
      default:
        // Generic fallback for other databases
        queryBuilder.where(
          "(product.name LIKE :term OR product.description LIKE :term)",
          { term: `%${term}%` }
        );
    }
  }
}
```

This example creates a search service that automatically uses the optimal search strategy based on the connected database type:

* For PostgreSQL, it uses tsvector/tsquery full-text search with ranking
* For MySQL, it uses native FULLTEXT search with boolean mode
* For SQLite, it attempts to use FTS5 (full-text search) if available, with a fallback
* For other databases, it uses a simple LIKE-based search

## Tips for Working with Database-Specific Features

1. **Check Database Type** : Always verify the database type before using specific features:

```typescript
if (connection.options.type === "postgres") {
  // PostgreSQL-specific code
} else if (connection.options.type === "mysql") {
  // MySQL-specific code
}
```

2. **Create Abstractions** : Build abstractions to hide database-specific details:

```typescript
// Abstract database-specific search into a method
async function searchProducts(term: string): Promise<Product[]> {
  const dbType = connection.options.type;
  const queryBuilder = connection.getRepository(Product).createQueryBuilder("product");
  
  if (dbType === "postgres") {
    return queryBuilder
      .where("product.search_vector @@ plainto_tsquery(:term)", { term })
      .getMany();
  } else {
    return queryBuilder
      .where("product.name LIKE :term OR product.description LIKE :term", { 
        term: `%${term}%` 
      })
      .getMany();
  }
}
```

3. **Document Database Requirements** : Make sure to document which databases your code supports:

```typescript
/**
 * Performs optimized inventory analysis
 * @requires PostgreSQL 10+ or MySQL 8+
 */
async function analyzeInventory() {
  // Database-specific implementation
}
```

## Common Database-Specific Features Worth Using

### PostgreSQL

1. **JSONB Storage and Querying** :

```typescript
@Column("jsonb")
metadata: any;

// Query with containment
const products = await repo
  .createQueryBuilder("product")
  .where("product.metadata @> :meta", { meta: { color: "red" } })
  .getMany();
```

2. **Array Types** :

```typescript
@Column("text", { array: true })
tags: string[];

// Query with array operators
const products = await repo
  .createQueryBuilder("product")
  .where("product.tags && ARRAY[:...tags]", { tags: ["organic", "vegan"] })
  .getMany();
```

3. **Full-Text Search** :

```typescript
@Column()
name: string;

@Column()
description: string;

@Column("tsvector", { select: false })
searchVector: any;

// In a migration or subscriber:
// CREATE INDEX product_search_idx ON product USING GIN (search_vector);
```

### MySQL

1. **Full-Text Search** :

```typescript
// In your entity definition
@Entity()
@Index("IDX_FULLTEXT", ["name", "description"], { fulltext: true })
export class Product {
  // ...fields
}

// In your query
const products = await repo
  .createQueryBuilder("product")
  .where("MATCH(product.name, product.description) AGAINST(:search IN BOOLEAN MODE)", {
    search: "organic +food -meat"
  })
  .getMany();
```

2. **On Duplicate Key Update** :

```typescript
// MySQL-specific upsert
await connection.query(
  `INSERT INTO product (id, name, price) VALUES (?, ?, ?)
   ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price)`,
  [1, "Updated Product", 29.99]
);
```

### SQLite

1. **JSON Functions** (in newer versions):

```typescript
// SQLite JSON extraction
const products = await repo
  .createQueryBuilder("product")
  .where("json_extract(product.metadata, '$.color') = :color", { color: "blue" })
  .getMany();
```

## Conclusion

> Understanding database-specific features in TypeORM allows you to leverage the full power of your chosen database while still maintaining the convenience of an ORM. The key is knowing when to use the abstraction layer and when to tap into native database capabilities.

By using database-specific features wisely, you can build applications that are both portable across different database systems and optimized for the specific database you're using in production. This approach gives you the best of both worlds: the development speed of an ORM with the performance and capabilities of your specific database system.

Remember to always add appropriate fallbacks or alternatives when using database-specific features to ensure your application can work with different database systems if needed in the future.
