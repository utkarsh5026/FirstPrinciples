
## What Are Custom Validators? 🔍

> At its core, a validator is simply a function that checks if data meets certain criteria. It returns true if valid, false (or throws an error) if invalid.

Let's start with the most basic concept: validation is about ensuring data quality and preventing errors. Imagine you're a bouncer at a club - you check IDs to ensure people are old enough to enter. Validators do the same for your application data.

### The Simplest Validator

```javascript
// The most basic validator - checking if a value exists
function isNotEmpty(value) {
    // Converts value to boolean context
    // Empty strings, null, undefined become false
    return Boolean(value);
}

// Usage
console.log(isNotEmpty("Hello")); // true
console.log(isNotEmpty("")); // false
console.log(isNotEmpty(null)); // false
```

### Building a More Sophisticated Validator

```javascript
// Email validator - using regex pattern matching
function isValidEmail(email) {
    // This regex checks for basic email format
    // username@domain.extension
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // First check if email exists
    if (!email) return false;
  
    // Then check if it matches our pattern
    return emailRegex.test(email);
}

// Let's test it
console.log(isValidEmail("user@example.com")); // true
console.log(isValidEmail("invalid.email")); // false
console.log(isValidEmail("")); // false
```

## Custom Validator Classes: Building Reusable Validators

> Classes allow us to create validators with configurable behavior and maintain state, making them more flexible and reusable.

```javascript
// A customizable validator class
class StringValidator {
    constructor(options = {}) {
        // Set default options
        this.minLength = options.minLength || 0;
        this.maxLength = options.maxLength || Infinity;
        this.pattern = options.pattern || null;
        this.customRules = options.customRules || [];
    }
  
    validate(value) {
        // Step 1: Check if value is a string
        if (typeof value !== 'string') {
            throw new Error('Value must be a string');
        }
      
        // Step 2: Check length constraints
        if (value.length < this.minLength) {
            throw new Error(`String too short. Minimum length: ${this.minLength}`);
        }
      
        if (value.length > this.maxLength) {
            throw new Error(`String too long. Maximum length: ${this.maxLength}`);
        }
      
        // Step 3: Check pattern if specified
        if (this.pattern && !this.pattern.test(value)) {
            throw new Error('String does not match required pattern');
        }
      
        // Step 4: Apply custom rules
        for (const rule of this.customRules) {
            if (!rule(value)) {
                throw new Error('Custom validation rule failed');
            }
        }
      
        return true;
    }
}

// Usage example
const usernameValidator = new StringValidator({
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/, // Only letters, numbers, underscores
    customRules: [
        // Custom rule: must not start with underscore
        (value) => !value.startsWith('_'),
        // Custom rule: must contain at least one letter
        (value) => /[a-zA-Z]/.test(value)
    ]
});

try {
    usernameValidator.validate('john_doe123'); // Valid
    console.log('Username is valid!');
} catch (error) {
    console.error('Validation error:', error.message);
}
```

## Understanding Hooks in Node.js 🎣

> Hooks are functions that allow you to "hook into" specific moments in a process, like lifecycle events or data transformations.

Think of hooks like setting up checkpoints in a race. At each checkpoint, you can:

* Observe what's happening
* Modify the racer (data)
* Stop the race if something's wrong

### Simple Pre/Post Hook Implementation

