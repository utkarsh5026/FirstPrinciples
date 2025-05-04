# React Router: From First Principles

I'll explain React Router from the ground up, starting with core concepts and building to practical implementation. Let's break down this essential React library step by step.

> The essence of modern web applications is not just what they display, but how they navigate between different views while maintaining a single-page application feel. This is where React Router comes in - bridging the gap between traditional multi-page websites and the dynamic single-page applications we build today.

## What is Client-Side Routing?

Before diving into React Router specifically, let's understand the problem it solves.

### Traditional Server Routing vs. Client-Side Routing

In traditional websites, when you click a link:

1. The browser sends a request to the server
2. The server returns a completely new HTML page
3. The browser loads this new page from scratch (with a full page refresh)

This creates a noticeable interruption in user experience - the page flickers, state is lost, and everything reloads.

Client-side routing, on the other hand:

1. Intercepts navigation events (like clicks on links)
2. Prevents the default browser navigation
3. Updates the URL using browser history APIs
4. Renders different components based on the URL
5. All without requesting new HTML from the server

### The Benefits of Client-Side Routing

* **Smoother user experience** : No page reloads means smoother transitions
* **Maintained application state** : Your app's memory isn't wiped clean with each navigation
* **Faster navigation** : Only new data needs to be fetched, not entire pages
* **More app-like feel** : Modern web apps feel more like native applications

## What is React Router?

React Router is a standard library for routing in React applications. It enables the navigation among views in a React application, allows browsers to change the URL, and keeps the UI in sync with the URL.

### Core Concepts of React Router

1. **Routers** : Components that establish a routing context (like `BrowserRouter` or `HashRouter`)
2. **Routes** : Define mappings between URL patterns and React components
3. **Links** : Special components that navigate without full page refreshes
4. **Hooks** : Functions that provide access to routing information and capabilities

## Setting Up React Router

Let's start implementing React Router step by step.

### Installation

First, you need to install React Router in your project:

```javascript
// Using npm
npm install react-router-dom

// Using yarn
yarn add react-router-dom

// Using pnpm
pnpm add react-router-dom
```

React Router DOM is specifically for web applications. (There's also react-router-native for React Native apps.)

### Basic Setup with BrowserRouter

The first step is to wrap your application with a router. The most common router is `BrowserRouter`, which uses the HTML5 history API to keep your UI in sync with the URL.

```jsx
// src/index.js or src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

In this example:

* We import `BrowserRouter` from the react-router-dom package
* We wrap our entire `App` component with `BrowserRouter`
* This makes routing functionality available throughout our application

### Creating Routes

Now that our app is wrapped in a router, we can define the routes in our application. Routes map URL paths to specific components.

```jsx
// App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="app">
      <header>
        <h1>My React App</h1>
      </header>
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    
      <footer>
        <p>© 2025 My React App</p>
      </footer>
    </div>
  );
}

export default App;
```

Let's analyze this routing setup:

* We import `Routes` and `Route` components from react-router-dom
* `Routes` acts as a container/parent for all route definitions
* Each `Route` maps a URL path to a component via the `element` prop
* The `path="*"` is a special pattern that matches any URL that hasn't matched previous routes (a 404 page)

This structure means:

* When the URL is `/` → Home component renders
* When the URL is `/about` → About component renders
* When the URL is `/contact` → Contact component renders
* Any other URL → NotFound component renders

## Navigation with Links

Now we need a way to navigate between these routes without triggering full page refreshes. React Router provides the `Link` component for this purpose.

```jsx
// components/Navbar.jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
```

We can then add this Navbar to our App:

```jsx
// App.jsx (updated)
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="app">
      <header>
        <h1>My React App</h1>
        <Navbar />
      </header>
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    
      <footer>
        <p>© 2025 My React App</p>
      </footer>
    </div>
  );
}

