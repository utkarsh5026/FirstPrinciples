# TypeScript CommonJS Interoperability: From First Principles

## Part 1: JavaScript Module Foundations

Before understanding TypeScript's CommonJS interoperability, we need to understand how JavaScript modules work at their core.

### The Problem Modules Solve

In early JavaScript, there was no built-in module system:

```javascript
// Before modules: Everything in global scope
var userName = "Alice";
var userAge = 25;

function greetUser() {
    return "Hello, " + userName;
}

// Problem: All variables are global, causing conflicts
```

### JavaScript's Module Evolution

```
Evolution of JavaScript Modules:

No Modules (pre-2009)
    ↓
CommonJS (2009, Node.js)
    ↓
AMD/UMD (Browser solutions)
    ↓
ES Modules (2015, Standard)
```

## Part 2: CommonJS - The Foundation

### How CommonJS Works Fundamentally

CommonJS was created for server-side JavaScript (Node.js) and works through:

1. **Synchronous loading** (files are on disk, not network)
2. **File-based modules** (each file is a module)
3. **Runtime module resolution** (modules loaded when `require()` executes)

```javascript
// math.js - A CommonJS module
function add(a, b) {
    return a + b;
}

function multiply(a, b) {
    return a * b;
}

// Export specific functions
module.exports = {
    add: add,
    multiply: multiply
};

// Alternative: Export entire function
// module.exports = add;
```

```javascript
// app.js - Using the module
const math = require('./math'); // Synchronous load
const result = math.add(5, 3);   // Use exported function

console.log(result); // 8
```

### The CommonJS Runtime Mechanism

> **Key Mental Model** : CommonJS wraps your code in a function at runtime

```javascript
// What you write:
const fs = require('fs');
module.exports = { myFunction };

// What Node.js actually executes:
(function(exports, require, module, __filename, __dirname) {
    const fs = require('fs');
    module.exports = { myFunction };
})(exports, require, module, __filename, __dirname);
```

## Part 3: TypeScript Enters the Picture

### The Core Challenge

TypeScript needs to:

1. **Understand** CommonJS at compile time (for type checking)
2. **Generate** appropriate JavaScript output
3. **Interoperate** with existing CommonJS libraries

### Basic TypeScript CommonJS

```typescript
// math.ts - TypeScript with CommonJS
function add(a: number, b: number): number {
    return a + b;
}

function multiply(a: number, b: number): number {
    return a * b;
}

// TypeScript export with types
export = {
    add,
    multiply
};
```

```typescript
// app.ts - Importing with types
import math = require('./math'); // CommonJS import syntax

const result: number = math.add(5, 3); // Type-safe usage
```

### TypeScript's Module Compilation

```
TypeScript Compilation Process:

Source (.ts) → Type Checking → JavaScript Output
     ↓              ↓              ↓
   Types        Validates      Runtime Code
 (compile)     (compile)       (runtime)
```

## Part 4: Module Resolution Strategies

### TypeScript's `module` Compiler Option

```json
// tsconfig.json
{
    "compilerOptions": {
        "module": "commonjs",  // Output format
        "moduleResolution": "node",  // Resolution strategy
        "target": "es5"
    }
}
```

> **Important** : `module` controls OUTPUT format, `moduleResolution` controls how TypeScript FINDS modules

### Different Module Outputs

```typescript
// Source TypeScript
export function greet(name: string): string {
    return `Hello, ${name}!`;
}
```

**CommonJS Output** (`"module": "commonjs"`):

```javascript
function greet(name) {
    return "Hello, " + name + "!";
}
exports.greet = greet;
```

**ES Module Output** (`"module": "es2015"`):

```javascript
export function greet(name) {
    return `Hello, ${name}!`;
}
```

## Part 5: Import/Export Interoperability

### The Fundamental Problem

CommonJS and ES Modules have different semantics:

```javascript
// CommonJS: Dynamic, runtime
const module = require('./some-module');
module.someMethod();

// ES Modules: Static, compile-time
import { someMethod } from './some-module';
someMethod();
```

### TypeScript's Solutions

#### 1. `export =` and `import = require()`

```typescript
// logger.ts - CommonJS-style export
class Logger {
    log(message: string): void {
        console.log(`[LOG]: ${message}`);
    }
}

export = Logger; // Single export, CommonJS style
```

```typescript
// app.ts - CommonJS-style import
import Logger = require('./logger'); // Specific syntax for CommonJS

const logger = new Logger();
logger.log("Hello world");
```

#### 2. Mixed Syntax with `esModuleInterop`

```json
// tsconfig.json
{
    "compilerOptions": {
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true
    }
}
```

```typescript
// Now you can mix syntaxes
import Logger from './logger';        // ES6 default import
import * as fs from 'fs';            // Namespace import
import { readFile } from 'fs';       // Named import (if available)
```

## Part 6: Working with Node.js Built-ins

### The Type Definition Challenge

Node.js modules are written in C++, not TypeScript:

```typescript
// Without types (error):
const fs = require('fs'); // Error: Cannot find module 'fs'
fs.readFileSync('file.txt'); // No type information
```

```typescript
// With @types packages:
import * as fs from 'fs'; // Types available
const content: string = fs.readFileSync('file.txt', 'utf8'); // Type-safe
```

### Installing Type Definitions

```bash
# Core Node.js types
npm install --save-dev @types/node

# Other library types
npm install --save-dev @types/express @types/lodash
```

