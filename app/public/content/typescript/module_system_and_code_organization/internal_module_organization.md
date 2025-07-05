# TypeScript Module Organization: From First Principles to Enterprise Architecture

## Part 1: JavaScript Module Foundations

Before understanding TypeScript's module organization, we need to understand what modules solve in JavaScript.

### The Original Problem: Global Scope Pollution

```javascript
// early-web.js - The bad old days
var userName = "Alice";
var userAge = 25;

function getUserInfo() {
    return userName + " is " + userAge;
}

// Another script loads...
var userName = "Bob"; // Oops! Overwrote the previous value
// Everything breaks silently
```

> **Core Problem** : JavaScript originally had only global scope and function scope. Every variable and function lived in the global namespace, causing inevitable naming conflicts in larger applications.

### Evolution: Module Patterns in Plain JavaScript

```javascript
// module-pattern.js - The IIFE (Immediately Invoked Function Expression) solution
var UserModule = (function() {
    // Private variables - enclosed in function scope
    var userName = "Alice";
    var userAge = 25;
  
    // Private functions
    function validateAge(age) {
        return age >= 0 && age <= 150;
    }
  
    // Public API - what we expose to the outside world
    return {
        getName: function() {
            return userName;
        },
        setAge: function(age) {
            if (validateAge(age)) {
                userAge = age;
            }
        },
        getInfo: function() {
            return userName + " is " + userAge;
        }
    };
})();

// Usage: Only the returned object is accessible
console.log(UserModule.getName()); // "Alice"
console.log(UserModule.userName);  // undefined - private!
```

> **Key Insight** : Modules are fundamentally about **encapsulation** - hiding implementation details while exposing a controlled public interface.

### Modern JavaScript: ES6 Modules

```javascript
// user.js - ES6 module syntax
const userName = "Alice"; // Private by default
let userAge = 25;         // Private by default

function validateAge(age) { // Private by default
    return age >= 0 && age <= 150;
}

// Explicitly export what should be public
export function getName() {
    return userName;
}

export function setAge(age) {
    if (validateAge(age)) {
        userAge = age;
    }
}

export function getInfo() {
    return `${userName} is ${userAge}`;
}
```

```javascript
// app.js - Consuming the module
import { getName, setAge, getInfo } from './user.js';

console.log(getName()); // "Alice"
console.log(getInfo()); // "Alice is 25"
// console.log(userName); // Error! Not exported
```

> **Mental Model** : Think of modules as  **contracts** . The export statement defines what the module promises to provide to the outside world. The import statement defines what a module needs from other modules.

## Part 2: TypeScript's Module System Enhancement

TypeScript builds on JavaScript's module system but adds **static type checking** and enhanced tooling.

### Basic TypeScript Module Structure

```typescript
// user.ts - TypeScript enhances JavaScript modules with types
interface User {
    readonly id: number;      // readonly - can't be changed after creation
    name: string;
    age: number;
}

interface UserRepository {
    findById(id: number): User | null;
    save(user: User): void;
}

// Private implementation details
let nextId = 1;
const users: Map<number, User> = new Map();

function validateAge(age: number): boolean {
    return age >= 0 && age <= 150;
}

// Public API - explicitly typed
export function createUser(name: string, age: number): User {
    if (!validateAge(age)) {
        throw new Error(`Invalid age: ${age}`);
    }
  
    const user: User = {
        id: nextId++,
        name,
        age
    };
  
    users.set(user.id, user);
    return user;
}

export function findUser(id: number): User | null {
    return users.get(id) || null;
}

// Export types for other modules to use
export type { User, UserRepository };
```

```typescript
// app.ts - Type-safe consumption
import { createUser, findUser, type User } from './user.js';

// TypeScript ensures type safety at compile time
const alice: User = createUser("Alice", 25);        // ✅ Correct
const bob: User = createUser("Bob", "30");          // ❌ Error: string not assignable to number
const charlie: User = createUser("Charlie", -5);    // ✅ Compiles, but throws at runtime

const found: User | null = findUser(alice.id);
if (found) {
    console.log(found.name); // TypeScript knows 'found' is User here
}
```

> **Type-Level vs Runtime Contracts** : TypeScript modules define two contracts - the runtime contract (what functions/values are available) and the type contract (what types are expected/returned). The type contract exists only at compile time.

