# React Custom Hooks: Creation Patterns from First Principles

Custom hooks represent one of the most powerful patterns in React development, allowing you to extract, reuse, and share stateful logic across components. Let's explore custom hooks from the ground up, starting with their conceptual foundations and building toward sophisticated implementation patterns.

## First Principles: What Is a Hook?

At its most fundamental level, a hook in React is a special function that allows you to "hook into" React features like state and lifecycle methods in functional components.

> A hook is simply a JavaScript function that starts with the word "use" and may call other hooks.

This naming convention isn't just stylistic—it's essential for React's internal mechanisms to identify your functions as hooks and apply special rules to them.

### The Rules of Hooks

Before diving into custom hooks, we must understand the two cardinal rules that govern all hooks:

1. Only call hooks at the top level of your function components or custom hooks.
2. Only call hooks from React function components or other custom hooks.

These rules ensure that hooks maintain their state between renders and that all stateful logic is properly initialized and cleaned up.

## Building Our First Custom Hook

Let's start with something simple. Imagine we want to track whether a user has scrolled past a certain point on a page:

```jsx
// Without a custom hook
function ScrollAwareComponent() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className={isScrolled ? 'scrolled' : ''}>
      Content changes based on scroll position
    </div>
  );
}
```

This works, but what if we need this logic in multiple components? Let's extract it into a custom hook:

```jsx
// Our first custom hook
function useScrollPosition(threshold = 100) {
  // State to track whether user has scrolled past threshold
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    // Function to check scroll position
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > threshold);
    };
  
    // Set up event listener
    window.addEventListener('scroll', handleScroll);
  
    // Initial check
    handleScroll();
  
    // Clean up event listener on unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]); // Re-run if threshold changes
  
  return isScrolled;
}
```

Now, our component becomes much simpler:

```jsx
function ScrollAwareComponent() {
  const isScrolled = useScrollPosition(100);
  
  return (
    <div className={isScrolled ? 'scrolled' : ''}>
      Content changes based on scroll position
    </div>
  );
}
```

## Core Pattern: Encapsulating Stateful Logic

The fundamental pattern of custom hooks is encapsulation. We take related pieces of stateful logic and package them together in a way that:

1. Isolates implementation details
2. Exposes a clear interface
3. Makes the logic reusable

Let's explore another example with form handling:

```jsx
// A form hook to manage input values and validation
function useFormInput(initialValue = '', validator = () => true) {
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  
  // Validate input when value changes
  useEffect(() => {
    if (touched) {
      const validationResult = validator(value);
      if (validationResult === true) {
        setError('');
      } else {
        setError(validationResult || 'Invalid input');
      }
    }
  }, [value, validator, touched]);
  
  // Functions to handle events
  const handleChange = (e) => {
    setValue(e.target.value);
  };
  
  const handleBlur = () => {
    setTouched(true);
  };
  
  return {
    value,
    setValue,
    error,
    touched,
    handleChange,
    handleBlur,
    inputProps: {
      value,
      onChange: handleChange,
      onBlur: handleBlur
    }
  };
}
```

Now a form component can be much cleaner:

```jsx
function SignupForm() {
  const email = useFormInput('', value => {
    if (!value.includes('@')) return 'Please enter a valid email';
    return true;
  });
  
  const password = useFormInput('', value => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    return true;
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.error && !password.error) {
      console.log('Form submitted', { email: email.value, password: password.value });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input type="email" {...email.inputProps} />
        {email.touched && email.error && <span>{email.error}</span>}
      </div>
    
      <div>
        <label>Password:</label>
        <input type="password" {...password.inputProps} />
        {password.touched && password.error && <span>{password.error}</span>}
      </div>
    
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

## Advanced Patterns for Custom Hooks

Now that we understand the basics, let's explore more sophisticated patterns.

### Pattern 1: Composition of Hooks

Custom hooks can call other hooks, allowing for powerful compositions:

```jsx
// A hook for managing async operations
function useAsync(asyncFunction) {
  const [state, setState] = useState({
    status: 'idle',  // idle, pending, success, error
    data: null,
    error: null
  });
  
  const execute = useCallback(async (...args) => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const data = await asyncFunction(...args);
      setState({ status: 'success', data, error: null });
      return data;
    } catch (error) {
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, [asyncFunction]);
  
  return { ...state, execute };
}

