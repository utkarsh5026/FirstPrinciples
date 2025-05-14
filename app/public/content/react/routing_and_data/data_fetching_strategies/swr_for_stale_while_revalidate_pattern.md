# Understanding SWR: Stale-While-Revalidate in React

I'll explain the SWR (Stale-While-Revalidate) pattern in React from first principles, breaking down each concept and providing practical examples along the way.

## What is SWR?

> "SWR is a strategy to first return the data from cache (stale), then send the fetch request (revalidate), and finally come with the up-to-date data." - Vercel

SWR is both a pattern for handling data fetching and a React hook library developed by Vercel. The name "Stale-While-Revalidate" describes its core behavior: showing stale (cached) data while simultaneously revalidating (fetching fresh data) in the background.

## The Problem SWR Solves

Before diving into SWR, let's understand the problems it addresses in data fetching:

1. **Loading states** : Traditional fetching requires managing loading states
2. **Data staleness** : Cached data can become outdated
3. **Refetching logic** : Knowing when to refetch data is complex
4. **Error handling** : Managing network errors gracefully
5. **Caching** : Implementing efficient caching strategies

## First Principles: HTTP Caching Headers

SWR is inspired by the HTTP `Cache-Control` header and specifically the `stale-while-revalidate` directive. Let's break this down:

> When a browser requests a resource, the `stale-while-revalidate` directive allows it to use a stale (cached) version initially while fetching a fresh version in the background.

For example, if a browser has a cached version of an image that's 5 minutes old, and the cache directive says:

```
Cache-Control: max-age=1, stale-while-revalidate=59
```

This means:

* If the resource is less than 1 minute old, use the cache directly
* If it's between 1-60 minutes old, use the cache immediately (stale) but refresh in the background
* If it's older than 60 minutes, wait for a fresh fetch

## Core Concepts of SWR in React

### 1. Key-Based Data Fetching

SWR uses a key (typically a URL) to deduplicate and share data across your application.

```jsx
// The key is '/api/user/123'
const { data, error } = useSWR('/api/user/123', fetcher)
```

### 2. The Fetcher Function

A fetcher is a function that given a key, returns a promise with the data:

```jsx
// A simple fetcher function
const fetcher = url => fetch(url).then(res => res.json())
```

### 3. Caching and Revalidation

SWR maintains an in-memory cache for data:

1. **Initial load** : Show loading state
2. **Data arrives** : Show data and cache it
3. **Later visit** : Show cached data instantly while revalidating

### 4. Automatic Revalidation Strategies

SWR automatically revalidates data when:

* The page is focused again (user returns to tab)
* Network is reconnected
* The component is remounted
* At regular intervals (if configured)

## Implementing SWR in React

Let's implement SWR step-by-step:

### Basic Usage Example

First, install the SWR library:

```bash
npm install swr
```

Now, let's create a simple component that fetches user data:

```jsx
import useSWR from 'swr'

// Define our fetcher function
const fetcher = (...args) => fetch(...args).then(res => res.json())

function UserProfile({ userId }) {
  // The key is the URL for the API endpoint
  const { data, error, isLoading } = useSWR(`/api/users/${userId}`, fetcher)

  if (error) return <div>Failed to load user</div>
  if (isLoading) return <div>Loading...</div>

  // Render the data
  return (
    <div>
      <h1>{data.name}</h1>
      <p>Email: {data.email}</p>
    </div>
  )
}
```

Let's break down what's happening:

1. We import the `useSWR` hook
2. Define a `fetcher` function that handles the actual data fetching
3. Call `useSWR` with a key (the API URL) and our fetcher
4. Get back `data`, `error`, and `isLoading` to handle different states
5. Render appropriate UI based on these states

### Understanding the Flow

When the `UserProfile` component renders:

1. If it's the first time, `isLoading` is true, showing the loading state
2. When data arrives, the component re-renders with the data
3. If you navigate away and come back, the cached data shows immediately
4. Simultaneously, SWR revalidates by fetching fresh data
5. If the new data is different, the component re-renders again

