# Offline-First Strategies in React: A Comprehensive Guide

> The most resilient applications aren't those that never fail—they're the ones that gracefully adapt when things go wrong. Offline-first is a design philosophy that embraces this reality.

## Understanding Offline-First From First Principles

Offline-first is more than a technical approach—it's a fundamental shift in how we think about web applications. To properly understand it, we need to start from the most basic principles of web connectivity.

### The Traditional Web Model

Traditionally, web applications follow a simple premise:

1. User makes a request
2. Server processes it
3. Server returns a response
4. Application renders the response

This model assumes continuous connectivity—an assumption that fails in many real-world scenarios.

> The traditional approach treats offline as an error state. Offline-first treats it as an expected state in the application lifecycle.

### The Connectivity Spectrum

Connectivity is not binary (online/offline) but exists on a spectrum:

* **Full connectivity** : Fast, reliable connection
* **Slow connectivity** : High latency, but functional
* **Intermittent connectivity** : Connection drops in and out
* **Captive portal** : Connected but requires authentication
* **Offline** : No connection at all

An offline-first application handles all these states gracefully.

## Core Principles of Offline-First Development

### 1. Local-First Data Management

Store data locally first, then synchronize with the server when possible.

### 2. Progressive Enhancement

Build a core experience that works offline, then enhance it when online.

### 3. Optimistic UI Updates

Update the UI immediately based on expected outcomes, then reconcile with actual server responses later.

### 4. Conflict Resolution

Develop strategies to handle conflicts between local and server data.

### 5. Synchronization

Create reliable mechanisms to sync data when connectivity is restored.

## Building Blocks for Offline-First React Applications

Let's explore the essential technologies that make offline-first possible.

### Service Workers: The Foundation

Service workers act as network proxies that intercept network requests and can serve cached responses.

```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/offline.html'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
      
        // Otherwise try fetching from network
        return fetch(event.request)
          .then((response) => {
            // Clone the response to cache and return
            let responseToCache = response.clone();
            caches.open('v1').then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            return caches.match('/offline.html');
          });
      })
  );
});
```

This service worker:

* Caches essential files during installation
* Intercepts fetch requests
* Returns cached responses when available
* Fetches from the network when needed
* Caches new responses for future offline use
* Falls back to an offline page when all else fails

### IndexedDB: Client-Side Storage

IndexedDB provides a robust solution for storing significant amounts of structured data on the client side.

```javascript
// Opening a database
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MyAppDB', 1);
  
    request.onerror = (event) => {
      reject('Database error: ' + event.target.error);
    };
  
    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };
  
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Create an object store (similar to a table)
      const store = db.createObjectStore('tasks', { keyPath: 'id' });
      // Create indexes
      store.createIndex('status', 'status', { unique: false });
    };
  });
};

// Adding data
const addTask = async (task) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['tasks'], 'readwrite');
    const store = transaction.objectStore('tasks');
    const request = store.add(task);
  
    request.onsuccess = () => resolve(task);
    request.onerror = (event) => reject(event.target.error);
  });
};
```

This code demonstrates:

* Opening/creating an IndexedDB database
* Setting up object stores and indexes
* Adding data to the database

### Web Storage API: Simple Key-Value Storage

For simpler storage needs, localStorage and sessionStorage provide straightforward solutions:

```javascript
// Storing data
localStorage.setItem('user', JSON.stringify({ 
  id: '123', 
  name: 'John Doe', 
  lastSeen: new Date().toISOString() 
}));

// Retrieving data
const user = JSON.parse(localStorage.getItem('user'));
```

### Cache API: HTTP Response Storage

The Cache API allows storing and retrieving HTTP responses:

```javascript
// Storing a response in cache
const cacheResponse = async (request, response) => {
  const cache = await caches.open('dynamic-v1');
  return cache.put(request, response.clone());
};

// Retrieving from cache
const fetchFromCacheOrNetwork = async (request) => {
  const cache = await caches.open('dynamic-v1');
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  cacheResponse(request, networkResponse);
  return networkResponse;
};
```

## Implementing Offline-First in React

