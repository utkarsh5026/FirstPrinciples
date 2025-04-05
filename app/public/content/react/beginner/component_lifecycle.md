# React Component Lifecycle with Functional Components

React components go through a series of phases during their existence: mounting (birth), updating (growth), and unmounting (death). While class components have explicit lifecycle methods, functional components manage these phases through hooks. Let's explore each phase in depth.

## Mounting Phase

The mounting phase occurs when a component is created and inserted into the DOM for the first time. In functional components, this phase is primarily handled by the initial render and the `useEffect` hook.

### 1. Initial Render

When a functional component mounts, React executes the component function to generate the initial UI.

```jsx
function Welcome() {
  console.log("Component function executed - initial render");
  return <h1>Hello, world!</h1>;
}
```

During this initial execution, React:

* Evaluates all your code
* Initializes state values with `useState`
* Prepares to run effects
* Returns JSX for rendering

### 2. Initial State Setup

State initialization happens during this first render:

```jsx
function Counter() {
  // This runs during mounting
  const [count, setCount] = useState(0);
  console.log("State initialized with:", count);
  
  return <div>{count}</div>;
}
```

If your initial state requires expensive calculations, you can use lazy initialization:

```jsx
function UserProfile() {
  // This function only runs once during mounting
  const [userData, setUserData] = useState(() => {
    console.log("Computing initial state - runs only during mount");
    return computeExpensiveInitialState();
  });
  
  return <div>{userData.name}</div>;
}
```

### 3. Running Effects (componentDidMount equivalent)

After the component is mounted to the DOM, React runs effects with an empty dependency array:

```jsx
function DataFetcher() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    console.log("Component mounted - similar to componentDidMount");
  
    // Fetch data after component mounts
    fetchData().then(result => {
      setData(result);
    });
  
    // Optional cleanup function (runs on unmount)
    return () => {
      console.log("Cleanup function defined during mount");
    };
  }, []); // Empty dependency array means "run only on mount"
  
  return <div>{data ? JSON.stringify(data) : "Loading..."}</div>;
}
```

The empty dependency array `[]` tells React to only run this effect after the initial render and not on subsequent renders.

### 4. Refs Initialization

Refs are also created during the mounting phase:

```jsx
function FocusInput() {
  // Ref is created during mounting
  const inputRef = useRef(null);
  
  useEffect(() => {
    // After mount, the ref is attached to the DOM element
    console.log("Ref is now attached to input element");
    inputRef.current.focus(); // Automatically focus the input after mount
  }, []);
  
  return <input ref={inputRef} type="text" />;
}
```

### Mounting Phase Summary

In functional components, the mounting phase consists of:

1. Component function execution (initial render)
2. State initialization via `useState`
3. Effects with `[]` dependency array (after DOM is ready)
4. Refs attachment

## Updating Phase

The updating phase occurs when a component re-renders due to changes in props, state, or context. This can happen many times during a component's life.

### 1. Re-rendering Due to State Changes

