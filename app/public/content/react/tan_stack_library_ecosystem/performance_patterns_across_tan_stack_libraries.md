# Performance Patterns Across TanStack Libraries: A First Principles Approach

I'll explain the performance patterns that span across TanStack libraries (React Query, React Table, React Charts, etc.) from first principles, focusing on the core ideas that make these libraries so efficient.

## What is TanStack?

Before diving into performance patterns, let's understand what TanStack is.

> TanStack is a collection of JavaScript libraries created by Tanner Linsley that share common architectural and performance principles. The libraries include React Query, React Table, React Charts, React Form, React Virtual, and more. While initially built for React, many of these libraries now support other frameworks like Vue, Svelte, and Solid.

## First Principle: Separation of Concerns

At the heart of TanStack libraries is a clear separation between:

1. **State management** - How data is stored and updated
2. **UI rendering** - How the data is displayed
3. **Core logic** - The business rules that operate on the data

This separation allows for optimized performance in each area. Let's see how this works in practice:

```javascript
// React Query example showing separation of concerns
import { useQuery } from '@tanstack/react-query';

// Data fetching logic (separated from UI)
const fetchTodos = async () => {
  const response = await fetch('/api/todos');
  return response.json();
};

function TodoList() {
  // State management handled by React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos
  });
  
  // UI rendering separated from data management
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

This separation means that when data changes, only the necessary UI elements re-render, not the entire component tree. The core logic remains stable and doesn't need to re-execute.

## Second Principle: Derivation Over Mutation

TanStack libraries prefer to derive state rather than mutate it directly. This leads to more predictable applications and better performance.

> When state is derived rather than mutated, it becomes easier to reason about your application and reduces the complexity of state management. This approach also makes applications more deterministic and easier to debug.

Example with React Table:

```javascript
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

function MyTable({ data }) {
  // Table state is derived from data props
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  // The table UI is derived from the table state
  return (
    <table>
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id}>
                {header.isPlaceholder ? null : 
                  header.renderHeader()}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id}>
                {cell.renderCell()}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

In the example above, the table state is derived from the input data, and the UI is derived from the table state. There's no direct mutation of state, making the code more predictable and performant.

## Third Principle: Memoization

TanStack libraries make heavy use of memoization to prevent unnecessary recalculations and re-renders.

> Memoization is a technique where the results of expensive function calls are cached, and the cached result is returned when the same inputs occur again. This significantly improves performance by avoiding redundant calculations.

Here's how it works in practice:

```javascript
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

function ExpensiveCalculation({ data }) {
  // Data fetching with React Query (already memoized internally)
  const { data: queryData } = useQuery({
    queryKey: ['someData'],
    queryFn: fetchData
  });
  
  // Additional memoization for derived state
  const processedData = useMemo(() => {
    // This expensive calculation only runs when queryData changes
    return queryData?.map(item => ({
      ...item,
      computed: complexCalculation(item.value)
    }));
  }, [queryData]);
  
  return (
    <div>
      {/* UI renders from memoized data */}
      {processedData?.map(item => (
        <div key={item.id}>{item.computed}</div>
      ))}
    </div>
  );
}
```

TanStack libraries internally use memoization to optimize performance. For instance, React Query memoizes query results, and React Table memoizes row models. This prevents unnecessary recalculations when the underlying data hasn't changed.

## Fourth Principle: Virtualization

Many TanStack libraries incorporate virtualization, which is the technique of only rendering what's visible to the user.

> Virtualization means rendering only the elements that are currently in the viewport, not the entire dataset. This dramatically reduces the number of DOM nodes and improves rendering performance, especially for large datasets.

Here's a simplified example with React Virtual:

```javascript
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  
  // Set up virtualization
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // estimate row height
  });
  
  return (
    <div 
      ref={parentRef}
      style={{ height: '400px', overflow: 'auto' }}
    >
      {/* Create a container with the total size */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Only render visible items */}
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

In this example, even if `items` contains thousands of elements, only the visible ones are actually rendered to the DOM, dramatically improving performance.

## Fifth Principle: Declarative APIs

TanStack libraries use declarative APIs that focus on **what** should happen rather than **how** it should happen.

> Declarative programming describes the desired result without explicitly listing the steps to achieve it. This approach makes code more readable and allows the library to internally optimize the implementation details.

Consider this React Table example:

```javascript
import { 
  useReactTable, 
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel 
} from '@tanstack/react-table';

