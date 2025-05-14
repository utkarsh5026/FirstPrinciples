# User Identity Management Best Practices in Node.js

## First Principles of Identity Management

Identity management is a fundamental aspect of application security that answers a deceptively simple question: "Who is using my application right now?" Let's build our understanding from first principles.

> The core purpose of identity management is to verify that users are who they claim to be and to determine what they're allowed to do within your application.

### What Is Identity?

At its most basic level, digital identity is a set of attributes that uniquely identifies an entity (usually a person) in a digital system. These attributes typically include:

* A unique identifier (username, email, UUID)
* Authentication factors (what you know, have, or are)
* Permissions and access rights

## Authentication vs. Authorization

Before diving into implementations, it's crucial to understand the difference between these two concepts:

1. **Authentication** : The process of verifying who someone is
2. **Authorization** : The process of determining what they can do

Let's examine a simple real-world example:

> Imagine an airport. Authentication is like checking your passport at security (proving who you are). Authorization is like checking your boarding pass to see which flight you can board and whether you have access to the priority lounge.

## Core Security Principles for Identity Management

When building identity systems, several principles guide secure implementation:

### 1. Defense in Depth

Never rely on a single security measure. Layer your defenses so that if one fails, others remain intact.

### 2. Principle of Least Privilege

Users should have only the minimum permissions necessary to perform their tasks.

### 3. Fail Securely

When systems fail, they should default to a secure state (closed) rather than an open one.

### 4. Separation of Concerns

Authentication logic should be separate from business logic.

## Implementing Authentication in Node.js

Let's start with the basics of authentication in Node.js applications.

### Password-Based Authentication

Password authentication remains common despite its limitations. Here's how to implement it securely:

```javascript
// Import required packages
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  }
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's new or modified
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt with appropriate cost factor
    const salt = await bcrypt.genSalt(12);
  
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
```

This example demonstrates several important security practices:

1. **Using bcrypt for password hashing** - a specialized algorithm designed for password security with configurable work factors
2. **Appropriate salt rounds** - making the hash computationally expensive to thwart brute force attacks
3. **Pre-save hook** - automatically securing passwords before they're stored
4. **Password comparison method** - safely comparing passwords without exposing the hashed value

> **Critical security principle** : Never store plaintext passwords. Always use a strong, specialized password hashing algorithm like bcrypt, Argon2, or PBKDF2.

Now let's implement a basic login route:

```javascript
// Login route
app.post('/login', async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });
  
    // User not found
    if (!user) {
      // Important: Use consistent response times to prevent timing attacks
      await bcrypt.compare(req.body.password, '$2b$12$' + 'x'.repeat(53));
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Compare passwords
    const isMatch = await user.comparePassword(req.body.password);
  
    // Invalid password
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Authentication successful - generate session or token here
    // We'll cover this in the next section
  
    res.json({ message: 'Authentication successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

This login route demonstrates several best practices:

1. **Consistent response times** - By performing a dummy hash comparison when a user isn't found, we prevent timing attacks that could reveal whether an email exists in our system
2. **Generic error messages** - We don't tell attackers whether the email or password was incorrect
3. **Structured error handling** - All operations are in a try/catch block

## Session Management vs. JWT Authentication

There are two primary approaches to managing user sessions after authentication:

### Server-Side Sessions

Traditional session management involves:

1. Storing session data on the server
2. Providing the client with a session ID (usually in a cookie)
3. Looking up the session data on each request

Let's implement basic session management:

```javascript
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Configure session middleware
app.use(session({
  // This secret is used to sign the session ID cookie
  secret: process.env.SESSION_SECRET,
  
  // Don't save session if nothing changed
  resave: false,
  
  // Don't create session until something is stored
  saveUninitialized: false,
  
  // Store sessions in MongoDB
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  
    // Auto-remove expired sessions
    autoRemove: 'interval',
    autoRemoveInterval: 60 // In minutes
  }),
  
  // Cookie settings
  cookie: {
    // Prevents client JavaScript from accessing the cookie
    httpOnly: true,
  
    // Only send cookie over HTTPS in production
    secure: process.env.NODE_ENV === 'production',
  
    // Prevents sending cookie to other domains
    sameSite: 'strict',
  
    // Cookie expiration (2 weeks)
    maxAge: 14 * 24 * 60 * 60 * 1000
  }
}));

