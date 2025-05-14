# React Project Structure Best Practices

Let me explain how to structure React projects effectively, starting from first principles and building up to practical, modern approaches.

> Great structure is like good architecture - invisible when done well, but painfully obvious when done poorly. It doesn't just organize code; it shapes how we think about our application.

## First Principles of Project Structure

At its core, project structure answers a fundamental question: "Where does this piece of code belong?" The answer should be guided by these principles:

1. **Separation of Concerns** : Each part of your application should have a clear, single responsibility.
2. **Discoverability** : A new developer should be able to find things intuitively.
3. **Scalability** : The structure should accommodate growth without requiring major reorganization.
4. **Consistency** : Similar patterns should be applied throughout the project.

Let's build up from these principles to create a practical React project structure.

## The Basic Structure

Every React project typically starts with a structure created by tools like Create React App, Vite, or Next.js. Here's what a minimal structure might look like:

```
my-react-app/
├── node_modules/
├── public/
├── src/
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

The `src` directory is where your application code lives. As projects grow, this flat structure quickly becomes unwieldy. Let's expand it thoughtfully.

## Feature-Based vs. Type-Based Organization

There are two fundamental approaches to organizing React code:

### Type-Based Organization

```
src/
├── components/
├── containers/
├── hooks/
├── contexts/
├── services/
└── utils/
```

This approach organizes code by what it is (components, hooks, etc.). While intuitive for beginners, it has a critical flaw: related code ends up scattered across different directories, making it harder to understand how features work together.

For example, if you have a "user authentication" feature, its components, hooks, and services would be in separate directories, forcing developers to jump between folders to understand the feature.

### Feature-Based Organization

```
src/
├── features/
│   ├── authentication/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.js
│   ├── products/
│   └── checkout/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── App.js
```

This approach groups code by feature or domain. Everything related to authentication lives together, making it easier to understand how the feature works as a whole.

> Think of feature-based organization as cities with neighborhoods. Each neighborhood (feature) contains everything its residents need (components, services, styles), while still being part of the larger city (application).

## A Modern, Scalable Structure

Based on these principles, here's a more complete structure that works well for medium to large React applications:

```
src/
├── assets/                 # Static assets like images, fonts
├── components/             # Shared/common components
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.test.jsx
│   │   ├── Button.module.css
│   │   └── index.js        # Re-export for cleaner imports
│   └── Card/
├── features/               # Application features
│   ├── authentication/
│   │   ├── components/     # Feature-specific components
│   │   ├── hooks/          # Feature-specific hooks
│   │   ├── services/       # API calls, data transformation
│   │   ├── utils/          # Helper functions
│   │   ├── context.jsx     # Feature-specific context if needed
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── index.js        # Public API of the feature
│   └── dashboard/
├── hooks/                  # Shared hooks
├── layouts/                # Layout components (e.g., Header, Footer)
├── lib/                    # Third-party library configurations
├── services/               # Shared services (API, analytics)
├── utils/                  # Utility functions
├── App.jsx                 # Main application component
├── index.jsx               # Entry point
└── routes.jsx              # Route definitions
```

Let's examine some key parts of this structure in more detail:

## Component Organization

Individual components are best organized using the "component folder pattern":

```
Button/
├── Button.jsx         # The component itself
├── Button.module.css  # Component-specific styles
├── Button.test.jsx    # Tests
└── index.js           # Re-exports the component
```

The index.js file simply re-exports the component:

```javascript
export { default } from './Button';
export * from './Button'; // Named exports
```

This approach has several benefits:

* Keeps related files together
* Allows clean imports: `import Button from 'components/Button'`
* Makes it easy to add tests, styles, and documentation

## The Public API Pattern

For features and modules, use index.js files to create a clear public API:

```javascript
// features/authentication/index.js
export { default as LoginForm } from './components/LoginForm';
export { default as RegistrationForm } from './components/RegistrationForm';
export { useAuth } from './hooks/useAuth';
export { authReducer } from './state/authReducer';

// Do NOT export internal implementation details
```

This pattern:

* Makes it clear what parts of a feature are meant to be used by other features
* Prevents improper dependencies on implementation details
* Simplifies refactoring since internal changes don't affect external imports

## Feature Structure Example

Let's look at a concrete example of how a "products" feature might be structured:

```
features/products/
├── components/
│   ├── ProductCard/
│   │   ├── ProductCard.jsx
│   │   ├── ProductCard.module.css
│   │   └── index.js
│   ├── ProductList/
│   └── ProductDetail/
├── hooks/
│   ├── useProducts.js      # Custom hook for product data
│   └── useProductFilters.js
├── services/
│   └── productApi.js       # API calls related to products
├── utils/
│   └── formatProductPrice.js
├── context.jsx             # Product-related context if needed
└── index.js                # Public API of the feature
```

The `useProducts` hook might look like:

```javascript
// features/products/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/productApi';

