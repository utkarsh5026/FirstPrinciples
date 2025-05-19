# Understanding API Gateway Integration Patterns in AWS

I'll explore API Gateway integration patterns in AWS from first principles, explaining how these essential components connect your API endpoints to backend services.

> Think of API Gateway as a doorman for your application—it receives all visitors (requests), checks their credentials, enforces house rules, and guides them to the right room (backend service).

## Core Concepts: What is API Gateway?

API Gateway in AWS is a fully managed service that enables developers to create, publish, maintain, monitor, and secure APIs at any scale. Before diving into integration patterns, let's understand what API Gateway fundamentally does:

1. It acts as the "front door" to your application
2. It handles authentication and authorization
3. It manages traffic (throttling, quotas)
4. It transforms requests and responses
5. It enables monitoring and logging

API Gateway sits between clients (users, applications, services) and your backend services, providing a unified entry point while decoupling the client from your implementation details.

## Integration Types: The Foundation of API Gateway Patterns

AWS API Gateway offers several fundamental integration types that determine how your API connects to backend services:

### 1. Lambda Integration (Lambda Proxy and Lambda Non-Proxy)

This integration connects your API endpoints to AWS Lambda functions.

#### Lambda Proxy Integration

In Lambda Proxy integration, API Gateway passes the entire HTTP request as-is to your Lambda function, including headers, query parameters, path parameters, body, and context.

```javascript
// Example Lambda function for proxy integration
exports.handler = async (event, context) => {
  // The 'event' contains the complete HTTP request
  console.log('Request headers:', event.headers);
  console.log('Query parameters:', event.queryStringParameters);
  console.log('Path parameters:', event.pathParameters);
  console.log('Body:', event.body);
  
  // Return response in this specific format
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Hello from Lambda!',
      input: event
    })
  };
};
```

The Lambda function must return a response in a specific format that API Gateway can understand, with statusCode, headers, and body.

> Think of Lambda Proxy integration like handing an entire package to someone without opening it. The recipient (Lambda) gets everything and is responsible for unpacking it and deciding what to do.

#### Lambda Non-Proxy Integration (Custom Integration)

With Lambda Non-Proxy integration, you configure mapping templates in API Gateway to transform the request before sending it to Lambda and to transform the response from Lambda before returning it to the client.

```javascript
// Example Lambda function for non-proxy integration
exports.handler = async (event, context) => {
  // The 'event' contains only what was defined in the mapping template
  console.log('Received event:', event);
  
  // Return just the data - API Gateway will handle formatting
  return {
    greeting: 'Hello, world!',
    timestamp: new Date().toISOString()
  };
};
```

The API Gateway uses Velocity Template Language (VTL) to define these mappings:

```
## Request mapping template example
{
  "name": "$input.params('name')",
  "age": $input.params('age')
}

## Response mapping template example
{
  "message": "$input.path('$.greeting')",
  "time": "$input.path('$.timestamp')"
}
```

> Imagine Lambda Non-Proxy integration as a mail room that opens packages, takes only what's needed, repackages it, and then delivers just the essential items to their destination.

### 2. HTTP Integration (HTTP Proxy and HTTP Custom)

This integration type connects your API Gateway to HTTP endpoints like web servers, REST APIs, or application load balancers.

#### HTTP Proxy Integration

Similar to Lambda Proxy, HTTP Proxy passes the entire request to your HTTP endpoint and returns the response directly to the client.

```yaml
# API Gateway configuration example (pseudocode)
Resource: /products
  Method: GET
    Integration:
      Type: HTTP_PROXY
      URI: http://mybackend.example.com/products
      IntegrationHTTPMethod: GET
```

> HTTP Proxy is like a transparent corridor—requests walk straight through API Gateway to your HTTP backend with minimal interference.

#### HTTP Custom Integration

Like Lambda Non-Proxy, HTTP Custom integration lets you use mapping templates to transform requests and responses between your API Gateway and the HTTP endpoint.

```yaml
# API Gateway configuration example (pseudocode)
Resource: /orders
  Method: POST
    Integration:
      Type: HTTP
      URI: http://orderservice.example.com/create
      IntegrationHTTPMethod: POST
      RequestTemplates:
        application/json: |
          {
            "orderData": $input.json('$'),
            "userId": "$context.authorizer.userId"
          }
      ResponseTemplates:
        application/json: |
          {
            "orderId": $input.json('$.id'),
            "status": $input.json('$.status'),
            "message": "Order created successfully"
          }
```