export default App;
```

How the `Link` component works:

* It renders as an `<a>` tag in the HTML
* It intercepts clicks to prevent default browser navigation
* It updates the URL using the history API
* React Router then renders the appropriate component based on the new URL

### NavLink: Enhanced Links with Active States

React Router also provides `NavLink`, an extension of `Link` that adds styling when the link is active:

```jsx
// components/Navbar.jsx (with NavLink)
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "active-link" : ""}
            end
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/about" 
            className={({ isActive }) => isActive ? "active-link" : ""}
          >
            About
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => isActive ? "active-link" : ""}
          >
            Contact
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
```

Key features of `NavLink`:

* The `className` prop can take a function that receives an object with an `isActive` property
* This lets you apply conditional styling based on whether the route is currently active
* The `end` prop ensures the link is only considered active when the current URL exactly matches the `to` value (important for the root path)

## Advanced Routing Concepts

Now that we understand the basics, let's explore more advanced routing concepts.

### Nested Routes

Nested routes allow you to create more complex UIs where certain parts of the page change while others remain constant:

```jsx
// App.jsx with nested routes
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductReviews from './pages/ProductReviews';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="app">
      <header>
        <h1>My React App</h1>
        <Navbar />
      </header>
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      
        {/* Nested Routes */}
        <Route path="/products" element={<Products />}>
          <Route path=":productId" element={<ProductDetail />}>
            <Route path="reviews" element={<ProductReviews />} />
          </Route>
        </Route>
      
        <Route path="*" element={<NotFound />} />
      </Routes>
    
      <footer>
        <p>© 2025 My React App</p>
      </footer>
    </div>
  );
}

export default App;
```

To make nested routes work, you need to use the `Outlet` component in the parent route component:

```jsx
// pages/Products.jsx
import { Outlet } from 'react-router-dom';

function Products() {
  // Fetch and display list of products
  
  return (
    <div className="products-page">
      <h2>Our Products</h2>
    
      {/* Product listing UI */}
      <div className="product-list">
        {/* Product items would be here */}
      </div>
    
      {/* This is where nested route components will render */}
      <Outlet />
    </div>
  );
}

export default Products;
```

Similarly, in the ProductDetail component:

```jsx
// pages/ProductDetail.jsx
import { useParams, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  
  useEffect(() => {
    // Fetch product data based on productId
    // This is where you'd typically make an API call
    const fetchProduct = async () => {
      // Simulate API fetch
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      setProduct(data);
    };
  
    fetchProduct();
  }, [productId]);
  
  if (!product) return <div>Loading...</div>;
  
  return (
    <div className="product-detail">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>${product.price}</p>
    
      <div className="product-actions">
        <button>Add to Cart</button>
        <button>Add to Wishlist</button>
      </div>
    
      {/* Link to reviews */}
      <Link to="reviews">See Reviews</Link>
    
      {/* This is where the Reviews component will render */}
      <Outlet />
    </div>
  );
}

export default ProductDetail;
```

> The beauty of nested routes is that they mirror the nested structure of your UI components, creating a natural hierarchy that users can navigate through while maintaining context.

### Dynamic Routes with URL Parameters

In the examples above, we used `:productId` as a URL parameter. This represents a dynamic segment of the URL that can match any value.

To access these parameters, we use the `useParams` hook:

```jsx
// Simplified example of pages/ProductDetail.jsx
import { useParams } from 'react-router-dom';

function ProductDetail() {
  // Extract the productId from the URL
  const { productId } = useParams();
  
  return (
    <div>
      <h2>Product Details</h2>
      <p>You are viewing product with ID: {productId}</p>
      {/* Rest of component */}
    </div>
  );
}

