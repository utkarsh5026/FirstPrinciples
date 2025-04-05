# React's useEffect Hook: Understanding from First Principles

To fully understand React's useEffect Hook, I'll build our knowledge from foundational concepts to advanced applications, with clear examples throughout.

## 1. The Problem: Side Effects in React Components

React's primary job is rendering UI based on state and props. However, real applications need to do more than just render:

* Fetch data from servers
* Subscribe to external systems (websockets, browser APIs)
* Manipulate the DOM directly
* Set up timers or intervals
* Log analytics data
* Persist data to localStorage

These operations are called "side effects" because they affect something outside the normal React rendering flow. In traditional web development, these operations might look like:

```javascript
// Traditional approach
document.title = 'New Page Title';
const subscription = api.subscribe();
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => {
    document.getElementById('data-container').textContent = JSON.stringify(data);
  });
```

The problem is that React components render and re-render frequently. If we put side effects directly in the component body:

```javascript
function ProfilePage({ userId }) {
  // 🔴 Wrong: This runs on EVERY render
  fetch(`https://api.example.com/users/${userId}`)
    .then(response => response.json())
    .then(data => {
      // Do something with the data
    });
  
  return <div>Loading profile...</div>;
}
```

This would cause multiple fetch requests on every render, creating performance issues and potential bugs.

## 2. The Mental Model: Synchronizing with External Systems

The most powerful mental model for useEffect is to think of it as a synchronization mechanism. Instead of thinking about lifecycle events (like "mount" or "update"), think about it as:

**"How do I keep my component in sync with something outside of React?"**

This "something" could be:

* Server data
* Browser APIs (document.title, localStorage)
* Timer or subscription
* DOM measurements
* Third-party libraries

When certain values (dependencies) change, useEffect helps you keep your component synchronized with these external systems.

## 3. The Basic Syntax and Usage

Let's look at the basic syntax of useEffect:

```javascript
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    // Side effect code goes here
    console.log('Effect ran!');
  
    // Optional cleanup function
    return () => {
      console.log('Cleanup ran!');
      // Clean up the effect here
    };
  }, [/* dependencies array */]);
  
  return <div>My Component</div>;
}
```

useEffect takes two arguments:

1. A function containing the side effect code
2. An array of dependencies that determine when the effect should re-run

Let's break down several common patterns:

### Running an Effect Once (On Mount)

```javascript
function DataFetchingComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // This effect runs once after the initial render
    console.log('Fetching data...');
  
    fetch('https://api.example.com/data')
      .then(response => response.json())
      .then(result => {
        setData(result);
      });
  }, []); // Empty dependency array = run once after mount
  
  return (
    <div>
      {data ? JSON.stringify(data) : 'Loading...'}
    </div>
  );
}
```

The empty array tells React: "Run this effect after the first render, and don't run it again."

### Running an Effect When Values Change

```javascript
function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    // This effect runs whenever query changes
    console.log(`Searching for: ${query}`);
  
    if (query.length > 0) {
      fetch(`https://api.example.com/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
          setResults(data);
        });
    } else {
      setResults([]);
    }
  }, [query]); // Only re-run when query changes
  
  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

Here, the effect depends on the `query` prop. When `query` changes, the effect runs again.

### Running an Effect on Every Render

```javascript
function LoggingComponent() {
  useEffect(() => {
    // This effect runs on every render
    console.log('Component rendered');
  }); // No dependency array = run on every render
  
  return <div>Check console for logs</div>;
}
```

Omitting the dependency array entirely makes the effect run after every render. This is rarely what you want and can lead to performance issues.

## 4. How useEffect Works Under the Hood

When React processes a useEffect Hook, it:

1. Remembers the effect function and its dependencies
2. Renders the component and updates the DOM
3. Runs layout effects (useLayoutEffect)
4. Runs the effect function if the dependencies have changed
5. Before the next time the effect runs, if a cleanup function was returned, React runs it

This sequence is crucial to understand, especially when debugging:

```javascript
function EffectSequenceDemo() {
  console.log('1. Component body execution');
  
  useEffect(() => {
    console.log('3. Effect runs after render');
  
    return () => {
      console.log('2. (Next render) Cleanup runs before new effect');
    };
  });
  
  console.log('2. Continue component body execution');
  
  return <div>Check console for sequence</div>;
}
```

The first time this component renders, you'll see:

```
1. Component body execution
2. Continue component body execution
3. Effect runs after render
```

On subsequent renders, you'll see:

```
1. Component body execution
2. Continue component body execution
2. (Next render) Cleanup runs before new effect
3. Effect runs after render
```

This sequence explains why the component body runs first, then the effect runs after the DOM update.

## 5. Effect Cleanup: Preventing Memory Leaks

The cleanup function (returned from an effect) is crucial for preventing memory leaks:

```javascript
function Subscription({ channelId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Set up subscription
    console.log(`Subscribing to channel ${channelId}`);
    const connection = createConnection(channelId);
    connection.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    connection.connect();
  
    // Clean up subscription
    return () => {
      console.log(`Unsubscribing from channel ${channelId}`);
      connection.disconnect();
    };
  }, [channelId]);
  
  return (
    <div>
      <h2>Messages for channel {channelId}:</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
```

The cleanup function runs in three scenarios:

1. Before the effect runs again due to a dependency change
2. When the component unmounts
3. During development in Strict Mode (extra cleanup/setup cycle for testing)

Always think about what resources your effect is using and how to properly release them.

## 6. Understanding the Dependency Array

The dependency array is critical to using useEffect correctly:

```javascript
function ProfileEditor({ userId, onSave }) {
  const [profile, setProfile] = useState(null);
  
  // Fetch profile when userId changes
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(response => response.json())
      .then(data => setProfile(data));
  }, [userId]); // Only depends on userId
  
  // Log save events
  useEffect(() => {
    function handleSave(data) {
      console.log('Saving profile:', data);
      onSave(data);
    }
  
    // Set up event listener
    window.addEventListener('save-profile', handleSave);
  
    return () => {
      window.removeEventListener('save-profile', handleSave);
    };
  }, [onSave]); // Depends on onSave function
  
  // ...
}
```

React compares the dependencies using Object.is comparison. If any dependency changes, the effect runs again.

### Effect Dependencies: Common Gotchas

Here are some common issues with dependencies:

#### Forgetting Dependencies

```javascript
function Counter({ initial }) {
  const [count, setCount] = useState(initial);
  
  // 🔴 Wrong: Missing dependency
  useEffect(() => {
    // This effect uses count and initial, but only lists count
    const difference = count - initial;
    console.log(`Count is ${difference} from initial`);
  }, [count]); // Missing 'initial' dependency
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

React's ESLint rules (eslint-plugin-react-hooks) can help catch missing dependencies.

#### Objects and Functions as Dependencies

```javascript
function ProductPage({ productId }) {
  // 🔴 Problem: This object is recreated on every render
  const product = { id: productId, name: `Product ${productId}` };
  
  useEffect(() => {
    console.log('Product changed:', product);
    // This will run on EVERY render because product is a new object each time
  }, [product]);
  
  // ...
}
```

To fix this issue, either:

1. Move object/function creation inside the effect
2. Extract primitive values as dependencies
3. Use useCallback/useMemo to stabilize references

```javascript
function ProductPage({ productId }) {
  // ✅ Using primitive value as dependency
  useEffect(() => {
    // Create the object inside the effect
    const product = { id: productId, name: `Product ${productId}` };
    console.log('Product changed:', product);
  }, [productId]); // Now only depends on primitive productId
  
  // ...
}
```

## 7. Common useEffect Patterns

### Pattern 1: Data Fetching

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Reset states when userId changes
    setLoading(true);
    setError(null);
  
    // Define an async function inside the effect
    async function fetchUserData() {
      try {
        const response = await fetch(`https://api.example.com/users/${userId}`);
      
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
      
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  
    // Call the async function
    fetchUserData();
  
    // Optional cleanup if the request needs to be cancelled
    return () => {
      // If your fetch library supports cancellation (like axios)
      // you would cancel the request here
    };
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      {/* Other user details */}
    </div>
  );
}
```

Key points:

* We track loading and error states
* We define the async function inside the effect
* We clean up properly if needed
* We handle all possible states in the UI

### Pattern 2: Subscriptions and Event Listeners

```javascript
function WindowSizeTracker() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    // Function to update size
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
  
    // Set up the event listener
    window.addEventListener('resize', handleResize);
  
    // Clean up the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array - only run on mount/unmount
  
  return (
    <div>
      <p>Window width: {windowSize.width}px</p>
      <p>Window height: {windowSize.height}px</p>
    </div>
  );
}
```

This pattern is perfect for:

* Browser APIs (resize, scroll, online/offline)
* WebSocket subscriptions
* Custom event listeners
* Third-party library subscriptions

### Pattern 3: Syncing State to External Systems

```javascript
function DocumentTitleUpdater({ title }) {
  // Update document title when component title changes
  useEffect(() => {
    // Save the original title to restore later
    const originalTitle = document.title;
  
    // Update the document title
    document.title = title;
  
    // Restore the original title when component unmounts
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
  
  return null; // This component doesn't render anything
}

// Usage
function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <DocumentTitleUpdater title={`Count: ${count}`} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

This pattern works well for syncing React state to:

* Browser APIs (title, history, localStorage)
* Third-party libraries
* External stores

### Pattern 4: Previous Value Tracking

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  const [prevCount, setPrevCount] = useState(null);
  
  // Track previous count value
  useEffect(() => {
    setPrevCount(count);
  }, [count]);
  
  return (
    <div>
      <p>Current: {count}, Previous: {prevCount !== null ? prevCount : 'N/A'}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

This pattern is useful when you need to compare current and previous values of props or state.

## 8. Advanced useEffect Techniques

### Technique 1: Debouncing Effects

```javascript
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // This effect handles the search with debouncing
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
  
    // Set a timeout to delay the search
    const timeoutId = setTimeout(() => {
      setIsSearching(true);
    
      fetch(`https://api.example.com/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
          setResults(data);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 500); // 500ms delay
  
    // Clean up the timeout if query changes before timeout completes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [query]);
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {isSearching && <div>Searching...</div>}
      <ul>
        {results.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

This technique uses the cleanup function to cancel pending operations when dependencies change rapidly.

### Technique 2: Effect Reduction with Custom Hooks

To reduce complexity, extract common effect patterns into custom hooks:

```javascript
// Custom hook for API requests
function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
  
    async function fetchData() {
      setLoading(true);
    
      try {
        const response = await fetch(url);
      
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
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
    }
  
    fetchData();
  
    return () => {
      isMounted = false;
    };
  }, [url]);
  
  return { data, loading, error };
}

// Using the custom hook
function UserList() {
  const { data: users, loading, error } = useApi('https://api.example.com/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {users && users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Custom hooks like this provide several benefits:

* Encapsulate complex effect logic
* Make components more readable
* Enable reuse across components
* Implement consistent error handling
* Handle race conditions with the isMounted flag

### Technique 3: Coordinating Multiple Effects

Sometimes you need to coordinate multiple effects:

```javascript
function UserDashboard({ userId }) {
  // State for different types of data
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  
  // Loading states
  const [userLoading, setUserLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);
  
  // Computed property: is anything still loading?
  const isLoading = userLoading || postsLoading || friendsLoading;
  
  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      setUserLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setUserLoading(false);
      }
    }
  
    fetchUser();
  }, [userId]);
  
  // Fetch user's posts - depends on user being loaded
  useEffect(() => {
    if (!user) return; // Don't fetch posts until we have the user
  
    async function fetchPosts() {
      setPostsLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}/posts`);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setPostsLoading(false);
      }
    }
  
    fetchPosts();
  }, [userId, user]);
  
  // Fetch user's friends - depends on user being loaded
  useEffect(() => {
    if (!user) return; // Don't fetch friends until we have the user
  
    async function fetchFriends() {
      setFriendsLoading(true);
      try {
        const response = await fetch(`/api/users/${userId}/friends`);
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      } finally {
        setFriendsLoading(false);
      }
    }
  
    fetchFriends();
  }, [userId, user]);
  
  if (isLoading) return <div>Loading dashboard...</div>;
  
  return (
    <div>
      <h1>{user.name}'s Dashboard</h1>
    
      <h2>Posts ({posts.length})</h2>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    
      <h2>Friends ({friends.length})</h2>
      <ul>
        {friends.map(friend => (
          <li key={friend.id}>{friend.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

This pattern:

* Breaks complex data fetching into separate effects
* Creates dependencies between effects using state
* Tracks loading states for each operation
* Provides a unified loading experience

## 9. Common useEffect Pitfalls and Solutions

### Pitfall 1: Infinite Loops

```javascript
function InfiniteLoopExample() {
  const [count, setCount] = useState(0);
  
  // 🔴 Pitfall: This creates an infinite loop
  useEffect(() => {
    // This effect updates state, which triggers a re-render,
    // which runs the effect again, creating an infinite loop
    setCount(count + 1);
  }, [count]); // count is a dependency, so the effect runs when count changes
  
  return <div>Count: {count}</div>;
}
```

Solutions:

1. **Fix the dependency array** - Only include values that should trigger re-runs
2. **Use functional updates** - When the new state depends on the previous state

```javascript
function FixedExample() {
  const [count, setCount] = useState(0);
  
  // Solution 1: Run the effect only once
  useEffect(() => {
    setCount(count + 1);
  }, []); // Empty dependency array - runs once
  
  // Solution 2: Use a functional update (if you need to run on every mount)
  useEffect(() => {
    // This doesn't create a dependency on count
    setCount(prevCount => prevCount + 1);
  }, []); // No need to include count as a dependency
  
  return <div>Count: {count}</div>;
}
```

### Pitfall 2: Race Conditions in Data Fetching

```javascript
function UserProfileWithRaceCondition({ userId }) {
  const [user, setUser] = useState(null);
  
  // 🔴 Pitfall: Potential race condition
  useEffect(() => {
    // If userId changes rapidly, older requests might resolve after newer ones
    fetch(`/api/users/${userId}`)
      .then(response => response.json())
      .then(data => {
        // This might set stale data if a newer request finished first
        setUser(data);
      });
  }, [userId]);
  
  return (
    <div>
      {user ? <h1>{user.name}</h1> : <div>Loading...</div>}
    </div>
  );
}
```

Solutions:

1. **Track the current request** - Use a flag to ignore results from outdated requests
2. **Cancel previous requests** - Use AbortController to cancel outdated requests

```javascript
function UserProfileFixed({ userId }) {
  const [user, setUser] = useState(null);
  
  // Solution: Track the latest request
  useEffect(() => {
    let isCurrent = true;
  
    // Using AbortController (modern browsers)
    const controller = new AbortController();
    const signal = controller.signal;
  
    fetch(`/api/users/${userId}`, { signal })
      .then(response => response.json())
      .then(data => {
        // Only update state if this is still the current request
        if (isCurrent) {
          setUser(data);
        }
      })
      .catch(error => {
        // AbortError is expected when we cancel, so don't treat it as an error
        if (error.name !== 'AbortError' && isCurrent) {
          console.error('Fetch error:', error);
        }
      });
  
    // Cleanup function to handle cancellation
    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [userId]);
  
  return (
    <div>
      {user ? <h1>{user.name}</h1> : <div>Loading...</div>}
    </div>
  );
}
```

### Pitfall 3: Stale Closures

```javascript
function IntervalExample() {
  const [count, setCount] = useState(0);
  
  // 🔴 Pitfall: Stale closure
  useEffect(() => {
    const intervalId = setInterval(() => {
      // This always uses the 'count' from when the effect was created
      console.log(`Current count: ${count}`);
      setCount(count + 1); // This won't increment properly
    }, 1000);
  
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array - effect created once with count = 0
  
  return <div>Count: {count}</div>;
}
```

Solutions:

1. **Include the dependency** - Add the value to the dependency array
2. **Use functional updates** - When the update depends on previous state

```javascript
function IntervalExampleFixed() {
  const [count, setCount] = useState(0);
  
  // Solution 1: Include count in dependencies
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log(`Current count: ${count}`);
      setCount(count + 1);
    }, 1000);
  
    return () => clearInterval(intervalId);
  }, [count]); // Include count - interval recreated whenever count changes
  
  // Solution 2: Use functional update (better performance)
  useEffect(() => {
    const intervalId = setInterval(() => {
      // This doesn't depend on the closure's count value
      setCount(prevCount => {
        console.log(`Current count: ${prevCount}`);
        return prevCount + 1;
      });
    }, 1000);
  
    return () => clearInterval(intervalId);
  }, []); // No need for dependencies with functional update
  
  return <div>Count: {count}</div>;
}
```

### Pitfall 4: Over-dependency on Effects

```javascript
function FormattedDate({ date }) {
  // 🔴 Pitfall: Using an effect for formatting
  const [formattedDate, setFormattedDate] = useState('');
  
  useEffect(() => {
    // This could be calculated directly during render
    setFormattedDate(new Date(date).toLocaleDateString());
  }, [date]);
  
  return <div>{formattedDate}</div>;
}
```

Solution: Calculate during render for transformations that don't involve side effects

```javascript
function FormattedDateFixed({ date }) {
  // ✅ Solution: Calculate during render
  const formattedDate = new Date(date).toLocaleDateString();
  
  return <div>{formattedDate}</div>;
}
```

## 10. Real-World Example: A Complete Component

Let's combine all these principles into a complete component that demonstrates useEffect best practices:

```javascript
import { useState, useEffect, useCallback } from 'react';

function ProductPage({ productId, onAddToCart }) {
  // State for main data and UI
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track view for analytics
  useEffect(() => {
    // Log view to analytics service
    const logView = () => {
      console.log(`Product ${productId} viewed at ${new Date().toISOString()}`);
      // In a real app, you'd call an analytics API
      // analyticsService.logEvent('product_view', { productId });
    };
  
    logView();
  
    // Update document title based on product
    if (product) {
      const originalTitle = document.title;
      document.title = `${product.name} - Our Store`;
  
      return () => {
        document.title = originalTitle;
      };
    }
  }, [productId, product]);
  
  // Fetch product data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
  
    const controller = new AbortController();
    const signal = controller.signal;
  
    async function fetchProductData() {
      try {
        const response = await fetch(`/api/products/${productId}`, { signal });
    
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }
    
        const data = await response.json();
    
        if (isMounted) {
          setProduct(data);
          // Save to recent views in localStorage
          saveToRecentViews(data);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
  
    fetchProductData();
  
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [productId]);
  
  // Fetch related products after we have the main product
  useEffect(() => {
    if (!product) return;
  
    let isMounted = true;
  
    async function fetchRelatedProducts() {
      try {
        const response = await fetch(`/api/products/${productId}/related`);
    
        if (!response.ok) {
          throw new Error('Failed to fetch related products');
        }
    
        const data = await response.json();
    
        if (isMounted) {
          setRelatedProducts(data);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
      }
    }
  
    fetchRelatedProducts();
  
    return () => {
      isMounted = false;
    };
  }, [product, productId]);
  
  // Fetch reviews only when user wants to see them
  useEffect(() => {
    if (!reviewsVisible) return;
  
    let isMounted = true;
  
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/products/${productId}/reviews`);
    
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
    
        const data = await response.json();
    
        if (isMounted) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    }
  
    fetchReviews();
  
    return () => {
      isMounted = false;
    };
  }, [productId, reviewsVisible]);
  
  // Save to recently viewed products in localStorage
  const saveToRecentViews = useCallback((product) => {
    try {
      const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      
      // Remove if already exists
      const filtered = recentlyViewed.filter(item => item.id !== product.id);
      
      // Add to beginning of array and limit to 5 items
      const updated = [
        { id: product.id, name: product.name, image: product.image },
        ...filtered
      ].slice(0, 5);
      
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving to recently viewed:', err);
    }
  }, []);
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    // Call the provided callback
    onAddToCart(product);
    
    // Show confirmation message
    alert(`${product.name} added to cart!`);
  };
  
  // Handle toggle reviews
  const toggleReviews = () => {
    setReviewsVisible(prev => !prev);
  };
  
  if (isLoading) return <div>Loading product...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;
  
  return (
    <div className="product-page">
      <div className="product-main">
        <img src={product.image} alt={product.name} />
        
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">${product.price.toFixed(2)}</p>
          <p>{product.description}</p>
          
          <button onClick={handleAddToCart}>Add to Cart</button>
          <button onClick={toggleReviews}>
            {reviewsVisible ? 'Hide Reviews' : 'Show Reviews'}
          </button>
        </div>
      </div>
      
      {reviewsVisible && (
        <div className="reviews">
          <h2>Customer Reviews</h2>
          {reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <ul>
              {reviews.map(review => (
                <li key={review.id}>
                  <div className="stars">{★.repeat(review.rating)}</div>
                  <p>{review.text}</p>
                  <p className="author">- {review.author}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>You might also like</h2>
          <div className="product-grid">
            {relatedProducts.map(item => (
              <div key={item.id} className="product-card">
                <img src={item.image} alt={item.name} />
                <h3>{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

This example demonstrates several important useEffect patterns and practices:
- Coordinating multiple data fetching effects
- Loading data conditionally (reviews only when visible)
- Cleaning up effects properly with isMounted and AbortController
- Handling side effects like document title and localStorage updates
- Using useCallback to stabilize function references
- Proper error handling and loading states

## 11. useEffect and Data Fetching: Modern Approaches

While useEffect is commonly used for data fetching, the React team and community have developed newer approaches to handle data fetching more elegantly:

### Approach 1: Custom Hooks with useEffect

```javascript
// Custom hook for data fetching with all the best practices
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;
    
    async function fetchData() {
      setLoading(true);
      
      try {
        const response = await fetch(url, {
          signal,
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error };
}

// Using the custom hook
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);
  
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

This approach encapsulates all the best practices we've discussed into a reusable hook.

### Approach 2: React Query or SWR

Libraries like React Query and SWR (Stale-While-Revalidate) handle data fetching with additional features:

```javascript
// Using React Query
import { useQuery } from 'react-query';

function fetchUser(userId) {
  return fetch(`/api/users/${userId}`).then(res => res.json());
}

function UserProfile({ userId }) {
  const {
    data: user,
    isLoading,
    error
  } = useQuery(['user', userId], () => fetchUser(userId), {
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache data for 30 minutes
    retry: 3, // Retry failed requests 3 times
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

These libraries provide:
- Automatic caching
- Request deduplication
- Background refetching
- Optimistic updates
- Retry logic
- Prefetching
- Pagination and infinite scrolling support

While they abstract away direct use of useEffect, they're built on the same principles and handle the complexities we've discussed.

## 12. useEffect and Server Components (Modern React)

With the introduction of React Server Components, data fetching is evolving again:

```javascript
// Server Component (doesn't use hooks)
async function UserProfile({ userId }) {
  // This runs on the server - no useEffect needed
  const user = await fetch(`/api/users/${userId}`).then(res => res.json());
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <ClientUserActions userId={userId} />
    </div>
  );
}

// Client Component (uses hooks as needed)
"use client";
function ClientUserActions({ userId }) {
  const [isFollowing, setIsFollowing] = useState(false);
  
  // useEffect still needed for client-side effects
  useEffect(() => {
    // Check if user is following
    fetch(`/api/users/${userId}/following-status`)
      .then(res => res.json())
      .then(data => setIsFollowing(data.isFollowing));
  }, [userId]);
  
  return (
    <button onClick={() => setIsFollowing(!isFollowing)}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  );
}
```

With Server Components:
- Data fetching can happen directly in the component without useEffect
- useEffect is still needed for client-side operations
- This pattern separates data fetching from UI effects

## 13. useEffect and Animations

useEffect can be used to trigger animations when components mount or data changes:

```javascript
function AnimatedCounter({ count }) {
  const [animatedCount, setAnimatedCount] = useState(count);
  
  // Animate count changes
  useEffect(() => {
    // Skip animation on initial render
    if (animatedCount === count) return;
    
    // For large changes, animate in smaller steps
    const diff = count - animatedCount;
    const step = Math.sign(diff) * Math.min(5, Math.abs(diff));
    
    // Set up interval to increment/decrement gradually
    const intervalId = setInterval(() => {
      setAnimatedCount(prev => {
        // If we're one step away, go directly to target
        if (Math.abs(count - prev) <= Math.abs(step)) {
          clearInterval(intervalId);
          return count;
        }
        return prev + step;
      });
    }, 50);
    
    return () => clearInterval(intervalId);
  }, [count, animatedCount]);
  
  return (
    <div className="counter">
      <span className="digit">{animatedCount}</span>
    </div>
  );
}
```

While CSS animations are often preferred for simple transitions, useEffect enables complex, JavaScript-driven animations based on state changes.

## 14. When to Use useEffect vs. Other Hooks

### useEffect vs. useLayoutEffect

```javascript
function MeasureWidthExample() {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  
  // 🔴 Problem: This might cause a flash of content
  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.getBoundingClientRect().width);
    }
  }, []);
  
  // ✅ Solution: useLayoutEffect runs synchronously before browser paint
  useLayoutEffect(() => {
    if (ref.current) {
      setWidth(ref.current.getBoundingClientRect().width);
    }
  }, []);
  
  return (
    <div>
      <div ref={ref}>This element's width is measured</div>
      <p>The width is: {width}px</p>
    </div>
  );
}
```

Use useLayoutEffect when:
- You need to measure DOM elements
- You need to update the DOM synchronously before painting
- You're experiencing flickering with useEffect

### useEffect vs. useMemo and useCallback

```javascript
function ExpensiveCalculation({ data }) {
  // 🔴 Incorrect: Using useEffect for computation
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    // This triggers an additional render
    const calculatedResult = performExpensiveCalculation(data);
    setResult(calculatedResult);
  }, [data]);
  
  // ✅ Correct: Using useMemo for computation
  const memoizedResult = useMemo(() => {
    return performExpensiveCalculation(data);
  }, [data]);
  
  return <div>Result: {memoizedResult}</div>;
}
```

Use useMemo or useCallback instead of useEffect when:
- You're computing derived state based on props or state
- You're creating functions that need to be stable between renders
- You're not performing actual side effects

## 15. Testing Components with useEffect

Testing components with useEffect requires specific techniques:

```javascript
// Component to test
function UserStatus({ userId }) {
  const [status, setStatus] = useState('offline');
  
  useEffect(() => {
    function updateStatus() {
      fetch(`/api/users/${userId}/status`)
        .then(res => res.json())
        .then(data => setStatus(data.status));
    }
    
    updateStatus();
    const intervalId = setInterval(updateStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, [userId]);
  
  return <div>User is {status}</div>;
}

// Test with React Testing Library
import { render, screen, act } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API with MSW
const server = setupServer(
  rest.get('/api/users/:userId/status', (req, res, ctx) => {
    return res(ctx.json({ status: 'online' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('displays user status', async () => {
  // Mock timer functions
  jest.useFakeTimers();
  
  render(<UserStatus userId="123" />);
  
  // Initially shows offline
  expect(screen.getByText('User is offline')).toBeInTheDocument();
  
  // Wait for effect to complete
  await screen.findByText('User is online');
  
  // Change the mock response
  server.use(
    rest.get('/api/users/:userId/status', (req, res, ctx) => {
      return res(ctx.json({ status: 'away' }));
    })
  );
  
  // Advance timers to trigger the interval
  act(() => {
    jest.advanceTimersByTime(30000);
  });
  
  // Check updated status
  await screen.findByText('User is away');
  
  // Restore real timers
  jest.useRealTimers();
});
```

Key testing techniques:
- Mock timers with Jest for intervals and timeouts
- Mock API responses with tools like MSW
- Use act() for state updates
- Test cleanup functions by unmounting components
- Use async testing utilities for effects that fetch data

## 16. Conclusion: Mental Models for useEffect

To master useEffect, keep these mental models in mind:

### 1. Synchronization, Not Lifecycle

Rather than thinking about "when" code runs (mount, update, unmount), think about "what" your component needs to synchronize with:

```javascript
// ❌ Lifecycle thinking
useEffect(() => {
  // "This runs after mount"
  console.log('Mounted');
  return () => {
    // "This runs before unmount"
    console.log('Unmounting');
  };
}, []);

// ✅ Synchronization thinking
useEffect(() => {
  // "Synchronize with the current theme setting"
  document.body.classList.add(`theme-${theme}`);
  return () => {
    document.body.classList.remove(`theme-${theme}`);
  };
}, [theme]);
```

### 2. The Dependency Array is a Trigger List

Think of the dependency array as "when any of these values change, run this effect again":

```javascript
useEffect(() => {
  // This effect depends on userId and filters
  fetchUserData(userId, filters);
}, [userId, filters]); // Re-run when either changes
```

### 3. The Cleanup Function Represents "Undo"

The cleanup function should undo whatever the effect set up:

```javascript
useEffect(() => {
  // Set up: Add event listener
  window.addEventListener('resize', handleResize);
  
  // Cleanup: Remove event listener
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, [handleResize]);
```

### 4. Effects Run After Render

Remember that effects run after React has updated the DOM:

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  
  // Component body - runs during render
  console.log('Rendering with count:', count);
  
  useEffect(() => {
    // Effect - runs after render
    console.log('Effect with count:', count);
  });
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

The sequence will be:
1. "Rendering with count: 0"
2. "Effect with count: 0"
3. (after click) "Rendering with count: 1"
4. "Effect with count: 1"

Understanding these mental models will help you write cleaner, more predictable effects and avoid common pitfalls. Remember that useEffect is a powerful tool, but it's not always the right solution - consider the alternatives we've discussed for specific use cases.

As you continue working with React, you'll develop an intuition for when to reach for useEffect and when to use other approaches. The key is to think in terms of synchronization and dependencies rather than just lifecycle events.