Now let's look at concrete React patterns for implementing offline-first strategies.

### 1. Network Status Detection

First, create a hook to detect and respond to network status changes:

```jsx
// useNetworkStatus.js
import { useState, useEffect } from 'react';

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
  
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

export default useNetworkStatus;
```

This hook:

* Initializes with the current network status
* Sets up event listeners for online/offline events
* Cleans up event listeners when the component unmounts
* Returns the current online status

Usage in a component:

```jsx
import useNetworkStatus from './useNetworkStatus';

function NetworkIndicator() {
  const isOnline = useNetworkStatus();
  
  return (
    <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? 'Online' : 'Offline - Changes will sync when connection is restored'}
    </div>
  );
}
```

### 2. Data Fetching with Offline Support

Let's create a custom hook for data fetching that works offline:

```jsx
// useOfflineData.js
import { useState, useEffect } from 'react';
import { getFromIndexedDB, saveToIndexedDB } from './indexedDBUtils';

const useOfflineData = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isOnline = navigator.onLine;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
      
        // Try to get from IndexedDB first
        const cachedData = await getFromIndexedDB('apiCache', url);
      
        // If we have cached data, use it immediately
        if (cachedData) {
          setData(cachedData.data);
          setLoading(false);
        }
      
        // If we're online, fetch fresh data
        if (isOnline) {
          const response = await fetch(url, options);
        
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
        
          const freshData = await response.json();
        
          // Update state with fresh data
          setData(freshData);
        
          // Save fresh data to IndexedDB
          await saveToIndexedDB('apiCache', url, {
            data: freshData,
            timestamp: new Date().getTime()
          });
        } else if (!cachedData) {
          // We're offline and have no cached data
          throw new Error('You are offline and no cached data is available');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [url, isOnline]);
  
  return { data, loading, error };
};

export default useOfflineData;
```

This hook:

* Attempts to fetch cached data from IndexedDB first
* Updates the UI with cached data if available
* Fetches fresh data from the network when online
* Updates both the UI and the cache with fresh data
* Handles offline scenarios gracefully

Usage in a component:

```jsx
import useOfflineData from './useOfflineData';

function TodoList() {
  const { data: todos, loading, error } = useOfflineData('/api/todos');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {todos && todos.map(todo => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}
```

### 3. Optimistic UI Updates with Sync Queue

For actions that modify data, we need a more complex pattern that:

1. Immediately updates the UI
2. Stores the change locally
3. Attempts to sync with the server
4. Queues failed requests for later retry

Here's a hook that implements this pattern:

```jsx
// useOptimisticMutation.js
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addToSyncQueue, removeFromSyncQueue } from './syncQueueService';

const useOptimisticMutation = (mutationFn, options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const mutate = async (variables) => {
    setIsLoading(true);
    setError(null);
  
    // Generate a temporary ID for the new item
    const tempId = uuidv4();
  
    // Call onMutate callback to update UI optimistically
    if (options.onMutate) {
      options.onMutate({ ...variables, id: tempId, _status: 'pending' });
    }
  
    try {
      // If we're online, try to perform the mutation immediately
      if (navigator.onLine) {
        const result = await mutationFn(variables);
      
        // Call onSuccess callback
        if (options.onSuccess) {
          options.onSuccess(result);
        }
      
        return result;
      } else {
        // We're offline, so add the mutation to the sync queue
        const queueItem = {
          id: tempId,
          mutation: mutationFn.name,
          variables,
          createdAt: new Date().toISOString()
        };
      
        await addToSyncQueue(queueItem);
      
        // Still call onSuccess, but with the temporary data
        if (options.onSuccess) {
          options.onSuccess({ ...variables, id: tempId, _isLocal: true });
        }
      
        return { ...variables, id: tempId, _isLocal: true };
      }
    } catch (err) {
      setError(err.message);
    
      // Add to sync queue if the error is likely due to network issues
      if (err.name === 'NetworkError' || !navigator.onLine) {
        const queueItem = {
          id: tempId,
          mutation: mutationFn.name,
          variables,
          createdAt: new Date().toISOString()
        };
      
        await addToSyncQueue(queueItem);
      }
    
      // Call onError callback
      if (options.onError) {
        options.onError(err);
      }
    
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    mutate,
    isLoading,
    error
  };
};

export default useOptimisticMutation;
```

