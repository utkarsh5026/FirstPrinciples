# Understanding AWS API Gateway: REST API vs HTTP API vs WebSocket API

Let me take you through a comprehensive journey of understanding these three API types in AWS API Gateway, starting from the absolute fundamentals.

## What is an API Gateway?

> **Core Principle** : An API Gateway is like a  **doorman for your backend services** . Just as a doorman controls who enters a building, checks credentials, and directs visitors to the right floor, an API Gateway controls how clients access your backend services, handles authentication, and routes requests to the appropriate destinations.

Before diving into the specific types, let's understand what AWS API Gateway fundamentally does:

**AWS API Gateway** is a fully managed service that acts as a "front door" for applications to access data, business logic, or functionality from your backend services. Think of it as a sophisticated traffic controller that:

* Receives incoming requests from clients (web apps, mobile apps, other services)
* Validates and transforms these requests
* Routes them to the appropriate backend services
* Processes the responses and sends them back to clients

## Understanding HTTP: The Foundation

> **First Principle** : All three API types (REST, HTTP, WebSocket) in AWS API Gateway are built on top of the  **HTTP protocol** . HTTP (Hypertext Transfer Protocol) is like a standardized language that computers use to communicate over the internet.

### HTTP Request-Response Cycle

```javascript
// Basic HTTP request structure
GET /users/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer your-token-here
Content-Type: application/json
```

**What's happening here?**

* `GET` is the HTTP method (like saying "I want to retrieve something")
* `/users/123` is the path (like an address within the building)
* `HTTP/1.1` specifies the protocol version
* Headers provide additional metadata about the request

## REST API in AWS API Gateway

### Understanding REST from First Principles

> **REST (Representational State Transfer)** is not a protocol or technology—it's an **architectural style** or set of principles for designing web APIs. Think of REST like architectural blueprints for building a house: they provide guidelines and best practices, but you still need to use actual materials (HTTP) to build it.

### Core REST Principles

**1. Resource-Based URLs**
Everything in REST is treated as a "resource" with a unique identifier:

```javascript
// Each URL represents a specific resource
GET /users          // Collection of users
GET /users/123      // Specific user with ID 123
GET /users/123/posts // Posts belonging to user 123
```

**2. HTTP Methods Map to Actions**

```javascript
// CRUD operations using HTTP methods
POST   /users      // Create a new user
GET    /users/123  // Read user data
PUT    /users/123  // Update entire user
PATCH  /users/123  // Update specific user fields
DELETE /users/123  // Delete user
```

### AWS REST API Implementation

Here's how you'd create a simple REST API in AWS:

```python
# Lambda function for handling user operations
import json
import boto3

def lambda_handler(event, context):
    # Extract HTTP method and path from API Gateway event
    http_method = event['httpMethod']
    resource_path = event['resource']
    path_parameters = event.get('pathParameters', {})
  
    # Route based on HTTP method and path
    if http_method == 'GET' and resource_path == '/users/{id}':
        user_id = path_parameters['id']
        return get_user(user_id)
    elif http_method == 'POST' and resource_path == '/users':
        user_data = json.loads(event['body'])
        return create_user(user_data)
  
    return {
        'statusCode': 404,
        'body': json.dumps({'error': 'Resource not found'})
    }

def get_user(user_id):
    # Simulate database lookup
    user = {
        'id': user_id,
        'name': 'John Doe',
        'email': 'john@example.com'
    }
  
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(user)
    }
```

**Code Explanation:**

* The `event` parameter contains all the information about the incoming HTTP request
* We extract the HTTP method (`GET`, `POST`, etc.) to determine what action to take
* Path parameters (like the user ID in `/users/123`) are available in `pathParameters`
* The response must include `statusCode`, `headers`, and `body` to properly format the HTTP response

### REST API Features in AWS API Gateway

```yaml
# CloudFormation template for REST API
Resources:
  UserApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: UserManagementAPI
      Description: REST API for user management
    
  UsersResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref UserApi
      ParentId: !GetAtt UserApi.RootResourceId
      PathPart: users
    
  UserResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref UserApi
      ParentId: !Ref UsersResource
      PathPart: '{id}'  # This creates the /users/{id} path
```

**What this configuration does:**

* Creates a REST API called "UserManagementAPI"
* Sets up the resource hierarchy: `/users` and `/users/{id}`
* The `{id}` syntax creates a path parameter that can capture dynamic values

## HTTP API in AWS API Gateway

### Understanding HTTP API vs REST API

> **Key Insight** : AWS HTTP API is like REST API's  **younger, faster sibling** . It provides the same core HTTP functionality but with less features, better performance, and lower cost.

Think of it this way:

* **REST API** = Full-featured luxury car (more features, higher cost, slightly slower)
* **HTTP API** = Sports car (fewer features, lower cost, much faster)

### HTTP API Implementation

