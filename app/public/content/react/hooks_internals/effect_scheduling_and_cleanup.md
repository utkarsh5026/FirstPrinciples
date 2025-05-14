# React Effect Scheduling and Cleanup Internals: A Deep Dive

> "To understand the future, we must first understand the past." — This quote aptly applies to React effects, whose behavior can only be truly understood by examining React's fundamental architecture.

## 1. First Principles: Why Effects Exist

At its core, React is built around a simple idea: UI is a function of state. Given the same state, React should render the same UI. However, applications need to interact with the world outside of this pure rendering process.

> Effects serve as React's bridge to the impure world outside of the rendering process.

Effects handle operations that:

* Cannot be performed during rendering (like DOM mutations)
* Should happen asynchronously (like data fetching)
* Deal with external systems (like browser APIs, third-party libraries)

Let's understand this from first principles.

### 1.1 The Pure Function Model

In functional programming, a pure function is one that:

* Given the same inputs, always returns the same output
* Has no side effects (doesn't modify anything outside its scope)

React components were designed to be pure functions:

```jsx
// Pure component - given the same props, it always renders the same UI
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

This component is predictable and easy to test. If `name` is "Alice", it always renders "Hello, Alice!".

But real applications need to perform side effects:

```jsx
function UserProfile({ userId }) {
  // ⚠️ This violates the pure function principle
  const userData = fetchUserData(userId); // Side effect: API call
  
  return <div>{userData.name}</div>;
}
```

This component is impure - it reaches outside its scope to perform a network request directly during rendering. This creates problems:

* The fetch happens on every render
* It's synchronous (blocking the UI)
* It's harder to test

React needed a way to handle these necessary side effects while preserving the purity of the rendering phase.

## 2. The Component Lifecycle and Effect Timing

To understand effects, we need to understand when they run in relation to React's component lifecycle.

> React's component lifecycle can be summarized as: mount → update (possibly many times) → unmount

In class components, this was explicit:

```jsx
class Timer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 0 };
  }

  // After first render (mount)
  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState(state => ({ seconds: state.seconds + 1 }));
    }, 1000);
  }

  // After updates
  componentDidUpdate(prevProps) {
    if (this.props.color !== prevProps.color) {
      document.title = `Color is now ${this.props.color}`;
    }
  }

  // Before removal (unmount)
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return <div>Seconds: {this.state.seconds}</div>;
  }
}
```

Hooks unified this model. With `useEffect`, React generalized these lifecycle concepts:

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    // This code runs after render (combining didMount and didUpdate)
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  
    // This function runs before the next effect or before unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array = run only on mount/unmount
  
  return <div>Seconds: {seconds}</div>;
}
```

## 3. React's Rendering Model: The Foundation

To understand effects, we must first understand React's rendering process.

> React's rendering is conceptually a three-phase process: render → reconcile → commit

### 3.1 The Render Phase

When React renders a component:

1. The component function executes
2. React captures the result (a tree of React elements - the "virtual DOM")
3. This is a pure computation - no DOM updates happen yet

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  console.log('Rendering Counter'); // This runs during render phase
  
  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

In this example, whenever `Counter` renders, "Rendering Counter" is logged. The function returns a React element describing what should be displayed.

### 3.2 The Reconciliation Phase

React then compares the new element tree with the previous one to determine what changed.

### 3.3 The Commit Phase

Finally, React applies the necessary updates to the actual DOM.

> Effects run after the commit phase completes, when the browser has painted the updated UI.

This sequence ensures that effects don't block rendering, allowing the UI to update quickly.

## 4. Effect Scheduling: The Mechanics

Now let's dive deeper into how React schedules and executes effects.

### 4.1 Effect Queue

When you call `useEffect`, React doesn't run your effect function right away. Instead:

1. React adds your effect to a queue
2. It completes the current render
3. It updates the DOM (commit phase)
4. It lets the browser paint
5. *Then* it processes the effect queue

Here's a simplified mental model of what happens internally:

```jsx
// Simplified pseudo-implementation
function useEffect(effectFunction, dependencies) {
  const currentFiber = React.__currentFiber;
  const previousDeps = currentFiber.memoizedState?.deps;
  
  // Check if deps have changed
  const depsChanged = !dependencies || 
    !previousDeps || 
    dependencies.some((dep, i) => dep !== previousDeps[i]);
  
  if (depsChanged) {
    // Schedule this effect to run after commit
    currentFiber.effects.push({
      effectFunction,
      dependencies,
      cleanup: currentFiber.memoizedState?.cleanup
    });
  }
  
  // Store for next time
  currentFiber.memoizedState = {
    deps: dependencies,
    cleanup: effectFunction
  };
}
```

This is greatly simplified, but illustrates the core concepts.

### 4.2 Different Effect Priorities

React actually has multiple effect queues with different priorities:

1. **Layout Effects** (`useLayoutEffect`): Run synchronously after DOM mutations but before browser painting
2. **Passive Effects** (`useEffect`): Run asynchronously after the browser has painted

Let's see the difference:

```jsx
function MeasureExample() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ref = useRef();
  
  // This runs after DOM mutations but before paint
  useLayoutEffect(() => {
    // Read from the DOM
    const newSize = {
      width: ref.current.offsetWidth,
      height: ref.current.offsetHeight
    };
    // Update state synchronously before paint
    setSize(newSize);
  }, []);
  
  // This runs after paint - too late for layout measurements
  useEffect(() => {
    console.log("Browser has painted, size is:", size);
  }, [size]);
  
  return <div ref={ref}>Measure me</div>;
}
```

In this example:

1. The component renders with initial size (0, 0)
2. After DOM updates, `useLayoutEffect` runs, measuring the actual size
3. It updates the state synchronously, causing a re-render before painting
4. The component renders again with the correct size
5. The browser paints
6. Finally, `useEffect` runs and logs the size

> `useLayoutEffect` is for measurements and DOM mutations that must happen before paint. `useEffect` is for everything else.

## 5. Fiber Architecture: The Implementation

To truly understand effects, we need to look at React's Fiber architecture, which powers the scheduling system.

> Fiber is React's internal reconciliation algorithm - a reimplementation of the stack optimized for incremental rendering.

A Fiber is a unit of work representing a component instance. It contains:

* The component type and props
* Its parent, siblings, and children (the fiber tree)
* Work-in-progress state
* Effect information
* Alternate fibers (for double buffering)

Each fiber can have its own effect list, containing operations that need to be performed during the commit phase.

Here's a simplified visual of how a fiber might look internally:

```javascript
// Simplified Fiber node structure (for illustration)
const fiber = {
  // Type info
  type: MyComponent,
  key: 'someKey',
  
  // Hierarchy
  child: childFiber,
  sibling: nextFiber,
  return: parentFiber,
  
  // Effects
  flags: EffectTags.UPDATE,
  effects: [
    {
      effectFunction: () => { console.log('Effect ran') },
      dependencies: [dep1, dep2],
      cleanup: () => { console.log('Cleanup ran') }
    }
  ],
  
  // State
  memoizedState: { count: 0 },
  memoizedProps: { color: 'blue' },
  
  // Alternate (for double buffering)
  alternate: workInProgressFiber
};
```

During reconciliation, React builds a work-in-progress fiber tree in memory while keeping the current tree intact. It collects effects as it works. When done, it atomically swaps the trees and processes the effects.

## 6. Effect Cleanup: The Lifecycle Completion

Now let's examine cleanup functions - one of the most powerful yet often misunderstood aspects of effects.

> Cleanup functions prevent resources from leaking and ensure effects properly clean up after themselves.

### 6.1 When Cleanup Functions Run

A cleanup function runs:

1. Before the effect runs again (if dependencies changed)
2. Before the component unmounts

```jsx
function ConnectionStatus({ serverId }) {
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    console.log(`Setting up connection to server ${serverId}`);
  
    // Set up connection
    const connection = createConnection(serverId);
    connection.on('status', setStatus);
  
    // Cleanup function
    return () => {
      console.log(`Cleaning up connection to server ${serverId}`);
      connection.disconnect();
    };
  }, [serverId]); // Dependency on serverId
  
  return <div>Status: {status}</div>;
}
```

Let's trace what happens when this component mounts with `serverId = "a"`, then updates to `serverId = "b"`, and finally unmounts:

1. **Mount with `serverId = "a"`** :

* Component renders
* Effect runs, logging "Setting up connection to server a"
* Connection to server "a" is created

1. **Update to `serverId = "b"`** :

* Component re-renders with new props
* React sees the dependency changed
* **Before running the new effect, it runs the cleanup function from the previous effect**
* Cleanup runs, logging "Cleaning up connection to server a"
* The connection to server "a" is disconnected
* The new effect runs, logging "Setting up connection to server b"
* A new connection to server "b" is created

1. **Unmount** :

* React runs the cleanup function one last time
* "Cleaning up connection to server b" is logged
* The connection to server "b" is disconnected

### 6.2 Cleanup Implementation Details

Internally, React stores the cleanup function returned from your effect. When it's time to run the cleanup, React executes this function before running the next effect or before unmounting the component.

A simplified internal implementation might look like:

```javascript
// Simplified internal effect processing
function commitPassiveEffects(current, finishedWork) {
  // Process unmount effects
  if (finishedWork.flags & PassiveUnmountFlags) {
    const unmountEffects = finishedWork.unmountEffects;
    for (let i = 0; i < unmountEffects.length; i++) {
      const effect = unmountEffects[i];
      if (effect.cleanup) {
        // Call the cleanup function
        effect.cleanup();
      }
    }
  }
  
  // Process mount effects
  if (finishedWork.flags & PassiveMountFlags) {
    const mountEffects = finishedWork.mountEffects;
    for (let i = 0; i < mountEffects.length; i++) {
      const effect = mountEffects[i];
      // Call the effect function
      const cleanup = effect.effectFunction();
      // Store the cleanup function for next time
      effect.cleanup = cleanup;
    }
  }
}
```

## 7. Effect Dependencies: The Change Detection System

The dependencies array is crucial for effect performance and correctness.

> React uses a simple array comparison to determine if dependencies have changed.

### 7.1 How React Compares Dependencies

React stores your previous dependencies array and compares each item with the current one using `Object.is` (similar to `===` but handles `NaN` correctly).

```javascript
// Simplified dependency comparison
function haveDepsChanged(prevDeps, nextDeps) {
  if (!prevDeps || !nextDeps) {
    return true; // No deps means always run
  }
  
  if (prevDeps.length !== nextDeps.length) {
    console.error('Dependency arrays must have consistent length!');
    return true;
  }
  
  // Compare each dependency using Object.is
  for (let i = 0; i < nextDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {
      return true; // Something changed
    }
  }
  
  return false; // Nothing changed
}
```

This is why object and function dependencies can cause problems - they're recreated on each render (new references).

### 7.2 Common Dependency Patterns

Let's examine some patterns:

```jsx
// 1. Run on every render (no dependency array)
useEffect(() => {
  document.title = `Count: ${count}`;
}); // No dependency array

// 2. Run only once on mount (empty dependency array)
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component will unmount');
}, []); // Empty array

// 3. Run when specific values change
useEffect(() => {
  console.log(`Count changed to ${count}`);
}, [count]); // Runs when count changes

// 4. Run when objects change (problematic)
useEffect(() => {
  console.log('User changed:', user);
}, [user]); // ⚠️ If user is recreated each render, effect runs too often
```

