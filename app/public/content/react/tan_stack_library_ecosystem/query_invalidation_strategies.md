# Query Invalidation Strategies in TanStack Query

I'll explain query invalidation strategies in TanStack Query (formerly React Query) from first principles, breaking down how the library manages data, why invalidation is necessary, and the various approaches to implementing it effectively.

## The Foundation: Understanding the Problem

> Data fetching and caching are fundamental challenges in frontend applications. Without a proper strategy, applications can display stale data, make redundant network requests, or create inconsistent user experiences.

Let's start with a simple mental model: Imagine your application as a library. Each piece of data you fetch from a server is like a book on a shelf. When data changes on the server, your "books" become outdated. Query invalidation is the process of marking these books as "needs updating" and fetching fresh copies when appropriate.

## What is TanStack Query?

TanStack Query is a data fetching and state management library that handles:

1. Fetching data from servers
2. Caching responses
3. Updating stale data
4. Synchronizing server state with UI

It works across various frameworks (React, Vue, Svelte, Solid) but we'll focus on the core concepts that apply to all implementations.

## Core Concepts of the Query Cache

Before understanding invalidation, we need to grasp how TanStack Query organizes its cache:

### Query Keys

Each query is identified by a unique "query key" - typically an array that describes the data.

```javascript
// A simple query key for user data
const userKey = ['user', userId]

// A more complex query key for filtered todos
const todosKey = ['todos', { status: 'active', userId: 1 }]
```

Query keys are critical because they determine how queries are grouped, matched, and invalidated. Think of them as the "address" for where data is stored in the cache.

### Query States

Each query in the cache can be in several states:

* **Fresh** : Recently fetched data that's considered up-to-date
* **Stale** : Data that might need refreshing soon
* **Fetching** : Currently being requested from the server
* **Inactive** : Not being used by any components currently
* **Error** : Failed to fetch

Understanding these states is crucial because invalidation primarily works by manipulating them.

## What is Query Invalidation?

Query invalidation is the process of marking cached data as stale and triggering a refetch. It's like telling your application, "This data might be outdated, you should check for updates."

Let's see a basic example:

```javascript
// Example of using TanStack Query
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Component that displays a user profile
function UserProfile({ userId }) {
  // QueryClient provides methods for cache manipulation
  const queryClient = useQueryClient();
  
  // This query fetches user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserFromAPI(userId),
  });
  
  // Function to handle when user data is updated
  const handleUserUpdate = () => {
    // This invalidates the specific user query
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={handleUserUpdate}>Refresh User Data</button>
    </div>
  );
}
```

In this example, when the button is clicked, the `invalidateQueries` method marks the user data as stale and triggers a refetch.

## Query Invalidation Strategies

Now let's explore the various strategies for invalidation, starting with the most basic and moving to more advanced patterns.

### 1. Direct Invalidation

The simplest strategy is to directly invalidate a specific query:

```javascript
// Invalidate a specific user query
queryClient.invalidateQueries({ queryKey: ['user', 5] });
```

This marks the specific query as stale and triggers a refetch if the query is currently being rendered.

### 2. Partial Key Matching

TanStack Query supports partial key matching, allowing you to invalidate groups of related queries:

```javascript
// Invalidate ALL user queries
queryClient.invalidateQueries({ queryKey: ['user'] });

// Invalidate queries for a specific type of users
queryClient.invalidateQueries({ 
  queryKey: ['user'], 
  predicate: (query) => query.queryKey[1]?.role === 'admin' 
});
```

> The ability to invalidate groups of queries based on shared key segments is incredibly powerful, as it allows you to update related data efficiently without having to track every query individually.

Let's see an example of how this works in practice:

```javascript
// Imagine you have these active queries in your application:
// ['user', 1, 'profile']
// ['user', 1, 'settings']
// ['user', 2, 'profile']
// ['todos', { userId: 1 }]

// This would invalidate the first three queries
queryClient.invalidateQueries({ queryKey: ['user'] });

// This would invalidate only the first two queries
queryClient.invalidateQueries({ queryKey: ['user', 1] });
```

### 3. Predicate-Based Invalidation

For more complex scenarios, you can use a predicate function to determine which queries to invalidate:

