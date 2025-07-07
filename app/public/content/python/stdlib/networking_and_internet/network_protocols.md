# Network Protocols: From First Principles to Python Implementation

## What is a Network?

Before diving into protocols, let's understand what we're dealing with at the most fundamental level.

**A network is simply multiple computers that can communicate with each other.** Think of it like a postal system - you have addresses (IP addresses), mail carriers (routers), and standardized envelopes (protocols) that ensure messages get delivered correctly.

```
Computer A ←--→ Network Infrastructure ←--→ Computer B
   (Client)         (Internet/LAN)         (Server)
```

## What Are Protocols?

> **Mental Model** : A protocol is like a language that computers agree to speak when communicating. Just as humans need common languages to communicate effectively, computers need agreed-upon rules for exchanging information.

A protocol defines:

* **Format** : How data should be structured
* **Order** : When to send what type of message
* **Error handling** : What to do when things go wrong
* **Connection management** : How to start and end conversations

## The Layered Approach to Networking

Networks use a layered architecture because it breaks down the complex problem of communication into manageable pieces:

```
Application Layer  │ HTTP, FTP, SMTP (What data to send)
                   │
Transport Layer    │ TCP, UDP (How to deliver reliably)
                   │
Network Layer      │ IP (How to route between networks)
                   │
Physical Layer     │ Ethernet, WiFi (How to send bits)
```

> **Why Layers Matter** : Each layer handles one specific concern. This allows protocols to be mixed and matched - you can run HTTP over TCP over IP over either Ethernet or WiFi without changing the higher-level protocols.

---

# HTTP: The Foundation of the Web

## HTTP from First Principles

**HTTP (HyperText Transfer Protocol)** is fundamentally a  **request-response protocol** . It's designed around a simple conversation pattern:

1. Client asks for something
2. Server responds with that something (or an error)
3. Connection typically closes

```
Client Request:
GET /index.html HTTP/1.1
Host: example.com

Server Response:
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1234

<html>...</html>
```

## Why HTTP is Designed This Way

> **HTTP Philosophy** : HTTP is stateless, text-based, and human-readable. This makes it simple to debug, extend, and implement across different systems.

 **Stateless** : Each request contains all information needed to process it. The server doesn't remember previous requests.

 **Benefits of statelessness** :

* Servers can handle requests from millions of clients
* Easy to distribute load across multiple servers
* Simple error recovery

 **Drawbacks** :

* Must resend authentication with each request
* Can't maintain session state naturally

## HTTP Methods: The Verbs of Web Communication

```python
# Different HTTP methods represent different intentions
import requests

# GET: "Please give me this resource"
response = requests.get('https://api.example.com/users/123')
# Idempotent: calling it multiple times has same effect

# POST: "Please create something new"
response = requests.post('https://api.example.com/users', 
                        json={'name': 'Alice', 'email': 'alice@example.com'})
# Not idempotent: creates new resource each time

# PUT: "Please create or completely replace this resource"
response = requests.put('https://api.example.com/users/123',
                       json={'name': 'Alice Updated', 'email': 'newemail@example.com'})
# Idempotent: multiple calls result in same final state

# DELETE: "Please remove this resource"
response = requests.delete('https://api.example.com/users/123')
# Idempotent: deleting already-deleted resource is still "deleted"
```

## HTTP Status Codes: The Language of Response

> **Mental Model** : Status codes are like facial expressions - they give immediate context about how the server "feels" about your request.

```python
# Status codes are grouped by meaning:
# 2xx: Success - "I understood and completed your request"
# 3xx: Redirection - "Your request is somewhere else"
# 4xx: Client Error - "You made a mistake in your request"
# 5xx: Server Error - "I made a mistake processing your request"

def handle_response(response):
    if response.status_code == 200:
        print("Success! Here's your data:", response.json())
    elif response.status_code == 404:
        print("Resource not found - check your URL")
    elif response.status_code == 401:
        print("Unauthorized - check your credentials")
    elif response.status_code >= 500:
        print("Server error - try again later")
```

