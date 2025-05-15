# Custom Data Types in PostgreSQL: From First Principles

PostgreSQL is renowned for its extensibility, and one of the most powerful features it offers is the ability to create custom data types. Let's explore this concept from fundamental principles.

> When we build software systems, we often need to represent domain-specific information that doesn't neatly fit into standard data types. Custom data types allow us to model our unique data structures directly in the database, bringing the database schema closer to our conceptual model.

## What is a Data Type?

At its most basic level, a data type defines:

1. A set of possible values
2. Operations that can be performed on those values
3. How those values are stored and represented

For example, the `INTEGER` type in PostgreSQL:

* Represents whole numbers
* Supports arithmetic operations like addition and subtraction
* Is stored in 4 bytes with a range of -2,147,483,648 to 2,147,483,647

## Why Create Custom Data Types?

Before diving into how to create custom types, let's understand why we might want to:

1. **Data Integrity** : When data conforms to a custom type, it must follow the rules of that type
2. **Encapsulation** : Related attributes can be grouped into a single type
3. **Abstraction** : Complex data structures can be represented in a more natural way
4. **Reusability** : Once defined, a type can be used in multiple tables
5. **Performance** : Operations on custom types can be optimized

## Types of Custom Data Types in PostgreSQL

PostgreSQL offers several ways to create custom data types:

1. **Composite Types** : Bundle multiple fields into a single type
2. **Enumerated Types (ENUMs)** : Define a static set of values
3. **Domain Types** : Constrain existing types with additional rules
4. **Base Types** : Create entirely new types (advanced)

Let's explore each of these with practical examples.

## 1. Composite Types

Composite types allow you to bundle multiple fields together, similar to structs in C or classes in object-oriented programming.

### Creating a Composite Type:

```sql
CREATE TYPE address AS (
  street_number INTEGER,
  street_name TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT
);
```

This creates a new type called `address` that contains five fields.

### Using the Composite Type:

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT,
  home_address address,
  work_address address
);

-- Insert data using the composite type
INSERT INTO customers (name, home_address, work_address)
VALUES (
  'John Doe',
  ROW(123, 'Main St', 'Springfield', 'IL', '62701'),
  ROW(456, 'Business Ave', 'Springfield', 'IL', '62702')
);
```

In this example, I've created a `customers` table that uses our `address` type twice – once for home address and once for work address. The `ROW` constructor creates values of the composite type.

### Accessing Fields in a Composite Type:

```sql
-- Get a specific field using dot notation
SELECT name, (home_address).city 
FROM customers;

-- Compare whole addresses
SELECT name
FROM customers
WHERE home_address = work_address;

-- Update a single field
UPDATE customers
SET home_address.postal_code = '62704'
WHERE id = 1;
```

The dot notation here allows us to access individual fields within our composite type.

## 2. Enumerated Types (ENUMs)

ENUMs define a static list of values, similar to enumerated types in many programming languages.

### Creating an ENUM:

```sql
CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy', 'ecstatic');
```

This creates a new type `mood` that can only have one of four specific values.

### Using an ENUM:

```sql
CREATE TABLE daily_logs (
  id SERIAL PRIMARY KEY,
  day DATE,
  current_mood mood,
  notes TEXT
);

INSERT INTO daily_logs (day, current_mood, notes)
VALUES 
  (CURRENT_DATE, 'happy', 'Had a productive day'),
  (CURRENT_DATE - 1, 'sad', 'Lost my keys');
```

ENUMs provide better data integrity than using strings, as the database will reject any value not defined in the enum.

### Order in ENUMs:

An important feature of ENUMs is that the values have a specific order, which is the order in which they were listed when the type was created.

```sql
-- Find days when mood was better than 'ok'
SELECT day, current_mood
FROM daily_logs
WHERE current_mood > 'ok';
```

This query would return days with 'happy' or 'ecstatic' moods, as they come after 'ok' in our definition.

## 3. Domain Types

Domains allow you to create a new type by adding constraints to an existing type.

### Creating a Domain:

```sql
CREATE DOMAIN positive_integer AS INTEGER
  CHECK (VALUE > 0);

CREATE DOMAIN us_postal_code AS TEXT
  CHECK (VALUE ~ '^\d{5}(-\d{4})?$');
```

Here, I've created two domains:

* `positive_integer`: An integer that must be greater than zero
* `us_postal_code`: Text that must match the pattern for US postal codes

### Using Domains:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  price positive_integer,
  inventory positive_integer
);

CREATE TABLE us_addresses (
  id SERIAL PRIMARY KEY,
  street TEXT,
  city TEXT,
  state CHAR(2),
  zip us_postal_code
);
```

Now our database will enforce that prices and inventory must be positive, and zip codes must be in a valid format.

### Benefits of Domains:

Domains promote consistency and reduce duplication of constraints across your schema. If the rules for a US postal code change, you only need to update the domain definition, not every table that uses postal codes.

## 4. Base Types (Advanced)

Creating a base type is more complex and usually involves writing code in C or another language that PostgreSQL can interface with. Let's look at a simpler example that doesn't require C programming.

### Example: Creating a Simple Complex Number Type

