# Type Aliases and Primitive Types in TypeScript

TypeScript's type system is one of its most powerful features, building on JavaScript while adding static typing. To understand it well, we need to start from the very beginning with its fundamental building blocks: primitive types and type aliases.

## Primitive Types in TypeScript

Primitive types are the basic, built-in data types that form the foundation of TypeScript's type system. They represent simple, immutable values that aren't objects and don't have methods of their own.

### 1. Boolean

The boolean primitive represents logical values:

```typescript
// A simple boolean variable
let isComplete: boolean = false;

// Boolean as a result of a logical operation
let isValid: boolean = 5 > 3;
console.log(isValid); // true

// Boolean in a conditional statement
if (isComplete) {
  console.log("Task is complete");
} else {
  console.log("Task is still pending");
}
```

The boolean primitive can only have two possible values: `true` or `false`. This limitation makes it perfect for representing binary states in your programs, such as on/off, yes/no, or valid/invalid.

### 2. Number

TypeScript uses a single number type for all numeric values, whether integers or floating-point numbers:

```typescript
// Integer
let count: number = 42;

// Floating point
let price: number = 19.99;

// Negative numbers
let temperature: number = -5;

// Binary (base 2)
let binary: number = 0b1010; // 10 in decimal

// Octal (base 8)
let octal: number = 0o744; // 484 in decimal

// Hexadecimal (base 16)
let hex: number = 0xf00d; // 61453 in decimal

// Operations
let sum: number = count + 8;
console.log(sum); // 50
```

Unlike some other programming languages, TypeScript doesn't distinguish between integers and floating-point numbers at the type level - they're all considered `number`. This mirrors JavaScript's behavior, which is based on the IEEE 754 floating-point standard.

### 3. String

The string primitive represents text data:

```typescript
// String literals
let firstName: string = "John";
let lastName: string = 'Doe';

// Template literals (string interpolation)
let greeting: string = `Hello, ${firstName} ${lastName}!`;
console.log(greeting); // "Hello, John Doe!"

// String concatenation
let fullName: string = firstName + " " + lastName;
console.log(fullName); // "John Doe"

// String methods
console.log(firstName.toUpperCase()); // "JOHN"
console.log(greeting.length); // 17
```

Strings in TypeScript can be created using single quotes, double quotes, or backticks (template literals). Template literals are particularly useful for embedding expressions within strings.

### 4. Null and Undefined

These two primitives represent the absence of a value, but in slightly different ways:

```typescript
// null represents an intentional absence of a value
let user: null = null;

// undefined indicates that a value hasn't been assigned yet
let comment: undefined = undefined;

// Both can be used with other types when strictNullChecks is disabled
let name: string = null; // Only works with strictNullChecks disabled

// A more common pattern with strictNullChecks enabled
let username: string | null = null;
// Later in the code
username = "john_doe";
```

The distinction between `null` and `undefined` is subtle but important. `null` typically represents an intentional absence of any object value, while `undefined` usually means a variable has been declared but not yet assigned a value.

### 5. Symbol

Symbols are unique and immutable primitive values, often used as property keys to avoid naming collisions:

```typescript
// Creating a symbol
let sym1: symbol = Symbol();
let sym2: symbol = Symbol("description");
let sym3: symbol = Symbol("description");

console.log(sym2 === sym3); // false, each Symbol is unique

// Using symbols as property keys
const PROPERTY_KEY = Symbol('propertyKey');

let obj = {
  [PROPERTY_KEY]: "This property uses a symbol as its key"
};

console.log(obj[PROPERTY_KEY]); // "This property uses a symbol as its key"
```

Each symbol is guaranteed to be unique, making them excellent for creating special, hidden properties on objects that won't conflict with other properties.

### 6. BigInt

BigInt was added to handle integers larger than the Number type can safely represent:

```typescript
// Creating BigInts
let bigNumber: bigint = 9007199254740991n; // The 'n' suffix creates a BigInt
let alsoHuge: bigint = BigInt(9007199254740991);

// Operations with BigInts
let sum: bigint = bigNumber + 1n;
console.log(sum); // 9007199254740992n

// BigInts cannot be mixed with numbers in operations
// This would cause an error:
// let invalid = bigNumber + 1; // Error: Cannot mix BigInt and other types
```

BigInt is particularly useful when working with very large integers, such as when dealing with financial calculations, cryptography, or working with timestamps at a nanosecond level.

## Type Aliases in TypeScript

Now that we understand primitive types, let's explore type aliases, which allow us to create custom names for any type, making our code more readable and maintainable.

### What Are Type Aliases?

A type alias creates a new name for a type. They don't create new types; they simply give a name to existing types, which can be primitive or complex.

### Creating Basic Type Aliases

Let's start with the simplest use case, giving a descriptive name to a primitive type:

