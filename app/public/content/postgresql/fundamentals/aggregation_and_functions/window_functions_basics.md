# Window Functions in PostgreSQL: From First Principles

Window functions are a powerful feature in PostgreSQL that allow you to perform calculations across rows that are related to the current row. Let's build our understanding from the ground up, focusing particularly on the ranking functions: ROW_NUMBER, RANK, and DENSE_RANK.

## What Are Window Functions?

> Window functions perform calculations across a set of table rows that are somehow related to the current row. This is comparable to the type of calculation that can be done with an aggregate function. However, window functions do not cause rows to become grouped into a single output row like non-window aggregate calls would.

Window functions operate on a "window" of rows, which is defined by the OVER clause. This window represents a subset of rows from the query's result set.

### The Core Concept: Windows of Data

Think of a window function as looking through a window at your data. The window defines which rows the function can "see" and operate on.

Let's use a simple example to illustrate. Imagine we have a table of employees with their departments and salaries:

```sql
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(100),
    salary INTEGER
);

INSERT INTO employees (name, department, salary) VALUES
('Alice', 'Sales', 60000),
('Bob', 'Marketing', 55000),
('Charlie', 'Sales', 70000),
('David', 'Engineering', 80000),
('Eve', 'Marketing', 65000),
('Frank', 'Engineering', 90000);
```

A regular query might look like:

```sql
SELECT name, department, salary FROM employees;
```

But what if we want to see each employee's salary alongside the average salary in their department? This is where window functions come in:

```sql
SELECT 
    name, 
    department, 
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg_salary
FROM 
    employees;
```

This query would return:

```
name    | department  | salary | dept_avg_salary
--------|-------------|--------|----------------
Alice   | Sales       | 60000  | 65000
Charlie | Sales       | 70000  | 65000
Bob     | Marketing   | 55000  | 60000
Eve     | Marketing   | 65000  | 60000
David   | Engineering | 80000  | 85000
Frank   | Engineering | 90000  | 85000
```

The `AVG(salary) OVER (PARTITION BY department)` is a window function that:

1. Divides the result set into partitions (windows) by department
2. Calculates the average salary within each partition
3. Returns that average for each row in the partition

## Anatomy of a Window Function

A window function follows this general syntax:

```sql
function_name(arguments) OVER (
    [PARTITION BY column1, column2, ...]
    [ORDER BY column1 [ASC|DESC], column2 [ASC|DESC], ...]
    [frame_clause]
)
```

Let's break down each component:

1. **function_name(arguments)** : The function to apply (like AVG, SUM, ROW_NUMBER, etc.)
2. **OVER clause** : Defines the window of rows
3. **PARTITION BY** (optional): Divides the result set into groups
4. **ORDER BY** (optional): Specifies the order of rows within each partition
5. **frame_clause** (optional): Further refines which rows are included in the window frame

## Ranking Functions: ROW_NUMBER, RANK, and DENSE_RANK

Now, let's dive into the specific ranking functions:

### ROW_NUMBER()

> ROW_NUMBER() assigns a unique sequential integer to each row within the partition of a result set.

Think of ROW_NUMBER as assigning a unique "line number" to each row in your ordered result set.

```sql
SELECT 
    name, 
    department, 
    salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank
FROM 
    employees;
```

Result:

```
name    | department  | salary | salary_rank
--------|-------------|--------|------------
Charlie | Sales       | 70000  | 1
Alice   | Sales       | 60000  | 2
Eve     | Marketing   | 65000  | 1
Bob     | Marketing   | 55000  | 2
Frank   | Engineering | 90000  | 1
David   | Engineering | 80000  | 2
```

In this example, ROW_NUMBER assigns a sequential number within each department, ordered by salary in descending order.

### RANK()

> RANK() assigns a rank to each row within the partition of a result set, with gaps in the ranking if there are ties.

RANK works similarly to ROW_NUMBER, but it handles ties differently. If two rows have the same value, they get the same rank, and the next rank is skipped.

Let's modify our example to include employees with the same salary:

```sql
-- Add employees with duplicate salaries
INSERT INTO employees (name, department, salary) VALUES
('Grace', 'Sales', 60000),
('Helen', 'Engineering', 80000);

SELECT 
    name, 
    department, 
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank
FROM 
    employees;
```

Result:

```
name    | department  | salary | salary_rank
--------|-------------|--------|------------
Charlie | Sales       | 70000  | 1
Alice   | Sales       | 60000  | 2
Grace   | Sales       | 60000  | 2
Eve     | Marketing   | 65000  | 1
Bob     | Marketing   | 55000  | 2
Frank   | Engineering | 90000  | 1
David   | Engineering | 80000  | 2
Helen   | Engineering | 80000  | 2
```

Notice how Alice and Grace both get rank 2 because they have the same salary. The next employee in Sales would get rank 4 (not 3).

### DENSE_RANK()

> DENSE_RANK() assigns a rank to each row within the partition of a result set, without gaps in the ranking when there are ties.

DENSE_RANK is similar to RANK but doesn't leave gaps in the sequence:

```sql
SELECT 
    name, 
    department, 
    salary,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank
FROM 
    employees;
```

Result:

```
name    | department  | salary | salary_rank
--------|-------------|--------|------------
Charlie | Sales       | 70000  | 1
Alice   | Sales       | 60000  | 2
Grace   | Sales       | 60000  | 2
Eve     | Marketing   | 65000  | 1
Bob     | Marketing   | 55000  | 2
Frank   | Engineering | 90000  | 1
David   | Engineering | 80000  | 2
Helen   | Engineering | 80000  | 2
```

The difference between RANK and DENSE_RANK would become apparent if we had another employee in Sales with a salary of 50000. With RANK, they would get rank 4, but with DENSE_RANK, they would get rank 3.

## Comparing ROW_NUMBER, RANK, and DENSE_RANK Side by Side

Let's see all three functions at once to understand the differences clearly:

```sql
SELECT 
    name, 
    department, 
    salary,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_val,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rank_val
FROM 
    employees;
```

Result (for Sales department):

```
name    | department | salary | row_num | rank_val | dense_rank_val
--------|------------|--------|---------|----------|---------------
Charlie | Sales      | 70000  | 1       | 1        | 1
Alice   | Sales      | 60000  | 2       | 2        | 2
Grace   | Sales      | 60000  | 3       | 2        | 2
```

You can see that:

* ROW_NUMBER always gives unique, sequential numbers (1, 2, 3)
* RANK gives the same rank for ties, then skips (1, 2, 2, 4)
* DENSE_RANK gives the same rank for ties, but doesn't skip (1, 2, 2, 3)

## Practical Examples

### Example 1: Finding the top 3 highest-paid employees in each department

```sql
WITH ranked_employees AS (
    SELECT 
        name, 
        department, 
        salary,
        DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS salary_rank
    FROM 
        employees
)
SELECT * FROM ranked_employees WHERE salary_rank <= 3;
```

This query:

1. Creates a CTE (Common Table Expression) that ranks employees within their departments
2. Selects only the top 3 from each department

### Example 2: Calculating running totals

```sql
SELECT 
    name, 
    department, 
    salary,
    SUM(salary) OVER (PARTITION BY department ORDER BY salary) AS running_total
FROM 
    employees;
```

This shows a running total of salaries within each department, ordered from lowest to highest salary.

### Example 3: Finding salary percentiles

```sql
SELECT 
    name, 
    department, 
    salary,
    PERCENT_RANK() OVER (PARTITION BY department ORDER BY salary) AS salary_percentile
FROM 
    employees;
```

This calculates each employee's salary percentile within their department.

## Key Concepts to Remember

> The key to understanding window functions is to realize that they:
>
> 1. Execute after the WHERE, GROUP BY, and HAVING clauses
> 2. Process over the result set before final output
> 3. Don't reduce the number of rows returned (unlike aggregates)

### Partitioning vs Grouping

A common point of confusion is the difference between PARTITION BY in window functions and GROUP BY:

* GROUP BY collapses rows into summary rows
* PARTITION BY keeps all rows but defines groups for calculation

For example:

```sql
-- GROUP BY: Returns one row per department
SELECT department, AVG(salary) as avg_salary
FROM employees
GROUP BY department;

-- PARTITION BY: Returns all rows with department averages
SELECT 
    name, 
    department, 
    salary,
    AVG(salary) OVER (PARTITION BY department) as avg_salary
FROM employees;
```

### Order Matters in Window Functions

The ORDER BY in a window function is crucial for ranking functions and also affects other functions like running totals:

```sql
-- Running total ascending by salary
SELECT 
    name, 
    salary,
    SUM(salary) OVER (ORDER BY salary) as running_total_asc
FROM employees;

-- Running total descending by salary
SELECT 
    name, 
    salary,
    SUM(salary) OVER (ORDER BY salary DESC) as running_total_desc
FROM employees;
```

These will give different results because the "window" of rows included in the calculation changes based on the order.

## Common Mistakes and How to Avoid Them

### Mistake 1: Confusing window functions with GROUP BY

```sql
-- INCORRECT: Trying to use window function with GROUP BY
SELECT 
    department, 
    AVG(salary) as avg_salary,
    ROW_NUMBER() OVER (ORDER BY AVG(salary) DESC) as dept_rank
FROM employees
GROUP BY department;
```

This won't work because window functions operate on the result set, not during aggregation.

### Mistake 2: Forgetting the OVER clause

```sql
-- INCORRECT: Missing OVER clause
SELECT name, department, salary, ROW_NUMBER() as row_num
FROM employees;
```

All window functions require an OVER clause, even if it's empty: `ROW_NUMBER() OVER ()`.

## Performance Considerations

Window functions can be computationally expensive, especially on large datasets. Some tips:

1. Use appropriate indexes for columns in PARTITION BY and ORDER BY
2. Consider materializing intermediate results with CTEs or temporary tables
3. Be mindful of using multiple window functions in the same query

## Summary

Window functions, particularly ranking functions like ROW_NUMBER, RANK, and DENSE_RANK, provide powerful tools for data analysis in PostgreSQL:

* **ROW_NUMBER** : Assigns unique sequential numbers (1, 2, 3, 4, ...)
* **RANK** : Assigns same number for ties, then skips (1, 2, 2, 4, ...)
* **DENSE_RANK** : Assigns same number for ties, doesn't skip (1, 2, 2, 3, ...)

They all work within partitions defined by PARTITION BY and respect the order specified by ORDER BY.

Understanding these functions opens up new ways to analyze your data, from finding top performers to calculating running aggregates and percentiles.
