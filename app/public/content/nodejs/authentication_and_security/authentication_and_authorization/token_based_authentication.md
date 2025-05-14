# Token-Based Authentication: From First Principles to Implementation

> "Security is not a product, but a process." - Bruce Schneier

Token-based authentication has become the backbone of modern web application security. In this comprehensive guide, we'll explore the fundamental concepts, implementation details, and best practices for JWT, OAuth2, and OpenID Connect in Node.js.

## 1. Understanding Authentication: First Principles

### What is Authentication?

> Authentication is the process of verifying that an entity (user, service, or application) is who they claim to be.

At its core, authentication answers a simple question: "Are you who you say you are?" This verification process is fundamental to security because it establishes trust before granting access to protected resources.

In the digital world, authentication typically involves:

* Something you know (password, PIN)
* Something you have (mobile device, security token)
* Something you are (fingerprint, facial recognition)

### Traditional Authentication vs. Token-Based Authentication

Traditional authentication uses sessions and cookies:

```
Client                                Server
  |                                     |
  |--- Login with username/password --->|
  |                                     | [Creates session in memory]
  |<------ Returns session cookie ------|
  |                                     |
  |--- Request with session cookie ---->|
  |                                     | [Looks up session]
  |<--------- Returns response ---------|
```

This approach has limitations:

1. **Server state dependency** : The server must store session information
2. **Scalability challenges** : Difficult to scale across multiple servers
3. **CORS limitations** : Cookies work best with same-origin requests

Token-based authentication addresses these limitations:

```
Client                                Server
  |                                     |
  |--- Login with username/password --->|
  |                                     | [Creates signed token]
  |<---------- Returns token ---------->|
  |                                     |
  |--- Request with token in header --->|
  |                                     | [Verifies token signature]
  |<--------- Returns response ---------|
```

### Why Token-Based Authentication Matters

> Token-based authentication shifts the responsibility of maintaining state from the server to the client.

Key advantages:

1. **Statelessness** : Servers don't need to store session information
2. **Scalability** : Easily works across multiple servers
3. **Cross-domain compatibility** : Works seamlessly across different domains
4. **Mobile-friendly** : Efficient for native mobile applications
5. **Microservices architecture** : Facilitates communication between services

## 2. JSON Web Tokens (JWT)

### What is a JWT?

> A JWT is a compact, self-contained way to securely transmit information between parties as a JSON object.

JWTs are:

* **Compact** : Small enough to be sent through URL, POST parameter, or HTTP header
* **Self-contained** : Include all necessary information about the user
* **Secure** : Digitally signed to ensure integrity

### Anatomy of a JWT

A JWT consists of three parts separated by dots:

* Header
* Payload
* Signature

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Let's break down each part:

1. **Header** : Contains the algorithm used and token type

```javascript
{
  "alg": "HS256",  // Algorithm used for signing
  "typ": "JWT"     // Token type
}
```

2. **Payload** : Contains the claims (statements about the user and additional data)

```javascript
{
  "sub": "1234567890",  // Subject (user id)
  "name": "John Doe",   // User name
  "iat": 1516239022     // Issued at timestamp
}
```

3. **Signature** : Ensures the token hasn't been altered

```javascript
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### Creating and Verifying JWTs in Node.js

Let's implement basic JWT functionality using the `jsonwebtoken` package:

```javascript
const jwt = require('jsonwebtoken');
const secret = 'your-secret-key';  // In production, use environment variables

// Creating a JWT
function generateToken(user) {
  // Set the token to expire in 1 hour
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour in seconds
  };
  
  return jwt.sign(payload, secret);
}

// Verifying a JWT
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secret);
    return { valid: true, expired: false, decoded };
  } catch (error) {
    return { 
      valid: false, 
      expired: error.name === 'TokenExpiredError',
      error: error.message 
    };
  }
}

// Example usage
const user = { id: '123', name: 'Alice', email: 'alice@example.com' };
const token = generateToken(user);
console.log('Generated token:', token);

