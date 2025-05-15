# Primary Keys and Unique Constraints in PostgreSQL: From First Principles

I'll explain both primary keys and unique constraints in PostgreSQL by starting with the most fundamental concepts and building up from there. Let's dive in!

## The Foundation: Data Integrity

> At the heart of any database system is the need to maintain data integrity - ensuring that data is accurate, consistent, and reliable throughout its lifecycle.

Database systems like PostgreSQL implement various constraints to enforce data integrity. Two of the most important constraints are primary keys and unique constraints. To understand these concepts fully, we first need to understand why they exist.

### Why Do We Need Constraints?

Imagine you're building a library management system. Without any constraints:

* You might accidentally add the same book twice
* You might have two patrons with the same ID
* Books might be linked to patrons who don't exist

These issues cause data inconsistency, making the database unreliable. Constraints help prevent these problems.

## Primary Keys: The Fundamental Identifier

> A primary key is a column or group of columns that uniquely identifies each record in a table. It is the database's way of saying, "This is how I tell one record from another."

### Primary Key Core Characteristics

1. **Uniqueness** : No two rows can have the same primary key value
2. **Non-nullability** : Primary key columns cannot contain NULL values
3. **Immutability** : Once assigned, primary key values shouldn't change (a best practice)
4. **Minimality** : Ideally contains just enough columns to ensure uniqueness

### Example: Creating a Table with a Primary Key

Let's create a table for our library's books:

```sql
CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    publish_date DATE,
    isbn VARCHAR(13)
);
```

In this example:

* `book_id` is our primary key
* `SERIAL` creates an auto-incrementing integer
* `PRIMARY KEY` constraint ensures uniqueness and non-nullability

The primary key has several important effects:

* PostgreSQL automatically creates a unique index on the primary key columns
* It becomes the default reference for foreign keys in other tables
* It provides a guaranteed way to identify each record

### Testing Our Primary Key

Let's see what happens when we try to violate the primary key constraint:

```sql
-- This will work fine
INSERT INTO books (title, author) 
VALUES ('Database Design', 'Jane Smith');

-- This will fail with a duplicate key error
INSERT INTO books (book_id, title, author) 
VALUES (1, 'SQL Fundamentals', 'John Doe');
```

The second insert would fail with an error like:

```
ERROR: duplicate key value violates unique constraint "books_pkey"
```

This protects our data integrity!

### Composite Primary Keys

Sometimes a single column isn't enough to uniquely identify a row. In these cases, we can use multiple columns together as a primary key:

```sql
CREATE TABLE book_editions (
    book_id INT,
    edition_number INT,
    publisher VARCHAR(100),
    publication_year INT,
    PRIMARY KEY (book_id, edition_number)
);
```

Here, the combination of `book_id` and `edition_number` uniquely identifies each row.

## Unique Constraints: Enforcing Uniqueness

> A unique constraint ensures that values in a specified column or group of columns are unique across the table, though they may contain NULL values (unlike primary keys).

### Unique Constraint Characteristics

1. **Uniqueness** : No two rows can have the same values in the constrained column(s)
2. **NULL allowance** : Unlike primary keys, unique constraints typically allow NULL values
3. **Multiple per table** : A table can have many unique constraints (but only one primary key)

### Creating a Unique Constraint

Let's add a unique constraint to our books table to ensure no two books have the same ISBN:

```sql
-- Add a unique constraint to an existing table
ALTER TABLE books
ADD CONSTRAINT unique_isbn UNIQUE (isbn);

-- Or when creating a new table
CREATE TABLE journals (
    journal_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    issn VARCHAR(8) UNIQUE,
    publisher VARCHAR(100)
);
```

Here we've created a named constraint `unique_isbn` on the `isbn` column. The second example shows adding a unique constraint directly during table creation.

### Testing Our Unique Constraint

Let's see what happens when we try to violate the unique constraint:

```sql
-- First insert works fine
INSERT INTO books (title, author, isbn) 
VALUES ('Database Design', 'Jane Smith', '9781234567890');

-- This will fail due to duplicate ISBN
INSERT INTO books (title, author, isbn) 
VALUES ('Database Design 2nd Edition', 'Jane Smith', '9781234567890');
```

The second insert would fail with an error like:

```
ERROR: duplicate key value violates unique constraint "unique_isbn"
```

### Composite Unique Constraints

Like primary keys, unique constraints can span multiple columns:

```sql
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    department VARCHAR(50),
    CONSTRAINT unique_name_dept UNIQUE (first_name, last_name, department)
);
```

This ensures no two employees in the same department have the same first and last name.

## Primary Keys vs. Unique Constraints: Key Differences

Let's clarify the differences between these two constraints:

| Feature               | Primary Key              | Unique Constraint                  |
| --------------------- | ------------------------ | ---------------------------------- |
| NULL values           | Not allowed              | Allowed (typically)                |
| Number per table      | One only                 | Multiple allowed                   |
| Index creation        | Always creates an index  | Always creates an index            |
| Foreign key reference | Default reference target | Can be referenced, but not default |
| Purpose               | Record identification    | Data integrity/business rules      |

## Implementation Details in PostgreSQL

### How PostgreSQL Implements These Constraints

Both primary keys and unique constraints in PostgreSQL are implemented using unique indexes. When you create either constraint, PostgreSQL:

1. Creates a unique B-tree index on the specified column(s)
2. Checks this index during inserts and updates
3. Rejects operations that would violate the constraint

Let's see this in action:

```sql
-- Create a table with a primary key
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE
);

-- Look at the indexes PostgreSQL created
\d customers
```

