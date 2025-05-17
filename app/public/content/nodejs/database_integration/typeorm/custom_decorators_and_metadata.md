
# Custom Decorators and Metadata in TypeORM

TypeORM is one of the most popular Object-Relational Mapping (ORM) libraries for TypeScript and JavaScript. To fully understand custom decorators and metadata in TypeORM, we need to start with the fundamentals.

## First Principles: What Are Decorators?

> Decorators are a special kind of declaration that can be attached to a class declaration, method, accessor, property, or parameter. They use the form `@expression`, where `expression` must evaluate to a function that will be called at runtime with information about the decorated declaration.

Decorators are essentially functions that can modify or enhance the behavior of the target they are applied to. They're a feature of TypeScript (and a stage 3 proposal for JavaScript) that allows for a form of metaprogramming.

### How Decorators Work at a Basic Level

When you apply a decorator to a class or class member, the decorator function is called with specific arguments that describe the decorated item. The decorator can then return a new function or modify the original target.

Here's a simple example of a decorator:

```typescript
function Logger(target: any) {
  console.log(`Class ${target.name} was decorated`);
}

@Logger
class Example {
  // Class implementation
}
```

In this simple case, when the `Example` class is defined, the `Logger` decorator function runs and logs a message.

## First Principles: What Is Metadata?

> Metadata is data that provides information about other data. In programming, it's information about the structure of your code that can be used at runtime.

In TypeScript, metadata is information about classes, methods, and properties that can be accessed and used during runtime. This metadata is not available by default in JavaScript/TypeScript, but it can be enabled using the `reflect-metadata` library.

### Reflect Metadata

The `reflect-metadata` library provides a polyfill for the Metadata Reflection API, which allows you to add and retrieve metadata for classes and their members.

Here's how you would use it:

```typescript
import "reflect-metadata";

// Add metadata to a class
Reflect.defineMetadata("key", "value", Example);

// Retrieve metadata from a class
const value = Reflect.getMetadata("key", Example);
console.log(value); // "value"
```

## TypeORM and Decorators

TypeORM extensively uses decorators to define entities, columns, relationships, and more. These decorators attach metadata to your classes and properties, which TypeORM then uses to map your TypeScript classes to database tables.

### Core TypeORM Decorators

Before diving into custom decorators, let's understand some of the built-in ones:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;
}
```

In this example:

* `@Entity()` marks the `User` class as a database entity
* `@PrimaryGeneratedColumn()` sets the `id` property as a primary key with auto-increment
* `@Column()` marks the `name` and `email` properties as database columns

These decorators are actually adding metadata to your class that TypeORM can later read to understand how to interact with the database.

## Custom Decorators in TypeORM

Now that we understand the fundamentals, let's explore how to create custom decorators in TypeORM.

### Why Create Custom Decorators?

Custom decorators allow you to:

1. Add business logic to your entities
2. Automate repetitive patterns
3. Enhance TypeORM's functionality
4. Keep your code DRY (Don't Repeat Yourself)

### Creating a Simple Custom Property Decorator

Let's start with a simple decorator that automatically trims string values:

```typescript
import "reflect-metadata";

