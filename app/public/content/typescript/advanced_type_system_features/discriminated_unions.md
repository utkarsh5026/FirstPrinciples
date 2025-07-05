# Discriminated Unions: Creating Safe Union Types with Literal Type Discriminators

## Starting with JavaScript: The Foundation Problem

Before understanding discriminated unions, let's examine the JavaScript problem they solve. In JavaScript, we often need to handle objects that can have different "shapes" or structures:

```javascript
// JavaScript: Different types of events in an application
function handleEvent(event) {
  if (event.type === 'user_login') {
    // We expect: { type: 'user_login', userId: string, timestamp: number }
    console.log(`User ${event.userId} logged in at ${event.timestamp}`);
  } else if (event.type === 'file_upload') {
    // We expect: { type: 'file_upload', filename: string, size: number }
    console.log(`File ${event.filename} uploaded, size: ${event.size}`);
  } else if (event.type === 'error') {
    // We expect: { type: 'error', message: string, code: number }
    console.log(`Error ${event.code}: ${event.message}`);
  }
}

// This works, but has no safety guarantees
handleEvent({ type: 'user_login', userId: 'john123', timestamp: Date.now() });
handleEvent({ type: 'file_upload', filename: 'doc.pdf', size: 1024 });

// This will cause runtime errors - no compile-time protection!
handleEvent({ type: 'user_login', filename: 'wrong.pdf' }); // userId is undefined!
```

**The JavaScript Problem:** We have no compile-time guarantee that when `event.type` is `'user_login'`, the object actually has `userId` and `timestamp` properties. We're relying entirely on runtime checks and developer discipline.

## TypeScript's Initial Approach: Basic Union Types

TypeScript's first attempt to solve this uses union types:

```typescript
// Basic union type - this seems logical but has problems
type Event = {
  type: 'user_login';
  userId: string;
  timestamp: number;
} | {
  type: 'file_upload';
  filename: string;
  size: number;
} | {
  type: 'error';
  message: string;
  code: number;
};

function handleEvent(event: Event) {
  // ❌ TypeScript error: Property 'userId' does not exist on type 'Event'
  // console.log(event.userId); 
  
  // ❌ TypeScript error: Property 'filename' does not exist on type 'Event'
  // console.log(event.filename);
  
  // ✅ This works - 'type' exists on all variants
  console.log(event.type);
}
```

**The Problem with Basic Unions:** TypeScript only lets you access properties that exist on *all* variants of the union. Since `userId` only exists on the login event, TypeScript won't let you access it directly.

```
Union Type Access Rules
┌─────────────────────────────────────┐
│ Union: A | B | C                    │
│                                     │
│ ✅ Can access: Properties on A AND B AND C │
│ ❌ Cannot access: Properties only on A     │
│ ❌ Cannot access: Properties only on B     │
│ ❌ Cannot access: Properties only on C     │
└─────────────────────────────────────┘
```

## Enter Discriminated Unions: The Solution

> **Discriminated Union:** A union type where each variant has a common property (the "discriminator") with a unique literal type value that allows TypeScript to determine which variant you're working with.

The discriminator acts as a "type tag" that tells TypeScript (and the runtime) which specific shape the object has.

```typescript
// Same union as before, but now we'll use it properly
type Event = {
  type: 'user_login';    // ← 'user_login' is a literal type (discriminator)
  userId: string;
  timestamp: number;
} | {
  type: 'file_upload';   // ← 'file_upload' is a literal type (discriminator)
  filename: string;
  size: number;
} | {
  type: 'error';         // ← 'error' is a literal type (discriminator)
  message: string;
  code: number;
};

function handleEvent(event: Event) {
  // TypeScript uses the discriminator for "type narrowing"
  if (event.type === 'user_login') {
    // ✅ TypeScript now KNOWS this is the user_login variant
    console.log(`User ${event.userId} logged in`); // userId is safe to access!
    console.log(`Timestamp: ${event.timestamp}`);  // timestamp is safe to access!
    // ❌ event.filename would be an error here
  } else if (event.type === 'file_upload') {
    // ✅ TypeScript now KNOWS this is the file_upload variant
    console.log(`File: ${event.filename}`);        // filename is safe to access!
    console.log(`Size: ${event.size}`);            // size is safe to access!
    // ❌ event.userId would be an error here
  } else if (event.type === 'error') {
    // ✅ TypeScript now KNOWS this is the error variant
    console.log(`Error ${event.code}: ${event.message}`);
    // ❌ event.userId or event.filename would be errors here
  }
}
```

