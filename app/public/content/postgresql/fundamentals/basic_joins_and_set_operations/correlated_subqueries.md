# Correlated Subqueries in PostgreSQL: From First Principles

A correlated subquery is a powerful SQL technique that allows you to write queries where the inner query depends on the outer query. Let me build this concept from the ground up, starting with the fundamentals and gradually moving to more complex examples.

## 1. Understanding Regular Subqueries

Before diving into correlated subqueries, let's understand what a regular subquery is.

> A subquery is simply a query nested inside another query. The inner query executes first, and its results are used by the outer query.

Consider a simple database with two tables: `employees` and `departments`:

```sql
-- Simple subquery (non-correlated)
SELECT employee_name
FROM employees
WHERE department_id IN (
    SELECT id 
    FROM departments 
    WHERE location = 'New York'
);
```

Here, the inner query finds all department IDs in New York, then the outer query finds employees in those departments. The subquery runs once, independently of the outer query.

## 2. What Makes a Subquery "Correlated"

> A correlated subquery differs from a regular subquery because it references columns from the outer query, creating a dependency between them.

This means:

1. The inner query cannot run independently
2. The inner query runs once for each row processed by the outer query
3. The inner query uses values from the current row of the outer query

This interdependence creates a powerful way to express complex relationships between data.

## 3. Basic Structure of a Correlated Subquery

```
SELECT column1, column2, ...
FROM table1 outer_table
WHERE column_value OPERATOR (
    SELECT column_value
    FROM table2
    WHERE outer_table.some_column = table2.related_column
);
```

The key element here is `outer_table.some_column` inside the inner query—this creates the correlation.

## 4. Simple Example: Finding Employees with Above-Average Salary in Their Department

```sql
SELECT employee_name, salary, department_id
FROM employees e1
WHERE salary > (
    SELECT AVG(salary)
    FROM employees e2
    WHERE e1.department_id = e2.department_id
);
```

Let's break down how this executes:

1. The outer query begins processing the first row of `employees` (let's call it e1)
2. For this row, the database needs to evaluate the subquery
3. The subquery calculates the average salary for employees in the same department as e1
4. The outer query compares e1's salary to this average
5. If e1's salary is higher, the row is included in the result
6. The process repeats for each row in the `employees` table

## 5. Execution Flow Visualization

For the example above, let's say we have:

Employee 1: Department 10, Salary $60,000
Employee 2: Department 10, Salary $50,000
Employee 3: Department 10, Salary $40,000
Employee 4: Department 20, Salary $70,000
Employee 5: Department 20, Salary $60,000

The execution would flow like this:

1. Process Employee 1:
   * Subquery calculates AVG(salary) for Department 10: ($60,000 + $50,000 + $40,000) / 3 = $50,000
   * $60,000 > $50,000? Yes, include Employee 1
2. Process Employee 2:
   * Subquery calculates AVG(salary) for Department 10: $50,000
   * $50,000 > $50,000? No, exclude Employee 2

And so on for each employee.

## 6. Common Use Cases for Correlated Subqueries

### Example 1: Finding the Latest Order for Each Customer

```sql
SELECT o1.order_id, o1.customer_id, o1.order_date
FROM orders o1
WHERE o1.order_date = (
    SELECT MAX(order_date)
    FROM orders o2
    WHERE o2.customer_id = o1.customer_id
);
```

For each order in the outer query, the subquery finds the latest order date for that customer. Only orders that match their customer's latest order date are returned.

### Example 2: Finding Products That Exceed Category Average Price

```sql
SELECT p1.product_id, p1.product_name, p1.price, p1.category_id
FROM products p1
WHERE p1.price > (
    SELECT AVG(price)
    FROM products p2
    WHERE p2.category_id = p1.category_id
);
```

This query compares each product's price to the average price of all products in the same category.

## 7. Correlated Subqueries in the SELECT Clause

Correlated subqueries can also appear in the SELECT clause as a calculated column:

```sql
SELECT 
    d.department_name,
    (SELECT COUNT(*) 
     FROM employees e 
     WHERE e.department_id = d.department_id) AS employee_count
FROM departments d;
```

This query counts employees in each department, with the subquery running once per department.

## 8. EXISTS and NOT EXISTS with Correlated Subqueries

> The EXISTS operator is a powerful way to use correlated subqueries. It simply checks whether the subquery returns any rows, without caring about the values themselves.

### Example: Finding Departments with At Least One Employee

```sql
SELECT department_name
FROM departments d
WHERE EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.department_id = d.department_id
);
```

For each department, the subquery checks if any employees belong to it. If at least one row is found, EXISTS returns true.

### Example: Finding Customers Who Haven't Placed Orders

```sql
SELECT customer_name, customer_id
FROM customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM orders o
    WHERE o.customer_id = c.customer_id
);
```

This finds all customers with no matching records in the orders table.

## 9. UPDATE and DELETE with Correlated Subqueries

Correlated subqueries can also be used in UPDATE and DELETE statements:

### Example: Giving a Raise to Employees Who Exceed Department Average

```sql
UPDATE employees e1
SET salary = salary * 1.1
WHERE salary > (
    SELECT AVG(salary)
    FROM employees e2
    WHERE e2.department_id = e1.department_id
);
```

### Example: Deleting Products with No Sales

```sql
DELETE FROM products p
WHERE NOT EXISTS (
    SELECT 1
    FROM order_items oi
    WHERE oi.product_id = p.product_id
);
```

## 10. Performance Considerations

> Correlated subqueries run once for each row in the outer query, which can impact performance with large datasets.

Let's consider the performance implications:

1. If the outer query processes 1,000 rows, the inner query runs 1,000 times
2. For each execution, the database might need to scan tables, use indexes, etc.
3. This can be resource-intensive on large tables

Some alternatives to consider:

* JOINs: Often more efficient for many operations
* Window functions: Can replace some correlated subqueries with better performance
* CTEs (Common Table Expressions): Can improve readability and sometimes performance

For example, our salary comparison could be rewritten with a window function:

```sql
SELECT employee_name, salary, department_id
FROM (
    SELECT 
        employee_name, 
        salary, 
        department_id,
        AVG(salary) OVER (PARTITION BY department_id) as dept_avg
    FROM employees
) e
WHERE salary > dept_avg;
```

## 11. Step-by-Step Example: Finding Employees Earning More Than Their Manager

Let's walk through a complete practical example:

```sql
-- Table structure
CREATE TABLE employees (
  employee_id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  salary NUMERIC(10,2),  
  manager_id INTEGER REFERENCES employees(employee_id)
);

-- Insert sample data
INSERT INTO employees (employee_id, name, salary, manager_id) VALUES 
(1, 'John Smith', 100000, NULL),      -- CEO
(2, 'Jane Doe', 85000, 1),            -- Manager under CEO
(3, 'Bob Johnson', 90000, 1),         -- Manager under CEO 
(4, 'Alice Brown', 65000, 2),         -- Reports to Jane
(5, 'Charlie Davis', 88000, 2),       -- Reports to Jane, earns more
(6, 'Eve Wilson', 60000, 3),          -- Reports to Bob
(7, 'Frank Miller', 75000, 3);        -- Reports to Bob
```

Now, let's find employees who earn more than their managers:

```sql
SELECT e1.name AS employee_name, e1.salary AS employee_salary,
       (SELECT name FROM employees WHERE employee_id = e1.manager_id) AS manager_name,
       (SELECT salary FROM employees WHERE employee_id = e1.manager_id) AS manager_salary
FROM employees e1
WHERE e1.salary > (
    SELECT salary
    FROM employees e2
    WHERE e2.employee_id = e1.manager_id
);
```

Let's trace the execution:

1. The outer query starts processing the row for Charlie Davis (employee_id = 5)
2. The correlated subquery looks for the salary of employee_id = 2 (Jane Doe)
3. Charlie's salary ($88,000) is compared with Jane's salary ($85,000)
4. Since $88,000 > $85,000, Charlie's row is included in the results

The result would be:

```
employee_name | employee_salary | manager_name | manager_salary
--------------+-----------------+-------------+---------------
Charlie Davis | 88000.00        | Jane Doe    | 85000.00
```

## 12. Advanced Example: Finding Departments With All Employees Above a Certain Salary

Here's a more complex example using the NOT EXISTS operator to find departments where all employees earn more than $50,000:

```sql
SELECT d.department_name
FROM departments d
WHERE NOT EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.department_id = d.department_id
    AND e.salary <= 50000
);
```

This query finds departments where there doesn't exist any employee making $50,000 or less—in other words, all employees make more than $50,000.

## 13. Practical Application: Finding Potential Duplicate Records

Correlated subqueries are useful for data quality checks, such as finding potential duplicates:

```sql
SELECT c1.customer_id, c1.name, c1.email, c1.phone
FROM customers c1
WHERE EXISTS (
    SELECT 1
    FROM customers c2
    WHERE c2.customer_id <> c1.customer_id
    AND (c2.email = c1.email OR c2.phone = c1.phone)
);
```

This finds customers who share an email or phone number with another customer—a common indicator of duplicate records.

## Conclusion

Correlated subqueries are a powerful feature in PostgreSQL that allows you to express complex data relationships. By understanding how the inner query references and depends on the outer query, you can solve problems that would be difficult to express with other SQL constructs.

Remember these key points:

> * Correlated subqueries reference columns from the outer query
> * They execute once for each row processed by the outer query
> * They're especially useful with EXISTS/NOT EXISTS operators
> * Consider performance implications with large datasets
> * Sometimes they can be rewritten using JOINs or window functions for better performance

With practice, you'll find that correlated subqueries become an indispensable tool in your PostgreSQL toolkit, enabling you to write expressive and powerful queries that precisely answer complex questions about your data.