function Trim() {
  return function(target: any, propertyKey: string) {
    // Get the original descriptor
    let value: string;
  
    // Create new getter and setter
    const getter = function() {
      return value;
    };
  
    const setter = function(newVal: string) {
      value = typeof newVal === 'string' ? newVal.trim() : newVal;
    };
  
    // Replace the property with the new getter and setter
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

class User {
  @Trim()
  name: string;
}

const user = new User();
user.name = "  John Doe  ";
console.log(`"${user.name}"`); // "John Doe" (without extra spaces)
```

This decorator modifies the property to automatically trim any string value assigned to it. Let's break down what's happening:

1. We define a decorator factory function `Trim()` that returns the actual decorator function
2. The decorator function takes `target` (the class prototype) and `propertyKey` (the name of the property)
3. We create custom getter and setter functions
4. The setter automatically trims string values
5. We redefine the property with our custom accessors using `Object.defineProperty`

### Combining Custom Decorators with TypeORM

Now, let's create a more useful decorator that works with TypeORM. Let's say we want to create an `@IsUnique` decorator that ensures a column value is unique in the database:

```typescript
import { getRepository, Column } from "typeorm";
import "reflect-metadata";

// Our custom decorator
function IsUnique(options: { message?: string } = {}) {
  return function(target: any, propertyKey: string) {
    // Store the property name in metadata
    const uniqueProps = Reflect.getMetadata("unique:properties", target.constructor) || [];
    uniqueProps.push(propertyKey);
    Reflect.defineMetadata("unique:properties", uniqueProps, target.constructor);
  
    // Store the error message in metadata
    Reflect.defineMetadata(
      "unique:message:" + propertyKey, 
      options.message || `${propertyKey} must be unique`, 
      target.constructor
    );
  };
}

// Validation function to be used before saving
async function validateUniqueness(entity: any): Promise<string[]> {
  const constructor = entity.constructor;
  const uniqueProps = Reflect.getMetadata("unique:properties", constructor) || [];
  const errors: string[] = [];
  
  for (const prop of uniqueProps) {
    const repository = getRepository(constructor);
    const value = entity[prop];
    const existingEntity = await repository.findOne({ [prop]: value });
  
    if (existingEntity && existingEntity.id !== entity.id) {
      const message = Reflect.getMetadata("unique:message:" + prop, constructor);
      errors.push(message);
    }
  }
  
  return errors;
}

// Using our decorator
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  @IsUnique({ message: "Email address is already taken" })
  email: string;
}

// Example usage
async function saveUser(user: User) {
  const errors = await validateUniqueness(user);
  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }
  
  const repository = getRepository(User);
  return repository.save(user);
}
```

This example shows how to create a custom decorator that adds metadata to your entity, which can then be used during validation before saving to the database. Let's break it down:

1. The `IsUnique` decorator adds the property to a list of properties that should be unique
2. The decorator also stores a custom error message in metadata
3. The `validateUniqueness` function checks all properties marked with `@IsUnique` to ensure their values are unique in the database
4. Before saving, we call `validateUniqueness` to catch any uniqueness violations

## Advanced: Creating Column Type Decorators

Let's create a more advanced example: a custom column type decorator for handling encrypted data:

```typescript
import { Column, ColumnOptions } from "typeorm";
import * as crypto from "crypto";
import "reflect-metadata";

// Encryption helpers
const ENCRYPTION_KEY = "your-secure-encryption-key"; // In practice, use environment variables
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift() || '', 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Custom column decorator
function EncryptedColumn(options: ColumnOptions = {}) {
  return function(target: any, propertyKey: string) {
    // Mark this property as encrypted in metadata
    Reflect.defineMetadata("encrypted:property:" + propertyKey, true, target.constructor);
  
    // Setup getter and setter for automatic encryption/decryption
    let encryptedValue: string;
  
    const getter = function() {
      // Only decrypt if we have a value
      if (encryptedValue) {
        try {
          return decrypt(encryptedValue);
        } catch (e) {
          return encryptedValue;
        }
      }
      return undefined;
    };
  
    const setter = function(value: string) {
      if (value !== undefined && value !== null) {
        encryptedValue = encrypt(value);
      } else {
        encryptedValue = value;
      }
    };
  
    Object.defineProperty(target, propertyKey + "_encrypted", {
      get: function() { return encryptedValue; },
      set: function(value) { encryptedValue = value; },
      enumerable: false,
      configurable: true,
    });
  
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  
    // Apply TypeORM Column decorator to the "_encrypted" property
    Column({
      ...options,
      name: options.name || propertyKey
    })(target, propertyKey + "_encrypted");
  };
}

// Using our decorator
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @EncryptedColumn()
  socialSecurityNumber: string;
}

// Now when you save a user, the SSN will be automatically encrypted:
const user = new User();
user.name = "Jane Doe";
user.socialSecurityNumber = "123-45-6789";

// When saved to DB, it will be stored as encrypted
// When loaded from DB, it will be automatically decrypted when accessed
```

This advanced example demonstrates:

1. Creating a custom column decorator that integrates with TypeORM
2. Using getters and setters for transparent encryption/decryption
3. Storing additional metadata about the property type
4. Applying the built-in TypeORM `@Column` decorator to a hidden property

The `@EncryptedColumn` decorator handles sensitive data by:

* Encrypting data before it's stored in the database
* Decrypting data when it's retrieved from the entity
* Hiding the implementation details from the developer using the entity

## Using TypeORM's EntitySubscribers with Custom Decorators

TypeORM provides EntitySubscribers that allow you to listen for entity events. We can combine these with custom decorators for powerful patterns:

```typescript
import { 
  Entity, Column, PrimaryGeneratedColumn, 
  EntitySubscriberInterface, InsertEvent, UpdateEvent,
  EventSubscriber, Connection
} from "typeorm";
import "reflect-metadata";