## Building HTTP from Scratch in Python

Let's understand HTTP by implementing a simple version using raw sockets:

```python
import socket

def simple_http_request(host, path):
    """
    Demonstrates HTTP at the socket level
    This shows what libraries like requests do under the hood
    """
    # Create a socket - think of it as a phone line
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  
    try:
        # Connect to the server (like dialing a phone number)
        sock.connect((host, 80))
      
        # Craft HTTP request manually
        # HTTP is just text following a specific format
        request = f"GET {path} HTTP/1.1\r\nHost: {host}\r\n\r\n"
      
        # Send the request (as bytes, since networks transmit bytes)
        sock.send(request.encode('utf-8'))
      
        # Receive response
        response = sock.recv(4096).decode('utf-8')
      
        # Parse response
        lines = response.split('\r\n')
        status_line = lines[0]  # "HTTP/1.1 200 OK"
        headers = []
        body_start = 0
      
        # Find where headers end and body begins
        for i, line in enumerate(lines[1:], 1):
            if line == '':  # Empty line separates headers from body
                body_start = i + 1
                break
            headers.append(line)
      
        body = '\r\n'.join(lines[body_start:])
      
        return {
            'status': status_line,
            'headers': headers,
            'body': body
        }
      
    finally:
        sock.close()

# Usage
result = simple_http_request('httpbin.org', '/get')
print("Status:", result['status'])
print("Body:", result['body'][:200])  # First 200 chars
```

## Modern HTTP with Python

```python
import requests
import json

class HTTPClient:
    """
    A wrapper around requests that demonstrates HTTP concepts
    """
  
    def __init__(self, base_url, default_headers=None):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
      
        if default_headers:
            self.session.headers.update(default_headers)
  
    def get(self, endpoint, params=None):
        """
        GET requests are for retrieving data
        They should be safe (no side effects) and idempotent
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
      
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()  # Raises exception for 4xx/5xx
            return response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
          
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None
  
    def post(self, endpoint, data=None, json_data=None):
        """
        POST requests are for creating new resources
        They can have side effects and are not idempotent
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
      
        try:
            if json_data:
                response = self.session.post(url, json=json_data)
            else:
                response = self.session.post(url, data=data)
              
            response.raise_for_status()
            return response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
          
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None

# Usage example
api = HTTPClient('https://jsonplaceholder.typicode.com')

# GET example
posts = api.get('/posts', params={'userId': 1})
print(f"Found {len(posts)} posts")

# POST example
new_post = api.post('/posts', json_data={
    'title': 'Learning HTTP',
    'body': 'HTTP is the foundation of web communication',
    'userId': 1
})
print(f"Created post with ID: {new_post.get('id')}")
```

---

# FTP: File Transfer Protocol

## FTP from First Principles

**FTP** is designed specifically for transferring files between computers. Unlike HTTP's simple request-response model, FTP uses a  **dual-channel approach** :

```
Control Channel (Port 21):  Commands and responses
Data Channel (Port 20):     Actual file data

Client                     Server
  |                          |
  |-- "USER alice" --------->|  (Control)
  |<------ "331 OK" ---------|
  |-- "PASS secret" -------->|
  |<------ "230 OK" ---------|
  |-- "RETR file.txt" ------>|
  |<------ "150 OK" ---------|
  |                          |
  | <====== file data ====== | (Data channel opens)
  |<------ "226 Done" -------|
```

> **Why Two Channels?** : The control channel handles commands while data flows through a separate channel. This allows for better control over transfers, progress monitoring, and the ability to abort transfers without disrupting the command channel.

## FTP Modes: Active vs Passive

**Active Mode** (Traditional):

```
Client tells server: "Send data to my IP:port"
Server connects back to client for data transfer
Problem: Firewalls often block incoming connections to clients
```

**Passive Mode** (Modern default):

