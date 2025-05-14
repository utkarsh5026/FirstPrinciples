# Testing TanStack-Powered Components: A Comprehensive Guide

Testing is a fundamental aspect of software development that ensures our applications work as expected. When it comes to testing components that utilize TanStack libraries, we need to understand not just the basics of testing, but also how these libraries interact with our components and how to effectively verify their behavior.

## Understanding TanStack from First Principles

Before diving into testing, let's establish what TanStack is and why it matters.

> TanStack is a collection of JavaScript libraries created by Tanner Linsley that focus on providing headless, composable utilities for building data-driven applications. "Headless" means these libraries provide functionality without imposing UI decisions, giving developers complete control over rendering.

The TanStack collection includes:

* TanStack Query (formerly React Query): For data fetching, caching, and state management
* TanStack Table: For building powerful tables and datagrids
* TanStack Router: For type-safe routing
* TanStack Form: For form state management
* TanStack Charts: For data visualization
* TanStack Virtual: For virtualizing large lists and grids

This guide will primarily focus on testing components that use TanStack Query and TanStack Table, as these are the most commonly used libraries.

## Testing Fundamentals: First Principles

Testing any React component, including those using TanStack libraries, rests on four key principles:

> 1. **Isolation** : Test components in isolation to identify issues accurately.
> 2. **Determinism** : Tests should yield consistent results regardless of when or where they run.
> 3. **Simulating real use** : Tests should mimic how users would interact with your components.
> 4. **Maintainability** : Tests should be easy to update as your components evolve.

## Setting Up A Testing Environment for TanStack Components

Let's start from the very beginning and set up a proper testing environment.

### Required Tools

You'll need:

1. A testing framework: Jest is the most common choice for React applications
2. A testing library: React Testing Library is highly recommended
3. Mock utilities: For simulating API calls and behavior

### Basic Setup

First, install the necessary dependencies:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

Let's understand what each package does:

* `jest`: The testing framework that runs our tests
* `@testing-library/react`: Provides utilities for testing React components
* `@testing-library/jest-dom`: Adds custom Jest matchers for DOM assertions
* `@testing-library/user-event`: Simulates user interactions more realistically
* `msw`: Mock Service Worker for API mocking

Now, create a Jest setup file (e.g., `jest.setup.js`):

```javascript
// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Global test setup
beforeAll(() => {
  // Any global setup before all tests
});

afterAll(() => {
  // Any global cleanup after all tests
});
```

Configure Jest in your `package.json`:

```json
{
  "jest": {
    "setupFilesAfterEnv": ["./jest.setup.js"],
    "testEnvironment": "jsdom",
    "moduleNameMapper": {
      "\\.(css|less|scss)$": "identity-obj-proxy"
    }
  }
}
```

## Testing TanStack Query Components: First Principles

TanStack Query manages data fetching, caching, and state updates. Testing components that use TanStack Query requires addressing several unique challenges:

> When testing TanStack Query components, we need to handle asynchronous operations, mock API responses, and verify that our components correctly respond to different query states (loading, error, success).

### Challenge 1: The QueryClient and QueryClientProvider

TanStack Query requires a `QueryClient` and a `QueryClientProvider` to function. For tests, we need to create a wrapper with these providers.

Let's create a test utility file (`test-utils.js`):

```javascript
import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes our providers
export function renderWithClient(ui) {
  // Create a fresh QueryClient for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Prevents retries during testing for deterministic results
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

This utility function creates a fresh `QueryClient` for each test and wraps our component in the necessary provider. Using a fresh client for each test ensures test isolation.

### Testing a Basic Query Component

Let's say we have a simple component that fetches and displays user data:

```jsx
// UserProfile.jsx
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../api';

