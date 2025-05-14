# Understanding `useDebugValue` in React Custom Hooks

When building applications with React, we often create custom hooks to share logic across components. However, debugging these hooks can be challenging without proper tooling. This is where `useDebugValue` comes in—a React Hook specifically designed to enhance the debugging experience of custom hooks.

## What is `useDebugValue`?

`useDebugValue` is a React Hook that lets you display a label for custom hooks in React DevTools. It helps developers understand the state and behavior of custom hooks during development and debugging sessions.

> "The useDebugValue Hook allows you to display a label for custom hooks in React DevTools. Think of it as adding a name tag to your custom hook's values so you can quickly identify what's happening when inspecting your application."

## First Principles of `useDebugValue`

To understand `useDebugValue` properly, let's break it down from first principles:

1. **Visibility** : In React development, understanding what's happening inside hooks is crucial for debugging.
2. **Encapsulation** : Custom hooks encapsulate logic, making it harder to inspect their internal state.
3. **Developer Experience** : Good debugging tools improve the developer experience and productivity.
4. **Performance Considerations** : Debugging tools should not impact production performance.

## Basic Syntax and Usage

The most basic use of `useDebugValue` looks like this:

```jsx
import { useState, useDebugValue } from 'react';

function useCustomHook(initialValue) {
  const [value, setValue] = useState(initialValue);
  
  // Add a debug label
  useDebugValue(value);
  
  return [value, setValue];
}
```

When this hook is used in a component and you inspect it with React DevTools, you'll see the value displayed next to the hook name.

## Practical Examples

Let's explore some practical examples to understand how `useDebugValue` can be used effectively.

### Example 1: Simple Online Status Hook

```jsx
import { useState, useEffect, useDebugValue } from 'react';

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    // Set up event listeners for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
  
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Add a descriptive debug value
  useDebugValue(isOnline ? 'Online' : 'Offline');
  
  return isOnline;
}
```

In this example, instead of just showing `true` or `false` in DevTools, we display a more descriptive "Online" or "Offline" label, making it immediately clear what the hook's status means.

### Example 2: Form Input Hook with Validation

```jsx
import { useState, useDebugValue } from 'react';

function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue);
  const [isPristine, setIsPristine] = useState(true);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsPristine(false);
  
    // Basic validation
    if (newValue.trim() === '') {
      setError('This field cannot be empty');
    } else {
      setError(null);
    }
  };
  
  // Show comprehensive debug info
  useDebugValue({
    value,
    isPristine,
    hasError: error !== null,
    errorMessage: error
  });
  
  return {
    value,
    error,
    isPristine,
    inputProps: {
      value,
      onChange: handleChange
    }
  };
}
```

Here, we're passing an object to `useDebugValue` that shows multiple properties of our form input state, giving a comprehensive view of the hook's internal state.

## Advanced Usage: Formatting Debug Values

For more complex values, `useDebugValue` accepts a formatting function as its second argument. This function is only called when the DevTools are open, which helps with performance:

```jsx
import { useState, useDebugValue } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  
  // Format the debug value
  useDebugValue(storedValue, (value) => {
    // This function is only called when DevTools inspect the hook
    if (typeof value === 'object' && value !== null) {
      return `${key}: ${Object.keys(value).length} properties`;
    }
    return `${key}: ${String(value)}`;
  });
  
  return [storedValue, setValue];
}
```

In this example, we're using a formatting function to provide a more concise representation of our stored value, especially helpful when the value is a complex object.

## Performance Considerations

> "Performance optimization in React is about delaying work until it's absolutely necessary."

The formatting function in `useDebugValue` employs this principle. It's only called when the DevTools are open and inspecting the hook, preventing unnecessary computation during normal rendering.

```jsx
useDebugValue(complexObject, (obj) => {
  // This expensive computation only runs when DevTools are open
  return computeExpensiveFormattedValue(obj);
});
```