While PostgreSQL does have a built-in complex number type, let's imagine building a simple version:

```sql
-- Create a composite type for our complex number
CREATE TYPE complex AS (
  real FLOAT,
  imaginary FLOAT
);

-- Create functions to handle operations on our type
CREATE FUNCTION complex_add(complex, complex) RETURNS complex AS $$
SELECT ROW($1.real + $2.real, $1.imaginary + $2.imaginary)::complex;
$$ LANGUAGE SQL IMMUTABLE;

-- Create an operator for addition
CREATE OPERATOR + (
  LEFTARG = complex,
  RIGHTARG = complex,
  PROCEDURE = complex_add
);
```

Now we can use our complex numbers and perform operations on them:

```sql
CREATE TABLE complex_calculations (
  id SERIAL PRIMARY KEY,
  value complex
);

INSERT INTO complex_calculations (value)
VALUES (ROW(3.0, 4.0)), (ROW(1.0, 2.0));

-- Use our custom operator
SELECT a.value + b.value
FROM complex_calculations a, complex_calculations b
WHERE a.id = 1 AND b.id = 2;
```

This is a simplified example, but it demonstrates how you can create custom types with their own operations.

## Practical Applications

Let's look at some real-world examples of when custom types are valuable:

### Geographic Coordinates

```sql
CREATE TYPE geo_point AS (
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6)
);

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name TEXT,
  position geo_point
);

INSERT INTO locations (name, position)
VALUES ('Eiffel Tower', ROW(48.858844, 2.294351));
```

### Money with Currency

```sql
CREATE TYPE currency AS ENUM ('USD', 'EUR', 'GBP', 'JPY');

CREATE TYPE money_amount AS (
  amount DECIMAL(12,2),
  currency currency
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  description TEXT,
  amount money_amount,
  transaction_date TIMESTAMP
);

INSERT INTO transactions (description, amount, transaction_date)
VALUES ('Purchase laptop', ROW(1200.00, 'USD'), CURRENT_TIMESTAMP);
```

### Data Validation with Domains

```sql
-- Email domain with validation
CREATE DOMAIN email AS TEXT
  CHECK (VALUE ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

-- Phone number domain
CREATE DOMAIN phone_number AS TEXT
  CHECK (VALUE ~ '^\+?[0-9]{10,15}$');

CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email email,
  phone phone_number
);
```

## Performance Considerations

Custom types can impact performance in both positive and negative ways:

> When designed well, custom types can improve performance by encapsulating operations and enabling specialized indexing. However, they can also introduce overhead, especially for complex operations or when used extensively.

For composite types:

* They may increase storage requirements
* Indexing on individual fields requires expression indexes

For ENUMs:

* They're very space-efficient (typically 4 bytes regardless of string length)
* They can make queries simpler and faster when filtering by category

## Best Practices

Here are some guidelines for using custom types effectively:

1. **Use ENUMs for fixed sets** of values that rarely change
2. **Use domains for data validation** across multiple tables
3. **Use composite types when data naturally groups together**
4. **Document your types** clearly, especially their constraints and assumptions
5. **Consider alternative designs** like separate tables for very complex types
6. **Be cautious about migrations** as changing custom types can be challenging

## Managing Custom Types

### Altering Types

Altering custom types can be tricky, especially if they're already in use:

```sql
-- Add a value to an ENUM
ALTER TYPE mood ADD VALUE 'anxious' BEFORE 'sad';

-- Rename a type
ALTER TYPE address RENAME TO mailing_address;

-- For composite types, you often need to create a new version
CREATE TYPE address_v2 AS (
  street_number INTEGER,
  street_name TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT  -- New field
);
```

### Dropping Types

```sql
-- Drop a type (must not be in use)
DROP TYPE address;

-- Force drop (use with caution!)
DROP TYPE address CASCADE;
```

The `CASCADE` option will automatically drop any objects that depend on the type.

## Advanced Example: Range Types

PostgreSQL has built-in support for range types, but you can create custom ranges as well:

```sql
-- Create a custom range type for temperature
CREATE TYPE temperature AS (
  value DECIMAL,
  unit CHAR(1)  -- 'C' for Celsius, 'F' for Fahrenheit, 'K' for Kelvin
);

-- Create a range type based on our temperature type
CREATE TYPE temp_range AS RANGE (
  subtype = temperature,
  subtype_diff = temp_diff  -- This would need a custom function
);

-- Now we could use it like:
CREATE TABLE climate_zones (
  id SERIAL PRIMARY KEY,
  name TEXT,
  annual_temp_range temp_range
);
```

This is a conceptual example and would require additional functions to properly implement.

## Conclusion

Custom data types in PostgreSQL provide a powerful way to model domain-specific data directly in your database schema. They enhance data integrity, improve code organization, and can make your queries more expressive and intuitive.

> By bringing your data model closer to your conceptual understanding of the problem domain, custom types help bridge the gap between how you think about your data and how it's stored in the database.

From simple ENUMs to complex composite types with custom operators, PostgreSQL's type system offers flexibility and expressiveness that few other databases can match.

When used appropriately, custom data types can significantly improve the clarity and maintainability of your database schema, making it a more accurate representation of your application's domain model.
