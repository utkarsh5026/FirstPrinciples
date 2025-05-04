# Understanding ReactDOM.render and createRoot Internals in React

## First Principles: The React Rendering Foundation

To understand ReactDOM.render and createRoot, we must first grasp how React fundamentally works with the browser DOM.

> At its core, React maintains a virtual representation of the user interface, called the Virtual DOM. This is a lightweight JavaScript object mirroring the actual DOM structure, allowing React to process changes efficiently before applying them to the real DOM.

### The Browser DOM vs. React's Approach

The Document Object Model (DOM) is the browser's API for representing and interacting with HTML documents. When we directly manipulate the DOM, each operation causes layout recalculations and repaints, which can be expensive performance-wise.

React solves this inefficiency by:

1. Creating a virtual representation of the DOM in memory
2. Making changes to this virtual DOM first
3. Comparing the updated virtual DOM with the previous version
4. Calculating the minimal set of changes needed
5. Applying only those necessary changes to the real DOM

This approach is central to both ReactDOM.render and createRoot, though they implement it differently.

## ReactDOM.render: The Original Rendering Method

ReactDOM.render was React's original method for mounting a React component tree into the DOM. Introduced with React's initial release, it served as the primary entry point to React applications for many years.

### Fundamental Purpose of ReactDOM.render

```javascript
ReactDOM.render(element, container[, callback])
```

This method takes:

* A React element (your component tree)
* A DOM container (where to mount it)
* An optional callback function (executed after rendering)

Let's explore a simple example:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  return <h1>Hello, React World!</h1>;
}

// Mount the App component to the DOM element with id "root"
ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```

### Internal Workings of ReactDOM.render

When you call ReactDOM.render, several critical steps occur under the hood:

1. **Element Processing** : React converts your JSX elements into React elements (JavaScript objects)
2. **Reconciliation** : React determines what needs to change in the DOM
3. **Renderer Injection** : React uses the DOM renderer to turn virtual elements into actual DOM nodes
4. **Initial Mount or Update** : Based on whether this is the first render or an update

Let's break down these steps in more detail:

#### 1. Element Processing

When you pass JSX to ReactDOM.render, it first gets transformed into React elements:

```javascript
// Your JSX
<App />

// Gets transformed to something like:
{
  type: App,
  props: {},
  key: null,
  ref: null
}
```

#### 2. Reconciliation Process

> The reconciliation algorithm is the heart of React's efficiency. It determines the minimal set of operations needed to transform one tree into another.

ReactDOM.render initiates the reconciliation process, which follows these principles:

* Elements of different types produce entirely different trees
* Elements with stable keys maintain identity between renders
* React uses heuristics to optimize the diffing process

For example, if we change our App component:

```javascript
// First render
function App() {
  return <h1>Hello, React World!</h1>;
}

// Second render
function App() {
  return (
    <div>
      <h1>Hello, React World!</h1>
      <p>Welcome!</p>
    </div>
  );
}
```

React would detect that the root element changed from `h1` to `div` and rebuild the entire subtree.

#### 3. Renderer Injection

ReactDOM.render uses a synchronous rendering model:

```javascript
// Simplified internal representation of how render works
function render(element, container, callback) {
  // Create a root fiber
  const root = createFiberRoot(container);
  
  // Schedule work on the root
  updateContainer(element, root, null, callback);
  
  // Process all work synchronously until completion
  flushSync(() => {
    workLoop();
  });
}
```

The key insight here is that ReactDOM.render processes all work synchronously, blocking the main thread until rendering completes.

#### 4. DOM Manipulation

Finally, React applies the calculated changes to the actual DOM:

```javascript
// Pseudocode for DOM operations
function commitWork(fiber) {
  switch (fiber.effectTag) {
    case 'PLACEMENT':
      // Add new DOM node
      parentNode.appendChild(fiber.stateNode);
      break;
    case 'UPDATE':
      // Update existing DOM node
      updateDOMProperties(fiber.stateNode, fiber.alternate.memoizedProps, fiber.memoizedProps);
      break;
    case 'DELETION':
      // Remove DOM node
      parentNode.removeChild(fiber.stateNode);
      break;
  }
}
```

### Limitations of ReactDOM.render

The synchronous nature of ReactDOM.render presents several challenges:

1. **Main Thread Blocking** : Long rendering operations block user interactions
2. **All-or-Nothing Updates** : Cannot prioritize or pause work
3. **No Concurrent Mode Support** : Cannot leverage React's newer concurrent features

## The Transition to createRoot: Concurrent Rendering

In React 18, a new method was introduced: ReactDOM.createRoot. This method implements a fundamentally different approach to rendering called concurrent rendering.

> Concurrent rendering allows React to prepare multiple versions of the UI at the same time without blocking the main thread, enabling smoother user experiences and more responsive interfaces.

### Basic Usage of createRoot

```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return <h1>Hello, Concurrent React!</h1>;
}