export default ProductDetail;
```

If the URL is `/products/42`, then `productId` will be `"42"`.

### Route Parameters with Path Patterns

React Router supports various path patterns to match URLs:

* **Static segments** : `/about` - Matches exactly "/about"
* **Dynamic segments** : `/:userId` - Matches any value like "/42" or "/john"
* **Optional segments** : `/products/:category?` - The trailing `?` makes the parameter optional
* **Splat/catch-all** : `/docs/*` - Matches anything after "/docs/" like "/docs/intro" or "/docs/api/v1"

## Navigation Programmatically

Sometimes you need to navigate programmatically rather than through links (for example, after a form submission):

```jsx
// Example of programmatic navigation
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Send login request to server
      const response = await loginUser(formData);
    
      if (response.success) {
        // Navigate to dashboard after successful login
        navigate('/dashboard');
      
        // You can also pass state to the destination
        // navigate('/dashboard', { state: { from: 'login', user: response.user } });
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  // Form UI and handlers
  // ...
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit">Login</button>
    </form>
  );
}
```

The `useNavigate` hook returns a function that lets you navigate programmatically. It can:

* Accept a path string (`navigate('/dashboard')`)
* Move backward/forward in history (`navigate(-1)` is like clicking the browser's back button)
* Accept an options object for additional capabilities (`{ replace: true }` will replace the current history entry rather than add to it)

## Route Protection and Authentication

A common need is protecting routes that should only be accessible to authenticated users:

```jsx
// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Your auth context

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    // Redirect to login if not authenticated
    // Save the attempted location for redirection after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // User is authenticated, render the protected content
  return children;
}

export default ProtectedRoute;
```

Then use it in your routes:

```jsx
// App.jsx with protected routes
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
```

In the Login component, you can then redirect back to where the user was trying to go:

```jsx
// Simplified Login.jsx with redirect after login
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the page the user was trying to visit
  const from = location.state?.from?.pathname || "/dashboard";
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Authentication logic
  
    const success = await login(/* credentials */);
    if (success) {
      // Redirect to the page they were trying to visit
      navigate(from, { replace: true });
    }
  };
  
  // Login form
  // ...
}
```

## Router Configuration with Data Loading

React Router v6.4+ introduced new features for data loading using loaders. This approach moves data fetching from components to the router configuration:

```jsx
// routes.js
import { createBrowserRouter } from 'react-router-dom';
import Root from './layouts/Root';
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/HomePage';
import ProductsPage, { loader as productsLoader } from './pages/ProductsPage';
import ProductDetailsPage, { 
  loader as productDetailsLoader 
} from './pages/ProductDetailsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { 
        path: 'products',
        element: <ProductsPage />,
        loader: productsLoader,
        children: [
          {
            path: ':productId',
            element: <ProductDetailsPage />,
            loader: productDetailsLoader
          }
        ]
      }
    ]
  }
]);
```

Then in your main file:

```jsx
// main.jsx or index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

The loader functions in your components would look like this:

```jsx
// ProductsPage.jsx
import { useLoaderData } from 'react-router-dom';

// This function runs before the component renders
export async function loader() {
  const response = await fetch('/api/products');
  
  if (!response.ok) {
    throw new Response('Failed to load products', {
      status: response.status,
      statusText: response.statusText
    });
  }
  
  return response.json();
}

export default function ProductsPage() {
  // Access the data returned by the loader
  const products = useLoaderData();
  
  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <Link to={`${product.id}`}>{product.name}</Link>
          </li>
        ))}
      </ul>
      <Outlet />
    </div>
  );
}
```

This data loading approach offers several benefits:

1. Data is loaded before the component renders, avoiding loading states
2. Errors can be caught and handled at the router level
3. The fetch requests are clearly separated from the rendering code

## Query Parameters

Query parameters are another important aspect of routing. They're useful for filters, search terms, pagination, etc.

```jsx
// Using search params
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get current values (or defaults)
  const category = searchParams.get('category') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  
  // Example of updating search params
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSearchParams(prev => {
      // Create a new URLSearchParams object
      const newParams = new URLSearchParams(prev);
      // Update the category parameter
      newParams.set('category', newCategory);
      // Reset page when changing categories
      newParams.set('page', '1');
      return newParams;
    });
  };
  
  const handleNextPage = () => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', (page + 1).toString());
      return newParams;
    });
  };
  
  // Use these values for filtering/paginating your data
  // ...
  
  return (
    <div>
      <div className="filters">
        <select value={category} onChange={handleCategoryChange}>
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
          {/* More options */}
        </select>
      </div>
    
      {/* Product list rendering */}
    
      <div className="pagination">
        <button 
          disabled={page === 1} 
          onClick={() => setSearchParams({ ...searchParams, page: page - 1 })}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={handleNextPage}>Next</button>
      </div>
    </div>
  );
}
```

## Handling 404s and Errors