> HTTP Custom integration is like having a translator who understands both languages and can rephrase your message to make it clearer for the recipient.

### 3. AWS Service Integration

This integration connects API Gateway directly to other AWS services like DynamoDB, S3, SQS, etc., without requiring a Lambda function in the middle.

```yaml
# API Gateway direct integration with DynamoDB (pseudocode)
Resource: /items
  Method: GET
    Integration:
      Type: AWS
      URI: arn:aws:apigateway:region:dynamodb:action/Scan
      IntegrationHTTPMethod: POST
      Credentials: arn:aws:iam::account-id:role/role-name
      RequestTemplates:
        application/json: |
          {
            "TableName": "Items"
          }
```

> AWS Service integration is like having a direct phone line to another department within the same company—you can communicate directly without going through intermediaries.

### 4. Mock Integration

This integration doesn't connect to any backend but returns mock responses directly from API Gateway.

```yaml
# API Gateway mock integration example (pseudocode)
Resource: /test
  Method: GET
    Integration:
      Type: MOCK
      RequestTemplates:
        application/json: |
          {
            "statusCode": 200
          }
      ResponseTemplates:
        application/json: |
          {
            "message": "This is a mock response",
            "timestamp": "$context.requestTime"
          }
```

> Think of Mock integration as a rehearsal with stand-ins—useful for testing how the system works without involving real actors.

## Advanced Integration Patterns

Now that we understand the basic integration types, let's explore more complex patterns that solve specific architectural challenges.

### 1. API Gateway with Multiple Backend Services (Microservices Pattern)

This pattern uses API Gateway as a single entry point for a microservices architecture, routing different endpoints to different services.

```
Client → API Gateway → /users → User Service
                     → /orders → Order Service
                     → /products → Product Service
```

Example implementation:

```yaml
# API Gateway configuration (pseudocode)
Resources:
  /users:
    GET:
      Integration:
        Type: HTTP_PROXY
        URI: http://user-service.example.com/users
      
  /orders:
    GET:
      Integration:
        Type: Lambda_PROXY
        URI: arn:aws:lambda:region:account:function:order-function
      
  /products:
    GET:
      Integration:
        Type: AWS
        URI: arn:aws:apigateway:region:dynamodb:action/Scan
        RequestTemplates:
          application/json: |
            {
              "TableName": "Products"
            }
```

> This pattern is like a hotel concierge who knows exactly which department handles each type of request, directing guests to room service, housekeeping, or the front desk as needed.

### 2. API Gateway with Service Discovery (Dynamic Backend Routing)

In this pattern, API Gateway uses AWS Lambda to implement service discovery, dynamically determining which backend service to call based on the request.

```javascript
// Lambda function that implements service discovery
exports.handler = async (event, context) => {
  // Determine which service to call based on the request
  const path = event.path;
  let serviceUrl;
  
  if (path.startsWith('/users')) {
    serviceUrl = await lookupService('user-service');
  } else if (path.startsWith('/orders')) {
    serviceUrl = await lookupService('order-service');
  } else {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Service not found' })
    };
  }
  
  // Call the service and return the response
  const response = await callService(serviceUrl, event);
  return response;
};

// Helper function to look up service in service registry
async function lookupService(serviceName) {
  // This could use AWS Cloud Map, a database, or other registry
  const services = {
    'user-service': 'http://user-service.example.com',
    'order-service': 'http://order-service.example.com'
  };
  
  return services[serviceName];
}
```

> This pattern resembles a receptionist who doesn't just know where each department is located but also checks a directory that's updated in real-time as departments move offices.

### 3. API Gateway with Fan-out Pattern (Parallel Processing)

In this pattern, a single API request triggers multiple parallel backend operations, with results aggregated before returning to the client.

```javascript
// Lambda function implementing fan-out pattern
exports.handler = async (event, context) => {
  // Parse the user ID from the request
  const userId = event.pathParameters.userId;
  
  // Make parallel requests to different services
  const [userDetails, orderHistory, recommendations] = await Promise.all([
    getUserDetails(userId),
    getOrderHistory(userId),
    getRecommendations(userId)
  ]);
  
  // Aggregate the results
  const response = {
    userDetails,
    orderHistory,
    recommendations
  };
  
  // Return the aggregated response
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(response)
  };
};
```