This hook:

* Implements optimistic updates for mutations
* Handles both online and offline scenarios
* Adds failed requests to a sync queue
* Provides loading and error states
* Supports callback functions for different stages of the mutation

Usage in a component:

```jsx
import { useState } from 'react';
import useOptimisticMutation from './useOptimisticMutation';
import { addTodo } from './api';

function TodoForm() {
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState([]);
  
  const { mutate, isLoading, error } = useOptimisticMutation(addTodo, {
    onMutate: (newTodo) => {
      // Update UI optimistically
      setTodos(prev => [...prev, newTodo]);
    },
    onSuccess: (result) => {
      // If we got a real result from the server, replace the optimistic entry
      setTodos(prev => prev.map(todo => 
        todo._status === 'pending' ? result : todo
      ));
    },
    onError: (err) => {
      // Handle error (could show a notification, etc.)
      console.error('Failed to add todo:', err);
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
  
    mutate({ title, completed: false });
    setTitle('');
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new todo"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Todo'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className={todo._status === 'pending' ? 'pending' : ''}>
            {todo.title}
            {todo._isLocal && <span className="badge">Not synced</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. Background Synchronization

To complete our offline-first application, we need a mechanism to sync queued actions when connectivity is restored:

```jsx
// SyncManager.js
import { useState, useEffect } from 'react';
import { getSyncQueue, removeFromSyncQueue } from './syncQueueService';
import { processTodoCreate, processTodoUpdate, processTodoDelete } from './api';

const processorMap = {
  'addTodo': processTodoCreate,
  'updateTodo': processTodoUpdate,
  'deleteTodo': processTodoDelete
};

function SyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncError, setSyncError] = useState(null);
  
  const performSync = async () => {
    if (isSyncing || !navigator.onLine) return;
  
    setIsSyncing(true);
    setSyncError(null);
  
    try {
      // Get all items in the sync queue
      const queueItems = await getSyncQueue();
    
      if (queueItems.length === 0) {
        setIsSyncing(false);
        setLastSyncTime(new Date());
        return;
      }
    
      // Process each item in the queue
      for (const item of queueItems) {
        try {
          // Get the appropriate processor function
          const processor = processorMap[item.mutation];
        
          if (!processor) {
            console.error(`No processor found for mutation: ${item.mutation}`);
            continue;
          }
        
          // Process the item
          await processor(item.variables);
        
          // Remove from queue if successful
          await removeFromSyncQueue(item.id);
        } catch (err) {
          console.error(`Failed to process queue item:`, item, err);
          // We don't remove failed items, they'll be retried on next sync
        }
      }
    
      setLastSyncTime(new Date());
    } catch (err) {
      setSyncError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Perform sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      performSync();
    };
  
    window.addEventListener('online', handleOnline);
  
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  // Periodic sync attempts when online
  useEffect(() => {
    if (!navigator.onLine) return;
  
    const intervalId = setInterval(() => {
      performSync();
    }, 60000); // Try to sync every minute
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  return (
    <div className="sync-status">
      {isSyncing && <span>Syncing...</span>}
      {syncError && <span>Sync error: {syncError}</span>}
      {lastSyncTime && !isSyncing && (
        <span>Last synced: {lastSyncTime.toLocaleTimeString()}</span>
      )}
    </div>
  );
}

export default SyncManager;
```

This component:

* Manages background synchronization of queued actions
* Syncs automatically when the device comes online
* Performs periodic syncing attempts
* Maps queue items to their appropriate processor functions
* Provides visual feedback about the sync state

Usage in the main app:

```jsx
function App() {
  return (
    <div className="app">
      <NetworkIndicator />
      <SyncManager />
      <TodoForm />
      <TodoList />
    </div>
  );
}
```

## Conflict Resolution Strategies

A critical aspect of offline-first applications is handling data conflicts. Here are the main approaches:

### 1. Last Write Wins

The simplest strategy—whichever update has the latest timestamp overwrites earlier changes:

```javascript
const resolveConflict = (serverData, localData) => {
  return serverData.updatedAt > localData.updatedAt ? serverData : localData;
};
```

### 2. Merge Strategy

Combine changes from both versions when possible:

```javascript
const mergeData = (serverData, localData) => {
  // Start with server data as the base
  const result = { ...serverData };
  
  // For each property in local data
  for (const [key, value] of Object.entries(localData)) {
    // If the property hasn't been modified on the server since our last sync
    if (serverData[`${key}UpdatedAt`] <= localData.lastSyncAt) {
      result[key] = value;
    }
  }
  
  return result;
};
```

### 3. Conflict Detection and Manual Resolution

For complex conflicts, detect them and let the user decide:

```jsx
// Simplified conflict resolution component
function ConflictResolver({ serverData, localData, onResolve }) {
  const [resolution, setResolution] = useState(null);
  
  const handleResolve = (choice) => {
    let resolvedData;
  
    if (choice === 'server') {
      resolvedData = serverData;
    } else if (choice === 'local') {
      resolvedData = localData;
    } else if (choice === 'merge') {
      resolvedData = {
        ...serverData,
        ...localData,
        // Specific merge logic can be more complex
      };
    }
  
    onResolve(resolvedData);
  };
  
  return (
    <div className="conflict-resolver">
      <h3>Data Conflict Detected</h3>
      <div className="data-comparison">
        <div>
          <h4>Server Version</h4>
          <pre>{JSON.stringify(serverData, null, 2)}</pre>
        </div>
        <div>
          <h4>Your Version</h4>
          <pre>{JSON.stringify(localData, null, 2)}</pre>
        </div>
      </div>
      <div className="resolution-actions">
        <button onClick={() => handleResolve('server')}>
          Use Server Version
        </button>
        <button onClick={() => handleResolve('local')}>
          Use My Version
        </button>
        <button onClick={() => handleResolve('merge')}>
          Merge Changes
        </button>
      </div>
    </div>
  );
}
```

## Testing Offline-First Applications

Testing offline-first applications requires special consideration:

### 1. Simulating Network Conditions

```javascript
// In your test file
describe('TodoList offline behavior', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
  
    // Trigger offline event
    window.dispatchEvent(new Event('offline'));
  });
  
  afterEach(() => {
    // Reset to online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
  
    window.dispatchEvent(new Event('online'));
  });
  
  test('displays cached data when offline', async () => {
    // Test implementation
  });
});
```

### 2. Mocking IndexedDB

Using a library like fake-indexeddb for testing:

```javascript
// In your test setup
import 'fake-indexeddb/auto';
import { openDB } from './indexedDBUtils';

beforeEach(async () => {
  // Seed the test database
  const db = await openDB();
  const tx = db.transaction(['todos'], 'readwrite');
  const store = tx.objectStore('todos');
  await store.add({ id: '1', title: 'Test Todo', completed: false });
  await tx.complete;
});
```

### 3. Testing Sync Logic

```javascript
test('syncs queued items when coming online', async () => {
  // Setup - add item to sync queue while offline
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false
  });
  
  // Mock a todo creation
  await addToSyncQueue({
    id: 'temp-1',
    mutation: 'addTodo',
    variables: { title: 'New offline todo', completed: false },
    createdAt: new Date().toISOString()
  });
  
  // Mock API call
  const mockProcessTodoCreate = jest.fn().mockResolvedValue({
    id: 'server-1',
    title: 'New offline todo',
    completed: false
  });
  processTodoCreate.mockImplementation(mockProcessTodoCreate);
  
  // Come online
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true
  });
  
  window.dispatchEvent(new Event('online'));
  
  // Wait for sync to complete
  await waitFor(() => expect(mockProcessTodoCreate).toHaveBeenCalled());
  
  // Check that the queue item was processed and removed
  const queue = await getSyncQueue();
  expect(queue.length).toBe(0);
});
```

## Real-World Patterns and Architectures

Let's explore some established patterns for offline-first applications:

### CQRS (Command Query Responsibility Segregation)

Based on the search results, I can now integrate information about CQRS (Command Query Responsibility Segregation) and RxDB into our offline-first React strategies discussion.

### CQRS Pattern for Offline-First Applications

CQRS is an architectural pattern that separates read and write operations into different models. When applied to offline-first React applications, it provides several benefits:

```jsx
// A simplified CQRS implementation for offline-first React
import { useState, useEffect } from 'react';
import { getFromCache, saveToCache } from './cacheService';
import { syncQueue } from './syncService';