```javascript
// A basic hook system
class HookManager {
    constructor() {
        this.hooks = {
            pre: {},   // Hooks that run before an operation
            post: {}   // Hooks that run after an operation
        };
    }
  
    // Register a hook
    addHook(event, timing, callback) {
        if (!this.hooks[timing][event]) {
            this.hooks[timing][event] = [];
        }
        this.hooks[timing][event].push(callback);
    }
  
    // Execute all hooks for an event
    async runHooks(event, timing, data) {
        const hooks = this.hooks[timing][event] || [];
      
        for (const hook of hooks) {
            // Pass data through each hook
            // Each hook can modify the data
            data = await hook(data);
        }
      
        return data;
    }
}

// Usage example
const hooks = new HookManager();

// Add pre-hooks for saving user data
hooks.addHook('saveUser', 'pre', (userData) => {
    console.log('Pre-hook: Validating user data');
    if (!userData.email) {
        throw new Error('Email is required');
    }
    return userData;
});

hooks.addHook('saveUser', 'pre', (userData) => {
    console.log('Pre-hook: Normalizing email');
    userData.email = userData.email.toLowerCase();
    return userData;
});

// Add post-hook
hooks.addHook('saveUser', 'post', (userData) => {
    console.log('Post-hook: Sending welcome email');
    // Simulate sending email
    return userData;
});

// Simulating a save operation
async function saveUser(userData) {
    // Run pre-hooks
    userData = await hooks.runHooks('saveUser', 'pre', userData);
  
    // The actual save operation
    console.log('Saving user:', userData);
  
    // Run post-hooks
    userData = await hooks.runHooks('saveUser', 'post', userData);
  
    return userData;
}

// Test the hook system
saveUser({ email: 'JOHN@EXAMPLE.COM', name: 'John' })
    .then(result => console.log('Final result:', result))
    .catch(error => console.error('Error:', error.message));
```

## Combining Validators and Hooks: Real-World Example

> The real power comes from combining validators and hooks to create a robust data processing pipeline.

Let's create a user registration system that demonstrates this:

```javascript
// User registration system with validators and hooks
class UserRegistrationSystem {
    constructor() {
        this.hooks = {
            pre: {},
            post: {}
        };
      
        // Configure validators
        this.validators = {
            email: this.createEmailValidator(),
            password: this.createPasswordValidator(),
            username: this.createUsernameValidator()
        };
    }
  
    createEmailValidator() {
        return new StringValidator({
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            customRules: [
                (email) => email.length <= 100,
                (email) => !email.includes('..') // No consecutive dots
            ]
        });
    }
  
    createPasswordValidator() {
        return new StringValidator({
            minLength: 8,
            customRules: [
                (pwd) => /[A-Z]/.test(pwd), // At least one uppercase
                (pwd) => /[a-z]/.test(pwd), // At least one lowercase
                (pwd) => /[0-9]/.test(pwd), // At least one number
                (pwd) => /[!@#$%^&*]/.test(pwd) // At least one special char
            ]
        });
    }
  
    createUsernameValidator() {
        return new StringValidator({
            minLength: 3,
            maxLength: 20,
            pattern: /^[a-zA-Z0-9_]+$/
        });
    }
  
    // Add hook functionality
    addHook(event, timing, callback) {
        if (!this.hooks[timing][event]) {
            this.hooks[timing][event] = [];
        }
        this.hooks[timing][event].push(callback);
    }
  
    async runHooks(event, timing, data) {
        const hooks = this.hooks[timing][event] || [];
      
        for (const hook of hooks) {
            data = await hook(data);
        }
      
        return data;
    }
  
    // Main registration method
    async registerUser(userData) {
        try {
            // Step 1: Run pre-registration hooks
            userData = await this.runHooks('register', 'pre', userData);
          
            // Step 2: Validate all fields
            this.validators.email.validate(userData.email);
            this.validators.password.validate(userData.password);
            this.validators.username.validate(userData.username);
          
            // Step 3: Simulate saving to database
            const savedUser = {
                id: Date.now(),
                ...userData,
                createdAt: new Date().toISOString()
            };
          
            // Step 4: Run post-registration hooks
            const finalUser = await this.runHooks('register', 'post', savedUser);
          
            return finalUser;
          
        } catch (error) {
            console.error('Registration failed:', error.message);
            throw error;
        }
    }
}

// Set up the system
const userSystem = new UserRegistrationSystem();

// Add pre-registration hooks
userSystem.addHook('register', 'pre', (userData) => {
    console.log('Pre-hook: Normalizing data');
    userData.email = userData.email.toLowerCase();
    userData.username = userData.username.trim();
    return userData;
});

userSystem.addHook('register', 'pre', async (userData) => {
    console.log('Pre-hook: Checking for duplicate email');
    // Simulate database check
    if (userData.email === 'existing@example.com') {
        throw new Error('Email already exists');
    }
    return userData;
});

// Add post-registration hooks
userSystem.addHook('register', 'post', async (userData) => {
    console.log('Post-hook: Sending welcome email');
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 100));
    userData.welcomeEmailSent = true;
    return userData;
});

userSystem.addHook('register', 'post', (userData) => {
    console.log('Post-hook: Creating user profile');
    userData.profile = {
        bio: '',
        avatar: 'default.png',
        preferences: {}
    };
    return userData;
});

// Test the complete system
async function testRegistration() {
    try {
        const newUser = await userSystem.registerUser({
            email: 'JOHN@EXAMPLE.COM',
            password: 'SecurePass123!',
            username: 'john_doe'
        });
      
        console.log('Registration successful!');
        console.log('Final user object:', newUser);
      
    } catch (error) {
        console.error('Registration error:', error.message);
    }
}

testRegistration();
```

