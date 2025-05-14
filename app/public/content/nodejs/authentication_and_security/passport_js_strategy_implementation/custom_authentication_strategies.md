# Custom Authentication Strategies in Passport.js

Let me take you on a comprehensive journey through custom authentication strategies in Passport.js, building everything from the absolute first principles.

## Understanding Authentication at Its Core

Before we dive into Passport.js, let's understand what authentication actually means.

> **Authentication is the process of verifying that someone or something is who they claim to be.**

Think of it like checking someone's ID at a store. The person claims they are John Doe, and you verify this by looking at their driver's license. In web applications, this process happens when users provide credentials (like username and password) to prove their identity.

### Why Do We Need Authentication?

In web applications, authentication serves several crucial purposes:

1. **Access Control** : Ensuring only authorized users can access specific resources
2. **Personalization** : Delivering customized content based on user identity
3. **Security** : Protecting sensitive data from unauthorized access
4. **Accountability** : Tracking who did what in your application

## What is Passport.js?

> **Passport.js is authentication middleware for Node.js that makes implementing authentication in your application significantly easier.**

Imagine Passport.js as a universal adapter that can work with hundreds of different "identity verification methods" (like checking different types of IDs). Instead of you writing code for each authentication method, Passport provides a consistent interface.

### The Core Philosophy of Passport

Passport operates on two fundamental concepts:

1. **Strategies** : Different methods of authentication (local login, Google OAuth, custom methods)
2. **Sessions** : Maintaining user state across requests

Let's understand this with a simple analogy: If authentication were a security checkpoint at an airport, strategies would be the different ways to verify identity (passport, license, biometric scan), and sessions would be the wristband that proves you've already been verified.

## How Passport Works - The Fundamental Flow

Before creating custom strategies, let's understand how Passport works internally:

```javascript
// Basic Passport setup - understand this first
const passport = require('passport');
const express = require('express');
const app = express();

// Step 1: Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Step 2: Configure a strategy (we'll create custom ones later)
// Step 3: Use the strategy in routes
// Step 4: Handle serialization/deserialization
```

### The Authentication Flow Explained

```
Client Request → Strategy → Verify Function → User Object → Session
                    ↓
            (Custom Logic Here)
```

Let me explain each step:

1. **Client Request** : User submits credentials
2. **Strategy** : Passport picks the appropriate strategy
3. **Verify Function** : Your custom code validates the credentials
4. **User Object** : If valid, return user data
5. **Session** : Store user info for subsequent requests

## Understanding Passport Strategies

> **A strategy is like a blueprint that defines how Passport should authenticate users with a specific method.**

Every strategy has three main components:

1. **Name** : A unique identifier for the strategy
2. **Options** : Configuration settings
3. **Verify Function** : The actual authentication logic

### The Anatomy of a Strategy

```javascript
// Basic strategy structure
passport.use('custom-strategy-name', new CustomStrategy(
    // Options object
    {
        field1: 'value1',
        field2: 'value2'
    },
    // Verify function
    function(data, done) {
        // Your authentication logic here
        // done(error, user, info)
    }
));
```

## Creating Custom Strategies - From Scratch

Now let's build our understanding of custom strategies step by step.

### Why Create Custom Strategies?

Custom strategies are needed when:

1. You have unique authentication requirements
2. Existing strategies don't fit your needs
3. You're integrating with custom authentication systems
4. You need to add additional validation logic

### Building a Simple Custom Strategy

Let's start with the simplest possible custom strategy:

```javascript
// Step 1: Import Passport Strategy base class
const Strategy = require('passport-strategy').Strategy;

// Step 2: Create our custom strategy class
class SimpleCustomStrategy extends Strategy {
    constructor(options, verify) {
        super();
        // Store options for later use
        this.name = 'simple-custom';
        this._verify = verify;
        this._userField = options.userField || 'username';
        this._passwordField = options.passwordField || 'password';
    }
  
    // Step 3: Implement the authenticate method
    authenticate(req, options) {
        // Extract credentials from request
        const username = req.body[this._userField];
        const password = req.body[this._passwordField];
      
        // Basic validation
        if (!username || !password) {
            return this.fail({ message: 'Missing credentials' });
        }
      
        // Call verify function with credentials
        const verified = (err, user, info) => {
            if (err) { return this.error(err); }
            if (!user) { return this.fail(info); }
            return this.success(user, info);
        };
      
        // Execute verification with our callback
        this._verify(username, password, verified);
    }
}

// Step 4: Use the strategy
passport.use(new SimpleCustomStrategy(
    { userField: 'email', passwordField: 'pwd' },
    function(email, password, done) {
        // Your verification logic
        User.findOne({ email: email }, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Unknown user' }); }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Invalid password' });
            }
            return done(null, user);
        });
    }
));
```