// Command - Write operation
const useCommand = (commandFn) => {
  const [isExecuting, setIsExecuting] = useState(false);
  
  const execute = async (payload) => {
    setIsExecuting(true);
  
    try {
      // Perform optimistic update locally
      const result = await commandFn(payload);
    
      // Add to sync queue for later synchronization
      if (!navigator.onLine) {
        await syncQueue.add({
          command: commandFn.name,
          payload,
          timestamp: Date.now()
        });
      }
    
      return result;
    } finally {
      setIsExecuting(false);
    }
  };
  
  return {
    execute,
    isExecuting
  };
};

// Query - Read operation
const useQuery = (queryFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
    
      try {
        // Try to get from cache first
        const cacheKey = `${queryFn.name}:${JSON.stringify(dependencies)}`;
        const cachedData = await getFromCache(cacheKey);
      
        if (cachedData) {
          setData(cachedData);
          setIsLoading(false);
        }
      
        // If online, fetch fresh data
        if (navigator.onLine) {
          const freshData = await queryFn(...dependencies);
          setData(freshData);
        
          // Update cache
          await saveToCache(cacheKey, freshData);
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [queryFn, ...dependencies]);
  
  return {
    data,
    isLoading,
    error,
    refetch: () => {} // Implement refetch logic
  };
};
```

This CQRS implementation:

1. Separates read (query) and write (command) operations
2. Handles offline scenarios for both operations
3. Maintains a sync queue for commands executed while offline
4. Caches query results for offline availability

Usage example:

```jsx
// Using CQRS hooks in a component
function TaskList() {
  const { data: tasks, isLoading, error } = useQuery(fetchTasks);
  const { execute: addTask, isExecuting } = useCommand(createTask);
  
  const handleAddTask = async (title) => {
    await addTask({ title, completed: false });
  };
  
  return (
    <div>
      <h1>Tasks</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id}>{task.title}</li>
          ))}
        </ul>
      )}
    
      <form onSubmit={(e) => {
        e.preventDefault();
        handleAddTask(e.target.taskTitle.value);
        e.target.reset();
      }}>
        <input 
          type="text" 
          name="taskTitle"
          placeholder="New task" 
        />
        <button type="submit" disabled={isExecuting}>
          {isExecuting ? 'Adding...' : 'Add Task'}
        </button>
      </form>
    </div>
  );
}
```

## Advanced Offline-First with RxDB

RxDB is a powerful JavaScript database that embraces the local-first methodology, ensuring applications function seamlessly in offline scenarios by storing data locally and synchronizing it when connectivity is restored. It's particularly well-suited for React applications.

Let's implement an offline-first React application using RxDB:

```jsx
// database.js - RxDB setup
import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/dexie';
import { addPouchPlugin, replicateGraphQL } from 'rxdb/plugins/replication';

// Schema definition
const taskSchema = {
  title: 'tasks',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100
    },
    title: {
      type: 'string'
    },
    completed: {
      type: 'boolean'
    },
    createdAt: {
      type: 'number'
    },
    updatedAt: {
      type: 'number'
    }
  },
  required: ['id', 'title', 'completed', 'createdAt', 'updatedAt']
};

// Initialize database
export const initDatabase = async () => {
  const db = await createRxDatabase({
    name: 'tasksdb',
    storage: getRxStorageDexie()
  });
  
  // Add collections
  await db.addCollections({
    tasks: {
      schema: taskSchema
    }
  });
  
  // Setup replication if online
  if (navigator.onLine) {
    setupReplication(db);
  }
  
  // Listen for online event to start replication
  window.addEventListener('online', () => {
    setupReplication(db);
  });
  
  return db;
};