## Advanced Usage with Real Examples

### 1. Conditional Fetching

Sometimes you want to fetch data only when certain conditions are met:

```jsx
function ConditionalFetch({ shouldFetch, userId }) {
  // Only fetch when shouldFetch is true
  const { data } = useSWR(shouldFetch ? `/api/users/${userId}` : null, fetcher)
  
  return <div>{data ? `User name: ${data.name}` : 'Not fetching yet'}</div>
}
```

### 2. Dependent Fetching

Often you need data from one fetch to make another:

```jsx
function UserPosts() {
  // First fetch user data
  const { data: user } = useSWR('/api/user', fetcher)
  
  // Then use user ID to fetch posts (dependent query)
  const { data: posts } = useSWR(user ? `/api/posts?userId=${user.id}` : null, fetcher)
  
  if (!user) return <div>Loading user...</div>
  if (!posts) return <div>Loading posts...</div>
  
  return (
    <div>
      <h1>{user.name}'s Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

### 3. Global Configuration

You can configure SWR globally:

```jsx
import { SWRConfig } from 'swr'

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then(res => res.json()),
        refreshInterval: 3000, // Refresh every 3 seconds
        dedupingInterval: 2000, // Deduplicate requests within 2 seconds
        revalidateOnFocus: true, // Revalidate when window focuses
        revalidateOnReconnect: true // Revalidate when network reconnects
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  )
}
```

### 4. Error Handling and Retries

SWR has built-in error handling and retry logic:

```jsx
function DataWithRetry() {
  const { data, error, mutate } = useSWR('/api/data', fetcher, {
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      // Only retry up to 3 times
      if (retryCount >= 3) return
    
      // Retry after 5 seconds
      setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 5000)
    }
  })
  
  if (error) return (
    <div>
      Error loading data. 
      <button onClick={() => mutate()}>Try Again</button>
    </div>
  )
  
  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>
}
```

### 5. Mutation and Optimistic Updates

One of SWR's powerful features is data mutation with optimistic updates:

```jsx
function TodoList() {
  const { data, mutate } = useSWR('/api/todos', fetcher)
  
  async function addTodo(text) {
    // Create new todo object
    const newTodo = { id: Date.now(), text, completed: false }
  
    // Update the local data immediately (optimistic update)
    // The second parameter is a boolean indicating this is a revalidation
    mutate([...data, newTodo], false)
  
    // Send the actual request to add the todo
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(newTodo)
    })
  
    // Trigger a revalidation to make sure our local data is correct
    mutate()
  }
  
  return (
    <div>
      <ul>
        {data?.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
      <button onClick={() => addTodo('New task')}>Add Todo</button>
    </div>
  )
}
```

## Implementation Under the Hood

To better understand SWR, let's look at a simplified implementation of how it might work internally:

```jsx
function useSWRSimplified(key, fetcher, options = {}) {
  // State for storing data, error, and loading
  const [state, setState] = React.useState({
    data: undefined,
    error: undefined,
    isLoading: true
  })
  
  // Reference to store if the component is mounted
  const mounted = React.useRef(true)
  
  // Cache reference (in a real implementation, this would be global)
  const cache = React.useRef({})
  
  // Function to fetch data
  const fetchData = React.useCallback(async () => {
    // Skip if no key or fetcher
    if (!key || !fetcher) return
  
    try {
      // Start loading
      if (!cache.current[key]) {
        setState(prev => ({ ...prev, isLoading: true }))
      }
    
      // Fetch the data
      const data = await fetcher(key)
    
      // Update cache
      cache.current[key] = data
    
      // Update state if still mounted
      if (mounted.current) {
        setState({ data, error: undefined, isLoading: false })
      }
    } catch (error) {
      // Handle error
      if (mounted.current) {
        setState({ data: cache.current[key], error, isLoading: false })
      }
    }
  }, [key, fetcher])
  
  // Effect for initial fetch and revalidation
  React.useEffect(() => {
    // Set up cleanup
    mounted.current = true
  
    // If we have cached data, use it immediately
    if (cache.current[key]) {
      setState({ 
        data: cache.current[key], 
        error: undefined, 
        isLoading: false 
      })
    }
  
    // Fetch fresh data
    fetchData()
  
    // Set up focus revalidation
    const handleFocus = () => {
      if (options.revalidateOnFocus !== false) {
        fetchData()
      }
    }
  
    // Listen for window focus events
    window.addEventListener('focus', handleFocus)
  
    // Cleanup
    return () => {
      mounted.current = false
      window.removeEventListener('focus', handleFocus)
    }
  }, [key, fetchData, options.revalidateOnFocus])
  
  // Function to manually revalidate
  const mutate = React.useCallback(async (newData, shouldRevalidate = true) => {
    // If we have new data, update the cache and state
    if (newData) {
      cache.current[key] = newData
      setState({ data: newData, error: undefined, isLoading: false })
    }
  
    // Revalidate if needed
    if (shouldRevalidate) {
      return fetchData()
    }
  }, [key, fetchData])
  
  return { ...state, mutate }
}
```

This simplified implementation shows the core principles:

1. Maintain a cache of data by key
2. Return cached data immediately when available
3. Always fetch fresh data in the background
4. Provide a way to manually update the data
5. Setup revalidation triggers like window focus events

## Practical Considerations and Best Practices

### When to Use SWR

SWR is ideal for:

> Data that needs to be both immediately available and kept up-to-date, such as user profiles, settings, or feed data that changes frequently.

It's especially valuable in:

1. **Dashboards** : Where data freshness is critical
2. **Social feeds** : Where content updates frequently
3. **User profiles** : Where data is accessed repeatedly
4. **E-commerce** : Where inventory and pricing need to be current

### When Not to Use SWR

SWR might not be ideal for:

1. **Static data** : Content that rarely changes
2. **One-time operations** : Like form submissions
3. **Large data sets** : Where bandwidth is a concern

### Data Deduplication

SWR automatically deduplicates identical requests. For example, if multiple components request `/api/user`:

```jsx
// Component A
const { data: user } = useSWR('/api/user', fetcher)