```javascript
// Invalidate all queries related to a specific user ID across features
queryClient.invalidateQueries({
  predicate: (query) => {
    // Check if this is a user query
    if (query.queryKey[0] === 'user' && query.queryKey[1] === userId) {
      return true;
    }
  
    // Check if this is a todos query for the user
    if (query.queryKey[0] === 'todos' && query.queryKey[1]?.userId === userId) {
      return true;
    }
  
    return false;
  },
});
```

This approach gives you fine-grained control over which queries are invalidated.

### 4. Mutation-Based Invalidation

One of the most common invalidation strategies is to invalidate queries after mutations (data changes):

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function UserForm({ userId }) {
  const queryClient = useQueryClient();
  
  const updateUserMutation = useMutation({
    mutationFn: (userData) => updateUserOnServer(userId, userData),
  
    // The onSuccess callback runs after the mutation succeeds
    onSuccess: (newUserData) => {
      // Invalidate and refetch the user query
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    
      // Also invalidate any todos for this user
      queryClient.invalidateQueries({ queryKey: ['todos', { userId }] });
    },
  });
  
  const handleSubmit = (formData) => {
    updateUserMutation.mutate(formData);
  };
  
  // Rest of component...
}
```

This pattern ensures your UI updates automatically whenever you change data on the server.

### 5. Optimistic Updates with Selective Invalidation

For a better user experience, you can combine optimistic updates with selective invalidation:

```javascript
const addTodoMutation = useMutation({
  mutationFn: (newTodo) => addTodoToServer(newTodo),
  
  // Optimistically update the cache before the server responds
  onMutate: async (newTodo) => {
    // Cancel any outgoing refetches to avoid overwriting our optimistic update
    await queryClient.cancelQueries({ queryKey: ['todos'] });
  
    // Snapshot the previous value
    const previousTodos = queryClient.getQueryData(['todos']);
  
    // Optimistically update the cache
    queryClient.setQueryData(['todos'], (old) => [...old, { ...newTodo, id: 'temp-id' }]);
  
    // Return the snapshot so we can rollback if something goes wrong
    return { previousTodos };
  },
  
  // If the mutation fails, roll back the optimistic update
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  
  // After success or failure, invalidate to get fresh data
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

This approach provides immediate feedback to users while ensuring data consistency.

### 6. Scheduled Invalidation

TanStack Query also supports refetching and invalidation on a schedule:

```javascript
// This query will automatically become stale after 10 seconds
const { data } = useQuery({
  queryKey: ['prices'],
  queryFn: fetchStockPrices,
  staleTime: 10 * 1000, // 10 seconds
  refetchInterval: 60 * 1000, // Refetch every minute
});
```

Unlike manual invalidation, this approach is time-based and happens automatically.

## Advanced Query Invalidation Patterns

Let's explore some more sophisticated patterns for real-world applications.

### 1. Custom Hooks for Related Data

Creating custom hooks that handle invalidation across related entities:

```javascript
function usePostWithComments(postId) {
  const queryClient = useQueryClient();
  
  // Query for the post
  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  });
  
  // Query for the comments
  const commentsQuery = useQuery({
    queryKey: ['post', postId, 'comments'],
    queryFn: () => fetchComments(postId),
  });
  
  // Mutation to add a comment
  const addCommentMutation = useMutation({
    mutationFn: (comment) => addComment(postId, comment),
    onSuccess: () => {
      // Only invalidate the comments query, not the post itself
      queryClient.invalidateQueries({ 
        queryKey: ['post', postId, 'comments'] 
      });
    
      // Update the post's comment count without a refetch
      queryClient.setQueryData(['post', postId], (old) => ({
        ...old,
        commentCount: old.commentCount + 1,
      }));
    },
  });
  
  return {
    post: postQuery.data,
    comments: commentsQuery.data,
    addComment: addCommentMutation.mutate,
    isLoading: postQuery.isLoading || commentsQuery.isLoading,
  };
}
```

This pattern encapsulates the data fetching logic and invalidation strategy in a reusable hook.

### 2. Selective Refetching with Exact Matching

Sometimes you want to be more precise with invalidation:

```javascript
// This will ONLY invalidate the exact query, not any related ones
queryClient.invalidateQueries({ 
  queryKey: ['user', userId, 'profile'],
  exact: true 
});
```

The `exact: true` option prevents partial key matching, giving you more control over invalidation scope.

### 3. Conditional Refetching

You can control whether invalidation triggers an immediate refetch:

```javascript
// Mark queries as stale but don't refetch yet
queryClient.invalidateQueries({ 
  queryKey: ['user'], 
  refetchType: 'none' 
});

// Later, perhaps after a user interaction:
queryClient.refetchQueries({ queryKey: ['user'] });
```

This lets you decouple invalidation (marking as stale) from refetching (getting fresh data).

## Practical Implementation Example

Let's build a more complete example of a todo application with various invalidation strategies:

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API functions (would be in a separate file)
const fetchTodos = () => fetch('/api/todos').then(r => r.json());
const fetchTodoById = (id) => fetch(`/api/todos/${id}`).then(r => r.json());
const addTodo = (todo) => fetch('/api/todos', {
  method: 'POST',
  body: JSON.stringify(todo),
}).then(r => r.json());
const updateTodo = ({ id, ...data }) => fetch(`/api/todos/${id}`, {
  method: 'PATCH',
  body: JSON.stringify(data),
}).then(r => r.json());
const deleteTodo = (id) => fetch(`/api/todos/${id}`, {
  method: 'DELETE',
}).then(r => r.json());

// Custom hook for todos management
function useTodos() {
  const queryClient = useQueryClient();
  
  // Query for all todos
  const todosQuery = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });
  
  // Mutation to add a todo
  const addTodoMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: (newTodo) => {
      // Option 1: Invalidate and refetch the todos query
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    
      // Option 2: Update the cache directly (optimistic update)
      // queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);
    },
  });
  
  // Mutation to update a todo
  const updateTodoMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: (updatedTodo) => {
      // Invalidate the specific todo and the list
      queryClient.invalidateQueries({ 
        queryKey: ['todo', updatedTodo.id] 
      });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
  
  // Mutation to delete a todo
  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: (_, deletedId) => {
      // Remove the specific todo from cache
      queryClient.removeQueries({ queryKey: ['todo', deletedId] });
    
      // Update the todos list in the cache
      queryClient.setQueryData(['todos'], (old) => 
        old.filter(todo => todo.id !== deletedId)
      );
    },
  });
  
  return {
    todos: todosQuery.data || [],
    isLoading: todosQuery.isLoading,
    addTodo: addTodoMutation.mutate,
    updateTodo: updateTodoMutation.mutate,
    deleteTodo: deleteTodoMutation.mutate,
  };
}

