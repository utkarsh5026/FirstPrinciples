# React Hooks: Philosophy and Rules

React Hooks represent one of the most significant paradigm shifts in React's history. To understand them properly, let's start from absolute first principles and build our understanding step by step.

## Understanding the Problem: State Management Before Hooks

Before we can appreciate hooks, we need to understand the problems they were designed to solve.

> In the early days of React, components were divided into two categories: class components and functional components. Class components could manage state and lifecycle, while functional components were limited to accepting props and returning JSX.

When React was first introduced, components that needed to maintain state or implement lifecycle methods had to be written as classes:

```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.increment = this.increment.bind(this);
  }

  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  componentDidMount() {
    document.title = `Count: ${this.state.count}`;
  }
  
  componentDidUpdate() {
    document.title = `Count: ${this.state.count}`;
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    );
  }
}
```

This approach had several drawbacks:

1. **Complexity** - Classes introduced concepts like `this`, binding methods, and constructor functions
2. **Code duplication** - Logic often needed to be repeated in multiple lifecycle methods
3. **Logic fragmentation** - Related code was split across different lifecycle methods
4. **Difficulty reusing stateful logic** - Patterns like Higher-Order Components and render props became increasingly complex

## The Philosophical Shift: Thinking in Hooks

> Hooks were created with a philosophy centered on composition, simplicity, and direct expression of intent rather than working around framework constraints.

The core philosophical principles behind React Hooks include:

### 1. Composition Over Inheritance

React has always favored composition over inheritance, but class components made this harder. Hooks take this philosophy further by making it easier to extract and share stateful logic between components without complex patterns.

### 2. Functions Over Classes

JavaScript functions are simpler than classes. They don't have `this` binding issues, are easier to understand, and align better with React's declarative nature.

### 3. Single Responsibility

Each hook should do one thing well, and complex behaviors should be built by combining simple hooks.

### 4. Declarative Logic

Logic should be expressed directly in terms of what we want to happen, not how to make it happen through imperative lifecycle methods.

## Core React Hooks

Let's examine the fundamental hooks by comparing them to the class component paradigm:

### useState: Simple State Management

The most basic hook lets functional components maintain state:

```jsx
import React, { useState } from 'react';

function Counter() {
  // Declare a state variable 'count' initialized to 0
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

What's happening here:

* `useState(0)` creates a state variable initialized to 0
* It returns an array with two elements: the current state value and a function to update it
* We use array destructuring to name these elements `count` and `setCount`
* When `setCount` is called, React re-renders the component with the new state value

### useEffect: Lifecycle and Side Effects

The `useEffect` hook lets you perform side effects in functional components:

```jsx
import React, { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  // This effect runs after every render
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `Count: ${count}`;
  
    // Optional cleanup function
    return () => {
      document.title = 'React App';
    };
  }, [count]); // Only re-run if count changes
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

What's happening here:

* The first argument to `useEffect` is a function that contains the effect code
* This function can optionally return a cleanup function
* The second argument is an array of dependencies - values that, when changed, trigger the effect to run again
* With `[count]`, the effect only runs when `count` changes
* With `[]` (empty array), the effect only runs once after the initial render
* With no second argument, the effect runs after every render

## The Rules of Hooks

To maintain the integrity of React's state management, hooks come with two essential rules:

> **1. Only Call Hooks at the Top Level**
>
> Don't call hooks inside loops, conditions, or nested functions.

> **2. Only Call Hooks from React Functions**
>
> Call hooks from React function components or custom hooks, not regular JavaScript functions.

Let's understand why these rules exist:

### Rule 1: Only Call Hooks at the Top Level

React relies on the order of hook calls to maintain state between renders. Consider this code:

```jsx
// 🚫 BAD: Hooks in conditional statements
function Counter() {
  const [count, setCount] = useState(0);
  
  if (count > 5) {
    // This hook won't be called on every render
    // breaking React's ability to preserve state correctly
    const [message, setMessage] = useState("High count!");
  }
  
  return (/* ... */);
}
```

