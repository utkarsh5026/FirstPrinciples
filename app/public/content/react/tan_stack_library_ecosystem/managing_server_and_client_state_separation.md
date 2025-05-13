# Managing Server and Client State Separation in TanStack

Let me explain how to effectively separate server and client state when using TanStack Query (formerly React Query). I'll build this explanation from first principles, walking through the fundamental concepts, practical implementations, and the reasoning behind state separation.

## First Principles: What Is State?

> State is simply data that changes over time. It represents the condition of our application at any given moment.

To understand state management properly, we need to recognize that not all state is created equal. Some state originates from the server, while other state exists purely on the client.

### Two Fundamental Types of State

1. **Server State** : Data that resides on remote servers which you fetch, update or delete through API calls.
2. **Client State** : Data that only exists in the browser memory and is managed locally.

## Why Separate Server and Client State?

The separation isn't arbitrary—it addresses fundamentally different concerns:

> Server state is asynchronous, shared, and often requires caching strategies. Client state is synchronous, private to the user's session, and doesn't typically need complex caching logic.

Let's explore key differences that make this separation valuable:

| Characteristic | Server State                    | Client State            |
| -------------- | ------------------------------- | ----------------------- |
| Origin         | Remote server                   | Local browser           |
| Persistence    | Persists beyond browser session | Temporary by default    |
| Ownership      | Shared among users              | Private to current user |
| Access Pattern | Asynchronous (fetch/update)     | Synchronous (immediate) |
| Staleness      | Can become stale                | Always fresh            |
| Caching needs  | Complex                         | Simple or none          |

## TanStack Query for Server State

TanStack Query is specifically designed to handle server state. Let's look at its approach from first principles.

### The Problem TanStack Query Solves

Traditional approaches to handling server state often involve:

1. Creating loading states manually
2. Managing error states separately
3. Implementing custom caching logic
4. Handling refetching and invalidation

TanStack Query takes a declarative approach to these challenges.

### Basic Example: Fetching Data

```jsx
import { useQuery } from '@tanstack/react-query';

// This function fetches data from the server
const fetchTodos = async () => {
  const response = await fetch('https://api.example.com/todos');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

function TodoList() {
  // useQuery manages the server state for us
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

In this example:

* `useQuery` manages the entire lifecycle of the server request
* `queryKey` uniquely identifies this query for caching
* `queryFn` is the function that fetches the data
* The hook returns useful state variables (data, isLoading, error)

## Client State Management

For client state, TanStack suggests using simpler tools like React's built-in state hooks or lightweight state managers.

### Example: Managing Client State with useState

```jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

function TodoApp() {
  // Client state: UI state for the form
  const [newTodoText, setNewTodoText] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Server state: Todo data from the API
  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos
  });
  
  // Filtered todos (derived from server state + client state)
  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });
  
  return (
    <div>
      <input 
        value={newTodoText} 
        onChange={e => setNewTodoText(e.target.value)} 
        placeholder="Add todo"
      />
    
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('active')}>Active</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
      </div>
    
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

In this example:

* `newTodoText` and `filter` are client state (managed with useState)
* `todos` is server state (managed with useQuery)
* `filteredTodos` is derived state (computed from both)

## Mutating Server State