// Component using our custom hook
function TodoApp() {
  const { 
    todos, 
    isLoading, 
    addTodo, 
    updateTodo, 
    deleteTodo 
  } = useTodos();
  
  // Component logic...
}
```

This example demonstrates multiple invalidation approaches in a single application:

1. Simple invalidation after adding a todo
2. Multi-query invalidation after updates
3. Direct cache manipulation after deletion

## Common Pitfalls and Solutions

### 1. Over-invalidation

 **Problem** : Invalidating too many queries can lead to excessive refetching.

 **Solution** : Be more precise with your query keys and use `exact: true` when appropriate.

```javascript
// Instead of this (invalidates ALL user-related queries)
queryClient.invalidateQueries({ queryKey: ['user'] });

// Do this (only invalidates the specific user's data)
queryClient.invalidateQueries({ queryKey: ['user', userId] });

// Or even more specific
queryClient.invalidateQueries({ 
  queryKey: ['user', userId, 'profile'],
  exact: true 
});
```

### 2. Missing Invalidation

 **Problem** : Forgetting to invalidate related queries can lead to stale data.

 **Solution** : Create mutation hooks that handle invalidation systematically.

```javascript
// A reusable mutation hook that handles invalidation
function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (updatedUser) => {
      // Invalidate the specific user
      queryClient.invalidateQueries({ 
        queryKey: ['user', updatedUser.id] 
      });
    
      // Also invalidate any dependent data
      queryClient.invalidateQueries({ 
        queryKey: ['user', updatedUser.id, 'posts'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['user', updatedUser.id, 'settings'] 
      });
    },
  });
}
```

### 3. Race Conditions

 **Problem** : Multiple invalidations happening close together can cause flickering or inconsistent UIs.

 **Solution** : Use the query client's synchronization methods:

```javascript
async function handleBulkUpdate() {
  // Begin a batch update
  await queryClient.cancelQueries({ queryKey: ['data'] });
  
  // Make multiple cache updates
  queryClient.setQueryData(['data', 'part1'], newData1);
  queryClient.setQueryData(['data', 'part2'], newData2);
  
  // After all updates are complete, invalidate everything
  queryClient.invalidateQueries({ queryKey: ['data'] });
}
```

## Real-World Considerations

### Performance Optimization

For large applications, consider these performance optimizations:

1. **Selective refetching** : Use `refetchType: 'inactive'` to only refetch queries that are not currently in use.
2. **Cache time management** : Adjust `staleTime` and `cacheTime` based on how frequently your data changes.

```javascript
// Data that changes rarely
const { data: settings } = useQuery({
  queryKey: ['settings'],
  queryFn: fetchSettings,
  staleTime: 1000 * 60 * 60, // 1 hour
});