```
Client asks: "Where should I connect for data?"
Server responds: "Connect to my IP:port"
Client initiates data connection
Advantage: Works better with firewalls and NAT
```

## Python FTP Implementation

```python
import ftplib
import os
from pathlib import Path

class FTPManager:
    """
    A comprehensive FTP client demonstrating core concepts
    """
  
    def __init__(self, host, username, password, port=21):
        self.host = host
        self.username = username
        self.password = password
        self.port = port
        self.ftp = None
  
    def connect(self):
        """
        Establish control channel connection
        """
        try:
            # Create FTP object (this opens the control channel)
            self.ftp = ftplib.FTP()
          
            # Connect to server
            self.ftp.connect(self.host, self.port)
            print(f"Connected to {self.host}:{self.port}")
          
            # Login (sends USER and PASS commands)
            self.ftp.login(self.username, self.password)
            print(f"Logged in as {self.username}")
          
            # Set passive mode (recommended for most scenarios)
            self.ftp.set_pasv(True)
          
            return True
          
        except ftplib.all_errors as e:
            print(f"FTP connection failed: {e}")
            return False
  
    def list_directory(self, path='.'):
        """
        List contents of remote directory
        Demonstrates how FTP handles directory operations
        """
        if not self.ftp:
            print("Not connected")
            return []
      
        try:
            # Get current directory
            current_dir = self.ftp.pwd()
            print(f"Current directory: {current_dir}")
          
            # List directory contents
            # FTP returns data in different formats, nlst gives just names
            file_list = self.ftp.nlst(path)
          
            # For more detailed info, use dir() method
            print("\nDetailed listing:")
            self.ftp.dir(path)
          
            return file_list
          
        except ftplib.error_perm as e:
            print(f"Permission error: {e}")
            return []
  
    def download_file(self, remote_file, local_file=None):
        """
        Download file from server
        Demonstrates binary vs text transfer modes
        """
        if not self.ftp:
            print("Not connected")
            return False
      
        if local_file is None:
            local_file = os.path.basename(remote_file)
      
        try:
            # Determine transfer mode based on file extension
            _, ext = os.path.splitext(remote_file)
            is_binary = ext.lower() in ['.jpg', '.png', '.gif', '.zip', '.exe', '.pdf']
          
            with open(local_file, 'wb' if is_binary else 'w') as f:
                if is_binary:
                    # Binary mode for images, executables, etc.
                    self.ftp.retrbinary(f'RETR {remote_file}', f.write)
                    print(f"Downloaded {remote_file} in binary mode")
                else:
                    # Text mode for text files
                    def write_line(line):
                        f.write(line + '\n')
                  
                    self.ftp.retrlines(f'RETR {remote_file}', write_line)
                    print(f"Downloaded {remote_file} in text mode")
          
            return True
          
        except ftplib.error_perm as e:
            print(f"Download failed: {e}")
            return False
  
    def upload_file(self, local_file, remote_file=None):
        """
        Upload file to server
        """
        if not self.ftp:
            print("Not connected")
            return False
      
        if not os.path.exists(local_file):
            print(f"Local file {local_file} not found")
            return False
      
        if remote_file is None:
            remote_file = os.path.basename(local_file)
      
        try:
            # Determine transfer mode
            _, ext = os.path.splitext(local_file)
            is_binary = ext.lower() in ['.jpg', '.png', '.gif', '.zip', '.exe', '.pdf']
          
            with open(local_file, 'rb' if is_binary else 'r') as f:
                if is_binary:
                    self.ftp.storbinary(f'STOR {remote_file}', f)
                    print(f"Uploaded {local_file} in binary mode")
                else:
                    self.ftp.storlines(f'STOR {remote_file}', f)
                    print(f"Uploaded {local_file} in text mode")
          
            return True
          
        except ftplib.error_perm as e:
            print(f"Upload failed: {e}")
            return False
  
    def disconnect(self):
        """
        Properly close FTP connection
        """
        if self.ftp:
            try:
                self.ftp.quit()  # Sends QUIT command
                print("FTP connection closed")
            except:
                self.ftp.close()  # Force close if quit fails
            finally:
                self.ftp = None

# Usage example (with a test FTP server)
def demo_ftp():
    # Note: This example uses a public test FTP server
    ftp = FTPManager('test.rebex.net', 'demo', 'password')
  
    if ftp.connect():
        # List files
        files = ftp.list_directory()
        print(f"Found files: {files}")
      
        # Try to download a file
        if files:
            ftp.download_file(files[0])
      
        ftp.disconnect()

# demo_ftp()  # Uncomment to run
```