const verification = verifyToken(token);
console.log('Verification result:', verification);
```

In this example:

* `generateToken` creates a JWT with user information and expiration time
* `verifyToken` checks if the token is valid and not expired
* We're using HMAC SHA-256 for signing (the default algorithm)

### Implementing JWT Authentication in Express

Now let's create a simple Express application with JWT authentication:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET = 'your-secret-key';  // In production, use environment variables

// Middleware
app.use(bodyParser.json());

// Mock user database
const users = [
  { id: 1, username: 'alice', password: 'password1', role: 'admin' },
  { id: 2, username: 'bob', password: 'password2', role: 'user' }
];

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
  
    req.user = user;
    next();
  });
}

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Create token
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET,
    { expiresIn: '1h' }
  );
  
  res.json({ token });
});

// Protected route
app.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'Protected data accessed successfully',
    user: req.user
  });
});

// Public route
app.get('/public', (req, res) => {
  res.json({ message: 'This is public data' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Let's break down what's happening:

1. We import the necessary packages and set up our Express app
2. We create a simple array of mock users (in a real app, you'd use a database)
3. We define an `authenticateToken` middleware that:
   * Extracts the token from the Authorization header
   * Verifies the token using our secret key
   * Attaches the decoded user information to the request object
4. We create a `/login` route that:
   * Finds the user based on username and password
   * Creates a JWT with the user's information
   * Returns the token to the client
5. We create a protected route `/profile` that requires authentication
6. We create a public route `/public` that doesn't require authentication

> Remember that in production applications, you should never store passwords in plain text. Always use a proper hashing algorithm like bcrypt.

## 3. OAuth 2.0

### What is OAuth 2.0?

> OAuth 2.0 is an authorization framework that enables third-party applications to obtain limited access to a user's account on a server.

OAuth 2.0 solves a fundamental problem: How can I give a third-party application access to my resources without sharing my credentials?

For example, when you click "Login with Google," you're using OAuth 2.0. The application doesn't get your Google password, but it does get permission to access certain data or perform actions on your behalf.

### Key Concepts in OAuth 2.0

OAuth 2.0 involves several roles:

1. **Resource Owner** : The user who owns the data (e.g., you)
2. **Client** : The application requesting access to the resources (e.g., a mobile app)
3. **Resource Server** : The server hosting the protected resources (e.g., Google's APIs)
4. **Authorization Server** : The server that authenticates the resource owner and issues access tokens (e.g., Google's OAuth server)

The general flow works like this:

```
Resource Owner                  Client                  Authorization Server                  Resource Server
     |                            |                              |                                   |
     |                            |                              |                                   |
     |                            |                              |                                   |
     |<-------- Requests ---------|                              |                                   |
     |        Authorization       |                              |                                   |
     |                            |                              |                                   |
     |--------- Grants ---------->|                              |                                   |
     |      Authorization         |                              |                                   |
     |                            |                              |                                   |
     |                            |------ Authorization -------->|                                   |
     |                            |         Request              |                                   |
     |                            |                              |                                   |
     |                            |<------ Access Token ---------|                                   |
     |                            |                              |                                   |
     |                            |                              |                                   |
     |                            |------------- Access Token ----------------------->|              |
     |                            |                                                   |              |
     |                            |<------------- Protected Resource -----------------|              |
```

### OAuth 2.0 Grant Types

OAuth 2.0 defines several "grant types" (flows) for different scenarios:

1. **Authorization Code** : Most common for web applications, involves a redirect to the authorization server
2. **Implicit** : Simplified flow for browser-based applications
3. **Resource Owner Password Credentials** : For trusted applications that can collect user credentials
4. **Client Credentials** : For server-to-server authentication without a user

### Implementing OAuth 2.0 Client in Node.js

Let's implement a simple OAuth 2.0 client using the `passport` and `passport-oauth2` libraries:

```javascript
const express = require('express');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Configure session middleware
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure OAuth 2.0 strategy
passport.use(new OAuth2Strategy({
    authorizationURL: 'https://provider.example.com/oauth2/authorize',
    tokenURL: 'https://provider.example.com/oauth2/token',
    clientID: 'your-client-id',
    clientSecret: 'your-client-secret',
    callbackURL: 'http://localhost:3000/auth/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // In a real application, you might look up the user in your database
    // or create a new user account
    return done(null, { id: '123', accessToken });
  }
));