## Part 7: Advanced Interoperability Patterns

### Handling Default Exports

> **Common Gotcha** : CommonJS doesn't have "default exports" - it's a TypeScript/ES6 concept

```javascript
// third-party-lib.js (CommonJS library)
module.exports = function createServer() {
    return { start: () => console.log('Server started') };
};
```

```typescript
// Wrong approach:
import createServer from 'third-party-lib'; // May not work

// Better approaches:
import * as createServer from 'third-party-lib';
// or
import createServer = require('third-party-lib');
// or with esModuleInterop:
import createServer from 'third-party-lib'; // Works with esModuleInterop
```

### Conditional Imports

```typescript
// Dynamic require() for conditional loading
async function loadModule(condition: boolean) {
    if (condition) {
        // Dynamic import (ES2020+)
        const module = await import('./optional-module');
        return module.default;
    } else {
        // CommonJS require (synchronous)
        const module = require('./fallback-module');
        return module;
    }
}
```

## Part 8: Mixed Module Systems in Practice

### Real-world Scenario: Express App

```typescript
// server.ts - Mixed module usage
import express from 'express';           // ES6 import (with esModuleInterop)
import * as path from 'path';           // Namespace import
import cors = require('cors');          // CommonJS import
import { readFileSync } from 'fs';      // Named import

const app = express();

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Route with type safety
app.get('/api/data', (req: express.Request, res: express.Response) => {
    try {
        const data = readFileSync('./data.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

export = app; // CommonJS export for compatibility
```

### Module Compatibility Matrix

```
Import Style         | CommonJS Lib | ES Module Lib | Node Built-in
-------------------- | ------------ | ------------- | -------------
import * as x        | ✅ Always    | ✅ Always     | ✅ Always
import x from        | ⚠️ Need flag | ✅ Native     | ⚠️ Need flag
import { x } from    | ❌ Usually   | ✅ Native     | ✅ Usually
import x = require   | ✅ Always    | ❌ Never      | ✅ Always
```

## Part 9: Troubleshooting Common Issues

### Issue 1: "Cannot use import statement outside a module"

```typescript
// Problem: Mixing ES6 imports with CommonJS output
import { someFunction } from './module'; // ES6 syntax

// Solution: Match import style to module target
const { someFunction } = require('./module'); // CommonJS syntax
// OR change tsconfig.json module target to "es2015" or higher
```

### Issue 2: Default Import Issues

```typescript
// Library exports: module.exports = { foo: 'bar' }
import lib from 'some-lib'; // undefined
console.log(lib.foo); // Error: Cannot read property 'foo' of undefined

// Solutions:
import * as lib from 'some-lib'; // { foo: 'bar' }
// OR enable esModuleInterop in tsconfig.json
```

### Issue 3: Type vs Runtime Mismatch

> **Critical Understanding** : Types exist only at compile time, not runtime

```typescript
// This looks like it imports types, but it imports the runtime module
import * as fs from 'fs';
console.log(typeof fs); // "object" - runtime value exists

// Type-only import (TypeScript 3.8+)
import type { Stats } from 'fs'; // Only imports the type, no runtime code
```

## Part 10: Best Practices

### Configuration Strategy

```json
// tsconfig.json - Recommended for Node.js projects
{
    "compilerOptions": {
        "module": "commonjs",              // Output CommonJS for Node.js
        "target": "es2018",               // Modern Node.js features
        "moduleResolution": "node",        // Node.js resolution algorithm
        "esModuleInterop": true,          // Better interop with ES modules
        "allowSyntheticDefaultImports": true, // Allow default import syntax
        "strict": true,                   // Enable all strict checks
        "resolveJsonModules": true,       // Allow importing .json files
        "declaration": true,              // Generate .d.ts files
        "outDir": "./dist",              // Output directory
        "rootDir": "./src"               // Source directory
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
}
```

### Import Guidelines

> **Best Practice** : Be consistent within a project, explicit about module types

```typescript
// For Node.js built-ins: Use namespace imports
import * as fs from 'fs';
import * as path from 'path';

// For third-party CommonJS libs: Check if they have default exports
import express from 'express';      // Has default export
import * as lodash from 'lodash';   // Namespace import safer

// For your own modules: Use ES6 syntax consistently
import { myFunction } from './utils';
export { myFunction };
```

## Part 11: The Future: ESM in Node.js

### Node.js ESM Support

Node.js now supports ES Modules natively:

```json
// package.json
{
    "type": "module",  // Enable ESM for .js files
    "exports": {
        ".": {
            "import": "./dist/index.mjs",
            "require": "./dist/index.cjs"
        }
    }
}
```

### Dual Package Publishing

```typescript
// Modern approach: Publish both formats
// index.mjs (ES Module)
export function greet(name: string): string {
    return `Hello, ${name}!`;
}

// index.cjs (CommonJS)
function greet(name) {
    return `Hello, ${name}!`;
}
exports.greet = greet;
```

---

> **Key Takeaway** : TypeScript's CommonJS interoperability bridges the gap between legacy Node.js modules and modern ES6 modules, allowing gradual migration while maintaining type safety. Understanding both the compile-time type checking and runtime module loading is crucial for effective TypeScript development.

The ecosystem is moving toward ES Modules, but CommonJS interoperability remains essential for working with the vast existing Node.js ecosystem.