```typescript
// Type alias for a primitive type
type UserID = number;

// Now we can use UserID as a type
let currentUser: UserID = 123456;

// Type checking still works as expected
currentUser = "abc"; // Error: Type 'string' is not assignable to type 'number'

// The underlying type is still a number
let userId: UserID = 42;
let count: number = userId; // This works fine
```

In this example, `UserID` is just a more descriptive name for the `number` type. This is particularly useful when a numeric value has a specific meaning or role in your application.

### Creating Complex Type Aliases

Type aliases become more powerful when used with more complex types:

```typescript
// Type alias for a union type
type Status = "pending" | "approved" | "rejected";

// Using the type alias
let applicationStatus: Status = "pending";
applicationStatus = "approved"; // This is fine
applicationStatus = "waiting"; // Error: Type '"waiting"' is not assignable to type 'Status'

// Type alias for an object type
type Point = {
  x: number;
  y: number;
};

// Using the object type alias
let position: Point = { x: 10, y: 20 };
position = { x: 5 }; // Error: Property 'y' is missing
position = { x: 5, y: 15, z: 10 }; // Error: Object literal may only specify known properties
```

These examples demonstrate how type aliases can define more complex structures. The `Status` type is a union of string literals, ensuring that a variable can only be assigned one of those specific values. The `Point` type defines an object structure with specific properties.

### Type Aliases with Generics

Type aliases can also incorporate generic type parameters, making them even more flexible:

```typescript
// Type alias with a generic parameter
type Container<T> = { value: T };

// Using the generic type alias with different types
let numberContainer: Container<number> = { value: 42 };
let stringContainer: Container<string> = { value: "Hello" };

// Type alias for a generic function type
type Mapper<T, U> = (item: T) => U;

// Using the function type alias
const toStrings: Mapper<number, string> = (num) => num.toString();
const lengths: Mapper<string, number> = (str) => str.length;

console.log(toStrings(123)); // "123"
console.log(lengths("hello")); // 5
```

In these examples, the `Container<T>` type alias uses a generic parameter `T` that can be replaced with any type. The `Mapper<T, U>` type alias represents a function that takes an argument of type `T` and returns a value of type `U`.

### Combining Type Aliases

Type aliases can reference other type aliases, allowing you to build complex types from simpler ones:

```typescript
// Base type aliases
type Coordinate = number;
type Dimensions = {
  width: number;
  height: number;
};

// Combining type aliases
type Rectangle = {
  position: {
    x: Coordinate;
    y: Coordinate;
  };
  size: Dimensions;
};

// Using the combined type
const rect: Rectangle = {
  position: {
    x: 10,
    y: 20
  },
  size: {
    width: 100,
    height: 50
  }
};
```

By breaking down complex types into smaller, reusable pieces, we make our code more modular and easier to maintain.

### When to Use Type Aliases

Type aliases are particularly useful in the following scenarios:

1. **Improving code readability**: When a type has a specific meaning in your domain

   ```typescript
   // Without type alias
   function processUser(id: number): void { /* ... */ }
   
   // With type alias
   type UserID = number;
   function processUser(id: UserID): void { /* ... */ }
   ```

2. **Simplifying complex types**: When dealing with complex union or intersection types

   ```typescript
   // Without type alias
   function handleResponse(response: { data: any; status: number } | { error: string; status: number }): void { /* ... */ }
   
   // With type alias
   type SuccessResponse = { data: any; status: number };
   type ErrorResponse = { error: string; status: number };
   type Response = SuccessResponse | ErrorResponse;
   
   function handleResponse(response: Response): void { /* ... */ }
   ```

3. **Creating a vocabulary for your domain**: When you want to express domain concepts clearly

   ```typescript
   type CustomerID = string;
   type ProductID = string;
   type OrderStatus = "new" | "processing" | "shipped" | "delivered" | "canceled";
   
   type Order = {
     id: string;
     customerId: CustomerID;
     products: Array<{
       productId: ProductID;
       quantity: number;
     }>;
     status: OrderStatus;
     createdAt: Date;
   };
   ```

## Type Aliases vs. Interfaces

TypeScript offers two ways to define object types: type aliases and interfaces. While they're similar in many ways, there are some key differences:

```typescript
// Type alias for an object
type Person = {
  name: string;
  age: number;
};

// Equivalent interface
interface IPerson {
  name: string;
  age: number;
}

// Both can be used similarly
const person1: Person = { name: "Alice", age: 30 };
const person2: IPerson = { name: "Bob", age: 25 };
```

The main differences are:

1. **Declaration merging**: Interfaces can be extended through declaration merging, type aliases cannot

   ```typescript
   // This works with interfaces
   interface User {
     name: string;
   }
   
   interface User {
     age: number;
   }
   
   // Now User has both name and age properties
   const user: User = {
     name: "Charlie",
     age: 35
   };
   
   // This doesn't work with type aliases
   type Employee = {
     name: string;
   };
   
   // Error: Duplicate identifier 'Employee'
   type Employee = {
     department: string;
   };
   ```