// Login route with session
app.post('/login', async (req, res) => {
  // ... authentication logic from previous example
  
  // If authentication successful, store user info in session
  req.session.userId = user._id;
  req.session.userRole = user.role;
  
  res.json({ message: 'Authentication successful' });
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Protected route example
app.get('/profile', requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.json({ profile: user });
});
```

This implementation highlights several session management best practices:

1. **Environment variables** for sensitive configuration
2. **HttpOnly cookies** to prevent XSS attacks from stealing the session ID
3. **Secure flag** to ensure cookies only travel over HTTPS
4. **SameSite policy** to prevent CSRF attacks
5. **Session expiration** to limit the window of opportunity for session hijacking
6. **Session storage in a database** rather than in-memory (which wouldn't work in scaled deployments)

> **Security tip** : Never store sensitive data like passwords or credit card numbers in the session. Store only what's necessary for authentication and authorization.

### JWT-Based Authentication

JSON Web Tokens (JWTs) offer a stateless alternative to server-side sessions:

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

// Login route with JWT
app.post('/login', async (req, res) => {
  // ... authentication logic from previous example
  
  // If authentication successful, create a JWT
  const token = jwt.sign(
    { 
      userId: user._id,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '2h' // Token expires in 2 hours
    }
  );
  
  // Return the token to the client
  res.json({ token });
});

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    // Attach user data to the request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Protected route example
app.get('/profile', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ profile: user });
});
```

JWT implementation best practices demonstrated:

1. **Limited payload** - Only essential data in the token
2. **Short expiration** - Limiting the window of vulnerability
3. **Proper verification** - Using the secret key to validate tokens
4. **Error handling** - Properly handling invalid tokens

> **JWT security caution** : JWTs are signed but not encrypted by default. Don't put sensitive data in the payload unless you also encrypt it.

## Role-Based Access Control (RBAC)

Once a user is authenticated, we need to control what they can access. RBAC is a common approach:

```javascript
// Role-based middleware
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    // For session-based auth
    if (req.session && req.session.userRole === requiredRole) {
      return next();
    }
  
    // For JWT-based auth
    if (req.user && req.user.role === requiredRole) {
      return next();
    }
  
    res.status(403).json({ message: 'Insufficient permissions' });
  };
};

// Admin-only route
app.get('/admin/dashboard', authenticateJWT, checkRole('admin'), (req, res) => {
  res.json({ adminData: 'Sensitive admin data' });
});

// User-specific route with parameter validation
app.get('/users/:userId/data', authenticateJWT, (req, res) => {
  // Prevent users from accessing other users' data
  // This prevents a horizontal privilege escalation
  if (req.params.userId !== req.user.userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  // Proceed with fetching user data
  // ...
});
```

This example demonstrates:

1. **Role-based middleware** to restrict access based on user roles
2. **Parameter validation** to prevent horizontal privilege escalation

## Security Best Practices for Identity Management

### 1. Password Policies and Management

Implement strong password requirements:

```javascript
// Password validation function
function validatePassword(password) {
  // Minimum 8 characters
  if (password.length < 8) return false;
  
  // Contains uppercase
  if (!/[A-Z]/.test(password)) return false;
  
  // Contains lowercase
  if (!/[a-z]/.test(password)) return false;
  
  // Contains numbers
  if (!/[0-9]/.test(password)) return false;
  
  // Contains special characters
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
}

// Usage during registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!validatePassword(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters'
    });
  }
  
  // Continue with registration process
  // ...
});
```

### 2. Rate Limiting to Prevent Brute Force

```javascript
const rateLimit = require('express-rate-limit');

// Apply rate limiting to authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
});

// Apply to login route
app.post('/login', authLimiter, async (req, res) => {
  // Login logic
});
```

### 3. Account Lockout Policies

Implement temporary lockouts after failed login attempts:

```javascript
const mongoose = require('mongoose');

// Enhanced user schema with lockout fields
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number, default: 0 }
});

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
  return this.lockUntil && this.lockUntil > Date.now();
});

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // Reset if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Lock the account if we've reached max attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    // Lock for 1 hour
    updates.$set = { lockUntil: Date.now() + 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Enhanced login route
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
  
    // Check if account is locked
    if (user && user.isLocked) {
      await user.incrementLoginAttempts();
      return res.status(401).json({
        message: 'Account is temporarily locked. Try again later.'
      });
    }
  
    // User not found or password doesn't match
    if (!user || !(await user.comparePassword(req.body.password))) {
      if (user) {
        await user.incrementLoginAttempts();
      }
    
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Success - reset login attempts
    await user.resetLoginAttempts();
  
    // Continue with authentication process
    // ...
  
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
```

This implementation:

1. Tracks failed login attempts
2. Automatically locks accounts after multiple failures
3. Uses time-based lockouts rather than permanent ones
4. Resets counters on successful login

### 4. Multi-Factor Authentication (MFA)

Implementing time-based one-time passwords (TOTP) for MFA:

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate MFA secret during enrollment
app.post('/enable-mfa', authenticateJWT, async (req, res) => {
  // Generate a secret
  const secret = speakeasy.generateSecret({
    name: `MyApp:${req.user.email}`
  });
  
  // Store the secret in the user's record
  await User.findByIdAndUpdate(req.user.userId, {
    mfaSecret: secret.base32,
    mfaEnabled: false // Not enabled until verified
  });
  
  // Generate QR code for easy enrollment
  QRCode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
    if (err) {
      return res.status(500).json({ message: 'Error generating QR code' });
    }
  
    res.json({
      message: 'MFA initialized',
      secret: secret.base32,
      qrCode: dataUrl
    });
  });
});

