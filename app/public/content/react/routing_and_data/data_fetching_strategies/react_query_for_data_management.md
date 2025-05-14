# React Query: Data Management from First Principles

## Introduction to the Data Problem in React

Let's begin by understanding the fundamental problem React Query solves. When building React applications, we frequently need to:

> Data in modern web applications is constantly in flux. We fetch data from servers, cache it, update it, synchronize it with the server, handle loading and error states, and manage complex dependencies between data. This is the core challenge React Query solves.

React applications face several intrinsic challenges when dealing with remote data:

1. Fetching data when components mount
2. Caching responses to avoid redundant network requests
3. Determining when data is "stale" and needs refreshing
4. Updating server data with mutations
5. Reflecting server-side changes in the UI
6. Managing loading and error states
7. Optimizing performance through prefetching and pagination

Before specialized tools, developers often solved these problems with a combination of:

```jsx
// Traditional React data fetching approach
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset states when userId changes
    setIsLoading(true);
    setError(null);
  
    fetch(`/api/users/${userId}`)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
      })
      .then(data => {
        setUser(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;
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

This approach becomes unwieldy as applications grow, leading to several issues:

* Duplicate data fetching logic across components
* No centralized caching mechanism
* Manual tracking of loading and error states
* Complex state management for data mutations
* Difficulty handling dependent queries

## React Query: A Paradigm Shift in Data Management

React Query fundamentally changes how we think about data in React applications.

> React Query is not just a library; it's a paradigm shift that treats server state as a first-class citizen, separate from UI state, with its own lifecycle and management patterns.

### Core Principles of React Query

1. **Server State vs. Client State** : React Query recognizes that server data is fundamentally different from UI state.
2. **Declarative Data Fetching** : You declare what data you need, not how to fetch it.
3. **Automatic Caching** : Data is automatically stored and reused when needed.
4. **Background Updates** : Stale data is updated in the background while users see cached data.
5. **Garbage Collection** : Unused data is automatically removed from memory.

## Getting Started with React Query

Let's build our understanding from the ground up with examples.

### Installation and Setup

First, we install the necessary packages:

```bash
npm install @tanstack/react-query
# or
yarn add @tanstack/react-query
```

Then, we set up the QueryClient and QueryClientProvider:

```jsx
// In your root component (e.g., App.js)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your application components */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Let me explain this setup:

* The `QueryClient` is the heart of React Query, managing all queries and cache
* `defaultOptions` configure global behavior:
  * `staleTime`: How long data remains fresh before background refetching
  * `cacheTime`: How long inactive data stays in memory
  * `retry`: Number of retry attempts on failure
* `QueryClientProvider` makes the client available throughout your app
* `ReactQueryDevtools` provides a UI for debugging queries (optional)

### Your First Query: useQuery

The `useQuery` hook is the foundation of React Query:

```jsx
import { useQuery } from '@tanstack/react-query';

function fetchUser(userId) {
  return fetch(`/api/users/${userId}`).then(res => res.json());
}

function UserProfile({ userId }) {
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>Email: {data.email}</p>
    </div>
  );
}
```

This simple example demonstrates React Query's power:

1. **Query Key** : The `['user', userId]` array uniquely identifies this query
2. **Query Function** : The `queryFn` defines how to fetch the data
3. **Automatic State Management** : React Query provides `isLoading`, `isError`, etc.

> The query key is a crucial concept in React Query - it serves as both the unique identifier and dependency array. When any part of the key changes, React Query knows to refetch the data.

### The Query Lifecycle

Understanding the lifecycle of a query is essential:

1. **Fresh** → Data is considered up-to-date (within staleTime)
2. **Stale** → Data may need refreshing (exceeded staleTime)
3. **Fetching** → A request is in progress
4. **Inactive** → No components are using the data
5. **Deleted** → Data is removed from cache (after cacheTime)

### Advanced Query Features

Let's explore more powerful features:

#### Dependent Queries

Sometimes queries depend on the results of other queries:

```jsx
function UserPosts({ userId }) {
  // First query - fetch user details
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  // Second query - depends on first query result
  const postsQuery = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => fetchPosts(userId),
    // Only execute if userQuery is successful and user is an author
    enabled: !!userQuery.data && userQuery.data.role === 'author',
  });

  if (userQuery.isLoading) return <div>Loading user...</div>;
  if (userQuery.isError) return <div>Error loading user</div>;
  
  if (postsQuery.isLoading) return <div>Loading posts...</div>;
  if (postsQuery.isError) return <div>Error loading posts</div>;
  if (!postsQuery.data) return <div>No posts available</div>;

  return (
    <div>
      <h1>{userQuery.data.name}'s Posts</h1>
      <ul>
        {postsQuery.data.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

The key insight here:

* The `enabled` option conditionally executes the query
* When dependencies change, React Query automatically manages refetching

#### Query Invalidation

A powerful feature of React Query is cache invalidation:

```jsx
import { useQueryClient } from '@tanstack/react-query';