// Component B (in another part of the app)
const { data: sameUser } = useSWR('/api/user', fetcher)
```

SWR will only send a single request, regardless of how many components are using the same data.

### Cache Persistence

For persistent caching across sessions, you can integrate SWR with local storage:

```jsx
function useLocalStorageSWR(key, fetcher) {
  // Initialize from local storage if available
  const getInitialData = () => {
    try {
      const item = localStorage.getItem(`swr-${key}`)
      return item ? JSON.parse(item) : undefined
    } catch (error) {
      return undefined
    }
  }

  // Use SWR with a custom config
  const { data, error, mutate } = useSWR(key, fetcher, {
    initialData: getInitialData(),
    onSuccess: (data) => {
      // Save to localStorage on successful fetch
      localStorage.setItem(`swr-${key}`, JSON.stringify(data))
    }
  })

  return { data, error, mutate }
}
```

## Advanced Patterns with SWR

### Pagination

SWR handles pagination elegantly:

```jsx
function Pagination() {
  const [pageIndex, setPageIndex] = React.useState(0)
  
  // SWR key includes the page index
  const { data, error } = useSWR(`/api/posts?page=${pageIndex}`, fetcher)
  
  // Pre-fetch the next page
  useSWR(`/api/posts?page=${pageIndex + 1}`, fetcher)
  
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  
  return (
    <div>
      {data.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
      <button 
        onClick={() => setPageIndex(pageIndex - 1)}
        disabled={pageIndex === 0}
      >
        Previous
      </button>
      <button 
        onClick={() => setPageIndex(pageIndex + 1)}
      >
        Next
      </button>
    </div>
  )
}
```

### Infinite Loading

For infinite scroll patterns:

```jsx
import { useSWRInfinite } from 'swr'

function InfinitePostList() {
  const getKey = (pageIndex, previousPageData) => {
    // Reached the end
    if (previousPageData && !previousPageData.length) return null
  
    // First page, no previousPageData
    if (pageIndex === 0) return '/api/posts?limit=10'
  
    // Add the cursor to the API endpoint
    return `/api/posts?cursor=${previousPageData[previousPageData.length - 1].id}&limit=10`
  }
  
  const { data, error, size, setSize } = useSWRInfinite(getKey, fetcher)
  
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  
  // Flatten the array of arrays
  const posts = data ? [].concat(...data) : []
  const isEmpty = data?.[0]?.length === 0
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 10)
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
      <button 
        onClick={() => setSize(size + 1)}
        disabled={isReachingEnd}
      >
        {isReachingEnd ? 'No more posts' : 'Load more'}
      </button>
    </div>
  )
}
```

### Custom Cache Providers

SWR allows you to implement custom caching mechanisms:

```jsx
import { SWRConfig, Cache } from 'swr'