---

# Socket Communication: The Foundation Layer

## What Are Sockets?

> **Socket Mental Model** : A socket is like a telephone endpoint. Just as you need two phones connected through the phone system to have a conversation, you need two sockets connected through the network to exchange data.

A socket represents one endpoint of a network connection. It's defined by:

* **IP Address** : Which computer (like a street address)
* **Port Number** : Which service on that computer (like an apartment number)
* **Protocol** : How to communicate (TCP for reliable, UDP for fast)

## TCP vs UDP: Two Different Communication Styles

```
TCP (Transmission Control Protocol):
┌─────────────┐    ┌─────────────┐
│   Client    │────│   Server    │
└─────────────┘    └─────────────┘
     │                    │
     │──── SYN ──────────→│  (Handshake)
     │←─── SYN-ACK ───────│
     │──── ACK ──────────→│
     │                    │
     │═══ Data Flow ═════│  (Reliable)
     │                    │
     │──── FIN ──────────→│  (Clean close)
     │←─── ACK ───────────│

Characteristics:
- Connection-oriented (like a phone call)
- Reliable delivery guaranteed
- Ordered data arrival
- Error detection and correction
- Flow control (sender won't overwhelm receiver)
- Higher overhead

UDP (User Datagram Protocol):
┌─────────────┐    ┌─────────────┐
│   Client    │ ≈≈ │   Server    │
└─────────────┘    └─────────────┘
     │                    │
     │═══ Data Packets ══│  (Fire and forget)
     │                    │

Characteristics:
- Connectionless (like sending postcards)
- No delivery guarantee
- No ordering guarantee
- Minimal overhead
- Fast transmission
- Good for real-time applications
```

## Building a TCP Server and Client

