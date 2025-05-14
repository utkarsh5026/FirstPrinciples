# Understanding the Foundation: What is Mongoose?

Before we dive into validators and middleware, let's establish what Mongoose actually is at its core:

> **Mongoose is an Object Document Mapper (ODM) for MongoDB and Node.js**

> Think of it as a bridge between your JavaScript code and MongoDB documents, providing structure, validation, and type casting for your data.

Imagine you're building a house. MongoDB is like the ground where you can place anything anywhere. Mongoose is like the architect who provides blueprints (schemas) and quality checks (validators) to ensure your house is built properly.

# Schemas: The Blueprint of Your Data

A schema in Mongoose is like a blueprint that defines:

* What fields (properties) your documents can have
* What data types those fields should be
* What validation rules apply to each field

Here's a simple example to start:

```javascript

// Basic schema definition

constmongoose=require('mongoose');


constuserSchema=newmongoose.Schema({

    name:String,           // Simple type definition

    email:String,

    age:Number,

    isActive:Boolean

});


constUser=mongoose.model('User',userSchema);

```

In this basic schema, we're telling Mongoose: "A user document should have these four fields with these specific types."

# Built-in Validators: The Basic Rules

Before we create custom validators, let's understand what Mongoose provides out of the box:

```javascript

constuserSchema=newmongoose.Schema({

    email:{

        type:String,

        required:true,           // Must be present

        unique:true,            // Must be unique in collection

        lowercase:true,         // Automatically converts to lowercase

        trim:true               // Removes whitespace

    },

    age:{

        type:Number,

        min:0,                  // Minimum value

        max:120                 // Maximum value

    },

    username:{

        type:String,

        required: [true,'Username is required'],  // Custom error message

        minlength:3,

        maxlength:50

    }

});

```

These built-in validators are like having a basic security system in your data house - they catch common problems.

# Custom Schema Validators: Your Own Rules

Now, let's create our own validators for more specific requirements:

## Method 1: Using the `validate` Property

```javascript

constuserSchema=newmongoose.Schema({

    email:{

        type:String,

        required:true,

        // Custom validator to ensure email is in specific domain

        validate:{

            validator:function(value){

                // This function returns true if valid, false if invalid

                returnvalue.endsWith('@company.com');

            },

            message:'Email must be from company.com domain'

        }

    }

});

```

Let me break down what's happening here:

1. We define a `validate` object on the email field
2. The `validator` function receives the field's value
3. If the function returns `true`, validation passes
4. If it returns `false`, validation fails with the message we provide

## Method 2: Using Custom Static Methods

```javascript

constuserSchema=newmongoose.Schema({

    password:{

        type:String,

        required:true,

        validate:{

            validator:function(value){

                // Check password strength

                returnvalue.length>=8&&

                       /[A-Z]/.test(value) &&    // Has uppercase

                       /[a-z]/.test(value) &&    // Has lowercase

                       /\d/.test(value) &&       // Has number

                       /[!@#$%^&*]/.test(value);// Has special char

            },

            message:'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'

        }

    }

});

```

## Method 3: Reusable Validator Functions

For validators you want to use across multiple schemas:

```javascript

// Create a reusable validator function

functionisStrongPassword(value){

    returnvalue.length>=8&&

           /[A-Z]/.test(value) &&

           /[a-z]/.test(value) &&

           /\d/.test(value) &&

           /[!@#$%^&*]/.test(value);

}


// Use it in multiple schemas

constuserSchema=newmongoose.Schema({

    password:{

        type:String,

        required:true,

        validate:{

            validator:isStrongPassword,

            message:'Password must be strong'

        }

    }

});


constadminSchema=newmongoose.Schema({

    adminPassword:{

        type:String,

        required:true,

        validate:{

            validator:isStrongPassword,

            message:'Admin password must be strong'

        }

    }

});

```

# Asynchronous Validators

Sometimes validation requires checking external resources:

```javascript

constuserSchema=newmongoose.Schema({

    email:{

        type:String,

        required:true,

        validate:{

            // Async validator to check if email exists in external API

            validator:asyncfunction(value){

                try{

                    constresponse=awaitfetch(`https://api.emailverify.com/check/${value}`);

                    constdata=awaitresponse.json();

                    returndata.isValid;

                }catch (error) {

                    // If API fails, we might want to pass validation

                    // or handle the error differently

                    console.error('Email verification failed:',error);

                    returntrue;// or false, depending on your needs

                }

            },

            message:'Email address is not valid'

        }

    }

});

```

# Middleware: The Event Handlers

> **Middleware in Mongoose are functions that execute at certain stages in the document lifecycle**

> Think of middleware as event listeners that trigger before or after specific operations like saving, updating, or removing documents.

## Pre Middleware: Do Something Before

Pre middleware runs before an operation. Here's how it works:

```javascript

constuserSchema=newmongoose.Schema({

    email:String,

    password:String,

    emailLowercase:String  // We'll populate this automatically

});


// Pre 'save' middleware - runs before saving a document

userSchema.pre('save',function(next){

    // 'this' refers to the document being saved

    console.log('About to save user:',this.email);

  

    // Example: Automatically lowercase email

    this.emailLowercase=this.email.toLowerCase();

  

    // Call next() to proceed with the save operation

    next();

});


// Pre 'validate' middleware - runs before validation

userSchema.pre('validate',function(next){

    console.log('About to validate user');

  

    // You can modify the document here before validation

    if (this.email) {

        this.email=this.email.trim();

    }

  

    next();

});

```

## Post Middleware: Do Something After

Post middleware runs after an operation completes:

```javascript

// Post 'save' middleware - runs after saving a document

userSchema.post('save',function(doc,next){

    console.log('User saved successfully:',doc.email);

  

    // Example: Send welcome email

    sendWelcomeEmail(doc.email);

  

    next();

});


// Post 'remove' middleware - runs after removing a document

userSchema.post('remove',function(doc){

    console.log('User removed:',doc.email);

  

    // Example: Clean up related data

    removeUserFromOtherCollections(doc._id);

});

```

# Combining Validators and Middleware

Here's a practical example that combines custom validators with middleware:

```javascript

constbcrypt=require('bcrypt');


constuserSchema=newmongoose.Schema({

    username:{

        type:String,

        required:true,

        validate:{

            validator:function(value){

                // Username must start with letter and contain only letters/numbers

                return/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value);

            },

            message:'Username must start with a letter and contain only letters, numbers, and underscores'

        }

    },

    email:{

        type:String,

        required:true,

        unique:true,

        validate:{

            validator:function(value){

                // Email format validation

                return/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);

            },

            message:'Please enter a valid email address'

        }

    },

    password:{

        type:String,

        required:true,

        minlength:8,

        // This field won't be returned in queries by default

        select:false

    },

    passwordChangedAt:Date,

    loginAttempts:{

        type:Number,

        default:0

    },

    lockUntil:Date,

    isActive:{

        type:Boolean,

        default:true

    }

});


// Pre 'save' middleware to hash password

userSchema.pre('save',asyncfunction(next){

    // Only hash the password if it has been modified (or is new)

    if (!this.isModified('password')) returnnext();

  

    try{

        // Hash the password with bcrypt

        constsalt=awaitbcrypt.genSalt(12);

        this.password=awaitbcrypt.hash(this.password,salt);

    

        // Set password changed timestamp

        this.passwordChangedAt=Date.now() -1000;// Subtract 1 second to ensure token is created after this

    

        next();

    }catch (error) {

        next(error);

    }

});


// Pre 'save' middleware to lowercase email

userSchema.pre('save',function(next){

    if (this.email) {

        this.email=this.email.toLowerCase();

    }

    next();

});


// Instance method to compare password

userSchema.methods.comparePassword=asyncfunction(candidatePassword){

    try{

        returnawaitbcrypt.compare(candidatePassword,this.password);

    }catch (error) {

        throwerror;

    }

};


// Instance method to check if account is locked

userSchema.methods.isLocked=function(){

    return!!(this.lockUntil&&this.lockUntil>Date.now());

};


// Pre 'findOneAndUpdate' middleware

userSchema.pre('findOneAndUpdate',function(){

    // If updating email, ensure it's lowercase

    if (this._update.email) {

        this._update.email=this._update.email.toLowerCase();

    }

});