// Serialize/deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // In a real app, you'd look up the user in your database
  done(null, { id: id });
});

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>OAuth 2.0 Client Example</h1>
    ${req.isAuthenticated() 
      ? `<p>Logged in! <a href="/profile">View Profile</a></p>` 
      : `<p><a href="/auth">Login</a></p>`}
  `);
});

// Start OAuth flow
app.get('/auth', passport.authenticate('oauth2'));

// OAuth callback
app.get('/auth/callback', 
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/profile');
  }
);

// Protected route
app.get('/profile', ensureAuthenticated, (req, res) => {
  res.send(`
    <h1>Profile</h1>
    <p>User ID: ${req.user.id}</p>
    <p>Access Token: ${req.user.accessToken}</p>
    <p><a href="/logout">Logout</a></p>
  `);
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

In this example:

1. We set up an Express app with session support
2. We configure Passport with the OAuth 2.0 strategy, providing:
   * The authorization URL (where users are redirected to log in)
   * The token URL (where we exchange the authorization code for tokens)
   * Client ID and client secret (identifying our application)
   * Callback URL (where the user returns after login)
3. We define routes for:
   * Starting the OAuth flow (`/auth`)
   * Handling the callback (`/auth/callback`)
   * A protected profile page (`/profile`)
   * Logging out (`/logout`)
4. We implement a simple authentication check middleware

> In production applications, you would store sensitive information like client secrets in environment variables, not hardcoded in your application.

## 4. OpenID Connect

### What is OpenID Connect?

> OpenID Connect is an identity layer built on top of OAuth 2.0 that allows clients to verify the identity of the end-user and obtain basic profile information.

While OAuth 2.0 is about authorization (what you're allowed to do), OpenID Connect is about authentication (who you are).

Key additions in OpenID Connect:

1. **ID Tokens** : JWT tokens that contain user identity information
2. **UserInfo Endpoint** : An API endpoint for fetching additional user details
3. **Standard Claims** : Standardized user attributes like name, email, etc.
4. **Discovery** : A way for clients to discover OpenID Connect providers' configuration

### Authentication Flow in OpenID Connect

The basic OpenID Connect flow is similar to OAuth 2.0's Authorization Code flow, with these additions:

1. The client includes `openid` in the `scope` parameter
2. The authorization server returns an ID token along with the access token
3. The client can verify the ID token locally and/or call the UserInfo endpoint

### ID Tokens vs. Access Tokens

In OpenID Connect, you'll work with two types of tokens:

 **ID Token** :

* Contains user identity information (claims)
* Formatted as a JWT
* Used to authenticate the user
* Example claims: user ID, name, email, etc.

 **Access Token** :

* Grants access to protected resources (just like in OAuth 2.0)
* May or may not be a JWT
* Used to authorize operations

### Implementing OpenID Connect in Node.js

Let's implement OpenID Connect using the `passport-openidconnect` library:

```javascript
const express = require('express');
const passport = require('passport');
const OpenIDStrategy = require('passport-openidconnect').Strategy;
const session = require('express-session');

const app = express();
const PORT = 3000;

// Configure session middleware
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure OpenID Connect strategy
passport.use(new OpenIDStrategy({
    issuer: 'https://accounts.example.com',
    authorizationURL: 'https://accounts.example.com/auth',
    tokenURL: 'https://accounts.example.com/token',
    userInfoURL: 'https://accounts.example.com/userinfo',
    clientID: 'your-client-id',
    clientSecret: 'your-client-secret',
    callbackURL: 'http://localhost:3000/auth/callback',
    scope: 'openid profile email'
  },
  function(issuer, profile, done) {
    // In a real application, you would:
    // 1. Check if the user exists in your database
    // 2. Create a new user if they don't exist
    // 3. Return the user object
  
    return done(null, {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value
    });
  }
));

// Serialize/deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>OpenID Connect Example</h1>
    ${req.isAuthenticated() 
      ? `<p>Logged in as ${req.user.displayName} <a href="/profile">View Profile</a></p>` 
      : `<p><a href="/auth">Login</a></p>`}
  `);
});

// Start OpenID Connect flow
app.get('/auth', passport.authenticate('openidconnect'));

// OpenID Connect callback
app.get('/auth/callback', 
  passport.authenticate('openidconnect', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    res.redirect('/profile');
  }
);

// Protected route
app.get('/profile', ensureAuthenticated, (req, res) => {
  res.send(`
    <h1>Profile</h1>
    <p>Display Name: ${req.user.displayName}</p>
    <p>Email: ${req.user.email}</p>
    <p><a href="/logout">Logout</a></p>
  `);
});

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

This implementation:

1. Configures Passport with the OpenID Connect strategy
2. Specifies the OpenID Connect endpoints (issuer, authorization, token, userinfo)
3. Requests specific scopes (`openid profile email`)
4. Processes the user profile returned from the identity provider
5. Sets up routes for authentication, callback, profile viewing, and logout

> When implementing OpenID Connect in production, consider using the Discovery endpoint to automatically configure your client rather than hardcoding endpoints.

## 5. Best Practices and Security Considerations

### Secure Token Storage

> Never store sensitive tokens in localStorage due to XSS vulnerabilities.

For browser-based applications:

* Store tokens in HttpOnly cookies (helps with XSS protection)
* Use secure and SameSite flags on cookies
* For SPAs, consider short-lived tokens with frequent renewal

For Node.js backends:

* Store tokens securely (e.g., in a database with encryption)
* Never log full tokens in your application logs

### Handling Token Expiration with Refresh Tokens

```javascript
const axios = require('axios');