```python
import socket
import threading
import time

class TCPServer:
    """
    A simple TCP server demonstrating socket concepts
    """
  
    def __init__(self, host='localhost', port=8888):
        self.host = host
        self.port = port
        self.socket = None
        self.running = False
  
    def start(self):
        """
        Start the server and listen for connections
        """
        try:
            # Create socket object
            # AF_INET = IPv4, SOCK_STREAM = TCP
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
          
            # Set socket options
            # SO_REUSEADDR allows reusing the address immediately after closing
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
          
            # Bind socket to address and port
            self.socket.bind((self.host, self.port))
          
            # Listen for incoming connections
            # The parameter is the backlog (max pending connections)
            self.socket.listen(5)
          
            self.running = True
            print(f"Server listening on {self.host}:{self.port}")
          
            while self.running:
                try:
                    # Accept incoming connection
                    # This blocks until a client connects
                    client_socket, client_address = self.socket.accept()
                    print(f"Connection from {client_address}")
                  
                    # Handle client in separate thread
                    # This allows multiple concurrent connections
                    client_thread = threading.Thread(
                        target=self.handle_client, 
                        args=(client_socket, client_address)
                    )
                    client_thread.daemon = True  # Dies when main program dies
                    client_thread.start()
                  
                except socket.error as e:
                    if self.running:  # Only print error if we're still supposed to be running
                        print(f"Socket error: {e}")
                      
        except Exception as e:
            print(f"Server error: {e}")
        finally:
            self.stop()
  
    def handle_client(self, client_socket, client_address):
        """
        Handle communication with a single client
        """
        try:
            while True:
                # Receive data from client
                # recv() blocks until data arrives
                data = client_socket.recv(1024)  # Buffer size: 1024 bytes
              
                if not data:
                    # Empty data means client closed connection
                    break
              
                message = data.decode('utf-8')
                print(f"Received from {client_address}: {message}")
              
                # Echo the message back
                response = f"Echo: {message}"
                client_socket.send(response.encode('utf-8'))
              
                # Special command to close connection
                if message.strip().lower() == 'quit':
                    break
                  
        except socket.error as e:
            print(f"Client {client_address} error: {e}")
        finally:
            print(f"Closing connection to {client_address}")
            client_socket.close()
  
    def stop(self):
        """
        Stop the server
        """
        self.running = False
        if self.socket:
            self.socket.close()

class TCPClient:
    """
    A TCP client for connecting to our server
    """
  
    def __init__(self, host='localhost', port=8888):
        self.host = host
        self.port = port
        self.socket = None
  
    def connect(self):
        """
        Connect to the server
        """
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect((self.host, self.port))
            print(f"Connected to {self.host}:{self.port}")
            return True
        except socket.error as e:
            print(f"Connection failed: {e}")
            return False
  
    def send_message(self, message):
        """
        Send a message to the server and receive response
        """
        if not self.socket:
            print("Not connected")
            return None
      
        try:
            # Send message
            self.socket.send(message.encode('utf-8'))
          
            # Receive response
            response = self.socket.recv(1024)
            return response.decode('utf-8')
          
        except socket.error as e:
            print(f"Send error: {e}")
            return None
  
    def disconnect(self):
        """
        Close connection
        """
        if self.socket:
            self.socket.close()
            print("Disconnected")

# Demonstration
def demo_tcp():
    """
    Demonstrate TCP client-server communication
    """
    # Start server in background thread
    server = TCPServer()
    server_thread = threading.Thread(target=server.start)
    server_thread.daemon = True
    server_thread.start()
  
    # Give server time to start
    time.sleep(1)
  
    # Create client and test communication
    client = TCPClient()
    if client.connect():
        # Send some messages
        messages = ["Hello, Server!", "How are you?", "quit"]
      
        for msg in messages:
            response = client.send_message(msg)
            print(f"Server responded: {response}")
      
        client.disconnect()
  
    server.stop()

# demo_tcp()  # Uncomment to run
```

## UDP Communication: Simpler but Less Reliable

```python
import socket
import threading
import time

class UDPServer:
    """
    UDP server - connectionless communication
    """
  
    def __init__(self, host='localhost', port=8889):
        self.host = host
        self.port = port
        self.socket = None
        self.running = False
  
    def start(self):
        """
        Start UDP server
        """
        try:
            # Create UDP socket
            # SOCK_DGRAM = UDP
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            self.socket.bind((self.host, self.port))
          
            self.running = True
            print(f"UDP Server listening on {self.host}:{self.port}")
          
            while self.running:
                try:
                    # Receive data and sender address
                    # UDP is connectionless, so we get sender info with each packet
                    data, client_address = self.socket.recvfrom(1024)
                  
                    message = data.decode('utf-8')
                    print(f"UDP received from {client_address}: {message}")
                  
                    # Send response back to sender
                    response = f"UDP Echo: {message}"
                    self.socket.sendto(response.encode('utf-8'), client_address)
                  
                except socket.error as e:
                    if self.running:
                        print(f"UDP server error: {e}")
                      
        except Exception as e:
            print(f"UDP server startup error: {e}")
        finally:
            self.stop()
  
    def stop(self):
        """
        Stop UDP server
        """
        self.running = False
        if self.socket:
            self.socket.close()

class UDPClient:
    """
    UDP client - send packets without establishing connection
    """
  
    def __init__(self, host='localhost', port=8889):
        self.host = host
        self.port = port
        self.socket = None
  
    def setup(self):
        """
        Create UDP socket
        """
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            return True
        except socket.error as e:
            print(f"UDP client setup failed: {e}")
            return False
  
    def send_message(self, message):
        """
        Send UDP message (no connection needed)
        """
        if not self.socket:
            print("Socket not set up")
            return None
      
        try:
            # Send data to server
            self.socket.sendto(message.encode('utf-8'), (self.host, self.port))
          
            # Try to receive response (with timeout)
            self.socket.settimeout(5.0)  # 5 second timeout
            response, server_address = self.socket.recvfrom(1024)
          
            return response.decode('utf-8')
          
        except socket.timeout:
            print("No response received (timeout)")
            return None
        except socket.error as e:
            print(f"UDP send error: {e}")
            return None
  
    def close(self):
        """
        Close UDP socket
        """
        if self.socket:
            self.socket.close()

# Demo UDP communication
def demo_udp():
    """
    Demonstrate UDP client-server communication
    """
    # Start UDP server
    server = UDPServer()
    server_thread = threading.Thread(target=server.start)
    server_thread.daemon = True
    server_thread.start()
  
    time.sleep(1)  # Let server start
  
    # Create UDP client
    client = UDPClient()
    if client.setup():
        # Send messages
        messages = ["UDP Hello!", "Fast message", "No connection needed"]
      
        for msg in messages:
            response = client.send_message(msg)
            print(f"UDP Server responded: {response}")
            time.sleep(0.5)
      
        client.close()
  
    server.stop()

# demo_udp()  # Uncomment to run
```