> The fan-out pattern is like a project manager who assigns different tasks to team members simultaneously, then compiles all their work into a single report.

### 4. API Gateway with Content-Based Routing

This pattern uses the content of the request (not just the URL) to determine which backend service to invoke.

```javascript
// Lambda function implementing content-based routing
exports.handler = async (event, context) => {
  // Parse the request body
  const body = JSON.parse(event.body);
  
  // Route based on the content type
  if (body.type === 'urgent') {
    return await routeToHighPriorityProcessor(body);
  } else if (body.type === 'batch') {
    return await routeToBatchProcessor(body);
  } else {
    return await routeToStandardProcessor(body);
  }
};
```

> Content-based routing is like having a mail sorter who doesn't just look at the address on the envelope but opens it to check the content before deciding how to route it.

### 5. API Gateway with Throttling and Quota Management

This pattern uses API Gateway's built-in throttling and quota features to protect backend services from overload.

```yaml
# API Gateway usage plan configuration (pseudocode)
UsagePlan:
  Name: "Basic"
  Throttle:
    RateLimit: 10
    BurstLimit: 20
  Quota:
    Limit: 1000
    Period: DAY
  ApiStages:
    - ApiId: api-id
      Stage: prod
    
ApiKey:
  Name: "Customer-A"
  UsagePlanIds:
    - "Basic"
```

> This pattern works like a nightclub bouncer who ensures the venue doesn't exceed capacity, letting people in at a controlled rate and tracking the total count.

## Implementation Details: Mapping Templates

Mapping templates are a crucial part of non-proxy integrations. They use Velocity Template Language (VTL) to transform requests and responses.

### Request Mapping Template Example

```
#set($inputRoot = $input.path('$'))

{
  "operation": "PutItem",
  "TableName": "Users",
  "Item": {
    "id": {
      "S": "$context.requestId"
    },
    "username": {
      "S": "$inputRoot.username"
    },
    "email": {
      "S": "$inputRoot.email"
    },
    "createdAt": {
      "S": "$context.requestTime"
    }
  }
}
```

This template transforms an API request into a DynamoDB PutItem operation.

### Response Mapping Template Example

```
#set($inputRoot = $input.path('$'))

{
  "userId": "$inputRoot.Item.id.S",
  "profile": {
    "username": "$inputRoot.Item.username.S",
    "email": "$inputRoot.Item.email.S"
  },
  "metadata": {
    "createdAt": "$inputRoot.Item.createdAt.S"
  }
}
```

This template transforms a DynamoDB response into a cleaner JSON structure for the client.

> Mapping templates are like translators who not only speak both languages but can restructure sentences to follow each language's natural patterns and conventions.

## Security Patterns for API Gateway Integrations

### 1. API Gateway with Cognito User Pools

This pattern secures API endpoints using Amazon Cognito User Pools for authentication.

```yaml
# API Gateway with Cognito authorizer (pseudocode)
Resources:
  /private:
    GET:
      Authorization:
        Type: COGNITO_USER_POOLS
        ProviderARNs:
          - arn:aws:cognito-idp:region:account-id:userpool/user-pool-id
      Integration:
        Type: Lambda_PROXY
        URI: arn:aws:lambda:region:account:function:private-function
```

> This pattern is like having a security guard who checks visitor IDs against a centralized database before allowing entry.

### 2. API Gateway with Lambda Authorizer (Custom Authorization)

This pattern uses a Lambda function to implement custom authorization logic.

```javascript
// Lambda authorizer function
exports.handler = async (event, context) => {
  // Extract token from the request
  const token = event.authorizationToken;
  
  try {
    // Verify the token (custom logic here)
    const claims = verifyToken(token);
  
    // Generate IAM policy based on claims
    return generatePolicy(claims.sub, 'Allow', event.methodArn, claims);
  } catch (error) {
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

// Helper function to generate IAM policy
function generatePolicy(principalId, effect, resource, context) {
  const authResponse = {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    }
  };
  
  // Optional context passed to integration
  if (context) {
    authResponse.context = context;
  }
  
  return authResponse;
}
```

> Lambda authorizers are like having a specialized security consultant who applies complex rules to determine if someone should be granted access.

## Real-World Examples of Integration Patterns

Let's examine some common real-world scenarios and the integration patterns they typically use:

### 1. Public API for Mobile/Web Applications