// Create a root
const root = createRoot(document.getElementById('root'));

// Render the App component
root.render(<App />);
```

### Internal Architecture of createRoot

Let's explore how createRoot works internally:

#### 1. Root Creation

When you call createRoot, React creates a FiberRootNode that will coordinate all future updates:

```javascript
// Simplified representation
function createRoot(container, options) {
  // Create a FiberRootNode
  const root = createFiberRoot(container, options);
  
  // Return a public API
  return {
    render(element) {
      // Schedule an update on the root
      updateContainer(element, root, null, null);
    },
    unmount() {
      updateContainer(null, root, null, null);
    }
  };
}
```

The FiberRootNode maintains important metadata:

* Current and work-in-progress fiber trees
* Pending updates and priorities
* Scheduling information

#### 2. Concurrent Scheduling

The key difference with createRoot is how it schedules work:

```javascript
// Simplified internal scheduling in createRoot
function updateContainer(element, root, lane, callback) {
  // Create an update object
  const update = createUpdate(lane);
  update.payload = { element };
  
  // Enqueue the update
  const fiber = root.current;
  enqueueUpdate(fiber, update, lane);
  
  // Schedule work based on priority
  scheduleUpdateOnFiber(fiber, lane);
}
```

Unlike ReactDOM.render, which used flushSync to complete all work immediately, createRoot schedules work with priorities and can interleave with other browser tasks.

#### 3. Concurrent Reconciliation

The reconciliation algorithm itself is similar, but now it can be interrupted:

```javascript
// Simplified work loop in concurrent mode
function workLoopConcurrent() {
  // Process work until time runs out or all work is complete
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

> The critical innovation of createRoot is the ability to pause and resume work. If `shouldYield()` returns true (indicating time for a frame has expired), React will yield to the browser, allowing it to handle user events and other tasks.

#### 4. Committed Phase

Even with concurrent rendering, committing changes to the DOM remains synchronous. React cannot stop halfway through applying DOM updates:

```javascript
function commitRoot(root) {
  // This part still runs synchronously
  commitBeforeMutationEffects(root);
  commitMutationEffects(root);
  commitLayoutEffects(root);
}
```

### Key Differences Between render and createRoot

Let's systematically compare the two approaches:

1. **Rendering Model** :

* render: Synchronous, blocking rendering
* createRoot: Concurrent rendering with interruptible work

1. **API Structure** :

* render: Direct method call
* createRoot: Creates a root instance with methods

1. **Feature Support** :

* render: No concurrent features
* createRoot: Supports concurrent features, transitions, Suspense

1. **Batching Behavior** :

* render: Batches only within React event handlers
* createRoot: Automatic batching for all updates

Let's look at an example highlighting different batching behavior:

```javascript
// With ReactDOM.render
function handleClick() {
  // These will be batched into one update in React events
  setState1(newState1);
  setState2(newState2);
}

setTimeout(() => {
  // These will cause TWO separate renders in ReactDOM.render!
  setState1(newState1);
  setState2(newState2);
}, 0);
```

```javascript
// With createRoot
function handleClick() {
  // Batched
  setState1(newState1);
  setState2(newState2);
}

setTimeout(() => {
  // Still batched with createRoot!
  setState1(newState1);
  setState2(newState2);
}, 0);
```

## Fiber Architecture: The Common Foundation

Both rendering methods are built on React's Fiber architecture. Understanding Fiber helps clarify how both methods work.

> Fiber is React's reimplementation of the stack, optimized for rendering UI. It's a unit of work with information about a component, its inputs, and its output.

### Fiber Node Structure

A simplified Fiber node looks like:

```javascript
{
  // Instance
  stateNode: new YourComponent(),
  
  // Type and key
  type: YourComponent,
  key: null,
  
  // Fiber relationships
  return: parentFiber,
  child: childFiber,
  sibling: nextSiblingFiber,
  
  // Effects
  effectTag: 'PLACEMENT',
  nextEffect: nextFiberWithEffect,
  
  // Work state
  pendingProps: { /* props */ },
  memoizedProps: { /* previous props */ },
  memoizedState: { /* previous state */ },
  
  // Update queue
  updateQueue: { /* queued updates */ }
}
```

### The Two-Phase Rendering Process

Both rendering methods follow a two-phase process:

1. **Render/Reconciliation Phase** (differs between render and createRoot):
   * Build a new work-in-progress tree
   * Compare with current tree
   * Determine necessary changes
2. **Commit Phase** (similar in both methods):
   * Apply all changes to the DOM
   * Run lifecycle methods and hooks
   * Update refs

The key difference is that in createRoot, the render phase can be interrupted, while ReactDOM.render completes it all at once.

## Practical Examples and Transition Guide

### Example: Using ReactDOM.render (Legacy)

```javascript
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

function ExpensiveComponent() {
  // Simulate expensive calculation
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment (might freeze UI)
      </button>
    </div>
  );
}

// Legacy render method
ReactDOM.render(
  <ExpensiveComponent />,
  document.getElementById('root')
);
```

In this example, clicking the button would block the main thread during rendering, potentially causing UI jank.

### Example: Using createRoot (Modern)

```javascript
import React, { useState, useTransition } from 'react';
import { createRoot } from 'react-dom/client';

function ExpensiveComponent() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  
  // Handle expensive updates with transitions
  const handleIncrement = () => {
    startTransition(() => {
      setCount(count + 1);
    });
  };
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={handleIncrement}>
        {isPending ? "Processing..." : "Increment (smoother)"}
      </button>
    </div>
  );
}

// Modern createRoot method
const root = createRoot(document.getElementById('root'));
root.render(<ExpensiveComponent />);
```

This example uses transitions (only available with createRoot) to prevent UI freezing during updates.

### Migrating from render to createRoot

Here's a simple migration guide:

```javascript
// Before (React 17 and earlier)
import ReactDOM from 'react-dom';

ReactDOM.render(
  <App />,
  document.getElementById('root'),
  () => console.log('Rendered')
);

// After (React 18+)
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// If you need the callback
root.render(<App />);
console.log('Scheduled render');
```

## The Internal Data Structures

Let's look at some of the key data structures used internally:

### FiberRootNode

This is created by both rendering methods and serves as the entry point:

```javascript
// Simplified structure
{
  // The DOM node this root is connected to
  containerInfo: domNode,
  
  // Current rendered tree
  current: fiber,
  
  // Tracks pending work
  pendingLanes: 0,
  
  // For createRoot: scheduled update callback
  callbackNode: null,
  
  // Time tracking for prioritization
  eventTimes: [],
  expirationTimes: []
}
```

### Update Queue

Both methods use update queues to track state changes:

```javascript
// Simplified update queue
{
  baseState: previousState,
  firstBaseUpdate: update,
  lastBaseUpdate: update,
  shared: {
    pending: newUpdate
  },
  effects: null
}
```

## Conclusion: The Evolution of React Rendering

ReactDOM.render and createRoot represent React's evolution from a synchronous rendering library to a concurrent UI framework.

> The shift from ReactDOM.render to createRoot marks a fundamental change in React's approach to rendering - moving from a blocking, synchronous model to a non-blocking, concurrent one that better aligns with how humans perceive interface responsiveness.

ReactDOM.render served React well for many years, but createRoot enables a new generation of user experiences that can:

1. Prioritize updates based on importance
2. Stay responsive during complex renders
3. Defer non-essential updates
4. Show consistent loading states with Suspense

As React continues to evolve, understanding these internal rendering mechanisms helps us build more responsive, user-friendly applications.