// Setup replication with server
const setupReplication = (db) => {
  const replicationState = replicateGraphQL({
    collection: db.tasks,
    url: 'https://api.example.com/graphql',
    pull: {
      queryBuilder: () => ({ /* GraphQL query */ }),
      responseModifier: (res) => res.data.tasks
    },
    push: {
      queryBuilder: (doc) => ({ /* GraphQL mutation */ }),
      responseModifier: (res) => res.data.task
    },
    live: true,
    retryTime: 5000,
    autoStart: true
  });
  
  replicationState.error$.subscribe(error => {
    console.error('Replication error:', error);
  });
};
```

Now, let's create a React hook to use our RxDB database:

```jsx
// useRxCollection.js
import { useState, useEffect } from 'react';

export const useRxCollection = (collection, queryBuilder = (col) => col.find()) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!collection) {
      setLoading(false);
      return;
    }
  
    try {
      // Build query
      const query = queryBuilder(collection);
    
      // Subscribe to query results
      const subscription = query.$.subscribe(
        results => {
          setDocuments(results);
          setLoading(false);
        },
        err => {
          setError(err);
          setLoading(false);
        }
      );
    
      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [collection]);
  
  const addDocument = async (data) => {
    try {
      return await collection.insert({
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    } catch (err) {
      setError(err);
      throw err;
    }
  };
  
  const updateDocument = async (id, data) => {
    try {
      const doc = await collection.findOne(id).exec();
      if (!doc) throw new Error(`Document with id ${id} not found`);
    
      await doc.update({
        $set: {
          ...data,
          updatedAt: Date.now()
        }
      });
    
      return doc;
    } catch (err) {
      setError(err);
      throw err;
    }
  };
  
  const removeDocument = async (id) => {
    try {
      const doc = await collection.findOne(id).exec();
      if (!doc) throw new Error(`Document with id ${id} not found`);
    
      await doc.remove();
      return id;
    } catch (err) {
      setError(err);
      throw err;
    }
  };
  
  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    removeDocument
  };
};
```

Using these tools in a component:

```jsx
// TasksComponent.jsx
import { useState, useEffect } from 'react';
import { initDatabase } from './database';
import { useRxCollection } from './useRxCollection';

function TasksComponent() {
  const [db, setDb] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Initialize database
  useEffect(() => {
    const init = async () => {
      const database = await initDatabase();
      setDb(database);
    };
    init();
  
    // Online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
  
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Access tasks collection once DB is initialized
  const {
    documents: tasks,
    loading,
    error,
    addDocument: addTask,
    updateDocument: updateTask,
    removeDocument: removeTask
  } = useRxCollection(db?.tasks);
  
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
  
    try {
      await addTask({
        id: `task_${Date.now()}`,
        title: newTaskTitle,
        completed: false
      });
    
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };
  
  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      await updateTask(taskId, {
        completed: !currentStatus
      });
    } catch (err) {
      console.error(`Failed to update task ${taskId}:`, err);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      await removeTask(taskId);
    } catch (err) {
      console.error(`Failed to delete task ${taskId}:`, err);
    }
  };
  
  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="task-manager">
      <div className="connection-status">
        {isOnline ? 'Online' : 'Offline - Changes will sync when connection is restored'}
      </div>
    
      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task"
        />
        <button type="submit">Add Task</button>
      </form>
    
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={task.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleComplete(task.id, task.completed)}
            />
            <span>{task.title}</span>
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TasksComponent;
```

## Event Sourcing for Offline-First Applications

Event sourcing is particularly useful for offline-first applications as it records all changes as a sequence of events rather than just the current state, allowing for more reliable synchronization when connectivity is restored.

Here's a simplified implementation of event sourcing for offline-first React:

```jsx
// eventStore.js
const eventStore = {
  events: [],
  lastSyncedIndex: -1,
  
  // Add a new event
  addEvent(event) {
    this.events.push({
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      synced: false
    });
  
    // Try to sync if online
    if (navigator.onLine) {
      this.syncEvents();
    }
  
    // Save to local storage
    this.saveToStorage();
  
    return this.events[this.events.length - 1];
  },
  
  // Get all events
  getEvents() {
    return [...this.events];
  },
  
  // Get events that haven't been synced
  getUnsynced() {
    return this.events.filter(event => !event.synced);
  },
  
  // Sync events with server
  async syncEvents() {
    const unsynced = this.getUnsynced();
    if (unsynced.length === 0) return;
  
    try {
      // Send events to server
      const response = await fetch('https://api.example.com/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events: unsynced })
      });
    
      if (!response.ok) {
        throw new Error('Failed to sync events');
      }
    
      // Mark events as synced
      unsynced.forEach(event => {
        const idx = this.events.findIndex(e => e.id === event.id);
        if (idx !== -1) {
          this.events[idx].synced = true;
        }
      });
    
      // Save updated state
      this.saveToStorage();
    
    } catch (error) {
      console.error('Event sync failed:', error);
      // We'll try again later
    }
  },
  
  // Save state to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('eventStore', JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save events to localStorage:', error);
    }
  },
  
  // Load state from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('eventStore');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load events from localStorage:', error);
    }
  },
  
  // Initialize store
  init() {
    this.loadFromStorage();
  
    // Set up online listener to sync when connection is restored
    window.addEventListener('online', () => {
      this.syncEvents();
    });
  
    return this;
  }
};