// Verify MFA setup with a test token
app.post('/verify-mfa', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.userId);
  
  // Verify the token against the stored secret
  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: req.body.token,
    window: 1 // Allow 1 period before/after for clock drift
  });
  
  if (!verified) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }
  
  // Enable MFA for this user
  await User.findByIdAndUpdate(req.user.userId, {
    mfaEnabled: true
  });
  
  res.json({ message: 'MFA enabled successfully' });
});

// Enhanced login with MFA
app.post('/login', async (req, res) => {
  // ... basic authentication logic
  
  // Check if MFA is required
  if (user.mfaEnabled) {
    if (!req.body.mfaToken) {
      // Return special status to indicate MFA is needed
      return res.status(200).json({ 
        requiresMfa: true,
        // Provide a temporary token that only allows MFA verification
        tempToken: jwt.sign(
          { userId: user._id, mfaRequired: true },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        )
      });
    }
  
    // Verify the MFA token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: req.body.mfaToken,
      window: 1
    });
  
    if (!verified) {
      return res.status(401).json({ message: 'Invalid MFA token' });
    }
  }
  
  // If we get here, either MFA is not required or it verified successfully
  // Continue with full authentication
  // ...
});
```

This MFA implementation demonstrates:

1. **Secret generation** with user-specific naming
2. **QR code generation** for easy scanning with authenticator apps
3. **Verification flow** to ensure proper setup
4. **Two-step login process** when MFA is enabled
5. **Temporary tokens** for the MFA challenge

> **MFA best practice** : Implement recovery options like backup codes for users who lose access to their authentication devices.

### 5. OAuth and Social Login Integration

OAuth allows users to authenticate via third-party providers like Google or GitHub:

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure passport with Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://yourdomain.com/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });
    
      if (!user) {
        // Create new user if first time sign-in
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          // No password for OAuth users
          authMethod: 'google'
        });
      }
    
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Initialize passport middleware
app.use(passport.initialize());

// Routes for Google auth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate JWT or session for the authenticated user
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  
    // Redirect to frontend with token
    res.redirect(`/auth-success?token=${token}`);
  }
);
```

This OAuth implementation shows:

1. **Separate account storage** for social logins
2. **Profile data mapping** from the provider to your system
3. **Stateless authentication** with JWT after OAuth completes

## Advanced Security Considerations

### 1. CSRF Protection

For session-based authentication, CSRF protection is essential:

```javascript
const csrf = require('csurf');

// CSRF protection middleware
const csrfProtection = csrf({ 
  cookie: {
    // Same cookie settings as session
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  } 
});

// Apply to all routes that change state
app.post('/api/profile/update', csrfProtection, (req, res) => {
  // Check if CSRF token is valid
  // csurf middleware handles this automatically
  
  // Process the update
  // ...
});

// Provide CSRF token to client
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### 2. Security Headers

Implement security headers to further protect your application:

```javascript
const helmet = require('helmet');

// Apply security headers
app.use(helmet());

// Configure Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'trusted-cdn.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'trusted-cdn.com'],
    imgSrc: ["'self'", 'data:', 'trusted-cdn.com'],
    connectSrc: ["'self'", 'api.yourdomain.com'],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
}));
```

### 3. Account Recovery and Password Reset

Secure password reset implementation:

```javascript
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Request password reset
app.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
  
    // Always return the same response whether user exists or not
    // This prevents email enumeration
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }
  
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour
  
    // Save the token and expiration
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();
  
    // Create reset URL
    const resetUrl = `https://yourdomain.com/reset-password?token=${token}`;
  
    // Send email with reset link
    const transporter = nodemailer.createTransport({
      // Email configuration
      // ...
    });
  
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      text: `To reset your password, click: ${resetUrl}`
      // HTML version also recommended
    });
  
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request' });
  }
});