// Create a custom cache provider
const localStorageProvider = () => {
  // Initialize from localStorage
  const map = new Map(
    JSON.parse(localStorage.getItem('swr-cache') || '[]')
  )
  
  // Before unloading the app, write back all data to localStorage
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()))
    localStorage.setItem('swr-cache', appCache)
  })
  
  // Return the map
  return map
}

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ provider: localStorageProvider }}>
      <Component {...pageProps} />
    </SWRConfig>
  )
}
```

## Comparing SWR to Alternatives

### SWR vs React Query

While both solve similar problems:

* **SWR** tends to be more lightweight and focuses on the stale-while-revalidate pattern
* **React Query** provides more features like query cancellation, query priorities, and background fetching

### SWR vs Apollo Client

* **SWR** is transport-agnostic and works with any data source
* **Apollo Client** is specifically designed for GraphQL and has more GraphQL-specific features

## Common Gotchas and Solutions

### 1. Updating Derived State

When your UI depends on derived state from SWR data:

```jsx
// Problematic approach
function UserWithDerivedState() {
  const { data: user } = useSWR('/api/user', fetcher)
  
  // This will be recalculated on every render
  const fullName = user ? `${user.firstName} ${user.lastName}` : ''
  
  return <div>{fullName}</div>
}

// Better approach using useMemo
function UserWithDerivedState() {
  const { data: user } = useSWR('/api/user', fetcher)
  
  // This will only be recalculated when user changes
  const fullName = React.useMemo(() => {
    return user ? `${user.firstName} ${user.lastName}` : ''
  }, [user])
  
  return <div>{fullName}</div>
}
```

### 2. Fetching in Server Components (Next.js)

In Next.js, you shouldn't use hooks like SWR in Server Components:

```jsx
// Client Component
'use client'
import useSWR from 'swr'

function ClientUser({ userId }) {
  const { data } = useSWR(`/api/user/${userId}`, fetcher)
  return <div>{data?.name}</div>
}

// Server Component
import ClientUser from './ClientUser'

export default async function Page({ params }) {
  return <ClientUser userId={params.id} />
}
```

## Conclusion

SWR represents a sophisticated yet elegant approach to data fetching in React applications. By following the stale-while-revalidate pattern:

> "Show what you have, while you fetch what you need"

This approach creates UIs that feel lightning-fast while ensuring data is always up-to-date. The benefits include:

1. Built-in caching with automatic revalidation
2. Loading states that don't block rendering
3. Error handling with retry capabilities
4. Deduplication of requests
5. Focus and network revalidation

By understanding these principles, you can build React applications that deliver excellent user experiences with minimal effort on data management.

The SWR pattern is particularly valuable as applications grow more complex and data requirements increase. It scales well from simple use cases to advanced scenarios like pagination, infinite loading, and optimistic updates.