function SortableFilterableTable({ data }) {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState('');
  
  // Declarative API - we declare what we want
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: filtering,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
    // These getter functions declaratively specify capabilities
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  // Render table...
}
```

By declaring what we want (sorting, filtering) rather than how to implement it, we allow the library to optimize the internal implementation. The library can batch operations, memoize results, and apply other performance optimizations transparent to the developer.

## Sixth Principle: Stale-While-Revalidate Pattern

Most notably used in React Query, this pattern keeps the UI responsive while fetching fresh data.

> The Stale-While-Revalidate pattern means showing stale (old) data to the user immediately while fetching fresh data in the background. Once the fresh data arrives, the UI updates. This creates a much more responsive user experience.

Here's how it works:

```javascript
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserData(userId),
    // Configure stale time (how long data is considered fresh)
    staleTime: 60 * 1000, // 1 minute
    // Keep showing previous data while fetching new data
    keepPreviousData: true,
  });
  
  return (
    <div>
      {/* Show the user data immediately (even if stale) */}
      {data && (
        <div>
          <h1>{data.name}</h1>
          <p>{data.email}</p>
        </div>
      )}
    
      {/* Indicate that an update is happening in the background */}
      {isFetching && !isLoading && (
        <div>Refreshing...</div>
      )}
    
      {/* Show loading only on initial load */}
      {isLoading && (
        <div>Loading...</div>
      )}
    </div>
  );
}
```

This pattern greatly improves perceived performance because users see content immediately rather than waiting for fresh data to load.

## Seventh Principle: Deferred Execution

TanStack libraries often defer heavy computations until they're actually needed.

> Deferred execution means postponing expensive operations until the moment they're required. This prevents wasting computational resources on tasks that might never be needed.

For example, in React Table:

```javascript
import { 
  useReactTable, 
  getCoreRowModel,
  getExpandedRowModel 
} from '@tanstack/react-table';

function ExpandableTable({ data }) {
  const [expanded, setExpanded] = useState({});
  
  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    // This model only calculates when there's something expanded
    getExpandedRowModel: getExpandedRowModel(),
  });
  
  // Render table...
}
```

In this example, the expensive expanded row calculations only happen when there are actual expanded rows. If nothing is expanded, those calculations are deferred.

## Eighth Principle: Structural Sharing

When updating state, TanStack libraries preserve the identity of unchanged parts of the data.

> Structural sharing means reusing parts of the previous state that haven't changed, rather than creating entirely new objects. This reduces memory usage and improves performance by minimizing the number of components that need to re-render.

While this happens internally in most TanStack libraries, here's a simplified example that demonstrates the concept:

```javascript
function updateNestedState(state, path, value) {
  // Create a copy of the state
  const newState = { ...state };
  
  // Navigate through the path, creating new objects only where needed
  let current = newState;
  const pathArray = path.split('.');
  
  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i];
    // Create a new object only for this branch of the tree
    current[key] = { ...current[key] };
    current = current[key];
  }
  
  // Set the value at the final location
  current[pathArray[pathArray.length - 1]] = value;
  
  return newState;
}

// Example usage
const originalState = {
  users: {
    alice: { name: 'Alice', age: 30 },
    bob: { name: 'Bob', age: 25 }
  }
};

// Update Bob's age
const newState = updateNestedState(originalState, 'users.bob.age', 26);

// The alice object is the same reference as in the original state
console.log(originalState.users.alice === newState.users.alice); // true
```

TanStack libraries apply this principle internally to ensure efficient state updates and minimize unnecessary re-renders.

## Ninth Principle: Framework Agnosticism

TanStack libraries are designed to be framework-agnostic, with adapters for different frameworks.

> By implementing the core logic independent of any specific UI framework, TanStack libraries can work efficiently across React, Vue, Svelte, and others. This also means the performance patterns are consistent regardless of the framework you use.

Here's how it looks with a React Query example in two different frameworks:

```javascript
// React version
import { useQuery } from '@tanstack/react-query';

function ReactComponent() {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos
  });
  
  return (
    <div>
      {data?.map(todo => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </div>
  );
}

// Vue version
import { useQuery } from '@tanstack/vue-query';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    const { data } = useQuery({
      queryKey: ['todos'],
      queryFn: fetchTodos
    });
  
    return { data };
  },
  template: `
    <div>
      <div v-for="todo in data" :key="todo.id">
        {{ todo.title }}
      </div>
    </div>
  `
});
```

The core query logic remains the same, while only the framework-specific parts differ.

## Tenth Principle: Progressive Enhancement

TanStack libraries follow a progressive enhancement approach, starting with basic functionality and adding complexity only when needed.

> Progressive enhancement means starting with a simple, functional core and adding advanced features incrementally. This keeps the default performance high and only adds overhead when explicitly requested.

For example, in React Table:

```javascript
import { 
  useReactTable, 
  getCoreRowModel,
  // Optional enhancements
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel 
} from '@tanstack/react-table';

