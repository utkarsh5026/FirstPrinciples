# Request/Response Transformation and Mapping in AWS API Gateway

Let me take you through the fascinating world of API Gateway transformations from the very beginning, building each concept step by step.

## Understanding the Foundation: What is an API Gateway?

Before we dive into transformations, let's establish the fundamental concept. Imagine you're running a restaurant:

* **Your kitchen** = Your backend services (Lambda functions, EC2 instances, databases)
* **Your waiters** = API Gateway
* **Your customers** = Client applications (web apps, mobile apps, other services)

> **Core Principle** : API Gateway acts as a intelligent intermediary that doesn't just pass messages back and forth - it can modify, validate, and transform these messages to make communication smoother between different systems.

## The Fundamental Problem: Format Mismatches

In the real world, different systems speak different "languages." Consider this scenario:

**Client sends:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "age": 25
}
```

**But your backend expects:**

```json
{
  "user_name": "John Doe",
  "user_age": 25,
  "created_timestamp": "2024-01-15T10:30:00Z"
}
```

> **The Challenge** : Without transformation, you'd need to modify either your client applications or your backend services every time there's a format mismatch. This creates tight coupling and maintenance nightmares.

## First Principles: The Transformation Pipeline

API Gateway processes every request and response through a transformation pipeline. Let's understand this step by step:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │────│   Request   │────│   Backend   │────│  Response   │
│ Application │    │Transform    │    │   Service   │    │ Transform   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                                      │
                          ├─ Headers                             │
                          ├─ Query Params                       │
                          ├─ Path Params                        │
                          └─ Body                               │
                                                                │
                                                     ┌─────────────┐
                                                     │   Headers   │
                                                     ├─ Status     │
                                                     └─ Body       │
```

## Understanding Mapping Templates: The Heart of Transformation

Mapping templates are written in  **Apache Velocity Template Language (VTL)** . Think of VTL as a simple programming language specifically designed for text transformation.

### Basic VTL Syntax from First Principles

Let's start with the absolute basics:

**1. Variables and References**

```vtl
## This is a comment in VTL
## $input refers to the incoming request
## $input.body gives you the request body
$input.body
```

**2. Accessing JSON Properties**

```vtl
## If input body is {"name": "John", "age": 25}
## You can access properties using dot notation
{
  "userName": "$input.json('$.name')",
  "userAge": $input.json('$.age')
}
```

> **Important Note** : Notice the difference - strings need quotes, numbers don't. VTL is type-aware.

### The $input Object: Your Swiss Army Knife

The `$input` object is your primary tool for accessing request data. Let's break down its components:

```vtl
## Access the raw body as string
$input.body

## Parse JSON and extract specific paths
$input.json('$.propertyName')

## Access query parameters
$input.params('queryParamName')

## Get path parameters  
$input.params('pathParamName')

## Access headers
$input.params().header.get('HeaderName')
```

## Practical Example 1: Basic Request Transformation

Let's build a real transformation step by step. Imagine you have a user registration API:

**Client sends this:**

```json
{
  "first_name": "Alice",
  "last_name": "Smith", 
  "email": "alice@example.com",
  "birth_year": 1990
}
```

**Your Lambda function expects this:**

```json
{
  "fullName": "Alice Smith",
  "emailAddress": "alice@example.com", 
  "age": 34,
  "registrationTime": "2024-06-13T10:30:00Z"
}
```

**The Mapping Template:**

```vtl
{
  "fullName": "$input.json('$.first_name') $input.json('$.last_name')",
  "emailAddress": "$input.json('$.email')",
  "age": #set($currentYear = 2024)$math.sub($currentYear, $input.json('$.birth_year')),
  "registrationTime": "$context.requestTime"
}
```

**Let me explain each line:**

1. `"fullName": "$input.json('$.first_name') $input.json('$.last_name')"` - We're concatenating first and last names with a space
2. `"emailAddress": "$input.json('$.email')"` - Direct mapping with a different key name
3. `#set($currentYear = 2024)` - We set a variable (this is a VTL directive)
4. `$math.sub($currentYear, $input.json('$.birth_year'))` - Calculate age using VTL's math utilities
5. `"$context.requestTime"` - Use API Gateway's context to add timestamp

> **Key Learning** : VTL allows you to not just map fields, but perform calculations, concatenations, and access contextual information.

## The Context Object: Gateway Intelligence

The `$context` object provides metadata about the request:

```vtl
{
  "requestId": "$context.requestId",
  "timestamp": "$context.requestTime", 
  "sourceIp": "$context.identity.sourceIp",
  "userAgent": "$context.identity.userAgent",
  "httpMethod": "$context.httpMethod",
  "resourcePath": "$context.resourcePath"
}
```

## Practical Example 2: Response Transformation

Response transformation works in reverse. Your backend returns data, and you transform it for the client.

**Lambda returns:**

```json
{
  "user_id": "12345",
  "user_data": {
    "full_name": "Bob Johnson",
    "email_addr": "bob@example.com",
    "account_balance": 1250.75
  },
  "last_login": "2024-06-10T14:30:00Z"
}
```

**Client expects:**