When state changes, the component function executes again:

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  console.log("Component rendering with count:", count);
  
  const increment = () => {
    setCount(count + 1); // This triggers a re-render
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

Each time the button is clicked, `setCount` triggers a re-render, executing the component function again with the new state value.

### 2. Re-rendering Due to Prop Changes

Components also re-render when their props change:

```jsx
function DisplayName({ name }) {
  console.log("DisplayName rendering with name:", name);
  return <p>Hello, {name}!</p>;
}

function ParentComponent() {
  const [name, setName] = useState("Alice");
  
  const changeName = () => {
    setName("Bob"); // Causes both ParentComponent and DisplayName to re-render
  };
  
  return (
    <div>
      <DisplayName name={name} />
      <button onClick={changeName}>Change Name</button>
    </div>
  );
}
```

When the button in `ParentComponent` is clicked, both components re-render: the parent due to state change and the child due to the prop change.

### 3. Running Effects on Updates (componentDidUpdate equivalent)

Effects with dependencies run after renders when their dependencies change:

```jsx
function ProfileViewer({ userId }) {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    console.log("Effect running due to userId change:", userId);
  
    // Fetch user profile whenever userId changes
    fetchProfile(userId).then(data => {
      setProfile(data);
    });
  
    // Cleanup for the previous effect run
    return () => {
      console.log("Cleaning up effect for userId:", userId);
      // Cancel any in-progress operations for the previous userId
    };
  }, [userId]); // Run effect when userId changes
  
  return (
    <div>
      {profile ? (
        <div>
          <h2>{profile.name}</h2>
          <p>{profile.bio}</p>
        </div>
      ) : (
        "Loading profile..."
      )}
    </div>
  );
}
```

In this example:

1. The effect runs after the first render (mount)
2. When `userId` changes, React first runs the cleanup function from the previous effect
3. Then it runs the effect function again with the new value

### 4. Using useLayoutEffect for DOM Measurements

If you need to measure the DOM after updates but before painting, use `useLayoutEffect`:

```jsx
function MeasureHeight({ content }) {
  const [height, setHeight] = useState(0);
  const divRef = useRef(null);
  
  // This runs synchronously after DOM mutations but before browser paint
  useLayoutEffect(() => {
    console.log("Measuring DOM after update but before paint");
    if (divRef.current) {
      const newHeight = divRef.current.getBoundingClientRect().height;
      setHeight(newHeight);
    }
  }, [content]); // Run when content changes
  
  return (
    <>
      <div ref={divRef}>{content}</div>
      <p>The content height is: {height}px</p>
    </>
  );
}
```

`useLayoutEffect` functions identically to `useEffect` but runs synchronously after DOM mutations and before the browser paints, making it suitable for DOM measurements that might affect visual updates.

### 5. Preventing Unnecessary Updates with useMemo and useCallback

To optimize performance during updates, you can memoize expensive calculations and callbacks:

```jsx
function ProductList({ products, onProductSelect }) {
  // Memoize expensive calculations - only recalculate when products change
  const sortedProducts = useMemo(() => {
    console.log("Sorting products - only runs when products array changes");
    return [...products].sort((a, b) => a.price - b.price);
  }, [products]);
  
  // Memoize event handler - remains stable across renders
  const handleProductClick = useCallback((productId) => {
    console.log("Product clicked:", productId);
    onProductSelect(productId);
  }, [onProductSelect]);
  
  return (
    <ul>
      {sortedProducts.map(product => (
        <li key={product.id} onClick={() => handleProductClick(product.id)}>
          {product.name} - ${product.price}
        </li>
      ))}
    </ul>
  );
}
```

### 6. Skipping Re-renders with React.memo

You can wrap functional components with `React.memo` to skip re-rendering when props haven't changed:

```jsx
// This component only re-renders when title or content changes
const Article = React.memo(function Article({ title, content }) {
  console.log("Article rendering with title:", title);
  
  return (
    <article>
      <h2>{title}</h2>
      <p>{content}</p>
    </article>
  );
});

function BlogPosts() {
  const [posts, setPosts] = useState([
    { id: 1, title: "React Hooks", content: "Hooks are awesome" },
    { id: 2, title: "Functional Components", content: "Function over class" }
  ]);
  const [counter, setCounter] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCounter(c => c + 1)}>
        Counter: {counter}
      </button>
      {posts.map(post => (
        <Article key={post.id} title={post.title} content={post.content} />
      ))}
    </div>
  );
}
```

In this example, clicking the counter button doesn't cause the `Article` components to re-render because their props haven't changed.

### Updating Phase Summary

The updating phase in functional components includes:

1. Re-rendering when props, state, or context changes
2. Running effects when their dependencies change
3. Measurement and synchronous updates with `useLayoutEffect`
4. Optimization techniques to prevent unnecessary re-renders

## Unmounting Phase

The unmounting phase occurs when a component is removed from the DOM.

### 1. Cleanup Effects (componentWillUnmount equivalent)

The main way to handle unmounting in functional components is through effect cleanup functions:

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    console.log("Timer component mounted, starting interval");
    const intervalId = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  
    // This cleanup function runs when the component unmounts
    return () => {
      console.log("Timer component unmounting, clearing interval");
      clearInterval(intervalId);
    };
  }, []);
  
  return <p>Seconds: {seconds}</p>;
}

// Parent component that controls mounting/unmounting
function TimerContainer() {
  const [showTimer, setShowTimer] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowTimer(!showTimer)}>
        {showTimer ? "Hide Timer" : "Show Timer"}
      </button>
      {showTimer && <Timer />}
    </div>
  );
}
```

When the "Hide Timer" button is clicked, the Timer component is removed from the DOM, and React runs its effect cleanup function to clear the interval.

### 2. Cleanup All Effects

During unmounting, React runs the cleanup functions for all effects in the component:

```jsx
function NetworkStatusTracker() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    console.log("Setting up online status listener");
  
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
  
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  
    return () => {
      console.log("Cleaning up event listeners on unmount");
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    console.log("Setting up activity tracker");
  
    const handleActivity = () => {
      console.log("User activity detected");
    };
  
    document.addEventListener('click', handleActivity);
    document.addEventListener('keypress', handleActivity);
  
    return () => {
      console.log("Cleaning up activity tracker on unmount");
      document.removeEventListener('click', handleActivity);
      document.removeEventListener('keypress', handleActivity);
    };
  }, []);
  
  return <div>You are currently {isOnline ? "online" : "offline"}</div>;
}
```

When this component unmounts, React runs both cleanup functions to remove all event listeners.

### 3. Handling Asynchronous Operations During Unmount

It's important to handle pending asynchronous operations when a component unmounts:

```jsx
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    let isMounted = true; // Flag to track mount status
  
    const fetchResults = async () => {
      try {
        console.log("Fetching results for:", query);
        const data = await fetchSearchResults(query);
      
        // Only update state if component is still mounted
        if (isMounted) {
          setResults(data);
        } else {
          console.log("Component unmounted, ignoring results for:", query);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Search error:", error);
        }
      }
    };
  
    if (query.length > 2) {
      fetchResults();
    }
  
    // Cleanup function sets mounted flag to false
    return () => {
      console.log("Search component unmounting");
      isMounted = false;
    };
  }, [query]);
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

