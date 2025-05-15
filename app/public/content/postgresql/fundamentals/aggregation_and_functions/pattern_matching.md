# Pattern Matching with LIKE and Regular Expressions in PostgreSQL

Pattern matching is a fundamental concept in database querying that allows us to search for specific patterns within text data rather than exact matches. PostgreSQL provides two primary approaches for pattern matching: the LIKE operator and regular expressions (REGEXP). Let's explore both from first principles.

## The LIKE Operator

The LIKE operator is the simpler of the two pattern matching tools, designed for straightforward text pattern matching.

> The LIKE operator allows us to find strings that match a specified pattern using wildcards, providing a simple yet powerful way to search through text data.

### How LIKE Works: The Basics

The LIKE operator compares a string against a pattern and returns true if the string matches the pattern. It uses two special wildcard characters:

* `%` (percent sign): Matches any sequence of zero or more characters
* `_` (underscore): Matches exactly one character

Let's understand this with examples:

```sql
-- Find all customers whose names start with 'A'
SELECT * FROM customers 
WHERE name LIKE 'A%';

-- Find all products with exactly 5 characters in their name
SELECT * FROM products 
WHERE product_name LIKE '_____';

-- Find all employees whose names have 'son' somewhere in them
SELECT * FROM employees 
WHERE name LIKE '%son%';
```

In the first example, `'A%'` will match any string that starts with 'A', such as 'Alex', 'Amanda', or 'Aardvark'. The `%` wildcard matches any number of characters that follow 'A'.

In the second example, `'_____'` will match exactly 5 characters, such as 'Apple', 'Mango', or 'Grape'.

In the third example, `'%son%'` will match any string that contains 'son' anywhere, such as 'Johnson', 'Wilson', or 'Sondheim'.

### ILIKE: Case-Insensitive Matching

PostgreSQL also provides the ILIKE operator, which performs case-insensitive pattern matching:

```sql
-- Find all customers whose names start with 'a' or 'A'
SELECT * FROM customers 
WHERE name ILIKE 'a%';
```

This will match names like 'Alex', 'amanda', or 'ASHLEY'.

### Escaping Special Characters

What if you need to search for a literal `%` or `_` character? PostgreSQL uses the escape character `\` by default:

```sql
-- Find products with a % in their name
SELECT * FROM products 
WHERE product_name LIKE '%\%%';

-- Find emails containing an underscore
SELECT * FROM users 
WHERE email LIKE '%\_%';
```

You can also specify a different escape character using the ESCAPE clause:

```sql
-- Using '#' as escape character
SELECT * FROM products 
WHERE product_name LIKE '%#%%' ESCAPE '#';
```

### Practical Example: Analyzing Customer Data

Let's look at a more comprehensive example using a customers table:

```sql
-- Find customers from area codes starting with 5
SELECT name, phone_number 
FROM customers 
WHERE phone_number LIKE '(5___)%';

-- Find customers whose email is from Gmail but not Google Workspace
SELECT name, email 
FROM customers 
WHERE email LIKE '%@gmail.com' 
AND email NOT LIKE '%@%.gmail.com';
```

In the first query, we're looking for phone numbers that start with an area code beginning with 5, followed by any three digits.

In the second query, we're finding Gmail users but excluding Google Workspace accounts that might have custom domains.

## Regular Expressions in PostgreSQL

While LIKE is useful for simple patterns, regular expressions provide much more powerful pattern matching capabilities.

> Regular expressions are an advanced pattern matching language that allows us to define precise, complex text patterns using a specialized syntax.

PostgreSQL implements regular expressions using the POSIX standard and provides several operators for regex matching:

* `~` : Case-sensitive regex match
* `~*` : Case-insensitive regex match
* `!~` : Case-sensitive regex does not match
* `!~*` : Case-insensitive regex does not match

### Basic Regular Expression Syntax

Here are some fundamental regex patterns:

* `.` : Matches any single character
* `^` : Matches the start of a string
* `$` : Matches the end of a string
* `[]` : Matches any one character within the brackets
* `[^]` : Matches any one character not within the brackets
* `()` : Groups elements together
* `|` : Matches either expression before or after the pipe
* `*` : Matches the preceding element zero or more times
* `+` : Matches the preceding element one or more times
* `?` : Matches the preceding element zero or one time
* `{n}` : Matches exactly n occurrences of the preceding element
* `{n,}` : Matches n or more occurrences of the preceding element
* `{n,m}` : Matches between n and m occurrences of the preceding element

Let's see these in action with some examples:

```sql
-- Find all emails that follow a basic email pattern
SELECT email FROM users 
WHERE email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';

