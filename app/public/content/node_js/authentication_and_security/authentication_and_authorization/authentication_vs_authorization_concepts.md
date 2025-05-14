# Authentication vs. Authorization in Node.js: From First Principles

Authentication and authorization are two fundamental security concepts that work together but serve distinct purposes. Understanding them thoroughly is essential for building secure applications. Let's explore these concepts from first principles.

> The security of any system is only as strong as its authentication and authorization mechanisms. They are the gatekeepers that determine who can access what within your application.

## Part 1: Understanding the Core Concepts

### What is Authentication?

Authentication is the process of verifying  **who someone is** . It answers the question: "Are you who you claim to be?"

Think of authentication like showing your ID at an airport:

1. You claim to be a specific person
2. You provide proof of that identity (your ID)
3. The security officer verifies your proof matches your claim

### What is Authorization?

Authorization is the process of verifying  **what specific resources a user has access to** . It answers the question: "Are you allowed to do this specific thing?"

Continuing our airport analogy:

1. After checking your ID (authentication), the agent checks your boarding pass
2. The boarding pass determines which flight you can board, which seat you can sit in, and whether you get priority boarding

> Authentication is about identity verification; authorization is about permission verification. You must know who someone is before you can determine what they're allowed to do.

## Part 2: Authentication in Node.js

### Authentication Fundamentals

At its core, authentication in Node.js involves:

1. Collecting credentials from the user
2. Verifying those credentials against stored values
3. Creating a session or token to maintain the authenticated state

### Common Authentication Methods in Node.js

#### 1. Session-Based Authentication

In session-based authentication:

1. The user logs in with credentials
2. The server verifies the credentials and creates a session
3. A session ID is stored in a cookie in the user's browser
4. The server maintains session data

Let's implement a simple session-based authentication in Express.js:

```javascript
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

// Simulated user database
const users = [
  {
    id: 1,
    username: 'user1',
    // Store hashed passwords in production!
    passwordHash: '$2b$10$X4kv7j5ZcG39WgogSl16vup7dOYlH.sXi4XGT6XjMGdZw0dcb6Liq' // 'password123'
  }
];

// Configure session middleware
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',  // Use a strong, environment-based secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 3600000 } // 1 hour
}));

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Set user info in session (excluding password)
  req.session.user = { id: user.id, username: user.username };
  
  res.json({ message: 'Logged in successfully' });
});

// Example protected route
app.get('/profile', (req, res) => {
  // Check if user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.json({ user: req.session.user, message: 'This is your profile' });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this example:

* We use `express-session` to manage sessions
* User credentials are verified against our database
* On successful login, we store user information in the session
* Protected routes check for the existence of session data
* We properly hash passwords using bcrypt

#### 2. Token-Based Authentication (JWT)

JSON Web Tokens (JWT) are a popular token-based authentication method:

1. The user logs in with credentials
2. The server generates a signed JWT containing user identity
3. The client stores this token (typically in memory or local storage)
4. The client sends the token with each request

Let's implement JWT authentication in Express:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

// Simulated user database
const users = [
  {
    id: 1,
    username: 'user1',
    passwordHash: '$2b$10$X4kv7j5ZcG39WgogSl16vup7dOYlH.sXi4XGT6XjMGdZw0dcb6Liq' // 'password123'
  }
];

// JWT secret key
const JWT_SECRET = 'your-jwt-secret'; // Use environment variables in production

app.use(express.json());

// Login route - generates JWT
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Create payload for JWT (exclude sensitive info)
  const payload = {
    id: user.id,
    username: user.username
  };
  
  // Sign and create JWT
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({ token });
});

// Middleware to authenticate requests
function authenticateToken(req, res, next) {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }
  
  // Verify token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
  
    // Add user info to request
    req.user = user;
    next();
  });
}

// Protected route using middleware
app.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user, message: 'This is your profile' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this example:

* We use `jsonwebtoken` to create and verify tokens
* We authenticate by checking if a valid token exists in request headers
* The middleware extracts user information from the token
* Protected routes use this middleware to ensure authentication

> JWT tokens are stateless, meaning the server doesn't need to store session data. All necessary information is contained within the token itself, which is cryptographically signed to prevent tampering.

#### 3. OAuth Integration

OAuth is an open standard for access delegation:

1. A user wants to give a service access to their data on another service
2. Instead of sharing credentials, OAuth provides limited access tokens

Let's implement a basic OAuth flow with a third-party provider (like Google) using Passport.js:

```javascript
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // In a real app, you would find or create a user in your database
    // Here we'll just use the profile info
    return done(null, profile);
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes for Google authentication
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/profile');
  }
);