## Socket Programming Best Practices

> **Key Socket Principles** :
>
> 1. **Always handle exceptions** - Network operations can fail in many ways
> 2. **Close sockets properly** - Use try/finally or context managers
> 3. **Handle partial sends/receives** - TCP might not send/receive all data at once
> 4. **Set timeouts** - Prevent hanging on network operations
> 5. **Use threading for servers** - Handle multiple clients simultaneously

```python
import socket
from contextlib import contextmanager

@contextmanager
def socket_connection(host, port, timeout=10):
    """
    Context manager for proper socket handling
    Demonstrates Pythonic socket usage
    """
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
  
    try:
        sock.connect((host, port))
        yield sock
    except socket.error as e:
        print(f"Socket error: {e}")
        raise
    finally:
        sock.close()

def send_all(sock, data):
    """
    Ensure all data is sent
    TCP might not send everything in one call
    """
    data = data.encode('utf-8') if isinstance(data, str) else data
    bytes_sent = 0
  
    while bytes_sent < len(data):
        sent = sock.send(data[bytes_sent:])
        if sent == 0:
            raise RuntimeError("Socket connection broken")
        bytes_sent += sent

def recv_all(sock, length):
    """
    Receive exactly 'length' bytes
    TCP might not receive everything in one call
    """
    data = b''
  
    while len(data) < length:
        packet = sock.recv(length - len(data))
        if not packet:
            raise RuntimeError("Socket connection broken")
        data += packet
  
    return data

# Example usage
def robust_client_example():
    """
    Demonstrates robust socket programming
    """
    try:
        with socket_connection('httpbin.org', 80) as sock:
            # Send HTTP request
            request = "GET /get HTTP/1.1\r\nHost: httpbin.org\r\n\r\n"
            send_all(sock, request)
          
            # Receive response
            response = sock.recv(4096)
            print("Response received:", response.decode('utf-8')[:200])
          
    except Exception as e:
        print(f"Connection failed: {e}")

# robust_client_example()  # Uncomment to run
```

## Putting It All Together: A Multi-Protocol Server