### Understanding TypeScript's Compilation Process

```
TypeScript Source (.ts)
         ↓
    Type Checking ← Types are analyzed here
         ↓
    Type Erasure ← Types are removed
         ↓
JavaScript Output (.js) ← Only runtime code remains
         ↓
    Runtime Execution
```

## Part 3: Basic Module Organization Patterns

### Pattern 1: Feature-Based Organization

```typescript
// features/user/types.ts - Centralized type definitions
export interface User {
    id: number;
    email: string;
    profile: UserProfile;
}

export interface UserProfile {
    firstName: string;
    lastName: string;
    avatar?: string;
}

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
}
```

```typescript
// features/user/repository.ts - Data access layer
import type { User, CreateUserRequest } from './types.js';

class UserRepository {
    private users: Map<number, User> = new Map();
    private nextId = 1;

    async create(request: CreateUserRequest): Promise<User> {
        const user: User = {
            id: this.nextId++,
            email: request.email,
            profile: {
                firstName: request.firstName,
                lastName: request.lastName
            }
        };
      
        this.users.set(user.id, user);
        return user;
    }

    async findById(id: number): Promise<User | null> {
        return this.users.get(id) || null;
    }
}

export { UserRepository };
```

```typescript
// features/user/service.ts - Business logic layer
import type { User, CreateUserRequest } from './types.js';
import { UserRepository } from './repository.js';

export class UserService {
    constructor(private repository: UserRepository) {}

    async createUser(request: CreateUserRequest): Promise<User> {
        // Business logic: validate email format
        if (!this.isValidEmail(request.email)) {
            throw new Error('Invalid email format');
        }

        return this.repository.create(request);
    }

    async getUser(id: number): Promise<User> {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new Error(`User with id ${id} not found`);
        }
        return user;
    }

    private isValidEmail(email: string): boolean {
        return email.includes('@') && email.includes('.');
    }
}
```

```typescript
// features/user/index.ts - Public module interface (Barrel Export)
// This file controls what the outside world can access from this module

export type { User, UserProfile, CreateUserRequest } from './types.js';
export { UserService } from './service.js';
export { UserRepository } from './repository.js';

// Note: Internal utilities, private types, etc. are NOT exported
// This creates a clear boundary between public API and implementation details
```

> **Barrel Exports** : The `index.ts` file acts as a "barrel" that re-exports selected items from the module. This creates a single entry point and hides internal module structure from consumers.

### Pattern 2: Layer-Based Organization

```typescript
// domain/user.ts - Core business entities
export class User {
    constructor(
        public readonly id: number,
        public readonly email: string,
        private _profile: UserProfile
    ) {}

    get profile(): UserProfile {
        return { ...this._profile }; // Return copy to maintain immutability
    }

    updateProfile(updates: Partial<UserProfile>): User {
        // Domain logic: ensure business rules are followed
        const newProfile = { ...this._profile, ...updates };
      
        if (!newProfile.firstName.trim()) {
            throw new Error('First name cannot be empty');
        }

        return new User(this.id, this.email, newProfile);
    }
}

export interface UserProfile {
    firstName: string;
    lastName: string;
    avatar?: string;
}
```

```typescript
// infrastructure/user-repository.ts - Data persistence layer
import type { User } from '../domain/user.js';

export interface IUserRepository {
    save(user: User): Promise<void>;
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
}

export class InMemoryUserRepository implements IUserRepository {
    private users: Map<number, User> = new Map();

    async save(user: User): Promise<void> {
        this.users.set(user.id, user);
    }

    async findById(id: number): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }
}
```

```typescript
// application/user-service.ts - Application/Use Case layer
import { User, type UserProfile } from '../domain/user.js';
import type { IUserRepository } from '../infrastructure/user-repository.js';

export class UserService {
    constructor(private userRepository: IUserRepository) {}

    async createUser(email: string, profile: UserProfile): Promise<User> {
        // Application logic: check if user already exists
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new Error('User with this email already exists');
        }

        const user = new User(
            this.generateId(), 
            email, 
            profile
        );

        await this.userRepository.save(user);
        return user;
    }

    async updateUserProfile(userId: number, updates: Partial<UserProfile>): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Delegate to domain object for business logic
        const updatedUser = user.updateProfile(updates);
        await this.userRepository.save(updatedUser);
      
        return updatedUser;
    }

    private generateId(): number {
        return Math.floor(Math.random() * 1000000);
    }
}
```

