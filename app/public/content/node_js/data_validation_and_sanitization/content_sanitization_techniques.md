
## What is Content Sanitization? Starting from the Ground Up

Imagine you're building a house, and you want to make sure that only clean, safe materials enter your construction site. Content sanitization in programming works similarly—it's the process of cleaning and validating data that enters your application to ensure it's safe to use.

> **Think of content sanitization as a security guard at the entrance of your application, checking every piece of data that comes in and making sure it's not carrying anything harmful.**

## Why Do We Need Content Sanitization?

When you're building web applications, you're constantly receiving data from users. This could be:

* Form submissions
* URL parameters
* Database inputs
* File uploads
* API requests

The challenge is that **malicious users** can inject harmful content into this data, attempting to exploit vulnerabilities in your application.

## Common Vulnerabilities We're Protecting Against

Let's understand the threats we're defending against:

### 1. Cross-Site Scripting (XSS)

This happens when an attacker injects malicious scripts into web pages viewed by other users.

**Example of an XSS attack:**

```html
<!-- A user submits this as their "name" -->
<script>alert('Your data has been stolen!')</script>
```

If this gets displayed on your webpage without sanitization, it will execute as JavaScript!

### 2. SQL Injection

When user input is improperly used in SQL queries, attackers can manipulate database operations.

**Example:**

```javascript
// Dangerous - Don't do this!
const query = `SELECT * FROM users WHERE name = '${userInput}'`;
```

### 3. HTML Injection

Similar to XSS but focuses on injecting harmful HTML content.

## Types of Content Sanitization in Node.js

Now let's dive into specific techniques you can use in Node.js to sanitize content:

### 1. Input Validation

This is your first line of defense—checking if the data matches expected patterns.

```javascript
// Basic email validation
function validateEmail(email) {
    // Check if email matches basic pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Example usage
const userEmail = "user@example.com";
if (validateEmail(userEmail)) {
    console.log("Valid email format");
} else {
    console.log("Invalid email format");
}
```

**What's happening here?**

* We're using a regular expression to check if the input follows email patterns
* If the pattern doesn't match, we reject the input before it even enters our system

### 2. HTML Sanitization

For content that needs to display HTML, we need specialized sanitization libraries.

```javascript
// Install: npm install dompurify jsdom
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create a DOM window
const window = new JSDOM('').window;
const DOMPurifyInstance = DOMPurify(window);

// Sanitize HTML content
function sanitizeHTML(dirtyHTML) {
    // Configure DOMPurify to allow only specific tags
    const cleanHTML = DOMPurifyInstance.sanitize(dirtyHTML, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: [] // No attributes allowed
    });
  
    return cleanHTML;
}

// Example usage
const userInput = '<p>Hello <script>alert("xss")</script> world!</p>';
const safeContent = sanitizeHTML(userInput);
console.log(safeContent); // Outputs: <p>Hello  world!</p>
```

**Breaking down this example:**

1. We import DOMPurify and jsdom
2. Create a DOM window (needed for server-side sanitization)
3. Configure DOMPurify to only allow specific safe HTML tags
4. The `<script>` tag gets completely removed from the output

### 3. URL Sanitization

URLs can contain harmful parameters or malicious redirects.

```javascript
const url = require('url');

function sanitizeURL(userProvidedURL) {
    try {
        // Parse the URL to validate its structure
        const parsedURL = new URL(userProvidedURL);
      
        // Check if it's HTTP or HTTPS
        if (!['http:', 'https:'].includes(parsedURL.protocol)) {
            throw new Error('Invalid protocol');
        }
      
        // Check if hostname matches allowed domains
        const allowedDomains = ['example.com', 'api.example.com'];
        if (!allowedDomains.includes(parsedURL.hostname)) {
            throw new Error('Domain not allowed');
        }
      
        // Return sanitized URL
        return parsedURL.href;
    } catch (error) {
        console.error('Invalid URL:', error.message);
        return null;
    }
}

// Example usage
const safeURL = sanitizeURL('https://api.example.com/data');
console.log(safeURL); // Will pass validation

const unsafeURL = sanitizeURL('javascript:alert("xss")');
console.log(unsafeURL); // Will be rejected (null)
```

**What this code does:**

1. Parses the URL to validate its structure
2. Checks for allowed protocols (http/https only)
3. Validates against a whitelist of allowed domains
4. Returns null if any check fails

### 4. Database Query Sanitization

For database operations, always use parameterized queries:

```javascript
// Using MySQL2 with prepared statements
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'your_database'
});

// Safe way to query database
function getUserByEmail(email) {
    // The ? placeholder prevents SQL injection
    const query = 'SELECT * FROM users WHERE email = ?';
  
    return new Promise((resolve, reject) => {
        connection.execute(query, [email], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

// Example usage
getUserByEmail('user@example.com')
    .then(users => console.log('Found users:', users))
    .catch(error => console.error('Database error:', error));
```

**Why this is secure:**

* The `?` placeholder ensures that user input is properly escaped
* Even if someone tries to inject SQL code, it will be treated as data, not as SQL commands

## Comprehensive Content Sanitization Strategy

Let's create a complete sanitization module that handles various types of content:

```javascript
// sanitizer.js - A comprehensive sanitization module
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

class ContentSanitizer {
    constructor() {
        // Initialize DOMPurify
        const window = new JSDOM('').window;
        this.DOMPurify = DOMPurify(window);
    }
  
    // Sanitize text input (removes all HTML)
    sanitizeText(input) {
        if (typeof input !== 'string') {
            return '';
        }
      
        // Remove all HTML tags and decode HTML entities
        return this.DOMPurify.sanitize(input, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
        });
    }
  
    // Sanitize HTML with allowed tags
    sanitizeHTML(input, allowedTags = ['p', 'br', 'strong', 'em']) {
        if (typeof input !== 'string') {
            return '';
        }
      
        return this.DOMPurify.sanitize(input, {
            ALLOWED_TAGS: allowedTags,
            ALLOWED_ATTR: ['href', 'title'], // Allow specific attributes
            ALLOW_DATA_ATTR: false
        });
    }
  
    // Sanitize and validate email
    sanitizeEmail(email) {
        const cleanEmail = this.sanitizeText(email).toLowerCase().trim();
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      
        return emailRegex.test(cleanEmail) ? cleanEmail : null;
    }
  
    // Sanitize file names
    sanitizeFileName(fileName) {
        // Remove dangerous characters from file names
        return fileName
            .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric chars
            .replace(/^\.+/, '') // Remove leading dots
            .slice(0, 255); // Limit length
    }
}

// Usage example
const sanitizer = new ContentSanitizer();

// Example data from user input
const userSubmission = {
    name: '<script>alert("xss")</script>John Doe',
    bio: '<p>I love <strong>programming</strong>!</p><script>evil()</script>',
    email: '  JOHN.DOE@EXAMPLE.COM  ',
    fileName: '../../../etc/passwd'
};

// Sanitize all inputs
const sanitizedData = {
    name: sanitizer.sanitizeText(userSubmission.name),
    bio: sanitizer.sanitizeHTML(userSubmission.bio),
    email: sanitizer.sanitizeEmail(userSubmission.email),
    fileName: sanitizer.sanitizeFileName(userSubmission.fileName)
};

console.log('Sanitized data:', sanitizedData);
```

**This example demonstrates:**

1. A reusable sanitization class
2. Different methods for different data types
3. Configuration options for HTML sanitization
4. Proper handling of edge cases

## Advanced Techniques: Context-Aware Sanitization

> **Important: Different contexts require different sanitization approaches. What's safe in one place might be dangerous in another!**

Let's look at context-aware sanitization:

```javascript
class ContextAwareSanitizer {
    // For displaying in HTML attributes
    sanitizeHTMLAttribute(value) {
        return value
            .replace(/[<>"'&]/g, function(match) {
                const escapeMap = {
                    '<': '<',
                    '>': '>',
                    '"': '"',
                    "'": ''',
                    '&': '&'
                };
                return escapeMap[match];
            });
    }
  
    // For JSON contexts
    sanitizeJSON(value) {
        try {
            // Parse and stringify to ensure valid JSON
            const parsed = JSON.parse(value);
            return JSON.stringify(parsed);
        } catch (error) {
            console.error('Invalid JSON:', error);
            return null;
        }
    }
  
    // For shell commands (very dangerous - avoid if possible!)
    sanitizeShellArgument(argument) {
        // WARNING: This is a last resort. Always try to avoid shell exec
        return "'" + argument.replace(/'/g, "'\\''") + "'";
    }
}

// Example usage
const contextSanitizer = new ContextAwareSanitizer();

// Safe for HTML attributes
const safeTitle = contextSanitizer.sanitizeHTMLAttribute('My "awesome" project');
console.log(`<div title="${safeTitle}">Content</div>`);

// Safe for JSON
const safeJSON = contextSanitizer.sanitizeJSON('{"name": "John", "age": 30}');
console.log(safeJSON);
```

## Best Practices for Content Sanitization

> **Remember: Sanitization is not a one-size-fits-all solution. You need to understand the context where data will be used and apply appropriate sanitization techniques.**

Here are the key principles to follow:

1. **Validate First, Sanitize Second** : Always check if data meets your expected format before sanitizing
2. **Use Whitelisting Over Blacklisting** : Allow only known good patterns instead of blocking known bad ones
3. **Apply Principle of Least Privilege** : Only allow the minimum necessary HTML tags and attributes
4. **Context Matters** : Use different sanitization methods based on where the data will be used
5. **Keep Libraries Updated** : Security libraries need regular updates to handle new threats

## Testing Your Sanitization

Here's how to test your sanitization functions:

```javascript
// test-sanitization.js
function testSanitization(sanitizer) {
    const testCases = [
        {
            name: 'XSS Script Tag',
            input: '<script>alert("xss")</script>',
            expectedOutput: ''
        },
        {
            name: 'Valid HTML',
            input: '<p>Hello <strong>world</strong>!</p>',
            expectedOutput: '<p>Hello <strong>world</strong>!</p>'
        },
        {
            name: 'JavaScript URL',
            input: '<a href="javascript:alert(1)">Click me</a>',
            expectedOutput: '<a>Click me</a>' // href should be removed
        }
    ];
  
    testCases.forEach(test => {
        const result = sanitizer.sanitizeHTML(test.input);
        console.log(`Test: ${test.name}`);
        console.log(`Input: ${test.input}`);
        console.log(`Output: ${result}`);
        console.log(`Expected: ${test.expectedOutput}`);
        console.log(`Passed: ${result === test.expectedOutput}\n`);
    });
}

// Run tests
const sanitizer = new ContentSanitizer();
testSanitization(sanitizer);
```

## Summary and Key Takeaways

Content sanitization in Node.js is a multi-layered defense strategy that includes:

1. **Input Validation** : Checking data format before processing
2. **HTML Sanitization** : Using libraries like DOMPurify for safe HTML
3. **URL Sanitization** : Validating and restricting URL schemes and domains
4. **SQL Injection Prevention** : Using parameterized queries
5. **Context-Aware Sanitization** : Applying different techniques based on usage context

> **Final Thought: Security is a journey, not a destination. Always stay updated with the latest security practices and regularly audit your sanitization implementations.**

Remember, no sanitization is perfect, but following these principles and techniques will significantly improve your application's security posture against common attack vectors.
