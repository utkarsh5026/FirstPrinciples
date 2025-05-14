# Handling 404 Pages and Redirects in React: A First Principles Approach

Let me explain how to handle 404 pages and redirects in React from the very fundamentals, building up our understanding step by step.

## Understanding the Core Concepts

> The web is built upon HTTP requests and responses. When a user navigates to a URL, their browser sends a request to a server, which responds with content and a status code. Status codes like 404 (Not Found) and 3xx (Redirects) are fundamental to web navigation.

### What is a 404 Page?

A 404 page appears when a user tries to access a resource that doesn't exist. It's named after the HTTP status code 404, which means "Not Found." Rather than showing users a generic browser error, we can create custom 404 pages that:

1. Match our application's design
2. Help users find what they're looking for
3. Provide navigation options to keep users engaged

### What are Redirects?

Redirects are instructions that send users from one URL to another. They're crucial for:

1. Maintaining SEO when URLs change
2. Directing users to login pages for protected content
3. Handling legacy URLs
4. Creating URL shortcuts

## React Router: The Foundation

React Router is the standard library for handling routes in React applications. It provides components for navigating between different views.

Let's start with a basic understanding of how React Router works:

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import NotFound from './components/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

In this example:

* `BrowserRouter` provides the routing context
* `Routes` groups our route definitions
* Each `Route` maps a path to a component
* The special `path="*"` catches all routes that don't match defined paths

## Creating a Custom 404 Page

Let's create a simple but effective 404 page:

```jsx
// components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found-container">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div className="suggestions">
        <h2>You might want to:</h2>
        <ul>
          <li>Check the URL for typos</li>
          <li>Go back to our <Link to="/">homepage</Link></li>
          <li>Visit our <Link to="/sitemap">sitemap</Link></li>
        </ul>
      </div>
    </div>
  );
}

export default NotFound;
```

This 404 page:

1. Clearly communicates the error
2. Provides possible reasons for the error
3. Offers navigation options to help the user
4. Uses React Router's `Link` component for navigation without full page reloads

## Implementing Redirects in React Router

React Router provides several ways to handle redirects. Let's explore them one by one:

### 1. Using the `Navigate` Component

The `Navigate` component is the simplest way to create redirects in React Router v6:

```jsx
import { Navigate } from 'react-router-dom';

// Example: Redirect from /old-page to /new-page
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/old-page" element={<Navigate to="/new-page" />} />
      <Route path="/new-page" element={<NewPage />} />
    </Routes>
  );
}
```

When a user visits `/old-page`, they'll be immediately redirected to `/new-page`.

### 2. Programmatic Navigation

Sometimes we need to redirect users based on certain conditions, like authentication status:

```jsx
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const navigate = useNavigate();
  const isAuthenticated = checkIfUserIsLoggedIn(); // Your auth check function
  
  React.useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Only render the profile if authenticated
  return isAuthenticated ? (
    <div>
      <h1>Welcome to your profile!</h1>
      {/* Profile content */}
    </div>
  ) : null; // Return null while redirecting
}
```

In this example:

1. We use the `useNavigate` hook to get the navigation function
2. We check if the user is authenticated
3. If not, we redirect them to the login page
4. We return `null` during the redirect to avoid a flash of content

### 3. Conditional Rendering with `Navigate`

We can also use conditional rendering with the `Navigate` component:

```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isAuthenticated = checkIfUserIsLoggedIn(); // Your auth check function
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Otherwise, render the protected content
  return children;
}

// Usage in your routes
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

This approach:

1. Creates a reusable `ProtectedRoute` component
2. Checks authentication status
3. Either redirects to login or renders the protected content
4. Uses the `replace` prop to replace the current entry in the history stack

## Advanced Redirect Patterns

### 1. Redirects with State

You can pass state to the redirected route to provide context:

```jsx
import { Navigate } from 'react-router-dom';