## Understanding Type Narrowing in Detail

Let's break down exactly what happens during type narrowing:

```typescript
function analyzeEvent(event: Event) {
  // At this point, event could be any of the three variants
  console.log("Event type:", event.type); // ✅ 'type' exists on all variants
  
  // When we check the discriminator...
  if (event.type === 'user_login') {
    // TypeScript's type narrowing algorithm:
    // 1. Look at the condition: event.type === 'user_login'
    // 2. Find all union variants where type could be 'user_login'
    // 3. Only the first variant matches
    // 4. Inside this block, treat 'event' as that specific variant
  
    type EventInThisBlock = {
      type: 'user_login';
      userId: string;
      timestamp: number;
    };
    // event is now guaranteed to have userId and timestamp
  }
}
```

```
Type Narrowing Flow
┌─────────────────────────────────────┐
│ Initial: Event (all 3 variants)    │
└─────────────────┬───────────────────┘
                  │
    if (event.type === 'user_login')
                  │
┌─────────────────▼───────────────────┐
│ Narrowed: Only user_login variant  │
│ Properties: type, userId, timestamp │
└─────────────────────────────────────┘
```

## Switch Statements: The Preferred Pattern

Switch statements provide a cleaner way to handle discriminated unions:

```typescript
function handleEvent(event: Event) {
  switch (event.type) {
    case 'user_login':
      // ✅ TypeScript knows this is user_login variant
      console.log(`User ${event.userId} logged in at ${event.timestamp}`);
      break;
    
    case 'file_upload':
      // ✅ TypeScript knows this is file_upload variant
      console.log(`Uploaded ${event.filename} (${event.size} bytes)`);
      break;
    
    case 'error':
      // ✅ TypeScript knows this is error variant
      console.log(`Error ${event.code}: ${event.message}`);
      break;
    
    default:
      // This should never be reached if we handle all cases
      const exhaustiveCheck: never = event;
      throw new Error(`Unhandled event type: ${exhaustiveCheck}`);
  }
}
```

> **Exhaustiveness Checking:** The `never` type in the default case ensures TypeScript will error if we add a new variant to the union but forget to handle it in the switch statement.

## Building More Complex Discriminated Unions

Let's create a more sophisticated example - an API response system:

```typescript
// Multiple discriminators can create complex patterns
type ApiResponse<T> = {
  status: 'loading';
  // No data when loading
} | {
  status: 'success';
  data: T;
  timestamp: number;
} | {
  status: 'error';
  error: {
    code: number;
    message: string;
    details?: string;
  };
  retryAfter?: number;
};

// Generic discriminated union - works with any data type
function handleUserResponse(response: ApiResponse<{ name: string; email: string }>) {
  switch (response.status) {
    case 'loading':
      console.log('Loading user data...');
      // ✅ No data property exists - TypeScript prevents access
      // console.log(response.data); // ❌ Error!
      break;
    
    case 'success':
      console.log('User loaded:', response.data.name); // ✅ data is guaranteed to exist
      console.log('Loaded at:', response.timestamp);   // ✅ timestamp guaranteed
      break;
    
    case 'error':
      console.log('Failed:', response.error.message);   // ✅ error guaranteed
      if (response.retryAfter) {                        // ✅ optional property handling
        console.log(`Retry after ${response.retryAfter}ms`);
      }
      break;
  }
}
```

## Multiple Discriminators: Advanced Patterns

Sometimes you need multiple discriminating properties:

```typescript
// Multiple discriminators for more complex scenarios
type DatabaseEvent = {
  category: 'user';
  action: 'create';
  userId: string;
  userData: { name: string; email: string };
} | {
  category: 'user';
  action: 'delete';
  userId: string;
} | {
  category: 'file';
  action: 'upload';
  fileId: string;
  metadata: { size: number; type: string };
} | {
  category: 'file';
  action: 'delete';
  fileId: string;
};

function handleDatabaseEvent(event: DatabaseEvent) {
  // First discriminator: category
  if (event.category === 'user') {
    // Now we know it's a user event, but not which action
    console.log('User event for:', event.userId); // ✅ userId guaranteed on all user events
  
    // Second discriminator: action
    if (event.action === 'create') {
      // ✅ Now we know it's specifically user creation
      console.log('Creating user:', event.userData.name);
    } else {
      // ✅ TypeScript knows this must be user deletion
      console.log('Deleting user:', event.userId);
      // ❌ event.userData would be an error here
    }
  } else {
    // ✅ TypeScript knows this must be file category
    console.log('File event for:', event.fileId);
  
    if (event.action === 'upload') {
      console.log('File size:', event.metadata.size);
    }
    // Handle file deletion...
  }
}
```