### Deep Dive: How This Works

Let me explain each part of this custom strategy in detail:

**1. Extending the Base Strategy Class**

```javascript
class SimpleCustomStrategy extends Strategy {
    // This gives us access to Passport's core methods
    // like success(), fail(), error(), etc.
}
```

The base `Strategy` class provides essential methods that communicate with Passport's core:

* `success()`: Authentication succeeded
* `fail()`: Authentication failed
* `error()`: An error occurred during authentication
* `pass()`: Skip this strategy (rarely used)

**2. The Constructor Pattern**

```javascript
constructor(options, verify) {
    super();  // Call parent constructor
    this.name = 'simple-custom';  // Strategy identifier
    this._verify = verify;        // Store verification function
    // Store configurable field names
    this._userField = options.userField || 'username';
    this._passwordField = options.passwordField || 'password';
}
```

This pattern allows flexible configuration. When someone uses your strategy, they can customize field names:

```javascript
// Flexible usage
new SimpleCustomStrategy({ userField: 'email' }, verify);
// OR
new SimpleCustomStrategy({ userField: 'phone' }, verify);
```

**3. The authenticate Method - The Heart of Strategy**

```javascript
authenticate(req, options) {
    // 1. Extract data from request
    // 2. Validate input
    // 3. Call verification function
    // 4. Handle results
}
```

This method is automatically called by Passport when the strategy is used. It receives:

* `req`: The Express request object
* `options`: Any additional options passed during usage

## Advanced Custom Strategy Patterns

Now let's explore more sophisticated patterns for custom strategies.

### Token-Based Authentication Strategy

```javascript
// Token-based custom strategy
class TokenStrategy extends Strategy {
    constructor(options, verify) {
        super();
        this.name = 'token';
        this._headerField = options.headerField || 'x-auth-token';
        this._queryField = options.queryField || 'token';
        this._verify = verify;
    }
  
    authenticate(req, options) {
        // Check multiple locations for token
        let token = req.get(this._headerField) ||    // Header
                    req.query[this._queryField] ||   // Query string
                    req.body.token;                  // Body
      
        if (!token) {
            return this.fail({ message: 'No token provided' });
        }
      
        // Custom token verification
        const self = this;
        this._verify(token, function(err, user, info) {
            if (err) { return self.error(err); }
            if (!user) { return self.fail(info); }
            self.success(user, info);
        });
    }
}

// Usage example
passport.use(new TokenStrategy(
    { 
        headerField: 'Authorization',
        queryField: 'access_token'
    },
    function(token, done) {
        // JWT verification example
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if (err) { return done(err); }
          
            User.findById(decoded.userId, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        });
    }
));
```

### API Key Authentication Strategy

```javascript
// API Key authentication strategy
class ApiKeyStrategy extends Strategy {
    constructor(options, verify) {
        super();
        this.name = 'apikey';
        this._keyField = options.keyField || 'x-api-key';
        this._verify = verify;
        this._passReqToCallback = options.passReqToCallback;
    }
  
    authenticate(req, options) {
        const apiKey = req.get(this._keyField);
      
        if (!apiKey) {
            return this.fail({ message: 'API key required' });
        }
      
        const verified = (err, user, info) => {
            if (err) { return this.error(err); }
            if (!user) { return this.fail(info); }
            this.success(user, info);
        };
      
        // Optionally pass request to verify function
        if (this._passReqToCallback) {
            this._verify(req, apiKey, verified);
        } else {
            this._verify(apiKey, verified);
        }
    }
}
```

## Handling Complex Authentication Flows

### Multi-Factor Authentication Strategy

```javascript
// Two-factor authentication strategy
class TwoFactorStrategy extends Strategy {
    constructor(options, verify) {
        super();
        this.name = 'two-factor';
        this._codeField = options.codeField || 'code';
        this._sessionField = options.sessionField || 'twoFactorSession';
        this._verify = verify;
    }
  
    authenticate(req, options) {
        // Check if we have a two-factor session
        const twoFactorSession = req.session[this._sessionField];
      
        if (!twoFactorSession) {
            return this.fail({ message: 'No two-factor session' });
        }
      
        // Get the verification code
        const code = req.body[this._codeField];
      
        if (!code) {
            return this.fail({ message: 'Verification code required' });
        }
      
        const self = this;
        this._verify(twoFactorSession.userId, code, function(err, user, info) {
            if (err) { return self.error(err); }
            if (!user) { return self.fail(info); }
          
            // Clear the two-factor session on success
            delete req.session[self._sessionField];
            self.success(user, info);
        });
    }
}
```