```python
# Same Lambda function works with HTTP API
def lambda_handler(event, context):
    # HTTP API event structure is slightly different
    http_method = event['requestContext']['http']['method']
    raw_path = event['requestContext']['http']['path']
  
    # HTTP API provides cleaner event structure
    if http_method == 'GET' and '/users/' in raw_path:
        user_id = raw_path.split('/users/')[1]
        return get_user_http_api(user_id)
  
    return {
        'statusCode': 404,
        'body': json.dumps({'error': 'Not found'})
    }

def get_user_http_api(user_id):
    # HTTP API response format is simpler
    return {
        'statusCode': 200,
        'body': json.dumps({
            'id': user_id,
            'name': 'Jane Doe',
            'email': 'jane@example.com'
        })
    }
```

**Key Differences in Code:**

* HTTP API event structure uses `requestContext.http.method` instead of `httpMethod`
* Path handling is slightly different but more intuitive
* Response format is simpler (headers are optional in many cases)

### Creating HTTP API with AWS CDK

```typescript
import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

// Create HTTP API (much simpler than REST API)
const httpApi = new HttpApi(this, 'UserHttpApi', {
  apiName: 'user-http-api',
  description: 'HTTP API for user management',
  
  // CORS configuration is built-in and simple
  corsPreflight: {
    allowOrigins: ['*'],
    allowMethods: [HttpMethod.GET, HttpMethod.POST],
    allowHeaders: ['Content-Type', 'Authorization']
  }
});

// Add route with Lambda integration
const getUserIntegration = new HttpLambdaIntegration(
  'GetUserIntegration',
  getUserLambda
);

httpApi.addRoutes({
  path: '/users/{id}',
  methods: [HttpMethod.GET],
  integration: getUserIntegration
});
```

**What makes this simpler:**

* One `HttpApi` construct instead of multiple REST API resources
* Built-in CORS support without complex configuration
* Direct route definition without separate resource creation

## WebSocket API in AWS API Gateway

### Understanding WebSockets from First Principles

> **Fundamental Difference** : HTTP APIs are like **sending letters** back and forth—each request gets one response, then the connection ends. WebSocket APIs are like having a  **phone conversation** —once connected, both sides can send messages at any time until someone hangs up.

### The WebSocket Handshake Process

```
Client Request:
GET /chat-websocket HTTP/1.1
Host: api.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-Version: 13

Server Response:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
```

**What's happening:**

1. Client sends an HTTP request asking to "upgrade" to WebSocket
2. Server agrees and "switches protocols"
3. Now both can send messages freely without request-response cycles

### WebSocket API Lambda Handler

```python
import json
import boto3

# WebSocket API requires handling different route types
def lambda_handler(event, context):
    route_key = event.get('requestContext', {}).get('routeKey')
    connection_id = event.get('requestContext', {}).get('connectionId')
  
    # WebSocket APIs have special route keys
    if route_key == '$connect':
        return handle_connect(connection_id)
    elif route_key == '$disconnect':
        return handle_disconnect(connection_id)
    elif route_key == 'sendMessage':
        return handle_send_message(event, connection_id)
  
    return {'statusCode': 400}

def handle_connect(connection_id):
    """Called when client establishes WebSocket connection"""
    print(f"Client {connection_id} connected")
  
    # Store connection ID in database for later use
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('WebSocketConnections')
  
    table.put_item(Item={
        'connectionId': connection_id,
        'timestamp': int(time.time())
    })
  
    return {'statusCode': 200}

def handle_send_message(event, connection_id):
    """Handle custom message from client"""
    message_data = json.loads(event.get('body', '{}'))
  
    # Send message to all connected clients
    api_gateway_management = boto3.client(
        'apigatewaymanagementapi',
        endpoint_url=f"https://{event['requestContext']['domainName']}/{event['requestContext']['stage']}"
    )
  
    # Broadcast message to all connections
    broadcast_message(api_gateway_management, message_data)
  
    return {'statusCode': 200}
```

**Code Breakdown:**

* WebSocket APIs use special routes: `$connect`, `$disconnect`, and custom routes
* `connection_id` uniquely identifies each WebSocket connection
* Messages can be sent to clients using the API Gateway Management API
* Connections persist until explicitly closed

### WebSocket Client Implementation

```javascript
// Client-side WebSocket connection
const ws = new WebSocket('wss://your-api-id.execute-api.region.amazonaws.com/prod');

ws.onopen = function(event) {
    console.log('Connected to WebSocket');
  
    // Send a message to the server
    ws.send(JSON.stringify({
        action: 'sendMessage',
        message: 'Hello from client!'
    }));
};

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Received message:', data);
  
    // Update UI with received message
    displayMessage(data.message);
};

ws.onclose = function(event) {
    console.log('WebSocket connection closed');
};

ws.onerror = function(error) {
    console.error('WebSocket error:', error);
};

// Function to send messages
function sendMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            action: 'sendMessage',
            message: message
        }));
    }
}
```

**Client Code Explanation:**

* `WebSocket()` constructor establishes the connection
* Event handlers respond to connection lifecycle events
* Messages are sent as JSON strings and parsed when received
* Connection state is checked before sending messages