export const useProducts = (categoryId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset state when categoryId changes
    setLoading(true);
    setError(null);
  
    // Fetch products for the given category
    fetchProducts(categoryId)
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [categoryId]);

  return { products, loading, error };
};
```

And the public API would expose only what other features need:

```javascript
// features/products/index.js
export { ProductList } from './components/ProductList';
export { ProductDetail } from './components/ProductDetail';
export { useProducts } from './hooks/useProducts';
```

## Shared vs. Feature-Specific Code

A common dilemma is deciding when code should be shared vs. kept feature-specific:

> Start by keeping code within features. Move it to shared directories only when it's genuinely needed by multiple features.

This approach avoids premature abstractions and keeps related code together until there's a clear benefit to sharing it.

## Absolute Imports

Configure your project to use absolute imports instead of relative imports:

```javascript
// Instead of this (relative import)
import Button from '../../../components/Button';

// Use this (absolute import)
import Button from 'components/Button';
```

In Create React App, add a `jsconfig.json` file:

```json
{
  "compilerOptions": {
    "baseUrl": "src"
  },
  "include": ["src"]
}
```

In Vite, update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

This makes imports cleaner and more maintainable as your project structure evolves.

## Advanced Organization Patterns

For larger applications, consider these additional patterns:

### Atomic Design

Organizing components following the Atomic Design methodology:

```
components/
├── atoms/        # Basic building blocks (Button, Input)
├── molecules/    # Groups of atoms (SearchForm)
├── organisms/    # Complex components (Header, ProductCard)
├── templates/    # Page layouts
└── pages/        # Actual pages composed of organisms
```

This provides a clear hierarchy and promotes reusability.

### Barrel Files

Use barrel files (index.js) to simplify imports:

```javascript
// components/index.js
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';

// Then in another file:
import { Button, Card, Input } from 'components';
```

### Domain-Driven Design

For very large applications, consider organizing by domains:

```
src/
├── domains/
│   ├── user/
│   │   ├── components/
│   │   ├── services/
│   │   └── models/
│   ├── product/
│   └── order/
├── shared/
└── App.jsx
```

This mirrors business domains and can scale to extremely large codebases.

## State Management Organization

If using Redux, organize state by feature:

```
src/
├── store/
│   ├── index.js              # Store setup
│   └── rootReducer.js        # Combines feature reducers
├── features/
│   ├── products/
│   │   ├── components/
│   │   ├── state/            # Redux files specific to products
│   │   │   ├── actions.js
│   │   │   ├── reducer.js
│   │   │   ├── selectors.js
│   │   │   └── types.js
│   │   └── index.js
```

If using Context API, keep contexts close to where they're used:

```javascript
// features/authentication/context.jsx
import { createContext, useContext, useReducer } from 'react';
import { authReducer, initialState } from './state/authReducer';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
```

## Testing Organization

Keep tests close to the code they test:

```
Button/
├── Button.jsx
├── Button.test.jsx      # Unit tests
├── Button.spec.jsx      # Integration tests (optional)
```

For end-to-end tests, consider a separate directory:

```
src/
├── features/
├── e2e/                 # End-to-end tests
│   ├── auth.test.js
│   └── checkout.test.js
```

## Real-World Example: E-commerce Application

Let's see how this might look in a real e-commerce application:

```
src/
├── assets/
│   ├── images/
│   └── fonts/
├── components/           # Shared components
│   ├── Button/
│   ├── Card/
│   └── Input/
├── features/
│   ├── authentication/
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   └── RegisterForm/
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── services/
│   │   │   └── authApi.js
│   │   ├── context.jsx
│   │   └── index.js
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductList/
│   │   │   └── ProductDetail/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.js
│   └── cart/
│       ├── components/
│       │   ├── CartItem/
│       │   └── CartSummary/
│       ├── hooks/
│       │   └── useCart.js
│       ├── context.jsx
│       └── index.js
├── layouts/
│   ├── MainLayout/
│   │   ├── MainLayout.jsx
│   │   ├── Header/
│   │   └── Footer/
│   └── AuthLayout/
├── lib/
│   ├── axios.js          # Axios configuration
│   └── firebase.js       # Firebase configuration
├── services/
│   ├── api.js            # Base API setup
│   └── analytics.js      # Analytics service
├── utils/
│   ├── formatters.js
│   └── validators.js
├── App.jsx
├── index.jsx
└── routes.jsx
```

## Conclusion

A well-structured React project provides:

* Clear organization that scales with your application
* Intuitive locations for new code
* Encapsulation of features with clear boundaries
* Easy navigation for developers new to the codebase

Remember these key principles:

1. Organize primarily by feature, with shared code separated
2. Keep related files together (component folder pattern)
3. Use index.js files to create clear public APIs
4. Use absolute imports for cleaner code
5. Start specific, then extract shared code only when needed

The best structure is one that works for your team and your specific application. As your project evolves, be willing to refactor your structure to keep it clean and maintainable.

> The goal isn't perfection, but clarity. A good structure lets developers focus on solving problems rather than hunting for files or figuring out where new code should go.
>