TanStack Query provides a dedicated hook for server mutations: `useMutation`.

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function TodoApp() {
  const [newTodoText, setNewTodoText] = useState('');
  const queryClient = useQueryClient();
  
  // Query for fetching todos
  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos
  });
  
  // Mutation for adding a new todo
  const addTodoMutation = useMutation({
    mutationFn: (newTodo) => {
      return fetch('https://api.example.com/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      }).then(res => res.json());
    },
    onSuccess: () => {
      // Invalidate the todos query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      // Reset client state
      setNewTodoText('');
    }
  });
  
  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
  
    addTodoMutation.mutate({
      title: newTodoText,
      completed: false
    });
  };
  
  return (
    <div>
      <div>
        <input 
          value={newTodoText} 
          onChange={e => setNewTodoText(e.target.value)} 
          placeholder="Add todo"
        />
        <button 
          onClick={handleAddTodo}
          disabled={addTodoMutation.isPending}
        >
          {addTodoMutation.isPending ? 'Adding...' : 'Add Todo'}
        </button>
      </div>
    
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

In this example:

* `useMutation` handles the POST request logic
* `onSuccess` callback invalidates the query cache
* Client state (`newTodoText`) is managed separately from the mutation logic

## Optimistic Updates: Bridging Client and Server State

Optimistic updates show how client and server state can work together:

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function TodoList() {
  const queryClient = useQueryClient();
  
  // Server state: Todo data
  const { data: todos = [] } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos
  });
  
  // Mutation with optimistic update
  const toggleTodoMutation = useMutation({
    mutationFn: (todoId) => {
      const todo = todos.find(t => t.id === todoId);
      return fetch(`https://api.example.com/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      }).then(res => res.json());
    },
    // Here's where we temporarily update the client cache
    onMutate: async (todoId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['todos'] });
    
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(['todos']);
    
      // Optimistically update the cache with the new value
      queryClient.setQueryData(['todos'], old => 
        old.map(todo => 
          todo.id === todoId 
            ? { ...todo, completed: !todo.completed } 
            : todo
        )
      );
    
      // Return a context object with the previous value
      return { previousTodos };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, todoId, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    }
  });
  
  return (
    <ul>
      {todos.map(todo => (
        <li 
          key={todo.id}
          style={{ 
            textDecoration: todo.completed ? 'line-through' : 'none',
            opacity: todo.completed ? 0.5 : 1 
          }}
          onClick={() => toggleTodoMutation.mutate(todo.id)}
        >
          {todo.title}
        </li>
      ))}
    </ul>
  );
}
```

This example demonstrates:

* Temporarily updating client-side cache (optimistic update)
* Rolling back if the server request fails
* Refreshing data after the mutation completes

## Advanced Patterns for State Separation

### 1. Custom Hooks for Server State

Creating custom hooks helps encapsulate server state logic:

```jsx
// Custom hook for todo-related server state
function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });
}

// Custom hook for a single todo
function useTodo(id) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchTodoById(id),
    enabled: !!id // Only run the query if we have an ID
  });
}

// Usage in component
function TodoDetail({ id }) {
  const { data: todo, isLoading } = useTodo(id);
  // Rest of component...
}
```

### 2. Structuring Server State with React Context

For application-wide server state, combine TanStack Query with React Context:

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

// Provide the client at the root
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}
```

### 3. Managing Related Server State

TanStack Query handles related server state through query key structure:

```jsx
// Get all projects
const { data: projects } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects
});

// Get tasks for a specific project
const { data: tasks } = useQuery({
  queryKey: ['projects', projectId, 'tasks'],
  queryFn: () => fetchTasksForProject(projectId),
  enabled: !!projectId
});

// When we update a task, we can invalidate just that project's tasks
const updateTaskMutation = useMutation({
  mutationFn: updateTask,
  onSuccess: (data) => {
    queryClient.invalidateQueries({ 
      queryKey: ['projects', data.projectId, 'tasks'] 
    });
  }
});
```

## Handling Complex Client State

While TanStack Query handles server state, you might need more tools for complex client state:

```jsx
import { useState } from 'react';
import { create } from 'zustand';

// Create a store for complex UI state
const useUIStore = create((set) => ({
  sidebarOpen: false,
  theme: 'light',
  notifications: [],
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  addNotification: (notification) => set(state => ({ 
    notifications: [...state.notifications, notification] 
  })),
  dismissNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));

function AppShell() {
  // Complex client state from Zustand
  const { 
    sidebarOpen, 
    theme, 
    notifications,
    toggleSidebar, 
    dismissNotification 
  } = useUIStore();
  
  // Simple component-level state with useState
  const [searchQuery, setSearchQuery] = useState('');
  
  // Server state with TanStack Query
  const { data: user } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchUserProfile
  });
  
  return (
    <div className={`app-shell theme-${theme}`}>
      <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
      <main>
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
        />
        {user && <UserProfile user={user} />}
        <NotificationPanel 
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </main>
    </div>
  );
}
```

This example shows:

* Using Zustand for complex, application-wide client state
* Keeping simple UI state with React's useState
* Separating server state with TanStack Query

## Common Patterns and Best Practices

### 1. Prefetching Server State

```jsx
function ProjectList() {
  const queryClient = useQueryClient();
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });
  
  // Prefetch tasks when hovering over a project
  const prefetchTasks = (projectId) => {
    queryClient.prefetchQuery({
      queryKey: ['projects', projectId, 'tasks'],
      queryFn: () => fetchTasksForProject(projectId)
    });
  };
  
  return (
    <ul>
      {projects?.map(project => (
        <li 
          key={project.id}
          onMouseEnter={() => prefetchTasks(project.id)}
        >
          <Link to={`/projects/${project.id}`}>
            {project.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

### 2. Dependent Queries

```jsx
function UserProjects() {
  // First query to get the user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser
  });
  
  // Second query depends on the first one
  const { data: projects } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: () => fetchUserProjects(user.id),
    enabled: !!user?.id // Only run if we have a user ID
  });
  
  return (
    <div>
      {user && <h1>{user.name}'s Projects</h1>}
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### 3. Infinite Queries for Pagination

```jsx
import { useInfiniteQuery } from '@tanstack/react-query';

function InfiniteProjectList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['projects', 'infinite'],
    queryFn: ({ pageParam = 1 }) => fetchProjects(pageParam),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.nextPage || undefined;
    }
  });
  
  return (
    <div>
      {data?.pages.map((page, i) => (
        <React.Fragment key={i}>
          {page.projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </React.Fragment>
      ))}
    
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
            ? 'Load more'
            : 'Nothing more to load'}
      </button>
    </div>
  );
}
```

## Why This Separation Matters: Real Benefits

> Separating server and client state leads to more maintainable, performant, and predictable applications.

1. **Reduced Complexity** : Each type of state is managed by tools optimized for its unique characteristics.
2. **Improved Performance** :

* Automatic refetching and caching for server state
* Lightweight updates for client state

1. **Better Developer Experience** :

* Clear mental model of where data lives
* Standardized patterns for data fetching and updates

1. **Enhanced User Experience** :

* Faster UI updates with optimistic updates
* More responsive interfaces with cached data
* Better error handling

## Common Pitfalls to Avoid

1. **Over-relying on Server State** :

```jsx
   // ❌ Bad: Using server state for temporary UI state
   const { data, refetch } = useQuery({
     queryKey: ['ui', 'modal-open'],
     queryFn: () => false
   });

   // ✅ Good: Using client state for UI elements
   const [isModalOpen, setIsModalOpen] = useState(false);
```

1. **Mixing State Types** :

```jsx
   // ❌ Bad: Mixing server data with UI state
   const [todos, setTodos] = useState([]);

   useEffect(() => {
     fetch('/api/todos')
       .then(res => res.json())
       .then(data => setTodos(data));
   }, []);

   // ✅ Good: Keeping state separated
   const { data: todos } = useQuery({
     queryKey: ['todos'],
     queryFn: fetchTodos
   });
   const [selectedTodoId, setSelectedTodoId] = useState(null);
```

1. **Unnecessary Refetching** :

```jsx
   // ❌ Bad: Setting staleTime too low
   const { data } = useQuery({
     queryKey: ['user-profile'],
     queryFn: fetchUserProfile,
     staleTime: 0 // Will refetch on every focus
   });

   // ✅ Good: Setting appropriate staleTime
   const { data } = useQuery({
     queryKey: ['user-profile'],
     queryFn: fetchUserProfile,
     staleTime: 1000 * 60 * 5 // 5 minutes - profile doesn't change often
   });
```

## Conclusion

The separation of server and client state in TanStack is not simply a technical implementation detail—it's a fundamental architectural pattern that aligns with the reality of modern web applications. By treating these two types of state differently and using tools optimized for each, you create applications that are both easier to build and more delightful to use.

Remember these key principles:

> 1. Server state is shared, asynchronous, and potentially stale.
> 2. Client state is private, synchronous, and always fresh.
> 3. TanStack Query excels at server state with its declarative approach.
> 4. React's built-in hooks or lightweight state managers work well for client state.

With these concepts firmly understood, you can build applications that handle both server and client state elegantly, resulting in more maintainable and performant code.
