# JSON over HTTP: API Communication from First Principles

Let me build up the concept of JSON over HTTP communication from the ground up, starting with why we need network communication and data exchange formats.

## Part 1: Understanding the Foundation

### What is HTTP Communication?

HTTP (HyperText Transfer Protocol) is fundamentally about **request-response communication** between computers over a network. Think of it like a conversation with very specific rules:

```
Client Computer                    Server Computer
     |                                   |
     |  "GET /users/123 HTTP/1.1"        |
     |---------------------------------> |
     |                                   |
     |  "HTTP/1.1 200 OK                 |
     |   Content-Type: application/json  |
     |   {"name": "Alice", "id": 123}"   |
     |<----------------------------------|
```

> **Key Mental Model** : HTTP is like ordering at a restaurant - you make a specific request (order), and the server responds with what you asked for (or explains why they can't fulfill it).

### Why JSON for Data Exchange?

Before JSON, data exchange was complex and inconsistent. JSON (JavaScript Object Notation) solved this by providing a **human-readable, language-independent** format that maps naturally to programming language data structures:

```python
# This Python dictionary...
user_data = {
    "name": "Alice",
    "age": 30,
    "hobbies": ["reading", "coding"],
    "active": True
}

# ...becomes this JSON string:
# '{"name": "Alice", "age": 30, "hobbies": ["reading", "coding"], "active": true}'
```

> **Python Philosophy Connection** : JSON's simplicity aligns perfectly with Python's "Simple is better than complex" principle. The mapping between Python objects and JSON is intuitive and predictable.

## Part 2: Python's urllib Module - HTTP from First Principles

### Understanding urllib's Design

Python's `urllib` is built on the philosophy of **progressive disclosure** - simple things should be simple, complex things should be possible:

```python
import urllib.request
import urllib.parse
import urllib.error

# The three main modules:
# urllib.request - for opening URLs
# urllib.parse - for working with URLs
# urllib.error - for handling HTTP errors
```

### Basic HTTP Request Pattern

Let's start with the most fundamental HTTP operation - a GET request:

```python
import urllib.request

# Step 1: Create a request object
# This is like preparing your order before going to the counter
url = "https://jsonplaceholder.typicode.com/users/1"
request = urllib.request.Request(url)

# Step 2: Open the URL and get a response
# This is like actually placing your order and waiting
try:
    response = urllib.request.urlopen(request)
  
    # Step 3: Read the response data
    # This is like receiving your order
    raw_data = response.read()  # Returns bytes
  
    print(f"Status Code: {response.getcode()}")
    print(f"Content Type: {response.headers['Content-Type']}")
    print(f"Raw Data Type: {type(raw_data)}")  # <class 'bytes'>
  
except urllib.error.URLError as e:
    print(f"Request failed: {e}")
```

> **Important** : `urllib.request.urlopen()` returns  **bytes** , not strings. This is because HTTP can transfer any type of data - images, videos, text in different encodings. Python makes you explicitly handle the conversion.

## Part 3: JSON Module - Parsing and Creating JSON

### The json Module Philosophy

Python's `json` module follows the principle of  **explicit is better than implicit** :

```python
import json

# Converting Python objects to JSON (serialization)
python_data = {"name": "Alice", "scores": [95, 87, 92]}

# Method 1: Convert to JSON string
json_string = json.dumps(python_data)
print(f"JSON String: {json_string}")
print(f"Type: {type(json_string)}")  # <class 'str'>

# Method 2: Write directly to file
with open('data.json', 'w') as f:
    json.dump(python_data, f)

# Converting JSON to Python objects (deserialization)
json_text = '{"name": "Bob", "age": 25}'

# Method 1: From JSON string
python_obj = json.loads(json_text)
print(f"Python Object: {python_obj}")
print(f"Type: {type(python_obj)}")  # <class 'dict'>

# Method 2: From file
with open('data.json', 'r') as f:
    loaded_data = json.load(f)
```

### JSON Type Mapping Understanding

```python
# Python to JSON mapping
python_to_json = {
    dict: "object",
    list: "array", 
    tuple: "array",  # Note: tuples become arrays!
    str: "string",
    int: "number",
    float: "number",
    True: "true",
    False: "false",
    None: "null"
}

# Example showing the mapping
data = {
    "text": "Hello",           # string
    "number": 42,             # number
    "decimal": 3.14,          # number
    "flag": True,             # true
    "empty": None,            # null
    "items": [1, 2, 3],       # array
    "coord": (10, 20)         # array (tuple becomes array!)
}

json_str = json.dumps(data)
print(json_str)
# {"text": "Hello", "number": 42, "decimal": 3.14, "flag": true, "empty": null, "items": [1, 2, 3], "coord": [10, 20]}
```

> **Common Gotcha** : Tuples become lists when converted to JSON. This is because JSON doesn't have a tuple type. When you parse the JSON back, you'll get lists, not tuples.

## Part 4: Combining urllib and json - The Complete Pattern

### Basic API Communication Pattern

Here's the fundamental pattern for JSON over HTTP:

```python
import urllib.request
import urllib.error
import json

def fetch_user_data(user_id):
    """
    Fetch user data from an API and return as Python dict.
  
    This function demonstrates the complete JSON over HTTP pattern.
    """
    # Step 1: Construct the URL
    base_url = "https://jsonplaceholder.typicode.com/users"
    url = f"{base_url}/{user_id}"
  
    # Step 2: Create the request
    request = urllib.request.Request(url)
  
    # Step 3: Add headers (important for APIs)
    request.add_header('Accept', 'application/json')
    request.add_header('User-Agent', 'Python-urllib/3.x')
  
    try:
        # Step 4: Make the HTTP request
        response = urllib.request.urlopen(request)
      
        # Step 5: Read and decode the response
        raw_data = response.read()  # bytes
        text_data = raw_data.decode('utf-8')  # string
      
        # Step 6: Parse JSON to Python object
        python_data = json.loads(text_data)
      
        return python_data
      
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        return None
    except urllib.error.URLError as e:
        print(f"URL Error: {e.reason}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        return None

# Usage
user = fetch_user_data(1)
if user:
    print(f"User: {user['name']}")
    print(f"Email: {user['email']}")
```

### Sending JSON Data (POST Requests)

```python
import urllib.request
import urllib.error
import json

def create_user(name, email):
    """
    Create a new user by sending JSON data to an API.
  
    This demonstrates sending JSON in a POST request.
    """
    url = "https://jsonplaceholder.typicode.com/users"
  
    # Step 1: Prepare the data
    user_data = {
        "name": name,
        "email": email,
        "username": name.lower().replace(" ", "")
    }
  
    # Step 2: Convert Python dict to JSON string
    json_data = json.dumps(user_data)
  
    # Step 3: Convert string to bytes (required for HTTP body)
    data_bytes = json_data.encode('utf-8')
  
    # Step 4: Create request with data
    request = urllib.request.Request(
        url, 
        data=data_bytes,  # This makes it a POST request
        method='POST'
    )
  
    # Step 5: Set appropriate headers
    request.add_header('Content-Type', 'application/json')
    request.add_header('Accept', 'application/json')
  
    try:
        # Step 6: Send the request
        response = urllib.request.urlopen(request)
      
        # Step 7: Process the response
        response_data = response.read().decode('utf-8')
        created_user = json.loads(response_data)
      
        print(f"Created user with ID: {created_user.get('id')}")
        return created_user
      
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        # Read error response if available
        if e.fp:
            error_body = e.fp.read().decode('utf-8')
            print(f"Error details: {error_body}")
        return None

# Usage
new_user = create_user("Jane Doe", "jane@example.com")
```

## Part 5: URL Construction and Query Parameters

### Safe URL Construction

```python
import urllib.parse

def search_users(name=None, email=None, limit=10):
    """
    Demonstrate proper URL construction with query parameters.
    """
    base_url = "https://api.example.com/users"
  
    # Method 1: Manual construction (NOT recommended)
    # Bad: url = f"{base_url}?name={name}&limit={limit}"  # Unsafe!
  
    # Method 2: Using urllib.parse (Pythonic way)
    params = {}
  
    # Only add parameters that have values
    if name:
        params['name'] = name
    if email:
        params['email'] = email
    if limit:
        params['limit'] = limit
  
    # Safely encode parameters
    query_string = urllib.parse.urlencode(params)
    full_url = f"{base_url}?{query_string}"
  
    print(f"Constructed URL: {full_url}")
    return full_url

# Examples
search_users(name="John Doe", limit=5)
# Constructed URL: https://api.example.com/users?name=John+Doe&limit=5

search_users(email="test@email.com")
# Constructed URL: https://api.example.com/users?email=test%40email.com&limit=10
```

> **Why urllib.parse is Essential** : URLs have strict character encoding rules. Spaces become `+`, `@` becomes `%40`, etc. Manual string concatenation will break with special characters.

## Part 6: Error Handling and HTTP Status Codes

### Comprehensive Error Handling

```python
import urllib.request
import urllib.error
import json

def robust_api_call(url, data=None, method='GET'):
    """
    A robust function that handles all common HTTP errors properly.
    """
    try:
        # Prepare request
        if data:
            if isinstance(data, dict):
                data = json.dumps(data).encode('utf-8')
            request = urllib.request.Request(url, data=data, method=method)
            request.add_header('Content-Type', 'application/json')
        else:
            request = urllib.request.Request(url, method=method)
      
        request.add_header('Accept', 'application/json')
      
        # Make request
        response = urllib.request.urlopen(request)
      
        # Check status code
        status_code = response.getcode()
        print(f"Status Code: {status_code}")
      
        # Read and parse response
        raw_data = response.read()
      
        # Handle empty responses
        if not raw_data:
            return None
          
        text_data = raw_data.decode('utf-8')
      
        # Try to parse as JSON
        try:
            return json.loads(text_data)
        except json.JSONDecodeError:
            # Return raw text if not valid JSON
            return text_data
          
    except urllib.error.HTTPError as e:
        # Handle specific HTTP errors
        status_code = e.code
      
        if status_code == 400:
            print("Bad Request - Check your data format")
        elif status_code == 401:
            print("Unauthorized - Check your API key")
        elif status_code == 404:
            print("Not Found - The resource doesn't exist")
        elif status_code == 500:
            print("Server Error - Try again later")
        else:
            print(f"HTTP Error {status_code}: {e.reason}")
      
        # Try to read error response
        try:
            error_data = e.read().decode('utf-8')
            error_json = json.loads(error_data)
            print(f"Error details: {error_json}")
        except:
            print(f"Raw error: {e.read()}")
          
        return None
      
    except urllib.error.URLError as e:
        print(f"Network Error: {e.reason}")
        return None
      
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

# Usage examples
result = robust_api_call("https://jsonplaceholder.typicode.com/users/1")
result = robust_api_call("https://httpbin.org/status/404")  # Will demonstrate 404 handling
```

## Part 7: Real-World API Client Example

### Building a Complete API Client Class

```python
import urllib.request
import urllib.parse
import urllib.error
import json
from typing import Optional, Dict, Any

class JSONAPIClient:
    """
    A reusable client for JSON APIs demonstrating best practices.
    """
  
    def __init__(self, base_url: str, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')  # Remove trailing slash
        self.api_key = api_key
        self.session_headers = {
            'Accept': 'application/json',
            'User-Agent': 'Python-JSONAPIClient/1.0'
        }
      
        if api_key:
            self.session_headers['Authorization'] = f'Bearer {api_key}'
  
    def _build_url(self, endpoint: str, params: Optional[Dict] = None) -> str:
        """Build complete URL with query parameters."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
      
        if params:
            # Remove None values
            clean_params = {k: v for k, v in params.items() if v is not None}
            if clean_params:
                query_string = urllib.parse.urlencode(clean_params)
                url = f"{url}?{query_string}"
      
        return url
  
    def _make_request(self, method: str, endpoint: str, 
                     data: Optional[Dict] = None, 
                     params: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request and return parsed JSON response."""
      
        url = self._build_url(endpoint, params)
        print(f"Making {method} request to: {url}")
      
        # Prepare request
        request_data = None
        if data:
            request_data = json.dumps(data).encode('utf-8')
      
        request = urllib.request.Request(url, data=request_data, method=method)
      
        # Add headers
        for header, value in self.session_headers.items():
            request.add_header(header, value)
      
        if request_data:
            request.add_header('Content-Type', 'application/json')
      
        try:
            response = urllib.request.urlopen(request)
            response_data = response.read().decode('utf-8')
          
            if response_data:
                return json.loads(response_data)
            return None
          
        except urllib.error.HTTPError as e:
            print(f"HTTP {e.code}: {e.reason}")
            try:
                error_data = e.read().decode('utf-8')
                error_json = json.loads(error_data)
                print(f"Error details: {error_json}")
            except:
                pass
            return None
          
        except urllib.error.URLError as e:
            print(f"Network error: {e.reason}")
            return None
          
        except json.JSONDecodeError as e:
            print(f"Invalid JSON response: {e}")
            return None
  
    def get(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Make GET request."""
        return self._make_request('GET', endpoint, params=params)
  
    def post(self, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
        """Make POST request."""
        return self._make_request('POST', endpoint, data=data)
  
    def put(self, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
        """Make PUT request."""
        return self._make_request('PUT', endpoint, data=data)
  
    def delete(self, endpoint: str) -> Optional[Dict]:
        """Make DELETE request."""
        return self._make_request('DELETE', endpoint)

# Usage example
if __name__ == "__main__":
    # Create client
    client = JSONAPIClient("https://jsonplaceholder.typicode.com")
  
    # GET request
    user = client.get("users/1")
    if user:
        print(f"User: {user['name']} ({user['email']})")
  
    # GET with parameters
    posts = client.get("posts", params={"userId": 1, "_limit": 3})
    if posts:
        print(f"Found {len(posts)} posts")
  
    # POST request
    new_post = {
        "title": "My New Post",
        "body": "This is the content of my post",
        "userId": 1
    }
  
    created_post = client.post("posts", data=new_post)
    if created_post:
        print(f"Created post with ID: {created_post.get('id')}")
```

## Part 8: Advanced Patterns and Best Practices

### Configuration and Environment Management

```python
import os
import json
from typing import Dict, Any

class APIConfig:
    """
    Configuration management for API clients.
    Demonstrates handling of sensitive data like API keys.
    """
  
    def __init__(self, config_file: str = None):
        self.config = {}
      
        # Load from file if provided
        if config_file and os.path.exists(config_file):
            with open(config_file, 'r') as f:
                self.config = json.load(f)
      
        # Override with environment variables
        self._load_from_environment()
  
    def _load_from_environment(self):
        """Load configuration from environment variables."""
        env_mappings = {
            'API_BASE_URL': 'base_url',
            'API_KEY': 'api_key',
            'API_TIMEOUT': 'timeout',
            'API_MAX_RETRIES': 'max_retries'
        }
      
        for env_var, config_key in env_mappings.items():
            value = os.getenv(env_var)
            if value:
                # Convert numeric values
                if config_key in ['timeout', 'max_retries']:
                    try:
                        value = int(value)
                    except ValueError:
                        pass
                self.config[config_key] = value
  
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value."""
        return self.config.get(key, default)
  
    def __repr__(self):
        # Don't expose sensitive data
        safe_config = {k: v for k, v in self.config.items() 
                      if 'key' not in k.lower() and 'secret' not in k.lower()}
        return f"APIConfig({safe_config})"

# Usage
config = APIConfig('api_config.json')
client = JSONAPIClient(
    base_url=config.get('base_url', 'https://api.example.com'),
    api_key=config.get('api_key')
)
```

### Retry Logic and Rate Limiting

```python
import time
import random
from typing import Optional, Dict, Callable

def with_retries(max_retries: int = 3, backoff_factor: float = 1.0):
    """
    Decorator to add retry logic to API calls.
    Demonstrates exponential backoff with jitter.
    """
    def decorator(func: Callable) -> Callable:
        def wrapper(*args, **kwargs):
            last_exception = None
          
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                  
                except urllib.error.URLError as e:
                    last_exception = e
                  
                    if attempt == max_retries:
                        break
                  
                    # Calculate backoff time: exponential + jitter
                    backoff_time = backoff_factor * (2 ** attempt)
                    jitter = random.uniform(0, 0.1 * backoff_time)
                    sleep_time = backoff_time + jitter
                  
                    print(f"Attempt {attempt + 1} failed: {e}")
                    print(f"Retrying in {sleep_time:.2f} seconds...")
                    time.sleep(sleep_time)
          
            print(f"All {max_retries + 1} attempts failed")
            raise last_exception
          
        return wrapper
    return decorator

# Enhanced API client with retries
class RobustAPIClient(JSONAPIClient):
    """
    API client with built-in retry logic and rate limiting.
    """
  
    def __init__(self, base_url: str, api_key: Optional[str] = None, 
                 max_retries: int = 3, rate_limit_delay: float = 0.1):
        super().__init__(base_url, api_key)
        self.max_retries = max_retries
        self.rate_limit_delay = rate_limit_delay
        self.last_request_time = 0
  
    def _rate_limit(self):
        """Simple rate limiting."""
        now = time.time()
        time_since_last = now - self.last_request_time
      
        if time_since_last < self.rate_limit_delay:
            sleep_time = self.rate_limit_delay - time_since_last
            time.sleep(sleep_time)
      
        self.last_request_time = time.time()
  
    @with_retries(max_retries=3, backoff_factor=1.0)
    def _make_request(self, method: str, endpoint: str, 
                     data: Optional[Dict] = None, 
                     params: Optional[Dict] = None) -> Optional[Dict]:
        """Override parent method to add rate limiting."""
        self._rate_limit()
        return super()._make_request(method, endpoint, data, params)

# Usage
robust_client = RobustAPIClient(
    "https://jsonplaceholder.typicode.com",
    max_retries=3,
    rate_limit_delay=0.5  # 500ms between requests
)

# This will automatically retry on network errors
data = robust_client.get("users/1")
```

## Part 9: Memory Diagram - Understanding the Flow

```
JSON over HTTP Flow Visualization:

Python Application Memory          Network          Remote API Server
┌─────────────────────────┐         ║              ┌─────────────────┐
│                         │         ║              │                 │
│ 1. Python Dict          │         ║              │ 6. Process      │
│    {"name": "Alice"}    │         ║              │    Request      │
│           │             │         ║              │       │         │
│           ▼             │         ║              │       ▼         │
│ 2. json.dumps()         │         ║              │ 7. Generate     │
│    '{"name": "Alice"}'  │         ║              │    Response     │
│           │             │         ║              │       │         │
│           ▼             │         ║              │       ▼         │
│ 3. .encode('utf-8')     │         ║              │ 8. JSON String  │
│    b'{"name": "Alice"}' │         ║              │    Response     │
│           │             │         ║              │       │         │
│           ▼             │    HTTP Request    ═══════▶     ▼         │
│ 4. urllib.request       │         ║              │ 9. Send over    │
│    .urlopen()           │         ║              │    Network      │
│           │             │         ║              │                 │
│           ▼             │    HTTP Response   ◀═══════               │
│ 5. response.read()      │         ║              └─────────────────┘
│    Returns bytes        │         ║            
│           │             │         ║            
│           ▼             │         ║            
│ 10. .decode('utf-8')    │         ║            
│     JSON string         │         ║            
│           │             │         ║            
│           ▼             │         ║            
│ 11. json.loads()        │         ║            
│     Python dict         │         ║            
│                         │         ║            
└─────────────────────────┘         ║            

Key Transformations:
• Python Object → JSON String → Bytes → HTTP Request
• HTTP Response → Bytes → String → JSON String → Python Object
```

> **Critical Understanding** : Each step in this flow serves a specific purpose. Python objects must become JSON strings (serialization), then bytes (for network transmission). The reverse process (deserialization) reconstructs Python objects from the received data.

## Part 10: Common Patterns and Anti-Patterns

### Pattern: Resource-Based API Operations

```python
class UserAPI:
    """
    Demonstrates RESTful resource patterns using urllib and json.
    """
  
    def __init__(self, client: JSONAPIClient):
        self.client = client
        self.resource = "users"
  
    def list_users(self, page: int = 1, limit: int = 10) -> Optional[list]:
        """List users with pagination."""
        params = {"_page": page, "_limit": limit}
        return self.client.get(self.resource, params=params)
  
    def get_user(self, user_id: int) -> Optional[Dict]:
        """Get a specific user."""
        return self.client.get(f"{self.resource}/{user_id}")
  
    def create_user(self, user_data: Dict) -> Optional[Dict]:
        """Create a new user."""
        # Validate required fields
        required_fields = ["name", "email"]
        for field in required_fields:
            if field not in user_data:
                raise ValueError(f"Missing required field: {field}")
      
        return self.client.post(self.resource, data=user_data)
  
    def update_user(self, user_id: int, updates: Dict) -> Optional[Dict]:
        """Update an existing user."""
        return self.client.put(f"{self.resource}/{user_id}", data=updates)
  
    def delete_user(self, user_id: int) -> bool:
        """Delete a user."""
        result = self.client.delete(f"{self.resource}/{user_id}")
        return result is not None

# Usage
client = JSONAPIClient("https://jsonplaceholder.typicode.com")
user_api = UserAPI(client)

# List users
users = user_api.list_users(page=1, limit=5)

# Get specific user
user = user_api.get_user(1)

# Create new user
new_user_data = {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890"
}
created_user = user_api.create_user(new_user_data)
```

### Anti-Pattern: Common Mistakes to Avoid

```python
# ❌ DON'T DO THIS - Common mistakes

def bad_api_call():
    """Examples of what NOT to do."""
  
    # Mistake 1: Not handling encoding properly
    data = {"name": "José"}  # Contains non-ASCII character
    # json_str = str(data)  # ❌ This creates "{'name': 'José'}" - not valid JSON!
    json_str = json.dumps(data)  # ✅ This creates '{"name": "José"}' - valid JSON
  
    # Mistake 2: Not handling bytes/string conversion
    url = "https://api.example.com/data"
    response = urllib.request.urlopen(url)
    # data = json.loads(response.read())  # ❌ Might fail - read() returns bytes
    data = json.loads(response.read().decode('utf-8'))  # ✅ Properly decode
  
    # Mistake 3: Unsafe URL construction
    search_term = "hello world"
    # url = f"https://api.example.com/search?q={search_term}"  # ❌ Space not encoded
    url = f"https://api.example.com/search?q={urllib.parse.quote(search_term)}"  # ✅
  
    # Mistake 4: Not checking status codes
    try:
        response = urllib.request.urlopen(url)
        # Assuming success without checking
        data = response.read()  # ❌ Might be error page
    except urllib.error.HTTPError as e:
        # ✅ Always handle HTTP errors
        if e.code == 404:
            print("Resource not found")
        else:
            print(f"HTTP Error: {e.code}")

# ✅ CORRECT APPROACH
def good_api_call():
    """Examples of proper API interaction."""
  
    # Proper encoding and error handling
    try:
        data = {"name": "José", "message": "Hello world!"}
        json_data = json.dumps(data, ensure_ascii=False)  # Preserve Unicode
        request_data = json_data.encode('utf-8')
      
        request = urllib.request.Request(
            "https://httpbin.org/post",
            data=request_data,
            headers={'Content-Type': 'application/json; charset=utf-8'}
        )
      
        response = urllib.request.urlopen(request)
      
        # Check status
        if response.getcode() == 200:
            response_data = response.read().decode('utf-8')
            result = json.loads(response_data)
            return result
        else:
            print(f"Unexpected status: {response.getcode()}")
            return None
          
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        print(f"Error: {e}")
        return None
```

## Part 11: Performance Considerations and Advanced Techniques

### Connection Reuse and Headers Optimization

```python
import urllib.request
import json
from typing import Dict, Optional

class OptimizedAPIClient:
    """
    API client optimized for performance with connection reuse.
    """
  
    def __init__(self, base_url: str):
        self.base_url = base_url
      
        # Create an opener that can reuse connections
        self.opener = urllib.request.build_opener()
      
        # Set default headers for all requests
        self.default_headers = {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',  # Enable compression
            'Connection': 'keep-alive',           # Reuse connections
            'User-Agent': 'OptimizedPythonClient/1.0'
        }
  
    def request(self, method: str, endpoint: str, 
               data: Optional[Dict] = None,
               extra_headers: Optional[Dict] = None) -> Optional[Dict]:
        """Make optimized HTTP request."""
      
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
      
        # Prepare headers
        headers = self.default_headers.copy()
        if extra_headers:
            headers.update(extra_headers)
      
        # Prepare data
        request_data = None
        if data:
            request_data = json.dumps(data, separators=(',', ':')).encode('utf-8')
            headers['Content-Type'] = 'application/json'
            headers['Content-Length'] = str(len(request_data))
      
        # Create request
        request = urllib.request.Request(
            url, 
            data=request_data, 
            headers=headers,
            method=method
        )
      
        try:
            # Use the opener for connection reuse
            response = self.opener.open(request)
          
            # Handle compressed responses
            response_data = response.read()
          
            # Check if response is compressed
            encoding = response.headers.get('Content-Encoding', '')
            if 'gzip' in encoding:
                import gzip
                response_data = gzip.decompress(response_data)
          
            # Decode and parse
            text_data = response_data.decode('utf-8')
            return json.loads(text_data) if text_data else None
          
        except Exception as e:
            print(f"Request failed: {e}")
            return None

# Performance comparison demonstration
def performance_comparison():
    """
    Compare performance of different approaches.
    """
    import time
  
    # URLs to test
    urls = [
        "https://jsonplaceholder.typicode.com/users/1",
        "https://jsonplaceholder.typicode.com/users/2", 
        "https://jsonplaceholder.typicode.com/users/3"
    ]
  
    # Method 1: Creating new connection each time
    print("Method 1: New connection per request")
    start_time = time.time()
  
    for url in urls:
        try:
            response = urllib.request.urlopen(url)
            data = response.read()
        except Exception as e:
            print(f"Error: {e}")
  
    method1_time = time.time() - start_time
    print(f"Time taken: {method1_time:.3f} seconds\n")
  
    # Method 2: Using opener (connection reuse)
    print("Method 2: Connection reuse")
    start_time = time.time()
  
    opener = urllib.request.build_opener()
    for url in urls:
        try:
            response = opener.open(url)
            data = response.read()
        except Exception as e:
            print(f"Error: {e}")
  
    method2_time = time.time() - start_time
    print(f"Time taken: {method2_time:.3f} seconds")
    print(f"Improvement: {((method1_time - method2_time) / method1_time * 100):.1f}%")

# Run comparison
# performance_comparison()
```

## Part 12: Real-World Integration Example

### Building a Weather API Client

```python
import urllib.request
import urllib.parse
import json
from datetime import datetime
from typing import Optional, Dict, List

class WeatherAPIClient:
    """
    Real-world example: Weather data API client.
    Demonstrates practical JSON over HTTP usage.
    """
  
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"
      
    def _make_request(self, endpoint: str, params: Dict) -> Optional[Dict]:
        """Make API request with error handling."""
      
        # Add API key to all requests
        params['appid'] = self.api_key
        params['units'] = 'metric'  # Use Celsius
      
        # Build URL
        query_string = urllib.parse.urlencode(params)
        url = f"{self.base_url}/{endpoint}?{query_string}"
      
        try:
            request = urllib.request.Request(url)
            request.add_header('Accept', 'application/json')
          
            response = urllib.request.urlopen(request)
            data = response.read().decode('utf-8')
          
            return json.loads(data)
          
        except urllib.error.HTTPError as e:
            if e.code == 401:
                print("Invalid API key")
            elif e.code == 404:
                print("Location not found")
            else:
                print(f"API Error {e.code}: {e.reason}")
            return None
          
        except Exception as e:
            print(f"Request failed: {e}")
            return None
  
    def get_current_weather(self, city: str, country_code: str = None) -> Optional[Dict]:
        """Get current weather for a city."""
      
        location = city
        if country_code:
            location = f"{city},{country_code}"
      
        params = {'q': location}
      
        raw_data = self._make_request('weather', params)
        if not raw_data:
            return None
      
        # Transform raw API data into a cleaner format
        return {
            'city': raw_data['name'],
            'country': raw_data['sys']['country'],
            'temperature': raw_data['main']['temp'],
            'feels_like': raw_data['main']['feels_like'],
            'humidity': raw_data['main']['humidity'],
            'pressure': raw_data['main']['pressure'],
            'description': raw_data['weather'][0]['description'],
            'wind_speed': raw_data.get('wind', {}).get('speed', 0),
            'timestamp': datetime.fromtimestamp(raw_data['dt']).isoformat()
        }
  
    def get_forecast(self, city: str, days: int = 5) -> Optional[List[Dict]]:
        """Get weather forecast for a city."""
      
        params = {'q': city, 'cnt': days * 8}  # 8 forecasts per day (3-hour intervals)
      
        raw_data = self._make_request('forecast', params)
        if not raw_data:
            return None
      
        # Group forecasts by day
        daily_forecasts = []
        current_date = None
        day_data = []
      
        for item in raw_data['list']:
            forecast_date = datetime.fromtimestamp(item['dt']).date()
          
            if forecast_date != current_date:
                if day_data:  # Save previous day
                    daily_forecasts.append(self._summarize_day(day_data))
                current_date = forecast_date
                day_data = []
          
            day_data.append(item)
      
        # Don't forget the last day
        if day_data:
            daily_forecasts.append(self._summarize_day(day_data))
      
        return daily_forecasts[:days]
  
    def _summarize_day(self, day_data: List[Dict]) -> Dict:
        """Summarize a day's forecast from multiple data points."""
      
        temps = [item['main']['temp'] for item in day_data]
        descriptions = [item['weather'][0]['description'] for item in day_data]
      
        # Find most common description
        most_common_desc = max(set(descriptions), key=descriptions.count)
      
        return {
            'date': datetime.fromtimestamp(day_data[0]['dt']).date().isoformat(),
            'temp_min': min(temps),
            'temp_max': max(temps),
            'description': most_common_desc,
            'humidity': sum(item['main']['humidity'] for item in day_data) // len(day_data)
        }

# Usage example
def weather_app_demo():
    """Demonstrate the weather API client."""
  
    # Note: You need a real API key from OpenWeatherMap
    # This is just for demonstration
    api_key = "your_api_key_here"
  
    if api_key == "your_api_key_here":
        print("Please get a real API key from https://openweathermap.org/api")
        return
  
    client = WeatherAPIClient(api_key)
  
    # Get current weather
    print("Current Weather:")
    current = client.get_current_weather("London", "GB")
    if current:
        print(f"  {current['city']}, {current['country']}")
        print(f"  Temperature: {current['temperature']:.1f}°C (feels like {current['feels_like']:.1f}°C)")
        print(f"  Conditions: {current['description']}")
        print(f"  Humidity: {current['humidity']}%")
        print(f"  Wind: {current['wind_speed']} m/s")
  
    print("\n5-Day Forecast:")
    forecast = client.get_forecast("London")
    if forecast:
        for day in forecast:
            print(f"  {day['date']}: {day['temp_min']:.1f}°C - {day['temp_max']:.1f}°C, {day['description']}")

# weather_app_demo()
```

> **Real-World Application** : This weather client demonstrates how JSON over HTTP enables rich applications. The API returns complex nested JSON data, which we transform into Python objects and then reshape for our application's needs.

## Summary: Key Mental Models

> **JSON over HTTP is fundamentally about transformation** : Python objects ↔ JSON strings ↔ bytes ↔ network transmission. Each step serves a specific purpose in enabling distributed computing.

> **urllib follows Python's philosophy** : Simple cases are simple (`urlopen(url)`), but complex scenarios (custom headers, POST data, error handling) are fully supported through progressive disclosure of functionality.

> **Error handling is not optional** : Network communication introduces many failure modes. Robust applications must handle HTTPError, URLError, and JSONDecodeError at minimum.

> **Performance matters** : Connection reuse, proper headers, and compression can significantly improve API client performance.

The combination of `urllib` and `json` provides a powerful foundation for API communication in Python. While higher-level libraries like `requests` exist, understanding these fundamentals helps you debug issues, optimize performance, and build robust applications that gracefully handle the complexities of network communication.