async function refreshAccessToken(refreshToken) {
  try {
    const response = await axios.post('https://auth.example.com/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: 'your-client-id',
      client_secret: 'your-client-secret'
    });
  
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || refreshToken
    };
  } catch (error) {
    // Handle error (e.g., refresh token expired)
    console.error('Token refresh failed:', error.message);
    throw error;
  }
}

// Usage in an API call
async function fetchProtectedResource(url, tokens) {
  try {
    // Try with current access token
    return await axios.get(url, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
  } catch (error) {
    // If unauthorized (401), try refreshing the token
    if (error.response && error.response.status === 401 && tokens.refreshToken) {
      const newTokens = await refreshAccessToken(tokens.refreshToken);
    
      // Retry the request with the new access token
      return await axios.get(url, {
        headers: { Authorization: `Bearer ${newTokens.accessToken}` }
      });
    }
  
    // For other errors, or if refresh failed, propagate the error
    throw error;
  }
}
```

### JWT Security Best Practices

1. **Use strong, unique secrets** : Generate cryptographically secure secrets

```javascript
   const crypto = require('crypto');
   const secret = crypto.randomBytes(64).toString('hex');
```

1. **Set appropriate token expiration** : Balance security and user experience

```javascript
   // Short-lived access token (15 minutes)
   const accessToken = jwt.sign({ sub: user.id }, secret, { expiresIn: '15m' });

   // Longer-lived refresh token (7 days)
   const refreshToken = jwt.sign({ sub: user.id }, refreshSecret, { expiresIn: '7d' });
```

1. **Validate tokens properly** : Check all claims

```javascript
   function validateToken(token) {
     try {
       const decoded = jwt.verify(token, secret, {
         algorithms: ['HS256'], // Explicitly specify allowed algorithms
         issuer: 'your-app-name',
         audience: 'your-api'
       });
     
       // Additional custom validations
       if (decoded.permissions && !hasRequiredPermissions(decoded.permissions)) {
         return { valid: false, error: 'Insufficient permissions' };
       }
     
       return { valid: true, decoded };
     } catch (error) {
       return { valid: false, error: error.message };
     }
   }
```

1. **Use appropriate signature algorithms** : Prefer HMAC SHA-256 or RSA/ECDSA for asymmetric signing

### OAuth 2.0 and OpenID Connect Security Best Practices

1. **Validate redirect URIs** : Only allow pre-registered redirect URIs
2. **Use PKCE for public clients** : Prevents authorization code interception
3. **Validate state parameter** : Prevents CSRF attacks
4. **Validate ID tokens** : Check signature, issuer, audience, and expiration
5. **Use short-lived access tokens** : Limit the damage if a token is compromised

### Example: Implementing PKCE in Node.js

PKCE (Proof Key for Code Exchange) is crucial for securing OAuth flows in public clients:

```javascript
const crypto = require('crypto');
const base64url = require('base64url');

// Step 1: Generate code verifier (random string)
function generateCodeVerifier() {
  return base64url(crypto.randomBytes(32));
}

// Step 2: Generate code challenge from verifier
function generateCodeChallenge(verifier) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64url(hash);
}

// Usage
const codeVerifier = generateCodeVerifier();
const codeChallenge = generateCodeChallenge(codeVerifier);

// Store codeVerifier securely (e.g., in session)
req.session.codeVerifier = codeVerifier;

// Add codeChallenge to authorization request
const authorizationUrl = `https://auth.example.com/authorize?
  response_type=code&
  client_id=your-client-id&
  redirect_uri=your-redirect-uri&
  scope=openid%20profile&
  code_challenge=${codeChallenge}&
  code_challenge_method=S256`;
```

Then, when exchanging the authorization code for tokens:

```javascript
// Retrieve the code verifier from session
const codeVerifier = req.session.codeVerifier;