```python
import socket
import threading
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs

class MultiProtocolServer:
    """
    Demonstrates multiple protocols running on different ports
    """
  
    def __init__(self):
        self.servers = {}
        self.running = False
  
    def start_tcp_echo_server(self, port=8888):
        """
        Start a simple TCP echo server
        """
        def tcp_server():
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            sock.bind(('localhost', port))
            sock.listen(5)
          
            print(f"TCP Echo Server on port {port}")
          
            while self.running:
                try:
                    client, addr = sock.accept()
                    data = client.recv(1024)
                    client.send(b"TCP Echo: " + data)
                    client.close()
                except socket.error:
                    if self.running:
                        continue
                    else:
                        break
          
            sock.close()
      
        thread = threading.Thread(target=tcp_server)
        thread.daemon = True
        thread.start()
        self.servers['tcp'] = thread
  
    def start_udp_echo_server(self, port=8889):
        """
        Start a UDP echo server
        """
        def udp_server():
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            sock.bind(('localhost', port))
          
            print(f"UDP Echo Server on port {port}")
          
            while self.running:
                try:
                    data, addr = sock.recvfrom(1024)
                    sock.sendto(b"UDP Echo: " + data, addr)
                except socket.error:
                    if self.running:
                        continue
                    else:
                        break
          
            sock.close()
      
        thread = threading.Thread(target=udp_server)
        thread.daemon = True
        thread.start()
        self.servers['udp'] = thread
  
    def start_http_server(self, port=8890):
        """
        Start a simple HTTP server
        """
        class CustomHTTPHandler(http.server.BaseHTTPRequestHandler):
            def do_GET(self):
                # Parse URL
                parsed = urlparse(self.path)
                path = parsed.path
                params = parse_qs(parsed.query)
              
                # Simple routing
                if path == '/':
                    response = "Welcome to Multi-Protocol Server!"
                elif path == '/echo':
                    message = params.get('message', ['No message'])[0]
                    response = f"HTTP Echo: {message}"
                else:
                    response = "404 Not Found"
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(response.encode())
                    return
              
                # Send successful response
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(response.encode())
          
            def log_message(self, format, *args):
                # Suppress default logging
                pass
      
        def http_server():
            with socketserver.TCPServer(('localhost', port), CustomHTTPHandler) as httpd:
                print(f"HTTP Server on port {port}")
                httpd.serve_forever()
      
        thread = threading.Thread(target=http_server)
        thread.daemon = True
        thread.start()
        self.servers['http'] = thread
  
    def start_all(self):
        """
        Start all protocol servers
        """
        self.running = True
        self.start_tcp_echo_server(8888)
        self.start_udp_echo_server(8889)
        self.start_http_server(8890)
      
        print("\nMulti-Protocol Server started!")
        print("- TCP Echo: localhost:8888")
        print("- UDP Echo: localhost:8889") 
        print("- HTTP: http://localhost:8890")
        print("\nPress Ctrl+C to stop")
  
    def stop(self):
        """
        Stop all servers
        """
        self.running = False
        print("\nStopping all servers...")

# Demo function
def demo_multi_protocol():
    """
    Start the multi-protocol server
    """
    server = MultiProtocolServer()
  
    try:
        server.start_all()
      
        # Keep main thread alive
        while True:
            time.sleep(1)
          
    except KeyboardInterrupt:
        server.stop()
        print("Servers stopped.")

# Uncomment to run the demo
# demo_multi_protocol()
```

---

## Key Takeaways

> **Network Protocol Hierarchy** :
>
> * **Sockets** : The fundamental building blocks - endpoints for network communication
> * **TCP/UDP** : Transport protocols that define how data moves reliably (TCP) or quickly (UDP)
> * **HTTP** : Application protocol built on TCP for web communication
> * **FTP** : Application protocol for file transfer, also built on TCP
>
> Each layer abstracts complexity from the layer above it, making network programming manageable.

 **When to Use Each Protocol** :

* **HTTP** : Web APIs, REST services, web scraping
* **FTP** : File transfers, especially large files or when you need directory operations
* **TCP Sockets** : Custom protocols, real-time communication, game servers
* **UDP Sockets** : Real-time applications where speed > reliability (gaming, video streaming, DNS)

The beauty of this layered approach is that you can choose the right level of abstraction for your needs - from high-level HTTP requests to low-level socket programming.