> **Dependency Direction** : Notice how dependencies flow inward - the infrastructure layer depends on domain interfaces, not the other way around. This keeps business logic independent of technical details.

## Part 4: Advanced Organizational Strategies

### Strategy 1: Shared Kernel Pattern

When multiple modules need to share common functionality:

```typescript
// shared/result.ts - Shared error handling pattern
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
    readonly kind = 'success' as const;
    constructor(public readonly value: T) {}
  
    isSuccess(): this is Success<T> { return true; }
    isFailure(): this is never { return false; }
}

export class Failure<E> {
    readonly kind = 'failure' as const;
    constructor(public readonly error: E) {}
  
    isSuccess(): this is never { return false; }
    isFailure(): this is Failure<E> { return true; }
}

export function success<T>(value: T): Success<T> {
    return new Success(value);
}

export function failure<E>(error: E): Failure<E> {
    return new Failure(error);
}
```

```typescript
// shared/events.ts - Shared event system
export interface DomainEvent {
    readonly eventId: string;
    readonly occurredAt: Date;
    readonly eventType: string;
}

export class EventBus {
    private handlers: Map<string, Array<(event: DomainEvent) => void>> = new Map();

    subscribe<T extends DomainEvent>(
        eventType: string, 
        handler: (event: T) => void
    ): void {
        const handlers = this.handlers.get(eventType) || [];
        handlers.push(handler as (event: DomainEvent) => void);
        this.handlers.set(eventType, handlers);
    }

    publish(event: DomainEvent): void {
        const handlers = this.handlers.get(event.eventType) || [];
        handlers.forEach(handler => handler(event));
    }
}
```

```typescript
// features/user/events.ts - Module-specific events using shared infrastructure
import type { DomainEvent } from '../../shared/events.js';

export interface UserCreatedEvent extends DomainEvent {
    eventType: 'UserCreated';
    userId: number;
    email: string;
}

export interface UserProfileUpdatedEvent extends DomainEvent {
    eventType: 'UserProfileUpdated';
    userId: number;
    changes: Record<string, any>;
}

export function createUserCreatedEvent(userId: number, email: string): UserCreatedEvent {
    return {
        eventId: crypto.randomUUID(),
        occurredAt: new Date(),
        eventType: 'UserCreated',
        userId,
        email
    };
}
```

### Strategy 2: Plugin Architecture with TypeScript

```typescript
// core/plugin.ts - Plugin system foundation
export interface Plugin {
    readonly name: string;
    readonly version: string;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
}

export interface PluginContext {
    readonly config: Record<string, any>;
    readonly logger: Logger;
    readonly eventBus: EventBus;
}

export interface Logger {
    info(message: string, data?: any): void;
    error(message: string, error?: Error): void;
    debug(message: string, data?: any): void;
}

// Plugin registry with type safety
export class PluginRegistry {
    private plugins: Map<string, Plugin> = new Map();
  
    register(plugin: Plugin): void {
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Plugin ${plugin.name} is already registered`);
        }
        this.plugins.set(plugin.name, plugin);
    }
  
    async initializeAll(): Promise<void> {
        for (const plugin of this.plugins.values()) {
            await plugin.initialize();
        }
    }
  
    getPlugin<T extends Plugin>(name: string): T | null {
        return (this.plugins.get(name) as T) || null;
    }
}
```

```typescript
// plugins/audit/index.ts - Example plugin implementation
import type { Plugin, PluginContext, Logger } from '../../core/plugin.js';
import type { DomainEvent } from '../../shared/events.js';

export class AuditPlugin implements Plugin {
    readonly name = 'audit';
    readonly version = '1.0.0';
  
    private logger!: Logger;
    private events: DomainEvent[] = [];

    constructor(private context: PluginContext) {}

    async initialize(): Promise<void> {
        this.logger = this.context.logger;
      
        // Subscribe to all events for auditing
        this.context.eventBus.subscribe('*', (event) => {
            this.auditEvent(event);
        });
      
        this.logger.info('Audit plugin initialized');
    }

    async shutdown(): Promise<void> {
        this.logger.info(`Audit plugin recorded ${this.events.length} events`);
    }