// Static method for failed login handling

userSchema.statics.handleFailedLogin=asyncfunction(userId){

    try{

        constuser=awaitthis.findById(userId);

        if (!user) returnfalse;

    

        user.loginAttempts+=1;

    

        // Lock account after 5 failed attempts

        if (user.loginAttempts>=5) {

            user.lockUntil=newDate(Date.now() +30*60*1000);// Lock for 30 minutes

            user.loginAttempts=0;

        }

    

        awaituser.save();

        returntrue;

    }catch (error) {

        throwerror;

    }

};


constUser=mongoose.model('User',userSchema);

```

# Advanced Middleware Patterns

## Conditional Middleware

```javascript

userSchema.pre('save',function(next){

    // Only run this middleware if it's a new document

    if (this.isNew) {

        console.log('Creating new user');

        this.createdAt=Date.now();

    

        // Send welcome email only for new users

        if (this.email) {

            sendWelcomeEmail(this.email);

        }

    }else{

        console.log('Updating existing user');

        this.updatedAt=Date.now();

    }

  

    next();

});

```

## Aggregate Middleware

```javascript

// Pre 'aggregate' middleware - runs before aggregation pipelines

userSchema.pre('aggregate',function(){

    // 'this' refers to the aggregate pipeline

  

    // Example: Filter out inactive users from all aggregations

    this.pipeline().unshift({$match:{isActive:true}});

});

```

## Error Handling in Middleware

```javascript

userSchema.pre('save',asyncfunction(next){

    try{

        // Some async operation that might fail

        constresult=awaitsomeAsyncOperation();

    

        if (!result) {

            // Pass error to next() to stop the save operation

            next(newError('Async operation failed'));

        }else{

            // Success, continue with save

            next();

        }

    }catch (error) {

        // Pass any caught errors to next()

        next(error);

    }

});


// Handle post middleware errors

userSchema.post('save',function(error,doc,next){

    if (error.name==='MongoError'&&error.code===11000) {

        // Handle duplicate key error

        next(newError('That email is already taken'));

    }else{

        next(error);

    }

});

```

# Practical Usage Examples

Let's see how to use these schemas in your application:

```javascript

// Creating a new user

asyncfunctioncreateUser(userData){

    try{

        constuser=newUser(userData);

    

        // Validation and pre-save middleware will run automatically

        awaituser.save();

    

        console.log('User created successfully');

        returnuser;

    }catch (error) {

        if (error.name==='ValidationError') {

            // Handle validation errors

            console.error('Validation failed:',error.message);

        

            // You can access specific field errors

            Object.keys(error.errors).forEach((field)=>{

                console.log(`${field}: ${error.errors[field].message}`);

            });

        }else{

            console.error('Error creating user:',error);

        }

        throwerror;

    }

}


// Using the user model

createUser({

    username:'johndoe',

    email:'john@example.com',

    password:'P@ssw0rd!'

}).then(user=>{

    console.log('Created user:',user);

}).catch(err=>{

    console.error('Failed to create user:',err);

});

```

# Best Practices and Tips

> **Remember these key principles when working with validators and middleware:**

1.**Keep Validators Pure** : Validators should only validate, not modify data

2.**Use Middleware for Side Effects** : Middleware is perfect for sending emails, logging, etc.

3.**Handle Errors Gracefully** : Always provide clear error messages

4.**Keep It DRY** : Reuse validators and middleware across schemas

5.**Test Thoroughly** : Always test your validators and middleware with various inputs

# Quick Reference Chart

| Feature | When to Use | Example Use |
|---------|-------------|-------------|
| Built-in Validators | Basic validation | required, min, max, unique, enum |
| Custom Validators | Complex business rules | Password strength, custom format checks |
| Pre Middleware | Before operations | Hash passwords, normalize data |
| Post Middleware | After operations | Send notifications, logging, cleanup |
| Async Validators | External checks | API calls, database lookups |

This comprehensive guide should give you a solid foundation for implementing custom validators and middleware in Mongoose. Remember, the key is to start simple and gradually add complexity as your application grows. Always test your validators and middleware thoroughly with various edge cases to ensure your data integrity remains intact.