2. **Type aliases can represent more than just object types**: They can represent any type, including primitives, unions, and tuples

   ```typescript
   // Type alias for a union type
   type ID = string | number;
   
   // Type alias for a tuple
   type Coordinates = [number, number];
   
   // Interfaces can only represent object shapes
   ```

3. **Extends vs. Intersection**: Interfaces use the `extends` keyword, type aliases use the `&` operator

   ```typescript
   // Extending interfaces
   interface Animal {
     name: string;
   }
   
   interface Dog extends Animal {
     breed: string;
   }
   
   // Intersection with type aliases
   type Animal = {
     name: string;
   };
   
   type Dog = Animal & {
     breed: string;
   };
   ```

## Practical Examples

Let's look at some real-world scenarios where type aliases and primitive types work together to create robust TypeScript code:

### Example 1: Building a User Authentication System

```typescript
// Define our primitive-based type aliases
type Email = string;
type Password = string;
type UserRole = "admin" | "user" | "guest";

// Define more complex object types
type User = {
  id: number;
  email: Email;
  displayName: string;
  role: UserRole;
  lastLogin: Date;
};

type LoginCredentials = {
  email: Email;
  password: Password;
};

// A function using these types
function login(credentials: LoginCredentials): Promise<User> {
  // Validate email format
  const isValidEmail = credentials.email.includes('@');
  
  if (!isValidEmail) {
    throw new Error('Invalid email format');
  }
  
  // Here we would normally authenticate against a database
  // For this example, we'll just return a mock user
  return Promise.resolve({
    id: 1,
    email: credentials.email,
    displayName: 'John Doe',
    role: 'user',
    lastLogin: new Date()
  });
}

// Using the function
async function authenticateUser() {
  try {
    const user = await login({
      email: 'john@example.com',
      password: 'password123'
    });
    
    console.log(`Welcome back, ${user.displayName}!`);
    
    // We can use the role type to control access
    if (user.role === 'admin') {
      console.log('Admin panel is available');
    }
  } catch (error) {
    console.error('Authentication failed:', error.message);
  }
}
```

In this example, we've used type aliases to create a domain-specific vocabulary around user authentication. Even though `Email` and `Password` are just strings underneath, giving them specific type names makes the code self-documenting and helps prevent errors like accidentally swapping parameters.

### Example 2: Shopping Cart System

```typescript
// Primitive-based type aliases
type ProductID = string;
type Quantity = number;
type Price = number;

// More complex object types
type Product = {
  id: ProductID;
  name: string;
  price: Price;
  inStock: boolean;
};

type CartItem = {
  product: Product;
  quantity: Quantity;
};

type Cart = {
  items: CartItem[];
  
  // Method to calculate total price
  calculateTotal(): Price;
  
  // Method to add a product to the cart
  addItem(product: Product, quantity: Quantity): void;
};

// Implementation of the Cart type
const createCart = (): Cart => {
  const items: CartItem[] = [];
  
  return {
    items,
    
    calculateTotal() {
      return this.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);
    },
    
    addItem(product, quantity) {
      // Check if product is in stock
      if (!product.inStock) {
        throw new Error(`Product ${product.name} is out of stock`);
      }
      
      // Find if product is already in cart
      const existingItem = this.items.find(item => 
        item.product.id === product.id
      );
      
      if (existingItem) {
        // Update quantity if already in cart
        existingItem.quantity += quantity;
      } else {
        // Add new item if not already in cart
        this.items.push({ product, quantity });
      }
    }
  };
};

// Using the cart
const myCart = createCart();

const laptop: Product = {
  id: 'prod-1',
  name: 'Laptop',
  price: 999.99,
  inStock: true
};

const mouse: Product = {
  id: 'prod-2',
  name: 'Wireless Mouse',
  price: 29.99,
  inStock: true
};

myCart.addItem(laptop, 1);
myCart.addItem(mouse, 2);

console.log(`Cart total: $${myCart.calculateTotal().toFixed(2)}`);
// Output: Cart total: $1059.97
```

In this shopping cart example, we've created type aliases for domain-specific concepts like `ProductID`, `Quantity`, and `Price`. These provide clear semantic meaning even though they're based on primitive types. The more complex `Cart` type also includes method signatures, showing how type aliases can describe behavior as well as data structure.

## Conclusion

Type aliases and primitive types form the foundation of TypeScript's type system. Starting with primitive types like `boolean`, `number`, and `string`, we can build increasingly complex and specific types using aliases.

Type aliases help us:
- Create meaningful, domain-specific type names
- Simplify complex type expressions
- Make code more readable and self-documenting
- Build a vocabulary specific to our application domain

By using type aliases effectively, we transform TypeScript from a mere type-checking tool into a powerful way to express domain concepts and business rules directly in our code. This not only catches errors at compile time but also serves as documentation for anyone reading the code.

As you continue working with TypeScript, you'll find that thoughtful use of type aliases leads to more maintainable, self-documenting code that's easier to refactor and extend as your application evolves.