```json
{
  "id": "12345",
  "name": "Bob Johnson", 
  "email": "bob@example.com",
  "balance": "$1,250.75",
  "lastSeen": "4 days ago"
}
```

**Response Mapping Template:**

```vtl
{
  "id": "$input.json('$.user_id')",
  "name": "$input.json('$.user_data.full_name')",
  "email": "$input.json('$.user_data.email_addr')",
  "balance": "$${input.json('$.user_data.account_balance')}",
  "lastSeen": "$input.json('$.last_login')"
}
```

## Advanced Transformations: Conditional Logic

VTL supports conditional logic for complex transformations:

```vtl
{
  "userName": "$input.json('$.name')",
  "status": #if($input.json('$.age') >= 18)"adult"#else"minor"#end,
  "permissions": [
    #if($input.json('$.role') == "admin")
      "read", "write", "delete"
    #else
      "read"
    #end
  ]
}
```

**Explanation:**

* `#if` starts a conditional block
* `#else` provides alternative logic
* `#end` closes the conditional
* You can compare values and generate different outputs

## Handling Arrays and Loops

Real-world APIs often deal with arrays. Here's how VTL handles them:

**Input:**

```json
{
  "users": [
    {"name": "Alice", "role": "admin"},
    {"name": "Bob", "role": "user"},
    {"name": "Charlie", "role": "user"}
  ]
}
```

**Transformation:**

```vtl
{
  "totalUsers": $input.json('$.users').size(),
  "userList": [
    #foreach($user in $input.json('$.users'))
      {
        "displayName": "$user.name",
        "isAdmin": #if($user.role == "admin")true#else false#end
      }#if($foreach.hasNext),#end
    #end
  ]
}
```

**Breaking it down:**

* `$input.json('$.users').size()` gets array length
* `#foreach` loops through array elements
* `$foreach.hasNext` helps with comma placement
* Each iteration can access properties of the current element

## Error Handling and Validation

> **Critical Concept** : Always handle cases where expected data might be missing.

```vtl
{
  "userName": #if($input.json('$.name'))"$input.json('$.name')"#else"Unknown User"#end,
  "email": #if($input.json('$.email') && $input.json('$.email') != "")"$input.json('$.email')"#else null#end
}
```

## Content-Type Transformations

API Gateway can transform between different content types:

**From Form Data to JSON:**

```vtl
## Input: name=John&age=25&email=john@example.com
{
  "name": "$input.params('name')",
  "age": $input.params('age'),
  "email": "$input.params('email')"
}
```

**From XML to JSON:**

```vtl
## Assuming XML input is parsed
{
  "customerName": "$input.path('//customer/name')",
  "orderId": "$input.path('//order/@id')"
}
```

## Integration-Specific Transformations

Different AWS services require different formats:

**For DynamoDB:**

```vtl
{
  "TableName": "Users",
  "Item": {
    "userId": {"S": "$input.json('$.id')"},
    "userName": {"S": "$input.json('$.name')"},
    "age": {"N": "$input.json('$.age')"}
  }
}
```

**For SNS:**

```vtl
{
  "TopicArn": "arn:aws:sns:us-east-1:123456789012:MyTopic",
  "Message": "{\"userId\": \"$input.json('$.id')\", \"action\": \"user_created\"}",
  "Subject": "New User Registration"
}
```

## Best Practices and Performance Considerations

> **Memory and Performance** : Keep transformations lightweight. Complex logic should be in your backend services, not in mapping templates.

**Good Practice:**

```vtl
{
  "id": "$input.json('$.userId')",
  "timestamp": "$context.requestTime"
}
```

**Avoid This:**

```vtl
## Don't do heavy computation in templates
{
  #foreach($i in [1..1000])
    ## Complex nested loops
  #end
}
```

## Debugging Transformations

Enable CloudWatch logging to see transformation results:

1. **API Gateway Console** → **Settings** → **CloudWatch log role ARN**
2. **Stage Settings** → **Logs** → Enable **Execution Logging**
3. Check CloudWatch logs for transformation output

> **Pro Tip** : Use `$input.body` temporarily in templates to see exact input format during development.

## Common Patterns and Use Cases

**1. Adding Metadata:**

```vtl
{
  "originalRequest": $input.json('$'),
  "metadata": {
    "processedAt": "$context.requestTime",
    "apiVersion": "v1.0",
    "requestId": "$context.requestId"
  }
}
```

**2. Field Renaming:**

```vtl
{
  "id": "$input.json('$.user_id')",
  "name": "$input.json('$.full_name')",
  "created": "$input.json('$.creation_timestamp')"
}
```

**3. Data Filtering:**

```vtl
{
  #foreach($item in $input.json('$.items'))
    #if($item.status == "active")
      "$item.id": {
        "name": "$item.name",
        "value": $item.value
      }#if($foreach.hasNext),#end
    #end
  #end
}
```

Request/response transformation in API Gateway is a powerful tool that enables loose coupling between clients and backends. By mastering these concepts, you can build flexible APIs that adapt to changing requirements without forcing changes across your entire system architecture.

The key is understanding that transformations should be used for format adaptation and light processing, while keeping heavy business logic in your backend services where it belongs.