// Check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Protected route
app.get('/profile', isAuthenticated, (req, res) => {
  res.json({ user: req.user, message: 'This is your profile' });
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this example:

* We use Passport.js with Google OAuth strategy
* Passport handles the OAuth flow with Google
* After authentication, Google provides profile information
* In a real application, you would store user data in your database

## Part 3: Authorization in Node.js

### Authorization Fundamentals

Authorization in Node.js involves:

1. Identifying what resources a user can access
2. Determining what actions they can perform on those resources
3. Enforcing these permissions at various levels

> Authorization always comes after authentication. You must know who a user is before you can determine what they're allowed to do.

### Authorization Models

#### 1. Role-Based Access Control (RBAC)

RBAC assigns permissions to roles, not individual users:

1. Users are assigned one or more roles
2. Roles contain specific permissions
3. Permissions define what actions can be performed

Let's implement basic RBAC in Express:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

// JWT secret
const JWT_SECRET = 'your-jwt-secret';

// Sample user database with roles
const users = [
  {
    id: 1,
    username: 'admin',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    role: 'user'
  }
];

// Define role permissions
const rolePermissions = {
  admin: ['read', 'write', 'delete'],
  user: ['read']
};

app.use(express.json());

// Simulate login and generate token with role
app.post('/login', (req, res) => {
  const { username } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  
  // Include role in JWT payload
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  res.json({ token });
});

// Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Authorization middleware - checks if user has required permission
function authorize(requiredPermission) {
  return (req, res, next) => {
    const { role } = req.user;
    const permissions = rolePermissions[role] || [];
  
    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
  
    next();
  };
}

// Protected routes with different permission requirements
app.get('/content', authenticate, authorize('read'), (req, res) => {
  res.json({ message: 'This is readable content' });
});

app.post('/content', authenticate, authorize('write'), (req, res) => {
  res.json({ message: 'Content created successfully' });
});

app.delete('/content/:id', authenticate, authorize('delete'), (req, res) => {
  res.json({ message: `Content with ID ${req.params.id} deleted` });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this example:

* We define roles (admin, user) with specific permissions
* Authentication provides the user's role
* The `authorize` middleware checks if the user's role has the required permission
* Different routes require different permissions

#### 2. Attribute-Based Access Control (ABAC)

ABAC is more flexible than RBAC, considering multiple attributes:

1. User attributes (role, department, etc.)
2. Resource attributes (owner, classification, etc.)
3. Action attributes (type of access, time of day, etc.)
4. Context attributes (location, device, etc.)

Here's a simplified ABAC implementation:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

const JWT_SECRET = 'your-jwt-secret';

app.use(express.json());

// Sample data
const users = [
  { id: 1, username: 'john', department: 'finance', role: 'manager' },
  { id: 2, username: 'alice', department: 'hr', role: 'staff' }
];

const documents = [
  { id: 101, title: 'Finance Report', department: 'finance', classification: 'confidential' },
  { id: 102, title: 'HR Policy', department: 'hr', classification: 'internal' }
];

// Policy functions that evaluate permissions based on attributes
const policies = {
  canReadDocument: (user, document) => {
    // Check if user's department matches document's department
    if (user.department === document.department) {
      return true;
    }
  
    // Managers can read documents from any department
    if (user.role === 'manager') {
      return true;
    }
  
    return false;
  },
  
  canEditDocument: (user, document) => {
    // Only users from the same department can edit documents
    if (user.department === document.department) {
      // Only managers can edit confidential documents
      if (document.classification === 'confidential' && user.role !== 'manager') {
        return false;
      }
      return true;
    }
    return false;
  }
};

// Login endpoint
app.post('/login', (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid username' });
  }
  
  // Generate token with user attributes
  const token = jwt.sign({
    id: user.id,
    username: user.username,
    department: user.department,
    role: user.role
  }, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({ token });
});

// Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Get document endpoint with ABAC
app.get('/documents/:id', authenticate, (req, res) => {
  const documentId = parseInt(req.params.id);
  const document = documents.find(doc => doc.id === documentId);
  
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  // Apply policy
  if (!policies.canReadDocument(req.user, document)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(document);
});

// Update document endpoint with ABAC
app.put('/documents/:id', authenticate, (req, res) => {
  const documentId = parseInt(req.params.id);
  const document = documents.find(doc => doc.id === documentId);
  
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  
  // Apply policy
  if (!policies.canEditDocument(req.user, document)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // In a real app, you would update the document here
  res.json({ message: 'Document updated successfully', document });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this example:

* We define policy functions that consider multiple attributes
* Permissions are determined by evaluating these attributes
* More complex conditions can be expressed than with simple role-based rules

> ABAC provides greater flexibility and granularity than RBAC but often requires more complex logic and maintenance.

## Part 4: Authentication and Authorization Working Together

Let's implement a more complete example showing how authentication and authorization work together in a Express.js application:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

// Configuration
const JWT_SECRET = 'your-secure-secret';
app.use(express.json());

// Sample user data with roles and permissions
const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: '$2b$10$X4kv7j5ZcG39WgogSl16vup7dOYlH.sXi4XGT6XjMGdZw0dcb6Liq', // 'password123'
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    passwordHash: '$2b$10$X4kv7j5ZcG39WgogSl16vup7dOYlH.sXi4XGT6XjMGdZw0dcb6Liq', // 'password123'
    role: 'user'
  }
];

// Blog posts data (resources to be accessed)
let posts = [
  { id: 1, title: 'First Post', content: 'Hello World!', authorId: 1 },
  { id: 2, title: 'Second Post', content: 'Another post', authorId: 2 }
];

// Role permissions
const permissions = {
  admin: ['read:any_post', 'create:any_post', 'update:any_post', 'delete:any_post'],
  user: ['read:any_post', 'create:own_post', 'update:own_post', 'delete:own_post']
};

// AUTHENTICATION LOGIC

// Login route for authentication
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Generate JWT with user information needed for authorization
  const token = jwt.sign({
    id: user.id,
    username: user.username,
    role: user.role
  }, JWT_SECRET, { expiresIn: '1h' });
  
  res.json({ token });
});

// Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user; // User info from JWT is now available in request
    next();
  });
}

// AUTHORIZATION LOGIC

// Authorization middleware
function authorize(action) {
  return (req, res, next) => {
    const { role, id: userId } = req.user;
    const userPermissions = permissions[role] || [];
  
    // Check for action on any resource (e.g., 'read:any_post')
    if (userPermissions.includes(`${action}:any_post`)) {
      return next();
    }
  
    // Check for action on own resource (e.g., 'update:own_post')
    if (userPermissions.includes(`${action}:own_post`)) {
      // For routes with post ID parameter
      if (req.params.id) {
        const postId = parseInt(req.params.id);
        const post = posts.find(p => p.id === postId);
      
        if (post && post.authorId === userId) {
          return next();
        }
      } 
      // For creation routes where user will be the author
      else if (action === 'create') {
        return next();
      }
    }
  
    return res.status(403).json({ message: 'Permission denied' });
  };
}

// ROUTES WITH BOTH AUTHENTICATION AND AUTHORIZATION

// Get all posts (read permission required)
app.get('/posts', authenticate, authorize('read'), (req, res) => {
  res.json(posts);
});

// Get single post (read permission required)
app.get('/posts/:id', authenticate, authorize('read'), (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(p => p.id === postId);
  
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  res.json(post);
});

// Create post (create permission required)
app.post('/posts', authenticate, authorize('create'), (req, res) => {
  const { title, content } = req.body;
  
  const newPost = {
    id: posts.length + 1,
    title,
    content,
    authorId: req.user.id // Set current user as author
  };
  
  posts.push(newPost);
  res.status(201).json(newPost);
});

// Update post (update permission required)
app.put('/posts/:id', authenticate, authorize('update'), (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(p => p.id === postId);
  
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  const { title, content } = req.body;
  posts[postIndex] = {
    ...posts[postIndex],
    title: title || posts[postIndex].title,
    content: content || posts[postIndex].content,
  };
  
  res.json(posts[postIndex]);
});

// Delete post (delete permission required)
app.delete('/posts/:id', authenticate, authorize('delete'), (req, res) => {
  const postId = parseInt(req.params.id);
  const initialLength = posts.length;
  
  posts = posts.filter(p => p.id !== postId);
  
  if (posts.length === initialLength) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  res.json({ message: 'Post deleted successfully' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

In this comprehensive example:

1. Authentication verifies the user's identity and provides a JWT
2. The JWT contains user information necessary for authorization
3. Authorization middleware checks if the user has the required permissions
4. Different permissions are required for different routes
5. The system considers both roles and resource ownership

> This flow illustrates how authentication establishes identity, which is then used by the authorization system to determine access permissions.

## Part 5: Security Best Practices

### 1. Password Security

* Always hash passwords using strong algorithms like bcrypt or Argon2
* Never store plain-text passwords
* Implement password complexity requirements
* Add rate limiting for login attempts

```javascript
// Example of proper password hashing with bcrypt
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  // Higher saltRounds = more secure but slower
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Example of rate limiting
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later'
});

app.post('/login', loginLimiter, (req, res) => {
  // Login logic here
});
```

### 2. Token Security

* Use secure, HTTP-only cookies for session tokens
* Implement token expiration
* Use proper JWT signing algorithms
* Rotate JWT secrets periodically

```javascript
// Secure cookie configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,         // Prevents client-side JS from reading the cookie
    secure: true,           // Only sent over HTTPS
    sameSite: 'strict',     // Prevents CSRF
    maxAge: 3600000         // 1 hour
  }
}));

// JWT with proper options
const token = jwt.sign(
  payload,
  process.env.JWT_SECRET,
  {
    algorithm: 'HS256',     // Use strong algorithms
    expiresIn: '1h',        // Short expiration
    audience: 'your-app',   // Specify intended audience
    issuer: 'your-api'      // Specify the issuer
  }
);
```

### 3. HTTPS and Headers

Always use HTTPS in production and set security headers:

```javascript
const helmet = require('helmet');
app.use(helmet()); // Sets various HTTP security headers

// Or manually:
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### 4. Environment-Based Secrets

Never hardcode secrets:

```javascript
// Bad - hardcoded secrets
const JWT_SECRET = 'my-secret-key';

// Good - environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable not set');
  process.exit(1);
}
```

## Part 6: Implementing Common Real-World Patterns

### Multi-Factor Authentication (MFA)

Let's implement a simple two-factor authentication system:

```javascript
const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const app = express();

app.use(express.json());

// User database with TOTP secrets
const users = [
  {
    id: 1,
    username: 'user1',
    password: 'hashed_password_here',
    mfaEnabled: false,
    mfaSecret: null
  }
];

// Generate MFA secret for a user
app.post('/mfa/setup', (req, res) => {
  const { userId } = req.body;
  
  // In a real app, authenticate first
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Generate new secret
  const secret = speakeasy.generateSecret({
    name: `MyApp:${user.username}`
  });
  
  // Store secret temporarily (until verified)
  user.tempSecret = secret.base32;
  
  // Generate QR code
  QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
    if (err) {
      return res.status(500).json({ message: 'Error generating QR code' });
    }
  
    res.json({
      message: 'MFA setup initiated',
      qrCode: dataUrl,
      secret: secret.base32  // Show this to user for manual entry
    });
  });
});

// Verify and enable MFA
app.post('/mfa/verify', (req, res) => {
  const { userId, token } = req.body;
  
  const user = users.find(u => u.id === userId);
  if (!user || !user.tempSecret) {
    return res.status(400).json({ message: 'MFA setup not initiated' });
  }
  
  // Verify token
  const verified = speakeasy.totp.verify({
    secret: user.tempSecret,
    encoding: 'base32',
    token: token
  });
  
  if (!verified) {
    return res.status(400).json({ message: 'Invalid token' });
  }
  
  // Enable MFA and store secret permanently
  user.mfaEnabled = true;
  user.mfaSecret = user.tempSecret;
  user.tempSecret = null;
  
  res.json({ message: 'MFA enabled successfully' });
});

// Login with MFA
app.post('/login', (req, res) => {
  const { username, password, mfaToken } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Check password (simplified)
  if (password !== user.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // If MFA is enabled
  if (user.mfaEnabled) {
    // If MFA token is not provided
    if (!mfaToken) {
      return res.status(400).json({ 
        message: 'MFA token required', 
        requireMfa: true 
      });
    }
  
    // Verify MFA token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: mfaToken
    });
  
    if (!verified) {
      return res.status(401).json({ message: 'Invalid MFA token' });
    }
  }
  
  // Login successful
  res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

This example:

* Sets up TOTP (Time-based One-Time Password) authentication
* Generates a QR code for users to scan with authenticator apps
* Verifies the setup with an initial token
* Adds MFA verification to the login process

### Refresh Token Pattern

For longer sessions without compromising security:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());

// In-memory refresh token store (use a database in production)
const refreshTokens = [];

// Secrets (use env variables in production)
const ACCESS_TOKEN_SECRET = 'access-token-secret';
const REFRESH_TOKEN_SECRET = 'refresh-token-secret';

// Sample users
const users = [{ id: 1, username: 'user1', password: 'password123' }];

// Login and issue tokens
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Create payload for access token (minimal info)
  const accessPayload = {
    userId: user.id,
    username: user.username
  };
  
  // Create refresh token with unique ID
  const refreshToken = uuidv4();
  
  // Sign tokens
  const accessToken = jwt.sign(
    accessPayload, 
    ACCESS_TOKEN_SECRET, 
    { expiresIn: '15m' }
  );
  
  const refreshTokenJwt = jwt.sign(
    { 
      userId: user.id,
      tokenId: refreshToken // Include unique ID
    }, 
    REFRESH_TOKEN_SECRET, 
    { expiresIn: '7d' }
  );
  
  // Store refresh token
  refreshTokens.push({
    id: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
  
  res.json({
    accessToken,
    refreshToken: refreshTokenJwt
  });
});

// Refresh access token
app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }
  
  // Verify refresh token
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  
    // Check if token exists in store
    const storedToken = refreshTokens.find(t => 
      t.id === decoded.tokenId && t.userId === decoded.userId);
  
    if (!storedToken) {
      return res.status(403).json({ message: 'Refresh token not found' });
    }
  
    // Check if token is expired
    if (new Date() > new Date(storedToken.expiresAt)) {
      // Remove expired token
      const index = refreshTokens.indexOf(storedToken);
      refreshTokens.splice(index, 1);
      return res.status(403).json({ message: 'Refresh token expired' });
    }
  
    // Find user
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user.id, username: user.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );
  
    res.json({ accessToken });
  });
});