function ProgressiveTable({ data }) {
  const table = useReactTable({
    data,
    columns,
    // Core functionality - always included
    getCoreRowModel: getCoreRowModel(),
  
    // Optional enhancements - only added when needed
    ...(needsSorting && {
      getSortedRowModel: getSortedRowModel(),
    }),
    ...(needsFiltering && {
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(needsPagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
  });
  
  // Render table...
}
```

By only including the features you actually need, your application remains performant without unnecessary overhead.

## Putting It All Together: Real-World Example

Let's combine these principles in a more complete example using React Query and React Table together:

```javascript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender 
} from '@tanstack/react-table';

// Separation of concerns - data fetching logic
const fetchUsers = async () => {
  const response = await fetch('/api/users');
  return response.json();
};

function UserTable() {
  // State management
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  // Data fetching with stale-while-revalidate pattern
  const { data = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Memoization and derivation over mutation
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: info => new Date(info.getValue()).toLocaleString(),
    },
  ], []);
  
  // Declarative API and progressive enhancement
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: filtering,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
    onPaginationChange: setPagination,
    // Core functionality
    getCoreRowModel: getCoreRowModel(),
    // Progressive enhancements
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {/* Search filter */}
      <input
        value={filtering}
        onChange={e => setFiltering(e.target.value)}
        placeholder="Search all columns..."
      />
    
      {/* Table UI derived from table state */}
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted()] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    
      {/* Pagination controls */}
      <div className="pagination">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <span>
          Page{' '}
          <strong>
            {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </strong>
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
      </div>
    </div>
  );
}
```

This example demonstrates how these principles work together to create a highly performant application:

1. **Separation of concerns** : Data fetching is separated from UI rendering
2. **Derivation over mutation** : Table state is derived from props and internal state
3. **Memoization** : The columns definition is memoized
4. **Declarative API** : We declare what we want (sorting, filtering, pagination)
5. **Stale-While-Revalidate** : React Query keeps data fresh in the background
6. **Progressive Enhancement** : Features are added only as needed
7. **Structural Sharing** : Happens internally in both React Query and React Table
8. **Framework Agnosticism** : The same principles apply regardless of framework

## Performance Optimization Techniques

Beyond the core principles, TanStack libraries offer specific techniques for optimizing performance:

### 1. Query Deduplication (React Query)

React Query automatically deduplicates identical queries, preventing redundant network requests:

```javascript
// Component A
function ComponentA() {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
  // ...
}

// Component B - uses the same query
function ComponentB() {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
  // ...
}

// When both components are rendered, only ONE network request is made!
```

This is especially powerful in larger applications where the same data might be needed in multiple places.

### 2. Optimistic Updates (React Query)

Optimistic updates improve perceived performance by immediately updating the UI before the server confirms the change:

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function TodoItem({ todo }) {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: updateTodo,
    // Optimistically update the UI
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] });
    
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(['todos']);
    
      // Optimistically update to the new value
      queryClient.setQueryData(['todos'], old => 
        old.map(t => t.id === newTodo.id ? newTodo : t)
      );
    
      // Return a context with the previous value
      return { previousTodos };
    },
    // If the mutation fails, roll back to the previous value
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(
        ['todos'], 
        context.previousTodos
      );
    },
  });
  
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => {
          mutation.mutate({
            ...todo,
            completed: !todo.completed
          });
        }}
      />
      {todo.title}
    </div>
  );
}
```

This creates a much more responsive user experience because users don't have to wait for server responses to see their changes reflected.

### 3. Column Visibility (React Table)

React Table optimizes performance by allowing you to hide columns that aren't needed:

```javascript
import { useState } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

function OptimizedTable({ data }) {
  const [columnVisibility, setColumnVisibility] = useState({
    // Hide complex columns by default
    complexData: false,
  });
  
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });
  
  return (
    <div>
      {/* Column visibility toggles */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={columnVisibility.complexData}
            onChange={() => 
              setColumnVisibility(prev => ({
                ...prev,
                complexData: !prev.complexData
              }))
            }
          />
          Show Complex Data
        </label>
      </div>
    
      {/* Table rendering */}
      {/* ... */}
    </div>
  );
}
```

By hiding columns with expensive calculations, you can significantly improve rendering performance.

### 4. Virtual Scrolling Integration

TanStack libraries can work together to create ultra-performant UIs. Here's an example combining React Table with React Virtual:

```javascript
import { useRef } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualTable({ data }) {
  const tableContainerRef = useRef(null);
  
  // Set up the table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  // Set up the virtualizer
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35, // Approximate row height
    overscan: 10, // How many rows to render above/below the visible area
  });
  
  return (
    <div 
      ref={tableContainerRef}
      style={{ height: '400px', overflow: 'auto' }}
    >
      <table>
        <thead>
          {/* ... header rendering ... */}
        </thead>
        <tbody>
          <tr style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
            <td colSpan={columns.length}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const row = table.getRowModel().rows[virtualRow.index];
                  return (
                    <div
                      key={row.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {row.getVisibleCells().map(cell => (
                        <div
                          key={cell.id}
                          style={{
                            display: 'inline-block',
                            width: cell.column.getSize(),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
```

This approach allows you to render tables with thousands or even millions of rows without performance issues.

## Conclusion

The performance patterns across TanStack libraries arise from a set of fundamental principles:

> TanStack libraries achieve their exceptional performance by carefully separating concerns, preferring derivation over mutation, using memoization extensively, virtualizing where possible, employing declarative APIs, implementing the stale-while-revalidate pattern, deferring execution, utilizing structural sharing, maintaining framework agnosticism, and following progressive enhancement.

These principles work together to create libraries that are both powerful and performant. By understanding these foundational ideas, you can leverage TanStack libraries to their full potential and even apply these patterns to your own code outside of these libraries.

The beauty of TanStack's approach is that it doesn't sacrifice developer experience for performance - instead, the well-designed APIs make it easier to write performant code by default. By embracing these patterns, you can build applications that are both maintainable and blazing fast.