## Common Gotchas and How to Avoid Them

### Gotcha 1: Non-Literal Discriminators

```typescript
// ❌ This won't work as a discriminated union
type BadEvent = {
  type: string;  // Too broad - not a literal type
  data: any;
} | {
  type: string;  // Same issue
  error: string;
};

// ✅ Use literal types for discriminators
type GoodEvent = {
  type: 'success';  // Literal type
  data: any;
} | {
  type: 'error';    // Literal type
  error: string;
};
```

> **Discriminator Rule:** The discriminating property must have literal types (specific string/number/boolean values), not broad types like `string` or `number`.

### Gotcha 2: Missing Discriminator

```typescript
// ❌ No common discriminating property
type BadUnion = {
  userId: string;
  name: string;
} | {
  errorCode: number;
  message: string;
};

// TypeScript can't narrow this union effectively
function process(item: BadUnion) {
  // ❌ Can't safely access any specific properties
  // console.log(item.userId); // Error: doesn't exist on all variants
}

// ✅ Add a discriminator
type GoodUnion = {
  kind: 'user';
  userId: string;
  name: string;
} | {
  kind: 'error';
  errorCode: number;
  message: string;
};
```

### Gotcha 3: Compile Time vs Runtime

```typescript
type Event = {
  type: 'click';
  button: string;
} | {
  type: 'keypress';
  key: string;
};

function handleEvent(event: Event) {
  // ✅ This works at compile time and runtime
  if (event.type === 'click') {
    console.log(event.button);
  }
  
  // ❌ This type checking disappears at runtime!
  // The types don't exist in the JavaScript output
}

// The compiled JavaScript has no type information:
// function handleEvent(event) {
//   if (event.type === 'click') {
//     console.log(event.button);
//   }
// }
```

> **Runtime Reality:** Discriminated unions provide compile-time safety, but the discriminator property must actually exist at runtime for the pattern to work. TypeScript doesn't add runtime type checking.

## Real-World Example: Redux Action Pattern

Discriminated unions shine in patterns like Redux actions:

```typescript
// Redux-style actions using discriminated unions
type TodoAction = {
  type: 'ADD_TODO';
  payload: {
    id: string;
    text: string;
  };
} | {
  type: 'TOGGLE_TODO';
  payload: {
    id: string;
  };
} | {
  type: 'DELETE_TODO';
  payload: {
    id: string;
  };
} | {
  type: 'SET_FILTER';
  payload: {
    filter: 'all' | 'active' | 'completed';
  };
};

// Type-safe reducer
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD_TODO':
      // ✅ TypeScript knows payload has id and text
      return {
        ...state,
        todos: [...state.todos, {
          id: action.payload.id,
          text: action.payload.text,
          completed: false
        }]
      };
    
    case 'TOGGLE_TODO':
      // ✅ TypeScript knows payload only has id
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case 'SET_FILTER':
      // ✅ TypeScript knows payload has filter
      return {
        ...state,
        filter: action.payload.filter
      };
    
    default:
      // Exhaustiveness check
      const exhaustiveCheck: never = action;
      return state;
  }
}
```

## Best Practices Summary

> **Best Practices for Discriminated Unions:**
>
> 1. **Use literal types** for discriminators (`'loading'` not `string`)
> 2. **Choose descriptive discriminator names** (`status`, `type`, `kind`)
> 3. **Prefer switch statements** over if/else chains for multiple variants
> 4. **Include exhaustiveness checking** with the `never` type
> 5. **Keep discriminators simple** - avoid complex computed values
> 6. **Document the purpose** of each variant in comments

Discriminated unions are one of TypeScript's most powerful features for creating type-safe APIs that handle multiple related but distinct data shapes. They provide compile-time guarantees while remaining simple JavaScript objects at runtime, giving you the best of both worlds: developer safety and runtime simplicity.