Let's fix the object problem:

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  // Better - depend on primitive values
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]); // Only depends on userId (likely a string/number)
  
  // ...
}
```

## 8. A Concrete Example: Building a Synchronized Effect System

Let's build a more complex example to illustrate these concepts:

```jsx
function SynchronizedForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const formRef = useRef(null);
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Effect 1: Sync form data to localStorage (immediately)
  useEffect(() => {
    console.log('Syncing form data to localStorage');
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]); // Runs when formData changes
  
  // Effect 2: Load form data from localStorage (once on mount)
  useEffect(() => {
    console.log('Loading form data from localStorage');
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []); // Empty array = run once on mount
  
  // Effect 3: Auto-save to server (debounced)
  useEffect(() => {
    // Don't auto-save empty form
    if (!formData.name && !formData.email) return;
  
    console.log('Setting up auto-save timer');
    setIsSaving(true);
    setSaveStatus('Saving...');
  
    // Debounce the save - wait 2 seconds of inactivity
    const saveTimer = setTimeout(async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Saved data:', formData);
        setSaveStatus('Saved successfully');
      } catch (error) {
        console.error('Save failed:', error);
        setSaveStatus('Save failed');
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  
    // Clean up the timer if data changes again before save completes
    return () => {
      console.log('Cancelling previous auto-save');
      clearTimeout(saveTimer);
    };
  }, [formData]); // Run when formData changes
  
  // Effect 4: Measure form dimensions with useLayoutEffect
  useLayoutEffect(() => {
    if (formRef.current) {
      const { width, height } = formRef.current.getBoundingClientRect();
      console.log(`Form dimensions: ${width}px × ${height}px`);
    }
  }, []); // Run once after mount, before paint
  
  return (
    <form ref={formRef}>
      <div>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
      </div>
      <div>
        Status: {saveStatus} {isSaving && '⏳'}
      </div>
    </form>
  );
}
```

In this example:

1. Effect 1 syncs to localStorage immediately when form data changes
2. Effect 2 loads from localStorage once on mount
3. Effect 3 sets up debounced saving with cleanup to cancel pending saves
4. Effect 4 measures the form using useLayoutEffect before painting

The cleanup function in Effect 3 is crucial - it prevents stale saves when the user types quickly.

## 9. Advanced Topics: The Edge Cases

Let's explore some advanced aspects of React effects.

### 9.1 Effect Timing Guarantees

It's important to understand that while `useLayoutEffect` runs synchronously, `useEffect` has no timing guarantees beyond "after paint":

```jsx
function TimingExample() {
  const [count, setCount] = useState(0);
  
  // This runs synchronously after DOM mutations
  useLayoutEffect(() => {
    console.log('Layout effect:', count);
  }, [count]);
  
  // This runs asynchronously after paint
  useEffect(() => {
    console.log('Effect:', count);
  
    // This state update causes a re-render
    if (count < 5) {
      setCount(c => c + 1);
    }
  }, [count]);
  
  console.log('Render:', count);
  return <div>Count: {count}</div>;
}
```

The console output order might be:

```
Render: 0
Layout effect: 0
Effect: 0
Render: 1
Layout effect: 1
Effect: 1
// And so on...
```

### 9.2 React 18 and Concurrent Features

React 18 introduced concurrent rendering, which can make effects more complex. Effects might run multiple times or be delayed in ways they weren't before.

> In concurrent React, renders can be interrupted, resumed, or even discarded, affecting when effects run.

This is why proper cleanup is even more important.

```jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Don't fetch for empty queries
    if (!query) {
      setResults([]);
      return;
    }
  
    let isCurrent = true; // Flag to track if this effect is still current
    setIsLoading(true);
  
    fetchResults(query)
      .then(data => {
        // Only update state if this effect is still current
        if (isCurrent) {
          setResults(data);
          setIsLoading(false);
        }
      })
      .catch(error => {
        if (isCurrent) {
          console.error(error);
          setIsLoading(false);
        }
      });
  
    // Cleanup function
    return () => {
      isCurrent = false; // Mark this effect as stale
    };
  }, [query]);
  
  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {results.map(result => (
            <li key={result.id}>{result.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

In concurrent mode, React might render a new version of this component with a different query but then discard that render. The effect cleanup ensures we don't update state from stale effects.

### 9.3 Custom Hooks: Building on Effects

Effects provide the foundation for custom hooks, which encapsulate reusable logic:

```jsx
// Custom hook for persisting state to localStorage
function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  // Update localStorage when the state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue];
}

// Usage
function SettingsForm() {
  const [settings, setSettings] = useLocalStorage('app-settings', {
    darkMode: false,
    notifications: true
  });
  
  return (
    <form>
      <label>
        <input
          type="checkbox"
          checked={settings.darkMode}
          onChange={e => setSettings({
            ...settings,
            darkMode: e.target.checked
          })}
        />
        Dark Mode
      </label>
      {/* Other controls... */}
    </form>
  );
}
```

This hook abstracts away the localStorage synchronization logic, making it reusable across components.

## 10. Best Practices and Mental Models

To work effectively with effects, here are some key principles:

> **1. Effects should represent relationships, not lifecycle events.**

Think of effects as declaring "synchronize this with that" rather than "run this code at this time".

```jsx
// Don't think: "Run this after mounting"
// Do think: "Keep the document title in sync with the count"
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

> **2. Each effect should have a single responsibility.**

Split unrelated logic into separate effects:

```jsx
// ❌ One effect doing multiple unrelated things
useEffect(() => {
  document.title = `Count: ${count}`;
  analytics.logEvent('count_changed', { count });
  
  const handleKeyPress = (e) => {
    if (e.key === 'ArrowUp') setCount(c => c + 1);
  };
  window.addEventListener('keypress', handleKeyPress);
  
  return () => {
    window.removeEventListener('keypress', handleKeyPress);
  };
}, [count]);

// ✅ Separate effects with clear responsibilities
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);

useEffect(() => {
  analytics.logEvent('count_changed', { count });
}, [count]);

useEffect(() => {
  const handleKeyPress = (e) => {
    if (e.key === 'ArrowUp') setCount(c => c + 1);
  };
  window.addEventListener('keypress', handleKeyPress);
  
  return () => {
    window.removeEventListener('keypress', handleKeyPress);
  };
}, []); // Note: This depends on setCount, which is stable
```

> **3. Include all values from the component scope used by the effect in the dependencies array.**

The ESLint rule `exhaustive-deps` helps with this.

```jsx
function SearchComponent({ query, onResultsChange }) {
  useEffect(() => {
    fetchResults(query).then(results => {
      onResultsChange(results);
    });
  }, [query, onResultsChange]); // Both query and onResultsChange needed
}
```

> **4. Always clean up subscriptions, timers, and resources.**

```jsx
useEffect(() => {
  const subscription = messageService.subscribe(channel, message => {
    setMessages(prev => [...prev, message]);
  });
  
  return () => {
    subscription.unsubscribe();
  };
}, [channel]);
```

## Conclusion: Thinking in Effects

React effects provide a powerful way to synchronize your component with external systems while maintaining the pure function model. By understanding the scheduling, cleanup, and dependency tracking internals, you can write more robust and predictable React applications.

> Effects bridge the gap between React's declarative world and the imperative outside world.

The best mental model is to think of effects as synchronization points - they keep specific aspects of your component in sync with systems outside of React's control. Each effect should declare and maintain a single synchronization relationship.

By mastering effects, you gain the ability to cleanly integrate React with any external system while maintaining React's core benefits of predictability and composability.