The output would show two indexes:

* One for the primary key (`customers_pkey`)
* One for the unique constraint on email (`customers_email_key`)

### Performance Implications

Both constraints create indexes which:

* **Speed up queries** that search by these columns
* **Slow down inserts and updates** slightly due to index maintenance
* **Consume additional storage** for the index structures

For large tables, these considerations become important.

## Practical Examples

### Example 1: User Management System

Let's build a simple user management system:

```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Let's see what happens when we try to register two users with the same username
INSERT INTO users (username, email, password_hash)
VALUES ('alice', 'alice@example.com', 'hash1');

-- This will fail due to unique username constraint
INSERT INTO users (username, email, password_hash)
VALUES ('alice', 'alice2@example.com', 'hash2');
```

The second insert would fail, preventing duplicate usernames in our system.

### Example 2: Order Management with Composite Keys

For an order management system:

```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10, 2)
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    CONSTRAINT unique_order_product UNIQUE (order_id, product_id)
);
```

Here, we use a composite primary key in `order_items` to ensure each product appears only once per order. The unique constraint might seem redundant here (and it is), but I included it to show the syntax.

## Best Practices

### When to Use Primary Keys vs. Unique Constraints

> Use primary keys for the main identifier of your table. Use unique constraints for additional business rules that require uniqueness.

1. **Primary Keys** :

* Use for the main identifier of each entity
* Choose naturally unique values when possible, or use surrogate keys (like SERIAL)
* Keep them simple and stable

1. **Unique Constraints** :

* Use for enforcing business rules (e.g., unique email addresses)
* Apply to naturally unique attributes
* Consider composite unique constraints for complex rules

### Naming Conventions

Following a consistent naming convention helps maintain your database:

```sql
-- For primary keys (if explicitly naming them)
ALTER TABLE employees 
ADD CONSTRAINT pk_employees PRIMARY KEY (employee_id);

-- For unique constraints
ALTER TABLE employees 
ADD CONSTRAINT uq_employees_email UNIQUE (email);

-- For composite unique constraints
ALTER TABLE order_items 
ADD CONSTRAINT uq_order_items_order_product UNIQUE (order_id, product_id);
```

Common prefixes:

* `pk_` for primary keys
* `uq_` for unique constraints

## Advanced Concepts

### Partial Unique Constraints in PostgreSQL

PostgreSQL allows for partial unique constraints using a WHERE clause:

```sql
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT uq_active_product_code UNIQUE (product_code) 
    WHERE (is_active = TRUE)
);
```

This constraint only ensures uniqueness among active products, allowing inactive products to reuse codes.

### Deferrable Constraints

PostgreSQL allows constraints to be deferred until the end of a transaction:

```sql
CREATE TABLE inventory (
    product_id INT,
    warehouse_id INT,
    quantity INT NOT NULL,
    PRIMARY KEY (product_id, warehouse_id) DEFERRABLE INITIALLY IMMEDIATE
);

-- Later, in a transaction where we need to swap values
BEGIN;
SET CONSTRAINTS ALL DEFERRED;

-- These would normally conflict, but will be checked only at COMMIT
UPDATE inventory SET product_id = 999 WHERE product_id = 100 AND warehouse_id = 1;
UPDATE inventory SET product_id = 100 WHERE product_id = 200 AND warehouse_id = 1;
UPDATE inventory SET product_id = 200 WHERE product_id = 999 AND warehouse_id = 1;

COMMIT;
```

This is useful for complex updates where intermediate states might violate constraints.

## Troubleshooting Common Issues

### Adding a Primary Key to an Existing Table with Duplicates

If you try to add a primary key to a column with duplicate values, it will fail:

```sql
-- This will fail if there are duplicate values in existing_column
ALTER TABLE my_table
ADD PRIMARY KEY (existing_column);
```

Solution:

```sql
-- First, identify duplicates
SELECT existing_column, COUNT(*)
FROM my_table
GROUP BY existing_column
HAVING COUNT(*) > 1;

-- Then, resolve duplicates (example approach)
UPDATE my_table
SET existing_column = existing_column || '_' || id
WHERE existing_column IN (
    SELECT existing_column
    FROM my_table
    GROUP BY existing_column
    HAVING COUNT(*) > 1
);

-- Now add the primary key
ALTER TABLE my_table
ADD PRIMARY KEY (existing_column);
```

### Adding a Unique Constraint When NULL Values Exist

Remember that multiple NULL values don't violate unique constraints in PostgreSQL:

```sql
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    business_phone VARCHAR(15) UNIQUE,
    home_phone VARCHAR(15) UNIQUE
);

-- These won't conflict because NULL values are treated specially
INSERT INTO contacts (name, business_phone) VALUES ('Alice', NULL);
INSERT INTO contacts (name, business_phone) VALUES ('Bob', NULL);
```

## Conclusion

Primary keys and unique constraints are fundamental to maintaining data integrity in PostgreSQL databases. While they share the concept of uniqueness, they serve different purposes:

> Primary keys establish the identity of each record, while unique constraints enforce business rules beyond the core identity.

By understanding and properly implementing these constraints, you'll build more robust and reliable database systems. They serve as the foundation for relationships between tables and ensure that your data remains consistent and accurate.

Remember these key principles:

* Every table should have a primary key
* Use unique constraints for additional uniqueness requirements
* Consider the performance implications for large tables
* Choose simple, stable values for primary keys

Would you like me to explore any specific aspect of primary keys or unique constraints in more detail?