If the condition changes between renders, the order of hook calls changes. React wouldn't know which state corresponds to which `useState` call.

Instead, move the condition inside the hooks:

```jsx
// ✅ GOOD: Condition inside the component
function Counter() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState("");
  
  // Effect runs on every render, but we control what happens inside
  useEffect(() => {
    if (count > 5) {
      setMessage("High count!");
    } else {
      setMessage("");
    }
  }, [count]);
  
  return (/* ... */);
}
```

### Rule 2: Only Call Hooks from React Functions

Hooks are designed to work within React's rendering cycle. Calling them elsewhere breaks this expectation:

```jsx
// 🚫 BAD: Hook in a regular function
function updateDocumentTitle(title) {
  // This won't work because it's outside React's rendering cycle
  useEffect(() => {
    document.title = title;
  }, [title]);
}

function MyComponent() {
  updateDocumentTitle("My Page"); // ❌ Will cause errors
  return <div>My Component</div>;
}
```

Instead, use custom hooks:

```jsx
// ✅ GOOD: Custom hook
function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

function MyComponent() {
  useDocumentTitle("My Page"); // ✓ Works correctly
  return <div>My Component</div>;
}
```

## Building Custom Hooks

One of the most powerful aspects of hooks is the ability to create custom hooks - reusable pieces of stateful logic.

Let's create a custom hook for window size tracking:

```jsx
function useWindowSize() {
  // State to store window dimensions
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Effect to handle window resize
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  
    // Add event listener
    window.addEventListener('resize', handleResize);
  
    // Call handler right away so state gets updated with initial window size
    handleResize();
  
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array means this effect runs once on mount
  
  return windowSize;
}
```

Now we can use this hook in any component:

```jsx
function ResponsiveComponent() {
  const size = useWindowSize();
  
  return (
    <div>
      <p>Window width: {size.width}px</p>
      <p>Window height: {size.height}px</p>
    </div>
  );
}
```

This demonstrates the power of hooks for logic composition. The window size tracking logic is:

* Encapsulated in a single place
* Reusable across components
* Easy to test in isolation
* Declarative in nature

## Mental Model: Hooks as Synchronization

> Think of hooks not as lifecycle replacements but as a way to synchronize your component with external systems.

React determines when to render, but effects let you synchronize with things outside of React's control:

* `useState` synchronizes component state with React's rendering
* `useEffect` synchronizes side effects with component state and props
* `useContext` synchronizes with context changes
* `useRef` maintains a mutable reference across renders
* `useReducer` synchronizes complex state logic with React's rendering

## Advanced Hook Patterns

Let's explore some more advanced patterns using hooks:

### Data Fetching with useEffect

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Reset state when userId changes
    setLoading(true);
    setError(null);
  
    // Fetch user data
    fetch(`https://api.example.com/users/${userId}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]); // Re-run when userId changes
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

This pattern can be extracted into a custom hook:

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Don't fetch if no URL provided
    if (!url) return;
  
    let isMounted = true;
    setLoading(true);
  
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      })
      .then(data => {
        if (isMounted) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });
    
    // Cleanup function to handle component unmounting
    return () => {
      isMounted = false;
    };
  }, [url]);
  
  return { data, loading, error };
}
```

Now we can simplify our component:

```jsx
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(
    `https://api.example.com/users/${userId}`
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### useReducer for Complex State

For more complex state logic, `useReducer` provides a Redux-like approach:

```jsx
import { useReducer } from 'react';

// Reducer function - pure function that takes state and action, returns new state
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, {
        id: Date.now(),
        text: action.payload,
        completed: false
      }];
    case 'TOGGLE_TODO':
      return state.map(todo => 
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case 'DELETE_TODO':
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
}

function TodoApp() {
  // useReducer takes a reducer function and initial state
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [text, setText] = useState('');
  
  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) return;
    // Dispatch an action to add a todo
    dispatch({ type: 'ADD_TODO', payload: text });
    setText('');
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Add todo"
        />
        <button type="submit">Add</button>
      </form>
    
      <ul>
        {todos.map(todo => (
          <li 
            key={todo.id}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            onClick={() => dispatch({ 
              type: 'TOGGLE_TODO', 
              payload: todo.id 
            })}
          >
            {todo.text}
            <button onClick={() => dispatch({ 
              type: 'DELETE_TODO', 
              payload: todo.id 
            })}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Common Hook Pitfalls and Solutions

### Infinite Re-render Loops

One common issue is creating infinite loops with useEffect:

```jsx
// 🚫 BAD: Creates an infinite loop
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // This runs after every render and triggers another render
    setCount(count + 1);
  }); // No dependency array = runs after every render
  
  return <div>{count}</div>;
}
```

Solution: Always provide a dependency array, and be careful about what goes in it:

```jsx
// ✅ GOOD: Only runs once
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(prevCount => prevCount + 1);
  }, []); // Empty dependency array = only runs once
  
  return <div>{count}</div>;
}
```

### Stale Closures

Functions inside effects "close over" values from the render they were created in:

```jsx
// 🚫 BAD: Uses stale value of count
function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(`Count is: ${count}`);
      setCount(count + 1); // Always uses initial value of count (0)
    }, 1000);
  
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this closure captures count=0
  
  return <div>{count}</div>;
}
```

Solution: Use functional updates or include dependencies:

```jsx
// ✅ GOOD: Uses functional update
function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prevCount => prevCount + 1); // Uses latest state
    }, 1000);
  
    return () => clearInterval(timer);
  }, []); // Empty dependency is fine with functional updates
  
  return <div>{count}</div>;
}
```

### Objects and Arrays as Dependencies

React compares dependencies by reference, not by value:

```jsx
// 🚫 BAD: Creates a new options object on every render
function SearchComponent({ query }) {
  // This object is recreated on every render
  const options = { 
    searchTerm: query,
    sortBy: 'relevance'
  };
  
  useEffect(() => {
    performSearch(options);
    // Effect runs on every render because options is always "new"
  }, [options]);
  
  return <div>Search results for: {query}</div>;
}
```

Solution: Move object creation inside the effect or memoize with useMemo:

```jsx
// ✅ GOOD: Create object inside effect or use primitive dependencies
function SearchComponent({ query }) {
  useEffect(() => {
    const options = { 
      searchTerm: query,
      sortBy: 'relevance'
    };
    performSearch(options);
  }, [query]); // Only depend on the primitive value
  
  return <div>Search results for: {query}</div>;
}

// Alternative with useMemo
function SearchComponent({ query }) {
  // Memoize options object - only recreated when query changes
  const options = useMemo(() => ({ 
    searchTerm: query,
    sortBy: 'relevance'
  }), [query]);
  
  useEffect(() => {
    performSearch(options);
  }, [options]); // Now safe to use options as dependency
  
  return <div>Search results for: {query}</div>;
}
```

## Summary: The Philosophy of Hooks

React Hooks represent a return to React's core philosophical principles:

1. **Declarative** - Express what you want, not how to do it
2. **Composition** - Build complex behavior from simple pieces
3. **Reusability** - Extract and share logic without complex abstractions
4. **Synchronization** - Keep your UI in sync with external systems
5. **Single responsibility** - Each hook does one thing well

The rules of hooks ensure the stability of React's internal mechanisms, and following them leads to more maintainable, understandable code. By thinking in terms of synchronization rather than lifecycle, hooks encourage more intuitive component design that more directly expresses developer intent.

React hooks encourage us to think about our components as a collection of independent, reusable behaviors rather than complex entangled lifecycle events. They empower function components to do everything class components could do and more, but with greater simplicity and flexibility.