export function UserProfile({ userId }) {
  const { isLoading, error, data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) return <div>Loading user data...</div>;
  if (error) return <div>Error loading user: {error.message}</div>;

  return (
    <div className="user-profile">
      <h2>{data.name}</h2>
      <p>Email: {data.email}</p>
      <p>Role: {data.role}</p>
    </div>
  );
}
```

Now, let's test this component using Mock Service Worker (MSW) to mock the API responses:

```jsx
// UserProfile.test.jsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen, waitFor } from '@testing-library/react';
import { renderWithClient } from '../test-utils';
import { UserProfile } from './UserProfile';

// Mock API response data
const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Admin'
};

// Create an MSW server to intercept API requests
const server = setupServer(
  rest.get('/api/users/1', (req, res, ctx) => {
    return res(ctx.json(mockUser));
  })
);

// Start MSW server before tests
beforeAll(() => server.listen());
// Reset handlers after each test
afterEach(() => server.resetHandlers());
// Close server after all tests
afterAll(() => server.close());

test('renders user data correctly', async () => {
  // Render the component with our custom render function
  renderWithClient(<UserProfile userId={1} />);
  
  // Initially, we should see the loading state
  expect(screen.getByText(/loading user data/i)).toBeInTheDocument();
  
  // Wait for the data to load and component to update
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  // Verify all user data is displayed correctly
  expect(screen.getByText(/email: john@example.com/i)).toBeInTheDocument();
  expect(screen.getByText(/role: admin/i)).toBeInTheDocument();
});

test('handles error state', async () => {
  // Override the default handler to return an error
  server.use(
    rest.get('/api/users/1', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'Server error' }));
    })
  );
  
  renderWithClient(<UserProfile userId={1} />);
  
  // Wait for the error state to render
  await waitFor(() => {
    expect(screen.getByText(/error loading user/i)).toBeInTheDocument();
  });
});
```

Let's break down this test:

1. We set up MSW to intercept API requests and return mock data
2. We create two test cases:
   * One that tests the successful data fetching and rendering
   * One that tests error handling

The tests verify that our component correctly shows:

* A loading state initially
* The user data when the request succeeds
* An error message when the request fails

### Testing Query Invalidation and Refetching

A key feature of TanStack Query is cache invalidation and refetching. Let's test a component that uses these features:

```jsx
// UserEditor.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchUser, updateUser } from '../api';

export function UserEditor({ userId }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  
  // Fetch the user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    onSuccess: (data) => {
      setName(data.name);
    }
  });
  
  // Create a mutation for updating the user
  const mutation = useMutation({
    mutationFn: (updatedUser) => updateUser(userId, updatedUser),
    onSuccess: () => {
      // Invalidate the user query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save'}
      </button>
      {mutation.isError && (
        <div className="error">Error: {mutation.error.message}</div>
      )}
      {mutation.isSuccess && (
        <div className="success">User updated successfully!</div>
      )}
    </form>
  );
}
```

Now let's test this component:

```jsx
// UserEditor.test.jsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithClient } from '../test-utils';
import { UserEditor } from './UserEditor';

const mockUser = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
};