## Detailed Comparison

### Performance Comparison

```
Performance Metrics (AWS Documentation):
┌─────────────────┬────────────┬─────────────┬──────────────┐
│ API Type        │ Latency    │ Throughput  │ Cost         │
├─────────────────┼────────────┼─────────────┼──────────────┤
│ REST API        │ ~100-300ms │ 10,000 RPS  │ Higher       │
│ HTTP API        │ ~50-100ms  │ 100,000 RPS │ 70% cheaper  │
│ WebSocket API   │ ~10-50ms   │ 100,000 con │ Connection   │
│                 │            │             │ based        │
└─────────────────┴────────────┴─────────────┴──────────────┘
```

### Feature Comparison Matrix

> **Decision Framework** : Choose based on your specific needs, not just features. More features don't always mean better—sometimes simplicity wins.

```
Feature Comparison:
┌────────────────────────┬──────────┬──────────┬─────────────┐
│ Feature                │ REST API │ HTTP API │ WebSocket   │
├────────────────────────┼──────────┼──────────┼─────────────┤
│ Request Validation     │    ✅     │    ❌     │     ❌       │
│ Request Transformation │    ✅     │    ❌     │     ❌       │
│ Caching               │    ✅     │    ❌     │     ❌       │
│ API Keys              │    ✅     │    ✅     │     ❌       │
│ Usage Plans           │    ✅     │    ❌     │     ❌       │
│ Built-in CORS         │    ❌     │    ✅     │     N/A     │
│ JWT Authorization     │    ✅     │    ✅     │     ✅       │
│ Real-time Communication│   ❌     │    ❌     │     ✅       │
│ Bi-directional        │    ❌     │    ❌     │     ✅       │
└────────────────────────┴──────────┴──────────┴─────────────┘
```

### Cost Analysis Example

```python
# Cost calculation example for 1 million requests
def calculate_monthly_costs():
    requests_per_month = 1_000_000
  
    # REST API pricing
    rest_api_cost = requests_per_month * 0.0000035  # $3.50 per million
  
    # HTTP API pricing  
    http_api_cost = requests_per_month * 0.000001   # $1.00 per million
  
    # WebSocket API pricing (connection minutes)
    # Assuming average 10 minutes per connection, 10,000 connections
    websocket_cost = 10_000 * 10 * 0.0001          # $0.0001 per minute
  
    print(f"REST API: ${rest_api_cost:.2f}")
    print(f"HTTP API: ${http_api_cost:.2f}")  
    print(f"WebSocket API: ${websocket_cost:.2f}")

# Output:
# REST API: $3.50
# HTTP API: $1.00
# WebSocket API: $10.00
```

## Use Case Examples

### When to Use REST API

> **Perfect for** : Traditional web applications that need robust API management features

```python
# E-commerce API example - needs request validation and caching
class EcommerceRestAPI:
    def get_product(self, product_id):
        # REST API provides built-in caching
        # Request validation ensures product_id is valid
        # Usage plans can limit API calls per customer
      
        product = {
            'id': product_id,
            'name': 'Wireless Headphones',
            'price': 99.99,
            'cache_ttl': 300  # 5 minutes
        }
        return product
```

### When to Use HTTP API

> **Perfect for** : Modern serverless applications that prioritize speed and cost

```python
# Microservice API - needs speed and simplicity
class UserMicroservice:
    def authenticate_user(self, jwt_token):
        # HTTP API has built-in JWT validation
        # No need for complex request transformation
        # 70% cheaper than REST API
      
        user = validate_jwt(jwt_token)
        return {
            'user_id': user.id,
            'permissions': user.permissions
        }
```

### When to Use WebSocket API

> **Perfect for** : Real-time applications where immediate communication is essential

```python
# Real-time chat application
class ChatApplication:
    def handle_message(self, event):
        # WebSocket maintains persistent connection
        # Can send messages immediately to all users
        # No polling required
      
        message = {
            'user': event['user'],
            'text': event['message'],
            'timestamp': time.time()
        }
      
        # Broadcast to all connected users instantly
        self.broadcast_to_all_users(message)
```

## Making the Right Choice

### Decision Tree

```
Start Here: What type of communication do you need?

Real-time, bi-directional?
├─ YES → WebSocket API
│   └─ Examples: Chat, Gaming, Live Updates
│
└─ NO → Request-Response Pattern
    │
    ├─ Need advanced API management?
    │   ├─ YES → REST API
    │   │   └─ Examples: Public APIs, Complex Business Logic
    │   │
    │   └─ NO → HTTP API
    │       └─ Examples: Simple CRUD, Microservices
```

> **Final Principle** : The best API type is the one that solves your specific problem with the least complexity and cost. Don't over-engineer when simplicity will do.

Each API type serves different purposes in the AWS ecosystem. REST API provides comprehensive features for complex scenarios, HTTP API offers speed and cost-effectiveness for modern applications, and WebSocket API enables real-time communication. Understanding these fundamentals helps you make informed architectural decisions for your applications.