```
Mobile App → API Gateway → Lambda → DynamoDB
                        ↘ Lambda → S3
```

This uses Lambda Proxy integration to provide a flexible interface for different client platforms.

### 2. Microservices Architecture

```
Clients → API Gateway → Service A (Lambda)
                      → Service B (ECS/Fargate)
                      → Service C (EC2/ALB)
```

This uses a mix of Lambda Proxy and HTTP Proxy integrations to connect to different service implementations.

### 3. Legacy System Integration

```
Clients → API Gateway → Lambda Adapter → SOAP/XML Legacy System
```

This uses Lambda Non-Proxy integration with mapping templates to transform between modern JSON and legacy XML formats.

### 4. Serverless Data Processing Pipeline

```
Clients → API Gateway → Lambda → SQS → Lambda → DynamoDB
```

This uses Lambda Proxy integration with AWS service integrations to build a scalable data processing pipeline.

## Performance Considerations

When implementing API Gateway integration patterns, consider these performance aspects:

1. **Caching** : API Gateway can cache responses to reduce load on backend services
2. **Request/Response Size Limits** : API Gateway has limits on payload sizes
3. **Timeout Settings** : Configure appropriate timeouts for backend integrations
4. **Cold Start** : Lambda functions may experience cold starts
5. **Regional Deployment** : Deploy API Gateway in the same region as backend services

Example API Gateway caching configuration:

```yaml
# API Gateway cache settings (pseudocode)
Stage:
  Name: prod
  CacheClusterEnabled: true
  CacheClusterSize: '0.5'  # Cache size in GB
  MethodSettings:
    - ResourcePath: /*
      HttpMethod: GET
      CachingEnabled: true
      CacheTtlInSeconds: 300
```

> Proper caching is like having a personal assistant who remembers answers to common questions, so you don't need to keep asking the expert repeatedly.

## Best Practices for API Gateway Integration Patterns

1. **Use Proxy Integration When Possible** : It's simpler and requires less maintenance
2. **Implement Circuit Breakers** : Protect backend services from cascading failures
3. **Implement Retry Logic** : Handle transient failures gracefully
4. **Use Stage Variables** : Make your integrations environment-aware
5. **Monitor and Log** : Set up CloudWatch logs and metrics for all integrations
6. **Version Your APIs** : Use API Gateway stages for versioning
7. **Implement Rate Limiting** : Protect your backends from traffic spikes

Example of using stage variables for environment-specific backends:

```yaml
# API Gateway configuration with stage variables (pseudocode)
Resources:
  /users:
    GET:
      Integration:
        Type: HTTP_PROXY
        URI: http://${stageVariables.backendUrl}/users
```

Then define different stage variables for each environment:

```
dev.backendUrl = api-dev.example.com
prod.backendUrl = api.example.com
```

> Stage variables are like having different maps for different regions, letting you navigate similar but distinct environments with the appropriate guidance.

## Troubleshooting Common Integration Issues

1. **CORS Issues** : Ensure you've configured CORS correctly for browser clients
2. **Authorization Failures** : Check IAM roles and policies for service integrations
3. **Mapping Template Errors** : Validate your VTL syntax
4. **Timeout Errors** : Adjust timeout settings or optimize backend performance
5. **Payload Size Limits** : Be aware of API Gateway's limits on request/response sizes

Example CORS configuration:

```yaml
# API Gateway CORS configuration (pseudocode)
Resources:
  /users:
    OPTIONS:
      Integration:
        Type: MOCK
        ResponseParameters:
          method.response.header.Access-Control-Allow-Headers: "'Content-Type,Authorization'"
          method.response.header.Access-Control-Allow-Methods: "'GET,POST,PUT,DELETE'"
          method.response.header.Access-Control-Allow-Origin: "'*'"
```

> Proper CORS configuration is like ensuring that visitors from different countries have the right visas to enter your building—essential for international operations.

## Conclusion

API Gateway integration patterns in AWS provide powerful ways to connect your API endpoints to various backend services. By understanding these patterns from first principles, you can design scalable, secure, and efficient APIs.

The key to mastering API Gateway integrations is to:

1. Start with the simplest integration type that meets your needs
2. Use mapping templates when transformation is required
3. Implement appropriate security controls
4. Consider performance implications
5. Follow best practices for deployment and monitoring

By applying these principles, you can build APIs that provide a consistent interface to clients while efficiently leveraging AWS's diverse backend services.