-- Find all phone numbers in format (XXX) XXX-XXXX
SELECT phone FROM contacts 
WHERE phone ~ '^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$';
```

In the first example, we're using a complex regex pattern to validate email addresses:

* `^[A-Za-z0-9._%+-]+` matches one or more alphanumeric characters or special characters at the start
* `@` matches the @ symbol
* `[A-Za-z0-9.-]+` matches one or more alphanumeric characters or dots/hyphens for the domain name
* `\.` matches a literal dot (escaped with )
* `[A-Za-z]{2,}$` matches at least two alphabetic characters at the end for the top-level domain

In the second example, we're matching North American phone numbers with a specific format.

### Character Classes

PostgreSQL supports POSIX character classes for more readable regex patterns:

* `[[:alnum:]]` : Alphanumeric characters
* `[[:alpha:]]` : Alphabetic characters
* `[[:digit:]]` : Digits
* `[[:lower:]]` : Lowercase letters
* `[[:upper:]]` : Uppercase letters
* `[[:space:]]` : Whitespace characters

Example:

```sql
-- Find names that contain only letters and spaces
SELECT name FROM customers 
WHERE name ~ '^[[:alpha:][:space:]]+$';

-- Find product codes that start with letters followed by numbers
SELECT product_code FROM products 
WHERE product_code ~ '^[[:alpha:]]+[[:digit:]]+$';
```

### Quantifiers and Greedy vs. Non-Greedy Matching

Regular expressions use quantifiers to specify how many times a pattern should match:

```sql
-- Match US ZIP codes (5 digits or 5+4 format)
SELECT address FROM customers 
WHERE zip ~ '^[0-9]{5}(-[0-9]{4})?$';
```

This matches either exactly 5 digits or 5 digits followed by a hyphen and 4 more digits.

By default, quantifiers like `*` and `+` are "greedy" - they match as much as possible. Adding a `?` after makes them "non-greedy" - matching as little as possible:

```sql
-- Extract content between HTML tags (greedy)
SELECT regexp_matches(content, '<div>(.*)</div>', 'g') 
FROM web_pages;

-- Extract content between HTML tags (non-greedy)
SELECT regexp_matches(content, '<div>(.*?)</div>', 'g') 
FROM web_pages;
```

The first will match everything between the first `<div>` and the last `</div>`, while the second will match each individual `<div>` content.

### Advanced Regular Expression Functions

PostgreSQL provides several functions for working with regular expressions:

#### regexp_matches()

Returns an array of all matches or submatches:

```sql
-- Extract all email addresses from a text field
SELECT id, regexp_matches(content, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', 'g') 
FROM documents;
```

The 'g' flag indicates global matching, finding all matches rather than just the first.

#### regexp_replace()

Replaces text matching a pattern:

```sql
-- Censor phone numbers in documents
SELECT id, regexp_replace(content, '(\([0-9]{3}\) [0-9]{3}-)[0-9]{4}', '\1XXXX') 
FROM documents;
```

This would replace "(123) 456-7890" with "(123) 456-XXXX".

#### regexp_split_to_table() and regexp_split_to_array()

Split text based on a pattern:

```sql
-- Split comma-separated tags into rows
SELECT id, regexp_split_to_table(tags, ',\s*') 
FROM articles;

-- Split into an array instead
SELECT id, regexp_split_to_array(tags, ',\s*') 
FROM articles;
```

## Comparing LIKE and Regular Expressions

Let's compare these two approaches:

### LIKE:

* **Pros** :
* Simpler syntax
* Often faster for simple patterns
* Part of the SQL standard
* Easier to read and understand
* **Cons** :
* Limited pattern matching capabilities
* No support for complex patterns
* Requires full string matching

### Regular Expressions:

* **Pros** :
* Much more powerful and flexible
* Can define extremely precise patterns
* Supports capturing groups and alternatives
* Provides extensive pattern matching functions
* **Cons** :
* More complex syntax
* Generally slower performance
* Can be harder to read and maintain

## Performance Considerations

For optimal performance when using pattern matching:

1. **Use indexes** : For LIKE patterns that don't start with wildcards, PostgreSQL can use B-tree indexes.

```sql
   -- This can use an index on 'name'
   SELECT * FROM customers WHERE name LIKE 'A%';

   -- This cannot use a standard B-tree index
   SELECT * FROM customers WHERE name LIKE '%son%';
```

1. **Use trigram indexes** : For pattern matching that includes wildcards at the beginning of the pattern, consider using pg_trgm extension and GIN indexes:

```sql
   -- Enable the extension
   CREATE EXTENSION pg_trgm;

   -- Create a GIN index
   CREATE INDEX idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);

   -- This can now use the trigram index
   SELECT * FROM customers WHERE name LIKE '%son%';
   -- Or with regex
   SELECT * FROM customers WHERE name ~ 'son';