// Create a decorator for auto-setting modified date
function AutoTimestamp() {
  return function(target: any, propertyKey: string) {
    Reflect.defineMetadata("timestamp:property:" + propertyKey, true, target.constructor);
  };
}

// Create an entity subscriber
@EventSubscriber()
class TimestampSubscriber implements EntitySubscriberInterface {
  constructor(connection: Connection) {
    // Register this subscriber
    connection.subscribers.push(this);
  }

  beforeInsert(event: InsertEvent<any>) {
    this.updateTimestamps(event.entity);
  }

  beforeUpdate(event: UpdateEvent<any>) {
    this.updateTimestamps(event.entity);
  }

  private updateTimestamps(entity: any) {
    if (!entity) return;
  
    // Get all properties decorated with @AutoTimestamp
    const constructor = entity.constructor;
  
    // Check each property to see if it's marked for auto-timestamp
    for (const key of Object.getOwnPropertyNames(constructor.prototype)) {
      if (Reflect.getMetadata("timestamp:property:" + key, constructor)) {
        entity[key] = new Date();
      }
    }
  }
}

// Using our decorator
@Entity()
class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  @AutoTimestamp()
  updatedAt: Date;
}
```

This example shows:

1. Creating an `@AutoTimestamp` decorator that marks properties for automatic updating
2. Creating an EntitySubscriber that listens for insert and update events
3. Using the metadata from our decorator to automatically update timestamps

When you insert or update a Post entity, the `updatedAt` field will automatically be set to the current date and time.

## Creating Decorator Compositions

We can compose multiple decorators for more complex behavior:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import "reflect-metadata";

// Simple validation decorator
function IsEmail() {
  return function(target: any, propertyKey: string) {
    // Store validation info in metadata
    const validations = Reflect.getMetadata("validations", target.constructor) || {};
    validations[propertyKey] = validations[propertyKey] || [];
    validations[propertyKey].push({
      type: "email",
      validate: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: "Invalid email format"
    });
    Reflect.defineMetadata("validations", validations, target.constructor);
  };
}

// Required field decorator
function Required(message?: string) {
  return function(target: any, propertyKey: string) {
    const validations = Reflect.getMetadata("validations", target.constructor) || {};
    validations[propertyKey] = validations[propertyKey] || [];
    validations[propertyKey].push({
      type: "required",
      validate: (value: any) => value !== undefined && value !== null && value !== '',
      message: message || `${propertyKey} is required`
    });
    Reflect.defineMetadata("validations", validations, target.constructor);
  };
}

// Composition: Create an email field that's also required
function RequiredEmail(options: { requiredMessage?: string, formatMessage?: string } = {}) {
  return function(target: any, propertyKey: string) {
    // Apply both decorators
    Required(options.requiredMessage)(target, propertyKey);
    IsEmail()(target, propertyKey);
  };
}

// Validation function
function validate(entity: any): string[] {
  const constructor = entity.constructor;
  const validations = Reflect.getMetadata("validations", constructor) || {};
  const errors: string[] = [];
  
  // Check all validations
  for (const [property, propertyValidations] of Object.entries(validations)) {
    const value = entity[property];
  
    for (const validation of propertyValidations as any[]) {
      if (!validation.validate(value)) {
        errors.push(validation.message);
      }
    }
  }
  
  return errors;
}

// Using our composed decorator
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Required("Name cannot be empty")
  name: string;

  @Column()
  @RequiredEmail({
    requiredMessage: "Email address is required",
    formatMessage: "Please provide a valid email address"
  })
  email: string;
}

// Example usage
const user = new User();
user.name = "John Doe";
// Email is missing

const validationErrors = validate(user);
console.log(validationErrors); // ["Email address is required"]
```

In this example:

1. We create two separate decorators: `@IsEmail` and `@Required`
2. We compose them into a new decorator `@RequiredEmail`
3. Our composed decorator applies both validations and allows configuring messages for each
4. The `validate` function checks all validations stored in metadata

This pattern allows for powerful composition of behaviors and validations.

## Creating Transaction Decorators

Another powerful use case for custom decorators is handling transactions. Let's create a method decorator that automatically wraps a method in a transaction:

```typescript
import { 
  getConnection, EntityManager, getManager,
  Entity, PrimaryGeneratedColumn, Column 
} from "typeorm";
import "reflect-metadata";

// Transaction decorator for methods
function Transactional() {
  return function(
    target: any, 
    propertyKey: string, 
    descriptor: PropertyDescriptor
  ) {
    // Save original method
    const originalMethod = descriptor.value;
  
    // Replace method with wrapper that handles transaction
    descriptor.value = async function(...args: any[]) {
      // Start transaction
      const connection = getConnection();
    
      let result;
      await connection.transaction(async transactionalEntityManager => {
        // Replace the standard entity manager with the transactional one
        const originalManager = getManager();
        (global as any).typeormManager = transactionalEntityManager;
      
        try {
          // Call original method with transactional context
          result = await originalMethod.apply(this, args);
        } finally {
          // Restore original manager
          (global as any).typeormManager = originalManager;
        }
      });
    
      return result;
    };
  
    return descriptor;
  };
}

// Service example
class UserService {
  @Transactional()
  async createUserWithProfile(userData: any, profileData: any) {
    // This entire method will run in a transaction
    const userRepo = getManager().getRepository(User);
    const profileRepo = getManager().getRepository(Profile);
  
    const user = userRepo.create(userData);
    await userRepo.save(user);
  
    const profile = profileRepo.create({
      ...profileData,
      userId: user.id
    });
    await profileRepo.save(profile);
  
    return { user, profile };
  }
}

// Entities
@Entity()
class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

@Entity()
class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bio: string;
  
  @Column()
  userId: number;
}
```

This transaction decorator demonstrates:

1. Creating a method decorator that wraps the original method implementation
2. Starting a database transaction before executing the method
3. Ensuring the transaction is used throughout the method
4. Committing or rolling back automatically when the method completes or throws an error

With this decorator, you can ensure that complex operations involving multiple database changes are atomic—either all succeed or all fail.

## Creating Custom Repository Decorators

TypeORM allows you to create custom repositories, and decorators can help enhance them:

```typescript
import { 
  EntityRepository, Repository, 
  Entity, PrimaryGeneratedColumn, Column 
} from "typeorm";
import "reflect-metadata";

// Define a decorator for soft-deleted entities
function SoftDelete() {
  return function(target: any) {
    Reflect.defineMetadata("entity:softDelete", true, target);
  };
}

// Create a base repository for soft-deleted entities
@EntityRepository()
class SoftDeleteRepository<T> extends Repository<T> {
  async softDelete(id: number | string): Promise<void> {
    await this.update(id, { isDeleted: true } as any);
  }
  
  async restore(id: number | string): Promise<void> {
    await this.update(id, { isDeleted: false } as any);
  }
  
  // Override find methods to exclude soft-deleted by default
  async find(options?: any): Promise<T[]> {
    options = options || {};
    options.where = options.where || {};
  
    // Only add isDeleted filter if the entity uses soft delete
    if (Reflect.getMetadata("entity:softDelete", this.target)) {
      options.where.isDeleted = false;
    }
  
    return super.find(options);
  }
  
  // Similar overrides for findOne, etc.
}

// Example usage
@Entity()
@SoftDelete()
class Article {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  title: string;
  
  @Column()
  content: string;
  
  @Column({ default: false })
  isDeleted: boolean;
}

@EntityRepository(Article)
class ArticleRepository extends SoftDeleteRepository<Article> {
  // Add article-specific methods here
  findByTitle(title: string) {
    return this.find({ where: { title } });
  }
}

// Now when you use ArticleRepository, soft-deleted records are
// automatically filtered out in find operations
```

This example demonstrates:

1. Creating an entity decorator `@SoftDelete` that marks entities for soft deletion
2. Creating a custom repository base class that handles soft deletions
3. Using metadata to determine which entities use soft deletion
4. Overriding find methods to exclude soft-deleted records

The `@SoftDelete` decorator doesn't change the entity directly but adds metadata that our custom repository can use to adjust its behavior.

## Conclusion

Custom decorators and metadata in TypeORM provide a powerful way to enhance your entities, automate common operations, and add business logic in a clean, declarative way. They allow you to:

1. Add validation and business rules to your entities
2. Create custom column types for specialized data handling
3. Automate repetitive tasks like timestamp updates
4. Build transaction management into your services
5. Create specialized repositories with enhanced functionality

By understanding the fundamentals of decorators and metadata reflection, you can create powerful abstractions that make your code more maintainable and expressive.

Remember, all decorators in TypeORM are built on these same principles—understanding them allows you to not only use TypeORM effectively but also extend it to meet your specific needs.