// Set up MSW server with GET and PUT handlers
const server = setupServer(
  rest.get('/api/users/1', (req, res, ctx) => {
    return res(ctx.json(mockUser));
  }),
  rest.put('/api/users/1', (req, res, ctx) => {
    return res(ctx.json({ ...mockUser, ...req.body }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads and displays user data', async () => {
  renderWithClient(<UserEditor userId={1} />);
  
  // Initially loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for form to appear with populated data
  await waitFor(() => {
    expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
  });
});

test('updates user and shows success message', async () => {
  // Setup user events
  const user = userEvent.setup();
  
  renderWithClient(<UserEditor userId={1} />);
  
  // Wait for form to load
  await waitFor(() => {
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });
  
  // Change the name input
  const nameInput = screen.getByLabelText(/name/i);
  await user.clear(nameInput);
  await user.type(nameInput, 'Jane Doe');
  
  // Submit the form
  const submitButton = screen.getByRole('button', { name: /save/i });
  await user.click(submitButton);
  
  // Should show loading state during submission
  expect(screen.getByText(/saving/i)).toBeInTheDocument();
  
  // Should show success message after update
  await waitFor(() => {
    expect(screen.getByText(/user updated successfully/i)).toBeInTheDocument();
  });
  
  // Let's verify the query invalidation by spying on queryClient's invalidateQueries
  // Note: This would require modifying our renderWithClient function to expose the queryClient
  // This is just a pseudocode example of what we would check
  // expect(queryClient.invalidateQueries).toHaveBeenCalledWith(['user', 1]);
});
```

This test verifies that:

1. The component loads user data correctly
2. Users can update the data
3. The UI reflects the mutation states (loading, success)

To test the query invalidation properly, we would need to spy on the `queryClient.invalidateQueries` method, which requires exposing the `queryClient` instance from our `renderWithClient` function.

Here's an updated version of our test utility to enable this:

```javascript
// Updated test-utils.js
import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function renderWithClient(ui) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  // Spy on the invalidateQueries method
  jest.spyOn(queryClient, 'invalidateQueries');
  
  const utils = render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
  
  // Return both the render result and the queryClient
  return {
    ...utils,
    queryClient,
  };
}
```

Then we can update our test:

```javascript
test('updates user and shows success message', async () => {
  const user = userEvent.setup();
  
  // Get the queryClient from our renderWithClient function
  const { queryClient } = renderWithClient(<UserEditor userId={1} />);
  
  // ... rest of the test remains the same
  
  // Verify query invalidation
  await waitFor(() => {
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ 
      queryKey: ['user', 1] 
    });
  });
});
```

## Testing TanStack Table Components

TanStack Table is a headless UI library for building powerful tables. Testing these components presents unique challenges because they involve complex state management and user interactions.

Let's create a simple table component using TanStack Table:

```jsx
// UserTable.jsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api';

export function UserTable() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: (info) => info.getValue(),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <th key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
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
  );
}
```

Now, let's test this component:

```jsx
// UserTable.test.jsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { screen, within, waitFor } from '@testing-library/react';
import { renderWithClient } from '../test-utils';
import { UserTable } from './UserTable';

// Mock users data
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
];

// Set up MSW server
const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders table with user data', async () => {
  renderWithClient(<UserTable />);
  
  // Initially loading
  expect(screen.getByText(/loading users/i)).toBeInTheDocument();
  
  // Wait for table to render
  await waitFor(() => {
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  
  // Check table headers
  const headerRow = screen.getAllByRole('row')[0];
  expect(within(headerRow).getByText('Name')).toBeInTheDocument();
  expect(within(headerRow).getByText('Email')).toBeInTheDocument();
  expect(within(headerRow).getByText('Role')).toBeInTheDocument();
  
  // Check table data
  const rows = screen.getAllByRole('row').slice(1); // Skip header row
  expect(rows).toHaveLength(3); // Should have 3 data rows
  
  // Check first row data
  expect(within(rows[0]).getByText('John Doe')).toBeInTheDocument();
  expect(within(rows[0]).getByText('john@example.com')).toBeInTheDocument();
  expect(within(rows[0]).getByText('Admin')).toBeInTheDocument();
  
  // Check second row data
  expect(within(rows[1]).getByText('Jane Smith')).toBeInTheDocument();
  expect(within(rows[1]).getByText('jane@example.com')).toBeInTheDocument();
  expect(within(rows[1]).getByText('User')).toBeInTheDocument();
});

test('handles error state', async () => {
  // Override the handler to return an error
  server.use(
    rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ message: 'Failed to fetch users' }));
    })
  );
  
  renderWithClient(<UserTable />);
  
  // Wait for error message
  await waitFor(() => {
    expect(screen.getByText(/error:/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument();
  });
});
```

This test verifies that:

1. The component shows a loading state initially
2. The table renders with the correct headers and data
3. Error states are handled properly

### Testing Table Interactions

TanStack Table supports various interactive features like sorting, filtering, and pagination. Let's update our table component to include sorting:

```jsx
// UserTableWithSorting.jsx
import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api';