```

1. **Use the right tool** : For simple patterns, LIKE will generally perform better than regular expressions. Use the simplest pattern matching tool that meets your needs.

## Practical Examples

Let's explore some practical examples of both LIKE and regular expressions:

### Example 1: Validating Email Formats

```sql
-- Using LIKE (very basic)
SELECT * FROM users 
WHERE email LIKE '%@%.%';

-- Using regex (more accurate)
SELECT * FROM users 
WHERE email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
```

The LIKE version is much simpler but could match invalid email addresses. The regex version is more precise.

### Example 2: Extracting Information from Structured Text

Imagine we have a table of product descriptions with sizes like "Size: S", "Size: M", "Size: L":

```sql
-- Using LIKE
SELECT product_name,
       CASE 
         WHEN description LIKE '%Size: S%' THEN 'Small'
         WHEN description LIKE '%Size: M%' THEN 'Medium'
         WHEN description LIKE '%Size: L%' THEN 'Large'
         ELSE 'Unknown'
       END AS size
FROM products;

-- Using regex
SELECT product_name,
       CASE 
         WHEN description ~ 'Size:\s*S\b' THEN 'Small'
         WHEN description ~ 'Size:\s*M\b' THEN 'Medium'
         WHEN description ~ 'Size:\s*L\b' THEN 'Large'
         ELSE 'Unknown'
       END AS size
FROM products;
```

The regex version can handle variations in whitespace and ensures we're matching whole words.

### Example 3: Cleaning Data

```sql
-- Remove HTML tags using regexp_replace
SELECT id, 
       regexp_replace(content, '<[^>]*>', '', 'g') AS clean_content
FROM articles;

-- Extract the first sentence
SELECT id,
       regexp_replace(content, '^(.*?[.!?])\s.*$', '\1') AS first_sentence
FROM articles;
```

These examples demonstrate the power of regular expressions for text processing tasks.

### Example 4: Data Validation

```sql
-- Using regex to validate US Social Security Numbers
SELECT id, ssn
FROM employees
WHERE ssn ~ '^[0-9]{3}-[0-9]{2}-[0-9]{4}$';

-- Check for valid ISBN-10 format
SELECT isbn, title
FROM books
WHERE isbn ~ '^[0-9]{9}[0-9X]$';
```

Regular expressions are particularly useful for validating that data follows specific formats.

## Conclusion

Pattern matching with LIKE and regular expressions in PostgreSQL provides powerful tools for text processing and data validation:

1. **LIKE** offers simple pattern matching with `%` and `_` wildcards, suitable for basic text searches.
2. **Regular expressions** provide sophisticated pattern matching capabilities for complex text patterns.
3. Choose the right tool based on your needs:
   * For simple prefix or suffix matching, LIKE is often sufficient and faster.
   * For complex patterns, validation, or text extraction, regular expressions are more powerful.
4. Consider performance implications, especially for large datasets, and leverage indexes when possible.

By mastering these pattern matching techniques, you can write more precise and powerful queries to analyze and manipulate text data in PostgreSQL.