    private auditEvent(event: DomainEvent): void {
        this.events.push(event);
        this.logger.debug('Event audited', { 
            eventType: event.eventType, 
            eventId: event.eventId 
        });
    }

    // Plugin-specific public methods
    getAuditTrail(): ReadonlyArray<DomainEvent> {
        return [...this.events];
    }
}
```

> **Plugin Benefits** : This pattern allows you to add functionality without modifying core modules. Each plugin is isolated and can be developed, tested, and deployed independently.

## Part 5: Large Application Architecture Patterns

### Pattern 1: Modular Monolith

```
src/
├── shared/                 # Shared utilities and types
│   ├── types/             # Common type definitions
│   ├── utils/             # Utility functions
│   └── infrastructure/    # Shared infrastructure code
├── modules/               # Business modules
│   ├── user/              # User management module
│   │   ├── domain/        # Business logic and entities
│   │   ├── application/   # Use cases and services
│   │   ├── infrastructure/# Data access and external APIs
│   │   └── api/          # HTTP endpoints (if web app)
│   ├── billing/           # Billing module
│   └── reporting/         # Reporting module
└── app/                   # Application composition
    ├── container.ts       # Dependency injection
    ├── config.ts          # Configuration
    └── main.ts           # Application entry point
```

```typescript
// app/container.ts - Dependency injection container
interface ServiceContainer {
    userService: UserService;
    billingService: BillingService;
    reportingService: ReportingService;
}

export class Container {
    private services: Partial<ServiceContainer> = {};

    // Lazy initialization with type safety
    getUserService(): UserService {
        if (!this.services.userService) {
            const userRepo = new InMemoryUserRepository();
            this.services.userService = new UserService(userRepo);
        }
        return this.services.userService;
    }

    getBillingService(): BillingService {
        if (!this.services.billingService) {
            const billingRepo = new InMemoryBillingRepository();
            const userService = this.getUserService(); // Dependency
            this.services.billingService = new BillingService(billingRepo, userService);
        }
        return this.services.billingService;
    }

    // ... other services
}

// Global container instance
export const container = new Container();
```

### Pattern 2: Hexagonal Architecture (Ports and Adapters)

```typescript
// modules/user/domain/ports.ts - Define what the domain needs
export interface UserRepository {
    save(user: User): Promise<void>;
    findById(id: number): Promise<User | null>;
}

export interface EmailService {
    sendWelcomeEmail(email: string, name: string): Promise<void>;
}

export interface EventPublisher {
    publish(event: DomainEvent): Promise<void>;
}
```

```typescript
// modules/user/application/user-service.ts - Core business logic
import type { UserRepository, EmailService, EventPublisher } from '../domain/ports.js';
import { User } from '../domain/user.js';
import { createUserCreatedEvent } from '../domain/events.js';

export class UserService {
    constructor(
        private userRepository: UserRepository,
        private emailService: EmailService,
        private eventPublisher: EventPublisher
    ) {}

    async registerUser(email: string, name: string): Promise<User> {
        // Business logic is independent of implementation details
        const user = new User(this.generateId(), email, { firstName: name, lastName: '' });
      
        await this.userRepository.save(user);
        await this.emailService.sendWelcomeEmail(email, name);
        await this.eventPublisher.publish(createUserCreatedEvent(user.id, email));
      
        return user;
    }

    private generateId(): number {
        return Date.now(); // Simple ID generation
    }
}
```

```typescript
// modules/user/infrastructure/adapters.ts - Concrete implementations
import type { UserRepository, EmailService, EventPublisher } from '../domain/ports.js';

export class PostgresUserRepository implements UserRepository {
    async save(user: User): Promise<void> {
        // PostgreSQL-specific implementation
        console.log('Saving to PostgreSQL:', user);
    }

    async findById(id: number): Promise<User | null> {
        // PostgreSQL-specific implementation
        console.log('Finding in PostgreSQL:', id);
        return null;
    }
}

export class SMTPEmailService implements EmailService {
    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        // SMTP-specific implementation
        console.log(`Sending welcome email to ${email} for ${name}`);
    }
}