// A hook that uses useAsync to fetch data
function useFetch(url, options) {
  const asyncFunction = useCallback(() => {
    return fetch(url, options).then(res => {
      if (!res.ok) throw new Error(res.statusText);
      return res.json();
    });
  }, [url, options]);
  
  const state = useAsync(asyncFunction);
  
  useEffect(() => {
    if (url) {
      state.execute();
    }
  }, [url, state.execute]);
  
  return state;
}
```

Usage example:

```jsx
function UserProfile({ userId }) {
  const { status, data: user, error } = useFetch(`/api/users/${userId}`);
  
  if (status === 'pending') return <div>Loading...</div>;
  if (status === 'error') return <div>Error: {error.message}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### Pattern 2: Hook Factory Functions

Sometimes we want to generate hooks with specific configurations:

```jsx
// A factory function that creates a hook
function createPersistedStateHook(storageKey, storage = localStorage) {
  return function usePersistedState(initialState) {
    // Get stored value from storage if available
    const getStoredValue = () => {
      try {
        const item = storage.getItem(storageKey);
        return item ? JSON.parse(item) : initialState;
      } catch (error) {
        console.error('Error reading from storage:', error);
        return initialState;
      }
    };
  
    // Initialize state with stored or initial value
    const [state, setState] = useState(getStoredValue);
  
    // Update storage when state changes
    useEffect(() => {
      try {
        storage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error('Error writing to storage:', error);
      }
    }, [state]);
  
    return [state, setState];
  };
}
```

Now we can create specific hooks for different storage needs:

```jsx
const useUserSettings = createPersistedStateHook('user_settings');
const useThemePreference = createPersistedStateHook('theme_preference');

function App() {
  const [settings, setSettings] = useUserSettings({ notifications: true });
  const [theme, setTheme] = useThemePreference('light');
  
  return (
    <div className={`app ${theme}`}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <label>
        <input 
          type="checkbox" 
          checked={settings.notifications}
          onChange={() => setSettings({
            ...settings,
            notifications: !settings.notifications
          })}
        />
        Enable Notifications
      </label>
    </div>
  );
}
```

### Pattern 3: Reducer Pattern for Complex State

For more complex state logic, combining custom hooks with useReducer can be powerful:

```jsx
// A hook that manages shopping cart state
function useShoppingCart() {
  // Define actions
  const ADD_ITEM = 'ADD_ITEM';
  const REMOVE_ITEM = 'REMOVE_ITEM';
  const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
  const CLEAR_CART = 'CLEAR_CART';
  
  // Define reducer
  const cartReducer = (state, action) => {
    switch (action.type) {
      case ADD_ITEM: {
        const { item } = action.payload;
        const existingItem = state.items.find(i => i.id === item.id);
      
        if (existingItem) {
          // Increment quantity if item exists
          return {
            ...state,
            items: state.items.map(i => 
              i.id === item.id 
                ? { ...i, quantity: i.quantity + 1 } 
                : i
            )
          };
        } else {
          // Add new item with quantity 1
          return {
            ...state,
            items: [...state.items, { ...item, quantity: 1 }]
          };
        }
      }
    
      case REMOVE_ITEM: {
        const { itemId } = action.payload;
        return {
          ...state,
          items: state.items.filter(i => i.id !== itemId)
        };
      }
    
      case UPDATE_QUANTITY: {
        const { itemId, quantity } = action.payload;
        if (quantity <= 0) {
          // Remove item if quantity becomes zero or negative
          return {
            ...state,
            items: state.items.filter(i => i.id !== itemId)
          };
        }
      
        return {
          ...state,
          items: state.items.map(i =>
            i.id === itemId ? { ...i, quantity } : i
          )
        };
      }
    
      case CLEAR_CART:
        return {
          ...state,
          items: []
        };
      
      default:
        return state;
    }
  };
  
  // Initialize state with useReducer
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });
  
  // Calculate derived values
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );
  
  // Define action dispatchers
  const addItem = (item) => {
    dispatch({ type: ADD_ITEM, payload: { item } });
  };
  
  const removeItem = (itemId) => {
    dispatch({ type: REMOVE_ITEM, payload: { itemId } });
  };
  
  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: UPDATE_QUANTITY, payload: { itemId, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: CLEAR_CART });
  };
  
  return {
    cart,
    itemCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
}
```

Usage example:

```jsx
function ShoppingCartPage() {
  const { 
    cart, 
    itemCount,
    totalPrice, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart 
  } = useShoppingCart();
  
  return (
    <div>
      <h1>Your Cart ({itemCount} items)</h1>
    
      {cart.items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {cart.items.map(item => (
              <li key={item.id}>
                <div>{item.name} - ${item.price}</div>
                <div>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    +
                  </button>
                  <button onClick={() => removeItem(item.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        
          <div>Total: ${totalPrice.toFixed(2)}</div>
          <button onClick={clearCart}>Clear Cart</button>
          <button>Checkout</button>
        </>
      )}
    </div>
  );
}
```

### Pattern 4: Context + Hooks for Global State

For global state that needs to be accessed by many components, we can combine the Context API with custom hooks:

```jsx
// First, create a context
const ThemeContext = createContext();

// Create a provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };
  
  // Expose theme state and functions via context
  const value = {
    theme,
    setTheme,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Create a custom hook to access the theme context
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

Now any component can easily access and modify the theme:

```jsx
function ThemedButton() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      style={{
        backgroundColor: theme === 'light' ? '#ffffff' : '#333333',
        color: theme === 'light' ? '#333333' : '#ffffff',
      }}
    >
      Toggle Theme
    </button>
  );
}

