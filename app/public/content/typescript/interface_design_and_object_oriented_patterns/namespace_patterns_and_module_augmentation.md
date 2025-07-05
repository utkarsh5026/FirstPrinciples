# Namespace Patterns and Module Augmentation: Extending Global Objects and Library Types

## JavaScript Foundation: Object-Based Namespacing

Before TypeScript, JavaScript developers used objects to create namespaces and avoid global pollution:

```javascript
// JavaScript: Manual namespacing to avoid conflicts
var MyCompany = MyCompany || {};
MyCompany.Utils = MyCompany.Utils || {};

MyCompany.Utils.formatCurrency = function(amount) {
    return '$' + amount.toFixed(2);
};

MyCompany.Utils.validateEmail = function(email) {
    return email.includes('@');
};

// Usage
console.log(MyCompany.Utils.formatCurrency(42.5)); // "$42.50"
```

**Problems with JavaScript namespacing:**

* No compile-time checking
* Easy to accidentally overwrite properties
* No IntelliSense or autocompletion
* Hard to track what belongs where

## TypeScript Namespaces: Adding Type Safety

TypeScript namespaces provide compile-time structure for the same concept:

```typescript
// TypeScript: Structured namespacing with types
namespace MyCompany {
    export namespace Utils {
        // Types are part of the namespace structure
        export type Currency = number;
        export type EmailAddress = string;
      
        export function formatCurrency(amount: Currency): string {
            return '$' + amount.toFixed(2);
        }
      
        export function validateEmail(email: EmailAddress): boolean {
            return email.includes('@') && email.includes('.');
        }
    }
}

// Usage with full type checking
let price: MyCompany.Utils.Currency = 42.5;
let formattedPrice = MyCompany.Utils.formatCurrency(price); // string
```

```
Compilation Flow:
┌─────────────────┐
│ TypeScript      │
│ namespace       │
│ declarations    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Type checking   │
│ and validation  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ JavaScript      │
│ object/IIFE     │
│ output          │
└─────────────────┘
```

> **Key Mental Model** : TypeScript namespaces are compile-time organizational tools that become regular JavaScript objects at runtime.

## Module System Context: Why Namespaces Became Less Common

Modern JavaScript uses modules instead of global namespacing:

```javascript
// Modern JavaScript: ES modules
// utils.js
export function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

export function validateEmail(email) {
    return email.includes('@');
}

// main.js
import { formatCurrency, validateEmail } from './utils.js';
console.log(formatCurrency(42.5));
```

```typescript
// TypeScript with modules
// utils.ts
export type Currency = number;
export type EmailAddress = string;

export function formatCurrency(amount: Currency): string {
    return '$' + amount.toFixed(2);
}

export function validateEmail(email: EmailAddress): boolean {
    return email.includes('@') && email.includes('.');
}

// main.ts
import { formatCurrency, Currency } from './utils';
let price: Currency = 42.5;
```

> **Best Practice** : Prefer ES modules over namespaces for new code. Namespaces are mainly useful for declaration files and extending existing global APIs.

## Declaration Merging: The Foundation of Augmentation

TypeScript allows "declaration merging" - combining multiple declarations of the same name:

```typescript
// Multiple interface declarations merge automatically
interface User {
    name: string;
}

interface User {
    email: string;
}

interface User {
    age: number;
}

// Result: User has name, email, AND age
let user: User = {
    name: "Alice",
    email: "alice@example.com",
    age: 30
}; // All properties required
```

```typescript
// Namespace merging
namespace MyLibrary {
    export function helper1() {
        return "helper1";
    }
}

namespace MyLibrary {
    export function helper2() {
        return "helper2";
    }
}

// Both functions available
MyLibrary.helper1(); // ✓
MyLibrary.helper2(); // ✓
```

```
Declaration Merging Flow:
┌─────────────────┐
│ First           │
│ declaration     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Additional      │
│ declarations    │
│ with same name  │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Merged single   │
│ declaration     │
│ with combined   │
│ properties      │
└─────────────────┘
```

## Module Augmentation: Extending External Modules

Module augmentation lets you add properties to existing modules:

```typescript
// Extending a third-party library
// Original library (lodash example)
declare module 'lodash' {
    interface LoDashStatic {
        // Adding our custom method to lodash
        customHelper(value: string): string;
    }
}

// Implementation (usually in a separate file)
import * as _ from 'lodash';

// Monkey-patch the actual implementation
(_.as any).customHelper = function(value: string): string {
    return `Custom: ${value}`;
};

// Now TypeScript knows about our addition
import * as _ from 'lodash';
_.customHelper("test"); // ✓ TypeScript recognizes this
```

```typescript
// More practical example: Extending Express Request
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
        }
    }
}

// Now in route handlers:
app.get('/profile', (req, res) => {
    // TypeScript knows about req.user
    if (req.user) {
        console.log(req.user.email); // ✓ Type-safe
    }
});
```

## Global Augmentation: Extending Built-in Objects

You can extend global objects like Array, String, etc.:

```typescript
// Extending global Array prototype
declare global {
    interface Array<T> {
        last(): T | undefined;
        first(): T | undefined;
    }
}

// Implementation
Array.prototype.last = function<T>(this: T[]): T | undefined {
    return this[this.length - 1];
};

Array.prototype.first = function<T>(this: T[]): T | undefined {
    return this[0];
};

// Usage with full type safety
let numbers = [1, 2, 3, 4, 5];
let lastNumber: number | undefined = numbers.last(); // 5
let firstNumber: number | undefined = numbers.first(); // 1

let strings = ["a", "b", "c"];
let lastString: string | undefined = strings.last(); // "c"
```

