# Understanding React Hook Storage in Fiber Nodes: From First Principles

> "To understand how React works is to understand how it thinks about your components."

## Introduction to React Hooks and Fiber

To understand how React stores hooks in Fiber nodes, we need to start with the foundational concepts that make this system work. This explanation will take you on a journey from basic React principles all the way to the internal implementation details.

### What Are React Hooks?

React Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 to solve several problems:

> Hooks allow you to reuse stateful logic between components without changing your component hierarchy.

Before hooks, you had to use class components to manage state and lifecycle methods. This created several challenges:

1. Stateful logic was difficult to reuse between components
2. Complex components became hard to understand
3. Classes were confusing for both humans and machines

Let's see a simple hook example:

```javascript
function Counter() {
  // This is a hook that adds state to our function component
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

But how does React actually remember the `count` value between renders? Where is this state stored? This leads us to React's internal architecture.

## The Fiber Architecture: React's Reconciliation Engine

### What is Fiber?

> Fiber is React's internal reconciliation algorithm—a complete rewrite of React's core that enables features like incremental rendering and priority-based updates.

React Fiber was introduced in React 16 to solve performance issues with the previous reconciliation algorithm. At its core, Fiber is both:

1. A data structure that represents elements in the component tree
2. A unit of work with its own "stack frame" that can be paused, resumed, and prioritized

### The Fiber Node Structure

Each component in your React application corresponds to one or more Fiber nodes. A simplified Fiber node structure looks like this:

```javascript
// Simplified Fiber node structure
const fiber = {
  // Instance
  stateNode: null, // Reference to the component instance (DOM node, class instance, etc.)

  // Fiber structure
  type: null,      // The function or class component
  key: null,       // Key property of this element
  
  // Links to other fibers
  child: null,     // First child
  sibling: null,   // Next sibling
  return: null,    // Parent fiber
  
  // Effects
  flags: 0,        // Side effects (previously: effectTag)
  
  // Work information
  pendingProps: null,  // New props
  memoizedProps: null, // Previous props
  
  // State
  memoizedState: null, // State used to create the output
  
  // Additional fields for hooks, context, etc.
  updateQueue: null,
  dependencies: null,
  
  // Additional metadata
  lanes: 0,        // Priority tracking
  // ... more fields
};
```

The most important field for understanding hooks is `memoizedState`, which is where React stores the state information for a component.

## How Hooks Are Stored in Fiber Nodes

### The Linked List Pattern

> React hooks are stored as a linked list in the `memoizedState` property of a Fiber node.

For function components, React uses the `memoizedState` field of the Fiber node to store a linked list of all hooks used by that component. Each hook in the linked list contains:

1. The hook's state
2. A pointer to the next hook
3. Additional metadata specific to that hook type

Here's a simplified representation of how a hook node in this linked list looks:

```javascript
// Simplified hook structure
const hook = {
  memoizedState: null, // The hook's state
  baseState: null,     // Base state for useReducer
  baseQueue: null,     // Base update queue for useReducer
  queue: null,         // Update queue for useState/useReducer
  next: null           // Pointer to the next hook
};
```

Let's visualize how multiple hooks are stored for a simple component:

```javascript
function Profile() {
  const [name, setName] = useState("John");
  const [age, setAge] = useState(25);
  const theme = useContext(ThemeContext);
  
  useEffect(() => {
    document.title = `${name}, ${age}`;
  }, [name, age]);
  
  return <div>...</div>;
}
```

Inside the Fiber node for this component, the `memoizedState` would contain a linked list like this:

```
Fiber.memoizedState → useState("John") → useState(25) → useContext(ThemeContext) → useEffect(...) → null
```

Each hook maintains its own state in its own `memoizedState` property, creating a nested structure.

## The Hook Initialization and Update Process

### How Hooks Are Initialized

When a function component renders for the first time, React creates a new hook object for each hook call and adds it to the linked list:

```javascript
// Pseudocode showing hook initialization
function mountWorkInProgressHook() {
  // Create a new hook
  const hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null
  };
  
  // Add it to the linked list
  if (workInProgressHook === null) {
    // This is the first hook in the component
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // Add to the end of the list
    workInProgressHook = workInProgressHook.next = hook;
  }
  
  return hook;
}
```

For `useState`, the initialization looks like:

```javascript
function mountState(initialState) {
  // Create a new hook and add it to the list
  const hook = mountWorkInProgressHook();
  
  // Calculate initial state
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  
  // Store the state in the hook
  hook.memoizedState = hook.baseState = initialState;
  
  // Create the update queue
  const queue = hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState
  };
  
  // Create the dispatch function
  const dispatch = queue.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  );
  
  // Return [state, setState]
  return [hook.memoizedState, dispatch];
}
```

### How Hooks Are Updated

On subsequent renders, React doesn't create new hooks but instead updates the existing ones in the linked list:

```javascript
// Pseudocode showing hook updates
function updateWorkInProgressHook() {
  // Get the current hook
  let nextCurrentHook;
  if (currentHook === null) {
    // This is the first hook
    nextCurrentHook = currentlyRenderingFiber.memoizedState;
  } else {
    // Move to the next hook
    nextCurrentHook = currentHook.next;
  }
  
  // Clone the existing hook's state
  const newHook = {
    memoizedState: nextCurrentHook.memoizedState,
    baseState: nextCurrentHook.baseState,
    baseQueue: nextCurrentHook.baseQueue,
    queue: nextCurrentHook.queue,
    next: null
  };
  
  // Add it to the work-in-progress linked list
  if (workInProgressHook === null) {
    // This is the first hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    // Add to the end of the list
    workInProgressHook = workInProgressHook.next = newHook;
  }
  
  return newHook;
}
```

For `useState` updates:

```javascript
function updateState(initialState) {
  // Get the existing hook
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  
  // Process any pending updates
  const pending = queue.pending;
  if (pending !== null) {
    // Apply pending updates to the state
    const first = pending.next;
    let newState = hook.baseState;
  
    let update = first;
    do {
      // Apply the update
      const action = update.action;
      newState = queue.lastRenderedReducer(newState, action);
      update = update.next;
    } while (update !== first);
  
    // Store the new state
    hook.memoizedState = newState;
  }
  
  // Return [updatedState, setState]
  return [hook.memoizedState, queue.dispatch];
}
```

## Examples of Hook Implementation in Fiber

Let's look at how different hooks are implemented in the Fiber architecture:

### Example 1: useState Implementation

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

In the Fiber node for this component:

```javascript
// Inside the Fiber node for Counter
fiber.memoizedState = {
  memoizedState: 0, // Current state value
  baseState: 0,     // Base state for this hook
  queue: {
    pending: null,  // Pending updates
    dispatch: setCount, // The setState function
    // ...other fields
  },
  next: null  // No more hooks
};
```

When `setCount` is called:

1. React creates an update object and adds it to the queue
2. It schedules a re-render of the component
3. During the re-render, it processes the update and computes the new state
4. The new state is stored in `memoizedState`

### Example 2: Multiple useState Hooks

```javascript
function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  return (
    <form>
      <input 
        value={name} 
        onChange={e => setName(e.target.value)} 
      />
      <input 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
    </form>
  );
}
```

In the Fiber node for this component:

```javascript
// Inside the Fiber node for Form
fiber.memoizedState = {
  memoizedState: "", // name's state
  baseState: "",
  queue: {
    // name's update queue
    pending: null,
    dispatch: setName,
    // ...other fields
  },
  next: {
    memoizedState: "", // email's state
    baseState: "",
    queue: {
      // email's update queue
      pending: null,
      dispatch: setEmail,
      // ...other fields
    },
    next: null // No more hooks
  }
};
```

### Example 3: useEffect Implementation

```javascript
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  
    return () => clearInterval(id);
  }, []);
  
  return <div>Seconds: {seconds}</div>;
}
```

In the Fiber node for this component:

```javascript
// Inside the Fiber node for Timer
fiber.memoizedState = {
  memoizedState: 0, // seconds state
  // ...other useState fields
  next: {
    memoizedState: {
      create: () => { /* effect function */ },
      destroy: () => { /* cleanup function */ },
      deps: [], // Empty dependency array
      // ...other effect-specific fields
    },
    // ...other useEffect fields
    next: null // No more hooks
  }
};
```

## The Rules of Hooks: A Consequence of Implementation

> "Don't call Hooks inside loops, conditions, or nested functions."

Now we can understand why the "Rules of Hooks" exist:

1. **Call hooks only at the top level** - Since hooks are stored in a linked list, React needs to call them in the same order every time to correctly associate each hook call with its stored state.
2. **Call hooks only from React functions** - The hook mechanism relies on the current Fiber node context, which is only available during React's rendering process.

Let's see what happens if we break these rules:

```javascript
function BadComponent(props) {
  // Sometimes this hook exists, sometimes it doesn't
  if (props.condition) {
    const [state, setState] = useState(0);
  }
  
  // This hook's position in the linked list would change
  // between renders, causing bugs
  const [name, setName] = useState("");
  
  return <div>{name}</div>;
}
```

If `props.condition` changes between renders:

1. First render (condition = true): `useState(0)` → `useState("")`
2. Second render (condition = false): `useState("")`

React would associate the second render's `useState("")` with the stored state from the first hook in the first render, causing the `name` state to become `0`!

## Practical Implications for React Developers

Understanding how hooks are stored in Fiber nodes has several practical implications:

### 1. Custom Hooks Implementation

When you create custom hooks, you're essentially composing primitive hooks, each adding its own node to the linked list:

```javascript
function useWindowSize() {
  // Each of these creates an entry in the hook linked list
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
}
```

### 2. Understanding Hook Dependencies

The `useEffect`, `useMemo`, and `useCallback` hooks store their dependency arrays in their respective hook nodes:

```javascript
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    // Fetch results when query changes
    fetchResults(query).then(setResults);
  }, [query]); // Dependency array is stored in the hook node
  
  return <ResultsList items={results} />;
}
```

In the Fiber node, React stores the dependency array and compares it on each render to determine if the effect should re-run.

### 3. Context and Hooks

When you use `useContext`, React creates a hook node that subscribes to context changes:

```javascript
function ThemedButton() {
  const theme = useContext(ThemeContext);
  
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      Themed Button
    </button>
  );
}
```

The Fiber node stores the context subscription in the hook's `memoizedState`.

## Conclusion

React's hook system is an elegant solution to manage state and side effects in function components. Under the hood, it leverages the Fiber architecture to store hooks as a linked list in each component's Fiber node.

> Understanding the hook storage mechanism helps us write more efficient React code and avoid common pitfalls.

The key insights are:

1. Hooks are stored as a linked list in the Fiber node's `memoizedState`
2. The order of hook calls must be consistent between renders
3. Each hook type has its own state structure tailored to its purpose
4. React reuses the hook structure on re-renders, updating their values

By understanding these internals, you gain deeper insight into why React works the way it does and how to leverage its mechanisms effectively in your applications.
