# Domain Types for Custom Constraints in PostgreSQL

PostgreSQL's type system is powerful and flexible, allowing you to create your own custom data types to precisely model your application's domain. Let's explore domain types from first principles, understanding what they are, why they're useful, and how to implement them effectively.

> "The difference between a type and a domain is that a domain can have constraints that restrict its valid values to a subset of what the underlying type would allow."
> — PostgreSQL Documentation

## What Are Domain Types?

At their core, domain types are user-defined data types that add constraints to existing types. Think of them as wrappers around base types that enforce additional validation rules.

### First Principles Understanding

To understand domain types, we need to first understand what types are in a database system:

1. **Base Types** : These are the fundamental data types like INTEGER, VARCHAR, TIMESTAMP, etc.
2. **Type Constraints** : Rules that determine what values are valid for a type.
3. **Domain** : A specialized type with additional constraints beyond what the base type enforces.

A domain type inherits all properties of its base type but adds custom validation rules. This creates a semantic layer that captures business rules directly in your database schema.

## Why Use Domain Types?

Let's consider why you might want to use domain types:

1. **Centralized Validation** : Define validation rules once and reuse them across tables.
2. **Semantic Clarity** : Make your schema more self-documenting.
3. **Type Safety** : Prevent invalid data from being stored.
4. **Maintenance** : Update constraints in one place rather than changing multiple CHECK constraints.

### Example: Email Address

Consider how we might handle email addresses without domains:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) CHECK (email ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) CHECK (email ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);
```

Notice how we duplicated the email validation logic. With a domain type, we can avoid this duplication:

```sql
CREATE DOMAIN email_address AS VARCHAR(255)
    CHECK (VALUE ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email email_address
);

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    email email_address
);
```

This approach centralizes our validation logic and makes the schema more expressive.

## Creating Domain Types

The basic syntax for creating a domain is:

```sql
CREATE DOMAIN domain_name AS base_type
    [DEFAULT expression]
    [CONSTRAINT constraint_name CHECK (expression)]
    [NOT NULL];
```

Let's break down each component:

* **domain_name** : The name you're giving to your new type
* **base_type** : The PostgreSQL type being constrained
* **DEFAULT** : Optional default value
* **CONSTRAINT** : Named CHECK constraints
* **NOT NULL** : Whether null values are allowed

### Example: Positive Integer Domain

```sql
CREATE DOMAIN positive_integer AS INTEGER
    CONSTRAINT positive_check CHECK (VALUE > 0)
    NOT NULL;
```

This domain ensures that any column using it will only accept positive integers and never NULL values.

## Practical Examples

Let's explore a few more practical examples to solidify our understanding:

### Example 1: US Zip Code

```sql
CREATE DOMAIN us_zipcode AS VARCHAR(10)
    CONSTRAINT zipcode_format CHECK (
        VALUE ~ '^\d{5}(-\d{4})?$'
    );

-- Using the domain
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    street VARCHAR(100),
    city VARCHAR(50),
    state CHAR(2),
    zip us_zipcode
);
```

The domain ensures that zip codes follow the US format: either a 5-digit code or a 5+4 format with a hyphen.

### Example 2: Temperature in Celsius

```sql
CREATE DOMAIN celsius AS DECIMAL(5,2)
    CONSTRAINT valid_temperature CHECK (
        VALUE BETWEEN -273.15 AND 1000.00
    )
    DEFAULT 20.0;

-- Using the domain
CREATE TABLE weather_readings (
    id SERIAL PRIMARY KEY,
    location VARCHAR(100),
    reading_time TIMESTAMP,
    temperature celsius
);
```

This domain ensures that temperature values are physically possible (above absolute zero) and within a reasonable range, with a default room temperature.

### Example 3: ISBN Number

```sql
CREATE DOMAIN isbn AS VARCHAR(17)
    CONSTRAINT valid_isbn CHECK (
        (LENGTH(VALUE) = 13 AND VALUE ~ '^\d{3}-\d-\d{2}-\d{6}-\d$')
        OR 
        (LENGTH(VALUE) = 17 AND VALUE ~ '^\d{3}-\d-\d{3}-\d{5}-\d$')
    );

-- Using the domain
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(100),
    book_isbn isbn
);
```

This domain ensures ISBN numbers conform to either the ISBN-10 or ISBN-13 format.

## Multiple Constraints

You can add multiple constraints to a domain type:

```sql
CREATE DOMAIN username AS VARCHAR(50)
    CONSTRAINT username_length CHECK (LENGTH(VALUE) >= 3)
    CONSTRAINT username_chars CHECK (VALUE ~ '^[a-z0-9_]+$')
    CONSTRAINT username_start CHECK (VALUE ~ '^[a-z]')
    NOT NULL;
```

This username domain enforces several rules:

1. At least 3 characters long
2. Contains only lowercase letters, numbers, and underscores
3. Must start with a letter
4. Cannot be NULL

## Modifying Domain Types

You can alter domain types after creation:

```sql
-- Add a new constraint
ALTER DOMAIN username 
    ADD CONSTRAINT max_length CHECK (LENGTH(VALUE) <= 30);