## Advanced Patterns: Async Validators and Error Handling

> Real-world applications often require validators that can make asynchronous checks, like database queries.

```javascript
// Async validator for unique constraint checking
class AsyncEmailValidator {
    constructor(userDatabase) {
        this.userDatabase = userDatabase;
    }
  
    async validate(email) {
        // Basic format validation first
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Invalid email format');
        }
      
        // Async check for uniqueness
        const existingUser = await this.userDatabase.findByEmail(email);
      
        if (existingUser) {
            throw new Error('Email already registered');
        }
      
        return true;
    }
}

// Simulated database
const mockDatabase = {
    users: [
        { id: 1, email: 'existing@example.com' }
    ],
  
    async findByEmail(email) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
      
        return this.users.find(user => user.email === email);
    }
};

// Usage with error handling
async function validateNewUser(email) {
    const validator = new AsyncEmailValidator(mockDatabase);
  
    try {
        await validator.validate(email);
        console.log('Email is valid and unique!');
        return true;
    } catch (error) {
        console.error('Validation failed:', error.message);
        return false;
    }
}

// Test async validation
validateNewUser('new@example.com');      // Should pass
validateNewUser('existing@example.com'); // Should fail
```

## Best Practices and Design Patterns

> When building custom validators and hooks, following these patterns will make your code more maintainable and reusable.

### 1. Validation Schema Pattern

```javascript
// Define validation schemas for complex objects
const userSchema = {
    email: {
        required: true,
        type: 'string',
        validators: ['email', 'unique']
    },
    age: {
        required: false,
        type: 'number',
        validators: [
            { name: 'min', value: 13 },
            { name: 'max', value: 120 }
        ]
    },
    preferences: {
        required: false,
        type: 'object',
        validators: []
    }
};

// Schema validator implementation
class SchemaValidator {
    constructor(schema) {
        this.schema = schema;
    }
  
    async validate(data) {
        const errors = {};
      
        for (const [field, rules] of Object.entries(this.schema)) {
            try {
                const value = data[field];
              
                // Check required
                if (rules.required && (value === undefined || value === null)) {
                    errors[field] = `${field} is required`;
                    continue;
                }
              
                // Skip validation if optional and not provided
                if (!rules.required && (value === undefined || value === null)) {
                    continue;
                }
              
                // Type checking
                if (!this.checkType(value, rules.type)) {
                    errors[field] = `${field} must be of type ${rules.type}`;
                    continue;
                }
              
                // Apply validators
                await this.applyValidators(field, value, rules.validators);
              
            } catch (error) {
                errors[field] = error.message;
            }
        }
      
        if (Object.keys(errors).length > 0) {
            throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
        }
      
        return true;
    }
  
    checkType(value, expectedType) {
        switch (expectedType) {
            case 'string': return typeof value === 'string';
            case 'number': return typeof value === 'number';
            case 'boolean': return typeof value === 'boolean';
            case 'object': return typeof value === 'object' && value !== null;
            case 'array': return Array.isArray(value);
            default: return true;
        }
    }
  
    async applyValidators(field, value, validators) {
        for (const validator of validators) {
            if (typeof validator === 'string') {
                // Built-in validators
                await this.applyBuiltInValidator(field, value, validator);
            } else if (typeof validator === 'object') {
                // Parameterized validators
                await this.applyParameterizedValidator(field, value, validator);
            }
        }
    }
  
    async applyBuiltInValidator(field, value, validatorName) {
        switch (validatorName) {
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    throw new Error(`${field} must be a valid email`);
                }
                break;
            // Add more built-in validators as needed
        }
    }
  
    async applyParameterizedValidator(field, value, validator) {
        switch (validator.name) {
            case 'min':
                if (typeof value === 'number' && value < validator.value) {
                    throw new Error(`${field} must be at least ${validator.value}`);
                }
                break;
            case 'max':
                if (typeof value === 'number' && value > validator.value) {
                    throw new Error(`${field} must be at most ${validator.value}`);
                }
                break;
            // Add more parameterized validators as needed
        }
    }
}
```