export default eventStore.init();
```

Using event sourcing with a React hook:

```jsx
// useEventSourcing.js
import { useState, useEffect } from 'react';
import eventStore from './eventStore';

export const useEventSourcing = (reducer, initialState) => {
  const [state, setState] = useState(initialState);
  
  // Apply events on mount
  useEffect(() => {
    const events = eventStore.getEvents();
    const newState = events.reduce(reducer, initialState);
    setState(newState);
  }, [reducer, initialState]);
  
  // Dispatch a new event
  const dispatch = (eventType, payload) => {
    const event = eventStore.addEvent({ type: eventType, payload });
  
    // Update local state
    setState(prevState => reducer(prevState, event));
  
    return event;
  };
  
  return [state, dispatch];
};
```

Example usage in a todo application:

```jsx
// TodoApp.jsx
import { useEventSourcing } from './useEventSourcing';

// Event reducer
const todoReducer = (state, event) => {
  switch (event.type) {
    case 'TODO_ADDED':
      return {
        ...state,
        todos: [...state.todos, {
          id: event.payload.id,
          title: event.payload.title,
          completed: false
        }]
      };
    
    case 'TODO_TOGGLED':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === event.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case 'TODO_REMOVED':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== event.payload.id)
      };
    
    default:
      return state;
  }
};