## When to Use `useDebugValue`

Not every custom hook needs `useDebugValue`. Here are some guidelines on when it's most beneficial:

1. **Library Hooks** : If you're building a library of hooks for others to use, `useDebugValue` can greatly enhance the debugging experience.
2. **Complex State Logic** : Hooks with intricate state management or multiple interdependent states benefit from clear debug labels.
3. **Shared Hooks** : Custom hooks used across multiple components in your application.
4. **Asynchronous Hooks** : Hooks dealing with async operations, where seeing the loading/error/success states is helpful.

## Example: Custom Hook with Multiple States

```jsx
import { useState, useEffect, useDebugValue } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
  
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
      
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      
        const result = await response.json();
      
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
  
    fetchData();
  
    return () => {
      isMounted = false;
    };
  }, [url]);
  
  // Show request status in DevTools
  useDebugValue(
    { loading, error, dataReceived: data !== null },
    (state) => {
      if (state.loading) return `Loading: ${url}`;
      if (state.error) return `Error: ${state.error}`;
      return `Success: ${url} (${typeof data === 'object' ? Object.keys(data).length : 1} items)`;
    }
  );
  
  return { data, loading, error };
}
```

This example shows how `useDebugValue` can provide meaningful information about an asynchronous operation, showing the current state, URL being fetched, and some information about the received data.

## Integrating with React DevTools

To actually see the debug values, you need to use React DevTools browser extension. When you have it installed:

1. Open your browser's developer tools
2. Navigate to the "Components" tab (in React DevTools)
3. Select a component that uses your custom hook
4. Look for your hook in the hooks list
5. The debug value will appear next to the hook name

## Real-World Scenario: Theme Hook

Let's see a more complete example with a theme hook that might be used throughout an application:

```jsx
import { useState, useEffect, useDebugValue, useContext, createContext } from 'react';

// Create a context for the theme
const ThemeContext = createContext(null);

// Provider component
export function ThemeProvider({ children, initialTheme = 'light' }) {
  const [theme, setTheme] = useState(() => {
    // Try to get theme from localStorage
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || initialTheme;
  });
  
  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    // Also update body class for global styles
    document.body.className = `theme-${theme}`;
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };
  
  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  // Add debug value with styling to match the theme
  useDebugValue(
    context.theme,
    (theme) => {
      const styles = {
        light: 'color: #333; background: #fff',
        dark: 'color: #fff; background: #333'
      };
    
      return {
        value: `Theme: ${theme}`,
        style: styles[theme]
      };
    }
  );
  
  return context;
}
```

In a real React application, you might use this hook like:

```jsx
function Header() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className={`header header-${theme}`}>
      <h1>My App</h1>
      <button onClick={toggleTheme}>
        {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      </button>
    </header>
  );
}
```

## Limitations and Best Practices

While `useDebugValue` is helpful, it has some limitations:

1. **DevTools Only** : The debug values are only visible in React DevTools, not in the actual rendered output or console logs.
2. **Simple Representations** : For complex objects, you should format the output to be easily scannable.
3. **Don't Overuse** : Adding debug values to every hook makes DevTools cluttered. Use it for hooks where the extra context is actually helpful.
4. **Not for Component State** : It's designed for custom hooks, not for debugging component state directly.

## Best Practices:

* Use descriptive labels that help understand the hook's state at a glance
* Format complex values for better readability
* Use conditional labels to show the most relevant information based on hook state
* Add debug values for public hooks in libraries

## Conclusion

`useDebugValue` is a simple but powerful tool in React's hooks ecosystem that significantly improves the debugging experience for custom hooks. By providing meaningful labels and formatted values, it helps developers understand the internal state and behavior of their hooks during development.

Remember, good debugging practices are as important as the code itself. Using `useDebugValue` appropriately helps create more maintainable and debuggable React applications.

Would you like me to explain any particular aspect of `useDebugValue` in more detail?