export class RabbitMQEventPublisher implements EventPublisher {
    async publish(event: DomainEvent): Promise<void> {
        // RabbitMQ-specific implementation
        console.log('Publishing to RabbitMQ:', event);
    }
}
```

> **Hexagonal Architecture Benefits** : The domain logic doesn't depend on any specific technology. You can swap out databases, message queues, or email services without changing business logic.

## Part 6: Module Boundaries and Communication

### Establishing Clear Boundaries

```typescript
// modules/user/public-api.ts - Explicit public interface
export interface UserModule {
    // Queries
    getUserById(id: number): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
  
    // Commands  
    createUser(request: CreateUserRequest): Promise<User>;
    updateUser(id: number, updates: UserUpdate): Promise<User>;
  
    // Events (what this module publishes)
    onUserCreated(handler: (event: UserCreatedEvent) => void): void;
    onUserUpdated(handler: (event: UserUpdatedEvent) => void): void;
}

// Only export the interface, not the implementation
export type { User, CreateUserRequest, UserUpdate } from './types.js';
export type { UserCreatedEvent, UserUpdatedEvent } from './events.js';
```

```typescript
// modules/billing/service.ts - Consuming another module
import type { UserModule, User } from '../user/public-api.js';

export class BillingService {
    constructor(private userModule: UserModule) {
        // Subscribe to user events
        this.userModule.onUserCreated(this.handleUserCreated.bind(this));
    }

    async createSubscription(userId: number, planId: string): Promise<Subscription> {
        // Get user data through the public API only
        const user = await this.userModule.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Create subscription logic...
        const subscription = new Subscription(userId, planId);
        return subscription;
    }

    private handleUserCreated(event: UserCreatedEvent): void {
        // Automatically create a free trial for new users
        console.log(`Creating free trial for user ${event.userId}`);
    }
}
```

> **Module Communication Rules** :
>
> 1. Modules communicate only through their public APIs
> 2. No direct access to internal implementation
> 3. Use events for loose coupling between modules
> 4. Share types, not implementations

### Anti-Pattern: Tight Coupling

```typescript
// ❌ BAD: Direct dependency on internal implementation
import { InMemoryUserRepository } from '../user/infrastructure/user-repository.js';

export class BillingService {
    constructor(private userRepo: InMemoryUserRepository) {} // Tightly coupled!
  
    async billUser(userId: number): Promise<void> {
        // Directly accessing repository breaks encapsulation
        const user = await this.userRepo.findById(userId);
        // ...
    }
}
```

```typescript
// ✅ GOOD: Dependency on public interface
import type { UserModule } from '../user/public-api.js';

export class BillingService {
    constructor(private userModule: UserModule) {} // Loosely coupled
  
    async billUser(userId: number): Promise<void> {
        // Use public API - respects module boundaries
        const user = await this.userModule.getUserById(userId);
        // ...
    }
}
```

## Part 7: Common Pitfalls and Best Practices

### Pitfall 1: Circular Dependencies

```typescript
// ❌ PROBLEM: Circular dependency
// user/service.ts
import { BillingService } from '../billing/service.js';

export class UserService {
    constructor(private billingService: BillingService) {}
}

// billing/service.ts  
import { UserService } from '../user/service.js';

export class BillingService {
    constructor(private userService: UserService) {} // Circular!
}
```

```typescript
// ✅ SOLUTION 1: Use events to break the cycle
// user/service.ts
import { EventBus } from '../shared/event-bus.js';

export class UserService {
    constructor(private eventBus: EventBus) {}
  
    async createUser(data: CreateUserRequest): Promise<User> {
        const user = new User(data);
        // Publish event instead of direct call
        this.eventBus.publish(new UserCreatedEvent(user.id));
        return user;
    }
}

// billing/service.ts
import { EventBus } from '../shared/event-bus.js';

export class BillingService {
    constructor(private eventBus: EventBus) {
        // Subscribe to events instead of direct dependency
        this.eventBus.subscribe('UserCreated', this.handleUserCreated.bind(this));
    }
  
    private handleUserCreated(event: UserCreatedEvent): void {
        // Create free trial subscription
    }
}
```

### Pitfall 2: Over-Abstraction

```typescript
// ❌ PROBLEM: Unnecessary abstraction layers
interface IUserFactory {
    createUser(data: any): IUser;
}

interface IUserValidator {
    validate(user: IUser): IValidationResult;
}

interface IUserPersistence {
    save(user: IUser): Promise<IPersistenceResult>;
}