// Real-time data
const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  staleTime: 1000 * 5, // 5 seconds
  refetchInterval: 1000 * 10, // 10 seconds
});
```

### Testing Invalidation Strategies

When testing invalidation strategies, focus on verifying:

1. Queries are properly invalidated after mutations
2. The UI reflects updated data
3. No excessive network requests occur

```javascript
// Example test for invalidation (using Jest)
test('should invalidate user data after update', async () => {
  // Mock API responses
  server.use(
    rest.get('/api/user/1', (req, res, ctx) => {
      return res(ctx.json({ id: 1, name: 'Original Name' }));
    }),
    rest.patch('/api/user/1', (req, res, ctx) => {
      return res(ctx.json({ id: 1, name: 'Updated Name' }));
    })
  );
  
  // Setup component with query client
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <UserProfile userId={1} />
    </QueryClientProvider>
  );
  
  // Wait for initial data to load
  await screen.findByText('Original Name');
  
  // Trigger update
  fireEvent.click(screen.getByText('Edit'));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Updated Name' }
  });
  fireEvent.click(screen.getByText('Save'));
  
  // Verify data was invalidated and refetched
  await screen.findByText('Updated Name');
  
  // Check that the query was invalidated
  const queries = queryClient.getQueryCache().findAll(['user', '1']);
  expect(queries[0].state.isInvalidated).toBe(false); // After refetch, it's fresh again
});
```

## Summary and Best Practices

Let's summarize the key points about query invalidation in TanStack Query:

> Query invalidation is the process of marking cached data as stale, triggering refetches to ensure your application displays the most current data from your server.

### Best Practices:

1. **Use meaningful, structured query keys** that reflect your data relationships
   ```javascript
   ['entity', id, 'relation'] // e.g. ['user', 5, 'posts']
   ```
2. **Pair mutations with appropriate invalidations** to keep your UI in sync
   ```javascript
   // After creating a post for a user
   queryClient.invalidateQueries({ queryKey: ['user', userId, 'posts'] });
   ```
3. **Consider the scope of invalidation** - be as precise as possible
   ```javascript
   // When to use broad invalidation
   queryClient.invalidateQueries({ queryKey: ['user'] }); // All user data

   // When to use narrow invalidation
   queryClient.invalidateQueries({ 
     queryKey: ['user', userId, 'profile'], 
     exact: true 
   });
   ```
4. **Balance optimistic updates with server validation**
   ```javascript
   // Optimistic update for immediate UI response
   queryClient.setQueryData(['todos'], old => [...old, newTodo]);

   // But still invalidate after the server responds to ensure consistency
   queryClient.invalidateQueries({ queryKey: ['todos'] });
   ```
5. **Use custom hooks to encapsulate fetching and invalidation logic**
   ```javascript
   // Create entity-specific hooks with consistent invalidation patterns
   function useUserData(userId) {
     // ...fetching and invalidation logic
   }
   ```

By understanding these invalidation strategies and applying them appropriately, you can build applications with TanStack Query that are responsive, efficient, and provide a great user experience with consistently fresh data.