### 2. Hook Pipeline Pattern

```javascript
// Advanced hook pipeline with control flow
class HookPipeline {
    constructor() {
        this.middleware = [];
    }
  
    use(middleware) {
        this.middleware.push(middleware);
        return this; // Enable chaining
    }
  
    async execute(context) {
        let index = 0;
      
        const next = async () => {
            if (index >= this.middleware.length) return;
          
            const middleware = this.middleware[index++];
          
            // Each middleware gets context and next function
            await middleware(context, next);
        };
      
        await next();
        return context;
    }
}

// Usage example
const pipeline = new HookPipeline();

pipeline
    .use(async (context, next) => {
        console.log('Middleware 1: Validating input');
        if (!context.data) {
            throw new Error('No data provided');
        }
        await next();
    })
    .use(async (context, next) => {
        console.log('Middleware 2: Transforming data');
        context.data = context.data.toUpperCase();
        await next();
    })
    .use(async (context, next) => {
        console.log('Middleware 3: Saving data');
        context.result = `Saved: ${context.data}`;
        // We can choose not to call next() to stop the pipeline
    });

// Execute the pipeline
pipeline.execute({ data: 'hello world' })
    .then(context => console.log('Final context:', context))
    .catch(error => console.error('Pipeline error:', error.message));
```

## Performance Considerations and Optimization

> When implementing validators and hooks in high-traffic applications, performance becomes crucial.

```javascript
// Optimized validator with memoization
class OptimizedValidator {
    constructor() {
        this.cache = new Map();
        this.cacheSize = 1000; // Limit cache size
    }
  
    async validate(data) {
        // Create a cache key from data
        const cacheKey = this.createCacheKey(data);
      
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
      
        // Perform validation
        const result = await this.performValidation(data);
      
        // Cache the result
        this.addToCache(cacheKey, result);
      
        return result;
    }
  
    createCacheKey(data) {
        // Create a unique key from data
        return JSON.stringify(data);
    }
  
    addToCache(key, result) {
        // Implement LRU-like behavior
        if (this.cache.size >= this.cacheSize) {
            // Remove the first (oldest) item
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
      
        this.cache.set(key, result);
    }
  
    async performValidation(data) {
        // Your validation logic here
        // Simulate expensive validation
        await new Promise(resolve => setTimeout(resolve, 100));
      
        return {
            valid: true,
            data: data
        };
    }
}
```

## Putting It All Together: Complete Example

Let's create a comprehensive example that demonstrates all the concepts we've learned:

```javascript
// Complete application demonstrating custom validators and hooks
class UserManagementSystem {
    constructor() {
        this.validators = new Map();
        this.hooks = new Map();
        this.users = [];
      
        this.initializeValidators();
        this.initializeHooks();
    }
  
    initializeValidators() {
        // Email validator
        this.validators.set('email', {
            validate: async (value) => {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    throw new Error('Invalid email format');
                }
              
                // Check uniqueness
                if (this.users.some(user => user.email === value)) {
                    throw new Error('Email already exists');
                }
              
                return true;
            }
        });
      
        // Password validator
        this.validators.set('password', {
            validate: async (value) => {
                const errors = [];
              
                if (value.length < 8) errors.push('at least 8 characters');
                if (!/[A-Z]/.test(value)) errors.push('an uppercase letter');
                if (!/[a-z]/.test(value)) errors.push('a lowercase letter');
                if (!/[0-9]/.test(value)) errors.push('a number');
              
                if (errors.length > 0) {
                    throw new Error(`Password must contain ${errors.join(', ')}`);
                }
              
                return true;
            }
        });
    }
  
    initializeHooks() {
        // Pre-creation hooks
        this.addHook('createUser', 'pre', async (userData) => {
            console.log('Pre-hook: Sanitizing input');
            userData.email = userData.email.toLowerCase().trim();
            userData.username = userData.username.trim();
            return userData;
        });
      
        this.addHook('createUser', 'pre', async (userData) => {
            console.log('Pre-hook: Adding system fields');
            userData.id = Date.now();
            userData.createdAt = new Date().toISOString();
            userData.active = true;
            return userData;
        });
      
        // Post-creation hooks
        this.addHook('createUser', 'post', async (userData) => {
            console.log('Post-hook: Sending welcome email');
            // Simulate email sending
            await new Promise(resolve => setTimeout(resolve, 100));
            return userData;
        });
      
        this.addHook('createUser', 'post', async (userData) => {
            console.log('Post-hook: Creating user profile');
            // Create associated profile
            userData.profile = {
                displayName: userData.username,
                avatar: 'default.png',
                bio: ''
            };
            return userData;
        });
    }
  
    addHook(event, timing, callback) {
        const key = `${event}_${timing}`;
        if (!this.hooks.has(key)) {
            this.hooks.set(key, []);
        }
        this.hooks.get(key).push(callback);
    }
  
    async runHooks(event, timing, data) {
        const key = `${event}_${timing}`;
        const hooks = this.hooks.get(key) || [];
      
        for (const hook of hooks) {
            data = await hook(data);
        }
      
        return data;
    }
  
    async createUser(userData) {
        try {
            // Run pre-creation hooks
            userData = await this.runHooks('createUser', 'pre', userData);
          
            // Validate fields
            await this.validators.get('email').validate(userData.email);
            await this.validators.get('password').validate(userData.password);
          
            // Create user
            const newUser = {
                ...userData,
                // Remove password from stored user object
                password: undefined
            };
          
            this.users.push(newUser);
          
            // Run post-creation hooks
            const finalUser = await this.runHooks('createUser', 'post', newUser);
          
            return finalUser;
          
        } catch (error) {
            console.error('User creation failed:', error.message);
            throw error;
        }
    }
}

// Create and test the system
async function demonstrateSystem() {
    const userSystem = new UserManagementSystem();
  
    try {
        const user1 = await userSystem.createUser({
            email: 'alice@example.com',
            password: 'SecurePass123',
            username: 'alice'
        });
      
        console.log('User created successfully:', user1);
      
        // Try to create duplicate email
        await userSystem.createUser({
            email: 'alice@example.com',
            password: 'AnotherPass456',
            username: 'alice2'
        });
      
    } catch (error) {
        console.log('Expected error caught:', error.message);
    }
}

demonstrateSystem();
```

## Key Takeaways

> Understanding custom validators and hooks requires grasping a few fundamental concepts:

1. **Validators** : Functions that check data integrity before it enters your system
2. **Hooks** : Functions that execute at specific points in your application's lifecycle
3. **Composition** : Combining multiple validators and hooks creates powerful, flexible systems
4. **Async capabilities** : Both validators and hooks can be asynchronous, allowing for database checks and external API calls
5. **Error handling** : Proper error handling ensures your application fails gracefully and provides meaningful feedback

Remember, the goal of these patterns is to create code that is:

* **Modular** : Easy to add new validators or hooks
* **Reusable** : Components can be used across different parts of your application
* **Maintainable** : Clear structure makes debugging and updates easier
* **Performant** : Optimizations like caching prevent unnecessary work

Practice implementing these patterns in your own projects, starting simple and gradually adding complexity as you become more comfortable with the concepts.