function TodoApp() {
  // Initial state
  const initialState = { todos: [] };
  
  // Use our event sourcing hook
  const [state, dispatch] = useEventSourcing(todoReducer, initialState);
  const { todos } = state;
  
  // Add a new todo
  const handleAddTodo = (title) => {
    dispatch('TODO_ADDED', {
      id: `todo_${Date.now()}`,
      title
    });
  };
  
  // Toggle todo completed status
  const handleToggleTodo = (id) => {
    dispatch('TODO_TOGGLED', { id });
  };
  
  // Remove a todo
  const handleRemoveTodo = (id) => {
    dispatch('TODO_REMOVED', { id });
  };
  
  return (
    <div className="todo-app">
      <h1>Todo App</h1>
    
      <AddTodoForm onAddTodo={handleAddTodo} />
    
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo.id)}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
            <button onClick={() => handleRemoveTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddTodoForm({ onAddTodo }) {
  const [title, setTitle] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
  
    onAddTodo(title);
    setTitle('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default TodoApp;
```

## Putting It All Together: A Complete Offline-First Architecture

In a typical offline-first app, all changes and reads on the front end are made from a local database which is then synced with the backend service. The architecture should accommodate:

1. Local-first data storage
2. Background synchronization
3. Conflict resolution
4. Optimistic UI updates
5. Network status awareness

Here's a diagram illustrating the full architecture (in portrait/vertical layout):

```
┌─────────────────────────────────┐
│           React UI              │
│  ┌─────────────┐ ┌────────────┐ │
│  │  Components │ │   Hooks    │ │
│  └──────┬──────┘ └─────┬──────┘ │
└─────────┼────────────┬─┬────────┘
          │            │ │
┌─────────┼────────────┼─┼────────┐
│         ▼            │ │        │
│  ┌─────────────┐     │ │        │
│  │   Actions   │     │ │        │
│  └──────┬──────┘     │ │        │
│         │            │ │        │
│         ▼            │ │        │
│  ┌─────────────┐     │ │        │
│  │   Command   │     │ │        │
│  │  Handlers   │     │ │        │
│  └──────┬──────┘     │ │        │
│         │            │ │        │
│ Commands│            │ │ Query  │
│         │            │ │ Results│
│         ▼            │ │        │
│  ┌─────────────┐     │ │        │
│  │    Event    │     │ │        │
│  │   Store     │     │ │        │
│  └──────┬──────┘     │ │        │
│         │            │ │        │
│         ▼            │ │        │
│  ┌─────────────┐     │ │        │
│  │    Local    │     │ │        │
│  │  Database   │◄────┘ │        │
│  │   (RxDB)    │       │        │
│  └──────┬──────┘       │        │
│         │              │        │
│         ▼              │        │
│  ┌─────────────┐       │        │
│  │    Sync     │       │        │
│  │   Service   │       │        │
│  └──────┬──────┘       │        │
└─────────┼──────────────┼────────┘
          │              │
┌─────────┼──────────────┼────────┐
│ Network │              │        │
│ Boundary│              │        │
└─────────┼──────────────┼────────┘
          │              │
┌─────────┼──────────────┼────────┐
│         ▼              │        │
│  ┌─────────────┐       │        │
│  │   Server    │       │        │
│  │     API     │───────┘        │
│  └──────┬──────┘                │
│         │                       │
│         ▼                       │
│  ┌─────────────┐                │
│  │   Server    │                │
│  │  Database   │                │
│  └─────────────┘                │
└─────────────────────────────────┘
```

The key components of this architecture are:

1. **React UI Layer** : Components and hooks that interact with the application
2. **CQRS Pattern** : Separating commands (writes) and queries (reads)
3. **Event Store** : Records all state changes as a sequence of events
4. **Local Database (RxDB)** : Stores data locally and provides reactivity
5. **Sync Service** : Manages data synchronization with the server
6. **Server API** : Endpoint for data synchronization
7. **Server Database** : The source of truth for data when online

This architecture provides:

* Immediate response to user actions (via optimistic UI updates)
* Full functionality when offline
* Automatic synchronization when online
* Conflict resolution mechanisms
* Data persistence across sessions
* Real-time reactivity to data changes

## Performance Considerations

When implementing offline-first strategies in React, consider the following performance aspects:

1. **Data Indexing** : Index frequently queried fields in your local database to speed up queries.
2. **Selective Synchronization** : Don't sync everything - be selective about what data needs to be available offline.
3. **Batch Synchronization** : Batch multiple changes together when syncing to reduce network overhead.
4. **Data Compression** : Compress data before synchronizing to reduce bandwidth usage.
5. **Background Sync** : Perform synchronization in a background thread to avoid blocking the UI.
6. **Smart Caching** : Implement TTL (Time-To-Live) for cached data to refresh stale content.
7. **Lazy Loading** : Load and sync data on demand rather than all at once.

## Conclusion

> The true power of offline-first applications isn't just that they work without an internet connection—it's that they provide a seamless, responsive experience regardless of network conditions.

Building offline-first React applications requires thoughtful architecture and consideration of data flow, synchronization, and conflict resolution. By leveraging patterns like CQRS and technologies like RxDB, you can create robust applications that work well in any network condition.

The strategies outlined in this guide should provide a solid foundation for implementing offline-first capabilities in your React applications. Remember that the specific implementation will vary based on your application's requirements, but the core principles remain the same.

Would you like me to expand on any particular aspect of offline-first strategies in React?