// Include it in the token request
const tokenResponse = await axios.post('https://auth.example.com/token', {
  grant_type: 'authorization_code',
  code: authorizationCode,
  redirect_uri: 'your-redirect-uri',
  client_id: 'your-client-id',
  code_verifier: codeVerifier
});
```

## 6. Putting It All Together

Let's create a complete Express application that demonstrates all three authentication mechanisms:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const OpenIDStrategy = require('passport-openidconnect').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// Middleware
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

// Mock user database
const users = [
  { id: 1, username: 'user1', password: 'password1' }
];

// Passport session serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // In a real app, look up user in database
  const user = users.find(u => u.id === id);
  done(null, user || null);
});

// Routes for JWT authentication
const jwtRouter = express.Router();

// JWT login
jwtRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { sub: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  res.json({ token });
});

// JWT protected route
jwtRouter.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

// Set up OAuth 2.0 (simplified for example purposes)
passport.use('oauth2', new OAuth2Strategy({
    authorizationURL: 'https://provider.example.com/oauth/authorize',
    tokenURL: 'https://provider.example.com/oauth/token',
    clientID: process.env.OAUTH_CLIENT_ID || 'your-client-id',
    clientSecret: process.env.OAUTH_CLIENT_SECRET || 'your-client-secret',
    callbackURL: 'http://localhost:3000/oauth/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // In a real app, you might look up or create a user
    return done(null, { id: 2, provider: 'oauth', accessToken });
  }
));

// Set up OpenID Connect
passport.use('oidc', new OpenIDStrategy({
    issuer: 'https://accounts.example.com',
    authorizationURL: 'https://accounts.example.com/auth',
    tokenURL: 'https://accounts.example.com/token',
    userInfoURL: 'https://accounts.example.com/userinfo',
    clientID: process.env.OIDC_CLIENT_ID || 'your-oidc-client-id',
    clientSecret: process.env.OIDC_CLIENT_SECRET || 'your-oidc-client-secret',
    callbackURL: 'http://localhost:3000/openid/callback',
    scope: 'openid profile email'
  },
  function(issuer, profile, done) {
    return done(null, {
      id: 3,
      provider: 'oidc',
      displayName: profile.displayName,
      email: profile.emails[0].value
    });
  }
));

// OAuth routes
app.get('/oauth', passport.authenticate('oauth2'));
app.get('/oauth/callback', 
  passport.authenticate('oauth2', { failureRedirect: '/' }),
  (req, res) => res.redirect('/oauth/profile')
);
app.get('/oauth/profile', ensureAuthenticated, (req, res) => {
  res.json({ user: req.user, auth: 'OAuth 2.0' });
});

// OpenID Connect routes
app.get('/openid', passport.authenticate('oidc'));
app.get('/openid/callback',
  passport.authenticate('oidc', { failureRedirect: '/' }),
  (req, res) => res.redirect('/openid/profile')
);
app.get('/openid/profile', ensureAuthenticated, (req, res) => {
  res.json({ user: req.user, auth: 'OpenID Connect' });
});

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// Add JWT routes under /jwt prefix
app.use('/jwt', jwtRouter);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Authentication API',
    endpoints: {
      jwt: {
        login: 'POST /jwt/login',
        profile: 'GET /jwt/profile'
      },
      oauth: {
        login: 'GET /oauth',
        callback: 'GET /oauth/callback',
        profile: 'GET /oauth/profile'
      },
      openid: {
        login: 'GET /openid',
        callback: 'GET /openid/callback',
        profile: 'GET /openid/profile'
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

This example demonstrates:

1. **JWT Authentication** :

* Simple username/password login
* Token verification for protected routes

1. **OAuth 2.0** :

* Authorization Code flow
* Protected resource access

1. **OpenID Connect** :

* Authentication and user profile retrieval
* Protected profile endpoint

> In a production application, you would implement additional security measures, error handling, and proper user storage.

## 7. Conclusion

> "The best authentication is the one that's both secure and user-friendly."

In this guide, we've explored token-based authentication from first principles:

1. **JWT** : Simple, compact tokens that are perfect for API authentication
2. **OAuth 2.0** : A robust framework for delegated authorization
3. **OpenID Connect** : An identity layer that adds authentication to OAuth 2.0

Each of these technologies has its place in modern application architecture:

* Use **JWT** for simple, stateless API authentication
* Use **OAuth 2.0** when you need to access resources on behalf of a user
* Use **OpenID Connect** when you need user authentication and identity information

By understanding these technologies and implementing them securely in your Node.js applications, you can build systems that are both secure and user-friendly. Remember that security is an ongoing process, not a one-time implementation – stay updated on best practices and regularly review your authentication mechanisms.