// Wrap your app with the provider
function App() {
  return (
    <ThemeProvider>
      <div>
        <h1>My App</h1>
        <ThemedButton />
      </div>
    </ThemeProvider>
  );
}
```

## Best Practices for Custom Hooks

Let's summarize some essential best practices when creating custom hooks:

### 1. Naming Convention

> Always start your custom hook names with "use" to follow React's convention and ensure the Rules of Hooks are enforced.

Examples: `useFormInput`, `useWindowSize`, `useLocalStorage`

### 2. Keep Hooks Focused

Each custom hook should have a single responsibility. If a hook is doing too many things, consider breaking it into multiple hooks that can be composed together.

### 3. Return Consistent Values

The shape of what a hook returns should be consistent across renders to avoid confusing the component using it:

```jsx
// Good - always returns an object with the same properties
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

// Usage
function Counter() {
  const { count, increment, decrement, reset } = useCounter(10);
  // ...
}
```

### 4. Provide Sensible Defaults

Make your hooks easier to use by providing default values for parameters:

```jsx
// With sensible defaults
function useLocalStorage(key, initialValue = '') {
  // ...
}
```

### 5. Include Error Handling

Your hooks should handle potential errors gracefully:

```jsx
function useFetch(url) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }
  
    let isMounted = true;
  
    setState({ data: null, loading: true, error: null });
  
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch(error => {
        if (isMounted) {
          setState({ data: null, loading: false, error });
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, [url]);
  
  return state;
}
```

### 6. Document Your Hooks

Good documentation makes your hooks more usable:

```jsx
/**
 * Hook for managing form input state with validation
 * 
 * @param {any} initialValue - The initial value of the input
 * @param {Function} validator - A function that takes the current value and returns
 *                              true if valid or an error message if invalid
 * @returns {Object} An object containing:
 *   - value: The current input value
 *   - setValue: Function to update the value
 *   - error: Current validation error (if any)
 *   - touched: Whether the field has been interacted with
 *   - handleChange: Event handler for onChange events
 *   - handleBlur: Event handler for onBlur events
 *   - inputProps: Props object to spread onto an input element
 */
function useFormInput(initialValue = '', validator = () => true) {
  // Implementation...
}
```

## Real-World Example: Combining Multiple Patterns

Let's put together what we've learned with a more complex example—a hook for managing pagination with fetch requests:

```jsx
function usePaginatedFetch(endpoint, itemsPerPage = 10) {
  // State for pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Create the full URL with pagination parameters
  const url = useMemo(() => {
    if (!endpoint) return null;
    const hasParams = endpoint.includes('?');
    return `${endpoint}${hasParams ? '&' : '?'}page=${page}&limit=${itemsPerPage}`;
  }, [endpoint, page, itemsPerPage]);
  
  // Use our fetch hook from earlier
  const { status, data, error } = useFetch(url);
  
  // Update total pages when data changes
  useEffect(() => {
    if (data && data.total) {
      setTotalPages(Math.ceil(data.total / itemsPerPage));
    }
  }, [data, itemsPerPage]);
  
  // Navigation functions
  const goToPage = useCallback((pageNum) => {
    const validatedPage = Math.max(1, Math.min(pageNum, totalPages || 1));
    setPage(validatedPage);
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  }, [page, totalPages]);
  
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  }, [page]);
  
  const firstPage = useCallback(() => {
    setPage(1);
  }, []);
  
  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);
  
  return {
    // Data state
    data: data?.items || [],
    status,
    error,
  
    // Pagination state
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  
    // Navigation functions
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage
  };
}
```

Usage example:

```jsx
function ProductCatalog() {
  const {
    data: products,
    status,
    error,
    page,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage
  } = usePaginatedFetch('/api/products', 12);
  
  if (status === 'pending') {
    return <div>Loading products...</div>;
  }
  
  if (status === 'error') {
    return <div>Error loading products: {error.message}</div>;
  }
  
  return (
    <div>
      <h1>Products (Page {page} of {totalPages})</h1>
    
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
            <button>Add to Cart</button>
          </div>
        ))}
      </div>
    
      <div className="pagination">
        <button 
          onClick={prevPage} 
          disabled={!hasPrevPage}
        >
          Previous
        </button>
      
        {/* Generate page number buttons */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(pageNum => {
            // Show first, last, current, and pages around current
            return pageNum === 1 || 
                   pageNum === totalPages || 
                   Math.abs(pageNum - page) <= 2;
          })
          .map((pageNum, index, array) => {
            // Add ellipsis if there are gaps
            const showEllipsis = index > 0 && pageNum - array[index - 1] > 1;
          
            return (
              <React.Fragment key={pageNum}>
                {showEllipsis && <span>...</span>}
                <button 
                  onClick={() => goToPage(pageNum)}
                  className={pageNum === page ? 'active' : ''}
                >
                  {pageNum}
                </button>
              </React.Fragment>
            );
          })}
      
        <button 
          onClick={nextPage} 
          disabled={!hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

## Testing Custom Hooks

Testing hooks requires special consideration since they can only be called within React function components. Here's how we can test our hooks using the React Testing Library:

```jsx
// Example test for useCounter hook
import { renderHook, act } from '@testing-library/react-hooks';
import { useCounter } from './useCounter';

test('should increment counter', () => {
  // Render the hook in a test environment
  const { result } = renderHook(() => useCounter(0));
  
  // Initial value should be 0
  expect(result.current.count).toBe(0);
  
  // Act on the result (increment)
  act(() => {
    result.current.increment();
  });
  
  // After increment, value should be 1
  expect(result.current.count).toBe(1);
});

test('should handle custom initial value', () => {
  const { result } = renderHook(() => useCounter(10));
  expect(result.current.count).toBe(10);
});

test('should reset counter to initial value', () => {
  const { result } = renderHook(() => useCounter(5));
  
  act(() => {
    result.current.increment();
    result.current.increment();
  });
  
  expect(result.current.count).toBe(7);
  
  act(() => {
    result.current.reset();
  });
  
  expect(result.current.count).toBe(5);
});
```

## Conclusion

Custom hooks represent one of the most elegant patterns in React. From first principles, we've seen how they:

1. **Encapsulate related stateful logic** into reusable units
2. **Compose together** to create more complex behavior
3. **Abstract implementation details** and provide clean interfaces
4. **Enable sharing** of non-visual logic across components

By mastering custom hook patterns, you'll write more maintainable and reusable React code. The patterns we've explored—encapsulation, composition, hook factories, reducer integration, and context coupling—form a toolkit for solving a wide variety of React state management and side-effect challenges.

The next time you notice duplicate stateful logic across components, remember: it might be time for a custom hook!