export function UserTableWithSorting() {
  const [sorting, setSorting] = useState([]);
  
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className={column.getIsSorted() ? 'sorted' : ''}
        >
          Name {column.getIsSorted() === 'asc' ? '🔼' : column.getIsSorted() === 'desc' ? '🔽' : ''}
        </button>
      ),
      cell: (info) => info.getValue(),
    },
    // ... other columns similar to before
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // ... similar render logic as before
}
```

Now, let's test the sorting functionality:

```jsx
// UserTableWithSorting.test.jsx
// ... similar setup as before

test('sorts table when header is clicked', async () => {
  const user = userEvent.setup();
  renderWithClient(<UserTableWithSorting />);
  
  // Wait for table to render
  await waitFor(() => {
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  
  // Get the rows before sorting
  const initialRows = screen.getAllByRole('row').slice(1); // Skip header row
  
  // First row should be John Doe initially
  expect(within(initialRows[0]).getByText('John Doe')).toBeInTheDocument();
  
  // Click the Name header to sort
  const nameHeader = screen.getByRole('button', { name: /name/i });
  await user.click(nameHeader);
  
  // After sorting ascending, first row should be Bob Johnson
  let sortedRows = screen.getAllByRole('row').slice(1);
  expect(within(sortedRows[0]).getByText('Bob Johnson')).toBeInTheDocument();
  
  // Click again to sort descending
  await user.click(nameHeader);
  
  // After sorting descending, first row should be John Doe
  sortedRows = screen.getAllByRole('row').slice(1);
  expect(within(sortedRows[0]).getByText('John Doe')).toBeInTheDocument();
});
```

This test verifies that clicking the name header sorts the table correctly in both ascending and descending order.

## Advanced Testing Techniques

Now that we've covered the basics, let's explore some advanced testing techniques for TanStack components.

### Testing Custom Hooks

TanStack libraries often involve creating custom hooks. Testing these hooks directly can be useful.

```jsx
// useUserData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUser, updateUser } from '../api';

export function useUserData(userId) {
  const queryClient = useQueryClient();
  
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  const updateUserMutation = useMutation({
    mutationFn: (updatedUser) => updateUser(userId, updatedUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });
  
  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    error: userQuery.error,
    updateUser: updateUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    updateError: updateUserMutation.error,
  };
}
```

To test this hook, we can use the `renderHook` function from `@testing-library/react-hooks`:

```jsx
// useUserData.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useUserData } from './useUserData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ... mock data and server setup similar to previous examples

// Create a wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('fetches and updates user data', async () => {
  const wrapper = createWrapper();
  
  // Render the hook with the wrapper
  const { result, waitFor } = renderHook(() => useUserData(1), { wrapper });
  
  // Initially, it should be loading
  expect(result.current.isLoading).toBe(true);
  
  // Wait for the data to load
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
  
  // Check that data is loaded correctly
  expect(result.current.user).toEqual(mockUser);
  
  // Test updating the user
  act(() => {
    result.current.updateUser({ name: 'Updated Name' });
  });
  
  // Should be in updating state
  expect(result.current.isUpdating).toBe(true);
  
  // Wait for update to complete
  await waitFor(() => {
    expect(result.current.isUpdating).toBe(false);
  });
  
  // No errors should be present
  expect(result.current.updateError).toBeNull();
});
```

### Testing with Real API Endpoints in Integration Tests

While unit tests with mocked responses are valuable, integration tests that use real API endpoints can catch issues that mocks might miss.

```jsx
// UserProfile.integration.test.jsx
import { screen, waitFor } from '@testing-library/react';
import { renderWithClient } from '../test-utils';
import { UserProfile } from './UserProfile';