## Integrating Custom Strategies in Your Application

### Setting Up Multiple Strategies

```javascript
// Complete integration example
const express = require('express');
const passport = require('passport');
const session = require('express-session');

const app = express();

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Register custom strategies
passport.use(new SimpleCustomStrategy(options, verify));
passport.use(new TokenStrategy(options, verify));
passport.use(new ApiKeyStrategy(options, verify));

// Serialization setup
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

// Using strategies in routes
app.post('/login', 
    passport.authenticate('simple-custom', { 
        successRedirect: '/dashboard',
        failureRedirect: '/login'
    })
);

app.get('/api/protected',
    passport.authenticate('token', { session: false }),
    (req, res) => {
        res.json({ user: req.user });
    }
);
```

## Best Practices for Custom Strategies

### 1. Error Handling

> **Always handle errors gracefully and provide meaningful feedback to users while keeping security in mind.**

```javascript
authenticate(req, options) {
    try {
        // Your authentication logic
    } catch (err) {
        // Log the actual error (for debugging)
        console.error('Authentication error:', err);
      
        // Return generic error to user
        return this.error(new Error('Authentication failed'));
    }
}
```

### 2. Security Considerations

```javascript
// Example of secure token verification
class SecureTokenStrategy extends Strategy {
    authenticate(req, options) {
        const token = this.extractToken(req);
      
        if (!token) {
            return this.fail({ message: 'No token provided' }, 401);
        }
      
        // Rate limiting
        if (this.checkRateLimit(req)) {
            return this.fail({ message: 'Too many attempts' }, 429);
        }
      
        // Secure verification
        this.verifyToken(token)
            .then(user => this.success(user))
            .catch(err => {
                // Log for security monitoring
                this.logSecurityEvent(req, err);
                this.fail({ message: 'Invalid token' }, 401);
            });
    }
}
```

### 3. Async/Await Pattern

```javascript
// Modern async strategy implementation
class AsyncStrategy extends Strategy {
    async authenticate(req, options) {
        try {
            const token = this.extractToken(req);
          
            if (!token) {
                return this.fail({ message: 'No token provided' });
            }
          
            // Async verification
            const user = await this.verifyTokenAsync(token);
          
            if (!user) {
                return this.fail({ message: 'Invalid credentials' });
            }
          
            this.success(user);
        } catch (err) {
            this.error(err);
        }
    }
  
    async verifyTokenAsync(token) {
        // Modern promise-based verification
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) return reject(err);
                User.findById(decoded.id)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }
}
```

## Testing Custom Strategies

```javascript
// Unit testing custom strategies
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

describe('SimpleCustomStrategy', () => {
    let strategy;
    let req;
    let verify;
  
    beforeEach(() => {
        verify = sinon.stub();
        strategy = new SimpleCustomStrategy({}, verify);
        req = {
            body: {},
            session: {}
        };
    });
  
    it('should fail when no credentials provided', (done) => {
        // Mock the fail method
        strategy.fail = (info) => {
            expect(info.message).to.equal('Missing credentials');
            done();
        };
      
        strategy.authenticate(req);
    });
  
    it('should call verify with correct arguments', (done) => {
        req.body.username = 'testuser';
        req.body.password = 'testpass';
      
        verify.callsFake((username, password, cb) => {
            expect(username).to.equal('testuser');
            expect(password).to.equal('testpass');
            cb(null, { id: 1, username: 'testuser' });
        });
      
        strategy.success = (user) => {
            expect(user.id).to.equal(1);
            done();
        };
      
        strategy.authenticate(req);
    });
});
```

## Conclusion

Creating custom authentication strategies in Passport.js allows you to implement exactly the authentication flow your application needs. By understanding the fundamental patterns and following best practices, you can build secure, maintainable authentication systems that scale with your application.

> **Remember: Authentication is critical for security. Always validate your custom strategies thoroughly, handle errors gracefully, and never expose sensitive information in error messages.**

The key to successful custom strategies is understanding the underlying flow:

1. Extract credentials from the request
2. Validate the credentials
3. Return the appropriate result (success, failure, or error)
4. Handle edge cases and security considerations

With these building blocks, you can create authentication strategies for any system or protocol your application needs to integrate with.