function OldProductPage() {
  const productId = getProductIdFromUrl(); // Get ID from current URL
  
  // Redirect to new URL format with state
  return (
    <Navigate 
      to={`/products/${productId}`}
      state={{ from: 'old-product-page', referrer: document.referrer }}
      replace
    />
  );
}
```

On the receiving page, you can access this state:

```jsx
import { useLocation } from 'react-router-dom';

function NewProductPage() {
  const location = useLocation();
  const { from, referrer } = location.state || {}; // Handle missing state
  
  // You can use this information for analytics or conditional rendering
  console.log(`User came from: ${from}, referrer: ${referrer}`);
  
  return (
    <div>
      <h1>Product Details</h1>
      {/* Product content */}
    </div>
  );
}
```

### 2. Temporary vs. Permanent Redirects

In server-side rendering or when working with backends, it's important to distinguish between:

* Temporary redirects (HTTP 302): For temporary changes, like maintenance
* Permanent redirects (HTTP 301): For permanent URL changes

While React Router handles client-side redirects, server-side redirects require server configuration.

## Real-World Examples

### Example 1: Authentication Flow

Here's a more complete example of an authentication flow:

```jsx
// components/RequireAuth.js
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();
  
  if (!auth.user) {
    // Redirect to login but save the current location
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace
      />
    );
  }
  
  return children;
}

