# Range Types in PostgreSQL: A First Principles Exploration

I'll explain PostgreSQL range types from first principles, building up the concept step by step with detailed examples.

## What Are Data Types?

Before diving into range types specifically, let's establish what data types are in database systems:

> A data type defines the kind of values that can be stored in a column and the operations that can be performed on those values. Types provide constraints on the input data and determine how the database engine will physically store and process the information.

In PostgreSQL, we have several categories of data types:

* Numeric types (integers, floating-point)
* Character types (text, varchar)
* Date/time types
* Boolean type
* And several others including geometric types, network address types, etc.

## The Need for Range Types

Traditional data types store single discrete values. For example:

```sql
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    appointment_date DATE,
    start_time TIME,
    end_time TIME
);
```

But what if we want to represent a continuous range of values, like time spans or numeric intervals? This is where range types come in.

> Range types represent a range of values of some element type (called the range's subtype). For example, ranges of timestamp might be used to represent the ranges of time that a meeting room is reserved.

## First Principles of Range Types

Range types in PostgreSQL are built on these fundamental principles:

1. **Inclusivity/Exclusivity** : A range can include or exclude its lower and upper bounds
2. **Infinity** : Ranges can have infinite bounds in either direction
3. **Element type** : Each range is tied to a specific data type (its subtype)
4. **Emptiness** : Ranges can be empty
5. **Operations** : Special operators for range operations like containment, overlapping, etc.

## Built-in Range Types in PostgreSQL

PostgreSQL provides several built-in range types:

```
int4range    - Range of integer
int8range    - Range of bigint
numrange     - Range of numeric
tsrange      - Range of timestamp without time zone
tstzrange    - Range of timestamp with time zone
daterange    - Range of date
```

## Range Syntax

Range values in PostgreSQL use a specific syntax:

```
(lower-bound,upper-bound)
[lower-bound,upper-bound]
[lower-bound,upper-bound)
(lower-bound,upper-bound]
```

Where:

* `[` or `]` indicates inclusion of the bound (bound value is part of the range)
* `(` or `)` indicates exclusion of the bound (bound value is not part of the range)

Let's look at some examples:

```sql
-- Range from 1 to 10, including both 1 and 10
SELECT '[1,10]'::int4range;

-- Range from 1 to 10, excluding 10
SELECT '[1,10)'::int4range;

-- Range from 1 to 10, excluding both 1 and 10
SELECT '(1,10)'::int4range;

-- Range from 1 to 10, excluding 1, including 10
SELECT '(1,10]'::int4range;
```

## Creating a Table with Range Types

Let's see how to create a table that uses range types:

```sql
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    room_id INTEGER,
    reserved_during daterange
);
```

This table stores room reservations, with the `reserved_during` column holding a range of dates.

## Inserting Range Data

Here's how to insert data with range values:

```sql
-- Reserve room 101 from January 1, 2025 to January 5, 2025 (inclusive)
INSERT INTO reservations (room_id, reserved_during) 
VALUES (101, '[2025-01-01, 2025-01-05]');

-- Reserve room 102 from January 10, 2025 to January 15, 2025 (upper bound exclusive)
INSERT INTO reservations (room_id, reserved_during) 
VALUES (102, '[2025-01-10, 2025-01-15)');
```

In the second example, the reservation includes January 10 but ends at the beginning of January 15 (not including January 15).

## Range Operators

PostgreSQL provides a rich set of operators for working with ranges:

| Operator | Description       | Example                                  | Result                                    |
| -------- | ----------------- | ---------------------------------------- | ----------------------------------------- |
| `@>`   | Contains          | `[2,4]::int4range @> 3`                | true                                      |
| `<@`   | Contained in      | `3 <@ [2,4]::int4range`                | true                                      |
| `&&`   | Overlap           | `[1,3]::int4range && [2,4]::int4range` | true                                      |
| `<<`   | Strictly left of  | `[1,2]::int4range << [3,4]::int4range` | true                                      |
| `>>`   | Strictly right of | `[3,4]::int4range >> [1,2]::int4range` | true                                      |
| `-       | -`                | Adjacent to                              | `[1,2]::int4range -\|- [3,4]::int4range` |
| `+`    | Union             | `[1,2]::int4range + [3,4]::int4range`  | [1,4]                                     |
| `*`    | Intersection      | `[1,3]::int4range * [2,4]::int4range`  | [2,3]                                     |
| `-`    | Difference        | `[1,3]::int4range - [2,4]::int4range`  | [1,2]                                     |

## Practical Examples

Let's explore some practical examples of using range types:

### Example 1: Finding Overlapping Reservations

```sql
-- Find all reservations that overlap with a specific date range
SELECT * FROM reservations
WHERE reserved_during && '[2025-01-03, 2025-01-07]'::daterange;
```

This query finds all reservations that overlap with the period from January 3 to January 7, 2025.

### Example 2: Checking Room Availability

```sql
-- Check if a room is available for a specific period
SELECT NOT EXISTS (
    SELECT 1 FROM reservations
    WHERE room_id = 101
    AND reserved_during && '[2025-01-20, 2025-01-25)'::daterange
) AS is_available;
```

This query returns `true` if room 101 is available from January 20 to January 25 (exclusive).

### Example 3: Finding Gaps in Reservations

```sql
-- Find gaps between reservations for a specific room
WITH ordered_reservations AS (
    SELECT 
        id,
        room_id,
        reserved_during,
        LEAD(reserved_during) OVER (
            PARTITION BY room_id 
            ORDER BY lower(reserved_during)
        ) AS next_reservation
    FROM reservations
    WHERE room_id = 101
)
SELECT 
    id,
    upper(reserved_during) AS gap_start,
    lower(next_reservation) AS gap_end,
    lower(next_reservation) - upper(reserved_during) AS gap_days
FROM ordered_reservations
WHERE next_reservation IS NOT NULL
AND upper(reserved_during) < lower(next_reservation);
```

This query identifies gaps between reservations for room 101, showing when each gap starts and ends, as well as its duration.

## Range Functions

PostgreSQL provides several functions for working with ranges:

```sql
-- Extract the lower bound
SELECT lower('[2025-01-01, 2025-01-05]'::daterange);  -- Returns 2025-01-01

-- Extract the upper bound
SELECT upper('[2025-01-01, 2025-01-05]'::daterange);  -- Returns 2025-01-05

-- Check if a range is empty
SELECT isempty('[2025-01-01, 2025-01-01)'::daterange);  -- Returns true

-- Check lower bound inclusivity
SELECT lower_inc('[2025-01-01, 2025-01-05]'::daterange);  -- Returns true

-- Check upper bound inclusivity
SELECT upper_inc('[2025-01-01, 2025-01-05]'::daterange);  -- Returns true
```

## Creating Custom Range Types

PostgreSQL allows you to create your own range types based on existing data types:

```sql
-- First, create the base type if needed
CREATE TYPE float8_range AS RANGE (
    subtype = float8,
    subtype_diff = float8mi
);

-- Create a table using the custom range type
CREATE TABLE temperature_readings (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER,
    reading_time TIMESTAMP,
    temperature_range float8_range
);
```

The `subtype_diff` parameter specifies a function to calculate the difference between two element values, which helps PostgreSQL optimize certain operations.

## Range Constraints and Exclusion Constraints

Range types are particularly powerful when combined with exclusion constraints:

```sql
-- Create a table with an exclusion constraint
CREATE TABLE room_bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER,
    booking_period daterange,
    EXCLUDE USING GIST (room_id WITH =, booking_period WITH &&)
);
```

This constraint ensures that no two bookings for the same room can have overlapping time periods. If you try to insert a booking that overlaps with an existing booking for the same room, PostgreSQL will reject the insertion with an error.

## When to Use Range Types

Range types are particularly useful when:

1. You need to store intervals or ranges of values (date ranges, numeric ranges, etc.)
2. You need to perform range operations like containment, overlap, or intersection
3. You need to enforce constraints on ranges (e.g., no overlapping time periods)

> Using range types instead of separate start and end columns gives you access to PostgreSQL's specialized range operators and functions, making your queries more expressive and often more efficient.

## Performance Considerations

When working with range types, keep these performance considerations in mind:

1. Use GiST or SP-GiST indexes to speed up range operations:

```sql
CREATE INDEX reservations_range_idx ON reservations USING GIST (reserved_during);
```

2. Range operations can be more efficient than equivalent operations on separate columns, especially for complex queries involving overlapping, containment, etc.

## Advanced Example: Time-Series Data

Let's consider a more complex example involving time-series data:

```sql
-- Create a table for sensor readings with valid time ranges
CREATE TABLE sensor_readings (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER,
    reading_value NUMERIC,
    valid_during tsrange
);

-- Insert some sample data
INSERT INTO sensor_readings (sensor_id, reading_value, valid_during) VALUES
(1, 25.5, '[2025-01-01 00:00:00, 2025-01-01 00:15:00]'),
(1, 26.2, '[2025-01-01 00:15:00, 2025-01-01 00:30:00]'),
(1, 26.8, '[2025-01-01 00:30:00, 2025-01-01 00:45:00]'),
(1, 27.1, '[2025-01-01 00:45:00, 2025-01-01 01:00:00]');

-- Find readings that were valid at a specific point in time
SELECT * FROM sensor_readings
WHERE valid_during @> '2025-01-01 00:20:00'::timestamp;

-- Find the average reading value during a specific time range
SELECT AVG(reading_value) 
FROM sensor_readings
WHERE valid_during && '[2025-01-01 00:00:00, 2025-01-01 00:30:00]'::tsrange;
```

This example shows how range types can be used to manage time-series data, making it easy to query for values that were valid at specific points in time or during specific periods.

## Common Pitfalls and Solutions

1. **Unbounded Ranges** : Be careful with unbounded ranges (ranges missing a lower or upper bound):

```sql
-- Range with no upper bound
SELECT '[2025-01-01,)'::daterange;

-- Range with no lower bound
SELECT '(,2025-01-01]'::daterange;
```

2. **Empty Ranges** : An empty range represents a range with no values:

```sql
-- Create an empty range
SELECT '[2025-01-01, 2025-01-01)'::daterange;

-- Check if it's empty
SELECT isempty('[2025-01-01, 2025-01-01)'::daterange);  -- Returns true
```

3. **Canonical Form** : PostgreSQL automatically converts ranges to their canonical form:

```sql
-- This will be converted to '[1,4)'
SELECT '[1,2), [2,4)'::int4range;
```

## Summary

Range types in PostgreSQL provide a powerful way to work with continuous ranges of values. They:

1. Represent intervals with clear bounds and inclusivity/exclusivity semantics
2. Support operations like containment, overlap, intersection, and union
3. Integrate with PostgreSQL's indexing and constraint systems
4. Make queries involving ranges more expressive and often more efficient
5. Are particularly useful for time-based data, geographical ranges, and numeric intervals

By understanding range types from first principles, you can make more effective use of PostgreSQL's capabilities, especially for applications involving scheduling, reservations, time-series data, and other domains where ranges are important.