-- Remove a constraint
ALTER DOMAIN username
    DROP CONSTRAINT username_chars;
  
-- Rename a domain
ALTER DOMAIN username
    RENAME TO user_login;
```

Be careful when modifying domains that are already in use. PostgreSQL will validate existing data against new constraints.

## Viewing Domain Information

You can query domain information from PostgreSQL's catalog:

```sql
-- List all domains in the current database
SELECT typname AS domain_name, 
       typbasetype::regtype AS base_type
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
JOIN pg_type bt ON t.typbasetype = bt.oid
WHERE t.typtype = 'd' 
AND n.nspname NOT IN ('pg_catalog', 'information_schema');

-- View constraints on a specific domain
SELECT con.conname AS constraint_name,
       pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_type t ON con.contypid = t.oid
WHERE t.typname = 'username';
```

## Dropping Domain Types

To remove a domain type:

```sql
DROP DOMAIN [IF EXISTS] domain_name [CASCADE | RESTRICT];
```

The CASCADE option will drop anything that depends on the domain, while RESTRICT (the default) will prevent dropping if any objects depend on the domain.

## Advanced Usage: Domain Types with Functions

You can create more complex validation by incorporating functions in your domain constraints:

```sql
-- Create a function for luhn validation (credit card validation algorithm)
CREATE OR REPLACE FUNCTION validate_credit_card(card_number TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    sum INTEGER := 0;
    digit INTEGER;
    odd BOOLEAN := true;
BEGIN
    FOR i IN REVERSE char_length(card_number)..1 LOOP
        digit := substring(card_number FROM i FOR 1)::INTEGER;
        IF NOT odd THEN
            digit := digit * 2;
            IF digit > 9 THEN
                digit := digit - 9;
            END IF;
        END IF;
        sum := sum + digit;
        odd := NOT odd;
    END LOOP;
    RETURN sum % 10 = 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a credit card domain with Luhn validation
CREATE DOMAIN credit_card_number AS VARCHAR(19)
    CONSTRAINT valid_format CHECK (VALUE ~ '^\d{13,19}$')
    CONSTRAINT valid_luhn CHECK (validate_credit_card(VALUE));
```

This example creates a domain that validates credit card numbers using the Luhn algorithm, ensuring they pass both format and checksum validation.

## Common Pitfalls and Considerations

### Performance Considerations

While domain types are powerful, they do introduce validation overhead. Complex validations, especially those using regular expressions, can impact performance during data insertion or updates.

### Nullability

By default, domains allow NULL values unless you explicitly add NOT NULL. This is a common oversight:

```sql
-- This still allows NULL values
CREATE DOMAIN positive_number AS NUMERIC
    CHECK (VALUE > 0);
  
-- Correct version that disallows NULL
CREATE DOMAIN positive_number AS NUMERIC
    CHECK (VALUE > 0)
    NOT NULL;
```

### Working with ORMs

Some Object-Relational Mappers (ORMs) might not fully support custom domain types. You may need to configure your ORM to handle these types appropriately.

### Type Casting

Values of domain types can be cast to and from their base types:

```sql
-- Cast a base type to a domain type
SELECT 'test@example.com'::email_address;

-- Cast a domain type back to base type
SELECT email::VARCHAR FROM users;
```

## Real-World Application: Customer Database

Let's see how domain types can improve a customer database schema:

```sql
-- Define domains for various customer data
CREATE DOMAIN customer_name AS VARCHAR(100)
    CHECK (VALUE ~ '^[A-Za-z]+(?: [A-Za-z]+)*$')
    NOT NULL;
  
CREATE DOMAIN us_phone AS VARCHAR(12)
    CHECK (VALUE ~ '^\d{3}-\d{3}-\d{4}$')
    NOT NULL;
  
CREATE DOMAIN email_address AS VARCHAR(255)
    CHECK (VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
    NOT NULL;
  
CREATE DOMAIN age_years AS INTEGER
    CHECK (VALUE BETWEEN 0 AND 120);
  
CREATE DOMAIN customer_status AS VARCHAR(10)
    CHECK (VALUE IN ('active', 'inactive', 'pending'))
    DEFAULT 'pending';

-- Create customer table with domain types
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    first_name customer_name,
    last_name customer_name,
    phone us_phone,
    email email_address,
    age age_years,
    status customer_status
);
```

This schema ensures consistent data validation across the entire customer database, making it more maintainable and self-documenting.

## Summary

PostgreSQL domain types provide a powerful way to create custom data types with specific constraints, enforcing business rules at the database level. They enhance schema design by:

1. Centralizing validation logic
2. Improving schema documentation
3. Ensuring consistent data integrity
4. Simplifying maintenance

By leveraging domain types, you create a more robust and semantically rich database schema that better models your application's domain.

The next time you find yourself writing the same CHECK constraint in multiple places, consider whether a domain type might be the right approach to centralize that validation logic.