> **Warning** : Extending global prototypes is generally discouraged as it can cause conflicts with other libraries and unexpected behavior.

## Window Object Augmentation

Common pattern for adding properties to the browser's window object:

```typescript
// Adding custom properties to window
declare global {
    interface Window {
        myApp: {
            version: string;
            config: {
                apiUrl: string;
                debug: boolean;
            };
        };
        gtag?: (...args: any[]) => void; // Google Analytics
    }
}

// Implementation
window.myApp = {
    version: "1.0.0",
    config: {
        apiUrl: "https://api.example.com",
        debug: true
    }
};

// Usage with type safety
console.log(window.myApp.version); // ✓
window.myApp.config.apiUrl = "new-url"; // ✓

// Handles optional properties safely
if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID'); // ✓
}
```

## Library Type Extension Patterns

### Extending React Component Props

```typescript
// Extending standard HTML elements
declare module 'react' {
    interface HTMLAttributes<T> {
        // Adding custom data attributes
        'data-testid'?: string;
        'data-track'?: string;
    }
  
    interface CSSProperties {
        // CSS custom properties
        '--custom-color'?: string;
        '--custom-size'?: string;
    }
}

// Now these are recognized everywhere
function MyComponent() {
    return (
        <div 
            data-testid="my-component" // ✓
            style={{ '--custom-color': 'red' }} // ✓
        >
            Content
        </div>
    );
}
```

### Extending Node.js Global

```typescript
// Adding to Node.js global namespace
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DATABASE_URL: string;
            API_KEY: string;
            NODE_ENV: 'development' | 'production' | 'test';
        }
      
        interface Global {
            __DEV__: boolean;
        }
    }
}

// Usage with type checking
const dbUrl: string = process.env.DATABASE_URL; // ✓ Known to exist
const nodeEnv: string = process.env.NODE_ENV; // ✓ Limited to specific values

global.__DEV__ = process.env.NODE_ENV === 'development';
```

## Advanced Pattern: Conditional Module Augmentation

```typescript
// Extending based on conditions
declare module 'axios' {
    interface AxiosRequestConfig {
        // Only add if we're using auth
        auth?: {
            token: string;
            refreshToken?: string;
        };
    }
  
    interface AxiosResponse<T = any> {
        // Add timing information
        timing?: {
            start: number;
            end: number;
            duration: number;
        };
    }
}

// Usage
import axios from 'axios';

axios.get('/api/data', {
    auth: { token: 'abc123' } // ✓ TypeScript recognizes this
}).then(response => {
    if (response.timing) {
        console.log(`Request took ${response.timing.duration}ms`);
    }
});
```

## Module Augmentation File Structure

```typescript
// types/global.d.ts - Global augmentations
declare global {
    interface Window {
        myGlobalVar: string;
    }
}

export {}; // Makes this a module
```

```typescript
// types/lodash-extensions.d.ts - Library extensions
declare module 'lodash' {
    interface LoDashStatic {
        customMethod(): string;
    }
}
```

```typescript
// types/express-extensions.d.ts - Framework extensions
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
      
        interface Response {
            sendSuccess(data: any): void;
        }
    }
}

export {};
```

```
Type File Organization:
┌─────────────────┐
│ src/            │
│ ├── types/      │
│ │   ├── global.d.ts     │
│ │   ├── express.d.ts    │
│ │   └── library.d.ts    │
│ ├── components/ │
│ └── utils/      │
└─────────────────┘
```

## Common Gotchas and Best Practices

### ❌ Common Mistakes

```typescript
// DON'T: Augment without implementation
declare global {
    interface Array<T> {
        shuffle(): T[];
    }
}
// This adds the type but not the implementation!
[1, 2, 3].shuffle(); // Runtime error!

// DON'T: Overwrite existing methods
declare global {
    interface Array<T> {
        push(item: T): void; // Wrong! Changes existing signature
    }
}
```

### ✅ Best Practices

```typescript
// DO: Provide implementation with declaration
declare global {
    interface Array<T> {
        shuffle(): T[];
    }
}

Array.prototype.shuffle = function<T>(this: T[]): T[] {
    const result = [...this];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
};

// DO: Use optional properties for safety
declare global {
    interface Window {
        myOptionalFeature?: {
            enabled: boolean;
        };
    }
}

// Safe usage
if (window.myOptionalFeature?.enabled) {
    // Feature is available
}
```

> **Key Principle** : Module augmentation is powerful but should be used sparingly. Always prefer composition over global modification when possible.

## When to Use Each Pattern

**Use Namespaces When:**

* Writing declaration files for global libraries
* Working with legacy code that uses global variables
* Creating internal organizational structure in .d.ts files

**Use Module Augmentation When:**

* Adding types to third-party libraries
* Extending framework interfaces (Express, React, etc.)
* Adding custom properties to existing modules

**Use Global Augmentation When:**

* Adding properties to built-in objects (sparingly)
* Extending window object for browser globals
* Adding environment-specific global types

> **Mental Model** : Think of augmentation as "teaching TypeScript about runtime modifications you've made" rather than "making runtime modifications through types."

The key insight is that module augmentation doesn't change runtime behavior - it only informs TypeScript's type checker about changes you've made or properties that exist. This maintains the separation between compile-time type checking and runtime execution that makes TypeScript so powerful.