// Note: This assumes you have a test environment with a real API
// or a test API that mimics the real one
test('integration test with real API', async () => {
  // Disable MSW for this test to allow real network requests
  server.close();
  
  // Use a test user ID that exists in your test environment
  renderWithClient(<UserProfile userId="test-user-1" />);
  
  // Initially loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for data to load from real API
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
  
  // Verify the component renders with real data
  // Note: In a real test, you'd need to know what data to expect
  expect(screen.getByRole('heading')).toHaveTextContent(/./); // Should have some content
}, 10000); // Increase timeout for real API calls
```

> Integration tests with real APIs can uncover issues that unit tests with mocks might miss, such as incorrect API URL structures, authentication problems, or unexpected response formats.

### Testing TanStack Query DevTools

If your application uses TanStack Query DevTools, you might want to test that they render correctly:

```jsx
// App.jsx with DevTools
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { UserProfile } from './UserProfile';

export function App() {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <UserProfile userId={1} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Test for DevTools:

```jsx
// App.test.jsx
import { render, screen } from '@testing-library/react';
import { App } from './App';

test('renders DevTools in development mode', () => {
  // Save original NODE_ENV
  const originalNodeEnv = process.env.NODE_ENV;
  
  // Set to development
  process.env.NODE_ENV = 'development';
  
  render(<App />);
  
  // DevTools should render in dev mode
  // Note: This might be tricky to test as DevTools might render in a portal
  // You might need to check for specific attributes or class names
  
  // Restore original NODE_ENV
  process.env.NODE_ENV = originalNodeEnv;
});
```

## Best Practices for Testing TanStack Components

Based on everything we've learned, here are some best practices for testing TanStack-powered components:

> 1. **Create a fresh QueryClient for each test** to ensure test isolation.
> 2. **Mock API responses** using tools like MSW for deterministic tests.
> 3. **Test all query states** : loading, error, and success.
> 4. **Test mutations** and their effects on the cache/queries.
> 5. **Don't overuse waitFor** - be specific about what you're waiting for.
> 6. **Test edge cases** like empty data arrays, slow connections (using response delays), and network errors.
> 7. **Keep your tests focused** on a single behavior or aspect of the component.

## Common Pitfalls and How to Avoid Them

### 1. Query Key Collisions

In tests, query key collisions can cause tests to interfere with each other. Always use unique keys or create a fresh QueryClient for each test.

```javascript
// Bad - using the same key for different tests
test('test1', async () => {
  // Uses ['users'] as the query key
});

test('test2', async () => {
  // Also uses ['users'] as the query key, might be affected by previous test
});

// Good - using unique keys or fresh clients
test('test1', async () => {
  const queryClient = new QueryClient();
  // Test with isolated client
});

test('test2', async () => {
  const queryClient = new QueryClient();
  // Test with another isolated client
});
```

### 2. Not Handling Asynchronous Operations Correctly

```javascript
// Bad - not waiting for async operations
test('bad test', () => {
  renderWithClient(<UserProfile userId={1} />);
  // This will fail because the data hasn't loaded yet
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

// Good - properly waiting for async operations
test('good test', async () => {
  renderWithClient(<UserProfile userId={1} />);
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### 3. Not Cleaning Up Between Tests

```javascript
// Bad - not cleaning up MSW server
beforeAll(() => server.listen());
// Missing afterEach and afterAll hooks!

// Good - proper cleanup
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Conclusion

Testing TanStack-powered components requires a good understanding of both the TanStack libraries and testing principles. By following the strategies and examples outlined in this guide, you can create robust tests that verify your components work correctly under various conditions.

Remember the key principles:

1. Create a fresh QueryClient for each test
2. Mock API responses deterministically
3. Test all query states
4. Verify that mutations work correctly
5. Test edge cases and error scenarios

With these practices in place, you can be confident that your TanStack components will work reliably in production.