function AdminDashboard() {
  const queryClient = useQueryClient();
  
  const refreshAllUsers = () => {
    // Invalidate all queries that start with 'user'
    queryClient.invalidateQueries({ queryKey: ['user'] });
  };
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={refreshAllUsers}>
        Refresh All User Data
      </button>
    </div>
  );
}
```

This example shows how you can:

* Access the `queryClient` with `useQueryClient`
* Invalidate queries selectively with `invalidateQueries`
* Trigger refetching of stale queries actively being used in components

## Mutations with useMutation

For modifying server data, React Query provides the `useMutation` hook:

```jsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function createUser(newUser) {
  return fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(newUser),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());
}

function CreateUserForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      // Invalidate and refetch the users list query
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Reset form
      setName('');
      setEmail('');
      // Show success message
      alert(`User ${data.name} created successfully!`);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name"
        disabled={mutation.isPending}
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        disabled={mutation.isPending}
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
      {mutation.isError && (
        <div>Error: {mutation.error.message}</div>
      )}
    </form>
  );
}
```

This example demonstrates:

1. Creating a mutation with `useMutation`
2. Accessing mutation states like `isPending` and `isError`
3. Triggering the mutation with `mutate`
4. Using callbacks like `onSuccess` for side effects
5. Invalidating related queries to update the UI

### Optimistic Updates

For a more responsive UI, we can update the UI before the server confirms the change:

```jsx
function TodoList() {
  const queryClient = useQueryClient();
  const todosQuery = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  const updateTodo = useMutation({
    mutationFn: (updatedTodo) => 
      fetch(`/api/todos/${updatedTodo.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedTodo),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()),
  
    // Here's the optimistic update pattern
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['todos'] });
    
      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(['todos']);
    
      // Optimistically update the UI
      queryClient.setQueryData(['todos'], old => 
        old.map(todo => 
          todo.id === newTodo.id ? newTodo : todo
        )
      );
    
      // Return context for potential rollback
      return { previousTodos };
    },
  
    // If mutation fails, use context to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
  
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // Component rendering...
}
```

The optimistic update pattern includes:

1. Saving the current state before changes
2. Immediately updating the UI with expected changes
3. Rolling back if the server request fails
4. Refreshing with actual server data afterward

## Advanced Patterns and Concepts

### Pagination

React Query excels at managing paginated data:

```jsx
function PaginatedPosts() {
  const [page, setPage] = useState(1);
  
  const fetchPosts = ({ pageParam = 1 }) => 
    fetch(`/api/posts?page=${pageParam}&limit=10`)
      .then(res => res.json());
  
  const {
    data,
    isLoading,
    isFetching,
    isPreviousData,
    error
  } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts({ pageParam: page }),
    keepPreviousData: true, // Keep previous page data while loading next page
  });

  return (
    <div>
      <h1>Posts</h1>
    
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <>
          {/* Show the posts */}
          <ul>
            {data.posts.map(post => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>

          {/* Pagination controls */}
          <div>
            <button
              onClick={() => setPage(old => Math.max(old - 1, 1))}
              disabled={page === 1 || isFetching}
            >
              Previous Page
            </button>
            <span>Page {page}</span>
            <button
              onClick={() => {
                if (!isPreviousData && data.hasMore) {
                  setPage(old => old + 1);
                }
              }}
              disabled={isPreviousData || !data.hasMore || isFetching}
            >
              Next Page
            </button>
            {isFetching ? <span> Loading...</span> : null}
          </div>
        </>
      )}
    </div>
  );
}
```

Key pagination features:

* Including page in the query key triggers refetching when it changes
* `keepPreviousData` maintains the previous page's content during loading
* `isPreviousData` flag indicates we're showing cached data
* We can show loading indicators while new data is being fetched

### Infinite Queries

For "load more" patterns, React Query provides useInfiniteQuery:

```jsx
function InfinitePostsList() {
  const fetchPosts = ({ pageParam = 1 }) => 
    fetch(`/api/posts?page=${pageParam}&limit=10`)
      .then(res => res.json());

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage, pages) => {
      // Return undefined when there are no more pages
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
  });

  return (
    <div>
      <h1>Infinite Posts</h1>
    
      {status === 'loading' ? (
        <div>Loading...</div>
      ) : status === 'error' ? (
        <div>Error!</div>
      ) : (
        <>
          {/* Render all pages of data */}
          {data.pages.map((page, i) => (
            <React.Fragment key={i}>
              {page.posts.map(post => (
                <div key={post.id} className="post">
                  <h2>{post.title}</h2>
                  <p>{post.body}</p>
                </div>
              ))}
            </React.Fragment>
          ))}
        
          {/* Load more button */}
          <button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage
              ? 'Loading more...'
              : hasNextPage
              ? 'Load More'
              : 'Nothing more to load'}
          </button>
        </>
      )}
    </div>
  );
}
```

Infinite query features:

* `useInfiniteQuery` manages multiple "pages" of data
* `getNextPageParam` determines if more data is available
* `fetchNextPage` loads additional data
* Data structure has `pages` array containing all loaded pages
* UI can easily show "load more" or infinite scroll patterns

### Custom Hooks

For reusable data fetching logic, create custom hooks:

```jsx
// In a separate file, e.g., hooks/useUser.js
import { useQuery } from '@tanstack/react-query';

const fetchUser = (userId) => 
  fetch(`/api/users/${userId}`).then(res => res.json());

export function useUser(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 300000, // 5 minutes
    // Custom error handler for this specific query
    onError: (error) => {
      console.error(`Failed to fetch user ${userId}:`, error);
    }
  });
}

// Usage in components
function ProfilePage({ userId }) {
  const { data: user, isLoading, isError } = useUser(userId);
  
  // Component code...
}
```

Benefits of custom hooks:

* Encapsulate fetching logic for reuse across components
* Apply consistent options to related queries
* Centralize error handling and data transformation
* Make component code cleaner and more focused

## Query Prefetching and Cache Management

Prefetching improves perceived performance:

```jsx
function UsersList() {
  const queryClient = useQueryClient();
  
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // Prefetch user details when hovering over a user in the list
  const prefetchUser = (userId) => {
    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => fetchUser(userId),
      staleTime: 60000, // 1 minute
    });
  };

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users?.map(user => (
          <li 
            key={user.id}
            onMouseEnter={() => prefetchUser(user.id)}
          >
            <Link to={`/users/${user.id}`}>{user.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Prefetching strategies:

* On hover/focus to load likely-needed data
* On page load for critical resources
* After initial data loaded, prefetch related resources
* Based on user behavior patterns

### Manual Cache Management

Sometimes, you need direct control over the cache:

```jsx
function AdminTools() {
  const queryClient = useQueryClient();
  
  const actions = {
    // View current cache data
    viewCacheData: () => {
      const users = queryClient.getQueryData(['users']);
      console.log('Cached users:', users);
    },
  
    // Set data directly without fetching
    updateUserData: () => {
      const currentUser = queryClient.getQueryData(['user', '123']);
    
      // Update a specific field
      queryClient.setQueryData(['user', '123'], {
        ...currentUser,
        lastActive: new Date().toISOString()
      });
    },
  
    // Clear all cache data
    clearCache: () => {
      queryClient.clear();
    },
  
    // Remove specific queries
    removeUserQueries: () => {
      queryClient.removeQueries({ queryKey: ['user'] });
    }
  };
  
  // Component rendering...
}
```

Cache manipulation methods:

* `getQueryData`: Retrieve cached data without triggering fetch
* `setQueryData`: Directly update cached data
* `invalidateQueries`: Mark queries as stale and potentially refetch
* `removeQueries`: Remove specific queries from cache
* `clear`: Reset the entire cache

## Advanced Configuration

Fine-tune React Query with global defaults:

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      cacheTime: 900000, // 15 minutes
      retry: 3,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      suspense: false,
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});
```

Configuration options explained:

* `staleTime`: Time until data is considered stale
* `cacheTime`: Time until inactive data is garbage collected
* `retry` and `retryDelay`: Automatic retry behavior
* `refetchOnWindowFocus`: Refresh when user returns to the application
* `refetchOnMount`: Refresh when component mounts
* `refetchOnReconnect`: Refresh when network reconnects
* `suspense`: Integration with React Suspense

### Query Error Handling

Handle errors gracefully with dedicated callbacks:

```jsx
function ErrorBoundaryExample() {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <div>
          <h2>Something went wrong!</h2>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      )}
    >
      <SuspenseWrapper />
    </ErrorBoundary>
  );
}

function SuspenseWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userId="123" />
    </Suspense>
  );
}

function UserProfile({ userId }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    useErrorBoundary: true, // Propagate errors to error boundary
  });

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

Error handling approaches:

* Component-level with `isError` and `error` properties
* Global error handlers with `queryCache.subscribe`
* Error boundaries with `useErrorBoundary: true`
* Custom retry logic with `retry` and `retryDelay`

## Real-World Patterns and Best Practices

### Type Safety with TypeScript

React Query works beautifully with TypeScript:

```tsx
// Define types for your data
interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

// Type the query function
const fetchUser = async (userId: string): Promise<User> => {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

// Use generics with useQuery
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery<User, Error>({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data) return null;

  // TypeScript knows data is User type here
  return (
    <div>
      <h1>{data.name}</h1>
      {data.role === 'admin' && <AdminPanel userId={data.id} />}
    </div>
  );
}
```

TypeScript benefits:

* Autocompletion for query results
* Type checking for mutation inputs
* Better error handling with typed errors
* Self-documenting code for data structures

### Testing React Query

Proper testing is essential for robust applications:

```jsx
// Example test with React Testing Library and Jest
import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from '../hooks/useUser';

// Mock fetch
global.fetch = jest.fn();

describe('useUser hook', () => {
  let queryClient;
  let wrapper;
  
  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();
  
    // Create new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
      },
    });
  
    // Create wrapper with provider
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });
  
  test('fetches and returns user data', async () => {
    // Mock successful response
    const mockUser = { id: '123', name: 'Test User' };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    });
  
    // Render the hook
    const { result, waitFor } = renderHook(
      () => useUser('123'), 
      { wrapper }
    );
  
    // Initially loading
    expect(result.current.isLoading).toBe(true);
  
    // Wait for query to complete
    await waitFor(() => result.current.isSuccess);
  
    // Check results
    expect(result.current.data).toEqual(mockUser);
    expect(global.fetch).toHaveBeenCalledWith('/api/users/123');
  });
  
  test('handles error states', async () => {
    // Mock error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
  
    // Render the hook
    const { result, waitFor } = renderHook(
      () => useUser('not-found'), 
      { wrapper }
    );
  
    // Wait for query to fail
    await waitFor(() => result.current.isError);
  
    // Check error state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeDefined();
  });
});
```

Testing techniques:

* Create a fresh QueryClient for each test
* Set `retry: false` to avoid long test runs
* Mock network requests
* Test loading, success, and error states
* Test cache interactions when needed

### Performance Optimization

Fine-tune for optimal performance:

```jsx
function PaginatedTable() {
  const [params, setParams] = useState({
    page: 1,
    perPage: 20,
    sort: 'name',
    filters: {},
  });
  
  // Use serialized params in query key
  const serializedParams = JSON.stringify(params);
  
  const { data, isLoading } = useQuery({
    queryKey: ['table-data', serializedParams],
    queryFn: () => fetchTableData(params),
    keepPreviousData: true,
  
    // Stabilize the fetchTableData function
    queryFn: React.useCallback(
      () => fetchTableData(params), 
      [serializedParams]
    ),
  });
  
  // Component code...
}
```

Performance optimizations:

* Properly structure query keys to avoid unnecessary refetching
* Use `keepPreviousData` for smoother UI transitions
* Memoize complex query functions with `useCallback`
* Configure appropriate `staleTime` for your data requirements
* Use `select` option to transform and filter results
* Enable `suspense` mode when using React Suspense

## Conclusion

React Query transforms how we manage server state in React applications by providing:

> React Query isn't merely a data-fetching library; it's a complete server-state management solution that handles the complex lifecycle of remote data in your React applications. By separating server state from client state and providing powerful abstractions, it dramatically simplifies one of the most challenging aspects of modern web development.

Key takeaways:

1. React Query separates server state from client state, recognizing their different natures
2. Declarative data fetching with `useQuery` simplifies component code
3. Powerful cache management reduces network requests
4. Mutations with optimistic updates create responsive UIs
5. Advanced patterns like pagination and infinite queries solve common challenges
6. Custom hooks encapsulate and reuse data fetching logic
7. Type safety with TypeScript improves developer experience

When implemented correctly, React Query leads to applications that are:

* More performant with proper caching
* More maintainable with centralized data management
* More responsive with optimistic updates
* More reliable with built-in error handling
* More scalable with modular data fetching patterns

The true power of React Query lies in how it allows you to focus on building features rather than managing the complex lifecycle of remote data.