// Reset password with token
app.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
  
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
  
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
  
    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: 'Password does not meet requirements'
      });
    }
  
    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  
    // Invalidate all existing sessions/tokens for this user
    // This depends on your authentication strategy
  
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error processing request' });
  }
});
```

This password reset flow demonstrates:

1. **Time-limited tokens** for security
2. **Secure random token generation**
3. **Email delivery** of reset instructions
4. **Consistent responses** to prevent user enumeration
5. **Token invalidation** after use
6. **Session invalidation** after password change

### 4. Logging and Monitoring

Implement security-focused logging:

```javascript
const winston = require('winston');

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    // In production, consider sending logs to a centralized service
  ]
});

// Security event logging middleware
const logSecurityEvent = (event) => {
  return (req, res, next) => {
    // Log the event with relevant information
    logger.info({
      event,
      user: req.user ? req.user.userId : 'anonymous',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
  
    next();
  };
};

// Apply to security-critical routes
app.post('/login', logSecurityEvent('login_attempt'), async (req, res) => {
  // Login logic
});

app.post('/reset-password', logSecurityEvent('password_reset'), async (req, res) => {
  // Reset logic
});

// Log failed authentication attempts
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    logger.warn({
      event: 'authentication_failure',
      error: err.message,
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    });
  }
  next(err);
});
```

This logging system:

1. Captures security-relevant events
2. Includes contextual information like IP address and user agent
3. Uses structured logging for easier analysis
4. Applies to authentication-related endpoints

## Testing Identity Systems

### Unit Testing Authentication Logic

```javascript
const chai = require('chai');
const expect = chai.expect;
const bcrypt = require('bcrypt');
const User = require('../models/user');
const mongoose = require('mongoose');

describe('User Model', () => {
  before(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost/test-db');
  });
  
  after(async () => {
    // Clean up
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });
  
  it('should hash password before saving', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Password123!'
    };
  
    const user = new User(userData);
    await user.save();
  
    // Password should be hashed
    expect(user.password).to.not.equal(userData.password);
  
    // Should be a bcrypt hash
    expect(user.password).to.match(/^\$2[aby]\$\d+\$/);
  });
  
  it('should correctly compare passwords', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'Password123!'
    });
  
    await user.save();
  
    // Correct password should match
    const correctMatch = await user.comparePassword('Password123!');
    expect(correctMatch).to.be.true;
  
    // Incorrect password should not match
    const incorrectMatch = await user.comparePassword('WrongPassword');
    expect(incorrectMatch).to.be.false;
  });
});
```

### Integration Testing Authentication Routes

```javascript
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');

chai.use(chaiHttp);

describe('Authentication Routes', () => {
  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  
    // Create a test user
    await User.create({
      email: 'test@example.com',
      password: 'Password123!'
    });
  });
  
  describe('POST /login', () => {
    it('should authenticate with correct credentials', async () => {
      const res = await chai.request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
    
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('token');
    });
  
    it('should reject with incorrect password', async () => {
      const res = await chai.request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });
    
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('message', 'Invalid credentials');
    });
  
    it('should reject non-existent user', async () => {
      const res = await chai.request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });
    
      expect(res).to.have.status(401);
      expect(res.body).to.have.property('message', 'Invalid credentials');
    });
  });
  
  describe('Protected Routes', () => {
    it('should allow access with valid token', async () => {
      // First login to get token
      const loginRes = await chai.request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });
    
      const token = loginRes.body.token;
    
      // Access protected route
      const res = await chai.request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`);
    
      expect(res).to.have.status(200);
    });
  
    it('should deny access without token', async () => {
      const res = await chai.request(app)
        .get('/profile');
    
      expect(res).to.have.status(401);
    });
  });
});
```

## Summary: Comprehensive Best Practices

> **Authentication fundamentals** : Use modern password hashing (bcrypt, Argon2), implement proper password policies, provide secure account recovery, and consider multi-factor authentication.

> **Session management** : Use secure cookies (HttpOnly, Secure, SameSite), implement proper expiration, and consider security implications of your session storage.

> **JWT best practices** : Keep tokens short-lived, store them securely, implement proper signing with strong secrets, and avoid sensitive data in payloads.

> **Authorization** : Implement proper access control checks, validate parameters to prevent privilege escalation, and follow the principle of least privilege.

> **Security headers** : Use libraries like Helmet to configure proper headers that protect against common web vulnerabilities.

By building your Node.js identity management system with these principles and best practices, you create a strong foundation for application security. Remember that security is an ongoing process - continually update your knowledge and systems as new vulnerabilities and countermeasures emerge.