// App.js routes
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
```

In the login component, we can use the saved location state to redirect back:

```jsx
// components/Login.js
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the saved location or default to home
  const from = location.state?.from || '/';
  
  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      await auth.login(username, password);
      // Redirect back to the page they tried to visit
      navigate(from, { replace: true });
    } catch (error) {
      // Handle login error
      setError(error.message);
    }
  };
  
  return (
    <div>
      <h1>Login</h1>
      {/* Login form */}
    </div>
  );
}
```

### Example 2: Dynamic 404 Pages

We can create dynamic 404 pages that try to help users find what they're looking for:

```jsx
// components/SmartNotFound.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function SmartNotFound() {
  const location = useLocation();
  const [suggestions, setSuggestions] = useState([]);
  const path = location.pathname;
  
  useEffect(() => {
    // Simple search algorithm for suggestions
    // In a real app, this could be more sophisticated
    const findSuggestions = () => {
      // Example routes database
      const availableRoutes = [
        { path: '/', title: 'Home' },
        { path: '/products', title: 'Products' },
        { path: '/services', title: 'Services' },
        { path: '/contact', title: 'Contact Us' },
        { path: '/about', title: 'About Us' }
      ];
    
      // Find routes that partially match the current path
      return availableRoutes
        .filter(route => {
          const currentSegments = path.split('/').filter(Boolean);
          const routeSegments = route.path.split('/').filter(Boolean);
        
          // Check for partial matches
          return currentSegments.some(segment => 
            routeSegments.some(routeSegment => 
              routeSegment.includes(segment) || segment.includes(routeSegment)
            )
          );
        })
        .slice(0, 3); // Limit to 3 suggestions
    };
  
    setSuggestions(findSuggestions());
  }, [path]);
  
  return (
    <div className="smart-not-found">
      <h1>404 - Page Not Found</h1>
      <p>We couldn't find <code>{path}</code></p>
    
      {suggestions.length > 0 && (
        <div className="suggestions">
          <h2>Did you mean one of these?</h2>
          <ul>
            {suggestions.map(route => (
              <li key={route.path}>
                <Link to={route.path}>{route.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    
      <div className="search">
        <h2>Try searching for what you need:</h2>
        <input type="text" placeholder="Search..." />
        <button>Search</button>
      </div>
    
      <Link to="/" className="home-link">Go to Homepage</Link>
    </div>
  );
}

export default SmartNotFound;
```

This enhanced 404 page:

1. Analyzes the current path
2. Suggests similar pages that do exist
3. Provides a search function
4. Always includes a link to the homepage

## Server-Side Considerations

While React Router handles client-side routing, there are important server-side considerations:

### 1. Server Configuration for SPAs

For a Single Page Application (SPA), you need to configure your server to send the `index.html` file for all routes, allowing React Router to handle them:

```javascript
// Express.js example
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Handle all routes by sending index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(3000);
```

### 2. Server-Side Redirects

For SEO and proper HTTP status codes, some redirects should be handled by the server:

```javascript
// Express.js redirect example
app.get('/old-page', (req, res) => {
  // 301 is a permanent redirect
  res.redirect(301, '/new-page');
});

app.get('/temporary-redirect', (req, res) => {
  // 302 is a temporary redirect
  res.redirect(302, '/destination');
});
```

### 3. Server-Side 404 Handling

For true 404 responses (with proper status codes), you need server configuration:

```javascript
// Express.js 404 example
// This should be placed AFTER all other routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'build', 'index.html'));
});
```

This sends the React app's HTML but with a 404 status code, allowing React Router to show its 404 page.

## Common Mistakes and Best Practices

### Mistakes to Avoid

1. **Using anchor tags instead of Link components** :

```jsx
   // Incorrect - causes full page reload
   <a href="/about">About</a>

   // Correct - uses React Router's client-side navigation
   <Link to="/about">About</Link>
```

1. **Forgetting that client-side 404s don't send HTTP status codes** :
   Without server configuration, search engines won't know your 404 page is actually a 404.
2. **Not handling redirects properly in authentication flows** :
   Forgetting to save and use the "from" location means users don't get sent back to where they were trying to go.

### Best Practices

1. **Make 404 pages helpful** :
   Include search functionality, links to popular pages, and clear navigation options.
2. **Use relative paths for flexibility** :

```jsx
   // Prefer this
   <Navigate to="../success" />

   // Over absolute paths when appropriate
   <Navigate to="/form/success" />
```

1. **Consider loading states during redirects** :

```jsx
   function ProfilePage() {
     const [isLoading, setIsLoading] = useState(true);
     const navigate = useNavigate();
   
     useEffect(() => {
       async function checkAuth() {
         const userIsAuth = await checkAuthStatus();
         if (!userIsAuth) {
           navigate('/login');
         } else {
           setIsLoading(false);
         }
       }
     
       checkAuth();
     }, [navigate]);
   
     if (isLoading) return <LoadingSpinner />;
   
     return <div>Profile content</div>;
   }
```

1. **Implement analytics for 404 pages** :
   Track which URLs are causing 404 errors to identify and fix broken links.

## Advanced Techniques

### 1. Lazy Loading with Suspense and Error Boundaries

Combine lazy loading with error handling:

```jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components
const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const NotFound = lazy(() => import('./components/NotFound'));

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
```

This approach:

1. Lazy loads components for better performance
2. Shows a loading indicator during component loading
3. Catches errors with an ErrorBoundary
4. Falls back to a friendly error message if something goes wrong

### 2. Custom History Handling

You can create a custom history listener to track and analyze navigation patterns:

```jsx
import { useNavigate, useLocation } from 'react-router-dom';

function HistoryTracker() {
  const location = useLocation();
  
  React.useEffect(() => {
    // Track page views
    const { pathname, search } = location;
  
    // Log or send to analytics
    console.log(`Page viewed: ${pathname}${search}`);
  
    // Example: send to Google Analytics
    // window.gtag('config', 'GA-ID', { page_path: pathname + search });
  }, [location]);
  
  return null; // This component doesn't render anything
}

// Use in your app
function App() {
  return (
    <BrowserRouter>
      <HistoryTracker />
      <Routes>
        {/* Your routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

## Conclusion

Handling 404 pages and redirects in React is about creating a seamless user experience when things don't go as expected. By understanding the underlying principles of routing, HTTP status codes, and React Router's components, you can build intuitive navigation that gracefully handles errors and redirects.

Remember these key points:

> 1. Use React Router's `Route path="*"` to catch 404s
> 2. Create helpful 404 pages that guide users back to valid content
> 3. Use `Navigate` for declarative redirects
> 4. Use `useNavigate()` for programmatic redirects
> 5. Consider both client and server-side handling for the best SEO results

By thinking about navigation from first principles, you can create a robust routing system that handles both the happy path and error cases elegantly.