// Logout (revoke refresh token)
app.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  
    // Remove token from store
    const tokenIndex = refreshTokens.findIndex(t => 
      t.id === decoded.tokenId && t.userId === decoded.userId);
  
    if (tokenIndex !== -1) {
      refreshTokens.splice(tokenIndex, 1);
    }
  
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

This pattern:

* Uses short-lived access tokens for security
* Uses long-lived refresh tokens for convenience
* Stores refresh tokens to allow revocation
* Provides a logout mechanism to invalidate sessions

## Conclusion

> Authentication and authorization are complementary security concepts that work together to protect resources. Authentication establishes identity, while authorization enforces access control based on that identity.

From first principles:

1. Authentication is about **identity verification**
   * It answers "Who are you?"
   * It must happen before authorization
   * Common methods: sessions, JWTs, OAuth, MFA
2. Authorization is about **permission verification**
   * It answers "What are you allowed to do?"
   * It depends on authentication
   * Common approaches: RBAC, ABAC, resource ownership
3. Best practices for both:
   * Use environment-based secrets
   * Implement proper password hashing
   * Set appropriate token expiration
   * Apply the principle of least privilege
   * Use HTTPS and security headers
   * Validate all inputs

By understanding these concepts thoroughly, you can implement robust security in your Node.js applications that protects user data while providing a smooth user experience.
