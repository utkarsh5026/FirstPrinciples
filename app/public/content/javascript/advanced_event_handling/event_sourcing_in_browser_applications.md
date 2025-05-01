# Event Sourcing in Browser Applications: A First Principles Explanation

Event sourcing is a powerful pattern for building rich, responsive applications in the browser. I'll explain this concept from first principles, building up our understanding step by step.

## What is Event Sourcing?

At its core, event sourcing is an architectural pattern where instead of storing the current state of an application, we store the sequence of events that led to that state. The application's state can then be reconstructed by replaying these events.

### Traditional State Management vs. Event Sourcing

Let's start with a simple mental model:

**Traditional approach:** We maintain a "current state" and update it directly.

```
State = CurrentState
```

**Event sourcing approach:** We maintain a log of events and derive the state from them.

```
State = Event₁ + Event₂ + Event₃ + ... + Eventₙ
```

This fundamental shift in thinking—from storing state to storing events—is the essence of event sourcing.

## First Principles of Event Sourcing

Let's break down the core principles:

### 1. Events as the Source of Truth

In event sourcing, events are the primary source of truth. An event is an immutable fact that has happened in the past. Once recorded, it cannot be changed.

For example, in a todo application:

* Traditional approach: Store the list of current todos
* Event sourcing: Store events like "TodoCreated", "TodoCompleted", "TodoDeleted"

### 2. State as a Projection of Events

The current state of the application is derived by processing all events in sequence. This derived state is called a "projection" of the events.

```javascript
// Simplified example
function deriveState(events) {
  let state = initialState();
  
  for (const event of events) {
    state = applyEvent(state, event);
  }
  
  return state;
}
```

### 3. Event Immutability

Once an event is recorded, it should never be modified. If you need to change something, you add a new compensating event.

For example, if a user accidentally marks a todo as complete, you don't delete or modify the "TodoCompleted" event; instead, you add a new "TodoReopenedAsIncomplete" event.

## Implementing Event Sourcing in the Browser

Now let's explore how to implement event sourcing in a browser application.

### Key Components

1. **Event Store** : Where events are persisted
2. **Command Handlers** : Process user actions and generate events
3. **Event Handlers** : Update the state based on events
4. **Projections** : Derive specific views from events

### A Simple Browser Implementation

Let's implement a basic event-sourced todo application:

```javascript
// The event store (simplified)
class EventStore {
  constructor() {
    this.events = [];
    this.subscribers = [];
  }
  
  addEvent(event) {
    this.events.push({
      ...event,
      timestamp: new Date().toISOString()
    });
  
    // Notify subscribers about the new event
    this.subscribers.forEach(subscriber => subscriber(event));
  
    // Persist to localStorage for browser persistence
    localStorage.setItem('todoEvents', JSON.stringify(this.events));
  }
  
  getAllEvents() {
    return [...this.events];
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }
}
```

This simple event store keeps events in memory and also persists them to localStorage. It notifies subscribers when new events occur.

### Command Handlers

Now let's implement command handlers that process user actions:

```javascript
// Command handlers translate user intent into events
const commandHandlers = {
  createTodo(eventStore, { title }) {
    const todoId = generateId(); // Some function to generate unique IDs
  
    eventStore.addEvent({
      type: 'TODO_CREATED',
      payload: {
        id: todoId,
        title,
        completed: false
      }
    });
  
    return todoId;
  },
  
  completeTodo(eventStore, { id }) {
    eventStore.addEvent({
      type: 'TODO_COMPLETED',
      payload: { id }
    });
  },
  
  deleteTodo(eventStore, { id }) {
    eventStore.addEvent({
      type: 'TODO_DELETED',
      payload: { id }
    });
  }
};
```

Command handlers validate user input and translate it into appropriate events. They encapsulate the business logic that determines what events should be generated.

### Event Handlers and State Projection

Now we need to derive application state from the events:

```javascript
// Initial state
const initialState = {
  todos: {}
};

// Event handlers update the state based on events
const eventHandlers = {
  'TODO_CREATED': (state, event) => {
    const { id, title, completed } = event.payload;
  
    return {
      ...state,
      todos: {
        ...state.todos,
        [id]: { id, title, completed }
      }
    };
  },
  
  'TODO_COMPLETED': (state, event) => {
    const { id } = event.payload;
    const todo = state.todos[id];
  
    if (!todo) return state; // Handle case where todo doesn't exist
  
    return {
      ...state,
      todos: {
        ...state.todos,
        [id]: { ...todo, completed: true }
      }
    };
  },
  
  'TODO_DELETED': (state, event) => {
    const { id } = event.payload;
    const newTodos = { ...state.todos };
    delete newTodos[id];
  
    return {
      ...state,
      todos: newTodos
    };
  }
};

// Function to derive state from events
function deriveState(events) {
  return events.reduce((state, event) => {
    const handler = eventHandlers[event.type];
    return handler ? handler(state, event) : state;
  }, initialState);
}
```

This code shows how to apply events to derive the current state. Each event type has a corresponding handler that knows how to update the state.

### Putting It All Together

Now let's integrate everything into a simple application:

```javascript
class TodoApp {
  constructor() {
    // Create the event store
    this.eventStore = new EventStore();
  
    // Initialize state
    this.state = initialState;
  
    // Load events from localStorage if available
    const savedEvents = localStorage.getItem('todoEvents');
    if (savedEvents) {
      JSON.parse(savedEvents).forEach(event => {
        this.eventStore.events.push(event);
      });
      this.state = deriveState(this.eventStore.getAllEvents());
    }
  
    // Subscribe to new events
    this.eventStore.subscribe(event => {
      const handler = eventHandlers[event.type];
      if (handler) {
        this.state = handler(this.state, event);
        this.render();
      }
    });
  }
  
  // Command methods that users can call
  createTodo(title) {
    return commandHandlers.createTodo(this.eventStore, { title });
  }
  
  completeTodo(id) {
    commandHandlers.completeTodo(this.eventStore, { id });
  }
  
  deleteTodo(id) {
    commandHandlers.deleteTodo(this.eventStore, { id });
  }
  
  // Render the UI (in a real app, you'd use a proper UI framework)
  render() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
  
    Object.values(this.state.todos).forEach(todo => {
      const li = document.createElement('li');
      li.textContent = todo.title;
    
      if (todo.completed) {
        li.style.textDecoration = 'line-through';
      }
    
      // Add complete button
      const completeBtn = document.createElement('button');
      completeBtn.textContent = 'Complete';
      completeBtn.onclick = () => this.completeTodo(todo.id);
    
      // Add delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => this.deleteTodo(todo.id);
    
      li.appendChild(completeBtn);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }
}
```

This simplified application demonstrates the basic flow of an event-sourced browser application:

1. User actions trigger commands
2. Commands generate events
3. Events update the state
4. State changes cause the UI to re-render

## Advanced Concepts in Browser Event Sourcing

Now let's explore some more advanced concepts.

### Event Versioning

As your application evolves, you might need to change the structure of your events. Here's how you can handle versioning:

```javascript
// Version 1 event
const todoCreatedV1 = {
  type: 'TODO_CREATED',
  version: 1,
  payload: { id: '123', title: 'Buy milk' }
};

// Version 2 event with additional fields
const todoCreatedV2 = {
  type: 'TODO_CREATED',
  version: 2,
  payload: { 
    id: '123', 
    title: 'Buy milk',
    priority: 'medium',
    tags: ['shopping']
  }
};

// Event handler that handles multiple versions
const todoCreatedHandler = (state, event) => {
  const { payload, version } = event;
  
  // Common fields for all versions
  const todo = {
    id: payload.id,
    title: payload.title,
    completed: false
  };
  
  // Add version-specific fields
  if (version >= 2) {
    todo.priority = payload.priority || 'normal';
    todo.tags = payload.tags || [];
  }
  
  return {
    ...state,
    todos: {
      ...state.todos,
      [todo.id]: todo
    }
  };
};
```

This approach allows you to evolve your event schema while maintaining backward compatibility.

### Snapshots for Performance

Replaying all events can become slow as your application grows. Snapshots solve this by periodically saving the computed state:

```javascript
class EventStoreWithSnapshots {
  constructor() {
    this.events = [];
    this.subscribers = [];
    this.snapshotFrequency = 100; // Take snapshot every 100 events
  }
  
  addEvent(event) {
    this.events.push(event);
  
    // Create a snapshot if needed
    if (this.events.length % this.snapshotFrequency === 0) {
      const state = deriveState(this.events);
      localStorage.setItem('todoSnapshot', JSON.stringify({
        state,
        eventIndex: this.events.length
      }));
    }
  
    // Notify subscribers and save events as before
    this.subscribers.forEach(subscriber => subscriber(event));
    localStorage.setItem('todoEvents', JSON.stringify(this.events));
  }
  
  getLatestState() {
    // Try to load from snapshot first
    const snapshotJson = localStorage.getItem('todoSnapshot');
  
    if (snapshotJson) {
      const { state, eventIndex } = JSON.parse(snapshotJson);
    
      // Apply only events after the snapshot
      const newEvents = this.events.slice(eventIndex);
      return deriveState(newEvents, state);
    }
  
    // Fall back to processing all events
    return deriveState(this.events);
  }
}
```

With snapshots, you only need to replay events that occurred after the snapshot was taken, which can significantly improve performance.

### Offline Support and Synchronization

One of the biggest advantages of event sourcing in browser applications is built-in offline support:

```javascript
class SyncingEventStore extends EventStore {
  constructor(serverUrl) {
    super();
    this.serverUrl = serverUrl;
    this.lastSyncedEventIndex = 0;
  
    // Try to sync when online
    window.addEventListener('online', () => this.syncWithServer());
  }
  
  async syncWithServer() {
    if (!navigator.onLine) return;
  
    try {
      // Send unsynchronized events to the server
      const unsyncedEvents = this.events.slice(this.lastSyncedEventIndex);
    
      if (unsyncedEvents.length === 0) return;
    
      const response = await fetch(`${this.serverUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unsyncedEvents)
      });
    
      if (response.ok) {
        this.lastSyncedEventIndex = this.events.length;
        localStorage.setItem('lastSyncedEventIndex', this.lastSyncedEventIndex);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

With this approach, the application works normally offline, queuing up events to be synchronized with the server when a connection is available.

## Practical Example: React + Event Sourcing

Let's see how to integrate event sourcing with React, a popular browser framework:

```javascript
// EventContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create the event store
const eventStore = new EventStore();

// Define context for the event store and state
const EventContext = createContext();

// Event sourcing reducer
function reducer(state, event) {
  const handler = eventHandlers[event.type];
  return handler ? handler(state, event) : state;
}

// Event sourcing provider component
export function EventProvider({ children }) {
  // Initialize state from all events
  const [state, dispatch] = useReducer(
    reducer, 
    initialState,
    () => deriveState(eventStore.getAllEvents())
  );
  
  // Subscribe to new events
  useEffect(() => {
    const unsubscribe = eventStore.subscribe(event => {
      dispatch(event);
    });
  
    return unsubscribe; // Cleanup subscription
  }, []);
  
  // Create command dispatcher
  const executeCommand = (commandName, payload) => {
    if (commandHandlers[commandName]) {
      return commandHandlers[commandName](eventStore, payload);
    } else {
      throw new Error(`Unknown command: ${commandName}`);
    }
  };
  
  return (
    <EventContext.Provider value={{ state, executeCommand }}>
      {children}
    </EventContext.Provider>
  );
}

// Hook to use the event sourcing system
export function useEventSourcing() {
  return useContext(EventContext);
}
```

Now we can use this in a React component:

```javascript
// TodoList.js
import React, { useState } from 'react';
import { useEventSourcing } from './EventContext';

export function TodoList() {
  const { state, executeCommand } = useEventSourcing();
  const [newTodoTitle, setNewTodoTitle] = useState('');
  
  const handleAddTodo = () => {
    if (newTodoTitle.trim()) {
      executeCommand('createTodo', { title: newTodoTitle });
      setNewTodoTitle('');
    }
  };
  
  return (
    <div>
      <h1>Todo List</h1>
    
      <div>
        <input
          value={newTodoTitle}
          onChange={e => setNewTodoTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button onClick={handleAddTodo}>Add</button>
      </div>
    
      <ul>
        {Object.values(state.todos).map(todo => (
          <li key={todo.id}>
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.title}
            </span>
          
            {!todo.completed && (
              <button 
                onClick={() => executeCommand('completeTodo', { id: todo.id })}
              >
                Complete
              </button>
            )}
          
            <button 
              onClick={() => executeCommand('deleteTodo', { id: todo.id })}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

This example shows how to seamlessly integrate event sourcing with React's component model.

## Benefits of Event Sourcing in Browser Applications

Let's explore the advantages of using event sourcing in browser applications:

### 1. Rich History and Audit Log

With event sourcing, you automatically have a complete history of all changes. This can be used to:

* Implement undo/redo functionality
* Show activity logs
* Audit user actions

Example of undo implementation:

```javascript
class UndoableEventStore extends EventStore {
  constructor() {
    super();
    this.undoneEvents = [];
  }
  
  undo() {
    if (this.events.length === 0) return;
  
    // Move the last event to undone events
    const lastEvent = this.events.pop();
    this.undoneEvents.push(lastEvent);
  
    // Recalculate state and notify
    const newState = deriveState(this.events);
    this.subscribers.forEach(sub => sub({ type: 'STATE_RECALCULATED', newState }));
  
    // Update storage
    localStorage.setItem('todoEvents', JSON.stringify(this.events));
    localStorage.setItem('undoneEvents', JSON.stringify(this.undoneEvents));
  }
  
  redo() {
    if (this.undoneEvents.length === 0) return;
  
    // Move the last undone event back to events
    const lastUndone = this.undoneEvents.pop();
    this.events.push(lastUndone);
  
    // Process the event normally
    this.subscribers.forEach(sub => sub(lastUndone));
  
    // Update storage
    localStorage.setItem('todoEvents', JSON.stringify(this.events));
    localStorage.setItem('undoneEvents', JSON.stringify(this.undoneEvents));
  }
}
```

### 2. Robust Offline Support

Event sourcing naturally supports offline operation because events can be queued locally and synchronized later.

### 3. Time Travel and Debugging

You can reconstruct application state at any point in time by replaying events up to that point:

```javascript
function getStateAtTime(timestamp) {
  const eventsUpToTime = eventStore.getAllEvents().filter(
    event => new Date(event.timestamp) <= new Date(timestamp)
  );
  
  return deriveState(eventsUpToTime);
}

// Show the application state as it was yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const historicalState = getStateAtTime(yesterday);
console.log('State yesterday:', historicalState);
```

### 4. Multiple Projections of the Same Data

You can create different views of your data by processing the same events in different ways:

```javascript
// Todo list by completion status
function todosByCompletionStatus(events) {
  const state = deriveState(events);
  
  return {
    completed: Object.values(state.todos).filter(todo => todo.completed),
    active: Object.values(state.todos).filter(todo => !todo.completed)
  };
}

// Todo list by creation date (oldest first)
function todosByCreationDate(events) {
  const creationEvents = events.filter(event => event.type === 'TODO_CREATED');
  
  return creationEvents.map(event => {
    const { id, title } = event.payload;
    return { id, title, timestamp: event.timestamp };
  });
}
```

## Challenges and Considerations

While event sourcing offers many benefits, it also comes with challenges:

### 1. Storage Limitations

Browser storage (localStorage, IndexedDB) has size limits. As your event log grows, you'll need strategies to manage it:

* Use snapshots to reduce the number of events you need to store
* Implement event pruning strategies
* Consider using compression for event storage

### 2. Complexity

Event sourcing introduces more concepts and indirection compared to traditional state management. Ensure your team understands the pattern before adopting it.

### 3. Query Performance

Deriving complex queries from events can be inefficient. Consider maintaining specialized projections for frequently accessed data views.

## Conclusion

Event sourcing in browser applications offers a powerful approach to state management that brings many benefits: rich history, offline support, time travel debugging, and multiple projections of the same data.

By thinking in terms of events rather than state mutations, you create more robust, auditable, and flexible applications. While there are challenges to consider, the pattern can be a great fit for complex browser applications, especially those that need to work offline or maintain a detailed history of user actions.

The examples provided should give you a solid foundation for implementing event sourcing in your own browser applications, whether you're using vanilla JavaScript or integrating with frameworks like React.