// Too many interfaces for simple operations!
```

```typescript
// ✅ SOLUTION: Start simple, add abstraction when needed
class UserService {
    private users: Map<number, User> = new Map();
  
    createUser(email: string, name: string): User {
        if (!email.includes('@')) {
            throw new Error('Invalid email');
        }
      
        const user = new User(this.generateId(), email, name);
        this.users.set(user.id, user);
        return user;
    }
  
    // Add interfaces later when you have multiple implementations
}
```

### Best Practice: Progressive Enhancement

```typescript
// Start with concrete implementation
class EmailService {
    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        // Direct SMTP implementation
        console.log(`Sending email to ${to}: ${subject}`);
    }
}

// Add interface when you need multiple implementations
interface IEmailService {
    sendEmail(to: string, subject: string, body: string): Promise<void>;
}

class SMTPEmailService implements IEmailService {
    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        // SMTP implementation
    }
}

class MockEmailService implements IEmailService {
    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        // Mock for testing
    }
}
```

> **Key Principle** : Add abstraction when you have a **concrete need** for it (multiple implementations, testing, swappable dependencies), not because it might be useful someday.

## Part 8: Testing Module Organization

### Unit Testing Individual Modules

```typescript
// user/service.test.ts
import { UserService } from './service.js';
import type { UserRepository } from './types.js';

// Mock implementation for testing
class MockUserRepository implements UserRepository {
    private users: Map<number, User> = new Map();
  
    async save(user: User): Promise<void> {
        this.users.set(user.id, user);
    }
  
    async findById(id: number): Promise<User | null> {
        return this.users.get(id) || null;
    }
}

describe('UserService', () => {
    let userService: UserService;
    let mockRepository: MockUserRepository;
  
    beforeEach(() => {
        mockRepository = new MockUserRepository();
        userService = new UserService(mockRepository);
    });
  
    test('should create user with valid data', async () => {
        const user = await userService.createUser('test@example.com', 'Test User');
      
        expect(user.email).toBe('test@example.com');
        expect(user.profile.firstName).toBe('Test User');
      
        // Verify it was saved
        const saved = await mockRepository.findById(user.id);
        expect(saved).toEqual(user);
    });
  
    test('should throw error for invalid email', async () => {
        await expect(
            userService.createUser('invalid-email', 'Test User')
        ).rejects.toThrow('Invalid email format');
    });
});
```

### Integration Testing Module Interactions

```typescript
// integration/user-billing.test.ts
import { UserService } from '../modules/user/service.js';
import { BillingService } from '../modules/billing/service.js';
import { EventBus } from '../shared/event-bus.js';

describe('User-Billing Integration', () => {
    let eventBus: EventBus;
    let userService: UserService;
    let billingService: BillingService;
  
    beforeEach(() => {
        eventBus = new EventBus();
        userService = new UserService(new MockUserRepository(), eventBus);
        billingService = new BillingService(eventBus);
    });
  
    test('should create free trial when user is created', async () => {
        // Create user
        const user = await userService.createUser('test@example.com', 'Test User');
      
        // Wait for event processing
        await new Promise(resolve => setTimeout(resolve, 10));
      
        // Verify billing service created free trial
        const subscription = billingService.getUserSubscription(user.id);
        expect(subscription.type).toBe('free_trial');
    });
});
```

## Conclusion: Module Organization Mental Models

> **Mental Model 1: Modules as Microservices** : Think of each module as if it could be deployed as a separate service. This forces you to design clean APIs and minimize coupling.

> **Mental Model 2: Onion Architecture** : Dependencies should flow inward. Core business logic shouldn't depend on infrastructure details like databases or external APIs.

> **Mental Model 3: Plugin System** : Design your application so new features can be added as plugins without modifying existing code. This promotes extensibility and maintainability.

The key to successful module organization in TypeScript is understanding that  **modules are about managing complexity through boundaries** . Start simple, add structure as your application grows, and always prioritize clear interfaces over complex abstractions.

```
Simple Function → Module → Package → Service
     ↑              ↑         ↑         ↑
   Single         Related   Related   Related
 Responsibility  Functions  Modules   Services
```

Each level of organization should have a **single reason to change** and a  **clear, well-defined responsibility** . TypeScript's type system helps enforce these boundaries by making implicit dependencies explicit and catching violations at compile time.