React Router gives you control over what happens when routes don't match or when errors occur:

```jsx
// App.jsx with error handling
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/products/*" 
        element={
          <ErrorBoundary fallback={<p>Something went wrong with products!</p>}>
            <Products />
          </ErrorBoundary>
        } 
      />
      {/* Catch-all route for 404s */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

With the Data Router API, error handling becomes more elegant:

```jsx
// routes.js with error elements
import { createBrowserRouter } from 'react-router-dom';
import Root from './layouts/Root';
import ErrorPage from './pages/ErrorPage';
import ProductsPage, { 
  loader as productsLoader,
  ErrorBoundary as ProductsError 
} from './pages/ProductsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />, // Global error fallback
    children: [
      { index: true, element: <HomePage /> },
      { 
        path: 'products',
        element: <ProductsPage />,
        loader: productsLoader,
        errorElement: <ProductsError /> // Specific error handling for this route
      }
    ]
  }
]);
```

## Lazy Loading Routes

For larger applications, you might want to split your code into chunks that are loaded only when needed. React's `lazy` and `Suspense` features work well with React Router:

```jsx
// App.jsx with lazy loading
import { Routes, Route, Suspense } from 'react-router-dom';
import { lazy } from 'react';

// Eagerly loaded components
import Home from './pages/Home';
import Loading from './components/Loading';

// Lazily loaded components
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    
      {/* Lazily loaded routes */}
      <Route 
        path="/about" 
        element={
          <Suspense fallback={<Loading />}>
            <About />
          </Suspense>
        } 
      />
      <Route 
        path="/products/*" 
        element={
          <Suspense fallback={<Loading />}>
            <Products />
          </Suspense>
        } 
      />
      <Route 
        path="/contact" 
        element={
          <Suspense fallback={<Loading />}>
            <Contact />
          </Suspense>
        } 
      />
    </Routes>
  );
}
```

With the Data Router API:

```jsx
// routes.js with lazy loading
import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loading from './components/Loading';

// Eagerly loaded components
import Root from './layouts/Root';
import ErrorPage from './pages/ErrorPage';
import HomePage from './pages/HomePage';

// Lazily loaded components
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));

const lazyLoad = (Component) => {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { 
        path: 'about',
        element: lazyLoad(AboutPage)
      },
      { 
        path: 'products',
        element: lazyLoad(ProductsPage),
        // Loader can still be included
        loader: () => import('./pages/ProductsPage').then(module => module.loader())
      }
    ]
  }
]);
```

## Memory Router for Testing

When testing React Router components, you often want to control the routing environment. React Router provides a `MemoryRouter` for this purpose:

```jsx
// Example test for a component that uses routing
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders product page when navigating to /products', () => {
  render(
    <MemoryRouter initialEntries={['/products']}>
      <App />
    </MemoryRouter>
  );
  
  // Now you can make assertions about what should be on the products page
  expect(screen.getByText(/our products/i)).toBeInTheDocument();
});
```

## Hash Router for Static Hosting

If you're deploying your app on a static file server that doesn't support URL rewriting, you can use HashRouter instead of BrowserRouter:

```jsx
// index.js with HashRouter
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
```

HashRouter uses URL hashes (`example.com/#/about` instead of `example.com/about`), which don't require server configuration but aren't as clean as regular URLs.

## Summary

> React Router transforms React from a library for building user interfaces into a complete solution for building full web applications. It provides the navigation layer that connects your components to URLs, creating a seamless single-page application experience while maintaining the mental model of traditional websites.

We've covered:

1. **Core Concepts** : Understanding client-side routing and its benefits
2. **Basic Setup** : Implementing BrowserRouter, Routes, and Links
3. **Navigation** : Using Link and NavLink for declarative navigation
4. **Advanced Routing** : Nested routes, dynamic parameters, and programmatic navigation
5. **Data and Authentication** : Loading data with the router and protecting routes
6. **Optimization** : Lazy loading routes for better performance
7. **Testing and Deployment** : Using specialized routers for different environments

With this knowledge, you should be well-equipped to implement routing in your React applications, from simple navigation to complex, nested UIs with protected routes and optimized loading.