This pattern prevents memory leaks and errors by checking if the component is still mounted before updating state.

### Unmounting Phase Summary

The unmounting phase in functional components involves:

1. Running cleanup functions from `useEffect` hooks
2. Canceling timers and intervals
3. Removing event listeners
4. Preventing state updates from asynchronous operations

## Complete Lifecycle Example

Here's a comprehensive example showing all three lifecycle phases in a functional component:

```jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

function LifecycleDemo({ initialCount, onUnmount }) {
  console.log("1. Component function executing - render phase");
  
  // State initialization (mounting phase)
  const [count, setCount] = useState(initialCount);
  const [width, setWidth] = useState(0);
  
  // Ref initialization (mounting phase)
  const divRef = useRef(null);
  const mountTimeRef = useRef(Date.now());
  
  // componentDidMount equivalent
  useEffect(() => {
    console.log("3. Component did mount effect running");
  
    // Return cleanup function (componentWillUnmount equivalent)
    return () => {
      console.log("7. Component will unmount");
      const lifespanInSeconds = (Date.now() - mountTimeRef.current) / 1000;
      onUnmount(`Component lived for ${lifespanInSeconds} seconds`);
    };
  }, [onUnmount]);
  
  // componentDidUpdate equivalent (runs on specific dependencies)
  useEffect(() => {
    console.log("4. Count value changed effect:", count);
  
    document.title = `Count: ${count}`;
  
    // Cleanup from previous render
    return () => {
      console.log("4a. Cleaning up previous count effect:", count);
    };
  }, [count]); // Only run when count changes
  
  // Effect that runs on every render
  useEffect(() => {
    console.log("5. Effect without dependencies runs after every render");
  });
  
  // useLayoutEffect for DOM measurements before browser paint
  useLayoutEffect(() => {
    console.log("2. Layout effect for DOM measurements");
    if (divRef.current) {
      setWidth(divRef.current.getBoundingClientRect().width);
    }
  }, [count]); // Re-measure when count changes
  
  console.log("Rendering UI with count:", count, "and width:", width);
  
  return (
    <div ref={divRef} style={{ padding: '20px', border: '1px solid gray' }}>
      <p>Count: {count}</p>
      <p>Element width: {width}px</p>
      <p>Component mounted at: {new Date(mountTimeRef.current).toLocaleTimeString()}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(initialCount)}>Reset</button>
    </div>
  );
}

// Parent component to control mount/unmount
function LifecycleContainer() {
  const [showDemo, setShowDemo] = useState(false);
  const [unmountMessage, setUnmountMessage] = useState('');
  
  const handleUnmount = (message) => {
    setUnmountMessage(message);
  };
  
  return (
    <div>
      <button onClick={() => setShowDemo(!showDemo)}>
        {showDemo ? 'Unmount Component' : 'Mount Component'}
      </button>
      {unmountMessage && <p>Last unmount: {unmountMessage}</p>}
      {showDemo && <LifecycleDemo initialCount={0} onUnmount={handleUnmount} />}
    </div>
  );
}
```

The execution sequence in this example will be:

**Mounting:**

1. Component function executes (initial render)
2. `useLayoutEffect` runs for DOM measurements
3. "Component did mount" effect runs

**Updating (when count changes):**

1. Component function executes again
2. `useLayoutEffect` runs for updated DOM measurements
3. Cleanup function runs for the previous count effect
4. Count effect runs with the new value
5. Effect without dependencies runs

**Unmounting:**

1. Effect cleanup functions run in their original order

## Key Differences from Class Components

Functional components with hooks handle lifecycle events differently from class components:

1. **No direct equivalents:** There's no perfect 1:1 mapping between class lifecycle methods and hooks
2. **Effects combine mount/update/unmount:** A single `useEffect` can handle functionality that would be split across `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`
3. **Multiple effects for separation of concerns:** Instead of putting all lifecycle logic in a few methods, you can separate concerns into multiple effects
4. **Dependency arrays for fine-grained control:** Class components run lifecycle methods on any update, but effects can be controlled with dependency arrays

## Best Practices for Lifecycle Management

1. **Keep components focused:** Break large components into smaller ones with clearer lifecycle needs
2. **Use dependency arrays correctly:** Always specify dependencies for effects to avoid infinite loops or stale closures
3. **Clean up properly:** Always return cleanup functions from effects that set up subscriptions, timers, or event listeners
4. **Use appropriate hooks for timing:** Use `useEffect` for most side effects and `useLayoutEffect` only when you need to measure or modify the DOM before painting
5. **Handle asynchronous operations safely:** Check if a component is still mounted before updating state after async operations
6. **Memoize for performance:** Use `useMemo`, `useCallback`, and `React.memo` to optimize rendering performance

## Conclusion

While functional components don't have explicit lifecycle methods, they provide a more flexible and composable way to handle component lifecycle through hooks. By understanding when component functions execute and how to use effects with different dependency patterns, you can fully control the mounting, updating, and unmounting phases of your components.

The functional approach encourages separating concerns into different effects, making code more maintainable by grouping related logic together rather than splitting it across different lifecycle methods.
